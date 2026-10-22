/* ============ VIEW: Soạn phiếu wizard (4 bước) + generation runner ============ */
import { WS } from '../../ws.js';
const U = WS.U, Q = WS.Q, R = WS.R, S = WS.S, UI = WS.UI, A = WS.A, V = WS.V, AI = WS.AI;
const esc = U.esc; const views = WS.views;

const newWiz = (ls) => {
  const x = ls && Q.lessonCtx(ls);
  return {step:1, cfg:{title:'', curriculumId:x?x.c.id:'', levelId:x?x.l.id:'', unitId:x?x.u.id:'', lessonId:x?x.ls.id:'', multi:false, extra:[], themeId:null, pages:2, minutes:30, note:''}, blocks:[], salt:0, manual:false, showOtherThemes:false};
};
const wiz = () => S.session.ui.wiz;
const STEPS = ['Thông tin & phạm vi','Khối bài','Bố cục','Sinh'];

function stepBar(w){
  return `<nav class="steps" aria-label="Các bước soạn phiếu">${STEPS.map((s,i)=>{ const n=i+1; const st = n<w.step?'done':n===w.step?'on':''; return `${i?'<span class="step-sep" aria-hidden="true"></span>':''}<button class="step ${st}" ${n<w.step&&w.step<4?`data-a="wzGo" data-s="${n}"`:'disabled'} ${n===w.step?'aria-current="step"':''}><span class="n">${n<w.step?'✓':n}</span>${s}</button>`; }).join('')}
    <span class="step-sep" aria-hidden="true"></span><span class="step" style="cursor:default"><span class="n">5</span>Biên tập</span><span class="step-sep" aria-hidden="true"></span><span class="step" style="cursor:default"><span class="n">6</span>Duyệt cấp 1</span></nav>`;
}
const cfgLessons = c => [c.lessonId].concat(c.multi?c.extra.filter(x=>x!==c.lessonId):[]).filter(Boolean);
/* D-133: số trang đo bằng chính viewer trên phiếu nháp dựng từ khối bài, cùng thước đo với Preview */
const measureCache = {sig:null, m:null};
function measurePlan(w){
  const c = w.cfg; const sig = JSON.stringify([cfgLessons(c), c.themeId, c.pages, c.title, w.blocks.map(b=>[b.type,b.count,b.difficulty,b.layout,b.fromLib,b.note,b.explanations,b.breakBefore,b.keep])]);
  if(measureCache.sig===sig) return measureCache.m;
  const m = window.WSV.measure(WS.EX.sampleData({title:c.title, lessonIds:cfgLessons(c), themeId:c.themeId, pages:c.pages}, w.blocks));
  measureCache.sig = sig; measureCache.m = m; return m;
}
WS.measurePlan = measurePlan;
/* Dàn nhanh bằng ước tính (AI.planBlocks) rồi chỉnh số câu theo số đo thật cho tới khi lấp 90–100% số trang */
function fitPlan(w){
  const lesson = Q.lesson(w.cfg.lessonId); const target = w.cfg.pages; let last = ''; w.short = false;
  for(let k=0;k<24;k++){
    const m = measurePlan(w);
    if(m.pages > target){
      const cands = w.blocks.filter(b=>!b.fromLib && b.count>Q.standard(b.type).minQ);
      if(cands.length){ cands.sort((a,b)=>b.count-a.count)[0].count--; last='dec'; continue; }
      const drop = dropIndex(w, lesson); if(drop>=0){ w.blocks.splice(drop,1); last='dec'; continue; }
      break;
    }
    if(m.fill < target*0.9 && last!=='dec'){
      const cands = w.blocks.filter(b=>!b.fromLib && b.count<Math.min(Q.standard(b.type).maxQ, AI.available(lesson,b.type).max));
      if(!cands.length){ w.short = true; break; }
      cands.sort((a,b)=>a.count-b.count)[0].count++; last='inc'; continue;
    }
    break;
  }
}
/* Khối bỏ được khi quá trang: khối cuối cùng mà bỏ đi không làm mục tiêu nào mất bài luyện (D-136) */
function dropIndex(w, lesson){
  if(w.blocks.length<2) return -1;
  const covered = bl => new Set(AI.coverage(lesson, bl).filter(o=>o.blocks.length).map(o=>o.i));
  const all = covered(w.blocks);
  for(let i=w.blocks.length-1;i>=0;i--){ const rest=w.blocks.filter((_,j)=>j!==i); if(covered(rest).size===all.size) return i; }
  return -1;
}
/* Bảng phủ mục tiêu lesson: mục tiêu nào đã có bài luyện, bao nhiêu câu (D-136) */
function coverageCard(w, lesson){
  const cov = AI.coverage(lesson, w.blocks); if(!cov.length) return '';
  const ok = cov.filter(o=>o.blocks.length).length;
  return `<div class="card cov-card"><div class="row"><h3 style="margin:0">Phủ mục tiêu lesson</h3><span class="spacer"></span>${UI.chip(`${ok}/${cov.length} mục tiêu có bài luyện`, ok===cov.length?'green':'orange')}</div>
    <div class="stack" style="margin-top:8px;gap:6px">${cov.map(o=>{ const n=o.blocks.reduce((a,j)=>a+(w.blocks[j].count||0),0);
      return `<div class="cov-row ${o.blocks.length?'':'miss'}" data-obj="${o.i}"><b class="muted">${o.i+1}</b><span>${esc(o.t)} <span class="small muted">· ${o.kinds.map(k=>esc(AI.KINDS[k])).join(', ')}</span></span>
        ${o.blocks.length?`<span class="small">${o.blocks.map(j=>'Bài '+(j+1)).join(', ')} · ${n} câu</span>`:`<span class="small cov-miss">Chưa có bài luyện ${UI.btn('＋ Thêm khối cho mục tiêu này',{a:'wzAddObj', size:'xs', data:{o:o.i}})}</span>`}</div>`; }).join('')}</div></div>`;
}
/* D-135: mẫu phiếu = danh sách khối (loại, số câu, độ khó, bố cục, ngắt trang, ghi chú) + số trang; không gắn lesson */
const tplVisible = () => (S.state.wsTemplates||[]).filter(t=>t.ownerId===Q.me().id || t.shared);
const tplSummary = t => t.blocks.map(b=>`${WS.TYPES[b.type].label} × ${b.count}`).join(' · ');
function applyTemplate(w, tpl){
  const lesson = Q.lesson(w.cfg.lessonId); const notes = []; const used = new Set();
  const blocks = [];
  tpl.blocks.forEach((tb,i)=>{
    let t = tb.type;
    if(!AI.available(lesson,t).ok){
      const alt = [...new Set(AI.TYPE_KINDS[t].flatMap(k=>AI.KIND_TYPES[k]))].find(x=>x!==t && AI.available(lesson,x).ok && !used.has(x) && !tpl.blocks.some(y=>y.type===x));
      if(!alt){ notes.push(`bỏ khối ${i+1} (${WS.TYPES[t].label}: lesson thiếu dữ liệu)`); return; }
      notes.push(`khối ${i+1} ${WS.TYPES[t].label} → ${WS.TYPES[alt].label}`); t = alt;
    }
    used.add(t);
    const std = Q.standard(t), av = AI.available(lesson,t);
    const count = Math.max(std.minQ, Math.min(tb.count, std.maxQ, av.max));
    if(count!==tb.count && t===tb.type) notes.push(`khối ${i+1} còn ${count} câu`);
    const layout = Q.layoutsFor(t).some(l=>l.id===tb.layout) ? tb.layout : (S.state.layoutDefaults[t]||'L1');
    blocks.push({id:U.uid('b'), type:t, count, difficulty:tb.difficulty, explanations:tb.explanations!==false, note:tb.note||'', layout, breakBefore:!!tb.breakBefore, keep:tb.keep, reason:`Theo mẫu "${tpl.name}".`});
  });
  w.blocks = blocks; w.cfg.pages = tpl.pages; w.manual = true; w.tplId = tpl.id;
  return notes;
}
WS.applyTemplate = applyTemplate;
/* Sơ đồ trang: mỗi trang A4 một ô, các bài xếp theo chiều cao thật */
function pageMap(m){
  const L = window.WSV.PAGE_LIMIT;
  return `<div class="page-map" role="img" aria-label="Sơ đồ ${m.pages} trang">${m.map.map((p,pi)=>`<div class="pm-page${p.h>L?' tall':''}"><div class="pm-head" style="height:${pi===0?Math.round((p.h-p.segs.reduce((a,s)=>a+s.h,0))/L*100):0}%"></div>${p.segs.map(sg=>`<div class="pm-seg" style="height:${Math.max(4,Math.round(sg.h/L*100))}%" title="Bài ${sg.idx+1}">${sg.idx+1}</div>`).join('')}<span class="pm-no">Trang ${pi+1}</span></div>`).join('')}</div>`;
}
function scopeCard(c){
  const x = c.lessonId && Q.lessonCtx(c.lessonId); const th = c.themeId && Q.theme(c.themeId);
  if(!x) return `<aside class="card"><h3>Phạm vi cho phép</h3>${UI.empty('Chưa chọn lesson','Chọn lần lượt Giáo trình → Level → Unit → Lesson.')}</aside>`;
  const ls=x.ls;
  return `<aside class="card" aria-label="Tóm tắt phạm vi"><h3>Phạm vi cho phép</h3><div class="small muted" style="margin-bottom:8px">${esc(Q.lessonLabel(ls.id))}${c.multi&&c.extra.length?` · +${c.extra.length} lesson`:''}</div>
    <div class="small" style="margin-bottom:6px"><b>Mục tiêu:</b> ${ls.objectives.map(esc).join('; ')}</div>
    <div class="tags" style="margin-bottom:6px">${ls.vocab.map(v=>`<span class="tag">${esc(v.w)}</span>`).join('')}</div>
    <div class="small" style="margin-bottom:6px"><b>Ngữ pháp:</b> ${ls.grammar.map(esc).join('; ')}</div>
    <div class="small" style="margin-bottom:10px"><b>Cấm/chưa học:</b> ${ls.banned.map(b=>`<span class="tag ban">${esc(b)}</span>`).join(' ')}</div>
    <div class="small"><b>Theme:</b> ${th?`${th.emoji} ${esc(th.name)} · ${esc(th.desc)}`:'Không dùng theme'}</div></aside>`;
}

