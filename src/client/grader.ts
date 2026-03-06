/**
 * Client-side answer checker for MOSP archival site.
 * No server needed: uses SHA-256 to validate against pre-computed hashes.
 *
 * Expected globals injected by the page:
 *   MOSP_HASHES: string[]         - SHA-256 hashes of correct answers
 *   MOSP_PARTIAL: {hash: string, message: string}[]  - partial answer hashes
 *   MOSP_SOLUTION_URL: string     - relative URL to the solution page
 */

async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalize(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, "");
}

declare const MOSP_HASHES: string[];
declare const MOSP_PARTIAL: { hash: string; message: string }[];
declare const MOSP_SOLUTION_URL: string;

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("answer-input") as HTMLInputElement | null;
  const btn = document.getElementById("answer-submit") as HTMLButtonElement | null;
  const feedback = document.getElementById("answer-feedback") as HTMLElement | null;
  const successBox = document.getElementById("answer-success") as HTMLElement | null;

  if (!input || !btn || !feedback) return;

  async function checkAnswer() {
    const raw = input!.value.trim();
    const normalized = normalize(raw);
    if (!normalized) return;

    input!.disabled = true;
    btn!.disabled = true;
    feedback!.textContent = "Checking\u2026";
    feedback!.className = "answer-feedback checking";

    for (let salt = 0; salt < 10000; salt++) {
      const candidate = "MOSP_LIGHT_NOVEL_" + normalized + salt;
      const hash = await sha256(candidate);

      if (MOSP_HASHES.includes(hash)) {
        feedback!.textContent = "\u2705 Correct!";
        feedback!.className = "answer-feedback correct";
        if (successBox) {
          successBox.style.display = "block";
          const link = successBox.querySelector("a");
          if (link) link.href = MOSP_SOLUTION_URL;
        }
        return;
      }

      for (const partial of MOSP_PARTIAL) {
        if (partial.hash === hash) {
          feedback!.textContent = `\uD83E\uDD14 ${partial.message}`;
          feedback!.className = "answer-feedback partial";
          input!.disabled = false;
          btn!.disabled = false;
          return;
        }
      }
    }

    feedback!.textContent = "\u274C Incorrect. Try again.";
    feedback!.className = "answer-feedback wrong";
    input!.disabled = false;
    btn!.disabled = false;
  }

  btn.addEventListener("click", () => void checkAnswer());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") void checkAnswer();
  });
});
