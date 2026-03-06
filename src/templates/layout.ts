/** Base HTML layout shared by all pages. */

export interface LayoutOptions {
  title: string;
  /** Breadcrumb / back navigation HTML */
  backNav?: string;
  /** Extra content for <head> (scripts, styles) */
  extraHead?: string;
  /** Page body content */
  content: string;
  /** Root-relative path prefix, e.g. "../../" for deeply nested pages */
  rootPrefix?: string;
}

export function layout(opts: LayoutOptions): string {
  const root = opts.rootPrefix ?? "";
  const title = opts.title ? `${opts.title} | MOSP Archive` : "MOSP Archive";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${root}static/style.css" />
  ${opts.extraHead ?? ""}
</head>
<body>
  <header class="site-header">
    <nav class="site-nav">
      ${opts.backNav ? `<span class="back-nav">${opts.backNav}</span>` : ""}
      <a class="site-title" href="${root}index.html">MOSP Archive</a>
    </nav>
  </header>
  <main class="site-main">
    ${opts.content}
  </main>
  <footer class="site-footer">
    <p>MOSP Puzzle Hunt Archive &mdash; <a href="${root}index.html">Home</a></p>
  </footer>
</body>
</html>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
