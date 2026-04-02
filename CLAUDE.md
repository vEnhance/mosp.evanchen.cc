## Project overview

This repository builds a **static HTML/CSS/JS archive** of the MOP puzzle hunt
that ran on `mosp.evanchen.cc` in 2021 (Chapter 0–1) and 2022 (Chapter 2).
There is no server; the output is a bucket of files deployable to any static host.

## Key commands

```bash
./build.sh            # compile TypeScript + regenerate HTML (run this after any change)
uv run python serve.py        # build then serve at localhost:8000 with live reload
uv run python serve.py --no-reload   # serve without watching for changes
uv run python generate.py     # regenerate HTML only (no TypeScript compile)
```

`serve.py` watches three directories and rebuilds automatically:

- `typescripts/` (`.ts` changes) → runs `./build.sh` (tsc + generate.py)
- `templates/` or `data/` changes → runs `generate.py` only

## Repository layout

```text
data/
  site.json          # master hunt/round/puzzle/unlockable metadata
  artwork.toml       # gallery entries
  index.md           # homepage text
  puzzles/{slug}/    # per-puzzle markdown files (content, flavor, solution, etc.)
  unlockables/{slug}/intro.md  # story text shown before a round/puzzle unlocks
templates/           # Jinja2 HTML templates
typescripts/         # TypeScript source files (compiled to site/static/js/)
site/
  static/            # checked-in assets (images, PDFs, CSS, pre-built JS)
  *.html / **/*.html # generated — gitignored, rebuilt by generate.py
generate.py          # Python static site generator (Jinja2 + Markdown)
build.sh             # tsc + generate.py
serve.py             # dev server with live reload
pyproject.toml       # Python deps (jinja2, markdown, watchdog for dev)
tsconfig.json        # TypeScript config
```

## Data model (site.json)

Four top-level arrays: `hunts`, `rounds`, `puzzles`, `unlockables`.

- **Hunt** (`volume_number`: `"vol1"` or `"vol2"`): top-level container.
- **Round** (`slug`, `chapter_number`, `unlockable_slug`): a chapter inside a hunt.
- **Puzzle** (`slug`, `unlockable_slug`, `answer`, `hints[]`, ...): one puzzle.
- **Unlockable** (`slug`, `hunt_volume`, `parent_slug`, `round_slug`, `puzzle_slug`,
  `on_solve_link_to`, `sort_order`): the unlock graph node linking puzzles/rounds together.
  An unlockable with `parent_slug=null` and `round_slug` set is a chapter-intro story page.

## Per-puzzle files (`data/puzzles/{slug}/`)

| File              | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `content.md`      | Main puzzle body (rendered as Markdown)                       |
| `flavor.md`       | Flavor/intro text above the puzzle                            |
| `head.html`       | Raw HTML injected into `<head>` (e.g. custom CSS/JS includes) |
| `solution.md`     | Solution write-up                                             |
| `author-notes.md` | Author notes shown after the solution                         |
| `story.md`        | Post-solve story text                                         |

All files are optional; missing files are treated as empty.

## Templates

All templates extend `layout.html`. Key templates:

- `index.html` — homepage listing all hunts
- `vol.html` — volume page (chapter list)
- `chapter.html` — chapter page (puzzle list)
- `puzzle.html` — puzzle page
- `solution.html` — solution page
- `unlockable.html` — story/unlock interstitial page
- `hints.html` — hints page
- `gallery.html` — artwork gallery

## TypeScript modules (`typescripts/`)

| File            | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `grader.ts`     | Client-side answer checker (used on puzzle pages)  |
| `hints.ts`      | Hints toggle UI                                    |
| `imgfullres.ts` | Full-res image lightbox for gallery                |
| `set.ts`        | Set puzzle logic                                   |
| `unlock.ts`     | Unlock/story page transitions                      |
| `zoom.ts`       | Fake Zoom client simulator for "Zoom Network Park" |

TypeScript compiles to `site/static/js/` via `tsconfig.json`.

## Puzzles still depending on external services

Two puzzles link out to external services that still work:

- **Classroom: mtbcupg** → Google Classroom
- **Gradescope: P53GZ7** → Gradescope

These are intentionally left as external links.

## Adding or editing content

- **Edit puzzle text**: modify files in `data/puzzles/{slug}/`, then run `generate.py`.
- **Edit metadata** (answer, title, hints, etc.): edit `data/site.json`, then run `generate.py`.
- **Edit page layout**: modify the relevant template in `templates/`, then run `generate.py`.
- **Edit interactive puzzle logic**: modify the relevant file in `typescripts/`, then run `build.sh`.
- **Add artwork**: add an entry to `data/artwork.toml` and place the image in `site/static/`.

## Deployment

Run `./build.sh` and upload the `site/` directory to the static hosting bucket.
The `site/static/` subdirectory is checked into git; the generated HTML files are not.
