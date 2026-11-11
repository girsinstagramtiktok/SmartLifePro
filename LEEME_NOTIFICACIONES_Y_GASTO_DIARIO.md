# SmartLifePro — Recuperación de notificaciones + gasto diario

Esta entrega es **incremental**. Sustituye solamente los archivos del ZIP, manteniendo sus rutas y sin borrar otros archivos del repositorio.

## Cambios incluidos

### Lectura de notificaciones (Android)
- Android distingue acceso concedido de servicio realmente conectado. Se comprueba el componente exacto, no una coincidencia parcial del identificador.
- El servicio solicita reconexión al desconectarse. Se instala una comprobación de salud de bajo consumo cada 15 minutos mediante WorkManager. Android puede retrasarla y no garantiza funcionamiento continuo si revoca permisos, restringe procesos o detiene forzosamente la app.
- Al volver a SmartLifePro se comprueba el estado y se solicita reconexión si corresponde; hay un límite para no repetir la solicitud a cada pocos segundos.
- Ajustes → Lectura de notificaciones muestra **Lector conectado / desconectado / acceso desactivado** y un botón **Reconectar lector**.
- Si Android revocó el acceso, el botón abre la configuración del sistema. Desactivar y reactivar allí el acceso puede restaurarlo sin reinstalar ni perder datos.
- La lista de apps autorizadas, el filtrado de cargos, los gastos guardados y la cola confirmada se mantienen sin cambios.

### Finanzas → Historial → Gasto por día
- Un gráfico de barras desplazable muestra cada día del mes, el importe registrado, el promedio por día con gastos y el detalle al tocar una fecha.
- Se actualiza al cambiar de mes o de categoría.
- **Gastado**: gastos no aplazados con fecha hasta hoy y listas de compras completadas. **Programado**: cuotas mensuales, suscripciones y gastos con fecha futura. Los programados se muestran separados porque no se puede asumir que se hayan cobrado.
- No se altera el cálculo del presupuesto ni la pantalla Bento de Inicio.
- Se conservan español, portugués e inglés y la personalización de temas.

## Instalación
1. Realiza una copia de seguridad desde la versión actual.
2. Descomprime este ZIP y sube su contenido a la **raíz del repositorio** GitHub (no a una subcarpeta adicional), respetando `.github/workflows` y `tools`.
3. GitHub → Actions → **Build Smarty Android APK** → Run workflow. Comprueba que el workflow termine en verde y que publique una versión en Releases.
4. Desde la app actual, busca la actualización y descarga el APK a `Download/SmartLifePro`. En **Mis archivos** toca el APK e instálalo encima de la app actual, sin desinstalar.
5. Abre **Ajustes** y comprueba el estado del lector. Prueba con una notificación bancaria REAL de una app previamente autorizada; los avisos promocionales o ingresos se descartan deliberadamente.
6. Abre **Finanzas → Historial** para explorar el gasto por día.

## Validación y límites
- JavaScript, cálculos del histórico, puentes de recuperación, proceso generador de Java y composición web fueron comprobados en el entorno de trabajo.
- **No se compiló un APK completo ni se probó físicamente un Samsung en este entorno**. El comportamiento del sistema Android requiere validación con el APK generado por GitHub Actions.
- No es posible garantizar que ningún fabricante o versión de Android suspenda jamás el servicio; el objetivo de este cambio es recuperarlo automáticamente en los casos recuperables y facilitar su restauración sin reinstalar.
