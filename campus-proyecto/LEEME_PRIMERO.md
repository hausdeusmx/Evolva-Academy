# Evolva Academy · Administración y campus

La guía vigente para conectar Google Sheets y activar la cuenta propietaria es **apps-script/CONECTAR.md**.

- Campus: https://evolvacademy.mx/campus/
- Administración: https://evolvacademy.mx/campus/admin.html
- Código del backend: apps-script/PortalPages.gs, apps-script/RegistroPages.gs y apps-script/AdminPages.gs, juntos en el proyecto vinculado a la hoja.
- Configuración pública: campus/config.js y campus-proyecto/public/config.js. Solo necesitan la URL /exec verificada y DEMO_MODE=false; nunca secretos ni contraseñas.

El acceso administrativo real debe activarlo el propietario con `configurarAdministradorEvolva`. La contraseña se define en un cuadro privado de Google Sheets. Hasta que se despliegue Apps Script v4 y se configure la URL de la API, las cuentas visibles son ficticias y los cambios de prueba se guardan solo en el navegador.

En este repositorio GitHub Pages publica desde main y la raíz. La compilación de campus-proyecto genera ../campus. No crees una segunda configuración /docs ni cambies el dominio para actualizar el panel.

El panel permite buscar un alumno y capturar notas. Para exámenes registra un enlace HTTPS, el módulo, la duración y los destinatarios; revisa la cantidad antes de confirmar. Las respuestas se resuelven en la herramienta enlazada y la nota se captura en administración. El campus actualiza las evaluaciones, el promedio y el avance.

Conserva privados los permisos de las hojas y de la carpeta de comprobantes, así como los secretos del script. La cuenta administrativa es independiente de las cuentas de alumnos. El programa no confirma transferencias ni autoriza constancias al guardar calificaciones.
