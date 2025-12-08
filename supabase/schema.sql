-- Schema Supabase simplifié pour un Reddit-like
-- Tables : subreddits, rôles, users, posts, comments, votes

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Profils (utilisateurs)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Rôles globaux (optionnel admin)
create table if not exists public.roles (
  id serial primary key,
  name text unique not null
);

create table if not exists public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role_id int references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- Subreddits et adhésions
do $$
begin
  create type public.sub_role as enum ('owner','mod','member');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.subreddits (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sub_members (
  user_id uuid not null references public.profiles(id) on delete cascade,
  subreddit_id uuid not null references public.subreddits(id) on delete cascade,
  role public.sub_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (user_id, subreddit_id)
);

-- Posts
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

-- Commentaires
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  score int not null default 0,
  created_at timestamptz not null default now()
);

-- Votes
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

-- Index
create index if not exists idx_posts_sub_created_at on public.posts (subreddit_id, created_at desc);
create index if not exists idx_comments_post_created_at on public.comments (post_id, created_at);
create index if not exists idx_sub_members_sub on public.sub_members (subreddit_id);

----------------------------------------------------------------
-- RLS
----------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.subreddits enable row level security;
alter table public.sub_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_votes enable row level security;
alter table public.comment_votes enable row level security;

-- Profils
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Subreddits : lecture publique si non privé, sinon membres
drop policy if exists "subreddits_select" on public.subreddits;
create policy "subreddits_select" on public.subreddits
  for select using (
    is_private = false
    or exists (
      select 1 from public.sub_members m
      where m.subreddit_id = id and m.user_id = auth.uid()
    )
  );

drop policy if exists "subreddits_insert" on public.subreddits;
create policy "subreddits_insert" on public.subreddits
  for insert with check (auth.uid() is not null);

-- Membres
drop policy if exists "sub_members_select" on public.sub_members;
create policy "sub_members_select" on public.sub_members
  for select using (
    exists (
      select 1 from public.sub_members m2
      where m2.subreddit_id = subreddit_id and m2.user_id = auth.uid()
    )
  );

drop policy if exists "sub_members_insert" on public.sub_members;
create policy "sub_members_insert" on public.sub_members
  for insert with check (
    exists (
      select 1 from public.sub_members m
      where m.subreddit_id = subreddit_id
        and m.user_id = auth.uid()
        and m.role in ('owner','mod')
    )
  );

drop policy if exists "sub_members_update" on public.sub_members;
create policy "sub_members_update" on public.sub_members
  for update using (
    exists (
      select 1 from public.sub_members m
      where m.subreddit_id = subreddit_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- Posts
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts
  for select using (
    exists (
      select 1 from public.subreddits s
      where s.id = subreddit_id
        and (
          s.is_private = false
          or exists (
            select 1 from public.sub_members m
            where m.subreddit_id = s.id and m.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts
  for insert with check (
    auth.uid() is not null
    and exists (
      select 1 from public.sub_members m
      where m.subreddit_id = subreddit_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "posts_update_delete" on public.posts;
create policy "posts_update_delete" on public.posts
  for all using (
    (author_id = auth.uid())
    or exists (
      select 1 from public.sub_members m
      where m.subreddit_id = subreddit_id
        and m.user_id = auth.uid()
        and m.role in ('owner','mod')
    )
  );

-- Comments
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments
  for select using (
    exists (
      select 1 from public.posts p
      join public.subreddits s on s.id = p.subreddit_id
      where p.id = post_id
        and (
          s.is_private = false
          or exists (
            select 1 from public.sub_members m
            where m.subreddit_id = s.id and m.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments
  for insert with check (
    auth.uid() is not null
    and exists (
      select 1 from public.posts p
      where p.id = post_id
      and exists (
        select 1 from public.sub_members m
        where m.subreddit_id = p.subreddit_id and m.user_id = auth.uid()
      )
    )
  );

drop policy if exists "comments_update_delete" on public.comments;
create policy "comments_update_delete" on public.comments
  for all using (
    (author_id = auth.uid())
    or exists (
      select 1 from public.posts p
      join public.sub_members m on m.subreddit_id = p.subreddit_id
      where p.id = post_id
        and m.user_id = auth.uid()
        and m.role in ('owner','mod')
    )
  );

-- Votes posts
drop policy if exists "post_votes_upsert" on public.post_votes;
create policy "post_votes_upsert" on public.post_votes
  for all using (
    auth.uid() is not null
    and exists (
      select 1 from public.posts p
      where p.id = post_id
      and exists (
        select 1 from public.sub_members m
        where m.subreddit_id = p.subreddit_id and m.user_id = auth.uid()
      )
    )
  ) with check (value in (-1,0,1));

-- Votes comments
drop policy if exists "comment_votes_upsert" on public.comment_votes;
create policy "comment_votes_upsert" on public.comment_votes
  for all using (
    auth.uid() is not null
    and exists (
      select 1 from public.comments c2
      join public.posts p on p.id = c2.post_id
      where c2.id = comment_id
      and exists (
        select 1 from public.sub_members m
        where m.subreddit_id = p.subreddit_id and m.user_id = auth.uid()
      )
    )
  ) with check (value in (-1,0,1));

-- Remarque : ajouter un trigger signup -> insert dans public.profiles.

