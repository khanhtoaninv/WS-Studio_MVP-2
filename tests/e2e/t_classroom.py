"""Kiểm thử Làm bài trên lớp (D-129, D-131): phiên Quiz (2 học sinh, đảo đáp án, xếp hạng, biểu đồ, PNG) rồi phiên Phiếu (làm trên phiếu, tô đúng sai, xem phiếu từng em)."""
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
        check(T.locator('input[name="clsmode"][value="sheet"]').is_checked(), 'Chọn giao diện làm bài: mặc định Phiếu')
        T.check('input[name="clsmode"][value="quiz"]'); T.wait_for_timeout(100)
        T.click('[data-a="clsStart"]'); T.wait_for_selector('.cls-code b'); code = T.inner_text('.cls-code b').strip()
        check('Quiz' in T.inner_text('.cls-code'), 'Phiên dạng Quiz')
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
        rk = post('/api/class/ranking', {'code': code, 'studentCode': pcode})
        check(rk.get('me') == 1 and 'code' not in json.dumps(rk['ranking']) and rk['ranking'][0]['me'], 'Học sinh đã nộp xem bảng xếp hạng cả lớp kèm thứ hạng, không lộ mã cá nhân người khác')
        A.click('#rank'); A.wait_for_selector('.rk-list li.me')
        check('Em xếp hạng' in A.inner_text('.rk-head'), 'Trang học sinh mở bảng xếp hạng lớp')
        Bp = b.new_context().new_page(); Bp.goto(f'{BASE}/lop?ma={code}'); Bp.fill('#n', 'Bình'); Bp.click('#go'); Bp.wait_for_selector('.ex')
        bcode = Bp.inner_text('.me').split(':')[-1].strip()
        check(post('/api/class/ranking', {'code': code, 'studentCode': bcode}).get('_status') == 409, 'Chưa nộp thì chưa xem được bảng xếp hạng')
        tok = T.evaluate("JSON.parse(localStorage.getItem('wsstudio.class'))")[wsid]
        state = post('/api/class/state', tok); key = state['key']
        bp = post('/api/class/join', {'code': code, 'studentCode': bcode})['paper']; ap = joined['paper']
        def orders(p): return [[o['id'] if isinstance(o, dict) else o for o in q.get('options', [])] for it in p['items'] for q in it['questions']] + [it.get('rightList') for it in p['items']]
        check(orders(ap) != orders(bp) and orders(bp) == orders(post('/api/class/join', {'code': code, 'studentCode': bcode})['paper']), 'Mỗi em một thứ tự phương án, vào lại vẫn giữ nguyên')
        check(sorted(map(str, orders(ap))) != [] and all(sorted(map(str, a or [])) == sorted(map(str, c or [])) for a, c in zip(orders(ap), orders(state['paper']))), 'Đảo đáp án chỉ đổi thứ tự, không đổi nội dung')
        ans = {}
        for it, dit in zip(state['paper']['items'], bp['items']):
            for q, dq in zip(it['questions'], dit['questions']):
                k = key[q['id']]; t = it['type']
                ans[q['id']] = {'mcq': lambda: [o['id'] for o in dq['options']].index(k.get('correctId')), 'cloze_mcq': lambda: dq['options'].index(q['options'][k.get('correctIdx')]), 'tfng': lambda: k.get('answer'),
                    'matching': lambda: dit['rightList'].index(k.get('right')), 'ordering': lambda: k.get('answerText')}.get(t, lambda: (k.get('accepted') or [''])[0])()
        r = post('/api/class/answer', {'code': code, 'studentCode': bcode, 'answers': ans, 'submit': True})
        check(r['result']['correct'] == nq, f'Bình làm đúng cả {nq} câu theo thứ tự đã đảo, máy chủ chấm {r["result"]["correct"]}/{nq}')
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
        T.screenshot(path=str(ROOT/'tests'/'shots'/'classroom.png'), full_page=True) if (ROOT/'tests'/'shots').exists() else None
        print('Phiên dạng Phiếu')
        T.on('dialog', lambda d: d.accept())
        T.click('[data-a="clsNew"]'); T.click('.overlay .btn.primary'); T.wait_for_selector('[data-a="clsStart"]')
        T.click('[data-a="clsStart"]'); T.wait_for_selector('.cls-code b'); code2 = T.inner_text('.cls-code b').strip()
        check('Phiếu' in T.inner_text('.cls-code'), f'Phiên mới {code2} dạng Phiếu (mặc định)')
        D = b.new_context(viewport={'width': 1280, 'height': 860}).new_page(); D.on('pageerror', lambda e: errs.append('D ' + str(e))); D.on('dialog', lambda d: d.accept())
        D.goto(f'{BASE}/lop?ma={code2}'); D.fill('#n', 'Dung'); D.click('#go'); D.wait_for_selector('.wsv .wsv-page .q.fq')
        check(D.locator('.wsv .sheet-head h1').count() == 1 and len(set(D.eval_on_selector_all('.wsx[data-ex]', 'e=>e.map(x=>x.dataset.ex)'))) == len(state['paper']['items']), 'Học sinh thấy nguyên phiếu như bản giáo viên')
        check(D.locator('[data-act="allans"]').count() == 0 and D.locator('[data-act="pen"]').count() == 1, 'Phiếu học sinh không có nút đáp án, vẫn có bút')
        mcq = D.locator('.q.fq[data-type="mcq"]'); n_mcq = mcq.count()
        for i in range(n_mcq): mcq.nth(i).locator('.opt').first.click()
        check(D.locator('.q.fq[data-type="mcq"] .opt.picked').count() == n_mcq, f'Bấm chọn phương án ngay trên phiếu ({n_mcq} câu trắc nghiệm)')
        inp = D.locator('.fill-inp').first
        if inp.count(): inp.fill('hello')
        D.wait_for_timeout(1200)
        check('đã lưu' in D.inner_text('#stt'), 'Bài làm trên phiếu tự lưu')
        D.reload(); D.wait_for_selector('.wsv .q.fq')
        check(D.locator('.q.fq .opt.picked').count() == n_mcq, 'Tải lại: giữ lựa chọn trên phiếu')
        D.click('#sub'); D.wait_for_selector('.score')
        nok, nno = D.locator('.q.fq.res-ok').count(), D.locator('.q.fq.res-no, .q.fq.res-none').count()
        check(nok + nno == nq and '/' in D.inner_text('.score'), f'Nộp bài: tô {nok} câu đúng xanh, {nno} câu sai đỏ, có điểm cuối')
        check(D.locator('.fill-inp:not([readonly])').count() == 0, 'Nộp rồi thì phiếu khóa')
        D.screenshot(path=str(ROOT/'tests'/'shots'/'student-sheet.png')) if (ROOT/'tests'/'shots').exists() else None
        D.click('#rank'); D.wait_for_selector('.rk-list li.me'); check('Dung' in D.inner_text('.rk-list li.me'), 'Học sinh xem bảng xếp hạng, dòng của em được tô')
        T.wait_for_timeout(2500); T.locator('.cls-st tbody tr').first.click(); T.wait_for_selector('.cls-sheet .wsv .q.fq')
        check(T.locator('.cls-sheet .q.fq.res-ok').count() == nok and T.locator('.cls-sheet .opt.picked').count() == n_mcq, 'Giáo viên mở đúng phiếu bài làm của em, đúng xanh sai đỏ')
        check(T.locator('.cls-sheet [data-act="pen"]').count() == 1 and T.locator('.cls-sheet [data-act="allans"]').count() == 1, 'Trên phiếu bài làm vẫn có bút và nút đáp án')
        T.locator('.cls-sheet [data-act="allans"]').click(); check(T.locator('.cls-sheet .wsv-pages.show-ans').count() == 1, 'Bật đáp án đúng trên phiếu bài làm')
        T.screenshot(path=str(ROOT/'tests'/'shots'/'teacher-sheet.png')) if (ROOT/'tests'/'shots').exists() else None
        T.click('[data-a="clsSheetX"]'); check(T.locator('.cls-sheet').count() == 0, 'Đóng phiếu bài làm')
        check(not errs, 'Không có lỗi trang' + (': ' + ' | '.join(errs[:3]) if errs else ''))
        b.close()
finally:
    srv.terminate()
print(f'== {oks} đạt, {len(fails)} không đạt')
if fails: sys.exit(1)
