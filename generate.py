#!/usr/bin/env python3
"""
Static site generator for the MOSP archival site.

Usage: python3 generate.py

Reads:
  data/site.json              - structured puzzle/hunt metadata
  data/puzzles/{slug}/*.md    - long-form puzzle and solution text
  static/                     - assets copied verbatim
  assets/2021/                - original puzzle static assets (images, PDFs, CSS)

Writes:
  out/                        - the generated static site
"""

import json
import shutil
import subprocess
import sys
import urllib.parse
from pathlib import Path

import markdown as markdown_lib
from jinja2 import Environment, FileSystemLoader
from markupsafe import Markup

ROOT = Path(__file__).parent
DATA = ROOT / "data"
OUT = ROOT / "out"
ASSETS_2021 = ROOT / "assets" / "2021"
TSC_OUT = ROOT / ".tsc-out"

# ---------------------------------------------------------------------------
# Markdown + Jinja2 setup
# ---------------------------------------------------------------------------

_md = markdown_lib.Markdown(extensions=["extra"])


def render_md(text: str) -> Markup:
    """Render markdown to HTML, returning a Markup so Jinja2 won't re-escape it."""
    if not text:
        return Markup("")
    _md.reset()
    return Markup(_md.convert(text))


env = Environment(
    loader=FileSystemLoader(ROOT / "templates"),
    autoescape=True,
)
env.filters["md"] = render_md
env.filters["urlencode"] = urllib.parse.quote

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------

site = json.loads((DATA / "site.json").read_text())

hunts = {h["pk"]: h for h in site["hunts"]}
rounds = {r["pk"]: r for r in site["rounds"]}
puzzles = {p["pk"]: p for p in site["puzzles"]}
unlockables = {u["pk"]: u for u in site["unlockables"]}

# Populate intro_story_text from markdown files (overrides any value in JSON)
for u in site["unlockables"]:
    intro = (DATA / "unlockables" / u["slug"] / "intro.md")
    if intro.exists():
        u["intro_story_text"] = intro.read_text()

# Build mapping: round_pk → slug of the unlockable that introduces that round
round_intro_slugs: dict[int, str] = {}
for u in site["unlockables"]:
    if u.get("round_pk") and u.get("parent_pk") is None:
        round_intro_slugs[u["round_pk"]] = u["slug"]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def read_puzzle_file(slug: str, filename: str) -> str:
    p = DATA / "puzzles" / slug / filename
    return p.read_text() if p.exists() else ""


def load_puzzle_files(slug: str) -> dict:
    return {
        "content":          read_puzzle_file(slug, "content.md"),
        "flavor_text":      read_puzzle_file(slug, "flavor.md"),
        "puzzle_head":      read_puzzle_file(slug, "head.html"),
        "solution_text":    read_puzzle_file(slug, "solution.md"),
        "author_notes":     read_puzzle_file(slug, "author-notes.md"),
        "post_solve_story": read_puzzle_file(slug, "story.md"),
    }


def hunt_for_round(round_: dict) -> dict | None:
    u = unlockables.get(round_["unlockable_pk"])
    return hunts.get(u["hunt_pk"]) if u else None


def parent_round_for_puzzle(puzzle: dict) -> dict | None:
    u = unlockables.get(puzzle["unlockable_pk"])
    if not u or u.get("parent_pk") is None:
        return None
    # parent_pk is a Round pk (not an Unlockable pk)
    return rounds.get(u["parent_pk"])


def hunt_for_puzzle(puzzle: dict) -> dict | None:
    u = unlockables.get(puzzle["unlockable_pk"])
    return hunts.get(u["hunt_pk"]) if u else None


def hunt_for_unlockable(u: dict) -> dict | None:
    return hunts.get(u.get("hunt_pk"))


def read_unlockable_intro(slug: str) -> str:
    p = DATA / "unlockables" / slug / "intro.md"
    return p.read_text() if p.exists() else ""


