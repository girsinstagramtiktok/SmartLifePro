/* =========================================
   SMART LIFE PRO - ASSISTANT CORE (V33.0 - LLAMA 3.3 + LLAMA 4 VISION + NATIVE ANDROID BRIDGE)
   Autor: A_True_Alpha
   ========================================= */

const GroqAI = {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    textModel: 'llama-3.3-70b-versatile',
    fallbackTextModel: 'llama-3.1-8b-instant',
    visionModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    maxAttempts: 2,

    getApiKey(silent = false) {
        if (!Data.store.settings) Data.store.settings = {};
        const stored = (Data.store.settings.groqApiKey || '').trim();
        if (stored) return stored;
        if (silent) return null;

        const key = prompt('Ingresa tu API key gratuita de Groq (empieza por gsk_):');
        if (!key || !key.trim()) return null;

        Data.store.settings.groqApiKey = key.trim();
        Data.save();
        return Data.store.settings.groqApiKey;
    },

    clearApiKey() {
        if (Data.store.settings) {
            Data.store.settings.groqApiKey = '';
            Data.save();
        }
    },

    todayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },

    ensureUsageState() {
        if (!Data.store.settings) Data.store.settings = {};
        const today = this.todayKey();
        let state = Data.store.settings.groqUsage;
        if (!state || state.date !== today) {
            state = { date: today, requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, cachedTokens: 0, models: {} };
            Data.store.settings.groqUsage = state;
            Data.save();
        }
        return state;
    },

    headerNumber(response, name) {
        const raw = response?.headers?.get(name);
        if (raw === null || raw === undefined || raw === '') return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    },

    recordResponse(response, data, model, success) {
        if (typeof Data === 'undefined' || !Data.store) return;
        const state = this.ensureUsageState();
        const modelId = model || data?.model || 'unknown';
        if (!state.models[modelId]) {
            state.models[modelId] = { requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, cachedTokens: 0, quota: {} };
        }
        const m = state.models[modelId];
        const usage = data?.usage || {};
        if (success) {
            const prompt = Number(usage.prompt_tokens || 0);
            const completion = Number(usage.completion_tokens || 0);
            const total = Number(usage.total_tokens || (prompt + completion));
            state.requests += 1; state.promptTokens += prompt; state.completionTokens += completion; state.totalTokens += total;
            m.requests += 1; m.promptTokens += prompt; m.completionTokens += completion; m.totalTokens += total;
        }
        const quota = {
            limitRequests: this.headerNumber(response, 'x-ratelimit-limit-requests'),
            remainingRequests: this.headerNumber(response, 'x-ratelimit-remaining-requests'),
            limitTokens: this.headerNumber(response, 'x-ratelimit-limit-tokens'),
            remainingTokens: this.headerNumber(response, 'x-ratelimit-remaining-tokens'),
            updatedAt: Date.now()
        };
        Object.keys(quota).forEach(k => { if (quota[k] !== null && quota[k] !== undefined) m.quota[k] = quota[k]; });
        Data.store.settings.groqUsage = state;
        Data.save();
        this.refreshUsagePanel();
    },

    getUsageState() { return this.ensureUsageState(); },

    compactNumber(value) {
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(value || 0));
    },

    modelUsageHTML(modelId, label) {
        const state = this.getUsageState();
        const m = state.models?.[modelId] || null;
        if (!m) {
            return `<div style="padding:10px 0; border-top:1px solid rgba(120,120,120,0.1);"><div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;"><span>${label}</span><span style="color:var(--text-sec);">Listo</span></div></div>`;
        }
        const q = m.quota || {};
        const rpd = (q.remainingRequests !== undefined && q.limitRequests !== undefined)
            ? `${this.compactNumber(q.remainingRequests)} / ${this.compactNumber(q.limitRequests)} RPD restantes`
            : 'Cuota activa';
        return `<div style="padding:10px 0; border-top:1px solid rgba(120,120,120,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:12px; font-weight:800;">${label}</span><span style="font-size:10px; color:var(--text-sec);">${m.requests} req · ${this.compactNumber(m.totalTokens)} tok</span></div>
            <div style="font-size:10px; color:var(--text-sec); margin-top:4px;">${rpd}</div>
        </div>`;
    },

    getUsageCardHTML() {
        const state = this.getUsageState();
        const hasKey = !!(Data.store.settings && Data.store.settings.groqApiKey);
        return `<div id="groq-usage-card-inner" class="glass-card" style="padding:15px; margin:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <div style="font-size:14px; font-weight:800;">Smarty AI · Groq Cloud</div>
                    <div style="font-size:10px; color:var(--text-sec); margin-top:2px;">Llama 3.3 70B + Llama 4 Vision</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:18px; font-weight:900; color:var(--primary);">${this.compactNumber(state.totalTokens)}</div>
                    <div style="font-size:9px; color:var(--text-sec); text-transform:uppercase;">tokens hoy</div>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;">
                <div style="background:var(--input-bg); border-radius:12px; padding:9px; text-align:center;"><b>${state.requests}</b><div style="font-size:9px; color:var(--text-sec);">solicitudes</div></div>
                <div style="background:var(--input-bg); border-radius:12px; padding:9px; text-align:center;"><b>${hasKey ? 'Activa ✅' : 'Sin Clave'}</b><div style="font-size:9px; color:var(--text-sec);">API Key</div></div>
            </div>
            ${this.modelUsageHTML(this.textModel, 'Smarty · Llama 3.3 70B')}
            ${this.modelUsageHTML(this.visionModel, 'Smarty · Llama 4 Vision')}
            <button class="text-btn-small" style="width:100%; margin-top:10px; background:var(--input-bg);" onclick="GroqAI.promptNewKey()">🔑 Configurar / Cambiar API Key de Groq</button>
        </div>`;
    },

    promptNewKey() {
        const current = Data.store.settings?.groqApiKey || '';
        const key = prompt('Ingresa tu API Key de Groq (gsk_...):', current);
        if (key !== null) {
            Data.store.settings.groqApiKey = key.trim();
            Data.save();
            this.refreshUsagePanel();
            if (typeof UI !== 'undefined') UI.showSnackbar('API Key actualizada');
        }
    },

    refreshUsagePanel() {
        const host = document.getElementById('groq-usage-card');
        if (host) host.innerHTML = this.getUsageCardHTML();
    },

    sleep(ms) { return new Promise(r => setTimeout(r, ms)); },

    async request(payload, { timeoutMs = 30000, silentKey = false } = {}) {
        const apiKey = this.getApiKey(silentKey);
        if (!apiKey) throw new Error('GROQ_KEY_CANCELLED');
        let lastError = null;

        for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await fetch(this.endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                const raw = await response.text();
                let data = {};
                try { data = raw ? JSON.parse(raw) : {}; } catch (_) { data = { error: { message: raw } }; }

                this.recordResponse(response, data, payload?.model, response.ok);
                if (response.ok) return data;

                if ((response.status === 429 || response.status === 404 || response.status === 400) && payload.model === this.textModel) {
                    payload.model = this.fallbackTextModel;
                    continue;
                }

                const err = new Error(data?.error?.message || `Error HTTP ${response.status}`);
                err.status = response.status;
                lastError = err;
                if (response.status === 401 || response.status === 403) {
                    this.clearApiKey();
                    throw err;
                }
                await this.sleep(800);
            } catch (err) {
                clearTimeout(timeoutId);
                lastError = err;
                if (err?.status === 401 || err?.status === 403) throw err;
                if (attempt < this.maxAttempts - 1) await this.sleep(800);
            }
        }
        throw lastError || new Error('Error conectando con Groq.');
    },

    extractText(data) {
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text !== 'string' || !text.trim()) throw new Error('Respuesta vacía.');
        return text.trim();
    },

    parseJSON(text) {
        const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        try { return JSON.parse(cleaned); }
        catch (_) {
            const m = cleaned.match(/\{[\s\S]*\}/);
            if (!m) throw new Error('JSON inválido');
            return JSON.parse(m[0]);
        }
    },

    async chat(systemPrompt, userText, { maxTokens = 650 } = {}) {
        const payload = {
            model: this.textModel,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userText }],
            temperature: 0.4,
            max_completion_tokens: maxTokens,
            stream: false
        };
        const data = await this.request(payload, { timeoutMs: 30000 });
        return this.extractText(data);
    },

    async textJSON(instructions, userText, schemaName, schema, { maxTokens = 900, silentKey = false } = {}) {
        const schemaHint = `\nReturn ONLY valid JSON matching this schema: ${JSON.stringify(schema)}`;
        const payload = {
            model: this.textModel,
            messages: [{ role: 'system', content: instructions + schemaHint }, { role: 'user', content: userText }],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_completion_tokens: maxTokens,
            stream: false
        };
        const data = await this.request(payload, { timeoutMs: 25000, silentKey });
        return this.parseJSON(this.extractText(data));
    },

    async visionJSON(promptText, rawBase64) {
        const payload = {
            model: this.visionModel,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: promptText },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${rawBase64}` } }
                ]
            }],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_completion_tokens: 1400,
            stream: false
        };
        const data = await this.request(payload, { timeoutMs: 45000 });
        return this.parseJSON(this.extractText(data));
    },

    listenOnce() {
        return new Promise((resolve, reject) => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                return reject(new Error('VOICE_UNSUPPORTED'));
            }
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            const lang = Data?.store?.settings?.lang || 'es';
            recognition.lang = lang === 'pt' ? 'pt-BR' : (lang === 'en' ? 'en-US' : 'es-ES');
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            let settled = false;
            recognition.onresult = (e) => {
                if (settled) return;
                settled = true;
                const t = e?.results?.[0]?.[0]?.transcript?.trim();
                t ? resolve(t) : reject(new Error('VOICE_NO_SPEECH'));
            };
            recognition.onerror = () => { if (!settled) { settled = true; reject(new Error('VOICE_ERROR')); } };
            recognition.onend = () => { if (!settled) { settled = true; reject(new Error('VOICE_NO_SPEECH')); } };
            try { recognition.start(); } catch (_) { reject(new Error('VOICE_ERROR')); }
        });
    },

    friendlyError(err) {
        if (err?.message === 'GROQ_KEY_CANCELLED') return null;
        if (err?.message === 'VOICE_UNSUPPORTED') return 'Tu navegador no soporta voz.';
        if (err?.message === 'VOICE_NO_SPEECH') return 'No pude escuchar una frase completa.';
        if (err?.status === 401 || err?.status === 403) return 'API key de Groq inválida.';
        return 'Smarty no pudo completar la acción.';
    }
};
window.GroqAI = GroqAI;

const NativeBridge = {
    initialized: false,
    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.scheduleSubscriptionReminders();
        window.addEventListener('SmartyBankNotification', (e) => {
            if (e && e.detail) this.processIncomingBankNotification(e.detail);
        });
    },
    async sendImmediateNotification(title, body, id = Math.floor(Math.random() * 90000) + 1000) {
        if (Data.store.settings?.subNotifications === false) return;
        if (window.Capacitor?.Plugins?.LocalNotifications) {
            try {
                await window.Capacitor.Plugins.LocalNotifications.schedule({
                    notifications: [{ id, title, body, schedule: { at: new Date(Date.now() + 800) } }]
                });
                return;
            } catch (_) {}
        }
        if ('Notification' in window && Notification.permission === 'granted') {
            try { new Notification(title, { body, icon: 'logo.png' }); } catch (_) {}
        }
    },
    async scheduleSubscriptionReminders() {
        if (Data.store.settings?.subNotifications === false) return;
        const subs = Data.store.subscriptions || [];
        if (!subs.length) return;
        if (window.Capacitor?.Plugins?.LocalNotifications) {
            try {
                await window.Capacitor.Plugins.LocalNotifications.requestPermissions();
                const now = new Date();
                const notifications = [];
                subs.forEach((sub, idx) => {
                    const day = parseInt(sub.day, 10);
                    if (!day || day < 1 || day > 31) return;
                    let nextDate = new Date(now.getFullYear(), now.getMonth(), day - 1, 9, 30, 0);
                    if (nextDate <= now) nextDate = new Date(now.getFullYear(), now.getMonth() + 1, day - 1, 9, 30, 0);
                    notifications.push({
                        id: 5000 + idx,
                        title: `🔔 Cobro próximo: ${sub.name}`,
                        body: `Mañana (día ${day}) se cobra ${sub.name} (${UI.formatMoney(sub.cost)})`,
                        schedule: { at: nextDate }
                    });
                });
                if (notifications.length) await window.Capacitor.Plugins.LocalNotifications.schedule({ notifications });
            } catch (_) {}
        }
    },
    async processIncomingBankNotification(notif) {
        if (!Data.store.settings?.bankAutoDetect) return;
        const fullText = `${notif.title || ''} - ${notif.text || notif.body || ''}`.trim();
        if (fullText.length < 6) return;
        const categories = ['cat_market','cat_leisure','cat_transport','cat_clothes','cat_health','cat_bills','cat_travel','cat_beauty','cat_other'];
        let extracted = null;
        if (Data.store.settings?.groqApiKey) {
            try {
                const schema = {
                    type: 'object',
                    properties: { isRealExpense: { type: 'boolean' }, amount: { type: 'number' }, merchant: { type: 'string' }, category: { type: 'string', enum: categories } },
                    required: ['isRealExpense', 'amount', 'merchant', 'category']
                };
                extracted = await GroqAI.textJSON(`Analyze banking notification: "${fullText}". Extract real payment out. Allowed categories: ${categories.join(', ')}`, fullText, 'bank_notif', schema, { maxTokens: 300, silentKey: true });
                if (!extracted.isRealExpense) return;
            } catch (_) {}
        }
        if (!extracted || !extracted.amount) {
            const m = fullText.match(/(\d+(?:[.,]\d{1,2})?)/);
            if (!m) return;
            extracted = { amount: parseFloat(m[1].replace(',', '.')), merchant: notif.title || 'Pago Bancario', category: 'cat_other' };
        }
        const amount = Number(extracted.amount);
        if (!amount || amount <= 0) return;

        if (Data.store.settings.bankAutoSaveMode === 'auto') {
            Data.store.expenses.push({
                id: Date.now().toString(), date: Date.now(), amount,
                desc: `🏦 ${extracted.merchant}`, category: UI.t(extracted.category || 'cat_other'),
                isInstallment: false, installments: null
            });
            Data.save();
            UI.renderBudgetChart(); Finance.renderHomeWidgets();
            Assistant.showReactivePopup(`🏦 Gasto auto-registrado: ${UI.formatMoney(amount)} en ${extracted.merchant}`);
        } else {
            Finance.openSmartExpenseModal(amount, `🏦 ${extracted.merchant}`, extracted.category || 'cat_other');
        }
    },
    simulateBankNotification() {
        Data.store.settings.bankAutoDetect = true;
        Data.save();
        const samples = [
            { title: 'Nubank', text: 'Compra aprobada en Uber Trip por $24.50' },
            { title: 'Mercado Pago', text: 'Pagaste $58.90 en Supermercado Central' },
            { title: 'Banco Inter', text: 'Pix enviado de R$ 35.00 para Pizzaria Napoli' }
        ];
        this.processIncomingBankNotification(samples[Math.floor(Math.random() * samples.length)]);
    }
};
window.NativeBridge = NativeBridge;

const Assistant = {
    config: { baseXP: 100, difficulty: 1.2, currentAnalysisTab: 'health' },
    skinsDef: [
        { id: 'default', name: 'Clásico', level: 0, path: '' },
        { id: 'ironman', name: 'Ironman', level: 5, path: 'skins/Ironman/' },
        { id: 'potter', name: 'Potter', level: 10, path: 'skins/Potter/' },
        { id: 'gold', name: 'Golden', level: 20, path: 'skins/Gold/' }
    ],
    smartPhrases: {
        critical: {
            es: ["⚠️ Alerta Roja: Queda menos del 10%. ¡Cierra el grifo, Master!", "🛑 Zona de peligro. Solo gastos vitales."],
            en: ["⚠️ Red Alert: Less than 10% left. Stop spending, Master!", "🛑 Danger zone reached."],
            pt: ["⚠️ Alerta Vermelho: Menos de 10% restante. Segura a onda, Master!", "🛑 Zona de perigo."]
        },
        fast_burn: {
            es: ["🔥 Vas muy rápido. A este ritmo no llegamos a fin de mes.", "🏎️ Baja la velocidad, Master."],
            en: ["🔥 Burning cash too fast.", "🏎️ Slow down, Master."],
            pt: ["🔥 Queimando caixa muito rápido.", "🏎️ Vai devagar, Master."]
        },
        good_pace: {
            es: ["✅ Excelente gestión, Master. Estás bajo presupuesto.", "📈 Salud financiera óptima hoy."],
            en: ["✅ Excellent management, Master.", "📈 Financial health is optimal."],
            pt: ["✅ Gestão excelente, Master.", "📈 Saúde financeira ótima hoje."]
        },
        weekend: {
            es: ["🍕 Es fin de semana. Cuidado con los gastos en Ocio.", "🎉 Disfruta el finde pero registra cada salida."],
            en: ["🍕 It's the weekend. Watch out for Leisure expenses.", "🎉 Enjoy the weekend, log every outing."],
            pt: ["🍕 É fim de semana. Cuidado com gastos de Lazer.", "🎉 Aproveite o finde, registre cada saída."]
        },
        general: {
            es: ["💡 Gasta lo que te sobra después de ahorrar.", "📅 Revisa tus suscripciones activas."],
            en: ["💡 Spend what is left after saving.", "📅 Check your active subscriptions."],
            pt: ["💡 Gaste o que sobra depois de economizar.", "📅 Revise suas assinaturas ativas."]
        }
    },
    reactionPool: {
        list_cheaper: { es: ["¡Genial! Gastaste menos que la última vez 📉"], en: ["Great! Spent less than last time 📉"], pt: ["Ótimo! Gastou menos que da última vez 📉"] },
        list_expensive: { es: ["Opa, la cuenta subió esta vez 📈"], en: ["Oops, bill went up 📈"], pt: ["Opa, a conta subiu 📈"] },
        sub_added: { es: ["Otra suscripción registrada 🔔"], en: ["Subscription added 🔔"], pt: ["Assinatura registrada 🔔"] },
        expense_high: { es: ["Golpe fuerte al presupuesto 🥊"], en: ["Heavy hit to the budget 🥊"], pt: ["Golpe forte no orçamento 🥊"] },
        expense_normal: { es: ["Gasto registrado ✅"], en: ["Expense saved ✅"], pt: ["Despesa salva ✅"] }
    },
    reactToEvent(type, data) {
        const s = Data.store.settings;
        if (s.showSmartTips === false) return;
        let moodKey = null;
        if (type === 'list_completed') moodKey = 'list_cheaper';
        else if (type === 'sub_added') { moodKey = 'sub_added'; NativeBridge.scheduleSubscriptionReminders(); }
        else if (type === 'expense_added') {
            const limit = Data.store.budget.limit || 0;
            const spent = Finance.calculateMonthlySpent();
            if (limit > 0 && spent > limit * 0.85) {
                NativeBridge.sendImmediateNotification('⚠️ Alerta de Presupuesto', `Has consumido el ${Math.round((spent/limit)*100)}% de tu presupuesto.`);
            }
            moodKey = (limit > 0 && data.amount > limit * 0.1) ? 'expense_high' : 'expense_normal';
        }
        if (!moodKey) return;
        const lang = s.lang || 'es';
        const pool = this.reactionPool[moodKey][lang] || this.reactionPool[moodKey]['es'];
        this.showReactivePopup(pool[Math.floor(Math.random() * pool.length)]);
    },
    showReactivePopup(text) {
        const old = document.getElementById('smarty-popup');
        if (old) old.remove();
        const div = document.createElement('div');
        div.id = 'smarty-popup';
        div.style.cssText = `position:fixed; top:18%; left:50%; transform:translate(-50%,-50%); background:var(--glass-bg); border:1.5px solid var(--primary); box-shadow:0 14px 40px rgba(0,0,0,0.22); padding:14px 22px; border-radius:26px; z-index:15000; display:flex; align-items:center; gap:14px; min-width:270px;`;
        const currentSkin = Data.store.gamification.currentSkin || 'default';
        const skinDef = this.skinsDef.find(s => s.id === currentSkin) || this.skinsDef[0];
        div.innerHTML = `<img src="${skinDef.path}idle.png" style="width:54px; height:54px; object-fit:contain;" onerror="this.src='idle.png'"><div style="font-size:13px; font-weight:700; color:var(--text-color);">${text}</div>`;
        document.body.appendChild(div);
        setTimeout(() => { if (div) div.remove(); }, 3400);
    },
    countCat(catId) {
        if (!Data.store.expenses) return 0;
        const realName = (typeof UI !== 'undefined' && UI.t) ? UI.t(catId) : catId;
        return Data.store.expenses.filter(e => e.category === catId || e.category === realName).length;
    },
    checkExpToday() {
        const t = new Date().toDateString();
        return (Data.store.expenses || []).some(e => new Date(e.date).toDateString() === t);
    },
    checkCatToday(catId) {
        const t = new Date().toDateString();
        const realName = (typeof UI !== 'undefined' && UI.t) ? UI.t(catId) : '';
        return (Data.store.expenses || []).some(e => new Date(e.date).toDateString() === t && (e.category === catId || e.category === realName));
    },
    badgesDef: [
        { id: 'b_start', icon: '🚩', name: {es:'Iniciado', en:'Initiated', pt:'Iniciado'}, check: () => true },
        { id: 'b_budget', icon: '📊', name: {es:'Gerente', en:'Manager', pt:'Gerente'}, check: () => Data.store.budget.limit > 0 },
        { id: 'b_lvl_5', icon: '🐣', name: {es:'Novato', en:'Novice', pt:'Novato'}, check: () => Data.store.gamification.level >= 5 },
        { id: 'b_lvl_10', icon: '🥉', name: {es:'Aprendiz', en:'Apprentice', pt:'Aprendiz'}, check: () => Data.store.gamification.level >= 10 },
        { id: 'b_lvl_20', icon: '🥇', name: {es:'Experto', en:'Expert', pt:'Especialista'}, check: () => Data.store.gamification.level >= 20 },
        { id: 'b_list_5', icon: '📝', name: {es:'Planificador', en:'Planner', pt:'Planejador'}, check: () => Data.store.lists.length >= 5 },
        { id: 'b_subs', icon: '📺', name: {es:'Suscrito', en:'Subscribed', pt:'Assinante'}, check: () => Data.store.subscriptions.length >= 3 },
        { id: 'b_market', icon: '🛒', name: {es:'Mercader', en:'Merchant', pt:'Mercador'}, check: () => Assistant.countCat('cat_market') >= 5 },
        { id: 'b_leisure', icon: '🍕', name: {es:'Disfrutón', en:'Enjoyer', pt:'Bon Vivant'}, check: () => Assistant.countCat('cat_leisure') >= 5 }
    ],
    missionPool: [
        { id: 'm_log', xp: 50, icon: '🖊️', title: {es:"Diario", en:"Daily Log", pt:"Diário"}, desc: {es:"Registra 1 gasto hoy", en:"Log 1 expense today", pt:"Registrar 1 despesa hoje"}, check: () => Assistant.checkExpToday() },
        { id: 'm_zero', xp: 100, icon: '🛡️', title: {es:"Escudo", en:"Shield", pt:"Escudo"}, desc: {es:"0 gastos hoy", en:"0 expenses today", pt:"0 despesas hoje"}, check: () => !Assistant.checkExpToday() },
        { id: 'm_market', xp: 60, icon: '🛒', title: {es:"Súper", en:"Groceries", pt:"Mercado"}, desc: {es:"Gasto en Mercado", en:"Market expense", pt:"Despesa em Mercado"}, check: () => Assistant.checkCatToday('cat_market') }
    ],
    init() {
        this.injectStyles();
        if (!Data.store.gamification) Data.store.gamification = { xp: 0, level: 1, badges: [], streak: 1, currentSkin: 'default' };
        if (!Data.store.gamification.dailyQuests) Data.store.gamification.dailyQuests = { date: null, quests: [] };
        this.validateDailyQuests();
        this.checkBadges();
        NativeBridge.init();
        setTimeout(() => {
            this.updateMood();
            this.updateHomeXP();
            this.checkDailyStreak();
        }, 500);
    },
    updateMood(forceState = null) {
        const img = document.getElementById('mascot-img');
        if (!img) return;
        const currentSkinId = Data.store.gamification.currentSkin || 'default';
        const skinDef = this.skinsDef.find(s => s.id === currentSkinId) || this.skinsDef[0];
        const path = skinDef.path;
        if (forceState) { img.src = path + forceState; return; }
        const health = this.getAnalysisData();
        const ratio = health.limit > 0 ? (health.spent / health.limit) : 0;
        if (health.limit > 0 && ratio > 0.9) img.src = path + 'alert.png';
        else if (health.score < 30) img.src = path + 'worried.png';
        else if (health.score > 80) img.src = path + 'happy.png';
        else img.src = path + 'idle.png';
    },
    renderProfile() {
        const container = document.getElementById('profile-dynamic-content');
        if (!container) return;
        const oldHeader = document.querySelector('.profile-header');
        if (oldHeader) oldHeader.style.display = 'none';
        const g = Data.store.gamification;
        const lang = Data.store.settings.lang || 'es';
        const nextLevelXP = this.config.baseXP * Math.pow(this.config.difficulty, g.level);
        const pct = Math.min(100, (g.xp / nextLevelXP) * 100).toFixed(1);

        let skinsHTML = `<div class="section-label">Skins</div><div class="skins-scroll-container">`;
        this.skinsDef.forEach(skin => {
            const isUnlocked = g.level >= skin.level;
            skinsHTML += `<div class="skin-card ${g.currentSkin === skin.id ? 'active' : ''} ${isUnlocked ? '' : 'locked'}" onclick="${isUnlocked ? `Assistant.setSkin('${skin.id}')` : `UI.showSnackbar('Nivel ${skin.level}')`}"><img src="${skin.path}idle.png" class="skin-preview-img" onerror="this.src='idle.png'"><div class="skin-name">${skin.name}</div></div>`;
        });
        skinsHTML += `</div>`;

        container.innerHTML = `
            <div style="display:flex; align-items:center; margin-bottom:16px; background:var(--input-bg); padding:15px; border-radius:18px;">
                <div style="font-size:28px; font-weight:900; color:var(--primary); margin-right:15px;">Lv.${g.level}</div>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; font-weight:800;"><span>Master</span><span>🔥 ${g.streak || 1} días</span></div>
                    <div style="font-size:11px; color:var(--text-sec); margin-top:4px;">XP: ${Math.floor(g.xp)} / ${Math.floor(nextLevelXP)} (${pct}%)</div>
                </div>
            </div>
            <button class="btn-full" onclick="Assistant.openSmartyChat()" style="margin-top:0; margin-bottom:18px; background:linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);">🤖 Hablar con Smarty AI (Llama 3.3)</button>
            ${skinsHTML}
            <div class="section-label">Misiones Diarias</div>
            ${this.renderQuestsHTML(g, lang)}
        `;
    },
    setSkin(skinId) {
        Data.store.gamification.currentSkin = skinId;
        Data.save();
        this.updateMood();
        this.renderProfile();
    },
    getAnalysisData() {
        const d = Data.store;
        const limit = parseFloat(d.budget?.limit || 0);
        const spent = typeof Finance !== 'undefined' ? Finance.calculateMonthlySpent() : 0;
        const now = new Date();
        const day = Math.max(1, now.getDate());
        const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        let score = limit > 0 ? Math.max(0, 100 - Math.round((spent / limit) * 80)) : 75;
        return { score, spent, limit, dailyBurn: spent / day, projectedTotal: (spent / day) * totalDays, topAnts: [], daysLeftMoney: (limit - spent) / ((spent / day) || 1), percent: limit > 0 ? (spent / limit) * 100 : 0 };
    },
    updateHomeXP() {
        const bar = document.getElementById('xp-fill'); if (!bar) return;
        const g = Data.store.gamification;
        const req = Math.floor(this.config.baseXP * Math.pow(this.config.difficulty, g.level - 1));
        bar.style.height = `${Math.min(100, (g.xp / req) * 100)}%`;
    },
    validateDailyQuests() {
        const g = Data.store.gamification;
        const today = new Date().toDateString();
        if (!g.dailyQuests || g.dailyQuests.date !== today) {
            g.dailyQuests = { date: today, refreshUsed: false, quests: this.missionPool.map(q => ({ id: q.id, completed: false })) };
            Data.save();
        }
    },
    renderQuestsHTML(g, lang) {
        return (g.dailyQuests?.quests || []).map((q, idx) => {
            const def = this.missionPool.find(m => m.id === q.id);
            if (!def) return '';
            return `<div class="profile-quest-row"><div class="pq-icon">${def.icon}</div><div class="pq-info"><div class="pq-title">${def.title[lang] || def.title.es}</div><div class="pq-desc">${def.desc[lang] || def.desc.es}</div></div><button class="pq-btn ${q.completed ? 'done' : ''}" onclick="Assistant.verifyQuest(${idx})">${q.completed ? '✓' : 'Verificar'}</button></div>`;
        }).join('');
    },
    verifyQuest(idx) {
        const g = Data.store.gamification;
        const q = g.dailyQuests.quests[idx];
        const def = this.missionPool.find(m => m.id === q.id);
        if (!def || q.completed) return;
        if (def.check()) {
            q.completed = true;
            this.addXP(def.xp);
            Data.save();
            this.renderProfile();
            UI.showSnackbar(`+${def.xp} XP 🎉`);
        } else {
            UI.showSnackbar("Aún no completada.");
        }
    },
    checkBadges() {
        const g = Data.store.gamification;
        this.badgesDef.forEach(b => { if (!g.badges.includes(b.id) && b.check()) g.badges.push(b.id); });
    },
    addXP(amount) {
        const g = Data.store.gamification;
        g.xp += amount;
        const req = Math.floor(this.config.baseXP * Math.pow(this.config.difficulty, g.level - 1));
        if (g.xp >= req) { g.xp -= req; g.level++; UI.showSnackbar(`🎉 NIVEL ${g.level}!`); }
        Data.save();
        this.updateHomeXP();
    },
    checkDailyStreak() {
        const today = new Date().toDateString();
        const g = Data.store.gamification;
        if (g.lastLogin !== today) { g.streak = (g.streak || 0) + 1; g.lastLogin = today; Data.save(); }
    },
    giveTip() {
        this.updateMood('thinking.png');
        const lang = Data.store.settings?.lang || 'es';
        const list = this.smartPhrases.general[lang] || this.smartPhrases.general.es;
        const bubble = document.getElementById('mascot-bubble');
        if (bubble) bubble.innerText = list[Math.floor(Math.random() * list.length)];
        setTimeout(() => this.updateMood(), 4000);
    },
    injectStyles() {
        if (document.getElementById('assistant-styles')) return;
        const style = document.createElement('style');
        style.id = 'assistant-styles';
        style.innerHTML = `.profile-quest-row{display:flex;align-items:center;justify-content:space-between;background:var(--item-bg);padding:10px 12px;border-radius:14px;margin-bottom:8px;border:1px solid var(--glass-border)}.pq-icon{font-size:20px;margin-right:12px}.pq-info{flex:1}.pq-title{font-size:13px;font-weight:700}.pq-desc{font-size:10px;opacity:.7}.pq-btn{background:var(--input-bg);border:none;padding:6px 12px;border-radius:10px;color:var(--primary);font-weight:800;font-size:11px;cursor:pointer}.pq-btn.done{background:var(--success);color:#fff}.skins-scroll-container{display:flex;gap:12px;overflow-x:auto;padding:5px 5px 15px}.skin-card{min-width:80px;background:var(--input-bg);border:2px solid transparent;border-radius:16px;padding:12px 5px;display:flex;flex-direction:column;align-items:center;cursor:pointer}.skin-card.active{background:var(--item-bg);border-color:var(--primary)}.skin-preview-img{width:45px;height:45px;object-fit:contain;margin-bottom:5px}.skin-name{font-size:11px;font-weight:700}`;
        document.head.appendChild(style);
    },
    openSmartyChat() {
        if (typeof Main !== 'undefined') Main.closeProfile();
        const chatBox = document.getElementById('smarty-chat-box');
        const input = document.getElementById('smarty-chat-input');
        chatBox.innerHTML = '';
        input.value = '';
        this.appendChatMessage("¡Hola Master! Soy Smarty con Llama 3.3 70B. ¿Qué analizamos hoy?", 'bot');
        document.getElementById('modal-smarty-chat').classList.add('open');
        input.onkeypress = (e) => { if (e.key === 'Enter') this.sendSmartyMessage(); };
    },
    closeSmartyChat() { document.getElementById('modal-smarty-chat').classList.remove('open'); },
    getFinancialContext() {
        const limit = Number(Data.store.budget?.limit || 0);
        const spent = typeof Finance !== 'undefined' ? Number(Finance.calculateMonthlySpent() || 0) : 0;
        return `Eres Smarty, asesor financiero personal. Presupuesto: ${limit}, Gastado este mes: ${spent}, Restante: ${limit - spent}. Suscripciones: ${(Data.store.subscriptions || []).map(s => `${s.name} (${s.cost})`).join(', ')}. Responde breve y útil.`;
    },
    async sendSmartyMessage() {
        const input = document.getElementById('smarty-chat-input');
        const text = input.value.trim();
        if (!text || !GroqAI.getApiKey()) return;
        this.appendChatMessage(text, 'user');
        input.value = '';
        const typingId = 'typing-' + Date.now();
        this.appendChatMessage("Pensando...", 'bot', typingId);
        try {
            const reply = await GroqAI.chat(this.getFinancialContext(), text);
            document.getElementById(typingId)?.remove();
            this.appendChatMessage(reply, 'bot');
        } catch (err) {
            document.getElementById(typingId)?.remove();
            this.appendChatMessage(GroqAI.friendlyError(err) || 'Error', 'bot');
        }
    },
    appendChatMessage(text, sender, id = '') {
        const chatBox = document.getElementById('smarty-chat-box');
        const msgDiv = document.createElement('div');
        if (id) msgDiv.id = id;
        const isUser = sender === 'user';
        msgDiv.style.cssText = `max-width:85%;padding:12px 16px;border-radius:20px;font-size:14px;align-self:${isUser ? 'flex-end' : 'flex-start'};background:${isUser ? 'var(--primary-grad)' : 'var(--item-bg)'};color:${isUser ? 'white' : 'var(--text-color)'};border:1px solid var(--glass-border);`;
        msgDiv.innerHTML = String(text).replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        chatBox.appendChild(msgDiv);
        setTimeout(() => { chatBox.scrollTop = chatBox.scrollHeight; }, 50);
    }
};