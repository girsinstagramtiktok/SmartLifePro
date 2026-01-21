/* =========================================
   SMART LIFE PRO - DATA MANAGER (V7.6 - PIN SECURITY)
   Autor: A_True_Alpha
   ========================================= */

const Data = {
    // Estructura por defecto
    store: {
        lists: [], 
        prices: {}, 
        currentId: null, 
        settings: {
            lang: 'es',
            darkMode: false,
            currency: '$',
            theme: 'blue',
            pin: null // <--- NUEVO CAMPO: null = desactivado, "123456" = activado
        },
        budget: { limit: 0, currency: '$' },
        subscriptions: [],
        expenses: [],
        appControl: { lastActivePeriod: null },
        gamification: { xp: 0, level: 1, badges: [] } 
    },

    KEY: 'smart_life_pro_v1',

    init() {
        console.log("Cargando datos del sistema...");
        this.load();
        this.repairData(); 
    },

    load() {
        const localData = localStorage.getItem(this.KEY);
        if (localData) {
            try {
                this.store = JSON.parse(localData);
            } catch (e) {
                console.error("Error crítico leyendo datos. Usando defaults.");
            }
        }
    },

    // --- REPARACIÓN INTELIGENTE ---
    repairData() {
        let dirty = false;

        // 1. Listas
        if (!Array.isArray(this.store.lists)) { 
            this.store.lists = []; 
            dirty = true; 
        }

        // 2. Precios
        if (!this.store.prices || typeof this.store.prices !== 'object') { 
            this.store.prices = {}; 
            dirty = true; 
        }

        // 3. Configuración (Actualizada con PIN y Themes)
        if (!this.store.settings) { 
            this.store.settings = { 
                lang: 'es', 
                darkMode: false, 
                currency: '$', 
                theme: 'blue',
                pin: null
            }; 
            dirty = true; 
        } else {
            // Asegurar que el campo theme exista en usuarios antiguos
            if (!this.store.settings.theme) {
                this.store.settings.theme = 'blue';
                dirty = true;
            }
            
            // TRANSICIÓN A PIN: Asegurar que el campo pin exista
            if (typeof this.store.settings.pin === 'undefined') {
                this.store.settings.pin = null;
                dirty = true;
            }

            // LIMPIEZA: Eliminar rastros de biometría antigua si existen
            if ('biometrics' in this.store.settings) {
                delete this.store.settings.biometrics;
                delete this.store.settings.bioCredentialId;
                dirty = true;
            }
        }

        // 4. Presupuesto
        if (!this.store.budget) { 
            this.store.budget = { limit: 0, currency: '$' }; 
            dirty = true; 
        }

        // 5. Finanzas
        if (!Array.isArray(this.store.subscriptions)) { this.store.subscriptions = []; dirty = true; }
        if (!Array.isArray(this.store.expenses)) { this.store.expenses = []; dirty = true; }

        // 6. Control App
        if (!this.store.appControl) { 
            this.store.appControl = { lastActivePeriod: null }; 
            dirty = true; 
        }

        // 7. Gamificación (Protegida)
        if (!this.store.gamification) {
            this.store.gamification = { xp: 0, level: 1, badges: [] };
            dirty = true;
        } else {
            if (typeof this.store.gamification.xp === 'undefined') { this.store.gamification.xp = 0; dirty = true; }
            if (!this.store.gamification.level) { this.store.gamification.level = 1; dirty = true; }
            if (!Array.isArray(this.store.gamification.badges)) { this.store.gamification.badges = []; dirty = true; }
        }

        if (dirty) {
            console.log("Estructura de datos actualizada (V7.6 - PIN Ready).");
            this.save();
        }
    },

    save() {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(this.store));
        } catch (e) {
            console.error("Memoria llena o error de almacenamiento", e);
            if(typeof UI !== 'undefined') UI.showSnackbar("Error: Memoria llena");
        }
    },

    // --- IMPORTAR / EXPORTAR ---
    exportJSON() {
        const backup = {
            meta: { 
                version: "7.6", 
                date: new Date().toISOString(),
                platform: "SmartLifePro"
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
                
                // Protección extra al importar para no perder gamificación
                if (!this.store.gamification) {
                    this.store.gamification = { xp: 0, level: 1, badges: [] };
                }

                // Asegurar compatibilidad al importar backups viejos
                if(this.store.settings && typeof this.store.settings.pin === 'undefined') {
                    this.store.settings.pin = null;
                }

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
    
        // --- GESTIÓN DE ALMACENAMIENTO ---
    getStorageUsage() {
        let totalUsed = 0;
        // Límite típico de localStorage (5MB = 5242880 bytes). 
        // Algunos navegadores dan 10MB, pero calculamos sobre 5MB para seguridad.
        const TOTAL_LIMIT = 5242880; 

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                // Cada caracter UTF-16 ocupa 2 bytes
                const amount = (localStorage[key].length + key.length) * 2;
                totalUsed += amount;
            }
        }

        const usedKB = (totalUsed / 1024).toFixed(2);
        const totalKB = (TOTAL_LIMIT / 1024).toFixed(0);
        const percent = ((totalUsed / TOTAL_LIMIT) * 100).toFixed(1);
        
        // Estado de salud
        let status = 'good'; // Verde
        if(percent > 70) status = 'warning'; // Naranja
        if(percent > 90) status = 'critical'; // Rojo

        return {
            usedBytes: totalUsed,
            limitBytes: TOTAL_LIMIT,
            usedKB: usedKB,
            totalKB: totalKB,
            percent: percent > 100 ? 100 : percent,
            status: status
        };
    },
    cleanOldPhotos() {
        if (!this.store.expenses) return;
        const beforeCount = this.store.expenses.length;
        let photosRemoved = 0;
        const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

        this.store.expenses.forEach(exp => {
            // Si tiene foto Y es antiguo
            if (exp.photo && exp.date < threeMonthsAgo) {
                exp.photo = null; // Borramos solo la foto, mantenemos el gasto
                photosRemoved++;
            }
        });

        if (photosRemoved > 0) {
            this.save();
            if(typeof UI !== 'undefined') {
                UI.showSnackbar(`Se limpiaron ${photosRemoved} fotos antiguas.`);
                UI.renderSettings(); // Refrescar la barra
            }
        } else {
             if(typeof UI !== 'undefined') UI.showSnackbar("No hay fotos antiguas para borrar.");
        }
    },

};
