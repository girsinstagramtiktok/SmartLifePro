/* =========================================
   SMART LIFE PRO - FINANCE MODULE (V9.9 - FINAL LOGIC RESTORED)
   Autor: A_True_Alpha
   ========================================= */

const Finance = {
    // --- ESTADO INTERNO ---
    selectedHistoryMonth: null, 
    selectedCategoryFilter: 'ALL', // Estado del filtro de categorías
    chartDisplayMode: 'percent',
    subscriptionSort: 'date',
    // Variable temporal para la foto (NUEVO)
    tempPhotoData: null, 

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

    // Accesos directos del inicio. Cada movimiento abre su sección real.
    openHomeMovements(type = 'expense') {
        if (type === 'list') {
            Main.router('history');
            if (typeof Shopping !== 'undefined' && typeof Shopping.setHistoryMode === 'function') Shopping.setHistoryMode('lists');
            return;
        }
        Main.router('finance');
        this.setTab(type === 'sub' ? 'subs' : 'history');
    },

    // Muestra el gráfico del mes y, si procede, el filtro de la categoría tocada.
    openHomeCategory(categoryId = null) {
        if (categoryId === 'cat_subs') {
            this.openHomeMovements('sub');
            return;
        }
        const now = new Date();
        this.selectedHistoryMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        this.selectedCategoryFilter = categoryId && typeof UI !== 'undefined' && UI.categories.some(c => c.id === categoryId) ? categoryId : 'ALL';
        Main.router('finance');
        this.setTab('history');
        const financeScroll = document.querySelector('#view-finance .scroll-content');
        if (financeScroll) financeScroll.scrollTop = 0;
    },

    // --- GENERADOR DE CHIPS DE FILTRO ---
    renderFilterChips() {
        let html = `<div class="filter-scroll-container">`;

        // 1. Chip "Todo"
        const allActive = this.selectedCategoryFilter === 'ALL' ? 'active' : '';
        html += `<div class="filter-chip ${allActive}" onclick="Finance.setCategoryFilter('ALL')">Todo</div>`;

        // 2. Chips de Categorías (Desde UI.categories)
        if (typeof UI !== 'undefined' && UI.categories) {
            UI.categories.forEach(cat => {
                const isActive = this.selectedCategoryFilter === cat.id ? 'active' : '';
                html += `
                    <div class="filter-chip ${isActive}" onclick="Finance.setCategoryFilter('${cat.id}')">
                        ${UI.categoryIcon(cat.id)} ${UI.t(cat.id)}
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
        if(navigator.vibrate) navigator.vibrate(5);
        this.renderExpensesHistory(); 
    },
    toggleChartMode() {
        this.chartDisplayMode = this.chartDisplayMode === 'percent' ? 'amount' : 'percent';
        if(navigator.vibrate) navigator.vibrate(10);
        this.renderExpensesHistory(); 
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
        
        // Un pago aplazado no inicia sus cuotas antes de su mes programado.
        return { current };
    },

    calculateProgress(startDateTimestamp, totalInstallments) {
        return this.calculateProgressAtDate(startDateTimestamp, totalInstallments, new Date());
    },

    // --- HELPER PARA ICONOS ---
    getCategoryIcon(catName) {
        if (catName === 'cat_market' || catName === UI.t('cat_market')) return UI.categoryIcon('cat_market'); 
        if (catName === 'tab_subs' || catName === 'cat_subs' || catName === UI.t('tab_subs')) return UI.categoryIcon('cat_subs'); 

        if (typeof UI !== 'undefined' && UI.categories) {
            let found = UI.categories.find(c => c.id === catName);
            if (!found) found = UI.categories.find(c => UI.t(c.id) === catName);
            if (found) return UI.categoryIcon(found.id); 
        }
        return UI.categoryIcon('cat_other'); 
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
                    if (new Date(exp.date).getTime() > Date.now()) return;
                    allMovements.push({
                        type: 'expense', name: exp.desc, amount: parseFloat(exp.amount),
                        date: new Date(exp.date).getTime(), icon: this.getCategoryIcon(exp.category)
                    });
                });
            }
            // B. Listas
            if (Data.store.lists) {
                Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                    allMovements.push({
                        type: 'list', name: l.name, amount: parseFloat(l.total),
                        date: new Date(l.date).getTime(), icon: UI.categoryIcon('cat_market') 
                    });
                });
            }
            // C. Suscripciones
            if (Data.store.subscriptions) {
                const now = new Date();
                Data.store.subscriptions.forEach(sub => {
                    let lastCharge = new Date(now.getFullYear(), now.getMonth(), sub.day);
                    if (lastCharge > now) lastCharge.setMonth(lastCharge.getMonth() - 1);
                    allMovements.push({
                        type: 'sub', name: sub.name, amount: parseFloat(sub.cost),
                        date: lastCharge.getTime(), icon: UI.categoryIcon('cat_subs')
                    });
                });
            }

            allMovements.sort((a, b) => b.date - a.date);
            const last3 = allMovements.slice(0, 2);
            
            if (last3.length === 0) {
                 recentContainer.innerHTML = `<div style="text-align:center; font-size:12px; opacity:0.5; padding:10px;">Sin gastos recientes.</div>`;
            } else {
                last3.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'home-expense-row';
                    row.tabIndex = 0;
                    row.setAttribute('role', 'button');
                    row.setAttribute('aria-label', `Abrir ${item.name} en su historial`);
                    const openMovement = () => this.openHomeMovements(item.type);
                    row.addEventListener('click', openMovement);
                    row.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openMovement(); } });
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
        
        // 2. TOP CATEGORÍAS
        const catContainer = document.getElementById('home-top-categories');
        if (catContainer) {
            catContainer.innerHTML = '';
            const now = new Date();
            const curM = now.getMonth();
            const curY = now.getFullYear();
            const curD = now.getDate();
            const groups = {};
            let totalM = 0;

            Data.store.expenses.forEach(e => {
                const d = new Date(e.date);
                if (!e.isInstallment && d.getMonth() === curM && d.getFullYear() === curY) {
                    const cat = e.category || 'Otros';
                    if(!groups[cat]) groups[cat] = 0;
                    groups[cat] += parseFloat(e.amount);
                    totalM += parseFloat(e.amount);
                }
            });
            
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

            const sorted = Object.entries(groups).sort((a,b) => b[1] - a[1]).slice(0, 2);
            
            if (sorted.length === 0) {
                catContainer.innerHTML = `<div style="text-align:center; font-size:12px; opacity:0.5; padding:10px;">Sin datos este mes.</div>`;
            } else {
                const colors = ['var(--primary)', 'var(--purple)', 'var(--warning)'];
                sorted.forEach(([cat, amount], i) => {
                    const pct = (amount / totalM) * 100;
                    const icon = this.getCategoryIcon(cat);
                    const row = document.createElement('div');
                    row.className = 'home-cat-row';
                    const category = UI.categories.find(c => c.id === cat || UI.t(c.id) === cat);
                    const catId = category ? category.id : (cat === UI.t('tab_subs') ? 'cat_subs' : null);
                    row.tabIndex = 0;
                    row.setAttribute('role', 'button');
                    row.setAttribute('aria-label', `Ver gastos de ${cat}`);
                    const openCategory = () => this.openHomeCategory(catId);
                    row.addEventListener('click', openCategory);
                    row.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openCategory(); } });
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

    // --- GRÁFICO DONUT + LEYENDA ---
    renderCategoryChart(container) {
        const categories = {};
        const [selYear, selMonth] = this.selectedHistoryMonth.split('-').map(Number);
        let totalMonth = 0;

        Data.store.expenses.forEach(e => {
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
                let cat = e.category || UI.t('cat_other');
                if (cat.includes(' ') && cat.split(' ')[0].match(/\p{Emoji}/u)) {
                    cat = cat.split(' ').slice(1).join(' ');
                }
                
                if (!categories[cat]) categories[cat] = 0;
                categories[cat] += parseFloat(e.amount);
                totalMonth += parseFloat(e.amount);
            }
        });

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
        
        if (totalMonth > 0) {
            const colors = ['#007AFF', '#FF9500', '#FF2D55', '#AF52DE', '#34C759', '#5AC8FA', '#8E8E93'];
            let currentDeg = 0;
            let gradientParts = [];
            
            const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
            
            let legendHTML = '<div style="margin-top:25px; width:100%; display:flex; flex-direction:column; gap:10px;">';
            
            sorted.forEach(([cat, amount], i) => {
                const deg = (amount / totalMonth) * 360;
                const pct = (amount / totalMonth) * 100;
                const col = colors[i % colors.length];
                const icon = this.getCategoryIcon(cat); 

                // <--- NUEVO: Valor a mostrar según el modo seleccionado --->
                const displayValue = this.chartDisplayMode === 'percent' ? `${Math.round(pct)}%` : UI.formatMoney(amount);

                gradientParts.push(`${col} ${currentDeg}deg ${currentDeg + deg}deg`);
                currentDeg += deg;

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
                        
                        <div style="font-weight:800; color:var(--text-sec); text-align:right;">${displayValue}</div>
                    </div>
                `;
            });
            legendHTML += '</div>';

            // <--- NUEVO: Título con botón para alternar --->
            const toggleText = this.chartDisplayMode === 'percent' ? 'Ver Montos' : 'Ver %';

            const chartHTML = `
                <div class="glass-card" style="padding:25px; margin-bottom:20px; display:flex; flex-direction:column; align-items:center;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:20px;">
                        <div style="font-size:12px; font-weight:700; color:var(--text-sec); text-transform:uppercase; letter-spacing:1px;">${UI.t('cat_distribution')}</div>
                        <button class="text-btn-small" onclick="Finance.toggleChartMode()" style="background:var(--input-bg); padding:4px 10px; font-size:11px; border-radius:8px;">
                            ${toggleText} 🔁
                        </button>
                    </div>
                    
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
    // --- HISTORIAL DETALLADO ---
    renderExpensesHistory() {
        const container = document.getElementById('expenses-history-list');
        if (!container) return;
        container.innerHTML = ''; 

        this.renderMonthSelector(container);
        this.renderCategoryChart(container);

        const filterContainer = document.createElement('div');
        filterContainer.innerHTML = this.renderFilterChips();
        container.appendChild(filterContainer);

        const [selYear, selMonth] = this.selectedHistoryMonth.split('-').map(Number);
        let allItems = [];

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
                // DETECTAR EXTRAS (FOTO/LINK) PARA MOSTRAR ICONO
                let extrasIcon = '';
                if (e.photo) extrasIcon += ' ';
                if (e.link) extrasIcon += ' ';

                allItems.push({
                    type: 'expense', id: e.id, date: date, amount: e.amount, name: e.desc + ' ' + extrasIcon, 
                    rawCat: e.category, icon: this.getCategoryIcon(e.category)
                });
            }
        });

        if(Data.store.lists) {
            Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                const d = new Date(l.date);
                if(d.getMonth() === (selMonth-1) && d.getFullYear() === selYear) {
                    allItems.push({ 
                        type: 'list', id: l.id, date: l.date, amount: l.total, name: l.name, 
                        rawCat: 'cat_market', icon: UI.categoryIcon('cat_market') 
                    });
                }
            });
        }

        if(Data.store.subscriptions) {
            const daysInM = new Date(selYear, selMonth, 0).getDate();
            Data.store.subscriptions.forEach(s => {
                if(s.day <= daysInM) {
                    allItems.push({ 
                        type: 'sub', id: s.id, date: new Date(selYear, selMonth-1, s.day).getTime(), 
                        amount: s.cost, name: s.name, 
                        rawCat: 'cat_subs', icon: UI.categoryIcon('cat_subs') 
                    });
                }
            });
        }

        if(this.selectedCategoryFilter !== 'ALL') {
            allItems = allItems.filter(item => {
                const filter = this.selectedCategoryFilter;
                const itemName = UI.t(filter);
                if(item.type === 'list' && filter === 'cat_market') return true;
                if(item.type === 'sub' && (filter === 'cat_subs' || filter === 'cat_bills')) return true;
                return item.rawCat === filter || item.rawCat === itemName;
            });
        }

        allItems.sort((a,b) => b.date - a.date);
        
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
                    <div class="item-content-wrap" onclick="Finance.openExpenseDetail('${item.id}')" style="cursor:pointer;">
                        <div style="width:40px; height:40px; background:var(--segment-bg); border-radius:12px; display:grid; place-items:center; font-size:22px; margin-right:15px; flex-shrink:0;">
                            ${item.icon}
                        </div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:600; font-size:14px; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                            <div style="font-size:11px; color:var(--text-sec);">${new Date(item.date).toLocaleDateString()}</div>
                        </div>
                        
                        <div style="font-weight:700; font-size:14px; color:var(--text-color); margin-right:10px;">${UI.formatMoney(item.amount)}</div>
                    </div>

                    <button class="icon-btn" style="color:var(--danger); width:32px; height:32px; margin-left:5px;" onclick="${delFn}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                `;
                // Ajustamos estilo del row padre para alinear
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.justifyContent = 'space-between';

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

    // --- RESTO DE FUNCIONES (CRUD) ---
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
        
        // LIMPIEZA DE NUEVOS CAMPOS
        document.getElementById('exp-link').value = ''; 
        this.clearPhoto();
        const postingMonth = document.getElementById('exp-posting-month');
        if (postingMonth) {
            postingMonth.querySelector('option[value="original"]')?.remove();
            postingMonth.value = 'current';
        }
        this.updateExpensePaymentDateVisibility();
        this.editingOriginalDate = null;

        document.getElementById('exp-is-install').checked = false;
        this.toggleInstallmentInputs();
        if (typeof UI.renderCategoryChips === 'function') UI.renderCategoryChips();
        document.getElementById('modal-expense').classList.add('open');
    },

    // Solo los pagos previstos para el mes siguiente muestran el calendario.
    updateExpensePaymentDateVisibility() {
        const mode = document.getElementById('exp-posting-month')?.value;
        const wrapper = document.getElementById('exp-payment-date-container');
        const input = document.getElementById('exp-payment-date');
        if (!wrapper || !input) return;
        wrapper.classList.toggle('hidden', mode !== 'next');
        input.required = mode === 'next';
        if (mode !== 'next') return;

        const today = new Date();
        const first = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        const toDateField = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        input.min = toDateField(first);
        input.max = toDateField(last);
        // No copiar silenciosamente el dia de hoy al siguiente mes.
        if (!input.value || input.value < input.min || input.value > input.max) input.value = input.min;
    },

    // Acepta fechas civiles locales y rechaza cambios de zona horaria o 31/02.
    parseExpensePaymentDate(value) {
        const found = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
        if (!found) return null;
        const [, y, m, day] = found.map(Number);
        const d = new Date(y, m - 1, day, 12, 0, 0, 0);
        if (d.getFullYear() !== y || d.getMonth() !== m - 1 || d.getDate() !== day) return null;
        return d;
    },

    toggleInstallmentInputs() {
        const isInstall = document.getElementById('exp-is-install').checked;
        const div = document.getElementById('installment-inputs');
        if (isInstall) div.classList.remove('hidden'); else div.classList.add('hidden');
    },
    
    // --- LÓGICA DE FOTOS CON COMPRESIÓN ---
    handlePhotoSelect(input) {
        const file = input.files[0];
        if (file) {
            const icon = document.getElementById('exp-photo-icon');
            // Icono de "Cargando" (Reloj de arena)
            if(icon) icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4"/><path d="M4 8h16"/><path d="M4 16h16"/></svg>';
            
            this.compressImage(file, 800, 0.7).then(base64 => {
                this.tempPhotoData = base64;
                const img = document.getElementById('exp-photo-img');
                if(img) img.src = base64;
                
                const container = document.getElementById('exp-photo-preview-container');
                if(container) container.classList.remove('hidden');
                
                // Icono de "éxito" (Check)
                if(icon) icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            }).catch(err => {
                console.error("Error foto", err);
                // Icono de "Error" (X)
                if(icon) icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            });
        }
    },

    clearPhoto() {
        this.tempPhotoData = null;
        const input = document.getElementById('exp-photo-input');
        if(input) input.value = '';
        
        const container = document.getElementById('exp-photo-preview-container');
        if(container) container.classList.add('hidden');
        
        const icon = document.getElementById('exp-photo-icon');
        // RESTAURAR LA CÁMARA ORIGINAL (IMPORTANTE)
        if(icon) icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>';
    },

    compressImage(file, maxWidth, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const elem = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                    elem.width = width;
                    elem.height = height;
                    const ctx = elem.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(elem.toDataURL('image/jpeg', quality));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    },

    saveExpense() {
        const val = parseFloat(document.getElementById('exp-amount').value);
        const desc = document.getElementById('exp-desc').value.trim() || UI.t('cat_other');
        const isInstall = document.getElementById('exp-is-install').checked;
        const linkVal = document.getElementById('exp-link').value.trim();
        const postingMonth = document.getElementById('exp-posting-month')?.value || 'current';
        let expenseDate = postingMonth === 'original' && this.editingOriginalDate
            ? this.editingOriginalDate : Date.now();
        if (postingMonth === 'next') {
            const now = new Date();
            const chosen = this.parseExpensePaymentDate(document.getElementById('exp-payment-date')?.value);
            if (!chosen || chosen.getFullYear() !== new Date(now.getFullYear(), now.getMonth() + 1, 1).getFullYear()
                || chosen.getMonth() !== new Date(now.getFullYear(), now.getMonth() + 1, 1).getMonth()) {
                return UI.showSnackbar(UI.t('exp_invalid_payment_date'));
            }
            expenseDate = chosen.getTime();
        }

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
            date: expenseDate,
            recordedAt: Date.now(),
            scheduled: postingMonth === 'next' || (postingMonth === 'original' && !!this.editingOriginalScheduled),
            amount: finalAmount,
            desc: desc,
            category: category,
            isInstallment: isInstall,
            installments: installData, 
            link: linkVal,
            photo: this.tempPhotoData
        };

        if (!Data.store.expenses) Data.store.expenses = [];
        Data.store.expenses.push(newExpense);
        Data.save();

        if (typeof Assistant !== 'undefined') {
             Assistant.updateMood(); 
             Assistant.updateHomeXP();
             Assistant.reactToEvent('expense_added', { amount: finalAmount });
        }

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
            
            const activeTab = document.querySelector('.segment-btn.active');
            if (activeTab && activeTab.id.includes('history')) this.renderExpensesHistory();
            
            UI.renderBudgetChart();
            this.renderHomeWidgets();

            if (typeof Assistant !== 'undefined') {
                Assistant.updateMood();
                Assistant.updateHomeXP();
            }
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
            
            if (typeof Assistant !== 'undefined') {
                Assistant.reactToEvent('sub_added', null);
            }

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

        const sortBar = document.createElement('div');
        sortBar.className = 'subscription-sort-bar';
        sortBar.innerHTML = `<label for="subs-sort">Ordenar por</label><select id="subs-sort" onchange="Finance.subscriptionSort=this.value; Finance.renderSubscriptions()"><option value="date">Fecha de cobro</option><option value="value">Valor</option><option value="name">Orden alfabético</option></select>`;
        sortBar.querySelector('select').value = this.subscriptionSort;
        container.appendChild(sortBar);
        const subscriptions = [...Data.store.subscriptions].sort((a,b) => this.subscriptionSort === 'value' ? (parseFloat(a.cost)||0)-(parseFloat(b.cost)||0) : this.subscriptionSort === 'name' ? String(a.name).localeCompare(String(b.name), undefined, {sensitivity:'base'}) : (parseInt(a.day,10)||0)-(parseInt(b.day,10)||0));
        let totalCost = 0;

        subscriptions.forEach(sub => {
            totalCost += parseFloat(sub.cost)||0;
            
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

        // --- NUEVO: Tarjeta de TOTAL ---
        const totalDiv = document.createElement('div');
        totalDiv.className = 'glass-card';
        totalDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:15px; margin-top:15px; border:2px solid var(--primary);';
        totalDiv.innerHTML = `
            <div style="font-weight:800; color:var(--text-color);">Total Mensual</div>
            <div style="font-size:18px; font-weight:900; color:var(--primary);">${UI.formatMoney(totalCost)}</div>
        `;
        container.appendChild(totalDiv);
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
            const pct = (Math.max(0, current) / inst.installments.total) * 100;
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
                    <span>${current <= 0 ? 'Comienza el ' + new Date(inst.date).toLocaleDateString() : UI.t('inst_current') + ' <strong>' + current + '</strong>/' + inst.installments.total}</span>
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
    },
    
    // --- VISOR DE DETALLES (NUEVO) ---
    openExpenseDetail(id) {
        const expense = Data.store.expenses.find(e => e.id === id);
        if (!expense) return;

        // 1. Rellenar Textos Básicos
        document.getElementById('det-exp-desc').innerText = expense.desc;
        document.getElementById('det-exp-amount').innerText = UI.formatMoney(expense.amount);
        document.getElementById('det-exp-date').innerText = new Date(expense.date).toLocaleString();
        
        // Categoría (con emoji si es posible)
        const catName = expense.category || UI.t('cat_other');
        const icon = this.getCategoryIcon(catName);
        document.getElementById('det-exp-cat').innerText = `${icon} ${catName}`;

        // 2. Manejar FOTO
        const imgContainer = document.getElementById('det-exp-photo-container');
        const img = document.getElementById('det-exp-img');
        if (expense.photo) {
            img.src = expense.photo;
            imgContainer.classList.remove('hidden');
        } else {
            imgContainer.classList.add('hidden');
            img.src = '';
        }

        // 3. Manejar LINK
        const linkBtn = document.getElementById('det-exp-link-btn');
        if (expense.link) {
            let url = expense.link;
            // Si no tiene http, se lo ponemos para que funcione el link
            if (!url.startsWith('http')) url = 'https://' + url;
            
            linkBtn.href = url;
            linkBtn.classList.remove('hidden');
            // Cambiar texto si parece ser solo texto y no url
            if(!url.includes('.')) {
                 linkBtn.removeAttribute('href'); // Es solo texto (lugar), no link clickeable
                 linkBtn.querySelector('span').innerText = ` ${expense.link}`;
            } else {
                 linkBtn.querySelector('span').innerText = ` Ir al enlace`;
            }
        } else {
            linkBtn.classList.add('hidden');
        }

        // 4. Configurar Botón de Borrar
        const delBtn = document.getElementById('det-exp-delete-btn');
        delBtn.onclick = () => {
            this.deleteExpense(id);
            Main.closeModal('expense-detail');
        };

        // 5. Abrir Modal
        document.getElementById('modal-expense-detail').classList.add('open');
    },
    
    // --- SMART VOICE & MODAL INTELIGENTE ---

    openSmartExpenseModal(amount, desc, categoryId, options = {}) {
        // 1. Abrir modal normal
        this.openExpenseModal();

        // 2. Rellenar campos con un pequeño delay
        setTimeout(() => {
            const amountInput = document.getElementById('exp-amount');
            const descInput = document.getElementById('exp-desc');
            
            if (amountInput) amountInput.value = amount || '';
            if (descInput) descInput.value = desc;

            // 3. Seleccionar el Chip de categoría visualmente
            const chips = document.querySelectorAll('.cat-chip');
            chips.forEach(chip => {
                chip.classList.remove('selected');
                chip.style.background = 'var(--glass-bg)';
                chip.style.color = 'var(--text-color)';
                
                if (chip.dataset.id === categoryId) {
                    chip.classList.add('selected');
                    chip.style.background = 'var(--primary)';
                    chip.style.color = 'white';
                }
            });
            
            UI.showSnackbar("Gasto procesado ");
        }, 100);
    },

    async startSmartyExpenseVoice() {
        const btn = document.getElementById('expense-smarty-btn');
        const original = btn ? btn.innerHTML : '';
        try {
            if (btn) { btn.disabled = true; btn.innerHTML = '🎙'; }
            if (typeof UI !== 'undefined') UI.showSnackbar('🎙 Habla: por ejemplo, "gaste 35 reales en gasolina"');

            const transcript = await GroqAI.listenOnce();
            if (btn) btn.innerHTML = '⏳';

            const categories = ['cat_market','cat_leisure','cat_transport','cat_clothes','cat_health','cat_bills','cat_travel','cat_beauty','cat_other'];
            const schema = {
                type: 'object',
                properties: {
                    amount: { type: 'number' },
                    desc: { type: 'string' },
                    category: { type: 'string', enum: categories },
                    isInstallment: { type: 'boolean' },
                    installmentCount: { type: 'integer' }
                },
                required: ['amount','desc','category','isInstallment','installmentCount'],
                additionalProperties: false
            };

            const lang = Data?.store?.settings?.lang || 'es';
            const instructions = `You extract one personal expense from natural speech for a finance app. The user language is ${lang}. Return the amount actually stated, a short clean description in the user's language, and exactly one allowed category id. If installments are not explicitly mentioned set isInstallment=false and installmentCount=1. Do not invent an amount. Allowed categories: ${categories.join(', ')}.`;
            const result = await GroqAI.textJSON(instructions, transcript, 'smart_expense', schema, { maxTokens: 500 });

            const amount = Number(result.amount);
            if (!Number.isFinite(amount) || amount <= 0) throw new Error('INVALID_SMART_EXPENSE');
            const category = categories.includes(result.category) ? result.category : 'cat_other';
            const desc = String(result.desc || '').trim() || 'Gasto';
            const installmentCount = result.isInstallment ? Math.max(2, Number(result.installmentCount) || 2) : 1;

            this.openSmartExpenseModal(amount, desc, category, {
                fromSmarty: true,
                installmentCount,
                installmentsPaid: 0
            });
        } catch (err) {
            console.error('Smarty expense voice:', err);
            const msg = err?.message === 'INVALID_SMART_EXPENSE'
                ? 'Smarty no encontro un monto valido. Puedes registrarlo manualmente.'
                : GroqAI.friendlyError(err);
            if (msg && typeof UI !== 'undefined') UI.showSnackbar(msg);
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = original || '✨ Smarty'; }
        }
    },

    // --- FUNCIÓN DEL BOTÓN (BOTÓN DOCK) ---
        // --- FUNCIÓN DEL BOTÓN (LÓGICA RESTAURADA DE LA VERSIÓN ANTIGUA) ---
    initSmartButton() {
        const btn = document.getElementById('dock-plus-btn');
        const overlay = document.getElementById('listening-overlay');
        const mascotImg = document.getElementById('listening-mascot-img');
        
        if (!btn) return;

        // 1. Limpieza segura de eventos previos
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        const activeBtn = document.getElementById('dock-plus-btn');

        let pressTimer;
        let isLongPress = false;
        let recognition = null;

        // 2. CONFIGURACIÓN DE VOZ (Igual que antes)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            const userLang = (Data && Data.store && Data.store.settings) ? Data.store.settings.lang : 'es';
            recognition.lang = (userLang === 'pt') ? 'pt-BR' : (userLang === 'en' ? 'en-US' : 'es-ES');
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                this.processSmartText(text);
            };
            
            recognition.onerror = () => stopListeningUI();
            recognition.onend = () => {
                if(overlay && overlay.classList.contains('active')) stopListeningUI();
            };
        }

        // 3. UI HELPERS (Funciones de control)
        const startListeningUI = () => {
            if (!recognition) {
                UI.showSnackbar("Tu navegador no soporta voz");
                return;
            }
            isLongPress = true; // Marcamos que es voz
            
            // Lógica visual (Mascota y Overlay)
            let skinPath = '';
            if (typeof Assistant !== 'undefined' && Data.store && Data.store.gamification) {
                const currentId = Data.store.gamification.currentSkin || 'default';
                const skinDef = Assistant.skinsDef ? Assistant.skinsDef.find(s => s.id === currentId) : null;
                if (skinDef) skinPath = skinDef.path;
            }
            if (mascotImg) {
                mascotImg.src = skinPath + 'listening.png';
                mascotImg.onerror = function() { this.src = 'idle.png'; }; 
            }
            
            if (overlay) overlay.classList.add('active');
            if(navigator.vibrate) navigator.vibrate(50);
            activeBtn.classList.add('listening');
            try { recognition.start(); } catch(e) {}
        };

        const stopListeningUI = () => {
            clearTimeout(pressTimer);
            if (overlay) overlay.classList.remove('active');
            activeBtn.classList.remove('listening');
            
            if (isLongPress) {
                // Si era toque largo (Voz), paramos el reconocimiento
                if (recognition) try { recognition.stop(); } catch(e) {}
            } else {
                // --- AQUÍ ESTÁ LA CLAVE RESTAURADA ---
                // Si NO fue toque largo, significa que fue un CLIC CORTO.
                // Abrimos el menú manualmente aquí.
                Main.openAddMenu(); 
            }
            isLongPress = false;
        };

        // 4. EVENTOS (LA LÓGICA ANTIGUA QUE FUNCIONABA)
        const startEvent = (e) => {
            // ESTA LÍNEA ES LA MAGIA: Evita conflictos y menús contextuales
            if(e.cancelable) e.preventDefault(); 
            
            isLongPress = false;
            // Esperar 600ms para activar voz. Si sueltas antes, el timer no salta.
            pressTimer = setTimeout(startListeningUI, 600); 
        };

        // Asignamos los eventos tal cual estaban en tu versión vieja
        
        // Móvil
        activeBtn.addEventListener('touchstart', startEvent, {passive: false});
        activeBtn.addEventListener('touchend', stopListeningUI);
        
        // PC
        activeBtn.addEventListener('mousedown', startEvent);
        activeBtn.addEventListener('mouseup', stopListeningUI);
        
        // Seguridad: Si sacas el dedo/mouse del botón, cancelamos todo
        activeBtn.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
            if(isLongPress) stopListeningUI();
        });
        
        console.log("Botón Smarty restaurado con lógica clásica.");
    },





    // --- PROCESADOR DE TEXTO ---
        // --- PROCESADOR DE TEXTO (VERSIÓN COMPLETA ORIGINAL) ---
    processSmartText(text) {
        console.log("Voz Original:", text);
        
        // 1. Limpieza inicial
        let cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,:;?!¿¡"'-]/g, ' ');

        // 2. Extraer Monto
        const amountMatch = cleanText.match(/(\d+([.,]\d+)?)/);
        let amount = 0;
        if (amountMatch) {
            amount = parseFloat(amountMatch[0].replace(',', '.'));
            cleanText = cleanText.replace(amountMatch[0], '');
        }

        // 3. Detectar Categoría
        let categoryId = 'cat_other'; 
        if (typeof UI !== 'undefined' && UI.categories) {
            for (const cat of UI.categories) {
                const catName = UI.t(cat.id).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (cleanText.includes(catName)) {
                    categoryId = cat.id;
                    cleanText = cleanText.replace(catName, '');
                    break; 
                }
            }
        }

        // 4. LA LISTA NEGRA EXTENSA (RESTAURADA)
        const blackList = [
            // ================= ESPAÑOL =================
            // Pronombres
            'me', 'te', 'se', 'le', 'nos', 'mi', 'tu', 'su', 'mis', 'tus', 'sus',
            'yo', 'nosotros', 'ellos', 'ellas', 'ustedes',
            // Verbos (Sin tilde)
            'gaste', 'gasto', 'gastamos', 'gastaron', 'gastar', 'gastado',
            'compre', 'compro', 'compramos', 'compraron', 'comprar', 'comprado',
            'pague', 'pago', 'pagamos', 'pagaron', 'pagar', 'pagado',
            'registra', 'registrar', 'registro', 'anota', 'anotar', 'anote', 'agendar', 'guardar',
            'nuevo', 'crear', 'anadir', 'agregar', 'poner',
            'costo', 'valio', 'salio', 'cuesta', 'fue', 'es', 'son', 'fui', 'fuimos',
            // Consumo
            'comi', 'comimos', 'comieron', 'comer', 'comiendo', 'comida',
            'bebi', 'bebimos', 'bebieron', 'beber', 'bebiendo',
            'tome', 'tomamos', 'tomaron', 'tomar', 'tomando',
            'almorce', 'almorzamos', 'almorzar', 'almuerzo',
            'cene', 'cenamos', 'cenar', 'cena',
            'desayune', 'desayunamos', 'desayunar', 'desayuno',
            'merende', 'merendar', 'merienda',
            'sali', 'salimos', 'salir', 'salida',
            // Artículos/Conectores
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
            'de', 'del', 'al', 'a', 'en', 'con', 'por', 'para', 'sin', 'sobre',
            'y', 'o', 'u', 'e', 'ni', 'que', 'pero', 'mas',

            // ================= ENGLISH (COMPLETO) =================
            // Pronouns
            'i', 'me', 'my', 'mine', 'you', 'your', 'yours', 
            'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its',
            'we', 'us', 'our', 'ours', 'they', 'them', 'their', 'theirs',
            'myself', 'yourself',
            // Action Verbs
            'spend', 'spent', 'spending',
            'buy', 'bought', 'buying',
            'pay', 'paid', 'paying', 'payment',
            'cost', 'costs', 'costing', 'costed',
            'get', 'got', 'gotten', 'getting', 
            'order', 'ordered', 'ordering',   
            'purchase', 'purchased', 'purchasing',
            'add', 'new', 'register', 'save', 'insert', 'put',
            'go', 'went', 'gone', 'going',    
            'took', 'take', 'taking',         
            // Consumption Verbs
            'eat', 'ate', 'eating', 'eaten',
            'drink', 'drank', 'drinking', 'drunk',
            'have', 'had', 'having',          
            'lunch', 'dinner', 'breakfast', 'snack',
            // Articles & Connectors
            'the', 'a', 'an', 'some', 'any', 'this', 'that', 'these', 'those',
            'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'about',
            'into', 'onto', 'off', 'out', 'up', 'down',
            'and', 'or', 'but', 'so', 'just', 'only', 'like',

            // ================= PORTUGUÉS =================
            // Pronomes
            'eu', 'me', 'mim', 'meu', 'minha', 'nos', 'nosso', 'nossa',
            'tu', 'te', 'ti', 'teu', 'tua', 'voce', 
            'ele', 'ela', 'dele', 'dela', 'eles', 'elas',
            // Verbos
            'gastei', 'gastou', 'gastamos', 'gastando', 'gastar',
            'comprei', 'comprou', 'compramos', 'comprando', 'comprar',
            'paguei', 'pagou', 'pagamos', 'pagando', 'pagar',
            'novo', 'adicionar', 'botar', 'inserir',
            'custou', 'custa', 'saiu', 'valeu',
            // Consumo
            'comeu', 'comemos', 'comendo', 'comer',
            'bebeu', 'bebemos', 'bebendo', 'beber',
            'tomei', 'tomou', 'tomamos', 'tomar',
            'almocar', 'almocei', 'almocamos', 'almoco',
            'jantar', 'jantei', 'jantamos', 'janta',
            'lanche', 'lanchar', 'lanchei',
            // Artigos/Conectores
            'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
            'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'com', 'sem', 'pelo', 'pela',
            'e', 'ou', 'que', 'mas', 'para', 'por',

            // ================= GLOBAL / MONEDAS =================
            'reales', 'real', 'reais', 'realen', 'rs', 'brl',
            'pesos', 'peso', 'ars', 'mxn', 'cop', 'clp', 'uyu',
            'dolares', 'dolar', 'dollars', 'dollar', 'usd', 'bucks', 'cents',
            'euros', 'euro', 'eur', 
            'cup', 'cups', 'mn', 'mlc',
            'moneda', 'dinero', 'plata', 'pasta', 'grana', 'money', 'cash', 'card',
            'valor', 'precio', 'preco', 'price', 'monto', 'cuanto', 'amount', 'total', 'value'
        ];
        
        // Palabras técnicas adicionales
        blackList.push('categoria', 'cat', 'rubro', 'tipo', 'item', 'producto', 'category', 'type');

        // 5. Filtrado
        let words = cleanText.split(/\s+/); 
        let finalWords = words.filter(word => {
            if (!word || blackList.includes(word)) return false;
            return true;
        });

        // 6. Construcción Final
        let desc = finalWords.join(' ').trim();
        if (desc.length < 2) desc = "Gasto Rápido";
        desc = desc.charAt(0).toUpperCase() + desc.slice(1);

        this.openSmartExpenseModal(amount, desc, categoryId);
    },
    // --- AUTOCOMPLETADO DE GASTOS CON IA (GROQ VISION) ---
    async handleExpenseAutoFill(input) {
        const file = input.files[0];
        if (!file) return;

        if (typeof GroqAI === 'undefined') {
            console.error('GroqAI no esta disponible.');
            if (typeof UI !== 'undefined') UI.showSnackbar('Modulo de IA no disponible');
            return;
        }

        // Pedir/validar que exista una clave antes de procesar la imagen.
        if (!GroqAI.getApiKey()) return;

        const statusLabel = document.getElementById('exp-autofill-status');
        if (statusLabel) statusLabel.innerText = "⏳ Extrayendo datos...";
        if (typeof UI !== 'undefined') UI.showSnackbar("Analizando gasto con IA...");

        // Limpiar input para permitir seleccionar de nuevo la misma imagen.
        input.value = '';

        try {
            // 1. Comprimir imagen. compressImage siempre devuelve JPEG.
            const base64Data = await this.compressImage(file, 1200, 0.72);
            const rawBase64 = base64Data.split(',')[1];

            // 2. Categorias validas de la app.
            const categories = ["cat_market", "cat_leisure", "cat_transport", "cat_clothes", "cat_health", "cat_bills", "cat_travel", "cat_beauty", "cat_other"];

            // Prompt en ingles para maximizar el cumplimiento de JSON mode; los valores se conservan en el formato de la app.
            const promptText = `Analyze this receipt or invoice image.
Extract the final amount actually paid, a short merchant/product description, and classify the expense into exactly ONE of these category IDs: ${categories.join(', ')}.
Use "cat_other" if the category is uncertain.
Return ONLY one JSON object with exactly these fields:
{
  "amount": 25.50,
  "desc": "Merchant or product name",
  "category": "cat_leisure"
}
Rules: amount must be a positive number using a dot as decimal separator; desc must be concise; category must be one of the allowed IDs.`;

            const result = await GroqAI.visionJSON(promptText, rawBase64);

            // 3. Validar la respuesta antes de tocar la interfaz.
            const amount = Number(result?.amount);
            const desc = typeof result?.desc === 'string' ? result.desc.trim() : '';
            const category = categories.includes(result?.category) ? result.category : 'cat_other';

            if (!Number.isFinite(amount) || amount <= 0) {
                throw new Error('Monto invalido detectado por IA.');
            }

            // 4. Rellenar campos en la interfaz.
            const amountEl = document.getElementById('exp-amount');
            const descEl = document.getElementById('exp-desc');
            if (amountEl) amountEl.value = amount.toFixed(2);
            if (descEl && desc) descEl.value = desc;

            const chips = document.querySelectorAll('#cat-chips .cat-chip');
            chips.forEach(chip => {
                chip.classList.remove('selected');
                chip.style.background = 'var(--glass-bg)';
                chip.style.color = 'var(--text-color)';

                if (chip.dataset.id === category) {
                    chip.classList.add('selected');
                    chip.style.background = 'var(--primary)';
                    chip.style.color = 'white';
                }
            });

            if (typeof UI !== 'undefined') UI.showSnackbar("Gasto autocompletado con exito ✨");

        } catch (err) {
            console.error("Error autofill Groq:", err);
            const msg = GroqAI.friendlyError(err);
            if (typeof UI !== 'undefined' && msg) UI.showSnackbar(msg);
        } finally {
            if (statusLabel) statusLabel.innerText = "🪄 Autocompletar con Recibo";
        }
    }



}; // <--- FIN CORRECTO DEL ARCHIVO