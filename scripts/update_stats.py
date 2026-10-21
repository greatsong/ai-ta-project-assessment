"""슬라이드에 쓰는 수치를 모아 content/stats.js로 쓴다(이름·학번 없이 숫자만).

    python3 scripts/update_stats.py

- 구술 서버(읽기): 반·팀 수, 회차별 실시 팀 수, 피드백 초안, 올린 이슈, 맥 루틴의 댓글 초안·질문 후보
- 세특 근거 저장소(_private/setuk_store/evidence.jsonl): 출처별 건수, 근거가 쌓인 학생 수
- 실습실 시나리오(ds-danggok-lab/content): 페이지·대화 단계·AI 오류 검증 장면·구술 대비 카드 수
- 루브릭(구술평가_루브릭.json): 회차·항목·꼬리질문 수
"""
import datetime as dt, json, os
from pathlib import Path
from _common import DECK, DS_ROOT, api

LAB = Path(os.environ.get('LAB_ROOT', str(DS_ROOT.parent / 'ds-danggok-lab')))


def main():
    b = api('bootstrap')
    cps = b['checkpoints']
    classes = b['settings'].get('classes', [])
    teams = b['teams']
    sess = b['sessions']
    oral = {
        'classes': classes,
        'teams': {c: sum(1 for t in teams if t['cls'] == c) for c in classes},
        'rounds': [{'id': c['id'], 'no': c['no'], 'title': c['title'],
                    'done': {k: len({s['teamId'] for s in sess if s['cp'] == c['id'] and s['cls'] == k}) for k in classes}} for c in cps],
        'sessions': len(sess),
        'transcribed': sum(1 for s in sess if str(s.get('sttStatus', '')).startswith('완료')),
        'feedback_ready': sum(1 for s in sess if str(s.get('feedbackStatus', '')).startswith('완료')),
        'issues_posted': sum(1 for s in sess if str(s.get('issueUrl', '')).startswith('https://')),
        'drafts': {k: sum(1 for d in b.get('drafts', []) if d.get('status') == k) for k in ('초안', '올림', '올리기 대기')},
        'questions': len(b.get('questions', []) or []),
        'minutes_recorded': round(sum(float(s.get('durationSec') or 0) for s in sess) / 60, 1),
    }
    ev_path = DS_ROOT / '_private' / 'setuk_store' / 'evidence.jsonl'
    ev = [json.loads(l) for l in ev_path.read_text(encoding='utf-8').splitlines() if l.strip()] if ev_path.exists() else []
    setuk = {'rows': len(ev), 'students': len({r['학번'] for r in ev}),
             'by_source': {k: sum(1 for r in ev if r['출처'] == k) for k in ('구술', 'log')}}
    lab = {'pages': 0, 'steps': 0, 'wrong_scenes': 0, 'oral_cards': 0}
    for f in sorted((LAB / 'content').glob('*.json')):
        if f.name in ('home.json', 'oral.json'):
            continue
        d = json.loads(f.read_text(encoding='utf-8'))
        lab['pages'] += 1
        lab['steps'] += len(d['steps'])
        lab['wrong_scenes'] += sum(1 for s in d['steps'] if s.get('flag') == 'wrong')
        lab['oral_cards'] += sum(1 for s in d['steps'] if s['who'] == 'oral' or (s['who'] == 'note' and '구술 인터뷰 대비' in s.get('title', '')))
    rub = json.loads((DS_ROOT / 'curriculum' / '구술평가_루브릭.json').read_text(encoding='utf-8'))
    rubric = {'rounds': len(rub['checkpoints']), 'items': sum(len(c['items']) for c in rub['checkpoints']),
              'individual_items': sum(1 for c in rub['checkpoints'] for it in c['items'] if it['unit'] == 'individual'),
              'followups': sum(len(c['followups']) for c in rub['checkpoints'])}
    stats = {'updated': dt.datetime.now().strftime('%Y-%m-%d %H:%M'), 'oral': oral, 'setuk': setuk, 'lab': lab, 'rubric': rubric}
    out = DECK / 'content' / 'stats.js'
    out.write_text('// 자동 생성 — scripts/update_stats.py. 직접 고치지 않는다\nwindow.STATS = ' + json.dumps(stats, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
    print(json.dumps(stats, ensure_ascii=False)[:900])


if __name__ == '__main__':
    main()
