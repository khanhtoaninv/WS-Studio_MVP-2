/* ============ UI HELPERS ============ */
import { WS } from '../ws.js';
const U = WS.U;
const UI = WS.UI = {};
const esc = U.esc;

UI.chip = (label, color, icon) => `<span class="chip ${color}">${icon?`<span aria-hidden="true">${icon}</span>`:''}${esc(label)}</span>`;
UI.btn = (label, o={}) => {
  const cls = ['btn', o.kind||'', o.size||''].join(' ');
  const attrs = Object.entries(o.data||{}).map(([k,v])=>` data-${k}="${esc(v)}"`).join('');
  if(o.disabled) return `<button class="${cls} is-disabled" aria-disabled="true" data-tip="${esc(o.reason||'')}"${o.id?` id="${o.id}"`:''}${attrs} type="button">${label}</button>`;
  return `<button class="${cls}" ${o.a?`data-a="${o.a}"`:''}${o.id?` id="${o.id}"`:''}${o.title?` title="${esc(o.title)}"`:''}${o.aria?` aria-label="${esc(o.aria)}"`:''}${attrs} type="button">${label}</button>`;
};
UI.avatar = (u, sm) => `<span class="avatar${sm?' sm':''}" style="background:${u.color}" title="${esc(u.full||u.name)}">${esc(u.name[0])}</span>`;
UI.empty = (title, body, action) => `<div class="empty"><b>${esc(title)}</b>${esc(body||'')}${action?`<div style="margin-top:12px">${action}</div>`:''}</div>`;

/* toast */
UI.toast = (text, o={}) => {
  let wrap = document.querySelector('.toasts'); if(!wrap){ wrap=document.createElement('div'); wrap.className='toasts'; wrap.setAttribute('role','status'); wrap.setAttribute('aria-live','polite'); document.body.appendChild(wrap); }
  const t = document.createElement('div'); t.className='toast'+(o.err?' err':''); t.innerHTML = `<span>${esc(text)}</span>`;
  if(o.undo){ const b=document.createElement('button'); b.textContent=o.undoLabel||'Hoàn tác'; b.onclick=()=>{ o.undo(); t.remove(); }; t.appendChild(b); }
  if(o.action){ const b=document.createElement('button'); b.textContent=o.action.label; b.onclick=()=>{ o.action.fn(); t.remove(); }; t.appendChild(b); }
  wrap.appendChild(t); setTimeout(()=>t.remove(), o.ms || (o.undo?7000:3200));
};

/* modal */
UI.modal = (o) => {
  const ov = document.createElement('div'); ov.className='overlay';
  ov.innerHTML = `<div class="modal ${o.wide?'wide':''} ${o.xwide?'xwide':''}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}">
    <div class="modal-h"><div style="flex:1"><h2>${esc(o.title)}</h2>${o.sub?`<div class="muted small" style="margin-top:3px">${o.sub}</div>`:''}</div><button class="iconbtn" data-x aria-label="Đóng">✕</button></div>
    <div class="modal-b">${o.body||''}</div>${o.foot!==false?`<div class="modal-f">${o.footLeft?`<div style="margin-right:auto">${o.footLeft}</div>`:''}${(o.buttons||[]).map((b,i)=>`<button class="btn ${b.kind||''}" data-b="${i}" type="button">${b.label}</button>`).join('')}</div>`:''}</div>`;
  document.body.appendChild(ov);
  const close = (v) => { ov.remove(); document.removeEventListener('keydown', key); if(o.onClose) o.onClose(v); };
  const key = e => { if(e.key==='Escape'){ e.stopPropagation(); close(null); } };
  document.addEventListener('keydown', key);
  ov.addEventListener('click', e => {
    if(e.target===ov && !o.sticky) return close(null);
    if(e.target.closest('[data-x]')) return close(null);
    const b = e.target.closest('[data-b]'); if(b){ const bt=o.buttons[+b.dataset.b]; if(bt.onClick){ const r=bt.onClick(ov.querySelector('.modal'), close); if(r===false) return; } else close(bt.value); }
  });
  if(o.onMount) o.onMount(ov.querySelector('.modal'), close);
  setTimeout(()=>{ const f = ov.querySelector('[autofocus],textarea,input,select') || ov.querySelector('[data-b]'); if(f) f.focus(); }, 30);
  return {el:ov.querySelector('.modal'), close};
};
UI.confirm = (o) => new Promise(res => UI.modal({title:o.title, body:`<div style="font-size:14px">${o.body||''}</div>`, onClose:v=>res(v===true),
  buttons:[{label:o.cancel||'Hủy', kind:'ghost', value:false}, ...(o.extra||[]), {label:o.ok||'Xác nhận', kind:o.danger?'danger solid':'primary', value:true}]}));
