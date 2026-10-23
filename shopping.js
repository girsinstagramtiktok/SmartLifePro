/* =========================================
   SMART LIFE PRO - SHOPPING MODULE (V11.0 - LIVE CART BUDGET + LLAMA 4 RECEIPT MATCH)
   Autor: A_True_Alpha
   ========================================= */

const Shopping = {
    historyMode: 'lists',
    currentDetailListId: null,
    selectedSummaryMonth: null, 
    isListening: false,
    originalDetailValues: null,

    emojiMap: {
        'mandarina': '🍊', 'tangerina': '🍊', 'ciruela': '🍑', 'arveja': '🫛', 'guisante': '🫛',
        'coliflor': '🥦', 'yuca': '🥔', 'mandioca': '🥔', 'carne molida': '🥩', 'carne picada': '🥩',
        'leche en polvo': '🥛', 'leche condensada': '🥛', 'papel de cocina': '🧻', 'lavaplatos': '🧽',
        'pasta de dientes': '🪥', 'crema dental': '🪥', 'frutos secos': '🥜', 'nueces': '🥜', 'almendras': '🥜',
        'aceite de oliva': '🫒', 'vinagre': '🍾', 'harina de trigo': '🌾', 'levadura': '🧁',
        'papas fritas': '🍟', 'boniato': '🍠', 'pescado congelado': '🐟', 'comida para perro': '🐶',
        'comida para gato': '🐱', 'pañales': '👶', 'desinfectante': '🧴', 'focos': '💡', 'pilas': '🔋',
        'agua': '💧', 'water': '💧', 'refresco': '🥤', 'soda': '🥤', 'gaseosa': '🥤', 'coca': '🥤', 'refrigerante': '🥤',
        'cerveza': '🍺', 'beer': '🍺', 'cerveja': '🍺', 'vino': '🍷', 'wine': '🍷', 'vinho': '🍷',
        'cafe': '☕', 'coffee': '☕', 'leche': '🥛', 'milk': '🥛', 'leite': '🥛', 'te': '🍵', 'tea': '🍵', 'cha': '🍵',
        'jugo': '🧃', 'zumo': '🧃', 'juice': '🧃', 'suco': '🧃', 'licor': '🥃', 'whisky': '🥃', 'vodka': '🥃', 'ron': '🥃',
        'mate': '🧉', 'yerba': '🧉', 'hielo': '🧊', 'ice': '🧊', 'gelo': '🧊',
        'manzana': '🍎', 'apple': '🍎', 'maca': '🍎', 'banana': '🍌', 'platano': '🍌',
        'uva': '🍇', 'grape': '🍇', 'limon': '🍋', 'lemon': '🍋', 'limao': '🍋',
        'naranja': '🍊', 'orange': '🍊', 'laranja': '🍊', 'pina': '🍍', 'pineapple': '🍍', 'abacaxi': '🍍',
        'fresa': '🍓', 'frutilla': '🍓', 'strawberry': '🍓', 'morango': '🍓',
        'palta': '🥑', 'aguacate': '🥑', 'avocado': '🥑', 'abacate': '🥑', 'tomate': '🍅', 'tomato': '🍅',
        'cereza': '🍒', 'durazno': '🍑', 'mango': '🥭', 'manga': '🥭', 'pera': '🍐', 'pear': '🍐',
        'sandia': '🍉', 'watermelon': '🍉', 'melancia': '🍉', 'melon': '🍈', 'melao': '🍈', 'kiwi': '🥝', 'coco': '🥥',
        'papa': '🥔', 'patata': '🥔', 'potato': '🥔', 'batata': '🥔', 'cebolla': '🧅', 'onion': '🧅', 'cebola': '🧅',
        'ajo': '🧄', 'garlic': '🧄', 'alho': '🧄', 'zanahoria': '🥕', 'carrot': '🥕', 'cenoura': '🥕',
        'lechuga': '🥬', 'lettuce': '🥬', 'alface': '🥬', 'brocoli': '🥦', 'broccoli': '🥦',
        'choclo': '🌽', 'maiz': '🌽', 'corn': '🌽', 'milho': '🌽', 'aji': '🌶️', 'chile': '🌶️', 'pimenta': '🌶️',
        'pimiento': '🫑', 'pimentao': '🫑', 'pepino': '🥒', 'cucumber': '🥒', 'berenjena': '🍆', 'calabaza': '🎃', 'abobora': '🎃',
        'hongo': '🍄', 'champinon': '🍄', 'mani': '🥜', 'amendoim': '🥜', 'espinaca': '🍃', 'repollo': '🥬',
        'carne': '🥩', 'meat': '🥩', 'bistec': '🥩', 'bife': '🥩', 'res': '🥩', 'asado': '🥩', 'churrasco': '🥩',
        'pollo': '🍗', 'chicken': '🍗', 'frango': '🍗', 'pechuga': '🍗', 'peito': '🍗', 'pavo': '🦃', 'cerdo': '🐖', 'porco': '🐖',
        'costilla': '🍖', 'chuleta': '🍖', 'huevo': '🥚', 'egg': '🥚', 'ovo': '🥚',
        'pescado': '🐟', 'fish': '🐟', 'peixe': '🐟', 'atun': '🐟', 'atum': '🐟', 'salmon': '🐟', 'camaron': '🦐', 'camarao': '🦐',
        'jamon': '🥓', 'ham': '🥓', 'presunto': '🥓', 'tocino': '🥓', 'bacon': '🥓', 'queso': '🧀', 'cheese': '🧀', 'queijo': '🧀',
        'salchicha': '🌭', 'salsicha': '🌭', 'chorizo': '🌭', 'linguica': '🌭',
        'pan': '🍞', 'bread': '🍞', 'pao': '🍞', 'tostada': '🍞', 'baguette': '🥖', 'medialuna': '🥐', 'croissant': '🥐',
        'dona': '🍩', 'yogur': '🥛', 'yogurt': '🥛', 'iogurte': '🥛', 'manteca': '🧈', 'mantequilla': '🧈', 'butter': '🧈', 'manteiga': '🧈',
        'cereal': '🥣', 'avena': '🥣', 'aveia': '🥣', 'harina': '🌾', 'farinha': '🌾',
        'arroz': '🍚', 'rice': '🍚', 'frijol': '🫘', 'feijao': '🫘', 'lenteja': '🥘', 'lentilha': '🥘',
        'fideos': '🍝', 'pasta': '🍝', 'macarrao': '🍝', 'espagueti': '🍝', 'aceite': '🌻', 'oil': '🌻', 'oleo': '🌻', 'azeite': '🌻',
        'sal': '🧂', 'salt': '🧂', 'azucar': '🍬', 'sugar': '🍬', 'acucar': '🍬', 'miel': '🍯', 'mel': '🍯',
        'galleta': '🍪', 'cookie': '🍪', 'bolacha': '🍪', 'biscoito': '🍪', 'chocolate': '🍫', 'helado': '🍦', 'sorvete': '🍦',
        'torta': '🍰', 'bolo': '🍰', 'palomitas': '🍿', 'pipoca': '🍿', 'pizza': '🍕', 'hamburguesa': '🍔', 'empanada': '🥟', 'sopa': '🍲',
        'jabon': '🧼', 'soap': '🧼', 'sabao': '🧼', 'sabonete': '🧼', 'detergente': '🫧', 'lavandina': '🧴', 'cloro': '🧴',
        'suavizante': '🧴', 'amaciante': '🧴', 'esponja': '🧽', 'bucha': '🧽', 'escoba': '🧹', 'vassoura': '🧹',
        'basura': '🗑️', 'lixo': '🗑️', 'bolsa': '🛍️', 'sacola': '🛍️', 'shampoo': '🧴', 'papel': '🧻', 'higienico': '🧻',
        'servilleta': '🧻', 'guardanapo': '🧻', 'cepillo': '🪥', 'escova': '🪥', 'toalla': '🧖', 'fralda': '👶', 'afeitadora': '🪒',
        'pila': '🔋', 'foco': '💡', 'lampada': '💡', 'perro': '🐶', 'cachorro': '🐶', 'gato': '🐱', 'racao': '🥣', 'medicina': '💊', 'remedio': '💊'
    },

    normalize(str) {
        if(!str) return '';
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    },

    getEmoji(name) {
        const cleanName = this.normalize(name);
        for (let key in this.emojiMap) {
            const variants = key.endsWith('s') ? [key] : [key, key + 's', key + 'es'];
            if (variants.some(variant => new RegExp(`\\b${variant}\\b`, 'i').test(cleanName))) return this.emojiMap[key];
        }
        return '🛒'; 
    },

    parseItem(text) {
        const startRegex = /^(\d+(\.\d+)?\s?(kg|g|l|ml|un|x)?)\s+(.+)$/i;
        const endRegex = /^(.+)\s+(\d+(\.\d+)?\s?(kg|g|l|ml|un|x)?)$/i;
        let qty = ''; let name = text.trim();
        const matchStart = text.trim().match(startRegex);
        const matchEnd = text.trim().match(endRegex);
        if (matchStart) {
            qty = matchStart[1].replace(/\s/g, ''); if(!isNaN(qty)) qty = "x" + qty; name = matchStart[4];
        } else if (matchEnd) {
            name = matchEnd[1]; qty = matchEnd[2].replace(/\s/g, ''); if(!isNaN(qty)) qty = "x" + qty;
        }
        return { name: name.charAt(0).toUpperCase() + name.slice(1), qty };
    },

    parseQtyValue(qtyString) {
        if (!qtyString) return 1;
        const str = qtyString.toLowerCase().trim();
        if (/^x?\s*\d+(\.\d+)?$/.test(str)) {
            const match = str.match(/(\d+(\.\d+)?)/);
            return match ? parseFloat(match[0]) : 1;
        }
        return 1; 
    },

    openCreationMenu() { Main.openAddMenu(); },
    closeCreationMenu() { Main.closeAddMenu(); },

    createList(silent = false) {
        this.closeCreationMenu(); 
        const activeCount = Data.store.lists.filter(l => l.status === 'active').length;
        const lang = (Data.store.settings && Data.store.settings.lang) || 'es';
        const prefix = (lang === 'en') ? 'List' : 'Lista';
        const listName = `${prefix} ${activeCount + 1}`;

        const list = { 
            id: Date.now().toString(), 
            name: listName, 
            date: Date.now(), 
            status: 'active', 
            items: [], 
            total: 0 
        };
        
        Data.store.lists.unshift(list); 
        Data.store.currentId = list.id;
        Data.save();
        
        if(!silent) { 
            this.openShoppingView(); 
        } else {
            this.renderLists();
        }
    },

    toggleImport() {
        this.closeCreationMenu();
        document.getElementById('import-modal').classList.toggle('open');
        document.getElementById('import-input').focus();
    },

    processImport() {
        const text = document.getElementById('import-input').value;
        if(!text.trim()) return;
        this.createList(true);
        const list = Data.store.lists[0];
        
        const lines = text.split(/\n/);
        lines.forEach(line => {
            const cleanLine = line.replace(/^[-*•.]+\s*/, '').trim();
            if(cleanLine.length > 1) {
                const { name, qty } = this.parseItem(cleanLine);
                list.items.push({ name, qty, checked: false, price: this.getKnownPriceForSmarty(name) });
            }
        });
        Data.save();
        document.getElementById('import-input').value = '';
        this.toggleImport();
        this.openShoppingView();
    },

    getKnownPriceForSmarty(name) {
        const cleanName = this.normalize(name);
        let price = Data.store.prices?.[cleanName];
        if (price === undefined && Data.store.prices) {
            const dirtyKey = Object.keys(Data.store.prices).find(k => this.normalize(k) === cleanName);
            if (dirtyKey) price = Data.store.prices[dirtyKey];
        }
        return parseFloat(price) || 0;
    },

    smartListSchema() {
        return {
            type: 'object',
            properties: {
                title: { type: 'string' },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            qty: { type: 'string' }
                        },
                        required: ['name','qty']
                    }
                }
            },
            required: ['title','items']
        };
    },

    async parseSmartyShoppingSpeech(transcript) {
        const lang = Data?.store?.settings?.lang || 'es';
        const instructions = `You convert natural spoken shopping requests into a clean shopping list (${lang}). Split every distinct product into an item. Preserve explicit quantities/units in qty. If no quantity is given, use qty "1". title must be a short useful list name.`;
        const result = await GroqAI.textJSON(instructions, transcript, 'smart_shopping_list', this.smartListSchema(), { maxTokens: 1000 });
        const items = Array.isArray(result.items) ? result.items : [];
        const cleaned = [];
        const seen = new Set();

        items.slice(0, 50).forEach(item => {
            const name = String(item.name || '').trim();
            if (!name) return;
            const key = this.normalize(name);
            if (!key || seen.has(key)) return;
            seen.add(key);
            cleaned.push({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                qty: String(item.qty || '1').trim() || '1',
                checked: false,
                price: this.getKnownPriceForSmarty(name)
            });
        });

        if (!cleaned.length) throw new Error('EMPTY_SMART_LIST');
        return { title: String(result.title || '').trim(), items: cleaned };
    },

    async startSmartyListVoice() {
        const btn = document.getElementById('lists-smarty-btn');
        const original = btn ? btn.innerHTML : '';
        try {
            if (btn) { btn.disabled = true; btn.innerHTML = '🎙'; }
            if (typeof UI !== 'undefined') UI.showSnackbar('🎙 Dile a Smarty todo lo que necesitas comprar');
            const transcript = await GroqAI.listenOnce();
            if (btn) btn.innerHTML = '⏳';

            const parsed = await this.parseSmartyShoppingSpeech(transcript);
            this.createList(true);
            const list = Data.store.lists.find(l => l.id === Data.store.currentId) || Data.store.lists[0];
            if (!list) throw new Error('LIST_CREATE_FAILED');

            if (parsed.title) list.name = parsed.title.slice(0, 60);
            list.items = parsed.items;
            Data.save();
            this.openShoppingView();
            if (typeof UI !== 'undefined') UI.showSnackbar(`✨ Smarty creó ${parsed.items.length} productos.`);
        } catch (err) {
            const msg = err?.message === 'EMPTY_SMART_LIST'
                ? 'Smarty no identificó productos.'
                : GroqAI.friendlyError(err);
            if (msg && typeof UI !== 'undefined') UI.showSnackbar(msg);
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = original || '✨ Smarty'; }
        }
    },

    async startSmartyAddItemsVoice() {
        const btn = document.getElementById('shop-smarty-btn');
        const original = btn ? btn.innerHTML : '';
        try {
            const list = Data.store.lists.find(l => l.id === Data.store.currentId);
            if (!list) return;
            if (btn) { btn.disabled = true; btn.innerHTML = '🎙'; }
            if (typeof UI !== 'undefined') UI.showSnackbar('🎙 Dile a Smarty varios productos de una sola vez');

            const transcript = await GroqAI.listenOnce();
            if (btn) btn.innerHTML = '⏳';
            const parsed = await this.parseSmartyShoppingSpeech(transcript);

            const existing = new Set((list.items || []).map(i => this.normalize(i.name)));
            let added = 0;
            parsed.items.forEach(item => {
                const key = this.normalize(item.name);
                if (!key || existing.has(key)) return;
                existing.add(key);
                list.items.push(item);
                added++;
            });

            Data.save();
            this.renderShoppingItems();
            this.renderQuickChips();
            if (typeof UI !== 'undefined') UI.showSnackbar(added ? `✨ Smarty agregó ${added} productos.` : 'Esos productos ya estaban en la lista.');
        } catch (err) {
            const msg = GroqAI.friendlyError(err);
            if (msg && typeof UI !== 'undefined') UI.showSnackbar(msg);
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = original || '✨'; }
        }
    },

    renderLists() {
        const container = document.getElementById('lists-container');
        if(!container) return;
        
        const activeLists = Data.store.lists.filter(l => l.status === 'active');
        
        if (activeLists.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-sec);">
                <div style="font-size:40px; margin-bottom:10px;">📝</div>
                ${UI.t('empty_lists_view')}
            </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        activeLists.forEach(l => {
            const card = document.createElement('div');
            card.className = 'item-row'; 
            card.style.justifyContent = 'space-between';
            
            const checkedCount = (l.items || []).filter(i => i.checked).length;
            card.innerHTML = `
                <div class="swipe-bg">${UI.t('swipe_delete')}</div>
                <div class="item-content-wrap" style="width:100%; display:flex; justify-content:space-between; align-items:center;">
                    <div class="list-info-area" style="flex:1; cursor:pointer;">
                        <div style="font-weight:800; font-size:16px; color:var(--text-color);">${l.name}</div>
                        <div style="font-size:12px; color:var(--text-sec);">${checkedCount}/${l.items.length} en carrito</div>
                    </div>
                    <button class="icon-btn delete-btn-list" style="color:var(--danger); width:40px; height:40px; margin-left:10px; z-index:10;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            
            card.querySelector('.list-info-area').onclick = (e) => {
                e.stopPropagation(); 
                Data.store.currentId = l.id;
                Data.save();
                this.openShoppingView();
            };

            card.querySelector('.delete-btn-list').onclick = (e) => {
                e.stopPropagation(); 
                this.deleteList(l.id);
            };

            this.addSwipeLogic(card, () => this.deleteList(l.id));
            fragment.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
    },

    renderMiniLists() {
        const container = document.getElementById('home-mini-lists');
        if(!container) return;
        const active = Data.store.lists.filter(l => l.status === 'active').slice(0, 3);
        if (active.length === 0) {
            container.innerHTML = `<div style="font-size:12px; color:var(--text-sec); text-align:center; padding:10px;">${UI.t('empty_lists_home')}</div>`;
            return;
        }
        const fragment = document.createDocumentFragment();
        active.forEach(l => {
            const div = document.createElement('div');
            div.className = 'mini-list-card'; 
            div.innerHTML = `
                <div class="mini-list-info">
                    <span class="mini-list-title">${l.name}</span>
                    <span class="mini-list-sub">${l.items.length} items</span>
                </div>
                <div style="color:var(--primary);">➔</div>
            `;
            div.onclick = () => {
                Data.store.currentId = l.id;
                Data.save();
                this.openShoppingView();
            };
            fragment.appendChild(div);
        });
        container.innerHTML = '';
        container.appendChild(fragment);
    },

    openShoppingView() {
        Main.router('shopping-detail');
        this.renderShoppingUI();
    },

    renderShoppingUI() {
        const list = Data.store.lists.find(l => l.id === Data.store.currentId);
        const container = document.getElementById('shopping-ui-container');
        if(!container || !list) return;

        container.innerHTML = `
            <div class="top-bar glass-pill">
                <div class="progress-track"><div id="shop-progress-bar" class="progress-fill"></div></div>
                <button class="icon-btn" onclick="Main.router('lists')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h2 style="flex:1; text-align:center; font-size:16px; margin:0 10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${list.name}</h2>
                <button id="shop-smarty-btn" class="icon-btn" onclick="Shopping.startSmartyAddItemsVoice()" title="Dictar varios productos con IA" style="width:36px; height:36px; font-size:16px; margin-right:4px;">✨</button>
                <button class="icon-btn" onclick="Shopping.sortList()">
                     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
            </div>
            
            <div class="shopping-import-row">
                <button class="shopping-import-btn" onclick="Shopping.toggleImport()">
                    <svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3"/></svg>
                    <span>Importar lista</span>
                </button>
            </div>

            <div class="input-area" style="position: relative;">
                <input type="text" id="shop-input" placeholder="${UI.t('shop_placeholder')}" autocomplete="off">
                <button id="mic-btn" class="icon-btn" onclick="Shopping.startVoiceRecognition()" style="width:34px; height:34px; margin-right:4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
                </button>
                <button id="add-btn" onclick="Shopping.addItem()" class="send-btn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </div>

            <div id="shop-chips" class="quick-chips"></div>
            <div class="scroll-content-shop">
                <div id="shop-pending"></div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; margin-bottom:8px;">
                    <span class="section-label">${UI.t('cart_label')}</span>
                    <span id="live-cart-est" style="font-size:12px; font-weight:800; color:var(--primary);"></span>
                </div>
                <div id="shop-cart"></div>
            </div>
            <button id="shop-finish-btn" class="floating-cta hidden" onclick="Shopping.finishList()">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
        `;

        this.renderShoppingItems();
        this.renderQuickChips();
        
        const input = document.getElementById('shop-input');
        const btn = document.getElementById('add-btn');
        const originalPlusIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

        if(input) {
            input.addEventListener('input', () => {
                const em = this.getEmoji(input.value);
                if (em !== '🛒') {
                    btn.innerText = em;
                    btn.style.fontSize = '20px'; 
                } else {
                    btn.innerHTML = originalPlusIcon;
                    btn.style.fontSize = ''; 
                }
            });
            input.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter') this.addItem(); 
            });
        }
    },

    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            UI.showSnackbar("Tu navegador no soporta voz");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        const langCode = (Data.store.settings?.lang === 'pt') ? 'pt-BR' : (Data.store.settings?.lang === 'en' ? 'en-US' : 'es-ES');
        recognition.lang = langCode;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const micBtn = document.getElementById('mic-btn');
        recognition.onstart = () => {
            this.isListening = true;
            if(micBtn) micBtn.classList.add('listening'); 
        };
        recognition.onend = () => {
            this.isListening = false;
            if(micBtn) micBtn.classList.remove('listening');
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('shop-input').value = transcript;
            this.addItem(transcript);
        };
        recognition.start();
    },

    renderShoppingItems() {
        const list = Data.store.lists.find(l => l.id === Data.store.currentId);
        if(!list) return;

        const pendingBox = document.getElementById('shop-pending');
        const cartBox = document.getElementById('shop-cart');
        const btnFinish = document.getElementById('shop-finish-btn');
        const liveCartEst = document.getElementById('live-cart-est');
        
        const pendingFragment = document.createDocumentFragment();
        const cartFragment = document.createDocumentFragment();
        
        let checkedCount = 0;
        let estimatedTotal = 0;

        list.items.forEach((item, i) => {
            const row = document.createElement('div');
            row.className = `item-row ${item.checked ? 'checked' : ''}`;
            const knownPrice = parseFloat(item.price) || this.getKnownPriceForSmarty(item.name);
            const qtyNum = this.parseQtyValue(item.qty);

            if (item.checked && knownPrice > 0) {
                estimatedTotal += knownPrice * qtyNum;
            }

            row.innerHTML = `
                <div class="swipe-bg">${UI.t('swipe_delete')}</div>
                <div class="item-content-wrap">
                    <div class="checkbox">${item.checked ? '✔' : ''}</div>
                    <div style="flex:1; display:flex; align-items:center;">
                        <span style="font-size:22px; margin-right:10px;">${this.getEmoji(item.name)}</span>
                        <div>
                            <span class="item-name">${item.name}</span>
                            ${knownPrice > 0 ? `<div style="font-size:10px; color:var(--text-sec);">~${UI.formatMoney(knownPrice)} c/u</div>` : ''}
                        </div>
                    </div>
                    ${item.qty ? `<span class="qty-badge">${item.qty}</span>` : ''}
                </div>
            `;
            
            row.querySelector('.item-content-wrap').onclick = () => this.toggle(i);
            this.addSwipeLogic(row, () => this.del(i));

            if(item.checked) { 
                cartFragment.appendChild(row); 
                checkedCount++; 
            } else { 
                pendingFragment.appendChild(row); 
            }
        });

        pendingBox.innerHTML = '';
        pendingBox.appendChild(pendingFragment);
        cartBox.innerHTML = '';
        cartBox.appendChild(cartFragment);

        if (liveCartEst) {
            liveCartEst.innerText = estimatedTotal > 0 ? `Est: ${UI.formatMoney(estimatedTotal)}` : '';
        }

        const pct = list.items.length > 0 ? (checkedCount / list.items.length) * 100 : 0;
        const progressBar = document.getElementById('shop-progress-bar');
        if(progressBar) progressBar.style.width = `${pct}%`;
        
        if (checkedCount > 0) btnFinish.classList.remove('hidden'); 
        else btnFinish.classList.add('hidden');
    },

    addSwipeLogic(element, actionCallback) {
        let startX = 0;
        let currentX = null; 
        const content = element.querySelector('.item-content-wrap');

        element.addEventListener('touchstart', (e) => { 
            startX = e.touches[0].clientX;
            currentX = startX; 
        }, {passive: true});

        element.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            if (diff < 0) {
                content.style.transform = `translateX(${diff}px)`;
                element.classList.add('swiping');
            }
        }, {passive: true});

        element.addEventListener('touchend', () => {
            if (currentX === null || Math.abs(currentX - startX) < 10) {
                content.style.transform = `translateX(0)`;
                element.classList.remove('swiping');
                return; 
            }
            const diff = currentX - startX;
            if (diff < -100) {
                content.style.transform = `translateX(-100%)`;
                actionCallback();
            } else {
                content.style.transform = `translateX(0)`;
                element.classList.remove('swiping');
            }
            startX = 0; 
            currentX = null;
        });
    },

    addItem(val) {
        const input = document.getElementById('shop-input');
        const rawVal = val || input.value.trim();
        if(!rawVal) return;
        
        const list = Data.store.lists.find(l => l.id === Data.store.currentId);
        const { name, qty } = this.parseItem(rawVal);
        const price = this.getKnownPriceForSmarty(name);

        list.items.push({ name, qty, checked: false, price });
        Data.save();
        
        input.value = ''; 
        document.getElementById('add-btn').innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        input.focus();
        this.renderShoppingItems();
    },

    toggle(i) {
        const list = Data.store.lists.find(l => l.id === Data.store.currentId);
        if(list && list.items[i]) {
            list.items[i].checked = !list.items[i].checked;
            Data.save();
            this.renderShoppingItems();
        }
    },

    async del(i) {
        const confirm = await UI.confirm("confirm_del_prod", "confirm_desc");
        if (confirm) {
            const list = Data.store.lists.find(l => l.id === Data.store.currentId);
            if(list && list.items[i]) {
                list.items.splice(i, 1);
                Data.save();
                this.renderShoppingItems();
            }
        } else {
            this.renderShoppingItems(); 
        }
    },

    async deleteList(id) {
        const confirm = await UI.confirm("confirm_del_list", "confirm_desc");
        if(confirm) {
            Data.store.lists = Data.store.lists.filter(l => l.id !== id);
            Data.save();
            this.renderLists();
            if(Data.store.currentId === id) Main.router('lists');
            if (typeof Finance !== 'undefined') Finance.renderHomeWidgets();
            if (typeof UI !== 'undefined') UI.renderBudgetChart();
        } else {
            this.renderLists();
        }
    },

    sortList() {
        const list = Data.store.lists.find(l => l.id === Data.store.currentId);
        if(!list) return;
        list.items.sort((a, b) => { 
            if (a.checked === b.checked) return a.name.localeCompare(b.name); 
            return a.checked ? 1 : -1; 
        });
        Data.save();
        this.renderShoppingItems();
    },

    renderQuickChips() {
        const freqs = Object.keys(Data.store.prices).slice(0, 6); 
        const box = document.getElementById('shop-chips');
        if(!box) return;
        const fragment = document.createDocumentFragment();
        freqs.forEach(name => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerText = `${this.getEmoji(name)} ${name}`;
            chip.onclick = () => this.addItem(name);
            fragment.appendChild(chip);
        });
        box.innerHTML = '';
        box.appendChild(fragment);
    },

    finishList() {
        const list = Data.store.lists.find(l => l.id === Data.store.currentId);
        if (!list) return;

        const checkedItems = list.items.filter(i => i.checked);
        if(checkedItems.length === 0) {
            UI.showSnackbar(UI.t('cart_label') + ": 0");
            return;
        }

        this.renderFinishItems(checkedItems);
        document.getElementById('modal-finish-list').classList.add('open');
    },

    closeFinishModal() {
        document.getElementById('modal-finish-list').classList.remove('open');
    },

    renderFinishItems(items) {
        const container = document.getElementById('finish-items-list');
        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        items.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'receipt-row';
            const val = item.price > 0 ? item.price : '';
            const qtyVal = this.parseQtyValue(item.qty);

            row.innerHTML = `
                <div class="receipt-name">
                    ${this.getEmoji(item.name)} ${item.name} 
                    ${item.qty ? `<small style="color:var(--text-sec)">(${item.qty})</small>` : ''}
                </div>
                <input type="number" class="receipt-input" 
                       data-name="${item.name}" 
                       data-qty="${qtyVal}"
                       value="${val}" 
                       placeholder="${UI.t('ph_unit_price')}" 
                       step="0.01"
                       oninput="Shopping.updateFinishTotal()">
            `;
            fragment.appendChild(row);
        });
        
        container.appendChild(fragment);
        const manual = document.getElementById("finish-manual-total");
        if (manual) manual.value = "";
        this.updateFinishTotal();
    },

    updateFinishTotal() {
        const inputs = document.querySelectorAll('#finish-items-list .receipt-input');
        let total = 0;
        inputs.forEach(inp => {
            const price = parseFloat(inp.value) || 0;
            const qty = parseFloat(inp.getAttribute('data-qty')) || 1;
            total += (price * qty); 
        });
        const manual = parseFloat(document.getElementById('finish-manual-total')?.value);
        document.getElementById('finish-total-val').innerText = UI.formatMoney(Number.isFinite(manual) && manual > 0 ? manual : total);
    },

    confirmFinish() {
        const list = Data.store.lists.find(l => l.id === Data.store.currentId);
        if(!list) return;

        const inputs = document.querySelectorAll('#finish-items-list .receipt-input');
        let total = 0;

        inputs.forEach(inp => {
            const name = inp.getAttribute('data-name');
            const qty = parseFloat(inp.getAttribute('data-qty')) || 1;
            const price = parseFloat(inp.value) || 0; 
            
            const item = list.items.find(i => i.name === name && i.checked);
            if(item) item.price = price;
            if(price > 0) Data.store.prices[this.normalize(name)] = price;
            total += (price * qty); 
        });

        const manual = parseFloat(document.getElementById('finish-manual-total')?.value);
        list.total = Number.isFinite(manual) && manual > 0 ? manual : total;
        list.status = 'completed';
        list.date = Date.now(); 

        const d = new Date();
        const lang = Data.store.settings?.lang || 'es';
        const namePrefix = lang === 'en' ? "Shopping list" : (lang === 'pt' ? "Compra do dia" : "Compra del día");
        list.name = `${namePrefix} ${d.getDate()}/${d.getMonth() + 1}`;

        Data.save();

        if (typeof Assistant !== 'undefined') {
            Assistant.addXP(50, "Lista Completada");
            Assistant.updateMood();
            Assistant.reactToEvent('list_completed', { total: list.total }); 
        }

        if (typeof Finance !== 'undefined') Finance.renderHomeWidgets(); 
        if (typeof UI !== 'undefined') UI.renderBudgetChart(); 

        this.closeFinishModal();
        UI.showSnackbar(UI.t('msg_list_saved'));
        Main.router('home');
    },

    setHistoryMode(mode) {
        this.historyMode = mode;
        document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        const btnMap = { 'lists': 'seg-lists', 'summary': 'seg-summary', 'products': 'seg-products' };
        const btn = document.getElementById(btnMap[mode]);
        if(btn) btn.classList.add('active');

        const box = document.getElementById('history-box');
        const chartBox = document.getElementById('history-chart-container');
        if(!box) return;
        box.innerHTML = '';
        chartBox.classList.add('hidden');

        const now = new Date();
        if(!this.selectedSummaryMonth) {
            this.selectedSummaryMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        }

        if (mode === 'lists') this.renderHistoryLists(box);
        if (mode === 'summary') this.renderHistorySummary(box, chartBox);
        if (mode === 'products') this.renderProductHistory(box);
    },

    renderHistoryLists(container) {
        container.innerHTML = '';
        const allCompleted = Data.store.lists.filter(l => l.status === 'completed').sort((a, b) => b.date - a.date);
        const now = new Date();
        const curM = now.getMonth();
        const curY = now.getFullYear();

        const currentMonthLists = allCompleted.filter(l => {
            const d = new Date(l.date);
            return d.getMonth() === curM && d.getFullYear() === curY;
        });

        if (currentMonthLists.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">${UI.t('empty_month_shopping')}</div>`;
        } else {
            currentMonthLists.forEach(l => container.appendChild(this.createListCard(l)));
        }
    },

    createListCard(l) {
        const card = document.createElement('div');
        card.className = 'glass-card'; 
        card.style.cssText = `padding:18px; margin:0 16px 12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;`;
        card.onclick = () => this.openHistoryDetail(l.id);
        card.innerHTML = `
            <div>
                <div style="font-weight:800; color:var(--text-color);">${l.name}</div>
                <div style="font-size:12px; color:var(--text-sec);">${new Date(l.date).toLocaleDateString()}</div>
            </div>
            <div style="font-weight:900; font-size:16px; color:var(--success);">${UI.formatMoney(l.total)}</div>
        `;
        return card;
    },

    renderHistorySummary(container, chartContainer) {
        chartContainer.classList.remove('hidden');
        this.renderMonthSelector(container);
        const [selYear, selMonth] = this.selectedSummaryMonth.split('-').map(Number);
        const monthLists = Data.store.lists.filter(l => {
            const d = new Date(l.date);
            return l.status === 'completed' && d.getFullYear() === selYear && (d.getMonth() + 1) === selMonth;
        });

        const groups = {};
        monthLists.forEach(l => {
            const day = new Date(l.date).getDate();
            groups[day] = (groups[day] || 0) + l.total;
        });

        chartContainer.innerHTML = '';
        const keys = Object.keys(groups).map(Number).sort((a,b)=>a-b);
        if(keys.length === 0) {
             chartContainer.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; opacity:0.5; font-size:12px;">${UI.t('empty_summary_chart')}</div>`;
        } else {
            const maxVal = Math.max(...Object.values(groups)) || 1;
            keys.forEach(day => {
                const val = groups[day];
                const h = (val / maxVal) * 85; 
                chartContainer.innerHTML += `
                    <div class="bar-wrapper">
                        <div class="chart-value">${UI.formatMoney(val).replace('.00','')}</div>
                        <div class="chart-bar ${val === maxVal ? 'highlight' : ''}" style="height:${h}%;"></div>
                        <div class="chart-label">${day}</div>
                    </div>`;
            });
        }
    },

    renderMonthSelector(container) {
        const months = new Set();
        const now = new Date();
        months.add(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
        Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
            const d = new Date(l.date);
            months.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
        });

        const scrollDiv = document.createElement('div');
        scrollDiv.className = 'month-scroll-container';
        Array.from(months).sort().reverse().forEach(m => {
            const [y, monthNum] = m.split('-');
            const chip = document.createElement('div');
            chip.className = `month-chip ${this.selectedSummaryMonth === m ? 'active' : ''}`;
            chip.innerText = `${UI.getMonthName(parseInt(monthNum) - 1)} ${y}`;
            chip.onclick = () => {
                this.selectedSummaryMonth = m;
                const box = document.getElementById('history-box');
                box.innerHTML = '';
                this.renderHistorySummary(box, document.getElementById('history-chart-container'));
            };
            scrollDiv.appendChild(chip);
        });
        container.appendChild(scrollDiv);
    },

    openHistoryDetail(listId) {
        this.currentDetailListId = listId;
        const list = Data.store.lists.find(l => l.id === listId);
        if (!list) return;

        const container = document.getElementById('detail-items-list');
        document.getElementById('detail-list-title').innerText = list.name;
        container.innerHTML = '';

        const items = list.items.filter(i => i.checked);
        this.originalDetailValues = JSON.parse(JSON.stringify(items));

        items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'receipt-row';
            const qtyVal = this.parseQtyValue(item.qty);
            row.innerHTML = `
                <div class="receipt-name">${this.getEmoji(item.name)} ${item.name} ${item.qty ? `<small>(${item.qty})</small>` : ''}</div>
                <input type="number" class="receipt-input detail-input" data-name="${item.name}" data-index="${index}" data-qty="${qtyVal}" value="${item.price}" step="0.01" oninput="Shopping.updateDetailTotal()">
            `;
            container.appendChild(row);
        });
        
        this.updateDetailTotal();
        document.getElementById('modal-list-detail').classList.add('open');
    },

    closeDetailModal() {
        document.getElementById('modal-list-detail').classList.remove('open');
        this.currentDetailListId = null;
    },

    updateDetailTotal() {
        const inputs = document.querySelectorAll('.detail-input');
        let total = 0;
        inputs.forEach(inp => {
            total += (parseFloat(inp.value) || 0) * (parseFloat(inp.getAttribute('data-qty')) || 1); 
        });
        document.getElementById('detail-total-val').innerText = UI.formatMoney(total);
    },

    updateHistoryList() {
        const list = Data.store.lists.find(l => l.id === this.currentDetailListId);
        if(!list) return;
        const inputs = document.querySelectorAll('.detail-input');
        let total = 0;
        inputs.forEach(inp => {
            const name = inp.getAttribute('data-name');
            const qty = parseFloat(inp.getAttribute('data-qty')) || 1;
            const price = parseFloat(inp.value) || 0;
            const item = list.items.find(i => i.name === name && i.checked);
            if(item) item.price = price;
            total += (price * qty); 
        });
        list.total = total;
        Data.save();
        this.closeDetailModal();
        this.renderHistoryLists(document.getElementById('history-box'));
        UI.renderBudgetChart();
        UI.showSnackbar(UI.t('msg_updated'));
    },

    async deleteHistoryList() {
        if(!this.currentDetailListId) return;
        if(await UI.confirm("confirm_del_list", "confirm_desc")) {
            Data.store.lists = Data.store.lists.filter(l => l.id !== this.currentDetailListId);
            Data.save();
            this.closeDetailModal();
            this.renderHistoryLists(document.getElementById('history-box'));
            UI.renderBudgetChart();
            Finance.renderHomeWidgets();
        }
    },

    renderProductHistory(container) {
        container.innerHTML = `
            <div class="input-area" style="margin-bottom:15px;">
                <input type="text" id="prod-search" placeholder="Buscar producto..." oninput="Shopping.filterProducts(this.value)">
            </div>
            <div id="prod-list-container"></div>
        `;
        this.filterProducts('');
    },

    filterProducts(query) {
        const container = document.getElementById('prod-list-container');
        if(!container) return;
        const q = this.normalize(query);
        const products = Object.keys(Data.store.prices).sort((a, b) => a.localeCompare(b));
        const shownItems = new Set(); 
        container.innerHTML = '';

        products.forEach(p => {
            const normalizedP = this.normalize(p);
            if(normalizedP.includes(q) && !shownItems.has(normalizedP)) {
                shownItems.add(normalizedP);
                const row = document.createElement('div');
                row.className = 'glass-card';
                row.style.cssText = 'padding:15px; margin:0 16px 10px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;';
                const displayName = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:20px;">${this.getEmoji(p)}</span>
                        <span style="font-weight:700; color:var(--text-color);">${displayName}</span>
                    </div>
                    <div style="font-weight:800; color:var(--primary);">${UI.formatMoney(Data.store.prices[p])} 📈</div>
                `;
                row.onclick = () => this.openProductStats(p);
                container.appendChild(row);
            }
        });
    },

    openProductStats(prodName) {
        const modal = document.getElementById('product-modal');
        document.getElementById('ph-title').innerText = prodName.charAt(0).toUpperCase() + prodName.slice(1);
        
        const historyPoints = [];
        Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
            const item = l.items.find(i => this.normalize(i.name) === this.normalize(prodName) && i.price > 0);
            if(item) historyPoints.push({ date: l.date, price: parseFloat(item.price) });
        });

        historyPoints.sort((a, b) => a.date - b.date);
        const listContainer = document.getElementById('ph-list');
        listContainer.innerHTML = '';

        if(historyPoints.length === 0) {
            const currPrice = Data.store.prices[prodName] || 0;
            listContainer.innerHTML = `<div style="text-align:center; padding:30px;">
                <div style="font-size:28px; font-weight:900; color:var(--primary);">${UI.formatMoney(currPrice)}</div>
                <div style="color:var(--text-sec);">${UI.t('current_price_reg')}</div>
            </div>`;
        } else {
            historyPoints.reverse().forEach(pt => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; justify-content:space-between; padding:12px 10px; border-bottom:1px solid rgba(100,116,139,0.1);';
                row.innerHTML = `<span style="color:var(--text-sec);">${new Date(pt.date).toLocaleDateString()}</span><span style="font-weight:800;">${UI.formatMoney(pt.price)}</span>`;
                listContainer.appendChild(row);
            });
        }
        modal.classList.add('open');
    },

    closeProductHistory() { document.getElementById('product-modal').classList.remove('open'); },

    async handleReceiptPhoto(input) {
        const file = input.files[0];
        if (!file) return;
        if (typeof GroqAI === 'undefined' || !GroqAI.getApiKey()) return;

        const statusEl = document.getElementById('receipt-scan-status');
        if (statusEl) statusEl.innerText = "⏳ Escaneando ticket con Llama 4 Vision...";
        input.value = '';

        try {
            const base64Data = await Finance.compressImage(file, 1200, 0.75);
            const rawBase64 = base64Data.split(',')[1];
            const list = Data.store.lists.find(l => l.id === Data.store.currentId);
            if (!list) return;

            const targetItems = list.items.filter(i => i.checked).map(i => i.name);
            const promptText = `Analyze this supermarket receipt image and match unit prices to these shopping list items (even if abbreviated on receipt): ${JSON.stringify(targetItems)}. Also extract the final receipt total.
Return ONLY JSON:
{
  "receiptTotal": 120.50,
  "matches": [
    { "listName": "Exact item name from the provided array", "price": 10.50 }
  ]
}`;

            const result = await GroqAI.visionJSON(promptText, rawBase64);
            const matches = Array.isArray(result?.matches) ? result.matches : [];
            const receiptInputs = Array.from(document.querySelectorAll('#finish-items-list .receipt-input[data-name]'));

            let matchedCount = 0;
            matches.forEach(m => {
                const inputEl = receiptInputs.find(el => el.dataset.name === m.listName);
                if (inputEl && Number(m.price) > 0) {
                    inputEl.value = Number(m.price).toFixed(2);
                    matchedCount++;
                }
            });

            if (Number(result?.receiptTotal) > 0 && matchedCount < targetItems.length) {
                const manualInput = document.getElementById('finish-manual-total');
                if (manualInput) manualInput.value = Number(result.receiptTotal).toFixed(2);
            }

            this.updateFinishTotal();
            if (statusEl) statusEl.innerText = `✅ ${matchedCount}/${targetItems.length} precios detectados`;
            UI.showSnackbar("✨ Ticket procesado con éxito");
        } catch (err) {
            if (statusEl) statusEl.innerText = "";
            const msg = GroqAI.friendlyError(err);
            if (msg) UI.showSnackbar(msg);
        }
    }
};