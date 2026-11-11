'use strict';
// Se ejecuta despues de setup_java.js y de patch-daily-backup-native.cjs.
// Fallar en CI si no se encuentran los puntos de insercion: nunca publicar APK sin reparacion.
const fs=require('node:fs');
const path=require('node:path');
const root='android/app/src/main/java/com/smartlife/pro';
const activity=path.join(root,'MainActivity.java');
const service=path.join(root,'SmartyNotificationService.java');
for(const file of [activity,service])if(!fs.existsSync(file))throw new Error('No existe '+file);
let java=fs.readFileSync(activity,'utf8');
function replaceOnce(content,old,replacement,label){
 if(!content.includes(old))throw new Error('No se encontró '+label+' en el Java generado');
 return content.replace(old,replacement);
}
if(!java.includes('SMARTY_BANK_LISTENER_RECOVERY_V1')){
 java=replaceOnce(java,
   '    @JavascriptInterface public boolean isNotificationListenerEnabled() { String f = Settings.Secure.getString(getContentResolver(), "enabled_notification_listeners"); return f != null && f.contains(getPackageName()); }',
   '    // SMARTY_BANK_LISTENER_RECOVERY_V1\n    @JavascriptInterface public boolean isNotificationListenerEnabled() { return SmartyBankHealthWorker.hasAccess(MainActivity.this); }',
   'comprobación exacta de permisos');
 java=replaceOnce(java,
   '    @JavascriptInterface public void requestBankListenerRebind() {\n      try { if(isNotificationListenerEnabled() && !SmartyNotificationService.connected && Build.VERSION.SDK_INT>=24)\n        android.service.notification.NotificationListenerService.requestRebind(new android.content.ComponentName(MainActivity.this, SmartyNotificationService.class));\n      } catch(Exception e) {}\n    }',
   '    @JavascriptInterface public void requestBankListenerRebind() { SmartyBankHealthWorker.requestReconnect(MainActivity.this,false); }\n'+
   '    @JavascriptInterface public String reconnectBankListener() { return SmartyBankHealthWorker.requestReconnect(MainActivity.this,true); }',
   'reconexión nativa');
 java=replaceOnce(java,'    new SmartyJSBridge().requestBankListenerRebind();\n    handleWidget(getIntent());',
   '    SmartyBankHealthWorker.schedule(this);\n    new SmartyJSBridge().requestBankListenerRebind();\n    handleWidget(getIntent());',
   'programador de salud');
 java=replaceOnce(java,
  '        obj.put("lastConnected",d.getLong("lastConnected",0)); obj.put("lastError",d.getString("lastError",""));',
  '        obj.put("lastConnected",d.getLong("lastConnected",0)); obj.put("lastDisconnected",d.getLong("lastDisconnected",0));\n'+
  '        obj.put("lastRebindAt",d.getLong("lastRebindAt",0)); obj.put("rebindCount",d.getInt("rebindCount",0));\n'+
  '        obj.put("lastError",d.getString("lastError",""));',
  'contadores de reconexión');
 fs.writeFileSync(activity,java);
}
let sv=fs.readFileSync(service,'utf8');
if(!sv.includes('SMARTY_BANK_AUTO_RECOVERY_V1')){
 sv=replaceOnce(sv,
  '    try { if (android.os.Build.VERSION.SDK_INT >= 24) NotificationListenerService.requestRebind(new android.content.ComponentName(this, SmartyNotificationService.class)); }\n    catch (Exception e) { getSharedPreferences("smarty_bank_diag",MODE_PRIVATE).edit().putString("lastError","REBIND: " + e.getClass().getSimpleName()).apply(); }',
  '    // SMARTY_BANK_AUTO_RECOVERY_V1\n'+
  '    SmartyBankHealthWorker.requestReconnect(getApplicationContext(), true);',
  'reconexión del servicio');
 sv=replaceOnce(sv,
  '    connected = false;\n    getSharedPreferences("smarty_bank_diag",MODE_PRIVATE).edit().putLong("lastDisconnected",System.currentTimeMillis()).apply();',
  '    connected = false;\n    android.content.SharedPreferences prefs=getSharedPreferences("smarty_bank_diag",MODE_PRIVATE);\n'+
  '    prefs.edit().putLong("lastDisconnected",System.currentTimeMillis()).putInt("disconnectCount",prefs.getInt("disconnectCount",0)+1).apply();',
  'registro de desconexión');
 sv=replaceOnce(sv,
  'connected = true; getSharedPreferences("smarty_bank_diag",MODE_PRIVATE).edit().putLong("lastConnected",System.currentTimeMillis()).apply();',
  'connected = true; getSharedPreferences("smarty_bank_diag",MODE_PRIVATE).edit().putLong("lastConnected",System.currentTimeMillis()).putString("lastError","").apply();',
  'registro de conexión');
 fs.writeFileSync(service,sv);
}
fs.copyFileSync(path.join(__dirname,'SmartyBankHealthWorker.java.txt'),path.join(root,'SmartyBankHealthWorker.java'));
console.log('Lector bancario: permisos exactos, reconexión limitada, diagnóstico y recuperación periódica.');