UI.prompt = (o) => new Promise(res => {
  UI.modal({title:o.title, sub:o.sub, body:`${o.body||''}<div class="field"><label for="pr-inp">${esc(o.label||'')}</label>${o.multiline?`<textarea class="inp" id="pr-inp" rows="4" placeholder="${esc(o.placeholder||'')}">${esc(o.value||'')}</textarea>`:`<input class="inp" id="pr-inp" placeholder="${esc(o.placeholder||'')}" value="${esc(o.value||'')}">`}<div class="why" id="pr-err" style="display:none"></div></div>`,
    onClose:v=>res(v==null?null:v),
    buttons:[{label:'Hủy', kind:'ghost', value:null}, {label:o.ok||'Xác nhận', kind:o.danger?'danger solid':'primary', onClick:(m, close)=>{ const v=m.querySelector('#pr-inp').value.trim(); if(o.required && !v){ const e=m.querySelector('#pr-err'); e.style.display='block'; e.textContent=o.requiredMsg||'Cần nhập nội dung trước khi tiếp tục.'; return false; } close(v); return false; }}]});
});

/* popover menu */
let openMenu = null;
UI.closeMenu = () => { if(openMenu){ openMenu.remove(); openMenu=null; } };
UI.menu = (anchor, items, o={}) => {
  UI.closeMenu();
  const p = document.createElement('div'); p.className='pop'; p.setAttribute('role','menu');
  p.innerHTML = items.map((it,i)=> it.sep ? '<div class="sep"></div>' : it.head ? `<div class="ph">${esc(it.head)}</div>` : it.html ? it.html :
    `<button class="mi" role="menuitem" data-i="${i}" ${it.disabled?`aria-disabled="true" data-tip="${esc(it.reason||'')}" style="opacity:.45;cursor:not-allowed"`:''}>${it.icon?`<span aria-hidden="true" style="width:18px">${it.icon}</span>`:''}${esc(it.label)}${it.k?`<span class="k">${esc(it.k)}</span>`:''}</button>`).join('');
  document.body.appendChild(p); openMenu = p;
  const r = anchor.getBoundingClientRect(); const w = p.offsetWidth, h = p.offsetHeight;
  p.style.left = Math.max(8, Math.min(window.innerWidth-w-8, o.alignRight ? r.right-w : r.left))+'px';
  p.style.top = (r.bottom+h+8 > window.innerHeight ? Math.max(8, r.top-h-4) : r.bottom+4)+'px';
  p.addEventListener('click', e => { const b=e.target.closest('[data-i]'); if(!b) return; const it=items[+b.dataset.i]; if(it.disabled){ UI.toast(it.reason||'Không khả dụng'); return; } UI.closeMenu(); it.onClick && it.onClick(); });
  setTimeout(()=>{ const f=p.querySelector('.mi:not([aria-disabled])'); if(f) f.focus(); },10);
  return p;
};
document.addEventListener('mousedown', e => { if(openMenu && !openMenu.contains(e.target)) UI.closeMenu(); });
document.addEventListener('keydown', e => { if(e.key==='Escape' && openMenu) UI.closeMenu(); });

/* tooltip for [data-tip] (also disabled buttons) */
let tipEl = null;
const showTip = (el) => { const t = el.getAttribute('data-tip'); if(!t) return; tipEl = tipEl || Object.assign(document.createElement('div'),{className:'tip'}); tipEl.textContent=t; tipEl.setAttribute('role','tooltip'); document.body.appendChild(tipEl);
  const r=el.getBoundingClientRect(); const w=tipEl.offsetWidth; tipEl.style.left=Math.max(6,Math.min(window.innerWidth-w-6, r.left+r.width/2-w/2))+'px'; tipEl.style.top=(r.bottom+6+tipEl.offsetHeight>window.innerHeight? r.top-tipEl.offsetHeight-6 : r.bottom+6)+'px'; };
