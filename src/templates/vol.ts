/** Volume page: lists the rounds/chapters inside a hunt. */

import { Hunt, Round, Unlockable } from "../types";
import { layout, escapeHtml } from "./layout";

export function renderVol(
  hunt: Hunt,
  rounds: Round[],
  unlockablesByPk: Map<number, Unlockable>
): string {
  // Rounds in chapter number order
  const sorted = [...rounds].sort((a, b) => {
    const na = parseInt(a.chapter_number) || 0;
    const nb = parseInt(b.chapter_number) || 0;
    return na - nb;
  });

  const rows = sorted
    .map((r) => {
      const label = r.show_chapter_number
        ? `Chapter ${escapeHtml(r.chapter_number)}: ${escapeHtml(r.name)}`
        : escapeHtml(r.name);
      return `
      <div class="chapter-card">
        <h2><a href="../../chapter/${encodeURIComponent(r.slug)}/index.html">${label}</a></h2>
        <a class="btn" href="../../chapter/${encodeURIComponent(r.slug)}/index.html">Open Chapter &rarr;</a>
      </div>`;
    })
    .join("\n");

  return layout({
    title: hunt.name,
    rootPrefix: "../../",
    backNav: `<a href="../../index.html">&larr; All Hunts</a>`,
    content: `
      <h1>Volume ${escapeHtml(hunt.volume_number)}: ${escapeHtml(hunt.name)}</h1>
      <p class="hunt-meta">Authors: ${escapeHtml(hunt.authors)}</p>
      <div class="chapter-list">
        ${rows}
      </div>`,
  });
}
