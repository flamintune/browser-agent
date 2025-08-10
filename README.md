# 🔧 WXT + LangChain Chrome AI SidePanel 扩展功能

使用 [WXT](https://wxt.dev/) + [LangChain](https://js.langchain.com/) 快速打造一个具备 AI 对话与网页操作能力的 Chrome 扩展功能。

本專案展示如何在 Chrome SidePanel 中嵌入 AI 对话机器人，结合 LangChain Agent，实现自动摘要、网页互动等进阶功能。

---

## 🚀 功能特色

- 🗨️ Chat UI 对话机器人界面（Ant Design X 实作）
- 🧠 支持 LangChain Agent，具备 Tool 呼叫能力
- 🌐 可根据目前网页 URL 动态提供对应工具（Tool）
- 📋 支持 LLM API 设定（API URL / Key / Model）
- 🔌 使用 `chrome.tabs` 与 `content-script` 互动网页内容
- 💡 SidePanel 界面可切换「对话模式」与「设定画面」

---

## 📦 技术栈

| 类别         | 技术                    |
| ------------ | ----------------------- |
| 扩展开发框架 | [WXT](https://wxt.dev/) |
| LLM Agent    | LangChain.js            |
| 对话界面     | Ant Design X            |
| UI 框架      | React                   |

---

## 🔧 安装与开发

```bash
npm install
npm run dev
```

开启 Chrome, 点选 Extension Icon，开启 SidePanel，点选设定，到设定页面设定 LLM
<img src="https://rainmakerho.github.io/2025/05/14/optimize-sidepanel-ui-for-chatbot-interface-with-llm/01.png" />

再回到對話頁面，進行對話。
<img src="https://rainmakerho.github.io/2025/05/14/optimize-sidepanel-ui-for-chatbot-interface-with-llm/02.png" />

<img src="https://rainmakerho.github.io/2025/05/14/optimize-sidepanel-ui-for-chatbot-interface-with-llm/04.png" />
