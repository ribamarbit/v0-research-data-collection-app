-- Tabela de pesquisas
create table if not exists public.research (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  research_type text check (research_type in ('academic', 'scientific', 'article', 'survey', 'other')),
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  constraint research_title_not_empty check (length(trim(title)) > 0)
);

-- Índices para performance
create index if not exists research_user_id_idx on public.research(user_id);
create index if not exists research_status_idx on public.research(status);
create index if not exists research_created_at_idx on public.research(created_at desc);

-- Habilitar RLS
alter table public.research enable row level security;

-- Políticas RLS para research
create policy "research_select_own"
  on public.research for select
  using (auth.uid() = user_id);

create policy "research_insert_own"
  on public.research for insert
  with check (auth.uid() = user_id);

create policy "research_update_own"
  on public.research for update
  using (auth.uid() = user_id);

create policy "research_delete_own"
  on public.research for delete
  using (auth.uid() = user_id);

-- Função para atualizar timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar updated_at
drop trigger if exists update_research_updated_at on public.research;
create trigger update_research_updated_at
  before update on public.research
  for each row
  execute function update_updated_at_column();
