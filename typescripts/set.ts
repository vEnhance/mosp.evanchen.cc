/*
 * Adapted from the Set with Friends website
 * https://github.com/ekzhang/setwithfriends
 * Written by Eric Zhang and Cynthia Du
 *
 * MIT License
 *
 * Copyright (c) 2020 Eric Zhang, Cynthia Du
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function SetCard(value: string, month: string, day: number): string {
  const theme = {
    setCard: {
      purple: "#ff47ff",
      green: "#00b803",
      red: "#ffb047",
    },
  };

  const SHAPES = ["squiggle", "oval", "diamond"];
  const SHADES = ["filled", "outline", "striped"];

  function Symbol(
    arg_color: number,
    arg_shape: number,
    arg_shade: number,
  ): string {
    const COLORS = [
      theme.setCard.purple,
      theme.setCard.green,
      theme.setCard.red,
    ];

    const color = COLORS[arg_color];
    const shape = SHAPES[arg_shape];
    const shade = SHADES[arg_shade];
    const width = 18;
    const height = 36;
    const fill = shade === "outline" ? "transparent" : color;
    const mask = shade === "striped" ? "url(#mask-stripe)" : "";
    return `<svg
        class="symbol"
        width="${width}"
        height="${height}"
        viewBox="0 0 200 400"
      >
        <use
          xlink:href="${"#" + shape}"
          fill="${fill}"
          mask="${mask}"
        />
        <use xlink:href="${"#" + shape}"
          stroke="${color}" fill="none" stroke-width="12px" />
      </svg>`;
  }

  // 4-character string of 0..2
  const color = value.charCodeAt(0) - 48;
  const shape = value.charCodeAt(1) - 48;
  const shade = value.charCodeAt(2) - 48;
  const number = value.charCodeAt(3) - 48;
  const symbols = [...Array(number + 1)]
    .map(() => Symbol(color, shape, shade))
    .join("\n");

  return `<div class="card fresh" data-vector="${value}" data-day="${day}">
    ${symbols}\n
    <span class="tooltip">${month} ${day}</span>
    </div>`;
}

const progress: number[][] = JSON.parse(
  localStorage.getItem("setClicks") || "[[],[],[],[],[],[],[],[],[],[],[]]",
);

const initialized: boolean[] = Array(10).fill(false);

let current_board = 0;

function qid(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

function qa(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

// Startup
function createEmptyBoards() {
  const FAKE_CARD = `<div class="card fake"><svg class="symbol" width="18" height="36" viewBox="0 0 200 400"></svg></div>`;
  qid("puzzlecontent").insertAdjacentHTML(
    "beforeend",
    `<div id="taskselect">&bullet; </div>` +
      `<h2 id="boardtitle"></h2>` +
      `<div id="boards"></div>`,
  );
  qid("taskselect").style.textAlign = "center";

  // Set up the boards
  for (let i = 0; i < 10; ++i) {
    const month = i == 2 ? "September" : "July";
    qid("taskselect").insertAdjacentHTML(
      "beforeend",
      `<a href="#${i + 1}" id="${i + 1}">#` + (i + 1) + `</a> &bullet; `,
    );
    qid("boards").insertAdjacentHTML(
      "beforeend",
      `<div id="board${i}" class="board"></div>`,
    );
    // Trigger when board link is clicked
    qid(`${i + 1}`).addEventListener("click", () => {
      current_board = i;
      qa("div.board").forEach((el) => {
        el.style.display = "none";
        el.classList.remove("showing");
      });
      const board = qid(`board${i}`);
      board.style.display = "";
      board.classList.add("showing");
      qid("boardtitle").innerHTML = `Calendar ${i + 1} (${month})`;
      if (!initialized[i]) {
        initialized[i] = true;
        let j = 0; // time delay
        for (const x of progress[i]) {
          j++;
          window.setTimeout(
            () => {
              const card = board.querySelector<HTMLElement>(
                `div.card[data-day="${x}"]`,
              );
              if (card) card.click();
            },
            100 + Math.round(300 * Math.pow(j, 0.6)),
          );
        }
      }
    });
  }

  // Shift and reset button
  qid("taskselect").insertAdjacentHTML(
    "beforeend",
    `<p>&bullet; ` +
      `<a href="javascript:void(0)" id="shift">Shift</a>` +
      ` &bullet; ` +
      `<a href="javascript:void(0)" id="reset">Reset progress</a>` +
      ` &bullet;</p>`,
  );
  qid("shift").addEventListener("click", function () {
    const showing = document.querySelector<HTMLElement>("div.board.showing")!;
    showing.insertAdjacentHTML("afterbegin", FAKE_CARD);
    const fakes = showing.querySelectorAll("div.card.fake");
    if (fakes.length >= 7) {
      fakes.forEach((f) => f.remove());
    }
    showing.querySelectorAll<HTMLElement>("div.card.gotten").forEach((el) => {
      const is_ok = Number(el.getAttribute("data-break")) != fakes.length % 7;
      el.classList.toggle("ok", is_ok);
      el.classList.toggle("bad", !is_ok);
    });
  });
  qid("reset").addEventListener("click", function () {
    if (
      window.confirm(
        "Reset SET progress? This erases all your hard work identifying SETs.",
      )
    ) {
      localStorage.removeItem("setClicks");
      self.location.reload();
    }
  });
}

/* Set up the clicks and set checker */
function finishSetup() {
  qa("div.card.fresh").forEach((card) => {
    card.addEventListener("click", () => {
      if (card.classList.contains("fresh")) {
        card.classList.toggle("selected");
        const selected = qa("div.board.showing > div.card.fresh.selected");

        // Check if they form a tromino set
        if (selected.length <= 2) {
          return;
        } else if (selected.length >= 4) {
          selected.forEach((el) => el.classList.remove("selected"));
          card.classList.add("selected");
          return;
        }

        // Get the of the cards indices
        const A = selected[0];
        const B = selected[1];
        const C = selected[2];
        const a = Number(A.getAttribute("data-day"));
        const b = Number(B.getAttribute("data-day"));
        const c = Number(C.getAttribute("data-day"));
        const differences = [Math.abs(a - b), Math.abs(b - c), Math.abs(c - a)];
        if (!differences.includes(1)) return;
        if (!differences.includes(7)) return;
        const u = A.getAttribute("data-vector")!;
        const v = B.getAttribute("data-vector")!;
        const w = C.getAttribute("data-vector")!;
        for (let i = 0; i < 4; ++i) {
          if (
            (Number(u.slice(i, i + 1)) +
              Number(v.slice(i, i + 1)) +
              Number(w.slice(i, i + 1))) %
              3 !=
            0
          ) {
            return;
          }
        }

        // this is a valid Set, let's store it for future reference
        function addToProgress(n: number) {
          if (!progress[current_board].includes(n)) {
            progress[current_board].push(n);
          }
        }
        addToProgress(Number(A.getAttribute("data-day")));
        addToProgress(Number(B.getAttribute("data-day")));
        addToProgress(Number(C.getAttribute("data-day")));
        localStorage.setItem("setClicks", JSON.stringify(progress));

        // get the bad offset thing
        const x = Math.min(a % 7, b % 7, c % 7);
        const y = Math.max(a % 7, b % 7, c % 7);
        const breakpoint = x == 0 && y == 6 ? 1 : (7 - x) % 7;

        const fakes = document.querySelectorAll(
          "div.board.showing > div.card.fake",
        );
        const offset = fakes.length;

        const now = Date.now();
        selected.forEach((el) => {
          el.classList.remove("selected");
          el.classList.remove("fresh");
          el.classList.add(
            ...(breakpoint != offset ? ["gotten", "ok"] : ["gotten", "bad"]),
          );
          el.setAttribute("data-break", String(breakpoint));
          el.setAttribute("data-when", String(now));
        });
        const gotten = document.querySelectorAll(
          "div.board.showing > div.card.gotten",
        );
        if (gotten.length == 24) {
          qa("div.board.showing > div.card.fresh").forEach((el) =>
            el.classList.remove("fresh"),
          );
        }
      }
    });
  });

  function getFriends(el: HTMLElement): HTMLElement[] {
    if (el.classList.contains("gotten")) {
      const when = el.getAttribute("data-when");
      return Array.from(
        document.querySelectorAll<HTMLElement>(
          `div.board.showing > div.card.gotten[data-when="${when}"]`,
        ),
      );
    } else {
      return [];
    }
  }

  qa("div.card.fresh").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      getFriends(card).forEach((el) => el.classList.add("highlight"));
    });
    card.addEventListener("mouseleave", () => {
      getFriends(card).forEach((el) => el.classList.remove("highlight"));
    });
  });

  qa("div.board").forEach((el) => {
    el.style.display = "none";
  });
  if (window.location.hash) {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.click();
      target.scrollIntoView(true);
    }
  }
}

