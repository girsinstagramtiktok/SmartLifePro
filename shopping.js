/* =========================================
   SMART LIFE PRO - SHOPPING MODULE (V8.0 - GROQ SMARTY VOICE + VISION)
   Autor: A_True_Alpha
   ========================================= */

const Shopping = {
    // --- ESTADO INTERNO ---
    historyMode: 'lists',
    currentDetailListId: null,
    selectedSummaryMonth: null, 
    isListening: false,
    originalDetailValues: null, // Para comparar cambios en historial

    // --- DICCIONARIO DE EMOJIS (BASE DE DATOS) ---
     emojiMap: {
        'mandarina': '\uD83C\uDF4A', 'tangerina': '\uD83C\uDF4A',
        'pera asiatica': '\uD83C\uDF50', 'ciruela': '\uD83C\uDF51', 'ciruelas': '\uD83C\uDF51',
        'arveja': '\uD83E\uDED8', 'guisante': '\uD83E\uDED8', 'chicharo': '\uD83E\uDED8',
        'coliflor': '\u{1F966}', 'coliflor fresca': '\u{1F966}',
        'yuca': '\uD83E\uDD54', 'mandioca': '\uD83E\uDD54', 'ñame': '\uD83E\uDD54',
        'carne molida': '\uD83E\uDD69', 'carne picada': '\uD83E\uDD69', 'ground beef': '\uD83E\uDD69',
        'leche en polvo': '\uD83E\uDD5B', 'leche condensada': '\uD83E\uDD5B',
        'papel de cocina': '\uD83E\uDDFB', 'papel toalla': '\uD83E\uDDFB',
        'lavaplatos': '\uD83E\uDDFD', 'lava vajillas': '\uD83E\uDDFD', 'esponjas': '\uD83E\uDDFD',
        'pasta de dientes': '\uD83E\uDDB7', 'crema dental': '\uD83E\uDDB7',
        'frutos secos': '\uD83E\uDD5C', 'nueces': '\uD83E\uDD5C', 'almendras': '\uD83E\uDD5C',
        'aceite de oliva': '\uD83E\uDED2', 'vinagre': '\uD83E\uDED9',
        'harina de trigo': '\uD83C\uDF3E', 'levadura': '\uD83E\uDDC1',
        'papas fritas': '\uD83C\uDF5F', 'boniato': '\uD83C\uDF60',
        'pescado congelado': '\uD83D\uDC1F', 'filete de pescado': '\uD83D\uDC1F',
        'comida para perro': '\uD83D\uDC36', 'comida para gato': '\uD83D\uDC31',
        'pañales': '\uD83D\uDC76', 'toallitas humedas': '\uD83E\uDDFB',
        'desinfectante': '\uD83E\uDDF4', 'limpiavidrios': '\uD83E\uDDF4',
        'focos': '\uD83D\uDCA1', 'pilas': '\uD83D\uDD0B',

        // --- BEBIDAS / DRINKS ---
        'agua': '💧', 'water': '💧', 'agua mineral': '💧',
        'refresco': '🥤', 'soda': '🥤', 'gaseosa': '🥤', 'coca': '🥤', 'refrigerante': '🥤', 'soft drink': '🥤',
        'cerveza': '🍺', 'beer': '🍺', 'cerveja': '🍺', 'birra': '🍺',
        'vino': '🍷', 'wine': '🍷', 'vinho': '🍷',
        'cafe': '☕', 'coffee': '☕',
        'leche': '🥛', 'milk': '🥛', 'leite': '🥛',
        'te': '🍵', 'tea': '🍵', 'cha': '🍵',
        'jugo': '🧃', 'zumo': '🧃', 'juice': '🧃', 'suco': '🧃',
        'licor': '🥃', 'liquor': '🥃', 'whisky': '🥃', 'vodka': '🥃', 'ron': '🥃', 'rum': '🥃',
        'alcohol': '🍾', 'champagne': '🍾', 'espumante': '🍾',
        'mate': '🧉', 'chimarrao': '🧉', 'yerba': '🧉',
        'hielo': '🧊', 'ice': '🧊', 'gelo': '🧊',

        // --- FRUTAS / FRUITS ---
        'manzana': '🍎', 'apple': '🍎', 'maca': '🍎',
        'banana': '🍌', 'platano': '🍌', 'guineo': '🍌', 'cambur': '🍌',
        'uva': '🍇', 'grape': '🍇',
        'limon': '🍋', 'lemon': '🍋', 'limao': '🍋', 'lima': '🍋',
        'naranja': '🍊', 'orange': '🍊', 'laranja': '🍊',
        'pina': '🍍', 'anana': '🍍', 'pineapple': '🍍', 'abacaxi': '🍍',
        'fresa': '🍓', 'frutilla': '🍓', 'strawberry': '🍓', 'morango': '🍓',
        'palta': '🥑', 'aguacate': '🥑', 'avocado': '🥑', 'abacate': '🥑',
        'tomate': '🍅', 'tomato': '🍅',
        'cereza': '🍒', 'cherry': '🍒', 'cereja': '🍒',
        'durazno': '🍑', 'peach': '🍑', 'pessego': '🍑', 'melocoton': '🍑',
        'mango': '🥭', 'manga': '🥭',
        'pera': '🍐', 'pear': '🍐',
        'sandia': '🍉', 'watermelon': '🍉', 'melancia': '🍉',
        'melon': '🍈', 'cantaloupe': '🍈', 'melao': '🍈',
        'kiwi': '🥝',
        'coco': '🥥', 'coconut': '🥥',
        'arandano': '🫐', 'blueberry': '🫐', 'mirtilo': '🫐',
        'frambuesa': '🍇', 'raspberry': '🍇', 'framboesa': '🍇',
        'aceituna': '🫒', 'olive': '🫒', 'azeitona': '🫒',

        // --- VERDURAS / VEGETABLES ---
        'papa': '🥔', 'patata': '🥔', 'potato': '🥔', 'batata': '🥔',
        'cebolla': '🧅', 'onion': '🧅', 'cebola': '🧅',
        'ajo': '🧄', 'garlic': '🧄', 'alho': '🧄',
        'zanahoria': '🥕', 'carrot': '🥕', 'cenoura': '🥕',
        'lechuga': '🥬', 'lettuce': '🥬', 'alface': '🥬',
        'brocoli': '🥦', 'broccoli': '🥦', 'brocolis': '🥦',
        'choclo': '🌽', 'maiz': '🌽', 'elote': '🌽', 'corn': '🌽', 'milho': '🌽',
        'aji': '🌶️', 'chile': '🌶️', 'picante': '🌶️', 'pepper': '🌶️', 'pimenta': '🌶️',
        'pimiento': '🫑', 'bell pepper': '🫑', 'pimentao': '🫑', 'morron': '🫑',
        'pepino': '🥒', 'cucumber': '🥒',
        'berenjena': '🍆', 'eggplant': '🍆', 'berinjela': '🍆',
        'calabaza': '🎃', 'zapallo': '🎃', 'pumpkin': '🎃', 'abobora': '🎃',
        'hongo': '🍄', 'champinon': '🍄', 'setas': '🍄', 'mushroom': '🍄', 'cogumelo': '🍄',
        'mani': '🥜', 'cacahuate': '🥜', 'peanut': '🥜', 'amendoim': '🥜',
        'espinaca': '🍃', 'spinach': '🍃', 'espinafre': '🍃',
        'repollo': '🥬', 'cabbage': '🥬', 'repolho': '🥬',
        'batata dulce': '🍠', 'sweet potato': '🍠', 'batata doce': '🍠', 'camote': '🍠',

        // --- CARNES / MEATS ---
        'carne': '🥩', 'meat': '🥩',
        'bistec': '🥩', 'steak': '🥩', 'bife': '🥩',
        'res': '🥩', 'beef': '🥩', 'boi': '🥩',
        'asado': '🥩', 'bbq': '🥩', 'churrasco': '🥩', 'parrillada': '🥩',
        'pollo': '🍗', 'chicken': '🍗', 'frango': '🍗',
        'pechuga': '🍗', 'breast': '🍗', 'peito': '🍗',
        'muslo': '🍗', 'thigh': '🍗', 'coxa': '🍗',
        'pavo': '🦃', 'turkey': '🦃', 'peru': '🦃',
        'cerdo': '🐖', 'puerco': '🐖', 'pork': '🐖', 'pig': '🐖', 'porco': '🐖', 'cochino': '🐖',
        'costilla': '🍖', 'ribs': '🍖', 'costela': '🍖',
        'chuleta': '🍖', 'chop': '🍖', 'bisteca': '🍖',
        'huevo': '🥚', 'egg': '🥚', 'ovo': '🥚',
        'pescado': '🐟', 'fish': '🐟', 'peixe': '🐟',
        'atun': '🐟', 'tuna': '🐟', 'atum': '🐟',
        'salmon': '🐟', 'salmon': '🐟', 'salmao': '🐟',
        'marisco': '🦐', 'seafood': '🦐', 'frutos do mar': '🦐',
        'camaron': '🦐', 'shrimp': '🦐', 'camarao': '🦐', 'gamba': '🦐',
        'langosta': '🦞', 'lobster': '🦞', 'lagosta': '🦞',
        'cangrejo': '🦀', 'crab': '🦀', 'caranguejo': '🦀',

        // --- FIAMBRES / DELI ---
        'jamon': '🥓', 'ham': '🥓', 'presunto': '🥓',
        'tocino': '🥓', 'bacon': '🥓', 'panceta': '🥓', 'beicon': '🥓',
        'queso': '🧀', 'cheese': '🧀', 'queijo': '🧀', 'muzzarella': '🧀',
        'salchicha': '🌭', 'sausage': '🌭', 'salsicha': '🌭',
        'chorizo': '🌭', 'linguica': '🌭', 'longaniza': '🌭',
        'salami': '🌭', 'salame': '🌭',

        // --- PANADERIA / BAKERY ---
        'pan': '🍞', 'bread': '🍞', 'pao': '🍞',
        'tostada': '🍞', 'toast': '🍞', 'torrada': '🍞',
        'bolillo': '🥖', 'baguette': '🥖', 'baguete': '🥖', 'barra': '🥖',
        'medialuna': '🥐', 'croissant': '🥐',
        'dona': '🍩', 'donut': '🍩', 'rosquinha': '🍩',
        'bagel': '🥯',
        'yogur': '🥛', 'yogurt': '🥛', 'iogurte': '🥛',
        'manteca': '🧈', 'mantequilla': '🧈', 'butter': '🧈', 'manteiga': '🧈',
        'margarina': '🧈', 'margarine': '🧈',
        'cereal': '🥣', 'avena': '🥣', 'oats': '🥣', 'aveia': '🥣',
        'harina': '🌾', 'flour': '🌾', 'farinha': '🌾',

        // --- DESPENSA / PANTRY ---
        'arroz': '🍚', 'rice': '🍚',
        'frijol': '🫘', 'bean': '🫘', 'feijao': '🫘', 'poroto': '🫘', 'caraota': '🫘',
        'lenteja': '🥘', 'lentil': '🥘', 'lentilha': '🥘',
        'fideos': '🍝', 'pasta': '🍝', 'noodle': '🍝', 'macarrao': '🍝', 
        'espagueti': '🍝', 'spaghetti': '🍝', 'tallarin': '🍝', 'macarrones': '🍝',
        'aceite': '🌻', 'oil': '🌻', 'oleo': '🌻', 'azeite': '🌻',
        'sal': '🧂', 'salt': '🧂',
        'pimienta': '🧂', 'pepper': '🧂', 'pimenta': '🧂',
        'condimento': '🧂', 'seasoning': '🧂', 'tempero': '🧂',
        'azucar': '🍬', 'sugar': '🍬', 'acucar': '🍬',
        'miel': '🍯', 'honey': '🍯', 'mel': '🍯',
        'galleta': '🍪', 'cookie': '🍪', 'biscuit': '🍪', 'bolacha': '🍪',
        'chocolate': '🍫',
        'dulce': '🍬', 'candy': '🍬', 'doce': '🍬', 'caramelo': '🍬', 'bala': '🍬',
        'helado': '🍦', 'ice cream': '🍦', 'sorvete': '🍦',
        'torta': '🍰', 'cake': '🍰', 'bolo': '🍰', 'pastel': '🍰',
        'cotufas': '🍿', 'palomitas': '🍿', 'popcorn': '🍿', 'pipoca': '🍿',

        // --- COMIDA PREPARADA / FAST FOOD ---
        'pizza': '🍕',
        'hamburguesa': '🍔', 'burger': '🍔', 'hamburguer': '🍔',
        'sandwich': '🥪', 'sanduiche': '🥪', 'bocadillo': '🥪',
        'sushi': '🍣',
        'taco': '🌮',
        'burrito': '🌯',
        'empanada': '🥟', 'pastel': '🥟',
        'sopa': '🍲', 'soup': '🍲', 'caldo': '🍲',
        'papas fritas': '🍟', 'fries': '🍟', 'batata frita': '🍟',

        // --- LIMPIEZA / CLEANING ---
        'jabon': '🧼', 'soap': '🧼', 'sabao': '🧼', 'sabonete': '🧼',
        'detergente': '🫧', 'detergent': '🫧',
        'lavandina': '🧴', 'bleach': '🧴', 'cloro': '🧴', 'agua sanitaria': '🧴',
        'suavizante': '🧴', 'softener': '🧴', 'amaciante': '🧴',
        'esponja': '🧽', 'sponge': '🧽', 'bucha': '🧽', 'trapo': '🧽', 'pano': '🧽',
        'escoba': '🧹', 'broom': '🧹', 'vassoura': '🧹',
        'limpiador': '🪣', 'cleaner': '🪣', 'balde': '🪣', 'cubo': '🪣',
        'basura': '🗑️', 'trash': '🗑️', 'lixo': '🗑️️',
        'bolsa': '🛍️', 'bag': '🛍️', 'sacola': '🛍️',

        // --- HIGIENE / PERSONAL CARE ---
        'shampoo': '🧴', 'xampu': '🧴', 'champu': '🧴',
        'acondicionador': '🧴', 'conditioner': '🧴', 'crema': '🧴', 'cream': '🧴', 'creme': '🧴',
        'papel': '🧻', 'paper': '🧻', 'higienico': '🧻', 'toilet paper': '🧻',
        'servilleta': '🧻', 'napkin': '🧻', 'guardanapo': '🧻',
        'pasta dental': '🪥', 'toothpaste': '🪥', 'pasta de dente': '🪥', 'dentifrico': '🪥',
        'cepillo': '🪥', 'brush': '🪥', 'escova': '🪥',
        'hilo dental': '🦷', 'floss': '🦷', 'fio dental': '🦷',
        'toalla': '🧖', 'towel': '🧖', 'toalha': '🧖',
        'panal': '👶', 'diaper': '👶', 'fralda': '👶',
        'toallita': '👶', 'wipes': '👶', 'lenco umedecido': '👶',
        'afeitadora': '🪒', 'razor': '🪒', 'gillette': '🪒', 'barbeador': '🪒',

        // --- HOGAR / HOUSEHOLD ---
        'pila': '🔋', 'battery': '🔋', 'bateria': '🔋',
        'foco': '💡', 'bulb': '💡', 'bombilla': '💡', 'lampada': '💡',
        'mascotas': '🐶', 'pets': '🐶',
        'perro': '🐶', 'dog': '🐶', 'cachorro': '🐶',
        'gato': '🐱', 'cat': '🐱',
        'alimento': '🥣', 'food': '🥣', 'racao': '🥣', 'croquetas': '🥣',
        'medicina': '💊', 'medicine': '💊', 'remedio': '💊',
        'pastilla': '💊', 'pill': '💊', 'comprimido': '💊',
        'jarabe': '🥄', 'syrup': '🥄', 'xarope': '🥄',
        'curita': '🩹', 'bandaid': '🩹', 'curativo': '🩹',
        'cinta': '🩹', 'tape': '🩹', 'fita': '🩹',
        'cigarro': '🚬', 'cigarette': '🚬',
        'fuego': '🔥', 'fire': '🔥', 'fogo': '🔥',
        'fosforo': '🔥', 'match': '🔥', 'isquero': '🔥', 'lighter': '🔥', 'encendedor': '🔥', 'isqueiro': '🔥',
        'herramienta': '🔧', 'tool': '🔧', 'ferramenta': '🔧',
        'clavo': '🔩', 'nail': '🔩', 'prego': '🔩',
        'tornillo': '🔩', 'screw': '🔩', 'parafuso': '🔩'
    },


    // --- UTILS ---
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
    
    // Normalizamos
    const str = qtyString.toLowerCase().trim();

    if (/^x?\s*\d+(\.\d+)?$/.test(str)) {
        const match = str.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 1;
    }

    return 1; 
},

    // --- GESTIÓN DE LISTAS ---
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
                list.items.push({ name, qty, checked: false, price: 0 });
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
                        required: ['name','qty'],
                        additionalProperties: false
                    }
                }
            },
            required: ['title','items'],
            additionalProperties: false
        };
    },

    async parseSmartyShoppingSpeech(transcript) {
        const lang = Data?.store?.settings?.lang || 'es';
        const instructions = `You convert natural spoken shopping requests into a clean shopping list. The user language is ${lang}. Split every distinct product into an item. Preserve explicit quantities/units such as kg, g, L, ml, packs, bottles, dozens or item counts in qty. If no quantity is given, use qty "1". Keep product names short and natural in the user's language. title must be a short useful list name. Never add products the user did not request.`;
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
                name,
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
            if (typeof UI !== 'undefined') UI.showSnackbar(`✨ Smarty creo ${parsed.items.length} productos. Puedes editarlos antes de comprar.`);
        } catch (err) {
            console.error('Smarty list voice:', err);
            const msg = err?.message === 'EMPTY_SMART_LIST'
                ? 'Smarty no identifico productos. Puedes crear la lista manualmente.'
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
            if (typeof UI !== 'undefined') UI.showSnackbar(added ? `✨ Smarty agrego ${added} productos.` : 'Todos esos productos ya estaban en la lista.');
        } catch (err) {
            console.error('Smarty add items voice:', err);
            const msg = err?.message === 'EMPTY_SMART_LIST'
                ? 'Smarty no identifico productos. El microfono normal sigue disponible.'
                : GroqAI.friendlyError(err);
            if (msg && typeof UI !== 'undefined') UI.showSnackbar(msg);
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = original || '✨'; }
        }
    },

    // --- RENDERIZADO (LISTAS ACTIVAS) ---
    renderLists() {
        const container = document.getElementById('lists-container');
        if(!container) return;
        
        const activeLists = Data.store.lists.filter(l => l.status === 'active');
        
        if (activeLists.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-sec);">
                <div style="font-size:40px; margin-bottom:10px;">\uD83D\uDCDD</div>
                ${UI.t('empty_lists_view')}
            </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();

activeLists.forEach(l => {
    const card = document.createElement('div');
    card.className = 'item-row'; 
    card.style.justifyContent = 'space-between';
    
    card.innerHTML = `
        <div class="swipe-bg">${UI.t('swipe_delete')}</div>
        <div class="item-content-wrap" style="width:100%; display:flex; justify-content:space-between; align-items:center;">
            
            <div class="list-info-area" style="flex:1; cursor:pointer;">
                <div style="font-weight:700; font-size:16px; color:var(--text-color);">${l.name}</div>
                <div style="font-size:12px; opacity:0.7; color:var(--text-sec);">${l.items.length} items</div>
            </div>

            <button class="icon-btn delete-btn-list" style="color:var(--danger); width:40px; height:40px; margin-left:10px; z-index:10;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;
    
    const infoArea = card.querySelector('.list-info-area');
    infoArea.onclick = (e) => {
        e.stopPropagation(); 
        Data.store.currentId = l.id;
        Data.save();
        this.openShoppingView();
    };

    const delBtn = card.querySelector('.delete-btn-list');
    delBtn.onclick = (e) => {
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
                <div style="color:var(--primary);">\u279C</div>
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

    // --- VISTA DETALLE DE COMPRA ---
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
                <button class="icon-btn" onclick="Main.router('home')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h2 style="flex:1; text-align:center; font-size:16px; margin:0 10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${list.name}</h2>
                <button id="shop-smarty-btn" class="icon-btn" onclick="Shopping.startSmartyAddItemsVoice()" aria-label="Agregar varios productos con Smarty" title="Agregar varios con Smarty" style="width:34px; height:34px; font-size:16px; margin-right:2px;">✨</button>
                <button class="icon-btn" onclick="Shopping.sortList()">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
            </div>
            
            <div class="shopping-import-row"><button class="shopping-import-btn" onclick="Shopping.toggleImport()"><svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3"/></svg><span>Importar lista</span></button></div>
           <div class="input-area" style="position: relative;">
                <input type="text" id="shop-input" placeholder="${UI.t('shop_placeholder')}" autocomplete="off" list="suggestions">
                
                <button id="mic-btn" class="icon-btn" onclick="Shopping.startVoiceRecognition()" style="width:30px; height:30px; margin-right:5px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                </button>

                <button id="add-btn" onclick="Shopping.addItem()" class="send-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            <div id="shop-chips" class="quick-chips"></div>
            <div class="scroll-content-shop">
                <div id="shop-pending"></div>
                <div class="section-label" style="margin-top:20px; display:block;">${UI.t('cart_label')}</div>
                <div id="shop-cart"></div>
            </div>
                    <button id="shop-finish-btn" class="floating-cta hidden" onclick="Shopping.finishList()">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </button>

        `;

        this.renderShoppingItems();
        this.renderQuickChips();
        
        const input = document.getElementById('shop-input');
        const btn = document.getElementById('add-btn');
        
        const originalPlusIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>`;

        if(input) {
            input.focus();
            input.addEventListener('input', () => {
                const em = this.getEmoji(input.value);
                if (em !== '🛒') {
                    btn.innerText = em;
                    btn.style.fontSize = '22px'; 
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

    // --- RECONOCIMIENTO DE VOZ ---
    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            UI.showSnackbar("Web Speech API not supported");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        const langCode = (Data.store.settings && Data.store.settings.lang === 'pt') ? 'pt-BR' : ((Data.store.settings && Data.store.settings.lang === 'en') ? 'en-US' : 'es-ES');
        recognition.lang = langCode;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const micBtn = document.getElementById('mic-btn');
        
        recognition.onstart = () => {
            this.isListening = true;
            if(micBtn) micBtn.classList.add('listening'); 
            if(navigator.vibrate) navigator.vibrate(50);
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

        recognition.onerror = (event) => {
            this.isListening = false;
            if(micBtn) micBtn.classList.remove('listening');
        };

        recognition.start();
    },

    renderShoppingItems() {
        const list = Data.store.lists.find(l => l.id === Data.store.currentId);
        if(!list) return;

        const pendingBox = document.getElementById('shop-pending');
        const cartBox = document.getElementById('shop-cart');
        const btnFinish = document.getElementById('shop-finish-btn');
        
        const pendingFragment = document.createDocumentFragment();
        const cartFragment = document.createDocumentFragment();
        
        let checkedCount = 0;

        list.items.forEach((item, i) => {
            const row = document.createElement('div');
            row.className = `item-row ${item.checked ? 'checked' : ''}`;
            row.innerHTML = `
                <div class="swipe-bg">${UI.t('swipe_delete')}</div>
                <div class="item-content-wrap">
                    <div class="checkbox">${item.checked ? '\u2714' : ''}</div>
                    <div style="flex:1; display:flex; align-items:center;">
                        <span style="font-size:24px; margin-right:10px;">${this.getEmoji(item.name)}</span>
                        <span class="item-name">${item.name}</span>
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
        const cleanName = this.normalize(name);
        
        let price = Data.store.prices[cleanName]; 

        if (price === undefined) {
            const dirtyKey = Object.keys(Data.store.prices).find(k => this.normalize(k) === cleanName);
            if (dirtyKey) price = Data.store.prices[dirtyKey];
        }
        
        price = parseFloat(price) || 0;

        list.items.push({ name, qty, checked: false, price });
        Data.save();
        
        input.value = ''; 
        document.getElementById('add-btn').innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>`;
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
            
            if (typeof Assistant !== 'undefined') {
                Assistant.updateMood();
                Assistant.updateHomeXP();
            }
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
        
if (typeof Finance !== 'undefined') Finance.renderHomeWidgets();
if (typeof UI !== 'undefined') UI.renderBudgetChart();
        this.renderShoppingItems();
    },

    renderQuickChips() {
        const freqs = Object.keys(Data.store.prices).slice(0, 5); 
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

    // --- TICKET DE PRECIOS & FINALIZACIÓN ---

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
        document.getElementById('finish-total-val').innerText = UI.formatMoney(Number.isFinite(manual) && manual >= 0 ? manual : total);
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
        list.total = Number.isFinite(manual) && manual >= 0 ? manual : total;
        list.status = 'completed';
        list.date = Date.now(); 

        const d = new Date();
        const lang = (Data.store.settings && Data.store.settings.lang) ? Data.store.settings.lang : 'es';
        let namePrefix = "Compra"; 

        if (lang === 'es') namePrefix = "Compra del d\u00EDa"; 
        if (lang === 'en') namePrefix = "Shopping list";
        if (lang === 'pt') namePrefix = "Compra do dia";

        const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
        list.name = `${namePrefix} ${dateStr}`;

        Data.save();
        if (typeof Assistant !== 'undefined') {
            Assistant.addXP(50, "Lista Completada");
            Assistant.updateMood();
            Assistant.reactToEvent('list_completed', { total: list.total }); 
        }

if (typeof Finance !== 'undefined') Finance.renderHomeWidgets(); 
if (typeof UI !== 'undefined') UI.renderBudgetChart(); 
        if (typeof Assistant !== 'undefined') {
            Assistant.addXP(50, "Lista Completada");
            Assistant.updateMood();
        }

        this.closeFinishModal();
        UI.showSnackbar(UI.t('msg_list_saved'));
        
        Main.router('home');
        if(typeof UI.renderBudgetChart === 'function') UI.renderBudgetChart();
    },

    // --- HISTORIAL & RESUMEN ---

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
        if (mode === 'summary') {
            this.renderHistorySummary(box, chartBox);
        }
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

        const archiveLists = allCompleted.filter(l => {
            const d = new Date(l.date);
            return d.getMonth() !== curM || d.getFullYear() !== curY;
        });

        if (currentMonthLists.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">${UI.t('empty_month_shopping')}</div>`;
        } else {
            const fragment = document.createDocumentFragment();
            currentMonthLists.forEach(l => fragment.appendChild(this.createListCard(l)));
            container.appendChild(fragment);
        }

        if(archiveLists.length > 0) {
            const archiveBtn = document.createElement('div');
            archiveBtn.className = 'archive-card'; 
            archiveBtn.innerText = `${UI.t('archive_btn')} (${archiveLists.length})`;
            archiveBtn.onclick = () => {
                const archiveDiv = document.getElementById('archive-container');
                archiveDiv.classList.toggle('hidden');
            };
            container.appendChild(archiveBtn);

            const archiveDiv = document.createElement('div');
            archiveDiv.id = 'archive-container';
            archiveDiv.className = 'hidden';
            archiveDiv.style.marginTop = '15px';
            
            const archiveFrag = document.createDocumentFragment();
            archiveLists.forEach(l => archiveFrag.appendChild(this.createListCard(l, true)));
            archiveDiv.appendChild(archiveFrag);
            
            container.appendChild(archiveDiv);
        }
    },

    createListCard(l, isArchive = false) {
        const card = document.createElement('div');
        card.className = 'glass-card'; 
        card.style.cssText = `padding:18px; margin-bottom:12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; ${isArchive ? 'opacity:0.8; border-style:dashed;' : ''}`;
        card.onclick = () => this.openHistoryDetail(l.id);

        card.innerHTML = `
            <div>
                <div style="font-weight:700; color:var(--text-color);">${l.name}</div>
                <div style="font-size:12px; color:var(--text-sec);">${new Date(l.date).toLocaleDateString()}</div>
            </div>
            <div style="font-weight:800; font-size:16px; color:var(--success);">
                ${UI.formatMoney(l.total)}
            </div>
        `;
        return card;
    },

    renderHistorySummary(container, chartContainer) {
        chartContainer.classList.remove('hidden');
        this.renderMonthSelector(container);

        const [selYear, selMonth] = this.selectedSummaryMonth.split('-').map(Number);
        
        const hist = Data.store.lists.filter(l => l.status === 'completed');
        const monthLists = hist.filter(l => {
            const d = new Date(l.date);
            return d.getFullYear() === selYear && (d.getMonth() + 1) === selMonth;
        });

        const groups = {};
        monthLists.forEach(l => {
            const d = new Date(l.date);
            const day = d.getDate();
            if(!groups[day]) groups[day] = 0;
            groups[day] += l.total;
        });

        chartContainer.innerHTML = '';
        const keys = Object.keys(groups).map(Number).sort((a,b)=>a-b);
        
        if(keys.length === 0) {
             chartContainer.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; opacity:0.5; font-size:12px; color:var(--text-sec);">${UI.t('empty_summary_chart')}</div>`;
        } else {
            const maxVal = Math.max(...Object.values(groups)) || 1;

            keys.forEach(day => {
                const val = groups[day];
                const h = (val / maxVal) * 85; 
                const isMax = val === maxVal; 

                chartContainer.innerHTML += `
                    <div class="bar-wrapper">
                        <div class="chart-value">${UI.formatMoney(val).replace('.00','')}</div>
                        <div class="chart-bar ${isMax ? 'highlight' : ''}" style="height:${h}%;"></div>
                        <div class="chart-label">${day}</div>
                    </div>`;
            });
        }

        const productStats = {};
        monthLists.forEach(l => {
            l.items.forEach(i => {
                if(i.checked) {
                    if(!productStats[i.name]) productStats[i.name] = { qty: 0, cost: 0 };
                    const qVal = this.parseQtyValue(i.qty); 
                    productStats[i.name].qty += qVal; 
                    productStats[i.name].cost += (i.price * qVal); 
                }
            });
        });

        const listDiv = document.createElement('div');
        listDiv.innerHTML = `<div class="section-label" style="margin-top:0;">${UI.t('section_top_prod')} (${UI.getMonthName(selMonth - 1)})</div>`;
        
        const sortedProducts = Object.keys(productStats).sort((a,b) => productStats[b].cost - productStats[a].cost).slice(0, 5); 

        if(sortedProducts.length === 0) {
            listDiv.innerHTML += `<div style="text-align:center; opacity:0.5; padding:20px;">${UI.t('empty_top_prod')}</div>`;
        } else {
            sortedProducts.forEach(pName => {
                const stat = productStats[pName];
                const row = document.createElement('div');
                row.className = 'glass-card';
                row.style.cssText = 'padding:12px; display:flex; justify-content:space-between; margin-bottom:8px;';
                row.innerHTML = `
                    <div>${this.getEmoji(pName)} ${pName} <small style="opacity:0.6">x${stat.qty}</small></div>
                    <div style="font-weight:700;">${UI.formatMoney(stat.cost)}</div>
                `;
                listDiv.appendChild(row);
            });
        }
        container.appendChild(listDiv);
    },

    renderMonthSelector(container) {
        const months = new Set();
        const now = new Date();
        const currentKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        months.add(currentKey);

        Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
            const d = new Date(l.date);
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            months.add(key);
        });

        const sortedMonths = Array.from(months).sort().reverse();
        const scrollDiv = document.createElement('div');
        scrollDiv.className = 'month-scroll-container';

        sortedMonths.forEach(m => {
            const [y, monthNum] = m.split('-');
            const chip = document.createElement('div');
            chip.className = `month-chip ${this.selectedSummaryMonth === m ? 'active' : ''}`;
            chip.innerText = `${UI.getMonthName(parseInt(monthNum) - 1)} ${y}`;
            chip.onclick = () => {
                this.selectedSummaryMonth = m;
                const box = document.getElementById('history-box');
                const chartBox = document.getElementById('history-chart-container');
                box.innerHTML = '';
                this.renderHistorySummary(box, chartBox);
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
        const fragment = document.createDocumentFragment();
        
        this.originalDetailValues = JSON.parse(JSON.stringify(items));
        
        const saveBtn = document.getElementById('hist-save-btn');
        if(saveBtn) saveBtn.disabled = true;

        items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'receipt-row';
            const qtyVal = this.parseQtyValue(item.qty);
            
            row.innerHTML = `
                <div class="receipt-name">
                    ${this.getEmoji(item.name)} ${item.name}
                    ${item.qty ? `<small style="color:var(--text-sec)">(${item.qty})</small>` : ''}
                </div>
                <input type="number" class="receipt-input detail-input" 
                       id="hist-input-${index}"
                       data-name="${item.name}" 
                       data-index="${index}"
                       data-qty="${qtyVal}"
                       value="${item.price}" 
                       step="0.01"
                       oninput="Shopping.checkDetailChanges()">
            `;
            fragment.appendChild(row);
        });
        
        container.appendChild(fragment);
        this.updateDetailTotal();
        document.getElementById('modal-list-detail').classList.add('open');
    },

    checkDetailChanges() {
        if(!this.originalDetailValues) return;
        
        let hasChanges = false;
        const inputs = document.querySelectorAll('.detail-input');
        
        inputs.forEach(inp => {
            const idx = inp.getAttribute('data-index');
            const currentVal = parseFloat(inp.value) || 0;
            const originalVal = parseFloat(this.originalDetailValues[idx].price) || 0;
            
            if(currentVal !== originalVal) hasChanges = true;
        });
        
        this.updateDetailTotal();
        
        const saveBtn = document.getElementById('hist-save-btn');
        if(saveBtn) saveBtn.disabled = !hasChanges;
    },

    closeDetailModal() {
        document.getElementById('modal-list-detail').classList.remove('open');
        this.currentDetailListId = null;
        this.originalDetailValues = null;
    },

    updateDetailTotal() {
        const inputs = document.querySelectorAll('.detail-input');
        let total = 0;
        inputs.forEach(inp => {
            const price = parseFloat(inp.value) || 0;
            const qty = parseFloat(inp.getAttribute('data-qty')) || 1;
            total += (price * qty); 
        });
        document.getElementById('detail-total-val').innerText = UI.formatMoney(total);
    },

    updateHistoryList() {
        if(!this.currentDetailListId) return;
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
        
        if(typeof UI.renderBudgetChart === 'function') UI.renderBudgetChart();
        UI.showSnackbar(UI.t('msg_updated'));
    },

    async deleteHistoryList() {
        if(!this.currentDetailListId) return;
        if(await UI.confirm("confirm_del_list", "confirm_desc")) {
            Data.store.lists = Data.store.lists.filter(l => l.id !== this.currentDetailListId);
            Data.save();
            
if (typeof Finance !== 'undefined') Finance.renderHomeWidgets();
if (typeof UI !== 'undefined') UI.renderBudgetChart();
            this.closeDetailModal();
            this.renderHistoryLists(document.getElementById('history-box'));
            if(typeof UI.renderBudgetChart === 'function') UI.renderBudgetChart();
        if (typeof Assistant !== 'undefined') {
                Assistant.updateMood();
                Assistant.updateHomeXP();
            }
}
    },

    renderProductHistory(container) {
        container.innerHTML = `
            <div class="input-area" style="margin-bottom:15px;">
                <input type="text" id="prod-search" placeholder="..." oninput="Shopping.filterProducts(this.value)">
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
        const fragment = document.createDocumentFragment();
        
        const shownItems = new Set(); 

        products.forEach(p => {
            const normalizedP = this.normalize(p);
            
            if(normalizedP.includes(q) && !shownItems.has(normalizedP)) {
                
                shownItems.add(normalizedP);

                const row = document.createElement('div');
                row.className = 'glass-card';
                row.style.cssText = 'padding:15px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; margin-bottom:10px;';
                
                const displayName = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();

                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:20px;">${this.getEmoji(p)}</span>
                        <span style="font-weight:600; text-transform:capitalize; color:var(--text-color);">${displayName}</span>
                    </div>
                    <div style="color:var(--primary);">\uD83D\uDCC8</div>
                `;
                row.onclick = () => this.openProductStats(p);
                fragment.appendChild(row);
            }
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
    },


    openProductStats(prodName) {
        const modal = document.getElementById('product-modal');
        document.getElementById('ph-title').innerText = prodName.charAt(0).toUpperCase() + prodName.slice(1);
        
        const historyPoints = [];
        Data.store.lists.filter(l => l.status === 'completed').forEach(l => {
            const item = l.items.find(i => this.normalize(i.name) === this.normalize(prodName) && i.price > 0);
            if(item) {
                historyPoints.push({ date: l.date, price: parseFloat(item.price) });
            }
        });

        historyPoints.sort((a, b) => a.date - b.date);
        const listContainer = document.getElementById('ph-list');
        listContainer.innerHTML = '';

        if(historyPoints.length === 0) {
            const currPrice = Data.store.prices[prodName] || 0;
            listContainer.innerHTML = `<div style="text-align:center; padding:30px;">
                <div class="hero-price">${UI.formatMoney(currPrice)}</div>
                <div style="color:var(--text-sec);">${UI.t('current_price_reg')}</div>
            </div>`;
        } else {
            const w = 300, h = 150, p = 20;
            const maxP = Math.max(...historyPoints.map(x => x.price)) * 1.1;
            const minP = Math.min(...historyPoints.map(x => x.price)) * 0.9;
            const timeSpan = historyPoints[historyPoints.length-1].date - historyPoints[0].date || 1;
            
            let pointsSVG = "";
            let dotsSVG = "";
            
            historyPoints.forEach((pt, i) => {
                const x = p + ((pt.date - historyPoints[0].date) / timeSpan) * (w - 2*p);
                const y = h - p - ((pt.price - minP) / (maxP - minP)) * (h - 2*p);
                pointsSVG += `${x},${y} `;
                dotsSVG += `<circle cx="${x}" cy="${y}" r="4" fill="white" stroke="var(--primary)" stroke-width="2"/>`;
            });

            const svgGraph = `
                <div class="glass-card" style="padding:15px; margin-bottom:20px;">
                    <div style="font-size:12px; margin-bottom:10px; opacity:0.7;">${UI.t('price_evol')}</div>
                    <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}">
                        <polyline points="${pointsSVG}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        ${dotsSVG}
                    </svg>
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-sec); margin-top:5px;">
                        <span>${new Date(historyPoints[0].date).toLocaleDateString()}</span>
                        <span>${new Date(historyPoints[historyPoints.length-1].date).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
            listContainer.innerHTML = svgGraph;

            const fragment = document.createDocumentFragment();
            historyPoints.reverse().forEach(pt => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid rgba(0,0,0,0.05);';
                row.innerHTML = `
                    <span style="font-size:14px; color:var(--text-sec);">${new Date(pt.date).toLocaleDateString()}</span>
                    <span style="font-weight:700; color:var(--text-color);">${UI.formatMoney(pt.price)}</span>
                `;
                fragment.appendChild(row);
            });
            listContainer.appendChild(fragment);
        }
        modal.classList.add('open');
    },

    closeProductHistory() { document.getElementById('product-modal').classList.remove('open'); },

    // --- ESCANEO DE RECIBO CON IA (GROQ VISION) ---
    async handleReceiptPhoto(input) {
        const file = input.files[0];
        if (!file) return;

        if (typeof GroqAI === 'undefined') {
            console.error('GroqAI no esta disponible.');
            if (typeof UI !== 'undefined') UI.showSnackbar('Modulo de IA no disponible');
            return;
        }

        // Pedir/validar que exista una clave antes de procesar la imagen.
        if (!GroqAI.getApiKey()) return;

        if (typeof UI !== 'undefined') UI.showSnackbar("Procesando recibo con IA...");

        // Limpiar inputs para permitir re-uso inmediato.
        const camInput = document.getElementById('receipt-photo-cam');
        const galInput = document.getElementById('receipt-photo-gal');
        if (camInput) camInput.value = '';
        if (galInput) galInput.value = '';

        try {
            // 1. Comprimir imagen. Finance.compressImage siempre devuelve JPEG.
            const base64Data = await Finance.compressImage(file, 1200, 0.72);
            const rawBase64 = base64Data.split(',')[1];

            // 2. Extraer productos marcados para asociarlos con el recibo.
            const list = Data.store.lists.find(l => l.id === Data.store.currentId);
            if (!list) throw new Error('Lista no encontrada.');

            const targetItems = list.items.filter(i => i.checked).map(i => i.name);
            if (targetItems.length === 0) {
                if (typeof UI !== 'undefined') UI.showSnackbar("Marca primero los productos comprados.");
                return;
            }

            // Prompt en ingles para JSON mode. listName debe copiar exactamente uno de targetItems.
            const promptText = `Analyze this shopping receipt image and match prices to the provided shopping-list items.
Shopping-list items: ${JSON.stringify(targetItems)}

Return ONLY one JSON object using this exact structure:
{
  "matches": [
    { "listName": "EXACT item name copied from the shopping-list items", "price": 10.50 }
  ],
  "unmatched": [
    { "receiptText": "Receipt item that could not be matched", "price": 5.20 }
  ]
}
Rules:
- Never invent shopping-list item names.
- For every match, listName must be copied exactly from the provided shopping-list items.
- price must be the price attributable to that list item as shown on the receipt and must be a positive number.
- Do not include uncertain matches in matches; place them in unmatched instead.
- If nothing can be read, return empty arrays.`;

            const result = await GroqAI.visionJSON(promptText, rawBase64);

            const matches = Array.isArray(result?.matches) ? result.matches : [];
            const unmatched = Array.isArray(result?.unmatched) ? result.unmatched : [];
            const validNames = new Set(targetItems);
            const receiptInputs = Array.from(document.querySelectorAll('#finish-items-list .receipt-input[data-name]'));

            // 3. Asignar precios. Solo aceptamos nombres exactos de la lista para evitar asociaciones incorrectas.
            let matchedCount = 0;
            matches.forEach(match => {
                const listName = typeof match?.listName === 'string' ? match.listName : '';
                const price = Number(match?.price);
                if (!validNames.has(listName) || !Number.isFinite(price) || price <= 0) return;

                const inputEl = receiptInputs.find(el => el.dataset.name === listName);
                if (inputEl) {
                    inputEl.value = price.toFixed(2);
                    matchedCount++;
                }
            });

            if (matchedCount > 0) this.updateFinishTotal();

            // 4. Informar resultado.
            if (typeof UI !== 'undefined') {
                if (matchedCount === 0) {
                    UI.showSnackbar("No se detectaron precios confiables de la lista.");
                } else if (unmatched.length > 0 || matchedCount < targetItems.length) {
                    UI.showSnackbar(`Precios extraidos: ${matchedCount}/${targetItems.length}. Revisa los faltantes.`);
                } else {
                    UI.showSnackbar("Todos los precios extraidos con exito.");
                }
            }

        } catch (err) {
            console.error("Error al procesar el recibo con Groq:", err);
            const msg = GroqAI.friendlyError(err);
            if (typeof UI !== 'undefined' && msg) UI.showSnackbar(msg);
        }
    }

};

/* ============================================================
 * SmartLifePro — tickets verificables, historial consistente y foto local.
 * Se instala DESPUÉS de los complementos que GitHub Actions inyecta al APK.
 * No toca presupuestos, cobros recurrentes ni movimientos ya existentes.
 * ============================================================ */
(function(root) {
  'use strict';
  if (!root || !root.document) return;
  const DB_NAME = 'smartlifepro_receipt_images_v1';
  const STORE_NAME = 'photos';
  const pending = new Map();
  let recentScan = null;
  const $ = id => root.document.getElementById(id);
  const lang = () => (typeof Data !== 'undefined' && Data.store?.settings?.lang) || 'es';
  const tr = (es, pt, en) => ({ es, pt, en })[lang()] || es;
  const notify = message => { if (typeof UI !== 'undefined') UI.showSnackbar?.(message); };
  const money = n => typeof UI !== 'undefined' && UI.formatMoney ? UI.formatMoney(n) : `R$ ${Number(n).toFixed(2)}`;
  const cents = n => Math.round((Number(n) + Number.EPSILON) * 100);
  const rounded = n => cents(n) / 100;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch]);

  function numeric(value, fallback = NaN) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
    if (value === undefined || value === null || value === '') return fallback;
    let s = String(value).trim().replace(/(?:R\$|\s|kg|unid\.?|unidades?)/gi, '').replace(/[^0-9,.\-]/g, '');
    if (!s) return fallback;
    if (s.includes(',') && s.includes('.')) {
      s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else if (s.includes(',')) s = s.replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  }
  function qtyValue(qty) {
    // Cadena histórica "600g" NO se multiplica: los registros antiguos ya
    // guardaban el importe de esa pieza. Solo interpretar cantidades explícitas.
    if (qty === '' || qty === null || qty === undefined) return 1;
    const s = String(qty).trim().toLowerCase().replace(',', '.');
    const match = /^x?\s*(\d+(?:\.\d+)?)$/.exec(s);
    const n = match ? Number(match[1]) : 1;
    return Number.isFinite(n) && n > 0 && n <= 10000 ? n : 1;
  }
  function quantityFromAI(raw, unitType) {
    let q = numeric(raw, 1);
    const s = String(raw ?? '').toLowerCase();
    const unit = String(unitType || '').toLowerCase();
    if (/\b(?:ml|litro|litros|l)\b/.test(unit) || /\d\s*(?:ml|litros?|l)\b/.test(s)) q = 1;
    else if (/\b(?:g|grama|gramas)\b/.test(unit) || /\d\s*g\b/.test(s)) {
      if (q > 2 && q <= 10000) q /= 1000;
    }
    return Number.isFinite(q) && q > 0 && q <= 10000 ? q : 1;
  }
  function lineSubtotal(item) { return rounded((numeric(item?.price, 0) || 0) * qtyValue(item?.qty)); }
  function itemsSubtotal(items) { return rounded((items || []).filter(x => x.checked).reduce((sum, item) => sum + lineSubtotal(item), 0)); }
  function listById(id) { return typeof Data === 'undefined' ? null : Data.store?.lists?.find(l => String(l.id) === String(id)); }

  function openDb() {
    return new Promise((resolve, reject) => {
      if (!root.indexedDB) return reject(Error('IndexedDB no disponible'));
      const req = root.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME, { keyPath: 'id' }); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || Error('Almacenamiento de imágenes no disponible'));
    });
  }
  async function photoAction(action, id, value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, action === 'get' || action === 'all' ? 'readonly' : 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = action === 'get' ? store.get(String(id)) : action === 'all' ? store.getAll() : action === 'delete' ? store.delete(String(id)) : store.put({ id: String(id), data: value, at: Date.now() });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('No se pudo acceder a la foto'));
      tx.oncomplete = () => db.close();
      tx.onabort = () => { db.close(); reject(tx.error || Error('No se pudo guardar la foto')); };
    });
  }
  const getPhoto = id => photoAction('get', id);
  const allPhotos = () => photoAction('all');
  const removePhoto = id => photoAction('delete', id);

  async function photoFromFile(file) {
    if (!file) throw Error('No hay fotografía');
    if (typeof Finance === 'undefined' || !Finance.compressImage) throw Error('Compresor de imágenes no disponible');
    // JPEG legible; si el ticket es largo se reduce progresivamente.
    let result = '';
    for (const [width, quality] of [[1500,.72],[1350,.65],[1200,.60],[1050,.55],[950,.52]]) {
      result = await Finance.compressImage(file, width, quality);
      if (result.length <= 380000) break;
    }
    if (!/^data:image\/jpeg;base64,/i.test(result)) throw Error('La imagen no pudo comprimirse como JPEG');
    return result;
  }
  async function attachPhoto(listId, data) {
    if (!data || !listById(listId)) return false;
    await photoAction('put', listId, data);
    const list = listById(listId);
    if (list) {
      list.smReceiptPhoto = { attached: true, format:'jpeg', at: Date.now() };
      Data.save(); // Solo metadata, no base64 en localStorage.
    }
    return true;
  }
  async function attachFromGallery(listId, file) {
    try {
      const data = await photoFromFile(file);
      await attachPhoto(listId, data);
      notify(tr('Foto comprimida y guardada con la compra.', 'Foto comprimida e salva com a compra.', 'Compressed receipt photo saved.'));
      addDetailWidgets(listId);
    } catch (err) { notify('No se pudo guardar la foto: ' + err.message); }
  }
  function scanWarnings(item, knownPrices) {
    const flags=[];
    const p=numeric(item.price,0);
    if (!(p>0)) flags.push('Precio no identificado');
    if (p>1500) flags.push('Precio excepcionalmente alto');
    const key=typeof Shopping !== 'undefined' && Shopping.normalize ? Shopping.normalize(item.name) : String(item.name).toLowerCase();
    const old=numeric(knownPrices?.[key],0);
    if (p>0 && old>0 && (p>old*3 || p<old*.33)) flags.push('Precio muy distinto al registrado antes');
    if (/\b\d+[,.]\d+\s*kg\b/i.test(item.name) && qtyValue(item.qty)>2) flags.push('Revisar cantidad: producto pesado');
    return flags;
  }
  function normalizeAIItem(raw, index, knownPrices) {
    const name=String(raw?.name||raw?.productName||`Producto ${index+1}`).replace(/[<>\"']/g, '').trim().slice(0,110) || `Producto ${index+1}`;
    const unit=String(raw?.unitType||raw?.unit||'un').trim().toLowerCase();
    let quantity=quantityFromAI(raw?.quantity??raw?.qty??1, unit);
    const unitPrice=numeric(raw?.unitPrice??raw?.price, NaN);
    const line=numeric(raw?.lineTotal??raw?.subtotal, NaN);
    let price=Number.isFinite(unitPrice)&&unitPrice>0?unitPrice:(Number.isFinite(line)&&line>0?line/quantity:0);
    if (price<0 || !Number.isFinite(price)) price=0;
    // Las cantidades de artículos envasados se refieren a unidades compradas,
    // no a litros/ml del tamaño del envase que figura en el nombre.
    if (/\b(?:l|ml|litros?|litres?)\b/.test(unit)) quantity=1;
    const qty=Math.abs(quantity-1)<0.00001?'':String(Number(quantity.toFixed(5)));
    const output={name:name.charAt(0).toUpperCase()+name.slice(1),qty,checked:true,price:Number(price.toFixed(4))};
    output.smUnit=/\b(?:kg|kilo|kilogramo)\b/.test(unit)?'kg':'un';
    if (Number.isFinite(line)&&line>=0) output.smReadLineTotal=rounded(line);
    if (raw?.packageSize) output.smPackageSize=String(raw.packageSize).slice(0,30);
    output.smWarnings=scanWarnings(output, knownPrices);
    if (Number.isFinite(line)&&line>=0&&Math.abs(lineSubtotal(output)-rounded(line))>0.03)
      output.smWarnings.push('Subtotal leído diferente de cantidad × precio');
    return output;
  }
  function scanMetadata(parsed) {
    return {schema:2, at:Date.now(), receiptTotal:parsed.receiptTotal,
      productsTotal:itemsSubtotal(parsed.items), discount:parsed.discount,
      warningCount:parsed.items.reduce((n,i)=>n+(i.smWarnings?.length||0),0)};
  }
  function injectStyle() {
    if ($('slp-receipt-styles')) return;
    const node=root.document.createElement('style');node.id='slp-receipt-styles';
    node.textContent=`
      .slp-receipt-box{padding:12px 14px;margin:9px 0 12px;background:var(--input-bg,rgba(130,145,140,.10));border:1px solid var(--glass-border,rgba(125,145,130,.2));border-radius:15px;color:var(--text-color);font-size:12px;line-height:1.55}
      .slp-receipt-box strong{font-weight:850}
      .slp-receipt-box .slp-receipt-row{display:flex;gap:12px;align-items:baseline;justify-content:space-between}
      .slp-receipt-box .slp-receipt-row>b{font-variant-numeric:tabular-nums;white-space:nowrap}
      .slp-receipt-diff{color:var(--danger,#b45309)}
      .slp-receipt-small{font-size:11px;opacity:.8;line-height:1.4}
      .slp-receipt-note{font-size:11px;opacity:.75;display:block;margin-top:4px}
      .slp-receipt-line{font-size:11px;font-weight:750;margin-top:6px;text-align:right;color:var(--text-sec)}
      .slp-receipt-quantity{display:flex;align-items:center;gap:5px;margin-top:5px;font-size:11px;color:var(--text-sec);justify-content:flex-end}
      .slp-receipt-quantity input{box-sizing:border-box;width:75px;min-height:32px;padding:5px 7px;border:1px solid var(--glass-border,#ccc);border-radius:9px;background:var(--card-bg,#fff);color:var(--text-color);font-size:12px;font-weight:800;text-align:right}
      .slp-receipt-actions{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px}
      .slp-receipt-actions button,.slp-receipt-actions label{display:inline-flex;align-items:center;justify-content:center;flex:1;min-width:110px;padding:11px 12px;border-radius:12px;background:var(--input-bg,rgba(120,120,120,.12));color:var(--text-color);font-size:12px;font-weight:750;cursor:pointer;border:1px solid var(--glass-border,rgba(120,120,120,.2))}
      .slp-receipt-actions button:disabled{opacity:.5;cursor:default}
      #slp-receipt-photo-dialog{border:0;padding:0;background:var(--card-bg,var(--bg-color,#fff));color:var(--text-color);border-radius:20px;width:min(96vw,680px);max-height:94dvh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.28)}
      #slp-receipt-photo-dialog::backdrop{background:rgba(5,13,17,.82)}
      #slp-receipt-photo-dialog img{display:block;width:100%;height:auto;max-height:none;object-fit:contain;background:#fff}
      #slp-receipt-photo-dialog .slp-receipt-photo-head{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;position:sticky;top:0;background:var(--card-bg,var(--bg-color,#fff));z-index:2}
      #slp-receipt-photo-dialog button{border:0;border-radius:10px;min-height:40px;min-width:42px;color:var(--text-color);background:var(--input-bg,#eee);font-size:17px}
      #slp-receipt-photo-dialog:modal{overscroll-behavior:contain}
      #slp-receipt-photo-dialog::backdrop{overscroll-behavior:contain}
      #slp-receipt-paid-input{width:105px;max-width:45%;padding:8px;border:1px solid var(--glass-border,#ccc);border-radius:10px;background:var(--card-bg,#fff);color:var(--text-color);font-weight:800;text-align:right}
      #slp-receipt-backup{margin:12px 0}
      @media(prefers-reduced-motion:no-preference){.slp-receipt-actions button:active{transform:scale(.98)}#slp-receipt-photo-dialog{animation:slp-ticket-in .16s ease-out}@keyframes slp-ticket-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}}
    `;
    root.document.head.appendChild(node);
  }

  async function showPhoto(id) {
    try {
      const rec=await getPhoto(id);
      if (!rec?.data) { notify(tr('No hay foto guardada para esta compra.','Não há foto para esta compra.','No saved receipt photo.'));return; }
      $('slp-receipt-photo-dialog')?.remove();
      const dlg=root.document.createElement('dialog');dlg.id='slp-receipt-photo-dialog';
      dlg.innerHTML=`<div class="slp-receipt-photo-head"><b>${escapeHtml(tr('Foto del ticket','Foto do cupom','Receipt photo'))}</b><button type="button" aria-label="Cerrar">×</button></div><img alt="Foto del comprobante de compra">`;
      dlg.querySelector('img').src=rec.data;
      dlg.querySelector('button').onclick=()=>dlg.close();
      dlg.addEventListener('close',()=>dlg.remove(),{once:true});root.document.body.appendChild(dlg);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
    } catch (err) { notify('No se pudo abrir la foto: '+err.message); }
  }
  async function addDetailWidgets(listId) {
    const list=listById(listId), container=$('detail-items-list');if (!list || !container || String(Shopping.currentDetailListId)!==String(listId))return;
    const parent=container.parentElement;
    let actions=$('slp-receipt-photo-actions');
    if (!actions) {
      actions=root.document.createElement('div');actions.id='slp-receipt-photo-actions';actions.className='slp-receipt-actions';
      parent.insertBefore(actions,container);
    }
    actions.replaceChildren();
    const button=root.document.createElement('button');button.type='button';button.textContent=tr('Ver ticket','Ver cupom','View receipt');button.onclick=()=>showPhoto(listId);button.disabled=true;actions.appendChild(button);
    const label=root.document.createElement('label');label.textContent=tr('Adjuntar foto','Anexar foto','Attach photo');
    const file=root.document.createElement('input');file.type='file';file.accept='image/*';file.hidden=true;
    file.onchange=()=>{const selected=file.files?.[0];if(selected)attachFromGallery(listId,selected);file.value='';};
    label.appendChild(file);actions.appendChild(label);
    try { const rec=await getPhoto(listId);if(!actions.isConnected || String(Shopping.currentDetailListId)!==String(listId))return;
      button.disabled=!rec?.data;
      label.firstChild.textContent=rec?.data?tr('Cambiar foto','Trocar foto','Replace photo'):tr('Adjuntar foto','Anexar foto','Attach photo');
    } catch { button.disabled=true; }
  }

  function addQuantityInput(priceInput,item,onChange) {
    const row=priceInput.closest('.receipt-row');if(!row)return;
    let label=row.querySelector('.slp-receipt-quantity');
    if(!label){
      label=root.document.createElement('label');label.className='slp-receipt-quantity';
      const title=root.document.createElement('span');label.appendChild(title);
      const field=root.document.createElement('input');field.type='number';field.step='any';field.min='0.0001';field.max='10000';field.inputMode='decimal';
      label.appendChild(field);row.appendChild(label);
      field.addEventListener('input',()=>{
        const q=numeric(field.value,NaN);
        if(Number.isFinite(q)&&q>0&&q<=10000){priceInput.dataset.qty=String(q);onChange();}
      });
    }
    label.querySelector('span').textContent=item?.smUnit==='kg'?'Peso (kg)':'Cantidad';
    const field=label.querySelector('input');
    if(root.document.activeElement!==field)field.value=String(qtyValue(item?.qty));
  }
  function detailSummary() {
    const list=listById(Shopping.currentDetailListId), node=$('detail-total-val');
    if (!list || !node)return;
    const inputRows=[...root.document.querySelectorAll('#detail-items-list .detail-input')];
    const sum=rounded(inputRows.reduce((acc,el)=>acc + rounded(numeric(el.value,0)*qtyValue(el.dataset.qty)),0));
    const paidInput=$('slp-receipt-paid-input');
    const paid=paidInput?numeric(paidInput.value,Number(list.total)):Number(list.total)||0;
    node.textContent=money(paid);
    const diff=rounded(paid-sum);
    const host=$('slp-receipt-detail-summary');if(!host)return;
    host.innerHTML=`<div class="slp-receipt-row"><span>${escapeHtml(tr('Suma de productos','Soma dos produtos','Items subtotal'))}</span><b>${money(sum)}</b></div>
      <div class="slp-receipt-row ${Math.abs(diff)>0.019?'slp-receipt-diff':''}"><span>${escapeHtml(tr('Diferencia / descuentos / lectura','Diferença / descontos / leitura','Difference / discounts / recognition'))}</span><b>${diff>=0?'+':''}${money(diff)}</b></div>
      <span class="slp-receipt-small">${escapeHtml(Math.abs(diff)>0.019?tr('El total pagado se conserva; revisa productos, pesos y descuentos antes de corregir.','O total pago é preservado; confira itens, pesos e descontos.','Paid total is preserved; verify items, weights and discounts.'):tr('Los importes coinciden.','Os valores conferem.','Totals match.'))}</span>`;
    for (const el of inputRows) {
      const row=el.closest('.receipt-row');if(!row)continue;
      let subtotal=row.querySelector('.slp-receipt-line');if(!subtotal){subtotal=root.document.createElement('div');subtotal.className='slp-receipt-line';row.appendChild(subtotal);}
      const q=qtyValue(el.dataset.qty);
      const itemIndex=Number(el.dataset.slpIndex);
      const item=Number.isInteger(itemIndex)?list.items[itemIndex]:null;
      const unit=item?.smUnit==='kg'?'kg':'ud';
      subtotal.textContent=`${q!==1?q+' × ':''}${money(numeric(el.value,0))}/${unit} = ${money(rounded(numeric(el.value,0)*q))}`;
      if(item?.smWarnings?.length){subtotal.title=item.smWarnings.join(' · ');subtotal.textContent+=' · ⚠ '+item.smWarnings[0];}
    }
    // El botón Guardar permanece disponible para correcciones aunque no cambie total pagado.
  }
  function insertDetailSummary(listId) {
    const list=listById(listId),container=$('detail-items-list');if(!list || !container)return;
    const inputs=[...root.document.querySelectorAll('#detail-items-list .detail-input')];
    const checked=list.items.map((item,index)=>({item,index})).filter(v=>v.item.checked);
    inputs.forEach((el,k)=>{
      const ref=checked[k];if(!ref)return;
      el.dataset.slpIndex=String(ref.index);el.dataset.slpOriginalQty=String(ref.item.qty ?? '');
      el.step='any';el.min='0';
      addQuantityInput(el,ref.item,detailSummary);
    });
    const totalBlock=$('detail-total-val')?.closest('.receipt-total');if(!totalBlock)return;
    let host=$('slp-receipt-detail-summary');if(!host){host=root.document.createElement('div');host.id='slp-receipt-detail-summary';host.className='slp-receipt-box';totalBlock.insertAdjacentElement('beforebegin',host);}
    let paidBox=$('slp-receipt-paid-box');if(!paidBox){paidBox=root.document.createElement('div');paidBox.id='slp-receipt-paid-box';paidBox.className='slp-receipt-box';host.insertAdjacentElement('afterend',paidBox);}
    paidBox.innerHTML=`<div class="slp-receipt-row"><label for="slp-receipt-paid-input">${escapeHtml(tr('Total pagado (editable)','Total pago (editável)','Paid total (editable)'))}</label><input id="slp-receipt-paid-input" type="number" min="0" step="0.01" inputmode="decimal" value="${Number(list.total)||0}"></div><div class="slp-receipt-small">${escapeHtml(tr('Solo cambia si corriges explícitamente el importe pagado.','Só muda se você corrigir o valor pago.','Only changes if you explicitly edit the paid total.'))}</div>`;
    paidBox.querySelector('input').addEventListener('input',detailSummary);
    inputs.forEach(el=>el.addEventListener('input',detailSummary));
    detailSummary();
    addDetailWidgets(listId);
  }
  function finishSummary() {
    const list=listById(Data.store.currentId), cont=$('modal-finish-list');if(!list || !cont)return;
    const inputs=[...root.document.querySelectorAll('#finish-items-list .receipt-input')];
    const sum=rounded(inputs.reduce((v,i)=>v+rounded(numeric(i.value,0)*qtyValue(i.dataset.qty)),0));
    const pInput=$('finish-manual-total');const manual=numeric(pInput?.value,NaN);
    const paid=Number.isFinite(manual)&&manual>=0?manual:sum;
    const diff=rounded(paid-sum);
    let host=$('slp-receipt-finish-summary');if(!host){host=root.document.createElement('div');host.id='slp-receipt-finish-summary';host.className='slp-receipt-box';const target=$('finish-total-val')?.closest('.receipt-total');target?.insertAdjacentElement('beforebegin',host);}
    if(host)host.innerHTML=`<div class="slp-receipt-row"><span>${escapeHtml(tr('Productos','Produtos','Items'))}</span><b>${money(sum)}</b></div><div class="slp-receipt-row ${Math.abs(diff)>0.019?'slp-receipt-diff':''}"><span>${escapeHtml(tr('Diferencia con total pagado','Diferença do total pago','Difference to paid total'))}</span><b>${diff>=0?'+':''}${money(diff)}</b></div>${Math.abs(diff)>0.019?`<div class="slp-receipt-small">${escapeHtml(tr('Comprueba precios, cantidades, descuentos y total antes de guardar.','Confira preços, quantidades, descontos e total.','Review prices, quantities, discounts and paid total before saving.'))}</div>`:''}`;
    const checked=list.items.map((item,index)=>({item,index})).filter(x=>x.item.checked);
    inputs.forEach((el,k)=>{
      el.step='any';el.min='0';const ref=checked[k];if(!ref)return;
      el.dataset.slpIndex=String(ref.index);
      addQuantityInput(el,ref.item,()=>Shopping.updateFinishTotal());
      let line=el.closest('.receipt-row')?.querySelector('.slp-receipt-line');
      if(!line&&el.closest('.receipt-row')){line=root.document.createElement('div');line.className='slp-receipt-line';el.closest('.receipt-row').appendChild(line);}
      if(line){const q=qtyValue(el.dataset.qty), unit=ref.item.smUnit==='kg'?'kg':'ud';line.textContent=`${q!==1?q+' × ':''}${money(numeric(el.value,0))}/${unit} = ${money(rounded(numeric(el.value,0)*q))}`;if(ref.item.smWarnings?.length)line.textContent+=' ⚠ Revisar';}
    });
  }
  function refreshWalletMovement(listId,newTotal) {
    const movements=Data.store?.smartyMoney?.movements;
    if(!Array.isArray(movements))return true;
    const links=movements.filter(x=>String(x.sourceId)===`list-${listId}`);
    if(links.length>1) { notify('Hay más de un movimiento asociado: no se modifica el total.');return false; }
    if(links.length===1)links[0].amountCents=cents(newTotal);
    return true;
  }
  function maybeStoreRecentPhoto(listId) {
    const image=pending.get(String(listId));
    if (!image)return;
    pending.delete(String(listId));
    attachPhoto(listId,image).catch(err=>notify('Compra guardada, pero la foto no: '+err.message));
  }

  async function exportPhotos() {
    try {
      const allowed=new Set((Data.store.lists||[]).map(l=>String(l.id)));
      const photos=(await allPhotos()).filter(x=>allowed.has(String(x.id)) && /^data:image\/jpeg;base64,/.test(x.data||''));
      if(!photos.length){notify('No hay fotos de tickets para exportar.');return;}
      const contents=JSON.stringify({kind:'SmartLifeProReceiptPhotos',version:1,createdAt:new Date().toISOString(),photos});
      const name=`SmartLifePro_Tickets_${new Date().toISOString().slice(0,10)}.json`;
      if(root.SmartyAndroid?.saveBackupFile){root.SmartyAndroid.saveBackupFile(contents,name);return;}
      const file=new Blob([contents],{type:'application/json'});const url=URL.createObjectURL(file);
      const a=root.document.createElement('a');a.href=url;a.download=name;root.document.body.appendChild(a);a.click();a.remove();root.setTimeout(()=>URL.revokeObjectURL(url),30000);
    } catch(err){notify('No se pudieron exportar los tickets: '+err.message);}
  }
  async function importPhotos(file) {
    if(!file)return;
    try {
      const parsed=JSON.parse(await file.text());
      if(parsed.kind!=='SmartLifeProReceiptPhotos'||!Array.isArray(parsed.photos))throw Error('Archivo de fotos de tickets inválido');
      const ids=new Set((Data.store.lists||[]).map(l=>String(l.id)));
      let count=0;
      for (const item of parsed.photos) {
        if(!ids.has(String(item.id))||!/^data:image\/jpeg;base64,/.test(item.data||''))continue;
        await photoAction('put',String(item.id),item.data);
        const list=listById(item.id);if(list)list.smReceiptPhoto={attached:true,format:'jpeg',at:item.at||Date.now()};
        count++;
      }
      Data.save();notify(`${count} fotos restauradas. Las compras y saldos no cambiaron.`);
      addDetailWidgets(Shopping.currentDetailListId);
    } catch(err){notify('No se pudieron restaurar las fotos: '+err.message);}
  }
  function installBackupSettings() {
    const host=$('settings-inject');if(!host||$('slp-receipt-backup'))return;
    const section=root.document.createElement('section');section.id='slp-receipt-backup';
    section.innerHTML=`<div class="section-label">${escapeHtml(tr('Fotos de tickets','Fotos dos cupons','Receipt photos'))}</div>
      <div class="glass-card" style="padding:14px"><div class="slp-receipt-small">${escapeHtml(tr('Las fotos se guardan comprimidas en este dispositivo. El respaldo diario JSON actual NO las incluye: respáldalas por separado antes de cambiar de teléfono o reinstalar.','As fotos ficam neste aparelho e NÃO entram no backup diário JSON. Exporte-as antes de trocar o celular.','Photos remain on this device and are NOT in the daily JSON backup. Export them before reinstalling.'))}</div><div class="slp-receipt-actions"><button type="button" id="slp-export-receipts">${escapeHtml(tr('Respaldar fotos','Exportar fotos','Export photos'))}</button><label>${escapeHtml(tr('Restaurar fotos','Importar fotos','Import photos'))}<input type="file" id="slp-import-receipts" accept="application/json,.json" hidden></label></div></div>`;
    host.appendChild(section);
    $('slp-export-receipts').onclick=exportPhotos;
    $('slp-import-receipts').onchange=e=>{const file=e.target.files?.[0];if(file)importPhotos(file);e.target.value='';};
  }

  function install() {
    if(typeof Shopping==='undefined'||typeof Data==='undefined'||typeof Finance==='undefined'||!root.document.body || Shopping.__slpReceiptV2)return;
    Shopping.__slpReceiptV2=true;injectStyle();
    Shopping.parseQtyValue=qtyValue;
    Shopping.receiptItemsSubtotal=itemsSubtotal;
    Shopping.receiptSavePhoto=attachFromGallery;

    const originalExtract=Shopping.extractFullReceiptWithAI;
    if(typeof originalExtract==='function') {
      Shopping.extractFullReceiptWithAI=async function(file) {
        if(typeof GroqAI==='undefined'||!GroqAI.getApiKey?.())throw Error('Falta configurar Groq');
        const photo=await photoFromFile(file);
        // Imagen de lectura más nítida que la copia local.
        const high=await Finance.compressImage(file,1800,.82);
        const prompt=`Analiza el recibo de supermercado de Brasil (R$). Devuelve SOLO JSON válido:
        {"storeName":"","receiptTotal":0,"discountTotal":0,"items":[{"name":"","quantity":1,"unitType":"un","unitPrice":0,"lineTotal":0,"packageSize":""}]}.
        REGLAS CRÍTICAS:
        - receiptTotal es el TOTAL FINAL EFECTIVAMENTE PAGADO (después de descuentos), no subtotal.
        - Copia cada renglón comprado una vez; si aparece el mismo producto dos veces conserva dos renglones.
        - quantity es NÚMERO DE ARTÍCULOS o PESO EN KG, no capacidad de la botella/envase.
        - unitType debe ser "kg" para producto pesado; "un" para unidad; NUNCA uses "L", "ml" o gramos como cantidad comprada. Si pone "Refrigerante 1,5L" y se compró una botella, quantity=1, packageSize="1,5L".
        - En productos a granel con 0,772 kg, quantity=0.772, unitType="kg", unitPrice=valor por kg y lineTotal=importe cobrado por esa pieza.
        - unitPrice y lineTotal deben salir del comprobante, no inventarse. No uses el total de la fila como precio unitario si quantity es distinto de 1.
        - Si una cantidad o precio es ilegible, omite o pon 0. Usa punto decimal en los NÚMEROS JSON. No redondees precios kg a enteros.
        - No metas descuentos, redondeos o recargos como artículos: indica descuentos en discountTotal.
        - No inventes productos ni descuentos.`;
        // En tickets largos se necesitan más tokens que en un OCR de un solo producto.
        // Se usa el mismo cliente Groq de la app, sin cambiar sus ajustes globales.
        const response=await GroqAI.request({model:GroqAI.visionModel,
          messages:[{role:'user',content:[{type:'text',text:prompt},
            {type:'image_url',image_url:{url:'data:image/jpeg;base64,'+high.split(',')[1]}}]}],
          response_format:{type:'json_object'},temperature:0.1,reasoning_effort:'none',
          max_completion_tokens:4200,stream:false},{timeoutMs:60000});
        const res=GroqAI.parseJSON(GroqAI.extractText(response));
        if(!Array.isArray(res?.items)||!res.items.length)throw Error('No se pudieron leer productos. Repite la foto con buena luz.');
        const knownPrices=Data.store.prices||{};
        const cleanItems=res.items.slice(0,160).map((x,i)=>normalizeAIItem(x,i,knownPrices));
        const discount=Math.max(0,numeric(res.discountTotal??res.discount,0));
        const receiptTotal=Math.max(0,numeric(res.receiptTotal,0));
        const parsed={storeName:String(res.storeName||'').trim().slice(0,40),receiptTotal,discount,items:cleanItems};
        recentScan={items:cleanItems,photo,meta:scanMetadata(parsed),at:Date.now()};
        return parsed;
      };
    }

    const originalHandle=Shopping.handleReceiptPhoto;
    if(typeof originalHandle==='function') Shopping.handleReceiptPhoto=async function(input) {
      const id=String(Data.store.currentId||'');recentScan=null;
      const result=await originalHandle.call(this,input);
      const list=listById(id);
      if (list && recentScan && list.items===recentScan.items) {
        list.smReceipt=recentScan.meta;pending.set(id,recentScan.photo);Data.save();finishSummary();
        try { await attachPhoto(id,recentScan.photo); } catch(e) { notify('Foto pendiente de guardar: '+e.message); }
      }
      return result;
    };

    const originalCreate=Shopping.createCompletedListFromReceipt;
    if(typeof originalCreate==='function') Shopping.createCompletedListFromReceipt=async function(input) {
      const before=new Set(Data.store.lists.map(x=>String(x.id)));recentScan=null;
      const output=await originalCreate.call(this,input);
      const list=Data.store.lists.find(x=>!before.has(String(x.id)));
      if(list && recentScan && list.items===recentScan.items){
        list.smReceipt=recentScan.meta;pending.set(String(list.id),recentScan.photo);Data.save();
        try { await attachPhoto(String(list.id),recentScan.photo); } catch(e) { notify('Foto pendiente de guardar: '+e.message); }
      }
      return output;
    };

    // Sustitución en historial: explícita, conservando la fotografía y sincronizando
    // únicamente el movimiento que pertenece a ESTA compra (si existe).
    if(typeof Shopping.replaceCompletedListWithPhoto==='function') Shopping.replaceCompletedListWithPhoto=async function(input) {
      const file=input?.files?.[0],id=String(this.currentDetailListId||'');
      if(!file||!id)return;
      if(input.value!==undefined)input.value='';
      try {
        recentScan=null;notify('Analizando ticket para corregir el historial...');
        const parsed=await this.extractFullReceiptWithAI(file),list=listById(id);
        if(!list||!recentScan)return;
        const sum=itemsSubtotal(parsed.items);
        const paid=parsed.receiptTotal>0?rounded(parsed.receiptTotal):sum;
        const diff=rounded(paid-sum);
        const detail=`${parsed.items.length} productos; pagado ${money(paid)}; suma de productos ${money(sum)}; diferencia ${money(diff)}.`;
        if(!root.confirm(`${detail}\n\n¿Reemplazar los productos y el total pagado de esta compra? Se actualizará también su movimiento de tarjeta asociado, si existe.`))return;
        if(!refreshWalletMovement(id,paid))return;
        list.items=parsed.items;list.total=paid;list.smReceipt=recentScan.meta;
        Data.save();
        try{await attachPhoto(id,recentScan.photo);}catch(err){notify('Lista corregida, pero no pudo guardarse la foto.');}
        this.openHistoryDetail(id);
        if(typeof UI!=='undefined')UI.renderBudgetChart?.();
        if(typeof Finance!=='undefined')Finance.renderHomeWidgets?.();
        notify('Ticket reemplazado y totales conciliados. Revisa las advertencias si hay diferencias.');
      }catch(err){notify('No se pudo leer el ticket: '+err.message);}
    };

    const originalRenderFinish=Shopping.renderFinishItems;
    Shopping.renderFinishItems=function(...args){const out=originalRenderFinish.apply(this,args);finishSummary();return out;};
    const originalUpdateFinish=Shopping.updateFinishTotal;
    Shopping.updateFinishTotal=function(...args){const out=originalUpdateFinish.apply(this,args);finishSummary();return out;};

    const originalConfirm=Shopping.confirmFinish;
    Shopping.confirmFinish=function(...args) {
      const id=String(Data.store.currentId||''),list=listById(id);if(!list)return;
      const inputs=[...root.document.querySelectorAll('#finish-items-list .receipt-input')];
      const checked=list.items.filter(x=>x.checked);
      const newPrices=inputs.map(input=>numeric(input.value,0));
      if(newPrices.some(v=>!Number.isFinite(v)||v<0)){notify('Revisa los precios; no se permiten valores negativos.');return;}
      const sum=rounded(inputs.reduce((v,i)=>v+rounded(numeric(i.value,0)*qtyValue(i.dataset.qty)),0));
      const manual=numeric($('finish-manual-total')?.value,NaN);
      const paid=Number.isFinite(manual)?manual:sum;
      const diff=rounded(paid-sum);
      if(Math.abs(diff)>0.019 && !root.confirm(`El total pagado (${money(paid)}) difiere de los productos (${money(sum)}) en ${money(diff)}.\n\nComprueba pesos, descuentos y precios. ¿Guardar igualmente el importe pagado?`))return;
      const priceBefore=list.smReceipt?{...Data.store.prices}:null;
      const result=originalConfirm.apply(this,args);
      if(list.status==='completed') {
        // El renderizador anterior utiliza .find(name), que falla con nombres repetidos.
        for(let i=0;i<checked.length;i++) {
          checked[i].price=Number((newPrices[i]||0).toFixed(4));
          const qty=qtyValue(inputs[i].dataset.qty);
          checked[i].qty=qty===1?'':String(qty);
        }
        if(priceBefore){
          Data.store.prices=priceBefore;
          // La lectura de IA por sí sola NUNCA actualiza el catálogo.
          // Tampoco se vuelcan automáticamente precios marcados como sospechosos.
          checked.forEach(item=>{
            if(item.smWarnings?.length || !(item.price>0) || item.price>1500)return;
            Data.store.prices[this.normalize(item.name)]=item.price;
          });
        }
        if(list.smReceipt)list.smReceipt={...list.smReceipt,productsTotal:itemsSubtotal(list.items),confirmedAt:Date.now()};
        Data.save();maybeStoreRecentPhoto(id);
      }
      return result;
    };

    const originalOpenDetail=Shopping.openHistoryDetail;
    Shopping.openHistoryDetail=function(id,...args){
      const ret=originalOpenDetail.call(this,id,...args);
      insertDetailSummary(id);
      return ret;
    };
    Shopping.updateDetailTotal=function(){detailSummary();};
    Shopping.checkDetailChanges=function(){detailSummary();};
    Shopping.updateHistoryList=function(){
      const list=listById(this.currentDetailListId);if(!list)return;
      const checked=list.items.map((item,index)=>({item,index})).filter(x=>x.item.checked);
      const inputs=[...root.document.querySelectorAll('#detail-items-list .detail-input')];
      if(inputs.length!==checked.length){notify('La lista cambió. Ábrela nuevamente antes de guardar.');return;}
      const prices=inputs.map(x=>numeric(x.value,NaN));
      if(prices.some(x=>!Number.isFinite(x)||x<0)){notify('Hay precios incorrectos.');return;}
      const paidField=$('slp-receipt-paid-input');
      const oldTotal=Number(list.total)||0;
      const paid=paidField?numeric(paidField.value,NaN):oldTotal;
      if(!Number.isFinite(paid)||paid<0){notify('Introduce un total pagado válido.');return;}
      if(Math.abs(oldTotal-paid)>0.005){
        if(!root.confirm(`Cambiar el total pagado de ${money(oldTotal)} a ${money(paid)}?\nSe corregirá también el movimiento de la tarjeta asociado a esta compra, si existe.`))return;
        if(!refreshWalletMovement(list.id,paid))return;
        list.total=rounded(paid);
      }
      checked.forEach(({item},i)=>{
        item.price=Number(prices[i].toFixed(4));
        const oldQty=qtyValue(item.qty), newQty=qtyValue(inputs[i].dataset.qty);
        if(Math.abs(oldQty-newQty)>0.000001)item.qty=newQty===1?'':String(newQty);
      });
      if(list.smReceipt)list.smReceipt={...list.smReceipt,productsTotal:itemsSubtotal(list.items),manualEditedAt:Date.now()};
      Data.save();
      this.closeDetailModal();
      const box=$('history-box');if(box&&typeof this.renderHistoryLists==='function')this.renderHistoryLists(box);
      UI.renderBudgetChart?.();Finance.renderHomeWidgets?.();
      notify('Productos guardados. Se conserva el total pagado salvo corrección explícita.');
    };

    const originalDelete=Shopping.deleteHistoryList;
    if(typeof originalDelete==='function') Shopping.deleteHistoryList=async function(...args){
      const id=String(this.currentDetailListId||''),before=!!listById(id);
      const ret=await originalDelete.apply(this,args);
      if(before&&!listById(id)){pending.delete(id);removePhoto(id).catch(()=>{});}
      return ret;
    };

    const originalSettings=typeof UI!=='undefined'&&UI.renderSettingsView;
    if(typeof originalSettings==='function')UI.renderSettingsView=function(...args){const out=originalSettings.apply(this,args);installBackupSettings();return out;};
    installBackupSettings();
    root.SmartyReceiptUpgrade={numeric,qtyValue,itemsSubtotal,normalizeAIItem,scanMetadata,exportPhotos,importPhotos,getPhoto,attachPhoto,showPhoto,install};
  }
  const start=()=>root.setTimeout(install,0);
  if(root.document.readyState==='complete')start();
  else root.addEventListener('load',start,{once:true});
})(typeof window==='undefined'?null:window);
