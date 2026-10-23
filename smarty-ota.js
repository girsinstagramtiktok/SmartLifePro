/* =========================================
   SMART LIFE PRO - LIVE OTA UPDATE (V14.5)
   1. Lector Bancario Inteligente (Extrae comercio real y categoría, ignora "Compra aprobada")
   2. Círculo de Presupuesto Limpio (Sin sombra gris ni punto negro feo)
   3. Logos Oficiales Reales (Netflix, ChatGPT, Spotify, YouTube, Nubank, Uber, etc.)
   ========================================= */

(function () {
    console.log("⚡ [Smarty OTA V14.5] Aplicando actualización en vivo...");
    window.SMARTY_APK_VERSION = "14.5-OTA";

    // ---------------------------------------------------------
    // 1. LIMPIAR EL CIRCULO DE PRESUPUESTO (Quitar sombra gris fea y marcador viejo)
    // ---------------------------------------------------------
    const cleanRingStyle = document.createElement("style");
    cleanRingStyle.innerHTML = `
        #budget-circle {
            filter: none !important;
            box-shadow: none !important;
        }
        #pace-day-marker {
            display: none !important;
        }
        .brand-logo-real {
            width: 38px;
            height: 38px;
            border-radius: 11px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            overflow: hidden;
            box-shadow: 0 3px 8px rgba(0,0,0,0.12);
        }
        .brand-logo-real svg, .brand-logo-real img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
    `;
    document.head.appendChild(cleanRingStyle);

    const oldMarker = document.getElementById("pace-day-marker");
    if (oldMarker) oldMarker.remove();

    // ---------------------------------------------------------
    // 2. LOGOS OFICIALES REALES (SVG Vectoriales + Favicons Oficiales de Alta Resolución)
    // ---------------------------------------------------------
    window.getSmartBrandBadge = function (name) {
        const n = String(name || "").toLowerCase().trim();

        const officialBrands = [
            {
                match: ["netflix"],
                domain: "netflix.com",
                svg: `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#000"/><path fill="#E50914" d="M14 8h6l8 21V8h6v32h-6l-8-21v21h-6V8z"/></svg>`
            },
            {
                match: ["chatgpt", "openai", "gpt", "claude", "ia"],
                domain: "openai.com",
                svg: `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#10A37F"/><path fill="none" stroke="#FFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M24 12c4.5 0 8 3 8.5 7.2 3.8 1.5 5.5 5.8 3.8 9.6-1.2 2.8-3.8 4.6-6.8 4.8-1.8 3.2-5.8 4.4-9.2 2.8-1.5-.7-2.7-1.9-3.4-3.4-3.8-.5-6.6-3.8-6.4-7.6.1-2 .9-3.8 2.4-5.1-.5-4.2 2.5-8 6.7-8.5 1.5-.2 3 .1 4.4.8z"/><circle cx="24" cy="24" r="3.5" fill="#FFF"/></svg>`
            },
            {
                match: ["spotify"],
                domain: "spotify.com",
                svg: `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#1DB954"/><path fill="none" stroke="#000" stroke-width="3.4" stroke-linecap="round" d="M13 19c7-2 15-1.5 22 2M15 25.5c5.5-1.5 12-1 17.5 1.8M17 31.5c4-1 9-.8 13 1.2"/></svg>`
            },
            {
                match: ["youtube", "yt"],
                domain: "youtube.com",
                svg: `<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#FF0000"/><polygon points="20,16 33,24 20,32" fill="#FFF"/></svg>`
            },
            {
                match: ["disney"],
                domain: "disneyplus.com"
            },
            {
                match: ["prime", "amazon"],
                domain: "primevideo.com"
            },
            {
                match: ["max", "hbo"],
                domain: "max.com"
            },
            {
                match: ["crunchyroll"],
                domain: "crunchyroll.com"
            },
            {
                match: ["apple", "icloud"],
                domain: "apple.com"
            },
            {
                match: ["google", "drive", "one"],
                domain: "one.google.com"
            },
            {
                match: ["playstation", "psn", "ps plus"],
                domain: "playstation.com"
            },
            {
                match: ["xbox", "gamepass", "game pass"],
                domain: "xbox.com"
            },
            {
                match: ["steam"],
                domain: "steampowered.com"
            },
            {
                match: ["uber", "99"],
                domain: "uber.com"
            },
            {
                match: ["ifood", "rappi", "pedidosya"],
                domain: "ifood.com.br"
            },
            {
                match: ["nubank", "nu "],
                domain: "nubank.com.br"
            },
            {
                match: ["mercado pago", "mercadopago", "mercado libre", "meli"],
                domain: "mercadopago.com.br"
            },
            {
                match: ["inter"],
                domain: "inter.co"
            },
            {
                match: ["itau", "itaú"],
                domain: "itau.com.br"
            },
            {
                match: ["bradesco"],
                domain: "bradesco.com.br"
            },
            {
                match: ["santander"],
                domain: "santander.com.br"
            },
            {
                match: ["claro"],
                domain: "claro.com.br"
            },
            {
                match: ["vivo"],
                domain: "vivo.com.br"
            },
            {
                match: ["tim"],
                domain: "tim.com.br"
            },
            {
                match: ["smartfit", "smart fit", "gym", "gimnasio", "academia"],
                domain: "smartfit.com.br"
            }
        ];

        for (const b of officialBrands) {
            if (b.match.some(k => n.includes(k))) {
                if (b.svg) {
                    return `<span class="brand-logo-real">${b.svg}</span>`;
                }
                const iconUrl = `https://www.google.com/s2/favicons?domain=${b.domain}&sz=128`;
                return `<span class="brand-logo-real" style="background:#fff;"><img src="${iconUrl}" alt="${name}" onerror="this.parentElement.innerHTML='💳'"></span>`;
            }
        }

        // Iconos vectoriales limpios para servicios del hogar (Luz, Agua, Internet, Casa)
        if (/(luz|energia|electricidad|enel|cemig|celpe|copel)/.test(n)) {
            return `<span class="brand-logo-real" style="background:linear-gradient(135deg,#F59E0B,#D97706);color:#fff;font-size:19px;">⚡</span>`;
        }
        if (/(agua|saneamiento|sabesp|copasa)/.test(n)) {
            return `<span class="brand-logo-real" style="background:linear-gradient(135deg,#0EA5E9,#0284C7);color:#fff;font-size:19px;">💧</span>`;
        }
        if (/(internet|wifi|fibra)/.test(n)) {
            return `<span class="brand-logo-real" style="background:linear-gradient(135deg,#3B82F6,#1D4ED8);color:#fff;font-size:19px;">🌐</span>`;
        }
        if (/(alquiler|aluguel|renta|casa|condominio)/.test(n)) {
            return `<span class="brand-logo-real" style="background:linear-gradient(135deg,#10B981,#047857);color:#fff;font-size:19px;">🏠</span>`;
        }

        return `<span class="brand-logo-real" style="background:var(--primary-grad);color:#fff;font-size:18px;">💳</span>`;
    };

    // Re-aplicar logos en la lista de Gastos Fijos
    if (typeof Finance !== "undefined") {
        const origRenderSubs = Finance.renderSubscriptions.bind(Finance);
        Finance.renderSubscriptions = function () {
            origRenderSubs();
            const listEl = document.getElementById("subs-list");
            if (!listEl) return;
            listEl.querySelectorAll(".item-row").forEach(row => {
                row.querySelectorAll(".brand-badge, .brand-logo-real").forEach(el => el.remove());
                const titleEl = row.querySelector('div[style*="font-weight:700"]') || row.querySelector('div[style*="font-weight:800"]');
                if (titleEl) {
                    row.insertAdjacentHTML("afterbegin", window.getSmartBrandBadge(titleEl.innerText));
                }
            });
        };
    }

    // ---------------------------------------------------------
    // 3. LECTOR BANCARIO ULTRA-INTELIGENTE (Extrae el Comercio Real detrás del monto, ignora "Compra aprobada")
    // ---------------------------------------------------------
    function extractCleanBankDataOffline(title, text) {
        const full = `${title || ""} | ${text || ""}`.trim();

        // 1. Extraer el monto real (soporta 1.250,50 | 24,50 | 24.50)
        const moneyRegex = /(?:r\$|\$|usd|brl|eur|valor|por|de)?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})|\d+(?:\.\d{1,2})?)/gi;
        let amount = 0;
        let match;
        while ((match = moneyRegex.exec(text || full)) !== null) {
            let rawNum = match[1];
            if (rawNum.includes(",") && rawNum.includes(".")) {
                rawNum = rawNum.replace(/\./g, "").replace(",", ".");
            } else if (rawNum.includes(",")) {
                rawNum = rawNum.replace(",", ".");
            }
            const val = parseFloat(rawNum);
            if (val > 0 && val < 1000000) {
                amount = val;
                break;
            }
        }

        // 2. Extraer el comercio o destinatario real (lo que viene DESPUES de "en", "em", "no", "na", "para", "en el comercio", etc.)
        let merchant = "";
        const afterPreposition = (text || full).match(/(?:\ben\b|\bem\b|\bno\b|\bna\b|\bpara\b|\bat\b|\bto\b|\bestabelecimento\b|\bcomercio\b)\s+([A-Za-zÀ-ÿ0-9\s.*&-]{2,35}?)(?:\s+(?:por|no valor|de|r\$|\$|el dia|em \d|aprovad|aprobad|con tu|com seu|final|\.|,)|$)/i);

        if (afterPreposition && afterPreposition[1]) {
            merchant = afterPreposition[1].trim();
        } else {
            // Limpiar toda la basura bancaria del principio ("Compra de crédito aprobada", "Pix enviado", etc.)
            merchant = String(text || "")
                .replace(/(compra|pagamento|pago|transferencia|transferência|pix)\s*(de|no|en|con|com|por)?\s*(credito|crédito|debito|débito|cartao|cartão|tarjeta)?\s*(aprovada|aprovado|aprobada|aprobado|realizada|enviado|enviada)?/gi, "")
                .replace(/(?:r\$|\$|usd|brl|eur)\s*\d+(?:[.,]\d+)?/gi, "")
                .replace(/\b(por|no valor de|valor de|de|en|em|para|com|con|tu tarjeta|seu cartao|final \d+)\b/gi, " ")
                .replace(/[.,:;!?|()-]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        if (!merchant || merchant.length < 2) {
            merchant = (title && !/(compra|aprovad|aprobad|notifica)/i.test(title)) ? title.trim() : "Pago con Tarjeta";
        }

        // Capitalizar limpio
        merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1);

        // 3. Auto-detectar categoría según el comercio extraído
        const mLow = merchant.toLowerCase();
        let category = "cat_other";
        if (/(uber|99|taxi|cabify|gasolina|posto|shell|ipiranga|petrobras|metro|onibus|peaje)/.test(mLow)) category = "cat_transport";
        else if (/(mercado|super|carrefour|atacadao|assai|pao de acucar|extra|dia|walmart|oxxo|padaria|panaderia|carniceria|acougue)/.test(mLow)) category = "cat_market";
        else if (/(ifood|rappi|burger|mcdonald|bk|pizza|restaurante|bar|cafe|cafeteria|starbucks|sushi|lanchonete|helado|sorvete|cine|netflix|spotify)/.test(mLow)) category = "cat_leisure";
        else if (/(farmacia|droga|raia|drogasil|pacheco|hospital|clinica|medico|dentista|salud)/.test(mLow)) category = "cat_health";
        else if (/(zara|nike|adidas|shein|renner|riachuelo|cea|ropa|tienda|shopping)/.test(mLow)) category = "cat_clothes";
        else if (/(luz|agua|internet|claro|vivo|tim|enel|alquiler|condominio)/.test(mLow)) category = "cat_bills";

        return { amount, merchant, category };
    }

    if (window.NativeBridge) {
        window.NativeBridge.processBankNotification = async function (notif) {
            const title = String(notif.title || "").trim();
            const text = String(notif.text || notif.body || "").trim();
            const fullText = `${title} - ${text}`.trim();
            if (fullText.length < 4) return;

            this.lastCapturedText = fullText.slice(0, 80);
            localStorage.setItem("smarty_last_notif", this.lastCapturedText);
            const logEl = document.getElementById("smarty-last-notif-log");
            if (logEl) logEl.innerText = this.lastCapturedText;

            if (!Data.store.settings?.bankAutoDetect) return;

            const payRegex = /(compra|pago|pagaste|aprobada|aprovada|aprovado|aprobado|pix|transferencia|transferência|débito|debito|crédito|credito|spent|paid|r\$|\$)/i;
            if (!payRegex.test(fullText)) return;

            const categories = ["cat_market", "cat_leisure", "cat_transport", "cat_clothes", "cat_health", "cat_bills", "cat_travel", "cat_beauty", "cat_other"];
            let extracted = null;

            // Intentar primero con la IA de Groq pidiéndole explícitamente ignorar "Compra aprobada"
            if (Data.store.settings?.groqApiKey && typeof GroqAI !== "undefined" && navigator.onLine) {
                try {
                    const schema = {
                        type: "object",
                        properties: {
                            isRealExpense: { type: "boolean" },
                            amount: { type: "number" },
                            merchant: { type: "string" },
                            category: { type: "string", enum: categories }
                        },
                        required: ["isRealExpense", "amount", "merchant", "category"],
                        additionalProperties: false
                    };
                    const prompt = `Analiza esta notificación bancaria: Título="${title}", Texto="${text}".
REGLA CRÍTICA: NUNCA pongas "Compra aprobada", "Compra de crédito aprobada" ni el nombre del banco como 'merchant'.
Extrae en 'merchant' ÚNICAMENTE el nombre del comercio, tienda, servicio o persona que aparece después del monto o después de palabras como "en", "em", "no", "para" (ejemplo: si dice "Compra de crédito aprobada por $25.00 en Farmacia San Pablo", merchant DEBE ser "Farmacia San Pablo" y category "cat_health").
Categorías permitidas: ${categories.join(", ")}.`;

                    extracted = await GroqAI.textJSON(prompt, fullText, "bank_expense_v2", schema, { maxTokens: 350 });
                    if (!extracted.isRealExpense) return;
                } catch (_) {}
            }

            // Si no hubo IA o la IA devolvió una frase genérica como "Compra aprobada", usamos nuestro extractor limpio
            if (!extracted || !extracted.amount || /(compra|aprovad|aprobad)/i.test(extracted.merchant || "")) {
                extracted = extractCleanBankDataOffline(title, text);
            }

            const amount = Number(extracted.amount);
            if (!amount || amount <= 0) return;

            const cleanDesc = String(extracted.merchant || "Pago").trim();
            const cat = categories.includes(extracted.category) ? extracted.category : "cat_other";

            if (Data.store.settings.bankAutoSaveMode === "auto") {
                Data.store.expenses.push({
                    id: Date.now().toString(),
                    date: Date.now(),
                    amount,
                    desc: cleanDesc,
                    category: UI.t(cat),
                    isInstallment: false
                });
                Data.save();
                UI.renderBudgetChart();
                Finance.renderHomeWidgets();
                if (typeof Assistant !== "undefined") {
                    Assistant.showReactivePopup(`🏦 ${cleanDesc}: ${UI.formatMoney(amount)}`);
                }
            } else {
                Finance.openSmartExpenseModal(amount, cleanDesc, cat);
            }
        };

        window.NativeBridge.sendRealTestNotificationToStatusBar = function () {
            Data.store.settings.bankAutoDetect = true;
            Data.save();
            if (!this.isListenerPermissionGranted()) {
                UI.showSnackbar("⚠️ Primero activa el Permiso de Notificaciones de Android");
                this.openNotificationAccessSettings();
                return;
            }
            if (window.SmartyAndroid && window.SmartyAndroid.postRealTestNotification) {
                UI.showSnackbar("📲 Probando notificación bancaria realista...");
                window.SmartyAndroid.postRealTestNotification(
                    "Compra de crédito aprobada",
                    "Compra de crédito aprobada por $34.90 en Supermercado Carrefour con tu tarjeta final 4021"
                );
            }
        };
    }

    if (typeof UI !== "undefined") {
        UI.refreshDOM();
    }
})();
