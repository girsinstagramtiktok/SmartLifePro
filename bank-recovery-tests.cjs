'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const source=fs.readFileSync('bank-bridge.js','utf8');
const callback={};let rebinds=0,forced=0,perm=true,connected=false,opened=0,notice='';
const native={
 getPendingNotificationsJson:()=> '[]',peekPendingNotificationsJson:()=> '[]',ackPendingNotificationsJson:()=>{},
 getNotificationDiagnosticsJson:()=>JSON.stringify({permission:perm,connected}),
 isNotificationListenerEnabled:()=>perm,
 requestBankListenerRebind:()=>{rebinds++},reconnectBankListener:()=>{forced++;return 'requested'},
 openNotificationSettings:()=>{opened++},getAllowedNotificationPackages:()=> 'com.bank.test'
};
const window={SmartyAndroid:native,addEventListener:(key,fn)=>callback['win:'+key]=fn};
const document={readyState:'complete',visibilityState:'visible',addEventListener:(key,fn)=>callback['doc:'+key]=fn,getElementById:()=>null};
const localStorage={getItem:()=>null,setItem:()=>{}};
const Data={store:{settings:{bankAutoDetect:true,bankAutoSaveMode:'auto',allowedBankPackages:['com.bank.test']},expenses:[]},save(){}};
const UI={t:s=>s,showSnackbar:s=>{notice=s}};
const ctx={window,document,Data,UI,localStorage,setTimeout:(fn)=>fn(),setInterval:()=>{},console,Date,JSON,Math};
vm.createContext(ctx);vm.runInContext(source,ctx);
assert.equal(rebinds,1,'El inicio intenta reconectar si el servicio está desconectado');
assert.equal(window.SmartyBankBridge.reconnect(),'requested');assert.equal(forced,1);
connected=true;assert.equal(window.SmartyBankBridge.reconnect(),'connected');assert.equal(forced,1);
connected=false;perm=false;assert.equal(window.SmartyBankBridge.reconnect(),'permission_missing');assert.equal(opened,1);
assert.match(notice,/notificaciones/);
const workflow=fs.readFileSync('.github/workflows/android-apk.yml','utf8');
const nativePatch=fs.readFileSync('tools/patch-bank-listener-native.cjs','utf8');
const worker=fs.readFileSync('tools/SmartyBankHealthWorker.java.txt','utf8');
assert.match(workflow,/node tools\/patch-bank-listener-native.cjs/);
assert.match(workflow,/Reconectar lector/);
assert.match(nativePatch,/SMARTY_BANK_LISTENER_RECOVERY_V1/);
assert.match(worker,/ComponentName\.unflattenFromString/);
assert.match(worker,/requestRebind/);
assert.match(worker,/15, TimeUnit.MINUTES/);
console.log('OK: recuperación manual y automática, acceso revocado, puente nativo y programador.');
