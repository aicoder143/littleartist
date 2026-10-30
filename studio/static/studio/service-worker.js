// Bump the cache version when shipping updated app-shell files.
const CACHE = 'little-artist-shell-v18';
const BASE = new URL('.', self.registration.scope).pathname;
const at = path => `${BASE}${path}`;
const SHELL = [at("about/"), at("our-story/"), at("manifest.webmanifest"), at("static/studio/device.js"), `${at("static/studio/lessons.js")}?v=storybook-myth-assets-2`, at("static/studio/style.css"), at("static/studio/fonts.css"), `${at("static/studio/playful.css")}?v=watercolor-studio-2`, at("static/studio/about.css"), at("static/studio/story.css"), at("static/studio/account.css"), at("static/studio/about.js"), `${at("static/studio/app.js")}?v=watercolor-studio-2`, at("static/studio/assets/sunflower.jpg"), at("static/studio/assets/turtle.jpg"), at("static/studio/assets/comfortaa-0.woff2"), at("static/studio/assets/quicksand-2.woff2"), at("static/studio/assets/quicksand-0.woff2"), at("static/studio/assets/symbols-0.woff2"), at("static/studio/assets/icon-192.png"), at("static/studio/assets/quicksand-1.woff2"), at("static/studio/assets/icon-180.png"), at("static/studio/assets/comfortaa-1.woff2"), at("static/studio/assets/cat.jpg"), at("static/studio/assets/ishan-granny.jpg"), at("static/studio/assets/icon-512.png"), at("static/studio/assets/myth-ram.webp"), at("static/studio/assets/myth-sita.webp"), at("static/studio/assets/myth-lakshman.webp"), at("static/studio/assets/myth-krishna.webp"), at("static/studio/assets/myth-shiva.webp"), at("static/studio/assets/myth-ganesha.webp"), at("static/studio/assets/myth-hanuman.webp"), at("static/studio/assets/myth-saraswati.webp"), at("static/studio/assets/myth-durga.webp"), at("static/studio/assets/myth-kartikeya.webp")];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('little-artist-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if(request.method !== 'GET' || url.origin !== self.location.origin || !(url.pathname === BASE || url.pathname === at('about/') || url.pathname === at('our-story/') || url.pathname === at('manifest.webmanifest') || url.pathname.startsWith(at('static/studio/')))) return;
  // Network first avoids stale lessons while retaining an offline fallback.
  event.respondWith(fetch(request).then(response => {
    if(response.ok && !/no-store/i.test(response.headers.get('Cache-Control') || '')) {const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}
    return response;
  }).catch(async()=>{const cached=await caches.match(request);return cached || new Response('Offline. Open Little Artist online once to download its lessons.',{status:503,headers:{'Content-Type':'text/plain'}});}));
});
