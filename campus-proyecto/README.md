# Campus de Evolva Academy

Campus publicado en https://evolvacademy.mx/campus/ y administración en https://evolvacademy.mx/campus/admin.html. GitHub Pages sirve los archivos de la raíz del repositorio desde main; no cambies la configuración de Pages ni la visibilidad del repositorio para esta actualización.

## Estado

El campus y administración están configurados con el endpoint de Google Apps Script v4. La comprobación del endpoint confirmó la versión y el rechazo de consultas académicas sin sesión. La cuenta propietaria está activa y las cuentas ficticias están deshabilitadas en la configuración publicada. Las pruebas de edición de notas y asignación de exámenes utilizan datos sintéticos; no se modificaron calificaciones reales para validar el despliegue.

## Activar la integración

Sigue **apps-script/CONECTAR.md**. Instala juntos PortalPages.gs, RegistroPages.gs y AdminPages.gs, con el manifiesto incluido, en el proyecto vinculado a la hoja. Ejecuta configurarDesdeHojaActiva, diagnosticarConexion y configurarAdministradorEvolva como propietario. Define tu contraseña en la ventana privada de la hoja; no se publica ninguna contraseña real en este repositorio.

Después de desplegar y verificar el endpoint v4 coloca su URL /exec en `campus/config.js` y `campus-proyecto/public/config.js`, y cambia DEMO_MODE a false. El endpoint anterior no es compatible con el protocolo nuevo y no debe conectarse sin actualizarlo. Una API configurada nunca usa datos ficticios como respaldo.

## Administración académica

- Búsqueda de alumnos por nombre, folio, correo, diplomado o grupo.
- Captura de evaluaciones y notas de 0 a 10; promedio y avance calculados a partir de las evaluaciones disponibles, incluidos ceros y pendientes.
- Publicación de enlaces HTTPS de examen para un alumno, grupo o diplomado con revisión de destinatarios.
- Cada publicación crea una evaluación pendiente para capturar su calificación después. Las respuestas se reciben en el formulario o herramienta institucional enlazada.
- Protección administrativa por rol en el servidor, revisión de conflictos y registro de cambios en una pestaña privada.
- Actualización del campus del alumno al volver a la pestaña o en hasta 30 segundos.

Los pagos y las constancias requieren su propia revisión y autorización institucional. Capturar una nota no confirma pagos ni autoriza constancias.

## Portal de alumnos

Acceso por correo y contraseña, consulta del folio de su sesión, aprendizaje, promedio, calificaciones, exámenes, avisos, comprobantes de pago, constancias y reporte académico PDF. El reporte conserva el título Reporte académico de calificaciones, QR de validación autenticada y firma tipográfica de Alexis Soto, Director General. Los folios existentes EVOLVA-###### no se renumeran.

Las pestañas internas de sesiones, reportes, lecturas, administradores y auditoría deben mantenerse privadas. No subas SPREADSHEET_ID, secretos, credenciales reales ni registros de alumnos a GitHub.

## Compilar y comprobar

Desde campus-proyecto ejecuta `npm install`, `npm run check`, `npm test` y `npm run build`. El resultado se escribe en `../campus`. Confirma fuente y compilación en el mismo cambio. La página institucional existente permanece en la raíz.
