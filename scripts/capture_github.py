"""팀 저장소(깃허브)의 실제 화면을 찍는다: 팅커비스가 올린 이슈, 학생이 쓴 log.

    python3 scripts/capture_github.py

찍을 장면은 아래 SHOTS에 적는다(팀ID와 저장소 안의 경로). 저장소 주소는 구술 서버의 팀 명단에서 읽는다.
찍기 직전에 학번·이름·팀 이름·저장소 주소·학생 계정과 프로필 사진을 흐린다. 페이지 머리(저장소 이름)는 찍지 않는다.
"""
import re
from playwright.sync_api import sync_playwright
from _common import BLUR_JS, CAPTURES, api, roster_terms

# (파일 이름, 팀ID, 종류, 경로) — 종류 issue는 경로에 이슈 번호, log는 저장소 안 파일 경로
SHOTS = [
    ('G1_이슈_강점가이드_1.png', 'TE01', 'issue', '2'),
    ('G2_이슈_강점가이드_2.png', 'TE05', 'issue', '2'),
    ('G3_학생log.png', 'TE04', 'log', 'log/02.md'),
]

# 깃허브 화면에서 학생 계정이 드러나는 요소를 흐린다(교사 계정 greatsong은 둔다)
GH_JS = r"""() => {
  document.querySelectorAll('img[src*="avatars.githubusercontent"], img.avatar, [class*=Avatar] img').forEach(e => { if (!/greatsong/.test(e.alt || '')) e.style.filter = 'blur(0.5em)'; });
  document.querySelectorAll('a[data-hovercard-type="user"], a.author, [data-testid="issue-body-header-author"]').forEach(e => { if (!/greatsong/.test(e.textContent)) e.style.filter = 'blur(5px)'; });
}"""

# 글을 담은 가장 안쪽 요소에서 위로 올라가 테두리 있는 상자를 찾는다
BOX_JS = r"""(t) => {
  const all = [...document.querySelectorAll('h1,h2,h3,p,li,span,div,bdi')].filter(e => e.innerText && e.innerText.includes(t));
  let el = all[all.length - 1]; if (!el) return null;
  while (el && el !== document.body) { const cs = getComputedStyle(el); if (parseFloat(cs.borderTopWidth) > 0 && el.getBoundingClientRect().width > 500) break; el = el.parentElement; }
  const r = el.getBoundingClientRect(); return {x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height};
}"""


def union(boxes, pad=12):
    boxes = [b for b in boxes if b]
    x0 = min(b['x'] for b in boxes) - pad; y0 = min(b['y'] for b in boxes) - pad
    x1 = max(b['x'] + b['width'] for b in boxes) + pad; y1 = max(b['y'] + b['height'] for b in boxes) + pad
    return {'x': max(0, x0), 'y': max(0, y0), 'width': x1 - max(0, x0), 'height': y1 - max(0, y0)}


def main():
    boot = api('bootstrap')
    terms = roster_terms(boot)
    repos = {t['id']: re.search(r'github\.com/([^/\s]+/[^/\s#?]+)', t.get('repo', '')) for t in boot['teams']}
    done = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        page = br.new_context(viewport={'width': 1100, 'height': 3000}, device_scale_factor=2, locale='ko-KR').new_page()
        for name, tid, kind, path in SHOTS:
            m = repos.get(tid)
            if not m:
                print('저장소 없음', tid); continue
            repo = m.group(1).removesuffix('.git')
            url = 'https://github.com/%s/%s' % (repo, ('issues/' + path) if kind == 'issue' else ('blob/HEAD/' + path))
            page.goto(url, wait_until='networkidle')
            page.wait_for_timeout(2500)
            extra = [x for x in [repo, *repo.split('/')] if not (x.isascii() and len(x) <= 3)]
            page.evaluate(BLUR_JS, terms + extra)
            page.evaluate(GH_JS)
            page.wait_for_timeout(300)
            if kind == 'issue':
                # 오른쪽 사이드바(담당자·라벨 등)를 숨기고 제목 폭까지 담는다
                page.evaluate("""() => { const a = [...document.querySelectorAll('h2,h3,div,span')].find(e => e.textContent.trim() === 'Assignees');
                  let el = a; while (el && el.parentElement && el.parentElement.getBoundingClientRect().width < 420) el = el.parentElement; if (el) el.style.visibility = 'hidden'; }""")
                t = page.locator('h1', has_text='구술 인터뷰').first.bounding_box()
                t['y'] += page.evaluate('window.scrollY')
                body = page.locator('.markdown-body', has_text='다음 단계 가이드').last.bounding_box()
                body['y'] += page.evaluate('window.scrollY')
                clip = union([t, body], pad=20)
                clip['x'] = max(0, body['x'] - 20)
                clip['width'] = max(body['x'] + body['width'], t['x'] + t['width']) + 20 - clip['x']
            else:
                art = page.locator('article.markdown-body').first
                b = art.bounding_box(); b['y'] += page.evaluate('window.scrollY')
                clip = union([b])
            page.screenshot(path=str(CAPTURES / name), clip=clip, full_page=True)
            done.append(name)
        br.close()
    print('찍음', done)


if __name__ == '__main__':
    main()
