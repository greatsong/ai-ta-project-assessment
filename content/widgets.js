/* 슬라이드 안의 눌러 보는 요소. 슬라이드의 widget 이름으로 처음 보일 때 한 번 만든다. */
(function () {
  var C = function (f) { return 'captures/' + encodeURI(f); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var W = window.WIDGETS = {};

  // 구술 인터뷰 여섯 회차와 실시 현황
  W.rounds = function (el, S) {
    var box = el.querySelector('#rounds'), o = S.oral || {}, cls = o.classes || [];
    box.innerHTML = (o.rounds || []).map(function (r) {
      var tot = cls.reduce(function (a, c) { return a + (r.done[c] || 0); }, 0);
      return '<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:' + (tot ? '#fff' : 'transparent') + ';border:1px solid var(--line)">' +
        '<span style="font-size:26px;font-weight:800;width:56px;color:' + (tot ? 'var(--ai)' : 'var(--faint)') + '">' + r.no + '</span>' +
        '<span style="flex:1;font-size:22px;font-weight:600">' + esc(r.title) + '</span>' +
        cls.map(function (c) { var t = (o.teams || {})[c] || 0, d = r.done[c] || 0; return '<span class="chip" style="font-size:15px;' + (d ? 'background:#e7f7f1;color:var(--ok);border-color:#c8ecdf' : '') + '">' + c + ' ' + (d ? d + (t ? '/' + t : '') + ' 실시' : '예정') + '</span>'; }).join('') + '</div>';
    }).join('');
  };

  // 한 회차의 흐름: 단계를 누르면 장면과 역할
  var FLOW = [
    { t: '실습실 예시 대화', who: '학생', ai: 'Claude 설계 · Solar 대사', img: 'C2b_모델마다_묻기.png', d: 'AI와 대화하며 모델을 고르고 검증하는 예시를 먼저 본다. 코드는 그 자리에서 실행된다.' },
    { t: '팀 저장소 작업 · log', who: '학생', ai: '학생이 쓰는 AI', img: 'G3_학생log.png', d: '팀원마다 네 줄 기록. AI 제안을 고치거나 버린 이유가 핵심이다.' },
    { t: '구술 인터뷰', who: '교사', ai: '', img: 'A3_인터뷰_질문.png', phone: true, d: '팀당 약 3분. 시작 질문, 꼬리질문, 지목, 루브릭.' },
    { t: '받아 적기 · 초안', who: 'AI TA', ai: 'Gemini 전사 · Solar 문안', img: 'A5_기록상세_피드백.png', phone: true, d: '저장 약 20초 뒤 전사, 이어서 강점·다음 단계 가이드 초안.' },
    { t: '교사 검토 → 이슈', who: '교사', ai: '팅커비스 표기', img: 'G1_이슈_강점가이드_1.png', d: '교사가 고친 문안만 팀 저장소 이슈로 올라간다.' },
    { t: '매일 저장소 확인', who: 'AI TA', ai: 'Claude(팅커비스)', img: 'A7_깃허브초안.png', d: '수업 있는 날 18시, 바뀐 저장소에 댓글 초안. 올리기는 교사가.' },
    { t: '세특 근거', who: 'AI TA → 교사', ai: '스크립트 수집', img: 'E1_세특근거.png', d: '구술 기록·이슈·log를 학생별 시간순으로. 학기말에 교사가 고른다.' }
  ];
  var WHO = { '학생': 'var(--student)', '교사': 'var(--teacher)', 'AI TA': 'var(--ai)', 'AI TA → 교사': 'var(--ai)' };
  W.flow = function (el) {
    var nodes = el.querySelector('#flowNodes'), pane = el.querySelector('#flowPane');
    nodes.innerHTML = FLOW.map(function (f, i) {
      return '<button type="button" class="btn" data-f="' + i + '" style="display:flex;align-items:center;gap:14px;text-align:left;padding:12px 16px;border-left:8px solid ' + WHO[f.who] + '">' +
        '<span style="font-size:24px;font-weight:800;width:30px;color:var(--faint)">' + (i + 1) + '</span><span style="flex:1;font-size:22px">' + f.t + '</span><span class="chip" style="font-size:14px;color:' + WHO[f.who] + '">' + f.who + '</span></button>';
    }).join('');
    function show(i) {
      var f = FLOW[i];
      nodes.querySelectorAll('.btn').forEach(function (b) { b.classList.toggle('on', +b.dataset.f === i); });
      pane.innerHTML = '<div style="flex:0 0 ' + (f.phone ? '300px' : '58%') + ';display:flex;justify-content:center;min-height:0">' +
        (f.phone ? '<div class="phone" style="height:560px"><img alt="" src="' + C(f.img) + '"></div>' : '<img class="shot" alt="" src="' + C(f.img) + '" style="max-height:560px">') + '</div>' +
        '<div style="flex:1;display:flex;flex-direction:column;gap:12px"><h3 style="margin:0;font-size:30px">' + (i + 1) + '. ' + f.t + '</h3>' +
        '<div><span class="chip" style="color:' + WHO[f.who] + '">' + f.who + '</span>' + (f.ai ? ' <span class="chip">' + f.ai + '</span>' : '') + '</div>' +
        '<p style="font-size:23px;line-height:1.55;color:var(--ink)">' + f.d + '</p></div>';
    }
    nodes.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (b) show(+b.dataset.f); });
    show(0);
  };

  // 이슈 화면 위에 단계별 표시
  var MARKS = [
    { x: .005, y: .015, w: .16, h: .075, l: 'AI 작성 표기' },
    { x: .01, y: .315, w: .84, h: .255, l: '강점' },
    { x: .01, y: .585, w: .80, h: .235, l: '가이드' },
    { x: .01, y: .83, w: .80, h: .05, l: 'AI 검증 안내' }
  ];
  W.marks = function (el) {
    var box = el.querySelector('#issueBox'), img = box.querySelector('img');
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;display:inline-block;max-height:590px';
    img.parentNode.insertBefore(wrap, img); wrap.appendChild(img);
    MARKS.forEach(function (m, i) {
      var d = document.createElement('div');
      d.className = 'mark'; d.dataset.k = i + 1;
      d.style.cssText = 'left:' + m.x * 100 + '%;top:' + m.y * 100 + '%;width:' + m.w * 100 + '%;height:' + m.h * 100 + '%;display:none';
      wrap.appendChild(d);
    });
    function upd(st) { wrap.querySelectorAll('.mark').forEach(function (d) { d.style.display = +d.dataset.k === st ? 'block' : 'none'; }); }
    el.addEventListener('step', function (e) { upd(e.detail); });
    upd(window.DECK ? window.DECK.cur().step : 0);
  };

  // 회차 × 반 실시 표
  W.grid = function (el, S) {
    var o = S.oral || {}, cls = o.classes || [];
    el.querySelector('#grid').innerHTML = '<table class="t"><thead><tr><th>회차</th>' + cls.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (o.rounds || []).map(function (r) {
        return '<tr><td><b>' + r.no + '</b> ' + esc(r.title) + '</td>' + cls.map(function (c) {
          var d = r.done[c] || 0, t = (o.teams || {})[c] || 0;
          return '<td style="' + (d ? 'background:#e7f7f1;color:var(--ok);font-weight:700' : 'color:var(--faint)') + '">' + (d ? d + (t ? ' / ' + t : '') : '예정') + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
  };

  // 시간·비용 계산기(전사 단가는 2026-10-19 실측: 40분 약 120원, 2027년부터 약 230원)
  W.calc = function (el) {
    var inp = el.querySelector('#calcIn'), out = el.querySelector('#calcOut');
    var F = [
      { k: 'teams', l: '한 반의 팀 수', min: 4, max: 15, v: 9, u: '팀' },
      { k: 'min', l: '팀당 인터뷰 시간', min: 2, max: 8, v: 3, u: '분' },
      { k: 'rounds', l: '과정 회차 수', min: 1, max: 6, v: 5, u: '회' },
      { k: 'cls', l: '학급 수', min: 1, max: 6, v: 2, u: '반' }
    ];
    inp.innerHTML = F.map(function (f) {
      return '<label class="card nonext" style="display:grid;gap:8px"><span style="font-size:21px;font-weight:700">' + f.l + ' <b data-o="' + f.k + '" style="color:var(--ai)">' + f.v + f.u + '</b></span>' +
        '<input type="range" id="calc_' + f.k + '" min="' + f.min + '" max="' + f.max + '" value="' + f.v + '" data-k="' + f.k + '" style="width:100%;accent-color:#ef5d3c"></label>';
    }).join('') + '<label class="card nonext" style="display:flex;gap:10px;align-items:center;font-size:20px"><input type="checkbox" id="calc_2027" style="width:22px;height:22px"> 2027년 단가(약 두 배)</label>';
    function upd() {
      var v = {}; F.forEach(function (f) { v[f.k] = +inp.querySelector('[data-k="' + f.k + '"]').value; inp.querySelector('[data-o="' + f.k + '"]').textContent = v[f.k] + f.u; });
      var per = v.teams * (v.min + 0.5);
      var recMin = v.teams * v.min * v.rounds * v.cls + v.teams * 8 * v.cls;
      var won = recMin * ((inp.querySelector('#calc_2027').checked ? 230 : 120) / 40);
      out.innerHTML = '<div class="card"><p>한 반 한 회차</p><div class="big">' + Math.round(per) + '<small>분</small></div><p>' + (per <= 50 ? '한 차시(50분) 안' : '한 차시를 넘음: 두 차시로 나누거나 팀당 시간을 줄인다') + '</p></div>' +
        '<div class="card"><p>한 학기 녹음(최종 문답 팀당 8분 포함)</p><div class="big">' + Math.round(recMin) + '<small>분</small></div></div>' +
        '<div class="card"><p>전사 비용(Gemini 3.8 Flash)</p><div class="big">' + Math.round(won).toLocaleString('ko-KR') + '<small>원</small></div><p>40분 녹음 한 개 약 ' + (inp.querySelector('#calc_2027').checked ? 230 : 120) + '원 기준</p></div>';
    }
    inp.addEventListener('input', upd); upd();
  };

  // 탭(여러 개 가능)
  W.tabs = function (el) {
    el.querySelectorAll('[data-tabs]').forEach(function (seg) {
      var name = seg.dataset.tabs, pane = el.querySelector('[data-pane="' + name + '"]');
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('[data-t]'); if (!b) return;
        seg.querySelectorAll('[data-t]').forEach(function (x) { x.classList.toggle('on', x === b); });
        pane.querySelectorAll('[data-p]').forEach(function (p) { p.hidden = p.dataset.p !== b.dataset.t; });
      });
    });
  };

  // 도입 단계와 제도·윤리 점검
  var LV = [
    { need: ['구글 계정(시트·드라이브·Apps Script)', '아이폰(사파리)', '무선 마이크 2개(선택)', '전사용 Gemini API 키(유료 등급)'], how: '루브릭 파일 작성 → setup() → 웹 앱 배포 → 연결 QR', hard: '중간 이하. 루브릭 JSON 작성이 가장 어렵다' },
    { need: ['1단계 전부', 'Upstage(Solar) 키(선택, 없으면 Gemini)', '깃허브 classic 토큰(public_repo) 또는 클래스룸'], how: '전사 뒤 강점·가이드 초안 → 교사가 고쳐 이슈·클래스룸으로', hard: '중간' },
    { need: ['2단계 전부', '맥(launchd)과 클로드 CLI 구독', '스트림릿 클라우드(실습실)', '교과 시나리오 제작(설계·문장·검토)'], how: '매일 저장소 확인 → 댓글 초안, 세특 근거 수집, 실습실', hard: '높음. 지금은 이 사례의 교사 환경에 맞춰져 있다' }
  ];
  var ETH = ['녹음 사실과 외부 AI 전송을 안내했다', '공개 저장소면 학번·이름 공개 동의를 받았다', '학교 계정(워크스페이스)에 두는지 정했다', '평가계획에 구술 점수 반영 방식을 적었다', '녹음 보관 기간을 정했다', '외부 전송이 어려우면 로컬 전사(Whisper)를 쓴다'];
  W.levels = function (el) {
    var seg = el.querySelector('[data-levels]'), pane = el.querySelector('#lvPane');
    function show(i) {
      var l = LV[i];
      seg.querySelectorAll('[data-l]').forEach(function (b) { b.classList.toggle('on', +b.dataset.l === i); });
      pane.innerHTML = '<div class="card"><h3>필요한 것</h3><ul class="pts t" style="margin-top:8px">' + l.need.map(function (x) { return '<li style="font-size:23px">' + x + '</li>'; }).join('') + '</ul></div>' +
        '<div class="card"><h3>흐름</h3><p style="font-size:22px;color:var(--ink)">' + l.how + '</p></div><div class="card"><h3>기술 부담</h3><p style="font-size:22px">' + l.hard + '</p></div>';
    }
    seg.addEventListener('click', function (e) { var b = e.target.closest('[data-l]'); if (b) show(+b.dataset.l); });
    show(0);
    el.querySelector('#ethics').innerHTML = ETH.map(function (x, i) {
      return '<label class="nonext" style="display:flex;gap:12px;align-items:flex-start;font-size:21px;line-height:1.45;cursor:pointer"><input type="checkbox" id="eth' + i + '" style="width:22px;height:22px;margin-top:4px;accent-color:#5546e8">' + x + '</label>';
    }).join('');
  };


  // 두 어려움: 교사가 피드백을 직접 쓰면 드는 시간(가정 계산)
  W.pain = function (el) {
    var box = el.querySelector('#painCalc');
    var F = [{ k: 't', l: '팀', min: 4, max: 15, v: 12, u: '팀' }, { k: 'r', l: '회차', min: 1, max: 6, v: 6, u: '회' }, { k: 'm', l: '팀당 작성', min: 3, max: 20, v: 10, u: '분' }];
    box.innerHTML = '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span style="font-size:16px;color:var(--muted)">피드백을 <b style="color:var(--ink)">직접 쓴다면</b>(가정)</span><span id="painOut" style="font-size:20px;margin-left:auto"></span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:6px">' + F.map(function (f) {
        return '<label style="display:flex;align-items:center;gap:8px;font-size:16px;white-space:nowrap;min-width:0">' + f.l + ' <b data-o="' + f.k + '" style="color:var(--student);font-size:18px;min-width:42px">' + f.v + f.u + '</b><input type="range" id="pain_' + f.k + '" min="' + f.min + '" max="' + f.max + '" value="' + f.v + '" data-k="' + f.k + '" style="accent-color:#e08a00;flex:1;min-width:0"></label>';
      }).join('') + '</div>';
    function upd() {
      var v = {}; F.forEach(function (f) { v[f.k] = +box.querySelector('[data-k="' + f.k + '"]').value; box.querySelector('[data-o="' + f.k + '"]').textContent = v[f.k] + f.u; });
      var min = v.t * v.r * v.m;
      box.querySelector('#painOut').innerHTML = '한 반 <b style="font-size:30px;color:var(--ink)">' + (min / 60).toFixed(1) + '시간</b> <span style="color:var(--muted)">· 두 반 ' + (min * 2 / 60).toFixed(1) + '시간</span>';
    }
    box.addEventListener('input', upd); upd();
  };

  // 바꾼 것: 같은 5주를 지금까지 / AI TA와 함께로 비교
  W.ba = function (el) {
    var grid = el.querySelector('#baGrid'), seg = el.querySelector('#baSeg'), cnt = el.querySelector('#baCount');
    var ROWS = [
      { k: '평가', before: [0, 0, 0, 0, ['최종 발표·보고서']], after: [['① 주제·데이터'], ['② 살펴보기·전처리'], ['③ 모델 후보'], ['④ 지표', '⑤ 해석·한계'], ['최종 포스터 문답']], c: 'var(--teacher)' },
      { k: '피드백', before: [0, 0, 0, 0, ['발표 뒤 한 번']], after: [['이슈: 강점·가이드', '저녁 댓글 초안'], ['이슈', '저녁 댓글 초안'], ['이슈', '저녁 댓글 초안'], ['이슈', '저녁 댓글 초안'], ['최종 문답']], c: 'var(--student)' },
      { k: '과정 기록', before: [['보이지 않음'], ['보이지 않음'], ['보이지 않음'], ['보이지 않음'], ['결과물']], after: [['커밋·log 4줄', '녹음·전사'], ['커밋·log', '녹음·전사'], ['커밋·log', '녹음·전사'], ['커밋·log', '녹음·전사'], ['포스터·README']], c: 'var(--ok)' },
      { k: '교사', before: [['순회'], ['순회'], ['순회'], ['순회'], ['채점·피드백 작성']], after: [['묻고 판단·승인'], ['묻고 판단·승인'], ['묻고 판단·승인'], ['묻고 판단·승인'], ['묻고 판단·승인']], c: 'var(--teacher)' },
      { k: 'AI TA', before: [0, 0, 0, 0, 0], after: [['받아 적기·초안'], ['받아 적기·초안'], ['저장소 확인'], ['근거 모으기'], ['근거 모으기']], c: 'var(--ai)' }
    ];
    var COUNT = [['평가 기회', '1', '6'], ['피드백', '1번', '매주'], ['과정 근거', '결과물', '시간순 기록']];
    function draw(v) {
      seg.querySelectorAll('[data-v]').forEach(function (b) { b.classList.toggle('on', +b.dataset.v === v); });
      cnt.innerHTML = COUNT.map(function (c) { return '<div class="card" style="padding:10px 16px;min-width:150px"><div style="font-size:15px;color:var(--muted)">' + c[0] + '</div><div style="font-size:30px;font-weight:800;color:' + (v ? 'var(--ai)' : 'var(--ink)') + '">' + (v ? c[2] : c[1]) + '</div></div>'; }).join('');
      var h = '<div style="display:grid;grid-template-columns:150px repeat(5,1fr);gap:8px;font-size:18px">';
      h += '<div></div>' + [1, 2, 3, 4, 5].map(function (w) { return '<div style="text-align:center;color:var(--muted);font-weight:700">' + w + '주</div>'; }).join('');
      ROWS.forEach(function (r, ri) {
        h += '<div style="font-weight:800;font-size:21px;display:flex;align-items:center;color:' + r.c + '">' + r.k + '</div>';
        (v ? r.after : r.before).forEach(function (cell, ci) {
          var items = cell || [];
          var faint = !v && items.length && /보이지 않음|순회/.test(items[0]);
          h += '<div style="min-height:62px;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:5px;justify-content:center;background:' + (items.length && !faint ? 'var(--soft)' : 'transparent') + ';border:1px ' + (items.length ? 'solid' : 'dashed') + ' var(--line);opacity:0;transform:translateY(8px);transition:all .35s ' + (ri * 5 + ci) * 0.03 + 's" class="baCell">' +
            items.map(function (x) { return '<span style="font-weight:' + (faint ? 400 : 700) + ';color:' + (faint ? 'var(--faint)' : 'var(--ink)') + '">' + x + '</span>'; }).join('') + '</div>';
        });
      });
      grid.innerHTML = h + '</div>';
      requestAnimationFrame(function () { requestAnimationFrame(function () { grid.querySelectorAll('.baCell').forEach(function (c) { c.style.opacity = 1; c.style.transform = 'none'; }); }); });
    }
    seg.addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (b) draw(+b.dataset.v); });
    el.addEventListener('step', function (e) { draw(e.detail >= 1 ? 1 : 0); });
    draw(window.DECK && window.DECK.cur().step >= 1 ? 1 : 0);
  };

  // 결정은 교사만: 초안을 누르면 교사에게 가고, 교사가 올리거나 버린다
  W.gate = function (el) {
    var box = el.querySelector('#gateBox');
    var AI = [
      { t: '받아 적은 글(전사)', to: 2, by: 'Gemini' },
      { t: '강점·가이드 초안', to: 0, by: 'Solar' },
      { t: '저장소 댓글 초안', to: 0, by: '팅커비스' },
      { t: 'log 질문 후보', to: 1, by: '팅커비스' },
      { t: '세특 근거 모음', to: 3, by: '스크립트' }
    ];
    var DEST = [
      { t: '팀 저장소 이슈·댓글', who: '학생이 본다', c: 'var(--student)' },
      { t: '다음 구술의 꼬리질문', who: '교사만', c: 'var(--teacher)' },
      { t: '구술 기록(시트)', who: '교사만', c: 'var(--teacher)' },
      { t: '학기말 세특', who: '교사가 쓴다', c: 'var(--teacher)' }
    ];
    box.innerHTML = '<div class="col" style="flex:1;gap:10px"><div style="font-weight:800;color:var(--ai);font-size:22px">AI TA의 초안</div>' +
      AI.map(function (a, i) { return '<button class="btn" type="button" data-a="' + i + '" style="text-align:left;border-left:8px solid var(--ai);display:flex;justify-content:space-between;align-items:center"><span>' + a.t + '</span><span class="chip" style="font-size:14px">' + a.by + '</span></button>'; }).join('') + '</div>' +
      '<div class="col" style="flex:1.1;gap:10px"><div style="font-weight:800;color:var(--teacher);font-size:22px">교사</div><div id="gTeacher" class="card" style="flex:1;border:3px solid var(--teacher);display:flex;flex-direction:column;gap:12px;justify-content:center"></div>' +
      '<div class="card" style="padding:12px 16px"><p style="color:var(--ink)"><b>점수·등급</b>은 교사만 매긴다. AI의 초안에는 들어가지 않는다.</p></div></div>' +
      '<div class="col" style="flex:1;gap:10px"><div style="font-weight:800;color:var(--student);font-size:22px">나가는 곳</div>' +
      DEST.map(function (d, i) { return '<div class="card" data-d="' + i + '" style="padding:12px 16px;transition:all .3s"><h3 style="font-size:21px;margin:0">' + d.t + '</h3><p style="font-size:16px">' + d.who + '</p><div class="gLog" style="font-size:15px;color:var(--ok);margin-top:4px"></div></div>'; }).join('') + '</div>';
    var T = box.querySelector('#gTeacher'), sel = -1;
    function idle() { T.innerHTML = '<p style="font-size:22px;color:var(--muted);text-align:center">왼쪽 초안을 누르면 여기로 온다</p>'; }
    function pick(i) {
      sel = i;
      box.querySelectorAll('[data-a]').forEach(function (b) { b.classList.toggle('on', +b.dataset.a === i); });
      T.innerHTML = '<div style="font-size:16px;color:var(--muted)">검토 중</div><div style="font-size:26px;font-weight:800">' + AI[i].t + '</div><div style="font-size:18px;color:var(--muted)">읽고, 고치고, 정한다</div>' +
        '<div style="display:flex;gap:10px;margin-top:6px"><button class="btn" type="button" data-g="ok" style="background:var(--teacher);color:#fff;border-color:var(--teacher)">고쳐서 올림</button><button class="btn" type="button" data-g="no">버림</button></div>';
    }
    box.addEventListener('click', function (e) {
      var a = e.target.closest('[data-a]'); if (a) { pick(+a.dataset.a); return; }
      var g = e.target.closest('[data-g]'); if (!g || sel < 0) return;
      var it = AI[sel];
      if (g.dataset.g === 'ok') {
        var d = box.querySelector('[data-d="' + it.to + '"]');
        d.querySelector('.gLog').textContent = '✓ ' + it.t + ' (교사 승인)';
        d.style.boxShadow = '0 0 0 4px ' + DEST[it.to].c; setTimeout(function () { d.style.boxShadow = ''; }, 900);
        T.innerHTML = '<p style="font-size:22px;text-align:center"><b>' + it.t + '</b><br>→ ' + DEST[it.to].t + '</p>';
      } else {
        T.innerHTML = '<p style="font-size:22px;text-align:center"><b>' + it.t + '</b><br><span style="color:var(--muted)">버림: 아무 데도 나가지 않는다</span></p>';
      }
      box.querySelectorAll('[data-a]').forEach(function (b) { b.classList.remove('on'); }); sel = -1;
    });
    idle();
  };

  // 개인정보 데이터 지도
  var PV = [
    { t: '녹음(목소리)', where: '교사 구글 드라이브의 비공개 폴더(올리기 전까지는 교사 아이폰)', who: '교사', out: '받아 적기를 위해 녹음과 팀 이름·질문·방법이 Google Gemini API로. 유료 등급은 약관상 입력을 모델 개선에 쓰지 않는다(약관은 다시 확인)', keep: '성적 확정·이의 신청 기간까지. 그 뒤 교사 앱의 \'녹음 보관\'에서 한꺼번에 지우면 받아 적은 글만 남는다', less: '로컬 Whisper로 수업 뒤 교사 맥에서 받아 적으면 밖으로 나가지 않는다', img: 'A9_녹음보관.png' },
    { t: '받아 적은 글·점수·메모', where: '교사 계정의 구글 시트', who: '교사', out: '피드백 초안을 위해 받아 적은 글과 팀 이름·질문·방법이 Upstage(Solar) API로, 인터뷰 이슈 초안을 위해 Anthropic(Claude)으로. 점수와 학생 명단은 보내지 않는다', keep: '학기 기록이 끝날 때까지', less: '피드백 초안을 끄면(설정 하나) 받아 적은 글은 밖으로 나가지 않는다' },
    { t: '팀 저장소(README·log·코드)', where: '학생 계정의 깃허브 공개 저장소', who: '누구나', out: '수업 있는 날 저녁, 바뀐 내용 요약이 Anthropic(Claude)으로(초안 작성)', keep: '학생이 관리', less: '시작 전 학번·이름 공개 동의. 거부하면 닉네임을 설문으로 등록. 비공개 저장소나 클래스룸 제출로도 운영할 수 있다' },
    { t: '이슈·댓글', where: '학생 저장소(공개)', who: '누구나', out: '없음', keep: '학생이 관리', less: '교사가 승인한 글만 올라간다. 점수·등급·보완할 점이 없고 AI 작성 표기가 붙는다' },
    { t: '세특 근거', where: '교사 컴퓨터의 비공개 폴더(저장소에 올리지 않음)', who: '교사', out: '없음(모으는 일은 스크립트가 한다)', keep: '학기말 세특 작성까지', less: '항목 수준·이슈 문안은 판단 참고용이고 그대로 옮기지 않는다' },
    { t: '연결 정보·API 키', where: 'Apps Script 스크립트 속성, 교사 기기의 앱 저장소', who: '교사', out: '없음', keep: '-', less: '화면·저장소·링크 주소에 남기지 않는다' },
    { t: '이 발표의 화면', where: '공개 발표 자료', who: '누구나', out: '-', keep: '-', less: '찍기 직전에 학번·이름·팀 이름·저장소·학생 계정·점수를 흐리고, 흐리지 않은 원본은 남기지 않았다' }
  ];
  W.privacy = function (el) {
    var list = el.querySelector('#pvList'), pane = el.querySelector('#pvPane');
    list.innerHTML = PV.map(function (p, i) { return '<button class="btn" type="button" data-p="' + i + '" style="text-align:left;padding:12px 16px">' + p.t + '</button>'; }).join('');
    function show(i) {
      var p = PV[i];
      list.querySelectorAll('[data-p]').forEach(function (b) { b.classList.toggle('on', +b.dataset.p === i); });
      var row = function (k, v, c) { return '<div style="display:grid;grid-template-columns:170px 1fr;gap:14px;padding:12px 0;border-bottom:1px solid var(--line)"><b style="font-size:20px;color:' + (c || 'var(--muted)') + '">' + k + '</b><span style="font-size:22px;line-height:1.5">' + v + '</span></div>'; };
      pane.innerHTML = '<div class="card" style="flex:1;background:#fff"><h3 style="font-size:30px;margin-bottom:6px">' + p.t + '</h3>' +
        row('저장 위치', p.where) + row('볼 수 있는 사람', p.who) + row('밖으로 나가는 곳', p.out, p.out === '없음' || p.out === '-' ? 'var(--ok)' : 'var(--ai)') + row('보관', p.keep) + row('줄이는 방법', p.less, 'var(--teacher)') +
        (p.img ? '<div style="margin-top:12px;display:flex;gap:12px;align-items:flex-start"><img class="shot" alt="" src="captures/' + encodeURI(p.img) + '" style="max-height:170px"><span style="font-size:16px;color:var(--muted)">교사 앱 설정의 녹음 보관 카드</span></div>' : '') + '</div>';
    }
    list.addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (b) show(+b.dataset.p); });
    show(0);
  };

  // 실제로 오가는 글: 한 팀의 기록이 보낸 글과 받은 글(content/dataflow.js, scripts/build_dataflow.py가 만든다)
  W.dflow = function (el) {
    var D = window.DATAFLOW || {}, Wt = D.watch || {}, se = D.session || {};
    var fmt = function (t) {
      return esc(t || '(없음)').replace(/⟦가림⟧/g, '<span class="mk">가림가림</span>')
        .replace(/^(\[[^\]\n]{1,14}\])/gm, '<span class="lb">$1</span>').replace(/^(#{1,3} .*|인터뷰에서 보인 강점|다음 단계 가이드.*)$/gm, '<span class="hd">$1</span>');
    };
    var X = [
      { g: 0, n: '교사 앱 → 구술 서버', s: '교사 구글 계정', k: 'in', sT: '기록 한 줄 + 녹음', sent: D.app_to_server, bT: '교사 계정에 남는 것', bk: 't',
        back: '[시트 「기록」 탭의 칸]\n' + (D.session_cols || '') + '\n\n[드라이브]\n비공개 폴더에 녹음 파일. 성적 확정 뒤 교사 앱에서 한꺼번에 지우고 받아 적은 글만 남긴다.\n\n[다음]\n저장하면 서버가 받아 적기와 초안 쓰기를 차례로 시작한다. 교사 앱은 기다리지 않고 다음 팀으로 넘어간다.\n\n루브릭 수준(■)은 이 흐름의 어떤 AI 요청에도 들어가지 않는다.', offL: '밖으로 나가는 것', off: '없음' },
      { g: 0, n: '서버 → Gemini', s: '받아 적기 · ' + (D.gemini_model || ''), k: 'ext', sT: '녹음 + 받아쓰기 지시', sent: D.gemini_sent, bT: '받아 적은 대화', back: D.gemini_back, off: '점수 · 학생 명단' },
      { g: 0, n: '서버 → Solar', s: '초안 · ' + (D.solar_model || ''), k: 'ext', sT: '회차 · 다음 회차 · 팀 질문 + 받아 적은 대화', sent: D.solar_sent, bT: '강점 · 가이드 초안 (교사 참고용)', back: D.solar_back,
        off: '점수 · 학생 명단 · 녹음', note: '이 초안은 학생에게 바로 가지 않는다.' + (D.solar_date ? ' 같은 기록으로 지금 서버가 만드는 초안을 ' + D.solar_date + '에 다시 받아 보였다.' : '') },
      { g: 0, n: '교사 → 팀 저장소', s: '깃허브 이슈', k: 'in', sT: '녹취만 본 초안 (Solar)', sk: 't', sent: D.solar_back, bT: '학생이 받은 이슈 (교사 승인)', bL: '올라간 것', back: D.issue_body,
        offL: '올리지 않는 것', off: '점수 · 받아 적은 대화', note: '올린 글은 클로드가 저장소와 데이터를 직접 열어 확인한 사실로 다시 설계하고 솔라가 쓴 뒤, 교사가 팀별 전체 문안을 읽고 승인했다.' },
      { g: 1, n: '맥 → Claude', s: '저장소 변화 읽기', k: 'ext', sT: '바뀐 저장소 (커밋 · 파일 차이 · log)', sent: Wt.claude_sent, bT: '설계서 (강점 재료 · 가이드 재료)', back: Wt.claude_back, off: '점수 · 녹음', note: Wt.when ? Wt.when + ' 저장소 확인에서 바뀐 한 팀' : '' },
      { g: 1, n: '맥 → Solar', s: '댓글 쓰기 · solar-pro4', k: 'ext', sT: '설계서로 만든 집필 요청', sent: Wt.solar_sent, bT: '댓글 초안 (교사 승인 전)', back: Wt.solar_back, off: '점수 · 녹음', note: '교사가 앱에서 읽고 올리기를 누를 때만 학생 저장소에 댓글로 올라간다.' }
    ];
    var route = el.querySelector('#dfRoute'), pane = el.querySelector('#dfPane'), foot = el.querySelector('#dfFoot');
    route.className = 'dfr';
    route.innerHTML = '<span class="grp" style="grid-column:1/span 4">인터뷰 날 · ' + esc((se.cpNo || '') + ' ' + (se.cpTitle || '')) + ' · 녹음 ' + Math.round((se.durationSec || 0) / 60) + '분</span>' +
      '<span class="sep" style="grid-column:5"></span><span class="grp" style="grid-column:6/span 2">수업이 없는 날 · 18시 저장소 확인</span>' +
      X.map(function (x, i) { return '<button type="button" class="' + x.k + '" data-x="' + i + '" style="grid-column:' + (i < 4 ? i + 1 : i + 2) + '"><b>' + (i + 1) + '. ' + x.n + '</b><span class="pipe"><i></i></span><small>' + esc(x.s) + '</small></button>'; }).join('');
    var len = function (t) { return (t || '').length.toLocaleString() + '자'; };
    function show(i) {
      var x = X[i];
      route.querySelectorAll('[data-x]').forEach(function (b) { b.classList.toggle('on', +b.dataset.x === i); });
      pane.innerHTML = '<div class="dfp"><div class="dfh"><span class="dir' + (x.sk ? ' ' + x.sk : '') + '">' + (x.sk ? '교사가 읽은 것' : '보내는 것') + '</span><b>' + x.sT + '</b><span class="n">' + len(x.sent) + '</span></div><div class="dfx">' + fmt(x.sent) + '</div></div>' +
        '<div class="dfp"><div class="dfh"><span class="dir back' + (x.bk ? ' ' + x.bk : '') + '">' + (x.bL || (x.bk ? '남는 것' : '돌아오는 것')) + '</span><b>' + x.bT + '</b><span class="n">' + (x.bk ? '' : len(x.back)) + '</span></div><div class="dfx">' + fmt(x.back) + '</div></div>';
      foot.className = 'dff';
      foot.innerHTML = '<span class="off"><em>' + (x.offL || '보내지 않는 것') + '</em> ' + x.off + '</span>' + (x.note ? '<span>' + x.note + '</span>' : '');
    }
    route.addEventListener('click', function (e) { var b = e.target.closest('[data-x]'); if (b) show(+b.dataset.x); });
    el.addEventListener('step', function (e) { show(Math.min(X.length - 1, e.detail || 0)); });
    show(0);
  };

  // 마지막 장의 QR(라이브러리가 없으면 주소만)
  W.qr = function (el) {
    var base = location.origin + location.pathname.replace(/index\.html$/, '');
    var L = [{ t: '이 발표 자료', u: base }, { t: '검토 문서', u: base + 'review/' }, { t: '데이터 과학 실습실', u: 'https://2026dgds.streamlit.app' }];
    var box = el.querySelector('#qrs');
    box.innerHTML = L.map(function (l, i) { return '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:190px"><div id="qr' + i + '" style="background:#fff;padding:10px;border:1px solid var(--line);border-radius:12px;min-height:170px;min-width:170px"></div><b style="font-size:19px">' + l.t + '</b><a href="' + l.u + '" target="_blank" rel="noopener" style="font-size:12.5px;color:var(--muted);word-break:break-all;text-align:center">' + l.u.replace(/^https?:\/\//, '') + '</a></div>'; }).join('');
    if (window.QRCode && /^https?:/.test(location.protocol)) L.forEach(function (l, i) { new window.QRCode(el.querySelector('#qr' + i), { text: l.u, width: 150, height: 150 }); });
  };
})();
