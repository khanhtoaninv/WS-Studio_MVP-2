/* ============ APP SHELL, ROUTER, DEMO PANEL, SELFTEST ============ */
import { WS } from '../ws.js';
import { VERSION, NOTE } from '../version.js';

/* Máy chủ khởi động từ mã khác phiên bản với trang (thường là cửa sổ máy chủ cũ còn chạy) */
const verWarn = () => { const srv = WS.services.config.server;
  return srv && srv.version !== VERSION ? ` <span style="color:var(--bad,#c0392b)" title="Đóng mọi cửa sổ máy chủ rồi chạy lại chay.bat">· máy chủ ${srv.version ? 'bản ' + srv.version : 'mã cũ'}</span>` : ''; };
const U = WS.U, Q = WS.Q, R = WS.R, S = WS.S, UI = WS.UI, A = WS.A, V = WS.V, AI = WS.AI;
const esc = U.esc;
WS.views = WS.views || {};
WS.ACT = WS.ACT || {};
const App = WS.App = {route:{name:'home', params:{}}};

App.theme = () => { try { return localStorage.getItem('wsstudio.theme') || 'auto'; } catch(e){ return 'auto'; } };
App.setTheme = t => { try { localStorage.setItem('wsstudio.theme', t); } catch(e){} App.applyTheme(); };
App.applyTheme = () => { const t = App.theme(), el = document.documentElement; if(t==='light'||t==='dark') el.setAttribute('data-theme', t); else el.removeAttribute('data-theme'); };
App.applyTheme();

App.parse = () => {
  const h = (location.hash||'#/').slice(1); const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(qs||''));
  const map = {'':'home','soan':'wizard','phieu':parts[1]?'editor':'worksheets','xem':'viewer','lop':'classroom','kho':'library','bai':'exercise','giao-trinh':'curriculum','tieu-chuan':'standards','duyet':'review','nhat-ky':'log','cau-hinh':'admin','cai-dat':'settings','phan-hoi':'feedback'};
  return {name:map[parts[0]||'']||'home', params:Object.assign({id:parts[1]}, q), path};
};

