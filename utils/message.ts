import { messageRequest, messageResponse } from "./types/message";

// 封裝 sendMessage 函式
export async function sendMessage<T = unknown>(
  message: messageRequest,
  to: "content" | "background",
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (to === "content") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;

        if (tabId === undefined) {
          reject(new Error("No active tab found."));
          return;
        }

        chrome.tabs.sendMessage(tabId, message, (response: messageResponse) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result as T);
          }
        });
      });
    } else if (to === "background") {
      chrome.runtime.sendMessage(message, (response: messageResponse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result as T);
        }
      });
    }
  });
}
