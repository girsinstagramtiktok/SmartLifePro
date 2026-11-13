'use strict';
/* Verifica el contenido real de www/ justo antes de empaquetar el APK.
 * Prohíbe traer al móvil el diseño Vercel antiguo y exige el actualizador firmado.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=__dirname;
const read=(name)=>fs.readFileSync(path.join(base,'www',name),'utf8');
for(const f of ['index.html','style.css','bento-home.css','bento-global.css','smarty-daily-spending.css','bento-home.js','smarty-biometrics.js','smarty-daily-spending.js','smarty-app-updater.js','smarty-daily-backup.js','smarty-money-core.js','smarty-investment-catalog.js','smarty-money-ui.js','smarty-list-reminders.js','smarty-settings-modern.js','smarty-money.css','smarty-release-config.js','data.js','ui.js','assistant.js','finance.js','shopping.js','main.js','smarty-bank-source.js','bank-bridge.js','camera-bridge.js','smarty-pro-addons.js','smarty-ota.js']){
 assert.ok(fs.existsSync(path.join(base,'www',f)),'Falta '+f+' en el APK');
}
const html=read('index.html');
const addons=read('smarty-pro-addons.js');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)].map(x=>x[1]);
const main=scripts.indexOf('main.js');
assert.ok(main>=0);
assert.deepEqual(scripts.slice(main,main+6),['main.js','smarty-release-config.js','smarty-app-updater.js','smarty-pro-addons.js','smarty-ota.js','smarty-daily-backup.js']);
assert.match(html,/bento-home.css/);assert.match(html,/bento-global.css/);assert.match(html,/smarty-daily-spending.css/);assert.match(html,/smarty-daily-spending.js/);for(const x of ['smarty-money-core.js','smarty-investment-catalog.js','smarty-money-ui.js','smarty-list-reminders.js','smarty-settings-modern.js'])assert.ok(scripts.includes(x),'Falta script '+x);
assert.match(html,/smarty-prepaint/);
assert.doesNotMatch(html,/src=["'](?:ota-client|ota-config)\.js/);
assert.match(addons,/window\.SmartyAppUpdater\?\.checkNow\(\)/);
assert.match(addons,/smarty-native-update-state/);
assert.doesNotMatch(addons,/smart-life-pro\.vercel\.app\/smarty-ota\.js\?v=/);
assert.equal(read('smarty-ota.js'),fs.readFileSync(path.join(base,'smarty-ota.js'),'utf8'));
for(const f of ['smarty-ota.js','smarty-app-updater.js','smarty-daily-backup.js','smarty-pro-addons.js'])new vm.Script(read(f),{filename:f});
const cfg=read('smarty-release-config.js');
assert.match(cfg,/SMARTY_RELEASE_CONFIG/);
assert.doesNotMatch(cfg,/PRIVATE_TOKEN|PASSWORD|KEYSTORE|Bearer/i);
console.log('OK: Bento local, actualización APK segura, orden JS correcto, OTA visual antigua desactivada.');
