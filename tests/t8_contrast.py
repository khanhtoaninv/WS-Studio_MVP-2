"""t8: nhúng font Be Vietnam Pro và đo tương phản chữ (WCAG 2.2 AA: 4.5:1 chữ thường, 3:1 chữ lớn) ở chế độ sáng và tối.
Đo phần vỏ app; bỏ qua nội dung tờ phiếu (.wsv-content, .wsx) vì tờ phiếu là bản in nền trắng."""
from harness import *
import json
JS = r"""
()=>{
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const over=(top,bot)=>({r:top.r*top.a+bot.r*(1-top.a),g:top.g*top.a+bot.g*(1-top.a),b:top.b*top.a+bot.b*(1-top.a),a:1});
 const bgOf=el=>{const stack=[];for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e); if(cs.backgroundImage&&cs.backgroundImage!=='none') return null; const c=parse(cs.backgroundColor); if(c&&c.a>0){stack.push(c); if(c.a>=1)break;}}
   let base={r:255,g:255,b:255,a:1}; for(let i=stack.length-1;i>=0;i--) base=over(stack[i],base); return base};
 const out=[]; const seen=new Set();
 const w=document.createTreeWalker(document.getElementById('app'),NodeFilter.SHOW_TEXT);
 let n; while(n=w.nextNode()){
  const t=n.nodeValue.trim(); if(!t) continue; const el=n.parentElement; if(!el||el.closest('.wsv-content,.wsx,script,style,svg,.ic-w')) continue;
  const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0) continue;
  const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) continue;
  const fg=parse(cs.color); const bg=bgOf(el); if(!fg||!bg) continue;
  const f=fg.a<1?over(fg,bg):fg; const L1=lum(f),L2=lum(bg); const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const size=parseFloat(cs.fontSize), bold=+cs.fontWeight>=700; const large=size>=24||(size>=18.66&&bold);
  const need=large?3:4.5; if(ratio<need){ const key=el.className+'|'+cs.color+'|'+JSON.stringify(bg); if(seen.has(key)) continue; seen.add(key);
    out.push({t:t.slice(0,28),cls:(el.tagName+'.'+el.className).slice(0,40),ratio:Math.round(ratio*100)/100,need,fg:cs.color,bg:`rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`}); }
 }
 return out;
}
"""
PAGES = [('lan','#/'),('lan','#/soan'),('lan','#/phieu'),('lan','#/phieu/ws1'),('lan','#/xem/ws8'),('lan','#/kho'),('lan','#/giao-trinh'),('lan','#/tieu-chuan'),('lan','#/nhat-ky'),('lan','#/cai-dat'),('ha','#/duyet'),('thu','#/cau-hinh')]
r = Run(1440, 900); r.open('#/')
print('# Font')
r.p.wait_for_timeout(300)
r.check(r.js("document.fonts.check('600 14px \"Be Vietnam Pro\"')"), 'Be Vietnam Pro nạp được từ dữ liệu nhúng')
r.check('Be Vietnam Pro' in r.js("getComputedStyle(document.body).fontFamily"), 'Giao diện app dùng Be Vietnam Pro')
allfails = {}
for theme in ('light', 'dark'):
    print('# Tương phản', theme)
    r.js(f"WS.App.setTheme('{theme}')")
    fails = []
    for u, h in PAGES:
        r.user(u); r.go(h); r.p.wait_for_timeout(350)
        for f in r.js(JS): f['page'] = h; fails.append(f)
    allfails[theme] = fails
    for f in fails[:40]: print('   ·', f['page'], f['cls'], repr(f['t']), f['ratio'], 'cần', f['need'], f['fg'], 'trên', f['bg'])
    r.check(not fails, f'Chữ vỏ app đạt WCAG AA ở chế độ {theme} ({len(fails)} chỗ chưa đạt)')
json.dump(allfails, open('/tmp/claude-0/contrast.json', 'w'), ensure_ascii=False, indent=1)
r.done()
