// Blockworld offline support: serve the game from the cache, refresh it in the background.
const CACHE = "blockworld-v3";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png",
  "three.min.js", "press-start-2p.woff2", "vt323.woff2"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
