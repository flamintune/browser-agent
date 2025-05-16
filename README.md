# 🔧 WXT + LangChain Chrome AI SidePanel 擴充功能

使用 [WXT](https://wxt.dev/) + [LangChain](https://js.langchain.com/) 快速打造一個具備 AI 對話與網頁操作能力的 Chrome 擴充功能。

本專案展示如何在 Chrome SidePanel 中嵌入 AI 對話機器人，結合 LangChain Agent，實現自動摘要、網頁互動等進階功能。

---

## 🚀 功能特色

- 🗨️ Chat UI 對話機器人介面（Ant Design X 實作）
- 🧠 支援 LangChain Agent，具備 Tool 呼叫能力
- 🌐 可根據目前網頁 URL 動態提供對應工具（Tool）
- 📋 支援 LLM API 設定（API URL / Key / Model）
- 🔌 使用 `chrome.tabs` 與 `content-script` 互動網頁內容
- 💡 SidePanel 介面可切換「對話模式」與「設定畫面」

---

## 📦 技術棧

| 類別         | 技術                    |
| ------------ | ----------------------- |
| 擴充開發框架 | [WXT](https://wxt.dev/) |
| LLM Agent    | LangChain.js            |
| 對話介面     | Ant Design X            |
| UI 框架      | React                   |

---

## 🔧 安裝與開發

```bash
npm install
npm run dev
```

開啟 Chrome, 點選 Extension Icon，開啟 SidePanel，點選設定，到設定頁面設定 LLM
<img src="https://rainmakerho.github.io/2025/05/14/optimize-sidepanel-ui-for-chatbot-interface-with-llm/01.png" />

再回到對話頁面，進行對話。
<img src="https://rainmakerho.github.io/2025/05/14/optimize-sidepanel-ui-for-chatbot-interface-with-llm/02.png" />

<img src="https://rainmakerho.github.io/2025/05/14/optimize-sidepanel-ui-for-chatbot-interface-with-llm/04.png" />
