# 📧 CONFIGURAR RESEND PARA EMAILS DE PRODUÇÃO

## 📋 PASSO 1: CRIAR CONTA RESEND
1. Acesse: https://resend.com/signup
2. Crie conta (grátis)
3. Confirme seu email

## 📋 PASSO 2: ADICIONAR DOMÍNIO (OPCIONAL MAS RECOMENDADO)
**Opção A: Usar seu domínio (rotabusiness.com.br)**
1. Resend Dashboard → "Domains" → "Add Domain"
2. Digite: `rotabusiness.com.br`
3. Copie os registros DNS (SPF, DKIM, DMARC)
4. Adicione no seu provedor de domínio (Registro.br, GoDaddy, etc)
5. Aguarde verificação (15min-2h)

**Opção B: Usar domínio Resend (mais rápido)**
- Emails virão de: `noreply@resend.dev`
- Funciona imediatamente
- Menor confiabilidade para inbox

## 📋 PASSO 3: GERAR API KEY
1. Resend Dashboard → "API Keys"
2. Botão "Create API Key"
3. Nome: "Rota Business Club - Supabase"
4. Permissão: "Sending access"
5. COPIE a API Key (mostra só 1 vez!)

Exemplo: `re_123abc456def789ghi`

## 📋 PASSO 4: CONFIGURAR NO SUPABASE
1. Supabase Dashboard → Settings → Auth → Email
2. Clique em "Set up SMTP"
3. Preencha:

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: [cole sua API key aqui]
Sender email: noreply@rotabusiness.com.br
Sender name: Rota Business Club
```

4. Clique "Save"

## 📋 PASSO 5: REATIVAR CONFIRMAÇÃO DE EMAIL
1. Supabase → Authentication → Providers → Email
2. **LIGUE** o toggle "Confirm email"
3. Save changes

## 📋 PASSO 6: TESTAR
1. Vá em `/auth/register`
2. Cadastre novo usuário com SEU email real
3. Verifique inbox
4. Confirme que recebeu email de confirmação

---

## 📊 LIMITES GRATUITOS:
- ✅ 3.000 emails/mês
- ✅ 100 emails/dia
- ✅ Ilimitados destinatários
- ✅ Todos recursos inclusos

**3.000/mês = 100 cadastros/dia** (se cada um receber 1 email)

---

## 🔄 SE PRECISAR MAIS (FUTURO):
- Plano Pro: $20/mês = 50.000 emails
- Plano Business: $80/mês = 100.000 emails

---

## 🎯 ALTERNATIVAS GRATUITAS:
1. **Mailgun**: 5.000/mês (3 meses grátis, depois pago)
2. **SendGrid**: 100/dia = 3.000/mês (grátis forever)
3. **Gmail SMTP**: 500/dia (precisa app password)

---

## ✅ EMAILS QUE VÃO FUNCIONAR:
- ✅ Confirmação de cadastro
- ✅ Reset de senha
- ✅ Mudança de email
- ✅ Magic link
- ✅ Convites

---

## 📝 PRÓXIMOS PASSOS:
1. [ ] Criar conta Resend
2. [ ] Gerar API Key
3. [ ] Configurar SMTP no Supabase
4. [ ] Testar cadastro
5. [ ] Reativar confirmação de email
6. [ ] (Opcional) Adicionar domínio customizado
