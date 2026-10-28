'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, 'ota-client.js'), 'utf8');
const repo = 'girsinstagramtiktok/SmartLifePro';
const tag = 'ota-0123456789ab';
const ver = '1.0.0-0123456789ab';
const asset = (tag='ota-0123456789ab') => ({name:'smarty-web.zip',size:12000,browser_download_url:`https://github.com/${repo}/releases/download/${tag}/smarty-web.zip`});
const release = (tag='ota-0123456789ab', date='2026-10-27T21:00:00Z') => ({tag_name:tag,assets:[asset(tag)],published_at:date,draft:false,prerelease:false});
const older = release('ota-111111111111', '2026-10-26T20:00:00Z');
async function run(options={}) {
  const output=[];
  const counts={download:0,set:0,ready:0,unregister:0,cache:0};
  let loaded=options.installedVersion || 'builtin';
  const status={style:{},textContent:'',setAttribute(){},previousElementSibling:null};
  const button={insertAdjacentElement(_where,el){assert.equal(el,status);status.previousElementSibling=button;}};
  const plugin = {
    async current() {return {bundle:{version:loaded}};},
    async download(item) {counts.download++; assert.equal(item.version,ver); assert.ok(item.url.startsWith('https://github.com/')); return {id:'bundleXYZ',version:ver};},
    async set(item) {counts.set++;assert.deepEqual(JSON.parse(JSON.stringify(item)),{id:'bundleXYZ'});loaded=ver;},
    async notifyAppReady() {counts.ready++;}
  };
  const window={
    SMARTY_OTA_REPOSITORY:repo,Capacitor: {Plugins: options.noPlugin ? {} : {CapacitorUpdater:plugin},isNativePlatform:()=>true},
    addEventListener(_name,fn){window._load=fn;},
    caches:{async keys(){return ['smart-life-pro-v10','other-cache']},async delete(k){counts.cache++;assert.equal(k,'smart-life-pro-v10')}}
  };
  const document={readyState:'complete',querySelector(){return button},getElementById(){return null},createElement(){return status}};
  const navigator={serviceWorker:{async getRegistrations(){return [{async unregister(){counts.unregister++;}}]}}};
  const response={status:options.http||200,ok:(options.http||200)===200,async json(){return options.manifest || {channel:'stable',tag,version:ver,url:`https://github.com/${repo}/releases/download/${tag}/smarty-web.zip`}}};
  const sandbox={window,document,navigator,console:{info(...args){output.push(args.join(' '))},error(...args){output.push(args.join(' '))},warn(){}},
    fetch:async (url)=>{assert.match(url,new RegExp(`^https://raw\\.githubusercontent\\.com/${repo}/smarty-ota/manifest\\.json\\?t=\\d+$`));return response;},
    AbortController, setTimeout, clearTimeout};
  vm.runInNewContext(code,sandbox,{filename:'ota-client.js'});
  const ota=window.SmartyLiveUpdate;
  assert.equal(typeof window.checkForOtaUpdateNow,'function');
  assert.equal(typeof ota.getReleaseAsset,'function','Compatibilidad obligatoria de pruebas');
  assert.equal(ota.getReleaseAsset(release(),repo).version,ver);
  assert.equal(ota.getReleaseAsset({...release(),assets:[{...asset(),browser_download_url:'https://attacker.example/a.zip'}]},repo),null);
  assert.equal(ota.getReleaseAsset({...release(),prerelease:true},repo),null);
  assert.equal(ota.chooseLatestOta([release('v1','2026-11-01T00:00:00Z'),older,release()],repo).version,ver);
  assert.equal(ota.parseManifest({channel:'stable',tag,version:ver,url:`https://github.com/${repo}/releases/download/${tag}/smarty-web.zip`},repo).version,ver);
  assert.throws(()=>ota.parseManifest({channel:'stable',tag,version:ver,url:'https://evil.com/x.zip'},repo),/no autorizado/);
  await new Promise(r=>setImmediate(r));
  await ota.check();
  if(options.noPlugin) assert.equal(status.textContent.includes('complemento'),true);
  else if(options.http && options.http !== 200) assert.match(status.textContent,/HTTP|Canal OTA/);
  else if(options.manifest?.url?.startsWith('https://evil')) {assert.match(status.textContent,/no autorizado/);assert.equal(counts.download,0);}
  else if(options.installedVersion===ver) {assert.equal(counts.download,0);assert.equal(counts.set,0);}
  else {assert.equal(counts.download,1);assert.equal(counts.set,1);await ota.check();assert.equal(counts.download,1);}
  if(!options.noPlugin) assert.equal(counts.ready,1);
  assert.equal(counts.unregister, counts.set ? 2 : 1);
  assert.equal(counts.cache, counts.set ? 2 : 1);
  return counts;
}
(async()=>{
  await run();
  await run({installedVersion:ver});
  await run({http:404});
  await run({noPlugin:true});
  await run({http:403});
  await run({manifest:{channel:'stable',tag,version:ver,url:'https://evil.com/x.zip'}});
  console.log('OK: manifiesto estático sin GitHub API (incluye 403), versiones, errores, plugin y descarga/activación.');
})().catch(e=>{console.error(e);process.exitCode=1});
