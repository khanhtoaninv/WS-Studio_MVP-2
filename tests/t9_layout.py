from harness import Run
r = Run()
print('Đợt 9 · Dàn trang: ngắt trang, giữ trọn bài, tách bài đoạn văn dài (D-134)')
r.open('#/')
# Chia trang trên các phiếu mẫu: không trang nào kết thúc bằng tiêu đề bài đứng một mình, bài giữ trọn không bị tách
res = r.js("""(()=>{ const out=[]; WS.S.state.worksheets.forEach(ws=>{ const d=WS.EX.viewerData(ws,'teacher'); const pages=WSV.paginate(null,d,{teacher:true});
  const orphan = pages.some((p,i)=>i<pages.length-1 && p.units.length && p.units[p.units.length-1].kind==='head');
  const split = d.items.filter(it=>WSV.keepOf(it)).filter(it=>{ const pg=new Set(); pages.forEach((p,i)=>p.units.forEach(u=>{ if(u.ex===it.id) pg.add(i); })); return pg.size>1; }).map(it=>it.id);
  out.push({ws:ws.id, orphan, split, tall:pages.some(p=>p.tall)}); }); return out; })()""")
r.check(not any(x['orphan'] for x in res), 'Tiêu đề và hướng dẫn bài không đứng một mình cuối trang: ' + str([x['ws'] for x in res if x['orphan']]))
r.check(not any(x['split'] for x in res), 'Bài đoạn văn và bài nối (giữ trọn mặc định) không bị tách: ' + str([x for x in res if x['split']][:2]))
# Ngắt trang trước một bài
brk = r.js("""(()=>{ const ws=WS.Q.ws('ws8'); const d=WS.EX.viewerData(ws,'teacher'); d.items[2].breakBefore=true; const pages=WSV.paginate(null,d,{teacher:true});
  const pi = pages.findIndex(p=>p.units.some(u=>u.ex===d.items[2].id)); return {start: pages[pi].units[0].ex===d.items[2].id && pages[pi].units[0].first, pi}; })()""")
r.check(brk['start'] and brk['pi'] > 0, f"Bài có ngắt trang luôn bắt đầu ở đầu trang (trang {brk['pi']+1})")
# Tắt giữ trọn: bài được tách theo câu khi cần
kp = r.js("""(()=>{ const ws=WS.Q.ws('ws8'); const d=WS.EX.viewerData(ws,'teacher'); const it=d.items.find(i=>i.type==='tfng'||i.type==='matching');
  return {auto: WSV.keepOf(it), off: WSV.keepOf(Object.assign({}, it, {keep:false})), on: WSV.keepOf({type:'mcq', keep:true}), mcq: WSV.keepOf({type:'mcq'})}; })()""")
r.check(kp['auto'] and not kp['off'] and kp['on'] and not kp['mcq'], 'Giữ trọn bài: tự bật với bài đoạn văn/bài nối, giáo viên bật tắt được từng bài')
# Bài đoạn văn trái, câu hỏi phải dài hơn một trang: tách câu hỏi sang trang sau, không có trang quá khổ
l3 = r.js("""(()=>{ const ws=WS.Q.ws('ws8'); const d=WS.EX.viewerData(ws,'teacher'); const it=d.items.find(i=>i.type==='tfng'); it.layout='L3';
  const qs=it.questions; const n0=qs.length; for(let k=0;k<5;k++) qs.push(...qs.slice(0,n0).map((q,j)=>Object.assign({}, q, {id:q.id+'x'+k+'_'+j})));
  d.items=[it]; const pages=WSV.paginate(null,d,{teacher:true}); const html=pages.map((p,i)=>WSV.pageHTML(d,p,i,pages.length,{teacher:true})).join('');
  return {n:pages.length, tall:pages.some(p=>p.tall), cont:html.includes('đoạn văn ở trang trước'), lay3:pages[0].units.length>0 && pages[0].units[0].html.includes('lay3')}; })()""")
r.check(l3['n'] >= 2 and not l3['tall'] and l3['cont'] and l3['lay3'], f"Bài L3 dài {l3['n']} trang: trang đầu giữ đoạn văn trái, câu hỏi còn lại sang trang sau, không trang quá khổ")
# Trình soạn: nút dàn trang trong bài, biểu tượng ở mục lục, nút ngắt trang trong Preview
r.open('#/phieu/ws3'); r.p.wait_for_timeout(500)
r.p.click('.toc-item >> nth=1'); r.p.wait_for_timeout(400)
r.check(r.p.locator('[data-a="itBrk"]').count()==1 and r.p.locator('[data-a="itKeep"]').count()==1, 'Bài trong phiếu có nút Bắt đầu trang mới và Giữ trọn bài')
r.p.click('[data-a="itBrk"]'); r.p.wait_for_timeout(500)
it1 = r.js("WS.Q.ws('ws3').items[1]")
r.check(it1.get('breakBefore') is True and r.p.locator('[data-a="itBrk"].on').count()==1, 'Bấm Bắt đầu trang mới lưu vào bài trong phiếu')
r.check(r.js("WS.S.state.audit.some(a=>a.action==='Ngắt trang trước bài')"), 'Nhật ký ghi ngắt trang')
first_on_page = r.js(f"""(()=>{{ const pw=[...document.querySelectorAll('#ed-prev .wsv-pw')]; return pw.some(p=>{{ const s=p.querySelector('.wsx'); return s && s.dataset.ex==='{it1['exerciseId']}'; }}); }})()""")
r.check(first_on_page, 'Preview: bài có ngắt trang nằm đầu một trang')
r.check(r.p.locator('#ed-prev .brk-hook').count() >= 1, 'Preview có nút Ngắt trang ở đây giữa các bài')
r.p.click('[data-a="tocBack"]'); r.p.wait_for_timeout(300)
r.check(r.p.locator('.toc-brk').count()==1, 'Mục lục đánh dấu bài bắt đầu trang mới')
r.p.locator(f'#ed-prev .wsx[data-ex="{it1["exerciseId"]}"] .brk-hook').evaluate('b=>b.click()'); r.p.wait_for_timeout(500)
r.check(r.js("!WS.Q.ws('ws3').items[1].breakBefore"), 'Bấm Bỏ ngắt trang trong Preview gỡ ngắt trang')
r.check(r.js("JSON.stringify(WS.EX.viewerData(WS.Q.ws('ws3'),'student').items.map(i=>i.breakBefore))").startswith('['), 'Tệp xuất mang theo thuộc tính ngắt trang')
r.shot('t9_editor')
r.done()
