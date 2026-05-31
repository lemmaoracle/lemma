import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { rehypeBriefSectionNumber } from "./src/lib/rehype-brief-section-number.mjs";

export default defineConfig({
  site: "https://lemma.frame00.com",
  base: "/",
  output: "static",
  i18n: {
    locales: ["en", "ja"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    react(),
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en-US", ja: "ja-JP" } },
      filter: (page) => !page.includes("/thank-you/") && !page.includes("/pillars/agent-trust-chain/"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeBriefSectionNumber],
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
