# SmartLifePro -> Smarty Finance (cambio seguro de nombre e icono)

Este ZIP contiene SOLO los archivos nuevos/modificados. Sustituir respetando las rutas del repositorio:

- `.github/workflows/android-apk.yml` — nombre nativo Android: Smarty Finance, sincroniza `app_name`, conserva exactamente `appId: com.smartlife.pro`, mismo workflow de firma y versionCode creciente.
- `index.html` — título y encabezado en pantalla principal. Basado en el último ZIP unificado de Gastos fijos, logos y notificaciones.
- `manifest.json` — nombre de PWA, con el MISMO `id` anterior.
- `logo.png` — icono 2A elegido (el mismo ZIP de icono anterior).

## Actualizar sin perder datos

1. Desde SmartLifePro, guardar una copia de seguridad JSON.
2. En GitHub, comparar el workflow si has hecho cambios después del paquete unificado; sustituir los archivos indicados.
3. Ejecutar `Actions -> Build Smarty Android APK`. Se genera `SmartLifePro.apk` **con el nombre antiguo del archivo intencionadamente**, porque el actualizador lo busca por ese nombre. **Dentro de Android la aplicación se llamará `Smarty Finance`.**
4. Instalar el APK **encima de la aplicación actual**, sin desinstalar.

No modificar el identificador `com.smartlife.pro`, ni los cuatro secretos de firma en GitHub (`SMARTY_KEYSTORE_BASE64`, `SMARTY_KEYSTORE_PASSWORD`, `SMARTY_KEY_ALIAS`, `SMARTY_KEY_PASSWORD`). El cambio de nombre y de icono no requieren reinstalación. La actualización necesita `versionCode` mayor y firma idéntica; el workflow ya conserva ese mecanismo.

Si Android dice **«No se instaló la aplicación porque el paquete entra en conflicto»** o «firma no coincide», no desinstales: hay que revisar que se compiló con el certificado permanente correcto.

La compilación Android firmada no puede ejecutarse en este entorno sin la clave privada guardada en GitHub; se verificaron estáticamente el workflow, sus identificadores, la estructura YAML y los archivos del ZIP.
