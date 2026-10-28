'use strict';
// Se ejecuta sobre www/ REAL generado por el workflow, no sobre fuentes sueltas.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const web = path.join(__dirname,'www');
const read = file => fs.readFileSync(path.join(web,file),'utf8');
const index = read('index.html');
const addons = read('smarty-pro-addons.js');
const client = read('ota-client.js');
const config = read('ota-config.js');
for (const file of ['index.html','style.css','data.js','ui.js','main.js','shopping.js','finance.js','bank-bridge.js','camera-bridge.js','ota-config.js','ota-client.js','smarty-pro-addons.js']) {
  assert(fs.statSync(path.join(web,file)).size>100 || file==='ota-config.js',`${file} falta o está vacío`);
}
const pos = ['main.js','smarty-pro-addons.js','ota-config.js','ota-client.js'].map(file=>index.indexOf(`src="${file}"`));
assert(pos.every(p=>p>=0),'Los cuatro scripts deben cargar en el HTML');
assert(pos.every((p,i)=>i===0 || pos[i-1]<p),'Orden de carga incorrecto');
assert(!addons.includes('smart-life-pro.vercel.app'),'El bundle sigue ejecutando código remoto de Vercel');
assert(!addons.includes('document.head.appendChild(s)'),'El bundle incluye el cargador heredado de scripts');
assert(!index.includes('src="smarty-ota.js"'),'No debe cargar el módulo heredado');
assert(!index.includes("'serviceWorker' in navigator"),'El APK no debe registrar PWA Service Worker');
assert(client.includes('parseManifest') && client.includes('notifyAppReady'),'Falta mecanismo OTA por manifiesto');
assert(!client.includes('api.github.com'), 'La app no debe usar la API REST pública de GitHub');
assert(config.includes('SMARTY_OTA_REPOSITORY'),'No se configuró repo OTA');
console.log('OK: bundle web real integra el botón, cliente, repo y módulos sin Vercel ni service worker PWA.');
