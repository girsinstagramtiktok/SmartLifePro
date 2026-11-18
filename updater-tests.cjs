'use strict';
// Tests del actualizador, con índice público prioritario y GitHub API de respaldo.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, 'smarty-app-updater.js'), 'utf8');
const workflow = fs.readFileSync(path.join(__dirname, '.github/workflows/smarty-release-index.yml'), 'utf8');
const sha = 'a'.repeat(64);
const release = {
  tag_name: 'v114801',
  name: 'Smarty Finance v114801',
  assets: [{
    name: 'SmartLifePro.apk', state: 'uploaded',
    browser_download_url: 'https://github.com/owner/repo/releases/download/v114801/SmartLifePro.apk',
    digest: 'sha256:' + sha
  }]
};
const manifest = {
  schema: 1, repository: 'owner/repo', tag: 'v114801', versionCode: 114801,
  releaseName: 'Smarty Finance v114801',
  apkUrl: 'https://github.com/owner/repo/releases/download/v114801/SmartLifePro.apk',
  sha256: sha
};
const response = (status, value) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => value,
  headers: { get: () => null }
});
function setup(handler, installed = 114701) {
  const elements = {};
  const element = id => ({
    id, style: {}, hidden: false, disabled: false, textContent: '',
    remove() { delete elements[this.id]; },
    insertAdjacentElement(_where, el) { elements[el.id] = el; }
  });
  elements['smarty-native-update-state'] = element('smarty-native-update-state');
  const downloads = [];
  const installations = [];
  const urls = [];
  const native = {
    getInstalledVersionCode: () => installed,
    downloadAndSave: (...args) => downloads.push(args),
    installSaved: (...args) => installations.push(args)
  };
  const win = {
    SmartyAppUpdateNative: native,
    SMARTY_RELEASE_CONFIG: { repository: 'owner/repo' }
  };
  const ctx = {
    window: win,
    document: {
      addEventListener() {},
      getElementById: id => elements[id] || null,
      createElement: () => element('new')
    },
    Data: { store: { settings: { lang: 'es' } } },
    fetch: async (url, options) => {
      urls.push(url);
      return handler(url, options);
    },
    Date, Number, String, Error, AbortController, setTimeout, clearTimeout
  };
  vm.runInNewContext(code, ctx, { filename: 'smarty-app-updater.js' });
  return { win, elements, downloads, installations, urls, text: () => elements['smarty-native-update-state'].textContent };
}

