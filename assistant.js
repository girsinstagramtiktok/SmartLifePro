/* =========================================
   SMART LIFE PRO - ASSISTANT CORE (V30.1 - CATEGORY MATCH FIX)
   Autor: A_True_Alpha | Fix: Sync with Finance.js translation
   ========================================= */

const Assistant = {
    config: {
        baseXP: 100,
        difficulty: 1.2, 
        checkInterval: null,
        currentAnalysisTab: 'health'
    },

    phrases: {
        greeting: {
            es: ["Sistema listo.", "Esperando órdenes.", "Energía estable."],
            en: ["System ready.", "Awaiting orders.", "Stable energy."],
            pt: ["Sistema pronto.", "Aguardando ordens.", "Energia estável."]
        },
        warning: {
            es: ["⚠️ Gasto alto.", "Cuidado con el presupuesto."],
            en: ["⚠️ High spending.", "Watch the budget."],
            pt: ["⚠️ Gasto alto.", "Cuidado com o orçamento."]
        }
    },

    // --- HELPER FUNCTIONS (FIX CRÍTICO AQUÍ) ---
    countCat(catId) {
        if (!Data.store.expenses) return 0;
        // Obtenemos el nombre real en español (ej: 'cat_market' -> 'Supermercado')
        const realName = (typeof UI !== 'undefined' && UI.t) ? UI.t(catId) : catId;
        
        return Data.store.expenses.filter(e => 
            e.category === catId || // Por si se guardó el ID
            e.category === realName || // Coincidencia exacta con traducción
            (e.category && e.category.toLowerCase().includes(realName.toLowerCase())) // Coincidencia parcial
        ).length;
    },

    checkExpToday() { 
        if (!Data.store.expenses) return false;
        const t = new Date().toDateString(); 
        return Data.store.expenses.some(e => new Date(e.date).toDateString() === t); 
    },

    checkCatToday(catId) { 
        if (!Data.store.expenses) return false;
        const t = new Date().toDateString(); 
        // FIX: Traducir el ID al nombre visible (ej: cat_leisure -> Ocio)
        const realName = (typeof UI !== 'undefined' && UI.t) ? UI.t(catId) : '';

        return Data.store.expenses.some(e => {
            const isToday = new Date(e.date).toDateString() === t;
            if(!isToday) return false;

            // 1. Comparar con ID directo (cat_leisure)
            if (e.category === catId) return true;
            // 2. Comparar con nombre traducido (Ocio) - ESTO ES LO QUE FALTABA
            if (realName && e.category === realName) return true;
            // 3. Comparar parcial (Ocio y Vicios)
            if (realName && e.category.includes(realName)) return true;
            // 4. Fallback inglés (leisure)
            if (e.category.toLowerCase().includes(catId.replace('cat_', ''))) return true;

            return false;
        });
    },

    checkAmountToday(op, val, val2) { 
        if (!Data.store.expenses) return false;
        const t = new Date().toDateString(); 
        return Data.store.expenses.some(e => {
            if (new Date(e.date).toDateString() !== t) return false;
            const amt = parseFloat(e.amount);
            if (op === '<') return amt < val;
            if (op === '>') return amt > val;
            if (op === 'range') return amt >= val && amt <= val2;
            return false;
        });
    },

    checkHourToday(op, h1, h2) {
        if (!Data.store.expenses) return false;
        const t = new Date().toDateString();
        return Data.store.expenses.some(e => {
            if (new Date(e.date).toDateString() !== t) return false;
            const h = new Date(e.date).getHours();
            if (op === '<') return h < h1;
            if (op === 'range') return h >= h1 && h < h2;
            return false;
        });
    },

    checkDescToday(txt) {
        if (!Data.store.expenses) return false;
        const t = new Date().toDateString();
        return Data.store.expenses.some(e => new Date(e.date).toDateString() === t && e.desc.toLowerCase().includes(txt));
    },

    // --- 3. MEDALLAS ---
    badgesDef: [
        // GRUPO 1: PROGRESO (NIVELES)
        { id: 'b_lvl_5', icon: '🐣', name: {es:'Novato'}, desc: {es:'Alcanza el Nivel 5'}, check: () => Data.store.gamification.level >= 5 },
        { id: 'b_lvl_10', icon: '🥉', name: {es:'Aprendiz'}, desc: {es:'Alcanza el Nivel 10'}, check: () => Data.store.gamification.level >= 10 },
        { id: 'b_lvl_15', icon: '🥈', name: {es:'Competente'}, desc: {es:'Alcanza el Nivel 15'}, check: () => Data.store.gamification.level >= 15 },
        { id: 'b_lvl_20', icon: '🥇', name: {es:'Experto'}, desc: {es:'Alcanza el Nivel 20'}, check: () => Data.store.gamification.level >= 20 },
        { id: 'b_lvl_30', icon: '🚀', name: {es:'Maestro'}, desc: {es:'Alcanza el Nivel 30'}, check: () => Data.store.gamification.level >= 30 },
        { id: 'b_lvl_40', icon: '💎', name: {es:'Magnate'}, desc: {es:'Alcanza el Nivel 40'}, check: () => Data.store.gamification.level >= 40 },
        { id: 'b_lvl_50', icon: '👑', name: {es:'Leyenda'}, desc: {es:'Alcanza el Nivel 50'}, check: () => Data.store.gamification.level >= 50 },
        { id: 'b_lvl_60', icon: '🪐', name: {es:'Dios'}, desc: {es:'Alcanza el Nivel 60'}, check: () => Data.store.gamification.level >= 60 },

        // GRUPO 2: CONSTANCIA
        { id: 'b_month_streak', icon: '🗓️', name: {es:'Superviviente'}, desc: {es:'Mes sin pasar el límite'}, check: () => (Data.store.gamification.monthStreak || 0) > 0 },
        { id: 'b_streak_7', icon: '🔥', name: {es:'Racha Semanal'}, desc: {es:'Usa la app 7 días seguidos'}, check: () => Data.store.gamification.streak >= 7 },
        { id: 'b_streak_30', icon: '🏆', name: {es:'Hábito de Hierro'}, desc: {es:'Usa la app 30 días seguidos'}, check: () => Data.store.gamification.streak >= 30 },

        // GRUPO 3: GESTIÓN
        { id: 'b_start', icon: '🚩', name: {es:'Iniciado'}, desc: {es:'Primer uso de la app'}, check: () => true },
        { id: 'b_budget', icon: '📊', name: {es:'Gerente'}, desc: {es:'Define un presupuesto'}, check: () => Data.store.budget.limit > 0 },
        { id: 'b_list_5', icon: '📝', name: {es:'Planificador'}, desc: {es:'Crea 5 listas de compras'}, check: () => Data.store.lists.length >= 5 },
        { id: 'b_list_master', icon: '📦', name: {es:'Mayorista'}, desc: {es:'Lista con +10 items'}, check: () => Data.store.lists.some(l => l.items.length >= 10) },
        { id: 'b_subs', icon: '📺', name: {es:'Suscrito'}, desc: {es:'3 suscripciones activas'}, check: () => Data.store.subscriptions.length >= 3 },
        { id: 'b_saver', icon: '🐷', name: {es:'Ahorrador'}, desc: {es:'Gasta < 50% del límite'}, check: () => { const l=Data.store.budget.limit; return l>0 && (Finance.calculateMonthlySpent()/l)<0.5; }},
        { id: 'b_safe', icon: '🛡️', name: {es:'Blindado'}, desc: {es:'Gasta < 80% del límite'}, check: () => { const l=Data.store.budget.limit; return l>0 && (Finance.calculateMonthlySpent()/l)<0.8; }},
        { id: 'b_clean_sheet', icon: '✨', name: {es:'Impecable'}, desc: {es:'Sin deudas activas'}, check: () => !Data.store.expenses.some(e=>e.isInstallment) },

        // GRUPO 4: CATEGORÍAS REALES (Usando Assistant.countCat con el fix)
        { id: 'b_market', icon: '🛒', name: {es:'Mercader'}, desc: {es:'5 gastos en Supermercado'}, check: () => Assistant.countCat('cat_market') >= 5 },
        { id: 'b_leisure', icon: '🍕', name: {es:'Disfrutón'}, desc: {es:'5 gastos en Ocio/Comida'}, check: () => Assistant.countCat('cat_leisure') >= 5 },
        { id: 'b_transport', icon: '🚌', name: {es:'Nómada'}, desc: {es:'5 gastos en Transporte'}, check: () => Assistant.countCat('cat_transport') >= 5 },
        { id: 'b_clothes', icon: '👕', name: {es:'Estilista'}, desc: {es:'3 gastos en Ropa'}, check: () => Assistant.countCat('cat_clothes') >= 3 },
        { id: 'b_health', icon: '💊', name: {es:'Saludable'}, desc: {es:'3 gastos en Salud'}, check: () => Assistant.countCat('cat_health') >= 3 },
        { id: 'b_bills', icon: '🏠', name: {es:'Casero'}, desc: {es:'5 gastos de Hogar'}, check: () => Assistant.countCat('cat_bills') >= 5 },
        { id: 'b_travel', icon: '✈️', name: {es:'Mochilero'}, desc: {es:'1 gasto de Viaje'}, check: () => Assistant.countCat('cat_travel') >= 1 },
        { id: 'b_beauty', icon: '💅', name: {es:'Vanidoso'}, desc: {es:'1 gasto en Belleza'}, check: () => Assistant.countCat('cat_beauty') >= 1 },
        
        // GRUPO 5: ESPECÍFICOS
        { id: 'b_coffee', icon: '☕', name: {es:'Cafetero'}, desc: {es:'Gasto con descr. "Cafe"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Cafe|Coffee/i)) },
        { id: 'b_gamer', icon: '🎮', name: {es:'Gamer'}, desc: {es:'Gasto con descr. "Juego"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Juego|Game|Steam/i)) },
        { id: 'b_pet', icon: '🐾', name: {es:'Amigo Fiel'}, desc: {es:'Gasto con descr. "Vet/Perro"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Perro|Gato|Vet|Mascota/i)) },
        { id: 'b_investor', icon: '📈', name: {es:'Inversor'}, desc: {es:'Gasto con descr. "Inversion"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Inversion|Accion|Crypto/i)) },
        { id: 'b_night', icon: '🦉', name: {es:'Nocturno'}, desc: {es:'Gasto de 00:00 a 05:00'}, check: () => Data.store.expenses.some(e=>{ const h=new Date(e.date).getHours(); return h>=0 && h<5; }) }
    ],

    // --- 4. POOL DE MISIONES ---
    missionPool: [
        // DÍA A DÍA
        { id: 'm_log', xp: 50, icon: '🖊️', title: {es:"Diario"}, desc: {es:"Registra 1 gasto hoy"}, check: () => Assistant.checkExpToday() },
        { id: 'm_zero', xp: 100, icon: '🛡️', title: {es:"Escudo"}, desc: {es:"0 gastos hoy"}, check: () => !Assistant.checkExpToday() },
        
        // CATEGORÍAS (Usan el checkCatToday arreglado)
        { id: 'm_market', xp: 60, icon: '🛒', title: {es:"Súper"}, desc: {es:"Gasto en Mercado"}, check: () => Assistant.checkCatToday('cat_market') },
        { id: 'm_leisure', xp: 60, icon: '🍕', title: {es:"Relax"}, desc: {es:"Gasto en Ocio"}, check: () => Assistant.checkCatToday('cat_leisure') },
        { id: 'm_transport', xp: 60, icon: '🚌', title: {es:"Ruta"}, desc: {es:"Gasto Transporte"}, check: () => Assistant.checkCatToday('cat_transport') },
        { id: 'm_bills', xp: 70, icon: '💡', title: {es:"Pagos"}, desc: {es:"Gasto Hogar"}, check: () => Assistant.checkCatToday('cat_bills') },
        { id: 'm_health', xp: 80, icon: '💊', title: {es:"Cuidarse"}, desc: {es:"Gasto Salud"}, check: () => Assistant.checkCatToday('cat_health') },
        
        // MONTOS
        { id: 'm_tiny', xp: 40, icon: '🐜', title: {es:"Micro"}, desc: {es:"Gasto < 5"}, check: () => Assistant.checkAmountToday('<', 5) },
        { id: 'm_small', xp: 50, icon: '🪙', title: {es:"Pequeño"}, desc: {es:"Gasto 5-20"}, check: () => Assistant.checkAmountToday('range', 5, 20) },
        { id: 'm_medium', xp: 60, icon: '💵', title: {es:"Medio"}, desc: {es:"Gasto 20-50"}, check: () => Assistant.checkAmountToday('range', 20, 50) },
        { id: 'm_big', xp: 80, icon: '🐳', title: {es:"Macro"}, desc: {es:"Gasto > 50"}, check: () => Assistant.checkAmountToday('>', 50) },
        
        // HORARIOS
        { id: 'm_morning', xp: 50, icon: '☕', title: {es:"Mañanero"}, desc: {es:"Gasto antes 10AM"}, check: () => Assistant.checkHourToday('<', 10) },
        { id: 'm_lunch', xp: 50, icon: '🍽️', title: {es:"Almuerzo"}, desc: {es:"Gasto 12PM-2PM"}, check: () => Assistant.checkHourToday('range', 12, 14) },
        { id: 'm_afternoon', xp: 50, icon: '🌤️', title: {es:"Tarde"}, desc: {es:"Gasto 3PM-6PM"}, check: () => Assistant.checkHourToday('range', 15, 18) },
        { id: 'm_night', xp: 60, icon: '🌙', title: {es:"Cena"}, desc: {es:"Gasto 7PM-10PM"}, check: () => Assistant.checkHourToday('range', 19, 22) },

        // GESTIÓN
        { id: 'm_list_new', xp: 40, icon: '📝', title: {es:"Planear"}, desc: {es:"Crea una lista"}, check: () => { const t=new Date().toDateString(); return Data.store.lists.some(l=>new Date(l.date).toDateString()===t); }},
        { id: 'm_list_done', xp: 80, icon: '✅', title: {es:"Cumplir"}, desc: {es:"Completa una lista"}, check: () => { const t=new Date().toDateString(); return Data.store.lists.some(l=>l.status==='completed' && new Date(l.date).toDateString()===t); }},
        
        // TEXTO
        { id: 'm_txt_cafe', xp: 50, icon: '☕', title: {es:"Cafeína"}, desc: {es:'Gasto descr "Cafe"'}, check: () => Assistant.checkDescToday('cafe') },
        { id: 'm_txt_pan', xp: 50, icon: '🥖', title: {es:"Panadería"}, desc: {es:'Gasto descr "Pan"'}, check: () => Assistant.checkDescToday('pan') },
        
        // MIXTOS
        { id: 'm_3_exps', xp: 100, icon: '⚡', title: {es:"Activo"}, desc: {es:"Registra 3 gastos"}, check: () => { const t=new Date().toDateString(); return Data.store.expenses.filter(e=>new Date(e.date).toDateString()===t).length >= 3; }}
    ],

    init() {
        console.log("Assistant v30.1 (Verification Fixed) Online");
        this.injectStyles();
        
        if (!Data.store.gamification) Data.store.gamification = { xp: 0, level: 1, badges: [], streak: 0, lastLogin: null, monthStreak: 0, lastSummary: null };
        if (!Data.store.gamification.dailyQuests) Data.store.gamification.dailyQuests = { date: null, quests: [] };
        if (Data.store.gamification.selectedAura) delete Data.store.gamification.selectedAura;

        const validBadgeIds = this.badgesDef.map(b => b.id);
        Data.store.gamification.badges = Data.store.gamification.badges.filter(id => validBadgeIds.includes(id));

        this.checkPeriodicSummary();
        this.processHistoricalXP();
        this.validateDailyQuests();
        this.checkBadges();
        
        setTimeout(() => {
            this.updateMood();
            this.updateHomeXP(); 
            this.checkDailyStreak();
            const img = document.getElementById('mascot-img');
            if(img) img.onclick = () => this.giveTip();
        }, 1000);
    },

    // --- REPORTE SEMANAL ---
    getWeeklyStats() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
        const monday = new Date(now.setDate(diff)); monday.setHours(0,0,0,0);
        
        let weeklyTotal = 0;
        const catMap = {};

        if(Data.store.expenses) {
            Data.store.expenses.forEach(e => {
                const d = new Date(e.date);
                if (d >= monday) {
                    weeklyTotal += e.amount;
                    let catName = e.category || 'Otros';
                    if(typeof UI !== 'undefined' && UI.t) catName = UI.t(catName); 
                    catMap[catName] = (catMap[catName] || 0) + e.amount;
                }
            });
        }

        let topCat = "Ninguna";
        let maxVal = 0;
        for (const [key, val] of Object.entries(catMap)) {
            if (val > maxVal) { maxVal = val; topCat = key; }
        }

        return { total: weeklyTotal, topCategory: topCat, topAmount: maxVal };
    },

    checkPeriodicSummary() {
        const g = Data.store.gamification;
        const now = new Date();
        const weekNum = Math.floor(now.getDate() / 7);
        const key = `sum_${now.getFullYear()}_${now.getMonth()}_w${weekNum}`;

        if (g.lastSummary !== key) {
            const wStats = this.getWeeklyStats();
            const monthlySpent = Finance.calculateMonthlySpent();
            const limit = Data.store.budget.limit || 0;
            const remaining = limit - monthlySpent;
            
            const fmt = (v) => (typeof UI !== 'undefined' ? UI.formatMoney(v) : `$${v}`);
            
            const title = "\uD83D\uDCCA Resumen Semanal";
            const contentHTML = `
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div class="glass-card" style="margin:0; padding:15px; text-align:center;">
                        <div style="font-size:11px; color:var(--text-sec); text-transform:uppercase; font-weight:700;">Gasto Semana</div>
                        <div style="font-size:26px; font-weight:800; color:var(--text-color);">${fmt(wStats.total)}</div>
                    </div>
                    <div style="background:rgba(120,120,120,0.05); padding:12px; border-radius:12px;">
                        <div style="font-size:12px; color:var(--text-sec); margin-bottom:4px;">Top Gasto:</div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:700; color:var(--primary);">${wStats.topCategory}</span>
                            <span style="font-weight:600;">${fmt(wStats.topAmount)}</span>
                        </div>
                    </div>
                    <div style="border-top:1px solid rgba(120,120,120,0.1); padding-top:10px; margin-top:5px;">
                        <div style="display:flex; justify-content:space-between; font-size:13px;">
                            <span style="color:var(--text-sec);">Restante Mes:</span>
                            <span style="font-weight:800; color:${remaining > 0 ? 'var(--success)' : 'var(--danger)'};">${fmt(remaining)}</span>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(() => {
                this.showReportModal(title, contentHTML);
            }, 2000);
            
            g.lastSummary = key;
            Data.save();
        }
    },

    showReportModal(title, htmlContent) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay open';
        overlay.style.zIndex = '12000';
        
        overlay.innerHTML = `
            <div class="settings-card" onclick="event.stopPropagation()" style="animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h2 style="margin:0; font-size:20px; color:var(--primary);">${title}</h2>
                    <button class="icon-btn" id="temp-close-btn">&#10005;</button>
                </div>
                <div style="width:100%;">
                    ${htmlContent}
                </div>
                <button class="btn-full" id="temp-ok-btn" style="margin-top:20px;">Entendido</button>
            </div>
        `;
        document.body.appendChild(overlay);
        if(navigator.vibrate) navigator.vibrate(50);
        const close = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 300); };
        overlay.querySelector('#temp-close-btn').onclick = close;
        overlay.querySelector('#temp-ok-btn').onclick = close;
    },

    updateMood() {
        const img = document.getElementById('mascot-img');
        if (!img) return;
        if (img.parentElement) img.parentElement.style = "";
        img.style = ""; 
        const health = this.analyzeFinancialHealth();
        img.className = 'mascot-restore'; 
        if (health.score < 30) {
            img.src = 'worried.png'; 
            img.style.animation = "shake 0.5s infinite"; 
        } else {
            img.src = health.score > 80 ? 'happy.png' : 'idle.png';
            img.style.animation = "floatMascot 5s ease-in-out infinite";
        }
        img.onclick = () => this.giveTip();
    },

    renderProfile() {
        const modal = document.getElementById('modal-profile');
        if(!modal) return;

        let container = document.getElementById('profile-dynamic-content');
        if (!container) {
            const card = modal.querySelector('.settings-card');
            if (card) {
                container = document.createElement('div');
                container.id = 'profile-dynamic-content';
                container.style.width = '100%';
                container.style.marginTop = '15px';
                card.appendChild(container);
            } else { return; }
        }

        const lang = Data.store.settings.lang || 'es';
        const g = Data.store.gamification;
        
        // Level Ring
        const levelRing = document.getElementById('profile-level-ring');
        if(levelRing) {
             const required = Math.floor(this.config.baseXP * Math.pow(this.config.difficulty, g.level - 1));
             const pct = Math.min(100, (g.xp / required) * 100);
             levelRing.innerHTML = `
                <div class="profile-chart-wrap">
                    <svg viewBox="0 0 36 36" style="display:block; width:100%; height:100%;">
                        <path stroke="rgba(120,120,120,0.1)" stroke-width="2.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path stroke="var(--primary)" stroke-dasharray="${pct}, 100" stroke-width="2.5" fill="none" stroke-linecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                         <span style="font-size:10px; color:var(--text-sec); font-weight:700;">NIVEL</span>
                         <span style="font-size:42px; font-weight:900; color:var(--primary); line-height:1;">${g.level}</span>
                    </div>
                </div>`;
            const xpText = document.getElementById('profile-xp-txt');
            if(xpText) xpText.innerText = `${Math.floor(g.xp)} / ${required} XP`;
        }

        container.innerHTML = '';

        // Analysis
        const analysisHTML = `
            <div class="section-label" style="margin-top:0;">Análisis</div>
            <div class="analysis-box" style="padding:0; overflow:hidden;">
                <div style="display:flex; border-bottom:1px solid rgba(0,0,0,0.05);">
                    <button id="tab-health" class="analysis-tab ${this.config.currentAnalysisTab === 'health' ? 'active' : ''}" onclick="Assistant.setAnalysisTab('health')">📊 Salud</button>
                    <button id="tab-leaks" class="analysis-tab ${this.config.currentAnalysisTab === 'leaks' ? 'active' : ''}" onclick="Assistant.setAnalysisTab('leaks')">🐜 Fugas</button>
                    <button id="tab-future" class="analysis-tab ${this.config.currentAnalysisTab === 'future' ? 'active' : ''}" onclick="Assistant.setAnalysisTab('future')">🔮 Futuro</button>
                </div>
                <div id="analysis-inject-area" style="padding:15px;"></div>
            </div>
        `;
        container.innerHTML += analysisHTML;
        setTimeout(() => this.renderAnalysisContent(), 10); 

        // Misiones
        const questsHtml = this.renderQuestsHTML(g, lang);
        container.innerHTML += `<div class="section-label">Misiones</div>${questsHtml}`;
        
        // Medallas
        let badgesHTML = `<div class="section-label">Medallas (${g.badges.length}/${this.badgesDef.length})</div><div class="badges-grid" style="grid-template-columns: repeat(3, 1fr); gap:8px;">`;
        this.badgesDef.forEach(b => {
            const isOwned = g.badges.includes(b.id);
            const opacity = isOwned ? '1' : '0.4';
            const filter = isOwned ? 'none' : 'grayscale(1)';
            const lockIcon = isOwned ? '' : '<div style="font-size:8px; margin-top:2px;">🔒</div>';
            const bg = isOwned ? 'background:var(--glass-bg); box-shadow: 0 4px 10px rgba(0,0,0,0.05);' : 'background:rgba(0,0,0,0.03); border:1px dashed rgba(120,120,120,0.2);';
            const msg = isOwned ? `🏆 ${b.name[lang]||b.name['es']}: ${b.desc[lang]||b.desc['es']}` : `🔒 Objetivo: ${b.desc[lang]||b.desc['es']}`;
            
            badgesHTML += `
                <div class="badge-card" onclick="UI.showSnackbar('${msg}')" style="opacity:${opacity}; filter:${filter}; ${bg}; padding:10px 5px; min-height:90px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <span style="font-size:26px; line-height:1; margin-bottom:5px;">${b.icon}</span>
                    <div class="badge-name" style="font-size:10px; font-weight:800; line-height:1.1; text-align:center; color:var(--text-color);">${b.name[lang]||b.name['es']}</div>
                    <div style="font-size:8px; color:var(--text-sec); line-height:1; text-align:center; margin-top:3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b.desc[lang]||b.desc['es']}</div>
                    ${lockIcon}
                    ${b.id === 'b_month_streak' && g.monthStreak > 0 ? `<div style="font-size:9px; color:var(--primary); font-weight:bold; margin-top:2px;">Racha: ${g.monthStreak}</div>` : ''}
                </div>`;
        });
        badgesHTML += `</div>`;
        container.innerHTML += badgesHTML;
    },

    renderAnalysisContent() {
        const container = document.getElementById('analysis-inject-area');
        if(!container) return;
        const data = this.getAnalysisData();
        let html = '';
        const daysLeft = Math.floor(data.daysLeftMoney);
        const dateZero = new Date(); dateZero.setDate(dateZero.getDate() + daysLeft);
        const safe = data.limit > 0 && data.projectedTotal <= data.limit;

        if (this.config.currentAnalysisTab === 'health') {
            let reasons = [];
            if(data.percent > 90) reasons.push("❌ Presupuesto casi agotado");
            else if(data.percent < 50) reasons.push("✅ Buen ritmo de ahorro");
            if(data.dailyBurn > (data.limit/30)*1.5) reasons.push("❌ Gasto diario muy alto");
            const color = data.score > 80 ? 'var(--success)' : (data.score > 40 ? 'var(--warning)' : 'var(--danger)');
            html = `<div style="text-align:center; margin-bottom:10px;">
                        <div style="font-size:36px; font-weight:900; color:${color};">${data.score}</div>
                        <div style="font-size:11px; opacity:0.7;">Puntuación Global</div>
                    </div>
                    <div style="font-size:11px; background:rgba(0,0,0,0.03); padding:10px; border-radius:8px;">
                        <div style="margin-bottom:5px;"><b>Diagnóstico:</b></div>
                        ${reasons.length ? reasons.map(r=>`<div>${r}</div>`).join('') : '<div>✅ Ritmo estable</div>'}
                    </div>`;
        } else if (this.config.currentAnalysisTab === 'leaks') {
            const totalAnts = data.topAnts.reduce((sum, item) => sum + item[1], 0);
            html = `<div style="font-size:12px; margin-bottom:10px;">
                        <b>Hormigas (< 10):</b> <span style="color:var(--danger);">${typeof UI !== 'undefined' ? UI.formatMoney(totalAnts) : totalAnts}</span>
                    </div>
                    ${data.topAnts.length ? data.topAnts.map(a => `<div style="display:flex; justify-content:space-between; font-size:11px; border-bottom:1px solid #eee; padding:4px 0;"><span>🐜 ${a[0]}</span><b>${typeof UI !== 'undefined' ? UI.formatMoney(a[1]) : a[1]}</b></div>`).join('') : '<div style="font-size:11px;">No hay fugas detectadas.</div>'}
                    <div style="margin-top:10px; font-size:10px; color:var(--text-sec);">
                        ⚠️ Proyección Anual: <b>${typeof UI !== 'undefined' ? UI.formatMoney(totalAnts*12) : totalAnts*12}</b> perdidos.
                    </div>`;
        } else {
            html = `<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;">
                        <span>Gasto Diario:</span><b>${typeof UI !== 'undefined' ? UI.formatMoney(data.dailyBurn) : data.dailyBurn}</b>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:15px;">
                        <span>Fin Mes:</span><b style="color:${safe?'var(--success)':'var(--danger)'}">${typeof UI !== 'undefined' ? UI.formatMoney(data.projectedTotal) : data.projectedTotal}</b>
                    </div>
                    <div style="background:${safe?'rgba(50,215,75,0.1)':'rgba(255,69,58,0.1)'}; padding:10px; border-radius:8px; text-align:center; font-size:11px;">
                        ${safe ? '✅ Llegarás bien.' : `💀 Dinero $0 el <b>${dateZero.toLocaleDateString()}</b>.`}
                    </div>`;
        }
        container.innerHTML = html;
    },

    getAnalysisData() {
        const d = Data.store;
        const limit = (d.budget && d.budget.limit) ? parseFloat(d.budget.limit) : 0;
        const spent = typeof Finance !== 'undefined' ? Finance.calculateMonthlySpent() : 0;
        let score = 100;
        const now = new Date();
        const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const day = now.getDate();
        if (limit > 0) { const percent = (spent / limit) * 100; if (percent > ((day/totalDays)*100) + 10) score -= 20; } else { score = 50; }
        const frequencyMap = {};
        d.expenses.forEach(e => { if (e.amount < 10) { const key = e.desc.toLowerCase().trim(); frequencyMap[key] = (frequencyMap[key] || 0) + e.amount; }});
        const topAnts = Object.entries(frequencyMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
        const dailyBurn = day > 0 ? spent / day : 0;
        const daysLeftMoney = (limit - spent) / (dailyBurn || 1);
        return { score: Math.max(0, score), spent, limit, dailyBurn, projectedTotal: dailyBurn * totalDays, topAnts, daysLeftMoney, percent: limit > 0 ? (spent/limit)*100 : 0 };
    },

    setAnalysisTab(tab) {
        this.config.currentAnalysisTab = tab;
        this.renderAnalysisContent();
        document.querySelectorAll('.analysis-tab').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(`tab-${tab}`);
        if(activeBtn) activeBtn.classList.add('active');
    },

    updateHomeXP() {
        const bar = document.getElementById('xp-fill'); if(!bar) return;
        const g = Data.store.gamification; const required = Math.floor(this.config.baseXP * Math.pow(this.config.difficulty, g.level - 1));
        const pct = required > 0 ? Math.min(100, (g.xp / required) * 100) : 0; bar.style.height = `${pct}%`;
    },

    validateDailyQuests() {
        const g = Data.store.gamification;
        if (!g.dailyQuests || g.dailyQuests.quests.length < 3) { this.generateDailyQuests(); }
    },

    renderQuestsHTML(g, lang) {
        let html = '';
        if(g.dailyQuests && g.dailyQuests.quests) {
            g.dailyQuests.quests.forEach((q, idx) => {
                const def = Assistant.missionPool.find(m => m.id === q.id); // USE Assistant.
                if(def) {
                    html += `<div class="profile-quest-row"><div class="pq-icon">${def.icon}</div><div class="pq-info"><div class="pq-title">${def.title[lang] || def.title['es']}</div><div class="pq-desc" style="font-size:10px; opacity:0.6;">${def.desc[lang] || def.desc['es']}</div></div><button class="pq-btn ${q.completed ? 'done' : ''}" onclick="Assistant.verifyQuest(${idx})">${q.completed ? '✓' : 'Go'}</button></div>`;
                }
            });
        }
        return html;
    },

    generateDailyQuests() {
        const today = new Date().toDateString(); const g = Data.store.gamification; 
        if (g.dailyQuests && g.dailyQuests.date === today && g.dailyQuests.quests.length >= 3) return;
        const shuffled = Assistant.missionPool.sort(() => 0.5 - Math.random()); // USE Assistant.
        g.dailyQuests = { date: today, quests: shuffled.slice(0, 3).map(q => ({ id: q.id, completed: false })) }; Data.save();
    },

    // --- FIX CRÍTICO EN VERIFICACIÓN ---
    verifyQuest(idx) {
        const g = Data.store.gamification; 
        const q = g.dailyQuests.quests[idx]; 
        
        // 1. Verificar si la misión existe en el pool actual
        const def = Assistant.missionPool.find(m => m.id === q.id);
        
        if (!def) {
            if(typeof UI !== 'undefined') UI.showSnackbar("Actualizando misiones...");
            this.generateDailyQuests(); 
            this.renderProfile(); 
            return;
        }

        if (q.completed) return;

        // 2. Ejecutar chequeo
        if (def.check()) { 
            q.completed = true; 
            this.addXP(def.xp); 
            Data.save(); 
            this.renderProfile(); 
            if(typeof UI !== 'undefined') UI.showSnackbar(`+${def.xp} XP`); 
            if(navigator.vibrate) navigator.vibrate([50, 50]);
        } else {
            if(typeof UI !== 'undefined') UI.showSnackbar("Aún no completada.");
        }
    },

    checkBadges() {
        const g = Data.store.gamification; let newBadge = false;
        this.badgesDef.forEach(b => { if (!g.badges.includes(b.id) && b.check()) { g.badges.push(b.id); newBadge = true; } }); if(newBadge) Data.save();
    },

    addXP(amount) {
        const g = Data.store.gamification; g.xp += amount;
        let required = Math.floor(this.config.baseXP * Math.pow(this.config.difficulty, g.level - 1));
        if (g.xp >= required) { g.xp -= required; g.level++; if(typeof UI !== 'undefined') UI.showSnackbar(`🎉 NIVEL ${g.level}!`); }
        Data.save(); this.updateHomeXP();
    },

    processHistoricalXP() {
        const g = Data.store.gamification; if (g.sync_v24_final) return; 
        let retroXP = (Data.store.lists ? Data.store.lists.filter(l => l.status === 'completed').length * 50 : 0) + (Data.store.expenses ? Data.store.expenses.length * 10 : 0);
        if (retroXP > 0) { g.xp += retroXP; while (g.xp >= Math.floor(this.config.baseXP * Math.pow(this.config.difficulty, g.level - 1))) { g.xp -= Math.floor(this.config.baseXP * Math.pow(this.config.difficulty, g.level - 1)); g.level++; } }
        g.sync_v24_final = true; Data.save();
    },

    checkDailyStreak() {
        const today = new Date().toDateString(); const g = Data.store.gamification;
        if(g.lastLogin !== today) { const yest = new Date(); yest.setDate(yest.getDate()-1); if(g.lastLogin === yest.toDateString()) g.streak++; else g.streak = 1; g.lastLogin = today; Data.save(); }
    },

    analyzeFinancialHealth() { return this.getAnalysisData(); },

    giveTip() {
        const tip = this.getSmartTip();
        let bubble = document.getElementById('mascot-bubble');
        if(!bubble) {
            bubble = document.createElement('div'); bubble.id = 'mascot-bubble'; bubble.className = 'mascot-bubble-side'; 
            bubble.style.cssText = "position:absolute; top:-40px; right:-20px; background:white; padding:10px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.1); font-size:11px; z-index:99; pointer-events:none; opacity:0; transition:all 0.3s; min-width:120px;";
            const img = document.getElementById('mascot-img'); if(img && img.parentElement) img.parentElement.appendChild(bubble);
        }
        bubble.innerText = tip; bubble.style.opacity = '1'; bubble.style.transform = 'scale(1)';
        setTimeout(() => { bubble.style.opacity = '0'; bubble.style.transform = 'scale(0.8)'; }, 5000);
    },

    getSmartTip() {
        const lang = Data.store.settings.lang || 'es'; const h = this.analyzeFinancialHealth();
        const list = this.phrases[h.score < 40 ? 'warning' : 'greeting'][lang] || this.phrases[h.score < 40 ? 'warning' : 'greeting']['es'];
        return list[Math.floor(Math.random() * list.length)];
    },

    injectStyles() {
        if (document.getElementById('assistant-styles')) return;
        const style = document.createElement('style');
        style.id = 'assistant-styles';
        style.innerHTML = `
            @keyframes floatMascot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 25% { transform: translate(-3px, 0px) rotate(1deg); } 75% { transform: translate(3px, 1px) rotate(-1deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
            @keyframes popIn { to { transform: scale(1); opacity: 1; } }

            .mascot-restore {
                width: auto !important; height: 180px !important;
                max-width: 80% !important; object-fit: contain;
                display: block; margin: 0 auto;
            }

            .mascot-bubble-side.active-tip { opacity: 1 !important; transform: scale(1) !important; }
            .profile-quest-row { display: flex; align-items: center; background: rgba(120,120,120,0.05); padding: 10px; border-radius: 12px; margin-bottom: 8px; border: 1px solid var(--glass-border); }
            .pq-icon { font-size: 20px; margin-right: 12px; }
            .pq-info { flex: 1; }
            .pq-title { font-size: 13px; font-weight: 700; color: var(--text-color); }
            .pq-btn { background: var(--input-bg); border: none; padding: 6px 12px; border-radius: 8px; color: var(--primary); font-weight: 700; font-size: 11px; cursor: pointer; }
            .pq-btn.done { background: var(--success); color: white; pointer-events: none; }
            .analysis-box { background: linear-gradient(135deg, rgba(0,122,255,0.05) 0%, rgba(0,122,255,0.01) 100%); border: 1px solid rgba(0,122,255,0.2); border-radius: 16px; margin-bottom: 20px; font-size: 13px; color: var(--text-color); }
            .analysis-tab { flex: 1; background: transparent; border: none; padding: 10px; font-size: 13px; font-weight:700; cursor: pointer; opacity: 0.5; transition: 0.2s; border-bottom: 2px solid transparent; color:var(--text-color); }
            .analysis-tab.active { opacity: 1; border-bottom-color: var(--primary); color:var(--primary); }
        `;
        document.head.appendChild(style);
    }
};
