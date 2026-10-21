"""교사용 구술 평가 앱의 실제 화면을 찍는다(서버는 읽기만 한다).

    python3 scripts/capture_app.py [반] [회차 번호]      예: python3 scripts/capture_app.py E반 1

- 앱 파일은 2026-ds-danggok/web 저장소의 마지막 커밋에서 꺼내 이 컴퓨터에서 띄운다(교사 열람 잠금 gate.js는 뺀다).
- 연결 정보는 _private/oral/config.json에서 읽고, 화면에는 남기지 않는다.
- 찍기 직전에 학번·이름·팀 이름·저장소 주소·점수를 흐린다. 흐리지 않은 원본은 파일로 남기지 않는다.
- 인터뷰 화면은 다음 회차의 첫 팀을 연 상태다. 기기(헤드리스 브라우저)에만 임시 기록이 생기고 서버에는 저장하지 않는다.
"""
import base64, functools, http.server, json, socketserver, subprocess, sys, tempfile, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
from _common import BLUR_JS, CAPTURES, CONFIG, DS_ROOT, TIDY_JS, api, roster_terms

CLS = sys.argv[1] if len(sys.argv) > 1 else 'E반'
CP_DONE = int(sys.argv[2]) if len(sys.argv) > 2 else 1        # 다 끝난 회차(목록·상세를 찍을 회차), 1부터
FILES = ['index.html', 'oral.js', 'oral.css', 'seed.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png']


def build_site():
    site = Path(tempfile.mkdtemp(prefix='oralsite_'))
    d = site / 'teacher' / 'oral'
    d.mkdir(parents=True)
    for f in FILES:
        data = subprocess.run(['git', '-C', str(DS_ROOT / 'web'), 'show', 'HEAD:teacher/oral/' + f], capture_output=True, check=True).stdout
        (d / f).write_bytes(data)
    idx = (d / 'index.html').read_text(encoding='utf-8').replace('<script src="../../assets/gate.js"></script>\n', '')
    (d / 'index.html').write_text(idx, encoding='utf-8')
    return site


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def main():
    cfg = json.loads(CONFIG.read_text(encoding='utf-8'))
    conn = base64.urlsafe_b64encode(json.dumps({'u': cfg['url'], 't': cfg['token']}).encode()).decode().rstrip('=')
    site = build_site()
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(('127.0.0.1', 4097), functools.partial(Quiet, directory=str(site)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    CAPTURES.mkdir(exist_ok=True)
    done = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(viewport={'width': 400, 'height': 860}, device_scale_factor=2, locale='ko-KR')
        page = ctx.new_page()
        page.goto('http://127.0.0.1:4097/teacher/oral/#connect=' + conn)
        page.wait_for_timeout(9000)
        b = page.locator('#clsSeg button', has_text=CLS)
        if b.count():
            b.first.click()
            page.wait_for_timeout(1000)
        terms = roster_terms(api('bootstrap'))   # 명단은 서버에서 읽는다(읽기 요청)
        assert len(terms) > 10, '흐릴 명단을 읽지 못했습니다'

        def snap(name, target=None, full=False):
            page.wait_for_timeout(500)
            page.evaluate(BLUR_JS, terms)
            page.evaluate(TIDY_JS)
            page.wait_for_timeout(250)
            path = str(CAPTURES / name)
            if target is not None:
                target.screenshot(path=path)
            else:
                page.screenshot(path=path, full_page=full)
            done.append(name)

        def card(title):
            return page.locator('.card', has=page.locator('.sec-t', has_text=title)).first

        page.locator('#cpRow button').nth(CP_DONE - 1).click()
        page.wait_for_timeout(1500)
        snap('A1_팀목록.png')
        # 다음 회차의 첫 팀을 열어 인터뷰 화면을 본다
        page.locator('#cpRow button').nth(CP_DONE).click()
        page.wait_for_timeout(800)
        page.locator('#view button.team').first.click()
        page.wait_for_timeout(1500)
        snap('A2_인터뷰_참석녹음.png')
        page.set_viewport_size({'width': 400, 'height': 2400})
        page.wait_for_timeout(600)
        snap('A3_인터뷰_질문.png', card('질문'))
        snap('A4_인터뷰_루브릭.png', card('루브릭'))
        page.set_viewport_size({'width': 400, 'height': 860})
        page.locator('text=목록').first.click()
        page.wait_for_timeout(800)
        # 현황판과 기록 상세(강점·가이드 초안, 전사)
        page.locator('#tabs button[data-tab="board"]').click()
        page.wait_for_timeout(1000)
        snap('A6_현황판.png')
        cell = page.locator('td.c:not(.none)').first
        if cell.count():
            page.set_viewport_size({'width': 400, 'height': 2600})
            cell.click()
            page.wait_for_timeout(2500)
            snap('A5_기록상세_피드백.png', page.locator('.modal').first)
            page.keyboard.press('Escape')
            page.locator('.modal-back').first.click(position={'x': 5, 'y': 5}) if page.locator('.modal-back').count() else None
            page.set_viewport_size({'width': 400, 'height': 860})
        # 맥 확인 루틴이 만든 깃허브 초안 카드, 전사·피드백 설정
        page.locator('#tabs button[data-tab="queue"]').click()
        page.wait_for_timeout(1000)
        drafts = page.locator('.card', has_text='깃허브 초안').first
        if drafts.count():
            page.set_viewport_size({'width': 400, 'height': 2000})
            snap('A7_깃허브초안.png', drafts)
            page.set_viewport_size({'width': 400, 'height': 860})
        page.locator('#tabs button[data-tab="settings"]').click()
        page.wait_for_timeout(1000)
        page.set_viewport_size({'width': 400, 'height': 2400})
        stt = page.locator('.card', has_text='녹음 전사').first
        if stt.count():
            snap('A8_설정_전사피드백.png', stt)
        br.close()
    srv.shutdown()
    print('찍음', done)


if __name__ == '__main__':
    main()
