import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://lemmaoracle.github.io",
  base: "/lemma",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
