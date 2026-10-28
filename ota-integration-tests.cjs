'use strict';
/* Comprueba exactamente el directorio www/ que se empaquetará en el APK.
   Arquitectura activa: actualización ligera de smarty-ota.js desde Vercel.
   Prohíbe reintroducir el cliente ZIP de GitHub en el HTML del APK. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const web = path.join(__dirname, 'www');
function read(name) {
  const file = path.join(web, name);
  assert.ok(fs.existsSync(file), `Falta ${name} en el APK`);
  return fs.readFileSync(file, 'utf8');
}
const html = read('index.html');
const addons = read('smarty-pro-addons.js');
for (const name of ['style.css', 'data.js', 'ui.js', 'assistant.js',
  'finance.js', 'shopping.js', 'main.js', 'bank-bridge.js', 'camera-bridge.js']) {
  assert.ok(read(name).length > 100, `${name} está vacío`);
}

const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)]
  .map(match => match[1]);
const mainIndex = scripts.indexOf('main.js');
assert.ok(mainIndex !== -1, 'Falta main.js en index.html');
assert.equal(scripts[mainIndex + 1], 'smarty-pro-addons.js',
  'Las mejoras deben cargarse inmediatamente después de main.js');
assert.ok(!scripts.includes('ota-client.js'),
  'El APK todavía carga ota-client.js, que REEMPLAZA el botón Vercel por el ZIP de GitHub');
assert.ok(!scripts.includes('ota-config.js'),
  'El APK todavía carga la configuración del cliente ZIP anterior');
assert.ok(!scripts.includes('smarty-ota.js'),
  'El parche remoto debe cargarse bajo demanda, no desde un archivo local desactualizado');
assert.ok(!html.includes("'serviceWorker' in navigator"),
  'El APK no debe registrar un service worker PWA antiguo');

new vm.Script(addons, {filename:'www/smarty-pro-addons.js'});
assert.match(addons, /window\.checkForOtaUpdateNow\s*=\s*function\s*\(/,
  'El botón Vercel no se generó en el APK');
assert.match(addons, /https:\/\/smart-life-pro\.vercel\.app\/smarty-ota\.js\?v=/,
  'El actualizador debe cargar directamente el archivo de Vercel');
assert.doesNotMatch(addons, /api\.github\.com|releases\/download|raw\.githubusercontent\.com/,
  'El botón vuelve a depender de GitHub');

// Ejercitar el código REAL extraído del archivo que llegará al teléfono.
const begin = addons.indexOf('  window.checkForOtaUpdateNow = function() {');
const end = addons.indexOf('  function hookSettingsAndExtras()', begin);
assert.ok(begin !== -1 && end > begin, 'No se pudo extraer el botón de Smarty');
const snippet = addons.slice(begin, end);
const status = {style:{}, textContent:'', id:'smarty-quick-status'};
const button = {insertAdjacentElement(position, element) {
  assert.equal(position, 'afterend'); assert.equal(element, status);
}};
let remoteScript;
const document = {
  querySelector(selector) {assert.match(selector, /checkForOtaUpdateNow/);return button;},
  getElementById() {return remoteScript ? status : null;},
  createElement(tag) {return tag === 'div' ? status : {remove(){}};},
  head:{appendChild(script) {
    remoteScript = script;
    assert.match(script.src, /^https:\/\/smart-life-pro\.vercel\.app\/smarty-ota\.js\?v=/);
  }}
};
const window = {SMARTY_PATCH_BUILD_ID:'before'};
vm.runInNewContext(snippet, {document,window,Date,Math,setTimeout:()=>1,clearTimeout(){}});
window.checkForOtaUpdateNow();
assert.equal(window.SMARTY_PATCH_BUILD_ID,null);
assert.match(status.textContent,/Consultando/);
window.SMARTY_PATCH_BUILD_ID='smarty-light-test';
remoteScript.onload();
assert.match(status.textContent,/Actualización ligera aplicada: smarty-light-test/);

console.log('OK: APK generado utiliza exclusivamente Vercel; botón probado; ningún cliente ZIP carga ni sobrescribe la función.');
