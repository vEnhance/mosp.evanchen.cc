/**
 * Client-side unlock progression for the MOSP archive.
 *
 * Progress is stored in localStorage under MOSP_PROGRESS_KEY as:
 *   { courage: number, solved: string[] }
 *
 * Puzzles earn courage_bounty points when solved.
 * Chapter 2 puzzles unlock once enough courage is accumulated.
 * Answers in the chapter table are only revealed for solved puzzles.
 */
(function () {
  "use strict";

  // Per-volume localStorage keys; falls back to "all" on pages without a volume
  function getKey() {
    var vol =
      typeof globalThis.MOSP_VOLUME !== "undefined"
        ? globalThis.MOSP_VOLUME
        : null;
    return vol ? "mosp_progress_v2_" + vol : "mosp_progress_v2_all";
  }

  function getHeart() {
    return typeof globalThis.MOSP_HEART !== "undefined"
      ? globalThis.MOSP_HEART
      : "\uD83D\uDC9C";
  }

  function getProgress() {
    try {
      var raw = localStorage.getItem(getKey());
      if (raw) {
        var p = JSON.parse(raw);
        return { courage: p.courage || 0, solved: new Set(p.solved || []) };
      }
    } catch (_) {}
    return { courage: 0, solved: new Set() };
  }

  function saveProgress(p) {
    localStorage.setItem(
      getKey(),
      JSON.stringify({
        courage: p.courage,
        solved: Array.from(p.solved),
      }),
    );
  }

  /** Add n to the courage total and return the new value. */
  globalThis.MOSP_grantCourage = function (n) {
    const p = getProgress();
    p.courage += n;
    saveProgress(p);
    return p.courage;
  };

  /** Return true if a puzzle slug has been solved. */
  globalThis.MOSP_isSolved = function (slug) {
    return getProgress().solved.has(slug);
  };

  /** Mark a puzzle slug as solved. */
  globalThis.MOSP_markSolved = function (slug) {
    const p = getProgress();
    p.solved.add(slug);
    saveProgress(p);
  };

  /** Return current courage total. */
  globalThis.MOSP_getCourage = function () {
    return getProgress().courage;
  };

  /**
   * Determine whether an unlockable should be visible.
   * @param {Object} u - unlockable with force_visibility, unlock_courage_threshold, unlock_needs_slug
   */
  globalThis.MOSP_isVisible = function (u) {
    if (u.force_visibility === true) return true;
    if (u.force_visibility === false) return false;
    const p = getProgress();
    if (p.courage < u.unlock_courage_threshold) return false;
    if (u.unlock_needs_slug && !p.solved.has(u.unlock_needs_slug)) return false;
    return true;
  };

  /** Reveal the answer cell for a solved puzzle row. */
  function revealAnswer(cell) {
    const answer = cell.getAttribute("data-answer");
    const solutionUrl = cell.getAttribute("data-solution");
    if (!answer) return;
    cell.innerHTML = solutionUrl
      ? '<a class="noshadow" href="' + solutionUrl + '">' + answer + "</a>"
      : answer;
  }

  /** Update the courage display in the nav (heart emoji + count). */
  function refreshCourageDisplay() {
    var el = document.getElementById("courage_value");
    if (el) el.textContent = String(getProgress().courage);
    var heartEl = document.getElementById("courage_heart");
    if (heartEl) heartEl.textContent = getHeart();
  }

  // ── Protagonist name ──────────────────────────────────────────────────────
  const NAME_KEY = "mosp_name_v1";

  function getName() {
    return localStorage.getItem(NAME_KEY) || "Frisk";
  }

  function renderName() {
    const name = getName();
    const first =
      name.indexOf(" ") !== -1 ? name.substring(0, name.indexOf(" ")) : name;
    document.querySelectorAll("span.name.fullname").forEach(function (el) {
      el.textContent = name;
    });
    document.querySelectorAll("span.name.firstname").forEach(function (el) {
      el.textContent = first;
    });
    const tok = document.getElementById("tokenname");
    if (tok) tok.textContent = name;
  }

  globalThis.MOSP_promptName = function () {
    const current = getName();
    const input = globalThis.prompt(
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

    const rows = document.querySelectorAll("[data-unlockable]");
    if (rows.length === 0) return;

    const progress = getProgress();
    let anyLocked = false;

    rows.forEach(function (row) {
      // Reveal answer if this puzzle has been solved (before JSON.parse so it
      // works even if the unlockable data attribute is malformed)
      const answerCell = row.querySelector("[data-slug]");
      if (
        answerCell &&
        progress.solved.has(answerCell.getAttribute("data-slug"))
      ) {
        revealAnswer(answerCell);
      }

      // Apply lock styling for courage-gated puzzles
      var u;
      try {
        u = JSON.parse(row.getAttribute("data-unlockable"));
      } catch (_) {
        return;
      }
      if (!MOSP_isVisible(u)) {
        row.classList.add("locked");
        anyLocked = true;
        const cell = row.querySelector(".col-title");
        if (cell) {
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
      }
    });

    // "Show all" escape hatch when some puzzles are locked
    if (anyLocked) {
      const btn = document.getElementById("show-all-btn");
      if (btn) {
        btn.style.display = "inline-block";
        btn.addEventListener("click", function () {
          document.querySelectorAll(".puzzle-row.locked").forEach(function (r) {
            r.classList.remove("locked");
            const msg = r.querySelector(".lock-msg");
            if (msg) msg.remove();
          });
          btn.style.display = "none";
        });
      }
    }
  });
})();
