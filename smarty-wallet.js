/* SmartLifePro — wallet visual, navegación y contexto de Smarty (solo lectura).
 * No toca la contabilidad ni crea movimientos. Los logos remotos tienen fallback local.
 */
(function(root){'use strict';
  const $=id=>document.getElementById(id);
  const C=()=>root.SmartyMoneyCore;
  const store=()=>typeof Data!=='undefined'&&Data.store?Data.store:null;
  const getState=()=>store()&&C()?C().state(store()):null;
  const lang=()=>store()?.settings?.lang||'es';
  const tx=(es,pt,en)=>({es,pt,en})[lang()]||es;
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money=c=>`${store()?.settings?.currency||'R$'} ${C().fromCents(c).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const brands=[
    {id:'nubank',test:/\bnubank\b|\bnu pagamentos\b|nubank\.com/,name:'Nubank',domain:'nubank.com.br',mark:'nu',background:'#7928c9',background2:'#5c25aa',fg:'#fff'},
    {id:'bb',test:/banco do brasil|\bbb\b|bb\.com\.br/,name:'Banco do Brasil',domain:'bb.com.br',mark:'BB',background:'#ffdb44',background2:'#f1c51b',fg:'#153da1'},
    {id:'inter',test:/banco inter|\binter\b|inter\.co/,name:'Inter',domain:'inter.co',mark:'inter',background:'#ff7b2b',background2:'#e65d15',fg:'#fff'},
    {id:'itau',test:/\bitau\b|itau\.com/,name:'Itaú',domain:'itau.com.br',mark:'itaú',background:'#f17828',background2:'#df6216',fg:'#fff'},
    {id:'mercado',test:/mercado pago|mercadopago/,name:'Mercado Pago',domain:'mercadopago.com.br',mark:'MP',background:'#1984ec',background2:'#1062ca',fg:'#fff'},
    {id:'picpay',test:/picpay/,name:'PicPay',domain:'picpay.com',mark:'P',background:'#1b9a67',background2:'#108257',fg:'#fff'},
    {id:'caixa',test:/\bcaixa\b|caixa\.gov/,name:'Caixa',domain:'caixa.gov.br',mark:'Caixa',background:'#2278d7',background2:'#145cb3',fg:'#fff'},
    {id:'santander',test:/santander/,name:'Santander',domain:'santander.com.br',mark:'S',background:'#e83e3a',background2:'#bf2c31',fg:'#fff'},
    {id:'bradesco',test:/bradesco/,name:'Bradesco',domain:'bradesco.com.br',mark:'B',background:'#c93442',background2:'#aa2639',fg:'#fff'},
    {id:'c6',test:/\bc6\b|c6bank/,name:'C6',domain:'c6bank.com.br',mark:'C6',background:'#303541',background2:'#1b212c',fg:'#fff'}
  ];
  function brand(entry){
    const search=normalize(`${entry?.name||''} ${entry?.bankDomain||''}`);
    const known=brands.find(x=>x.test.test(search));
    if(known)return known;
    if(entry?.type==='cash')return {id:'cash',name:'Efectivo',mark:'$',domain:'',background:'#175a4d',background2:'#103d35',fg:'#fff'};
    return {id:'other',name:'Cuenta',mark:String(entry?.name||'?').slice(0,2).toUpperCase(),domain:'',background:'#435f73',background2:'#273f50',fg:'#fff'};
  }
  function style(b){return `--sw-a:${b.background};--sw-b:${b.background2};--sw-fg:${b.fg}`}
  function logo(b){
    const word=esc(b.mark);
    const base=`<span class="sw-banklogo sw-logo-${b.id}" aria-hidden="true"><span class="sw-banklogo-fallback">${word}</span>`;
    // Solo usa dominios reconocidos. El fallback permanece visible sin conexión.
    return base+(b.domain?`<img loading="lazy" alt="" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(b.domain)}&sz=128" onerror="this.remove()">`:'')+'</span>';
  }
  const kind=(type,entry)=>type==='card'?tx('Crédito','Crédito','Credit'):entry?.type==='cash'?tx('Efectivo','Dinheiro','Cash'):entry?.type==='wallet'?tx('Billetera','Carteira','Wallet'):tx('Cuenta','Conta','Account');
  function allItems(st){return [...st.accounts.map(x=>({type:'account',entry:x})),...st.cards.map(x=>({type:'card',entry:x}))]}
  function getItem(type,id){const st=getState();if(!st)return null;const list=type==='account'?st.accounts:type==='card'?st.cards:[];const entry=list.find(x=>x.id===id);return entry?{st,type,entry}:null}
  function financeCards(st,type){
    const items=type==='account'?st.accounts:st.cards;
    if(!items.length)return `<div class="sw-empty-inline">${type==='account'?tx('Añade tu primera cuenta para verla aquí.','Adicione sua primeira conta.','Add your first account.'):tx('Añade una tarjeta de crédito para verla aquí.','Adicione um cartão de crédito.','Add a credit card.')}</div>`;
    return `<div class="sw-finance-list">${items.map(entry=>{
      const b=brand(entry);const card=type==='card';const main=card?money(C().cardAvailable(st,entry.id)):money(C().accountBalance(st,entry.id));
      const summary=card?tx('Límite disponible','Limite disponível','Available limit'):tx('Saldo local','Saldo local','Local balance');
      return `<div class="sw-finance-item" style="${style(b)}"><button type="button" class="sw-finance-card" data-sw-open="${type}:${esc(entry.id)}" aria-label="${esc(entry.name)}: ${esc(tx('Ver detalles','Ver detalhes','View details'))}">
       <span class="sw-finance-top">${logo(b)}<span class="sw-finance-title"><strong>${esc(entry.name)}</strong><small>${kind(type,entry)}</small></span><span class="sw-finance-arrow" aria-hidden="true">↗</span></span>
       <span class="sw-finance-bottom"><span><small>${summary}</small><strong>${main}</strong></span><span class="sw-finance-more">${tx('Ver movimientos','Ver movimentos','View activity')}</span></span>
      </button><button type="button" class="sw-finance-direct-edit" data-sw-direct-edit="${type}:${esc(entry.id)}" aria-label="${tx('Editar','Editar','Edit')} ${esc(entry.name)}">${tx('Editar','Editar','Edit')} ✎</button></div>`;
    }).join('')}</div>`;
  }
  function homeItems(st){
    const first=[...st.accounts.slice(0,2).map(entry=>({type:'account',entry})),...st.cards.slice(0,2).map(entry=>({type:'card',entry}))];
    const extras=allItems(st).filter(x=>!first.some(a=>a.type===x.type&&a.entry.id===x.entry.id));
    return [...first,...extras].slice(0,6);
  }
  function renderHome(){
    const host=$('bento-wallet-items');if(!host)return;
    const st=getState();if(!st)return;
    const h=$('bento-wallet-title'),all=$('bento-wallet-see-all');
    if(h)h.textContent=tx('Mis tarjetas','Meus cartões','My cards');
    if(all)all.textContent=tx('Ver todas ↗','Ver todos ↗','View all ↗');
    const entries=homeItems(st);
    if(!entries.length){host.innerHTML=`<button type="button" class="sw-home-empty" data-sw-all>${tx('Añade una cuenta o tarjeta para verla aquí','Adicione uma conta ou cartão para ver aqui','Add an account or card to see it here')} <span aria-hidden="true">＋</span></button>`;return;}
    host.innerHTML=entries.map(({type,entry})=>{
      const b=brand(entry);
      return `<button type="button" class="sw-home-card" data-sw-open="${type}:${esc(entry.id)}" style="${style(b)}" aria-label="${esc(entry.name)} · ${kind(type,entry)}. ${tx('Abrir detalles','Abrir detalhes','Open details')}">
       <span class="sw-home-card-top">${logo(b)}<span class="sw-home-card-type">${kind(type,entry)}</span></span>
       <span class="sw-home-card-bottom"><strong>${esc(entry.name)}</strong><span aria-hidden="true">↗</span></span>
      </button>`;
    }).join('');
  }
  function navigateAll(){
    if(typeof Main==='undefined'||typeof Finance==='undefined')return;
    Main.router('finance');
    Finance.setTab('accounts');
    root.SmartyMoneyUI?.renderAll?.();
    const tab=$('fin-tab-accounts');tab?.scrollIntoView?.({behavior:'instant',block:'nearest',inline:'nearest'});
  }
  function activity(st,type,id){
    return st.movements.filter(m=>type==='account'?(m.accountId===id||m.toAccountId===id):m.cardId===id).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,12);
  }
  const readableKind=k=>({expense:tx('Compra','Compra','Purchase'),income:tx('Ingreso','Receita','Income'),'fixed-debit':tx('Gasto fijo','Despesa fixa','Fixed expense'),'fixed-card':tx('Gasto fijo','Despesa fixa','Fixed expense'),'card-charge':tx('Compra a crédito','Compra no crédito','Credit purchase'),'card-payment':tx('Pago de factura','Pagamento de fatura','Bill payment'),transfer:tx('Transferencia','Transferência','Transfer'), 'saving-deposit':tx('Depósito a ahorro','Depósito na poupança','Savings deposit'),'saving-withdrawal':tx('Retiro de ahorro','Resgate','Savings withdrawal'),'adjust-plus':tx('Ajuste de saldo','Ajuste de saldo','Balance adjustment'),'adjust-minus':tx('Ajuste de saldo','Ajuste de saldo','Balance adjustment'),'card-adjust-plus':tx('Ajuste de crédito','Ajuste de crédito','Credit adjustment'),'card-adjust-minus':tx('Ajuste de crédito','Ajuste de crédito','Credit adjustment')})[k]||k;
  function openItem(type,id){
    const found=getItem(type,id);if(!found)return navigateAll();
    navigateAll();
    const {st,entry}=found,b=brand(entry),credit=type==='card';
    const title=credit?tx('Límite disponible','Limite disponível','Available limit'):tx('Saldo estimado','Saldo estimado','Estimated balance');
    const primary=credit?C().cardAvailable(st,id):C().accountBalance(st,id);
    const details=credit?`<div class="sw-detail-stats"><div><small>${tx('Límite total','Limite total','Total limit')}</small><strong>${money(entry.limitCents)}</strong></div><div><small>${tx('Utilizado','Utilizado','Used')}</small><strong>${money(C().cardUsed(st,id))}</strong></div><div><small>${tx('Corte','Fechamento','Closing')}</small><strong>${entry.cutoffDay}</strong></div><div><small>${tx('Vencimiento','Vencimento','Due date')}</small><strong>${entry.dueDay}</strong></div></div>`:'';
    const rows=activity(st,type,id);
    const content=rows.length?rows.map(m=>{
      const negative=type==='account'?m.accountId===id&&!['income','adjust-plus','saving-withdrawal'].includes(m.kind)&&!(m.kind==='transfer'&&m.toAccountId===id):!['card-payment','card-adjust-minus'].includes(m.kind);
      return `<div class="sw-movement"><span><strong>${esc(m.note||readableKind(m.kind))}</strong><small>${esc(m.date)} · ${esc(readableKind(m.kind))}</small></span><strong class="${negative?'sw-out':'sw-in'}">${negative?'−':'+'}${money(m.amountCents)}</strong></div>`;
    }).join(''):`<p class="sw-no-movements">${tx('No hay movimientos registrados en SmartLifePro.','Ainda não há movimentações registradas.','No transactions registered yet.')}</p>`;
    const old=$('sw-detail-backdrop');old?.remove();
    const wrapper=document.createElement('div');wrapper.id='sw-detail-backdrop';wrapper.className='sw-detail-backdrop';
    wrapper.innerHTML=`<section class="sw-detail-sheet" role="dialog" aria-modal="true" aria-label="${esc(entry.name)}">
      <button class="sw-detail-close" data-sw-close aria-label="${tx('Cerrar','Fechar','Close')}">×</button>
      <div class="sw-detail-card" style="${style(b)}"><div class="sw-detail-bank">${logo(b)}<span><strong>${esc(entry.name)}</strong><small>${kind(type,entry)}</small></span></div><small>${title}</small><strong class="sw-detail-amount">${money(primary)}</strong></div>
      ${details}<div class="sw-detail-actions"><button type="button" data-sw-edit="${esc(id)}">${tx('Editar datos','Editar dados','Edit details')}</button>${credit?`<button type="button" data-money-action="pay:${esc(id)}">${tx('Pagar factura','Pagar fatura','Pay bill')}</button>`:`<button type="button" data-money-action="adjust:${esc(id)}">${tx('Ajustar saldo','Ajustar saldo','Adjust balance')}</button><button type="button" data-money-action="transfer">${tx('Transferir','Transferir','Transfer')}</button>`}</div>
      <h3>${tx('Movimientos recientes','Movimentações recentes','Recent activity')}</h3><div class="sw-detail-list">${rows.length?content:content}</div>
      <p class="sw-detail-footnote">${tx('Saldos locales; no están sincronizados con el banco.','Saldos locais, sem conexão ao banco.','Local balances; not connected to your bank.')}</p>
    </section>`;
    document.body.appendChild(wrapper);
    wrapper.addEventListener('click',e=>{
      if(e.target===wrapper||e.target.closest('[data-sw-close]')){wrapper.remove();return;}
      if(e.target.closest('[data-sw-edit]')){
        e.preventDefault();e.stopPropagation();wrapper.remove();
        (credit?root.SmartyMoneyUI?.editCard:root.SmartyMoneyUI?.editAccount)?.(id);
        return;
      }
      if(e.target.closest('[data-money-action]'))wrapper.remove();
    });
    wrapper.querySelector('[data-sw-close]')?.focus();
  }
  function advisorContext(question=''){
    const st=getState();if(!st)return '';
    const q=normalize(question);
    if(!/(cuent|conta|account|banc|nubank|inter|picpay|tarjet|cartao|cartão|credit|credito|crédito|saldo|dinero|patrimonio|patrimônio|money|available|disponible|gasto de|pague|pagaste|ahorr|saving|poupanc|invest|rendim|limite|l[ií]mite|factura|fatura|ingres|receit|transfer|resumen|resumo|an[aá]lis|analys)/.test(q))return '';
    const readable=v=>money(v);
    const accounts=st.accounts.map(x=>`${x.name} (${kind('account',x)}): saldo local ${readable(C().accountBalance(st,x.id))}`);
    const cards=st.cards.map(x=>`${x.name}: límite total ${readable(x.limitCents)}, disponible ${readable(C().cardAvailable(st,x.id))}, usado ${readable(C().cardUsed(st,x.id))}, día de corte ${x.cutoffDay}, vencimiento ${x.dueDay}`);
    const savings=st.savings.map(x=>{const p=C().savingsProjection(x);return `${x.name}: saldo bruto estimado ${readable(p.grossCents)}, intereses estimados ${readable(p.interestCents)}`;});
    const incomes=st.incomes.map(x=>`${x.name}: esperado ${readable(x.amountCents)}; ${C().incomeReceived(st,x.id,C().period())?'recibido':'por confirmar'}`);
    const recent=/(movim|transfer|pag|gast|compra|history|histori|extrato|extracto)/.test(q)?st.movements.slice(-12).reverse().map(m=>`${m.date} ${readable(m.amountCents)} ${readableKind(m.kind)} (${m.note||'sin concepto'})`):[];
    return `\nCUENTAS Y TARJETAS MANUALES DE SMARTLIFEPRO (datos locales declarados, no saldos bancarios en tiempo real):\nCuentas: ${accounts.join(' | ')||'sin cuentas'}.\nTarjetas de crédito: ${cards.join(' | ')||'sin tarjetas'}.\nAhorros: ${savings.join(' | ')||'sin ahorros'}.\nIngresos configurados: ${incomes.join(' | ')||'sin ingresos'}.\n${recent.length?`Movimientos locales recientes: ${recent.join(' | ')}.`:''}\nNo confundas límites de crédito con dinero disponible, movimientos internos con gastos, ni estimaciones con saldos confirmados.`;
  }
  function render(){renderHome()}
  function installHooksOnLoad(){if(typeof UI!=='undefined'&&typeof UI.renderBudgetChart==='function'&&!UI.renderBudgetChart.__swWrapped){const original=UI.renderBudgetChart;const wrapped=function(...args){const out=original.apply(this,args);render();return out};wrapped.__swWrapped=true;UI.renderBudgetChart=wrapped;}}
  function install(){
    if(!$('bento-wallet-items'))return;
    if(root.SmartyMoneyUI){const original=root.SmartyMoneyUI.render;if(typeof original==='function'&&!original.__swWrapped){const wrapped=function(...args){const res=original.apply(this,args);render();return res};wrapped.__swWrapped=true;root.SmartyMoneyUI.render=wrapped;}}
    installHooksOnLoad();
    document.addEventListener('click',e=>{
      const edit=e.target.closest('[data-sw-direct-edit]');
      if(edit){const [type,id]=(edit.dataset.swDirectEdit||'').split(':');(type==='card'?root.SmartyMoneyUI?.editCard:root.SmartyMoneyUI?.editAccount)?.(id);return;}
      const card=e.target.closest('[data-sw-open]');if(card){const raw=card.dataset.swOpen||'',idx=raw.indexOf(':');if(idx>0)openItem(raw.slice(0,idx),raw.slice(idx+1));return;}
      if(e.target.closest('[data-sw-all]'))navigateAll();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')$('sw-detail-backdrop')?.remove()});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render()});
    root.addEventListener('focus',render);root.addEventListener('load',()=>{installHooksOnLoad();render()},{once:true});
    render();
  }
  root.SmartyWallet={brand,logo,financeCards,renderHome,render,openItem,navigateAll,advisorContext};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(window);
