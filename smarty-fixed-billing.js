/* SmartLifePro — origen de suscripciones EN su propia pantalla, no en Cuentas.
   El presupuesto reserva el coste desde el día 1 (Finance); en la fecha de
   cargo solo se crea UN movimiento local en la cuenta o tarjeta elegida. */
(function(root){'use strict';
const $=id=>root.document.getElementById(id);
const C=()=>root.SmartyMoneyCore;
// Finance, Data, UI y Main son `const` globales del HTML: NO propiedades de window.
const financeRef=()=>typeof Finance!=='undefined'?Finance:root.Finance;
const ds=()=>typeof Data!=='undefined'?Data:root.Data;
const uiRef=()=>typeof UI!=='undefined'?UI:root.UI;
const mainRef=()=>typeof Main!=='undefined'?Main:root.Main;
const current=()=>C().state(ds().store);
const locale=()=>ds()?.store?.settings?.lang||'es';
const tr=(es,pt,en)=>({es,pt,en})[locale()]||es;
const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const parse=source=>{const match=/^(account|card):(sm_[a-z0-9_]+)$/.exec(source||'');return match?{type:match[1],id:match[2]}:null};
let activeEditId=null;
function sourceOptions(value=''){
 const state=current();let html=`<option value="">${tr('Sin asignar todavía','Sem atribuir','Not assigned yet')}</option>`;
 for(const a of state.accounts)html+=`<option value="account:${esc(a.id)}" ${value===`account:${a.id}`?'selected':''}>${esc(a.name)} · ${tr('Débito / saldo','Débito / saldo','Debit balance')}</option>`;
 for(const c of state.cards)html+=`<option value="card:${esc(c.id)}" ${value===`card:${c.id}`?'selected':''}>${esc(c.name)} · ${tr('Crédito / límite','Crédito / limite','Credit limit')}</option>`;
 return html;
}
function selected(subId){const v=current().fixedSources[subId];return v?`${v.sourceType}:${v.sourceId}`:''}
function ensureFormField(){const modal=$('modal-sub');if(!modal)return null;let label=$('slp-sub-source-field');if(!label){
 label=root.document.createElement('label');label.id='slp-sub-source-field';label.className='slp-sub-source-field';
 const save=modal.querySelector('button[onclick*="saveSubscription"]');save?.parentElement?.insertBefore(label,save);
 }
 return label;
}
const iconNames={auto:'Automático',chatgpt:'ChatGPT',gemini:'Google Gemini',prime:'Prime Video',netflix:'Netflix',spotify:'Spotify',youtube:'YouTube',disney:'Disney+',max:'Max / HBO',apple:'Apple',googleone:'Google One',microsoft:'Microsoft',amazon:'Amazon',notion:'Notion',canva:'Canva',adobe:'Adobe'};
function iconPicker(selected='auto'){
 return `<div class="slp-sub-icon-picker"><span>${tr('Logo de la suscripción','Logo da assinatura','Subscription logo')}</span><select id="slp-sub-brand" class="setting-input">${Object.entries(iconNames).map(([k,v])=>`<option value="${k}" ${k===selected?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`;
}
function formSource(value='',brand='auto'){
 const el=ensureFormField();if(!el)return;
 el.innerHTML=`<span>${tr('Se cobra desde','Cobrar de','Charge from')}</span><select id="slp-sub-source" class="setting-input">${sourceOptions(value)}</select><small>${tr('El presupuesto mensual ya lo reserva desde el día 1. Se aplicará al saldo de la cuenta o límite de crédito únicamente al llegar el día del cobro.','O orçamento já reserva no dia 1. O saldo ou limite muda só no dia da cobrança.','The monthly budget reserves it from day 1. The account balance or credit limit changes only on the charge date.')}</small>`;
 el.insertAdjacentHTML('beforeend',iconPicker(brand));
}
function assign(sub,value){const st=current(),next=parse(value),existing=st.fixedSources[sub.id];
 if(!next){delete st.fixedSources[sub.id];return}
 if(existing&&existing.sourceType===next.type&&existing.sourceId===next.id)return;
 C().linkFixedSource(st,sub,next);
}
function commit(sub,value){assign(sub,value);C().applyFixedDue(current(),ds().store.subscriptions||[]);ds().save()}
function editSubscription(id){const sub=ds().store.subscriptions?.find(s=>String(s.id)===String(id));if(!sub)return;
 activeEditId=sub.id;
 $('sub-name').value=sub.name;$('sub-cost').value=sub.cost;$('sub-day').value=sub.day;
 formSource(selected(sub.id),sub.smBrandKey||'auto');
 const h=$('modal-sub')?.querySelector('h2');if(h)h.textContent=tr('Editar gasto fijo','Editar despesa fixa','Edit fixed expense');
 $('modal-sub').classList.add('open');
}
// GitHub Actions inyecta una segunda implementación de Finance.renderSubscriptions
// al evento load. Por eso NO basta con envolver la función una sola vez.
// El observador mejora el DOM final que se muestra, cualquiera que sea el renderizador.
function getDetails(row){
 // La insignia de marca puede contener DIVs: localizar el título por texto,
 // no por posición del icono (en el APK se inserta antes del nombre).
 const subscriptions=ds()?.store?.subscriptions||[];
 for(const el of [...row.children]){
  if(el.classList?.contains('slp-sub-config')||el.tagName!=='DIV')continue;
  const first=el.firstElementChild;
  if(first && subscriptions.some(s=>String(s.name).trim()===first.textContent.trim()))return el;
 }
 return null;
}
function findSubscription(row,used,subs){
 const cached=row.dataset.slpSubId;
 if(cached){const hit=subs.find(s=>String(s.id)===cached);if(hit&&!used.has(cached))return hit;}
 const detail=getDetails(row);
 const title=detail?.firstElementChild?.textContent?.trim();
 if(!title)return null;
 const dayText=detail.children[1]?.textContent||'';
 const dayMatch=dayText.match(/(\d{1,2})\s*$/);
 let candidates=subs.filter(s=>!used.has(String(s.id))&&String(s.name).trim()===title);
 if(dayMatch){const byDay=candidates.filter(s=>Number(s.day)===Number(dayMatch[1]));if(byDay.length)candidates=byDay;}
 return candidates[0]||null;
}
function decorateList(){
 const list=$('subs-list');if(!list||!ds()?.store)return;
 const rows=[...list.querySelectorAll('.glass-card.item-row')];
 if(!rows.length)return;
 const subscriptions=[...(ds().store.subscriptions||[])];
 const used=new Set();
 rows.forEach(row=>{
  const sub=findSubscription(row,used,subscriptions);
  if(!sub)return;
  const id=String(sub.id);used.add(id);row.dataset.slpSubId=id;
  row.classList.add('slp-sub-row');
  // Mostrar la insignia también si el renderizador original no tiene logos.
  if(!row.querySelector(':scope > .sba-logo, :scope > .brand-logo-real')&&root.SmartyBrandAssets?.subscriptionLogo){
   row.insertAdjacentHTML('afterbegin',root.SmartyBrandAssets.subscriptionLogo(sub));
  }
  let setting=row.querySelector('.slp-sub-config');
  if(!setting){setting=root.document.createElement('div');setting.className='slp-sub-config';row.appendChild(setting);}
  if(setting.dataset.slpFor!==id){
   setting.dataset.slpFor=id;
   setting.innerHTML=`<label>${tr('Se cobra desde','Cobrar de','Charge from')}<select data-slpsub-source="${esc(id)}" class="slp-sub-inline-select">${sourceOptions(selected(id))}</select></label><button type="button" data-slpsub-edit="${esc(id)}">${tr('Editar','Editar','Edit')}</button>`;
  }
 });
}

let observing=false;
function observeList(){
 if(observing||!root.MutationObserver)return;
 const list=$('subs-list');if(!list)return;
 observing=true;
 const observer=new root.MutationObserver(()=>decorateList());
 observer.observe(list,{childList:true,subtree:true});
 decorateList();
}

let installed=false;
function install(){
 if(installed)return true;
 const fin=financeRef();
 if(!fin||!$('modal-sub'))return false;
 installed=true;
 observeList();
 const add=fin.addSubscription;
 fin.addSubscription=function(...args){activeEditId=null;const result=add.apply(this,args);formSource('','auto');const h=$('modal-sub')?.querySelector('h2');if(h)h.textContent=tr('Nuevo gasto fijo','Nova despesa fixa','New fixed expense');return result};
 const save=fin.saveSubscription;
 fin.saveSubscription=function(...args){
 const name=String($('sub-name')?.value||'').trim(),cost=Number($('sub-cost')?.value),day=Number($('sub-day')?.value);
 if(!name||!Number.isFinite(cost)||cost<=0||!Number.isInteger(day)||day<1||day>31){uiRef()?.showSnackbar?.(tr('Revisa el nombre, importe y día de cobro (1–31)','Verifique nome, valor e dia (1–31)','Check name, amount and charge day (1–31)'));return}
 const source=$('slp-sub-source')?.value||'';const iconChoice=$('slp-sub-brand')?.value||'auto';
 if(activeEditId!==null){
   const sub=ds().store.subscriptions.find(x=>String(x.id)===String(activeEditId));if(!sub)return;
   sub.name=name;sub.cost=cost;sub.day=day;sub.smBrandKey=iconChoice==='auto'?'':iconChoice;
   try{commit(sub,source)}catch(e){uiRef()?.showSnackbar?.(e.message);return}
   activeEditId=null;mainRef()?.closeModal?.('sub');fin.renderSubscriptions();uiRef()?.renderBudgetChart?.();fin.renderHomeWidgets?.();return;
 }
 const ids=new Set((ds().store.subscriptions||[]).map(x=>String(x.id)));
 const result=save.apply(this,args);
 const sub=ds().store.subscriptions?.find(x=>!ids.has(String(x.id)));
 if(sub){sub.smBrandKey=iconChoice==='auto'?'':iconChoice;try{commit(sub,source);fin.renderSubscriptions()}catch(e){uiRef()?.showSnackbar?.(e.message)}}
 return result;
 };
 const render=fin.renderSubscriptions;
 fin.renderSubscriptions=function(...args){const result=render.apply(this,args);decorateList();return result};
 const del=fin.deleteSub;
 fin.deleteSub=async function(id,...args){const before=ds().store.subscriptions?.some(x=>x.id===id);const result=await del.call(this,id,...args);if(before&&!ds().store.subscriptions?.some(x=>x.id===id)){delete current().fixedSources[id];ds().save()}return result};
 root.document.addEventListener('click',event=>{const edit=event.target.closest('[data-slpsub-edit]');if(edit)editSubscription(edit.dataset.slpsubEdit)});
 root.document.addEventListener('change',event=>{const target=event.target.closest('[data-slpsub-source]');if(!target)return;
 const sub=ds().store.subscriptions?.find(x=>String(x.id)===target.dataset.slpsubSource);if(!sub)return;
 try{commit(sub,target.value);uiRef()?.showSnackbar?.(tr('Origen de cobro actualizado','Origem de cobrança atualizada','Payment source updated'))}catch(e){uiRef()?.showSnackbar?.(e.message)}
 });
 decorateList();
 return true;
}
root.SmartyFixedBilling={install,editSubscription,decorateList};
if(root.document?.readyState==='loading')root.document.addEventListener('DOMContentLoaded',install,{once:true});else install();
root.addEventListener?.('load',install,{once:true});
})(window);
