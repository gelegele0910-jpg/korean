// 호야 韓語的 service worker：只為了讓 Android Chrome 把網站當成 App 安裝（桌面圖示不會有 Chrome 小標誌）。
// 不做任何快取：網頁照常從網路讀取，更新後馬上就是新版；只處理網頁本身的開啟。
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') e.respondWith(fetch(e.request));
});
