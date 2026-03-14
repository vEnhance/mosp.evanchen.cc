/**
 * Client-side unlock progression for the MOSP archive.
 *
 * Progress is stored in localStorage under a per-volume key as:
 *   { courage: number, solved: string[], opened: string[] }
 *
 * "solved" tracks puzzle slugs answered correctly.
 * "opened" tracks unlockable slugs whose story page has been visited.
 */

interface Unlockable {
  slug: string;
  hunt_volume: string;
  parent_slug: string | null;
  name: string;
  icon: string;
  sort_order: number;
  story_only: boolean;
  courage_bounty: number;
  unlock_courage_threshold: number;
  unlock_needs_slug: string | null;
  force_visibility: boolean | null;
  on_solve_link_to: string | null;
  puzzle_slug: string | null;
  round_slug: string | null;
  intro_story_text: string;
}

interface Progress {
  courage: number;
  solved: Set<string>;
  opened: Set<string>;
}

// Extend Window with template-injected globals and the public MOSP API.
// All .ts files in the same compilation see these declarations.
interface Window {
  // Injected per-page by templates
  MOSP_VOLUME?: string;
  MOSP_HEART?: string;
  MOSP_UNLOCK_SLUG?: string;
  // Published by unlock.ts for use by grader.ts and inline scripts
  MOSP_grantCourage?: (n: number) => number;
  MOSP_isSolved?: (slug: string) => boolean;
  MOSP_markSolved?: (slug: string) => void;
  MOSP_getCourage?: () => number;
  MOSP_markOpened?: (slug: string) => void;
  MOSP_isOpened?: (slug: string) => boolean;
  MOSP_isVisible?: (u: Unlockable) => boolean;
  MOSP_promptName?: () => void;
}

