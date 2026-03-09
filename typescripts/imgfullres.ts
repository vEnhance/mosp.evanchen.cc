/**
 * For block-level images (an <img> whose parent <p> contains only that image):
 *
 * 1. If the image has a non-empty alt attribute, inject a
 *    <p class="img-caption"> with the alt text immediately after the
 *    containing <p>.
 *
 * 2. If the image src ends in -sm.png or -sm.jpg, also inject a
 *    <p class="fullres-download"> with a button-style link that opens
 *    the full-resolution version in a new tab.  The full-res URL is
 *    derived by stripping the "-sm" infix:
 *      /static/2021/map-sm.png  →  /static/2021/map.png
 *
 * Images with class "signature" are treated as decorative and skipped.
 *
 * The 2.5rem top-margin on .fullres-download keeps the button clear of
 * the glow animation that surrounds clickable "proceed" images.
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

    // Build list of elements to insert after blockParent, in order.
    const toInsert: HTMLElement[] = [];

    if (alt) {
      const caption = document.createElement("p");
      caption.className = "img-caption";
      caption.textContent = alt;
      toInsert.push(caption);
    }

    if (/-sm\.(png|jpg)$/.test(src)) {
      const fullSrc = src.replace(/-sm(\.(png|jpg))$/, "$1");
      const wrapper = document.createElement("p");
      wrapper.className = "fullres-download";
      const link = document.createElement("a");
      link.href = fullSrc;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Download full-resolution artwork";
      wrapper.appendChild(link);
      toInsert.push(wrapper);
    }

    // Insert all elements after blockParent.  By always inserting before the
    // same reference node (the original next sibling), the first element in
    // toInsert ends up first in the DOM.
    const insertRef = blockParent.nextSibling;
    for (const el of toInsert) {
      containerParent.insertBefore(el, insertRef);
    }
  });
});
