/* SmartLifePro — iconografía de bancos y suscripciones.
   En modo offline usa una marca local legible. Al estar online intenta descargar
   una imagen CORS y guardarla como data URI en el dispositivo para futuros usos.
   Nunca hace que fallen las pantallas si el proveedor de iconos está caído. */
(function(root){'use strict';
const PREFIX='slp-icon-v1:';
const assets={
  nubank:{slug:'nubank',mark:'nu',color:'#7928ca'},bb:{slug:'bancodobrasil',mark:'BB',color:'#ffda43',ink:'#183d9d'},inter:{slug:'inter',mark:'inter',color:'#ff7528'},itau:{slug:'itau',mark:'itaú',color:'#ec6e26'},
  mercado:{slug:'mercadopago',mark:'MP',color:'#2585f4'},picpay:{slug:'picpay',mark:'P',color:'#16a36b'},caixa:{slug:'caixa',mark:'CAIXA',color:'#2580c8'},
  santander:{slug:'santander',mark:'S',color:'#e83c37'},bradesco:{slug:'bradesco',mark:'B',color:'#cc3342'},c6:{slug:'c6bank',mark:'C6',color:'#292e38'},
  chatgpt:{slug:'openai',mark:'GPT',color:'#121c1b'},gemini:{slug:'googlegemini',mark:'✦',color:'#526ae9'},prime:{slug:'primevideo',mark:'prime',color:'#0997cf'},
  netflix:{slug:'netflix',mark:'N',color:'#d81b27'},spotify:{slug:'spotify',mark:'●',color:'#1db954',ink:'#10291d'},
  youtube:{slug:'youtube',mark:'▶',color:'#f03931'},disney:{slug:'disneyplus',mark:'Disney+',color:'#183681'},max:{slug:'hbo',mark:'HBO',color:'#4a2e8b'},
  apple:{slug:'apple',mark:'Apple',color:'#23282d'},googleone:{slug:'googleone',mark:'G1',color:'#4285f4'},microsoft:{slug:'microsoft',mark:'MS',color:'#2e77bc'},
  amazon:{slug:'amazon',mark:'amazon',color:'#222c38'},notion:{slug:'notion',mark:'N',color:'#252525'},canva:{slug:'canva',mark:'Canva',color:'#15a4b6'},
  adobe:{slug:'adobe',mark:'A',color:'#ee383e'},other:{mark:'•',color:'#526b77'}
};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const bankAliases={nubank:'nubank',nu:'nubank','nubank.com.br':'nubank',bb:'bb','bb.com.br':'bb','banco do brasil':'bb',inter:'inter','inter.co':'inter',itau:'itau','itau.com.br':'itau',mercado:'mercado','mercadopago.com.br':'mercado',picpay:'picpay','picpay.com':'picpay',caixa:'caixa','caixa.gov.br':'caixa',santander:'santander','santander.com.br':'santander',bradesco:'bradesco','bradesco.com.br':'bradesco',c6:'c6','c6bank.com.br':'c6'};
function bankKey(input){if(typeof input==='object'&&input?.id&&assets[input.id])return input.id;
 const value=norm(typeof input==='object'?`${input?.bankDomain||input?.domain||''} ${input?.name||''}`:input);
 for(const [key,id] of Object.entries(bankAliases))if(value.includes(key))return id;
 return 'other';
}
function subscriptionKey(name){const n=norm(name);if(/chat\s*gpt|open\s*ai|gpt\s*plus/.test(n))return 'chatgpt';
 if(/gemini|google\s+ai\s+pro/.test(n))return 'gemini';if(/prime\s*video|amazon\s*prime|\bprime\b/.test(n))return 'prime';
 if(/netflix/.test(n))return 'netflix';if(/spotify/.test(n))return 'spotify';if(/youtube|yt\s*premium/.test(n))return 'youtube';
 if(/disney/.test(n))return 'disney';if(/hbo|\bmax\b/.test(n))return 'max';if(/apple|icloud/.test(n))return 'apple';
 if(/google\s*one|google\s*storage/.test(n))return 'googleone';if(/microsoft|office\s*365/.test(n))return 'microsoft';if(/amazon/.test(n))return 'amazon';
 if(/notion/.test(n))return 'notion';if(/canva/.test(n))return 'canva';if(/adobe/.test(n))return 'adobe';return 'other';}
function saved(key){try{const value=root.localStorage?.getItem(PREFIX+key);return value?.startsWith('data:image/')?value:null}catch{return null}}
function icon(key,label=''){
 const item=assets[key]||assets.other;
 const markup=esc(item.mark==='•'?String(label||'?').slice(0,2).toUpperCase():item.mark);
 // El APK trae los logos verificados en assets/brands. El almacenamiento
 // conserva imágenes obtenidas en sesiones previas y el texto siempre es local.
 const cached=saved(key);
 const packaged=item.slug?`assets/brands/${key}.svg`:'';
 const network=(item.slug&&root.navigator?.onLine!==false)?`https://cdn.simpleicons.org/${encodeURIComponent(item.slug)}`:'';
 const imageUrl=cached||packaged;
 const fallback=(!cached&&network)?` data-sba-fallback="${esc(network)}"`:'';
 return `<span class="sba-logo" style="--sba-bg:${item.color};--sba-ink:${item.ink||'#fff'}" aria-label="${esc(label||key)}"><span class="sba-mark">${markup}</span>${imageUrl?`<img alt="" draggable="false" data-sba-key="${esc(key)}" src="${esc(imageUrl)}"${fallback} onload="this.classList.add('sba-ready')" onerror="if(this.dataset.sbaFallback&&!this.dataset.retried&&navigator.onLine!==false){this.dataset.retried='1';this.src=this.dataset.sbaFallback}else this.remove()">`:''}</span>`;
}
function bankLogo(input,name=''){const key=bankKey(typeof input==='object'?input:{bankDomain:input,name});return icon(key,name||input?.name||key)}
function subscriptionLogo(subscription){
 const name=typeof subscription==='object'?(subscription?.name||''):subscription;
 const preferred=typeof subscription==='object'&&Object.prototype.hasOwnProperty.call(assets,subscription?.smBrandKey)?subscription.smBrandKey:null;
 return icon(preferred||subscriptionKey(name),name);
}

const inFlight=new Set();
async function cacheIcon(key){const item=assets[key];if(!item?.slug||saved(key)||inFlight.has(key)||root.navigator?.onLine===false)return;
 let storage;try{storage=root.localStorage}catch{return}
 if(typeof root.fetch!=='function'||!storage)return;
 inFlight.add(key);
 try{
  const response=await root.fetch(`https://cdn.simpleicons.org/${encodeURIComponent(item.slug)}`,{mode:'cors',cache:'force-cache'});
  if(!response.ok||response.type==='opaque')return;
  const blob=await response.blob();if(blob.size>35000||blob.size<16||!/image\/(svg\+xml|png|webp)/.test(blob.type))return;
  const uri=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob)});
  if(uri.length<50000){storage.setItem(PREFIX+key,uri);root.document?.querySelectorAll(`img[data-sba-key="${key}"]`).forEach(img=>{img.src=uri});}
 }catch(e){/* Proveedor sin CORS/red: mantener fallback local, sin romper UI. */}
 finally{inFlight.delete(key)}
}
function observeIcons(rootNode){if(!rootNode?.querySelectorAll)return;const pending=new Set();
 rootNode.querySelectorAll('img[data-sba-key]').forEach(img=>{const key=img.getAttribute('data-sba-key');if(key&&!saved(key))pending.add(key)});
 for(const key of pending)cacheIcon(key);
}
if(root.document){const start=()=>{observeIcons(root.document);if(typeof MutationObserver!=='undefined')new MutationObserver(changes=>{for(const item of changes)for(const node of item.addedNodes)if(node.nodeType===1){if(node.matches?.('img[data-sba-key]'))cacheIcon(node.getAttribute('data-sba-key'));observeIcons(node)}}).observe(root.document.body,{childList:true,subtree:true})};
 if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',start,{once:true});else start();}
root.SmartyBrandAssets={bankLogo,subscriptionLogo,bankKey,subscriptionKey,cacheIcon};
if(typeof module==='object'&&module.exports)module.exports={bankKey,subscriptionKey,bankLogo,subscriptionLogo};
})(typeof window!=='undefined'?window:globalThis);
