/* =========================================
   SMART LIFE PRO - FULL MASTER MODULE (V21.0-OTA)
   1. Ticket por Cámara o Galería reemplaza la lista por los ítems y precios reales del recibo
   2. Funciona en: Sin lista previa ('Ticket'), Al finalizar lista activa y En listas ya completadas
   3. Incluye fix de Restaurar Copia + Microgastos (Hormiga) + Almuerzo + Delivery + Pastel interactivo
   ========================================= */
(function () {
    window.SMARTY_APK_VERSION = "21.0-OTA";
    document.getElementById("fin-bank-summary-banner")?.remove();
    document.getElementById("pace-day-marker")?.remove();
    document.getElementById("smarty-master-styles")?.remove();

    // ---------------------------------------------------------
    // 0. REPARACION DE COPIAS DE SEGURIDAD (CREAR Y RESTAURAR)
    // ---------------------------------------------------------
    window._onAndroidBackupFileRestored = async function (jsonString) {
        try {
            if (!jsonString || typeof jsonString !== "string") {
                UI.showSnackbar("Error: Archivo vacío");
                return;
            }
            const success = Data.importJSON(jsonString.trim());
            if (success) {
                Data.save();
                UI.showSnackbar("✅ Copia restaurada con éxito. Recargando...");
                setTimeout(() => location.reload(), 900);
            } else {
                UI.showSnackbar("❌ Error: El archivo no es una copia válida");
            }
        } catch (err) {
            UI.showSnackbar("❌ Error al leer el archivo de respaldo");
        }
    };

    if (typeof Main !== "undefined") {
        Main.downloadBackup = function () {
            const json = Data.exportJSON();
            if (window.SmartyAndroid?.saveSingleOverwriteBackup) {
                window.SmartyAndroid.saveSingleOverwriteBackup(json);
            }
            if (window.SmartyAndroid?.saveBackupFile) {
                window.SmartyAndroid.saveBackupFile(json, "SmartLifePro_Backup.json");
                return;
            }
            UI.showSnackbar("✅ Copia guardada en Descargas");
        };

        Main.handleImport = function (input) {
            const file = input?.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => window._onAndroidBackupFileRestored(e.target.result);
            reader.readAsText(file);
            input.value = "";
        };
    }

    // ---------------------------------------------------------
    // 1. ESTILOS COMPLETOS
    // ---------------------------------------------------------
    const st = document.createElement("style");
    st.id = "smarty-master-styles";
    st.innerHTML = `
        #listening-overlay:not(.active), .modal-overlay:not(.open), #custom-confirm:not(.open) { display:none !important; pointer-events:none !important; }
        .pin-pad .pin-btn.bio-btn-active { visibility:visible !important; pointer-events:auto !important; color:var(--primary) !important; font-size:11px !important; font-weight:800 !important; }
        body.dark-mode { --bg-body:#05070B !important; --glass-bg:linear-gradient(145deg, rgba(24,32,48,0.92) 0%, rgba(14,19,30,0.95) 100%) !important; --item-bg:#111726 !important; --input-bg:#192236 !important; }
        body.dark-mode .glass-card, body.dark-mode .item-row, body.dark-mode .mascot-compact-row { background:linear-gradient(145deg, rgba(26,35,52,0.92), rgba(15,21,33,0.95)) !important; border-top:1px solid rgba(255,255,255,0.16) !important; box-shadow:0 14px 34px rgba(0,0,0,0.55) !important; }
        #budget-circle { filter:none !important; box-shadow:none !important; }
        #pace-day-marker, #fin-bank-summary-banner, #settings-inject .setting-group, #settings-inject .div-line { display:none !important; }
        .xp-fill-vertical { background:linear-gradient(to top, #F59E0B, #FDE047) !important; box-shadow:0 0 10px rgba(251,191,36,0.6) !important; }
        .bottom-dock .dock-btn.active { background:rgba(0,110,230,0.14) !important; border-radius:18px !important; padding:8px !important; transform:translateY(-2px) !important; }
        .tone-orange { color:#EA580C; background:rgba(234,88,12,0.14); }
        .tone-crimson { color:#E11D48; background:rgba(225,29,72,0.14); }
        .tone-ant { color:#D97706; background:rgba(217,119,6,0.15); }
        .brand-logo-real { width:38px; height:38px; border-radius:11px; display:inline-flex; align-items:center; justify-content:center; margin-right:12px; flex-shrink:0; overflow:hidden; box-shadow:0 3px 8px rgba(0,0,0,0.12); }
        .brand-logo-real svg, .brand-logo-real img { width:100%; height:100%; object-fit:cover; display:block; }
        #smarty-chat-box > div { max-width:84% !important; box-sizing:border-box !important; overflow-wrap:anywhere !important; word-break:break-word !important; white-space:normal !important; overflow-x:hidden !important; }
        #smarty-chat-mic-btn.listening { background:var(--danger) !important; color:#fff !important; transform:scale(1.08); }
        .quick-cat-switcher { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:12px; padding-top:12px; border-top:1px dashed rgba(120,120,120,0.2); }
        .quick-cat-pill { display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border-radius:12px; font-size:11.5px; font-weight:700; background:var(--input-bg); color:var(--text-color); cursor:pointer; }
        .quick-cat-pill.active-cat { background:var(--primary); color:#fff; }
        .quick-cat-pill.active-cat .category-icon-shell { background:rgba(255,255,255,0.22); color:#fff; }
        .chart-legend-interactive { padding:7px 10px; border-radius:12px; cursor:pointer; transition:0.15s; }
        .chart-legend-interactive:active { transform:scale(0.98); background:var(--input-bg); }
        .chart-legend-interactive.active-filter-row { background:rgba(0,110,230,0.12); border:1px solid rgba(0,110,230,0.3); }
    `;
    document.head.appendChild(st);

    // ---------------------------------------------------------
    // 2. ESCANER DE TICKET UNIFICADO (CAMARA Y GALERIA -> SUSTITUYE LA LISTA POR EL TICKET REAL)
    // ---------------------------------------------------------
    if (typeof Shopping !== "undefined") {
        // Función central que extrae todos los productos y precios de la foto del recibo
        Shopping.extractFullReceiptWithAI = async function (file) {
            const base64Data = await Finance.compressImage(file, 1200, 0.78);
            const rawBase64 = base64Data.split(",")[1];
            const prompt = `Analyze this supermarket/store receipt image.
Extract the store name (if visible), the final total amount paid, and EVERY purchased item with its quantity and unit price.
Convert abbreviated receipt names into clean, readable product names in the receipt's language.
If an item shows a total line price for multiple units, set unitPrice to the unit price (or if qty is 1, set unitPrice to the line price).
Return ONLY valid JSON with this structure:
{
  "storeName": "Supermercado",
  "receiptTotal": 125.40,
  "items": [
    { "name": "Leche Entera", "qty": "2", "unitPrice": 4.50 }
  ]
}`;
            const res = await GroqAI.visionJSON(prompt, rawBase64);
            const rawItems = Array.isArray(res?.items) ? res.items : [];
            if (!rawItems.length) throw new Error("EMPTY_RECEIPT");

            const cleanItems = rawItems.map(i => {
                const nm = String(i.name || "Producto").trim();
                const pr = Number(i.unitPrice) > 0 ? Number(i.unitPrice) : 0;
                const qRaw = String(i.qty || "1").trim();
                const qFormatted = (!isNaN(qRaw) && Number(qRaw) > 1) ? "x" + qRaw : (qRaw === "1" ? "" : qRaw);
                if (pr > 0) Data.store.prices[this.normalize(nm)] = pr;
                return {
                    name: nm.charAt(0).toUpperCase() + nm.slice(1),
                    qty: qFormatted,
                    checked: true,
                    price: pr
                };
            });

            return {
                storeName: String(res?.storeName || "").trim(),
                receiptTotal: Number(res?.receiptTotal) > 0 ? Number(res.receiptTotal) : 0,
                items: cleanItems
            };
        };

        // A. Cuando estás finalizando una lista activa y tocas Cámara o Galería:
        // Sustituye la lista por todos los productos y precios reales del ticket
        Shopping.handleReceiptPhoto = async function (input) {
            const file = input?.files?.[0];
            if (!file) return;
            if (typeof GroqAI === "undefined" || !GroqAI.getApiKey()) return;

            const statusEl = document.getElementById("receipt-scan-status");
            if (statusEl) statusEl.innerText = "⏳ Extrayendo productos y precios del ticket...";
            UI.showSnackbar("⏳ Leyendo ticket completo con Smarty Vision...");

            const camInput = document.getElementById("receipt-photo-cam");
            const galInput = document.getElementById("receipt-photo-gal");
            if (camInput) camInput.value = "";
            if (galInput) galInput.value = "";

            try {
                const parsed = await this.extractFullReceiptWithAI(file);
                const list = Data.store.lists.find(l => l.id === Data.store.currentId);
                if (!list) throw new Error("Lista no encontrada");

                // Sustituir los ítems de la lista por los ítems reales extraídos de la foto del ticket
                list.items = parsed.items;
                if (parsed.storeName) list.name = parsed.storeName.slice(0, 40);
                Data.save();

                // Re-renderizar la lista de atrás y el modal de resumen con todos los precios puestos
                this.renderShoppingItems();
                this.renderFinishItems(list.items);

                if (parsed.receiptTotal > 0) {
                    const manualInput = document.getElementById("finish-manual-total");
                    if (manualInput) manualInput.value = parsed.receiptTotal.toFixed(2);
                    this.updateFinishTotal();
                }

                if (statusEl) statusEl.innerText = `✅ Lista reemplazada con ${parsed.items.length} productos del ticket`;
                UI.showSnackbar(`✨ ${parsed.items.length} productos y precios extraídos del ticket`);
            } catch (err) {
                console.error("Error escaneando ticket:", err);
                if (statusEl) statusEl.innerText = "";
                UI.showSnackbar(err?.message === "EMPTY_RECEIPT" ? "No se detectaron productos en la foto" : (GroqAI.friendlyError(err) || "Error al leer el ticket"));
            }
        };

        // B. Cuando no hiciste lista previa y tocas '📸 Ticket' en Mis Listas (Permite elegir Cámara o Galería)
        Shopping.openTicketSourceModal = function () {
            document.getElementById("ticket-source-modal")?.remove();
            const ov = document.createElement("div");
            ov.id = "ticket-source-modal";
            ov.className = "modal-overlay open";
            ov.style.zIndex = "25000";
            ov.innerHTML = `
                <div class="settings-card" onclick="event.stopPropagation()" style="max-width:340px; text-align:center;">
                    <h3 style="margin:0 0 8px; color:var(--primary);">📸 Crear Lista desde Ticket</h3>
                    <p style="font-size:12px; color:var(--text-sec); margin:0 0 16px;">Toma una foto al recibo del supermercado o elígela de tu galería para armar la lista con todos los precios:</p>
                    <div style="display:flex; gap:10px; margin-bottom:12px;">
                        <label class="btn-data" style="margin:0; padding:14px; flex:1; cursor:pointer; border:1.5px dashed var(--primary);">
                            <input type="file" accept="image/*" capture="environment" style="display:none;" onchange="document.getElementById('ticket-source-modal')?.remove(); Shopping.createCompletedListFromReceipt(this);">
                            <span style="font-size:22px;">📷</span>
                            <span>Cámara</span>
                        </label>
                        <label class="btn-data" style="margin:0; padding:14px; flex:1; cursor:pointer; border:1.5px dashed var(--primary);">
                            <input type="file" accept="image/*" style="display:none;" onchange="document.getElementById('ticket-source-modal')?.remove(); Shopping.createCompletedListFromReceipt(this);">
                            <span style="font-size:22px;">🖼️</span>
                            <span>Galería</span>
                        </label>
                    </div>
                    <button class="btn-danger-outline" style="margin:0; padding:10px;" onclick="document.getElementById('ticket-source-modal')?.remove()">Cancelar</button>
                </div>
            `;
            ov.onclick = () => ov.remove();
            document.body.appendChild(ov);
        };

        const topBar = document.querySelector("#view-lists .top-bar > div");
        if (topBar) {
            document.getElementById("lists-scan-ticket-btn")?.remove();
            const btn = document.createElement("button");
            btn.id = "lists-scan-ticket-btn";
            btn.className = "icon-btn";
            btn.style.cssText = "width:auto; padding:0 8px; font-size:11px; font-weight:800; gap:3px; cursor:pointer;";
            btn.innerHTML = "<span>📸</span><span>Ticket</span>";
            btn.onclick = () => Shopping.openTicketSourceModal();
            topBar.insertBefore(btn, topBar.firstChild);
        }

        Shopping.createCompletedListFromReceipt = async function (input) {
            const file = input?.files?.[0];
            if (!file) return;
            if (typeof GroqAI === "undefined" || !GroqAI.getApiKey()) return;
            input.value = "";
            UI.showSnackbar("⏳ Extrayendo productos y precios del ticket...");
            try {
                const parsed = await this.extractFullReceiptWithAI(file);
                this.createList(true);
                const list = Data.store.lists.find(l => l.id === Data.store.currentId) || Data.store.lists[0];
                if (parsed.storeName) list.name = parsed.storeName.slice(0, 40);
                list.items = parsed.items;
                Data.save();
                this.openShoppingView();
                setTimeout(() => {
                    this.finishList();
                    if (parsed.receiptTotal > 0) {
                        const manual = document.getElementById("finish-manual-total");
                        if (manual) { manual.value = parsed.receiptTotal.toFixed(2); this.updateFinishTotal(); }
                    }
                    UI.showSnackbar(`✨ Lista creada con ${parsed.items.length} productos lista para guardar`);
                }, 250);
            } catch (err) {
                UI.showSnackbar(err?.message === "EMPTY_RECEIPT" ? "No se detectaron productos en la foto" : (GroqAI.friendlyError(err) || "Error leyendo el recibo"));
            }
        };

        // C. Cuando abres una lista YA COMPLETADA en el Historial:
        // Permite tirarle foto al ticket (Cámara o Galería) para sustituir esa lista completada por la del ticket
        if (!Shopping._origOpenHistDetail) Shopping._origOpenHistDetail = Shopping.openHistoryDetail.bind(Shopping);
        Shopping.openHistoryDetail = function (listId) {
            Shopping._origOpenHistDetail(listId);
            const detailBox = document.getElementById("detail-items-list");
            if (detailBox && !document.getElementById("hist-replace-receipt-bar")) {
                const bar = document.createElement("div");
                bar.id = "hist-replace-receipt-bar";
                bar.style.cssText = "display:flex; gap:8px; margin-bottom:12px;";
                bar.innerHTML = `
                    <label class="btn-data" style="margin:0; padding:10px; flex:1; cursor:pointer; border-style:dashed; border-color:var(--primary); font-size:12px;">
                        <input type="file" accept="image/*" capture="environment" style="display:none;" onchange="Shopping.replaceCompletedListWithPhoto(this)">
                        <span>📷 Escanear Ticket (Cámara)</span>
                    </label>
                    <label class="btn-data" style="margin:0; padding:10px; flex:1; cursor:pointer; border-style:dashed; border-color:var(--primary); font-size:12px;">
                        <input type="file" accept="image/*" style="display:none;" onchange="Shopping.replaceCompletedListWithPhoto(this)">
                        <span>🖼️ Desde Galería</span>
                    </label>
                `;
                detailBox.parentNode.insertBefore(bar, detailBox);
            }
        };

        Shopping.replaceCompletedListWithPhoto = async function (input) {
            const file = input?.files?.[0];
            if (!file || !this.currentDetailListId) return;
            if (typeof GroqAI === "undefined" || !GroqAI.getApiKey()) return;
            input.value = "";
            UI.showSnackbar("⏳ Reemplazando lista con los datos del ticket...");
            try {
                const parsed = await this.extractFullReceiptWithAI(file);
                const list = Data.store.lists.find(l => l.id === this.currentDetailListId);
                if (!list) return;

                list.items = parsed.items;
                const calcTotal = parsed.items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * this.parseQtyValue(i.qty), 0);
                list.total = parsed.receiptTotal > 0 ? parsed.receiptTotal : calcTotal;
                Data.save();

                this.openHistoryDetail(this.currentDetailListId);
                const saveBtn = document.getElementById("hist-save-btn");
                if (saveBtn) saveBtn.disabled = false;
                UI.renderBudgetChart();
                if (typeof Finance !== "undefined") Finance.renderHomeWidgets();
                UI.showSnackbar(`✅ Lista sustituida por ${parsed.items.length} productos del ticket`);
            } catch (err) {
                UI.showSnackbar("No se pudo leer el ticket");
            }
        };
    }

    // ---------------------------------------------------------
    // 3. CATEGORIAS: MICROGASTOS (HORMIGA), ALMUERZO, DELIVERY Y SALIDAS + GASTOS FIJOS
    // ---------------------------------------------------------
    if (typeof UI !== "undefined") {
        ["es", "pt", "en"].forEach(l => {
            if (!UI.dictionary?.[l]) return;
            UI.dictionary[l].cat_leisure = l === "en" ? "Micro-expenses" : "Microgastos";
            UI.dictionary[l].cat_lunch = l === "pt" ? "Almoço" : (l === "en" ? "Lunch" : "Almuerzo");
            UI.dictionary[l].cat_dining = l === "pt" ? "Delivery e Saídas" : (l === "en" ? "Delivery & Dining" : "Delivery y Salidas");
            UI.dictionary[l].tab_subs = l === "pt" ? "Gastos Fixos" : (l === "en" ? "Fixed Exp." : "Gastos Fijos");
            UI.dictionary[l].btn_add_sub = l === "pt" ? "+ Novo Gasto Fixo" : (l === "en" ? "+ New Fixed Expense" : "+ Nuevo Gasto Fijo");
            UI.dictionary[l].mod_sub_title = l === "pt" ? "Novo Gasto Fixo" : (l === "en" ? "New Fixed Expense" : "Nuevo Gasto Fijo");
            UI.dictionary[l].empty_subs = l === "pt" ? "Sem gastos fixos ativos." : (l === "en" ? "No active fixed expenses." : "Sin gastos fijos activos.");
        });

        if (Array.isArray(UI.categories) && !UI.categories.some(c => c.id === "cat_lunch")) {
            const idx = UI.categories.findIndex(c => c.id === "cat_leisure");
            const add = [{ id: "cat_lunch", icon: "lunch" }, { id: "cat_dining", icon: "dining" }];
            if (idx >= 0) UI.categories.splice(idx, 0, ...add); else UI.categories.push(...add);
        }

        if (!UI._origCatIconBase) UI._origCatIconBase = UI.categoryIcon.bind(UI);
        UI.categoryIcon = function (id) {
            if (id === "cat_leisure" || id === "Microgastos" || id === "Micro-expenses") return '<span class="category-icon-shell tone-ant"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2.2"/><circle cx="12" cy="11.5" r="2.5"/><ellipse cx="12" cy="18" rx="3.2" ry="4"/><path d="M10 4.2 8 2.5M14 4.2 16 2.5M9.8 10.5 5 8.5M14.2 10.5 19 8.5M9.5 12.2 4.5 13M14.5 12.2 19.5 13M9.2 16.5 5 19.5M14.8 16.5 19 19.5"/></svg></span>';
            if (id === "cat_lunch") return '<span class="category-icon-shell tone-orange"><svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></span>';
            if (id === "cat_dining") return '<span class="category-icon-shell ton
