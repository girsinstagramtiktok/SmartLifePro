/*
 * Genera www/ con exactamente los mismos addons que el APK. No requiere Gradle.
 * Uso: GITHUB_REPOSITORY=usuario/repo node tools/build-ota-bundle.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/android-apk.yml'), 'utf8');
const match = /^          cat << 'EOF_SCRIPT' > inject_apk\.js\r?\n([\s\S]*?)^          EOF_SCRIPT\s*$/m.exec(workflow);
if (!match) throw new Error('No se encontró el generador de addons en android-apk.yml.');
const injector = match[1].split('\n').map(line => line.replace(/^          /, '')).join('\n');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const name of [
  'index.html','style.css','manifest.json','logo.png',
  'data.js','ui.js','assistant.js','finance.js','shopping.js','main.js',
  'bank-bridge.js','camera-bridge.js','ota-client.js',
  'idle.png','happy.png','worried.png','alert.png','thinking.png','listening.png','broke.png'
]) {
  if (fs.existsSync(path.join(root,name))) fs.copyFileSync(path.join(root,name), path.join(out,name));
  else if (name.endsWith('.js') || name === 'index.html') throw new Error('Falta archivo esencial: ' + name);
}
if (fs.existsSync(path.join(root, 'skins'))) fs.cpSync(path.join(root,'skins'), path.join(out,'skins'), { recursive:true });
fs.writeFileSync(path.join(out,'ota-config.js'), `window.SMARTY_OTA_REPOSITORY = ${JSON.stringify(process.env.GITHUB_REPOSITORY || '')};\n`);
const generatorPath = path.join(root, 'inject_apk.js');
const configPath = path.join(root, 'capacitor.config.json');
const originalConfig = fs.existsSync(configPath) ? fs.readFileSync(configPath) : null;
try {
  fs.writeFileSync(generatorPath, injector);
  execFileSync(process.execPath, [generatorPath], { cwd: root, stdio: 'inherit' });
} finally {
  fs.rmSync(generatorPath, { force: true });
  if (originalConfig !== null) fs.writeFileSync(configPath, originalConfig);
  else fs.rmSync(configPath, { force: true });
}
const html = fs.readFileSync(path.join(out, 'index.html'),'utf8');
for (const required of ['smarty-pro-addons.js','ota-client.js','ota-config.js','camera-bridge.js']) {
  if (!html.includes(`src="${required}"`)) throw new Error('El index.html no incluye ' + required);
  if (!fs.existsSync(path.join(out,required))) throw new Error('www no contiene ' + required);
}
console.log('OK: carpeta www preparada para OTA sin Gradle.');
