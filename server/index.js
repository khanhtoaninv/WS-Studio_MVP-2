/* Máy chủ nhỏ của ws-studio.
   - Giữ ANTHROPIC_API_KEY phía máy chủ; trình duyệt chỉ gọi /api/*.
   - npm run dev : máy chủ + Vite (sửa mã là thấy ngay).
   - npm start   : máy chủ + bản dựng dist/ws-studio.html.
   Không có khóa API thì /api/health báo ai:"mock" và app chạy AI giả lập. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(path.join(root, '.env')); } catch { /* không có .env */ }

const DEV = process.argv.includes('--dev');
const PORT = Number(process.env.PORT || 5173);
const HAS_KEY = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const claude = HAS_KEY ? await import('./claude.js') : null;
const classroom = await import('./classroom.js');

const readJson = (req) => new Promise((resolve, reject) => {
  let raw = ''; req.setEncoding('utf8');
  req.on('data', c => { raw += c; if(raw.length > 2_000_000) reject(Object.assign(new Error('Yêu cầu quá lớn'), { status: 413 })); });
  req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(Object.assign(new Error('JSON không hợp lệ'), { status: 400 })); } });
});
const send = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };

const routes = {
  'POST /api/ai/generate': (b) => claude.generate(b),
  'POST /api/ai/fix': (b) => claude.fix(b),
  'POST /api/ai/variants': (b) => claude.variants(b),
};

async function api(req, res){
  if(req.method === 'GET' && req.url === '/api/health') return send(res, 200, { ok: true, ai: claude ? 'claude' : 'mock', model: claude ? claude.MODEL : null, classroom: true });
  const cls = classroom.routes[`${req.method} ${req.url}`];
  if(cls){
    try { send(res, 200, await cls(await readJson(req), { port: PORT })); }
    catch(err){ if(!err.status) console.error(req.url, err); send(res, err.status || 500, { error: err.message }); }
    return;
  }
  const route = routes[`${req.method} ${req.url}`];
  if(!route) return send(res, 404, { error: 'Không có endpoint này' });
  if(!claude) return send(res, 503, { error: 'Máy chủ chưa có ANTHROPIC_API_KEY' });
  try {
    const body = await readJson(req);
    if(!claude.isKnownType(body.type)) return send(res, 400, { error: 'Loại bài không hợp lệ' });
    const t0 = Date.now(); const out = await route(body);
    console.log(`${req.url} ${body.type} ${Date.now() - t0}ms`);
    send(res, 200, out);
  } catch(err) {
    const status = err instanceof claude.Anthropic.APIError ? (err.status || 502) : (err.status || 500);
    console.error(req.url, status, err.message);
    send(res, status, { error: err.message });
  }
}

let vite = null;
if(DEV){
  const { createServer } = await import('vite');
  vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
}
const DIST = path.join(root, 'dist', 'ws-studio.html');

const STUDENT = path.join(root, 'server', 'student.html');

http.createServer((req, res) => {
  if(req.url.startsWith('/api/')) return api(req, res);
  if(req.method === 'GET' && /^\/lop(\/|\?|$)/.test(req.url)){
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    return fs.createReadStream(STUDENT).pipe(res);
  }
  if(vite){
    if(req.url === '/' ) req.url = '/ws-studio.html';
    return vite.middlewares(req, res);
  }
  if(req.method === 'GET' && (req.url === '/' || req.url.startsWith('/?') || req.url === '/ws-studio.html')){
    if(!fs.existsSync(DIST)){ res.writeHead(500); return res.end('Chưa có dist/ws-studio.html. Chạy: npm run build'); }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return fs.createReadStream(DIST).pipe(res);
  }
  res.writeHead(404); res.end();
}).listen(PORT, () => {
  console.log(`ws-studio: http://localhost:${PORT}  (${DEV ? 'dev' : 'bản dựng'}, AI: ${claude ? 'Claude ' + claude.MODEL : 'giả lập, chưa có ANTHROPIC_API_KEY'})`);
  const lan = classroom.lanUrls(PORT); if(lan.length) console.log(`Học sinh vào làm bài: ${lan.join('  ')}`);
});
