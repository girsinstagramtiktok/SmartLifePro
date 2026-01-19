/* =========================================
   SMART LIFE PRO - FINANCE MODULE (V9.9 - FINAL LOGIC RESTORED)
   Autor: A_True_Alpha
   ========================================= */

const Finance = {
    // --- ESTADO INTERNO ---
    selectedHistoryMonth: null, 
    selectedCategoryFilter: 'ALL', // Estado del filtro de categorías

    // --- NAVEGACIÓN DE PESTAÑAS (TABS) ---
    setTab(tab) {
        // 1. Ocultar todas las pestañas primero
        document.querySelectorAll('.finance-tab-content').forEach(el => {
            el.classList.add('hidden');
            el.style.display = 'none';
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
            if (!this.selectedHistoryMonth) {
                const now = new Date();
                const monthStr = String(now.getMonth() + 1).padStart(2, '0');
                this.selectedHistoryMonth = `${now.getFullYear()}-${monthStr}`;
            }
            this.renderExpensesHistory();
        }
    },

    // --- NUEVO: GENERADOR DE CHIPS DE FILTRO (CON EMOJIS) ---
    renderFilterChips() {
        let html = `<div class="filter-scroll-container">`;

        // 1. Chip "Todo"
        const allActive = this.selectedCategoryFilter === 'ALL' ? 'active' : '';
        html += `<div class="filter-chip ${allActive}" onclick="Finance.setCategoryFilter('ALL')">Todo</div>`;

        // 2. Chips de Categorías (Desde UI.categories)
        if (typeof UI !== 'undefined' && UI.categories) {
            UI.categories.forEach(cat => {
                const isActive = this.selectedCategoryFilter === cat.id ? 'active' : '';
                // Usamos el emoji original definido en UI.js
                html += `
                    <div class="filter-chip ${isActive}" onclick="Finance.setCategoryFilter('${cat.id}')">
                        ${cat.icon} ${UI.t(cat.id)}
                    </div>
                `;
            });
        }
        html += `</div>`;
        return html;
    },

    // Acción al tocar un filtro
    setCategoryFilter(catId) {
        this.selectedCategoryFilter = catId;
        // Feedback vibración
        if(navigator.vibrate) navigator.vibrate(5);
        this.renderExpensesHistory(); // Recargar lista filtrada
    },

    // --- LÓGICA DE CIERRE DE MES (AUTOMÁTICO) ---
    checkMonthTransition() {
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        if (!Data.store.appControl) {
            Data.store.appControl = { lastActivePeriod: currentPeriod };
        }
        
        const lastPeriod = Data.store.appControl.lastActivePeriod || currentPeriod;

        if (currentPeriod !== lastPeriod) {
            console.log(`[Finance] Cambio de mes detectado: ${lastPeriod} -> ${currentPeriod}`);
            this.performMonthClose(lastPeriod);
            Data.store.appControl.lastActivePeriod = currentPeriod;
            Data.save();
        }
    },

    performMonthClose(periodString) {
        if (typeof Assistant !== 'undefined') {
            Assistant.addXP(100, "Nuevo Mes Iniciado");
            Assistant.updateMood();
        }
        
        if (typeof UI !== 'undefined') {
            UI.showSnackbar(`${UI.t('msg_updated')}: ${periodString}`);
        }
    },

    // --- CÁLCULOS FINANCIEROS (CORE) ---
    calculateMonthlySpent() {
        let total = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        // 1. Sumar Gastos
        if (Data.store.expenses) {
            Data.store.expenses.forEach(exp => {
                if (!exp.isInstallment) {
                    const d = new Date(exp.date);
                    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                        total += parseFloat(exp.amount);
                    }
                } else {
                    const { current } = this.calculateProgress(exp.date, exp.installments.total);
                    if (current > 0 && current <= exp.installments.total) {
                        total += parseFloat(exp.amount);
                    }
                }
            });
        }

        // 2. Sumar Listas Completadas
        if (Data.store.lists) {
            Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    total += parseFloat(l.total);
                }
            });
        }

        // 3. Sumar Suscripciones
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
        let months = (targetDate.getFullYear() - start.getFullYear()) * 12;
        months -= start.getMonth();
        months += targetDate.getMonth();
        
        const current = months + 1;
        
        return { current: current > 0 ? current : 1 };
    },

    calculateProgress(startDateTimestamp, totalInstallments) {
        return this.calculateProgressAtDate(startDateTimestamp, totalInstallments, new Date());
    },

    // --- HELPER PARA ICONOS (SOLUCIÓN DEFINITIVA) ---
    getCategoryIcon(catName) {
        // 1. Verificar si es una categoría especial del sistema
        if (catName === 'cat_market' || catName === UI.t('cat_market')) return '\uD83D\uDED2'; // 
        if (catName === 'tab_subs' || catName === 'cat_subs' || catName === UI.t('tab_subs')) return '\uD83D\uDCC5'; // 

        // 2. Buscar en UI.categories (donde están los emojis oficiales)
        if (typeof UI !== 'undefined' && UI.categories) {
            // Intentar por ID
            let found = UI.categories.find(c => c.id === catName);
            // Intentar por Nombre Traducido
            if (!found) found = UI.categories.find(c => UI.t(c.id) === catName);
            
            if (found) return found.icon; 
        }
        
        return '\uD83D\uDCE6'; //  Default
    },
    // --- RENDERIZADO HOME (WIDGETS) ---
    renderHomeWidgets() {
        // 1. GASTOS RECIENTES
        const recentContainer = document.getElementById('home-recent-expenses');
        if (recentContainer) {
            recentContainer.innerHTML = '';
            let allMovements = [];

            // A. Gastos
            if (Data.store.expenses) {
                Data.store.expenses.forEach(exp => {
                    allMovements.push({
                        type: 'expense', name: exp.desc, amount: parseFloat(exp.amount),
                        date: new Date(exp.date).getTime(), icon: this.getCategoryIcon(exp.category)
                    });
                });
            }
            // B. Listas (RESTORED ICON )
            if (Data.store.lists) {
                Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                    allMovements.push({
                        type: 'list', name: l.name, amount: parseFloat(l.total),
                        date: new Date(l.date).getTime(), icon: '\uD83D\uDED2' 
                    });
                });
            }
            // C. Suscripciones (RESTORED ICON )
            if (Data.store.subscriptions) {
                const now = new Date();
                Data.store.subscriptions.forEach(sub => {
                    let lastCharge = new Date(now.getFullYear(), now.getMonth(), sub.day);
                    if (lastCharge > now) lastCharge.setMonth(lastCharge.getMonth() - 1);
                    allMovements.push({
                        type: 'sub', name: sub.name, amount: parseFloat(sub.cost),
                        date: lastCharge.getTime(), icon: '\uD83D\uDCC5'
                    });
                });
            }

            allMovements.sort((a, b) => b.date - a.date);
            const last3 = allMovements.slice(0, 3);
            
            if (last3.length === 0) {
                 recentContainer.innerHTML = `<div style="text-align:center; font-size:12px; opacity:0.5; padding:10px;">Sin gastos recientes.</div>`;
            } else {
                last3.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'home-expense-row';
                    row.innerHTML = `
                        <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                            <span style="font-size:18px;">${item.icon}</span>
                            <div style="display:flex; flex-direction:column; overflow:hidden;">
                                <span style="font-weight:600; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</span>
                                <span style="font-size:10px; opacity:0.6;">${new Date(item.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div style="font-weight:700; font-size:13px; color:var(--text-color);">${UI.formatMoney(item.amount)}</div>
                    `;
                    recentContainer.appendChild(row);
                });
            }
        }
        
        // 2. TOP CATEGORÍAS (RESTORED FUNCTIONALITY)
        const catContainer = document.getElementById('home-top-categories');
        if (catContainer) {
            catContainer.innerHTML = '';
            const now = new Date();
            const curM = now.getMonth();
            const curY = now.getFullYear();
            const curD = now.getDate();
            const groups = {};
            let totalM = 0;

            // Sumar Gastos
            Data.store.expenses.forEach(e => {
                const d = new Date(e.date);
                if (!e.isInstallment && d.getMonth() === curM && d.getFullYear() === curY) {
                    const cat = e.category || 'Otros';
                    if(!groups[cat]) groups[cat] = 0;
                    groups[cat] += parseFloat(e.amount);
                    totalM += parseFloat(e.amount);
                }
            });
            // Sumar Subs
            if (Data.store.subscriptions) {
                Data.store.subscriptions.forEach(sub => {
                    if (curD >= sub.day) {
                        const cat = UI.t('tab_subs');
                        if(!groups[cat]) groups[cat] = 0;
                        groups[cat] += parseFloat(sub.cost);
                        totalM += parseFloat(sub.cost);
                    }
                });
            }
            // Sumar Listas
            if (Data.store.lists) {
                Data.store.lists.forEach(l => {
                    const d = new Date(l.date);
                    if (l.status === 'completed' && d.getMonth() === curM && d.getFullYear() === curY) {
                        const cat = UI.t('cat_market');
                        if(!groups[cat]) groups[cat] = 0;
                        groups[cat] += parseFloat(l.total);
                        totalM += parseFloat(l.total);
                    }
                });
            }

            const sorted = Object.entries(groups).sort((a,b) => b[1] - a[1]).slice(0, 3);
            
            if (sorted.length === 0) {
                catContainer.innerHTML = `<div style="text-align:center; font-size:12px; opacity:0.5; padding:10px;">Sin datos este mes.</div>`;
            } else {
                const colors = ['var(--primary)', 'var(--purple)', 'var(--warning)'];
                sorted.forEach(([cat, amount], i) => {
                    const pct = (amount / totalM) * 100;
                    const icon = this.getCategoryIcon(cat); // Usa el helper restaurado
                    const row = document.createElement('div');
                    row.className = 'home-cat-row';
                    row.innerHTML = `
                        <div style="width:35%; font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${icon} ${cat}
                        </div>
                        <div class="cat-bar-bg">
                            <div class="cat-bar-fill" style="width:${pct}%; background:${colors[i]}"></div>
                        </div>
                        <div style="font-size:11px; font-weight:700; width:15%; text-align:right;">${Math.round(pct)}%</div>
                    `;
                    catContainer.appendChild(row);
                });
            }
        }
    },

    // --- GRÁFICO DONUT (RESTORED) ---
    // --- GRÁFICO DONUT + LEYENDA (MODIFICADO) ---
    renderCategoryChart(container) {
        const categories = {};
        const [selYear, selMonth] = this.selectedHistoryMonth.split('-').map(Number);
        let totalMonth = 0;

        // 1. Sumar Gastos
        Data.store.expenses.forEach(e => {
            const d = new Date(e.date);
            let match = false;
            
            // Lógica de fechas (Normal vs Parcelado)
            if (!e.isInstallment && d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                match = true;
            } else if (e.isInstallment) {
                const target = new Date(selYear, selMonth - 1, 1);
                const { current } = this.calculateProgressAtDate(e.date, e.installments.total, target);
                if (current > 0 && current <= e.installments.total) match = true;
            }

            if (match) {
                // Limpieza básica de nombre (si tiene emoji pegado)
                let cat = e.category || UI.t('cat_other');
                if (cat.includes(' ') && cat.split(' ')[0].match(/\p{Emoji}/u)) {
                    cat = cat.split(' ').slice(1).join(' ');
                }
                
                if (!categories[cat]) categories[cat] = 0;
                categories[cat] += parseFloat(e.amount);
                totalMonth += parseFloat(e.amount);
            }
        });

        // 2. Sumar Listas
        if (Data.store.lists) {
            Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === (selMonth - 1) && d.getFullYear() === selYear) {
                    const c = UI.t('cat_market');
                    if (!categories[c]) categories[c] = 0;
                    categories[c] += parseFloat(l.total);
                    totalMonth += parseFloat(l.total);
                }
            });
        }

        // 3. Sumar Subs
        if (Data.store.subscriptions) {
            const daysInMonth = new Date(selYear, selMonth, 0).getDate();
            Data.store.subscriptions.forEach(s => {
                if (s.day <= daysInMonth) {
                    const c = UI.t('tab_subs');
                    if (!categories[c]) categories[c] = 0;
                    categories[c] += parseFloat(s.cost);
                    totalMonth += parseFloat(s.cost);
                }
            });
        }
        
        // --- RENDERIZADO ---
        if (totalMonth > 0) {
            const colors = ['#007AFF', '#FF9500', '#FF2D55', '#AF52DE', '#34C759', '#5AC8FA', '#8E8E93'];
            let currentDeg = 0;
            let gradientParts = [];
            
            // A. ORDENAR: De Mayor a Menor
            const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
            
            // B. GENERAR LEYENDA (AQUÍ ESTÁ LO QUE PEDISTE)
            let legendHTML = '<div style="margin-top:25px; width:100%; display:flex; flex-direction:column; gap:10px;">';
            
            sorted.forEach(([cat, amount], i) => {
                const deg = (amount / totalMonth) * 360;
                const pct = (amount / totalMonth) * 100;
                const col = colors[i % colors.length];
                
                // Usamos tu función getCategoryIcon existente para mantener los emojis
                const icon = this.getCategoryIcon(cat); 

                // Construcción del degradado del donut
                gradientParts.push(`${col} ${currentDeg}deg ${currentDeg + deg}deg`);
                currentDeg += deg;

                // Construcción de la fila de la leyenda
                legendHTML += `
                    <div style="display:flex; align-items:center; justify-content:space-between; font-size:13px;">
                        <div style="display:flex; align-items:center; gap:10px; width:45%; overflow:hidden;">
                            <div style="width:10px; height:10px; border-radius:50%; background:${col}; flex-shrink:0; box-shadow:0 0 5px ${col};"></div>
                            <span style="font-size:16px;">${icon}</span>
                            <span style="font-weight:600; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${cat}</span>
                        </div>
                        
                        <div style="flex:1; margin:0 12px; height:5px; background:rgba(0,0,0,0.05); border-radius:3px; overflow:hidden;">
                            <div style="height:100%; width:${pct}%; background:${col}; border-radius:3px;"></div>
                        </div>
                        
                        <div style="font-weight:800; color:var(--text-sec); width:14%; text-align:right;">${Math.round(pct)}%</div>
                    </div>
                `;
            });
            legendHTML += '</div>';

            const chartHTML = `
                <div class="glass-card" style="padding:25px; margin-bottom:20px; display:flex; flex-direction:column; align-items:center;">
                    <div style="font-size:12px; font-weight:700; color:var(--text-sec); margin-bottom:20px; text-transform:uppercase; letter-spacing:1px;">${UI.t('cat_distribution')}</div>
                    
                    <div style="position:relative; width:160px; height:160px; border-radius:50%; background: conic-gradient(${gradientParts.join(', ')});">
                        <div style="position:absolute; inset:22px; background:var(--glass-bg); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:inset 0 2px 10px rgba(0,0,0,0.05);">
                            <span style="font-size:10px; color:var(--text-sec); font-weight:700; text-transform:uppercase;">TOTAL</span>
                            <span style="font-size:19px; font-weight:900; color:var(--text-color); margin-top:2px;">${UI.formatMoney(totalMonth)}</span>
                        </div>
                    </div>
                    
                    ${legendHTML}
                </div>
            `;
            
            const div = document.createElement('div');
            div.innerHTML = chartHTML;
            container.appendChild(div);
        }
    },


    // --- HISTORIAL DETALLADO (CON FILTROS Y EMOJIS CORRECTOS) ---
    renderExpensesHistory() {
        const container = document.getElementById('expenses-history-list');
        if (!container) return;
        container.innerHTML = ''; 

        this.renderMonthSelector(container);
        this.renderCategoryChart(container); // Donut

        // Filtros (Chips)
        const filterContainer = document.createElement('div');
        filterContainer.innerHTML = this.renderFilterChips();
        container.appendChild(filterContainer);

        const [selYear, selMonth] = this.selectedHistoryMonth.split('-').map(Number);
        let allItems = [];

        // 1. Recolectar Datos
        Data.store.expenses.forEach(e => {
            let match = false;
            let date = e.date;
            const d = new Date(e.date);
            if(!e.isInstallment && d.getMonth() === (selMonth-1) && d.getFullYear() === selYear) match = true;
            else if (e.isInstallment) {
                const target = new Date(selYear, selMonth-1, 1);
                const {current} = this.calculateProgressAtDate(e.date, e.installments.total, target);
                if(current > 0 && current <= e.installments.total) { match = true; date = target.getTime(); }
            }
            if(match) {
                allItems.push({
                    type: 'expense', id: e.id, date: date, amount: e.amount, name: e.desc, 
                    rawCat: e.category, icon: this.getCategoryIcon(e.category)
                });
            }
        });

        // Listas (Icono )
        if(Data.store.lists) {
            Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                const d = new Date(l.date);
                if(d.getMonth() === (selMonth-1) && d.getFullYear() === selYear) {
                    allItems.push({ 
                        type: 'list', id: l.id, date: l.date, amount: l.total, name: l.name, 
                        rawCat: 'cat_market', icon: '\uD83D\uDED2' 
                    });
                }
            });
        }

        // Suscripciones (Icono )
        if(Data.store.subscriptions) {
            const daysInM = new Date(selYear, selMonth, 0).getDate();
            Data.store.subscriptions.forEach(s => {
                if(s.day <= daysInM) {
                    allItems.push({ 
                        type: 'sub', id: s.id, date: new Date(selYear, selMonth-1, s.day).getTime(), 
                        amount: s.cost, name: s.name, 
                        rawCat: 'cat_subs', icon: '\uD83D\uDCC5' 
                    });
                }
            });
        }

        // 2. Aplicar Filtro
        if(this.selectedCategoryFilter !== 'ALL') {
            allItems = allItems.filter(item => {
                const filter = this.selectedCategoryFilter;
                const itemName = UI.t(filter);
                // Si filtro es 'cat_market' dejamos pasar las listas
                if(item.type === 'list' && filter === 'cat_market') return true;
                // Si filtro es 'cat_subs' (o bills) dejamos pasar las subs
                if(item.type === 'sub' && (filter === 'cat_subs' || filter === 'cat_bills')) return true;

                return item.rawCat === filter || item.rawCat === itemName;
            });
        }

        // 3. Renderizar
        allItems.sort((a,b) => b.date - a.date);
        
        // Total Filtrado
        if(this.selectedCategoryFilter !== 'ALL') {
            const totalF = allItems.reduce((s,i)=>s+parseFloat(i.amount),0);
            const sumDiv = document.createElement('div');
            sumDiv.className = 'glass-card';
            sumDiv.style.cssText = "text-align:center; padding:15px; margin-bottom:10px;";
            sumDiv.innerHTML = `<div style="font-size:11px; font-weight:700; color:var(--text-sec);">${UI.t(this.selectedCategoryFilter).toUpperCase()}</div><div style="font-size:20px; font-weight:800;">${UI.formatMoney(totalF)}</div>`;
            container.appendChild(sumDiv);
        }

        if(allItems.length === 0) {
            container.innerHTML += `<div style="text-align:center; padding:30px; opacity:0.5; font-size:13px;">Sin movimientos con este filtro.</div>`;
        } else {
            allItems.forEach(item => {
                const row = document.createElement('div');
                row.className = 'item-row'; 
                const delFn = item.type === 'expense' ? `Finance.deleteExpense('${item.id}')` : (item.type === 'list' ? `Shopping.deleteList('${item.id}')` : `Finance.deleteSub('${item.id}')`);
                
                row.innerHTML = `
                    <div class="item-content-wrap">
                        <div style="width:40px; height:40px; background:var(--segment-bg); border-radius:12px; display:grid; place-items:center; font-size:22px; margin-right:15px; flex-shrink:0;">
                            ${item.icon}
                        </div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:600; font-size:14px; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                            <div style="font-size:11px; color:var(--text-sec);">${new Date(item.date).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align:right; display:flex; align-items:center; gap:10px;">
                            <div style="font-weight:700; font-size:14px; color:var(--text-color);">${UI.formatMoney(item.amount)}</div>
                            <button class="icon-btn" style="color:var(--danger); width:32px; height:32px;" onclick="${delFn}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(row);
            });
        }
    },

    renderMonthSelector(container) {
        const nav = document.createElement('div');
        nav.className = 'glass-card';
        nav.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 15px; margin-bottom:10px;';
        const [y, m] = this.selectedHistoryMonth.split('-').map(Number);
        
        nav.innerHTML = `
            <button class="icon-btn" onclick="Finance.changeMonth(-1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <div style="font-weight:800; font-size:15px; color:var(--text-color); text-transform:capitalize;">${UI.getMonthName(parseInt(m)-1)} ${y}</div>
            <button class="icon-btn" onclick="Finance.changeMonth(1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
        `;
        container.appendChild(nav);
    },

    changeMonth(offset) {
        let [y, m] = this.selectedHistoryMonth.split('-').map(Number);
        m += offset;
        if (m > 12) { m = 1; y++; } else if (m < 1) { m = 12; y--; }
        this.selectedHistoryMonth = `${y}-${String(m).padStart(2,'0')}`;
        this.renderExpensesHistory();
    },

    // --- RESTO DE FUNCIONES (CRUD - IGUAL AL ORIGINAL) ---
    openBudgetModal() {
        const modal = document.getElementById('modal-budget');
        document.getElementById('budget-input').value = Data.store.budget.limit || '';
        modal.classList.add('open');
        setTimeout(() => document.getElementById('budget-input').focus(), 100);
    },

    saveBudget() {
        const val = parseFloat(document.getElementById('budget-input').value);
        if (!isNaN(val)) {
            Data.store.budget.limit = val;
            Data.save();
            Main.closeModal('budget');
            UI.renderBudgetChart();
            this.renderHomeWidgets();
            UI.showSnackbar(UI.t('msg_updated'));
        }
    },

    openExpenseModal() {
        document.getElementById('exp-amount').value = '';
        document.getElementById('exp-desc').value = '';
        document.getElementById('exp-is-install').checked = false;
        this.toggleInstallmentInputs();
        if (typeof UI.renderCategoryChips === 'function') UI.renderCategoryChips();
        document.getElementById('modal-expense').classList.add('open');
    },

    toggleInstallmentInputs() {
        const isInstall = document.getElementById('exp-is-install').checked;
        const div = document.getElementById('installment-inputs');
        if (isInstall) div.classList.remove('hidden'); else div.classList.add('hidden');
    },

    saveExpense() {
        const val = parseFloat(document.getElementById('exp-amount').value);
        const desc = document.getElementById('exp-desc').value.trim() || UI.t('cat_other');
        const isInstall = document.getElementById('exp-is-install').checked;
        
        const catChip = document.querySelector('.cat-chip.selected');
        let category = UI.t('cat_other');
        if (catChip) category = catChip.dataset.id ? UI.t(catChip.dataset.id) : catChip.innerText.split(' ')[1];

        if (!val || val <= 0) return UI.showSnackbar(UI.t('msg_invalid_amount'));

        let finalAmount = val;
        let installData = null;

        if (isInstall) {
            const count = parseInt(document.getElementById('exp-inst-count').value) || 1;
            finalAmount = val / count; 
            installData = { total: count, originalTotal: val };
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
        this.renderHomeWidgets();
        
        const activeTab = document.querySelector('.segment-btn.active');
        if (activeTab && activeTab.id.includes('history')) this.renderExpensesHistory();
        if (activeTab && activeTab.id.includes('installments')) this.renderInstallments();
    },

    async deleteExpense(id) {
        if (await UI.confirm("confirm_del_exp", "confirm_desc")) {
            Data.store.expenses = Data.store.expenses.filter(e => e.id !== id);
            Data.save(); 
            this.setTab('history'); 
            UI.renderBudgetChart();
            this.renderHomeWidgets();
        }
    },

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
            Data.store.subscriptions.push({ id: Date.now().toString(), name, cost, day });
            Data.save();
            Main.closeModal('sub');
            this.renderSubscriptions();
            UI.renderBudgetChart();
            this.renderHomeWidgets();
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
                <div style="font-weight:800; margin-right:15px; color:var(--text-color);">${UI.formatMoney(sub.cost)}</div>
                <button class="icon-btn" style="color:var(--danger); width:36px; height:36px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            `;
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
            this.renderHomeWidgets();
        }
    },

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
                    <button class="text-btn-small" style="color:var(--danger);">${UI.t('delete')}</button>
                </div>
            `;
            div.querySelector('button').onclick = () => this.deleteExpense(inst.id);
            container.appendChild(div);
        });
    }
};
