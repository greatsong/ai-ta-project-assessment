// 구술 서버 코드(Code.gs)를 그대로 불러, 실제 기록 하나로 외부 AI에 보내는 요청문을 만든다.
// 사용: node dataflow_prompts.js <Code.gs> <Seed.gs> <입력.json>  → 표준 출력에 JSON
// 입력: { bootstrap, session } (구술 서버 bootstrap·getSession 응답). 시트는 bootstrap으로 다시 꾸민다.
// 환경 변수 DF_UPSTAGE에 키가 있으면 서버의 writeFeedback_를 그대로 돌려 솔라에 실제로 보낸다(형식 확인·다시 쓰기 포함).
// 요청은 curl로 보내고 키는 표준 입력 설정으로만 넘긴다(명령줄·출력에 남지 않는다).
const fs = require('fs'), vm = require('vm'), os = require('os'), path = require('path'), cp = require('child_process');
const [code, seed, input] = process.argv.slice(2).map((p, i) => i < 2 ? fs.readFileSync(p, 'utf8') : JSON.parse(fs.readFileSync(p, 'utf8')));
const { bootstrap: B, session: S } = input;

function sheet(rows) {
  const data = rows.map(r => r.slice());
  return {
    data, getLastRow: () => data.length, getLastColumn: () => Math.max(0, ...data.map(r => r.length)),
    getRange(r, c, nr = 1, nc = 1) {
      return { getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (data[r - 1 + i] || [])[c - 1 + j] ?? '')),
               getValue: () => (data[r - 1] || [])[c - 1] ?? '' };
    }
  };
}
const sheets = {};
const ctx = { console: { log() {}, warn() {}, error() {} } };
ctx.SpreadsheetApp = { getActive: () => ({ getSheetByName: n => sheets[n] || null }) };
ctx.PropertiesService = { getScriptProperties: () => ({ getProperty: k => (k === 'UPSTAGE_API_KEY' ? process.env.DF_UPSTAGE || null : null) }) };
const calls = [];
ctx.UrlFetchApp = { fetch(url, o) {
  const tmp = path.join(os.tmpdir(), 'df_' + process.pid + '_' + calls.length + '.json');
  fs.writeFileSync(tmp, o.payload);
  const auth = (o.headers || {}).Authorization || '';
  let out;
  try {
    out = cp.execFileSync('curl', ['-s', '-K', '-', '-X', 'POST', url, '-H', 'Content-Type: application/json', '--data-binary', '@' + tmp, '-w', '\n%{http_code}'],
      { input: 'header = "Authorization: ' + auth + '"\n', maxBuffer: 1 << 24 }).toString('utf8');
  } finally { fs.unlinkSync(tmp); }
  const i = out.lastIndexOf('\n'), body = out.slice(0, i), code = +out.slice(i + 1);
  calls.push({ messages: JSON.parse(o.payload).messages, response: body, code });
  return { getContentText: () => body, getResponseCode: () => code };
} };
vm.createContext(ctx);
vm.runInContext(code + '\n' + seed + '\n;this.__api = { HEADERS, TABS, sessionContext_, geminiPrompt_, feedbackPrompt_, writeFeedback_, feedbackCheck_ };', ctx);
const H = ctx.__api.HEADERS;
const row = (head, obj) => head.map(h => obj[h] ?? '');
sheets['설정'] = sheet([H['설정'], ['course_name', B.settings.course_name || '', ''], ['stt_context', B.settings.stt_context || '', '']]);
sheets['회차'] = sheet([H['회차']].concat(B.checkpoints.map(c => row(H['회차'], {
  '회차ID': c.id, '번호': c.no, '이름': c.title, '차시': c.lesson, '주': c.week, '축': c.axes, '형식': c.format, '팀당 분': c.minutes,
  '시작 질문': c.opener, '꼬리질문': (c.followups || []).join('\n'), '준비물': (c.prepare || []).join('\n'), '사용': true }))));
sheets['루브릭'] = sheet([H['루브릭']].concat(B.checkpoints.flatMap(c => (c.items || []).map((it, i) => row(H['루브릭'], {
  '회차ID': c.id, '항목ID': it.id, '항목': it.title, '단위': it.unit === 'individual' ? '개인' : '팀', '축': it.axis,
  '상': it.high, '중': it.mid, '하': it.low, '순서': i + 1, '평가 요소': (it.elements || []).join('\n') })))));
sheets['팀'] = sheet([H['팀']].concat(B.teams.map(t => row(H['팀'], {
  '팀ID': t.id, '반': t.cls, '팀 이름': t.name, '팀원': t.members, '저장소': t.repo, '질문': t.question, '메모': t.memo, '방법': t.method }))));
const rec = { '기록ID': S.id, '반': S.cls, '회차ID': S.cp, '팀ID': S.teamId, '팀 이름': S.teamName, '전사': S.transcript || '' };
const ctxLine = ctx.__api.sessionContext_(rec);
const fb = ctx.__api.feedbackPrompt_(rec);
const res = { gemini_prompt: ctx.__api.geminiPrompt_(ctxLine), feedback_sys: fb.sys, feedback_user: fb.user, session_cols: H[ctx.__api.TABS.SESSIONS] };
if (process.env.DF_UPSTAGE) {
  const out = ctx.__api.writeFeedback_(rec);
  res.solar = { text: out.text, model: out.model, rounds: calls.length,
                retry: calls.length > 1 ? calls[1].messages[calls[1].messages.length - 1].content : '',
                first_check: ctx.__api.feedbackCheck_(JSON.parse(calls[0].response).choices[0].message.content).msg || '' };
}
process.stdout.write(JSON.stringify(res));
