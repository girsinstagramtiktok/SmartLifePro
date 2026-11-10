/* SmartLifePro - actualizaciones nativas firmadas desde GitHub Releases.
 * En APK: consultar /releases/latest, verificar SHA-256 y firma en el puente Android.
 * No utiliza claves ni tokens de GitHub en el teléfono. Solo repositorios públicos.
 */
(function () {
  'use strict';
  let candidate=null;
  let downloading=false;
  let installedReady=false;
  let lastStatus='';
  const t={
    es:{checking:'Buscando nuevas versiones…',current:'Ya tienes la versión más reciente.',available:'Nueva versión disponible',notConfigured:'Actualizador sin configurar en este APK.',publicRepo:'No se pudo consultar GitHub Releases. El repositorio y la versión publicada deben ser públicos.',checksum:'La publicación no ofrece una huella SHA-256 verificable.',downloading:'Descargando actualización…',verified:'APK descargado y verificado. Android pedirá confirmar la instalación.',permission:'Autoriza «Instalar apps desconocidas» para SmartLifePro y vuelve aquí para continuar.',failed:'No fue posible actualizar:',noNative:'Necesitas instalar primero un APK con el actualizador nativo.',install:'Instalar APK descargado',download:'Descargar e instalar',version:'Versión disponible'},
    pt:{checking:'Procurando atualizações…',current:'Você já tem a versão mais recente.',available:'Nova versão disponível',notConfigured:'Atualizador não configurado neste APK.',publicRepo:'Não foi possível consultar o GitHub Releases. O repositório e a versão precisam ser públicos.',checksum:'A publicação não possui SHA-256 verificável.',downloading:'Baixando atualização…',verified:'APK verificado. O Android solicitará a confirmação da instalação.',permission:'Autorize a instalação de apps desta fonte para SmartLifePro e volte aqui.',failed:'Falha ao atualizar:',noNative:'Instale primeiro um APK com o atualizador nativo.',install:'Instalar APK baixado',download:'Baixar e instalar',version:'Versão disponível'},
    en:{checking:'Checking for updates…',current:'Your app is already up to date.',available:'New version available',notConfigured:'Updater is not configured in this APK.',publicRepo:'Could not check GitHub Releases. The repository and published release must be public.',checksum:'The release has no verifiable SHA-256.',downloading:'Downloading update…',verified:'APK verified. Android will request installation confirmation.',permission:'Allow installs from SmartLifePro in Android Settings, then return here.',failed:'Update failed:',noNative:'First install an APK that includes the native updater.',install:'Install downloaded APK',download:'Download and install',version:'Available version'}
  };
  function words(){return t[window.Data?.store?.settings?.lang]||t.es;}
  function panel(){return document.getElementById('smarty-native-update-state');}
  function status(message){lastStatus=message;const el=panel();if(el)el.textContent=message;else window.UI?.showSnackbar?.(message);}
  function controls(){
    const e=panel();if(!e)return;
    if(lastStatus)e.textContent=lastStatus;
    let b=document.getElementById('smarty-update-install');
    if(!b){b=document.createElement('button');b.id='smarty-update-install';b.className='btn-full';b.style.cssText='padding:10px;margin:8px 0;font-size:13px';e.insertAdjacentElement('afterend',b);}
    b.hidden=downloading||(!candidate&&!installedReady);
    b.textContent=installedReady?words().install:words().download;
    b.onclick=installedReady?installDownloaded:downloadNow;
  }
  function api(){return window.SmartyAppUpdateNative;}
  function repoName(){const value=window.SMARTY_RELEASE_CONFIG?.repository;return typeof value==='string'&&/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(value)?value:null;}
  async function checkNow(){
    if(downloading)return;
    const repo=repoName();
    if(!repo){status(words().notConfigured);return;}
    if(typeof api()?.getInstalledVersionCode!=='function'){status(words().noNative);return;}
    status(words().checking);
    try{
      const res=await fetch('https://api.github.com/repos/'+repo+'/releases/latest',{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
      if(!res.ok)throw new Error('GitHub HTTP '+res.status+' — '+words().publicRepo);
      const rel=await res.json();
      const version=String(rel.tag_name||'').match(/^v(\d{5,12})$/);
      if(!version)throw new Error('La publicación no tiene una etiqueta compatible (v100001).');
      const versionCode=Number(version[1]);
      const installed=Number(api().getInstalledVersionCode());
      if(!Number.isSafeInteger(versionCode)||versionCode<=installed){candidate=null;status(words().current);controls();return;}
      const asset=(rel.assets||[]).find(a=>a.name==='SmartLifePro.apk'&&a.state==='uploaded');
      if(!asset)throw new Error('No se encontró SmartLifePro.apk en la publicación.');
      const url=String(asset.browser_download_url||'');
      if(!url.startsWith('https://github.com/'+repo+'/releases/download/'))throw new Error('URL de descarga inesperada.');
      const match=String(asset.digest||'').match(/^sha256:([0-9a-f]{64})$/i);
      if(!match)throw new Error(words().checksum);
      candidate={versionCode,url,sha256:match[1].toLowerCase(),label:String(rel.name||rel.tag_name)};
      installedReady=false;
      status(words().available+' — '+candidate.label);
      controls();
    }catch(err){candidate=null;status(words().failed+' '+String(err?.message||err));controls();}
  }
  function downloadNow(){
    if(!candidate||downloading||typeof api()?.downloadAndInstall!=='function')return;
    downloading=true;status(words().downloading);controls();
    try{api().downloadAndInstall(candidate.url,candidate.sha256,String(candidate.versionCode));}
    catch(err){downloading=false;status(words().failed+' '+String(err));controls();}
  }
  function installDownloaded(){
    if(typeof api()?.installDownloadedApk!=='function')return;
    try{api().installDownloadedApk();}catch(err){status(words().failed+' '+String(err));}
  }
  function nativeEvent(kind,value){
    const s=String(value??'');
    if(kind==='progress'){status(words().downloading+' '+s+'%');return;}
    downloading=false;
    if(kind==='ready') {installedReady=true;status(words().verified);}
    else if(kind==='permission'){installedReady=true;status(words().permission);}
    else if(kind==='installing'){installedReady=true;status(words().verified);}
    else{installedReady=false;status(words().failed+' '+s);}
    controls();
  }
  window.SmartyAppUpdater={checkNow,downloadNow,installDownloaded,nativeEvent,render:controls};
  document.addEventListener('DOMContentLoaded',controls);
})();