def rounds_for_hunt(hunt: dict) -> list[dict]:
    result = []
    for r in site["rounds"]:
        u = unlockables.get(r["unlockable_pk"])
        if u and u["hunt_pk"] == hunt["pk"]:
            result.append(r)
    return sorted(result, key=lambda r: int(r["chapter_number"]))


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    print(f"  wrote {path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# Generate
# ---------------------------------------------------------------------------

print(f"Generating static site into: {OUT}\n")

# 0. Compile puzzle TypeScript (set.ts, zoom.ts) → .tsc-out/
print("Compiling puzzle TypeScript...")
if not (ROOT / "node_modules").exists():
    print("  Running npm install first...")
    subprocess.run(["npm", "install"], cwd=ROOT, check=True)
result = subprocess.run(
    ["npx", "tsc", "--project", str(ROOT / "tsconfig.puzzles.json")],
    cwd=ROOT,
    capture_output=True,
    text=True,
)
if result.returncode != 0:
    print(f"  Warning: tsc failed — puzzle JS will be skipped:\n{result.stderr}", file=sys.stderr)
else:
    print("  OK")

# 1. Static assets from our repo
print("Copying static assets...")
if (ROOT / "static").exists():
    if (OUT / "static").exists():
        shutil.rmtree(OUT / "static")
    shutil.copytree(ROOT / "static", OUT / "static")

# 2. Static assets from assets/2021/ (copied out of the ancient submodule)
if ASSETS_2021.exists():
    print("Copying original puzzle static assets...")
    dest = OUT / "static" / "2021"
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(ASSETS_2021, dest)

    # Overlay compiled JS (set.js, zoom.js) from .tsc-out/ if available.
    for name, sub in [("set.js", "set"), ("zoom.js", "zoom")]:
        compiled = TSC_OUT / name
        if compiled.exists():
            dest_js = dest / sub / name
            dest_js.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(compiled, dest_js)

    # Create -sm aliases for images that are referenced with a -sm suffix
    # but only exist at full size.
    for original, alias in [
        ("map.png", "map-sm.png"),
        ("ch0map.png", "ch0map-sm.png"),
        ("meeting.png", "meeting-sm.png"),
    ]:
        src_img = dest / original
        dst_img = dest / alias
        if src_img.exists() and not dst_img.exists():
            shutil.copy2(src_img, dst_img)

    # Create 2022/ directory with the flipped tromino thumbnail.
    tromino_src = dest / "mosp-tromino.png"
    tromino_2022_dir = OUT / "static" / "2022"
    tromino_2022 = tromino_2022_dir / "mosp-tromino-flipped.png"
    if tromino_src.exists() and not tromino_2022.exists():
        tromino_2022_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(tromino_src, tromino_2022)
else:
    print("  Warning: assets/2021/ not found — skipping puzzle assets")

# 3. Index
print("\nGenerating index...")
write(OUT / "index.html",
      env.get_template("index.html").render(hunts=site["hunts"]))

# 4. Volume pages
print("\nGenerating volume pages...")
for hunt in site["hunts"]:
    write(
        OUT / "vol" / hunt["volume_number"] / "index.html",
        env.get_template("vol.html").render(
            hunt=hunt,
            rounds=rounds_for_hunt(hunt),
            round_intro_slugs=round_intro_slugs,
        ),
    )

# 5. Chapter pages
print("\nGenerating chapter pages...")
for round_ in site["rounds"]:
    hunt = hunt_for_round(round_)
    if not hunt:
        print(f"  Warning: no hunt found for round {round_['slug']}")
        continue
    children = sorted(
        # parent_pk on unlockables is a Round pk, not Unlockable pk
        [u for u in site["unlockables"] if u.get("parent_pk") == round_["pk"]],
        key=lambda u: (u["sort_order"], u["name"]),
    )
    # Find the unlockable whose purpose is introducing this round
    # (round_pk == round pk, parent_pk is None — it's the chapter's own story page)
    round_unlockable = next(
        (u for u in site["unlockables"]
         if u.get("round_pk") == round_["pk"] and u.get("parent_pk") is None),
        None,
    )
    write(
        OUT / "chapter" / round_["slug"] / "index.html",
        env.get_template("chapter.html").render(
            round=round_,
            hunt=hunt,
            children=children,
            puzzles=puzzles,
            round_unlockable=round_unlockable,
        ),
    )

# 6. Unlock / story intro pages
print("\nGenerating unlock pages...")
for u in site["unlockables"]:
    # Find puzzle and round for this unlockable
    puzz = puzzles.get(u["puzzle_pk"]) if u.get("puzzle_pk") else None
    dest_round = rounds.get(u["round_pk"]) if u.get("round_pk") else None
    # parent_pk is a Round pk
    parent_round = rounds.get(u["parent_pk"]) if u.get("parent_pk") else None
    write(
        OUT / "unlock" / u["slug"] / "index.html",
        env.get_template("unlockable.html").render(
            unlockable=u,
            puzzle=puzz,
            dest_round=dest_round,
            parent_round=parent_round,
            hunt=hunt_for_unlockable(u),
        ),
    )

# 7. Puzzle pages
print("\nGenerating puzzle pages...")
for puzzle in site["puzzles"]:
    write(
        OUT / "puzzle" / puzzle["slug"] / "index.html",
        env.get_template("puzzle.html").render(
            puzzle=puzzle,
            files=load_puzzle_files(puzzle["slug"]),
            parent_round=parent_round_for_puzzle(puzzle),
            hunt=hunt_for_puzzle(puzzle),
            unlockables_by_pk=unlockables,
        ),
    )

# 8. Solution pages
print("\nGenerating solution pages...")
for puzzle in site["puzzles"]:
    write(
        OUT / "solution" / puzzle["slug"] / "index.html",
        env.get_template("solution.html").render(
            puzzle=puzzle,
            files=load_puzzle_files(puzzle["slug"]),
            parent_round=parent_round_for_puzzle(puzzle),
            hunt=hunt_for_puzzle(puzzle),
        ),
    )

print("\nDone!")
