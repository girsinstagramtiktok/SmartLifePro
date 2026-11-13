/* SmartLifePro — nuevas pantallas financieras, desacopladas de Finance y su presupuesto. */
(function(){'use strict';
const C=window.SmartyMoneyCore; if(!C)return;
const Catalog=window.SmartyInvestmentCatalog;
const $=id=>document.getElementById(id);
const d=()=>typeof Data!=='undefined'?Data:null;
const s=()=>C.state(d().store);
const money=c=>{const n=C.fromCents(c),cur=d()?.store?.settings?.currency||'R$';return `${cur} ${n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`};
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const t=(es,pt,en)=>({es,pt,en}[d()?.store?.settings?.lang]||es);
const alertUser=msg=>typeof UI!=='undefined'&&UI.showSnackbar?UI.showSnackbar(msg):window.alert(msg);
const brandDomains={Nubank:'nubank.com.br',Itaú:'itau.com.br','Banco Inter':'inter.co','Banco do Brasil':'bb.com.br',Bradesco:'bradesco.com.br',Santander:'santander.com.br',Caixa:'caixa.gov.br','Mercado Pago':'mercadopago.com.br',PicPay:'picpay.com',C6:'c6bank.com.br',Otro:''};
const brandOptions=selected=>Object.entries(brandDomains).map(([k,v])=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(k)}</option>`).join('');
const options=(elements,selected='',empty='Seleccionar...')=>`<option value="">${esc(empty)}</option>`+elements.map(x=>`<option value="${esc(x.id)}" ${x.id===selected?'selected':''}>${esc(x.name)}</option>`).join('');
const sourceOptions=(selected='')=>`<option value="">${t('No asignar todavía','Não atribuir','Not assigned')}</option>`+s().accounts.map(x=>`<option value="account:${esc(x.id)}" ${selected===`account:${x.id}`?'selected':''}>${esc(x.name)}</option>`).join('')+s().cards.map(x=>`<option value="card:${esc(x.id)}" ${selected===`card:${x.id}`?'selected':''}>💳 ${esc(x.name)}</option>`).join('');
const parseSource=v=>{const m=/^(account|card):(sm_[a-z0-9_]+)$/.exec(v||'');return m?{type:m[1],id:m[2]}:null};
function logo(domain,name){const known=Object.values(brandDomains).includes(domain)&&domain;return `<span class="slp-bank-logo">${known?`<img loading="lazy" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64" alt="" onerror="this.remove()">`:''}<span>${esc((name||'?').slice(0,1).toUpperCase())}</span></span>`}
const bankPalette={
 'nubank.com.br':['#7d3df2','#5f2bcc','#efe9ff','#ffffff'],
 'inter.co':['#ff7a1a','#d95d00','#fff1e7','#ffffff'],
 'itau.com.br':['#0f3460','#173b73','#e9f0ff','#ffffff'],
 'mercadopago.com.br':['#1f86ff','#0c6add','#e7f2ff','#ffffff'],
 'picpay.com':['#1ea672','#117f55','#e9faf3','#ffffff'],
 'bb.com.br':['#ffd34d','#c9a227','#fff7dc','#173c33'],
 'bradesco.com.br':['#d33b49','#b72737','#ffe9ec','#ffffff'],
 'santander.com.br':['#ea4335','#c53022','#ffebe8','#ffffff'],
 'caixa.gov.br':['#1570ef','#085bcc','#e8f1ff','#ffffff'],
 'c6bank.com.br':['#2c2f35','#181b20','#eff1f4','#ffffff']
};
function walletStyle(domain,type,name=''){let c=bankPalette[domain];
 if(!c&&type==='cash')c=['#17463b','#13372f','#eaf5ef','#ffffff'];
 if(!c&&/poupan|ahorro|saving|caix/i.test(name))c=['#227d65','#1a5f4d','#e8f7f2','#ffffff'];
 if(!c)c=['#405a71','#314759','#eef3f8','#ffffff'];
 return `--slp-card-a:${c[0]};--slp-card-b:${c[1]};--slp-card-soft:${c[2]};--slp-card-ink:${c[3]}`;
}
function save(){d().save();renderAll();window.SmartyWallet?.render?.();if(typeof UI!=='undefined')UI.renderBudgetChart?.();}
function btn(text,action,cls='slp-quiet'){return `<button type="button" class="slp-action ${cls}" data-money-action="${esc(action)}">${esc(text)}</button>`}
function box(html){return `<div class="slp-money-tile">${html}</div>`}
const label=(title,value,cls='')=>`<div class="slp-money-pair ${cls}"><small>${esc(title)}</small><strong>${esc(value)}</strong></div>`;
function createTabs(){const menu=$('view-finance')?.querySelector('.segment-control');if(!menu)return;
for(const [key,title] of [['accounts',t('Cuentas','Contas','Accounts')],['savings',t('Ahorros','Poupanças','Savings')]]){
 if(!$(`fin-tab-${key}`)){const b=document.createElement('button');b.type='button';b.id=`fin-tab-${key}`;b.className='segment-btn';b.textContent=title;b.addEventListener('click',()=>{Finance.setTab(key);render()});menu.appendChild(b)}else $(`fin-tab-${key}`).textContent=title;
 if(!$(`finance-content-${key}`)){const el=document.createElement('div');el.id=`finance-content-${key}`;el.className='finance-tab-content hidden';el.style.display='none';menu.parentElement.appendChild(el)}
}menu.classList.add('slp-finance-tabs');}
function renderAccounts(){const container=$('finance-content-accounts');if(!container)return;const st=s(),balance=st.accounts.reduce((v,a)=>v+C.accountBalance(st,a.id),0),cards=st.cards.reduce((v,c)=>v+C.cardUsed(st,c.id),0);
let html=`<div class="slp-money-hero">${label(t('Saldo en cuentas','Saldo em contas','Account balances'),money(balance))}${label(t('Deuda en tarjetas','Dívida nos cartões','Card debt'),money(cards))}</div><div class="slp-money-actions">${btn(t('+ Cuenta','+ Conta','+ Account'),'account')}${btn(t('+ Tarjeta','+ Cartão','+ Card'),'card')}${btn(t('+ Ingreso','+ Receita','+ Income'),'income')}${btn(t('Transferir','Transferir','Transfer'),'transfer')}</div>`;
html+=`<h3 class="slp-money-heading">${t('Cuentas y efectivo','Contas e dinheiro','Accounts and cash')}</h3>`;
// Las tarjetas visuales quedan en un módulo independiente; la lógica sigue en SmartyMoneyCore.
html+=window.SmartyWallet?.financeCards(st,'account')||box(`<p>${t('Añade una cuenta para verla aquí','Adicione uma conta','Add an account')}</p>`);
html+=`<h3 class="slp-money-heading">${t('Tarjetas de crédito','Cartões de crédito','Credit cards')}</h3>`;
html+=window.SmartyWallet?.financeCards(st,'card')||box(`<p>${t('Añade una tarjeta de crédito','Adicione um cartão de crédito','Add a credit card')}</p>`);
html+=`<h3 class="slp-money-heading">${t('Ingresos esperados','Receitas previstas','Expected income')}</h3>`;
if(!st.incomes.length)html+=box(`<p>${t('Añade ingresos recurrentes o puntuales con fecha estimada.','Adicione receitas recorrentes com data prevista.','Add recurring income with expected dates.')}</p>`);
for(const i of st.incomes){const p=C.period(),received=C.incomeReceived(st,i.id,p);const win=C.expectedWindow(i,p,st.preferences.extraHolidays||[]),dates=win?win.start===win.end?win.end:`${win.start} – ${win.end}`:t('Variable','Variável','Variable');html+=box(`<div class="slp-money-top"><span class="slp-money-grow"><strong>${esc(i.name)}</strong><small>${esc(dates)} · ${received?t('Recibido','Recebido','Received'):t('Previsto, no sumado','Previsto, não somado','Expected, not credited')}</small></span><strong>${money(i.amountCents)}</strong></div>${received?'':btn(t('Confirmar ingreso','Confirmar receita','Confirm income'),'confirm:'+i.id)}`)}
html+=btn(t('Añadir feriados locales','Adicionar feriados locais','Additional local holidays'),'holidays');
html+=`<h3 class="slp-money-heading">${t('Origen de los gastos fijos','Origem das despesas fixas','Fixed expense source')}</h3><p class="slp-money-help">${t('Solo afecta los saldos de cuentas o tarjetas. El presupuesto existente no se recalcula.','Só atualiza os saldos. O orçamento não é recalculado.','Only updates balances. The existing budget is unchanged.')}</p>`;
for(const sub of d().store.subscriptions||[]){const cur=st.fixedSources[sub.id],selected=cur?`${cur.sourceType}:${cur.sourceId}`:'';html+=box(`<div class="slp-money-top"><span class="slp-money-grow"><strong>${esc(sub.name)}</strong><small>${money(C.cents(sub.cost))} · ${t('día','dia','day')} ${Number(sub.day)}</small></span></div><select class="slp-select" data-fixed-sub="${esc(sub.id)}">${sourceOptions(selected)}</select>`)}
container.innerHTML=html;
container.querySelectorAll('select[data-fixed-sub]').forEach(sel=>sel.addEventListener('change',()=>{const sub=d().store.subscriptions.find(v=>v.id===sel.dataset.fixedSub);const p=parseSource(sel.value);if(!p)delete s().fixedSources[sub.id];else C.linkFixedSource(s(),sub,p);save();}));
}
function renderSavings(){
 const container=$('finance-content-savings');if(!container)return;
 const st=s(),rates=Catalog?.marketRates(st.preferences),rateDate=rates?.asOf||'';
 let html=`<div class="slp-money-actions">${btn(t('+ Nuevo ahorro','+ Nova poupança','+ New saving'),'saving')}${btn(t('Actualizar tasas BCB','Atualizar taxas BCB','Refresh BCB rates'),'rates')}</div>`;
 if(rates)html+=`<div class="slp-market-status">CDI ${Number(rates.cdiAnnual).toFixed(2)}% a.a. · Selic ${Number(rates.selicAnnual).toFixed(2)}% a.a. · TR ${Number(rates.trMonthly).toFixed(4)}% a.m. <small>${t('Referencia','Referência','Reference')}: ${esc(rateDate)} · ${esc(rates.source==='bcb-sgs'?'BCB/SGS':t('referencia guardada','referência salva','saved reference'))}</small></div>`;
 html+=`<p class="slp-money-help">${t('Estimaciones, no saldos bancarios. Las tasas de ofertas pueden cambiar; los rendimientos netos dependen de impuestos y condiciones.','Estimativas, não saldos bancários. Taxas e impostos variam.','Estimates, not bank balances. Offers and taxes vary.')}</p>`;
 if(!st.savings.length)html+=box(`<p>${t('Selecciona un producto brasileño y la app rellenará sus condiciones de referencia.','Escolha um produto brasileiro e o app preenche a taxa de referência.','Choose a Brazilian product to fill its reference terms.')}</p>`);
 for(const x of st.savings){
  const pr=Catalog?.byId(x.productId),p=C.savingsProjection(x),missing=p.needsRate;
  let rateDesc=x.rateType==='poupanca'?t('Poupança · TR y Selic','Poupança · TR e Selic','Savings · TR and Selic'):x.rateType==='cdi'?`${x.cdiPercent}% CDI · ${Number(x.cdiAnnual||0).toFixed(2)}% a.a.`:`${x.annualRate}% a.a.`;
  html+=box(`<div class="slp-money-top"><span class="slp-money-grow"><strong>${esc(x.name)}</strong><small>${esc(pr?.bank||'')} · ${esc(rateDesc)} · ${t('estimado','estimado','estimated')}</small></span></div><div class="slp-money-split">${label(t('Saldo estimado','Saldo estimado','Estimated balance'),money(p.grossCents))}${label(t('Intereses brutos estimados','Juros brutos estimados','Estimated gross interest'),missing?t('Falta tasa','Falta taxa','Rate needed'):`+ ${money(p.interestCents)}`)}</div><div class="slp-money-actions">${btn(t('Editar','Editar','Edit'),'edit-saving:'+x.id)}${btn(t('Depositar','Depositar','Deposit'),'deposit:'+x.id)}${btn(t('Retirar','Retirar','Withdraw'),'withdraw:'+x.id)}${btn(t('Ajustar saldo real','Atualizar saldo real','Update balance'),'reconcile:'+x.id)}</div>`);
 }
 container.innerHTML=html;
}
function render(){const active=document.querySelector('#view-finance .segment-btn.active')?.id; if(active==='fin-tab-accounts')renderAccounts();else if(active==='fin-tab-savings')renderSavings();}
function renderAll(){renderAccounts();renderSavings()}
const field=(label,name,type='text',value='',attrs='')=>`<label class="slp-form-field"><span>${esc(label)}</span><input name="${esc(name)}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
const selectField=(label,name,optionsHtml)=>`<label class="slp-form-field"><span>${esc(label)}</span><select name="${esc(name)}">${optionsHtml}</select></label>`;
function showForm(title,fields,submit,setup){const old=$('slp-money-dialog');old?.remove();const wrapper=document.createElement('div');wrapper.id='slp-money-dialog';wrapper.className='slp-dialog-backdrop';wrapper.innerHTML=`<form class="slp-money-dialog"><div class="slp-dialog-head"><h3>${esc(title)}</h3><button type="button" class="slp-icon-close" aria-label="Cerrar">×</button></div><div class="slp-dialog-fields">${fields}</div><div class="slp-dialog-actions"><button type="button" class="slp-action slp-quiet" data-cancel>${t('Cancelar','Cancelar','Cancel')}</button><button type="submit" class="slp-action slp-primary">${t('Guardar','Salvar','Save')}</button></div></form>`;document.body.appendChild(wrapper);const close=()=>wrapper.remove();wrapper.addEventListener('click',e=>{if(e.target===wrapper||e.target.closest('[data-cancel],.slp-icon-close'))close()});const form=wrapper.querySelector('form');form.addEventListener('submit',e=>{e.preventDefault();try{submit(Object.fromEntries(new FormData(form)));save();close()}catch(err){alertUser(err.message)}});if(typeof setup==='function')setup(form);form.querySelector('input,select')?.focus();}
function formAccount(accountId=''){
 const a=accountId?s().accounts.find(x=>x.id===accountId):null;
 if(accountId&&!a)return alertUser(t('Cuenta inexistente','Conta não encontrada','Account not found'));
 showForm(a?t('Editar cuenta','Editar conta','Edit account'):t('Añadir cuenta','Adicionar conta','Add account'),
 field(t('Nombre','Nome','Name'),'name','text',a?.name||'','required maxlength=80')+
 selectField(t('Tipo','Tipo','Type'),'type',[['bank',t('Banco','Banco','Bank')],['cash',t('Efectivo','Dinheiro','Cash')],['wallet',t('Billetera','Carteira','Wallet')]].map(([v,label])=>`<option value="${v}" ${v===(a?.type||'bank')?'selected':''}>${label}</option>`).join(''))+
 selectField(t('Banco / logotipo','Banco / logotipo','Bank / logo'),'bankDomain',brandOptions(a?.bankDomain||''))+
 field(t('Saldo inicial (modifica el saldo calculado)','Saldo inicial (altera saldo calculado)','Opening balance (changes calculated balance)'),'openingBalance','number',a?C.fromCents(a.openingCents):'0','step=0.01 required')+
 (a?`<p class="slp-money-fieldnote">${t('Modificar el saldo inicial no borra tus movimientos; para corregir el saldo actual usa Ajustar saldo.','Alterar o saldo inicial não apaga movimentos; para conciliar, use Ajustar saldo.','Changing opening balance does not delete activity; use Adjust balance for current reconciliation.')}</p>`:''),
 v=>a?C.updateAccount(s(),a.id,v):C.createAccount(s(),v));
}
function formCard(cardId=''){
 const c=cardId?s().cards.find(x=>x.id===cardId):null;
 if(cardId&&!c)return alertUser(t('Tarjeta inexistente','Cartão não encontrado','Card not found'));
 showForm(c?t('Editar tarjeta','Editar cartão','Edit card'):t('Añadir tarjeta de crédito','Adicionar cartão de crédito','Add credit card'),
 field(t('Nombre','Nome','Name'),'name','text',c?.name||'','required maxlength=80')+
 selectField(t('Banco y logo','Banco e logotipo','Bank and logo'),'bankDomain',brandOptions(c?.bankDomain||''))+
 field(t('Límite total de crédito (R$)','Limite total (R$)','Total credit limit (R$)'),'limit','number',c?C.fromCents(c.limitCents):'','min=0.01 step=0.01 required')+
 field(t('Crédito utilizado inicialmente','Crédito utilizado inicialmente','Initially used credit'),'openingUsed','number',c?C.fromCents(c.openingUsedCents):'0','min=0 step=0.01 required')+
 field(t('Día de corte','Dia de fechamento','Closing day'),'cutoffDay','number',c?.cutoffDay||'20','min=1 max=31 required')+
 field(t('Día de vencimiento','Dia de vencimento','Due day'),'dueDay','number',c?.dueDay||'5','min=1 max=31 required')+
 field(t('Avisar días antes','Avisar dias antes','Notify days before'),'noticeDays','number',c?.noticeDays??3,'min=0 max=15 required')+
 selectField(t('Cuenta para pagar factura','Conta para pagar fatura','Bill payment account'),'payAccountId',options(s().accounts,c?.payAccountId||''))+
 (c?`<p class="slp-money-fieldnote">${t('Cambiar el límite recalcula lo disponible sin borrar compras ni facturas.','Alterar o limite recalcula o disponível sem apagar compras.','Changing limit recalculates available credit without deleting transactions.')}</p>`:''),
 v=>{const card=c?C.updateCard(s(),c.id,v):C.createCard(s(),v);window.SmartyListReminders?.scheduleCard?.(card).catch(console.warn)});
}
function incomeRuleOptions(selected='last_business'){return [['last_business',t('Último día hábil','Último dia útil','Last business day')],['upto_business',t('Hasta el N.º día hábil','Até o N.º dia útil','By Nth business day')],['day',t('Día fijo aproximado','Dia fixo aproximado','Approx. fixed day')],['once',t('Ingreso puntual','Receita avulsa','One-time income')]].map(([v,label])=>`<option value="${v}" ${v===selected?'selected':''}>${label}</option>`).join('')}
function formIncome(incomeId=''){
 if(!s().accounts.length)return alertUser(t('Primero añade una cuenta','Adicione uma conta primeiro','Add an account first'));
 const inc=incomeId?s().incomes.find(x=>x.id===incomeId):null;
 if(incomeId&&!inc)return alertUser(t('Ingreso inexistente','Receita não encontrada','Income not found'));
 showForm(inc?t('Editar ingreso','Editar receita','Edit income'):t('Nuevo ingreso','Nova receita','New income'),
 field(t('Concepto','Descrição','Description'),'name','text',inc?.name||'','required maxlength=80')+
 field(t('Importe previsto','Valor previsto','Expected amount'),'amount','number',inc?C.fromCents(inc.amountCents):'','min=0.01 step=0.01 required')+
 selectField(t('Cuenta destino','Conta de destino','Destination account'),'accountId',options(s().accounts,inc?.accountId||''))+
 selectField(t('Fecha estimada','Data prevista','Expected date'),'rule',incomeRuleOptions(inc?.rule||'last_business'))+
 field(t('N.º de día hábil','N.º dia útil','Nth business day'),'businessDay','number',inc?.businessDay??5,'min=1 max=20')+
 field(t('Día fijo (si corresponde)','Dia fixo (se aplicável)','Fixed day (if applicable)'),'day','number',inc?.day??5,'min=1 max=31'),
 v=>{const item=inc?C.updateIncome(s(),inc.id,v):C.createIncome(s(),v);window.SmartyListReminders?.scheduleIncome?.(item).catch(console.warn)});
}
function productOptions(current=''){
 if(!Catalog)return `<option value="personalizado">${t('Personalizado','Personalizado','Custom')}</option>`;
 return `<option value="">${t('Selecciona un banco y producto','Selecione banco e produto','Choose bank and product')}</option>`+
 Catalog.products.map(pr=>`<option value="${esc(pr.id)}" ${pr.id===current?'selected':''}>${esc(pr.bank+' · '+pr.name)}</option>`).join('');
}
function formSaving(savingId=''){
 const x=savingId?s().savings.find(v=>v.id===savingId):null;
 if(savingId&&!x)return alertUser(t('Ahorro inexistente','Poupança não encontrada','Saving not found'));
 const rates=Catalog?.marketRates(s().preferences)||{cdiAnnual:0,selicAnnual:0,trMonthly:0,asOf:''};
 const auto=x?x.autoMarket!==false:true;
 const fields=selectField(t('Banco y producto','Banco e produto','Bank and product'),'productId',productOptions(x?.productId||''))+
 `<p class="slp-catalog-note" id="slp-catalog-info"></p>`+
 field(t('Nombre del ahorro','Nome da poupança','Savings name'),'name','text',x?.name||'','required maxlength=80')+
 field(t('Saldo inicial comprobado','Saldo inicial verificado','Verified starting balance'),'principal','number',x?C.fromCents(x.principalCents):'','min=0 step=0.01 required')+
 field(t('Fecha de referencia','Data de referência','Reference date'),'referenceDate','date',x?.referenceDate||C.today(),'required')+
 selectField(t('Tipo de rendimiento','Tipo de rendimento','Yield type'),'rateType',[['cdi','% CDI'],['annual',t('Tasa anual','Taxa anual','Annual rate')],['poupanca','Poupança (TR + Selic)']].map(([v,label])=>`<option value="${v}" ${v===(x?.rateType||'cdi')?'selected':''}>${label}</option>`).join(''))+
 field(t('Porcentaje de CDI (%)','Percentual do CDI (%)','CDI percentage (%)'),'cdiPercent','number',x?.cdiPercent??0,'min=0 max=500 step=0.01')+
 field(t('Tasa efectiva anual (%)','Taxa efetiva anual (%)','Effective annual rate (%)'),'annualRate','number',x?.annualRate??0,'min=0 max=300 step=0.01')+
 `<label class="slp-form-field slp-form-span slp-inline-check"><input type="checkbox" name="autoMarket" value="true" ${auto?'checked':''}><span>${t('Actualizar CDI, Selic y TR desde BCB cuando haya conexión','Atualizar CDI, Selic e TR com dados do BCB','Auto-update CDI, Selic and TR from BCB')}</span></label>`+
 field(t('CDI anual de referencia (%)','CDI anual de referência (%)','Reference CDI annual (%)'),'cdiAnnual','number',x?.cdiAnnual??rates.cdiAnnual,'min=0 max=80 step=0.00001')+
 field(t('Selic anual (%)','Selic anual (%)','Selic annual (%)'),'selicAnnual','number',x?.selicAnnual??rates.selicAnnual,'min=0 max=80 step=0.00001')+
 field(t('TR mensual (%)','TR mensal (%)','Monthly TR (%)'),'trMonthly','number',x?.trMonthly??rates.trMonthly,'min=0 max=20 step=0.00001')+
 (x?`<p class="slp-money-fieldnote">${t('Modificar el saldo inicial o la fecha cambia las estimaciones históricas, sin borrar depósitos ni retiros.','Alterar saldo inicial ou data muda projeções anteriores sem apagar movimentações.','Changing opening balance/date changes prior estimates; transactions remain.')}</p>`:'');
 const handler=v=>{
  const pr=Catalog?.byId(v.productId);
  const params={...v,autoMarket:v.autoMarket==='true',rateAsOf:rates.asOf,
   capCents:pr?.capBRL?Math.round(pr.capBRL*100):0,excessPercent:pr?.excessPercent??null};
  return x?C.updateSaving(s(),x.id,params):C.createSaving(s(),params);
 };
 showForm(x?t('Editar ahorro','Editar poupança','Edit saving'):t('Nuevo ahorro','Nova poupança','New saving'),fields,handler,form=>{
  const get=n=>form.elements.namedItem(n);
  const updateVisibility=()=>{
   const type=get('rateType').value;
   for(const n of ['cdiPercent','annualRate','cdiAnnual','selicAnnual','trMonthly'])get(n)?.closest('.slp-form-field')?.classList.toggle('slp-field-hidden',n==='cdiPercent'?type!=='cdi':n==='annualRate'?type!=='annual':n==='cdiAnnual'?type!=='cdi':type!=='poupanca');
   const isAuto=get('autoMarket').checked;
   for(const n of ['cdiAnnual','selicAnnual','trMonthly'])get(n).readOnly=isAuto;
  };
  get('productId').addEventListener('change',()=>{
   const pr=Catalog?.byId(get('productId').value);if(!pr)return;
   const defaults=Catalog.defaultFor(pr.id,rates);
   get('name').value=pr.bank+' · '+pr.name;
   for(const n of ['rateType','cdiPercent','annualRate','cdiAnnual','selicAnnual','trMonthly'])get(n).value=defaults[n];
   get('autoMarket').checked=true;
   const info=form.querySelector('#slp-catalog-info');info.textContent=pr.note+' · '+t('Comprobar en el banco','Confira no banco','Check with bank')+' · '+Catalog.verifiedAt;
   updateVisibility();
  });
  get('rateType').addEventListener('change',updateVisibility);
  get('autoMarket').addEventListener('change',updateVisibility);
  if(x?.productId){const pr=Catalog?.byId(x.productId);if(pr)form.querySelector('#slp-catalog-info').textContent=pr.note+' · '+Catalog.verifiedAt;}
  updateVisibility();
 });
}
function handleAction(action){const [cmd,target]=action.split(':');const st=s();if(cmd==='account')return formAccount();if(cmd==='card')return formCard();if(cmd==='income')return formIncome();if(cmd==='saving')return formSaving();if(cmd==='edit-account')return formAccount(target);if(cmd==='edit-card')return formCard(target);if(cmd==='edit-income')return formIncome(target);if(cmd==='edit-saving')return formSaving(target);if(cmd==='rates')return refreshMarket(true);if(cmd==='transfer'){if(st.accounts.length<2)return alertUser(t('Añade dos cuentas','Adicione duas contas','Add two accounts'));return showForm(t('Transferencia entre cuentas','Transferência entre contas','Account transfer'),selectField(t('Desde','Origem','From'),'from',options(st.accounts))+selectField(t('Hacia','Destino','To'),'to',options(st.accounts))+field(t('Importe','Valor','Amount'),'amount','number','','min=0.01 step=0.01 required'),v=>C.transfer(st,v.from,v.to,v.amount))}
if(cmd==='adjust'){const a=st.accounts.find(x=>x.id===target);return showForm(t('Corregir saldo de cuenta','Corrigir saldo da conta','Reconcile account'),field(t('Saldo real que muestra el banco','Saldo real mostrado pelo banco','Actual bank balance'),'amount','number',C.fromCents(C.accountBalance(st,target)),'step=0.01 required'),v=>{const current=C.accountBalance(st,target),next=C.cents(v.amount),delta=next-current;if(delta!==0)C.createMovement(st,{kind:delta>0?'adjust-plus':'adjust-minus',amount:Math.abs(delta)/100,accountId:target,note:'Conciliación manual'});})}
if(cmd==='holidays'){return showForm(t('Feriados bancarios adicionales','Feriados bancários adicionais','Additional banking holidays'),field(t('Fechas AAAA-MM-DD, separadas por coma','Datas AAAA-MM-DD, separadas por vírgulas','Dates YYYY-MM-DD, comma separated'),'dates','text',(st.preferences.extraHolidays||[]).join(', ')),v=>{const raw=v.dates.split(',').map(x=>x.trim()).filter(Boolean);if(!raw.every(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)))throw Error(t('Usa fechas AAAA-MM-DD','Use datas AAAA-MM-DD','Use YYYY-MM-DD dates'));st.preferences.extraHolidays=[...new Set(raw)]})}
if(cmd==='pay'){if(!st.accounts.length)return alertUser(t('Añade una cuenta','Adicione uma conta','Add an account'));return showForm(t('Pagar factura','Pagar fatura','Pay bill'),selectField(t('Desde cuenta','Da conta','From account'),'accountId',options(st.accounts))+field(t('Importe pagado','Valor pago','Amount paid'),'amount','number',C.fromCents(C.cardUsed(st,target)),'min=0.01 step=0.01 required'),v=>C.payCard(st,target,v.accountId,v.amount))}
if(cmd==='confirm'){const inc=st.incomes.find(x=>x.id===target);return showForm(t('Confirmar ingreso recibido','Confirmar receita recebida','Confirm income'),field(t('Importe real','Valor real','Actual amount'),'amount','number',C.fromCents(inc.amountCents),'min=0.01 step=0.01 required')+field(t('Fecha recibida','Data recebida','Received date'),'date','date',C.today(),'required'),v=>{const m=C.confirmIncome(st,target,v.amount,v.date,C.period());window.SmartyListReminders?.cancelIncome?.(target,C.period()).catch(console.warn);return m})}
if(cmd==='deposit'){if(!st.accounts.length)return alertUser(t('Añade una cuenta','Adicione uma conta','Add an account'));return showForm(t('Transferir al ahorro','Transferir à poupança','Deposit to savings'),selectField(t('Cuenta de origen','Conta de origem','Source account'),'accountId',options(st.accounts))+field(t('Importe','Valor','Amount'),'amount','number','','min=0.01 step=0.01 required'),v=>C.savingDeposit(st,target,v.accountId,v.amount))}
if(cmd==='withdraw'){if(!st.accounts.length)return alertUser(t('Añade una cuenta','Adicione uma conta','Add an account'));return showForm(t('Retirar de ahorro','Retirar da poupança','Withdraw from savings'),selectField(t('Cuenta de destino','Conta de destino','Destination account'),'accountId',options(st.accounts))+field(t('Importe','Valor','Amount'),'amount','number','','min=0.01 step=0.01 required'),v=>C.savingWithdrawal(st,target,v.accountId,v.amount))}
if(cmd==='reconcile'){const x=st.savings.find(x=>x.id===target);return showForm(t('Saldo real comprobado','Saldo real conferido','Verified real balance'),field(t('Saldo que muestra el banco','Saldo mostrado pelo banco','Balance shown by bank'),'amount','number',C.fromCents(C.savingsProjection(x).grossCents),'min=0.01 step=0.01 required'),v=>C.reconcileSaving(st,target,v.amount));}}
function installExpenseSource(){const modal=$('modal-expense');if(!modal)return;let el=$('slp-expense-source');if(!el){el=document.createElement('label');el.className='slp-form-field slp-expense-source';el.id='slp-expense-source';el.innerHTML=`<span>${t('Pagado desde','Pago de','Paid from')}</span><select class="slp-select"></select>`;($('exp-desc')?.parentElement||modal.querySelector('.settings-card')).insertBefore(el,$('exp-desc')?.nextSibling||null)}el.querySelector('select').innerHTML=sourceOptions(s().preferences.lastSource||'');}
function attachHooks(){if(typeof Finance==='undefined')return;
const mark=f=>{f.__slpMoneyWrapped=true;return f};
if(!Finance.openExpenseModal.__slpMoneyWrapped){const open=Finance.openExpenseModal;Finance.openExpenseModal=mark(function(...args){const res=open.apply(this,args);installExpenseSource();return res})}
if(!Finance.saveExpense.__slpMoneyWrapped){const saveExpense=Finance.saveExpense;Finance.saveExpense=mark(function(...args){const ids=new Set(d().store.expenses.map(x=>x.id));const choice=parseSource($('slp-expense-source')?.querySelector('select')?.value);const result=saveExpense.apply(this,args);const exp=d().store.expenses.find(x=>!ids.has(x.id));if(exp&&choice){try{const st=s();exp.smSource=choice;st.preferences.lastSource=`${choice.type}:${choice.id}`;C.applyExpense(st,exp,choice);d().save();render()}catch(e){console.warn('[SmartyMoney]',e)}}return result})}
if(!Finance.deleteExpense.__slpMoneyWrapped){const del=Finance.deleteExpense;Finance.deleteExpense=mark(async function(id,...args){const existing=d().store.expenses.some(x=>x.id===id);const result=await del.call(this,id,...args);if(existing&&!d().store.expenses.some(x=>x.id===id)){C.unlinkExpense(s(),id);save()}return result})}
if(!Finance.renderSubscriptions.__slpMoneyWrapped){const sub=Finance.renderSubscriptions;Finance.renderSubscriptions=mark(function(...args){const res=sub.apply(this,args);render();return res})}
if(!Finance.setTab.__slpMoneyWrapped){const setTab=Finance.setTab;Finance.setTab=mark(function(tab,...args){const result=setTab.call(this,tab,...args);if(tab==='accounts'||tab==='savings')render();return result})}
}

function attachShoppingHooks(){if(typeof Shopping==='undefined'||Shopping.__slpMoneyHooks)return;Shopping.__slpMoneyHooks=true;
const finish=Shopping.finishList;Shopping.finishList=function(...args){const res=finish.apply(this,args);const modal=$('modal-finish-list');if(modal&&!$('slp-list-payment-source')){const field=document.createElement('label');field.className='slp-form-field';field.id='slp-list-payment-source';field.innerHTML=`<span>${t('Pagado desde','Pago de','Paid from')}</span><select class="slp-select">${sourceOptions(s().preferences.lastSource||'')}</select>`;(modal.querySelector('.manual-total-row')||modal.querySelector('#finish-items-list'))?.after(field)}else if($('slp-list-payment-source'))$('slp-list-payment-source').querySelector('select').innerHTML=sourceOptions(s().preferences.lastSource||'');return res};
const confirm=Shopping.confirmFinish;Shopping.confirmFinish=function(...args){const source=parseSource($('slp-list-payment-source')?.querySelector('select')?.value),list=d().store.lists.find(x=>x.id===d().store.currentId);const result=confirm.apply(this,args);if(source&&list?.status==='completed'){try{list.smSource=source;s().preferences.lastSource=`${source.type}:${source.id}`;C.applyExpense(s(),{id:`list-${list.id}`,date:list.date,amount:list.total,desc:list.name,isInstallment:false},source);d().save();render()}catch(e){console.warn('[SmartyMoney lista]',e)}}return result};
}
let marketInProgress=false;
async function refreshMarket(forced=false){
 if(!Catalog||!d()||marketInProgress)return;
 const st=s(),last=st.preferences.marketRates?.updatedAt;
 if(!forced&&last&&Date.now()-new Date(last).getTime()<24*3600000)return;
 marketInProgress=true;
 try{
  const result=await Catalog.refresh(st.preferences);C.applyMarketRates(st,result.rates);
  d().save();renderSavings();window.SmartyWallet?.render?.();
  if(forced)alertUser(t('Tasas BCB actualizadas','Taxas BCB atualizadas','BCB rates updated')+` (${result.updated.join(', ')})`);
 }catch(err){if(forced)alertUser(err.message);console.warn('[SmartyInvestmentCatalog]',err.message)}
 finally{marketInProgress=false}
}
function start(){if(!d()||!$('view-finance'))return;C.state(d().store);createTabs();if(Catalog){const st=s();const rates=Catalog.marketRates(st.preferences);C.applyMarketRates(st,rates);refreshMarket(false);}installExpenseSource();setTimeout(()=>{attachHooks();attachShoppingHooks()},900);window.addEventListener('load',()=>setTimeout(()=>{attachHooks();attachShoppingHooks()},1200),{once:true});document.addEventListener('click',e=>{const b=e.target.closest('[data-money-action]');if(b)handleAction(b.dataset.moneyAction)});window.addEventListener('focus',onResume);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')onResume()});window.addEventListener('load',()=>setTimeout(onResume,950),{once:true});onResume();}
function onResume(){if(!d())return;const st=s();let moved=C.applyFixedDue(st,d().store.subscriptions||[]);for(const exp of d().store.expenses||[]){if(exp.smSource&&exp.date<=Date.now()&&!st.movements.some(m=>m.key===`expense:${exp.id}`)){const entry=C.applyExpense(st,exp,exp.smSource);if(entry)moved.push(entry)}}if(moved.length){d().save();console.info('[SmartyMoney] Movimientos locales aplicados',moved.length)}render()}
window.SmartyMoneyUI={start,render,renderAll,logo,brandDomains};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
