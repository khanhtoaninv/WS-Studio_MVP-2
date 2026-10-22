/* Dịch vụ AI gọi Claude qua máy chủ nhỏ (server/). Trình duyệt không giữ khóa API.
   Mỗi hàm dựng ngữ cảnh lesson, tiêu chuẩn, theme rồi gọi một endpoint /api/ai/*;
   máy chủ trả JSON theo lược đồ trong shared/ai-contract.js. Bộ kiểm tra V01–V17 vẫn chạy tại chỗ. */
import { WS } from '../../ws.js';
import { fromWire, toWire } from '../../shared/ai-contract.js';

async function post(path, body){
  const res = await fetch(path, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if(!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function lessonContext(lessonId, type, themeId){
  const { Q, S } = WS;
  const ls = Q.lesson(lessonId); const std = Q.standard(type); const th = themeId && Q.theme(themeId);
  const files = S.state.lessonFiles[lessonId] || {};
  return {
    lesson: { code: ls.code, name: ls.name, label: Q.lessonLabel(lessonId), objectives: ls.objectives, vocab: ls.vocab.map(v => v.w), grammar: ls.grammar,
      topic: ls.topic, banned: ls.banned || [], allowedExtra: ls.allowedExtra || [], passages: ls.passages || [], sentenceBank: (ls.sentenceBank || []).slice(0, 20),
      knowledgeFile: files.knowledge ? files.knowledge.text : '', skillFile: files.skill ? files.skill.text : '' },
    priorVocab: Q.prevLessons(lessonId).flatMap(x => x.vocab.map(v => v.w)).slice(-120),
    standard: { type, label: WS.TYPES[type].en, minQ: std.minQ, maxQ: std.maxQ, maxWords: std.maxWords, opts: std.opts },
    theme: th ? { name: th.name, plot: th.plot, characters: th.chars.map(c => c.n), places: th.places, avoid: th.avoid } : null,
  };
}

const skeleton = (type, o) => ({ title:'', instruction:'', passage:'', questions:[], extraRight:[], wordBank:[], media:[],
  layout: o.layout || WS.S.state.layoutDefaults[type] || 'L1', difficulty: o.difficulty || 'medium', explanationsOn: o.explanations !== false,
  aiNote: o.note || '', matchMode: type === 'matching' ? 'def' : '' });

function applyExercise(d, type, w){
  d.title = w.title; d.instruction = w.instruction; d.passage = w.passage || '';
  d.wordBank = w.wordBank || []; d.extraRight = w.extraRight || [];
  d.questions = (w.questions || []).map(q => fromWire(type, q, WS.U.uid));
  return d;
}

export function createClaudeAIService(info){
  const model = info.model || 'Claude';
  const generate = async (lessonId, type, o = {}) => {
    const w = await post('/api/ai/generate', { ...lessonContext(lessonId, type, o.themeId), type,
      count: o.count, difficulty: o.difficulty || 'medium', note: o.note || '', focus: o.focus || [], blockIndex: o.blockIndex || 0, variant: o.variant || null });
    return { draft: applyExercise(skeleton(type, o), type, w), log: [`Sinh bằng Claude (${model}).`] };
  };
  return {
    kind: 'claude',
    label: `Claude API · ${model}`,
    generate,
    async autofix(ex, lesson){
      const v = WS.V.validate(ex);
      const issues = v.issues.map(i => ({ code:i.code, severity: i.sev==='e' ? 'error' : 'warning', msg:i.msg, question: i.qid ? ex.draft.questions.findIndex(q => q.id === i.qid) + 1 : null }));
      if(!issues.length) return [];
      const d = ex.draft;
      const w = await post('/api/ai/fix', { ...lessonContext(lesson.id, ex.type, ex.themeId), type: ex.type, issues,
        exercise: { title:d.title, instruction:d.instruction, passage:d.passage, wordBank:d.wordBank, extraRight:d.extraRight, questions:d.questions.map(q => toWire(ex.type, q)) } });
      applyExercise(d, ex.type, w);
      return [`Claude sửa ${[...new Set(issues.map(i => i.code))].join(', ')}`];
    },
    async questionVariants(ex, qid, chips = [], n = 3){
      const q = ex.draft.questions.find(x => x.id === qid);
      const w = await post('/api/ai/variants', { ...lessonContext(ex.scope.lessonIds[0], ex.type, ex.themeId), type: ex.type, n, chips,
        passage: ex.draft.passage, current: toWire(ex.type, q), others: ex.draft.questions.filter(x => x.id !== qid).map(x => toWire(ex.type, x)) });
      return (w.questions || []).slice(0, n).map(x => fromWire(ex.type, x, WS.U.uid));
    },
    async exerciseVariants(ex, n = 3){
      const d = ex.draft;
      const jobs = [...Array(n).keys()].map(k => generate(ex.scope.lessonIds[0], ex.type, { count: d.questions.length || WS.Q.standard(ex.type).minQ,
        difficulty: d.difficulty, themeId: ex.themeId, layout: d.layout, blockIndex: k, variant: { k: k + 1, of: n } }));
      return (await Promise.all(jobs)).map(g => g.draft);
    },
  };
}
