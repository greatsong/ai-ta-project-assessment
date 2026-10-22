"""실제로 오가는 데이터를 모아 content/dataflow.js로 쓴다(슬라이드 '실제로 오가는 데이터').

    python3 scripts/build_dataflow.py [팀ID] [--solar] [--gate=TE03]
        기본 팀: TE01(녹음부터 올린 이슈까지 한 팀으로 따라간다)
        --gate: '모든 결정은 교사를 거친다' 장에서 다섯 초안을 따라갈 팀(기본 TE03)

- 요청문은 구술 서버 코드(Code.gs)를 실제 기록으로 그대로 돌려 만든다(scripts/dataflow_prompts.js). 서버에는 읽기 요청만 보낸다.
- --solar: 서버의 피드백 초안 함수(writeFeedback_)를 맥에서 그대로 돌려 솔라에 실제로 한 번 보낸다(형식 확인·다시 쓰기 포함).
  선생님이 고친 기록은 서버에 처음 초안이 남지 않아서, 지금 서버가 같은 기록으로 만드는 초안을 재현해 보여 준다.
  결과는 _private/oral/dataflow_solar_cache.json에 두고, --solar 없이 돌리면 그 결과를 다시 쓴다(시트는 바꾸지 않는다).
- 수업이 없는 날의 흐름은 _private/oral/watch의 가장 최근 보고서·설계서·초안 파일을 쓴다. 솔라에 보낸 글은
  oral_repo_watch.solar_one을 네트워크 없이 다시 돌려 그대로 만든다.
- 결정 장(gate): 한 팀의 녹취 장면 → 이슈 강점, 회수한 첫 판 → 승인한 둘째 판, 댓글 초안과 상태, 질문 후보, 한 학생의 세특 근거.
  질문 후보는 시트에 실제 후보가 있으면 그것을, 없으면 _private/oral/gate_question_examples.json(같은 규칙의 예시)을 쓰고 example로 표시한다.
  세특 근거의 항목 수준은 ■로 바꾼다.
- 이름·학번·팀 이름·저장소·깃허브 계정은 글 자체를 '⟦가림⟧'으로 바꿔 넣는다(화면에서는 흐린 칸으로 보인다). 원래 글은 공개 저장소에 남지 않는다.
"""
import json, os, re, subprocess, sys, tempfile
from pathlib import Path
from _common import DECK, DS_ROOT, api, roster_terms

WATCH = DS_ROOT / '_private' / 'oral' / 'watch'
ORAL = DS_ROOT / '_private' / 'oral'
EVIDENCE = DS_ROOT / '_private' / 'setuk_store' / 'evidence.jsonl'
CACHE = DS_ROOT / '_private' / 'oral' / 'dataflow_solar_cache.json'
ENV = DS_ROOT.parent / 'ai-chat-for-students' / 'server' / '.env'
MASK = '⟦가림⟧'


def masker(terms):
    terms = sorted(set(t for t in terms if t and len(t) >= 2), key=len, reverse=True)
    pat = re.compile('(' + '|'.join([r'(?<![\d.])\d{5}(?![\d.])'] + [re.escape(t) for t in terms]) + ')')
    return lambda s: pat.sub(MASK, s) if isinstance(s, str) else s


def lines(text, n):
    L = [x for x in str(text).splitlines() if x.strip()]
    return '\n'.join(L[:n]) + ('\n…(이하 %d줄 생략)' % (len(L) - n) if len(L) > n else '')


def upstage_key():
    for line in ENV.read_text(encoding='utf-8').splitlines():
        if line.startswith('UPSTAGE_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"\'')
    raise RuntimeError('UPSTAGE_API_KEY가 없습니다.')


