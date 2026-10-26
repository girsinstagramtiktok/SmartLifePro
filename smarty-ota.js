/* =========================================
   SMART LIFE PRO - FULL MASTER MODULE (V20.1-OTA)
   Corrige la restauración y creación de copias de seguridad en Android
   ========================================= */
(function () {
    window.SMARTY_APK_VERSION = "20.1-OTA";
    document.getElementById("fin-bank-summary-banner")?.remove();
    document.getElementById("pace-day-marker")?.remove();
    document.getElementById("smarty-master-styles")?.remove();

    // ---------------------------------------------------------
    // 0. REPARACION INMEDIATA DE COPIAS DE SEGURIDAD (CREAR Y RESTAURAR)
    // ---------------------------------------------------------
    window._onAndroidBackupFileRestored = async function (jsonString) {
        try {
            if (!jsonString || typeof jsonString !== "string") {
                UI.showSnackbar("Error: Archivo vacío");
                return;
            }
            const cleanJson = jsonString.trim();
            const success = Data.importJSON(cleanJson);
            if (success) {
                Data.save();
                UI.showSnackbar("✅ Copia restaurada con éxito. Recargando...");
                setTimeout(() => location.reload(), 900);
            } else {
                UI.showSnackbar("❌ Error: El archivo no es una copia válida");
            }
        } catch (err) {
            console.error("Error restaurando backup:", err);
            UI.showSnackbar("❌ Error al leer el archivo de respaldo");
        }
    };

    if (typeof Main !== "undefined") {
        // Mejorar Crear Copia para que funcione siempre en Android
        Main.downloadBackup = function () {
            const json = Data.exportJSON();
            if (window.SmartyAndroid && window.SmartyAndroid.saveSingleOverwriteBackup) {
                window.SmartyAndroid.saveSingleOverwriteBackup(json);
            }
            if (window.SmartyAndroid && window.SmartyAndroid.saveBackupFile) {
                const fileName = "SmartLifePro_Backup.json";
                window.SmartyAndroid.saveBackupFile(json, fileName);
                return;
            }
            UI.showSnackbar("✅ Copia guardada en Descargas");
        };

        // Mejorar handleImport estándar por si el input file nativo se dispara directo
        Main.handleImport = function (input) {
            const file = input && input.files && input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                window._onAndroidBackupFileRestored(e.target.result);
            };
            reader.readAsText(file);
            input.value = "";
        };
    }

    // ---------------------------------------------------------
    // 1. ESTILOS COMPLETOS
    // ---------------------------------------------------------
    const st = document.createElement("style");
    st.id = "smarty-master-styles";
    st.innerHTML = `
        #listening-overlay:not(.active), .modal-overlay:not(.open), #custom-confirm:not(.open) { display:none !important; pointer-events:none !important; }
        .pin-pad .pin-btn.bio-btn-active { visibility:visible !important; pointer-events:auto !important; color:var(--primary) !important; font-size:11px !important; font-weight:800 !important; }
        body.dark-mode { --bg-body:#05070B !important; --glass-bg:linear-gradient(145deg, rgba(24,32,48,0.92) 0%, rgba(14,19,30,0.95) 100%) !important; --item-bg:#111726 !important; --input-bg:#192236 !important; }
        body.dark-mode .glass-card, body.dark-mode .item-row, body.dark-mode .mascot-compact-row { background:linear-gradient(145deg, rgba(26,35,52,0.92), rgba(15,21,33,0.95)) !important; border-top:1px solid rgba(255,255,255,0.16) !important; box-shadow:0 14px 34px rgba(0,0,0,0.55) !important; }
        #budget-circle { filter:none !important; box-shadow:none !important; }
        #pace-day-marker, #fin-bank-summary-banner, #settings-inject .setting-group, #settings-inject .div-line { display:none !important; }
        .xp-fill-vertical { background:linear-gradient(to top, #F59E0B, #FDE047) !important; box-shadow:0 0 10px rgba(251,191,36,0.6) !important; }
        .bottom-dock .dock-btn.active { background:rgba(0,110,230,0.14) !important; border-radius:18px !important; padding:8px !important; transform:translateY(-2px) !important; }
        .tone-orange { color:#EA580C; background:rgba(234,88,12,0.14); }
        .tone-crimson { color:#E11D48; background:rgba(225,29,72,0.14); }
        .tone-ant { color:#D97706; background:rgba(217,119,6,0.15); }
        .brand-logo-real { width:38px; height:38px; border-radius:11px; display:inline-flex; align-items:center; justify-content:center; margin-right:12px; flex-shrink:0; overflow:hidden; box-shadow:0 3px 8px rgba(0,0,0,0.12); }
        .brand-logo-real svg, .brand-logo-real img { width:100%; height:100%; object-fit:cover; display:block; }
        #smarty-chat-box > div { max-width:84% !important; box-sizing:border-box !important; overflow-wrap:anywhere !important; word-break:break-word !important; white-space:normal !important; overflow-x:hidden !important; }
        #smarty-chat-mic-btn.listening { background:var(--danger) !important; color:#fff !important; transform:scale(1.08); }
        .quick-cat-switcher { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:12px; padding-top:12px; border-top:1px dashed rgba(120,120,120,0.2); }
        .quick-cat-pill { display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border-radius:12px; font-size:11.5px; font-weight:700; background:var(--input-bg); color:var(--text-color); cursor:pointer; }
        .quick-cat-pill.active-cat { background:var(--primary); color:#fff; }
        .quick-cat-pill.active-cat .category-icon-shell { background:rgba(255,255,255,0.22); color:#fff; }
        .chart-legend-interactive { padding:7px 10px; border-radius:12px; cursor:pointer; transition:0.15s; }
        .chart-legend-interactive:active { transform:scale(0.98); background:var(--input-bg); }
        .chart-legend-interactive.active-filter-row { background:rgba(0,110,230,0.12); border:1px solid rgba(0,110,230,0.3); }
    `;
    document.head.appendChild(st);

    // ---------------------------------------------------------
    // 2. CATEGORIAS: MICROGASTOS (HORMIGA), ALMUERZO, DELIVERY Y SALIDAS + GASTOS FIJOS
    // ---------------------------------------------------------
    if (typeof UI !== "undefined") {
        ["es", "pt", "en"].forEach(l => {
            if (!UI.dictionary?.[l]) return;
            UI.dictionary[l].cat_leisure = l === "en" ? "Micro-expenses" : "Microgastos";
            UI.dictionary[l].cat_lunch = l === "pt" ? "Almoço" : (l === "en" ? "Lunch" : "Almuerzo");
            UI.dictionary[l].cat_dining = l === "pt" ? "Delivery e Saídas" : (l === "en" ? "Delivery & Dining" : "Delivery y Salidas");
            UI.dictionary[l].tab_subs = l === "pt" ? "Gastos Fixos" : (l === "en" ? "Fixed Exp." : "Gastos Fijos");
            UI.dictionary[l].btn_add_sub = l === "pt" ? "+ Novo Gasto Fixo" : (l === "en" ? "+ New Fixed Expense" : "+ Nuevo Gasto Fijo");
            UI.dictionary[l].mod_sub_title = l === "pt" ? "Novo Gasto Fixo" : (l === "en" ? "New Fixed Expense" : "Nuevo Gasto Fijo");
            UI.dictionary[l].empty_subs = l === "pt" ? "Sem gastos fixos ativos." : (l === "en" ? "No active fixed expenses." : "Sin gastos fijos activos.");
        });

        if (Array.isArray(UI.categories) && !UI.categories.some(c => c.id === "cat_lunch")) {
            const idx = UI.categories.findIndex(c => c.id === "cat_leisure");
            const add = [{ id: "cat_lunch", icon: "lunch" }, { id: "cat_dining", icon: "dining" }];
            if (idx >= 0) UI.categories.splice(idx, 0, ...add); else UI.categories.push(...add);
        }

        (Data?.store?.expenses || []).forEach(e => {
            if (e.category && ["ocio", "lazer", "leisure"].includes(String(e.category).toLowerCase().trim())) e.category = UI.t("cat_leisure");
        });

        if (!UI._origCatIconBase) UI._origCatIconBase = UI.categoryIcon.bind(UI);
        UI.categoryIcon = function (id) {
            if (id === "cat_leisure" || id === "Microgastos" || id === "Micro-expenses") return '<span class="category-icon-shell tone-ant"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2.2"/><circle cx="12" cy="11.5" r="2.5"/><ellipse cx="12" cy="18" rx="3.2" ry="4"/><path d="M10 4.2 8 2.5M14 4.2 16 2.5M9.8 10.5 5 8.5M14.2 10.5 19 8.5M9.5 12.2 4.5 13M14.5 12.2 19.5 13M9.2 16.5 5 19.5M14.8 16.5 19 19.5"/></svg></span>';
            if (id === "cat_lunch") return '<span class="category-icon-shell tone-orange"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></span>';
            if (id === "cat_dining") return '<span class="category-icon-shell tone-crimson"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2Z"/><path d="M8.5 7.5a3.5 3.5 0 1 1 7 0"/></svg></span>';
            return UI._origCatIconBase(id);
        };
    }

    // ---------------------------------------------------------
    // 3. CONECTAR EL BOTON DE RESTAURAR COPIA EN AJUSTES Y OCULTAR ALMACENAMIENTO VIEJO
    // ---------------------------------------------------------
    if (typeof UI !== "undefined" && UI.renderSettingsView) {
        if (!UI._origRenderSettingsV20) UI._origRenderSettingsV20 = UI.renderSettingsView.bind(UI);
        UI.renderSettingsView = function () {
            UI._origRenderSettingsV20();
            document.querySelectorAll("#settings-inject .setting-group, #settings-inject .div-line").forEach(el => el.remove());

            // Asegurar que el botón Restaurar Copia abra el selector de archivos de Android y procese el JSON
            const restoreInput = document.getElementById("restore-input");
            if (restoreInput) {
                const parentBtn = restoreInput.parentElement;
                if (window.SmartyAndroid && window.SmartyAndroid.pickRestoreFile) {
                    restoreInput.style.display = "none";
                    parentBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.SmartyAndroid.pickRestoreFile();
                    };
                } else {
                    restoreInput.onchange = function () {
                        Main.handleImport(this);
                    };
                }
            }
        };
    }

    // ---------------------------------------------------------
    // 4. ACTUALIZADOR OTA EN VIVO
    // ---------------------------------------------------------
    window.checkForOtaUpdateNow = async function () {
        UI.showSnackbar("🔄 Buscando actualización en Vercel...");
        try {
            const res = await fetch("https://smart-life-pro.vercel.app/smarty-ota.js?t=" + Date.now(), { cache: "no-store" });
            if (res.ok) {
                const code = await res.text();
                if (code && code.length > 50 && !code.trim().startsWith("<!DOCTYPE")) {
                    localStorage.setItem("smarty_ota_live", code);
                    eval(code);
                    UI.refreshDOM();
                    UI.showSnackbar("⚡ ¡Actualizado al instante! (V" + window.SMARTY_APK_VERSION + ")");
                    return;
                }
            }
        } catch (_) {}
        UI.showSnackbar("✅ Ya tienes la última versión (V" + window.SMARTY_APK_VERSION + ")");
    };

    if (typeof UI !== "undefined") UI.refreshDOM();
})();
