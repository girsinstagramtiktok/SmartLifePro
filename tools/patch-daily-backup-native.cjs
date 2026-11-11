'use strict';
const fs=require('node:fs');const path=require('node:path');
const root='android/app/src/main/java/com/smartlife/pro';
const activity=path.join(root,'MainActivity.java');
let java=fs.readFileSync(activity,'utf8');
const marker='    getBridge().getWebView().addJavascriptInterface(new SmartyBackupBridge(this), "SmartyDailyBackupNative");';
if(!java.includes(marker)){
  const needle='    getBridge().getWebView().addJavascriptInterface(new SmartyJSBridge(), "SmartyAndroid");';
  if(!java.includes(needle))throw new Error('Cambió MainActivity.java: no se encontró SmartyAndroid');
  java=java.replace(needle,needle+'\n'+marker);
}
const callback='    if (req == SmartyBackupBridge.CHOOSE_FOLDER) new SmartyBackupBridge(this).onFolderResult(res, d);';
if(!java.includes(callback)){
  const needle='    super.onActivityResult(req, res, d);';
  if(!java.includes(needle))throw new Error('Cambió onActivityResult');
  java=java.replace(needle,needle+'\n'+callback);
}
fs.writeFileSync(activity,java);
for(const file of ['SmartyBackupBridge','SmartyBackupWorker'])fs.copyFileSync(path.join(__dirname,file+'.java.txt'),path.join(root,file+'.java'));
const gradle='android/app/build.gradle';let g=fs.readFileSync(gradle,'utf8');
for(const dep of ["implementation 'androidx.work:work-runtime:2.10.5'","implementation 'androidx.documentfile:documentfile:1.0.1'"]){
 if(!g.includes(dep)){if(!g.includes('dependencies {'))throw new Error('Gradle sin dependencies');g=g.replace('dependencies {','dependencies {\n    '+dep);}
}
fs.writeFileSync(gradle,g);
console.log('Copia diaria: SAF persistente + WorkManager + puente WebView incorporados.');
