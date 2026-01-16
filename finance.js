/* =========================================
   SMART LIFE PRO - FINANCE MODULE (V7.6 - NAV FIX)
   Autor: A_True_Alpha
   ========================================= */

const Finance = {
    // --- ESTADO INTERNO ---
    selectedHistoryMonth: null, // Formato "YYYY-MM" para el filtro de historial

    // --- NAVEGACIÓN DE PESTAÑAS (TABS) ---
    setTab(tab) {
        // 1. Ocultar todas las pestañas primero
        const contents = document.querySelectorAll('.finance-tab-content');
        contents.forEach(content => {
            content.classList.add('hidden');
            content.style.display = 'none'; 
        });

        // 2. Desactivar botones de navegación
        document.querySelectorAll('.segment-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 3. Activar la pestaña seleccionada
        const btn = document.getElementById(`fin-tab-${tab}`);
        const content = document.getElementById(`finance-content-${tab}`);
        
        if (btn) btn.classList.add('active');
        if (content) {
            content.classList.remove('hidden');
            content.style.display = 'block';
        }

        // 4. Renderizar el contenido específico
        if (tab === 'subs') {
            this.renderSubscriptions();
        } else if (tab === 'installments') {
            this.renderInstallments();
        } else if (tab === 'history') {
            // Si no hay mes seleccionado, seleccionar el actual
            if (!this.selectedHistoryMonth) {
                const now = new Date();
                const monthStr = String(now.getMonth() + 1).padStart(2, '0');
                this.selectedHistoryMonth = `${now.getFullYear()}-${monthStr}`;
            }
            this.renderExpensesHistory();
        }
    },

    // --- LÓGICA DE CIERRE DE MES (AUTOMÁTICO) ---
    checkMonthTransition() {
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Inicializar control si no existe
        if (!Data.store.appControl) {
            Data.store.appControl = { lastActivePeriod: currentPeriod };
        }
        
        const lastPeriod = Data.store.appControl.lastActivePeriod || currentPeriod;

        // Si cambió el mes desde la última vez
        if (currentPeriod !== lastPeriod) {
            console.log(`[Finance] Cambio de mes detectado: ${lastPeriod} -> ${currentPeriod}`);
            this.performMonthClose(lastPeriod);
            
            // Actualizar periodo
            Data.store.appControl.lastActivePeriod = currentPeriod;
            Data.save();
        }
    },

    performMonthClose(periodString) {
        // Damos XP al usuario por sobrevivir el mes
        if (typeof Assistant !== 'undefined') {
            Assistant.addXP(100, "Nuevo Mes Iniciado");
            Assistant.updateMood();
        }
        
        if (typeof UI !== 'undefined') {
            UI.showSnackbar(`${UI.t('msg_updated')}: ${periodString}`);
        }
    },

    // --- CÁLCULOS FINANCIEROS (CORE) ---
    
    // Calcula cuánto se ha gastado en el mes actual (Gastos + Listas + Suscripciones)
    calculateMonthlySpent() {
        let total = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        // 1. Sumar Gastos Individuales
        if (Data.store.expenses) {
            Data.store.expenses.forEach(exp => {
                if (!exp.isInstallment) {
                    // Gasto normal: verificar si cae en este mes
                    const d = new Date(exp.date);
                    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                        total += parseFloat(exp.amount);
                    }
                } else {
                    // Gasto parcelado: verificar si la cuota está activa
                    const { current } = this.calculateProgress(exp.date, exp.installments.total);
                    if (current > 0 && current <= exp.installments.total) {
                        total += parseFloat(exp.amount); // Sumar la cuota mensual
                    }
                }
            });
        }

        // 2. Sumar Listas de Compra (Solo las completadas este mes)
        if (Data.store.lists) {
            Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    total += parseFloat(l.total);
                }
            });
        }

        // 3. Sumar Suscripciones (Solo si ya pasó el día de cobro)
        if (Data.store.subscriptions) {
            Data.store.subscriptions.forEach(sub => {
                if (currentDay >= sub.day) {
                    total += parseFloat(sub.cost);
                }
            });
        }

        return total;
    },

    // Helper para calcular progreso de cuotas
    calculateProgressAtDate(startDateTimestamp, totalInstallments, targetDate) {
        const start = new Date(startDateTimestamp);
        // Diferencia en años * 12 + diferencia en meses
        let months = (targetDate.getFullYear() - start.getFullYear()) * 12;
        months -= start.getMonth();
        months += targetDate.getMonth();
        
        // Sumamos 1 porque el primer mes cuenta como cuota 1
        const current = months + 1;
        
        return { current: current > 0 ? current : 1 };
    },

    calculateProgress(startDateTimestamp, totalInstallments) {
        return this.calculateProgressAtDate(startDateTimestamp, totalInstallments, new Date());
    },

    // --- GRÁFICO DE CATEGORÍAS (DONUT) ---
    renderCategoryChart(container) {
        const categories = {};
        const [selYear, selMonth] = this.selectedHistoryMonth.split('-').map(Number);
        
        let totalMonth = 0;

        // A. Procesar Gastos (Normales y Parcelados)
        Data.store.expenses.forEach(e => {
            const d = new Date(e.date);
            let match = false;

            if (!e.isInstallment) {
                // Coincide el mes y año
                if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    match = true;
                }
            } else {
                // Para parcelas, ver si estaba activa en ese mes específico
                const targetDate = new Date(selYear, selMonth - 1, 1);
                const { current } = this.calculateProgressAtDate(e.date, e.installments.total, targetDate);
                
                if (current > 0 && current <= e.installments.total) {
                    match = true;
                }
            }

            if (match) {
                let catName = e.category || UI.t('cat_other');
                // Limpiar posibles iconos si venían guardados
                if(catName.includes(' ')) {
                    const parts = catName.split(' ');
                    if(parts.length > 1 && parts[0].match(/\p{Emoji}/u)) {
                        parts.shift(); // Quitar emoji
                        catName = parts.join(' ');
                    }
                }

                if (!categories[catName]) categories[catName] = 0;
                categories[catName] += parseFloat(e.amount);
                totalMonth += parseFloat(e.amount);
            }
        });

        // B. Procesar Listas de Compra
        if (Data.store.lists) {
            Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    const catKey = UI.t('cat_market'); 
                    if (!categories[catKey]) categories[catKey] = 0;
                    categories[catKey] += parseFloat(l.total);
                    totalMonth += parseFloat(l.total);
                }
            });
        }

        // C. Procesar Suscripciones
        const daysInMonth = new Date(selYear, selMonth, 0).getDate();
        if (Data.store.subscriptions) {
            Data.store.subscriptions.forEach(s => {
                if (s.day <= daysInMonth) {
                    const catKey = UI.t('tab_subs'); 
                    if (!categories[catKey]) categories[catKey] = 0;
                    categories[catKey] += parseFloat(s.cost);
                    totalMonth += parseFloat(s.cost);
                }
            });
        }

        if (totalMonth === 0) return;

        // D. Construir el Gráfico Visual (CSS Conic Gradient)
        let currentDeg = 0;
        let gradientParts = [];
        
        const colors = [
            '#007AFF', '#FF9500', '#FF2D55', '#AF52DE', 
            '#34C759', '#FFCC00', '#5AC8FA', '#8E8E93'
        ];
        
        const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        
        let legendHTML = '<div class="chart-legend" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:25px;">';

        sortedCats.forEach(([cat, amount], index) => {
            const percentage = (amount / totalMonth) * 100;
            const degrees = (amount / totalMonth) * 360;
            const color = colors[index % colors.length];
            
            gradientParts.push(`${color} ${currentDeg}deg ${currentDeg + degrees}deg`);
            currentDeg += degrees;

            legendHTML += `
                <div style="display:flex; align-items:center; font-size:12px;">
                    <div style="width:8px; height:8px; background:${color}; border-radius:50%; margin-right:8px; box-shadow:0 0 5px ${color};"></div>
                    <div style="flex:1; color:var(--text-color); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${cat}</div>
                    <div style="font-weight:800; color:var(--text-sec);">${Math.round(percentage)}%</div>
                </div>
            `;
        });
        legendHTML += '</div>';

        const chartHTML = `
            <div class="glass-card" style="padding:25px; margin-bottom:25px;">
                <div class="section-label" style="margin-bottom:25px; text-align:center; display:block;">
                    ${UI.t('cat_distribution')}
                </div>
                
                <div style="position:relative; width:160px; height:160px; margin:0 auto; border-radius:50%; background: conic-gradient(${gradientParts.join(', ')});">
                    <div style="position:absolute; inset:22px; background:var(--glass-bg); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-direction:column; backdrop-filter:blur(10px);">
                        <span style="font-size:10px; color:var(--text-sec); font-weight:700; text-transform:uppercase; letter-spacing:1px;">Total</span>
                        <span style="font-size:18px; font-weight:900; color:var(--text-color); margin-top:4px;">${UI.formatMoney(totalMonth)}</span>
                    </div>
                </div>
                
                ${legendHTML}
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = chartHTML;
        container.appendChild(tempDiv);
    },

    // --- HELPER PARA ICONOS ---
    getCategoryIcon(catName) {
        // Intentar buscar en las categorías de UI por texto traducido
        const found = UI.categories.find(c => UI.t(c.id) === catName || c.id === catName);
        if (found) return found.icon;
        // Si no, devolver genérico (Caja)
        return '\uD83D\uDCE6'; 
    },

    // --- HISTORIAL DETALLADO (Renderizado Principal) ---
    renderExpensesHistory() {
        const container = document.getElementById('expenses-history-list');
        if (!container) return;
        container.innerHTML = ''; 

        this.renderMonthSelector(container);
        this.renderCategoryChart(container);

        const [selYear, selMonth] = this.selectedHistoryMonth.split('-').map(Number);
        
        // Lista de Movimientos
        let allItems = [];

        // 1. Recolectar Gastos
        Data.store.expenses.forEach(e => {
            const d = new Date(e.date);
            if (!e.isInstallment && d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                allItems.push({
                    type: 'expense', id: e.id, date: e.date, amount: e.amount, name: e.desc, 
                    icon: this.getCategoryIcon(e.category)
                });
            }
            if (e.isInstallment) {
                const targetDate = new Date(selYear, selMonth - 1, 1);
                const { current } = this.calculateProgressAtDate(e.date, e.installments.total, targetDate);
                if (current > 0 && current <= e.installments.total) {
                    allItems.push({
                        type: 'expense', id: e.id, date: targetDate.getTime(), amount: e.amount, 
                        name: `${e.desc} (${current}/${e.installments.total})`,
                        icon: this.getCategoryIcon(e.category)
                    });
                }
            }
        });

        // 2. Recolectar Listas
        if (Data.store.lists) {
            Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    allItems.push({
                        type: 'list', 
                        id: l.id, 
                        date: l.date, 
                        amount: l.total, 
                        name: l.name, 
                        icon: '\uD83D\uDED2' //  Carrito Unicode
                    });
                }
            });
        }

        // 3. Recolectar Suscripciones
        if (Data.store.subscriptions) {
            Data.store.subscriptions.forEach(s => {
                const daysInMonth = new Date(selYear, selMonth, 0).getDate();
                if (s.day <= daysInMonth) {
                    // Crear fecha ficticia para ordenar
                    const date = new Date(selYear, selMonth - 1, s.day).getTime();
                    allItems.push({
                        type: 'sub', id: s.id, date: date, amount: s.cost, name: s.name, 
                        icon: '\uD83D\uDCC5' // Calendario
                    });
                }
            });
        }

        allItems.sort((a, b) => b.date - a.date);

        if (allItems.length > 0) {
            allItems.forEach(item => {
                const row = document.createElement('div');
                row.className = 'glass-card item-row';
                row.style.marginBottom = '10px';
                
                const deleteAction = item.type === 'expense' 
                    ? `Finance.deleteExpense('${item.id}')` 
                    : (item.type === 'list' ? `Shopping.deleteList('${item.id}')` : `Finance.deleteSub('${item.id}')`);

                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px; flex:1;">
                        <span style="font-size:24px;">${item.icon}</span>
                        <div style="overflow:hidden;">
                            <div style="font-weight:700; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                            <div style="font-size:12px; color:var(--text-sec);">${new Date(item.date).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div style="text-align:right; display:flex; align-items:center; gap:10px;">
                        <div style="font-weight:800; font-size:15px; color:var(--text-color);">${UI.formatMoney(item.amount)}</div>
                        <button class="icon-btn" style="color:var(--danger); width:32px; height:32px;" onclick="${deleteAction}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `;
                container.appendChild(row);
            });
        } else {
            container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">${UI.t('empty_history_month')}</div>`;
        }
    },

    // --- RENDERIZADO DEL SELECTOR DE MES (CORREGIDO) ---
    renderMonthSelector(container) {
        // Crear contenedor flexible (barra de navegación)
        const navContainer = document.createElement('div');
        navContainer.className = 'glass-card';
        navContainer.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:12px 15px; margin-bottom:20px;';

        const [y, m] = this.selectedHistoryMonth.split('-').map(Number);

        // 1. Botón Anterior (<)
        const btnPrev = document.createElement('button');
        btnPrev.className = 'icon-btn';
        btnPrev.style.cssText = 'width:32px; height:32px; background:transparent;';
        btnPrev.innerHTML = '&#9664;'; // Flecha Izquierda
        btnPrev.onclick = () => this.changeMonth(-1);

        // 2. Texto del Mes (Centro)
        const label = document.createElement('div');
        label.style.cssText = 'font-weight:800; font-size:16px; color:var(--text-color); text-transform:capitalize;';
        label.innerText = `${UI.getMonthName(parseInt(m) - 1)} ${y}`;

        // 3. Botón Siguiente (>)
        const btnNext = document.createElement('button');
        btnNext.className = 'icon-btn';
        btnNext.style.cssText = 'width:32px; height:32px; background:transparent;';
        btnNext.innerHTML = '&#9654;'; // Flecha Derecha
        btnNext.onclick = () => this.changeMonth(1);

        navContainer.appendChild(btnPrev);
        navContainer.appendChild(label);
        navContainer.appendChild(btnNext);
        
        container.appendChild(navContainer);
    },

    // --- NUEVA LÓGICA DE CAMBIO DE MES ---
    changeMonth(offset) {
        let [y, m] = this.selectedHistoryMonth.split('-').map(Number);
        
        m += offset;
        
        // Manejo de cambio de año
        if (m > 12) {
            m = 1;
            y++;
        } else if (m < 1) {
            m = 12;
            y--;
        }
        
        this.selectedHistoryMonth = `${y}-${String(m).padStart(2,'0')}`;
        this.renderExpensesHistory();
        
        // Pequeña vibración de feedback
        if(navigator.vibrate) navigator.vibrate(10);
    },

    // --- GESTIÓN DE PRESUPUESTO ---
    openBudgetModal() {
        const modal = document.getElementById('modal-budget');
        const input = document.getElementById('budget-input');
        input.value = Data.store.budget.limit || '';
        modal.classList.add('open');
        input.focus();
    },

    saveBudget() {
        const input = document.getElementById('budget-input');
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            Data.store.budget.limit = val;
            Data.save();
            Main.closeModal('budget');
            UI.renderBudgetChart();
            
            if (typeof Assistant !== 'undefined') {
                Assistant.addXP(20, "Presupuesto Definido"); 
                Assistant.updateMood();
            }
            UI.showSnackbar(UI.t('msg_updated'));
        }
    },

    // --- GESTIÓN DE GASTOS ---
    openExpenseModal() {
        document.getElementById('exp-amount').value = '';
        document.getElementById('exp-desc').value = '';
        document.getElementById('exp-is-install').checked = false;
        
        this.toggleInstallmentInputs();
        
        if (typeof UI.renderCategoryChips === 'function') {
            UI.renderCategoryChips();
        }
        
        document.getElementById('modal-expense').classList.add('open');
        setTimeout(() => document.getElementById('exp-amount').focus(), 100);
    },

    toggleInstallmentInputs() {
        const isInstall = document.getElementById('exp-is-install').checked;
        const div = document.getElementById('installment-inputs');
        if (isInstall) {
            div.classList.remove('hidden');
        } else {
            div.classList.add('hidden');
        }
    },

    saveExpense() {
        const val = parseFloat(document.getElementById('exp-amount').value);
        const descInput = document.getElementById('exp-desc').value.trim();
        const desc = descInput || UI.t('cat_other');
        const isInstall = document.getElementById('exp-is-install').checked;
        
        const catChip = document.querySelector('.cat-chip.selected');
        let category = UI.t('cat_other');
        
        if (catChip) {
            if (catChip.dataset.id) {
                category = UI.t(catChip.dataset.id);
            } else {
                const text = catChip.innerText; 
                category = text.includes(' ') ? text.split(' ')[1] : text;
            }
        }

        if (!val || val <= 0) {
            return UI.showSnackbar(UI.t('msg_invalid_amount'));
        }

        let finalAmount = val;
        let installData = null;

        if (isInstall) {
            const count = parseInt(document.getElementById('exp-inst-count').value) || 1;
            finalAmount = val / count; 
            installData = { 
                total: count, 
                originalTotal: val 
            };
        }

        const newExpense = {
            id: Date.now().toString(),
            date: Date.now(),
            amount: finalAmount,
            desc: desc,
            category: category,
            isInstallment: isInstall,
            installments: installData
        };

        if (!Data.store.expenses) Data.store.expenses = [];
        Data.store.expenses.push(newExpense);
        Data.save();

        Main.closeModal('expense');
        UI.showSnackbar(UI.t('msg_saved'));
        UI.renderBudgetChart();
        
        if (typeof Assistant !== 'undefined') {
            Assistant.addXP(10, "Gasto Registrado");
            Assistant.updateMood();
        }

        const activeTab = document.querySelector('.segment-btn.active');
        if (activeTab) {
            if (activeTab.id.includes('history')) this.renderExpensesHistory();
            if (activeTab.id.includes('installments')) this.renderInstallments();
        }
    },

    async deleteExpense(id) {
        if (await UI.confirm("confirm_del_exp", "confirm_desc")) {
            Data.store.expenses = Data.store.expenses.filter(e => e.id !== id);
            Data.save(); 
            this.setTab('history'); 
            UI.renderBudgetChart();
            if (typeof Assistant !== 'undefined') Assistant.updateMood();
        }
    },

    // --- GESTIÓN DE SUSCRIPCIONES ---
    addSubscription() { 
        document.getElementById('sub-name').value = '';
        document.getElementById('sub-cost').value = '';
        document.getElementById('sub-day').value = '';
        document.getElementById('modal-sub').classList.add('open'); 
    },
    
    saveSubscription() {
        const name = document.getElementById('sub-name').value;
        const cost = parseFloat(document.getElementById('sub-cost').value);
        const day = parseInt(document.getElementById('sub-day').value);
        
        if (name && cost && day) {
            Data.store.subscriptions.push({ 
                id: Date.now().toString(), 
                name, 
                cost, 
                day 
            });
            Data.save();
            Main.closeModal('sub');
            this.renderSubscriptions();
            UI.renderBudgetChart();
            
            if (typeof Assistant !== 'undefined') Assistant.updateMood();
        }
    },

    renderSubscriptions() {
        const container = document.getElementById('subs-list');
        container.innerHTML = '';
        
        if (!Data.store.subscriptions || Data.store.subscriptions.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">${UI.t('empty_subs')}</div>`;
            return;
        }
        
        Data.store.subscriptions.forEach(sub => {
            const div = document.createElement('div');
            div.className = 'glass-card item-row';
            div.innerHTML = `
                <div style="flex:1">
                    <div style="font-weight:700;">${sub.name}</div>
                    <div style="font-size:12px; opacity:0.7;">${UI.t('sub_charge_day')} ${sub.day}</div>
                </div>
                <div style="font-weight:800; margin-right:15px; color:var(--text-color);">
                    ${UI.formatMoney(sub.cost)}
                </div>
                <button class="icon-btn" style="color:var(--danger); width:36px; height:36px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            // Cierre correcto de evento
            div.querySelector('button').onclick = () => this.deleteSub(sub.id);
            container.appendChild(div);
        });
    },

    async deleteSub(id) {
        if (await UI.confirm("confirm_del_exp", "confirm_desc")) {
            Data.store.subscriptions = Data.store.subscriptions.filter(s => s.id !== id);
            Data.save(); 
            this.renderSubscriptions(); 
            UI.renderBudgetChart();
        }
    },

    // --- GESTIÓN DE PARCELAS (CUOTAS) ---
    renderInstallments() {
        const container = document.getElementById('installments-list');
        container.innerHTML = '';
        
        const activeInstalls = Data.store.expenses.filter(e => e.isInstallment);
        
        if (activeInstalls.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">${UI.t('empty_inst')}</div>`;
            return;
        }
        
        activeInstalls.forEach(inst => {
            const { current } = this.calculateProgress(inst.date, inst.installments.total);
            
            if (current > inst.installments.total) return;
            
            const pct = (current / inst.installments.total) * 100;
            
            const div = document.createElement('div');
            div.className = 'glass-card';
            div.style.padding = '15px';
            div.style.marginBottom = '12px';
            
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-weight:700;">${inst.desc}</span>
                    <span style="font-weight:800;">${UI.formatMoney(inst.amount)}/mes</span>
                </div>
                <div style="font-size:12px; opacity:0.7; margin-bottom:8px; display:flex; justify-content:space-between;">
                    <span>${UI.t('inst_current')} <strong>${current}</strong>/${inst.installments.total}</span>
                    <span>Total: ${UI.formatMoney(inst.installments.originalTotal)}</span>
                </div>
                <div style="background:rgba(0,0,0,0.1); height:6px; border-radius:3px; overflow:hidden;">
                    <div style="width:${pct}%; background:var(--primary-grad); height:100%;"></div>
                </div>
                <div style="text-align:right; margin-top:10px;">
                    <button class="text-btn-small" style="color:var(--danger);">
                        ${UI.t('delete')}
                    </button>
                </div>
            `;
            
            div.querySelector('button').onclick = () => this.deleteExpense(inst.id);
            container.appendChild(div);
        });
    }
};
