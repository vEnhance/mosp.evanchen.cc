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

declare const Swal: { fire: (...args: unknown[]) => Promise<unknown> };

function SetCard(value: string, month: string, day: number): string {
  // dark theme
  const theme = {
    palette: {
      type: "dark",
      primary: {
        light: "#c5cae9",
        main: "#8c9eff",
        dark: "#536dfe",
      },
      secondary: {
        light: "#ff80ac",
        main: "#ff4284",
        dark: "#c51162",
      },
      action: {
        hover: "#363636",
      },
      success: {
        light: "#81c784",
        main: "#a5d6a7",
        dark: "#82c483",
      },
      background: {
        panel: "#303030",
        paper: "#262626",
        default: "#161616",
      },
    },
    input: {
      textColor: "#fff",
      caretColor: "#fff",
      background: "#262626",
    },
    pie: {
      noGames: "#rgba(0, 0, 0, 0.12)",
    },
    setCard: {
      purple: "#ff47ff",
      green: "#00b803",
      red: "#ffb047",
      background: "#404040",
    },
    profileTable: {
      row: "#282828",
    },
    setFoundEntry: "rgba(130, 170, 100, 0.15)",
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

// Startup
function createEmptyBoards() {
  const FAKE_CARD = `<div class="card fake"><svg class="symbol" width="18" height="36" viewBox="0 0 200 400"></svg></div>`;
  $("#puzzlecontent").append(
    `<div id="taskselect">&bullet; </div>` +
      `<h2 id="boardtitle"></h2>` +
      `<div id="boards"></div>`,
  );
  $("#taskselect").css("text-align", "center");

  // Set up the boards
  for (let i = 0; i < 10; ++i) {
    const month = i == 2 ? "September" : "July";
    $("#taskselect").append(
      `<a href="#${i + 1}" id="${i + 1}">#` + (i + 1) + `</a> &bullet; `,
    );
    $("#boards").append(`<div id="board${i}" class="board"></div>`);
    // Trigger when board link is clicked
    $(`#${i + 1}`).on("click", () => {
      current_board = i;
      $("div.board").hide().removeClass("showing");
      $(`#board${i}`).show().addClass("showing");
      $("#boardtitle").html(`Calendar ${i + 1} (${month})`);
      if (!initialized[i]) {
        initialized[i] = true;
        let j = 0; // time delay
        for (const x of progress[i]) {
          j++;
          window.setTimeout(
            () => {
              $(`#board${i} > div.card[data-day=${x}]`).trigger("click");
            },
            100 + Math.round(300 * Math.pow(j, 0.6)),
          );
        }
      }
    });
  }

  // Shift and reset button
  $("#taskselect").append(
    `<p>&bullet; ` +
      `<a href="javascript:void(0)" id="shift">Shift</a>` +
      ` &bullet; ` +
      `<a href="javascript:void(0)" id="reset">Reset progress</a>` +
      ` &bullet;</p>`,
  );
  $("#shift").on("click ", function () {
    $("div.board.showing").prepend(FAKE_CARD);
    const fakes = $("div.board.showing > div.card.fake");
    if (fakes.length >= 7) {
      fakes.remove();
    }
    $("div.board.showing > div.card.gotten").each(function () {
      const is_ok = Number($(this).attr("data-break")) != fakes.length % 7;
      $(this).toggleClass("ok", is_ok);
      $(this).toggleClass("bad", !is_ok);
    });
  });
  $("#reset").on("click ", function () {
    Swal.fire({
      title: "Are you sure?",
      text: "This erases all your hard work identifying SET's.",
      icon: "warning",
      confirmButtonText: "Reset SET progress.",
      cancelButtonText: "Abort!",
      showCancelButton: true,
      reverseButtons: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        localStorage.removeItem("setClicks");
        self.location.reload();
      }
    });
  });
}

/* Set up the clicks and set checker */
function finishSetup() {
  $("div.card.fresh").on("click", function () {
    if ($(this).hasClass("fresh")) {
      $(this).toggleClass("selected");
      const selected = $("div.board.showing > div.card.fresh.selected");

      // Check if they form a tromino set
      if (selected.length <= 2) {
        return;
      } else if (selected.length >= 4) {
        selected.removeClass("selected");
        $(this).addClass("selected");
        return;
      }

      // Get the of the cards indices
      const A = selected.eq(0);
      const B = selected.eq(1);
      const C = selected.eq(2);
      const a = Number(A.attr("data-day"));
      const b = Number(B.attr("data-day"));
      const c = Number(C.attr("data-day"));
      const differences = [Math.abs(a - b), Math.abs(b - c), Math.abs(c - a)];
      if (!differences.includes(1)) return;
      if (!differences.includes(7)) return;
      const u = A.attr("data-vector")!;
      const v = B.attr("data-vector")!;
      const w = C.attr("data-vector")!;
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
      addToProgress(Number(A.attr("data-day")));
      addToProgress(Number(B.attr("data-day")));
      addToProgress(Number(C.attr("data-day")));
      localStorage.setItem("setClicks", JSON.stringify(progress));

      // get the bad offset thing
      const x = Math.min(a % 7, b % 7, c % 7);
      const y = Math.max(a % 7, b % 7, c % 7);
      const breakpoint = x == 0 && y == 6 ? 1 : (7 - x) % 7;

      const fakes = $("div.board.showing > div.card.fake");
      const offset = fakes.length;

      const now = Date.now();
      selected.each(function () {
        $(this).removeClass("selected");
        $(this).removeClass("fresh");
        $(this).addClass(breakpoint != offset ? "gotten ok" : "gotten bad");
        $(this).attr("data-break", breakpoint);
        $(this).attr("data-when", now);
      });
      const gotten = $("div.board.showing > div.card.gotten");
      if (gotten.length == 24) {
        const leftover = $("div.board.showing > div.card.fresh");
        leftover.removeClass("fresh");
      }
    }
  });
  function getFriends(el: JQuery) {
    if ($(el).hasClass("gotten")) {
      const when = $(el).attr("data-when");
      return $(`div.board.showing > div.card.gotten[data-when=${when}]`);
    } else {
      return $(); // none
    }
  }
  $("div.card.fresh").on("mouseenter", function (this: HTMLElement) {
    getFriends($(this)).addClass("highlight");
  });
  $("div.card.fresh").on("mouseleave", function (this: HTMLElement) {
    getFriends($(this)).removeClass("highlight");
  });
  $("div.board").hide();
  if (window.location.hash) {
    $(window.location.hash).trigger("click");
    $(window.location.hash)[0].scrollIntoView(true);
  }
}

// Board data (formerly site/static/2021/set/puzzle.js)
$(document).ready(function () {
  createEmptyBoards();
  $("#board0").append(SetCard("1201", "July", 1));
  $("#board0").append(SetCard("0111", "July", 2));
  $("#board0").append(SetCard("0201", "July", 3));
  $("#board0").append(SetCard("2121", "July", 4));
  $("#board0").append(SetCard("1001", "July", 5));
  $("#board0").append(SetCard("1100", "July", 6));
  $("#board0").append(SetCard("0212", "July", 7));
  $("#board0").append(SetCard("2022", "July", 8));
  $("#board0").append(SetCard("0021", "July", 9));
  $("#board0").append(SetCard("0121", "July", 10));
  $("#board0").append(SetCard("2200", "July", 11));
  $("#board0").append(SetCard("0102", "July", 12));
  $("#board0").append(SetCard("2021", "July", 13));
  $("#board0").append(SetCard("2102", "July", 14));
  $("#board0").append(SetCard("0020", "July", 15));
  $("#board0").append(SetCard("1021", "July", 16));
  $("#board0").append(SetCard("2210", "July", 17));
  $("#board0").append(SetCard("1002", "July", 18));
  $("#board0").append(SetCard("0000", "July", 19));
  $("#board0").append(SetCard("0220", "July", 20));
  $("#board0").append(SetCard("0100", "July", 21));
  $("#board0").append(SetCard("2220", "July", 22));
  $("#board0").append(SetCard("0011", "July", 23));
  $("#board0").append(SetCard("1010", "July", 24));
  $("#board0").append(SetCard("0211", "July", 25));
  $("#board0").append(SetCard("0122", "July", 26));
  $("#board0").append(SetCard("2110", "July", 27));
  $("#board0").append(SetCard("0010", "July", 28));
  $("#board0").append(SetCard("2001", "July", 29));
  $("#board0").append(SetCard("2112", "July", 30));
  $("#board0").append(SetCard("1212", "July", 31));
  $("#board1").append(SetCard("2201", "July", 1));
  $("#board1").append(SetCard("2210", "July", 2));
  $("#board1").append(SetCard("0200", "July", 3));
  $("#board1").append(SetCard("1121", "July", 4));
  $("#board1").append(SetCard("1110", "July", 5));
  $("#board1").append(SetCard("0010", "July", 6));
  $("#board1").append(SetCard("2200", "July", 7));
  $("#board1").append(SetCard("1201", "July", 8));
  $("#board1").append(SetCard("0201", "July", 9));
  $("#board1").append(SetCard("2012", "July", 10));
  $("#board1").append(SetCard("1221", "July", 11));
  $("#board1").append(SetCard("1002", "July", 12));
  $("#board1").append(SetCard("2100", "July", 13));
  $("#board1").append(SetCard("1120", "July", 14));
  $("#board1").append(SetCard("0012", "July", 15));
  $("#board1").append(SetCard("1210", "July", 16));
  $("#board1").append(SetCard("1222", "July", 17));
  $("#board1").append(SetCard("2101", "July", 18));
  $("#board1").append(SetCard("2112", "July", 19));
  $("#board1").append(SetCard("0021", "July", 20));
  $("#board1").append(SetCard("2011", "July", 21));
  $("#board1").append(SetCard("2111", "July", 22));
  $("#board1").append(SetCard("1102", "July", 23));
  $("#board1").append(SetCard("2020", "July", 24));
  $("#board1").append(SetCard("0121", "July", 25));
  $("#board1").append(SetCard("1101", "July", 26));
  $("#board1").append(SetCard("2211", "July", 27));
  $("#board1").append(SetCard("2120", "July", 28));
  $("#board1").append(SetCard("2021", "July", 29));
  $("#board1").append(SetCard("0210", "July", 30));
  $("#board1").append(SetCard("2001", "July", 31));
  $("#board2").append(SetCard("0002", "Sept", 1));
  $("#board2").append(SetCard("2102", "Sept", 2));
  $("#board2").append(SetCard("1221", "Sept", 3));
  $("#board2").append(SetCard("0201", "Sept", 4));
  $("#board2").append(SetCard("2020", "Sept", 5));
  $("#board2").append(SetCard("1211", "Sept", 6));
  $("#board2").append(SetCard("0020", "Sept", 7));
  $("#board2").append(SetCard("1202", "Sept", 8));
  $("#board2").append(SetCard("0221", "Sept", 9));
  $("#board2").append(SetCard("2021", "Sept", 10));
  $("#board2").append(SetCard("1101", "Sept", 11));
  $("#board2").append(SetCard("1112", "Sept", 12));
  $("#board2").append(SetCard("1012", "Sept", 13));
  $("#board2").append(SetCard("1110", "Sept", 14));
  $("#board2").append(SetCard("1020", "Sept", 15));
  $("#board2").append(SetCard("1011", "Sept", 16));
  $("#board2").append(SetCard("1212", "Sept", 17));
  $("#board2").append(SetCard("0100", "Sept", 18));
  $("#board2").append(SetCard("1000", "Sept", 19));
  $("#board2").append(SetCard("2211", "Sept", 20));
  $("#board2").append(SetCard("2100", "Sept", 21));
  $("#board2").append(SetCard("1002", "Sept", 22));
  $("#board2").append(SetCard("1021", "Sept", 23));
  $("#board2").append(SetCard("1111", "Sept", 24));
  $("#board2").append(SetCard("2011", "Sept", 25));
  $("#board2").append(SetCard("0022", "Sept", 26));
  $("#board2").append(SetCard("0110", "Sept", 27));
  $("#board2").append(SetCard("1120", "Sept", 28));
  $("#board2").append(SetCard("2121", "Sept", 29));
  $("#board2").append(SetCard("1201", "Sept", 30));
  $("#board3").append(SetCard("1121", "July", 1));
  $("#board3").append(SetCard("0012", "July", 2));
  $("#board3").append(SetCard("0112", "July", 3));
  $("#board3").append(SetCard("0000", "July", 4));
  $("#board3").append(SetCard("2011", "July", 5));
  $("#board3").append(SetCard("2022", "July", 6));
  $("#board3").append(SetCard("1002", "July", 7));
  $("#board3").append(SetCard("1011", "July", 8));
  $("#board3").append(SetCard("2010", "July", 9));
  $("#board3").append(SetCard("0100", "July", 10));
  $("#board3").append(SetCard("0200", "July", 11));
  $("#board3").append(SetCard("1120", "July", 12));
  $("#board3").append(SetCard("0202", "July", 13));
  $("#board3").append(SetCard("1212", "July", 14));
  $("#board3").append(SetCard("1122", "July", 15));
  $("#board3").append(SetCard("2120", "July", 16));
  $("#board3").append(SetCard("0020", "July", 17));
  $("#board3").append(SetCard("2200", "July", 18));
  $("#board3").append(SetCard("2221", "July", 19));
  $("#board3").append(SetCard("2201", "July", 20));
  $("#board3").append(SetCard("0201", "July", 21));
  $("#board3").append(SetCard("1222", "July", 22));
  $("#board3").append(SetCard("1220", "July", 23));
  $("#board3").append(SetCard("0022", "July", 24));
  $("#board3").append(SetCard("1111", "July", 25));
  $("#board3").append(SetCard("2020", "July", 26));
  $("#board3").append(SetCard("2112", "July", 27));
  $("#board3").append(SetCard("2001", "July", 28));
  $("#board3").append(SetCard("0110", "July", 29));
  $("#board3").append(SetCard("1001", "July", 30));
  $("#board3").append(SetCard("2111", "July", 31));
  $("#board4").append(SetCard("1221", "July", 1));
  $("#board4").append(SetCard("1101", "July", 2));
  $("#board4").append(SetCard("1120", "July", 3));
  $("#board4").append(SetCard("2210", "July", 4));
  $("#board4").append(SetCard("0122", "July", 5));
  $("#board4").append(SetCard("0001", "July", 6));
  $("#board4").append(SetCard("2211", "July", 7));
  $("#board4").append(SetCard("0201", "July", 8));
  $("#board4").append(SetCard("2220", "July", 9));
  $("#board4").append(SetCard("0020", "July", 10));
  $("#board4").append(SetCard("0021", "July", 11));
  $("#board4").append(SetCard("1210", "July", 12));
  $("#board4").append(SetCard("2001", "July", 13));
  $("#board4").append(SetCard("2202", "July", 14));
  $("#board4").append(SetCard("2022", "July", 15));
  $("#board4").append(SetCard("0102", "July", 16));
  $("#board4").append(SetCard("1121", "July", 17));
  $("#board4").append(SetCard("0100", "July", 18));
  $("#board4").append(SetCard("0212", "July", 19));
  $("#board4").append(SetCard("1201", "July", 20));
  $("#board4").append(SetCard("2112", "July", 21));
  $("#board4").append(SetCard("1012", "July", 22));
  $("#board4").append(SetCard("2100", "July", 23));
  $("#board4").append(SetCard("2110", "July", 24));
  $("#board4").append(SetCard("1022", "July", 25));
  $("#board4").append(SetCard("0121", "July", 26));
  $("#board4").append(SetCard("2120", "July", 27));
  $("#board4").append(SetCard("0012", "July", 28));
  $("#board4").append(SetCard("0010", "July", 29));
  $("#board4").append(SetCard("1220", "July", 30));
  $("#board4").append(SetCard("1110", "July", 31));
  $("#board5").append(SetCard("2101", "July", 1));
  $("#board5").append(SetCard("0220", "July", 2));
  $("#board5").append(SetCard("2212", "July", 3));
  $("#board5").append(SetCard("2122", "July", 4));
  $("#board5").append(SetCard("2020", "July", 5));
  $("#board5").append(SetCard("0212", "July", 6));
  $("#board5").append(SetCard("1011", "July", 7));
  $("#board5").append(SetCard("0211", "July", 8));
  $("#board5").append(SetCard("1012", "July", 9));
  $("#board5").append(SetCard("1202", "July", 10));
  $("#board5").append(SetCard("2002", "July", 11));
  $("#board5").append(SetCard("1112", "July", 12));
  $("#board5").append(SetCard("2021", "July", 13));
  $("#board5").append(SetCard("1220", "July", 14));
  $("#board5").append(SetCard("2202", "July", 15));
  $("#board5").append(SetCard("0002", "July", 16));
  $("#board5").append(SetCard("1021", "July", 17));
  $("#board5").append(SetCard("1110", "July", 18));
  $("#board5").append(SetCard("0102", "July", 19));
  $("#board5").append(SetCard("0200", "July", 20));
  $("#board5").append(SetCard("1100", "July", 21));
  $("#board5").append(SetCard("1001", "July", 22));
  $("#board5").append(SetCard("2120", "July", 23));
  $("#board5").append(SetCard("1211", "July", 24));
  $("#board5").append(SetCard("1102", "July", 25));
  $("#board5").append(SetCard("2102", "July", 26));
  $("#board5").append(SetCard("2001", "July", 27));
  $("#board5").append(SetCard("1210", "July", 28));
  $("#board5").append(SetCard("1020", "July", 29));
  $("#board5").append(SetCard("2022", "July", 30));
  $("#board5").append(SetCard("1200", "July", 31));
  $("#board6").append(SetCard("0202", "July", 1));
  $("#board6").append(SetCard("1202", "July", 2));
  $("#board6").append(SetCard("2022", "July", 3));
  $("#board6").append(SetCard("1001", "July", 4));
  $("#board6").append(SetCard("2211", "July", 5));
  $("#board6").append(SetCard("2202", "July", 6));
  $("#board6").append(SetCard("1122", "July", 7));
  $("#board6").append(SetCard("2012", "July", 8));
  $("#board6").append(SetCard("2101", "July", 9));
  $("#board6").append(SetCard("0112", "July", 10));
  $("#board6").append(SetCard("2121", "July", 11));
  $("#board6").append(SetCard("0121", "July", 12));
  $("#board6").append(SetCard("1222", "July", 13));
  $("#board6").append(SetCard("2110", "July", 14));
  $("#board6").append(SetCard("1112", "July", 15));
  $("#board6").append(SetCard("2120", "July", 16));
  $("#board6").append(SetCard("2112", "July", 17));
  $("#board6").append(SetCard("2200", "July", 18));
  $("#board6").append(SetCard("0010", "July", 19));
  $("#board6").append(SetCard("0220", "July", 20));
  $("#board6").append(SetCard("0012", "July", 21));
  $("#board6").append(SetCard("0111", "July", 22));
  $("#board6").append(SetCard("2100", "July", 23));
  $("#board6").append(SetCard("2111", "July", 24));
  $("#board6").append(SetCard("0001", "July", 25));
  $("#board6").append(SetCard("1102", "July", 26));
  $("#board6").append(SetCard("0021", "July", 27));
  $("#board6").append(SetCard("0122", "July", 28));
  $("#board6").append(SetCard("2001", "July", 29));
  $("#board6").append(SetCard("1212", "July", 30));
  $("#board6").append(SetCard("2122", "July", 31));
  $("#board7").append(SetCard("1120", "July", 1));
  $("#board7").append(SetCard("2212", "July", 2));
  $("#board7").append(SetCard("0201", "July", 3));
  $("#board7").append(SetCard("2002", "July", 4));
  $("#board7").append(SetCard("1212", "July", 5));
  $("#board7").append(SetCard("0121", "July", 6));
  $("#board7").append(SetCard("0111", "July", 7));
  $("#board7").append(SetCard("2120", "July", 8));
  $("#board7").append(SetCard("2001", "July", 9));
  $("#board7").append(SetCard("2110", "July", 10));
  $("#board7").append(SetCard("0001", "July", 11));
  $("#board7").append(SetCard("2221", "July", 12));
  $("#board7").append(SetCard("0200", "July", 13));
  $("#board7").append(SetCard("0220", "July", 14));
  $("#board7").append(SetCard("0002", "July", 15));
  $("#board7").append(SetCard("2022", "July", 16));
  $("#board7").append(SetCard("2201", "July", 17));
  $("#board7").append(SetCard("2121", "July", 18));
  $("#board7").append(SetCard("1211", "July", 19));
  $("#board7").append(SetCard("1220", "July", 20));
  $("#board7").append(SetCard("1210", "July", 21));
  $("#board7").append(SetCard("1202", "July", 22));
  $("#board7").append(SetCard("2100", "July", 23));
  $("#board7").append(SetCard("1121", "July", 24));
  $("#board7").append(SetCard("1200", "July", 25));
  $("#board7").append(SetCard("1101", "July", 26));
  $("#board7").append(SetCard("0011", "July", 27));
  $("#board7").append(SetCard("2102", "July", 28));
  $("#board7").append(SetCard("1221", "July", 29));
  $("#board7").append(SetCard("2010", "July", 30));
  $("#board7").append(SetCard("0202", "July", 31));
  $("#board8").append(SetCard("2012", "July", 1));
  $("#board8").append(SetCard("0110", "July", 2));
  $("#board8").append(SetCard("2000", "July", 3));
  $("#board8").append(SetCard("2002", "July", 4));
  $("#board8").append(SetCard("1121", "July", 5));
  $("#board8").append(SetCard("1000", "July", 6));
  $("#board8").append(SetCard("1100", "July", 7));
  $("#board8").append(SetCard("1211", "July", 8));
  $("#board8").append(SetCard("1001", "July", 9));
  $("#board8").append(SetCard("1002", "July", 10));
  $("#board8").append(SetCard("0001", "July", 11));
  $("#board8").append(SetCard("0210", "July", 12));
  $("#board8").append(SetCard("1200", "July", 13));
  $("#board8").append(SetCard("1021", "July", 14));
  $("#board8").append(SetCard("2022", "July", 15));
  $("#board8").append(SetCard("1102", "July", 16));
  $("#board8").append(SetCard("0020", "July", 17));
  $("#board8").append(SetCard("1210", "July", 18));
  $("#board8").append(SetCard("0200", "July", 19));
  $("#board8").append(SetCard("0212", "July", 20));
  $("#board8").append(SetCard("2100", "July", 21));
  $("#board8").append(SetCard("0221", "July", 22));
  $("#board8").append(SetCard("0201", "July", 23));
  $("#board8").append(SetCard("2211", "July", 24));
  $("#board8").append(SetCard("2111", "July", 25));
  $("#board8").append(SetCard("0012", "July", 26));
  $("#board8").append(SetCard("2001", "July", 27));
  $("#board8").append(SetCard("0111", "July", 28));
  $("#board8").append(SetCard("0121", "July", 29));
  $("#board8").append(SetCard("0021", "July", 30));
  $("#board8").append(SetCard("2110", "July", 31));
  $("#board9").append(SetCard("1021", "July", 1));
  $("#board9").append(SetCard("1011", "July", 2));
  $("#board9").append(SetCard("0102", "July", 3));
  $("#board9").append(SetCard("0222", "July", 4));
  $("#board9").append(SetCard("1201", "July", 5));
  $("#board9").append(SetCard("1121", "July", 6));
  $("#board9").append(SetCard("2011", "July", 7));
  $("#board9").append(SetCard("2112", "July", 8));
  $("#board9").append(SetCard("0200", "July", 9));
  $("#board9").append(SetCard("2220", "July", 10));
  $("#board9").append(SetCard("2210", "July", 11));
  $("#board9").append(SetCard("0121", "July", 12));
  $("#board9").append(SetCard("0201", "July", 13));
  $("#board9").append(SetCard("1102", "July", 14));
  $("#board9").append(SetCard("2000", "July", 15));
  $("#board9").append(SetCard("1020", "July", 16));
  $("#board9").append(SetCard("1202", "July", 17));
  $("#board9").append(SetCard("2101", "July", 18));
  $("#board9").append(SetCard("1212", "July", 19));
  $("#board9").append(SetCard("2020", "July", 20));
  $("#board9").append(SetCard("1122", "July", 21));
  $("#board9").append(SetCard("0010", "July", 22));
  $("#board9").append(SetCard("0011", "July", 23));
  $("#board9").append(SetCard("1001", "July", 24));
  $("#board9").append(SetCard("2122", "July", 25));
  $("#board9").append(SetCard("2110", "July", 26));
  $("#board9").append(SetCard("2021", "July", 27));
  $("#board9").append(SetCard("0220", "July", 28));
  $("#board9").append(SetCard("0120", "July", 29));
  $("#board9").append(SetCard("0211", "July", 30));
  $("#board9").append(SetCard("2121", "July", 31));
  finishSetup();
});
