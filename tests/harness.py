"""Shared Playwright harness for ws-studio self-tests."""
import pathlib, sys, json, os
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT/'dist'/'ws-studio.html').as_uri()
SHOTS = ROOT/'tests'/'shots'; SHOTS.mkdir(exist_ok=True)

class Run:
    def __init__(self, w=1440, h=900):
        self.pw = sync_playwright().start()
        self.b = self.pw.chromium.launch(**({'executable_path':os.environ['WS_CHROME']} if os.environ.get('WS_CHROME') else {}))
        self.ctx = self.b.new_context(viewport={'width':w,'height':h}, accept_downloads=True)
        self.p = self.ctx.new_page()
        self.errors = []; self.fails = []; self.oks = 0
        self.p.on('console', lambda m: self.errors.append(m.text) if m.type=='error' else None)
        self.p.on('pageerror', lambda e: self.errors.append('PAGEERROR '+str(e)))
    def open(self, hash='#/'):
        self.p.goto(URL+hash); self.p.wait_for_selector('#main'); self.p.wait_for_timeout(250)
    def go(self, hash):
        self.p.evaluate(f"location.hash={json.dumps(hash)}"); self.p.wait_for_timeout(300)
    def js(self, code): return self.p.evaluate(code)
    def check(self, cond, label):
        if cond: self.oks += 1; print('  ✓', label)
        else: self.fails.append(label); print('  ✗', label)
    def shot(self, name): self.p.screenshot(path=str(SHOTS/f'{name}.png'))
    def user(self, uid): self.js(f"WS.A.switchUser('{uid}')"); self.p.wait_for_timeout(150)
    def text(self, sel='#main'): return ' '.join(self.p.inner_text(sel).split())
    def done(self):
        errs = [e for e in self.errors if 'favicon' not in e]
        self.check(not errs, 'Không có lỗi console' + ('' if not errs else ': ' + ' | '.join(errs[:5])))
        self.b.close(); self.pw.stop()
        print(f'== {self.oks} đạt, {len(self.fails)} không đạt')
        if self.fails: print('FAILED:', self.fails); sys.exit(1)
