#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PORT="${STICKER_PORT:-8765}"

if [[ ! -f "$SCRIPT_DIR/generated/stickers/path_entry.png" ]]; then
  printf 'Sticker PNGs are missing. Run sticker-study/run.sh first.\n' >&2
  exit 1
fi

printf 'Sticker editor: http://127.0.0.1:%s/unreached-manifold-sticker-garden/sticker-study/editor.html\n' "$PORT"
printf 'Garden game:   http://127.0.0.1:%s/unreached-manifold-sticker-garden/sticker-study/garden.html\n' "$PORT"
exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$WORKSPACE_DIR"
