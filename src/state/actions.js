/* ============ ACTIONS (all state changes) ============ */
import { WS } from '../ws.js';
const U = WS.U, Q = WS.Q, R = WS.R, V = WS.V, S = WS.S, AI = WS.AI;
const A = WS.A = {};
const toast = (...a) => WS.UI.toast(...a);
const me = () => Q.me();

A.switchUser = id => { S.commit(st=>{ st.currentUserId=id; }); WS.audit('Chuyển người dùng (demo)','user',id); S.persistSoon(); };

/* ---------- exercise editing ---------- */
A.sessionOpen = (exId) => { const ex=Q.ex(exId); if(!ex) return; if(S.session.loadedRev[exId]==null) S.session.loadedRev[exId]=ex.draft.rev||0; R.takeLock(exId, me().id); };
A.reloadEx = (exId) => { const ex=Q.ex(exId); S.session.loadedRev[exId]=ex.draft.rev||0; S.session.undo[exId]=[]; S.session.redo[exId]=[]; S.emit(); };
A.editEx = (exId, mut, o={}) => {
  const ex = Q.ex(exId); const ws = o.wsId && Q.ws(o.wsId);
  const perm = R.canEditEx(ex, me(), ws);
  if(!perm.ok){ if(perm.withdraw){ A.askWithdraw(ws, ()=>A.editEx(exId, mut, o)); return false; } toast(perm.reason, {err:true}); return false; }
  if(S.session.loadedRev[exId]!=null && S.session.loadedRev[exId] !== ex.draft.rev){
    if(A._conflictOpen) return false; A._conflictOpen = true;
    WS.UI.modal({onClose:()=>{ A._conflictOpen=false; }, title:'Không lưu được: bản nháp đã thay đổi', body:`<p>${U.esc(Q.user(ex.draft.updatedBy||'minh').name)} vừa lưu một bản mới hơn của bài này (rev ${ex.draft.rev}, bạn đang mở rev ${S.session.loadedRev[exId]}). Thay đổi của bạn chưa được lưu để tránh ghi đè.</p><p class="muted">Hãy tải lại bản mới nhất rồi sửa tiếp.</p>`,
      buttons:[{label:'Để sau', kind:'ghost'}, {label:'Tải lại bản mới nhất', kind:'primary', onClick:(m,c)=>{ A.reloadEx(exId); c(); toast('Đã tải lại bản nháp mới nhất.'); return false; }}]});
    WS.audit('Từ chối lưu (xung đột)','exercise',exId); return false;
  }
  const before = U.clone(ex.draft);
  (S.session.undo[exId]=S.session.undo[exId]||[]).push(before); if(S.session.undo[exId].length>60) S.session.undo[exId].shift();
  S.session.redo[exId]=[];
  S.commit(()=>{ mut(ex.draft, ex); ex.draft.rev=(ex.draft.rev||0)+1; ex.draft.updatedBy=me().id; ex.updatedAt=Date.now(); S.session.loadedRev[exId]=ex.draft.rev; R.takeLock(exId, me().id);
    if(!o.silentAudit) WS.audit(o.label||'Sửa bài','exercise',exId); });
  return true;
};
A.undoEx = (exId, wsId) => { const st=S.session.undo[exId]; if(!st||!st.length) return toast('Không còn bước để hoàn tác.'); const ex=Q.ex(exId); const cur=U.clone(ex.draft); const prev=st.pop();
  if(!R.canEditEx(ex, me(), wsId&&Q.ws(wsId)).ok) return; (S.session.redo[exId]=S.session.redo[exId]||[]).push(cur);
  S.commit(()=>{ const rev=(ex.draft.rev||0)+1; ex.draft=prev; ex.draft.rev=rev; S.session.loadedRev[exId]=rev; WS.audit('Hoàn tác','exercise',exId); }); toast('Đã hoàn tác.'); };
