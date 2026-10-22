/* ============ VIEWS: Duyệt Phiếu, Viewer, Xuất bản (7.7–7.9) ============ */
import { WS } from '../../ws.js';
const U = WS.U, Q = WS.Q, R = WS.R, S = WS.S, UI = WS.UI, A = WS.A, V = WS.V, AI = WS.AI, EX = WS.EX;
const esc = U.esc; const views = WS.views;

/* ---------- Duyệt Phiếu ---------- */
views.review = {
  render(main){
    const me=Q.me();
    if(me.role!=='l2'){ main.innerHTML=`<div class="page">${UI.empty('Mục này chỉ dành cho quản lý cấp 2','Chuyển sang Hà hoặc Quang để duyệt phiếu.')}</div>`; return; }
    const tab = S.session.ui.revTab || 'pending';
    const by = {pending:w=>w.status==='pending', reviewing:w=>w.status==='reviewing', approved:w=>['approved','published'].includes(w.status), returned:w=>w.status==='draft'&&w.returned};
    const list = S.state.worksheets.filter(by[tab]).sort((a,b)=>(a.submittedAt||0)-(b.submittedAt||0));
    const count = k => S.state.worksheets.filter(by[k]).length;
    const warn = w => w.items.reduce((n,it)=>{ const x=Q.ex(it.exerciseId); return n+(x?V.validate(x).warnings.length:0); },0);
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>Duyệt Phiếu</h1><div class="desc">Mọi quản lý đều thấy hàng chờ. Nhận xét duyệt đặt khóa độc quyền cho người xét.</div></div></div>
      <div class="seg" style="margin-bottom:12px">${[['pending','Chờ duyệt'],['reviewing','Đang xét'],['approved','Đã duyệt'],['returned','Đã trả lại']].map(([k,l])=>`<button class="${tab===k?'on':''}" data-a="revTab" data-v="${k}">${l} (${count(k)})</button>`).join('')}</div>
      ${list.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Phiếu</th><th>Người soạn</th><th>Duyệt cấp 1 lúc</th><th>Bài</th><th>Cảnh báo</th><th>Trạng thái</th><th>Thời gian chờ</th><th></th></tr></thead><tbody>
      ${list.map(w=>`<tr><td><b>${esc(w.title)}</b><div class="small muted">${esc(w.code)} · ${esc(Q.lessonShort(w.scope.lessonIds[0]))}</div></td><td>${esc(Q.user(w.authorId).name)}${w.authorId===me.id?' <span class="small muted">(bạn)</span>':''}</td><td class="small">${w.submittedAt?U.fmtDate(w.submittedAt):'—'}</td><td>${w.items.length}</td><td>${warn(w)||'—'}</td><td>${UI.wsChip(w)}</td><td class="small muted">${w.submittedAt&&tab!=='approved'?U.ago(w.submittedAt).replace(' trước',''):'—'}</td>
        <td>${w.status==='pending'?UI.btn('Nhận xét duyệt',{a:'revStart', size:'sm', kind:'primary', data:{w:w.id}}):UI.btn('Mở',{a:'go', size:'sm', data:{href:'#/phieu/'+w.id}})}</td></tr>`).join('')}</tbody></table></div>`
      : UI.empty({pending:'Không có phiếu Chờ duyệt',reviewing:'Không có phiếu Đang xét',approved:'Chưa có phiếu đã duyệt',returned:'Chưa có phiếu bị trả lại'}[tab], '')}</div>`;
  }
};
Object.assign(WS.ACT, { revTab: el => { S.session.ui.revTab=el.dataset.v; WS.App.render(); }, revStart: el => A.startReview(el.dataset.w) });

/* ---------- Viewer route ---------- */
views.viewer = {
  render(main, p){
    const ws = Q.ws(p.id); if(!ws){ main.innerHTML=`<div class="page">${UI.empty('Không tìm thấy phiếu','')}</div>`; return; }
    const kind = p.kind==='student'?'student':'teacher'; const ok=['approved','published'].includes(ws.status);
    const key = ws.id+kind+ws.updatedAt+S.state.demo.mediaFail+(S.state.exercises.reduce((n,e)=>n+(e.draft.rev||0),0));
    if(main.__vk===key && main.querySelector('.wsv')) return;
    main.__vk = key;
    if(main.__api) main.__api.destroy();
    main.innerHTML = `<div style="display:flex;flex-direction:column;height:100%"><div class="row vw-head" style="padding:8px 14px;background:var(--paper);border-bottom:1px solid var(--line)">${UI.btn(p.from==='editor'?'← Về biên tập':'← Phiếu',{a:'go', size:'sm', kind:'ghost', data:{href:p.from==='editor'?'#/phieu/'+ws.id:'#/phieu/'+ws.id}})}<b>${esc(ws.title)}</b>${UI.wsChip(ws)}<span class="spacer"></span>
      <div class="seg"><button class="${kind==='teacher'?'on':''}" data-a="go" data-href="#/xem/${ws.id}?kind=teacher${p.from?'&from='+p.from:''}">Bản giáo viên</button><button class="${kind==='student'?'on':''}" data-a="go" data-href="#/xem/${ws.id}?kind=student${p.from?'&from='+p.from:''}">Xem như học sinh</button></div>
      ${R.can('download',ws).ok?UI.btn('Tải bản chính thức',{a:'openExport', kind:'primary', size:'sm', data:{w:ws.id}}):''}</div><div id="vw" style="flex:1;min-height:0"></div></div>`;
    const data = EX.viewerData(ws, kind, {useDraft:!ok && ws.status!=='pending', mediaFail:S.state.demo.mediaFail});
    main.__api = WSV.mount(document.getElementById('vw'), data, {flag: ok?'':'Bản xem trước · chưa duyệt cấp 2', globalKeys:true, storageKey:`wsv:${ws.code}:v${ws.versionNo}:${kind}:app`});
    WS.audit('Mở viewer '+(kind==='teacher'?'bản giáo viên':'bản học sinh'),'worksheet',ws.id); S.persistSoon();
    if(p.quiz && kind==='teacher') setTimeout(()=>main.__api.quiz(), 50);
  },
  leave(){ const m=document.getElementById('main'); if(m && m.__api){ m.__api.destroy(); m.__api=null; m.__vk=null; } }
};

/* ---------- Export dialog (7.9) ---------- */
WS.openExport = (ws) => {
  const c = R.can('download', ws); if(!c.ok){ UI.toast(c.reason, {err:true, action:{label:'Xem trước', fn:()=>location.hash='#/xem/'+ws.id}}); return; }
  let kinds = {teacher:true, student:true}; let res = null;
  const body = () => `<div class="stack"><div class="small muted">Tệp HTML tự đủ, mở được khi ngoại tuyến. Mã phiếu và phiên bản có trong tên tệp và metadata.</div>
    <label class="switch"><input type="checkbox" data-k="teacher" ${kinds.teacher?'checked':''}> Bản giáo viên (có đáp án) · <code>${esc(EX.fileName(ws,'teacher'))}</code></label>
    <label class="switch"><input type="checkbox" data-k="student" ${kinds.student?'checked':''}> Bản học sinh (không chứa dữ liệu đáp án) · <code>${esc(EX.fileName(ws,'student'))}</code></label>
    <div><b class="small">Kiểm tra xuất bản</b>${res?res.checks.map(x=>`<div class="issue ${x.ok?'':'e'}" style="cursor:default"><span class="code" style="${x.ok?'background:var(--ok-soft);color:var(--ok-2)':''}">${x.ok?'Đạt':'Lỗi'}</span><span>${esc(x.label)}<br><span class="small muted">${esc(x.detail)}</span></span></div>`).join(''):'<div class="small muted">Đang chạy…</div>'}</div></div>`;
  UI.modal({title:'Tải bản chính thức', sub:`${esc(ws.code)} · v${ws.versionNo} · ${esc(ws.title)}`, wide:true, body:body(),
    buttons:[{label:'Hủy', kind:'ghost'}, {label:'Đẩy sang hệ thống chuyên dụng', kind:'', onClick:(m,cl)=>{ cl(); WS.pushApi(ws); return false; }}, {label:'Tải xuống', kind:'primary', onClick:(m,close)=>{
      const ks = Object.keys(kinds).filter(k=>kinds[k]); if(!ks.length){ UI.toast('Hãy chọn ít nhất một bản.'); return false; }
      if(!res.ok){ UI.toast('Không thể xuất vì kiểm tra xuất bản chưa đạt.', {err:true}); return false; }
      ks.forEach((k,i)=>setTimeout(()=>{ const f = k==='teacher'?res.teacher:res.student; U.download(f.name, f.html); }, i*350));
      A.markPublished(ws, ks.map(k=>k==='teacher'?'bản giáo viên':'bản học sinh')); close(); UI.toast(`Đã tải ${ks.length} tệp. Phiếu có huy hiệu Đã xuất bản · v${ws.versionNo}.`); return false; }}],
    onMount:m=>{ setTimeout(()=>{ res=EX.checks(ws); m.querySelector('.modal-b').innerHTML=body(); }, 60); m.addEventListener('change',e=>{ const k=e.target.dataset.k; if(k){ kinds[k]=e.target.checked; } }); }});
};
WS.pushApi = (ws) => {
  let attempt = 0;
  const body = (st) => `<div class="small muted">Địa chỉ (mô phỏng): <code>${esc(S.state.settings.apiUrl)}</code></div><div style="margin-top:10px">${st}</div>`;
  const md = UI.modal({title:'Đẩy sang hệ thống chuyên dụng', sub:'Mô phỏng API. Không gửi dữ liệu thật.', body:body('<div class="muted">Đang gửi…</div>'), buttons:[{label:'Đóng', kind:'ghost'}, {label:'Thử lại', kind:'primary', onClick:()=>{ send(); return false; }}]});
  const send = () => { attempt++; md.el.querySelector('.modal-b').innerHTML = body('<div class="muted">Đang gửi…</div>');
    WS.services.publish.push(ws, {attempt, netFail:S.state.demo.netFail, apiUrl:S.state.settings.apiUrl}).then(res=>{ const fail = !res.ok;
      md.el.querySelector('.modal-b').innerHTML = body(fail?`<div class="banner err">Gửi thất bại (lần ${attempt}): hệ thống đích không phản hồi (giả lập). Bấm Thử lại.</div>`:`<div class="banner ok">Đã đẩy ${esc(ws.code)} v${ws.versionNo} (lần ${attempt}). Hệ thống đích nhận diện theo mã phiếu và phiên bản nên sẽ cập nhật thay vì tạo trùng.</div>`);
      WS.audit(fail?'Đẩy API thất bại (mô phỏng)':'Đẩy API thành công (mô phỏng)','worksheet',ws.id,{note:'lần '+attempt}); S.persistSoon(); }); };
  send();
};
Object.assign(WS.ACT, { openExport: el => WS.openExport(Q.ws(el.dataset.w)) });
