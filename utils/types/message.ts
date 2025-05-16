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
    description: "取得整個網頁的純文字內容",
  },
  BIZ_EXTRACT_FIELDS: {
    name: "bizformExtractFields",
    description:
      "擷取目前頁面中所有可輸入的欄位名稱與其值（如文字欄位、下拉選單、日期等）",
  },
};

export const TAB_URL_CHANGED = "TAB_URL_CHANGED";
