# Campus de Evolva Academy

Campus publicado en https://evolvacademy.mx/campus/ y administración en https://evolvacademy.mx/campus/admin.html. GitHub Pages sirve los archivos de la raíz del repositorio desde main; no cambies la configuración de Pages ni la visibilidad del repositorio para esta actualización.

## Estado

El campus y administración usan una API privada de Google Apps Script. La última comprobación confirmó v7 y el rechazo de consultas académicas sin sesión; la interfaz v8 detecta las capacidades activas antes de habilitar los módulos nuevos. La cuenta propietaria está activa y las cuentas ficticias están deshabilitadas en la configuración publicada. Las pruebas de edición de notas y asignación de exámenes utilizan datos sintéticos; no se modificaron calificaciones reales para validar el despliegue.

## Referencia de la integración inicial

Los archivos **apps-script/CONECTAR.md** y sus módulos describen la instalación histórica. No sustituyen una API privada más reciente. Para una instalación inicial desde esa referencia: Instala juntos PortalPages.gs, RegistroPages.gs y AdminPages.gs, con el manifiesto incluido, en el proyecto vinculado a la hoja. Ejecuta configurarDesdeHojaActiva, diagnosticarConexion y configurarAdministradorEvolva como propietario. Define tu contraseña en la ventana privada de la hoja; no se publica ninguna contraseña real en este repositorio.

Después de desplegar y verificar el endpoint v4 coloca su URL /exec en `campus/config.js` y `campus-proyecto/public/config.js`, y cambia DEMO_MODE a false. El endpoint anterior no es compatible con el protocolo nuevo y no debe conectarse sin actualizarlo. Una API configurada nunca usa datos ficticios como respaldo.

## Administración académica

- Búsqueda de alumnos por nombre, matrícula, correo, diplomado o grupo.
- Captura de evaluaciones y notas de 0 a 10; promedio y avance calculados a partir de las evaluaciones disponibles, incluidos ceros y pendientes.
- Publicación de enlaces HTTPS de examen para un alumno, grupo o diplomado con revisión de destinatarios.
- Cada publicación crea una evaluación pendiente para capturar su calificación después. Las respuestas se reciben en el formulario o herramienta institucional enlazada.
- Protección administrativa por rol en el servidor, revisión de conflictos y registro de cambios en una pestaña privada.
- Actualización del campus del alumno al volver a la pestaña o en hasta 30 segundos.

Los pagos y las constancias requieren su propia revisión y autorización institucional. Capturar una nota no confirma pagos ni autoriza constancias.

## Portal de alumnos

Acceso por correo y contraseña, consulta de la matrícula de su sesión, aprendizaje, promedio, calificaciones, exámenes, avisos, comprobantes de pago, constancias y reporte académico PDF. El reporte conserva el título Reporte académico de calificaciones, QR de validación autenticada y firma tipográfica de Alexis Soto, Director General. Las matrículas existentes EVOLVA-###### no se renumeran.

Las pestañas internas de sesiones, reportes, lecturas, administradores y auditoría deben mantenerse privadas. No subas SPREADSHEET_ID, secretos, credenciales reales ni registros de alumnos a GitHub.

## Compilar y comprobar

Desde campus-proyecto ejecuta `npm install`, `npm run check`, `npm test` y `npm run build`. El resultado se escribe en `../campus`. Confirma fuente y compilación en el mismo cambio. La página institucional existente permanece en la raíz.

## Actualización v5: documentos, credenciales y tareas

La web incluye Expediente del alumno, Mi credencial y Trabajos y tareas; administración incluye consulta de expedientes, publicación y revisión de trabajos. La activación del backend sigue apps-script/ACTUALIZAR-V5.md. Hay una versión completa en un solo archivo para simplificar la actualización del proyecto existente. Hasta que el endpoint confirme las nuevas capacidades, el campus conserva las funciones v4 y los apartados nuevos muestran su estado de activación. Las inscripciones solicitan los archivos obligatorios al detectar v5.

Los documentos CURP y las fotografías se guardan en Drive privado. Los estudiantes consultan solamente sus propios archivos y entregas. La credencial PDF utiliza la fotografía del expediente; su QR abre el acceso al campus. Los archivos y datos reales no se incluyen en este repositorio.


## Notificaciones web y API privada

