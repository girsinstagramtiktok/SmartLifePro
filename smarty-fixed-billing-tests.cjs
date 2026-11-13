'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const C=require('./smarty-money-core.js');
const bankCode=fs.readFileSync('./smarty-brand-assets.js','utf8');
const subCode=fs.readFileSync('./smarty-fixed-billing.js','utf8');
const financeCode=fs.readFileSync('./finance.js','utf8');
const moneyUI=fs.readFileSync('./smarty-money-ui.js','utf8');
const workflow=fs.readFileSync('./.github/workflows/android-apk.yml','utf8');
const html=fs.readFileSync('./index.html','utf8');

function setup(type){
  const store={smartyMoney:{},subscriptions:[],budget:{limit:3000}};
  const st=C.state(store);
  const acc=C.createAccount(st,{name:'Nubank débito',openingBalance:2000});
  const card=C.createCard(st,{name:'Nubank crédito',limit:4000,openingUsed:200,cutoffDay:5,dueDay:12});
  const sub={id:'1700000001',name:'ChatGPT Plus',cost:95,day:17};
  store.subscriptions.push(sub);
  const payFrom=type==='card'?{type:'card',id:card.id}:{type:'account',id:acc.id};
  C.linkFixedSource(st,sub,payFrom,'2026-11-13');
  return {store,st,acc,card,sub};
}
{
 const {store,st,card,sub}=setup('card');
 const available=()=>C.cardAvailable(st,card.id);
 const before=available();
 assert.equal(C.applyFixedDue(st,store.subscriptions,'2026-11-13').length,0);
 assert.equal(available(),before,'Antes del día 17 la tarjeta no debe cambiar');
 assert.equal(C.applyFixedDue(st,store.subscriptions,'2026-11-17').length,1);
 assert.equal(available(),before-9500,'El día 17 debe usar límite de la tarjeta');
 assert.equal(C.applyFixedDue(st,store.subscriptions,'2026-11-17').length,0,'No cobrar 2 veces el mismo mes');
 assert.equal(st.movements.filter(x=>x.key==='fixed:'+sub.id+':2026-11').length,1);
 assert.equal(store.budget.limit,3000,'No modificar el presupuesto desde el core');
 assert.equal(C.applyFixedDue(st,store.subscriptions,'2026-12-17').length,1,'Facturación del mes siguiente');
}
{
 const {store,st,acc,card,sub}=setup('account');
 const before=C.accountBalance(st,acc.id);
 assert.equal(C.applyFixedDue(st,store.subscriptions,'2026-11-16').length,0);
 assert.equal(C.accountBalance(st,acc.id),before);
 assert.equal(C.applyFixedDue(st,store.subscriptions,'2026-11-17').length,1);
 assert.equal(C.accountBalance(st,acc.id),before-9500);
 assert.equal(C.cardUsed(st,card.id),20000,'Débito no modifica tarjeta de crédito');
 // Al cambiar la fuente después de la fecha de cobro, no se debe duplicar el cargo.
 C.linkFixedSource(st,sub,{type:'card',id:card.id},'2026-11-18');
 assert.equal(C.applyFixedDue(st,store.subscriptions,'2026-11-18').length,0);
 assert.equal(C.applyFixedDue(st,store.subscriptions,'2026-12-17').length,1);
 assert.equal(C.cardUsed(st,card.id),29500);
}
assert(!moneyUI.includes("t('Origen de los gastos fijos'"),'Selector de suscripciones no debe estar en Cuentas');
assert(subCode.includes('data-slpsub-source')&&subCode.includes('data-slpsub-edit'));
assert(subCode.includes('sourceOptions(value)')&&subCode.includes('commit(sub,source)'));
assert(html.includes('smarty-brand-assets.js')&&html.includes('smarty-fixed-billing.js'));
assert(workflow.includes('cp data.js ui.js')&&workflow.includes('smarty-fixed-billing.js smarty-list-reminders.js'));
assert(workflow.includes('node smarty-fixed-billing-tests.cjs'));
assert(bankCode.includes('cdn.simpleicons.org')&&bankCode.includes('storage.setItem'));
const vm=require('node:vm');const context={module:{exports:{}},navigator:{onLine:false},localStorage:{getItem(){return null}},document:null};
vm.runInNewContext(bankCode,context,{filename:'smarty-brand-assets.js'});
const assets=context.module.exports;
assert.equal(assets.subscriptionKey('ChatGPT Plus'),'chatgpt');
assert.equal(assets.subscriptionKey('Google Gemini Advanced'),'gemini');
assert.equal(assets.subscriptionKey('Amazon Prime Video'),'prime');
assert.equal(assets.bankKey('nubank.com.br'),'nubank');
assert.equal(assets.bankKey('mercadopago.com.br'),'mercado');
assert(assets.subscriptionLogo('ChatGPT').includes('sba-mark'));
assert(!assets.subscriptionLogo('ChatGPT').includes('src='),'Sin conexión debe haber icono local sin URL externa');
assert(financeCode.includes('Las suscripciones del mes se reservan desde el inicio'));
console.log('OK: cobrar día 17 sin segunda reserva, cambiar origen, edición, iconos offline y empaquetado');
