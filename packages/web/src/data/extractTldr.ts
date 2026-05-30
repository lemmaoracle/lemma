/**
 * Extract the TL;DR section from a Brief's markdown body.
 *
 * The Brief template puts a `## TL;DR` block as the first body section
 * (template authoritative; README.md notes the convention). This util
 * finds that block, strips inline Markdown decorations, collapses
 * whitespace, and optionally truncates to a target length.
 *
 * Used by:
 *   - BriefCard.astro (archive grids, ~200 chars)
 *   - RSS feeds (item description, ~500 chars)
 *
 * Returns "" when the body is missing or has no TL;DR section. Callers
 * fall back to whatever default they prefer.
 */

const TLDR_REGEX = /##\s*TL;DR\s*\n+([\s\S]+?)(?:\n+##\s|$)/;
const MD_LINK = /\[([^\]]+)\]\([^)]+\)/g;
const MD_BOLD = /\*\*([^*]+)\*\*/g;
const MD_ITALIC = /\*([^*]+)\*/g;
const MD_CODE = /`([^`]+)`/g;
const WHITESPACE = /\s+/g;

export function extractTldr(
  body: string | undefined,
  maxChars: number = 200,
): string {
  if (!body) return "";
  const match = body.match(TLDR_REGEX);
  if (!match) return "";
  const stripped = match[1]
    .trim()
    .replace(MD_LINK, "$1")
    .replace(MD_BOLD, "$1")
    .replace(MD_ITALIC, "$1")
    .replace(MD_CODE, "$1")
    .replace(WHITESPACE, " ")
    .trim();
  if (stripped.length <= maxChars) return stripped;
  return stripped.slice(0, maxChars) + "…";
}
