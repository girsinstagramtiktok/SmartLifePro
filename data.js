/* =========================================
   SMART LIFE PRO - DATA MANAGER (V11.0 - NATIVE ANDROID STORAGE + BANK AUTO-DETECT)
   Autor: A_True_Alpha
   ========================================= */

const Data = {
    store: {
        lists: [],
        prices: {},
        currentId: null,
        settings: {
            lang: 'es',
            darkMode: false,
            currency: '$',
            currencyCode: 'USD',
            theme: 'blue',
            font: 'Modern',
            pin: null,
            groqApiKey: '',
            showSmartTips: true,
            subNotifications: true,       // Alertas nativas 24h antes de cobro
            bankAutoDetect: false,        // Lector de notificaciones bancarias en Android
            bankAutoSaveMode: 'confirm',  // 'auto' (guarda directo) | 'confirm' (pide confirmar)
            watchedBankPackages: [
                'com.nu.production',              // Nubank
                'br.com.intermedium',             // Banco Inter
                'com.mercadopago.wallet',         // Mercado Pago
                'com.itau',                       // Itaú
                'com.bradesco',                   // Bradesco
                'br.com.bb.android',              // Banco do Brasil
                'com.santander.app',              // Santander
                'com.picpay',                     // PicPay
                'com.google.android.apps.walletnfcrel' // Google Wallet
            ]
        },
        budget: { limit: 0, currency: '$' },
        subscriptions: [],
        expenses: [],
        pendingBankExpenses: [], // Cola de gastos detectados por notificación
        appControl: { lastActivePeriod: null },
        gamification: { xp: 0, level: 1, badges: [], streak: 1, currentSkin: 'default' }
    },

    KEY: 'smart_life_pro_v1',
    IDB_NAME: 'SmartLifeProNativeDB',
    IDB_STORE: 'kv_store',

    init() {
        console.log("[Data V11] Inicializando almacenamiento...");
        this.load();
        this.repairData();
        // Hidratar desde almacenamiento nativo / IndexedDB (fuera del límite de 5MB)
        this.hydrateFromPersistentStorage();
    },

    load() {
        const localData = localStorage.getItem(this.KEY);
        if (localData) {
            try {
                this.store = JSON.parse(localData);
            } catch (e) {
                console.error("Error leyendo localStorage. Usando respaldo.", e);
            }
        }
    },

    // --- CAPA NATIVA ANDROID (Capacitor Preferences + IndexedDB ilimitado) ---
    async hydrateFromPersistentStorage() {
        try {
            // 1. Si estamos en el APK Android con Capacitor Preferences
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
                const { value } = await window.Capacitor.Plugins.Preferences.get({ key: this.KEY });
                if (value) {
                    const parsed = JSON.parse(value);
                    if (this.isNewerOrRicher(parsed, this.store)) {
                        this.store = parsed;
                        this.repairData();
                        localStorage.setItem(this.KEY, JSON.stringify(this.store));
                        if (typeof UI !== 'undefined') UI.refreshDOM();
                        return;
                    }
                }
            }

            // 2. Respaldo en IndexedDB (permite cientos de MB en fotos y recibos)
            const idbData = await this.readIndexedDB();
            if (idbData && this.isNewerOrRicher(idbData, this.store)) {
                this.store = idbData;
                this.repairData();
                if (typeof UI !== 'undefined') UI.refreshDOM();
            }
        } catch (err) {
            console.warn("[Data V11] Hidratación secundaria omitida:", err);
        }
    },

    isNewerOrRicher(candidate, current) {
        if (!candidate) return false;
        const candCount = (candidate.expenses?.length || 0) + (candidate.lists?.length || 0);
        const currCount = (current.expenses?.length || 0) + (current.lists?.length || 0);
        return candCount > currCount || (candidate.meta?.updatedAt || 0) > (current.meta?.updatedAt || 0);
    },

    openIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) return reject(new Error('No IDB'));
            const req = indexedDB.open(this.IDB_NAME, 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.IDB_STORE)) {
                    db.createObjectStore(this.IDB_STORE);
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async writeIndexedDB(dataObj) {
        try {
            const db = await this.openIndexedDB();
            const tx = db.transaction(this.IDB_STORE, 'readwrite');
            tx.objectStore(this.IDB_STORE).put(dataObj, this.KEY);
        } catch (_) {}
    },

    async readIndexedDB() {
        try {
            const db = await this.openIndexedDB();
            return await new Promise((resolve) => {
                const tx = db.transaction(this.IDB_STORE, 'readonly');
                const req = tx.objectStore(this.IDB_STORE).get(this.KEY);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch (_) {
            return null;
        }
    },

    repairData() {
        let dirty = false;

        if (!Array.isArray(this.store.lists)) { this.store.lists = []; dirty = true; }
        if (!this.store.prices || typeof this.store.prices !== 'object') { this.store.prices = {}; dirty = true; }

        if (!this.store.settings) {
            this.store.settings = {
                lang: 'es', darkMode: false, currency: '$', currencyCode: 'USD',
                theme: 'blue', font: 'Modern', pin: null, groqApiKey: '',
                showSmartTips: true, subNotifications: true, bankAutoDetect: false,
                bankAutoSaveMode: 'confirm'
            };
            dirty = true;
        } else {
            const defaults = {
                theme: 'blue', font: 'Modern', pin: null, groqApiKey: '',
                showSmartTips: true, subNotifications: true, bankAutoDetect: false,
                bankAutoSaveMode: 'confirm',
                watchedBankPackages: [
                    'com.nu.production', 'br.com.intermedium', 'com.mercadopago.wallet',
                    'com.itau', 'com.bradesco', 'br.com.bb.android', 'com.santander.app',
                    'com.picpay', 'com.google.android.apps.walletnfcrel'
                ]
            };
            Object.keys(defaults).forEach(k => {
                if (typeof this.store.settings[k] === 'undefined') {
                    this.store.settings[k] = defaults[k];
                    dirty = true;
                }
            });
        }

        if (!this.store.budget) { this.store.budget = { limit: 0, currency: '$' }; dirty = true; }
        if (!Array.isArray(this.store.subscriptions)) { this.store.subscriptions = []; dirty = true; }
        if (!Array.isArray(this.store.expenses)) { this.store.expenses = []; dirty = true; }
        if (!Array.isArray(this.store.pendingBankExpenses)) { this.store.pendingBankExpenses = []; dirty = true; }
        if (!this.store.appControl) { this.store.appControl = { lastActivePeriod: null }; dirty = true; }

        if (!this.store.gamification) {
            this.store.gamification = { xp: 0, level: 1, badges: [], streak: 1, currentSkin: 'default' };
            dirty = true;
        } else {
            if (typeof this.store.gamification.xp === 'undefined') { this.store.gamification.xp = 0; dirty = true; }
            if (!this.store.gamification.level) { this.store.gamification.level = 1; dirty = true; }
            if (!Array.isArray(this.store.gamification.badges)) { this.store.gamification.badges = []; dirty = true; }
        }

        if (!this.store.meta) {
            this.store.meta = { installId: 'SLP-' + Math.random().toString(36).substring(2, 8).toUpperCase(), updatedAt: Date.now() };
            dirty = true;
        }

        if (dirty) this.save();
    },

    save() {
        if (!this.store.meta) this.store.meta = {};
        this.store.meta.updatedAt = Date.now();
        const serialized = JSON.stringify(this.store);

        // 1. Guardar en localStorage (rápido y síncrono)
        try {
            localStorage.setItem(this.KEY, serialized);
        } catch (e) {
            console.warn("localStorage al límite, usando IndexedDB y almacenamiento nativo.", e);
        }

        // 2. Guardar en IndexedDB (asíncrono y de alta capacidad)
        this.writeIndexedDB(this.store);

        // 3. Guardar en Almacenamiento Nativo Android (Capacitor Preferences)
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
            window.Capacitor.Plugins.Preferences.set({
                key: this.KEY,
                value: serialized
            }).catch(err => console.warn("Error Capacitor Preferences:", err));
        }
    },

    exportJSON() {
        const backup = {
            meta: {
                version: "11.0",
                date: new Date().toISOString(),
                platform: window.Capacitor ? "SmartLifePro-Android" : "SmartLifePro-Web"
            },
            data: this.store
        };
        return JSON.stringify(backup, null, 2);
    },

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            const newStore = parsed.data || parsed;

            if (newStore.lists || newStore.settings || newStore.budget) {
                this.store = { ...this.store, ...newStore };
                this.repairData();
                this.save();
                return true;
            }
            return false;
        } catch (e) {
            console.error("Error importando JSON:", e);
            return false;
        }
    },

    getStorageUsage() {
        let totalUsed = 0;
        const isNativeAndroid = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
        const TOTAL_LIMIT = isNativeAndroid ? 52428800 : 5242880; // 50MB en App Android / 5MB en Web

        try {
            const serialized = JSON.stringify(this.store);
            totalUsed = serialized.length * 2;
        } catch (_) {}

        const usedKB = (totalUsed / 1024).toFixed(1);
        const totalKB = (TOTAL_LIMIT / 1024).toFixed(0);
        const percent = Math.min(100, ((totalUsed / TOTAL_LIMIT) * 100)).toFixed(1);

        let status = 'good';
        if (percent > 70) status = 'warning';
        if (percent > 90) status = 'critical';

        return {
            usedBytes: totalUsed,
            limitBytes: TOTAL_LIMIT,
            usedKB,
            totalKB,
            percent,
            status,
            isNativeAndroid
        };
    },

    cleanOldPhotos() {
        if (!this.store.expenses) return;
        let photosRemoved = 0;
        const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

        this.store.expenses.forEach(exp => {
            if (exp.photo && exp.date < threeMonthsAgo) {
                exp.photo = null;
                photosRemoved++;
            }
        });

        if (photosRemoved > 0) {
            this.save();
            if (typeof UI !== 'undefined') {
                UI.showSnackbar(`Se limpiaron ${photosRemoved} fotos antiguas.`);
                UI.renderSettingsView();
            }
        } else {
            if (typeof UI !== 'undefined') UI.showSnackbar("No hay fotos antiguas para borrar.");
        }
    }
};