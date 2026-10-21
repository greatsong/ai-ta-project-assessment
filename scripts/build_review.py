"""검토 문서(content/review.md)를 review/index.html로 만든다.

    python3 scripts/build_review.py
"""
import re, sys, html
from pathlib import Path
import markdown
src = Path(__file__).resolve().parent.parent / 'content' / 'review.md'
out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / 'review' / 'index.html'
md = src.read_text(encoding='utf-8')
title_line, rest = md.split('\n', 1)
sub_line, rest = rest.strip().split('\n', 1)
body = markdown.markdown(rest, extensions=['tables', 'sane_lists'])
# 절 제목에 앵커, 목차
toc = []
def anchor(m):
    level, text = m.group(1), m.group(2)
    plain = re.sub('<[^>]+>', '', text)
    aid = 's' + str(len(toc))
    if level == '2':
        toc.append((aid, plain))
    return '<h%s id="%s">%s</h%s>' % (level, aid, text, level)
body = re.sub(r'<h([23])>(.*?)</h\1>', anchor, body)
body = body.replace('<table>', '<div class="tw"><table>').replace('</table>', '</table></div>')
body = re.sub(r'(https://2026dgds\.streamlit\.app)', r'<a href="\1">\1</a>', body)
toc_html = ''.join('<li><a href="#%s">%s</a></li>' % (a, html.escape(t)) for a, t in toc)
page = '''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>AI 팀 프로젝트 교과 확장 검토</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* 읽기 단 하나 + 넓은 화면에서 왼쪽 목차 고정. 표는 단 안에서 가로 스크롤 */
:root {
  --paper: #f6f8f7; --sheet: #ffffff; --ink: #1c2421; --muted: #5a6762; --line: #dce4e0;
  --accent: #0b6a5e; --tint: #e7f2ef;
  --display: "IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --body: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --paper: #111614; --sheet: #161d1a; --ink: #e4ebe8; --muted: #9caaa4; --line: #2a3531; --accent: #5ec3b1; --tint: #1a2723; color-scheme: dark } }
:root[data-theme="dark"] { --paper: #111614; --sheet: #161d1a; --ink: #e4ebe8; --muted: #9caaa4; --line: #2a3531; --accent: #5ec3b1; --tint: #1a2723; color-scheme: dark }
body { background: var(--paper); color: var(--ink); font-family: var(--body); font-size: 16px; line-height: 1.75; word-break: keep-all; overflow-wrap: anywhere; }
.wrap { max-width: 1120px; margin: 0 auto; padding-block: 40px 96px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 48px; align-items: start; }
header.top { grid-column: 1 / -1; display: grid; gap: 10px; padding-bottom: 28px; border-bottom: 1px solid var(--line); }
.eyebrow { font-family: var(--mono); font-size: 12.5px; letter-spacing: .06em; color: var(--accent); }
h1 { font-family: var(--display); font-weight: 700; font-size: clamp(26px, 4vw, 38px); line-height: 1.3; margin: 0; text-wrap: balance; }
.sub { color: var(--muted); font-size: 14.5px; margin: 0; }
nav.toc { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 24px); font-size: 14px; }
nav.toc p { font-family: var(--mono); font-size: 12px; letter-spacing: .08em; color: var(--muted); margin: 0 0 8px; }
nav.toc ol { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; }
nav.toc a { color: var(--ink); text-decoration: none; display: block; padding: 4px 10px; border-left: 2px solid var(--line); }
nav.toc a:hover, nav.toc a:focus-visible { border-left-color: var(--accent); color: var(--accent); outline: none; }
main { min-width: 0; max-width: 760px; }
main h2 { font-family: var(--display); font-weight: 700; font-size: 23px; line-height: 1.4; margin: 56px 0 14px; padding-top: 8px; text-wrap: balance; scroll-margin-top: 24px; }
main h2:first-child { margin-top: 0; }
main h3 { font-family: var(--display); font-weight: 600; font-size: 18px; margin: 34px 0 10px; color: var(--ink); text-wrap: balance; scroll-margin-top: 24px; }
main p, main li { font-size: 16px; }
main p { margin: 0 0 14px; }
main ul, main ol { padding-left: 1.3em; margin: 0 0 16px; display: grid; gap: 6px; }
main strong { font-weight: 700; }
main a { color: var(--accent); }
code { font-family: var(--mono); font-size: .88em; background: var(--tint); padding: 1px 6px; border-radius: 4px; }
.tw { overflow-x: auto; margin: 6px 0 22px; border: 1px solid var(--line); border-radius: 10px; background: var(--sheet); }
table { border-collapse: collapse; width: 100%; font-size: 14px; line-height: 1.6; min-width: 560px; }
th, td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid var(--line); }
th { font-family: var(--display); font-weight: 600; font-size: 13px; color: var(--muted); background: var(--tint); white-space: nowrap; }
tr:last-child td { border-bottom: 0; }
td:first-child { font-variant-numeric: tabular-nums; }
@media (max-width: 860px) {
  .wrap { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  nav.toc { position: static; }
  nav.toc ol { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
}
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
</style></head><body>
<div class="wrap">
<header class="top">
<span class="eyebrow">당곡고 2026 데이터 과학 · <a href="../" style="color:inherit">발표 자료로 돌아가기</a></span>
<h1>''' + html.escape(title_line.lstrip('# ').strip()) + '''</h1>
<p class="sub">''' + html.escape(sub_line.strip()) + '''</p>
</header>
<nav class="toc" aria-label="목차"><p>목차</p><ol>''' + toc_html + '''</ol></nav>
<main>''' + body + '''</main>
</div></body></html>'''
out.write_text(page, encoding='utf-8')
print('ok', len(page), '자', len(toc), '절')
