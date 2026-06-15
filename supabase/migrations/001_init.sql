-- Enable pgvector
create extension if not exists vector;

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Diaries
create table diaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  content text not null,
  emotion_color text default '#C8A2C8',
  emotion_label text default 'neutral',
  emotion_score float default 0.5,
  summaries jsonb default '[]',
  soul_card text,
  cover_image_url text,
  is_sealed boolean default false,
  sealed_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Diary chunks for RAG
create table diary_chunks (
  id uuid default gen_random_uuid() primary key,
  diary_id uuid references diaries(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  chunk_index int default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Memory connections
create table memory_connections (
  id uuid default gen_random_uuid() primary key,
  diary_id uuid references diaries(id) on delete cascade,
  connected_diary_id uuid references diaries(id) on delete cascade,
  connection_type text,
  strength float default 0.5,
  description text,
  created_at timestamptz default now()
);

-- Tags
create table diary_tags (
  id uuid default gen_random_uuid() primary key,
  diary_id uuid references diaries(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  tag text not null,
  created_at timestamptz default now()
);

-- Create indexes
create index diary_chunks_embedding_idx on diary_chunks using ivfflat (embedding vector_cosine_ops);
create index diaries_user_id_idx on diaries(user_id);
create index diary_chunks_user_id_idx on diary_chunks(user_id);

-- RLS
alter table profiles enable row level security;
alter table diaries enable row level security;
alter table diary_chunks enable row level security;
alter table memory_connections enable row level security;
alter table diary_tags enable row level security;

create policy "Users own profile" on profiles for all using (auth.uid() = id);
create policy "Users own diaries" on diaries for all using (auth.uid() = user_id);
create policy "Users own chunks" on diary_chunks for all using (auth.uid() = user_id);
create policy "Users see own connections" on memory_connections for all using (
  auth.uid() = (select user_id from diaries where id = diary_id)
);
create policy "Users own tags" on diary_tags for all using (auth.uid() = user_id);

-- Function to handle new user
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