views.wizard = {
  render(main, p){
    if(!wiz() || p.ls && wiz().cfg.lessonId!==p.ls && wiz().step===1 && !wiz().started) S.session.ui.wiz = newWiz(p.ls);
    if(p.ws && (!wiz().editWs || wiz().editWs!==p.ws)){ const ws=Q.ws(p.ws); if(ws){ const x=Q.lessonCtx(ws.scope.lessonIds[0]); S.session.ui.wiz = {step:1, editWs:ws.id, cfg:{title:ws.title, curriculumId:x.c.id, levelId:x.l.id, unitId:x.u.id, lessonId:x.ls.id, multi:ws.scope.lessonIds.length>1, extra:ws.scope.lessonIds.slice(1), themeId:ws.themeId, pages:ws.pages, minutes:ws.settings.minutes, note:ws.settings.note||''}, blocks:[], salt:0}; } }
    const w = wiz(); const me = Q.me();
    if(me.role==='admin' && !w.editWs){ /* admin can compose too (spec) */ }
    let body = '';
    if(w.step===1) body = step1(w); else if(w.step===2) body = step2(w); else if(w.step===3) body = step3(w); else body = step4(w);
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>${w.editWs?'Cấu hình phiếu':'Soạn phiếu mới'}</h1><div class="desc">${w.editWs?'Sửa cấu hình của phiếu đang biên tập. Bài đã Done luôn được giữ.':'Bốn bước đầu cấu hình, dàn khối, bố cục và sinh bài; hệ thống tự đề xuất, bạn duyệt rồi mới sinh.'}</div></div>
      ${w.step<4?`<div class="actions">${UI.btn('Hủy',{a:'wzCancel', kind:'ghost'})}</div>`:''}</div>${w.editWs?'':stepBar(w)}${body}</div>`;
  }
};

/* ---------- step 1 ---------- */
function step1(w){
  const c = w.cfg; const curs = S.state.curricula; const cur = Q.curriculum(c.curriculumId);
  const lvl = cur && cur.levels.find(l=>l.id===c.levelId); const unit = lvl && lvl.units.find(u=>u.id===c.unitId);
  const sel = (key, list, val, ph, dis) => `<select class="inp" data-c="wzSel" data-k="${key}" ${dis?'disabled':''} aria-label="${ph}"><option value="">${ph}</option>${list.map(o=>`<option value="${o.id}" ${o.id===val?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
  const x = c.lessonId && Q.lessonCtx(c.lessonId);
  const lvCefr = x && x.l.cefr;
  const themes = S.state.themes.filter(t=>t.active);
  const fit = themes.filter(t=>!lvCefr || t.levels.includes(lvCefr)), other = themes.filter(t=>lvCefr && !t.levels.includes(lvCefr));
  const card = (t, warn) => `<button class="theme-card ${c.themeId===t.id?'on':''}" data-a="wzTheme" data-t="${t.id}" ${warn?'data-warn="1"':''} aria-pressed="${c.themeId===t.id}"><span class="e" aria-hidden="true">${t.emoji}</span><b>${esc(t.name)}</b><span class="small muted">${esc(t.desc)}</span><span class="small muted">${esc(t.age)} tuổi · ${t.levels.join(', ')}</span>${warn?'<span class="small" style="color:var(--warn)">Khác level của lesson</span>':''}</button>`;
  const can = !!c.lessonId; const reason = !c.curriculumId?'Hãy chọn giáo trình.':!c.levelId?'Hãy chọn level.':!c.unitId?'Hãy chọn unit.':!c.lessonId?'Hãy chọn lesson.':'';
  const unitLessons = []; if(lvl) lvl.units.forEach(u=>u.lessons.forEach(l=>unitLessons.push(l)));
  const changed = w.editWs && (()=>{ const ws=Q.ws(w.editWs); return ws.themeId!==c.themeId || ws.scope.lessonIds[0]!==c.lessonId; })();
  return `<div class="wiz"><div class="card stack">
    <div class="field"><label for="wz-title">Tiêu đề phiếu</label><input class="inp" id="wz-title" data-fk="wz-title" data-c="wzTitle" value="${esc(c.title)}" placeholder="${x?esc(`Lesson ${x.ls.code} – ${x.ls.name}`):'Ví dụ: Unit 1 – Family members'}"></div>
    <div><span class="lbl">Phạm vi</span><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:8px;margin-top:5px">
      ${sel('curriculumId', curs.map(x=>({id:x.id,label:`${x.name} v${x.version}`})), c.curriculumId, 'Giáo trình')}
      ${sel('levelId', cur?cur.levels.map(l=>({id:l.id,label:`${l.name} (${l.cefr})`})):[], c.levelId, 'Level', !cur)}
      ${sel('unitId', lvl?lvl.units.map(u=>({id:u.id,label:`${u.code} ${u.name}`})):[], c.unitId, 'Unit', !lvl)}
      ${sel('lessonId', unit?unit.lessons.map(l=>({id:l.id,label:`${l.code} ${l.name}`})):[], c.lessonId, 'Lesson', !unit)}</div>
      <label class="switch" style="margin-top:8px"><input type="checkbox" data-c="wzMulti" ${c.multi?'checked':''} ${!c.lessonId?'disabled':''}> Dùng nhiều lesson (cùng level)</label>
      ${c.multi&&lvl?`<div class="tags" style="margin-top:6px">${unitLessons.filter(l=>l.id!==c.lessonId).map(l=>`<label class="tag"><input type="checkbox" data-c="wzExtra" value="${l.id}" ${c.extra.includes(l.id)?'checked':''}> ${esc(l.code)} ${esc(l.name)}</label>`).join('')}</div>`:''}</div>
    <div><span class="lbl">Theme của phiếu</span><div class="small muted" style="margin:2px 0 6px">Theme chỉ là bối cảnh, nhân vật; không thêm từ vựng hay ngữ pháp ngoài lesson.</div>
      <div class="theme-grid"><button class="theme-card ${!c.themeId?'on':''}" data-a="wzTheme" data-t="" aria-pressed="${!c.themeId}"><span class="e" aria-hidden="true">∅</span><b>Không dùng theme</b><span class="small muted">Giữ nguyên tên và ngữ cảnh của lesson</span></button>${fit.map(t=>card(t)).join('')}</div>
      ${other.length?`<details style="margin-top:8px" ${w.showOtherThemes?'open':''}><summary class="small muted" style="cursor:pointer">Theme khác level (${other.length})</summary><div class="theme-grid" style="margin-top:8px">${other.map(t=>card(t,true)).join('')}</div></details>`:''}</div>
    <div class="grid" style="grid-template-columns:160px 160px 1fr;gap:10px">
      <div class="field"><label for="wz-pages">Số trang A4</label><input class="inp" id="wz-pages" type="number" min="1" max="8" value="${c.pages}" data-c="wzPages"></div>
      <div class="field"><label for="wz-min">Thời lượng (phút)</label><input class="inp" id="wz-min" type="number" min="5" max="120" value="${c.minutes}" data-c="wzMin"></div>
      <div class="field"><label for="wz-note">Ghi chú chung</label><input class="inp" id="wz-note" value="${esc(c.note)}" data-c="wzNote" placeholder="Ví dụ: ôn tập cuối unit"></div></div>
    <div class="wiz-foot">${w.editWs?
      `${changed?'<div class="banner warn" style="flex:1">Đổi lesson hoặc theme sẽ hỏi bạn có sinh lại các bài chưa Done hay không.</div>':'<span class="spacer"></span>'}${UI.btn('Lưu cấu hình',{a:'wzSaveCfg', kind:'primary', disabled:!can, reason})}`
      :`<span class="spacer"></span>${!can?`<span class="why">${reason}</span>`:''}${UI.btn('Tiếp: Khối bài →',{a:'wzNext', kind:'primary', disabled:!can, reason})}`}</div>
  </div>${scopeCard(c)}</div>`;
}

/* ---------- step 2 ---------- */
function blockProblems(b, lesson){
  const std=Q.standard(b.type), av=AI.available(lesson,b.type);
  if(b.fromLib) return '';
  if(!av.ok) return av.reason;
  if(b.count<std.minQ || b.count>std.maxQ) return `Số câu ${b.count} ngoài giới hạn ${std.minQ}–${std.maxQ} của ${std.id}.`;
  if(b.count>av.max) return `Lesson chỉ đủ dữ liệu cho ${av.max} câu loại này.`;
  return '';
}
function fillBar(w){
  const m = measurePlan(w); const ratio = m.fill/w.cfg.pages; const pct = Math.round(ratio*100);
  return `<div class="card" style="padding:12px 16px"><div class="row small"><b>Mức lấp ${w.cfg.pages} trang A4: ${pct}%</b><span class="muted">Mục tiêu 90–100%. Đo bằng viewer trên phiếu nháp, cùng cách Preview đếm trang.</span><span class="spacer"></span>${UI.btn('↻ Dàn bộ khác',{a:'wzReplan', size:'sm'})}</div>
    <div class="fill" style="margin-top:8px" role="img" aria-label="Mức lấp ${pct}%"><span style="width:${Math.min(100,pct)}%;background:${m.pages>w.cfg.pages?'var(--warn)':pct<90?'var(--bar-dr)':'var(--ok)'}"></span><i class="mark" style="left:90%"></i><i class="mark" style="left:99.5%"></i></div>
    ${pct<90?`<div class="small" style="color:var(--warn);margin-top:6px">${w.short?'Dữ liệu lesson không đủ để lấp hết số trang; hệ thống không bơm nội dung ngoài phạm vi.':'Phiếu còn thiếu so với số trang đã chọn. Thêm khối hoặc tăng số câu.'}</div>`:m.pages>w.cfg.pages?`<div class="small" style="color:var(--warn);margin-top:6px">Phiếu đang dài ${m.pages} trang, hơn số trang đã chọn; bước Bố cục sẽ gợi ý cách thu gọn.</div>`:''}</div>`;
}
function step2(w){
  const lesson = Q.lesson(w.cfg.lessonId);
  if(!w.blocks.length && !w.manual) planNow(w);
  const types = WS.TYPE_ORDER;
  const rows = w.blocks.map((b,i)=>{
    if(b.fromLib){ const ex=Q.ex(b.fromLib); return `<div class="block-row"><b class="muted">${i+1}</b><span>${UI.typeChip(ex.type)} <b>${esc(ex.draft.title)}</b> <span class="small muted">từ kho · Done v${R.lastDone(ex).no}</span></span><span></span><span></span><span></span><span class="row">${UI.btn('↑',{a:'wzMv',size:'xs',kind:'ghost',data:{i,d:-1},aria:'Lên'})}${UI.btn('↓',{a:'wzMv',size:'xs',kind:'ghost',data:{i,d:1},aria:'Xuống'})}${UI.btn('✕',{a:'wzDel',size:'xs',kind:'ghost',data:{i},aria:'Xóa khối'})}</span></div>`; }
    const std=Q.standard(b.type), prob=blockProblems(b,lesson);
    return `<div class="block-row" ${prob?'style="border-color:var(--bd-warn);background:var(--warn-soft)"':''}><b class="muted">${i+1}</b>
      <select class="inp" data-c="wzB" data-i="${i}" data-k="type" aria-label="Loại bài khối ${i+1}">${types.map(t=>{ const av=AI.available(lesson,t); return `<option value="${t}" ${t===b.type?'selected':''} ${av.ok?'':'disabled'}>${esc(WS.TYPES[t].label)}${av.ok?'':' (thiếu dữ liệu)'}</option>`; }).join('')}</select>
      <input class="inp" type="number" min="${std.minQ}" max="${std.maxQ}" value="${b.count}" data-c="wzB" data-i="${i}" data-k="count" aria-label="Số câu" title="Tiêu chuẩn ${std.id}: ${std.minQ}–${std.maxQ} câu">
      <select class="inp" data-c="wzB" data-i="${i}" data-k="difficulty" aria-label="Độ khó">${[['easy','Dễ'],['medium','Vừa'],['hard','Khó']].map(([v,l])=>`<option value="${v}" ${b.difficulty===v?'selected':''}>${l}</option>`).join('')}</select>
      <input class="inp" value="${esc(b.note||'')}" placeholder="Ghi chú cho AI (vd: ngắn gọn, dùng từ baby)" data-c="wzB" data-i="${i}" data-k="note" aria-label="Ghi chú cho AI">
      <span class="row" style="gap:2px"><label class="small" title="Đáp án và giải thích"><input type="checkbox" data-c="wzB" data-i="${i}" data-k="explanations" ${b.explanations?'checked':''}> Giải thích</label>${UI.btn('↑',{a:'wzMv',size:'xs',kind:'ghost',data:{i,d:-1},aria:'Lên'})}${UI.btn('↓',{a:'wzMv',size:'xs',kind:'ghost',data:{i,d:1},aria:'Xuống'})}${UI.btn('✕',{a:'wzDel',size:'xs',kind:'ghost',data:{i},aria:'Xóa khối'})}</span>
      <div class="why-line">${prob?`<span style="color:var(--warn)">⚠ ${esc(prob)}</span>`:esc(b.reason||'Khối do bạn thêm.')}</div></div>`;
  }).join('');
  const bad = w.blocks.map(b=>blockProblems(b,lesson)).filter(Boolean);
  const reason = !w.blocks.length ? 'Phiếu cần ít nhất 1 khối bài.' : bad.length ? 'Còn khối chưa hợp lệ: '+bad[0] : '';
  const unusable = WS.TYPE_ORDER.filter(t=>!AI.available(lesson,t).ok);
  return `<div class="stack">${fillBar(w)}
    <div class="row"><h3>Khối bài</h3><span class="muted small">${w.manual?'Bạn đã sửa tay; hệ thống không tự dàn lại.':'Hệ thống tự dàn theo số trang. Sửa bất kỳ ô nào để dàn tay.'}</span><span class="spacer"></span>${UI.btn('Xóa hết',{a:'wzClear',size:'sm',kind:'ghost'})}${UI.btn('▤ Dùng mẫu',{a:'wzTplUse',size:'sm',kind:'ghost', title:'Dùng mẫu phiếu đã lưu (D-135)'})}${UI.btn('Lưu làm mẫu',{a:'wzTplSave',size:'sm',kind:'ghost', disabled:!w.blocks.some(b=>!b.fromLib), reason:'Chưa có khối nào để lưu'})}${UI.btn('＋ Thêm từ kho bài',{a:'wzFromLib',size:'sm'})}${UI.btn('＋ Thêm khối',{a:'wzAdd',size:'sm'})}</div>
    <div class="stack">${rows || UI.empty('Chưa có khối nào','Thêm khối hoặc bấm Dàn bộ khác để hệ thống đề xuất.')}</div>
    ${coverageCard(w, lesson)}
    ${unusable.length?`<div class="small muted">Không sinh được ở lesson này: ${unusable.map(t=>`<span data-tip="${esc(AI.available(lesson,t).reason)}" style="border-bottom:1px dotted">${esc(WS.TYPES[t].label)}</span>`).join(', ')}.</div>`:''}
    <div class="wiz-foot">${UI.btn('← Thông tin & phạm vi',{a:'wzGo', kind:'ghost', data:{s:1}})}<span class="spacer"></span>${reason?`<span class="why">${esc(reason)}</span>`:''}${UI.btn('Tiếp: Bố cục →',{a:'wzNext', kind:'primary', disabled:!!reason, reason})}</div></div>`;
}
function planNow(w){ const r = AI.planBlocks(w.cfg.lessonId, w.cfg.pages, w.salt); w.blocks = r.blocks; fitPlan(w); }

/* ---------- step 3 ---------- */
function step3(w){
  const lesson = Q.lesson(w.cfg.lessonId);
  const m = measurePlan(w); const L = window.WSV.PAGE_LIMIT;
  const est = w.blocks.map((b,i)=>(m.items[i]||{h:0}).h); const pages = m.fill; const over = m.pages > w.cfg.pages;
  const sugg = [];
  if(over){ w.blocks.forEach((b,i)=>{ if(!b.fromLib && b.layout==='L1' && ['fill_blank','word_form','mcq','tfng'].includes(b.type) && b.count>=4) sugg.push({k:'l4', i, t:`Chuyển Bài ${i+1} (${WS.TYPES[b.type].label}) sang hai cột`}); if(!b.fromLib && b.count>Q.standard(b.type).minQ) sugg.push({k:'less', i, t:`Bớt 1 câu ở Bài ${i+1} (còn ${b.count-1}, tối thiểu ${Q.standard(b.type).minQ})`}); }); sugg.push({k:'pages', t:`Tăng số trang lên ${m.pages}`}); }
  const rows = w.blocks.map((b,i)=>{
    const type = b.fromLib?Q.ex(b.fromLib).type:b.type; const sug = b.fromLib?{layout:Q.ex(b.fromLib).draft.layout, reason:'Giữ bố cục của bài trong kho.'}:AI.suggestLayout(type, {questions:new Array(b.count).fill(0), passage:['tfng','cloze_mcq','short_answer'].includes(type)?lesson.passages[0]:''}, false);
    return `<div class="block-row" style="grid-template-columns:28px 1.2fr auto 110px"><b class="muted">${i+1}</b><span>${UI.typeChip(type)} <span class="small muted">${b.fromLib?'từ kho':b.count+' câu'}</span><div class="small muted" style="margin-top:3px">Gợi ý ${sug.layout}: ${esc(sug.reason)}${b.layout==='L2'||b.layout==='L5'?' Bố cục có ảnh sẽ được tạo sẵn một ảnh minh họa.':''}</div></span>
      <span class="layout-pick" role="radiogroup" aria-label="Bố cục bài ${i+1}">${Q.layoutsFor(type).map(l=>l.id).map(L=>`<button class="lay ${b.layout===L?'on':''}" data-a="wzLay" data-i="${i}" data-l="${L}" role="radio" aria-checked="${b.layout===L}" title="${esc(Q.layout(L).name)}">${UI.layIcon(L)}${L}${sug.layout===L?' ★':''}</button>`).join('')}</span>
      <span class="small muted" style="text-align:right">${i?`<label class="small" title="Bài này bắt đầu ở trang mới (D-134)"><input type="checkbox" data-c="wzBrk" data-i="${i}" ${b.breakBefore?'checked':''}> Trang mới</label><br>`:''}≈ ${(est[i]/L).toFixed(2)} trang${m.items[i]&&m.items[i].pages.length?`<br>trang ${m.items[i].pages.map(p=>p+1).join('–')}`:''}</span></div>`;
  }).join('');
  const stds = [...new Set(w.blocks.map(b=>{ const t=b.fromLib?Q.ex(b.fromLib).type:b.type; const s=Q.standard(t); return `${s.id} v${s.version}`; }))];
  const th = w.cfg.themeId && Q.theme(w.cfg.themeId);
  return `<div class="stack"><div class="card" style="padding:12px 16px"><div class="row"><b>Ước tính ${pages.toFixed(1)} / ${w.cfg.pages} trang A4</b><span class="small muted">Đo bằng viewer, khớp số trang ở Preview.</span><span class="spacer"></span>${over?UI.chip(`Dài hơn mục tiêu: ${m.pages} trang`,'orange'):UI.chip('Vừa số trang','green')}</div>${pageMap(m)}
      ${over?`<div class="stack" style="margin-top:10px">${sugg.slice(0,5).map((s,k)=>`<div class="row small"><span>• ${esc(s.t)}</span><span class="spacer"></span>${UI.btn('Áp dụng',{a:'wzSugg', size:'xs', data:{k:s.k, i:s.i==null?'':s.i}})}</div>`).join('')}</div>`:''}</div>
    <h3>Bố cục từng bài</h3><div class="stack">${rows}</div>
    <div class="card"><h3>Tóm tắt trước khi sinh</h3><dl class="kv"><dt>Phạm vi</dt><dd>${esc(Q.lessonLabel(w.cfg.lessonId))}${w.cfg.multi&&w.cfg.extra.length?` + ${w.cfg.extra.length} lesson`:''}</dd><dt>Theme</dt><dd>${th?`${th.emoji} ${esc(th.name)}`:'Không dùng theme'}</dd>
      <dt>Danh sách bài</dt><dd>${w.blocks.map((b,i)=>{ const t=b.fromLib?Q.ex(b.fromLib).type:b.type; return `${i+1}. ${esc(WS.TYPES[t].label)}${b.fromLib?' (từ kho)':` × ${b.count} · ${({easy:'dễ',medium:'vừa',hard:'khó'})[b.difficulty]}`} · ${b.layout}`; }).join('<br>')}</dd>
      <dt>Tiêu chuẩn áp dụng</dt><dd>${stds.join(', ')}</dd><dt>Ép lỗi (demo)</dt><dd>${{off:'Tắt',fixable:'Lỗi sửa được',hard:'Lỗi cứng'}[S.state.demo.aiFault]}</dd></dl></div>
    <div class="wiz-foot">${UI.btn('← Khối bài',{a:'wzGo', kind:'ghost', data:{s:2}})}<span class="spacer"></span>${UI.btn('Duyệt bố cục và sinh',{a:'wzGen', kind:'primary', size:'lg'})}</div></div>`;
}

/* ---------- step 4 ---------- */
const STEP_NAMES = ['Xác thực cấu hình','Lấy học liệu lesson','Nạp tiêu chuẩn','Nạp theme','Sinh nội dung','Kiểm tra','Tự sửa'];
function step4(w){
  const g = S.session.gen && S.session.gen[w.wsId]; if(!g) return UI.empty('Không có tiến trình sinh','Quay lại bước trước.');
  const ws = Q.ws(w.wsId);
  return `<div class="stack"><div class="card" style="padding:12px 16px"><div class="row"><b>${g.done?'Đã sinh xong':'Đang sinh phiếu'} "${esc(ws.title)}"</b><span class="spacer"></span>
      ${g.done?UI.btn('Mở trình soạn →',{a:'go', kind:'primary', data:{href:'#/phieu/'+ws.id}}):UI.btn('Chạy nền và rời màn hình',{a:'wzBg', kind:'ghost'})}</div>
      <div class="small muted">${g.done?`${g.blocks.filter(b=>b.status==='ok'||b.status==='fixed').length}/${g.blocks.length} bài đạt kiểm tra. Bài không đạt vẫn được tạo ở trạng thái Nháp kèm lý do. <span class="gen-pages">Phiếu thật dài ${g.measure.fill.toFixed(1)} trang (${g.measure.pages}/${ws.pages} trang A4${g.measure.pages>ws.pages?', dài hơn mục tiêu: xem gợi ý ở Preview':''}).</span>`:'Bạn có thể rời màn hình; khi xong sẽ có thông báo.'}</div></div>
    <div class="prog-list" aria-live="polite">${g.blocks.map((b,i)=>`<div class="prog-item"><div class="row"><b>Bài ${i+1} · ${esc(WS.TYPES[b.type].label)}</b><span class="muted small">${b.count?b.count+' câu':''}</span><span class="spacer"></span>
      ${{wait:UI.chip('Đang chờ','grey'), run:UI.chip('Đang sinh','blue'), ok:UI.chip('Hoàn tất','green','✓'), fixed:UI.chip('Hoàn tất sau tự sửa','yellow','✓'), fail:UI.chip('Không đạt','red','✕')}[b.status]}</div>
      <div class="prog-steps">${STEP_NAMES.map((s,k)=>`<span class="ps ${b.steps[k]||''}">${s}</span>`).join('')}</div>
      ${b.log.length?`<div class="small muted" style="margin-top:6px">${b.log.map(esc).join('<br>')}</div>`:''}</div>`).join('')}</div></div>`;
}

/* ---------- generation runner ---------- */
WS.runGeneration = async (wsId, blocks, cfg) => {
  const g = S.session.gen = S.session.gen || {}; const run = g[wsId] = {done:false, blocks:blocks.map(b=>({type:b.fromLib?Q.ex(b.fromLib).type:b.type, count:b.fromLib?0:b.count, status:'wait', steps:[], log:[]}))};
  const lat = {fast:[60,120], mid:[400,900], slow:[1100,1600]}[S.state.settings.latency]||[400,900];
  const wait = () => WS.services.ai.kind==='claude' ? Promise.resolve() : U.sleep(lat[0]+Math.random()*(lat[1]-lat[0]));
  const lessons = cfgLessons(cfg); const fault = S.state.demo.aiFault;
  const ws = Q.ws(wsId);
  for(let i=0;i<blocks.length;i++){
    const b = blocks[i], st = run.blocks[i]; st.status='run'; S.emit();
    const setStep = (k, v) => { st.steps[k]=v; S.emit(); };
    if(b.fromLib){ for(let k=0;k<7;k++) st.steps[k]='ok'; st.status='ok'; st.log.push('Ghim bài từ kho (không sinh lại).'); S.commit(()=>{ const ex=Q.ex(b.fromLib); ws.items.push({id:U.uid('it'), exerciseId:ex.id, pinnedVersionNo:R.lastDone(ex).no, local:false, layout:null, breakBefore:!!b.breakBefore}); }); continue; }
    const lessonId = lessons[i % lessons.length];
    for(let k=0;k<5;k++){ setStep(k,'run'); await wait(); setStep(k,'ok'); }
    const gen = await WS.services.ai.generate(lessonId, b.type, {count:b.count, difficulty:b.difficulty, seed:wsId+'|'+i+'|'+Date.now(), themeId:cfg.themeId, layout:b.layout, note:b.note, explanations:b.explanations, blockIndex:i, focus:lessonId===cfg.lessonId?AI.blockFocus(Q.lesson(lessonId), b):[]});
    st.log.push(...gen.log);
    const lesson = Q.lesson(lessonId);
    const faultNotes = AI.injectFault(gen.draft, b.type, lesson, fault);
    if(faultNotes.length) st.log.push('Ép lỗi (demo): '+faultNotes.join('; ')+'.');
    let ex;
    S.commit(()=>{ ex = A.newExerciseFrom(lessonId, b.type, gen, {themeId:cfg.themeId}); ex.genLog = st.log; });
    setStep(5,'run'); await wait();
    let v = V.validate(ex);
    if(v.errors.length || v.issues.some(x=>x.code==='V08')){
      setStep(5,'fix'); setStep(6,'run');
      for(let round=1; round<=2; round++){
        await wait();
        const fixes = await WS.services.ai.autofix(ex, lesson);
        if(fault==='hard') AI.injectFault(ex.draft, b.type, lesson, 'hard');
        v = V.validate(ex);
        if(fixes.length) st.log.push(`Tự sửa vòng ${round}: ${fixes.join(', ')}.`);
        if(!v.errors.length && !v.issues.some(x=>x.code==='V08')) break;
      }
      if(v.errors.length){ setStep(6,'fail'); st.status='fail'; st.log.push(`Không đạt sau 2 vòng tự sửa: ${v.errors.map(e=>e.code+' '+e.msg).join(' ')} Bài được tạo ở trạng thái Nháp và chưa Done được.`); }
      else { setStep(6,'ok'); st.status='fixed'; if(v.warnings.length) st.log.push(`Còn ${v.warnings.length} cảnh báo cần xem lại.`); }
    } else { setStep(5,'ok'); st.steps[6]=''; st.status='ok'; }
    S.commit(()=>{
      if(b.layout==='L2' || b.layout==='L5'){ const kw=(lesson.imageKeywords||[lesson.topic])[0]; const opts=AI.imageOptions(kw, lesson.vocab.map(v=>v.emoji).filter(Boolean), i); const m=opts[0]; S.state.media.push(m); ex.draft.media.push(m.id); st.log.push('Đã tạo sẵn 1 ảnh minh họa cho bố cục cột ảnh.'); }
      ws.items.push({id:U.uid('it'), exerciseId:ex.id, pinnedVersionNo:null, local:false, layout:null, breakBefore:!!b.breakBefore});
      WS.audit(fault!=='off'?`Sinh bài (ép lỗi: ${fault})`:'Sinh bài (AI giả lập)','exercise',ex.id,{note:st.log.join(' ')});
    });
  }
  run.measure = window.WSV.measure(WS.EX.viewerData(ws, 'teacher', {useDraft:true}));
  run.done = true;
  S.commit(()=>{ WS.audit('Hoàn tất sinh phiếu','worksheet',wsId); WS.notify(ws.authorId, `Đã sinh xong phiếu "${ws.title}" (${run.blocks.filter(b=>b.status!=='fail').length}/${run.blocks.length} bài đạt kiểm tra).`, '#/phieu/'+wsId); });
  if(WS.App.route.name!=='wizard') UI.toast(`Đã sinh xong phiếu "${ws.title}".`, {action:{label:'Mở', fn:()=>location.hash='#/phieu/'+wsId}});
  if(run.measure.pages > ws.pages) UI.toast(`Phiếu sinh ra dài ${run.measure.pages} trang, hơn mục tiêu ${ws.pages}. Bấm huy hiệu cam ở Preview để xem gợi ý thu gọn.`);
};

/* ---------- actions ---------- */
const rer = () => WS.App.render();
Object.assign(WS.ACT, {
  wzCancel: () => { S.session.ui.wiz = null; history.length>1 ? history.back() : (location.hash='#/'); },
  wzGo: el => { wiz().step = +el.dataset.s; rer(); },
  wzSel: el => { const c=wiz().cfg, k=el.dataset.k; c[k]=el.value;
    const order=['curriculumId','levelId','unitId','lessonId']; order.slice(order.indexOf(k)+1).forEach(x=>c[x]='');
    if(k!=='lessonId') c.extra=[]; wiz().blocks=[]; wiz().manual=false; rer(); },
  wzTitle: el => { wiz().cfg.title = el.value; },
  wzMulti: el => { wiz().cfg.multi = el.checked; rer(); },
  wzExtra: el => { const c=wiz().cfg; if(el.checked) c.extra.push(el.value); else c.extra=c.extra.filter(x=>x!==el.value); rer(); },
  wzTheme: el => { const t=el.dataset.t||null; if(el.dataset.warn){ UI.confirm({title:'Chọn theme khác level?', body:`<p>Theme này được thiết kế cho level khác với lesson đang chọn. Bạn vẫn có thể dùng; nội dung vẫn bám từ vựng của lesson.</p>`, ok:'Vẫn chọn'}).then(v=>{ if(v){ wiz().cfg.themeId=t; wiz().showOtherThemes=true; rer(); } }); return; } wiz().cfg.themeId=t; rer(); },
  wzPages: el => { const w=wiz(); w.cfg.pages=Math.max(1,Math.min(8,+el.value||2)); if(!w.manual) w.blocks=[]; rer(); },
  wzMin: el => { wiz().cfg.minutes = +el.value||30; }, wzNote: el => { wiz().cfg.note = el.value; },
  wzNext: () => { const w=wiz(); if(w.step===1 && !w.cfg.title) w.cfg.title = (()=>{ const x=Q.lessonCtx(w.cfg.lessonId); return `Lesson ${x.ls.code} – ${x.ls.name}`; })(); w.step++; rer(); },
  wzReplan: () => { const w=wiz(); w.salt++; w.manual=false; planNow(w); rer(); UI.toast('Đã dàn một bộ khối bài khác.'); },
  wzClear: () => { const w=wiz(); w.blocks=[]; w.manual=true; rer(); },
  wzAdd: () => { const w=wiz(); const lesson=Q.lesson(w.cfg.lessonId); const t=WS.TYPE_ORDER.find(t=>AI.available(lesson,t).ok && !w.blocks.some(b=>b.type===t)) || 'mcq'; w.blocks.push({id:U.uid('b'), type:t, count:Q.standard(t).minQ, difficulty:'medium', explanations:true, note:'', reason:'Khối do bạn thêm.', layout:WS.S.state.layoutDefaults[t]||'L1'}); w.manual=true; rer(); },
  wzAddObj: el => { const w=wiz(); const lesson=Q.lesson(w.cfg.lessonId); const o=AI.objectives(lesson)[+el.dataset.o];
    const cand = [...new Set(o.kinds.flatMap(k=>AI.KIND_TYPES[k]))].filter(t=>AI.available(lesson,t).ok);
    const t = cand.find(t=>!w.blocks.some(b=>b.type===t)) || cand[0];
    if(!t) return UI.toast('Lesson chưa đủ dữ liệu để sinh loại bài luyện mục tiêu này.');
    const st=AI.STAGE[t]; const b = {id:U.uid('b'), type:t, count:Q.standard(t).minQ, difficulty:st===1?'easy':'medium', explanations:true, note:'', objectives:[o.i], reason:`${AI.STAGE_LABEL[st]} · Mục tiêu ${o.i+1}: ${o.t}.`, layout:S.state.layoutDefaults[t]||'L1'};
    let k = w.blocks.findIndex(x=>!x.fromLib && AI.STAGE[x.type]>st); if(k<0) k=w.blocks.length; w.blocks.splice(k,0,b); w.manual=true; rer(); UI.toast(`Đã thêm khối ${WS.TYPES[t].label} cho mục tiêu ${o.i+1}.`); },
  wzB: el => { const w=wiz(), b=w.blocks[+el.dataset.i], k=el.dataset.k; b[k] = el.type==='checkbox'?el.checked : k==='count'?(+el.value||0) : el.value; if(k==='type'){ b.count=Math.max(Q.standard(b.value||b.type).minQ, Math.min(b.count, Q.standard(b.type).maxQ)); b.reason='Khối do bạn chỉnh.'; b.layout=S.state.layoutDefaults[b.type]||'L1'; delete b.objectives; } w.manual=true; rer(); },
  wzMv: el => { const w=wiz(), i=+el.dataset.i, j=i+(+el.dataset.d); if(j<0||j>=w.blocks.length) return; [w.blocks[i],w.blocks[j]]=[w.blocks[j],w.blocks[i]]; w.manual=true; rer(); },
  wzDel: el => { const w=wiz(); w.blocks.splice(+el.dataset.i,1); w.manual=true; rer(); },
  wzTplSave: () => { const w=wiz(); const blocks = w.blocks.filter(b=>!b.fromLib);
    UI.modal({title:'Lưu làm mẫu phiếu', sub:'Mẫu giữ loại bài, số câu, độ khó, bố cục, ngắt trang và ghi chú cho AI của từng khối, cùng số trang. Mẫu không gắn với lesson nên dùng lại được cho lesson khác.'+(blocks.length<w.blocks.length?' Khối thêm từ kho bài không được lưu vào mẫu.':''),
      body:`<div class="field"><label for="tpl-n">Tên mẫu</label><input id="tpl-n" class="inp" value="${esc(`Mẫu ${w.cfg.pages} trang · ${blocks.length} khối`)}"></div>`,
      buttons:[{label:'Hủy', kind:'ghost'}, {label:'Lưu mẫu', kind:'primary', onClick:(m,close)=>{ const name=(m.querySelector('#tpl-n').value||'').trim()||'Mẫu phiếu';
        S.commit(st=>{ st.wsTemplates = st.wsTemplates||[]; st.wsTemplates.push({id:U.uid('tpl'), name, ownerId:Q.me().id, shared:false, pages:w.cfg.pages, createdAt:Date.now(),
          blocks:blocks.map(b=>({type:b.type, count:b.count, difficulty:b.difficulty, layout:b.layout, explanations:b.explanations!==false, note:b.note||'', breakBefore:!!b.breakBefore, keep:b.keep}))});
          WS.audit('Lưu mẫu phiếu','system','',{note:name}); });
        close(); UI.toast(`Đã lưu mẫu "${name}".`); }}]}); },
  wzTplUse: () => { const w=wiz(); const list=tplVisible();
    UI.modal({title:'Dùng mẫu phiếu', sub:'Thay danh sách khối hiện tại bằng khối của mẫu. Loại bài lesson này không sinh được sẽ được đổi sang loại cùng kỹ năng.', wide:true,
      body: list.length?`<div class="tbl-wrap"><table class="tbl"><tbody>${list.map(t=>`<tr><td><b>${esc(t.name)}</b> ${t.shared?UI.chip('Dùng chung','blue'):''}<div class="small muted">${t.pages} trang · ${esc(tplSummary(t))} · ${esc(Q.user(t.ownerId).name)}</div></td><td style="white-space:nowrap">${t.ownerId===Q.me().id?`<button class="btn sm ghost" data-del="${t.id}">Xóa</button> `:''}<button class="btn sm" data-pick="${t.id}">Dùng</button></td></tr>`).join('')}</tbody></table></div>`:UI.empty('Chưa có mẫu phiếu','Dàn khối xong, bấm "Lưu làm mẫu" để dùng lại cho lesson khác.'),
      buttons:[{label:'Đóng', kind:'ghost'}],
      onMount:(m,close)=>m.addEventListener('click',e=>{ const d=e.target.closest('[data-del]'); if(d){ S.commit(st=>{ st.wsTemplates=st.wsTemplates.filter(t=>t.id!==d.dataset.del); }); d.closest('tr').remove(); UI.toast('Đã xóa mẫu.'); return; }
        const b=e.target.closest('[data-pick]'); if(!b) return; const tpl=list.find(t=>t.id===b.dataset.pick); const notes=applyTemplate(w, tpl); close(); rer();
        UI.toast(`Đã dùng mẫu "${tpl.name}"${notes.length?'; điều chỉnh theo lesson: '+notes.join(', '):''}.`); })}); },
  wzBrk: el => { wiz().blocks[+el.dataset.i].breakBefore = el.checked; rer(); },
  wzLay: el => { const b=wiz().blocks[+el.dataset.i]; b.layout=el.dataset.l; rer(); },
  wzSugg: el => { const w=wiz(); const k=el.dataset.k, i=el.dataset.i===''?null:+el.dataset.i; if(k==='l4') w.blocks[i].layout='L4'; if(k==='less') w.blocks[i].count--; if(k==='pages') w.cfg.pages=measurePlan(w).pages; rer(); UI.toast('Đã áp dụng gợi ý.'); },
  wzFromLib: () => { const w=wiz(); const list = S.state.exercises.filter(e=>e.status==='active' && R.lastDone(e) && e.scope.unitId===w.cfg.unitId);
    UI.modal({title:'Thêm từ kho bài', sub:'Chỉ liệt kê bài đã có bản Done trong cùng unit.', wide:true, body: list.length?`<div class="tbl-wrap"><table class="tbl"><tbody>${list.map(e=>`<tr><td>${UI.typeChip(e.type)}</td><td><b>${esc(e.draft.title)}</b><div class="small muted">${esc(Q.lessonShort(e.scope.lessonIds[0]))} · ${esc(Q.user(e.ownerId).name)}</div></td><td>${UI.exChip(e)}</td><td><button class="btn sm" data-pick="${e.id}">Thêm</button></td></tr>`).join('')}</tbody></table></div>`:UI.empty('Không có bài Done nào trong unit này',''), buttons:[{label:'Đóng', kind:'ghost'}],
      onMount:(m,close)=>m.addEventListener('click',e=>{ const b=e.target.closest('[data-pick]'); if(!b) return; w.blocks.push({id:U.uid('b'), fromLib:b.dataset.pick, layout:Q.ex(b.dataset.pick).draft.layout}); w.manual=true; close(); rer(); })}); },
  wzGen: () => {
    const w = wiz(); const c = w.cfg; const x = Q.lessonCtx(c.lessonId);
    let ws;
    S.commit(st=>{ st.counters.ws++; ws = {id:'ws'+st.counters.ws+'-'+Math.random().toString(36).slice(2,5), code:'WS-'+String(st.counters.ws).padStart(4,'0'), title:c.title||`Lesson ${x.ls.code} – ${x.ls.name}`, authorId:Q.me().id, status:'draft',
      scope:{curriculumId:x.c.id, curriculumVersion:x.c.version, levelId:x.l.id, unitId:x.u.id, lessonIds:cfgLessons(c)}, themeId:c.themeId, pages:c.pages,
      settings:{cover:false, classInfo:true, notesArea:false, score:false, minutes:c.minutes, note:c.note}, items:[], versions:[], versionNo:1, reviewerId:null, unlock:null, returned:null, exportedAt:null, publishedVersion:null, createdAt:Date.now(), updatedAt:Date.now()};
      st.worksheets.push(ws); WS.audit('Tạo phiếu','worksheet',ws.id,{note:`${w.blocks.length} khối`}); });
    w.wsId = ws.id; w.step = 4; w.started = true;
    WS.runGeneration(ws.id, U.clone(w.blocks), U.clone(c)).then(()=>{ if(WS.App.route.name==='wizard' && wiz() && wiz().wsId===ws.id){ setTimeout(()=>{ if(WS.App.route.name==='wizard' && wiz() && wiz().wsId===ws.id){ S.session.ui.wiz=null; location.hash='#/phieu/'+ws.id; } }, 1200); } });
    rer();
  },
  wzBg: () => { const id=wiz().wsId; S.session.ui.wiz=null; UI.toast('Đang sinh ở chế độ nền. Bạn sẽ nhận thông báo khi xong.'); location.hash='#/phieu'; },
  wzSaveCfg: () => {
    const w=wiz(), c=w.cfg, ws=Q.ws(w.editWs); const x=Q.lessonCtx(c.lessonId);
    const changed = ws.themeId!==c.themeId || ws.scope.lessonIds[0]!==c.lessonId;
    const apply = async (regen) => {
      const fresh = {};
      if(regen){ const jobs = ws.items.map(async (it,i)=>{ const ex=Q.ex(it.exerciseId); if(!ex || R.lastDone(ex)) return; fresh[ex.id] = await WS.services.ai.generate(c.lessonId, ex.type, {count:ex.draft.questions.length, seed:'re'+Date.now()+i, themeId:c.themeId, layout:ex.draft.layout, difficulty:ex.draft.difficulty, blockIndex:i}); }); await Promise.all(jobs); }
      S.commit(()=>{ ws.title=c.title||ws.title; ws.themeId=c.themeId; ws.pages=c.pages; ws.settings.minutes=c.minutes; ws.settings.note=c.note;
        ws.scope={curriculumId:x.c.id, curriculumVersion:x.c.version, levelId:x.l.id, unitId:x.u.id, lessonIds:cfgLessons(c)}; WS.audit('Sửa cấu hình phiếu','worksheet',ws.id);
        if(regen){ let n=0; ws.items.forEach((it,i)=>{ const ex=Q.ex(it.exerciseId); if(!ex || R.lastDone(ex)) return; const g=fresh[ex.id]; if(!g) return; const rev=ex.draft.rev; ex.draft=g.draft; ex.draft.rev=rev+1; ex.themeId=c.themeId; ex.scope.lessonIds=[c.lessonId]; S.session.loadedRev[ex.id]=ex.draft.rev; n++; }); WS.audit(`Sinh lại ${n} bài chưa Done theo cấu hình mới`,'worksheet',ws.id); }
      });
      S.session.ui.wiz=null; location.hash='#/phieu/'+ws.id; UI.toast('Đã lưu cấu hình phiếu.');
    };
    if(changed && A.wsEditGuard(ws)){ UI.modal({title:'Đổi lesson hoặc theme', body:'<p>Bài đã Done luôn được giữ (sẽ hiện nhãn "Khác cấu hình hiện tại" nếu lệch). Với bài chưa Done, bạn muốn:</p>', buttons:[{label:'Giữ nguyên nội dung hiện có', kind:'ghost', onClick:(m,cl)=>{ cl(); apply(false); return false; }}, {label:'Sinh lại các bài chưa Done', kind:'primary', onClick:(m,cl)=>{ cl(); apply(true); return false; }}]}); }
    else if(!changed && A.wsEditGuard(ws)) apply(false);
  }
});
