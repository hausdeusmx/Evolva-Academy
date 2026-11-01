# Activar expedientes, credenciales y tareas · Evolva v5

El campus actual sigue conectado al servicio v4. La actualización de la web detecta las funciones nuevas: se habilitan únicamente cuando el servicio responde con versión 5 y las capacidades documents, credential y tasks. Los datos y contraseñas existentes se conservan.

## Actualización en un solo archivo

1. Abre la base de datos con la cuenta propietaria y entra en Extensiones > Apps Script. Conserva un respaldo privado de los archivos actuales.
2. Abre **EVOLVA-V5-COMPLETO.txt** de esta carpeta y copia todo su contenido. Reemplaza con él el contenido de **Código.gs**. Incluye el portal, registro, administración, expedientes y tareas.
3. Retira del proyecto de Apps Script los archivos separados **RegistroPages.gs** y **AdminPages.gs**, porque sus funciones ya están dentro de Código.gs. Si añadiste ExpedienteTareas.gs, retíralo también al usar la versión completa. Debe quedar una sola definición de cada función. Conserva appsscript.json y los ajustes del proyecto.
4. Guarda y ejecuta **configurarDesdeHojaActiva**. Conserva SPREADSHEET_ID, PORTAL_PASSWORD_PEPPER, PORTAL_SETUP_OWNER_EMAIL, las claves de Turnstile y las demás propiedades existentes. No cambies el hash de tu administrador ni vuelvas a crear su contraseña. Las cuatro pestañas nuevas ya están preparadas en la base; la función revisa sus encabezados y activa las capacidades.
5. En **Implementar > Administrar implementaciones**, selecciona la aplicación web que usa el campus, pulsa el lápiz y elige **Versión > Nueva versión**. Pulsa Implementar. Conserva la misma URL /exec, el propietario de ejecución y los permisos actuales.
6. Comprueba la respuesta a POST {"action":"health"}: debe incluir version:5 y features:["documents","credential","tasks"]. Recarga el portal para abrir los apartados nuevos.

La instalación alternativa consiste en colocar juntos los cuatro archivos .gs individuales. En ese caso no instales también EVOLVA-V5-COMPLETO.txt; es una alternativa a los archivos separados, no un quinto archivo.

## Qué cambia

- Las nuevas inscripciones solicitan CURP en PDF (hasta 2 MB) y fotografía JPG/PNG con fondo blanco (hasta 1 MB) cuando v5 está activado. Los archivos viajan por POST y se guardan en carpetas privadas de Drive. El fondo blanco es un requisito de presentación, no una verificación automática de identidad.
- Los alumnos anteriores pueden completar su expediente desde el campus. Se conservan todas las versiones de los documentos y de sus entregas de tareas.
- La credencial descarga frente y reverso en PDF, tamaño escolar, con fotografía, nombre, folio, diplomado, grupo y firma tipográfica de Alexis Soto. El QR abre el campus; no publica el expediente ni certifica una identidad fuera de la academia.
- Administración publica tareas para un alumno, grupo o diplomado. Admite instrucciones, fecha límite opcional y un material adjunto.
- El alumno entrega archivos PDF, DOCX, PPTX, JPG o PNG de hasta 2 MB. Administración descarga la entrega, escribe comentarios y puede calificar de 0 a 10. Esa nota actualiza la evaluación, el promedio y el avance.
- Cada corrección conserva la entrega anterior. Las revisiones antiguas se rechazan si el alumno ya envió una versión nueva. Una tarea revisada recibe otra entrega únicamente cuando administración solicita corrección.

## Privacidad y almacenamiento

Las hojas internas nuevas son _PORTAL_DOCUMENTOS, _PORTAL_TAREAS, _PORTAL_TAREA_ALUMNOS y _PORTAL_ENTREGAS. Sus encabezados deben conservarse. Ocultar estas pestañas organiza la base; sus permisos privados siguen siendo necesarios.

El programa crea automáticamente carpetas privadas de expedientes y tareas al recibir el primer archivo. Sus identificadores se conservan en PORTAL_DOCUMENTS_FOLDER_ID y PORTAL_ASSIGNMENTS_FOLDER_ID dentro de las propiedades del script. No publiques estas carpetas ni sus archivos y no escribas sus identificadores en GitHub.

Las respuestas del portal muestran identificadores internos y metadatos, sin URLs públicas ni identificadores de archivos de Drive. Cada descarga verifica la sesión, el alumno o el rol de administración. Las pruebas de archivos, tareas, revisiones y PDFs utilizaron datos ficticios; no se modificaron calificaciones reales.
