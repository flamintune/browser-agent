import { messageRequest, messageResponse } from "../types/message";

export const executeScriptHandler = async (
    message: messageRequest,
): Promise<messageResponse> => {
    console.log("executeScriptHandler", message);
    const { script, tabId } = message.payload as {
        script: string;
        tabId: number;
    };
    const result = await chrome.scripting.executeScript({
        target: {
            tabId: tabId,
            allFrames: true,
        },
        world: "MAIN",
        func: (code: any) => {
            try {
                const result = eval(code?.script);
                return { success: true, result };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        },
        args: [script],
    });
    console.log("executeScriptHandler result", result);
    if (result[0]?.result?.success) {
        return {
            result: "执行脚本成功！",
        };
    } else {
        return {
            error: result[0]?.result?.error,
        };
    };
};
