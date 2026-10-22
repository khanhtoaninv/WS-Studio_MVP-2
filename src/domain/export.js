/* ============ EXPORT BUILDER ============ */
import { WS } from '../ws.js';
import { VIEWER_JS, VIEWER_CSS } from '../viewer/assets.js';
const U = WS.U, Q = WS.Q, R = WS.R, S = WS.S;
const EX = WS.EX = {};

EX.itemDraft = (ws, it, useDraft) => {
  const ex = Q.ex(it.exerciseId); if(!ex) return null;
  if(useDraft || !it.pinnedVersionNo) return ex.draft;
  const v = R.version(ex, it.pinnedVersionNo); return v ? v.snapshot : ex.draft;
};
/* Một bài (ex: {id, type}, d: nội dung) → dạng viewer; bản học sinh bỏ khóa đáp án */
EX.itemView = (ex, d, idx, layout, T) => {
  const base = {id:ex.id, no:idx+1, type:ex.type, title:d.title, instruction:d.instruction, layout, passage:d.passage||'',
    wordBank:(d.wordBank||[]).slice(), media:(d.media||[]).map(id=>typeof id==='object'?id:Q.media(id)).filter(Boolean).map(m=>U.clone(m)), questions:[]};
  const r = U.rng('show'+ex.id);
  if(ex.type==='matching'){ base.rightList = U.shuffle(d.questions.map(q=>q.right).concat(d.extraRight||[]), r); }
  base.questions = d.questions.map(q => {
    const o2 = {id:q.id};
    switch(ex.type){
      case 'mcq': o2.stem=q.stem; o2.options=q.options.map(x=>({id:x.id,text:x.text})); if(T) o2.correctId=q.correctId; break;
      case 'fill_blank': o2.text=q.text; if(T) o2.accepted=q.accepted.slice(); break;
      case 'word_form': o2.text=q.text; o2.baseWord=q.baseWord; if(T) o2.accepted=q.accepted.slice(); break;
      case 'matching': o2.left=q.left; if(T) o2.right=q.right; break;
      case 'ordering': o2.words=(q.shuffle||q.items.map((_,i)=>i)).map(i=>q.items[i]); o2.punct=q.punct||'.'; if(T) o2.answerText=q.items.join(' ')+(q.punct||'.'); break;
      case 'tfng': o2.statement=q.statement; if(T) o2.answer=q.answer; break;
      case 'cloze_mcq': o2.n=q.n; o2.options=q.options.slice(); if(T) o2.correctIdx=q.correctIdx; break;
      case 'rewrite': o2.original=q.original; o2.lead=q.lead; if(T) o2.accepted=q.accepted.slice(); break;
      case 'short_answer': o2.question=q.question; o2.maxWords=q.maxWords; if(T) o2.accepted=q.accepted.slice(); break;
    }
    if(T && q.explanation && d.explanationsOn!==false) o2.explanation=q.explanation;
    return o2;
  });
  return base;
};
EX.viewerData = (ws, kind, o={}) => {
  const T = kind==='teacher';
  const lessonId = ws.scope.lessonIds[0]; const th = ws.themeId && Q.theme(ws.themeId);
  const items = ws.items.map((it, idx) => {
    const ex = Q.ex(it.exerciseId); if(!ex) return null;
    const d = EX.itemDraft(ws, it, o.useDraft);
    return EX.itemView(ex, d, idx, it.layout||d.layout||'L1', T);
  }).filter(Boolean);
  const exportedBy = Q.me().full;
  return {
    meta:{code:ws.code, version:ws.versionNo, kind, title:ws.title, lesson:Q.lessonShort(lessonId), lessonFull:Q.lessonLabel(lessonId), exportedAt:new Date().toISOString(), exportedBy,
      theme: th?{name:th.name, emoji:th.emoji}:null, pagesTarget:ws.pages,
      scope:{curriculum:(Q.curriculum(ws.scope.curriculumId)||{}).name, curriculumVersion:ws.scope.curriculumVersion, levelId:ws.scope.levelId, unitId:ws.scope.unitId, lessonIds:ws.scope.lessonIds},
      standards:[...new Set(ws.items.map(i=>{const e=Q.ex(i.exerciseId); return e?`${e.standardRef.id}@${e.standardRef.version}`:null;}).filter(Boolean))]},
    items, qfb: T ? U.clone(S.state.settings.qfb) : null, mediaFail: !!(o.mediaFail)
  };
};
/* D-133: phiếu nháp dựng từ khối bài (chưa sinh) để đo số trang bằng đúng viewer.
   Nội dung lấy từ AI giả lập với hạt giống cố định, nên độ dài câu sát bài sẽ sinh; bài từ kho dùng nội dung thật. */
