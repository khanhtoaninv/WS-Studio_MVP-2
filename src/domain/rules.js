/* ============ RULES: permissions, state machines, locks ============ */
import { WS } from '../ws.js';
const U = WS.U, Q = WS.Q, V = WS.V, S = WS.S;
const R = WS.R = {};
const ok = (extra={}) => Object.assign({ok:true}, extra);
const no = (reason, extra={}) => Object.assign({ok:false, reason}, extra);

/* ---------- exercise ---------- */
R.content = d => JSON.stringify({t:d.title, i:d.instruction, p:d.passage, q:d.questions, x:d.extraRight, w:d.wordBank, m:d.media});
R.lastDone = ex => ex.versions[ex.versions.length-1] || null;
R.version = (ex, no) => ex.versions.find(v=>v.no===no);
R.isDirty = ex => { const v=R.lastDone(ex); return !!v && R.content(v.snapshot)!==R.content(ex.draft); };
R.exState = ex => {
  if(ex.status==='rejected') return {key:'rejected', label:'Loại', chip:'red', icon:'✕'};
  if(ex.status==='archived') return {key:'archived', label:'Lưu trữ', chip:'lgrey', icon:'🗄'};
  const v = R.lastDone(ex);
  if(!v) return {key:'draft', label:'Nháp', chip:'grey', icon:'✎'};
  if(R.isDirty(ex)) return {key:'dirty', label:`Done v${v.no} · đã sửa sau Done`, chip:'lyellow', icon:'●'};
  return {key:'done', label:`Done v${v.no}`, chip:'lgreen', icon:'✔'};
};
R.compatible = ex => { const c = Q.curriculum(ex.scope.curriculumId); return !c || c.version===ex.scope.curriculumVersion; };
R.wsUsing = exId => S.state.worksheets.filter(w=>w.items.some(i=>i.exerciseId===exId));
R.lockingWs = (ex, user) => R.wsUsing(ex.id).filter(w=>['reviewing','approved','published','unlocked'].includes(w.status) && !R.canEditWs(w,user).ok);

R.lockTtl = () => (S.state.settings.lockTtl||120)*1000;
R.lockOf = exId => { const l = S.state.locks.find(x=>x.exerciseId===exId); if(!l) return null; if(Date.now()-l.lastActive > R.lockTtl()) return null; return l; };
R.takeLock = (exId, userId) => { const l = R.lockOf(exId); if(l && l.userId!==userId) return false; S.state.locks = S.state.locks.filter(x=>x.exerciseId!==exId); S.state.locks.push({exerciseId:exId, userId, lastActive:Date.now()}); return true; };

R.canEditEx = (ex, user, ws) => {
  user = user || Q.me();
  if(!ex) return no('Không tìm thấy bài.');
  if(ex.status==='rejected') return no('Không thể sửa vì bài đang ở trạng thái Loại. Hãy Khôi phục bài trước.', {alt:'restore'});
  if(ex.status==='archived') return no('Không thể sửa vì bài đã Lưu trữ. Hãy Khôi phục bài trước.', {alt:'restore'});
  if(ws){ const w = R.canEditWs(ws, user); if(!w.ok) return no(w.reason, {wsBlock:true, withdraw:w.withdraw}); }
  const lockers = R.lockingWs(ex, user).filter(w=>!ws || w.id!==ws.id);
  if(lockers.length && user.role!=='l2') return no(`Bài đang được ghim trong phiếu ${lockers.map(w=>'"'+w.title+'"').join(', ')} (${R.wsStatus(lockers[0]).label}) nên bị khóa. Hãy Nhân bản để sửa bản riêng.`, {alt:'clone', locked:true});
  const reviewingHere = ws && ['reviewing','unlocked'].includes(ws.status) && user.role==='l2';
  if(ex.ownerId!==user.id && !reviewingHere && user.role!=='l2') return no(`Bài thuộc kho chung của ${Q.user(ex.ownerId).name}; chỉ chủ bài sửa bản nháp. Hãy Nhân bản để có bản riêng.`, {alt:'clone'});
  const lk = R.lockOf(ex.id); if(lk && lk.userId!==user.id) return no(`${Q.user(lk.userId).name} đang sửa bài này. Bạn đang ở chế độ chỉ xem.`, {soft:true, by:lk.userId});
  return ok();
};

/* done */
R.canDone = (ex, user, ws) => {
  const e = R.canEditEx(ex, user, ws); if(!e.ok) return e;
  const v = V.validate(ex);
  if(v.errors.length) return no(`Không thể Done vì còn ${v.errors.length} lỗi (${[...new Set(v.errors.map(i=>i.code))].join(', ')}). Hãy mở tab Kiểm tra và sửa các lỗi đó.`, {validation:v});
  const st = R.exState(ex); if(st.key==='done') return no('Bài đã Done và chưa có thay đổi mới.', {already:true});
  return ok({needConfirm: v.warnings.length>0, validation:v});
};

