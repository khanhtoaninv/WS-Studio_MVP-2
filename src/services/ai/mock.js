/* ============ MOCK AI: generation, autofix, layout, planning, media ============ */
import { WS } from '../../ws.js';
const U = WS.U, Q = WS.Q, V = WS.V;
const AI = WS.AI = {};

AI.TITLES = {
  mcq:['Choose the correct word','Pick the best answer','Circle the right word','Which word fits?'],
  fill_blank:['Complete the sentences','Fill in the gaps','Missing words','Finish the sentences'],
  matching:['Match the words','Word and picture match','Find the pairs','Connect the words'],
  ordering:['Make sentences','Put the words in order','Sentence builder','Unscramble the sentences'],
  tfng:['True, false or not given?','Read and decide','Check the facts','Reading check'],
  cloze_mcq:['Complete the text','Fill the gaps in the story','Choose the missing words','Text gaps'],
  word_form:['Word formation','Change the word','Word families','Make the right form'],
  rewrite:['Rewrite the sentences','Say it another way','Sentence transformation','Same meaning, new start'],
  short_answer:['Answer the questions','Read and answer','Quick answers','Find the answers']
};
AI.instruction = (type, d) => type==='mcq' ? `Choose the correct answer: ${'ABCD'.slice(0,((d.questions[0]||{}).options||[1,2,3]).length).split('').join(', ').replace(/, (\w)$/,' or $1')}.` : ({
  fill_blank: d.wordBank&&d.wordBank.length?'Fill in the blanks with the words in the box.':'Complete the sentences with one word.',
  matching: d.matchMode==='emoji'?'Match the words with the pictures.':'Match the words with their meanings.',
  ordering:'Put the words in the correct order to make sentences.',
  tfng:'Read the text. Write T (true), F (false) or NG (not given).',
  cloze_mcq:'Read the text and choose the correct word for each gap.',
  word_form:'Use the word in capitals to form a word that fits the gap.',
  rewrite:'Rewrite the sentences. Begin with the words given.',
  short_answer:'Read the text and answer the questions. Use no more than five words.'
}[type]);

AI.available = (lesson, type) => {
  const sv = lesson.vocab.filter(v=>!v.w.includes(' ')).map(v=>v.w);
  const sentHit = lesson.sentenceBank.filter(s=>U.words(s).some(w=>sv.includes(w))).length;
  const ordOk = lesson.sentenceBank.filter(s=>U.wc(s)>=3 && U.wc(s)<=9).length;
  const p = (lesson.passages||[])[0]||'';
  const clozeHits = sv.filter(w=>new RegExp('\\b'+w+'\\b','i').test(p)).length;
  const m = {
    mcq:{max:sentHit}, fill_blank:{max:sentHit}, matching:{max:lesson.vocab.length}, ordering:{max:ordOk},
    tfng:{max:p?(lesson.tfngBank||[]).length:0, reason:'Lesson chưa có đoạn văn hoặc nhận định mẫu.'},
    cloze_mcq:{max:p?clozeHits:0, reason:'Đoạn văn của lesson chứa quá ít từ vựng để tạo chỗ trống.'},
    word_form:{max:(lesson.wordFamilies||[]).length, reason:'Lesson chưa có dữ liệu họ từ (wordFamilies), không sinh được loại Biến đổi từ.'},
    rewrite:{max:(lesson.rewritePairs||[]).length, reason:'Lesson chưa có cặp câu tương đương (rewritePairs), không sinh được loại Viết lại câu.'},
    short_answer:{max:p?(lesson.qaBank||[]).length:0, reason:'Lesson chưa có câu hỏi đọc hiểu mẫu.'}
  }[type];
  const std = Q.standard(type);
  m.ok = m.max >= std.minQ;
  if(!m.ok && !m.reason) m.reason = `Lesson chỉ đủ dữ liệu cho ${m.max} câu, tiêu chuẩn cần tối thiểu ${std.minQ}.`;
  m.max = Math.min(m.max, std.maxQ);
  return m;
};

