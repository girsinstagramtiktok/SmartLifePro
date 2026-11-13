# SmartLifePro — actualización unificada (13 de noviembre de 2026)

Este ZIP reúne **íntegra la corrección anterior** de Gastos fijos (edición de suscripciones + logos de Gemini/ChatGPT y otros) y el nuevo reconocimiento de **banco, cuenta de débito o tarjeta de crédito** a partir de notificaciones bancarias.

**NO es el proyecto completo**. Incluye únicamente los archivos necesarios de estos dos cambios. Súbelos a la RAÍZ de tu repositorio GitHub conservando exactamente sus rutas.

## Pasos

1. En SmartLifePro, crea una copia de seguridad de tus datos antes de cambiar el APK.
2. Extrae el ZIP. Sustituye los archivos existentes con los mismos nombres y añade los nuevos, incluyendo los de `tools/` y `.github/workflows/`.
3. Comprueba en GitHub que existen exactamente `smarty-bank-source.js`, `bank-bridge.js`, `smarty-money-ui.js`, `smarty-fixed-billing.js`, `smarty-brand-assets.js`, `tools/prepare-brand-icons.cjs` y el workflow actualizado.
4. Ejecuta `Actions > Build Smarty Android APK`.
5. Descarga el APK generado e instálalo **encima** de tu versión actual, sin desinstalar, desde Mis archivos.
6. Abre Finanzas > Gastos fijos para comprobar `Editar`, `Se cobra desde` y el selector de logo. Si usas Gemini, comprueba que está seleccionado `Google Gemini`.
7. En Ajustes, confirma que el lector de notificaciones bancarias esté habilitado, con acceso de Android y las aplicaciones de los bancos seleccionadas.

## Qué cambia

### Gastos fijos y logos (todos los archivos de la corrección anterior)

- Se conserva el botón **Editar** para cada gasto fijo, y `Se cobra desde` en la misma sección.
- Se conserva el selector de logo (Gemini, ChatGPT, Prime Video y otros). El workflow descarga e incluye logos vectoriales cuando el proveedor permite la descarga; hay identificadores locales de respaldo.
- Un gasto fijo con origen asignado se descuenta del saldo de cuenta o del límite de tarjeta el **día programado**, y solo una vez por mes. La reserva del presupuesto que ya sucede al inicio del mes no se vuelve a contabilizar.

### Detección de banco, crédito y débito

- El motor `smarty-bank-source.js` trabaja **en el dispositivo**, sin IA ni envío de datos bancarios a servicios externos. Usa el paquete Android de la app que envió la notificación, señales de crédito/débito/Pix y, cuando existe, la terminación de cuatro dígitos.
- Distingue, entre otros, Nubank, Mercado Pago, Banco do Brasil, Inter, Itaú, Bradesco, Santander, Caixa, PicPay y C6 Bank, cuando la app y el texto del aviso permiten identificarla.
- **Modo “Confirmar antes”:** selecciona anticipadamente la cuenta/tarjeta en el formulario. Puedes cambiarla manualmente. Si no es segura la coincidencia, deja el campo vacío y te pide elegir.
- **Modo “Guardar solo”:** cuando hay coincidencia segura, registra un solo gasto y ajusta automáticamente el saldo de débito o el límite de crédito de la cuenta correspondiente. Si no es posible identificar el origen, registra el gasto en el presupuesto SIN modificar ningún saldo bancario local por suposiciones.
- Puedes guardar opcionalmente los **últimos cuatro dígitos** de cada producto desde Editar cuenta o Editar tarjeta; no se requiere el número completo ni credenciales. Esto ayuda a distinguir crédito y débito del mismo banco cuando el texto del aviso es genérico.
- El mismo aviso repetido mantiene la protección previa contra duplicados. Una notificación que coincide de forma estricta con un gasto fijo ya programado (mismo servicio, día, importe y producto) confirma ese cargo y evita un segundo descuento. Los avisos de pago de factura se ignoran como compras nuevas.

## Límites importantes

- Algunos bancos notifican solamente “Compra aprobada”. Si existen varias fuentes posibles del mismo banco y el aviso no incluye tipo ni terminación identificable, **no se puede saber con certeza** cuál fue utilizada. En ese caso no se inventa una asignación.
- Las notificaciones de distintos bancos cambian con la versión de sus aplicaciones. Si tu banco envía una frase nueva, es posible que no sea reconocida hasta ajustar los patrones. Revisa las primeras operaciones reales después de instalar.
- El lector se limita a las aplicaciones de notificaciones autorizadas en los ajustes. No consulta el banco, no verifica los saldos reales ni realiza pagos.
- La nueva función no reconcilia automáticamente movimientos preexistentes: solo se aplica a nuevas notificaciones procesadas.
- Los campos de terminación (4 dígitos) se guardan dentro de los datos locales/respaldos de la app; no se transmite el número completo.
- Los iconos empaquetados dependen de la disponibilidad y licencia del proveedor de iconos al compilar. Si alguno no se descarga, queda el identificador de marca legible sin red.

## Archivos de esta entrega

- `.github/workflows/android-apk.yml` — copia el nuevo detector, ejecuta tests y prepara logos.
- `tools/prepare-brand-icons.cjs` — generador de logos locales de la corrección anterior.
- `smarty-fixed-billing.js`, `smarty-brand-assets.js`, `smarty-money.css`, `smarty-fixed-billing-tests.cjs` — corrección anterior completa.
- `smarty-bank-source.js` — detector local de banco + crédito/débito.
- `bank-bridge.js` — integra resultados con el lector existente y sus protecciones.
- `smarty-money-ui.js` — propone origen en confirmación y permite registrar opcionalmente los últimos cuatro dígitos.
- `index.html` — carga el nuevo detector antes del lector.
- `service-worker.js` — versión nueva de caché para la versión web (el APK usa archivos locales).
- `smarty-bank-source-tests.cjs` — pruebas de notificaciones y asignación.
- `ota-integration-tests.cjs` — verifica que el APK incluya el nuevo archivo.
- `LEEME_EDITAR_GASTOS_FIJOS_Y_LOGOS.md` — instrucciones originales del parche anterior.
- `LEEME_UNIFICADO_GASTOS_FIJOS_LOGOS_NOTIFICACIONES.md` — este documento.

## Validación ejecutada

En el entorno de desarrollo pasaron las pruebas existentes de finanzas, lector, reconciliación, huella, copia de seguridad, actualización y empaquetado, además de las pruebas nuevas de crédito, débito, ambigüedad y duplicados. Se verificó el `index.html` generado por la fase de inyección del workflow. **Esto NO sustituye una prueba del APK instalado en un Samsung**.
