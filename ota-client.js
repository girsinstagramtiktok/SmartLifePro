/*
 * Smarty OTA - consulta manual de actualizaciones web desde GitHub Releases.
 * Compatible con Capacitor Updater (Capgo) v6 y con el codigo base de Smarty.
 * No modifica ni elimina registros financieros.
 */
(function () {
    'use strict';

    let busy = false;
    const updater = () => window.Capacitor?.Plugins?.CapacitorUpdater;
    const repo = () => String(window.SMARTY_OTA_REPOSITORY || '').trim();

    // En Smarty, UI se declara con `const UI`, NO como `window.UI`.
    // Por eso la comprobacion anterior con window.UI dejaba los errores invisibles.
    function feedback(message, isError = false) {
        const text = String(message);
        const button = document.querySelector?.('button[onclick*="checkForOtaUpdateNow"]');
        if (button && button.parentNode) {
            let status = document.getElementById('smarty-ota-status');
            if (!status || !status.isConnected) {
                status = document.createElement('div');
                status.id = 'smarty-ota-status';
                status.setAttribute('role', 'status');
                status.setAttribute('aria-live', 'polite');
                status.style.cssText = 'font-size:12px;line-height:1.4;padding:9px 11px;margin:0 0 12px;border-radius:10px;white-space:normal;overflow-wrap:anywhere;';
                button.insertAdjacentElement('afterend', status);
            }
            status.style.background = isError ? 'rgba(229,62,62,.12)' : 'var(--input-bg,rgba(127,127,127,.12))';
            status.style.color = isError ? 'var(--danger,#d33b3b)' : 'var(--text-color,inherit)';
            status.textContent = text;
        }
        try {
            if (typeof UI !== 'undefined' && typeof UI.showSnackbar === 'function') {
                UI.showSnackbar(text.replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[ch] || ch)));
            } else if (window.UI?.showSnackbar) {
                window.UI.showSnackbar(text.replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\'":"&#39;"}[ch] || ch)));
            }
        } catch (err) {
            console.warn('[SmartyOTA] No se pudo mostrar el aviso:', err);
        }
        console.info('[SmartyOTA]', text);
    }

    function getReleaseAsset(release, repository) {
        if (!/^ota-[0-9a-f]{12}$/.test(release?.tag_name || '')) return null;
        const asset = (release.assets || []).find(a => a.name === 'smarty-web.zip');
        if (!asset?.browser_download_url || !Number.isFinite(asset.size) || asset.size < 512) return null;
        const expected = `https://github.com/${repository}/releases/download/${release.tag_name}/smarty-web.zip`;
        if (asset.browser_download_url !== expected) return null;
        return { version: release.tag_name, url: expected };
    }

    async function fetchGitHub(url) {
        // Cada consulta tiene un plazo maximo para no dejar el boton congelado.
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        let timer;
        try {
            if (controller) timer = setTimeout(() => controller.abort(), 15000);
            const response = await fetch(url, {
                cache: 'no-store',
                headers: { Accept: 'application/vnd.github+json' },
                ...(controller ? { signal: controller.signal } : {})
            });
            if (response.status === 404) throw new Error('No se puede consultar el repositorio. Comprueba que sea publico y tenga Releases.');
            if (!response.ok) throw new Error(`GitHub devolvio HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            if (err?.name === 'AbortError') throw new Error('La consulta a GitHub excedio 15 segundos. Comprueba la conexion.');
            throw err;
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    async function getLatestOta(repository) {
        const base = `https://api.github.com/repos/${repository}`;
        const latest = await fetchGitHub(`${base}/releases/latest`);
        const result = getReleaseAsset(latest, repository);
        if (result) return result;
        // Si la ultima publicacion es un APK, buscar el ultimo Release OTA.
        const releases = await fetchGitHub(`${base}/releases?per_page=15`);
        if (!Array.isArray(releases)) throw new Error('GitHub devolvio una respuesta inesperada.');
        const otaRelease = releases.find(r => !r.draft && !r.prerelease && getReleaseAsset(r, repository));
        if (!otaRelease) throw new Error('No hay una publicacion OTA valida con smarty-web.zip en los ultimos 15 Releases.');
        return getReleaseAsset(otaRelease, repository);
    }

    async function check() {
        if (busy) {
            feedback('Ya hay una comprobacion o descarga en curso.');
            return;
        }
        const plugin = updater();
        if (!plugin?.download || !plugin?.set || !plugin?.current) {
            feedback('No se detecta el complemento OTA. Comprueba que este APK incluya Capacitor Updater.', true);
            return;
        }
        const repository = repo();
        if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
            feedback('No esta configurado el repositorio OTA de GitHub.', true);
            return;
        }

        busy = true;
        try {
            feedback('Consultando actualizaciones de Smarty en GitHub...');
            const update = await getLatestOta(repository);
            feedback(`Ultima version publicada: ${update.version}. Comprobando instalacion...`);
            const current = await plugin.current();
            const installedVersion = current?.bundle?.version || '';
            if (installedVersion === update.version) {
                feedback('Smarty ya tiene instalada la última actualización web.');
                return;
            }
            feedback('Actualizacion disponible. Descargando el paquete web...');
            const bundle = await plugin.download(update);
            if (!bundle?.id) throw new Error('El complemento no devolvio un paquete valido.');
            feedback('Descarga finalizada. Aplicando actualizacion; Smarty se reiniciara...');
            // El metodo `set` recibe un BundleId, no el objeto completo devuelto por download.
            await plugin.set({ id: bundle.id });
        } catch (err) {
            console.error('[SmartyOTA] Error al actualizar:', err);
            feedback(`No se pudo actualizar: ${err?.message || 'Error desconocido.'}`, true);
        } finally {
            busy = false;
        }
    }

    window.SmartyLiveUpdate = { check, getReleaseAsset };
    window.checkForOtaUpdateNow = check;

    // En la version antigua, el codigo exigia un evento de carga exitoso.
    // Se mantiene para evitar un rollback del paquete instalado.
    window.addEventListener('load', () => {
        const plugin = updater();
        if (plugin?.notifyAppReady) {
            Promise.resolve(plugin.notifyAppReady()).catch(err => console.error('[SmartyOTA] AppReady:', err));
        }
    });

    // El modulo inyectado en APK puede redefinir el onclick del boton.
    // La captura delegada garantiza que se ejecute un unico comprobador OTA.
    document.addEventListener('click', event => {
        const button = event.target?.closest?.('button[onclick*="checkForOtaUpdateNow"]');
        if (!button) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        void check();
    }, true);
})();