A.redoEx = (exId, wsId) => { const st=S.session.redo[exId]; if(!st||!st.length) return toast('Không còn bước để làm lại.'); const ex=Q.ex(exId); (S.session.undo[exId]=S.session.undo[exId]||[]).push(U.clone(ex.draft)); const nx=st.pop();
  S.commit(()=>{ const rev=(ex.draft.rev||0)+1; ex.draft=nx; ex.draft.rev=rev; S.session.loadedRev[exId]=rev; WS.audit('Làm lại','exercise',exId); }); toast('Đã làm lại.'); };

A.done = (exId, wsId, skipConfirm) => {
  const ex = Q.ex(exId); const ws = wsId && Q.ws(wsId);
  const c = R.canDone(ex, me(), ws);
  if(!c.ok){ if(c.withdraw) return A.askWithdraw(ws, ()=>A.done(exId,wsId)); toast(c.reason, {err:!c.already}); return false; }
  const doIt = () => {
    S.commit(()=>{
      const no = ex.versions.length+1;
      ex.versions.push({no, snapshot:U.clone(ex.draft), doneAt:Date.now(), doneBy:me().id, standardRef:U.clone(ex.standardRef)});
      if(ws) ws.items.forEach(it=>{ if(it.exerciseId===ex.id) it.pinnedVersionNo=no; });
      WS.audit('Done','exercise',ex.id,{after:'v'+no});
      if(ws && ws.status==='reviewing' && ws.authorId!==me().id){ WS.notify(ws.authorId, `${me().name} đã sửa và Done "${ex.draft.title}" trong phiếu "${ws.title}".`, '#/phieu/'+ws.id); }
    });
    toast(`Đã Done "${ex.draft.title}" · v${ex.versions.length}.`);
  };
  if(c.needConfirm && !skipConfirm){
    WS.UI.confirm({title:'Done khi còn cảnh báo?', body:`<p>Bài còn ${c.validation.warnings.length} cảnh báo:</p><ul style="margin:0 0 0 18px">${c.validation.warnings.slice(0,6).map(w=>`<li><b>${w.code}</b> ${U.esc(w.msg)}</li>`).join('')}</ul><p class="muted">Cảnh báo không chặn Done. Bạn xác nhận đã đọc?</p>`, ok:'Đã đọc, Done'}).then(v=>{ if(v) doIt(); });
  } else doIt();
  return true;
};
A.restoreVersion = (exId, no, wsId) => { const v=R.version(Q.ex(exId),no); if(!v) return; A.editEx(exId, d=>{ const rev=d.rev; Object.assign(d, U.clone(v.snapshot)); d.rev=rev; }, {wsId, label:`Khôi phục v${no}`}) && toast(`Đã khôi phục nội dung v${no} vào bản nháp. Bấm Done để tạo mốc mới.`); };

A.setExStatus = (exId, status) => { const ex=Q.ex(exId); if(ex.ownerId!==me().id && me().role!=='l2') return toast('Chỉ chủ bài hoặc quản lý đổi trạng thái bài.', {err:true});
  const prev = ex.status; S.commit(()=>{ ex.status=status; WS.audit({rejected:'Không hài lòng/Loại', archived:'Lưu trữ', active:'Khôi phục'}[status],'exercise',exId,{before:prev, after:status}); });
  toast({rejected:'Đã đánh dấu Loại. Bài vẫn nằm trong kho (tab Loại & Lưu trữ).', archived:'Đã lưu trữ bài.', active:'Đã khôi phục bài về Nháp.'}[status], {undo:()=>S.commit(()=>{ ex.status=prev; })}); };

