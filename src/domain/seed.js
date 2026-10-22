/* ============ SEED STATE ============ */
import { WS } from '../ws.js';
const U = WS.U, Q = WS.Q, AI = WS.AI, S = WS.S;
WS.SCHEMA = 8;

WS.defaultQfb = () => ({
  correct:{img:{star:true,check:true,confetti:true,thumbs:true,trophy:true,smile:true}, snd:{chime:true,arp:true,pop:true,bell:true}},
  wrong:{img:{arrow:true,cloud:true,sprout:true,puzzle:true}, snd:{soft:true,bloop:true,hmm:true}},
  volume:0.6, showText:true
});

WS.emptyState = () => ({
  schemaVersion:WS.SCHEMA, createdAt:Date.now(), updatedAt:Date.now(),
  settings:{selfApprove:false, lockTtl:120, l1Download:false, strictness:'std', latency:'mid', apiUrl:'https://lms.example.edu/api/worksheets', qfb:WS.defaultQfb()},
  currentUserId:'lan', curricula:U.clone(WS.CURRICULA), curriculaRev:0,
  curriculumVersions:Object.fromEntries(WS.CURRICULA.map(c=>[c.id,[{version:c.version, at:Date.now()-86400000*30, by:'thu', note:'Bản gốc', lessons:countLessons(c)}]])),
  standards:U.clone(WS.STANDARDS), themes:U.clone(WS.THEMES), layouts:U.clone(WS.LAYOUTS), layoutDefaults:U.clone(WS.LAYOUT_DEFAULTS), wsTemplates:[],
  exercises:[], worksheets:[], media:[], notes:[], notifications:[], audit:[], feedback:[], locks:[],
  demo:{aiFault:'off', netFail:false, mediaFail:false}, lessonFiles:{}, counters:{ws:0}, tour:{hidden:false}
});
function countLessons(c){ let n=0; c.levels.forEach(l=>l.units.forEach(u=>n+=u.lessons.length)); return n; }

