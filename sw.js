// utilizzo cacheName per cache versioning
var cacheName = 'v4:static';

// installazione: metto in cache elementi statici (per funzionamento offline)
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll([
                './',
                './css/style.css',
		'./js/main.js',
                './css/fonts/roboto.woff'
            ]).then(function() {
                self.skipWaiting();
            });
        })
    );
});

// quando il browser legge un url
self.addEventListener('fetch', function(event) {
    // ritorno oggetto cachato, oppure eseguo normalmente il fetching
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                // prendo da cache
                return response;
            }
            // fetch normale
            return fetch(event.request);
        })
    );
});
