import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      input: {
        content: "src/content.ts",
        background: "src/background.ts",
        options: "src/options/main.tsx",
        popup: "src/popup/main.tsx",
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background.js";
          if (chunk.name === "options") return "options.js";
          if (chunk.name === "popup") return "popup.js";
          return "content.js";
        },
      },
      external: [],
    },
  },
  plugins: [crx({ manifest })],
});
