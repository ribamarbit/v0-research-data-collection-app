-- Tabela de colaboradores (opcional - para futuras expansões)
create table if not exists public.research_collaborators (
  id uuid primary key default gen_random_uuid(),
  research_id uuid not null references public.research(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text default 'collaborator' check (role in ('owner', 'editor', 'viewer', 'collaborator')),
  invited_at timestamp with time zone default now(),
  
  unique(research_id, user_id)
);

-- Índices para performance
create index if not exists research_collaborators_research_id_idx on public.research_collaborators(research_id);
create index if not exists research_collaborators_user_id_idx on public.research_collaborators(user_id);

-- Habilitar RLS
alter table public.research_collaborators enable row level security;

-- Políticas RLS para research_collaborators
-- Usuários podem ver colaboradores das pesquisas que eles criaram ou das quais participam
create policy "research_collaborators_select"
  on public.research_collaborators for select
  using (
    auth.uid() = user_id 
    or 
    exists (
      select 1 from public.research 
      where research.id = research_collaborators.research_id 
      and research.user_id = auth.uid()
    )
  );

-- Apenas o dono da pesquisa pode adicionar colaboradores
create policy "research_collaborators_insert"
  on public.research_collaborators for insert
  with check (
    exists (
      select 1 from public.research 
      where research.id = research_collaborators.research_id 
      and research.user_id = auth.uid()
    )
  );

-- Apenas o dono da pesquisa pode remover colaboradores
create policy "research_collaborators_delete"
  on public.research_collaborators for delete
  using (
    exists (
      select 1 from public.research 
      where research.id = research_collaborators.research_id 
      and research.user_id = auth.uid()
    )
  );
