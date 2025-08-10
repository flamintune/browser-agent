import { matchPattern } from "browser-extension-url-match";

import { pageContentTool } from "./pageContentTool";
import { executeScriptTool } from "./executeScriptTool";

const tools = [pageContentTool];
export { tools };

const toolRules = [
  {
    matches: ["<all_urls>"], // 默認匹配
    tools: [pageContentTool,executeScriptTool],
  }
];

export function getToolsByUrl(url: string): any[] {
  const matchedTools = new Set<any>();
  for (const rule of toolRules) {
    const matcher = matchPattern(rule.matches);
    if (matcher.valid && matcher.match(url)) {
      console.log("match", rule.matches);
      rule.tools.forEach((tool) => matchedTools.add(tool));
    }
  }
  return Array.from(matchedTools); // 將 Set 轉換為 Array 並返回
}
