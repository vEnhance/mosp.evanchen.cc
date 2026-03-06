/**
 * Client-side unlock progression for the MOSP archive.
 *
 * Progress is stored in localStorage under MOSP_PROGRESS_KEY as:
 *   { courage: number, solved: string[] }
 *
 * Puzzles earn courage_bounty points when solved.
 * Chapter 2 puzzles unlock once enough courage is accumulated.
 */
(function () {
  "use strict";

  const KEY = "mosp_progress_v1";

  function getProgress() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        return { courage: p.courage || 0, solved: new Set(p.solved || []) };
      }
    } catch (_) {}
    return { courage: 0, solved: new Set() };
  }

  function saveProgress(p) {
    localStorage.setItem(KEY, JSON.stringify({
      courage: p.courage,
      solved: Array.from(p.solved),
    }));
  }

  /** Add n to the courage total and return the new value. */
  window.MOSP_grantCourage = function (n) {
    const p = getProgress();
    p.courage += n;
    saveProgress(p);
    return p.courage;
  };

  /** Mark a puzzle slug as solved. */
  window.MOSP_markSolved = function (slug) {
    const p = getProgress();
    p.solved.add(slug);
    saveProgress(p);
  };

  /** Return current courage total. */
  window.MOSP_getCourage = function () {
    return getProgress().courage;
  };

  /**
   * Determine whether an unlockable should be visible.
   * @param {Object} u - unlockable object with:
   *   force_visibility {boolean|null}, unlock_courage_threshold {number},
   *   unlock_needs_slug {string|null}
   */
  window.MOSP_isVisible = function (u) {
    if (u.force_visibility === true)  return true;
    if (u.force_visibility === false) return false;
    // null → check courage + needs
    const p = getProgress();
    if (p.courage < u.unlock_courage_threshold) return false;
    if (u.unlock_needs_slug && !p.solved.has(u.unlock_needs_slug)) return false;
    return true;
  };

  /** Update the courage display in the nav. */
  function refreshCourageDisplay() {
    const el = document.getElementById("courage_value");
    if (el) el.textContent = String(getProgress().courage);
  }

  // Run on DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    refreshCourageDisplay();

    // Apply unlock visibility to any puzzle rows on chapter pages
    const rows = document.querySelectorAll("[data-unlockable]");
    if (rows.length === 0) return;

    let anyLocked = false;
    rows.forEach(function (row) {
      const u = JSON.parse(row.getAttribute("data-unlockable"));
      if (!MOSP_isVisible(u)) {
        row.classList.add("locked");
        anyLocked = true;
        // Annotate with lock message
        const cell = row.querySelector(".col-title");
        if (cell) {
          const msg = document.createElement("span");
          msg.className = "lock-msg";
          msg.textContent = u.unlock_courage_threshold > 0
            ? "\uD83D\uDD12 Unlocks at \uD83D\uDC9C" + u.unlock_courage_threshold
            : "\uD83D\uDD12 Locked";
          cell.appendChild(msg);
        }
      }
    });

    // Show "reveal all" button if anything is locked
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