/* theme name mapping */
AI.nameMap = (lesson, themeId) => {
  const th = themeId && Q.theme(themeId); if(!th) return {};
  const f = th.chars.filter(c=>c.g==='f'), m = th.chars.filter(c=>c.g==='m'); let fi=0, mi=0; const map={};
  Object.entries(lesson.names||{}).forEach(([n,g])=>{ const pool=g==='f'?f:m; if(!pool.length) return; map[n]=pool[(g==='f'?fi++:mi++)%pool.length].n; });
  return map;
};
AI.applyNames = (s, map) => { let out=String(s); Object.entries(map).forEach(([a,b])=>{ out=out.replace(new RegExp('\\b'+a+'\\b','g'), b); }); return out; };
AI.themeTitle = (base, themeId, idx) => { const th=themeId&&Q.theme(themeId); if(!th) return base; const c=th.chars[idx%th.chars.length]; return `${base} with ${c.n}`; };

const vocabSingles = l => l.vocab.filter(v=>!v.w.includes(' '));
const capFirst = s => s.charAt(0).toUpperCase()+s.slice(1);
const blankWord = (sentence, w) => sentence.replace(new RegExp('\\b'+w+'\\b','i'), '___');

function distractors(lesson, word, n, r){
  const target = lesson.vocab.find(v=>v.w===word); const pos = target&&target.pos;
  let pool = vocabSingles(lesson).filter(v=>v.w!==word && (!pos || v.pos===pos)).map(v=>v.w);
  if(pool.length<n) pool = pool.concat(vocabSingles(lesson).filter(v=>v.w!==word && !pool.includes(v.w)).map(v=>v.w));
  return U.shuffle(pool, r).slice(0,n);
}

