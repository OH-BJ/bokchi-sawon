// 오프라인 캐시. 파일을 수정해 배포할 때는 VERSION을 올리면 새로 받는다.
const VERSION = 'bokchi-v3';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './css/base.css', './css/game.css', './css/ui.css',
  './js/core/ns.js', './js/core/util.js', './js/core/storage.js', './js/core/audio.js',
  './js/data/ranks.js', './js/data/tasks.js', './js/data/upgrades.js', './js/data/projects.js',
  './js/data/deaths.js', './js/data/events.js', './js/data/endings.js',
  './js/systems/economy.js', './js/systems/state.js', './js/systems/rules.js',
  './js/ui/character.js', './js/ui/hud.js', './js/ui/office.js', './js/ui/modals.js',
  './js/ui/minigames.js', './js/ui/sharecard.js', './js/main.js',
  './assets/icons/icon.svg', './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패하면 캐시 (업데이트가 바로 반영되도록)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
