import { MESSAGE_TOOL_TYPES, messageRequest, messageResponse } from "../utils/types/message";
import { handlers } from "@/utils/handlers";
import { ElementPicker } from 'js-element-picker';

const picker = new ElementPicker({
  picking: false,
  onClick: (target) => {
    console.log(target);
  },
});

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    chrome.runtime.onMessage.addListener(
      async (
        message: messageRequest,
        sender,
        sendResponse: (response: messageResponse) => void
      ) => {
        if (message.type === MESSAGE_TOOL_TYPES.EXECUTE_SCRIPT.name) {
          return;
        }
        const handler = handlers[message.type];
        if (handler) {
          const result = await handler(message);
          sendResponse(result);
        } else {
          console.error("Unknown message type:", message.type);
          sendResponse({ error: "Unknown message type" });
        }
        return true;
      }
    );

    // picker.startPicking();
  },
});