AI.generate = (lessonId, type, o={}) => {
  const lesson = Q.lesson(lessonId); const r = U.rng(`${lessonId}|${type}|${o.seed||0}`);
  const std = Q.standard(type); const diff = o.difficulty||'medium';
  const avail = AI.available(lesson, type);
  let count = Math.max(1, Math.min(o.count||std.minQ, std.maxQ));
  const log = [];
  const nm = AI.nameMap(lesson, o.themeId);
  const d = {title:'', instruction:'', passage:'', questions:[], extraRight:[], wordBank:[], media:[], layout:o.layout||WS.S.state.layoutDefaults[type]||'L1',
             difficulty:diff, explanationsOn:o.explanations!==false, aiNote:o.note||'', matchMode:''};
  const nOpts = diff==='hard'?4:3;
  const sv = vocabSingles(lesson).map(v=>v.w);
  const pickSentences = () => U.shuffle(lesson.sentenceBank.filter(s=>U.words(s).some(w=>sv.includes(w))), r);
  let notes = String(o.note||'').toLowerCase();
  let prefer = null; const m = notes.match(/(?:dùng từ|use)\s+([a-z]+)/); if(m) prefer = m[1];
  if(notes){ const known = ['ngắn','short','dễ','easy','gia đình','family','dùng từ','use']; const unk = notes.split(/[,;]/).map(s=>s.trim()).filter(s=>s && !known.some(k=>s.includes(k))); if(unk.length) log.push(`Bỏ qua ghi chú không hiểu: "${unk.join(', ')}".`); if(/ngoài bài|out of scope/.test(notes)) log.push('Chặn yêu cầu "dùng từ ngoài bài" vì vượt phạm vi lesson (BR-02).'); }
  const shortFirst = /ngắn|short/.test(notes);

  switch(type){
    case 'mcq': case 'fill_blank': {
      let sents = pickSentences(); if(shortFirst) sents.sort((a,b)=>U.wc(a)-U.wc(b));
      if(prefer) sents.sort((a,b)=>(U.words(b).includes(prefer)?1:0)-(U.words(a).includes(prefer)?1:0));
      sents.slice(0,count).forEach(s=>{
        const cand = U.words(s).filter(w=>sv.includes(w)); const w = prefer&&cand.includes(prefer)?prefer:U.pick(cand,r);
        const stem = AI.applyNames(blankWord(s,w), nm);
        if(type==='mcq'){
          const opts = U.shuffle([w].concat(distractors(lesson,w,nOpts-1,r)), r).map((t,i)=>({id:'o'+i, text:t}));
          d.questions.push({id:U.uid('q'), stem, options:opts, correctId:opts.find(x=>x.text===w).id, explanation:`"${w}" makes the sentence correct.`});
        } else {
          d.questions.push({id:U.uid('q'), text:stem, accepted:[w], explanation:`The missing word is "${w}".`});
        }
      });
      if(type==='fill_blank' && diff!=='hard'){ d.wordBank = U.shuffle(d.questions.map(q=>q.accepted[0]).concat(diff==='medium'?distractors(lesson,'',1,r):[]), r); }
      break; }
    case 'matching': {
      const emoji = lesson.vocab.every(v=>v.emoji) && diff!=='hard' && Q.lessonCtx(lessonId).l.cefr!=='B1';
      d.matchMode = emoji?'emoji':'def';
      U.shuffle(lesson.vocab.filter(v=>emoji?v.emoji:(v.def||v.emoji)), r).slice(0,count).forEach(v=>{
        d.questions.push({id:U.uid('q'), left:v.w, right:emoji?v.emoji:(v.def||v.emoji), explanation:`${v.w}: ${v.def||v.vi}`});
      });
      if(diff==='hard'){ const extra = lesson.vocab.find(v=>!d.questions.some(q=>q.left===v.w)); if(extra) d.extraRight=[emoji?extra.emoji:(extra.def||extra.emoji)]; }
      break; }
    case 'ordering': {
      let sents = U.shuffle(lesson.sentenceBank.filter(s=>U.wc(s)>=3 && U.wc(s)<=9), r); if(shortFirst) sents.sort((a,b)=>U.wc(a)-U.wc(b));
      sents.slice(0,count).forEach(s=>{
        const items = AI.applyNames(s,nm).replace(/[.?!]$/,'').split(/\s+/);
        let sh = U.shuffle(items.map((_,i)=>i), r); let k=0; while(sh.every((v,i)=>v===i) && k++<5) sh = U.shuffle(sh, r);
        if(sh.every((v,i)=>v===i)) sh.reverse();
        d.questions.push({id:U.uid('q'), items, shuffle:sh, punct:(s.match(/[.?!]$/)||['.'])[0], explanation:`Correct order: ${items.join(' ')}${(s.match(/[.?!]$/)||['.'])[0]}`});
      });
      break; }
    case 'tfng': {
      d.passage = AI.applyNames(lesson.passages[0]||'', nm);
      U.shuffle(lesson.tfngBank||[], r).slice(0,count).forEach(t=>d.questions.push({id:U.uid('q'), statement:AI.applyNames(t.s,nm), answer:t.a, explanation:{T:'The text says this.',F:'The text says something different.',NG:'The text does not give this information.'}[t.a]}));
      break; }
    case 'cloze_mcq': {
      let p = AI.applyNames(lesson.passages[0]||'', nm);
      const hits = U.shuffle(sv.filter(w=>new RegExp('\\b'+w+'\\b','i').test(p)), r).slice(0,count);
      const ordered = hits.map(w=>({w, i:p.search(new RegExp('\\b'+w+'\\b','i'))})).sort((a,b)=>a.i-b.i);
      ordered.forEach((h,k)=>{ const n=k+1; const mt=p.match(new RegExp('\\b'+h.w+'\\b','i')); p = p.replace(new RegExp('\\b'+h.w+'\\b','i'), `{${n}}`);
        const opts = U.shuffle([mt[0]].concat(distractors(lesson,h.w,2,r)), r);
        d.questions.push({id:U.uid('q'), n, options:opts, correctIdx:opts.indexOf(mt[0]), explanation:`Gap ${n}: "${mt[0]}".`}); });
      d.passage = p; break; }
    case 'word_form': {
      U.shuffle(lesson.wordFamilies||[], r).slice(0,count).forEach(w=>d.questions.push({id:U.uid('q'), text:AI.applyNames(w.text,nm), baseWord:w.base, accepted:w.ans.slice(), explanation:`${w.base} → ${w.ans[0]}`}));
      break; }
    case 'rewrite': {
      U.shuffle(lesson.rewritePairs||[], r).slice(0,count).forEach(w=>d.questions.push({id:U.uid('q'), original:AI.applyNames(w.original,nm), lead:AI.applyNames(w.lead,nm), accepted:w.accepted.map(a=>AI.applyNames(a,nm)), explanation:'Keep the same meaning with the new beginning.'}));
      break; }
    case 'short_answer': {
      d.passage = AI.applyNames(lesson.passages[0]||'', nm);
      U.shuffle(lesson.qaBank||[], r).slice(0,count).forEach(q=>d.questions.push({id:U.uid('q'), question:AI.applyNames(q.q,nm), accepted:q.a.map(a=>AI.applyNames(a,nm)), maxWords:5, explanation:`Model answer: ${AI.applyNames(q.a[0],nm)}`}));
      break; }
  }
  if(d.questions.length < count) log.push(`Dữ liệu lesson chỉ đủ ${d.questions.length}/${count} câu cho loại ${WS.TYPES[type].label}.`);
  const tIdx = Math.floor(r()*4);
  d.title = AI.themeTitle(AI.TITLES[type][tIdx], o.themeId, o.blockIndex||0);
  d.instruction = AI.instruction(type, d);
  if(Object.keys(nm).length) log.push('Theme: đổi tên '+Object.entries(nm).map(([a,b])=>`${a} → ${b}`).join(', ')+'.');
  if(!d.explanationsOn) d.questions.forEach(q=>q.explanation='');
  return {draft:d, log, avail};
};

