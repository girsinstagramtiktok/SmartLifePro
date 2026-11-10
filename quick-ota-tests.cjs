'use strict';
// Verificación del arranque Bento con interfaz y mejoras locales.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = __dirname;
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const ota = read('smarty-ota.js');
const bento = read('bento-home.js');
const css = read('bento-home.css');
const workflow = read('.github/workflows/android-apk.yml');
new vm.Script(ota,{filename:'smarty-ota.js'});
new vm.Script(bento,{filename:'bento-home.js'});
assert.match(ota,/SMARTY_PATCH_BUILD_ID\s*=\s*'smarty-light-/);
assert.match(ota,/SmartySpendingInsights/,'Conservar funciones de gastos, promedios y topes');
assert.match(bento,/SMARTY_BENTO_NATIVE_BASE\s*=\s*true/,'Bento debe declararse como diseño base');
assert.match(bento,/requestAnimationFrame\(\(\)=>document\.getElementById\('smarty-prepaint'\)\?\.remove\(\)\)/,
 'La pantalla debe mostrarse inmediatamente después de montar Bento');
assert.match(css,/#view-home\.bento-home/);
assert.match(workflow,/cp index\.html style\.css bento-home\.css/);
assert.match(workflow,/cp data\.js ui\.js assistant\.js finance\.js shopping\.js main\.js bento-home\.js/);
assert.match(workflow,/cp smarty-ota\.js www\/smarty-ota\.js/);
assert.match(workflow,/smarty-prepaint/);
assert.doesNotMatch(workflow,/releases\/download/);
assert.doesNotMatch(workflow,/setTimeout\(function\(\)\{[^\n]*loadSmartyOta/i);
console.log('OK: Bento se incluye como interfaz local y mantiene las mejoras funcionales.');
