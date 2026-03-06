/** Data types for the MOSP archival site, derived from mosp-web Django fixture. */

export interface Hunt {
  pk: number;
  volume_number: string; // "I" or "II"
  name: string;
  authors: string;
  start_date: string;
  end_date: string;
  thumbnail_path: string;
}

export interface Round {
  pk: number;
  unlockable_pk: number | null;
  name: string;
  chapter_number: string; // "0", "1", "2"
  show_chapter_number: boolean;
  slug: string;
  thumbnail_path: string;
  round_text: string; // markdown
}

export interface PartialAnswer {
  hash: string;
  message: string;
}

export interface Solution {
  solution_text: string; // markdown
  author_notes: string; // markdown
  post_solve_story: string; // markdown
  post_solve_image_path: string;
  post_solve_image_alt: string;
}

export interface Puzzle {
  pk: number;
  name: string;
  slug: string;
  is_meta: boolean;
  flavor_text: string; // markdown
  content: string; // markdown or HTML
  puzzle_head: string; // raw HTML for extra scripts/styles
  answer: string; // canonical answer display string
  hashes: string[]; // SHA-256 hashes of correct answers
  partial_answers: PartialAnswer[];
  solution: Solution | null;
  unlockable_pk: number | null;
}

export interface Unlockable {
  pk: number;
  hunt_pk: number;
  parent_pk: number | null;
  slug: string;
  name: string;
  icon: string;
  sort_order: number;
  story_only: boolean;
  intro_story_text: string; // markdown
  courage_bounty: number;
  round_pk?: number; // set if this unlockable has an associated round
  puzzle_pk?: number; // set if this unlockable has an associated puzzle
}

export interface SiteData {
  hunts: Hunt[];
  rounds: Round[];
  puzzles: Puzzle[];
  unlockables: Unlockable[];
}