// Board data (formerly site/static/2021/set/puzzle.js)
document.addEventListener("DOMContentLoaded", () => {
  createEmptyBoards();
  qid("board0").insertAdjacentHTML("beforeend", SetCard("1201", "July", 1));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0111", "July", 2));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0201", "July", 3));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2121", "July", 4));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("1001", "July", 5));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("1100", "July", 6));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0212", "July", 7));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2022", "July", 8));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0021", "July", 9));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0121", "July", 10));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2200", "July", 11));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0102", "July", 12));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2021", "July", 13));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2102", "July", 14));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0020", "July", 15));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("1021", "July", 16));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2210", "July", 17));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("1002", "July", 18));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0000", "July", 19));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0220", "July", 20));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0100", "July", 21));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2220", "July", 22));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0011", "July", 23));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("1010", "July", 24));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0211", "July", 25));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0122", "July", 26));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2110", "July", 27));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("0010", "July", 28));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2001", "July", 29));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("2112", "July", 30));
  qid("board0").insertAdjacentHTML("beforeend", SetCard("1212", "July", 31));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2201", "July", 1));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2210", "July", 2));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("0200", "July", 3));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1121", "July", 4));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1110", "July", 5));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("0010", "July", 6));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2200", "July", 7));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1201", "July", 8));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("0201", "July", 9));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2012", "July", 10));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1221", "July", 11));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1002", "July", 12));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2100", "July", 13));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1120", "July", 14));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("0012", "July", 15));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1210", "July", 16));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1222", "July", 17));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2101", "July", 18));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2112", "July", 19));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("0021", "July", 20));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2011", "July", 21));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2111", "July", 22));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1102", "July", 23));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2020", "July", 24));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("0121", "July", 25));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("1101", "July", 26));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2211", "July", 27));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2120", "July", 28));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2021", "July", 29));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("0210", "July", 30));
  qid("board1").insertAdjacentHTML("beforeend", SetCard("2001", "July", 31));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("0002", "Sept", 1));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("2102", "Sept", 2));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1221", "Sept", 3));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("0201", "Sept", 4));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("2020", "Sept", 5));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1211", "Sept", 6));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("0020", "Sept", 7));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1202", "Sept", 8));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("0221", "Sept", 9));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("2021", "Sept", 10));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1101", "Sept", 11));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1112", "Sept", 12));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1012", "Sept", 13));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1110", "Sept", 14));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1020", "Sept", 15));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1011", "Sept", 16));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1212", "Sept", 17));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("0100", "Sept", 18));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1000", "Sept", 19));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("2211", "Sept", 20));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("2100", "Sept", 21));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1002", "Sept", 22));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1021", "Sept", 23));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1111", "Sept", 24));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("2011", "Sept", 25));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("0022", "Sept", 26));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("0110", "Sept", 27));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1120", "Sept", 28));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("2121", "Sept", 29));
  qid("board2").insertAdjacentHTML("beforeend", SetCard("1201", "Sept", 30));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1121", "July", 1));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0012", "July", 2));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0112", "July", 3));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0000", "July", 4));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2011", "July", 5));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2022", "July", 6));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1002", "July", 7));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1011", "July", 8));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2010", "July", 9));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0100", "July", 10));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0200", "July", 11));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1120", "July", 12));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0202", "July", 13));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1212", "July", 14));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1122", "July", 15));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2120", "July", 16));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0020", "July", 17));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2200", "July", 18));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2221", "July", 19));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2201", "July", 20));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0201", "July", 21));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1222", "July", 22));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1220", "July", 23));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0022", "July", 24));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1111", "July", 25));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2020", "July", 26));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2112", "July", 27));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2001", "July", 28));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("0110", "July", 29));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("1001", "July", 30));
  qid("board3").insertAdjacentHTML("beforeend", SetCard("2111", "July", 31));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1221", "July", 1));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1101", "July", 2));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1120", "July", 3));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2210", "July", 4));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0122", "July", 5));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0001", "July", 6));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2211", "July", 7));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0201", "July", 8));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2220", "July", 9));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0020", "July", 10));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0021", "July", 11));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1210", "July", 12));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2001", "July", 13));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2202", "July", 14));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2022", "July", 15));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0102", "July", 16));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1121", "July", 17));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0100", "July", 18));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0212", "July", 19));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1201", "July", 20));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2112", "July", 21));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1012", "July", 22));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2100", "July", 23));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2110", "July", 24));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1022", "July", 25));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0121", "July", 26));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("2120", "July", 27));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0012", "July", 28));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("0010", "July", 29));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1220", "July", 30));
  qid("board4").insertAdjacentHTML("beforeend", SetCard("1110", "July", 31));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2101", "July", 1));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("0220", "July", 2));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2212", "July", 3));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2122", "July", 4));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2020", "July", 5));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("0212", "July", 6));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1011", "July", 7));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("0211", "July", 8));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1012", "July", 9));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1202", "July", 10));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2002", "July", 11));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1112", "July", 12));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2021", "July", 13));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1220", "July", 14));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2202", "July", 15));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("0002", "July", 16));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1021", "July", 17));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1110", "July", 18));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("0102", "July", 19));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("0200", "July", 20));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1100", "July", 21));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1001", "July", 22));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2120", "July", 23));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1211", "July", 24));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1102", "July", 25));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2102", "July", 26));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2001", "July", 27));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1210", "July", 28));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1020", "July", 29));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("2022", "July", 30));
  qid("board5").insertAdjacentHTML("beforeend", SetCard("1200", "July", 31));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0202", "July", 1));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("1202", "July", 2));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2022", "July", 3));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("1001", "July", 4));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2211", "July", 5));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2202", "July", 6));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("1122", "July", 7));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2012", "July", 8));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2101", "July", 9));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0112", "July", 10));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2121", "July", 11));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0121", "July", 12));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("1222", "July", 13));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2110", "July", 14));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("1112", "July", 15));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2120", "July", 16));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2112", "July", 17));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2200", "July", 18));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0010", "July", 19));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0220", "July", 20));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0012", "July", 21));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0111", "July", 22));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2100", "July", 23));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2111", "July", 24));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0001", "July", 25));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("1102", "July", 26));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0021", "July", 27));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("0122", "July", 28));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2001", "July", 29));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("1212", "July", 30));
  qid("board6").insertAdjacentHTML("beforeend", SetCard("2122", "July", 31));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1120", "July", 1));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2212", "July", 2));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0201", "July", 3));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2002", "July", 4));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1212", "July", 5));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0121", "July", 6));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0111", "July", 7));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2120", "July", 8));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2001", "July", 9));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2110", "July", 10));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0001", "July", 11));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2221", "July", 12));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0200", "July", 13));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0220", "July", 14));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0002", "July", 15));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2022", "July", 16));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2201", "July", 17));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2121", "July", 18));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1211", "July", 19));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1220", "July", 20));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1210", "July", 21));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1202", "July", 22));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2100", "July", 23));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1121", "July", 24));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1200", "July", 25));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1101", "July", 26));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0011", "July", 27));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2102", "July", 28));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("1221", "July", 29));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("2010", "July", 30));
  qid("board7").insertAdjacentHTML("beforeend", SetCard("0202", "July", 31));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2012", "July", 1));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0110", "July", 2));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2000", "July", 3));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2002", "July", 4));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1121", "July", 5));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1000", "July", 6));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1100", "July", 7));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1211", "July", 8));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1001", "July", 9));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1002", "July", 10));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0001", "July", 11));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0210", "July", 12));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1200", "July", 13));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1021", "July", 14));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2022", "July", 15));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1102", "July", 16));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0020", "July", 17));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("1210", "July", 18));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0200", "July", 19));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0212", "July", 20));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2100", "July", 21));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0221", "July", 22));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0201", "July", 23));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2211", "July", 24));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2111", "July", 25));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0012", "July", 26));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2001", "July", 27));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0111", "July", 28));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0121", "July", 29));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("0021", "July", 30));
  qid("board8").insertAdjacentHTML("beforeend", SetCard("2110", "July", 31));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1021", "July", 1));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1011", "July", 2));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0102", "July", 3));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0222", "July", 4));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1201", "July", 5));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1121", "July", 6));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2011", "July", 7));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2112", "July", 8));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0200", "July", 9));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2220", "July", 10));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2210", "July", 11));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0121", "July", 12));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0201", "July", 13));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1102", "July", 14));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2000", "July", 15));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1020", "July", 16));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1202", "July", 17));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2101", "July", 18));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1212", "July", 19));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2020", "July", 20));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1122", "July", 21));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0010", "July", 22));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0011", "July", 23));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("1001", "July", 24));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2122", "July", 25));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2110", "July", 26));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2021", "July", 27));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0220", "July", 28));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0120", "July", 29));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("0211", "July", 30));
  qid("board9").insertAdjacentHTML("beforeend", SetCard("2121", "July", 31));
  finishSetup();
});
