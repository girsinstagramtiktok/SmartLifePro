/* SmartLifePro: comprueba Releases y guarda APK VERIFICADO en Descargas/SmartLifePro.
   El usuario instala desde Mis archivos, sin abrir el instalador desde WebView. */
(function(){'use strict';
 let candidate=null, downloading=false,lastMessage='';
 const dict={
 es:{checking:'Buscando actualizaciones…',current:'Ya tienes la versión más reciente.',available:'Nueva versión',noNative:'Instala el APK nuevo con descarga a Descargas.',notConfigured:'No está configurado el repositorio.',downloading:'Descargando APK…',saved:'APK verificado y guardado en:',next:'Abre Mis archivos → Almacenamiento interno → Descargas → SmartLifePro y toca el APK para instalarlo.',download:'Descargar APK a Descargas',error:'Error:',checksum:'La publicación no contiene el SHA-256 del APK.'},
 pt:{checking:'Procurando atualizações…',current:'Você já tem a versão mais recente.',available:'Nova versão',noNative:'Instale o novo APK com download na pasta Downloads.',notConfigured:'Repositório não configurado.',downloading:'Baixando APK…',saved:'APK verificado e salvo em:',next:'Abra Meus Arquivos → Armazenamento interno → Downloads → SmartLifePro e toque no APK para instalar.',download:'Salvar APK em Downloads',error:'Erro:',checksum:'A publicação não inclui SHA-256 do APK.'},
 en:{checking:'Checking for updates…',current:'You have the latest version.',available:'New version',noNative:'Install the new APK with downloads support.',notConfigured:'Repository not configured.',downloading:'Downloading APK…',saved:'Verified APK saved to:',next:'Open My Files → Internal storage → Downloads → SmartLifePro, then tap the APK.',download:'Save APK to Downloads',error:'Error:',checksum:'Release does not contain the APK SHA-256.'}
 };
 function lang(){try{return typeof Data!=='undefined'?Data.store?.settings?.lang:'es'}catch(_){return 'es'}}
 function t(){return dict[lang()]||dict.es;}
 function api(){return window.SmartyAppUpdateNative;}
 function panel(){return document.getElementById('smarty-native-update-state');}
 function status(text){lastMessage=text;const el=panel();if(el)el.textContent=text;else if(typeof UI!=='undefined')UI.showSnackbar(text);}
 function controls(){const el=panel();if(!el)return;if(lastMessage)el.textContent=lastMessage;
  let btn=document.getElementById('smarty-update-download');
  if(!btn){btn=document.createElement('button');btn.id='smarty-update-download';btn.className='btn-full';btn.style.cssText='margin:8px 0;padding:11px;font-size:13px';el.insertAdjacentElement('afterend',btn);}
  btn.textContent=t().download;btn.disabled=downloading;btn.hidden=!candidate;
  btn.onclick=downloadNow;
  // Eliminar controles antiguos que intentaban forzar la instalación desde WebView.
  document.getElementById('smarty-update-install')?.remove();
  document.getElementById('smarty-update-diagnostics')?.remove();
 }
 function repo(){const x=window.SMARTY_RELEASE_CONFIG?.repository;return typeof x==='string'&&/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(x)?x:null;}
 async function checkNow(){
  if(downloading)return;candidate=null;controls();
  const name=repo();if(!name){status(t().notConfigured);return;}
  if(typeof api()?.downloadAndSave!=='function'){status(t().noNative);return;}
  status(t().checking);
  try{
   const response=await fetch('https://api.github.com/repos/'+name+'/releases/latest',{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
   if(!response.ok)throw new Error('GitHub '+response.status+'; el repositorio y Release deben ser públicos');
   const rel=await response.json();const match=String(rel.tag_name||'').match(/^v(\d{5,12})$/);
   if(!match)throw new Error('Etiqueta de release incompatible');
   const version=Number(match[1]),installed=Number(api().getInstalledVersionCode());
   if(!Number.isSafeInteger(version)||version<=installed){status(t().current);return;}
   const asset=(rel.assets||[]).find(x=>x.name==='SmartLifePro.apk'&&x.state==='uploaded');
   if(!asset)throw new Error('SmartLifePro.apk no existe en Releases');
   const link=String(asset.browser_download_url||'');
   if(!link.startsWith('https://github.com/'+name+'/releases/download/'))throw new Error('URL de descarga no confiable');
   const hash=String(asset.digest||'').match(/^sha256:([0-9a-f]{64})$/i);
   if(!hash)throw new Error(t().checksum);
   candidate={link,hash:hash[1],version};status(t().available+': '+(rel.name||rel.tag_name));controls();
  }catch(error){status(t().error+' '+String(error?.message||error));}
 }
 function downloadNow(){if(!candidate||downloading)return;
  downloading=true;status(t().downloading);controls();
  try{api().downloadAndSave(candidate.link,candidate.hash,String(candidate.version));}
  catch(error){downloading=false;status(t().error+' '+error);controls();}
 }
 function nativeEvent(kind,msg){
  if(kind==='progress'){status(t().downloading+' '+msg+'%');return;}
  downloading=false;
  if(kind==='saved'){candidate=null;status(t().saved+' '+String(msg)+'\n'+t().next);}
  else status(t().error+' '+String(msg));
  controls();
 }
 window.SmartyAppUpdater={checkNow,downloadNow,nativeEvent,render:controls};
 document.addEventListener('DOMContentLoaded',controls);
})();
