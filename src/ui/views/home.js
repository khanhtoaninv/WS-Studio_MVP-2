/* ============ VIEWS: dashboard, worksheets, curriculum, standards, log, feedback, settings ============ */
import { WS } from '../../ws.js';
const U = WS.U, Q = WS.Q, R = WS.R, S = WS.S, UI = WS.UI, A = WS.A, V = WS.V;
const esc = U.esc; const views = WS.views = WS.views || {};

/* ---------- progress helpers ---------- */
const lessonStatus = R.lessonStatus, filesReady = R.lessonFilesReady;
const barHTML = (counts, total) => `<div class="bar" role="img" aria-label="${counts.ok} đã duyệt, ${counts.rev} đang duyệt, ${counts.dr} đang soạn, ${counts.none} chưa có phiếu">${['ok','rev','dr'].map(k=>counts[k]?`<span class="s-${k}" style="width:${counts[k]/total*100}%"></span>`:'').join('')}</div>`;
const countLs = list => { const c={ok:0,rev:0,dr:0,none:0}; list.forEach(ls=>c[lessonStatus(ls.id)]++); return c; };

views.home = {
  render(main){
    const me = Q.me(); const st = S.state;
    const mine = st.worksheets.filter(w=>w.authorId===me.id);
    const todo = [];
    const go = (href) => `data-a="go" data-href="${href}"`;
    if(me.role!=='admin'){
      mine.filter(w=>w.status==='draft' && w.returned).forEach(w=>todo.push({icon:'↩', cls:'orange', t:`Phiếu bị trả lại: ${w.title}`, s:`${R.openRequests(w).length} note đề nghị sửa · ${Q.user(w.returned.by).name} · ${U.ago(w.returned.at)}`, href:'#/phieu/'+w.id}));
      const dirty = st.exercises.filter(e=>e.ownerId===me.id && e.status==='active' && ['draft','dirty'].includes(R.exState(e).key));
      if(dirty.length) todo.push({icon:'●', t:`${dirty.length} bài Nháp có thay đổi chưa Done`, s:dirty.slice(0,3).map(e=>e.draft.title).join(' · '), href:'#/kho?mine=1&st=pending'});
      mine.filter(w=>w.status==='draft' && !w.returned).forEach(w=>{ const n=w.items.filter(i=>{const e=Q.ex(i.exerciseId); return e && R.exState(e).key==='done';}).length; todo.push({icon:'✎', t:`Đang soạn dở: ${w.title}`, s:`${n}/${w.items.length} bài Done · cập nhật ${U.ago(w.updatedAt)}`, href:'#/phieu/'+w.id}); });
      mine.filter(w=>w.status==='pending').forEach(w=>todo.push({icon:'⏳', t:`Đang chờ quản lý duyệt: ${w.title}`, s:`Gửi ${U.ago(w.submittedAt)}`, href:'#/phieu/'+w.id}));
    }
    if(me.role==='l2'){
      const pend = st.worksheets.filter(w=>w.status==='pending');
      if(pend.length) todo.unshift({icon:'◎', cls:'blue', t:`${pend.length} phiếu Chờ duyệt`, s:pend.map(w=>w.title).slice(0,3).join(' · '), href:'#/duyet'});
      st.worksheets.filter(w=>w.status==='reviewing' && w.reviewerId===me.id).forEach(w=>todo.unshift({icon:'👁', cls:'blue', t:`Bạn đang xét dở: ${w.title}`, s:`của ${Q.user(w.authorId).name}`, href:'#/phieu/'+w.id}));
      st.worksheets.filter(w=>w.status==='unlocked' && w.unlock && w.unlock.by===me.id).forEach(w=>todo.unshift({icon:'🔓', t:`Đang mở khóa sửa: ${w.title}`, s:w.unlock.reason, href:'#/phieu/'+w.id}));
    }
    if(me.role==='admin'){
      const all = Q.allLessons(); const miss = all.filter(x=>!filesReady(x.ls.id));
      todo.push({icon:'❖', t:`${miss.length}/${all.length} lesson chưa đủ tệp Kiến thức và Skill`, s:'Nạp tệp ở Cấu hình hệ thống › Tệp lesson', href:'#/cau-hinh?tab=files'});
      todo.push({icon:'🎨', t:`${st.themes.filter(t=>t.active).length} theme đang dùng`, s:'Quản lý kho theme cho giáo viên', href:'#/cau-hinh?tab=themes'});
    }
    const recent = st.worksheets.slice().sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,6);
    main.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Chào ${esc(me.name)}</h1><div class="desc">${esc(WS.ROLE_LABEL[me.role])} · ${new Date().toLocaleDateString('vi-VN',{weekday:'long', day:'numeric', month:'numeric'})}</div></div>
        <div class="actions">${UI.btn('Mở kho bài',{a:'go', kind:'ghost', data:{href:'#/kho'}})}${me.role==='admin'?'':UI.btn('＋ Tạo phiếu mới',{a:'go', kind:'primary', size:'lg', data:{href:'#/soan'}})}</div></div>
      <div class="grid g-main" style="align-items:start">
        <section class="card focus" aria-labelledby="h-todo"><h3 id="h-todo">Cần làm ngay</h3>
          ${todo.length?`<div class="todo">${todo.map(t=>`<button class="todo-item" ${go(t.href)}><span class="chip ${t.cls||'grey'}" aria-hidden="true">${t.icon}</span><span style="flex:1;min-width:0"><span class="t">${esc(t.t)}</span><br><span class="s">${esc(t.s)}</span></span><span aria-hidden="true" class="muted">›</span></button>`).join('')}</div>`
            : UI.empty('Không có việc tồn đọng','Bạn có thể tạo phiếu mới hoặc xem lại phiếu gần đây.')}
        </section>
        <section class="card work" aria-labelledby="h-rec"><h3 id="h-rec">Phiếu gần đây</h3><div class="stack">
          ${recent.map(w=>`<button class="ws-card" ${go('#/phieu/'+w.id)}><span class="row"><span class="ttl">${esc(w.title)}</span><span class="spacer"></span>${UI.wsChip(w)}</span><span class="small muted">${esc(Q.lessonShort(w.scope.lessonIds[0]))}</span><span class="small muted">${esc(Q.user(w.authorId).name)} · ${U.ago(w.updatedAt)} · ${w.items.length} bài</span></button>`).join('') || UI.empty('Chưa có phiếu','Bấm Tạo phiếu mới để bắt đầu.')}
        </div></section>
      </div>
      <section style="margin-top:22px" aria-labelledby="h-prog"><div class="row" style="margin-bottom:10px"><h2 id="h-prog">Giáo trình đang làm và tiến độ</h2><span class="spacer"></span>
        <div class="legend"><span><i style="background:var(--bar-ok)"></i>Đã duyệt</span><span><i style="background:var(--bar-rev)"></i>Đang duyệt</span><span><i style="background:#7FA1E8"></i>Đang soạn</span><span><i style="background:#EDEFF3;border:1px solid #DCE1E9"></i>Chưa có phiếu</span></div></div>
        <div class="grid g2">${views.home.curCards()}</div></section>
      <section style="margin-top:22px" class="card work" aria-labelledby="h-ppl"><h3 id="h-ppl">Người làm và kết quả</h3><div class="muted small" style="margin:-4px 0 10px">Kết quả tính theo số phiếu, số bài Done và tỷ lệ qua duyệt (đã duyệt / đã nộp duyệt). Cách tính đang chờ xác nhận.</div>${views.home.people()}</section>
      <section style="margin-top:22px" aria-labelledby="h-sc"><h3 id="h-sc" class="muted" style="font-size:14px;margin-bottom:8px">Thử nhanh tình huống mẫu</h3><div class="scen">
        ${[['S1 · Luồng soạn → duyệt → xuất','#/soan','lan'],['S2 · Kiểm soát chất lượng','#/soan','lan'],['S3 · Khóa và xung đột','#/phieu/ws1','lan'],['S4 · Phiếu đã khóa','#/phieu/ws4','lan'],['S5 · Kho bài','#/kho','lan'],['S6 · Viewer tương tác','#/xem/ws8','ha']].map(([t,h,u])=>`<button class="btn sm ghost" data-a="demoJump" data-href="${h}" data-u="${u}" data-s="${t.slice(0,2)}">${esc(t)}</button>`).join('')}
      </div></section></div>`;
  },
  curCards(){
    const st=S.state;
    return st.curricula.map(c=>{
      const lessons=[]; c.levels.forEach(l=>l.units.forEach(u=>u.lessons.forEach(ls=>lessons.push(ls))));
      const cnt = countLs(lessons); const wss = st.worksheets.filter(w=>w.scope.curriculumId===c.id && w.status!=='archived');
      const people = [...new Set(wss.map(w=>w.authorId))]; const upd = wss.length?Math.max(...wss.map(w=>w.updatedAt)):null;
      const open = (S.session.ui.openLv||{});
      return `<div class="cur-card"><div class="cur-head"><h3 style="margin:0">${esc(c.name)}</h3><span class="muted small">v${esc(c.version)} · ${esc(c.cefr)}</span><span class="spacer"></span>${wss.length?UI.chip('Đang làm','blue'):UI.chip('Chưa bắt đầu','grey')}</div>
        <div class="row small muted" style="margin-bottom:8px;gap:14px"><span>${wss.length} phiếu</span><span>${Math.round(cnt.ok/lessons.length*100)}% lesson đã duyệt</span><span>${upd?'cập nhật '+U.ago(upd):'chưa có hoạt động'}</span><span class="row" style="gap:3px">${people.map(p=>UI.avatar(Q.user(p),true)).join('')}</span></div>
        ${barHTML(cnt, lessons.length)}
        <div style="margin-top:10px">${c.levels.map(l=>{ const ls=[]; l.units.forEach(u=>u.lessons.forEach(x=>ls.push(x))); const cc=countLs(ls); const nws=wss.filter(w=>w.scope.levelId===l.id).length; const ready=ls.filter(x=>filesReady(x.id)).length;
          return `<div class="lvl-row" data-a="toggleLv" data-lv="${l.id}" role="button" tabindex="0" aria-expanded="${!!open[l.id]}"><span class="lvl-name"><b>${esc(l.name)}</b> <span class="muted">${esc(l.cefr)}</span></span>${barHTML(cc, ls.length)}<span class="small muted" style="text-align:right">${ls.length} lesson · ${nws} phiếu<br>${ready}/${ls.length} đủ tệp</span></div>
          ${open[l.id]?`<div class="lvl-lessons">${ls.map(x=>{ const s=lessonStatus(x.id); return `<div class="lsn-line"><span class="chip ${{ok:'green',rev:'yellow',dr:'blue',none:'lgrey'}[s]}">${{ok:'Đã duyệt',rev:'Đang duyệt',dr:'Đang soạn',none:'Chưa có phiếu'}[s]}</span><a href="#/giao-trinh?ls=${x.id}">${esc(x.code)} ${esc(x.name)}</a>${filesReady(x.id)?'<span class="small muted">· đủ tệp</span>':''}</div>`; }).join('')}</div>`:''}`; }).join('')}</div></div>`;
    }).join('');
  },
  people(){
    const st=S.state;
    const rows = WS.USERS.filter(u=>u.role!=='admin').map(u=>{
      const w = st.worksheets.filter(x=>x.authorId===u.id);
      const c = k => w.filter(x=>x.status===k).length;
      const returned = w.filter(x=>x.status==='draft'&&x.returned).length; const draft=c('draft')-returned;
      const appr = c('approved')+c('published'); const submitted = appr + c('pending') + c('reviewing') + c('unlocked') + returned;
      const rate = submitted ? Math.round(appr/submitted*100)+'%' : '—';
      const dn = st.exercises.reduce((n,e)=>n+e.versions.filter(v=>v.doneBy===u.id).length,0);
      const rv = st.audit.filter(a=>a.actorId===u.id && /^Duyệt cấp 2/.test(a.action)).length, rt = st.audit.filter(a=>a.actorId===u.id && a.action==='Trả lại').length;
      const last = st.audit.filter(a=>a.actorId===u.id).sort((a,b)=>b.at-a.at)[0];
      return `<tr><td><span class="row">${UI.avatar(u,true)} ${esc(u.name)} <span class="muted small">${WS.ROLE_SHORT[u.role]}</span></span></td><td>${w.length}</td><td>${draft}</td><td>${returned}</td><td>${c('pending')+c('reviewing')}</td><td>${appr}</td><td><b>${rate}</b></td><td>${dn}</td><td>${u.role==='l2'?`${rv} duyệt · ${rt} trả lại`:'—'}</td><td class="small muted">${last?esc(last.action)+' · '+U.ago(last.at):'—'}</td></tr>`;
    }).join('');
    return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Người</th><th>Số phiếu</th><th>Nháp</th><th>Bị trả lại</th><th>Đang duyệt</th><th>Đã duyệt cấp 2</th><th>Tỷ lệ qua duyệt</th><th>Bài Done</th><th>Vai trò duyệt</th><th>Hoạt động gần nhất</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
};
Object.assign(WS.ACT, {
  go: el => { location.hash = el.dataset.href; },
  toggleLv: el => { const o=S.session.ui.openLv=S.session.ui.openLv||{}; o[el.dataset.lv]=!o[el.dataset.lv]; WS.App.render(); }
});

/* ---------- worksheet list ---------- */
views.worksheets = {
  render(main){
    const ui = S.session.ui.wsl = S.session.ui.wsl || {scope:'mine', st:'', q:''}; const me=Q.me();
    let list = S.state.worksheets.slice().sort((a,b)=>b.updatedAt-a.updatedAt);
    if(ui.scope==='mine') list = list.filter(w=>w.authorId===me.id);
    if(ui.st) list = list.filter(w=>ui.st==='returned'?(w.status==='draft'&&w.returned):w.status===ui.st);
    if(ui.q) list = list.filter(w=>(w.title+' '+w.code).toLowerCase().includes(ui.q.toLowerCase()));
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>Phiếu</h1><div class="desc">Mọi giáo viên xem được mọi phiếu; chỉ sửa phiếu của mình khi còn Nháp.</div></div><div class="actions">${me.role==='admin'?'':UI.btn('＋ Tạo phiếu mới',{a:'go', kind:'primary', data:{href:'#/soan'}})}</div></div>
      <div class="row wrap" style="margin-bottom:12px"><div class="seg"><button class="${ui.scope==='mine'?'on':''}" data-a="wslScope" data-v="mine">Của tôi</button><button class="${ui.scope==='all'?'on':''}" data-a="wslScope" data-v="all">Tất cả</button></div>
        <select class="inp" style="width:200px" data-c="wslSt" aria-label="Lọc trạng thái"><option value="">Mọi trạng thái</option>${[['draft','Nháp'],['returned','Bị trả lại'],['pending','Chờ duyệt'],['reviewing','Đang xét'],['approved','Đã duyệt cấp 2'],['published','Đã xuất bản'],['unlocked','Mở khóa sửa'],['archived','Lưu trữ']].map(([v,l])=>`<option value="${v}" ${ui.st===v?'selected':''}>${l}</option>`).join('')}</select>
        <input class="inp" style="width:240px" placeholder="Tìm theo tên hoặc mã phiếu" value="${esc(ui.q)}" data-c="wslQ" aria-label="Tìm phiếu"></div>
      ${list.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mã</th><th>Tiêu đề</th><th>Lesson</th><th>Trạng thái</th><th>Người soạn</th><th>Bài</th><th>Cập nhật</th></tr></thead><tbody>${list.map(w=>`<tr class="click" data-a="go" data-href="#/phieu/${w.id}" tabindex="0"><td class="muted">${esc(w.code)}</td><td><b>${esc(w.title)}</b>${w.themeId?` <span class="small muted">${esc(Q.theme(w.themeId).emoji)}</span>`:''}</td><td class="small">${esc(Q.lessonShort(w.scope.lessonIds[0]))}</td><td>${UI.wsChip(w)}</td><td>${esc(Q.user(w.authorId).name)}</td><td>${w.items.length}</td><td class="small muted">${U.ago(w.updatedAt)}</td></tr>`).join('')}</tbody></table></div>`
        : UI.empty(ui.scope==='mine'?'Bạn chưa có phiếu nào ở bộ lọc này':'Không có phiếu khớp bộ lọc', 'Đổi bộ lọc hoặc tạo phiếu mới.', me.role==='admin'?'':UI.btn('＋ Tạo phiếu mới',{a:'go', kind:'primary', data:{href:'#/soan'}}))}</div>`;
  }
};
Object.assign(WS.ACT, {
  wslScope: el => { S.session.ui.wsl.scope = el.dataset.v; WS.App.render(); },
  wslSt: el => { S.session.ui.wsl.st = el.value; WS.App.render(); },
  wslQ: el => { S.session.ui.wsl.q = el.value; WS.App.render(); }
});

/* ---------- curriculum (read-only) ---------- */
views.curriculum = {
  render(main, p){
    const sel = p.ls || S.session.ui.curLs || 'ex1-l1-u1-1'; S.session.ui.curLs = sel; const x = Q.lessonCtx(sel);
    const tree = S.state.curricula.map(c=>`<details open><summary><b>${esc(c.name)}</b> <span class="muted small">v${esc(c.version)}</span></summary>${c.levels.map(l=>`<details open><summary>${esc(l.name)} <span class="muted small">${esc(l.cefr)}</span></summary>${l.units.map(u=>`<details open><summary>${esc(u.code)} ${esc(u.name)}</summary>${u.lessons.map(ls=>`<a class="leaf ${ls.id===sel?'on':''}" href="#/giao-trinh?ls=${ls.id}" ${ls.id===sel?'aria-current="true"':''}>${esc(ls.code)} ${esc(ls.name)}</a>`).join('')}</details>`).join('')}</details>`).join('')}</details>`).join('');
    let right = UI.empty('Chọn một lesson','Bấm một lesson bên trái để xem phạm vi cho phép.');
    if(x){ const ls=x.ls; const nEx=S.state.exercises.filter(e=>e.scope.lessonIds.includes(ls.id)).length, nWs=S.state.worksheets.filter(w=>w.scope.lessonIds.includes(ls.id)).length;
      right = `<div class="card"><div class="row" style="margin-bottom:6px"><h2>${esc(ls.code)} ${esc(ls.name)}</h2><span class="spacer"></span>${Q.me().role==='admin'?'':UI.btn('Soạn phiếu từ lesson này',{a:'go', kind:'primary', size:'sm', data:{href:'#/soan?ls='+ls.id}})}</div>
        <div class="muted small" style="margin-bottom:14px">${esc(x.c.name)} v${esc(x.c.version)} · ${esc(x.l.name)} (${esc(x.l.cefr)}) · ${esc(x.u.code)} ${esc(x.u.name)} · ${nEx} bài, ${nWs} phiếu đã tạo · <span class="chip outline">Dữ liệu giả lập</span></div>
        <h3>Phạm vi được phép</h3><dl class="kv">
          <dt>Mục tiêu</dt><dd><ul style="margin:0;padding-left:18px">${ls.objectives.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></dd>
          <dt>Từ vựng (${ls.vocab.length})</dt><dd class="tags">${ls.vocab.map(v=>`<span class="tag" title="${esc(v.vi)}">${esc(v.emoji)} ${esc(v.w)}</span>`).join('')}</dd>
          <dt>Ngữ pháp / cấu trúc</dt><dd>${ls.grammar.map(esc).join('<br>')}</dd>
          <dt>Kỹ năng</dt><dd>${ls.skills.join(', ')}</dd><dt>Chủ đề</dt><dd>${esc(ls.topic)}</dd>
          <dt>Cấm / chưa học</dt><dd class="tags">${ls.banned.map(b=>`<span class="tag ban">${esc(b)}</span>`).join('')}</dd>
          <dt>Đoạn văn nguồn</dt><dd>${ls.passages.map(p=>`<div class="passage">${esc(p)}</div>`).join('')}</dd>
          ${ls.dialogue?`<dt>Hội thoại</dt><dd><div class="passage">${esc(ls.dialogue)}</div></dd>`:''}
          <dt>Câu mẫu (${ls.sentenceBank.length})</dt><dd class="small">${ls.sentenceBank.map(esc).join(' · ')}</dd>
          <dt>Loại bài sinh được</dt><dd class="tags">${WS.TYPE_ORDER.map(t=>{ const a=WS.AI.available(ls,t); return `<span class="tag" ${a.ok?'':`style="opacity:.5" data-tip="${esc(a.reason)}"`}>${a.ok?'✓':'✕'} ${esc(WS.TYPES[t].label)}${a.ok?` (tối đa ${a.max})`:''}</span>`; }).join('')}</dd>
        </dl></div>`; }
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>Giáo trình</h1><div class="desc">Chỉ đọc. Admin nhập và sửa giáo trình ở Cấu hình hệ thống.</div></div></div><div class="split"><nav class="tree" aria-label="Cây giáo trình">${tree}</nav><div>${right}</div></div></div>`;
  }
};

