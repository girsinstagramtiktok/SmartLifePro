/* SmartLifePro: descarga APK firmado/verificado y abre el instalador nativo.
 * Conserva el APK en Descargas/SmartLifePro para instalación manual de respaldo.
 * Consulta primero el índice GitHub público y después Releases.
 */
(function () {
  'use strict';

  let candidate = null;
  let downloading = false;
  let checking = false;
  let lastMessage = '';
  let savedApk = null;

  const dict = {
    es: {
      checking: 'Buscando actualizaciones…',
      current: 'Ya tienes la versión más reciente.',
      available: 'Nueva versión',
      noNative: 'Instala el APK nuevo con descarga a Descargas.',
      notConfigured: 'No está configurado el repositorio.',
      downloading: 'Descargando APK…',
      saved: 'APK verificado y guardado en:',
      next: 'Pulsa Instalar actualización para abrir el instalador de Android. Si no aparece, el APK sigue disponible en Descargas/SmartLifePro.',
      download: 'Descargar actualización',
      install: 'Instalar actualización',
      installer: 'Instalador de Android abierto. Confirma la actualización.',
      permission: 'Autoriza la instalación desde SmartLifePro en Android, vuelve a la app y pulsa Instalar actualización.',
      installError: 'No se pudo abrir el instalador. Prueba el botón Instalar actualización o utiliza el APK guardado en Descargas/SmartLifePro.',
      error: 'Error:'
    },
    pt: {
      checking: 'Procurando atualizações…',
      current: 'Você já tem a versão mais recente.',
      available: 'Nova versão',
      noNative: 'Instale o novo APK com download na pasta Downloads.',
      notConfigured: 'Repositório não configurado.',
      downloading: 'Baixando APK…',
      saved: 'APK verificado e salvo em:',
      next: 'Toque em Instalar atualização para abrir o instalador do Android. O APK continua em Downloads/SmartLifePro como alternativa.',
      download: 'Baixar atualização',
      install: 'Instalar atualização',
      installer: 'Instalador do Android aberto. Confirme a atualização.',
      permission: 'Autorize instalações pelo SmartLifePro no Android, volte e toque em Instalar atualização.',
      installError: 'Não foi possível abrir o instalador. Tente o botão Instalar atualização ou o APK salvo em Downloads/SmartLifePro.',
      error: 'Erro:'
    },
    en: {
      checking: 'Checking for updates…',
      current: 'You have the latest version.',
      available: 'New version',
      noNative: 'Install the new APK using the Downloads folder.',
      notConfigured: 'Repository not configured.',
      downloading: 'Downloading APK…',
      saved: 'Verified APK saved to:',
      next: 'Tap Install update to open the Android installer. A backup copy stays in Downloads/SmartLifePro.',
      download: 'Download update',
      install: 'Install update',
      installer: 'Android installer opened. Confirm the update.',
      permission: 'Allow installs from SmartLifePro in Android settings, return and tap Install update.',
      installError: 'Could not open the installer. Retry Install update or use the APK in Downloads/SmartLifePro.',
      error: 'Error:'
    }
  };

  function lang() {
    try { return typeof Data !== 'undefined' ? Data.store?.settings?.lang : 'es'; }
    catch (_) { return 'es'; }
  }
  function t() { return dict[lang()] || dict.es; }
  function api() { return window.SmartyAppUpdateNative; }
  function panel() { return document.getElementById('smarty-native-update-state'); }
  function status(message) {
    lastMessage = message;
    const el = panel();
    if (el) el.textContent = message;
    else if (typeof UI !== 'undefined') UI.showSnackbar?.(message);
  }
  function controls() {
    const el = panel();
    if (!el) return;
    if (lastMessage) el.textContent = lastMessage;
    let button = document.getElementById('smarty-update-download');
    if (!button) {
      button = document.createElement('button');
      button.id = 'smarty-update-download';
      button.className = 'btn-full';
      button.style.cssText = 'margin:8px 0;padding:11px;font-size:13px';
      el.insertAdjacentElement('afterend', button);
    }
    button.textContent = t().download;
    button.disabled = downloading || checking;
    button.hidden = !candidate;
    button.onclick = downloadNow;
    let installer = document.getElementById('smarty-update-install');
    if (savedApk && typeof api()?.installSaved === 'function') {
      if (!installer) {
        installer = document.createElement('button');
        installer.id = 'smarty-update-install';
        installer.className = 'btn-full';
        installer.style.cssText = 'margin:8px 0;padding:11px;font-size:13px';
        el.insertAdjacentElement('afterend', installer);
      }
      installer.textContent = t().install;
      installer.hidden = false;
      installer.disabled = downloading || checking;
      installer.onclick = installNow;
    } else if (installer) installer.remove();
    document.getElementById('smarty-update-diagnostics')?.remove();
  }
  function repo() {
    const value = window.SMARTY_RELEASE_CONFIG?.repository;
    return typeof value === 'string' && /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(value)
      ? value : null;
  }

  function validRelease(raw, name, isManifest) {
    const tag = String(isManifest ? raw?.tag : raw?.tag_name || '');
    const tagMatch = /^v(\d{5,12})$/.exec(tag);
    if (!tagMatch) throw new Error('etiqueta de versión incompatible');
    const version = Number(tagMatch[1]);
    if (!Number.isSafeInteger(version) || version <= 0) throw new Error('versión inválida');
    if (isManifest && (raw.repository !== name || Number(raw.versionCode) !== version)) {
      throw new Error('índice del repositorio o versión incorrecta');
    }

    const asset = isManifest ? null : (raw.assets || []).find(item =>
      item.name === 'SmartLifePro.apk' && item.state === 'uploaded');
    if (!isManifest && !asset) throw new Error('SmartLifePro.apk no existe en Releases');
    const link = String(isManifest ? raw.apkUrl : asset.browser_download_url || '');
    const expected = 'https://github.com/' + name + '/releases/download/' + tag + '/SmartLifePro.apk';
    if (link !== expected) throw new Error('URL del APK no confiable');
    const digest = String(isManifest ? raw.sha256 : asset.digest || '');
    const match = /^(?:sha256:)?([0-9a-f]{64})$/i.exec(digest);
    if (!match) throw new Error('SHA-256 del APK ausente o inválido');
    const label = String((isManifest ? raw.releaseName : raw.name) || tag).slice(0, 120);
    return { link, hash: match[1].toLowerCase(), version, label };
  }

  function httpExplanation(statusCode) {
    const code = Number(statusCode);
    if (code === 403) return 'HTTP 403 (acceso denegado o límite de consultas)';
    if (code === 404) return 'HTTP 404 (recurso no encontrado)';
    if (code === 429) return 'HTTP 429 (demasiadas consultas)';
    if (code >= 500) return 'HTTP ' + code + ' (fallo temporal del servidor)';
    return 'HTTP ' + code;
  }

  async function requestJSON(url, source) {
    // El límite es por origen. La ruta raw NO utiliza la cuota anónima de GitHub API.
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeout = controller && typeof setTimeout === 'function'
      ? setTimeout(() => controller.abort(), 10000) : null;
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        ...(controller ? { signal: controller.signal } : {})
      });
      if (!response.ok) throw new Error(source + ': ' + httpExplanation(response.status));
      return await response.json();
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error(source + ': tiempo de espera agotado');
      if (error?.name === 'TypeError') throw new Error(source + ': conexión o acceso de red fallido');
      throw error;
    } finally {
      if (timeout !== null) clearTimeout(timeout);
    }
  }

  async function latest(name) {
    const errors = [];
    const manifestUrl = 'https://raw.githubusercontent.com/' + name + '/main/smarty-latest.json?v=' + Date.now();
    try {
      return validRelease(await requestJSON(manifestUrl, 'Índice público'), name, true);
    } catch (error) { errors.push(String(error?.message || error)); }

    // Fallback para APK antiguos, repositorios que aún no tienen índice y caídas de raw.
    try {
      const url = 'https://api.github.com/repos/' + name + '/releases/latest';
      return validRelease(await requestJSON(url, 'GitHub Releases'), name, false);
    } catch (error) { errors.push(String(error?.message || error)); }

    throw new Error('No se pudo consultar la última versión. ' + errors.join('; '));
  }

  async function checkNow() {
    if (downloading || checking) return;
    candidate = null;
    checking = true;
    controls();
    const name = repo();
    try {
      if (!name) { status(t().notConfigured); return; }
      if (typeof api()?.downloadAndSave !== 'function' || typeof api()?.getInstalledVersionCode !== 'function') {
        status(t().noNative); return;
      }
      status(t().checking);
      const release = await latest(name);
      const installed = Number(api().getInstalledVersionCode());
      if (!Number.isSafeInteger(installed) || installed < 0) {
        throw new Error('No se pudo determinar la versión instalada');
      }
      if (release.version <= installed) {
        status(t().current);
        return;
      }
      candidate = { link: release.link, hash: release.hash, version: release.version };
      status(t().available + ': ' + release.label);
    } catch (error) {
      candidate = null;
      status(t().error + ' ' + String(error?.message || error));
    } finally {
      checking = false;
      controls();
    }
  }

  function installNow() {
    if (!savedApk || typeof api()?.installSaved !== 'function') return;
    try { api().installSaved(); }
    catch (error) { status(t().installError + ' ' + String(error?.message || error)); controls(); }
  }
  function downloadNow() {
    if (!candidate || downloading || checking) return;
    downloading = true;
    status(t().downloading);
    controls();
    try {
      api().downloadAndSave(candidate.link, candidate.hash, String(candidate.version));
    } catch (error) {
      downloading = false;
      status(t().error + ' ' + String(error?.message || error));
      controls();
    }
  }
  function nativeEvent(kind, value) {
    if (kind === 'progress') { status(t().downloading + ' ' + value + '%'); return; }
    downloading = false;
    if (kind === 'saved') {
      candidate = null;
      savedApk = String(value);
      status(t().saved + ' ' + savedApk + '\n' + t().next);
      controls();
      installNow(); // Descarga iniciada por el usuario: abre el instalador nativo.
      return;
    } else if (kind === 'installer') {
      status(t().installer);
    } else if (kind === 'permission') {
      status(t().permission);
    } else if (kind === 'install-error') {
      status(t().installError + '\n' + String(value));
    } else status(t().error + ' ' + String(value));
    controls();
  }

  window.SmartyAppUpdater = { checkNow, downloadNow, nativeEvent, render: controls };
  document.addEventListener('DOMContentLoaded', controls);
})();
