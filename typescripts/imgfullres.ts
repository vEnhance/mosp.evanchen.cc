/**
 * For block-level images (an <img> whose parent <p> contains only that image):
 *
 * 1. If the image has a non-empty alt attribute, inject a
 *    <p class="img-caption"> with the alt text *above* the image paragraph.
 *
 * 2. If the image src is under /static/thumbnails/, also inject a
 *    <p class="fullres-download"> with a button-style link *below* the image
 *    that opens the full-resolution version in a new tab.  The full-res URL
 *    is derived by replacing /thumbnails/ with /artwork/:
 *      /static/thumbnails/map.png  →  /static/artwork/map.png
 *
 * Images with class "signature" are treated as decorative and skipped.
 */
document.addEventListener("DOMContentLoaded", function () {
  /** True if el is the only non-whitespace child of parent. */
  function isOnlyChild(el: Element, parent: Element): boolean {
    for (const node of Array.from(parent.childNodes)) {
      if (node === el) continue;
      if (
        node.nodeType === Node.TEXT_NODE &&
        (node.textContent ?? "").trim() === ""
      )
        continue;
      return false;
    }
    return true;
  }

  document.querySelectorAll("img").forEach(function (img) {
    // Skip explicitly decorative images.
    if (img.classList.contains("signature")) return;

    const src = img.getAttribute("src") ?? "";
    const alt = (img.getAttribute("alt") ?? "").trim();

    // If the image is wrapped in an <a>, treat the anchor as the block element.
    const anchor: Element | null =
      img.parentElement?.tagName === "A" ? img.parentElement : null;
    const blockEl: Element = anchor ?? img;
    const blockParent = blockEl.parentElement;

    // Only handle block-level images (lone child of a <p>).
    if (!blockParent || blockParent.tagName !== "P") return;
    if (!isOnlyChild(blockEl, blockParent)) return;

    const containerParent = blockParent.parentNode;
    if (!containerParent) return;

    // Caption goes BEFORE the image paragraph.
    if (alt) {
      const caption = document.createElement("p");
      caption.className = "img-caption";
      caption.textContent = alt;
      containerParent.insertBefore(caption, blockParent);
    }

    // Download button goes AFTER the image paragraph.
    if (src.includes("/static/thumbnails/")) {
      const fullSrc = src.replace("/static/thumbnails/", "/static/artwork/");
      const wrapper = document.createElement("p");
      wrapper.className = "fullres-download";
      const link = document.createElement("a");
      link.href = fullSrc;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Download full-resolution artwork";
      wrapper.appendChild(link);
      containerParent.insertBefore(wrapper, blockParent.nextSibling);
    }
  });
});
