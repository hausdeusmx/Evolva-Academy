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

## Actualización v5: documentos, credenciales y tareas

La web incluye Expediente del alumno, Mi credencial y Trabajos y tareas; administración incluye consulta de expedientes, publicación y revisión de trabajos. La activación del backend sigue apps-script/ACTUALIZAR-V5.md. Hay una versión completa en un solo archivo para simplificar la actualización del proyecto existente. Hasta que el endpoint confirme las nuevas capacidades, el campus conserva las funciones v4 y los apartados nuevos muestran su estado de activación. Las inscripciones solicitan los archivos obligatorios al detectar v5.

Los documentos CURP y las fotografías se guardan en Drive privado. Los estudiantes consultan solamente sus propios archivos y entregas. La credencial PDF utiliza la fotografía del expediente; su QR abre el acceso al campus. Los archivos y datos reales no se incluyen en este repositorio.


## Notificaciones web y API privada

La interfaz web incluye preferencias de notificaciones y envío de avisos desde administración. Su activación requiere la actualización privada de Apps Script versión 6, entregada por separado al propietario. Los archivos de Apps Script de este repositorio son una referencia histórica; no deben sustituir una implementación privada más reciente. El comando de compilación genera únicamente el frontend y no regenera el backend privado.

## Datos privados para transferencias

La API v6 entrega los avisos de Sheets después de autenticar al alumno. La fila reservada de `AVISOS` con ID `EVOLVA-PAGOS-CUENTA` contiene la cuenta activa en texto: `Cuenta: …`, `Banco receptor: …`, `Beneficiario: …` y `CLABE: …`, cada campo en su propia línea. No duplicar esa fila ni limitarla a un folio/diplomado. El campus la presenta en Pagos y la excluye de los avisos y su indicador de no leídos. Una configuración incompleta, duplicada o con CLABE inválida muestra una indicación para consultar a administración. Los valores bancarios no se incluyen en el código público, config.js ni en ejemplos del repositorio. Editar solo el mensaje de esa fila para cambiar la cuenta; conservar el ID. No se envían notificaciones push al modificarla.

`campus/?seccion=pagos` abre Pagos después de iniciar sesión. El concepto sugerido es el folio del alumno; los comprobantes siguen pendientes de revisión administrativa.

## Acceso académico durante la revisión de pagos

Trabajos y tareas y Exámenes muestran un aviso de espera mientras el alumno tenga algún comprobante En revisión, Por revisar o Pendiente. Se conserva el acceso a pagos, avisos, calificaciones y documentos de inscripción. No se aplica una regla de adeudos ni se bloquea por no tener pagos. Cada consulta de tareas, entrega o apertura de examen revisa el estado vigente; el alumno puede actualizarlo desde el aviso y el campus lo actualiza periódicamente.

La protección del servidor y la nueva pestaña Admin → Pagos requieren la actualización privada API v7, con las capacidades payment_access y payment_review. Las funciones no se agregan al backend histórico público. La interfaz de alumno mantiene un bloqueo compatible con API v6; Admin muestra una activación pendiente hasta que la nueva API esté desplegada. Confirmar un comprobante requiere verificar el abono y usa una revisión para rechazar cambios concurrentes. Solo confirmar el último pendiente restablece el acceso. Los exámenes externos se abren con una consulta autenticada en v7; los enlaces ya compartidos requieren los permisos del formulario externo.
