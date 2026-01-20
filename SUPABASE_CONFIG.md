# Configuração do Supabase

Este documento explica como configurar o Supabase para funcionar corretamente com este aplicativo.

## Problema: "Failed to fetch"

Se você está vendo o erro "Failed to fetch" ao tentar acessar o aplicativo, isso significa que o Supabase está bloqueando as requisições vindas do domínio atual.

## Solução: Configurar Redirect URLs

### Passo 1: Acesse o Dashboard do Supabase

1. Vá para https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto que você está usando

### Passo 2: Configure as URLs de Redirecionamento

1. No menu lateral, clique em **Authentication**
2. Clique em **URL Configuration**
3. Na seção **Redirect URLs**, adicione as seguintes URLs:

\`\`\`
http://localhost:3000/**
https://*.vercel.app/**
https://*.vusercontent.net/**
https://v0.app/**
\`\`\`

4. Clique em **Save** para salvar as alterações

### Passo 3: Configure o Site URL

1. Na mesma página, encontre o campo **Site URL**
2. Configure como:
   - **Para desenvolvimento**: `http://localhost:3000`
   - **Para produção**: seu domínio real (ex: `https://meuapp.com`)

### Passo 4: Teste a Conexão

1. Volte ao aplicativo
2. Recarregue a página
3. O erro "Failed to fetch" deve ter desaparecido

## Wildcards Explicados

- `**` - Corresponde a qualquer sequência de caracteres, incluindo barras (/)
- `*` - Corresponde a qualquer sequência de caracteres, exceto barras

Por exemplo:
- `https://*.vercel.app/**` permite qualquer subdomínio do Vercel
- `https://*.vusercontent.net/**` permite previews do v0

## Se o Problema Persistir

Se após configurar as URLs o erro continuar:

1. Verifique se as variáveis de ambiente estão corretas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Aguarde alguns minutos para as configurações do Supabase se propagarem

3. Limpe o cache do navegador e recarregue a página

4. Entre em contato com o suporte do Supabase se necessário

## Segurança

As configurações acima são seguras porque:

1. Usamos Row Level Security (RLS) no banco de dados
2. A chave anônima (anon key) só permite operações autorizadas
3. Cada usuário só pode acessar seus próprios dados

## Mais Informações

Para mais detalhes, consulte:
- [Documentação do Supabase sobre Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Integração Supabase + Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
