import {
  messageRequest,
  messageResponse,
  MESSAGE_TOOL_TYPES,
} from "../types/message";
import { pageContentHandler } from "./pageContentHandler";
import { bizformExtractFieldsHandler } from "./bizformExtractFieldsHandler";

export const handlers: Record<
  string,
  (message: messageRequest) => messageResponse
> = {
  [MESSAGE_TOOL_TYPES.PAGE_CONTENT.name]: pageContentHandler,
  [MESSAGE_TOOL_TYPES.BIZ_EXTRACT_FIELDS.name]: bizformExtractFieldsHandler,
};
