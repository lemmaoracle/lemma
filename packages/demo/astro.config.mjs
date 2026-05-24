import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://demo-lemma.frame00.com",
  output: "static",
  build: {
    assets: "assets",
  },
  vite: {
    build: {
      target: "es2022",
    },
  },
});
