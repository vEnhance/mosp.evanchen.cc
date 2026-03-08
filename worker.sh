#!/usr/bin/env bash

# Worker script to run to deploy to Cloudflare Pages

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

npm install -g typescript
tsc --project "$ROOT/tsconfig.json"

pip install -r requirements.txt
python generate.py
