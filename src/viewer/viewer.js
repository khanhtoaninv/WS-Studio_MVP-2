/* ============ VIEWER (shared; embedded into exported files) ============ */
(function(){
var WSV = window.WSV = {};
var esc = function(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); };
var LET = 'ABCDEFGHIJ';
WSV.esc = esc;

/* ---------- icon set: SVG nét thay ký tự/emoji trong giao diện (không đụng nội dung phiếu) ---------- */
var IC = {
  home:'M3 11l9-8 9 8M5 10v10h14V10', plus:'M12 5v14M5 12h14', doc:'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6',
  grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', book:'M5 4h13v16H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h11',
  check:'M5 12.5l4.5 4.5L19 7.5', target:'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  list:'M5 7h14M5 12h14M5 17h14', mail:'M4 6h16v12H4zM4 7l8 6 8-6',
  gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.5 7.5 0 0 0-1.7-1L15 3.5h-4l-.3 2.5a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.5 7.5 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.5z',
  alert:'M12 4l9 16H3zM12 10v4M12 17.5v.01', checkc:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12.5l3 3 5-6',
  x:'M6 6l12 12M18 6L6 18', xc:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6',
  bell:'M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0', flask:'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3',
  back:'M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 8h-4', hourglass:'M7 3h10M7 21h10M8 3v4l4 5 4-5V3M8 21v-4l4-5 4 5v4',
  pencil:'M4 20l1-4L16 5l3 3L8 19zM14 7l3 3', up:'M12 19V5M6 11l6-6 6 6', down:'M12 5v14M6 13l6 6 6-6',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  unlock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 7.5-2', lock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  archive:'M4 5h16v4H4zM5 9h14v10H5zM10 13h4', palette:'M12 3a9 9 0 0 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a4 4 0 0 0 4-4 9 9 0 0 0-9-10zM8 11h.01M12 7h.01M16 9h.01',
  clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', image:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01',
  trash:'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', chat:'M4 5h16v11H9l-5 4z', sound:'M4 10h4l5-4v12l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',
  video:'M3 6h13v12H3zM16 10l5-3v10l-5-3', expand:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  pointer:'M9 11V5a1.5 1.5 0 0 1 3 0v5M12 9a1.5 1.5 0 0 1 3 0v2M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2-4 1.5-1L9 15z',
  star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3.2 9.5l6.1-.9z', refresh:'M4 12a8 8 0 1 0 3-6.2M4 4v4h4',
  erase:'M9 6h11v12H9l-5-6zM12 10l5 4M17 10l-5 4', chev:'M6 9l6 6 6-6', arrow:'M5 12h14M13 6l6 6-6 6', cursor:'M7 17L17 7M9 7h8v8',
  toolbox:'M4 8h16v11H4zM9 8V5h6v3M4 13h16', search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4', pages:'M8 8h12v12H8zM4 16V4h12', chevl:'M15 6l-6 6 6 6', chevr:'M9 6l6 6-6 6', info:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8v.01'
};
var IC_FILL = {star:1};
var GLYPH = {'⌂':'home','＋':'plus','▤':'doc','▦':'grid','❖':'book','✓':'check','✔':'check','◎':'target','≡':'list','☰':'list','✉':'mail','⚙':'gear','⚠':'alert',
  '✅':'checkc','✕':'x','❌':'xc','🔔':'bell','🧪':'flask','↩':'back','⏳':'hourglass','✎':'pencil','✏':'pencil','⬆':'up','⬇':'down','👁':'eye','🔓':'unlock','🔒':'lock',
  '🗄':'archive','🎨':'palette','🕘':'clock','🖼':'image','🗑':'trash','💬':'chat','🔊':'sound','🎬':'video','🎯':'target','⛶':'expand','✋':'pointer','★':'star','☆':'star',
  '⟲':'refresh','⌫':'erase','▾':'chev','➝':'arrow','➚':'cursor','🧰':'toolbox','🔍':'search','⧉':'pages','◀':'chevl','▶':'chevr','ⓘ':'info'};
WSV.ic = function(name, glyph){
  var f = IC_FILL[name] && glyph!=='☆';
  return '<svg class="ic" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="'+(f?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+IC[name]+'"/></svg>';
};
var GRE = new RegExp('('+Object.keys(GLYPH).join('|')+')️?', 'g');
var GRE1 = new RegExp(Object.keys(GLYPH).join('|'));
var SKIP = 'script,style,textarea,input,select,option,svg,[data-noicon],.wsv-content,.wsx';
WSV.iconize = function(root){
  if(!root || root.nodeType===8) return;
  var host = root.nodeType===3 ? root.parentNode : root;
  if(!host || (host.closest && host.closest(SKIP))) return;
  var list = [];
  if(root.nodeType===3){ list.push(root); }
  else {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode:function(n){
      if(!n.nodeValue || !GRE1.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      return n.parentNode.closest && n.parentNode.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var n; while((n = w.nextNode())) list.push(n);
  }
  list.forEach(function(t){
    var s = t.nodeValue; GRE.lastIndex=0; if(!GRE.test(s)) return; GRE.lastIndex=0;
    var frag = document.createDocumentFragment(), last = 0, m;
    while((m = GRE.exec(s))){
      if(m.index>last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      var sp = document.createElement('span'); sp.className='ic-w'; sp.setAttribute('aria-hidden','true'); sp.innerHTML = WSV.ic(GLYPH[m[1]], m[1]);
      frag.appendChild(sp); last = m.index + m[0].length;
    }
    if(last<s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    t.parentNode.replaceChild(frag, t);
  });
};
WSV.labelIconOnly = function(root){
  if(!root || root.nodeType!==1) return;
  var els = root.matches && root.matches('button,a,[role=button]') ? [root] : [];
  root.querySelectorAll('button,a,[role=button]').forEach(function(e){ els.push(e); });
  els.forEach(function(e){
    if(e.getAttribute('aria-label') || (e.textContent||'').trim()) return;
    var t = e.getAttribute('title') || e.getAttribute('data-tip'); if(t) e.setAttribute('aria-label', t);
  });
};
WSV.autoIconize = function(root){
  var pend = [], sched = false;
  var run = function(){ sched=false; var l=pend; pend=[]; l.forEach(function(n){ if(n.isConnected){ WSV.iconize(n); WSV.labelIconOnly(n.nodeType===3?n.parentNode:n); } }); };
  var mo = new MutationObserver(function(ms){
    ms.forEach(function(m){ if(m.type==='characterData') pend.push(m.target); else m.addedNodes.forEach(function(n){ if(n.nodeType===1||n.nodeType===3) pend.push(n); }); });
    if(!sched){ sched=true; Promise.resolve().then(run); }
  });
  mo.observe(root, {childList:true, subtree:true, characterData:true});
  WSV.iconize(root); WSV.labelIconOnly(root);
};

/* ---------- generated media ---------- */
WSV.svgImage = function(m){
  var h = m.hue||200, s = m.style||0, kw = esc(m.keyword||''), e = m.emoji||'🖼️';
  var bg1 = 'hsl('+h+',70%,92%)', bg2 = 'hsl('+((h+40)%360)+',75%,84%)', ac = 'hsl('+h+',55%,55%)';
  var deco = s===0 ? '<circle cx="40" cy="36" r="22" fill="'+ac+'" opacity=".18"/><circle cx="262" cy="160" r="40" fill="'+ac+'" opacity=".14"/>'
    : s===1 ? '<g opacity=".16" stroke="'+ac+'" stroke-width="10">'+[0,1,2,3,4,5].map(function(i){return '<line x1="'+(i*60-40)+'" y1="200" x2="'+(i*60+60)+'" y2="0"/>';}).join('')+'</g>'
    : '<g fill="'+ac+'" opacity=".2">'+[0,1,2,3,4,5,6,7,8,9,10,11].map(function(i){return '<circle cx="'+(18+(i%6)*52)+'" cy="'+(20+Math.floor(i/6)*150)+'" r="5"/>';}).join('')+'</g>';
  return '<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(m.alt||kw)+'"><defs><linearGradient id="g'+h+s+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+bg1+'"/><stop offset="1" stop-color="'+bg2+'"/></linearGradient></defs>'+
    '<rect width="300" height="200" fill="url(#g'+h+s+')"/>'+deco+'<ellipse cx="150" cy="150" rx="70" ry="10" fill="#000" opacity=".07"/>'+
    '<text x="150" y="118" text-anchor="middle" font-size="78">'+e+'</text>'+
    '<text x="150" y="184" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="hsl('+h+',40%,30%)">'+kw+'</text></svg>';
};
WSV.videoScene = function(m, t){
  var h = m.hue||260; var x = 60 + (t%1)*180;
  return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="hsl('+h+',45%,22%)"/>'+
   '<circle cx="'+(260-t*8%200)+'" cy="40" r="18" fill="#FFE36E" opacity=".85"/>'+
   '<rect x="0" y="130" width="320" height="50" fill="hsl('+h+',35%,16%)"/>'+
   '<text x="'+x+'" y="122" font-size="44">🧑‍🚀</text><text x="'+(240-x/2)+'" y="122" font-size="38">🤖</text>'+
   '<text x="12" y="20" font-family="sans-serif" font-size="11" fill="#fff" opacity=".7">'+esc(m.title||'Video')+' · mô phỏng</text></svg>';
};
var FB_IMG = {
  star:'<svg viewBox="0 0 100 100"><path d="M50 6l12 28 30 3-23 20 7 30-26-16-26 16 7-30-23-20 30-3z" fill="#FFC93C" stroke="#E0A200" stroke-width="3"/></svg>',
  check:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#1E8A4C"/><path d="M28 52l15 15 30-32" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  confetti:'<svg viewBox="0 0 100 100">'+[['#E8483B',20,30,20],['#2D5BD0',70,22,-25],['#FFC93C',45,15,40],['#1E8A4C',80,60,10],['#9B59D0',25,70,-30],['#FF8A3D',55,80,15],['#2D5BD0',12,52,60],['#E8483B',88,38,-10]].map(function(c){return '<rect x="'+c[1]+'" y="'+c[2]+'" width="10" height="5" rx="1.5" fill="'+c[0]+'" transform="rotate('+c[3]+' '+c[1]+' '+c[2]+')"/>';}).join('')+'<circle cx="50" cy="50" r="16" fill="#FFE36E"/><text x="50" y="57" text-anchor="middle" font-size="20">🎉</text></svg>',
  thumbs:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#E6EDFB"/><text x="50" y="68" text-anchor="middle" font-size="50">👍</text></svg>',
  trophy:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#FFF2C4"/><text x="50" y="68" text-anchor="middle" font-size="50">🏆</text></svg>',
  smile:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#FFD84D" stroke="#E0A200" stroke-width="3"/><circle cx="36" cy="42" r="5" fill="#1A2233"/><circle cx="64" cy="42" r="5" fill="#1A2233"/><path d="M30 60q20 20 40 0" fill="none" stroke="#1A2233" stroke-width="5" stroke-linecap="round"/></svg>',
  arrow:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#FDEBDD"/><path d="M68 34a22 22 0 1 0 4 22" fill="none" stroke="#C45A12" stroke-width="8" stroke-linecap="round"/><path d="M62 22l8 13-15 3" fill="none" stroke="#C45A12" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cloud:'<svg viewBox="0 0 100 100"><path d="M28 70a16 16 0 0 1 2-32 22 22 0 0 1 42 4 14 14 0 0 1-2 28z" fill="#DCE6F5" stroke="#7FA1E8" stroke-width="3"/><text x="50" y="62" text-anchor="middle" font-size="22">💭</text></svg>',
  sprout:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#E3F4EA"/><text x="50" y="68" text-anchor="middle" font-size="48">🌱</text></svg>',
  puzzle:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#EEE7FB"/><text x="50" y="68" text-anchor="middle" font-size="46">🧩</text></svg>'
};
WSV.FB_IMG = FB_IMG;
WSV.FB_TEXT = {correct:['Great job!','Well done!','Excellent!','You got it!','Super!'], wrong:['Nice try!','Almost! Try again.','Keep going!','Not quite. You can do it!']};
var actx = null;
WSV.fbSound = function(key, vol){
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    var seq = {chime:[[880,.12],[1320,.22]], arp:[[523,.08],[659,.08],[784,.08],[1047,.18]], pop:[[600,.05],[900,.09]], bell:[[1175,.3]],
               soft:[[330,.18],[262,.26]], bloop:[[392,.1],[294,.22]], hmm:[[311,.16],[294,.16],[277,.22]]}[key] || [[660,.15]];
    var t = actx.currentTime;
    seq.forEach(function(n){ var o=actx.createOscillator(), g=actx.createGain(); o.type = /soft|bloop|hmm/.test(key)?'triangle':'sine'; o.frequency.value=n[0];
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(0.001,(vol==null?.6:vol)*0.35),t+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t+n[1]);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t+n[1]+0.02); t+=n[1]*0.8; });
  }catch(e){}
};

/* ---------- block rendering ---------- */
function blankify(text, ans, T){
  return esc(text).replace(/_{2,}/g, function(){ return '<span class="blank">'+(T&&ans!=null?'<span class="ans-in">'+esc(ans)+'</span>':'&nbsp;')+'</span>'; });
}
function ansLine(T, html){ return T ? '<div class="ans">'+html+'</div>' : ''; }
function expl(T, q){ return T && q.explanation ? '<div class="expl">'+esc(q.explanation)+'</div>' : ''; }
function qtog(T){ return T ? '<button class="qtog" data-act="qtog" title="Xem/ẩn đáp án câu" aria-label="Xem hoặc ẩn đáp án câu">?</button>' : ''; }
/* Chế độ làm bài trên phiếu của Làm bài trên lớp (D-131): opts.fill = {values, onChange, locked, result}.
   Đặt trong lúc dựng trang để qHTML hiện ô nhập, lựa chọn đã chọn và màu đúng/sai. */
var FILL = null;
function fv(q){ var v = FILL.values[q.id]; return v==null ? '' : String(v); }
function fcls(q){
  if(!FILL) return '';
  var r = FILL.result && FILL.result.perQ ? FILL.result.perQ[q.id] : undefined;
  return ' fq'+(FILL.locked?' locked':'')+(r===true?' res-ok':r===false?' res-no':FILL.result?' res-none':'');
}
function pk(q, k){ return FILL && fv(q)===String(k) ? ' picked' : ''; }
function finp(q, cls, ph){
  return '<input class="fill-inp'+(cls?' '+cls:'')+'" data-fq="'+esc(q.id)+'" value="'+esc(fv(q))+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+(FILL.locked?' readonly':'')+
    ' autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Câu '+esc(q.id)+'">';
}
function fblank(text, ans, T, q){
  var first = true;
  return esc(text).replace(/_{2,}/g, function(){
    var inner = first ? finp(q) : '&nbsp;'; first = false;
    return '<span class="blank fblank">'+inner+(T&&ans!=null?'<span class="ans-in">'+esc(ans)+'</span>':'')+'</span>'; });
}
function ordWords(v){ return v ? String(v).replace(/[.?!]+$/,'').split(' ').filter(Boolean) : []; }
function qHTML(it, q, i, T){
  var head = '<div class="q'+fcls(q)+'" data-q="'+esc(q.id)+'" data-type="'+it.type+'"><span class="qn">'+(i+1)+'</span><div class="qb">';
  var tail = '</div>'+qtog(T)+'</div>';
  var F = FILL;
  switch(it.type){
    case 'mcq': {
      var ci = T ? q.options.findIndex(function(o){return o.id===q.correctId;}) : -1;
      return head+'<span class="qt">'+blankify(q.stem, null, false)+'</span><div class="opts">'+q.options.map(function(o,k){ return '<span class="opt'+(k===ci?' c':'')+pk(q,k)+'" data-k="'+k+'"><b>'+LET[k]+'</b> '+esc(o.text)+'</span>'; }).join('')+'</div>'+
        ansLine(T, ci>=0?('Answer: '+LET[ci]+' · '+esc(q.options[ci].text)):'')+expl(T,q)+tail; }
    case 'fill_blank': return head+'<span class="qt">'+(F?fblank(q.text,(q.accepted||[])[0],T,q):blankify(q.text, (q.accepted||[])[0], T))+'</span>'+ansLine(T,'Accept: '+esc((q.accepted||[]).join(' / ')))+expl(T,q)+tail;
    case 'word_form': return head+'<span class="qt">'+(F?fblank(q.text,(q.accepted||[])[0],T,q):blankify(q.text, (q.accepted||[])[0], T))+'<span class="base">'+esc(q.baseWord)+'</span></span>'+ansLine(T,'Accept: '+esc((q.accepted||[]).join(' / ')))+expl(T,q)+tail;
    case 'ordering': {
      if(F){
        var built = ordWords(fv(q)), cnt = {}; built.forEach(function(w){ cnt[w]=(cnt[w]||0)+1; });
        return head+'<div class="ord">'+(q.words||[]).map(function(w,k){ var u = cnt[w]>0; if(u) cnt[w]--; return '<span data-k="'+k+'"'+(u?' class="used"':'')+'>'+esc(w)+'</span>'; }).join('')+'</div>'+
          '<span class="line ord-line"><span class="ord-txt">'+esc(fv(q))+'</span>'+(built.length&&!F.locked?'<button class="ord-clr" data-ordclr="1" title="Xếp lại từ đầu" aria-label="Xếp lại từ đầu">↺</button>':'')+(T?'<span class="ans-in">'+esc(q.answerText)+'</span>':'')+'</span>'+expl(T,q)+tail;
      }
      return head+'<div class="ord">'+(q.words||[]).map(function(w,k){return '<span data-k="'+k+'">'+esc(w)+'</span>';}).join('')+'</div><span class="line">'+(T?'<span class="ans-in">'+esc(q.answerText)+'</span>':'')+'</span>'+expl(T,q)+tail; }
    case 'tfng': return head+'<span class="qt">'+esc(q.statement)+'</span><span class="tfbox">'+['T','F','NG'].map(function(a){ var c=(T&&q.answer===a?'c':'')+pk(q,a); return '<span data-k="'+a+'"'+(c?' class="'+c.trim()+'"':'')+'>'+a+'</span>';}).join('')+'</span>'+ansLine(T,'Answer: '+esc(q.answer||''))+expl(T,q)+tail;
    case 'cloze_mcq': return '<div class="q'+fcls(q)+'" data-q="'+esc(q.id)+'" data-type="cloze_mcq"><span class="qn">'+q.n+'</span><div class="qb"><div class="opts">'+(q.options||[]).map(function(o,k){return '<span class="opt'+(T&&k===q.correctIdx?' c':'')+pk(q,k)+'" data-k="'+k+'"><b>'+LET[k]+'</b> '+esc(o)+'</span>';}).join('')+'</div>'+ansLine(T, T&&q.correctIdx!=null?('Answer: '+LET[q.correctIdx]+' · '+esc(q.options[q.correctIdx])):'')+expl(T,q)+'</div>'+qtog(T)+'</div>';
    case 'rewrite':
      if(F) return head+'<span class="qt">'+esc(q.original)+'</span><div style="margin-top:4px">'+finp(q,'wide',(q.lead||'')+' …')+'</div>'+ansLine(T,'Accept: '+esc((q.accepted||[]).join(' / ')))+expl(T,q)+tail;
      return head+'<span class="qt">'+esc(q.original)+'</span><div style="margin-top:4px"><b style="font-weight:600">'+esc(q.lead)+'</b> <span class="line" style="display:inline-block;width:72%;vertical-align:bottom"></span></div>'+ansLine(T,'Accept: '+esc((q.accepted||[]).join(' / ')))+expl(T,q)+tail;
    case 'short_answer': return head+'<span class="qt">'+esc(q.question)+'</span>'+(F?'<div style="margin-top:4px">'+finp(q,'wide','Tối đa '+(q.maxWords||5)+' từ')+'</div>':'<span class="line"></span>')+ansLine(T,'Accept: '+esc((q.accepted||[]).join(' / ')))+expl(T,q)+tail;
    case 'matching': {
      var li = T ? (it.rightList||[]).indexOf(q.right) : -1;
      var slot = F ? '<span class="blank fblank" style="min-width:46px"><select class="fill-sel" data-fq="'+esc(q.id)+'"'+(F.locked?' disabled':'')+' aria-label="Chọn chữ cái"><option value="">?</option>'+(it.rightList||[]).map(function(r,k){ return '<option value="'+k+'"'+(fv(q)===String(k)?' selected':'')+'>'+LET[k]+'</option>'; }).join('')+'</select>'+(T&&li>=0?'<span class="ans-in">'+LET[li]+'</span>':'')+'</span>'
        : '<span class="blank" style="min-width:34px">'+(T&&li>=0?'<span class="ans-in">'+LET[li]+'</span>':'&nbsp;')+'</span>';
      return '<div class="q ml'+fcls(q)+'" data-q="'+esc(q.id)+'" data-type="matching"><span class="qn">'+(i+1)+'</span><div class="qb">'+esc(q.left)+' '+slot+'</div>'+qtog(T)+'</div>';
    }
  }
  return '';
}
function mediaHTML(it, opts, side){
  var imgs = (it.media||[]).filter(function(m){return m.kind==='image';}), oth = (it.media||[]).filter(function(m){return m.kind!=='image';});
  var h = '';
  imgs.forEach(function(m,k){ h += (opts.mediaFail && k===0 && !opts.retried) ? '<div class="mimg err" data-media="'+esc(m.id)+'">Không tải được ảnh.<br><button class="wb sm" data-act="retry">Thử lại</button></div>'
    : '<button class="mimg" data-act="img" data-media="'+esc(m.id)+'" aria-label="Phóng to ảnh: '+esc(m.alt)+'">'+WSV.svgImage(m)+'</button>'; });
  oth.forEach(function(m){ h += m.kind==='audio' ? '<button class="maud" data-act="audio" data-media="'+esc(m.id)+'" aria-label="Nghe audio">▶ '+esc(m.title||'Listen')+'</button>'
    : '<button class="mvid" data-act="video" data-media="'+esc(m.id)+'" aria-label="Xem video">▶ Video · '+esc(m.title||'')+'</button>'; });
  return h ? '<div class="wsx-media"'+(side?' style="flex-direction:column"':'')+'>'+h+'</div>' : '';
}
function passageHTML(it, T){
  if(!it.passage) return '';
  var p = esc(it.passage);
  if(it.type==='cloze_mcq'){ var qs={}; (it.questions||[]).forEach(function(q){qs[q.n]=q;});
    p = p.replace(/\{(\d+)\}/g, function(_,n){ var q=qs[n]; return '<span class="gap">'+n+'</span><span class="blank">'+(T&&q&&q.correctIdx!=null?'<span class="ans-in">'+esc(q.options[q.correctIdx])+'</span>':'&nbsp;')+'</span>'; }); }
  return '<div class="psg">'+p+'</div>';
}
WSV.L6_TYPES = ['mcq','matching','fill_blank','word_form','tfng'];
WSV.effLayout = function(it){
  var L = it.layout||'L1'; var hasImg = (it.media||[]).some(function(m){return m.kind==='image';});
  if((L==='L2' || L==='L5') && !hasImg) L = 'L1';
  if(L==='L6' && WSV.L6_TYPES.indexOf(it.type)<0) L = 'L1';
  if(L==='L3' && !it.passage) L = (it.questions||[]).length>=6 ? 'L4':'L1';
  return L;
};
WSV.blockUnits = function(it, idx, opts){
  var T = opts.teacher, L = it._lay || WSV.effLayout(it);
  var tools = opts.mini ? '<button class="edit-hook" data-act="edit" data-ex="'+esc(it.id)+'">✎ Sửa</button>' :
    '<span class="wsx-tools"><button data-act="pin" title="Ghim bài (phím số để nhảy)" aria-label="Ghim bài">'+(opts.pinned&&opts.pinned.indexOf(it.id)>=0?'★':'☆')+'</button><button data-act="focus" title="Phóng to bài" aria-label="Phóng to bài">⤢</button>'+
    (T?'<button data-act="exans" title="Xem/ẩn đáp án bài" aria-label="Xem/ẩn đáp án bài">✓</button><button data-act="note" title="Ghi chú giáo viên" aria-label="Ghi chú giáo viên">📝</button>':'')+'</span>';
  var head = '<div class="wsx-h"><span class="wsx-no">'+(idx+1)+'</span><span class="wsx-t">'+esc(it.title)+'</span>'+tools+'</div>'+(it.instruction?'<div class="wsx-ins">'+esc(it.instruction)+'</div>':'');
  var wb = it.wordBank && it.wordBank.length ? '<div class="wbank">'+it.wordBank.map(esc).join('<span style="color:#C7CFDB">·</span>')+'</div>' : '';
  var qs = (it.questions||[]).map(function(q,i){ return qHTML(it,q,i,T); });
  var units = [];
  if(it.type==='matching'){
    var right = '<div>'+(it.rightList||[]).map(function(r,k){ return '<div class="mr"><b style="font-family:system-ui,sans-serif;font-size:12.5px">'+LET[k]+'</b> <span class="'+(/^[←-⯿\ud83c-\udbff]/.test(r)||r.length<=3?'em':'')+'">'+esc(r)+'</span></div>'; }).join('')+'</div>';
    var body = '<div class="mt"><div>'+qs.join('')+'</div>'+right+'</div>';
    if(L==='L6') body = '<div class="lay6">'+qs.join('')+'</div><div class="lay6 right">'+(it.rightList||[]).map(function(r,k){ return '<div class="mr"><b style="font-family:system-ui,sans-serif;font-size:12.5px">'+LET[k]+'</b> <span class="'+(/^[←-⯿\ud83c-\udbff]/.test(r)||r.length<=3?'em':'')+'">'+esc(r)+'</span></div>'; }).join('')+'</div>';
    if(L==='L5') body = '<div class="lay5">'+mediaHTML(it,opts)+'</div>'+body; else if(L==='L6') body = mediaHTML(it,opts)+body; else if(L==='L2') body = '<div class="lay2"><div>'+body+'</div><div class="side">'+mediaHTML(it,opts,true)+'</div></div>'; else body = mediaHTML(it,opts)+body;
    units.push({kind:'whole', html:head+wb+body}); return {units:units, L:L};
  }
  if(L==='L2'){ units.push({kind:'whole', html:head+'<div class="lay2"><div>'+passageHTML(it,T)+wb+qs.join('')+'</div><div class="side">'+mediaHTML(it,opts,true)+'</div></div>'}); return {units:units,L:L}; }
  if(L==='L3'){ var left = passageHTML(it,T)+mediaHTML(it,opts); units.push({kind:'whole', html:head+'<div class="lay3"><div>'+left+'</div><div>'+wb+qs.join('')+'</div></div>', parts:{head:head, left:left, wb:wb, qs:qs}}); return {units:units,L:L}; }
  units.push({kind:'head', html:head+(L==='L5'?'<div class="lay5">'+mediaHTML(it,opts)+'</div>':mediaHTML(it,opts))+passageHTML(it,T)+wb});
  if(L==='L6'){ for(var k6=0;k6<qs.length;k6+=3) units.push({kind:'q', html:'<div class="lay6">'+qs.slice(k6,k6+3).join('')+'</div>'}); }
  else if(L==='L4'){ for(var k=0;k<qs.length;k+=2) units.push({kind:'q', html:'<div class="qgrid">'+qs[k]+(qs[k+1]||'')+'</div>'}); }
  else qs.forEach(function(h){ units.push({kind:'q', html:h}); });
  return {units:units, L:L};
};
WSV.sheetHead = function(d){
  var m = d.meta;
  return '<div class="sheet-head"><h1>'+esc(m.title)+'</h1><div class="meta"><span>'+esc(m.lesson||'')+'</span>'+(m.theme?'<span class="theme-pill">'+esc(m.theme.emoji+' '+m.theme.name)+'</span>':'')+'<span>'+esc(m.code)+' · v'+esc(m.version)+'</span></div>'+
    '<div class="lines"><span>Name:</span><span>Class:</span><span style="flex:.6">Date:</span></div></div>';
};

/* pagination using real measurement */
WSV.PAGE_LIMIT = 1123-56-60-26;
/* D-134: bài giữ trọn trang; mặc định bật với bài có đoạn văn và bài nối, giáo viên bật/tắt từng bài (it.keep) */
WSV.KEEP_TYPES = ['tfng','cloze_mcq','short_answer','matching'];
WSV.keepOf = function(it){ return it.keep!=null ? !!it.keep : WSV.KEEP_TYPES.indexOf(it.type)>=0; };
WSV.paginate = function(root, d, opts){
  var meas = document.createElement('div');
  meas.className = 'wsv'+(opts.compact?' compact':''); meas.style.cssText='position:absolute;left:-30000px;top:0;width:794px;height:auto;visibility:hidden;display:block';
  meas.innerHTML = '<div class="wsv-content" style="position:relative;inset:auto;width:794px"></div>';
  document.body.appendChild(meas);
  var box = meas.firstChild;
  var LIMIT = WSV.PAGE_LIMIT;
  box.innerHTML = WSV.sheetHead(d); var headH = box.offsetHeight;
  var measure = function(u){ box.innerHTML = '<section class="wsx'+(u.L==='L4'?' lay4':'')+'">'+u.html+'</section>'; return box.firstChild.offsetHeight; };
  var all = [];
  d.items.forEach(function(it, idx){
    var b = WSV.blockUnits(it, idx, opts), units = b.units, tot = 0;
    units.forEach(function(u,k){ u.L = b.L; u.ex = it.id; u.idx = idx; u.first = k===0; u.title = it.title; u.h = measure(u); tot += u.h; all.push(u); });
    units[0].tot = tot; units[0].brk = !!it.breakBefore; units[0].keep = WSV.keepOf(it);
  });
  var pages = [{units:[], h:headH}];
  var newPage = function(){ var p = {units:[], h:0}; pages.push(p); return p; };
  /* D-134: bài đoạn văn trái, câu hỏi phải không vừa chỗ còn lại: giữ đoạn văn và các câu đầu vừa trang, câu còn lại thành từng câu tiếp sang trang sau */
  var splitL3 = function(u, room, n){
    var P = u.parts, k = P.qs.length, part = null;
    while(k>1){ k--; part = {kind:'whole', L:u.L, html:P.head+'<div class="lay3"><div>'+P.left+'</div><div>'+P.wb+P.qs.slice(0,k).join('')+'</div></div>'}; part.h = measure(part); if(part.h <= room) break; }
    if(!part || part.h > room) return false;
    ['ex','idx','first','title','tot','brk','keep'].forEach(function(f){ part[f] = u[f]; });
    var rest = P.qs.slice(k).map(function(h){ var q = {kind:'q', L:u.L, split:true, html:h, ex:u.ex, idx:u.idx, first:false, title:u.title}; q.h = measure(q); return q; });
    all.splice.apply(all, [n, 1, part].concat(rest)); return true;
  };
  for(var n=0; n<all.length; n++){
    var u = all[n], p = pages[pages.length-1];
    if(u.first && p.units.length){
      var room = LIMIT - p.h - 20;
      if(u.brk || (u.keep && u.tot <= LIMIT-20 && u.tot > room)) p = newPage();
      else if(u.kind==='head'){ // tiêu đề và hướng dẫn không đứng một mình cuối trang: kéo theo tối đa 2 câu
        var need = u.h, m = 1; while(m<=2 && all[n+m] && !all[n+m].first){ need += all[n+m].h; m++; }
        if(need > room) p = newPage();
      }
    }
    if(u.first && u.parts && p.h + u.h + 20 > LIMIT){
      if(!(u.keep && u.tot <= LIMIT-20) && splitL3(u, LIMIT - p.h - 20, n)) u = all[n];
      else if(p.units.length){ p = newPage(); if(u.h + 20 > LIMIT && splitL3(u, LIMIT-20, n)) u = all[n]; }
      else if(splitL3(u, LIMIT - p.h - 20, n)) u = all[n];
      else if(pages.length===1 && splitL3(u, LIMIT-20, n)){ p = newPage(); u = all[n]; } // đoạn văn quá dài so với chỗ dưới đầu phiếu
    }
    var newSec = !p.units.length || p.units[p.units.length-1].ex!==u.ex;
    var add = u.h + (newSec?20:0) + (newSec && !u.first ? 18 : 0);
    if(p.h + add > LIMIT && p.units.length){ p = newPage(); newSec = true; add = u.h + 20 + (!u.first?18:0); }
    p.units.push(u); p.h += add; if(p.h > LIMIT) p.tall = true;
  }
  document.body.removeChild(meas);
  return pages;
};
/* Chia trang có tự thu gọn (D-87): phiếu dài hơn số trang mục tiêu thì bài dài một cột chuyển sang hai cột */
WSV.layoutPages = function(root, d, o, noCompact){
  var pages = WSV.paginate(root, d, o);
  var target = d.meta.pagesTarget;
  if(target && pages.length > target && !noCompact){
    d.items.forEach(function(it){ if(!it._lay && (it.questions||[]).length>=4 && ['mcq','fill_blank','word_form','tfng'].indexOf(it.type)>=0 && WSV.effLayout(it)==='L1') it._lay='L4'; });
    pages = WSV.paginate(root, d, o);
  }
  return pages;
};
/* D-133: thước đo trang duy nhất, dùng chung cho wizard, Preview và viewer.
   fill = số trang tính lẻ (trang cuối tính theo phần đã dùng); items[i] = chiều cao và các trang bài i chiếm */
WSV.measure = function(d, o){
  o = o || {};
  var pages = WSV.layoutPages(null, d, {teacher:d.meta.kind==='teacher', mini:true}, o.noCompact);
  var L = WSV.PAGE_LIMIT, items = d.items.map(function(){ return {h:0, pages:[]}; });
  pages.forEach(function(p, pi){ var prev = null; p.units.forEach(function(u){ var it = items[u.idx]; it.h += u.h + (prev!==u.ex ? 20 : 0); if(it.pages.indexOf(pi)<0) it.pages.push(pi); prev = u.ex; }); });
  var last = pages[pages.length-1];
  return {pages:pages.length, fill:(pages.length-1) + Math.min(1, last.h/L), tall:pages.some(function(p){ return p.tall; }),
    items:items, map:pages.map(function(p){ var segs = []; p.units.forEach(function(u){ var sg = segs[segs.length-1]; if(sg && sg.idx===u.idx) sg.h += u.h; else segs.push({idx:u.idx, h:u.h + 20}); }); return {h:p.h, segs:segs}; })};
};
WSV.pageHTML = function(d, page, pi, total, opts){
  var h = pi===0 ? WSV.sheetHead(d) : '';
  var cur = null;
  page.units.forEach(function(u){
    if(!cur || cur.ex!==u.ex){ if(cur) h += '</section>'; cur = u;
      h += '<section class="wsx'+(u.L==='L4'?' lay4':'')+(opts.cur===u.ex?' cur':'')+'" data-ex="'+esc(u.ex)+'">'+(u.first?'':'<div class="wsx-cont">Bài '+(u.idx+1)+' (tiếp) · '+esc(u.title)+(u.split?' · đoạn văn ở trang trước':'')+'</div>')+
        (opts.mini && u.first && u.idx>0 ? '<button class="brk-hook" data-act="brk" data-ex="'+esc(u.ex)+'" title="'+(u.brk?'Bỏ ngắt trang trước bài này':'Bắt đầu bài này ở trang mới')+'">'+(u.brk?'✕ Bỏ ngắt trang':'⤓ Ngắt trang ở đây')+'</button>' : ''); }
    h += u.html;
  });
  if(cur) h += '</section>';
  return '<div class="wsv-content">'+h+'<div class="wsv-foot"><span>'+esc(d.meta.code)+' · v'+esc(d.meta.version)+(d.meta.kind==='student'?' · Bản học sinh':' · Bản giáo viên')+'</span><span>'+(pi+1)+' / '+total+'</span></div></div>';
};

/* =================== MOUNT =================== */
WSV.mount = function(root, data, opts){
  opts = opts || {};
  var T = data.meta.kind==='teacher' && opts.answers!==false;
  var V = {data:data, opts:opts, T:T, zoom:1, fit:'width', mode:opts.mode||'page', two:false, tool:'cursor', color:'#E8483B', width:3, store:{strokes:{}, notes:{}, pins:[], layout:{}},
    undo:[], redo:[], pages:[], s:1, cur:opts.cur||null, play:false, revealed:[], timer:null, pageIdx:0};
  var key = opts.storageKey || ('wsv:'+data.meta.code+':v'+data.meta.version+':'+data.meta.kind);
  var canStore = true;
  try{ var raw = localStorage.getItem(key); if(raw) V.store = Object.assign(V.store, JSON.parse(raw)); }catch(e){ canStore = false; }
  if(V.store.layout && V.store.layout.two!=null && !opts.mini) V.two = V.store.layout.two;
  var save = function(){ if(opts.mini) return; try{ localStorage.setItem(key, JSON.stringify(V.store)); }catch(e){ if(canStore){ canStore=false; toast('Trình duyệt không cho lưu: nét vẽ sẽ mất khi đóng trang.'); } } };
  var coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
  root.className = 'wsv'+(opts.mini?' mini':'')+(coarse?' touch':'');
  root.innerHTML = (opts.mini?'':barHTML())+'<div class="wsv-hot"></div><div class="wsv-stage" tabindex="0"><div class="wsv-pages"></div></div>';
  var stage = root.querySelector('.wsv-stage'), pagesEl = root.querySelector('.wsv-pages');

  function barHTML(){
    var m = data.meta;
    return '<div class="wsv-bar" role="toolbar" aria-label="Thanh công cụ viewer">'+
      '<div class="grp"><span class="t" title="'+esc(m.title)+'">'+esc(m.title)+'</span><span class="wsv-kind'+(m.kind==='student'?' st':'')+'">'+(m.kind==='student'?'Bản học sinh':'Bản giáo viên')+'</span>'+(opts.flag?'<span class="wsv-flag">'+esc(opts.flag)+'</span>':'')+'</div>'+
      '<div class="grp"><button class="wb" data-act="mode-page" title="Theo trang">▤ Trang</button><button class="wb" data-act="mode-scroll" title="Cuộn liên tục">☰ Cuộn</button><button class="wb" data-act="present" title="Toàn màn hình / Trình chiếu">⛶ Trình chiếu</button><button class="wb" data-act="two" title="1 hoặc 2 trang">⧉ 2 trang</button></div>'+
      '<div class="grp"><button class="wb sm" data-act="prev" title="Trang trước (←)" aria-label="Trang trước">◀</button><select class="wsv-sel" data-act="goto" aria-label="Đi tới"></select><button class="wb sm" data-act="next" title="Trang sau (→)" aria-label="Trang sau">▶</button></div>'+
      '<div class="grp"><button class="wb sm" data-act="zout" title="Thu nhỏ (-)" aria-label="Thu nhỏ">−</button><button class="wb sm" data-act="zreset" title="Về tỷ lệ mặc định" aria-label="Về tỷ lệ mặc định">100%</button><button class="wb sm" data-act="zin" title="Phóng to (+)" aria-label="Phóng to">+</button><button class="wb sm" data-act="fitw" title="Vừa chiều ngang" aria-label="Vừa chiều ngang">↔</button><button class="wb sm" data-act="fith" title="Vừa chiều cao" aria-label="Vừa chiều cao">↕</button><button class="wb sm" data-act="zregion" title="Phóng vùng: kéo chọn vùng (Esc để về)" aria-label="Phóng vùng">🔍</button></div>'+
      (T?'<div class="grp"><button class="wb" data-act="allans" title="Xem/ẩn đáp án toàn phiếu (A)">✓ Đáp án</button><button class="wb sm" data-act="expl" title="Xem/ẩn giải thích">ⓘ</button>'+(opts.fill?'':'<button class="wb" data-act="quiz" title="Chế độ Quiz">🎯 Quiz</button><button class="wb" data-act="play" title="Làm bài ngay trên phiếu">🖱 Làm trên phiếu</button>')+'</div>':'')+
      '<div class="grp"><button class="wb" data-act="cursor" title="Con trỏ (Esc)">➚</button><button class="wb" data-act="pen" title="Bút (khóa) · P. Giữ Shift: đường thẳng; Ctrl/Cmd: đánh dấu; Ctrl+Shift: khung">✎ Bút</button><button class="wb sm" data-act="eraser" title="Tẩy (E)" aria-label="Tẩy">⌫</button><button class="wb sm" data-act="penmore" title="Màu, độ dày, hoàn tác, xóa nét" aria-label="Tùy chọn bút" aria-expanded="false">▾</button><span class="pen-more">'+
        ['#E8483B','#2D5BD0','#1E8A4C','#1A2233','#F2B705'].map(function(c){return '<button class="wb sm" data-act="color" data-c="'+c+'" aria-label="Màu" title="Màu"><span style="width:14px;height:14px;border-radius:50%;background:'+c+';display:inline-block"></span></button>';}).join('')+
        '<select class="wsv-sel" data-act="width" aria-label="Độ dày" style="width:70px"><option value="2">Mảnh</option><option value="3" selected>Vừa</option><option value="6">Dày</option></select>'+
        '<button class="wb sm" data-act="undo" title="Hoàn tác (Ctrl+Z)" aria-label="Hoàn tác">↶</button><button class="wb sm" data-act="redo" title="Làm lại (Ctrl+Y)" aria-label="Làm lại">↷</button><button class="wb sm" data-act="clear" title="Xóa tất cả nét vẽ" aria-label="Xóa tất cả nét vẽ">🗑</button><button class="wb sm" data-act="inkvis" title="Bật/tắt lớp vẽ" aria-label="Bật tắt lớp vẽ">👁</button></span></div>'+
      '<div class="grp"><button class="wb" data-act="tools" title="Công cụ trình bày">🧰 Trình bày</button><button class="wb" data-act="qboard" title="Bảng nhanh (hoặc nháy đúp vùng trống)">✎ Bảng nhanh</button></div>'+
    '</div>';
  }

  function toast(t){ var e=document.createElement('div'); e.className='wsv-toast'; e.textContent=t; root.appendChild(e); setTimeout(function(){e.remove();},2200); }
  function stageW(){ return stage.clientWidth || 900; }
  function computeScale(){
    if(opts.mini) return Math.min(1, (stageW()-8)/794);
    var w = stageW()-48, h = stage.clientHeight-48;
    var base = V.fit==='height' ? h/1123 : (V.two && V.mode!=='scroll' ? (w-30)/(2*794) : w/794);
    if(V.mode!=='present' && V.fit==='width') base = Math.min(base, V.two?base:1.15);
    return Math.max(0.2, base*V.zoom);
  }
  function itemsFor(){ return data.items; }
  function render(keepScroll){
    var st = stage.scrollTop/(stage.scrollHeight||1);
    var o = {teacher:T, mini:opts.mini, mediaFail:data.mediaFail && !V.retried, retried:V.retried, pinned:V.store.pins, cur:V.cur};
    FILL = opts.fill || null;
    try {
      var pages = WSV.layoutPages(root, data, o, opts.noCompact);
      var target = data.meta.pagesTarget;
    } finally { FILL = null; }
    V.pages = pages; V.s = computeScale();
    pagesEl.innerHTML = pages.map(function(p, i){
      return '<div class="wsv-pw" data-page="'+i+'" style="width:'+Math.round(794*V.s)+'px;height:'+Math.round((p.tall?Math.max(1123,p.h+150):1123)*V.s)+'px"><div class="wsv-page'+(p.tall?' tall':'')+'" style="transform:scale('+V.s+')'+(p.tall?';height:'+Math.max(1123,p.h+150)+'px':'')+'">'+WSV.pageHTML(data, p, i, pages.length, o)+'<canvas class="wsv-ink" width="794" height="'+(p.tall?Math.max(1123,p.h+150):1123)+'"'+(p.tall?' style="height:'+Math.max(1123,p.h+150)+'px"':'')+'></canvas></div></div>';
    }).join('');
    root.classList.toggle('two', V.two && V.mode!=='scroll');
    root.classList.toggle('mode-scroll', V.mode==='scroll');
    if(root.classList.contains('show-ans-all')) pagesEl.classList.add('show-ans');
    applyPresentVisibility();
    redrawAll(); fillGoto(); syncBar();
    if(opts.onPages) opts.onPages({pages:pages.length, target:target});
    if(keepScroll) stage.scrollTop = st*stage.scrollHeight;
  }
  function applyPresentVisibility(){
    var pws = pagesEl.querySelectorAll('.wsv-pw');
    pws.forEach(function(el,i){ var show = V.mode!=='present' || (V.two ? Math.floor(i/2)===Math.floor(V.pageIdx/2) : i===V.pageIdx); el.classList.toggle('hide', !show); });
  }
  function fillGoto(){
    var sel = root.querySelector('[data-act="goto"]'); if(!sel) return;
    var pins = V.store.pins||[]; var h = '<option value="">Đi tới…</option>';
    data.items.filter(function(it){return pins.indexOf(it.id)>=0;}).forEach(function(it){ h+='<option value="ex:'+esc(it.id)+'">★ Bài '+(data.items.indexOf(it)+1)+': '+esc(it.title)+'</option>'; });
    V.pages.forEach(function(p,i){ h+='<option value="pg:'+i+'">Trang '+(i+1)+'</option>'; });
    data.items.forEach(function(it,i){ if(pins.indexOf(it.id)<0) h+='<option value="ex:'+esc(it.id)+'">Bài '+(i+1)+': '+esc(it.title)+'</option>'; });
    sel.innerHTML = h;
  }
  function syncBar(){
    var b = root.querySelector('.wsv-bar'); if(!b) return;
    var nInk = 0; Object.keys(V.store.strokes||{}).forEach(function(k){ nInk += V.store.strokes[k].length; }); root.classList.toggle('has-ink', nInk>0);
    var on = function(a,v){ var e=b.querySelector('[data-act="'+a+'"]'); if(e) e.classList.toggle('on', !!v); };
    on('mode-page', V.mode==='page'); on('mode-scroll', V.mode==='scroll'); on('present', V.mode==='present'); on('two', V.two);
    on('cursor', V.tool==='cursor'); on('pen', V.tool==='pen'); on('eraser', V.tool==='eraser'); on('play', V.play); on('fitw', V.fit==='width'); on('fith', V.fit==='height');
    on('allans', pagesEl.classList.contains('show-ans')); on('expl', pagesEl.classList.contains('show-expl')); on('inkvis', !V.inkHidden);
    b.querySelectorAll('[data-act="color"]').forEach(function(e){ e.classList.toggle('on', e.dataset.c===V.color); });
    var z = b.querySelector('[data-act="zreset"]'); if(z) z.textContent = Math.round(V.s*100)+'%';
  }
  function curPage(){
    var pws = pagesEl.querySelectorAll('.wsv-pw'); var top = stage.getBoundingClientRect().top; var best=0;
    pws.forEach(function(el,i){ if(el.getBoundingClientRect().top - top < stage.clientHeight*0.4) best=i; });
    return best;
  }
  function gotoPage(i){
    i = Math.max(0, Math.min(V.pages.length-1, i));
    if(V.mode==='present'){ V.pageIdx = V.two ? i - (i%2) : i; applyPresentVisibility(); stage.scrollTop=0; return; }
    var el = pagesEl.querySelector('[data-page="'+i+'"]'); if(el) stage.scrollTo({top:el.offsetTop-12, behavior:'smooth'});
  }
  function step(dir){ var c = V.mode==='present'?V.pageIdx:curPage(); gotoPage(c + dir*(V.two?2:1)); }
  function gotoEx(id){
    var el = pagesEl.querySelector('[data-ex="'+id+'"]'); if(!el) return;
    if(opts.mini){ var se=opts.scrollEl||stage; var r1=el.getBoundingClientRect(), r2=se.getBoundingClientRect(); var bar=se.querySelector('.prev-bar'); se.scrollTo({top:se.scrollTop+r1.top-r2.top-((bar?bar.offsetHeight:0)+34), behavior:'smooth'}); return; }
    if(V.mode==='present'){ var pi = +el.closest('.wsv-pw').dataset.page; gotoPage(pi); return; }
    var pw = el.closest('.wsv-pw'); var off = pw.offsetTop + el.offsetTop*V.s;
    stage.scrollTo({top:off-20, behavior:opts.mini?'auto':'smooth'});
  }
  V.gotoEx = gotoEx;

  /* ---------- ink ---------- */
  function canvases(){ return pagesEl.querySelectorAll('.wsv-ink'); }
  function drawStroke(ctx, s){
    ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle=s.c; ctx.lineWidth=s.w;
    if(s.t==='hl'){ ctx.globalAlpha=.35; ctx.lineWidth=s.w*4; }
    ctx.beginPath();
    if(s.t==='rect'){ var a=s.pts[0], b=s.pts[s.pts.length-1]; ctx.strokeRect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])); }
    else { s.pts.forEach(function(p,i){ if(i) ctx.lineTo(p[0],p[1]); else ctx.moveTo(p[0],p[1]); }); if(s.pts.length===1) ctx.lineTo(s.pts[0][0]+.1,s.pts[0][1]); ctx.stroke(); }
    ctx.restore();
  }
  function redraw(pi){
    var c = canvases()[pi]; if(!c) return; var ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    if(V.inkHidden) return;
    (V.store.strokes[pi]||[]).forEach(function(s){ drawStroke(ctx,s); });
    if(V.live && V.live.pi===pi) drawStroke(ctx, V.live.s);
  }
  function redrawAll(){ for(var i=0;i<V.pages.length;i++) redraw(i); }
  function pt(e, c){ var r=c.getBoundingClientRect(); return [ (e.clientX-r.left)/r.width*c.width, (e.clientY-r.top)/r.height*c.height ]; }
  var mods = {shift:false, ctrl:false};
  function inkMode(){
    var drawing = V.tool==='pen' || mods.shift || mods.ctrl;
    root.classList.toggle('inking', drawing && V.tool!=='eraser');
    root.classList.toggle('erasing', V.tool==='eraser');
  }
  pagesEl.addEventListener('pointerdown', function(e){
    var c = e.target.closest('.wsv-ink'); if(!c) return;
    var pi = +c.closest('.wsv-pw').dataset.page; c.setPointerCapture(e.pointerId); e.preventDefault();
    if(V.tool==='eraser'){ V.erasing={pi:pi}; eraseAt(pi, pt(e,c)); return; }
    var sh = e.shiftKey||mods.shift, ct = e.ctrlKey||e.metaKey||mods.ctrl;
    var t = sh&&ct ? 'rect' : sh ? 'line' : ct ? 'hl' : 'pen';
    var col = t==='hl' ? '#F2C200' : (t==='pen' ? V.color : '#E8483B');
    V.live = {pi:pi, s:{t:t, c:col, w:V.width, pts:[pt(e,c)]}, c:c};
  });
  pagesEl.addEventListener('pointermove', function(e){
    if(V.erasing){ var c0=canvases()[V.erasing.pi]; eraseAt(V.erasing.pi, pt(e,c0)); return; }
    if(!V.live) return; var p = pt(e, V.live.c); var s = V.live.s;
    if(s.t==='line'){ var a=s.pts[0]; var dx=Math.abs(p[0]-a[0]), dy=Math.abs(p[1]-a[1]); s.pts=[a, dx>=dy?[p[0],a[1]]:[a[0],p[1]]]; }
    else if(s.t==='rect'){ s.pts=[s.pts[0], p]; }
    else s.pts.push(p);
    redraw(V.live.pi);
  });
  var endInk = function(){
    if(V.erasing){ V.erasing=null; return; }
    if(!V.live) return; var L=V.live; V.live=null;
    (V.store.strokes[L.pi]=V.store.strokes[L.pi]||[]).push(L.s); V.undo.push({t:'add', pi:L.pi, s:L.s}); V.redo=[]; save(); redraw(L.pi); inkMode();
  };
  pagesEl.addEventListener('pointerup', endInk); pagesEl.addEventListener('pointercancel', endInk);
  function eraseAt(pi, p){
    var arr = V.store.strokes[pi]||[]; for(var i=arr.length-1;i>=0;i--){ var s=arr[i];
      var hit = s.pts.some(function(q,k){ if(s.t==='rect'){ var a=s.pts[0], b=s.pts[s.pts.length-1]; var x1=Math.min(a[0],b[0]),x2=Math.max(a[0],b[0]),y1=Math.min(a[1],b[1]),y2=Math.max(a[1],b[1]); return (Math.abs(p[0]-x1)<10||Math.abs(p[0]-x2)<10)&&p[1]>y1-10&&p[1]<y2+10 || (Math.abs(p[1]-y1)<10||Math.abs(p[1]-y2)<10)&&p[0]>x1-10&&p[0]<x2+10; }
        if(s.t==='line'&&k===1){ var a2=s.pts[0]; return distSeg(p,a2,q)<10; } return Math.hypot(q[0]-p[0],q[1]-p[1])<12; });
      if(hit){ arr.splice(i,1); V.undo.push({t:'erase', pi:pi, s:s, i:i}); V.redo=[]; save(); redraw(pi); } }
  }
  function distSeg(p,a,b){ var l2=(b[0]-a[0])*(b[0]-a[0])+(b[1]-a[1])*(b[1]-a[1]); if(!l2) return Math.hypot(p[0]-a[0],p[1]-a[1]); var t=Math.max(0,Math.min(1,((p[0]-a[0])*(b[0]-a[0])+(p[1]-a[1])*(b[1]-a[1]))/l2)); return Math.hypot(p[0]-(a[0]+t*(b[0]-a[0])), p[1]-(a[1]+t*(b[1]-a[1]))); }
  function undo(){ var a=V.undo.pop(); if(!a) return; if(a.t==='add'){ var arr=V.store.strokes[a.pi]; arr.splice(arr.lastIndexOf(a.s),1); } else if(a.t==='erase'){ (V.store.strokes[a.pi]=V.store.strokes[a.pi]||[]).splice(a.i,0,a.s); } else if(a.t==='clear'){ V.store.strokes=a.saved; } V.redo.push(a); save(); redrawAll(); }
  function redo(){ var a=V.redo.pop(); if(!a) return; if(a.t==='add'){ (V.store.strokes[a.pi]=V.store.strokes[a.pi]||[]).push(a.s); } else if(a.t==='erase'){ var arr=V.store.strokes[a.pi]; arr.splice(arr.indexOf(a.s),1); } else if(a.t==='clear'){ V.store.strokes={}; } V.undo.push(a); save(); redrawAll(); }
  function clearInk(){ V.undo.push({t:'clear', saved:JSON.parse(JSON.stringify(V.store.strokes))}); V.store.strokes={}; save(); redrawAll(); toast('Đã xóa nét vẽ. Bấm ↶ để hoàn tác.'); }

  /* ---------- answers ---------- */
  function toggleAll(){ pagesEl.classList.toggle('show-ans'); root.classList.toggle('show-ans-all', pagesEl.classList.contains('show-ans')); syncBar(); }
  function revealNext(back){
    var scope = root.querySelector('.wsv-focus .fpaper') || pagesEl;
    var qs = Array.prototype.slice.call(scope.querySelectorAll('.q')).filter(function(q){ var r=q.getBoundingClientRect(); return r.height && r.bottom>0 && r.top<window.innerHeight && !q.closest('.wsv-pw.hide'); });
    if(back){ var last = V.revealed.pop(); if(last) last.classList.remove('show-ans'); return; }
    var nx = qs.find(function(q){ return !q.classList.contains('show-ans'); }); if(nx){ nx.classList.add('show-ans'); V.revealed.push(nx); } else toast('Đã hiện hết đáp án trong phần đang xem.');
  }

  /* ---------- media ---------- */
  function findMedia(id){ for(var i=0;i<data.items.length;i++){ var m=(data.items[i].media||[]).find(function(x){return x.id===id;}); if(m) return m; } return null; }
  function lightbox(m){
    var ov = document.createElement('div'); ov.className='wsv-ov wsv-light'; var sc=1, tx=0, ty=0;
    ov.innerHTML = '<div class="lb-bar"><button data-z="1" aria-label="Phóng to">+</button><button data-z="-1" aria-label="Thu nhỏ">−</button><button data-c aria-label="Đóng">✕ Đóng</button></div><div class="box" role="img" aria-label="'+esc(m.alt)+'">'+WSV.svgImage(m)+'</div>';
    root.appendChild(ov); var box = ov.querySelector('.box');
    var ap = function(){ box.style.transform='translate('+tx+'px,'+ty+'px) scale('+sc+')'; };
    ov.addEventListener('click', function(e){ if(e.target.dataset.z){ sc=Math.max(.5,Math.min(4,sc+ +e.target.dataset.z*.25)); ap(); } else if(e.target.hasAttribute('data-c')||e.target===ov) close(); });
    var drag=null; box.addEventListener('pointerdown', function(e){ drag=[e.clientX-tx,e.clientY-ty]; box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', function(e){ if(drag){ tx=e.clientX-drag[0]; ty=e.clientY-drag[1]; ap(); } }); box.addEventListener('pointerup', function(){ drag=null; });
    ov.addEventListener('wheel', function(e){ e.preventDefault(); sc=Math.max(.5,Math.min(4,sc-e.deltaY*.002)); ap(); }, {passive:false});
    function close(){ ov.remove(); V.overlay=null; }
    V.overlay = {close:close};
  }
  var player = null;
  function playAudio(m){
    if(player) player.close();
    var lines = String(m.transcript||'').split(/\n+/).filter(Boolean); if(lines.length===1) lines = lines[0].split(/(?<=[.!?])\s+/);
    var durs = lines.map(function(l){ return Math.max(1.2, l.split(/\s+/).length/2.6); }); var total = durs.reduce(function(a,b){return a+b;},0);
    var el = document.createElement('div'); el.className='wsv-player'; el.setAttribute('role','region'); el.setAttribute('aria-label','Trình phát audio');
    var synth = window.speechSynthesis; var hasTTS = !!(synth && window.SpeechSynthesisUtterance);
    var st = {i:0, t:0, playing:false, rate:1, vol:.9, tick:null};
    el.innerHTML = '<div class="prow"><button data-a="pp" aria-label="Phát hoặc tạm dừng">▶</button><button data-a="re" aria-label="Phát lại">↺</button><input type="range" min="0" max="1000" value="0" data-a="seek" aria-label="Tua"><span data-a="tm">0:00</span>'+
      '<button data-a="r" data-v=".75">0.75×</button><button data-a="r" data-v="1" class="on">1×</button><button data-a="r" data-v="1.25">1.25×</button><input type="range" min="0" max="100" value="90" data-a="vol" style="width:60px;flex:none" aria-label="Âm lượng"><button data-a="x" aria-label="Đóng">✕</button></div>'+
      '<div class="tr">'+lines.map(function(l,i){ var sp=l.match(/^([A-Z][\w ]{0,10}):\s*/); return '<div data-l="'+i+'">'+(sp?'<b>'+esc(sp[1])+':</b> '+esc(l.slice(sp[0].length)):esc(l))+'</div>'; }).join('')+'</div>'+
      (hasTTS?'':'<div class="sim">Chế độ mô phỏng audio: trình duyệt không có giọng đọc, thanh tiến độ chạy theo thời lượng ước tính.</div>');
    root.appendChild(el);
    var voices = hasTTS ? synth.getVoices().filter(function(v){return /^en/i.test(v.lang);}) : [];
    var speakers = {}; var spk = function(l){ var s=(l.match(/^([A-Z][\w ]{0,10}):/)||[])[1]; if(!s) return 0; if(speakers[s]==null) speakers[s]=Object.keys(speakers).length; return speakers[s]; };
    function fmt(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
    function startAt(t){ var acc=0; for(var i=0;i<lines.length;i++){ if(acc+durs[i]>t){ st.i=i; st.t=acc; break; } acc+=durs[i]; if(i===lines.length-1){ st.i=lines.length; st.t=total; } } }
    function hl(){ el.querySelectorAll('.tr [data-l]').forEach(function(d){ d.classList.toggle('cur', +d.dataset.l===st.i); }); var c=el.querySelector('.tr .cur'); if(c) c.scrollIntoView({block:'nearest'}); }
    function speakLine(){
      if(st.i>=lines.length){ stop(); st.i=0; st.t=0; upd(); return; }
      hl(); var line = lines[st.i].replace(/^([A-Z][\w ]{0,10}):\s*/,''); var k = spk(lines[st.i]);
      if(hasTTS){ synth.cancel(); var u = new SpeechSynthesisUtterance(line); u.lang='en-GB'; u.rate=st.rate; u.volume=st.vol; u.pitch = k===1?1.35:(k===2?0.8:1);
        if(voices.length) u.voice = voices[k%voices.length]; u.onend = function(){ if(!st.playing) return; st.t += durs[st.i]; st.i++; speakLine(); }; synth.speak(u); }
      else { clearTimeout(st.sim); st.sim = setTimeout(function(){ if(!st.playing) return; st.t+=durs[st.i]; st.i++; speakLine(); }, durs[st.i]*1000/st.rate); }
    }
    var lineStart = 0;
    function upd(){ var cur = st.t; el.querySelector('[data-a="seek"]').value = Math.round(cur/total*1000); el.querySelector('[data-a="tm"]').textContent = fmt(cur)+' / '+fmt(total); el.querySelector('[data-a="pp"]').textContent = st.playing?'❚❚':'▶'; }
    function play(){ st.playing=true; speakLine(); upd(); }
    function stop(){ st.playing=false; if(hasTTS) synth.cancel(); clearTimeout(st.sim); upd(); }
    el.addEventListener('click', function(e){ var a=e.target.dataset.a; if(!a) return;
      if(a==='pp'){ st.playing?stop():play(); } else if(a==='re'){ stop(); st.i=0; st.t=0; play(); } else if(a==='x'){ close(); }
      else if(a==='r'){ st.rate=+e.target.dataset.v; el.querySelectorAll('[data-a="r"]').forEach(function(b){b.classList.toggle('on',b===e.target);}); if(st.playing){ stop(); play(); } } });
    el.querySelector('[data-a="seek"]').addEventListener('input', function(e){ var was=st.playing; stop(); startAt(+e.target.value/1000*total); upd(); hl(); if(was) play(); });
    el.querySelector('[data-a="vol"]').addEventListener('input', function(e){ st.vol = +e.target.value/100; });
    function close(){ stop(); el.remove(); player=null; }
    player = {close:close}; upd(); play();
  }
  function playVideo(m){
    var ov=document.createElement('div'); ov.className='wsv-ov wsv-video'; var t=0, playing=true, iv;
    ov.innerHTML='<div class="vbox"><div class="scr"></div><div class="vctl"><button data-v="pp" aria-label="Phát hoặc tạm dừng">❚❚</button><div class="pb"><span></span></div><span class="tm">0:00</span><button data-v="x" aria-label="Đóng">✕</button></div></div>';
    root.appendChild(ov); var scr=ov.querySelector('.scr'), pb=ov.querySelector('.pb span'), tm=ov.querySelector('.tm');
    if(data.mediaFail && !V.vretried){ scr.innerHTML='<div style="color:#fff;display:grid;place-items:center;height:100%;gap:8px"><div>Không tải được video.</div><button class="ovbtn" data-v="retry">Thử lại</button></div>'; playing=false; }
    function draw(){ scr.innerHTML = WSV.videoScene(m, t/4)+'<div class="cap">'+esc(m.caption||'')+'</div>'; pb.style.width=(t/m.duration*100)+'%'; tm.textContent='0:'+String(Math.floor(t)).padStart(2,'0')+' / 0:'+m.duration; }
    if(playing) draw();
    iv = setInterval(function(){ if(!playing) return; t+=.25; if(t>=m.duration){ t=m.duration; playing=false; ov.querySelector('[data-v="pp"]').textContent='▶'; } draw(); }, 250);
    ov.addEventListener('click', function(e){ var v=e.target.dataset.v; if(v==='x'||e.target===ov){ clearInterval(iv); ov.remove(); V.overlay=null; } else if(v==='pp'){ if(t>=m.duration) t=0; playing=!playing; e.target.textContent=playing?'❚❚':'▶'; } else if(v==='retry'){ V.vretried=true; playing=true; draw(); } });
    V.overlay = {close:function(){ clearInterval(iv); ov.remove(); V.overlay=null; }};
  }

  /* ---------- focus one exercise ---------- */
  function focusEx(id){
    var idx = data.items.findIndex(function(it){return it.id===id;}); if(idx<0) return;
    var it = data.items[idx]; var o = {teacher:T, pinned:V.store.pins};
    var b = WSV.blockUnits(it, idx, o);
    var ov = document.createElement('div'); ov.className='wsv-ov wsv-focus'; var fit='width';
    ov.innerHTML = '<div class="fbar"><button class="wb" data-f="prev">◀ Bài trước</button><button class="wb" data-f="next">Bài sau ▶</button><span style="flex:1;font-weight:600;padding-left:8px">Bài '+(idx+1)+' / '+data.items.length+'</span>'+(T?'<button class="wb" data-f="ans">✓ Đáp án bài</button>':'')+'<button class="wb sm" data-f="fw" title="Vừa ngang">↔</button><button class="wb sm" data-f="fh" title="Vừa cao">↕</button><button class="wb" data-f="close">Về tổng (Esc)</button></div>'+
      '<div class="fbody"><div class="fpaper'+(pagesEl.classList.contains('show-ans')?' show-ans':'')+'"><section class="wsx'+(b.L==='L4'?' lay4':'')+'" data-ex="'+esc(it.id)+'">'+b.units.map(function(u){return u.html;}).join('')+'</section></div></div>';
    root.appendChild(ov);
    var paper = ov.querySelector('.fpaper'), body = ov.querySelector('.fbody');
    function sc(){ var w=body.clientWidth-48, h=body.clientHeight-48; var s = fit==='width' ? w/794 : Math.min(w/794, h/paper.offsetHeight); paper.style.transform='scale('+s+')'; paper.style.marginBottom = (paper.offsetHeight*(s-1))+'px'; paper.style.marginLeft = Math.max(0,(w-794*s)/2)+'px'; }
    sc();
    ov.addEventListener('click', function(e){ var f=e.target.dataset.f;
      if(f==='close'){ close(); } else if(f==='prev'||f==='next'){ var j=idx+(f==='next'?1:-1); if(j>=0&&j<data.items.length){ close(); focusEx(data.items[j].id); } }
      else if(f==='ans'){ paper.classList.toggle('show-ans'); } else if(f==='fw'){ fit='width'; sc(); } else if(f==='fh'){ fit='height'; sc(); }
      else handleAct(e); });
    function close(){ ov.remove(); V.overlay=null; }
    V.overlay = {close:close, focus:true};
  }

  /* ---------- presentation tools ---------- */
  function toolsMenu(anchor){
    closePop();
    var p = document.createElement('div'); p.className='wsv-pop'; var r=anchor.getBoundingClientRect(), rr=root.getBoundingClientRect();
    p.style.left = Math.min(r.left-rr.left, rr.width-260)+'px'; p.style.top=(r.bottom-rr.top+4)+'px';
    var items = [['autohide','Thanh công cụ tự ẩn','H'],['cover','Che câu','C'],['curtain','Rèm kéo','R'],['black','Tối màn','B'],['white','Trắng màn','W'],['spot','Đèn rọi','L'],['reveal','Hiện đáp án lần lượt','Space'],['timer','Đồng hồ đếm giờ','T'],['board','Bảng trắng','K']];
    p.innerHTML = '<div class="ph">Công cụ trình bày</div>'+items.filter(function(i){return T||i[0]!=='reveal';}).map(function(i){ return '<button class="mi'+(isOn(i[0])?' on':'')+'" data-tool="'+i[0]+'">'+i[1]+'<span class="k">'+i[2]+'</span></button>'; }).join('');
    root.appendChild(p); V.pop = p;
    p.addEventListener('click', function(e){ var b=e.target.closest('[data-tool]'); if(!b) return; closePop(); tool(b.dataset.tool); });
  }
  function isOn(k){ return k==='autohide'?root.classList.contains('autohide'):k==='cover'?root.classList.contains('cover'):k==='curtain'?!!V.curtain:k==='spot'?!!V.spot:k==='timer'?!!V.timerEl:false; }
  function closePop(){ if(V.pop){ V.pop.remove(); V.pop=null; } }
  function tool(k){
    if(k==='autohide'){ root.classList.toggle('autohide'); }
    else if(k==='cover'){ root.classList.toggle('cover'); if(!root.classList.contains('cover')) root.querySelectorAll('.peek').forEach(function(e){e.classList.remove('peek');}); }
    else if(k==='curtain'){ if(V.curtain){ V.curtain.remove(); V.curtain=null; } else { var c=document.createElement('div'); c.className='wsv-curtain'; c.style.height='40%'; c.innerHTML='<div class="grip"><span>⇕ Kéo rèm</span></div>'; root.appendChild(c); V.curtain=c;
        var g=c.querySelector('.grip'); g.addEventListener('pointerdown', function(e){ g.setPointerCapture(e.pointerId); var top=root.getBoundingClientRect().top; var mv=function(ev){ c.style.height=Math.max(0,ev.clientY-top)+'px'; }; g.addEventListener('pointermove',mv); g.addEventListener('pointerup', function(){ g.removeEventListener('pointermove',mv); }, {once:true}); }); } }
    else if(k==='black'||k==='white'){ var b=document.createElement('div'); b.className='wsv-blank'; b.style.background=k==='black'?'#000':'#fff'; root.appendChild(b); V.blank=b; b.addEventListener('click', function(){ b.remove(); V.blank=null; }); }
    else if(k==='spot'){ if(V.spot){ V.spot.remove(); V.spot=null; } else { var s=document.createElement('div'); s.className='wsv-spot'; V.spot=s; V.spotR=140; root.appendChild(s); moveSpot(root.clientWidth/2, root.clientHeight/2); } }
    else if(k==='reveal'){ revealNext(); }
    else if(k==='timer'){ timerWidget(); }
    else if(k==='board'){ whiteboard(); }
  }
  function moveSpot(x,y){ if(!V.spot) return; V.spot.style.background='radial-gradient(circle at '+x+'px '+y+'px, transparent '+V.spotR+'px, rgba(0,0,0,.78) '+(V.spotR+2)+'px)'; V.spotXY=[x,y]; }
  root.addEventListener('mousemove', function(e){ var r=root.getBoundingClientRect(); if(V.spot) moveSpot(e.clientX-r.left, e.clientY-r.top); if(root.classList.contains('autohide')){ root.classList.toggle('bar-show', e.clientY-r.top < 16 || (root.classList.contains('bar-show') && e.clientY-r.top < 70)); } });
  root.addEventListener('wheel', function(e){ if(V.spot && e.altKey){ e.preventDefault(); V.spotR=Math.max(50,Math.min(400,V.spotR-e.deltaY*.3)); moveSpot(V.spotXY[0],V.spotXY[1]); } }, {passive:false});
  function timerWidget(){
    if(V.timerEl){ clearInterval(V.timerIv); V.timerEl.remove(); V.timerEl=null; return; }
    var el=document.createElement('div'); el.className='wsv-timer'; var left=180, run=false;
    el.innerHTML='<div class="clk">3:00</div><div class="row">'+[1,3,5,10].map(function(m){return '<button class="wb sm" data-m="'+m+'">'+m+'′</button>';}).join('')+'<button class="wb sm" data-d="-60">−1′</button><button class="wb sm" data-d="60">+1′</button></div><div class="row"><button class="wb" data-t="go">▶ Bắt đầu</button><button class="wb" data-t="rs">↺</button><button class="wb sm" data-t="x">✕</button></div>';
    root.appendChild(el); V.timerEl=el; var clk=el.querySelector('.clk');
    var show=function(){ clk.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0'); el.querySelector('[data-t="go"]').textContent = run?'❚❚ Tạm dừng':'▶ Bắt đầu'; };
    V.timerIv = setInterval(function(){ if(!run) return; left--; if(left<=0){ left=0; run=false; el.classList.add('ring'); WSV.fbSound('bell',.8); setTimeout(function(){WSV.fbSound('bell',.8);},400); } show(); },1000);
    el.addEventListener('click', function(e){ var b=e.target; if(b.dataset.m){ left=+b.dataset.m*60; el.classList.remove('ring'); } else if(b.dataset.d){ left=Math.max(0,left+ +b.dataset.d); } else if(b.dataset.t==='go'){ run=!run; el.classList.remove('ring'); } else if(b.dataset.t==='rs'){ run=false; left=180; el.classList.remove('ring'); } else if(b.dataset.t==='x'){ clearInterval(V.timerIv); el.remove(); V.timerEl=null; return; } show(); });
    show();
  }
  /* full whiteboard */
  var boardStrokes = [];
  function whiteboard(){
    var ov=document.createElement('div'); ov.className='wsv-ov wsv-board'; ov.innerHTML='<canvas></canvas><div class="bb"><span style="align-self:center;font-size:13px;color:#7A8496">Bảng trắng · Bút (khóa)</span><button class="ovbtn" data-b="undo" style="border:1px solid #DCE1E9">↶</button><button class="ovbtn" data-b="clear" style="border:1px solid #DCE1E9">Xóa</button><button class="ovbtn" data-b="x" style="border:1px solid #DCE1E9">Về phiếu (Esc)</button></div>';
    root.appendChild(ov); var c=ov.querySelector('canvas'); c.width=ov.clientWidth; c.height=ov.clientHeight; var ctx=c.getContext('2d'); var live=null;
    var rd=function(){ ctx.clearRect(0,0,c.width,c.height); boardStrokes.concat(live?[live]:[]).forEach(function(s){ drawStroke(ctx,s); }); };
    rd();
    c.addEventListener('pointerdown', function(e){ c.setPointerCapture(e.pointerId); live={t:'pen', c:V.color, w:V.width, pts:[[e.offsetX,e.offsetY]]}; });
    c.addEventListener('pointermove', function(e){ if(live){ live.pts.push([e.offsetX,e.offsetY]); rd(); } });
    c.addEventListener('pointerup', function(){ if(live){ boardStrokes.push(live); live=null; rd(); } });
    ov.addEventListener('click', function(e){ var b=e.target.dataset.b; if(b==='x') close(); else if(b==='undo'){ boardStrokes.pop(); rd(); } else if(b==='clear'){ boardStrokes=[]; rd(); } });
    function close(){ ov.remove(); V.overlay=null; }
    V.overlay = {close:close};
  }
  /* quick floating board (D-107) */
  var qbState = {strokes:[], redo:[], tool:'pen', color:'#1A2233', size:3, bg:'plain'};
  function quickBoard(x, y){
    if(V.qb){ V.qb.style.display='flex'; return; }
    var el=document.createElement('div'); el.className='wsv-qb'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Bảng nhanh');
    var rr=root.getBoundingClientRect(); el.style.left=Math.max(8,Math.min((x||rr.width/2-280), rr.width-570))+'px'; el.style.top=Math.max(50,Math.min((y||120), rr.height-420))+'px'; el.style.width='560px'; el.style.height='400px';
    var tools=[['pen','✎','Bút'],['eraser','⌫','Tẩy nét'],['text','T','Text'],['line','╱','Đường thẳng'],['arrow','➝','Mũi tên'],['rect','▭','Khung'],['ellipse','◯','Elip']];
    el.innerHTML='<div class="qbh">'+tools.map(function(t){return '<button class="wb" data-q="tool" data-v="'+t[0]+'" title="'+t[2]+'" aria-label="'+t[2]+'">'+t[1]+'</button>';}).join('')+
      '<span style="width:6px"></span>'+['#1A2233','#E8483B','#2D5BD0','#1E8A4C','#F2B705'].map(function(c){return '<span class="sw" data-q="color" data-v="'+c+'" style="background:'+c+'" role="button" aria-label="Màu"></span>';}).join('')+
      '<select class="wsv-sel" data-q="size" style="height:28px;width:58px"><option value="2">Nhỏ</option><option value="3" selected>Vừa</option><option value="6">Lớn</option></select><select class="wsv-sel" data-q="bg" style="height:28px;width:78px"><option value="plain">Trắng</option><option value="grid">Kẻ ô</option><option value="lines">Kẻ dòng</option></select>'+
      '<button class="wb" data-q="undo" title="Hoàn tác" aria-label="Hoàn tác">↶</button><button class="wb" data-q="redo" title="Làm lại" aria-label="Làm lại">↷</button><button class="wb" data-q="clear" title="Xóa hết" aria-label="Xóa hết">🗑</button><button class="wb" data-q="png" title="Lưu PNG" aria-label="Lưu PNG">⤓</button><button class="wb" data-q="x" title="Đóng (Esc)" aria-label="Đóng">✕</button></div><div class="qbc"><canvas></canvas></div>';
    root.appendChild(el); V.qb=el;
    var cvw=el.querySelector('.qbc'), c=el.querySelector('canvas'), ctx=c.getContext('2d'); var live=null;
    var size=function(){ c.width=cvw.clientWidth; c.height=cvw.clientHeight; rd(); };
    function drawShape(s){
      if(s.t==='text'){ ctx.save(); ctx.fillStyle=s.c; ctx.font=(12+s.w*4)+'px system-ui,sans-serif'; ctx.fillText(s.text, s.pts[0][0], s.pts[0][1]); ctx.restore(); return; }
      if(s.t==='pen') return drawStroke(ctx,s);
      var a=s.pts[0], b=s.pts[s.pts.length-1]; ctx.save(); ctx.strokeStyle=s.c; ctx.lineWidth=s.w; ctx.lineCap='round'; ctx.beginPath();
      if(s.t==='line'||s.t==='arrow'){ ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke(); if(s.t==='arrow'){ var ang=Math.atan2(b[1]-a[1],b[0]-a[0]); ctx.beginPath(); ctx.moveTo(b[0],b[1]); ctx.lineTo(b[0]-14*Math.cos(ang-.45),b[1]-14*Math.sin(ang-.45)); ctx.moveTo(b[0],b[1]); ctx.lineTo(b[0]-14*Math.cos(ang+.45),b[1]-14*Math.sin(ang+.45)); ctx.stroke(); } }
      else if(s.t==='rect'){ ctx.strokeRect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])); }
      else if(s.t==='ellipse'){ ctx.ellipse((a[0]+b[0])/2,(a[1]+b[1])/2,Math.abs(b[0]-a[0])/2,Math.abs(b[1]-a[1])/2,0,0,Math.PI*2); ctx.stroke(); }
      ctx.restore();
    }
    function rd(){ ctx.clearRect(0,0,c.width,c.height); qbState.strokes.forEach(function(s){ if(s.t==='clear') return; drawShape(s); }); if(live) drawShape(live); }
    function visible(){ var out=[]; qbState.strokes.forEach(function(s){ if(s.t==='clear') out=[]; else out.push(s); }); return out; }
    rd = function(){ ctx.clearRect(0,0,c.width,c.height); visible().forEach(drawShape); if(live) drawShape(live); };
    function sync(){ el.querySelectorAll('[data-q="tool"]').forEach(function(b){ b.classList.toggle('on', b.dataset.v===qbState.tool); }); el.querySelectorAll('.sw').forEach(function(b){ b.classList.toggle('on', b.dataset.v===qbState.color); }); cvw.className='qbc '+(qbState.bg==='plain'?'':qbState.bg); }
    sync(); setTimeout(size,0); new (window.ResizeObserver||function(){this.observe=function(){};})(size).observe(cvw);
    var pos=function(e){ var r=c.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; };
    c.addEventListener('pointerdown', function(e){ var p=pos(e);
      if(qbState.tool==='text'){ var inp=document.createElement('input'); inp.className='txt-inp'; inp.style.left=p[0]+'px'; inp.style.top=(p[1]-14)+'px'; inp.placeholder='Gõ chữ, Enter'; cvw.appendChild(inp); setTimeout(function(){inp.focus();},0);
        var done=false; var fin=function(){ if(done) return; done=true; if(inp.value.trim()){ qbState.strokes.push({t:'text', c:qbState.color, w:qbState.size, text:inp.value, pts:[[p[0],p[1]+4]]}); qbState.redo=[]; } inp.remove(); rd(); };
        inp.addEventListener('keydown', function(ev){ ev.stopPropagation(); if(ev.key==='Enter') fin(); if(ev.key==='Escape'){ done=true; inp.remove(); } }); inp.addEventListener('blur', fin); return; }
      c.setPointerCapture(e.pointerId);
      if(qbState.tool==='eraser'){ live=null; eraseQ(p); c._erasing=true; return; }
      live={t:qbState.tool, c:qbState.color, w:qbState.size, pts:[p]}; });
    c.addEventListener('pointermove', function(e){ var p=pos(e); if(c._erasing){ eraseQ(p); return; } if(!live) return;
      if(live.t==='pen') live.pts.push(p); else { if(e.shiftKey && (live.t==='rect'||live.t==='ellipse')){ var a=live.pts[0]; var d=Math.max(Math.abs(p[0]-a[0]),Math.abs(p[1]-a[1])); p=[a[0]+Math.sign(p[0]-a[0])*d, a[1]+Math.sign(p[1]-a[1])*d]; } live.pts=[live.pts[0],p]; } rd(); });
    c.addEventListener('pointerup', function(){ c._erasing=false; if(live){ qbState.strokes.push(live); qbState.redo=[]; live=null; rd(); } });
    function eraseQ(p){ var vis=visible(); for(var i=vis.length-1;i>=0;i--){ var s=vis[i]; if(s.pts.some(function(q){return Math.hypot(q[0]-p[0],q[1]-p[1])<12;})){ qbState.strokes.splice(qbState.strokes.indexOf(s),1); qbState.redo.push({erased:s}); rd(); return; } } }
    el.addEventListener('change', function(e){ var q=e.target.dataset.q; if(q==='size') qbState.size=+e.target.value; if(q==='bg'){ qbState.bg=e.target.value; sync(); } });
    el.addEventListener('click', function(e){ var b=e.target.closest('[data-q]'); if(!b) return; var q=b.dataset.q;
      if(q==='tool'){ qbState.tool=b.dataset.v; sync(); } else if(q==='color'){ qbState.color=b.dataset.v; sync(); }
      else if(q==='undo'){ var s=qbState.strokes.pop(); if(s) qbState.redo.push(s); rd(); } else if(q==='redo'){ var r=qbState.redo.pop(); if(r){ if(r.erased) qbState.strokes.push(r.erased); else qbState.strokes.push(r); } rd(); }
      else if(q==='clear'){ qbState.strokes.push({t:'clear', pts:[]}); rd(); } else if(q==='png'){ var tmp=document.createElement('canvas'); tmp.width=c.width; tmp.height=c.height; var tc=tmp.getContext('2d'); tc.fillStyle='#fff'; tc.fillRect(0,0,tmp.width,tmp.height); tc.drawImage(c,0,0); var a=document.createElement('a'); a.href=tmp.toDataURL('image/png'); a.download='bang-nhanh.png'; a.click(); }
      else if(q==='x'){ el.style.display='none'; } });
    var hd=el.querySelector('.qbh'); hd.addEventListener('pointerdown', function(e){ if(e.target.closest('button,select,.sw')) return; hd.setPointerCapture(e.pointerId); var sx=e.clientX-el.offsetLeft, sy=e.clientY-el.offsetTop;
      var mv=function(ev){ el.style.left=(ev.clientX-sx)+'px'; el.style.top=(ev.clientY-sy)+'px'; }; hd.addEventListener('pointermove',mv); hd.addEventListener('pointerup',function(){hd.removeEventListener('pointermove',mv);},{once:true}); });
  }
  root.addEventListener('dblclick', function(e){
    if(opts.mini) return; if(e.target.closest('button,input,select,textarea,.opt,.tfbox,.ord,.wsv-qb,.wsv-bar,.mimg,.q.ml')) return;
    var r=root.getBoundingClientRect(); quickBoard(e.clientX-r.left-280, e.clientY-r.top-40);
  });

  /* ---------- feedback ---------- */
  function fbPop(ok, small){
    var cfg = data.qfb || {correct:{img:{star:1,check:1},snd:{chime:1}}, wrong:{img:{arrow:1},snd:{soft:1}}, volume:.6, showText:true};
    var grp = ok?cfg.correct:cfg.wrong; var imgs=Object.keys(grp.img).filter(function(k){return grp.img[k];}), snds=Object.keys(grp.snd).filter(function(k){return grp.snd[k];});
    var lastKey = ok?'_lc':'_lw'; var pick=function(arr,tag){ if(!arr.length) return null; var c=arr.filter(function(x){return x!==V[lastKey+tag];}); var r=(c.length?c:arr)[Math.floor(Math.random()*(c.length?c:arr).length)]; V[lastKey+tag]=r; return r; };
    var im = pick(imgs,'i'), sn = pick(snds,'s'); var tx = WSV.FB_TEXT[ok?'correct':'wrong']; var t = tx[Math.floor(Math.random()*tx.length)];
    if(sn && !V.mute) WSV.fbSound(sn, cfg.volume);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    var el=document.createElement('div'); el.className='fb-pop'; el.innerHTML=(im?(small?FB_IMG[im].replace('<svg','<svg style="width:110px;height:110px"'):FB_IMG[im]):'')+(cfg.showText?'<div class="fbt">'+t+'</div>':''); if(reduce) el.style.animation='none';
    root.appendChild(el); setTimeout(function(){ el.remove(); }, small?900:1200);
  }
  WSV._fbPop = fbPop;

  /* ---------- check answers (used by quiz + play) ---------- */
  function norm(s){ return String(s||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9' ]/g,'').replace(/\s+/g,' ').trim(); }
  function findQ(qid){ for(var i=0;i<data.items.length;i++){ var q=(data.items[i].questions||[]).find(function(x){return x.id===qid;}); if(q) return {it:data.items[i], q:q}; } return null; }
  function check(it, q, val){
    switch(it.type){
      case 'mcq': return q.options[val] && q.options[val].id===q.correctId;
      case 'cloze_mcq': return +val===q.correctIdx;
      case 'tfng': return val===q.answer;
      case 'fill_blank': case 'word_form': return (q.accepted||[]).some(function(a){return norm(a)===norm(val);});
      case 'matching': return it.rightList[val]===q.right;
      case 'ordering': return norm(val)===norm(q.answerText);
    }
    return null;
  }

  /* ---------- play on sheet (D-105) ---------- */
  var playStat = {done:{}, ok:0, n:0};
  function setPlay(on){
    V.play = on; root.classList.toggle('play', on); playStat={done:{},ok:0,n:0};
    if(!on){ render(true); var c=root.querySelector('.wsv-bar .count'); if(c) c.remove(); }
    else { pagesEl.classList.remove('show-ans'); root.classList.remove('show-ans-all'); counter(); toast('Làm trên phiếu: bấm chọn đáp án, bấm ô trống để điền. Tắt chế độ để xóa sạch.'); }
    syncBar();
  }
  function counter(){ var b=root.querySelector('.wsv-bar [data-act="play"]'); if(!b) return; var c=root.querySelector('.wsv-bar .count'); if(!c){ c=document.createElement('span'); c.className='count'; b.after(c); } c.textContent='Đúng '+playStat.ok+'/'+playStat.n; }
  function mark(qEl, ok, qid){ qEl.classList.remove('res-ok','res-no'); void qEl.offsetWidth; qEl.classList.add(ok?'res-ok':'res-no'); if(!playStat.done[qid]){ playStat.done[qid]=1; playStat.n++; if(ok) playStat.ok++; } counter(); fbPop(ok,true); }
  function playClick(e){
    var qEl = e.target.closest('.q'); if(!qEl) return false; var f=findQ(qEl.dataset.q); if(!f) return false; var it=f.it, q=f.q;
    var opt = e.target.closest('.opt'); if(opt && (it.type==='mcq'||it.type==='cloze_mcq')){ qEl.querySelectorAll('.opt').forEach(function(o){o.classList.remove('picked');}); opt.classList.add('picked'); mark(qEl, check(it,q,+opt.dataset.k), q.id); return true; }
    var tf = e.target.closest('.tfbox span'); if(tf){ qEl.querySelectorAll('.tfbox span').forEach(function(o){o.classList.remove('picked');}); tf.classList.add('picked'); tf.style.outline='2px solid #2D5BD0'; mark(qEl, check(it,q,tf.dataset.k), q.id); return true; }
    var w = e.target.closest('.ord span'); if(w && it.type==='ordering'){ if(w.classList.contains('used')) return true; w.classList.add('used'); var b=qEl.querySelector('.ord-built'); if(!b){ b=document.createElement('div'); b.className='ord-built'; qEl.querySelector('.ord').after(b); } b.textContent=(b.textContent+' '+w.textContent).trim();
      if(qEl.querySelectorAll('.ord span:not(.used)').length===0){ mark(qEl, check(it,q,b.textContent+(q.punct||'')), q.id); setTimeout(function(){ qEl.querySelectorAll('.ord span').forEach(function(s){s.classList.remove('used');}); },1200); setTimeout(function(){ b.textContent=''; },1200); } return true; }
    if((it.type==='fill_blank'||it.type==='word_form') && e.target.closest('.blank')){ var bl=e.target.closest('.blank'); if(bl.querySelector('input')) return true; bl.innerHTML='<input class="play-inp" aria-label="Điền đáp án">'; var inp=bl.querySelector('input'); inp.focus();
      inp.addEventListener('keydown', function(ev){ ev.stopPropagation(); if(ev.key==='Enter') mark(qEl, check(it,q,inp.value), q.id); }); return true; }
    if(it.type==='matching' && !e.target.closest('select')){ if(qEl.querySelector('select')) return true; var s=document.createElement('select'); s.className='play-sel'; s.setAttribute('aria-label','Chọn chữ cái'); s.innerHTML='<option value="">?</option>'+it.rightList.map(function(r,k){return '<option value="'+k+'">'+LET[k]+'</option>';}).join(''); qEl.querySelector('.qb').appendChild(s); s.focus(); s.addEventListener('change', function(){ if(s.value!=='') mark(qEl, check(it,q,+s.value), q.id); }); return true; }
    return false;
  }

  /* ---------- làm bài trên phiếu cho Làm bài trên lớp (D-131) ---------- */
  function fillSet(qid, v){ var F=opts.fill; F.values[qid]=v; if(F.onChange) F.onChange(qid, v); }
  function fillClick(e){
    var F = opts.fill; if(!F) return false;
    var qEl = e.target.closest('.q.fq'); if(!qEl) return false;
    var hit = e.target.closest('.opt,.tfbox span,.ord span,.ord-clr');
    if(!hit) return false;
    if(F.locked) return true;
    var f = findQ(qEl.dataset.q); if(!f) return false; var it=f.it, q=f.q;
    if(hit.matches('.opt,.tfbox span')){
      var k = hit.dataset.k, was = hit.classList.contains('picked');
      qEl.querySelectorAll('.opt,.tfbox span').forEach(function(o){ o.classList.remove('picked'); });
      if(!was) hit.classList.add('picked');
      fillSet(q.id, was ? '' : String(k)); return true;
    }
    var txt = qEl.querySelector('.ord-txt');
    if(hit.matches('.ord-clr')){ fillSet(q.id, ''); qEl.querySelectorAll('.ord span').forEach(function(o){ o.classList.remove('used'); }); txt.textContent=''; hit.remove(); return true; }
    if(hit.classList.contains('used')) return true;
    var words = ordWords(F.values[q.id]); words.push(hit.textContent); hit.classList.add('used');
    var v = words.join(' ') + (words.length===(q.words||[]).length ? (q.punct||'.') : '');
    fillSet(q.id, v); txt.textContent = v;
    if(!qEl.querySelector('.ord-clr')){ var b=document.createElement('button'); b.className='ord-clr'; b.dataset.ordclr='1'; b.title='Xếp lại từ đầu'; b.setAttribute('aria-label','Xếp lại từ đầu'); b.textContent='↺'; txt.after(b); }
    return true;
  }
  root.addEventListener('input', function(e){ if(opts.fill && !opts.fill.locked && e.target.matches('.fill-inp')) fillSet(e.target.dataset.fq, e.target.value); });
  root.addEventListener('change', function(e){ if(opts.fill && !opts.fill.locked && e.target.matches('.fill-sel')) fillSet(e.target.dataset.fq, e.target.value); });

  /* ---------- quiz (D-101, D-103) ---------- */
  function quiz(){
    var ov=document.createElement('div'); ov.className='wsv-ov wsv-quiz'; root.appendChild(ov); V.overlay={close:function(){ clearInterval(qz.iv); ov.remove(); V.overlay=null; }};
    var qz={opt:{shuffle:false, retry:true, showAns:true, timer:0}, list:[], i:0, res:[], tries:0, iv:null};
    data.items.forEach(function(it,ei){ (it.questions||[]).forEach(function(q,qi){ qz.list.push({it:it, q:q, ei:ei, qi:qi}); }); });
    function start(){
      ov.innerHTML='<div class="qzh"><b>🎯 Quiz · '+esc(data.meta.title)+'</b><span style="flex:1"></span><button class="wb" data-z="x">✕ Thoát</button></div><div class="qzb"><div class="qzcard" style="font-family:system-ui,sans-serif"><h2 style="margin:0 0 6px">Tùy chọn Quiz</h2><p style="color:#7A8496;margin:0 0 16px">'+qz.list.length+' câu từ '+data.items.length+' bài. Kết quả không được lưu.</p>'+
        '<label style="display:flex;gap:8px;margin:8px 0"><input type="checkbox" data-o="shuffle"> Xáo thứ tự câu</label><label style="display:flex;gap:8px;margin:8px 0"><input type="checkbox" data-o="retry" checked> Cho thử lại khi sai</label><label style="display:flex;gap:8px;margin:8px 0"><input type="checkbox" data-o="showAns" checked> Hiện đáp án đúng sau khi sai</label>'+
        '<label style="display:flex;gap:8px;margin:8px 0;align-items:center">Hẹn giờ mỗi câu <select data-o="timer" class="wsv-sel"><option value="0">Không</option><option value="15">15 giây</option><option value="30">30 giây</option><option value="60">60 giây</option></select></label>'+
        '<label style="display:flex;gap:8px;margin:8px 0"><input type="checkbox" data-o="mute"> Tắt tiếng</label></div></div><div class="qzf"><button class="qbtn p" data-z="go">Bắt đầu</button></div>';
    }
    function cur(){ return qz.list[qz.i]; }
    function show(){
      clearInterval(qz.iv); var c=cur(); if(!c) return summary(); qz.tries=0; qz.answered=false;
      var it=c.it, q=c.q, h='';
      var label = {mcq:q.stem, fill_blank:q.text, word_form:q.text, tfng:q.statement, cloze_mcq:'Gap '+q.n+' in the text', matching:q.left, ordering:'Put the words in order', rewrite:q.original, short_answer:q.question}[it.type]||'';
      h+='<div class="qzex">Bài '+(c.ei+1)+' · '+esc(it.title)+(it.type==='matching'?' · Chọn mục nối với':'')+'</div><div class="qzq">'+esc(label).replace(/_{2,}/g,'<span class="blank" style="min-width:110px">&nbsp;</span>')+(it.type==='word_form'?' <span class="base" style="font-size:18px">'+esc(q.baseWord)+'</span>':'')+'</div>';
      if(it.type==='cloze_mcq' && it.passage){ h='<div class="qzex">Bài '+(c.ei+1)+' · '+esc(it.title)+'</div><div style="font-size:17px;line-height:1.6;background:#F7F8FA;border-radius:10px;padding:12px 16px;margin-bottom:14px">'+esc(it.passage).replace(/\{(\d+)\}/g,function(_,n){return '<b style="background:'+(+n===q.n?'#FFE36E':'#fff')+';border:1px solid #9AA3B2;border-radius:4px;padding:0 6px">'+n+'</b>';})+'</div>'; }
      if(it.type==='tfng' && it.passage) h = '<details style="font-family:system-ui;font-size:14px;margin-bottom:10px"><summary>Xem đoạn văn</summary><div style="font-family:Georgia,serif;font-size:16px;padding:8px 0">'+esc(it.passage)+'</div></details>'+h;
      var opts=null;
      if(it.type==='mcq') opts=q.options.map(function(o){return o.text;});
      if(it.type==='cloze_mcq') opts=q.options;
      if(it.type==='tfng') opts=['True','False','Not given'];
      if(it.type==='matching') opts=it.rightList;
      if(opts) h+='<div class="qzopts">'+opts.map(function(o,k){return '<button class="qzo" data-k="'+k+'"><b>'+(it.type==='tfng'?['T','F','NG'][k]:LET[k])+'</b> '+esc(o)+'</button>';}).join('')+'</div>';
      if(it.type==='fill_blank'||it.type==='word_form') h+='<input class="qzi" placeholder="Gõ đáp án rồi Enter" aria-label="Đáp án">';
      if(it.type==='ordering') h+='<div class="ord" style="font-size:20px">'+q.words.map(function(w,k){return '<span data-w="'+k+'" style="font-size:20px;padding:4px 12px;cursor:pointer">'+esc(w)+'</span>';}).join('')+'</div><div class="ord-built" style="font-size:22px;margin-top:12px;min-height:32px;font-family:Georgia,serif"></div>';
      if(it.type==='rewrite'||it.type==='short_answer') h+=(it.type==='rewrite'?'<div style="font-size:20px"><b>'+esc(q.lead)+'</b> …</div>':'')+'<div style="font-family:system-ui;font-size:14px;color:#7A8496;margin-top:12px">Câu mở: không tự chấm. Bấm "Xem đáp án mẫu" để so sánh.</div><div class="model" style="display:none;font-size:20px;color:#0F6B37;margin-top:10px">'+esc((q.accepted||[]).join(' / '))+'</div>';
      var open = it.type==='rewrite'||it.type==='short_answer';
      ov.innerHTML='<div class="qzh"><b>Câu '+(qz.i+1)+'/'+qz.list.length+'</b><div class="qzp"><span style="width:'+(qz.i/qz.list.length*100)+'%"></span></div>'+(qz.opt.timer&&!open?'<b class="tmr">'+qz.opt.timer+'s</b>':'')+'<button class="wb" data-z="x">✕ Thoát</button></div><div class="qzb"><div class="qzcard">'+h+'</div></div>'+
        '<div class="qzf"><button class="qbtn" data-z="prev" '+(qz.i?'':'disabled')+'>← Câu trước</button><span style="flex:1"></span>'+(open?'<button class="qbtn" data-z="model">Xem đáp án mẫu</button>':'<button class="qbtn p" data-z="check" disabled>Kiểm tra</button>')+'<button class="qbtn" data-z="next">Câu tiếp →</button></div>';
      var inp=ov.querySelector('.qzi'); if(inp){ inp.focus(); inp.addEventListener('input', function(){ ov.querySelector('[data-z="check"]').disabled=!inp.value.trim(); }); inp.addEventListener('keydown', function(e){ e.stopPropagation(); if(e.key==='Enter' && inp.value.trim()) doCheck(); }); }
      if(qz.opt.timer && !open){ var left=qz.opt.timer; qz.iv=setInterval(function(){ left--; var t=ov.querySelector('.tmr'); if(t) t.textContent=left+'s'; if(left<=0){ clearInterval(qz.iv); if(!qz.answered){ record(false); qz.answered=true; fbPop(false); reveal(); toast('Hết giờ: câu này tính sai.'); } } },1000); }
    }
    function selVal(){ var it=cur().it; if(it.type==='fill_blank'||it.type==='word_form') return (ov.querySelector('.qzi')||{}).value; if(it.type==='ordering'){ var b=ov.querySelector('.ord-built'); return b.textContent+(cur().q.punct||''); } var s=ov.querySelector('.qzo.sel'); if(!s) return null; return it.type==='tfng'?['T','F','NG'][+s.dataset.k]:+s.dataset.k; }
    function record(ok){ if(qz.res[qz.i]==null) qz.res[qz.i]=ok; }
    function reveal(){ var c=cur(), it=c.it, q=c.q; if(!qz.opt.showAns) return;
      var k = it.type==='mcq'?q.options.findIndex(function(o){return o.id===q.correctId;}) : it.type==='cloze_mcq'?q.correctIdx : it.type==='tfng'?['T','F','NG'].indexOf(q.answer) : it.type==='matching'?it.rightList.indexOf(q.right):-1;
      if(k>=0){ var b=ov.querySelector('.qzo[data-k="'+k+'"]'); if(b) b.classList.add('ok'); }
      else { var card=ov.querySelector('.qzcard'); var d=document.createElement('div'); d.style.cssText='font-family:system-ui;color:#0F6B37;font-weight:600;margin-top:12px;font-size:16px'; d.textContent='Đáp án: '+(q.answerText||(q.accepted||[]).join(' / ')); card.appendChild(d); } }
    function doCheck(){
      var c=cur(); var v=selVal(); if(v==null||v==='') return; var ok=check(c.it,c.q,v); qz.tries++;
      if(!qz.answered) record(ok);
      var s=ov.querySelector('.qzo.sel'); if(s){ s.classList.add(ok?'ok':'no'); }
      fbPop(ok);
      if(ok || !qz.opt.retry || qz.tries>=2){ qz.answered=true; clearInterval(qz.iv); if(!ok) reveal(); }
      else { setTimeout(function(){ if(s) s.classList.remove('no','sel'); var b=ov.querySelector('.ord-built'); if(b){ b.textContent=''; ov.querySelectorAll('.ord span').forEach(function(x){x.classList.remove('used');}); } },900); }
    }
    function summary(){
      clearInterval(qz.iv); var scored=qz.list.map(function(c,i){return {c:c,r:qz.res[i]};}).filter(function(x){return ['rewrite','short_answer'].indexOf(x.c.it.type)<0;});
      var ok=scored.filter(function(x){return x.r===true;}).length; var wrong=scored.filter(function(x){return x.r!==true;});
      ov.innerHTML='<div class="qzh"><b>Tổng kết</b><span style="flex:1"></span><button class="wb" data-z="x">✕ Thoát</button></div><div class="qzb"><div class="qzcard" style="font-family:system-ui;text-align:center"><div style="font-size:64px;font-weight:800">'+ok+'/'+scored.length+'</div><div style="color:#7A8496;margin-bottom:18px">câu đúng ở lần trả lời đầu tiên · không lưu kết quả</div>'+
        (wrong.length?'<div style="text-align:left"><b>Câu cần làm lại</b><ul>'+wrong.map(function(x){return '<li>Bài '+(x.c.ei+1)+' · câu '+(x.c.qi+1)+'</li>';}).join('')+'</ul></div>':'<div style="font-size:40px">🏆</div>')+'</div></div>'+
        '<div class="qzf">'+(wrong.length?'<button class="qbtn" data-z="redo">Làm lại câu sai</button>':'')+'<button class="qbtn p" data-z="again">Làm lại từ đầu</button></div>';
      qz.wrong = wrong.map(function(x){return x.c;});
    }
    ov.addEventListener('click', function(e){
      var z=e.target.closest('[data-z]'); var o=e.target.closest('.qzo'); var w=e.target.closest('[data-w]');
      if(o && !qz.answered){ ov.querySelectorAll('.qzo').forEach(function(b){b.classList.remove('sel');}); o.classList.add('sel'); var ck=ov.querySelector('[data-z="check"]'); if(ck) ck.disabled=false; return; }
      if(w && !w.classList.contains('used') && !qz.answered){ w.classList.add('used'); var b=ov.querySelector('.ord-built'); b.textContent=(b.textContent+' '+w.textContent).trim(); if(!ov.querySelector('[data-w]:not(.used)')) ov.querySelector('[data-z="check"]').disabled=false; return; }
      if(!z) return; var a=z.dataset.z;
      if(a==='x') V.overlay.close();
      else if(a==='go'){ ov.querySelectorAll('[data-o]').forEach(function(i){ qz.opt[i.dataset.o] = i.type==='checkbox'?i.checked:+i.value; }); V.mute=!!qz.opt.mute; if(qz.opt.shuffle) qz.list.sort(function(){return Math.random()-.5;}); qz.i=0; qz.res=[]; show(); }
      else if(a==='check') doCheck();
      else if(a==='model'){ ov.querySelector('.model').style.display='block'; }
      else if(a==='next'){ qz.i++; show(); } else if(a==='prev'){ qz.i=Math.max(0,qz.i-1); show(); }
      else if(a==='redo'){ qz.list=qz.wrong; qz.i=0; qz.res=[]; show(); } else if(a==='again'){ qz.list=[]; data.items.forEach(function(it,ei){ (it.questions||[]).forEach(function(q,qi){ qz.list.push({it:it,q:q,ei:ei,qi:qi}); }); }); qz.i=0; qz.res=[]; start(); }
    });
    ov.addEventListener('keydown', function(e){ e.stopPropagation(); });
    qz.key = function(e){ if(!ov.isConnected) return; var c=cur(); if(!c) return;
      if(/^[1-4]$/.test(e.key)||/^[a-dA-D]$/.test(e.key)){ var k=/^\d$/.test(e.key)?+e.key-1:'abcd'.indexOf(e.key.toLowerCase()); var b=ov.querySelector('.qzo[data-k="'+k+'"]'); if(b) b.click(); return true; }
      if(e.key==='Enter'){ var ck=ov.querySelector('[data-z="check"]'); if(ck && !ck.disabled && !qz.answered) doCheck(); else { var n=ov.querySelector('[data-z="next"]'); if(n) n.click(); } return true; }
      if(e.key==='ArrowRight'){ var nx=ov.querySelector('[data-z="next"]'); if(nx) nx.click(); return true; } if(e.key==='ArrowLeft'){ var pv=ov.querySelector('[data-z="prev"]'); if(pv&&!pv.disabled) pv.click(); return true; }
    };
    V.quizKey = qz.key; start();
  }

  /* ---------- notes popover ---------- */
  function notePop(anchor, exId){
    closePop(); var p=document.createElement('div'); p.className='wsv-pop'; var r=anchor.getBoundingClientRect(), rr=root.getBoundingClientRect();
    p.style.left=Math.min(r.left-rr.left, rr.width-290)+'px'; p.style.top=(r.bottom-rr.top+4)+'px';
    p.innerHTML='<div class="ph">Ghi chú giáo viên · chỉ bản giáo viên, lưu trên trình duyệt này</div><textarea aria-label="Ghi chú giáo viên">'+esc(V.store.notes[exId]||'')+'</textarea><div style="display:flex;justify-content:flex-end;gap:6px;margin-top:6px"><button class="wb sm" data-n="x">Đóng</button></div>';
    root.appendChild(p); V.pop=p; var ta=p.querySelector('textarea'); ta.focus();
    ta.addEventListener('input', function(){ V.store.notes[exId]=ta.value; save(); }); ta.addEventListener('keydown', function(e){ e.stopPropagation(); });
    p.addEventListener('click', function(e){ if(e.target.dataset.n==='x') closePop(); });
  }

  /* ---------- actions ---------- */
  function setMode(m){
    if(m==='present'){ V.mode='present'; V.pageIdx=curPage(); root.classList.add('present','autohide'); V.fit='width'; try{ if(root.requestFullscreen) root.requestFullscreen().catch(function(){}); }catch(e){} }
    else { if(V.mode==='present'){ root.classList.remove('present','autohide','bar-show'); try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){} } V.mode=m; }
    render(); }
  document.addEventListener('fullscreenchange', function(){ if(!document.fullscreenElement && V.mode==='present'){ V.mode='page'; root.classList.remove('present','autohide','bar-show'); render(); } });
  function handleAct(e){
    var b = e.target.closest('[data-act]'); if(!b) return false; var a=b.dataset.act;
    switch(a){
      case 'mode-page': setMode('page'); break; case 'mode-scroll': setMode('scroll'); break;
      case 'present': setMode(V.mode==='present'?'page':'present'); break;
      case 'two': V.two=!V.two; V.store.layout.two=V.two; save(); render(); break;
      case 'prev': step(-1); break; case 'next': step(1); break;
      case 'zin': V.zoom=Math.min(4,V.zoom*1.15); render(true); break; case 'zout': V.zoom=Math.max(.3,V.zoom/1.15); render(true); break; case 'zreset': V.zoom=1; V.fit='width'; render(true); break;
      case 'fitw': V.fit='width'; V.zoom=1; render(true); break; case 'fith': V.fit='height'; V.zoom=1; render(true); break;
      case 'zregion': root.classList.toggle('zoompick'); if(root.classList.contains('zoompick')) toast('Kéo chọn vùng cần phóng. Esc hoặc 100% để về tổng.'); break;
      case 'allans': toggleAll(); break; case 'expl': pagesEl.classList.toggle('show-expl'); syncBar(); break;
      case 'qtog': b.closest('.q').classList.toggle('show-ans'); break;
      case 'exans': { var ex=b.closest('.wsx').dataset.ex; pagesEl.querySelectorAll('.wsx[data-ex="'+ex+'"]').forEach(function(s){ s.classList.toggle('show-ans'); }); break; }
      case 'pin': { var id=b.closest('.wsx').dataset.ex; var pins=V.store.pins; var i=pins.indexOf(id); if(i>=0) pins.splice(i,1); else pins.push(id); save(); render(true); break; }
      case 'focus': focusEx(b.closest('.wsx').dataset.ex); break;
      case 'note': notePop(b, b.closest('.wsx').dataset.ex); break;
      case 'edit': if(opts.onEdit) opts.onEdit(b.dataset.ex); break;
      case 'brk': if(opts.onBreak) opts.onBreak(b.dataset.ex); break;
      case 'img': { var m=findMedia(b.dataset.media); if(m) lightbox(m); break; }
      case 'audio': { var m2=findMedia(b.dataset.media); if(m2) playAudio(m2); break; }
      case 'video': { var m3=findMedia(b.dataset.media); if(m3) playVideo(m3); break; }
      case 'retry': V.retried=true; render(true); break;
      case 'cursor': V.tool='cursor'; inkMode(); syncBar(); break;
      case 'pen': V.tool = V.tool==='pen'?'cursor':'pen'; inkMode(); syncBar(); break;
      case 'eraser': V.tool = V.tool==='eraser'?'cursor':'eraser'; inkMode(); syncBar(); break;
      case 'color': V.color=b.dataset.c; if(V.tool!=='pen'){ V.tool='pen'; inkMode(); } syncBar(); break;
      case 'undo': undo(); break; case 'redo': redo(); break; case 'clear': clearInk(); break;
      case 'penmore': root.classList.toggle('pen-open'); b.setAttribute('aria-expanded', root.classList.contains('pen-open')?'true':'false'); break;
      case 'inkvis': V.inkHidden=!V.inkHidden; redrawAll(); syncBar(); break;
      case 'tools': toolsMenu(b); break; case 'qboard': quickBoard(); break;
      case 'quiz': quiz(); break; case 'play': setPlay(!V.play); break;
      default: return false;
    }
    return true;
  }
  root.addEventListener('click', function(e){
    if(V.pop && !e.target.closest('.wsv-pop') && !e.target.closest('[data-act="tools"],[data-act="note"]')) closePop();
    if(V.play && playClick(e)) return;
    if(opts.fill && fillClick(e)) return;
    if(root.classList.contains('cover')){ var c=e.target.closest('.q,.psg'); if(c && !e.target.closest('[data-act]')){ c.classList.toggle('peek'); return; } }
    handleAct(e);
  });
  root.addEventListener('change', function(e){
    var a=e.target.dataset.act; if(a==='goto'){ var v=e.target.value; if(v.indexOf('pg:')===0) gotoPage(+v.slice(3)); else if(v.indexOf('ex:')===0) gotoEx(v.slice(3)); e.target.value=''; }
    if(a==='width'){ V.width=+e.target.value; }
  });
  /* region zoom */
  stage.addEventListener('pointerdown', function(e){
    if(!root.classList.contains('zoompick')) return; e.preventDefault(); var r=stage.getBoundingClientRect(); var sx=e.clientX, sy=e.clientY;
    var box=document.createElement('div'); box.className='wsv-zoomsel'; root.appendChild(box); var rr=root.getBoundingClientRect();
    var mv=function(ev){ box.style.left=(Math.min(sx,ev.clientX)-rr.left)+'px'; box.style.top=(Math.min(sy,ev.clientY)-rr.top)+'px'; box.style.width=Math.abs(ev.clientX-sx)+'px'; box.style.height=Math.abs(ev.clientY-sy)+'px'; };
    var up=function(ev){ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); box.remove(); root.classList.remove('zoompick');
      var w=Math.abs(ev.clientX-sx); if(w<20) return; var x0=Math.min(sx,ev.clientX)-r.left+stage.scrollLeft, y0=Math.min(sy,ev.clientY)-r.top+stage.scrollTop;
      var f=(stage.clientWidth-30)/w; V.zoom=Math.min(6,V.zoom*f); V.fit='width'; render(); stage.scrollLeft=x0*f; stage.scrollTop=y0*f-10; toast('Đang phóng vùng. Esc để về tổng.'); };
    window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up);
  });

  /* keyboard */
  function onKey(e){
    if(!root.isConnected) return document.removeEventListener('keydown', onKey);
    if(opts.mini) return;
    var tag=(e.target.tagName||'').toLowerCase(); if(tag==='input'||tag==='textarea'||tag==='select') return;
    if(!opts.globalKeys && !root.contains(document.activeElement) && document.fullscreenElement!==root) return;
    if(V.blank){ V.blank.remove(); V.blank=null; e.preventDefault(); return; }
    if(V.quizKey && root.querySelector('.wsv-quiz')){ if(e.key==='Escape'){ V.overlay&&V.overlay.close(); return; } if(V.quizKey(e)) e.preventDefault(); return; }
    if(e.key==='Shift'){ mods.shift=true; inkMode(); return; } if(e.key==='Control'||e.key==='Meta'){ mods.ctrl=true; inkMode(); return; }
    if((e.ctrlKey||e.metaKey) && (e.key==='z'||e.key==='Z')){ e.preventDefault(); e.shiftKey?redo():undo(); return; }
    if((e.ctrlKey||e.metaKey) && (e.key==='y'||e.key==='Y')){ e.preventDefault(); redo(); return; }
    if(e.ctrlKey||e.metaKey||e.altKey) return;
    var k=e.key;
    if(k==='Escape'){ if(V.qb && V.qb.style.display!=='none'){ V.qb.style.display='none'; return; } if(V.overlay){ V.overlay.close(); return; } if(V.pop){ closePop(); return; } if(root.classList.contains('zoompick')){ root.classList.remove('zoompick'); return; } if(V.zoom!==1){ V.zoom=1; render(); return; } if(V.tool!=='cursor'){ V.tool='cursor'; inkMode(); syncBar(); return; } if(V.mode==='present'){ setMode('page'); } return; }
    if(V.overlay && V.overlay.focus){ if(k==='ArrowRight'){ root.querySelector('[data-f="next"]').click(); } else if(k==='ArrowLeft'){ root.querySelector('[data-f="prev"]').click(); } else if(k===' '&&T){ e.preventDefault(); revealNext(e.shiftKey); } return; }
    if(k==='ArrowRight'||k==='PageDown'){ e.preventDefault(); step(1); } else if(k==='ArrowLeft'||k==='PageUp'){ e.preventDefault(); step(-1); }
    else if(k==='+'||k==='='){ V.zoom=Math.min(4,V.zoom*1.15); render(true); } else if(k==='-'){ V.zoom=Math.max(.3,V.zoom/1.15); render(true); }
    else if((k==='a'||k==='A')&&T){ toggleAll(); } else if(k==='p'||k==='P'){ V.tool=V.tool==='pen'?'cursor':'pen'; inkMode(); syncBar(); } else if(k==='e'||k==='E'){ V.tool=V.tool==='eraser'?'cursor':'eraser'; inkMode(); syncBar(); }
    else if(k===' '&&T){ e.preventDefault(); revealNext(e.shiftKey); }
    else if(k==='h'||k==='H') tool('autohide'); else if(k==='c'||k==='C') tool('cover'); else if(k==='r'||k==='R') tool('curtain');
    else if(k==='b'||k==='B') tool('black'); else if(k==='w'||k==='W') tool('white'); else if(k==='l'||k==='L') tool('spot'); else if(k==='t'||k==='T') tool('timer'); else if(k==='k'||k==='K') tool('board');
    else if(/^[1-9]$/.test(k)){ var it=data.items[+k-1]; if(it) gotoEx(it.id); }
  }
  function onKeyUp(e){ if(e.key==='Shift'){ mods.shift=false; if(!V.live) inkMode(); } if(e.key==='Control'||e.key==='Meta'){ mods.ctrl=false; if(!V.live) inkMode(); } }
  function onBlur(){ mods.shift=false; mods.ctrl=false; if(V.live){ endInk(); } inkMode(); }
  if(!opts.mini){ document.addEventListener('keydown', onKey); document.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur); }
  var ro = window.ResizeObserver ? new ResizeObserver(function(){ var s=computeScale(); if(Math.abs(s-V.s)>0.01) render(true); }) : null; if(ro) ro.observe(stage);

  render();
  if(opts.cur) setTimeout(function(){ gotoEx(opts.cur); }, 30);
  return {
    V:V, render:render, gotoEx:gotoEx,
    setCur:function(id, scroll){ V.cur=id; pagesEl.querySelectorAll('.wsx').forEach(function(s){ s.classList.toggle('cur', s.dataset.ex===id); }); if(scroll) gotoEx(id); },
    setAnswers:function(on){ pagesEl.classList.toggle('show-ans', on); },
    setFill:function(f){ opts.fill = f; render(true); },
    destroy:function(){ document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); if(ro) ro.disconnect(); if(player) player.close(); if(window.speechSynthesis) try{speechSynthesis.cancel();}catch(e){} },
    quiz:quiz, setPlay:setPlay, quickBoard:quickBoard, strokesCount:function(){ var n=0; Object.keys(V.store.strokes).forEach(function(k){ n+=V.store.strokes[k].length; }); return n; }
  };
};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ WSV.autoIconize(document.body); }); else WSV.autoIconize(document.body);
})();
