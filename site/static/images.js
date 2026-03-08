// Wrap every thumbnail (-sm. images) in an img-link anchor that opens the
// full-resolution image in a new tab on click. This reuses the existing
// glow-blue / glow-yellow CSS animations defined for a.img-link.
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('img[src*="-sm."]').forEach(function (img) {
    var fullSrc = img.src.replace(/-sm\./, ".");
    var link = document.createElement("a");
    link.href = fullSrc;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "img-link";
    img.parentNode.insertBefore(link, img);
    link.appendChild(img);
  });
});