(async () => {
  // 1. Índice público válido: NO hace ninguna petición a la API de GitHub.
  const a = setup(url => {
    assert.match(url, /^https:\/\/raw\.githubusercontent\.com\/owner\/repo\/main\/smarty-latest\.json\?v=/);
    return response(200, manifest);
  });
  await a.win.SmartyAppUpdater.checkNow();
  assert.match(a.text(), /Nueva versión/);
  assert.equal(a.urls.length, 1);
  a.elements['smarty-update-download'].onclick();
  assert.deepEqual(a.downloads[0], [manifest.apkUrl, sha, '114801']);
  a.win.SmartyAppUpdater.nativeEvent('saved', 'Descargas/SmartLifePro/SmartLifePro_v114801.apk');
  assert.match(a.text(), /Instalar actualización/);
  assert.equal(a.installations.length, 1, 'opens native installer automatically after verified download');
  assert.equal(a.elements['smarty-update-download'].hidden, true);
  assert.equal(a.elements['smarty-update-install'].hidden, false, 'offers install retry');
  a.elements['smarty-update-install'].onclick();
  assert.equal(a.installations.length, 2, 'retry calls native installSaved');
  a.win.SmartyAppUpdater.nativeEvent('permission', 'needs permission');
  assert.match(a.text(), /Autoriza la instalación/);
  a.win.SmartyAppUpdater.nativeEvent('installer', 'launched');
  assert.match(a.text(), /Instalador de Android/);
  a.win.SmartyAppUpdater.nativeEvent('install-error', 'intent error');
  assert.match(a.text(), /No se pudo abrir el instalador/);

  // 2. Antes de que exista el índice, usar API como alternativa.
  const b = setup(url => url.includes('raw.githubusercontent.com')
    ? response(404, {}) : response(200, release));
  await b.win.SmartyAppUpdater.checkNow();
  assert.match(b.text(), /Nueva versión/);
  assert.equal(b.urls.length, 2);

  // 3. Misma versión (o superior) instalada => NO ofrecer actualización.
  const c = setup(() => response(200, manifest), 114801);
  await c.win.SmartyAppUpdater.checkNow();
  assert.match(c.text(), /más reciente/);
  assert.equal(c.elements['smarty-update-download'].hidden, true);

  // 4. Índice inválido: rechazarlo, consultar API y validar el hash de respaldo.
  const d = setup(url => url.includes('raw.githubusercontent.com')
    ? response(200, { ...manifest, sha256: 'INVALID' })
    : response(200, release));
  await d.win.SmartyAppUpdater.checkNow();
  assert.match(d.text(), /Nueva versión/);
  assert.equal(d.urls.length, 2);

  // 5. El fallback también debe verificar hash y URL, no confiar ciegamente.
  const invalid = setup(url => url.includes('raw.githubusercontent.com')
    ? response(200, { ...manifest, apkUrl: 'https://evil.example/file.apk' })
    : response(200, { ...release, assets: [{ ...release.assets[0], digest: '' }] }));
  await invalid.win.SmartyAppUpdater.checkNow();
  assert.match(invalid.text(), /SHA-256/);
  assert.equal(invalid.elements['smarty-update-download'].hidden, true);

  // 6. 403/429 deben informarse expresamente, nunca atribuirse a repo privado.
  for (const code of [403, 429, 500]) {
    const e = setup(() => response(code, { message: 'mock failure' }));
    await e.win.SmartyAppUpdater.checkNow();
    assert.match(e.text(), new RegExp('HTTP ' + code));
    assert.doesNotMatch(e.text(), /deben ser públicos/);
    assert.equal(e.elements['smarty-update-download'].hidden, true);
  }

  // 7. Una falla de red no se confunde con privacidad del repositorio.
  const network = setup(() => { throw new TypeError('Failed to fetch'); });
  await network.win.SmartyAppUpdater.checkNow();
  assert.match(network.text(), /conexión o acceso de red fallido/);
  assert.doesNotMatch(network.text(), /deben ser públicos/);

  // 8. Contrato del workflow: eventos encadenados y índice versionado.
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /Build Smarty Android APK/);
  assert.match(workflow, /smarty-latest\.json/);
  assert.match(workflow, /contents: write/);
  assert.match(workflow, /releases\/latest/);
  assert.doesNotMatch(workflow, /assembleRelease|SMARTY_KEYSTORE|android\/app\/build/);

  // 9. Conservar MediaStore, validación criptográfica y apertura segura del instalador.
  const bridgePath = path.join(__dirname, 'tools/SmartyUpdateBridge.java.txt');
  if (fs.existsSync(bridgePath)) {
    const java = fs.readFileSync(bridgePath, 'utf8');
    assert.match(java, /MediaStore\.Downloads/);
    assert.match(java, /MessageDigest/);
    assert.match(java, /verify\(tmp,expected\)/);
    assert.match(java, /getPackageArchiveInfo/);
    assert.match(java, /canRequestPackageInstalls/);
    assert.match(java, /ACTION_MANAGE_UNKNOWN_APP_SOURCES/);
    assert.match(java, /FLAG_GRANT_READ_URI_PERMISSION/);
    assert.match(java, /Intent.ACTION_VIEW/);
    assert.match(java, /startActivity\(install\)/);
    assert.match(java, /installSaved\(/);
    assert.doesNotMatch(java, /downloadAndInstall/);
  }
  console.log('OK: índice público, SHA-256, firmas, MediaStore, instalador nativo seguro, permisos y reintento.');
})().catch(error => { console.error(error); process.exitCode = 1; });
