/* =========================================
   SMART LIFE PRO - MAIN CONTROLLER (V7.6 - BIO AUTH FIX)
   Autor: A_True_Alpha
   ========================================= */

const Main = {
    sessionAuthenticated: false,

    init() {
        console.log("Iniciando Smart Life Pro v7.6...");
        
        // 1. Cargar datos
        if (typeof Data !== 'undefined') Data.init();
        
        // 2. Inyectar pantalla de bloqueo
        this.injectLockScreenHTML();
        
        // 3. Verificar seguridad (Biometría)
        if (this.checkSecurityAtStart()) {
            return; // Esperar desbloqueo
        }

        // 4. Cargar app
        this.continueLoadingApp();
    },

    continueLoadingApp() {
        // Inicializar módulos
        if (typeof Finance !== 'undefined') Finance.checkMonthTransition();
        if (typeof Assistant !== 'undefined') Assistant.init();
        
        // Configurar visuales
        this.setRandomBackground();
        
        // --- APLICAR TEMA GUARDADO ---
        const savedTheme = (Data.store.settings && Data.store.settings.theme) ? Data.store.settings.theme : 'blue';
        this.applyThemeToBody(savedTheme);
        
        this.renderSettingsView(); 
        
        // Refrescar textos e idioma
        if(typeof UI !== 'undefined' && typeof UI.refreshDOM === 'function') {
            UI.refreshDOM();
        }
        
        // Quitar bloqueo
        const lockScreen = document.getElementById('lock-screen');
        if(lockScreen) lockScreen.classList.add('hidden');

        // Ir al inicio por defecto
        this.router('home');
    },

    // --- LÓGICA DE TEMAS (PERSONALIZACIÓN) ---
    setTheme(themeName) {
        // 1. Guardar en memoria
        if (!Data.store.settings) Data.store.settings = {};
        Data.store.settings.theme = themeName;
        Data.save();
        
        // 2. Aplicar visualmente
        this.applyThemeToBody(themeName);
        
        // 3. Refrescar selector en ajustes (para marcar el activo)
        this.renderSettingsView();
        
        // 4. Vibración
        if(navigator.vibrate) navigator.vibrate(10);
    },

    applyThemeToBody(themeName) {
        // Limpiar clases de temas anteriores
        document.body.classList.remove('theme-pink', 'theme-green', 'theme-orange', 'theme-red', 'theme-purple');
        
        // Si no es el default (blue), añadir la clase correspondiente
        if (themeName && themeName !== 'blue') {
            document.body.classList.add(`theme-${themeName}`);
        }
    },

    // --- NAVEGACIÓN (ROUTER) ---
    router(viewName) {
        // 1. Ocultar todas las vistas
        document.querySelectorAll('.view').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none'; // Forzar ocultado visual
        });

        // 2. Mostrar vista destino
        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.style.display = 'flex';
            setTimeout(() => target.classList.add('active'), 10);
        }

        // 3. Actualizar Dock (Barra inferior)
        document.querySelectorAll('.dock-btn').forEach(btn => btn.classList.remove('active'));
        const navBtn = document.getElementById(`nav-${viewName}`);
        if(navBtn) navBtn.classList.add('active');

        // 4. Lógica específica por vista
        if (viewName === 'lists' && typeof Shopping !== 'undefined') {
            Shopping.renderLists();
        }
        if (viewName === 'finance' && typeof Finance !== 'undefined') {
            const activeTab = document.querySelector('.segment-btn.active');
            if(activeTab) {
                const tabId = activeTab.id.replace('fin-tab-', '');
                Finance.setTab(tabId);
            } else {
                Finance.setTab('subs');
            }
        }
        
        if(navigator.vibrate) navigator.vibrate(5);
    },

    // --- MENÚ DE ACCIÓN (Action Sheet) ---
    openAddMenu() {
        this.resetMenu();
        document.getElementById('creation-sheet').classList.add('open');
        if(navigator.vibrate) navigator.vibrate(10);
    },

    closeAddMenu() {
        document.getElementById('creation-sheet').classList.remove('open');
    },

    showListOptions() {
        document.getElementById('menu-level-1').classList.add('hidden');
        document.getElementById('menu-level-2').classList.remove('hidden');
    },

    resetMenu() {
        const l1 = document.getElementById('menu-level-1');
        const l2 = document.getElementById('menu-level-2');
        if(l1) l1.classList.remove('hidden');
        if(l2) l2.classList.add('hidden');
    },

    openExpenseModalFromMenu() {
        this.closeAddMenu();
        if(typeof Finance !== 'undefined') Finance.openExpenseModal();
    },

    // --- PERFIL Y LOGROS ---
    openProfile() {
        if (typeof Assistant !== 'undefined') {
            Assistant.renderProfile(); 
        }
        document.getElementById('modal-profile').classList.add('open');
        if(navigator.vibrate) navigator.vibrate(10);
    },

    closeProfile() {
        document.getElementById('modal-profile').classList.remove('open');
    },

    // --- FONDOS Y ESTILO ---
    setRandomBackground() {
        const bgLayer = document.getElementById('bg-layer');
        if(!bgLayer) return;

        const backgrounds = ['bg1.png', 'bg2.png', 'bg3.png', 'bg4.png', 'bg5.png'];
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        
        bgLayer.style.backgroundImage = `url('${randomBg}')`;
        bgLayer.style.backgroundSize = 'cover';
        bgLayer.style.backgroundPosition = 'center';
        
        console.log(`Fondo establecido: ${randomBg}`);
    },

    // --- SEGURIDAD (BIO) ---
    injectLockScreenHTML() {
        if (document.getElementById('lock-screen')) return; 

        const div = document.createElement('div');
        div.id = 'lock-screen';
        div.className = 'hidden';
        div.innerHTML = `
            <div class="lock-icon-container"></div>
            <h2 style="margin-bottom:20px;">Smart Life</h2>
            <button class="auth-btn" onclick="Main.authenticate()">
                Desbloquear
            </button>
        `;
        document.body.appendChild(div);
    },

    checkSecurityAtStart() {
        if (Data.store.settings && Data.store.settings.biometrics) {
            const lock = document.getElementById('lock-screen');
            if(lock) {
                lock.classList.remove('hidden');
                setTimeout(() => this.authenticate(), 500);
            }
            return true;
        }
        return false;
    },

    // --- [CORREGIDO] AUTENTICACIÓN QUE USA LA CREDENCIAL GUARDADA ---
    async authenticate() {
        try {
            if (window.PublicKeyCredential && Data.store.settings.bioCredentialId) {
                
                // 1. Recuperar el ID guardado y convertirlo de Base64 a Buffer
                const savedId = Data.store.settings.bioCredentialId;
                const binaryId = Uint8Array.from(atob(savedId), c => c.charCodeAt(0));

                // 2. Desafío
                const challenge = new Uint8Array(32);
                window.crypto.getRandomValues(challenge);

                // 3. Pedir autenticación SOLO para esa credencial
                await navigator.credentials.get({
                    publicKey: {
                        challenge: challenge,
                        timeout: 60000,
                        userVerification: "required",
                        allowCredentials: [{
                            id: binaryId,
                            type: "public-key",
                            transports: ["internal"] // Prioriza sensor interno
                        }]
                    }
                });

                // Éxito
                if(navigator.vibrate) navigator.vibrate(20);
                this.unlockApp();

            } else {
                // Si no hay credencial guardada o no hay soporte
                console.warn("No hay credencial biométrica guardada.");
                
                // Si estaba activado por error pero sin ID, lo desactivamos para no bloquear al user
                if(Data.store.settings.biometrics) {
                    Data.store.settings.biometrics = false;
                    Data.save();
                }
                this.unlockApp(); 
            }
        } catch (e) {
            console.error("Auth fallida", e);
            if(typeof UI !== 'undefined') {
                UI.showSnackbar("Huella no reconocida. Intenta de nuevo.");
            }
        }
    },

    unlockApp() {
        this.sessionAuthenticated = true;
        this.continueLoadingApp();
    },

    // --- RENDERIZADO DE AJUSTES ---
    renderSettingsView() {
        const container = document.getElementById('settings-inject');
        if (!container) return;

        const s = Data.store.settings;
        const isBioActive = s.biometrics ? 'checked' : '';
        const isDark = s.darkMode ? 'checked' : '';
        
        // Tema actual (default 'blue')
        const currentTheme = s.theme || 'blue';

        container.innerHTML = `
            <div class="section-label" style="margin-top:0;">${UI.t('sec_general')}</div>
            
            <div class="glass-card">
                <div class="setting-item">
                    <span>${UI.t('dark_mode')}  </span>
                    <label class="switch-wrap">
                        <input type="checkbox" ${isDark} onchange="Main.toggleDarkMode()">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="setting-item" style="display:block; padding-top:10px; border-top:1px solid rgba(120,120,120,0.1); margin-top:10px;">
                    <div style="margin-bottom:12px; font-size:14px; opacity:0.8;">Tema de Color  </div>
                    <div class="theme-selector-grid">
                        <div class="theme-btn t-blue ${currentTheme === 'blue' ? 'active' : ''}" onclick="Main.setTheme('blue')"></div>
                        <div class="theme-btn t-green ${currentTheme === 'green' ? 'active' : ''}" onclick="Main.setTheme('green')"></div>
                        <div class="theme-btn t-orange ${currentTheme === 'orange' ? 'active' : ''}" onclick="Main.setTheme('orange')"></div>
                        <div class="theme-btn t-pink ${currentTheme === 'pink' ? 'active' : ''}" onclick="Main.setTheme('pink')"></div>
                        <div class="theme-btn t-purple ${currentTheme === 'purple' ? 'active' : ''}" onclick="Main.setTheme('purple')"></div>
                        <div class="theme-btn t-red ${currentTheme === 'red' ? 'active' : ''}" onclick="Main.setTheme('red')"></div>
                    </div>
                </div>
                
                <div class="setting-item" style="border-top:1px solid rgba(120,120,120,0.1); margin-top:10px; padding-top:15px;">
                    <span>${UI.t('bio_lock')}</span>
                    <label class="switch-wrap">
                        <input type="checkbox" ${isBioActive} onchange="Main.toggleBiometrics()">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <span>${UI.t('currency')}</span>
                    <select class="setting-select" onchange="Main.setCurrency(this.value)">
                        <option value="$" ${s.currency === '$' ? 'selected' : ''}>$ (USD)</option>
                        <option value="€" ${s.currency === '€' ? 'selected' : ''}>€ (EUR)</option>
                        <option value="R$" ${s.currency === 'R$' ? 'selected' : ''}>R$ (BRL)</option>
                        <option value="Bs" ${s.currency === 'Bs' ? 'selected' : ''}>Bs (VES)</option>
                    </select>
                </div>
            </div>

            <div class="section-label">Idioma</div>
            <div class="lang-grid">
                <div class="lang-btn-opt ${s.lang === 'es' ? 'selected' : ''}" onclick="Main.setLang('es')">
                    <div class="flag-icon flag-es"></div>
                    <span>Espa&ntilde;ol</span>
                </div>
                <div class="lang-btn-opt ${s.lang === 'en' ? 'selected' : ''}" onclick="Main.setLang('en')">
                    <div class="flag-icon flag-en"></div>
                    <span>English</span>
                </div>
                <div class="lang-btn-opt ${s.lang === 'pt' ? 'selected' : ''}" onclick="Main.setLang('pt')">
                    <div class="flag-icon flag-pt"></div>
                    <span>Portugu&ecirc;s</span>
                </div>
            </div>

            <div class="section-label" style="margin-top:20px;">${UI.t('sec_data')}</div>
            <div class="glass-card">
                <div class="btn-data-row">
                    <button class="btn-data" onclick="Main.downloadBackup()">
                          ${UI.t('btn_export')}
                    </button>
                    <button class="btn-data" onclick="document.getElementById('import-file').click()">
                          ${UI.t('btn_import')}
                    </button>
                    <input type="file" id="import-file" hidden accept=".json" onchange="Main.handleImport(this)">
                </div>
                <button class="btn-danger-outline" onclick="Main.factoryReset()">
                       ${UI.t('btn_reset')}
                </button>
            </div>
            
            <div style="text-align:center; margin-top:30px; margin-bottom:50px; opacity:0.3; font-size:12px;">
                ID: ${Data.KEY}<br>v7.6 BioFix
            </div>
        `;
    },

    // --- ACCIONES DE AJUSTES ---
    toggleDarkMode() {
        Data.store.settings.darkMode = !Data.store.settings.darkMode;
        Data.save();
        UI.refreshDOM(); 
    },

    // --- [CORREGIDO] REGISTRO DE CREDENCIAL AL ACTIVAR ---
    async toggleBiometrics() {
        const currentState = Data.store.settings.biometrics;
        
        if (!currentState) {
            // --- ACTIVANDO: CREAMOS LA LLAVE ---
            try {
                if (!window.PublicKeyCredential) throw new Error("No soportado");

                // Opciones de registro
                // En main.js -> toggleBiometrics
const publicKeyCredentialCreationOptions = {
    challenge: Uint8Array.from("SmartLifeProChallenge", c => c.charCodeAt(0)),
    // CAMBIO AQUÍ: Eliminamos 'id' para evitar errores con IPs o localhost
    rp: { 
        name: "Smart Life Pro" 
    },
    user: {
        id: Uint8Array.from("MasterUserID", c => c.charCodeAt(0)),
        name: "master@smartlife.pro",
        displayName: "Master"
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    authenticatorSelection: {
        authenticatorAttachment: "platform", 
        userVerification: "required"
    },
    timeout: 60000,
    attestation: "none"
};


                // Pedir huella para CREAR la llave
                const credential = await navigator.credentials.create({
                    publicKey: publicKeyCredentialCreationOptions
                });

                // Guardar el ID de la credencial (convertido a Base64)
                const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
                
                Data.store.settings.biometrics = true;
                Data.store.settings.bioCredentialId = credId; // <--- GUARDAMOS ID
                Data.save();
                
                this.renderSettingsView();
                UI.showSnackbar(UI.t('msg_bio_active'));

            } catch (e) {
                console.error("Error creando credencial:", e);
                UI.showSnackbar("Error: No se pudo registrar la huella.");
                // Revertir
                Data.store.settings.biometrics = false;
                this.renderSettingsView(); 
            }
        } else {
            // --- DESACTIVANDO ---
            Data.store.settings.biometrics = false;
            Data.store.settings.bioCredentialId = null; // Borrar ID
            Data.save();
            this.renderSettingsView(); 
            UI.showSnackbar(UI.t('msg_bio_inactive'));
        }
    },

    setCurrency(curr) {
        Data.store.settings.currency = curr;
        if(Data.store.budget) Data.store.budget.currency = curr; 
        Data.save();
        UI.refreshDOM(); 
    },

    setLang(lang) {
        Data.store.settings.lang = lang;
        Data.save();
        this.renderSettingsView(); 
        UI.refreshDOM(); 
        UI.showSnackbar(UI.t('msg_updated'));
        if(typeof Assistant !== 'undefined') Assistant.updateMood();
    },

    // --- GESTIÓN DE DATOS ---
    downloadBackup() {
        const json = Data.exportJSON();
        UI.showSnackbar("Generando...");
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart_life_backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { 
            document.body.removeChild(a); 
            window.URL.revokeObjectURL(url); 
        }, 100);
    },

    handleImport(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const success = Data.importJSON(e.target.result);
            if(success) {
                await UI.confirm("import_success_title", "import_success_msg");
                location.reload();
            } else {
                UI.showSnackbar("Error: Archivo inválido o corrupto");
            }
        };
        reader.readAsText(file);
        input.value = ''; 
    },

    async factoryReset() {
        const confirm = await UI.confirm("confirm_title", "confirm_desc");
        if (confirm) {
            localStorage.removeItem(Data.KEY);
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }
            location.reload();
        }
    },

    closeModal(id) {
        document.getElementById(`modal-${id}`).classList.remove('open');
    }
};
