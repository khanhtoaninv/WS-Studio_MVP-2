/* Hợp đồng dữ liệu giữa app và máy chủ AI (server/). JS thuần, không chạm DOM:
   máy chủ Node và trình duyệt cùng import tệp này.
   - Câu hỏi "dạng dây" (wire) là dạng Claude trả về: không có id, đáp án theo chỉ số.
   - fromWire / toWire đổi qua lại với dạng câu hỏi trong bản nháp của app. */

const str = { type: 'string' };
const strs = { type: 'array', items: str };
const int = { type: 'integer' };
const obj = (props) => ({ type: 'object', properties: props, required: Object.keys(props), additionalProperties: false });

export const QUESTION_SCHEMAS = {
  mcq:          obj({ stem: str, options: strs, correctIndex: int, explanation: str }),
  fill_blank:   obj({ text: str, accepted: strs, explanation: str }),
  word_form:    obj({ text: str, baseWord: str, accepted: strs, explanation: str }),
  matching:     obj({ left: str, right: str, explanation: str }),
  ordering:     obj({ items: strs, punct: str, explanation: str }),
  tfng:         obj({ statement: str, answer: { type: 'string', enum: ['T', 'F', 'NG'] }, explanation: str }),
  cloze_mcq:    obj({ n: int, options: strs, correctIdx: int, explanation: str }),
  rewrite:      obj({ original: str, lead: str, accepted: strs, explanation: str }),
  short_answer: obj({ question: str, accepted: strs, maxWords: int, explanation: str }),
};

/* Cách viết từng loại câu, đưa vào lời nhắc cho Claude. */
export const TYPE_RULES = {
  mcq: 'stem is one sentence with exactly one gap written as ___; options has 3 or 4 single words or short phrases; correctIndex is the 0-based index of the right option.',
  fill_blank: 'text is one sentence with exactly one gap written as ___; accepted lists every acceptable answer; put all answers plus 1-2 distractors in wordBank.',
  word_form: 'text is one sentence with one gap ___; baseWord is the root word in CAPITALS; accepted lists the correct derived form(s).',
  matching: 'left is a vocabulary word from the lesson; right is a short English meaning (max 6 words). Put 1-2 extra wrong meanings in extraRight.',
  ordering: 'items are the words of one correct sentence in the correct order (no final punctuation); punct is "." or "?".',
  tfng: 'passage is a short text; statement is about the passage; answer is T, F or NG (not given).',
  cloze_mcq: 'passage is a short text where each gap is written {1}, {2}, ... in order; each question n matches one gap; options has 3 words; correctIdx is the 0-based index of the right option.',
  rewrite: 'original is a sentence; lead is the first word(s) of the rewritten sentence; accepted lists full correct rewritten sentences.',
  short_answer: 'passage is a short text; question asks about it; accepted lists short correct answers; maxWords is 3 to 5.',
};

export const exerciseSchema = (type) => obj({
  title: str, instruction: str, passage: str, wordBank: strs, extraRight: strs,
  questions: { type: 'array', items: QUESTION_SCHEMAS[type] },
});
export const variantsSchema = (type) => obj({ questions: { type: 'array', items: QUESTION_SCHEMAS[type] } });

const permute = (n) => {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  if (n > 1 && a.every((v, i) => v === i)) [a[0], a[1]] = [a[1], a[0]];
  return a;
};

export function fromWire(type, w, uid) {
  const q = { id: uid('q'), explanation: w.explanation || '' };
  switch (type) {
    case 'mcq': return Object.assign(q, { stem: w.stem, options: w.options.map((t, i) => ({ id: 'o' + i, text: t })), correctId: 'o' + Math.max(0, Math.min(w.options.length - 1, w.correctIndex)) });
    case 'fill_blank': return Object.assign(q, { text: w.text, accepted: w.accepted });
    case 'word_form': return Object.assign(q, { text: w.text, baseWord: String(w.baseWord || '').toUpperCase(), accepted: w.accepted });
    case 'matching': return Object.assign(q, { left: w.left, right: w.right });
    case 'ordering': return Object.assign(q, { items: w.items, shuffle: permute(w.items.length), punct: w.punct || '.' });
    case 'tfng': return Object.assign(q, { statement: w.statement, answer: w.answer });
    case 'cloze_mcq': return Object.assign(q, { n: w.n, options: w.options, correctIdx: w.correctIdx });
    case 'rewrite': return Object.assign(q, { original: w.original, lead: w.lead, accepted: w.accepted });
    case 'short_answer': return Object.assign(q, { question: w.question, accepted: w.accepted, maxWords: w.maxWords || 5 });
  }
  throw new Error('Loại bài không hỗ trợ: ' + type);
}

export function toWire(type, q) {
  const e = { explanation: q.explanation || '' };
  switch (type) {
    case 'mcq': return { stem: q.stem, options: q.options.map(o => o.text), correctIndex: Math.max(0, q.options.findIndex(o => o.id === q.correctId)), ...e };
    case 'fill_blank': return { text: q.text, accepted: q.accepted, ...e };
    case 'word_form': return { text: q.text, baseWord: q.baseWord, accepted: q.accepted, ...e };
    case 'matching': return { left: q.left, right: q.right, ...e };
    case 'ordering': return { items: q.items, punct: q.punct, ...e };
    case 'tfng': return { statement: q.statement, answer: q.answer, ...e };
    case 'cloze_mcq': return { n: q.n, options: q.options, correctIdx: q.correctIdx, ...e };
    case 'rewrite': return { original: q.original, lead: q.lead, accepted: q.accepted, ...e };
    case 'short_answer': return { question: q.question, accepted: q.accepted, maxWords: q.maxWords, ...e };
  }
  return { ...e };
}
