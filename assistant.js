/* =========================================
   SMART LIFE PRO - ASSISTANT (V7.4 - ICON FIX)
   Autor: A_True_Alpha
   ========================================= */

const Assistant = {
    // Control de temporizador para evitar parpadeos
    tipTimer: null,

    // Configuración de dificultad (Gamificación Progresiva)
    levelConfig: {
        baseXP: 100,      // XP necesaria para nivel 2
        difficulty: 1.5   // Multiplicador (Nivel 3 cuesta 1.5x más que Nivel 2)
    },

    // Definición de Medallas (Logros Ampliados)
    badgesDef: [
        // --- NIVELES (PROGRESO GENERAL) ---
        { id: 'start', icon: '\uD83D\uDE80', name: 'Iniciador', desc: 'Primer uso de la app', condition: (d) => true },
        { id: 'lvl5', icon: '\uD83E\uDDE2', name: 'Veterano', desc: 'Nivel 5', condition: (d) => d.gamification.level >= 5 },
        { id: 'lvl10', icon: '\uD83C\uDF96', name: 'Experto', desc: 'Nivel 10', condition: (d) => d.gamification.level >= 10 },
        { id: 'lvl20', icon: '\u2B50', name: 'Maestro', desc: 'Nivel 20', condition: (d) => d.gamification.level >= 20 },
        { id: 'lvl50', icon: '\uD83D\uDC51', name: 'Rey', desc: 'Nivel 50', condition: (d) => d.gamification.level >= 50 },
        { id: 'lvl100', icon: '\uD83C\uDFC6', name: 'Leyenda', desc: 'Nivel 100', condition: (d) => d.gamification.level >= 100 },

        // --- GASTOS REGISTRADOS ---
        { id: 'exp_10', icon: '\uD83D\uDC16', name: 'Ahorrador', desc: '10 Gastos', condition: (d) => d.expenses && d.expenses.length >= 10 },
        { id: 'exp_50', icon: '\uD83D\uDCB8', name: 'Contador', desc: '50 Gastos', condition: (d) => d.expenses && d.expenses.length >= 50 },
        { id: 'exp_100', icon: '\uD83D\uDCD1', name: 'Centurión', desc: '100 Gastos', condition: (d) => d.expenses && d.expenses.length >= 100 },
        { id: 'exp_200', icon: '\uD83D\uDCCA', name: 'Auditor', desc: '200 Gastos', condition: (d) => d.expenses && d.expenses.length >= 200 },
        { id: 'exp_500', icon: '\uD83C\uDFE6', name: 'Magnate', desc: '500 Gastos', condition: (d) => d.expenses && d.expenses.length >= 500 },

        // --- LISTAS DE COMPRA COMPLETADAS ---
        { id: 'list_5', icon: '\uD83D\uDED2', name: 'Comprador', desc: '5 Listas', condition: (d) => d.lists && d.lists.filter(l => l.status === 'completed').length >= 5 },
        { id: 'list_20', icon: '\uD83D\uDE9A', name: 'Abastecedor', desc: '20 Listas', condition: (d) => d.lists && d.lists.filter(l => l.status === 'completed').length >= 20 },
        { id: 'list_50', icon: '\uD83C\uDFEA', name: 'Supermercado', desc: '50 Listas', condition: (d) => d.lists && d.lists.filter(l => l.status === 'completed').length >= 50 },
        { id: 'list_100', icon: '\uD83D\uDCE6', name: 'Mayorista', desc: '100 Listas', condition: (d) => d.lists && d.lists.filter(l => l.status === 'completed').length >= 100 },
        { id: 'list_200', icon: '\uD83C\uDFD7\uFE0F', name: 'Almacén', desc: '200 Listas', condition: (d) => d.lists && d.lists.filter(l => l.status === 'completed').length >= 200 },
        { id: 'list_500', icon: '\uD83D\uDEA2', name: 'Logística', desc: '500 Listas', condition: (d) => d.lists && d.lists.filter(l => l.status === 'completed').length >= 500 },

        // --- SUSCRIPCIONES ---
        { id: 'sub_3', icon: '\uD83D\uDCC5', name: 'Suscrito', desc: '3 Suscripciones', condition: (d) => d.subscriptions && d.subscriptions.length >= 3 },
        { id: 'sub_5', icon: '\uD83D\uDCFA', name: 'Premium', desc: '5 Suscripciones', condition: (d) => d.subscriptions && d.subscriptions.length >= 5 },
        { id: 'sub_10', icon: '\uD83D\uDC8E', name: 'VIP', desc: '10 Suscripciones', condition: (d) => d.subscriptions && d.subscriptions.length >= 10 },

        // --- COMPRAS PARCELADAS (CUOTAS) ---
        { id: 'cred_1', icon: '\uD83D\uDCB3', name: 'A Plazos', desc: '1ª Parcela', condition: (d) => d.expenses && d.expenses.some(e => e.isInstallment) },
        // CORREGIDO: Icono de 'Crédito' cambiado a Página/Factura (\uD83D\uDCC3) para máxima compatibilidad
        { id: 'cred_5', icon: '\uD83D\uDCC3', name: 'Crédito', desc: '5 Parcelas', condition: (d) => d.expenses && d.expenses.filter(e => e.isInstallment).length >= 5 },
        { id: 'cred_10', icon: '\uD83D\uDCC8', name: 'Estratega', desc: '10 Parcelas', condition: (d) => d.expenses && d.expenses.filter(e => e.isInstallment).length >= 10 },
        { id: 'cred_20', icon: '\uD83D\uDCBC', name: 'Banquero', desc: '20 Parcelas', condition: (d) => d.expenses && d.expenses.filter(e => e.isInstallment).length >= 20 },
        { id: 'cred_50', icon: '\uD83C\uDFE2', name: 'Inversor', desc: '50 Parcelas', condition: (d) => d.expenses && d.expenses.filter(e => e.isInstallment).length >= 50 },
        { id: 'cred_100', icon: '\uD83C\uDF0D', name: 'Dueño', desc: '100 Parcelas', condition: (d) => d.expenses && d.expenses.filter(e => e.isInstallment).length >= 100 },

        // --- PRESUPUESTO MENSUAL ---
        { id: 'bud_1k', icon: '\uD83D\uDCB5', name: 'Base 1K', desc: 'Presupuesto 1k+', condition: (d) => d.budget && d.budget.limit >= 1000 },
        { id: 'bud_2k', icon: '\uD83D\uDCB4', name: 'Base 2K', desc: 'Presupuesto 2k+', condition: (d) => d.budget && d.budget.limit >= 2000 },
        { id: 'bud_3k', icon: '\uD83D\uDCB0', name: 'Base 3K', desc: 'Presupuesto 3k+', condition: (d) => d.budget && d.budget.limit >= 3000 },
        { id: 'bud_4k', icon: '\uD83D\uDC8E', name: 'Base 4K', desc: 'Presupuesto 4k+', condition: (d) => d.budget && d.budget.limit >= 4000 },
        { id: 'bud_5k', icon: '\uD83C\uDFDB\uFE0F', name: 'Imperio', desc: 'Presupuesto 5k+', condition: (d) => d.budget && d.budget.limit >= 5000 },
        { id: 'bud_10k', icon: '\uD83D\uDE80', name: 'Infinito', desc: 'Presupuesto 10k+', condition: (d) => d.budget && d.budget.limit >= 10000 }
    ],

    // Mensajes internos de la mascota
    messages: {
        es: {
            status_ok: "Todo bajo control.",
            status_warning: "Cuidado con los gastos.",
            status_danger: "\u00A1Presupuesto cr\u00EDtico!", 
            mood_happy: "\u00A1Excelente gesti\u00F3n!",
            mood_worried: "Ojo con el dinero...",
            mood_alert: "\u00A1Frena los gastos!",
            level_up: "\u00A1NIVEL SUBIDO! \uD83C\uDF89",
            badge_unlock: "\u00A1MEDALLA DESBLOQUEADA!",
            tips: [
                "Intenta cocinar m\u00E1s en casa.",
                "Revisa suscripciones olvidadas.",
                "Usa la lista para no comprar de m\u00E1s.",
                "Ahorrar es saber gastar.",
                "\u00BFRealmente necesitas comprar eso?",
                "Apaga las luces si no las usas.",
                "Compara precios antes de pagar.",
                "La meta es la libertad financiera.",
                "Evita las compras por impulso."
            ]
        },
        en: {
            status_ok: "All under control.",
            status_warning: "Watch your spending.",
            status_danger: "Critical budget!",
            mood_happy: "Great management!",
            mood_worried: "Watch the money...",
            mood_alert: "Stop spending!",
            level_up: "LEVEL UP! \uD83C\uDF89",
            badge_unlock: "BADGE UNLOCKED!",
            tips: [
                "Try cooking at home more.",
                "Check forgotten subscriptions.",
                "Use the list to avoid overbuying.",
                "Saving is knowing how to spend.",
                "Do you really need to buy that?",
                "Turn off lights if not using them.",
                "Compare prices before paying.",
                "The goal is financial freedom.",
                "Avoid impulse buying."
            ]
        },
        pt: {
            status_ok: "Tudo sob controle.",
            status_warning: "Cuidado com os gastos.",
            status_danger: "Or\u00E7amento cr\u00EDtico!", 
            mood_happy: "\u00D3tima gest\u00E3o!", 
            mood_worried: "Olho no dinheiro...",
            mood_alert: "Pare de gastar!",
            level_up: "N\u00CDVEL NOVO! \uD83C\uDF89",
            badge_unlock: "MEDALHA DESBLOQUEADA!",
            tips: [
                "Tente cozinhar mais em casa.",
                "Verifique assinaturas esquecidas.",
                "Use a lista para n\u00E3o comprar demais.",
                "Economizar \u00E9 saber gastar.",
                "Voc\u00EA realmente precisa comprar isso?",
                "Apague as luzes se n\u00E3o usar.",
                "Compare pre\u00E7os antes de pagar.",
                "A meta \u00E9 a liberdade financeira.",
                "Evite compras por impulso."
            ]
        }
    },

    // --- INICIALIZACIÓN ---
    init() {
        if (Data.store.gamification && !Data.store.gamification.badges) {
            Data.store.gamification.badges = [];
        }
        this.updateMood();
        setTimeout(() => this.checkBadges(), 2000);
    },

    getTexts() {
        const lang = (Data.store.settings && Data.store.settings.lang) ? Data.store.settings.lang : 'es';
        return this.messages[lang] || this.messages['es'];
    },

    // --- LÓGICA DE NIVELES ---
    getRequiredXP(currentLevel) {
        return Math.floor(this.levelConfig.baseXP * Math.pow(this.levelConfig.difficulty, currentLevel - 1));
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
            const txt = this.getTexts();
            if (typeof UI !== 'undefined') {
                UI.showSnackbar(`${txt.level_up} (Nvl ${g.level})`);
            }
            if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
            this.updateMood(); 
        }
        
        this.checkBadges();
    },

    checkBadges() {
        if (!Data.store.gamification) return;
        
        const owned = Data.store.gamification.badges || [];
        let newUnlock = false;

        this.badgesDef.forEach(badge => {
            if (!owned.includes(badge.id) && badge.condition(Data.store)) {
                owned.push(badge.id);
                newUnlock = true;
                
                const txt = this.getTexts();
                if (typeof UI !== 'undefined') {
                    UI.showSnackbar(`${txt.badge_unlock}: ${badge.name}`);
                }
            }
        });

        if (newUnlock) {
            Data.store.gamification.badges = owned;
            Data.save();
            if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
        }
    },

    updateXPBar() {
        const bar = document.getElementById('xp-fill');
        if (bar && Data.store.gamification) {
            const g = Data.store.gamification;
            const required = this.getRequiredXP(g.level);
            const pct = Math.min(100, (g.xp / required) * 100);
            bar.style.width = `${pct}%`;
        }
    },

    // --- ESTADO DE ÁNIMO ---
    updateMood() {
        const img = document.getElementById('mascot-img');
        const bubble = document.getElementById('mascot-bubble');
        if (!img || !bubble) return;

        const limit = (Data.store.budget && Data.store.budget.limit) ? Data.store.budget.limit : 0;
        let spent = 0;
        if (typeof Finance !== 'undefined') spent = Finance.calculateMonthlySpent();
        
        const txt = this.getTexts();
        let mood = 'idle';
        let moodText = txt.status_ok;

        if (limit > 0) {
            const ratio = spent / limit;
            if (ratio > 1.0) {
                mood = 'alert';
                moodText = txt.status_danger;
            } else if (ratio > 0.85) {
                mood = 'worried';
                moodText = txt.status_warning;
            } else if (ratio < 0.5 && new Date().getDate() > 15) {
                mood = 'happy';
                moodText = txt.mood_happy;
            }
        }

        img.src = `${mood}.png`;
        
        if (!bubble.classList.contains('active-tip')) {
            bubble.innerText = moodText;
        }

        this.updateXPBar();
    },

    // --- INTERACCIÓN ---
    interact() {
        // Fallback si se llama directamente
        if (typeof Main !== 'undefined' && Main.openProfile) {
            Main.openProfile();
        }
    },

    giveTip() {
        const bubble = document.getElementById('mascot-bubble');
        const img = document.getElementById('mascot-img');
        if (!bubble || !img) return;

        const txt = this.getTexts();
        if (this.tipTimer) clearTimeout(this.tipTimer);

        img.src = 'thinking.png';
        if(navigator.vibrate) navigator.vibrate(20);
        
        const tipsList = txt.tips || ["Ahorra siempre."];
        const randomTip = tipsList[Math.floor(Math.random() * tipsList.length)];
        
        bubble.innerText = randomTip;
        bubble.classList.add('active-tip'); 

        this.tipTimer = setTimeout(() => {
            this.tipTimer = null;
            bubble.classList.remove('active-tip');
            this.updateMood();
        }, 4000);
    },

    // --- RENDERIZAR PERFIL ---
    renderProfile() {
        if (!Data.store.gamification) return;

        const g = Data.store.gamification;
        const required = this.getRequiredXP(g.level);
        const pct = Math.min(100, (g.xp / required) * 100);
        
        const ring = document.getElementById('profile-level-ring');
        if (ring) {
            ring.style.background = `conic-gradient(var(--primary) ${pct}%, rgba(120,120,120,0.1) 0)`;
        }
        
        const lvlNum = document.getElementById('profile-lvl-num');
        if (lvlNum) lvlNum.innerText = g.level;
        
        const xpTxt = document.getElementById('profile-xp-txt');
        if (xpTxt) xpTxt.innerText = `${Math.floor(g.xp)} / ${required} XP`;

        const grid = document.getElementById('profile-badges-grid');
        if (grid) {
            grid.innerHTML = '';
            const owned = g.badges || [];
            
            this.badgesDef.forEach(badge => {
                const isUnlocked = owned.includes(badge.id);
                const div = document.createElement('div');
                div.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
                div.innerHTML = `
                    <span class="badge-icon">${badge.icon}</span>
                    <div class="badge-name">${badge.name}</div>
                    ${!isUnlocked ? '<div style="font-size:9px; margin-top:4px;">\uD83D\uDD12</div>' : ''} 
                `;
                div.onclick = () => {
                    const status = isUnlocked ? '\u2705 Conseguido' : '\uD83D\uDD12 Bloqueado';
                    if (typeof UI !== 'undefined') {
                        UI.showSnackbar(`${status}: ${badge.desc}`);
                    }
                };
                grid.appendChild(div);
            });
        }
    }
};
