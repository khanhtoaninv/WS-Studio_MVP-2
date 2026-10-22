/* Làm bài trên lớp (D-129): tách đề và đáp án, chấm, thống kê. JS thuần, dùng chung cho máy chủ và app.
   Đề gửi cho học sinh không chứa trường đáp án nào; chỉ máy chủ giữ đáp án và chấm. */

const ANSWER_KEYS = ['correctId', 'accepted', 'answer', 'correctIdx', 'right', 'answerText', 'explanation'];

/* data: dữ liệu viewer bản giáo viên (EX.viewerData(ws, 'teacher')) */
export function splitPaper(data){
  const key = {};
  const items = data.items.map(it => ({
    id: it.id, no: it.no, type: it.type, title: it.title, instruction: it.instruction, passage: it.passage || '',
    wordBank: it.wordBank || [], rightList: it.rightList || null, layout: it.layout || 'L1', media: it.media || [],
    questions: it.questions.map(q => {
      key[q.id] = Object.fromEntries(ANSWER_KEYS.filter(k => q[k] !== undefined).map(k => [k, q[k]]));
      return Object.fromEntries(Object.entries(q).filter(([k]) => !ANSWER_KEYS.includes(k)));
    }),
  }));
  const m = data.meta;
  return { paper: { meta: { code: m.code, version: m.version, title: m.title, lesson: m.lesson, theme: m.theme || null, pagesTarget: m.pagesTarget || null }, items }, key };
}

/* Gộp đề và đáp án lại thành dữ liệu viewer bản giáo viên (xem bài từng học sinh trên phiếu) */
export function mergePaper(paper, key){
  return { meta: Object.assign({}, paper.meta, { kind: 'teacher' }), qfb: null,
    items: paper.items.map(it => Object.assign({}, it, { questions: it.questions.map(q => Object.assign({}, q, key[q.id] || {})) })) };
}

/* ---------- Đảo đáp án cho từng học sinh (D-131) ----------
   Hệ thống tự quyết, giáo viên không phải chọn:
   - Đảo: phương án trắc nghiệm (mcq), phương án điền khuyết có lựa chọn (cloze_mcq), cột phải bài nối (matching).
   - Không đảo: True/False/Not Given (thứ tự cố định), sắp xếp câu (vốn đã xáo), các dạng tự điền,
     và câu trắc nghiệm có phương án kiểu "All of the above", "A and B" (đảo sẽ sai nghĩa).
   Thứ tự của mỗi em cố định theo mã phiên + mã cá nhân, nên vào lại vẫn y nguyên. Máy chủ chỉ lưu bài làm theo thứ tự gốc. */
