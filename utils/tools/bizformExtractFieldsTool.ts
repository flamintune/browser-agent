import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { sendMessage } from "../message";
import { MESSAGE_TOOL_TYPES } from "../types/message";

const noOp = z.string().optional().describe("No-op parameter.");

export const bizformExtractFieldsTool = tool(
  async () => {
    const response = await sendMessage<string>({
      type: MESSAGE_TOOL_TYPES.BIZ_EXTRACT_FIELDS.name,
    });
    //console.log("userTool response", response);
    return response;
  },
  {
    name: MESSAGE_TOOL_TYPES.BIZ_EXTRACT_FIELDS.name,
    description: MESSAGE_TOOL_TYPES.BIZ_EXTRACT_FIELDS.description,
    schema: z.object({
      noOp,
    }),
  }
);
