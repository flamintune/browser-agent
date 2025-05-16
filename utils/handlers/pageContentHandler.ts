import { messageRequest, messageResponse } from "../types/message";

export const pageContentHandler = (
  message: messageRequest
): messageResponse => {
  return {
    result: document.body.innerText,
  };
};
