#!/usr/bin/env python3
"""
Serve the generated out/ directory on localhost for testing.

Usage:
  python3 serve.py          # serves on port 8000
  python3 serve.py 9000     # serves on a custom port
"""

import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")

if not os.path.isdir(DIRECTORY):
    print(f"Error: '{DIRECTORY}' does not exist. Run 'python3 generate.py' first.")
    sys.exit(1)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, fmt, *args):
        # Suppress 200s for assets, only log errors and HTML
        code = args[1] if len(args) > 1 else ""
        if code not in ("200", "304") or args[0].endswith(".html"):
            super().log_message(fmt, *args)


print(f"Serving {DIRECTORY}")
print(f"Open: http://localhost:{PORT}/index.html")
print("Press Ctrl-C to stop.\n")

with http.server.HTTPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