/* ---------- shell ---------- */
App.navItems = () => {
  const me = Q.me(); const pending = S.state.worksheets.filter(w=>w.status==='pending').length;
  return [
    {r:'wizard', href:'#/soan', ico:'＋', label:'Soạn phiếu', cta:true},
    {r:'home', href:'#/', ico:'⌂', label:'Dashboard'},
    {r:'worksheets', href:'#/phieu', ico:'▤', label:'Kho Phiếu', alt:['editor','viewer','classroom']},
    {r:'library', href:'#/kho', ico:'▦', label:'Kho Bài', alt:['exercise']},
    {r:'curriculum', href:'#/giao-trinh', ico:'❖', label:'Giáo trình'},
    {r:'standards', href:'#/tieu-chuan', ico:'✓', label:'Tiêu chuẩn'},
    me.role==='l2' && {r:'review', href:'#/duyet', ico:'◎', label:'Duyệt Phiếu', badge:pending},
    {r:'log', href:'#/nhat-ky', ico:'≡', label:'Nhật ký'},
    {r:'feedback', href:'#/phan-hoi', ico:'✉', label:'Phản hồi'},
    me.role==='admin' && {r:'admin', href:'#/cau-hinh', ico:'⚙', label:'Cài đặt'}
  ].filter(Boolean);
};
App.shell = () => {
  const root = document.getElementById('app');
  root.innerHTML = `<div class="shell"><header class="topbar" id="topbar"></header><nav class="nav" id="nav" aria-label="Điều hướng chính"></nav><main class="main" id="main" tabindex="-1"></main><nav class="tabbar" id="tabbar" aria-label="Điều hướng chính (điện thoại)"></nav></div><div id="demo-root"></div>`;
};
App.renderTop = () => {
  const me = Q.me(); const unread = S.state.notifications.filter(n=>n.userId===me.id && !n.read).length;
  const saved = S.saveError ? `<span class="saved err" title="Bật lại kết nối trong Bảng demo">⚠ Lỗi tự lưu (mất kết nối giả lập)</span>` : S.memoryFallback ? `<span class="saved err" title="Trình duyệt chặn localStorage">⚠ Đang lưu tạm trong bộ nhớ, dữ liệu mất khi đóng trang</span>` : (S.lastSaved?`<span class="saved">Đã lưu lúc ${U.fmtTime(S.lastSaved)}</span>`:'');
  document.getElementById('topbar').innerHTML = `
    <a class="brand" href="#/"><span class="brand-mark">ws</span>ws-studio</a>
    <span class="mock-flag" title="Prototype chạy trên dữ liệu mô phỏng trong trình duyệt">Dữ liệu mô phỏng</span>
    <span class="top-spacer"></span>${saved}
    <button class="btn ghost sm" data-a="feedback" title="Gửi phản hồi kèm ngữ cảnh màn hình">✉ Phản hồi</button>
    <button class="iconbtn" data-a="bell" aria-label="Thông báo (${unread} chưa đọc)" title="Thông báo">🔔${unread?`<span class="dot">${unread}</span>`:''}</button>
    <a class="iconbtn" href="#/cai-dat" aria-label="Cài đặt" title="Cài đặt">⚙</a>
    <button class="who" data-a="who" aria-label="Đang đóng vai ${esc(me.name)}, bấm để đổi người dùng">${UI.avatar(me)}<span><b>${esc(me.name)}</b> <span class="role">${esc(WS.ROLE_SHORT[me.role])}</span></span><span aria-hidden="true">▾</span></button>`;
};
App.renderNav = () => {
  const r = App.route.name;
  document.getElementById('nav').innerHTML = App.navItems().map(n=>`<a href="${n.href}" class="${n.cta?'cta ':''}${(r===n.r||(n.alt||[]).includes(r))&&!n.cta?'on':''}" ${(r===n.r||(n.alt||[]).includes(r))?'aria-current="page"':''}><span class="ico" aria-hidden="true">${n.ico}</span>${n.label}${n.badge?`<span class="badge">${n.badge}</span>`:''}</a>`).join('')+
    `<div class="nav-foot"><button data-a="loadSeed" title="Thay toàn bộ dữ liệu bằng bộ mẫu">⟲ Nạp dữ liệu mẫu</button><button data-a="resetEmpty" title="Xóa phiếu, bài, nhật ký; giữ người dùng, giáo trình và theme mẫu">⌫ Reset (về trống)</button><div class="ver" title="${U.esc(NOTE)}">Phiên bản ${VERSION}${verWarn()}</div></div>`;
};
App.renderTabbar = () => {
  const r = App.route.name; const items = App.navItems(); const pick = k => items.find(n=>n.r===k);
  const main = ['home','worksheets','wizard','library'].map(pick).filter(Boolean);
  const rest = items.filter(n=>!main.includes(n));
  const cur = n => r===n.r || (n.alt||[]).includes(r);
  document.getElementById('tabbar').innerHTML = main.map(n=>`<a href="${n.href}" class="${cur(n)?'on':''}" ${cur(n)?'aria-current="page"':''}><span aria-hidden="true">${n.ico}</span>${n.r==='wizard'?'Soạn':n.label}</a>`).join('')+
    `<button data-a="tabMore" aria-haspopup="menu" aria-label="Mục khác"><span aria-hidden="true">≡</span>Khác</button>`;
  App._tabRest = rest.filter(n=>n.r!=='admin').concat([{label:'Cài đặt', href:'#/cai-dat', ico:'⚙'}]);
  if(Q.me().role==='admin') App._tabRest.push({label:'Cấu hình hệ thống', href:'#/cau-hinh', ico:'⚙'});
};
App.render = () => {
  if(App._rendering){ App._again = true; return; }
  App._rendering = true;
  try { App._render(); } finally { App._rendering = false; }
  if(App._again){ App._again = false; setTimeout(App.render, 0); }
};
App._render = () => {
  const ae = document.activeElement; const fk = ae && ae.dataset && ae.dataset.fk; const sel = fk && ae.selectionStart!=null ? [ae.selectionStart, ae.selectionEnd] : null; const typed = fk && 'value' in ae ? ae.value : null;
  App.route = App.parse();
  App.renderTop(); App.renderNav(); App.renderTabbar();
  const main = document.getElementById('main');
  const v = WS.views[App.route.name] || WS.views.home;
  if(App._lastView && App._lastView!==v && App._lastView.leave) App._lastView.leave();
  App._lastView = v;
  try { v.render(main, App.route.params); } catch(e){ console.error(e); main.innerHTML = `<div class="page"><div class="banner err">Lỗi hiển thị màn hình: ${esc(e.message)}. Hãy thử Đặt lại dữ liệu trong Bảng demo.</div></div>`; }
  App.renderDemo();
  if(fk){ const el = document.querySelector(`[data-fk="${CSS.escape(fk)}"]`); if(el && el!==document.activeElement){ if(typed!=null && el.value!==typed && !el.readOnly) el.value = typed; el.focus(); if(sel && el.setSelectionRange) try{ el.setSelectionRange(sel[0],sel[1]); }catch(e){} } }
};

