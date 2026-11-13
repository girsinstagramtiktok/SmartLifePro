#!/usr/bin/env node
/* Download public brand pictograms at BUILD time. The resulting assets/brands/
 * files are copied into the APK, so opening the app never needs the network.
 * A deterministic, local monogram is produced if a source cannot be reached. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const https=require('node:https');
const out=path.join(path.resolve(process.argv[2]||'www'),'assets','brands');
fs.mkdirSync(out,{recursive:true});
const icons={
 nubank:['nubank','nubank.com.br','nu','#7928ca'],
 bb:['bancodobrasil','bb.com.br','BB','#ffda43'],
 inter:['inter','inter.co','inter','#ff7528'],
 itau:['itau','itau.com.br','itaú','#ec6e26'],
 mercado:['mercadopago','mercadopago.com.br','MP','#2585f4'],
 picpay:['picpay','picpay.com','P','#16a36b'],
 caixa:['caixa','caixa.gov.br','CAIXA','#2580c8'],
 santander:['santander','santander.com.br','S','#e83c37'],
 bradesco:['bradesco','bradesco.com.br','B','#cc3342'],
 c6:['c6bank','c6bank.com.br','C6','#292e38'],
 chatgpt:['openai','chatgpt.com','GPT','#121c1b'],
 gemini:['googlegemini','gemini.google.com','✦','#8e75b2'],
 prime:['primevideo','primevideo.com','prime','#0997cf'],
 netflix:['netflix','netflix.com','N','#d81b27'],
 spotify:['spotify','spotify.com','●','#1db954'],
 youtube:['youtube','youtube.com','▶','#f03931'],
 disney:['disneyplus','disneyplus.com','Disney+','#183681'],
 max:['hbo','max.com','HBO','#4a2e8b'],
 apple:['apple','apple.com','Apple','#23282d'],
 googleone:['googleone','one.google.com','G1','#4285f4'],
 microsoft:['microsoft','microsoft.com','MS','#2e77bc'],
 amazon:['amazon','amazon.com.br','amazon','#222c38'],
 notion:['notion','notion.so','N','#252525'],
 canva:['canva','canva.com','Canva','#15a4b6'],
 adobe:['adobe','adobe.com','A','#ee383e']
};
function get(url,depth=0){return new Promise((resolve,reject)=>{
 if(depth>3)return reject(Error('redirect limit'));
 const req=https.get(url,{headers:{'User-Agent':'SmartLifePro-AssetBuilder/1.0'}},res=>{
  if([301,302,303,307,308].includes(res.statusCode)&&res.headers.location){res.resume();try{return resolve(get(new URL(res.headers.location,url).toString(),depth+1))}catch(e){return reject(e)}}
  if(res.statusCode!==200){res.resume();return reject(Error('HTTP '+res.statusCode))}
  const bytes=[];let total=0;
  res.on('data',chunk=>{total+=chunk.length;if(total>100000){req.destroy(Error('asset too large'))}else bytes.push(chunk)});
  res.on('end',()=>resolve(Buffer.concat(bytes)));
  res.on('error',reject);
 });
 req.setTimeout(7500,()=>req.destroy(Error('asset fetch timeout')));
 req.on('error',reject);
})}
const xmlEscape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function wrapPng(buf){return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image x="4" y="4" width="56" height="56" href="data:image/png;base64,${buf.toString('base64')}"/></svg>`}
function placeholder(mark,color){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="13" fill="${color}"/><text x="32" y="35" fill="#fff" font-family="Arial,sans-serif" font-weight="bold" font-size="${mark.length>5?12:mark.length>3?16:23}" text-anchor="middle" dominant-baseline="middle">${xmlEscape(mark)}</text></svg>`;
}
const validSVG=buf=>{
 const s=buf.toString('utf8');
 if(!/^\s*<svg[\s>]/i.test(s)||!s.includes('</svg>')||/<script|<foreignObject|\son\w+\s*=|<image|<use|<style|<iframe|javascript:|data:text\/html/i.test(s))return null;
 return s;
};
async function create(key,[slug,domain,mark,color]){
 const dest=path.join(out,key+'.svg');
 if(fs.existsSync(dest)&&fs.statSync(dest).size>100)return;
 let svg=null;
 const sources=[`https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/${slug}.svg`,`https://cdn.simpleicons.org/${slug}`];
 if(!process.env.SLP_BRAND_OFFLINE)for(const url of sources){try{const data=await get(url);svg=validSVG(data);if(svg){svg=svg.replace(/<svg(?=[\s>])/i,`<svg fill="${color}"`);break}}catch{}}
 if(!svg&&!process.env.SLP_BRAND_OFFLINE){try{const png=await get(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);if(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))svg=wrapPng(png)}catch{}}
 if(!svg)svg=placeholder(mark,color);
 fs.writeFileSync(dest,svg);
 return svg.startsWith('<svg fill=')?'brand':'favicon or fallback';
}
(async()=>{
 const entries=Object.entries(icons),counts={brand:0,'favicon or fallback':0},workers=Array.from({length:6},async(_,worker)=>{
  for(let i=worker;i<entries.length;i+=6){const [key,meta]=entries[i];try{const type=await create(key,meta);if(type)counts[type]++}catch(e){console.warn('brand '+key+':',e.message);fs.writeFileSync(path.join(out,key+'.svg'),placeholder(meta[2],meta[3]))}}
 });
 await Promise.all(workers);
 console.log(`Prepared ${entries.length} bundled brand icons (${counts.brand} vector logos; others favicon or local fallback)`);
})().catch(e=>{console.warn('Brand bundling failed; app will use textual fallbacks:',e.message);process.exitCode=0});
