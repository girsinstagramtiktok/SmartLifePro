/* =========================================
   SMART LIFE PRO - MAIN CONTROLLER (V7.6 - PIN SECURITY)
   Autor: A_True_Alpha
   ========================================= */

const Main = {
    sessionAuthenticated: false,
    
    // Variables para el PIN
    tempPin: "",
    isSettingUpPin: false,

    init() {
        console.log("Iniciando Smart Life Pro v7.6...");
        
        // 1. Cargar datos
        if (typeof Data !== 'undefined') Data.init();
        
        // 2. Inyectar pantalla de bloqueo (PIN)
        this.injectLockScreenHTML();
        
        // 3. Verificar seguridad (PIN)
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

    // --- SEGURIDAD (PIN) ---
    /* EN MAIN.JS */

injectLockScreenHTML() {
    if (document.getElementById('lock-screen')) return;

    const div = document.createElement('div');
    div.id = 'lock-screen';
    div.className = 'hidden'; 
    div.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="font-size:40px; margin-bottom:10px;"></div>
            
            <h2 style="margin-bottom:30px; color:var(--text-color);">PIN</h2>
            
            <div class="pin-display" id="pin-dots">
                <div class="pin-dot"></div><div class="pin-dot"></div>
                <div class="pin-dot"></div><div class="pin-dot"></div>
                <div class="pin-dot"></div><div class="pin-dot"></div>
            </div>

          

<div class="pin-pad">
    <div class="pin-btn" onclick="Main.pressPin(1)">1</div>
    <div class="pin-btn" onclick="Main.pressPin(2)">2</div>
    <div class="pin-btn" onclick="Main.pressPin(3)">3</div>
    <div class="pin-btn" onclick="Main.pressPin(4)">4</div>
    <div class="pin-btn" onclick="Main.pressPin(5)">5</div>
    <div class="pin-btn" onclick="Main.pressPin(6)">6</div>
    <div class="pin-btn" onclick="Main.pressPin(7)">7</div>
    <div class="pin-btn" onclick="Main.pressPin(8)">8</div>
    <div class="pin-btn" onclick="Main.pressPin(9)">9</div>
    
    <div class="pin-btn clear"></div> <div class="pin-btn" onclick="Main.pressPin(0)">0</div>
    
    <div class="pin-btn clear" onclick="Main.clearPin()" style="display:flex; align-items:center; justify-content:center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
            <line x1="18" y1="9" x2="12" y2="15"></line>
            <line x1="12" y1="9" x2="18" y2="15"></line>
        </svg>
    </div>
</div>


       
<button onclick="Main.forgotPin()" 
        style="margin-top:30px; background:none; border:none; color:var(--text-sec); font-size:12px; text-decoration:underline;"
        data-i18n="pin_forgot">
    ${UI.t('pin_forgot')}
</button>

        </div>
    `;
    document.body.appendChild(div);
},


    // --- LÓGICA DEL TECLADO PIN ---
    pressPin(num) {
        if (this.tempPin.length < 6) {
            this.tempPin += num;
            this.updatePinUI();
            
            // Verificar automáticamente al llegar a 6 dígitos
            if (this.tempPin.length === 6) {
                setTimeout(() => this.validatePin(), 100);
            }
        }
        if(navigator.vibrate) navigator.vibrate(10);
    },

    clearPin() {
        this.tempPin = this.tempPin.slice(0, -1);
        this.updatePinUI();
    },

    updatePinUI() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, index) => {
            if (index < this.tempPin.length) dot.classList.add('filled');
            else dot.classList.remove('filled');
        });
    },

    validatePin() {
        const savedPin = Data.store.settings.pin;
        
        // CASO 1: Configurando nuevo PIN (Si vienes desde Ajustes)
        if (this.isSettingUpPin) {
            Data.store.settings.pin = this.tempPin;
            Data.save();
            this.isSettingUpPin = false;
            document.getElementById('lock-screen').classList.add('hidden');
            this.renderSettingsView();
            UI.showSnackbar("PIN creado correctamente ");
            return;
        }

        // CASO 2: Desbloqueando App
        if (this.tempPin === savedPin) {
            // PIN Correcto
            this.tempPin = "";
            this.updatePinUI();
            this.unlockApp();
            if(navigator.vibrate) navigator.vibrate(50);
        } else {
            // PIN Incorrecto
            if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
            UI.showSnackbar("PIN Incorrecto ");
            this.tempPin = "";
            this.updatePinUI();
        }
    },

    checkSecurityAtStart() {
        // Si hay un PIN guardado, mostramos el bloqueo
        if (Data.store.settings && Data.store.settings.pin) {
            const lock = document.getElementById('lock-screen');
            if(lock) {
                lock.classList.remove('hidden');
                // Asegurar que el título sea correcto al inicio
                lock.querySelector('h2').innerText = "PIN";
            }
            return true; // Detiene la carga de la app
        }
        return false;
    },

    unlockApp() {
        this.sessionAuthenticated = true;
        const lock = document.getElementById('lock-screen');
        if(lock) lock.classList.add('hidden');
        this.continueLoadingApp();
    },
    
    // CORREGIDO: Usamos UI.confirm para el modal propio y lógica async
    async forgotPin() {
        const confirmed = await UI.confirm("reset_confirm", "confirm_desc");
        
        if(confirmed) {
            // Borrado completo y recarga
            localStorage.removeItem(Data.KEY);
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }
            location.reload();
        }
    },

    // --- RENDERIZADO DE AJUSTES ---
    renderSettingsView() {
        const container = document.getElementById('settings-inject');
        if (!container) return;

        const s = Data.store.settings;
        const isDark = s.darkMode ? 'checked' : '';
        const hasPin = s.pin !== null; // Verifica si hay PIN activo
        
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
                    <span>Bloqueo con PIN</span>
                    <label class="switch-wrap">
                        <input type="checkbox" ${hasPin ? 'checked' : ''} onchange="Main.togglePinLock()">
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
                ID: ${Data.KEY}<br>v7.6 PIN Secure
            </div>
        `;
    },

    // --- ACCIONES DE AJUSTES ---
    toggleDarkMode() {
        Data.store.settings.darkMode = !Data.store.settings.darkMode;
        Data.save();
        UI.refreshDOM(); 
    },

    async togglePinLock() {
    const hasPin = Data.store.settings.pin !== null;
    
    if (hasPin) {
        // CAMBIO: Ahora usamos UI.confirm que es tu modal personalizado
        const confirmed = await UI.confirm("confirm_title", "confirm_text");
        
        if (confirmed) {
            Data.store.settings.pin = null;
            Data.save();
            this.renderSettingsView();
            UI.showSnackbar(UI.t('msg_bio_inactive'));
        } else {
            // Si cancela, volvemos a pintar para que el switch se mantenga activo
            this.renderSettingsView();
        }
    } else {
        // Iniciar configuración de nuevo PIN
        this.isSettingUpPin = true;
        this.tempPin = "";
        this.updatePinUI();
        
        const lock = document.getElementById('lock-screen');
        if(lock) {
            // Usamos PIN simple para evitar problemas de traducción
            lock.querySelector('h2').innerText = "PIN";
            lock.classList.remove('hidden');
        }
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
