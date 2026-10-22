/* ============ VIEW: Cấu hình hệ thống (Admin, D-77, D-78, D-112, D-104) ============ */
import { WS } from '../../ws.js';
const U = WS.U, Q = WS.Q, R = WS.R, S = WS.S, UI = WS.UI, A = WS.A, V = WS.V, AI = WS.AI;
const esc = U.esc; const views = WS.views;
const isAdmin = () => Q.me().role==='admin';

const FILE_KINDS = [['knowledge','Kiến thức',true],['skill','Skill',true],['source','Văn bản nguồn',false],['gold','Bài mẫu chuẩn vàng',false]];
const tmpl = (kind, ls) => kind==='knowledge'?WS.SAMPLE_KNOWLEDGE_MD(ls):kind==='skill'?WS.SAMPLE_SKILL_MD(ls):kind==='source'?`# Văn bản nguồn · ${ls.code}\n${ls.passages.join('\n\n')}`:`# Bài mẫu chuẩn vàng · ${ls.code}\n### Matching\n- ${ls.vocab.slice(0,3).map(v=>v.w).join('\n- ')}`;

views.admin = {
  render(main, p){
    if(!isAdmin()){ main.innerHTML = `<div class="page">${UI.empty('Chỉ Admin cấu hình hệ thống','Chuyển sang Thu (Admin) bằng công tắc người dùng. Giáo viên xem giáo trình ở mục Giáo trình.')}</div>`; return; }
    const tab = p.tab || S.session.ui.adminTab || 'cur'; S.session.ui.adminTab = tab;
    const tabs = [['cur','Giáo trình'],['files','Tệp lesson'],['themes','Theme'],['layouts','Thư viện bố cục'],['qfb','Phản hồi Quiz']];
    let body = '';
    if(tab==='cur') body = curTab(); else if(tab==='files') body = filesTab(); else if(tab==='themes') body = themesTab(); else if(tab==='layouts') body = layoutsTab(); else body = qfbTab();
    main.innerHTML = `<div class="page"><div class="page-head"><div><h1>Cấu hình hệ thống</h1><div class="desc">Chỉ Admin sửa. Dữ liệu ở đây là căn cứ sinh bài và kiểm tra tiêu chuẩn.</div></div></div>
      <div class="seg" style="margin-bottom:16px" role="tablist">${tabs.map(([k,l])=>`<button class="${tab===k?'on':''}" data-a="go" data-href="#/cau-hinh?tab=${k}" role="tab" aria-selected="${tab===k}">${l}</button>`).join('')}</div>${body}</div>`;
  }
};
function curTab(){
  return `<div class="row" style="margin-bottom:12px">${UI.btn('⇪ Nhập từ Markdown / JSON',{a:'admImport', kind:'primary'})}<span class="small muted">Mỗi lần nhập là một phiên bản giáo trình; có xem trước và báo lỗi theo dòng trước khi lưu.</span></div>
    <div class="grid g2">${S.state.curricula.map(c=>{ const vers=S.state.curriculumVersions[c.id]||[]; let n=0; c.levels.forEach(l=>l.units.forEach(u=>n+=u.lessons.length));
      return `<div class="card"><div class="row"><h3 style="margin:0">${esc(c.name)}</h3><span class="chip outline">v${esc(c.version)}</span><span class="spacer"></span>${UI.btn('Tải md',{a:'admDlMd', size:'sm', data:{c:c.id}})}</div>
        <div class="small muted" style="margin:4px 0 10px">${esc(c.cefr)} · ${c.levels.length} level · ${n} lesson${c.imported?' · nhập từ tệp':' · giáo trình mẫu'}</div>
        ${c.levels.map(l=>`<details><summary class="small"><b>${esc(l.name)}</b> (${esc(l.cefr)})</summary>${l.units.map(u=>`<div class="small" style="margin:4px 0 2px 12px"><b>${esc(u.code)} ${esc(u.name)}</b></div>${u.lessons.map(x=>`<div class="row small" style="margin-left:24px"><span>${esc(x.code)} ${esc(x.name)}</span>${x._orig?'<span class="chip yellow">đã sửa tay</span>':''}<span class="spacer"></span>${UI.btn('Sửa lesson',{a:'admEditLs', size:'xs', kind:'ghost', data:{ls:x.id}})}</div>`).join('')}`).join('')}</details>`).join('')}
        <div class="small muted" style="margin-top:10px"><b>Phiên bản:</b> ${vers.slice().reverse().map(v=>`v${esc(v.version)} (${U.fmtDate(v.at)}, ${esc(v.note||'')})`).join(' · ')}</div></div>`; }).join('')}</div>`;
}
function filesTab(){
  const all = Q.allLessons();
  return `<div class="small muted" style="margin-bottom:10px">Mỗi lesson một bộ tệp tự đủ. Hai tệp bắt buộc: Kiến thức và Skill. Hệ thống không đọc tệp Level/Unit và không tự gom kiến thức lesson khác.</div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Lesson</th>${FILE_KINDS.map(([k,l,req])=>`<th>${l}${req?' *':''}</th>`).join('')}<th>Trạng thái</th><th></th></tr></thead><tbody>
    ${all.map(({c,l,u,ls})=>{ const f=S.state.lessonFiles[ls.id]||{}; const ready=f.knowledge&&f.skill; return `<tr><td><b>${esc(ls.code)} ${esc(ls.name)}</b><div class="small muted">${esc(c.name)} · ${esc(l.name)} · ${esc(u.code)}</div></td>${FILE_KINDS.map(([k])=>`<td class="small">${f[k]?`v${f[k].version} · ${U.ago(f[k].at)}`:'<span class="muted">—</span>'}</td>`).join('')}<td>${ready?UI.chip('Sẵn sàng','green','✓'):UI.chip('Thiếu tệp','grey')}</td><td>${UI.btn('Quản lý tệp',{a:'admFiles', size:'sm', data:{ls:ls.id}})}</td></tr>`; }).join('')}</tbody></table></div>
    <p class="small muted" style="margin-top:8px">Chưa làm: tệp chưa điều khiển bộ sinh giả lập và bài chưa ghi phiên bản tệp đã dùng (theo đặc tả).</p>`;
}
function themesTab(){
  return `<div class="row" style="margin-bottom:12px">${UI.btn('＋ Thêm theme',{a:'admTheme', kind:'primary'})}${UI.btn('⇪ Nhập theme từ Markdown',{a:'admThemeMd'})}<span class="small muted">Theme chỉ là bối cảnh và nhân vật; không chứa từ vựng hay ngữ pháp bắt buộc.</span></div>
    <div class="theme-grid">${S.state.themes.map(t=>`<div class="theme-card" style="cursor:default;${t.active?'':'opacity:.6'}"><div class="row"><span class="e">${t.emoji}</span><b>${esc(t.name)}</b><span class="spacer"></span>${t.active?UI.chip('Đang dùng','green'):UI.chip('Ngừng dùng','grey')}</div><span class="small muted">${esc(t.desc)}</span><span class="small">${esc(t.age)} tuổi · ${t.levels.join(', ')}</span><span class="small muted">Nhân vật: ${t.chars.map(c=>esc(c.n)).join(', ')}</span>
      <div class="row" style="margin-top:6px">${UI.btn('Sửa',{a:'admTheme', size:'xs', data:{t:t.id}})}${UI.btn(t.active?'Ngừng dùng':'Dùng lại',{a:'admThemeToggle', size:'xs', kind:'ghost', data:{t:t.id}})}</div></div>`).join('')}</div>`;
}
function layoutsTab(){
  return `<div class="grid g2"><div class="card"><h3>Bố cục dàn trang</h3>${S.state.layouts.map(l=>`<div class="row" style="padding:8px 0;border-top:1px solid var(--line)">${UI.layIcon(l.id)}<div><b>${l.id} · ${esc(l.name)}</b><div class="small muted">${esc(l.when)} · ${l.cols} cột${l.image?' · có vùng ảnh':''}</div></div></div>`).join('')}<div class="small muted" style="margin-top:8px">Chỉnh tham số bố cục là P1, chưa làm.</div></div>
    <div class="card"><h3>Bố cục mặc định theo loại bài</h3>${WS.TYPE_ORDER.map(t=>`<div class="row" style="margin-bottom:6px"><span style="flex:1">${esc(WS.TYPES[t].label)}</span><select class="inp" style="width:200px" data-c="admLayDef" data-t="${t}" aria-label="Bố cục mặc định ${esc(WS.TYPES[t].label)}">${S.state.layouts.map(l=>`<option value="${l.id}" ${S.state.layoutDefaults[t]===l.id?'selected':''}>${l.id} · ${esc(l.name)}</option>`).join('')}</select></div>`).join('')}</div></div>`;
}
function qfbTab(){
  const f = S.state.settings.qfb;
  const grp = (k, label) => `<div class="card"><h3>${label}</h3><div class="lbl" style="margin:6px 0">Hình</div><div class="row wrap">${Object.keys(f[k].img).map(id=>`<label class="theme-card ${f[k].img[id]?'on':''}" style="width:96px;align-items:center;padding:6px"><span style="width:60px;height:60px;display:block">${WSV.FB_IMG[id].replace('<svg','<svg style="width:60px;height:60px"')}</span><span class="small"><input type="checkbox" data-c="admQfb" data-g="${k}" data-kind="img" data-id="${id}" ${f[k].img[id]?'checked':''}> ${id}</span></label>`).join('')}</div>
    <div class="lbl" style="margin:12px 0 6px">Âm thanh (dưới 2 giây)</div><div class="row wrap">${Object.keys(f[k].snd).map(id=>`<span class="tag"><label><input type="checkbox" data-c="admQfb" data-g="${k}" data-kind="snd" data-id="${id}" ${f[k].snd[id]?'checked':''}> ${id}</label> <button class="btn xs ghost" data-a="admSnd" data-id="${id}" aria-label="Nghe thử ${id}">▶</button></span>`).join('')}</div></div>`;
  return `<div class="small muted" style="margin-bottom:10px">Thư viện phản hồi cho Quiz và Làm trên phiếu. Hệ thống chọn ngẫu nhiên, không lặp liền kề. Luôn giữ ít nhất một hình và một âm mỗi nhóm. Sinh tại chỗ; tải tệp thật để sau.</div>
    <div class="grid g2">${grp('correct','Nhóm Đúng')}${grp('wrong','Nhóm Sai (khích lệ)')}</div>
    <div class="card" style="margin-top:16px"><div class="row"><label class="lbl" for="qv">Âm lượng</label><input id="qv" type="range" min="0" max="100" value="${Math.round(f.volume*100)}" data-c="admQvol" style="width:200px"><label class="switch"><input type="checkbox" data-c="admQtext" ${f.showText?'checked':''}> Hiện lời phản hồi tiếng Anh</label></div></div>`;
}