/* ---------- event dispatch ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if(!el || el.closest('.wsv')) return; if(el.classList.contains('is-disabled')) return;
  const f = WS.ACT[el.dataset.a]; if(f){ e.preventDefault(); f(el, e); }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if(!el || el.closest('.wsv')) return; const f = WS.ACT[el.dataset.c]; if(f) f(el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if(!el || el.closest('.wsv')) return; const f = WS.ACT[el.dataset.i]; if(f) f(el, e); });

Object.assign(WS.ACT, {
  who: el => UI.menu(el, [{head:'Đổi người dùng (không cần mật khẩu)'}, ...WS.USERS.map(u=>({icon:u.id===Q.me().id?'●':'', label:`${u.name} · ${WS.ROLE_LABEL[u.role]}`, onClick:()=>{ A.switchUser(u.id); UI.toast(`Đang đóng vai ${u.name} (${WS.ROLE_SHORT[u.role]}).`); }}))], {alignRight:true}),
  bell: el => {
    const me=Q.me(); const list = S.state.notifications.filter(n=>n.userId===me.id).sort((a,b)=>b.at-a.at).slice(0,12);
    const p = UI.menu(el, [{head:`Thông báo của ${me.name}`}, ...(list.length?[]:[{html:'<div class="muted small" style="padding:10px">Chưa có thông báo.</div>'}]),
      ...list.map(n=>({html:`<button class="notif ${n.read?'':'unread'}" data-nid="${n.id}">${esc(n.text)}<div class="when">${U.ago(n.at)}</div></button>`})),
      ...(list.some(n=>!n.read)?[{sep:true},{label:'Đánh dấu tất cả đã đọc', onClick:()=>S.commit(()=>list.forEach(n=>n.read=true))}]:[])], {alignRight:true});
    p.style.width='340px';
    p.addEventListener('click', e=>{ const b=e.target.closest('[data-nid]'); if(!b) return; const n=S.state.notifications.find(x=>x.id===b.dataset.nid); UI.closeMenu(); S.commit(()=>n.read=true); if(n.link) location.hash=n.link; });
  },
  loadSeed: () => UI.confirm({title:'Nạp dữ liệu mẫu?', body:'<p>Toàn bộ dữ liệu hiện tại (phiếu, bài, nhận xét, nhật ký, cấu hình đã sửa) sẽ được thay bằng bộ dữ liệu mẫu gồm 9 phiếu. Không hoàn tác được.</p>', ok:'Nạp dữ liệu mẫu', danger:true}).then(v=>{ if(!v) return; App.loadSeed(); UI.toast('Đã nạp dữ liệu mẫu.'); location.hash='#/'; }),
  tabMore: el => UI.menu(el, (App._tabRest||[]).map(n=>({label:n.label, icon:n.ico, onClick:()=>{ location.hash=n.href; }}))),
  resetEmpty: () => UI.confirm({title:'Reset về trống?', body:'<p>Xóa mọi phiếu, bài, nhận xét, thông báo, nhật ký và cấu hình hệ thống đã sửa. Giữ người dùng, giáo trình mẫu và theme mẫu. Không hoàn tác được.</p>', ok:'Reset', danger:true}).then(v=>{ if(!v) return; const u=S.state.currentUserId; S.state = WS.resetEmpty(); S.state.currentUserId=u; S.state.seededAt=Date.now(); S.session={undo:{},redo:{},loadedRev:{},ui:{}}; S.persist(); S.emit(); UI.toast('Đã reset về trống.'); location.hash='#/'; }),
  feedback: () => {
    const r = App.route; const ed = S.session.ui.editor||{}; const ws = r.name==='editor' && Q.ws(r.params.id);
    const ctx = {route:location.hash||'#/', screen:r.name, user:Q.me().name, role:Q.me().role, ws:ws?{code:ws.code, title:ws.title, status:R.wsStatus(ws).label}:null, ex:ed.curEx?(Q.ex(ed.curEx)||{}).id:null};
    UI.modal({title:'Gửi phản hồi', sub:'Tự đính kèm màn hình hiện tại và vai đang đóng.', body:`<div class="banner info" style="margin-bottom:10px">Màn hình: <b>${esc(ctx.screen)}</b> · ${esc(ctx.route)} · Vai: <b>${esc(ctx.user)}</b>${ctx.ws?` · Phiếu ${esc(ctx.ws.code)} (${esc(ctx.ws.status)})`:''}</div>
      <div class="field"><label for="fb-t">Bạn thấy gì? (ví dụ: không biết bấm đâu, nhãn khó hiểu)</label><textarea class="inp" id="fb-t" rows="5" autofocus></textarea></div>`,
      buttons:[{label:'Hủy', kind:'ghost'}, {label:'Gửi phản hồi', kind:'primary', onClick:(m,c)=>{ const t=m.querySelector('#fb-t').value.trim(); if(!t){ UI.toast('Hãy nhập nội dung phản hồi.'); return false; } S.commit(st=>{ st.feedback.push({id:U.uid('fb'), at:Date.now(), userId:st.currentUserId, route:ctx.route, context:ctx, text:t}); }); WS.audit('Gửi phản hồi','system',''); c(); UI.toast('Đã ghi nhận phản hồi. Xem tại mục Phản hồi đã gửi.'); return false; }}]});
  }
});

/* ---------- demo panel ---------- */
App.tour = () => {
  const after = a => S.state.audit.some(x=>x.action.startsWith(a) && x.at > (S.state.seededAt||0));
  return [
    ['S1 · Tạo phiếu mới và sinh bài', after('Tạo phiếu')], ['S1 · Done các bài và Duyệt cấp 1', after('Duyệt cấp 1')], ['S1 · Quản lý Nhận xét duyệt và Trả lại có note', after('Trả lại')],
    ['S1 · Duyệt cấp 2 và tải 2 tệp HTML', after('Xuất bản')], ['S2 · Ép AI sinh lỗi, xem bài bị chặn Done', after('Sinh bài (ép lỗi')], ['S3 · Khóa mềm và từ chối lưu khi xung đột', after('Từ chối lưu')],
    ['S4 · Mở khóa sửa phiếu đã duyệt', after('Mở khóa sửa')], ['S5 · Nhân bản bài từ kho và đưa vào phiếu', after('Nhân bản')||after('Tạo bản phát sinh')], ['S6 · Mở viewer, vẽ, xem đáp án', after('Mở viewer')]
  ];
};
App.renderDemo = () => {
  const root = document.getElementById('demo-root'); if(!root) return;
  const open = S.session.ui.demoOpen; const inEditor = App.route.name==='editor';
  const d = S.state.demo; const st = S.state.settings; const ed = S.session.ui.editor||{}; const curEx = inEditor && ed.curEx && Q.ex(ed.curEx);
  const tour = App.tour(); const doneN = tour.filter(t=>t[1]).length;
  let h = `<button class="demo-fab ${inEditor&&!open?'ico':''}" data-a="demoToggle" aria-expanded="${!!open}" title="Bảng điều khiển demo (chế độ thử nghiệm)">${inEditor&&!open?'🧪':`🧪 Chế độ thử nghiệm · ${doneN}/${tour.length}`}</button>`;
  if(open){
    const seg = (key, val, opts) => `<div class="seg">${opts.map(([v,l])=>`<button class="${val===v?'on':''}" data-a="demoSet" data-k="${key}" data-v="${v}">${l}</button>`).join('')}</div>`;
    h += `<div class="demo" role="dialog" aria-label="Bảng điều khiển demo"><h3>🧪 Bảng điều khiển demo <span class="spacer"></span><button class="iconbtn" data-a="demoToggle" aria-label="Đóng">✕</button></h3><div class="muted small">Chỉ có trong prototype. Mọi giả lập đều ghi nhật ký.</div>
      <div class="grp"><span class="lbl">Đóng vai</span><div class="row wrap">${WS.USERS.map(u=>`<button class="btn sm ${u.id===S.state.currentUserId?'primary':''}" data-a="demoUser" data-u="${u.id}">${esc(u.name)} · ${WS.ROLE_SHORT[u.role]}</button>`).join('')}</div></div>
      <div class="grp"><span class="lbl">Nhảy tới tình huống</span><div class="row wrap">
        ${[['S1','#/soan','Lan tạo phiếu mới','lan'],['S2','#/soan','Ép lỗi rồi sinh bài','lan'],['S3','#/phieu/ws1','Khóa mềm, xung đột','lan'],['S4','#/phieu/ws4','Phiếu đã khóa','lan'],['S5','#/kho','Kho bài, tái sử dụng','lan'],['S6','#/xem/ws8','Viewer giáo viên','ha']].map(([k,href,t,u])=>`<button class="btn sm" data-a="demoJump" data-href="${href}" data-u="${u}" data-s="${k}" title="${t}">${k} · ${t}</button>`).join('')}</div></div>
      <div class="grp"><span class="lbl">Ép AI sinh lỗi</span>${seg('aiFault', d.aiFault, [['off','Tắt'],['fixable','Lỗi sửa được'],['hard','Lỗi cứng']])}</div>
      <div class="grp"><span class="lbl">Độ trễ AI</span>${seg('latency', st.latency, [['fast','Nhanh'],['mid','Vừa'],['slow','Chậm']])}</div>
      <div class="grp"><span class="lbl">Giả lập xung đột ${curEx?`· bài "${esc(curEx.draft.title)}"`:''}</span><div class="row wrap">
        ${UI.btn('Minh đang mở bài này',{a:'demoOpenBy', size:'sm', disabled:!curEx, reason:'Hãy mở một bài trong trình soạn phiếu trước.'})}${UI.btn('Minh vừa lưu bản mới',{a:'demoSaveBy', size:'sm', disabled:!curEx, reason:'Hãy mở một bài trong trình soạn phiếu trước.'})}${UI.btn('Tua thời gian: khóa hết hạn',{a:'demoExpire', size:'sm'})}</div></div>
      <div class="grp"><span class="lbl">Giả lập lỗi mạng</span><label class="switch"><input type="checkbox" data-c="demoNet" ${d.netFail?'checked':''}> Lỗi tự lưu</label> &nbsp; <label class="switch"><input type="checkbox" data-c="demoMedia" ${d.mediaFail?'checked':''}> Lỗi tải media</label></div>
      <div class="grp"><span class="lbl">Hướng dẫn tham quan · ${doneN}/${tour.length}</span>${tour.map(([t,ok])=>`<div class="check ${ok?'done':''}"><span class="bx">${ok?'✓':''}</span><span>${esc(t)}</span></div>`).join('')}</div>
      <div class="grp"><span class="lbl">Dữ liệu</span><div class="row wrap">${UI.btn('Đặt lại về bản mẫu',{a:'loadSeed', size:'sm', kind:'danger'})}${UI.btn('Xuất trạng thái JSON',{a:'demoExport', size:'sm'})}${UI.btn('Nạp trạng thái JSON',{a:'demoImport', size:'sm'})}${UI.btn('Chạy selfTest()',{a:'selfTest', size:'sm', kind:'primary'})}</div></div>
    </div>`;
  }
  root.innerHTML = h;
};
Object.assign(WS.ACT, {
  demoToggle: () => { S.session.ui.demoOpen = !S.session.ui.demoOpen; App.renderDemo(); },
  demoUser: el => { A.switchUser(el.dataset.u); },
  demoJump: el => { A.switchUser(el.dataset.u); if(el.dataset.s==='S2'){ S.commit(st=>{ st.demo.aiFault='hard'; }); UI.toast('Đã bật "Ép AI sinh lỗi: lỗi cứng". Tạo một phiếu để xem bài bị chặn Done.'); } location.hash=el.dataset.href; },
  demoSet: el => { const k=el.dataset.k, v=el.dataset.v; S.commit(st=>{ if(k==='aiFault') st.demo.aiFault=v; else st.settings[k]=v; WS.audit('Bảng demo: '+k+' = '+v,'system',''); }); },
  demoOpenBy: () => { const ex=S.session.ui.editor.curEx; A.simulateOpenBy(ex,'minh'); UI.toast('Giả lập: Minh đang mở bài này. Bạn chuyển sang chỉ xem.'); },
  demoSaveBy: () => { const ex=S.session.ui.editor.curEx; A.simulateSaveBy(ex,'minh'); UI.toast('Giả lập: Minh vừa lưu bản mới. Lần lưu tiếp theo của bạn sẽ bị từ chối.'); },
  demoExpire: () => { A.expireLocks(); UI.toast('Đã tua thời gian: mọi khóa mềm hết hạn.'); },
  demoNet: el => { S.state.demo.netFail = el.checked; WS.audit('Bảng demo: lỗi tự lưu '+(el.checked?'bật':'tắt'),'system',''); if(!el.checked){ S.persist(); } S.emit(); },
  demoMedia: el => { S.commit(st=>{ st.demo.mediaFail = el.checked; WS.audit('Bảng demo: lỗi tải media '+(el.checked?'bật':'tắt'),'system',''); }); },
  demoExport: () => U.download('wsstudio-state-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json', JSON.stringify(S.state,null,1), 'application/json'),
  demoImport: () => { const i=document.createElement('input'); i.type='file'; i.accept='.json,application/json'; i.onchange=()=>{ const f=i.files[0]; if(!f) return; f.text().then(t=>{ try{ const st=JSON.parse(t); if(st.schemaVersion!==WS.SCHEMA) throw new Error('Sai phiên bản dữ liệu ('+st.schemaVersion+')'); S.state=st; S.persist(); S.emit(); UI.toast('Đã nạp trạng thái từ tệp.'); }catch(e){ UI.toast('Không nạp được: '+e.message, {err:true}); } }); }; i.click(); },
  selfTest: () => App.showSelfTest()
});

