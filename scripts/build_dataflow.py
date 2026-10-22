"""실제로 오가는 데이터를 모아 content/dataflow.js로 쓴다(슬라이드 '실제로 오가는 데이터').

    python3 scripts/build_dataflow.py [팀ID] [--solar]      기본 팀: TE01(녹음부터 올린 이슈까지 한 팀으로 따라간다)

- 요청문은 구술 서버 코드(Code.gs)를 실제 기록으로 그대로 돌려 만든다(scripts/dataflow_prompts.js). 서버에는 읽기 요청만 보낸다.
- --solar: 서버의 피드백 초안 함수(writeFeedback_)를 맥에서 그대로 돌려 솔라에 실제로 한 번 보낸다(형식 확인·다시 쓰기 포함).
  선생님이 고친 기록은 서버에 처음 초안이 남지 않아서, 지금 서버가 같은 기록으로 만드는 초안을 재현해 보여 준다.
  결과는 _private/oral/dataflow_solar_cache.json에 두고, --solar 없이 돌리면 그 결과를 다시 쓴다(시트는 바꾸지 않는다).
- 수업이 없는 날의 흐름은 _private/oral/watch의 가장 최근 보고서·설계서·초안 파일을 쓴다. 솔라에 보낸 글은
  oral_repo_watch.solar_one을 네트워크 없이 다시 돌려 그대로 만든다.
- 이름·학번·팀 이름·저장소·깃허브 계정은 글 자체를 '⟦가림⟧'으로 바꿔 넣는다(화면에서는 흐린 칸으로 보인다). 원래 글은 공개 저장소에 남지 않는다.
"""
import json, os, re, subprocess, sys, tempfile
from pathlib import Path
from _common import DECK, DS_ROOT, api, roster_terms

WATCH = DS_ROOT / '_private' / 'oral' / 'watch'
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


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
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
    }
    M = masker(terms + extra)
    mask_all = lambda v: {k: mask_all(x) for k, x in v.items()} if isinstance(v, dict) else M(v)
    flow = mask_all(flow)
    blob = json.dumps(flow, ensure_ascii=False)
    left = [t for t in terms + extra if t and len(t) >= 2 and t in blob]
    assert not left, '가리지 못한 낱말: %s' % left
    (DECK / 'content' / 'dataflow.js').write_text('// 자동 생성 — scripts/build_dataflow.py. 이름·학번·팀 이름·저장소·계정은 ⟦가림⟧으로 바꿨다\nwindow.DATAFLOW = '
                                                  + json.dumps(flow, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
    print('완료', {k: len(v) if isinstance(v, str) else '…' for k, v in flow.items()})


if __name__ == '__main__':
    main()