/* ---------- standards (A1) ---------- */
views.standards = {
  render(main){
    const strict = S.state.settings.strictness; const sevOf = (code, base) => { if(['V08','V09'].includes(code) && strict!=='std') return 'e'; if(code==='V16' && strict==='max') return 'e'; return base; };
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>Tiêu chuẩn</h1><div class="desc">Chỉ xem. Mức chặn theo chế độ kiểm tra hiện tại: <b>${{std:'Chuẩn',strict:'Chặt',max:'Chặt tối đa'}[strict]}</b> (đổi ở Cài đặt).</div></div></div>
      <h3 style="margin-bottom:8px">Standard profile theo loại bài</h3>
      <div class="tbl-wrap" style="margin-bottom:22px"><table class="tbl"><thead><tr><th>Loại bài</th><th>Mã</th><th>Phiên bản</th><th>Số câu</th><th>Từ tối đa/câu</th><th>Ghi chú</th></tr></thead><tbody>
      ${S.state.standards.map(s=>`<tr><td>${UI.typeChip(s.type)}</td><td><b>${s.id}</b></td><td>${s.version}</td><td>${s.minQ}–${s.maxQ}</td><td>${s.type==='cloze_mcq'?'đoạn ≤ '+s.maxWords:s.maxWords}</td><td class="small muted">${[s.opts?`${s.opts[0]}–${s.opts[1]} lựa chọn`:'', s.requirePassage?'cần đoạn văn':'', s.maxDistractors?`tối đa ${s.maxDistractors} mục nhiễu`:'', 'bắt buộc đáp án'].filter(Boolean).join(' · ')}</td></tr>`).join('')}</tbody></table></div>
      <h3 style="margin-bottom:8px">Quy tắc kiểm tra</h3>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mã</th><th>Quy tắc</th><th>Mức hiện tại</th><th>Vì sao</th><th>Tiêu chí điểm</th></tr></thead><tbody>
      ${WS.RULES.map(([c,t,sev,why])=>{ const s=sevOf(c,sev); return `<tr><td><b>${c}</b></td><td>${esc(t)}</td><td>${s==='e'?UI.chip('Lỗi · chặn Done','red'):UI.chip('Cảnh báo','yellow')}</td><td class="small muted">${esc(why)}</td><td class="small">${WS.CRITERIA.filter(k=>k.rules.includes(c)).map(k=>k.label).join(', ')}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="muted small" style="margin-top:10px">Điểm 6 tiêu chí: xuất phát 100, trừ 25 mỗi lỗi và 8 mỗi cảnh báo thuộc tiêu chí. Đạt = không lỗi và mọi tiêu chí ≥ 70.</p></div>`;
  }
};

/* ---------- audit log ---------- */
views.log = {
  render(main){
    const f = S.session.ui.logf = S.session.ui.logf || {u:'', a:'', t:'', r:'all'};
    let list = S.state.audit.slice().sort((a,b)=>b.at-a.at);
    if(f.u) list=list.filter(x=>x.actorId===f.u); if(f.a) list=list.filter(x=>x.action.toLowerCase().includes(f.a.toLowerCase())); if(f.t) list=list.filter(x=>x.targetType===f.t);
    if(f.r!=='all'){ const lim = Date.now()-({d1:86400000, d7:7*86400000})[f.r]; list=list.filter(x=>x.at>=lim); }
    const total=list.length; list=list.slice(0,300);
    const tgt = x => { if(x.targetType==='worksheet'){ const w=Q.ws(x.targetId); return w?`<a href="#/phieu/${w.id}">${esc(w.code)} ${esc(w.title)}</a>`:esc(x.targetId); } if(x.targetType==='exercise'){ const e=Q.ex(x.targetId); return e?`<a href="#/bai/${e.id}">${esc(e.draft.title)}</a>`:esc(x.targetId); } return `<span class="muted">${esc(x.targetType)}</span>`; };
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>Nhật ký</h1><div class="desc">Chỉ thêm, không sửa hay xóa. ${total} mục khớp bộ lọc.</div></div></div>
      <div class="row wrap" style="margin-bottom:12px"><select class="inp" style="width:170px" data-c="logU" aria-label="Lọc người"><option value="">Mọi người</option>${WS.USERS.map(u=>`<option value="${u.id}" ${f.u===u.id?'selected':''}>${esc(u.name)}</option>`).join('')}</select>
        <input class="inp" style="width:220px" placeholder="Hành động (vd: Duyệt, Done)" value="${esc(f.a)}" data-c="logA" aria-label="Lọc hành động">
        <select class="inp" style="width:160px" data-c="logT" aria-label="Lọc đối tượng"><option value="">Mọi đối tượng</option>${[['worksheet','Phiếu'],['exercise','Bài'],['system','Hệ thống'],['user','Người dùng']].map(([v,l])=>`<option value="${v}" ${f.t===v?'selected':''}>${l}</option>`).join('')}</select>
        <div class="seg">${[['d1','24 giờ'],['d7','7 ngày'],['all','Tất cả']].map(([v,l])=>`<button class="${f.r===v?'on':''}" data-a="logR" data-v="${v}">${l}</button>`).join('')}</div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Thời điểm</th><th>Người</th><th>Hành động</th><th>Đối tượng</th><th>Trước → sau</th><th>Ghi chú</th></tr></thead><tbody>
      ${list.map(x=>`<tr><td class="small nowrap">${U.fmtDate(x.at)}</td><td>${esc(Q.user(x.actorId).name)}</td><td><b>${esc(x.action)}</b></td><td class="small">${tgt(x)}</td><td class="small muted">${x.before||x.after?esc((x.before||'—')+' → '+(x.after||'—')):''}</td><td class="small muted">${esc(x.note||'')}</td></tr>`).join('') || `<tr><td colspan="6">${UI.empty('Không có mục nào','Đổi bộ lọc để xem thêm.')}</td></tr>`}</tbody></table></div></div>`;
  }
};
Object.assign(WS.ACT, { logU:el=>{S.session.ui.logf.u=el.value; WS.App.render();}, logA:el=>{S.session.ui.logf.a=el.value; WS.App.render();}, logT:el=>{S.session.ui.logf.t=el.value; WS.App.render();}, logR:el=>{S.session.ui.logf.r=el.dataset.v; WS.App.render();} });

/* ---------- feedback list ---------- */
views.feedback = {
  render(main){
    const list = S.state.feedback.slice().sort((a,b)=>b.at-a.at);
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>Phản hồi đã gửi</h1><div class="desc">Đầu vào cho PRD v0.6. Gửi phản hồi bằng nút ✉ Phản hồi ở thanh trên.</div></div><div class="actions">${UI.btn('Xuất Markdown',{a:'fbMd', disabled:!list.length, reason:'Chưa có phản hồi.'})}${UI.btn('Xuất JSON',{a:'fbJson', disabled:!list.length, reason:'Chưa có phản hồi.'})}</div></div>
      ${list.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Thời điểm</th><th>Vai</th><th>Màn hình</th><th>Nội dung</th></tr></thead><tbody>${list.map(f=>`<tr><td class="small nowrap">${U.fmtDate(f.at)}</td><td>${esc(Q.user(f.userId).name)}</td><td class="small">${esc(f.context.screen)}<br><span class="muted">${esc(f.route)}${f.context.ws?' · '+esc(f.context.ws.code)+' ('+esc(f.context.ws.status)+')':''}</span></td><td>${esc(f.text)}</td></tr>`).join('')}</tbody></table></div>`
        : UI.empty('Chưa có phản hồi','Khi thử app, bấm ✉ Phản hồi ở bất kỳ màn hình nào để ghi lại chỗ khó hiểu.')}</div>`;
  }
};
Object.assign(WS.ACT, {
  fbJson: () => U.download('phan-hoi-ws-studio.json', JSON.stringify(S.state.feedback,null,2), 'application/json'),
  fbMd: () => U.download('phan-hoi-ws-studio.md', '# Phản hồi ws-studio\n\n'+S.state.feedback.map(f=>`- **${U.fmtDate(f.at)}** · ${Q.user(f.userId).name} · ${f.context.screen} (${f.route})${f.context.ws?` · ${f.context.ws.code}`:''}\n  ${f.text.replace(/\n/g,'\n  ')}`).join('\n'), 'text/markdown')
});

/* ---------- settings ---------- */
views.settings = {
  render(main){
    const s = S.state.settings;
    main.innerHTML = `<div class="page" style="max-width:820px"><div class="page-head"><div><h1>Cài đặt</h1><div class="desc">Áp dụng cho toàn bộ prototype. Mọi thay đổi được ghi nhật ký.</div></div></div>
      <div class="card stack">
        <label class="switch"><input type="checkbox" data-c="setSelf" ${s.selfApprove?'checked':''}> Cho phép quản lý cấp 2 tự duyệt phiếu mình soạn, có ghi nhật ký "tự duyệt"</label>
        <label class="switch"><input type="checkbox" data-c="setL1dl" ${s.l1Download?'checked':''}> Cấp 1 cũng được tải bản chính thức khi phiếu đã duyệt cấp 2</label>
        <div class="field"><span class="lbl">Thời gian tự nhả khóa mềm</span><div class="seg">${[[15,'15 giây (demo)'],[60,'60 giây'],[120,'120 giây']].map(([v,l])=>`<button class="${s.lockTtl===v?'on':''}" data-a="setTtl" data-v="${v}">${l}</button>`).join('')}</div></div>
        <div class="field"><span class="lbl">Độ nghiêm ngặt kiểm tra</span><div class="seg">${[['std','Chuẩn'],['strict','Chặt'],['max','Chặt tối đa']].map(([v,l])=>`<button class="${s.strictness===v?'on':''}" data-a="setStrict" data-v="${v}">${l}</button>`).join('')}</div>
          <div class="small muted">Chuẩn: chỉ chặn lỗi cấu trúc, độ khó vượt level, an toàn. Chặt: chặn thêm từ vựng/ngữ pháp ngoài phạm vi. Chặt tối đa: chặn cả chủ đề lạ.</div></div>
        <div class="field"><span class="lbl">Giao diện</span><div class="seg">${[['auto','Theo hệ thống'],['light','Sáng'],['dark','Tối']].map(([v,l])=>`<button class="${WS.App.theme()===v?'on':''}" data-a="setTheme" data-v="${v}" aria-pressed="${WS.App.theme()===v}">${l}</button>`).join('')}</div>
          <div class="small muted">Chỉ đổi giao diện app trên trình duyệt này. Tờ phiếu và tệp xuất luôn nền sáng.</div></div>
        <div class="field"><span class="lbl">Nguồn AI</span><div>${esc(WS.services.ai.label)}${WS.services.ai.kind==='claude'?'':' <span class="small muted">(chạy <code>npm run dev</code> với khóa API trong <code>.env</code> để dùng Claude)</span>'}</div></div>
        <div class="field"><span class="lbl">Độ trễ giả của AI</span><div class="seg">${[['fast','Nhanh'],['mid','Vừa'],['slow','Chậm']].map(([v,l])=>`<button class="${s.latency===v?'on':''}" data-a="setLat" data-v="${v}">${l}</button>`).join('')}</div></div>
        <div class="field"><label for="api-url">Địa chỉ API hệ thống chuyên dụng (mô phỏng)</label><input class="inp" id="api-url" value="${esc(s.apiUrl)}" data-c="setApi"></div>
      </div></div>`;
  }
};
const setS = (k, v, label) => S.commit(st=>{ st.settings[k]=v; WS.audit('Cài đặt: '+label,'system','',{after:String(v)}); });
Object.assign(WS.ACT, {
  setSelf: el=>setS('selfApprove', el.checked, 'tự duyệt'), setL1dl: el=>setS('l1Download', el.checked, 'cấp 1 tải bản chính thức'),
  setTtl: el=>setS('lockTtl', +el.dataset.v, 'thời gian nhả khóa'), setStrict: el=>setS('strictness', el.dataset.v, 'độ nghiêm ngặt'),
  setTheme: el=>{ WS.App.setTheme(el.dataset.v); WS.App.render(); },
  setLat: el=>setS('latency', el.dataset.v, 'độ trễ AI'), setApi: el=>setS('apiUrl', el.value, 'API')
});
