const CACHE_NAME = 'calendar-6b-v7'; // ⚠️ УВЕЛИЧЬТЕ ВЕРСИЮ
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Установка
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => {
        console.error('❌ Ошибка кэширования:', err);
        // Не блокируем установку при ошибке
      })
  );
  self.skipWaiting();
});

// Активация — чистим старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => 
      Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Запросы: сеть с запасным кэшем (надёжнее, чем "только кэш")
self.addEventListener('fetch', event => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Клонируем и сохраняем свежий ответ в кэш
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Если сеть недоступна — отдаём из кэша
        return caches.match(event.request);
      })
  );
});
