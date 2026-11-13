'use strict';
const assert=require('node:assert/strict');
const C=require('./smarty-money-core.js');
const store={};const s=C.state(store);
const a=C.createAccount(s,{name:'Nubank',openingBalance:1000,bankDomain:'nubank.com.br'});
const b=C.createAccount(s,{name:'Efectivo',openingBalance:100});
assert.equal(C.accountBalance(s,a.id),100000);
C.transfer(s,a.id,b.id,200);
assert.equal(C.accountBalance(s,a.id),80000);assert.equal(C.accountBalance(s,b.id),30000);
// No se alteró el registro de gastos original.
assert.equal(store.expenses,undefined);
const card=C.createCard(s,{name:'Crédito',limit:3000,openingUsed:100,cutoffDay:20,dueDay:5});
assert.equal(C.cardAvailable(s,card.id),290000);
const e={id:'expense-one',amount:75,date:Date.now(),desc:'Compras',isInstallment:false};
C.applyExpense(s,e,{type:'card',id:card.id});C.applyExpense(s,e,{type:'card',id:card.id});
assert.equal(C.cardUsed(s,card.id),17500,'no duplicar compra');
assert.equal(C.accountBalance(s,a.id),80000,'tarjeta no debita cuenta hasta pagar factura');
C.payCard(s,card.id,a.id,175);assert.equal(C.cardUsed(s,card.id),0);assert.equal(C.accountBalance(s,a.id),62500);
const fut={id:'future',amount:31,date:new Date('2099-01-01T12:00:00').getTime()};assert.equal(C.applyExpense(s,fut,{type:'account',id:a.id}),null);
const sub={id:'sub-01',name:'Internet',day:15,cost:39.9};
C.linkFixedSource(s,sub,{type:'account',id:b.id},'2026-11-13');
assert.equal(C.applyFixedDue(s,[sub],'2026-11-14').length,0);
assert.equal(C.applyFixedDue(s,[sub],'2026-11-15').length,1);
assert.equal(C.applyFixedDue(s,[sub],'2026-11-15').length,0,'gasto fijo mes idempotente');
assert.equal(C.accountBalance(s,b.id),26010);
assert.equal(C.applyFixedDue(s,[sub],'2026-12-15').length,1);
// Si se asigna la cuenta después de la fecha de cobro, empieza el próximo mes.
const sub2={id:'sub-02',name:'Plano',day:5,cost:20};C.linkFixedSource(s,sub2,{type:'account',id:a.id},'2026-11-13');assert.equal(C.applyFixedDue(s,[sub2],'2026-11-29').length,0);
assert.equal(C.applyFixedDue(s,[sub2],'2026-12-05').length,1);
// Feriados bancarios brasileños, incluidos Finados y Nochevieja.
let w=C.expectedWindow({rule:'upto_business',businessDay:5},'2026-11');assert.deepEqual(w,{start:'2026-11-03',end:'2026-11-09'});
assert.equal(C.expectedWindow({rule:'last_business'},'2026-12').end,'2026-12-30');
const income=C.createIncome(s,{name:'Beca',amount:3000,accountId:a.id,rule:'upto_business',businessDay:5});
assert.equal(C.incomeReceived(s,income.id,'2026-11'),false);const balanceBefore=C.accountBalance(s,a.id);
assert.ok(C.expectedWindow(income,'2026-11'));assert.equal(C.accountBalance(s,a.id),balanceBefore,'previsión no acredita saldo');
C.confirmIncome(s,income.id,3005,'2026-11-06','2026-11');assert.equal(C.accountBalance(s,a.id),balanceBefore+300500);
assert.throws(()=>C.confirmIncome(s,income.id,3005,'2026-11-06','2026-11'),/confirmado/);
const saving=C.createSaving(s,{name:'Caixinha',principal:1000,rateType:'annual',annualRate:12});
// La simulación siempre distingue intereses brutos estimados de saldo bancario confirmado.
saving.referenceDate='2026-01-01';const proj=C.savingsProjection(saving,'2027-01-01');assert.ok(proj.grossCents>111000&&proj.grossCents<113000);
C.savingDeposit(s,saving.id,a.id,100,'2026-11-13');assert.ok(C.savingsProjection(saving,'2026-11-13').grossCents>=110000);
C.reconcileSaving(s,saving.id,1200,'2026-11-13');assert.equal(C.savingsProjection(saving,'2026-11-13').grossCents,120000);
assert.equal(store.smartyMoney.schema,1);
console.log('SmartyMoney: cuentas, tarjetas, ingresos, días hábiles, gastos fijos y ahorros OK');
