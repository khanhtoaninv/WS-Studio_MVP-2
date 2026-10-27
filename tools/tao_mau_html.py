"""Tạo lại tệp mẫu cho đặc tả tệp HTML phiếu (D-139): docs/html-phieu/.

Dựng từ dist/ws-studio.html (chạy `npm run build` trước), lấy phiếu trình diễn WS-0008 trong dữ liệu mẫu,
xuất bản giáo viên và bản học sinh đúng như nút Tải bản chính thức, kèm dữ liệu ViewerData dạng JSON và hai ảnh chụp.
Chạy: python tools/tao_mau_html.py  (đặt WS_CHROME nếu dùng Chromium riêng)
"""
import json, os, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT/'docs'/'html-phieu'; OUT.mkdir(parents=True, exist_ok=True)
CODE = 'WS-0008'

with sync_playwright() as pw:
    b = pw.chromium.launch(**({'executable_path':os.environ['WS_CHROME']} if os.environ.get('WS_CHROME') else {}))
    p = b.new_page(viewport={'width':1280, 'height':900})
    p.goto((ROOT/'dist'/'ws-studio.html').as_uri()+'#/'); p.wait_for_selector('#main'); p.wait_for_timeout(400)
    files = p.evaluate("""code => { const ws = WS.S.state.worksheets.find(w => w.code===code);
      return ['teacher','student'].map(k => { const x = WS.EX.build(ws, k); return {name:x.name, html:x.html, data:x.data}; }); }""", CODE)
    for f in files:
        (OUT/f['name']).write_text(f['html'], encoding='utf-8', newline='')
        kind = 'giao-vien' if f['data']['meta']['kind']=='teacher' else 'hoc-sinh'
        (OUT/f'vi-du-du-lieu-{kind}.json').write_text(json.dumps(f['data'], ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        print('  ', f['name'])
    p.goto((OUT/f'{CODE}_v1_hoc-sinh.html').as_uri()); p.wait_for_timeout(800)
    p.screenshot(path=str(OUT/'anh-hoc-sinh-trang1.png'))
    p.goto((OUT/f'{CODE}_v1_giao-vien.html').as_uri()); p.wait_for_timeout(800)
    p.click('[data-act="allans"]'); p.wait_for_timeout(200)
    p.evaluate("(()=>{const s=document.querySelector('.wsv-stage'), el=document.querySelector('[data-page=\"1\"]'); s.scrollTop=el.offsetTop-12;})()")
    p.wait_for_timeout(300)
    p.screenshot(path=str(OUT/'anh-giao-vien-dap-an.png'))
    b.close()
print('Đã tạo lại tệp mẫu ở', OUT)
