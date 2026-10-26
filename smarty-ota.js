/* =========================================
   SMART LIFE PRO - OTA MASTER MODULE (V18.0)
   ========================================= */
(function () {
    window.SMARTY_APK_VERSION = "18.0-OTA";
    document.getElementById("fin-bank-summary-banner")?.remove();
    document.getElementById("pace-day-marker")?.remove();
    document.getElementById("smarty-ota-styles")?.remove();

    // 1. ESTILOS: CHAT BLINDADO + HORMIGA + PASTEL CLICKEABLE
    const st = document.createElement("style");
    st.id = "smarty-ota-styles";
    st.innerHTML = `
        #budget-circle { filter: none !important; box-shadow: none !important; }
        #pace-day-marker, #fin-bank-summary-banner { display: none !important; }
        .tone-orange { color: #EA580C; background: rgba(234,88,12,0.14); }
        .tone-crimson { color: #E11D48; background: rgba(225,29,72,0.14); }
        .tone-ant { color: #D97706; background: rgba(217,119,6,0.15); }
        .brand-logo-real { width:38px; height:38px; border-radius:11px; display:inline-flex; align-items:center; justify-content:center; margin-right:12px; flex-shrink:0; overflow:hidden; box-shadow:0 3px 8px rgba(0,0,0,0.12); }
        .brand-logo-real svg, .brand-logo-real img { width:100%; height:100%; object-fit:cover; display:block; }
        #smarty-chat-box > div { max-width:84% !important; box-sizing:border-box !important; overflow-wrap:anywhere !important; word-break:break-word !important; white-space:normal !important; overflow-x:hidden !important; }
        #smarty-chat-mic-btn.listening { background:var(--danger) !important; color:#fff !important; transform:scale(1.08); }
        .quick-cat-switcher { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:12px; padding-top:12px; border-top:1px dashed rgba(120,120,120,0.2); }
        .quick-cat-pill { display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border-radius:12px; font-size:11.5px; font-weight:700; background:var(--input-bg); color:var(--text-color); cursor:pointer; border:1.5px solid transparent; }
        .quick-cat-pill.active-cat { background:var(--primary); color:#fff; }
        .quick-cat-pill.active-cat .category-icon-shell { background:rgba(255,255,255,0.22); color:#fff; }
        .chart-legend-interactive { padding:7px 10px; border-radius:12px; cursor:pointer; transition:0.15s; }
        .chart-legend-interactive:active { transform:scale(0.98); background:var(--input-bg); }
        .chart-legend-interactive.active-filter-row { background:rgba(0,110,230,0.12); border:1px solid rgba(0,110,230,0.3); }
    `;
    document.head.appendChild(st);

    // 2. CATEGORIAS: MICROGASTOS (HORMIGA), ALMUERZO Y DELIVERY & SALIDAS
    if (typeof UI !== "undefined") {
        ["es", "pt", "en"].forEach(l => {
            if (!UI.dictionary?.[l]) return;
            UI.dictionary[l].cat_leisure = l === "en" ? "Micro-expenses" : "Microgastos";
            UI.dictionary[l].cat_lunch = l === "pt" ? "Almoço" : (l === "en" ? "Lunch" : "Almuerzo");
            UI.dictionary[l].cat_dining = l === "pt" ? "Delivery e Saídas" : (l === "en" ? "Delivery & Dining" : "Delivery y Salidas");
            UI.dictionary[l].tab_subs = l === "pt" ? "Gastos Fixos" : (l === "en" ? "Fixed Exp." : "Gastos Fijos");
            UI.dictionary[l].btn_add_sub = l === "pt" ? "+ Novo Gasto Fixo" : (l === "en" ? "+ New Fixed Expense" : "+ Nuevo Gasto Fijo");
            UI.dictionary[l].mod_sub_title = l === "pt" ? "Novo Gasto Fixo" : (l === "en" ? "New Fixed Expense" : "Nuevo Gasto Fijo");
        });

        if (Array.isArray(UI.categories) && !UI.categories.some(c => c.id === "cat_lunch")) {
            const idx = UI.categories.findIndex(c => c.id === "cat_leisure");
            const add = [{ id: "cat_lunch", icon: "lunch" }, { id: "cat_dining", icon: "dining" }];
            if (idx >= 0) UI.categories.splice(idx, 0, ...add); else UI.categories.push(...add);
        }

        (Data?.store?.expenses || []).forEach(e => {
            if (e.category && ["ocio", "lazer", "leisure"].includes(String(e.category).toLowerCase().trim())) {
                e.category = UI.t("cat_leisure");
            }
        });

        if (!UI._origCatIconBase) UI._origCatIconBase = UI.categoryIcon.bind(UI);
        UI.categoryIcon = function (id) {
            if (id === "cat_leisure" || id === "Microgastos" || id === "Micro-expenses") {
                return '<span class="category-icon-shell tone-ant"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2.2"/><circle cx="12" cy="11.5" r="2.5"/><ellipse cx="12" cy="18" rx="3.2" ry="4"/><path d="M10 4.2 8 2.5M14 4.2 16 2.5M9.8 10.5 5 8.5M14.2 10.5 19 8.5M9.5 12.2 4.5 13M14.5 12.2 19.5 13M9.2 16.5 5 19.5M14.8 16.5 19 19.5"/></svg></span>';
            }
            if (id === "cat_lunch") return '<span class="category-icon-shell tone-orange"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></span>';
            if (id === "cat_dining") return '<span class="category-icon-shell tone-crimson"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2Z"/><path d="M8.5 7.5a3.5 3.5 0 1 1 7 0"/></svg></span>';
            return UI._origCatIconBase(id);
        };
    }

    function resolveCatId(val) {
        if (!val) return "cat_other";
        const c = String(val).trim().toLowerCase();
        if (c === "cat_market" || c === String(UI.t("cat_market")).toLowerCase()) return "cat_market";
        if (c === "cat_subs" || c === "tab_subs" || c === String(UI.t("tab_subs")).toLowerCase()) return "cat_subs";
        if (["ocio", "lazer", "leisure", "microgastos", "micro-expenses"].includes(c)) return "cat_leisure";
        for (const item of (UI.categories || [])) {
            if (item.id.toLowerCase() === c || String(UI.t(item.id)).toLowerCase() === c) return item.id;
        }
        return "cat_other";
    }

    // 3. FINANZAS: ORDEN POR VALOR PERSISTENTE, GRAFICO INTERACTIVO, ICONO SVG, EDITAR CATEGORIA Y SEPARAR HOGAR
    if (typeof Finance !== "undefined") {
        if (!Data.store.settings) Data.store.settings = {};
        if (!Data.store.settings.subscriptionSort) Data.store.settings.subscriptionSort = "value";
        Finance.subscriptionSort = Data.store.settings.subscriptionSort;
        Finance.injectFinanceSummaryBanner = function () { document.getElementById("fin-bank-summary-banner")?.remove(); };

        Finance.setSubscriptionSortOrder = function (s) {
            this.subscriptionSort = s;
            Data.store.settings.subscriptionSort = s;
            Data.save();
            this.renderSubscriptions();
        };

        Finance.renderSubscriptions = function () {
            const container = document.getElementById("subs-list"); if (!container) return;
            container.innerHTML = "";
            if (!Data.store.subscriptions?.length) {
                container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">${UI.t("empty_subs")}</div>`;
                return;
            }
            this.subscriptionSort = Data.store.settings?.subscriptionSort || "value";
            const sortBar = document.createElement("div");
            sortBar.className = "subscription-sort-bar";
            sortBar.innerHTML = `<label for="subs-sort">Ordenar por</label><select id="subs-sort" onchange="Finance.setSubscriptionSortOrder(this.value)"><option value="value">Valor</option><option value="date">Fecha de cobro</option><option value="name">Orden alfabético</option></select>`;
            sortBar.querySelector("select").value = this.subscriptionSort;
            container.appendChild(sortBar);

            const subs = [...Data.store.subscriptions].sort((a, b) => {
                if (this.subscriptionSort === "value") return (parseFloat(b.cost) || 0) - (parseFloat(a.cost) || 0);
                if (this.subscriptionSort === "name") return String(a.name).localeCompare(String(b.name), undefined, { sensitivity: "base" });
                return (parseInt(a.day, 10) || 0) - (parseInt(b.day, 10) || 0);
            });

            let totalCost = 0;
            subs.forEach(sub => {
                totalCost += parseFloat(sub.cost) || 0;
                const div = document.createElement("div");
                div.className = "glass-card item-row";
                const badge = window.getSmartBrandBadge ? window.getSmartBrandBadge(sub.name) : "";
                div.innerHTML = `${badge}<div style="flex:1"><div style="font-weight:700;">${sub.name}</div><div style="font-size:12px; opacity:0.7;">${UI.t("sub_charge_day")} ${sub.day}</div></div><div style="font-weight:800; margin-right:15px;">${UI.formatMoney(sub.cost)}</div><button class="icon-btn" style="color:var(--danger); width:36px; height:36px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>`;
                div.querySelector("button").onclick = () => this.deleteSub(sub.id);
                container.appendChild(div);
            });
            const tDiv = document.createElement("div");
            tDiv.className = "glass-card";
            tDiv.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:15px; margin-top:15px; border:2px solid var(--primary);";
            tDiv.innerHTML = `<div style="font-weight:800;">Total Mensual</div><div style="font-size:18px; font-weight:900; color:var(--primary);">${UI.formatMoney(totalCost)}</div>`;
            container.appendChild(tDiv);
        };

        Finance.selectCategoryFromChart = function (catId) {
            this.selectedCategoryFilter = (this.selectedCategoryFilter === catId) ? "ALL" : catId;
            if (navigator.vibrate) navigator.vibrate(10);
            this.renderExpensesHistory();
            setTimeout(() => document.getElementById("history-filtered-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
        };

        Finance.handlePieClick = function (e, el) {
            if (!this._lastPieSlices?.length) return;
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
            if (Math.sqrt(dx * dx + dy * dy) < r.width * 0.22) { this.selectCategoryFromChart("ALL"); return; }
            let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
            if (deg < 0) deg += 360;
            const s = this._lastPieSlices.find(x => deg >= x.startDeg && deg <= x.endDeg);
            if (s?.catId) this.selectCategoryFromChart(s.catId);
        };

        Finance.renderCategoryChart = function (container) {
            const categories = {};
            const [selYear, selMonth] = this.selectedHistoryMonth.split("-").map(Number);
            let totalMonth = 0;

            (Data.store.expenses || []).forEach(e => {
                const d = new Date(e.date); let match = false;
                if (!e.isInstallment && d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) match = true;
                else if (e.isInstallment) { const t = new Date(selYear, selMonth - 1, 1); const { current } = this.calculateProgressAtDate(e.date, e.installments.total, t); if (current > 0 && current <= e.installments.total) match = true; }
                if (match) {
                    const cid = resolveCatId(e.category), lbl = UI.t(cid);
                    if (!categories[lbl]) categories[lbl] = { amount: 0, catId: cid };
                    categories[lbl].amount += parseFloat(e.amount); totalMonth += parseFloat(e.amount);
                }
            });
            (Data.store.lists || []).filter(l => l.status === "completed").forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    const c = UI.t("cat_market");
                    if (!categories[c]) categories[c] = { amount: 0, catId: "cat_market" };
                    categories[c].amount += parseFloat(l.total); totalMonth += parseFloat(l.total);
                }
            });
            const daysInM = new Date(selYear, selMonth, 0).getDate();
            (Data.store.subscriptions || []).forEach(s => {
                if (s.day <= daysInM) {
                    const c = UI.t("tab_subs");
                    if (!categories[c]) categories[c] = { amount: 0, catId: "cat_subs" };
                    categories[c].amount += parseFloat(s.cost); totalMonth += parseFloat(s.cost);
                }
            });

            if (totalMonth > 0) {
                const colors = ["#007AFF", "#FF9500", "#FF2D55", "#AF52DE", "#34C759", "#5AC8FA", "#EC4899", "#8E8E93"];
                let curDeg = 0; const grad = []; this._lastPieSlices = [];
                const sorted = Object.entries(categories).sort((a, b) => b[1].amount - a[1].amount);
                let leg = '<div style="margin-top:20px; width:100%; display:flex; flex-direction:column; gap:6px;">';
                sorted.forEach(([lbl, inf], i) => {
                    const deg = (inf.amount / totalMonth) * 360, pct = (inf.amount / totalMonth) * 100, col = colors[i % colors.length];
                    const icon = inf.catId === "cat_subs" ? UI.categoryIcon("cat_subs") : this.getCategoryIcon(inf.catId);
                    const val = this.chartDisplayMode === "percent" ? `${Math.round(pct)}%` : UI.formatMoney(inf.amount);
                    const act = this.selectedCategoryFilter === inf.catId ? "active-filter-row" : "";
                    this._lastPieSlices.push({ startDeg: curDeg, endDeg: curDeg + deg, catId: inf.catId });
                    grad.push(`${col} ${curDeg}deg ${curDeg + deg}deg`); curDeg += deg;
                    leg += `<div class="chart-legend-interactive ${act}" onclick="Finance.selectCategoryFromChart('${inf.catId}')" style="display:flex; align-items:center; justify-content:space-between; font-size:13px;"><div style="display:flex; align-items:center; gap:9px; width:46%; overflow:hidden;"><div style="width:10px; height:10px; border-radius:50%; background:${col}; flex-shrink:0;"></div><span style="display:flex;">${icon}</span><span style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lbl}</span></div><div style="flex:1; margin:0 10px; height:5px; background:rgba(120,120,120,0.1); border-radius:3px; overflow:hidden;"><div style="height:100%; width:${pct}%; background:${col};"></div></div><div style="font-weight:800; text-align:right; min-width:52px;">${val}</div></div>`;
                });
                leg += "</div>";
                const tTxt = this.chartDisplayMode === "percent" ? "Ver Montos" : "Ver %";
                const swapSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="margin-left:5px;"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1 4 4H3"></path></svg>`;
                const div = document.createElement("div");
                div.innerHTML = `<div class="glass-card" style="padding:22px; margin-bottom:16px; display:flex; flex-direction:column; align-items:center;"><div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:18px;"><div style="font-size:12px; font-weight:800; color:var(--text-sec); text-transform:uppercase;">${UI.t("cat_distribution")}</div><button class="text-btn-small" onclick="Finance.toggleChartMode()" style="background:var(--input-bg); padding:6px 12px; font-size:11.5px; border-radius:10px; display:inline-flex; align-items:center;"><span>${tTxt}</span>${swapSvg}</button></div><div onclick="Finance.handlePieClick(event, this)" style="cursor:pointer; position:relative; width:160px; height:160px; border-radius:50%; background:conic-gradient(${grad.join(", ")});"><div style="position:absolute; inset:24px; background:var(--glass-bg); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;"><span style="font-size:10px; color:var(--text-sec); font-weight:800;">TOTAL</span><span style="font-size:18px; font-weight:900; margin-top:2px;">${UI.formatMoney(totalMonth)}</span></div></div><div style="font-size:10px; color:var(--text-sec); margin-top:10px;">Toca un color o una fila abajo para filtrar sus gastos</div>${leg}</div>`;
                container.appendChild(div);
            }
        };
    }

    // 4. MODAL PARA ELEGIR APPS REALES DE TU TELEFONO (SOLO ESAS ENTRARAN)
    window.openInstalledAppsPickerModal = function () {
        document.getElementById("installed-apps-modal")?.remove();
        let installed = [];
        try {
            if (window.SmartyAndroid?.getInstalledAppsJson) installed = JSON.parse(window.SmartyAndroid.getInstalledAppsJson() || "[]");
        } catch (_) {}
        if (!installed.length) {
            installed = [
                { pkg: "com.nu.production", name: "Nubank" }, { pkg: "br.com.intermedium", name: "Banco Inter" },
                { pkg: "com.mercadopago.wallet", name: "Mercado Pago" }, { pkg: "com.itau", name: "Itaú" },
                { pkg: "com.bradesco", name: "Bradesco" }, { pkg: "com.santander.app", name: "Santander" },
                { pkg: "br.com.bb.android", name: "Banco do Brasil" }, { pkg: "br.com.gabba.Caixa", name: "Caixa" },
                { pkg: "com.picpay", name: "PicPay" }, { pkg: "com.c6bank.app", name: "C6 Bank" },
                { pkg: "com.google.android.apps.walletnfcrel", name: "Google Wallet" }
            ];
        }
        const selected = new Set(Data.store.settings?.allowedBankPackages || []);
        installed.sort((a, b) => (selected.has(b.pkg) - selected.has(a.pkg)) || a.name.localeCompare(b.name));

        const ov = document.createElement("div");
        ov.id = "installed-apps-modal"; ov.className = "modal-overlay open"; ov.style.zIndex = "25000";
        ov.innerHTML = `<div class="settings-card" onclick="event.stopPropagation()" style="max-height:85vh; display:flex; flex-direction:column;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><h3 style="margin:0; color:var(--primary);">📲 Apps Autorizadas</h3><button class="icon-btn" id="iap-close">✕</button></div><p style="font-size:11.5px; color:var(--text-sec); margin:0 0 10px;">Smarty <b>SOLO</b> recibirá notificaciones de las apps que marques aquí:</p><input type="text" id="iap-search" class="setting-input" placeholder="🔍 Buscar app..." style="width:100%; margin-bottom:10px;"><div style="flex:1; overflow-y:auto;">${installed.map(a => `<div class="setting-item iap-row" data-q="${a.name.toLowerCase()} ${a.pkg.toLowerCase()}" style="padding:10px 4px;"><div style="display:flex; flex-direction:column; overflow:hidden; padding-right:8px;"><span style="font-size:13.5px; font-weight:700;">${a.name}</span><span style="font-size:10px; color:var(--text-sec);">${a.pkg}</span></div><label class="switch-wrap"><input type="checkbox" class="iap-chk" value="${a.pkg}" ${selected.has(a.pkg) ? "checked" : ""}><span class="slider"></span></label></div>`).join("")}</div><button class="btn-full" id="iap-save" style="margin-top:12px;">Guardar Selección</button></div>`;
        document.body.appendChild(ov);
        ov.querySelector("#iap-close").onclick = () => ov.remove();
        ov.querySelector("#iap-search").oninput = function () {
            const q = this.value.toLowerCase().trim();
            ov.querySelectorAll(".iap-row").forEach(r => r.style.display = r.getAttribute("data-q").includes(q) ? "flex" : "none");
        };
        ov.querySelector("#iap-save").onclick = () => {
            const pkgs = [];
            ov.querySelectorAll(".iap-chk:checked").forEach(c => pkgs.push(c.value));
            Data.store.settings.allowedBankPackages = pkgs;
            Data.save();
            if (window.SmartyAndroid?.setAllowedNotificationPackages) window.SmartyAndroid.setAllowedNotificationPackages(pkgs.join(","));
            ov.remove(); UI.renderSettingsView();
            UI.showSnackbar(`✅ ${pkgs.length} apps autorizadas`);
        };
    };

    // Bloqueo estricto también en JS para el APK que ya tienes instalado
    if (window.NativeBridge) {
        const origNB = window.NativeBridge.processBankNotification.bind(window.NativeBridge);
        window.NativeBridge.processBankNotification = async function (notif) {
            const pkg = String(notif.package || "").trim().toLowerCase();
            const title = String(notif.title || "").trim().toLowerCase();
            const isTest = pkg === "com.smartlife.pro" || title.includes("compra de crédito aprobada");
            if (!isTest) {
                const allowed = (Data.store.settings?.allowedBankPackages || []).map(x => x.toLowerCase());
                const matchPkg = allowed.some(a => pkg === a || title.includes(a.split(".")[1] || a));
                if (!matchPkg) return; // Ignorar por completo sin siquiera tocar "Última leída"
            }
            return await origNB(notif);
        };
    }

    // 5. GUIA DE GROQ EN EL MANUAL (?) Y BOTON EN AJUSTES
    if (typeof UI !== "undefined" && UI.toggleGuide) {
        if (!UI._origToggleGuideBase) UI._origToggleGuideBase = UI.toggleGuide.bind(UI);
        UI.toggleGuide = function () {
            UI._origToggleGuideBase();
            setTimeout(() => {
                const area = document.querySelector(".guide-scroll-area > div");
                if (!area || document.getElementById("guide-groq-api-card")) return;
                const card = document.createElement("div");
                card.id = "guide-groq-api-card"; card.className = "guide-card"; card.style.border = "1.5px solid var(--primary)";
                card.innerHTML = `<div class="guide-card-header"><div class="guide-card-icon">🔑</div><div class="guide-card-title">Cómo conseguir tu API Key de Groq (Gratis)</div></div><div class="guide-card-body">1. Entra en tu navegador a <b>console.groq.com/keys</b> e inicia sesión con Google.<br>2. Toca <b>"Create API Key"</b>, ponle nombre <i>Smarty</i> y dale a <b>Submit</b>.<br>3. Copia la clave generada (empieza por <i>gsk_...</i>) y pégala en <b>Ajustes ➔ API Key de Groq</b>.</div>`;
                area.insertBefore(card, area.children[1] || area.firstChild);
            }, 60);
        };
    }

    // 6. AUTO-ACTUALIZADOR (OTA + DESCARGA DE APK SI HAY VERSION NUEVA DE SISTEMA)
    if (window.SmartyUpdaterAndBackup) {
        window.SmartyUpdaterAndBackup.checkForAppUpdates = async function () {
            UI.showSnackbar("🔄 Buscando actualizaciones...");
            try {
                const res = await fetch("https://smart-life-pro.vercel.app/smarty-ota.js?t=" + Date.now(), { cache: "no-store" });
                if (res.ok) {
                    const code = await res.text();
                    if (code && code.length > 20 && !code.trim().startsWith("<!DOCTYPE")) {
                        localStorage.setItem("smarty_ota_patch_v14", code);
                        localStorage.setItem("smarty_ota_patch_v15", code);
                        localStorage.setItem("smarty_ota_patch_v16", code);
                        eval(code);
                        UI.refreshDOM();
                        UI.showSnackbar("⚡ ¡Actualizado al instante! (" + window.SMARTY_APK_VERSION + ")");
                        return;
                    }
                }
            } catch (_) {}
            UI.showSnackbar("✅ Versión activa: " + window.SMARTY_APK_VERSION);
        };
    }

    if (typeof UI !== "undefined") {
        UI.refreshDOM();
        const panel = document.getElementById("android-pro-settings")?.querySelector(".glass-card");
        if (panel && !document.getElementById("btn-pick-installed-apps")) {
            const cnt = (Data.store.settings?.allowedBankPackages || []).length;
            const row = document.createElement("div");
            row.id = "btn-pick-installed-apps"; row.className = "setting-item";
            row.innerHTML = `<span>📲 Apps Autorizadas (${cnt})</span><button class="text-btn-small" style="background:var(--input-bg);" onclick="window.openInstalledAppsPickerModal()">Elegir Apps ➔</button>`;
            panel.insertBefore(row, panel.children[5] || null);
        }
    }
   // Mostrar ruta exacta o abrir selector visible al tocar "Crear Copia" manualmente
    if (typeof Main !== "undefined") {
        Main.downloadBackup = function () {
            const json = Data.exportJSON();
            // 1. Guardar también la copia automática única de respaldo
            if (window.SmartyAndroid && window.SmartyAndroid.saveSingleOverwriteBackup) {
                window.SmartyAndroid.saveSingleOverwriteBackup(json);
            }
            // 2. Abrir el selector nativo de Android para que quede en tu carpeta Descargas visible
            if (window.SmartyAndroid && window.SmartyAndroid.saveBackupFile) {
                window.SmartyAndroid.saveBackupFile(json, "SmartLifePro_Backup.json");
                return;
            }
            UI.showSnackbar("✅ Guardado en Descargas: SmartLifePro_Backup.json");
        };
    }
})();
