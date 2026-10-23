/* =========================================
   SMART LIFE PRO - EXCLUSIVE ANDROID APK UPGRADES
   No afecta a la PWA de Vercel. Solo se inyecta en el APK.
   ========================================= */

(function () {
    console.log("🤖 [Smarty APK Exclusive] Iniciando mejoras exclusivas para Android...");

    // 1. PULIDO ESTETICO NEXT-GEN + FIX DE TOQUES ANDROID WEBVIEW (60 FPS)
    const apkStyle = document.createElement('style');
    apkStyle.innerHTML = `
        /* Evitar que capas ocultas bloqueen los botones en Android */
        #listening-overlay:not(.active) { display: none !important; pointer-events: none !important; }
        .modal-overlay:not(.open) { display: none !important; pointer-events: none !important; }
        #custom-confirm:not(.open) { display: none !important; pointer-events: none !important; }
        
        /* Activar boton de Huella Digital en la pantalla de PIN */
        .pin-pad .pin-btn.bio-btn-active {
            visibility: visible !important;
            pointer-events: auto !important;
            color: var(--primary) !important;
            font-size: 26px !important;
            background: rgba(0, 110, 230, 0.08) !important;
            border: 1px solid rgba(0, 110, 230, 0.25) !important;
        }

        /* Pulido visual moderno exclusivo APK */
        .glass-card {
            border-radius: 24px !important;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.07) !important;
        }
        .bottom-dock {
            border-radius: 30px !important;
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22) !important;
        }
    `;
    document.head.appendChild(apkStyle);

    // 2. ACTUALIZAR GROQ AI A LLAMA 3.3 70B + LLAMA 4 SCOUT VISION (Con Fallback)
    function upgradeGroqModels() {
        if (typeof GroqAI === 'undefined') return;
        GroqAI.textModel = 'llama-3.3-70b-versatile';
        GroqAI.visionModel = 'meta-llama/llama-4-scout-17b-16e-instruct';

        GroqAI.chat = async function (systemPrompt, userText, { maxTokens = 650 } = {}) {
            const payload = {
                model: this.textModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText }
                ],
                temperature: 0.4,
                max_completion_tokens: maxTokens,
                stream: false
            };
            const data = await this.request(payload, { timeoutMs: 30000 });
            return this.extractText(data);
        };

        GroqAI.textJSON = async function (instructions, userText, schemaName, schema, { maxTokens = 900 } = {}) {
            const schemaHint = "\nIMPORTANT: Return ONLY a valid JSON object matching this exact schema: " + JSON.stringify(schema);
            const payload = {
                model: this.textModel,
                messages: [
                    { role: 'system', content: instructions + schemaHint },
                    { role: 'user', content: userText }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
                max_completion_tokens: maxTokens,
                stream: false
            };
            const data = await this.request(payload, { timeoutMs: 30000 });
            return this.parseJSON(this.extractText(data));
        };

        GroqAI.visionJSON = async function (promptText, rawBase64) {
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
        };
    }

    // 3. ALMACENAMIENTO NATIVO ANDROID (Capacitor Preferences + IndexedDB fuera del navegador)
    function upgradeNativeStorage() {
        if (typeof Data === 'undefined') return;

        // Hidratar desde almacenamiento nativo Android si existe respaldo
        if (window.Capacitor?.Plugins?.Preferences) {
            window.Capacitor.Plugins.Preferences.get({ key: Data.KEY }).then(({ value }) => {
                if (value) {
                    try {
                        const parsed = JSON.parse(value);
                        const candCount = (parsed.expenses?.length || 0) + (parsed.lists?.length || 0);
                        const currCount = (Data.store.expenses?.length || 0) + (Data.store.lists?.length || 0);
                        if (candCount > currCount) {
                            Data.store = parsed;
                            localStorage.setItem(Data.KEY, value);
                            if (typeof UI !== 'undefined') UI.refreshDOM();
                        }
                    } catch (_) {}
                }
            }).catch(() => {});
        }

        const origSave = Data.save.bind(Data);
        Data.save = function () {
            origSave();
            const serialized = JSON.stringify(Data.store);
            if (window.Capacitor?.Plugins?.Preferences) {
                window.Capacitor.Plugins.Preferences.set({ key: Data.KEY, value: serialized }).catch(() => {});
            }
            try {
                const req = indexedDB.open("SmartyAndroidNativeDB", 1);
                req.onupgradeneeded = (e) => e.target.result.createObjectStore("kv");
                req.onsuccess = (e) => {
                    const db = e.target.result;
                    db.transaction("kv", "readwrite").objectStore("kv").put(serialized, Data.KEY);
                };
            } catch (_) {}
        };
    }

    // 4. PUENTE NATIVO ANDROID: LECTOR DE NOTIFICACIONES BANCARIAS + ALERTAS SUSCRIPCIONES
    window.NativeBridge = {
        init() {
            if (typeof Data === 'undefined' || !Data.store) return;
            if (!Data.store.settings) Data.store.settings = {};
            if (typeof Data.store.settings.subNotifications === "undefined") Data.store.settings.subNotifications = true;
            if (typeof Data.store.settings.bankAutoDetect === "undefined") Data.store.settings.bankAutoDetect = false;
            if (typeof Data.store.settings.bankAutoSaveMode === "undefined") Data.store.settings.bankAutoSaveMode = "confirm";

            this.scheduleAndroidSubscriptionNotifications();
            window.addEventListener("SmartyBankNotification", (e) => {
                if (e && e.detail) this.processBankNotification(e.detail);
            });
        },

        async scheduleAndroidSubscriptionNotifications() {
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
                            id: 7000 + idx,
                            title: "🔔 Cobro próximo: " + sub.name,
                            body: "Mañana (día " + day + ") se cobra " + sub.name + " por " + UI.formatMoney(sub.cost),
                            schedule: { at: nextDate }
                        });
                    });
                    if (notifications.length) {
                        await window.Capacitor.Plugins.LocalNotifications.schedule({ notifications });
                    }
                } catch (_) {}
            }
        },

        async sendInstantNotification(title, body) {
            if (Data.store.settings?.subNotifications === false) return;
            if (window.Capacitor?.Plugins?.LocalNotifications) {
                try {
                    await window.Capacitor.Plugins.LocalNotifications.schedule({
                        notifications: [{
                            id: Math.floor(Math.random() * 80000) + 1000,
                            title,
                            body,
                            schedule: { at: new Date(Date.now() + 500) }
                        }]
                    });
                } catch (_) {}
            }
        },

        openNotificationAccessSettings() {
            if (window.SmartyAndroid && window.SmartyAndroid.openNotificationSettings) {
                window.SmartyAndroid.openNotificationSettings();
            } else {
                UI.showSnackbar("Ve a Ajustes de Android > Acceso a notificaciones");
            }
        },

        async processBankNotification(notif) {
            if (!Data.store.settings?.bankAutoDetect) return;
            const fullText = ((notif.title || "") + " - " + (notif.text || "")).trim();
            if (fullText.length < 6) return;

            const payRegex = /(compra|pago|pagaste|aprobada|aprovada|pix|transferencia|transferência|débito|debito|crédito|credito|spent|paid|r\$|\$)/i;
            if (!payRegex.test(fullText)) return;

            const categories = ["cat_market", "cat_leisure", "cat_transport", "cat_clothes", "cat_health", "cat_bills", "cat_travel", "cat_beauty", "cat_other"];
            let extracted = null;

            if (Data.store.settings?.groqApiKey && typeof GroqAI !== "undefined") {
                try {
                    const schema = {
                        type: "object",
                        properties: {
                            isRealExpense: { type: "boolean" },
                            amount: { type: "number" },
                            merchant: { type: "string" },
                            category: { type: "string", enum: categories }
                        },
                        required: ["isRealExpense", "amount", "merchant", "category"]
                    };
                    extracted = await GroqAI.textJSON(
                        "Extract real payment expense from banking notification. Ignore ads. Categories: " + categories.join(", "),
                        fullText, "bank_expense", schema, { maxTokens: 300 }
                    );
                    if (!extracted.isRealExpense) return;
                } catch (_) {}
            }

            if (!extracted || !extracted.amount) {
                const m = fullText.match(/(\d+(?:[.,]\d{1,2})?)/);
                if (!m) return;
                extracted = { amount: parseFloat(m[1].replace(",", ".")), merchant: notif.title || "Pago Bancario", category: "cat_other" };
            }

            const amount = Number(extracted.amount);
            if (!amount || amount <= 0) return;
            const desc = "🏦 " + String(extracted.merchant || "Banco").trim();
            const cat = categories.includes(extracted.category) ? extracted.category : "cat_other";

            if (Data.store.settings.bankAutoSaveMode === "auto") {
                Data.store.expenses.push({
                    id: Date.now().toString(), date: Date.now(), amount,
                    desc, category: UI.t(cat), isInstallment: false, installments: null
                });
                Data.save();
                UI.renderBudgetChart();
                Finance.renderHomeWidgets();
                this.sendInstantNotification("🤖 Gasto Bancario Registrado", UI.formatMoney(amount) + " en " + desc);
                if (typeof Assistant !== "undefined") Assistant.showReactivePopup("🏦 Auto-registrado: " + UI.formatMoney(amount));
            } else {
                Finance.openSmartExpenseModal(amount, desc, cat);
            }
        },

        simulateBankNotification() {
            Data.store.settings.bankAutoDetect = true;
            Data.save();
            const samples = [
                { title: "Nubank", text: "Compra aprobada en Uber Trip por 24.50" },
                { title: "Mercado Pago", text: "Pagaste 65.00 en Supermercado Central" },
                { title: "Banco Inter", text: "Pix enviado de R$ 38.90 para Pizzaria Napoli" }
            ];
            this.processBankNotification(samples[Math.floor(Math.random() * samples.length)]);
        }
    };

    // 5. HUELLA DIGITAL Y RECONOCIMIENTO FACIAL NATIVO EN PANTALLA DE PIN
    function setupBiometrics() {
        const emptyPinBtn = document.querySelector(".pin-pad .pin-btn:nth-child(10)");
        if (emptyPinBtn && !emptyPinBtn.classList.contains("bio-btn-active")) {
            emptyPinBtn.classList.add("bio-btn-active");
            emptyPinBtn.innerHTML = "🫆";
            emptyPinBtn.onclick = () => {
                if (window.SmartyAndroid && window.SmartyAndroid.authenticateBiometric) {
                    window.SmartyAndroid.authenticateBiometric();
                } else {
                    UI.showSnackbar("Toca para desbloquear con Huella / Rostro");
                }
            };
        }

        if (Data?.store?.settings?.pin && window.SmartyAndroid?.authenticateBiometric) {
            setTimeout(() => window.SmartyAndroid.authenticateBiometric(), 400);
        }
    }

    // 6. PANEL DE BANCOS Y ALERTAS EN AJUSTES + CARRITO EN TIEMPO REAL
    function upgradeUIAndShopping() {
        if (typeof UI !== "undefined" && UI.renderSettingsView) {
            const origSettings = UI.renderSettingsView.bind(UI);
            UI.renderSettingsView = function () {
                origSettings();
                const groqCard = document.getElementById("groq-usage-card");
                if (groqCard && !document.getElementById("android-pro-settings")) {
                    const s = Data.store.settings || {};
                    const panel = document.createElement("div");
                    panel.id = "android-pro-settings";
                    panel.style.marginBottom = "20px";
                    panel.innerHTML = `
                        <div class="section-label">ANDROID NATIVO & BANCOS AUTOMÁTICOS</div>
                        <div class="glass-card" style="padding:15px; margin:0;">
                            <div class="setting-item">
                                <span>🔔 Alertas de Suscripciones (24h antes)</span>
                                <label class="switch-wrap">
                                    <input type="checkbox" ${s.subNotifications !== false ? "checked" : ""} onchange="Data.store.settings.subNotifications = this.checked; Data.save(); if(this.checked) NativeBridge.scheduleAndroidSubscriptionNotifications();">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>🏦 Leer Notificaciones de Bancos</span>
                                <label class="switch-wrap">
                                    <input type="checkbox" ${s.bankAutoDetect ? "checked" : ""} onchange="Data.store.settings.bankAutoDetect = this.checked; Data.save(); if(this.checked) NativeBridge.openNotificationAccessSettings();">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Modo de Registro Bancario</span>
                                <select class="setting-select" style="width:auto; margin:0; padding:6px 10px; font-size:12px;" onchange="Data.store.settings.bankAutoSaveMode = this.value; Data.save();">
                                    <option value="confirm" ${s.bankAutoSaveMode !== "auto" ? "selected" : ""}>Confirmar antes</option>
                                    <option value="auto" ${s.bankAutoSaveMode === "auto" ? "selected" : ""}>Guardar 100% solo</option>
                                </select>
                            </div>
                            <div style="display:flex; gap:8px; margin-top:10px;">
                                <button class="btn-data" style="padding:10px; font-size:12px;" onclick="NativeBridge.openNotificationAccessSettings()">⚙️ Permiso Android</button>
                                <button class="btn-data" style="padding:10px; font-size:12px;" onclick="NativeBridge.simulateBankNotification()">⚡ Simular Pago</button>
                            </div>
                        </div>
                    `;
                    groqCard.parentElement.parentNode.insertBefore(panel, groqCard.parentElement);
                }
            };
        }

        if (typeof Shopping !== "undefined" && Shopping.renderShoppingItems) {
            const origShop = Shopping.renderShoppingItems.bind(Shopping);
            Shopping.renderShoppingItems = function () {
                origShop();
                const list = Data.store.lists.find(l => l.id === Data.store.currentId);
                if (!list) return;
                let est = 0;
                (list.items || []).filter(i => i.checked).forEach(i => {
                    const p = parseFloat(i.price) || Shopping.getKnownPriceForSmarty(i.name) || 0;
                    const q = Shopping.parseQtyValue(i.qty) || 1;
                    est += p * q;
                });
                const cartBox = document.getElementById("shop-cart");
                if (cartBox && cartBox.previousElementSibling) {
                    cartBox.previousElementSibling.innerHTML = UI.t("cart_label") + (est > 0 ? ` <span style="float:right; color:var(--primary); font-weight:800;">Est: ${UI.formatMoney(est)}</span>` : "");
                }
            };
        }
    }

    window.addEventListener("load", () => {
        upgradeGroqModels();
        upgradeNativeStorage();
        upgradeUIAndShopping();
        setTimeout(() => {
            NativeBridge.init();
            setupBiometrics();
            if (typeof UI !== "undefined" && UI.renderSettingsView) UI.renderSettingsView();
        }, 450);
    });
})();