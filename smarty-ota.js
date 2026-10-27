(function () {
'use strict';
/* =========================================
   SMART LIFE PRO - MASTER MODULE COMPLETO (V22.0) - PARTE 2/2
   ========================================= */

    // 5. SUPER-CONTEXTO DE PRODUCTOS PARA SMARTY AI
    if (typeof Assistant !== "undefined") {
        if (!Assistant._origFinCtxBase) Assistant._origFinCtxBase = Assistant.getFinancialContext.bind(Assistant);
        Assistant.getFinancialContext = function (q = "") {
            const base = Assistant._origFinCtxBase(q);
            const groups = {};
            (Data.store.lists || []).filter(l => l.status === "completed").forEach(list => {
                (list.items || []).filter(i => i.checked !== false).forEach(item => {
                    const raw = String(item.name || "").trim(); if (!raw) return;
                    const k = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/s$/, "");
                    const qty = Shopping?.parseQtyValue ? Shopping.parseQtyValue(item.qty) : 1;
                    const pr = parseFloat(item.price) || 0;
                    if (!groups[k]) groups[k] = { name: raw, count: 0, units: 0, spent: 0 };
                    groups[k].count += 1; groups[k].units += qty; groups[k].spent += pr * qty;
                });
            });
            const rank = Object.values(groups).sort((a, b) => b.count - a.count).slice(0, 50).map(g => `- ${g.name}: comprado ${g.count} veces (${g.units} un) | gasto total: ${g.spent.toFixed(2)}`).join("\n");
            return `${base}\n\nRANKING COMPLETO DE PRODUCTOS COMPRADOS EN SUPERMERCADO:\n${rank || "Sin compras"}`;
        };
    }

    // 6. FINANZAS: ORDEN POR VALOR PERSISTENTE, GRAFICO INTERACTIVO, EDITAR CATEGORIA, PDF Y SEPARAR HOGAR
    if (typeof Finance !== "undefined") {
        const resolveCatId = window._resolveSmartyCatId || function (value) {
            const raw = String(value || '').toLowerCase().trim();
            const match = (UI.categories || []).find(c => c.id.toLowerCase() === raw || UI.t(c.id).toLowerCase() === raw);
            return match ? match.id : 'cat_other';
        };
        if (!Data.store.settings) Data.store.settings = {};
        if (!Data.store.settings.subscriptionSort) Data.store.settings.subscriptionSort = "value";
        Finance.subscriptionSort = Data.store.settings.subscriptionSort;

        Finance.setSubscriptionSortOrder = function (s) {
            this.subscriptionSort = s; Data.store.settings.subscriptionSort = s; Data.save(); this.renderSubscriptions();
        };

        Finance.renderSubscriptions = function () {
            const container = document.getElementById("subs-list"); if (!container) return;
            container.innerHTML = "";
            if (!Data.store.subscriptions?.length) {
                container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">${UI.t("empty_subs")}</div>`;
                return;
            }
            this.subscriptionSort = Data.store.settings?.subscriptionSort || "value";
            const sortBar = document.createElement("div"); sortBar.className = "subscription-sort-bar";
            sortBar.innerHTML = `<label for="subs-sort">Ordenar por</label><select id="subs-sort" onchange="Finance.setSubscriptionSortOrder(this.value)"><option value="value">Valor</option><option value="date">Fecha de cobro</option><option value="name">Orden alfabético</option></select>`;
            sortBar.querySelector("select").value = this.subscriptionSort; container.appendChild(sortBar);

            const subs = [...Data.store.subscriptions].sort((a, b) => {
                if (this.subscriptionSort === "value") return (parseFloat(b.cost) || 0) - (parseFloat(a.cost) || 0);
                if (this.subscriptionSort === "name") return String(a.name).localeCompare(String(b.name), undefined, { sensitivity: "base" });
                return (parseInt(a.day, 10) || 0) - (parseInt(b.day, 10) || 0);
            });

            let totalCost = 0;
            subs.forEach(sub => {
                totalCost += parseFloat(sub.cost) || 0;
                const div = document.createElement("div"); div.className = "glass-card item-row";
                div.innerHTML = `${window.getSmartBrandBadge(sub.name)}<div style="flex:1"><div style="font-weight:700;">${sub.name}</div><div style="font-size:12px; opacity:0.7;">${UI.t("sub_charge_day")} ${sub.day}</div></div><div style="font-weight:800; margin-right:15px;">${UI.formatMoney(sub.cost)}</div><button class="icon-btn" style="color:var(--danger); width:36px; height:36px;">✕</button>`;
                div.querySelector("button").onclick = () => this.deleteSub(sub.id); container.appendChild(div);
            });
            const tDiv = document.createElement("div"); tDiv.className = "glass-card";
            tDiv.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:15px; margin-top:15px; border:2px solid var(--primary);";
            tDiv.innerHTML = `<div style="font-weight:800;">Total Mensual</div><div style="font-size:18px; font-weight:900; color:var(--primary);">${UI.formatMoney(totalCost)}</div>`;
            container.appendChild(tDiv);
        };

        Finance.renderFilterChips = function () {
            let html = `<div class="filter-scroll-container"><div class="filter-chip ${this.selectedCategoryFilter === "ALL" ? "active" : ""}" onclick="Finance.setCategoryFilter('ALL')">Todo</div>`;
            (UI.categories || []).forEach(cat => {
                html += `<div class="filter-chip ${this.selectedCategoryFilter === cat.id ? "active" : ""}" onclick="Finance.setCategoryFilter('${cat.id}')">${UI.categoryIcon(cat.id)} ${UI.t(cat.id)}</div>`;
            });
            html += `<div class="filter-chip ${this.selectedCategoryFilter === "cat_subs" ? "active" : ""}" onclick="Finance.setCategoryFilter('cat_subs')">${UI.categoryIcon("cat_subs")} ${UI.t("tab_subs")}</div></div>`;
            return html;
        };

        Finance.selectCategoryFromChart = function (catId) {
            this.selectedCategoryFilter = (this.selectedCategoryFilter === catId) ? "ALL" : catId;
            if (navigator.vibrate) navigator.vibrate(10);
            this.renderExpensesHistory();
            setTimeout(() => document.querySelector(".filter-scroll-container")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
        };

        Finance.handlePieClick = function (e, el) {
            if (!this._lastPieSlices?.length) return;
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
            if (Math.sqrt(dx * dx + dy * dy) < r.width * 0.22) { this.selectCategoryFromChart("ALL"); return; }
            let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90; if (deg < 0) deg += 360;
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
                    const c = UI.t("cat_market"); if (!categories[c]) categories[c] = { amount: 0, catId: "cat_market" };
                    categories[c].amount += parseFloat(l.total); totalMonth += parseFloat(l.total);
                }
            });
            const daysInM = new Date(selYear, selMonth, 0).getDate();
            (Data.store.subscriptions || []).forEach(s => {
                if (s.day <= daysInM) {
                    const c = UI.t("tab_subs"); if (!categories[c]) categories[c] = { amount: 0, catId: "cat_subs" };
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

        Finance.quickChangeExpenseCategory = function (expenseId, newCatId) {
            const exp = (Data.store.expenses || []).find(e => e.id === expenseId); if (!exp) return;
            const newLabel = UI.t(newCatId); exp.category = newLabel; Data.save();
            const detCat = document.getElementById("det-exp-cat");
            if (detCat) detCat.innerHTML = `${this.getCategoryIcon(newCatId)} ${newLabel}`;
            document.querySelectorAll("#det-quick-cat-box .quick-cat-pill").forEach(p => p.classList.toggle("active-cat", p.dataset.id === newCatId));
            UI.renderBudgetChart(); this.renderHomeWidgets(); this.renderExpensesHistory();
            UI.showSnackbar(`Categoría cambiada a ${newLabel} ✅`);
        };

        Finance.openExpenseDetail = function (id) {
            const expense = (Data.store.expenses || []).find(e => e.id === id); if (!expense) return;
            document.getElementById("det-exp-desc").innerText = expense.desc;
            document.getElementById("det-exp-amount").innerText = UI.formatMoney(expense.amount);
            document.getElementById("det-exp-date").innerText = new Date(expense.date).toLocaleString();
            const cid = resolveCatId(expense.category), catName = UI.t(cid);
            const detCatEl = document.getElementById("det-exp-cat");
            detCatEl.innerHTML = `${this.getCategoryIcon(cid)} ${catName}`;

            let quickBox = document.getElementById("det-quick-cat-box");
            if (!quickBox) { quickBox = document.createElement("div"); quickBox.id = "det-quick-cat-box"; quickBox.className = "quick-cat-switcher"; detCatEl.parentElement.appendChild(quickBox); }
            quickBox.innerHTML = `<div style="width:100%; font-size:10px; font-weight:800; color:var(--text-sec); text-transform:uppercase; margin-bottom:4px;">Cambiar Categoría con 1 Toque:</div>`;
            (UI.categories || []).forEach(cat => {
                const label = UI.t(cat.id), pill = document.createElement("div");
                pill.className = `quick-cat-pill ${cid === cat.id ? "active-cat" : ""}`; pill.dataset.id = cat.id;
                pill.innerHTML = `${UI.categoryIcon(cat.id)} <span>${label}</span>`;
                pill.onclick = () => Finance.quickChangeExpenseCategory(id, cat.id);
                quickBox.appendChild(pill);
            });
            document.getElementById("det-exp-delete-btn").onclick = () => { this.deleteExpense(id); Main.closeModal("expense-detail"); };
            document.getElementById("modal-expense-detail").classList.add("open");
        };

        Finance.exportMonthlyPDF = function () {
            const [selY, selM] = (this.selectedHistoryMonth || "2026-10").split("-").map(Number);
            const monthTitle = UI.getMonthName(selM - 1) + " " + selY, limit = parseFloat(Data.store.budget?.limit || 0);
            const rows = [], cats = {}; let total = 0;
            const addRow = (date, type, desc, cat, amt) => { const n = parseFloat(amt) || 0; total += n; cats[cat] = (cats[cat] || 0) + n; rows.push({ date, type, desc, cat, amt: n }); };
            (Data.store.expenses || []).forEach(e => {
                const d = new Date(e.date);
                if (!e.isInstallment && d.getMonth() === (selM - 1) && d.getFullYear() === selY) addRow(d.toLocaleDateString(), "Gasto", e.desc, UI.t(resolveCatId(e.category)), e.amount);
                else if (e.isInstallment) { const t = new Date(selY, selM - 1, 1); const { current } = Finance.calculateProgressAtDate(e.date, e.installments.total, t); if (current > 0 && current <= e.installments.total) addRow(t.toLocaleDateString(), `Parcela ${current}/${e.installments.total}`, e.desc, UI.t(resolveCatId(e.category)), e.amount); }
            });
            (Data.store.lists || []).filter(l => l.status === "completed").forEach(l => { const d = new Date(l.date); if (d.getMonth() === (selM - 1) && d.getFullYear() === selY) addRow(d.toLocaleDateString(), "Mercado", l.name, UI.t("cat_market"), l.total); });
            (Data.store.subscriptions || []).forEach(s => addRow("Día " + s.day, "Gasto Fijo", s.name, UI.t("tab_subs"), s.cost));
            const catRows = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, a]) => `<tr><td>${c}</td><td>${UI.formatMoney(a)}</td><td>${total > 0 ? Math.round((a / total) * 100) : 0}%</td></tr>`).join("");
            const movRows = rows.map(r => `<tr><td>${r.date}</td><td>${r.type}</td><td>${r.desc}</td><td>${r.cat}</td><td style="text-align:right;font-weight:bold;">${UI.formatMoney(r.amt)}</td></tr>`).join("");
            const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;padding:24px;color:#0f172a}h1{color:#0066ff;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:14px;font-size:12px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f1f5f9}.cards{display:flex;gap:12px;margin:16px 0}.card{flex:1;padding:12px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0}</style></head><body><h1>Smart Life Pro - Informe Mensual (${monthTitle})</h1><div class="cards"><div class="card"><div>Presupuesto</div><b>${UI.formatMoney(limit)}</b></div><div class="card"><div>Total Gastado</div><b style="color:#ef4444;">${UI.formatMoney(total)}</b></div><div class="card"><div>Restante</div><b style="color:#10b981;">${UI.formatMoney(limit - total)}</b></div></div><h3>Por Categorías</h3><table><tr><th>Categoría</th><th>Monto</th><th>%</th></tr>${catRows}</table><h3>Movimientos (${rows.length})</h3><table><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Categoría</th><th>Monto</th></tr>${movRows}</table></body></html>`;
            if (window.SmartyAndroid?.printHtmlToPdf) window.SmartyAndroid.printHtmlToPdf(html, "Smarty_Resumen_" + this.selectedHistoryMonth);
        };

        Finance.renderExpensesHistory = function () {
            const container = document.getElementById("expenses-history-list"); if (!container) return;
            container.innerHTML = "";
            this.renderMonthSelector(container);
            const pdfBtn = document.createElement("button"); pdfBtn.className = "btn-data"; pdfBtn.style.cssText = "width:calc(100% - 32px); margin:0 16px 14px; padding:12px; flex-direction:row; font-size:13px;"; pdfBtn.innerHTML = "📄 Exportar Resumen Detallado en PDF"; pdfBtn.onclick = () => Finance.exportMonthlyPDF();
            container.appendChild(pdfBtn);
            this.renderCategoryChart(container);
            const filterContainer = document.createElement("div"); filterContainer.innerHTML = this.renderFilterChips(); container.appendChild(filterContainer);

            const [selYear, selMonth] = this.selectedHistoryMonth.split("-").map(Number);
            let allItems = [];
            (Data.store.expenses || []).forEach(e => {
                let match = false, date = e.date; const d = new Date(e.date);
                if (!e.isInstallment && d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) match = true;
                else if (e.isInstallment) { const t = new Date(selYear, selMonth - 1, 1); const { current } = this.calculateProgressAtDate(e.date, e.installments.total, t); if (current > 0 && current <= e.installments.total) { match = true; date = t.getTime(); } }
                if (match) { const cid = resolveCatId(e.category); allItems.push({ type: "expense", id: e.id, date, amount: e.amount, name: e.desc, rawCatId: cid, icon: this.getCategoryIcon(cid) }); }
            });
            (Data.store.lists || []).filter(l => l.status === "completed").forEach(l => {
                const d = new Date(l.date); if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) allItems.push({ type: "list", id: l.id, date: l.date, amount: l.total, name: l.name, rawCatId: "cat_market", icon: UI.categoryIcon("cat_market") });
            });
            const daysInM = new Date(selYear, selMonth, 0).getDate();
            (Data.store.subscriptions || []).forEach(s => {
                if (s.day <= daysInM) allItems.push({ type: "sub", id: s.id, date: new Date(selYear, selMonth - 1, s.day).getTime(), amount: s.cost, name: s.name, rawCatId: "cat_subs", icon: window.getSmartBrandBadge(s.name) });
            });
            if (this.selectedCategoryFilter !== "ALL") allItems = allItems.filter(i => i.rawCatId === this.selectedCategoryFilter);
            allItems.sort((a, b) => b.date - a.date);
            allItems.forEach(item => {
                const row = document.createElement("div"); row.className = "item-row";
                const delFn = item.type === "expense" ? `Finance.deleteExpense('${item.id}')` : (item.type === "list" ? `Shopping.deleteList('${item.id}')` : `Finance.deleteSub('${item.id}')`);
                const clickFn = item.type === "expense" ? `Finance.openExpenseDetail('${item.id}')` : (item.type === "list" ? `Shopping.openHistoryDetail('${item.id}')` : "");
                row.innerHTML = `<div class="item-content-wrap" onclick="${clickFn}" style="cursor:pointer;"><div style="margin-right:12px; display:flex;">${item.icon}</div><div style="flex:1; min-width:0;"><div style="font-weight:700; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div><div style="font-size:11px; color:var(--text-sec);">${new Date(item.date).toLocaleDateString()}</div></div><div style="font-weight:800; font-size:14px; margin-right:10px;">${UI.formatMoney(item.amount)}</div></div><button class="icon-btn" style="color:var(--danger); width:32px; height:32px;" onclick="${delFn}">✕</button>`;
                row.style.display = "flex"; row.style.alignItems = "center"; container.appendChild(row);
            });
        };
    }

    // 7. SELECTOR DE APPS REALES INSTALADAS EN EL TELEFONO, PANEL AJUSTES Y VOZ EN CHAT
    window.openInstalledAppsPickerModal = function () {
        document.getElementById("installed-apps-modal")?.remove();
        let installed = [];
        try { if (window.SmartyAndroid?.getInstalledAppsJson) installed = JSON.parse(window.SmartyAndroid.getInstalledAppsJson() || "[]"); } catch (_) {}
        const savedCsv = window.SmartyAndroid?.getAllowedNotificationPackages ? (window.SmartyAndroid.getAllowedNotificationPackages() || "") : "";
        const selected = new Set(savedCsv ? savedCsv.split(",").filter(Boolean) : (Data.store.settings?.allowedBankPackages || []));
        installed.sort((a, b) => (selected.has(b.pkg) - selected.has(a.pkg)) || a.name.localeCompare(b.name));

        const ov = document.createElement("div"); ov.id = "installed-apps-modal"; ov.className = "modal-overlay open"; ov.style.zIndex = "25000";
        ov.innerHTML = `<div class="settings-card" onclick="event.stopPropagation()" style="max-height:85vh; display:flex; flex-direction:column;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><h3 style="margin:0; color:var(--primary);">📲 Mis Apps Instaladas (${installed.length})</h3><button class="icon-btn" id="iap-close">✕</button></div><p style="font-size:11.5px; color:var(--text-sec); margin:0 0 10px;">Elige de qué aplicaciones de tu teléfono puede recibir notificaciones Smarty:</p><input type="text" id="iap-search" class="setting-input" placeholder="🔍 Buscar en mis apps..." style="width:100%; margin-bottom:10px;"><div style="flex:1; overflow-y:auto;">${installed.map(a => `<div class="setting-item iap-row" data-q="${a.name.toLowerCase()} ${a.pkg.toLowerCase()}" style="padding:10px 4px;"><div style="display:flex; flex-direction:column; overflow:hidden; padding-right:8px;"><span style="font-size:13.5px; font-weight:700;">${a.name}</span><span style="font-size:10px; color:var(--text-sec);">${a.pkg}</span></div><label class="switch-wrap"><input type="checkbox" class="iap-chk" value="${a.pkg}" ${selected.has(a.pkg) ? "checked" : ""}><span class="slider"></span></label></div>`).join("")}</div><button class="btn-full" id="iap-save" style="margin-top:12px;">Guardar Selección</button></div>`;
        document.body.appendChild(ov);
        ov.querySelector("#iap-close").onclick = () => ov.remove();
        ov.querySelector("#iap-search").oninput = function () { const q = this.value.toLowerCase().trim(); ov.querySelectorAll(".iap-row").forEach(r => r.style.display = r.getAttribute("data-q").includes(q) ? "flex" : "none"); };
        ov.querySelector("#iap-save").onclick = () => {
            const pkgs = []; ov.querySelectorAll(".iap-chk:checked").forEach(c => pkgs.push(c.value));
            Data.store.settings.allowedBankPackages = pkgs; Data.save();
            if (window.SmartyAndroid?.setAllowedNotificationPackages) window.SmartyAndroid.setAllowedNotificationPackages(pkgs.join(","));
            ov.remove(); UI.renderSettingsView(); UI.showSnackbar(`✅ ${pkgs.length} apps autorizadas`);
        };
    };

    window.askGroqKeyModal = function () {
        document.getElementById("groq-key-modal")?.remove();
        const ov = document.createElement("div"); ov.id = "groq-key-modal"; ov.className = "modal-overlay open"; ov.style.zIndex = "25000";
        const curr = (Data?.store?.settings?.groqApiKey || "").trim();
        ov.innerHTML = `<div class="settings-card" onclick="event.stopPropagation()" style="max-width:350px;"><h3 style="margin:0 0 8px; color:var(--primary);">🔑 Clave API de Groq</h3><input type="text" id="gk-inp" class="setting-input" placeholder="gsk_..." value="${curr}" style="width:100%; margin-bottom:12px;"><div style="display:flex; gap:8px;"><button class="btn-danger-outline" style="margin:0; flex:1;" id="gk-c">Cerrar</button><button class="btn-full" style="margin:0; flex:1;" id="gk-s">Guardar</button></div></div>`;
        document.body.appendChild(ov);
        ov.querySelector("#gk-c").onclick = () => ov.remove();
        ov.querySelector("#gk-s").onclick = () => { Data.store.settings.groqApiKey = ov.querySelector("#gk-inp").value.trim(); Data.save(); ov.remove(); UI.renderSettingsView(); UI.showSnackbar("Clave guardada ✅"); };
    };
    if (typeof GroqAI !== "undefined") GroqAI.getApiKey = function () { const s = (Data?.store?.settings?.groqApiKey || "").trim(); if (s) return s; window.askGroqKeyModal(); return null; };

    window.checkForOtaUpdateNow = function () {
        UI.showSnackbar("🔄 Buscando actualización en Vercel...");
        const s = document.createElement("script");
        s.src = "https://smart-life-pro.vercel.app/smarty-ota.js?t=" + Date.now();
        s.onload = () => { UI.refreshDOM(); UI.showSnackbar("⚡ ¡Actualizado al instante! (V" + window.SMARTY_APK_VERSION + ")"); };
        s.onerror = () => UI.showSnackbar("✅ Versión activa: V" + window.SMARTY_APK_VERSION);
        document.head.appendChild(s);
    };

    if (typeof UI !== "undefined" && UI.renderSettingsView) {
        if (!UI._origRenderSettingsBase) UI._origRenderSettingsBase = UI.renderSettingsView.bind(UI);
        UI.renderSettingsView = function () {
            UI._origRenderSettingsBase();
            document.querySelectorAll("#settings-inject .setting-group, #settings-inject .div-line").forEach(el => el.remove());
            const rInp = document.getElementById("restore-input");
            if (rInp && window.SmartyAndroid?.pickRestoreFile) { rInp.style.display = "none"; rInp.parentElement.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.SmartyAndroid.pickRestoreFile(); }; }
            const c = document.getElementById("settings-inject"); if (!c) return;
            document.getElementById("android-pro-settings")?.remove();
            const s = Data.store.settings || {}, hasK = !!(s.groqApiKey?.trim()), cnt = (s.allowedBankPackages || []).length;
            const perm = !!(window.SmartyAndroid?.isNotificationListenerEnabled && window.SmartyAndroid.isNotificationListenerEnabled());
            const p = document.createElement("div"); p.id = "android-pro-settings"; p.style.marginBottom = "20px";
            p.innerHTML = `<div class="section-label">ANDROID PRO, IA & ACTUALIZACIONES</div><div class="glass-card" style="padding:15px; margin:0;">
                <button class="btn-full" style="margin:0 0 10px; padding:12px; font-size:13.5px;" onclick="window.checkForOtaUpdateNow()">🔄 Buscar Actualización Ahora (V${window.SMARTY_APK_VERSION})</button>
                <div class="setting-item"><span>🔑 API Key de Groq (Smarty AI)</span><button class="text-btn-small" style="background:var(--input-bg);" onclick="window.askGroqKeyModal()">${hasK ? "Configurada ✅" : "Poner Clave +"}</button></div>
                <div class="setting-item"><span>🫆 Desbloqueo con Huella / Rostro</span><label class="switch-wrap"><input type="checkbox" ${s.biometricEnabled ? "checked" : ""} onchange="Data.store.settings.biometricEnabled=this.checked; Data.save(); if(this.checked && window.SmartyAndroid?.authenticateBiometric) window.SmartyAndroid.authenticateBiometric();"><span class="slider"></span></label></div>
                <div class="setting-item"><span>💾 Auto-Backup Diario (Archivo Único)</span><label class="switch-wrap"><input type="checkbox" ${s.autoDailyBackup !== false ? "checked" : ""} onchange="Data.store.settings.autoDailyBackup=this.checked; Data.save();"><span class="slider"></span></label></div>
                <div class="setting-item"><span>🏦 Leer Notificaciones de Bancos</span><label class="switch-wrap"><input type="checkbox" ${s.bankAutoDetect ? "checked" : ""} onchange="Data.store.settings.bankAutoDetect=this.checked; Data.save(); if(this.checked && !window.SmartyAndroid?.isNotificationListenerEnabled()) window.SmartyAndroid?.openNotificationSettings();"><span class="slider"></span></label></div>
                <div class="setting-item"><span>📲 Apps Autorizadas (${cnt})</span><button class="text-btn-small" style="background:var(--input-bg);" onclick="window.openInstalledAppsPickerModal()">Elegir de mi móvil ➔</button></div>
                <div class="setting-item"><span>Modo Registro Bancario</span><select class="setting-select" style="width:auto; margin:0; padding:6px 10px; font-size:12px;" onchange="Data.store.settings.bankAutoSaveMode=this.value; Data.save();"><option value="confirm" ${s.bankAutoSaveMode !== "auto" ? "selected" : ""}>Confirmar antes</option><option value="auto" ${s.bankAutoSaveMode === "auto" ? "selected" : ""}>Guardar 100% solo</option></select></div>
                <div style="display:flex; gap:8px; margin-top:10px;"><button class="btn-data" style="padding:10px; font-size:12px;" onclick="window.SmartyAndroid?.openNotificationSettings()">⚙️ Permiso (${perm ? "OK" : "Falta"})</button><button class="btn-data" style="padding:10px; font-size:12px;" onclick="window.SmartyAndroid?.postRealTestNotification('Compra de crédito aprobada','Compra aprobada por $34.90 en Heladería Freddo')">📲 Probar Notif.</button></div>
            </div>`;
            c.insertBefore(p, c.firstChild);
        };
    }

    const chatInput = document.getElementById("smarty-chat-input");
    if (chatInput && !document.getElementById("smarty-chat-mic-btn")) {
        const mic = document.createElement("button"); mic.id = "smarty-chat-mic-btn"; mic.className = "icon-btn";
        mic.style.cssText = "width:44px; height:44px; border-radius:50%; flex-shrink:0; background:var(--input-bg); color:var(--primary);";
        mic.innerHTML = "🎙️";
        mic.onclick = async () => { try { mic.classList.add("listening"); const q = await GroqAI.listenOnce(); mic.classList.remove("listening"); if (q?.trim()) { chatInput.value = q.trim(); Assistant.sendSmartyMessage(); } } catch (_) { mic.classList.remove("listening"); } };
        chatInput.parentNode.insertBefore(mic, chatInput.nextSibling);
    }

    if (typeof UI !== "undefined" && UI.toggleGuide) {
        if (!UI._origToggleGuideBase) UI._origToggleGuideBase = UI.toggleGuide.bind(UI);
        UI.toggleGuide = function () {
            UI._origToggleGuideBase();
            setTimeout(() => {
                const area = document.querySelector(".guide-scroll-area > div");
                if (!area || document.getElementById("guide-groq-api-card")) return;
                const card = document.createElement("div"); card.id = "guide-groq-api-card"; card.className = "guide-card"; card.style.border = "1.5px solid var(--primary)";
                card.innerHTML = `<div class="guide-card-header"><div class="guide-card-icon">🔑</div><div class="guide-card-title">Cómo conseguir tu API Key de Groq (Gratis)</div></div><div class="guide-card-body">1. Entra en tu navegador a <b>console.groq.com/keys</b> e inicia sesión con Google.<br>2. Toca <b>"Create API Key"</b>, ponle nombre <i>Smarty</i> y dale a <b>Submit</b>.<br>3. Copia la clave generada (empieza por <i>gsk_...</i>) y pégala en <b>Ajustes ➔ API Key de Groq</b>.</div>`;
                area.insertBefore(card, area.children[1] || area.firstChild);
            }, 60);
        };
    }

    if (typeof UI !== "undefined") UI.refreshDOM();
})();