const hideTip = () => { if(tipEl) tipEl.remove(); };
document.addEventListener('mouseover', e => { const el=e.target.closest('[data-tip]'); if(el) showTip(el); else hideTip(); });
document.addEventListener('focusin', e => { const el=e.target.closest && e.target.closest('[data-tip]'); if(el) showTip(el); else hideTip(); });
let touchT; document.addEventListener('touchstart', e => { const el=e.target.closest('[data-tip]'); if(!el) return; touchT=setTimeout(()=>showTip(el),450); }, {passive:true});
document.addEventListener('touchend', () => { clearTimeout(touchT); setTimeout(hideTip,1500); });
document.addEventListener('click', e => { const el=e.target.closest('.is-disabled[data-tip]'); if(el){ e.stopPropagation(); e.preventDefault(); UI.toast(el.getAttribute('data-tip')); } }, true);

/* layout mini icons */
UI.layIcon = (id) => {
  const r = (x,y,w,h,f='#C7CFDB') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${f}"/>`;
  const g = {L1: r(4,4,32,4)+r(4,11,32,4)+r(4,18,32,4)+r(4,25,24,4),
    L2: r(4,4,20,4)+r(4,11,20,4)+r(4,18,20,4)+r(27,4,9,14,'#9DB4EC'),
    L3: r(4,4,15,25,'#E3E7EE')+r(22,4,14,4)+r(22,11,14,4)+r(22,18,14,4),
    L4: r(4,4,15,4)+r(21,4,15,4)+r(4,11,15,4)+r(21,11,15,4)+r(4,18,15,4)+r(21,18,15,4),
    L5: r(4,4,32,12,'#9DB4EC')+r(4,19,32,3)+r(4,25,24,3),
    L6: r(4,4,9,10)+r(15.5,4,9,10)+r(27,4,9,10)+r(4,17,9,10)+r(15.5,17,9,10)+r(27,17,9,10)}[id]||'';
  return `<svg width="40" height="32" viewBox="0 0 40 32" aria-hidden="true">${g}</svg>`;
};
UI.typeChip = (t) => `<span class="chip outline" title="${esc(WS.TYPES[t].label)}">${esc(WS.TYPES[t].icon)} ${esc(WS.TYPES[t].label)}</span>`;
UI.wsChip = (ws) => { const s=WS.R.wsStatus(ws); return UI.chip(s.label, s.chip, s.icon); };
UI.exChip = (ex) => { const s=WS.R.exState(ex); return UI.chip(s.label, s.chip, s.icon); };
/* ---------- text diff (so sánh phiên bản, tạo lại) ---------- */
UI.diffHTML = (a, b) => {
  const A1 = a.split('\n'), B1 = b.split('\n'); const setA=new Set(A1), setB=new Set(B1);
  return `<div class="diff"><div><div class="lbl">Hiện tại</div><pre>${A1.map(l=>setB.has(l)?esc(l):`<span class="del">${esc(l)}</span>`).join('\n')}</pre></div><div><div class="lbl">Mới</div><pre>${B1.map(l=>setA.has(l)?esc(l):`<span class="add">${esc(l)}</span>`).join('\n')}</pre></div></div>`;
};
UI.qText = (type, q) => WS.V.textsOf({questions:[q]}, type).map(t=>t.text).join(' / ') + (q.correctId?` [✓ ${(q.options.find(o=>o.id===q.correctId)||{}).text}]`:'') + (q.answer?` [${q.answer}]`:'') + (q.correctIdx!=null?` [✓ ${q.options[q.correctIdx]}]`:'');
UI.exText = (type, d) => [d.title, d.instruction, d.passage||''].concat(d.questions.map((q,i)=>`${i+1}. ${UI.qText(type,q)}`)).filter(Boolean).join('\n');
