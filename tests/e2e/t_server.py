"""Kiểm thử máy chủ + dịch vụ Claude với Claude API giả (không tốn tiền, không cần mạng)."""
import json, os, subprocess, sys, time, pathlib, urllib.request
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]; HERE = pathlib.Path(__file__).parent
oks, fails = 0, []
def check(c, label):
    global oks
    print(('  ✓ ' if c else '  ✗ ') + label); oks += bool(c); c or fails.append(label)
def start(env_extra, port):
    env = dict(os.environ, PORT=str(port), ANTHROPIC_API_KEY='sk-test', ANTHROPIC_BASE_URL='http://127.0.0.1:8790', **env_extra)
    p = subprocess.Popen(['node', 'server/index.js'], cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for _ in range(50):
        try: urllib.request.urlopen(f'http://127.0.0.1:{port}/api/health'); return p
        except Exception: time.sleep(0.2)
    raise SystemExit('server did not start')
def run(fail):
    fake = subprocess.Popen(['node', str(HERE/'fake_anthropic.mjs')], env=dict(os.environ, **({'FAIL':'1'} if fail else {})))
    time.sleep(0.5); srv = start({}, 5199)
    try:
        h = json.load(urllib.request.urlopen('http://127.0.0.1:5199/api/health'))
        with sync_playwright() as pw:
            b = pw.chromium.launch(**({'executable_path':os.environ['WS_CHROME']} if os.environ.get('WS_CHROME') else {}))
            p = b.new_page(); toasts = []
            p.goto('http://127.0.0.1:5199/'); p.wait_for_selector('#main'); p.wait_for_timeout(300)
            r = p.evaluate("""async () => { const S=WS.services; const g = await S.ai.generate('ex1-l2-u1-1','mcq',{count:4, themeId:'space'});
              const ex = {id:'x', type:'mcq', scope:{lessonIds:['ex1-l2-u1-1']}, themeId:'space', draft:g.draft};
              const vs = await S.ai.questionVariants(ex, g.draft.questions[0].id, ['easier'], 3);
              const exv = await S.ai.exerciseVariants(ex, 2);
              const bad = {id:'y', type:'mcq', scope:{lessonIds:['ex1-l2-u1-1']}, themeId:'space', draft:JSON.parse(JSON.stringify(g.draft))};
              bad.draft.questions[0].options[1].text = bad.draft.questions[0].options[0].text;
              const before = WS.V.validate(bad).issues.length; const fixes = await S.ai.autofix(bad, WS.Q.lesson('ex1-l2-u1-1'));
              const after = WS.V.validate(bad).issues.length;
              return {before, after, fixes, kind:S.ai.kind, label:S.ai.label, log:g.log, n:g.draft.questions.length, q0:g.draft.questions[0], vs:vs.length, vsId:!!vs[0].id, exv:exv.length,
                      errors: WS.V.validate(ex).errors.map(e=>e.code), toast: document.body.innerText.includes('Không gọi được Claude')}; }""")
            log = json.load(urllib.request.urlopen('http://127.0.0.1:8790/__log'))
            b.close()
        return h, r, log
    finally:
        srv.terminate(); fake.terminate()

h, r, log = run(False)
print('Máy chủ có khóa, Claude giả trả lời bình thường')
check(h['ai']=='claude' and h['model']=='claude-opus-5-5', '/api/health báo Claude claude-opus-5-5')
check(r['kind']=='claude' and 'Claude' in r['label'], 'App tự chọn dịch vụ Claude khi chạy qua máy chủ')
check(r['n']==4 and r['q0']['correctId']=='o0' and r['q0']['options'][0]['id']=='o0', 'Sinh bài: 4 câu, đổi đáp án chỉ số sang id lựa chọn')
check('Claude' in r['log'][0], 'Nhật ký sinh ghi nguồn Claude')
check(r['vs']==3 and r['vsId'], 'Tạo lại câu: 3 phương án có id mới')
check(r['exv']==2, 'Tạo lại bài: 2 phương án')
check(r['before']>0 and r['after']<r['before'] and 'Claude' in ' '.join(r['fixes']), f"Tự sửa: gửi lỗi bộ kiểm tra cho Claude, còn {r['after']}/{r['before']} vấn đề")
check(not r['errors'], 'Bài Claude trả về qua bộ kiểm tra không lỗi: ' + ','.join(r['errors']))
check(all(l['model']=='claude-opus-5-5' and l['fallbacks']=='default' and 'server-side-fallback-2026-07-01' in (l['beta'] or '') for l in log), 'Mọi lệnh gửi model, fallbacks "default" và beta header đúng')
check(all(l['hasSchema'] and l['effort']=='medium' for l in log), 'Mọi lệnh ép JSON schema, effort medium')
check(any('Daily routines' in (l['prompt'] or '') for l in log), 'Lời nhắc có ngữ cảnh lesson')
h, r, log = run(True)
print('Claude API lỗi 500')
check(r['kind']=='claude' and r['n']>=1 and 'Claude' not in r['log'][0], 'Lỗi API: tự quay về AI giả lập, vẫn có bài')
check(r['toast'], 'Hiện thông báo "Không gọi được Claude"')
print('Chế độ dev (Vite trong máy chủ, không có khóa)')
env = {k:v for k,v in os.environ.items() if k!='ANTHROPIC_API_KEY'}; env['PORT']='5198'
d = subprocess.Popen(['node','server/index.js','--dev'], cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
try:
    for _ in range(60):
        try: html = urllib.request.urlopen('http://127.0.0.1:5198/').read().decode(); break
        except Exception: time.sleep(0.25)
    check('/src/main.js' in html, 'npm run dev phục vụ trang qua Vite')
    check(json.load(urllib.request.urlopen('http://127.0.0.1:5198/api/health'))['ai']=='mock', 'Không có khóa: /api/health báo giả lập')
finally: d.terminate()
print(f'== {oks} đạt, {len(fails)} không đạt')
if fails: sys.exit(1)
