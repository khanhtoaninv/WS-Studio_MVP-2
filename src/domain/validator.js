/* ============ STANDARDS + VALIDATOR ============ */
import { WS } from '../ws.js';
const U = WS.U, Q = WS.Q;
const V = WS.V = {};
const cache = {};

V.allowedSet = (lessonIds, themeId) => {
  const key = (lessonIds||[]).join(',')+'|'+(themeId||'')+'|'+(WS.S.state.curriculaRev||0);
  if(cache[key]) return cache[key];
  const set = new Set(WS.FUNCTION_WORDS);
  const vocab = new Set();
  const add = (s, into=set) => U.words(s).forEach(w=>into.add(w));
  const seen = new Set();
  (lessonIds||[]).forEach(id=>{
    const pool = Q.prevLessons(id).concat([Q.lesson(id)].filter(Boolean));
    pool.forEach(ls=>{
      if(seen.has(ls.id)) return; seen.add(ls.id);
      ls.vocab.forEach(v=>{ add(v.w); if(ls.id===id) add(v.w, vocab); });
      [ls.passages.join(' '), ls.dialogue, ls.sentenceBank.join(' '), (ls.tfngBank||[]).map(t=>t.s).join(' '), (ls.qaBank||[]).map(q=>q.q+' '+q.a.join(' ')).join(' '),
       (ls.wordFamilies||[]).map(w=>w.text+' '+w.ans.join(' ')+' '+w.base).join(' '), (ls.rewritePairs||[]).map(r=>r.original+' '+r.accepted.join(' ')).join(' '),
       (ls.allowedExtra||[]).join(' '), Object.keys(ls.names||{}).join(' ')].forEach(t=>add(t));
    });
  });
  const th = themeId && Q.theme(themeId); if(th) th.chars.forEach(c=>add(c.n));
  return cache[key] = {set, vocab};
};
V.isAllowed = (word, set) => U.stem(word).some(w=>set.has(w)) || /^\d/.test(word);

V.textsOf = (draft, type) => {
  const out = [];
  const push = (qid, text, kind='q') => { if(text) out.push({qid, text:String(text), kind}); };
  if(draft.passage) push(null, draft.passage, 'passage');
  (draft.questions||[]).forEach(q=>{
    switch(type){
      case 'mcq': push(q.id, q.stem.replace(/_{2,}/g, (q.options.find(o=>o.id===q.correctId)||{}).text||'')); q.options.forEach(o=>push(q.id,o.text,'opt')); break;
      case 'fill_blank': push(q.id, q.text.replace(/_{2,}/g, (q.accepted||[])[0]||'')); break;
      case 'matching': push(q.id, q.left, 'opt'); push(q.id, q.right, 'opt'); break;
      case 'ordering': push(q.id, (q.items||[]).join(' ')); break;
      case 'tfng': push(q.id, q.statement); break;
      case 'cloze_mcq': (q.options||[]).forEach(o=>push(q.id,o,'opt')); break;
      case 'word_form': push(q.id, q.text.replace(/_{2,}/g,(q.accepted||[])[0]||'')); break;
      case 'rewrite': push(q.id, q.original); push(q.id, (q.accepted||[])[0]||''); break;
      case 'short_answer': push(q.id, q.question); (q.accepted||[]).slice(0,1).forEach(a=>push(q.id,a,'opt')); break;
    }
  });
  return out;
};
V.sentences = t => String(t).split(/(?<=[.!?])\s+/).filter(Boolean);
V.norm = s => String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();