A.cloneEx = (exId, o={}) => {
  const src = Q.ex(exId); const last = R.lastDone(src);
  const ex = {id:U.uid('ex'), type:src.type, ownerId:me().id, scope:U.clone(src.scope), themeId:src.themeId, status:'active', draft:U.clone(last && !o.useDraft ? last.snapshot : src.draft), versions:[],
    origin:{kind:o.derived?'derived':'clone', fromId:src.id, fromVersion:last?last.no:null}, standardRef:U.clone(src.standardRef), tags:(src.tags||[]).slice(), genLog:[], createdAt:Date.now(), updatedAt:Date.now()};
  ex.draft.rev=1; ex.draft.questions.forEach(q=>q.id=U.uid('q'));
  if(o.keepMedia===false) ex.draft.media=[];
  S.commit(()=>{ S.state.exercises.push(ex); WS.audit(o.derived?'Tạo bản phát sinh':'Nhân bản','exercise',ex.id,{note:'từ '+src.id});
    if(o.wsId && o.replaceItemId){ const ws=Q.ws(o.wsId); const it=ws.items.find(i=>i.id===o.replaceItemId); if(it){ it.exerciseId=ex.id; it.pinnedVersionNo=null; it.local=!!o.local; WS.audit('Thay bài bằng bản sao','worksheet',ws.id); } }
  });
  return ex;
};
A.saveLocalToLib = (wsId, itemId) => { const ws=Q.ws(wsId); const it=ws.items.find(i=>i.id===itemId); S.commit(()=>{ it.local=false; WS.audit('Lưu vào kho','exercise',it.exerciseId); }); toast('Đã chuyển bản riêng thành bài trong kho chung.'); };

/* ---------- worksheet items ---------- */
A.wsEditGuard = (ws, then) => { const p=R.canEditWs(ws, me()); if(p.ok) return true; if(p.withdraw){ A.askWithdraw(ws, then); return false; } toast(p.reason, {err:true}); return false; };
A.addItem = (wsId, exId, at) => { const ws=Q.ws(wsId); const ex=Q.ex(exId); if(!A.wsEditGuard(ws, ()=>A.addItem(wsId,exId,at))) return;
  const last=R.lastDone(ex); S.commit(()=>{ const it={id:U.uid('it'), exerciseId:exId, pinnedVersionNo:last?last.no:null, local:false, layout:null}; if(at==null) ws.items.push(it); else ws.items.splice(at,0,it); ws.updatedAt=Date.now(); WS.audit('Ghim bài vào phiếu','worksheet',ws.id,{note:`${exId}${last?' v'+last.no:''}`}); }); };
A.removeItem = (wsId, itemId) => { const ws=Q.ws(wsId); if(!A.wsEditGuard(ws, ()=>A.removeItem(wsId,itemId))) return; const idx=ws.items.findIndex(i=>i.id===itemId); const it=ws.items[idx]; const ex=Q.ex(it.exerciseId);
  WS.UI.confirm({title:'Xóa bài khỏi phiếu?', body:`<p>Sẽ bỏ <b>Bài ${idx+1} "${U.esc(ex.draft.title)}"</b> khỏi phiếu này. Giữ nguyên: bài vẫn nằm trong Kho bài và các phiếu khác.</p>`, ok:'Xóa khỏi phiếu', danger:true}).then(v=>{ if(!v) return;
    S.commit(()=>{ ws.items.splice(idx,1); WS.audit('Xóa bài khỏi phiếu','worksheet',ws.id,{note:ex.id}); });
    toast('Đã xóa bài khỏi phiếu.', {undo:()=>S.commit(()=>{ ws.items.splice(idx,0,it); })}); }); };
A.moveItem = (wsId, itemId, dir) => { const ws=Q.ws(wsId); if(!A.wsEditGuard(ws)) return; const i=ws.items.findIndex(x=>x.id===itemId), j=i+dir; if(j<0||j>=ws.items.length) return;
  S.commit(()=>{ const t=ws.items[i]; ws.items[i]=ws.items[j]; ws.items[j]=t; WS.audit('Đổi thứ tự bài','worksheet',ws.id); }); };
A.setItemLayout = (wsId, itemId, layout) => { const ws=Q.ws(wsId); const it=ws.items.find(i=>i.id===itemId); const ex=Q.ex(it.exerciseId);
  A.editEx(ex.id, d=>{ d.layout=layout; }, {wsId, label:'Đổi bố cục hiển thị '+layout}); };
