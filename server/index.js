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
/* Đọc .env: .env thắng biến môi trường Windows; bỏ BOM, dấu nháy, khoảng trắng và CRLF quanh giá trị */
const envFile = path.join(root, '.env');
const sysKey = process.env.ANTHROPIC_API_KEY;
let envKeySet = false;
try {
  for(const line of fs.readFileSync(envFile, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)){
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/); if(!m) continue;
    const v = m[2].replace(/^(["'])(.*)\1$/, '$2').trim();
    if(v){ process.env[m[1]] = v; if(m[1] === 'ANTHROPIC_API_KEY') envKeySet = true; }
  }
} catch { /* không có .env */ }
const maskKey = (k) => k ? `${k.slice(0, 10)}...${k.slice(-4)} (${k.length} ký tự)` : '(trống)';

const DEV = process.argv.includes('--dev');
const PORT = Number(process.env.PORT || 5173);
const HAS_KEY = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
/* Thiếu thư viện (chưa npm install): báo bằng tiếng Việt thay vì in lỗi Node */
const needLibs = (e) => { console.error('\n[!] Thiếu thư viện' + (e && e.message ? ` (${e.message.split('\n')[0]})` : '') + '.\n    Chạy:  npm install\n    rồi chạy lại. Dùng chay.bat thì nó tự cài.\n'); process.exit(1); };
const claude = HAS_KEY ? await import('./claude.js').catch(needLibs) : null;
const classroom = await import('./classroom.js');
const { VERSION } = await import('../src/version.js');
const STARTED = Date.now();

const readJson = (req) => new Promise((resolve, reject) => {
  let raw = ''; req.setEncoding('utf8');
  req.on('data', c => { raw += c; if(raw.length > 2_000_000) reject(Object.assign(new Error('Yêu cầu quá lớn'), { status: 413 })); });
  req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(Object.assign(new Error('JSON không hợp lệ'), { status: 400 })); } });
});
const send = (res, status, body) => { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(body)); };

const routes = {
  'POST /api/ai/generate': (b) => claude.generate(b),
  'POST /api/ai/fix': (b) => claude.fix(b),
  'POST /api/ai/variants': (b) => claude.variants(b),
};

async function api(req, res){
  if(req.method === 'GET' && req.url === '/api/health') return send(res, 200, { ok: true, ai: claude ? 'claude' : 'mock', model: claude ? claude.MODEL : null, classroom: true,
    version: VERSION, dev: DEV, dir: root, pid: process.pid, startedAt: STARTED });
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
  const { createServer } = await import('vite').catch(needLibs);
  vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
}
const DIST = path.join(root, 'dist', 'ws-studio.html');

const STUDENT = path.join(root, 'server', 'student.html');

const server = http.createServer((req, res) => {
  if(req.url.startsWith('/api/')) return api(req, res);
  /* Viewer phiếu dùng chung cho trang học sinh dạng Phiếu (D-131) */
  const vf = req.method === 'GET' && { '/lop/viewer.js': ['viewer.js', 'text/javascript'], '/lop/viewer.css': ['viewer.css', 'text/css'] }[req.url.split('?')[0]];
  if(vf){
    res.writeHead(200, { 'content-type': vf[1] + '; charset=utf-8', 'cache-control': 'no-cache' });
    return fs.createReadStream(path.join(root, 'src', 'viewer', vf[0])).pipe(res);
  }
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
});
server.on('error', (err) => {
  if(err.code === 'EADDRINUSE'){ console.error(`\n[!] Cổng ${PORT} đang được một chương trình khác dùng, thường là cửa sổ ws-studio cũ.\n    Đóng cửa sổ đó (hoặc chạy: taskkill /F /IM node.exe) rồi chạy lại.\n`); process.exit(1); }
  throw err;
});
server.listen(PORT, () => {
  console.log(`ws-studio phiên bản ${VERSION}: http://localhost:${PORT}  (${DEV ? 'dev' : 'bản dựng'}, thư mục ${root}, AI: ${claude ? 'Claude ' + claude.MODEL : 'giả lập, chưa có ANTHROPIC_API_KEY'})`);
  if(claude){
    console.log(`Khóa API: ${maskKey(process.env.ANTHROPIC_API_KEY)} lấy từ ${envKeySet ? envFile : 'biến môi trường Windows'}`);
    if(envKeySet && sysKey && sysKey !== process.env.ANTHROPIC_API_KEY) console.log('  (đã bỏ qua biến môi trường ANTHROPIC_API_KEY của Windows vì .env có khóa)');
    if(process.env.ANTHROPIC_BASE_URL && !/^https:\/\/api\.anthropic\.com\/?$/.test(process.env.ANTHROPIC_BASE_URL)) console.log(`  [!] ANTHROPIC_BASE_URL=${process.env.ANTHROPIC_BASE_URL} đang đổi địa chỉ gọi API`);
  } else if(!HAS_KEY) console.log(`Không đọc được khóa API trong ${envFile}`);
  const lan = classroom.lanUrls(PORT); if(lan.length) console.log(`Học sinh vào làm bài: ${lan.join('  ')}`);
});
