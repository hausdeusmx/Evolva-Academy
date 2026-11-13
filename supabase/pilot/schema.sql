-- Evolva Academy: isolated, synthetic-data pilot. Not the production migration.
-- Apply to an inspected empty test project with Supabase apply_migration.
-- This schema is not added to PostgREST's exposed schemas.
create schema evolva_trial;
revoke all on schema evolva_trial from public, anon, authenticated;
grant usage on schema evolva_trial to authenticated;

create table evolva_trial.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  matricula text not null unique check (matricula ~ '^EVOLVA-[0-9]{6}$'),
  institutional_email text generated always as
    (substring(matricula from 8) || '@evolvacademy.mx') stored,
  name text not null check (char_length(name) between 1 and 200),
  personal_email text,
  phone text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

create table evolva_trial.student_identity (
  student_id uuid primary key references evolva_trial.students(id),
  curp text check (curp ~ '^[A-Z0-9]{18}$')
);

create table evolva_trial.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null
);

create table evolva_trial.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references evolva_trial.students(id),
  course_id uuid not null references evolva_trial.courses(id),
  source_enrollment_id text unique,
  group_code text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'suspended')),
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  average numeric(4,2) check (average between 0 and 10),
  certificate_authorized boolean not null default false,
  registered_at timestamptz not null default now()
);
create index trial_enrollments_student_idx on evolva_trial.enrollments(student_id, registered_at, id);
create index trial_enrollments_course_idx on evolva_trial.enrollments(course_id);

create table evolva_trial.grades (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references evolva_trial.enrollments(id),
  title text not null,
  score numeric(4,2) not null check (score between 0 and 10),
  created_at timestamptz not null default now()
);
create index trial_grades_enrollment_idx on evolva_trial.grades(enrollment_id, created_at, id);

create table evolva_trial.payment_installments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references evolva_trial.enrollments(id),
  number integer not null check (number > 0),
  period text not null,
  due_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'MXN' check (currency = 'MXN'),
  status text not null default 'scheduled' check (status in ('scheduled', 'paid', 'cancelled')),
  unique (enrollment_id, number)
);

create table evolva_trial.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references evolva_trial.enrollments(id),
  reference text not null,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'in_review' check (status in ('in_review', 'approved', 'rejected')),
  submitted_at timestamptz not null default now()
);
create index trial_submissions_enrollment_idx on evolva_trial.payment_submissions(enrollment_id, status);

-- Metadata only. No real PDFs, photos or public download URLs in the pilot.
create table evolva_trial.documents (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references evolva_trial.enrollments(id),
  kind text not null check (kind in ('identity', 'curp', 'photo', 'certificate', 'receipt', 'report')),
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  storage_path text unique,
  status text not null default 'pending' check (status in ('pending', 'available', 'cancelled')),
  created_at timestamptz not null default now(),
  check (status <> 'available' or storage_path is not null)
);
create index trial_documents_enrollment_idx on evolva_trial.documents(enrollment_id);

alter table evolva_trial.students enable row level security;
alter table evolva_trial.student_identity enable row level security;
alter table evolva_trial.courses enable row level security;
alter table evolva_trial.enrollments enable row level security;
alter table evolva_trial.grades enable row level security;
alter table evolva_trial.payment_installments enable row level security;
alter table evolva_trial.payment_submissions enable row level security;
alter table evolva_trial.documents enable row level security;

create policy trial_own_student on evolva_trial.students for select to authenticated
  using (auth_user_id = (select auth.uid()) and status = 'active');
create policy trial_own_identity on evolva_trial.student_identity for select to authenticated
  using (student_id in (select id from evolva_trial.students));
create policy trial_own_enrollment on evolva_trial.enrollments for select to authenticated
  using (student_id in (select id from evolva_trial.students));
create policy trial_enrolled_course on evolva_trial.courses for select to authenticated
  using (id in (select course_id from evolva_trial.enrollments));
create policy trial_own_grades on evolva_trial.grades for select to authenticated
  using (enrollment_id in (select id from evolva_trial.enrollments));
create policy trial_own_installments on evolva_trial.payment_installments for select to authenticated
  using (enrollment_id in (select id from evolva_trial.enrollments));
create policy trial_own_submissions on evolva_trial.payment_submissions for select to authenticated
  using (enrollment_id in (select id from evolva_trial.enrollments));
create policy trial_own_documents on evolva_trial.documents for select to authenticated
  using (enrollment_id in (select id from evolva_trial.enrollments));

revoke all on all tables in schema evolva_trial from public, anon, authenticated;
grant select on all tables in schema evolva_trial to authenticated;
alter default privileges in schema evolva_trial revoke all on tables from public, anon, authenticated;
alter default privileges in schema evolva_trial revoke execute on functions from public, anon, authenticated;

