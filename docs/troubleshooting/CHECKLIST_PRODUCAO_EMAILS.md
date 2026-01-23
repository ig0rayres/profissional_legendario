# ✅ CHECKLIST CONFIGURAÇÃO EMAILS PARA PRODUÇÃO

## 📌 RESUMO:
Este checklist garante que o sistema suporte CENTENAS de cadastros simultâneos.

---

## ☑️ PASSO 1: CRIAR CONTA RESEND (5 min)
- [ ] Acesse: https://resend.com/signup
- [ ] Crie conta com email real
- [ ] Confirme email
- [ ] Faça login

---

## ☑️ PASSO 2: GERAR API KEY (2 min)
- [ ] Dashboard Resend → "API Keys"
- [ ] Botão "Create API Key"
- [ ] Nome: "Rota Business - Production"
- [ ] Permissão: "Sending access"
- [ ] COPIE a API Key (mostra só uma vez!)
- [ ] Cole num local seguro (ex: arquivo .env local)

Exemplo: `re_AbC123dEf456GhI789`

---

## ☑️ PASSO 3: CONFIGURAR SMTP NO SUPABASE (3 min)
- [ ] Supabase Dashboard → Settings → Auth
- [ ] Clique "SMTP Settings"
- [ ] Preencha:
  ```
  Host: smtp.resend.com
  Port: 587
  User: resend
  Password: [cole sua API KEY aqui]
  Sender email: noreply@rotabusiness.com.br
  Sender name: Rota Business Club
  ```
- [ ] Clique "Save"

---

## ☑️ PASSO 4: ATIVAR CONFIRMAÇÃO DE EMAIL (1 min)
- [ ] Supabase → Authentication → Providers → Email
- [ ] LIGUE o toggle "Confirm email" (verde)
- [ ] Clique "Save changes"

---

## ☑️ PASSO 5: TESTAR (5 min)
- [ ] Vá em `/auth/register`
- [ ] Cadastre com SEU email pessoal
- [ ] Dados exemplo:
  - Nome: Teste Produção
  - Email: seu@email.com
  - CPF: 000.000.000-00
  - Senha: teste123
  - ID Rota: 99999
- [ ] Verifique inbox (pode demorar 1-2min)
- [ ] Confirme que recebeu email
- [ ] Clique no link de confirmação
- [ ] Faça login
- [ ] Verifique `/admin/users` se aparece

---

## ☑️ PASSO 6: VERIFICAR NO BANCO (OPCIONAL)
Execute no Supabase SQL Editor:

```sql
SELECT 
    au.email,
    au.email_confirmed_at,
    p.full_name,
    s.plan_id,
    ug.current_rank_id,
    ug.total_points
FROM auth.users au
JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.subscriptions s ON s.user_id = au.id
LEFT JOIN public.user_gamification ug ON ug.user_id = au.id
WHERE au.email = 'seu@email.com';
```

Deve mostrar:
- ✅ email_confirmed_at preenchido
- ✅ full_name correto
- ✅ plan_id = 'recruta'
- ✅ current_rank_id = 'novato'
- ✅ total_points = 0

---

## ☑️ PASSO 7: (OPCIONAL) DOMÍNIO CUSTOMIZADO
Para emails virem de `@rotabusiness.com.br` em vez de `@resend.dev`:

- [ ] Resend Dashboard → "Domains"
- [ ] Adicionar domínio: rotabusiness.com.br
- [ ] Copiar registros DNS
- [ ] Adicionar no Registro.br (ou seu provedor)
- [ ] Aguardar verificação (15min-2h)

---

## 📊 LIMITES (PLAN GRATUITO):
- ✅ 3.000 emails/mês
- ✅ 100 emails/dia
- ✅ Ilimitados destinatários

**Para 100 cadastros/dia = 33% do limite (muito confortável!)**

---

## 🔄 SE PRECISAR MAIS NO FUTURO:
- Pro: $20/mês = 50.000 emails
- Business: $80/mês = 100.000 emails

---

## ⚠️ ROLLBACK (SE ALGO DER ERRADO):
1. Supabase → Auth → Providers → Email
2. DESLIGUE "Confirm email"
3. Tudo volta ao normal

---

## ✅ O QUE ESTÁ GARANTIDO:
- ✅ Cadastro SEMPRE funciona (com ou sem email)
- ✅ Login SEMPRE funciona
- ✅ Trigger SEMPRE cria profile/subscription/gamification
- ✅ Admin panel SEMPRE mostra usuários
- ✅ Gamificação SEMPRE funciona

---

## 🎯 RESULTADO FINAL:
Sistema pronto para CENTENAS de cadastros simultâneos!