def server_prompts(b, sess, call_solar):
    """Code.gs를 그대로 돌려 Gemini·솔라 요청문을 만든다. call_solar면 솔라에 실제로 보낸다."""
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump({'bootstrap': b, 'session': sess}, f, ensure_ascii=False)
    env = dict(os.environ)
    if call_solar:
        env['DF_UPSTAGE'] = upstage_key()
    try:
        out = subprocess.run(['node', str(DECK / 'scripts' / 'dataflow_prompts.js'), str(DS_ROOT / 'apps-script/oral/Code.gs'),
                              str(DS_ROOT / 'apps-script/oral/Seed.gs'), f.name], capture_output=True, text=True, env=env)
    finally:
        Path(f.name).unlink()
    if out.returncode:
        raise RuntimeError('요청문 만들기 실패: ' + out.stderr[-500:].replace(env.get('DF_UPSTAGE') or '\0', '***'))
    return json.loads(out.stdout)


def watch_flow():
    """수업이 없는 날: 가장 최근 보고서 가운데 바뀐 팀, 그 설계서, 솔라에 보낸 글, 초안"""
    reps = sorted(WATCH.glob('report_*.json'))
    rep = team = None
    for r in reversed(reps):
        d = json.loads(r.read_text(encoding='utf-8'))
        ch = [t for t in d['teams'] if t.get('changed')]
        if ch:
            rep, team = r, ch[0]
            break
    if not team:
        return {}, []
    stamp = rep.stem.split('_', 1)[1]
    pick = lambda pat: next((json.loads(x.read_text(encoding='utf-8')) for x in reversed(sorted(WATCH.glob(pat)))
                             if x.stem.split('_', 1)[1] >= stamp), None)
    briefs, drafts = pick('briefs_*.json'), pick('drafts_*.json')
    brief = next((x for x in (briefs or []) if x.get('teamId') == team.get('teamId')), None)
    draft = next((x for x in (drafts or []) if x.get('teamId') == team.get('teamId')), None)
    view = {
        'team': team.get('team'), 'question': team.get('question'), 'method': team.get('method'),
        'commits': [{'message': c['message'], 'author': c.get('author'), 'date': c['date'][:16]} for c in team.get('commits', [])][:4],
        'files': [{'file': f['file'], 'status': f['status'], 'patch': lines(re.sub(r'^@@.*$', '', f.get('patch', ''), flags=re.M), 6)}
                  for f in team.get('files', [])][:3],
        'ai_verification_in_repo': team.get('ai_verification_in_repo', [])[:3],
        'data_files': team.get('data_files', [])[:5],
    }
    solar_sent = ''
    if brief:
        # 솔라에 보낸 글: 맥 루틴의 solar_one을 네트워크 없이 다시 돌려 첫 요청을 그대로 받는다
        sys.path.insert(0, str(DS_ROOT / 'scripts'))
        import oral_repo_watch as W
        seen = []

        def fake(msgs, sysp):
            seen.append((sysp, [dict(m) for m in msgs]))
            return (draft or {}).get('text', '')
        W.solar_call = fake
        W.solar_one(brief)
        sysp, msgs = seen[0]
        solar_sent = '[system]\n' + sysp + '\n\n[user]\n' + msgs[0]['content']
    extra = [c.get('author', '') for c in team.get('commits', [])] + [team.get('team', ''), team.get('repo', '')]
    return {
        'when': '%s-%s-%s %s:%s' % (stamp[:4], stamp[4:6], stamp[6:8], stamp[9:11], stamp[11:13]),
        'claude_sent': json.dumps(view, ensure_ascii=False, indent=1),
        'claude_back': json.dumps({k: brief[k] for k in ('kind', 'strengths', 'guides') if k in brief}, ensure_ascii=False, indent=1) if brief else '',
        'solar_sent': solar_sent,
        'solar_back': (draft or {}).get('text', ''),
    }, extra


def kst(ts, fmt='%Y-%m-%d'):
    """UTC 시각 → 한국 시각 글자"""
    if not ts:
        return ''
    import datetime as dt
    t = dt.datetime.fromisoformat(str(ts).replace('Z', '+00:00'))
    if t.tzinfo is None:
        t = t.replace(tzinfo=dt.timezone.utc)
    return (t + dt.timedelta(hours=9)).strftime(fmt)


