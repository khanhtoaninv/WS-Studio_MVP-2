/* ============ VIEW: Trình soạn phiếu (D-88) + exercise editor + review mode ============ */
import { WS } from '../../ws.js';
const U = WS.U, Q = WS.Q, R = WS.R, S = WS.S, UI = WS.UI, A = WS.A, V = WS.V, AI = WS.AI, EX = WS.EX;
const esc = U.esc; const views = WS.views;
const LET = 'ABCDEFGH';
const E = () => S.session.ui.editor;

/* ---------- context helpers ---------- */
function ctx(){
  const e = E(); const ws = e.wsId ? Q.ws(e.wsId) : null;
  const item = ws && e.sel ? ws.items.find(i=>i.id===e.sel) : null;
  const ex = item ? Q.ex(item.exerciseId) : (e.exId ? Q.ex(e.exId) : null);
  return {e, ws, item, ex, me:Q.me()};
}
const mismatch = (ws, ex) => ws && ex && (ex.themeId!==ws.themeId || !ws.scope.lessonIds.includes(ex.scope.lessonIds[0]));

/* ---------- inline marking (A3) ---------- */
function markText(text, iss, qid){
  let h = esc(text);
  const words = {}; (iss||[]).forEach(i=>{ (i.words||[]).forEach(w=>{ words[w.toLowerCase()] = i.code; }); });
  Object.entries(words).sort((a,b)=>b[0].length-a[0].length).forEach(([w,code])=>{
    const re = new RegExp('(^|[^A-Za-z\'>])('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![A-Za-z\'])','gi');
    h = h.replace(re, (m,pre,word)=>`${pre}<span class="${code==='V09'?'ban':'oos'}" data-a="qfix" data-q="${qid||''}" data-w="${esc(word)}" data-code="${code}" data-tip="${code==='V09'?'Thuộc danh sách cấm/chưa học của lesson. Bấm để sửa nhanh.':'Từ ngoài phạm vi lesson. Bấm để thay bằng từ trong bài.'}" tabindex="0">${word}</span>`);
  });
  return h.replace(/_{2,}/g,'<span style="border-bottom:1.5px solid var(--ink);display:inline-block;min-width:60px">&nbsp;</span>');
}
function qMarks(iss){ const long = (iss||[]).filter(i=>i.long); const other = (iss||[]).filter(i=>!i.long && !['V08','V09'].includes(i.code));
  return (long.length||other.length) ? `<div class="qmark">${long.map(i=>`<span class="mini ${i.sev==='e'?'err':'warn'}" data-tip="${esc(i.msg)}">${i.code} câu dài</span>`).join('')}${other.map(i=>`<span class="mini ${i.sev==='e'?'err':'warn'}" data-tip="${esc(i.msg)}">${i.code}</span>${i.code==='V03'?`<button class="btn xs" data-a="qfixAns" data-q="${i.qid}">Sửa nhanh: bổ sung đáp án</button>`:''}`).join('')}</div>` : ''; }

/* ---------- question views ---------- */
function qRead(ex, q, iss){
  const d = ex.draft; const mk = t => markText(t, iss, q.id);
  switch(ex.type){
    case 'mcq': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">${mk(q.stem)}</div><div class="qopts">${q.options.map((o,k)=>`<span class="${o.id===q.correctId?'c':''}">${LET[k]}. ${mk(o.text)}${o.id===q.correctId?' ✓':''}</span>`).join('')}</div>`;
    case 'fill_blank': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">${mk(q.text)}</div><div class="qans">Đáp án: ${esc((q.accepted||[]).join(' / ')||'—')}</div>`;
    case 'word_form': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">${mk(q.text)} <b style="font-family:var(--sans);font-size:12px;color:var(--ink-2)">${esc(q.baseWord)}</b></div><div class="qans">Đáp án: ${esc((q.accepted||[]).join(' / ')||'—')}</div>`;
    case 'matching': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">${mk(q.left)} <span class="muted">⟶</span> <span style="font-size:18px">${esc(q.right)}</span></div>`;
    case 'ordering': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">${(q.shuffle||[]).map(i=>`<span class="tag">${esc(q.items[i])}</span>`).join(' ')}</div><div class="qans">Đúng: ${mk(q.items.join(' '))}${esc(q.punct||'.')}</div>`;
    case 'tfng': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">${mk(q.statement)}</div><div class="qans">Đáp án: ${esc(q.answer||'—')}</div>`;
    case 'cloze_mcq': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">Chỗ trống <b>${q.n}</b>: ${q.options.map((o,k)=>`<span class="${k===q.correctIdx?'c':''}" style="margin-right:12px">${LET[k]}. ${mk(o)}${k===q.correctIdx?' ✓':''}</span>`).join('')}</div>`;
    case 'rewrite': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">${mk(q.original)}<br><b style="font-family:var(--sans);font-size:13px">${esc(q.lead)} …</b></div><div class="qans">Đáp án: ${esc((q.accepted||[]).join(' / ')||'—')}</div>`;
    case 'short_answer': return `<div class="qtxt" data-a="qEdit" data-q="${q.id}">${mk(q.question)}</div><div class="qans">Đáp án: ${esc((q.accepted||[]).join(' / ')||'—')} · tối đa ${q.maxWords} từ</div>`;
  }
  return '';
}
const inp = (q, f, v, ph, o={}) => `<input class="inp" data-c="qField" data-q="${q.id}" data-f="${f}" data-fk="${q.id}:${f}" value="${esc(v)}" placeholder="${esc(ph)}" aria-label="${esc(ph)}"${o.style?` style="${o.style}"`:''}${o.dis?' disabled':''}>`;
function qEditHTML(ex, q){
  switch(ex.type){
    case 'mcq': return `<div class="qedit">${inp(q,'stem',q.stem,'Đề (dùng ___ cho chỗ trống)')}${q.options.map((o,k)=>`<div class="opt"><input type="radio" name="c-${q.id}" ${o.id===q.correctId?'checked':''} data-c="qCorrect" data-q="${q.id}" data-v="${o.id}" aria-label="Đáp án đúng ${LET[k]}"><b>${LET[k]}</b>${inp(q,'opt:'+o.id,o.text,'Lựa chọn '+LET[k])}<button class="btn xs ghost" data-a="qOptDel" data-q="${q.id}" data-v="${o.id}" aria-label="Xóa lựa chọn">✕</button></div>`).join('')}${q.options.length<4?`<button class="btn xs" data-a="qOptAdd" data-q="${q.id}" style="align-self:flex-start">＋ Lựa chọn</button>`:''}</div>`;
    case 'fill_blank': return `<div class="qedit">${inp(q,'text',q.text,'Câu có ___')}${inp(q,'accepted',(q.accepted||[]).join(', '),'Đáp án chấp nhận, cách nhau dấu phẩy')}</div>`;
    case 'word_form': return `<div class="qedit">${inp(q,'text',q.text,'Câu có ___')}<div class="row">${inp(q,'baseWord',q.baseWord,'Từ gốc (in hoa)',{style:'width:160px'})}${inp(q,'accepted',(q.accepted||[]).join(', '),'Đáp án chấp nhận')}</div></div>`;
    case 'matching': return `<div class="qedit"><div class="row">${inp(q,'left',q.left,'Vế trái')}<span>⟶</span>${inp(q,'right',q.right,'Vế phải (từ, nghĩa hoặc emoji)')}</div></div>`;
    case 'ordering': return `<div class="qedit">${inp(q,'items',q.items.join(' '),'Câu đúng thứ tự (cách nhau dấu cách)')}<div class="row small"><span class="muted">Hiển thị:</span> ${(q.shuffle||[]).map(i=>`<span class="tag">${esc(q.items[i])}</span>`).join(' ')}<button class="btn xs" data-a="qShuffle" data-q="${q.id}">Xáo lại</button></div></div>`;
    case 'tfng': return `<div class="qedit">${inp(q,'statement',q.statement,'Nhận định')}<div class="seg">${['T','F','NG'].map(a=>`<button class="${q.answer===a?'on':''}" data-a="qTF" data-q="${q.id}" data-v="${a}">${a}</button>`).join('')}</div></div>`;
    case 'cloze_mcq': return `<div class="qedit"><span class="small muted">Chỗ trống {${q.n}} trong đoạn văn</span>${q.options.map((o,k)=>`<div class="opt"><input type="radio" name="c-${q.id}" ${k===q.correctIdx?'checked':''} data-c="qCorrectIdx" data-q="${q.id}" data-v="${k}" aria-label="Đáp án ${LET[k]}"><b>${LET[k]}</b>${inp(q,'copt:'+k,o,'Lựa chọn '+LET[k])}</div>`).join('')}</div>`;
    case 'rewrite': return `<div class="qedit">${inp(q,'original',q.original,'Câu gốc')}${inp(q,'lead',q.lead,'Phần mở đầu')}${inp(q,'accepted',(q.accepted||[]).join(' | '),'Đáp án chấp nhận, cách nhau dấu |')}</div>`;
    case 'short_answer': return `<div class="qedit">${inp(q,'question',q.question,'Câu hỏi')}<div class="row">${inp(q,'accepted',(q.accepted||[]).join(' | '),'Đáp án chấp nhận, cách nhau dấu |')}${inp(q,'maxWords',q.maxWords,'Số từ tối đa',{style:'width:110px'})}</div></div>`;
  }
  return '';
}

/* ---------- editor render ---------- */
views.editor = {
  render(main, p){
    const ws = Q.ws(p.id);
    if(!ws){ main.innerHTML = `<div class="page">${UI.empty('Không tìm thấy phiếu','Phiếu có thể đã bị xóa khi Reset dữ liệu.', UI.btn('Về danh sách phiếu',{a:'go', data:{href:'#/phieu'}}))}</div>`; return; }
    if(!E() || E().wsId!==ws.id || E().user!==Q.me().id){ S.session.ui.editor = {wsId:ws.id, user:Q.me().id, sel:null, editQ:null, selQ:[], split:(E()&&E().split)||52, prevKind:'teacher', prevAns:false, focus:false, drawer:{open:false, tab:'check'}};
      if(ws.status==='reviewing' && ws.reviewerId===Q.me().id){ E().drawer={open:true, tab:'notes'}; } }
    if(S.session.ui.drawer){ E().drawer = S.session.ui.drawer; S.session.ui.drawer = null; }
    renderShell(main, ws);
  },
  leave(){ if(E()) E().curEx=null; }
};
views.exercise = {
  render(main, p){
    const ex = Q.ex(p.id);
    if(!ex){ main.innerHTML = `<div class="page">${UI.empty('Không tìm thấy bài','', UI.btn('Về Kho bài',{a:'go', data:{href:'#/kho'}}))}</div>`; return; }
    if(!E() || E().exId!==ex.id || E().wsId || E().user!==Q.me().id){ S.session.ui.editor = {wsId:null, exId:ex.id, user:Q.me().id, sel:null, editQ:null, selQ:[], split:55, prevKind:'teacher', prevAns:true, drawer:{open:true, tab:'check'}}; }
    renderShell(main, null);
  },
  leave(){ if(E()) E().curEx=null; }
};

function renderShell(main, ws){
  const e = E(); const key = ws ? 'ws:'+ws.id : 'ex:'+e.exId;
  let root = main.querySelector('.ed');
  if(!root || root.dataset.key!==key){
    main.innerHTML = `<div class="ed" data-key="${key}"><div class="ed-top" id="ed-top"></div><div class="ed-body" id="ed-body"><div class="ed-left" id="ed-left"></div><div class="ed-gutter" id="ed-gut" role="separator" aria-orientation="vertical" aria-label="Kéo để đổi tỷ lệ soạn và xem trước" tabindex="0"></div><div class="ed-right" id="ed-right"><div class="prev-bar" id="ed-pbar"></div><div class="prev-wrap"><div id="ed-prev"></div></div></div><aside class="ed-drawer" id="ed-drawer" aria-label="Thông tin về bài"></aside></div></div>`;
    root = main.querySelector('.ed'); bindGutter(); main.__prevKey=null;
  }
  const c = ctx(); e.curEx = c.ex ? c.ex.id : null;
  if(c.ex) A.sessionOpen(c.ex.id);
  document.getElementById('ed-body').style.setProperty('--ed-left', e.focus ? '100%' : (e.drawer.open ? Math.min(e.split, 42) : e.split)+'%');
  document.getElementById('ed-body').style.gridTemplateColumns = e.focus ? '1fr 0 0 0' : '';
  document.getElementById('ed-top').innerHTML = topHTML(c);
  const left = document.getElementById('ed-left'); const st = left.scrollTop;
  left.innerHTML = c.ex ? exPaneHTML(c) : tocHTML(c);
  if(left.__lastSel === (c.ex&&c.ex.id)) left.scrollTop = st; left.__lastSel = c.ex&&c.ex.id;
  const dr = document.getElementById('ed-drawer'); dr.className = 'ed-drawer'+(e.drawer.open && !e.focus?' open':''); dr.innerHTML = e.drawer.open ? drawerHTML(c) : '';
  document.getElementById('ed-pbar').innerHTML = prevBarHTML(c);
  const rt = document.getElementById('ed-right'); let tog = rt.querySelector('.drawer-toggle'); if(!tog){ tog=document.createElement('button'); tog.className='drawer-toggle'; tog.dataset.a='drawerToggle'; rt.appendChild(tog); }
  const v = c.ex ? V.validate(c.ex) : null; const wsv = ws ? ws.items.reduce((a,it)=>{ const x=Q.ex(it.exerciseId); if(!x) return a; const r=V.validate(x); a.e+=r.errors.length; a.w+=r.warnings.length; return a; },{e:0,w:0}) : null;
  const ne = v?v.errors.length:wsv.e, nw = v?v.warnings.length:wsv.w;
  tog.innerHTML = `${e.drawer.open?'›':'‹'}<span style="writing-mode:vertical-rl">Thông tin</span>${ne?`<span class="badge">${ne}</span>`:''}${nw?`<span class="badge" style="background:var(--warn)">${nw}</span>`:''}`;
  tog.setAttribute('aria-expanded', e.drawer.open); tog.setAttribute('aria-label', `Thông tin về bài: ${ne} lỗi, ${nw} cảnh báo`); tog.style.display = e.focus?'none':'';
  updatePreview(c);
}
function bindGutter(){
  const g = document.getElementById('ed-gut'), body = document.getElementById('ed-body');
  g.addEventListener('pointerdown', ev=>{ g.setPointerCapture(ev.pointerId); const r=body.getBoundingClientRect();
    const mv = e2=>{ const pct=Math.max(30,Math.min(72,(e2.clientX-r.left)/r.width*100)); E().split=Math.round(pct); body.style.setProperty('--ed-left', E().split+'%'); };
    const up = ()=>{ g.removeEventListener('pointermove',mv); g.removeEventListener('pointerup',up); updatePreview(ctx(), true); };
    g.addEventListener('pointermove',mv); g.addEventListener('pointerup',up); });
  g.addEventListener('keydown', ev=>{ if(ev.key==='ArrowLeft'||ev.key==='ArrowRight'){ E().split=Math.max(30,Math.min(72,E().split+(ev.key==='ArrowLeft'?-2:2))); body.style.setProperty('--ed-left',E().split+'%'); } });
}

/* ---------- top bar ---------- */
function topHTML(c){
  const {ws, ex, me} = c;
  if(!ws){ // standalone exercise
    return `<div class="ed-top1">${UI.btn('← Kho bài',{a:'go', kind:'ghost', size:'sm', data:{href:'#/kho'}})}<b class="ed-title" style="border:none">${esc(ex.draft.title)}</b>${UI.exChip(ex)}<span class="spacer"></span>${saved()}</div><div class="ed-top2"><span class="ed-meta">${esc(Q.lessonShort(ex.scope.lessonIds[0]))} · chủ bài ${esc(Q.user(ex.ownerId).name)}</span></div>`;
  }
  const st = R.wsStatus(ws); const canWs = R.canEditWs(ws, me);
  const acts = R.primaryActions(ws, me).map(a=>{ const kind = a.kind==='ok'?'ok':a.kind==='danger'?'danger':a.kind==='ghost'?'ghost':'primary';
    if(a.id==='waiting') return `<span class="chip yellow">⏳ Đang chờ quản lý duyệt cấp 2</span>`;
    return `<span class="btn-wrap">${UI.btn(a.label,{a:'wsAct', kind, data:{act:a.id}, disabled:!a.ok, reason:a.reason})}</span>`; }).join('');
  const whys = R.primaryActions(ws, me).filter(a=>a.id!=='waiting' && !a.ok && a.kind!=='ghost' && a.reason).map(a=>`<span class="why">${esc(a.reason)}</span>`).join('');
  const holder = ws.status==='reviewing' && ws.reviewerId!==me.id ? `<span class="ed-meta" style="flex:0 1 auto">đang được ${esc(Q.user(ws.reviewerId).name)} xét</span>` : ws.status==='unlocked' ? `<span class="ed-meta">🔓 ${esc(Q.user(ws.unlock.by).name)}: ${esc(ws.unlock.reason)}</span>` : '';
  return `<div class="ed-top1"><input class="ed-title" value="${esc(ws.title)}" data-c="wsTitle" data-fk="ws-title" aria-label="Tên phiếu" ${canWs.ok?'':'readonly'}>
    ${UI.chip(st.label, st.chip, st.icon)}<span class="spacer"></span>${saved()}${acts}
    <button class="iconbtn" data-a="wsMenu" aria-label="Thêm thao tác phiếu" title="Thêm thao tác">⋯</button></div>
    <div class="ed-top2"><span class="ed-meta" title="${esc(Q.lessonLabel(ws.scope.lessonIds[0]))}">${esc(ws.code)} · v${ws.versionNo} · ${esc(Q.lessonShort(ws.scope.lessonIds[0]))} · ${esc(Q.user(ws.authorId).name)}</span>${holder}
    ${canWs.ok||canWs.withdraw?UI.btn('Cấu hình phiếu',{a:'wsCfg', kind:'ghost', size:'sm'}):''}<span class="spacer"></span>${whys}</div>`;
}
const saved = () => S.saveError ? `<span class="saved err">⚠ Chưa lưu được (mất kết nối giả lập) <button class="btn xs" data-a="retrySave">Thử lại</button></span>` : '';

/* ---------- TOC (left, D-95/D-106) ---------- */
function wsBanners(c){
  const {ws, me} = c; let h='';
  const can = R.canEditWs(ws, me);
  if(ws.status==='draft' && ws.returned && (ws.authorId===me.id || me.role==='l2')) h+=`<div class="banner warn" style="margin-bottom:10px"><span aria-hidden="true">↩</span><div><b>${esc(Q.user(ws.returned.by).name)} trả lại phiếu ${U.ago(ws.returned.at)}.</b><br>${esc(ws.returned.summary)}<br><span class="small">${R.openRequests(ws).length} note đề nghị sửa đang mở. Sửa xong, Done lại các bài rồi bấm Duyệt cấp 1.</span></div><div class="b-act">${UI.btn('Xem note',{a:'drawerTab', size:'sm', data:{t:'notes'}})}</div></div>`;
  if(!can.ok && !can.withdraw) h+=`<div class="banner info" style="margin-bottom:10px"><span aria-hidden="true">👁</span><div>Chế độ chỉ xem: ${esc(can.reason)}</div>${ws.status==='pending'&&me.role==='l2'?`<div class="b-act">${UI.btn('Nhận xét duyệt',{a:'wsAct', size:'sm', kind:'primary', data:{act:'startReview'}})}</div>`:''}</div>`;
  if(can.withdraw) h+=`<div class="banner warn" style="margin-bottom:10px"><span aria-hidden="true">⏳</span><div>Phiếu đang Chờ duyệt. Nếu sửa, phiếu sẽ được rút về Nháp (có xác nhận).</div><div class="b-act">${UI.btn('Rút về Nháp',{a:'wsAct', size:'sm', data:{act:'withdraw'}})}</div></div>`;
  if(ws.status==='unlocked' && can.ok) h+=`<div class="banner purple" style="margin-bottom:10px"><span>🔓</span><div>Bạn đang Mở khóa sửa: ${esc(ws.unlock.reason)}. Sửa và Done các bài, rồi bấm Hoàn tất sửa để đưa phiếu về Chờ duyệt.</div></div>`;
  return h;
}
function tocHTML(c){
  const {ws, me, e} = c; const can = R.canEditWs(ws, me); const canAdd = can.ok || can.withdraw;
  const items = ws.items.map((it,i)=>({it, ex:Q.ex(it.exerciseId), i}));
  const nDone = items.filter(x=>x.ex && R.exState(x.ex).key==='done' && x.it.pinnedVersionNo===R.lastDone(x.ex).no).length;
  const cmp = V.worksheet(ws);
  const reviewing = ws.status==='reviewing' && ws.reviewerId===me.id;
  let h = `<div class="toc">${wsBanners(c)}`;
  if(reviewing){
    h += `<div class="card" style="padding:12px;margin-bottom:12px;border-color:var(--bd-info)"><div class="row" style="margin-bottom:8px"><b>Tổng quan xét duyệt</b><span class="spacer"></span><span class="small muted">Ctrl+Shift+A Duyệt cấp 2 · Ctrl+Shift+R Trả lại</span></div><div class="review-sum">${items.map(x=>{ const v=V.validate(x.ex); const nn=R.wsNotes(ws).filter(n=>n.exId===x.ex.id && n.status==='open').length; return `<div class="rs" data-a="tocOpen" data-it="${x.it.id}" role="button" tabindex="0"><b>${x.i+1}. ${esc(x.ex.draft.title)}</b><div class="small muted">${esc(WS.TYPES[x.ex.type].label)} · ${x.ex.draft.questions.length} câu</div><div class="row small" style="margin-top:4px">${v.errors.length?`<span class="mini err">${v.errors.length} lỗi</span>`:''}${v.warnings.length?`<span class="mini warn">${v.warnings.length} cảnh báo</span>`:'<span class="mini" style="background:var(--ok-soft);color:var(--ok-2)">không lỗi</span>'}${nn?`<span class="mini" style="background:var(--orange-soft);color:var(--orange)">${nn} note</span>`:''}</div></div>`; }).join('')}</div></div>`;
  }
  h += `<div class="toc-head"><h2 style="font-size:17px">Mục lục</h2><span class="chip ${nDone===items.length&&items.length?'green':'grey'}">${nDone}/${items.length} bài Done</span><span class="chip outline" data-tip="Mức tuân thủ phiếu (A6): độ phủ từ vựng ${cmp.cov}%, ${cmp.errs} lỗi, ${cmp.warns} cảnh báo">Tuân thủ ${cmp.level}%</span><span class="spacer"></span>
    ${UI.btn('＋ Thêm bài',{a:'tocAdd', size:'sm', disabled:!canAdd, reason:can.reason})}${UI.btn('＋ Từ kho',{a:'tocLib', size:'sm', disabled:!canAdd, reason:can.reason})}</div>`;
  if(!items.length){ const g=S.session.gen&&S.session.gen[ws.id]; h += g&&!g.done ? UI.empty('Đang sinh bài…','Các bài sẽ hiện ở đây khi sinh xong.') : UI.empty('Phiếu chưa có bài','Thêm bài mới hoặc lấy từ kho bài.'); }
  items.forEach(({it, ex, i})=>{
    if(!ex) return; const v = V.validate(ex); const stt = R.exState(ex); const sel = e.lastSel===it.id; const last = R.lastDone(ex);
    const newer = last && it.pinnedVersionNo && last.no > it.pinnedVersionNo;
    const lockedOther = R.lockingWs(ex, me).filter(w=>w.id!==ws.id).length || (R.lockOf(ex.id) && R.lockOf(ex.id).userId!==me.id);
    const media = (ex.draft.media||[]).map(id=>Q.media(id)).filter(Boolean);
    const notes = R.wsNotes(ws).filter(n=>n.exId===ex.id && n.status==='open' && n.kind==='request').length;
    h += `<div class="toc-item ${sel?'sel':''}" data-a="tocOpen" data-it="${it.id}" role="button" tabindex="0" aria-label="Mở bài ${i+1}: ${esc(ex.draft.title)}">
      <span class="num">${i+1}${it.breakBefore&&i?'<span class="toc-brk" title="Bắt đầu trang mới" aria-label="Bắt đầu trang mới">⤓</span>':''}</span>
      <div style="min-width:0"><div class="ttl">${esc(ex.draft.title)} ${lockedOther?'<span title="Bài bị khóa">🔒</span>':''}</div>
        <div class="sub">${esc(WS.TYPES[ex.type].label)} · ${ex.draft.questions.length} câu · ${UI.chip(stt.label, stt.chip, stt.icon)} ${v.errors.length?`<span class="mini err">${v.errors.length} lỗi</span>`:''} ${v.warnings.length?`<span class="mini warn">${v.warnings.length} cảnh báo</span>`:''} ${notes?`<span class="mini" style="background:var(--orange-soft);color:var(--orange)">${notes} note</span>`:''} ${mismatch(ws,ex)?'<span class="mini warn">Khác cấu hình hiện tại</span>':''}</div>
        ${sel?`<div class="small muted" style="margin-top:6px;font-style:italic">${esc(ex.draft.instruction)}</div><div class="small" style="margin-top:4px;font-family:var(--serif)">${ex.draft.questions.slice(0,2).map(q=>esc(V.textsOf({questions:[q]},ex.type).map(t=>t.text)[0]||'')).join('<br>')}</div>
          <div class="row small" style="margin-top:6px">${media.map(m=>({image:'🖼 Ảnh',audio:'🔊 Audio',video:'🎬 Video'})[m.kind]).join(' · ')}<span class="spacer"></span><span class="muted">Bố cục ${esc(ex.draft.layout)}</span></div>`:''}
        ${newer?`<div class="row small" style="margin-top:6px;color:var(--warn)">Có bản mới v${last.no}. Đang ghim v${it.pinnedVersionNo}. ${UI.btn('Cập nhật',{a:'pinUpd', size:'xs', data:{it:it.id, m:'update'}})} ${UI.btn('Giữ v'+it.pinnedVersionNo,{a:'pinUpd', size:'xs', kind:'ghost', data:{it:it.id, m:'keep'}})}</div>`:''}
      </div>
      <div class="ctl">${UI.btn('↑',{a:'tocMv', size:'xs', kind:'ghost', data:{it:it.id, d:-1}, aria:'Lên', disabled:!canAdd||i===0, reason:i===0?'Đã ở đầu':can.reason})}${UI.btn('↓',{a:'tocMv', size:'xs', kind:'ghost', data:{it:it.id, d:1}, aria:'Xuống', disabled:!canAdd||i===items.length-1, reason:i===items.length-1?'Đã ở cuối':can.reason})}${UI.btn('✕',{a:'tocDel', size:'xs', kind:'ghost', data:{it:it.id}, aria:'Xóa khỏi phiếu', disabled:!canAdd, reason:can.reason})}</div></div>`;
  });
  return h + `</div>`;
}

/* ---------- exercise pane ---------- */
function exPaneHTML(c){
  const {ws, item, ex, me, e} = c; const d = ex.draft;
  const perm = R.canEditEx(ex, me, ws); const ro = !perm.ok && !perm.withdraw;
  const v = V.validate(ex); const st = R.exState(ex); const std = Q.standard(ex.type);
  const idx = ws ? ws.items.indexOf(item) : 0; const n = ws ? ws.items.length : 1;
  const done = R.canDone(ex, me, ws);
  let banners = '';
  if(ro){
    const alts = [];
    if(perm.alt==='clone' && ws && R.canEditWs(ws,me).ok){ alts.push(UI.btn('Sửa tay tạo bản riêng cho phiếu',{a:'exLocal', size:'sm', kind:'primary'})); }
    if(perm.alt==='clone') alts.push(UI.btn('Nhân bản vào kho',{a:'exClone', size:'sm'}));
    if(perm.alt==='restore') alts.push(UI.btn('Khôi phục bài',{a:'exStatus', size:'sm', data:{v:'active'}}));
    if(perm.soft && me.role==='l2') alts.push(UI.btn('Gỡ khóa',{a:'exUnlockSoft', size:'sm'}));
    banners += `<div class="banner ${perm.soft?'warn':'info'}" style="margin:10px 0"><span aria-hidden="true">${perm.soft?'✋':'🔒'}</span><div><b>Chỉ xem.</b> ${esc(perm.reason)}</div>${alts.length?`<div class="b-act">${alts.join('')}</div>`:''}</div>`;
  }
  if(S.session.loadedRev[ex.id]!=null && S.session.loadedRev[ex.id]!==d.rev) banners += `<div class="banner err" style="margin:10px 0"><span>⚠</span><div>${esc(Q.user(d.updatedBy).name)} vừa lưu bản mới hơn (rev ${d.rev}). Thay đổi tiếp theo của bạn sẽ bị từ chối cho tới khi tải lại.</div><div class="b-act">${UI.btn('Tải lại bản mới nhất',{a:'exReload', size:'sm', kind:'primary'})}</div></div>`;
  if(ws && mismatch(ws,ex)) banners += `<div class="banner warn" style="margin:10px 0"><span>⚠</span><div>Bài khác cấu hình hiện tại của phiếu (lesson hoặc theme). Bài đã Done được giữ nguyên.</div></div>`;
  const notes = ws ? R.wsNotes(ws).filter(x=>x.exId===ex.id && x.targetType==='exercise' && x.status==='open') : [];
  notes.forEach(nt=>banners += `<div class="note ${nt.kind==='info'?'info':''}"><b>${esc(Q.user(nt.authorId).name)}</b> · ${nt.kind==='request'?'Đề nghị sửa':'Ghi chú'}: ${esc(nt.text)} ${ws&&(me.id===ws.authorId||me.id===nt.authorId)?UI.btn('Đã xử lý',{a:'noteRes', size:'xs', data:{id:nt.id}}):''}</div>`);
  // layout suggestion (D-82)
  const sug = AI.suggestLayout(ex.type, d, (d.media||[]).some(id=>{const m=Q.media(id); return m&&m.kind==='image';}));
  if(!ro && sug.layout!==d.layout && sug.layout!=='L1' && !(e.dismissLay||{})[ex.id]) banners += `<div class="banner info" style="margin:10px 0"><span>▦</span><div>Gợi ý bố cục <b>${sug.layout} · ${esc(Q.layout(sug.layout).name)}</b>: ${esc(sug.reason)}</div><div class="b-act">${UI.btn('Áp dụng',{a:'exLay', size:'sm', data:{l:sug.layout}})}${UI.btn('Giữ nguyên',{a:'exLayKeep', size:'sm', kind:'ghost'})}</div></div>`;
  const qIss = id => v.byQ[id]||[];
  const media = (d.media||[]).map(id=>Q.media(id)).filter(Boolean);
  const qNotes = id => ws ? R.wsNotes(ws).filter(x=>x.targetType==='question' && x.targetId===id) : [];
  const canNote = ws && ws.status==='reviewing' && ws.reviewerId===me.id;
  const selQ = e.selQ||[];
  const rows = d.questions.map((q,i)=>{
    const iss = qIss(q.id); const editing = e.editQ===q.id && !ro; const nts = qNotes(q.id);
    return `<div class="q ${editing?'editing':''}" data-qid="${q.id}" draggable="${!ro}" ${iss.some(x=>x.sev==='e')?'style="border-color:var(--bd-err)"':''}>
      <input type="checkbox" ${selQ.includes(q.id)?'checked':''} data-c="qSel" data-q="${q.id}" aria-label="Chọn câu ${i+1}" ${ro?'disabled':''}>
      <span class="qn">${ex.type==='cloze_mcq'?q.n:i+1}</span>
      <div>${editing?qEditHTML(ex,q):qRead(ex,q,iss)}${qMarks(iss)}${nts.map(nt=>`<div class="note ${nt.kind==='info'?'info':''} ${nt.status==='resolved'?'resolved':''}" style="margin-top:6px"><b>${esc(Q.user(nt.authorId).name)}</b> · ${nt.kind==='request'?'Đề nghị sửa':'Ghi chú'}: ${esc(nt.text)} ${nt.status==='open'?UI.btn('Đã xử lý',{a:'noteRes', size:'xs', data:{id:nt.id}}):'<span class="small">✓ đã xử lý</span>'}</div>`).join('')}</div>
      <div class="qact">${ro?'':`${UI.btn(editing?'✓':'✎',{a:editing?'qDone':'qEdit', size:'xs', kind:'ghost', data:{q:q.id}, title:editing?'Xong (Enter)':'Sửa tại chỗ', aria:editing?'Xong':'Sửa câu'})}${UI.btn('↻',{a:'qRegen', size:'xs', kind:'ghost', data:{q:q.id}, title:'Tạo lại câu (3 phương án)', aria:'Tạo lại câu'})}${ex.type!=='cloze_mcq'?UI.btn('⧉',{a:'qDup', size:'xs', kind:'ghost', data:{q:q.id}, title:'Nhân bản câu', aria:'Nhân bản câu'}):''}${ex.type!=='cloze_mcq'?UI.btn('🗑',{a:'qDel', size:'xs', kind:'ghost', data:{q:q.id}, title:'Xóa câu', aria:'Xóa câu'}):''}`}${canNote?UI.btn('💬',{a:'noteAdd', size:'xs', kind:'ghost', data:{tt:'question', id:q.id}, title:'Thêm note cho câu', aria:'Thêm note'}):''}</div></div>`;
  }).join('');
  const hasPassage = ['tfng','cloze_mcq','short_answer'].includes(ex.type) || d.passage;
  const pIss = (v.byQ._||[]).filter(i=>i.words);
  return `<div class="ex-head">
    <div class="ex-nav">${ws?`${UI.btn('← Mục lục',{a:'tocBack', size:'sm', kind:'ghost'})}${UI.btn('◀',{a:'exNav', size:'sm', kind:'ghost', data:{d:-1}, aria:'Bài trước', disabled:idx===0, reason:'Đã là bài đầu'})}<span class="small muted">Bài ${idx+1}/${n}</span>${UI.btn('▶',{a:'exNav', size:'sm', kind:'ghost', data:{d:1}, aria:'Bài sau', disabled:idx===n-1, reason:'Đã là bài cuối'})}`:''}<span class="spacer"></span><span class="layout-pick" role="radiogroup" aria-label="Bố cục hiển thị">${Q.layoutsFor(ex.type).map(l=>l.id).map(L=>`<button class="lay ${d.layout===L?'on':''}" ${ro?'disabled':''} data-a="exLay" data-l="${L}" role="radio" aria-checked="${d.layout===L}" title="${esc(Q.layout(L).name)}: ${esc(Q.layout(L).when)}">${UI.layIcon(L)}${L}</button>`).join('')}</span></div>
    <input class="ex-title" value="${esc(d.title)}" data-c="exTitle" data-fk="ex-title" aria-label="Tiêu đề bài" ${ro?'readonly':''}>
    <div class="ex-sub">${UI.typeChip(ex.type)}<span>${std.id} v${std.version}</span>${UI.chip(st.label, st.chip, st.icon)}<span>${d.questions.length} câu</span>${v.pass?'<span style="color:var(--ok-2)">✓ Đạt kiểm tra</span>':`<span style="color:var(--err)">${v.errors.length} lỗi</span>`} · <span>${v.warnings.length} cảnh báo</span></div>
    ${ws&&item?pageCtlHTML(item, ex, idx, ro):''}
    ${ro?'':`<div class="ex-actions"><span class="btn-wrap">${UI.btn(st.key==='done'?`✓ Done v${R.lastDone(ex).no}`:'Done',{a:'exDone', kind:'ok', disabled:!done.ok, reason:done.reason, title:'Ctrl+Enter'})}${!done.ok&&!done.already?`<span class="why">${esc(done.reason)}</span>`:''}</span>
      ${UI.btn('↻ Tạo lại bài',{a:'exRegen', size:'sm'})}${ex.type!=='cloze_mcq'?UI.btn('＋ Thêm câu',{a:'qAdd', size:'sm', title:'Alt+N'}):''}${ex.type!=='cloze_mcq'?UI.btn('Dán danh sách',{a:'qPaste', size:'sm'}):''}
      ${UI.btn('↶',{a:'exUndo', size:'sm', kind:'ghost', aria:'Hoàn tác', title:'Hoàn tác (Ctrl+Z)', disabled:!(S.session.undo[ex.id]||[]).length, reason:'Chưa có thao tác để hoàn tác'})}${UI.btn('↷',{a:'exRedo', size:'sm', kind:'ghost', aria:'Làm lại', title:'Làm lại (Ctrl+Y)', disabled:!(S.session.redo[ex.id]||[]).length, reason:'Chưa có thao tác để làm lại'})}
      <button class="iconbtn" data-a="exMenu" aria-label="Thêm thao tác bài" title="Thêm thao tác">⋯</button></div>`}
  </div><div class="ex-body">${banners}
    <label class="lbl" for="ex-ins">Hướng dẫn</label><textarea id="ex-ins" class="instr" rows="2" data-c="exInstr" data-fk="ex-ins" ${ro?'readonly':''}>${esc(d.instruction)}</textarea>
    ${hasPassage?`<div class="sec"><div class="sec-h">Đoạn văn${ex.type==='cloze_mcq'?' <span class="small muted">dùng {1}, {2}… cho chỗ trống</span>':''}</div><textarea class="inp" rows="5" data-c="exPassage" data-fk="ex-psg" style="font-family:var(--serif);font-size:15px" ${ro?'readonly':''}>${esc(d.passage)}</textarea>${pIss.length?`<div class="passage small" style="margin-top:6px">${markText(d.passage, pIss, '')}</div>`:''}</div>`:''}
    ${ex.type==='fill_blank'?`<div class="sec"><div class="sec-h">Khung từ (word bank)</div><input class="inp" data-c="exBank" data-fk="ex-bank" value="${esc((d.wordBank||[]).join(', '))}" placeholder="Bỏ trống nếu không dùng khung từ" ${ro?'readonly':''}></div>`:''}
    ${ex.type==='matching'?`<div class="sec"><div class="sec-h">Mục nhiễu cột phải <span class="small muted">tối đa ${std.maxDistractors||2}</span></div><input class="inp" data-c="exExtra" data-fk="ex-extra" value="${esc((d.extraRight||[]).join(', '))}" placeholder="Không bắt buộc" ${ro?'readonly':''}></div>`:''}
    <div class="sec"><div class="sec-h">Câu hỏi <span class="small muted">· bấm vào câu để sửa tại chỗ, Enter để sang câu sau, kéo để đổi thứ tự</span></div><div id="qlist">${rows||UI.empty('Chưa có câu nào','Bấm Thêm câu hoặc Dán danh sách.')}</div>
      ${selQ.length&&!ro?`<div class="bulkbar" role="toolbar" aria-label="Thao tác với câu đã chọn"><b>Đã chọn ${selQ.length} câu</b><span class="spacer"></span><button class="btn" data-a="bulkRegen">↻ Tạo lại</button>${ws?'<button class="btn" data-a="bulkMove">Chuyển sang bài…</button>':''}<button class="btn" data-a="bulkDel">🗑 Xóa</button><button class="btn" data-a="bulkClear">Bỏ chọn</button></div>`:''}</div>
    ${media.length?`<div class="sec"><div class="sec-h">Media của bài</div><div class="media-row">${media.map(m=>mediaCard(m, ro)).join('')}</div></div>`:''}
    <details class="sec" ${e.openAns?'open':''}><summary class="sec-h" style="cursor:pointer" data-a="toggleAns">Đáp án & giải thích ▾</summary>
      <div class="row" style="margin-bottom:8px"><label class="switch"><input type="checkbox" data-c="exExplOn" ${d.explanationsOn!==false?'checked':''} ${ro?'disabled':''}> Hiện giải thích trong bản giáo viên</label><span class="spacer"></span>${ro?'':UI.btn('↻ Chỉ tạo lại giải thích',{a:'exRegenAns', size:'sm'})}</div>
      ${d.questions.map((q,i)=>`<div class="row" style="margin-bottom:4px"><span class="small muted" style="width:46px">Câu ${ex.type==='cloze_mcq'?q.n:i+1}</span><input class="inp" data-c="qField" data-q="${q.id}" data-f="explanation" data-fk="${q.id}:explanation" value="${esc(q.explanation||'')}" placeholder="Giải thích (không bắt buộc)" ${ro?'readonly':''}></div>`).join('')}</details>
    ${(ex.genLog||[]).length?`<details class="sec"><summary class="sec-h" style="cursor:pointer">Nhật ký sinh</summary><div class="small muted">${ex.genLog.map(esc).join('<br>')}</div></details>`:''}
  </div>`;
}
/* D-134: ngắt trang và giữ trọn bài là thuộc tính của bài trong phiếu, không đổi nội dung bài */
function pageCtlHTML(item, ex, idx, ro){
  const keep = window.WSV.keepOf({type:ex.type, keep:item.keep});
  return `<div class="ex-page" role="group" aria-label="Dàn trang"><span class="small muted">Dàn trang:</span>
    ${idx>0?`<button class="tog ${item.breakBefore?'on':''}" data-a="itBrk" data-it="${item.id}" aria-pressed="${!!item.breakBefore}" ${ro?'disabled':''} title="Bài này luôn bắt đầu ở đầu trang">⤓ Bắt đầu trang mới</button>`:''}
    <button class="tog ${keep?'on':''}" data-a="itKeep" data-it="${item.id}" aria-pressed="${keep}" ${ro?'disabled':''} title="Không tách bài sang hai trang; không vừa phần còn lại thì đẩy cả bài sang trang sau">▣ Giữ trọn bài trên một trang</button>
    <span class="small muted">${item.keep==null?(keep?'Tự bật vì bài có đoạn văn hoặc là bài nối.':'Tự động: bài dài được tách theo câu.'):'Bạn đã chỉnh.'}</span></div>`;
}
function mediaCard(m, ro){
  const thumb = m.kind==='image' ? (S.state.demo.mediaFail && !m.retried ? `<div class="small" style="color:var(--err);text-align:center">Không tải được ảnh<br>${UI.btn('Thử lại',{a:'mediaRetry', size:'xs', data:{m:m.id}})}</div>` : WSV.svgImage(m)) : m.kind==='audio' ? `<div style="font-size:30px">🔊</div>` : `<div style="font-size:30px">🎬</div>`;
  return `<div class="media-card"><div class="thumb">${thumb}</div><b>${({image:'Ảnh',audio:'Audio',video:'Video'})[m.kind]}</b>
    ${m.kind==='image'?`<input class="inp" style="height:28px;font-size:12.5px" data-c="mediaAlt" data-m="${m.id}" value="${esc(m.alt||'')}" placeholder="Alt text (bắt buộc)" aria-label="Alt text" ${ro?'readonly':''}>`:''}
    ${m.kind==='audio'?`<textarea class="inp" style="font-size:12px" rows="3" data-c="mediaTr" data-m="${m.id}" aria-label="Transcript" ${ro?'readonly':''}>${esc(m.transcript||'')}</textarea>`:''}
    ${m.kind==='video'?`<span class="small muted">${esc(m.caption||'')}</span>`:''}
    <div class="row wrap">${m.kind==='audio'?UI.btn('▶ Nghe thử',{a:'mediaPlay', size:'xs', data:{m:m.id}}):''}${ro?'':`${m.kind==='image'?UI.btn('↻ Tạo lại',{a:'mediaRegen', size:'xs', data:{m:m.id}}):''}${UI.btn('Xóa',{a:'mediaDel', size:'xs', kind:'ghost', data:{m:m.id}})}`}</div></div>`;
}

/* ---------- drawer ---------- */
function drawerHTML(c){
  const {ws, ex, e, me} = c; const tab = e.drawer.tab;
  const tabs = [['check','Kiểm tra'],['vocab','Học liệu'],['sheet','Phiếu'],['source','Nguồn'],['hist','Lịch sử'],['notes','Nhận xét']].filter(t=>ws||!['sheet','notes'].includes(t[0]));
  let body = '';
  const lesson = Q.lesson((ex?ex.scope:ws.scope).lessonIds[0]);
  if(tab==='check'){
    if(ex){ const v=V.validate(ex); const strict=S.state.settings.strictness;
      body = `<div class="banner ${v.pass?'ok':v.errors.length?'err':'warn'}" style="margin-bottom:10px">${v.pass?'Đạt: không lỗi, mọi tiêu chí ≥ 70.':v.errors.length?`${v.errors.length} lỗi chặn Done.`:`Không có lỗi; ${v.warnings.length} cảnh báo cần xác nhận khi Done.`}</div>
        ${v.issues.length?v.issues.map(i=>`<div class="issue ${i.sev}" data-a="issueGo" data-q="${i.qid||''}" role="button" tabindex="0"><span class="code">${i.code}</span><span>${esc(i.msg)}</span></div>`).join(''):'<div class="muted small">Không có lỗi hay cảnh báo.</div>'}
        <h3 style="margin:16px 0 8px;font-size:14px">Điểm 6 tiêu chí</h3><div class="score">${WS.CRITERIA.map(k=>{ const s=v.scores[k.k]; return `<span title="${esc(k.note)}">${esc(k.label)}</span><b style="text-align:right">${s}</b><div class="sb"><span style="width:${s}%;background:${s>=90?'var(--ok)':s>=70?'var(--bar-rev)':'var(--err)'}"></span></div>`; }).join('')}</div>
        <h3 style="margin:16px 0 8px;font-size:14px">Bảng tuân thủ ${esc(Q.standard(ex.type).id)}</h3>${WS.RULES.map(([code,t,sev,why])=>{ const hit=v.issues.filter(i=>i.code===code); const s=hit.some(i=>i.sev==='e')?'e':hit.length?'w':'ok'; return `<div class="issue ${s==='ok'?'':s}" ${hit[0]?`data-a="issueGo" data-q="${hit[0].qid||''}"`:''} data-tip="${esc(why)}" style="padding:4px 8px"><span class="code" ${s==='ok'?'style="background:var(--ok-soft);color:var(--ok-2)"':''}>${code}</span><span class="small">${esc(t)}</span><span class="small" style="margin-left:auto">${s==='ok'?'✓':s==='e'?'Lỗi':'Cảnh báo'}</span></div>`; }).join('')}
        <h3 style="margin:16px 0 8px;font-size:14px">Truy vết tiêu chuẩn</h3><div class="small">Soạn theo <b>${esc(ex.standardRef.id)} v${esc(ex.standardRef.version)}</b>; hiện hành v${esc(Q.standard(ex.type).version)}. ${ex.standardRef.version!==Q.standard(ex.type).version?'<span style="color:var(--warn)">⚠ Tiêu chuẩn đã đổi phiên bản kể từ lúc soạn.</span>':'Khớp phiên bản hiện hành.'} Chế độ: ${{std:'Chuẩn',strict:'Chặt',max:'Chặt tối đa'}[strict]}.</div>`;
    } else {
      body = ws.items.map((it,i)=>{ const x=Q.ex(it.exerciseId); if(!x) return ''; const v=V.validate(x); return `<div class="issue ${v.errors.length?'e':v.warnings.length?'w':''}" data-a="tocOpen" data-it="${it.id}" role="button" tabindex="0"><span class="code" ${!v.issues.length?'style="background:var(--ok-soft);color:var(--ok-2)"':''}>${i+1}</span><span>${esc(x.draft.title)}<br><span class="small muted">${v.errors.length} lỗi · ${v.warnings.length} cảnh báo</span></span></div>`; }).join('') || '<div class="muted small">Chưa có bài.</div>';
    }
  } else if(tab==='vocab'){
    const used = ex ? new Set(U.words(V.textsOf(ex.draft, ex.type).map(t=>t.text).join(' ')).flatMap(U.stem)) : new Set();
    body = `<div class="small muted" style="margin-bottom:8px">Bấm một từ để chèn vào ô đang sửa. Từ đã dùng trong bài được tô nhạt.</div><h3 style="font-size:13.5px;margin-bottom:6px">Từ vựng · ${esc(lesson.code)} ${esc(lesson.name)}</h3><div>${lesson.vocab.map(v=>`<span class="vchip ${v.w.split(' ').every(p=>used.has(p))?'used':''}" data-a="insWord" data-w="${esc(v.w)}" role="button" tabindex="0" title="${esc(v.vi)}">${esc(v.emoji)} ${esc(v.w)}</span>`).join('')}</div>
      <h3 style="font-size:13.5px;margin:12px 0 6px">Cấu trúc</h3><div class="small">${lesson.grammar.map(esc).join('<br>')}</div>
      <h3 style="font-size:13.5px;margin:12px 0 6px">Câu mẫu</h3>${lesson.sentenceBank.map(s=>`<div class="vchip" style="display:block;border-radius:8px" data-a="insWord" data-w="${esc(s)}" role="button" tabindex="0">${esc(s)}</div>`).join('')}
      <h3 style="font-size:13.5px;margin:12px 0 6px">Đoạn văn nguồn</h3><div class="passage small">${esc(lesson.passages[0]||'—')}</div>
      <h3 style="font-size:13.5px;margin:12px 0 6px">Cấm / chưa học</h3><div class="tags">${lesson.banned.map(b=>`<span class="tag ban">${esc(b)}</span>`).join('')}</div>`;
  } else if(tab==='sheet' && ws){
    const cm = V.worksheet(ws);
    body = `<div class="small muted">Mức tuân thủ phiếu</div><div style="font-size:30px;font-weight:700">${cm.level}%</div><div class="fill" style="margin:4px 0 14px"><span style="width:${cm.level}%;background:${cm.level>=80?'var(--ok)':cm.level>=60?'var(--bar-rev)':'var(--err)'}"></span></div>
      <dl class="kv" style="grid-template-columns:130px 1fr"><dt>Độ phủ từ vựng</dt><dd>${cm.cov}% (${cm.used.length}/${cm.vocab.length})</dd><dt>Tổng số câu</dt><dd>${cm.totalQ}</dd><dt>Thời lượng ước tính</dt><dd>${cm.minutes} phút / mục tiêu ${ws.settings.minutes}</dd>
      <dt>Cân bằng độ khó</dt><dd>${cm.balance?'Có nhiều mức':'<span style="color:var(--warn)">Các bài cùng một mức độ khó</span>'}</dd><dt>Lỗi / cảnh báo</dt><dd>${cm.errs} / ${cm.warns}</dd><dt>Câu trùng giữa bài</dt><dd>${cm.dupes.length?cm.dupes.map(x=>`Bài ${x.a} và ${x.b}: "${esc(x.text)}"`).join('<br>'):'Không có'}</dd></dl>
      <h3 style="font-size:13.5px;margin:12px 0 6px">Từ vựng chưa dùng</h3><div class="tags">${cm.vocab.filter(w=>!cm.used.includes(w)).map(w=>`<span class="tag">${esc(w)}</span>`).join('')||'<span class="small muted">Đã dùng hết.</span>'}</div>`;
  } else if(tab==='source'){
    const x = ex || null; const scope = (x||ws).scope; const cur = Q.curriculum(scope.curriculumId); const lc=Q.lessonCtx(scope.lessonIds[0]);
    body = `<dl class="kv" style="grid-template-columns:120px 1fr"><dt>Giáo trình</dt><dd>${esc(cur.name)} · soạn trên v${esc(scope.curriculumVersion)} ${cur.version!==scope.curriculumVersion?`<span style="color:var(--warn)">(hiện v${esc(cur.version)}, giáo trình đã đổi phiên bản)</span>`:''}</dd><dt>Level</dt><dd>${esc(lc.l.name)} (${esc(lc.l.cefr)})</dd><dt>Unit</dt><dd>${esc(lc.u.code)} ${esc(lc.u.name)}</dd><dt>Lesson</dt><dd>${scope.lessonIds.map(id=>esc(Q.lesson(id).code+' '+Q.lesson(id).name)).join(', ')}</dd>
      ${x?`<dt>Tiêu chuẩn</dt><dd>${esc(x.standardRef.id)} v${esc(x.standardRef.version)}</dd><dt>Tham số sinh</dt><dd>${esc(WS.TYPES[x.type].label)} · ${x.draft.questions.length} câu · độ khó ${({easy:'dễ',medium:'vừa',hard:'khó'})[x.draft.difficulty]||'vừa'} · ${esc(x.draft.layout)}${x.draft.aiNote?` · ghi chú "${esc(x.draft.aiNote)}"`:''}</dd>
      <dt>Nguồn nội dung</dt><dd>${{ai:'AI sinh (giả lập)',manual:'Soạn tay',clone:'Nhân bản',derived:'Bản phát sinh'}[x.origin.kind]}${x.origin.fromId?` từ ${esc((Q.ex(x.origin.fromId)||{draft:{title:x.origin.fromId}}).draft.title)}`:''}${x.versions.some(v=>v.doneBy!==x.ownerId)?' · có người khác sửa':''}${(S.session.undo[x.id]||[]).length?' · đã sửa tay trong phiên':''}</dd>
      <dt>Theme</dt><dd>${x.themeId?esc(Q.theme(x.themeId).name):'Không'}</dd><dt>Chủ bài</dt><dd>${esc(Q.user(x.ownerId).name)}</dd><dt>Phiếu đang dùng</dt><dd>${R.wsUsing(x.id).map(w=>esc(w.code)).join(', ')||'—'}</dd>`:`<dt>Theme</dt><dd>${ws.themeId?esc(Q.theme(ws.themeId).name):'Không'}</dd><dt>Số trang A4</dt><dd>${ws.pages}</dd>`}</dl>`;
  } else if(tab==='hist'){
    const bh = ex ? ex.versions.slice().reverse().map(v=>`<div class="hist-item"><div class="row"><b>Done v${v.no}</b><span class="spacer"></span><span class="small muted">${esc(Q.user(v.doneBy).name)} · ${U.fmtDate(v.doneAt)}</span></div><div class="row" style="margin-top:6px">${UI.btn('Xem',{a:'verView', size:'xs', data:{v:v.no}})}${UI.btn('So sánh với bản nháp',{a:'verCmp', size:'xs', data:{v:v.no}})}${UI.btn('Khôi phục',{a:'verRestore', size:'xs', data:{v:v.no}})}</div></div>`).join('') || '<div class="muted small">Bài chưa có mốc Done nào.</div>' : '';
    const ph = ws ? ws.versions.slice().reverse().map(v=>`<div class="hist-item"><b>${esc(v.label)}</b> <span class="small muted">· ${esc(Q.user(v.by).name)} · ${U.fmtDate(v.at)}</span><div class="small muted">${v.items.length} bài: ${v.items.map(i=>'v'+(i.pinnedVersionNo||'–')).join(', ')}</div></div>`).join('') || '<div class="muted small">Phiếu chưa có phiên bản.</div>' : '';
    body = `${ex?`<h3 style="font-size:13.5px;margin-bottom:8px">Bài</h3>${bh}`:''}${ws?`<h3 style="font-size:13.5px;margin:14px 0 8px">Phiếu</h3>${ph}`:''}`;
  } else if(tab==='notes' && ws){
    const all = R.wsNotes(ws).filter(n=>!ex || n.exId===ex.id || n.targetType==='worksheet').sort((a,b)=>b.at-a.at);
    const canAdd = ws.status==='reviewing' && ws.reviewerId===me.id;
    body = `${ws.returned?`<div class="note"><b>Note tổng hợp khi Trả lại</b> · ${esc(Q.user(ws.returned.by).name)}: ${esc(ws.returned.summary)}</div>`:''}
      ${all.map(nt=>{ const tgt = nt.targetType==='worksheet'?'Phiếu':nt.targetType==='exercise'?`Bài ${ws.items.findIndex(i=>i.exerciseId===nt.exId)+1}`:`Bài ${ws.items.findIndex(i=>i.exerciseId===nt.exId)+1} · câu ${(Q.ex(nt.exId)||{draft:{questions:[]}}).draft.questions.findIndex(q=>q.id===nt.targetId)+1}`;
        return `<div class="note ${nt.kind==='info'?'info':''} ${nt.status==='resolved'?'resolved':''}"><div class="row small"><b>${esc(Q.user(nt.authorId).name)}</b><span class="muted">${tgt} · ${nt.kind==='request'?'Đề nghị sửa':'Ghi chú'} · ${U.ago(nt.at)}</span></div><div>${esc(nt.text)}</div><div class="row" style="margin-top:4px">${nt.exId?UI.btn('Mở',{a:'noteGo', size:'xs', kind:'ghost', data:{ex:nt.exId, q:nt.targetType==='question'?nt.targetId:''}}):''}<span class="spacer"></span>${nt.status==='open'?UI.btn('Đánh dấu đã xử lý',{a:'noteRes', size:'xs', data:{id:nt.id}}):UI.btn('Mở lại',{a:'noteReopen', size:'xs', kind:'ghost', data:{id:nt.id}})}</div></div>`; }).join('') || '<div class="muted small">Chưa có nhận xét.</div>'}
      ${canAdd?`<div class="row" style="margin-top:10px">${UI.btn('＋ Note cho phiếu',{a:'noteAdd', size:'sm', data:{tt:'worksheet', id:ws.id}})}${ex?UI.btn('＋ Note cho bài',{a:'noteAdd', size:'sm', data:{tt:'exercise', id:ex.id}}):''}</div><div class="small muted" style="margin-top:6px">Note cho từng câu: bấm 💬 ở câu đó.</div>`:''}`;
  }
  return `<div class="drawer-tabs" role="tablist">${tabs.map(([k,l])=>`<button class="${tab===k?'on':''}" data-a="drawerTab" data-t="${k}" role="tab" aria-selected="${tab===k}">${l}</button>`).join('')}</div><div class="drawer-body" role="tabpanel">${body}</div>`;
}

/* ---------- preview (D-94: render offscreen then swap) ---------- */
function prevBarHTML(c){
  const {ws, e} = c; const ok = ws && ['approved','published'].includes(ws.status);
  const pg = e.pageInfo; const over = pg && pg.target && pg.pages>pg.target;
  return `<b class="small">${ws?'Preview cả phiếu':'Preview bài'}</b><div class="seg" role="radiogroup" aria-label="Loại bản"><button class="${e.prevKind==='teacher'?'on':''}" data-a="prevKind" data-v="teacher">GV</button><button class="${e.prevKind==='student'?'on':''}" data-a="prevKind" data-v="student">HS</button></div>
    ${e.prevKind==='teacher'?`<label class="switch small"><input type="checkbox" data-c="prevAns" ${e.prevAns?'checked':''}> Đáp án</label>`:''}
    ${pg?`<button class="chip ${over?'orange':'outline'}" ${over?'data-a="pageSugg"':''} style="cursor:${over?'pointer':'default'};border:none" title="${over?'Bấm để xem gợi ý vừa số trang':''}">${pg.pages} trang${pg.target?` / ${pg.target}`:''}${over?' · gợi ý':''}</button>`:''}
    <span class="spacer"></span>${ws&&!ok?'<span class="prev-flag" title="Bản xem trước · chưa duyệt cấp 2">Chưa duyệt cấp 2</span>':''}
    ${ws?UI.btn('🎯 Quiz',{a:'prevQuiz', size:'sm', kind:'ghost', title:'Mở Quiz trong viewer giáo viên'})+UI.btn('⛶ Toàn màn hình',{a:'prevFull', size:'sm', title:'Mở viewer đầy đủ'}):''}
    ${UI.btn(e.focus?'Thoát tập trung':'Tập trung',{a:'focusMode', size:'sm', kind:'ghost', title:'Chế độ tập trung: ẩn preview và ngăn thông tin'})}`;
}
let prevTimer = null;
function updatePreview(c, force){
  clearTimeout(prevTimer);
  prevTimer = setTimeout(()=>{
    const {ws, ex, e} = c; const host = document.getElementById('ed-prev'); if(!host) return;
    const fakeWs = ws || {code:'BAI', title:ex.draft.title, versionNo:1, pages:0, themeId:ex.themeId, scope:ex.scope, items:[{id:'x', exerciseId:ex.id, pinnedVersionNo:null, layout:null}]};
    const data = EX.viewerData(fakeWs, e.prevKind, {useDraft:!ws || ['draft','reviewing','unlocked','pending'].includes(ws.status), mediaFail:S.state.demo.mediaFail});
    if(!ws) data.meta.pagesTarget = 0;
    const sig = JSON.stringify(data.items)+e.prevKind+(e.split)+(c.ex?c.ex.id:'')+e.prevAns+(e.focus);
    if(!force && host.__sig===sig){ if(host.__api) host.__api.setCur(c.ex?c.ex.id:null, false); return; }
    host.__sig = sig;
    const scrollEl = document.getElementById('ed-right'); const top = scrollEl.scrollTop;
    const tmp = document.createElement('div'); tmp.style.cssText='position:absolute;visibility:hidden;left:0;right:0;top:0'; host.parentNode.appendChild(tmp);
    const api = WSV.mount(tmp, data, {mini:true, cur:null, scrollEl, onEdit:id=>{ const it=ws&&ws.items.find(i=>i.exerciseId===id); if(it){ E().sel=it.id; E().lastSel=it.id; E().editQ=null; E().selQ=[]; WS.App.render(); } },
      onBreak:id=>{ const it=ws&&ws.items.find(i=>i.exerciseId===id); if(it) setItem(it.id, 'breakBefore', !it.breakBefore); }, onPages:p=>{ const old=E().pageInfo; E().pageInfo=p; if(!old||old.pages!==p.pages||old.target!==p.target){ const pb=document.getElementById('ed-pbar'); if(pb) pb.innerHTML=prevBarHTML(ctx()); } }});
    if(e.prevAns && e.prevKind==='teacher') api.setAnswers(true);
    if(host.__api) host.__api.destroy();
    host.innerHTML=''; tmp.style.cssText=''; host.appendChild(tmp); host.__api = api;
    scrollEl.scrollTop = top;
    const changedEx = host.__lastEx !== (c.ex&&c.ex.id); host.__lastEx = c.ex&&c.ex.id;
    if(c.ex){ api.setCur(c.ex.id, changedEx); }
  }, force?0:90);
}

/* ---------- keyboard ---------- */
document.addEventListener('keydown', ev => {
  const r = WS.App.route.name; if(r!=='editor' && r!=='exercise') return; if(document.querySelector('.overlay')) return;
  const c = ctx(); const t = ev.target; const inInput = t.matches && t.matches('input,textarea,select');
  if((ev.ctrlKey||ev.metaKey) && ev.key==='Enter' && c.ex){ ev.preventDefault(); if(inInput) t.blur(); setTimeout(()=>A.done(c.ex.id, c.ws&&c.ws.id),0); return; }
  if((ev.ctrlKey||ev.metaKey) && ev.shiftKey && (ev.key==='A'||ev.key==='a') && c.ws){ ev.preventDefault(); A.approve(c.ws.id); return; }
  if((ev.ctrlKey||ev.metaKey) && ev.shiftKey && (ev.key==='R'||ev.key==='r') && c.ws){ ev.preventDefault(); A.returnWs(c.ws.id); return; }
  if(inInput){
    if(ev.key==='Enter' && t.dataset.c==='qField' && !ev.shiftKey){ ev.preventDefault(); const qid=t.dataset.q; t.blur(); setTimeout(()=>{ const ex=ctx().ex; const i=ex.draft.questions.findIndex(q=>q.id===qid); const nx=ex.draft.questions[i+1]; E().editQ = nx?nx.id:null; WS.App.render(); if(nx) setTimeout(()=>{ const f=document.querySelector(`[data-q="${nx.id}"][data-c="qField"]`); if(f) f.focus(); },20); },0); }
    if(ev.key==='Escape' && E().editQ){ t.blur(); E().editQ=null; WS.App.render(); }
    if(t.dataset.fk) S.session.ui.lastInput = t.dataset.fk;
    return;
  }
  if(!c.ex) return;
  if((ev.ctrlKey||ev.metaKey) && (ev.key==='z'||ev.key==='Z')){ ev.preventDefault(); ev.shiftKey?A.redoEx(c.ex.id, c.ws&&c.ws.id):A.undoEx(c.ex.id, c.ws&&c.ws.id); }
  else if((ev.ctrlKey||ev.metaKey) && (ev.key==='y'||ev.key==='Y')){ ev.preventDefault(); A.redoEx(c.ex.id, c.ws&&c.ws.id); }
  else if(ev.altKey && (ev.key==='n'||ev.key==='N')){ ev.preventDefault(); WS.ACT.qAdd(); }
  else if(ev.key==='Escape'){ E().editQ=null; E().selQ=[]; WS.App.render(); }
});
document.addEventListener('mousedown', ev => { if(ev.target.closest && ev.target.closest('.vchip')) ev.preventDefault(); });
document.addEventListener('focusin', ev => { const t=ev.target; if(t.dataset && t.dataset.fk && t.matches('input,textarea')) S.session.ui.lastInput = t.dataset.fk; });

/* drag & drop reorder of questions (B4) */
let dragQ = null;
document.addEventListener('dragstart', ev => { const q = ev.target.closest && ev.target.closest('#qlist .q'); if(!q) return; dragQ = q.dataset.qid; ev.dataTransfer.effectAllowed='move'; try{ ev.dataTransfer.setData('text/plain', dragQ); }catch(e){} });
document.addEventListener('dragover', ev => { const q = ev.target.closest && ev.target.closest('#qlist .q'); if(!q||!dragQ) return; ev.preventDefault(); document.querySelectorAll('#qlist .q.dragover').forEach(x=>x.classList.remove('dragover')); q.classList.add('dragover'); });
document.addEventListener('drop', ev => { const q = ev.target.closest && ev.target.closest('#qlist .q'); if(!q||!dragQ) return; ev.preventDefault(); const from=dragQ, to=q.dataset.qid; dragQ=null; if(from===to) return; moveQ(from, to); });
document.addEventListener('dragend', () => { dragQ=null; document.querySelectorAll('.dragover').forEach(x=>x.classList.remove('dragover')); });
function moveQ(from, to){ const c=ctx(); A.editEx(c.ex.id, d=>{ const i=d.questions.findIndex(q=>q.id===from), j=d.questions.findIndex(q=>q.id===to); const [m]=d.questions.splice(i,1); d.questions.splice(j,0,m); }, {wsId:c.ws&&c.ws.id, label:'Đổi thứ tự câu'}); }

/* ---------- helpers for actions ---------- */
const edit = (mut, label) => { const c=ctx(); return A.editEx(c.ex.id, mut, {wsId:c.ws&&c.ws.id, label}); };
const findQ = (d, id) => d.questions.find(q=>q.id===id);
const splitList = (s, sep) => String(s).split(sep).map(x=>x.trim()).filter(Boolean);
const newQuestion = (ex) => {
  const id=U.uid('q');
  switch(ex.type){
    case 'mcq': return {id, stem:'', options:[{id:'o0',text:''},{id:'o1',text:''},{id:'o2',text:''}], correctId:'o0', explanation:''};
    case 'fill_blank': return {id, text:'___', accepted:[], explanation:''};
    case 'word_form': return {id, text:'___', baseWord:'', accepted:[], explanation:''};
    case 'matching': return {id, left:'', right:'', explanation:''};
    case 'ordering': return {id, items:['word'], shuffle:[0], punct:'.', explanation:''};
    case 'tfng': return {id, statement:'', answer:'T', explanation:''};
    case 'rewrite': return {id, original:'', lead:'', accepted:[], explanation:''};
    case 'short_answer': return {id, question:'', accepted:[], maxWords:5, explanation:''};
  }
};
const {diffHTML, qText, exText} = UI;
const LOADING = `<div class="muted" aria-live="polite" style="padding:24px 0">Đang tạo phương án…</div>`;

function setItem(itId, k, v){ const ws=ctx().ws; if(!ws || !A.wsEditGuard(ws)) return; const it=ws.items.find(i=>i.id===itId); if(!it) return;
  S.commit(()=>{ it[k]=v; WS.audit(k==='breakBefore'?(v?'Ngắt trang trước bài':'Bỏ ngắt trang trước bài'):(v?'Giữ trọn bài trên một trang':'Cho phép tách bài sang trang sau'),'worksheet',ws.id); }); }
/* ---------- actions ---------- */
const rer = () => WS.App.render();
Object.assign(WS.ACT, {
  drawerToggle: () => { const e=E(); e.drawer.open=!e.drawer.open; rer(); },
  drawerTab: el => { const e=E(); e.drawer.open=true; e.drawer.tab=el.dataset.t; rer(); },
  tocOpen: (el, ev) => { if(ev.target.closest('button')) return; E().sel=el.dataset.it; E().lastSel=el.dataset.it; E().editQ=null; E().selQ=[]; rer(); },
  tocBack: () => { E().sel=null; E().editQ=null; rer(); },
  exNav: el => { const c=ctx(); const i=c.ws.items.indexOf(c.item)+(+el.dataset.d); const it=c.ws.items[i]; if(it){ E().sel=it.id; E().lastSel=it.id; E().editQ=null; E().selQ=[]; rer(); } },
  tocMv: el => A.moveItem(E().wsId, el.dataset.it, +el.dataset.d),
  tocDel: el => A.removeItem(E().wsId, el.dataset.it),
  pinUpd: el => A.pinUpdate(E().wsId, el.dataset.it, el.dataset.m),
  tocAdd: () => { const c=ctx(); const ws=c.ws; if(!A.wsEditGuard(ws, ()=>WS.ACT.tocAdd())) return; const lesson=Q.lesson(ws.scope.lessonIds[0]);
    UI.modal({title:'Thêm bài mới vào phiếu', sub:'Sinh bài mới bằng AI giả lập trong phạm vi lesson của phiếu.', body:`<div class="grid" style="grid-template-columns:1fr 100px 120px;gap:8px"><select class="inp" id="nb-type" aria-label="Loại bài">${WS.TYPE_ORDER.map(t=>{const a=AI.available(lesson,t); return `<option value="${t}" ${a.ok?'':'disabled'}>${esc(WS.TYPES[t].label)}${a.ok?'':' (thiếu dữ liệu)'}</option>`;}).join('')}</select><input class="inp" id="nb-n" type="number" value="4" min="1" aria-label="Số câu"><select class="inp" id="nb-d" aria-label="Độ khó"><option value="easy">Dễ</option><option value="medium" selected>Vừa</option><option value="hard">Khó</option></select></div><div class="field" style="margin-top:8px"><label for="nb-note">Ghi chú cho AI</label><input class="inp" id="nb-note" placeholder="ví dụ: ngắn gọn"></div>`,
      buttons:[{label:'Hủy', kind:'ghost'}, {label:'Sinh và thêm', kind:'primary', onClick:(m,close)=>{ const type=m.querySelector('#nb-type').value, n=+m.querySelector('#nb-n').value, std=Q.standard(type); if(n<std.minQ||n>std.maxQ){ UI.toast(`Không thể thêm vì số câu ${n} ngoài giới hạn ${std.minQ}–${std.maxQ} của ${std.id}.`,{err:true}); return false; }
        close(); WS.runGeneration(ws.id, [{type, count:n, difficulty:m.querySelector('#nb-d').value, note:m.querySelector('#nb-note').value, explanations:true, layout:S.state.layoutDefaults[type]||'L1'}], {lessonId:ws.scope.lessonIds[0], multi:false, extra:[], themeId:ws.themeId}); UI.toast('Đang sinh bài mới…'); return false; }}]}); },
  tocLib: () => { const ws=ctx().ws; if(!A.wsEditGuard(ws, ()=>WS.ACT.tocLib())) return; WS.openLibPicker(ws); },
  wsTitle: el => { const ws=ctx().ws; if(!A.wsEditGuard(ws)) return rer(); S.commit(()=>{ const old=ws.title; ws.title=el.value.trim()||old; WS.audit('Đổi tên phiếu','worksheet',ws.id,{before:old, after:ws.title}); }); },
  wsCfg: () => { location.hash='#/soan?ws='+E().wsId; },
  wsAct: el => { const id=E().wsId, a=el.dataset.act;
    ({submit:()=>A.submit(id), withdraw:()=>A.withdraw(id), startReview:()=>A.startReview(id), release:()=>A.release(id), return:()=>A.returnWs(id), approve:()=>A.approve(id), unlock:()=>A.unlock(id), finishUnlock:()=>A.finishUnlock(id), download:()=>WS.openExport(Q.ws(id))})[a](); },
  wsMenu: el => { const c=ctx(); const ws=c.ws, me=c.me; const appr=['approved','published'].includes(ws.status);
    UI.menu(el, [
      {label:'Nhân bản phiếu', icon:'⧉', onClick:()=>{ let nw; S.commit(st=>{ st.counters.ws++; nw=U.clone(ws); nw.id='ws'+st.counters.ws+'-'+Math.random().toString(36).slice(2,5); nw.code='WS-'+String(st.counters.ws).padStart(4,'0'); nw.title=ws.title+' (bản sao)'; nw.authorId=me.id; nw.status='draft'; nw.versions=[]; nw.versionNo=1; nw.reviewerId=null; nw.unlock=null; nw.returned=null; nw.exportedAt=null; nw.publishedVersion=null; nw.items.forEach(i=>i.id=U.uid('it')); nw.createdAt=nw.updatedAt=Date.now(); st.worksheets.push(nw); WS.audit('Nhân bản phiếu','worksheet',nw.id,{note:'từ '+ws.code}); }); location.hash='#/phieu/'+nw.id; UI.toast('Đã nhân bản phiếu.'); }},
      {label:'Lịch sử phiếu', icon:'🕘', onClick:()=>{ E().drawer={open:true, tab:'hist'}; rer(); }},
      {label:'Cài đặt phiếu', icon:'⚙', onClick:()=>wsSettings(ws)},
      {label:'Tìm và thay thế', icon:'⌕', disabled:!R.canEditWs(ws,me).ok, reason:R.canEditWs(ws,me).reason, onClick:()=>findReplace(ws)},
      {label:'Tạo lại toàn phiếu (bài chưa Done)', icon:'↻', disabled:!R.canEditWs(ws,me).ok, reason:R.canEditWs(ws,me).reason, onClick:()=>regenWs(ws)},
      {sep:true},
      {label:'Xem trước bản giáo viên', icon:'⛶', onClick:()=>location.hash=`#/xem/${ws.id}?kind=teacher`},
      {label:'Xem như học sinh', icon:'👁', onClick:()=>location.hash=`#/xem/${ws.id}?kind=student`},
      {label:'Xuất JSON có cấu trúc', icon:'{ }', disabled:!appr, reason:'Chỉ tải được khi phiếu đã duyệt cấp 2.', onClick:()=>{ U.download(`${ws.code}_v${ws.versionNo}.json`, JSON.stringify(EX.json(ws),null,2), 'application/json'); WS.audit('Xuất JSON','worksheet',ws.id); S.persistSoon(); }},
      {label:'Đẩy sang hệ thống chuyên dụng (mô phỏng)', icon:'⇪', disabled:!appr || me.role==='admin', reason:'Chỉ đẩy được khi phiếu đã duyệt cấp 2.', onClick:()=>WS.pushApi(ws)},
      {label:'Lưu trữ phiếu', icon:'🗄', disabled:!R.can('archive',ws,me).ok, reason:R.can('archive',ws,me).reason, onClick:()=>A.archiveWs(ws.id)}
    ], {alignRight:true}); },
  retrySave: () => { S.state.demo.netFail=false; S.persist(); S.emit(); UI.toast('Đã lưu lại thành công.'); },
  /* exercise-level */
  exTitle: el => edit(d=>{ d.title=el.value.trim()||d.title; }, 'Sửa tiêu đề bài'),
  exInstr: el => edit(d=>{ d.instruction=el.value; }, 'Sửa hướng dẫn'),
  exPassage: el => { const c=ctx(); edit(d=>{ d.passage=el.value; if(c.ex.type==='cloze_mcq'){ const gaps=(el.value.match(/\{(\d+)\}/g)||[]).map(g=>+g.slice(1,-1)); gaps.forEach(n=>{ if(!d.questions.some(q=>q.n===n)) d.questions.push({id:U.uid('q'), n, options:['','',''], correctIdx:0, explanation:''}); }); d.questions.sort((a,b)=>a.n-b.n); } }, 'Sửa đoạn văn'); },
  exBank: el => edit(d=>{ d.wordBank=splitList(el.value, ','); }, 'Sửa khung từ'),
  exExtra: el => edit(d=>{ d.extraRight=splitList(el.value, ','); }, 'Sửa mục nhiễu'),
  exExplOn: el => edit(d=>{ d.explanationsOn=el.checked; }, 'Bật/tắt giải thích'),
  exLay: el => { const c=ctx(); edit(d=>{ d.layout=el.dataset.l; }, 'Đổi bố cục '+el.dataset.l); },
  itBrk: el => { const it=ctx().ws.items.find(i=>i.id===el.dataset.it); setItem(it.id, 'breakBefore', !it.breakBefore); },
  itKeep: el => { const c=ctx(); const it=c.ws.items.find(i=>i.id===el.dataset.it); setItem(it.id, 'keep', !window.WSV.keepOf({type:Q.ex(it.exerciseId).type, keep:it.keep})); },
  exLayKeep: () => { const e=E(); e.dismissLay=e.dismissLay||{}; e.dismissLay[ctx().ex.id]=true; rer(); },
  exDone: () => { const c=ctx(); A.done(c.ex.id, c.ws&&c.ws.id); },
  exUndo: () => { const c=ctx(); A.undoEx(c.ex.id, c.ws&&c.ws.id); }, exRedo: () => { const c=ctx(); A.redoEx(c.ex.id, c.ws&&c.ws.id); },
  exReload: () => { A.reloadEx(ctx().ex.id); UI.toast('Đã tải lại bản nháp mới nhất.'); },
  exClone: () => { const nx=A.cloneEx(ctx().ex.id, {}); UI.toast('Đã nhân bản vào kho. Bản sao là của bạn và cần Done lại.', {action:{label:'Mở bản sao', fn:()=>location.hash='#/bai/'+nx.id}}); },
  exLocal: () => { const c=ctx(); const nx=A.cloneEx(c.ex.id, {wsId:c.ws.id, replaceItemId:c.item.id, local:true}); UI.toast('Đã tạo bản riêng cho phiếu (bản gốc không đổi). Sửa xong hãy Done.'); },
  exStatus: el => A.setExStatus(ctx().ex.id, el.dataset.v),
  exUnlockSoft: () => A.forceUnlock(ctx().ex.id),
  exMenu: el => { const c=ctx(); const ex=c.ex;
    UI.menu(el, [
      {label:'Nhân bản bài vào kho', icon:'⧉', onClick:()=>WS.ACT.exClone()},
      ...(c.item&&c.item.local?[{label:'Lưu vào kho chung', icon:'⇪', onClick:()=>A.saveLocalToLib(c.ws.id, c.item.id)}]:[]),
      {label:'Lịch sử bài', icon:'🕘', onClick:()=>{ E().drawer={open:true, tab:'hist'}; rer(); }},
      {sep:true},
      {label:'Tạo ảnh', icon:'🖼', onClick:()=>genMedia('image')}, {label:'Tạo audio', icon:'🔊', onClick:()=>genMedia('audio')}, {label:'Tạo video (mô phỏng)', icon:'🎬', onClick:()=>genMedia('video')},
      {sep:true},
      {label:'Tìm và thay thế trong phiếu', icon:'⌕', disabled:!c.ws, reason:'Chỉ có trong trình soạn phiếu.', onClick:()=>findReplace(c.ws)},
      {label:'Không hài lòng / Loại', icon:'✕', onClick:()=>A.setExStatus(ex.id,'rejected')},
      {label:'Lưu trữ bài', icon:'🗄', onClick:()=>A.setExStatus(ex.id,'archived')}
    ], {alignRight:true}); },
  exRegen: () => regenExercise(),
  exRegenAns: () => { const c=ctx(); const n=c.ex.draft.questions.length; UI.confirm({title:'Chỉ tạo lại giải thích?', body:`<p>Sẽ thay: <b>giải thích của ${n} câu</b> trong "${esc(c.ex.draft.title)}". Giữ nguyên: đề, lựa chọn và đáp án.</p>`, ok:'Tạo lại giải thích'}).then(v=>{ if(!v) return; const salt=Date.now(); edit(d=>{ d.questions.forEach(q=>q.explanation=AI.explanationFor(c.ex.type,q,salt)); }, 'Tạo lại giải thích') && UI.toast('Đã tạo lại giải thích.', {undo:()=>WS.ACT.exUndo()}); }); },
  toggleAns: () => { E().openAns=!E().openAns; },
  /* question-level */
  qEdit: (el, ev) => { if(ev.target.closest('[data-a="qfix"]')) return; const c=ctx(); if(!R.canEditEx(c.ex, c.me, c.ws).ok){ const p=R.canEditEx(c.ex,c.me,c.ws); if(p.withdraw) return A.askWithdraw(c.ws, ()=>{ E().editQ=el.dataset.q; rer(); }); return UI.toast(p.reason); } E().editQ=el.dataset.q; rer(); setTimeout(()=>{ const f=document.querySelector(`[data-q="${el.dataset.q}"][data-c="qField"]`); if(f) f.focus(); },20); },
  qDone: () => { E().editQ=null; rer(); },
  qField: el => { const qid=el.dataset.q, f=el.dataset.f, val=el.value; const type=ctx().ex.type;
    edit(d=>{ const q=findQ(d,qid); if(!q) return;
      if(f.startsWith('opt:')){ const o=q.options.find(x=>x.id===f.slice(4)); if(o) o.text=val; }
      else if(f.startsWith('copt:')){ q.options[+f.slice(5)]=val; }
      else if(f==='accepted') q.accepted = splitList(val, type==='rewrite'||type==='short_answer'?'|':',');
      else if(f==='items'){ const items=val.trim().replace(/[.?!]$/,'').split(/\s+/).filter(Boolean); const p=(val.trim().match(/[.?!]$/)||[q.punct||'.'])[0]; q.items=items; q.punct=p; let sh=U.shuffle(items.map((_,i)=>i), U.rng(qid+val)); if(sh.every((v,i)=>v===i)) sh.reverse(); q.shuffle=sh; }
      else if(f==='maxWords') q.maxWords=+val||5;
      else q[f]=val; }, 'Sửa câu'); },
  qCorrect: el => edit(d=>{ findQ(d,el.dataset.q).correctId=el.dataset.v; }, 'Chọn đáp án đúng'),
  qCorrectIdx: el => edit(d=>{ findQ(d,el.dataset.q).correctIdx=+el.dataset.v; }, 'Chọn đáp án đúng'),
  qTF: el => edit(d=>{ findQ(d,el.dataset.q).answer=el.dataset.v; }, 'Chọn T/F/NG'),
  qOptAdd: el => edit(d=>{ const q=findQ(d,el.dataset.q); q.options.push({id:'o'+Date.now().toString(36), text:''}); }, 'Thêm lựa chọn'),
  qOptDel: el => edit(d=>{ const q=findQ(d,el.dataset.q); q.options=q.options.filter(o=>o.id!==el.dataset.v); if(q.correctId===el.dataset.v) q.correctId=(q.options[0]||{}).id; }, 'Xóa lựa chọn'),
  qShuffle: el => edit(d=>{ const q=findQ(d,el.dataset.q); let sh=U.shuffle(q.items.map((_,i)=>i), U.rng(Date.now())); if(sh.every((v,i)=>v===i)) sh.reverse(); q.shuffle=sh; }, 'Xáo lại'),
  qAdd: () => { const c=ctx(); if(!c.ex || c.ex.type==='cloze_mcq') return; const q=newQuestion(c.ex); if(edit(d=>{ d.questions.push(q); }, 'Thêm câu')){ E().editQ=q.id; rer(); setTimeout(()=>{ const f=document.querySelector(`[data-q="${q.id}"][data-c="qField"]`); if(f){ f.focus(); f.select && f.select(); } },30); } },
  qDup: el => { edit(d=>{ const i=d.questions.findIndex(q=>q.id===el.dataset.q); const cp=U.clone(d.questions[i]); cp.id=U.uid('q'); d.questions.splice(i+1,0,cp); }, 'Nhân bản câu'); },
  qDel: el => { const c=ctx(); const i=c.ex.draft.questions.findIndex(q=>q.id===el.dataset.q); if(edit(d=>{ d.questions.splice(i,1); }, 'Xóa câu')) UI.toast(`Đã xóa câu ${i+1}.`, {undo:()=>WS.ACT.exUndo()}); },
  qSel: el => { const e=E(); e.selQ=e.selQ||[]; if(el.checked) e.selQ.push(el.dataset.q); else e.selQ=e.selQ.filter(x=>x!==el.dataset.q); rer(); },
  bulkClear: () => { E().selQ=[]; rer(); },
  bulkDel: () => { const n=E().selQ.length; const ids=E().selQ.slice(); if(edit(d=>{ d.questions=d.questions.filter(q=>!ids.includes(q.id)); }, `Xóa ${n} câu`)){ E().selQ=[]; UI.toast(`Đã xóa ${n} câu.`, {undo:()=>WS.ACT.exUndo()}); } },
  bulkRegen: () => { const c=ctx(); const ids=E().selQ.slice(); const total=c.ex.draft.questions.length;
    UI.confirm({title:`Tạo lại ${ids.length} câu?`, body:`<p>Sẽ thay: <b>${ids.length} câu đã chọn</b> của "${esc(c.ex.draft.title)}". Giữ nguyên: ${total-ids.length} câu còn lại.</p>`, ok:'Tạo lại'}).then(async v=>{ if(!v) return; const salt=Date.now();
      const got = await Promise.all(ids.map((id,k)=>WS.services.ai.questionVariants(c.ex, id, [], 1, salt+k)));
      edit(d=>{ ids.forEach((id,k)=>{ const i=d.questions.findIndex(q=>q.id===id); const vs=got[k]; if(vs[0]) d.questions[i]=vs[0]; }); }, `Tạo lại ${ids.length} câu`); E().selQ=[]; rer(); UI.toast('Đã tạo lại các câu đã chọn.', {undo:()=>WS.ACT.exUndo()}); }); },
  bulkMove: () => { const c=ctx(); const ids=E().selQ.slice(); const targets=c.ws.items.map(it=>Q.ex(it.exerciseId)).filter(x=>x && x.id!==c.ex.id && x.type===c.ex.type);
    if(!targets.length) return UI.toast('Phiếu không có bài cùng loại để chuyển câu sang.', {err:true});
    UI.menu(document.querySelector('[data-a="bulkMove"]'), [{head:'Chuyển sang bài cùng loại'}, ...targets.map(t=>({label:t.draft.title, onClick:()=>{ const qs=c.ex.draft.questions.filter(q=>ids.includes(q.id)); if(!A.editEx(t.id, d=>{ qs.forEach(q=>d.questions.push(Object.assign(U.clone(q),{id:U.uid('q')}))); }, {wsId:c.ws.id, label:'Nhận câu chuyển sang'})) return; edit(d=>{ d.questions=d.questions.filter(q=>!ids.includes(q.id)); }, `Chuyển ${ids.length} câu`); E().selQ=[]; rer(); UI.toast(`Đã chuyển ${ids.length} câu sang "${t.draft.title}".`); }}))]); },
  qRegen: el => regenQuestion(el.dataset.q),
  qPaste: () => pasteList(),
  qfix: (el, ev) => { ev.stopPropagation(); quickFix(el); },
  qfixAns: el => { const c=ctx(); const q=findQ(c.ex.draft, el.dataset.q); edit(d=>{ const x=findQ(d, q.id); if(x.options && !x.options.find(o=>o.id===x.correctId)) x.correctId=x.options[0].id; else if('accepted' in x || ['fill_blank','word_form','rewrite','short_answer'].includes(c.ex.type)){ const src = c.ex.type==='rewrite' ? x.lead+' …' : (x.text||x.question||'').replace(/_{2,}/,'').split(/\s+/).find(w=>Q.lesson(c.ex.scope.lessonIds[0]).vocab.some(v=>v.w===w.toLowerCase())) || Q.lesson(c.ex.scope.lessonIds[0]).vocab[0].w; x.accepted=[src]; } else if(c.ex.type==='tfng') x.answer='T'; }, 'Sửa nhanh: bổ sung đáp án'); UI.toast('Đã bổ sung đáp án gợi ý. Hãy kiểm tra lại.'); },
  insWord: el => { const fk=S.session.ui.lastInput; const f=fk && document.querySelector(`[data-fk="${CSS.escape(fk)}"]`); if(!f || f.readOnly){ UI.toast('Hãy bấm vào một ô đang sửa trước, rồi bấm từ để chèn.'); return; }
    const s=f.selectionStart??f.value.length, e2=f.selectionEnd??f.value.length; const w=el.dataset.w; const before=f.value.slice(0,s); const ins=(before && !/\s$/.test(before)?' ':'')+w;
    if(/_{2,}/.test(f.value) && s===f.value.length){ f.value=f.value.replace(/_{2,}/, w); } else f.value=before+ins+f.value.slice(e2); f.dispatchEvent(new Event('change',{bubbles:true})); UI.toast(`Đã chèn "${w}".`); },
  issueGo: el => { const q=el.dataset.q; if(!q) return; E().editQ=q; rer(); setTimeout(()=>{ const r=document.querySelector(`[data-qid="${q}"]`); if(r) r.scrollIntoView({block:'center', behavior:'smooth'}); const f=document.querySelector(`[data-q="${q}"][data-c="qField"]`); if(f) f.focus(); },30); },
  verView: el => { const c=ctx(); const v=R.version(c.ex,+el.dataset.v); UI.modal({title:`Done v${v.no} · ${c.ex.draft.title}`, sub:`${esc(Q.user(v.doneBy).name)} · ${U.fmtDate(v.doneAt)}`, wide:true, body:`<pre style="white-space:pre-wrap;font-family:var(--serif);font-size:14.5px">${esc(exText(c.ex.type, v.snapshot))}</pre>`, buttons:[{label:'Đóng', kind:'primary'}]}); },
  verCmp: el => { const c=ctx(); const v=R.version(c.ex,+el.dataset.v); compareVersions(c, v); },
  verRestore: el => { const c=ctx(); const no=+el.dataset.v; UI.confirm({title:`Khôi phục v${no}?`, body:`<p>Sẽ thay: <b>toàn bộ bản nháp</b> của "${esc(c.ex.draft.title)}" bằng nội dung v${no}. Giữ nguyên: các mốc Done cũ. Bạn có thể hoàn tác.</p>`, ok:'Khôi phục'}).then(x=>{ if(x) A.restoreVersion(c.ex.id, no, c.ws&&c.ws.id); }); },
  noteAdd: el => { const c=ctx(); const tt=el.dataset.tt, id=el.dataset.id; const exId = tt==='worksheet'?null:(tt==='exercise'?id:c.ex.id);
    UI.modal({title:'Thêm note', body:`<div class="seg" style="margin-bottom:10px" id="nk"><button class="on" data-k="request">Đề nghị sửa</button><button data-k="info">Ghi chú</button></div><textarea class="inp" id="nt" rows="4" placeholder="Nội dung note"></textarea>`,
      onMount:m=>m.querySelector('#nk').addEventListener('click',e=>{ const b=e.target.closest('[data-k]'); if(!b) return; m.querySelectorAll('#nk button').forEach(x=>x.classList.toggle('on',x===b)); }),
      buttons:[{label:'Hủy', kind:'ghost'}, {label:'Thêm note', kind:'primary', onClick:(m,close)=>{ const t=m.querySelector('#nt').value.trim(); if(!t){ UI.toast('Hãy nhập nội dung note.'); return false; } A.addNote(c.ws.id, tt, id, exId, m.querySelector('#nk .on').dataset.k, t); close(); return false; }}]}); },
  noteRes: el => A.resolveNote(el.dataset.id, true), noteReopen: el => A.resolveNote(el.dataset.id, false),
  noteGo: el => { const c=ctx(); const it=c.ws.items.find(i=>i.exerciseId===el.dataset.ex); if(it){ E().sel=it.id; E().lastSel=it.id; if(el.dataset.q) E().editQ=null; rer(); if(el.dataset.q) setTimeout(()=>{ const r=document.querySelector(`[data-qid="${el.dataset.q}"]`); if(r) r.scrollIntoView({block:'center'}); },40); } },
  prevKind: el => { E().prevKind=el.dataset.v; rer(); }, prevAns: el => { E().prevAns=el.checked; rer(); },
  prevFull: () => { location.hash=`#/xem/${E().wsId}?kind=${E().prevKind}&from=editor`; },
  prevQuiz: () => { location.hash=`#/xem/${E().wsId}?kind=teacher&from=editor&quiz=1`; },
  focusMode: () => { E().focus=!E().focus; rer(); },
  pageSugg: el => pageSuggestions(el),
  /* media */
  mediaAlt: el => edit(d=>{ const m=Q.media(el.dataset.m); m.alt=el.value; }, 'Sửa alt text'),
  mediaTr: el => edit(d=>{ const m=Q.media(el.dataset.m); m.transcript=el.value; m.duration=Math.max(4,Math.round(U.wc(el.value)/2.3)); }, 'Sửa transcript'),
  mediaDel: el => { const id=el.dataset.m; if(edit(d=>{ d.media=d.media.filter(x=>x!==id); }, 'Xóa media')) UI.toast('Đã xóa media khỏi bài.', {undo:()=>WS.ACT.exUndo()}); },
  mediaRetry: el => { S.commit(()=>{ Q.media(el.dataset.m).retried=true; }); },
  mediaRegen: el => { const m=Q.media(el.dataset.m); imagePicker(m.keyword, m.id); },
  mediaPlay: el => { const m=Q.media(el.dataset.m); if(!window.speechSynthesis){ UI.toast('Trình duyệt không có giọng đọc: chế độ mô phỏng audio.'); return; } speechSynthesis.cancel(); m.transcript.split('\n').forEach((l,k)=>{ const u=new SpeechSynthesisUtterance(l.replace(/^[A-Z][\w ]{0,10}:\s*/,'')); u.lang='en-GB'; u.pitch=k%2?1.3:1; speechSynthesis.speak(u); }); UI.toast('Đang đọc thử bằng giọng trình duyệt.'); }
});

/* ---------- modals ---------- */
function regenQuestion(qid){
  const c = ctx(); const ex=c.ex; const q=findQ(ex.draft, qid); const idx=ex.draft.questions.indexOf(q); const total=ex.draft.questions.length;
  const wsIdx = c.ws ? c.ws.items.indexOf(c.item)+1 : 1; const lesson=Q.lesson(ex.scope.lessonIds[0]);
  let chips=[], salt=Date.now(), vars=[], pick=0, md=null, tok=0;
  const paint = () => { if(md) md.el.querySelector('.modal-b').innerHTML=body(); };
  const load = () => { const t=++tok; vars=[]; pick=0; paint(); WS.services.ai.questionVariants(ex,qid,chips,3,salt).then(r=>{ if(t!==tok) return; vars=r; paint(); }); };
  const body = () => `<div class="banner info" style="margin-bottom:10px">Sẽ thay: <b>Câu ${idx+1} của Bài ${wsIdx}</b>. Giữ nguyên: ${total-1} câu còn lại.</div>
    <div class="row wrap" style="margin-bottom:10px"><span class="lbl">Hướng dẫn nhanh</span>${[['easier','dễ hơn'],['shorter','ngắn hơn'],['topic','đổi chủ đề'],['keep','giữ đáp án, đổi cách diễn đạt']].map(([k,l])=>`<button class="btn sm ${chips.includes(k)?'primary':''}" data-chip="${k}">${l}</button>`).join('')}<select class="inp" style="width:150px;height:28px" data-usew aria-label="Dùng từ"><option value="">dùng từ…</option>${lesson.vocab.map(v=>`<option ${chips.includes('use:'+v.w)?'selected':''}>${esc(v.w)}</option>`).join('')}</select><button class="btn sm ghost" data-more>↻ Tạo bộ khác</button></div>
    ${vars.length?`<div class="opt-cards">${vars.map((v,k)=>`<button class="opt-card ${k===pick?'on':''}" data-pick="${k}" aria-pressed="${k===pick}"><div class="small muted">Phương án ${k+1}</div><div class="ser">${esc(qText(ex.type, v))}</div></button>`).join('')}</div>
    <div style="margin-top:12px">${diffHTML(qText(ex.type,q), qText(ex.type,vars[pick]))}</div>`:LOADING}`;
  md = UI.modal({title:`Tạo lại câu ${idx+1}`, sub:'Chọn một trong 3 phương án; các phương án còn lại sẽ bị bỏ.', xwide:true, body:body(), buttons:[{label:'Hủy', kind:'ghost'}, {label:'Thay vào phiếu', kind:'primary', onClick:(m,close)=>{ const nv=vars[pick]; if(!nv) return false; if(edit(d=>{ const i=d.questions.findIndex(x=>x.id===qid); d.questions[i]=nv; }, `Tạo lại câu ${idx+1}`)){ close(); UI.toast(`Đã thay câu ${idx+1}.`, {undo:()=>WS.ACT.exUndo()}); } return false; }}],
    onMount:m=>{ const re=()=>{ m.querySelector('.modal-b').innerHTML=body(); };
      m.addEventListener('click',e=>{ const ch=e.target.closest('[data-chip]'); const pk=e.target.closest('[data-pick]');
        if(ch){ const k=ch.dataset.chip; chips=chips.includes(k)?chips.filter(x=>x!==k):chips.concat(k); salt++; load(); }
        else if(pk){ pick=+pk.dataset.pick; re(); } else if(e.target.closest('[data-more]')){ salt+=7; load(); } });
      m.addEventListener('change',e=>{ if(e.target.matches('[data-usew]')){ chips=chips.filter(x=>!x.startsWith('use:')); if(e.target.value) chips.push('use:'+e.target.value); salt++; load(); } }); }});
  load();
}
function regenExercise(){
  const c=ctx(); const ex=c.ex; const wsIdx = c.ws ? c.ws.items.indexOf(c.item)+1 : 1; let salt=Date.now(), vars=[], pick=0, md=null, tok=0;
  const paint = () => { if(md) md.el.querySelector('.modal-b').innerHTML=body(); };
  const load = () => { const t=++tok; vars=[]; pick=0; paint(); WS.services.ai.exerciseVariants(ex,3,salt).then(r=>{ if(t!==tok) return; vars=r; paint(); }); };
  const body = () => `<div class="banner info" style="margin-bottom:10px">Sẽ thay: <b>toàn bộ ${ex.draft.questions.length} câu, tiêu đề và hướng dẫn của Bài ${wsIdx}</b>. Giữ nguyên: các bài khác, media và bố cục.</div>
    ${!vars.length?LOADING:`<div class="opt-cards">${vars.map((v,k)=>`<button class="opt-card ${k===pick?'on':''}" data-pick="${k}"><div class="small muted">Phương án ${k+1}</div><b>${esc(v.title)}</b><div class="ser small" style="margin-top:6px">${v.questions.slice(0,3).map(q=>esc(qText(ex.type,q))).join('<br>')}${v.questions.length>3?'<br>…':''}</div></button>`).join('')}</div>
    <div class="row" style="margin-top:10px"><button class="btn sm ghost" data-more>↻ Tạo bộ khác</button></div><div style="margin-top:10px">${diffHTML(exText(ex.type,ex.draft), exText(ex.type,vars[pick]))}</div>`}`;
  md = UI.modal({title:'Tạo lại bài', sub:'Chọn một trong 3 phương án.', xwide:true, body:body(), buttons:[{label:'Hủy', kind:'ghost'}, {label:'Thay vào phiếu', kind:'primary', onClick:(m,close)=>{ const nv=vars[pick]; if(!nv) return false; if(edit(d=>{ d.title=nv.title; d.instruction=nv.instruction; d.passage=nv.passage; d.questions=nv.questions; d.wordBank=nv.wordBank; d.extraRight=nv.extraRight; }, 'Tạo lại bài')){ close(); UI.toast('Đã tạo lại bài.', {undo:()=>WS.ACT.exUndo()}); } return false; }}],
    onMount:m=>m.addEventListener('click',e=>{ const pk=e.target.closest('[data-pick]'); if(pk){ pick=+pk.dataset.pick; m.querySelector('.modal-b').innerHTML=body(); } if(e.target.closest('[data-more]')){ salt+=11; load(); } })});
  load();
}
function compareVersions(c, v){
  const ex=c.ex; const cur=ex.draft, old=v.snapshot;
  const rows = old.questions.map((oq,i)=>{ const nq=cur.questions.find(q=>q.id===oq.id); const a=qText(ex.type,oq), b=nq?qText(ex.type,nq):'(đã xóa)'; return `<tr><td class="small muted">Câu ${i+1}</td><td class="small" ${a!==b?'style="background:var(--diff-del)"':''}>${esc(a)}</td><td class="small" ${a!==b?'style="background:var(--diff-add)"':''}>${esc(b)}</td><td>${a!==b?`<button class="btn xs" data-rq="${oq.id}">Khôi phục câu này</button>`:''}</td></tr>`; }).join('');
  UI.modal({title:`So sánh v${v.no} với bản nháp`, xwide:true, body:`${diffHTML(exText(ex.type,old), exText(ex.type,cur))}<h3 style="margin:14px 0 6px;font-size:14px">Khôi phục từng phần</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>v${v.no}</th><th>Bản nháp</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`,
    buttons:[{label:'Đóng', kind:'ghost'}, {label:`Khôi phục toàn bộ v${v.no}`, kind:'primary', onClick:(m,close)=>{ close(); A.restoreVersion(ex.id, v.no, c.ws&&c.ws.id); return false; }}],
    onMount:(m,close)=>m.addEventListener('click',e=>{ const b=e.target.closest('[data-rq]'); if(!b) return; const oq=old.questions.find(q=>q.id===b.dataset.rq); edit(d=>{ const i=d.questions.findIndex(q=>q.id===oq.id); if(i>=0) d.questions[i]=U.clone(oq); else d.questions.push(U.clone(oq)); }, 'Khôi phục một câu từ v'+v.no); close(); UI.toast('Đã khôi phục câu.', {undo:()=>WS.ACT.exUndo()}); })});
}
function pasteList(){
  const c=ctx(); const ex=c.ex; const hint = {mcq:'Đề | A | B* | C   (dấu * đánh dấu đáp án đúng)', fill_blank:'Câu có ___ | đáp án', word_form:'Câu có ___ | TỪ GỐC | đáp án', matching:'trái | phải', ordering:'Câu đúng thứ tự (hệ thống tự xáo)', tfng:'Nhận định | T/F/NG', rewrite:'Câu gốc | Phần mở đầu | đáp án', short_answer:'Câu hỏi | đáp án'}[ex.type];
  const parse = txt => txt.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{ const p=l.split('|').map(x=>x.trim()); const id=U.uid('q');
    switch(ex.type){
      case 'mcq': { const opts=p.slice(1).map((t,k)=>({id:'o'+k, text:t.replace(/\*$/,'').trim(), c:/\*$/.test(t)})); return {id, stem:p[0], options:opts.map(o=>({id:o.id,text:o.text})), correctId:(opts.find(o=>o.c)||opts[0]||{}).id, explanation:''}; }
      case 'fill_blank': return {id, text:/_{2,}/.test(p[0])?p[0]:p[0]+' ___', accepted:p[1]?[p[1]]:[], explanation:''};
      case 'word_form': return {id, text:p[0], baseWord:(p[1]||'').toUpperCase(), accepted:p[2]?[p[2]]:[], explanation:''};
      case 'matching': return {id, left:p[0], right:p[1]||'', explanation:''};
      case 'ordering': { const items=p[0].replace(/[.?!]$/,'').split(/\s+/); let sh=U.shuffle(items.map((_,i)=>i),U.rng(l)); if(sh.every((v,i)=>v===i)) sh.reverse(); return {id, items, shuffle:sh, punct:(p[0].match(/[.?!]$/)||['.'])[0], explanation:''}; }
      case 'tfng': return {id, statement:p[0], answer:['T','F','NG'].includes((p[1]||'').toUpperCase())?(p[1]||'').toUpperCase():'T', explanation:''};
      case 'rewrite': return {id, original:p[0], lead:p[1]||'', accepted:p[2]?[p[2]]:[], explanation:''};
      case 'short_answer': return {id, question:p[0], accepted:p[1]?[p[1]]:[], maxWords:5, explanation:''};
    } });
  UI.modal({title:'Dán danh sách câu', sub:`Mỗi dòng một câu theo mẫu: ${esc(hint)}`, wide:true, body:`<textarea class="inp" id="pl" rows="8" placeholder="${esc(hint)}"></textarea><div class="small muted" id="pl-c" style="margin-top:6px">0 câu nhận được</div>`,
    onMount:m=>m.querySelector('#pl').addEventListener('input',e=>{ m.querySelector('#pl-c').textContent=parse(e.target.value).length+' câu nhận được. Bộ kiểm tra sẽ chạy ngay sau khi thêm.'; }),
    buttons:[{label:'Hủy', kind:'ghost'}, {label:'Thêm vào bài', kind:'primary', onClick:(m,close)=>{ const qs=parse(m.querySelector('#pl').value); if(!qs.length){ UI.toast('Chưa có dòng nào để thêm.'); return false; } if(edit(d=>{ d.questions.push(...qs); }, `Dán ${qs.length} câu`)){ close(); const v=V.validate(ctx().ex); UI.toast(`Đã thêm ${qs.length} câu. Kiểm tra: ${v.errors.length} lỗi, ${v.warnings.length} cảnh báo.`, {undo:()=>WS.ACT.exUndo()}); } return false; }}]});
}
function quickFix(el){
  const c=ctx(); const w=el.dataset.w, qid=el.dataset.q, code=el.dataset.code; const lesson=Q.lesson(c.ex.scope.lessonIds[0]);
  if(!R.canEditEx(c.ex,c.me,c.ws).ok) return UI.toast(R.canEditEx(c.ex,c.me,c.ws).reason);
  const vs = lesson.vocab.filter(v=>!v.w.includes(' ')).map(v=>v.w);
  const score = x => (x[0]===w[0].toLowerCase()?2:0) + (Math.abs(x.length-w.length)<=2?1:0);
  const sugg = vs.slice().sort((a,b)=>score(b)-score(a)).slice(0,4);
  const replace = (rep) => edit(d=>{ const re=new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b', 'g');
    const fix = s => typeof s==='string' ? (rep===''?s.replace(new RegExp('\\s*\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g'),''):s.replace(re, rep)) : s;
    const targets = qid ? [findQ(d,qid)] : [];
    if(!qid) d.passage = fix(d.passage);
    targets.forEach(q=>{ Object.keys(q).forEach(k=>{ if(typeof q[k]==='string') q[k]=fix(q[k]); else if(Array.isArray(q[k])) q[k]=q[k].map(x=>typeof x==='string'?fix(x):(x&&x.text!=null?Object.assign(x,{text:fix(x.text)}):x)); }); });
  }, `Sửa nhanh: "${w}" → "${rep||'(xóa)'}"`);
  UI.menu(el, [{head:code==='V09'?`"${w}" thuộc danh sách cấm/chưa học`:`"${w}" ngoài phạm vi lesson`}, ...sugg.map(s=>({label:`Thay bằng "${s}"`, icon:'⇄', onClick:()=>{ if(replace(s)) UI.toast(`Đã thay "${w}" bằng "${s}".`, {undo:()=>WS.ACT.exUndo()}); }})), {label:'Xóa từ này', icon:'✕', onClick:()=>{ if(replace('')) UI.toast(`Đã xóa "${w}".`, {undo:()=>WS.ACT.exUndo()}); }}, {label:'Giữ nguyên (chỉ cảnh báo)', icon:'✓', onClick:()=>{}}]);
}
function genMedia(kind){
  const c=ctx(); const ex=c.ex; const lesson=Q.lesson(ex.scope.lessonIds[0]);
  if(!R.canEditEx(ex,c.me,c.ws).ok) return UI.toast(R.canEditEx(ex,c.me,c.ws).reason, {err:true});
  if(kind==='image') return imagePicker((lesson.imageKeywords||[lesson.topic])[0], null);
  if(kind==='audio'){ const def = ex.draft.passage || lesson.dialogue || ex.draft.questions.map(q=>V.textsOf({questions:[q]},ex.type).map(t=>t.text)[0]).join('\n');
    UI.modal({title:'Tạo audio', sub:'Kịch bản mặc định là nội dung bài. Dùng "A:" "B:" để có hội thoại nhiều giọng.', wide:true, body:`<textarea class="inp" id="au" rows="7">${esc(def)}</textarea><div class="row" style="margin-top:8px"><label class="lbl">Tốc độ</label><select class="inp" id="au-r" style="width:110px"><option value=".85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option></select><button class="btn sm" id="au-p">▶ Nghe thử</button><span class="small muted">${window.speechSynthesis?'Dùng giọng đọc của trình duyệt.':'Trình duyệt không có giọng đọc: chế độ mô phỏng.'}</span></div>`,
      onMount:m=>m.querySelector('#au-p').addEventListener('click',()=>{ if(!window.speechSynthesis) return UI.toast('Chế độ mô phỏng audio.'); speechSynthesis.cancel(); m.querySelector('#au').value.split('\n').forEach((l,k)=>{ const u=new SpeechSynthesisUtterance(l.replace(/^[A-Z][\w ]{0,10}:\s*/,'')); u.rate=+m.querySelector('#au-r').value; u.pitch=/^B:/.test(l)?1.35:1; u.lang='en-GB'; speechSynthesis.speak(u); }); }),
      buttons:[{label:'Hủy', kind:'ghost'}, {label:'Chọn làm bản chính thức', kind:'primary', onClick:(m,close)=>{ const t=m.querySelector('#au').value.trim(); if(!t){ UI.toast('Kịch bản audio đang trống.'); return false; } const md=AI.audioFor(t, ex.type==='short_answer'||ex.type==='tfng'?'Listen and read':'Listen'); md.rate=+m.querySelector('#au-r').value; S.state.media.push(md); edit(d=>{ d.media.push(md.id); }, 'Thêm audio'); close(); UI.toast('Đã gắn audio vào bài.'); return false; }}]}); return; }
  if(kind==='video'){ const md=AI.videoFor(ex.draft.title, (ex.draft.passage||ex.draft.instruction).slice(0,120)); S.state.media.push(md); edit(d=>{ d.media.push(md.id); }, 'Thêm video (mô phỏng)'); UI.toast('Đã gắn video mô phỏng vào bài.'); }
}
function imagePicker(keyword, replaceId){
  const c=ctx(); const lesson=Q.lesson(c.ex.scope.lessonIds[0]); let salt=Date.now(); let opts=null; let pick=0;
  const md = UI.modal({title:replaceId?'Tạo lại ảnh':'Tạo ảnh', sub:'Ảnh giả lập sinh tại chỗ từ từ khóa của lesson.', wide:true, body:`<div class="row" style="margin-bottom:10px"><input class="inp" id="ik" value="${esc(keyword)}" style="width:240px" aria-label="Từ khóa"><button class="btn sm" id="ig">Tạo 3 phương án</button></div><div id="io"><div class="muted">Đang tạo ảnh…</div></div><div class="field" style="margin-top:10px"><label for="ia">Alt text (bắt buộc)</label><input class="inp" id="ia" value="Illustration: ${esc(keyword)}"></div>`,
    buttons:[{label:'Hủy', kind:'ghost'}, {label:'Dùng ảnh này', kind:'primary', onClick:(m,close)=>{ if(!opts) return false; const alt=m.querySelector('#ia').value.trim(); if(!alt){ UI.toast('Không thể dùng ảnh vì chưa có alt text. Hãy nhập mô tả ảnh.'); return false; } const img=Object.assign(opts[pick],{alt}); S.state.media.push(img); edit(d=>{ if(replaceId){ const i=d.media.indexOf(replaceId); d.media[i]=img.id; } else d.media.push(img.id); if(!replaceId && d.layout==='L1') d.layout='L2'; }, replaceId?'Thay ảnh':'Thêm ảnh'); close(); UI.toast(replaceId?'Đã thay ảnh.':'Đã gắn ảnh vào bài.', {undo:()=>WS.ACT.exUndo()}); return false; }}],
    onMount:m=>{ const gen=()=>{ m.querySelector('#io').innerHTML='<div class="muted">Đang tạo ảnh…</div>'; setTimeout(()=>{ opts=AI.imageOptions(m.querySelector('#ik').value, lesson.vocab.map(v=>v.emoji).filter(Boolean), salt++); pick=0; draw(); }, S.state.settings.latency==='fast'?100:900); };
      const draw=()=>{ m.querySelector('#io').innerHTML=`<div class="opt-cards">${opts.map((o,k)=>`<button class="opt-card ${k===pick?'on':''}" data-p="${k}" style="padding:6px">${WSV.svgImage(o)}</button>`).join('')}</div>`; };
      m.addEventListener('click',e=>{ const b=e.target.closest('[data-p]'); if(b){ pick=+b.dataset.p; draw(); } if(e.target.id==='ig') gen(); }); gen(); }});
}
function wsSettings(ws){
  const can = R.canEditWs(ws, Q.me()).ok; const s=ws.settings;
  UI.modal({title:'Cài đặt phiếu', body:`<div class="stack">${[['cover','Trang bìa'],['classInfo','Thông tin lớp (Name, Class, Date)'],['notesArea','Vùng ghi chú'],['score','Ô điểm số']].map(([k,l])=>`<label class="switch"><input type="checkbox" data-k="${k}" ${s[k]?'checked':''} ${can?'':'disabled'}> ${l}</label>`).join('')}
    <div class="row"><div class="field"><label>Thời lượng (phút)</label><input class="inp" type="number" data-k="minutes" value="${s.minutes}" ${can?'':'disabled'}></div><div class="field"><label>Số trang A4</label><input class="inp" type="number" data-k="pages" value="${ws.pages}" ${can?'':'disabled'}></div></div></div>`,
    buttons:[{label:'Đóng', kind:'ghost'}, ...(can?[{label:'Lưu', kind:'primary', onClick:(m,close)=>{ S.commit(()=>{ m.querySelectorAll('[data-k]').forEach(i=>{ const k=i.dataset.k; if(k==='pages') ws.pages=+i.value||ws.pages; else if(k==='minutes') s.minutes=+i.value||s.minutes; else s[k]=i.checked; }); WS.audit('Sửa cài đặt phiếu','worksheet',ws.id); }); close(); return false; }}]:[])]});
}
function findReplace(ws){
  const items = ws.items.map(it=>Q.ex(it.exerciseId)).filter(ex=>ex && R.canEditEx(ex,Q.me(),ws).ok);
  const scan = (f) => { const out=[]; if(!f) return out; const re=new RegExp('\\b'+f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','gi'); items.forEach((ex,i)=>{ V.textsOf(ex.draft,ex.type).forEach(t=>{ if(re.test(t.text)) out.push({ex, t:t.text}); re.lastIndex=0; }); }); return out; };
  UI.modal({title:'Tìm và thay thế trong phiếu', wide:true, body:`<div class="row"><input class="inp" id="fr-f" placeholder="Tìm từ"><input class="inp" id="fr-r" placeholder="Thay bằng"></div><div id="fr-p" class="small muted" style="margin-top:10px">Nhập từ cần tìm để xem trước.</div>`,
    onMount:m=>m.querySelector('#fr-f').addEventListener('input',e=>{ const r=scan(e.target.value); m.querySelector('#fr-p').innerHTML = r.length?`${r.length} chỗ sẽ đổi:<br>`+r.slice(0,12).map(x=>`• ${esc(x.ex.draft.title)}: ${esc(x.t)}`).join('<br>'):'Không tìm thấy.'; }),
    buttons:[{label:'Hủy', kind:'ghost'}, {label:'Thay tất cả', kind:'primary', onClick:(m,close)=>{ const f=m.querySelector('#fr-f').value, r=m.querySelector('#fr-r').value; const hits=scan(f); if(!hits.length){ UI.toast('Không có chỗ nào để thay.'); return false; } const re=new RegExp('\\b'+f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','gi'); const exs=[...new Set(hits.map(h=>h.ex))];
      exs.forEach(ex=>A.editEx(ex.id, d=>{ const fx=s=>typeof s==='string'?s.replace(re,r):s; d.passage=fx(d.passage); d.questions.forEach(q=>Object.keys(q).forEach(k=>{ if(typeof q[k]==='string' && k!=='id') q[k]=fx(q[k]); else if(Array.isArray(q[k])) q[k]=q[k].map(x=>typeof x==='string'?fx(x):(x&&x.text!=null?Object.assign(x,{text:fx(x.text)}):x)); })); }, {wsId:ws.id, label:`Thay "${f}" → "${r}"`}));
      close(); UI.toast(`Đã thay ${hits.length} chỗ trong ${exs.length} bài.`); return false; }}]});
}
function regenWs(ws){
  const nd = ws.items.map(it=>Q.ex(it.exerciseId)).filter(ex=>ex && !R.lastDone(ex));
  UI.confirm({title:'Tạo lại toàn phiếu?', body:`<p>Sẽ thay: <b>${nd.length} bài chưa Done</b>. Giữ nguyên: ${ws.items.length-nd.length} bài đã Done.</p>`, ok:'Tạo lại'}).then(async v=>{ if(!v) return; const got = await Promise.all(nd.map((ex,k)=>WS.services.ai.exerciseVariants(ex,1,Date.now()+k))); nd.forEach((ex,k)=>{ const nv=got[k][0]; if(!nv) return; A.editEx(ex.id, d=>{ d.title=nv.title; d.instruction=nv.instruction; d.passage=nv.passage; d.questions=nv.questions; d.wordBank=nv.wordBank; }, {wsId:ws.id, label:'Tạo lại toàn phiếu'}); }); UI.toast(`Đã tạo lại ${nd.length} bài.`); });
}
function pageSuggestions(anchor){
  const c=ctx(); const ws=c.ws; const items=[];
  ws.items.forEach((it,i)=>{ const ex=Q.ex(it.exerciseId); if(!ex) return; const d=ex.draft; const n=d.questions.length; const hasImg=(d.media||[]).some(id=>{const m=Q.media(id); return m&&m.kind==='image';});
    if(d.layout==='L1' && n>=4 && ['fill_blank','word_form','mcq','tfng','matching'].includes(ex.type)) items.push({exId:ex.id, label:`Bài ${i+1}: chuyển sang hai cột (L4)`, fn:()=>A.editEx(ex.id,x=>{x.layout='L4';},{wsId:ws.id,label:'Gợi ý vừa trang: L4'})});
    if(d.layout==='L2' && !hasImg) items.push({exId:ex.id, label:`Bài ${i+1}: bỏ cột ảnh trống (L1)`, fn:()=>A.editEx(ex.id,x=>{x.layout='L1';},{wsId:ws.id,label:'Gợi ý vừa trang: bỏ cột ảnh'})});
    if(n>Q.standard(ex.type).minQ && ex.type!=='cloze_mcq') items.push({exId:ex.id, label:`Bài ${i+1}: bớt câu cuối (còn ${n-1}, tối thiểu ${Q.standard(ex.type).minQ})`, fn:()=>A.editEx(ex.id,x=>{x.questions.pop();},{wsId:ws.id,label:'Gợi ý vừa trang: bớt câu'})});
  });
  items.push({label:`Tăng số trang lên ${E().pageInfo.pages}`, oldPages:ws.pages, fn:()=>{ if(!A.wsEditGuard(ws)) return false; S.commit(()=>{ ws.pages=E().pageInfo.pages; WS.audit('Tăng số trang A4','worksheet',ws.id); }); return true; }});
  UI.menu(anchor, [{head:`Phiếu dài ${E().pageInfo.pages} trang, mục tiêu ${E().pageInfo.target}`}, ...items.slice(0,8).map(x=>({label:x.label, icon:'→', onClick:()=>{ if(x.fn()!==false) UI.toast('Đã áp dụng gợi ý.', {undo:()=>{ if(x.exId) A.undoEx(x.exId, ws.id); else S.commit(()=>{ ws.pages=x.oldPages; }); }}); }}))], {alignRight:true});
}
