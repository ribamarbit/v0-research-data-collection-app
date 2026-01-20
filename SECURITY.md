# Segurança do Sistema de Pesquisa Científica

Este documento descreve as medidas de segurança implementadas no aplicativo.

## Camadas de Segurança

### 1. Autenticação e Autorização

- **Supabase Auth**: Sistema de autenticação robusto com hash de senhas usando bcrypt
- **JWT Tokens**: Tokens seguros para sessões de usuário
- **Middleware**: Proteção de rotas no lado do servidor
- **Row Level Security (RLS)**: Políticas de segurança no nível do banco de dados

### 2. Validação de Dados

#### Frontend
- Validação com Zod para todos os formulários
- Sanitização de entrada de usuário
- Verificação de tipos de dados

#### Backend
- Validação dupla no servidor
- Rate limiting para prevenir abuso
- Verificação de UUIDs e emails

### 3. Proteção Contra Ataques

#### XSS (Cross-Site Scripting)
- Sanitização de strings antes de exibição
- Escape de caracteres especiais
- Validação de entrada

#### CSRF (Cross-Site Request Forgery)
- Tokens CSRF via Supabase
- Verificação de origem de requisições

#### SQL Injection
- Uso exclusivo de queries parametrizadas
- Row Level Security (RLS) no Supabase
- Validação de entrada

#### Rate Limiting
- 100 requisições por minuto por IP
- Proteção contra ataques DDoS
- Limpeza automática de cache

### 4. Criptografia

- **Senhas**: Hash com bcrypt (via Supabase Auth)
- **Dados em trânsito**: HTTPS obrigatório
- **Tokens**: SHA-256 para tokens de sessão
- **Validação de força de senha**: Requisitos mínimos aplicados

### 5. Banco de Dados

#### Row Level Security (RLS)
Todas as tabelas têm RLS habilitado:

- **profiles**: Usuários só acessam seu próprio perfil
- **research**: Usuários só veem suas próprias pesquisas
- **data_collection**: Acesso restrito aos dados próprios
- **research_collaborators**: Controle de acesso colaborativo

#### Políticas Implementadas
\`\`\`sql
-- Exemplo: Política de SELECT para pesquisas
CREATE POLICY "research_select_own"
  ON research FOR SELECT
  USING (auth.uid() = user_id);
\`\`\`

### 6. Armazenamento Offline

- **IndexedDB**: Armazenamento local seguro
- **Sincronização**: Validação em cada sync
- **Fila**: Proteção contra perda de dados
- **Verificação**: Status de sincronização visível

### 7. API Routes

- Validação de autenticação em cada endpoint
- Rate limiting aplicado
- Sanitização de entrada
- Respostas com códigos HTTP apropriados

## Boas Práticas

### Para Desenvolvedores

1. **Sempre validar entrada**: Nunca confie em dados do cliente
2. **Usar RLS**: Dependa do banco de dados para segurança
3. **Sanitizar saída**: Previna XSS em todas as exibições
4. **Rate limiting**: Proteja endpoints críticos
5. **Logs seguros**: Nunca logue dados sensíveis

### Para Usuários

1. **Senhas fortes**: Mínimo 8 caracteres com letras, números e símbolos
2. **Logout**: Sempre faça logout em dispositivos compartilhados
3. **Verificação de email**: Confirme seu email após registro
4. **Conexão segura**: Use sempre HTTPS
5. **Sincronização**: Sincronize dados regularmente

## Resposta a Incidentes

Em caso de suspeita de violação de segurança:

1. Revogue tokens de sessão afetados
2. Force reset de senha para contas comprometidas
3. Revise logs de acesso
4. Notifique usuários afetados
5. Aplique patches de segurança necessários

## Atualizações de Segurança

- Dependências são auditadas regularmente
- Supabase mantém infraestrutura atualizada
- Patches de segurança são aplicados imediatamente

## Conformidade

- LGPD: Proteção de dados pessoais
- Criptografia de dados sensíveis
- Direito ao esquecimento implementado
- Transparência no uso de dados
