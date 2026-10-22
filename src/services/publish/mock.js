/* Đẩy phiếu sang hệ thống chuyên dụng: bản giả lập. Lần đầu có 25% thất bại để thử nút Thử lại. */
export const mockPublishService = {
  kind: 'mock',
  push(ws, { attempt, netFail }){
    return new Promise(resolve => setTimeout(() => resolve({ ok: !(netFail || attempt===1 && Math.random()<0.25) }), 700));
  },
};