/* fault injection + autofix */
AI.injectFault = (draft, type, lesson, mode) => {
  if(mode==='off' || !mode) return [];
  const notes=[]; const std=Q.standard(type);
  const field = q => ({mcq:'stem',fill_blank:'text',tfng:'statement',word_form:'text',rewrite:'original',short_answer:'question',matching:'left'}[type]);
  const q0 = draft.questions[0];
  if(mode==='fixable'){
    if(q0 && field(q0) && type!=='matching'){ q0[field(q0)] = String(q0[field(q0)]).replace(/\.$/,'')+' magnificent.'; notes.push('chèn từ ngoài phạm vi "magnificent"'); }
    while(draft.questions.length <= std.maxQ){ const c=U.clone(draft.questions[draft.questions.length-1]||{}); c.id=U.uid('q'); draft.questions.push(c); }
    notes.push(`sinh dư câu (${draft.questions.length} > ${std.maxQ})`);
  } else if(mode==='hard'){
    draft.questions = draft.questions.slice(0, Math.max(1,std.minQ-1)); notes.push(`thiếu câu (${draft.questions.length} < ${std.minQ})`);
    if(q0 && field(q0) && type!=='matching'){ q0[field(q0)] = String(q0[field(q0)]).replace(/\.$/,'')+` ${lesson.banned[0]||'magnificent'} spaceship.`; notes.push(`chèn "${lesson.banned[0]}" và "spaceship"`); }
  }
  return notes;
};
AI.autofix = (ex, lesson) => {
  const res = V.validate(ex); const fixes=[]; const std=Q.standard(ex.type); const d=ex.draft;
  const vw = vocabSingles(lesson).map(v=>v.w);
  res.issues.forEach(i=>{
    if(i.code==='V08' && i.qid){ const q=d.questions.find(x=>x.id===i.qid); if(!q) return;
      Object.keys(q).forEach(k=>{ if(typeof q[k]==='string') i.words.forEach(w=>{ const rep=vw[U.hash(w)%vw.length]; const before=q[k]; q[k]=q[k].replace(new RegExp('\\s*\\b'+w+'\\b','gi'),''); if(before!==q[k]) fixes.push(`bỏ từ "${w}"`); }); }); }
  });
  const keyOf = q => V.norm(V.textsOf({questions:[q]}, ex.type).map(x=>x.text).join(' '));
  const seenK = new Set(); const before = d.questions.length;
  d.questions = d.questions.filter(q=>{ const k=keyOf(q); if(seenK.has(k)) return false; seenK.add(k); return true; });
  if(d.questions.length < before) fixes.push(`bỏ ${before-d.questions.length} câu trùng`);
  if(d.questions.length > std.maxQ){ fixes.push(`bớt ${d.questions.length-std.maxQ} câu`); d.questions = d.questions.slice(0,std.maxQ); }
  // dedupe ids
  const ids=new Set(); d.questions.forEach(q=>{ if(ids.has(q.id)) q.id=U.uid('q'); ids.add(q.id); });
  return [...new Set(fixes)];
};

