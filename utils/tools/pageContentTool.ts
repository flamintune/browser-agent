import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { sendMessage } from "../message";
import { MESSAGE_TOOL_TYPES } from "../types/message";

const noOp = z.string().optional().describe("No-op parameter.");

export const pageContentTool = tool(
  async () => {
    const response = await sendMessage<string>({
      type: MESSAGE_TOOL_TYPES.PAGE_CONTENT.name,
    },
    "content",
  );
    return response;
  },
  {
    name: MESSAGE_TOOL_TYPES.PAGE_CONTENT.name,
    description: MESSAGE_TOOL_TYPES.PAGE_CONTENT.description,
    schema: z.object({
      noOp,
    }),
  }
);
