/* ============ VIEW: Làm bài trên lớp (D-129) ============ */
import { WS } from '../../ws.js';
import { valueText, answerText } from '../../shared/classroom.js';
import { VERSION } from '../../version.js';
const U = WS.U, Q = WS.Q, S = WS.S, UI = WS.UI, EX = WS.EX;
const esc = U.esc; const views = WS.views;

/* Mã phiên và token giáo viên giữ trong trình duyệt để tải lại trang không mất phiên */
const KEY = 'wsstudio.class';
const saved = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){ return {}; } };
const remember = (wsId, v) => { try { const m = saved(); if(v) m[wsId] = v; else delete m[wsId]; localStorage.setItem(KEY, JSON.stringify(m)); } catch(e){} };

let cur = { wsId:null, st:null, err:null, timer:null, busy:false };
const svc = () => WS.services.classroom;
const pct = r => Math.round(r * 100);
const fmtT = t => t ? U.fmtTime(t) : '';

async function refresh(){
  const s = saved()[cur.wsId]; if(!s || !svc()) return;
  try { cur.st = await svc().state(s); cur.err = null; }
  catch(e){ cur.err = e.message; if(/Không tìm thấy phiên/.test(e.message)){ remember(cur.wsId, null); cur.st = null; } }
  if(WS.App.route.name === 'classroom') draw();
}
function poll(on){ clearInterval(cur.timer); cur.timer = on ? setInterval(refresh, 2000) : null; }

function joinUrl(st){ const u = (st.joinUrls || [])[0] || `${location.origin}/lop`; return `${u}?ma=${st.code}`; }

function barsHTML(items){
  return `<div class="cls-bars" role="list" aria-label="Tỷ lệ đúng theo bài">${items.map(it => `<div class="cls-bar" role="listitem">
    <span class="lb" title="${esc(it.title)}">Bài ${it.no}. ${esc(it.title)}</span>
    <span class="tr"><span class="fl ${it.rate >= .8 ? 'hi' : it.rate >= .5 ? 'mid' : 'lo'}" style="width:${Math.max(1, pct(it.rate))}%"></span></span>
    <span class="pc">${pct(it.rate)}%</span><span class="small muted">${it.ok} đúng · ${it.wrong} sai · ${it.blank} trống</span></div>`).join('')}</div>`;
}