/* regenerate variants for a question */
AI.questionVariants = (ex, qid, chips=[], n=3, salt=0) => {
  const lesson = Q.lesson(ex.scope.lessonIds[0]); const std = Q.standard(ex.type);
  const q = ex.draft.questions.find(x=>x.id===qid);
  const key = t => V.norm(V.textsOf({questions:[t], passage:''}, ex.type).map(x=>x.text).join(' '));
  const shown = t => V.norm(t.stem || t.text || t.statement || t.question || t.original || t.left || (t.items||[]).join(' '));
  const existing = new Set(ex.draft.questions.map(key)); ex.draft.questions.forEach(t=>existing.add('S:'+shown(t)));
  let pool = [];
  for(let s=1; s<=6 && pool.length<12; s++){
    const g = AI.generate(lesson.id, ex.type, {count:std.maxQ, seed:`v${salt}-${s}-${qid}`, difficulty:chips.includes('easier')?'easy':ex.draft.difficulty, themeId:ex.themeId});
    g.draft.questions.forEach(c=>{ if(!existing.has(key(c)) && !existing.has('S:'+shown(c)) && !pool.some(p=>key(p)===key(c)||shown(p)===shown(c))) pool.push(c); });
  }
  if(ex.type==='cloze_mcq'){ // keep gap; change distractors
    const r=U.rng('c'+salt+qid); const correct=q.options[q.correctIdx];
    return [1,2,3].map(k=>{ const opts=U.shuffle([correct].concat(distractors(lesson,correct.toLowerCase(),2,U.rng(salt+'d'+k))), r); return Object.assign(U.clone(q),{id:U.uid('q'), options:opts, correctIdx:opts.indexOf(correct)}); });
  }
  const answerOf = c => (c.options&&c.options.find(o=>o.id===c.correctId)||{}).text || (c.accepted||[])[0] || c.left || c.answer;
  if(chips.includes('shorter')) pool.sort((a,b)=>U.wc(key(a))-U.wc(key(b)));
  if(chips.includes('keep')){ const a=answerOf(q); const same=pool.filter(c=>answerOf(c)===a); if(same.length) pool = same.concat(pool.filter(c=>!same.includes(c))); }
  const useW = chips.find(c=>c.startsWith('use:')); if(useW){ const w=useW.slice(4); pool.sort((a,b)=>(key(b).includes(w)?1:0)-(key(a).includes(w)?1:0)); }
  if(chips.includes('topic')) pool = U.shuffle(pool, U.rng('t'+salt));
  if(!pool.length){ // fallback: reshuffle distractors of same
    return [1,2,3].map(k=>{ const c=U.clone(q); c.id=U.uid('q'); if(c.options){ c.options=U.shuffle(c.options,U.rng(k+salt+'x')); } if(c.shuffle){ c.shuffle=U.shuffle(c.shuffle,U.rng(k+'s'+salt)); } return c; });
  }
  while(pool.length<n) pool.push(Object.assign(U.clone(pool[pool.length-1]),{id:U.uid('q')}));
  return pool.slice(0,n).map(c=>Object.assign(c,{id:U.uid('q')}));
};
AI.exerciseVariants = (ex, n=3, salt=0) => {
  const lessonId = ex.scope.lessonIds[0];
  return [0,1,2].slice(0,n).map(k=>AI.generate(lessonId, ex.type, {count:ex.draft.questions.length||Q.standard(ex.type).minQ, seed:`ex-${ex.id}-${salt}-${k}`, difficulty:ex.draft.difficulty, themeId:ex.themeId, layout:ex.draft.layout, blockIndex:k}).draft);
};
AI.explanationFor = (type, q, salt=0) => {
  const r=U.rng('e'+salt+q.id); const ans = (q.options&&q.options.find?((q.options.find(o=>o.id===q.correctId)||{}).text):null) || (q.options&&q.options[q.correctIdx]) || (q.accepted||[])[0] || q.left || q.answer || (q.items||[]).join(' ');
  const t = {mcq:[`"${ans}" fits the meaning of the sentence.`,`Only "${ans}" makes sense here.`,`Look at the words around the gap: "${ans}".`],
    fill_blank:[`The missing word is "${ans}".`,`Write "${ans}" in the gap.`,`"${ans}" completes the sentence.`],
    tfng:[{T:'The text says this.',F:'The text says something different.',NG:'The text does not give this information.'}[q.answer],'Find the sentence in the text and compare.','Read the text again carefully.'],
  }[type] || [`Answer: ${ans}.`,`Model answer: ${ans}.`,`Check: ${ans}.`];
  return U.pick(t, r);
};

