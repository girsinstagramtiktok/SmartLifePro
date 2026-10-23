/* =========================================
   SMART LIFE PRO - UI MANAGER (V11.0 - ANDROID BANK & NOTIFICATIONS UI)
   Autor: A_True_Alpha
   ========================================= */

const UI = {
    dictionary: {
        es: {
            app_name: "Smarty", back: "Volver", delete: "Borrar", confirm: "Confirmar", cancel: "Cancelar", save: "Guardar", update: "Actualizar",
            month_names: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            app_slogan: "Inteligencia para tus finanzas", profile_title: "Cuartel General",
            budget_label: "Presupuesto", spent_label: "Gastado", remaining_label: "Restante",
            recent_expenses_title: "Gastos Recientes", top_categories_title: "Top Categorías Mes",
            touch_budget: "Toca para definir presupuesto ✍️", greeting: "Hola Master, ¿todo bien?",
            title_lists: "Mis Listas", title_history: "Historial Compras", title_finance: "Finanzas", title_settings: "Ajustes",
            menu_exp_title: "Registrar Gasto", menu_exp_desc: "Pagos individuales", menu_list_title: "Nueva Lista", menu_list_desc: "Organizar compra",
            tab_subs: "Suscrip.", tab_inst: "Parcelas", tab_hist: "Historial",
            btn_add_sub: "+ Nueva Suscripción", empty_subs: "Sin suscripciones activas.", sub_charge_day: "Cobra el día",
            empty_inst: "No hay cuotas pendientes.", inst_current: "Cuota actual:",
            btn_finish: "Finalizar Compra ✅", swipe_delete: "Desliza para borrar 🗑️",
            empty_lists_home: "Todo al día.", empty_lists_view: "No hay listas activas.<br>Toca + para crear una.",
            empty_month_shopping: "Sin compras este mes.", archive_btn: "Ver Listas Anteriores",
            empty_summary_chart: "Sin datos este mes", section_top_prod: "Top Productos", empty_top_prod: "Nada comprado este mes.",
            price_evol: "Evolución de Precio", current_price_reg: "Precio actual registrado",
            mod_exp_title: "Registrar Gasto", mod_sub_title: "Nueva Suscripción", mod_bud_title: "Presupuesto Mensual",
            import_title: "Importar Lista", receipt_est: "TOTAL ESTIMADO", receipt_real: "TOTAL REAL",
            ph_amount: "0.00", ph_desc: "¿En qué gastaste?", ph_sub_name: "Nombre (Ej: Netflix)", ph_sub_day: "Día de cobro (1-31)",
            import_ph: "Ej: - Pan\n- Leche...", ph_cuotas: "Cuotas", ph_paid: "Pagadas", shop_placeholder: "¿Qué compramos?", ph_unit_price: "Unitario",
            lbl_is_inst: "¿Es Parcelado?", cart_label: "Carrito",
            msg_saved: "Guardado correctamente", msg_deleted: "Elemento eliminado", msg_updated: "Actualizado", msg_invalid_amount: "Ingresa un monto válido",
            msg_list_saved: "Lista finalizada y guardada", msg_bio_inactive: "Bloqueo desactivado 🔓",
            import_success_title: "¡Éxito!", import_success_msg: "Datos importados correctamente.",
            cat_market: "Supermercado", cat_leisure: "Ocio", cat_transport: "Transporte", cat_clothes: "Ropa", cat_health: "Salud", cat_bills: "Hogar", cat_travel: "Viaje", cat_beauty: "Belleza", cat_other: "Otros",
            cat_distribution: "Distribución de Gastos",
            sec_general: "General", sec_app: "Aplicación", sec_data: "Datos y Seguridad",
            lang_label: "Idioma", curr_label: "Moneda", theme_label: "Tema Visual", dark_mode: "Modo Oscuro", bio_lock: "Bloqueo con PIN",
            btn_backup: "Crear Copia", btn_restore: "Restaurar Copia", btn_reset: "Borrar Todo",
            reset_confirm: "¿Borrar TODOS los datos?", confirm_title: "Confirmar", confirm_text: "¿Estás seguro?", confirm_desc: "Esta acción no se puede deshacer.",
            confirm_del_list: "¿Borrar esta lista?", confirm_del_prod: "¿Borrar este producto?", confirm_del_exp: "¿Borrar este gasto?", pin_forgot: "Olvidé mi PIN"
        },
        pt: {
            app_name: "Smarty", back: "Voltar", delete: "Apagar", confirm: "Confirmar", cancel: "Cancelar", save: "Salvar", update: "Atualizar",
            month_names: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            app_slogan: "Inteligência para suas finanças", profile_title: "Quartel General",
            budget_label: "Orçamento", spent_label: "Gasto", remaining_label: "Restante",
            recent_expenses_title: "Despesas Recentes", top_categories_title: "Top Categorias",
            touch_budget: "Toque para definir orçamento ✍️", greeting: "Olá Master, tudo bem?",
            title_lists: "Minhas Listas", title_history: "Histórico Compras", title_finance: "Finanças", title_settings: "Ajustes",
            menu_exp_title: "Registrar Gasto", menu_exp_desc: "Pagamentos individuais", menu_list_title: "Nova Lista", menu_list_desc: "Organizar compras",
            tab_subs: "Assinaturas", tab_inst: "Parcelas", tab_hist: "Histórico",
            btn_add_sub: "+ Nova Assinatura", empty_subs: "Sem assinaturas ativas.", sub_charge_day: "Cobrança dia",
            empty_inst: "Sem parcelas pendentes.", inst_current: "Parcela atual:",
            btn_finish: "Finalizar Compra ✅", swipe_delete: "Deslize para apagar 🗑️",
            empty_lists_home: "Tudo em dia.", empty_lists_view: "Sem listas ativas.<br>Toque em + para criar uma.",
            empty_month_shopping: "Sem compras este mês.", archive_btn: "Ver Listas Anteriores",
            empty_summary_chart: "Sem dados este mês", section_top_prod: "Top Produtos", empty_top_prod: "Nada comprado este mês.",
            price_evol: "Evolução de Preço", current_price_reg: "Preço atual registrado",
            mod_exp_title: "Registrar Gasto", mod_sub_title: "Nova Assinatura", mod_bud_title: "Orçamento Mensal",
            import_title: "Importar Lista", receipt_est: "TOTAL ESTIMADO", receipt_real: "TOTAL REAL",
            ph_amount: "0.00", ph_desc: "Com o que gastou?", ph_sub_name: "Nome (Ex: Netflix)", ph_sub_day: "Dia cobrança (1-31)",
            import_ph: "Ex: - Pão\n- Leite...", ph_cuotas: "Parcelas", ph_paid: "Pagas", shop_placeholder: "O que vamos comprar?", ph_unit_price: "Unitário",
            lbl_is_inst: "É Parcelado?", cart_label: "Carrinho",
            msg_saved: "Salvo com sucesso", msg_deleted: "Item apagado", msg_updated: "Atualizado", msg_invalid_amount: "Valor inválido",
            msg_list_saved: "Compra salva", msg_bio_inactive: "Bloqueio Desativado 🔓",
            import_success_title: "Sucesso!", import_success_msg: "Dados importados corretamente.",
            cat_market: "Mercado", cat_leisure: "Lazer", cat_transport: "Transporte", cat_clothes: "Roupa", cat_health: "Saúde", cat_bills: "Casa", cat_travel: "Viagem", cat_beauty: "Beleza", cat_other: "Outro",
            cat_distribution: "Distribuição de Despesas",
            sec_general: "Geral", sec_app: "Aplicação", sec_data: "Dados e Segurança",
            lang_label: "Idioma", curr_label: "Moeda", theme_label: "Tema Visual", dark_mode: "Modo Escuro", bio_lock: "Bloqueio com PIN",
            btn_backup: "Criar Backup", btn_restore: "Restaurar Backup", btn_reset: "Apagar Tudo",
            reset_confirm: "Apagar TODOS os dados?", confirm_title: "Confirmar", confirm_text: "Tem certeza?", confirm_desc: "Esta ação não pode ser desfeita.",
            confirm_del_list: "Apagar esta lista?", confirm_del_prod: "Apagar este produto?", confirm_del_exp: "Apagar este gasto?", pin_forgot: "Esqueci meu PIN"
        },
        en: {
            app_name: "Smarty", back: "Back", delete: "Delete", confirm: "Confirm", cancel: "Cancel", save: "Save", update: "Update",
            month_names: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            app_slogan: "Intelligence for your finances", profile_title: "Headquarters",
            budget_label: "Budget", spent_label: "Spent", remaining_label: "Remaining",
            recent_expenses_title: "Recent Expenses", top_categories_title: "Top Categories",
            touch_budget: "Tap to set budget ✍️", greeting: "Hello Master, all good?",
            title_lists: "My Lists", title_history: "Shopping History", title_finance: "Finance", title_settings: "Settings",
            menu_exp_title: "Add Expense", menu_exp_desc: "Individual payments", menu_list_title: "New List", menu_list_desc: "Organize shopping",
            tab_subs: "Subs.", tab_inst: "Installm.", tab_hist: "History",
            btn_add_sub: "+ New Subscription", empty_subs: "No active subscriptions.", sub_charge_day: "Charges on day",
            empty_inst: "No pending installments.", inst_current: "Current:",
            btn_finish: "Finish Shopping ✅", swipe_delete: "Swipe to delete 🗑️",
            empty_lists_home: "All caught up.", empty_lists_view: "No active lists.<br>Tap + to create one.",
            empty_month_shopping: "No purchases this month.", archive_btn: "View Previous Lists",
            empty_summary_chart: "No data this month", section_top_prod: "Top Products", empty_top_prod: "Nothing bought this month.",
            price_evol: "Price Evolution", current_price_reg: "Current registered price",
            mod_exp_title: "Add Expense", mod_sub_title: "New Subscription", mod_bud_title: "Monthly Budget",
            import_title: "Import List", receipt_est: "ESTIMATED TOTAL", receipt_real: "REAL TOTAL",
            ph_amount: "0.00", ph_desc: "What did you buy?", ph_sub_name: "Name (Ex: Netflix)", ph_sub_day: "Day (1-31)",
            import_ph: "Ex: - Bread\n- Milk...", ph_cuotas: "Installments", ph_paid: "Paid", shop_placeholder: "What to buy?", ph_unit_price: "Unit Price",
            lbl_is_inst: "Is Installment?", cart_label: "Cart",
            msg_saved: "Saved successfully", msg_deleted: "Deleted", msg_updated: "Updated", msg_invalid_amount: "Invalid amount",
            msg_list_saved: "Shopping saved", msg_bio_inactive: "Lock Disabled 🔓",
            import_success_title: "Success!", import_success_msg: "Data imported successfully.",
            cat_market: "Groceries", cat_leisure: "Leisure", cat_transport: "Transport", cat_clothes: "Clothes", cat_health: "Health", cat_bills: "Bills", cat_travel: "Travel", cat_beauty: "Beauty", cat_other: "Other",
            cat_distribution: "Expense Distribution",
            sec_general: "General", sec_app: "Application", sec_data: "Data & Security",
            lang_label: "Language", curr_label: "Currency", theme_label: "Visual Theme", dark_mode: "Dark Mode", bio_lock: "PIN Lock",
            btn_backup: "Create Backup", btn_restore: "Restore Backup", btn_reset: "Reset All",
            reset_confirm: "Erase ALL data?", confirm_title: "Confirm", confirm_text: "Are you sure?", confirm_desc: "This action cannot be undone.",
            confirm_del_list: "Delete this list?", confirm_del_prod: "Delete this item?", confirm_del_exp: "Delete this expense?", pin_forgot: "Forgot PIN"
        }
    },

    categoryIcon(id) {
        const icons = {
            cat_market: '<path d="M3 3h2l2.2 11.3a2 2 0 0 0 2 1.7h8.3a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
            cat_leisure: '<path d="M3 3v5a3 3 0 0 0 6 0V3M6 3v18M16 3v7a3 3 0 0 0 3 3V3M19 13v8"/>',
            cat_transport: '<path d="M5 16V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11M5 10h14M8 20h.01M16 20h.01M5 16h14l2 4H3z"/>',
            cat_clothes: '<path d="m8 5 4-2 4 2 5 3-3 4-3-2v11H9V10l-3 2-3-4z"/>',
            cat_health: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/><path d="M3 12h5l2-3 3.5 6 2-3H21"/>',
            cat_bills: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z"/>',
            cat_travel: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
            cat_beauty: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2z"/>',
            cat_other: '<path d="m12 3 9 5v8l-9 5-9-5V8z"/>',
            cat_subs: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>'
        };
        const colors = { cat_market:'mint', cat_leisure:'coral', cat_transport:'sky', cat_clothes:'violet', cat_health:'rose', cat_bills:'amber', cat_travel:'blue', cat_beauty:'pink', cat_other:'slate', cat_subs:'sky' };
        return '<span class="category-icon-shell tone-' + (colors[id] || 'slate') + '"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (icons[id] || icons.cat_other) + '</svg></span>';
    },

    categories: [
        { id: 'cat_market' }, { id: 'cat_leisure' }, { id: 'cat_transport' },
        { id: 'cat_clothes' }, { id: 'cat_health' }, { id: 'cat_bills' },
        { id: 'cat_travel' }, { id: 'cat_beauty' }, { id: 'cat_other' }
    ],

    t(key) {
        const lang = Data?.store?.settings?.lang || 'es';
        const dict = this.dictionary[lang] || this.dictionary['es'];
        return dict[key] || key;
    },

    getMonthName(monthIndex) {
        const lang = Data?.store?.settings?.lang || 'es';
        const dict = this.dictionary[lang] || this.dictionary['es'];
        return dict.month_names ? dict.month_names[monthIndex] : "Mes";
    },

    formatMoney(amount) {
        const currency = Data?.store?.settings?.currency || '$';
        return currency + parseFloat(amount || 0).toFixed(2);
    },

    refreshDOM() {
        const lang = Data?.store?.settings?.lang || 'es';
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.innerHTML = this.t(key);
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (key) el.placeholder = this.t(key);
        });

        document.body.classList.toggle('dark-mode', !!(Data?.store?.settings?.darkMode));

        this.renderCategoryChips();
        this.renderBudgetChart();
        if (typeof Finance !== 'undefined') Finance.renderHomeWidgets();
        if (typeof Shopping !== 'undefined') Shopping.renderMiniLists();
        this.renderSettingsView();
        if (typeof Assistant !== 'undefined') {
            Assistant.updateMood();
            Assistant.updateHomeXP();
        }
    },

    renderBudgetChart() {
        const limit = parseFloat(Data?.store?.budget?.limit || 0);
        const spent = typeof Finance !== 'undefined' ? Finance.calculateMonthlySpent() : 0;
        const remaining = limit - spent;
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        const visualPercent = Math.min(percent, 100);

        const circle = document.getElementById('budget-circle');
        const remainText = document.getElementById('budget-remaining');
        const limitText = document.getElementById('budget-limit');
        const spentText = document.getElementById('budget-spent');

        if (circle) {
            circle.setAttribute('stroke-dasharray', `${visualPercent}, 100`);
            const color = percent > 100 ? 'var(--danger)' : (percent > 85 ? 'var(--warning)' : 'var(--success)');
            circle.style.stroke = color;
            if (remainText) remainText.style.color = color;
        }

        if (remainText) remainText.innerText = this.formatMoney(remaining);
        if (limitText) limitText.innerText = this.formatMoney(limit);
        if (spentText) spentText.innerText = this.formatMoney(spent);

        const touchTxt = document.getElementById('touch-budget-txt');
        if (touchTxt) {
            touchTxt.innerText = limit <= 0 ? this.t('touch_budget') : `${Math.round(percent)}% ${this.t('spent_label')}`;
        }
    },

    renderCategoryChips() {
        const container = document.getElementById('cat-chips');
        if (!container) return;
        container.className = 'quick-chips';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.innerHTML = '';

        this.categories.forEach(cat => {
            const chip = document.createElement('div');
            chip.className = 'chip cat-chip';
            chip.innerHTML = `${this.categoryIcon(cat.id)}<span>${this.t(cat.id)}</span>`;
            chip.dataset.id = cat.id;
            chip.onclick = () => {
                document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
            };
            container.appendChild(chip);
        });
    },

    renderSettingsView() {
        const container = document.getElementById('settings-inject');
        if (!container || typeof Data === 'undefined') return;

        const s = Data.store.settings;
        const hasPin = !!(s.pin);
        const storage = Data.getStorageUsage();
        const barColor = storage.status === 'good' ? 'var(--success)' : (storage.status === 'warning' ? 'var(--warning)' : 'var(--danger)');
        const groqUsageHTML = typeof GroqAI !== 'undefined' ? GroqAI.getUsageCardHTML() : '';

        container.innerHTML = `
            <div style="margin-bottom:20px;">
                <div class="section-label" style="margin-top:0;">${this.t('sec_general')}</div>
                <div class="lang-grid">
                    <div class="lang-btn-opt ${s.lang === 'es' ? 'selected' : ''}" onclick="UI.changeLang('es')"><div class="flag-icon flag-es"></div><span>Español</span></div>
                    <div class="lang-btn-opt ${s.lang === 'en' ? 'selected' : ''}" onclick="UI.changeLang('en')"><div class="flag-icon flag-en"></div><span>English</span></div>
                    <div class="lang-btn-opt ${s.lang === 'pt' ? 'selected' : ''}" onclick="UI.changeLang('pt')"><div class="flag-icon flag-pt"></div><span>Português</span></div>
                </div>
                <div class="setting-item" onclick="UI.openCurrencyModal()" style="margin-top:12px; cursor:pointer;">
                    <span>${this.t('curr_label')}</span>
                    <span style="font-weight:800; color:var(--primary);">${s.currency || '$'} ➔</span>
                </div>
            </div>

            <div style="margin-bottom:20px;">
                <div class="section-label">${this.t('sec_app')}</div>
                <div class="theme-selector-grid">
                    <div class="theme-btn t-blue ${s.theme === 'blue' ? 'active' : ''}" onclick="UI.changeTheme('blue')"></div>
                    <div class="theme-btn t-pink ${s.theme === 'pink' ? 'active' : ''}" onclick="UI.changeTheme('pink')"></div>
                    <div class="theme-btn t-green ${s.theme === 'green' ? 'active' : ''}" onclick="UI.changeTheme('green')"></div>
                    <div class="theme-btn t-orange ${s.theme === 'orange' ? 'active' : ''}" onclick="UI.changeTheme('orange')"></div>
                    <div class="theme-btn t-red ${s.theme === 'red' ? 'active' : ''}" onclick="UI.changeTheme('red')"></div>
                    <div class="theme-btn t-purple ${s.theme === 'purple' ? 'active' : ''}" onclick="UI.changeTheme('purple')"></div>
                </div>
                <div class="setting-item" style="margin-top:10px;">
                    <span>${this.t('dark_mode')}</span>
                    <label class="switch-wrap">
                        <input type="checkbox" id="dark-mode-toggle" ${s.darkMode ? 'checked' : ''} onchange="UI.toggleDarkMode()">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div style="margin-bottom:20px;">
                <div class="section-label">ANDROID NATIVO & BANCOS AUTOMÁTICOS</div>
                <div class="glass-card" style="padding:15px; margin:0;">
                    <div class="setting-item">
                        <span>🔔 Alertas de Suscripciones (24h antes)</span>
                        <label class="switch-wrap">
                            <input type="checkbox" ${s.subNotifications !== false ? 'checked' : ''} onchange="Data.store.settings.subNotifications = this.checked; Data.save(); if(window.NativeBridge) NativeBridge.scheduleSubscriptionReminders();">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <span>🏦 Auto-Detectar Notificaciones Bancarias</span>
                        <label class="switch-wrap">
                            <input type="checkbox" ${s.bankAutoDetect ? 'checked' : ''} onchange="Data.store.settings.bankAutoDetect = this.checked; Data.save();">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <span>Modo de Registro Bancario</span>
                        <select class="setting-select" style="width:auto; margin:0; padding:6px 10px; font-size:12px;" onchange="Data.store.settings.bankAutoSaveMode = this.value; Data.save();">
                            <option value="confirm" ${s.bankAutoSaveMode !== 'auto' ? 'selected' : ''}>Confirmar antes</option>
                            <option value="auto" ${s.bankAutoSaveMode === 'auto' ? 'selected' : ''}>Guardar 100% solo</option>
                        </select>
                    </div>
                    <button class="btn-full" style="margin-top:12px; padding:12px; font-size:13px;" onclick="if(window.NativeBridge) NativeBridge.simulateBankNotification()">⚡ Simular Pago Bancario Ahora</button>
                </div>
            </div>

            <div style="margin-bottom:20px;">
                <div class="section-label">SMARTY AI</div>
                <div id="groq-usage-card">${groqUsageHTML}</div>
            </div>

            <div style="margin-bottom:20px;">
                <div class="section-label">${this.t('sec_data')}</div>
                <div class="setting-item">
                    <span>${this.t('bio_lock')}</span>
                    <label class="switch-wrap">
                        <input type="checkbox" id="pin-toggle" ${hasPin ? 'checked' : ''} onchange="Main.togglePinLock()">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="btn-data-row" style="margin-top:12px;">
                    <button class="btn-data" onclick="Main.downloadBackup()"><span>⬇️ ${this.t('btn_backup')}</span></button>
                    <div class="btn-data" style="position:relative;">
                        <span>⬆️ ${this.t('btn_restore')}</span>
                        <input type="file" style="position:absolute; inset:0; opacity:0; cursor:pointer;" onchange="Main.handleImport(this)">
                    </div>
                </div>
                <button class="btn-danger-outline" onclick="Main.factoryReset()">🗑️ ${this.t('btn_reset')}</button>
            </div>

            <div class="glass-card" style="padding:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px; font-weight:700;">
                    <span>Almacenamiento (${storage.usedKB} KB)</span>
                    <span style="color:${barColor}">${storage.percent}%</span>
                </div>
                <div style="background:rgba(100,116,139,0.15); height:7px; border-radius:99px; overflow:hidden;">
                    <div style="width:${storage.percent}%; background:${barColor}; height:100%;"></div>
                </div>
            </div>
        `;
    },

    changeLang(lang) { Data.store.settings.lang = lang; Data.save(); this.refreshDOM(); },
    changeTheme(theme) { Data.store.settings.theme = theme; Data.save(); Main.applyThemeToBody(theme); this.renderSettingsView(); },
    changeFont(fontName) {
        const fontMap = { 'Modern': "'Manrope', sans-serif", 'Classic': "'Lora', serif", 'Tech': "'Roboto Mono', monospace", 'Soft': "'Comfortaa', cursive" };
        const valid = fontMap[fontName] ? fontName : 'Modern';
        Data.store.settings.font = valid;
        Data.save();
        document.documentElement.style.setProperty('--font-main', fontMap[valid]);
    },
    toggleDarkMode() {
        Data.store.settings.darkMode = document.getElementById('dark-mode-toggle').checked;
        Data.save();
        this.refreshDOM();
    },

    confirm(titleKey, textKey) {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-confirm');
            document.getElementById('confirm-title').innerText = this.t(titleKey);
            document.getElementById('confirm-text').innerText = this.t(textKey);
            const btnOk = document.getElementById('confirm-ok');
            const btnCancel = document.getElementById('confirm-cancel');
            const close = (res) => { modal.classList.remove('open'); resolve(res); };
            btnOk.onclick = () => close(true);
            btnCancel.onclick = () => close(false);
            modal.classList.add('open');
        });
    },

    showSnackbar(message) {
        const sb = document.getElementById("snackbar");
        if (!sb) return;
        sb.innerHTML = message;
        sb.className = "show";
        if (this.snackbarTimer) clearTimeout(this.snackbarTimer);
        this.snackbarTimer = setTimeout(() => { sb.className = ""; }, 3000);
    },

    toggleGuide() {
        this.showSnackbar("Mantén presionado + para hablar con Smarty AI 🎙");
    },

    openCurrencyModal() {
        const currencies = [
            { code: 'BRL', symbol: 'R$', name: 'Real', flag: '🇧🇷' },
            { code: 'USD', symbol: '$', name: 'Dólar', flag: '🇺🇸' },
            { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
            { code: 'CUP', symbol: 'Cup.', name: 'Peso Cub', flag: '🇨🇺' },
            { code: 'ARS', symbol: '$', name: 'Peso Arg', flag: '🇦🇷' },
            { code: 'MXN', symbol: '$', name: 'Peso Mex', flag: '🇲🇽' }
        ];
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay open';
        overlay.style.zIndex = '11000';
        overlay.innerHTML = `
            <div class="settings-card" onclick="event.stopPropagation()">
                <h3 style="margin-top:0;">Moneda</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    ${currencies.map(c => `<button class="btn-data" onclick="UI.setAppCurrency('${c.code}','${c.symbol}'); this.closest('.modal-overlay').remove();">${c.flag} ${c.code} (${c.symbol})</button>`).join('')}
                </div>
            </div>
        `;
        overlay.onclick = () => overlay.remove();
        document.body.appendChild(overlay);
    },

    setAppCurrency(code, symbol) {
        Data.store.settings.currencyCode = code;
        Data.store.settings.currency = symbol;
        if (Data.store.budget) Data.store.budget.currency = symbol;
        Data.save();
        this.refreshDOM();
    }
};