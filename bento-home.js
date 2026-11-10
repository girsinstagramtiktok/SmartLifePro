/* SmartLifePro · Bento Home 1.0 (diseño base, no OTA)
   UI solamente: no modifica ni migra gastos ni almacena valores financieros nuevos.
   Paleta se guarda en Data.store.settings.bentoPalette. */
(function () {
  'use strict';
  const defaults = {
    bg:'#e7f4ed', ink:'#143e36', muted:'#79928a', balance:'#fffdf8',
    percent:'#6536d0', spent:'#173f38', daily:'#ffcbb3', budget:'#d9eae0',
    chart:'#fffdfa', catA:'#d9eadf', catB:'#e5e0f8', catC:'#f5e9d7',catD:'#f6dfe3',
    nav:'#173f37',plus:'#e7ff78',accent:'#24b6a6'
  };
  const presets = {
    mint:{...defaults},
    stone:{...defaults,bg:'#f3f2ee',ink:'#24272e',muted:'#888a91',balance:'#ffffff',percent:'#3f61db',spent:'#222a36',daily:'#f3cfbc',budget:'#e4e5e8',nav:'#1d2635',plus:'#d9f59e',accent:'#3f61db',chart:'#ffffff'},
    violet:{...defaults,bg:'#f2ecf8',ink:'#2b2340',muted:'#897f96',percent:'#7553cf',spent:'#382655',daily:'#f6d1dc',nav:'#30234b',plus:'#dff8bd',accent:'#7553cf',budget:'#e6ddf2',catA:'#e6ddf2',catB:'#dfe5ff'},
    night:{...defaults,bg:'#121d21',ink:'#e8f8f1',muted:'#9eafa9',balance:'#2c3635',percent:'#6c46db',spent:'#1f5047',daily:'#ebbaa1',budget:'#2e5149',chart:'#253534',catA:'#335b4d',catB:'#4c456c',catC:'#665140',catD:'#6c444d',nav:'#0b1518',plus:'#d9f479',accent:'#65d0bd'}
  };
  const labels={
    es:{headline:'Tu mes, de<br>un vistazo.',remaining:'Te queda por gastar',available:'Tu dinero disponible este mes',budget:'Presupuesto',used:'utilizado hasta hoy',spentMonth:'Gastaste este mes',today:'Hoy',daily:'Puedes gastar por día',days:'días restantes',totalBudget:'Presupuesto total',chartTitle:'Así va tu gasto',month:'Mes',week:'Semana',real:'Gasto real',ideal:'Ritmo ideal',categories:'Top categorías',seeAll:'Ver todas',ok:'Todo en orden',warning:'Vas cerca del límite',over:'Presupuesto excedido',empty:'Define tu presupuesto',fijos:'Fijos',market:'Supermercado',home:'Hogar',dining:'Delivery / salidas',title:'Personaliza los colores de Inicio',hint:'La distribución Bento siempre será la misma. Cambia los colores cuando quieras.',reset:'Restaurar colores de la imagen',mint:'Original menta',stone:'Gris y azul',violet:'Violeta',night:'Oscuro',colors:{bg:'Fondo',ink:'Texto',balance:'Disponible',percent:'Porcentaje',spent:'Gastado',daily:'Por día',budget:'Presupuesto total',chart:'Gráfico',nav:'Barra inferior',plus:'Botón +',accent:'Línea del gráfico',catA:'Categoría 1',catB:'Categoría 2',catC:'Categoría 3',catD:'Categoría 4'}},
    pt:{headline:'Seu mês, em<br>um olhar.',remaining:'Restante para gastar',available:'Seu dinheiro disponível neste mês',budget:'Orçamento',used:'utilizado até hoje',spentMonth:'Você gastou neste mês',today:'Hoje',daily:'Pode gastar por dia',days:'dias restantes',totalBudget:'Orçamento total',chartTitle:'Como vão seus gastos',month:'Mês',week:'Semana',real:'Gasto real',ideal:'Ritmo ideal',categories:'Principais categorias',seeAll:'Ver todas',ok:'Tudo em ordem',warning:'Perto do limite',over:'Orçamento excedido',empty:'Defina seu orçamento',fijos:'Fixos',market:'Supermercado',home:'Casa',dining:'Delivery / saídas',title:'Personalizar as cores do Início',hint:'O layout Bento permanece igual. Mude as cores quando quiser.',reset:'Restaurar as cores da imagem',mint:'Menta original',stone:'Cinza e azul',violet:'Violeta',night:'Escuro',colors:{bg:'Fundo',ink:'Texto',balance:'Disponível',percent:'Porcentagem',spent:'Gasto',daily:'Por dia',budget:'Orçamento total',chart:'Gráfico',nav:'Barra inferior',plus:'Botão +',accent:'Linha do gráfico',catA:'Categoria 1',catB:'Categoria 2',catC:'Categoria 3',catD:'Categoria 4'}},
    en:{headline:'Your month,<br>at a glance.',remaining:'Left to spend',available:'Your available money this month',budget:'Budget',used:'used so far',spentMonth:'You spent this month',today:'Today',daily:'You can spend per day',days:'days left',totalBudget:'Total budget',chartTitle:'Your spending trend',month:'Month',week:'Week',real:'Actual spent',ideal:'Ideal pace',categories:'Top categories',seeAll:'See all',ok:'All on track',warning:'Nearing the limit',over:'Over budget',empty:'Set a budget',fijos:'Fixed',market:'Groceries',home:'Home',dining:'Delivery / outings',title:'Personalize Home colors',hint:'The Bento layout remains unchanged. Change colors whenever you like.',reset:'Restore original image colors',mint:'Original mint',stone:'Gray and blue',violet:'Violet',night:'Dark',colors:{bg:'Background',ink:'Text',balance:'Available',percent:'Percentage',spent:'Spent',daily:'Per day',budget:'Total budget',chart:'Chart',nav:'Bottom navigation',plus:'Plus button',accent:'Chart line',catA:'Category 1',catB:'Category 2',catC:'Category 3',catD:'Category 4'}}
  };
  const keys={bg:'--b-bg',ink:'--b-ink',muted:'--b-muted',balance:'--b-balance',percent:'--b-percent',spent:'--b-spent',daily:'--b-daily',budget:'--b-budget',chart:'--b-chart',catA:'--b-cat-a',catB:'--b-cat-b',catC:'--b-cat-c',catD:'--b-cat-d',nav:'--b-nav',plus:'--b-plus',accent:'--b-accent'};
  const state={period:'month',installed:false};
  const $=id=>document.getElementById(id);
  const data=()=>typeof Data==='undefined'?null:Data;
  const lang=()=>['es','pt','en'].includes(data()?.store?.settings?.lang)?data().store.settings.lang:'es';
  const words=()=>labels[lang()];
  const number=v=>Number.isFinite(Number(v))?Number(v):0;
  const money=(value,digits=2)=>{
    const symbol=data()?.store?.settings?.currency||'R$';
    const locale={es:'es-ES',pt:'pt-BR',en:'en-US'}[lang()]||'es-ES';
    const n=number(value);const str=Math.abs(n).toLocaleString(symbol==='R$'?'pt-BR':locale,{minimumFractionDigits:digits,maximumFractionDigits:digits});
    return `${n<0?'−':''}${symbol}${str}`;
  };
  const validHex=s=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);
  const safeColors=raw=>Object.fromEntries(Object.keys(defaults).map(k=>[k,validHex(raw?.[k])?raw[k]:defaults[k]]));
  const stored=()=>data()?.store?.settings?.bentoPalette||null;
  const theme=()=>{const s=stored();if(s?.preset==='custom')return safeColors(s.colors);return {...(presets[s?.preset]||presets.mint)};};
  const contrast=c=>{const rgb=c.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.35?'#15372f':'#ffffff';};
  function applyColors(){
    const root=$('view-home'),app=$('app-root');if(!root||!app)return;
    const palette=theme();
    for(const target of [app,root]){
      for(const [k,css] of Object.entries(keys))target.style.setProperty(css,palette[k]);
    }
    root.style.setProperty('--b-balance-ink',contrast(palette.balance));
    root.style.setProperty('--b-percent-ink',contrast(palette.percent));
    root.style.setProperty('--b-spent-ink',contrast(palette.spent));
    root.style.setProperty('--b-daily-ink',contrast(palette.daily));
    app.style.setProperty('--b-nav-ink',contrast(palette.nav));
  }
  function setTheme(preset,colors){
    if(!data()?.store)return;
    data().store.settings=data().store.settings||{};
    data().store.settings.bentoPalette={preset,colors:colors||null};
    data().save();applyColors();renderThemeSettings();
  }
  function lastDay(y,m){return new Date(y,m+1,0).getDate();}
  function monthStart(date,y,m){return date&&date.getFullYear()===y&&date.getMonth()===m;}
  function stats(now=new Date()){
    const y=now.getFullYear(),m=now.getMonth(),today=now.getDate(),days=lastDay(y,m);
    const daily=new Array(days+1).fill(0),cats=new Map();let spentToday=0;
    const canon=raw=>window.SmartySpendingInsights?.keyOf?.(raw)||String(raw||'cat_other');
    const add=(dateDay,value,cat,postToday=false)=>{
      const amount=number(value);if(!Number.isFinite(amount)||amount<=0)return;
      const day=Math.max(1,Math.min(days,Math.floor(Number(dateDay)||1)));
      daily[day]+=amount;
      const k=canon(cat);cats.set(k,(cats.get(k)||0)+amount);
      if(postToday)spentToday+=amount;
    };
    for(const exp of data()?.store?.expenses||[]){
      const d=new Date(exp.date);if(!Number.isFinite(d.getTime()))continue;
      if(exp.isInstallment){const count=number(exp.installments?.total);const offset=(y-d.getFullYear())*12+m-d.getMonth();if(offset>=0&&offset<count)add(1,exp.amount,exp.category,d.getDate()===today);}
      else if(monthStart(d,y,m))add(d.getTime()>now.getTime()?1:d.getDate(),exp.amount,exp.category,d.getDate()===today&&d.getTime()<=now.getTime());
    }
    for(const l of data()?.store?.lists||[]){const d=new Date(l.date);if(l.status==='completed'&&monthStart(d,y,m))add(d.getDate(),l.total,'cat_market',d.getDate()===today);}
    for(const s of data()?.store?.subscriptions||[]){
      // El gasto fijo se reserva en el balance desde el día 1,
      // pero sólo se muestra como "Hoy" al vencer su día.
      const day=Math.max(1,Math.min(days,Number(s.day)||1));
      add(1,s.cost,'cat_subs',day===today);
    }
    const cumulative=[0];for(let i=1;i<=days;i++)cumulative[i]=cumulative[i-1]+daily[i];
    return {now,y,m,today,days,spentToday,cumulative,cats};
  }
  function translate(){
    const dict=words();
    for(const [id,text] of Object.entries({home:{es:'Inicio',pt:'Início',en:'Home'},lists:{es:'Actividad',pt:'Atividade',en:'Activity'},finance:{es:'Finanzas',pt:'Finanças',en:'Finance'},settings:{es:'Ajustes',pt:'Ajustes',en:'Settings'}})){const el=$('nav-'+id)?.querySelector('.bento-nav-label');if(el)el.textContent=text[lang()];}document.querySelectorAll('#view-home [data-bento-t]').forEach(el=>{
      const k=el.dataset.bentoT;if(dict[k])el.innerHTML=dict[k];
    });
  }
  function drawChart(st,spent,limit){
    const holder=$('bento-chart-plot');if(!holder)return;
    const begin=state.period==='week'?Math.max(1,st.today-6):1;
    const end=state.period==='week'?Math.min(st.days,begin+6):st.days;
    const max=Math.max(limit,spent,st.cumulative[st.today],1)*1.07;
    const xx=d=>15+(d-begin)/Math.max(1,end-begin)*315;
    const yy=v=>94-Math.max(0,Math.min(1,v/max))*88;
    const dots=[];
    for(let day=begin;day<=st.today;day++)dots.push([xx(day),yy(st.cumulative[day])]);
    if(!dots.length)dots.push([xx(begin),yy(0)]);
    const path=dots.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const idealStart=[xx(begin),yy(limit*begin/st.days)],idealEnd=[xx(end),yy(limit*end/st.days)];
    const last=dots[dots.length-1];
    const area=`${path} L${last[0].toFixed(1)} 96 L${dots[0][0].toFixed(1)} 96 Z`;
    const grid=[17,44,72,96].map(y=>`<line x1="15" y1="${y}" x2="330" y2="${y}" stroke="#d8e7e3" stroke-width=".8"/>`).join('');
    holder.innerHTML=`<svg viewBox="0 0 345 104" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><linearGradient id="bentoShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--b-accent)" stop-opacity=".32"/><stop offset="1" stop-color="var(--b-accent)" stop-opacity=".05"/></linearGradient></defs>${grid}<path d="M${idealStart[0]} ${idealStart[1]} L${idealEnd[0]} ${idealEnd[1]}" fill="none" stroke="#aaa2b9" stroke-dasharray="4 4" stroke-width="1.6"/><path d="${area}" fill="url(#bentoShade)"/><path class="bento-actual" d="${path}" fill="none" stroke="var(--b-accent)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="4" fill="var(--b-accent)" stroke="white" stroke-width="2"/></svg>`;
    const delta=spent-limit*st.today/st.days;
    const badge=$('bento-pace-badge');if(badge){badge.textContent=`${delta>0?'+ ':delta<0?'− ':''}${money(Math.abs(delta),0)} ↗`;badge.setAttribute('aria-label',delta>0?'Gasto por encima del ritmo ideal':'Gasto según el ritmo ideal');}
    for(const btn of document.querySelectorAll('[data-bento-period]'))btn.setAttribute('aria-pressed',String(btn.dataset.bentoPeriod===state.period));
  }
  const defaultCats=['cat_subs','cat_market','cat_bills','cat_dining'];
  function topCategories(st){
    const holder=$('bento-category-pills');if(!holder)return;
    const sums=new Map(st.cats);
    const sorted=[...sums.entries()].sort((a,b)=>b[1]-a[1]).map(([k,n])=>({k,n}));
    for(const k of defaultCats)if(!sorted.some(x=>x.k===k))sorted.push({k,n:0});
    const top=sorted.slice(0,4),total=[...sums.values()].reduce((s,v)=>s+v,0);
    const mapped={'cat_subs':'fijos','cat_market':'market','cat_bills':'home','cat_dining':'dining'};
    holder.replaceChildren();
    for(const item of top){
      const key=item.k,category=defaultCats.includes(key)?key:'cat_other';
      const id=key==='cat_subs'?'cat_subs':category;
      const label=mapped[key]?words()[mapped[key]]:(window.SmartySpendingInsights?.label?.(key)||String(key).replace(/^cat_/,'').replace(/^./,x=>x.toUpperCase()));
      const btn=document.createElement('button');btn.type='button';btn.className='bento-category-pill';
      btn.setAttribute('aria-label',`${label}: ${total>0?Math.round(item.n/total*100):0}%`);
      const left=document.createElement('span');left.className='bento-cat-left';
      const ico=document.createElement('span');ico.className='bento-cat-icon';
      // Reutilizar iconos originales; el workflow puede ampliar UI.categoryIcon.
      if(typeof UI!=='undefined'&&typeof UI.categoryIcon==='function')ico.innerHTML=UI.categoryIcon(id);
      const title=document.createElement('span');title.textContent=label;
      left.append(ico,title);
      const pct=document.createElement('strong');pct.textContent=`${total>0?Math.round(item.n/total*100):0}%`;
      btn.append(left,pct);btn.addEventListener('click',()=>Finance.openHomeCategory(key==='cat_subs'?'cat_subs':key));
      holder.append(btn);
    }
  }
  function render(){
    if(!data()?.store||!$('view-home'))return;
    applyColors();translate();
    const s=stats(),budget=number(data().store.budget?.limit),spent=number(Finance.calculateMonthlySpent()),rem=budget-spent;
    const percent=budget>0?Math.round(100*spent/budget):0;
    const left=s.days-s.today+1;
    const num=(id,str)=>{const el=$(id);if(el)el.textContent=str;};
    num('budget-remaining',money(rem));num('budget-spent',money(spent,0));
    num('budget-limit',money(budget));num('home-budget-percent',budget>0?`${percent}%`:'—');
    num('bento-spent-today',money(s.spentToday,0));num('bento-days',String(left));
    num('bento-daily-amount',budget>0?money(Math.max(0,rem)/left):'—');
    const dateLocale={es:'es-ES',pt:'pt-BR',en:'en-US'}[lang()];
    const month=new Intl.DateTimeFormat(dateLocale,{month:'long',year:'numeric'}).format(s.now);
    num('home-month-title',month.charAt(0).toLocaleUpperCase(dateLocale)+month.slice(1));
    num('home-budget-health',budget<=0?words().empty:spent>budget?words().over:percent>=85?words().warning:words().ok);
    drawChart(s,spent,budget);topCategories(s);
  }
  function renderThemeSettings(){
    const el=$('bento-theme-settings');if(!el)return;
    const dict=words(),s=stored(),current=s?.preset||'mint',palette=theme();
    el.replaceChildren();
    const h=document.createElement('h3');h.textContent=dict.title;const p=document.createElement('p');p.textContent=dict.hint;el.append(h,p);
    const btns=document.createElement('div');btns.className='bento-presets';
    for(const name of ['mint','stone','violet','night']){
      const b=document.createElement('button');b.type='button';b.className='bento-preset';b.textContent=dict[name];
      b.setAttribute('aria-pressed',String(current===name));b.addEventListener('click',()=>setTheme(name));btns.appendChild(b);
    }el.appendChild(btns);
    const fields=document.createElement('div');fields.className='bento-color-fields';
    for(const key of Object.keys(dict.colors)){
      const label=document.createElement('label');label.className='bento-color-field';
      const input=document.createElement('input');input.type='color';input.value=palette[key];input.setAttribute('aria-label',dict.colors[key]);
      input.addEventListener('input',()=>{const next={...theme(),[key]:input.value};applyPreview(next);});
      input.addEventListener('change',()=>{const next={...theme(),[key]:input.value};setTheme('custom',next);});
      const name=document.createElement('span');name.textContent=dict.colors[key];label.append(input,name);fields.appendChild(label);
    }el.appendChild(fields);
    const reset=document.createElement('button');reset.type='button';reset.className='bento-reset';reset.textContent=dict.reset;reset.addEventListener('click',()=>setTheme('mint'));el.appendChild(reset);
  }
  function applyPreview(c){
    const root=$('view-home'),app=$('app-root');if(!root||!app)return;
    for(const target of [root,app])for(const [k,css] of Object.entries(keys))target.style.setProperty(css,c[k]);
    for(const [key,value] of [['--b-balance-ink',c.balance],['--b-percent-ink',c.percent],['--b-spent-ink',c.spent],['--b-daily-ink',c.daily]])root.style.setProperty(key,contrast(value));
    app.style.setProperty('--b-nav-ink',contrast(c.nav));
  }
  function start(){
    if(state.installed)return;
    if(!$('view-home'))return;
    state.installed=true;
    window.SMARTY_BENTO_NATIVE_BASE=true;
    // Assistant cambia dinámicamente la imagen y registra un onclick propio.
    // Abrir una sola acción al pulsar Smarty, sin disparar consejo + chat juntos.
    $('mascot-img')?.addEventListener('click',e=>{e.stopPropagation();Assistant.openSmartyChat();},true);
    for(const id of ['home','lists','finance','settings']){const btn=$('nav-'+id);if(btn&&!btn.querySelector('.bento-nav-label')){const span=document.createElement('span');span.className='bento-nav-label';btn.appendChild(span);}}
    document.querySelectorAll('[data-bento-period]').forEach(btn=>btn.addEventListener('click',()=>{state.period=btn.dataset.bentoPeriod;render();}));
    const wrap=(obj,name,fn)=>{
      const original=obj?.[name];if(typeof original!=='function'||original.__bentoWrapped)return;
      const handler=function(...args){const answer=original.apply(this,args);try{fn();}catch(e){console.warn('[Bento]',e);}return answer;};
      handler.__bentoWrapped=true;obj[name]=handler;
    };
    if(typeof UI!=='undefined'){
      wrap(UI,'renderBudgetChart',render);
      wrap(UI,'refreshDOM',()=>{render();renderThemeSettings();});
    }
    applyColors();renderThemeSettings();
    // Reinicializar después de todas las extensiones inyectadas por el APK.
    window.addEventListener('load',()=>{if(typeof UI!=='undefined')wrap(UI,'renderBudgetChart',render);render();renderThemeSettings();requestAnimationFrame(()=>document.getElementById('smarty-prepaint')?.remove());},{once:true});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render();});
    render();
  }
  window.SmartyBentoHome={start,render,applyColors,renderThemeSettings,presets};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
