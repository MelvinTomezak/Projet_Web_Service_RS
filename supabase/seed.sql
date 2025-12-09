-- Seed de données de test pour le Reddit-like
-- Ajuste les UUID des users si besoin

-- Garantir les extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Garantir les tables minimales (au cas où le schema n'a pas été appliqué)
create table if not exists public.subreddits (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

do $$
begin
  create type public.sub_role as enum ('owner','mod','member');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.sub_members (
  user_id uuid not null references public.profiles(id) on delete cascade,
  subreddit_id uuid not null references public.subreddits(id) on delete cascade,
  role public.sub_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (user_id, subreddit_id)
);

do $$
begin
  create type public.post_type as enum ('text','link','image');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  subreddit_id uuid not null references public.subreddits(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text,
  type public.post_type not null default 'text',
  media_urls text[],
  score int not null default 0,
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Harmonisation si ancienne colonne community_id existait
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'community_id'
  ) then
    alter table public.posts rename column community_id to subreddit_id;
  end if;
end $$;

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  score int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.post_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  value int not null check (value in (-1,0,1)),
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.comment_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  value int not null check (value in (-1,0,1)),
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

-- Users connus (inscrits via Supabase Auth)
-- Remplace par tes propres ids si nécessaire
with users as (
  select *
  from (
    values
      ('240c97f4-b382-4e67-b65e-0ca76eb32785'::uuid, 'alice'),
      ('98d90d05-3877-4a30-8c2c-10b939ec4cc4'::uuid, 'bob')
  ) as t(id, username)
)
insert into public.profiles (id, username)
select id, username from users
on conflict (id) do nothing;

-- Subreddits
insert into public.subreddits (id, name, description, is_private)
values
  ('00000000-0000-0000-0000-000000000001', 'tech', 'Tech et dev', false),
  ('00000000-0000-0000-0000-000000000002', 'gaming', 'Jeux vidéo', false),
  ('00000000-0000-0000-0000-000000000003', 'news', 'Actualités générales', false)
on conflict (id) do nothing;

-- Membres (owners)
insert into public.sub_members (user_id, subreddit_id, role)
values
  ('240c97f4-b382-4e67-b65e-0ca76eb32785', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('98d90d05-3877-4a30-8c2c-10b939ec4cc4', '00000000-0000-0000-0000-000000000002', 'owner')
on conflict do nothing;

-- Mods / members supplémentaires
insert into public.sub_members (user_id, subreddit_id, role) values
  ('98d90d05-3877-4a30-8c2c-10b939ec4cc4', '00000000-0000-0000-0000-000000000001', 'mod'),
  ('240c97f4-b382-4e67-b65e-0ca76eb32785', '00000000-0000-0000-0000-000000000002', 'mod'),
  ('240c97f4-b382-4e67-b65e-0ca76eb32785', '00000000-0000-0000-0000-000000000003', 'member'),
  ('98d90d05-3877-4a30-8c2c-10b939ec4cc4', '00000000-0000-0000-0000-000000000003', 'member')
on conflict do nothing;

-- Posts
insert into public.posts (id, subreddit_id, author_id, title, content, type, created_at)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001',
    '240c97f4-b382-4e67-b65e-0ca76eb32785', 'Nouveau framework JS', 'Un nouveau framework prometteur...', 'text', now() - interval '2 day'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002',
    '98d90d05-3877-4a30-8c2c-10b939ec4cc4', 'Patch notes 1.2', 'Équilibrage des classes.', 'text', now() - interval '1 day'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003',
    '240c97f4-b382-4e67-b65e-0ca76eb32785', 'Événement mondial', 'Un fait marquant aujourd''hui...', 'text', now() - interval '5 hour')
on conflict (id) do nothing;

-- Votes posts
insert into public.post_votes (user_id, post_id, value) values
  ('98d90d05-3877-4a30-8c2c-10b939ec4cc4', '11111111-1111-1111-1111-111111111111', 1),
  ('240c97f4-b382-4e67-b65e-0ca76eb32785', '22222222-2222-2222-2222-222222222222', 1)
on conflict do nothing;

-- Recalcule score
update public.posts
set score = coalesce((
  select sum(value) from public.post_votes where post_id = posts.id
), 0);

-- Commentaires
insert into public.comments (id, post_id, author_id, content, created_at) values
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
    '98d90d05-3877-4a30-8c2c-10b939ec4cc4', 'Hâte d''essayer.', now() - interval '1 day'),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222',
    '240c97f4-b382-4e67-b65e-0ca76eb32785', 'Merci pour le patch.', now() - interval '8 hour')
on conflict do nothing;

-- Votes commentaires
insert into public.comment_votes (user_id, comment_id, value) values
  ('240c97f4-b382-4e67-b65e-0ca76eb32785', '44444444-4444-4444-4444-444444444444', 1)
on conflict do nothing;

