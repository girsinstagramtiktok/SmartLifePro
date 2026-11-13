/* SmartLifePro — cuentas, tarjetas, ingresos y ahorros.
 * Se mantiene aislado del motor de presupuestos existente. Todos los importes
 * se almacenan en centavos; los movimientos internos NO crean gastos.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.SmartyMoneyCore=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const SCHEMA=1;
const cents=v=>{const n=Number(v);if(!Number.isFinite(n))throw Error('Importe inválido');return Math.round(n*100)};
const fromCents=v=>(Number(v)||0)/100;
const id=()=>`sm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
const today=()=>localDate(new Date());
function localDate(date){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDay(day){const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(day||'');if(!m)throw Error('Fecha inválida');const d=new Date(+m[1],+m[2]-1,+m[3],12);if(d.getFullYear()!==+m[1]||d.getMonth()!==+m[2]-1||d.getDate()!==+m[3])throw Error('Fecha inválida');return d}
function period(date=today()){return String(date).slice(0,7)}
function periodNext(period){const [y,m]=period.split('-').map(Number);const d=new Date(y,m,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function state(store){if(!store||typeof store!=='object')throw Error('Datos de la app no disponibles');if(!store.smartyMoney||typeof store.smartyMoney!=='object')store.smartyMoney={};const s=store.smartyMoney;for(const x of ['accounts','cards','movements','incomes','savings'])if(!Array.isArray(s[x]))s[x]=[];if(!s.fixedSources||typeof s.fixedSources!=='object')s.fixedSources={};if(!s.preferences||typeof s.preferences!=='object')s.preferences={};s.schema=SCHEMA;return s}
function find(arr,entryId){const v=arr.find(x=>x.id===entryId);if(!v)throw Error('Elemento no encontrado');return v}
function requireAmount(v){const c=cents(v);if(c<=0)throw Error('Introduce un importe mayor que cero');return c}
function createAccount(s,{name,type='bank',bankDomain='',openingBalance=0}){if(!String(name||'').trim())throw Error('Escribe el nombre de la cuenta');const a={id:id(),name:String(name).trim().slice(0,80),type,bankDomain:String(bankDomain||''),openingCents:cents(openingBalance),createdAt:today()};s.accounts.push(a);return a}
function createCard(s,{name,bankDomain='',limit,openingUsed=0,cutoffDay,dueDay,noticeDays=3,payAccountId=''}){if(!String(name||'').trim())throw Error('Escribe el nombre de la tarjeta');const lim=requireAmount(limit),used=cents(openingUsed),cut=+cutoffDay,due=+dueDay;if(used<0||used>lim)throw Error('Uso de crédito inválido');if(![cut,due].every(x=>Number.isInteger(x)&&x>=1&&x<=31))throw Error('Días de corte y vencimiento inválidos');const c={id:id(),name:String(name).trim().slice(0,80),bankDomain:String(bankDomain||''),limitCents:lim,openingUsedCents:used,cutoffDay:cut,dueDay:due,noticeDays:Math.max(0,Math.min(15,+noticeDays||0)),payAccountId,createdAt:today()};s.cards.push(c);return c}
function createMovement(s,{kind,amount,accountId='',toAccountId='',cardId='',date=today(),sourceId='',key='',note=''}){const amountCents=requireAmount(amount);parseDay(date);if(key){const prev=s.movements.find(m=>m.key===key);if(prev)return prev;}
 if(['expense','fixed-debit','card-payment','transfer','saving-deposit'].includes(kind)&&accountId&&!s.accounts.some(a=>a.id===accountId))throw Error('Cuenta desconocida');
 if(kind==='transfer'&&(!accountId||!toAccountId||accountId===toAccountId||!s.accounts.some(a=>a.id===toAccountId)))throw Error('Selecciona dos cuentas diferentes');
 if(['card-charge','fixed-card','card-payment'].includes(kind)&&!s.cards.some(c=>c.id===cardId))throw Error('Tarjeta desconocida');
 const m={id:id(),kind,amountCents,accountId,toAccountId,cardId,date,sourceId,key,note:String(note||'').slice(0,120)};s.movements.push(m);return m}
function accountBalance(s,accountId){const account=find(s.accounts,accountId);let amount=account.openingCents;for(const m of s.movements){if(m.accountId===accountId){if(['income','adjust-plus','saving-withdrawal'].includes(m.kind))amount+=m.amountCents;else if(['expense','fixed-debit','card-payment','saving-deposit','transfer','adjust-minus'].includes(m.kind))amount-=m.amountCents;}if(m.kind==='transfer'&&m.toAccountId===accountId)amount+=m.amountCents;}return amount}
function cardUsed(s,cardId){const card=find(s.cards,cardId);let used=card.openingUsedCents;for(const m of s.movements)if(m.cardId===cardId){if(['card-charge','fixed-card'].includes(m.kind))used+=m.amountCents;else if(m.kind==='card-payment')used-=m.amountCents;}return Math.max(0,used)}
function cardAvailable(s,cardId){return find(s.cards,cardId).limitCents-cardUsed(s,cardId)}
function payCard(s,cardId,accountId,amount){const due=cardUsed(s,cardId);if(requireAmount(amount)>due)throw Error('El pago supera la deuda registrada');return createMovement(s,{kind:'card-payment',accountId,cardId,amount,note:'Pago de factura'})}
function transfer(s,from,to,amount,note='Transferencia propia'){return createMovement(s,{kind:'transfer',accountId:from,toAccountId:to,amount,note})}
function applyExpense(s,expense,source){if(!expense?.id||!source?.id)return null;const isCard=source.type==='card';const amount=expense.isInstallment?Number(expense.installments?.originalTotal||expense.amount):Number(expense.amount);const expDay=localDate(expense.date||Date.now());const isFuture=expDay>today();if(isFuture)return null;return createMovement(s,{kind:isCard?'card-charge':'expense',amount,accountId:isCard?'':source.id,cardId:isCard?source.id:'',date:expDay,sourceId:expense.id,key:`expense:${expense.id}`,note:expense.desc||''})}
function unlinkExpense(s,expenseId){s.movements=s.movements.filter(m=>m.key!==`expense:${expenseId}`)}
function linkFixedSource(s,subscription,source,date=today()){
 if(!subscription?.id||!source?.id)throw Error('Gasto fijo u origen no válido');
 if(source.type==='account'&&!s.accounts.some(x=>x.id===source.id))throw Error('Cuenta desconocida');
 if(source.type==='card'&&!s.cards.some(x=>x.id===source.id))throw Error('Tarjeta desconocida');
 const dueDay=Math.min(31,Math.max(1,+subscription.day||1));const currentDay=+date.slice(-2);
 s.fixedSources[subscription.id]={sourceType:source.type,sourceId:source.id,startPeriod:currentDay>dueDay?periodNext(period(date)):period(date),createdAt:date};
 return s.fixedSources[subscription.id];
}
function applyFixedDue(s,subscriptions,at=today()){
 const applied=[];const p=period(at),day=+at.slice(-2);const [year,month]=p.split('-').map(Number);const last=new Date(year,month,0).getDate();
 for(const sub of subscriptions||[]){const f=s.fixedSources[sub.id];if(!f||f.startPeriod>p)continue;const due=Math.min(Math.max(+sub.day||1,1),last);if(day<due)continue;const amount=Number(sub.cost);if(!Number.isFinite(amount)||amount<=0)continue;
 const key=`fixed:${sub.id}:${p}`;if(s.movements.some(m=>m.key===key))continue;
 try{const isCard=f.sourceType==='card';applied.push(createMovement(s,{kind:isCard?'fixed-card':'fixed-debit',amount,accountId:isCard?'':f.sourceId,cardId:isCard?f.sourceId:'',date:`${p}-${String(due).padStart(2,'0')}`,sourceId:sub.id,key,note:`Gasto fijo: ${sub.name||''}`}));}catch(e){console.warn('[SmartyMoney] gasto fijo sin origen:',e.message)}
 }return applied}
// Días hábiles de Brasil: fines de semana, feriados bancarios nacionales y excepciones locales editables.
function easter(year){const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;return new Date(year,month-1,day,12)}
function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d}
function brazilBankHolidays(y,custom=[]){const fixed=['01-01','04-21','05-01','09-07','10-12','11-02','11-15','11-20','12-25','12-31'];const eas=easter(y);const moving=[-48,-47,-2,60].map(n=>localDate(addDays(eas,n)));return new Set([...fixed.map(d=>`${y}-${d}`),...moving,...(custom||[])]);}
function isBusinessDay(date,holidays){const d=new Date(date),dow=d.getDay();return dow!==0&&dow!==6&&!holidays.has(localDate(d))}
function nthBusinessDay(year,month,index,holidays){let count=0;for(let d=1;d<=31;d++){const dt=new Date(year,month-1,d,12);if(dt.getMonth()!==month-1)break;if(isBusinessDay(dt,holidays)&&++count===index)return localDate(dt)}throw Error('Día hábil fuera del mes')}
function lastBusinessDay(year,month,holidays){for(let d=new Date(year,month,0,12).getDate();d>=1;d--){const dt=new Date(year,month-1,d,12);if(isBusinessDay(dt,holidays))return localDate(dt)}throw Error('No hay días hábiles')}
function expectedWindow(income,p,customHolidays=[]){const [y,m]=p.split('-').map(Number),holidays=brazilBankHolidays(y,customHolidays);const kind=income.rule;if(kind==='last_business'){const d=lastBusinessDay(y,m,holidays);return {start:d,end:d}}if(kind==='upto_business'){return {start:nthBusinessDay(y,m,1,holidays),end:nthBusinessDay(y,m,+income.businessDay||5,holidays)}}if(kind==='day'){const d=String(Math.min(+income.day||1,new Date(y,m,0).getDate())).padStart(2,'0');return {start:`${p}-${d}`,end:`${p}-${d}`}}return null}
function createIncome(s,{name,amount,accountId,rule='last_business',businessDay=5,day=1,oneTime=false}){find(s.accounts,accountId);const amt=requireAmount(amount);if(!String(name||'').trim())throw Error('Escribe el ingreso');const inc={id:id(),name:String(name).trim().slice(0,80),amountCents:amt,accountId,rule,businessDay:Math.min(20,Math.max(1,+businessDay||5)),day:Math.min(31,Math.max(1,+day||1)),oneTime:!!oneTime,createdAt:today()};s.incomes.push(inc);return inc}
function incomeReceived(s,incomeId,p=period()){return s.movements.some(m=>m.key===`income:${incomeId}:${p}`)}
function confirmIncome(s,incomeId,amount,date=today(),forPeriod=period(date)){const inc=find(s.incomes,incomeId);if(incomeReceived(s,incomeId,forPeriod))throw Error('Este ingreso ya fue confirmado');if(inc.oneTime&&s.movements.some(m=>m.sourceId===inc.id&&m.kind==='income'))throw Error('Ingreso puntual ya confirmado');return createMovement(s,{kind:'income',amount,accountId:inc.accountId,sourceId:inc.id,date,key:`income:${incomeId}:${forPeriod}`,note:inc.name})}
function createSaving(s,{name,principal,rateType='annual',annualRate=0,cdiPercent=100,cdiAnnual=0}){if(!String(name||'').trim())throw Error('Escribe el ahorro');const saving={id:id(),name:String(name).trim().slice(0,80),principalCents:cents(principal),referenceDate:today(),rateType,annualRate:+annualRate||0,cdiPercent:+cdiPercent||100,cdiAnnual:+cdiAnnual||0,entries:[]};s.savings.push(saving);return saving}
function savingAnnualRate(v){return v.rateType==='cdi'?(v.cdiAnnual*v.cdiPercent/100):v.annualRate}
function savingsProjection(saving,date=today()){
 const r=savingAnnualRate(saving)/100;if(r<=-1||!Number.isFinite(r))return {grossCents:saving.principalCents,interestCents:0};
 const days=(a,b)=>Math.max(0,(parseDay(b)-parseDay(a))/86400000);
 const compound=(v,start)=>v*Math.pow(1+r,days(start,date)/365);
 let gross=compound(saving.principalCents,saving.referenceDate);
 for(const m of saving.entries||[])if(m.date<=date)gross+=compound(m.amountCents,m.date);
 const principal=saving.principalCents+(saving.entries||[]).filter(m=>m.date<=date).reduce((sum,m)=>sum+m.amountCents,0);
 return {grossCents:Math.round(gross),interestCents:Math.round(gross)-principal,principalCents:principal};
}
function savingDeposit(s,savingId,accountId,amount,date=today()){
 const saving=find(s.savings,savingId);const c=requireAmount(amount);find(s.accounts,accountId);
 // Depósito = traslado patrimonial; nunca se suma al presupuesto mensual como gasto.
 const m=createMovement(s,{kind:'saving-deposit',amount,accountId,date,note:`Ahorro: ${saving.name}`});saving.entries.push({id:m.id,date,amountCents:c});return m;
}
function savingWithdrawal(s,savingId,accountId,amount,date=today()){const v=find(s.savings,savingId);find(s.accounts,accountId);const c=requireAmount(amount);if(c>savingsProjection(v,date).grossCents)throw Error('El retiro supera el ahorro estimado');const m=createMovement(s,{kind:'saving-withdrawal',amount,accountId,date,note:`Retiro del ahorro: ${v.name}`});v.entries.push({id:m.id,date,amountCents:-c});return m}
function reconcileSaving(s,savingId,balance,date=today()){const v=find(s.savings,savingId);v.principalCents=cents(balance);v.referenceDate=date;v.entries=[];return v}
return {state,cents,fromCents,localDate,today,period,createAccount,createCard,createMovement,accountBalance,cardUsed,cardAvailable,payCard,transfer,applyExpense,unlinkExpense,linkFixedSource,applyFixedDue,brazilBankHolidays,isBusinessDay,nthBusinessDay,lastBusinessDay,expectedWindow,createIncome,incomeReceived,confirmIncome,createSaving,savingAnnualRate,savingsProjection,savingDeposit,savingWithdrawal,reconcileSaving};
});
