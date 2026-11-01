# Sitio de Evolva Academy

GitHub Pages publica la raíz de main. Se conserva el dominio de CNAME.

## Páginas y acceso

index.html y diplomados.html presentan los programas y sus precios. inscripcion.html conserva el servicio de registro y Turnstile anteriores, y el formato de folio EVOLVA-######. El sistema genera los datos de registro; la activación académica depende de administración y del backend del campus.

pagos.html presenta cuotas de referencia y el enlace de Stripe existente. No consulta expedientes por folio ni confirma pagos automáticamente.

alumnos.html dirige al campus con correo y contraseña. calificaciones.html, certificado.html y correos.html orientan al acceso del alumno. validar.html dirige a la validación protegida del reporte. cuenta.html es el directorio de servicios; Correos.html conserva compatibilidad con enlaces anteriores.

Se retiraron las consultas de expedientes por matrícula de estas páginas públicas. Los endpoints antiguos de Apps Script deben restringirse o desactivarse desde su cuenta propietaria: cambiar estas páginas no modifica sus permisos. Antes de operar con alumnos reales, activa el backend autenticado descrito en campus-proyecto/README.md y revisa los servicios antiguos. No coloques claves privadas en el repositorio.

## Estado del campus

campus/ y campus/admin.html utilizan el endpoint verificado de Google Apps Script v4 con DEMO_MODE=false. Las consultas académicas y las operaciones administrativas requieren una sesión válida; la cuenta propietaria está activa. La configuración del endpoint se conserva también en campus-proyecto/public/config.js para futuras compilaciones.

## Mantenimiento

El diseño compartido está en assets/site.css; assets/site.js controla el menú. assets/registro.js y assets/legacy-api.js conservan el contrato del servicio de inscripción existente. assets/turnstile-state.js muestra fallos de la verificación sin omitirla. Turnstile requiere que el dominio esté autorizado en Cloudflare.

Ejecuta node tests/check-flows.mjs desde la raíz. Las pruebas usan respuestas simuladas, verifican el registro y los enlaces de acceso, y comprueban que las páginas públicas no consultan expedientes. No envían inscripciones ni pagos reales.

Confirma cambios en main para publicar. Conserva la fuente de Pages en la raíz; no la cambies a /docs.

## Conexión del registro

El formulario carga campus/config.js. Cuando API_URL contiene el endpoint verificado de Apps Script, envía el registro por POST a esa misma API. Mientras no se active, mantiene el servicio anterior de inscripción. Nunca se interpreta DEMO_MODE como permiso para crear alumnos reales. La guía actual de despliegue es campus-proyecto/apps-script/CONECTAR.md.

## Expedientes y tareas v5

La actualización de documentos de inscripción, expediente privado, credencial PDF y tareas se habilita cuando el endpoint confirma las nuevas capacidades. La guía para actualizar el proyecto existente está en campus-proyecto/apps-script/ACTUALIZAR-V5.md y el backend completo en EVOLVA-V5-COMPLETO.txt. El formulario conserva su comportamiento actual hasta la activación de v5; después exige CURP PDF y fotografía.
