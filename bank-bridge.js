/* Puente único para las notificaciones de la APK (V22.1).
   Las notificaciones solo se examinan con el permiso de Android, la opción
   bancaria activada y una lista explícita de aplicaciones autorizadas. */
(function () {
    'use strict';

    const SEEN_KEY = 'smarty_processed_bank_notifications_v1';
    const REVIEW_KEY = 'smarty_pending_bank_review_v1';
    const seen = new Map();
    let draining = false;
    let reviewOpen = false;
    let ready = false;
    let nativeAckSupported = false;
    let lastError = '';
    let lastDrainAt = 0;

    function readJSON(key, fallback) {
        try {
            const val = JSON.parse(localStorage.getItem(key) || 'null');
            return val === null ? fallback : val;
        } catch (_) { return fallback; }
    }

    function saveJSON(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (e) { console.warn('[Banco] No se pudo guardar estado local', e); return false; }
    }

    const restored = readJSON(SEEN_KEY, []);
    if (Array.isArray(restored)) restored.forEach(entry => {
        if (Array.isArray(entry) && entry.length === 2) seen.set(entry[0], entry[1]);
    });

    function normalizeMoney(raw) {
        let v = String(raw || '').replace(/\s/g, '').replace(/[^\d.,]/g, '');
        if (!v) return NaN;
        const lastComma = v.lastIndexOf(','), lastDot = v.lastIndexOf('.');
        const sep = Math.max(lastComma, lastDot);
        if (sep >= 0 && v.length - sep - 1 === 2) {
            v = v.slice(0, sep).replace(/[.,]/g, '') + '.' + v.slice(sep + 1);
        } else if (sep >= 0 && v.length - sep - 1 === 3) {
            v = v.replace(/[.,]/g, '');
        } else if (sep >= 0) {
            v = v.replace(/,/g, '.');
        }
        const amount = Number(v);
        return Number.isFinite(amount) && amount > 0 && amount < 1000000000 ? amount : NaN;
    }

    function extractAmount(text) {
        // Priorizar importes asociados a una moneda; no capturar el número de tarjeta.
        const patterns = [
            /(?:R\$|BRL|US\$|USD|€|EUR|\$)\s*([\d.,]+(?:[\s.,]\d{3})*(?:[.,]\d{2})?)/i,
            /(?:valor|valor de|total|importe|monto|amount|por|de)\s*(?:R\$|\$)?\s*([\d]{1,3}(?:[.,]\d{3})*[.,]\d{2}|\d+[.,]\d{2})\b/i
        ];
        for (const pattern of patterns) {
            const m = text.match(pattern);
            if (m) {
                const val = normalizeMoney(m[1]);
                if (Number.isFinite(val)) return val;
            }
        }
        return null;
    }

    function classify(text) {
        const t = text.toLowerCase();
        if (/supermercad|mercado|mercadinho|atacad|hortifruti|padaria|panader|alimentaci/.test(t)) return 'cat_market';
        if (/uber|99 pop|taxi|taxi|transporte|gasolina|posto |combustivel|combustível/.test(t)) return 'cat_transport';
        if (/farmac|drogaria|hospital|clinica|clínica|medicament/.test(t)) return 'cat_health';
        if (/restaur|pizz|lanchonete|comida|cafeteria|delivery|ifood/.test(t)) return 'cat_dining';
        if (/internet|aluguel|electric|energia|água|agua|fatura|conta de/.test(t)) return 'cat_bills';
        if (/passagem|aereo|aéreo|hotel|viagem/.test(t)) return 'cat_travel';
        return 'cat_other';
    }

    function parse(notification) {
        if (!notification || typeof notification !== 'object') return null;
        const title = String(notification.title || '').trim();
        const body = String(notification.text || '').trim();
        const text = (title + ' ' + body).trim();
        if (!text || text.length < 8) return null;
        // Sólo cargos confirmados: nunca registrar ingresos, estornos, publicidad o solicitudes.
        if (/pix recebido|pix recebida|recebeu (um )?pix|transfer[eê]ncia recebida|dinheiro recebido|reembolso|estorno|refund|cashback|você recebeu|voce recebeu|depósito recebido/i.test(text)) return null;
        if (/não aprovad|nao aprovad|rejeitad|recusad|cancelad|negad|falhou|falha|pendente|tentativa|senha de|código de|codigo de|oferta|promoção|promocao/i.test(text)) return null;
        if (!/(compra|comprou|pagou|pagaste|pagamento (efetuado|realizado|aprovado|confirmado)|pago|pagado|paid|spent|débito|debito|crédito|credito|pix enviado|pix realizado|transfer[eê]ncia enviada|transferencia realizada)/i.test(text)) return null;
        const amount = extractAmount(text);
        if (!amount) return null;
        const titleClean = title.replace(/[<>\u0000-\u001f]/g, '').slice(0, 60);
        const bodyMerchant = body.match(/(?:em|no|na|para|en|at|com)\s+([^,.;\n]+?)(?=\s+(?:por|de|no valor|com|R\$|\$)|$)/i);
        const merchant = (bodyMerchant && bodyMerchant[1] || titleClean || 'Pago bancario').trim().slice(0, 70);
        return {
            amount,
            desc: 'Banco: ' + merchant.replace(/[<>]/g, ''),
            category: classify(text),
            packageName: String(notification.package || '')
        };
    }

    function remember(key) {
        seen.set(key, Date.now());
        const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
        for (const [k, t] of seen) if (t < cutoff) seen.delete(k);
        while (seen.size > 500) seen.delete(seen.keys().next().value);
        saveJSON(SEEN_KEY, [...seen]);
    }

    function recordExpense(expense) {
        if (!Data.store.expenses) Data.store.expenses = [];
        Data.store.expenses.push({
            id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 6),
            date: Date.now(), amount: expense.amount, desc: expense.desc,
            category: typeof UI?.t === 'function' ? UI.t(expense.category) : expense.category,
            isInstallment: false, installments: null, source: 'bank_notification'
        });
        Data.save();
        if (typeof UI?.renderBudgetChart === 'function') UI.renderBudgetChart();
        if (typeof Finance?.renderHomeWidgets === 'function') Finance.renderHomeWidgets();
        if (typeof Finance?.renderExpensesHistory === 'function' && Finance.selectedHistoryMonth) Finance.renderExpensesHistory();
        if (typeof Assistant !== 'undefined' && Assistant.updateMood) Assistant.updateMood();
        if (typeof UI?.showSnackbar === 'function') UI.showSnackbar('Gasto bancario registrado: ' + UI.formatMoney(expense.amount));
    }

    function reviewNext() {
        if (!ready || reviewOpen || !Data?.store?.settings?.bankAutoDetect) return;
        const pending = readJSON(REVIEW_KEY, []);
        if (!Array.isArray(pending) || !pending.length) return;
        const modal = document.getElementById('modal-expense');
        if (modal?.classList.contains('open')) return;
        if (typeof Finance?.openSmartExpenseModal !== 'function') {
            lastError = 'El formulario de confirmación no está disponible';
            return; // Nunca descartar un gasto sin mostrarlo.
        }
        try {
            const item = pending[0];
            Finance.openSmartExpenseModal(item.amount, item.desc, item.category);
            if (!modal?.classList.contains('open')) {
                lastError = 'No se abrió el formulario de confirmación';
                return;
            }
            reviewOpen = true;
            if (!saveJSON(REVIEW_KEY, pending.slice(1))) {
                lastError = 'No se pudo guardar la cola de confirmaciones';
            }
        } catch (e) {
            lastError = 'Fallo abriendo confirmación: ' + (e?.message || e);
            console.error('[Banco]', e);
        }
    }

    // true significa "registrada o descartada intencionalmente"; false = reintentar después.
    function process(notification) {
        if (!ready || !Data?.store?.settings?.bankAutoDetect) return false;
        const key = String(notification.key || '');
        const fallbackKey = [notification.package, notification.title, notification.text].join('|');
        const dedup = key ? 'id:' + key : 'text:' + fallbackKey;
        if (seen.has(dedup)) return true;
        const expense = parse(notification);
        if (!expense) return true; // Mensaje no bancario; se puede confirmar como leído.
        if (Data.store.settings.bankAutoSaveMode === 'auto') {
            try { recordExpense(expense); }
            catch (e) {
                lastError = 'No se guardó el gasto: ' + (e?.message || e);
                console.error('[Banco]', e);
                return false;
            }
        } else {
            const pending = readJSON(REVIEW_KEY, []);
            if (!Array.isArray(pending) || !saveJSON(REVIEW_KEY, [...pending, expense].slice(-100))) {
                lastError = 'No fue posible guardar la confirmación pendiente';
                return false;
            }
        }
        remember(dedup);
        return true;
    }

    function drainPending() {
        const native = window.SmartyAndroid;
        if (!ready || draining || !native) return;
        const safe = typeof native.peekPendingNotificationsJson === 'function' &&
                     typeof native.ackPendingNotificationsJson === 'function';
        if (!safe && typeof native.getPendingNotificationsJson !== 'function') return;
        nativeAckSupported = safe;
        draining = true;
        try {
            const raw = safe ? native.peekPendingNotificationsJson() : native.getPendingNotificationsJson();
            const items = JSON.parse(raw || '[]');
            if (!Array.isArray(items)) throw Error('Cola inválida');
            const acknowledged = [];
            for (const item of items) {
                if (!item || typeof item !== 'object') continue;
                try {
                    if (process(item) && item.key) acknowledged.push(String(item.key));
                } catch (e) {
                    lastError = 'Error procesando la notificación: ' + (e?.message || e);
                    console.error('[Banco]', e);
                }
            }
            if (safe && acknowledged.length) native.ackPendingNotificationsJson(JSON.stringify(acknowledged));
            lastDrainAt = Date.now();
        } catch (e) {
            lastError = 'No fue posible leer la cola nativa: ' + (e?.message || e);
            console.error('[Banco]', e);
        } finally { draining = false; }
        reviewNext();
    }

    function diagnostics() {
        let native = null;
        try {
            if (typeof window.SmartyAndroid?.getNotificationDiagnosticsJson === 'function')
                native = JSON.parse(window.SmartyAndroid.getNotificationDiagnosticsJson());
        } catch (e) { lastError = String(e); }
        return { ready, nativeAckSupported, enabled: !!Data?.store?.settings?.bankAutoDetect,
            mode: Data?.store?.settings?.bankAutoSaveMode,
            reviewCount: readJSON(REVIEW_KEY, []).length,
            lastDrainAt, lastError, native };
    }

    window.SmartyBankBridge = { drainPending, parse, process, normalizeMoney, diagnostics, reviewNext };
    window.addEventListener('SmartyBankNotification', () => drainPending());
    function activate() {
        if (ready) return;
        // No vaciar la cola antes de que Main.init haya cargado los ajustes guardados.
        if (typeof Data === 'undefined' || !Data.store?.settings ||
            typeof window.SmartyAndroid?.getPendingNotificationsJson !== 'function') return;
        ready = true;
            // Los ajustes restaurados de una copia deben sincronizarse con Android.
            const native = window.SmartyAndroid;
            const configured = Data?.store?.settings?.allowedBankPackages || [];
            if (Array.isArray(configured) && configured.length &&
                native?.getAllowedNotificationPackages && native?.setAllowedNotificationPackages &&
                !native.getAllowedNotificationPackages()) {
                native.setAllowedNotificationPackages(configured.join(','));
            }
            drainPending(); reviewNext();
    }
    window.addEventListener('load', () => setTimeout(activate, 700));
    if (document.readyState === 'complete') setTimeout(activate, 900);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') { drainPending(); reviewNext(); }
    });
    window.addEventListener('focus', () => { drainPending(); reviewNext(); });
    setInterval(() => {
        if (!ready && document.readyState === 'complete') activate();
        drainPending();
        if (reviewOpen && !document.getElementById('modal-expense')?.classList.contains('open')) reviewOpen = false;
        reviewNext();
    }, 2500);
})();
