import { Bubble, Sender, BubbleProps } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { createChatAgent } from "@/utils/agents";
import type { GetProp } from "antd";
import ChatHeader from "./ChatHeader";
import SettingsPanel from "./SettingsPanel";
import type { Conversation } from "@ant-design/x/es/conversations";
import dayjs from "dayjs";
import markdownit from "markdown-it";
import { Typography, Divider, Tag } from "antd";
import { agentConfig } from "@/utils/types/agentConfig";
import { TAB_URL_CHANGED } from "@/utils/types/message";
import UtilPanel from "./UtilPanel";
import { useState, useEffect, useRef } from "react";

const md = markdownit({ html: false, breaks: true });
const ROLE_AI = "assistant";
const ROLE_HUMAN = "user";

// 扩展的消息接口
interface ExtendedBubbleProps extends BubbleProps {
  reasoning_content?: string;
}

// 分隔符，用于区分推理内容和普通内容
const REASONING_SEPARATOR = "---REASONING_SEPARATOR---";

// 自定义渲染函数，解析合并的内容并区分显示
const renderMarkdown = (content: string) => {
  //console.log("renderMarkdown content:", content);
  
  // 检查是否包含推理内容分隔符
  if (content.includes(REASONING_SEPARATOR)) {
    const parts = content.split(REASONING_SEPARATOR);
    const reasoningContent = parts[0] || "";
    const normalContent = parts[1] || "";
    return (
      <Typography>
        {/* 推理内容区域 */}
        {reasoningContent.trim() && (
          <>
            <div style={{ 
              marginBottom: 12,
              padding: 8,
              background: '#f6f6f6',
              borderRadius: 6,
              border: '1px solid #e8e8e8'
            }}>
              <Tag color="blue" style={{ marginBottom: 6 }}>
                推理过程
              </Tag>
              <div 
                style={{ 
                  fontSize: '13px',
                  color: '#666',
                  fontStyle: 'italic'
                }}
                dangerouslySetInnerHTML={{ __html: md.render(reasoningContent.trim()) }} 
              />
            </div>
            
            <Divider style={{ margin: '8px 0' }} />
          </>
        )}
        
        {/* 普通内容区域 */}
        {normalContent.trim() && (
          <div>
            <Tag color="green" style={{ marginBottom: 6 }}>
              回答内容
            </Tag>
            <div dangerouslySetInnerHTML={{ __html: md.render(normalContent.trim()) }} />
          </div>
        )}
        
        {/* 如果只有推理内容，没有普通内容，显示等待状态 */}
        {reasoningContent.trim() && !normalContent.trim() && (
          <div style={{ 
            padding: 8,
            background: '#f0f8ff',
            borderRadius: 6,
            border: '1px dashed #4096ff',
            textAlign: 'center',
            color: '#666',
            fontSize: '13px'
          }}>
            正在生成回答内容...
          </div>
        )}
      </Typography>
    );
  }
      // 没有推理内容时的默认渲染
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
    // typing: { step: 5, interval: 20 },
    typing: false,
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
  const [messages, setMessages] = useState<Array<ExtendedBubbleProps>>([]);
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
  const isProcessingRef = useRef(false); // 防止重复处理

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
    // 防止重复执行（React StrictMode会导致双重渲染）
    if (isProcessingRef.current) {
      console.log("Already processing, skipping...");
      return;
    }
    
    isProcessingRef.current = true;
    
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

    // 计算AI消息的索引（当前消息数组长度 + 1，因为我们即将添加一个AI消息）
    const aiMessageIndex = messages.length + 1;
    console.log("AI message index will be:", aiMessageIndex, "current messages:", messages.length);
    
    // 为AI回复添加一个空的消息作为占位符
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: "",
        role: ROLE_AI,
        reasoning_content: "",
      },
    ]);

    try {
      const stream = await agentRef.current.streamEvents(
        {
          messages: [
            {
              role: ROLE_HUMAN,
              content: query,
            },
          ],
        },
        { signal: newController.signal, version: "v1" }
      );

      let accumulatedContent = "";
      let accumulatedReasoningContent = "";

      for await (const event of stream) {
        const { event: eventName, data } = event;
        console.log("event:", eventName, event);
        if (eventName === "on_llm_stream") {
          const chunk = data.chunk.message.content;
          const reasoningChunk = data.chunk.message.additional_kwargs?.reasoning_content;
          
          // 标记是否有更新
          let hasUpdate = false;
          
          if (chunk) {
            // 逐字打印 LLM 的输出
            console.log("chunk", chunk, Date.now());

            // 累积内容
            accumulatedContent += chunk;
            hasUpdate = true;
          }
          
          if (reasoningChunk) {
            // 逐字打印推理内容
            console.log("reasoning_chunk", reasoningChunk, Date.now());

            // 累积推理内容
            accumulatedReasoningContent += reasoningChunk;
            hasUpdate = true;
          }

          // 只有在有内容更新时才更新UI，避免不必要的重渲染
          if (hasUpdate) {
            // 将推理内容和普通内容合并，用分隔符分开
            // 确保即使某一部分为空，另一部分也能正确显示
            let mergedContent = "";
            if (accumulatedReasoningContent && accumulatedContent) {
              // 两部分都有内容
              mergedContent = accumulatedReasoningContent + REASONING_SEPARATOR + accumulatedContent;
            } else if (accumulatedReasoningContent) {
              // 只有推理内容，普通内容为空
              mergedContent = accumulatedReasoningContent + REASONING_SEPARATOR;
            } else {
              // 只有普通内容，或两者都为空
              mergedContent = accumulatedContent;
            }
            
            console.log("Updating UI:", {
              reasoning: accumulatedReasoningContent?.length || 0,
              content: accumulatedContent?.length || 0,
              merged: mergedContent?.length || 0,
              aiMessageIndex,
              timestamp: Date.now()
            });
            
            // 实时更新AI消息的内容
            setMessages((prevMessages) => {
              const newMessages = [...prevMessages];
              if (newMessages[aiMessageIndex]) {
                newMessages[aiMessageIndex] = {
                  ...newMessages[aiMessageIndex],
                  content: mergedContent,
                  reasoning_content: accumulatedReasoningContent,
                };
              }
              return newMessages;
            });
          }
        }
      }
      setInput("");
    } catch (error) {
      console.error("Error during agent.invoke:", error);
      // 如果出错，移除空的AI消息
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        if (
          newMessages[aiMessageIndex] &&
          newMessages[aiMessageIndex].content === "" &&
          newMessages[aiMessageIndex].reasoning_content === ""
        ) {
          newMessages.splice(aiMessageIndex, 1);
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false; // 重置处理状态
    }
  };

  const handleCancel = () => {
    if (controller) {
      console.log("Aborting request...");
      controller.abort(); // 中止當前請求
      setController(null); // 清除 controller
      isProcessingRef.current = false; // 重置处理状态
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
      <UtilPanel />
      <Sender
        value={input}
        onChange={setInput}
        loading={isLoading}
        placeholder="您想要做什么..."
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  ) : (
    <SettingsPanel onClose={handleCloseSettings} />
  );

  return <>{mainContent}</>;
}
