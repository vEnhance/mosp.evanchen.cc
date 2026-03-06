/**
 * Main static site generator for the MOSP archival site.
 *
 * Usage: ts-node src/generate.ts
 *
 * Reads:
 *   data/site.json   - extracted puzzle/hunt data
 *   static/          - assets to copy verbatim
 *
 * Writes:
 *   out/             - the generated static site
 */

import * as fs from "fs";
import * as path from "path";

import { SiteData, Hunt, Round, Puzzle, Unlockable } from "./types";
import { renderIndex } from "./templates/index";
import { renderVol } from "./templates/vol";
import { renderChapter } from "./templates/chapter";
import { renderPuzzle } from "./templates/puzzle";
import { renderSolution } from "./templates/solution";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`  wrote ${filePath}`);
}

function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "out");

const siteData: SiteData = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "site.json"), "utf8")
);

// Build lookup maps
const huntsByPk = new Map<number, Hunt>(siteData.hunts.map((h) => [h.pk, h]));
const roundsByPk = new Map<number, Round>(siteData.rounds.map((r) => [r.pk, r]));
const puzzlesByPk = new Map<number, Puzzle>(siteData.puzzles.map((p) => [p.pk, p]));
const unlockablesByPk = new Map<number, Unlockable>(
  siteData.unlockables.map((u) => [u.pk, u])
);

// Index: round slug → round
const roundsBySlug = new Map<string, Round>(siteData.rounds.map((r) => [r.slug, r]));

// Index: puzzle slug → puzzle
const puzzlesBySlug = new Map<string, Puzzle>(
  siteData.puzzles.map((p) => [p.slug, p])
);

/** For a round, find the hunt that owns the associated unlockable. */
function huntForRound(round: Round): Hunt | null {
  const u = round.unlockable_pk != null ? unlockablesByPk.get(round.unlockable_pk) : null;
  return u ? (huntsByPk.get(u.hunt_pk) ?? null) : null;
}

/** For a puzzle, find its parent round (if any). */
function parentRoundForPuzzle(puzzle: Puzzle): Round | null {
  const u =
    puzzle.unlockable_pk != null ? unlockablesByPk.get(puzzle.unlockable_pk) : null;
  if (!u || u.parent_pk == null) return null;
  const parentU = unlockablesByPk.get(u.parent_pk);
  if (!parentU || parentU.round_pk == null) return null;
  return roundsByPk.get(parentU.round_pk) ?? null;
}

/** For a puzzle, find the hunt. */
function huntForPuzzle(puzzle: Puzzle): Hunt | null {
  const u =
    puzzle.unlockable_pk != null ? unlockablesByPk.get(puzzle.unlockable_pk) : null;
  return u ? (huntsByPk.get(u.hunt_pk) ?? null) : null;
}

// ---------------------------------------------------------------------------
// Generate pages
// ---------------------------------------------------------------------------

console.log("Generating static site into:", OUT);

// 1. Copy static assets
console.log("\nCopying static assets...");
copyDir(path.join(ROOT, "static"), path.join(OUT, "static"));

// 2. Index page
console.log("\nGenerating index...");
writeFile(path.join(OUT, "index.html"), renderIndex(siteData.hunts));

// 3. Volume pages
console.log("\nGenerating volume pages...");
for (const hunt of siteData.hunts) {
  // Find rounds that belong to this hunt
  const huntRounds = siteData.rounds.filter((r) => {
    const u =
      r.unlockable_pk != null ? unlockablesByPk.get(r.unlockable_pk) : null;
    return u?.hunt_pk === hunt.pk;
  });

  const html = renderVol(hunt, huntRounds, unlockablesByPk);
  writeFile(
    path.join(OUT, "vol", hunt.volume_number, "index.html"),
    html
  );
}

// 4. Chapter pages
console.log("\nGenerating chapter pages...");
for (const round of siteData.rounds) {
  const hunt = huntForRound(round);
  if (!hunt) {
    console.warn(`  Warning: no hunt found for round ${round.slug}`);
    continue;
  }
  const html = renderChapter(round, hunt, siteData.unlockables, puzzlesByPk);
  writeFile(path.join(OUT, "chapter", round.slug, "index.html"), html);
}

// 5. Puzzle pages
console.log("\nGenerating puzzle pages...");
for (const puzzle of siteData.puzzles) {
  const parentRound = parentRoundForPuzzle(puzzle);
  const hunt = huntForPuzzle(puzzle);
  const html = renderPuzzle(puzzle, parentRound, hunt);
  writeFile(path.join(OUT, "puzzle", puzzle.slug, "index.html"), html);
}

// 6. Solution pages
console.log("\nGenerating solution pages...");
for (const puzzle of siteData.puzzles) {
  const parentRound = parentRoundForPuzzle(puzzle);
  const hunt = huntForPuzzle(puzzle);
  const html = renderSolution(puzzle, parentRound, hunt);
  writeFile(path.join(OUT, "solution", puzzle.slug, "index.html"), html);
}

console.log("\nDone!");
