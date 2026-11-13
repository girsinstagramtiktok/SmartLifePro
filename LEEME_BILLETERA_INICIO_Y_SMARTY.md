# SmartLifePro — Mis tarjetas en Inicio y contexto de Smarty

## Qué cambia
- La antigua tarjeta de gráfico **Así va tu gasto** en Inicio se sustituye por un acceso rápido desplazable a cuentas y tarjetas de crédito. **No muestra saldos ni límites en Inicio.**
- Al tocar una tarjeta se abre Finanzas > Cuentas y su detalle con saldo local (cuenta), límite/deuda (crédito), vencimiento/corte y hasta 12 movimientos locales.
- En Finanzas > Cuentas las cuentas y tarjetas comparten estilo visual tipo tarjeta bancaria, con colores reconocibles de la entidad, nombre y control de acceso al detalle.
- Nubank, Banco do Brasil y otros bancos conocidos se identifican por el nombre guardado *o* por su dominio. El logotipo se solicita mediante el favicon del banco cuando hay conexión y se usa una marca tipográfica como respaldo cuando no está disponible. No se modifican datos anteriores.
- Smarty obtiene un resumen de las cuentas/tarjetas/ahorros/ingresos registrados localmente cuando la pregunta trata sobre esos asuntos; distingue saldos declarados de datos bancarios en tiempo real. El chat actual envía el contexto solicitado al proveedor Groq, como ya ocurría con el historial de gastos.
- Se conserva el historial con su gráfico original en Finanzas; solo se retira el gráfico de **Inicio**.

## Archivos incluidos
- index.html (reemplaza la sección gráfica, carga el nuevo módulo)
- smarty-wallet.js y smarty-wallet.css (nuevos: lógica de interfaz aislada)
- smarty-wallet-tests.cjs (nuevo: pruebas)
- smarty-money-ui.js (utiliza tarjetas visuales en Finanzas, sin alterar el motor de importes)
- assistant.js (añade contexto del módulo nuevo al prompt de Smarty cuando corresponda)
- bento-home.js (renombra etiqueta del ajuste de color del antiguo gráfico)
- .github/workflows/android-apk.yml (incluye los dos módulos y sus pruebas en el APK)

## Instalación
1. Respaldar los datos desde SmartLifePro.
2. Descomprimir este ZIP e incorporar **solo** los archivos que contiene, respetando la estructura de carpetas.
3. Si hiciste cambios manuales en index.html, assistant.js o smarty-money-ui.js después de la versión Bento anterior, revisar diferencias antes de sustituir esos archivos.
4. Actions > Build Smarty Android APK > Run workflow.
5. Descargar el APK nuevo desde la carpeta Download/SmartLifePro creada por la aplicación, abrirlo en Mis archivos e instalarlo encima.

## Verificación recomendada
1. Crear una cuenta llamada «Nubank» con el selector de banco en blanco: debe verse morada y aparecer en Inicio.
2. Crear una tarjeta de crédito: aparece junto a las cuentas, sin mostrar el saldo en Inicio.
3. Tocar cada una y comprobar que abre su ficha real con movimientos y operaciones.
4. Preguntar a Smarty «¿cuánto tengo en Nubank y cuánto límite disponible tengo en mi tarjeta?»; comprobar que usa solo los datos locales declarados.
5. Confirmar que el historial financiero, la huella, las copias diarias y el acceso de notificaciones siguen funcionando.

**Alcance de las pruebas:** se validó la sintaxis, los cálculos del motor y las pruebas de integración y empaquetado web; el comportamiento en Android debe comprobarse tras compilar el APK. El navegador de pruebas del entorno no permitió abrir la app gráfica completa.
