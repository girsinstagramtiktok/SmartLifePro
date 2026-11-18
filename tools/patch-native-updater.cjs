/* Añade descarga verificada a Descargas/SmartLifePro y apertura del instalador.
   Android solicita consentimiento y permiso de origen desconocido si hace falta. */
'use strict';
const fs=require('node:fs');const path=require('node:path');
const root='android/app/src/main';
const javaFile=path.join(root,'java/com/smartlife/pro/MainActivity.java');
const destFile=path.join(root,'java/com/smartlife/pro/SmartyUpdateBridge.java');
if(!fs.existsSync(javaFile))throw new Error('Falta MainActivity.java; ejecutar setup_java primero');
let main=fs.readFileSync(javaFile,'utf8');
const marker='    getBridge().getWebView().addJavascriptInterface(new SmartyUpdateBridge(this), "SmartyAppUpdateNative");';
if(!main.includes(marker)){
 const needle='    getBridge().getWebView().addJavascriptInterface(new SmartyJSBridge(), "SmartyAndroid");';
 if(!main.includes(needle))throw new Error('Puente SmartyAndroid no encontrado');
 main=main.replace(needle,needle+'\n'+marker);fs.writeFileSync(javaFile,main);
}
fs.copyFileSync(path.join(__dirname,'SmartyUpdateBridge.java.txt'),destFile);
console.log('Descargador firmado e instalador Android integrados (MediaStore.Downloads, firma y SHA-256)');
