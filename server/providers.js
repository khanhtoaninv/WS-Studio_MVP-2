/* Nhà cung cấp AI và cài đặt API (D-137).
   - Cài đặt (nhà đang dùng, khóa, tên model) nằm trong data/ai-settings.json trên máy chủ; trình duyệt chỉ thấy khóa đã che.
   - Chưa chọn gì thì dùng AI giả lập. Riêng bản cũ có sẵn ANTHROPIC_API_KEY trong .env thì tự chọn Claude để khỏi đổi cách chạy.
   - Claude gọi qua SDK; OpenAI, Gemini, DeepSeek gọi thẳng bằng fetch và ép JSON theo lược đồ ghi trong lời nhắc. */
import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

export { Anthropic };

export const PROVIDERS = {
  claude:   { label: 'Claude (Anthropic)', env: 'ANTHROPIC_API_KEY', modelEnv: 'CLAUDE_MODEL', model: 'claude-opus-5-5', help: 'platform.claude.com' },
  openai:   { label: 'OpenAI', env: 'OPENAI_API_KEY', modelEnv: 'OPENAI_MODEL', model: 'gpt-5', help: 'platform.openai.com/api-keys' },
  gemini:   { label: 'Google Gemini', env: 'GEMINI_API_KEY', modelEnv: 'GEMINI_MODEL', model: 'gemini-2.5-pro', help: 'aistudio.google.com/apikey' },
  deepseek: { label: 'DeepSeek', env: 'DEEPSEEK_API_KEY', modelEnv: 'DEEPSEEK_MODEL', model: 'deepseek-chat', help: 'platform.deepseek.com/api_keys' },
};

const file = () => process.env.WS_AI_SETTINGS || path.join(process.cwd(), 'data', 'ai-settings.json');
let saved = null;                       // nội dung tệp, đọc lười
const load = () => {
  if(saved) return saved;
  try { saved = JSON.parse(fs.readFileSync(file(), 'utf8')); } catch { saved = null; }
  if(!saved || typeof saved !== 'object') saved = { provider: null, providers: {} };
  saved.providers ||= {};
  return saved;
};
const clean = (v) => String(v ?? '').replace(/^﻿/, '').trim().replace(/^(["'])(.*)\1$/, '$2').trim();

/* Khóa và model đang hiệu lực của một nhà: cài đặt thắng .env */
export function resolve(id){
  const P = PROVIDERS[id]; const s = load().providers[id] || {};
  const envKey = clean(process.env[P.env]);
  const key = clean(s.key) || envKey;
  return { id, label: P.label, key, source: clean(s.key) ? 'settings' : envKey ? 'env' : null, model: clean(s.model) || clean(process.env[P.modelEnv]) || P.model };
}

/* Nhà đang dùng: 'mock' nếu chưa chọn hoặc thiếu khóa */
export function active(){
  const st = load(); let id = st.provider;
  if(id == null) id = clean(process.env.ANTHROPIC_API_KEY) ? 'claude' : 'mock';
  if(id === 'mock' || !PROVIDERS[id]) return { id: 'mock' };
  const r = resolve(id);
  return r.key ? r : { id: 'mock', missingKey: id };
}

export function mask(k){ return k ? (k.length > 14 ? `${k.slice(0, 7)}...${k.slice(-4)}` : '••••') : ''; }

export function describe(){
  const st = load(); const a = active();
  return {
    provider: st.provider == null ? (a.id === 'claude' ? 'claude' : 'mock') : st.provider, active: a.id, missingKey: a.missingKey || null,
    providers: Object.fromEntries(Object.entries(PROVIDERS).map(([id, P]) => { const r = resolve(id);
      return [id, { label: P.label, model: r.model, defaultModel: P.model, hasKey: !!r.key, keyMask: mask(r.key), keySource: r.source, keyLen: r.key.length, help: P.help }]; })),
  };
}

/* body: { provider?, providers?: { id: { key?, model? } } }; key rỗng = xóa khóa đã lưu */
export function update(body){
  const st = load();
  if(body.provider !== undefined){
    if(body.provider !== 'mock' && !PROVIDERS[body.provider]) throw Object.assign(new Error('Nhà cung cấp không hợp lệ'), { status: 400 });
    st.provider = body.provider;
  }
  for(const [id, v] of Object.entries(body.providers || {})){
    if(!PROVIDERS[id]) continue;
    const cur = st.providers[id] ||= {};
    if(v.key !== undefined) cur.key = clean(v.key);
    if(v.model !== undefined) cur.model = clean(v.model);
  }
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify(st, null, 2), { mode: 0o600 });
  return describe();
}

const fail = (status, msg) => Object.assign(new Error(msg), { status });
const parseJson = (text) => {
  const t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(t); } catch { throw fail(502, 'Mô hình không trả JSON hợp lệ'); }
};
const withSchema = (user, schema) => `${user}\n\nReply with a single JSON object (no markdown, no commentary) that validates against this JSON Schema:\n${JSON.stringify(schema)}`;

async function http(url, headers, body){
  let res;
  try { res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(180_000) }); }
  catch(e){ throw fail(502, `Không kết nối được ${new URL(url).host}: ${e.cause?.code || e.message}`); }
  const data = await res.json().catch(() => ({}));
  if(!res.ok) throw fail(res.status, `${res.status} ${data.error?.message || data.message || JSON.stringify(data).slice(0, 300)}`);
  return data;
}

