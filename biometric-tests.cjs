'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(__dirname+'/smarty-biometrics.js','utf8');
const eventHandlers={};
const classes=new Set();
const unlocks=[];
let status=0, nativeCalls=0, saves=0,renders=0;
const lock={classList:{contains:x=>classes.has(x),add:x=>classes.add(x),remove:x=>classes.delete(x)},querySelector(s){if(s==='.pin-pad .pin-btn:nth-child(10)')return button;if(s==='.pin-display')return {insertAdjacentElement(){}};return null}};
const button={classList:{add(){}},setAttribute(){},hidden:false};
const document={getElementById:id=>id==='lock-screen'?lock:null,createElement:()=>({}),visibilityState:'visible',addEventListener(){}};
const Data={store:{settings:{lang:'es',pin:'135790',biometricEnabled:false}},save(){saves++}};
const Main={unlockApp(){unlocks.push('ok')}};
const window={Data,Main,SmartyAndroid:{authenticateBiometric(){nativeCalls++},getBiometricStatus(){return status}},addEventListener(ev,fn){eventHandlers[ev]=fn}};
vm.runInNewContext(code,{window,document,setTimeout(){}},{filename:'smarty-biometrics.js'});
const bio=window.SmartyBiometrics;
assert.ok(bio);
// Activación: no persistir antes de la confirmación Android.
const toggle={checked:true,disabled:false};
bio.toggle(toggle);
assert.equal(Data.store.settings.biometricEnabled,false);
assert.equal(nativeCalls,1);
bio.nativeResult('cancel');
assert.equal(Data.store.settings.biometricEnabled,false);
const toggle2={checked:true,disabled:false};
bio.toggle(toggle2);
bio.nativeResult('success');
assert.equal(Data.store.settings.biometricEnabled,true);
assert.equal(saves,1);
assert.equal(unlocks.length,0,'Activar huella en Ajustes no desbloquea la app');
// Una huella válida sólo desbloquea si el PIN sigue configurado y el lock visible.
bio.begin('unlock');bio.nativeResult('error:7');
assert.equal(unlocks.length,0);
bio.begin('unlock');bio.nativeResult('success');
assert.equal(unlocks.length,1);
// Dispositivo no disponible: mantener PIN y no activar.
status=11;const toggle3={checked:true,disabled:false};Data.store.settings.biometricEnabled=false;
bio.toggle(toggle3);assert.equal(toggle3.checked,false);assert.equal(Data.store.settings.biometricEnabled,false);
// Cancelar biometría deja usuario frente al PIN.
assert.equal(bio.begin('unlock'),false);
console.log('OK: activación con confirmación, rechazo, cancelación y desbloqueo seguro por resultado nativo.');
