/** Puzzle page template. */

import { Puzzle, PuzzleFiles, Round, Hunt } from "../types";
import { layout, escapeHtml } from "./layout";
import { renderMarkdown } from "../markdown";

/** Inlined client-side grader script (compiled from src/client/grader.ts). */
const GRADER_SCRIPT = `
(async function() {
  async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
  function normalize(s) {
    return s.toUpperCase().replace(/[^A-Z]/g, "");
  }
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("answer-input");
    const btn = document.getElementById("answer-submit");
    const feedback = document.getElementById("answer-feedback");
    const successBox = document.getElementById("answer-success");
    if (!input || !btn || !feedback) return;

    async function checkAnswer() {
      const raw = input.value.trim();
      const normalized = normalize(raw);
      if (!normalized) return;
      input.disabled = true;
      btn.disabled = true;
      feedback.textContent = "Checking\u2026";
      feedback.className = "answer-feedback checking";
      for (let salt = 0; salt < 10000; salt++) {
        const candidate = "MOSP_LIGHT_NOVEL_" + normalized + salt;
        const hash = await sha256(candidate);
        if (MOSP_HASHES.includes(hash)) {
          feedback.textContent = "\\u2705 Correct!";
          feedback.className = "answer-feedback correct";
          if (successBox) {
            successBox.style.display = "block";
            const link = successBox.querySelector("a");
            if (link) link.href = MOSP_SOLUTION_URL;
          }
          return;
        }
        for (const partial of MOSP_PARTIAL) {
          if (partial.hash === hash) {
            feedback.textContent = "\\uD83E\\uDD14 " + partial.message;
            feedback.className = "answer-feedback partial";
            input.disabled = false;
            btn.disabled = false;
            return;
          }
        }
      }
      feedback.textContent = "\\u274C Incorrect. Try again.";
      feedback.className = "answer-feedback wrong";
      input.disabled = false;
      btn.disabled = false;
    }

    btn.addEventListener("click", () => checkAnswer());
    input.addEventListener("keydown", e => { if (e.key === "Enter") checkAnswer(); });
  });
})();
`;

export function renderPuzzle(
  puzzle: Puzzle,
  files: PuzzleFiles,
  parentRound: Round | null,
  hunt: Hunt | null
): string {
  const flavorHtml = files.flavor_text
    ? `<div class="flavor-text">${renderMarkdown(files.flavor_text)}</div>`
    : "";

  const contentHtml = files.content
    ? renderMarkdown(files.content)
    : `<p><em>Puzzle content stub &mdash; to be filled in.</em></p>`;

  const backLink =
    parentRound != null
      ? `<a href="../../chapter/${encodeURIComponent(parentRound.slug)}/index.html">&larr; ${escapeHtml(parentRound.name)}</a>`
      : `<a href="../../index.html">&larr; Home</a>`;

  const solutionUrl = `../../solution/${encodeURIComponent(puzzle.slug)}/index.html`;

  const hashesJson = JSON.stringify(puzzle.hashes);
  const partialJson = JSON.stringify(puzzle.partial_answers);

  const dataScript = `
<script>
const MOSP_HASHES = ${hashesJson};
const MOSP_PARTIAL = ${partialJson};
const MOSP_SOLUTION_URL = ${JSON.stringify(solutionUrl)};
</script>`;

  const graderHtml = `
<div class="answer-checker">
  <div class="answer-row">
    <input id="answer-input" type="text" placeholder="Enter answer&hellip;" autocomplete="off" spellcheck="false" />
    <button id="answer-submit">Check</button>
  </div>
  <div id="answer-feedback" class="answer-feedback"></div>
  <div id="answer-success" class="answer-success" style="display:none">
    <p>&#x1F511; <a href="${solutionUrl}">View solution</a></p>
  </div>
</div>
<script>${GRADER_SCRIPT}</script>`;

  return layout({
    title: puzzle.name,
    rootPrefix: "../../",
    backNav: backLink,
    extraHead: files.puzzle_head || undefined,
    content: `
      <h1>${escapeHtml(puzzle.name)}</h1>
      ${flavorHtml}
      ${dataScript}
      ${graderHtml}
      <div class="puzzle-content">
        ${contentHtml}
      </div>
      <p><a href="${solutionUrl}">View solution &rarr;</a></p>`,
  });
}
