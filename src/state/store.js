/* ============ CORE: utils, store, persistence ============ */
import { WS } from '../ws.js';
const U = WS.U = {};
WS.ACT = WS.ACT || {}; WS.views = WS.views || {};

U.esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
U.clone = o => JSON.parse(JSON.stringify(o));
U.uid = (p='id') => p+'-'+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3);
U.hash = s => { let h=2166136261>>>0; s=String(s); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
U.rng = seed => { let a = (typeof seed==='number'?seed:U.hash(seed))>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
U.shuffle = (arr, r) => { const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
U.pick = (arr, r) => arr[Math.floor(r()*arr.length)];
U.words = s => (String(s||'').toLowerCase().match(/[a-z][a-z'’\-]*/g)||[]).map(w=>w.replace(/’/g,"'"));
U.wc = s => U.words(s).length;
U.stem = w => { w=w.toLowerCase(); if(w.endsWith("'s")) w=w.slice(0,-2);
  const c=[w]; if(w.endsWith('ies')) c.push(w.slice(0,-3)+'y'); if(w.endsWith('es')) c.push(w.slice(0,-2)); if(w.endsWith('s')) c.push(w.slice(0,-1));
  if(w.endsWith('ing')){ c.push(w.slice(0,-3)); c.push(w.slice(0,-3)+'e'); } if(w.endsWith('ed')){ c.push(w.slice(0,-2)); c.push(w.slice(0,-1)); } return c; };
U.fmtTime = t => { const d=new Date(t); return d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); };
U.fmtDate = t => { const d=new Date(t); return d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})+' '+U.fmtTime(t); };
U.ago = t => { const s=(Date.now()-t)/1000; if(s<60) return 'vừa xong'; if(s<3600) return Math.floor(s/60)+' phút trước'; if(s<86400) return Math.floor(s/3600)+' giờ trước'; return Math.floor(s/86400)+' ngày trước'; };
U.debounce = (f,ms)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>f(...a),ms); }; };
U.sleep = ms => new Promise(r=>setTimeout(r,ms));
U.download = (name, text, mime='text/html') => { const b=new Blob([text],{type:mime+';charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},1500); };
U.slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* ---------- STORE ---------- */
const KEY = 'wsstudio.v1';
const S = WS.S = { state:null, listeners:[], persistOk:true, saveError:false, lastSaved:null, session:{undo:{},redo:{},loadedRev:{},ui:{}} };
WS.store = S;

S.memoryFallback = false;
S.load = () => {
  try { const st = WS.services.storage.load(KEY); if(st && st.schemaVersion===WS.SCHEMA) return S.upgrade(st); }
  catch(e){ S.memoryFallback = true; }
  return null;
};
/* Bổ sung phần mới vào dữ liệu đã lưu mà không xóa dữ liệu cũ: bố cục L5, L6 (D-135), mẫu phiếu */
S.upgrade = st => {
  st.layouts = st.layouts || [];
  WS.LAYOUTS.forEach(l=>{ const cur = st.layouts.find(x=>x.id===l.id); if(!cur) st.layouts.push(U.clone(l)); else if(l.types && !cur.types) cur.types = l.types.slice(); });
  st.wsTemplates = st.wsTemplates || [];
  return st;
};
S.persist = () => {
  if(S.state.demo && S.state.demo.netFail){ S.saveError = true; return false; }
  try { WS.services.storage.save(KEY, S.state); S.saveError=false; S.lastSaved=Date.now(); return true; }
  catch(e){ S.memoryFallback = true; S.saveError=false; S.lastSaved=Date.now(); return false; }
};
S.persistSoon = U.debounce(()=>S.persist(), 120);
S.emit = () => { S.listeners.forEach(f=>{ try{f();}catch(e){ console.error(e); } }); };
S.on = f => S.listeners.push(f);
S.commit = (fn, opts={}) => { const r = fn(S.state); S.state.updatedAt=Date.now(); if(opts.persist!==false) S.persistSoon(); if(opts.render!==false) S.emit(); return r; };

/* ---------- lookups ---------- */
const Q = WS.Q = {};
Q.user = id => WS.USERS.find(u=>u.id===id) || {id, name:id, role:'l1', color:'#888'};
Q.me = () => Q.user(S.state.currentUserId);
Q.curricula = () => S.state.curricula;
Q.curriculum = id => S.state.curricula.find(c=>c.id===id);
Q.allLessons = () => { const out=[]; S.state.curricula.forEach(c=>c.levels.forEach(l=>l.units.forEach(u=>u.lessons.forEach(ls=>out.push({c,l,u,ls}))))); return out; };
Q.lessonCtx = id => Q.allLessons().find(x=>x.ls.id===id);
Q.lesson = id => { const x=Q.lessonCtx(id); return x && x.ls; };
Q.lessonLabel = id => { const x=Q.lessonCtx(id); if(!x) return '—'; return `${x.c.name} · ${x.l.name} · ${x.u.code} · ${x.ls.code} ${x.ls.name}`; };
Q.lessonShort = id => { const x=Q.lessonCtx(id); if(!x) return '—'; return `${x.l.name} · ${x.u.code} · Lesson ${x.ls.code} ${x.ls.name}`; };
Q.prevLessons = id => { const x=Q.lessonCtx(id); if(!x) return []; const out=[]; for(const l of x.c.levels){ for(const u of l.units){ for(const ls of u.lessons){ if(ls.id===id) return out; out.push(ls); } } } return out; };
Q.standard = type => S.state.standards.find(s=>s.type===type);
Q.theme = id => S.state.themes.find(t=>t.id===id);
Q.ex = id => S.state.exercises.find(e=>e.id===id);
Q.ws = id => S.state.worksheets.find(w=>w.id===id);
Q.media = id => S.state.media.find(m=>m.id===id);
Q.layout = id => S.state.layouts.find(l=>l.id===id) || S.state.layouts[0];
Q.layoutsFor = type => S.state.layouts.filter(l=>!l.types || !type || l.types.includes(type));

/* ---------- audit & notifications ---------- */
WS.audit = (action, targetType, targetId, extra={}) => {
  S.state.audit.push({id:U.uid('a'), at:Date.now(), actorId:S.state.currentUserId, action, targetType, targetId, before:extra.before||null, after:extra.after||null, note:extra.note||''});
};
WS.notify = (userIds, text, link) => {
  (Array.isArray(userIds)?userIds:[userIds]).forEach(uid=>{ if(!uid) return; S.state.notifications.push({id:U.uid('n'), userId:uid, at:Date.now(), text, link, read:false}); });
};
WS.usersByRole = role => WS.USERS.filter(u=>u.role===role).map(u=>u.id);
