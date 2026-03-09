/**
 * For any image whose src ends in -sm.png or -sm.jpg, inject a
 * "Download full-resolution artwork" link below the image.
 *
 * The full-res URL is derived by stripping the "-sm" infix, e.g.
 *   /static/2021/map-sm.png  →  /static/2021/map.png
 *
 * A generous top-margin on the injected element keeps it clear of
 * the glow animation that surrounds clickable "proceed" images.
 */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("img").forEach(function (img) {
    const src = img.getAttribute("src") || "";
    if (!/-sm\.(png|jpg)$/.test(src)) return;

    const fullSrc = src.replace(/-sm(\.(png|jpg))$/, "$1");

    // If the image is wrapped in an <a>, insert after the anchor so the
    // download link sits outside the clickable / glowing element.
    const anchor =
      img.parentElement && img.parentElement.tagName === "A"
        ? img.parentElement
        : null;
    const insertAfter: Element = anchor ?? img;

    const wrapper = document.createElement("p");
    wrapper.className = "fullres-download";

    const link = document.createElement("a");
    link.href = fullSrc;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Download full-resolution artwork";

    wrapper.appendChild(link);
    insertAfter.parentNode?.insertBefore(wrapper, insertAfter.nextSibling);
  });
});