/* layout suggestion + height estimate */
AI.PAGE_H = 980;
AI.estimateHeight = (type, d, layout) => {
  const q = (d.questions||[]).length; const per = {mcq:56,fill_blank:32,matching:30,ordering:52,tfng:30,cloze_mcq:28,word_form:34,rewrite:64,short_answer:56}[type]||40;
  const pw = d.passage? Math.ceil(String(d.passage).length/88)*23+26 : 0;
  const head = 64 + (d.wordBank&&d.wordBank.length?40:0);
  let qh = q*per; if(layout==='L4') qh = Math.ceil(q/2)*per;
  let body;
  if(layout==='L3' && pw) body = Math.max(pw*1.75, qh);
  else if(layout==='L2') body = Math.max(qh+pw, 190);
  else body = qh + pw + ((d.media||[]).some(id=>{const m=Q.media(id);return m&&m.kind==='image';})?150:0);
  return Math.round(head + body + 22);
};
AI.suggestLayout = (type, d, hasImage) => {
  const q=(d.questions||[]).length;
  if(hasImage) return {layout:'L2', reason:'Bài có ảnh minh họa nên đặt ảnh ở cột phải.'};
  if(d.passage && ['tfng','cloze_mcq','short_answer'].includes(type) && U.wc(d.passage)>45) return {layout:'L3', reason:`Đoạn văn ${U.wc(d.passage)} từ nên đặt đoạn văn trái, câu hỏi phải.`};
  if(['fill_blank','word_form','matching'].includes(type) && q>=6) return {layout:'L4', reason:`${q} câu ngắn nên chia hai cột để gọn trang.`};
  return {layout:'L1', reason:'Một cột chạy một mạch là dễ đọc nhất.'};
};

/* D-136: mục tiêu lesson → loại kỹ năng; loại bài → kỹ năng luyện được và chặng (1 nhận biết, 2 luyện có hỗ trợ, 3 vận dụng) */
AI.KINDS = {vocab:'Từ vựng', grammar:'Ngữ pháp', sentence:'Nói, viết câu', reading:'Đọc hiểu'};
AI.TYPE_KINDS = {matching:['vocab'], mcq:['vocab','grammar'], fill_blank:['vocab','grammar'], word_form:['vocab','grammar'], ordering:['grammar','sentence'],
  cloze_mcq:['reading','vocab'], tfng:['reading'], rewrite:['grammar','sentence'], short_answer:['reading','sentence']};
AI.KIND_TYPES = {vocab:['matching','mcq','fill_blank','word_form','cloze_mcq'], grammar:['fill_blank','ordering','mcq','word_form','rewrite'],
  sentence:['ordering','short_answer','rewrite'], reading:['tfng','cloze_mcq','short_answer']};
