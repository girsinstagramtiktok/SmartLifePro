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
    if(root.SmartyBrandAssets?.bankLogo)return root.SmartyBrandAssets.bankLogo(b,b.name);
    return `<span class="sw-banklogo sw-logo-${esc(b.id)}"><span class="sw-banklogo-fallback">${esc(b.mark)}</span></span>`;
  }
  const kind=(type,entry)=>type==='card'?tx('Crédito','Crédito','Credit'):entry?.type==='cash'?tx('Efectivo','Dinheiro','Cash'):entry?.type==='wallet'?tx('Billetera','Carteira','Wallet'):tx('Cuenta · débito','Conta · débito','Account · debit');
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
  // Una institución puede ofrecer simultáneamente una cuenta de débito y crédito.
  // Agrupamos por marca conocida SOLO en Inicio; cada producto y saldo mantiene su ID.
  function homeItems(st){
    const groups=[];
    for(const item of allItems(st)){
      const b=brand(item.entry);
      const key=(b.id!=='other'&&b.id!=='cash')?`bank:${b.id}`:`${item.type}:${item.entry.id}`;
      let g=groups.find(group=>group.key===key);
      if(!g){g={key,brand:b,items:[]};groups.push(g)}
      g.items.push(item);
    }
    return groups.slice(0,6);
  }
  function renderHome(){
    const host=$('bento-wallet-items');if(!host)return;
    const st=getState();if(!st)return;
    const h=$('bento-wallet-title'),all=$('bento-wallet-see-all');
    if(h)h.textContent=tx('Mis bancos y tarjetas','Meus bancos e cartões','My banks and cards');
    if(all)all.textContent=tx('Ver todas ↗','Ver todos ↗','View all ↗');
    const groups=homeItems(st);
    if(!groups.length){host.innerHTML=`<button type="button" class="sw-home-empty" data-sw-all>${tx('Añade una cuenta o tarjeta para verla aquí','Adicione uma conta ou cartão para ver aqui','Add an account or card to see it here')} <span aria-hidden="true">＋</span></button>`;return;}
    host.innerHTML=groups.map(g=>{
      const b=g.brand,account=g.items.some(i=>i.type==='account'),credit=g.items.some(i=>i.type==='card');
      const badges=[account?tx('Cuenta','Conta','Account'):null,credit?tx('Crédito','Crédito','Credit'):null].filter(Boolean);
      const selector=g.key.startsWith('bank:')?`data-sw-bank="${esc(b.id)}"`:`data-sw-open="${g.items[0].type}:${esc(g.items[0].entry.id)}"`;
      const name=g.key.startsWith('bank:')?b.name:g.items[0].entry.name;
      return `<button type="button" class="sw-home-card" ${selector} style="${style(b)}" aria-label="${esc(name)} · ${badges.join(' + ')}. ${tx('Abrir detalles','Abrir detalhes','Open details')}">
       <span class="sw-home-card-top">${logo(b)}<span class="sw-home-chip-row">${badges.map(label=>`<span class="sw-home-card-type">${label}</span>`).join('')}</span></span>
       <span class="sw-home-card-bottom"><strong>${esc(name)}</strong><span aria-hidden="true">↗</span></span>
      </button>`;
    }).join('');
  }
  function openBank(bankId){
    const st=getState();if(!st)return;
    const items=allItems(st).filter(x=>brand(x.entry).id===bankId);
    if(!items.length)return navigateAll();
    if(items.length===1)return openItem(items[0].type,items[0].entry.id);
    const b=brand(items[0].entry),hasDebit=items.some(x=>x.type==='account'),hasCredit=items.some(x=>x.type==='card');
    $('sw-detail-backdrop')?.remove();
    const wrapper=document.createElement('div');wrapper.id='sw-detail-backdrop';wrapper.className='sw-detail-backdrop';
    const rows=items.map(({type,entry})=>{
      const credit=type==='card',label=credit?tx('Tarjeta de crédito','Cartão de crédito','Credit card'):tx('Cuenta / débito','Conta / débito','Account / debit');
      const amount=credit?C().cardAvailable(st,entry.id):C().accountBalance(st,entry.id);
      return `<button type="button" class="sw-bank-product" data-sw-product="${type}:${esc(entry.id)}"><span><small>${label}</small><strong>${esc(entry.name)}</strong><em>${credit?tx('Límite disponible','Limite disponível','Available limit'):tx('Saldo disponible','Saldo disponível','Available balance')}</em></span><strong>${money(amount)}</strong><span class="sw-bank-product-arrow">›</span></button>`;
    }).join('');
    wrapper.innerHTML=`<section class="sw-detail-sheet sw-bank-sheet" role="dialog" aria-modal="true" aria-label="${esc(b.name)}">
      <button class="sw-detail-close" data-sw-close aria-label="${tx('Cerrar','Fechar','Close')}">×</button>
      <div class="sw-detail-card" style="${style(b)}"><div class="sw-detail-bank">${logo(b)}<span><strong>${esc(b.name)}</strong><small>${tx('Tus productos, separados por tipo','Seus produtos, separados por tipo','Your products, separated by type')}</small></span></div><strong class="sw-bank-summary-title">${hasDebit&&hasCredit?tx('Cuenta y crédito','Conta e crédito','Debit and credit'):hasDebit?tx('Cuentas de débito','Contas de débito','Debit accounts'):tx('Tarjetas de crédito','Cartões de crédito','Credit cards')}</strong><small>${tx('El saldo de débito no incluye el límite de crédito','O saldo de débito não inclui o limite de crédito','Debit balance never includes the credit limit')}</small></div>
      <div class="sw-bank-product-list">${rows}</div>
      <div class="sw-detail-actions">${!hasDebit?`<button type="button" data-sw-add-account="${esc(items[0].entry.id)}">${tx('+ Cuenta de débito','+ Conta de débito','+ Debit account')}</button>`:''}${!hasCredit?`<button type="button" data-sw-add-card="${esc(items[0].entry.id)}">${tx('+ Tarjeta de crédito','+ Cartão de crédito','+ Credit card')}</button>`:''}</div>
      <p class="sw-detail-footnote">${tx('Saldos registrados en SmartLifePro; no conectados a tu banco.','Saldos registrados no SmartLifePro; não conectados ao banco.','Balances recorded in SmartLifePro, not connected to your bank.')}</p>
    </section>`;
    document.body.appendChild(wrapper);
    wrapper.addEventListener('click',e=>{
      if(e.target===wrapper||e.target.closest('[data-sw-close]')){wrapper.remove();return;}
      const product=e.target.closest('[data-sw-product]');
      if(product){const [type,id]=product.dataset.swProduct.split(':');wrapper.remove();openItem(type,id);return;}
      const addA=e.target.closest('[data-sw-add-account]');if(addA){wrapper.remove();root.SmartyMoneyUI?.addAccountForCard?.(addA.dataset.swAddAccount);return;}
      const addC=e.target.closest('[data-sw-add-card]');if(addC){wrapper.remove();root.SmartyMoneyUI?.addCardForAccount?.(addC.dataset.swAddCard);}
    });
    wrapper.querySelector('[data-sw-close]')?.focus();
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
    const counterparts=(b.id==='other'||b.id==='cash')?[]:(credit?st.accounts.map(x=>({type:'account',entry:x})):st.cards.map(x=>({type:'card',entry:x}))).filter(x=>brand(x.entry).id===b.id);
    const relatedActions=counterparts.length?`<button type="button" data-sw-other="${counterparts[0].type}:${esc(counterparts[0].entry.id)}">${credit?tx('Ver cuenta / débito','Ver conta / débito','View debit account'):tx('Ver crédito','Ver crédito','View credit')}</button>`:
      b.id!=='other'&&b.id!=='cash'?`<button type="button" ${credit?`data-sw-add-account="${esc(id)}"`:`data-sw-add-card="${esc(id)}"`}>${credit?tx('+ Añadir cuenta / débito','+ Adicionar conta / débito','+ Add debit account'):tx('+ Añadir crédito','+ Adicionar crédito','+ Add credit')}</button>`:'';
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
      ${details}<div class="sw-detail-actions"><button type="button" data-sw-edit="${esc(id)}">${tx('Editar datos','Editar dados','Edit details')}</button>${credit?`<button type="button" data-money-action="pay:${esc(id)}">${tx('Pagar factura','Pagar fatura','Pay bill')}</button>`:`<button type="button" data-money-action="adjust:${esc(id)}">${tx('Ajustar saldo','Ajustar saldo','Adjust balance')}</button><button type="button" data-money-action="transfer">${tx('Transferir','Transferir','Transfer')}</button>`}${relatedActions}</div>
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
      const other=e.target.closest('[data-sw-other]');if(other){const [type,otherId]=other.dataset.swOther.split(':');wrapper.remove();openItem(type,otherId);return;}
      const addAccount=e.target.closest('[data-sw-add-account]');if(addAccount){wrapper.remove();root.SmartyMoneyUI?.addAccountForCard?.(id);return;}
      const addCard=e.target.closest('[data-sw-add-card]');if(addCard){wrapper.remove();root.SmartyMoneyUI?.addCardForAccount?.(id);return;}
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
      const bankCard=e.target.closest('[data-sw-bank]');if(bankCard){openBank(bankCard.dataset.swBank);return;}
      const card=e.target.closest('[data-sw-open]');if(card){const raw=card.dataset.swOpen||'',idx=raw.indexOf(':');if(idx>0)openItem(raw.slice(0,idx),raw.slice(idx+1));return;}
      if(e.target.closest('[data-sw-all]'))navigateAll();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')$('sw-detail-backdrop')?.remove()});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render()});
    root.addEventListener('focus',render);root.addEventListener('load',()=>{installHooksOnLoad();render()},{once:true});
    render();
  }
  root.SmartyWallet={brand,logo,financeCards,renderHome,render,openItem,openBank,homeItems,navigateAll,advisorContext};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(window);
