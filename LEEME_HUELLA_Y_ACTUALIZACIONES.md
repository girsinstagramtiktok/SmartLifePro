# SmartLifePro — Huella V2 + actualizaciones dentro de la aplicación

Este **paquete incremental** incorpora la reparación de la huella V2 (que no había sido instalada) y una vía de distribución de APK estable. Está diseñado para aplicarse sobre el proyecto Bento + Huella + Rediseño, **conservando todos los archivos no incluidos en el ZIP**. No es una aplicación completa ni un APK.

## 1. Subir solo los archivos modificados

Descomprime el ZIP y copia cada archivo o carpeta en la **misma ruta** del repositorio de GitHub. Por ejemplo, `.github/workflows/android-apk.yml` debe sustituir el workflow existente; `tools/` no debe quedar dentro de una carpeta adicional. No borres las otras carpetas ni subas el ZIP sin extraerlo.

## 2. Configuración obligatoria de firma permanente (una sola vez)

A partir de esta versión **GitHub Actions ya no genera `app-debug.apk`**. Usará **siempre la misma clave privada de firma**, que debes conservar. Es necesario configurar **cuatro GitHub Actions Secrets**, sin compartirlos con nadie, ni subir el fichero `.jks` al repositorio.

### Crear una clave en Windows (con Java JDK instalado)

Abre PowerShell en una carpeta privada de tu computadora y ejecuta:

```powershell
keytool -genkeypair -keystore SmartyRelease.jks -alias smarty -keyalg RSA -keysize 3072 -validity 10000 -storetype PKCS12
```

El programa pedirá una contraseña; elige una contraseña fuerte y guárdala en un gestor de contraseñas. Si pide contraseña de la clave, usa la misma. **Guarda el archivo `SmartyRelease.jks` en al menos dos lugares seguros**; perderlo podría impedir futuras actualizaciones sin reinstalar y perder datos locales. Nunca compartas la clave privada, su Base64 ni sus contraseñas por chat.

Para copiar el contenido de la clave en Base64 al portapapeles desde PowerShell (ubicándote en la carpeta del archivo):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path '.\SmartyRelease.jks'))) | Set-Clipboard
```

En tu repositorio de GitHub abre **Settings → Secrets and variables → Actions → New repository secret** y crea exactamente estos cuatro secretos:

| Nombre | Valor |
|---|---|
| `SMARTY_KEYSTORE_BASE64` | Pega el Base64 copiado al portapapeles |
| `SMARTY_KEY_ALIAS` | `smarty` |
| `SMARTY_KEYSTORE_PASSWORD` | Contraseña elegida |
| `SMARTY_KEY_PASSWORD` | Contraseña de la clave (habitualmente la misma) |

La clave privada nunca se incluye en el ZIP o en la aplicación. Sin los cuatro secretos el workflow **fallará expresamente**, evitando APKs incompatibles.

**Comprobación de seguridad:** no guardes la cadena Base64 ni las contraseñas en archivos JS, YAML, Issues, commits o capturas.

## 3. Permisos y GitHub Releases

El repositorio que aloja las actualizaciones **debe ser público** para este cliente sin credenciales. Las versiones se consultan por la API pública de GitHub. Si el repositorio es privado, el sistema de actualización dentro del teléfono **no podrá descargar las versiones**. No insertes un token personal de GitHub en la aplicación; para repositorios privados haría falta otro servidor o un repositorio público de distribución separado.

En GitHub revisa **Settings → Actions → General → Workflow permissions** para que el flujo pueda escribir publicaciones (si la política del repositorio lo permite). El workflow tiene `contents: write` y publica un nuevo **GitHub Release** en cada ejecución exitosa de la rama `main`.

Ejecuta **Actions → Build Smarty Android APK → Run workflow** o sube los cambios a `main`. Al finalizar aparecerá una nueva publicación en **Releases** con:

- `SmartLifePro.apk` firmado permanentemente
- `SmartLifePro.sha256` con su comprobación de integridad

El `versionCode` se incrementa automáticamente en GitHub Actions. Mantén el mismo repositorio, nombre del workflow y clave de firma para evitar confusiones de versiones.

## 4. Primera instalación y siguientes actualizaciones

**Antes de empezar, exporta un respaldo de SmartLifePro y confirma que puedes acceder al archivo.** La versión ya instalada seguramente fue firmada como `debug` con una clave distinta, así que Android podría rechazar instalar la primera versión firmada encima. Si Android no la acepta, **será necesario desinstalar la versión antigua una sola vez**, después de guardar la copia, e instalar `SmartLifePro.apk` firmado. Luego restaura la copia dentro de la aplicación.

A partir de esa instalación, mientras conserves el mismo `applicationId` y keystore:

1. Modifica/sube archivos a GitHub; el workflow genera una publicación nueva con APK firmado.
2. Abre **SmartLifePro → Ajustes → Buscar actualizaciones del APK**.
3. Cuando haya una versión nueva, pulsa **Descargar e instalar**. El APK se descarga en el almacenamiento interno temporal de la propia app.
4. El cliente verifica **SHA-256**, **identificador del paquete**, **versión** y **certificado de firma** antes de solicitar instalación.
5. Android puede pedir autorizar «Instalar apps desconocidas» desde SmartLifePro. Autoriza la fuente y vuelve a la app para pulsar **Instalar APK descargado**.
6. Confirma la instalación en el instalador de Android. No es una instalación silenciosa.

No tendrás que navegar por GitHub ni descargar el APK manualmente para **las siguientes actualizaciones**. La instalación inicial es la excepción.

## 5. Huella (V2 incluida)

`smarty-biometrics.js`, `main.js`, `data.js` y `tools/patch-biometric-native.cjs` contienen la versión V2, que corrige:

- interruptor que quedaba bloqueado si Android no respondía;
- preferencia que reaparecía activada después de deshabilitarla;
- respuestas biométricas antiguas que podían alterar el estado;
- activación sin autenticación confirmada;
- diagnóstico de errores del puente y disponibilidad del lector.

Tras la instalación, en **Ajustes → Huella** prueba activarla y desactivarla. Si sigue fallando utiliza **Diagnóstico huella** y comparte el resultado (sin datos privados). El lector físico **no pudo probarse** en este entorno; el diagnóstico confirmará si la corrección nativa funciona en tu Samsung.

## 6. Revisión y límites

Pruebas locales realizadas: pruebas JS de huella, finanzas y notificaciones, manejo de versiones y SHA del actualizador, generación de las fuentes nativas y configuración Gradle, y simulación del HTML inyectado. **No se compiló un APK release real ni se instaló en un Android físico aquí**. Revisa la salida del workflow antes de instalar.

GitHub Releases no ofrece una instalación automática silenciosa. El paquete **no contiene** claves, contraseñas, certificados privados ni tokens de GitHub.
