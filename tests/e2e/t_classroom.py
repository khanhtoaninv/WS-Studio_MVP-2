"""Kiểm thử Làm bài trên lớp (D-129): giáo viên mở phiên, 2 học sinh vào làm, xếp hạng, biểu đồ, xuất PNG."""
import json, os, subprocess, sys, time, pathlib, urllib.request
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
PORT = 5196; BASE = f'http://127.0.0.1:{PORT}'
oks, fails = 0, []
def check(c, label):
    global oks
    print(('  ✓ ' if c else '  ✗ ') + label); oks += bool(c); c or fails.append(label)
def post(path, body):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers={'content-type': 'application/json'})
    try: return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e: return {'_status': e.code, **json.load(e)}
env = {k: v for k, v in os.environ.items() if k != 'ANTHROPIC_API_KEY'}; env['PORT'] = str(PORT)
srv = subprocess.Popen(['node', 'server/index.js'], cwd=ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
for _ in range(50):
    try: urllib.request.urlopen(BASE + '/api/health'); break
    except Exception: time.sleep(0.2)
try:
    with sync_playwright() as pw:
        b = pw.chromium.launch(**({'executable_path': os.environ['WS_CHROME']} if os.environ.get('WS_CHROME') else {}))
        T = b.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True).new_page()
        errs = []; T.on('pageerror', lambda e: errs.append(str(e)))
        T.goto(BASE + '/'); T.wait_for_selector('#main'); T.wait_for_timeout(300)
        wsid = T.evaluate("WS.S.state.worksheets.find(w=>w.title.includes('A Day in Space')).id")
        T.evaluate(f"location.hash='#/xem/{wsid}?kind=teacher'"); T.wait_for_timeout(500)
        check(T.locator('.vw-head button', has_text='Làm bài trên lớp').count() == 1, 'Viewer giáo viên có nút Làm bài trên lớp')
        T.locator('.vw-head button', has_text='Làm bài trên lớp').click(); T.wait_for_timeout(300)
        T.click('[data-a="clsStart"]'); T.wait_for_selector('.cls-code b'); code = T.inner_text('.cls-code b').strip()
        check(len(code) == 4, f'Mở phiên, mã phiên {code}')
        check(f'/lop?ma={code}' in T.inner_text('.cls-url'), 'Hiện địa chỉ cho học sinh kèm mã phiên')
        print('Học sinh')
        A = b.new_context(viewport={'width': 390, 'height': 800}).new_page(); A.on('pageerror', lambda e: errs.append('A ' + str(e)))
        A.goto(f'{BASE}/lop?ma={code}'); A.fill('#n', 'An'); A.click('#go'); A.wait_for_selector('.ex')
        pcode = A.inner_text('.me').split(':')[-1].strip()
        check(len(pcode) == 4, 'Học sinh An vào bằng tên, nhận mã cá nhân')
        joined = post('/api/class/join', {'code': code, 'studentCode': pcode})
        bad = [k for k in ['correctId', 'accepted', 'answer', 'correctIdx', 'right', 'answerText', 'explanation'] if f'"{k}"' in json.dumps(joined['paper'])]
        check(not bad, 'Đề gửi cho học sinh không chứa đáp án' + (': ' + ','.join(bad) if bad else ''))
        nq = sum(len(it['questions']) for it in joined['paper']['items'])
        for grp in A.locator('.q .opts').all(): grp.locator('.opt').first.click()
        A.locator('input[data-q]').first.fill('hello')
        A.wait_for_timeout(1200)
        check('đã lưu' in A.inner_text('#stt'), 'Bài làm tự lưu')
        A.reload(); A.wait_for_selector('.ex')
        check(A.locator('.opt.on').count() >= 1, 'Tải lại trang: tự vào lại, giữ câu đã chọn')
        A.screenshot(path=str(ROOT/'tests'/'shots'/'student.png'), full_page=False) if (ROOT/'tests'/'shots').exists() else None
        A.on('dialog', lambda d: d.accept()); A.click('#sub'); A.wait_for_selector('.res')
        check('/' in A.inner_text('.res .big'), 'Nộp bài: học sinh thấy số câu đúng')
        Bp = b.new_context().new_page(); Bp.goto(f'{BASE}/lop?ma={code}'); Bp.fill('#n', 'Bình'); Bp.click('#go'); Bp.wait_for_selector('.ex')
        bcode = Bp.inner_text('.me').split(':')[-1].strip()
        tok = T.evaluate("JSON.parse(localStorage.getItem('wsstudio.class'))")[wsid]
        state = post('/api/class/state', tok); key = state['key']
        ans = {}
        for it in state['paper']['items']:
            for q in it['questions']:
                k = key[q['id']]; t = it['type']
                ans[q['id']] = {'mcq': lambda: [o['id'] for o in q['options']].index(k.get('correctId')), 'cloze_mcq': lambda: k.get('correctIdx'), 'tfng': lambda: k.get('answer'),
                    'matching': lambda: it['rightList'].index(k.get('right')), 'ordering': lambda: k.get('answerText')}.get(t, lambda: (k.get('accepted') or [''])[0])()
        r = post('/api/class/answer', {'code': code, 'studentCode': bcode, 'answers': ans, 'submit': True})
        check(r['result']['correct'] == nq, f'Bình làm đúng cả {nq} câu, máy chủ chấm {r["result"]["correct"]}/{nq}')
        check(post('/api/class/answer', {'code': code, 'studentCode': bcode, 'answers': {}}).get('_status') == 409, 'Đã nộp thì không sửa được')
        print('Giáo viên')
        T.wait_for_timeout(2500)
        rows = T.locator('.cls-st tbody tr'); check(rows.count() == 2, 'Danh sách 2 học sinh tự cập nhật')
        check(T.locator('.cls-rank li').first.inner_text().split('\n')[1] == 'Bình', 'Bảng xếp hạng: Bình đứng đầu')
        check(T.locator('.cls-bar').count() == len(state['paper']['items']), 'Biểu đồ tỷ lệ đúng theo từng bài')
        rows.first.click(); T.wait_for_selector('.cls-ans')
        check('Đáp án' in T.inner_text('.modal') and 'An' in T.inner_text('.modal h2'), 'Bấm học sinh: xem bài từng câu và đáp án')
        T.keyboard.press('Escape')
        T.click('[data-a="clsEnd"]'); T.wait_for_timeout(400)
        check(T.locator('[data-a="clsReopen"]').count() == 1, 'Kết thúc phiên')
        C = b.new_context().new_page(); C.goto(f'{BASE}/lop?ma={code}'); C.fill('#n', 'Chi'); C.click('#go'); C.wait_for_timeout(500)
        check('kết thúc' in C.inner_text('body'), 'Phiên đã kết thúc: học sinh mới không vào được')
        with T.expect_download() as dl: T.click('[data-a="clsPng"]')
        p = dl.value.path(); data = open(p, 'rb').read(); open(str(ROOT/'tests'/'shots'/'report.png'),'wb').write(data) if (ROOT/'tests'/'shots').exists() else None
        check(data[:8] == b'\x89PNG\r\n\x1a\n' and len(data) < 200_000, f'Xuất ảnh báo cáo PNG ({len(data)//1024} KB, {dl.value.suggested_filename})')
        T.reload(); T.wait_for_selector('.cls-code b')
        check(T.inner_text('.cls-code b').strip() == code, 'Tải lại màn giáo viên vẫn giữ phiên')
        check(not errs, 'Không có lỗi trang' + (': ' + ' | '.join(errs[:3]) if errs else ''))
        T.screenshot(path=str(ROOT/'tests'/'shots'/'classroom.png'), full_page=True) if (ROOT/'tests'/'shots').exists() else None
        b.close()
finally:
    srv.terminate()
print(f'== {oks} đạt, {len(fails)} không đạt')
if fails: sys.exit(1)