const sampleCache = new Map();
EX.sampleItem = (lessonId, b, i, themeId) => {
  if(b.fromLib){ const ex=Q.ex(b.fromLib); return ex ? EX.itemView(ex, ex.draft, i, ex.draft.layout||'L1', true) : null; }
  const key = [lessonId, b.type, b.count, b.difficulty, themeId, b.explanations, b.note||''].join('|');
  let d = sampleCache.get(key);
  if(!d){ d = WS.AI.generate(lessonId, b.type, {count:b.count, difficulty:b.difficulty, seed:'sample|'+key, themeId, layout:b.layout, note:b.note, explanations:b.explanations}).draft; sampleCache.set(key, d); }
  const dd = Object.assign({}, d, {media: b.layout==='L2' ? [{id:'sample-img'+i, kind:'image', keyword:'', emoji:'🖼️', hue:210, style:0, alt:'Illustration', status:'ok'}] : []});
  return EX.itemView({id:'sample'+i, type:b.type}, dd, i, b.layout||dd.layout||'L1', true);
};
EX.sampleData = (c, blocks) => {
  const lessons = c.lessonIds.filter(Boolean); const th = c.themeId && Q.theme(c.themeId);
  const items = blocks.map((b,i)=>EX.sampleItem(lessons[i % lessons.length], b, i, c.themeId)).filter(Boolean);
  return {meta:{code:'WS-NHÁP', version:1, kind:'teacher', title:c.title||Q.lessonShort(lessons[0]), lesson:Q.lessonShort(lessons[0]), theme:th?{name:th.name, emoji:th.emoji}:null, pagesTarget:c.pages},
    items, qfb:null, mediaFail:false};
};
EX.ANSWER_KEYS = ['correctId','accepted','answer','correctIdx','explanation','answerText','right'];
EX.jsonForScript = obj => JSON.stringify(obj).replace(/</g,'\\u003c').replace(new RegExp('\u2028','g'),'\\u2028').replace(new RegExp('\u2029','g'),'\\u2029');
EX.fileName = (ws, kind) => `${ws.code}_v${ws.versionNo}_${kind==='teacher'?'giao-vien':'hoc-sinh'}.html`;

EX.build = (ws, kind) => {
  const data = EX.viewerData(ws, kind);
  const css = VIEWER_CSS, js = VIEWER_JS;
  const meta = Object.assign({}, data.meta, {exportedAt:data.meta.exportedAt});
  const html = '<!doctype html>\n<html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    `<title>${U.esc(ws.title)} · ${kind==='teacher'?'Bản giáo viên':'Bản học sinh'}</title>`+
    `<meta name="ws-id" content="${U.esc(ws.code)}"><meta name="ws-version" content="${ws.versionNo}"><meta name="ws-kind" content="${kind}">`+
    `<script type="application/json" id="ws-meta">${EX.jsonForScript(meta)}</`+`script>`+
    `<style>html,body{margin:0;height:100%;background:#E9EDF2}#app{height:100vh}${css}</style></head><body><div id="app"></div>`+
    `<script type="application/json" id="ws-data">${EX.jsonForScript(data)}</`+`script>`+
    `<script>${js}</`+`script><script>WSV.mount(document.getElementById('app'), JSON.parse(document.getElementById('ws-data').textContent), {globalKeys:true});</`+`script></body></html>`;
  return {html, data, name:EX.fileName(ws, kind)};
};

/* BR-16 publish checks */
EX.checks = (ws) => {
  const t = EX.build(ws,'teacher'), s = EX.build(ws,'student');
  const out = [];
  const missing = []; ws.items.forEach(it=>{ const d=EX.itemDraft(ws,it); (d.media||[]).forEach(id=>{ if(!Q.media(id)) missing.push(id); }); });
  out.push({label:'Tài nguyên đủ (ảnh, audio, video được nhúng)', ok:!missing.length, detail:missing.length?`Thiếu ${missing.length} media`:`${t.data.items.reduce((n,i)=>n+i.media.length,0)} media đã nhúng`});
  const struct = t.data.items.every(i=>i.questions.length && i.type);
  out.push({label:'Cấu trúc hợp lệ (mọi bài có loại và câu hỏi)', ok:struct && !!t.data.items.length, detail:`${t.data.items.length} bài, ${t.data.items.reduce((n,i)=>n+i.questions.length,0)} câu`});
  const sJson = JSON.stringify(s.data);
  const leaked = EX.ANSWER_KEYS.filter(k=>sJson.includes(`"${k}"`));
  const metaLeak = /"(correctId|accepted|answer|correctIdx)"/.test(EX.jsonForScript(s.data.meta));
  out.push({label:'Bản học sinh không chứa dữ liệu đáp án', ok:!leaked.length && !metaLeak, detail:leaked.length?`Lộ khóa: ${leaked.join(', ')}`:'Đã quét dữ liệu nhúng và metadata: không có khóa đáp án'});
  const rawLt = t.html.split('id="ws-data">')[1].split('</'+'script>')[0].includes('<');
  out.push({label:'Chuỗi người dùng đã được escape', ok:!rawLt, detail:'Dữ liệu nhúng không chứa ký tự < thô; viewer escape khi hiển thị'});
  out.push({label:'Có mã phiếu và số phiên bản trong tên tệp và metadata', ok:t.html.includes(`name="ws-id" content="${ws.code}"`) && s.html.includes('id="ws-meta"'), detail:`${t.name}, ${s.name}`});
  return {checks:out, ok:out.every(c=>c.ok), teacher:t, student:s};
};

EX.json = ws => {
  const items = ws.items.map(it=>{ const ex=Q.ex(it.exerciseId); const d=EX.itemDraft(ws,it); return {exerciseId:ex.id, type:ex.type, version:it.pinnedVersionNo, standard:ex.standardRef, layout:it.layout||d.layout,
    title:d.title, instruction:d.instruction, passage:d.passage, wordBank:d.wordBank, extraRight:d.extraRight, questions:d.questions, media:(d.media||[]).map(id=>{const m=Q.media(id); return m?{id:m.id, kind:m.kind, alt:m.alt, transcript:m.transcript, keyword:m.keyword, caption:m.caption}:null;}).filter(Boolean)}; });
  return {schema:'ws-studio/worksheet@1', code:ws.code, version:ws.versionNo, title:ws.title, exportedAt:new Date().toISOString(), exportedBy:Q.me().full,
    scope:Object.assign({lessonLabel:Q.lessonLabel(ws.scope.lessonIds[0])}, ws.scope), theme:ws.themeId, pages:ws.pages, items};
};