function draw(){
  const main = document.getElementById('main'); const ws = Q.ws(cur.wsId);
  if(!ws){ main.innerHTML = `<div class="page">${UI.empty('Không tìm thấy phiếu', '')}</div>`; return; }
  const head = `<div class="page-head"><div><h1>Làm bài trên lớp</h1><div class="desc">${esc(ws.title)} · ${esc(ws.code)} v${ws.versionNo}</div></div>
    <div class="row">${UI.btn('← Xem phiếu', { a:'go', size:'sm', kind:'ghost', data:{ href:`#/xem/${ws.id}?kind=teacher` } })}</div></div>`;
  if(!svc()){
    const info = WS.services.config.server;
    const why = !/^https?:$/.test(location.protocol)
      ? ['Đang mở tệp HTML trực tiếp', 'Trang này đang mở bằng tệp (địa chỉ bắt đầu bằng file://), nên không có máy chủ. Đóng trang này, chạy chay.bat (hoặc npm run dev) và mở địa chỉ http://localhost:5173.']
      : info
        ? ['Máy chủ đang chạy là mã cũ', 'Trang đã là phiên bản ' + VERSION + ' nhưng cổng này vẫn do một máy chủ khởi động từ trước khi có Làm bài trên lớp trả lời. Hay gặp khi một cửa sổ npm run dev cũ còn chạy: giao diện tự lấy mã mới trên ổ đĩa, còn phần máy chủ thì không. Đóng mọi cửa sổ máy chủ, hoặc mở cmd và chạy: taskkill /F /IM node.exe, rồi chạy lại chay.bat.']
        : ['Không kết nối được máy chủ', 'Trang đang mở qua http nhưng không gọi được /api/health. Kiểm tra cửa sổ máy chủ còn chạy không, rồi tải lại trang.'];
    const detail = info ? `<br>Máy chủ trả lời /api/health: <code>${esc(JSON.stringify(info))}</code>` : '';
    main.innerHTML = `<div class="page">${head}${UI.empty(why[0], why[1])}<div class="small muted" style="text-align:center;margin-top:8px">Địa chỉ đang mở: <code>${esc(location.origin === 'null' ? location.href.slice(0, 60) : location.origin)}</code> · Trang phiên bản ${VERSION}${detail}</div></div>`; return;
  }
  if(!['approved', 'published'].includes(ws.status)){
    main.innerHTML = `<div class="page">${head}${UI.empty('Phiếu chưa được duyệt cấp 2', 'Chỉ phiếu đã duyệt mới mở phiên làm bài trên lớp.')}</div>`; return;
  }
  const st = cur.st;
  if(!st){
    main.innerHTML = `<div class="page">${head}<div class="card cls-start"><p>Mở một phiên để cả lớp làm phiếu này trên điện thoại hoặc máy tính. Mỗi học sinh vào bằng <b>mã phiên</b>, nhập tên và nhận <b>mã cá nhân</b> để vào lại nếu lỡ thoát. Đáp án chỉ nằm trên máy giáo viên.</p>
      <p class="small muted">Kết quả lưu tạm trên máy này; tắt cửa sổ máy chủ là mất. Máy giáo viên và học sinh cần cùng mạng Wi-Fi.</p>
      ${cur.err ? `<div class="banner err">${esc(cur.err)}</div>` : ''}
      ${UI.btn(cur.busy ? 'Đang mở…' : 'Bắt đầu phiên', { a:'clsStart', kind:'primary' })}</div></div>`;
    return;
  }
  const sm = st.summary, ended = !!st.endedAt, url = joinUrl(st);
  const students = st.students.slice().sort((a, b) => a.joinedAt - b.joinedAt);
  const total = st.paper.items.reduce((n, it) => n + it.questions.length, 0);
  main.innerHTML = `<div class="page">${head}
    <div class="card cls-live ${ended ? 'ended' : ''}">
      <div class="cls-code"><span class="lbl">Mã phiên</span><b>${esc(st.code)}</b></div>
      <div class="cls-join"><span class="lbl">Học sinh mở</span><code class="cls-url">${esc(url)}</code>
        <div class="small muted">${ended ? `Phiên đã kết thúc lúc ${fmtT(st.endedAt)}.` : 'Đọc hoặc chiếu địa chỉ và mã này cho cả lớp.'}${(st.joinUrls || []).length ? '' : ' Không tìm thấy địa chỉ mạng của máy này; kiểm tra Wi-Fi.'}</div></div>
      <div class="row wrap">${ended ? UI.btn('Mở lại phiên', { a:'clsReopen', size:'sm' }) : UI.btn('Kết thúc và tổng kết', { a:'clsEnd', kind:'primary', size:'sm' })}
        ${UI.btn('Phiên mới', { a:'clsNew', size:'sm', kind:'ghost' })}</div>
    </div>
    ${cur.err ? `<div class="banner err" style="margin-top:10px">${esc(cur.err)}</div>` : ''}
    <div class="cls-grid">
      <section class="card"><h3>Học sinh (${students.length}) <span class="small muted">· ${sm.submitted} đã nộp</span></h3>
        ${students.length ? `<div class="tbl-wrap"><table class="tbl cls-st"><thead><tr><th>Tên</th><th>Mã</th><th>Trạng thái</th><th>Đã làm</th><th>Đúng</th></tr></thead><tbody>
        ${students.map(s => `<tr data-a="clsStudent" data-sid="${esc(s.sid)}" tabindex="0" title="Xem bài của ${esc(s.name)}"><td><b>${esc(s.name)}</b></td><td><code>${esc(s.code)}</code></td>
          <td>${s.submittedAt ? UI.chip('Đã nộp ' + fmtT(s.submittedAt), 'green') : UI.chip(ended ? 'Chưa nộp' : 'Đang làm', ended ? 'grey' : 'blue')}</td>
          <td>${s.result.answered}/${total}</td><td><b>${s.result.correct}</b> <span class="small muted">${s.result.pct}%</span></td></tr>`).join('')}</tbody></table></div>`
        : `<div class="muted small" style="padding:16px 0">Chưa có học sinh nào vào. Danh sách tự cập nhật.</div>`}
      </section>
      <section class="card"><h3>Bảng xếp hạng</h3>
        ${sm.ranking.length ? `<ol class="cls-rank">${sm.ranking.slice(0, 10).map(r => `<li><span class="rk rk${r.rank}">${r.rank}</span><span class="nm">${esc(r.name)}</span><span class="sc">${r.correct}/${r.total}</span><span class="small muted">${r.pct}%</span></li>`).join('')}</ol>
          <div class="small muted">Điểm trung bình lớp: <b>${sm.avg}%</b></div>` : '<div class="muted small">Chưa có kết quả.</div>'}
      </section>
    </div>
    <section class="card" style="margin-top:12px"><div class="row"><h3 style="margin:0">Tỷ lệ đúng theo bài</h3><span style="flex:1"></span>${UI.btn('Xuất ảnh báo cáo', { a:'clsPng', size:'sm', kind: ended ? 'primary' : '' })}</div>
      ${sm.students ? barsHTML(sm.items) : '<div class="muted small">Biểu đồ hiện khi có học sinh làm bài.</div>'}
      ${sm.hardest.length ? `<h4>Câu sai nhiều nhất</h4><ul class="cls-hard">${sm.hardest.map(q => `<li>Bài ${q.item} câu ${q.no}: <b>${q.wrong}</b> em sai · đáp án <code>${esc(q.answer)}</code></li>`).join('')}</ul>` : ''}
    </section></div>`;
}

