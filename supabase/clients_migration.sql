-- Run this in your Supabase dashboard → SQL Editor

create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  company_id  uuid references companies(id) on delete set null,
  name        text not null,
  phone       text,
  email       text,
  address     text,
  notes       text,
  created_at  timestamptz default now() not null
);

alter table clients enable row level security;

create policy "Users can manage their own clients"
  on clients for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists clients_user_id_idx on clients(user_id);