/* ---------- worksheet ---------- */
const ST = {
  draft:{label:'Nháp', chip:'grey', icon:'✎'}, pending:{label:'Chờ duyệt', chip:'yellow', icon:'⏳'},
  reviewing:{label:'Đang xét', chip:'blue', icon:'👁'}, approved:{label:'Đã duyệt cấp 2', chip:'green', icon:'✔'},
  published:{label:'Đã xuất bản', chip:'dgreen', icon:'⬆'}, unlocked:{label:'Mở khóa sửa', chip:'purple', icon:'🔓'}, archived:{label:'Lưu trữ', chip:'lgrey', icon:'🗄'}
};
R.wsNotes = ws => S.state.notes.filter(n=>n.wsId===ws.id);
R.openRequests = ws => R.wsNotes(ws).filter(n=>n.kind==='request' && n.status==='open');
R.wsStatus = ws => {
  const b = Object.assign({key:ws.status}, ST[ws.status]);
  if(ws.status==='reviewing') b.label = `Đang xét · ${Q.user(ws.reviewerId).name}`;
  if(ws.status==='unlocked') b.label = `Mở khóa sửa · ${Q.user(ws.unlock&&ws.unlock.by).name}`;
  if(ws.status==='published') b.label = `Đã xuất bản · v${ws.publishedVersion||ws.versionNo}`;
  if(ws.status==='draft' && ws.returned){ const n=R.openRequests(ws).length + (ws.returned.summary?1:0); b.label=`Trả lại · ${n} note`; b.chip='orange'; b.icon='↩'; b.key='returned'; }
  return b;
};
R.canEditWs = (ws, user) => {
  user = user || Q.me();
  switch(ws.status){
    case 'draft': return (ws.authorId===user.id || user.role==='l2') ? ok() : no(`Phiếu Nháp của ${Q.user(ws.authorId).name}; cấp 1 chỉ sửa phiếu của mình.`);
    case 'pending': if(ws.authorId===user.id && user.role!=='l2') return no('Phiếu đang Chờ duyệt. Sửa sẽ rút phiếu về Nháp.', {withdraw:true});
      return no(user.role==='l2' ? 'Phiếu đang Chờ duyệt. Hãy bấm Nhận xét duyệt để xét và sửa.' : 'Phiếu đang Chờ duyệt cấp 2.');
    case 'reviewing': return ws.reviewerId===user.id ? ok() : no(`Phiếu đang được ${Q.user(ws.reviewerId).name} xét; bạn chỉ xem.`);
    case 'approved': case 'published': return no(user.role==='l2' ? 'Phiếu đã duyệt cấp 2. Hãy bấm Mở khóa sửa (cần lý do).' : 'Phiếu đã duyệt cấp 2 nên bị khóa. Quản lý có thể Mở khóa sửa.');
    case 'unlocked': return ws.unlock && ws.unlock.by===user.id ? ok() : no(`${Q.user(ws.unlock&&ws.unlock.by).name} đang Mở khóa sửa phiếu này.`);
    case 'archived': return no('Phiếu đã Lưu trữ.');
  }
  return no('Không rõ trạng thái.');
};
R.wsItemsReady = ws => {
  if(!ws.items.length) return no('Phiếu chưa có bài nào. Hãy thêm ít nhất 1 bài.');
  for(let i=0;i<ws.items.length;i++){ const it=ws.items[i], ex=Q.ex(it.exerciseId); if(!ex) return no(`Bài ${i+1} không còn trong kho.`);
    const st=R.exState(ex);
    if(st.key==='draft') return no(`Bài ${i+1} chưa Done. Hãy kiểm tra và bấm Done cho bài đó.`, {item:it.id});
    if(st.key==='dirty') return no(`Bài ${i+1} đã sửa sau Done. Hãy bấm Done lại cho bài đó.`, {item:it.id});
    if(['rejected','archived'].includes(st.key)) return no(`Bài ${i+1} đang ${st.label}.`, {item:it.id});
    if(it.pinnedVersionNo!==R.lastDone(ex).no) return no(`Bài ${i+1} đang ghim v${it.pinnedVersionNo} nhưng đã có v${R.lastDone(ex).no}. Hãy chọn Cập nhật hoặc Giữ.`, {item:it.id});
    if(V.validate(ex).errors.length) return no(`Bài ${i+1} còn lỗi bắt buộc.`, {item:it.id});
  }
  return ok();
};
R.can = (action, ws, user, extra={}) => {
  user = user || Q.me();
  const isL2 = user.role==='l2';
  switch(action){
    case 'submit': if(ws.status!=='draft') return no('Chỉ phiếu Nháp mới Duyệt cấp 1 được.');
      if(!(ws.authorId===user.id || isL2)) return no('Chỉ người soạn hoặc quản lý mới Duyệt cấp 1.');
      { const r=R.wsItemsReady(ws); if(!r.ok) return no('Không thể Duyệt cấp 1 vì '+r.reason.charAt(0).toLowerCase()+r.reason.slice(1), r); } return ok();
    case 'withdraw': return ws.status==='pending' && ws.authorId===user.id ? ok() : no('Chỉ người soạn rút được phiếu đang Chờ duyệt.');
    case 'startReview': if(!isL2) return no('Chỉ quản lý cấp 2 mới Nhận xét duyệt.'); if(ws.status!=='pending') return no('Phiếu không ở trạng thái Chờ duyệt.'); return ok();
    case 'return': if(ws.status!=='reviewing'||ws.reviewerId!==user.id) return no('Chỉ người đang xét mới Trả lại được.'); return ok();
    case 'release': if(ws.status!=='reviewing'||ws.reviewerId!==user.id) return no('Chỉ người đang xét mới Nhả phiếu.'); return ok();
    case 'approve': {
      if(ws.status!=='reviewing'||ws.reviewerId!==user.id) return no('Chỉ người đang xét mới Duyệt cấp 2.');
      const open = R.openRequests(ws); if(open.length) return no(`Không thể Duyệt cấp 2 vì còn ${open.length} note "Đề nghị sửa" chưa xử lý. Hãy đánh dấu đã xử lý hoặc Trả lại.`);
      const r=R.wsItemsReady(ws); if(!r.ok) return no('Không thể Duyệt cấp 2 vì '+r.reason.charAt(0).toLowerCase()+r.reason.slice(1));
      if(ws.authorId===user.id && !S.state.settings.selfApprove) return no('Không thể Duyệt cấp 2 phiếu do chính bạn soạn (BR-17). Bật "Cho phép tự duyệt" trong Cài đặt nếu cần.');
      return ok({self: ws.authorId===user.id}); }
    case 'unlock': if(!isL2) return no('Chỉ quản lý cấp 2 mới Mở khóa sửa.'); if(!['approved','published'].includes(ws.status)) return no('Chỉ phiếu đã duyệt cấp 2 mới cần Mở khóa sửa.'); return ok();
    case 'finishUnlock': if(ws.status!=='unlocked'||!ws.unlock||ws.unlock.by!==user.id) return no('Chỉ người đã mở khóa mới Hoàn tất sửa.'); { const r=R.wsItemsReady(ws); if(!r.ok) return no('Không thể Hoàn tất sửa vì '+r.reason.charAt(0).toLowerCase()+r.reason.slice(1)); } return ok();
    case 'download': if(!['approved','published'].includes(ws.status)) return no('Không thể tải bản chính thức vì phiếu chưa Duyệt cấp 2. Hãy dùng Xem trước.');
      if(user.role==='admin') return no('Admin không tải bản chính thức (tách vai trò).');
      if(!isL2 && !S.state.settings.l1Download) return no('Chỉ quản lý cấp 2 tải bản chính thức (bật quyền cho cấp 1 trong Cài đặt).');
      return ok();
    case 'archive': return isL2 && ['approved','published'].includes(ws.status) ? ok() : no('Chỉ quản lý lưu trữ phiếu đã duyệt.');
  }
  return no('?');
};