/* ---------- actions ---------- */
const audit = (a, note) => WS.audit(a,'system','',{note});
Object.assign(WS.ACT, {
  admImport: () => {
    let parsed=null; const prev = m => { const t=m.querySelector('#imp-t').value; let r;
      try { if(t.trim().startsWith('{')){ const c=JSON.parse(t); r={curriculum:c, errors:[], warns:[], stats:{levels:c.levels.length, units:c.levels.reduce((a,l)=>a+l.units.length,0), lessons:c.levels.reduce((a,l)=>a+l.units.reduce((b,u)=>b+u.lessons.length,0),0), vocab:0, grammar:0}}; if(!c.id) c.id='imp-'+U.slug(c.name); } else r=WS.parseCurriculumMd(t); } catch(e){ r={errors:[{line:1,msg:'JSON không hợp lệ: '+e.message}], warns:[]}; }
      parsed=r; const sample = r.curriculum && WS.CURRICULA.some(c=>c.name.toLowerCase()===r.curriculum.name.toLowerCase());
      if(sample) r.errors.push({line:1, msg:`Trùng tên giáo trình mẫu "${r.curriculum.name}". Hãy đặt tên khác.`});
      const ex = r.curriculum && S.state.curricula.find(c=>c.name===r.curriculum.name && !sample);
      let diff=''; if(ex && !r.errors.length){ const oldL=[], newL=[]; ex.levels.forEach(l=>l.units.forEach(u=>u.lessons.forEach(x=>oldL.push(x)))); r.curriculum.levels.forEach(l=>l.units.forEach(u=>u.lessons.forEach(x=>newL.push(x))));
        const key=x=>x.code+' '+x.name; const add=newL.filter(x=>!oldL.some(o=>key(o)===key(x))), rem=oldL.filter(o=>!newL.some(x=>key(o)===key(x))), chg=newL.filter(x=>{ const o=oldL.find(o=>key(o)===key(x)); return o && JSON.stringify(o.vocab.map(v=>v.w))!==JSON.stringify(x.vocab.map(v=>v.w)); });
        const used = rem.filter(o=>S.state.exercises.some(e=>e.scope.lessonIds.includes(o.id)));
        diff = `<div class="banner info" style="margin-top:8px">Giáo trình đã có: sẽ tạo phiên bản mới. Lesson thêm ${add.length}, đổi ${chg.length}, bỏ ${rem.length}.${used.length?` <b>Cảnh báo:</b> ${used.length} lesson bị bỏ đang có bài soạn (${used.map(x=>esc(x.code)).join(', ')}).`:''}</div>`; }
      m.querySelector('#imp-p').innerHTML = r.curriculum ? `<div class="row wrap small" style="gap:14px"><b>${esc(r.curriculum.name)} v${esc(r.curriculum.version)}</b><span>${r.stats.levels} level</span><span>${r.stats.units} unit</span><span>${r.stats.lessons} lesson</span><span>${r.stats.vocab} từ vựng</span><span>${r.stats.grammar} cấu trúc</span></div>${diff}` : '';
      m.querySelector('#imp-e').innerHTML = r.errors.map(x=>`<div class="issue e" style="cursor:default"><span class="code">Dòng ${x.line}</span><span>${esc(x.msg)}</span></div>`).join('') + r.warns.map(x=>`<div class="issue w" style="cursor:default"><span class="code">Dòng ${x.line}</span><span>${esc(x.msg)}</span></div>`).join('') || (r.curriculum?'<div class="banner ok">Không có lỗi hay cảnh báo.</div>':''); };
    UI.modal({title:'Nhập giáo trình', sub:'Markdown theo mẫu Phụ lục A.1 hoặc JSON xuất từ app.', xwide:true, body:`<div class="row" style="margin-bottom:8px">${UI.btn('Chèn tệp mẫu',{a:'', id:'imp-s', size:'sm'})}<label class="btn sm">Chọn tệp .md/.json<input type="file" accept=".md,.json,.txt" id="imp-f" style="display:none"></label><span class="small muted">Xem trước cập nhật khi bạn sửa nội dung.</span></div>
      <div class="grid g2"><textarea class="inp" id="imp-t" rows="18" style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px" aria-label="Nội dung tệp giáo trình"></textarea><div><div class="lbl">Xem trước kết quả nhập</div><div id="imp-p" class="small" style="margin:6px 0"></div><div id="imp-e"></div></div></div>`,
      buttons:[{label:'Hủy', kind:'ghost'}, {label:'Xác nhận lưu', kind:'primary', onClick:(m,close)=>{ prev(m); if(!parsed||!parsed.curriculum||parsed.errors.length){ UI.toast('Không thể lưu vì tệp còn lỗi. Hãy sửa các dòng được báo.', {err:true}); return false; }
        const c = parsed.curriculum;
        S.commit(st=>{ const old = st.curricula.find(x=>x.name===c.name);
          if(old){ let v=c.version; const vers=st.curriculumVersions[old.id]||[]; if(vers.some(x=>x.version===v) || old.version===v){ const p=String(v).split('.'); p[p.length-1]=String((+p[p.length-1]||0)+1); v=p.join('.'); }
            c.version=v; c.id=old.id; c.levels.forEach((l,li)=>{ l.id=`${old.id}-l${li+1}`; l.units.forEach((u,ui)=>{ u.id=`${l.id}-u${ui+1}`; u.lessons.forEach((x,xi)=>{ const o=[]; old.levels.forEach(ol=>ol.units.forEach(ou=>ou.lessons.forEach(ox=>o.push(ox)))); const match=o.find(ox=>ox.code===x.code&&ox.name===x.name); x.id = match?match.id:`${u.id}-${xi+1}`; }); }); });
            st.curricula[st.curricula.indexOf(old)] = c; }
          else st.curricula.push(c);
          (st.curriculumVersions[c.id]=st.curriculumVersions[c.id]||[]).push({version:c.version, at:Date.now(), by:'thu', note:'Nhập từ tệp', lessons:parsed.stats.lessons}); st.curriculaRev++; audit('Nhập giáo trình', `${c.name} v${c.version}`); });
        close(); UI.toast(`Đã lưu giáo trình ${c.name} v${c.version}.`); return false; }}],
      onMount:m=>{ const ta=m.querySelector('#imp-t'); ta.addEventListener('input',()=>prev(m)); m.querySelector('#imp-s').addEventListener('click',()=>{ ta.value=WS.SAMPLE_CURRICULUM_MD; prev(m); });
        m.querySelector('#imp-f').addEventListener('change',e=>{ const f=e.target.files[0]; if(f) f.text().then(t=>{ ta.value=t; prev(m); }); }); }});
  },
  admDlMd: el => { const c=Q.curriculum(el.dataset.c); U.download(U.slug(c.name)+'-v'+c.version+'.md', WS.curriculumToMd(c), 'text/markdown'); },
  admEditLs: el => { const ls=Q.lesson(el.dataset.ls);
    const f=[['objectives','Mục tiêu (cách nhau ;)',ls.objectives.join('; ')],['vocab','Từ vựng: từ | loại | nghĩa | emoji (cách nhau ;)',ls.vocab.map(v=>[v.w,v.pos,v.vi,v.emoji].join(' | ')).join('; ')],['grammar','Ngữ pháp (;)',ls.grammar.join('; ')],['skills','Kỹ năng (,)',ls.skills.join(', ')],['topic','Chủ đề',ls.topic],['banned','Cấm/chưa học (,)',ls.banned.join(', ')],['passage','Đoạn văn nguồn',ls.passages[0]||''],['dialogue','Hội thoại',ls.dialogue||''],['sentences','Câu mẫu (;)',ls.sentenceBank.join('; ')]];
    UI.modal({title:`Sửa lesson ${ls.code} ${ls.name}`, xwide:true, body:`<div class="grid g2">${f.map(([k,l,v])=>`<div class="field"><label>${esc(l)}</label><textarea class="inp" rows="${['passage','vocab','sentences','dialogue'].includes(k)?4:2}" data-k="${k}">${esc(v)}</textarea></div>`).join('')}</div>`,
      buttons:[{label:'Hủy', kind:'ghost'}, ...(ls._orig?[{label:'Bỏ sửa tay', kind:'danger', onClick:(m,c)=>{ S.commit(st=>{ const o=ls._orig; Object.keys(o).forEach(k=>ls[k]=o[k]); delete ls._orig; st.curriculaRev++; audit('Bỏ sửa tay lesson', ls.id); }); c(); return false; }}]:[]),
        {label:'Lưu', kind:'primary', onClick:(m,c)=>{ const g=k=>m.querySelector(`[data-k="${k}"]`).value; S.commit(st=>{ if(!ls._orig) ls._orig=U.clone({objectives:ls.objectives,vocab:ls.vocab,grammar:ls.grammar,skills:ls.skills,topic:ls.topic,banned:ls.banned,passages:ls.passages,dialogue:ls.dialogue,sentenceBank:ls.sentenceBank});
          ls.objectives=g('objectives').split(';').map(s=>s.trim()).filter(Boolean); ls.vocab=g('vocab').split(';').map(s=>s.trim()).filter(Boolean).map(s=>{ const p=s.split('|').map(t=>t.trim()); return {w:p[0].toLowerCase(), pos:p[1]||'', vi:p[2]||'', emoji:p[3]||'', def:''}; });
          ls.grammar=g('grammar').split(';').map(s=>s.trim()).filter(Boolean); ls.skills=g('skills').split(',').map(s=>s.trim()).filter(Boolean); ls.topic=g('topic'); ls.banned=g('banned').split(',').map(s=>s.trim()).filter(Boolean);
          ls.passages=g('passage')?[g('passage')]:[]; ls.dialogue=g('dialogue'); ls.sentenceBank=g('sentences').split(';').map(s=>s.trim()).filter(Boolean); st.curriculaRev++; audit('Sửa tay lesson', ls.id); }); c(); UI.toast('Đã lưu lesson.'); return false; }}]}); },
  admFiles: el => { const ls=Q.lesson(el.dataset.ls); let kind='knowledge'; const files=()=>S.state.lessonFiles[ls.id]=S.state.lessonFiles[ls.id]||{};
    const body = () => { const f=files()[kind]; return `<div class="seg" style="margin-bottom:10px">${FILE_KINDS.map(([k,l,req])=>`<button class="${kind===k?'on':''}" data-fk2="${k}">${l}${req?' *':''}${files()[k]?' ✓':''}</button>`).join('')}</div>
      <div class="row" style="margin-bottom:8px"><label class="btn sm">Chọn tệp .md<input type="file" accept=".md,.txt" id="lf-f" style="display:none"></label><button class="btn sm" data-lf="tmpl">Chèn khung</button><button class="btn sm" data-lf="check">Kiểm tra</button><button class="btn sm" data-lf="dl" ${f?'':'disabled'}>Tải</button><button class="btn sm danger" data-lf="del" ${f?'':'disabled'}>Xóa</button><span class="spacer"></span><span class="small muted">${f?`v${f.version} · ${esc(Q.user(f.by).name)} · ${U.fmtDate(f.at)}`:'Chưa có tệp'}</span></div>
      <textarea class="inp" id="lf-t" rows="16" style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px" aria-label="Nội dung tệp">${esc(f?f.text:'')}</textarea><div id="lf-r" style="margin-top:8px"></div>`; };
    const run = m => { const r=WS.checkLessonFile(kind, m.querySelector('#lf-t').value, ls); m.querySelector('#lf-r').innerHTML = (r.errs.map(x=>`<div class="issue e" style="cursor:default"><span class="code">${x.line?'Dòng '+x.line:'Lỗi'}</span><span>${esc(x.msg)}</span></div>`).join('')+r.warns.map(x=>`<div class="issue w" style="cursor:default"><span class="code">${x.line?'Dòng '+x.line:'Cảnh báo'}</span><span>${esc(x.msg)}</span></div>`).join('')) || '<div class="banner ok">Cấu trúc hợp lệ.</div>'; return r; };
    UI.modal({title:`Tệp lesson ${ls.code} ${ls.name}`, sub:'Mỗi lần lưu tạo phiên bản mới cho tệp đổi và ghi nhật ký.', xwide:true, body:body(),
      buttons:[{label:'Đóng', kind:'ghost'}, {label:'Lưu', kind:'primary', onClick:(m)=>{ const t=m.querySelector('#lf-t').value; const r=run(m); if(r.errs.length){ UI.toast('Không thể lưu vì tệp còn lỗi cấu trúc.', {err:true}); return false; } const old=files()[kind]; if(old && old.text===t){ UI.toast('Tệp không thay đổi.'); return false; }
        S.commit(()=>{ files()[kind]={text:t, version:(old?old.version:0)+1, at:Date.now(), by:Q.me().id}; WS.audit('Lưu tệp lesson ('+kind+')','system',ls.id,{after:'v'+files()[kind].version}); }); m.querySelector('.modal-b').innerHTML=body(); run(m); UI.toast('Đã lưu tệp.'); return false; }}],
      onMount:m=>{ m.addEventListener('click',e=>{ const k=e.target.closest('[data-fk2]'); const a=e.target.closest('[data-lf]');
          if(k){ kind=k.dataset.fk2; m.querySelector('.modal-b').innerHTML=body(); }
          if(a){ const ta=m.querySelector('#lf-t'); if(a.dataset.lf==='tmpl'){ ta.value=tmpl(kind, ls); run(m); } if(a.dataset.lf==='check') run(m); if(a.dataset.lf==='dl') U.download(`${ls.code}-${kind}.md`, files()[kind].text, 'text/markdown');
            if(a.dataset.lf==='del') UI.confirm({title:'Xóa tệp?', body:'<p>Tệp sẽ bị xóa khỏi lesson.</p>', ok:'Xóa', danger:true}).then(v=>{ if(!v) return; S.commit(()=>{ delete files()[kind]; WS.audit('Xóa tệp lesson ('+kind+')','system',ls.id); }); m.querySelector('.modal-b').innerHTML=body(); }); } });
        m.addEventListener('change',e=>{ if(e.target.id==='lf-f'){ const f=e.target.files[0]; if(f) f.text().then(t=>{ m.querySelector('#lf-t').value=t; run(m); }); } }); }}); },
  admTheme: el => { const t = el.dataset.t ? Q.theme(el.dataset.t) : {id:'', name:'', emoji:'🎨', age:'8–11', levels:['A1'], active:true, desc:'', plot:'', chars:[], places:[], avoid:[], hue:200};
    UI.modal({title:t.id?'Sửa theme':'Thêm theme', wide:true, body:`<div class="grid g2">${[['name','Tên',t.name],['emoji','Biểu tượng',t.emoji],['age','Độ tuổi',t.age],['levels','Level phù hợp (,)',t.levels.join(', ')],['desc','Bối cảnh',t.desc],['plot','Cốt chuyện gợi ý',t.plot],['chars','Nhân vật: Tên (vai trò, f/m); …',t.chars.map(c=>`${c.n} (${c.role||''}, ${c.g})`).join('; ')],['places','Địa điểm (,)',t.places.join(', ')],['avoid','Từ khóa nên tránh (,)',t.avoid.join(', ')]].map(([k,l,v])=>`<div class="field"><label>${l}</label><input class="inp" data-k="${k}" value="${esc(v)}"></div>`).join('')}</div><div id="th-w"></div>`,
      buttons:[{label:'Hủy', kind:'ghost'}, {label:'Lưu', kind:'primary', onClick:(m,c)=>{ const g=k=>m.querySelector(`[data-k="${k}"]`).value.trim(); if(!g('name')){ UI.toast('Theme cần có tên.'); return false; }
        const all = Object.values({a:g('desc'),b:g('plot')}).join(' '); if(/vocabulary|grammar|từ vựng bắt buộc/i.test(all) && !m.__warned){ m.querySelector('#th-w').innerHTML='<div class="banner warn">Theme có vẻ chứa từ vựng/ngữ pháp bắt buộc. Theme chỉ nên là bối cảnh. Bấm Lưu lần nữa để vẫn lưu.</div>'; m.__warned=true; return false; }
        const chars = g('chars').split(';').map(s=>s.trim()).filter(Boolean).map(s=>{ const mm=s.match(/^([^(]+)\(([^,]*),\s*([fm])\)/i); return mm?{n:mm[1].trim(), role:mm[2].trim(), g:mm[3].toLowerCase()}:{n:s.replace(/\(.*\)/,'').trim(), g:'m', role:''}; });
        S.commit(st=>{ const obj = Object.assign(t, {name:g('name'), emoji:g('emoji')||'🎨', age:g('age'), levels:g('levels').split(',').map(s=>s.trim()).filter(Boolean), desc:g('desc'), plot:g('plot'), chars, places:g('places').split(',').map(s=>s.trim()).filter(Boolean), avoid:g('avoid').split(',').map(s=>s.trim()).filter(Boolean)});
          if(!t.id){ obj.id=U.slug(obj.name)||U.uid('th'); st.themes.push(obj); } audit(t.id?'Sửa theme':'Thêm theme', obj.name); st.curriculaRev++; }); c(); UI.toast('Đã lưu theme.'); return false; }}]}); },
  admThemeToggle: el => { const t=Q.theme(el.dataset.t); S.commit(()=>{ t.active=!t.active; audit(t.active?'Dùng lại theme':'Ngừng dùng theme', t.name); }); },
  admThemeMd: () => { UI.modal({title:'Nhập theme từ Markdown', sub:'Theo mẫu Phụ lục A.2.', wide:true, body:`<button class="btn sm" id="tm-s" style="margin-bottom:8px">Chèn tệp mẫu</button><textarea class="inp" id="tm-t" rows="10" style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px"></textarea>`,
    buttons:[{label:'Hủy', kind:'ghost'}, {label:'Nhập', kind:'primary', onClick:(m,c)=>{ const t=m.querySelector('#tm-t').value; const name=(t.match(/^#\s+(.+)$/m)||[])[1]; if(!name){ UI.toast('Dòng 1: thiếu tên theme (# Tên).', {err:true}); return false; }
      const g=k=>((t.match(new RegExp('^-\\s*'+k+':\\s*(.+)$','mi'))||[])[1]||'').trim();
      const chars=g('characters').split(/,(?![^(]*\))/).map(s=>s.trim()).filter(Boolean).map(s=>{ const mm=s.match(/^([^(]+)\(([^,]*),?\s*([fm])?\)/i); return mm?{n:mm[1].trim(), role:mm[2].trim(), g:(mm[3]||'m').toLowerCase()}:{n:s, g:'m', role:''}; });
      const lv=g('levels').split(/[–-]/).map(s=>s.trim()).filter(Boolean);
      S.commit(st=>{ st.themes.push({id:U.slug(name), name:name.trim(), emoji:'🎨', age:g('age'), levels:lv, active:true, desc:g('setting'), plot:g('plot'), chars, places:g('places').split(',').map(s=>s.trim()).filter(Boolean), avoid:g('avoid').split(',').map(s=>s.trim()).filter(Boolean), hue:180}); audit('Nhập theme', name); }); c(); UI.toast('Đã nhập theme '+name+'.'); return false; }}],
    onMount:m=>m.querySelector('#tm-s').addEventListener('click',()=>{ m.querySelector('#tm-t').value=WS.SAMPLE_THEME_MD; })}); },
  admLayDef: el => S.commit(st=>{ st.layoutDefaults[el.dataset.t]=el.value; audit('Đổi bố cục mặc định', el.dataset.t+' → '+el.value); }),
  admQfb: el => { const f=S.state.settings.qfb[el.dataset.g][el.dataset.kind]; const on=Object.values(f).filter(Boolean).length; if(!el.checked && on<=1){ el.checked=true; UI.toast('Mỗi nhóm cần giữ ít nhất một '+(el.dataset.kind==='img'?'hình':'âm')+'.'); return; } S.commit(()=>{ f[el.dataset.id]=el.checked; audit('Phản hồi Quiz: '+(el.checked?'bật ':'tắt ')+el.dataset.id, el.dataset.g); }); },
  admSnd: el => WSV.fbSound(el.dataset.id, S.state.settings.qfb.volume),
  admQvol: el => S.commit(()=>{ S.state.settings.qfb.volume=+el.value/100; }),
  admQtext: el => S.commit(()=>{ S.state.settings.qfb.showText=el.checked; })
});
