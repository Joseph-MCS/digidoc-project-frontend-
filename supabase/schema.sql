-- =====================================================================
-- DigiDoc Database Schema for Supabase
-- Run this in the Supabase SQL Editor (https://supabase.com → SQL Editor)
-- Safe to re-run: drops existing policies before recreating them.
--
-- Design: Multiple GPs can work at one practice (via practice_staff).
--         Patients are registered to one practice at a time.
--         No circular foreign keys.
--
-- Structure: ALL tables created first, THEN all RLS policies,
--            so cross-table references always resolve.
-- =====================================================================


-- ═════════════════════════════════════════════════════════════════════
-- PART A: TABLES & COLUMNS
-- ═════════════════════════════════════════════════════════════════════

-- ─── 1. Profiles (extends auth.users) ───────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'patient' check (role in ('patient', 'gp')),
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;


-- ─── 2. Practices (GP offices — no owner_id, uses join table) ──────
create table if not exists public.practices (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text default '',
  phone text default '',
  eircode text default '',
  created_at timestamptz default now()
);

-- Remove old owner_id column if it exists (from previous schema)
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'practices' and column_name = 'owner_id'
  ) then
    -- Drop any policies that depend on owner_id first
    drop policy if exists "GPs can update own practices" on public.practices;
    drop policy if exists "Practice owner can update" on public.practices;
    drop policy if exists "GPs can view practice submissions" on public.submissions;
    drop policy if exists "GPs can update practice submissions" on public.submissions;
    drop policy if exists "GPs can view practice patients" on public.profiles;
    drop policy if exists "GPs can create practice actions" on public.gp_actions;
    drop policy if exists "GPs can view practice actions" on public.gp_actions;
    alter table public.practices drop column owner_id;
  end if;
end $$;

alter table public.practices enable row level security;


-- ─── 3. Practice Staff (many-to-many: GPs ↔ Practices) ─────────────
create table if not exists public.practice_staff (
  id uuid default gen_random_uuid() primary key,
  practice_id uuid references public.practices(id) on delete cascade not null,
  gp_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'gp' check (role in ('gp', 'admin')),
  created_at timestamptz default now(),
  unique (practice_id, gp_id)
);

alter table public.practice_staff enable row level security;

create index if not exists idx_practice_staff_gp on public.practice_staff(gp_id);
create index if not exists idx_practice_staff_practice on public.practice_staff(practice_id);


-- ─── 4. Add practice_id to profiles (patient → practice) ───────────
alter table public.profiles
  add column if not exists practice_id uuid references public.practices(id);

create index if not exists idx_profiles_practice on public.profiles(practice_id);


-- ─── 5. Submissions (patient symptom submissions) ───────────────────
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  age integer not null,
  gender text not null,
  body_areas text[] not null default '{}',
  selected_symptoms text[] not null default '{}',
  duration text not null,
  severity integer not null,
  additional_info text default '',
  triage_level text not null default 'green' check (triage_level in ('green', 'amber', 'red')),
  status text not null default 'pending-review' check (status in ('pending-review', 'reviewed', 'discharged')),
  created_at timestamptz default now()
);

alter table public.submissions enable row level security;


-- ─── 6. GP Actions (review notes, referrals, prescriptions) ────────
create table if not exists public.gp_actions (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  gp_id uuid references public.profiles(id) not null,
  action_type text not null check (action_type in ('review', 'note', 'prescribe', 'refer', 'discharge', 'follow-up')),
  notes text default '',
  created_at timestamptz default now()
);

alter table public.gp_actions enable row level security;


