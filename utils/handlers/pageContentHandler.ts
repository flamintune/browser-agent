import { messageRequest, messageResponse } from "../types/message";

export const pageContentHandler = async (
  message: messageRequest
): Promise<messageResponse> => {
  console.log("pageContentHandler", message);
  return {
    result: document.body.innerText,
  };
};
