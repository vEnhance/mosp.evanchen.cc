#!/usr/bin/env bash
# Compile all TypeScript in typescripts/ → site/js/.
# Run this whenever any .ts file changes.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$ROOT/node_modules" ]; then
    echo "Running npm install..."
    npm install --prefix "$ROOT"
fi

echo "Compiling TypeScript..."
npx --prefix "$ROOT" tsc

echo "Done."