/* ---------- selfTest (T9) ---------- */
WS.selfTest = () => {
  const saved = S.state; const savedSession = S.session; const results = [];
  const t = (name, fn) => { try { const r = fn(); results.push({name, ok:r===true, detail:r===true?'':String(r)}); } catch(e){ results.push({name, ok:false, detail:e.message}); } };
  try {
    S.state = WS.makeSeed(); S.session = {undo:{},redo:{},loadedRev:{},ui:{}};
    const st = S.state; const lesson='ex1-l1-u1-1';
    const mk = (type, o={}) => { const g=AI.generate(lesson,type,{count:o.count||4, seed:'st'+type}); const ex={id:U.uid('ex'), type, ownerId:'lan', scope:{curriculumId:'ex1', curriculumVersion:'2.1', levelId:'ex1-l1', unitId:'ex1-l1-u1', lessonIds:[lesson]}, status:'active', draft:g.draft, versions:[], standardRef:{id:Q.standard(type).id, version:'1'}, origin:{kind:'ai'}}; st.exercises.push(ex); return ex; };
    t('Bộ sinh: 9 loại bài đều sinh được trên lesson đủ dữ liệu (Daily routines)', ()=>{ const bad=WS.TYPE_ORDER.filter(ty=>{ const g=AI.generate('ex1-l2-u1-1',ty,{count:Q.standard(ty).minQ, seed:1}); return g.draft.questions.length<Q.standard(ty).minQ; }); return !bad.length || 'Thiếu: '+bad.join(', '); });
    t('Bộ sinh: cùng hạt giống cho cùng kết quả', ()=>{ const a=AI.generate(lesson,'mcq',{count:4,seed:9}).draft.questions.map(q=>q.stem).join('|'), b=AI.generate(lesson,'mcq',{count:4,seed:9}).draft.questions.map(q=>q.stem).join('|'); return a===b || 'Khác nhau'; });
    t('Bài sinh mặc định qua kiểm tra (không lỗi)', ()=>{ const ex=mk('mcq'); const v=V.validate(ex); return !v.errors.length || v.errors.map(e=>e.code+' '+e.msg).join('; '); });
    t('V01: số câu dưới mức tối thiểu là Lỗi', ()=>{ const ex=mk('mcq'); ex.draft.questions=ex.draft.questions.slice(0,2); return V.validate(ex).errors.some(e=>e.code==='V01') || 'Không bắt được'; });
    t('V04: trắc nghiệm có 2 lựa chọn là Lỗi', ()=>{ const ex=mk('mcq'); ex.draft.questions[0].options=ex.draft.questions[0].options.slice(0,2); if(!ex.draft.questions[0].options.find(o=>o.id===ex.draft.questions[0].correctId)) ex.draft.questions[0].correctId=ex.draft.questions[0].options[0].id; return V.validate(ex).errors.some(e=>e.code==='V04') || 'Không bắt được'; });
    t('V08: từ ngoài phạm vi là Cảnh báo ở chế độ Chuẩn, Lỗi ở chế độ Chặt', ()=>{ const ex=mk('fill_blank'); ex.draft.questions[0].text='My mother likes astronomy ___.'; const a=V.validate(ex).issues.find(i=>i.code==='V08'); st.settings.strictness='strict'; const b=V.validate(ex).issues.find(i=>i.code==='V08'); st.settings.strictness='std'; return (a&&a.sev==='w'&&b&&b.sev==='e') || 'Mức không đúng'; });
    t('V09: từ cấm của lesson bị phát hiện', ()=>{ const ex=mk('fill_blank'); ex.draft.questions[0].text='She was my ___.'; return V.validate(ex).issues.some(i=>i.code==='V09') || 'Không bắt được'; });
    t('V13: nội dung không phù hợp lứa tuổi là Lỗi', ()=>{ const ex=mk('fill_blank'); ex.draft.questions[0].text='He has a gun and a ___.'; return V.validate(ex).errors.some(e=>e.code==='V13') || 'Không bắt được'; });
    t('V17: câu quá dài so với level là Lỗi', ()=>{ const ex=mk('fill_blank'); ex.draft.questions[0].text='This is my mother and this is my father and this is my sister and this is my baby ___.'; return V.validate(ex).errors.some(e=>e.code==='V17') || 'Không bắt được'; });
    st.currentUserId='lan';
    t('Done bị chặn khi bài còn lỗi', ()=>{ const ex=mk('mcq'); ex.draft.questions=ex.draft.questions.slice(0,1); return R.canDone(ex,Q.user('lan')).ok===false || 'Không chặn'; });
    t('Duyệt cấp 1 bị chặn khi còn bài chưa Done (WS-0001)', ()=>{ const r=R.can('submit',Q.ws('ws1'),Q.user('lan')); return (!r.ok && /chưa Done/.test(r.reason)) || r.reason; });
    t('Cấp 1 không Duyệt cấp 2 được', ()=>{ const ws=Q.ws('ws5'); return !R.can('approve',ws,Q.user('lan')).ok || 'Cho phép sai'; });
    t('BR-17: quản lý không tự duyệt phiếu mình soạn', ()=>{ const ws=U.clone(Q.ws('ws5')); ws.reviewerId='quang'; st.notes=st.notes.filter(n=>n.wsId!==ws.id); const r=R.can('approve',ws,Q.user('quang')); st.settings.selfApprove=true; const r2=R.can('approve',ws,Q.user('quang')); st.settings.selfApprove=false; return (!r.ok && r2.ok) || (r.reason+' / '+r2.reason); });
    t('Duyệt cấp 2 bị chặn khi còn note "Đề nghị sửa" mở', ()=>{ const ws=Q.ws('ws5'); st.notes.push({id:'x', wsId:ws.id, kind:'request', status:'open'}); const r=R.can('approve',ws,Q.user('ha')); return (!r.ok && /note/.test(r.reason)) || r.reason; });
    t('Phiếu Đang xét: cấp 1 chỉ xem', ()=>!R.canEditWs(Q.ws('ws5'),Q.user('lan')).ok || 'Cho sửa sai');
    t('Bài ghim trong phiếu Đang xét bị khóa với cấp 1, gợi ý Nhân bản', ()=>{ const ex=Q.ex(Q.ws('ws5').items[0].exerciseId); const r=R.canEditEx(ex,Q.user('lan')); return (!r.ok && r.alt==='clone') || r.reason; });
    t('Khóa mềm của người khác chuyển sang chỉ xem', ()=>{ const ex=Q.ex(Q.ws('ws1').items[0].exerciseId); st.locks.push({exerciseId:ex.id, userId:'minh', lastActive:Date.now()}); const r=R.canEditEx(ex,Q.user('lan'),Q.ws('ws1')); return (!r.ok && r.soft) || r.reason; });
    t('Tải bản chính thức chỉ mở khi đã Duyệt cấp 2', ()=>!R.can('download',Q.ws('ws1'),Q.user('ha')).ok && R.can('download',Q.ws('ws4'),Q.user('ha')).ok || 'Sai quyền tải');
    t('Bản học sinh không chứa khóa đáp án', ()=>{ const d=JSON.stringify(WS.EX.viewerData(Q.ws('ws8'),'student')); const bad=WS.EX.ANSWER_KEYS.filter(k=>d.includes('"'+k+'"')); return !bad.length || 'Lộ: '+bad.join(','); });
    t('Bản giáo viên có đủ đáp án', ()=>{ const d=JSON.stringify(WS.EX.viewerData(Q.ws('ws8'),'teacher')); return ['"correctId"','"accepted"','"answer"'].every(k=>d.includes(k)) || 'Thiếu đáp án'; });
    t('Chuỗi người dùng được escape trong tệp xuất', ()=>{ const ws=Q.ws('ws4'); ws.title='Test <script>alert(1)</'+'script>'; const html=WS.EX.build(ws,'teacher').html; return !html.includes('<script>alert(1)') || 'Chưa escape'; });
  } finally { S.state = saved; S.session = savedSession; }
  return results;
};
App.showSelfTest = () => {
  const r = WS.selfTest(); const ok = r.filter(x=>x.ok).length;
  UI.modal({title:`selfTest(): ${ok}/${r.length} đạt`, wide:true, body:`<div class="banner ${ok===r.length?'ok':'err'}" style="margin-bottom:10px">${ok===r.length?'Mọi ca kiểm tra bộ kiểm tra và máy trạng thái đều đạt.':`${r.length-ok} ca không đạt.`}</div><table class="tbl">${r.map(x=>`<tr><td style="width:28px">${x.ok?'✅':'❌'}</td><td>${esc(x.name)}${x.detail?`<div class="small" style="color:var(--err)">${esc(x.detail)}</div>`:''}</td></tr>`).join('')}</table>`, buttons:[{label:'Đóng', kind:'primary'}]});
  WS.audit('Chạy selfTest ('+ok+'/'+r.length+')','system',''); S.persistSoon();
};

/* ---------- boot ---------- */
App.loadSeed = () => { S.state = WS.makeSeed(); S.state.seededAt = Date.now(); S.session = {undo:{},redo:{},loadedRev:{},ui:{}}; S.persist(); S.emit(); };
App.boot = () => {
  WS.services.config.onFallback = (err) => UI.toast(`Không gọi được Claude (${err.message}). Lần này dùng AI giả lập.`, {err:true, ms:6000});
  const st = S.load();
  if(st){ S.state = st; } else { S.state = WS.makeSeed(); S.state.seededAt = Date.now(); S.persist(); }
  App.shell();
  S.on(App.render);
  window.addEventListener('hashchange', () => { document.getElementById('main').scrollTop=0; App.render(); });
  App.render();
  if(S.memoryFallback) UI.toast('Trình duyệt chặn lưu cục bộ: dữ liệu chỉ giữ trong phiên này.', {err:true, ms:6000});
};

