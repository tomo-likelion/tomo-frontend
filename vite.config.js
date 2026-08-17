import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Chrome Extension은 파일명이 고정되어야 manifest.json에서 참조 가능하므로
// content.js / background.js는 해시 없이, sidepanel은 html 엔트리로 빌드합니다.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "sidepanel.html"),
        content: resolve(__dirname, "src/content/content-script.js"),
        background: resolve(__dirname, "src/background/background.js"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "content" || chunk.name === "background") {
            return "[name].js";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
});
