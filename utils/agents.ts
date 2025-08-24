import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getToolsByUrl } from "./tools";
import { agentConfig } from "./types/agentConfig";
import ChatDoubao from "./doubao";

export function createChatAgent(config: agentConfig, url: string) {
  const { apiKey, apiUrl, model } = config;
  let llm = null;
  if (apiUrl.includes("volces")) {
    llm = new ChatDoubao({
      configuration: {
        baseURL: apiUrl,
        apiKey: apiKey,
      },
      model: model,
      temperature: 0,
      streaming: true,
    });
  } else {
     llm = new ChatOpenAI({
      configuration: {
        baseURL: apiUrl,
        apiKey: apiKey,
      },
      model: model,
      temperature: 0,
      streaming: true,
    });
  }
  const tools = getToolsByUrl(url);

  return createReactAgent({
    llm,
    tools,
  });
}
