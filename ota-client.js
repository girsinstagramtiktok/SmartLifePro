/*
 * Smarty OTA: actualizaciones completas de HTML/CSS/JS desde GitHub Releases.
 * Solo esta disponible en APK que incluya @capgo/capacitor-updater.
 * El APK mantiene el mismo origen web y, por tanto, sus datos locales.
 */
(function () {
    'use strict';

    let busy = false;
    const updater = () => window.Capacitor?.Plugins?.CapacitorUpdater;
    const repo = () => String(window.SMARTY_OTA_REPOSITORY || '').trim();
    const feedback = text => {
        if (window.UI?.showSnackbar) window.UI.showSnackbar(text);
        else console.info('[SmartyOTA]', text);
    };

    function getReleaseAsset(release, repository) {
        if (!/^ota-[0-9a-f]{12}$/.test(release?.tag_name || '')) return null;
        const asset = (release.assets || []).find(a => a.name === 'smarty-web.zip');
        if (!asset?.browser_download_url || !Number.isFinite(asset.size) || asset.size < 512) return null;
        const expected = `https://github.com/${repository}/releases/download/${release.tag_name}/smarty-web.zip`;
        if (asset.browser_download_url !== expected) return null;
        return { version: release.tag_name, url: expected };
    }

    async function check() {
        if (busy) return;
        if (!updater()?.download || !updater()?.set || !updater()?.current) {
            feedback('Para actualizar sin recompilar, instala una vez el nuevo APK con actualizador OTA.');
            return;
        }
        const repository = repo();
        if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
            feedback('No se configuró el repositorio de GitHub en este APK.');
            return;
        }
        busy = true;
        try {
            feedback('Buscando nueva versión web en GitHub...');
            const response = await fetch(`https://api.github.com/repos/${repository}/releases/latest`, {
                cache: 'no-store', headers: { Accept: 'application/vnd.github+json' }
            });
            if (!response.ok) {
                if (response.status === 404) throw new Error('Todavía no hay una publicación OTA, o el repositorio es privado.');
                throw new Error(`GitHub devolvió HTTP ${response.status}`);
            }
            const release = await response.json();
            const update = getReleaseAsset(release, repository);
            if (!update) throw new Error('La última publicación de GitHub no contiene una actualización Smarty válida.');
            const current = await updater().current();
            const installedVersion = current?.bundle?.version || '';
            if (installedVersion === update.version) {
                feedback('Smarty ya tiene instalada la última actualización web.');
                return;
            }
            feedback('Actualización disponible. Descargando archivos seguros...');
            const bundle = await updater().download(update);
            if (!bundle?.id) throw new Error('El complemento no devolvió una actualización válida.');
            feedback('Instalando actualización; Smarty se reiniciará...');
            await updater().set(bundle); // Reinicia la vista web; no borra los datos de la app.
        } catch (err) {
            console.error('[SmartyOTA] Actualización fallida:', err);
            feedback(`No se pudo actualizar: ${err.message || 'comprueba la conexión'}`);
        } finally {
            busy = false;
        }
    }

    window.SmartyLiveUpdate = { check, getReleaseAsset };

    // El complemento comprueba que esta version inicio correctamente y permite rollback.
    window.addEventListener('load', () => {
        const plugin = updater();
        if (plugin?.notifyAppReady) {
            setTimeout(() => plugin.notifyAppReady().catch(err => console.error('[SmartyOTA] AppReady:', err)), 1500);
        }
    });

    // Evita que complementos heredados reemplacen el boton por la carga de un unico JS.
    document.addEventListener('click', event => {
        const button = event.target?.closest?.('button[onclick*="checkForOtaUpdateNow"]');
        if (!button) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        check();
    }, true);
})();
