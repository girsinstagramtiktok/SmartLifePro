'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function makeRuntime({mode='confirm', openModal=true}={}) {
  const cache = new Map();
  const persisted = new Map();
  const callbacks = new Map();
  const q=[]; const acked=[]; const opened=[]; const expenses=[];
  let modalOpen=false; let stopped=false;
  const modal={classList:{contains:(c)=>c==='open'&&modalOpen}};
  const native={
    peekPendingNotificationsJson:()=>JSON.stringify(q),
    ackPendingNotificationsJson:(s)=>{
      const keys=JSON.parse(s);acked.push(...keys);
      for(let i=q.length-1;i>=0;i--) if(keys.includes(q[i].key))q.splice(i,1);
    },
    getPendingNotificationsJson:()=>{throw Error('Peligro: se usó la lectura destructiva');},
    getNotificationDiagnosticsJson:()=>JSON.stringify({connected:true, permission:true,queueCount:q.length})
  };
  const localStorage={getItem:k=>persisted.get(k)||null,setItem:(k,v)=>persisted.set(k,String(v))};
  const Data={store:{expenses,settings:{bankAutoDetect:true,bankAutoSaveMode:mode}},save:()=>{}};
  const UI={t:x=>x,renderBudgetChart(){},showSnackbar(){},formatMoney:x=>String(x)};
  const Finance={renderHomeWidgets(){},renderExpensesHistory(){}};
  if(openModal)Finance.openSmartExpenseModal=(...a)=>{opened.push(a);modalOpen=true;};
  const document={readyState:'loading',getElementById:id=>id==='modal-expense'?modal:null,
    addEventListener:(key,cb)=>callbacks.set('doc:'+key,cb)};
  const window={SmartyAndroid:native,addEventListener:(key,cb)=>callbacks.set('win:'+key,cb)};
  const sandbox={document,window,Data,UI,Finance,localStorage,console,Date,JSON,Math,Number,setTimeout:(cb)=>cb(),setInterval:()=>{},};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'bank-bridge.js'),'utf8'),sandbox,{filename:'bank-bridge.js'});
  callbacks.get('win:load')();
  return {q,acked,opened,expenses,native,bridge:window.SmartyBankBridge,cache,persisted, setModalOpen:v=>modalOpen=v};
}
const valid=(key)=>({key,package:'com.bank.test',title:'Compra aprobada',text:'Compra aprobada por R$ 34,90 em Mercado Central'});
{
 const e=makeRuntime();e.q.push(valid('a'));e.bridge.drainPending();
 assert.equal(e.q.length,0,'Confirmación válida: ACK después de persistir');
 assert.equal(e.bridge.diagnostics().reviewCount,0,'Se muestra el formulario');
 assert.equal(e.opened.length,1);assert.equal(e.expenses.length,0);
}
{
 const e=makeRuntime({openModal:false});e.q.push(valid('b'));e.bridge.drainPending();
 assert.equal(e.q.length,0,'El aviso quedó persistido para revisión aunque no hubiera formulario');
 assert.equal(e.bridge.diagnostics().reviewCount,1,'Conservar para la siguiente apertura');
 assert.equal(e.opened.length,0);
}
{
 const e=makeRuntime({mode:'auto'});e.q.push(valid('c'));e.bridge.drainPending();
 assert.equal(e.expenses.length,1);assert.equal(e.q.length,0);
 e.q.push(valid('c'));e.bridge.drainPending();assert.equal(e.expenses.length,1,'Sin duplicados');
}
{
 const e=makeRuntime();e.q.push({key:'d',package:'com.bank.test',title:'Banco',text:'Pix recebido R$ 200'});
 e.bridge.drainPending();assert.equal(e.q.length,0);assert.equal(e.opened.length,0,'No registrar ingresos');
}
console.log('OK: puente Android, ACK no destructivo, confirmación, pendiente, auto y duplicados.');
const workflow = fs.readFileSync(path.join(__dirname,'.github/workflows/android-apk.yml'),'utf8');
for (const part of ['onListenerConnected()', 'onListenerDisconnected()', 'peekPendingNotificationsJson()', 'ackPendingNotificationsJson(String keys)', 'getNotificationDiagnosticsJson()', 'requestBankListenerRebind()', '🔎 Diagnóstico de notificaciones']) {
  assert(workflow.includes(part), 'El workflow debe generar: ' + part);
}
console.log('OK: workflow genera estado real, rebind, diagnóstico y cola con confirmación.');