A.pinUpdate = (wsId, itemId, mode) => { const ws=Q.ws(wsId); if(!A.wsEditGuard(ws)) return; const it=ws.items.find(i=>i.id===itemId); const ex=Q.ex(it.exerciseId);
  if(mode==='update'){ const old=it.pinnedVersionNo; S.commit(()=>{ it.pinnedVersionNo=R.lastDone(ex).no; WS.audit('Cập nhật bản ghim','worksheet',ws.id,{before:'v'+old, after:'v'+it.pinnedVersionNo}); }); toast(`Đã cập nhật lên v${it.pinnedVersionNo}.`); }
  else { A.cloneFromVersion(ws, it); } };
A.cloneFromVersion = (ws, it) => { // keep vN: make a local copy pinned to that content
  const ex=Q.ex(it.exerciseId); const v=R.version(ex,it.pinnedVersionNo);
  const c = A.cloneEx(ex.id, {}); S.commit(()=>{ c.draft=U.clone(v.snapshot); c.draft.rev=1; c.versions=[{no:1, snapshot:U.clone(v.snapshot), doneAt:Date.now(), doneBy:me().id, standardRef:U.clone(ex.standardRef)}]; it.exerciseId=c.id; it.pinnedVersionNo=1; it.local=true; WS.audit('Giữ bản ghim (tạo bản riêng)','worksheet',ws.id,{note:`v${v.no}`}); });
  toast(`Đã giữ v${v.no} dưới dạng bản riêng của phiếu.`); };

/* ---------- worksheet transitions ---------- */
const snap = (ws, label) => ws.versions.push({no:ws.versions.length+1, at:Date.now(), by:me().id, label, items:ws.items.map(i=>({exerciseId:i.exerciseId, pinnedVersionNo:i.pinnedVersionNo}))});
const l2s = () => WS.usersByRole('l2').filter(id=>id!==me().id);
A.askWithdraw = (ws, then) => {
  WS.UI.confirm({title:'Rút phiếu về Nháp?', body:`<p>Phiếu "${U.esc(ws.title)}" đang <b>Chờ duyệt</b>. Sửa phiếu sẽ rút phiếu về <b>Nháp</b> và gỡ khỏi hàng chờ của quản lý. Sau khi sửa xong, bạn cần bấm Duyệt cấp 1 lại.</p>`, ok:'Rút về Nháp và sửa'}).then(v=>{ if(!v) return; A.withdraw(ws.id); if(then) then(); });
};
A.withdraw = wsId => { const ws=Q.ws(wsId); const c=R.can('withdraw',ws); if(!c.ok) return toast(c.reason,{err:true}); S.commit(()=>{ ws.status='draft'; ws.updatedAt=Date.now(); WS.audit('Rút về Nháp','worksheet',ws.id); }); toast('Phiếu đã về Nháp.'); };
A.submit = wsId => { const ws=Q.ws(wsId); const c=R.can('submit',ws); if(!c.ok){ toast(c.reason,{err:true}); return false; }
  S.commit(()=>{ ws.status='pending'; ws.submittedAt=Date.now(); snap(ws,'Duyệt cấp 1'); ws.returned=null;
    WS.audit('Duyệt cấp 1','worksheet',ws.id); WS.notify(l2s(), `${me().name} gửi Duyệt cấp 1 phiếu "${ws.title}".`, '#/phieu/'+ws.id); });
  toast('Đã Duyệt cấp 1. Phiếu đang chờ quản lý duyệt cấp 2.'); return true; };
A.startReview = wsId => { const ws=Q.ws(wsId); const c=R.can('startReview',ws); if(!c.ok) return toast(c.reason,{err:true});
  S.commit(()=>{ ws.status='reviewing'; ws.reviewerId=me().id; WS.audit('Nhận xét duyệt','worksheet',ws.id); WS.notify(ws.authorId, `${me().name} đang xét phiếu "${ws.title}" của bạn.`, '#/phieu/'+ws.id); });
  S.session.ui.drawer = {open:true, tab:'notes'}; location.hash='#/phieu/'+ws.id; };
