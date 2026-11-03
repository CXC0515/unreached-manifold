#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PORT="${STICKER_PORT:-8765}"

if [[ ! -f "$SCRIPT_DIR/generated/stickers/path_entry.png" ]]; then
  printf 'Sticker PNGs are missing; editor and garden game need sticker-study/run.sh. The homepage preview can still run.\n' >&2
fi

printf 'Homepage:      http://127.0.0.1:%s/unreached-manifold-sticker-garden/sticker-study/home.html\n' "$PORT"
printf 'Sticker editor: http://127.0.0.1:%s/unreached-manifold-sticker-garden/sticker-study/editor.html\n' "$PORT"
printf 'Garden game:   http://127.0.0.1:%s/unreached-manifold-sticker-garden/sticker-study/garden.html\n' "$PORT"
exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$WORKSPACE_DIR"
