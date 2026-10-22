"""Kiểm thử máy chủ + dịch vụ Claude với Claude API giả (không tốn tiền, không cần mạng)."""
import json, os, subprocess, sys, time, pathlib, urllib.request, urllib.error
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
            r = p.evaluate("""async () => { const S=WS.services; const g = await S.ai.generate('ex1-l2-u1-1','mcq',{count:4, themeId:'space', focus:['Use adverbs of frequency']});
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
check(any('Focus this exercise on these lesson objectives: Use adverbs of frequency' in (l['prompt'] or '') for l in log), 'Lời nhắc nêu mục tiêu lesson của khối (D-136)')
h, r, log = run(True)
print('Claude API lỗi 500')
check(r['kind']=='claude' and r['n']>=1 and 'Claude' not in r['log'][0], 'Lỗi API: tự quay về AI giả lập, vẫn có bài')
check(r['toast'], 'Hiện thông báo "Không gọi được Claude"')
def post(port, path, body):
    rq = urllib.request.Request(f'http://127.0.0.1:{port}{path}', json.dumps(body).encode(), {'content-type':'application/json'})
    try: return 200, json.load(urllib.request.urlopen(rq))
    except urllib.error.HTTPError as e: return e.code, json.load(e)
def get(port, path): return json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}{path}'))

print('Cài đặt API: chọn nhà cung cấp, khóa và model (D-137)')
import tempfile
tmp = pathlib.Path(tempfile.mkdtemp()) / 'ai.json'
fake = subprocess.Popen(['node', str(HERE/'fake_anthropic.mjs')]); fake_bad = subprocess.Popen(['node', str(HERE/'fake_anthropic.mjs')], env=dict(os.environ, FAIL='1', FAKE_PORT='8791'))
time.sleep(0.5)
envx = {k:v for k,v in os.environ.items() if k not in ('ANTHROPIC_API_KEY','OPENAI_API_KEY','GEMINI_API_KEY','DEEPSEEK_API_KEY')}
envx.update(PORT='5197', WS_AI_SETTINGS=str(tmp), ANTHROPIC_BASE_URL='http://127.0.0.1:8790', OPENAI_BASE_URL='http://127.0.0.1:8790/v1',
            GEMINI_BASE_URL='http://127.0.0.1:8790/v1beta', DEEPSEEK_BASE_URL='http://127.0.0.1:8791')
srv = subprocess.Popen(['node','server/index.js'], cwd=ROOT, env=envx, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
try:
    for _ in range(50):
        try: urllib.request.urlopen('http://127.0.0.1:5197/api/health'); break
        except Exception: time.sleep(0.2)
    check(get(5197,'/api/health')['ai']=='mock', 'Chưa cài gì: mặc định AI giả lập')
    st, d = post(5197,'/api/ai/settings',{'provider':'openai'})
    check(st==200 and d['active']=='mock' and d['missingKey']=='openai' and get(5197,'/api/health')['ai']=='mock', 'Chọn OpenAI mà thiếu khóa: vẫn dùng giả lập và báo thiếu khóa')
    st, d = post(5197,'/api/ai/settings',{'provider':'openai','providers':{'openai':{'key':' "sk-openai-test-123456789" ','model':'gpt-x'}}})
    h = get(5197,'/api/health')
    check(h['ai']=='openai' and h['model']=='gpt-x', 'Lưu khóa và model: /api/health báo OpenAI gpt-x (bỏ dấu nháy, khoảng trắng)')
    raw = json.dumps(get(5197,'/api/ai/settings'))
    check('sk-openai-test-123456789' not in raw and get(5197,'/api/ai/settings')['providers']['openai']['hasKey'], 'Trình duyệt chỉ thấy khóa đã che, không thấy khóa thật')
    check(json.loads(tmp.read_text())['providers']['openai']['key']=='sk-openai-test-123456789' and oct(tmp.stat().st_mode & 0o777)=='0o600', 'Khóa lưu ở tệp riêng trên máy chủ, quyền 600')
    st, d = post(5197,'/api/ai/settings',{'provider':'nope'}); check(st==400, 'Nhà cung cấp lạ bị từ chối')
    st, d = post(5197,'/api/ai/test',{'provider':'deepseek','key':'sk-wrong','model':'deepseek-chat'})
    check(st==401 and 'Incorrect API key' in d['error'], 'Kiểm tra kết nối với khóa sai: báo lỗi 401 của nhà cung cấp')
    with sync_playwright() as pw:
        b = pw.chromium.launch(**({'executable_path':os.environ['WS_CHROME']} if os.environ.get('WS_CHROME') else {}))
        p = b.new_page(); errs = []; p.on('pageerror', lambda e: errs.append(str(e)))
        p.goto('http://127.0.0.1:5197/'); p.wait_for_selector('#main'); p.wait_for_timeout(400)
        p.evaluate("WS.S.commit(st=>{ st.currentUserId='thu'; })"); p.evaluate("location.hash='#/cau-hinh?tab=api'"); p.wait_for_timeout(900)
        gen = """async () => { const g = await WS.services.ai.generate('ex1-l2-u1-1','mcq',{count:4}); return {kind:WS.services.ai.kind, label:WS.services.ai.label, log:g.log[0], n:g.draft.questions.length, errors:WS.V.validate({type:'mcq',scope:{lessonIds:['ex1-l2-u1-1']},draft:g.draft}).errors.length}; }"""
        check(p.is_checked('input[name=apiProv][value=openai]'), 'Tab API mở đúng nhà đang dùng (OpenAI)')
        check(p.locator('#apiModel').input_value()=='gpt-x' and p.locator('#apiKey').get_attribute('placeholder').startswith('Đang dùng sk-open'), 'Ô model hiện gpt-x, ô khóa hiện khóa đã che')
        r = p.evaluate(gen)
        check(r['kind']=='openai' and r['n']==4 and 'OpenAI' in r['log'] and r['errors']==0, 'Sinh bài qua OpenAI: 4 câu, qua bộ kiểm tra không lỗi')
        # Gemini qua giao diện: chọn, nhập khóa, thử kết nối, lưu
        p.click('input[name=apiProv][value=gemini]'); p.wait_for_selector('#apiKey')
        p.fill('#apiKey','AIza-gemini-test'); p.fill('#apiModel','gemini-test')
        p.click('[data-a=admApiTest]'); p.wait_for_selector('.banner.ok', timeout=5000)
        check('Kết nối được' in p.inner_text('.banner.ok'), 'Nút Kiểm tra kết nối báo "Kết nối được"')
        p.click('[data-a=admApiSave]'); p.wait_for_timeout(800)
        r = p.evaluate(gen)
        check(r['kind']=='gemini' and r['n']==4 and 'Gemini' in r['log'], 'Lưu xong dùng ngay Gemini, không cần chạy lại máy chủ')
        # DeepSeek: máy chủ giả lỗi, app tự quay về giả lập và báo
        post(5197,'/api/ai/settings',{'provider':'deepseek','providers':{'deepseek':{'key':'sk-ds'}}})
        p.evaluate('WS.services.detect()'); p.wait_for_timeout(500)
        r = p.evaluate(gen)
        check(r['kind']=='deepseek' and 'DeepSeek' not in (r['log'] or '') and r['n']>=1 and 'Không gọi được DeepSeek' in p.inner_text('body'), 'Nhà cung cấp lỗi 401: quay về giả lập và thông báo đúng tên nhà cung cấp')
        # Về giả lập
        p.evaluate("location.hash='#/cau-hinh?tab=api'"); p.wait_for_selector('input[name=apiProv]'); p.wait_for_timeout(400)
        p.click('input[name=apiProv][value=mock]'); p.click('[data-a=admApiSave]'); p.wait_for_timeout(800)
        r = p.evaluate(gen)
        check(r['kind']=='mock' and get(5197,'/api/health')['ai']=='mock', 'Chọn AI giả lập và lưu: quay về giả lập')
        check(not errs, 'Không có lỗi trang: ' + '; '.join(errs)); b.close()
    log = json.load(urllib.request.urlopen('http://127.0.0.1:8790/__log'))
    o = [l for l in log if l['url'].endswith('/v1/chat/completions')]; g = [l for l in log if ':generateContent' in l['url']]
    check(o and all(l['auth']=='Bearer sk-openai-test-123456789' and l['model']=='gpt-x' and l['json']=='json_object' and l['hasSchema'] for l in o), 'OpenAI: gửi khóa Bearer, model gpt-x, ép JSON và kèm lược đồ')
    check(g and all(l['auth'] in ('AIza-gemini-test',) and l['model']=='gemini-test' and l['json']=='application/json' for l in g), 'Gemini: gửi khóa x-goog-api-key, model gemini-test, ép JSON')
    check(any('Daily routines' in (l['prompt'] or '') for l in o), 'Lời nhắc gửi OpenAI có ngữ cảnh lesson')
finally:
    srv.terminate(); fake.terminate(); fake_bad.terminate()

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
