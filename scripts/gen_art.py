"""두 어려움 장의 그림을 OpenAI 최신 이미지 모델로 만든다(키는 저장소 밖 .env에서 읽는다).
    python scripts/gen_art.py <파일이름> gpt-image-2.5-sunburst <프롬프트 파일>
그림체는 assets/art/style.txt, 그림마다의 내용은 assets/art/subjects.txt. 만든 뒤 여백을 잘라 webp로 줄인다."""
import base64, json, sys, time, urllib.request, urllib.error
key = next(l.split('=',1)[1].strip().strip('"\'') for l in open('/Users/greatsong/greatsong-project/ai-chat-for-students/server/.env') if l.startswith('OPENAI_API_KEY='))
name, model, pfile = sys.argv[1], sys.argv[2], sys.argv[3]
body = {'model': model, 'prompt': open(pfile, encoding='utf-8').read(), 'size': '1024x1024', 'quality': 'medium', 'background': 'transparent', 'output_format': 'png', 'n': 1}
req = urllib.request.Request('https://api.openai.com/v1/images/generations', data=json.dumps(body).encode(), headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
t0 = time.time()
try:
    d = json.loads(urllib.request.urlopen(req, timeout=300).read())
except urllib.error.HTTPError as e:
    print('오류', e.code, e.read().decode()[:400]); sys.exit(1)
open(name, 'wb').write(base64.b64decode(d['data'][0]['b64_json']))
print('저장', name, round(time.time() - t0, 1), '초', d.get('usage', {}))
