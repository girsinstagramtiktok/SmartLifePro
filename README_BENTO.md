# SmartLifePro — edición Bento (10 de noviembre de 2026)

## Qué cambió

Se incorporó directamente en el proyecto el diseño de la referencia aprobada: **“Tu mes, de un vistazo”**. Su distribución es: encabezado y Smarty, cuatro tarjetas financieras en una cuadrícula 2×2, presupuesto total en una fila, gráfico del gasto y cuatro categorías en píldoras, con barra inferior verde oscura y botón «+» lima. No se sustituyó por el antiguo resumen financiero ni se modificaron el resto de las pantallas.

- `index.html`: estructura Bento de la pantalla **Inicio**.
- `bento-home.css`: tamaños, distribución, colores y animaciones cortas (transform/opacity), sin loops ni desenfoques costosos. Incluye adaptación a pantallas compactas y `prefers-reduced-motion`.
- `bento-home.js`: métricas, gráfico, categorías, traducciones ES/PT/EN y personalización de colores en **Ajustes**. Presets: menta de la imagen, gris/azul, violeta y oscuro; permite editar 15 colores individuales. Se guardan en `Data.store.settings.bentoPalette`, dentro del respaldo ya existente.
- Se reutilizan los **iconos originales** de navegación, categorías y la mascota de la aplicación; no se sustituyeron por iconos nuevos.
- `finance.js`: las cuotas/gastos fijos del mes ya se descuentan desde el primer día en el gasto mensual, incluso antes del vencimiento, como solicitó la usuaria.
- `main.js`: navegación sin retraso artificial para evitar que asome la interfaz anterior al abrir.
- `smarty-ota.js`: se mantienen las funciones de análisis, promedio, topes por categoría y notificaciones del parche funcional, pero sin superponer los diseños anteriores.
- `.github/workflows/android-apk.yml`: empaqueta `bento-home.*` como parte del APK, sin esperar el parche visual remoto al arrancar. Se activan compilaciones por cambios de código base.

## Generar el nuevo APK (GitHub Actions)

1. Guarda una **copia de seguridad de los datos de la app anterior** desde SmartLifePro. Conservar además el archivo fuera del teléfono.
2. Extrae este ZIP y sube todos los archivos, incluida la carpeta `.github`, a la rama `main` de tu repositorio.
3. En GitHub, entra en **Actions** → **Build Smarty Android APK** → **Run workflow** (o revisa la ejecución iniciada al subir los archivos).
4. Una vez que termine sin errores, abre el resultado del workflow y descarga el artefacto que contiene `app-debug.apk`.
5. Intenta instalarlo sobre la versión existente. **La firma del APK de depuración puede variar entre compilaciones**; si Android rechaza la actualización, tendrás que desinstalar la versión anterior e instalar la nueva. Esto puede borrar los datos locales: por eso es imprescindible el respaldo previo. Restaura la copia desde la app después.

Este ZIP contiene **el código fuente**, no un APK compilado. No se ha ejecutado una compilación Android ni una instalación en un dispositivo físico en este entorno.

## OTA y datos

El parche visual antiguo hospedado en Vercel **no es compatible** con la nueva interfaz y queda deshabilitado como descarga automática. El botón de actualización ligera comprueba la edición Bento y no aplica ese parche viejo. Para actualizar el diseño base, hay que generar un nuevo APK o publicar en el futuro una OTA compatible con Bento.

El formato de gastos, listas, configuraciones, cuentas y copia de seguridad original se conserva. El diseño no borra ni migra datos. La nueva paleta se añade como una propiedad opcional de configuración.

## Comprobaciones efectuadas

- JavaScript validado con Node; pasan `quick-ota-tests.cjs`, `ota-integration-tests.cjs`, `smarty-tests.cjs`, `notification-tests.cjs` y `ota-tests.cjs`.
- Generación de `www/` con el mismo inyector usado por el workflow (`tools/build-ota-bundle.cjs`).
- Renderizado del HTML y JavaScript de producción en Chromium con datos de ejemplo: sin errores JS, sin scroll en Inicio a 360 × 780 px; totales y categorías correctos; personalización persistente.
- La vista previa es una simulación de navegador con datos ficticios de prueba, **no una captura de un APK instalado en Android**.

## Nota de mantenimiento

No reintroduzcas los parches visuales anteriores en `smarty-ota.js` o Vercel: sobrescribirían los nuevos estilos. Si en el futuro deseas una OTA ligera del diseño, publicar únicamente un parche validado para `SMARTY_BENTO_NATIVE_BASE`.
