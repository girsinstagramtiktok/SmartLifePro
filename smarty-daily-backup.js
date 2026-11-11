/* SmartLifePro: respaldo diario en una carpeta escogida (Android SAF). */
(function(){
 'use strict';
 const tr={
  es:{title:'Copias diarias con fecha',folder:'Elegir carpeta',save:'Guardar copia ahora',on:'Copia diaria automática',none:'Elige una carpeta para comenzar.',saved:'Última copia:',notice:'Las copias JSON no están cifradas. Elige una carpeta privada.',unsupported:'Esta función necesita la nueva versión del APK.'},
  pt:{title:'Backups diários com data',folder:'Escolher pasta',save:'Salvar cópia agora',on:'Backup diário automático',none:'Escolha uma pasta para começar.',saved:'Último backup:',notice:'Os arquivos JSON não são criptografados. Escolha uma pasta privada.',unsupported:'É necessário instalar a nova versão do APK.'},
  en:{title:'Dated daily backups',folder:'Choose folder',save:'Save backup now',on:'Automatic daily backup',none:'Choose a folder to get started.',saved:'Last backup:',notice:'JSON backups are not encrypted. Choose a private folder.',unsupported:'Install the new APK version to use this feature.'}
 };
 function lang(){try{return typeof Data!=='undefined'&&Data.store?.settings?.lang||'es'}catch(_){return 'es'}}
 function w(){return tr[lang()]||tr.es;}
 function api(){return window.SmartyDailyBackupNative;}
 function snapshot(){return typeof Data!=='undefined'?Data.exportJSON():null;}
 function sync(){try{if(api()?.updateSnapshot&&snapshot()){api().updateSnapshot(snapshot());api()?.ensureToday?.();}}catch(err){console.warn('[Smarty backup] snapshot',err);}}
 let job=null;
 function scheduleSync(){clearTimeout(job);job=setTimeout(sync,1800);}
 function installDataHook(){
  if(typeof Data==='undefined'||Data.__smartyDailyBackupWrapped)return;
  const original=Data.save;
  Data.save=function(...args){const result=original.apply(this,args);scheduleSync();return result;};
  Data.__smartyDailyBackupWrapped=true;
  sync();
 }
 function state(){try{return api()?.getStatus?JSON.parse(api().getStatus()):null}catch(err){return {error:String(err)}}}
 function render(){
  const root=document.getElementById('smarty-daily-backup');if(!root)return;
  const s=state(),t=w();
  root.innerHTML='';
  const h=document.createElement('div');h.className='section-label';h.textContent=t.title;root.appendChild(h);
  const card=document.createElement('div');card.className='glass-card';card.style.cssText='padding:14px;margin:0;display:grid;gap:9px';root.appendChild(card);
  const info=document.createElement('div');info.style.cssText='font-size:12px;line-height:1.5;overflow-wrap:anywhere';
  info.textContent=!s?t.unsupported:(s.selected?'Carpeta: '+s.folderName+' · '+(s.lastFile?t.saved+' '+s.lastFile:t.none):t.none);
  card.appendChild(info);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:8px;flex-wrap:wrap';card.appendChild(row);
  const choose=document.createElement('button');choose.className='btn-data';choose.style.cssText='flex:1;min-width:130px;padding:10px';choose.textContent=t.folder;choose.disabled=!api()?.chooseFolder;choose.onclick=()=>{sync();api()?.chooseFolder?.()};row.appendChild(choose);
  const save=document.createElement('button');save.className='btn-data';save.style.cssText='flex:1;min-width:130px;padding:10px';save.textContent=t.save;save.disabled=!s?.selected;save.onclick=()=>{try{api()?.saveNow?.(snapshot());info.textContent=t.saved+' (guardando…)';setTimeout(render,1200);}catch(err){info.textContent=String(err)}};row.appendChild(save);
  const toggle=document.createElement('label');toggle.className='setting-item';toggle.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px';
  const name=document.createElement('span');name.textContent=t.on;toggle.appendChild(name);
  const wrap=document.createElement('span');wrap.className='switch-wrap';
  const input=document.createElement('input');input.type='checkbox';input.checked=!!s?.enabled;input.disabled=!s?.selected;
  input.onchange=()=>{api()?.setEnabled?.(input.checked);setTimeout(render,150)};
  const slider=document.createElement('span');slider.className='slider';wrap.append(input,slider);toggle.appendChild(wrap);card.appendChild(toggle);
  const warn=document.createElement('div');warn.style.cssText='font-size:11px;opacity:.7';warn.textContent=t.notice;card.appendChild(warn);
  if(s?.error){const e=document.createElement('div');e.style.cssText='font-size:11px;color:var(--danger,#aa2c2c)';e.textContent=s.error;card.appendChild(e);}
 }
 function install(){installDataHook();const settings=document.getElementById('settings-inject');if(!settings)return;
  if(!document.getElementById('smarty-daily-backup')){
   const container=document.createElement('section');container.id='smarty-daily-backup';container.style.margin='0 0 20px';
   const native=document.getElementById('android-pro-settings');if(native)native.insertAdjacentElement('afterend',container);else settings.appendChild(container);
  }
  render();
 }
 function hook(){
  if(typeof UI!=='undefined'&&UI.renderSettingsView&&!UI.__smartyBackupHooked){
    const original=UI.renderSettingsView;
    UI.renderSettingsView=function(...args){const result=original.apply(this,args);install();return result;};
    UI.__smartyBackupHooked=true;
  }
  install();
 }
 window.SmartyDailyBackup={install,refresh:render,choose:()=>api()?.chooseFolder?.(),sync};
 document.addEventListener('DOMContentLoaded',hook);
 window.addEventListener('load',()=>{hook();setTimeout(sync,900);},{once:true});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){sync();render();}});
})();