/* main validate */
V.validate = (ex, opts={}) => {
  const d = opts.draft || ex.draft; const type = ex.type;
  const lessonId = (ex.scope.lessonIds||[])[0];
  const ctx = Q.lessonCtx(lessonId); const lesson = ctx && ctx.ls; const level = ctx && ctx.l;
  const std = Q.standard(type) || {minQ:1,maxQ:99,maxWords:30};
  const strict = (WS.S.state.settings||{}).strictness || 'std';
  const issues = []; const add = (code, sev, msg, qid, extra={}) => issues.push(Object.assign({code, sev, msg, qid:qid||null}, extra));
  const qs = d.questions||[];
  const qno = id => { const i=qs.findIndex(q=>q.id===id); return i<0?'':'Câu '+(i+1)+': '; };

  // V01
  if(qs.length < std.minQ || qs.length > std.maxQ) add('V01','e',`Có ${qs.length} câu, tiêu chuẩn ${std.id} cho phép ${std.minQ}–${std.maxQ}.`);
  // V02 / V03 / V04-7 per type
  const needPassage = ['tfng','cloze_mcq'].includes(type);
  if(needPassage && !String(d.passage||'').trim()) add('V02','e','Bài cần đoạn văn nhưng đang trống.');
  qs.forEach((q,i)=>{
    const p = `Câu ${i+1}: `;
    switch(type){
      case 'mcq': {
        if(!String(q.stem||'').trim()) add('V02','e',p+'thiếu đề.',q.id);
        const opts=(q.options||[]).filter(o=>String(o.text).trim());
        if(!q.correctId || !opts.find(o=>o.id===q.correctId)) add('V03','e',p+'chưa chọn đáp án đúng.',q.id);
        if(opts.length<3||opts.length>4) add('V04','e',p+`có ${opts.length} lựa chọn, cần 3–4.`,q.id);
        const ns=opts.map(o=>V.norm(o.text)); if(new Set(ns).size!==ns.length) add('V04','e',p+'có lựa chọn trùng nhau.',q.id);
        break; }
      case 'fill_blank': case 'word_form': {
        const blanks=(String(q.text||'').match(/_{2,}/g)||[]).length;
        if(!String(q.text||'').trim()) add('V02','e',p+'thiếu câu.',q.id);
        if(type==='word_form' && !String(q.baseWord||'').trim()) add('V02','e',p+'thiếu từ gốc.',q.id);
        if(!(q.accepted||[]).filter(Boolean).length) add('V03','e',p+'chưa có đáp án chấp nhận.',q.id);
        if(blanks!==1) add('V05','e',p+`có ${blanks} chỗ trống, cần đúng 1 chỗ trống (___).`,q.id);
        break; }
      case 'matching':
        if(!String(q.left||'').trim()||!String(q.right||'').trim()) add('V02','e',p+'thiếu một vế của cặp nối.',q.id);
        break;
      case 'ordering': {
        if((q.items||[]).length<2) add('V02','e',p+'cần ít nhất 2 mục để sắp xếp.',q.id);
        const sh=q.shuffle||[]; if(sh.length && sh.every((v,k)=>v===k)) add('V07','e',p+'thứ tự hiển thị chưa được xáo.',q.id);
        break; }
      case 'tfng':
        if(!String(q.statement||'').trim()) add('V02','e',p+'thiếu nhận định.',q.id);
        if(!['T','F','NG'].includes(q.answer)) add('V03','e',p+'chưa chọn T/F/NG.',q.id);
        break;
      case 'cloze_mcq': {
        const opts=(q.options||[]).filter(o=>String(o).trim());
        if(opts.length!==3 && opts.length!==4) add('V04','e',p+`chỗ trống ${q.n} có ${opts.length} lựa chọn.`,q.id);
        if(q.correctIdx==null||!opts[q.correctIdx]) add('V03','e',p+`chỗ trống ${q.n} chưa có đáp án.`,q.id);
        if(new Set(opts.map(V.norm)).size!==opts.length) add('V04','e',p+'có lựa chọn trùng nhau.',q.id);
        break; }
      case 'rewrite':
        if(!String(q.original||'').trim()) add('V02','e',p+'thiếu câu gốc.',q.id);
        if(!(q.accepted||[]).filter(Boolean).length) add('V03','e',p+'chưa có đáp án chấp nhận.',q.id);
        break;
      case 'short_answer':
        if(!String(q.question||'').trim()) add('V02','e',p+'thiếu câu hỏi.',q.id);
        if(!(q.accepted||[]).filter(Boolean).length) add('V03','e',p+'chưa có đáp án chấp nhận.',q.id);
        break;
    }
  });
  if(type==='matching'){
    const nk=x=>String(x||'').trim().toLowerCase().replace(/\s+/g,' '); const L=qs.map(q=>nk(q.left)), R=qs.map(q=>nk(q.right)).concat((d.extraRight||[]).map(nk));
    if(new Set(L).size!==L.length || new Set(R).size!==R.length) add('V06','e','Có mục nối bị trùng; mỗi mục chỉ ghép với một mục.');
    if((d.extraRight||[]).length > (std.maxDistractors||2)) add('V06','e',`Có ${(d.extraRight||[]).length} mục nhiễu, tối đa ${std.maxDistractors||2}.`);
  }
  if(type==='cloze_mcq'){
    const gaps=(String(d.passage||'').match(/\{(\d+)\}/g)||[]).map(g=>+g.slice(1,-1));
    if(gaps.length!==qs.length) add('V05','e',`Đoạn văn có ${gaps.length} chỗ trống nhưng có ${qs.length} bộ lựa chọn.`);
    if(U.wc(String(d.passage||'').replace(/\{\d+\}/g,'x'))>std.maxWords) add('V10','w',`Đoạn văn dài hơn ${std.maxWords} từ.`);
  }
  if(['tfng','short_answer'].includes(type) && !String(d.passage||'').trim() && type==='tfng') {}

  // language scans
  const texts = V.textsOf(d, type);
  const al = V.allowedSet(ex.scope.lessonIds, opts.themeId||ex.themeId);
  const oosBy = {}; const banBy = {};
  const sevScope = strict==='std'?'w':'e';
  texts.forEach(t=>{
    const plain = t.text.replace(/\{\d+\}/g,' ');
    U.words(plain).forEach(w=>{ if(!V.isAllowed(w, al.set)){ (oosBy[t.qid||'_']=oosBy[t.qid||'_']||new Set()).add(w); } });
    const low = ' '+plain.toLowerCase().replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ')+' ';
    (lesson?lesson.banned:[]).forEach(b=>{ if(low.includes(' '+b.toLowerCase()+' ')) (banBy[t.qid||'_']=banBy[t.qid||'_']||new Set()).add(b); });
    U.words(plain).forEach(w=>{ if(WS.UNSAFE.includes(w)) add('V13','e',(t.qid?qno(t.qid):'')+`từ "${w}" không phù hợp lứa tuổi.`, t.qid, {word:w}); });
    if(t.kind!=='opt'){
      V.sentences(plain).forEach(sn=>{
        const n=U.wc(sn); const hard=Math.min(level?level.hard:30, (type==='cloze_mcq'||t.kind==='passage')?99:std.maxWords+4);
        const soft=Math.min(level?level.soft:20, std.maxWords);
        if(level && n>level.hard) add('V17','e',(t.qid?qno(t.qid):'Đoạn văn: ')+`câu ${n} từ, vượt trần ${level.hard} từ của ${level.cefr}.`, t.qid, {long:true});
        else if(n>soft && t.kind!=='passage') add('V10','w',(t.qid?qno(t.qid):'')+`câu ${n} từ, khuyến nghị tối đa ${soft}.`, t.qid, {long:true});
      });
    }
  });
  Object.entries(oosBy).forEach(([qid,set])=>{ const ws=[...set]; add('V08', sevScope, (qid!=='_'?qno(qid):'Đoạn văn: ')+`từ ngoài phạm vi: ${ws.map(w=>'"'+w+'"').join(', ')}.`, qid==='_'?null:qid, {words:ws}); });
  Object.entries(banBy).forEach(([qid,set])=>{ const ws=[...set]; add('V09', sevScope, (qid!=='_'?qno(qid):'Đoạn văn: ')+`chứa nội dung cấm/chưa học: ${ws.map(w=>'"'+w+'"').join(', ')}.`, qid==='_'?null:qid, {words:ws}); });

  // V11 duplicates
  const seen={}; qs.forEach(q=>{ const t=V.norm(V.textsOf({questions:[q]},type).filter(x=>x.kind!=='opt').map(x=>x.text).join(' ')||q.left||''); if(!t) return; if(seen[t]) add('V11','w',qno(q.id)+`trùng với ${qno(seen[t]).replace(': ','')}.`,q.id); else seen[t]=q.id; });
  // V12 ambiguity
  if(type==='mcq') qs.forEach(q=>{ const c=(q.options.find(o=>o.id===q.correctId)||{}).text; if(!c) return; const st=V.norm(q.stem); q.options.forEach(o=>{ if(o.id!==q.correctId && V.norm(o.text)===V.norm(c)) add('V12','w',qno(q.id)+'có lựa chọn giống đáp án đúng.',q.id); }); if(st.includes(V.norm(c))&&V.norm(c).length>2) add('V12','w',qno(q.id)+'đáp án đã xuất hiện trong đề.',q.id); });
  if(type==='fill_blank') qs.forEach(q=>{ if((q.accepted||[]).length>4) add('V12','w',qno(q.id)+'có nhiều đáp án chấp nhận, dễ mơ hồ.',q.id); });
  // V14
  const iw = U.wc(d.instruction); if(!iw) add('V14','w','Thiếu hướng dẫn cho học sinh.'); else if(iw>25) add('V14','w',`Hướng dẫn dài ${iw} từ, nên dưới 25 từ.`);
  // V15
  (d.media||[]).forEach(mid=>{ const m=Q.media(mid); if(!m) return; if(m.kind==='image' && !String(m.alt||'').trim()) add('V15','w','Ảnh chưa có mô tả (alt text).'); if(m.kind==='audio' && !String(m.transcript||'').trim()) add('V15','w','Audio chưa có transcript.'); });
  // V16 topic
  if(lesson){
    const all = texts.map(t=>t.text).join(' '); const toks=new Set(U.words(all).flatMap(U.stem));
    const keys = lesson.topicKeys.concat(lesson.vocab.map(v=>v.w.split(' ')[0]));
    if(qs.length && !keys.some(k=>toks.has(k.toLowerCase()))) add('V16', strict==='max'?'e':'w', `Chưa thấy từ nào thuộc chủ đề "${lesson.topic}" của lesson.`);
  }
  return V.summarize(issues);
};

