'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const code=fs.readFileSync('smarty-app-updater.js','utf8');const sha='a'.repeat(64);
function testSetup(changes={}){
 const nodes={};const element=(id)=>({id,style:{},hidden:false,disabled:false,textContent:'',remove(){delete nodes[this.id]},insertAdjacentElement(_where,el){nodes[el.id]=el;}});
 nodes['smarty-native-update-state']=element('smarty-native-update-state');const calls=[];
 const native={getInstalledVersionCode:()=>100101,downloadAndSave:(...args)=>calls.push(args)};
 const win={SmartyAppUpdateNative:native,SMARTY_RELEASE_CONFIG:{repository:'owner/repo'},Data:{store:{settings:{lang:'es'}}}};
 const ctx={window:win,document:{addEventListener(){},getElementById:id=>nodes[id]||null,createElement:()=>element('new')},fetch:async()=>({ok:true,json:async()=>({tag_name:'v100201',assets:[{name:'SmartLifePro.apk',state:'uploaded',browser_download_url:'https://github.com/owner/repo/releases/download/v100201/SmartLifePro.apk',digest:'sha256:'+sha}],...changes})})};
 vm.runInNewContext(code,ctx);return {win,nodes,calls};
}
(async()=>{
 const a=testSetup();await a.win.SmartyAppUpdater.checkNow();assert.match(a.nodes['smarty-native-update-state'].textContent,/Nueva versión/);
 a.nodes['smarty-update-download'].onclick();assert.deepEqual(a.calls[0],['https://github.com/owner/repo/releases/download/v100201/SmartLifePro.apk',sha,'100201']);
 a.win.SmartyAppUpdater.nativeEvent('saved','Descargas/SmartLifePro/SmartLifePro_v100201.apk');
 assert.match(a.nodes['smarty-native-update-state'].textContent,/Mis archivos/);
 assert.equal(a.nodes['smarty-update-download'].hidden,true);
 const b=testSetup({tag_name:'v100101'});await b.win.SmartyAppUpdater.checkNow();assert.match(b.nodes['smarty-native-update-state'].textContent,/más reciente/);
 const c=testSetup({assets:[{name:'SmartLifePro.apk',state:'uploaded',browser_download_url:'https://github.com/owner/repo/releases/download/v100201/SmartLifePro.apk'}]});await c.win.SmartyAppUpdater.checkNow();assert.match(c.nodes['smarty-native-update-state'].textContent,/SHA-256/);
 const java=fs.readFileSync('tools/SmartyUpdateBridge.java.txt','utf8');assert.match(java,/MediaStore\.Downloads/);assert.match(java,/MessageDigest/);assert.match(java,/verify\(tmp,expected\)/);assert.doesNotMatch(java,/startActivity\(/);assert.doesNotMatch(java,/downloadAndInstall/);
 console.log('OK: búsqueda Release, SHA-256, firma, descarga en carpeta visible sin instalador nativo.');
})().catch(err=>{console.error(err);process.exitCode=1});
