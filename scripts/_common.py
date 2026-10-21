"""캡처 스크립트 공통: 경로, 개인정보 흐림(블러), 읽기 전용 서버 연결 정보.
원본 저장소와 비밀 값은 이 저장소에 두지 않는다. 경로는 환경 변수 DS_ROOT로 바꿀 수 있다."""
import json, os, re
from pathlib import Path

DECK = Path(__file__).resolve().parent.parent
DS_ROOT = Path(os.environ.get('DS_ROOT', '/Users/greatsong/greatsong-project/2026-ds-danggok'))
CAPTURES = DECK / 'captures'
CONFIG = DS_ROOT / '_private' / 'oral' / 'config.json'

# 찍기 직전에 화면의 개인정보 글자를 흐린다: 학번(5자리 숫자)과 명단에서 모은 이름·팀 이름·저장소 주소
BLUR_JS = r"""(terms) => {
  let css = document.getElementById('__blurcss');
  if (!css) { css = document.createElement('style'); css.id = '__blurcss'; document.head.appendChild(css); }
  css.textContent = '.__b{filter:blur(0.42em)!important} .__bb{filter:blur(0.5em)!important}';
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(' + ['(?<![\\d.])\\d{5}(?![\\d.])'].concat(terms.filter(Boolean).map(esc)).join('|') + ')', 'g');
  // 입력칸은 같은 모양의 글 상자로 바꿔 그 안의 이름만 흐린다
  document.querySelectorAll('textarea').forEach(ta => {
    const cs = getComputedStyle(ta), d = document.createElement('div');
    ['font','fontSize','fontFamily','lineHeight','padding','border','borderRadius','background','color','width','height','boxSizing','letterSpacing'].forEach(k => d.style[k] = cs[k]);
    d.style.whiteSpace = 'pre-wrap'; d.style.overflow = 'hidden'; d.style.wordBreak = 'break-word';
    d.textContent = ta.value || ta.placeholder; if (!ta.value) d.style.color = cs.color === 'rgb(0, 0, 0)' ? '#999' : cs.color;
    ta.replaceWith(d);
  });
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; let n;
  while ((n = walk.nextNode())) { re.lastIndex = 0; if (n.parentElement && !n.parentElement.closest('script,style,.__b') && re.test(n.nodeValue)) nodes.push(n); }
  nodes.forEach(t => {
    const s = t.nodeValue, frag = document.createDocumentFragment(); let last = 0; re.lastIndex = 0; let m;
    while ((m = re.exec(s))) {
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      const sp = document.createElement('span'); sp.className = '__b'; sp.textContent = m[0]; frag.appendChild(sp); last = m.index + m[0].length;
    }
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    t.parentNode.replaceChild(frag, t);
  });
  document.querySelectorAll('input').forEach(e => { re.lastIndex = 0; if (re.test(e.value) || re.test(e.placeholder || '')) e.classList.add('__b'); });
  return nodes.length;
}"""

# 화면을 정리한다: 알림 숨김, 차시 표기 지움, 점수 흐림
TIDY_JS = r"""() => {
  const t = document.getElementById('toast'); if (t) t.style.display = 'none';
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; const re = /\s*\d+(~\d+)?차시\s*(·\s*)?/g;
  while ((n = w.nextNode())) { re.lastIndex = 0; if (re.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(re, ''); }
  document.querySelectorAll('.score, td.c span, .tot').forEach(e => e.classList.add('__bb'));
  [...document.querySelectorAll('div,span,p')].filter(e => e.children.length < 6 && /팀 점수 평균|팀 점수/.test(e.textContent) && e.textContent.length < 40).forEach(e => e.classList.add('__bb'));
  // 팀 이름 자리: 목록의 팀 이름, 기록 상세 제목, 현황판 첫 열, 초안 카드 제목(첫 글자 덩어리만 흐린다)
  const firstText = e => { const t = [...e.childNodes].find(x => x.nodeType === 3 && x.nodeValue.trim()); if (t) { const sp = document.createElement('span'); sp.className = '__b'; sp.textContent = t.nodeValue; t.replaceWith(sp); } };
  document.querySelectorAll('.team .nm, .modal h2, .modal .ttl, tbody td:first-child').forEach(firstText);
  // 기록 상세의 항목별 수준(상·중·하, 숫자)
  [...document.querySelectorAll('.modal *')].filter(e => e.children.length === 0 && /^(상|중|하|\d+(\s*\/\s*\d+)?)$/.test(e.textContent.trim())).forEach(e => e.classList.add('__bb'));
}"""


def roster_terms(boot):
    """서버 bootstrap의 팀 명단에서 흐릴 낱말을 모은다(긴 것부터)"""
    t = set()
    for tm in boot.get('teams', []):
        t.add(tm.get('name', ''))
        for sid, nm in re.findall(r'(\d{5})\s*([가-힣]{2,5})', tm.get('members', '')):
            t.add(nm)
        m = re.search(r'github\.com/([^/\s]+)/([^/\s#?]+)', tm.get('repo', ''))
        if m:
            t.update([m.group(1), m.group(2)])
    # "AI" 같은 짧은 영문 팀 이름은 본문의 일반 낱말까지 흐리므로 낱말 목록에서 빼고, 팀 이름 자리(TIDY_JS)에서 흐린다
    keep = lambda x: x and len(x) >= 2 and not (x.isascii() and len(x) <= 3)
    return sorted((x for x in t if keep(x)), key=len, reverse=True)


def api(action, **kw):
    """구술 서버 읽기 요청(bootstrap·getSession만 쓴다)"""
    import urllib.request
    cfg = json.loads(CONFIG.read_text(encoding='utf-8'))
    body = json.dumps(dict(token=cfg['token'], action=action, **kw)).encode()
    req = urllib.request.Request(cfg['url'], data=body, headers={'Content-Type': 'text/plain;charset=utf-8'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())
