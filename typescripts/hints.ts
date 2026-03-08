document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll<HTMLElement>(".hint-answer.blurred")
    .forEach((el) => {
      el.addEventListener("click", () => {
        el.classList.remove("blurred");
        el.title = "";
      });
    });
});
