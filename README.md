# Sistema de Pesquisa Científica

Um aplicativo completo para gerenciamento de pesquisas acadêmicas e coleta de dados científicos, com suporte offline e sincronização automática.

## Características Principais

### Autenticação e Segurança
- Sistema de login e registro completo
- Recuperação de senha
- Autenticação multi-camadas
- Row Level Security (RLS) no banco de dados
- Validação frontend e backend
- Rate limiting para proteção contra abuso

### Gerenciamento de Pesquisas
- Criar e gerenciar múltiplas pesquisas
- Tipos: acadêmica, científica, artigo, survey
- Status: ativa, concluída, arquivada
- Interface responsiva com menu hambúrguer

### Coleta de Dados
- Formulários dinâmicos personalizáveis
- Tipos de campo: texto, número, data, booleano
- Suporte offline completo
- Sincronização automática quando online

### Funcionalidade Offline
- Armazenamento local com IndexedDB
- Fila de sincronização
- Indicador de status online/offline
- Trabalhe sem conexão, sincronize depois

### Interface Responsiva
- Mobile-first design
- Menu hambúrguer para navegação mobile
- Design adaptável para tablet e desktop
- Tema claro e escuro automático

## Tecnologias Utilizadas

- **Framework**: Next.js 16 (App Router)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: Supabase (PostgreSQL)
- **Validação**: Zod
- **UI**: shadcn/ui + Tailwind CSS v4
- **Offline**: IndexedDB
- **TypeScript**: Tipagem completa

## Estrutura do Projeto

\`\`\`
├── app/
│   ├── auth/              # Páginas de autenticação
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── dashboard/         # Área protegida
│   │   ├── research/      # Gerenciamento de pesquisas
│   │   ├── data-collection/ # Coleta de dados
│   │   ├── reports/       # Relatórios
│   │   └── settings/      # Configurações
│   └── api/              # API Routes
├── components/
│   ├── dashboard/        # Componentes do dashboard
│   ├── offline/          # Componentes offline
│   └── security/         # Componentes de segurança
├── lib/
│   ├── supabase/         # Configuração Supabase
│   ├── validations/      # Schemas Zod
│   ├── security/         # Utilitários de segurança
│   ├── offline/          # Sistema offline
│   └── types/            # TypeScript types
└── scripts/              # Scripts SQL para banco
\`\`\`

## Segurança

O aplicativo implementa múltiplas camadas de segurança:

1. **Autenticação**: JWT tokens seguros via Supabase
2. **Autorização**: Row Level Security no banco de dados
3. **Validação**: Zod no frontend e backend
4. **Sanitização**: Prevenção de XSS
5. **Rate Limiting**: Proteção contra abuso
6. **Criptografia**: HTTPS e hash de senhas

Veja [SECURITY.md](./SECURITY.md) para detalhes completos.

## Como Usar

### 1. Primeiro Acesso
- Clique em "Criar conta"
- Preencha seus dados
- Confirme seu email
- Faça login

### 2. Criar Pesquisa
- Acesse "Minhas Pesquisas"
- Clique em "Nova Pesquisa"
- Preencha título, descrição e tipo
- Salve a pesquisa

### 3. Coletar Dados
- Selecione uma pesquisa
- Clique em "Coletar Dados"
- Adicione campos dinâmicos
- Preencha os valores
- Salve (funciona offline!)

### 4. Visualizar Dados
- Entre na pesquisa
- Clique em "Ver Dados Coletados"
- Exporte para CSV se necessário

### 5. Sincronização
- O status online/offline é mostrado automaticamente
- Dados offline são sincronizados quando a conexão retorna
- Clique em "Sincronizar" para forçar sincronização

## Modo Offline

O aplicativo funciona completamente offline:

- Todas as pesquisas são armazenadas localmente
- Dados coletados são salvos no dispositivo
- Fila de sincronização mantém controle de mudanças
- Indicador visual mostra status de conexão
- Sincronização automática quando online

## Scripts do Banco de Dados

Execute os scripts SQL na ordem:

1. `001_create_profiles_table.sql` - Tabela de perfis
2. `002_create_research_table.sql` - Tabela de pesquisas
3. `003_create_data_collection_table.sql` - Tabela de dados
4. `004_create_research_collaborators_table.sql` - Colaboradores

Todos os scripts incluem Row Level Security (RLS).

## Desenvolvimento Futuro

Funcionalidades planejadas:
- Sistema de relatórios e gráficos
- Exportação avançada (PDF, Excel)
- Colaboração em tempo real
- Templates de pesquisa
- Análise estatística integrada
- Backup automático
- Compartilhamento de pesquisas

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Revise as políticas de segurança
3. Contate o suporte técnico

## Licença

Este projeto é proprietário e confidencial.
