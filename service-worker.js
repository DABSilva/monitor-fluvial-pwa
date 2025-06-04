const CACHE_NAME = 'fluvial-monitor-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    // Adicione URLs de ícones aqui, se você os tiver em um diretório /icons
    // Exemplo: '/icons/icon-192x192.png',
    // '/icons/icon-512x512.png',
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
    // Para solicitações de dados da API OpenWeatherMap, use Network First
    if (event.request.url.includes('api.openweathermap.org')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Se a resposta for válida, clone-a e armazene no cache
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // Se a rede falhar, tente buscar do cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Para outros recursos (app shell), use Cache First
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response; // Retorna do cache se encontrado
                    }
                    return fetch(event.request); // Caso contrário, busca da rede
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
