const CACHE_NAME = 'sarangbar-v1.3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './firebase.js',
  './app.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// Instal dan simpan cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache PWA berhasil disimpan.');
      return cache.addAll(ASSETS);
    })
  );
});

// Strategi: Utamakan Internet (Network First), jika gagal (offline) pakai Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});



