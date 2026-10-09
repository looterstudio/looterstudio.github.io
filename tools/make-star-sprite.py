"""Render the LooterStudio star as 3D extruded sprite sheets. White face, grey shaded sides,
soft contact shadow; drawn 4x and downsampled for clean edges. Frames sit side by side.
  assets/star-sway.png   48 frames, -55..+55 degrees: never edge-on (the planet's ring)
  assets/star-turn.png   72 frames, a full turn (the 360 mark)
Usage: python3 tools/make-star-sprite.py"""
import math, sys
from PIL import Image, ImageDraw, ImageFilter

SIZE, SS = 128, 4
S = SIZE * SS
R_OUT, R_IN, DEPTH = 0.40, 0.17, 0.085      # star radii and half-thickness, in units of the frame
TILT_X = math.radians(18)                   # a little from above, like the logo
LIGHT = (-0.45, -0.65, 0.62)                # from the top left, toward the viewer

def norm(v):
    l = math.sqrt(sum(c * c for c in v)) or 1
    return tuple(c / l for c in v)
LIGHT = norm(LIGHT)

pts2 = []
for k in range(10):
    r = R_OUT if k % 2 == 0 else R_IN
    a = -math.pi / 2 + k * math.pi / 5
    pts2.append((math.cos(a) * r, math.sin(a) * r))
front = [(x, y, DEPTH) for x, y in pts2]
back = [(x, y, -DEPTH) for x, y in pts2]

def rot(p, ry):
    x, y, z = p
    x, z = x * math.cos(ry) + z * math.sin(ry), -x * math.sin(ry) + z * math.cos(ry)
    y, z = y * math.cos(TILT_X) - z * math.sin(TILT_X), y * math.sin(TILT_X) + z * math.cos(TILT_X)
    return (x, y, z)

def proj(p):
    x, y, z = p
    f = 1 / (1 - z * 0.35)                   # mild perspective
    return (S / 2 + x * S * f, S / 2 + y * S * f)

def normal(a, b, c):
    u = [b[i] - a[i] for i in range(3)]; v = [c[i] - a[i] for i in range(3)]
    return norm((u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]))

def shade(n, base, lo):
    d = max(0.0, sum(n[i] * LIGHT[i] for i in range(3)))
    v = int(lo + (base - lo) * d)
    return (v, v, v, 255)

def render(name, angles):
    FRAMES = len(angles)
    sheet = Image.new('RGBA', (SIZE * FRAMES, SIZE), (0, 0, 0, 0))
    for f in range(FRAMES):
        ry = angles[f]
        F = [rot(p, ry) for p in front]; B = [rot(p, ry) for p in back]
        faces = []
        for i in range(10):
            j = (i + 1) % 10
            quad = [F[i], F[j], B[j], B[i]]
            n = normal(F[i], B[i], F[j])
            if n[2] < 0: n = tuple(-c for c in n)
            faces.append((sum(p[2] for p in quad) / 4, quad, shade(n, 214, 118)))
        for poly in (F, B):
            c = (sum(p[0] for p in poly) / 10, sum(p[1] for p in poly) / 10, sum(p[2] for p in poly) / 10)
            n = normal(c, poly[0], poly[2])
            if n[2] < 0: n = tuple(-v for v in n)
            faces.append((c[2] + 0.001, poly, shade(n, 252, 196)))
        faces.sort(key=lambda t: t[0])

        img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        # soft contact shadow under the star
        sh = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        ImageDraw.Draw(sh).polygon([proj((p[0], p[1] + 0.05, p[2])) for p in F], fill=(40, 30, 30, 70))
        img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(S * 0.025)))
        d = ImageDraw.Draw(img)
        for _, poly, col in faces:
            xy = [proj(p) for p in poly]
            d.polygon(xy, fill=col)
            d.line(xy + [xy[0]], fill=(70, 70, 70, 120), width=max(1, SS // 2))
        sheet.alpha_composite(img.resize((SIZE, SIZE), Image.LANCZOS), (f * SIZE, 0))

    sheet.save(name, optimize=True)
    print(name, sheet.size)

render('assets/star-sway.png', [math.radians(-55 + 110 * f / 47) for f in range(48)])
render('assets/star-turn.png', [2 * math.pi * f / 72 for f in range(72)])
