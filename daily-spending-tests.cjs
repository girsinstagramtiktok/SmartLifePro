'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'smarty-daily-spending.js'),'utf8');
const window={};const Finance={renderExpensesHistory(){},selectedHistoryMonth:'2026-11',selectedCategoryFilter:'ALL'};
const sandbox={window,Finance,document:{getElementById:()=>null},Date,Number,Array,Math,console};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
const data={expenses:[
 {date:new Date(2026,10,2,10).getTime(),amount:20,desc:'Mercado',category:'cat_market'},
 {date:new Date(2026,10,2,12).getTime(),amount:30,desc:'Farmacia',category:'cat_health'},
 {date:new Date(2026,10,19).getTime(),amount:70,desc:'Futuro',category:'cat_market'},
 {date:new Date(2026,9,5).getTime(),amount:25,desc:'Cuota',category:'cat_market',isInstallment:true,installments:{total:3}}
],lists:[{status:'completed',date:new Date(2026,10,3).getTime(),total:10,name:'Compra supermercado'}],subscriptions:[{day:12,cost:99,name:'Netflix'}]};
const today=new Date(2026,10,11,13);
const summary=window.SmartyDailySpending.compute('2026-11','ALL',data,today);
assert.equal(summary.records.length,30);
assert.equal(summary.records[1].registered,50);
assert.equal(summary.records[2].registered,10);
assert.equal(summary.records[18].planned,70);
assert.equal(summary.records[4].planned,25);
assert.equal(summary.records[11].planned,99);
assert.equal(summary.totalRegistered,60);
assert.equal(summary.totalPlanned,194);
assert.equal(summary.active,2);
assert.equal(summary.average,30);
const filtered=window.SmartyDailySpending.compute('2026-11','cat_market',data,today);
assert.equal(filtered.totalRegistered,30);
assert.equal(filtered.totalPlanned,95);
const next=window.SmartyDailySpending.compute('2027-02','ALL',data,today);
assert.equal(next.records.length,28);
assert.equal(window.SmartyDailySpending.compute('foo','ALL',data,today),null);
assert.equal(typeof Finance.renderExpensesHistory,'function');
console.log('OK: historial diario, filtros, pagos programados, fechas futuras, meses, promedio.');

// Regresión: el código que GitHub empaqueta reemplaza renderExpensesHistory
// durante window.load. El módulo diario debe volver a engancharse DESPUÉS.
{
  const events=new Map();
  const timers=[];
  const w={addEventListener(name,fn){events.set(name,fn);}};
  let renderCount=0;
  const f={renderExpensesHistory(){renderCount++;},selectedHistoryMonth:'2026-11',selectedCategoryFilter:'ALL'};
  const d={getElementById(){return null;},addEventListener(){}};
  const sandbox2={window:w,Finance:f,document:d,Date,Number,Array,Math,console,setTimeout(fn){timers.push(fn);}};
  vm.createContext(sandbox2);vm.runInContext(source,sandbox2);
  const originalWrapped=f.renderExpensesHistory;
  assert.equal(typeof originalWrapped,'function');
  // Emular el upgradeFinanceFeatures() que se ejecuta en window.load.
  function nativeAddonHistory(){renderCount++;}
  f.renderExpensesHistory=nativeAddonHistory;
  events.get('load')();
  assert.notEqual(f.renderExpensesHistory,nativeAddonHistory,'El panel debe reengancharse tras la sustitución en load');
  const patchedAfterLoad=f.renderExpensesHistory;
  events.get('pageshow')();
  assert.equal(f.renderExpensesHistory,patchedAfterLoad,'Evitar dobles envoltorios al navegar');
  // Emular el segundo envoltorio tardío del módulo de promedios.
  f.renderExpensesHistory=function lateMonthlyHistory(){renderCount++;};
  timers.forEach(fn=>fn());
  assert.notEqual(f.renderExpensesHistory,nativeAddonHistory);
  assert.notEqual(f.renderExpensesHistory.name,'lateMonthlyHistory','Recuperar el panel tras el parche tardío');
  f.renderExpensesHistory();
  assert.equal(renderCount,1);
}
console.log('OK: la vista diaria se recupera después de las sustituciones del workflow Android.');
