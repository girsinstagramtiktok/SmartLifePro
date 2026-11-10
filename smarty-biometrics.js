/* SmartLifePro · biometría con PIN de respaldo.
   Nunca persiste activación antes de que Android confirme autenticación exitosa.
   El resultado llega desde Java por SmartyBiometrics.nativeResult(status).
*/
(function () {
  'use strict';
  let pending = null, lastAuto = false, awaySince = 0;
  const txt = {
    es:{missing:'Configura primero un PIN de seis dígitos.',unavailable:'La huella no está disponible en este dispositivo.',enroll:'Registra una huella o rostro en los ajustes del teléfono.',hardware:'El sensor biométrico está ocupado. Usa el PIN.',cancel:'Puedes desbloquear con tu PIN.',enabled:'Huella activada correctamente.',disabled:'Huella desactivada.',error:'No se pudo autenticar. Usa el PIN.'},
    pt:{missing:'Configure primeiro um PIN de seis dígitos.',unavailable:'Biometria indisponível neste aparelho.',enroll:'Cadastre sua impressão digital ou rosto nas configurações.',hardware:'Sensor biométrico indisponível. Use o PIN.',cancel:'Você pode desbloquear com o PIN.',enabled:'Biometria ativada.',disabled:'Biometria desativada.',error:'Não foi possível autenticar. Use o PIN.'},
    en:{missing:'Set a six-digit PIN first.',unavailable:'Biometrics are unavailable on this device.',enroll:'Enroll a fingerprint or face in device settings.',hardware:'Biometric sensor is busy. Use your PIN.',cancel:'You can unlock using your PIN.',enabled:'Biometric unlock enabled.',disabled:'Biometric unlock disabled.',error:'Authentication failed. Use your PIN.'}
  };
  const words=()=>txt[window.Data?.store?.settings?.lang]||txt.es;
  function notice(message){
    const error=document.getElementById('smarty-bio-error');
    if(error && !document.getElementById('lock-screen')?.classList.contains('hidden'))error.textContent=message;
    else window.UI?.showSnackbar?.(message);
  }
  function isNative(){return typeof window.SmartyAndroid?.authenticateBiometric==='function';}
  function status(){try{return isNative()&&window.SmartyAndroid?.getBiometricStatus?Number(window.SmartyAndroid.getBiometricStatus()):-9}catch(_){return -9}}
  function reason(s){if(s===11)return words().enroll;if(s===1)return words().hardware;return words().unavailable;}
  function begin(mode){
    if(!window.Data?.store?.settings?.pin){notice(words().missing);return false}
    if(pending)return false;
    const s=status();if(s!==0){notice(reason(s));return false}
    pending=mode;
    try{window.SmartyAndroid.authenticateBiometric();return true}catch(_){pending=null;notice(words().error);return false}
  }
  function nativeResult(result){
    if(!pending)return;
    const mode=pending;pending=null;
    if(result==='success'){
      if(mode==='enable'){
        window.Data.store.settings.biometricEnabled=true;
        window.Data.save();
        notice(words().enabled);
      }else if(mode==='unlock'&&window.Data?.store?.settings?.biometricEnabled&&window.Data?.store?.settings?.pin){
        const lock=document.getElementById('lock-screen');
        if(lock&&!lock.classList.contains('hidden'))window.Main?.unlockApp?.();
      }
    }else if(result!=='cancel'){
      const code=Number(String(result).split(':')[1]);
      notice(String(result).startsWith('unavailable:')?reason(code):words().error);
    }
    // Rehabilita el interruptor tras éxito, cancelación o error;
    // así es posible reintentar sin cerrar y abrir Ajustes.
    if(mode==='enable')window.UI?.renderSettingsView?.();
  }
  function toggle(input){
    if(!input)return;
    const next=Boolean(input.checked);
    input.checked=false;
    if(!next){
      window.Data.store.settings.biometricEnabled=false;window.Data.save();
      input.checked=false;notice(words().disabled);return;
    }
    input.disabled=true;
    if(!begin('enable')){input.disabled=false;input.checked=false}
  }
  function install(){
    const lock=document.getElementById('lock-screen');
    if(!lock)return;
    let message=document.getElementById('smarty-bio-error');
    if(!message){message=document.createElement('div');message.id='smarty-bio-error';
      lock.querySelector('.pin-display')?.insertAdjacentElement('afterend',message)}
    const btn=lock.querySelector('.pin-pad .pin-btn:nth-child(10)');
    if(btn){
      btn.classList.add('bio-btn-active');btn.textContent='';
      btn.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2c-5 0-9 4-9 9m18 0c0-5-4-9-9-9M7 13v-2a5 5 0 0110 0v2M5 16v-5m14 5v-5M9 16v-5a3 3 0 016 0v5M12 15v7M6.5 19c.6 1.5 1.5 2.5 2.5 3M17.5 19c-.6 1.5-1.5 2.5-2.5 3"/></svg>';
      btn.setAttribute('role','button');btn.setAttribute('aria-label','Huella digital');btn.setAttribute('tabindex','0');
      btn.onclick=()=>begin('unlock');btn.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();begin('unlock')}};
      btn.hidden=!window.Data?.store?.settings?.biometricEnabled;
    }
  }
  function tryAuto(){
    if(lastAuto)return;
    if(!window.Data?.store?.settings?.biometricEnabled||!window.Data?.store?.settings?.pin)return;
    const lock=document.getElementById('lock-screen');if(!lock||lock.classList.contains('hidden'))return;
    lastAuto=true;begin('unlock');
  }
  function checkReturn(){
    if(document.visibilityState==='hidden'){awaySince=Date.now();return;}
    if(!awaySince)return;
    const elapsed=Date.now()-awaySince;awaySince=0;
    if(elapsed<30000||!window.Data?.store?.settings?.pin||!window.Main?.sessionAuthenticated)return;
    window.Main.sessionAuthenticated=false;
    window.Main.tempPin='';window.Main.updatePinUI?.();
    const lock=document.getElementById('lock-screen');lock?.classList.remove('hidden');
    lastAuto=false;setTimeout(tryAuto,300);
  }
  window.SmartyBiometrics={nativeResult,toggle,status,begin,install};
  window.addEventListener('load',()=>{
    install();setTimeout(()=>{install();tryAuto()},650);
    document.addEventListener('visibilitychange',checkReturn);
  });
})();