La interfaz web incluye preferencias de notificaciones y envío de avisos desde administración. Su activación requiere la actualización privada de Apps Script versión 6, entregada por separado al propietario. Los archivos de Apps Script de este repositorio son una referencia histórica; no deben sustituir una implementación privada más reciente. El comando de compilación genera únicamente el frontend y no regenera el backend privado.

## Datos privados para transferencias

La API v6 entrega los avisos de Sheets después de autenticar al alumno. La fila reservada de `AVISOS` con ID `EVOLVA-PAGOS-CUENTA` contiene la cuenta activa en texto: `Cuenta: …`, `Banco receptor: …`, `Beneficiario: …` y `CLABE: …`, cada campo en su propia línea. No duplicar esa fila ni limitarla a una matrícula/diplomado. El campus la presenta en Pagos y la excluye de los avisos y su indicador de no leídos. Una configuración incompleta, duplicada o con CLABE inválida muestra una indicación para consultar a administración. Los valores bancarios no se incluyen en el código público, config.js ni en ejemplos del repositorio. Editar solo el mensaje de esa fila para cambiar la cuenta; conservar el ID. No se envían notificaciones push al modificarla.

`campus/?seccion=pagos` abre Pagos después de iniciar sesión. El concepto sugerido es la matrícula del alumno; los comprobantes siguen pendientes de revisión administrativa.

## Acceso académico durante la revisión de pagos

Mis clases, Trabajos y tareas y Exámenes muestran un aviso de espera mientras el alumno tenga algún comprobante En revisión, Por revisar o Pendiente. Se conserva el acceso a pagos, avisos, calificaciones y documentos de inscripción. No se aplica una regla de adeudos ni se bloquea por no tener pagos. Cada consulta de tareas, entrega o apertura de examen revisa el estado vigente; el alumno puede actualizarlo desde el aviso y el campus lo actualiza periódicamente.

La protección del servidor y la nueva pestaña Admin → Pagos requieren la actualización privada API v7, con las capacidades payment_access y payment_review. Las funciones no se agregan al backend histórico público. La interfaz de alumno mantiene un bloqueo compatible con API v6; Admin muestra una activación pendiente hasta que la nueva API esté desplegada. Confirmar un comprobante requiere verificar el abono y usa una revisión para rechazar cambios concurrentes. Solo confirmar el último pendiente restablece el acceso. Los exámenes externos se abren con una consulta autenticada en v7; los enlaces ya compartidos requieren los permisos del formulario externo.


## Actualización v8: Mis clases, Calendario y recuperación

La interfaz añade clases con lecturas, enlaces y archivos privados por módulo y semana; cada alumno puede marcar su lectura sin modificar sus notas. Administración publica para un alumno, grupo o diplomado, revisa destinatarios y puede archivar materiales. El calendario reúne clases programadas, fechas límite de tareas y eventos creados por administración, con hora de Ciudad Juárez.

La activación requiere el archivo completo privado de API v8 entregado al propietario. Sustituir el contenido completo de Código.gs, conservar las propiedades del proyecto y ejecutar `prepararPortalV8` como propietario antes de implementar una nueva versión en la implementación existente. La preparación crea pestañas internas privadas y solicita autorización de envío de correo para recuperación; no envía mensajes ni modifica contraseñas, pagos o calificaciones. Mantener el mismo endpoint y acceso de la implementación. Hasta activar v8, las secciones nuevas indican que su activación está pendiente.

La recuperación utiliza el correo personal de inscripción, verificación Turnstile, límites de solicitudes y un enlace de un solo uso válido durante 20 minutos. El token solo se conserva como hash en el servidor y viaja en el fragmento del enlace; cambiar la contraseña cierra las sesiones anteriores del alumno. Las cuentas administrativas conservan su flujo existente. No publicar el backend privado, la hoja, expedientes ni secretos en este repositorio.

La compilación sigue generando únicamente la interfaz. Las pruebas públicas usan datos sintéticos y no envían correos; la API privada se verifica con un arnés local separado de la referencia histórica de backend.

## Entrega manual de correo institucional · V9

Admin incluye Correo institucional: búsqueda de alumno, dirección fija `EVOLVA-######@evolvacademy.mx`, asignación de contraseña inicial, estado y cancelación de entrega pendiente. La página `/correos.html` valida CURP, matrícula y Turnstile antes de entregar el acceso una sola vez. El correo y la clave no se envían por URL ni se conservan en almacenamiento del navegador. El acceso del campus mantiene su propia contraseña.

