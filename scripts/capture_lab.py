"""공개 페이지를 찍는다: 데이터 과학 실습실(스트림릿 클라우드), 학생용 구술 안내, 샘플 저장소 log.

    python3 scripts/capture_lab.py

학생 정보가 없는 공개 화면이라 흐리지 않는다. 실습실 장면은 대화 글귀로 찾으므로 시나리오 문장이 바뀌면 아래 글귀를 고친다.
"""
import sys, re, time
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / 'captures'
OUT.mkdir(parents=True, exist_ok=True)
LAB = 'https://2026dgds.streamlit.app/~/+/'
done = []

def union_clip(page, locs, pad=16):
    boxes = [l.bounding_box() for l in locs]
    boxes = [b for b in boxes if b]
    x0 = min(b['x'] for b in boxes) - pad; y0 = min(b['y'] for b in boxes) - pad
    x1 = max(b['x'] + b['width'] for b in boxes) + pad; y1 = max(b['y'] + b['height'] for b in boxes) + pad
    return {'x': max(0, x0), 'y': max(0, y0), 'width': x1 - max(0, x0), 'height': y1 - max(0, y0)}

def msg(page, text):
    """그 글을 담은 대화 말풍선(없으면 테두리 상자)"""
    l = page.locator('[data-testid="stChatMessage"]', has_text=text)
    if l.count() == 0:
        l = page.locator('[data-testid="stVerticalBlockBorderWrapper"]', has_text=text)
    return l.first

def lab_page(page, path, all_on=True):
    page.goto(LAB + path, wait_until='domcontentloaded')
    page.wait_for_selector('[data-testid="stAppViewContainer"]', timeout=180000)
    page.wait_for_timeout(6000)
    if all_on:
        page.get_by_text('대화를 한 번에 모두 보기').first.click()
        page.wait_for_timeout(15000)
        page.wait_for_function("() => !document.body.innerText.includes('준비하는 중')", timeout=180000)
        page.wait_for_timeout(3000)

BOX_JS = """(t) => {
  const all = [...document.querySelectorAll('h1,h2,h3,h4,h5,p,strong,span,div')].filter(e => e.innerText && e.innerText.includes(t));
  let el = all[all.length - 1];
  if (!el) return null;
  while (el && el !== document.body) {
    const cs = getComputedStyle(el);
    if (parseFloat(cs.borderTopWidth) > 0 && el.getBoundingClientRect().width > 300) break;
    el = el.parentElement;
  }
  const r = el.getBoundingClientRect();
  return {x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height};
}"""

class Box:
    def __init__(self, page, text): self.page, self.text = page, text
    def bounding_box(self): return self.page.evaluate(BOX_JS, self.text)

def shot(page, name, locs):
    page.screenshot(path=str(OUT / name), clip=union_clip(page, locs), full_page=True)
    done.append(name)

with sync_playwright() as p:
    b = p.chromium.launch()
    # 실습실: 세로로 긴 화면을 써서 안쪽 스크롤 없이 모두 그린다
    ctx = b.new_context(viewport={'width': 1280, 'height': 9000}, device_scale_factor=2, locale='ko-KR')
    page = ctx.new_page()
    # C1 첫 화면

    lab_page(page, '', all_on=False)
    page.set_viewport_size({'width': 1280, 'height': 1600})
    page.wait_for_timeout(1500)
    page.screenshot(path=str(OUT / 'C1_실습실_첫화면.png')); done.append('C1')
    page.set_viewport_size({'width': 1280, 'height': 9000})
    # C2 모델 후보: 추천 표, 모델마다 묻기
    lab_page(page, '모델_후보')
    shot(page, 'C2a_모델추천표.png', [msg(page, '이런 문제에 어울리는 모델을 2~3개 추천해'), msg(page, '분류 문제에 많이 쓰는 모델 세 가지')])
    shot(page, 'C2b_모델마다_묻기.png', [msg(page, '분류에 써도 돼?'), msg(page, '나무가 많으면 항상 더 좋은 거야?'), msg(page, '대신 나무가 많아 예측 이유를')])
    shot(page, 'C3a_AI오류_학생검증.png', [msg(page, '정확도가 1.0이라는 게 이상해'), msg(page, '시험용 데이터로 다시 계산하는 코드')])
    shot(page, 'C3b_검증기록_log.png', [Box(page, '검증 기록 남기기')])
    shot(page, 'C4a_구술대비_모델후보.png', [Box(page, '구술 인터뷰 대비')])
    # 모델 원리: 손 계산, S자 곡선, 계수 오해 바로잡기, 자기 설명 확인받기, 대비 카드
    lab_page(page, '모델_원리')
    shot(page, 'C3c_원리_손계산.png', [msg(page, '한 단계씩 직접 계산해 줘'), msg(page, '로지스틱 회귀가 시험용 데이터의 첫 번째 환자')])
    shot(page, 'C3d_계수오해_바로잡기.png', [msg(page, 'age의 계수 1.855는 무슨 뜻이야'), msg(page, '1.855%p씩'), msg(page, '확률이 언제나 같은 만큼 오르지는 않을 것 같아'), msg(page, '앞의 설명이 틀렸습니다')])
    shot(page, 'C3e_자기설명_확인받기.png', [msg(page, '내가 이해한 대로 말해 볼게'), msg(page, '원리는 대부분 맞지만')])
    shot(page, 'C4b_구술대비_선정모델.png', [Box(page, '구술 인터뷰 대비')])
    ctx.close()
    # C5 학생 안내(③ 회차 절), C6 샘플 저장소 log
    ctx = b.new_context(viewport={'width': 1280, 'height': 900}, device_scale_factor=2, locale='ko-KR')
    page = ctx.new_page()
    page.goto('https://greatsong.github.io/ds-danggok-2026/oral.html', wait_until='networkidle')
    page.wait_for_timeout(1500)
    # 차시 표기는 발표 자료에 남기지 않는다(교사 결정: 일정이 바뀔 수 있음)
    page.evaluate("""() => document.querySelectorAll('.when').forEach(e => e.remove())""")
    sec = page.locator('section#c3')
    if sec.count():
        sec.screenshot(path=str(OUT / 'C5_학생안내_체크리스트루브릭.png')); done.append('C5')
    page.goto('https://github.com/greatsong/ds-sample-1-regression/blob/main/log/07.md', wait_until='networkidle')
    page.wait_for_timeout(2500)
    art = page.locator('article.markdown-body').first
    if art.count():
        art.screenshot(path=str(OUT / 'C6_샘플저장소_log.png')); done.append('C6')
    b.close()
print('완료', done)
