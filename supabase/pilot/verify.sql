-- Run as postgres through execute_sql. All Auth links and test records roll back.
begin;
do $$
declare a uuid := gen_random_uuid(); b uuid := gen_random_uuid();
begin
  insert into auth.users(id, aud, role, email) values
    (a, 'authenticated', 'authenticated', a::text || '@example.invalid'),
    (b, 'authenticated', 'authenticated', b::text || '@example.invalid');
  update evolva_trial.students set auth_user_id = a where matricula = 'EVOLVA-000001';
  update evolva_trial.students set auth_user_id = b where matricula = 'EVOLVA-000002';
  perform set_config('evolva_trial_test.user_a', a::text, true);
  perform set_config('evolva_trial_test.user_b', b::text, true);
  perform set_config('evolva_trial_test.enrollment_b', (select e.id::text from evolva_trial.enrollments e
    join evolva_trial.students s on s.id = e.student_id where s.auth_user_id = b), true);
  insert into evolva_trial.student_identity(student_id, curp)
    select id, 'DEMO000000XXXXXXXX' from evolva_trial.students where auth_user_id = a;
  insert into evolva_trial.documents(enrollment_id, kind, mime_type)
    select e.id, 'curp', 'application/pdf' from evolva_trial.enrollments e;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('evolva_trial_test.user_a'), true);
select set_config('request.jwt.claims', json_build_object('sub', current_setting('evolva_trial_test.user_a'),
  'role', 'authenticated', 'user_metadata', json_build_object('role', 'admin', 'matricula', 'EVOLVA-000002'))::text, true);
do $$
declare d jsonb;
begin
  if (select count(*) from evolva_trial.students) <> 1 then raise exception 'RLS: student leak'; end if;
  if (select count(*) from evolva_trial.enrollments) <> 1 then raise exception 'RLS: enrollment leak'; end if;
  if (select count(*) from evolva_trial.courses) <> 1 then raise exception 'RLS: course leak'; end if;
  if (select count(*) from evolva_trial.grades) <> 1 then raise exception 'RLS: grades leak'; end if;
  if (select count(*) from evolva_trial.payment_installments) <> 3 then raise exception 'RLS: installments leak'; end if;
  if (select count(*) from evolva_trial.payment_submissions) <> 0 then raise exception 'RLS: payments leak'; end if;
  if (select count(*) from evolva_trial.student_identity) <> 1 then raise exception 'RLS: own identity inaccessible'; end if;
  if (select count(*) from evolva_trial.documents) <> 1 then raise exception 'RLS: document leak'; end if;
  d := public.evolva_trial_dashboard();
  if (d #>> '{student,matricula}') is distinct from 'EVOLVA-000001' then raise exception 'Wrong matrícula'; end if;
  if (d #>> '{student,institutional}') is distinct from '000001@evolvacademy.mx' then raise exception 'Wrong institutional email'; end if;
  if (d->>'average')::numeric is distinct from 8.5 then raise exception 'Wrong average'; end if;
  if jsonb_array_length(d->'paymentCalendar') is distinct from 3 then raise exception 'Missing calendar'; end if;
  if (d #>> '{academicAccess,blocked}')::boolean is distinct from false then raise exception 'Wrong payment state'; end if;
  if d::text like '%DEMO000000XXXXXXXX%' then raise exception 'CURP exposed in dashboard'; end if;
  begin
    perform public.evolva_trial_dashboard(current_setting('evolva_trial_test.enrollment_b')::uuid);
    raise exception 'Cross-account course was accessible';
  exception when insufficient_privilege then null; end;
  begin
    update evolva_trial.students set matricula = 'EVOLVA-999999';
    raise exception 'Student could change matrícula';
  exception when insufficient_privilege then null; end;
  begin
    update evolva_trial.enrollments set average = 10, certificate_authorized = true;
    raise exception 'Student could change grades/authorization';
  exception when insufficient_privilege then null; end;
  begin
    insert into evolva_trial.payment_submissions(enrollment_id, reference, amount, status)
      select id, 'FORGED', 100, 'approved' from evolva_trial.enrollments;
    raise exception 'Student could approve a payment';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
do $$
declare new_enrollment uuid;
begin
  insert into evolva_trial.enrollments(student_id, course_id, group_code)
    select s.id, c.id, 'REINSCRIPCION-PRUEBA' from evolva_trial.students s cross join evolva_trial.courses c
    where s.matricula = 'EVOLVA-000001' and c.code = 'TRIAL-FIN'
    returning id into new_enrollment;
  perform set_config('evolva_trial_test.enrollment_a2', new_enrollment::text, true);
end $$;
set local role authenticated;
do $$
declare d jsonb;
begin
  d := public.evolva_trial_dashboard(current_setting('evolva_trial_test.enrollment_a2')::uuid);
  if (d #>> '{student,matricula}') is distinct from 'EVOLVA-000001' then raise exception 'Reenrollment changed matrícula'; end if;
  if (d #>> '{student,course}') is distinct from 'Finanzas — curso de prueba' then raise exception 'Wrong reenrollment course'; end if;
end $$;

select set_config('request.jwt.claim.sub', current_setting('evolva_trial_test.user_b'), true);
select set_config('request.jwt.claims', json_build_object('sub', current_setting('evolva_trial_test.user_b'),
  'role', 'authenticated')::text, true);
do $$
declare d jsonb;
begin
  if (select count(*) from evolva_trial.students) <> 1 then raise exception 'RLS: account B leak'; end if;
  if (select count(*) from evolva_trial.student_identity) <> 0 then raise exception 'RLS: other CURP leak'; end if;
  d := public.evolva_trial_dashboard();
  if (d #>> '{student,matricula}') is distinct from 'EVOLVA-000002' then raise exception 'Account switch mixed data'; end if;
  if (d #>> '{academicAccess,blocked}')::boolean is distinct from true then raise exception 'Payment review was ignored'; end if;
  if jsonb_array_length(d->'payments') is distinct from 1 then raise exception 'Missing own payment'; end if;
  begin
    perform public.evolva_trial_dashboard(current_setting('evolva_trial_test.enrollment_a2')::uuid);
    raise exception 'Shared course allowed access to another enrollment';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
select set_config('request.jwt.claims', '{}', true);
do $$
begin
  if (select count(*) from evolva_trial.students) <> 0 then raise exception 'Unlinked user saw student data'; end if;
  begin
    perform public.evolva_trial_dashboard();
    raise exception 'Unlinked user could call dashboard';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
update evolva_trial.students set status = 'suspended' where matricula = 'EVOLVA-000002';
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('evolva_trial_test.user_b'), true);
select set_config('request.jwt.claims', json_build_object('sub', current_setting('evolva_trial_test.user_b'),
  'role', 'authenticated')::text, true);
do $$
begin
  if (select count(*) from evolva_trial.students) <> 0 then raise exception 'Suspended account retained access'; end if;
  begin
    perform public.evolva_trial_dashboard();
    raise exception 'Suspended account could call dashboard';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
set local role anon;
do $$
begin
  begin
    perform public.evolva_trial_dashboard();
    raise exception 'Anonymous RPC permitted';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from evolva_trial.students;
    raise exception 'Anonymous table access permitted';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
select 'PASS: ownership, reenrollment retains matrícula, course isolation, CURP isolation, calendar, payment review, readonly permissions, unlinked/suspended/anonymous access' as verification;
rollback;
