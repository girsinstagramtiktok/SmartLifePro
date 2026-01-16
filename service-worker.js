/* =========================================
   SMART LIFE PRO - SERVICE WORKER (V7.5 - STRICT NETWORK FIRST)
   Estrategia: Network First con Validación Forzada
   ========================================= */

const CACHE_NAME = 'smart-life-pro-v7.5-update'; // Versión actualizada
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

// 1. INSTALACIÓN: Pre-carga inicial
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Activar inmediatamente
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Instalando v6.8 y cacheando assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVACIÓN: Limpieza de versiones previas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Eliminando caché antigua:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      console.log('[SW] v6.8 Activo y controlando clientes.');
      return self.clients.claim();
    })
  );
});

// 3. INTERCEPTOR (Estrategia: Network First Estricta)
self.addEventListener('fetch', (e) => {
  // Solo interceptamos peticiones GET (evita errores con POST/PUT en APIs externas si las hubiera)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    (async () => {
      try {
        // A. INTENTO DE RED (Prioridad Máxima)
        // Usamos { cache: 'reload' } para forzar la verificación en el servidor 
        // y evitar que el navegador nos devuelva un 304 desde su caché de memoria/disco.
        const networkResponse = await fetch(e.request, { cache: 'reload' });

        // Si la respuesta es válida, actualizamos la caché del SW
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          // Clonamos la respuesta porque el stream solo se puede consumir una vez
          cache.put(e.request, networkResponse.clone());
        }

        return networkResponse;

      } catch (error) {
        // B. FALLBACK A CACHÉ (Si no hay internet)
        console.log('[SW] Offline o error de red. Usando caché para:', e.request.url);
        
        const cachedResponse = await caches.match(e.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }

        // C. SI NO HAY RED NI CACHÉ (Opcional: Página de error offline)
        // Aquí podrías retornar una página offline.html genérica si quisieras.
        // Por ahora retornamos nada (el navegador mostrará error de conexión estándar).
      }
    })()
  );
});
