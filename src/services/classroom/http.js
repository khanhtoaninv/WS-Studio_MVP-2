/* Phiên làm bài trên lớp qua máy chủ của máy giáo viên (D-129). Sau này có backend thì thay tệp này,
   giữ nguyên các hàm: start, state, end, reopen. */
async function post(path, body){
  const res = await fetch(path, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if(!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
export const httpClassroomService = {
  kind: 'lan',
  start: (data, mode) => post('/api/class/sessions', { data, mode }),
  state: (s) => post('/api/class/state', s),
  end: (s) => post('/api/class/end', s),
  reopen: (s) => post('/api/class/reopen', s),
};
