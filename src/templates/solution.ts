/** Solution page template. */

import { Puzzle, PuzzleFiles, Round, Hunt } from "../types";
import { layout, escapeHtml } from "./layout";
import { renderMarkdown } from "../markdown";

export function renderSolution(
  puzzle: Puzzle,
  files: PuzzleFiles,
  parentRound: Round | null,
  hunt: Hunt | null
): string {
  const puzzleUrl = `../../puzzle/${encodeURIComponent(puzzle.slug)}/index.html`;

  const backLink =
    parentRound != null
      ? `<a href="../../chapter/${encodeURIComponent(parentRound.slug)}/index.html">&larr; ${escapeHtml(parentRound.name)}</a>`
      : `<a href="../../index.html">&larr; Home</a>`;

  const storyHtml = files.post_solve_story
    ? `<div class="post-solve-story">${renderMarkdown(files.post_solve_story)}</div><hr />`
    : "";

  const solutionTextHtml = files.solution_text
    ? renderMarkdown(files.solution_text)
    : `<p><em>Solution text stub &mdash; to be written.</em></p>`;

  const authorNotesHtml = files.author_notes
    ? `<div class="author-notes"><h2>Author Notes</h2>${renderMarkdown(files.author_notes)}</div>`
    : "";

  const solutionBody = `
    ${storyHtml}
    <div class="solution-text">
      <h2>Solution</h2>
      ${solutionTextHtml}
    </div>
    ${authorNotesHtml}`;

  return layout({
    title: `Solution: ${puzzle.name}`,
    rootPrefix: "../../",
    backNav: backLink,
    content: `
      <h1>Solution: ${escapeHtml(puzzle.name)}</h1>
      <p><a href="${puzzleUrl}">&larr; Back to puzzle</a></p>
      <div class="answer-box">
        <strong>Answer:</strong> <span class="answer">${escapeHtml(puzzle.answer)}</span>
      </div>
      ${solutionBody}`,
  });
}

