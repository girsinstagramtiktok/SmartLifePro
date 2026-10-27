# Smart Life Pro — Fecha exacta de pago y actualizaciones OTA

## 1. Fecha exacta de pago

En **Añadir gasto → ¿En qué mes se pagará? → El próximo mes**, aparece el campo **Fecha exacta del pago**, con selector de calendario.

- El calendario permite cualquier día válido del próximo mes (incluidos cambios de año y febrero).
- Guarda la fecha elegida en `expense.date` a las 12:00 de la zona local y `scheduled=true`. Se preserva `recordedAt` con la fecha real de registro.
- El gasto no se descuenta del mes actual. Una compra a plazos comienza en el mes de la fecha seleccionada.
- Al editar un gasto y escoger “Mantener el mes original”, se conserva su fecha sin sobrescribirla.
- No se migran ni modifican los gastos previos.

## 2. OTA real para HTML/CSS/JS (sin recompilar Android)

**Requiere instalar una vez una nueva APK** que incluya el complemento nativo `@capgo/capacitor-updater@lts-v6`. Los APK anteriores no pueden adquirir ese complemento únicamente desde JavaScript.

### Primera instalación

1. Haz una copia de seguridad desde Smarty antes de cambiar el APK. Las compilaciones de depuración de GitHub Actions pueden utilizar firmas diferentes y requerir desinstalar la app anterior.
2. Sube los archivos de este paquete a tu repositorio GitHub **público**, conservando sus rutas.
3. En GitHub → **Actions** → **Build Smarty Android APK** → **Run workflow**, genera el **último APK que necesitas compilar para cambios web** y procede a instalarlo.
4. En GitHub → **Actions** → **Publicar Smarty OTA (sin compilar APK)**, comprueba que haya una ejecución con éxito. Esta acción publica una GitHub Release que contiene `smarty-web.zip`.
5. Si Android pide reinstalar por firma incompatible, **no desinstales sin antes exportar y guardar tus datos**.

### Actualizaciones posteriores

1. Edita `finance.js`, `ui.js`, `index.html`, `shopping.js`, `style.css`, etc. directamente en la rama principal de GitHub.
2. Se ejecutará **Publicar Smarty OTA (sin compilar APK)**. No se ejecuta la compilación de Android de forma automática.
3. Cuando la acción termine y la Release nueva aparezca, entra en Smarty → **Ajustes → Buscar Actualización Ahora**.
4. La app comprueba `https://api.github.com/repos/PROPIETARIO/REPO/releases/latest`, descarga el ZIP `smarty-web.zip` de esa release, lo aplica mediante el plugin y reinicia la interfaz. Los datos locales se conservan en el mismo origen web.
5. Si ya tienes esa versión, se mostrará que Smarty está actualizado.

No es necesario crear una cuenta Capgo ni contratar un servicio. Se utilizan las GitHub Releases **públicas** para entregar el ZIP. Un repositorio privado necesita autenticación y **esta implementación no incluye tokens** en el APK por seguridad.

### Cuándo sí hace falta un nuevo APK

Los cambios a permisos de Android, plugins nativos, Java, AndroidManifest, Gradle, package IDs o integraciones de SO requieren ejecutar de nuevo **Build Smarty Android APK** y reinstalar la actualización firmada con la misma clave. OTA solo actualiza la capa web.

### Controles de seguridad y recuperación

- No se utiliza `server.url` para mover la WebView a otro origen: los datos guardados con `localStorage` no cambian de origen.
- Se valida el dominio GitHub, ruta del repositorio y etiqueta de release antes de descargar.
- Se llama a `notifyAppReady()` para que el complemento pueda recuperar un paquete anterior si el nuevo no inicia correctamente.
- El repositorio debe permitir que GitHub Actions publique releases (`GITHUB_TOKEN`, permiso `contents: write`).
- Si Actions muestra `Resource not accessible by integration`, revisa **Settings → Actions → General → Workflow permissions** y permite permisos de escritura si tu repositorio/políticas lo autorizan.

## Archivos de esta actualización

### Modificados
- `finance.js`: lectura de fecha exacta y validación.
- `ui.js`: cadenas ES/PT/EN.
- `index.html`: input de calendario, scripts OTA.
- `service-worker.js`: caché web.
- `smarty-ota.js`: delegación al nuevo actualizador.
- `.github/workflows/android-apk.yml`: incorpora plugin OTA, habilita compilación manual, inyecta la configuración GitHub.
- `smarty-tests.cjs`: pruebas de fechas exactas.

### Nuevos
- `ota-client.js`: actualizador nativo manual y validación de releases.
- `ota-config.js`: configuración base de la PWA; sustituida al compilar.
- `tools/build-ota-bundle.cjs`: genera el mismo `www/` que el APK, incluidos complementos dinámicos.
- `.github/workflows/ota-web.yml`: publica ZIP de código web tras cada cambio.
- `ota-tests.cjs`: pruebas del actualizador.
- `LEEME_FECHA_Y_ACTUALIZACIONES.md`: este documento.

## Pruebas efectuadas

Ejecutadas con Node.js: lógica de pagos, cuotas, filtrado de notificaciones y lógica simulada de consulta/aplicación OTA. Se generó la carpeta web y se comprobó la sintaxis del JavaScript inyectado. **No se compiló el plugin nativo ni se instaló en un Android real**; la primera compilación y la prueba funcional en el teléfono son todavía necesarias.
