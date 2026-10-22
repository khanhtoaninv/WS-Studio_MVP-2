/* Lưu trữ trong trình duyệt (localStorage). Ném lỗi khi bị chặn để store chuyển sang bộ nhớ tạm. */
export const localStorageService = {
  kind: 'local',
  load(key){ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; },
  save(key, state){ localStorage.setItem(key, JSON.stringify(state)); },
};
