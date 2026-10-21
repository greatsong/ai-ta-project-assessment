"""학생 한 명의 세특 근거(구술 기록·올린 이슈·log)를 시간순 카드로 그려 찍는다. 이름·학번은 흐린다.

    python3 scripts/capture_setuk.py [학번]      학번을 주지 않으면 근거가 가장 많은 학생(구술과 log가 모두 있는 학생 우선)

근거는 2026-ds-danggok의 `scripts/setuk_store.py collect`가 모은 _private/setuk_store/evidence.jsonl에서 읽는다.
항목별 수준(상·중·하)과 선생님 메모는 그리지 않는다(평가 정보).
"""
import html, json, re, sys
from playwright.sync_api import sync_playwright
from _common import BLUR_JS, CAPTURES, DS_ROOT, api, roster_terms


def pick(rows, sid=None):
    by = {}
    for r in rows:
        by.setdefault(r['학번'], []).append(r)
    if sid:
        return sid, by[sid]
    best = max(by.items(), key=lambda kv: ({r['출처'] for r in kv[1]} == {'구술', 'log'}, len(kv[1])))
    return best


def card(r):
    if r['출처'] == '구술':
        body = r.get('이슈 문안') or '(이슈를 올리기 전)'
        body = re.sub(r'\n\s*\\?\*?\s*AI 제안은 환각.*$', '', body, flags=re.S)      # 맨 아래 안내 문구와 꼬리말
        body = '\n'.join(x for x in body.splitlines() if x.strip() not in ('팅커비스)', '---') and not x.startswith('<sub>'))
        body = re.sub(r'^#+\s*(.*)$', r'【\1】', body, flags=re.M)
        body = re.sub(r'^-\s*\[ \]\s*', '☐ ', body, flags=re.M).replace('`', '')
        chip, sub = '구술 ' + r['회차'], '팀 저장소 이슈로 올린 강점·가이드(선생님 승인)'
    else:
        body, chip, sub = r['내용'], 'log', r.get('파일', '')
    lines = ''.join(('<p class="h">%s</p>' % html.escape(x[1:-1])) if x.startswith('【') else ('<p>%s</p>' % html.escape(x)) for x in body.strip().splitlines() if x.strip())
    return '<section class="c"><header><span class="chip %s">%s</span><span class="d">%s</span><span class="s">%s</span></header>%s</section>' % (
        'o' if r['출처'] == '구술' else 'l', html.escape(chip), html.escape(r['일자']), html.escape(sub), lines)


def main():
    ev_path = DS_ROOT / '_private' / 'setuk_store' / 'evidence.jsonl'
    rows = [json.loads(l) for l in ev_path.read_text(encoding='utf-8').splitlines() if l.strip()]
    sid, mine = pick(rows, sys.argv[1] if len(sys.argv) > 1 else None)
    mine.sort(key=lambda r: (r['일자'], r['출처']))
    name = mine[0].get('성명', '')
    page_html = '''<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>body{margin:0;background:#f4f6f5;font-family:"Pretendard Variable",Pretendard,sans-serif;color:#1d2522}
.w{width:760px;padding:28px}h1{font-size:22px;margin:0 0 4px}.m{color:#5b6762;font-size:14px;margin:0 0 18px}
.c{background:#fff;border:1px solid #dfe5e1;border-radius:14px;padding:16px 18px;margin:0 0 12px}
header{display:flex;gap:10px;align-items:center;margin-bottom:8px}.chip{font-size:12.5px;font-weight:700;border-radius:99px;padding:3px 10px}
.chip.o{background:#e6f1ff;color:#1f5fbf}.chip.l{background:#e9f6ef;color:#17784a}.d{font-size:13px;color:#5b6762}.s{font-size:12.5px;color:#8a958f;margin-left:auto}
p{margin:4px 0;font-size:14.5px;line-height:1.6}p.h{font-weight:700;margin-top:10px}</style>
<div class="w"><h1>''' + html.escape(sid + ' ' + name) + ''' · 팀 프로젝트 근거</h1><p class="m">setuk_store.py evidence · 근거 ''' + str(len(mine)) + '''건 · 학기말 세특은 이 근거에서 학생이 직접 한 판단을 골라 쓴다</p>''' + ''.join(card(r) for r in mine) + '</div>'
    terms = roster_terms(api('bootstrap'))
    with sync_playwright() as p:
        br = p.chromium.launch()
        page = br.new_page(viewport={'width': 816, 'height': 600}, device_scale_factor=2)
        page.set_content(page_html, wait_until='networkidle')
        page.evaluate(BLUR_JS, terms)
        page.locator('.w').screenshot(path=str(CAPTURES / 'E1_세특근거.png'))
        br.close()
    print('찍음 E1_세특근거.png', len(mine), '건')


if __name__ == '__main__':
    main()
