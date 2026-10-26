/* =========================================
   SMART LIFE PRO - LIVE OTA UPDATE (V16.0-OTA)
   1. Micrófono de Voz en el Chat de Smarty AI
   2. Separar 'Hogar' de 'Gastos Fijos' en Historial
   3. Nuevas Categorías: 'Almuerzo' y 'Delivery & Salidas'
   4. Cambio rápido de categoría en gastos ya guardados (1 toque)
   ========================================= */

(function () {
    console.log("⚡ [Smarty OTA V16.0] Aplicando mejoras en vivo...");
    window.SMARTY_APK_VERSION = "16.0-OTA";

    // ---------------------------------------------------------
    // 1. ESTILOS LIMPIOS + BOTON DE VOZ EN CHAT + CHIPS EN DETALLE
    // ---------------------------------------------------------
    const oldStyle = document.getElementById("smarty-ota-v16-styles");
    if (oldStyle) oldStyle.remove();

    const st = document.createElement("style");
    st.id = "smarty-ota-v16-styles";
    st.innerHTML = `
        #budget-circle { filter: none !important; box-shadow: none !important; }
        #pace-day-marker { display: none !important; }
        .tone-orange { color: #EA580C; background: rgba(234, 88, 12, 0.14); }
        .tone-crimson { color: #E11D48; background: rgba(225, 29, 72, 0.14); }
        .brand-logo-real {
            width: 38px; height: 38px; border-radius: 11px;
            display: inline-flex; align-items: center; justify-content: center;
            margin-right: 12px; flex-shrink: 0; overflow: hidden;
            box-shadow: 0 3px 8px rgba(0,0,0,0.12);
        }
        .brand-logo-real svg, .brand-logo-real img { width: 100%; height: 100%; object-fit: cover; display: block; }
        #smarty-chat-mic-btn.listening {
            background: var(--danger) !important;
            color: #fff !important;
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
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
    `;
    document.head.appendChild(st);
    document.getElementById("pace-day-marker")?.remove();

    // ---------------------------------------------------------
    // 2. NUEVAS CATEGORIAS: 'ALMUERZO' (cat_lunch) Y 'DELIVERY & SALIDAS' (cat_dining)
    // ---------------------------------------------------------
    if (typeof UI !== "undefined") {
        // Traducciones en los 3 idiomas
        if (UI.dictionary?.es) {
            UI.dictionary.es.cat_lunch = "Almuerzo";
            UI.dictionary.es.cat_dining = "Delivery y Salidas";
            UI.dictionary.es.tab_subs = "Gastos Fijos";
            UI.dictionary.es.btn_add_sub = "+ Nuevo Gasto Fijo";
            UI.dictionary.es.mod_sub_title = "Nuevo Gasto Fijo";
        }
        if (UI.dictionary?.pt) {
            UI.dictionary.pt.cat_lunch = "Almoço";
            UI.dictionary.pt.cat_dining = "Delivery e Saídas";
            UI.dictionary.pt.tab_subs = "Gastos Fixos";
            UI.dictionary.pt.btn_add_sub = "+ Novo Gasto Fixo";
            UI.dictionary.pt.mod_sub_title = "Novo Gasto Fixo";
        }
        if (UI.dictionary?.en) {
            UI.dictionary.en.cat_lunch = "Lunch";
            UI.dictionary.en.cat_dining = "Delivery & Dining";
            UI.dictionary.en.tab_subs = "Fixed Exp.";
            UI.dictionary.en.btn_add_sub = "+ New Fixed Expense";
            UI.dictionary.en.mod_sub_title = "New Fixed Expense";
        }

        // Registrar las nuevas categorías en UI.categories si aún no están
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

        // Añadir iconos SVG propios para Almuerzo y Delivery & Salidas
        const origCatIcon = UI.categoryIcon.bind(UI);
        UI.categoryIcon = function (id) {
            if (id === "cat_lunch") {
                return '<span class="category-icon-shell tone-orange"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></span>';
            }
            if (id === "cat_dining") {
                return '<span class="category-icon-shell tone-crimson"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2Z"/><path d="M8.5 7.5a3.5 3.5 0 1 1 7 0"/></svg></span>';
            }
            return origCatIcon(id);
        };
    }

    const ALL_CAT_IDS = [
        "cat_market", "cat_lunch", "cat_dining", "cat_leisure",
        "cat_transport", "cat_clothes", "cat_health", "cat_bills",
        "cat_travel", "cat_beauty", "cat_other"
    ];

    // Actualizar voz y recibo de Finance para que reconozcan Almuerzo y Delivery & Salidas
    if (typeof Finance !== "undefined") {
        Finance.startSmartyExpenseVoice = async function () {
            const btn = document.getElementById("expense-smarty-btn");
            const original = btn ? btn.innerHTML : "";
            try {
                if (btn) { btn.disabled = true; btn.innerHTML = "🎙"; }
                UI.showSnackbar('🎙 Habla: ej. "gasté 25 en almuerzo" o "30 en heladería"');
                const transcript = await GroqAI.listenOnce();
                if (btn) btn.innerHTML = "⏳";

                const schema = {
                    type: "object",
                    properties: {
                        amount: { type: "number" },
                        desc: { type: "string" },
                        category: { type: "string", enum: ALL_CAT_IDS },
                        isInstallment: { type: "boolean" },
                        installmentCount: { type: "integer" }
                    },
                    required: ["amount", "desc", "category", "isInstallment", "installmentCount"],
                    additionalProperties: false
                };

                const lang = Data?.store?.settings?.lang || "es";
                const instructions = `Extract one personal expense from speech (${lang}).
Rules for categories:
- Use "cat_lunch" for lunch, almuerzo, almoço, daily work meal, marmita, menú del día.
- Use "cat_dining" for food delivery (iFood, Rappi, PedidosYa), restaurants, dinner out, burger, pizza, ice cream (heladería/sorveteria), coffee shops.
- Use "cat_leisure" for cinema, games, bars/clubs, concerts, hobbies.
- Use "cat_bills" ONLY for home/utility bills (electricity, water, internet, rent, home repairs).
Allowed categories: ${ALL_CAT_IDS.join(", ")}.`;

                const result = await GroqAI.textJSON(instructions, transcript, "smart_expense_v16", schema, { maxTokens: 500 });
                const amount = Number(result.amount);
                if (!Number.isFinite(amount) || amount <= 0) throw new Error("INVALID_SMART_EXPENSE");
                const category = ALL_CAT_IDS.includes(result.category) ? result.category : "cat_other";
                const desc = String(result.desc || "").trim() || "Gasto";
                const installmentCount = result.isInstallment ? Math.max(2, Number(result.installmentCount) || 2) : 1;

                this.openSmartExpenseModal(amount, desc, category, { fromSmarty: true, installmentCount, installmentsPaid: 0 });
            } catch (err) {
                const msg = GroqAI.friendlyError(err);
                if (msg) UI.showSnackbar(msg);
            } finally {
                if (btn) { btn.disabled = false; btn.innerHTML = original || "✨ Smarty"; }
            }
        };
    }

    // ---------------------------------------------------------
    // 3. SEPARAR 'HOGAR' (cat_bills) DE 'GASTOS FIJOS' (cat_subs) EN EL HISTORIAL
    // ---------------------------------------------------------
    if (typeof Finance !== "undefined") {
        // Añadir chip de filtro propio para Gastos Fijos separado de Hogar
        Finance.renderFilterChips = function () {
            let html = `<div class="filter-scroll-container">`;
            const allActive = this.selectedCategoryFilter === "ALL" ? "active" : "";
            html += `<div class="filter-chip ${allActive}" onclick="Finance.setCategoryFilter('ALL')">Todo</div>`;

            if (typeof UI !== "undefined" && UI.categories) {
                UI.categories.forEach(cat => {
                    const isActive = this.selectedCategoryFilter === cat.id ? "active" : "";
                    html += `<div class="filter-chip ${isActive}" onclick="Finance.setCategoryFilter('${cat.id}')">${UI.categoryIcon(cat.id)} ${UI.t(cat.id)}</div>`;
                });
            }
            const subsActive = this.selectedCategoryFilter === "cat_subs" ? "active" : "";
            html += `<div class="filter-chip ${subsActive}" onclick="Finance.setCategoryFilter('cat_subs')">${UI.categoryIcon("cat_subs")} ${UI.t("tab_subs")}</div>`;
            html += `</div>`;
            return html;
        };

        // Reescribir el filtrado en renderExpensesHistory para que Hogar NO incluya Gastos Fijos (sub)
        Finance.renderExpensesHistory = function () {
            const container = document.getElementById("expenses-history-list");
            if (!container) return;
            container.innerHTML = "";

            if (typeof this.injectFinanceSummaryBanner === "function") this.injectFinanceSummaryBanner();
            this.renderMonthSelector(container);

            // Botón PDF
            const pdfBtn = document.createElement("button");
            pdfBtn.id = "btn-export-pdf-month";
            pdfBtn.className = "btn-data";
            pdfBtn.style.cssText = "width:calc(100% - 32px); margin:0 16px 14px; padding:12px; flex-direction:row; font-size:13px;";
            pdfBtn.innerHTML = "📄 Exportar Resumen Detallado en PDF";
            pdfBtn.onclick = () => this.exportMonthlyPDF();
            container.appendChild(pdfBtn);

            this.renderCategoryChart(container);

            const filterContainer = document.createElement("div");
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
                    let extrasIcon = "";
                    if (e.photo) extrasIcon += " 📷";
                    if (e.link) extrasIcon += " 🔗";
                    allItems.push({
                        type: "expense", id: e.id, date: date, amount: e.amount,
                        name: e.desc + extrasIcon, rawCat: e.category,
                        icon: this.getCategoryIcon(e.category)
                    });
                }
            });

            (Data.store.lists || []).filter(l => l.status === "completed").forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    allItems.push({
                        type: "list", id: l.id, date: l.date, amount: l.total,
                        name: l.name, rawCat: "cat_market", icon: UI.categoryIcon("cat_market")
                    });
                }
            });

            const daysInM = new Date(selYear, selMonth, 0).getDate();
            (Data.store.subscriptions || []).forEach(s => {
                if (s.day <= daysInM) {
                    allItems.push({
                        type: "sub", id: s.id, date: new Date(selYear, selMonth - 1, s.day).getTime(),
                        amount: s.cost, name: s.name, rawCat: "cat_subs",
                        icon: window.getSmartBrandBadge ? window.getSmartBrandBadge(s.name) : UI.categoryIcon("cat_subs")
                    });
                }
            });

            // FILTRO ESTRICTO: 'cat_bills' (Hogar) SOLO muestra gastos de Hogar, NUNCA Gastos Fijos ('sub')
            if (this.selectedCategoryFilter !== "ALL") {
                allItems = allItems.filter(item => {
                    const filter = this.selectedCategoryFilter;
                    const itemName = UI.t(filter);
                    if (item.type === "list") return filter === "cat_market";
                    if (item.type === "sub") return filter === "cat_subs";
                    return item.rawCat === filter || item.rawCat === itemName;
                });
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
    // 4. EDITAR LA CATEGORIA DE GASTOS PREVIOS CON 1 SOLO TOQUE DESDE EL DETALLE
    // ---------------------------------------------------------
    if (typeof Finance !== "undefined") {
        Finance.quickChangeExpenseCategory = function (expenseId, newCatId) {
            const exp = (Data.store.expenses || []).find(e => e.id === expenseId);
            if (!exp) return;
            const newCatLabel = UI.t(newCatId);
            exp.category = newCatLabel;
            Data.save();

            // Actualizar visualmente el modal de detalle
            const detCat = document.getElementById("det-exp-cat");
            if (detCat) detCat.innerHTML = `${this.getCategoryIcon(newCatId)} ${newCatLabel}`;

            document.querySelectorAll("#det-quick-cat-box .quick-cat-pill").forEach(pill => {
                pill.classList.toggle("active-cat", pill.dataset.id === newCatId);
            });

            UI.renderBudgetChart();
            this.renderHomeWidgets();
            this.renderExpensesHistory();
            UI.showSnackbar(`Categoría cambiada a ${newCatLabel} ✅`);
        };

        Finance.openExpenseDetail = function (id) {
            const expense = (Data.store.expenses || []).find(e => e.id === id);
            if (!expense) return;

            document.getElementById("det-exp-desc").innerText = expense.desc;
            document.getElementById("det-exp-amount").innerText = UI.formatMoney(expense.amount);
            document.getElementById("det-exp-date").innerText = new Date(expense.date).toLocaleString();

            const catName = expense.category || UI.t("cat_other");
            const icon = this.getCategoryIcon(catName);
            const detCatEl = document.getElementById("det-exp-cat");
            detCatEl.innerHTML = `${icon} ${catName}`;

            // Inyectar selector rápido de categorías para cambiar la categoría de gastos previos con 1 toque
            let quickBox = document.getElementById("det-quick-cat-box");
            if (!quickBox) {
                quickBox = document.createElement("div");
                quickBox.id = "det-quick-cat-box";
                quickBox.className = "quick-cat-switcher";
                detCatEl.parentElement.appendChild(quickBox);
            }
            quickBox.innerHTML = `<div style="width:100%; font-size:10px; font-weight:800; color:var(--text-sec); text-transform:uppercase; margin-bottom:4px;">Cambiar Categoría Rápido:</div>`;
            (UI.categories || []).forEach(cat => {
                const label = UI.t(cat.id);
                const isCurrent = expense.category === cat.id || expense.category === label;
                const pill = document.createElement("div");
                pill.className = `quick-cat-pill ${isCurrent ? "active-cat" : ""}`;
                pill.dataset.id = cat.id;
                pill.innerHTML = `${UI.categoryIcon(cat.id)} <span>${label}</span>`;
                pill.onclick = () => Finance.quickChangeExpenseCategory(id, cat.id);
                quickBox.appendChild(pill);
            });

            const imgContainer = document.getElementById("det-exp-photo-container");
            const img = document.getElementById("det-exp-img");
            if (expense.photo) {
                img.src = expense.photo;
                imgContainer.classList.remove("hidden");
            } else {
                imgContainer.classList.add("hidden");
                img.src = "";
            }

            const linkBtn = document.getElementById("det-exp-link-btn");
            if (expense.link) {
                let url = expense.link;
                if (!url.startsWith("http")) url = "https://" + url;
                linkBtn.href = url;
                linkBtn.classList.remove("hidden");
                linkBtn.querySelector("span").innerText = url.includes(".") ? "🔗 Ir al enlace" : `📍 ${expense.link}`;
            } else {
                linkBtn.classList.add("hidden");
            }

            const delBtn = document.getElementById("det-exp-delete-btn");
            if (delBtn && !document.getElementById("det-exp-edit-btn")) {
                const editBtn = document.createElement("button");
                editBtn.id = "det-exp-edit-btn";
                editBtn.className = "btn-full";
                editBtn.style.marginBottom = "10px";
                editBtn.innerHTML = "✏️ Editar Gasto Completo";
                delBtn.parentNode.insertBefore(editBtn, delBtn);
            }
            const eb = document.getElementById("det-exp-edit-btn");
            if (eb) eb.onclick = () => Finance.editExistingExpense(id);

            delBtn.onclick = () => {
                this.deleteExpense(id);
                Main.closeModal("expense-detail");
            };

            document.getElementById("modal-expense-detail").classList.add("open");
        };
    }

    // ---------------------------------------------------------
    // 5. PREGUNTAR A SMARTY AI POR VOZ EN EL CHAT
    // ---------------------------------------------------------
    function injectSmartyChatVoiceButton() {
        const chatInput = document.getElementById("smarty-chat-input");
        if (!chatInput || document.getElementById("smarty-chat-mic-btn")) return;

        const micBtn = document.createElement("button");
        micBtn.id = "smarty-chat-mic-btn";
        micBtn.className = "icon-btn";
        micBtn.title = "Preguntar por voz a Smarty";
        micBtn.style.cssText = "width:44px; height:44px; border-radius:50%; flex-shrink:0; background:var(--input-bg); color:var(--primary);";
        micBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;

        micBtn.onclick = async () => {
            try {
                micBtn.classList.add("listening");
                UI.showSnackbar("🎙️ Escuchando tu pregunta para Smarty...");
                const question = await GroqAI.listenOnce();
                micBtn.classList.remove("listening");
                if (question && question.trim()) {
                    chatInput.value = question.trim();
                    Assistant.sendSmartyMessage();
                }
            } catch (err) {
                micBtn.classList.remove("listening");
                const msg = GroqAI.friendlyError(err);
                if (msg) UI.showSnackbar(msg);
            }
        };

        chatInput.parentNode.insertBefore(micBtn, chatInput.nextSibling);
    }

    // Actualizar también el clasificador bancario con Almuerzo y Delivery & Salidas
    if (window.NativeBridge) {
        const origBank = window.NativeBridge.processBankNotification.bind(window.NativeBridge);
        window.NativeBridge.processBankNotification = async function (notif) {
            const text = `${notif.title || ""} ${notif.text || ""}`.toLowerCase();
            if (/(ifood|rappi|pedidosya|heladeria|sorveteria|helado|sorvete|restaurante|pizzaria|pizzeria|burger|mcdonald|bk|sushi|cafeteria|starbucks)/.test(text)) {
                notif._forcedCat = "cat_dining";
            } else if (/(almuerzo|almoco|almoço|marmita|restaurante ejecutivo)/.test(text)) {
                notif._forcedCat = "cat_lunch";
            }
            return await origBank(notif);
        };
    }

    injectSmartyChatVoiceButton();
    if (typeof UI !== "undefined") {
        UI.refreshDOM();
    }
})();