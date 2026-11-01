# Evolva Academy · GitHub Pages

Este paquete contiene el portal adaptado para GitHub Pages. La página de acceso será pública. Cada alumno necesita su correo y contraseña para consultar sus expedientes. Los datos académicos se consultan en Google Sheets mediante el backend incluido de Google Apps Script.

## Qué subir a GitHub

- La carpeta **docs** ya está compilada y lista para alojarse en GitHub Pages. Se publica desde la rama `main`, carpeta `/docs`.
- **apps-script/PortalPages.gs** se instala en Google Apps Script; no funciona por sí solo desde GitHub.
- **src**, `package.json`, `pnpm-lock.yaml` y `vite.config.mts` permiten volver a compilar el portal.
- La carpeta docs no contiene alumnos reales, contraseñas institucionales, tokens de sesión ni claves maestras. Incluye cuentas ficticias identificadas para probar el diseño cuando no hay una API configurada.

## 1. Preparar las hojas

Conserva tu archivo actual con ALUMNOS, EXAMENES, AVISOS, PAGOS y CONSTANCIAS. EVALUACIONES es opcional. Los folios siguen teniendo formato EVOLVA-######.

El programa no renumera alumnos ni vacía hojas. La preparación crea tres pestañas internas adicionales: `_PORTAL_SESIONES`, `_PORTAL_REPORTES` y `_PORTAL_LECTURAS`. No elimines ni compartas públicamente esas pestañas.

## 2. Instalar el backend

1. Entra a https://script.google.com y crea un **proyecto separado**. Conserva el código anterior para no interrumpir tu sitio existente.
2. Copia el contenido de `apps-script/PortalPages.gs` en el editor.
3. En Configuración del proyecto → Propiedades del script, agrega:
   - `SPREADSHEET_ID`: identificador del archivo de Google Sheets existente.
   - `PORTAL_PUBLIC_URL`: URL HTTPS de la carpeta del portal. Ejemplo: `https://TUUSUARIO.github.io/evolva-campus`. Debe incluir el nombre del repositorio si se publica como proyecto.
   - `PORTAL_ADMIN_EMAILS`: opcional, correos de administradores registrados en ALUMNOS separados por comas. Solo permite validar reportes ajenos; no habilita consultas anónimas.
4. Ejecuta `configurarPortalPages` una vez y autoriza el acceso a las hojas y a Drive que necesita el proyecto.
5. Implementar → Nueva implementación → Aplicación web. Ejecutar como: **tu cuenta**. Acceso: el ajuste que permita solicitudes externas del portal. En cuentas compatibles se muestra **Cualquier persona**. Aunque el endpoint reciba solicitudes externas, las operaciones de alumnos exigen una sesión válida.
6. Copia la URL que termina en `/exec`. Algunas organizaciones restringen las aplicaciones web externas; si ese ajuste no está disponible, requiere revisión del administrador de Google Workspace.

## 3. Configurar la web

Edita **docs/config.js** y coloca la URL /exec:

```js
window.EVOLVA_CONFIG = {
  API_URL: "https://script.google.com/macros/s/ID_DE_TU_IMPLEMENTACION/exec",
  DEMO_MODE: false
};
```

No coloques aquí SPREADSHEET_ID, contraseñas de alumnos, PORTAL_SECRET ni claves privadas. La URL /exec es configuración pública. Si luego recompilas, copia el mismo ajuste en `public/config.js`, ya que la compilación vuelve a crear docs.

Al añadir una URL /exec, las cuentas ficticias se desactivan automáticamente. El programa consulta el padrón real y no utiliza datos de ejemplo como respaldo si la conexión falla.

## 4. Activar GitHub Pages

1. Crea o abre el repositorio que usarás. Para GitHub Pages con GitHub Free normalmente se necesita un repositorio público. Algunos planes permiten repositorios privados; un repositorio privado no garantiza una web privada.
2. Sube el contenido descomprimido de este paquete conservando las carpetas. Si no necesitas modificar el código, basta con subir la carpeta **docs** completa.
3. En el repositorio: **Settings → Pages → Build and deployment → Source → Deploy from a branch**.
4. Selecciona **main** y **/docs**. Pulsa **Save**. Este paso publica la página de acceso.
5. Usa la URL que GitHub muestre en Pages. Verifica que coincida con `PORTAL_PUBLIC_URL`.
6. Prueba correo y contraseña de un alumno autorizado, su folio, calificaciones y la emisión de un reporte. El QR debe abrir `validar.html` bajo la misma carpeta.

El paquete usa rutas relativas y sirve tanto desde `usuario.github.io/repositorio/` como desde un dominio propio. No se incluye CNAME porque todavía no se ha elegido un dominio para este despliegue.

## Qué hace cada módulo

- **Acceso:** correo personal o institucional y CONTRASEÑA de ALUMNOS. La contraseña viaja por HTTPS en el cuerpo POST. No se envía por JSONP ni en URLs. La sesión dura hasta ocho horas, puede cerrarse y se almacena por su hash en las hojas internas.
- **Folio:** el alumno solo consulta el folio de su sesión. Enviar otro folio no cambia la identidad.
- **Progreso y promedio:** respeta AVANCE y PROMEDIO si están definidos, incluido cero. Puede calcularlos con los registros disponibles.
- **Calificaciones:** EVALUACIONES o M1–M4. Los valores faltantes se muestran como pendientes.
- **Exámenes reales:** abre enlaces HTTPS de las columnas URL, ENLACE o LINK de EXAMENES, si existen. La captura de respuestas y su calificación siguen en el sistema de evaluación que elijas. Los ejercicios incluidos en el entorno de prueba son ficticios y locales.
- **Avisos:** filtra por alumno y diplomado; guarda avisos leídos.
- **Pagos:** recibe PDF, PNG o JPEG de hasta 2 MB, verifica el tipo de contenido y registra el pago En revisión. No confirma transferencias ni ejecuta cobros. Los comprobantes se guardan en una carpeta privada de Drive y se descargan con una sesión autorizada.
- **Reporte académico de calificaciones:** crea un registro con copia de las notas a la fecha de emisión, fecha, código EVR y huella SHA-256. El navegador genera el PDF con el logo original, QR y firma tipográfica de Alexis Soto, Director General. La validación permite cotejar el registro autorizado; no es una firma digital avanzada ni una comprobación automática de cualquier PDF modificado.
- **Constancias:** requieren una autorización registrada en CONSTANCIAS. Descarga el PDF de ARCHIVO si es un archivo compatible de Drive; en su defecto genera un documento desde los datos autorizados.

Los registros y QR emitidos anteriormente en el portal privado de Sites siguen dependiendo de ese portal. Los reportes nuevos emitidos por esta versión apuntan a GitHub Pages. No se han migrado automáticamente registros históricos de Sites.

## Compilar y comprobar

Requiere Node 22.13 o posterior.

```sh
npm install
npm run check
npm test
npm run build
```

El archivo pnpm-lock.yaml permite instalar también con pnpm. El resultado está en docs. Las dependencias de PDF se cargan al descargar un documento.

## Estado de entrega

- Código y archivos estáticos preparados para GitHub Pages.
- Backend probado con datos ficticios en un simulador de Apps Script.
- Los recorridos locales se pueden revisar en el entorno de prueba.
- Pendientes: conexión real con tu cuenta de GitHub, repositorio de destino y despliegue/configuración del backend en tu Google Apps Script. No se ha publicado este paquete en GitHub ni se han modificado las hojas reales.
