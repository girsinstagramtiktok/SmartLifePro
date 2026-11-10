/* Add secure release APK installer to the generated Capacitor/Android project.
 * Invoked AFTER setup_java.js and patch-biometric-native.cjs.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root='android/app/src/main';
const javaFile=path.join(root,'java/com/smartlife/pro/MainActivity.java');
const bridgeFile=path.join(root,'java/com/smartlife/pro/SmartyUpdateBridge.java');
const manifestFile=path.join(root,'AndroidManifest.xml');
const pathsFile=path.join(root,'res/xml/smarty_update_paths.xml');
if(!fs.existsSync(javaFile))throw new Error('No existe MainActivity.java; ejecutar setup_java primero.');
let java=fs.readFileSync(javaFile,'utf8');
if(!java.includes('new SmartyUpdateBridge(this)')){
 const needle='    getBridge().getWebView().addJavascriptInterface(new SmartyJSBridge(), "SmartyAndroid");';
 if(!java.includes(needle))throw new Error('No se encontró el puente SmartyAndroid nativo');
 java=java.replace(needle,needle+'\n    getBridge().getWebView().addJavascriptInterface(new SmartyUpdateBridge(this), "SmartyAppUpdateNative");');
 fs.writeFileSync(javaFile,java);
}
fs.copyFileSync(path.join(__dirname,'SmartyUpdateBridge.java.txt'),bridgeFile);
fs.mkdirSync(path.dirname(pathsFile),{recursive:true});
fs.writeFileSync(pathsFile,'<?xml version="1.0" encoding="utf-8"?>\n<paths xmlns:android="http://schemas.android.com/apk/res/android"><cache-path name="smarty_updates" path="updates/" /></paths>\n');
let m=fs.readFileSync(manifestFile,'utf8');
if(!m.includes('android.permission.REQUEST_INSTALL_PACKAGES'))m=m.replace('<application','<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />\n    <application');
if(!m.includes('smartyupdates')){
 const provider='<provider android:name="androidx.core.content.FileProvider" android:authorities="${applicationId}.smartyupdates" android:exported="false" android:grantUriPermissions="true"><meta-data android:name="android.support.FILE_PROVIDER_PATHS" android:resource="@xml/smarty_update_paths" /></provider>';
 if(!m.includes('</application>'))throw new Error('AndroidManifest.xml no tiene </application>');
 m=m.replace('</application>',provider+'\n    </application>');
}
fs.writeFileSync(manifestFile,m);
console.log('Actualizador APK nativo añadido: FileProvider, permisos y JS bridge');
