# SmartLifePro — Bento en toda la app y corrección de biometría

Edición del 10/11/2026. Incluye el diseño de Inicio aprobado anteriormente (sin cambiar su composición) y la misma identidad visual en las demás secciones.

## Cambios

- `bento-global.css`: aplica la paleta personalizable Bento en Finanzas, Actividad, historial, compras, listas, Ajustes, formularios y cuadros de diálogo. Mantiene los iconos, funcionalidades y datos originales. Emplea transiciones cortas de `transform` y `opacity` y respeta `prefers-reduced-motion`.
- `smarty-biometrics.js`: conecta ajustes, pantalla PIN y autenticación con el puente de Android. No guarda «huella activada» hasta que el sistema confirma el acceso; los errores o cancelaciones dejan disponible el PIN. El interruptor vuelve a habilitarse después de cada intento.
- `tools/patch-biometric-native.cjs`: después de generar el proyecto Android, reemplaza el flujo biométrico antiguo por AndroidX `BiometricPrompt`, comprueba biometría registrada y devuelve resultado a JavaScript. Añade la dependencia AndroidX al Gradle generado; falla si cambia la estructura del código nativo.
- `.github/workflows/android-apk.yml`: incluye los nuevos archivos y ejecuta pruebas de biometría antes de compilar.
- `biometric-tests.cjs`: pruebas de activación, cancelación, rechazo y desbloqueo desde el resultado nativo simulado.

## Cómo compilar

1. En la versión instalada, **exporta y guarda un respaldo de tus datos de SmartLifePro**.
2. Extrae este ZIP y sube su contenido al repositorio de GitHub, incluyendo `.github/workflows/`. Sustituye los archivos de la versión anterior (no subas una sola carpeta adicional ni el ZIP sin extraer).
3. En GitHub abre **Actions** > **Build Smarty Android APK** > **Run workflow**. Alternativamente, espera la compilación que se inicia con cambios en `main`.
4. Descarga el artefacto `SmartLifePro-Android-APK`, extráelo e instala `app-debug.apk`.
5. Conserva el mismo identificador y firma para actualizar encima. Los APK debug generados en distintas máquinas de GitHub pueden usar firmas diferentes; si Android exige desinstalar, asegúrate de tener respaldo porque los datos locales podrían eliminarse.
6. En el teléfono, configura un PIN de seis dígitos y registra una huella en los ajustes de Android. Después abre **SmartLifePro > Ajustes > Desbloqueo con huella / rostro**. Android debe mostrar el diálogo biométrico. Una autenticación exitosa activa el interruptor. Prueba cerrar y abrir la app, y comprueba también el PIN de respaldo.

## Pruebas efectuadas

- Validaciones automatizadas con Node: controles biométricos, finanzas, notificaciones y carga web.
- Generación del Java de la aplicación y sustitución del módulo biométrico en una simulación del workflow.
- Pruebas visuales en navegador móvil de las secciones Inicio, Finanzas, Actividad, historial, listas y Ajustes.

**Limitación importante:** no se compiló un APK Android real ni se probó un sensor de huellas físico en este entorno. Las pruebas del flujo nativo no sustituyen la verificación en tu Samsung.
