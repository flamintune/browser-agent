import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { sendMessage } from "../message";
import { MESSAGE_TOOL_TYPES } from "../types/message";

const schema = z.object({
  script: z.string().describe("The script to execute"),
});

export const executeScriptTool = tool(
  async (script: string) => {
    const tab = await getCurrentTab();
    const response = await sendMessage<string>({
      type: MESSAGE_TOOL_TYPES.EXECUTE_SCRIPT.name,
      payload: {
        script,
        tabId: tab.id,
      },
    }, "background");
    console.log("executeScriptTool response", response);
    return response;
  },
  {
    name: MESSAGE_TOOL_TYPES.EXECUTE_SCRIPT.name,
    description: MESSAGE_TOOL_TYPES.EXECUTE_SCRIPT.description,
    schema,
  },
);

async function getCurrentTab() {
  let queryOptions = { active: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
