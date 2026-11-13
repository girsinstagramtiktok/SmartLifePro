# SmartLifePro — Origen de gastos fijos y logos con respaldo local

## Cambios

1. Se quitó «Origen de los gastos fijos» de la pestaña **Cuentas**.
2. En **Finanzas → Suscrip. / Gastos fijos**, cada gasto ya guardado incorpora «Se cobra desde» y **Editar**. Se conservan los orígenes que se hubieran configurado antes.
3. **Añadir gasto fijo** ahora permite seleccionar cuenta de débito o tarjeta de crédito, además de nombre, importe y día. La asignación es opcional hasta que se registren cuentas.
4. Cuando el gasto está reservado en el presupuesto mensual desde el día 1, ese presupuesto NO vuelve a descontarlo en la fecha del cargo. A partir de ese día, la app registra **un solo movimiento local mensual** en la cuenta o tarjeta elegida. Para tarjeta de crédito, aumenta el crédito utilizado y disminuye el límite disponible; para débito, disminuye el saldo de la cuenta.
5. El movimiento se aplica en la fecha indicada **cuando la aplicación se abre o vuelve al primer plano**. No ejecuta pagos reales, no consulta el banco y no cobra a tarjetas. Si se asigna un origen después del día de cargo, comienza el mes siguiente para no crear cargos retroactivos.
6. En la lista de suscripciones se reconocen varias marcas (ChatGPT, Gemini, Prime Video, Netflix, Spotify, YouTube, Disney+, etc.). Bancos y suscripciones tienen iconos locales de respaldo legibles cuando no hay conexión. Se intenta descargar y almacenar el logo real de Simple Icons en `localStorage` cuando el proveedor permite CORS. Si no permite descargarlo, la app conserva la identificación local de la marca; no puede garantizarse el logo gráfico exacto sin conectividad.

## Consideraciones

- Los saldos de cuentas y tarjetas son locales, no reales ni sincronizados con bancos.
- No se cambió el motor anterior que reserva los gastos fijos en el presupuesto. No se cambió la firma ni los servicios Android.
- Las notificaciones bancarias siguen teniendo su propia lógica de registro; una notificación sobre una suscripción podría crear un gasto adicional si el lector está configurado para registrar cualquier compra automáticamente. Revisar y corregir esos duplicados si aparecen; esta actualización no modifica la lectura bancaria ni clasifica silenciosamente sus notificaciones.
- La caché de iconos solo contiene imágenes de marcas, no información financiera ni contraseñas. A diferencia del service worker PWA, funciona dentro de la app Android cuando el origen de imágenes permite la descarga CORS.

## Instalar

1. Haz una copia de seguridad desde Ajustes.
2. Extrae este ZIP sobre la **versión más reciente** del repositorio, conservando rutas. Contiene **solo** los archivos añadidos o modificados.
3. Ejecuta `Actions → Build Smarty Android APK`.
4. Instala el APK encima de la app actual, sin desinstalar.
5. Comprueba un gasto fijo ya guardado: cambia el origen, cierra y vuelve a abrir. Confirma que el origen persiste. Comprueba que «Origen de los gastos fijos» ya no aparece en Cuentas.
6. Comprueba el comportamiento del cobro el día programado y los logos en modo avión.

## Pruebas ejecutadas

- `node smarty-fixed-billing-tests.cjs` (idempotencia de cobro, fecha de cargo, origen débito/crédito, iconos de respaldo, inclusión en workflow).
- `node smarty-money-tests.cjs`, `smarty-wallet-tests.cjs`, `smarty-investment-tests.cjs`, `backup-tests.cjs`.
- Prueba aislada en Chromium: editar y crear suscripciones, elegir origen, cambiar importe y fecha, conservar origen y comprobar imágenes de respaldo.

**No se probó esta actualización como APK instalado en Samsung.**
