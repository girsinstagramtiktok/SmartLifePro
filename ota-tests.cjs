const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const listeners = {};
let countDownload = 0, countSet = 0, notifications = 0;
let installedVersion = 'builtin';
const repo = 'example/SmartLifePro';
const version = 'ota-0123456789ab';
const link = `https://github.com/${repo}/releases/download/${version}/smarty-web.zip`;
const logs = [];
const plugin = {
  async current() { return { bundle: { version: installedVersion } }; },
  async download(update) { countDownload++; assert.equal(update.version, version); assert.equal(update.url, link); return { id:'20261027',version }; },
  async set(bundle) { countSet++; assert.equal(bundle.id, '20261027'); installedVersion = version; },
  async notifyAppReady() { notifications++; }
};
const context = {
  window: { SMARTY_OTA_REPOSITORY: repo, Capacitor: { Plugins: { CapacitorUpdater: plugin } }, UI: { showSnackbar: v => logs.push(v) }, addEventListener:(t,fn)=>listeners[t]=fn },
  document:{ addEventListener:(t,fn)=>listeners[t]=fn },
  fetch: async () => ({ ok:true, json:async()=>({tag_name:version, assets:[{ name:'smarty-web.zip', size:1300, browser_download_url:link }]}) }),
  setTimeout: fn => fn(), console
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'ota-client.js'),'utf8'),context);
(async()=>{
  const ota = context.window.SmartyLiveUpdate;
  assert(ota.getReleaseAsset({tag_name:version,assets:[{name:'smarty-web.zip',size:1200,browser_download_url:link}]},repo));
  assert.equal(ota.getReleaseAsset({tag_name:version,assets:[{name:'smarty-web.zip',size:1200,browser_download_url:'https://malicious.site/update.zip'}]},repo),null);
  listeners.load();
  await new Promise(r => setImmediate(r));
  assert.equal(notifications, 1);
  await ota.check();
  assert.equal(countDownload,1);
  assert.equal(countSet,1);
  await ota.check();
  assert.equal(countDownload,1,'misma version no descarga de nuevo');
  assert(logs.some(msg=>msg.includes('última')));
  console.log('OK: validacion de URL, descarga, aplicacion y versiones OTA.');
})().catch(err=>{ console.error(err);process.exitCode=1; });
