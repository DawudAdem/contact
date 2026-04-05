/**
 * Al-Huda SIMS - Service Worker
 * Provides offline caching and PWA install support
 */

const CACHE_NAME = 'alhuda-sims-v1';
const STATIC_ASSETS = [
    '/sims/',
    '/sims/assets/css/app.css',
    '/sims/assets/css/skeleton.css',
    '/sims/assets/js/app.js',
    '/sims/assets/js/sidebar.js',
    '/sims/assets/js/skeleton.js',
    '/sims/assets/js/dashboard.js',
    '/sims/assets/js/students.js',
    '/sims/assets/js/staff.js',
    '/sims/assets/js/performance.js',
    '/sims/assets/js/subjects.js',
    '/sims/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
];

// Install - Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('Some assets failed to cache:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch - Network first, fall back to cache for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests and API calls
    if (request.method !== 'GET' || request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone and cache successful responses
                if (response.ok) {
                    const cloned = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, cloned);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fall back to cache
                return caches.match(request).then((cached) => {
                    return cached || new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                    });
                });
            })
    );
});
