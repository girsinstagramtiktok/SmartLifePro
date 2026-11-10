/* SmartLifePro - unico controlador biometrico del APK.
 * La opcion solo se almacena despues de un resultado confirmado de Android.
 * Requiere la API SmartyAndroid de patch-biometric-native.cjs (v2).
 */
(function () {
  'use strict';
  let pending=null, sequence=0, autoAttempted=false, hiddenAt=0;
  const TIMEOUT_MS=35000;
  const messages={
    es:{pin:'Configura primero un PIN.',native:'El APK no tiene disponible el puente de huella. Instala la nueva compilacion.',enroll:'Registra una huella en los ajustes de Android.',busy:'El sensor no esta disponible. Usa tu PIN.',unavailable:'La autenticacion biometrica no esta disponible.',cancel:'Autenticacion cancelada. Puedes usar tu PIN.',enabled:'Huella activada.',disabled:'Huella desactivada.',timeout:'Android no respondio al intento de huella. Puedes reintentar sin cerrar la app.',failed:'La autenticacion no se completo. Puedes usar tu PIN.'},
    pt:{pin:'Configure primeiro um PIN.',native:'O APK nao possui a ponte de biometria. Instale a nova versao.',enroll:'Cadastre sua digital nas configuracoes do Android.',busy:'Sensor indisponivel. Use seu PIN.',unavailable:'Biometria indisponivel.',cancel:'Autenticacao cancelada. Use seu PIN.',enabled:'Biometria ativada.',disabled:'Biometria desativada.',timeout:'Android nao respondeu. Tente novamente sem fechar o app.',failed:'Nao foi possivel autenticar. Use seu PIN.'},
    en:{pin:'Set a PIN first.',native:'This APK has no biometric bridge. Install the new build.',enroll:'Enroll a fingerprint in Android settings.',busy:'The biometric sensor is unavailable. Use your PIN.',unavailable:'Biometrics are unavailable.',cancel:'Authentication cancelled. Use your PIN.',enabled:'Biometric unlock enabled.',disabled:'Biometric unlock disabled.',timeout:'Android did not respond. You can retry without restarting.',failed:'Authentication was not completed. Use your PIN.'}
  };
  function words(){return messages[window.Data?.store?.settings?.lang]||messages.es;}
  function notice(text){
    const lock=document.getElementById('lock-screen');
    const error=document.getElementById('smarty-bio-error');
    if(error&&lock&&!lock.classList.contains('hidden'))error.textContent=text;
    else window.UI?.showSnackbar?.(text);
  }
  function setting(){return window.Data?.store?.settings;}
  function hasBridge(){return typeof window.SmartyAndroid?.authenticateBiometric==='function' && typeof window.SmartyAndroid?.getBiometricStatus==='function';}
  function status(){try{return hasBridge()?Number(window.SmartyAndroid.getBiometricStatus()):-9;}catch(_){return -9;}}
  function errorText(code){return code===11?words().enroll:(code===1||code===12)?words().busy:code===-9?words().native:words().unavailable;}
  function recordError(s){try{window.sessionStorage?.setItem('smarty.bio.lastError',String(s));}catch(_) {}}
  function sync(){
    const value=Boolean(setting()?.biometricEnabled);
    document.querySelectorAll('[data-smarty-biometric-toggle]').forEach(el=>{
      el.checked=value;
      el.disabled=Boolean(pending?.mode==='enable');
    });
    const button=document.getElementById('smarty-bio-button');
    if(button)button.hidden=!value;
  }
  function clearPending(){
    if(!pending)return null;
    const old=pending;pending=null;
    clearTimeout(old.timer);
    sync();
    return old;
  }
  function begin(mode){
    if(!setting()?.pin){notice(words().pin);sync();return false;}
    if(pending){notice(words().busy);sync();return false;}
    const s=status();
    if(s!==0){recordError('status:'+s);notice(errorText(s));sync();return false;}
    const id='bio-'+Date.now()+'-'+(++sequence);
    pending={id,mode,timer:null};
    pending.timer=setTimeout(()=>{
      if(pending?.id!==id)return;
      clearPending();recordError('timeout');notice(words().timeout);
    },TIMEOUT_MS);
    sync();
    try{
      // Token de solicitud: descarta callbacks atrasados y evita reactivar despues de deshabilitar.
      window.SmartyAndroid.authenticateBiometric(id);
      return true;
    }catch(error){
      clearPending();recordError('bridge:'+String(error?.message||'unknown'));
      notice(words().native);return false;
    }
  }
  function nativeResult(outcome,id){
    // Rechazar resultados sin identificador de la nueva interfaz o procedentes de solicitudes anteriores.
    if(!pending||id!==pending.id)return;
    const request=clearPending();
    if(outcome==='success'){
      if(request.mode==='enable'){
        setting().biometricEnabled=true;
        window.Data.save();
        recordError('success');
        notice(words().enabled);
      }else if(request.mode==='unlock'&&setting()?.biometricEnabled&&setting()?.pin){
        const lock=document.getElementById('lock-screen');
        if(lock&&!lock.classList.contains('hidden'))window.Main?.unlockApp?.();
      }
    }else{
      recordError(outcome);
      if(outcome==='cancel')notice(words().cancel);
      else if(outcome.startsWith('unavailable:'))notice(errorText(Number(outcome.split(':')[1])));
      else notice(words().failed+' ('+outcome+')');
    }
    sync();
  }
  function disable(){
    clearPending();
    if(!setting())return;
    setting().biometricEnabled=false;
    window.Data.save();
    autoAttempted=false;
    sync();
    notice(words().disabled);
  }
  function toggle(input){
    if(!input)return;
    if(!input.checked){disable();return;}
    input.checked=false;
    if(setting()?.biometricEnabled){sync();return;}
    begin('enable');
  }
  function install(){
    const lock=document.getElementById('lock-screen');
    if(!lock)return;
    let error=document.getElementById('smarty-bio-error');
    if(!error){
      error=document.createElement('div');error.id='smarty-bio-error';
      lock.querySelector('.pin-display')?.insertAdjacentElement('afterend',error);
    }
    const btn=lock.querySelector('.pin-pad .pin-btn:nth-child(10)');
    if(btn){
      btn.id='smarty-bio-button';
      btn.classList.add('bio-btn-active');
      btn.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2c-5 0-9 4-9 9m18 0c0-5-4-9-9-9M7 13v-2a5 5 0 0110 0v2M5 16v-5m14 5v-5M9 16v-5a3 3 0 016 0v5M12 15v7M6.5 19c.6 1.5 1.5 2.5 2.5 3M17.5 19c-.6 1.5-1.5 2.5-2.5 3"/></svg>';
      btn.setAttribute('role','button');
      btn.setAttribute('aria-label','Desbloquear con huella');
      btn.setAttribute('tabindex','0');
      btn.onclick=()=>begin('unlock');
      btn.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();begin('unlock');}};
    }
    sync();
  }
  function tryAuto(){
    if(autoAttempted||!setting()?.biometricEnabled||!setting()?.pin)return;
    const lock=document.getElementById('lock-screen');
    if(!lock||lock.classList.contains('hidden'))return;
    autoAttempted=true;
    begin('unlock');
  }
  function onVisibility(){
    if(document.visibilityState==='hidden'){hiddenAt=Date.now();return;}
    if(!hiddenAt)return;
    const elapsed=Date.now()-hiddenAt;hiddenAt=0;
    if(elapsed<30000||!setting()?.pin||!window.Main?.sessionAuthenticated)return;
    window.Main.sessionAuthenticated=false;
    window.Main.tempPin='';window.Main.updatePinUI?.();
    document.getElementById('lock-screen')?.classList.remove('hidden');
    autoAttempted=false;install();setTimeout(tryAuto,250);
  }
  function showDiagnostics(){
    const enabled=Boolean(setting()?.biometricEnabled),s=status();
    let last='ninguno';try{last=window.sessionStorage?.getItem('smarty.bio.lastError')||last;}catch(_){}
    let nativeVersion='No disponible';try{nativeVersion=window.SmartyAndroid?.getBiometricDebugInfo?.()||nativeVersion;}catch(_){}
    const result=['Smarty - diagnostico de huella', 'Puente nativo V2: '+nativeVersion,'Puente Android: '+(hasBridge()?'disponible':'NO disponible'),'Sensor/registro: '+s,'Opcion guardada: '+(enabled?'activada':'desactivada'),'Solicitud pendiente: '+(pending?.mode||'ninguna'),'Ultimo resultado: '+last].join('\n');
    window.alert?.(result);
    return result;
  }
  window.SmartyBiometrics={nativeResult,begin,toggle,disable,status,install,sync,showDiagnostics};
  window.addEventListener('load',()=>{
    install();setTimeout(()=>{install();tryAuto();},650);
    document.addEventListener('visibilitychange',onVisibility);
  });
})();
