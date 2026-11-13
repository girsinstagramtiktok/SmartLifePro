/* SmartLifePro · Catálogo de productos de ahorro brasileños y tasas públicas.
 * Referencias verificadas: 13/11/2026. Rendimientos de ofertas y campañas pueden cambiar.
 * No usa Open Finance, no obtiene información de cuentas privadas.
 */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.SmartyInvestmentCatalog=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const verifiedAt='2026-11-13';
// cdiPercent=null => la tasa es contractual o depende de permanencia/campaña y NO debe inventarse.
const products=[
 {id:'nubank-caixinha',bank:'Nubank',name:'Caixinha normal',rateType:'cdi',cdiPercent:100,source:'https://nubank.com.br/nu/caixinhas',note:'100% del CDI. Confirma las condiciones de tu caixinha.'},
 {id:'nubank-turbo-115',bank:'Nubank',name:'Caixinha Turbo 115%',rateType:'cdi',cdiPercent:115,source:'https://blog.nubank.com.br/calculadoras/caixinhas-ou-poupanca/',note:'Requiere cumplir la condición de movimiento mensual. Comprueba que esté activa.'},
 {id:'nubank-turbo-120',bank:'Nubank',name:'Caixinha Turbo 120%',rateType:'cdi',cdiPercent:120,source:'https://blog.nubank.com.br/calculadoras/caixinhas-ou-poupanca/',note:'Solo para categorías o servicios elegibles. Confirma tu tasa.'},
 {id:'itau-cofrinho',bank:'Itaú',name:'Cofrinhos Itaú',rateType:'cdi',cdiPercent:100,source:'https://feito.itau.com.br/cofrinhos-itau-seu-dinheiro-a-servico-dos-seus-sonhos',note:'CDB que rinde 100% del CDI.'},
 {id:'picpay-cofrinho',bank:'PicPay',name:'Cofrinhos PicPay',rateType:'cdi',cdiPercent:102,source:'https://meajuda.picpay.com/hc/pt-br/articles/11994164958355-Quanto-rendem-os-Cofrinhos-do-PicPay-e-quais-impostos-s%C3%A3o-cobrados',note:'102% del CDI como base publicada; campañas pueden modificarlo.'},
 {id:'picpay-promo',bank:'PicPay',name:'Cofrinho promocional',rateType:'cdi',cdiPercent:null,source:'https://meajuda.picpay.com/hc/pt-br/articles/11994164958355-Quanto-rendem-os-Cofrinhos-do-PicPay-e-quais-impostos-s%C3%A3o-cobrados',note:'La oferta puede llegar a 121% CDI según elegibilidad. Introduce la tasa real de tu cofrinho.'},
 {id:'inter-dia',bank:'Inter',name:'Meu Porquinho Dia a Dia',rateType:'cdi',cdiPercent:null,suggestedPercent:80,source:'https://ajuda.inter.co/investimentos/qual-e-a-rentabilidade-do-meu-porquinho',note:'Hasta 80% CDI. Verifica el porcentaje contratado.'},
 {id:'inter-objetivos',bank:'Inter',name:'Meu Porquinho por Objetivos',rateType:'cdi',cdiPercent:null,suggestedPercent:100,source:'https://ajuda.inter.co/investimentos/qual-e-a-rentabilidade-do-meu-porquinho',note:'Hasta 100% CDI. La tasa puede variar por aplicación.'},
 {id:'mercado-cofrinho',bank:'Mercado Pago',name:'Cofrinho estándar',rateType:'cdi',cdiPercent:105,source:'https://www.mercadopago.com.br/blog/quanto-rende-cofrinhos-mercado-pago',note:'105% CDI indicado en la comunicación del 27/10/2026; existen condiciones y límites. Comprueba tu cuenta.',capBRL:20000,excessPercent:null},
 {id:'mercado-115',bank:'Mercado Pago',name:'Cofrinho con depósitos',rateType:'cdi',cdiPercent:115,source:'https://www.mercadopago.com.br/cofrinhos',note:'115% CDI al ingresar R$1.000/mes según oferta; sujeta a topes. Verifica las condiciones.',capBRL:5000,excessPercent:null},
 {id:'mercado-meli',bank:'Mercado Pago',name:'Cofrinho Meli+',rateType:'cdi',cdiPercent:120,source:'https://www.mercadopago.com.br/cofrinhos',note:'120% CDI con Meli+, sujeto a límite y elegibilidad.',capBRL:10000,excessPercent:null},
 {id:'bb-rende-facil',bank:'Banco do Brasil',name:'BB Rende Fácil',rateType:'cdi',cdiPercent:null,source:'https://blog.bb.com.br/bb-rende-facil-saldo-da-conta-corrente/',note:'Rentabilidad progresiva por permanencia, hasta 100% CDI. Sin escala contractual no hay tasa fija fiable: introduce la que te aplica.'},
 {id:'bb-cdb',bank:'Banco do Brasil',name:'CDB DI / Progressivo BB',rateType:'cdi',cdiPercent:null,source:'https://www.bb.com.br/site/cdb/',note:'Porcentaje de CDI definido al contratar y eventualmente por tiempo. Confirma en el contrato.'},
 {id:'bb-cofrinho',bank:'Banco do Brasil',name:'Cofrinho BB (fondo)',rateType:'annual',annualRate:null,source:'https://www.bb.com.br/site/investimentos/cofrinho-bb/',note:'Fondo de renta fija, no un CDB a %CDI garantizado. Se requiere rentabilidad histórica del fondo, gastos y valor cuota. Introduce una tasa anual estimada si deseas simular.'},
 {id:'santander-reservas',bank:'Santander',name:'Minhas Reservas',rateType:'cdi',cdiPercent:100,source:'https://www.santander.com.br/investimentos/minhas-reservas/',note:'100% CDI según el producto anunciado; confirma la modalidad y vigencia en la app.'},
 {id:'bradesco-invest-facil',bank:'Bradesco',name:'Invest Fácil',rateType:'cdi',cdiPercent:null,source:'https://banco.bradesco/html/classic/portal-investimentos/invest-facil.shtm',note:'CDB automático con tasa progresiva por plazo y porcentaje contractual. Introduce la tasa que realmente te corresponde.'},
 {id:'c6-cdb-diario',bank:'C6 Bank',name:'CDB liquidez diaria C6',rateType:'cdi',cdiPercent:101.5,source:'https://www.c6bank.com.br/c6-invest/renda-fixa/',note:'Oferta anunciada de 101,5% CDI; la tasa de tu contrato puede diferir.'},
 {id:'caixa-cdb',bank:'Caixa',name:'CDB Caixa liquidez diaria',rateType:'cdi',cdiPercent:100,source:'https://www.caixa.gov.br/diadocliente/Paginas/default.aspx',note:'Oferta publicada de 100% CDI; verifica la contratación.'},
 {id:'99-cofrinho',bank:'99Pay',name:'Cofrinho 99Pay',rateType:'cdi',cdiPercent:110,capBRL:5000,excessPercent:80,source:'https://99app.com/99pay/cofrinho/',note:'110% CDI hasta R$5.000 y 80% por encima, salvo campañas. La fórmula por tramos es aproximada.'},
 {id:'99-saldo',bank:'99Pay',name:'Saldo 99Pay',rateType:'cdi',cdiPercent:105,capBRL:5000,excessPercent:80,source:'https://99app.com/99pay/lucratividade/',note:'105% CDI hasta R$5.000 y 80% excedente. Condiciones vigentes desde noviembre 2026.'},
 {id:'poupanca',bank:'Brasil · todos',name:'Poupança tradicional',rateType:'poupanca',source:'https://www.bcb.gov.br/estatisticas/remuneradepositospoupanca',note:'Regla legal: TR + 0,5%/mes si Selic > 8,5%; si no, 70% de Selic mensualizada + TR. Crédito por aniversario.'},
 {id:'cdb-cdi',bank:'Otro / Personalizado',name:'CDB posfijado (% CDI)',rateType:'cdi',cdiPercent:null,source:'https://www.bb.com.br/site/cdb/',note:'Introduce el porcentaje de CDI de tu contrato; no existe un único % para todo CDB.'},
 {id:'cdb-prefijado',bank:'Otro / Personalizado',name:'CDB prefijado (% anual)',rateType:'annual',annualRate:null,source:'https://www.bb.com.br/site/cdb/',note:'Introduce la tasa efectiva anual pactada al contratar.'},
 {id:'lci-lca',bank:'Otro / Personalizado',name:'LCI / LCA (% CDI)',rateType:'cdi',cdiPercent:null,source:'https://feito.itau.com.br/investimentos-comparacao-cdb-lci-lca-poupanca-cofrinhos/',note:'Porcentaje pactado en contrato. Generalmente exento de IR para persona física bajo reglas vigentes; verificar normativa.'},
 {id:'personalizado',bank:'Otro / Personalizado',name:'Otro rendimiento anual',rateType:'annual',annualRate:null,source:'',note:'Introduce la tasa anual efectiva que uses para estimar.'}
];
const byId=id=>products.find(p=>p.id===id)||null;
const initialRates={cdiAnnual:13.65,selicAnnual:13.75,trMonthly:0.1691,asOf:'2026-11-10',source:'snapshot-2026-11-10'};
const endpoints={cdi:'https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json',selic:'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json',tr:'https://api.bcb.gov.br/dados/serie/bcdata.sgs.226/dados/ultimos/1?formato=json'};
function marketRates(preferences){const p=preferences?.marketRates||{};return {...initialRates,...p}}
function validateRate(n,label,max){const val=Number(n);if(!Number.isFinite(val)||val<0||val>max)throw Error(`${label}: valor inválido`);return val;}
function defaultFor(id,rates=initialRates){const product=byId(id)||byId('personalizado');const params={productId:product.id,rateType:product.rateType,
 cdiPercent:product.cdiPercent===null?0:product.cdiPercent,
 annualRate:product.annualRate==null?0:product.annualRate,
 cdiAnnual:Number(rates.cdiAnnual)||0,selicAnnual:Number(rates.selicAnnual)||0,trMonthly:Number(rates.trMonthly)||0,
 rateAsOf:rates.asOf||initialRates.asOf,capCents:Math.round((product.capBRL||0)*100),
 excessPercent:product.excessPercent??null};return params;}
