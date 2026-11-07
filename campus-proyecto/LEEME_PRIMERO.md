# V22 · Aceptación durante la inscripción

La versión vigente del servidor es el archivo privado completo **Evolva_V22_ACTIVAR_AQUI_COMPLETO.txt**. Reemplaza todo Código.gs, guarda y ejecuta **ACTIVAR_EVOLVA_V22** con la cuenta propietaria. Después actualiza la implementación existente con Nueva versión; conserva la URL /exec, propiedades y permisos.

En Administración > Aviso y reglamento, completa el nombre legal y domicilio reales del responsable, revisa ambos documentos y confirma su publicación. No inventes estos datos. V22 rechaza nuevas inscripciones hasta estar preparada y tener una publicación completa. Prepara esos datos antes de actualizar el servicio. No se generan firmas de alumnos durante la activación.

En inscripción: aviso + reglamento + declaración de documentos sin casillas premarcadas, nombre escrito de quien acepta, código de seis dígitos al correo personal y botón Firmar e inscribirme. El código dura 10 minutos, tiene hasta 5 intentos y hasta 3 envíos por destinatario cada 15 minutos. El código verifica acceso al correo, no identidad civil. El servidor requiere CAPTCHA al solicitarlo y no vuelve a exigirlo al enviar el código correcto. No se guardan firmas en el navegador ni se publica el acuse.

Para menores de 18 años acepta la madre, padre o tutor desde otro correo, con declaración de mayoría y representación. Administración debe revisar la representación por un canal privado; el código no acredita parentesco. Acuses de inscripción permite registrar esa revisión. El alumno consulta su copia en Privacidad, sin volver a firmar allí. Las lecturas anteriores no se convierten en aceptaciones.

El acuse conserva la versión exacta, responsable, oferta y plan elegido, matrícula, nombre y correo de quien aceptó y fecha del servidor. No incluye código temporal, contraseña, CURP ni los archivos del expediente. El plan firmado se asigna solo al alta nueva; conserva planes de alumnos anteriores. Las modalidades sin cantidad de periodos y precio completos se rechazan para no firmar condiciones ambiguas; configura esos cursos desde Editor de cursos antes de ofrecerlas.

No se presenta como e.firma del SAT, firma avanzada o constancia NOM-151. Es un reglamento y acuerdo de inscripción/expediente, no una autorización general para publicidad ni una renuncia de derechos.

Las guías siguientes corresponden a versiones anteriores y se conservan como referencia.

---

# Evolva Academy · Actualización V21

El campus público usa la URL existente de Apps Script y DEMO_MODE=false. No cambies el dominio ni crees otra implementación.

V21 añade editor de cursos, importación CSV/XLSX con vista previa, cuentas de control escolar y cobranza, constancias de estudios y cupos por grupo con lista de espera. Las operaciones requieren activar V21 en el mismo proyecto de Google Apps Script. El código completo se entrega por separado; no debe subirse a este repositorio público.

1. Sustituye todo Código.gs por el archivo privado completo **Evolva_V21_ACTIVAR_AQUI_COMPLETO.txt**.
2. Guarda y ejecuta **ACTIVAR_EVOLVA_V21**, la primera función del archivo, con la cuenta propietaria. Conserva appsscript.json y las Propiedades del script.
3. Actualiza la aplicación web existente: Administrar implementaciones → lápiz → Nueva versión → Implementar. Conserva la URL /exec y el acceso actual.
4. Recarga el campus. El diagnóstico debe mostrar versión 21 y course_editor, student_import, area_permissions, study_letters y group_capacity.

Las matrículas EVOLVA-###### y los planes anteriores se conservan. Los cambios de catálogo afectan nuevas inscripciones; los borradores y archivados no aceptan altas nuevas. Configura todos los grupos que admitirán alumnos si quieres limitar cupos de un curso.

No se crean cuentas de personal ni se envían correos durante la activación. Crea las cuentas desde Permisos por área; sus acciones se autorizan en el servidor. Las constancias de estudios requieren solicitud, autorización y vigencia. La constancia de finalización conserva sus requisitos anteriores.

La importación admite hasta 100 alumnos por lote y 2 MB por archivo. Omite registros existentes sin modificarlos. El alumno establece su contraseña mediante Recuperar acceso con su correo personal. Para solicitar documentos debe completar su expediente.

La guía antigua que sigue es referencia de instalaciones previas; no sustituye el archivo V21 completo.

---

# Evolva Academy · Administración y campus

La guía vigente para conectar Google Sheets y activar la cuenta propietaria es **apps-script/CONECTAR.md**.

- Campus: https://evolvacademy.mx/campus/
- Administración: https://evolvacademy.mx/campus/admin.html
- Código del backend: apps-script/PortalPages.gs, apps-script/RegistroPages.gs y apps-script/AdminPages.gs, juntos en el proyecto vinculado a la hoja.
- Configuración pública: campus/config.js y campus-proyecto/public/config.js. Solo necesitan la URL /exec verificada y DEMO_MODE=false; nunca secretos ni contraseñas.

El acceso administrativo real está activado para el propietario. La contraseña se definió en el cuadro privado de Google Sheets. La configuración publicada utiliza el endpoint verificado de Apps Script v4 y DEMO_MODE=false; las cuentas ficticias están deshabilitadas. Una futura reinstalación debe seguir apps-script/CONECTAR.md y volver a verificar su endpoint.

En este repositorio GitHub Pages publica desde main y la raíz. La compilación de campus-proyecto genera ../campus. No crees una segunda configuración /docs ni cambies el dominio para actualizar el panel.

El panel permite buscar un alumno y capturar notas. Para exámenes registra un enlace HTTPS, el módulo, la duración y los destinatarios; revisa la cantidad antes de confirmar. Las respuestas se resuelven en la herramienta enlazada y la nota se captura en administración. El campus actualiza las evaluaciones, el promedio y el avance.

Conserva privados los permisos de las hojas y de la carpeta de comprobantes, así como los secretos del script. La cuenta administrativa es independiente de las cuentas de alumnos. El programa no confirma transferencias ni autoriza constancias al guardar calificaciones.

Para activar los documentos de inscripción, expedientes, credenciales y tareas, sigue **apps-script/ACTUALIZAR-V5.md**. Conserva la URL y las propiedades privadas del servicio ya conectado.
