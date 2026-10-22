/* Gọi Claude cho ba việc: sinh bài, sửa bài theo lỗi của bộ kiểm tra, tạo phương án cho một câu.
   Mỗi lệnh ép Claude trả JSON theo lược đồ của loại bài (src/shared/ai-contract.js). */
import Anthropic from '@anthropic-ai/sdk';
import { exerciseSchema, variantsSchema, TYPE_RULES, QUESTION_SCHEMAS } from '../src/shared/ai-contract.js';

export const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const EFFORT = process.env.CLAUDE_EFFORT || 'medium';
const client = new Anthropic();

const SYSTEM = `You write English exercises for printed worksheets used by Vietnamese primary and lower-secondary teachers.
Every exercise must follow the lesson it belongs to:
- Use the lesson's target vocabulary and grammar, plus words a learner at this point already knows (priorVocab) and very common function words. Do not use banned words or vocabulary clearly above the level.
- Respect the standard for the exercise type: number of questions, maximum words per sentence, number of options.
- Every question needs exactly one defensible correct answer, and every answer must be checkable from the exercise itself.
- No duplicated questions. Content must be safe and friendly for children.
- If a theme is given, weave its characters and places into the sentences as one continuous story, without leaving the lesson's language scope.
- If a lesson knowledge file or skill file is given, it is the authority: follow its focus, review items, forbidden areas and hard rules.
- Titles, instructions and content are in English. Explanations are one short English sentence for the teacher.
Reply only with the JSON object the schema asks for.`;

function contextBlock(b){
  const parts = [
    `Exercise type: ${b.type} (${b.standard.label}). Format: ${TYPE_RULES[b.type]}`,
    `Standard: ${b.standard.minQ}-${b.standard.maxQ} questions, at most ${b.standard.maxWords} words per sentence${b.standard.opts ? `, options per question: ${b.standard.opts.join(' or ')}` : ''}.`,
    `Lesson: ${b.lesson.label}`,
    `Objectives: ${b.lesson.objectives.join('; ')}`,
    `Target vocabulary: ${b.lesson.vocab.join(', ')}`,
    `Grammar: ${b.lesson.grammar.join('; ')}`,
    b.lesson.topic && `Topic: ${b.lesson.topic}`,
    b.priorVocab.length && `Already learned (may reuse): ${b.priorVocab.join(', ')}`,
    b.lesson.allowedExtra.length && `Also allowed: ${b.lesson.allowedExtra.join(', ')}`,
    b.lesson.banned.length && `Banned words: ${b.lesson.banned.join(', ')}`,
    b.lesson.passages.length && `Lesson passage(s) you may reuse or adapt:\n${b.lesson.passages.join('\n\n')}`,
    b.lesson.sentenceBank.length && `Example sentences from the lesson:\n${b.lesson.sentenceBank.join('\n')}`,
    b.theme && `Theme "${b.theme.name}": ${b.theme.plot} Characters: ${b.theme.characters.join(', ')}. Places: ${b.theme.places.join(', ')}. Avoid: ${b.theme.avoid.join(', ')}.`,
    b.lesson.knowledgeFile && `<lesson_knowledge_file>\n${b.lesson.knowledgeFile}\n</lesson_knowledge_file>`,
    b.lesson.skillFile && `<lesson_skill_file>\n${b.lesson.skillFile}\n</lesson_skill_file>`,
  ];
  return parts.filter(Boolean).join('\n');
}

async function ask(userText, schema){
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: EFFORT, format: { type: 'json_schema', schema } },
    system: SYSTEM,
    messages: [{ role: 'user', content: userText }],
  });
  if(res.stop_reason === 'refusal') throw Object.assign(new Error('Claude từ chối yêu cầu này'), { status: 422 });
  if(res.stop_reason === 'max_tokens') throw Object.assign(new Error('Claude trả lời bị cắt (max_tokens)'), { status: 502 });
  const text = res.content.filter(c => c.type === 'text').map(c => c.text).join('');
  return JSON.parse(text);
}

export async function generate(b){
  const count = Math.max(b.standard.minQ, Math.min(b.count || b.standard.minQ, b.standard.maxQ));
  const lines = [contextBlock(b), '',
    `Write one exercise with exactly ${count} questions. Difficulty: ${b.difficulty}.`,
    b.note && `Teacher's note (follow it if it stays inside the lesson): ${b.note}`,
    b.focus && b.focus.length && `Focus this exercise on these lesson objectives: ${b.focus.join('; ')}`,
    b.variant && `This is option ${b.variant.k} of ${b.variant.of}; make it clearly different from the other options.`,
    b.theme && `This is exercise number ${b.blockIndex + 1} of the worksheet; use a fresh scene of the theme story.`,
    'Leave passage, wordBank or extraRight empty when this type does not use them.'];
  return ask(lines.filter(Boolean).join('\n'), exerciseSchema(b.type));
}

export async function fix(b){
  const lines = [contextBlock(b), '',
    'The exercise below failed the automatic standard checks. Fix every error and as many warnings as you can, change as little as possible, and keep the same number of questions unless an issue says otherwise.',
    `Issues (question numbers start at 1):\n${b.issues.map(i => `- [${i.severity} ${i.code}]${i.question ? ` question ${i.question}:` : ''} ${i.msg}`).join('\n')}`,
    `Exercise:\n${JSON.stringify(b.exercise, null, 1)}`];
  return ask(lines.join('\n'), exerciseSchema(b.type));
}

const CHIPS = { easier: 'make it easier', shorter: 'make it shorter', topic: 'change the situation or topic', keep: 'keep the same correct answer and change the wording' };

export async function variants(b){
  const wants = b.chips.map(c => c.startsWith('use:') ? `use the word "${c.slice(4)}"` : CHIPS[c]).filter(Boolean);
  const lines = [contextBlock(b), '',
    `Write ${b.n} alternative versions of the question below. Each must be different from the current question, from each other, and from the other questions.`,
    wants.length && `The teacher asks: ${wants.join('; ')}.`,
    b.passage && `The exercise passage (questions must stay answerable from it${b.type === 'cloze_mcq' ? '; keep the same gap number n' : ''}):\n${b.passage}`,
    `Current question:\n${JSON.stringify(b.current)}`,
    `Other questions in the exercise:\n${JSON.stringify(b.others)}`];
  return ask(lines.filter(Boolean).join('\n'), variantsSchema(b.type));
}

export const isKnownType = (t) => Object.hasOwn(QUESTION_SCHEMAS, t);
export { Anthropic };
