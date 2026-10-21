"""모든 장·모든 단계를 1600×900으로 찍어 눈으로 확인한다(raw/qa/, 저장소에 올리지 않음).

    python3 scripts/check_slides.py [주소]        기본 http://127.0.0.1:4065/

장마다 마지막 단계 화면을 한 장으로 모은 목록(raw/qa/_sheet_*.png)도 만든다. 글자가 상자 밖으로 넘치는 곳을 함께 보고한다.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4065/'
OUT = Path(__file__).resolve().parent.parent / 'raw' / 'qa'
OUT.mkdir(parents=True, exist_ok=True)

OVERFLOW_JS = """() => {
  const s = document.querySelector('.slide.cur'); const out = [];
  s.querySelectorAll('*').forEach(e => {
    if (e.closest('.off')) return;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if ((e.scrollHeight > e.clientHeight + 4 && /hidden|clip/.test(cs.overflowY)) || (e.scrollWidth > e.clientWidth + 4 && /hidden|clip/.test(cs.overflowX)))
      if (!e.closest('.phone')) out.push((e.className || e.tagName) + ': ' + (e.innerText || '').slice(0, 30));
    const r = e.getBoundingClientRect(), st = document.getElementById('stage').getBoundingClientRect();
    if (e.children.length === 0 && r.width && (r.bottom > st.bottom - 38 || r.right > st.right + 1)) out.push('무대 밖: ' + (e.innerText || e.tagName).slice(0, 30));
  });
  return [...new Set(out)].slice(0, 6);
}"""

with sync_playwright() as p:
    br = p.chromium.launch()
    page = br.new_page(viewport={'width': 1600, 'height': 900})
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(1500)
    steps = page.evaluate('DECK.steps')
    finals = []
    for i, n in enumerate(steps):
        for st in range(n + 1):
            page.evaluate('([i, s]) => DECK.go(i, s)', [i, st])
            page.wait_for_timeout(450)
            f = OUT / ('%02d_%d.png' % (i + 1, st))
            page.screenshot(path=str(f))
            if st == n:
                finals.append(f)
                warn = page.evaluate(OVERFLOW_JS)
                if warn:
                    print('%02d장' % (i + 1), warn)
    br.close()
# 마지막 단계 화면을 6장씩 한 장으로
for k in range(0, len(finals), 6):
    ims = [Image.open(f).resize((800, 450)) for f in finals[k:k + 6]]
    sheet = Image.new('RGB', (1620, 1390), 'white')
    for j, im in enumerate(ims):
        sheet.paste(im, (10 + (j % 2) * 805, 10 + (j // 2) * 460))
    sheet.save(OUT / ('_sheet_%d.png' % (k // 6 + 1)))
print('찍음', sum(n + 1 for n in steps), '화면 →', OUT)
