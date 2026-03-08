/**
 * Client-side answer checker for MOSP archival site.
 * No server needed: uses SHA-256 to validate against pre-computed hashes.
 *
 * Expected globals injected by the page:
 *   MOSP_HASHES: string[]                            - SHA-256 hashes of correct answers
 *   MOSP_PARTIAL: {hash: string, message: string}[]  - partial answer hashes
 *   MOSP_SLUG: string                                - puzzle slug for progress tracking
 *   MOSP_BOUNTY: number                              - courage points awarded on first solve
 *
 * Expected DOM (from puzzle.html / layout.html):
 *   #answer        - text input
 *   #check-btn     - optional submit button
 *   span.icon      - icon spans toggled during checking
 *   #thinking      - shown while hashing
 *   #wrong         - shown on wrong/partial answer
 *   #correct       - shown on correct answer
 *   #percent       - text feedback (partial answer messages)
 *   #courage_value - courage counter in site nav (from layout.html)
 */

declare const MOSP_HASHES: string[];
declare const MOSP_PARTIAL: { hash: string; message: string }[];
declare const MOSP_SLUG: string;
declare const MOSP_BOUNTY: number;

interface Window {
  MOSP_isSolved?: (slug: string) => boolean;
  MOSP_markSolved?: (slug: string) => void;
  MOSP_grantCourage?: (amount: number) => void;
  MOSP_getCourage?: () => number;
}

async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalize(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, "");
}

function showIcon(id: string): void {
  document.querySelectorAll("span.icon").forEach((el) => {
    (el as HTMLElement).style.display = "none";
  });
  const el = document.getElementById(id);
  if (el) el.style.display = "inline";
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("answer") as HTMLInputElement | null;
  const btn = document.getElementById("check-btn") as HTMLButtonElement | null;
  const pct = document.getElementById("percent") as HTMLElement | null;

  if (!input) return;

  async function check(): Promise<void> {
    const normalized = normalize(input!.value.trim());
    if (!normalized) return;

    input!.disabled = true;
    if (btn) btn.disabled = true;
    showIcon("thinking");
    if (pct) pct.style.visibility = "visible";

    for (let salt = 0; salt < 10000; salt++) {
      const h = await sha256("MOSP_LIGHT_NOVEL_" + normalized + salt);

      if (MOSP_HASHES.includes(h)) {
        showIcon("correct");
        if (pct) pct.style.visibility = "hidden";
        document.body.classList.add("solved");
        const firstSolve = !window.MOSP_isSolved || !window.MOSP_isSolved(MOSP_SLUG);
        if (window.MOSP_markSolved) window.MOSP_markSolved(MOSP_SLUG);
        if (firstSolve && window.MOSP_grantCourage && MOSP_BOUNTY > 0) {
          window.MOSP_grantCourage(MOSP_BOUNTY);
        }
        const cv = document.getElementById("courage_value");
        if (cv && window.MOSP_getCourage) cv.textContent = String(window.MOSP_getCourage());
        const prize = document.getElementById("prize") as HTMLAnchorElement | null;
        setTimeout(() => {
          document.querySelectorAll("span.icon").forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
          if (prize) prize.style.display = "inline";
        }, 1500);
        return;
      }

      for (const partial of MOSP_PARTIAL) {
        if (partial.hash === h) {
          showIcon("wrong");
          if (pct) {
            pct.textContent = "\uD83E\uDD14 " + partial.message;
            pct.style.visibility = "visible";
          }
          input!.disabled = false;
          if (btn) btn.disabled = false;
          return;
        }
      }
    }

    showIcon("wrong");
    if (pct) {
      pct.textContent = "";
      pct.style.visibility = "hidden";
    }
    input!.disabled = false;
    if (btn) btn.disabled = false;
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") void check();
  });
  if (btn) btn.addEventListener("click", () => void check());
});