function studentDetail(sid){
  const st = cur.st; const s = st && st.students.find(x => x.sid === sid); if(!s) return;
  const body = st.paper.items.map(it => `<h4>Bài ${it.no}. ${esc(it.title)}</h4><table class="tbl cls-ans"><tbody>${it.questions.map((q, i) => {
    const ok = s.result.perQ[q.id]; const v = valueText(it, q, s.answers[q.id]);
    return `<tr class="${ok === true ? 'ok' : ok === false ? 'bad' : ''}"><td>${i + 1}</td><td>${ok === true ? '✓' : ok === false ? '✕' : '–'}</td><td>${v ? esc(v) : '<span class="muted">(bỏ trống)</span>'}</td><td class="small muted">Đáp án: ${esc(answerText(it, q, st.key[q.id] || {}))}</td></tr>`; }).join('')}</tbody></table>`).join('');
  UI.modal({ title: `${s.name} · ${s.result.correct}/${s.result.total} câu đúng (${s.result.pct}%)`, sub: `Mã ${esc(s.code)} · vào lúc ${fmtT(s.joinedAt)}${s.submittedAt ? ' · nộp lúc ' + fmtT(s.submittedAt) : ' · chưa nộp'}`, wide: true, body, buttons: [{ label:'Đóng', kind:'primary' }] });
}

