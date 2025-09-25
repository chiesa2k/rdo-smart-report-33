import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];
  if (mode === "development") {
    const taggerModule: any = await import("lovable-tagger");
    const tagger = taggerModule.default ?? taggerModule;
    if (typeof tagger === "function") {
      plugins.push(tagger());
    }
  }

  return {
    base: mode === "production" ? "/rdo-smart-report-33/" : "/",
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
