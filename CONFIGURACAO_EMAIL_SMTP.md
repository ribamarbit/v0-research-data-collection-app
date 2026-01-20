# Configuração de Email SMTP - Supabase

## Por que os emails não estão chegando?

Por padrão, o Supabase usa um servidor SMTP básico que **só envia emails para membros autorizados** da sua organização (equipe do projeto). Para enviar emails de recuperação de senha para qualquer usuário, você precisa configurar um SMTP customizado.

## Erro que você está vendo:

\`\`\`
Email address not authorized
\`\`\`

Isso significa que o email do destinatário não está na lista de membros da sua organização Supabase.

---

## Solução: Configurar SMTP Customizado

### Opção 1: Gmail SMTP (Gratuito para testes)

#### Passo 1: Gerar Senha de App no Gmail

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança** → **Verificação em duas etapas** (ative se não estiver ativo)
3. Role até **Senhas de app** e clique
4. Selecione **App**: "Email" e **Dispositivo**: "Outro (nome personalizado)"
5. Digite "Supabase" e clique em **Gerar**
6. **Copie a senha de 16 dígitos** gerada

#### Passo 2: Configurar no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates** → **SMTP Settings**
4. Preencha:

\`\`\`
Host: smtp.gmail.com
Port: 587
Sender email: seu-email@gmail.com
Sender name: Seu App de Pesquisa
Username: seu-email@gmail.com
Password: [A senha de app de 16 dígitos]
\`\`\`

5. Clique em **Save**

---

### Opção 2: SendGrid (Recomendado para Produção)

SendGrid oferece **100 emails gratuitos por dia**.

#### Passo 1: Criar Conta SendGrid

1. Acesse [sendgrid.com](https://sendgrid.com) e crie uma conta gratuita
2. Verifique seu email
3. Vá em **Settings** → **API Keys**
4. Clique em **Create API Key**
5. Nome: "Supabase Auth"
6. Permissões: **Full Access** (ou apenas "Mail Send")
7. **Copie a API Key** gerada

#### Passo 2: Configurar no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates** → **SMTP Settings**
4. Preencha:

\`\`\`
Host: smtp.sendgrid.net
Port: 587
Sender email: seu-email@dominio.com
Sender name: Seu App de Pesquisa
Username: apikey
Password: [Sua API Key do SendGrid]
\`\`\`

5. Clique em **Save**

---

### Opção 3: Resend (Alternativa Moderna)

Resend oferece **3.000 emails gratuitos por mês**.

#### Passo 1: Criar Conta Resend

1. Acesse [resend.com](https://resend.com) e crie uma conta
2. Verifique seu domínio (ou use o domínio gratuito deles para testes)
3. Vá em **API Keys** e clique em **Create API Key**
4. **Copie a API Key**

#### Passo 2: Configurar no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates** → **SMTP Settings**
4. Preencha:

\`\`\`
Host: smtp.resend.com
Port: 587
Sender email: onboarding@resend.dev (ou seu domínio verificado)
Sender name: Seu App de Pesquisa
Username: resend
Password: [Sua API Key do Resend]
\`\`\`

5. Clique em **Save**

---

## Testar a Configuração

Após configurar o SMTP:

1. Vá em **Authentication** → **Users**
2. Clique em **Invite user**
3. Digite qualquer email (pode ser seu email pessoal)
4. Clique em **Send invite**
5. Verifique se o email chegou

Se chegou, a configuração está correta!

---

## Solução Temporária (Apenas para Testes)

Se você só quer testar rapidamente sem configurar SMTP:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **Organization** → **Team**
3. Convide o email que você quer testar como membro da organização
4. Agora esse email receberá os emails de recuperação de senha

⚠️ **ATENÇÃO:** Esta solução NÃO funciona para produção, pois você não pode adicionar todos os seus usuários como membros da organização.

---

## Personalizar Templates de Email

Após configurar o SMTP, você pode personalizar os emails:

1. Vá em **Authentication** → **Email Templates**
2. Edite os templates:
   - **Confirm signup** (confirmação de cadastro)
   - **Magic Link** (login sem senha)
   - **Change Email Address** (trocar email)
   - **Reset Password** (recuperar senha) ⭐

Exemplo de personalização para "Reset Password":

\`\`\`html
<h2>Recuperação de Senha</h2>
<p>Olá!</p>
<p>Você solicitou a recuperação de senha para sua conta no App de Pesquisa Científica.</p>
<p>Clique no botão abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
<p>Se você não solicitou esta recuperação, ignore este email.</p>
<p>Este link expira em 24 horas.</p>
\`\`\`

---

## Troubleshooting

### Email ainda não chega?

1. **Verifique a pasta de SPAM/Lixo eletrônico**
2. **Teste com outro provedor de email** (Gmail, Outlook, etc)
3. **Verifique os logs do Supabase:**
   - Vá em **Logs** → **Auth Logs**
   - Procure por erros relacionados a "email" ou "SMTP"

### Erro "Authentication failed"

- Verifique se copiou a senha/API Key corretamente
- No Gmail: certifique-se de usar a **senha de app**, não sua senha normal
- Verifique se a verificação em 2 etapas está ativa no Gmail

### Erro "Connection refused"

- Verifique se a porta está correta (587 ou 465)
- Tente alternar entre TLS e SSL nas configurações

---

## Comparação de Serviços SMTP

| Serviço | Emails Gratuitos | Facilidade | Recomendado Para |
|---------|------------------|------------|-------------------|
| **Gmail** | Limitado | ⭐⭐⭐ | Desenvolvimento/Testes |
| **SendGrid** | 100/dia | ⭐⭐⭐⭐ | Produção (pequeno porte) |
| **Resend** | 3.000/mês | ⭐⭐⭐⭐⭐ | Produção (moderno) |
| **Mailgun** | 5.000/mês | ⭐⭐⭐ | Produção (robusto) |

---

## Próximos Passos

Após configurar o SMTP:

1. ✅ Teste a recuperação de senha
2. ✅ Personalize os templates de email
3. ✅ Configure SPF/DKIM no seu domínio (produção)
4. ✅ Monitore a taxa de entrega de emails
5. ✅ Configure alertas para falhas de envio

---

**Documentação Oficial do Supabase:**
https://supabase.com/docs/guides/auth/auth-smtp
