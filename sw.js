/* Service Worker：离线缓存应用外壳，使安卓可「添加到主屏幕」安装使用 */
var CACHE = 'webnav-v2';
var ASSETS = [
  './',
  'index.html',
  'grapher.html',
  'manifest.webmanifest',
  'assets/css/style.css',
  'assets/css/home.css',
  'assets/js/lib/math.js',
  'assets/js/storage.js',
  'assets/js/grapher.js',
  'assets/js/app.js',
  'assets/js/home.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        // 动态缓存新请求（同源）
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        if (req.mode === 'navigate') return caches.match('index.html');
        return cached;
      });
    })
  );
});
