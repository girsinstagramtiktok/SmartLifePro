/* Se ejecuta DESPUÉS de setup_java.js: añade soporte AndroidX biométrico.
   Falla explícitamente si cambia el generador, evitando publicar APK con huella rota. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const dir='android/app/src/main/java';
const locate=(base)=>{
  for(const entry of fs.readdirSync(base,{withFileTypes:true})){
    const p=path.join(base,entry.name);
    if(entry.isDirectory()){const file=locate(p);if(file)return file}
    else if(entry.name==='MainActivity.java')return p;
  }
  return null;
};
const activity=locate(dir);
if(!activity)throw new Error('No se encontró MainActivity.java para corregir huella');
let java=fs.readFileSync(activity,'utf8');
if(java.includes('public int getBiometricStatus()')){ console.log('AndroidX BiometricPrompt ya incorporado'); process.exit(0); }
const start=java.indexOf('    @JavascriptInterface public void authenticateBiometric() {');
const end=java.indexOf('  @Override protected void onActivityResult',start);
if(start<0||end<0)throw new Error('Cambió el código original de huella: revisar antes de compilar');
const replacement=String.raw`
    @JavascriptInterface public int getBiometricStatus() {
      try {
        return androidx.biometric.BiometricManager.from(MainActivity.this)
          .canAuthenticate(androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK);
      } catch(Exception error) { return -9; }
    }
    private void reportBiometric(String state) {
      try {
        getBridge().getWebView().post(() -> getBridge().getWebView().evaluateJavascript(
          "window.SmartyBiometrics && window.SmartyBiometrics.nativeResult(" + org.json.JSONObject.quote(state) + ");", null));
      } catch(Exception ignored) {}
    }
    @JavascriptInterface public void authenticateBiometric() {
      runOnUiThread(() -> {
        int ability=getBiometricStatus();
        if(ability!=androidx.biometric.BiometricManager.BIOMETRIC_SUCCESS) {
          reportBiometric("unavailable:"+ability);return;
        }
        try {
          androidx.biometric.BiometricPrompt prompt=new androidx.biometric.BiometricPrompt(
            MainActivity.this, androidx.core.content.ContextCompat.getMainExecutor(MainActivity.this),
            new androidx.biometric.BiometricPrompt.AuthenticationCallback() {
              @Override public void onAuthenticationSucceeded(androidx.biometric.BiometricPrompt.AuthenticationResult result) {
                reportBiometric("success");
              }
              @Override public void onAuthenticationError(int code, CharSequence message) {
                if(code==androidx.biometric.BiometricPrompt.ERROR_NEGATIVE_BUTTON ||
                   code==androidx.biometric.BiometricPrompt.ERROR_USER_CANCELED ||
                   code==androidx.biometric.BiometricPrompt.ERROR_CANCELED) reportBiometric("cancel");
                else reportBiometric("error:"+code);
              }
              @Override public void onAuthenticationFailed() { /* Permanecer bloqueado hasta autenticar. */ }
            });
          androidx.biometric.BiometricPrompt.PromptInfo info=new androidx.biometric.BiometricPrompt.PromptInfo.Builder()
            .setTitle("SmartLifePro")
            .setSubtitle("Huella o rostro para desbloquear")
            .setNegativeButtonText("Usar PIN")
            .setAllowedAuthenticators(androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK)
            .build();
          prompt.authenticate(info);
        } catch(Exception error) { reportBiometric("error:-9"); }
      });
    }
  }
`;
java=java.slice(0,start)+replacement+java.slice(end);
fs.writeFileSync(activity,java);
const gradle='android/app/build.gradle';
let code=fs.readFileSync(gradle,'utf8');
const dep="implementation 'androidx.biometric:biometric:1.1.0'";
if(!code.includes(dep)){
  if(!code.includes('dependencies {'))throw new Error('No se encontró dependencies en Gradle');
  code=code.replace('dependencies {',`dependencies {\n    ${dep}`);
}
fs.writeFileSync(gradle,code);
console.log('AndroidX BiometricPrompt añadido a MainActivity y Gradle');
