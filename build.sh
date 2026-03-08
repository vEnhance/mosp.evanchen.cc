#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tsc --project "$ROOT/tsconfig.json"
uv run python generate.py
