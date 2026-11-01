# Sitio de Evolva Academy

GitHub Pages publica la raíz de main. Se conserva el dominio de CNAME.

## Páginas y acceso

index.html y diplomados.html presentan los programas y sus precios. inscripcion.html conserva el servicio de registro y Turnstile anteriores, y el formato de folio EVOLVA-######. El sistema genera los datos de registro; la activación académica depende de administración y del backend del campus.

pagos.html presenta cuotas de referencia y el enlace de Stripe existente. No consulta expedientes por folio ni confirma pagos automáticamente.

alumnos.html dirige al campus con correo y contraseña. calificaciones.html, certificado.html y correos.html orientan al acceso del alumno. validar.html dirige a la validación protegida del reporte. cuenta.html es el directorio de servicios; Correos.html conserva compatibilidad con enlaces anteriores.

Se retiraron las consultas de expedientes por matrícula de estas páginas públicas. Los endpoints antiguos de Apps Script deben restringirse o desactivarse desde su cuenta propietaria: cambiar estas páginas no modifica sus permisos. Antes de operar con alumnos reales, activa el backend autenticado descrito en campus-proyecto/README.md y revisa los servicios antiguos. No coloques claves privadas en el repositorio.

## Estado del campus

campus/ permanece en modo de prueba con datos ficticios. Sus sesiones y permisos se implementan en el nuevo backend preparado; falta desplegarlo y conectar las hojas reales. No utilices un endpoint del protocolo anterior en la configuración del nuevo campus.

## Mantenimiento

El diseño compartido está en assets/site.css; assets/site.js controla el menú. assets/registro.js y assets/legacy-api.js conservan el contrato del servicio de inscripción existente. assets/turnstile-state.js muestra fallos de la verificación sin omitirla. Turnstile requiere que el dominio esté autorizado en Cloudflare.

Ejecuta node tests/check-flows.mjs desde la raíz. Las pruebas usan respuestas simuladas, verifican el registro y los enlaces de acceso, y comprueban que las páginas públicas no consultan expedientes. No envían inscripciones ni pagos reales.

Confirma cambios en main para publicar. Conserva la fuente de Pages en la raíz; no la cambies a /docs.