AI.STAGE = {matching:1, mcq:1, fill_blank:2, word_form:2, ordering:2, cloze_mcq:2, tfng:3, rewrite:3, short_answer:3};
AI.STAGE_LABEL = {1:'Nhận biết', 2:'Luyện có hỗ trợ', 3:'Vận dụng'};
AI.objectiveKinds = text => {
  const t = String(text).toLowerCase(); const verb = (t.match(/^[a-z]+/)||[''])[0];
  const gram = /\b(this is|that|she is|he is|there (is|are)|present|past|perfect|continuous|tense|ever|never|when|while|with he\/she|adverbs?|-tion|-ment)\b/.test(t);
  const lex = /\b(words?|nouns?|adjectives?|colou?rs?|objects|members|food|drink|vocabulary|famil(y|ies))\b/.test(t);
  let k;
  if(['use','form','contrast'].includes(verb)) k = ['grammar'].concat(lex?['vocab']:[]);
  else if(['say','ask','answer','respond','talk','tell','describe','write'].includes(verb)) k = ['sentence'].concat(gram?['grammar']:lex?['vocab']:[]);
  else if(['read','understand','find'].includes(verb)) k = ['reading'];
  else k = gram ? ['grammar','vocab'] : ['vocab'];
  return k;
};
AI.objectives = lesson => (lesson.objectives||[]).map((t,i)=>({i, t, kinds:AI.objectiveKinds(t)}));
/* Mục tiêu một khối luyện: khối do hệ thống dàn ghi sẵn (b.objectives); khối tay thì suy từ loại bài */
AI.blockObjectives = (lesson, b) => {
  if(b.fromLib) return [];
  if(Array.isArray(b.objectives)) return b.objectives;
  return AI.objectives(lesson).filter(o=>o.kinds.some(k=>AI.TYPE_KINDS[b.type].includes(k))).map(o=>o.i);
};
AI.coverage = (lesson, blocks) => AI.objectives(lesson).map(o=>({...o, blocks:blocks.map((b,j)=>AI.blockObjectives(lesson,b).includes(o.i)?j:-1).filter(j=>j>=0)}));
AI.blockFocus = (lesson, b) => AI.blockObjectives(lesson, b).map(i=>lesson.objectives[i]).filter(Boolean);

