#!/usr/bin/env bash
# Compile puzzle TypeScript and place output into site/static/.
# Run this whenever src/set.ts or src/zoom.ts change.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$ROOT/node_modules" ]; then
    echo "Running npm install..."
    npm install --prefix "$ROOT"
fi

echo "Compiling TypeScript..."
npx --prefix "$ROOT" tsc --project "$ROOT/tsconfig.puzzles.json"

echo "Copying compiled JS to site/static/..."
mkdir -p "$ROOT/site/static/2021/set"
cp "$ROOT/.tsc-out/set.js" "$ROOT/site/static/2021/set/set.js"

mkdir -p "$ROOT/site/static/2021/zoom"
cp "$ROOT/.tsc-out/zoom.js" "$ROOT/site/static/2021/zoom/zoom.js"

echo "Done."
