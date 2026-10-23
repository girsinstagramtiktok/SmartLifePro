<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Descargar main.js con Huella y Rostro</title>
<style>
  body { font-family: system-ui, sans-serif; background: #090d16; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; }
  .box { background: #151e2e; border: 1px solid #2d3b55; border-radius: 24px; padding: 32px; max-width: 440px; width: 90%; text-align: center; }
  button { width: 100%; padding: 16px; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; color: white; background: #10b981; }
</style>
</head>
<body>
<div class="box">
  <h2>🫆 main.js (Con Huella + Rostro Android)</h2>
  <button onclick="dl()">⬇️ Descargar main.js Ahora</button>
</div>
<textarea id="code" style="display:none;">
/* =========================================
   SMART LIFE PRO - MAIN CONTROLLER (V11.2 - BIOMETRIC FINGERPRINT/FACE + ANDROID READY)
   Autor: A_True_Alpha
   ========================================= */

const Main = {
    sessionAuthenticated: false,
    tempPin: "",
    isSettingUpPin: false,

    init() {
        console.log("Iniciando Smart Life Pro v11.2...");
        if (typeof Data !== 'undefined') Data.init();
        this.injectLockScreenHTML();
        if (this.checkSecurityAtStart()) return;
        this.continueLoadingApp();
    },

    continueLoadingApp() {
        if (typeof Finance !== 'undefined') {
            Finance.checkMonthTransition();
            Finance.initSmartButton();
        }
        if (typeof Assistant !== 'undefined') Assistant.init();

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (typeof Assistant !== 'undefined') {
                    Assistant.validateDailyQuests();
                    Assistant.checkDailyStreak();
                    const modalProfile = document.getElementById('modal-profile');
                    if (modalProfile && modalProfile.classList.contains('open')) {
                        Assistant.renderProfile();
                    }
                }
                if (typeof Finance !== 'undefined') {
                    Finance.checkMonthTransition();
                }
            }
        });

        this.setRandomBackground();

        const savedTheme = (Data.store.settings && Data.store.settings.theme) ? Data.store.settings.theme : 'blue';
        this.applyThemeToBody(savedTheme);

        const savedFont = (Data.store.settings && Data.store.settings.font) ? Data.store.settings.font : 'Modern';
        if (typeof UI !== 'undefined') UI.changeFont(savedFont);

        if (typeof UI !== 'undefined') UI.renderSettingsView();
        if (typeof UI !== 'undefined' && typeof UI.refreshDOM === 'function') UI.refreshDOM();

        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen) lockScreen.classList.add('hidden');

        this.router('home');
    },

    setTheme(themeName) {
        if (!Data.store.settings) Data.store.settings = {};
        Data.store.settings.theme = themeName;
        Data.save();
        this.applyThemeToBody(themeName);

        const savedFont = (Data.store.settings && Data.store.settings.font) ? Data.store.settings.font : 'Modern';
        if (typeof UI !== 'undefined') UI.changeFont(savedFont);
        if (typeof UI !== 'undefined') UI.renderSettingsView();
        if (navigator.vibrate) navigator.vibrate(10);
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
        if (navBtn) navBtn.classList.add('active');

        if (viewName === 'lists' && typeof Shopping !== 'undefined') Shopping.renderLists();
        if (viewName === 'finance' && typeof Finance !== 'undefined') {
            const activeTab = document.querySelector('.segment-btn.active');
            if (activeTab && activeTab.id.startsWith('fin-tab-')) {
                const tabId = activeTab.id.replace('fin-tab-', '');
                Finance.setTab(tabId);
            } else {
                Finance.setTab('subs');
            }
        }
        if (navigator.vibrate) navigator.vibrate(5);
    },

    openAddMenu() {
        this.resetMenu();
        document.getElementById('creation-sheet').classList.add('open');
        if (navigator.vibrate) navigator.vibrate(10);
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
        if (l1) l1.classList.remove('hidden');
        if (l2) l2.classList.add('hidden');
    },

    openExpenseModalFromMenu() {
        this.closeAddMenu();
        if (typeof Finance !== 'undefined') Finance.openExpenseModal();
    },

    openProfile() {
        if (typeof Assistant !== 'undefined') Assistant.renderProfile();
        document.getElementById('modal-profile').classList.add('open');
        if (navigator.vibrate) navigator.vibrate(10);
    },

    closeProfile() {
        document.getElementById('modal-profile').classList.remove('open');
    },

    setRandomBackground() {
        const bgLayer = document.getElementById('bg-layer');
        if (!bgLayer) return;

        const gradients = [
            'linear-gradient(135deg, #DBEAFE 0%, #F1F5F9 100%)',
            'linear-gradient(120deg, #FDFBFB 0%, #FFE4E6 100%)',
            'linear-gradient(to top, #D1FAE5 0%, #F0FDF4 100%)',
            'linear-gradient(135deg, #EDE9FE 0%, #F8FAFC 100%)',
            'radial-gradient(circle at 50% 0%, #E0F2FE 10%, #F1F5F9 90%)'
        ];

        const darkGradients = [
            'radial-gradient(circle at 50% -20%, #1E3A8A 0%, #090D16 80%)',
            'linear-gradient(to bottom, #1E1B4B, #090D16)',
            'linear-gradient(to top, #090D16, #064E3B)',
            'linear-gradient(135deg, #1E293B 0%, #090D16 100%)',
            'linear-gradient(to bottom, #0F172A, #1E293B)'
        ];

        const list = (Data.store.settings && Data.store.settings.darkMode) ? darkGradients : gradients;
        const currentBg = bgLayer.style.backgroundImage;
        let newBg;
        do {
            newBg = list[Math.floor(Math.random() * list.length)];
        } while (newBg === currentBg && list.length > 1);

        bgLayer.style.backgroundImage = newBg;
    },

    injectLockScreenHTML() {
        if (document.getElementById('lock-screen')) return;
        const div = document.createElement('div');
        div.id = 'lock-screen';
        div.className = 'hidden';
        div.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="font-size:40px; margin-bottom:10px;">🔒</div>
                <h2 style="margin-bottom:30px; color:var(--text-color);">PIN / Biometría</h2>
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
                    <div class="pin-btn" onclick="Main.triggerBiometricUnlock()" style="visibility:visible !important; pointer-events:auto !important; color:var(--primary);" title="Huella / Rostro">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2"/></svg>
                    </div>
                    <div class="pin-btn" onclick="Main.pressPin(0)">0</div>
                    <div class="pin-btn clear" onclick="Main.clearPin()" style="display:flex; align-items:center; justify-content:center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                    </div>
                </div>
                <button onclick="Main.forgotPin()" style="margin-top:30px; background:none; border:none; color:var(--text-sec); font-size:12px; text-decoration:underline;">
                    Olvidé mi PIN
                </button>
            </div>
        `;
        document.body.appendChild(div);
    },

    triggerBiometricUnlock() {
        if (this.isSettingUpPin) return;
        // 1. Si estamos en el APK Nativo de Android, lanza el lector nativo de Huella / Rostro
        if (window.SmartyAndroid && typeof window.SmartyAndroid.authenticateBiometric === 'function') {
            window.SmartyAndroid.authenticateBiometric();
            return;
        }
        if (typeof UI !== 'undefined') {
            UI.showSnackbar("Biometría disponible en la App Android instalada 🫆");
        }
    },

    pressPin(num) {
        if (this.tempPin.length < 6) {
            this.tempPin += num;
            this.updatePinUI();
            if (this.tempPin.length === 6) setTimeout(() => this.validatePin(), 100);
        }
        if (navigator.vibrate) navigator.vibrate(10);
    },

    clearPin() {
        this.tempPin = this.tempPin.slice(0, -1);
        this.updatePinUI();
    },

    updatePinUI() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('filled', index < this.tempPin.length);
        });
    },

    validatePin() {
        const savedPin = Data.store.settings.pin;
        if (this.isSettingUpPin) {
            Data.store.settings.pin = this.tempPin;
            Data.save();
            this.isSettingUpPin = false;
            document.getElementById('lock-screen').classList.add('hidden');
            if (typeof UI !== 'undefined') {
                UI.renderSettingsView();
                UI.showSnackbar("PIN y Huella activados 🔒");
            }
            return;
        }
        if (this.tempPin === savedPin) {
            this.tempPin = "";
            this.updatePinUI();
            this.unlockApp();
        } else {
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            if (typeof UI !== 'undefined') UI.showSnackbar("PIN Incorrecto ❌");
            this.tempPin = "";
            this.updatePinUI();
        }
    },

    checkSecurityAtStart() {
        if (Data.store.settings && Data.store.settings.pin) {
            const lock = document.getElementById('lock-screen');
            if (lock) {
                lock.classList.remove('hidden');
                lock.querySelector('h2').innerText = "PIN / Biometría";
                // Lanzar huella/rostro automáticamente al abrir la app en Android
                setTimeout(() => this.triggerBiometricUnlock(), 350);
            }
            return true;
        }
        return false;
    },

    unlockApp() {
        this.sessionAuthenticated = true;
        const lock = document.getElementById('lock-screen');
        if (lock) lock.classList.add('hidden');
        this.continueLoadingApp();
    },

    async forgotPin() {
        const confirmed = await UI.confirm("reset_confirm", "confirm_desc");
        if (confirmed) {
            localStorage.removeItem(Data.KEY);
            location.reload();
        }
    },

    toggleDarkMode() {
        Data.store.settings.darkMode = !Data.store.settings.darkMode;
        Data.save();
        this.setRandomBackground();
        if (typeof UI !== 'undefined') UI.refreshDOM();
    },

    async togglePinLock() {
        const hasPin = Data.store.settings.pin !== null;
        if (hasPin) {
            const confirmed = await UI.confirm("confirm_title", "confirm_text");
            if (confirmed) {
                Data.store.settings.pin = null;
                Data.save();
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
            if (lock) {
                lock.querySelector('h2').innerText = "Crear PIN (Respaldo de Huella)";
                lock.classList.remove('hidden');
            }
        }
    },

    changePin() {
        this.isSettingUpPin = true;
        this.tempPin = "";
        this.updatePinUI();
        const lock = document.getElementById('lock-screen');
        if (lock) {
            lock.querySelector('h2').innerText = "Nuevo PIN";
            lock.classList.remove('hidden');
        }
    },

    downloadBackup() {
        const json = Data.exportJSON();
        UI.showSnackbar("Generando copia...");
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
            if (success) {
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
            location.reload();
        }
    },

    toggleSmartTips() {
        if (!Data.store.settings) Data.store.settings = {};
        const chk = document.getElementById('smarty-tips-toggle');
        Data.store.settings.showSmartTips = chk.checked;
        Data.save();
        if (typeof UI !== 'undefined') {
            UI.showSnackbar(`Consejos ${chk.checked ? "Activados ✨" : "Desactivados"}`);
        }
    },

    closeModal(id) {
        document.getElementById(`modal-${id}`).classList.remove('open');
    }
};

function autoScaleApp() {
    if (window.innerWidth > 700) {
        document.body.style.maxWidth = '450px';
        document.body.style.margin = '0 auto';
        document.body.style.minHeight = '100vh';
        document.body.style.boxShadow = '0 0 50px rgba(0,0,0,0.12)';
    } else {
        document.body.style.maxWidth = '100%';
        document.body.style.margin = '0';
        document.body.style.boxShadow = 'none';
    }
}
window.addEventListener('resize', autoScaleApp);
window.addEventListener('DOMContentLoaded', autoScaleApp);
autoScaleApp();
</textarea>
<script>
function dl() {
  const content = document.getElementById('code').value.trim();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  a.download = 'main.js';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
</script>
</body>
</html>
