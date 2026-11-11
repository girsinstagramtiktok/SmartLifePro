'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('smarty-app-updater.js','utf8');
const DIGEST='a'.repeat(64);
function setup(payload={}){
  const statuses=[];let updateCalls=[];
  const el={textContent:'',hidden:false,style:{},insertAdjacentElement(_where,e){elements[e.id]=e;}};
  const elements={'smarty-native-update-state':el};
  const ctx={
    window:{Data:{store:{settings:{lang:'es'}}},SMARTY_RELEASE_CONFIG:{repository:'owner/repo',versionCode:100101},UI:{showSnackbar:msg=>statuses.push(msg)},SmartyAppUpdateNative:{getInstalledVersionCode:()=>100101,downloadAndInstall:(...args)=>updateCalls.push(args),installDownloadedApk:()=>{updateCalls.push(['install']);return 'Solicitando la instalación a Android…';},getInstallDiagnostics:()=>JSON.stringify({apkPresent:true,canInstallUnknownApps:false})}},
    document:{getElementById:id=>elements[id]||null,createElement:()=>({className:'',style:{},hidden:true,textContent:'',onclick:null,insertAdjacentElement(_where,e){elements[e.id]=e;}}),addEventListener:()=>{}},
    fetch:async(url)=>({ok:true,json:async()=>({tag_name:'v100201',name:'SmartLifePro 2',assets:[{name:'SmartLifePro.apk',state:'uploaded',browser_download_url:'https://github.com/owner/repo/releases/download/v100201/SmartLifePro.apk',digest:'sha256:'+DIGEST}],...payload})}),
  };
  ctx.window.window=ctx.window;vm.runInNewContext(source,ctx,{filename:'smarty-app-updater.js'});
  return {ctx,el,elements,updateCalls};
}
(async()=>{
  const a=setup();await a.ctx.window.SmartyAppUpdater.checkNow();
  assert.match(a.el.textContent,/Nueva versión disponible/);
  a.elements['smarty-update-install'].onclick();
  assert.deepEqual(a.updateCalls[0],['https://github.com/owner/repo/releases/download/v100201/SmartLifePro.apk',DIGEST,'100201']);
  a.ctx.window.SmartyAppUpdater.nativeEvent('permission','');
  assert.match(a.el.textContent,/Autoriza/);
  assert.equal(a.elements['smarty-update-install'].textContent,'Instalar APK descargado');
  a.elements['smarty-update-install'].onclick();
  assert.deepEqual(a.updateCalls[1],['install']);
  assert.match(a.el.textContent,/Solicitando la instalación/);
  a.elements['smarty-update-diagnostics'].onclick();
  assert.match(a.el.textContent,/canInstallUnknownApps/);
  const b=setup({tag_name:'v100101'});await b.ctx.window.SmartyAppUpdater.checkNow();
  assert.match(b.el.textContent,/más reciente/);
  const c=setup({assets:[{name:'SmartLifePro.apk',state:'uploaded',browser_download_url:'https://github.com/owner/repo/releases/download/v100201/SmartLifePro.apk',digest:null}]});
  await c.ctx.window.SmartyAppUpdater.checkNow();assert.match(c.el.textContent,/SHA-256/);
  const d=setup({assets:[{name:'SmartLifePro.apk',state:'uploaded',browser_download_url:'https://evil.example/malware.apk',digest:'sha256:'+DIGEST}]});
  await d.ctx.window.SmartyAppUpdater.checkNow();assert.match(d.el.textContent,/URL de descarga inesperada/);
  const native=fs.readFileSync('tools/SmartyUpdateBridge.java.txt','utf8');
  assert.match(native,/Intent\.ACTION_INSTALL_PACKAGE/);
  assert.match(native,/Intent\.ACTION_VIEW/);
  assert.match(native,/ClipData\.newRawUri/);
  assert.match(native,/FLAG_GRANT_READ_URI_PERMISSION/);
  assert.match(native,/getInstallDiagnostics/);
  assert.match(native,/@JavascriptInterface public String installDownloadedApk/);
  console.log('OK: consulta GitHub, descarga, firma y lanzamiento del instalador con diagnóstico visible.');
})().catch(err=>{console.error(err);process.exitCode=1});
