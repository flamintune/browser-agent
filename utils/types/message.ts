// 定義請求的型別
export type messageRequest = {
  type: string;
  payload?: Record<string, unknown>;
};

// 定義回應的型別
export type messageResponse = {
  result?: string; // 成功時的內容
  error?: string; // 錯誤訊息
};

export const MESSAGE_TOOL_TYPES = {
  PAGE_CONTENT: {
    name: "pageContent",
    description: "获取整个网页的纯文字内容",
  },
  EXECUTE_SCRIPT: {
    name: "executeScript",
    description: "执行指定的 JavaScript 脚本",
  },
  START_ELEMENT_PICKER: {
    name: "startElementPicker",
    description: "开始元素选择器",
  },
  STOP_ELEMENT_PICKER: {
    name: "stopElementPicker",
    description: "停止元素选择器",
  },
  ELEMENT_SELECTED: {
    name: "elementSelected",
    description: "元素已选中",
  },
};

export const TAB_URL_CHANGED = "TAB_URL_CHANGED";
