# Prueba de Supabase para Evolva Academy

Base aislada con datos ficticios, creada en el proyecto existente de Supabase con plan Free. El campus publicado continúa usando Apps Script V29; no se modificaron su configuración, sus accesos ni sus documentos.

## Qué contiene

Ocho tablas en el esquema `evolva_trial`: alumnos, identidad, cursos, inscripciones, calificaciones, cuotas, comprobantes de pago y metadatos de documentos. Hay dos alumnos ficticios, dos cursos, dos inscripciones, dos calificaciones, seis cuotas y un comprobante simulado en revisión. No se realizaron transferencias.

La matrícula mantiene el formato `EVOLVA-######`. Es independiente de las inscripciones a cursos; reinscribirse no crea otra matrícula. El correo institucional se deriva de sus seis dígitos. Esto no crea un buzón de correo.

`public.evolva_trial_dashboard(p_enrollment_id uuid default null)` agrupa los datos de consulta en una llamada. Usa `SECURITY INVOKER`, ruta de búsqueda vacía y permisos de lectura sujetos a RLS. Devuelve un indicador de pago en revisión, pero el piloto no implementa todavía las operaciones de tareas o exámenes ni sustituye sus controles del servidor actual.

## Permisos

- RLS activo en las ocho tablas; cada alumno solo puede leer sus filas y cursos inscritos.
- Sin acceso anónimo a las tablas ni a la función de consulta.
- Sin permisos del alumno para cambiar matrícula, calificaciones, pagos o autorización de constancia.
- Identidad separada: la CURP no aparece en la respuesta general del panel.
- Sin datos personales reales, documentos almacenados, enlaces públicos, contraseñas o claves privadas en estos archivos.
- Los alumnos ficticios no tienen cuentas Auth vinculadas ni contraseñas; el acceso válido requiere habilitar esas cuentas con autorización. La interfaz privada y el adaptador de acceso ya están preparados de forma independiente del campus publicado.

## Archivos y validación

- `schema.sql`: definición y datos ficticios aplicados al proyecto vacío mediante `apply_migration`. No ejecutar de nuevo en el mismo proyecto ni en producción.
- `verify.sql`: pruebas de permisos con roles y claims simulados en PostgreSQL. Crea vínculos Auth solo dentro de una transacción que termina en `ROLLBACK`; no envía correos ni deja cuentas nuevas.
- `verification.json`: resultado y límites de la prueba.
- `web/`: interfaz privada y adaptador con acceso por contraseña, consulta agrupada y cierre/renovación de sesión. Solo contiene configuración publicable de Supabase.
- `client.test.mjs`: ocho pruebas automatizadas de sesión, aislamiento de respuestas y errores.
- `live-check.mjs`: comprobaciones HTTP en vivo que no crean cuentas ni envían correos.
- `AUTH_MIGRATION.md`: revisión del formato actual de contraseñas, transición propuesta y bloqueo pendiente de cuentas ficticias.

Las pruebas SQL verifican aislamiento entre alumnos, CURP, selección de cursos, reinscripción con la misma matrícula, calendario, estado de revisión del pago, restricciones de escritura y denegación a usuarios anónimos, sin vínculo o suspendidos. Las ocho pruebas del adaptador usan respuestas controladas. Las comprobaciones HTTP reales verifican el rechazo del acceso anónimo y de credenciales inválidas. No se ha probado un inicio de sesión válido ni medido rendimiento en producción.

El asesor de seguridad no reportó hallazgos. El asesor de rendimiento indicó dos índices aún sin uso; se conservan porque cubren claves foráneas y las tablas contienen muy pocos datos. Referencia: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Lo que falta para migrar el campus

1. Mapear y validar exportaciones de las hojas existentes sin renumerar matrículas ni perder las inscripciones y los acuses firmados.
2. Preparar Supabase Auth: revisar la compatibilidad del hash actual y, si no es importable, diseñar una activación segura. Las contraseñas del campus y del buzón siguen siendo distintas.
3. Implementar un adaptador separado y comprobar los recorridos alumno, administración, profesores y tutores. El servidor actual expone muchas más acciones que este piloto.
4. Crear almacenamiento privado y acceso temporal a PDFs/fotos, conservando permisos, huellas y consentimientos; comprobar volumen y límites del plan.
5. Validar correos, documentos, pagos y tareas en un entorno de prueba antes de acordar el cambio de producción y su reversión.

La prueba no cambia el plan ni contrata recursos de pago. No se creó una rama de base de datos con facturación independiente.
