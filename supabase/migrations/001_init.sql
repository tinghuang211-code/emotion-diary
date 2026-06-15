-- Enable pgvector extension
create extension if not exists vector;

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Diaries table
create table if not exists diaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  content text not null default '',
  emotion_color text default '#C8A2C8',
  emotion_label text default 'neutral',
  emotion_score float default 0.5,
  summaries jsonb default '[]'::jsonb,
  soul_card text,
  cover_image_url text,
  is_sealed boolean default false,
  sealed_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Diary chunks for RAG
create table if not exists diary_chunks (
  id uuid default gen_random_uuid() primary key,
  diary_id uuid references diaries(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  chunk_index int default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Memory connections
create table if not exists memory_connections (
  id uuid default gen_random_uuid() primary key,
  diary_id uuid references diaries(id) on delete cascade,
  connected_diary_id uuid references diaries(id) on delete cascade,
  connection_type text default 'theme',
  strength float default 0.5,
  description text,
  created_at timestamptz default now()
);

-- Diary tags
create table if not exists diary_tags (
  id uuid default gen_random_uuid() primary key,
  diary_id uuid references diaries(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  tag text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists diaries_user_id_idx on diaries(user_id);
create index if not exists diaries_created_at_idx on diaries(created_at desc);
create index if not exists diary_chunks_user_id_idx on diary_chunks(user_id);
create index if not exists diary_chunks_diary_id_idx on diary_chunks(diary_id);
create index if not exists memory_connections_diary_id_idx on memory_connections(diary_id);
create index if not exists diary_tags_user_id_idx on diary_tags(user_id);
create index if not exists diary_tags_diary_id_idx on diary_tags(diary_id);

-- RLS
alter table profiles enable row level security;
alter table diaries enable row level security;
alter table diary_chunks enable row level security;
alter table memory_connections enable row level security;
alter table diary_tags enable row level security;

create policy "Users own their profile" on profiles
  for all using (auth.uid() = id);

create policy "Users own their diaries" on diaries
  for all using (auth.uid() = user_id);

create policy "Users own their chunks" on diary_chunks
  for all using (auth.uid() = user_id);

create policy "Users see own connections" on memory_connections
  for all using (
    auth.uid() = (select user_id from diaries where id = diary_id)
  );

create policy "Users own their tags" on diary_tags
  for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists diaries_updated_at on diaries;
create trigger diaries_updated_at
  before update on diaries
  for each row execute procedure update_updated_at();
