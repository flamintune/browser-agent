import {
  messageRequest,
  messageResponse,
  MESSAGE_TOOL_TYPES,
} from "../types/message";
import { pageContentHandler } from "./pageContentHandler";
import { executeScriptHandler } from "./executeScriptHandler";

export const handlers: Record<
  string,
  (message: messageRequest) => Promise<messageResponse>
> = {
  [MESSAGE_TOOL_TYPES.PAGE_CONTENT.name]: pageContentHandler,
  [MESSAGE_TOOL_TYPES.EXECUTE_SCRIPT.name]: executeScriptHandler,
};
