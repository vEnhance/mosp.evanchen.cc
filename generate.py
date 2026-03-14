#!/usr/bin/env python3
"""
Static site generator for the MOSP archival site.

Usage: python3 generate.py

Reads:
  data/site.json              - structured puzzle/hunt metadata
  data/puzzles/{slug}/*.md    - long-form puzzle and solution text
  site/static/                - static assets (images, PDFs, CSS, JS) checked into git

Writes:
  site/                       - the generated static site (HTML files are gitignored)

Note: compile TypeScript first with ./build-ts.sh
"""

import json
import urllib.parse
from pathlib import Path

import markdown as markdown_lib
from jinja2 import Environment, FileSystemLoader
from markupsafe import Markup

ROOT = Path(__file__).parent
DATA = ROOT / "data"
OUT = ROOT / "site"

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

hunts = {h["volume_number"]: h for h in site["hunts"]}
rounds = {r["slug"]: r for r in site["rounds"]}
puzzles = {p["slug"]: p for p in site["puzzles"]}
unlockables = {u["slug"]: u for u in site["unlockables"]}

# Populate intro_story_text from markdown files
for u in site["unlockables"]:
    intro = DATA / "unlockables" / u["slug"] / "intro.md"
    if intro.exists():
        u["intro_story_text"] = intro.read_text()
    else:
        u.setdefault("intro_story_text", "")

# Build mapping: round_slug → slug of the unlockable that introduces that round
round_intro_slugs: dict[str, str] = {}
for u in site["unlockables"]:
    if u.get("round_slug") and u.get("parent_slug") is None:
        round_intro_slugs[u["round_slug"]] = u["slug"]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def read_puzzle_file(slug: str, filename: str) -> str:
    p = DATA / "puzzles" / slug / filename
    return p.read_text() if p.exists() else ""


def load_puzzle_files(slug: str) -> dict:
    return {
        "content": read_puzzle_file(slug, "content.md"),
        "flavor_text": read_puzzle_file(slug, "flavor.md"),
        "puzzle_head": read_puzzle_file(slug, "head.html"),
        "solution_text": read_puzzle_file(slug, "solution.md"),
        "author_notes": read_puzzle_file(slug, "author-notes.md"),
        "post_solve_story": read_puzzle_file(slug, "story.md"),
    }


def hunt_for_round(round_: dict) -> dict | None:
    u = unlockables.get(round_["unlockable_slug"])
    return hunts.get(u["hunt_volume"]) if u else None


def parent_round_for_puzzle(puzzle: dict) -> dict | None:
    u = unlockables.get(puzzle["unlockable_slug"])
    if not u or u.get("parent_slug") is None:
        return None
    return rounds.get(u["parent_slug"])


def hunt_for_puzzle(puzzle: dict) -> dict | None:
    u = unlockables.get(puzzle["unlockable_slug"])
    return hunts.get(u["hunt_volume"]) if u else None


def hunt_for_unlockable(u: dict) -> dict | None:
    return hunts.get(u.get("hunt_volume"))


def rounds_for_hunt(hunt: dict) -> list[dict]:
    result = []
    for r in site["rounds"]:
        u = unlockables.get(r["unlockable_slug"])
        if u and u["hunt_volume"] == hunt["volume_number"]:
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

# 1. Index
index_path = DATA / "index.md"
print("\nGenerating index...")
write(
    OUT / "index.html",
    env.get_template("index.html").render(
        hunts=site["hunts"],
        index_text=index_path.read_text() if index_path.exists() else "",
    ),
)

# 1b. Noscript info page
write(OUT / "noscript.html", env.get_template("noscript.html").render())


# 2. Volume pages
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

# 3. Chapter pages
print("\nGenerating chapter pages...")
for round_ in site["rounds"]:
    hunt = hunt_for_round(round_)
    if not hunt:
        print(f"  Warning: no hunt found for round {round_['slug']}")
        continue
    children = sorted(
        [u for u in site["unlockables"] if u.get("parent_slug") == round_["slug"]],
        key=lambda u: (u["sort_order"], u["name"]),
    )
    # Find the unlockable whose purpose is introducing this round
    # (round_slug == round slug, parent_slug is None — it's the chapter's own story page)
    round_unlockable = next(
        (
            u
            for u in site["unlockables"]
            if u.get("round_slug") == round_["slug"] and u.get("parent_slug") is None
        ),
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

# 4. Unlock / story intro pages
print("\nGenerating unlock pages...")
for u in site["unlockables"]:
    # Find puzzle and round for this unlockable
    puzz = puzzles.get(u["puzzle_slug"]) if u.get("puzzle_slug") else None
    dest_round = rounds.get(u["round_slug"]) if u.get("round_slug") else None
    # parent_slug is a Round slug
    parent_round = rounds.get(u["parent_slug"]) if u.get("parent_slug") else None
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

# 5. Puzzle pages
print("\nGenerating puzzle pages...")
for puzzle in site["puzzles"]:
    write(
        OUT / "puzzle" / puzzle["slug"] / "index.html",
        env.get_template("puzzle.html").render(
            puzzle=puzzle,
            files=load_puzzle_files(puzzle["slug"]),
            parent_round=parent_round_for_puzzle(puzzle),
            hunt=hunt_for_puzzle(puzzle),
            unlockables_by_slug=unlockables,
        ),
    )

# 6. Solution pages
print("\nGenerating solution pages...")
for puzzle in site["puzzles"]:
    unlockable = unlockables.get(puzzle["unlockable_slug"])
    on_solve_slug = unlockable.get("on_solve_link_to") if unlockable else None
    on_solve_unlockable = unlockables.get(on_solve_slug) if on_solve_slug else None
    write(
        OUT / "solution" / puzzle["slug"] / "index.html",
        env.get_template("solution.html").render(
            puzzle=puzzle,
            files=load_puzzle_files(puzzle["slug"]),
            parent_round=parent_round_for_puzzle(puzzle),
            hunt=hunt_for_puzzle(puzzle),
            on_solve_unlockable=on_solve_unlockable,
        ),
    )

# 7. Hints pages
print("\nGenerating hints pages...")
for puzzle in site["puzzles"]:
    if puzzle.get("hints"):
        write(
            OUT / "hints" / puzzle["slug"] / "index.html",
            env.get_template("hints.html").render(
                puzzle=puzzle,
                parent_round=parent_round_for_puzzle(puzzle),
                hunt=hunt_for_puzzle(puzzle),
                unlockables_by_slug=unlockables,
            ),
        )

print("\nDone!")
