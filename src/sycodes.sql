-- =========================================================
-- ACES / SE CODING COMPETITION
-- Database setup
-- =========================================================

-- 1. Registration ID sequence
create sequence if not exists public.sy_coding_registration_code_seq
  start 1
  increment 1;

-- 2. Registration table
create table if not exists public.sy_coding_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_code text unique not null,
  name text not null,
  email text not null,
  phone text not null,
  roll_number text not null,
  year text not null default 'SY' check (year = 'SY'),
  division text not null,
  batch text not null,
  status text not null default 'REGISTERED' check (status = 'REGISTERED'),
  registered_at timestamptz not null default now()
);

-- 3. One registration per email / phone / roll number
create unique index if not exists sy_coding_email_unique_idx
  on public.sy_coding_registrations (lower(email));

create unique index if not exists sy_coding_phone_unique_idx
  on public.sy_coding_registrations (phone);

create unique index if not exists sy_coding_roll_unique_idx
  on public.sy_coding_registrations (upper(trim(roll_number)));

-- 4. Generate SE26-XXXX IDs automatically
create or replace function public.set_sy_coding_registration_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.registration_code is null or btrim(new.registration_code) = '' then
    new.registration_code := 'SE26-' || lpad(
      nextval('public.sy_coding_registration_code_seq')::text,
      4,
      '0'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists set_sy_coding_registration_code_trigger
on public.sy_coding_registrations;

create trigger set_sy_coding_registration_code_trigger
before insert on public.sy_coding_registrations
for each row
execute function public.set_sy_coding_registration_code();

-- 5. Technical Lead authorization
-- technical@acesdypcoe.club
create or replace function public.is_technical_lead()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) = '14ab1f35-917e-411f-a9ff-5002d0ef907e'::uuid;
$$;

-- 6. Protect the table
alter table public.sy_coding_registrations enable row level security;

revoke all on table public.sy_coding_registrations from anon;
revoke all on table public.sy_coding_registrations from authenticated;

-- Only the Technical Lead can read registrations.
grant select on table public.sy_coding_registrations to authenticated;

 drop policy if exists "Technical lead can view SE coding registrations"
on public.sy_coding_registrations;

create policy "Technical lead can view SE coding registrations"
on public.sy_coding_registrations
for select
to authenticated
using ((select public.is_technical_lead()));

-- 7. Public submission RPC
-- Deadline: 25 September 2026, 12:00 PM IST
create or replace function public.submit_sy_coding_registration(
  p_name text,
  p_email text,
  p_phone text,
  p_roll_number text,
  p_year text,
  p_division text,
  p_batch text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(p_name);
  v_email text := lower(btrim(p_email));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_roll text := upper(btrim(p_roll_number));
  v_division text := upper(btrim(p_division));
  v_batch text := upper(btrim(p_batch));
  v_code text;
begin
  -- Server-side deadline check. The timestamp is IST (+05:30).
  if now() >= timestamptz '2026-09-25 12:00:00+05:30' then
    raise exception using
      errcode = 'P0001',
      message = 'REGISTRATION_CLOSED';
  end if;

  -- The competition is for SY students only.
  if upper(btrim(p_year)) <> 'SY' then
    raise exception using
      errcode = 'P0001',
      message = 'ONLY_SY_ELIGIBLE';
  end if;

  if length(v_name) < 2 then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_NAME';
  end if;

  if v_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_EMAIL';
  end if;

  if v_phone !~ '^\d{10}$' then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_PHONE';
  end if;

  if v_roll = '' or v_division = '' or v_batch = '' then
    raise exception using
      errcode = 'P0001',
      message = 'MISSING_ACADEMIC_DETAILS';
  end if;

  -- Friendly duplicate response before the insert constraint is reached.
  if exists (
    select 1
    from public.sy_coding_registrations
    where lower(email) = v_email
       or phone = v_phone
       or upper(trim(roll_number)) = v_roll
  ) then
    raise exception using
      errcode = '23505',
      message = 'ALREADY_REGISTERED';
  end if;

  insert into public.sy_coding_registrations (
    registration_code,
    name,
    email,
    phone,
    roll_number,
    year,
    division,
    batch,
    status
  )
  values (
    '',
    v_name,
    v_email,
    v_phone,
    v_roll,
    'SY',
    v_division,
    v_batch,
    'REGISTERED'
  )
  returning registration_code into v_code;

  return v_code;

exception
  when unique_violation then
    raise exception using
      errcode = '23505',
      message = 'ALREADY_REGISTERED';
end;
$$;

-- Public students may submit, but cannot directly read the table.
revoke all on function public.submit_sy_coding_registration(text,text,text,text,text,text,text)
from public;

grant execute on function public.submit_sy_coding_registration(text,text,text,text,text,text,text)
to anon, authenticated;

-- Only the authenticated technical lead can use the authorization helper.
revoke all on function public.is_technical_lead()
from public;

grant execute on function public.is_technical_lead()
to authenticated;

-- Function used by the trigger should not be callable by API roles.
revoke all on function public.set_sy_coding_registration_code()
from public;
