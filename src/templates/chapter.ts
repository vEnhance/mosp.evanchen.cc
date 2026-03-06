/** Chapter page: lists puzzles in a round. */

import { Round, Unlockable, Puzzle, Hunt } from "../types";
import { layout, escapeHtml } from "./layout";
import { renderMarkdown } from "../markdown";

export function renderChapter(
  round: Round,
  hunt: Hunt,
  unlockables: Unlockable[],
  puzzlesByPk: Map<number, Puzzle>
): string {
  // Filter unlockables belonging to this round (parent_pk == round.unlockable_pk)
  const children = unlockables
    .filter((u) => u.parent_pk === round.unlockable_pk)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  const roundTextHtml = round.round_text
    ? renderMarkdown(round.round_text)
    : "";

  const rows = children
    .map((u) => {
      const puzzle = u.puzzle_pk != null ? puzzlesByPk.get(u.puzzle_pk) : undefined;
      const icon = u.icon ? `${u.icon} ` : "";

      if (puzzle) {
        return `
        <tr class="puzzle-row">
          <td class="col-location">${escapeHtml(icon + u.name)}</td>
          <td class="col-title"><a href="../../puzzle/${encodeURIComponent(puzzle.slug)}/index.html">${escapeHtml(puzzle.name)}</a></td>
          <td class="col-answer">
            <a class="spoiler-answer" href="../../solution/${encodeURIComponent(puzzle.slug)}/index.html">${escapeHtml(puzzle.answer)}</a>
          </td>
        </tr>`;
      } else if (u.story_only) {
        return `
        <tr class="story-row">
          <td class="col-location"></td>
          <td class="col-title story-title" colspan="2">${escapeHtml(u.name)}</td>
        </tr>`;
      } else {
        return `
        <tr class="unlockable-row">
          <td class="col-location">${escapeHtml(icon + u.name)}</td>
          <td class="col-title" colspan="2"><em>No puzzle associated</em></td>
        </tr>`;
      }
    })
    .join("\n");

  const chapterLabel = round.show_chapter_number
    ? `Chapter ${escapeHtml(round.chapter_number)}: ${escapeHtml(round.name)}`
    : escapeHtml(round.name);

  const table =
    rows.length > 0
      ? `
      <table class="puzzle-table">
        <thead>
          <tr>
            <th class="col-location">Location</th>
            <th class="col-title">Puzzle</th>
            <th class="col-answer">Answer</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`
      : `<p><em>No puzzles in this chapter.</em></p>`;

  return layout({
    title: chapterLabel,
    rootPrefix: "../../",
    backNav: `<a href="../../vol/${encodeURIComponent(hunt.volume_number)}/index.html">&larr; ${escapeHtml(hunt.name)}</a>`,
    content: `
      <h1>${chapterLabel}</h1>
      ${roundTextHtml ? `<div class="round-text">${roundTextHtml}</div>` : ""}
      ${table}`,
  });
}
