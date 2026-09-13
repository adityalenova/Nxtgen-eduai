-- NxtGen Learning: account-owned learning data.
-- Apply in Supabase SQL Editor or through the Supabase CLI after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.learning_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  learning_goal text,
  streak_days integer not null default 0 check (streak_days >= 0),
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  source_count integer not null default 0 check (source_count >= 0),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notebook_id uuid references public.learning_notebooks(id) on delete set null,
  title text not null check (char_length(title) between 1 and 220),
  subject text,
  duration_minutes integer check (duration_minutes between 1 and 720),
  scheduled_for date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('notebook_question', 'quiz_answer', 'focus_session', 'task_complete', 'badge_earned')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists learning_notebooks_user_updated_idx on public.learning_notebooks (user_id, updated_at desc);
create index if not exists study_tasks_user_schedule_idx on public.study_tasks (user_id, scheduled_for);
create index if not exists learning_events_user_created_idx on public.learning_events (user_id, created_at desc);

alter table public.learning_profiles enable row level security;
alter table public.learning_notebooks enable row level security;
alter table public.study_tasks enable row level security;
alter table public.learning_events enable row level security;

create policy "profiles are private to their owner" on public.learning_profiles
  for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "notebooks are private to their owner" on public.learning_notebooks
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks are private to their owner" on public.study_tasks
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "events are private to their owner" on public.learning_events
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
