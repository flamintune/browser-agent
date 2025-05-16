import { Button, Space } from "antd";
import { PlusOutlined, SettingOutlined } from "@ant-design/icons";

interface ChatHeaderProps {
  onNewSession?: () => void;
  openSettings?: ()=>void;
}

const ChatHeader = ({ onNewSession, openSettings }: ChatHeaderProps) => {
  return (
    <div className="chat-header">
      <div className="chat-header-title">✨ AI Copilot</div>
      <Space size={0}>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={onNewSession}
          className="chat-header-button"
        />
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={openSettings}
          className="chat-header-button"
        />
      </Space>
    </div>
  );
};

export default ChatHeader;
