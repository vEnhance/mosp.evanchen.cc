/**
 * Client-side unlock progression for the MOSP archive.
 *
 * Progress is stored in localStorage under a per-volume key as:
 *   { courage: number, solved: string[], opened: string[] }
 *
 * "solved" tracks puzzle slugs that have been answered correctly.
 * "opened" tracks unlockable slugs whose story page has been visited.
 *
 * Puzzles earn courage_bounty points when solved.
 * Answers in the chapter table are only revealed for solved puzzles.
 * Puzzle titles on the chapter page show as "???" until the corresponding
 * unlockable story page has been opened (visited).
 */
(function () {
  "use strict";

  // Per-volume localStorage keys; falls back to "all" on pages without a volume
  function getVol() {
    return typeof globalThis.MOSP_VOLUME !== "undefined"
      ? globalThis.MOSP_VOLUME
      : null;
  }

  function getKey() {
    const vol = getVol();
    return vol ? "mosp_progress_v2_" + vol : "mosp_progress_v2_all";
  }

  function getHeart() {
    return typeof globalThis.MOSP_HEART !== "undefined"
      ? globalThis.MOSP_HEART
      : "\uD83D\uDC9C";
  }

  function getProgress() {
    try {
      const raw = localStorage.getItem(getKey());
      if (raw) {
        const p = JSON.parse(raw);
        return {
          courage: p.courage || 0,
          solved: new Set(p.solved || []),
          opened: new Set(p.opened || []),
        };
      }
    } catch (_) {}
    return { courage: 0, solved: new Set(), opened: new Set() };
  }

  function saveProgress(p) {
    localStorage.setItem(
      getKey(),
      JSON.stringify({
        courage: p.courage,
        solved: Array.from(p.solved),
        opened: Array.from(p.opened),
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

  /** Mark an unlockable slug as opened (story page has been visited). */
  globalThis.MOSP_markOpened = function (slug) {
    const p = getProgress();
    p.opened.add(slug);
    saveProgress(p);
  };

  /** Return true if an unlockable story page has been visited. */
  globalThis.MOSP_isOpened = function (slug) {
    return getProgress().opened.has(slug);
  };

  // ── Open-all switch ───────────────────────────────────────────────────────

  function getOpenAllKey() {
    const vol = getVol();
    return vol ? "mosp_openall_" + vol : "mosp_openall_all";
  }

  function getOpenAll() {
    return localStorage.getItem(getOpenAllKey()) === "true";
  }

  function setOpenAll(val) {
    localStorage.setItem(getOpenAllKey(), String(val));
  }

  /**
   * Determine whether an unlockable should be visible.
   * When the "open all" switch is on, all unlockables are visible.
   * @param {Object} u - unlockable with force_visibility, unlock_courage_threshold, unlock_needs_slug
   */
  globalThis.MOSP_isVisible = function (u) {
    if (getOpenAll()) return true;
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
    const el = document.getElementById("courage_value");
    if (el) el.textContent = String(getProgress().courage);
    const heartEl = document.getElementById("courage_heart");
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

    // If this is an unlock/story page, mark it as opened
    if (typeof globalThis.MOSP_UNLOCK_SLUG !== "undefined") {
      globalThis.MOSP_markOpened(globalThis.MOSP_UNLOCK_SLUG);
    }

    // Initialise the "open all" toggle checkbox
    const openAllCheckbox = document.getElementById("openall-checkbox");
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
      let u;
      try {
        u = JSON.parse(row.getAttribute("data-unlockable"));
      } catch (_) {
        return;
      }

      // Story-only rows: hide entirely when not visible
      if (row.classList.contains("story-row")) {
        if (!MOSP_isVisible(u)) {
          row.style.display = "none";
        }
        return;
      }

      // Puzzle rows: reveal answer if solved
      const answerCell = row.querySelector("[data-slug]");
      if (
        answerCell &&
        progress.solved.has(answerCell.getAttribute("data-slug"))
      ) {
        revealAnswer(answerCell);
      }

      if (!MOSP_isVisible(u)) {
        // Locked: dim the row and add a lock message, but no title placeholder
        row.classList.add("locked");
        anyLocked = true;
        const cell = row.querySelector(".col-title");
        if (cell) {
          // Clear the title contents so locked rows show no puzzle name
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
      } else if (!MOSP_isOpened(u.slug)) {
        // Visible but unlockable story not yet opened: show "???" linking to unlock page
        const cell = row.querySelector(".col-title");
        if (cell) {
          const unlockHref =
            "../../unlock/" + encodeURIComponent(u.slug) + "/index.html";
          cell.innerHTML =
            '<a href="' + unlockHref + '">???</a>';
        }
      }
      // else: visible and opened — the template already rendered the puzzle title
      // with a link to the puzzle page; no JS change needed
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
