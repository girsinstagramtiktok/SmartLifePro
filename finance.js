/* =========================================
   SMART LIFE PRO - FINANCE MODULE (V11.0 - AI VOICE UNIFIED + LLAMA 4 VISION)
   Autor: A_True_Alpha
   ========================================= */

const Finance = {
    selectedHistoryMonth: null, 
    selectedCategoryFilter: 'ALL',
    chartDisplayMode: 'percent',
    subscriptionSort: 'date',
    tempPhotoData: null, 

    setTab(tab) {
        document.querySelectorAll('.finance-tab-content').forEach(el => {
            el.classList.add('hidden');
            el.style.display = 'none';
        });

        document.querySelectorAll('.segment-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const btn = document.getElementById(`fin-tab-${tab}`);
        const content = document.getElementById(`finance-content-${tab}`);
        
        if (btn) btn.classList.add('active');
        if (content) {
            content.classList.remove('hidden');
            content.style.display = 'block'; 
        }

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

    renderFilterChips() {
        let html = `<div class="filter-scroll-container">`;
        const allActive = this.selectedCategoryFilter === 'ALL' ? 'active' : '';
        html += `<div class="filter-chip ${allActive}" onclick="Finance.setCategoryFilter('ALL')">Todo</div>`;

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

    checkMonthTransition() {
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        if (!Data.store.appControl) {
            Data.store.appControl = { lastActivePeriod: currentPeriod };
        }
        
        const lastPeriod = Data.store.appControl.lastActivePeriod || currentPeriod;

        if (currentPeriod !== lastPeriod) {
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

    calculateMonthlySpent() {
        let total = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

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

        if (Data.store.lists) {
            Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                const d = new Date(l.date);
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    total += parseFloat(l.total);
                }
            });
        }

        if (Data.store.subscriptions) {
            Data.store.subscriptions.forEach(sub => {
                if (currentDay >= sub.day) {
                    total += parseFloat(sub.cost);
                }
            });
        }

        return total;
    },

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

    renderHomeWidgets() {
        const recentContainer = document.getElementById('home-recent-expenses');
        if (recentContainer) {
            recentContainer.innerHTML = '';
            let allMovements = [];

            if (Data.store.expenses) {
                Data.store.expenses.forEach(exp => {
                    allMovements.push({
                        type: 'expense', name: exp.desc, amount: parseFloat(exp.amount),
                        date: new Date(exp.date).getTime(), icon: this.getCategoryIcon(exp.category)
                    });
                });
            }
            if (Data.store.lists) {
                Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
                    allMovements.push({
                        type: 'list', name: l.name, amount: parseFloat(l.total),
                        date: new Date(l.date).getTime(), icon: UI.categoryIcon('cat_market') 
                    });
                });
            }
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
                                <span style="font-weight:700; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</span>
                                <span style="font-size:10.5px; color:var(--text-sec);">${new Date(item.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div style="font-weight:800; font-size:13.5px; color:var(--text-color);">${UI.formatMoney(item.amount)}</div>
                    `;
                    recentContainer.appendChild(row);
                });
            }
        }
        
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

            const sorted = Object.entries(groups).sort((a,b) => b[1] - a[1]).slice(0, 3);
            
            if (sorted.length === 0) {
                catContainer.innerHTML = `<div style="text-align:center; font-size:12px; opacity:0.5; padding:10px;">Sin datos este mes.</div>`;
            } else {
                const colors = ['var(--primary)', 'var(--purple)', 'var(--warning)'];
                sorted.forEach(([cat, amount], i) => {
                    const pct = (amount / totalM) * 100;
                    const icon = this.getCategoryIcon(cat);
                    const row = document.createElement('div');
                    row.className = 'home-cat-row';
                    row.innerHTML = `
                        <div style="width:42%; font-size:12.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${icon} <span>${cat}</span>
                        </div>
                        <div class="cat-bar-bg">
                            <div class="cat-bar-fill" style="width:${pct}%; background:${colors[i]}"></div>
                        </div>
                        <div style="font-size:11.5px; font-weight:800; width:14%; text-align:right;">${Math.round(pct)}%</div>
                    `;
                    catContainer.appendChild(row);
                });
            }
        }
    },

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
            const colors = ['#0066FF', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#06B6D4', '#64748B'];
            let currentDeg = 0;
            let gradientParts = [];
            const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
            let legendHTML = '<div style="margin-top:22px; width:100%; display:flex; flex-direction:column; gap:10px;">';
            
            sorted.forEach(([cat, amount], i) => {
                const deg = (amount / totalMonth) * 360;
                const pct = (amount / totalMonth) * 100;
                const col = colors[i % colors.length];
                const icon = this.getCategoryIcon(cat); 
                const displayValue = this.chartDisplayMode === 'percent' ? `${Math.round(pct)}%` : UI.formatMoney(amount);

                gradientParts.push(`${col} ${currentDeg}deg ${currentDeg + deg}deg`);
                currentDeg += deg;

                legendHTML += `
                    <div style="display:flex; align-items:center; justify-content:space-between; font-size:13px;">
                        <div style="display:flex; align-items:center; gap:8px; width:45%; overflow:hidden;">
                            <div style="width:10px; height:10px; border-radius:50%; background:${col}; flex-shrink:0;"></div>
                            <span>${icon}</span>
                            <span style="font-weight:700; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${cat}</span>
                        </div>
                        <div style="flex:1; margin:0 10px; height:6px; background:rgba(100,116,139,0.12); border-radius:99px; overflow:hidden;">
                            <div style="height:100%; width:${pct}%; background:${col}; border-radius:99px;"></div>
                        </div>
                        <div style="font-weight:800; color:var(--text-sec); text-align:right;">${displayValue}</div>
                    </div>
                `;
            });
            legendHTML += '</div>';

            const toggleText = this.chartDisplayMode === 'percent' ? 'Ver Montos' : 'Ver %';
            const chartHTML = `
                <div class="glass-card" style="padding:22px; margin:0 16px 16px; display:flex; flex-direction:column; align-items:center;">
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:18px;">
                        <div style="font-size:11px; font-weight:800; color:var(--text-sec); text-transform:uppercase; letter-spacing:1px;">${UI.t('cat_distribution')}</div>
                        <button class="text-btn-small" onclick="Finance.toggleChartMode()" style="background:var(--input-bg); padding:5px 10px; font-size:11px; border-radius:10px;">
                            ${toggleText} 🔁
                        </button>
                    </div>
                    <div style="position:relative; width:156px; height:156px; border-radius:50%; background: conic-gradient(${gradientParts.join(', ')});">
                        <div style="position:absolute; inset:22px; background:var(--item-bg); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                            <span style="font-size:10px; color:var(--text-sec); font-weight:800; text-transform:uppercase;">TOTAL</span>
                            <span style="font-size:18px; font-weight:900; color:var(--text-color); margin-top:2px;">${UI.formatMoney(totalMonth)}</span>
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
                let extrasIcon = '';
                if (e.photo) extrasIcon += ' 📷';
                if (e.link) extrasIcon += ' 🔗';

                allItems.push({
                    type: 'expense', id: e.id, date: date, amount: e.amount, name: e.desc + extrasIcon, 
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
            sumDiv.style.cssText = "text-align:center; padding:15px; margin:0 16px 12px;";
            sumDiv.innerHTML = `<div style="font-size:11px; font-weight:800; color:var(--text-sec);">${UI.t(this.selectedCategoryFilter).toUpperCase()}</div><div style="font-size:20px; font-weight:900;">${UI.formatMoney(totalF)}</div>`;
            container.appendChild(sumDiv);
        }

        if(allItems.length === 0) {
            container.innerHTML += `<div style="text-align:center; padding:30px; opacity:0.5; font-size:13px;">Sin movimientos con este filtro.</div>`;
        } else {
            allItems.forEach(item => {
                const row = document.createElement('div');
                row.className = 'item-row'; 
                const delFn = item.type === 'expense' ? `Finance.deleteExpense('${item.id}')` : (item.type === 'list' ? `Shopping.deleteList('${item.id}')` : `Finance.deleteSub('${item.id}')`);
                const clickFn = item.type === 'expense' ? `Finance.openExpenseDetail('${item.id}')` : '';

                row.innerHTML = `
                    <div class="item-content-wrap" onclick="${clickFn}" style="cursor:pointer;">
                        <div style="margin-right:12px; flex-shrink:0;">${item.icon}</div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:700; font-size:14px; color:var(--text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                            <div style="font-size:11px; color:var(--text-sec);">${new Date(item.date).toLocaleDateString()}</div>
                        </div>
                        <div style="font-weight:800; font-size:14px; color:var(--text-color); margin-right:10px;">${UI.formatMoney(item.amount)}</div>
                    </div>
                    <button class="icon-btn" style="color:var(--danger); width:34px; height:34px; margin-left:4px;" onclick="${delFn}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                `;
                container.appendChild(row);
            });
        }
    },

    renderMonthSelector(container) {
        const nav = document.createElement('div');
        nav.className = 'glass-card';
        nav.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 15px; margin:0 16px 12px;';
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
        document.getElementById('exp-link').value = ''; 
        this.clearPhoto(); 
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
    
    handlePhotoSelect(input) {
        const file = input.files[0];
        if (file) {
            const icon = document.getElementById('exp-photo-icon');
            this.compressImage(file, 800, 0.7).then(base64 => {
                this.tempPhotoData = base64;
                const img = document.getElementById('exp-photo-img');
                if(img) img.src = base64;
                const container = document.getElementById('exp-photo-preview-container');
                if(container) container.classList.remove('hidden');
                if(icon) icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            }).catch(() => {});
        }
    },

    clearPhoto() {
        this.tempPhotoData = null;
        const input = document.getElementById('exp-photo-input');
        if(input) input.value = '';
        const container = document.getElementById('exp-photo-preview-container');
        if(container) container.classList.add('hidden');
        const icon = document.getElementById('exp-photo-icon');
        if(icon) icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>';
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
        
        const catChip = document.querySelector('.cat-chip.selected');
        let category = UI.t('cat_other');
        if (catChip) category = catChip.dataset.id ? UI.t(catChip.dataset.id) : catChip.innerText.trim();

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
            div.className = 'item-row';
            div.innerHTML = `
                <div style="flex:1">
                    <div style="font-weight:800;">${sub.name}</div>
                    <div style="font-size:12px; color:var(--text-sec);">${UI.t('sub_charge_day')} ${sub.day}</div>
                </div>
                <div style="font-weight:800; margin-right:15px; color:var(--text-color);">${UI.formatMoney(sub.cost)}</div>
                <button class="icon-btn" style="color:var(--danger); width:36px; height:36px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            `;
            div.querySelector('button').onclick = () => this.deleteSub(sub.id);
            container.appendChild(div);
        });

        const totalDiv = document.createElement('div');
        totalDiv.className = 'glass-card';
        totalDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:16px; margin:15px 16px 0; border:2px solid var(--primary);';
        totalDiv.innerHTML = `
            <div style="font-weight:800; color:var(--text-color);">Total Mensual Fijo</div>
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
            const pct = (current / inst.installments.total) * 100;
            const div = document.createElement('div');
            div.className = 'glass-card';
            div.style.cssText = 'padding:16px; margin:0 16px 12px;';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="font-weight:800;">${inst.desc}</span>
                    <span style="font-weight:900;">${UI.formatMoney(inst.amount)}/mes</span>
                </div>
                <div style="font-size:12px; color:var(--text-sec); margin-bottom:8px; display:flex; justify-content:space-between;">
                    <span>${UI.t('inst_current')} <strong>${current}</strong>/${inst.installments.total}</span>
                    <span>Total: ${UI.formatMoney(inst.installments.originalTotal)}</span>
                </div>
                <div style="background:rgba(100,116,139,0.14); height:7px; border-radius:99px; overflow:hidden;">
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
    
    openExpenseDetail(id) {
        const expense = Data.store.expenses.find(e => e.id === id);
        if (!expense) return;

        document.getElementById('det-exp-desc').innerText = expense.desc;
        document.getElementById('det-exp-amount').innerText = UI.formatMoney(expense.amount);
        document.getElementById('det-exp-date').innerText = new Date(expense.date).toLocaleString();
        
        const catName = expense.category || UI.t('cat_other');
        const icon = this.getCategoryIcon(catName);
        document.getElementById('det-exp-cat').innerHTML = `${icon} <span>${catName}</span>`;

        const imgContainer = document.getElementById('det-exp-photo-container');
        const img = document.getElementById('det-exp-img');
        if (expense.photo) {
            img.src = expense.photo;
            imgContainer.classList.remove('hidden');
        } else {
            imgContainer.classList.add('hidden');
            img.src = '';
        }

        const linkBtn = document.getElementById('det-exp-link-btn');
        if (expense.link) {
            let url = expense.link;
            if (!url.startsWith('http')) url = 'https://' + url;
            linkBtn.href = url;
            linkBtn.classList.remove('hidden');
            if(!url.includes('.')) {
                 linkBtn.removeAttribute('href');
                 linkBtn.querySelector('span').innerText = `📍 ${expense.link}`;
            } else {
                 linkBtn.querySelector('span').innerText = `🔗 Ir al enlace`;
            }
        } else {
            linkBtn.classList.add('hidden');
        }

        const delBtn = document.getElementById('det-exp-delete-btn');
        delBtn.onclick = () => {
            this.deleteExpense(id);
            Main.closeModal('expense-detail');
        };

        document.getElementById('modal-expense-detail').classList.add('open');
    },
    
    openSmartExpenseModal(amount, desc, categoryId, options = {}) {
        this.openExpenseModal();
        setTimeout(() => {
            const amountInput = document.getElementById('exp-amount');
            const descInput = document.getElementById('exp-desc');
            if (amountInput) amountInput.value = amount || '';
            if (descInput) descInput.value = desc;

            if (options.installmentCount && options.installmentCount > 1) {
                const chk = document.getElementById('exp-is-install');
                const cnt = document.getElementById('exp-inst-count');
                if (chk) { chk.checked = true; this.toggleInstallmentInputs(); }
                if (cnt) cnt.value = options.installmentCount;
            }

            const chips = document.querySelectorAll('.cat-chip');
            chips.forEach(chip => {
                chip.classList.remove('selected');
                if (chip.dataset.id === categoryId) {
                    chip.classList.add('selected');
                }
            });
            UI.showSnackbar("✨ Gasto listo para confirmar");
        }, 100);
    },

    async startSmartyExpenseVoice() {
        const btn = document.getElementById('expense-smarty-btn');
        const original = btn ? btn.innerHTML : '';
        try {
            if (btn) { btn.disabled = true; btn.innerHTML = '🎙'; }
            if (typeof UI !== 'undefined') UI.showSnackbar('🎙 Habla con naturalidad (ej: "gasté 40 en gasolina")');

            const transcript = await GroqAI.listenOnce();
            if (btn) btn.innerHTML = '⏳';

            await this.processVoiceWithSmartyAI(transcript);
        } catch (err) {
            const msg = GroqAI.friendlyError(err);
            if (msg && typeof UI !== 'undefined') UI.showSnackbar(msg);
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = original || '✨ Smarty'; }
        }
    },

    async processVoiceWithSmartyAI(transcript) {
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
            required: ['amount','desc','category','isInstallment','installmentCount']
        };

        const lang = Data?.store?.settings?.lang || 'es';
        const instructions = `Extract one personal expense from speech (${lang}). Return numeric amount, clean short description, and one category from: ${categories.join(', ')}.`;
        const result = await GroqAI.textJSON(instructions, transcript, 'smart_expense', schema, { maxTokens: 400 });

        const amount = Number(result.amount);
        if (!Number.isFinite(amount) || amount <= 0) throw new Error('INVALID_SMART_EXPENSE');
        const category = categories.includes(result.category) ? result.category : 'cat_other';
        const desc = String(result.desc || '').trim() || 'Gasto';
        const installmentCount = result.isInstallment ? Math.max(2, Number(result.installmentCount) || 2) : 1;

        this.openSmartExpenseModal(amount, desc, category, { installmentCount });
    },

    initSmartButton() {
        const btn = document.getElementById('dock-plus-btn');
        const overlay = document.getElementById('listening-overlay');
        const mascotImg = document.getElementById('listening-mascot-img');
        if (!btn) return;

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        const activeBtn = document.getElementById('dock-plus-btn');

        let pressTimer;
        let isLongPress = false;
        let recognition = null;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            const userLang = (Data && Data.store && Data.store.settings) ? Data.store.settings.lang : 'es';
            recognition.lang = (userLang === 'pt') ? 'pt-BR' : (userLang === 'en' ? 'en-US' : 'es-ES');
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = async (event) => {
                const text = event.results[0][0].transcript;
                if (Data.store.settings?.groqApiKey && navigator.onLine) {
                    try {
                        await this.processVoiceWithSmartyAI(text);
                        return;
                    } catch (_) {}
                }
                this.processSmartText(text);
            };
            
            recognition.onerror = () => stopListeningUI();
            recognition.onend = () => {
                if(overlay && overlay.classList.contains('active')) stopListeningUI();
            };
        }

        const startListeningUI = () => {
            if (!recognition) {
                UI.showSnackbar("Tu navegador no soporta voz");
                return;
            }
            isLongPress = true;
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
                if (recognition) try { recognition.stop(); } catch(e) {}
            } else {
                Main.openAddMenu(); 
            }
            isLongPress = false;
        };

        const startEvent = (e) => {
            if(e.cancelable) e.preventDefault(); 
            isLongPress = false;
            pressTimer = setTimeout(startListeningUI, 550); 
        };

        activeBtn.addEventListener('touchstart', startEvent, {passive: false});
        activeBtn.addEventListener('touchend', stopListeningUI);
        activeBtn.addEventListener('mousedown', startEvent);
        activeBtn.addEventListener('mouseup', stopListeningUI);
        activeBtn.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
            if(isLongPress) stopListeningUI();
        });
    },

    processSmartText(text) {
        let cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,:;?!¿¡"'-]/g, ' ');
        const amountMatch = cleanText.match(/(\d+([.,]\d+)?)/);
        let amount = 0;
        if (amountMatch) {
            amount = parseFloat(amountMatch[0].replace(',', '.'));
            cleanText = cleanText.replace(amountMatch[0], '');
        }

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

        const blackList = [
            'me','te','se','le','nos','mi','tu','su','yo','gaste','gasto','compre','compro','pague','pago','registra','anota','nuevo','costo','fue','el','la','los','las','un','una','de','del','al','a','en','con','por','para','y','o','reales','real','reais','pesos','peso','dolares','dolar','euros','euro','categoria','gastei','comprei','paguei','spent','bought','paid'
        ];

        let words = cleanText.split(/\s+/); 
        let finalWords = words.filter(w => w && !blackList.includes(w));
        let desc = finalWords.join(' ').trim();
        if (desc.length < 2) desc = "Gasto Rápido";
        desc = desc.charAt(0).toUpperCase() + desc.slice(1);

        this.openSmartExpenseModal(amount, desc, categoryId);
    },

    async handleExpenseAutoFill(input) {
        const file = input.files[0];
        if (!file) return;
        if (typeof GroqAI === 'undefined' || !GroqAI.getApiKey()) return;

        const statusLabel = document.getElementById('exp-autofill-status');
        if (statusLabel) statusLabel.innerText = "⏳ Analizando recibo con Llama 4 Vision...";
        if (typeof UI !== 'undefined') UI.showSnackbar("Analizando recibo con IA...");
        input.value = '';

        try {
            const base64Data = await this.compressImage(file, 1200, 0.75);
            const rawBase64 = base64Data.split(',')[1];
            const categories = ["cat_market", "cat_leisure", "cat_transport", "cat_clothes", "cat_health", "cat_bills", "cat_travel", "cat_beauty", "cat_other"];

            const promptText = `Analyze this receipt or invoice image. Extract the final amount paid, a short merchant/product description, and classify into one of: ${categories.join(', ')}. Return ONLY JSON: {"amount": 25.50, "desc": "Store Name", "category": "cat_market"}`;

            const result = await GroqAI.visionJSON(promptText, rawBase64);
            const amount = Number(result?.amount);
            const desc = typeof result?.desc === 'string' ? result.desc.trim() : '';
            const category = categories.includes(result?.category) ? result.category : 'cat_other';

            if (!Number.isFinite(amount) || amount <= 0) throw new Error('Monto inválido');

            const amountEl = document.getElementById('exp-amount');
            const descEl = document.getElementById('exp-desc');
            if (amountEl) amountEl.value = amount.toFixed(2);
            if (descEl && desc) descEl.value = desc;

            document.querySelectorAll('#cat-chips .cat-chip').forEach(chip => {
                chip.classList.toggle('selected', chip.dataset.id === category);
            });

            if (typeof UI !== 'undefined') UI.showSnackbar("✨ Recibo escaneado con éxito");
        } catch (err) {
            const msg = GroqAI.friendlyError(err);
            if (typeof UI !== 'undefined' && msg) UI.showSnackbar(msg);
        } finally {
            if (statusLabel) statusLabel.innerText = "🪄 Autocompletar con Recibo";
        }
    }
};