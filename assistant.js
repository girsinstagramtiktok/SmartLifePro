/* =========================================
   SMART LIFE PRO - ASSISTANT (V9.5 - REAL ECONOMIST)
   Autor: A_True_Alpha
   ========================================= */

const Assistant = {
    tipTimer: null,

    // Configuración de dificultad (Gamificación)
    levelConfig: {
        baseXP: 100,
        difficulty: 1.5
    },

    // --- 1. DEFINICIÓN DE MEDALLAS (AJUSTADAS A TUS CATEGORÍAS REALES) ---
    badgesDef: [
        // PROGRESO
        { id: 'start', icon: '\uD83D\uDE80', name: 'Iniciador', desc: 'Primer uso de la app', condition: () => true },
        { id: 'lvl10', icon: '\uD83C\uDF96', name: 'Veterano', desc: 'Nivel 10', condition: (d) => d.gamification.level >= 10 },
        { id: 'lvl50', icon: '\uD83D\uDC51', name: 'Rey', desc: 'Nivel 50', condition: (d) => d.gamification.level >= 50 },

        // RACHAS (DISCIPLINA)
        { id: 'streak_7', icon: '\uD83D\uDD25', name: 'Constante', desc: '7 días seguidos', condition: (d) => d.gamification.streak >= 7 },
        { id: 'streak_30', icon: '\uD83C\uDF1F', name: 'Hábito de Hierro', desc: '30 días seguidos', condition: (d) => d.gamification.streak >= 30 },

        // VOLUMEN DE DATOS
        { id: 'exp_50', icon: '\uD83D\uDCCA', name: 'Contable', desc: '50 Gastos registrados', condition: (d) => d.expenses && d.expenses.length >= 50 },
        { id: 'list_20', icon: '\uD83D\uDED2', name: 'Abastecedor', desc: '20 Listas completadas', condition: (d) => d.lists && d.lists.filter(l => l.status === 'completed').length >= 20 },
        
        // FINANZAS (LOGROS DE UTILIDAD)
        { id: 'sub_ninja', icon: '\uD83D\uDCFA', name: 'Suscrito', desc: '3 Suscripciones activas', condition: (d) => d.subscriptions && d.subscriptions.length >= 3 },
        { id: 'install_master', icon: '\uD83D\uDCB3', name: 'A Plazos', desc: 'Gestionando 5 compras a cuotas', condition: (d) => d.expenses && d.expenses.filter(e => e.isInstallment).length >= 5 },

        // ESTILO DE VIDA (TUS CATEGORÍAS REALES: Belleza, Ropa, Supermercado)
        { id: 'cat_beauty_king', icon: '\uD83D\uDC85', name: 'Icono de Estilo', desc: '5 gastos en Belleza o Ropa', 
          condition: (d) => d.expenses && d.expenses.filter(e => {
              const c = (e.category || '').toLowerCase();
              return c.includes('belleza') || c.includes('ropa') || c.includes('clothes') || c.includes('beauty');
          }).length >= 5 
        },
        { id: 'cat_market_pro', icon: '\uD83C\uDF4E', name: 'Mercader', desc: '10 gastos en Supermercado', 
          condition: (d) => d.expenses && d.expenses.filter(e => {
              const c = (e.category || '').toLowerCase();
              return c.includes('supermercado') || c.includes('market');
          }).length >= 10 
        },
        { id: 'cat_home_hero', icon: '\uD83C\uDFE1', name: 'Hogareño', desc: 'Gasto fuerte en Hogar', 
          condition: (d) => d.expenses && d.expenses.some(e => {
              const c = (e.category || '').toLowerCase();
              return (c.includes('hogar') || c.includes('home')) && e.amount > 100;
          })
        }
    ],

    // --- INICIALIZACIÓN ---
    init() {
        if (!Data.store.gamification) Data.store.gamification = { xp: 0, level: 1, badges: [], streak: 0, lastLogin: null };
        if (!Data.store.gamification.badges) Data.store.gamification.badges = [];
        
        this.checkDailyStreak(); 
        this.updateMood(); // Analiza finanzas al cargar
        setTimeout(() => this.checkBadges(), 2000);
    },

    // --- 2. CEREBRO FINANCIERO (LÓGICA ECONÓMICA REAL) ---
    
    // Esta función reemplaza los consejos aleatorios por análisis matemático
    getSmartTip() {
        const d = Data.store;
        const limit = (d.budget && d.budget.limit) ? parseFloat(d.budget.limit) : 0;
        
        // Calcular gasto real del mes actual
        let spent = 0;
        if (typeof Finance !== 'undefined') spent = Finance.calculateMonthlySpent();
        
        const now = new Date();
        const day = now.getDate(); // Día actual (ej: 15)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); // Total días (ej: 30)
        const daysLeft = daysInMonth - day;
        
        // 1. ANÁLISIS DE PRESUPUESTO CERO
        if (limit <= 0) return "Sin presupuesto definido, vuelas a ciegas. Toca el círculo para fijar un límite.";

        const remaining = limit - spent;
        const burnRate = spent / day; // Gasto promedio diario actual
        const projectedSpend = burnRate * daysInMonth; // Proyección a fin de mes
        const allowedDaily = remaining / (daysLeft || 1); // Cuánto puedes gastar al día desde hoy

        // 2. ANÁLISIS DE PROYECCIÓN (El Economista te avisa)
        if (projectedSpend > limit && day > 5) {
            const deficit = projectedSpend - limit;
            return `⚠ Alerta: A este ritmo, te faltarán ${UI.formatMoney(deficit)} a fin de mes. Reduce tu gasto diario a ${UI.formatMoney(allowedDaily)}.`;
        }

        // 3. ANÁLISIS DE COSTOS FIJOS (Suscripciones + Parcelas)
        let fixedCosts = 0;
        // Sumar suscripciones activas
        if (d.subscriptions) d.subscriptions.forEach(s => fixedCosts += parseFloat(s.cost));
        // Sumar cuotas activas este mes
        if (d.expenses) {
            d.expenses.filter(e => e.isInstallment).forEach(inst => {
                 // Simplificación: asume cuota activa. Finance tiene la lógica exacta, pero esto es una estimación rápida.
                 if(inst.installments) fixedCosts += (parseFloat(inst.amount)); 
            });
        }
        
        const fixedRatio = fixedCosts / limit;
        if (fixedRatio > 0.40) {
            return `Tus costos fijos (Subs + Cuotas) consumen el ${Math.round(fixedRatio*100)}% de tu sueldo. ¡Es peligroso! Lo ideal es menos del 30%.`;
        }

        // 4. ANÁLISIS DE "GASTO VELOZ" (Early Burn)
        // Si estamos a día 5 y ya gastaste el 40%
        if (day <= 7 && (spent / limit) > 0.35) {
            return "Has gastado mucho en la primera semana. Intenta 'Días Cero Gasto' para compensar.";
        }

        // 5. ANÁLISIS DE ÉXITO (Ahorro potencial)
        if (day > 20 && projectedSpend < (limit * 0.9)) {
            const potentialSavings = limit - projectedSpend;
            return `Vas muy bien. Podrías ahorrar ${UI.formatMoney(potentialSavings)} este mes si mantienes el ritmo.`;
        }

        // 6. CONSEJOS ESPECÍFICOS POR CATEGORÍA (Belleza/Ropa detectado)
        // Buscar categoría más gastada
        // (Simplificado para no sobrecargar el navegador)
        
        // 7. FALLBACK (Consejos Generales de Valor)
        const generics = [
            "La regla 50/30/20: 50% Necesidades, 30% Deseos, 20% Ahorro/Deuda.",
            "Revisa tus suscripciones. ¿Usas todas las que pagas?",
            "Antes de una compra grande, espera 48 horas. Si se pasa el impulso, no lo necesitabas.",
            "Pagar a cuotas (parcelado) compromete tu 'Yo' del futuro. Úsalo con cuidado."
        ];
        return generics[Math.floor(Math.random() * generics.length)];
    },

    // --- FUNCIONES CORE (NO CAMBIAN MUCHO, PERO OPTIMIZADAS) ---
    
    checkDailyStreak() {
        const g = Data.store.gamification;
        const today = new Date().toDateString();
        
        if (g.lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (g.lastLogin === yesterday.toDateString()) {
                g.streak = (g.streak || 0) + 1;
                this.addXP(10 + (g.streak * 2), "Racha Diaria");
                setTimeout(() => { if(typeof UI !== 'undefined') UI.showSnackbar(`🔥 Racha: ${g.streak} días`); }, 1500);
            } else {
                g.streak = 1;
                this.addXP(10, "Login Diario");
            }
            g.lastLogin = today;
            Data.save();
        }
    },

    getRequiredXP(lvl) {
        return Math.floor(this.levelConfig.baseXP * Math.pow(this.levelConfig.difficulty, lvl - 1));
    },

    addXP(amount, reason) {
        if (!Data.store.gamification) return;
        let g = Data.store.gamification;
        g.xp += amount;
        
        let leveledUp = false;
        let required = this.getRequiredXP(g.level);
        
        while (g.xp >= required) {
            g.xp -= required;
            g.level++;
            leveledUp = true;
            required = this.getRequiredXP(g.level);
        }

        Data.save();
        this.updateXPBar(); 
        
        if (leveledUp) {
            if (typeof UI !== 'undefined') UI.showSnackbar(`¡NIVEL ${g.level}! 🎉`);
            if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
            this.updateMood();
            if(document.getElementById('modal-profile').classList.contains('open')) this.renderProfile();
        }
        this.checkBadges();
    },

    checkBadges() {
        if (!Data.store.gamification) return;
        const owned = Data.store.gamification.badges || [];
        let newUnlock = false;

        this.badgesDef.forEach(badge => {
            try {
                if (!owned.includes(badge.id) && badge.condition(Data.store)) {
                    owned.push(badge.id);
                    newUnlock = true;
                    if (typeof UI !== 'undefined') UI.showSnackbar(`🏅 Logro: ${badge.name}`);
                }
            } catch(e) { console.warn("Error badge", badge.id); }
        });

        if (newUnlock) {
            Data.store.gamification.badges = owned;
            Data.save();
            if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
            if(document.getElementById('modal-profile').classList.contains('open')) this.renderProfile();
        }
    },

    updateXPBar() {
        const bar = document.getElementById('xp-fill');
        if (bar && Data.store.gamification) {
            const g = Data.store.gamification;
            const required = this.getRequiredXP(g.level);
            const pct = Math.min(100, (g.xp / required) * 100);
            bar.style.height = `${pct}%`;
            bar.style.width = '100%';
        }
    },

    updateMood() {
        const img = document.getElementById('mascot-img');
        const bubble = document.getElementById('mascot-bubble');
        if (!img || !bubble) return;

        // Análisis simple para la cara de la mascota (Emoción)
        const health = this.analyzeFinancialHealth();
        let mood = 'idle';
        let msg = "Analizando...";

        if (health.score >= 80) { mood = 'happy'; msg = "Economía sana."; }
        else if (health.score >= 50) { mood = 'idle'; msg = "Todo estable."; }
        else if (health.score >= 30) { mood = 'worried'; msg = "Precaución."; }
        else { mood = 'alert'; msg = "¡Crítico!"; }

        img.src = `${mood}.png`;
        if (!bubble.classList.contains('active-tip')) bubble.innerText = msg;
        this.updateXPBar();
    },

    // Cálculo interno de puntaje (0-100)
    analyzeFinancialHealth() {
        let score = 100;
        const limit = (Data.store.budget && Data.store.budget.limit) ? Data.store.budget.limit : 0;
        let spent = 0;
        if (typeof Finance !== 'undefined') spent = Finance.calculateMonthlySpent();

        if (limit === 0) return { score: 60 }; // Sin datos no juzgamos

        const ratio = spent / limit;
        const now = new Date();
        const day = now.getDate();
        const idealRatio = day / 30; 

        // Si gastas más rápido de lo que pasa el tiempo, bajas puntos
        if (ratio > idealRatio * 1.1) score -= 10;
        if (ratio > idealRatio * 1.5) score -= 20;
        if (ratio >= 0.95) score = 10; // Casi al límite

        return { score: Math.max(0, score) };
    },

    giveTip() {
        const bubble = document.getElementById('mascot-bubble');
        const img = document.getElementById('mascot-img');
        if (!bubble || !img) return;

        if (this.tipTimer) clearTimeout(this.tipTimer);

        img.src = 'thinking.png';
        if(navigator.vibrate) navigator.vibrate(20);

        // USAR EL CEREBRO FINANCIERO
        const tip = this.getSmartTip();
        
        bubble.innerText = tip;
        bubble.classList.add('active-tip'); 

        this.tipTimer = setTimeout(() => {
            this.tipTimer = null;
            bubble.classList.remove('active-tip');
            this.updateMood();
        }, 6000); // Más tiempo para leer consejos largos
    },

    renderProfile() {
        if (!Data.store.gamification) return;

        const g = Data.store.gamification;
        const required = this.getRequiredXP(g.level);
        const pct = Math.min(100, (g.xp / required) * 100);
        
        const ringContainer = document.getElementById('profile-level-ring');
        if (ringContainer) {
            ringContainer.innerHTML = `
                <div class="profile-chart-wrap">
                    <svg viewBox="0 0 36 36" class="profile-svg">
                        <path class="profile-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="profile-circle-fill" stroke-dasharray="${pct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div class="profile-inner-content">
                         <span style="font-size:10px; color:var(--text-sec); font-weight:700; letter-spacing:1px; text-transform:uppercase;">NIVEL</span>
                         <span style="font-size:48px; font-weight:900; color:var(--primary); line-height:1;">${g.level}</span>
                    </div>
                </div>
            `;
        }
        
        const xpTxt = document.getElementById('profile-xp-txt');
        if (xpTxt) {
            xpTxt.innerHTML = `
                <div style="font-size:16px; margin-bottom:5px;">${Math.floor(g.xp)} <span style="opacity:0.5">/ ${required} XP</span></div>
                ${g.streak > 1 ? `<div style="font-size:12px; color:var(--warning); font-weight:700;">🔥 Racha de ${g.streak} días</div>` : ''}
            `;
        }

        const grid = document.getElementById('profile-badges-grid');
        if (grid) {
            grid.innerHTML = '';
            const owned = g.badges || [];
            
            this.badgesDef.forEach(badge => {
                const isUnlocked = owned.includes(badge.id);
                const div = document.createElement('div');
                div.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
                div.innerHTML = `
                    <span class="badge-icon" style="${!isUnlocked ? 'filter:grayscale(1); opacity:0.3;' : ''}">${badge.icon}</span>
                    <div class="badge-name">${badge.name}</div>
                    ${!isUnlocked ? '<div style="font-size:10px; opacity:0.5;">🔒</div>' : ''} 
                `;
                div.onclick = () => {
                    const status = isUnlocked ? '🏆 Conseguido' : '🔒 Bloqueado';
                    if (typeof UI !== 'undefined') UI.showSnackbar(`${status}: ${badge.desc}`);
                };
                grid.appendChild(div);
            });
        }
    }
};
