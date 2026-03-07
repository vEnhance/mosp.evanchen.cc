// Zoom Network Park — archival replacement for zoom.js
// Replaces the original jQuery-based implementation with vanilla JS.
// Behavior: when browser zoom level exceeds 125% relative to initial DPR,
// fade out the email and reveal a hidden grid payload.

document.addEventListener("DOMContentLoaded", function () {
  const ZOOMDIV = "z";
  const EMAILDIV = "email";

  function getIndices(arr: number[], val: number): number[] {
    const indexes: number[] = [];
    for (let i = 0; i < arr.length; i++) if (arr[i] === val) indexes.push(i + 1);
    return indexes;
  }

  const extraction = [
    8 + 21,
    21,
    17 + 21,
    4 + 21,
    5 + 21,
    10,
    15,
    3,
    12,
    18 + 21,
    9 + 21,
    13,
  ];

  let has_appended_payload = false;
  let finished_zooming = false;
  const places: string[] = Array.from({ length: 43 }).map(() => "?");
  places[0] = "X"; // pretend array is 1-indexed
  places[1] = "L";
  places[21] = "K";
  places[22] = "E";
  places[42] = "F";
  const init_dpr = window.devicePixelRatio;

  window.addEventListener("resize", function () {
    const STARTING = 125;
    const TARGET = 200;
    const zoom = Math.round((window.devicePixelRatio / init_dpr) * 100);

    if (zoom > STARTING && !has_appended_payload) {
      const emailDiv = document.getElementById(EMAILDIV);
      if (emailDiv) {
        let h = "";
        for (let r = 0; r < 6; ++r) {
          if (r === 0) h += places[21];
          else if (r === 3) h += places[42];
          else h += " ";
          for (let i = 7 * r + 1; i <= 7 * r + 7; ++i) {
            h += " ==> ";
            h += places[i];
          }
          h += "\n ";
          for (let i = 7 * r + 1; i <= 7 * r + 7; ++i) {
            const indices = getIndices(extraction, i);
            if (indices.length > 0) {
              const s = indices.join(",");
              h += s.length <= 2 ? s.padStart(3, " ") + "   " : s.padStart(4, " ") + "  ";
            } else {
              h += "      ";
            }
          }
          h += "\n";
          if (r === 2) h += "\n";
        }

        const zoomDiv = document.createElement("div");
        zoomDiv.id = ZOOMDIV;
        zoomDiv.textContent = h;
        zoomDiv.style.position = "absolute";
        zoomDiv.style.top = "60px";
        zoomDiv.style.fontSize = "18pt";
        zoomDiv.style.whiteSpace = "pre";
        zoomDiv.style.fontFamily = "monospace";
        emailDiv.appendChild(zoomDiv);
        has_appended_payload = true;
      }
    }

    if (!finished_zooming && zoom > STARTING) {
      let k = (zoom - STARTING) / (TARGET - STARTING);
      if (k < 0) k = 0;
      if (k > 1) k = 1;
      k = Math.sqrt(k);
      const zoomDiv = document.getElementById(ZOOMDIV);
      if (zoomDiv) zoomDiv.style.opacity = String(k);
      const invDiv = document.getElementById("invitation");
      if (invDiv) invDiv.style.opacity = String(1 - k);
    }

    if (zoom >= TARGET) finished_zooming = true;
  });
});
