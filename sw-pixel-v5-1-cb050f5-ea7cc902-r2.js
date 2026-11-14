const VERSION = 'pixel-v5-1-cb050f5-ea7cc902-r2';
const CACHE = 'dd-assets-' + VERSION;
self.addEventListener('message', e => { if (e.data?.type === 'VERSION') e.ports[0]?.postMessage({version:VERSION}); });
// Service worker: serves game assets (images/audio) that the loader unpacked
// from the base64 payload into Cache Storage. GitHub's file API only accepts
// text, so binaries ship as base64 and are rebuilt in the browser.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.includes('/assets/')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(url.origin + url.pathname, { ignoreSearch: true });
    if (!hit) return fetch(req);
    const range = req.headers.get('range');
    if (!range) return hit;
    const blob = await hit.blob();
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const size = blob.size;
    let start = m && m[1] ? parseInt(m[1], 10) : 0;
    let end = m && m[2] ? parseInt(m[2], 10) : size - 1;
    if (m && !m[1] && m[2]) { start = Math.max(0, size - parseInt(m[2], 10)); end = size - 1; }
    end = Math.min(end, size - 1);
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    return new Response(blob.slice(start, end + 1), {
      status: 206,
      headers: {
        'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(end - start + 1),
        'Accept-Ranges': 'bytes',
      },
    });
  })());
});

self.addEventListener('message', e => { if(e.data?.version !== VERSION)return; if(e.data.type==='CLAIM')e.waitUntil(self.clients.claim()); if(e.data.type==='SKIP_WAITING')e.waitUntil(self.skipWaiting()); });
