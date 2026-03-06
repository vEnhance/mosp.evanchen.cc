/** Markdown rendering using the `marked` library. */

import { marked } from "marked";

/** Render a markdown string to HTML. */
export function renderMarkdown(md: string): string {
  // marked.parse returns string when not using async
  return marked.parse(md) as string;
}
