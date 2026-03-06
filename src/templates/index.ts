/** Homepage: lists both hunts. */

import { Hunt } from "../types";
import { layout, escapeHtml } from "./layout";

export function renderIndex(hunts: Hunt[]): string {
  const sorted = [...hunts].sort((a, b) => a.pk - b.pk);

  const cards = sorted
    .map(
      (h) => `
    <div class="hunt-card">
      <h2><a href="vol/${encodeURIComponent(h.volume_number)}/index.html">${escapeHtml(h.name)}</a></h2>
      <p class="hunt-meta">Volume ${escapeHtml(h.volume_number)} &mdash; ${escapeHtml(h.authors)}</p>
      <a class="btn" href="vol/${encodeURIComponent(h.volume_number)}/index.html">View Hunt &rarr;</a>
    </div>`
    )
    .join("\n");

  return layout({
    title: "Home",
    content: `
      <h1>MOSP Puzzle Hunt Archive</h1>
      <p>
        This is a static archive of the MOSP (Math Olympiad Summer Program)
        puzzle hunt, which ran in 2021 and 2022.
        All puzzles are now freely accessible.
      </p>
      <div class="hunt-list">
        ${cards}
      </div>`,
  });
}
