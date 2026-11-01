# Activar la conexión de Evolva

La estructura de las hojas existentes está preparada. Conserva los encabezados y los registros actuales.

1. Desde la base de datos, abre **Extensiones > Apps Script**. Guarda una copia del código anterior antes de reemplazarlo.
2. Coloca `PortalPages.gs` y `RegistroPages.gs` juntos en el proyecto. El manifiesto `appsscript.json` debe incluir las autorizaciones de hojas, Drive y solicitudes externas.
3. En las propiedades del script configura `PORTAL_PUBLIC_URL` con `https://evolvacademy.mx/campus`. Mantén la clave privada de Turnstile únicamente en `PORTAL_TURNSTILE_SECRET` o en `TURNSTILE_SECRET`. No la pegues en GitHub ni en el chat.
4. Ejecuta `configurarDesdeHojaActiva`. Si usas un proyecto independiente, configura primero `SPREADSHEET_ID` con el ID real y ejecuta `configurarPortalPages`. Los folios y las contraseñas existentes se conservan; el código no reemplaza las calificaciones ni los enlaces de comprobantes.
5. Ejecuta `diagnosticarConexion`. El resultado informa columnas, disponibilidad y cantidades; no devuelve contraseñas ni expedientes.
6. Implementa como aplicación web ejecutada por el propietario. El endpoint debe aceptar solicitudes del sitio. Las consultas personales requieren una sesión de alumno validada en el servidor; no se admite JSONP de expedientes.
7. Verifica el endpoint con `POST {"action":"health"}`. Debe responder `{"ok":true,"version":3}`. Confirma después el inicio de sesión y la separación de cuentas con cuentas de prueba autorizadas, sin alterar calificaciones reales.
8. Solo después de comprobar la implementación, coloca la URL `/exec` en `campus/config.js` y `campus-proyecto/public/config.js`, campo `API_URL`, y establece `DEMO_MODE` en `false`. El formulario de inscripción utilizará el mismo endpoint mediante POST.
9. Actualiza o retira los despliegues anteriores que permitan consultar expedientes por folio. Cambiar la página web no restringe por sí mismo sus endpoints antiguos.

Las nuevas inscripciones requieren validar Turnstile en el servidor. Se genera un folio disponible con el formato EVOLVA-###### y una contraseña que se muestra una sola vez; la hoja conserva un hash con secreto del servidor. Las contraseñas anteriores siguen funcionando sin modificar su valor.

`EVALUACIONES` admite el encabezado existente `CALIFICACIONES`; no hace falta renombrarlo. `PAGOS!H` utiliza `ARCHIVO`. `EXAMENES!G` permite registrar la URL institucional de cada evaluación. No se fabrican enlaces de examen ni se confirman pagos automáticamente.

No cambies la visibilidad de la base de datos ni de la carpeta de comprobantes. El código entrega archivos únicamente a la cuenta autorizada por su sesión. Mantén privadas las propiedades del script y sus secretos.