const clients = new Map();
const anthropic = (key) => { if(!clients.has(key)) clients.set(key, new Anthropic({ apiKey: key })); return clients.get(key); };
const EFFORT = () => process.env.CLAUDE_EFFORT || 'medium';

const call = {
  async claude(p, system, user, schema){
    const res = await anthropic(p.key).beta.messages.create({
      model: p.model, max_tokens: 16000, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
      output_config: { effort: EFFORT(), format: { type: 'json_schema', schema } }, system, messages: [{ role: 'user', content: user }],
    });
    if(res.stop_reason === 'refusal') throw fail(422, 'Claude từ chối yêu cầu này');
    if(res.stop_reason === 'max_tokens') throw fail(502, 'Claude trả lời bị cắt (max_tokens)');
    return JSON.parse(res.content.filter(c => c.type === 'text').map(c => c.text).join(''));
  },
  async openai(p, system, user, schema){ return chatCompat(`${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, p, system, user, schema); },
  async deepseek(p, system, user, schema){ return chatCompat(`${process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'}/chat/completions`, p, system, user, schema); },
  async gemini(p, system, user, schema){
    const base = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    const data = await http(`${base}/models/${encodeURIComponent(p.model)}:generateContent`, { 'x-goog-api-key': p.key }, {
      systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: withSchema(user, schema) }] }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 16000 } });
    const c = data.candidates?.[0];
    if(!c) throw fail(422, `Gemini từ chối yêu cầu${data.promptFeedback?.blockReason ? ` (${data.promptFeedback.blockReason})` : ''}`);
    if(c.finishReason === 'MAX_TOKENS') throw fail(502, 'Gemini trả lời bị cắt (MAX_TOKENS)');
    return parseJson((c.content?.parts || []).map(x => x.text || '').join(''));
  },
};

/* OpenAI và DeepSeek dùng cùng giao thức chat/completions */
async function chatCompat(url, p, system, user, schema){
  const data = await http(url, { authorization: `Bearer ${p.key}` }, { model: p.model, response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: withSchema(user, schema) }] });
  const c = data.choices?.[0];
  if(!c) throw fail(502, 'Phản hồi không có nội dung');
  if(c.finish_reason === 'length') throw fail(502, 'Trả lời bị cắt (length)');
  if(c.message?.refusal) throw fail(422, 'Mô hình từ chối yêu cầu này');
  return parseJson(c.message?.content || '');
}

/* Hỏi nhà đang dùng; p mặc định là active() */
export async function ask(system, user, schema, p = active()){
  if(!call[p.id]) throw fail(503, 'Chưa chọn nhà cung cấp AI trong Cấu hình hệ thống');
  return call[p.id](p, system, user, schema);
}

/* Thử gọi một câu rất ngắn; dùng khóa vừa nhập nếu có, chưa có thì dùng khóa đã lưu */
export async function test(id, over = {}){
  if(!PROVIDERS[id]) throw fail(400, 'Nhà cung cấp không hợp lệ');
  const r = resolve(id); const key = clean(over.key) || r.key; const model = clean(over.model) || r.model;
  if(!key) throw fail(400, 'Chưa có khóa API');
  const t0 = Date.now();
  await ask('You are a connectivity check.', 'Return {"ok": true}.', { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false }, { id, key, model });
  return { ok: true, ms: Date.now() - t0, model };
}
