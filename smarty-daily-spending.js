/* SmartLifePro · Historial diario Bento
 * Los pagos programados se muestran separados de los gastos registrados.
 * No altera los datos persistidos ni los cálculos del presupuesto.
 */
(function () {
  'use strict';
  const labels = {
    es: { title:'Gasto por día',registered:'Gastado',planned:'Programado',total:'Registrado en el mes',average:'Promedio por día con gastos',day:'Día',detail:'Movimientos del día',none:'Sin gastos registrados',plannedNote:'Las suscripciones, cuotas y gastos futuros aparecen como programados, no como gastados.',all:'Ver todos' },
    pt: { title:'Gastos por dia',registered:'Gasto',planned:'Programado',total:'Registrado no mês',average:'Média por dia com gastos',day:'Dia',detail:'Lançamentos do dia',none:'Sem gastos registrados',plannedNote:'Assinaturas, parcelas e gastos futuros aparecem como programados, não como pagos.',all:'Ver todos' },
    en: { title:'Daily spending',registered:'Spent',planned:'Scheduled',total:'Recorded this month',average:'Average on spending days',day:'Day',detail:'Daily transactions',none:'No recorded expenses',plannedNote:'Subscriptions, installments and future expenses are scheduled, not recorded as spent.',all:'Show all' }
  };
  const validNum = v => { const n=Number(v); return Number.isFinite(n) && n>0 ? n : 0; };
  const when = v => { const d=new Date(v); return Number.isFinite(d.getTime()) ? d : null; };
  function monthMatch(d,y,m){ return d && d.getFullYear()===y && d.getMonth()===m-1; }
  function matches(category,filter,type) {
    if (!filter || filter==='ALL') return true;
    if (type==='sub') return filter==='cat_subs'||filter==='cat_bills';
    if (type==='list') return filter==='cat_market';
    if (category===filter) return true;
    try { return category===UI.t(filter); } catch (_) { return false; }
  }
  function compute(month, filter='ALL', store=null, today=new Date()){
    const [year,m] = String(month||'').split('-').map(Number);
    if(!Number.isInteger(year)||!Number.isInteger(m)||m<1||m>12)return null;
    const days=new Date(year,m,0).getDate();
    const records=Array.from({length:days},(_,i)=>({day:i+1,registered:0,planned:0,items:[]}));
    const data=store||(typeof Data!=='undefined'?Data.store:{});
    const add=(d,amount,type,name,category,scheduled)=>{
      const val=validNum(amount);
      if(!val||!monthMatch(d,year,m)||!matches(category,filter,type))return;
      const bucket=records[d.getDate()-1];
      const future=d.getTime()>new Date(today.getFullYear(),today.getMonth(),today.getDate(),23,59,59,999).getTime();
      const status=scheduled||future?'planned':'registered';
      bucket[status]+=val;
      bucket.items.push({amount:val,name:String(name||''),status,type});
    };
    for(const exp of data.expenses||[]){
      const d=when(exp.date);
      if(!d)continue;
      if(exp.isInstallment){
        const total=Number(exp.installments?.total)||0;
        const idx=(year-d.getFullYear())*12+(m-1-d.getMonth())+1;
        if(idx<1||idx>total)continue;
        const at=new Date(year,m-1,Math.min(d.getDate(),days));
        add(at,exp.amount,'expense',exp.desc,exp.category,true);
      }else add(d,exp.amount,'expense',exp.desc,exp.category,false);
    }
    for(const list of data.lists||[]){
      if(list.status==='completed')add(when(list.date),list.total,'list',list.name,'cat_market',false);
    }
    for(const sub of data.subscriptions||[]){
      const day=Math.min(Math.max(1,Number(sub.day)||1),days);
      add(new Date(year,m-1,day),sub.cost,'sub',sub.name,'cat_subs',true);
    }
    const totalRegistered=records.reduce((s,d)=>s+d.registered,0);
    const totalPlanned=records.reduce((s,d)=>s+d.planned,0);
    const active=records.filter(d=>d.registered>0).length;
    return {records,totalRegistered,totalPlanned,active,average:active?totalRegistered/active:0};
  }
  // Ninguna fecha seleccionada: el historial muestra todos sus movimientos.
  let selectedDay=0;
  let lastMonth='';
  function lang(){ const code=typeof Data!=='undefined'?Data.store?.settings?.lang:'es';return labels[code]||labels.es; }
  function money(x){try{return UI.formatMoney(x)}catch(_){return 'R$ '+x.toFixed(2)}}
  function dateInRow(row){
    // Ambos renderizadores de Historial (base y compilación Android)
    // colocan la fecha como segundo texto del segundo bloque de item-content-wrap.
    const content=row.querySelector('.item-content-wrap');
    return content?.children?.[1]?.children?.[1]?.textContent?.trim()||null;
  }
  function filterHistory(month){
    const container=document.getElementById('expenses-history-list');
    if(!container)return;
    const [y,m]=month.split('-').map(Number);
    const dayLabel=selectedDay?new Date(y,m-1,selectedDay).toLocaleDateString():null;
    container.querySelectorAll('.item-row').forEach(row=>{
      row.hidden=!!(dayLabel && dateInRow(row)!==dayLabel);
      // El historial asigna style.display inline; hidden por sí solo no lo oculta.
      row.style.display=row.hidden?'none':'flex';
    });
  }
  function render(){
    const root=document.getElementById('smarty-daily-spending');
    if(!root||typeof Finance==='undefined'||!Finance.selectedHistoryMonth)return;
    const month=Finance.selectedHistoryMonth;
    const results=compute(month,Finance.selectedCategoryFilter);
    if(!results)return;
    const changedMonth=lastMonth!==month;
    if(changedMonth){selectedDay=0;lastMonth=month;}
    const previousScroll=changedMonth?null:root.querySelector('.smarty-day-scroll')?.scrollLeft;
    const t=lang();
    root.textContent='';
    const head=document.createElement('div');head.className='smarty-day-head';
    const heading=document.createElement('h3');heading.textContent=t.title;head.appendChild(heading);
    if(selectedDay){
      const clear=document.createElement('button');clear.type='button';
      clear.className='smarty-day-clear';clear.textContent=t.all||'Todos';
      clear.onclick=()=>{selectedDay=0;render();};
      head.appendChild(clear);
    }
    root.appendChild(head);
    const strip=document.createElement('div');strip.className='smarty-day-scroll';
    strip.setAttribute('role','group');strip.setAttribute('aria-label',t.title);
    const [y,m]=month.split('-').map(Number);
    for(const day of results.records){
      const btn=document.createElement('button');btn.type='button';
      btn.className='smarty-day-chip'+(day.day===selectedDay?' active':'');
      btn.dataset.day=String(day.day);
      const active=day.day===selectedDay;
      btn.setAttribute('aria-pressed',String(active));
      btn.setAttribute('aria-label',`${t.day} ${day.day}: ${t.registered} ${money(day.registered)}`);
      const number=document.createElement('span');number.className='smarty-day-chip-date';
      number.textContent=`${String(day.day).padStart(2,'0')}/${String(m).padStart(2,'0')}`;
      const amount=document.createElement('strong');amount.className='smarty-day-chip-amount';
      amount.textContent=money(day.registered);
      if(!day.registered)btn.classList.add('is-zero');
      btn.append(number,amount);
      btn.onclick=()=>{selectedDay=active?0:day.day;render();};
      strip.appendChild(btn);
    }
    root.appendChild(strip);
    if(previousScroll!==null&&previousScroll!==undefined){
      strip.scrollLeft=previousScroll;
    }else if(changedMonth){
      const now=new Date();
      const target=now.getFullYear()===y&&now.getMonth()+1===m ? now.getDate() : results.records.length;
      // Desplazar una sola vez al día relevante, sin animaciones de carga.
      const selected=strip.querySelector(`[data-day="${target}"]`);
      if(selected)strip.scrollLeft=Math.max(0,selected.offsetLeft-strip.offsetLeft-strip.clientWidth/2+selected.offsetWidth/2);
    }
    filterHistory(month);
  }
  // El APK sustituye Finance.renderExpensesHistory() cuando termina de cargar.
  // Marcar el MÉTODO envoltorio y no el objeto Finance permite volver a conectar
  // el panel después de esa sustitución, sin crear envoltorios duplicados.
  const wrappedMark='__smartyDailySpendingWrappedV2';
  function install(){
    if(typeof Finance==='undefined'||typeof Finance.renderExpensesHistory!=='function')return false;
    const original=Finance.renderExpensesHistory;
    if(original[wrappedMark])return false;
    const wrapped=function(...args){
      const result=original.apply(this,args);
      const container=document.getElementById('expenses-history-list');
      if(!container||!Finance.selectedHistoryMonth)return result;
      // El historial se genera de nuevo por completo en cada cambio de mes/filtro.
      // La sección debe añadirse después de que haya terminado el render base.
      container.querySelector('#smarty-daily-spending')?.remove();
      const panel=document.createElement('section');
      panel.id='smarty-daily-spending';panel.className='glass-card';
      const selector=container.firstElementChild;
      if(selector?.nextSibling)container.insertBefore(panel,selector.nextSibling);
      else container.appendChild(panel);
      try{render();}catch(error){console.warn('[Smarty gasto diario] No se pudo dibujar:',error);}
      return result;
    };
    wrapped[wrappedMark]=true;
    Finance.renderExpensesHistory=wrapped;
    return true;
  }
  function reinstall(){
    const changed=install();
    if(!changed)return;
    const history=document.getElementById('finance-content-history');
    // Si el usuario está ya en Historial, refrescar ahora y no esperar al cambio de pestaña.
    if(history&&!history.classList?.contains('hidden')&&history.style.display!=='none'){
      try{Finance.renderExpensesHistory();}catch(e){console.warn('[Smarty gasto diario] Actualización de historial:',e);}
    }
  }
  window.SmartyDailySpending={compute,render,install};
  install();
  // Los complementos del APK reemplazan la función durante window.load;
  // el parche de promedios puede volver a envolverla después de 500 ms.
  if(typeof window.addEventListener==='function'){
    window.addEventListener('load',reinstall,{once:true});
    window.addEventListener('pageshow',reinstall);
    document.addEventListener?.('visibilitychange',()=>{
      if(document.visibilityState==='visible')reinstall();
    });
  }
  if(typeof setTimeout==='function')setTimeout(reinstall,700);
})();
