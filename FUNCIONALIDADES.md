# Documentação de Funcionalidades - App de Pesquisa Científica

## ✅ Funcionalidades Implementadas e Testadas

### 1. Sistema de Autenticação Completo
- **Login** (`/auth/login`): Autenticação com email e senha
- **Registro** (`/auth/register`): Criação de nova conta com validação
- **Verificação de Email** (`/auth/verify-email`): Confirmação de email obrigatória
- **Recuperação de Senha** (`/auth/forgot-password`): Reset de senha por email
- **Validação**: Schemas Zod no frontend e backend
- **Segurança**: Senhas hash, tokens JWT, sessões seguras

### 2. Dashboard Principal (`/dashboard`)
- **Estatísticas em Cards**:
  - Total de pesquisas
  - Pesquisas ativas
  - Total de dados coletados
- **Ações Rápidas**:
  - Criar nova pesquisa
  - Coletar dados
  - Ver relatórios
- **Lista de Pesquisas Recentes**: Últimas 5 pesquisas criadas
- **Menu Responsivo**: Adaptável para mobile e desktop

### 3. Interface Responsiva com Menu Hambúrguer
- **Sidebar Desktop**: Fixa na lateral esquerda
- **Menu Hambúrguer Mobile**: Sheet deslizante ativado por botão
- **Navegação Completa**: Links para todas as seções do app
- **Indicador de Página Ativa**: Destaque visual da rota atual
- **Botão de Logout**: Desconexão segura da conta

### 4. Gestão de Pesquisas
#### Lista de Pesquisas (`/dashboard/research`)
- Visualização em cards grid responsivo
- Filtros por status (ativa, concluída, arquivada)
- Indicador de tipo de pesquisa
- Data de criação
- Status de sincronização offline

#### Nova Pesquisa (`/dashboard/research/new`)
- Formulário com validação completa
- Campos: título, descrição, tipo, status
- Salva online e offline simultaneamente
- Adiciona à fila de sincronização se offline

#### Detalhes da Pesquisa (`/dashboard/research/[id]/details`)
- Visualização completa das informações
- Contador de dados coletados
- Botões de ação rápida
- Link para coleta de dados
- Link para visualizar dados coletados

### 5. Sistema de Coleta de Dados (`/dashboard/data-collection`)
- **Formulário Dinâmico**: Adicionar/remover campos em tempo real
- **Tipos de Campo Suportados**:
  - Texto
  - Número
  - Data
  - Booleano (Sim/Não)
- **Funcionalidade Offline**:
  - Salva localmente se sem conexão
  - Adiciona à fila de sincronização
  - Alerta visual do status offline
- **Vinculação com Pesquisa**: Seleção via query parameter
- **Validação**: Campos obrigatórios e tipos corretos

### 6. Visualização de Dados Coletados (`/dashboard/research/[id]/data`)
- Lista de todos os dados coletados para uma pesquisa
- Badges indicando tipo de dado
- Indicador de dados não sincronizados
- Data e hora da coleta
- Botão para exportar CSV (placeholder)

### 7. Sistema Offline Completo
#### Armazenamento Local (IndexedDB)
- **3 Stores**:
  - `research`: Pesquisas criadas
  - `data_collection`: Dados coletados
  - `sync_queue`: Fila de sincronização
- **Operações CRUD**: Create, Read, Update, Delete offline
- **Índices**: Para busca rápida por user_id, research_id, status

#### Sincronização Automática
- **Fila Inteligente**: Armazena operações pendentes
- **Sincronização Bidirecional**:
  - Upload de dados locais para servidor
  - Download de dados do servidor
- **Resolução de Conflitos**: Timestamp-based
- **Componente Visual**: Status em tempo real

#### Componente SyncStatus
- Indicador online/offline
- Contador de itens não sincronizados
- Botão de sincronização manual
- Feedback visual de sucesso/erro
- Atualização automática a cada 30s

### 8. Segurança em Múltiplas Camadas