async function refresh(preferences,{fetcher=(typeof fetch==='function'?fetch:null),timeoutMs=6500}={}){
 if(!fetcher)throw Error('Conexión no disponible');const prev=marketRates(preferences);const response=await Promise.allSettled(Object.entries(endpoints).map(async([key,url])=>{
  const controller=typeof AbortController==='function'?new AbortController():null;
  const id=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
  try{const resp=await fetcher(url,controller?{signal:controller.signal}:undefined);if(!resp.ok)throw Error(`BCB HTTP ${resp.status}`);
   const arr=await resp.json();if(!Array.isArray(arr)||!arr.length)throw Error('BCB sin datos');
   const item=arr[arr.length-1],value=Number(String(item.valor||'').replace(',','.'));
   if(!Number.isFinite(value)||value<0)throw Error('BCB valor inválido');
   const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(item.data||'');if(!match)throw Error('BCB fecha inválida');
   const date=`${match[3]}-${match[2]}-${match[1]}`;
   return {key,value,date};
  }finally{if(id)clearTimeout(id)}
 }));
 const success=response.filter(x=>x.status==='fulfilled').map(x=>x.value);
 if(!success.length)throw Error('No se pudieron actualizar las tasas del BCB. Se mantienen las últimas tasas guardadas.');
 const next={...prev};const dates=[];
 for(const x of success){
  if(x.key==='cdi'){// Série 12 é % por dia útil, annualización base 252.
   next.cdiAnnual=+((Math.pow(1+x.value/100,252)-1)*100).toFixed(5);
  }else if(x.key==='selic')next.selicAnnual=x.value;
  else if(x.key==='tr')next.trMonthly=x.value;
  dates.push(x.date);
 }
 next.asOf=dates.sort().at(-1);next.source='bcb-sgs';next.updatedAt=new Date().toISOString();
 if(preferences)preferences.marketRates=next;
 return {rates:next,updated:success.map(x=>x.key),failed:response.length-success.length};
}
function matchTerm(s){const txt=String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return products.find(p=>txt.includes(p.id))||null;}
return {products,byId,initialRates,marketRates,defaultFor,refresh,validateRate,verifiedAt,endpoints,matchTerm};
});
