/* =========================================
   SMART LIFE PRO - UI MANAGER (V8.3 - PIN FIX FINAL)
   Autor: A_True_Alpha
   ========================================= */

const UI = {
    // --- DICCIONARIO DE IDIOMAS COMPLETO ---
    dictionary: {
        es: {
            app_name: "Smarty",
            back: "Volver",
            delete: "Borrar",
            confirm: "Confirmar",
            cancel: "Cancelar",
            save: "Guardar",
            update: "Actualizar",
            month_names: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            
            app_slogan: "Inteligencia para tus finanzas", // Nuevo Slogan
            profile_title: "Cuartel General",
            analysis_title: "Análisis de Smarty",
            quests_title: "Misiones del Día",
            badges_title: "Medallas Obtenidas",
            no_badges: "Aún no tienes medallas.",
            
          // HOME & BUDGET
            budget_label: "Presupuesto",
            spent_label: "Gastado",
            remaining_label: "Restante",
            active_lists_title: "Listas Activas",
            recent_expenses_title: "Gastos Recientes",
            top_categories_title: "Top Categorías Mes",
            see_all: "Ver todas",
            touch_budget: "Toca para definir presupuesto \u270D\uFE0F",
            greeting: "Hola Master, \u00BFtodo bien?",
            
            // TITULOS VISTAS
            title_lists: "Mis Listas",
            title_history: "Historial Compras",
            title_finance: "Finanzas",
            title_settings: "Ajustes",
            
            // MENÚ DE ACCIÓN (+)
            menu_action_title: "Crear Nuevo",
            menu_exp_title: "Registrar Gasto",
            menu_exp_desc: "Pagos individuales",
            menu_list_title: "Nueva Lista",
            menu_list_desc: "Organizar compra",
            
            // TABS FINANZAS
            tab_subs: "Suscrip.",
            tab_inst: "Parcelas",
            tab_hist: "Historial",
            
            // FINANCE CARDS
            btn_add_sub: "+ Nueva Suscripci\u00F3n",
            empty_subs: "Sin suscripciones activas.",
            sub_charge_day: "Cobra el d\u00EDa",
            empty_inst: "No hay cuotas pendientes.",
            inst_current: "Cuota actual:",
            inst_total_lbl: "Total:",
            inst_remaining_m: "Faltan meses",
            total_history_label: "Gasto Total Registrado",
            total_month_label: "Total",
            empty_history_month: "Sin movimientos en este periodo.",
            
            // SHOPPING
            btn_finish: "Finalizar Compra \u2705",
            swipe_delete: "Desliza para borrar \uD83D\uDDD1\uFE0F",
            empty_lists_home: "Todo al d\u00EDa.",
            empty_lists_view: "No hay listas activas.<br>Toca + para crear una.",
            empty_shopping_history: "Sin historial.",
            empty_month_shopping: "Sin compras este mes.",
            archive_btn: "Ver Listas Anteriores",
            empty_summary_chart: "Sin datos este mes",
            section_top_prod: "Top Productos",
            empty_top_prod: "Nada comprado este mes.",
            ranked: "Ranked",
            price_evol: "Evoluci\u00F3n de Precio",
            current_price_reg: "Precio actual registrado",
            
            // MODALES
            mod_exp_title: "Registrar Gasto",
            mod_sub_title: "Nueva Suscripci\u00F3n",
            mod_bud_title: "Presupuesto Mensual",
            import_title: "Importar Lista",
            detail_title: "Detalle Compra",
            receipt_est: "TOTAL ESTIMADO",
            receipt_real: "TOTAL REAL",
            
            // PLACEHOLDERS
            ph_amount: "0.00",
            ph_desc: "\u00BFEn qu\u00E9 gastaste?",
            ph_sub_name: "Nombre (Ej: Netflix)",
            ph_sub_day: "D\u00EDa de cobro (1-31)",
            import_ph: "Ej: - Pan\n- Leite...",
            ph_cuotas: "Cuotas",
            ph_paid: "Pagadas",
            shop_placeholder: "\u00BFQu\u00E9 compramos?",
            ph_unit_price: "Unitario",
            
            // LABELS
            lbl_is_inst: "\u00BFEs Parcelado?",
            cart_label: "Carrito",
            
            // MENSAJES
            msg_saved: "Guardado correctamente",
            msg_deleted: "Elemento eliminado",
            msg_updated: "Actualizado",
            msg_invalid_amount: "Ingresa un monto v\u00E1lido",
            msg_list_saved: "Lista finalizada y guardada",
            msg_auth_success: "Verificado \u2705",
            msg_auth_fail: "No verificado \u274C",
            msg_bio_active: "PIN activado \uD83D\uDD12", // <--- CORREGIDO
            msg_bio_inactive: "Bloqueo desactivado \uD83D\uDD13",
            msg_no_bio_support: "Dispositivo no soporta seguridad",
            import_success_title: "\u00A1\u00C9xito!",
            import_success_msg: "Datos importados correctamente.",
            
            // CATEGORÍAS (ID MAP)
            cat_market: "Supermercado", 
            cat_leisure: "Ocio",
            cat_transport: "Transporte",
            cat_clothes: "Ropa",
            cat_health: "Salud",
            cat_bills: "Hogar",
            cat_travel: "Viaje",
            cat_beauty: "Belleza",
            cat_other: "Otros",
            
            cat_food: "Comida",
            cat_home: "Hogar",
            cat_ent: "Entretenimiento",
            cat_shop: "Compras",
            
            // GRÁFICAS
            cat_distribution: "Distribuci\u00F3n de Gastos",
            
            // AJUSTES
            sec_general: "General",
            sec_app: "Aplicación",
            sec_data: "Datos y Seguridad",
            lang_label: "Idioma",
            curr_label: "Moneda",
            theme_label: "Tema Visual",
            dark_mode: "Modo Oscuro",
            bio_lock: "Bloqueo con PIN", // <--- CORREGIDO
            biometrics: "Bloqueo con PIN", // <--- CORREGIDO (Por si acaso)
            currency: "Moneda",
            btn_export: "Exportar Copia",
            btn_import: "Restaurar Copia",
            btn_backup: "Crear Copia de Seguridad",
            btn_restore: "Restaurar Copia",
            btn_reset: "Borrar Todo",
            reset_confirm: "¿Borrar TODOS los datos?",
            import_confirm: "Esto sobrescribirá tus datos actuales.",
            
            // GUÍA
            guide_intro: "Bienvenido a Smarty.",
            guide_home: "\uD83C\uDFE0 <b>Inicio:</b> El c\u00EDrculo es tu saldo. Toca el centro para ver historial.",
            guide_lists: "\uD83D\uDED2 <b>Listas:</b> Organiza tu s\u00FAper. Finalizar descuenta del presupuesto.",
            guide_fin: "\uD83D\uDCB0 <b>Finanzas:</b> Gestiona suscripciones y cuotas.",
            guide_mascot: "\uD83E\uDD16 <b>Smarty:</b> Toca la mascota para consejos.",

            // CONFIRM
            confirm_title: "Confirmar",
            confirm_text: "\u00BFEst\u00E1s seguro?",
            confirm_desc: "Esta acci\u00F3n no se puede deshacer.",
        // Agrega esto dentro de es: { ... }
confirm_del_list: "¿Borrar esta lista?",
confirm_del_prod: "¿Borrar este producto?",
confirm_del_exp: "¿Borrar este gasto?",
pin_enter: "PIN",
pin_forgot: "Olvidé mi PIN"


},

        pt: {
            app_name: "Smarty",
            back: "Voltar",
            delete: "Apagar",
            confirm: "Confirmar",
            cancel: "Cancelar",
            save: "Salvar",
            update: "Atualizar",
            month_names: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            
            app_slogan: "Intelig\u00eancia para suas finan\u00e7as", // Nuevo Slogan
            profile_title: "Quartel General",
            analysis_title: "Análise do Smarty",
            quests_title: "Missões do Dia",
            badges_title: "Medalhas Obtidas",
            no_badges: "Sem medalhas ainda.",

// HOME & BUDGET
            budget_label: "Or\u00E7amento:",
            spent_label: "Gasto:",
            remaining_label: "Restante",
            active_lists_title: "Listas Ativas",
            recent_expenses_title: "Despesas Recentes",
            top_categories_title: "Top Categorias",
            see_all: "Ver todas",
            touch_budget: "Toque para definir or\u00E7amento \u270D\uFE0F",
            greeting: "Ol\u00E1 Master, tudo bem?",
            
            // TITULOS VISTAS
            title_lists: "Minhas Listas",
            title_history: "Hist\u00F3rico Compras",
            title_finance: "Finan\u00E7as",
            title_settings: "Ajustes",
            
            // MENÚ DE ACCIÓN (+)
            menu_action_title: "Criar Novo",
            menu_exp_title: "Registrar Gasto",
            menu_exp_desc: "Pagamentos individuais",
            menu_list_title: "Nova Lista",
            menu_list_desc: "Organizar compras",
            
            // TABS FINANZAS
            tab_subs: "Assinaturas",
            tab_inst: "Parcelas",
            tab_hist: "Hist\u00F3rico",
            
            // FINANCE CARDS
            btn_add_sub: "+ Nova Assinatura",
            empty_subs: "Sem assinaturas ativas.",
            sub_charge_day: "Cobran\u00E7a dia",
            empty_inst: "Sem parcelas pendentes.",
            inst_current: "Parcela atual:",
            inst_total_lbl: "Total:",
            inst_remaining_m: "Faltam meses",
            total_history_label: "Gasto Total Registrado",
            total_month_label: "Total",
            empty_history_month: "Sem movimenta\u00E7\u00F5es neste per\u00EDodo.",
            
            // SHOPPING
            btn_finish: "Finalizar Compra \u2705",
            swipe_delete: "Deslize para apagar \uD83D\uDDD1\uFE0F",
            empty_lists_home: "Tudo em dia.",
            empty_lists_view: "Sem listas ativas.<br>Toque em + para criar uma.",
            empty_shopping_history: "Sem hist\u00F3rico.",
            empty_month_shopping: "Sem compras este m\u00EAs.",
            archive_btn: "Ver Listas Anteriores",
            empty_summary_chart: "Sem dados este m\u00EAs",
            section_top_prod: "Top Produtos",
            empty_top_prod: "Nada comprado este m\u00EAs.",
            ranked: "Ranked",
            price_evol: "Evolu\u00E7\u00E3o de Pre\u00E7o",
            current_price_reg: "Pre\u00E7o atual registrado",
            
            // MODALES
            mod_exp_title: "Registrar Gasto",
            mod_sub_title: "Nova Assinatura",
            mod_bud_title: "Or\u00E7amento Mensal",
            import_title: "Importar Lista",
            detail_title: "Detalhe da Compra",
            receipt_est: "TOTAL ESTIMADO",
            receipt_real: "TOTAL REAL",
            
            // PLACEHOLDERS
            ph_amount: "0.00",
            ph_desc: "Com o que gastou?",
            ph_sub_name: "Nome (Ex: Netflix)",
            ph_sub_day: "Dia cobran\u00E7a (1-31)",
            import_ph: "Ex: - P\u00E3o\n- Leite...",
            ph_cuotas: "Parcelas",
            ph_paid: "Pagas",
            shop_placeholder: "O que vamos comprar?",
            ph_unit_price: "Unit\u00E1rio",
            
            // LABELS
            lbl_is_inst: "\u00C9 Parcelado?",
            cart_label: "Carrinho",
            
            // MENSAJES
            msg_saved: "Salvo com sucesso",
            msg_deleted: "Item apagado",
            msg_updated: "Atualizado",
            msg_invalid_amount: "Valor inv\u00E1lido",
            msg_list_saved: "Compra salva",
            msg_auth_success: "Verificado \u2705",
            msg_auth_fail: "N\u00E3o verificado \u274C",
            msg_bio_active: "PIN Ativado \uD83D\uDD12", // <--- CORREGIDO
            msg_bio_inactive: "Bloqueo Desativado \uD83D\uDD13",
            msg_no_bio_support: "Dispositivo n\u00E3o suporta segurança",
            import_success_title: "Sucesso!",
            import_success_msg: "Dados importados corretamente.",
            
            // CATEGORÍAS
            cat_market: "Mercado", 
            cat_leisure: "Lazer",
            cat_transport: "Transporte",
            cat_clothes: "Roupa",
            cat_health: "Sa\u00FAde",
            cat_bills: "Casa",
            cat_travel: "Viagem",
            cat_beauty: "Beleza",
            cat_other: "Outro",
            
            cat_food: "Comida",
            cat_home: "Casa",
            cat_ent: "Lazer",
            cat_shop: "Compras",
            
            // GRÁFICAS
            cat_distribution: "Distribui\u00E7\u00E3o de Despesas",
            
            // AJUSTES
            sec_general: "Geral",
            sec_app: "Aplicação",
            sec_data: "Dados e Segurança",
            lang_label: "Idioma",
            curr_label: "Moeda",
            theme_label: "Tema Visual",
            dark_mode: "Modo Escuro",
            bio_lock: "Bloqueio com PIN", // <--- CORREGIDO
            biometrics: "Bloqueio com PIN",
            currency: "Moeda",
            btn_export: "Exportar Backup",
            btn_import: "Restaurar Backup",
            btn_backup: "Criar Backup",
            btn_restore: "Restaurar Backup",
            btn_reset: "Apagar Tudo",
            reset_confirm: "Apagar TODOS os dados?",
            import_confirm: "Isso substituirá os dados atuais.",
            
            // GUÍA
            guide_intro: "Bem-vindo ao Smarty.",
            guide_home: "\uD83C\uDFE0 <b>In\u00EDcio:</b> O c\u00EDrculo mostra seu saldo. Toque no centro para ver o hist\u00F3rico.",
            guide_lists: "\uD83D\uDED2 <b>Listas:</b> Crie listas de compras. 'Finalizar' desconta do or\u00E7amento.",
            guide_fin: "\uD83D\uDCB0 <b>Finan\u00E7as:</b> Gerencie assinaturas e parcelas aqui.",
            guide_mascot: "\uD83E\uDD16 <b>Smarty:</b> Toque no mascote para receber conselhos.",

            // CONFIRM
            confirm_title: "Confirmar",
            confirm_text: "Tem certeza?",
            confirm_desc: "Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita.",
        // Agrega esto dentro de pt: { ... }
budget_label: "Orçamento:",
touch_budget: "Toque para definir orçamento ✍️",
confirm_del_list: "Apagar esta lista?",
confirm_del_prod: "Apagar este produto?",
confirm_del_exp: "Apagar este gasto?",
pin_enter: "PIN",
pin_forgot: "Esqueci meu PIN"


},

        en: {
            app_name: "Smarty",
            back: "Back",
            delete: "Delete",
            confirm: "Confirm",
            cancel: "Cancel",
            save: "Save",
            update: "Update",
            month_names: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            
            app_slogan: "Intelligence for your finances", // Nuevo Slogan
            profile_title: "Headquarters",
            analysis_title: "Smarty's Analysis",
            quests_title: "Daily Quests",
            badges_title: "Earned Badges",
            no_badges: "No badges yet.",

// HOME & BUDGET
            budget_label: "Budget:",
            spent_label: "Spent:",
            remaining_label: "Remaining",
            active_lists_title: "Active Lists",
            recent_expenses_title: "Recent Expenses",
            top_categories_title: "Top Categories",
            see_all: "See all",
            touch_budget: "Tap to set budget \u270D\uFE0F",
            greeting: "Hello Master, all good?",
            
            // TITULOS VISTAS
            title_lists: "My Lists",
            title_history: "Shopping History",
            title_finance: "Finance",
            title_settings: "Settings",
            
            // MENÚ DE ACCIÓN (+)
            menu_action_title: "Create New",
            menu_exp_title: "Add Expense",
            menu_exp_desc: "Individual payments",
            menu_list_title: "New List",
            menu_list_desc: "Organize shopping",
            
            // TABS FINANZAS
            tab_subs: "Subs.",
            tab_inst: "Installm.",
            tab_hist: "History",
            
            // FINANCE CARDS
            btn_add_sub: "+ New Subscription",
            empty_subs: "No active subscriptions.",
            sub_charge_day: "Charges on day",
            empty_inst: "No pending installments.",
            inst_current: "Current:",
            inst_total_lbl: "Total:",
            inst_remaining_m: "Months left",
            total_history_label: "Total Registered Spent",
            total_month_label: "Total",
            empty_history_month: "No transactions this period.",
            
            // SHOPPING
            btn_finish: "Finish Shopping \u2705",
            swipe_delete: "Swipe to delete \uD83D\uDDD1\uFE0F",
            empty_lists_home: "All caught up.",
            empty_lists_view: "No active lists.<br>Tap + to create one.",
            empty_shopping_history: "No history.",
            empty_month_shopping: "No purchases this month.",
            archive_btn: "View Previous Lists",
            empty_summary_chart: "No data this month",
            section_top_prod: "Top Products",
            empty_top_prod: "Nothing bought this month.",
            ranked: "Ranked",
            price_evol: "Price Evolution",
            current_price_reg: "Current registered price",
            
            // MODALES
            mod_exp_title: "Add Expense",
            mod_sub_title: "New Subscription",
            mod_bud_title: "Monthly Budget",
            import_title: "Import List",
            detail_title: "Purchase Detail",
            receipt_est: "ESTIMATED TOTAL",
            receipt_real: "REAL TOTAL",
            
            // PLACEHOLDERS
            ph_amount: "0.00",
            ph_desc: "What did you buy?",
            ph_sub_name: "Name (Ex: Netflix)",
            ph_sub_day: "Day (1-31)",
            import_ph: "Ex: - Bread\n- Milk...",
            ph_cuotas: "Installments",
            ph_paid: "Paid",
            shop_placeholder: "What to buy?",
            ph_unit_price: "Unit Price",
            
            // LABELS
            lbl_is_inst: "Is Installment?",
            cart_label: "Cart",
            
            // MENSAJES
            msg_saved: "Saved successfully",
            msg_deleted: "Deleted",
            msg_updated: "Updated",
            msg_invalid_amount: "Invalid amount",
            msg_list_saved: "Shopping saved",
            msg_auth_success: "Verified \u2705",
            msg_auth_fail: "Not Verified \u274C",
            msg_bio_active: "PIN Enabled \uD83D\uDD12", // <--- CORREGIDO
            msg_bio_inactive: "Security disabled \uD83D\uDD13",
            msg_no_bio_support: "Device does not support security",
            import_success_title: "Success!",
            import_success_msg: "Data imported successfully.",
            
            // CATEGORÍAS
            cat_market: "Groceries", 
            cat_leisure: "Leisure",
            cat_transport: "Transport",
            cat_clothes: "Clothes",
            cat_health: "Health",
            cat_bills: "Bills",
            cat_travel: "Travel",
            cat_beauty: "Beauty",
            cat_other: "Other",
            
            cat_food: "Food",
            cat_home: "Home",
            cat_ent: "Entertainment",
            cat_shop: "Shopping",
            
            // GRÁFICAS
            cat_distribution: "Expense Distribution",
            
            // AJUSTES
            sec_general: "General",
            sec_app: "Application",
            sec_data: "Data & Security",
            lang_label: "Language",
            curr_label: "Currency",
            theme_label: "Visual Theme",
            dark_mode: "Dark Mode",
            bio_lock: "PIN Lock", // <--- CORREGIDO
            biometrics: "PIN Lock",
            currency: "Currency",
            btn_export: "Export Backup",
            btn_import: "Restore Backup",
            btn_backup: "Create Backup",
            btn_restore: "Restore Backup",
            btn_reset: "Reset All",
            reset_confirm: "Erase ALL data?",
            import_confirm: "This will overwrite current data.",
            
            // GUÍA
            guide_intro: "Welcome to Smarty. Here are some quick tips:",
            guide_home: "\uD83C\uDFE0 <b>Home:</b> The circle shows your remaining budget. Tap center for history.",
            guide_lists: "\uD83D\uDED2 <b>Lists:</b> Create shopping lists. 'Finish' deducts from budget.",
            guide_fin: "\uD83D\uDCB0 <b>Finance:</b> Manage subscriptions and installments here.",
            guide_mascot: "\uD83E\uDD16 <b>Smarty:</b> Tap the mascot for advice.",

            // CONFIRM
            confirm_title: "Confirm",
            confirm_text: "Are you sure?",
            confirm_desc: "This action cannot be undone.",
        /* EN UI.JS -> dictionary -> en */

// Agrega estas líneas dentro del bloque 'en':
confirm_del_list: "Delete this list?",
confirm_del_prod: "Delete this item?",
confirm_del_exp: "Delete this expense?",
pin_enter: "PIN",
pin_forgot: "Forgot PIN",
msg_bio_inactive: "Lock Disabled 🔓"


}
    },

    // --- CATEGORÍAS DISPONIBLES ---
    categories: [
        { id: 'cat_market', icon: '\uD83D\uDED2' }, 
        { id: 'cat_leisure', icon: '\uD83C\uDF54' },
        { id: 'cat_transport', icon: '\uD83D\uDE8C' },
        { id: 'cat_clothes', icon: '\uD83D\uDC55' },
        { id: 'cat_health', icon: '\uD83D\uDC8A' },
        { id: 'cat_bills', icon: '\uD83C\uDFE0' },
        { id: 'cat_travel', icon: '\u2708\uFE0F' },
        { id: 'cat_beauty', icon: '\u2702\uFE0F \uD83D\uDC85' },
        { id: 'cat_other', icon: '\uD83D\uDCE6' }
    ],

    // --- UTILS ---
    t(key) {
        let lang = 'es';
        if (typeof Data !== 'undefined' && Data.store && Data.store.settings && Data.store.settings.lang) {
            lang = Data.store.settings.lang;
        }
        
        const dict = this.dictionary[lang] || this.dictionary['es'];
        return dict[key] || key; 
    },

    getMonthName(monthIndex) {
        const lang = (typeof Data !== 'undefined' && Data.store.settings) ? Data.store.settings.lang : 'es';
        const dict = this.dictionary[lang] || this.dictionary['es'];
        return dict.month_names ? dict.month_names[monthIndex] : "Mes";
    },

    formatMoney(amount) {
        const currency = (typeof Data !== 'undefined' && Data.store.settings && Data.store.settings.currency) ? Data.store.settings.currency : '$';
        return currency + parseFloat(amount).toFixed(2);
    },

    // --- RENDERIZADO GLOBAL (DOM REFRESH) ---
    refreshDOM() {
        const lang = (typeof Data !== 'undefined' && Data.store.settings) ? Data.store.settings.lang : 'es';
        document.documentElement.lang = lang;

        // 1. Traducir textos estáticos
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.innerHTML = this.t(key);
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (key) el.placeholder = this.t(key);
        });

        // 2. Modo Oscuro
        if (typeof Data !== 'undefined' && Data.store.settings && Data.store.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // 3. Renderizar componentes básicos
        this.renderCategoryChips();
        this.renderBudgetChart();
        
        // --- WIDGETS DEL HOME ---
        if (typeof Finance !== 'undefined') {
            Finance.renderHomeWidgets(); 
        }
        
        // 4. Renderizar Listas
        if (typeof Shopping !== 'undefined') {
            Shopping.renderMiniLists(); 
        }
        
        // 5. Renderizar Pestaña Finanzas Activa
        if (typeof Finance !== 'undefined') {
            const activeTab = document.querySelector('.segment-btn.active');
            if (activeTab && activeTab.id.startsWith('fin-tab-')) {
                const tabId = activeTab.id.replace('fin-tab-', '');
                Finance.setTab(tabId);
            }
        }

        // 6. Renderizar Ajustes
        this.renderSettingsView();
        // 7. FIX: ACTUALIZAR ASISTENTE EN TIEMPO REAL
        if (typeof Assistant !== 'undefined') {
            Assistant.updateMood();   // Actualiza la cara
            Assistant.updateHomeXP(); // Actualiza la barra de XP
        }
    }, // <--- ¡IMPORTANTE! Esta coma es necesaria porque hay más funciones debajo
    

    // --- CHART DEL HOME (CÍRCULO DE PRESUPUESTO) ---
    renderBudgetChart() {
        const limit = (typeof Data !== 'undefined' && Data.store.budget) ? parseFloat(Data.store.budget.limit) : 0;
        let spent = 0;
        
        if (typeof Finance !== 'undefined') {
            spent = Finance.calculateMonthlySpent();
        }

        const remaining = limit - spent;
        let percent = limit > 0 ? (spent / limit) * 100 : 0;
        const visualPercent = Math.min(percent, 100);
        
        const circle = document.getElementById('budget-circle');
        const remainText = document.getElementById('budget-remaining');
        const limitText = document.getElementById('budget-limit');
        const spentText = document.getElementById('budget-spent');

        if (circle) {
            circle.setAttribute('stroke-dasharray', `${visualPercent}, 100`);
            
            if (percent > 100) {
                circle.style.stroke = 'var(--danger)'; 
                if(remainText) remainText.style.color = 'var(--danger)';
            } else if (percent > 85) {
                circle.style.stroke = 'var(--warning)'; 
                if(remainText) remainText.style.color = 'var(--warning)';
            } else {
                circle.style.stroke = 'var(--success)';
                if(remainText) remainText.style.color = 'var(--success)'; 
            }
        }

        if (remainText) remainText.innerText = this.formatMoney(remaining);
        if (limitText) limitText.innerText = this.formatMoney(limit);
        if (spentText) spentText.innerText = this.formatMoney(spent);
        
        const lblSpent = document.getElementById('budget-spent-lbl');
        const lblBudget = document.getElementById('budget-limit-lbl');
        const lblRem = document.querySelector('.donut-label');
        
        if(lblSpent) lblSpent.innerText = this.t('spent_label');
        if(lblBudget) lblBudget.innerText = this.t('budget_label');
        if(lblRem) lblRem.innerText = this.t('remaining_label');
        
        const touchTxt = document.getElementById('touch-budget-txt');
        if(touchTxt) {
            if (limit <= 0) {
                touchTxt.innerText = this.t('touch_budget');
                touchTxt.style.color = 'var(--primary)';
            } else {
                touchTxt.innerText = `${Math.round(percent)}% ${this.t('spent_label').replace(':','')}`;
                touchTxt.style.color = 'var(--text-sec)';
            }
        }
    },

    // --- RENDERIZADO DE CHIPS (CATEGORÍAS) ---
    renderCategoryChips() {
        const container = document.getElementById('cat-chips');
        if (!container) return;

        // Forzar clase layout correcta y wrap
        container.className = 'quick-chips'; 
        container.style.flexWrap = 'wrap'; 
        container.style.height = 'auto'; 
        container.style.justifyContent = 'center';

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();

        this.categories.forEach(cat => {
            const chip = document.createElement('div');
            chip.className = 'chip cat-chip'; 
            chip.innerText = `${cat.icon} ${this.t(cat.id)}`;
            chip.dataset.id = cat.id;
            
            chip.onclick = () => {
                document.querySelectorAll('.cat-chip').forEach(c => {
                    c.classList.remove('selected');
                    c.style.background = 'var(--glass-bg)';
                    c.style.color = 'var(--text-color)';
                });
                chip.classList.add('selected');
                chip.style.background = 'var(--primary)';
                chip.style.color = 'white';
                if(navigator.vibrate) navigator.vibrate(10);
            };
            fragment.appendChild(chip);
        });

        container.appendChild(fragment);
    },

     // --- RENDERIZADO DE AJUSTES (ESTRUCTURA BLINDADA) ---
    
    // --- RENDERIZADO DE AJUSTES (ALMACENAMIENTO AL FINAL) ---
    renderSettingsView() {
        const container = document.getElementById('settings-inject');
        if (!container || typeof Data === 'undefined') return;

        // --- 1. PREPARAR DATOS GENERALES ---
        const s = Data.store.settings;
        const hasPin = (s.pin !== null && s.pin !== undefined && s.pin !== ""); 
        
        // Botón cambiar PIN
        const changeBtnHTML = hasPin 
            ? `<span onclick="Main.changePin()" style="font-size:12px; font-weight:700; color:var(--primary); cursor:pointer; margin-right:8px;">Cambiar</span>` 
            : '';

        // --- 2. PREPARAR DATOS ALMACENAMIENTO ---
        const storage = Data.getStorageUsage();
        const barColor = storage.status === 'good' ? 'var(--success)' : (storage.status === 'warning' ? 'var(--warning)' : 'var(--danger)');

        // --- 3. RENDERIZADO ÚNICO ---
        container.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div class="section-label" style="margin-top:0;">${this.t('sec_general')}</div>
                
                <div class="setting-item">
                    <span>${this.t('lang_label')}</span>
                </div>
                <div class="lang-grid">
                    <div class="lang-btn-opt ${s.lang === 'es' ? 'selected' : ''}" onclick="UI.changeLang('es')"><div class="flag-icon flag-es"></div><span>Español</span></div>
                    <div class="lang-btn-opt ${s.lang === 'en' ? 'selected' : ''}" onclick="UI.changeLang('en')"><div class="flag-icon flag-en"></div><span>English</span></div>
                    <div class="lang-btn-opt ${s.lang === 'pt' ? 'selected' : ''}" onclick="UI.changeLang('pt')"><div class="flag-icon flag-pt"></div><span>Português</span></div>
                </div>

                <div class="setting-item" onclick="UI.openCurrencyModal()" style="margin-top:15px; cursor:pointer;">
                    <span>${this.t('curr_label')}</span>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:700; color:var(--primary); font-size:16px;">${s.currency || '$'}</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5;"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <div class="section-label">${this.t('sec_app')}</div>
                
                <div class="setting-item">
                    <span>${this.t('theme_label')}</span>
                </div>
                <div class="theme-selector-grid">
                    <div class="theme-btn t-blue ${s.theme === 'blue' ? 'active' : ''}" onclick="UI.changeTheme('blue')"></div>
                    <div class="theme-btn t-pink ${s.theme === 'pink' ? 'active' : ''}" onclick="UI.changeTheme('pink')"></div>
                    <div class="theme-btn t-green ${s.theme === 'green' ? 'active' : ''}" onclick="UI.changeTheme('green')"></div>
                    <div class="theme-btn t-orange ${s.theme === 'orange' ? 'active' : ''}" onclick="UI.changeTheme('orange')"></div>
                    <div class="theme-btn t-red ${s.theme === 'red' ? 'active' : ''}" onclick="UI.changeTheme('red')"></div>
                    <div class="theme-btn t-purple ${s.theme === 'purple' ? 'active' : ''}" onclick="UI.changeTheme('purple')"></div>
                </div>

                <div class="setting-item" style="margin-top:15px; border-top:1px solid rgba(120,120,120,0.1); padding-top:15px;">
                    <span>Tipografía</span>
                </div>
                <div class="font-selector-grid">
                    <div class="font-btn ${(!s.font || s.font === 'Modern') ? 'active' : ''}" onclick="UI.changeFont('Modern')">
                        <span style="font-family: 'Manrope', sans-serif; font-size:16px;">Aa</span>
                        <small>Modern</small>
                    </div>
                    <div class="font-btn ${s.font === 'Classic' ? 'active' : ''}" onclick="UI.changeFont('Classic')">
                        <span style="font-family: 'Lora', serif; font-size:16px; font-weight:600;">Aa</span>
                        <small>Classic</small>
                    </div>
                    <div class="font-btn ${s.font === 'Tech' ? 'active' : ''}" onclick="UI.changeFont('Tech')">
                        <span style="font-family: 'Roboto Mono', monospace; font-size:14px;">{Aa}</span>
                        <small>Tech</small>
                    </div>
                    <div class="font-btn ${s.font === 'Soft' ? 'active' : ''}" onclick="UI.changeFont('Soft')">
                        <span style="font-family: 'Comfortaa', cursive; font-size:13px; font-weight:700;">Aa</span>
                        <small>Soft</small>
                    </div>
                </div>

                <div class="setting-item" style="margin-top:15px;">
                    <span>${this.t('dark_mode')}</span>
                    <label class="switch-wrap">
                        <input type="checkbox" id="dark-mode-toggle" ${s.darkMode ? 'checked' : ''} onchange="UI.toggleDarkMode()">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="setting-item" style="border-top:1px solid rgba(120,120,120,0.1); margin-top:15px; padding-top:15px;">
                    <span>Consejos Smarty</span> 
                    <label class="switch-wrap">
                        <input type="checkbox" id="smarty-tips-toggle" ${s.showSmartTips !== false ? 'checked' : ''} onchange="Main.toggleSmartTips()">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div class="section-label">${this.t('sec_data')}</div>

                <div class="setting-item">
                    <span>${this.t('bio_lock')}</span>
                    <div style="display:flex; align-items:center;">
                        ${changeBtnHTML}
                        <label class="switch-wrap">
                            <input type="checkbox" id="pin-toggle" ${hasPin ? 'checked' : ''} onchange="Main.togglePinLock()">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>

                <div class="btn-data-row" style="margin-top:15px;">
                    <button class="btn-data" onclick="Main.downloadBackup()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>${this.t('btn_backup')}</span>
                    </button>
                    <div class="btn-data" style="position:relative;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span>${this.t('btn_restore')}</span>
                        <input type="file" id="restore-input" style="position:absolute; inset:0; opacity:0; width:100%; height:100%; cursor:pointer;" onchange="Main.handleImport(this)">
                    </div>
                </div>

                <button class="btn-danger-outline" onclick="Main.factoryReset()" style="margin-top:15px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    ${this.t('btn_reset')}
                </button>
            </div>

            <div class="div-line" style="height:1px; background:rgba(120,120,120,0.1); margin:20px 0;"></div>

            <div class="setting-group" style="margin-bottom:40px;">
                <div style="font-size:12px; font-weight:700; color:var(--text-sec); margin-bottom:10px; text-transform:uppercase;">ALMACENAMIENTO</div>
                
                <div class="glass-card" style="padding:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span style="font-weight:600; font-size:14px;">Uso de Datos</span>
                        <span style="font-weight:700; font-size:14px; color:${barColor}">${storage.percent}%</span>
                    </div>
                    
                    <div style="background:rgba(0,0,0,0.1); height:8px; border-radius:4px; overflow:hidden; margin-bottom:8px;">
                        <div style="width:${storage.percent}%; background:${barColor}; height:100%; transition:width 0.5s ease;"></div>
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-sec);">
                        <span>${storage.usedKB} KB usados</span>
                        <span>Máx ~${storage.totalKB} KB</span>
                    </div>

                    ${storage.status === 'critical' ? `<div style="color:var(--danger); font-size:11px; margin-top:8px; font-weight:700;">⚠️ Espacio casi lleno. Borra fotos antiguas.</div>` : ''}
                </div>
                
                <button class="btn-danger-outline" style="width:100%; margin-top:10px;" onclick="Data.cleanOldPhotos()">
                    🧹 Liberar espacio (Borrar fotos > 3 meses)
                </button>
            </div>
            
            <div style="text-align:center; color:var(--text-sec); font-size:11px; padding-bottom: 20px;">
                Smarty v10.2<br>ID: ${Data.store.meta ? (Data.store.meta.installId || 'N/A') : 'Local'}
            </div>
        `;
    },



    // --- ACCIONES DE AJUSTES ---
    saveSettings() {
        const s = Data.store.settings;
        s.currency = document.getElementById('curr-select').value;
        Data.save();
        this.refreshDOM();
    },

    changeLang(lang) {
        Data.store.settings.lang = lang;
        Data.save();
        this.refreshDOM();
        this.showSnackbar(this.t('msg_updated'));
    },

    changeTheme(theme) {
        Data.store.settings.theme = theme;
        Data.save();
        if(typeof Main !== 'undefined') Main.applyThemeToBody(theme);
        this.renderSettingsView();
    },

    
        // --- CAMBIAR FUENTE (AUTO-CORRECCIÓN) ---
    changeFont(fontName) {
        if (!Data.store.settings) Data.store.settings = {};

        // Mapa de fuentes con familias reales
        const fontMap = {
            'Modern': "'Manrope', sans-serif",
            'Classic': "'Lora', serif",
            'Tech': "'Roboto Mono', monospace",
            'Soft': "'Comfortaa', cursive"
        };

        // CORRECCIÓN AUTOMÁTICA: Si el nombre no existe (ej: "Manrope"), forzar "Modern"
        let validFont = fontName;
        if (!fontMap[fontName]) {
            validFont = 'Modern'; // Fallback seguro
        }

        // 1. Guardar el nombre VÁLIDO
        Data.store.settings.font = validFont;
        Data.save();

        // 2. Aplicar al CSS
        const cssValue = fontMap[validFont];
        document.documentElement.style.setProperty('--font-main', cssValue);

        // 3. Refrescar UI (solo si la vista settings está activa para no parpadear)
        const settingsView = document.getElementById('view-settings');
        if (settingsView && settingsView.classList.contains('active')) {
            this.renderSettingsView();
        }
        
        if(navigator.vibrate) navigator.vibrate(10);
    },




    toggleDarkMode() {
        Data.store.settings.darkMode = document.getElementById('dark-mode-toggle').checked;
        Data.save();
        this.refreshDOM();
    },

    // --- ELIMINADA: toggleBiometrics ya no es necesaria, Main.togglePinLock hace el trabajo ---

    // --- MODALES Y DIÁLOGOS (PROMISE BASED) ---
    confirm(titleKey, textKey) {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-confirm');
            const titleEl = document.getElementById('confirm-title');
            const textEl = document.getElementById('confirm-text');
            const btnOk = document.getElementById('confirm-ok');
            const btnCancel = document.getElementById('confirm-cancel');

            if (titleEl) titleEl.innerText = this.t(titleKey);
            if (textEl) textEl.innerText = this.t(textKey);
            
            if (btnOk) btnOk.innerText = this.t('confirm');
            if (btnCancel) btnCancel.innerText = this.t('cancel');

            const close = (result) => {
                modal.classList.remove('open');
                btnOk.onclick = null;
                btnCancel.onclick = null;
                resolve(result);
            };

            btnOk.onclick = () => close(true);
            btnCancel.onclick = () => close(false);

            modal.classList.add('open');
            if(navigator.vibrate) navigator.vibrate(20);
        });
    },

    showSnackbar(msg) {
        const sb = document.getElementById('snackbar');
        const txt = document.getElementById('snackbar-text');
        if (sb && txt) {
            txt.innerText = msg;
            sb.classList.add('show');
            setTimeout(() => { sb.classList.remove('show'); }, 3000);
        }
    },

    // --- GUÍA DE AYUDA ---
    toggleGuide() {
        const modal = document.getElementById('guide-modal');
        const content = document.getElementById('guide-content');
        
        if (modal.classList.contains('open')) {
            modal.classList.remove('open');
        } else {
            content.innerHTML = `
                <div style="text-align:center; margin-bottom:15px;">
                    <img src="logo.png" style="width:150px; height:150px; margin-bottom:15px; filter:drop-shadow(0 5px 15px rgba(0,0,0,0.1));">
                    <p style="color:var(--text-sec); font-size:15px; line-height:1.5;">${this.t('guide_intro')}</p>
                </div>
                
                <div class="glass-card" style="padding:15px; margin-bottom:10px;">
                    <div style="color:var(--primary); font-weight:bold; margin-bottom:5px;">${this.t('app_name')}</div>
                    <div style="font-size:13px; color:var(--text-sec);">${this.t('guide_home')}</div>
                </div>
                
                <div class="glass-card" style="padding:15px; margin-bottom:10px;">
                    <div style="color:var(--success); font-weight:bold; margin-bottom:5px;">${this.t('title_lists')}</div>
                    <div style="font-size:13px; color:var(--text-sec);">${this.t('guide_lists')}</div>
                </div>
                
                <div class="glass-card" style="padding:15px; margin-bottom:10px;">
                    <div style="color:var(--warning); font-weight:bold; margin-bottom:5px;">${this.t('title_finance')}</div>
                    <div style="font-size:13px; color:var(--text-sec);">${this.t('guide_fin')}</div>
                </div>

                <div class="glass-card" style="padding:15px;">
                    <div style="color:var(--purple); font-weight:bold; margin-bottom:5px;">Bot</div>
                    <div style="font-size:13px; color:var(--text-sec);">${this.t('guide_mascot')}</div>
                </div>
            `;
            modal.classList.add('open');
        }
    },
        // --- NUEVO: SELECTOR DE MONEDA (MODAL PRO) ---
        // --- FUNCIÓN CORREGIDA: SELECTOR DE MONEDA ---
    openCurrencyModal() {
        const currencies = [
            { code: 'USD', symbol: '$', name: 'D\u00F3lar', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
            { code: 'EUR', symbol: '\u20AC', name: 'Euro', flag: '\uD83C\uDDEA\uD83C\uDDFA' },
            { code: 'BRL', symbol: 'R$', name: 'Real', flag: '\uD83C\uDDE7\uD83C\uDDF7' },
            { code: 'VES', symbol: 'Bs', name: 'Bol\u00EDvar', flag: '\uD83C\uDDFB\uD83C\uDDEA' },
            { code: 'ARS', symbol: '$', name: 'Peso Arg', flag: '\uD83C\uDDE6\uD83C\uDDF7' },
            { code: 'MXN', symbol: '$', name: 'Peso Mex', flag: '\uD83C\uDDF2\uD83C\uDDFD' },
            { code: 'COP', symbol: '$', name: 'Peso Col', flag: '\uD83C\uDDE8\uD83C\uDDF4' },
            { code: 'CLP', symbol: '$', name: 'Peso Chi', flag: '\uD83C\uDDE8\uD83C\uDDF1' },
            { code: 'PEN', symbol: 'S/', name: 'Sol Peru', flag: '\uD83C\uDDF5\uD83C\uDDEA' },
            { code: 'UYU', symbol: '$U', name: 'Peso Uru', flag: '\uD83C\uDDFA\uD83C\uDDFE' }
        ];

        let listHTML = '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">';
        
        // CORRECCIÓN 1: Obtenemos el código guardado (ej: 'MXN') para comparar, no solo el símbolo
        const currentCode = (Data.store.settings.currencyCode || 'USD'); 

        currencies.forEach(c => {
            // CORRECCIÓN 2: Comparamos por CÓDIGO (único), así no se marcan 5 a la vez
            const isActive = currentCode === c.code; 
            const border = isActive ? '2px solid var(--primary)' : '1px solid var(--glass-border)';
            const bg = isActive ? 'rgba(0,122,255,0.08)' : 'var(--glass-bg)';

            // CORRECCIÓN 3: Pasamos ambos datos (código y símbolo) a la función de guardar
            listHTML += `
                <div onclick="UI.setAppCurrency('${c.code}', '${c.symbol}')" 
                     style="background:${bg}; border:${border}; border-radius:16px; padding:15px; cursor:pointer; display:flex; align-items:center; gap:12px; transition:transform 0.1s;">
                    <div style="font-size:24px;">${c.flag}</div>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:700; font-size:13px; color:var(--text-color);">${c.code}</span>
                        <span style="font-size:11px; color:var(--text-sec);">${c.name} (${c.symbol})</span>
                    </div>
                </div>
            `;
        });
        listHTML += '</div>';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay open';
        overlay.style.zIndex = '11000';
        
        overlay.innerHTML = `
            <div class="settings-card" onclick="event.stopPropagation()" style="max-height:85vh; width:90%; max-width:400px; animation: popIn 0.3s forwards; opacity: 1;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 style="margin:0; font-size:18px; color:var(--primary);">Seleccionar Moneda</h2>
                    <button class="icon-btn" id="close-curr-btn">&#10005;</button>
                </div>
                <div style="overflow-y:auto; padding-bottom:10px;">
                    ${listHTML}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const close = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 300); };
        overlay.querySelector('#close-curr-btn').onclick = close;
        overlay.onclick = close;
    },

    // --- FUNCIÓN CORREGIDA: GUARDAR SIN REINICIAR ---
    setAppCurrency(code, symbol) {
        if (!Data.store.settings) Data.store.settings = {};
        
        // Guardamos AMBOS: el código (para saber cuál es) y el símbolo (para mostrar $)
        Data.store.settings.currencyCode = code; 
        Data.store.settings.currency = symbol;
        
        if(Data.store.budget) Data.store.budget.currency = symbol;
        
        Data.save();
        
        const modal = document.querySelector('.modal-overlay.open');
        if(modal) modal.classList.remove('open');
        
        this.showSnackbar(`Moneda actualizada: ${code}`);
        
        // CORRECCIÓN 4: Quitamos location.reload() y usamos refreshDOM()
        // Esto actualiza la pantalla al instante sin mandarte al Home
        if(typeof this.refreshDOM === 'function') this.refreshDOM();
        
        // Si tienes el asistente cargado, actualizamos sus widgets también
        if(typeof Assistant !== 'undefined' && Assistant.updateHomeXP) Assistant.updateHomeXP();
    }


};