A.release = wsId => { const ws=Q.ws(wsId); const c=R.can('release',ws); if(!c.ok) return toast(c.reason,{err:true}); S.commit(()=>{ ws.status='pending'; ws.reviewerId=null; WS.audit('Nhả phiếu','worksheet',ws.id); }); toast('Đã nhả phiếu về Chờ duyệt.'); };
A.returnWs = wsId => { const ws=Q.ws(wsId); const c=R.can('return',ws); if(!c.ok) return toast(c.reason,{err:true});
  const open = R.openRequests(ws).length;
  WS.UI.prompt({title:'Trả lại phiếu cho người soạn', sub:`Phiếu sẽ về Nháp kèm ${open} note đề nghị sửa đang mở.`, label:'Note tổng hợp (bắt buộc)', multiline:true, required:true, requiredMsg:'Không thể Trả lại vì chưa có note tổng hợp. Hãy ghi rõ cần sửa gì.', placeholder:'Ví dụ: Bài 2 câu 3 dùng từ ngoài phạm vi; rút gọn hướng dẫn bài 1.', ok:'Trả lại', danger:true}).then(t=>{ if(!t) return;
    S.commit(()=>{ ws.status='draft'; ws.returned={by:me().id, at:Date.now(), summary:t}; ws.reviewerId=null; WS.audit('Trả lại','worksheet',ws.id,{note:t});
      WS.notify(ws.authorId, `${me().name} trả lại phiếu "${ws.title}" kèm ${open+1} note.`, '#/phieu/'+ws.id); });
    toast('Đã trả lại phiếu.'); location.hash='#/duyet'; }); };
A.approve = wsId => { const ws=Q.ws(wsId); const c=R.can('approve',ws); if(!c.ok) return toast(c.reason,{err:true});
  S.commit(()=>{ ws.status='approved'; ws.approvedAt=Date.now(); snap(ws,'Duyệt cấp 2'); WS.audit(c.self?'Duyệt cấp 2 (tự duyệt)':'Duyệt cấp 2','worksheet',ws.id);
    WS.notify(ws.authorId===me().id?[]:ws.authorId, `${me().name} đã Duyệt cấp 2 phiếu "${ws.title}". Bản chính thức đã mở để tải.`, '#/phieu/'+ws.id); });
  toast('Đã Duyệt cấp 2. Nút Tải bản chính thức đã mở.'); };
A.unlock = wsId => { const ws=Q.ws(wsId); const c=R.can('unlock',ws); if(!c.ok) return toast(c.reason,{err:true});
  WS.UI.prompt({title:'Mở khóa sửa phiếu đã duyệt', label:'Lý do (bắt buộc, ghi vào nhật ký)', required:true, requiredMsg:'Không thể Mở khóa sửa vì chưa nhập lý do.', placeholder:'Ví dụ: Sửa lỗi chính tả bài 3 theo phản hồi giáo viên.', ok:'Mở khóa sửa'}).then(t=>{ if(!t) return;
    S.commit(()=>{ ws.prevStatus=ws.status; ws.status='unlocked'; ws.unlock={by:me().id, reason:t, at:Date.now()}; WS.audit('Mở khóa sửa','worksheet',ws.id,{note:t}); WS.notify(ws.authorId, `${me().name} mở khóa sửa phiếu "${ws.title}": ${t}`, '#/phieu/'+ws.id); });
    toast('Đã mở khóa sửa. Sửa xong hãy bấm Hoàn tất sửa.'); }); };
A.finishUnlock = wsId => { const ws=Q.ws(wsId); const c=R.can('finishUnlock',ws); if(!c.ok) return toast(c.reason,{err:true});
  S.commit(()=>{ ws.status='pending'; ws.versionNo++; snap(ws,'Hoàn tất sửa'); ws.unlock=null; ws.reviewerId=null; WS.audit('Hoàn tất sửa','worksheet',ws.id); WS.notify(l2s().concat(ws.authorId), `Phiếu "${ws.title}" đã sửa xong, quay lại Chờ duyệt (v${ws.versionNo}).`, '#/phieu/'+ws.id); });
  toast('Phiếu đã về Chờ duyệt.'); };
