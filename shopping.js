/* =========================================
   SMART LIFE PRO - SHOPPING MODULE (V7.7 - UI & LOGIC FIX + GEMINI AI PRO)
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

    // --- ESCANEO DE RECIBO CON IA ---
    async handleReceiptPhoto(input) {
        const file = input.files[0];
        if (!file) return;

        // Verificar API Key sin tildes
        let apiKey = Data.store.settings.geminiApiKey;
        if (!apiKey) {
            const key = prompt("Ingresa tu clave de Google AI Studio:");
            if (!key) return;
            Data.store.settings.geminiApiKey = key.trim();
            apiKey = Data.store.settings.geminiApiKey;
            Data.save();
        }

        // Mostrar mensaje no bloqueante
        if (typeof UI !== 'undefined') UI.showSnackbar("Procesando en segundo plano, puede seguir...");
        
        // Limpiar inputs para permitir re-uso inmediato
        const camInput = document.getElementById('receipt-photo-cam');
        const galInput = document.getElementById('receipt-photo-gal');
        if(camInput) camInput.value = '';
        if(galInput) galInput.value = '';

        try {
            // 1. Comprimir imagen
            const base64Data = await Finance.compressImage(file, 1200, 0.7);
            const rawBase64 = base64Data.split(',')[1];

            // 2. Extraer productos pendientes
            const list = Data.store.lists.find(l => l.id === Data.store.currentId);
            if (!list) return;
            const targetItems = list.items.filter(i => i.checked).map(i => i.name);

            const payload = {
                contents: [{
                    parts: [
                        { text: `Analiza este recibo de compra.
Lista de productos: ${JSON.stringify(targetItems)}.

Tarea: Extrae precios unitarios o finales de la lista.
Responde UNICAMENTE un JSON valido:
{
  "matches": [ { "listName": "Nombre", "price": 10.50 } ],
  "unmatched": [ { "receiptText": "Texto", "price": 5.20 } ]
}` },
                        { inline_data: { mime_type: "image/jpeg", data: rawBase64 } }
                    ]
                }]
            };

            let data;
            let retries = 3;
            let success = false;

            // 3. Enviar a Gemini (Usando 3.8-flash) con reintentos
            for (let i = 0; i < retries; i++) {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                data = await response.json();

                if (!data.error) {
                    success = true;
                    break;
                }

                // Esperar si hay alta demanda
                if (data.error.message.includes("high demand") && i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 3000)); 
                } else {
                    throw new Error(data.error.message);
                }
            }

            if (!success) throw new Error("Servidores saturados.");

            // Extraccion de JSON a prueba de fallos
            const rawText = data.candidates[0].content.parts[0].text;
            const jsonMatch = rawText.match(/\{[\s\S]*\}/); 
            
            if (!jsonMatch) {
                throw new Error("Formato invalido.");
            }
            
            const result = JSON.parse(jsonMatch[0]);

            // 4. Asignar precios asociados automaticamente
            let matchedCount = 0;
            if (result.matches && result.matches.length > 0) {
                result.matches.forEach(m => {
                    const inputEl = document.querySelector(`#finish-items-list .receipt-input[data-name="${m.listName}"]`);
                    if (inputEl && m.price > 0) {
                        inputEl.value = parseFloat(m.price).toFixed(2);
                        matchedCount++;
                    }
                });
                this.updateFinishTotal();
            }

            // 5. Mensajes de resultado sin tildes ni alerts
            if (typeof UI !== 'undefined') {
                if (result.unmatched && result.unmatched.length > 0) {
                    UI.showSnackbar("Precios extraidos. Faltaron algunos items.");
                } else if (matchedCount > 0) {
                    UI.showSnackbar("Todos los precios extraidos con exito.");
                } else {
                    UI.showSnackbar("No se detectaron precios de la lista.");
                }
            }

        } catch (err) {
            console.error("Error al procesar el recibo:", err);
            if (typeof UI !== 'undefined') UI.showSnackbar("Error al procesar el recibo. Intente luego.");
        }
    }
};