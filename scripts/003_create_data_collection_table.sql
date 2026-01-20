-- Tabela de coleta de dados
create table if not exists public.data_collection (
  id uuid primary key default gen_random_uuid(),
  research_id uuid not null references public.research(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  field_name text not null,
  field_type text check (field_type in ('text', 'number', 'date', 'boolean', 'select', 'multiselect', 'file')),
  field_value text,
  metadata jsonb default '{}',
  collected_at timestamp with time zone default now(),
  is_synced boolean default false,
  
  constraint data_field_name_not_empty check (length(trim(field_name)) > 0)
);

-- Índices para performance
create index if not exists data_collection_research_id_idx on public.data_collection(research_id);
create index if not exists data_collection_user_id_idx on public.data_collection(user_id);
create index if not exists data_collection_collected_at_idx on public.data_collection(collected_at desc);
create index if not exists data_collection_is_synced_idx on public.data_collection(is_synced);

-- Habilitar RLS
alter table public.data_collection enable row level security;

-- Políticas RLS para data_collection
create policy "data_collection_select_own"
  on public.data_collection for select
  using (auth.uid() = user_id);

create policy "data_collection_insert_own"
  on public.data_collection for insert
  with check (auth.uid() = user_id);

create policy "data_collection_update_own"
  on public.data_collection for update
  using (auth.uid() = user_id);

create policy "data_collection_delete_own"
  on public.data_collection for delete
  using (auth.uid() = user_id);
