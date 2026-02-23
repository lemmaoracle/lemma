# Lemma (web)

Static site for Lemma Oracle, built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Setup

From the repo root:

```bash
pnpm install
```

## Development

```bash
pnpm --filter @lemma/web dev
```

## Build

```bash
pnpm --filter @lemma/web build
```

Output is in `dist/`. The site is configured for GitHub Pages with `base: "/lemma"` (repository name).

## Blog

Blog entries are intended to be sourced from **Affine** (pages with a specific tag), fetched at build time via `getStaticPaths`. The data layer lives in `src/data/blog.ts`. Currently it uses **dummy data**; replace with Affine workspace + tag fetching when ready (see [Using AFFiNE as your own blog](https://affine.pro/blog/using-affine-as-a-blog-technical)).

## Rebuild trigger

The path `/rebuild` (or `/<base>/rebuild`) is a public page that is not linked from the site. It explains how to trigger a rebuild and redeploy (GitHub Actions workflow link and `repository_dispatch` curl example). Use it after updating content in Affine.

## Original design

The original project is available at https://www.figma.com/design/7H5ah29125QtPvi1dQjoER/Lemma.
