"""발표 자료 그림을 OpenAI 최신 이미지 모델로 만든다(키는 저장소 밖 .env에서 읽고 출력하지 않는다).

    python3 scripts/gen_art.py <출력.png> <프롬프트.txt> [--ref 참고1.png --ref 참고2.png] [--size 1536x1024] [--transparent]

- 참고 이미지(--ref)를 주면 이미지 편집 요청으로 보내 같은 인물을 유지한다(캐릭터 시트: assets/art/ref/).
- 프롬프트는 assets/art/prompts/에 둔다. 그림체 공통 문장은 prompts/_style.txt이고, 프롬프트 파일의 {STYLE}이 그것으로 바뀐다.
- 모델: gpt-image-2.5-sunburst(2026-10 기준 최신, 투명 배경 가능).
"""
import argparse, base64, json, sys, time
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parent.parent
ENV = Path('/Users/greatsong/greatsong-project/ai-chat-for-students/server/.env')
MODEL = 'gpt-image-2.5-sunburst'


def key():
    return next(l.split('=', 1)[1].strip().strip('"\'') for l in ENV.read_text().splitlines() if l.startswith('OPENAI_API_KEY='))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out'); ap.add_argument('prompt')
    ap.add_argument('--ref', action='append', default=[])
    ap.add_argument('--size', default='1536x1024')
    ap.add_argument('--transparent', action='store_true')
    ap.add_argument('--quality', default='high')
    a = ap.parse_args()
    style = (ROOT / 'assets/art/prompts/_style.txt')
    prompt = Path(a.prompt).read_text(encoding='utf-8').replace('{STYLE}', style.read_text(encoding='utf-8').strip() if style.exists() else '')
    data = {'model': MODEL, 'prompt': prompt, 'size': a.size, 'quality': a.quality, 'output_format': 'png', 'n': 1}
    if a.transparent:
        data['background'] = 'transparent'
    h = {'Authorization': 'Bearer ' + key()}
    t0 = time.time()
    if a.ref:
        files = [('image[]', (Path(r).name, open(r, 'rb'), 'image/png' if r.endswith('.png') else 'image/webp')) for r in a.ref]
        r = requests.post('https://api.openai.com/v1/images/edits', headers=h, data=data, files=files, timeout=400)
    else:
        r = requests.post('https://api.openai.com/v1/images/generations', headers=dict(h, **{'Content-Type': 'application/json'}), data=json.dumps(data), timeout=400)
    if r.status_code != 200:
        print(a.out, '오류', r.status_code, r.text[:400]); sys.exit(1)
    Path(a.out).write_bytes(base64.b64decode(r.json()['data'][0]['b64_json']))
    print('저장', a.out, round(time.time() - t0, 1), '초')


if __name__ == '__main__':
    main()