/* primary action for worksheet top bar */
R.primaryActions = (ws, user) => {
  user = user||Q.me(); const acts=[];
  const add = (id, label, kind='primary') => acts.push(Object.assign({id, label, kind}, R.can(id, ws, user)));
  switch(ws.status){
    case 'draft': add('submit','Duyệt cấp 1'); break;
    case 'pending': if(user.role==='l2') add('startReview','Nhận xét duyệt'); else if(ws.authorId===user.id) acts.push({id:'waiting', label:'Đang chờ quản lý duyệt', kind:'ghost', ok:false, reason:'Phiếu đã gửi Duyệt cấp 1 và đang chờ quản lý cấp 2.'}); break;
    case 'reviewing': if(ws.reviewerId===user.id){ add('release','Nhả phiếu','ghost'); add('return','Trả lại','danger'); add('approve','Duyệt cấp 2','ok'); } break;
    case 'approved': case 'published': if(user.role==='l2') add('unlock','Mở khóa sửa','ghost'); add('download','Tải bản chính thức','primary'); break;
    case 'unlocked': add('finishUnlock','Hoàn tất sửa'); break;
  }
  return acts;
};

/* ---------- tiến độ lesson (Dashboard, D-113) ---------- */
R.lessonStatus = lsId => {
  const wss = S.state.worksheets.filter(w=>w.status!=='archived' && w.scope.lessonIds.includes(lsId));
  if(wss.some(w=>['approved','published'].includes(w.status))) return 'ok';
  if(wss.some(w=>['pending','reviewing','unlocked'].includes(w.status))) return 'rev';
  if(wss.length) return 'dr'; return 'none';
};
R.lessonFilesReady = lsId => { const f=S.state.lessonFiles[lsId]||{}; return !!(f.knowledge && f.skill); };
