/* Configuración de firma estable y versionCode monotónico del APK para GitHub Actions. */
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
gradle=gradle.replace(/(\brelease\s*\{)/,'$1\n            signingConfig signingConfigs.smartyRelease');
if(!gradle.includes('signingConfig signingConfigs.smartyRelease'))throw new Error('No se pudo firmar la configuración release');
fs.writeFileSync(file,gradle);
console.log('Firma estable habilitada. VersionCode='+version);
