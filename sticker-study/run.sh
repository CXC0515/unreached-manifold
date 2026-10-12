#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_BIN="${STICKER_PYTHON:-/Users/cxc/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3}"

if [[ ! -x "$PYTHON_BIN" ]]; then
  printf 'Python runtime not found: %s\nSet STICKER_PYTHON to a Python with Pillow and NumPy.\n' "$PYTHON_BIN" >&2
  exit 1
fi

exec "$PYTHON_BIN" "$SCRIPT_DIR/build_assets.py" "$@"
