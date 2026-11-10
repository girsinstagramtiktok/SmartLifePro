/* SmartLifePro: funciones de Finanzas adicionales. El diseño Bento vive en el código fuente. */
/* ====================================================================
   Finanzas seguras: las categorías e iconos que añade el WORKFLOW Android
   permanecen intactos. Corregir solo la lectura multilingüe,
   sumar topes por categoria y promedios sin migrar los gastos.
   ==================================================================== */
(function () {
  'use strict';
  window.SMARTY_PATCH_BUILD_ID = 'smarty-light-2026-11-10-bento';
  const VERSION = 'smarty-insights-2026-11-03-14';
  const IDS = ['cat_market','cat_lunch','cat_dining','cat_leisure','cat_transport','cat_clothes','cat_health','cat_bills','cat_travel','cat_beauty','cat_other','cat_subs'];
  const LOCAL = {
    es:{daily:'Puedes gastar por día',days:'días restantes',limit:'Tope mensual',save:'Guardar tope',clear:'Quitar tope',spent:'Gastado',near:'Cerca del límite',over:'Límite superado',safe:'Dentro del límite',alert:'Alerta de categoría',avg:'Promedios de gastos',monthly:'Promedio mensual',perCategory:'Promedio por categoría',months:'meses completos',empty:'No hay datos históricos suficientes.',invalid:'Introduce un importe válido.',saved:'Tope actualizado',available:'Sin presupuesto'},
    pt:{daily:'Disponível por dia',days:'dias restantes',limit:'Limite mensal',save:'Salvar limite',clear:'Remover limite',spent:'Gasto',near:'Perto do limite',over:'Limite ultrapassado',safe:'Dentro do limite',alert:'Alerta de categoria',avg:'Médias de gastos',monthly:'Média mensal',perCategory:'Média por categoria',months:'meses completos',empty:'Sem histórico suficiente.',invalid:'Informe um valor válido.',saved:'Limite atualizado',available:'Sem orçamento'},
    en:{daily:'Available per day',days:'days remaining',limit:'Monthly cap',save:'Save cap',clear:'Remove cap',spent:'Spent',near:'Near cap',over:'Cap exceeded',safe:'Within cap',alert:'Category alert',avg:'Spending averages',monthly:'Monthly average',perCategory:'Average by category',months:'completed months',empty:'Not enough history yet.',invalid:'Enter a valid amount.',saved:'Cap updated',available:'No budget'}
  };
  const EXTRA = {
    entertainment:['Entretenimiento','Entretenimento','Entertainment'],
    food:['Comida','Comida','Food'],
    shopping:['Compras','Compras','Shopping']
  };
  const LANG_INDEX={es:0,pt:1,en:2};
  const ui=()=>typeof UI!=='undefined'?UI:null;
  const data=()=>typeof Data!=='undefined'?Data:null;
  const fin=()=>typeof Finance!=='undefined'?Finance:null;
  const lang=()=>['es','pt','en'].includes(data()?.store?.settings?.lang)?data().store.settings.lang:'es';
  const t=k=>LOCAL[lang()][k]||LOCAL.es[k]||k;
  const money=v=>ui()?.formatMoney?ui().formatMoney(Number(v)||0):String(v);
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en').replace(/^[^\p{L}\p{N}_]+/u,'').replace(/[^\p{L}\p{N}_\s-]/gu,'').replace(/\s+/g,' ').trim();
  const aliases = new Map();
  function alias(key,...labels){for(const text of labels)aliases.set(norm(text),key);}
  // Mapeo SOLO de valores persistidos a IDs que el APK ya conoce.
  // No añadir/remover categorías ni cambiar UI.categoryIcon.
  const tr = {
    cat_market:['supermercado','supermercados','mercado','groceries','grocery'],
    cat_lunch:['almuerzo','almoço','almoco','lunch','cat_lunch'],
    cat_dining:['delivery y salidas','delivery y salida','delivery e saidas','delivery e saídas','delivery & dining','delivery and dining','cat_dining','cat_delivery','extra:dining'],
    cat_leisure:['microgasto','microgastos','micro-expenses','micro expenses','ocio','lazer','leisure'],
    cat_transport:['transporte','transport','transportation'],
    cat_clothes:['ropa','roupa','clothes'],
    cat_health:['salud','saúde','saude','health'],
    cat_bills:['hogar','casa','home','bills','cat_home'],
    cat_travel:['viaje','viagem','travel'],
    cat_beauty:['belleza','beleza','beauty'],
    cat_other:['otros','otro','outros','outro','other'],
    cat_subs:['gastos fijos','gasto fijo','gastos fixos','despesas fixas','fixed exp.','fixed expenses','suscripciones','assinaturas','subscriptions','cat_sub','cat-sub','cat_fixed','cat_fijos','tab_subs','extra:fixed','extra:subscriptions'],
    'extra:entertainment':['entretenimiento','entretenimento','entertainment','cat_ent'],
    'extra:food':['comida','food','cat_food'],
    'extra:shopping':['compras','shopping','cat_shop']
  };
  for (const [key,words] of Object.entries(tr)) alias(key,key,...words);
  // También aceptar todas las traducciones que estén presentes en ui.js.
  function dynamicKeyOf(n){
    const u=ui();if(!u?.dictionary)return null;
    for(const id of IDS){
      for(const language of ['es','pt','en']){
        const dict=u.dictionary[language];
        const value=dict?.[id==='cat_subs'?'tab_subs':id];
        if(value&&norm(value)===n)return id;
      }
    }
    return null;
  }
  function keyOf(raw){
    if(raw==null||String(raw).trim()==='')return 'cat_other';
    const literal=String(raw).trim();
    if(literal.startsWith('extra:') && EXTRA[literal.slice(6)])return literal;
    if(literal.startsWith('raw:')){const rawNorm=norm(literal.slice(4));return aliases.get(rawNorm)||dynamicKeyOf(rawNorm)||`raw:${rawNorm}`;}
    let n=norm(raw);
    if(n.startsWith('legacy:'))n=norm(n.slice(7));
    if(aliases.has(n))return aliases.get(n);
    const dynamic=dynamicKeyOf(n);if(dynamic)return dynamic;
    if(/^cat_[a-z0-9_-]+$/.test(n))return `raw:${n}`;
    return n?`raw:${n}`:'cat_other';
  }
  const records=()=>Array.isArray(data()?.store?.expenses)?data().store.expenses:[];
  function originalLabel(key){
    const s=records().find(e=>keyOf(e.category)===key)?.category;
    return typeof s==='string'&&s.trim()&&!/^cat[_-]/i.test(s.trim())?s.trim():null;
  }
  function label(key){
    const k=keyOf(key);
    if(IDS.includes(k))return ui()?.t(k==='cat_subs'?'tab_subs':k)||k;
    if(k.startsWith('extra:'))return EXTRA[k.slice(6)]?.[LANG_INDEX[lang()]]||originalLabel(k)||k.slice(6);
    if(k.startsWith('raw:')){
      const original=originalLabel(k);
      if(original)return original;
      // Jamás imprimir identificadores internos como cat_market en pantalla.
      return k.slice(4).replace(/^cat[_-]/,'').replace(/[_-]+/g,' ').replace(/^./,c=>c.toUpperCase());
    }
    return String(k);
  }
  const amount=x=>Number.isFinite(Number(x))?Number(x):0;
  const indexOfMonth=d=>d.getFullYear()*12+d.getMonth();
  const date=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d:null;};
  const period=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  function monthTotals(year,month,now=new Date()){
    const wanted=year*12+month, map=new Map();
    const add=(k,v)=>{const n=amount(v);if(n){k=keyOf(k);map.set(k,(map.get(k)||0)+n);}};
    for(const e of records()){
      const d=date(e.date);if(!d)continue;
      if(e.isInstallment){const n=Number(e.installments?.total)||0;const i=wanted-indexOfMonth(d);if(i>=0&&i<n)add(e.category,e.amount);}
      else if(indexOfMonth(d)===wanted)add(e.category,e.amount);
    }
    for(const x of data()?.store?.lists||[]){const d=date(x.date);if(x.status==='completed'&&d&&indexOfMonth(d)===wanted)add('cat_market',x.total);}
    for(const x of data()?.store?.subscriptions||[]){
      const day=Number(x.day),last=new Date(year,month+1,0).getDate();
      if(day<1||day>last)continue;
      if(wanted===indexOfMonth(now)){if(day<=now.getDate())add('cat_subs',x.cost);}
      else{
        const joined=date(x.createdAt||x.date||(Number(x.id)>946684800000&&Number(x.id)<Date.now()+86400000?Number(x.id):null));
        // Si no hay fecha de alta, no inventar suscripciones en meses pasados.
        if(joined&&indexOfMonth(joined)<=wanted)add('cat_subs',x.cost);
      }
    }
    return map;
  }
  function dailyAllowance(now=new Date()){
    const budget=amount(data()?.store?.budget?.limit);
    const spent=amount(fin()?.calculateMonthlySpent?.());
    const days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate()-now.getDate()+1;
    return {budget,spent,days,daily:budget>0?Math.max(0,budget-spent)/days:0};
  }
  function averages(n=3,now=new Date()){
    n=[3,6,12].includes(Number(n))?Number(n):3;
    const history=[...records().map(e=>date(e.date)),...(data()?.store?.lists||[]).filter(l=>l.status==='completed').map(l=>date(l.date)),...(data()?.store?.subscriptions||[]).map(s=>date(s.createdAt||s.date||(Number(s.id)>946684800000&&Number(s.id)<Date.now()+86400000?Number(s.id):null)))].filter(Boolean);
    const first=history.length?Math.min(...history.map(indexOfMonth)):Infinity;
    let months=0,sum=0;const byCategory=new Map();
    for(let i=1;i<=n;i++){
      const m=new Date(now.getFullYear(),now.getMonth()-i,1);
      if(indexOfMonth(m)<first)continue;
      months++;
      const map=monthTotals(m.getFullYear(),m.getMonth(),now);
      for(const [k,v] of map){sum+=v;byCategory.set(k,(byCategory.get(k)||0)+v);}
    }
    return {months,average:months?sum/months:0,byCategory:new Map([...byCategory].map(([k,v])=>[k,v/(months||1)]))};
  }
  function readCaps(){
    const source=data()?.store?.settings?.categoryCaps;
    const result={};
    if(source&&typeof source==='object'&&!Array.isArray(source))for(const [k,v] of Object.entries(source)){
      if(amount(v)>0){const key=keyOf(k);result[key]=Math.max(result[key]||0,amount(v));}
    }
    return result;
  }
  function saveCap(key,v){
    const store=data()?.store;if(!store)return;
    store.settings=store.settings||{};
    const caps=readCaps(),k=keyOf(key);if(v>0)caps[k]=v;else delete caps[k];
    store.settings.categoryCaps=caps;data().save();
  }
  function capStatus(key,totals=monthTotals(new Date().getFullYear(),new Date().getMonth())){
    const cap=readCaps()[keyOf(key)]||0,spent=totals.get(keyOf(key))||0,pct=cap>0?spent/cap*100:0;
    return {cap,spent,pct,level:cap===0?0:pct>=100?2:pct>=80?1:0};
  }
  function addNode(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  const CSS=String.raw`
#smarty-category-alert{display:none!important}
#smarty-insights-strip{display:flex!important;grid-column:1/-1!important;justify-content:flex-start!important;align-items:center!important;min-height:43px!important;margin:7px 0 0!important;padding:9px 12px!important;border-radius:13px!important;border:1px solid rgba(231,246,255,.13)!important;background:rgba(255,255,255,.09)!important}
#smarty-insights-strip .smarty-insights-open{display:none!important}
#smarty-insights-strip .smarty-daily-label{font:600 10px/1.2 system-ui,sans-serif;color:rgba(255,255,255,.78)}
#smarty-insights-strip .smarty-daily-val{font:800 17px/1.24 system-ui,sans-serif;color:#fff}
#smarty-insights-strip .smarty-daily-info{display:flex;flex-direction:column;gap:3px}
#smarty-finance-toolbar{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:0}
#smarty-finance-toolbar button{min-height:40px;flex:1;border:1px solid var(--glass-border,rgba(130,170,185,.20));border-radius:13px;background:var(--glass-bg,rgba(255,255,255,.7));color:var(--text-color,#243342);font:700 12px system-ui,sans-serif}
#smarty-category-cap-detail{padding:15px 16px!important;margin:10px 0 14px!important;border-radius:17px!important;background:var(--glass-bg,rgba(245,252,252,.90))!important;border:1px solid var(--glass-border,rgba(170,192,208,.30))!important;color:var(--text-color,#293949)!important}
#smarty-category-cap-detail .sc-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;font:800 13px system-ui,sans-serif}
#smarty-category-cap-detail .sc-subtitle{font:500 11px/1.4 system-ui,sans-serif;color:var(--text-sec,#6f7f8b)}
#smarty-category-cap-detail .sc-stat{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:9px 0 5px;font:600 12px system-ui,sans-serif}
#smarty-category-cap-detail .sc-track{height:7px;background:rgba(141,166,183,.2);border-radius:20px;overflow:hidden;margin:9px 0}
#smarty-category-cap-detail .sc-fill{height:100%;background:#36bda2;border-radius:20px}
#smarty-category-cap-detail .sc-fill.sc-near{background:#e3a646}
#smarty-category-cap-detail .sc-fill.sc-over{background:#d96771}
#smarty-category-cap-detail .sc-edit{display:flex;align-items:center;gap:8px;margin-top:12px}
#smarty-category-cap-detail .sc-edit input{min-width:0;flex:1;width:45%;padding:10px 11px;border-radius:11px;border:1px solid var(--glass-border,rgba(150,180,200,.3));color:var(--text-color,#243342);background:var(--input-bg,rgba(255,255,255,.6));font:600 13px system-ui,sans-serif}
#smarty-category-cap-detail .sc-edit button{min-height:42px;border:0;border-radius:11px;padding:0 12px;background:var(--primary,#178d81);color:white;font:750 12px system-ui,sans-serif}
#smarty-category-cap-detail .sc-remove{border:0;background:none;color:var(--text-sec,#627b85);margin:9px 0 0;padding:3px 0;font:600 11px system-ui,sans-serif}
#smarty-category-cap-detail .sc-status{font:750 11px/1.4 system-ui,sans-serif;color:var(--text-sec,#627a86)}
#smarty-category-cap-detail .sc-status.sc-near{color:#b77c27}
#smarty-category-cap-detail .sc-status.sc-over{color:#d35a64}
#smarty-averages-modal{position:fixed;inset:0;z-index:2147483600;display:none;align-items:flex-end;justify-content:center;padding:env(safe-area-inset-top) 10px calc(env(safe-area-inset-bottom) + 10px);background:rgba(4,16,29,.63)}
#smarty-averages-modal.sc-open{display:flex}
#smarty-averages-modal .sc-sheet{width:100%;max-width:560px;max-height:83dvh;display:flex;flex-direction:column;border-radius:22px;background:var(--card-bg,#f4f9f9);color:var(--text-color,#263843);overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25);border:1px solid var(--glass-border,rgba(147,179,195,.2))}
#smarty-averages-modal .sc-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 16px;border-bottom:1px solid var(--glass-border,rgba(147,179,195,.2))}
#smarty-averages-modal .sc-head strong{font:800 15px system-ui,sans-serif}
#smarty-averages-modal .sc-close{min-width:36px;min-height:36px;border:0;border-radius:10px;background:var(--input-bg,#edf1f4);color:inherit;font:700 20px system-ui,sans-serif}
#smarty-averages-modal .sc-content{padding:14px 16px 24px;overflow-y:auto;overscroll-behavior:contain}
#smarty-averages-modal .sc-period{display:flex;gap:8px;margin-bottom:13px}
#smarty-averages-modal .sc-period button{flex:1;min-height:37px;border-radius:10px;border:1px solid var(--glass-border,rgba(150,180,200,.3));background:var(--glass-bg,#e9f1f0);color:inherit;font:700 12px system-ui,sans-serif}
#smarty-averages-modal .sc-period button[aria-pressed=true]{background:var(--primary,#188d7e);color:#fff}
#smarty-averages-modal .sc-summary{border-radius:15px;background:var(--glass-bg,#eef6f6);padding:15px;margin-bottom:12px}
#smarty-averages-modal .sc-summary small{color:var(--text-sec,#6b7f85)}
#smarty-averages-modal .sc-summary strong{display:block;font-size:24px;margin-top:5px}
#smarty-averages-modal .sc-avg-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 2px;border-bottom:1px solid var(--glass-border,rgba(150,180,200,.2));font:600 12px system-ui,sans-serif}
#smarty-averages-modal .sc-avg-row strong{white-space:nowrap}
#smarty-averages-modal .sc-note{color:var(--text-sec,#6b7f85);font:500 11px/1.5 system-ui,sans-serif}
`;
  function installCss(){let s=document.getElementById('smarty-insights-css');if(!s){s=addNode('style');s.id='smarty-insights-css';document.head.appendChild(s);}s.textContent=CSS;}
  function refreshDaily(){
    const panel=document.getElementById('home-finance-overview');if(!panel)return;
    document.getElementById('smarty-category-alert')?.remove();
    let strip=document.getElementById('smarty-insights-strip');if(!strip){strip=addNode('div');strip.id='smarty-insights-strip';panel.appendChild(strip);}
    const {budget,days,daily}=dailyAllowance();
    strip.replaceChildren();const info=addNode('div','smarty-daily-info');
    info.append(addNode('span','smarty-daily-label',budget>0?`${t('daily')} · ${days} ${t('days')}`:t('available')),
                addNode('strong','smarty-daily-val',budget>0?money(daily):'—'));
    strip.appendChild(info);
    panel.style.setProperty('grid-template-rows','auto auto auto auto auto auto','important');
    strip.style.setProperty('grid-row','6','important');
  }
  // La app genera filtros e iconos en el workflow Android.
  // Una copia temporal traduce únicamente categorías persistidas durante el render;
  // NO cambia Data.store ni UI.categories ni el gráfico del APK.
  let depth=0;
  function projectForRender(fn){
    const d=data();if(!d?.store||!Array.isArray(d.store.expenses)||depth)return fn();
    depth++;const original=d.store.expenses;
    d.store.expenses=original.map(e=>{
      const key=keyOf(e.category);
      if(!IDS.includes(key))return e; // categorías desconocidas: conservar literalmente
      const translated=label(key);
      return translated===e.category?e:{...e,category:translated};
    });
    try{return fn();}finally{d.store.expenses=original;depth--;}
  }
  function parseAmount(x){
    const s=String(x||'').trim().replace(/\s/g,'');if(!s)return 0;
    if(!/^\d[\d.,]*$/.test(s))return NaN;
    const comma=s.lastIndexOf(','),dot=s.lastIndexOf('.');let v=s;
    if(comma>dot)v=s.replace(/\./g,'').replace(',','.');
    else if(comma!==-1)v=s.replace(/,/g,'');
    else if(/^\d{1,3}(?:\.\d{3})+$/.test(s))v=s.replace(/\./g,'');
    const n=Number(v);return Number.isFinite(n)&&n>=0?n:NaN;
  }
  function capCard(key){
    const container=document.getElementById('expenses-history-list');if(!container)return;
    const summary=capStatus(key),card=addNode('section');card.id='smarty-category-cap-detail';
    card.appendChild(addNode('div','sc-title',`${label(key)} · ${t('limit')}`));
    const line=addNode('div','sc-stat');line.append(addNode('span','',`${t('spent')}: ${money(summary.spent)}`),addNode('strong','',summary.cap>0?money(summary.cap):'—'));card.appendChild(line);
    if(summary.cap>0){
      const track=addNode('div','sc-track'),fill=addNode('div','sc-fill'+(summary.level===2?' sc-over':summary.level===1?' sc-near':''));
      fill.style.width=`${Math.min(100,Math.max(0,summary.pct))}%`;track.appendChild(fill);card.appendChild(track);
      card.appendChild(addNode('div','sc-status'+(summary.level===2?' sc-over':summary.level===1?' sc-near':''),`${Math.round(summary.pct)}% · ${t(summary.level===2?'over':summary.level===1?'near':'safe')}`));
    }
    const row=addNode('div','sc-edit'),input=addNode('input'),save=addNode('button','',t('save'));
    input.type='text';input.inputMode='decimal';input.value=summary.cap>0?String(summary.cap).replace('.',','):'';
    save.type='button';
    const persist=async()=>{
      const v=parseAmount(input.value);if(!Number.isFinite(v)){ui()?.showSnackbar?.(t('invalid'));return;}
      saveCap(key,v);ui()?.showSnackbar?.(t('saved'));fin().renderExpensesHistory();checkCaps();
      if(v>0){const plugin=window.Capacitor?.Plugins?.LocalNotifications;
        if(plugin){try{const p=await plugin.checkPermissions();if(p.display!=='granted')await plugin.requestPermissions();}catch(_){}}
      }
    };
    save.addEventListener('click',persist);input.addEventListener('keydown',e=>{if(e.key==='Enter')void persist();});row.append(input,save);card.appendChild(row);
    if(summary.cap>0){const clear=addNode('button','sc-remove',t('clear'));clear.type='button';clear.addEventListener('click',()=>{saveCap(key,0);fin().renderExpensesHistory();});card.appendChild(clear);}
    const filter=container.querySelector('.filter-scroll-container');const parent=filter?.parentElement;
    if(parent)parent.insertAdjacentElement('afterend',card);else container.appendChild(card);
  }
  let averageWindow=3;
  function averagesModal(){
    let modal=document.getElementById('smarty-averages-modal');if(modal)return modal;
    modal=addNode('div');modal.id='smarty-averages-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    const sheet=addNode('div','sc-sheet'),head=addNode('div','sc-head'),content=addNode('div','sc-content');
    head.appendChild(addNode('strong','',t('avg')));
    const close=addNode('button','sc-close','×');close.type='button';close.addEventListener('click',()=>modal.classList.remove('sc-open'));head.appendChild(close);
    sheet.append(head,content);modal.appendChild(sheet);modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('sc-open');});
    document.body.appendChild(modal);return modal;
  }
  function renderAverages(){
    const modal=averagesModal(),content=modal.querySelector('.sc-content');content.replaceChildren();
    modal.querySelector('.sc-head strong').textContent=t('avg');
    const tabs=addNode('div','sc-period');
    for(const n of [3,6,12]){const b=addNode('button','',`${n} ${t('months')}`);b.type='button';b.setAttribute('aria-pressed',String(averageWindow===n));b.addEventListener('click',()=>{averageWindow=n;renderAverages();});tabs.appendChild(b);}content.appendChild(tabs);
    const m=averages(averageWindow);if(!m.months){content.appendChild(addNode('p','sc-note',t('empty')));return;}
    const summary=addNode('div','sc-summary');summary.append(addNode('small','',`${t('monthly')} · ${m.months} ${t('months')}`),addNode('strong','',money(m.average)));content.appendChild(summary);
    content.appendChild(addNode('h3','',t('perCategory')));
    for(const [key,value] of [...m.byCategory].sort((a,b)=>b[1]-a[1])){const row=addNode('div','sc-avg-row');row.append(addNode('span','',label(key)),addNode('strong','',money(value)));content.appendChild(row);}
  }
  function openAverages(){const modal=averagesModal();renderAverages();modal.classList.add('sc-open');modal.querySelector('.sc-close').focus();}
  function enhanceHistory(){
    const container=document.getElementById('expenses-history-list');if(!container)return;
    // La actualización rápida puede ejecutarse encima del parche previo:
    // nunca duplicar el botón de promedios ni el panel de topes.
    container.querySelector('#smarty-finance-toolbar')?.remove();
    container.querySelector('#smarty-category-cap-detail')?.remove();
    const toolbar=addNode('div');toolbar.id='smarty-finance-toolbar';const button=addNode('button','',t('avg')+' ›');button.type='button';button.addEventListener('click',openAverages);toolbar.appendChild(button);
    const filter=container.querySelector('.filter-scroll-container');
    if(filter?.parentElement)filter.parentElement.insertAdjacentElement('beforebegin',toolbar);else container.prepend(toolbar);
    const key=fin()?.selectedCategoryFilter;
    if(key && key!=='ALL')capCard(key);
  }
  function installFinances(){
    const f=fin(),u=ui();if(!f||!u)return;
    // El APK redefine Finance.renderExpensesHistory() y UI.renderBudgetChart()
    // al dispararse window.load. Nunca depender de un flag global: verificar
    // cada metodo y reengancharlo si el APK lo ha sustituido.
    // No modificar UI.categories, UI.categoryIcon ni Finance.renderFilterChips.
    f.__smartySafeCategories13=true;
    const mark='__smartySpendingInsights13';
    if(typeof f.renderExpensesHistory==='function' && !f.renderExpensesHistory[mark]){
      const originalHistory=f.renderExpensesHistory;
      const wrappedHistory=function(...args){
        let result;
        try{result=projectForRender(()=>originalHistory.apply(this,args));}
        finally{try{enhanceHistory();}catch(e){console.warn('[Smarty history]',e);}}
        return result;
      };
      wrappedHistory[mark]=true;
      f.renderExpensesHistory=wrappedHistory;
    }
    if(typeof f.renderHomeWidgets==='function' && !f.renderHomeWidgets[mark]){
      const originalHome=f.renderHomeWidgets;
      const wrappedHome=function(...args){return projectForRender(()=>originalHome.apply(this,args));};
      wrappedHome[mark]=true;
      f.renderHomeWidgets=wrappedHome;
    }
    if(typeof u.renderBudgetChart==='function' && !u.renderBudgetChart[mark]){
      const originalBudget=u.renderBudgetChart;
      const wrappedBudget=function(...args){
        const result=originalBudget.apply(this,args);
        try{refreshDaily();checkCaps();}catch(e){console.warn('[Smarty limits]',e);}
        return result;
      };
      wrappedBudget[mark]=true;
      u.renderBudgetChart=wrappedBudget;
    }
    try{refreshDaily();checkCaps();}catch(e){console.warn('[Smarty insights install]',e);}
    // Mostrar los controles también si el usuario actualiza con el historial ya abierto.
    try{enhanceHistory();}catch(e){console.warn('[Smarty insights view]',e);}
    document.getElementById('smarty-insights-modal')?.remove();
  }
  async function localNotice(key,p,level,message){
    const plugin=window.Capacitor?.Plugins?.LocalNotifications;if(!plugin)return;
    try{const check=await plugin.checkPermissions();if(check.display!=='granted')return;
      let id=750000000;for(const c of `${key}${p}${level}`)id=(id*31+c.charCodeAt(0))%1000000000;
      await plugin.schedule({notifications:[{id:Math.max(1000000,Math.floor(id)),title:t('alert'),body:message,schedule:{at:new Date(Date.now()+1000)}}]});
    }catch(e){console.warn('[Smarty notice]',e);}
  }
  let checking=false;
  function checkCaps(now=new Date()){
    if(checking||!data()?.store?.settings)return;checking=true;
    try{
      const caps=readCaps(),totals=monthTotals(now.getFullYear(),now.getMonth(),now);
      const settings=data().store.settings;settings.categoryCapNoticeState=settings.categoryCapNoticeState||{};
      for(const [key,cap] of Object.entries(caps)){
        const s=capStatus(key,totals),id=`${period(now)}:${key}`,previous=Number(settings.categoryCapNoticeState[id])||0;
        if(s.level>previous){settings.categoryCapNoticeState[id]=s.level;
          const message=`${label(key)}: ${Math.round(s.pct)}% · ${money(s.spent)} / ${money(cap)}`;
          ui()?.showSnackbar?.(message);void localNotice(key,period(now),s.level,message);data().save();}
        else if(s.level<previous){if(s.level===0)delete settings.categoryCapNoticeState[id];else settings.categoryCapNoticeState[id]=s.level;data().save();}
      }
    }finally{checking=false;}
  }
  window.SmartySpendingInsights={version:VERSION,keyOf,label,monthTotals,averages,dailyAllowance,readCaps,capStatus,checkCaps,openAverages};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{installCss();installFinances();},{once:true});
  else{installCss();installFinances();}
  window.addEventListener('load',()=>{installCss();installFinances();},{once:true});
  setTimeout(()=>{installCss();installFinances();},500);
})();
