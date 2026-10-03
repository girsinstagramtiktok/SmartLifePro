/* =========================================
   SMART LIFE PRO - SERVICE WORKER (V11.0 - INSTANT LOAD)
   Estrategia: Stale-While-Revalidate (Carga Rápida + Update Background)
   Autor: A_True_Alpha
   ========================================= */

const CACHE_NAME = 'smart-life-pro-v11.39-polished-ui'; // Nombre actualizado para forzar limpieza
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

// 1. INSTALACIÓN: Cachear todo lo esencial
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forzar activación inmediata
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando archivos del sistema...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVACIÓN: Limpiar versiones viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Borrando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Tomar control de inmediato
});

// 3. INTERCEPTAR PETICIONES (Estrategia de Velocidad)
self.addEventListener('fetch', (e) => {
  // Ignorar peticiones que no sean GET (APIs, POSTs, etc.)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    (async () => {
      // A. Buscar en Caché primero (Velocidad Inmediata)
      const cachedResponse = await caches.match(e.request);

      // B. Fetch de red en paralelo (Para actualizar caché a futuro)
      const networkFetch = fetch(e.request).then((networkResponse) => {
        // Si la red responde bien, actualizamos la caché
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Si falla la red, no pasa nada, ya tenemos la caché
        // console.log('[SW] Modo offline activo');
      });

      // C. Lógica de respuesta:
      // Si tenemos caché, la devolvemos YA (la app carga instantáneo).
      // El fetch de red actualizará la caché para la *próxima* vez que abras la app.
      return cachedResponse || networkFetch;
    })()
  );
});

// 4. MENSAJERÍA: Permitir al usuario forzar actualización manual
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});






