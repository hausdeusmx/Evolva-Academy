# Activar la conexión de Evolva · v5

La estructura de las hojas existentes está preparada. Conserva los encabezados, registros, folios y permisos actuales. El campus existente utiliza su conexión actual mientras no se actualice el servicio. Para actualizar esa instalación, sigue ACTUALIZAR-V5.md; estos pasos también sirven para una instalación nueva.

1. Desde la base de datos abre **Extensiones > Apps Script**. Guarda una copia del código anterior antes de reemplazarlo.
2. Coloca **PortalPages.gs, RegistroPages.gs, AdminPages.gs y ExpedienteTareas.gs** juntos en el proyecto vinculado a la hoja. Copia también las autorizaciones del manifiesto `appsscript.json`: hojas, Drive, solicitudes externas, identidad del propietario e interfaz de la hoja.
3. En las propiedades del script configura `PORTAL_PUBLIC_URL` con `https://evolvacademy.mx/campus`. Mantén la clave privada de Turnstile únicamente en `PORTAL_TURNSTILE_SECRET` o `TURNSTILE_SECRET`. Conserva `PORTAL_PROOFS_FOLDER_ID` con la carpeta privada de comprobantes existente. No pegues claves privadas ni identificadores de la base en GitHub.
4. Ejecuta **configurarDesdeHojaActiva** con tu cuenta propietaria. Configura `SPREADSHEET_ID` y `PORTAL_SETUP_OWNER_EMAIL` a partir del contexto del propietario. Conserva las calificaciones y los folios EVOLVA-######; prepara las pestañas internas de sesiones, reportes, lecturas, administradores, auditoría, documentos, tareas y entregas.
5. Ejecuta **diagnosticarConexion**. El resultado informa columnas, disponibilidad y cantidades; no devuelve contraseñas ni expedientes.
6. Si aún no tienes una cuenta administrativa activa, ejecuta **configurarAdministradorEvolva** desde el editor del proyecto vinculado. Regresa a la hoja y crea tu contraseña en el cuadro privado que se abre. Usa de 12 a 128 caracteres. Esta activación solo se permite al propietario identificado en las propiedades del script; guarda un hash y no modifica cuentas ya activadas. No escribas la contraseña en el código ni en el chat.
7. Implementa como aplicación web ejecutada por el propietario y con el ajuste que admita solicitudes del portal. El endpoint exige sesión validada para cada operación personal o administrativa. No se admite JSONP de expedientes.
8. Verifica con `POST {"action":"health"}`: debe incluir `{"ok":true,"version":5,"features":["documents","credential","tasks"]}`. Prueba el inicio de sesión administrativo, la separación de roles y una cuenta de alumno autorizada. Conserva la contraseña de tu administrador existente y utiliza datos ficticios en las pruebas de cambios.
9. Solo después de comprobar la implementación coloca su URL **/exec** en `campus/config.js` y `campus-proyecto/public/config.js`, campo `API_URL`, y establece `DEMO_MODE` en `false`. El registro, el campus y administración usan el mismo endpoint mediante POST. Configurar un endpoint desactiva por completo las cuentas ficticias.
10. Entra en **https://evolvacademy.mx/campus/admin.html** con tu correo propietario y la contraseña que creaste. Publica enlaces HTTPS de exámenes para un alumno, grupo o diplomado; captura notas de 0 a 10 desde la ficha del alumno. Los cambios se reflejan al volver al campus o en su actualización de hasta 30 segundos.
11. Actualiza o retira las implementaciones antiguas que permitan consultar expedientes por folio. Cambiar la página web no restringe sus endpoints anteriores.

## Administración

La cuenta administrativa vive en `_PORTAL_ADMINISTRADORES` y es independiente de ALUMNOS. Una fila en estado PENDIENTE sin HASH todavía no permite iniciar sesión. No asignes contraseñas provisionales públicas ni agregues administradores a través del formulario de inscripción. Cada operación administrativa vuelve a comprobar el rol activo.

`_PORTAL_AUDITORIA` registra quién capturó una nota o publicó un examen y cuándo. La captura de notas rechaza formularios desactualizados. La publicación de exámenes requiere revisar la cantidad de destinatarios y admite reintentos sin duplicar las asignaciones. No se aprueban constancias ni pagos por cambiar una nota.

La publicación registra el enlace del examen o formulario institucional y crea una evaluación pendiente por alumno. Las respuestas se resuelven en esa herramienta externa; las notas se capturan desde administración. No se importa automáticamente la calificación de Google Forms.

## Datos existentes

`EVALUACIONES` admite el encabezado existente `CALIFICACIONES`. Al incorporar un alumno que aún usa M1–M4 se conservan esos cuatro módulos en las evaluaciones detalladas, incluidos ceros y pendientes. Desde ese momento el promedio y avance se calculan con esas evaluaciones; no se sobrescriben las columnas históricas de ALUMNOS.

`PAGOS!H` usa `ARCHIVO`. `EXAMENES!G:I` usa `URL`, `MODULO` y `DURACION`. No se fabrican enlaces ni se confirman pagos automáticamente. Las nuevas inscripciones validan Turnstile en el servidor y conservan el formato EVOLVA-######. Las contraseñas anteriores siguen funcionando.

No cambies la visibilidad de la base ni de los comprobantes. Ocultar pestañas solo organiza la hoja: sus permisos privados siguen siendo necesarios. Mantén privados los secretos y las propiedades del script.

## Expedientes y tareas

La actualización v5 añade CURP PDF y fotografía a las inscripciones, expediente privado con historial de documentos y entregas, credencial escolar en PDF, publicación de tareas y revisión de trabajos. Los apartados nuevos se habilitan cuando el servicio confirma sus capacidades. Consulta ACTUALIZAR-V5.md para actualizar el proyecto existente con un solo archivo.
