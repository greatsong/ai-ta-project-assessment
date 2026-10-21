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

  // 마지막 장의 QR(라이브러리가 없으면 주소만)
  W.qr = function (el) {
    var base = location.origin + location.pathname.replace(/index\.html$/, '');
    var L = [{ t: '이 발표 자료', u: base }, { t: '검토 문서', u: base + 'review/' }, { t: '데이터 과학 실습실', u: 'https://2026dgds.streamlit.app' }];
    var box = el.querySelector('#qrs');
    box.innerHTML = L.map(function (l, i) { return '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:190px"><div id="qr' + i + '" style="background:#fff;padding:10px;border:1px solid var(--line);border-radius:12px;min-height:170px;min-width:170px"></div><b style="font-size:19px">' + l.t + '</b><a href="' + l.u + '" target="_blank" rel="noopener" style="font-size:12.5px;color:var(--muted);word-break:break-all;text-align:center">' + l.u.replace(/^https?:\/\//, '') + '</a></div>'; }).join('');
    if (window.QRCode && /^https?:/.test(location.protocol)) L.forEach(function (l, i) { new window.QRCode(el.querySelector('#qr' + i), { text: l.u, width: 150, height: 150 }); });
  };
})();
