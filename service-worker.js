/* =========================================
   SMART LIFE PRO - SERVICE WORKER (V6.6 - FIX & UPDATE)
   Estrategia: Network First (Prioriza red para ver cambios)
   ========================================= */

const CACHE_NAME = 'smart-life-pro-v6.7-fix'; // <--- CAMBIO CRÍTICO: Nueva versión para invalidar la anterior
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './logo.png',
  
  // --- MÓDULOS JS ---
  './main.js',
  './data.js',
  './ui.js',
  './assistant.js',
  './finance.js',
  './shopping.js',

  // --- IMÁGENES DE FONDO ---
  './bg1.png',
  './bg2.png',
  './bg3.png',
  './bg4.png',
  './bg5.png',

  // --- IMÁGENES DE LA MASCOTA ---
  './idle.png',
  './happy.png',
  './worried.png',
  './alert.png',
  './thinking.png'
];

// 1. INSTALACIÓN: Cachear archivos críticos
self.addEventListener('install', (e) => {
  // Forzar activación inmediata (sin esperar a cerrar pestañas)
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando archivos V6.6...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVACIÓN: Limpieza agresiva de cachés viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Borrando caché antigua:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      // Tomar control inmediato de la página
      console.log('[Service Worker] V6.6 Activo y controlando.');
      return self.clients.claim();
    })
  );
});

// 3. INTERCEPTOR (Estrategia: Network First)
// Intenta bajar de internet siempre. Si falla (offline), usa caché.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Si la red responde, actualizamos la copia en caché y devolvemos el archivo fresco
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Si no hay internet, devolvemos lo que haya en caché
        return caches.match(e.request);
      })
  );
});
