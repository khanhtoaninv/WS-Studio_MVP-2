/* Viewer là script cổ điển dùng chung: chạy trong app và được nhúng nguyên văn vào tệp HTML xuất ra. */
import VIEWER_JS from './viewer.js?raw';
import VIEWER_CSS from './viewer.css?raw';
export { VIEWER_JS, VIEWER_CSS };

export function installViewer(doc = document){
  const st = doc.createElement('style'); st.id = 'wsv-css'; st.textContent = VIEWER_CSS; doc.head.appendChild(st);
  const sc = doc.createElement('script'); sc.id = 'wsv-js'; sc.textContent = VIEWER_JS; doc.head.appendChild(sc);
}
