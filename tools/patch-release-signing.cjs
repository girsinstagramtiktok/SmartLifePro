/* Configuración de firma estable, versionCode y orientación vertical del APK.
   Ejecutado por android-apk.yml después de preparar Android y antes de Gradle. */
'use strict';
const fs=require('node:fs');
const file='android/app/build.gradle';
const env=process.env;
for(const k of ['SMARTY_KEYSTORE_FILE','SMARTY_KEY_ALIAS','SMARTY_KEYSTORE_PASSWORD','SMARTY_KEY_PASSWORD','SMARTY_VERSION_CODE']){
 if(!env[k])throw new Error('Falta secreto/variable requerida: '+k);
}
const version=Number(env.SMARTY_VERSION_CODE);
if(!Number.isSafeInteger(version)||version<100001||version>2000000000)throw new Error('versionCode incorrecto');
let gradle=fs.readFileSync(file,'utf8');
if(!gradle.includes('defaultConfig {')||!gradle.includes('buildTypes {')||!gradle.includes('release {'))throw new Error('Gradle cambió; no se puede garantizar la firma');
gradle=gradle.replace(/\bversionCode\s+\d+/,`versionCode ${version}`)
             .replace(/\bversionName\s+["'][^"']+["']/,`versionName "2.0.${version}"`);
if(!gradle.includes(`versionCode ${version}`))throw new Error('No se pudo asignar versionCode');
if(!gradle.includes('signingConfigs {')){
 gradle=gradle.replace('    buildTypes {',String.raw`    signingConfigs {
        smartyRelease {
            storeFile file(System.getenv('SMARTY_KEYSTORE_FILE'))
            storePassword System.getenv('SMARTY_KEYSTORE_PASSWORD')
            keyAlias System.getenv('SMARTY_KEY_ALIAS')
            keyPassword System.getenv('SMARTY_KEY_PASSWORD')
        }
    }
    buildTypes {`);
}
if(!gradle.includes('signingConfig signingConfigs.smartyRelease'))
 gradle=gradle.replace(/(\brelease\s*\{)/,'$1\n            signingConfig signingConfigs.smartyRelease');
if(!gradle.includes('signingConfig signingConfigs.smartyRelease'))throw new Error('No se pudo firmar la configuración release');
fs.writeFileSync(file,gradle);

// El proyecto android/ se genera de nuevo en cada ejecución; por eso se
// bloquea la orientación aquí y no en un archivo AndroidManifest del repositorio.
const manifestPath='android/app/src/main/AndroidManifest.xml';
let manifest=fs.readFileSync(manifestPath,'utf8');
const activityTag=/<activity\b[^>]*\bandroid:name\s*=\s*["'](?:\.MainActivity|com\.smartlife\.pro\.MainActivity)["'][^>]*>/s;
const match=manifest.match(activityTag);
if(!match)throw new Error('No se encontró MainActivity en AndroidManifest.xml; no se puede bloquear la rotación');
let tag=match[0];
if(/\bandroid:screenOrientation\s*=/.test(tag)){
 tag=tag.replace(/\bandroid:screenOrientation\s*=\s*["'][^"']*["']/,'android:screenOrientation="portrait"');
} else {
 tag=tag.replace(/>$/,' android:screenOrientation="portrait">');
}
manifest=manifest.replace(match[0],tag);
fs.writeFileSync(manifestPath,manifest);
if(!/<activity\b[^>]*android:screenOrientation="portrait"[^>]*>/s.test(tag))throw new Error('No se aplicó la orientación vertical');
console.log('Firma estable, orientación vertical y versionCode='+version+' configurados.');