-- ─── 7. Auto-create profile on signup ───────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, first_name, last_name, practice_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'patient'),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    (new.raw_user_meta_data ->> 'practice_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ═════════════════════════════════════════════════════════════════════
-- PART B: DROP OLD POLICIES (safe: IF EXISTS)
-- ═════════════════════════════════════════════════════════════════════

-- profiles
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "GPs can view all profiles" on public.profiles;
drop policy if exists "GPs can view practice patients" on public.profiles;

-- practices
drop policy if exists "Anyone can view practices" on public.practices;
drop policy if exists "GPs can create practices" on public.practices;
drop policy if exists "GPs can update own practices" on public.practices;
drop policy if exists "Staff GPs can update practices" on public.practices;

-- practice_staff
drop policy if exists "GPs can view own staff records" on public.practice_staff;
drop policy if exists "Staff can view practice colleagues" on public.practice_staff;
drop policy if exists "Anyone can view practice staff" on public.practice_staff;

-- submissions
drop policy if exists "Patients can create submissions" on public.submissions;
drop policy if exists "Patients can view own submissions" on public.submissions;
drop policy if exists "GPs can view all submissions" on public.submissions;
drop policy if exists "GPs can view practice submissions" on public.submissions;
drop policy if exists "GPs can update submissions" on public.submissions;
drop policy if exists "GPs can update practice submissions" on public.submissions;

-- gp_actions
drop policy if exists "GPs can create actions" on public.gp_actions;
drop policy if exists "GPs can view actions" on public.gp_actions;
drop policy if exists "GPs can create practice actions" on public.gp_actions;
drop policy if exists "GPs can view practice actions" on public.gp_actions;
drop policy if exists "Patients can view own actions" on public.gp_actions;


-- ═════════════════════════════════════════════════════════════════════
-- PART C: CREATE ALL RLS POLICIES
-- (all tables exist now, so cross-table references are valid)
-- ═════════════════════════════════════════════════════════════════════

-- ─── Profiles policies ──────────────────────────────────────────────
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "GPs can view practice patients"
  on public.profiles for select
  using (
    exists (
      select 1 from public.practice_staff
      where practice_staff.practice_id = profiles.practice_id
        and practice_staff.gp_id = auth.uid()
    )
  );


-- ─── Practices policies ─────────────────────────────────────────────
create policy "Anyone can view practices"
  on public.practices for select
  using (true);

create policy "Staff GPs can update practices"
  on public.practices for update
  using (
    exists (
      select 1 from public.practice_staff
      where practice_staff.practice_id = practices.id
        and practice_staff.gp_id = auth.uid()
    )
  );


-- ─── Practice Staff policies ────────────────────────────────────────
create policy "GPs can view own staff records"
  on public.practice_staff for select
  using (auth.uid() = gp_id);
-- Note: no self-referencing policy here — that causes infinite recursion.


-- ─── Submissions policies ───────────────────────────────────────────
create policy "Patients can create submissions"
  on public.submissions for insert
  with check (auth.uid() = patient_id);

create policy "Patients can view own submissions"
  on public.submissions for select
  using (auth.uid() = patient_id);

create policy "GPs can view practice submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.profiles patient
      join public.practice_staff ps on patient.practice_id = ps.practice_id
      where patient.id = submissions.patient_id
        and ps.gp_id = auth.uid()
    )
  );

create policy "GPs can update practice submissions"
  on public.submissions for update
  using (
    exists (
      select 1 from public.profiles patient
      join public.practice_staff ps on patient.practice_id = ps.practice_id
      where patient.id = submissions.patient_id
        and ps.gp_id = auth.uid()
    )
  );


-- ─── GP Actions policies ────────────────────────────────────────────
create policy "GPs can create practice actions"
  on public.gp_actions for insert
  with check (
    exists (
      select 1 from public.submissions s
      join public.profiles patient on s.patient_id = patient.id
      join public.practice_staff ps on patient.practice_id = ps.practice_id
      where s.id = gp_actions.submission_id
        and ps.gp_id = auth.uid()
    )
  );

create policy "GPs can view practice actions"
  on public.gp_actions for select
  using (
    exists (
      select 1 from public.submissions s
      join public.profiles patient on s.patient_id = patient.id
      join public.practice_staff ps on patient.practice_id = ps.practice_id
      where s.id = gp_actions.submission_id
        and ps.gp_id = auth.uid()
    )
  );

create policy "Patients can view own actions"
  on public.gp_actions for select
  using (
    exists (
      select 1 from public.submissions
      where submissions.id = gp_actions.submission_id
        and submissions.patient_id = auth.uid()
    )
  );


-- ═════════════════════════════════════════════════════════════════════
-- PART D: INDEXES
-- ═════════════════════════════════════════════════════════════════════
create index if not exists idx_submissions_patient on public.submissions(patient_id);
create index if not exists idx_submissions_status on public.submissions(status);
create index if not exists idx_submissions_triage on public.submissions(triage_level);
create index if not exists idx_submissions_created on public.submissions(created_at desc);
create index if not exists idx_gp_actions_submission on public.gp_actions(submission_id);
create index if not exists idx_gp_actions_gp on public.gp_actions(gp_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
