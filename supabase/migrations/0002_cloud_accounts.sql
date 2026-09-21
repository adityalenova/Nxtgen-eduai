-- Public multi-user account and workspace storage for NxtGen.
-- Passwords remain in Supabase Auth (auth.users); they are never stored in public tables.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role text not null default 'student' check (role in ('student','teacher','parent')),
  grade text not null default '', language text not null default 'English',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (char_length(kind) between 1 and 60), title text not null check (char_length(title) between 1 and 500),
  data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (char_length(action) between 1 and 120), xp integer not null check (xp between 0 and 100),
  dedupe_key text not null, created_at timestamptz not null default now(), unique(user_id,dedupe_key)
);
create table if not exists public.focus_timers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  minutes integer not null check (minutes between 1 and 180), ends_at timestamptz not null,
  completed boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists records_owner_kind_idx on public.records(user_id,kind,created_at desc);
create index if not exists activity_owner_created_idx on public.activity(user_id,created_at desc);
create index if not exists focus_timers_owner_idx on public.focus_timers(user_id,created_at desc);

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name,role,grade,language) values(
  new.id,coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'),''),split_part(new.email,'@',1),'Learner'),
  case when new.raw_user_meta_data->>'role' in ('student','teacher','parent') then new.raw_user_meta_data->>'role' else 'student' end,
  coalesce(new.raw_user_meta_data->>'grade',''),coalesce(new.raw_user_meta_data->>'language','English')
 ) on conflict(id) do nothing; return new;
end $$;
drop trigger if exists create_nxtgen_profile on auth.users;
create trigger create_nxtgen_profile after insert on auth.users for each row execute function public.create_profile_for_new_user();

create or replace function public.award_activity(event_action text,event_xp integer,event_key text)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or event_key is null or char_length(event_key)>200 or not (
  (event_action='Source added' and event_xp=5) or
  (event_action='Mind map created' and event_xp=10) or
  (event_action='Voice note saved' and event_xp=8) or
  (event_action='Study task completed' and event_xp=5) or
  (event_action='Quiz completed' and event_xp in (10,25,50))
 ) then raise exception 'Invalid activity award'; end if;
 insert into public.activity(user_id,action,xp,dedupe_key) values(auth.uid(),event_action,event_xp,event_key)
 on conflict(user_id,dedupe_key) do nothing;
 return true;
end $$;

create or replace function public.complete_focus_timer(timer_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare changed integer; owner_id uuid;
begin
 update public.focus_timers set completed=true where id=timer_id and user_id=auth.uid() and completed=false and ends_at<=now() returning user_id into owner_id;
 get diagnostics changed=row_count; if changed=0 then return false; end if;
 insert into public.activity(user_id,action,xp,dedupe_key) values(owner_id,'Focus session',20,timer_id::text) on conflict(user_id,dedupe_key) do nothing;
 return true;
end $$;

alter table public.profiles enable row level security;
alter table public.records enable row level security;
alter table public.activity enable row level security;
alter table public.focus_timers enable row level security;
revoke all on table public.profiles,public.records,public.activity,public.focus_timers from anon,authenticated;
grant select,insert,update on table public.profiles to authenticated;
grant select,insert,update,delete on table public.records to authenticated;
grant select on table public.activity to authenticated;
grant select,insert on table public.focus_timers to authenticated;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "records_select_own" on public.records;
drop policy if exists "records_insert_own" on public.records;
drop policy if exists "records_update_own" on public.records;
drop policy if exists "records_delete_own" on public.records;
drop policy if exists "activity_select_own" on public.activity;
drop policy if exists "activity_insert_own" on public.activity;
drop policy if exists "timers_select_own" on public.focus_timers;
drop policy if exists "timers_insert_own" on public.focus_timers;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid()=id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid()=id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);
create policy "records_select_own" on public.records for select to authenticated using (auth.uid()=user_id);
create policy "records_insert_own" on public.records for insert to authenticated with check (auth.uid()=user_id);
create policy "records_update_own" on public.records for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "records_delete_own" on public.records for delete to authenticated using (auth.uid()=user_id);
create policy "activity_select_own" on public.activity for select to authenticated using (auth.uid()=user_id);
create policy "timers_select_own" on public.focus_timers for select to authenticated using (auth.uid()=user_id);
create policy "timers_insert_own" on public.focus_timers for insert to authenticated with check (auth.uid()=user_id);
grant execute on function public.award_activity(text,integer,text) to authenticated;
grant execute on function public.complete_focus_timer(uuid) to authenticated;
revoke execute on function public.award_activity(text,integer,text) from public,anon;
revoke execute on function public.complete_focus_timer(uuid) from public,anon;
