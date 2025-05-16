import { Bubble, Sender, BubbleProps } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { createChatAgent } from "@/utils/agents";
import type { GetProp } from "antd";
import ChatHeader from "./ChatHeader";
import SettingsPanel from "./SettingsPanel";
import type { Conversation } from "@ant-design/x/es/conversations";
import dayjs from "dayjs";
import markdownit from "markdown-it";
import { Typography } from "antd";
import { agentConfig } from "@/utils/types/agentConfig";
import { TAB_URL_CHANGED } from "@/utils/types/message";

const md = markdownit({ html: false, breaks: true });
const ROLE_AI = "assistant";
const ROLE_HUMAN = "user";

const renderMarkdown: BubbleProps["messageRender"] = (content) => {
  //console.log("content", content);
  return (
    <Typography>
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
  );
};

const rolesAsObject: GetProp<typeof Bubble.List, "roles"> = {
  assistant: {
    placement: "start",
    avatar: {
      icon: <RobotOutlined />,
      style: { background: "#398eff", margin: 2 },
    },
    typing: { step: 5, interval: 20 },
    styles: {
      content: { margin: 2 },
    },
    messageRender: renderMarkdown,
  },
  user: {
    placement: "end",
    avatar: {
      icon: <UserOutlined />,
      style: { background: "#87d068", margin: 2 },
    },
    styles: {
      content: { margin: 2 },
    },
  },
};

export default function ChatUi() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);
  const [messages, setMessages] = useState<Array<BubbleProps>>([]);
  const [sessionList, setSessionList] = useState<Conversation[]>([]);
  const [curSession, setCurSession] = useState<string>();
  const [showSettings, setShowSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState<agentConfig>({
    apiUrl: "",
    apiKey: "",
    model: "",
  });

  const agentRef = useRef<any>(null);
  const apiSettingsRef = useRef(apiSettings);

  useEffect(() => {
    newSession();
    loadSettingsFromStorage();
    function handleMessage(message: any, sender: any, sendResponse: any) {
      if (message.type === TAB_URL_CHANGED) {
        console.log(apiSettingsRef.current);
        agentRef.current = createChatAgent(apiSettingsRef.current, message.url);
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    apiSettingsRef.current = apiSettings;
  }, [apiSettings]);

  const loadSettingsFromStorage = () => {
    chrome.storage.local.get(["apiUrl", "apiKey", "model"], (result) => {
      const settings = {
        apiUrl: result.apiUrl || "",
        apiKey: result.apiKey || "",
        model: result.model || "",
      };
      setApiSettings(settings);

      // 建立 agent 並存入 useRef
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        agentRef.current = createChatAgent(settings, url);
      });
    });
  };
  const newSession = () => {
    const timeNow = dayjs().valueOf().toString();
    setSessionList([
      { key: timeNow, label: "New session", group: "Today" },
      ...sessionList,
    ]);
    setCurSession(timeNow);
    setMessages([]);
  };

  const handleSubmit = async () => {
    const newController = new AbortController();

    setController(newController);
    setIsLoading(true);
    let query = input;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: query,
        role: ROLE_HUMAN,
      },
    ]);

    try {
      const agentOutput = await agentRef.current.invoke(
        {
          messages: [
            {
              role: ROLE_HUMAN,
              content: query,
            },
          ],
        },
        { signal: newController.signal }
      );
      var text = agentOutput.messages[agentOutput.messages.length - 1].content;
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: text,
          role: ROLE_AI,
        },
      ]);
      console.log(text);
      setInput("");
    } catch (error) {
      console.error("Error during agent.invoke:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (controller) {
      console.log("Aborting request...");
      controller.abort(); // 中止當前請求
      setController(null); // 清除 controller
    }
  };
  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = (isSaved: boolean) => {
    if (isSaved) loadSettingsFromStorage();
    setShowSettings(false);
  };
  const mainContent = !showSettings ? (
    <div className="chat-container">
      <ChatHeader
        onNewSession={newSession}
        openSettings={handleSettingsClick}
      />
      <Bubble.List items={messages} roles={rolesAsObject}></Bubble.List>
      <Sender
        value={input}
        onChange={setInput}
        loading={isLoading}
        placeholder="請輸入訊息..."
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  ) : (
    <SettingsPanel onClose={handleCloseSettings} />
  );

  return <>{mainContent}</>;
}