No hay integración con Google Workspace: el propietario prepara las cuentas por su cuenta y registra aquí el acceso inicial. La conexión requiere el archivo completo privado V9, ejecutar `prepararPortalV9` como propietario y actualizar la implementación existente conservando URL y acceso. Sin esta activación, ambos formularios muestran disponibilidad pendiente y no aceptan asignaciones ni consultas. El backend nunca se publica en este repositorio.

Validación de la página: `node tests/check-mail-delivery.mjs` desde la raíz del repositorio. Las pruebas del backend privado se ejecutan separadamente con datos ficticios.

## Servicios escolares V10 · seis módulos

- Seguimiento en Admin: comprobantes pendientes, entregas por revisar, trabajos atrasados y solicitudes abiertas; filtros por curso/grupo y hasta 50 elementos por sección.
- Centro de ayuda en cuentas de alumnos y Admin: solicitudes privadas, categoría, conversación, estados y paginación. No envía correos ni mensajes fuera del portal.
- Rúbricas: de 1 a 8 criterios que suman 10 puntos; se configuran antes de calificar, se muestran en la tarea y calculan la nota al revisar. Sus criterios se conservan cuando ya existen notas o revisiones.
- Recibos PDF: emisión con identificador estable y datos del pago confirmado, disponibles para el alumno propietario y Admin. El recibo es un registro interno de pago.
- Reportes Excel `.xlsx`: alumnos, calificaciones y pagos; filtros por curso/grupo, encabezado congelado y hoja de información. Los textos se exportan como valores literales, no como fórmulas. Límite de 2000 alumnos y 10000 filas por exportación.
- Encuestas: publicación con revisión de destinatarios, hasta 8 preguntas de valoración o texto; opción de habilitar al completar el curso, una respuesta por alumno, promedios/comentarios y cierre conservando resultados. Las respuestas son identificadas y visibles solo para administración.

Requiere el archivo completo privado V10. Sustituir TODO Código.gs, ejecutar `prepararPortalV10` como propietario y actualizar la implementación existente conservando URL y acceso. No añadir este backend al repositorio público. Las activaciones V8/V9, matrículas, contraseñas, pagos y calificaciones previos se conservan. Sin la preparación V10, las interfaces nuevas muestran activación pendiente.

Checks adicionales: `node tests/check-frontend.mjs` y `node tests/check-suite-files.mjs`. Este último usa archivos ficticios y una carpeta temporal; se puede establecer `EVOLVA_QA_OUTPUT` para conservar los PDF/XLSX de revisión. Las pruebas del backend privado se ejecutan por separado.

## Catálogo V11 · siete cursos

El catálogo público y la inscripción añaden Excel básico para el trabajo (8 semanas, $100 semanal, $800 total), Canva para redes y negocios (6 semanas, $100 semanal, $600 total), Atención al cliente y ventas (6 semanas, $100 semanal, $600 total), Administración de pequeños negocios (8 semanas, $125 semanal, $1,000 total) y Marketing digital básico (8 semanas, $150 semanal, $1,200 total). Incluyen dos actividades semanales, revisión, proyecto final y constancia, sin cuota adicional de inscripción. Las licencias de software no están incluidas. Se conservan las cuotas y duración de los dos cursos existentes.

La inscripción de los cinco cursos nuevos requiere la API privada V11 y la preparación `prepararPortalV11` ejecutada por el propietario. Actualizar la implementación existente conservando URL y acceso. Hasta recibir `course_catalog` en health V11, las cinco opciones muestran preparación pendiente. Los datos y la API privada no se publican en GitHub. La preparación no crea alumnos ni cambia matrículas, contraseñas, calificaciones o pagos existentes. Las clases, tareas y exámenes se publican por separado desde Admin.

`assets/course-catalog.json` es la referencia pública de nombres, duración y cuotas; mantener sincronizadas las páginas y el catálogo privado al modificarla. El contrato histórico `diplomado`/`DIPLOMADO` se conserva. Los cursos cortos muestran cuota semanal y total en el campus, sin mensualidad calculada. Sus pagos se registran por transferencia en el campus; el enlace Stripe anterior se conserva para los flujos existentes.

Comprobaciones desde la raíz: `node tests/check-course-catalog.mjs` y `node tests/check-flows.mjs`. El backend completo se comprueba separadamente con datos ficticios.

