# AI TA와 함께 하는 과정중심 프로젝트 수업 평가

당곡고 2026 『데이터 과학』 팀 프로젝트에서 AI를 조교(TA)로 두고 구술 평가와 기록을 운영한 사례의 발표 자료입니다. 브라우저에서 넘기는 HTML 슬라이드이고, 실제 수업 화면은 개인정보를 흐린 캡처로 보여 줍니다.

- 발표 자료: https://greatsong.github.io/ai-ta-project-assessment/
- 검토 문서(다른 교과 적용 가능성): https://greatsong.github.io/ai-ta-project-assessment/review/
- 데이터 과학 실습실: https://2026dgds.streamlit.app

**진행 중인 사례입니다.** 프로젝트가 끝나면 아래 절차로 수치와 화면을 다시 만들어 같은 주소에서 갱신합니다.

## 넘기기

| 키 | 하는 일 |
|---|---|
| → · 스페이스 · 화면 클릭 | 다음 단계(장 안의 내용이 하나씩 나온다) |
| ← | 이전 단계 |
| N | 발표자 노트 |
| O | 전체 장 목록 |
| F | 전체 화면 |
| 그림 클릭 | 원본 크기로 확대 |

주소 끝의 `#/쪽/단계`(예: `#/13/2`)로 바로 갈 수 있습니다.

## 구조

```
index.html            발표 자료(엔진과 내용을 불러온다)
deck/                 엔진: 16:9 무대, 단계 공개, 섹션 칩, 노트, 전체 보기, 확대
content/slides.js     슬라이드 내용(문장·캡처 배치·발표자 노트). 고칠 때는 주로 이 파일
content/widgets.js    눌러 보는 요소(한 회차 흐름, 이슈 표시, 실시 현황표, 시간·비용 계산기, 탭, 도입 단계)
content/stats.js      수치(자동 생성, scripts/update_stats.py)
content/dataflow.js   실제로 오가는 글(자동 생성, scripts/build_dataflow.py, 이름·학번·팀 이름은 ⟦가림⟧)
content/scenes.css    도입 장면 애니메이션과 '실제로 오가는 글' 화면의 모양
assets/art/           도입 장면 그림(scripts/gen_art.py, 프롬프트는 style.txt·subjects.txt)
content/review.md     검토 문서 원본 → review/index.html
captures/             화면 캡처(자동 생성, 개인정보 흐림)
scripts/              캡처·집계·점검 스크립트
```

엔진과 내용을 나누었으므로, 프로젝트가 진행되면 `content/`와 `captures/`만 바뀝니다.

## 프로젝트가 끝난 뒤 다시 만들기

교사의 맥에서 실행합니다. 원본 수업 저장소(`2026-ds-danggok`, 환경 변수 `DS_ROOT`로 바꿀 수 있음)와 구술 서버 연결 정보(`_private/oral/config.json`)가 필요합니다. 서버에는 읽기 요청만 보냅니다.

1. 세특 근거 최신화(수업 저장소에서): `python3 scripts/setuk_store.py collect`
2. 수치: `python3 scripts/update_stats.py` → `content/stats.js`
3. 교사 앱 화면: `python3 scripts/capture_app.py E반 <끝난 회차 번호>` (B반도 같은 방식)
4. 깃허브 화면: `scripts/capture_github.py`의 `SHOTS`에서 보여 줄 이슈·log를 고른 뒤 실행
5. 세특 근거 화면: `python3 scripts/capture_setuk.py [학번]`
6. 실습실 화면: `python3 scripts/capture_lab.py` (시나리오 문장이 바뀌면 스크립트의 글귀도 고친다)
6-1. 실제로 오가는 글: `python3 scripts/build_dataflow.py [팀ID] [--solar]` (기본 TE01, 녹음부터 올린 이슈까지 한 팀. `--solar`는 서버의 초안 함수를 맥에서 그대로 돌려 솔라에 한 번 보낸다. 선생님이 고친 기록은 서버에 처음 초안이 남지 않기 때문이다. 시트는 바꾸지 않는다. 가리지 못한 낱말이 있으면 멈춘다)
6-2. 도입 그림(필요할 때만): `python3 scripts/gen_art.py` (OpenAI gpt-image-2.5-sunburst, 투명 배경. 키는 ai-chat-for-students/server/.env에서 읽고 출력하지 않는다)
7. 내용: `content/slides.js`에서 진행 예정이던 회차를 실시로 바꾸고, 결과 장을 더한다(아래 목록)
8. 검토 문서: `content/review.md`를 고친 뒤 `python3 scripts/build_review.py`
9. 점검: `python3 -m http.server 4065` 를 띄우고 `python3 scripts/check_slides.py` → `raw/qa/`의 모든 장·단계 캡처를 눈으로 본다
10. `index.html`의 `?v=` 번호를 올린다(브라우저가 예전 파일을 쓰지 않게)
11. 개인정보 점검(아래) 뒤 커밋·푸시하면 GitHub Pages가 갱신된다

### 끝난 뒤 더할 장(지금은 빈 자리)

- 회차별 루브릭 수준의 변화(학생을 알 수 없는 집계)
- log의 "AI가 준 것 중 고치거나 버린 것" 줄의 추이(빈칸 비율, 검증 기록 수)
- 최종 포스터 문답 장면과 학생 설문(공정성·도움 정도)
- 교사 시간: 회차당 소요 시간, 초안을 고친 정도
- 세특에 실제로 쓰인 근거의 예(학생 동의 범위 안에서)

## 개인정보 원칙

- 공개 저장소이므로 **흐리지 않은 원본 화면을 올리지 않는다.** 스크립트는 찍기 직전에 학번(5자리 숫자), 명단의 이름·팀 이름, 저장소 주소, 학생 깃허브 계정·프로필 사진, 점수와 항목 수준을 흐리고, 원본은 파일로 남기지 않는다.
- 짧은 영문 팀 이름(예: "AI")은 본문의 일반 낱말까지 흐리므로 낱말 목록에서 빼고, 팀 이름 자리에서만 흐린다.
- 새로 찍은 캡처는 올리기 전에 한 장씩 눈으로 확인한다. 흐림은 글자 크기에 비례하지만, 큰 제목은 특히 다시 본다.
- 구술 녹음·전사 원문 전체, 점수표, 선생님의 학생별 메모는 올리지 않는다.
- 연결 정보·API 키·토큰은 이 저장소에 두지 않는다.

## 필요한 것

Python 3.11, `playwright`(크로미움), `Pillow`. 발표 자료 자체는 정적 파일이라 서버가 필요 없습니다.