A.archiveWs = wsId => { const ws=Q.ws(wsId); const c=R.can('archive',ws); if(!c.ok) return toast(c.reason,{err:true}); S.commit(()=>{ ws.status='archived'; WS.audit('Lưu trữ phiếu','worksheet',ws.id); }); };
A.markPublished = (ws, kinds) => { S.commit(()=>{ const first = ws.status==='approved'; if(first){ ws.status='published'; } ws.publishedVersion=ws.versionNo; ws.exportedAt=Date.now(); WS.audit('Xuất bản (tải '+kinds.join(' + ')+')','worksheet',ws.id,{note:'v'+ws.versionNo}); }); };

/* ---------- notes ---------- */
A.addNote = (wsId, targetType, targetId, exId, kind, text) => { const ws=Q.ws(wsId);
  S.commit(()=>{ S.state.notes.push({id:U.uid('nt'), wsId, targetType, targetId, exId, authorId:me().id, kind, text, status:'open', at:Date.now()}); WS.audit(kind==='request'?'Thêm note đề nghị sửa':'Thêm ghi chú','worksheet',wsId,{note:text}); }); };
A.resolveNote = (id, v=true) => { const n=S.state.notes.find(x=>x.id===id); S.commit(()=>{ n.status=v?'resolved':'open'; n.resolvedBy=me().id; WS.audit(v?'Đánh dấu note đã xử lý':'Mở lại note','worksheet',n.wsId); }); };

/* ---------- create exercises from generation ---------- */
A.newExerciseFrom = (lessonId, type, gen, o={}) => {
  const x = Q.lessonCtx(lessonId); const std=Q.standard(type);
  const ex = {id:U.uid('ex'), type, ownerId:me().id, scope:{curriculumId:x.c.id, curriculumVersion:x.c.version, levelId:x.l.id, unitId:x.u.id, lessonIds:[lessonId]}, themeId:o.themeId||null, status:'active',
    draft:gen.draft, versions:[], origin:{kind:o.origin||'ai', fromId:o.fromId||null}, standardRef:{id:std.id, version:std.version}, tags:[], genLog:gen.log||[], createdAt:Date.now(), updatedAt:Date.now()};
  ex.draft.rev=1; S.state.exercises.push(ex); return ex;
};

/* lock simulation helpers for demo */
A.simulateOpenBy = (exId, userId='minh') => { S.commit(()=>{ S.state.locks=S.state.locks.filter(l=>l.exerciseId!==exId); S.state.locks.push({exerciseId:exId, userId, lastActive:Date.now()}); WS.audit('Giả lập: '+Q.user(userId).name+' mở bài','exercise',exId); }); };
A.simulateSaveBy = (exId, userId='minh') => { const ex=Q.ex(exId); S.commit(()=>{ ex.draft.rev=(ex.draft.rev||0)+1; ex.draft.updatedBy=userId; ex.draft.instruction = ex.draft.instruction.replace(/\s*$/,'')+(ex.draft.instruction.endsWith(' ')?'':' '); WS.audit('Giả lập: '+Q.user(userId).name+' lưu bản mới','exercise',exId,{note:'rev '+ex.draft.rev}); }); };
A.expireLocks = () => S.commit(()=>{ S.state.locks.forEach(l=>l.lastActive=0); WS.audit('Tua thời gian: khóa mềm hết hạn','system',''); });
A.forceUnlock = exId => { if(me().role!=='l2') return toast('Chỉ quản lý cấp 2 gỡ được khóa của người khác.', {err:true}); S.commit(()=>{ S.state.locks=S.state.locks.filter(l=>l.exerciseId!==exId); WS.audit('Gỡ khóa mềm','exercise',exId); }); toast('Đã gỡ khóa mềm.'); };