## Grupos y credencial V12

La API privada V12 asigna grupos por curso con cupo máximo de 20 alumnos, bajo el mismo bloqueo que la inscripción. Los prefijos son FIN, PA, EXC, CAN, VEN, ADM y MKT. `prepararPortalV12` asigna grupos a las matrículas existentes que no tienen uno; en grupos excedidos conserva los primeros 20 registros y mueve el excedente a otros grupos del mismo curso. Los alumnos inactivos también ocupan lugar. No cambia destinatarios de materiales ya publicados, matrículas, calificaciones, pagos o contraseñas. Las asignaciones aparecen en el campus y en los filtros existentes de Admin.

La credencial PDF conserva el tamaño escolar, frente/reverso, foto, QR de acceso al campus y firma del director. Añade correo institucional, teléfono del alumno y soporte@evolvacademy.mx. Si el correo institucional aún no figura en el registro, muestra la dirección estándar formada por matrícula y dominio; esto no crea una cuenta de correo. El teléfono se guarda como texto en la columna TELEFONO. Cada alumno puede actualizar solo su propio teléfono desde Mi credencial; los nuevos registros lo envían por POST cuando health V12 anuncia `student_contact`. Sin la activación, se muestra Sin registrar y no se habilita el guardado.

Para activar: reemplazar TODO Código.gs con el archivo completo privado V12, ejecutar `prepararPortalV12` como propietario y actualizar la implementación existente conservando URL y acceso. Esta preparación también activa el catálogo V11 y agrega GRUPO/TELEFONO al final de ALUMNOS si faltan. Las pruebas privadas cubren cupos, aislamiento por curso, cambios parciales, fórmulas, reintentos y contacto privado. No publicar el backend, la hoja ni datos personales.


## Rediseño de documentos académicos

La boleta conserva la matrícula EVOLVA-######, las calificaciones del registro emitido, el código EVR y el enlace de validación autenticado. Añade avance, número de evaluaciones registradas, estados por actividad y, cuando existen en la cuenta, inscripción y estado del alumno. Estos dos datos complementarios no modifican el snapshot académico autorizado. Cada página conserva firma tipográfica, fecha de emisión y QR con margen de lectura dentro del papel.

La constancia generada usa formato horizontal con nombre, curso, matrícula, grupo, modalidad, duración registrada, promedio, inscripción y emisión. Si el backend entrega un PDF ya archivado, se conserva ese original. El QR de constancias y credenciales abre el campus; no se presenta como validación de un documento emitido.

La credencial conserva las dos caras, fotografía privada, matrícula, grupo, correo institucional, teléfono y soporte. Incorpora estado de inscripción y fecha de emisión. Solo muestra vigencia con fecha cuando el dato existe; en otro caso indica que depende de una inscripción activa. No incluye CURP ni genera un vencimiento ficticio. Los documentos de demostración están marcados sin validez académica.

Los cambios no requieren nuevas columnas, otro endpoint ni una actualización del proyecto de Apps Script. `npm test` incluye la comprobación de los tres PDF. Para producir muestras locales: `node tests/check-credential.mjs foto-sintetica.png /ruta/credencial-prueba.pdf`.

## Calendario de pagos y navegación

El campus conserva los calendarios asignados por la API. Cuando la API solo entrega el catálogo, muestra un calendario de referencia: semanas y cuota semanal con total coherente, o meses y cuota mensual. Las fechas parten de la inscripción registrada; sin fecha válida aparecen por confirmar. Esta referencia no cambia condiciones de cobro ni confirma pagos. Los comprobantes se relacionan únicamente con su periodo exacto; un abono parcial conserva el saldo restante y un comprobante en revisión conserva ese estado.

Constancias distingue actividades completadas de autorización de emisión. El botón Actualizar estado vuelve a consultar la cuenta y los errores de descarga aparecen junto al documento. La autorización continúa en el servidor y en el registro privado de CONSTANCIAS; completar las actividades por sí solo no la sustituye.

La navegación agrupa aprendizaje, servicios y comunidad, conserva la matrícula visible y actualiza la sección en la URL. El diseño usa menú guinda, tarjetas de alto contraste y navegación móvil con desplazamiento independiente. Las pruebas cubren cuotas semanales, fin de mes, fechas ausentes, calendarios asignados, abonos y revisión de comprobantes.
