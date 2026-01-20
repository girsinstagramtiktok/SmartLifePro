/* =========================================
   SMART LIFE PRO - ASSISTANT CORE (V31.1 - REAL SKINS PREVIEW)
   Autor: A_True_Alpha | Fix: Real PNG Previews
   ========================================= */

const Assistant = {
    config: {
        baseXP: 100,
        difficulty: 1.2, 
        checkInterval: null,
        currentAnalysisTab: 'health'
    },

    // --- DEFINICIÓN DE SKINS (Icon eliminado, usaremos path + idle.png) ---
    skinsDef: [
        { id: 'default', name: 'Clásico', level: 0, path: '' },
        { id: 'ironman', name: 'Ironman', level: 5, path: 'skins/Ironman/' },
        { id: 'potter', name: 'Potter', level: 10, path: 'skins/Potter/' },
        { id: 'gold', name: 'Golden', level: 20, path: 'skins/Gold/' }
    ],

        // --- 1. NUEVO BANCO DE FRASES INTELIGENTES ---
    smartPhrases: {
        // CONTEXTO: CRÍTICO (Menos del 10% del presupuesto)
        critical: {
            es: [
                "⚠️ Alerta Roja: Queda menos del 10%. ¡Cierra el grifo, Master!",
                "🛑 Estás en la zona de peligro. Solo gastos vitales desde ahora.",
                "📉 Tu presupuesto agoniza. Evita cualquier gasto hormiga hoy.",
                "💸 Si sigues así, terminamos el mes en negativo. ¡Control!",
                "⚠️ Emergencia: Saldo crítico. Activa el protocolo de austeridad."
            ],
            en: [
                "⚠️ Red Alert: Less than 10% left. Stop spending, Master!",
                "🛑 Danger zone reached. Only vital expenses from now on.",
                "📉 Budget is dying. Avoid any small purchases today.",
                "💸 Negative balance imminent if you don't stop. Control!",
                "⚠️ Emergency: Critical balance. Austerity mode ON."
            ],
            pt: [
                "⚠️ Alerta Vermelho: Menos de 10% restante. Segura a onda, Master!",
                "🛑 Zona de perigo. Apenas gastos vitais a partir de agora.",
                "📉 Orçamento pedindo socorro. Evite gastos supérfluos hoje.",
                "💸 Se continuar assim, terminamos o mês no negativo. Controle!",
                "⚠️ Emergência: Saldo crítico. Ativar modo economia total."
            ]
        },
        // CONTEXTO: GASTANDO MUY RÁPIDO (Proyección negativa)
        fast_burn: {
            es: [
                "🔥 Vas muy rápido. A este ritmo no llegamos a fin de mes.",
                "🏎️ Baja la velocidad, Master. El gasto diario está por encima del límite.",
                "🧐 He detectado una fuga de capital inusual esta semana. Revisa tus gastos.",
                "📉 Tu proyección indica que faltará dinero el día 25. Ahorra hoy.",
                "⚖️ Estás gastando más de lo que ingresas proporcionalmente. Calma."
            ],
            en: [
                "🔥 Burning cash too fast. We won't make it to the end of the month.",
                "🏎️ Slow down, Master. Daily spending is above the limit.",
                "🧐 Unusual capital leak detected this week. Check your expenses.",
                "📉 Projection shows you'll run out by the 25th. Save today.",
                "⚖️ You are spending disproportionately high. Calm down."
            ],
            pt: [
                "🔥 Queimando caixa muito rápido. Não chegaremos ao fim do mês assim.",
                "🏎️ Vai devagar, Master. O gasto diário está acima do limite.",
                "🧐 Detectei uma fuga de capital incomum esta semana. Revise os gastos.",
                "📉 Projeção indica falta de dinheiro no dia 25. Economize hoje.",
                "⚖️ Você está gastando desproporcionalmente. Calma."
            ]
        },
        // CONTEXTO: BUEN RITMO (Ahorrando)
        good_pace: {
            es: [
                "✅ Excelente gestión, Colega. Estás por debajo del presupuesto.",
                "📈 Tu salud financiera es óptima hoy. Sigue así.",
                "🛡️ Tienes un colchón de seguridad. Buen trabajo manteniendo el control.",
                "🧘 Todo en orden. Tu disciplina financiera está dando frutos.",
                "🐷 Modo Ahorro exitoso. Vas mejor que el mes pasado."
            ],
            en: [
                "✅ Excellent management, Master. You are under budget.",
                "📈 Financial health is optimal today. Keep it up.",
                "🛡️ You have a safety cushion. Great job staying in control.",
                "🧘 All good. Your financial discipline is paying off.",
                "🐷 Saving mode successful. Doing better than last month."
            ],
            pt: [
                "✅ Gestão excelente, Colega. Você está abaixo do orçamento.",
                "📈 Saúde financeira ótima hoje. Continue assim.",
                "🛡️ Você tem uma margem de segurança. Bom trabalho no controle.",
                "🧘 Tudo em ordem. Sua disciplina financeira está dando frutos.",
                "🐷 Modo Economia com sucesso. Melhor que no mês passado."
            ]
        },
        // CONTEXTO: FIN DE SEMANA (Suele ser gasto en Ocio)
        weekend: {
            es: [
                "🍕 Es fin de semana. Cuidado con los gastos de 'Ocio', suelen dispararse.",
                "🍺 Disfruta el finde, pero recuerda registrar cada salida, Master.",
                "🎉 El sábado es el día más peligroso para la billetera. Ojo avizor.",
                "📉 Consejo de finde: Si sales hoy, compensa ahorrando mañana."
            ],
            en: [
                "🍕 It's the weekend. Watch out for 'Leisure' expenses, they tend to spike.",
                "🍺 Enjoy the weekend, but remember to log every outing, Master.",
                "🎉 Saturday is the most dangerous day for the wallet. Stay sharp.",
                "📉 Weekend tip: If you go out today, compensate by saving tomorrow."
            ],
            pt: [
                "🍕 É fim de semana. Cuidado com gastos de 'Lazer', costumam disparar.",
                "🍺 Aproveite o finde, mas lembre de registrar cada saída, Master.",
                "🎉 Sábado é o dia mais perigoso para a carteira. Fique atento.",
                "📉 Dica de finde: Se sair hoje, compense economizando amanhã."
            ]
        },
        // CONTEXTO: SABIDURÍA GENERAL (Relleno inteligente)
        general: {
            es: [
                "💡 No ahorres lo que te sobra después de gastar, gasta lo que te sobra después de ahorrar.",
                "🧠 El interés compuesto es la octava maravilla del mundo, Master.",
                "📉 Un pequeño agujero hunde un gran barco. Cuidado con los gastos hormiga.",
                "🛒 ¿Realmente lo necesitas? Pregúntatelo dos veces antes de comprar.",
                "📅 Revisa tus suscripciones. ¿Usas todo lo que pagas?",
                "💳 Pagar a plazos (parcelas) compromete tu 'Yo' del futuro."
            ],
            en: [
                "💡 Do not save what is left after spending, but spend what is left after saving.",
                "🧠 Compound interest is the eighth wonder of the world, Master.",
                "📉 Beware of little expenses; a small leak will sink a great ship.",
                "🛒 Do you really need it? Ask yourself twice before buying.",
                "📅 Check your subscriptions. Do you use everything you pay for?",
                "💳 Installments compromise your future self."
            ],
            pt: [
                "💡 Não economize o que sobra depois de gastar, gaste o que sobra depois de economizar.",
                "🧠 Os juros compostos são a oitava maravilha do mundo, Master.",
                "📉 Um pequeno buraco afunda um grande navio. Cuidado com gastos formiga.",
                "🛒 Você realmente precisa disso? Pergunte-se duas vezes antes de comprar.",
                "📅 Revise suas assinaturas. Você usa tudo o que paga?",
                "💳 Parcelar compromete o seu 'Eu' do futuro."
            ]
        }
    },


    // --- HELPER FUNCTIONS ---
    countCat(catId) {
        if (!Data.store.expenses) return 0;
        const realName = (typeof UI !== 'undefined' && UI.t) ? UI.t(catId) : catId;
        return Data.store.expenses.filter(e => 
            e.category === catId || 
            e.category === realName || 
            (e.category && e.category.toLowerCase().includes(realName.toLowerCase()))
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
        const realName = (typeof UI !== 'undefined' && UI.t) ? UI.t(catId) : '';

        return Data.store.expenses.some(e => {
            const isToday = new Date(e.date).toDateString() === t;
            if(!isToday) return false;
            if (e.category === catId) return true;
            if (realName && e.category === realName) return true;
            if (realName && e.category.includes(realName)) return true;
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
        { id: 'b_lvl_5', icon: '🐣', name: {es:'Novato'}, desc: {es:'Alcanza el Nivel 5'}, check: () => Data.store.gamification.level >= 5 },
        { id: 'b_lvl_10', icon: '🥉', name: {es:'Aprendiz'}, desc: {es:'Alcanza el Nivel 10'}, check: () => Data.store.gamification.level >= 10 },
        { id: 'b_lvl_15', icon: '🥈', name: {es:'Competente'}, desc: {es:'Alcanza el Nivel 15'}, check: () => Data.store.gamification.level >= 15 },
        { id: 'b_lvl_20', icon: '🥇', name: {es:'Experto'}, desc: {es:'Alcanza el Nivel 20'}, check: () => Data.store.gamification.level >= 20 },
        { id: 'b_lvl_30', icon: '🚀', name: {es:'Maestro'}, desc: {es:'Alcanza el Nivel 30'}, check: () => Data.store.gamification.level >= 30 },
        { id: 'b_lvl_40', icon: '💎', name: {es:'Magnate'}, desc: {es:'Alcanza el Nivel 40'}, check: () => Data.store.gamification.level >= 40 },
        { id: 'b_lvl_50', icon: '👑', name: {es:'Leyenda'}, desc: {es:'Alcanza el Nivel 50'}, check: () => Data.store.gamification.level >= 50 },
        { id: 'b_lvl_60', icon: '🪐', name: {es:'Dios'}, desc: {es:'Alcanza el Nivel 60'}, check: () => Data.store.gamification.level >= 60 },
        
        { id: 'b_month_streak', icon: '🗓️', name: {es:'Superviviente'}, desc: {es:'Mes sin pasar el límite'}, check: () => (Data.store.gamification.monthStreak || 0) > 0 },
        { id: 'b_streak_7', icon: '🔥', name: {es:'Racha Semanal'}, desc: {es:'Usa la app 7 días seguidos'}, check: () => Data.store.gamification.streak >= 7 },
        { id: 'b_streak_30', icon: '🏆', name: {es:'Hábito de Hierro'}, desc: {es:'Usa la app 30 días seguidos'}, check: () => Data.store.gamification.streak >= 30 },

        { id: 'b_start', icon: '🚩', name: {es:'Iniciado'}, desc: {es:'Primer uso de la app'}, check: () => true },
        { id: 'b_budget', icon: '📊', name: {es:'Gerente'}, desc: {es:'Define un presupuesto'}, check: () => Data.store.budget.limit > 0 },
        { id: 'b_list_5', icon: '📝', name: {es:'Planificador'}, desc: {es:'Crea 5 listas de compras'}, check: () => Data.store.lists.length >= 5 },
        { id: 'b_list_master', icon: '📦', name: {es:'Mayorista'}, desc: {es:'Lista con +10 items'}, check: () => Data.store.lists.some(l => l.items.length >= 10) },
        { id: 'b_subs', icon: '📺', name: {es:'Suscrito'}, desc: {es:'3 suscripciones activas'}, check: () => Data.store.subscriptions.length >= 3 },
        { id: 'b_saver', icon: '🐷', name: {es:'Ahorrador'}, desc: {es:'Gasta < 50% del límite'}, check: () => { const l=Data.store.budget.limit; return l>0 && (Finance.calculateMonthlySpent()/l)<0.5; }},
        { id: 'b_safe', icon: '🛡️', name: {es:'Blindado'}, desc: {es:'Gasta < 80% del límite'}, check: () => { const l=Data.store.budget.limit; return l>0 && (Finance.calculateMonthlySpent()/l)<0.8; }},
        { id: 'b_clean_sheet', icon: '✨', name: {es:'Impecable'}, desc: {es:'Sin deudas activas'}, check: () => !Data.store.expenses.some(e=>e.isInstallment) },

        { id: 'b_market', icon: '🛒', name: {es:'Mercader'}, desc: {es:'5 gastos en Supermercado'}, check: () => Assistant.countCat('cat_market') >= 5 },
        { id: 'b_leisure', icon: '🍕', name: {es:'Disfrutón'}, desc: {es:'5 gastos en Ocio/Comida'}, check: () => Assistant.countCat('cat_leisure') >= 5 },
        { id: 'b_transport', icon: '🚌', name: {es:'Nómada'}, desc: {es:'5 gastos en Transporte'}, check: () => Assistant.countCat('cat_transport') >= 5 },
        { id: 'b_clothes', icon: '👕', name: {es:'Estilista'}, desc: {es:'3 gastos en Ropa'}, check: () => Assistant.countCat('cat_clothes') >= 3 },
        { id: 'b_health', icon: '💊', name: {es:'Saludable'}, desc: {es:'3 gastos en Salud'}, check: () => Assistant.countCat('cat_health') >= 3 },
        { id: 'b_bills', icon: '🏠', name: {es:'Casero'}, desc: {es:'5 gastos de Hogar'}, check: () => Assistant.countCat('cat_bills') >= 5 },
        { id: 'b_travel', icon: '✈️', name: {es:'Mochilero'}, desc: {es:'1 gasto de Viaje'}, check: () => Assistant.countCat('cat_travel') >= 1 },
        { id: 'b_beauty', icon: '💅', name: {es:'Vanidoso'}, desc: {es:'1 gasto en Belleza'}, check: () => Assistant.countCat('cat_beauty') >= 1 },
        
        { id: 'b_coffee', icon: '☕', name: {es:'Cafetero'}, desc: {es:'Gasto con descr. "Cafe"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Cafe|Coffee/i)) },
        { id: 'b_gamer', icon: '🎮', name: {es:'Gamer'}, desc: {es:'Gasto con descr. "Juego"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Juego|Game|Steam/i)) },
        { id: 'b_pet', icon: '🐾', name: {es:'Amigo Fiel'}, desc: {es:'Gasto con descr. "Vet/Perro"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Perro|Gato|Vet|Mascota/i)) },
        { id: 'b_investor', icon: '📈', name: {es:'Inversor'}, desc: {es:'Gasto con descr. "Inversion"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Inversion|Accion|Crypto/i)) },
        { id: 'b_night', icon: '🦉', name: {es:'Nocturno'}, desc: {es:'Gasto de 00:00 a 05:00'}, check: () => Data.store.expenses.some(e=>{ const h=new Date(e.date).getHours(); return h>=0 && h<5; }) }
    ],

    // --- 4. POOL DE MISIONES ---
    missionPool: [
        { id: 'm_log', xp: 50, icon: '🖊️', title: {es:"Diario"}, desc: {es:"Registra 1 gasto hoy"}, check: () => Assistant.checkExpToday() },
        { id: 'm_zero', xp: 100, icon: '🛡️', title: {es:"Escudo"}, desc: {es:"0 gastos hoy"}, check: () => !Assistant.checkExpToday() },
        { id: 'm_market', xp: 60, icon: '🛒', title: {es:"Súper"}, desc: {es:"Gasto en Mercado"}, check: () => Assistant.checkCatToday('cat_market') },
        { id: 'm_leisure', xp: 60, icon: '🍕', title: {es:"Relax"}, desc: {es:"Gasto en Ocio"}, check: () => Assistant.checkCatToday('cat_leisure') },
        { id: 'm_transport', xp: 60, icon: '🚌', title: {es:"Ruta"}, desc: {es:"Gasto Transporte"}, check: () => Assistant.checkCatToday('cat_transport') },
        { id: 'm_bills', xp: 70, icon: '💡', title: {es:"Pagos"}, desc: {es:"Gasto Hogar"}, check: () => Assistant.checkCatToday('cat_bills') },
        { id: 'm_health', xp: 80, icon: '💊', title: {es:"Cuidarse"}, desc: {es:"Gasto Salud"}, check: () => Assistant.checkCatToday('cat_health') },
        { id: 'm_tiny', xp: 40, icon: '🐜', title: {es:"Micro"}, desc: {es:"Gasto < 5"}, check: () => Assistant.checkAmountToday('<', 5) },
        { id: 'm_small', xp: 50, icon: '🪙', title: {es:"Pequeño"}, desc: {es:"Gasto 5-20"}, check: () => Assistant.checkAmountToday('range', 5, 20) },
        { id: 'm_medium', xp: 60, icon: '💵', title: {es:"Medio"}, desc: {es:"Gasto 20-50"}, check: () => Assistant.checkAmountToday('range', 20, 50) },
        { id: 'm_big', xp: 80, icon: '🐳', title: {es:"Macro"}, desc: {es:"Gasto > 50"}, check: () => Assistant.checkAmountToday('>', 50) },
        { id: 'm_morning', xp: 50, icon: '☕', title: {es:"Mañanero"}, desc: {es:"Gasto antes 10AM"}, check: () => Assistant.checkHourToday('<', 10) },
        { id: 'm_lunch', xp: 50, icon: '🍽️', title: {es:"Almuerzo"}, desc: {es:"Gasto 12PM-2PM"}, check: () => Assistant.checkHourToday('range', 12, 14) },
        { id: 'm_afternoon', xp: 50, icon: '🌤️', title: {es:"Tarde"}, desc: {es:"Gasto 3PM-6PM"}, check: () => Assistant.checkHourToday('range', 15, 18) },
        { id: 'm_night', xp: 60, icon: '🌙', title: {es:"Cena"}, desc: {es:"Gasto 7PM-10PM"}, check: () => Assistant.checkHourToday('range', 19, 22) },
        { id: 'm_list_new', xp: 40, icon: '📝', title: {es:"Planear"}, desc: {es:"Crea una lista"}, check: () => { const t=new Date().toDateString(); return Data.store.lists.some(l=>new Date(l.date).toDateString()===t); }},
        { id: 'm_list_done', xp: 80, icon: '✅', title: {es:"Cumplir"}, desc: {es:"Completa una lista"}, check: () => { const t=new Date().toDateString(); return Data.store.lists.some(l=>l.status==='completed' && new Date(l.date).toDateString()===t); }},
        { id: 'm_txt_cafe', xp: 50, icon: '☕', title: {es:"Cafeína"}, desc: {es:'Gasto descr "Cafe"'}, check: () => Assistant.checkDescToday('cafe') },
        { id: 'm_txt_pan', xp: 50, icon: '🥖', title: {es:"Panadería"}, desc: {es:'Gasto descr "Pan"'}, check: () => Assistant.checkDescToday('pan') },
        { id: 'm_3_exps', xp: 100, icon: '⚡', title: {es:"Activo"}, desc: {es:"Registra 3 gastos"}, check: () => { const t=new Date().toDateString(); return Data.store.expenses.filter(e=>new Date(e.date).toDateString()===t).length >= 3; }}
    ],

    init() {
        console.log("Assistant v31.1 (Skin IMG Previews) Online");
        this.injectStyles();
        
        if (!Data.store.gamification) Data.store.gamification = { xp: 0, level: 1, badges: [], streak: 0, lastLogin: null, monthStreak: 0, lastSummary: null };
        if (!Data.store.gamification.dailyQuests) Data.store.gamification.dailyQuests = { date: null, quests: [] };
        if (Data.store.gamification.selectedAura) delete Data.store.gamification.selectedAura;
        
        // Inicializar skin por defecto si no existe
        if (!Data.store.gamification.currentSkin) Data.store.gamification.currentSkin = 'default';

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

    // --- LÓGICA DE IMAGEN Y ESTADOS ACTUALIZADA ---
    updateMood(forceState = null) {
        const img = document.getElementById('mascot-img');
        if (!img) return;
        
        // 1. Obtener Skin Actual
        const currentSkinId = Data.store.gamification.currentSkin || 'default';
        const skinDef = this.skinsDef.find(s => s.id === currentSkinId) || this.skinsDef[0];
        const path = skinDef.path; 

        if (img.parentElement) img.parentElement.style = "";
        img.style = ""; 
        img.className = 'mascot-restore'; 

        // 2. Determinar Estado
        if (forceState) {
            // Estado forzado (ej: thinking)
            img.src = path + forceState;
            img.style.animation = "floatMascot 3s ease-in-out infinite"; // Animación suave para thinking
            return;
        }

        // 3. Cálculos de Salud y Alerta
        const health = this.analyzeFinancialHealth();
        const spent = health.spent;
        const limit = health.limit;
        const ratio = limit > 0 ? (spent / limit) : 0;

        // 4. Lógica de selección de imagen
        if (limit > 0 && ratio > 0.9) {
            // ALERTA: Más del 90% gastado
            img.src = path + 'alert.png';
            img.style.animation = "shake 0.5s infinite";
        } else if (health.score < 30) {
            // PREOCUPADO: Score bajo
            img.src = path + 'worried.png';
            img.style.animation = "shake 0.5s infinite";
        } else if (health.score > 80) {
            // FELIZ: Score alto
            img.src = path + 'happy.png';
            img.style.animation = "floatMascot 5s ease-in-out infinite";
        } else {
            // IDLE: Normal
            img.src = path + 'idle.png';
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

        // --- NUEVO: SELECTOR DE SKINS (Con imágenes PNG) ---
        const currentSkin = g.currentSkin || 'default';
        let skinsHTML = `
            <div class="section-label" style="margin-top:0;">Skins</div>
            <div class="skins-scroll-container">`;
            
        this.skinsDef.forEach(skin => {
            const isUnlocked = g.level >= skin.level;
            const isSelected = currentSkin === skin.id;
            const lockState = isUnlocked ? '' : 'locked';
            const activeClass = isSelected ? 'active' : '';
            
            // Construimos la ruta de la imagen idle.png
            const imgPath = skin.path + 'idle.png';
            
            // Prevenir errores de sintaxis en el onclick
            const clickAction = isUnlocked ? `Assistant.setSkin('${skin.id}')` : `UI.showSnackbar('Nivel ${skin.level} necesario')`;

            skinsHTML += `
                <div class="skin-card ${activeClass} ${lockState}" onclick="${clickAction}">
                    <img src="${imgPath}" class="skin-preview-img" alt="${skin.name}" onerror="this.src='idle.png'">
                    <div class="skin-name">${skin.name}</div>
                    ${!isUnlocked ? `<div class="skin-lvl-req">Lv.${skin.level}</div>` : ''}
                </div>
            `;
        });
        skinsHTML += `</div>`;
        container.innerHTML += skinsHTML;

        // Analysis
        const analysisHTML = `
            <div class="section-label" style="margin-top:10px;">Análisis</div>
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

    // --- NUEVA FUNCIÓN: SELECCIONAR SKIN ---
    setSkin(skinId) {
        Data.store.gamification.currentSkin = skinId;
        Data.save();
        this.updateMood(); // Actualizar home
        this.renderProfile(); // Actualizar selector visualmente
        if(navigator.vibrate) navigator.vibrate(20);
        if(typeof UI !== 'undefined') UI.showSnackbar("Skin aplicada");
    },

            renderAnalysisContent() {
        const container = document.getElementById('analysis-inject-area');
        if(!container) return;
        const data = this.getAnalysisData();
        let html = '';
        
        // --- TRADUCCIÓN TÉCNICA (INTEL HUD) ---
        const lang = (Data.store.settings && Data.store.settings.lang) ? Data.store.settings.lang : 'es';
        
        const intelText = {
            es: {
                status_opt: 'ÓPTIMO', status_warn: 'ALERTA', status_crit: 'CRÍTICO',
                lbl_score: 'PUNTUACIÓN', lbl_sys: 'ESTADO SISTEMA', lbl_util: 'Presupuesto Utilizado',
                lbl_burn: 'GASTO DIARIO', lbl_avg: 'Promedio diario',
                lbl_runway: 'COBERTURA', lbl_days: 'DÍAS', lbl_est: 'Estimación',
                lbl_micro: 'MICRO-GASTOS', lbl_proj: 'PROYECCIÓN ANUAL', lbl_anom: 'SIN ANOMALÍAS',
                lbl_insight: 'ANÁLISIS', lbl_insight_txt: 'Estos gastos representan el',
                lbl_curr: 'GASTO ACTUAL', lbl_end: 'FIN DE MES (EST)',
                lbl_cap: 'CAPACIDAD LÍMITE', lbl_safe: 'ZONA SEGURA', lbl_over: 'DESBORDAMIENTO',
                lbl_cycle: 'DÍAS RESTANTES DE CICLO'
            },
            en: {
                status_opt: 'OPTIMAL', status_warn: 'WARNING', status_crit: 'CRITICAL',
                lbl_score: 'SCORE', lbl_sys: 'SYSTEM STATUS', lbl_util: 'Budget Utilized',
                lbl_burn: 'DAILY BURN', lbl_avg: 'Daily average',
                lbl_runway: 'RUNWAY', lbl_days: 'DAYS', lbl_est: 'Estimated coverage',
                lbl_micro: 'MICRO-SPEND', lbl_proj: 'ANNUAL PROJECTION', lbl_anom: 'NO ANOMALIES',
                lbl_insight: 'INTEL INSIGHT', lbl_insight_txt: 'These expenses represent',
                lbl_curr: 'CURRENT SPEND', lbl_end: 'MONTH END (EST)',
                lbl_cap: 'LIMIT CAPACITY', lbl_safe: 'SAFE ZONE', lbl_over: 'OVERFLOW',
                lbl_cycle: 'DAYS REMAINING IN CYCLE'
            },
            pt: {
                status_opt: 'ÓTIMO', status_warn: 'ALERTA', status_crit: 'CRÍTICO',
                lbl_score: 'PONTUAÇÃO', lbl_sys: 'STATUS SISTEMA', lbl_util: 'Orçamento Utilizado',
                lbl_burn: 'GASTO DIÁRIO', lbl_avg: 'Média diária',
                lbl_runway: 'COBERTURA', lbl_days: 'DIAS', lbl_est: 'Estimativa',
                lbl_micro: 'MICRO-GASTOS', lbl_proj: 'PROJEÇÃO ANUAL', lbl_anom: 'SEM ANOMALIAS',
                lbl_insight: 'ANÁLISE', lbl_insight_txt: 'Estes gastos representam',
                lbl_curr: 'GASTO ATUAL', lbl_end: 'FIM DO MÊS (EST)',
                lbl_cap: 'CAPACIDADE', lbl_safe: 'ZONA SEGURA', lbl_over: 'ESTOURO',
                lbl_cycle: 'DIAS RESTANTES DO CICLO'
            }
        };

        const t = intelText[lang] || intelText['es'];
        const fmt = (v) => (typeof UI !== 'undefined' ? UI.formatMoney(v) : v);

        if (this.config.currentAnalysisTab === 'health') {
            // --- TAB 1: STATUS (HUD) ---
            const color = data.score > 80 ? 'var(--success)' : (data.score > 40 ? 'var(--warning)' : 'var(--danger)');
            const statusText = data.score > 80 ? t.status_opt : (data.score > 40 ? t.status_warn : t.status_crit);
            
            html = `
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px;">
                    <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; border:4px solid ${color}; border-radius:50%; box-shadow:0 0 15px ${color}40;">
                        <div style="font-size:24px; font-weight:900; color:${color}; letter-spacing:-1px;">${data.score}</div>
                        <div style="position:absolute; bottom:-20px; font-size:9px; font-weight:700; background:${color}; color:white; padding:2px 8px; border-radius:10px;">${t.lbl_score}</div>
                    </div>
                    <div style="flex:1; margin-left:15px; text-align:right;">
                        <div class="intel-label">${t.lbl_sys}</div>
                        <div class="intel-value" style="color:${color}; font-size:20px;">${statusText}</div>
                        <div class="tech-bar-bg"><div class="tech-bar-fill" style="width:${data.score}%; background:${color};"></div></div>
                        <div class="intel-sub" style="margin-top:5px;">${data.percent.toFixed(1)}% ${t.lbl_util}</div>
                    </div>
                </div>
                
                <div class="intel-grid">
                    <div class="intel-card">
                        <div class="intel-label">${t.lbl_burn}</div>
                        <div class="intel-value">${fmt(data.dailyBurn)}</div>
                        <div class="intel-sub">${t.lbl_avg}</div>
                    </div>
                    <div class="intel-card">
                        <div class="intel-label">${t.lbl_runway}</div>
                        <div class="intel-value">${Math.floor(data.daysLeftMoney)} <span style="font-size:10px;">${t.lbl_days}</span></div>
                        <div class="intel-sub">${t.lbl_est}</div>
                    </div>
                </div>
            `;

        } else if (this.config.currentAnalysisTab === 'leaks') {
            // --- TAB 2: ANOMALY DETECTION (LOGS) ---
            const totalAnts = data.topAnts.reduce((sum, item) => sum + item[1], 0);
            const projection = totalAnts * 12;

            html = `
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:10px; border-bottom:1px solid rgba(120,120,120,0.1); padding-bottom:10px;">
                    <div>
                        <div class="intel-label">${t.lbl_micro}</div>
                        <div class="intel-value" style="color:var(--danger);">${fmt(totalAnts)}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="intel-label">${t.lbl_proj}</div>
                        <div class="log-mono" style="opacity:0.6;">-${fmt(projection)}</div>
                    </div>
                </div>
                
                <div style="max-height:120px; overflow-y:auto;">
                    ${data.topAnts.length ? data.topAnts.map(a => `
                        <div class="log-row">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <span style="width:4px; height:4px; background:var(--danger); border-radius:50%;"></span>
                                ${a[0].toUpperCase()}
                            </span>
                            <span class="log-mono">${fmt(a[1])}</span>
                        </div>
                    `).join('') : `<div style="padding:10px; text-align:center; font-size:11px; opacity:0.5;">${t.lbl_anom}</div>`}
                </div>
                <div class="intel-card" style="margin-top:10px; background:rgba(255, 59, 48, 0.05); border-color:rgba(255, 59, 48, 0.2);">
                    <div class="scan-line"></div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <div style="font-size:18px;">🐜</div>
                        <div>
                            <div class="intel-label" style="color:var(--danger);">${t.lbl_insight}</div>
                            <div style="font-size:10px; line-height:1.3;">${t.lbl_insight_txt} <b>${((totalAnts/(data.spent||1))*100).toFixed(1)}%</b></div>
                        </div>
                    </div>
                </div>
            `;

        } else {
            // --- TAB 3: FUTURO (AHORA EN ESPAÑOL) ---
            const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
            const today = new Date().getDate();
            const daysRemaining = daysInMonth - today;
            const safe = data.limit > 0 && data.projectedTotal <= data.limit;
            const statusColor = safe ? 'var(--success)' : 'var(--danger)';
            
            const limitWidth = 100;
            const projectedWidth = data.limit > 0 ? Math.min(100, (data.projectedTotal / data.limit) * 100) : 100;

            html = `
                <div class="intel-grid" style="margin-top:0;">
                    <div class="intel-card">
                        <div class="intel-label">${t.lbl_curr}</div>
                        <div class="intel-value">${fmt(data.spent)}</div>
                    </div>
                    <div class="intel-card">
                        <div class="intel-label">${t.lbl_end}</div>
                        <div class="intel-value" style="color:${statusColor}">${fmt(data.projectedTotal)}</div>
                    </div>
                </div>

                <div class="intel-card" style="margin-top:10px; padding:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <div class="intel-label">${t.lbl_cap}</div>
                        <div class="log-mono" style="font-size:10px;">${fmt(data.limit)}</div>
                    </div>
                    <div style="position:relative; height:8px; background:rgba(120,120,120,0.1); border-radius:4px; overflow:hidden;">
                         <div style="position:absolute; left:0; top:0; height:100%; width:${projectedWidth}%; background:${statusColor}; opacity:0.3;"></div>
                         <div style="position:absolute; left:0; top:0; height:100%; width:${Math.min(100, (data.spent/data.limit)*100)}%; background:${statusColor}; box-shadow:0 0 10px ${statusColor};"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:5px;">
                        <div class="intel-label">${Math.round(projectedWidth)}% PROJ.</div>
                        <div class="intel-label" style="color:${statusColor}">${safe ? t.lbl_safe : t.lbl_over}</div>
                    </div>
                </div>

                <div style="margin-top:10px; font-size:10px; color:var(--text-sec); text-align:center; font-family:'Roboto Mono', monospace;">
                    [ T-${daysRemaining} ${t.lbl_cycle} ]
                </div>
            `;
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
        // 1. Mostrar 'Thinking' momentáneamente
        this.updateMood('thinking.png');

        const tip = this.getSmartTip();
        let bubble = document.getElementById('mascot-bubble');
        if(!bubble) {
            bubble = document.createElement('div'); bubble.id = 'mascot-bubble'; bubble.className = 'mascot-bubble-side'; 
            bubble.style.cssText = "position:absolute; top:-40px; right:-20px; background:white; padding:10px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.1); font-size:11px; z-index:99; pointer-events:none; opacity:0; transition:all 0.3s; min-width:120px;";
            const img = document.getElementById('mascot-img'); if(img && img.parentElement) img.parentElement.appendChild(bubble);
        }
        bubble.innerText = tip; bubble.style.opacity = '1'; bubble.style.transform = 'scale(1)';
        
        // 2. Restaurar estado normal después de 5 segs (cuando desaparece la burbuja)
        setTimeout(() => { 
            bubble.style.opacity = '0'; 
            bubble.style.transform = 'scale(0.8)'; 
            this.updateMood(); // Vuelve a calcular el estado según finanzas
        }, 5000);
    },

        // --- 2. LÓGICA CONTEXTUAL REAL ---
    getSmartTip() {
        const lang = (Data.store.settings && Data.store.settings.lang) ? Data.store.settings.lang : 'es';
        const d = this.getAnalysisData(); // Usamos tu función de análisis existente
        const limit = d.limit;
        const spent = d.spent;
        const remaining = limit - spent;
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        
        // Datos de fecha
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0=Dom, 6=Sab
        const isWeekend = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0); // Vie, Sab, Dom
        const dayOfMonth = today.getDate();
        const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        
        // 1. PRIORIDAD MÁXIMA: ALERTA CRÍTICA
        // Si queda menos del 10% del presupuesto
        if (limit > 0 && percent >= 90) {
            return this.getRandomPhrase('critical', lang);
        }

        // 2. PROYECCIÓN NEGATIVA (Fast Burn)
        // Si estamos a mitad de mes (día 15) y ya gastamos más del 65%, o día 10 y más del 45%
        // Cálculo simple: Deberíamos gastar ~3.3% al día. Si vamos un 15% por encima de lo esperado.
        const expectedPercent = (dayOfMonth / totalDays) * 100;
        if (limit > 0 && percent > (expectedPercent + 15)) {
            return this.getRandomPhrase('fast_burn', lang);
        }

        // 3. CONTEXTO FIN DE SEMANA
        // Si es Finde y la salud no es crítica, recordamos el ocio
        if (isWeekend && Math.random() > 0.4) { // 60% prob en finde
            return this.getRandomPhrase('weekend', lang);
        }

        // 4. BUEN RITMO
        // Si vamos un 10% por DEBAJO de lo esperado (ahorrando)
        if (limit > 0 && percent < (expectedPercent - 10)) {
             return this.getRandomPhrase('good_pace', lang);
        }

        // 5. DEFAULT / GENERAL
        // Si no pasa nada extraordinario, soltamos sabiduría financiera
        return this.getRandomPhrase('general', lang);
    },

    // Helper para sacar frase aleatoria
    getRandomPhrase(category, lang) {
        const list = this.smartPhrases[category][lang] || this.smartPhrases[category]['es'];
        return list[Math.floor(Math.random() * list.length)];
    },


            injectStyles() {
        if (document.getElementById('assistant-styles')) return;
        const style = document.createElement('style');
        style.id = 'assistant-styles';
        style.innerHTML = `
            /* ANIMACIONES */
            @keyframes floatMascot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 25% { transform: translate(-3px, 0px) rotate(1deg); } 75% { transform: translate(3px, 1px) rotate(-1deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
            @keyframes scanline { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

            /* MASCOTA & BURBUJA */
            .mascot-restore { width: auto !important; height: 180px !important; max-width: 80% !important; object-fit: contain; display: block; margin: 0 auto; }
            .mascot-bubble-side { background: var(--glass-bg); padding: 10px 15px; border-radius: 12px; border-bottom-left-radius: 2px; font-weight: 600; font-size: 12px; color: var(--text-color); box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid var(--glass-border); }

            /* --- MISIONES (RESTAURADO) --- */
            .profile-quest-row { display: flex; align-items: center; justify-content: space-between; background: rgba(120,120,120,0.05); padding: 10px; border-radius: 12px; margin-bottom: 8px; border: 1px solid var(--glass-border); }
            .pq-icon { font-size: 20px; margin-right: 12px; }
            .pq-info { flex: 1; margin-right: 10px; }
            .pq-title { font-size: 13px; font-weight: 700; color: var(--text-color); }
            .pq-desc { font-size: 10px; opacity: 0.7; }
            .pq-btn { background: var(--input-bg); border: none; padding: 6px 12px; border-radius: 8px; color: var(--primary); font-weight: 700; font-size: 11px; cursor: pointer; white-space: nowrap; }
            .pq-btn.done { background: var(--success); color: white; pointer-events: none; }

            /* --- INTEL DASHBOARD STYLES --- */
            .analysis-box { 
                background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.0) 100%); 
                border: 1px solid rgba(120,120,120,0.15); 
                border-radius: 16px; margin-bottom: 20px; overflow: hidden; 
                box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
            }
            .dark-mode .analysis-box { background: rgba(0,0,0,0.2); border-color: rgba(255,255,255,0.1); }

            .analysis-tab { 
                flex: 1; background: transparent; border: none; padding: 12px; 
                font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
                cursor: pointer; opacity: 0.6; transition: 0.2s; 
                border-bottom: 2px solid transparent; color: var(--text-sec);
            }
            .analysis-tab.active { opacity: 1; border-bottom-color: var(--primary); color: var(--primary); background: rgba(120,120,120,0.05); }

            .intel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
            .intel-card {
                background: var(--input-bg); border-radius: 10px; padding: 10px;
                display: flex; flex-direction: column; justify-content: center;
                border: 1px solid rgba(0,0,0,0.03); position: relative; overflow: hidden;
            }
            .intel-label { font-size: 9px; text-transform: uppercase; color: var(--text-sec); font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px; }
            .intel-value { font-family: 'Roboto Mono', monospace; font-size: 16px; font-weight: 700; color: var(--text-color); }
            .intel-sub { font-size: 9px; opacity: 0.7; margin-top: 2px; }

            .tech-bar-bg { height: 6px; background: rgba(120,120,120,0.1); border-radius: 3px; overflow: hidden; margin-top: 5px; }
            .tech-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; position: relative; }
            
            .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: scanline 2s infinite linear; pointer-events: none; }

            .log-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed rgba(120,120,120,0.1); font-size: 11px; }
            .log-mono { font-family: 'Roboto Mono', monospace; font-weight: 700; }

            /* SKINS */
            .skins-scroll-container { display: flex; gap: 12px; overflow-x: auto; padding: 5px 5px 15px 5px; margin-bottom: 10px; scrollbar-width: none; }
            .skins-scroll-container::-webkit-scrollbar { display: none; }
            .skin-card { min-width: 80px; background: var(--input-bg); border: 2px solid transparent; border-radius: 16px; padding: 12px 5px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; position: relative; }
            .skin-card.active { background: var(--glass-bg); border-color: var(--primary); box-shadow: 0 4px 15px rgba(0, 110, 230, 0.2); transform: translateY(-2px); }
            .skin-card.locked { opacity: 0.6; filter: grayscale(1); background: rgba(0,0,0,0.02); }
            .skin-preview-img { width: 45px; height: 45px; object-fit: contain; margin-bottom: 5px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
            .skin-name { font-size: 11px; font-weight: 700; color: var(--text-color); }
            .skin-lvl-req { position: absolute; top: -5px; right: -5px; background: var(--text-sec); color: white; font-size: 9px; padding: 2px 6px; border-radius: 8px; font-weight: 700; }
        `;
        document.head.appendChild(style);
    },
};
