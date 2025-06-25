const CACHE_NAME = 'fluvial-monitor-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {  
    if (event.request.url.includes('api.openweathermap.org')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {                 
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {                    
                    return caches.match(event.request);
                })
        );
    } else {     
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response; 
                    }
                    return fetch(event.request); 
                })
        );
    }
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
