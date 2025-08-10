import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: ({ browser, manifestVersion, mode, command }) => {
    return {
      name: "WXT + Agent",
      description: "WXT + Agent",
      version: "1.0.0",
      action: {},
      permissions: ["tabs", "storage", "scripting", "activeTab", "background"],
      host_permissions: ["<all_urls>"],
    };
  },
});
