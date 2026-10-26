/* =========================================
   SMART LIFE PRO - LIVE OTA UPDATE (V17.0-OTA)
   1. 'Ocio' -> 'Microgastos' con Icono SVG de Hormiga
   2. Selector de Apps Bancarias permitidas para notificaciones
   3. Fix de desborde de texto en burbujas del Chat de Smarty
   4. Gráfico de Pastel y Leyenda clickeables para filtrar categoría
   5. Icono SVG limpio en botón 'Ver Montos / Ver %' (sin emoji)
   6. Eliminada la tarjeta superior de resumen en Finanzas
   7. Orden de Gastos Fijos por 'Valor' por defecto y persistente
   8. Guía paso a paso en el Manual para obtener API Key de Groq gratis
   ========================================= */

(function () {
    console.log("⚡ [Smarty OTA V17.0] Aplicando actualización en vivo...");
    window.SMARTY_APK_VERSION = "17.0-OTA";

    // Quitar tarjeta superior de resumen si existía de la versión anterior
    document.getElementById("fin-bank-summary-banner")?.remove();
    document.getElementById("pace-day-marker")?.remove();

    // ---------------------------------------------------------
    // 1. ESTILOS: CHAT BLINDADO + HORMIGA + LEYENDA CLICKEABLE + BOTON SVG
    // ---------------------------------------------------------
    document.getElementById("smarty-ota-v16-styles")?.remove();
    document.getElementById("smarty-ota-v17-styles")?.remove();

    const st = document.createElement("style");
    st.id = "smarty-ota-v17-styles";
    st.innerHTML = `
        #budget-circle { filter: none !important; box-shadow: none !important; }
        #pace-day-marker, #fin-bank-summary-banner { display: none !important; }
        .tone-orange { color: #EA580C; background: rgba(234, 88, 12, 0.14); }
        .tone-crimson { color: #E11D48; background: rgba(225, 29, 72, 0.14); }
        .tone-ant { color: #D97706; background: rgba(217, 119, 6, 0.15); }

        .brand-logo-real {
            width: 38px; height: 38px; border-radius: 11px;
            display: inline-flex; align-items: center; justify-content: center;
            margin-right: 12px; flex-shrink: 0; overflow: hidden;
            box-shadow: 0 3px 8px rgba(0,0,0,0.12);
        }
        .brand-logo-real svg, .brand-logo-real img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Fix definitivo para que el texto de Smarty AI jamás se salga de la burbuja */
        #smarty-chat-box > div {
            max-width: 85% !important;
            box-sizing: border-box !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
            white-space: normal !important;
            overflow-x: hidden !important;
        }

        #smarty-chat-mic-btn.listening {
            background: var(--danger) !important;
            color: #fff !important;
            transform: scale(1.08);
            box-shadow: 0 0 14px rgba(239, 68, 68, 0.55);
        }

        .quick-cat-switcher {
            display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
            margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(120,120,120,0.2);
        }
        .quick-cat-pill {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 6px 10px; border-radius: 12px; font-size: 11.5px; font-weight: 700;
            background: var(--input-bg); color: var(--text-color); cursor: pointer;
            border: 1.5px solid transparent; transition: 0.15s;
        }
        .quick-cat-pill.active-cat {
            background: var(--primary); color: #fff; border-color: var(--primary);
        }
        .quick-cat-pill.active-cat .category-icon-shell {
            background: rgba(255,255,255,0.22); color: #fff;
        }

        /* Filas de leyenda del gráfico interactivas */
        .chart-legend-interactive {
            padding: 7px 10px;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.15s ease, transform 0.12s ease;
        }
        .chart-legend-interactive:active {
            transform: scale(0.98);
            background: var(--input-bg);
        }
        .chart-legend-interactive.active-filter-row {
            background: rgba(0, 110, 230, 0.12);
            border: 1px solid rgba(0, 110, 230, 0.3);
        }
    `;
    document.head.appendChild(st);

    // ---------------------------------------------------------
    // 2. CAMBIAR 'OCIO' A 'MICROGASTOS' (CON ICONO DE HORMIGA) + 'ALMUERZO' + 'DELIVERY Y SALIDAS'
    // ---------------------------------------------------------
    if (typeof UI !== "undefined") {
        if (UI.dictionary?.es) {
            UI.dictionary.es.cat_leisure = "Microgastos";
            UI.dictionary.es.cat_lunch = "Almuerzo";
            UI.dictionary.es.cat_dining = "Delivery y Salidas";
            UI.dictionary.es.tab_subs = "Gastos Fijos";
            UI.dictionary.es.btn_add_sub = "+ Nuevo Gasto Fijo";
            UI.dictionary.es.mod_sub_title = "Nuevo Gasto Fijo";
            UI.dictionary.es.empty_subs = "Sin gastos fijos activos.";
        }
        if (UI.dictionary?.pt) {
            UI.dictionary.pt.cat_leisure = "Microgastos";
            UI.dictionary.pt.cat_lunch = "Almoço";
            UI.dictionary.pt.cat_dining = "Delivery e Saídas";
            UI.dictionary.pt.tab_subs = "Gastos Fixos";
            UI.dictionary.pt.btn_add_sub = "+ Novo Gasto Fixo";
            UI.dictionary.pt.mod_sub_title = "Novo Gasto Fixo";
            UI.dictionary.pt.empty_subs = "Sem gastos fixos ativos.";
        }
        if (UI.dictionary?.en) {
            UI.dictionary.en.cat_leisure = "Micro-expenses";
            UI.dictionary.en.cat_lunch = "Lunch";
            UI.dictionary.en.cat_dining = "Delivery & Dining";
            UI.dictionary.en.tab_subs = "Fixed Exp.";
            UI.dictionary.en.btn_add_sub = "+ New Fixed Expense";
            UI.dictionary.en.mod_sub_title = "New Fixed Expense";
            UI.dictionary.en.empty_subs = "No active fixed expenses.";
        }

        if (Array.isArray(UI.categories)) {
            if (!UI.categories.some(c => c.id === "cat_lunch")) {
                const leisureIdx = UI.categories.findIndex(c => c.id === "cat_leisure");
                const newCats = [
                    { id: "cat_lunch", icon: "lunch" },
                    { id: "cat_dining", icon: "dining" }
                ];
                if (leisureIdx >= 0) {
                    UI.categories.splice(leisureIdx, 0, ...newCats);
                } else {
                    UI.categories.push(...newCats);
                }
            }
        }

        // Migrar gastos viejos que decían "Ocio" / "Lazer" / "Leisure" a "Microgastos" para que no queden sueltos
        if (Data?.store?.expenses) {
            const oldLeisureNames = ["ocio", "lazer", "leisure"];
            Data.store.expenses.forEach(exp => {
                if (exp.category && oldLeisureNames.includes(String(exp.category).toLowerCase().trim())) {
                    exp.category = UI.t("cat_leisure");
                }
            });
        }

        if (!UI._origCategoryIconV17) {
            UI._origCategoryIconV17 = UI.categoryIcon.bind(UI);
        }
        UI.categoryIcon = function (id) {
            // Icono SVG de Hormiga para Microgastos (cat_leisure)
            if (id === "cat_leisure" || id === "Microgastos" || id === "Micro-expenses") {
                return '<span class="category-icon-shell tone-ant"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2.2"/><circle cx="12" cy="11.5" r="2.5"/><ellipse cx="12" cy="18" rx="3.2" ry="4"/><path d="M10 4.2 8 2.5M14 4.2 16 2.5"/><path d="M9.8 10.5 5 8.5M14.2 10.5 19 8.5"/><path d="M9.5 12.2 4.5 13M14.5 12.2 19.5 13"/><path d="M9.2 16.5 5 19.5M14.8 16.5 19 19.5"/></svg></span>';
            }
            if (id === "cat_lunch") {
                return '<span class="category-icon-shell tone-orange"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></span>';
            }
            if (id === "cat_dining") {
                return '<span class="category-icon-shell tone-crimson"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2Z"/><path d="M8.5 7.5a3.5 3.5 0 1 1 7 0"/></svg></span>';
            }
            return UI._origCategoryIconV17(id);
        };
    }

    const ALL_CAT_IDS = [
        "cat_market", "cat_lunch", "cat_dining", "cat_leisure",
        "cat_transport", "cat_clothes", "cat_health", "cat_bills",
        "cat_travel", "cat_beauty", "cat_other"
    ];

    // Helper para resolver cualquier nombre de categoría a su ID de filtro
    function resolveCategoryId(catNameOrId) {
        if (!catNameOrId) return "cat_other";
        const clean = String(catNameOrId).trim().toLowerCase();
        if (clean === "cat_market" || clean === String(UI.t("cat_market")).toLowerCase()) return "cat_market";
        if (clean === "cat_subs" || clean === "tab_subs" || clean === String(UI.t("tab_subs")).toLowerCase()) return "cat_subs";
        if (clean === "ocio" || clean === "lazer" || clean === "leisure" || clean === "microgastos") return "cat_leisure";
        for (const c of (UI.categories || [])) {
            if (c.id.toLowerCase() === clean || String(UI.t(c.id)).toLowerCase() === clean) {
                return c.id;
            }
        }
        return "cat_other";
    }

    // ---------------------------------------------------------
    // 3. ORDEN DE GASTOS FIJOS POR 'VALOR' POR DEFECTO Y PERSISTENTE
    // ---------------------------------------------------------
    if (typeof Finance !== "undefined") {
        // Leer orden guardado o usar 'value' (Valor) por defecto
        if (!Data.store.settings) Data.store.settings = {};
        if (!Data.store.settings.subscriptionSort) {
            Data.store.settings.subscriptionSort = "value";
        }
        Finance.subscriptionSort = Data.store.settings.subscriptionSort;

        // Quitar el banner superior que no gustó
        Finance.injectFinanceSummaryBanner = function () {
            document.getElementById("fin-bank-summary-banner")?.remove();
        };

        Finance.setSubscriptionSortOrder = function (newSort) {
            this.subscriptionSort = newSort;
            if (!Data.store.settings) Data.store.settings = {};
            Data.store.settings.subscriptionSort = newSort;
            Data.save();
            this.renderSubscriptions();
        };

        Finance.renderSubscriptions = function () {
            const container = document.getElementById("subs-list");
            if (!container) return;
            container.innerHTML = "";
            document.getElementById("fin-bank-summary-banner")?.remove();

            if (!Data.store.subscriptions || Data.store.subscriptions.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">${UI.t("empty_subs")}</div>`;
                return;
            }

            // Asegurar que usa el último orden guardado (o 'value' por defecto)
            this.subscriptionSort = Data.store.settings?.subscriptionSort || "value";

            const sortBar = document.createElement("div");
            sortBar.className = "subscription-sort-bar";
            sortBar.innerHTML = `
                <label for="subs-sort">Ordenar por</label>
                <select id="subs-sort" onchange="Finance.setSubscriptionSortOrder(this.value)">
                    <option value="value">Valor</option>
                    <option value="date">Fecha de cobro</option>
                    <option value="name">Orden alfabético</option>
                </select>
            `;
            sortBar.querySelector("select").value = this.subscriptionSort;
            container.appendChild(sortBar);

            const subscriptions = [...Data.store.subscriptions].sort((a, b) => {
                if (this.subscriptionSort === "value") {
                    // Ordenar por valor de mayor a menor para ver primero los más pesados
                    return (parseFloat(b.cost) || 0) - (parseFloat(a.cost) || 0);
                }
                if (this.subscriptionSort === "name") {
                    return String(a.name).localeCompare(String(b.name), undefined, { sensitivity: "base" });
                }
                return (parseInt(a.day, 10) || 0) - (parseInt(b.day, 10) || 0);
            });

            let totalCost = 0;
            subscriptions.forEach(sub => {
                totalCost += parseFloat(sub.cost) || 0;
                const div = document.createElement("div");
                div.className = "glass-card item-row";
                const badge = window.getSmartBrandBadge ? window.getSmartBrandBadge(sub.name) : "";
                div.innerHTML = `
                    ${badge}
                    <div style="flex:1">
                        <div style="font-weight:700;">${sub.name}</div>
                        <div style="font-size:12px; opacity:0.7;">${UI.t("sub_charge_day")} ${sub.day}</div>
                    </div>
                    <div style="font-weight:800; margin-right:15px; color:var(--text-color);">${UI.formatMoney(sub.cost)}</div>
                    <button class="icon-btn" style="color:var(--danger); width:36px; height:36px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                `;
                div.querySelector("button").onclick = () => this.deleteSub(sub.id);
                container.appendChild(div);
            });

            const totalDiv = document.createElement("div");
            totalDiv.className = "glass-card";
            totalDiv.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:15px; margin-top:15px; border:2px solid var(--primary);";
            totalDiv.innerHTML = `
                <div style="font-weight:800; color:var(--text-color);">Total Mensual</div>
                <div style="font-size:18px; font-weight:900; color:var(--primary);">${UI.formatMoney(totalCost)}</div>
            `;
            container.appendChild(totalDiv);
        };
    }

    // ---------------------------------------------------------
    // 4. GRAFICO DE PASTEL Y LEYENDA CLICKEABLES + ICONO SVG EN 'VER MONTOS / VER %'
    // ---------------------------------------------------------
    if (typeof Finance !== "undefined") {
        Finance.selectCategoryFromChart = function (catId) {
            if (this.selectedCategoryFilter === catId) {
                this.selectedCategoryFilter = "ALL";
            } else {
                this.selectedCategoryFilter = catId;
            }
            if (navigator.vibrate) navigator.vibrate(10);
            this.renderExpensesHistory();
            setTimeout(() => {
                const listTarget = document.getElementById("history-filtered-anchor");
                if (listTarget) listTarget.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 80);
        };

        Finance.handlePieClick = function (event, pieElement) {
            if (!this._lastPieSlices || !this._lastPieSlices.length) return;
            const rect = pieElement.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = event.clientX - cx;
            const dy = event.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Si tocó el centro blanco del donut, mostrar Todo
            if (dist < rect.width * 0.22) {
                this.selectCategoryFromChart("ALL");
                return;
            }
            // Calcular ángulo en grados desde arriba (0 a 360 en sentido horario)
            let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
            if (deg < 0) deg += 360;
            const slice = this._lastPieSlices.find(s => deg >= s.startDeg && deg <= s.endDeg);
            if (slice && slice.catId) {
                this.selectCategoryFromChart(slice.catId);
            }
        };

        Finance.renderCategoryChart = function (container) {
            const categories = {};
            const [selYear, selMonth] = this.selectedHistoryMonth.split("-").map(Number);
            let totalMonth = 0;

            (Data.store.expenses || []).forEach(e => {
                const d = new Date(e.date);
                let match = false;
                if (!e.isInstallment && d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    match = true;
                } else if (e.isInstallment) {
                    const target = new Date(selYear, selMonth - 1, 1);
                    const { current } = this.calculateProgressAtDate(e.date, e.installments.total, target);
                    if (current > 0 && current <= e.installments.total) match = true;
                }
                if (match) {
                    const catId = resolveCategoryId(e.category);
                    const catLabel = UI.t(catId);
                    if (!categories[catLabel]) categories[catLabel] = { amount: 0, catId };
                    categories[catLabel].amount += parseFloat(e.amount);
                    totalMonth += parseFloat(e.amount);
                }
            });

            (Data.store.lists || []).filter(l => l.status === "completed").forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    const c = UI.t("cat_market");
                    if (!categories[c]) categories[c] = { amount: 0, catId: "cat_market" };
                    categories[c].amount += parseFloat(l.total);
                    totalMonth += parseFloat(l.total);
                }
            });

            const daysInMonth = new Date(selYear, selMonth, 0).getDate();
            (Data.store.subscriptions || []).forEach(s => {
                if (s.day <= daysInMonth) {
                    const c = UI.t("tab_subs");
                    if (!categories[c]) categories[c] = { amount: 0, catId: "cat_subs" };
                    categories[c].amount += parseFloat(s.cost);
                    totalMonth += parseFloat(s.cost);
                }
            });

            if (totalMonth > 0) {
                const colors = ["#007AFF", "#FF9500", "#FF2D55", "#AF52DE", "#34C759", "#5AC8FA", "#EC4899", "#8E8E93"];
                let currentDeg = 0;
                const gradientParts = [];
                this._lastPieSlices = [];

                const sorted = Object.entries(categories).sort((a, b) => b[1].amount - a[1].amount);
                let legendHTML = '<div style="margin-top:22px; width:100%; display:flex; flex-direction:column; gap:6px;">';

                sorted.forEach(([catLabel, info], i) => {
                    const amount = info.amount;
                    const catId = info.catId;
                    const deg = (amount / totalMonth) * 360;
                    const pct = (amount / totalMonth) * 100;
                    const col = colors[i % colors.length];
                    const icon = catId === "cat_subs" ? UI.categoryIcon("cat_subs") : this.getCategoryIcon(catId);
                    const displayValue = this.chartDisplayMode === "percent" ? `${Math.round(pct)}%` : UI.formatMoney(amount);
                    const isSelectedRow = this.selectedCategoryFilter === catId ? "active-filter-row" : "";

                    this._lastPieSlices.push({ startDeg: currentDeg, endDeg: currentDeg + deg, catId });
                    gradientParts.push(`${col} ${currentDeg}deg ${currentDeg + deg}deg`);
                    currentDeg += deg;

                    legendHTML += `
                        <div class="chart-legend-interactive ${isSelectedRow}" onclick="Finance.selectCategoryFromChart('${catId}')" style="display:flex; align-items:center; justify-content:space-between; font-size:13px;">
                            <div style="display:flex; align-items:center; gap:9px; width:46%; overflow:hidden;">
                                <div style="width:10px; height:10px; border-radius:50%; background:${col}; flex-shrink:0; box-shadow:0 0 5px ${col};"></div>
                                <span style="font-size:16px; display:flex;">${icon}</span>
                                <span style="font-weight:700; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${catLabel}</span>
                            </div>
                            <div style="flex:1; margin:0 10px; height:5px; background:rgba(120,120,120,0.1); border-radius:3px; overflow:hidden;">
                                <div style="height:100%; width:${pct}%; background:${col}; border-radius:3px;"></div>
                            </div>
                            <div style="font-weight:800; color:var(--text-color); text-align:right; min-width:52px;">${displayValue}</div>
                        </div>
                    `;
                });
                legendHTML += "</div>";

                const toggleText = this.chartDisplayMode === "percent" ? "Ver Montos" : "Ver %";
                // Icono SVG limpio en lugar del emoji 🔁
                const swapSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; margin-left:4px;"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`;

                const chartHTML = `
                    <div class="glass-card" style="padding:22px; margin-bottom:16px; display:flex; flex-direction:column; align-items:center;">
                        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:18px;">
                            <div style="font-size:12px; font-weight:800; color:var(--text-sec); text-transform:uppercase; letter-spacing:1px;">${UI.t("cat_distribution")}</div>
                            <button class="text-btn-small" onclick="Finance.toggleChartMode()" style="background:var(--input-bg); padding:6px 12px; font-size:11.5px; border-radius:10px; display:inline-flex; align-items:center;">
                                <span>${toggleText}</span>${swapSvg}
                            </button>
                        </div>

                        <div onclick="Finance.handlePieClick(event, this)" title="Toca un color para filtrar" style="cursor:pointer; position:relative; width:162px; height:162px; border-radius:50%; background: conic-gradient(${gradientParts.join(", ")});">
                            <div style="position:absolute; inset:24px; background:var(--glass-bg); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:inset 0 2px 10px rgba(0,0,0,0.05);">
                                <span style="font-size:10px; color:var(--text-sec); font-weight:800; text-transform:uppercase;">TOTAL</span>
                                <span style="font-size:18px; font-weight:900; color:var(--text-color); margin-top:2px;">${UI.formatMoney(totalMonth)}</span>
                            </div>
                        </div>

                        <div style="font-size:10px; color:var(--text-sec); margin-top:10px; opacity:0.75;">Toca el gráfico o una categoría abajo para ver sus gastos</div>
                        ${legendHTML}
                    </div>
                `;

                const div = document.createElement("div");
                div.innerHTML = chartHTML;
                container.appendChild(div);
            }
        };

        const origExpHistory = Finance.renderExpensesHistory.bind(Finance);
        Finance.renderExpensesHistory = function () {
            const container = document.getElementById("expenses-history-list");
            if (!container) return;
            container.innerHTML = "";

            this.renderMonthSelector(container);

            const pdfBtn = document.createElement("button");
            pdfBtn.id = "btn-export-pdf-month";
            pdfBtn.className = "btn-data";
            pdfBtn.style.cssText = "width:calc(100% - 32px); margin:0 16px 14px; padding:12px; flex-direction:row; font-size:13px;";
            pdfBtn.innerHTML = "📄 Exportar Resumen Detallado en PDF";
            pdfBtn.onclick = () => this.exportMonthlyPDF();
            container.appendChild(pdfBtn);

            this.renderCategoryChart(container);

            const filterContainer = document.createElement("div");
            filterContainer.id = "history-filtered-anchor";
            filterContainer.innerHTML = this.renderFilterChips();
            container.appendChild(filterContainer);

            const [selYear, selMonth] = this.selectedHistoryMonth.split("-").map(Number);
            let allItems = [];

            (Data.store.expenses || []).forEach(e => {
                let match = false;
                let date = e.date;
                const d = new Date(e.date);
                if (!e.isInstallment && d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) match = true;
                else if (e.isInstallment) {
                    const target = new Date(selYear, selMonth - 1, 1);
                    const { current } = this.calculateProgressAtDate(e.date, e.installments.total, target);
                    if (current > 0 && current <= e.installments.total) { match = true; date = target.getTime(); }
                }
                if (match) {
                    const catId = resolveCategoryId(e.category);
                    let extrasIcon = (e.photo ? " 📷" : "") + (e.link ? " 🔗" : "");
                    allItems.push({
                        type: "expense", id: e.id, date, amount: e.amount,
                        name: e.desc + extrasIcon, rawCatId: catId,
                        icon: this.getCategoryIcon(catId)
                    });
                }
            });

            (Data.store.lists || []).filter(l => l.status === "completed").forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    allItems.push({
                        type: "list", id: l.id, date: l.date, amount: l.total,
                        name: l.name, rawCatId: "cat_market", icon: UI.categoryIcon("cat_market")
                    });
                }
            });

            const daysInM = new Date(selYear, selMonth, 0).getDate();
            (Data.store.subscriptions || []).forEach(s => {
                if (s.day <= daysInM) {
                    allItems.push({
                        type: "sub", id: s.id, date: new Date(selYear, selMonth - 1, s.day).getTime(),
                        amount: s.cost, name: s.name, rawCatId: "cat_subs",
                        icon: window.getSmartBrandBadge ? window.getSmartBrandBadge(s.name) : UI.categoryIcon("cat_subs")
                    });
                }
            });

            if (this.selectedCategoryFilter !== "ALL") {
                allItems = allItems.filter(item => item.rawCatId === this.selectedCategoryFilter);
            }

            allItems.sort((a, b) => b.date - a.date);

            if (this.selectedCategoryFilter !== "ALL") {
                const totalF = allItems.reduce((s, i) => s + parseFloat(i.amount), 0);
                const lblTitle = this.selectedCategoryFilter === "cat_subs" ? UI.t("tab_subs") : UI.t(this.selectedCategoryFilter);
                const sumDiv = document.createElement("div");
                sumDiv.className = "glass-card";
                sumDiv.style.cssText = "text-align:center; padding:15px; margin:0 16px 12px;";
                sumDiv.innerHTML = `<div style="font-size:11px; font-weight:800; color:var(--text-sec);">${lblTitle.toUpperCase()}</div><div style="font-size:20px; font-weight:900;">${UI.formatMoney(totalF)}</div>`;
                container.appendChild(sumDiv);
            }

            if (allItems.length === 0) {
                container.innerHTML += `<div style="text-align:center; padding:30px; opacity:0.5; font-size:13px;">Sin movimientos en esta categoría.</div>`;
            } else {
                allItems.forEach(item => {
                    const row = document.createElement("div");
                    row.className = "item-row";
                    const delFn = item.type === "expense" ? `Finance.deleteExpense('${item.id}')` : (item.type === "list" ? `Shopping.deleteList('${item.id}')` : `Finance.deleteSub('${item.id}')`);
                    const clickFn = item.type === "expense" ? `Finance.openExpenseDetail('${item.id}')` : (item.type === "list" ? `Shopping.openHistoryDetail('${item.id}')` : "");

                    row.innerHTML = `
                        <div class="item-content-wrap" onclick="${clickFn}" style="cursor:pointer;">
                            <div style="margin-right:12px; flex-shrink:0; display:flex; align-items:center;">${item.icon}</div>
                            <div style="flex:1; min-width:0;">
                                <div style="font-weight:700; font-size:14px; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                                <div style="font-size:11px; color:var(--text-sec);">${new Date(item.date).toLocaleDateString()}</div>
                            </div>
                            <div style="font-weight:800; font-size:14px; color:var(--text-color); margin-right:10px;">${UI.formatMoney(item.amount)}</div>
                        </div>
                        <button class="icon-btn" style="color:var(--danger); width:32px; height:32px; margin-left:5px;" onclick="${delFn}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    `;
                    row.style.display = "flex";
                    row.style.alignItems = "center";
                    row.style.justifyContent = "space-between";
                    container.appendChild(row);
                });
            }
        };
    }

    // ---------------------------------------------------------
    // 5. SELECTOR DE APPS BANCARIAS PERMITIDAS PARA LEER NOTIFICACIONES
    // ---------------------------------------------------------
    const BANK_APPS_CATALOG = [
        { id: "com.nu.production", name: "Nubank", keywords: ["nubank", "nu pagamentos"] },
        { id: "br.com.intermedium", name: "Banco Inter", keywords: ["inter", "banco inter"] },
        { id: "com.mercadopago.wallet", name: "Mercado Pago", keywords: ["mercado pago", "mercadopago"] },
        { id: "com.itau", name: "Itaú", keywords: ["itau", "itaú"] },
        { id: "com.bradesco", name: "Bradesco", keywords: ["bradesco"] },
        { id: "com.santander.app", name: "Santander", keywords: ["santander"] },
        { id: "br.com.bb.android", name: "Banco do Brasil", keywords: ["banco do brasil", "bb"] },
        { id: "br.com.gabba.Caixa", name: "Caixa", keywords: ["caixa"] },
        { id: "com.picpay", name: "PicPay", keywords: ["picpay"] },
        { id: "com.c6bank.app", name: "C6 Bank", keywords: ["c6 bank", "c6"] },
        { id: "com.google.android.apps.walletnfcrel", name: "Google Wallet", keywords: ["wallet", "billetera", "carteira"] }
    ];

    if (!Data.store.settings) Data.store.settings = {};
    if (!Array.isArray(Data.store.settings.allowedBankApps)) {
        Data.store.settings.allowedBankApps = BANK_APPS_CATALOG.map(a => a.id);
    }

    window.openBankAppsFilterModal = function () {
        const old = document.getElementById("bank-apps-filter-modal");
        if (old) old.remove();

        const allowed = new Set(Data.store.settings.allowedBankApps || []);
        const customKw = Data.store.settings.customBankKeyword || "";

        const rowsHTML = BANK_APPS_CATALOG.map(app => {
            const isChecked = allowed.has(app.id) ? "checked" : "";
            return `
                <div class="setting-item" style="padding:10px 4px;">
                    <span style="font-size:14px; font-weight:700;">${app.name}</span>
                    <label class="switch-wrap">
                        <input type="checkbox" class="bank-app-chk" value="${app.id}" ${isChecked}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
        }).join("");

        const ov = document.createElement("div");
        ov.id = "bank-apps-filter-modal";
        ov.className = "modal-overlay open";
        ov.style.zIndex = "25000";
        ov.innerHTML = `
            <div class="settings-card" onclick="event.stopPropagation()" style="max-height:85vh; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; color:var(--primary);">🏦 Apps Permitidas</h3>
                    <button class="icon-btn" id="baf-close">✕</button>
                </div>
                <p style="font-size:12px; color:var(--text-sec); margin:0 0 10px 0;">Smarty solo leerá notificaciones de las apps que marques aquí (ignorará WhatsApp, redes sociales y demás):</p>
                <div style="flex:1; overflow-y:auto; padding-right:4px;">
                    ${rowsHTML}
                    <div style="margin-top:12px;">
                        <div style="font-size:11px; font-weight:700; color:var(--text-sec); margin-bottom:4px;">Otro banco (nombre opcional):</div>
                        <input type="text" id="baf-custom" class="setting-input" placeholder="Ej: Sicredi, Bancolombia, BBVA..." value="${customKw}" style="width:100%;">
                    </div>
                </div>
                <button class="btn-full" id="baf-save" style="margin-top:14px;">Guardar Apps Permitidas</button>
            </div>
        `;
        document.body.appendChild(ov);

        ov.querySelector("#baf-close").onclick = () => ov.remove();
        ov.querySelector("#baf-save").onclick = () => {
            const selected = [];
            ov.querySelectorAll(".bank-app-chk:checked").forEach(chk => selected.push(chk.value));
            Data.store.settings.allowedBankApps = selected;
            Data.store.settings.customBankKeyword = ov.querySelector("#baf-custom").value.trim();
            Data.save();
            ov.remove();
            UI.renderSettingsView();
            UI.showSnackbar(`Filtro actualizado (${selected.length} bancos activos) ✅`);
        };
    };

    if (window.NativeBridge) {
        const origProcessNotif = window.NativeBridge.processBankNotification.bind(window.NativeBridge);
        window.NativeBridge.processBankNotification = async function (notif) {
            const pkg = String(notif.package || "").toLowerCase();
            const title = String(notif.title || "").toLowerCase();
            const allowedIds = Data.store.settings?.allowedBankApps || [];
            const customKw = (Data.store.settings?.customBankKeyword || "").toLowerCase().trim();

            // Permitir siempre la notificación de prueba interna
            const isTestNotif = pkg === "com.smartlife.pro" || title.includes("compra de crédito aprobada");

            if (!isTestNotif) {
                // Ignorar siempre mensajería y redes sociales
                if (/(whatsapp|telegram|instagram|facebook|messenger|tiktok|twitter|gmail|youtube)/.test(pkg)) {
                    return;
                }
                const matchesAllowedApp = BANK_APPS_CATALOG.some(app => {
                    if (!allowedIds.includes(app.id)) return false;
                    return pkg.includes(app.id.toLowerCase()) || app.keywords.some(k => title.includes(k));
                });
                const matchesCustom = customKw.length > 2 && (pkg.includes(customKw) || title.includes(customKw));

                if (!matchesAllowedApp && !matchesCustom) {
                    console.log("[Smarty Filtro Bancario] Notificación ignorada de app no autorizada:", pkg, title);
                    return;
                }
            }
            return await origProcessNotif(notif);
        };
    }

    // Añadir botón de "🏦 Elegir Apps Permitidas" en el panel de Ajustes
    if (typeof UI !== "undefined" && UI.renderSettingsView) {
        const prevRenderSettings = UI.renderSettingsView.bind(UI);
        UI.renderSettingsView = function () {
            prevRenderSettings();
            const panel = document.getElementById("android-pro-settings");
            if (panel && !document.getElementById("btn-choose-bank-apps")) {
                const count = (Data.store.settings?.allowedBankApps || []).length;
                const row = document.createElement("div");
                row.id = "btn-choose-bank-apps";
                row.className = "setting-item";
                row.innerHTML = `
                    <span>🛡️ Bancos Autorizados (${count})</span>
                    <button class="text-btn-small" style="background:var(--input-bg);" onclick="window.openBankAppsFilterModal()">Elegir Apps ➔</button>
                `;
                const card = panel.querySelector(".glass-card");
                if (card) card.insertBefore(row, card.children[5] || null);
            }
        };
    }

    // ---------------------------------------------------------
    // 6. ANADIR EN EL MANUAL (?) COMO CONSEGUIR LA API KEY DE GROQ GRATIS
    // ---------------------------------------------------------
    if (typeof UI !== "undefined" && UI.toggleGuide) {
        const origToggleGuide = UI.toggleGuide.bind(UI);
        UI.toggleGuide = function () {
            origToggleGuide();
            setTimeout(() => {
                const scrollArea = document.querySelector(".guide-scroll-area > div");
                if (!scrollArea || document.getElementById("guide-groq-api-card")) return;

                const lang = Data.store.settings?.lang || "es";
                const groqGuide = {
                    es: {
                        title: "🔑 Cómo conseguir tu API Key de Groq (100% Gratis)",
                        body: `
                            Para activar el cerebro de <b>Smarty AI</b> (chat inteligente, comandos de voz y lector de recibos por cámara), necesitas tu propia clave gratuita de Groq. Solo toma 1 minuto:
                            <br><br>
                            <b>Paso 1:</b> Entra desde tu navegador a <i>console.groq.com/keys</i> e inicia sesión con tu cuenta de Google.
                            <br><br>
                            <b>Paso 2:</b> Toca el botón <b>"Create API Key"</b>, ponle cualquier nombre (por ejemplo: <i>Smarty</i>) y dale a <b>Submit</b>.
                            <br><br>
                            <b>Paso 3:</b> Copia la clave generada (empieza siempre por <i>gsk_...</i>).
                            <br><br>
                            <b>Paso 4:</b> Abre Smarty ➔ ve a <b>Ajustes</b> ➔ toca <b>"🔑 API Key de Groq"</b> y pégala ahí. ¡Listo! Es totalmente gratuita y privada.
                        `
                    },
                    pt: {
                        title: "🔑 Como conseguir sua API Key da Groq (100% Grátis)",
                        body: `
                            Para ativar o cérebro do <b>Smarty AI</b> (chat, voz e leitura de recibos), crie sua chave gratuita em 1 minuto:
                            <br><br>
                            <b>Passo 1:</b> Acesse <i>console.groq.com/keys</i> no navegador e entre com sua conta Google.
                            <br><br>
                            <b>Passo 2:</b> Toque em <b>"Create API Key"</b>, digite um nome (ex: <i>Smarty</i>) e confirme.
                            <br><br>
                            <b>Passo 3:</b> Copie o código gerado (começa com <i>gsk_...</i>).
                            <br><br>
                            <b>Passo 4:</b> No Smarty, vá em <b>Ajustes</b> ➔ <b>"🔑 API Key de Groq"</b> e cole sua chave.
                        `
                    },
                    en: {
                        title: "🔑 How to get your Free Groq API Key",
                        body: `
                            To activate <b>Smarty AI</b> (smart chat, voice & receipt scanner), get your free key in 1 minute:
                            <br><br>
                            <b>Step 1:</b> Go to <i>console.groq.com/keys</i> and sign in with Google.
                            <br><br>
                            <b>Step 2:</b> Tap <b>"Create API Key"</b>, name it <i>Smarty</i> and submit.
                            <br><br>
                            <b>Step 3:</b> Copy the key (starts with <i>gsk_...</i>) and paste it in Smarty <b>Settings ➔ Groq API Key</b>.
                        `
                    }
                }[lang] || { title: "", body: "" };

                const card = document.createElement("div");
                card.id = "guide-groq-api-card";
                card.className = "guide-card";
                card.style.border = "1.5px solid var(--primary)";
                card.innerHTML = `
                    <div class="guide-card-header">
                        <div class="guide-card-icon">🤖</div>
                        <div class="guide-card-title">${groqGuide.title}</div>
                    </div>
                    <div class="guide-card-body">${groqGuide.body}</div>
                `;
                scrollArea.insertBefore(card, scrollArea.children[1] || scrollArea.firstChild);
            }, 60);
        };
    }

    // ---------------------------------------------------------
    // 7. MANTENER CONEXION OTA CON VERCEL Y GITHUB
    // ---------------------------------------------------------
    if (window.SmartyUpdaterAndBackup) {
        window.SmartyUpdaterAndBackup.checkForAppUpdates = async function () {
            UI.showSnackbar("🔄 Buscando actualización...");
            const urls = [
                "https://smart-life-pro.vercel.app/smarty-ota.js?t=" + Date.now(),
                "https://raw.githubusercontent.com/girsinstagramtiktok/SmartLifePro/main/smarty-ota.js?t=" + Date.now()
            ];
            for (const url of urls) {
                try {
                    const res = await fetch(url, { cache: "no-store" });
                    if (res.ok) {
                        const code = await res.text();
                        if (code && code.length > 20 && !code.trim().startsWith("<!DOCTYPE")) {
                            localStorage.setItem("smarty_ota_patch_v14", code);
                            localStorage.setItem("smarty_ota_patch_v15", code);
                            localStorage.setItem("smarty_ota_patch_v16", code);
                            eval(code);
                            if (typeof UI !== "undefined") UI.refreshDOM();
                            UI.showSnackbar("⚡ ¡Actualizado al instante! (" + window.SMARTY_APK_VERSION + ")");
                            return;
                        }
                    }
                } catch (_) {}
            }
            UI.showSnackbar("✅ Ya tienes la última versión (" + window.SMARTY_APK_VERSION + ")");
        };
    }

    if (typeof UI !== "undefined") {
        UI.refreshDOM();
    }
})();
