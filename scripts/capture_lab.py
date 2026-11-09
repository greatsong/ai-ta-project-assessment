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
    # C2 모델 후보: 추천 표, 궁금해서 이어 묻기(랜덤 포레스트는 왜 여러 그루), 대화 속 앱 둘, 구술 대비 카드
    lab_page(page, '모델_후보')
    shot(page, 'C2a_모델추천표.png', [msg(page, '이 문제에 적합한 모델 세 개를 추천해 줘'), msg(page, '추천 모델은 로지스틱 회귀, 결정 트리, 랜덤 포레스트이며')])
    shot(page, 'C2b_모델마다_묻기.png', [msg(page, '왜 여러 그루를 만드는 거야'), msg(page, '나무마다 학습용 데이터에서 사람을 무작위로 다시 뽑으며')])
    shot(page, 'C3a_베이스라인_찍기앱.png', [msg(page, '아무것도 배우지 않는 모델을 왜 굳이'), msg(page, '베이스라인은 아무 정보 없이 찍었을 때의 결과')])
    shot(page, 'C3b_가중치_토글앱.png', [msg(page, '왜 환자를 거의 못 찾는 거야'), msg(page, '해결 방법은 가중치')])
    shot(page, 'C4a_구술대비_모델후보.png', [Box(page, '구술 인터뷰 대비')])
    # 평가지표: 탭 앱(혼동행렬·네 모델 비교), 자기 말로 확인(정밀도·재현율), 재현율로 최종 모델 고르기
    lab_page(page, '평가지표')
    shot(page, 'C3c_평가_탭앱.png', [msg(page, '모델을 골라 가며 평가 결과를'), msg(page, '분류 모델은 혼동행렬부터')])
    shot(page, 'C3d_자기말_정밀도재현율.png', [msg(page, '정밀도와 재현율이 헷갈려서'), msg(page, '두 정의가 서로 바뀌었습니다')])
    shot(page, 'C3e_재현율로_선택.png', [msg(page, '어떤 지표로 최종 모델을 골라야'), msg(page, '재현율이 높은 순서로 보여 줍니다')])
    # 모델 원리(랜덤 포레스트): 나무 100그루 앱, 앱을 만져 보고 생긴 궁금증, 하이퍼파라미터 슬라이더, 과대적합 그래프, 자기 설명 확인받기, 대비 카드
    lab_page(page, '모델_원리')
    shot(page, 'C3f_원리_나무100그루앱.png', [msg(page, '나무 한 그루씩 골라서'), msg(page, '첫 번째 환자(실제 뇌졸중 환자)에서 시작합니다')])
    shot(page, 'C3g_궁금증_나이구간.png', [msg(page, '왜 어떤 구간은 그대로이고'), msg(page, '482개 가운데 118개')])
    shot(page, 'C3h_하이퍼파라미터_슬라이더.png', [msg(page, '랜덤 포레스트에는 어떤 하이퍼파라미터가'), msg(page, '바꿔 볼 것 네 가지는')])
    shot(page, 'C3i_과대적합_그래프.png', [msg(page, '깊이를 15로 올려 봤어'), msg(page, '깊이 1부터 20까지 랜덤 포레스트를')])
    shot(page, 'C3j_자기설명_확인받기.png', [msg(page, '구술 인터뷰에서 설명할 수 있게 내 말로'), msg(page, '원리와 학습이 정하는 것')])
    shot(page, 'C4b_구술대비_선정모델.png', [Box(page, '구술 인터뷰 대비')])
    ctx.close()
    # C5 학생 안내(② 회차 절), C6 샘플 저장소 log
    ctx = b.new_context(viewport={'width': 1280, 'height': 900}, device_scale_factor=2, locale='ko-KR')
    page = ctx.new_page()
    page.goto('https://greatsong.github.io/ds-danggok-2026/oral.html', wait_until='networkidle')
    page.wait_for_timeout(1500)
    # 차시 표기는 발표 자료에 남기지 않는다(교사 결정: 일정이 바뀔 수 있음)
    page.evaluate("""() => document.querySelectorAll('.when').forEach(e => e.remove())""")
    # 고정 머리줄이 절 한가운데에 찍히지 않게 고정을 푼다
    page.evaluate("""() => document.querySelectorAll('body *').forEach(e => { const p = getComputedStyle(e).position; if (p === 'sticky' || p === 'fixed') e.style.position = 'static'; })""")
    # ① 교실 장의 교사 앱 화면(A3·A4)과 같은 회차(②)의 절을 찍는다. 회차를 바꾸면 SEC와 발표 자료의 이동량(frame의 '0:-38%', 루브릭 제목 위치)을 함께 맞춘다
    SEC = 'c2'
    sec = page.locator('section#' + SEC)
    if sec.count():
        sec.screenshot(path=str(OUT / 'C5_학생안내_체크리스트루브릭.png')); done.append('C5')
    else:
        print('경고: 학생 안내에서 section#%s 절을 찾지 못해 C5를 찍지 않았다' % SEC)
    page.goto('https://github.com/greatsong/ds-sample-1-regression/blob/main/log/07.md', wait_until='networkidle')
    page.wait_for_timeout(2500)
    art = page.locator('article.markdown-body').first
    if art.count():
        art.screenshot(path=str(OUT / 'C6_샘플저장소_log.png')); done.append('C6')
    b.close()
print('완료', done)