/* D-98 + D-136: dàn khối phủ mục tiêu lesson trước, rồi lấp số trang; xếp từ nhận biết đến vận dụng */
AI.planBlocks = (lessonId, pages, salt=0) => {
  const lesson = Q.lesson(lessonId); const r = U.rng(`plan|${lessonId}|${pages}|${salt}`);
  const target = pages*AI.PAGE_H; const chosen=[]; let total=0;
  const types = WS.TYPE_ORDER.filter(t=>AI.available(lesson,t).ok);
  const unusable = WS.TYPE_ORDER.filter(t=>!AI.available(lesson,t).ok).map(t=>({type:t, reason:AI.available(lesson,t).reason}));
  const isPassage = t => ['tfng','cloze_mcq','short_answer'].includes(t);
  const make = t => {
    const std=Q.standard(t), av=AI.available(lesson,t);
    const count = Math.max(std.minQ, Math.min(av.max, std.minQ + Math.floor(r()*(av.max-std.minQ+1))));
    const st = AI.STAGE[t]; const difficulty = st===1 ? 'easy' : st===2 ? 'medium' : (r()<.35 ? 'hard' : 'medium');
    const fake = {questions:new Array(count).fill(0), passage:isPassage(t)?lesson.passages[0]:'', wordBank:t==='fill_blank'&&difficulty!=='hard'?[1]:[]};
    const lay = AI.suggestLayout(t, fake, false);
    return {id:U.uid('b'), type:t, count, difficulty, explanations:true, note:'', objectives:[], layout:lay.layout, layoutReason:lay.reason, h:AI.estimateHeight(t, fake, lay.layout)};
  };
  // 1. mỗi mục tiêu có ít nhất một khối; hết chỗ thì gắn vào khối sẵn có cùng kỹ năng
  for(const o of AI.objectives(lesson)){
    const pref = [...new Set(o.kinds.flatMap(k=>AI.KIND_TYPES[k]))].filter(t=>types.includes(t) && !chosen.some(c=>c.type===t));
    const share = chosen.find(c=>AI.TYPE_KINDS[c.type].includes(o.kinds[0])) || chosen.find(c=>AI.TYPE_KINDS[c.type].some(k=>o.kinds.includes(k)));
    let b = null;
    if(pref.length){ const t = pref[r()<.65 || pref.length<2 ? 0 : 1]; const nb = make(t); if(!(share && total+nb.h > target)){ b = nb; chosen.push(b); total += b.h; } }
    if(!b) b = share;
    if(b) b.objectives.push(o.i);
  }
  // 2. lấp số trang bằng loại bài còn lại, gắn các mục tiêu cùng kỹ năng
  for(const t of U.shuffle(types.filter(t=>!chosen.some(c=>c.type===t)), r)){
    if(total >= target*0.92) break;
    const b = make(t); if(total+b.h > target && chosen.length) continue;
    b.objectives = AI.objectives(lesson).filter(o=>o.kinds.some(k=>AI.TYPE_KINDS[t].includes(k))).map(o=>o.i);
    chosen.push(b); total += b.h;
  }
  // 3. bớt câu cho vừa trang
  for(const b of chosen.slice().reverse()){ const std=Q.standard(b.type); const fake={questions:new Array(b.count).fill(0), passage:isPassage(b.type)?lesson.passages[0]:'', wordBank:b.type==='fill_blank'&&b.difficulty!=='hard'?[1]:[]};
    while(total > target && b.count>std.minQ){ b.count--; fake.questions.length=b.count; const h=AI.estimateHeight(b.type,fake,b.layout); total += h-b.h; b.h=h; } }
  // 4. từ nhận biết đến vận dụng (sắp xếp ổn định)
  const blocks = chosen.map((b,k)=>({b,k})).sort((x,y)=>AI.STAGE[x.b.type]-AI.STAGE[y.b.type] || x.k-y.k).map(x=>x.b);
  blocks.forEach(b=>{ b.objectives.sort((a,c)=>a-c); const objs = b.objectives.map(i=>`Mục tiêu ${i+1}: ${lesson.objectives[i]}`);
    b.reason = `${AI.STAGE_LABEL[AI.STAGE[b.type]]} · ${objs.length ? objs.join('; ') : 'Lấp số trang, ôn tổng hợp'}.`; delete b.h; });
  const fill = total/target;
  return {blocks, fill, total, target, short: fill<0.9, unusable};
};
AI.blocksHeight = (blocks, lessonId) => { const lesson=Q.lesson(lessonId); return blocks.reduce((s,b)=>s+AI.estimateHeight(b.type,{questions:new Array(b.count).fill(0),passage:['tfng','cloze_mcq','short_answer'].includes(b.type)?lesson.passages[0]:'',wordBank:b.type==='fill_blank'&&b.difficulty!=='hard'?[1]:[]},b.layout),0); };

/* ---------- media mock ---------- */
AI.imageOptions = (keyword, emojiPool, salt=0) => {
  const r = U.rng('img'+keyword+salt);
  return [0,1,2].map(k=>({id:U.uid('m'), kind:'image', keyword, emoji:U.pick(emojiPool,r)||'🖼️', hue:Math.floor(r()*360), style:k%3, alt:`Illustration: ${keyword}`, source:'giả lập', prompt:`flat illustration, ${keyword}, child-friendly, soft colours`, status:'ok'}));
};
AI.audioFor = (text, title) => {
  const t = String(text||'').trim();
  const speakers = [...new Set((t.match(/^([A-Z][\w ]{0,10}):/gm)||[]).map(s=>s.slice(0,-1)))];
  return {id:U.uid('m'), kind:'audio', title:title||'Listening', transcript:t, voice:'en-GB', rate:1, speakers, duration:Math.max(4,Math.round(U.wc(t)/2.3)), source:'giả lập', status:'ok'};
};
AI.videoFor = (title, caption) => ({id:U.uid('m'), kind:'video', title, caption, duration:24, source:'giả lập', status:'ok', hue:Math.floor(Math.random()*360)});
