# Campus de Evolva Academy

Portal alojado en https://evolvacademy.mx/campus/ desde la rama main y la raíz del repositorio. La página institucional y los servicios anteriores se conservan.

## Estado

La publicación inicial es un entorno de prueba con datos ficticios. Para consultar alumnos reales hay que instalar el backend de apps-script/PortalPages.gs en un proyecto separado de Google Apps Script. La API anterior usa otro protocolo y no debe colocarse en la nueva configuración sin actualizarla.

## Activar las hojas existentes

1. Copia apps-script/PortalPages.gs a un proyecto separado en script.google.com.
2. Configura SPREADSHEET_ID con el ID de tu archivo existente y PORTAL_PUBLIC_URL con https://evolvacademy.mx/campus.
3. Ejecuta configurarPortalPages. Conserva ALUMNOS, EXAMENES, AVISOS, PAGOS, CONSTANCIAS y EVALUACIONES opcional; crea únicamente las pestañas internas _PORTAL_SESIONES, _PORTAL_REPORTES y _PORTAL_LECTURAS.
4. Implementa como aplicación web ejecutada con tu cuenta y accesible para solicitudes externas. Todas las operaciones académicas exigen una sesión de alumno válida.
5. Copia la URL /exec de esa implementación a campus/config.js, campo API_URL. Pon DEMO_MODE en false. Cambia también public/config.js si vas a recompilar. Nunca pegues claves maestras o contraseñas en estos archivos.

El acceso, expedientes, pagos y validación se protegen con correo y contraseña. El QR de los reportes reales apuntará a https://evolvacademy.mx/campus/validar.html. El detalle de instalación está en LEEME_PRIMERO.md; sus instrucciones de publicar /docs corresponden al ZIP independiente. En este repositorio se mantiene la publicación existente desde la raíz.

## Actualizar el portal

Desde campus-proyecto: npm install, npm run check, npm test y npm run build. La compilación actualiza ../campus. Revisa y confirma los cambios en GitHub. No hace falta cambiar la configuración de Pages.

Las calificaciones reales se capturan en las hojas o el sistema de evaluación institucional. El portal no confirma transferencias ni aprueba constancias de forma automática. Los reportes llevan firma tipográfica de Alexis Soto, Director General.
