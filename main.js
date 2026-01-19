/* =========================================
   SMART LIFE PRO - MAIN CONTROLLER (V10.0 - CLEANED)
   Autor: A_True_Alpha
   ========================================= */

const Main = {
    sessionAuthenticated: false,
    tempPin: "",
    isSettingUpPin: false,

    init() {
        console.log("Iniciando Smart Life Pro v10.0...");
        if (typeof Data !== 'undefined') Data.init();
        this.injectLockScreenHTML();
        if (this.checkSecurityAtStart()) return;
        this.continueLoadingApp();
    },

        continueLoadingApp() {
        // Inicializar módulos
        if (typeof Finance !== 'undefined') Finance.checkMonthTransition();
        if (typeof Assistant !== 'undefined') Assistant.init();
        
        // Configurar fondo
        this.setRandomBackground();
        
        // 1. APLICAR TEMA COLOR
        const savedTheme = (Data.store.settings && Data.store.settings.theme) ? Data.store.settings.theme : 'blue';
        this.applyThemeToBody(savedTheme);
        
        // 2. APLICAR FUENTE (ESTO ES LO QUE FALTABA O FALLABA)
        // Usamos 'Modern' como default si no hay nada guardado
        const savedFont = (Data.store.settings && Data.store.settings.font) ? Data.store.settings.font : 'Modern';
        if(typeof UI !== 'undefined') UI.changeFont(savedFont);
        
        // 3. Renderizar Ajustes (Llama a UI, no a this)
        if (typeof UI !== 'undefined') UI.renderSettingsView(); 
        
        // Refrescar textos
        if(typeof UI !== 'undefined' && typeof UI.refreshDOM === 'function') UI.refreshDOM();
        
        // Quitar bloqueo
        const lockScreen = document.getElementById('lock-screen');
        if(lockScreen) lockScreen.classList.add('hidden');

        // Ir al inicio
        this.router('home');
    },


    setTheme(themeName) {
        if (!Data.store.settings) Data.store.settings = {};
        Data.store.settings.theme = themeName;
        Data.save();
        this.applyThemeToBody(themeName);
        
                const savedFont = (Data.store.settings && Data.store.settings.font) ? Data.store.settings.font : 'Modern';
        if(typeof UI !== 'undefined') UI.changeFont(savedFont);
        // LLAMADA CORREGIDA
        if (typeof UI !== 'undefined') UI.renderSettingsView();
        if(navigator.vibrate) navigator.vibrate(10);
    },

    applyThemeToBody(themeName) {
        document.body.classList.remove('theme-pink', 'theme-green', 'theme-orange', 'theme-red', 'theme-purple');
        if (themeName && themeName !== 'blue') {
            document.body.classList.add(`theme-${themeName}`);
        }
    },

    router(viewName) {
        document.querySelectorAll('.view').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.style.display = 'flex';
            setTimeout(() => target.classList.add('active'), 10);
        }
        document.querySelectorAll('.dock-btn').forEach(btn => btn.classList.remove('active'));
        const navBtn = document.getElementById(`nav-${viewName}`);
        if(navBtn) navBtn.classList.add('active');

        if (viewName === 'lists' && typeof Shopping !== 'undefined') Shopping.renderLists();
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

    openProfile() {
        if (typeof Assistant !== 'undefined') Assistant.renderProfile(); 
        document.getElementById('modal-profile').classList.add('open');
        if(navigator.vibrate) navigator.vibrate(10);
    },

    closeProfile() {
        document.getElementById('modal-profile').classList.remove('open');
    },

    setRandomBackground() {
        const bgLayer = document.getElementById('bg-layer');
        if(!bgLayer) return;
        const backgrounds = ['bg1.png', 'bg2.png', 'bg3.png', 'bg4.png', 'bg5.png'];
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        bgLayer.style.backgroundImage = `url('${randomBg}')`;
        bgLayer.style.backgroundSize = 'cover';
        bgLayer.style.backgroundPosition = 'center';
    },

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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                    </div>
                </div>
                <button onclick="Main.forgotPin()" style="margin-top:30px; background:none; border:none; color:var(--text-sec); font-size:12px; text-decoration:underline;" data-i18n="pin_forgot">
                    ${typeof UI !== 'undefined' ? UI.t('pin_forgot') : 'Forgot PIN'}
                </button>
            </div>
        `;
        document.body.appendChild(div);
    },

    pressPin(num) {
        if (this.tempPin.length < 6) {
            this.tempPin += num;
            this.updatePinUI();
            if (this.tempPin.length === 6) setTimeout(() => this.validatePin(), 100);
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
        if (this.isSettingUpPin) {
            Data.store.settings.pin = this.tempPin;
            Data.save();
            this.isSettingUpPin = false;
            document.getElementById('lock-screen').classList.add('hidden');
            // LLAMADA CORREGIDA A UI
            if (typeof UI !== 'undefined') {
                UI.renderSettingsView();
                UI.showSnackbar("PIN creado correctamente ");
            }
            return;
        }
        if (this.tempPin === savedPin) {
            this.tempPin = "";
            this.updatePinUI();
            this.unlockApp();
            if(navigator.vibrate) navigator.vibrate(50);
        } else {
            if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
            if (typeof UI !== 'undefined') UI.showSnackbar("PIN Incorrecto ");
            this.tempPin = "";
            this.updatePinUI();
        }
    },

    checkSecurityAtStart() {
        if (Data.store.settings && Data.store.settings.pin) {
            const lock = document.getElementById('lock-screen');
            if(lock) {
                lock.classList.remove('hidden');
                lock.querySelector('h2').innerText = "PIN";
            }
            return true;
        }
        return false;
    },

    unlockApp() {
        this.sessionAuthenticated = true;
        const lock = document.getElementById('lock-screen');
        if(lock) lock.classList.add('hidden');
        this.continueLoadingApp();
    },
    
    async forgotPin() {
        const confirmed = await UI.confirm("reset_confirm", "confirm_desc");
        if(confirmed) {
            localStorage.removeItem(Data.KEY);
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }
            location.reload();
        }
    },

    // --- AQUÍ ESTABA renderSettingsView -> ELIMINADA ---

    toggleDarkMode() {
        Data.store.settings.darkMode = !Data.store.settings.darkMode;
        Data.save();
        if (typeof UI !== 'undefined') UI.refreshDOM(); 
    },

    async togglePinLock() {
        const hasPin = Data.store.settings.pin !== null;
        if (hasPin) {
            const confirmed = await UI.confirm("confirm_title", "confirm_text");
            if (confirmed) {
                Data.store.settings.pin = null;
                Data.save();
                // LLAMADA CORREGIDA
                if (typeof UI !== 'undefined') {
                    UI.renderSettingsView();
                    UI.showSnackbar(UI.t('msg_bio_inactive'));
                }
            } else {
                if (typeof UI !== 'undefined') UI.renderSettingsView();
            }
        } else {
            this.isSettingUpPin = true;
            this.tempPin = "";
            this.updatePinUI();
            const lock = document.getElementById('lock-screen');
            if(lock) {
                lock.querySelector('h2').innerText = "PIN";
                lock.classList.remove('hidden');
            }
        }
    },

    setCurrency(curr) {
        Data.store.settings.currency = curr;
        if(Data.store.budget) Data.store.budget.currency = curr; 
        Data.save();
        if (typeof UI !== 'undefined') UI.refreshDOM(); 
    },

    setLang(lang) {
        Data.store.settings.lang = lang;
        Data.save();
        // LLAMADA CORREGIDA
        if (typeof UI !== 'undefined') {
            UI.renderSettingsView(); 
            UI.refreshDOM(); 
            UI.showSnackbar(UI.t('msg_updated'));
        }
        if(typeof Assistant !== 'undefined') Assistant.updateMood();
    },

    // --- CHANGE PIN (Helper faltante) ---
    changePin() {
        this.isSettingUpPin = true;
        this.tempPin = "";
        this.updatePinUI();
        const lock = document.getElementById('lock-screen');
        if(lock) {
            lock.querySelector('h2').innerText = "Nuevo PIN";
            lock.classList.remove('hidden');
        }
    },

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
                UI.showSnackbar("Error: Archivo inválido");
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
