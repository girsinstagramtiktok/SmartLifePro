/* =========================================
   SMART LIFE PRO - ASSISTANT CORE (V32.0 - MULTILANG & FIXES + SMARTY AI)
   Autor: A_True_Alpha | Fix: Badges Visual & Full Translation
   ========================================= */

// --- GROQ AI CLIENT (shared by Assistant, Finance and Shopping) ---
// NOTE: The API key is stored in Data.store.settings.groqApiKey.
// This keeps the migration limited to these 3 files; data.js preserves extra settings automatically.
const GroqAI = {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    textModel: 'openai/gpt-oss-20b',
    visionModel: 'qwen/qwen3.8-27b',
    maxAttempts: 3,

    getApiKey() {
        if (!Data.store.settings) Data.store.settings = {};

        const stored = (Data.store.settings.groqApiKey || '').trim();
        if (stored) return stored;

        const key = prompt('Ingresa tu API key de Groq (empieza normalmente por gsk_):');
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
            state = {
                date: today,
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                cachedTokens: 0,
                models: {}
            };
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
            state.models[modelId] = {
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                cachedTokens: 0,
                quota: {}
            };
        }

        const m = state.models[modelId];
        const usage = data?.usage || {};

        if (success) {
            const prompt = Number(usage.prompt_tokens || 0);
            const completion = Number(usage.completion_tokens || 0);
            const total = Number(usage.total_tokens || (prompt + completion));
            const cached = Number(usage?.prompt_tokens_details?.cached_tokens || 0);

            state.requests += 1;
            state.promptTokens += prompt;
            state.completionTokens += completion;
            state.totalTokens += total;
            state.cachedTokens += cached;

            m.requests += 1;
            m.promptTokens += prompt;
            m.completionTokens += completion;
            m.totalTokens += total;
            m.cachedTokens += cached;
        }

        const quota = {
            limitRequests: this.headerNumber(response, 'x-ratelimit-limit-requests'),
            remainingRequests: this.headerNumber(response, 'x-ratelimit-remaining-requests'),
            limitTokens: this.headerNumber(response, 'x-ratelimit-limit-tokens'),
            remainingTokens: this.headerNumber(response, 'x-ratelimit-remaining-tokens'),
            resetRequests: response?.headers?.get('x-ratelimit-reset-requests') || null,
            resetTokens: response?.headers?.get('x-ratelimit-reset-tokens') || null,
            updatedAt: Date.now()
        };

        Object.keys(quota).forEach(key => {
            if (quota[key] !== null && quota[key] !== undefined) m.quota[key] = quota[key];
        });

        Data.store.settings.groqUsage = state;
        Data.save();
        this.refreshUsagePanel();
    },

    getUsageState() {
        return this.ensureUsageState();
    },

    compactNumber(value) {
        const n = Number(value || 0);
        return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
    },

    modelUsageHTML(modelId, label) {
        const state = this.getUsageState();
        const m = state.models?.[modelId] || null;
        if (!m) {
            return `<div style="padding:10px 0; border-top:1px solid rgba(120,120,120,0.1);">
                <div style="display:flex; justify-content:space-between; gap:10px; font-size:12px; font-weight:700;"><span>${label}</span><span style="color:var(--text-sec);">Sin uso hoy</span></div>
            </div>`;
        }

        const q = m.quota || {};
        const rpd = (q.remainingRequests !== undefined && q.limitRequests !== undefined)
            ? `${this.compactNumber(q.remainingRequests)} / ${this.compactNumber(q.limitRequests)} RPD restantes`
            : 'RPD: se actualiza con la siguiente respuesta';
        const tpm = (q.remainingTokens !== undefined && q.limitTokens !== undefined)
            ? `${this.compactNumber(q.remainingTokens)} / ${this.compactNumber(q.limitTokens)} TPM disponibles`
            : 'TPM: se actualiza con la siguiente respuesta';

        return `<div style="padding:10px 0; border-top:1px solid rgba(120,120,120,0.1);">
            <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
                <span style="font-size:12px; font-weight:800;">${label}</span>
                <span style="font-size:10px; color:var(--text-sec);">${m.requests} req · ${this.compactNumber(m.totalTokens)} tok</span>
            </div>
            <div style="font-size:10px; color:var(--text-sec); margin-top:4px;">${rpd}</div>
            <div style="font-size:10px; color:var(--text-sec); margin-top:2px;">${tpm}</div>
        </div>`;
    },

    getUsageCardHTML() {
        const state = this.getUsageState();
        return `<div id="groq-usage-card-inner" class="glass-card" style="padding:15px; margin:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                <div>
                    <div style="font-size:14px; font-weight:800;">Groq · uso de hoy</div>
                    <div style="font-size:10px; color:var(--text-sec); margin-top:2px;">Contador local de Smart Life Pro</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:18px; font-weight:900; color:var(--primary);">${this.compactNumber(state.totalTokens)}</div>
                    <div style="font-size:9px; color:var(--text-sec); text-transform:uppercase;">tokens</div>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;">
                <div style="background:var(--input-bg); border-radius:12px; padding:9px; text-align:center;"><b>${state.requests}</b><div style="font-size:9px; color:var(--text-sec);">solicitudes</div></div>
                <div style="background:var(--input-bg); border-radius:12px; padding:9px; text-align:center;"><b>${this.compactNumber(state.promptTokens)}</b><div style="font-size:9px; color:var(--text-sec);">tokens entrada</div></div>
            </div>
            ${this.modelUsageHTML(this.textModel, 'Smarty · texto')}
            ${this.modelUsageHTML(this.visionModel, 'Smarty · vision')}
            <div style="font-size:9px; line-height:1.35; color:var(--text-sec); margin-top:8px;">Groq informa RPD restante y TPM disponible por headers. Los tokens de hoy son los consumidos por esta app con esta instalacion.</div>
        </div>`;
    },

    refreshUsagePanel() {
        const host = document.getElementById('groq-usage-card');
        if (host) host.innerHTML = this.getUsageCardHTML();
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    retryDelay(response, attempt) {
        const retryAfter = response?.headers?.get('retry-after');
        if (retryAfter) {
            const seconds = Number(retryAfter);
            if (Number.isFinite(seconds)) return Math.max(500, seconds * 1000);
        }
        return Math.min(5000, 700 * Math.pow(2, attempt));
    },

    async request(payload, { timeoutMs = 30000 } = {}) {
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error('GROQ_KEY_CANCELLED');

        let lastError = null;

        for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const response = await fetch(this.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const raw = await response.text();
                let data = {};
                try { data = raw ? JSON.parse(raw) : {}; }
                catch (_) { data = { error: { message: raw || 'Respuesta invalida de Groq.' } }; }

                this.recordResponse(response, data, payload?.model, response.ok);
                if (response.ok) return data;

                const message = data?.error?.message || `Error HTTP ${response.status}`;
                const err = new Error(message);
                err.status = response.status;
                err.data = data;
                lastError = err;

                if (response.status === 401 || response.status === 403) {
                    this.clearApiKey();
                    throw err;
                }

                const retryable = response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500;
                if (!retryable || attempt === this.maxAttempts - 1) throw err;

                await this.sleep(this.retryDelay(response, attempt));

            } catch (err) {
                clearTimeout(timeoutId);
                lastError = err;

                if (err?.status === 401 || err?.status === 403) throw err;

                const retryableNetworkError = err?.name === 'AbortError' || typeof err?.status === 'undefined';
                if (!retryableNetworkError || attempt === this.maxAttempts - 1) throw err;

                await this.sleep(Math.min(5000, 700 * Math.pow(2, attempt)));
            }
        }

        throw lastError || new Error('No se pudo conectar con Groq.');
    },

    extractText(data) {
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text !== 'string' || !text.trim()) {
            throw new Error('Groq devolvio una respuesta vacia.');
        }
        return text.trim();
    },

    parseJSON(text) {
        const cleaned = String(text || '')
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        try {
            return JSON.parse(cleaned);
        } catch (_) {
            const match = cleaned.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('Formato JSON invalido.');
            return JSON.parse(match[0]);
        }
    },

    async chat(systemPrompt, userText, { maxTokens = 650 } = {}) {
        const payload = {
            model: this.textModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText }
            ],
            temperature: 0.4,
            reasoning_effort: 'low',
            reasoning_format: 'hidden',
            max_completion_tokens: maxTokens,
            stream: false
        };

        const data = await this.request(payload, { timeoutMs: 30000 });
        return this.extractText(data);
    },

    async textJSON(instructions, userText, schemaName, schema, { maxTokens = 900 } = {}) {
        const payload = {
            model: this.textModel,
            messages: [
                { role: 'system', content: instructions },
                { role: 'user', content: userText }
            ],
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: schemaName,
                    strict: true,
                    schema
                }
            },
            temperature: 0.1,
            reasoning_effort: 'low',
            reasoning_format: 'hidden',
            max_completion_tokens: maxTokens,
            stream: false
        };

        const data = await this.request(payload, { timeoutMs: 30000 });
        return this.parseJSON(this.extractText(data));
    },

    async visionJSON(promptText, rawBase64) {
        const payload = {
            model: this.visionModel,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: promptText },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${rawBase64}` }
                    }
                ]
            }],
            response_format: { type: 'json_object' },
            reasoning_effort: 'none',
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
                reject(new Error('VOICE_UNSUPPORTED'));
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            const lang = Data?.store?.settings?.lang || 'es';
            recognition.lang = lang === 'pt' ? 'pt-BR' : (lang === 'en' ? 'en-US' : 'es-ES');
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            let settled = false;
            recognition.onresult = (event) => {
                if (settled) return;
                settled = true;
                const transcript = event?.results?.[0]?.[0]?.transcript?.trim();
                if (transcript) resolve(transcript);
                else reject(new Error('VOICE_NO_SPEECH'));
            };
            recognition.onerror = (event) => {
                if (settled) return;
                settled = true;
                const err = new Error(event?.error === 'no-speech' ? 'VOICE_NO_SPEECH' : 'VOICE_ERROR');
                reject(err);
            };
            recognition.onend = () => {
                if (!settled) {
                    settled = true;
                    reject(new Error('VOICE_NO_SPEECH'));
                }
            };

            try { recognition.start(); }
            catch (_) { reject(new Error('VOICE_ERROR')); }
        });
    },

    friendlyError(err) {
        if (err?.message === 'GROQ_KEY_CANCELLED') return null;
        if (err?.message === 'VOICE_UNSUPPORTED') return 'Tu navegador no soporta reconocimiento de voz. Los metodos manuales siguen disponibles.';
        if (err?.message === 'VOICE_NO_SPEECH') return 'No pude escuchar una frase completa. Intenta otra vez.';
        if (err?.message === 'VOICE_ERROR') return 'No se pudo usar el microfono. Revisa el permiso de voz.';
        if (err?.status === 401 || err?.status === 403) return 'La API key de Groq no es valida. Intenta de nuevo para ingresar otra.';
        if (err?.status === 429) return 'Groq alcanzo temporalmente el limite de uso. Puedes seguir usando la app manualmente.';
        if (err?.name === 'AbortError') return 'Groq tardo demasiado en responder. Puedes seguir usando la app manualmente.';
        return 'Smarty no pudo completar esta accion. Los metodos manuales siguen disponibles.';
    }
};

window.GroqAI = GroqAI;

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

    // --- 1. BANCO DE FRASES INTELIGENTES (YA TRADUCIDO) ---
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

    // --- POOL DE REACCIONES (YA TRADUCIDO) ---
    reactionPool: {
        list_cheaper: {
            es: ["¡Genial! Gastaste menos que la última vez 📉", "Ahorro detectado. ¡Bien jugado! 🤑", "Tu bolsillo te agradece este respiro 😌"],
            en: ["Great! You spent less than last time 📉", "Savings detected. Well played! 🤑", "Your wallet thanks you 😌"],
            pt: ["Ótimo! Gastou menos que da última vez 📉", "Economia detectada. Bem jogado! 🤑", "Sua carteira agradece 😌"]
        },
        list_expensive: {
            es: ["Opa, la cuenta subió. ¿Muchos caprichos? 🤨", "Cuidado, gastaste más que la anterior 📈", "¿Todo bien? El total fue alto esta vez 💸"],
            en: ["Oops, bill went up. Too many treats? 🤨", "Watch out, spent more than before 📈", "Everything ok? Total was high this time 💸"],
            pt: ["Opa, a conta subiu. Muitos caprichos? 🤨", "Cuidado, gastou mais que a anterior 📈", "Tudo bem? O total foi alto dessa vez 💸"]
        },
        sub_added: {
            es: ["Otra suscripción... ¿Seguro que la usarás? 👀", "Recuerda cancelar si no la usas 🔔", "Los gastos fijos son peligrosos... ⚠️"],
            en: ["Another sub... Sure you'll use it? 👀", "Remember to cancel if unused 🔔", "Fixed expenses are dangerous... ⚠️"],
            pt: ["Outra assinatura... Vai usar mesmo? 👀", "Lembre de cancelar se não usar 🔔", "Gastos fixos são perigosos... ⚠️"]
        },
        expense_high: {
            es: ["Golpe fuerte al presupuesto 🥊", "Ajusta el resto del mes, colega 🚧", "¡Wow! Eso fue costoso 😱"],
            en: ["Heavy hit to the budget 🥊", "Adjust the rest of the month 🚧", "Wow! That was expensive 😱"],
            pt: ["Golpe forte no orçamento 🥊", "Ajuste o resto do mês 🚧", "Uau! Isso foi caro 😱"]
        },
        expense_normal: {
            es: ["Anotado ✍️", "Gasto registrado ✅", "Poquito a poco... 🐢", "Controlando el flujo 💧", "Ok, seguimos 👍"],
            en: ["Noted ✍️", "Expense saved ✅", "Little by little... 🐢", "Controlling the flow 💧", "Ok, moving on 👍"],
            pt: ["Anotado ✍️", "Despesa salva ✅", "Pouco a pouco... 🐢", "Controlando o fluxo 💧", "Ok, seguimos 👍"]
        }
    },

    reactToEvent(type, data) {
        const s = Data.store.settings;
        if (s.showSmartTips === false) return;

        let moodKey = null;
        if (type === 'list_completed') {
            const history = Data.store.lists.filter(l => l.status === 'completed').sort((a,b) => b.date - a.date);
            if (history.length >= 2) {
                const current = history[0].total;
                const prev = history[1].total;
                if (current < prev) moodKey = 'list_cheaper';
                else if (current > prev * 1.1) moodKey = 'list_expensive';
            }
        } else if (type === 'sub_added') {
            moodKey = 'sub_added';
        } else if (type === 'expense_added') {
            const limit = Data.store.budget.limit || 0;
            // CASO 1: Gasto Alto (> 10% del presupuesto)
            if (limit > 0 && data.amount > (limit * 0.1)) {
                moodKey = 'expense_high';
            } 
            // CASO 2: Gasto Normal (50% prob)
            else {
                if (Math.random() > 0.5) moodKey = 'expense_normal';
            }
        }

        if (!moodKey) return;

        const lang = s.lang || 'es';
        const pool = this.reactionPool[moodKey][lang] || this.reactionPool[moodKey]['es'];
        const msg = pool[Math.floor(Math.random() * pool.length)];
        this.showReactivePopup(msg);
    },

    showReactivePopup(text) {
        const old = document.getElementById('smarty-popup');
        if (old) old.remove();

        const div = document.createElement('div');
        div.id = 'smarty-popup';
        div.style.cssText = `position: fixed; top: 20%; left: 50%; transform: translate(-50%, -50%) scale(0.8); background: var(--glass-bg); border: 1px solid var(--primary); box-shadow: 0 10px 40px rgba(0,0,0,0.2); backdrop-filter: blur(10px); padding: 15px 25px; border-radius: 30px; z-index: 15000; display: flex; align-items: center; gap: 15px; opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none; min-width: 280px;`;

        const currentSkin = Data.store.gamification.currentSkin || 'default';
        const skinDef = this.skinsDef.find(s => s.id === currentSkin) || this.skinsDef[0];
        const skinPath = skinDef.path || '';
        
        div.innerHTML = `
            <img src="${skinPath}idle.png" style="width:65px; height:65px; object-fit:contain; filter: drop-shadow(0 4px 5px rgba(0,0,0,0.2));" onerror="this.src='idle.png'">
            <div style="font-size:13px; font-weight:700; color:var(--text-color); line-height:1.4;">${text}</div>
        `;

        document.body.appendChild(div);

        requestAnimationFrame(() => { div.style.opacity = '1'; div.style.transform = 'translate(-50%, -50%) scale(1)'; });
        if(navigator.vibrate) navigator.vibrate([30, 30]);

        setTimeout(() => {
            if(div) { div.style.opacity = '0'; div.style.transform = 'translate(-50%, -40%) scale(0.9)'; setTimeout(() => div.remove(), 400); }
        }, 3500);
    },
    // --- HELPER FUNCTIONS (Lógica Interna) ---
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

    // --- 3. MEDALLAS (TRADUCCIÓN COMPLETA) ---
    badgesDef: [
        // NIVELES
        { id: 'b_lvl_5', icon: '🐣', name: {es:'Novato', en:'Novice', pt:'Novato'}, desc: {es:'Alcanza el Nivel 5', en:'Reach Level 5', pt:'Alcance o Nível 5'}, check: () => Data.store.gamification.level >= 5 },
        { id: 'b_lvl_10', icon: '🥉', name: {es:'Aprendiz', en:'Apprentice', pt:'Aprendiz'}, desc: {es:'Alcanza el Nivel 10', en:'Reach Level 10', pt:'Alcance o Nível 10'}, check: () => Data.store.gamification.level >= 10 },
        { id: 'b_lvl_15', icon: '🥈', name: {es:'Competente', en:'Skilled', pt:'Competente'}, desc: {es:'Alcanza el Nivel 15', en:'Reach Level 15', pt:'Alcance o Nível 15'}, check: () => Data.store.gamification.level >= 15 },
        { id: 'b_lvl_20', icon: '🥇', name: {es:'Experto', en:'Expert', pt:'Especialista'}, desc: {es:'Alcanza el Nivel 20', en:'Reach Level 20', pt:'Alcance o Nível 20'}, check: () => Data.store.gamification.level >= 20 },
        { id: 'b_lvl_30', icon: '🚀', name: {es:'Maestro', en:'Master', pt:'Mestre'}, desc: {es:'Alcanza el Nivel 30', en:'Reach Level 30', pt:'Alcance o Nível 30'}, check: () => Data.store.gamification.level >= 30 },
        { id: 'b_lvl_40', icon: '💎', name: {es:'Magnate', en:'Tycoon', pt:'Magnata'}, desc: {es:'Alcanza el Nivel 40', en:'Reach Level 40', pt:'Alcance o Nível 40'}, check: () => Data.store.gamification.level >= 40 },
        { id: 'b_lvl_50', icon: '👑', name: {es:'Leyenda', en:'Legend', pt:'Lenda'}, desc: {es:'Alcanza el Nivel 50', en:'Reach Level 50', pt:'Alcance o Nível 50'}, check: () => Data.store.gamification.level >= 50 },
        { id: 'b_lvl_60', icon: '🪐', name: {es:'Dios', en:'Godlike', pt:'Deus'}, desc: {es:'Alcanza el Nivel 60', en:'Reach Level 60', pt:'Alcance o Nível 60'}, check: () => Data.store.gamification.level >= 60 },
        
        // RACHAS
        { id: 'b_month_streak', icon: '🗓️', name: {es:'Superviviente', en:'Survivor', pt:'Sobrevivente'}, desc: {es:'Mes sin pasar el límite', en:'Month under budget', pt:'Mês abaixo do limite'}, check: () => (Data.store.gamification.monthStreak || 0) > 0 },
        { id: 'b_streak_7', icon: '🔥', name: {es:'Racha Semanal', en:'Weekly Streak', pt:'Ofensiva Semanal'}, desc: {es:'Usa la app 7 días seguidos', en:'Use app 7 days in a row', pt:'Use o app 7 dias seguidos'}, check: () => Data.store.gamification.streak >= 7 },
        { id: 'b_streak_30', icon: '🏆', name: {es:'Hábito de Hierro', en:'Iron Habit', pt:'Hábito de Ferro'}, desc: {es:'Usa la app 30 días seguidos', en:'Use app 30 days in a row', pt:'Use o app 30 dias seguidos'}, check: () => Data.store.gamification.streak >= 30 },

        // HITOS DE USO
        { id: 'b_start', icon: '🚩', name: {es:'Iniciado', en:'Initiated', pt:'Iniciado'}, desc: {es:'Primer uso de la app', en:'First app usage', pt:'Primeiro uso do app'}, check: () => true },
        { id: 'b_budget', icon: '📊', name: {es:'Gerente', en:'Manager', pt:'Gerente'}, desc: {es:'Define un presupuesto', en:'Set a budget', pt:'Definir um orçamento'}, check: () => Data.store.budget.limit > 0 },
        { id: 'b_list_5', icon: '📝', name: {es:'Planificador', en:'Planner', pt:'Planejador'}, desc: {es:'Crea 5 listas de compras', en:'Create 5 shopping lists', pt:'Criar 5 listas de compras'}, check: () => Data.store.lists.length >= 5 },
        { id: 'b_list_master', icon: '📦', name: {es:'Mayorista', en:'Wholesaler', pt:'Atacadista'}, desc: {es:'Lista con +10 items', en:'List with 10+ items', pt:'Lista com +10 itens'}, check: () => Data.store.lists.some(l => l.items.length >= 10) },
        { id: 'b_subs', icon: '📺', name: {es:'Suscrito', en:'Subscribed', pt:'Assinante'}, desc: {es:'3 suscripciones activas', en:'3 active subscriptions', pt:'3 assinaturas ativas'}, check: () => Data.store.subscriptions.length >= 3 },
        { id: 'b_saver', icon: '🐷', name: {es:'Ahorrador', en:'Saver', pt:'Poupador'}, desc: {es:'Gasta < 50% del límite', en:'Spend < 50% of limit', pt:'Gastar < 50% do limite'}, check: () => { const l=Data.store.budget.limit; return l>0 && (Finance.calculateMonthlySpent()/l)<0.5; }},
        { id: 'b_safe', icon: '🛡️', name: {es:'Blindado', en:'Armored', pt:'Blindado'}, desc: {es:'Gasta < 80% del límite', en:'Spend < 80% of limit', pt:'Gastar < 80% do limite'}, check: () => { const l=Data.store.budget.limit; return l>0 && (Finance.calculateMonthlySpent()/l)<0.8; }},
        { id: 'b_clean_sheet', icon: '✨', name: {es:'Impecable', en:'Flawless', pt:'Impecável'}, desc: {es:'Sin deudas activas', en:'No active debts', pt:'Sem dívidas ativas'}, check: () => !Data.store.expenses.some(e=>e.isInstallment) },

        // CATEGORÍAS
        { id: 'b_market', icon: '🛒', name: {es:'Mercader', en:'Merchant', pt:'Mercador'}, desc: {es:'5 gastos en Supermercado', en:'5 Market expenses', pt:'5 despesas de Mercado'}, check: () => Assistant.countCat('cat_market') >= 5 },
        { id: 'b_leisure', icon: '🍕', name: {es:'Disfrutón', en:'Enjoyer', pt:'Bon Vivant'}, desc: {es:'5 gastos en Ocio/Comida', en:'5 Leisure expenses', pt:'5 despesas de Lazer'}, check: () => Assistant.countCat('cat_leisure') >= 5 },
        { id: 'b_transport', icon: '🚌', name: {es:'Nómada', en:'Nomad', pt:'Nômade'}, desc: {es:'5 gastos en Transporte', en:'5 Transport expenses', pt:'5 despesas de Transporte'}, check: () => Assistant.countCat('cat_transport') >= 5 },
        { id: 'b_clothes', icon: '👕', name: {es:'Estilista', en:'Stylist', pt:'Estilista'}, desc: {es:'3 gastos en Ropa', en:'3 Clothes expenses', pt:'3 despesas de Roupa'}, check: () => Assistant.countCat('cat_clothes') >= 3 },
        { id: 'b_health', icon: '💊', name: {es:'Saludable', en:'Healthy', pt:'Saudável'}, desc: {es:'3 gastos en Salud', en:'3 Health expenses', pt:'3 despesas de Saúde'}, check: () => Assistant.countCat('cat_health') >= 3 },
        { id: 'b_bills', icon: '🏠', name: {es:'Casero', en:'Homebody', pt:'Caseiro'}, desc: {es:'5 gastos de Hogar', en:'5 Home expenses', pt:'5 despesas de Casa'}, check: () => Assistant.countCat('cat_bills') >= 5 },
        { id: 'b_travel', icon: '✈️️', name: {es:'Mochilero', en:'Backpacker', pt:'Mochileiro'}, desc: {es:'1 gasto de Viaje', en:'1 Travel expense', pt:'1 despesa de Viagem'}, check: () => Assistant.countCat('cat_travel') >= 1 },
        { id: 'b_beauty', icon: '💅', name: {es:'Vanidoso', en:'Vain', pt:'Vaidoso'}, desc: {es:'1 gasto en Belleza', en:'1 Beauty expense', pt:'1 despesa de Beleza'}, check: () => Assistant.countCat('cat_beauty') >= 1 },
        
        // CURIOSAS (TEXTO)
        { id: 'b_coffee', icon: '☕', name: {es:'Cafetero', en:'Coffee Lover', pt:'Cafeinado'}, desc: {es:'Gasto con descr. "Cafe"', en:'Expense "Coffee"', pt:'Despesa "Café"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Cafe|Coffee/i)) },
        { id: 'b_gamer', icon: '🎮', name: {es:'Gamer', en:'Gamer', pt:'Gamer'}, desc: {es:'Gasto con descr. "Juego"', en:'Expense "Game"', pt:'Despesa "Jogo"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Juego|Game|Steam/i)) },
        { id: 'b_pet', icon: '🐾', name: {es:'Amigo Fiel', en:'Loyal Friend', pt:'Amigo Fiel'}, desc: {es:'Gasto con descr. "Vet/Perro"', en:'Expense "Pet/Dog"', pt:'Despesa "Pet/Cão"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Perro|Gato|Vet|Mascota|Pet|Dog|Cat/i)) },
        { id: 'b_investor', icon: '📈', name: {es:'Inversor', en:'Investor', pt:'Investidor'}, desc: {es:'Gasto con descr. "Inversion"', en:'Expense "Invest"', pt:'Despesa "Investir"'}, check: () => Data.store.expenses.some(e=>e.desc.match(/Inversion|Accion|Crypto|Stock/i)) },
        { id: 'b_night', icon: '🦉', name: {es:'Nocturno', en:'Nocturnal', pt:'Noturno'}, desc: {es:'Gasto de 00:00 a 05:00', en:'Expense 00:00 to 05:00', pt:'Despesa 00:00 às 05:00'}, check: () => Data.store.expenses.some(e=>{ const h=new Date(e.date).getHours(); return h>=0 && h<5; }) }
    ],

    // --- 4. POOL DE MISIONES (TRADUCCIÓN COMPLETA) ---
    missionPool: [
        { id: 'm_log', xp: 50, icon: '🖊️', title: {es:"Diario", en:"Daily Log", pt:"Diário"}, desc: {es:"Registra 1 gasto hoy", en:"Log 1 expense today", pt:"Registrar 1 despesa hoje"}, check: () => Assistant.checkExpToday() },
        { id: 'm_zero', xp: 100, icon: '🛡️', title: {es:"Escudo", en:"Shield", pt:"Escudo"}, desc: {es:"0 gastos hoy", en:"0 expenses today", pt:"0 despesas hoje"}, check: () => !Assistant.checkExpToday() },
        { id: 'm_market', xp: 60, icon: '🛒', title: {es:"Súper", en:"Groceries", pt:"Mercado"}, desc: {es:"Gasto en Mercado", en:"Market expense", pt:"Despesa em Mercado"}, check: () => Assistant.checkCatToday('cat_market') },
        { id: 'm_leisure', xp: 60, icon: '🍕', title: {es:"Relax", en:"Chill", pt:"Relax"}, desc: {es:"Gasto en Ocio", en:"Leisure expense", pt:"Despesa em Lazer"}, check: () => Assistant.checkCatToday('cat_leisure') },
        { id: 'm_transport', xp: 60, icon: '🚌', title: {es:"Ruta", en:"Route", pt:"Rota"}, desc: {es:"Gasto Transporte", en:"Transport expense", pt:"Despesa Transporte"}, check: () => Assistant.checkCatToday('cat_transport') },
        { id: 'm_bills', xp: 70, icon: '💡', title: {es:"Pagos", en:"Bills", pt:"Contas"}, desc: {es:"Gasto Hogar", en:"Home expense", pt:"Despesa Casa"}, check: () => Assistant.checkCatToday('cat_bills') },
        { id: 'm_health', xp: 80, icon: '💊', title: {es:"Cuidarse", en:"Self Care", pt:"Cuidar-se"}, desc: {es:"Gasto Salud", en:"Health expense", pt:"Despesa Saúde"}, check: () => Assistant.checkCatToday('cat_health') },
        { id: 'm_tiny', xp: 40, icon: '🐜', title: {es:"Micro", en:"Micro", pt:"Micro"}, desc: {es:"Gasto < 5", en:"Expense < 5", pt:"Despesa < 5"}, check: () => Assistant.checkAmountToday('<', 5) },
        { id: 'm_small', xp: 50, icon: '🪙', title: {es:"Pequeño", en:"Small", pt:"Pequeno"}, desc: {es:"Gasto 5-20", en:"Expense 5-20", pt:"Despesa 5-20"}, check: () => Assistant.checkAmountToday('range', 5, 20) },
        { id: 'm_medium', xp: 60, icon: '💵', title: {es:"Medio", en:"Medium", pt:"Médio"}, desc: {es:"Gasto 20-50", en:"Expense 20-50", pt:"Despesa 20-50"}, check: () => Assistant.checkAmountToday('range', 20, 50) },
        { id: 'm_big', xp: 80, icon: '🐳', title: {es:"Macro", en:"Huge", pt:"Macro"}, desc: {es:"Gasto > 50", en:"Expense > 50", pt:"Despesa > 50"}, check: () => Assistant.checkAmountToday('>', 50) },
        { id: 'm_morning', xp: 50, icon: '☕', title: {es:"Mañanero", en:"Morning", pt:"Matinal"}, desc: {es:"Gasto antes 10AM", en:"Expense before 10AM", pt:"Despesa antes 10h"}, check: () => Assistant.checkHourToday('<', 10) },
        { id: 'm_lunch', xp: 50, icon: '🍽️', title: {es:"Almuerzo", en:"Lunch", pt:"Almoço"}, desc: {es:"Gasto 12PM-2PM", en:"Expense 12PM-2PM", pt:"Despesa 12h-14h"}, check: () => Assistant.checkHourToday('range', 12, 14) },
        { id: 'm_afternoon', xp: 50, icon: '🌤️', title: {es:"Tarde", en:"Afternoon", pt:"Tarde"}, desc: {es:"Gasto 3PM-6PM", en:"Expense 3PM-6PM", pt:"Despesa 15h-18h"}, check: () => Assistant.checkHourToday('range', 15, 18) },
        { id: 'm_night', xp: 60, icon: '🌙', title: {es:"Cena", en:"Dinner", pt:"Jantar"}, desc: {es:"Gasto 7PM-10PM", en:"Expense 7PM-10PM", pt:"Despesa 19h-22h"}, check: () => Assistant.checkHourToday('range', 19, 22) },
        { id: 'm_list_new', xp: 40, icon: '📝', title: {es:"Planear", en:"Plan", pt:"Planejar"}, desc: {es:"Crea una lista", en:"Create a list", pt:"Criar uma lista"}, check: () => { const t=new Date().toDateString(); return Data.store.lists.some(l=>new Date(l.date).toDateString()===t); }},
        { id: 'm_list_done', xp: 80, icon: '✅', title: {es:"Cumplir", en:"Done", pt:"Feito"}, desc: {es:"Completa una lista", en:"Complete a list", pt:"Completar uma lista"}, check: () => { const t=new Date().toDateString(); return Data.store.lists.some(l=>l.status==='completed' && new Date(l.date).toDateString()===t); }},
        { id: 'm_txt_cafe', xp: 50, icon: '☕', title: {es:"Cafeína", en:"Caffeine", pt:"Cafeína"}, desc: {es:'Gasto descr "Cafe"', en:'Exp desc "Coffee"', pt:'Desp descr "Cafe"'}, check: () => Assistant.checkDescToday('cafe') },
        { id: 'm_txt_pan', xp: 50, icon: '🥖', title: {es:"Panadería", en:"Bakery", pt:"Padaria"}, desc: {es:'Gasto descr "Pan"', en:'Exp desc "Bread"', pt:'Desp descr "Pao"'}, check: () => Assistant.checkDescToday('pan') },
        { id: 'm_3_exps', xp: 100, icon: '⚡', title: {es:"Activo", en:"Active", pt:"Ativo"}, desc: {es:"Registra 3 gastos", en:"Log 3 expenses", pt:"Registrar 3 despesas"}, check: () => { const t=new Date().toDateString(); return Data.store.expenses.filter(e=>new Date(e.date).toDateString()===t).length >= 3; }}
    ],
    init() {
        console.log("Assistant v32.0 (Full Logic) Online");
        this.injectStyles();
        
        if (!Data.store.gamification) Data.store.gamification = { xp: 0, level: 1, badges: [], streak: 0, lastLogin: null, monthStreak: 0, lastSummary: null };
        if (!Data.store.gamification.dailyQuests) Data.store.gamification.dailyQuests = { date: null, quests: [] };
        if (Data.store.gamification.selectedAura) delete Data.store.gamification.selectedAura;
        
        if (!Data.store.gamification.currentSkin) Data.store.gamification.currentSkin = 'default';

        // Limpieza de medallas viejas
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
            const lang = Data.store.settings.lang || 'es';
            
            const txt = {
                es: { title: "📊 Resumen Semanal", spend: "Gasto Semana", top: "Top Gasto", rest: "Restante Mes" },
                en: { title: "📊 Weekly Summary", spend: "Weekly Spend", top: "Top Expense", rest: "Month Left" },
                pt: { title: "📊 Resumo Semanal", spend: "Gasto Semanal", top: "Top Gasto", rest: "Restante Mês" }
            }[lang];

            const fmt = (v) => (typeof UI !== 'undefined' ? UI.formatMoney(v) : `$${v}`);
            
            const contentHTML = `
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div class="glass-card" style="margin:0; padding:15px; text-align:center;">
                        <div style="font-size:11px; color:var(--text-sec); text-transform:uppercase; font-weight:700;">${txt.spend}</div>
                        <div style="font-size:26px; font-weight:800; color:var(--text-color);">${fmt(wStats.total)}</div>
                    </div>
                    <div style="background:rgba(120,120,120,0.05); padding:12px; border-radius:12px;">
                        <div style="font-size:12px; color:var(--text-sec); margin-bottom:4px;">${txt.top}:</div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:700; color:var(--primary);">${wStats.topCategory}</span>
                            <span style="font-weight:600;">${fmt(wStats.topAmount)}</span>
                        </div>
                    </div>
                    <div style="border-top:1px solid rgba(120,120,120,0.1); padding-top:10px; margin-top:5px;">
                        <div style="display:flex; justify-content:space-between; font-size:13px;">
                            <span style="color:var(--text-sec);">${txt.rest}:</span>
                            <span style="font-weight:800; color:${remaining > 0 ? 'var(--success)' : 'var(--danger)'};">${fmt(remaining)}</span>
                        </div>
                    </div>
                </div>
            `;

            setTimeout(() => { this.showReportModal(txt.title, contentHTML); }, 2000);
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
                    <button class="icon-btn" id="temp-close-btn">✕</button>
                </div>
                <div style="width:100%;">${htmlContent}</div>
                <button class="btn-full" id="temp-ok-btn" style="margin-top:20px;">OK</button>
            </div>
        `;
        document.body.appendChild(overlay);
        if(navigator.vibrate) navigator.vibrate(50);
        const close = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 300); };
        overlay.querySelector('#temp-close-btn').onclick = close;
        overlay.querySelector('#temp-ok-btn').onclick = close;
    },

    // --- LÓGICA DE IMAGEN Y ESTADOS ---
    updateMood(forceState = null) {
        const img = document.getElementById('mascot-img');
        if (!img) return;
        
        const currentSkinId = Data.store.gamification.currentSkin || 'default';
        const skinDef = this.skinsDef.find(s => s.id === currentSkinId) || this.skinsDef[0];
        const path = skinDef.path; 

        if (img.parentElement) img.parentElement.style = "";
        img.style = ""; 
        img.className = 'mascot-restore'; 

        if (forceState) {
            img.src = path + forceState;
            img.style.animation = "floatMascot 3s ease-in-out infinite";
            return;
        }

        const health = this.analyzeFinancialHealth();
        const ratio = health.limit > 0 ? (health.spent / health.limit) : 0;

        if (health.limit > 0 && ratio > 0.9) {
            img.src = path + 'alert.png';
            img.style.animation = "shake 0.5s infinite";
        } else if (health.score < 30) {
            img.src = path + 'worried.png';
            img.style.animation = "shake 0.5s infinite";
        } else if (health.score > 80) {
            img.src = path + 'happy.png';
            img.style.animation = "floatMascot 5s ease-in-out infinite";
        } else {
            img.src = path + 'idle.png';
            img.style.animation = "floatMascot 5s ease-in-out infinite";
        }
        img.onclick = () => this.giveTip();
    },

    // --- RENDERIZADO DEL PERFIL (CORREGIDO Y TRADUCIDO) ---
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

        const oldHeader = document.querySelector('.profile-header');
        if (oldHeader) oldHeader.style.display = 'none';

        const g = Data.store.gamification;
        const lang = Data.store.settings.lang || 'es';
        
        // DICCIONARIO INTERNO DEL PERFIL
        const t = {
            es: { lvl: 'NIVEL', xp: 'XP Actual', days: 'Días', skins: 'Skins', analysis: 'Análisis', missions: 'Misiones', badges: 'Medallas', health: 'Salud', leaks: 'Fugas', future: 'Futuro', locked: 'Bloqueado', skin_applied: 'Skin aplicada', lvl_req: 'Nivel' },
            en: { lvl: 'LEVEL', xp: 'Current XP', days: 'Days', skins: 'Skins', analysis: 'Analysis', missions: 'Quests', badges: 'Badges', health: 'Health', leaks: 'Leaks', future: 'Future', locked: 'Locked', skin_applied: 'Skin applied', lvl_req: 'Level' },
            pt: { lvl: 'NÍVEL', xp: 'XP Atual', days: 'Dias', skins: 'Skins', analysis: 'Análise', missions: 'Missões', badges: 'Medalhas', health: 'Saúde', leaks: 'Fugas', future: 'Futuro', locked: 'Bloqueado', skin_applied: 'Skin aplicada', lvl_req: 'Nível' }
        }[lang];

        const streak = (g.streak && g.streak > 0) ? g.streak : 1; 
        const nextLevelXP = this.config.baseXP * Math.pow(this.config.difficulty, g.level);
        const pct = Math.min(100, (g.xp / nextLevelXP) * 100).toFixed(1);

        container.innerHTML = '';

        // HEADER
        const headerHTML = `
            <div style="display:flex; align-items:center; margin-bottom:20px; background:var(--input-bg); padding:15px; border-radius:16px; border:1px solid rgba(0,0,0,0.05);">
                <div style="position:relative; width:60px; height:60px; margin-right:15px; flex-shrink:0;">
                    <svg viewBox="0 0 36 36" style="display:block; width:100%; height:100%;">
                        <path stroke="var(--text-sec)" stroke-opacity="0.1" stroke-width="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path stroke="var(--primary)" stroke-dasharray="${pct}, 100" stroke-width="3" fill="none" stroke-linecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                         <span style="font-size:7px; text-transform:uppercase; color:var(--text-sec); font-weight:700;">${t.lvl}</span>
                         <span style="font-size:22px; font-weight:900; color:var(--primary); line-height:1;">${g.level}</span>
                    </div>
                </div>
                <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-weight:800; font-size:18px; color:var(--text-color);">Master</span>
                        <span style="background:rgba(255,59,48,0.1); color:#FF3B30; font-size:11px; font-weight:800; padding:4px 10px; border-radius:12px; display:flex; align-items:center; gap:4px; border:1px solid rgba(255,59,48,0.2);">🔥 ${streak} ${t.days}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-sec);">
                        <span>${t.xp}</span>
                        <span>${Math.floor(g.xp)} / ${Math.floor(nextLevelXP)}</span>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += headerHTML;

        // NUEVO BOTON DE CHAT IA
        const aiButtonHTML = `
            <button class="btn-full" onclick="Assistant.openSmartyChat()" style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #BF5AF2 0%, #AF52DE 100%); border-radius: 18px;">
                <span style="font-size:22px;">🤖</span> Hablar con Smarty AI
            </button>
        `;
        container.innerHTML += aiButtonHTML;

        // SKINS
        const currentSkin = g.currentSkin || 'default';
        let skinsHTML = `<div class="section-label" style="margin-top:0;">${t.skins}</div><div class="skins-scroll-container">`;
        this.skinsDef.forEach(skin => {
            const isUnlocked = g.level >= skin.level;
            const activeClass = (currentSkin === skin.id) ? 'active' : '';
            const lockState = isUnlocked ? '' : 'locked';
            const imgPath = skin.path + 'idle.png';
            const action = isUnlocked ? `Assistant.setSkin('${skin.id}')` : `UI.showSnackbar('${t.lvl_req} ${skin.level}')`;
            skinsHTML += `<div class="skin-card ${activeClass} ${lockState}" onclick="${action}"><img src="${imgPath}" class="skin-preview-img" onerror="this.src='idle.png'"><div class="skin-name">${skin.name}</div>${!isUnlocked ? `<div class="skin-lvl-req">Lv.${skin.level}</div>` : ''}</div>`;
        });
        skinsHTML += `</div>`;
        container.innerHTML += skinsHTML;

        // ANÁLISIS
        const analysisHTML = `
            <div class="section-label" style="margin-top:10px;">${t.analysis}</div>
            <div class="analysis-box" style="padding:0; overflow:hidden;">
                <div style="display:flex; border-bottom:1px solid rgba(0,0,0,0.05);">
                    <button id="tab-health" class="analysis-tab ${this.config.currentAnalysisTab === 'health' ? 'active' : ''}" onclick="Assistant.setAnalysisTab('health')">📊 ${t.health}</button>
                    <button id="tab-leaks" class="analysis-tab ${this.config.currentAnalysisTab === 'leaks' ? 'active' : ''}" onclick="Assistant.setAnalysisTab('leaks')">🐜 ${t.leaks}</button>
                    <button id="tab-future" class="analysis-tab ${this.config.currentAnalysisTab === 'future' ? 'active' : ''}" onclick="Assistant.setAnalysisTab('future')">🔮 ${t.future}</button>
                </div>
                <div id="analysis-inject-area" style="padding:15px;"></div>
            </div>
        `;
        container.innerHTML += analysisHTML;
        setTimeout(() => this.renderAnalysisContent(), 10); 

        // MISIONES
        const qData = g.dailyQuests || { refreshUsed: false, quests: [] };
        const canRefresh = !qData.refreshUsed && !qData.quests.some(q => q.completed);
        const refreshOpacity = canRefresh ? '1' : '0.3';
        
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding-right:10px;">
                <div class="section-label" style="margin-bottom:0;">${t.missions}</div>
                <button onclick="Assistant.refreshMissions()" style="background:none; border:none; cursor:pointer; opacity:${refreshOpacity}; transition:0.2s; padding:5px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-sec)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
            </div>
            ${this.renderQuestsHTML(g, lang)}
        `;
        
        // MEDALLAS
        let badgesHTML = `<div class="section-label">${t.badges} (${g.badges.length}/${this.badgesDef.length})</div><div class="badges-grid" style="grid-template-columns: repeat(3, 1fr); gap:8px;">`;
        this.badgesDef.forEach(b => {
            const isOwned = g.badges.includes(b.id);
            const style = isOwned 
                ? 'opacity:1; background:var(--glass-bg); box-shadow:0 4px 10px rgba(0,0,0,0.05); filter:none; color:var(--text-color);' 
                : 'opacity:0.4; filter:grayscale(1); background:rgba(0,0,0,0.03);';
            const name = b.name[lang] || b.name.es;
            badgesHTML += `<div class="badge-card" style="${style} padding:10px 5px; min-height:90px; display:flex; flex-direction:column; align-items:center; justify-content:center;" onclick="UI.showSnackbar('${isOwned ? name : t.locked}')"><span style="font-size:26px;">${b.icon}</span><div style="font-size:10px; font-weight:800;">${name}</div></div>`;
        });
        badgesHTML += `</div>`;
        container.innerHTML += badgesHTML;
    },

    setSkin(skinId) {
        Data.store.gamification.currentSkin = skinId;
        Data.save();
        this.updateMood(); 
        this.renderProfile();
        if(navigator.vibrate) navigator.vibrate(20);
        if(typeof UI !== 'undefined') UI.showSnackbar("Skin aplicada");
    },

    renderAnalysisContent() {
        const container = document.getElementById('analysis-inject-area');
        if(!container) return;
        const data = this.getAnalysisData();
        let html = '';
        
        const lang = (Data.store.settings && Data.store.settings.lang) ? Data.store.settings.lang : 'es';
        const t = {
            es: { status_opt: 'ÓPTIMO', status_warn: 'ALERTA', status_crit: 'CRÍTICO', lbl_score: 'PUNTUACIÓN', lbl_sys: 'ESTADO SISTEMA', lbl_util: 'Presupuesto Utilizado', lbl_burn: 'GASTO DIARIO', lbl_avg: 'Promedio diario', lbl_runway: 'COBERTURA', lbl_days: 'DÍAS', lbl_est: 'Estimación', lbl_micro: 'MICRO-GASTOS', lbl_proj: 'PROYECCIÓN ANUAL', lbl_anom: 'SIN ANOMALÍAS', lbl_insight: 'ANÁLISIS', lbl_insight_txt: 'Estos gastos representan el', lbl_curr: 'GASTO ACTUAL', lbl_end: 'FIN DE MES (EST)', lbl_cap: 'CAPACIDAD LÍMITE', lbl_safe: 'ZONA SEGURA', lbl_over: 'DESBORDAMIENTO', lbl_cycle: 'DÍAS RESTANTES DE CICLO' },
            en: { status_opt: 'OPTIMAL', status_warn: 'WARNING', status_crit: 'CRITICAL', lbl_score: 'SCORE', lbl_sys: 'SYSTEM STATUS', lbl_util: 'Budget Utilized', lbl_burn: 'DAILY BURN', lbl_avg: 'Daily average', lbl_runway: 'RUNWAY', lbl_days: 'DAYS', lbl_est: 'Estimated coverage', lbl_micro: 'MICRO-SPEND', lbl_proj: 'ANNUAL PROJECTION', lbl_anom: 'NO ANOMALIES', lbl_insight: 'INTEL INSIGHT', lbl_insight_txt: 'These expenses represent', lbl_curr: 'CURRENT SPEND', lbl_end: 'MONTH END (EST)', lbl_cap: 'LIMIT CAPACITY', lbl_safe: 'SAFE ZONE', lbl_over: 'OVERFLOW', lbl_cycle: 'DAYS REMAINING IN CYCLE' },
            pt: { status_opt: 'ÓTIMO', status_warn: 'ALERTA', status_crit: 'CRÍTICO', lbl_score: 'PONTUAÇÃO', lbl_sys: 'STATUS SISTEMA', lbl_util: 'Orçamento Utilizado', lbl_burn: 'GASTO DIÁRIO', lbl_avg: 'Média diária', lbl_runway: 'COBERTURA', lbl_days: 'DIAS', lbl_est: 'Estimativa', lbl_micro: 'MICRO-GASTOS', lbl_proj: 'PROJEÇÃO ANUAL', lbl_anom: 'SEM ANOMALIAS', lbl_insight: 'ANÁLISE', lbl_insight_txt: 'Estes gastos representam', lbl_curr: 'GASTO ATUAL', lbl_end: 'FIM DO MÊS (EST)', lbl_cap: 'CAPACIDADE', lbl_safe: 'ZONA SEGURA', lbl_over: 'ESTOURO', lbl_cycle: 'DIAS RESTANTES DO CICLO' }
        }[lang];

        const fmt = (v) => (typeof UI !== 'undefined' ? UI.formatMoney(v) : v);

        if (this.config.currentAnalysisTab === 'health') {
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
                    <div class="intel-card"><div class="intel-label">${t.lbl_burn}</div><div class="intel-value">${fmt(data.dailyBurn)}</div><div class="intel-sub">${t.lbl_avg}</div></div>
                    <div class="intel-card"><div class="intel-label">${t.lbl_runway}</div><div class="intel-value">${Math.floor(data.daysLeftMoney)} <span style="font-size:10px;">${t.lbl_days}</span></div><div class="intel-sub">${t.lbl_est}</div></div>
                </div>`;
        } else if (this.config.currentAnalysisTab === 'leaks') {
            const totalAnts = data.topAnts.reduce((sum, item) => sum + item[1], 0);
            const projection = totalAnts * 12;
            html = `
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:10px; border-bottom:1px solid rgba(120,120,120,0.1); padding-bottom:10px;">
                    <div><div class="intel-label">${t.lbl_micro}</div><div class="intel-value" style="color:var(--danger);">${fmt(totalAnts)}</div></div>
                    <div style="text-align:right;"><div class="intel-label">${t.lbl_proj}</div><div class="log-mono" style="opacity:0.6;">-${fmt(projection)}</div></div>
                </div>
                <div style="max-height:120px; overflow-y:auto;">
                    ${data.topAnts.length ? data.topAnts.map(a => `<div class="log-row"><span style="display:flex; align-items:center; gap:6px;"><span style="width:4px; height:4px; background:var(--danger); border-radius:50%;"></span>${a[0].toUpperCase()}</span><span class="log-mono">${fmt(a[1])}</span></div>`).join('') : `<div style="padding:10px; text-align:center; font-size:11px; opacity:0.5;">${t.lbl_anom}</div>`}
                </div>
                <div class="intel-card" style="margin-top:10px; background:rgba(255, 59, 48, 0.05); border-color:rgba(255, 59, 48, 0.2);"><div class="scan-line"></div><div style="display:flex; gap:10px; align-items:center;"><div style="font-size:18px;">🐜</div><div><div class="intel-label" style="color:var(--danger);">${t.lbl_insight}</div><div style="font-size:10px; line-height:1.3;">${t.lbl_insight_txt} <b>${((totalAnts/(data.spent||1))*100).toFixed(1)}%</b></div></div></div></div>`;
        } else {
            const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
            const today = new Date().getDate();
            const daysRemaining = daysInMonth - today;
            const safe = data.limit > 0 && data.projectedTotal <= data.limit;
            const statusColor = safe ? 'var(--success)' : 'var(--danger)';
            const projectedWidth = data.limit > 0 ? Math.min(100, (data.projectedTotal / data.limit) * 100) : 100;
            html = `
                <div class="intel-grid" style="margin-top:0;">
                    <div class="intel-card"><div class="intel-label">${t.lbl_curr}</div><div class="intel-value">${fmt(data.spent)}</div></div>
                    <div class="intel-card"><div class="intel-label">${t.lbl_end}</div><div class="intel-value" style="color:${statusColor}">${fmt(data.projectedTotal)}</div></div>
                </div>
                <div class="intel-card" style="margin-top:10px; padding:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><div class="intel-label">${t.lbl_cap}</div><div class="log-mono" style="font-size:10px;">${fmt(data.limit)}</div></div>
                    <div style="position:relative; height:8px; background:rgba(120,120,120,0.1); border-radius:4px; overflow:hidden;">
                         <div style="position:absolute; left:0; top:0; height:100%; width:${projectedWidth}%; background:${statusColor}; opacity:0.3;"></div>
                         <div style="position:absolute; left:0; top:0; height:100%; width:${Math.min(100, (data.spent/data.limit)*100)}%; background:${statusColor}; box-shadow:0 0 10px ${statusColor};"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:5px;"><div class="intel-label">${Math.round(projectedWidth)}% PROJ.</div><div class="intel-label" style="color:${statusColor}">${safe ? t.lbl_safe : t.lbl_over}</div></div>
                </div>
                <div style="margin-top:10px; font-size:10px; color:var(--text-sec); text-align:center; font-family:'Roboto Mono', monospace;">[ T-${daysRemaining} ${t.lbl_cycle} ]</div>`;
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

        if (limit > 0) { 
            const percent = (spent / limit) * 100; 
            const expectedPercent = (day / totalDays) * 100; 
            if (percent >= 100) score = 0; 
            else if (percent > expectedPercent + 15) score -= 50; 
            else if (percent > expectedPercent + 5) score -= 20; 
        } else { 
            score = 50; 
        }

        const frequencyMap = {};
        d.expenses.forEach(e => { if (e.amount < 10) { const key = e.desc.toLowerCase().trim(); frequencyMap[key] = (frequencyMap[key] || 0) + e.amount; }});
        const topAnts = Object.entries(frequencyMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
        const dailyBurn = day > 0 ? spent / day : 0;
        const daysLeftMoney = (limit - spent) / (dailyBurn || 1);
        return { score: Math.max(0, Math.min(100, score)), spent, limit, dailyBurn, projectedTotal: dailyBurn * totalDays, topAnts, daysLeftMoney, percent: limit > 0 ? (spent/limit)*100 : 0 };
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
        const today = new Date().toDateString(); 
        
        if (!g.dailyQuests || g.dailyQuests.quests.length < 3 || g.dailyQuests.date !== today) { 
            console.log("Misiones caducadas o insuficientes. Generando nuevas...");
            this.generateDailyQuests(); 
        }
    },

    
    renderQuestsHTML(g, lang) {
        let html = '';
        if(g.dailyQuests && g.dailyQuests.quests) {
            g.dailyQuests.quests.forEach((q, idx) => {
                const def = Assistant.missionPool.find(m => m.id === q.id);
                if(def) {
                    html += `<div class="profile-quest-row"><div class="pq-icon">${def.icon}</div><div class="pq-info"><div class="pq-title">${def.title[lang] || def.title['es']}</div><div class="pq-desc" style="font-size:10px; opacity:0.6;">${def.desc[lang] || def.desc['es']}</div></div><button class="pq-btn ${q.completed ? 'done' : ''}" onclick="Assistant.verifyQuest(${idx})">${q.completed ? '✓' : 'Go'}</button></div>`;
                }
            });
        }
        return html;
    },

    generateDailyQuests() {
        const today = new Date().toDateString(); 
        const g = Data.store.gamification; 
        if (g.dailyQuests && g.dailyQuests.date === today && g.dailyQuests.quests.length >= 3) return;
        const shuffled = this.missionPool.sort(() => 0.5 - Math.random()); 
        g.dailyQuests = { date: today, refreshUsed: false, quests: shuffled.slice(0, 3).map(q => ({ id: q.id, completed: false })) }; 
        Data.save();
    },

    refreshMissions() {
        const g = Data.store.gamification;
        if (g.dailyQuests.refreshUsed) return UI.showSnackbar("Solo 1 vez por día ⏳");
        if (g.dailyQuests.quests.some(q => q.completed)) return UI.showSnackbar("Ya completaste misiones hoy 🚫");
        if(navigator.vibrate) navigator.vibrate(20);
        const shuffled = this.missionPool.sort(() => 0.5 - Math.random());
        g.dailyQuests.quests = shuffled.slice(0, 3).map(q => ({ id: q.id, completed: false }));
        g.dailyQuests.refreshUsed = true; 
        Data.save();
        this.renderProfile();
        UI.showSnackbar("♻️ Misiones actualizadas");
    },

    verifyQuest(idx) {
        const g = Data.store.gamification; 
        const q = g.dailyQuests.quests[idx]; 
        const def = Assistant.missionPool.find(m => m.id === q.id);
        if (!def) { if(typeof UI !== 'undefined') UI.showSnackbar("Actualizando misiones..."); this.generateDailyQuests(); this.renderProfile(); return; }
        if (q.completed) return;
        if (def.check()) { 
            q.completed = true; this.addXP(def.xp); Data.save(); this.renderProfile(); 
            if(typeof UI !== 'undefined') UI.showSnackbar(`+${def.xp} XP`); 
            if(navigator.vibrate) navigator.vibrate([50, 50]);
        } else { if(typeof UI !== 'undefined') UI.showSnackbar("Aún no completada."); }
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
        this.updateMood('thinking.png');
        const tip = this.getSmartTip();
        let overlay = document.getElementById('smarty-floating-tip');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'smarty-floating-tip';
            overlay.setAttribute('role', 'status');
            overlay.setAttribute('aria-live', 'polite');
            overlay.setAttribute('aria-atomic', 'true');
            document.body.appendChild(overlay); // NO dentro del panel con overflow:hidden
        }
        overlay.textContent = tip;
        overlay.classList.add('is-visible');
        clearTimeout(this._smartyTipTimeout);
        this._smartyTipTimeout = setTimeout(() => {
            overlay.classList.remove('is-visible');
            this.updateMood();
        }, 8500);
    },

    getSmartTip() {
        const lang = (Data.store.settings && Data.store.settings.lang) ? Data.store.settings.lang : 'es';
        const d = this.getAnalysisData();
        const limit = d.limit; const spent = d.spent; const percent = limit > 0 ? (spent / limit) * 100 : 0;
        const today = new Date();
        const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const expectedPercent = (today.getDate() / totalDays) * 100;

        if (limit > 0 && percent >= 90) return this.getRandomPhrase('critical', lang);
        if (limit > 0 && percent > (expectedPercent + 15)) return this.getRandomPhrase('fast_burn', lang);
        if ((today.getDay() === 5 || today.getDay() === 6 || today.getDay() === 0) && Math.random() > 0.4) return this.getRandomPhrase('weekend', lang);
        if (limit > 0 && percent < (expectedPercent - 10)) return this.getRandomPhrase('good_pace', lang);
        return this.getRandomPhrase('general', lang);
    },

    getRandomPhrase(category, lang) {
        const list = this.smartPhrases[category][lang] || this.smartPhrases[category]['es'];
        return list[Math.floor(Math.random() * list.length)];
    },

    injectStyles() {
        if (document.getElementById('assistant-styles')) return;
        const style = document.createElement('style');
        style.id = 'assistant-styles';
        style.innerHTML = `
            @keyframes floatMascot { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 25% { transform: translate(-3px, 0px) rotate(1deg); } 75% { transform: translate(3px, 1px) rotate(-1deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
            @keyframes scanline { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
            .mascot-restore { width: auto !important; height: 180px !important; max-width: 80% !important; object-fit: contain; display: block; margin: 0 auto; }
            .mascot-bubble-side { background: var(--glass-bg); padding: 10px 15px; border-radius: 12px; border-bottom-left-radius: 2px; font-weight: 600; font-size: 12px; color: var(--text-color); box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid var(--glass-border); }
            .profile-quest-row { display: flex; align-items: center; justify-content: space-between; background: rgba(120,120,120,0.05); padding: 10px; border-radius: 12px; margin-bottom: 8px; border: 1px solid var(--glass-border); }
            .pq-icon { font-size: 20px; margin-right: 12px; }
            .pq-info { flex: 1; margin-right: 10px; }
            .pq-title { font-size: 13px; font-weight: 700; color: var(--text-color); }
            .pq-desc { font-size: 10px; opacity: 0.7; }
            .pq-btn { background: var(--input-bg); border: none; padding: 6px 12px; border-radius: 8px; color: var(--primary); font-weight: 700; font-size: 11px; cursor: pointer; white-space: nowrap; }
            .pq-btn.done { background: var(--success); color: white; pointer-events: none; }
            .analysis-box { background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.0) 100%); border: 1px solid rgba(120,120,120,0.15); border-radius: 16px; margin-bottom: 20px; overflow: hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.02); }
            .dark-mode .analysis-box { background: rgba(0,0,0,0.2); border-color: rgba(255,255,255,0.1); }
            .analysis-tab { flex: 1; background: transparent; border: none; padding: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; opacity: 0.6; transition: 0.2s; border-bottom: 2px solid transparent; color: var(--text-sec); }
            .analysis-tab.active { opacity: 1; border-bottom-color: var(--primary); color: var(--primary); background: rgba(120,120,120,0.05); }
            .intel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
            .intel-card { background: var(--input-bg); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; justify-content: center; border: 1px solid rgba(0,0,0,0.03); position: relative; overflow: hidden; }
            .intel-label { font-size: 9px; text-transform: uppercase; color: var(--text-sec); font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px; }
            .intel-value { font-family: 'Roboto Mono', monospace; font-size: 16px; font-weight: 700; color: var(--text-color); }
            .intel-sub { font-size: 9px; opacity: 0.7; margin-top: 2px; }
            .tech-bar-bg { height: 6px; background: rgba(120,120,120,0.1); border-radius: 3px; overflow: hidden; margin-top: 5px; }
            .tech-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; position: relative; }
            .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: scanline 2s infinite linear; pointer-events: none; }
            .log-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed rgba(120,120,120,0.1); font-size: 11px; }
            .log-mono { font-family: 'Roboto Mono', monospace; font-weight: 700; }
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

    // --- LÓGICA DEL CHAT INTELIGENTE (SMARTY AI) ---

    openSmartyChat() {
        if(typeof Main !== 'undefined') Main.closeProfile();
        
        const chatBox = document.getElementById('smarty-chat-box');
        const input = document.getElementById('smarty-chat-input');
        chatBox.innerHTML = ''; 
        input.value = '';
        
        // Mensaje de bienvenida
        this.appendChatMessage("Hola Master. Soy Smarty. Estoy conectado a tus finanzas locales. Que quieres saber o en que te ayudo?", 'bot');
        
        // Boton de analisis rapido (Sugerencia)
        const quickBtn = document.createElement('div');
        quickBtn.innerHTML = `<button onclick="document.getElementById('smarty-chat-input').value='Hazme un analisis rapido de mi mes'; Assistant.sendSmartyMessage(); this.style.display='none';" style="background:var(--primary-grad); color:white; border:none; padding:10px 15px; border-radius:15px; font-size:12px; font-weight:bold; cursor:pointer; margin-top:5px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">📊 Analisis Rapido</button>`;
        chatBox.appendChild(quickBtn);

        document.getElementById('modal-smarty-chat').classList.add('open');
        
        // Soporte para tecla Enter
        input.onkeypress = (e) => {
            if(e.key === 'Enter') this.sendSmartyMessage();
        };
    },

    closeSmartyChat() {
        document.getElementById('modal-smarty-chat').classList.remove('open');
    },

    normalizeAIText(text) {
        return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    monthLabel(date) {
        const lang = Data?.store?.settings?.lang || 'es';
        return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : (lang === 'en' ? 'en-US' : 'es-ES'), {
            month: 'short', year: 'numeric'
        }).format(date);
    },

    monthlyRegisteredSnapshot(year, month) {
        const categories = {};
        let expensesTotal = 0;
        let shoppingTotal = 0;
        const addCategory = (name, amount) => {
            const key = name || 'Otros';
            categories[key] = (categories[key] || 0) + amount;
        };

        (Data.store.expenses || []).forEach(exp => {
            const amount = parseFloat(exp.amount) || 0;
            let applies = false;

            if (exp.isInstallment && exp.installments?.total) {
                const startDate = new Date(exp.date);
                const delta = (year - startDate.getFullYear()) * 12 + (month - startDate.getMonth());
                const installmentNumber = delta + 1;
                applies = installmentNumber >= 1 && installmentNumber <= Number(exp.installments.total);
            } else {
                const d = new Date(exp.date);
                applies = d.getFullYear() === year && d.getMonth() === month;
            }

            if (applies) {
                expensesTotal += amount;
                addCategory(exp.category || 'Otros', amount);
            }
        });

        (Data.store.lists || []).forEach(list => {
            if (list.status !== 'completed') return;
            const d = new Date(list.date);
            if (d.getFullYear() === year && d.getMonth() === month) {
                const total = parseFloat(list.total) || 0;
                shoppingTotal += total;
                addCategory(typeof UI !== 'undefined' ? UI.t('cat_market') : 'Supermercado', total);
            }
        });

        const topCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, amount]) => `${name}: ${amount.toFixed(2)}`)
            .join(', ');

        return {
            total: expensesTotal + shoppingTotal,
            expensesTotal,
            shoppingTotal,
            topCategories
        };
    },

    historicalSummary(monthCount = 6) {
        const now = new Date();
        const rows = [];
        for (let i = monthCount - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const snap = this.monthlyRegisteredSnapshot(d.getFullYear(), d.getMonth());
            rows.push(`${this.monthLabel(d)}: total ${snap.total.toFixed(2)}; gastos ${snap.expensesTotal.toFixed(2)}; compras ${snap.shoppingTotal.toFixed(2)}; top [${snap.topCategories || 'sin datos'}]`);
        }
        return rows.join('\n');
    },

    installmentSummary() {
        const rows = [];
        (Data.store.expenses || []).filter(e => e.isInstallment && e.installments?.total).forEach(exp => {
            const start = new Date(exp.date);
            const now = new Date();
            const delta = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
            const current = Math.max(1, delta + 1);
            const total = Number(exp.installments.total) || 1;
            const remaining = Math.max(0, total - current);
            if (current <= total) rows.push(`${exp.desc}: ${Number(exp.amount || 0).toFixed(2)}/mes, cuota ${current}/${total}, quedan ${remaining}`);
        });
        return rows.length ? rows.join('; ') : 'ninguna';
    },

    subscriptionSummary() {
        const subs = Data.store.subscriptions || [];
        if (!subs.length) return 'ninguna';
        const total = subs.reduce((sum, sub) => sum + (parseFloat(sub.cost) || 0), 0);
        return `${subs.map(s => `${s.name}: ${Number(s.cost || 0).toFixed(2)} dia ${s.day}`).join('; ')} | total mensual actual ${total.toFixed(2)}`;
    },

    activeListsSummary() {
        const lists = (Data.store.lists || []).filter(l => l.status === 'active').slice(0, 4);
        if (!lists.length) return 'ninguna';
        return lists.map(l => {
            const pending = (l.items || []).filter(i => !i.checked).slice(0, 15).map(i => `${i.name}${i.qty ? ` (${i.qty})` : ''}`);
            return `${l.name}: ${pending.join(', ') || 'sin pendientes'}`;
        }).join(' | ');
    },

    relevantProductHistory(question) {
        const q = this.normalizeAIText(question);
        const priceIntent = /(precio|preco|price|pague|pagaba|costo|costou|cost|inflacion|inflacao|subio|subiu|aumento|barato|caro)/.test(q);
        if (!priceIntent) return '';

        const points = {};
        (Data.store.lists || []).filter(l => l.status === 'completed').forEach(list => {
            (list.items || []).forEach(item => {
                const price = parseFloat(item.price) || 0;
                if (price <= 0) return;
                const key = typeof Shopping !== 'undefined' ? Shopping.normalize(item.name) : this.normalizeAIText(item.name);
                if (!points[key]) points[key] = { name: item.name, rows: [] };
                points[key].rows.push({ date: Number(list.date) || 0, price });
            });
        });

        const entries = Object.values(points);
        const directlyMentioned = entries.filter(entry => {
            const n = this.normalizeAIText(entry.name);
            return n.length > 2 && q.includes(n);
        });

        let selected = directlyMentioned;
        if (!selected.length) {
            selected = entries
                .filter(e => e.rows.length >= 2)
                .map(e => {
                    const rows = e.rows.sort((a, b) => a.date - b.date);
                    const first = rows[0].price;
                    const last = rows[rows.length - 1].price;
                    return { ...e, change: first > 0 ? Math.abs((last - first) / first) : 0 };
                })
                .sort((a, b) => b.change - a.change)
                .slice(0, 8);
        } else {
            selected = selected.slice(0, 8);
        }

        if (!selected.length) return 'No hay historial suficiente de precios.';
        return selected.map(entry => {
            const rows = entry.rows.sort((a, b) => a.date - b.date).slice(-6);
            return `${entry.name}: ${rows.map(r => `${new Date(r.date).toLocaleDateString()}:${r.price.toFixed(2)}`).join(', ')}`;
        }).join(' | ');
    },

    getFinancialContext(question = '') {
        const limit = Number(Data.store.budget?.limit || 0);
        const spent = typeof Finance !== 'undefined' ? Number(Finance.calculateMonthlySpent() || 0) : 0;
        const remaining = limit - spent;
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const elapsedDays = Math.max(1, now.getDate());
        const dailyBurn = spent / elapsedDays;
        const paceProjection = dailyBurn * daysInMonth;
        const q = this.normalizeAIText(question);
        const historyMonths = /(12 meses|ano|año|histor|tendenc|evolu|compar|ultimos meses|últimos meses)/.test(q) ? 12 : 6;

        const currentCategories = {};
        const addCurrentCategory = (cat, amount) => {
            const key = cat || 'Otros';
            currentCategories[key] = (currentCategories[key] || 0) + (Number(amount) || 0);
        };
        (Data.store.expenses || []).forEach(e => {
            const amount = parseFloat(e.amount) || 0;
            const d = new Date(e.date);
            if (!e.isInstallment && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                addCurrentCategory(e.category || 'Otros', amount);
            } else if (e.isInstallment && e.installments?.total) {
                const delta = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
                const installmentNumber = delta + 1;
                if (installmentNumber >= 1 && installmentNumber <= Number(e.installments.total)) {
                    addCurrentCategory(e.category || 'Otros', amount);
                }
            }
        });
        (Data.store.lists || []).filter(l => l.status === 'completed').forEach(l => {
            const d = new Date(l.date);
            if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                addCurrentCategory(typeof UI !== 'undefined' ? UI.t('cat_market') : 'Supermercado', parseFloat(l.total) || 0);
            }
        });
        (Data.store.subscriptions || []).forEach(sub => {
            if (now.getDate() >= Number(sub.day || 0)) {
                addCurrentCategory(typeof UI !== 'undefined' ? UI.t('tab_subs') : 'Suscripciones', parseFloat(sub.cost) || 0);
            }
        });
        const topCats = Object.entries(currentCategories).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c,a]) => `${c}: ${a.toFixed(2)}`).join(', ');

        const recentExp = [...(Data.store.expenses || [])]
            .sort((a,b) => Number(b.date || 0) - Number(a.date || 0))
            .slice(0,12)
            .map(e => `${new Date(e.date).toLocaleDateString()} ${e.desc}: ${Number(e.amount || 0).toFixed(2)} [${e.category || 'Otros'}]`)
            .join('; ');

        const productHistory = this.relevantProductHistory(question);
        const listContext = /(lista|comprar|compra|mercado|supermerc|falta|shopping)/.test(q) ? this.activeListsSummary() : 'omitido por no ser relevante a la pregunta';

        return `Eres Smarty, el asesor financiero personal de Smart Life Pro. Responde usando SOLO los datos suministrados; si falta un dato, dilo claramente y no lo inventes.

RESUMEN ACTUAL
- Fecha: ${now.toLocaleDateString()}
- Limite mensual: ${limit.toFixed(2)}
- Gastado contabilizado este mes: ${spent.toFixed(2)}
- Restante: ${remaining.toFixed(2)}
- Ritmo diario aproximado: ${dailyBurn.toFixed(2)}
- Proyeccion simple por ritmo al cierre: ${paceProjection.toFixed(2)}
- Categorias registradas destacadas este mes: ${topCats || 'sin datos'}

COMPROMISOS ACTUALES
- Suscripciones: ${this.subscriptionSummary()}
- Cuotas activas: ${this.installmentSummary()}

HISTORICO REGISTRADO (${historyMonths} meses)
${this.historicalSummary(historyMonths)}

MOVIMIENTOS RECIENTES
${recentExp || 'sin gastos registrados'}

LISTAS ACTIVAS
${listContext}

HISTORIAL DE PRECIOS RELEVANTE
${productHistory || 'omitido por no ser relevante a la pregunta'}

REGLAS IMPORTANTES
1. Los historicos mensuales anteriores incluyen gastos registrados, cuotas aplicables y compras finalizadas. Las suscripciones actuales no tienen fecha de alta historica en la base, por lo que NO debes inventar que existian en meses anteriores.
2. Distingue gasto ya contabilizado, compromisos actuales y proyecciones; no los mezcles como si fueran lo mismo.
3. Haz calculos concretos cuando ayuden y compara meses o categorias cuando la pregunta lo pida.
4. Mantente breve para preguntas simples. Para un analisis financiero solicitado puedes usar hasta 6-8 frases cortas.
5. Responde en el idioma del usuario y con tono directo, util y ligeramente informal. Usa emojis con moderacion.`;
    },

    async sendSmartyMessage() {
        const input = document.getElementById('smarty-chat-input');
        const text = input.value.trim();
        if (!text) return;

        // Pedir la clave antes de modificar el chat; si se cancela, no deja mensajes colgados.
        const apiKey = GroqAI.getApiKey();
        if (!apiKey) return;

        // 1. Mostrar mensaje del usuario
        this.appendChatMessage(text, 'user');
        input.value = '';

        // 2. Mostrar "Pensando..."
        const typingId = 'typing-' + Date.now();
        this.appendChatMessage("Pensando...", 'bot', typingId);

        try {
            const context = this.getFinancialContext(text);
            const botReply = await GroqAI.chat(context, text);

            // 3. Remover "Pensando..." y mostrar respuesta final
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            this.appendChatMessage(botReply, 'bot');

        } catch (err) {
            console.error('Error Groq Smarty:', err);
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            const msg = GroqAI.friendlyError(err);
            if (msg) this.appendChatMessage(msg, 'bot');
        }
    },

    appendChatMessage(text, sender, id = '') {
        const chatBox = document.getElementById('smarty-chat-box');
        const msgDiv = document.createElement('div');
        if(id) msgDiv.id = id;
        
        const isUser = sender === 'user';
        
        msgDiv.style.cssText = `
            max-width: 85%;
            padding: 12px 18px;
            border-radius: 22px;
            font-size: 14px;
            line-height: 1.45;
            font-weight: 500;
            align-self: ${isUser ? 'flex-end' : 'flex-start'};
            background: ${isUser ? 'var(--primary-grad)' : 'var(--glass-bg)'};
            color: ${isUser ? 'white' : 'var(--text-color)'};
            border: ${isUser ? 'none' : '1px solid var(--glass-border)'};
            box-shadow: 0 4px 15px rgba(0,0,0,0.04);
            border-bottom-right-radius: ${isUser ? '4px' : '22px'};
            border-bottom-left-radius: ${isUser ? '22px' : '4px'};
        `;
        
        // Formatear texto de forma segura y conservar **negritas**
        let formattedText = String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b style="font-weight:800;">$1</b>');
        
        msgDiv.innerHTML = formattedText;
        chatBox.appendChild(msgDiv);
        
        // Bajar el scroll al ultimo mensaje automaticamente
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 50);
    }
};