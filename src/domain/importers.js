/* ============ IMPORTERS: giáo trình Markdown (Phụ lục A.1), kiểm tệp lesson (D-112) ============ */
import { WS } from '../ws.js';
const U = WS.U, V = WS.V;

/* ---------- Markdown curriculum parser (Phụ lục A.1) ---------- */
WS.parseCurriculumMd = (text) => {
  const lines = String(text).replace(/\r/g,'').split('\n');
  const errors=[], warns=[]; let cur=null, lvl=null, unit=null, ls=null, block=null;
  const KEYS = ['objectives','vocabulary','grammar','skills','topic','forbidden','passage','dialogue','sentences','review','min_repeat','allowed_extra'];
  const slug = s => U.slug(s).slice(0,24);
  lines.forEach((raw, i) => {
    const n = i+1; const line = raw.replace(/\s+$/,'');
    if(block){ if(/^\s{2,}\S/.test(raw)){ block.buf.push(raw.trim()); return; } else { ls[block.key] = block.buf.join(block.key==='dialogue'?'\n':' '); block=null; } }
    if(!line.trim()) return;
    let m;
    if((m=line.match(/^#\s+(.+)$/))){ cur={name:m[1].trim(), version:'1.0', levels:[], line:n}; return; }
    if((m=line.match(/^version:\s*(.+)$/i))){ if(cur) cur.version=m[1].trim(); return; }
    if((m=line.match(/^##\s+(.+?)(?:\s*\(([^)]+)\))?\s*$/)) && !line.startsWith('###')){ if(!cur){ errors.push({line:n, msg:'Level xuất hiện trước tiêu đề giáo trình (#).'}); return; } lvl={name:m[1].trim(), cefr:(m[2]||'').trim()||'A1', units:[], line:n}; cur.levels.push(lvl); return; }
    if((m=line.match(/^###\s+(\S+)\s+(.+)$/)) && !line.startsWith('####')){ if(!lvl){ errors.push({line:n, msg:'Unit xuất hiện trước Level (##).'}); return; } unit={code:m[1], name:m[2].trim(), lessons:[], line:n}; lvl.units.push(unit); return; }
    if((m=line.match(/^####\s+(\S+)\s+(.+)$/))){ if(!unit){ errors.push({line:n, msg:'Lesson xuất hiện trước Unit (###).'}); return; } ls={code:m[1], name:m[2].trim(), line:n}; unit.lessons.push(ls); return; }
    if((m=line.match(/^-\s*([a-z_]+):\s*(.*)$/i))){
      if(!ls){ errors.push({line:n, msg:`Mục "${m[1]}" nằm ngoài lesson.`}); return; }
      const k=m[1].toLowerCase(); if(!KEYS.includes(k)){ warns.push({line:n, msg:`Mục không nhận diện "${k}" sẽ bị bỏ qua.`}); return; }
      if(m[2].trim()==='|'){ block={key:k, buf:[]}; return; }
      ls[k]=m[2].trim(); return;
    }
    warns.push({line:n, msg:'Dòng không đúng mẫu, bị bỏ qua.'});
  });
  if(block && ls) ls[block.key]=block.buf.join(block.key==='dialogue'?'\n':' ');
  if(!cur){ errors.push({line:1, msg:'Thiếu tiêu đề giáo trình (# Tên giáo trình).'}); return {errors, warns}; }
  // build
  let nLs=0, nV=0, nG=0; const cid='imp-'+slug(cur.name);
  const out = {id:cid, name:cur.name, subject:'Tiếng Anh', age:'', cefr:[...new Set(cur.levels.map(l=>l.cefr))].join(' → '), version:cur.version, status:'active', imported:true,
    levels:cur.levels.map((l,li)=>({id:`${cid}-l${li+1}`, name:l.name, cefr:l.cefr, soft:/B/.test(l.cefr)?18:/A2/.test(l.cefr)?13:10, hard:/B/.test(l.cefr)?26:/A2/.test(l.cefr)?18:14,
      units:l.units.map((u,ui)=>({id:`${cid}-l${li+1}-u${ui+1}`, code:u.code, name:u.name, lessons:u.lessons.map((x,xi)=>{
        nLs++;
        const vocab = String(x.vocabulary||'').split(';').map(s=>s.trim()).filter(Boolean).map(s=>{ const p=s.split('|').map(t=>t.trim()); const em=p.find((t,k)=>k>1 && /\p{Extended_Pictographic}/u.test(t))||''; const vi=p[2] && !/\p{Extended_Pictographic}/u.test(p[2])?p[2]:''; return {w:(p[0]||'').toLowerCase(), pos:p[1]||'', vi, emoji:em, def:''}; });
        const seen={}; vocab.forEach(v=>{ if(seen[v.w]) warns.push({line:x.line, msg:`Lesson ${x.code}: từ vựng trùng "${v.w}".`}); seen[v.w]=1; }); nV+=vocab.length;
        const grammar = String(x.grammar||'').split(';').map(s=>s.trim()).filter(Boolean); nG+=grammar.length;
        const objectives = String(x.objectives||'').split(';').map(s=>s.trim()).filter(Boolean);
        if(!objectives.length && !vocab.length && !grammar.length) errors.push({line:x.line, msg:`Lesson ${x.code}: cần ít nhất một trong objectives, vocabulary, grammar.`});
        else if(!objectives.length) warns.push({line:x.line, msg:`Lesson ${x.code} không có mục tiêu (objectives).`});
        const passage = x.passage||''; const sents = String(x.sentences||'').split(';').map(s=>s.trim()).filter(Boolean);
        return {id:`${cid}-l${li+1}-u${ui+1}-${xi+1}`, code:x.code, name:x.name, objectives, vocab, grammar, skills:String(x.skills||'reading').split(',').map(s=>s.trim()).filter(Boolean), topic:x.topic||'', topicKeys:[x.topic||''].concat(vocab.slice(0,4).map(v=>v.w)).filter(Boolean),
          banned:String(x.forbidden||'').split(',').map(s=>s.trim()).filter(Boolean), passages:passage?[passage]:[], dialogue:x.dialogue||'', sentenceBank:sents.length?sents:V.sentences(passage),
          tfngBank:[], qaBank:[], wordFamilies:[], rewritePairs:[], imageKeywords:vocab.slice(0,3).map(v=>v.w), names:{}, allowedExtra:String(x.allowed_extra||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)};
      })}))}))};
  if(!out.levels.length) errors.push({line:cur.line, msg:'Giáo trình chưa có Level nào (##).'});
  return {curriculum:out, errors, warns, stats:{levels:out.levels.length, units:out.levels.reduce((a,l)=>a+l.units.length,0), lessons:nLs, vocab:nV, grammar:nG}};
};
WS.curriculumToMd = (c) => `# ${c.name}\nversion: ${c.version}\n\n`+c.levels.map(l=>`## ${l.name} (${l.cefr})\n`+l.units.map(u=>`### ${u.code} ${u.name}\n`+u.lessons.map(x=>`#### ${x.code} ${x.name}\n- objectives: ${x.objectives.join('; ')}\n- vocabulary: ${x.vocab.map(v=>[v.w,v.pos,v.vi,v.emoji].filter(Boolean).join(' | ')).join('; ')}\n- grammar: ${x.grammar.join('; ')}\n- skills: ${x.skills.join(', ')}\n- topic: ${x.topic}\n- forbidden: ${x.banned.join(', ')}\n${x.passages[0]?`- passage: |\n    ${x.passages[0]}\n`:''}${x.dialogue?`- dialogue: |\n${x.dialogue.split('\n').map(l=>'    '+l).join('\n')}\n`:''}- sentences: ${x.sentenceBank.join('; ')}\n`).join('\n')).join('\n')).join('\n');

/* ---------- lesson file checks (D-112) ---------- */
WS.checkLessonFile = (kind, text, lesson) => {
  const errs=[], warns=[]; const t=String(text||''); const lines=t.split('\n');
  const has = re => re.test(t); const lineOf = re => { const i=lines.findIndex(l=>re.test(l)); return i<0?null:i+1; };
  if(!t.trim()){ errs.push({line:1, msg:'Tệp đang trống.'}); return {errs, warns}; }
  if(kind==='knowledge'){
    if(!has(/^##\s*Trọng tâm/im)) errs.push({line:1, msg:'Thiếu mục "## Trọng tâm".'});
    else { if(!has(/^-\s*vocabulary:/im)) errs.push({line:lineOf(/^##\s*Trọng tâm/im), msg:'Mục Trọng tâm cần dòng "- vocabulary:".'}); if(!has(/^-\s*grammar:/im)) errs.push({line:lineOf(/^##\s*Trọng tâm/im), msg:'Mục Trọng tâm cần dòng "- grammar:".'}); }
    [['Ôn tập',/^##\s*Ôn tập/im],['Vùng cấm',/^##\s*Vùng cấm/im],['Vùng được phép',/^##\s*Vùng được phép/im],['Giới hạn',/^##\s*Giới hạn/im]].forEach(([n,re])=>{ if(!has(re)) warns.push({line:null, msg:`Thiếu mục "## ${n}".`}); });
    if(!has(/min_repeat/i)) warns.push({line:null, msg:'Thiếu quy ước min_repeat (số lần tối thiểu mỗi mục trọng tâm).'});
    const vl = lines.findIndex(l=>/^-\s*vocabulary:/i.test(l)); if(vl>=0 && lesson){ const words=lines[vl].split(':').slice(1).join(':').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean); const known=lesson.vocab.map(v=>v.w); words.filter(w=>!known.includes(w)).forEach(w=>warns.push({line:vl+1, msg:`Từ trọng tâm "${w}" không có trong dữ liệu lesson.`})); }
    const fl = lines.findIndex(l=>/^-\s*forbidden:/i.test(l)); if(fl>=0){ const fb=lines[fl].split(':').slice(1).join(':').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean); lines.forEach((l,i)=>{ if(/example/i.test(l)) fb.forEach(b=>{ if(new RegExp('\\b'+b+'\\b','i').test(l)) warns.push({line:i+1, msg:`Ví dụ chứa "${b}" thuộc Vùng cấm.`}); }); }); }
  } else if(kind==='skill'){
    if(!has(/^##\s*Quy tắc cứng/im)) errs.push({line:1, msg:'Thiếu mục "## Quy tắc cứng".'}); else if(!has(/^-\s*R-\d+/im)) errs.push({line:lineOf(/^##\s*Quy tắc cứng/im), msg:'Quy tắc cứng cần các dòng dạng "- R-1: …".'});
    if(!has(/^##\s*Quy tắc mềm/im)) warns.push({line:null, msg:'Thiếu mục "## Quy tắc mềm".'}); if(!has(/^##\s*Cách dùng theme/im)) warns.push({line:null, msg:'Thiếu mục "## Cách dùng theme".'});
  } else if(kind==='gold'){ if(!has(/^###\s+\S/m)) errs.push({line:1, msg:'Cần ít nhất một bài mẫu dạng "### Tên bài".'}); }
  return {errs, warns};
};
