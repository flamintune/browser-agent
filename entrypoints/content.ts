import { MESSAGE_TOOL_TYPES, messageRequest, messageResponse } from "../utils/types/message";
import { handlers } from "@/utils/handlers";
import { ElementPicker } from 'js-element-picker';

let picker: ElementPicker | null = null;
let isPickerActive = false;

// 初始化element picker
function initElementPicker() {
  picker = new ElementPicker({
    picking: false,
    onClick: (target) => {
      console.log("Element selected:", target);
      
      // 提取元素信息
      const elementInfo = {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        textContent: target.textContent?.slice(0, 200) || "", // 限制文本长度
        outerHTML: target.outerHTML.slice(0, 500), // 限制HTML长度
        attributes: Array.from(target.attributes).reduce((acc: Record<string, string>, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
      };
      
      // 停止选择器
      stopElementPicker();
      
      // 发送选中的元素信息回sidepanel
      chrome.runtime.sendMessage({
        type: MESSAGE_TOOL_TYPES.ELEMENT_SELECTED.name,
        payload: { element: elementInfo }
      });
    },
  });
}

// 开始元素选择器
function startElementPicker() {
  if (!picker) {
    initElementPicker();
  }
  
  if (picker && !isPickerActive) {
    picker.startPicking();
    isPickerActive = true;
    console.log("Element picker started");
  }
}

// 停止元素选择器
function stopElementPicker() {
  if (picker && isPickerActive) {
    picker.stopPicking();
    isPickerActive = false;
    console.log("Element picker stopped");
  }
}

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // 初始化element picker
    initElementPicker();
    
    chrome.runtime.onMessage.addListener(
      async (
        message: messageRequest,
        sender,
        sendResponse: (response: messageResponse) => void
      ) => {
        // 处理元素选择器相关消息
        if (message.type === MESSAGE_TOOL_TYPES.START_ELEMENT_PICKER.name) {
          startElementPicker();
          sendResponse({ result: "Element picker started" });
          return;
        }
        
        if (message.type === MESSAGE_TOOL_TYPES.STOP_ELEMENT_PICKER.name) {
          stopElementPicker();
          sendResponse({ result: "Element picker stopped" });
          return;
        }
        
        if (message.type === MESSAGE_TOOL_TYPES.EXECUTE_SCRIPT.name) {
          return;
        }
        
        const handler = handlers[message.type];
        if (handler) {
          const result = await handler(message);
          sendResponse(result);
        } else {
          console.error("Unknown message type:", message.type);
          sendResponse({ error: "Unknown message type" });
        }
        return true;
      }
    );
  },
});
