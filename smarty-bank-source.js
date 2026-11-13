/* SmartLifePro — coincidencia LOCAL y conservadora de notificaciones con
 * cuenta de débito o tarjeta de crédito registradas. No usa red ni IA.
 * La app bancaria de origen es más fiable que el comercio mencionado en el texto.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.SmartyBankSource=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const BANKS=[
 {id:'nubank',domain:'nubank.com.br',label:'Nubank',apps:[/^com\.nu\.production$/i,/^com\.nubank\./i],names:[/\bnubank\b/,/\bnu\s+pagamentos\b/]},
 {id:'mercado',domain:'mercadopago.com.br',label:'Mercado Pago',apps:[/^com\.mercadopago\./i,/^com\.mercadolibre\.wallet/i],names:[/mercado\s*pago/]},
 {id:'bb',domain:'bb.com.br',label:'Banco do Brasil',apps:[/^br\.com\.bb\./i],names:[/banco\s+do\s+brasil/,/\bbb\s+(?:credito|debito|cartao|conta)\b/]},
 {id:'inter',domain:'inter.co',label:'Inter',apps:[/^br\.com\.intermedium/i,/^br\.com\.inter\./i,/^com\.inter\.bank/i],names:[/banco\s+inter/,/\binter\s*(?:credito|debito|conta|bank)\b/]},
 {id:'itau',domain:'itau.com.br',label:'Itaú',apps:[/^com\.itau\./i,/^br\.com\.itau/i],names:[/\bitau\b/,/\bitaucard\b/]},
 {id:'bradesco',domain:'bradesco.com.br',label:'Bradesco',apps:[/^com\.bradesco\./i,/^br\.com\.bradesco/i],names:[/\bbradesco\b/]},
 {id:'santander',domain:'santander.com.br',label:'Santander',apps:[/^com\.santander\./i,/^br\.com\.santander/i],names:[/\bsantander\b/]},
 {id:'caixa',domain:'caixa.gov.br',label:'Caixa',apps:[/^br\.gov\.caixa/i,/^br\.com\.caixa/i],names:[/\bcaixa\s+(?:economica|tem|credito|debito|conta)\b/]},
 {id:'picpay',domain:'picpay.com',label:'PicPay',apps:[/^com\.picpay\./i],names:[/\bpicpay\b/]},
 {id:'c6',domain:'c6bank.com.br',label:'C6 Bank',apps:[/^com\.c6bank\./i,/^br\.com\.c6bank/i],names:[/\bc6\s*bank\b/]}
];
function classifyType(message){
 const txt=norm(message);
 if(/\b(?:pix\s+(?:enviado|feito|realizado|efetuado)|transferencia\s+(?:enviada|realizada)|pagamento\s+(?:via|por)\s+pix)\b/.test(txt))return 'account';
 if(/\b(?:cartao\s+(?:de\s+)?credito|compra\s+(?:no|na|com|em)\s+credito|funcao\s+credito|credito\s+(?:aprovado|utilizado)|credit\s+card|credit\s+purchase)\b/.test(txt))return 'card';
 if(/\b(?:cartao\s+(?:de\s+)?debito|compra\s+(?:no|na|com|em)\s+debito|funcao\s+debito|debito\s+(?:em\s+conta|aprovado)|debit\s+card|debit\s+purchase|saldo\s+(?:da\s+)?conta)\b/.test(txt))return 'account';
 return null;
}
function trailingDigits(text){
 const value=norm(text);
 const patterns=[
  /\b(?:final|terminad[oa]\s+em|terminacao|ultimos\s+4\s+digitos)\s*[:#-]?\s*(?:\*{2,}|[x•]{2,})?\s*(\d{4})\b/,
  /\b(?:cartao|card)\b[^\n\d]{0,28}(?:\*{2,}|[x•]{2,})\s*(\d{4})\b/,
  /\b(?:cartao|card)\s*(?:n\.?|numero|nro)?\s*[:#-]?\s*(?:\*{2,}|[x•]{2,})\s*(\d{4})\b/
 ];
 for(const re of patterns){const m=re.exec(value);if(m)return m[1]}
 return '';
}
function bankByPackage(pkg){const p=String(pkg||'');return BANKS.find(b=>b.apps.some(re=>re.test(p)))||null}
function bankByTitle(title){const txt=norm(title);return BANKS.find(b=>b.names.some(re=>re.test(txt)))||null}
function bankOfAccount(entry){
 const domain=norm(entry?.bankDomain||entry?.domain||'');
 let b=BANKS.find(x=>domain===x.domain||domain.endsWith('.'+x.domain));
 if(b)return b;
 const name=norm(entry?.name||'');
 return BANKS.find(x=>x.names.some(re=>re.test(name)))||null;
}
const suffixOf=e=>String(e?.last4||e?.cardLast4||e?.debitLast4||'').replace(/\D/g,'').slice(-4);
function infer(notification,state){
 const st=state||{};
 const bank=bankByPackage(notification?.package||notification?.packageName)||bankByTitle(notification?.title||'');
 const text=`${notification?.title||''} ${notification?.text||''}`;
 const paymentType=classifyType(text),last4=trailingDigits(text);
 const all=[...(st.accounts||[]).map(entry=>({type:'account',entry})),...(st.cards||[]).map(entry=>({type:'card',entry}))];
 const candidates=bank?all.filter(x=>bankOfAccount(x.entry)?.id===bank.id):all;
 const suffixCandidates=last4?candidates.filter(x=>suffixOf(x.entry)===last4):[];
 let matches=suffixCandidates.length?suffixCandidates:candidates;
 if(paymentType)matches=matches.filter(x=>x.type===paymentType);
 // Sin identificación del banco ni coincidencia del número: prohibido adivinar.
 if(!bank&&!suffixCandidates.length)return {source:null,bank:'',paymentType,last4,reason:'unknown_bank'};
 // Si se recibió una terminación, pero las registradas son diferentes, no
 // seleccionar a ciegas entre las del mismo banco.
 if(last4&&!suffixCandidates.length&&candidates.some(x=>suffixOf(x.entry)))return {source:null,bank:bank?.id||'',paymentType,last4,reason:'unknown_card_suffix'};
 if(matches.length!==1)return {source:null,bank:bank?.id||'',paymentType,last4,reason:matches.length?'ambiguous':'no_matching_source'};
 const match=matches[0];
 // Si hay ambos tipos y la notificación no indica cuál, solo aceptar si los
 // últimos cuatro dígitos registrados identifican inequívocamente el producto.
 if(!paymentType&&candidates.length>1&&suffixCandidates.length!==1)return {source:null,bank:bank?.id||'',paymentType,last4,reason:'ambiguous_type'};
 return {source:{type:match.type,id:match.entry.id},bank:bank?.id||bankOfAccount(match.entry)?.id||'',paymentType:match.type,last4,reason:'matched'};
}
return {infer,classifyType,trailingDigits,bankByPackage,bankOfAccount};
});
