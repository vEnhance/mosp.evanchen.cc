#!/usr/bin/env python3
"""
Regenerate data/site.json from the Django fixture.

Usage: python3 data/extract.py
"""

import hashlib
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).parent.parent
FIXTURE = ROOT / "ancient/mosp-web/fixtures/core.20230307.json"
OUTPUT = ROOT / "data/site.json"

with open(FIXTURE) as f:
    raw = json.load(f)


def by_model(model_name):
    return {e["pk"]: e["fields"] for e in raw if e["model"] == model_name}


hunts = by_model("core.hunt")
unlockables_raw = by_model("core.unlockable")
rounds_raw = by_model("core.round")
puzzles_raw = by_model("core.puzzle")
solutions_raw = by_model("core.solution")
salted_answers = [e for e in raw if e["model"] == "core.saltedanswer"]

# Build index: unlockable_pk -> puzzle_pk and puzzle_slug
u_to_puzzle_pk: dict[int, int] = {}
u_to_puzzle_slug: dict[int, str] = {}
for pk, f in puzzles_raw.items():
    u_to_puzzle_pk[f["unlockable"]] = pk
    u_to_puzzle_slug[f["unlockable"]] = f["slug"]

# Build index: unlockable_pk -> round_pk
u_to_round_pk: dict[int, int] = {}
for pk, f in rounds_raw.items():
    u_to_round_pk[f["unlockable"]] = pk

# Compute hashes from salted answers
puzzle_hashes: dict[int, list[str]] = defaultdict(list)
puzzle_partial: dict[int, list[dict]] = defaultdict(list)
puzzle_answer: dict[int, str] = {}


def sha256(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


def normalize(s: str) -> str:
    return "".join(c for c in s.upper() if c.isalpha())


for entry in salted_answers:
    f = entry["fields"]
    p_pk = f["puzzle"]
    h = sha256(f"MOSP_LIGHT_NOVEL_{normalize(f['display_answer'])}{f['salt']}")
    if f["is_correct"] and not f["message"]:
        puzzle_hashes[p_pk].append(h)
    if f["message"]:
        puzzle_partial[p_pk].append({"hash": h, "message": f["message"]})
    if f["is_canonical"]:
        puzzle_answer[p_pk] = f["display_answer"]


# Assemble output
output: dict = {"hunts": [], "rounds": [], "puzzles": [], "unlockables": []}

for pk, f in sorted(hunts.items()):
    output["hunts"].append(
        {
            "pk": pk,
            "volume_number": f["volume_number"],
            "name": f["name"],
            "authors": f["authors"],
            "start_date": f["start_date"],
            "end_date": f["end_date"],
            "thumbnail_path": f["thumbnail_path"],
        }
    )

for pk, f in sorted(rounds_raw.items()):
    output["rounds"].append(
        {
            "pk": pk,
            "unlockable_pk": f["unlockable"],
            "name": f["name"],
            "chapter_number": f["chapter_number"],
            "show_chapter_number": f["show_chapter_number"],
            "slug": f["slug"],
            "thumbnail_path": f["thumbnail_path"],
            "round_text": f["round_text"],
        }
    )

for pk, f in sorted(puzzles_raw.items()):
    sol = solutions_raw.get(pk, {})
    output["puzzles"].append(
        {
            "pk": pk,
            "name": f["name"],
            "slug": f["slug"],
            "is_meta": f["is_meta"],
            "answer": puzzle_answer.get(pk, ""),
            "hashes": puzzle_hashes.get(pk, []),
            "partial_answers": puzzle_partial.get(pk, []),
            "solution": {
                "post_solve_image_path": sol.get("post_solve_image_path", ""),
                "post_solve_image_alt": sol.get("post_solve_image_alt", ""),
            },
            "unlockable_pk": f["unlockable"],
        }
    )

for pk, f in sorted(unlockables_raw.items()):
    needs_u_pk = f["unlock_needs"]
    needs_slug = u_to_puzzle_slug.get(needs_u_pk) if needs_u_pk else None

    output["unlockables"].append(
        {
            "pk": pk,
            "hunt_pk": f["hunt"],
            "parent_pk": f["parent"],
            "slug": f["slug"],
            "name": f["name"],
            "icon": f["icon"],
            "sort_order": f["sort_order"],
            "story_only": f["story_only"],
            "intro_story_text": f["intro_story_text"],
            "courage_bounty": f["courage_bounty"],
            "unlock_courage_threshold": f["unlock_courage_threshold"],
            "unlock_date": f["unlock_date"],
            "unlock_needs_slug": needs_slug,
            "force_visibility": f["force_visibility"],
            "on_solve_link_to": f["on_solve_link_to"],
            "puzzle_pk": u_to_puzzle_pk.get(pk),
            "round_pk": u_to_round_pk.get(pk),
        }
    )

OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False))
print(f"Wrote {OUTPUT}")
