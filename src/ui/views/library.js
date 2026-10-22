/* ============ VIEW: Kho bài, chọn bài từ kho ============ */
import { WS } from '../../ws.js';
const U = WS.U, Q = WS.Q, R = WS.R, S = WS.S, UI = WS.UI, A = WS.A, V = WS.V, AI = WS.AI, EX = WS.EX;
const esc = U.esc; const views = WS.views;

/* ---------- Kho bài ---------- */
const libState = () => {
  if(!S.session.ui.lib){ const ed=S.session.ui.editor; const ws=ed&&ed.wsId&&Q.ws(ed.wsId);
    S.session.ui.lib = {tab:'active', view:'table', c:ws?ws.scope.curriculumId:'', l:ws?ws.scope.levelId:'', u:ws?ws.scope.unitId:'', ls:'', type:'', st:'', owner:'', range:'all', tag:'', q:'', page:0, showF:true}; }
  return S.session.ui.lib;
};
const exSnippet = ex => { const q=ex.draft.questions[0]; return q ? V.textsOf({questions:[q]}, ex.type).map(t=>t.text)[0]||'' : ''; };
views.library = {
  render(main, p){
    const f = libState(); if(p.mine){ f.owner='me'; } if(p.st){ f.st=p.st; }
    const me = Q.me(); let list = S.state.exercises.slice();
    list = list.filter(e=>f.tab==='active' ? e.status==='active' : e.status!=='active');
    if(f.c) list=list.filter(e=>e.scope.curriculumId===f.c); if(f.l) list=list.filter(e=>e.scope.levelId===f.l); if(f.u) list=list.filter(e=>e.scope.unitId===f.u); if(f.ls) list=list.filter(e=>e.scope.lessonIds.includes(f.ls));
    if(f.type) list=list.filter(e=>e.type===f.type);
    if(f.st) list=list.filter(e=>{ const k=R.exState(e).key; return f.st==='pending' ? ['draft','dirty'].includes(k) : k===f.st; });
    if(f.owner==='me') list=list.filter(e=>e.ownerId===me.id); else if(f.owner) list=list.filter(e=>e.ownerId===f.owner);
    if(f.range!=='all'){ const lim=Date.now()-(+f.range)*86400000; list=list.filter(e=>e.updatedAt>=lim); }
    if(f.tag) list=list.filter(e=>(e.tags||[]).some(t=>t.toLowerCase().includes(f.tag.toLowerCase())));
    if(f.q) list=list.filter(e=>(e.draft.title+' '+V.textsOf(e.draft,e.type).map(t=>t.text).join(' ')).toLowerCase().includes(f.q.toLowerCase()));
    list.sort((a,b)=>b.updatedAt-a.updatedAt);
    const per=15, pages=Math.max(1,Math.ceil(list.length/per)); f.page=Math.min(f.page,pages-1); const shown=list.slice(f.page*per,(f.page+1)*per);
    const cur=Q.curriculum(f.c); const lvl=cur&&cur.levels.find(l=>l.id===f.l); const unit=lvl&&lvl.units.find(u=>u.id===f.u);
    const sel = (k, opts, ph, dis) => `<select class="inp" data-c="libF" data-k="${k}" aria-label="${ph}" ${dis?'disabled':''}><option value="">${ph}</option>${opts.map(([v,l])=>`<option value="${v}" ${f[k]===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
    const filters = `<div class="card" style="padding:12px;margin-bottom:12px"><div class="row"><b class="small">Bộ lọc</b><span class="small muted">${list.length} bài</span><span class="spacer"></span><button class="btn xs ghost" data-a="libReset">Xóa lọc</button><button class="btn xs ghost" data-a="libFT">${f.showF?'Thu gọn':'Mở rộng'}</button></div>
      ${f.showF?`<div class="grid" style="grid-template-columns:repeat(4,1fr);gap:8px;margin-top:8px">${sel('c', S.state.curricula.map(c=>[c.id,c.name]), 'Mọi giáo trình')}${sel('l', cur?cur.levels.map(l=>[l.id,l.name]):[], 'Mọi level', !cur)}${sel('u', lvl?lvl.units.map(u=>[u.id,u.code+' '+u.name]):[], 'Mọi unit', !lvl)}${sel('ls', unit?unit.lessons.map(l=>[l.id,l.code+' '+l.name]):[], 'Mọi lesson', !unit)}
        ${sel('type', WS.TYPE_ORDER.map(t=>[t,WS.TYPES[t].label]), 'Mọi loại bài')}${sel('st', f.tab==='active'?[['draft','Nháp'],['done','Done'],['dirty','Đã sửa sau Done'],['pending','Chưa Done (Nháp + đã sửa)']]:[['rejected','Loại'],['archived','Lưu trữ']], 'Mọi trạng thái')}${sel('owner', [['me','Của tôi']].concat(WS.USERS.map(u=>[u.id,u.name])), 'Mọi người tạo')}${sel('range', [['7','7 ngày'],['30','30 ngày']], 'Mọi thời điểm')}
        <input class="inp" placeholder="Tag" value="${esc(f.tag)}" data-c="libF" data-k="tag" aria-label="Tag"><input class="inp" style="grid-column:span 3" placeholder="Từ khóa trong tiêu đề hoặc câu hỏi" value="${esc(f.q)}" data-c="libF" data-k="q" aria-label="Từ khóa"></div>`:''}</div>`;
    const rowActs = e => UI.btn('⋯',{a:'libMenu', size:'sm', kind:'ghost', data:{ex:e.id}, aria:'Thao tác bài'});
    const table = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Bài</th><th>Loại</th><th>Lesson</th><th>Trạng thái</th><th>Người tạo</th><th>Tương thích</th><th>Phiếu dùng</th><th></th></tr></thead><tbody>
      ${shown.map(e=>{ const n=R.wsUsing(e.id).length; return `<tr class="click" data-a="libView" data-ex="${e.id}" tabindex="0"><td><b>${esc(e.draft.title)}</b><div class="small muted" style="font-family:var(--serif);max-width:340px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(exSnippet(e))}</div>${e.origin.kind!=='ai'?`<span class="small muted">${({clone:'bản sao',derived:'bản phát sinh',manual:'soạn tay'})[e.origin.kind]||''}</span>`:''}</td>
        <td>${UI.typeChip(e.type)}</td><td class="small">${esc(Q.lessonShort(e.scope.lessonIds[0]))}</td><td>${UI.exChip(e)}</td><td>${esc(Q.user(e.ownerId).name)}</td>
        <td>${R.compatible(e)?'<span class="small" style="color:var(--ok-2)">✓ Còn tương thích</span>':`<span class="small" style="color:var(--warn)" data-tip="Soạn trên giáo trình v${esc(e.scope.curriculumVersion)}">⚠ Giáo trình đã đổi phiên bản</span>`}</td><td>${n||'—'}</td><td>${rowActs(e)}</td></tr>`; }).join('')}</tbody></table></div>`;
    const cards = `<div class="grid g3">${shown.map(e=>`<div class="card" style="padding:14px;cursor:pointer" data-a="libView" data-ex="${e.id}" tabindex="0"><div class="row">${UI.typeChip(e.type)}<span class="spacer"></span>${rowActs(e)}</div><b style="display:block;margin:6px 0 2px">${esc(e.draft.title)}</b><div class="small muted" style="font-family:var(--serif)">${esc(exSnippet(e))}</div><div class="row small" style="margin-top:8px">${UI.exChip(e)}<span class="muted">${esc(Q.user(e.ownerId).name)}</span></div></div>`).join('')}</div>`;
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>Kho bài</h1><div class="desc">Kho chung của mọi giáo viên. Dùng lại chủ yếu bằng "Tạo bài mới từ mẫu này".</div></div>
      <div class="actions"><div class="seg"><button class="${f.view==='table'?'on':''}" data-a="libView2" data-v="table">Bảng</button><button class="${f.view==='cards'?'on':''}" data-a="libView2" data-v="cards">Thẻ</button></div></div></div>
      <div class="seg" style="margin-bottom:12px"><button class="${f.tab==='active'?'on':''}" data-a="libTab" data-v="active">Đang dùng</button><button class="${f.tab!=='active'?'on':''}" data-a="libTab" data-v="other">Loại & Lưu trữ</button></div>
      ${filters}${shown.length?(f.view==='table'?table:cards):UI.empty('Không có bài khớp bộ lọc','Thử xóa bớt bộ lọc.', UI.btn('Xóa lọc',{a:'libReset'}))}
      ${pages>1?`<div class="row" style="justify-content:center;margin-top:12px">${UI.btn('‹ Trước',{a:'libPage', size:'sm', data:{d:-1}, disabled:f.page===0, reason:'Đang ở trang đầu'})}<span class="small muted">Trang ${f.page+1}/${pages}</span>${UI.btn('Sau ›',{a:'libPage', size:'sm', data:{d:1}, disabled:f.page>=pages-1, reason:'Đang ở trang cuối'})}</div>`:''}</div>`;
  }
};
const similar = (ex) => S.state.exercises.filter(o=>o.id!==ex.id && o.type===ex.type && o.status==='active' && V.norm(exSnippet(o))===V.norm(exSnippet(ex)));
function libMenuItems(ex){
  const me=Q.me(); const myDrafts=S.state.worksheets.filter(w=>w.status==='draft' && (w.authorId===me.id||me.role==='l2'));
  const done = !!R.lastDone(ex);
  return [
    {label:'Xem', icon:'👁', onClick:()=>viewEx(ex)},
    {label:'Mở sửa', icon:'✎', onClick:()=>location.hash='#/bai/'+ex.id},
    {label:'Tạo bài mới từ mẫu này', icon:'＋', disabled:ex.status!=='active', reason:'Hãy khôi phục bài trước.', onClick:()=>fromTemplate(ex)},
    {label:'Nhân bản…', icon:'⧉', onClick:()=>cloneAsk(ex)},
    {label:'Đưa vào phiếu…', icon:'⇥', disabled:!done || ex.status!=='active' || !myDrafts.length, reason:!done?'Chỉ đưa được bài đã có bản Done.':ex.status!=='active'?'Bài đang Loại/Lưu trữ.':'Bạn chưa có phiếu Nháp nào.', onClick:()=>pushToWs(ex)},
    {label:'Lịch sử', icon:'🕘', onClick:()=>viewEx(ex, true)},
    {sep:true},
    ...(ex.status==='active'?[{label:'Không hài lòng / Loại', icon:'✕', onClick:()=>A.setExStatus(ex.id,'rejected')},{label:'Lưu trữ', icon:'🗄', onClick:()=>A.setExStatus(ex.id,'archived')}]:[{label:'Khôi phục', icon:'↺', onClick:()=>A.setExStatus(ex.id,'active')}])
  ];
}
function viewEx(ex, hist){
  const vs = ex.versions.slice().reverse();
  UI.modal({title:ex.draft.title, sub:`${esc(WS.TYPES[ex.type].label)} · ${esc(Q.lessonLabel(ex.scope.lessonIds[0]))} · ${esc(Q.user(ex.ownerId).name)}`, xwide:true,
    body:`<div class="grid" style="grid-template-columns:1.4fr 1fr;gap:16px;align-items:start"><div><div class="row" style="margin-bottom:8px">${UI.exChip(ex)}${R.compatible(ex)?'':'<span class="chip orange">Giáo trình đã đổi phiên bản</span>'}</div><pre style="white-space:pre-wrap;font-family:var(--serif);font-size:14.5px;background:var(--surface-2);padding:12px;border-radius:8px">${esc(UI.exText(ex.type, ex.draft))}</pre></div>
      <div><h3 style="font-size:14px">Lịch sử phiên bản</h3>${vs.map(v=>`<div class="hist-item"><b>Done v${v.no}</b> <span class="small muted">· ${esc(Q.user(v.doneBy).name)} · ${U.fmtDate(v.doneAt)}</span><div class="row" style="margin-top:4px"><button class="btn xs" data-vv="${v.no}">Xem</button><button class="btn xs" data-vc="${v.no}">So sánh với bản nháp</button></div></div>`).join('')||'<div class="small muted">Chưa có mốc Done.</div>'}
      <h3 style="font-size:14px;margin-top:12px">Đang dùng trong</h3>${R.wsUsing(ex.id).map(w=>{ const it=w.items.find(i=>i.exerciseId===ex.id); return `<div class="small"><a href="#/phieu/${w.id}">${esc(w.code)} ${esc(w.title)}</a> · ghim v${it.pinnedVersionNo||'—'} · ${esc(R.wsStatus(w).label)}</div>`; }).join('')||'<div class="small muted">Chưa phiếu nào. Bài vẫn nằm trong kho dù đã bị thay khỏi phiếu.</div>'}
      ${ex.origin.fromId?`<h3 style="font-size:14px;margin-top:12px">Nguồn gốc</h3><div class="small">${({clone:'Bản sao độc lập',derived:'Bản phát sinh'})[ex.origin.kind]||ex.origin.kind} từ "${esc((Q.ex(ex.origin.fromId)||{draft:{title:ex.origin.fromId}}).draft.title)}"${ex.origin.fromVersion?` v${ex.origin.fromVersion}`:''}</div>`:''}</div></div>`,
    buttons:[{label:'Đóng', kind:'ghost'}, {label:'Tạo bài mới từ mẫu này', kind:'', onClick:(m,c)=>{ c(); fromTemplate(ex); return false; }}, {label:'Mở sửa', kind:'primary', onClick:(m,c)=>{ c(); location.hash='#/bai/'+ex.id; return false; }}],
    onMount:(m)=>m.addEventListener('click',e=>{ const a=e.target.closest('[data-vv]'), b=e.target.closest('[data-vc]');
      if(a){ const v=R.version(ex,+a.dataset.vv); UI.modal({title:`v${v.no}`, wide:true, body:`<pre style="white-space:pre-wrap;font-family:var(--serif)">${esc(UI.exText(ex.type,v.snapshot))}</pre>`, buttons:[{label:'Đóng',kind:'primary'}]}); }
      if(b){ const v=R.version(ex,+b.dataset.vc); UI.modal({title:`So sánh v${v.no} với bản nháp`, xwide:true, body:UI.diffHTML(UI.exText(ex.type,v.snapshot), UI.exText(ex.type,ex.draft)), buttons:[{label:'Đóng',kind:'primary'}]}); } })});
}
function fromTemplate(ex){
  let salt=Date.now(), vars=[], pick=0, md=null, tok=0;
  const paint = () => { if(md) md.el.querySelector('.modal-b').innerHTML=body(); };
  const load = () => { const t=++tok; vars=[]; pick=0; paint(); WS.services.ai.exerciseVariants(ex,3,salt).then(r=>{ if(t!==tok) return; vars=r; paint(); }); };
  const body=()=>`<div class="banner info" style="margin-bottom:10px">Giữ loại bài, cấu trúc (${ex.draft.questions.length} câu, bố cục ${ex.draft.layout}) và phạm vi lesson; nội dung mới. Chọn một phương án hoặc tạo bài trống để sửa tay.</div>${!vars.length?`<div class="muted" aria-live="polite" style="padding:24px 0">Đang tạo phương án…</div>`:`<div class="opt-cards">${vars.map((v,k)=>`<button class="opt-card ${k===pick?'on':''}" data-p="${k}"><b>${esc(v.title)}</b><div class="ser small" style="margin-top:6px">${v.questions.slice(0,3).map(q=>esc(V.textsOf({questions:[q]},ex.type).map(t=>t.text)[0]||'')).join('<br>')}</div></button>`).join('')}</div>`}<button class="btn sm ghost" style="margin-top:10px" data-more>↻ Tạo bộ khác</button>`;
  md = UI.modal({title:'Tạo bài mới từ mẫu', sub:esc(ex.draft.title), xwide:true, body:body(), buttons:[{label:'Hủy', kind:'ghost'}, {label:'Sửa tay từ bản sao', kind:'', onClick:(m,c)=>{ c(); const nx=A.cloneEx(ex.id,{derived:true}); S.commit(()=>{ nx.origin.kind='derived'; }); location.hash='#/bai/'+nx.id; return false; }}, {label:'Tạo bài từ phương án này', kind:'primary', onClick:(m,c)=>{ const v=vars[pick]; if(!v) return false; let nx; S.commit(()=>{ nx=A.newExerciseFrom(ex.scope.lessonIds[0], ex.type, {draft:v, log:['Tạo từ mẫu '+ex.id]}, {origin:'derived', fromId:ex.id, themeId:ex.themeId}); WS.audit('Tạo bản phát sinh','exercise',nx.id,{note:'từ mẫu '+ex.id}); }); c(); UI.toast('Đã tạo bài mới từ mẫu. Kiểm tra rồi bấm Done.'); location.hash='#/bai/'+nx.id; return false; }}],
    onMount:m=>m.addEventListener('click',e=>{ const p=e.target.closest('[data-p]'); if(p){ pick=+p.dataset.p; m.querySelector('.modal-b').innerHTML=body(); } if(e.target.closest('[data-more]')){ salt+=13; load(); } })});
  load();
}
function cloneAsk(ex){
  const sim = similar(ex).length;
  UI.modal({title:'Nhân bản bài', body:`${sim?`<div class="banner warn" style="margin-bottom:10px">Đã có ${sim} bài rất giống trong kho (cùng loại, cùng câu đầu). Cân nhắc dùng lại bài có sẵn.</div>`:''}<p>Bạn muốn tạo:</p><ul style="margin:0 0 0 18px"><li><b>Bản sao độc lập</b>: bài mới của bạn, không theo dõi bản gốc.</li><li><b>Bản phát sinh</b>: ghi nhận nguồn gốc để biết bài được phát triển từ đâu (FR-11.7).</li></ul>`,
    buttons:[{label:'Hủy', kind:'ghost'}, {label:'Bản phát sinh', kind:'', onClick:(m,c)=>{ c(); done(A.cloneEx(ex.id,{derived:true})); return false; }}, {label:'Bản sao độc lập', kind:'primary', onClick:(m,c)=>{ c(); done(A.cloneEx(ex.id,{})); return false; }}]});
  const done = nx => UI.toast('Đã nhân bản. Bản sao cần Done trước khi đưa vào phiếu.', {action:{label:'Mở bản sao', fn:()=>location.hash='#/bai/'+nx.id}});
}
function pushToWs(ex){
  const me=Q.me(); const list=S.state.worksheets.filter(w=>w.status==='draft' && (w.authorId===me.id||me.role==='l2'));
  UI.modal({title:'Đưa vào phiếu', sub:`Ghim "${esc(ex.draft.title)}" bản Done v${R.lastDone(ex).no}.`, wide:true, body:`<div class="tbl-wrap"><table class="tbl"><tbody>${list.map(w=>`<tr><td><b>${esc(w.title)}</b><div class="small muted">${esc(Q.lessonShort(w.scope.lessonIds[0]))} · ${w.items.length} bài</div></td><td>${w.scope.unitId!==ex.scope.unitId?'<span class="small" style="color:var(--warn)">Khác unit</span>':''}</td><td><button class="btn sm" data-w="${w.id}">Đưa vào</button></td></tr>`).join('')}</tbody></table></div>`, buttons:[{label:'Đóng', kind:'ghost'}],
    onMount:(m,close)=>m.addEventListener('click',e=>{ const b=e.target.closest('[data-w]'); if(!b) return; A.addItem(b.dataset.w, ex.id); close(); UI.toast('Đã đưa bài vào phiếu.', {action:{label:'Mở phiếu', fn:()=>location.hash='#/phieu/'+b.dataset.w}}); })});
}
WS.openLibPicker = (ws) => {
  let all=false;
  const rows = () => S.state.exercises.filter(e=>e.status==='active' && R.lastDone(e) && (all || e.scope.unitId===ws.scope.unitId) && !ws.items.some(i=>i.exerciseId===e.id));
  const body = () => `<label class="switch" style="margin-bottom:10px"><input type="checkbox" id="lp-all" ${all?'checked':''}> Hiện cả bài khác unit</label><div class="small muted" style="margin-bottom:8px">Chỉ liệt kê bài đã có bản Done (BR: bài chưa Done không được ghim).</div>${rows().length?`<div class="tbl-wrap"><table class="tbl"><tbody>${rows().map(e=>`<tr><td>${UI.typeChip(e.type)}</td><td><b>${esc(e.draft.title)}</b><div class="small muted">${esc(Q.lessonShort(e.scope.lessonIds[0]))} · ${esc(Q.user(e.ownerId).name)} · Done v${R.lastDone(e).no}</div></td><td><button class="btn sm" data-pick="${e.id}">Thêm</button></td></tr>`).join('')}</tbody></table></div>`:UI.empty('Không có bài phù hợp','Bật "Hiện cả bài khác unit" hoặc tạo bài mới.')}`;
  UI.modal({title:'Thêm từ kho bài', wide:true, body:body(), buttons:[{label:'Đóng', kind:'ghost'}],
    onMount:(m,close)=>{ m.addEventListener('change',e=>{ if(e.target.id==='lp-all'){ all=e.target.checked; m.querySelector('.modal-b').innerHTML=body(); } }); m.addEventListener('click',e=>{ const b=e.target.closest('[data-pick]'); if(!b) return; A.addItem(ws.id, b.dataset.pick); close(); UI.toast('Đã ghim bài từ kho vào phiếu.'); }); }});
};
Object.assign(WS.ACT, {
  libF: el => { const f=libState(); const k=el.dataset.k; f[k]=el.value; const order=['c','l','u','ls']; if(order.includes(k)) order.slice(order.indexOf(k)+1).forEach(x=>f[x]=''); f.page=0; WS.App.render(); },
  libReset: () => { S.session.ui.lib=null; const f=libState(); f.c=f.l=f.u=''; history.replaceState(null,'','#/kho'); WS.App.render(); },
  libFT: () => { const f=libState(); f.showF=!f.showF; WS.App.render(); },
  libTab: el => { const f=libState(); f.tab=el.dataset.v; f.st=''; f.page=0; WS.App.render(); },
  libView2: el => { libState().view=el.dataset.v; WS.App.render(); },
  libPage: el => { libState().page+= +el.dataset.d; WS.App.render(); },
  libView: (el, ev) => { if(ev.target.closest('button')) return; viewEx(Q.ex(el.dataset.ex)); },
  libMenu: (el, ev) => { ev.stopPropagation(); UI.menu(el, libMenuItems(Q.ex(el.dataset.ex)), {alignRight:true}); }
});
