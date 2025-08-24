import { SelectOutlined, CloseOutlined } from "@ant-design/icons";
import { Tooltip, message } from "antd";
import { useState, useEffect } from "react";
import { MESSAGE_TOOL_TYPES } from "@/utils/types/message";

interface UtilPanelProps {
  onElementSelected?: (element: any) => void;
}

export default function UtilPanel({ onElementSelected }: UtilPanelProps) {
  const [isPickerActive, setIsPickerActive] = useState(false);

  const handleStartPicker = async () => {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        message.error("无法获取当前标签页");
        return;
      }

      // 发送消息给content script开始选择器
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: MESSAGE_TOOL_TYPES.START_ELEMENT_PICKER.name,
      });

      if (response?.result) {
        setIsPickerActive(true);
        message.success("请点击要选择的元素");
      }
    } catch (error) {
      console.error("Failed to start element picker:", error);
      message.error("启动元素选择器失败");
    }
  };

  const handleStopPicker = async () => {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        return;
      }

      // 发送消息给content script停止选择器
      await chrome.tabs.sendMessage(tab.id, {
        type: MESSAGE_TOOL_TYPES.STOP_ELEMENT_PICKER.name,
      });

      setIsPickerActive(false);
    } catch (error) {
      console.error("Failed to stop element picker:", error);
    }
  };

  // 监听来自content script的元素选择消息
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === MESSAGE_TOOL_TYPES.ELEMENT_SELECTED.name) {
        setIsPickerActive(false);
        if (onElementSelected) {
          onElementSelected(message.payload.element);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [onElementSelected]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 8px",
        minHeight: "20px",
      }}
    >
      <Tooltip title={isPickerActive ? "取消选择元素" : "选择元素"} placement="right">
        {isPickerActive ? (
          <CloseOutlined
            style={{ 
              fontSize: "16px", 
              cursor: "pointer", 
              color: "#ff4d4f" 
            }}
            onClick={handleStopPicker}
          />
        ) : (
          <SelectOutlined
            style={{ 
              fontSize: "16px", 
              cursor: "pointer",
              color: isPickerActive ? "#1890ff" : undefined
            }}
            onClick={handleStartPicker}
          />
        )}
      </Tooltip>
    </div>
  );
}
