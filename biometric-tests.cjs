'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(__dirname+'/smarty-biometrics.js','utf8');
let biometricCode=0,calls=[],saves=0,unlocks=0,snacks=[],timers=new Map(),nextTimer=0;
const active=new Set();
const switchInput={checked:false,disabled:false};
const finger={classList:{add(){}},hidden:false,innerHTML:'',setAttribute(){},id:null};
const lock={classList:{contains:x=>active.has(x),add:x=>active.add(x),remove:x=>active.delete(x)},querySelector(s){if(s==='.pin-pad .pin-btn:nth-child(10)')return finger;if(s==='.pin-display')return {insertAdjacentElement(){}};return null;}};
const elements={'lock-screen':lock};
const document={getElementById:id=>elements[id]||null,querySelectorAll:sel=>sel==='[data-smarty-biometric-toggle]'?[switchInput]:[],createElement:()=>({}),addEventListener(){},visibilityState:'visible'};
const Data={store:{settings:{lang:'es',pin:'135790',biometricEnabled:true}},save(){saves++;}};
const Main={unlockApp(){unlocks++;}};
const window={Data,Main,UI:{showSnackbar:t=>snacks.push(t)},SmartyAndroid:{authenticateBiometric(id){calls.push(id);},getBiometricStatus(){return biometricCode;}},addEventListener(){},alert(){}};
const setTimeout=f=>{const id=++nextTimer;timers.set(id,f);return id;};
const clearTimeout=id=>timers.delete(id);
vm.runInNewContext(code,{window,document,setTimeout,clearTimeout,Date,console},{filename:'smarty-biometrics.js'});
const bio=window.SmartyBiometrics;
assert.ok(bio);
// La persona desactiva el interruptor: debe persistirse incluso si antes estaba activo.
switchInput.checked=false;bio.toggle(switchInput);
assert.equal(Data.store.settings.biometricEnabled,false);
assert.equal(switchInput.checked,false);
assert.equal(switchInput.disabled,false);
assert.equal(saves,1);
// No se activa simplemente marcando la casilla, se espera confirmacion de Android.
switchInput.checked=true;bio.toggle(switchInput);
assert.equal(Data.store.settings.biometricEnabled,false);
assert.equal(switchInput.disabled,true);
assert.equal(calls.length,1);
const first=calls.at(-1);
// Una solicitud vieja no puede activar la opcion.
bio.nativeResult('success','antiguo');assert.equal(Data.store.settings.biometricEnabled,false);
// Cancelar debe reactivar el control inmediatamente.
bio.nativeResult('cancel',first);
assert.equal(switchInput.disabled,false);
assert.equal(switchInput.checked,false);
// Puede reintentarse sin reiniciar.
switchInput.checked=true;bio.toggle(switchInput);
const second=calls.at(-1);
assert.notEqual(second,first);
bio.nativeResult('success',second);
assert.equal(Data.store.settings.biometricEnabled,true);
assert.equal(switchInput.checked,true);
assert.equal(switchInput.disabled,false);
// Prueba de retorno tras error del lector.
bio.begin('unlock');const third=calls.at(-1);
bio.nativeResult('error:7',third);
assert.equal(unlocks,0);
// En la pantalla PIN una huella confirmada desbloquea.
bio.begin('unlock');const fourth=calls.at(-1);
bio.nativeResult('success',fourth);
assert.equal(unlocks,1);
// Sin respuesta de Android debe liberar el interruptor automaticamente.
bio.disable();switchInput.checked=true;bio.toggle(switchInput);
assert.equal(switchInput.disabled,true);
for(const [id,callback] of [...timers]){timers.delete(id);callback();}
assert.equal(switchInput.disabled,false);
assert.equal(Data.store.settings.biometricEnabled,false);
// No hay biometria enrolada: no bloquear el interruptor.
biometricCode=11;switchInput.checked=true;bio.toggle(switchInput);
assert.equal(switchInput.disabled,false);
assert.equal(Data.store.settings.biometricEnabled,false);
// Callback retrasado despues de desactivar jamas reactiva la preferencia.
biometricCode=0;switchInput.checked=true;bio.toggle(switchInput);
const delayed=calls.at(-1);bio.disable();bio.nativeResult('success',delayed);
assert.equal(Data.store.settings.biometricEnabled,false);
console.log('OK: on/off persistente, desbloqueo con token, errores, cancelacion, timeout y callbacks obsoletos.');
