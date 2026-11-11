# SmartLifePro — APK en Descargas y copia diaria en carpeta elegida

Este paquete **incremental** contiene únicamente los archivos nuevos o modificados respecto a la versión SmartLifePro Bento + Huella V3 + Instalador V4 + Ajustes actualizados. No incluye contraseñas, certificados ni `SmartyRelease.jks`.

## 1. Incorporarlo al repositorio
1. Extrae el ZIP en una carpeta vacía. Sube sus archivos a tu repositorio GitHub conservando sus rutas, incluido `.github/workflows/android-apk.yml`.
2. En GitHub: **Actions → Build Smarty Android APK → Run workflow**. Espera el resultado verde y comprueba que se publique un nuevo APK en **Releases**.
3. Esta primera vez **instala manualmente** el APK de Releases encima de tu versión actual, ya que se actualizó el código nativo. Usa la **misma clave de firma** `SmartyRelease.jks` y nunca desinstales sin antes guardar una copia de los datos.
4. Si GitHub Actions muestra un error, conserva el registro del paso de compilación; no borres los datos ni reinstales a ciegas.

## 2. Actualizaciones siguientes
1. Publica otra compilación (debe tener un `versionCode` superior).
2. Dentro de SmartLifePro: **Ajustes → Buscar actualizaciones del APK → Descargar APK a Descargas**.
3. La app comprueba HTTPS, SHA-256, el identificador, el número de versión y la firma instalada. Cuando termine mostrará la ubicación `Descargas/SmartLifePro/SmartLifePro_v<versión>.apk`.
4. Abre **Mis archivos → Almacenamiento interno → Download (o Descargas) → SmartLifePro** y toca el APK. Confirma la actualización normal de Android.
5. No se intenta abrir el instalador directamente desde la WebView. El nuevo método para guardar en Descargas funciona en Android 10 (API 29) y posterior.

## 3. Copia diaria en carpeta elegida
1. Ve a **Ajustes → Copias diarias con fecha → Elegir carpeta**.
2. En el selector de Android, escoge una subcarpeta, por ejemplo `Documentos/SmartLifeProBackups`. En Android 11+ no se puede elegir la carpeta raíz **Download** mediante el selector de carpetas.
3. Concede el permiso a la carpeta. La app lo conserva a través de reinicios del teléfono y actualizaciones del APK.
4. Pulsa **Guardar copia ahora** para realizar una primera prueba. Debe aparecer `SmartLifePro_YYYY-MM-DD.json` en la carpeta.
5. Activa/desactiva **Copia diaria automática** en Ajustes. Android programa un trabajo periódico de 24 horas con WorkManager, que también puede ejecutarse con la app cerrada; Android puede retrasarlo por ahorro de energía. Además, al volver a abrir la app se revisa si falta la copia del día.
6. El archivo del mismo día se actualiza si se vuelve a hacer una copia ese día. **Los archivos de días diferentes se conservan**; no se eliminan copias antiguas de forma automática.

## Privacidad y limitaciones
- Las copias son JSON **sin cifrar**, compatibles con la restauración de SmartLifePro. Pueden incluir PIN, claves API, gastos y otros datos personales. Evita carpetas compartidas o sincronizadas sin protección.
- No se garantiza que el trabajo periódico se ejecute exactamente a medianoche: Android controla los horarios. Conviene verificar la fecha de la última copia en Ajustes.
- La huella y las demás funciones no se modificaron en este paquete.
- Se comprobaron sintaxis JavaScript, lógica de actualización, pruebas existentes, inyección de archivos Java y composición del APK web. **La compilación real de Android y las pruebas en Samsung deben realizarse en GitHub Actions y en el teléfono**.
