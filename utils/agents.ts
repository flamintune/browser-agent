import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getToolsByUrl } from "./tools";
import { agentConfig } from "./types/agentConfig";

export function createChatAgent(config: agentConfig, url: string) {
  const { apiKey, apiUrl, model } = config;
  const llm = new ChatOpenAI({
    configuration: {
      baseURL: apiUrl,
      apiKey: apiKey,
    },
    model: model,
    temperature: 0,
  });

  const tools = getToolsByUrl(url);

  return createReactAgent({
    llm,
    tools,
  });
}
