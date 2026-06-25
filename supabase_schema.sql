-- ==========================================
-- Schema for SkillGap Analyzer (PostgreSQL)
-- Execute this script in your Supabase SQL Editor.
-- ==========================================

-- 1. ANALYSES TABLE
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null,
  match_pct int not null,
  missing_skills text[] default '{}'::text[],
  present_skills text[] default '{}'::text[],
  extra_skills text[] default '{}'::text[],
  enriched_missing jsonb default '[]'::jsonb,
  radar_data jsonb default '[]'::jsonb,
  current_salary int,
  projected_salary int,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.analyses enable row level security;

-- Policies
create policy "Users can view their own analyses" on public.analyses
  for select using (auth.uid() = user_id);

create policy "Users can insert their own analyses" on public.analyses
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own analyses" on public.analyses
  for update using (auth.uid() = user_id);

create policy "Users can delete their own analyses" on public.analyses
  for delete using (auth.uid() = user_id);


-- 2. SKILLS PROGRESS TABLE
create table if not exists public.skills_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  proficiency text not null default 'Beginner',
  status text not null default 'Not Started',
  last_practiced timestamptz,
  added_date timestamptz default now(),
  unique (user_id, name)
);

-- Enable RLS
alter table public.skills_progress enable row level security;

-- Policies
create policy "Users can view their own skills progress" on public.skills_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert their own skills progress" on public.skills_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own skills progress" on public.skills_progress
  for update using (auth.uid() = user_id);

create policy "Users can delete their own skills progress" on public.skills_progress
  for delete using (auth.uid() = user_id);


-- 3. PROJECTS TABLE
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  difficulty text,
  skills_covered text[] default '{}'::text[],
  why_it_helps text,
  status text not null default 'not_started',
  milestones jsonb default '{}'::jsonb,
  added_date timestamptz default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "Users can view their own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert their own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own projects" on public.projects
  for delete using (auth.uid() = user_id);
