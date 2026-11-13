# SmartLifePro — módulos separados (noviembre 2026)

Esta actualización **no reemplaza** los archivos `finance.js`, `shopping.js`, `data.js`, `main.js`, `bento-home.js`, ni el código de huella, notificaciones bancarias, OTA, descarga del APK o backups.

## Contenido del ZIP incremental

- `smarty-money-core.js`: movimientos propios, saldos, tarjetas, ingresos estimados y rendimientos simulados. Guarda en `Data.store.smartyMoney`, que ya forma parte del respaldo JSON existente.
- `smarty-money-ui.js`: pantallas **Finanzas → Cuentas** y **Finanzas → Ahorros**; añade el campo **Pagado desde** al registro manual y a la finalización de compras; asigna el origen de cada gasto fijo.
- `smarty-list-reminders.js`: pequeña campana en cada lista y su detalle, recordatorios locales de tarjetas y avisos estimados de ingresos retrasados mediante `@capacitor/local-notifications`.
- `smarty-settings-modern.js`: agrupa los controles actuales en subajustes plegables, sin borrar sus opciones; permite guardar, aplicar y eliminar paletas personalizadas.
- `smarty-money.css`: componentes Bento nuevos y ajustes más compactos.
- `smarty-money-tests.cjs`: pruebas de los cálculos y restricciones.
- `index.html`: **solo** referencias a los módulos nuevos.
- `.github/workflows/android-apk.yml`: **solo** inclusión de nuevos archivos y pruebas antes de compilar.
- `ota-integration-tests.cjs`: comprueba que los scripts nuevos se copien dentro de `www` en el APK.

## Instalación

1. Haz una copia de seguridad desde SmartLifePro.
2. Extrae el ZIP y sube los archivos exactamente a las rutas del repositorio, sustituyendo únicamente `index.html`, el workflow y `ota-integration-tests.cjs`; los otros archivos son nuevos.
3. Ejecuta **Actions → Build Smarty Android APK**.
4. Descarga el APK en SmartLifePro y ábrelo desde **Mis archivos → Download → SmartLifePro**, sin desinstalar la app.
5. Comprueba las nuevas pestañas **Cuentas** y **Ahorros**, las campanas en **Listas** y los subajustes plegables.

## Cómo funcionan las cifras (importante)

- **Cuentas:** saldo inicial + ingresos confirmados + transferencias recibidas − gastos asociados − transferencias salientes − pagos de tarjeta − aportes a ahorros. Se puede corregir manualmente el saldo si el banco registra movimientos no introducidos.
- **Tarjetas:** límite disponible = límite declarado − deuda inicial − compras asociadas + pagos de facturas registrados. Comprar con tarjeta NO disminuye la cuenta corriente; pagar la factura la disminuye y reduce la deuda. Las compras en cuotas reservan el valor íntegro del crédito.
- **Gastos fijos:** puedes elegir una cuenta o tarjeta de origen en **Cuentas**. Se registra **una sola vez al mes** en el saldo de origen cuando la app se abre y la fecha de cobro ya llegó. Si eliges un origen después del vencimiento del mes, empieza el mes siguiente. NO duplica el gasto mensual que ya reserva el motor de presupuesto.
- **Ingresos:** último día hábil, hasta el quinto día hábil, día aproximado o puntual. Las fechas excluyen fines de semana y principales feriados bancarios brasileños; admite excepciones locales adicionales. El ingreso **previsto** no incrementa el saldo; solo el confirmado.
- **Ahorros:** saldo base declarado y simulación de intereses **brutos** con tasa anual introducida o porcentaje del CDI con CDI anual de referencia introducido por ti. No es un saldo bancario en tiempo real y no incluye impuestos, IOF, costes, reglas específicas de cada producto ni aportaciones futuras no registradas.
- **Transferencias y aportes a ahorros:** NO incrementan la cifra de gastos del presupuesto. Los gastos importados o detectados por notificaciones sin origen conocido seguirán sin cuenta asignada hasta que se concilien manualmente; no se inventa una cuenta automáticamente.
- **Recordatorios:** fecha/hora en una lista; las facturas tienen recordatorios previos según sus días configurados. Android puede retrasar alarmas debido a batería, permisos o restricciones del fabricante; se solicita el permiso de notificaciones en el primer uso.
- **Logos de bancos:** se consulta el icono asociado al dominio del banco cuando hay conexión y se muestra una inicial si no está disponible. No se conectan cuentas ni se consultan movimientos bancarios.
- **Temas:** se guardan hasta 16 paletas personalizadas dentro del respaldo JSON. No se eliminan los temas existentes ni se cambia la distribución Bento de Inicio.

### Lo que se preserva

Huella, PIN, lector bancario, historial diario compacto, notificaciones previas, actualizador que guarda APK en Descargas, respaldo diario en carpeta elegida, español/portugués/inglés y todos los registros existentes.

### Comprobaciones necesarias en Android real

El código web y las pruebas automáticas pasaron, pero **NO se ha compilado ni probado el APK físico** en este entorno. Comprueba especialmente el permiso de recordatorios, la persistencia de colores, la transición de fechas y que la copia diaria incluya los nuevos datos.
