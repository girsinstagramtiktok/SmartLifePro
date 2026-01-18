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
    }
};