const NO_SHUFFLE = /\b(all|none|both|neither)\b[^.]*\b(above|below|these|them|of the)\b|\b[A-D]\s*(and|or|&)\s*[A-D]\b/i;
function rng(str){
  let h = 2166136261; for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function perm(n, r){
  const a = [...Array(n).keys()];
  for(let i = n - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if(n > 1 && a.every((v, i) => v === i)) a.push(a.shift());       // tránh trùng thứ tự gốc
  return a;
}
const optText = (o) => typeof o === 'string' ? o : (o && o.text) || '';
/* { qid: hoán vị } với hoán vị[vị trí hiển thị] = vị trí gốc */
export function shufflePlan(paper, seed){
  const plan = {};
  paper.items.forEach(it => {
    if(it.type === 'matching' && (it.rightList || []).length > 1){
      const p = perm(it.rightList.length, rng(seed + '|' + it.id)); it.questions.forEach(q => { plan[q.id] = p; });
    }
    if(it.type === 'mcq' || it.type === 'cloze_mcq') it.questions.forEach(q => {
      const opts = q.options || [];
      if(opts.length > 1 && !opts.some(o => NO_SHUFFLE.test(optText(o)))) plan[q.id] = perm(opts.length, rng(seed + '|' + q.id));
    });
  });
  return plan;
}
/* Đề theo thứ tự riêng của một học sinh */
export function studentPaper(paper, plan){
  return Object.assign({}, paper, { items: paper.items.map(it => {
    const out = Object.assign({}, it, { questions: it.questions.map(q => plan[q.id] && q.options ? Object.assign({}, q, { options: plan[q.id].map(i => q.options[i]) }) : q) });
    if(it.type === 'matching' && it.questions.length && plan[it.questions[0].id]) out.rightList = plan[it.questions[0].id].map(i => it.rightList[i]);
    return out;
  }) });
}
const isEmpty = (v) => v === undefined || v === null || v === '';
/* Đổi bài làm giữa thứ tự hiển thị của học sinh và thứ tự gốc */
export function toOriginal(plan, answers){
  const out = {};
  for(const [qid, v] of Object.entries(answers || {})){ const p = plan[qid]; out[qid] = p && !isEmpty(v) && p[+v] !== undefined ? String(p[+v]) : v; }
  return out;
}
export function toDisplay(plan, answers){
  const out = {};
  for(const [qid, v] of Object.entries(answers || {})){ const p = plan[qid]; out[qid] = p && !isEmpty(v) && p.indexOf(+v) >= 0 ? String(p.indexOf(+v)) : v; }
  return out;
}

export const norm = (s) => String(s ?? '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, ' ').replace(/\s+/g, ' ').trim();

/* true / false; null khi chưa trả lời */
export function grade(item, q, k, val){
  if(val === undefined || val === null || val === '') return null;
  const inList = (list) => (list || []).some(a => norm(a) === norm(val));
  switch(item.type){
    case 'mcq': return (q.options[+val] || {}).id === k.correctId;
    case 'cloze_mcq': return +val === k.correctIdx;
    case 'tfng': return val === k.answer;
    case 'matching': return (item.rightList || [])[+val] === k.right;
    case 'ordering': return norm(val) === norm(k.answerText);
    case 'fill_blank': case 'word_form': case 'rewrite': return inList(k.accepted);
    case 'short_answer': return inList(k.accepted) || (k.accepted || []).some(a => norm(a).length > 2 && norm(val).includes(norm(a)));
  }
  return false;
}

/* Hiện đáp án đúng dạng chữ cho giáo viên */
export function answerText(item, q, k){
  switch(item.type){
    case 'mcq': return (q.options.find(o => o.id === k.correctId) || {}).text || '';
    case 'cloze_mcq': return q.options[k.correctIdx] || '';
    case 'tfng': return k.answer;
    case 'matching': return k.right;
    case 'ordering': return k.answerText;
    default: return (k.accepted || []).join(' / ');
  }
}
export function valueText(item, q, val){
  if(val === undefined || val === null || val === '') return '';
  switch(item.type){
    case 'mcq': return (q.options[+val] || {}).text || '';
    case 'cloze_mcq': return q.options[+val] || '';
    case 'matching': return (item.rightList || [])[+val] || '';
    default: return String(val);
  }
}

/* Kết quả một học sinh */
export function scoreStudent(paper, key, answers){
  let correct = 0, answered = 0, total = 0;
  const perQ = {};
  paper.items.forEach(it => it.questions.forEach(q => {
    total++;
    const ok = grade(it, q, key[q.id] || {}, answers[q.id]);
    if(ok !== null) answered++;
    if(ok) correct++;
    perQ[q.id] = ok;
  }));
  return { correct, answered, total, pct: total ? Math.round(correct * 100 / total) : 0, perQ };
}

/* Tổng hợp cả phiên: xếp hạng, tỷ lệ đúng theo bài và theo câu */
export function summarize(paper, key, students){
  const scored = students.map(s => ({ ...s, result: scoreStudent(paper, key, s.answers || {}) }));
  const ranking = scored.slice().sort((a, b) => b.result.correct - a.result.correct
    || (a.submittedAt || Infinity) - (b.submittedAt || Infinity) || a.name.localeCompare(b.name, 'vi'))
    .map((s, i, arr) => ({ rank: i > 0 && arr[i - 1].result.correct === s.result.correct ? null : i + 1, sid: s.sid, code: s.code, name: s.name, ...s.result, submitted: !!s.submittedAt }));
  ranking.forEach((r, i) => { if(r.rank === null) r.rank = ranking[i - 1].rank; });
  const n = scored.length;
  const items = paper.items.map(it => {
    const qs = it.questions.map((q, qi) => {
      const ok = scored.filter(s => s.result.perQ[q.id] === true).length;
      const wrong = scored.filter(s => s.result.perQ[q.id] === false).length;
      return { qid: q.id, no: qi + 1, ok, wrong, blank: n - ok - wrong, rate: n ? ok / n : 0, answer: answerText(it, q, key[q.id] || {}) };
    });
    const ok = qs.reduce((a, q) => a + q.ok, 0), wrong = qs.reduce((a, q) => a + q.wrong, 0), all = qs.length * n;
    return { id: it.id, no: it.no, type: it.type, title: it.title, ok, wrong, blank: all - ok - wrong, rate: all ? ok / all : 0, questions: qs };
  });
  const hardest = items.flatMap(it => it.questions.map(q => ({ ...q, item: it.no, title: it.title })))
    .filter(q => q.wrong > 0).sort((a, b) => b.wrong - a.wrong || a.rate - b.rate).slice(0, 5);
  const avg = n ? Math.round(scored.reduce((a, s) => a + s.result.pct, 0) / n) : 0;
  return { students: n, submitted: scored.filter(s => s.submittedAt).length, avg, ranking, items, hardest };
}

export function newCode(len, taken){
  const A = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  for(;;){ let c = ''; for(let i = 0; i < len; i++) c += A[Math.floor(Math.random() * A.length)]; if(!taken || !taken(c)) return c; }
}
