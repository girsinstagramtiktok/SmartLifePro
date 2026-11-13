'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('./smarty-money-core.js');
const Matcher=require('./smarty-bank-source.js');
function fixture(){
 const store={settings:{bankAutoDetect:true,bankAutoSaveMode:'auto'},expenses:[]};
 const st=C.state(store);
 const acc=C.createAccount(st,{name:'Nubank débito',bankDomain:'nubank.com.br',openingBalance:1000});acc.last4='1010';
 const card=C.createCard(st,{name:'Nubank crédito',bankDomain:'nubank.com.br',limit:5000,openingUsed:300,cutoffDay:20,dueDay:5});card.last4='2020';
 const mp=C.createAccount(st,{name:'Mercado Pago conta',bankDomain:'mercadopago.com.br',openingBalance:200});
 return {store,st,acc,card,mp};
}
const notice=(key,text,pkg='com.nu.production',title='Compra aprovada')=>({key,package:pkg,title,text});
{
 const {st,acc,card,mp}=fixture();
 const credit=Matcher.infer(notice('a','Compra no cartão de crédito de R$ 24,90'),st);
 assert.deepEqual(credit.source,{type:'card',id:card.id});
 const debit=Matcher.infer(notice('b','Compra no cartão de débito de R$ 24,90'),st);
 assert.deepEqual(debit.source,{type:'account',id:acc.id});
 const suffix=Matcher.infer(notice('c','Compra aprovada no cartão final 2020. Valor R$ 12,90'),st);
 assert.deepEqual(suffix.source,{type:'card',id:card.id},'Número final identifica o cartão');
 const generic=Matcher.infer(notice('d','Compra aprovada de R$ 12,90'),st);
 assert.equal(generic.source,null,'No adivinar al tener débito y crédito');
 const mpNotice=Matcher.infer(notice('e','Compra no débito de R$ 17,00','com.mercadopago.wallet'),st);
 assert.deepEqual(mpNotice.source,{type:'account',id:mp.id});
 assert.equal(Matcher.infer(notice('f','Compra no crédito R$ 17,00','com.unknown.bank'),st).source,null);
 assert.equal(Matcher.infer(notice('g','Compra aprovada cartão final 9999 por R$ 17,00'),st).source,null,'No ignorar terminación contradictoria');
 assert.equal(Matcher.classifyType('Pix enviado para José no valor de R$ 30,00'),'account');
 assert.equal(Matcher.bankByPackage('br.com.bb.android')?.id,'bb');
 assert.equal(Matcher.bankByPackage('br.com.intermedium')?.id,'inter');
}
function runtime(mode='auto'){
 const {store,st,acc,card}=fixture();store.settings.bankAutoSaveMode=mode;
 const memo=new Map(),handlers=new Map(),events=[],q=[],acked=[];let modalOpen=false;
 const Data={store,save(){events.push('save')}};
 const UI={t:x=>x,formatMoney:x=>String(x),renderBudgetChart(){},showSnackbar(){}};
 const Finance={openSmartExpenseModal(...args){events.push(['modal',...args]);modalOpen=true},renderHomeWidgets(){},renderExpensesHistory(){}};
 const document={readyState:'loading',visibilityState:'visible',getElementById(id){if(id==='modal-expense')return {classList:{contains:name=>name==='open'&&modalOpen}};return null},addEventListener:(name,fn)=>handlers.set('doc:'+name,fn)};
 const window={SmartyMoneyCore:C,SmartyBankSource:Matcher,SmartyMoneyUI:{setDetectedBankSource(v){events.push(['choice',v])}},SmartyAndroid:{
  peekPendingNotificationsJson:()=>JSON.stringify(q),getPendingNotificationsJson:()=>{throw Error("Leitura destrutiva não permitida")},ackPendingNotificationsJson:raw=>{const keys=JSON.parse(raw);acked.push(...keys);for(let i=q.length-1;i>=0;i--)if(keys.includes(q[i].key))q.splice(i,1)},getNotificationDiagnosticsJson:()=>JSON.stringify({connected:true,permission:true,queueCount:q.length})},
  addEventListener:(name,fn)=>handlers.set('win:'+name,fn)};
 const localStorage={getItem:k=>memo.get(k)||null,setItem:(k,v)=>memo.set(k,String(v))};
 const sandbox={window,document,localStorage,Data,UI,Finance,console,JSON,Math,Number,Date,setInterval(){},setTimeout(fn){fn()}};
 vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync('./bank-bridge.js','utf8'),sandbox,{filename:'bank-bridge.js'});
 handlers.get('win:load')();
 return {store,st,acc,card,q,acked,events,bridge:window.SmartyBankBridge};
}
{
 const r=runtime();const startUsed=C.cardUsed(r.st,r.card.id),balance=C.accountBalance(r.st,r.acc.id);
 r.q.push(notice('1','Compra no cartão de crédito R$ 30,00 em Loja'));r.bridge.drainPending();
 assert.equal(r.store.expenses.length,1);assert.equal(C.cardUsed(r.st,r.card.id),startUsed+3000);
 assert.equal(C.accountBalance(r.st,r.acc.id),balance,'Compra a crédito não debita saldo');
 assert.equal(r.store.expenses[0].smSource?.type,'card');
 r.q.push(notice('1','Compra no cartão de crédito R$ 30,00 em Loja'));r.bridge.drainPending();
 assert.equal(r.store.expenses.length,1,'ACK/repetição não duplica');
 r.q.push(notice('2','Compra no cartão de débito R$ 15,00 em Loja'));r.bridge.drainPending();
 assert.equal(C.accountBalance(r.st,r.acc.id),balance-1500);
 assert.equal(r.store.expenses.length,2,'Cada compra uma única linha no orçamento');
 assert.equal(r.st.movements.length,2,'Uma movimentação por compra');
}
{
 const r=runtime('confirm');r.q.push(notice('3','Compra no cartão de débito R$ 43,50 em Mercado'));
 r.bridge.drainPending();assert.equal(r.store.expenses.length,0);
 const choice=r.events.find(x=>Array.isArray(x)&&x[0]==='choice');
 assert.equal(choice[1].source.id,r.acc.id,'Sugerir a conta no formulário de confirmação');
}
{
 const r=runtime('confirm');r.q.push(notice('4','Compra aprovada R$ 14,90 em Loja'));
 r.bridge.drainPending();const choice=r.events.find(x=>Array.isArray(x)&&x[0]==='choice');
 assert.equal(choice[1].source,null,'Não herdar a última conta no aviso ambíguo');
}
{
 const r=runtime();r.q.push(notice('5','Compra aprovada R$ 14,90 em Loja'));
 r.bridge.drainPending();assert.equal(r.store.expenses.length,1);
 assert.equal(r.store.expenses[0].smSource,undefined,'Modo auto não desconta conta sem prova');
 assert.equal(r.st.movements.length,0,'Sem movimentação financeira desconhecida');
}
{
 const r=runtime();
 const today=new Date().getDate();
 const sub={id:'sub_auto_test',name:'ChatGPT Plus',cost:95,day:today};
 r.store.subscriptions=[sub];C.linkFixedSource(r.st,sub,{type:'card',id:r.card.id});
 const debt=C.cardUsed(r.st,r.card.id);
 r.q.push(notice('fixed','Compra no cartão de crédito R$ 95,00 em ChatGPT Plus'));
 r.bridge.drainPending();
 assert.equal(r.store.expenses.length,0,'Assinatura já reservada não vira despesa adicional');
 assert.equal(C.cardUsed(r.st,r.card.id),debt+9500,'Único débito de cartão, na data prevista');
 assert.equal(r.st.movements.filter(m=>m.kind==='fixed-card').length,1);
 assert.equal(r.st.movements[0].bankConfirmed,true);
 r.q.push(notice('fixed','Compra no cartão de crédito R$ 95,00 em ChatGPT Plus'));
 r.bridge.drainPending();assert.equal(C.cardUsed(r.st,r.card.id),debt+9500,'Notificação repetida não cobra de novo');
}
{
 const r=runtime();r.q.push(notice('6','Pix recebido R$ 150,00'));
 r.bridge.drainPending();assert.equal(r.store.expenses.length,0,'Recebimento não vira gasto');
}
{
 const r=runtime();r.q.push(notice('7','Pagamento da fatura do cartão de crédito R$ 500,00 realizado'));
 r.bridge.drainPending();assert.equal(r.store.expenses.length,0,'Pagamento de fatura não vira compra de crédito');
}
const wf=fs.readFileSync('./.github/workflows/android-apk.yml','utf8'),html=fs.readFileSync('./index.html','utf8'),ui=fs.readFileSync('./smarty-money-ui.js','utf8');
assert(html.indexOf('smarty-bank-source.js')>=0&&html.indexOf('smarty-bank-source.js')<html.indexOf('bank-bridge.js'));
assert(wf.includes('bank-bridge.js camera-bridge.js smarty-bank-source.js')&&wf.includes('node smarty-bank-source-tests.cjs'));
assert(ui.includes('setDetectedBankSource')&&ui.includes("'last4'"));
console.log('OK: notif identifica débito/crédito, limites, contas, terminación, indecisos, duplicados, confirmación y empaque.');
