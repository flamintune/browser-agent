import { handlers } from "@/utils/handlers";
import {
  MESSAGE_TOOL_TYPES,
  messageRequest,
  messageResponse,
  TAB_URL_CHANGED,
} from "@/utils/types/message";

export default defineBackground({
  main() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url) {
        chrome.runtime.sendMessage({
          type: TAB_URL_CHANGED,
          url: changeInfo.url,
          tabId,
        });
      }
    });

    chrome.tabs.onActivated.addListener(async ({ tabId }) => {
      const tab = await chrome.tabs.get(tabId);
      if (tab.url) {
        chrome.runtime.sendMessage({
          type: TAB_URL_CHANGED,
          url: tab.url,
          tabId,
        });
      }
    });

    chrome.runtime.onMessage.addListener(
      (
        message: messageRequest,
        sender,
        sendResponse: (response: messageResponse) => void,
      ) => {
        const handler = handlers[message.type];
        if (handler) {
          handler(message).then((result) => {
            sendResponse(result);
          }).catch((error) => {
            console.error("Error:", error);
            sendResponse({ error });
          });
        } else {
          console.error("Unknown message type:", message.type);
          sendResponse({ error: "Unknown message type" });
        }
        return true;
      },
    );
  },
});
