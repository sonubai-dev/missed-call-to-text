#!/usr/bin/env python3
import os
import zlib
import struct
import math

def generate_rgba_png(width, height, draw_func):
    """Generate a valid RGBA PNG using only Python's standard library (struct + zlib)."""
    raw_rows = []
    for y in range(height):
        row = [0] # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            row.extend([r, g, b, a])
        raw_rows.append(bytes(row))
    raw_data = b"".join(raw_rows)
    compressed = zlib.compress(raw_data, 9)

    # PNG Signature
    png = b"\x89PNG\r\n\x1a\n"
    # IHDR
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b"IHDR" + ihdr_data)
    png += struct.pack(">I", len(ihdr_data)) + b"IHDR" + ihdr_data + struct.pack(">I", ihdr_crc)
    # IDAT
    idat_crc = zlib.crc32(b"IDAT" + compressed)
    png += struct.pack(">I", len(compressed)) + b"IDAT" + compressed + struct.pack(">I", idat_crc)
    # IEND
    iend_crc = zlib.crc32(b"IEND")
    png += struct.pack(">I", 0) + b"IEND" + struct.pack(">I", iend_crc)
    return png

def icon_drawer(x, y, w, h):
    cx, cy = w / 2.0, h / 2.0
    radius = (min(w, h) / 2.0) - 2.0
    dx = x - cx
    dy = y - cy
    dist = math.sqrt(dx * dx + dy * dy)

    # Antialiased green circle background (#0F766E Deep Emerald Green)
    if dist > radius:
        return (0, 0, 0, 0) # Transparent outside
    
    # Base green: #0F766E -> R=15, G=118, B=110
    base_r, base_g, base_b = 15, 118, 110

    # Slight inner ring highlight
    if dist > radius - 2:
        return (13, 98, 92, 255)

    # 1. White Telephone Handset Glyph (Central)
    # Scaled to icon coordinates:
    nx = (x - cx) / (w * 0.45)
    ny = (y - cy) / (h * 0.45)

    is_handset = False
    # Classic curved handset arc and receiver pads
    # Distance from center arc: (nx+0.1)^2 + (ny+0.1)^2 approx 0.35..0.7, in lower-left to upper-right quadrant
    h_dist = math.sqrt((nx + 0.05)**2 + (ny + 0.05)**2)
    angle = math.atan2(ny + 0.05, nx + 0.05) # radians

    # Main curved receiver arc
    if 0.35 <= h_dist <= 0.65 and (-2.5 <= angle <= 0.9):
        is_handset = True

    # Earpiece pad (top right)
    if math.sqrt((nx - 0.35)**2 + (ny - 0.45)**2) < 0.22:
        is_handset = True

    # Mouthpiece pad (bottom left)
    if math.sqrt((nx + 0.45)**2 + (ny + 0.35)**2) < 0.22:
        is_handset = True

    # 2. Small SMS / Message Symbol Badge (Upper Right: nx ~ 0.35, ny ~ -0.35)
    bx = nx - 0.35
    by = ny + 0.35
    is_sms_badge = False
    
    # Message bubble box
    if -0.30 <= bx <= 0.30 and -0.22 <= by <= 0.22:
        is_sms_badge = True
    # Message bubble pointer tail
    if -0.15 <= bx <= 0.05 and 0.20 <= by <= 0.34 and (bx + by * 0.7 < 0.18):
        is_sms_badge = True

    if is_sms_badge:
        # Inner text line inside SMS bubble
        if -0.20 <= bx <= 0.20 and (-0.08 <= by <= -0.02 or 0.06 <= by <= 0.12):
            return (15, 118, 110, 255) # Green line on white badge
        return (255, 255, 255, 255) # White bubble

    if is_handset:
        return (255, 255, 255, 255) # White telephone

    return (base_r, base_g, base_b, 255)

def main():
    densities = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192,
    }
    
    res_base = 'app/src/main/res'
    for dens, size in densities.items():
        folder = os.path.join(res_base, f'mipmap-{dens}')
        os.makedirs(folder, exist_ok=True)
        png_data = generate_rgba_png(size, size, icon_drawer)
        for name in ['ic_launcher.png', 'ic_launcher_round.png']:
            path = os.path.join(folder, name)
            with open(path, 'wb') as f:
                f.write(png_data)
            print(f"Generated {path} ({size}x{size})")

if __name__ == '__main__':
    main()