WS.makeSeed = () => {
  const st = WS.emptyState(); S.state = st;
  const now = Date.now(); const H = 3600000, D = 86400000;
  const ctx = id => Q.lessonCtx(id);
  const scopeOf = id => { const x=ctx(id); return {curriculumId:x.c.id, curriculumVersion:x.c.version, levelId:x.l.id, unitId:x.u.id, lessonIds:[id]}; };
  const audit = (at, actorId, action, tt, tid, note='') => st.audit.push({id:U.uid('a'), at, actorId, action, targetType:tt, targetId:tid, before:null, after:null, note});

  const mkEx = (lessonId, type, ownerId, o={}) => {
    const g = AI.generate(lessonId, type, {count:o.count, seed:o.seed||(type+ownerId), difficulty:o.difficulty, themeId:o.themeId, layout:o.layout, blockIndex:o.bi||0});
    const ex = {id:U.uid('ex'), type, ownerId, scope:scopeOf(lessonId), themeId:o.themeId||null, status:'active', draft:g.draft, versions:[], origin:{kind:'ai', fromId:null},
      standardRef:{id:Q.standard(type).id, version:Q.standard(type).version}, tags:o.tags||[], genLog:g.log, createdAt:now-(o.ago||3)*D, updatedAt:now-(o.ago||3)*D+H, rev:1};
    ex.draft.rev = 1;
    if(o.layout) ex.draft.layout = o.layout;
    st.exercises.push(ex); audit(ex.createdAt, ownerId, 'Tạo bài (AI giả lập)', 'exercise', ex.id);
    return ex;
  };
  const done = (ex, n=1, by) => {
    for(let k=0;k<n;k++){
      if(k>0){ ex.draft.title = AI.TITLES[ex.type][(k+1)%4]; if(ex.draft.questions[0] && ex.draft.questions[0].explanation!==undefined) ex.draft.questions[0].explanation = AI.explanationFor(ex.type, ex.draft.questions[0], k); }
      const at = ex.createdAt + (k+1)*H*3;
      ex.versions.push({no:ex.versions.length+1, snapshot:U.clone(ex.draft), doneAt:at, doneBy:by||ex.ownerId, standardRef:U.clone(ex.standardRef)});
      audit(at, by||ex.ownerId, 'Done', 'exercise', ex.id, `v${ex.versions.length}`);
    }
    return ex;
  };
  const addMedia = (ex, m) => { st.media.push(m); ex.draft.media.push(m.id); return m; };
  const img = (ex, kw, emo, hue, style=0) => addMedia(ex, {id:U.uid('m'), kind:'image', keyword:kw, emoji:emo, hue, style, alt:`Illustration: ${kw}`, source:'giả lập', prompt:`flat illustration, ${kw}, child-friendly`, status:'ok'});
  const mkWs = (o) => {
    st.counters.ws++; const code='WS-'+String(st.counters.ws).padStart(4,'0');
    const ws = {id:'ws'+st.counters.ws, code, title:o.title, authorId:o.author, status:o.status||'draft', scope:scopeOf(o.lesson), themeId:o.theme||null, pages:o.pages||2,
      settings:{cover:false, classInfo:true, notesArea:false, score:false, minutes:o.minutes||30, note:''}, items:[], versions:[], versionNo:o.versionNo||1, reviewerId:o.reviewer||null,
      unlock:null, returned:null, exportedAt:null, publishedVersion:null, createdAt:now-(o.ago||5)*D, updatedAt:now-(o.upd||1)*H, submittedAt:null, approvedAt:null};
    (o.items||[]).forEach(ex=>{ const last=ex.versions[ex.versions.length-1]; ws.items.push({id:U.uid('it'), exerciseId:ex.id, pinnedVersionNo:last?last.no:null, local:false, layout:null}); });
    st.worksheets.push(ws); audit(ws.createdAt, o.author, 'Tạo phiếu', 'worksheet', ws.id);
    return ws;
  };
  const snapWs = (ws, label, by, at) => { ws.versions.push({no:ws.versions.length+1, at, by, label, items:ws.items.map(i=>({exerciseId:i.exerciseId, pinnedVersionNo:i.pinnedVersionNo}))}); };

  /* --- WS-0001 Lan draft --- */
  const L11 = 'ex1-l1-u1-1';
  const a1 = done(mkEx(L11,'matching','lan',{count:6, ago:4}));
  const a2 = mkEx(L11,'mcq','lan',{count:5, ago:2});
  a2.draft.questions[1].stem = a2.draft.questions[1].stem.replace(/\.$/,' on the sofa.');
  const a3 = done(mkEx(L11,'fill_blank','lan',{count:5, ago:6}), 4);
  const w1 = mkWs({title:'Unit 1 – Warm-up', author:'lan', lesson:L11, items:[a1,a2,a3], ago:2, upd:2});
  w1.items[2].pinnedVersionNo = 3;
  w1.items[1].pinnedVersionNo = null;

  /* --- WS-0002 Minh pending --- */
  const L21='ex1-l1-u2-1';
  const b = [done(mkEx(L21,'matching','minh',{count:6})), done(mkEx(L21,'mcq','minh',{count:5})), done(mkEx(L21,'tfng','minh',{count:5}))];
  const w2 = mkWs({title:'Unit 2 – Classroom Check', author:'minh', lesson:L21, items:b, status:'pending', ago:3, upd:5});
  w2.submittedAt = now-5*H; snapWs(w2,'Duyệt cấp 1','minh',w2.submittedAt); audit(w2.submittedAt,'minh','Duyệt cấp 1','worksheet',w2.id);

  /* --- WS-0003 Lan returned --- */
  const L31='ex1-l1-u3-1';
  const c = [done(mkEx(L31,'mcq','lan',{count:5,ago:5})), done(mkEx(L31,'fill_blank','lan',{count:5,ago:5})), done(mkEx(L31,'ordering','lan',{count:4,ago:5}))];
  const w3 = mkWs({title:'Unit 3 – Food Review', author:'lan', lesson:L31, items:c, status:'draft', ago:5, upd:20});
  w3.submittedAt = now-D; w3.reviewerId=null; snapWs(w3,'Duyệt cấp 1','lan',now-D);
  w3.returned = {by:'ha', at:now-20*H, summary:'Bài 1 câu 2 có hai lựa chọn hợp lý; bài 3 nên dùng câu ngắn hơn cho Pre-A1.'};
  st.notes.push({id:U.uid('nt'), wsId:w3.id, targetType:'question', targetId:c[0].draft.questions[1].id, exId:c[0].id, authorId:'ha', kind:'request', text:'Câu này có hai lựa chọn đều hợp lý, đổi một lựa chọn nhiễu giúp mình.', status:'open', at:now-20*H});
  st.notes.push({id:U.uid('nt'), wsId:w3.id, targetType:'exercise', targetId:c[2].id, exId:c[2].id, authorId:'ha', kind:'request', text:'Dùng câu 3–5 từ cho học sinh Pre-A1.', status:'open', at:now-20*H});
  st.notes.push({id:U.uid('nt'), wsId:w3.id, targetType:'worksheet', targetId:w3.id, exId:null, authorId:'ha', kind:'info', text:'Phần nối từ rất tốt, giữ nguyên.', status:'open', at:now-20*H});
  audit(now-D,'lan','Duyệt cấp 1','worksheet',w3.id); audit(now-21*H,'ha','Nhận xét duyệt','worksheet',w3.id); audit(now-20*H,'ha','Trả lại','worksheet',w3.id,'2 note đề nghị sửa');

  /* --- WS-0004 Minh approved --- */
  const L2='ex1-l2-u1-1';
  const d4 = [done(mkEx(L2,'matching','minh',{count:6,ago:9}),2), done(mkEx(L2,'tfng','minh',{count:5,ago:9})), done(mkEx(L2,'word_form','minh',{count:5,ago:9}))];
  const w4 = mkWs({title:'Level 2 – My Day', author:'minh', lesson:L2, items:d4, status:'approved', reviewer:'ha', ago:9, upd:30});
  w4.items[0].pinnedVersionNo = 1; d4[0].versions.push({no:3, snapshot:U.clone(d4[0].draft), doneAt:now-2*D, doneBy:'minh', standardRef:d4[0].standardRef});
  w4.submittedAt=now-3*D; w4.approvedAt=now-2*D; snapWs(w4,'Duyệt cấp 1','minh',now-3*D); snapWs(w4,'Duyệt cấp 2','ha',now-2*D);
  w4.items[0].pinnedVersionNo = 2;
  audit(now-3*D,'minh','Duyệt cấp 1','worksheet',w4.id); audit(now-2*D,'ha','Duyệt cấp 2','worksheet',w4.id);

  /* --- WS-0005 Quang reviewing by Ha --- */
  const P11='pw-l1-u1-1';
  const e5 = [done(mkEx(P11,'mcq','quang',{count:6})), done(mkEx(P11,'tfng','quang',{count:5})), done(mkEx(P11,'rewrite','quang',{count:4}))];
  const w5 = mkWs({title:'Pathway – Tech Talk', author:'quang', lesson:P11, items:e5, status:'reviewing', reviewer:'ha', ago:4, upd:3});
  w5.submittedAt=now-8*H; snapWs(w5,'Duyệt cấp 1','quang',now-8*H); audit(now-8*H,'quang','Duyệt cấp 1','worksheet',w5.id); audit(now-3*H,'ha','Nhận xét duyệt','worksheet',w5.id);
  st.notes.push({id:U.uid('nt'), wsId:w5.id, targetType:'exercise', targetId:e5[1].id, exId:e5[1].id, authorId:'ha', kind:'info', text:'Đoạn văn hay, phù hợp B1.', status:'open', at:now-3*H});

  /* --- WS-0006 Quang draft (self-approval test) --- */
  const P21='pw-l1-u2-1';
  const f6 = [done(mkEx(P21,'cloze_mcq','quang',{count:5})), done(mkEx(P21,'rewrite','quang',{count:4}))];
  mkWs({title:'Pathway – Travel Practice', author:'quang', lesson:P21, items:f6, ago:1, upd:4});

  /* --- WS-0007 Minh, unlocked by Quang (Mở khóa sửa) --- */
  const L22='ex1-l1-u2-2';
  const g7 = [done(mkEx(L22,'matching','minh',{count:6, ago:8})), done(mkEx(L22,'tfng','minh',{count:4, ago:8}))];
  const w7 = mkWs({title:'Unit 2 – Room Check', author:'minh', lesson:L22, items:g7, status:'unlocked', reviewer:'quang', ago:8, upd:6});
  w7.submittedAt=now-4*D; w7.approvedAt=now-3*D; w7.prevStatus='approved'; w7.unlock={by:'quang', reason:'Thêm câu hỏi đếm đồ vật cho bài 2 theo góp ý tổ chuyên môn.', at:now-6*H};
  snapWs(w7,'Duyệt cấp 1','minh',now-4*D); snapWs(w7,'Duyệt cấp 2','quang',now-3*D); audit(now-3*D,'quang','Duyệt cấp 2','worksheet',w7.id); audit(now-6*H,'quang','Mở khóa sửa','worksheet',w7.id,w7.unlock.reason);

  /* --- showcase WS-0008 Space --- */
  const sp = 'space';
  const s1 = mkEx(L2,'matching','minh',{count:6, themeId:sp, layout:'L2', seed:'sp1', bi:0});
  img(s1,'morning routine','⏰',220,0); done(s1);
  const s2 = done(mkEx(L2,'mcq','minh',{count:5, themeId:sp, layout:'L1', seed:'sp2', bi:1}));
  const s3 = done(mkEx(L2,'fill_blank','minh',{count:6, themeId:sp, layout:'L4', seed:'sp3', bi:2}));
  const s4 = done(mkEx(L2,'ordering','minh',{count:4, themeId:sp, seed:'sp4', bi:0}));
  const s5 = mkEx(L2,'tfng','minh',{count:5, themeId:sp, layout:'L3', seed:'sp5', bi:1});
  addMedia(s5, AI.audioFor(s5.draft.passage,'Listen and read')); img(s5,'space station','🛰️',250,1); done(s5);
  const s6 = done(mkEx(L2,'cloze_mcq','minh',{count:5, themeId:sp, layout:'L3', seed:'sp6', bi:2}));
  const s7 = done(mkEx(L2,'word_form','minh',{count:5, themeId:sp, layout:'L4', seed:'sp7', bi:0}));
  const s8 = mkEx(L2,'rewrite','minh',{count:4, themeId:sp, seed:'sp8', bi:1}); addMedia(s8, AI.videoFor('A morning on the space station','Zed wakes up, brushes his teeth and has breakfast with Mia.')); done(s8);
  const s9 = mkEx(L2,'short_answer','minh',{count:4, themeId:sp, layout:'L3', seed:'sp9', bi:2});
  addMedia(s9, AI.audioFor(AI.applyNames(Q.lesson(L2).dialogue, AI.nameMap(Q.lesson(L2),sp)).replace(/^A:/gm,'Zed:').replace(/^B:/gm,'Mia:'),'Dialogue')); done(s9);
  const w8 = mkWs({title:'Showcase · A Day in Space', author:'minh', lesson:L2, theme:sp, items:[s1,s2,s3,s4,s5,s6,s7,s8,s9], status:'approved', reviewer:'ha', pages:4, ago:7, upd:26});
  w8.items.forEach(i=>i.layout=null); w8.submittedAt=now-2*D; w8.approvedAt=now-26*H; snapWs(w8,'Duyệt cấp 2','ha',now-26*H);

  /* --- showcase WS-0009 Little Chefs --- */
  const ch='chefs';
  const k1 = mkEx(L31,'matching','lan',{count:6, themeId:ch, layout:'L2', seed:'ch1'}); img(k1,'kitchen food','🍎',10,2); done(k1);
  const k2 = mkEx(L31,'mcq','lan',{count:5, themeId:ch, layout:'L2', seed:'ch2', bi:1}); img(k2,'party table','🎂',330,0); addMedia(k2, AI.audioFor(Q.lesson(L31).dialogue.replace(/^A:/gm,'Leo:').replace(/^B:/gm,'Rosa:'),'Dialogue')); done(k2);
  const k3 = done(mkEx(L31,'fill_blank','lan',{count:6, themeId:ch, layout:'L4', seed:'ch3', bi:2}));
  const k4 = done(mkEx(L31,'ordering','lan',{count:4, themeId:ch, seed:'ch4'}));
  const k5 = mkEx(L31,'tfng','lan',{count:5, themeId:ch, layout:'L3', seed:'ch5', bi:1}); img(k5,'breakfast','🍞',40,1); done(k5);
  const k6 = done(mkEx(L31,'cloze_mcq','lan',{count:5, themeId:ch, layout:'L3', seed:'ch6', bi:2}));
  const k7 = done(mkEx(L31,'short_answer','lan',{count:4, themeId:ch, layout:'L3', seed:'ch7'}));
  const w9 = mkWs({title:'Showcase · Little Chefs', author:'lan', lesson:L31, theme:ch, items:[k1,k2,k3,k4,k5,k6,k7], status:'approved', reviewer:'quang', pages:3, ago:6, upd:40});
  w9.approvedAt=now-40*H; snapWs(w9,'Duyệt cấp 2','quang',now-40*H);

  /* --- showcase WS-0010 Time Travellers --- */
  const tt='time';
  const t1 = mkEx(P21,'short_answer','quang',{count:4, themeId:tt, layout:'L3', seed:'tt1'}); addMedia(t1, AI.audioFor(t1.draft.passage,'Listen to the story')); img(t1,'old station','🚂',30,0); done(t1);
  const t2 = mkEx(P21,'tfng','quang',{count:6, themeId:tt, layout:'L3', seed:'tt2', bi:1}); img(t2,'airport','🛫',200,2); done(t2);
  const t3 = done(mkEx(P21,'cloze_mcq','quang',{count:6, themeId:tt, layout:'L3', seed:'tt3', bi:2}));
  const t4 = mkEx(P21,'mcq','quang',{count:6, themeId:tt, layout:'L2', seed:'tt4'}); img(t4,'luggage','🧳',280,1); done(t4);
  const t5 = done(mkEx(P21,'word_form','quang',{count:6, themeId:tt, layout:'L4', seed:'tt5', bi:1}));
  const t6 = mkEx(P21,'rewrite','quang',{count:4, themeId:tt, seed:'tt6', bi:2}); addMedia(t6, AI.videoFor('The time machine at the station','Ada and Max were waiting on the platform when the machine suddenly arrived.')); done(t6);
  const w10 = mkWs({title:'Showcase · Time Travellers', author:'quang', lesson:P21, theme:tt, items:[t1,t2,t3,t4,t5,t6], status:'published', reviewer:'ha', pages:3, ago:8, upd:50});
  w10.approvedAt=now-3*D; w10.exportedAt=now-50*H; w10.publishedVersion=1; snapWs(w10,'Duyệt cấp 2','ha',now-3*D); audit(now-50*H,'ha','Xuất bản (tải 2 tệp HTML)','worksheet',w10.id,'v1');

  /* --- kho extras --- */
  const L12='ex1-l1-u1-2';
  const x1 = done(mkEx(L12,'mcq','lan',{count:4, seed:'rej'})); x1.status='rejected'; audit(now-D,'lan','Không hài lòng/Loại','exercise',x1.id);
  const x2 = done(mkEx('ex1-l1-u2-2','fill_blank','minh',{count:5})); x2.status='archived'; audit(now-D,'minh','Lưu trữ','exercise',x2.id);
  const x3 = done(mkEx(L12,'matching','lan',{count:6, seed:'old'})); x3.scope.curriculumVersion='2.0'; x3.tags=['bản cũ'];
  const x4 = done(mkEx(L12,'ordering','lan',{count:4, seed:'ord'}),2); x4.draft.instruction = 'Put the words in order. Start with a capital letter.'; x4.draft.rev=2;
  done(mkEx('ex1-l1-u2-2','mcq','minh',{count:5}));
  done(mkEx('pw-l1-u1-2','word_form','quang',{count:8}));
  mkEx('ex1-l1-u3-2','fill_blank','minh',{count:5});

  /* --- notifications --- */
  st.notifications.push({id:U.uid('n'), userId:'ha', at:w2.submittedAt, text:'Minh gửi Duyệt cấp 1 phiếu "Unit 2 – Classroom Check".', link:'#/phieu/'+w2.id, read:false});
  st.notifications.push({id:U.uid('n'), userId:'quang', at:w2.submittedAt, text:'Minh gửi Duyệt cấp 1 phiếu "Unit 2 – Classroom Check".', link:'#/phieu/'+w2.id, read:false});
  st.notifications.push({id:U.uid('n'), userId:'lan', at:now-20*H, text:'Hà trả lại phiếu "Unit 3 – Food Review" kèm 2 note đề nghị sửa.', link:'#/phieu/'+w3.id, read:false});
  st.notifications.push({id:U.uid('n'), userId:'quang', at:now-3*H, text:'Hà đang xét phiếu "Pathway – Tech Talk" của bạn.', link:'#/phieu/'+w5.id, read:true});
  st.notifications.push({id:U.uid('n'), userId:'minh', at:now-2*D, text:'Hà đã Duyệt cấp 2 phiếu "Level 2 – My Day".', link:'#/phieu/'+w4.id, read:true});

  /* --- lesson files demo (D-112) --- */
  const ls = Q.lesson(L2);
  st.lessonFiles[L2] = {knowledge:{text:WS.SAMPLE_KNOWLEDGE_MD(ls), version:1, at:now-4*D, by:'thu'}, skill:{text:WS.SAMPLE_SKILL_MD(ls), version:1, at:now-4*D, by:'thu'},
    source:{text:'# Văn bản nguồn\n'+ls.passages[0], version:1, at:now-4*D, by:'thu'}, gold:{text:'# Bài mẫu chuẩn vàng\n### Matching: daily routines\n- wake up — ⏰\n- brush — 🪥', version:1, at:now-4*D, by:'thu'}};
  st.lessonFiles[L11] = {knowledge:{text:WS.SAMPLE_KNOWLEDGE_MD(Q.lesson(L11)), version:2, at:now-6*D, by:'thu'}};
  st.audit.sort((a,b)=>a.at-b.at);
  return st;
};

WS.resetEmpty = () => {
  const st = WS.emptyState(); st.currentUserId = S.state ? S.state.currentUserId : 'lan'; return st;
};
