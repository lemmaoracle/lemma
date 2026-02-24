import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://lemma.frame00.com",
  base: "/",
  output: "static",
  i18n: {
    locales: ["en", "ja"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
