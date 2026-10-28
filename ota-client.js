/* Smarty Live Update v2 — un único mecanismo OTA para APK Capacitor 6.
 * Paquetes: GitHub Releases públicos (smarty-web.zip). No se ejecuta JS remoto desde Vercel.
 * API y lógica de versiones comprobadas por ota-tests.cjs y ota-integration-tests.cjs.
 */
(function () {
  'use strict';

  const DEFAULT_REPOSITORY = 'girsinstagramtiktok/SmartLifePro';
  const ZIP_NAME = 'smarty-web.zip';
  const TAG_PATTERN = /^ota-[0-9a-f]{12}$/;
  let busy = false;

  function repositoryName() {
    return String(window.SMARTY_OTA_REPOSITORY || DEFAULT_REPOSITORY).trim();
  }
  function plugin() {
    return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater;
  }
  function visibleStatus(message, error) {
    const text = String(message || '');
    const button = document.querySelector('button[onclick*="checkForOtaUpdateNow"]');
    if (button) {
      let status = document.getElementById('smarty-ota-status');
      if (!status) {
        status = document.createElement('div');
        status.id = 'smarty-ota-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.style.cssText = 'font-size:12px;line-height:1.5;padding:10px 12px;margin:0 0 12px;border-radius:10px;white-space:normal;overflow-wrap:anywhere;';
      }
      if (status.previousElementSibling !== button) button.insertAdjacentElement('afterend', status);
      status.style.background = error ? 'rgba(220,38,38,.13)' : 'rgba(36,130,170,.12)';
      status.style.color = error ? 'var(--danger,#b91c1c)' : 'var(--text-color,inherit)';
      status.textContent = text;
    }
    if (console && typeof console[error ? 'error' : 'info'] === 'function') {
      console[error ? 'error' : 'info']('[Smarty OTA]', text);
    }
  }

  function getReleaseAsset(release, repository) {
    if (!release || release.draft || release.prerelease || !TAG_PATTERN.test(release.tag_name || '')) return null;
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '')) return null;
    const asset = Array.isArray(release.assets) ? release.assets.find(item => item.name === ZIP_NAME) : null;
    if (!asset || !Number.isFinite(Number(asset.size)) || Number(asset.size) < 512) return null;
    const url = `https://github.com/${repository}/releases/download/${release.tag_name}/${ZIP_NAME}`;
    // Rechazar cualquier URL arbitraria; solo descargar del repositorio configurado.
    if (asset.browser_download_url !== url) return null;
    // Capgo espera identificadores de versión compatibles con SemVer.
    return { version: `1.0.0-${release.tag_name.slice(4)}`, url };
  }

  function chooseLatestOta(releases, repository) {
    if (!Array.isArray(releases)) throw new Error('GitHub devolvió una lista de versiones inválida.');
    const matches = releases.map(r => ({release:r, asset:getReleaseAsset(r,repository)}))
      .filter(item => item.asset);
    matches.sort((a,b) => Date.parse(b.release.published_at || b.release.created_at || 0) -
      Date.parse(a.release.published_at || a.release.created_at || 0));
    return matches.length ? matches[0].asset : null;
  }

  async function clearLegacyNativeCache() {
    if (!(window.Capacitor?.isNativePlatform?.() || window.SmartyAndroid)) return;
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister()));
      }
      if ('caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.filter(key => /^smart-life-pro/i.test(key)).map(key => window.caches.delete(key)));
      }
    } catch (e) { console.warn('[Smarty OTA] Limpieza de caché:', e); }
  }

  async function check() {
    if (busy) { visibleStatus('La búsqueda o descarga ya está en curso.'); return; }
    const installed = plugin();
    if (!installed || ['current','download','set'].some(fn => typeof installed[fn] !== 'function')) {
      visibleStatus('No se detectó el complemento nativo OTA. El APK debe incorporar Capacitor Updater.', true);
      return;
    }
    const repository = repositoryName();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) {
      visibleStatus('Nombre de repositorio OTA incorrecto.', true);
      return;
    }
    busy = true;
    let timer;
    try {
      visibleStatus('Consultando actualizaciones de Smarty en GitHub...');
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      if (controller) timer = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(`https://api.github.com/repos/${repository}/releases?per_page=50`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/vnd.github+json' },
        ...(controller ? { signal: controller.signal } : {})
      });
      if (!response.ok) {
        if (response.status === 404) throw new Error('GitHub devuelve 404. Revisa que el repositorio y sus Releases sean públicos.');
        if (response.status === 403) throw new Error('GitHub ha limitado las consultas (HTTP 403). Reintenta más tarde.');
        throw new Error(`GitHub devolvió HTTP ${response.status}.`);
      }
      const update = chooseLatestOta(await response.json(), repository);
      if (!update) throw new Error('No hay ningún Release OTA válido con smarty-web.zip. Revisa Actions y Releases.');
      const current = await installed.current();
      if (current?.bundle?.version === update.version) {
        visibleStatus(`Smarty ya tiene instalada la última actualización (${update.version}).`);
        return;
      }
      visibleStatus(`Descargando ${update.version}...`);
      const bundle = await installed.download(update);
      if (!bundle || typeof bundle.id !== 'string' || !bundle.id) throw new Error('Android no confirmó la descarga del paquete.');
      await clearLegacyNativeCache();
      visibleStatus('Actualización descargada. Aplicando y reiniciando Smarty...');
      await installed.set({ id: bundle.id }); // API pública: set espera BundleId { id }
    } catch (err) {
      const reason = err?.name === 'AbortError' ? 'La conexión con GitHub superó 20 segundos.' : (err?.message || String(err));
      visibleStatus(`No se pudo actualizar: ${reason}`, true);
    } finally {
      if (timer) clearTimeout(timer);
      busy = false;
    }
  }

  function notifyReady() {
    const installed = plugin();
    if (typeof installed?.notifyAppReady !== 'function') return;
    Promise.resolve().then(() => installed.notifyAppReady())
      .catch(err => console.error('[Smarty OTA] Fallo al confirmar arranque:', err));
  }

  // Llamada estable desde el botón del complemento Smarty. No hay interceptores globales ni Vercel.
  window.SmartyLiveUpdate = { check, getReleaseAsset, chooseLatestOta, clearLegacyNativeCache };
  window.checkForOtaUpdateNow = check;
  if (document.readyState === 'complete') notifyReady();
  else window.addEventListener('load', notifyReady, { once:true });
  // Evita que los cachés de un service worker antiguo anulen los nuevos bundles nativos.
  clearLegacyNativeCache();
})();
