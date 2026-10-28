/* Smarty OTA: cliente integrado, preparado para funcionar sin Vercel */
(function () {
  'use strict';
  if (window.__smartyOtaClientInstalled) return;
  window.__smartyOtaClientInstalled = true;
  var busy = false;
  var REPO = 'girsinstagramtiktok/SmartLifePro';
  var RELEASES_URL = 'https://api.github.com/repos/' + REPO + '/releases?per_page=30';
  var VERSION_RE = /^ota-[a-f0-9]{12}$/i;

  function inform(message, isError) {
    var text = String(message || '');
    var button = document.querySelector('button[onclick*="checkForOtaUpdateNow"]');
    if (button) {
      var pane = document.getElementById('smarty-ota-rescue-status');
      if (!pane || !pane.isConnected) {
        pane = document.createElement('div');
        pane.id = 'smarty-ota-rescue-status';
        pane.setAttribute('role', 'status');
        pane.setAttribute('aria-live', 'polite');
        pane.style.cssText = 'padding:10px 12px;margin:0 0 12px;border-radius:10px;font-size:12px;line-height:1.5;overflow-wrap:anywhere;';
        button.insertAdjacentElement('afterend', pane);
      }
      pane.style.background = isError ? 'rgba(220,38,38,.12)' : 'rgba(75,135,160,.15)';
      pane.style.color = isError ? 'var(--danger,#d22)' : 'var(--text-color,inherit)';
      pane.textContent = text;
    }
    console[isError ? 'error' : 'info']('[Smarty OTA]', text);
  }

  function chooseOta(releases) {
    if (!Array.isArray(releases)) throw new Error('Respuesta incorrecta de GitHub Releases.');
    var candidates = releases.filter(function (release) {
      return !release.draft && !release.prerelease && VERSION_RE.test(release.tag_name || '') &&
        Array.isArray(release.assets) && release.assets.some(function (asset) {
          return asset.name === 'smarty-web.zip' && Number(asset.size) > 512;
        });
    });
    if (!candidates.length) throw new Error('No existe un Release OTA publico con smarty-web.zip. Comprueba GitHub > Releases.');
    candidates.sort(function (a, b) {
      return Date.parse(b.published_at || b.created_at || 0) - Date.parse(a.published_at || a.created_at || 0);
    });
    var r = candidates[0];
    // Construir la direccion de descarga desde un origen fijo, no desde datos arbitrarios de la API.
    return {
      version: r.tag_name,
      url: 'https://github.com/' + REPO + '/releases/download/' + r.tag_name + '/smarty-web.zip'
    };
  }

  async function check() {
    if (busy) { inform('Ya hay una comprobacion o descarga en curso.'); return; }
    var plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater;
    if (!plugin || typeof plugin.current !== 'function' || typeof plugin.download !== 'function' || typeof plugin.set !== 'function') {
      inform('Capacitor Updater no esta disponible en este APK. La version web no puede instalarlo.', true);
      return;
    }
    busy = true;
    var timer;
    try {
      inform('Buscando paquetes OTA en GitHub Releases...');
      var controller = typeof AbortController === 'function' ? new AbortController() : null;
      if (controller) timer = setTimeout(function () { controller.abort(); }, 20000);
      var response = await fetch(RELEASES_URL, {
        cache: 'no-store',
        headers: { 'Accept': 'application/vnd.github+json' },
        ...(controller ? { signal: controller.signal } : {})
      });
      if (response.status === 404) throw new Error('GitHub devuelve 404. Comprueba que el repositorio y sus Releases sean publicos.');
      if (!response.ok) throw new Error('GitHub devuelve HTTP ' + response.status + '.');
      var release = chooseOta(await response.json());
      var current = await plugin.current();
      var version = current && current.bundle && current.bundle.version || '';
      if (version === release.version) {
        inform('Smarty ya tiene instalada la version OTA ' + release.version + '.');
        return;
      }
      inform('Nueva version ' + release.version + '. Descargando el paquete...');
      var bundle = await plugin.download(release);
      if (!bundle || !bundle.id) throw new Error('Android no devolvio un paquete descargado valido.');
      inform('Paquete descargado. Aplicando cambios y reiniciando Smarty...');
      await plugin.set(bundle);
    } catch (error) {
      var msg = error && error.name === 'AbortError' ? 'La conexion con GitHub excedio 20 segundos.' :
        (error && error.message || String(error));
      inform('La actualizacion no se pudo completar: ' + msg, true);
    } finally {
      if (timer) clearTimeout(timer);
      busy = false;
    }
  }

  // En el APK antiguo ota-client.js intercepta el clic en la fase de captura de document.
  // Escuchar en window (que recibe la captura antes de document) permite rescatarlo desde Vercel.
  window.addEventListener('click', function (event) {
    var target = event.target;
    var button = target && target.closest && target.closest('button[onclick*="checkForOtaUpdateNow"]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    check();
  }, true);
  window.checkForOtaUpdateNow = check;
  window.SmartyLiveUpdate = { check: check, chooseOta: chooseOta };
  var plugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater;
  if (plugin && typeof plugin.notifyAppReady === 'function') {
    Promise.resolve(plugin.notifyAppReady()).catch(function (err) { console.error('[Smarty OTA] AppReady', err); });
  }
})();
