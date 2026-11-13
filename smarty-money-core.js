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
 if(['card-charge','fixed-card','card-payment','card-adjust-plus','card-adjust-minus'].includes(kind)&&!s.cards.some(c=>c.id===cardId))throw Error('Tarjeta desconocida');
 const m={id:id(),kind,amountCents,accountId,toAccountId,cardId,date,sourceId,key,note:String(note||'').slice(0,120)};s.movements.push(m);return m}
function accountBalance(s,accountId){const account=find(s.accounts,accountId);let amount=account.openingCents;for(const m of s.movements){if(m.accountId===accountId){if(['income','adjust-plus','saving-withdrawal'].includes(m.kind))amount+=m.amountCents;else if(['expense','fixed-debit','card-payment','saving-deposit','transfer','adjust-minus'].includes(m.kind))amount-=m.amountCents;}if(m.kind==='transfer'&&m.toAccountId===accountId)amount+=m.amountCents;}return amount}
function cardUsed(s,cardId){const card=find(s.cards,cardId);let used=card.openingUsedCents;for(const m of s.movements)if(m.cardId===cardId){if(['card-charge','fixed-card','card-adjust-plus'].includes(m.kind))used+=m.amountCents;else if(['card-payment','card-adjust-minus'].includes(m.kind))used-=m.amountCents;}return Math.max(0,used)}
function cardAvailable(s,cardId){return find(s.cards,cardId).limitCents-cardUsed(s,cardId)}
// Conciliar el crédito utilizado REAL sin modificar el histórico de compras o pagos.
// Este movimiento afecta solo al límite disponible, nunca al presupuesto mensual.
function reconcileCardUsed(s,cardId,usedNow){
 find(s.cards,cardId);
 const value=cents(usedNow);
 if(value<0)throw Error('El crédito utilizado no puede ser negativo');
 const current=cardUsed(s,cardId);
 if(value===current)return null;
 return createMovement(s,{
  kind:value>current?'card-adjust-plus':'card-adjust-minus',
  amount:Math.abs(value-current)/100,cardId,
  note:'Conciliación manual del crédito utilizado'
 });
}
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
function updateAccount(s,accountId,fields){
 const a=find(s.accounts,accountId);
 const name=String(fields.name??a.name).trim();if(!name)throw Error('Escribe el nombre de la cuenta');
 const type=String(fields.type??a.type);if(!['bank','wallet','cash'].includes(type))throw Error('Tipo de cuenta inválido');
 const bankDomain=String(fields.bankDomain??a.bankDomain??'').slice(0,120);
 const openingCents=fields.openingBalance===undefined?a.openingCents:cents(fields.openingBalance);
 Object.assign(a,{name:name.slice(0,80),type,bankDomain,openingCents});return a;
}
function updateCard(s,cardId,fields){
 const c=find(s.cards,cardId),name=String(fields.name??c.name).trim();if(!name)throw Error('Escribe el nombre de la tarjeta');
 const limitCents=fields.limit===undefined?c.limitCents:requireAmount(fields.limit);
 const openingUsedCents=fields.openingUsed===undefined?c.openingUsedCents:cents(fields.openingUsed);
 if(openingUsedCents<0)throw Error('Crédito utilizado inicial inválido');
 const cutoffDay=Number(fields.cutoffDay??c.cutoffDay),dueDay=Number(fields.dueDay??c.dueDay);
 if(![cutoffDay,dueDay].every(v=>Number.isInteger(v)&&v>=1&&v<=31))throw Error('Días de factura inválidos');
 const noticeDays=Number(fields.noticeDays??c.noticeDays);
 if(!Number.isInteger(noticeDays)||noticeDays<0||noticeDays>15)throw Error('Aviso inválido');
 const payAccountId=fields.payAccountId===undefined?c.payAccountId:fields.payAccountId;
 if(payAccountId&&!s.accounts.some(x=>x.id===payAccountId))throw Error('Cuenta de pago inexistente');
 Object.assign(c,{name:name.slice(0,80),bankDomain:String(fields.bankDomain??c.bankDomain??''),limitCents,openingUsedCents,cutoffDay,dueDay,noticeDays,payAccountId});
 return c;
}
function updateIncome(s,incomeId,fields){
 const i=find(s.incomes,incomeId),name=String(fields.name??i.name).trim();if(!name)throw Error('Escribe el nombre del ingreso');
 const amountCents=fields.amount===undefined?i.amountCents:requireAmount(fields.amount);
 const accountId=fields.accountId??i.accountId;find(s.accounts,accountId);
 const rule=String(fields.rule??i.rule);if(!['last_business','upto_business','day','once'].includes(rule))throw Error('Regla de fecha inválida');
 const businessDay=Number(fields.businessDay??i.businessDay??5),day=Number(fields.day??i.day??5);
 if(!Number.isInteger(day)||day<1||day>31||!Number.isInteger(businessDay)||businessDay<1||businessDay>20)throw Error('Día inválido');
 Object.assign(i,{name:name.slice(0,80),amountCents,accountId,rule,oneTime:rule==='once',day,businessDay});return i;
}
function createSaving(s,{name,principal,rateType='annual',annualRate=0,cdiPercent=100,cdiAnnual=0,selicAnnual=0,trMonthly=0,productId='',autoMarket=false,capCents=0,excessPercent=null,referenceDate=today(),rateAsOf=''}){
 if(!String(name||'').trim())throw Error('Escribe el ahorro');const principalCents=cents(principal);
 if(principalCents<0)throw Error('Saldo inicial de ahorro inválido');parseDay(referenceDate);
 const saving={id:id(),name:String(name).trim().slice(0,80),principalCents,referenceDate,rateType,annualRate:0,cdiPercent:0,cdiAnnual:0,selicAnnual:0,trMonthly:0,productId,autoMarket:!!autoMarket,rateAsOf,
 capCents,excessPercent,entries:[]};
 updateSavingRates(saving,{rateType,annualRate,cdiPercent,cdiAnnual,selicAnnual,trMonthly,capCents,excessPercent});
 s.savings.push(saving);return saving;
}
function updateSavingRates(saving,fields){
 const rateType=String(fields.rateType??saving.rateType??'annual');if(!['cdi','annual','poupanca'].includes(rateType))throw Error('Tipo de rendimiento inválido');
 const asNumber=(v,fallback,label,max=300)=>{const n=Number(v??fallback??0);if(!Number.isFinite(n)||n<0||n>max)throw Error(`${label} inválido`);return n};
 const annualRate=asNumber(fields.annualRate,saving.annualRate,'Tasa anual');
 const cdiPercent=asNumber(fields.cdiPercent,saving.cdiPercent,'Porcentaje CDI',500);
 const cdiAnnual=asNumber(fields.cdiAnnual,saving.cdiAnnual,'CDI anual',80);
 const selicAnnual=asNumber(fields.selicAnnual,saving.selicAnnual,'Selic anual',80);
 const trMonthly=asNumber(fields.trMonthly,saving.trMonthly,'TR mensual',20);
 const capCents=fields.capCents===undefined?(saving.capCents||0):Number(fields.capCents);
 const excessPercent=fields.excessPercent===undefined?(saving.excessPercent??null):(fields.excessPercent===null||fields.excessPercent===''?null:asNumber(fields.excessPercent,null,'CDI excedente',500));
 if(!Number.isSafeInteger(capCents)||capCents<0)throw Error('Tope inválido');
 Object.assign(saving,{rateType,annualRate,cdiPercent,cdiAnnual,selicAnnual,trMonthly,capCents,excessPercent});
 return saving;
}
function updateSaving(s,savingId,fields){
 const v=find(s.savings,savingId),name=String(fields.name??v.name).trim();if(!name)throw Error('Escribe el nombre del ahorro');
 const principalCents=fields.principal===undefined?v.principalCents:cents(fields.principal);
 if(principalCents<0)throw Error('Saldo inicial inválido');
 const referenceDate=fields.referenceDate??v.referenceDate;parseDay(referenceDate);
 const copy={...v};updateSavingRates(copy,fields);
 Object.assign(v,copy,{name:name.slice(0,80),principalCents,referenceDate,
 productId:String(fields.productId??v.productId??''),autoMarket:fields.autoMarket===undefined?!!v.autoMarket:fields.autoMarket===true||fields.autoMarket==='true'||fields.autoMarket==='on',
 rateAsOf:String(fields.rateAsOf??v.rateAsOf??'')});return v;
}
function applyMarketRates(s,rates){
 for(const v of s.savings){if(v.autoMarket===false)continue;
  if(v.rateType==='cdi'&&Number.isFinite(+rates.cdiAnnual))v.cdiAnnual=+rates.cdiAnnual;
  if(v.rateType==='poupanca'){
   if(Number.isFinite(+rates.selicAnnual))v.selicAnnual=+rates.selicAnnual;
   if(Number.isFinite(+rates.trMonthly))v.trMonthly=+rates.trMonthly;
  }
  v.rateAsOf=rates.asOf||v.rateAsOf;
 }
}
function savingAnnualRate(v){return v.rateType==='cdi'?((+v.cdiAnnual||0)*(+v.cdiPercent||0)/100):(+v.annualRate||0)}
function savingsProjection(saving,date=today()){
 parseDay(date);const start=saving.referenceDate;
 const entries=(saving.entries||[]).filter(m=>m.date<=date).sort((a,b)=>a.date.localeCompare(b.date));
 const principal=saving.principalCents+entries.reduce((sum,m)=>sum+m.amountCents,0);
 if(date<start)return {grossCents:saving.principalCents,interestCents:0,principalCents:saving.principalCents,needsRate:false};
 if(date===start)return {grossCents:principal,interestCents:0,principalCents:principal,needsRate:false};
 const days=(a,b)=>Math.max(0,(parseDay(b)-parseDay(a))/86400000);
 const needsRate=(saving.rateType==='cdi'&&(!saving.cdiAnnual||!saving.cdiPercent))||(saving.rateType==='poupanca'&&(!saving.selicAnnual))||(saving.rateType==='annual'&&saving.productId&&saving.productId!=='personalizado'&&!saving.annualRate);
 if(needsRate)return {grossCents:principal,interestCents:0,principalCents:principal,needsRate:true};
 let gross=saving.principalCents;
 if(saving.rateType==='cdi'){
  // CDI diario estimado con tasa anual actual, calendario de 252 días hábiles.
  // El cálculo no reconstruye tasas pasadas ni impuestos; el valor es una proyección.
  const dbase=Math.pow(1+saving.cdiAnnual/100,1/252)-1;
  const cap=saving.capCents>0?saving.capCents:0;
  let cursor=parseDay(start),idx=0;
  const finish=parseDay(date),holidays=new Map();
  while(cursor<finish){cursor=addDays(cursor,1);const dt=localDate(cursor);
   while(idx<entries.length&&entries[idx].date<=dt){gross+=entries[idx].amountCents;idx++}
   const year=cursor.getFullYear();if(!holidays.has(year))holidays.set(year,brazilBankHolidays(year));
   if(!isBusinessDay(cursor,holidays.get(year)))continue;
   const lower=cap?Math.min(Math.max(gross,0),cap):Math.max(gross,0);
   const excess=cap?Math.max(0,gross-cap):0;
   gross+=lower*dbase*(saving.cdiPercent/100)+excess*dbase*(saving.excessPercent==null?0:Number(saving.excessPercent)/100);
  }
 }else if(saving.rateType==='poupanca'){
  // Estimación: aplica el último valor público de TR y Selic en cada aniversario.
  // Con retiros, la entidad puede aplicar el menor saldo del período.
  const base=saving.selicAnnual>8.5?.005:Math.pow(1+saving.selicAnnual*0.7/100,1/12)-1;
  const monthly=(1+base)*(1+(+saving.trMonthly||0)/100)-1;
  const lots=[{amount:saving.principalCents,anchor:start,credited:0}];
  // Cada depósito mantiene su día de aniversario. La TR futura es aproximada;
  // para retiros se usa un cálculo FIFO de lotes que puede diferir del banco.
  const run=(cutoff)=>{for(const lot of lots){if(lot.amount<=0)continue;
    const a=parseDay(lot.anchor),b=parseDay(cutoff);if(b<=a)continue;
    const anniversaryDay=a.getDate()>=29?1:a.getDate();
    let ticks=0,anniv=new Date(a.getFullYear(),a.getMonth()+1,anniversaryDay,12);
    while(anniv<=b&&ticks<1200){ticks++;const mo=anniv.getMonth(),yr=anniv.getFullYear();anniv=new Date(yr,mo+1,anniversaryDay,12)}
    if(ticks>lot.credited){lot.amount*=Math.pow(1+monthly,ticks-lot.credited);lot.credited=ticks;}
  }};
  for(const e of entries){run(e.date);if(e.amountCents>=0)lots.push({amount:e.amountCents,anchor:e.date,credited:0});else {let toWithdraw=-e.amountCents;for(const lot of lots){const n=Math.min(lot.amount,toWithdraw);lot.amount-=n;toWithdraw-=n;if(toWithdraw<=0)break}}}
  run(date);gross=lots.reduce((s,l)=>s+l.amount,0);
 }else{
  const r=savingAnnualRate(saving)/100;
  if(r<=-1||!Number.isFinite(r))return {grossCents:principal,interestCents:0,principalCents:principal,needsRate:true};
  const compound=(v,from)=>v*Math.pow(1+r,days(from,date)/365);
  gross=compound(saving.principalCents,start);
  for(const m of entries)gross+=compound(m.amountCents,m.date);
 }
 gross=Math.max(0,gross);
 return {grossCents:Math.round(gross),interestCents:Math.round(gross)-principal,principalCents:principal,needsRate:false};
}
function savingDeposit(s,savingId,accountId,amount,date=today()){
 const saving=find(s.savings,savingId);const c=requireAmount(amount);find(s.accounts,accountId);
 // Depósito = traslado patrimonial; nunca se suma al presupuesto mensual como gasto.
 const m=createMovement(s,{kind:'saving-deposit',amount,accountId,date,note:`Ahorro: ${saving.name}`});saving.entries.push({id:m.id,date,amountCents:c});return m;
}
function savingWithdrawal(s,savingId,accountId,amount,date=today()){const v=find(s.savings,savingId);find(s.accounts,accountId);const c=requireAmount(amount);if(c>savingsProjection(v,date).grossCents)throw Error('El retiro supera el ahorro estimado');const m=createMovement(s,{kind:'saving-withdrawal',amount,accountId,date,note:`Retiro del ahorro: ${v.name}`});v.entries.push({id:m.id,date,amountCents:-c});return m}
function reconcileSaving(s,savingId,balance,date=today()){const v=find(s.savings,savingId);v.principalCents=cents(balance);v.referenceDate=date;v.entries=[];return v}
return {state,cents,fromCents,localDate,today,period,createAccount,createCard,updateAccount,updateCard,updateIncome,updateSaving,applyMarketRates,createMovement,accountBalance,cardUsed,cardAvailable,reconcileCardUsed,payCard,transfer,applyExpense,unlinkExpense,linkFixedSource,applyFixedDue,brazilBankHolidays,isBusinessDay,nthBusinessDay,lastBusinessDay,expectedWindow,createIncome,incomeReceived,confirmIncome,createSaving,savingAnnualRate,savingsProjection,savingDeposit,savingWithdrawal,reconcileSaving};
});