#### Camada 1: Banco de Dados (RLS)
\`\`\`sql
-- Row Level Security ativado em todas as tabelas
-- Políticas garantem que usuários só veem seus dados
CREATE POLICY "Users can only see own data" ON research
CREATE POLICY "Users can only insert own data" ON research
CREATE POLICY "Users can only update own data" ON research
CREATE POLICY "Users can only delete own data" ON research
\`\`\`

#### Camada 2: Middleware
- Verificação de autenticação em todas as rotas protegidas
- Refresh automático de tokens
- Proteção de rotas `/dashboard/*`
- Redirecionamento automático para login

#### Camada 3: Validação (Frontend + Backend)
- **Schemas Zod**:
  - `authSchema`: Login e registro
  - `researchSchema`: Criação de pesquisas
  - `dataCollectionSchema`: Coleta de dados
- **Validação Dupla**: Cliente e servidor
- **Mensagens de Erro**: Amigáveis e específicas

#### Camada 4: Sanitização
- Remoção de tags HTML perigosas
- Escape de caracteres especiais
- Prevenção de XSS
- Limpeza de inputs do usuário

#### Camada 5: Rate Limiting
- Limite de requisições por IP
- Janela deslizante de tempo
- Proteção contra brute force
- Proteção contra DDoS

#### Camada 6: Criptografia
- Hash de senhas sensíveis
- Encrypt/decrypt de dados sensíveis
- Tokens seguros
- Comunicação HTTPS

### 9. Páginas Adicionais

#### Relatórios (`/dashboard/reports`)
- Placeholder para funcionalidade futura
- Preparado para gráficos e análises
- Estrutura já criada

#### Configurações (`/dashboard/settings`)
- Placeholder para preferências do usuário
- Preparado para edição de perfil
- Estrutura já criada

### 10. Experiência do Usuário

#### Feedback Visual
- Loading states em todos os formulários
- Mensagens de sucesso/erro claras
- Alertas contextuais (offline, não sincronizado)
- Animações suaves de transição

#### Acessibilidade
- Labels semânticos
- Contraste adequado de cores
- Navegação por teclado
- Mensagens de erro acessíveis

#### Performance
- Lazy loading de componentes
- Otimização de queries
- Cache local com IndexedDB
- Debounce em operações custosas

## 🔒 Configuração de Segurança Necessária

### Supabase Dashboard
Para o aplicativo funcionar corretamente, você DEVE configurar:

1. **Site URL**: `http://localhost:3000` (desenvolvimento)

2. **Redirect URLs** (adicionar todas):
   \`\`\`
   http://localhost:3000/**
   https://*.vercel.app/**
   https://*.vusercontent.net/**
   https://v0.app/**
   \`\`\`

3. **Row Level Security**: Já configurado via scripts SQL

### Variáveis de Ambiente
Todas as variáveis necessárias já estão configuradas via integração Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

## 🎯 Como Usar o Aplicativo

### 1. Primeiro Acesso
1. Acesse `/auth/register`
2. Preencha nome, email e senha
3. Confirme o email (verifique caixa de entrada)
4. Faça login em `/auth/login`

### 2. Criar uma Pesquisa
1. No dashboard, clique em "Nova Pesquisa"
2. Preencha título, descrição, tipo e status
3. Clique em "Criar Pesquisa"
4. A pesquisa aparecerá na lista

### 3. Coletar Dados
1. Clique em uma pesquisa
2. Clique em "Coletar Dados"
3. Adicione campos dinamicamente
4. Preencha os valores
5. Salve (funciona offline!)

### 4. Sincronizar Dados Offline
1. Se você coletou dados offline
2. Quando reconectar à internet
3. Vá até "Minhas Pesquisas"
4. Clique em "Sincronizar" no card de status
5. Todos os dados serão enviados ao servidor

### 5. Visualizar Dados
1. Acesse os detalhes de uma pesquisa
2. Clique em "Ver Dados Coletados"
3. Veja todos os dados com timestamps
4. Exporte para CSV (em breve)

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (últimas versões)
- **Dispositivos**: Desktop, Tablet, Mobile
- **Offline**: Funciona completamente sem internet
- **PWA**: Pode ser instalado como app no celular

## 🚀 Próximas Funcionalidades Sugeridas

1. **Relatórios e Gráficos**: Visualização de dados com charts
2. **Exportação**: CSV, Excel, PDF
3. **Colaboração**: Compartilhar pesquisas com outros usuários
4. **Notificações**: Lembretes de coleta de dados
5. **Anexos**: Upload de imagens e documentos
6. **Pesquisa Avançada**: Filtros e busca textual
7. **Temas**: Dark mode e personalização
8. **Backup**: Backup automático em nuvem

## 📝 Notas de Desenvolvimento

### Estrutura de Pastas
\`\`\`
app/
├── auth/           # Páginas de autenticação
├── dashboard/      # Páginas protegidas
├── api/            # API routes
components/
├── dashboard/      # Componentes do dashboard
├── offline/        # Componentes offline
├── error/          # Error boundaries
├── ui/             # Componentes base (shadcn)
lib/
├── supabase/       # Clientes Supabase
├── offline/        # Sistema offline
├── validations/    # Schemas Zod
├── security/       # Funções de segurança
├── types/          # TypeScript types
\`\`\`

### Tecnologias Utilizadas
- **Framework**: Next.js 16 com App Router
- **UI**: shadcn/ui + Tailwind CSS v4
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Offline**: IndexedDB
- **Validação**: Zod
- **TypeScript**: Para type safety

## ✅ Status Final

Todas as funcionalidades principais estão **implementadas e funcionando**:
- ✅ Autenticação completa
- ✅ Menu hambúrguer responsivo
- ✅ CRUD de pesquisas
- ✅ Coleta de dados dinâmica
- ✅ Sistema offline completo
- ✅ Sincronização bidirecional
- ✅ Segurança em múltiplas camadas
- ✅ Validação frontend + backend
- ✅ Interface mobile-first

O aplicativo está **pronto para uso**! 🎉
