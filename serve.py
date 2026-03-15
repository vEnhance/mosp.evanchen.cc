#!/usr/bin/env python3
"""
Serve the generated site/ directory on localhost for testing.

By default, watches for file changes and rebuilds automatically:
  - typescripts/*.ts changes  → runs ./build.sh (tsc + generate.py)
  - templates/ or data/ changes → runs generate.py only

Usage:
  python3 serve.py              # serves on port 8000 with live reload
  python3 serve.py 9000         # serves on a custom port
  python3 serve.py --no-reload  # disable live reloading
"""

import argparse
import http.server
import subprocess
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).parent

parser = argparse.ArgumentParser(description="Serve the MOSP static site locally.")
parser.add_argument(
    "port", nargs="?", type=int, default=8000, help="Port to serve on (default: 8000)"
)
parser.add_argument(
    "--no-reload",
    action="store_true",
    help="Disable live reloading on file changes",
)
args = parser.parse_args()

PORT = args.port
DIRECTORY = ROOT / "site"

if not DIRECTORY.is_dir():
    print(f"Error: '{DIRECTORY}' does not exist. Run 'python3 generate.py' first.")
    sys.exit(1)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def log_message(self, fmt, *args):
        # Suppress 200s for assets, only log errors and HTML
        code = args[1] if len(args) > 1 else ""
        if code not in ("200", "304") or args[0].endswith(".html"):
            super().log_message(fmt, *args)


# ---------------------------------------------------------------------------
# Live reload via watchdog
# ---------------------------------------------------------------------------

if not args.no_reload:
    try:
        from watchdog.events import FileSystemEventHandler
        from watchdog.observers import Observer
    except ImportError:
        print(
            "Warning: 'watchdog' not installed; live reload disabled.\n"
            "  Install it with: uv add --dev watchdog"
        )
        args.no_reload = True

if not args.no_reload:
    _pending: dict[str, threading.Timer] = {}
    _lock = threading.Lock()

    def _run_command(key: str, cmd: list[str], label: str) -> None:
        print(f"\n[reload] {label}...")
        result = subprocess.run(cmd, cwd=ROOT)
        if result.returncode == 0:
            print(f"[reload] {label} done.")
        else:
            print(f"[reload] {label} FAILED (exit {result.returncode}).")
        with _lock:
            _pending.pop(key, None)

    def _schedule(key: str, cmd: list[str], label: str) -> None:
        with _lock:
            if key in _pending:
                _pending[key].cancel()
            t = threading.Timer(0.4, _run_command, args=(key, cmd, label))
            t.daemon = True
            _pending[key] = t
            t.start()

    class TSHandler(FileSystemEventHandler):
        """On .ts changes, run the full build (tsc + generate.py)."""

        def _handle(self, event):
            if not event.is_directory and str(event.src_path).endswith(".ts"):
                # Full build covers generate.py too, so cancel any pending generate
                with _lock:
                    if "generate" in _pending:
                        _pending.pop("generate").cancel()
                _schedule("build", ["./build.sh"], "TypeScript + site rebuild")

        def on_modified(self, event):
            self._handle(event)

        def on_created(self, event):
            self._handle(event)

    class TemplateDataHandler(FileSystemEventHandler):
        """On template/data changes, regenerate the site (unless a full build is pending)."""

        def _handle(self, event):
            if not event.is_directory:
                with _lock:
                    if "build" in _pending:
                        return  # full build already coming, covers generate.py
                _schedule(
                    "generate",
                    ["uv", "run", "python", "generate.py"],
                    "Site regeneration",
                )

        def on_modified(self, event):
            self._handle(event)

        def on_created(self, event):
            self._handle(event)

        def on_deleted(self, event):
            self._handle(event)

    observer = Observer()
    observer.schedule(TSHandler(), str(ROOT / "typescripts"), recursive=True)
    observer.schedule(TemplateDataHandler(), str(ROOT / "templates"), recursive=True)
    observer.schedule(TemplateDataHandler(), str(ROOT / "data"), recursive=True)
    observer.start()
    print("Live reload enabled (watching typescripts/, templates/, data/).")

# ---------------------------------------------------------------------------
# HTTP server
# ---------------------------------------------------------------------------

print(f"Serving {DIRECTORY}")
print(f"Open: http://localhost:{PORT}/index.html")
print("Press Ctrl-C to stop.\n")

try:
    with http.server.HTTPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    if not args.no_reload and "observer" in dir():
        observer.stop()
        observer.join()
