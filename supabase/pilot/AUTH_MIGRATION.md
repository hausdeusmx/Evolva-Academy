# Accesos: preparación para la migración

La revisión del código V29 encontró dos formatos admitidos por `portalCheckPassword_`: un formato heredado y `EAP3$<salt>$<hash>`. Este último calcula HMAC-SHA256 usando un pepper guardado en las propiedades privadas de Apps Script. No se leyó ni exportó ese pepper, y no se inspeccionaron contraseñas de alumnos.

Supabase Auth admite importación de hashes compatibles, como bcrypt/argon2; el formato EAP3 no es directamente importable. Copiar la columna de contraseñas a `encrypted_password` no resolvería la migración.

## Transición propuesta, pendiente de implementar y revisar

1. Mantener la matrícula como identificador estable y separar la cuenta de sus inscripciones. Vincular la cuenta con `auth.users.id` desde un proceso administrativo, nunca por datos de perfil enviados por el alumno.
2. Migrar una cuenta únicamente después de verificar su acceso por el servidor actual o completar una activación segura. En la primera opción, el backend de transición puede establecer una contraseña compatible tras autenticar correctamente al alumno; no es necesario exportar el pepper ni conservar contraseñas en texto.
3. Respetar los accesos temporales V28: no permitir que una clave pendiente de cambio se convierta en una sesión completa.
4. El correo institucional identifica el acceso, aunque el buzón todavía no esté disponible. La recuperación no puede depender exclusivamente de mensajes a ese buzón; debe conservar una verificación por el canal personal autorizado del expediente.
5. Validar bloqueo de pagos, roles administrativos, profesores y tutores, sesiones del APK, recuperación, documentos privados y acuses firmados antes del cambio real. Esta interfaz de prueba solo implementa lectura del panel, calificaciones, pagos y datos básicos.

## Estado de esta entrega

Hay un adaptador de prueba con acceso por contraseña a Supabase Auth, lectura mediante la función existente y cierre/renovación de sesión. Su configuración contiene exclusivamente la URL y clave publicable; no usa claves administrativas. La interfaz es independiente y no selecciona Supabase para el campus de producción.

Se verificaron ocho escenarios automatizados con respuestas controladas. Las comprobaciones HTTP en vivo cubren el rechazo del acceso anónimo y de credenciales inválidas. El recorrido de acceso válido queda pendiente de habilitar cuentas sintéticas mediante un procedimiento acotado autorizado. No se crearon cuentas Auth persistentes.

La revisión automática rechazó un método temporal basado en una Edge Function con privilegios administrativos para crear las cuentas. Esa función no se desplegó. El método no forma parte de la interfaz ni del código de entrega.
