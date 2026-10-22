/* Phiên "Làm bài trên lớp" (D-129). Lưu tạm trong bộ nhớ máy chủ: tắt máy chủ là mất.
   Giáo viên giữ token phiên; học sinh chỉ có mã phiên và mã cá nhân, không bao giờ nhận đáp án. */
import os from 'node:os';
import crypto from 'node:crypto';
import { splitPaper, summarize, scoreStudent, newCode } from '../src/shared/classroom.js';

const sessions = new Map();          // mã phiên → phiên
const MAX_STUDENTS = 200;
const fail = (status, msg) => Object.assign(new Error(msg), { status });

export function lanUrls(port){
  return Object.values(os.networkInterfaces()).flat()
    .filter(a => a && a.family === 'IPv4' && !a.internal).map(a => `http://${a.address}:${port}/lop`);
}

function teacherView(s, ctx){
  return {
    joinUrls: lanUrls(ctx.port), code: s.code, title: s.paper.meta.title, wsCode: s.paper.meta.code, createdAt: s.createdAt, endedAt: s.endedAt,
    paper: s.paper, key: s.key,
    students: [...s.students.values()].map(st => ({ sid: st.sid, code: st.code, name: st.name, joinedAt: st.joinedAt, submittedAt: st.submittedAt,
      lastSeen: st.lastSeen, answers: st.answers, result: scoreStudent(s.paper, s.key, st.answers) })),
    summary: summarize(s.paper, s.key, [...s.students.values()]),
  };
}
function getForTeacher(code, token){
  const s = sessions.get(String(code || '').toUpperCase());
  if(!s || s.token !== token) throw fail(404, 'Không tìm thấy phiên');
  return s;
}
function getForStudent(code){
  const s = sessions.get(String(code || '').trim().toUpperCase());
  if(!s) throw fail(404, 'Mã phiên không đúng. Hỏi lại giáo viên.');
  return s;
}

export const routes = {
  /* Giáo viên mở phiên: gửi dữ liệu phiếu bản giáo viên */
  'POST /api/class/sessions': (b, ctx) => {
    if(!b.data || !Array.isArray(b.data.items) || !b.data.items.length) throw fail(400, 'Phiếu không có bài');
    const { paper, key } = splitPaper(b.data);
    const code = newCode(4, c => sessions.has(c));
    const s = { code, token: crypto.randomUUID(), paper, key, createdAt: Date.now(), endedAt: null, students: new Map() };
    sessions.set(code, s);
    return { code, token: s.token, joinUrls: lanUrls(ctx.port) };
  },
  'POST /api/class/state': (b, ctx) => teacherView(getForTeacher(b.code, b.token), ctx),
  'POST /api/class/end': (b, ctx) => { const s = getForTeacher(b.code, b.token); s.endedAt = s.endedAt || Date.now(); return teacherView(s, ctx); },
  'POST /api/class/reopen': (b, ctx) => { const s = getForTeacher(b.code, b.token); s.endedAt = null; return teacherView(s, ctx); },

  /* Học sinh vào phiên: lần đầu bằng tên, vào lại bằng mã cá nhân */
  'POST /api/class/join': (b) => {
    const s = getForStudent(b.code);
    let st = b.studentCode && [...s.students.values()].find(x => x.code === String(b.studentCode).trim().toUpperCase());
    if(b.studentCode && !st) throw fail(404, 'Mã cá nhân không đúng.');
    if(!st){
      const name = String(b.name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if(!name) throw fail(400, 'Hãy nhập tên.');
      if(s.endedAt) throw fail(409, 'Phiên đã kết thúc.');
      if(s.students.size >= MAX_STUDENTS) throw fail(409, 'Phiên đã đủ người.');
      const taken = new Set([...s.students.values()].map(x => x.code));
      st = { sid: crypto.randomUUID(), code: newCode(4, c => taken.has(c)), name, joinedAt: Date.now(), submittedAt: null, lastSeen: Date.now(), answers: {} };
      s.students.set(st.sid, st);
    }
    st.lastSeen = Date.now();
    return { session: s.code, studentCode: st.code, name: st.name, paper: s.paper, answers: st.answers, submittedAt: st.submittedAt, ended: !!s.endedAt,
      result: (st.submittedAt || s.endedAt) ? scoreStudent(s.paper, s.key, st.answers) : null };
  },
  'POST /api/class/answer': (b) => {
    const s = getForStudent(b.code);
    const st = [...s.students.values()].find(x => x.code === String(b.studentCode || '').toUpperCase());
    if(!st) throw fail(404, 'Mã cá nhân không đúng.');
    st.lastSeen = Date.now();
    if(st.submittedAt) throw fail(409, 'Bạn đã nộp bài.');
    if(s.endedAt) throw fail(409, 'Phiên đã kết thúc, không nhận bài nữa.');
    const valid = new Set(s.paper.items.flatMap(it => it.questions.map(q => q.id)));
    for(const [qid, v] of Object.entries(b.answers || {})) if(valid.has(qid)) st.answers[qid] = String(v).slice(0, 300);
    if(b.submit) st.submittedAt = Date.now();
    return { saved: true, submittedAt: st.submittedAt, result: st.submittedAt ? scoreStudent(s.paper, s.key, st.answers) : null };
  },
};
