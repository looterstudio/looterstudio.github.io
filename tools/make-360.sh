#!/bin/bash
# Genera assets/loot-360-alpha.webp (logo girando, fondo negro -> alpha) desde assets/loot-360.mp4.
# 16 fps, 224 px (1.2 MB; a 20 fps y 256 px pesa 1.8). Requiere ffmpeg, img2webp (brew install webp) y Pillow + numpy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
ffmpeg -v error -i "$ROOT/assets/loot-360.mp4" -vf "crop=382:382:176:114,scale=224:224:flags=lanczos,fps=16" "$TMP/f%04d.png"
python3 - "$TMP" <<'PY'
import glob, sys
import numpy as np
from PIL import Image
for f in sorted(glob.glob(sys.argv[1] + "/f*.png")):
    a = np.array(Image.open(f).convert("RGBA")).astype(np.int32)
    m = a[:, :, :3].max(axis=2)
    a[:, :, 3] = np.where(m < 22, 0, np.where(m < 70, np.clip(np.round((m - 22) * 5.3), 0, 255), 255))
    Image.fromarray(a.astype(np.uint8), "RGBA").save(f)
PY
img2webp -loop 0 -d 62 -lossy -q 70 -m 4 -o "$ROOT/assets/loot-360-alpha.webp" "$TMP"/f*.png
rm -rf "$TMP"
ls -la "$ROOT/assets/loot-360-alpha.webp"