(function () {
  "use strict";

  function getVol(): string | null {
    return window.MOSP_VOLUME !== undefined ? window.MOSP_VOLUME : null;
  }

  function getKey(): string {
    const vol = getVol();
    return vol ? "mosp_progress_v2_" + vol : "mosp_progress_v2_all";
  }

  function getHeart(): string {
    return window.MOSP_HEART !== undefined ? window.MOSP_HEART : "🩷";
  }

  function getProgress(): Progress {
    try {
      const raw = localStorage.getItem(getKey());
      if (raw) {
        const p = JSON.parse(raw);
        return {
          courage: p.courage || 0,
          solved: new Set<string>(p.solved || []),
          opened: new Set<string>(p.opened || []),
        };
      }
    } catch (_) {}
    return { courage: 0, solved: new Set<string>(), opened: new Set<string>() };
  }

  function saveProgress(p: Progress): void {
    localStorage.setItem(
      getKey(),
      JSON.stringify({
        courage: p.courage,
        solved: Array.from(p.solved),
        opened: Array.from(p.opened),
      }),
    );
  }

  window.MOSP_grantCourage = function (n: number): number {
    const p = getProgress();
    p.courage += n;
    saveProgress(p);
    return p.courage;
  };

  window.MOSP_isSolved = function (slug: string): boolean {
    return getProgress().solved.has(slug);
  };

  window.MOSP_markSolved = function (slug: string): void {
    const p = getProgress();
    p.solved.add(slug);
    saveProgress(p);
  };

  window.MOSP_getCourage = function (): number {
    return getProgress().courage;
  };

  window.MOSP_markOpened = function (slug: string): void {
    const p = getProgress();
    p.opened.add(slug);
    saveProgress(p);
  };

  window.MOSP_isOpened = function (slug: string): boolean {
    return getProgress().opened.has(slug);
  };

  // ── Open-all switch ───────────────────────────────────────────────────────

  function getOpenAllKey(): string {
    const vol = getVol();
    return vol ? "mosp_openall_" + vol : "mosp_openall_all";
  }

  function getOpenAll(): boolean {
    return localStorage.getItem(getOpenAllKey()) === "true";
  }

  function setOpenAll(val: boolean): void {
    localStorage.setItem(getOpenAllKey(), String(val));
  }

  window.MOSP_isVisible = function (u: Unlockable): boolean {
    if (getOpenAll()) return true;
    if (u.force_visibility === true) return true;
    if (u.force_visibility === false) return false;
    const p = getProgress();
    if (p.courage < u.unlock_courage_threshold) return false;
    if (u.unlock_needs_slug && !p.solved.has(u.unlock_needs_slug)) return false;
    return true;
  };

  // ── Chapter table helpers ─────────────────────────────────────────────────

  function revealAnswer(cell: Element): void {
    const answer = cell.getAttribute("data-answer");
    const solutionUrl = cell.getAttribute("data-solution");
    if (!answer) return;
    cell.innerHTML = solutionUrl
      ? '<a class="noshadow" href="' + solutionUrl + '">' + answer + "</a>"
      : answer;
  }

  function refreshCourageDisplay(): void {
    const el = document.getElementById("courage_value");
    if (el) el.textContent = String(getProgress().courage);
    const heartEl = document.getElementById("courage_heart");
    if (heartEl) heartEl.textContent = getHeart();
  }

  // ── Protagonist name ──────────────────────────────────────────────────────

  const NAME_KEY = "mosp_name_v1";

  function getName(): string {
    return localStorage.getItem(NAME_KEY) || "Frisk";
  }

  function renderName(): void {
    const name = getName();
    const first =
      name.indexOf(" ") !== -1 ? name.substring(0, name.indexOf(" ")) : name;
    document.querySelectorAll("span.name.fullname").forEach((el) => {
      el.textContent = name;
    });
    document.querySelectorAll("span.name.firstname").forEach((el) => {
      el.textContent = first;
    });
    const tok = document.getElementById("tokenname");
    if (tok) tok.textContent = name;
  }

  window.MOSP_promptName = function (): void {
    const current = getName();
    const input = window.prompt(
      "Enter your name (it will appear in the story):",
      current,
    );
    if (input !== null) {
      const trimmed = input.trim() || "Frisk";
      localStorage.setItem(NAME_KEY, trimmed);
      renderName();
    }
  };

  // ── DOMContentLoaded ──────────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", function () {
    renderName();
    refreshCourageDisplay();

    // If this is an unlock/story page, mark it as opened
    if (window.MOSP_UNLOCK_SLUG !== undefined) {
      window.MOSP_markOpened!(window.MOSP_UNLOCK_SLUG);
    }

    // Initialise the "open all" toggle checkbox
    const openAllCheckbox = document.getElementById(
      "openall-checkbox",
    ) as HTMLInputElement | null;
    if (openAllCheckbox) {
      openAllCheckbox.checked = getOpenAll();
      openAllCheckbox.addEventListener("change", function () {
        setOpenAll(this.checked);
        location.reload();
      });
    }

    const rows = document.querySelectorAll("[data-unlockable]");
    if (rows.length === 0) return;

    const progress = getProgress();
    let anyLocked = false;

    rows.forEach(function (row) {
      let u: Unlockable;
      try {
        u = JSON.parse(row.getAttribute("data-unlockable")!);
      } catch (_) {
        return;
      }

      // Story-only rows: hide entirely when not visible
      if (row.classList.contains("story-row")) {
        if (!window.MOSP_isVisible!(u)) {
          (row as HTMLElement).style.display = "none";
        }
        return;
      }

      // Puzzle rows: reveal answer if already solved
      const answerCell = row.querySelector("[data-slug]");
      if (
        answerCell &&
        progress.solved.has(answerCell.getAttribute("data-slug")!)
      ) {
        revealAnswer(answerCell);
      }

      const cell = row.querySelector(".col-title") as HTMLElement | null;

      if (!window.MOSP_isVisible!(u)) {
        // Locked: dim the row and show a lock message; clear the title
        row.classList.add("locked");
        anyLocked = true;
        if (cell) {
          cell.innerHTML = "";
          const msg = document.createElement("span");
          msg.className = "lock-msg";
          msg.textContent =
            u.unlock_courage_threshold > 0
              ? "\uD83D\uDD12 Unlocks at " +
                getHeart() +
                u.unlock_courage_threshold
              : "\uD83D\uDD12 Locked";
          cell.appendChild(msg);
        }
      } else if (!u.intro_story_text) {
        // Visible but no story text: auto-open and link location directly to puzzle
        window.MOSP_markOpened!(u.slug);
        const locLink = row.querySelector(
          ".col-location a",
        ) as HTMLAnchorElement | null;
        if (locLink) {
          locLink.replaceWith(
            document.createTextNode(locLink.textContent || ""),
          );
        }
      } else if (!window.MOSP_isOpened!(u.slug)) {
        // Visible but story not yet visited: show "New puzzle found!" placeholder
        if (cell) {
          const span = document.createElement("span");
          span.className = "new-puzzle";
          span.textContent = "New puzzle found!";
          cell.textContent = "";
          cell.appendChild(span);
        }
      }
      // else: visible and opened — template-rendered puzzle name + link stands

      // Always reveal the title cell once JS has decided what to show
      if (cell) {
        cell.style.visibility = "visible";
      }
    });
  });
})();
