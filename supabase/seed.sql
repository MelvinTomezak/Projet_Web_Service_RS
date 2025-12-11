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

-- Subreddits de base
insert into public.subreddits (id, name, description, is_private)
values
  ('00000000-0000-0000-0000-000000000001', 'tech', 'Tech et dev', false),
  ('00000000-0000-0000-0000-000000000002', 'gaming', 'Jeux vidéo', false),
  ('00000000-0000-0000-0000-000000000003', 'news', 'Actualités générales', false)
on conflict (id) do nothing;

-- Seed dynamique basé sur les utilisateurs réellement inscrits (profiles)
-- Il faut au moins 2 users dans public.profiles (créés via Supabase Auth)
do $$
declare
  u1 uuid;
  u2 uuid;
begin
  select id into u1 from public.profiles order by created_at asc limit 1;
  select id into u2 from public.profiles order by created_at asc offset 1 limit 1;

  if u1 is null or u2 is null then
    raise notice 'Seed posts/comments sauté : il faut au moins 2 utilisateurs dans public.profiles';
    return;
  end if;

  -- Membres (owners)
  insert into public.sub_members (user_id, subreddit_id, role) values
    (u1, '00000000-0000-0000-0000-000000000001', 'owner'),
    (u2, '00000000-0000-0000-0000-000000000002', 'owner')
  on conflict do nothing;

  -- Mods / members supplémentaires
  insert into public.sub_members (user_id, subreddit_id, role) values
    (u2, '00000000-0000-0000-0000-000000000001', 'mod'),
    (u1, '00000000-0000-0000-0000-000000000002', 'mod'),
    (u1, '00000000-0000-0000-0000-000000000003', 'member'),
    (u2, '00000000-0000-0000-0000-000000000003', 'member')
  on conflict do nothing;

  -- Posts (nouvelles IDs générées)
  insert into public.posts (subreddit_id, author_id, title, content, type, created_at) values
    ('00000000-0000-0000-0000-000000000001', u1, 'Nouveau framework JS', 'Un nouveau framework prometteur...', 'text', now() - interval '2 day'),
    ('00000000-0000-0000-0000-000000000002', u2, 'Patch notes 1.2', 'Équilibrage des classes.', 'text', now() - interval '1 day'),
    ('00000000-0000-0000-0000-000000000003', u1, 'Événement mondial', 'Un fait marquant aujourd''hui...', 'text', now() - interval '5 hour')
  on conflict do nothing;

  -- Votes posts (optionnel)
  insert into public.post_votes (user_id, post_id, value)
  select u2, p.id, 1 from public.posts p where p.title = 'Nouveau framework JS'
  on conflict do nothing;
  insert into public.post_votes (user_id, post_id, value)
  select u1, p.id, 1 from public.posts p where p.title = 'Patch notes 1.2'
  on conflict do nothing;

  -- Recalcule score
  update public.posts
  set score = coalesce((
    select sum(value) from public.post_votes where post_id = posts.id
  ), 0);

  -- Commentaires
  insert into public.comments (post_id, author_id, content, created_at)
  select p.id, u2, 'Hâte d''essayer.', now() - interval '1 day'
  from public.posts p where p.title = 'Nouveau framework JS'
  on conflict do nothing;

  insert into public.comments (post_id, author_id, content, created_at)
  select p.id, u1, 'Merci pour le patch.', now() - interval '8 hour'
  from public.posts p where p.title = 'Patch notes 1.2'
  on conflict do nothing;

  -- Votes commentaires
  insert into public.comment_votes (user_id, comment_id, value)
  select u1, c.id, 1 from public.comments c where c.content like 'Hâte d''essayer.%'
  on conflict do nothing;
end $$;