/* Ảnh báo cáo PNG: tiêu đề, xếp hạng top 10, cột tỷ lệ đúng theo bài, câu sai nhiều nhất */
function reportPng(){
  const st = cur.st, sm = st.summary, ws = Q.ws(cur.wsId);
  const W = 900, top = sm.ranking.slice(0, 10), pad = 36, F = '"Be Vietnam Pro",system-ui,sans-serif';
  const H = 210 + Math.max(top.length * 30, 60) + 60 + sm.items.length * 32 + 50 + Math.min(sm.hardest.length, 3) * 26 + 40;
  const c = document.createElement('canvas'); c.width = W * 1.25; c.height = H * 1.25; const g = c.getContext("2d"); g.scale(1.25, 1.25);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = '#2741B0'; g.fillRect(0, 0, W, 8);
  const t = (s, x, y, o = {}) => { g.font = `${o.w || 400} ${o.s || 14}px ${F}`; g.fillStyle = o.c || '#16202A'; g.textAlign = o.a || 'left'; g.fillText(s, x, y); };
  t('Báo cáo làm bài trên lớp', pad, 52, { s: 24, w: 700 });
  t(`${ws.title} · ${ws.code} v${ws.versionNo}`, pad, 80, { s: 15, c: '#4A5765' });
  t(`Phiên ${st.code} · ${new Date(st.createdAt).toLocaleString('vi-VN')}`, pad, 102, { s: 13, c: '#566372' });
  [['Học sinh', sm.students], ['Đã nộp', sm.submitted], ['Điểm TB', sm.avg + '%']].forEach(([l, v], i) => {
    const x = pad + i * 150; g.fillStyle = '#F6F8FB'; g.fillRect(x, 120, 136, 60); t(l, x + 12, 142, { s: 12, c: '#566372' }); t(String(v), x + 12, 170, { s: 22, w: 700 }); });
  let y = 214; t('Bảng xếp hạng', pad, y, { s: 16, w: 700 }); y += 14;
  top.forEach((r, i) => { const yy = y + 22 + i * 30; if(i % 2 === 0){ g.fillStyle = '#F6F8FB'; g.fillRect(pad, yy - 19, W - pad * 2, 28); }
    t(String(r.rank), pad + 14, yy, { w: 700, c: r.rank <= 3 ? '#2741B0' : '#16202A' }); t(r.name, pad + 50, yy); t(`${r.correct}/${r.total}`, W - pad - 90, yy, { a: 'right', w: 600 }); t(`${r.pct}%`, W - pad - 14, yy, { a: 'right', c: '#566372' }); });
  if(!top.length) t('Chưa có học sinh.', pad, y + 24, { c: '#566372' });
  y += Math.max(top.length * 30, 60) + 40; t('Tỷ lệ đúng theo bài', pad, y, { s: 16, w: 700 }); y += 16;
  sm.items.forEach((it, i) => { const yy = y + i * 32, bx = 300, bw = W - pad - bx - 60;
    const lb = `Bài ${it.no}. ${it.title}`; t(lb.length > 36 ? lb.slice(0, 35) + '…' : lb, pad, yy + 16, { s: 13 });
    g.fillStyle = '#EDEFF3'; g.fillRect(bx, yy + 3, bw, 18); g.fillStyle = it.rate >= .8 ? '#2E9E5B' : it.rate >= .5 ? '#E8B931' : '#D9534F'; g.fillRect(bx, yy + 3, Math.max(2, bw * it.rate), 18);
    t(`${pct(it.rate)}%`, W - pad, yy + 17, { a: 'right', w: 600 }); });
  y += sm.items.length * 32 + 30;
  if(sm.hardest.length){ t('Câu sai nhiều nhất', pad, y, { s: 16, w: 700 }); sm.hardest.slice(0, 3).forEach((q, i) => t(`Bài ${q.item} câu ${q.no}: ${q.wrong} em sai · đáp án: ${q.answer}`.slice(0, 95), pad, y + 26 + i * 26, { s: 13 })); }
  t('ws-studio', W - pad, H - 14, { a: 'right', s: 11, c: '#566372' });
  c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `bao-cao-${ws.code}-${st.code}.png`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }, 'image/png');
  WS.audit('Xuất ảnh báo cáo làm bài trên lớp', 'worksheet', ws.id, { note: 'phiên ' + st.code }); S.persistSoon();
}

views.classroom = {
  render(main, p){
    if(cur.wsId !== p.id){ cur = { wsId: p.id, st: null, err: null, timer: cur.timer, busy: false }; }
    draw(); if(saved()[p.id]){ refresh(); poll(true); }
  },
  leave(){ poll(false); }
};

const act = (fn) => async (...a) => { try { await fn(...a); } catch(e){ cur.err = e.message; } cur.busy = false; draw(); };
Object.assign(WS.ACT, {
  clsStart: act(async () => {
    if(cur.busy) return; cur.busy = true; draw();
    const ws = Q.ws(cur.wsId); const data = EX.viewerData(ws, 'teacher', { useDraft: false });
    data.items.forEach(it => { it.media = []; });
    const r = await svc().start(data);
    remember(cur.wsId, { code: r.code, token: r.token }); cur.joinUrls = r.joinUrls;
    WS.audit('Mở phiên làm bài trên lớp', 'worksheet', ws.id, { note: 'mã ' + r.code }); S.persistSoon();
    await refresh(); poll(true);
  }),
  clsEnd: act(async () => { cur.st = await svc().end(saved()[cur.wsId]); WS.audit('Kết thúc phiên làm bài trên lớp', 'worksheet', cur.wsId, { note: 'mã ' + cur.st.code }); S.persistSoon(); }),
  clsReopen: act(async () => { cur.st = await svc().reopen(saved()[cur.wsId]); }),
  clsNew: () => UI.confirm({ title: 'Mở phiên mới?', body: '<p>Phiên hiện tại vẫn còn trên máy chủ nhưng màn này sẽ chuyển sang phiên mới. Nên xuất ảnh báo cáo trước.</p>', ok: 'Phiên mới' })
    .then(v => { if(!v) return; remember(cur.wsId, null); cur.st = null; poll(false); draw(); }),
  clsStudent: el => studentDetail(el.dataset.sid),
  clsPng: () => { if(cur.st) reportPng(); },
});