def gh_issue(url):
    m = re.match(r'https://github.com/([^/]+/[^/]+)/issues/(\d+)', url or '')
    if not m:
        return {}
    return json.loads(subprocess.run(['gh', 'api', 'repos/%s/issues/%s' % m.groups()], capture_output=True, text=True, check=True).stdout)


def bullets(text, head):
    """'### 제목' 아래 '- ' 항목들"""
    part = re.split(r'^#+\s*' + re.escape(head) + r'.*$', text, maxsplit=1, flags=re.M)
    if len(part) < 2:
        return []
    body = re.split(r'^#+\s', part[1], maxsplit=1, flags=re.M)[0]
    return [re.sub(r'^\s*-\s*(\[ \]\s*)?', '', x).strip() for x in body.splitlines() if re.match(r'^\s*-\s', x)]


def gate_flow(b, team_id):
    """'모든 결정은 교사를 거친다': 한 팀의 다섯 초안과 교사의 결정"""
    s0 = next(s for s in b['sessions'] if s['teamId'] == team_id)
    sess = api('getSession', id=s0['id'])['session']
    cps = b['checkpoints']
    ci = next(i for i, c in enumerate(cps) if c['id'] == sess['cp'])
    nxt = cps[ci + 1] if ci + 1 < len(cps) else {}
    v2 = gh_issue(sess.get('issueUrl'))
    v2_body = (v2.get('body') or '').strip()
    strength = (bullets(v2_body, '인터뷰에서 보인 강점') or [''])[0]
    # 녹취에서 강점이 된 장면: 강점 문장과 글자 두 개 묶음이 가장 많이 겹치는 줄
    lines_ = [x for x in (sess.get('transcript') or '').splitlines() if x.strip()]
    bg = lambda t: {t[i:i + 2] for i in range(len(t) - 1) if t[i:i + 2].strip() and len(t[i:i + 2].strip()) == 2}
    target = bg(strength)
    k = max(range(len(lines_)), key=lambda i: len(bg(lines_[i].split(':', 1)[-1]) & target) / (1 + len(bg(lines_[i])) ** .5)) if lines_ else 0
    scene = [{'text': lines_[i], 'hl': i == k} for i in range(max(0, k - 1), min(len(lines_), k + 2))]
    # 회수한 첫 판
    recall = json.loads((ORAL / 'E반_1회차_이슈_회수기록.json').read_text(encoding='utf-8'))
    first = json.loads((ORAL / 'E반_1회차_이슈_미리보기.json').read_text(encoding='utf-8')).get(team_id, {})
    r = next((x for x in recall if x['teamId'] == team_id), {})
    v1 = gh_issue(r.get('url'))
    # 댓글 초안
    d = next((x for x in b.get('drafts', []) if x['teamId'] == team_id), {})
    # 질문 후보: 시트의 실제 후보, 없으면 같은 규칙의 예시
    qs = [{'text': q.get('text', ''), 'basis': q.get('basis', '')} for q in b.get('questions', []) if q.get('teamId') == team_id][:2]
    example = not qs
    if example:
        qs = json.loads((ORAL / 'gate_question_examples.json').read_text(encoding='utf-8')).get(team_id, [])
    # 세특 근거: 이 팀에서 근거가 가장 다양한 학생 한 명
    ev = [json.loads(l) for l in EVIDENCE.read_text(encoding='utf-8').splitlines() if l.strip()] if EVIDENCE.exists() else []
    ev = [e for e in ev if e.get('팀ID') == team_id]
    who = max({e['학번'] for e in ev}, key=lambda h: (len({e['출처'] for e in ev if e['학번'] == h}), len([e for e in ev if e['학번'] == h]))) if ev else ''
    setuk = []
    for e in sorted([e for e in ev if e['학번'] == who], key=lambda e: (e.get('일자', ''), e['출처'] != 'log')):
        if e['출처'] == 'log':
            setuk.append({'date': e.get('일자', ''), 'src': 'log · ' + e.get('파일', '').split('/')[-1], 'text': e.get('내용', '')})
        else:
            setuk.append({'date': e.get('일자', ''), 'src': '구술 ' + e.get('회차', ''),
                          'text': ' · '.join('%s ■' % x['항목'] for x in e.get('팀 항목', []) + e.get('개인 항목', []))
                                  + ('\n' + e['총평'] if e.get('총평') else '')})
            if e.get('이슈 문안'):
                setuk.append({'date': kst(v2.get('created_at')) or e.get('일자', ''), 'src': '올린 이슈', 'text': lines(e['이슈 문안'], 4)})
    # 순환 장: 인터뷰 시각, 인터뷰 뒤 첫 log, 피드백 뒤 커밋
    repo = re.match(r'https://github.com/([^/]+/[^/]+)/', sess.get('issueUrl') or '')
    repo = repo.group(1) if repo else ''
    commits = json.loads(subprocess.run(['gh', 'api', 'repos/%s/commits?per_page=50' % repo], capture_output=True, text=True).stdout or '[]') if repo else []
    cdate = lambda c: c['commit']['author']['date']
    after_iv = [c for c in commits if cdate(c) > sess['startedAt'][:19] + 'Z']
    after_fb = [c for c in commits if v2.get('created_at') and cdate(c) > v2['created_at']]
    logs_ = [e for e in sorted(ev, key=lambda e: e.get('일자', '')) if e['출처'] == 'log' and e['학번'] == who]
    first_log = None
    for c in sorted(after_iv, key=cdate):
        if re.search(r'log|\.md', c['commit']['message'], re.I):
            first_log = {'at': kst(cdate(c), '%m/%d %H:%M'), 'msg': c['commit']['message'].split('\n')[0],
                         'text': (logs_[-1]['내용'] if logs_ else ''), 'file': (logs_[-1].get('파일', '') if logs_ else '')}
            break
    cycle = {'interview_at': kst(sess['startedAt'], '%m/%d %H:%M'), 'v2_at': kst(v2.get('created_at'), '%m/%d %H:%M'),
             'v1_at': kst(v1.get('created_at'), '%m/%d %H:%M'), 'first_log': first_log,
             'after_feedback': {'n': len(after_fb), 'last': (after_fb[0]['commit']['message'].split('\n')[0] + ' · ' + kst(cdate(after_fb[0]), '%m/%d %H:%M')) if after_fb else ''},
             'guides': bullets(v2_body, '다음 단계 가이드'),
             'checked_at': __import__('datetime').datetime.now().strftime('%m/%d %H:%M')}
    extra = [r.get('url', ''), sess.get('issueUrl', ''), repo] + [e.get('성명', '') for e in ev] + [e.get('주소', '') for e in ev]
    return {
        'cp': sess['cp'], 'cpNo': cps[ci].get('no', ''), 'cpTitle': cps[ci].get('title', ''), 'date': sess['startedAt'][:10],
        'next': (nxt.get('no', '') + ' ' + nxt.get('title', '')).strip(), 'next_opener': nxt.get('opener', ''),
        'scene': scene, 'strength': strength, 'transcript_lines': len(lines_), 'durationSec': sess.get('durationSec', 0),
        'v1': first.get('body', '').strip(), 'v1_title': first.get('title', ''), 'v1_closed': kst(v1.get('closed_at')),
        'v1_count': len(recall),
        'v2': v2_body, 'v2_date': kst(v2.get('created_at')), 'v2_title': v2.get('title', ''),
        'comment': d.get('text', ''), 'comment_status': d.get('status', ''), 'comment_date': str(d.get('createdAt', ''))[:10],
        'questions': qs, 'questions_example': example,
        'setuk': setuk,
        'cycle': cycle,
    }, extra


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    gate_team = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--gate=')), 'TE03')
    call_solar = '--solar' in sys.argv
    want = args[0] if args else 'TE01'
    b = api('bootstrap')
    terms = roster_terms(b)
    rub = json.loads((DS_ROOT / 'curriculum' / '구술평가_루브릭.json').read_text(encoding='utf-8'))
    b['settings']['stt_context'] = rub.get('course', {}).get('stt_context', '')
    s0 = next(s for s in b['sessions'] if s['teamId'] == want)
    sess = api('getSession', id=s0['id'])['session']
    cps = {c['id']: c for c in b['checkpoints']}
    cp = cps.get(sess['cp'], {})
    P = server_prompts(b, sess, call_solar)
    cache = json.loads(CACHE.read_text(encoding='utf-8')) if CACHE.exists() else {}
    if call_solar:
        cache[sess['id']] = dict(P['solar'], date=__import__('datetime').date.today().isoformat())
        CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding='utf-8')
    solar = cache.get(sess['id'], {})
    if not solar:
        print('주의: 솔라 초안이 없습니다. --solar로 한 번 돌리세요.')
    tr = sess.get('transcript', '')
    user = P['feedback_user'].replace(tr, lines(tr, 8) + '\n…(받아 적은 대화 전체 %d자)' % len(tr)) if tr else P['feedback_user']
    # 교사가 승인해 올린 이슈
    iss_body = iss_when = ''
    m = re.match(r'https://github.com/([^/]+/[^/]+)/issues/(\d+)', sess.get('issueUrl') or '')
    if m:
        j = json.loads(subprocess.run(['gh', 'api', 'repos/%s/issues/%s' % m.groups()], capture_output=True, text=True, check=True).stdout)
        iss_body, iss_when = j.get('body') or '', (j.get('updated_at') or '')[:10]
    watch, extra = watch_flow()
    gate, extra2 = gate_flow(b, gate_team)
    extra += extra2
    sc = [x for x in b['scores'] if x['sid'] == sess['id']]
    mm, ss = sess['durationSec'] // 60, sess['durationSec'] % 60
    flow = {
        'session': {'cp': sess['cp'], 'cpNo': cp.get('no', ''), 'cpTitle': cp.get('title', ''), 'date': sess['startedAt'][:10],
                    'durationSec': sess['durationSec'], 'present': len(sess.get('present', [])), 'transcriptChars': len(tr)},
        'session_cols': ' · '.join(P.get('session_cols') or []),
        'app_to_server': json.dumps({'기록': {'반': sess['cls'], '회차': sess['cp'], '팀': sess['teamName'], '참석': sess.get('present', []),
                                             '루브릭': {x['item']: '■' for x in sc}, '총평': sess.get('memo', ''), '평가 시각': sess['startedAt'][:16]},
                                     '녹음': '오디오 파일 %d분 %d초' % (mm, ss)}, ensure_ascii=False, indent=1),
        'gemini_model': (sess.get('sttEngine') or '').replace('gemini ', ''),
        'gemini_sent': '[녹음 파일 %d분 %d초]\n\n' % (mm, ss) + P['gemini_prompt'],
        'gemini_back': lines(tr, 16),
        'solar_model': solar.get('model', 'solar-pro4'),
        'solar_sent': '[system]\n' + P['feedback_sys'] + '\n\n[user]\n' + user,
        'solar_back': solar.get('text', ''),
        'solar_retry': solar.get('first_check', '') if solar.get('rounds', 1) > 1 else '',
        'solar_date': solar.get('date', ''),
        'issue_body': iss_body.strip(),
        'issue_date': iss_when,
        'watch': watch,
        'gate': gate,
    }
    M = masker(terms + extra)
    mask_all = lambda v: {k: mask_all(x) for k, x in v.items()} if isinstance(v, dict) else [mask_all(x) for x in v] if isinstance(v, list) else M(v)
    flow = mask_all(flow)
    blob = json.dumps(flow, ensure_ascii=False)
    left = [t for t in terms + extra if t and len(t) >= 2 and t in blob]
    assert not left, '가리지 못한 낱말: %s' % left
    (DECK / 'content' / 'dataflow.js').write_text('// 자동 생성 — scripts/build_dataflow.py. 이름·학번·팀 이름·저장소·계정은 ⟦가림⟧으로 바꿨다\nwindow.DATAFLOW = '
                                                  + json.dumps(flow, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
    print('완료', {k: len(v) if isinstance(v, str) else '…' for k, v in flow.items()})


if __name__ == '__main__':
    main()
