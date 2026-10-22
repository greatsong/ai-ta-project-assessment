/* 슬라이드 내용. 프로젝트가 진행되면 이 파일과 captures/, content/stats.js만 바꾼다(엔진은 deck/).
   html은 문자열이나 함수(S = stats). [data-s="k"]는 k번째 클릭부터 보인다. notes는 N키 발표자 노트(줄마다 한 문단). */
(function () {
  var C = function (f) { return 'captures/' + encodeURI(f); };
  var shot = function (f, cap, attr) { return '<div class="shotbox"' + (attr || '') + '><div style="display:flex;flex-direction:column;align-items:center;min-height:0"><img class="shot" alt="" src="' + C(f) + '">' + (cap ? '<div class="cap">' + cap + '</div>' : '') + '</div></div>'; };
  var phone = function (f, lab, attr) { return '<div' + (attr || '') + '><div class="phone"><img alt="" src="' + C(f) + '"></div>' + (lab ? '<div class="lab">' + lab + '</div>' : '') + '</div>'; };
  var frame = function (f, cap, pan, w, h, attr) { return '<div' + (attr || '') + ' style="display:flex;flex-direction:column;align-items:center"><div class="frame" style="--fw:' + (w || 900) + 'px;--fh:' + (h || 560) + 'px"' + (pan ? ' data-pan="' + pan + '"' : '') + '><img alt="" src="' + C(f) + '"></div>' + (cap ? '<div class="cap">' + cap + '</div>' : '') + '</div>'; };
  var ttl = function (t, tag, cls) { return '<div class="ttl"><h2>' + t + '</h2>' + (tag ? '<span class="tag ' + (cls || '') + '">' + tag + '</span>' : '') + '</div>'; };
  var done = function (S, id, cls) { var r = (S.oral && S.oral.rounds || []).filter(function (x) { return x.id === id; })[0]; return r ? r.done[cls] || 0 : 0; };
  var teams = function (S, cls) { return S.oral && S.oral.teams ? S.oral.teams[cls] || 0 : 0; };

  window.SLIDES = [
  // ── 시작 ─────────────────────────────────────────────
  { sec: '시작', title: '표지', html: function (S) { return '' +
    '<div style="flex:1;display:flex;align-items:center;gap:20px">' +
    '<div style="flex:0 0 730px;display:flex;flex-direction:column;justify-content:center;gap:24px;padding-left:10px">' +
    '<div class="chip" style="align-self:flex-start;background:#fff0eb;border-color:#ffd9cc;color:var(--ai)">진행 중인 수업 사례 · 2026 2학기 『데이터 과학』</div>' +
    '<h1 style="margin:0;font-size:70px;line-height:1.2;letter-spacing:-.03em;font-weight:800">AI 조교와 함께 하는<br>과정중심<br>프로젝트 수업 평가<br><span style="color:var(--muted);font-weight:700;font-size:52px">사례 공유</span></h1>' +
    '<div style="display:flex;gap:12px;align-items:center;font-size:24px;color:var(--muted);flex-wrap:wrap"><b style="color:var(--ink)">당곡고등학교 송석리</b><span>·</span><span>팀 프로젝트 구술 평가와 AI 조교 운영</span></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><span class="chip" style="color:var(--student)">학생 · 질문하고 검증하고 설명한다</span><span class="chip" style="color:var(--teacher)">교사 · 묻고 평가한다</span><span class="chip" style="color:var(--ai)">AI 조교 · 기록하고 초안을 쓴다</span></div>' +
    '</div>' +
    '<div style="flex:1;min-width:0;height:100%;display:flex;align-items:center;justify-content:center"><img alt="" src="assets/art/cover.webp" style="max-width:100%;max-height:660px;object-fit:contain;animation:coverin .9s ease-out both"></div>' +
    '</div><div class="credit">옥토캣 모나는 GitHub의 캐릭터</div>'; },
    notes: '안녕하십니까. 당곡고등학교에서 데이터 과학을 가르치는 송석리입니다.\n오늘은 지금 진행 중인 팀 프로젝트 수업에서 AI를 조교로 두고 과정 중심 평가를 운영하는 사례를 실제 화면으로 보여 드리겠습니다.\n화면의 학생 정보는 모두 흐리게 처리했습니다. 수치는 오른쪽 위에 적힌 시각에 시스템에서 바로 모은 값입니다.' },

  { sec: '시작', title: '두 가지 어려움', widget: 'pain', html: function () {
    var F = function (f, st) { return '<img alt="" src="assets/art/' + f + '.webp" style="' + (st || '') + '">'; };
    return ttl('프로젝트 수업의 오래된 두 어려움') +
    '<p class="lead"><b>AI가 결과물을 함께 만드는 지금</b>, 두 어려움은 더 커졌다.</p>' +
    '<div class="body" style="gap:26px">' +
      '<div class="card col" data-s="1" style="border-top:8px solid var(--teacher);gap:10px;padding:16px 20px"><h3 style="font-size:30px;margin:0">① 과정을 평가하기 어렵다</h3>' +
        '<div class="pic" style="flex:1;min-height:0">' + F('pain_1', 'object-position:60% 40%') + '<div class="pic-fog"></div>' +
          '<span class="scn-chip" style="left:14px;bottom:14px;color:var(--teacher)">1~4주: 무엇을 왜 정했는지 보이지 않는다</span>' +
          '<span class="scn-chip" style="right:14px;top:14px">5주: 결과물만 남는다</span></div>' +
        '<p style="font-size:22px;color:var(--muted);margin:0">AI가 코드를 써 주면 학생의 몫은 더 보이지 않는다</p></div>' +
      '<div class="card col" data-s="2" style="border-top:8px solid var(--student);gap:10px;padding:16px 20px"><h3 style="font-size:30px;margin:0">② 학생마다 피드백하기 어렵다</h3>' +
        '<div class="pic" style="flex:1;min-height:0">' + F('pain_2', 'object-position:50% 45%') +
          '<span class="scn-chip" style="left:14px;top:14px;color:#b46e00">팀마다, 회차마다, 학생마다</span></div>' +
        '<div data-s="3" id="painCalc" class="nonext" style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px 14px"></div></div>' +
    '</div>' +
    ''; },
    notes: '프로젝트 수업을 해 보신 선생님들은 두 가지 어려움을 아실 겁니다.\n첫째, 과정을 평가하기 어렵습니다. 1주에서 4주까지 학생들이 무엇을 왜 정했는지는 안개 속에 있고, 교사가 보는 것은 5주의 결과물뿐입니다. 생성형 AI가 코드를 써 주면서 학생의 몫은 더 보이지 않게 되었습니다.\n둘째, 학생마다 피드백하기 어렵습니다. 팀마다 회차마다 피드백을 직접 쓰면 종이가 쌓이고 시간이 모자랍니다. 아래 계산기로 보시면 한 반에만 몇 시간이 듭니다.' },

  { sec: '시작', title: '해결의 흐름', widget: 'solve', steps: 5, html: function () {
    var A = function (f) { return 'assets/art/' + f + '.webp'; };
    var merge = '<svg class="fl-merge" viewBox="0 0 64 600" preserveAspectRatio="none">' +
      ['M0,125 C34,125 30,300 64,300', 'M0,320 C30,320 34,300 64,300', 'M0,515 C34,515 30,300 64,300'].map(function (d, i) {
        return '<path d="' + d + '"/><circle r="5"><animateMotion dur="1.8s" begin="' + (i * 0.4) + 's" repeatCount="indefinite" path="' + d + '"/></circle>'; }).join('') + '</svg>';
    return ttl('음성·기록·관찰이 피드백이 되기까지', '해결의 흐름', 'live') +
      '<p class="lead" style="margin-bottom:16px">세 가지 입력을 깃허브와 AI 조교가 정리하고, 교사가 검토한 내용만 학생의 피드백으로 전달됩니다.</p>' +
      '<div class="body nonext fl">' +
        '<div class="fl-col fl-in" data-s="1"><h4>입력 <b>세 갈래</b></h4>' +
          '<div class="fl-card"><img alt="" src="' + A('cycle_1_sq') + '"><div><b>음성</b><span>구술 인터뷰 녹음<br>팀당 3분, 회차마다</span></div></div>' +
          '<div class="fl-card"><img alt="" src="' + A('cycle_2_sq') + '"><div><b>깃허브 기록</b><span>README·log·커밋<br>결정과 AI 검증</span></div></div>' +
          '<div class="fl-card"><img alt="" class="fig" src="' + A('fig_teacher_read') + '"><div><b>교사의 관찰</b><span>루브릭 수준 · 메모<br>인터뷰 중 꼬리질문</span></div></div></div>' +
        '<div data-s="2">' + merge + '</div>' +
        '<div class="fl-col fl-org" data-s="2"><h4>정리 <b>깃허브 + AI 조교</b></h4><div class="fl-big">' +
          '<div class="fl-figs"><img alt="" src="' + A('fig_mona') + '" style="height:110px"><img alt="" src="' + A('fig_ai') + '"></div>' +
          '<ul class="fl-list"><li><b>녹음</b> → 받아 적은 글</li><li><b>저장소 변화</b> → 요약</li><li><b>강점 · 다음 단계 가이드</b> 초안</li><li><b>학생별 근거</b> 시간순 모음</li></ul></div></div>' +
        '<div class="fl-arr" data-s="3"><span>보고</span><i></i></div>' +
        '<div class="fl-col fl-tc" data-s="3"><h4>교사 <b>논의하고 결정</b></h4><div class="fl-big">' +
          '<div class="fl-figs"><img alt="" src="' + A('fig_teacher_read') + '"><span class="pb-talk"><i></i><i></i><em>⇄</em></span><img alt="" class="ai" src="' + A('fig_ai') + '"></div>' +
          '<div class="fl-stamps"><span class="stamp ok">그대로 반영</span><span class="stamp wait">고쳐서 반영</span><span class="stamp no">반영하지 않음</span></div>' +
          '<p style="font-size:15px;color:var(--muted);margin:2px 0 0">점수·등급은 교사만 매긴다</p></div></div>' +
        '<div class="fl-arr to-st" data-s="4"><span>피드백</span><i></i></div>' +
        '<div class="fl-col fl-st" data-s="4"><h4>학생 <b>깃허브 이슈 · 댓글</b></h4><div class="fl-big">' +
          '<div class="scene-img"><img alt="" src="' + A('cycle_4') + '"></div>' +
          '<div class="fl-issue"><div class="t"><img alt="" src="' + A('fig_mona') + '">팅커비스) 구술 인터뷰 ① 이후</div><b>인터뷰에서 보인 강점</b>어떤 열을 쓰느냐는 질문에 바로 답했습니다…<b>다음 단계 가이드</b>☐ 표를 길게 바꿔 막대그래프로 살펴보기<br>☐ 빈칸·기호를 팀원과 정해 log에 기록하기</div>' +
          '<div class="fl-next" data-s="5"><img alt="" src="' + A('cycle_5_sq') + '"><div><b>다음 단계로</b><small>다음 작업 → 다음 인터뷰</small></div></div></div></div>' +
      '</div><div class="credit">옥토캣 모나는 GitHub의 캐릭터</div>'; },
    notes: '먼저 해결의 흐름을 설명드리겠습니다. 입력은 세 갈래로 나뉩니다. 구술 인터뷰의 음성, 학생이 깃허브에 남긴 활동 기록, 그리고 교사의 관찰 내용입니다.\n이 세 가지 입력은 깃허브와 AI 조교가 정리합니다. AI 조교는 음성 녹음 파일을 텍스트로 옮기고, 저장소의 변화 이력을 요약하며, 학생의 강점과 다음 단계를 위한 가이드 초안을 작성합니다. 이 과정에서 학생별 근거는 시간순으로 모아 정리됩니다.\n정리된 결과는 교사에게 보고됩니다. 교사는 AI 조교와 내용을 함께 검토하며, 원문 그대로 반영할지, 수정해 반영할지, 혹은 반영하지 않을지 최종 판단합니다.\n교사가 확정한 내용만 깃허브의 이슈와 댓글을 통해 학생에게 전달됩니다. 학생은 전달된 가이드를 확인하며 스스로 점검하고, 다음 단계로 나아갑니다.' },

  { sec: '시작', title: '무엇이 바뀌었나', widget: 'ba', steps: 1, html: '' +
    ttl('AI 조교와 깃허브로 바꾼 것', '눌러서 비교', 'live') +
    '<p class="lead">같은 5주 프로젝트. 평가와 피드백이 <b>마지막 한 번에서 매주로</b> 옮겨 갔다.</p>' +
    '<div style="display:flex;gap:18px;align-items:center;margin-bottom:16px"><div class="seg nonext" id="baSeg"><button class="btn on" data-v="0">지금까지</button><button class="btn" data-v="1">AI 조교와 함께</button></div><div id="baCount" style="display:flex;gap:12px;flex:1;justify-content:flex-end"></div></div>' +
    '<div id="baGrid" style="flex:1;min-height:0"></div>',
    notes: '같은 5주를 두 방식으로 비교해 보겠습니다. 지금까지는 평가도 피드백도 마지막 주 발표에 몰렸고, 과정은 결과물로만 남았습니다.\n(클릭) AI 조교와 깃허브를 쓰면 매주 구술 인터뷰가 있고, 그때마다 강점과 다음 단계 가이드가 팀 저장소 이슈로 돌아갑니다. 수업이 있는 날 저녁에는 저장소 변화에 댓글 초안이 생깁니다.\n교사가 하는 일도 바뀝니다. 받아 적고 정리하고 초안을 쓰는 일은 AI 조교가 하고, 교사는 묻고 판단하고 승인합니다.' },

  { sec: '시작', title: '결정은 교사만', widget: 'gate', steps: 4, html: function () { var g = (window.DATAFLOW || {}).gate || {}; return '' +
    ttl('모든 결정은 교사를 거친다', '한 팀의 실제 기록', 'live') +
    '<p class="lead" style="margin-bottom:14px">AI 조교가 만든 것은 모두 <b>초안</b>이다. 한 팀의 ' + (g.cpNo || '') + ' 인터뷰 전후를 다섯 초안으로 따라간다.</p>' +
    '<div class="body nonext" id="gateBox"></div>' +
    '<div class="gt-chips"><span class="chip">학생 저장소에는 교사가 올리기를 누른 글만</span><span class="chip">AI가 쓴 글에는 \'팅커비스)\' 표기</span><span class="chip">흐린 칸은 이름·학번·팀 이름</span></div><div class="credit">옥토캣 모나는 GitHub의 캐릭터</div>'; },
    notes: '가장 중요한 원칙입니다. AI 조교가 만드는 것은 모두 초안이고, 결정은 교사가 합니다. 한 팀의 실제 기록으로 따라가 보겠습니다.\n첫째, 3분 녹음을 받아 적은 글입니다. 학생에게는 보내지 않습니다. 노란 줄, 어떤 열을 쓰느냐는 질문에 학생이 바로 답한 장면이 강점의 근거가 됐습니다.\n둘째, 강점과 가이드 초안입니다. 첫 판은 잘한 점과 보완할 점 형식이었는데, 올리고 보니 고칠 곳이 너무 많아 아홉 팀 전부 회수했습니다. 평가하지 않고 장면과 의미, 다음에 할 일만 쓰도록 형식을 바꾼 둘째 판을 승인했습니다.\n셋째, 수업이 없는 날 바뀐 저장소를 읽고 만든 댓글 초안입니다. 지금 제 앱에서 기다리고 있습니다. 제가 올리기를 누르기 전에는 학생에게 가지 않습니다.\n넷째, 학생 log에서 다음 인터뷰 질문 후보를 만듭니다. 인터뷰에서 제가 쓴 질문만 남습니다.\n다섯째, 한 학생의 log, 구술, 이슈가 시간순으로 쌓입니다. 학기말에 제가 골라 세특을 씁니다. 점수와 등급은 어떤 초안에도 들어가지 않습니다.' },

  { sec: '시작', title: '한 바퀴', widget: 'cycle', steps: 6, html: '' +
    ttl('한 바퀴: 교실에서 다시 교실로', '한 팀의 실제 기록', 'live') +
    '<p class="lead" style="margin-bottom:10px">구술 인터뷰가 <b>기록</b>이 되고, AI와 교사를 거쳐 <b>피드백</b>이 되고, 다음 작업과 다음 인터뷰로 이어진다.</p>' +
    '<div class="body nonext" id="cyBox"></div><div class="credit">옥토캣 모나는 GitHub의 캐릭터</div>',
    notes: '이 수업이 도는 한 바퀴입니다. 한 팀의 실제 기록으로 보겠습니다.\n교실에서 제가 묻고 학생이 자기 말로 설명합니다. 녹음은 아이폰 앱이 맡습니다.\n녹음은 서버가 받아 적고, 학생은 인터뷰가 끝나고 네 시간 뒤 팀 log에 회귀로 하기로 한 결정과 AI 제안을 어떻게 받아들였는지 적었습니다.\nAI가 초안을 쓰고 제가 결정합니다. 첫 판은 회수했고, 형식을 바꾼 둘째 판을 승인했습니다.\n학생은 팀 저장소 이슈로 강점과 다음 단계 가이드를 받습니다. 가이드는 체크 목록이라 다음 작업이 됩니다.\n수업이 없는 날에도 저장소가 바뀌면 그날 확인해 댓글 초안을 만듭니다. 가운데 작은 고리입니다.\n그리고 다시 교실입니다. 다음 인터뷰에서는 학생 log에서 나온 질문을 씁니다. 이 한 바퀴를 다섯 번, 그리고 최종 문답으로 돕니다.' },

  { sec: '구조', title: '수업과 프로젝트', html: function (S) { return '' +
    ttl('수업과 팀 프로젝트', '2026 2학기') +
    '<p class="lead">공통 수업 뒤 <b>5주 팀 프로젝트</b>. 평가는 코드가 아니라 <b>판단 4축</b>으로 한다.</p>' +
    '<div class="body"><div class="col" style="flex:1.1;gap:18px">' +
      '<div style="display:flex;gap:16px">' +
        '<div class="card" style="flex:1"><div class="big">2<small>개 반</small></div><p style="margin-top:8px">약 27명씩, 2~3인 팀</p></div>' +
        '<div class="card" style="flex:1"><div class="big">' + (teams(S, 'E반') || 12) + '<small>팀</small></div><p style="margin-top:8px">E반 기준(B반은 등록 중)</p></div>' +
      '</div>' +
      '<div class="card"><h3>판단 4축</h3><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><span class="chip">질문 설정</span><span class="chip">데이터 감식</span><span class="chip">결과 해석</span><span class="chip">한계 인식</span></div><p style="margin-top:12px">회귀·분류·군집 가운데 팀이 고르고, AI는 코드를 쓰고, 학생은 무엇을 왜 골랐는지 설명한다.</p></div>' +
      '<div class="card"><h3>기록은 깃허브</h3><p>팀 저장소 하나에 README, 코드, 차례마다 쓰는 log. 공개 저장소로 하고 학번·이름 공개 동의를 받았다.</p></div>' +
    '</div><div class="col" style="flex:1.2"><div class="card" style="flex:1"><h3>구술 인터뷰 여섯 번</h3><div id="rounds" style="display:grid;gap:10px;margin-top:12px"></div></div></div></div>'; },
    widget: 'rounds',
    notes: '두 학급이 공통 수업을 마친 뒤 5주 동안 2~3명씩 팀 프로젝트를 합니다.\n평가 언어는 판단 4축입니다. 질문 설정, 데이터 감식, 결과 해석, 한계 인식입니다.\n오른쪽이 구술 인터뷰 여섯 번입니다. 과정 다섯 번과 최종 포스터 문답이고, 지금은 첫 회차까지 실시했습니다. 표시는 시스템에서 바로 읽은 실시 현황입니다.' },

  // ── 구조 ─────────────────────────────────────────────
  { sec: '구조', title: 'AI 조교는 넷', html: '' +
    ttl('AI 조교는 한 명이 아니다', '역할 나누기') +
    '<p class="lead">일마다 잘하는 모델을 쓰고, <b>결과가 어디로 가는지</b>를 정해 둔다.</p>' +
    '<div class="body" style="gap:18px;flex-wrap:wrap">' +
      '<div class="card col" data-s="1" style="border-left:8px solid var(--gemini)"><h3>Gemini 3.8 Flash</h3><p><b style="color:var(--ink)">녹음 받아 적기.</b> 선생님·학생을 구분하고 팀 이름·질문을 맥락으로 받는다.</p><p style="margin-top:10px">→ 시트의 기록 칸</p></div>' +
      '<div class="card col" data-s="2" style="border-left:8px solid var(--solar)"><h3>Solar Pro 4</h3><p><b style="color:var(--ink)">학생이 읽는 한글 문장.</b> 강점·가이드 문안, 실습실 대화의 대사.</p><p style="margin-top:10px">→ 교사 확인 뒤 이슈·실습실</p></div>' +
      '<div class="card col" data-s="3" style="border-left:8px solid var(--claude)"><h3>Claude · 팅커비스</h3><p><b style="color:var(--ink)">설계와 확인.</b> 매일 저장소 확인, 댓글 초안, 실습실 설계, 세특 근거 모으기.</p><p style="margin-top:10px">→ 교사 승인 뒤 깃허브</p></div>' +
      '<div class="card col" data-s="4" style="border-left:8px solid var(--codex)"><h3>Codex</h3><p><b style="color:var(--ink)">검토.</b> 화면 문장의 수치·사실을 실행 결과와 대조하고 고칠 곳만 보고.</p><p style="margin-top:10px">→ 고친 뒤 공개</p></div>' +
    '</div>',
    notes: 'AI 조교는 한 모델이 아닙니다.\n받아 적기는 Gemini가, 학생이 읽는 한글 문장은 Solar가, 설계와 매일 확인은 Claude가, 검토는 Codex가 맡습니다.\n특히 학생에게 가는 문장은 한국어 문장을 가장 자연스럽게 쓰는 모델에게 맡기고, 다른 모델이 사실과 수치만 대조하도록 나누었습니다.' },

  { sec: '구조', title: '한 회차의 흐름', widget: 'flow', html: '' +
    ttl('한 회차의 흐름', '눌러서 보기', 'live') +
    '<p class="lead">단계를 누르면 그 장면과 <b>누가 무엇을 하는지</b>가 나온다.</p>' +
    '<div class="body"><div class="col" style="flex:0 0 520px"><div id="flowNodes" style="display:grid;gap:10px"></div></div>' +
    '<div class="col" style="flex:1"><div id="flowPane" class="card" style="flex:1;display:flex;gap:22px;min-height:0"></div></div></div>',
    notes: '한 회차는 일곱 단계로 돕니다. 실습실 예시를 보고, 팀 저장소에서 작업하며 log를 쓰고, 구술 인터뷰를 하고, AI가 받아 적고 초안을 쓰고, 교사가 고쳐 이슈로 올리고, 수업이 없는 날에도 저장소를 확인하고, 그 기록이 세특 근거로 쌓입니다.\n이제 각 단계를 실제 화면으로 보겠습니다.' },

  { sec: '개인정보', title: '실제로 오가는 글', widget: 'dflow', steps: 5, html: function () { var se = (window.DATAFLOW || {}).session || {}; return '' +
    ttl('실제로 오가는 글', '실제 기록', 'live') +
    '<p class="lead" style="margin-bottom:14px"><b>보낸 글과 받은 글</b> 그대로. 1~4는 한 팀의 ' + (se.cpNo || '') + ' 인터뷰, 5~6은 다른 팀의 저장소 변화. 흐린 칸은 이름·학번·팀 이름.</p>' +
    '<div class="body nonext" style="flex-direction:column;gap:12px"><div id="dfRoute"></div><div id="dfPane" style="flex:1;display:flex;gap:16px;min-height:0"></div><div id="dfFoot"></div></div>'; },
    notes: '앞의 흐름을 실제 글로 보겠습니다. 한 팀의 첫 인터뷰 기록이 어디로 무엇을 보내고 무엇을 받는지 그대로 옮겼습니다.\n교사 앱은 기록과 녹음을 교사 계정의 시트와 드라이브에 둡니다. 서버는 녹음과 받아쓰기 지시를 Gemini에 보내 대화를 받아 적고, 그 대화와 회차 정보를 Solar에 보내 강점과 가이드 초안을 받습니다. 어디에도 점수와 학생 명단은 보내지 않습니다.\n네 번째를 보시면 녹취만 본 초안과 학생이 실제로 받은 이슈가 다릅니다. 올린 글은 저장소와 데이터를 직접 열어 확인한 사실로 다시 썼고, 교사가 전체 문안을 읽고 승인했습니다.\n수업이 없는 날에는 맥이 바뀐 저장소를 Claude에 보여 주고 설계서를 받은 뒤, Solar가 댓글 초안을 씁니다. 이 초안도 교사가 올리기를 눌러야 학생에게 갑니다.' },

  { sec: '개인정보', title: '데이터는 어디로 가나', widget: 'privacy', html: '' +
    ttl('개인정보: 데이터는 어디로 가나', '눌러서 보기', 'live') +
    '<p class="lead">데이터마다 <b>저장 위치, 보는 사람, 밖으로 나가는 곳, 보관</b>을 정해 두었다.</p>' +
    '<div class="body nonext"><div class="col" style="flex:0 0 420px;gap:8px" id="pvList"></div><div class="col" style="flex:1" id="pvPane"></div></div>',
    notes: '개인정보를 걱정하시는 분이 많을 것입니다. 데이터마다 어디에 저장되고, 누가 보고, 밖으로 어디에 나가는지 정리했습니다.\n밖으로 나가는 것은 세 곳입니다. 녹음은 받아 적기를 위해 구글 Gemini로, 받아 적은 글은 피드백 초안을 위해 Upstage로, 인터뷰 이슈 초안을 위해 Anthropic으로 갑니다. 요청에는 팀 이름과 질문이 함께 가고, 점수와 학생 명단은 보내지 않습니다.\n목소리 파일은 성적 확정과 이의 신청 기간까지만 두고, 그 뒤 교사 앱에서 한꺼번에 지웁니다. 그 뒤에는 받아 적은 글만 남습니다.\n세특 근거와 점수는 교사 계정과 교사 컴퓨터에만 있습니다.' },

  { sec: '개인정보', title: '더 조심해야 하는 학교라면', html: '' +
    ttl('더 조심해야 하는 학교라면') +
    '<p class="lead">줄일 수 있는 것과 그때 잃는 것. <b>도입 전에 학교 개인정보 담당과 먼저 정한다.</b></p>' +
    '<table class="t" style="font-size:21px"><thead><tr><th style="width:24%">줄이고 싶은 것</th><th style="width:44%">이렇게 바꾼다</th><th>잃는 것</th></tr></thead><tbody>' +
      '<tr data-s="1"><td><b>목소리 보관</b></td><td>성적 확정·이의 신청 기간 뒤 교사 앱에서 녹음 일괄 삭제(이 사례의 방식)</td><td>그 뒤에는 다시 받아 적거나 녹음으로 확인할 수 없음</td></tr>' +
      '<tr data-s="1"><td><b>녹음의 외부 전송</b></td><td>로컬 Whisper로 수업 뒤 교사 맥에서 받아 적기</td><td>처리 시간(9분 녹음에 약 2분), 화자 구분 없음</td></tr>' +
      '<tr data-s="1"><td><b>전사 글의 외부 전송</b></td><td>피드백 초안 끄기(설정 하나), 강점·가이드는 교사가 직접</td><td>교사의 작성 시간</td></tr>' +
      '<tr data-s="2"><td><b>녹음 자체</b></td><td>녹음 없이 루브릭과 교사 메모만 기록</td><td>장면이 담긴 근거, 초안</td></tr>' +
      '<tr data-s="2"><td><b>공개 저장소</b></td><td>비공개 저장소에 교사 초대, 또는 클래스룸 제출</td><td>공개 작품 경험. 이슈를 올리려면 저장소 권한 필요</td></tr>' +
      '<tr data-s="3"><td><b>교사 개인 계정</b></td><td>학교 구글 워크스페이스에 시트·드라이브</td><td>설치를 다시 해야 함</td></tr>' +
      '<tr data-s="3"><td><b>모르고 기록되는 것</b></td><td>녹음·전사·외부 AI 전송·보관 기간을 안내문과 동의서로</td><td>없음</td></tr>' +
    '</tbody></table>' +
    '<div data-s="4" class="card" style="margin-top:16px"><p style="color:var(--ink)"><b>이 사례의 지금 운영</b>: 시트·드라이브는 교사 계정, 팀 저장소는 공개(학번·이름 공개 동의, 거부하면 닉네임 등록), 전사는 유료 등급 API, 녹음은 성적 확정·이의 신청 기간 뒤 앱에서 한꺼번에 지우고 받아 적은 글만 남긴다. 발표 화면은 찍기 직전에 흐리고 원본을 남기지 않았다.</p></div>',
    notes: '개인정보에 더 민감한 학교라면 줄일 수 있는 것이 많습니다. 다만 줄일 때마다 잃는 것이 있어 함께 말씀드립니다.\n녹음을 밖으로 보내지 않으려면 로컬 Whisper로 수업 뒤에 받아 적으면 됩니다. 9분 녹음에 2분 정도 걸리고 화자 구분이 없습니다.\n피드백 초안은 설정 하나로 끌 수 있고, 녹음을 아예 하지 않고 메모만 남길 수도 있습니다. 공개 저장소 대신 비공개 저장소나 클래스룸 제출로 바꿀 수 있습니다.\n어떤 경우든 학교 계정으로 운영하고, 녹음과 외부 AI 전송과 보관 기간을 학생에게 미리 안내하는 것을 권합니다.' },

  // ── 장면 ─────────────────────────────────────────────
  { sec: '장면', title: '실습실', html: function (S) { return '' +
    ttl('실습실: 질문하며 배우는 예시 대화', 'AI 모의 대화', 'ai') +
    '<p class="lead">학생 프롬프트 → AI 코드 → <b>그 자리에서 실행한 결과</b>. 모델을 추천받고, 모델마다 묻고, 같은 조건에서 시험한다.</p>' +
    '<div class="body"><div class="col" style="flex:1"><div class="stack">' +
      '<div data-u="2">' + frame('C2a_모델추천표.png', '모델 2~3개 추천받기: 원리·장단점·많이 사용되는 경우', '1:-50%') + '</div>' +
      '<div data-s="2">' + frame('C2b_모델마다_묻기.png', '모델마다 하나씩 묻기: 회귀인데 분류? 외운다는 뜻? 나무가 많으면?', '3:-55%') + '</div>' +
    '</div></div>' +
    '<div class="col" style="flex:0 0 300px;gap:14px"><div class="card"><div class="big">' + (S.lab ? S.lab.pages : 6) + '<small>페이지</small></div><p>대화 ' + (S.lab ? S.lab.steps : 100) + '단계, 뇌졸중 데이터</p></div>' +
    '<div class="card"><p>코드는 화면에 보이는 문자열 그대로 실행한다. 수치는 실행 결과와 대조했다.</p></div>' +
    '<a class="btn" href="https://2026dgds.streamlit.app" target="_blank" rel="noopener" style="text-align:center;text-decoration:none">실습실 열기 ↗</a></div></div>'; },
    notes: '학생이 자기 프로젝트를 하기 전에 보는 예시입니다. 스트림릿으로 만든 실습실에서 한 팀이 AI와 대화하는 과정을 단계별로 보여 줍니다.\n모델을 두세 개 추천받고, 로지스틱 회귀는 이름에 회귀가 있는데 분류에 써도 되는지처럼 모델마다 묻고, 같은 조건에서 시험합니다.\n화면의 코드는 그 자리에서 실제로 실행되고, 결과 수치는 실행 결과와 대조했습니다.' },

  { sec: '장면', title: 'AI 오류 바로잡기', html: function (S) { return '' +
    ttl('AI가 틀리면 학생이 바로잡는다', '검증 장면', 'ai') +
    '<p class="lead">실습실의 모든 페이지에 <b>AI의 그럴듯한 오류</b>가 하나씩 있다(' + (S.lab ? S.lab.wrong_scenes : 5) + '곳). 학생은 앞에서 배운 것을 근거로 확인을 요청한다.</p>' +
    '<div class="body"><div class="col" style="flex:1"><div class="stack">' +
      '<div data-u="2">' + frame('C3a_AI오류_학생검증.png', '학습용 정확도 1.0을 의심하고 시험용으로 다시 계산하기', '1:-53%', 1000) + '</div>' +
      '<div data-s="2" data-u="4">' + frame('C3d_계수오해_바로잡기.png', 'AI: "한 살마다 확률 1.855%p" → 학생이 두 사람으로 직접 계산', '3:-66%', 1000) + '</div>' +
      '<div data-s="4">' + frame('C3b_검증기록_log.png', '바로잡은 과정을 log 형식으로 남기기', '', 1000, 420) + '</div>' +
    '</div></div></div>'; },
    notes: '실습실의 핵심 장면입니다. AI가 학습용 데이터로 계산한 정확도 1.0을 보고 랜덤 포레스트를 고르라고 합니다. 학생은 앞에서 결정 트리는 학습용 데이터를 외울 수 있다고 들었으니 어떤 데이터로 계산했는지 묻습니다.\n오른쪽은 나이 계수 1.855를 한 살마다 확률이 1.855%p 오른다고 잘못 설명한 장면입니다. 학생이 어린이와 노인의 확률 변화를 직접 계산해 바로잡습니다.\n그리고 바로잡은 과정을 log 형식으로 남기는 모습까지 보여 줍니다.' },

  { sec: '장면', title: '학생 log', html: '' +
    ttl('학생 log: AI와 일한 흔적', '실제 기록', 's') +
    '<p class="lead">팀원마다 차례마다 네 줄. <b>셋째 줄이 비면</b> 그 차례는 받아 적기로 본다.</p>' +
    '<div class="body"><div class="col" style="flex:1;gap:14px">' +
      '<div class="card"><ol style="margin:0;padding-left:1.2em;font-size:25px;line-height:1.7"><li>오늘 결정한 것</li><li>AI에게 보낸 프롬프트(원문)</li><li style="background:#fff0eb;border-radius:8px;padding:0 8px;margin-left:-8px"><b>AI가 준 것 중 고치거나 버린 것과 그 이유</b></li><li>느낀 점</li></ol></div>' +
      '<div class="quote" data-s="2">구술평가를 준비하면서 많이 읽어봤는데 막상 말할 때 떠오르는 내용이 없어서 아쉬웠다.<small>학생 log의 느낀 점, ① 회차 다음 날</small></div>' +
    '</div><div class="col" style="flex:1.2" data-s="1">' + shot('G3_학생log.png', '팀 저장소 log/02.md (이름·학번 흐림)') + '</div></div>',
    notes: 'log는 팀원마다 차례마다 네 줄을 씁니다. 가장 중요한 줄은 셋째 줄, AI가 준 것 가운데 고치거나 버린 것과 그 이유입니다. 이 줄이 비어 있으면 그 차례는 AI 답을 받아 적은 것으로 봅니다.\n실제 학생 기록입니다. 첫 구술 인터뷰를 마친 다음 날, 한 학생이 "많이 읽어 봤는데 막상 말할 때 떠오르는 내용이 없었다"고 썼습니다. 읽은 것과 설명할 수 있는 것의 차이를 학생 스스로 느낀 장면이라 소개합니다.' },

  { sec: '장면', title: '구술 인터뷰', html: '' +
    ttl('구술 인터뷰: 팀당 3분, 한 화면에서', '교사 앱', 't') +
    '<p class="lead">아이폰 하나로 <b>부르고, 녹음하고, 묻고, 지목하고, 채점한다.</b> 와이파이가 끊겨도 기기에 먼저 남는다.</p>' +
    '<div class="phones" style="flex:1;align-items:flex-start">' +
      phone('A1_팀목록.png', '팀 목록 · 다음 차례') + phone('A2_인터뷰_참석녹음.png', '참석 · 녹음', ' data-s="1"') + phone('A3_인터뷰_질문.png', '시작 질문 · 꼬리질문 · 지목', ' data-s="2"') +
    '</div>',
    notes: '교사용 앱입니다. 아이폰 사파리에서 돌아가고 구글 시트와 드라이브에 저장합니다.\n목록에서 다음 차례 팀을 누르고 참석을 확인하고 녹음을 누른 뒤 시작 질문을 읽습니다. 꼬리질문은 목록에서 고르고, 답할 학생을 지목하면 그 시각이 녹음에 표시됩니다.\n꼬리질문 가운데 "AI가 제안한 전처리 가운데 따르지 않은 것은 무엇입니까"가 보입니다. log의 셋째 줄과 같은 내용을 말로 확인하는 질문입니다.' },

  { sec: '장면', title: '루브릭 공개', html: '' +
    ttl('평가 기준은 미리 공개한다', '루브릭') +
    '<p class="lead">항목마다 <b>평가 요소</b>. 모두 보이면 상, 절반 이상이면 중. 학생 페이지에도 같은 목록이 있다.</p>' +
    '<div class="body"><div class="col" style="flex:0 0 auto">' + phone('A4_인터뷰_루브릭.png', '교사 앱의 루브릭') + '</div>' +
    '<div class="col" style="flex:1;align-items:center" data-s="1">' + frame('C5_학생안내_체크리스트루브릭.png', '학생 공개 페이지: 시작 질문·준비 체크리스트·루브릭', '2:-42%', 760, 560) + '</div></div>',
    notes: '루브릭은 숨기지 않습니다. 교사 앱의 항목과 평가 요소가 학생용 안내 페이지에 그대로 공개됩니다.\n③ 회차의 모델 질문과 ④ 회차의 지표 질문은 팀원마다 따로 평가합니다. 팀 프로젝트에서 한 사람이 다 설명하는 문제를 줄이기 위해서입니다.' },

  { sec: '장면', title: '전사와 초안', html: '' +
    ttl('저장하면 AI 조교가 이어 받는다', '자동 처리', 'ai') +
    '<p class="lead">저장 약 20초 뒤 시트·드라이브·전사가 채워지고, 이어서 <b>강점·가이드 초안</b>이 생긴다.</p>' +
    '<div class="body"><div class="col" style="flex:1;gap:12px;justify-content:center">' +
      '<div class="card" data-s="1" style="border-left:8px solid var(--teacher)"><h3>① 저장</h3><p>점수·메모는 시트로, 녹음은 드라이브로</p></div>' +
      '<div class="card" data-s="2" style="border-left:8px solid var(--gemini)"><h3>② 받아 적기 · Gemini</h3><p>선생님·학생 구분, 팀 질문을 맥락으로</p></div>' +
      '<div class="card" data-s="3" style="border-left:8px solid var(--solar)"><h3>③ 강점·가이드 초안 · Solar</h3><p>평가하지 않는다. 장면과 의미, 다음 단계 할 일</p></div>' +
      '<div class="card" data-s="4" style="border-left:8px solid var(--teacher)"><h3>④ 교사가 읽고 고친다 → 이슈</h3><p>고친 문안이 그대로 학생부 자료로 남는다</p></div>' +
    '</div><div class="col" style="flex:0 0 auto;align-items:center"><div><div class="phone" data-pan="3:-31%"><img alt="" src="' + C('A5_기록상세_피드백.png') + '"></div><div class="lab">기록 상세: 전사와 초안</div></div></div></div>',
    notes: '저장을 누르면 그 뒤는 서버가 처리합니다. 실측으로 저장 약 20초 뒤에 시트, 드라이브, 전사가 모두 채워졌습니다.\n받아 적은 글을 바탕으로 학생에게 줄 강점과 다음 단계 가이드 초안을 만듭니다. 오른쪽 화면 아래가 그 초안이고, 교사가 읽고 고친 뒤 팀 저장소 이슈로 올립니다.\n전사 비용은 40분을 꽉 채워 녹음해도 약 120원입니다.' },

  { sec: '장면', title: '학생이 받는 피드백', widget: 'marks', html: '' +
    ttl('학생이 받는 피드백', '팀 저장소 이슈', 's') +
    '<p class="lead">점수 없이 <b>강점(장면과 의미)</b>과 <b>다음 단계 가이드(체크 목록)</b>. 맨 아래에는 AI 검증 안내.</p>' +
    '<div class="body"><div class="col" style="flex:1.6"><div class="shotbox" id="issueBox" style="position:relative"><img class="shot" alt="" src="' + C('G1_이슈_강점가이드_1.png') + '" style="max-height:590px"></div></div>' +
    '<div class="col" style="flex:1;gap:12px;justify-content:center">' +
      '<div class="card" data-s="1"><h3>AI 작성 표기</h3><p>제목과 첫 줄의 \'팅커비스)\'</p></div>' +
      '<div class="card" data-s="2"><h3>인터뷰에서 보인 강점</h3><p>어떤 질문에 어떻게 답했는지 + 이 프로젝트에서의 의미</p></div>' +
      '<div class="card" data-s="3"><h3>다음 단계 가이드</h3><p>저장소와 데이터를 열어 확인한 사실로. 살펴보고, 팀원과 정하고, 기록해 보기</p></div>' +
      '<div class="card" data-s="4"><h3>AI 검증 안내</h3><p>AI 제안은 확인하고 검증한 과정을 깃허브에</p></div>' +
    '</div></div>',
    notes: '학생이 받는 피드백입니다. 실제로 올린 이슈입니다.\n강점은 인터뷰에서 실제로 있었던 장면과 그것이 이 프로젝트에서 갖는 의미로 씁니다. 선생님이 운동 강도와 심박수는 당연히 관련 있지 않냐고 묻자, 체력이 좋은 사람은 심박수가 평온할 수 있다고 답한 장면입니다.\n가이드는 저장소와 데이터를 직접 열어 확인한 사실로 씁니다. 심박수가 약 9Hz로 기록되어 빈칸을 지우면 10%만 남는다는 식입니다.\n처음 올린 문안은 장황하다는 판단으로 모두 회수하고 이 형식으로 다시 올렸습니다. 학생 저장소에 글을 올리기 전에는 팀별 전체 문안을 교사가 먼저 봅니다.' },

  { sec: '장면', title: '수업이 없는 날', html: function (S) { return '' +
    ttl('수업이 없는 날에도', '매일 저장소 확인', 'ai') +
    '<p class="lead">수업 있는 날 18시, 맥이 <b>바뀐 팀 저장소</b>를 확인해 댓글 초안을 만든다. 올리기는 교사가 누른다.</p>' +
    '<div class="body"><div class="col" style="flex:1;gap:12px">' +
      '<div class="card" data-s="1"><h3>① 변화 모으기 (스크립트)</h3><p>커밋·바뀐 파일·log·데이터 파일 요약. 바뀐 팀이 없으면 AI를 부르지 않는다</p></div>' +
      '<div class="card" data-s="2"><h3>② 초안 쓰기 (팅커비스)</h3><p>쓸 수 있는 명령은 확인 스크립트 하나. 학생 글은 데이터로만 읽는다</p></div>' +
      '<div class="card" data-s="3"><h3>③ 교사가 올린다</h3><p>앱의 \'깃허브 초안\' 카드에서 고치고 올리기</p></div>' +
      '<div class="card" data-s="4" style="background:#fff0eb;border-color:#ffd9cc"><h3>진행 중: log에서 질문 후보</h3><p>log의 결정·검증 기록으로 다음 구술의 꼬리질문 후보를 교사 앱에 띄운다</p></div>' +
    '</div><div class="col" style="flex:1">' + shot('A7_깃허브초안.png', '실제 댓글 초안: README와 log 03.md의 변화를 짚은 강점') + '</div></div>'; },
    notes: '수업이 없는 날에도 과정은 이어집니다. 수업이 있는 날 저녁 6시에 맥이 팀 저장소의 변화를 확인합니다.\n변화를 모으는 일은 스크립트가 하고, 바뀐 팀이 있을 때만 AI를 부릅니다. AI는 확인 스크립트 하나만 실행할 수 있게 막아 두었습니다. 학생 저장소의 글에 지시문 같은 내용이 있어도 따르지 않게 하기 위해서입니다.\n오른쪽이 실제 댓글 초안입니다. 이 팀이 README에 사용할 열을 정하고 log에 AI 의견을 받아 열을 넣은 과정을 강점으로 짚었습니다.' },

  { sec: '장면', title: '세특 근거', html: function (S) { var e = S.setuk || {}; return '' +
    ttl('기록이 세특 근거로 쌓인다', '학생별 시간순', 't') +
    '<p class="lead">구술 기록, 올린 이슈, 학생이 쓴 log 절이 <b>학생별로</b> 모인다. 학기말에는 이 근거에서 고른다.</p>' +
    '<div class="body"><div class="col" style="flex:0 0 360px;gap:14px">' +
      '<div class="card"><div class="big">' + (e.rows || 0) + '<small>건</small></div><p>근거가 쌓인 학생 ' + (e.students || 0) + '명</p></div>' +
      '<div class="card"><p>구술 ' + ((e.by_source || {})['구술'] || 0) + '건 · log ' + ((e.by_source || {}).log || 0) + '건</p></div>' +
      '<div class="card" data-s="1"><p>항목 수준과 이슈 문안은 판단 참고용. 세특에는 학생이 직접 한 판단을 골라 쓴다.</p></div>' +
    '</div><div class="col" style="flex:1;align-items:center">' + frame('E1_세특근거.png', '한 학생의 근거(이름·학번 흐림)', '2:-29%', 900, 560) + '</div></div>'; },
    notes: '마지막 단계는 기록입니다. 구술 기록, 교사가 승인해 올린 이슈, 학생이 log에 쓴 자기 절이 학생별로 시간순으로 모입니다.\n학기말에 세특을 쓸 때 기억이나 산출물 더미가 아니라 이 근거에서 학생이 직접 한 판단을 고릅니다. 점수와 이슈 문안은 판단의 참고일 뿐 그대로 옮기지 않습니다.' },

  { sec: '장면', title: '루브릭 한 파일', html: function (S) { var r = S.rubric || {}; return '' +
    ttl('루브릭 한 파일이 모든 곳으로', '단일 원본') +
    '<p class="lead">구술평가_루브릭.json 하나를 고치면 <b>교사 앱, 학생 페이지, 인쇄본, 실습실 대비 카드</b>가 함께 바뀐다.</p>' +
    '<div class="body" style="align-items:stretch"><div class="col" style="flex:0 0 360px;justify-content:center"><div class="card" style="background:var(--ink);color:#fff;border:0"><h3 class="mono" style="font-size:22px">구술평가_루브릭.json</h3><p style="color:#c9c6d6">회차 ' + (r.rounds || 6) + ' · 항목 ' + (r.items || 0) + ' (개인 ' + (r.individual_items || 0) + ') · 꼬리질문 ' + (r.followups || 0) + '</p></div></div>' +
    '<div class="col" style="flex:0 0 60px;justify-content:center;font-size:44px;color:var(--faint)">→</div>' +
    '<div class="col" style="flex:1;gap:12px;justify-content:center">' +
      '<div class="card" data-s="1"><h3>교사 앱 · 시트 초기값</h3><p>시작 질문, 꼬리질문, 루브릭, 평가 요소</p></div>' +
      '<div class="card" data-s="2"><h3>학생 안내 페이지 · 인쇄용 한 장</h3><p>준비 체크리스트, 루브릭 공개</p></div>' +
      '<div class="card" data-s="3"><h3>실습실 구술 인터뷰 대비 카드</h3><p>질문을 그대로 읽어 오고, 질문이 바뀌면 다시 쓸 예시 답을 알려 준다</p></div>' +
    '</div><div class="col" style="flex:1" data-s="3">' + shot('C4b_구술대비_선정모델.png', '실습실 대비 카드') + '</div></div>'; },
    notes: '평가 기준은 한 파일에만 있습니다. 이 파일 하나에서 교사 앱의 질문과 루브릭, 학생 안내 페이지, 인쇄용 체크리스트, 그리고 실습실의 구술 인터뷰 대비 카드가 만들어집니다.\n그래서 수업 자료, 평가, 기록이 같은 질문을 씁니다. 질문을 고치면 실습실 카드의 예시 답 가운데 다시 써야 할 것을 알려 줍니다.' },

  // ── 숫자 ─────────────────────────────────────────────
  { sec: '숫자', title: '지금까지', widget: 'grid', html: function (S) { var o = S.oral || {}; return '' +
    ttl('지금까지', '시스템에서 바로 집계', 'live') +
    '<p class="lead">진행 중인 사례. 아래 수치는 <b>' + (S.updated || '') + '</b>에 서버·저장소에서 읽은 값이다.</p>' +
    '<div class="body"><div class="col" style="flex:1.1;gap:14px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">' +
      '<div class="card"><div class="big">' + (o.sessions || 0) + '</div><p>구술 기록</p></div>' +
      '<div class="card"><div class="big">' + (o.minutes_recorded || 0) + '<small>분</small></div><p>녹음</p></div>' +
      '<div class="card"><div class="big">' + (o.transcribed || 0) + '</div><p>자동 전사</p></div>' +
      '<div class="card"><div class="big">' + (o.feedback_ready || 0) + '</div><p>강점·가이드 초안</p></div>' +
      '<div class="card"><div class="big">' + (o.issues_posted || 0) + '</div><p>올린 이슈</p></div>' +
      '<div class="card"><div class="big">' + ((S.setuk || {}).rows || 0) + '</div><p>세특 근거</p></div>' +
    '</div></div><div class="col" style="flex:1"><div class="card" style="flex:1"><h3>회차별 실시 팀</h3><div id="grid" style="margin-top:12px"></div><p style="margin-top:12px">빈칸은 진행 예정. 프로젝트가 끝나면 이 장을 다시 집계한다.</p></div></div></div>'; },
    notes: '지금까지의 수치입니다. 이 장은 발표 직전에 스크립트로 다시 집계합니다.\n첫 회차를 한 학급에서 실시했고, 기록마다 자동 전사와 초안이 만들어졌고, 교사가 확인한 문안을 이슈로 올렸습니다.\n남은 회차가 끝나면 같은 장에서 전체 수치로 바뀝니다.' },

  { sec: '숫자', title: '시간과 비용', widget: 'calc', html: '' +
    ttl('시간과 비용', '직접 바꿔 보기', 'live') +
    '<p class="lead">팀 수와 팀당 시간을 바꾸면 <b>회차마다 필요한 수업 시간</b>과 <b>전사 비용</b>이 바로 나온다.</p>' +
    '<div class="body"><div class="col" style="flex:1;gap:20px" id="calcIn"></div><div class="col" style="flex:1;gap:14px" id="calcOut"></div></div>',
    notes: '청중께서 자기 학급에 맞춰 보실 수 있게 계산기를 넣었습니다.\n과정 회차는 팀당 3분과 교대 30초로 계산합니다. 9팀이면 약 32분, 한 차시를 거의 씁니다.\n전사 비용은 2026년 10월 실측 단가로 계산합니다. 40분 녹음 한 개에 약 120원이고, 2027년부터는 약 두 배가 됩니다.' },

  // ── 의미 ─────────────────────────────────────────────
  { sec: '의미', title: '의미와 가치', widget: 'tabs', html: '' +
    ttl('의미와 가치') +
    '<p class="lead">같은 시스템이 학생, 교사, 학교에 각각 다른 일을 한다.</p>' +
    '<div class="seg nonext" data-tabs="v" style="align-self:flex-start;margin-bottom:18px"><button class="btn on" data-t="0">학생</button><button class="btn" data-t="1">교사</button><button class="btn" data-t="2">학교·교육과정</button></div>' +
    '<div class="body" data-pane="v">' +
      '<ul class="pts s" data-p="0"><li>AI 결과를 확인하는 습관이 기록으로 남는다<small>log 셋째 줄, 실습실의 검증 장면, 이슈의 AI 검증 안내</small></li><li>설명할 수 있어야 자기 것이 된다<small>팀원마다 모델·지표를 자기 말로</small></li><li>평가 기준과 질문을 미리 안다<small>암기가 아니라 자기 팀 결과로 준비</small></li><li>회차마다 다음 단계 안내를 받는다</li></ul>' +
      '<ul class="pts t" data-p="1" hidden><li>채점과 질문에 집중한다<small>녹음·전사·시트 정리·초안은 시스템이</small></li><li>시간이 계산된다<small>과정 회차 팀당 3분, 9팀 약 32분</small></li><li>세특 근거가 저절로 쌓인다<small>학기말에 기억이 아니라 근거에서 고른다</small></li><li>비용이 작다<small>전사 한 학기 두 학급 약 1,700원</small></li></ul>' +
      '<ul class="pts" data-p="2" hidden><li>교수·학습, 평가, 기록이 같은 루브릭을 쓴다</li><li>과정 중심 평가의 증빙이 남는다<small>녹음·전사·log·커밋 시각</small></li><li>AI 작성 표기와 교사 승인으로 투명성을 지킨다</li></ul>' +
    '</div>',
    notes: '의미를 세 대상으로 나누어 보겠습니다.\n학생에게는 AI 결과를 확인하는 습관이 기록으로 남고, 설명할 수 있어야 자기 것이 된다는 경험이 생깁니다.\n교사에게는 기록과 정리를 넘기고 질문과 평가에 집중할 시간이 생깁니다.\n학교 차원에서는 수업, 평가, 기록이 같은 기준을 쓰는 운영 사례가 됩니다.' },

  // ── 다른 교과 ─────────────────────────────────────────
  { sec: '다른 교과', title: '그대로 쓰는 것', html: '' +
    ttl('다른 교과로: 그대로 쓰는 것과 바꾸는 것') +
    '<p class="lead">앱과 서버에는 과목에 매인 내용이 없다. 바꾸는 것은 <b>루브릭 팩, 실습실 시나리오, 기록 매체</b>.</p>' +
    '<table class="t"><thead><tr><th style="width:30%">구성 요소</th><th style="width:16%">교과와 무관</th><th>다른 교과에서 바꿀 것</th></tr></thead><tbody>' +
      '<tr><td>구술 앱·서버·전사·초안</td><td>그대로</td><td>전사 용어, 피드백 문체 규칙</td></tr>' +
      '<tr><td>log 4줄 형식</td><td>그대로</td><td>"가설", "측정값" 같은 칸을 더할 수 있음</td></tr>' +
      '<tr><td>세특 근거 모으기</td><td>구술은 그대로</td><td>log는 기록 매체에 맞춰 연결</td></tr>' +
      '<tr class="hl" data-s="1"><td>루브릭 팩(회차·질문)</td><td>새로 씀</td><td>회차 수·항목 수·팀/개인 항목 모두 자유</td></tr>' +
      '<tr class="hl" data-s="1"><td>판단 4축</td><td>탐구 교과는 그대로</td><td>교과의 탐구 단계에 맞춘 축</td></tr>' +
      '<tr class="hl" data-s="2"><td>깃허브 저장소</td><td>정보 교과에 자연스러움</td><td>구글 문서·드라이브 폴더(버전 기록), 클래스룸</td></tr>' +
      '<tr class="hl" data-s="2"><td>실습실(모의 대화)</td><td>형식은 그대로</td><td>교과 장면의 시나리오(코드 없이 대화만도 가능)</td></tr>' +
    '</tbody></table>',
    notes: '다른 교과로 옮길 때 그대로 쓰는 부분이 생각보다 큽니다. 구술 앱과 서버, 전사와 초안, log 형식, 세특 근거 수집은 처음부터 과목과 무관하게 만들었습니다.\n바꾸는 것은 세 가지입니다. 회차와 질문을 담은 루브릭 팩, 실습실 시나리오, 그리고 기록 매체입니다.' },

  { sec: '다른 교과', title: '교과별 적용', widget: 'tabs', html: '' +
    ttl('교과별로 보면') +
    '<div class="seg nonext" data-tabs="s" style="align-self:flex-start;margin-bottom:18px"><button class="btn on" data-t="0">정보</button><button class="btn" data-t="1">과학</button><button class="btn" data-t="2">사회</button><button class="btn" data-t="3">국어·영어</button></div>' +
    '<div class="body" data-pane="s" style="flex-direction:column;gap:14px">' +
      '<div data-p="0" style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div class="card"><h3>적합도 높음</h3><p>깃허브·코드·데이터가 교과 내용 자체. 루브릭 팩만 바꾼다.</p></div><div class="card"><h3>회차 예</h3><p>문제 정의 → 설계 선택 → 구현과 테스트 → 오류 분석 → 한계와 개선</p></div><div class="card"><h3>AI 검증 장면</h3><p>AI 코드가 경계값에서 틀리는 것을 학생이 테스트로 찾는다</p></div><div class="card"><h3>구술 질문 예</h3><p>이 입력에서 코드가 틀린다는 것을 어떻게 알았습니까?</p></div></div>' +
      '<div data-p="1" hidden style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div class="card"><h3>적합도 높음</h3><p>가설=질문 설정, 변인 통제·측정 오차=데이터 감식, 그래프 해석, 오차와 일반화=한계 인식</p></div><div class="card"><h3>기록 매체</h3><p>실험 사진·손 기록이 많아 드라이브 폴더와 실험 노트. log에 "측정값과 조건" 칸</p></div><div class="card"><h3>AI 검증 장면</h3><p>AI가 제안한 실험 절차는 안전 확인 전에는 실행하지 않는다</p></div><div class="card"><h3>구술 질문 예</h3><p>통제한 변인과 그렇지 못한 변인은 무엇입니까?</p></div></div>' +
      '<div data-p="2" hidden style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div class="card"><h3>적합도 중간 이상</h3><p>KOSIS·공공데이터·설문 탐구 보고서. 출처 신뢰성, 표본 편향, 상관과 인과</p></div><div class="card"><h3>기록 매체</h3><p>구글 문서(버전 기록)와 출처 목록</p></div><div class="card"><h3>AI 검증 장면</h3><p>AI가 만든 통계·인용·출처를 원문과 대조한다. 가장 중요한 장면이 되는 교과</p></div><div class="card"><h3>구술 질문 예</h3><p>이 주장의 근거와 반대 근거는 무엇입니까?</p></div></div>' +
      '<div data-p="3" hidden style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div class="card"><h3>적합도 중간</h3><p>저장소 확인·코드 실행은 해당 없음. 구술 + log + 세특 근거만으로도 의미가 크다</p></div><div class="card"><h3>log</h3><p>이번에 고친 것 · AI에게 보낸 요청 · 받아들이지 않은 제안과 이유 · 느낀 점</p></div><div class="card"><h3>AI 검증 장면</h3><p>AI가 쓴 초안을 학생이 고치는 대화</p></div><div class="card"><h3>구술 질문 예</h3><p>이 문단에서 AI 제안을 받아들이지 않은 곳은 어디이고 왜입니까?</p></div></div>' +
    '</div>',
    notes: '교과별로 보면 정보와 과학이 가장 잘 맞습니다. 과학은 탐구 단계가 판단 4축과 거의 그대로 대응합니다. 이 프로젝트에도 생명과 에너지 데이터로 만든 수업 자료가 이미 있습니다.\n사회는 AI가 만든 통계와 출처를 원문과 대조하는 장면이 가장 중요해집니다.\n국어와 영어는 코드나 저장소 확인이 필요 없지만, 자기 글을 말로 설명하게 하는 구술이 생성형 AI 대필 문제에 직접 대응하는 방법이 됩니다.' },

  { sec: '다른 교과', title: '도입 세팅', widget: 'levels', html: '' +
    ttl('도입하려면', '단계별') +
    '<div class="seg nonext" data-levels style="align-self:flex-start;margin-bottom:16px"><button class="btn on" data-l="0">1. 구술 기록</button><button class="btn" data-l="1">2. 피드백 전달</button><button class="btn" data-l="2">3. 통합 운영</button></div>' +
    '<div class="body"><div class="col" style="flex:1.2" id="lvPane"></div><div class="col" style="flex:1"><div class="card" style="flex:1"><h3>제도·윤리 점검</h3><div id="ethics" style="display:grid;gap:10px;margin-top:10px"></div></div></div></div>',
    notes: '도입은 세 단계로 나누어 권합니다. 1단계는 구글 계정과 아이폰, 전사용 키만 있으면 됩니다. 루브릭 파일을 쓰는 일이 가장 어렵습니다.\n3단계의 매일 확인 루틴과 세특 근거 수집은 지금 제 맥 환경에 맞춰져 있어 다른 학교에는 1·2단계부터 권합니다.\n오른쪽은 도입 전에 학교와 함께 확인할 것들입니다. 녹음과 외부 AI 전송 안내, 공개 저장소 동의, 계정, 평가계획 반영, 보관 기간입니다.' },

  // ── 앞으로 ─────────────────────────────────────────────
  { sec: '앞으로', title: '발전 가능성', html: '' +
    ttl('발전 가능성') +
    '<div class="body"><div class="col"><div class="card" style="flex:1"><h3>계획된 것</h3><ul class="pts t" style="margin-top:8px"><li>루브릭 편집기: JSON 대신 화면에서</li><li>설치 마법사: 시트 사본부터 연결 QR까지</li><li>여러 교사·교차 채점</li><li>배점 엔진: 최종 점수 환산</li></ul></div></div>' +
    '<div class="col" data-s="1"><div class="card" style="flex:1"><h3>더 해 볼 것</h3><ul class="pts" style="margin-top:8px"><li>교과 융합: 과학 실험 데이터를 정보 시간에 분석, 교과마다 구술</li><li>루브릭 팩 공유: 파일 하나가 공유 단위</li><li>학생의 구술 연습 도구: AI는 평가하지 않고 빠진 요소만</li><li>log 질문 후보로 최종 문답 준비</li></ul></div></div>' +
    '<div class="col" data-s="2"><div class="card" style="flex:1"><h3>연구 질문</h3><ul class="pts s" style="margin-top:8px"><li>회차가 갈수록 설명이 나아지는가</li><li>log·피드백이 AI 검증 행동을 늘리는가</li><li>교사의 부담은 얼마인가</li><li>학생은 공정하다고 느끼는가</li></ul></div></div></div>',
    notes: '앞으로 할 일입니다. 다른 선생님이 쓰려면 루브릭을 화면에서 편집하는 기능과 설치 마법사가 먼저 필요합니다.\n교과 융합 프로젝트에서는 같은 저장소를 두고 교과마다 자기 루브릭으로 구술할 수 있습니다.\n연구로는 회차별 루브릭 수준의 변화, log의 검증 기록 추이, 교사 시간, 학생 인식을 볼 계획입니다.' },

  { sec: '앞으로', title: '한계와 다음 단계', widget: 'qr', html: function (S) { return '' +
    ttl('한계와 다음 단계') +
    '<div class="body"><div class="col" style="flex:1.3"><ul class="pts t">' +
      '<li>진행 중: 한 학급 첫 회차까지 실시<small>효과는 아직 측정 전. 오늘은 설계와 운영 가능성까지</small></li>' +
      '<li>환경 의존: 매일 확인 루틴은 교사의 맥과 AI 로그인에 기댄다<small>끊기면 분석만 멈춘다</small></li>' +
      '<li>개인정보: 녹음의 외부 전송, 공개 저장소<small>안내·동의·보관 기간을 학교와 먼저</small></li>' +
      '<li>제작 비용: 실습실 시나리오에는 교과 전문성과 데이터 검증이 필요</li>' +
    '</ul><div class="card" style="margin-top:18px"><p>이 발표 자료는 프로젝트가 끝나면 같은 주소에서 전체 결과로 갱신한다.</p></div></div>' +
    '<div class="col" style="flex:1;flex-direction:row;gap:20px;justify-content:center;align-items:flex-start;padding-top:10px" id="qrs"></div></div>'; },
    notes: '한계를 말씀드리고 마치겠습니다. 아직 진행 중이라 효과는 측정하지 않았습니다. 오늘은 설계와 운영 가능성까지 말씀드렸습니다.\n매일 확인 루틴은 제 컴퓨터 환경에 기대고 있고, 녹음과 공개 저장소는 학교와 먼저 협의해야 합니다.\n이 발표 자료는 프로젝트가 끝나면 같은 주소에서 전체 결과로 갱신하겠습니다. 감사합니다.' }
  ];
})();