-- One read for the account, enrollment, grades and payment calendar.
-- SECURITY INVOKER keeps all the table policies in effect.
create function public.evolva_trial_dashboard(p_enrollment_id uuid default null)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  account evolva_trial.students%rowtype;
  enrollment evolva_trial.enrollments%rowtype;
  course evolva_trial.courses%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Inicia sesión para consultar la prueba.' using errcode = '42501';
  end if;
  select * into account from evolva_trial.students where auth_user_id = (select auth.uid());
  if not found then
    raise exception 'No hay una cuenta de prueba activa asociada.' using errcode = '42501';
  end if;
  select * into enrollment from evolva_trial.enrollments
    where student_id = account.id and (p_enrollment_id is null or id = p_enrollment_id)
    order by registered_at, id limit 1;
  if not found then
    raise exception 'El curso no está disponible para esta cuenta.' using errcode = '42501';
  end if;
  select * into course from evolva_trial.courses where id = enrollment.course_id;
  return jsonb_build_object(
    'ok', true, 'trial', true,
    'student', jsonb_build_object('matricula', account.matricula, 'accountFolio', account.matricula,
      'folio', account.matricula, 'name', account.name, 'email', account.personal_email,
      'institutional', account.institutional_email, 'phone', account.phone,
      'course', course.title, 'group', enrollment.group_code, 'status', account.status),
    'enrollmentId', enrollment.id, 'progress', enrollment.progress, 'average', enrollment.average,
    'grades', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'title', g.title, 'score', g.score)
      order by g.created_at, g.id) from evolva_trial.grades g where g.enrollment_id = enrollment.id), '[]'::jsonb),
    'paymentCalendar', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'number', p.number,
      'period', p.period, 'dueDate', p.due_date, 'amount', p.amount, 'currency', p.currency, 'status', p.status)
      order by p.number) from evolva_trial.payment_installments p where p.enrollment_id = enrollment.id), '[]'::jsonb),
    'payments', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'reference', p.reference,
      'amount', p.amount, 'status', p.status) order by p.submitted_at, p.id)
      from evolva_trial.payment_submissions p where p.enrollment_id = enrollment.id), '[]'::jsonb),
    'academicAccess', jsonb_build_object('enforced', true, 'blocked',
      enrollment.status = 'suspended' or exists(select 1 from evolva_trial.payment_submissions p
        where p.enrollment_id = enrollment.id and p.status = 'in_review')),
    'certificate', jsonb_build_object('authorized', enrollment.certificate_authorized,
      'downloadAvailable', false)
  );
end;
$$;
revoke execute on function public.evolva_trial_dashboard(uuid) from public, anon, authenticated, service_role;
grant execute on function public.evolva_trial_dashboard(uuid) to authenticated;
comment on function public.evolva_trial_dashboard(uuid) is
  'Synthetic-data pilot only. Read-only; does not replace the Apps Script campus API.';

-- Synthetic fixtures have no Auth binding: nobody can sign in to them.
insert into evolva_trial.students (matricula, name, personal_email) values
  ('EVOLVA-000001', 'Alumna de prueba Uno', 'alumna.uno@example.invalid'),
  ('EVOLVA-000002', 'Alumno de prueba Dos', 'alumno.dos@example.invalid');
insert into evolva_trial.courses(code, title) values
  ('TRIAL-EXCEL', 'Excel — curso de prueba'), ('TRIAL-FIN', 'Finanzas — curso de prueba');
insert into evolva_trial.enrollments(student_id, course_id, group_code, progress, average)
  select s.id, c.id, 'PRUEBA-01', 50, 8.5 from evolva_trial.students s cross join evolva_trial.courses c
  where s.matricula = 'EVOLVA-000001' and c.code = 'TRIAL-EXCEL';
insert into evolva_trial.enrollments(student_id, course_id, group_code, progress, average)
  select s.id, c.id, 'PRUEBA-02', 25, 6.5 from evolva_trial.students s cross join evolva_trial.courses c
  where s.matricula = 'EVOLVA-000002' and c.code = 'TRIAL-FIN';
insert into evolva_trial.grades(enrollment_id, title, score)
  select e.id, 'Actividad de prueba', e.average from evolva_trial.enrollments e;
insert into evolva_trial.payment_installments(enrollment_id, number, period, due_date, amount)
  select e.id, n, 'Cuota de prueba ' || n, current_date + (n * 7), 100
  from evolva_trial.enrollments e cross join generate_series(1, 3) n;
insert into evolva_trial.payment_submissions(enrollment_id, reference, amount)
  select e.id, 'PRUEBA-SIN-TRANSFERENCIA', 100 from evolva_trial.enrollments e
  join evolva_trial.students s on s.id = e.student_id where s.matricula = 'EVOLVA-000002';
notify pgrst, 'reload schema';
