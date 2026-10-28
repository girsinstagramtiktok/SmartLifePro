const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const styles=[];
let tip='Un consejo completo, sin truncar ni cortar.';
const document={
  head:{appendChild(el){styles.push(el);created.set(el.id,el)}},
  body:{appendChild(el){el.attached=true;created.set(el.id,el)}},
  createElement(){return {classList:{add(x){this[x]=true},remove(x){this[x]=false}},setAttribute(){},textContent:''}},
  getElementById(id){return created.get(id)||null},
};
const created=new Map();
const Assistant={updateMood(){},getSmartTip(){return tip}};
const ctx={document,window:{},Assistant,setTimeout:(fn)=>{return 123},clearTimeout(){},console};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'smarty-ota.js'),'utf8'),ctx);
assert.match(ctx.window.SMARTY_PATCH_BUILD_ID,/smarty-light-/);
assert.equal(styles.length,1);
assert.match(styles[0].textContent,/translateX\(-22px\)/);
assert.match(styles[0].textContent,/object-fit: contain !important/);
Assistant.giveTip();
const layer=created.get('smarty-floating-tip');
assert.ok(layer&&layer.attached);
assert.equal(layer.textContent,tip);
assert.equal(layer.classList['is-visible'],true);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'smarty-ota.js'),'utf8'),ctx);
assert.equal(styles.length,1,'La actualización repetida no debe duplicar estilos');
assert.doesNotMatch(fs.readFileSync(path.join(__dirname,'.github/workflows/android-apk.yml'),'utf8'),/releases\/download/);
console.log('OK: un solo archivo Vercel, estilos sin duplicados, círculo y consejos completos.');

// También verificar el JS REAL generado por android-apk.yml, no un botón simulado.
const source=fs.readFileSync(path.join(__dirname,'.github/workflows/android-apk.yml'),'utf8');
const raw = source.match(/          cat << 'EOF_SCRIPT' > inject_apk\.js\n([\s\S]*?)          EOF_SCRIPT/);
assert.ok(raw,'El workflow debe generar el bootstrap');
const code = raw[1].split('\n').map(x=>x.startsWith('          ') ? x.slice(10):x).join('\n');
const match = code.match(/const addons = \[([\s\S]*?)\n\]\.join\(\"\\n\"\);/);
assert.ok(match,'Debe encontrarse el código de addons');
const lines=[];
for (const line of match[1].split('\n')) {
  const trimmed=line.trim();
  if (trimmed.startsWith('\"')) {
    try { lines.push(JSON.parse(trimmed.replace(/,$/,''))); } catch (_) {}
  }
}
const addon=lines.join('\n');
const begin=addon.indexOf('  window.checkForOtaUpdateNow = function() {');
const end=addon.indexOf('  function hookSettingsAndExtras()',begin);
assert.ok(begin>=0 && end>begin,'El workflow debe generar el botón rápido');
const logic=addon.slice(begin,end);
const clientStatus={style:{},id:'smarty-quick-status',textContent:''};
const btn={insertAdjacentElement(_p,obj){assert.equal(obj,clientStatus)}};
let script;
const doc={
  querySelector(){return btn},
  getElementById(id){return id==='smarty-quick-status' && script ? clientStatus:null},
  createElement(tag){return tag==='div' ? clientStatus : {remove(){}}},
  head:{appendChild(s){script=s;assert.match(s.src,/^https:\/\/smart-life-pro\.vercel\.app\/smarty-ota\.js\?v=/)}}
};
const win={SMARTY_PATCH_BUILD_ID:'v-old'};
const c={window:win,document:doc,Date,Math,setTimeout:()=>42,clearTimeout:()=>{}};
vm.runInNewContext(logic,c);
win.checkForOtaUpdateNow();
assert.equal(win.SMARTY_PATCH_BUILD_ID,null);
assert.match(clientStatus.textContent,/Consultando/);
win.SMARTY_PATCH_BUILD_ID='v-new';
script.remove=()=>{};
script.onload();
assert.match(clientStatus.textContent,/Actualización ligera aplicada: v-new/);
console.log('OK: botón realmente generado desde YAML, prueba de ejecución real y estado visible.');