V.summarize = issues => {
  const scores = {}; WS.CRITERIA.forEach(c=>{ let s=100; issues.forEach(i=>{ if(c.rules.includes(i.code)) s -= i.sev==='e'?25:8; }); scores[c.k]=Math.max(0,s); });
  const errors = issues.filter(i=>i.sev==='e'), warnings = issues.filter(i=>i.sev==='w');
  const pass = !errors.length && Object.values(scores).every(v=>v>=70);
  const byQ = {}; issues.forEach(i=>{ const k=i.qid||'_'; (byQ[k]=byQ[k]||[]).push(i); });
  return {issues, errors, warnings, scores, pass, byQ};
};

/* worksheet-level compliance (A6) */
V.worksheet = (ws) => {
  const items = ws.items.map(it=>({it, ex:Q.ex(it.exerciseId)})).filter(x=>x.ex);
  const lesson = Q.lesson(ws.scope.lessonIds[0]);
  const text = items.map(x=>V.textsOf(x.ex.draft, x.ex.type).map(t=>t.text).join(' ')).join(' ');
  const toks = new Set(U.words(text).flatMap(U.stem));
  const vocab = lesson ? lesson.vocab.map(v=>v.w) : [];
  const used = vocab.filter(w=>w.split(' ').every(p=>toks.has(p.toLowerCase())));
  const totalQ = items.reduce((s,x)=>s+(x.ex.draft.questions||[]).length,0);
  const minutes = items.reduce((s,x)=>s+Math.ceil((x.ex.draft.questions||[]).length*({mcq:.6,fill_blank:.7,matching:.4,ordering:1,tfng:.7,cloze_mcq:.8,word_form:.8,rewrite:1.5,short_answer:1.2}[x.ex.type]||1))+(x.ex.draft.passage?2:0),0);
  const diffs = items.map(x=>x.ex.draft.difficulty||'medium');
  const sentIdx = {}; const dupes=[];
  items.forEach((x,i)=>V.textsOf(x.ex.draft,x.ex.type).filter(t=>t.kind==='q').forEach(t=>{ const n=V.norm(t.text); if(n.length<8) return; if(sentIdx[n]!=null && sentIdx[n]!==i) dupes.push({a:sentIdx[n]+1,b:i+1,text:t.text}); else sentIdx[n]=i; }));
  const errs = items.reduce((s,x)=>s+V.validate(x.ex).errors.length,0), warns = items.reduce((s,x)=>s+V.validate(x.ex).warnings.length,0);
  const cov = vocab.length?Math.round(used.length/vocab.length*100):0;
  const balance = new Set(diffs).size>1 || items.length<2;
  let level = 100 - errs*12 - warns*3 - dupes.length*6 - (cov<50?15:cov<75?6:0) - (balance?0:5);
  return {used, vocab, cov, totalQ, minutes, dupes, errs, warns, balance, diffs, level:Math.max(0,Math.min(100,level))};
};
