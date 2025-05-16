import { TAB_URL_CHANGED } from "@/utils/types/message";

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
  },
});
