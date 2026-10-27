/* Captura nativa para Smarty: gastos y listas. No modifica la lógica de IA existente. */
(function () {
    'use strict';

    const KEY = 'smarty_camera_pending_v1';
    const MAX_AGE = 20 * 60 * 1000;
    let busy = false;
    let restoredListenerReady = false;

    function notice(message) {
        if (typeof UI !== 'undefined' && UI.showSnackbar) UI.showSnackbar(message);
        else console.warn('[SmartyCamera]', message);
    }

    function readPending() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return null;
            const p = JSON.parse(raw);
            if (!p || !['expense-ai', 'list-finish', 'list-new', 'list-history'].includes(p.route) ||
                Date.now() - p.time > MAX_AGE) {
                localStorage.removeItem(KEY);
                return null;
            }
            return p;
        } catch (_) { return null; }
    }

    function clearPending() {
        try { localStorage.removeItem(KEY); } catch (_) {}
    }

    function captureContext(route) {
        return {
            route,
            time: Date.now(),
            listId: (typeof Data !== 'undefined') ? Data.store?.currentId : null,
            historyId: (typeof Shopping !== 'undefined') ? Shopping.currentDetailListId : null
        };
    }

    // La imagen de Capacitor se transforma a File: así se reutilizan los escáneres existentes.
    function asFile(photo) {
        if (!photo || typeof photo.base64String !== 'string' || !photo.base64String.length)
            throw new Error('La cámara no devolvió una fotografía.');
        const raw = atob(photo.base64String);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const type = photo.format === 'png' ? 'image/png' : 'image/jpeg';
        return new File([bytes], 'smarty-foto.' + (type === 'image/png' ? 'png' : 'jpg'), { type });
    }

    function fileInput(file) { return { files: [file], value: '' }; }

    async function applyPhoto(photo, pending) {
        if (!pending) return;
        // Limpiar solo cuando ya se recibió una foto real, no al abrir la cámara.
        const file = asFile(photo);
        clearPending();
        const route = pending.route;
        try {
            if (route === 'expense-ai') {
                document.getElementById('modal-expense')?.classList.add('open');
                await Finance.handleExpenseAutoFill(fileInput(file));
            } else if (route === 'list-finish') {
                if (pending.listId) {
                    Data.store.currentId = pending.listId;
                    // Tras recreación de Android, recuperar la lista y el resumen.
                    if (!document.getElementById('modal-finish-list')?.classList.contains('open')) {
                        Shopping.openShoppingView();
                        Shopping.finishList();
                    }
                }
                await Shopping.handleReceiptPhoto(fileInput(file));
            } else if (route === 'list-new') {
                document.getElementById('ticket-source-modal')?.remove();
                await Shopping.createCompletedListFromReceipt(fileInput(file));
            } else if (route === 'list-history') {
                if (!pending.historyId) throw new Error('La lista del historial ya no está disponible.');
                if (Shopping.currentDetailListId !== pending.historyId ||
                    !document.getElementById('modal-list-detail')?.classList.contains('open')) {
                    Shopping.openHistoryDetail(pending.historyId);
                }
                await Shopping.replaceCompletedListWithPhoto(fileInput(file));
            }
        } catch (err) {
            console.error('[SmartyCamera] No se pudo analizar la foto:', err);
            notice('No se pudo procesar la foto. Puedes volver a intentarlo o elegir Galería.');
        }
    }

    // Android puede destruir la actividad al abrir la cámara; App.appRestoredResult
    // devuelve la foto recuperada. El contexto permanece en localStorage hasta recibirla.
    function listenForRestoredPhoto() {
        if (restoredListenerReady) return;
        const app = window.Capacitor?.Plugins?.App;
        if (!app || typeof app.addListener !== 'function') return;
        restoredListenerReady = true;
        Promise.resolve(app.addListener('appRestoredResult', async result => {
            if (result?.pluginId !== 'Camera' || result?.methodName !== 'getPhoto') return;
            const pending = readPending();
            if (!pending) return;
            busy = false;
            // Tras una recreación de Activity, aguardar a que Main.init termine de
            // cargar los gastos/listas y a que el APK instale sus funciones de IA.
            if (document.readyState !== 'complete') {
                await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
            }
            if (result.success && result.data?.base64String) {
                await applyPhoto(result.data, pending);
            } else {
                clearPending();
                if (result.success) notice('Android no recuperó la imagen. Intenta nuevamente.');
            }
        })).catch(err => {
            restoredListenerReady = false;
            console.error('[SmartyCamera] Falló registro de recuperación:', err);
        });
    }

    window.SmartyCamera = {
        async take(route) {
            if (busy) return;
            if (!['expense-ai', 'list-finish', 'list-new', 'list-history'].includes(route)) return;
            const camera = window.Capacitor?.Plugins?.Camera;
            if (!camera || typeof camera.getPhoto !== 'function') {
                notice('La cámara nativa necesita el APK actualizado. Por ahora utiliza Galería.');
                return;
            }
            listenForRestoredPhoto();
            const context = captureContext(route);
            if (route === 'list-history' && !context.historyId) {
                notice('Abre primero la lista del historial.');
                return;
            }
            busy = true;
            try {
                localStorage.setItem(KEY, JSON.stringify(context));
                const photo = await camera.getPhoto({
                    quality: 78,
                    width: 1600,
                    height: 2200,
                    allowEditing: false,
                    correctOrientation: true,
                    saveToGallery: false,
                    source: 'CAMERA',
                    resultType: 'base64'
                });
                await applyPhoto(photo, readPending() || context);
            } catch (err) {
                console.error('[SmartyCamera] Captura cancelada o fallida:', err);
                clearPending();
                const message = String(err?.message || err || '').toLowerCase();
                if (!/cancel|canceled|cancelled|user cancelled/.test(message)) {
                    notice('No se pudo obtener la foto de la cámara. Comprueba los permisos.');
                }
            } finally {
                busy = false;
            }
        },
        _applyPhoto: applyPhoto,
        _readPending: readPending
    };

    // Configurar el listener pronto, antes de que Android entregue el resultado restaurado.
    listenForRestoredPhoto();
    window.addEventListener('load', listenForRestoredPhoto);
})();
