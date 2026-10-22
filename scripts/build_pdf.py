"""발표 자료를 PDF로 만든다. 장마다 마지막 단계 화면을 한 쪽씩, 내용이 바뀌는 장은 단계마다 한 쪽씩 넣는다.

    python3 scripts/build_pdf.py [주소] [출력.pdf]
        기본 주소: 공개 주소(QR이 실제 주소를 가리키게). 기본 출력: raw/AI조교_과정중심_프로젝트평가.pdf

- 화면 아래의 키 안내와 진행 막대는 숨긴다(쪽 번호는 둔다).
- 단계마다 쪽을 나누는 장은 EXPAND에 장 번호로 적는다(1부터).
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

URL = sys.argv[1] if len(sys.argv) > 1 else 'https://greatsong.github.io/ai-ta-project-assessment/'
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent / 'raw' / 'AI조교_과정중심_프로젝트평가.pdf'
EXPAND = {9}          # 실제로 오가는 글: 여섯 경로가 단계마다 바뀐다
TMP = OUT.parent / '_pdf_pages'
TMP.mkdir(parents=True, exist_ok=True)
HIDE = '#foot .hint, #foot .prog { visibility: hidden !important; } .slide.cur * { animation-play-state: paused; }'

with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={'width': 1600, 'height': 900}, device_scale_factor=1.5)
    pg.goto(URL + ('&' if '?' in URL else '?') + 'pdf=1', wait_until='networkidle')
    pg.wait_for_timeout(1500)
    pg.add_style_tag(content='#foot > :not(.num) { visibility: hidden !important; }')
    steps = pg.evaluate('DECK.steps')
    shots = []
    for i, n in enumerate(steps):
        want = range(n + 1) if (i + 1) in EXPAND else [n]
        for st in want:
            pg.evaluate('([i, s]) => DECK.go(i, s)', [i, st])
            if (i + 1) in EXPAND:     # 단계마다 해당 경로를 눌러 연다
                pg.evaluate('(k) => { const b = document.querySelector(".slide.cur [data-x=\\"" + k + "\\"]"); if (b) b.click(); }', st)
            pg.wait_for_timeout(3200)
            f = TMP / ('%02d_%d.png' % (i + 1, st))
            pg.screenshot(path=str(f))
            shots.append(f)
    br.close()

ims = [Image.open(f).convert('RGB') for f in shots]
ims[0].save(OUT, save_all=True, append_images=ims[1:], resolution=150, quality=88)
for f in shots:
    f.unlink()
TMP.rmdir()
print('PDF', OUT, len(ims), '쪽', round(OUT.stat().st_size / 1e6, 1), 'MB')
