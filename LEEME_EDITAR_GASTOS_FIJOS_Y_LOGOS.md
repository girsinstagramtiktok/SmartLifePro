# SmartLifePro — Gastos fijos editables + logos locales (parche incremental)

## Problema identificado

El APK no utiliza exactamente el renderizador de `finance.js`: el workflow `.github/workflows/android-apk.yml` introduce otra implementación de `Finance.renderSubscriptions()` al cargar la app. La integración anterior confiaba en enganchar el renderizador previo, por lo que los controles **Editar** y **Se cobra desde** podían desaparecer. Además, ese renderizador ignoraba el catálogo nuevo y trataba Gemini como un icono genérico.

## Qué corrige

- En **Finanzas → Gastos fijos**, cada registro existente muestra **Editar** y **Se cobra desde**.
- En **Editar** se cambian nombre, importe, día de cobro, cuenta/tarjeta de origen y logo (automático o manual).
- Cuando escribas `Gemini`, `Google Gemini` o `Gemini Advanced`, el icono se reconoce automáticamente. También reconoce ChatGPT, Prime Video, Netflix, Spotify, YouTube, Disney+ y otros servicios.
- El APK prepara recursos locales en `assets/brands/` al compilar. Intenta obtener iconos SVG del catálogo Simple Icons y, si no están disponibles, favicons; en última instancia genera un distintivo legible. **Aunque no haya internet, los iconos no quedan vacíos**. Los iconos se empaquetan al compilar: no hace falta añadir archivos a mano.
- No se modifica el motor de presupuesto, la lógica de cobros programados, la firma, huella, notificaciones ni respaldos.

## Instalación (importante)

1. Haz una copia de seguridad desde la app.
2. Copia **todos** los archivos del ZIP a tu repositorio, respetando las rutas. En particular, **es imprescindible** reemplazar `.github/workflows/android-apk.yml` y añadir `tools/prepare-brand-icons.cjs`.
3. En GitHub, ejecuta manualmente `Actions → Build Smarty Android APK` y confirma que aparece la etapa **Prepared 25 bundled brand icons** en el log. Las descargas de logotipos pueden depender de la disponibilidad de la fuente durante la compilación; hay reserva local.
4. Instala el nuevo APK encima del actual (sin desinstalar).
5. Entra en **Finanzas → Gastos fijos**. Cada línea debe mostrar el selector **Se cobra desde** y el botón **Editar**. Selecciona `Gemini Advanced → Editar` para verificar el selector **Logo de la suscripción**.

## Verificaciones realizadas antes de entregar

- Generación y sintaxis de `smarty-pro-addons.js` con el workflow actualizado.
- Prueba de interfaz con el renderizador exacto del addon de APK: botones visibles, Gemini/ChatGPT detectados, edición de importe y selección de icono persistida.
- Pruebas de `smarty-money`, `smarty-wallet`, `smarty-investment`, `smarty-fixed-billing`, `notification`, `bank-recovery`, `daily-spending`, `biometric`, `backup`, `updater` y `ota-integration`.

**Pendiente de validar:** instalación final y aspecto en tu Samsung. El entorno no tiene acceso a los CDN durante la prueba local, por lo que los logos oficiales se intentarán recuperar en GitHub Actions; hay distintivo local si el proveedor no responde.
