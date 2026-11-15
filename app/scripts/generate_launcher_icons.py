#!/usr/bin/env python3
"""Generate Android launcher assets from the exact published ATC Calendar PWA icon."""
import base64, pathlib
from io import BytesIO
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parents[2]
svg = (ROOT / 'app/src/main/assets/atc-calendar-icon.svg').read_text(encoding='utf-8')
marker = 'base64,'
if marker not in svg: raise SystemExit('Published PWA icon has no embedded base64 image')
encoded = svg.split(marker, 1)[1].split(chr(34), 1)[0]
image = Image.open(BytesIO(base64.b64decode(encoded))).convert('RGB')
drawable = ROOT / 'app/src/main/res/drawable-nodpi'
drawable.mkdir(parents=True, exist_ok=True)
image.resize((512,512), Image.Resampling.LANCZOS).save(drawable / 'atc_calendar_logo.png', format='PNG', optimize=True)
sizes = {'mipmap-mdpi':48,'mipmap-hdpi':72,'mipmap-xhdpi':96,'mipmap-xxhdpi':144,'mipmap-xxxhdpi':192}
for folder,size in sizes.items():
    target = ROOT / 'app/src/main/res' / folder
    target.mkdir(parents=True, exist_ok=True)
    scaled = image.resize((size,size), Image.Resampling.LANCZOS)
    for name in ('ic_launcher.webp','ic_launcher_round.webp'):
        scaled.save(target / name, format='WEBP', quality=96, method=6)
print('Generated launcher icons from the published PWA logo.')
