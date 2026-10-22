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

  // 한 바퀴 네 장의 진행 표시
  var LOOP = ['① 교실', '② 기록', '③ 교사 결정', '④ 학생에게'];
  var ttlL = function (t, k) { return '<div class="ttl"><h2>' + t + '</h2><div class="lp">' + LOOP.map(function (x, i) { return '<span class="' + (i + 1 === k ? 'on' : i + 1 < k ? 'done' : '') + '">' + x + '</span>'; }).join('<i>→</i>') + '</div></div>'; };
  var credit = '<div class="credit">옥토캣 모나는 GitHub의 캐릭터</div>';

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

  { sec: '문제', title: '두 가지 어려움', html: function () {
    var F = function (f, st) { return '<img alt="" src="assets/art/' + f + '.webp" style="' + (st || '') + '">'; };
    return ttl('프로젝트 수업의 두 가지 어려움') +
    '<p class="lead"><b>AI가 결과물을 함께 만드는 지금</b>, 두 어려움은 더 커졌다.</p>' +
    '<div class="body" style="gap:26px">' +
      '<div class="card col" data-s="1" style="border-top:8px solid var(--teacher);gap:10px;padding:16px 20px"><h3 class="pain-h">① AI 시대의 구술평가,<br>좋은 건 알지만 어떻게 해야 하지?</h3>' +
        '<div class="pic" style="flex:1;min-height:0">' + F('pain_1', 'object-position:62% 30%') +
          '<span class="scn-chip" style="left:14px;top:14px;color:var(--teacher)">결과물로는 문제해결과정을 평가할 수 없음</span>' +
          '<span class="scn-chip" style="left:14px;bottom:14px;color:var(--ai)">하지만 어떻게 구술평가 과정을 기록하고 정리하지?</span></div>' +
        '<p style="font-size:22px;color:var(--muted);margin:0">AI 시대의 구술평가는 중요성과 실행의 간극이 크다.</p></div>' +
      '<div class="card col" data-s="2" style="border-top:8px solid var(--student);gap:10px;padding:16px 20px"><h3 class="pain-h">② 학생마다<br>피드백하기 어렵다</h3>' +
        '<div class="pic" style="flex:1;min-height:0">' + F('pain_2', 'object-position:50% 45%') +
          '<span class="scn-chip" style="left:14px;top:14px;color:#b46e00">반마다, 팀마다, 프로젝트 단계마다</span>' +
          '<span class="scn-chip wrap" style="left:14px;bottom:14px;color:var(--ai)">구술평가 내용도, 코드도, 문제해결과정도 자세히 쓰라고는 하는데 어떻게 일일이 피드백하지?</span></div></div>' +
    '</div>' +
    ''; },
    notes: '프로젝트 수업을 해 보신 선생님들은 두 가지 어려움을 아실 겁니다.\n첫째, AI가 코드와 보고서를 함께 작성하면 결과물만으로는 학생의 이해 정도를 확인할 수 없습니다. 그래서 학생이 자기 말로 설명하는 구술평가가 필요하다는 점에는 모두 공감하시지만, 실제 운영에 들어가면 즉시 막히는 지점이 생깁니다. 한 반에 열두 팀 정도를 짧은 수업 시간 안에 모두 면담해야 하고, 회차별로 무엇을 물을지, 대화를 어떻게 기록해 근거로 남길지, 그 결과를 이후 피드백으로 어떻게 연결할지까지 막막해지기 때문입니다.\n둘째, 학생마다 피드백하기 어렵습니다. 팀마다 회차마다 피드백을 직접 쓰면 종이가 쌓이고 시간이 모자랍니다.' },

  { sec: '해법', title: '해결의 흐름', widget: 'solve', steps: 5, html: function () {
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

  // ── 사례 ─────────────────────────────────────────────
  { sec: '사례', title: '이 사례', widget: 'rounds', html: function (S) { return '' +
    ttl('이 사례: 5주 팀 프로젝트', '2026 2학기 『데이터 과학』') +
    '<p class="lead">공통 수업 뒤 <b>5주 팀 프로젝트</b>. 평가는 코드가 아니라 <b>판단 4축</b>으로 한다.</p>' +
    '<div class="body"><div class="col" style="flex:1.05;gap:16px">' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">' +
        '<div class="card"><div class="big">2<small>개 반</small></div><p>약 27명씩</p></div>' +
        '<div class="card"><div class="big">' + (teams(S, 'E반') || 12) + '<small>팀</small></div><p>2~3인, E반 기준</p></div>' +
        '<div class="card"><div class="big">5<small>주</small></div><p>팀 저장소 하나</p></div></div>' +
      '<div class="card"><h3>판단 4축</h3><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"><span class="chip">질문 설정</span><span class="chip">데이터 감식</span><span class="chip">결과 해석</span><span class="chip">한계 인식</span></div></div>' +
      '<div class="card lab" data-s="1"><div class="lab-img"><img alt="" src="' + C('C3a_AI오류_학생검증.png') + '"></div><div><h3>미리 보는 예시: 실습실</h3><p>AI와 대화하며 모델을 고르고, <b style="color:var(--ink)">AI의 그럴듯한 오류</b>를 학생이 바로잡는 장면을 먼저 본다.</p><a href="https://2026dgds.streamlit.app" target="_blank" rel="noopener" class="lab-link">실습실 열기 ↗</a></div></div>' +
    '</div><div class="col" style="flex:1"><div class="card" style="flex:1"><h3>구술 인터뷰 여섯 번</h3><div id="rounds" style="display:grid;gap:10px;margin-top:12px"></div></div></div></div>'; },
    notes: '사례를 간단히 소개합니다. 두 학급이 공통 수업을 마친 뒤 5주 동안 2~3명씩 팀 프로젝트를 합니다. 팀마다 깃허브 저장소 하나를 씁니다.\n평가 언어는 판단 4축입니다. 질문 설정, 데이터 감식, 결과 해석, 한계 인식입니다. AI가 코드를 쓰더라도 학생은 무엇을 왜 골랐는지 설명해야 합니다.\n프로젝트 전에 학생은 실습실에서 한 팀이 AI와 대화하며 모델을 고르고, AI의 그럴듯한 오류를 바로잡는 예시를 봅니다.\n오른쪽이 구술 인터뷰 여섯 번입니다. 과정 다섯 번과 최종 포스터 문답입니다. 이제 한 회차가 실제로 어떻게 도는지 한 팀으로 따라가 보겠습니다.' },

  // ── 한 바퀴 ───────────────────────────────────────────
  { sec: '한 바퀴', title: '① 교실', html: '' +
    ttlL('교실: 팀당 3분, 아이폰 하나로', 1) +
    '<p class="lead">교사는 <b>부르고, 녹음하고, 묻고, 지목하고, 채점한다.</b> 평가 기준은 학생에게 미리 공개한다.</p>' +
    '<div class="body" style="align-items:flex-start;gap:30px">' +
      phone('A3_인터뷰_질문.png', '시작 질문 · 꼬리질문 · 지목') + phone('A4_인터뷰_루브릭.png', '루브릭과 평가 요소', ' data-s="1"') +
      '<div style="flex:1;min-width:0" data-s="2">' + frame('C5_학생안내_체크리스트루브릭.png', '학생 공개 페이지: 같은 루브릭', '0:-39%', 640, 540) + '</div>' +
    '</div>',
    notes: '한 바퀴의 시작은 교실입니다. 교사용 앱은 아이폰 사파리에서 돌아가고 구글 시트와 드라이브에 저장합니다.\n다음 차례 팀을 누르고 녹음을 시작한 뒤 시작 질문을 읽습니다. 꼬리질문은 목록에서 고르고, 답할 학생을 지목하면 그 시각이 녹음에 표시됩니다. 팀당 3분입니다.\n루브릭은 숨기지 않습니다. 교사 앱의 항목과 평가 요소가 학생 안내 페이지에 그대로 공개됩니다.' },

  { sec: '한 바퀴', title: '② 기록', html: '' +
    ttlL('기록: 받아 적은 글과 학생 log', 2) +
    '<p class="lead">녹음은 <b>AI 조교가 받아 적고</b>, 학생은 깃허브 log에 <b>AI와 일한 흔적</b>을 남긴다.</p>' +
    '<div class="body" style="gap:30px">' +
      '<div class="col" style="flex:0 0 auto;align-items:center"><div><div class="phone" data-pan="2:-31%"><img alt="" src="' + C('A5_기록상세_피드백.png') + '"></div><div class="lab">저장 약 20초 뒤 받아 적은 글</div></div></div>' +
      '<div class="col" style="flex:0 0 430px;gap:14px" data-s="1"><div class="card"><h3>log 네 줄 · 팀원마다 차례마다</h3><ol style="margin:8px 0 0;padding-left:1.2em;font-size:22px;line-height:1.7"><li>오늘 결정한 것</li><li>AI에게 보낸 프롬프트(원문)</li><li class="log3"><b>AI가 준 것 중 고치거나 버린 것과 그 이유</b></li><li>느낀 점</li></ol></div>' +
        '<div class="quote" style="font-size:24px">구술평가를 준비하면서 많이 읽어봤는데 막상 말할 때 떠오르는 내용이 없어서 아쉬웠다.<small>학생 log의 느낀 점, ① 회차 다음 날</small></div></div>' +
      '<div class="col" style="flex:1;min-width:0" data-s="1">' + shot('G3_학생log.png', '팀 저장소 log (이름·학번 흐림)') + '</div>' +
    '</div>',
    notes: '두 번째는 기록입니다. 교사가 저장을 누르면 그 뒤는 서버가 처리합니다. 실측으로 저장 약 20초 뒤에 녹음이 드라이브에, 받아 적은 글이 시트에 채워졌습니다.\n학생은 팀 저장소에 log를 씁니다. 팀원마다 차례마다 네 줄이고, 가장 중요한 줄은 셋째 줄, AI가 준 것 가운데 고치거나 버린 것과 그 이유입니다.\n실제 학생 기록입니다. 첫 구술 인터뷰 다음 날 한 학생이 "많이 읽어 봤는데 막상 말할 때 떠오르는 내용이 없었다"고 썼습니다. 읽은 것과 설명할 수 있는 것의 차이를 학생 스스로 느낀 장면입니다.' },

  { sec: '한 바퀴', title: '③ 교사 결정', widget: 'story', steps: 4, html: function () { return '' +
    ttlL('모든 결정은 교사를 거친다', 3) +
    '<p class="lead" style="margin-bottom:14px">AI 초안은 그대로 두지 않고 <b>교사가 확인하고 고칩니다.</b> 한 팀의 실제 기록입니다.</p>' +
    '<div class="body nonext st" id="stBox"></div>' +
    '<div class="st-band" data-s="4">이 기준을 정한 뒤 저장소 댓글 초안, 다음 질문 후보, 세특 근거도 모두 교사가 고르고 정한 것만 씁니다.</div>' + credit; },
    notes: '10월 21일 구술 인터뷰에서 저는 학생에게 어떤 열을 쓰는지 물었고, 학생은 주간 미디어 사용 시간과 나이, 미디어를 사용했을 때 공부 시간을 말했습니다. 저는 그 답이 정확하다고 인정했습니다.\n그러나 그날 나온 녹취만 보고 작성한 AI 조교 첫 초안에는 제가 인정한 부분과 달리 사용할 열을 더 분명히 적어야 한다고 되어 있었고, 녹취에 없는 데이터 이용 조건은 오늘 대화에서는 확인하지 못했다고 적혀 있었습니다.\n문장도 모두 ~해야 합니다로 끝나 평가처럼 읽혀서, 저는 다시 읽고 수정할 곳이 너무 많다고 판단했습니다. 그래서 아홉 팀의 이슈를 모두 회수하고 기준을 바꿨습니다. 평가하지 않고 강점은 녹취 속 실제 장면과 그 의미로 쓰며, 가이드는 저장소와 데이터를 직접 열어 확인한 사실로 쓰고 살펴보기, 팀 논의, 깃허브 기록 순서를 따르도록 했습니다.\nAI 제안은 반드시 검증하라는 안내를 붙인 뒤, 다음 날 새 기준으로 쓴 둘째 판을 승인했습니다.\n학생이 10월 22일에 받은 팀 저장소 이슈에는 같은 장면이 강점이 되었고, 가이드에는 저장소를 열어 보고 찾은 사실이 들어갔습니다. 학생이 연결한 KOSIS 표는 2015년 스마트폰의 지나친 사용으로 학교성적이 떨어졌다는 응답 비율 표여서 미디어 사용 시간과 공부 시간이 없었기 때문에, 그 두 값이 들어 있는 표를 팀원과 다시 정해 보라고 안내했습니다.\n이 기준을 정한 뒤로는 저장소 댓글 초안, 다음 인터뷰 질문 후보, 세특 근거도 모두 제가 고르고 정한 것만 쓰입니다.' },

  { sec: '한 바퀴', title: '④ 학생에게', widget: 'marks', html: '' +
    ttlL('학생에게: 피드백이 다음 작업이 된다', 4) +
    '<p class="lead">점수 없이 <b>강점</b>과 <b>다음 단계 가이드(체크 목록)</b>. 체크 목록이 그대로 팀의 다음 작업이 된다.</p>' +
    '<div class="body"><div class="col" style="flex:1.45"><div class="shotbox" id="issueBox" style="position:relative"><img class="shot" alt="" src="' + C('G1_이슈_강점가이드_1.png') + '" style="max-height:600px"></div></div>' +
    '<div class="col" style="flex:1;gap:10px;justify-content:center">' +
      '<div class="card sm" data-s="1"><h3>AI 작성 표기</h3><p>제목과 첫 줄의 \'팅커비스)\'</p></div>' +
      '<div class="card sm" data-s="2"><h3>인터뷰에서 보인 강점</h3><p>어떤 질문에 어떻게 답했는지 + 이 프로젝트에서의 의미</p></div>' +
      '<div class="card sm" data-s="3"><h3>다음 단계 가이드</h3><p>저장소와 데이터를 열어 확인한 사실로. 살펴보고, 팀원과 정하고, 기록해 보기</p></div>' +
      '<div class="card sm" data-s="4"><h3>AI 검증 안내</h3><p>AI 제안은 확인하고 검증한 과정을 깃허브에</p></div>' +
      '<div class="card sm next" data-s="5"><h3>그리고 다시 ① 교실로</h3><p>수업이 없는 날에도 저장소가 바뀌면 댓글 초안이 생기고(올리기는 교사), 다음 인터뷰는 학생 log에서 나온 질문으로 한다. 이 한 바퀴를 다섯 번, 그리고 최종 문답.</p></div>' +
    '</div></div>',
    notes: '마지막은 학생에게 가는 피드백입니다. 실제로 올린 이슈입니다.\n강점은 인터뷰에서 실제로 있었던 장면과 그것이 이 프로젝트에서 갖는 의미로 씁니다. 가이드는 저장소와 데이터를 직접 열어 확인한 사실로 쓰고, 체크 목록이라 그대로 팀의 다음 작업이 됩니다. 맨 아래에는 AI 제안을 검증하라는 안내가 붙습니다.\n수업이 없는 날에도 과정은 이어집니다. 수업이 있는 날 저녁 6시에 팀 저장소가 바뀌었으면 댓글 초안이 생기고, 올리기는 제가 누릅니다. 다음 인터뷰에서는 학생 log에서 나온 질문을 씁니다. 이 한 바퀴를 다섯 번, 그리고 최종 문답으로 돕니다.' },

  // ── 운영 ─────────────────────────────────────────────
  { sec: '운영', title: '데이터는 어디로', widget: 'dflow', steps: 5, html: function () { var se = (window.DATAFLOW || {}).session || {}; return '' +
    ttl('데이터는 어디로 가나: 실제로 오가는 글', '실제 기록', 'live') +
    '<p class="lead" style="margin-bottom:12px"><b>보낸 글과 받은 글</b> 그대로. 1~4는 한 팀의 ' + (se.cpNo || '') + ' 인터뷰, 5~6은 다른 팀의 저장소 변화. 흐린 칸은 이름·학번·팀 이름.</p>' +
    '<div class="body nonext" style="flex-direction:column;gap:10px"><div id="dfRoute"></div><div id="dfPane" style="flex:1;display:flex;gap:16px;min-height:0"></div><div id="dfFoot"></div></div>' +
    '<div class="pv-strip"><span><b>점수·학생 명단</b>은 어떤 AI에도 보내지 않는다</span><span><b>녹음</b>은 성적 확정 뒤 교사 앱에서 일괄 삭제</span><span><b>더 조심하려면</b> 로컬 받아 적기 · 초안 끄기 · 비공개 저장소</span></div>'; },
    notes: '개인정보를 걱정하시는 분이 많을 것입니다. 한 팀의 첫 인터뷰 기록이 어디로 무엇을 보내고 무엇을 받는지 그대로 옮겼습니다.\n교사 앱은 기록과 녹음을 교사 계정의 시트와 드라이브에 둡니다. 서버는 녹음과 받아쓰기 지시를 Gemini에 보내 대화를 받아 적고, 그 대화와 회차 정보를 Solar에 보내 강점과 가이드 초안을 받습니다. 어디에도 점수와 학생 명단은 보내지 않습니다.\n목소리 파일은 성적 확정과 이의 신청 기간까지만 두고, 그 뒤 교사 앱에서 한꺼번에 지웁니다.\n더 조심해야 하는 학교라면 녹음을 교사 컴퓨터에서 받아 적거나, 피드백 초안을 끄거나, 비공개 저장소를 쓸 수 있습니다. 줄일 때마다 잃는 것이 있으니 도입 전에 학교 개인정보 담당과 먼저 정하시기를 권합니다.' },

  { sec: '운영', title: '지금까지와 비용', html: function (S) { var o = S.oral || {}; return '' +
    ttl('지금까지, 그리고 시간과 비용', '시스템에서 바로 집계', 'live') +
    '<p class="lead">진행 중인 사례. 수치는 <b>' + (S.updated || '') + '</b>에 서버·저장소에서 읽은 값이다.</p>' +
    '<div class="body" style="align-items:center"><div class="col" style="flex:1.2"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">' +
      '<div class="card"><div class="big">' + (o.sessions || 0) + '</div><p>구술 기록</p></div>' +
      '<div class="card"><div class="big">' + (o.minutes_recorded || 0) + '<small>분</small></div><p>녹음</p></div>' +
      '<div class="card"><div class="big">' + (o.transcribed || 0) + '</div><p>자동 받아 적기</p></div>' +
      '<div class="card"><div class="big">' + (o.feedback_ready || 0) + '</div><p>강점·가이드 초안</p></div>' +
      '<div class="card"><div class="big">' + (o.issues_posted || 0) + '</div><p>올린 이슈</p></div>' +
      '<div class="card"><div class="big">' + ((S.setuk || {}).rows || 0) + '</div><p>세특 근거</p></div>' +
    '</div></div><div class="col" style="flex:1;gap:14px" data-s="1">' +
      '<div class="card cost"><b>팀당 3분</b><p>9팀이면 약 32분, 한 차시를 거의 쓴다</p></div>' +
      '<div class="card cost"><b>약 120원</b><p>40분을 꽉 채운 녹음 하나의 받아 적기 비용</p></div>' +
      '<div class="card cost"><b>약 1,700원</b><p>한 학기 두 학급 받아 적기 비용</p></div>' +
    '</div></div>'; },
    notes: '지금까지의 수치입니다. 발표 직전에 스크립트로 다시 집계합니다. 첫 회차를 한 학급에서 실시했고, 기록마다 자동 받아 적기와 초안이 만들어졌고, 교사가 확인한 문안을 이슈로 올렸습니다.\n시간은 팀당 3분과 교대 30초로 계산하면 9팀에 약 32분, 한 차시를 거의 씁니다.\n받아 적기 비용은 2026년 10월 실측 단가로 40분 녹음 하나에 약 120원, 한 학기 두 학급에 약 1,700원입니다. 2027년부터는 약 두 배가 됩니다.' },

  // ── 의미 ─────────────────────────────────────────────
  { sec: '의미', title: '의미와 가치', html: '' +
    ttl('의미와 가치') +
    '<p class="lead">같은 시스템이 학생, 교사, 학교에 각각 다른 일을 한다.</p>' +
    '<div class="body" style="gap:22px;align-items:center">' +
      '<div class="card col val s" data-s="1"><h3>학생</h3><ul class="pts s"><li>AI 결과를 확인하는 습관이 기록으로 남는다<small>log 셋째 줄, 실습실의 검증 장면, 이슈의 AI 검증 안내</small></li><li>설명할 수 있어야 자기 것이 된다<small>팀원마다 모델·지표를 자기 말로</small></li><li>회차마다 다음 단계 안내를 받는다</li></ul></div>' +
      '<div class="card col val t" data-s="2"><h3>교사</h3><ul class="pts t"><li>질문과 판단에 집중한다<small>녹음·받아 적기·정리·초안은 AI 조교가</small></li><li>세특 근거가 저절로 쌓인다<small>학기말에 기억이 아니라 근거에서 고른다</small></li><li>시간과 비용이 계산된다</li></ul></div>' +
      '<div class="card col val" data-s="3"><h3>학교·교육과정</h3><ul class="pts"><li>수업, 평가, 기록이 같은 루브릭을 쓴다</li><li>과정 중심 평가의 증빙이 남는다<small>녹음·받아 적은 글·log·커밋 시각</small></li><li>AI 작성 표기와 교사 승인으로 투명성을 지킨다</li></ul></div>' +
    '</div>',
    notes: '의미를 세 대상으로 나누어 보겠습니다.\n학생에게는 AI 결과를 확인하는 습관이 기록으로 남고, 설명할 수 있어야 자기 것이 된다는 경험이 생깁니다.\n교사에게는 기록과 정리를 넘기고 질문과 판단에 집중할 시간이 생기고, 세특 근거가 학생별로 쌓입니다.\n학교 차원에서는 수업, 평가, 기록이 같은 기준을 쓰는 운영 사례가 됩니다.' },

  { sec: '의미', title: '다른 교과로', html: '' +
    ttl('다른 교과로') +
    '<p class="lead">앱과 서버에는 과목에 매인 내용이 없다.</p>' +
    '<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center">' +
    '<div class="keep2"><div class="card"><h3>그대로 쓰는 것</h3><p>구술 앱·서버 · 받아 적기와 초안 · log 네 줄 · 세특 근거 모으기</p></div><div class="card hl"><h3>바꾸는 것</h3><p>루브릭 팩(회차·질문) · 실습실 시나리오 · 기록 매체</p></div></div>' +
    '<div class="sub4">' +
      '<div class="card" data-s="1"><h3>정보</h3><em>적합도 높음</em><p>루브릭 팩만 바꾼다</p><q>이 입력에서 코드가 틀린다는 것을 어떻게 알았습니까?</q></div>' +
      '<div class="card" data-s="1"><h3>과학</h3><em>적합도 높음</em><p>탐구 단계가 판단 4축과 맞는다. 기록은 실험 노트·드라이브</p><q>통제한 변인과 그렇지 못한 변인은 무엇입니까?</q></div>' +
      '<div class="card" data-s="2"><h3>사회</h3><em>중간 이상</em><p>AI가 만든 통계·인용·출처를 원문과 대조하는 장면이 핵심</p><q>이 주장의 근거와 반대 근거는 무엇입니까?</q></div>' +
      '<div class="card" data-s="2"><h3>국어·영어</h3><em>중간</em><p>저장소 대신 구글 문서 버전 기록. 구술이 대필 문제에 대응</p><q>이 문단에서 AI 제안을 받아들이지 않은 곳은 어디이고 왜입니까?</q></div>' +
    '</div>' +
    '<div class="steps3" data-s="3"><span>도입 순서</span><b>1. 구술 기록</b><i>→</i><b>2. 피드백 전달</b><i>→</i><b>3. 통합 운영</b><small>1단계는 구글 계정, 아이폰, 받아 적기 키만 있으면 된다</small></div></div>',
    notes: '다른 교과로 옮길 때 그대로 쓰는 부분이 생각보다 큽니다. 구술 앱과 서버, 받아 적기와 초안, log 형식, 세특 근거 모으기는 처음부터 과목과 무관하게 만들었습니다. 바꾸는 것은 회차와 질문을 담은 루브릭 팩, 실습실 시나리오, 기록 매체입니다.\n정보와 과학이 가장 잘 맞습니다. 사회는 AI가 만든 통계와 출처를 원문과 대조하는 장면이 가장 중요해지고, 국어와 영어는 자기 글을 말로 설명하게 하는 구술이 생성형 AI 대필 문제에 직접 대응하는 방법이 됩니다.\n도입은 세 단계로 권합니다. 1단계 구술 기록은 구글 계정과 아이폰, 받아 적기용 키만 있으면 됩니다.' },

  // ── 앞으로 ─────────────────────────────────────────────
  { sec: '앞으로', title: '앞으로', widget: 'qr', html: function (S) { return '' +
    ttl('앞으로') +
    '<div class="body"><div class="col" style="flex:1.3;gap:16px">' +
      '<div class="card"><h3>한계</h3><ul class="pts t" style="margin-top:6px"><li>진행 중: 한 학급 첫 회차까지 실시<small>효과는 아직 측정 전. 오늘은 설계와 운영 가능성까지</small></li><li>매일 저장소 확인은 교사의 맥과 AI 로그인에 기댄다</li><li>녹음의 외부 전송, 공개 저장소는 학교와 먼저 정한다</li></ul></div>' +
      '<div class="card" data-s="1"><h3>다음</h3><ul class="pts" style="margin-top:6px"><li>루브릭 편집기와 설치 마법사: 다른 선생님이 바로 쓰도록</li><li>교과 융합: 같은 저장소를 두고 교과마다 자기 루브릭으로 구술</li><li>연구: 회차마다 설명이 나아지는가, AI 검증 기록이 늘어나는가, 교사 부담, 학생이 느끼는 공정성</li></ul></div>' +
      '<p style="font-size:19px;color:var(--muted)">이 발표 자료는 프로젝트가 끝나면 같은 주소에서 전체 결과로 갱신한다.</p>' +
    '</div><div class="col" style="flex:1;align-items:center;gap:10px"><div style="display:flex;gap:20px;justify-content:center;padding-top:10px" id="qrs"></div><img alt="" src="assets/art/cover.webp" style="max-height:330px;max-width:100%;object-fit:contain;margin-top:auto"></div></div>' + credit; },
    notes: '한계를 말씀드리고 마치겠습니다. 아직 진행 중이라 효과는 측정하지 않았습니다. 오늘은 설계와 운영 가능성까지 말씀드렸습니다. 매일 확인 루틴은 제 컴퓨터 환경에 기대고 있고, 녹음과 공개 저장소는 학교와 먼저 협의해야 합니다.\n다음으로는 다른 선생님이 바로 쓸 수 있게 루브릭 편집기와 설치 마법사를 만들고, 교과 융합 프로젝트에서 교과마다 자기 루브릭으로 구술하는 방식을 해 보려 합니다. 연구로는 회차별 설명의 변화, AI 검증 기록의 추이, 교사 부담, 학생 인식을 보겠습니다.\n이 발표 자료는 프로젝트가 끝나면 같은 주소에서 전체 결과로 갱신하겠습니다. 감사합니다.' }
  ];
})();
