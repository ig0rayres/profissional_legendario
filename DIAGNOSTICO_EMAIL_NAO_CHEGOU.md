# 🔍 DIAGNÓSTICO - EMAIL NÃO CHEGOU

## ✅ CHECKLIST:

### 1. VERIFICAR CONFIGURAÇÃO SMTP NO SUPABASE
- [ ] Supabase → Settings → Auth → SMTP Settings
- [ ] Confirme que está preenchido:
  - Host: smtp.resend.com
  - Port: 587
  - Username: resend
  - Password: [sua API key]
  - Sender: noreply@resend.dev

### 2. VERIFICAR LOGS NO RESEND
- [ ] Acesse: https://resend.com/logs
- [ ] Veja se há tentativa de envio
- [ ] Se houver erro, clique para ver detalhes

### 3. VERIFICAR INBOX
- [ ] Confira **spam/lixo eletrônico**
- [ ] Aguarde até **5 minutos**
- [ ] Email pode demorar

### 4. TESTAR ENVIO MANUAL
No Supabase:
- [ ] Settings → Auth → SMTP Settings
- [ ] Botão "Send test email"
- [ ] Digite SEU email
- [ ] Clique "Send"
- [ ] Verifique se chega

### 5. SE TESTE MANUAL FUNCIONAR:
- Problema é no cadastro (não no SMTP)
- Email de confirmação pode estar desabilitado

### 6. SE TESTE MANUAL NÃO FUNCIONAR:
- API Key do Resend está errada OU expirada
- Gere nova API Key no Resend
- Atualize no Supabase

---

## 🔧 VERIFICAR NO BANCO:

```sql
-- Ver se usuário foi criado
SELECT 
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'zmb4fun@gmail.com';

-- Se email_confirmed_at é NULL = precisa confirmar
-- Se email_confirmed_at tem data = já foi confirmado (não precisa email)
```

---

## ⚡ SOLUÇÃO TEMPORÁRIA:

Confirmar email manualmente no banco:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'zmb4fun@gmail.com';
```

Aí pode fazer login sem confirmar!

---

## 🎯 PRÓXIMOS PASSOS:

1. Verifique SPAM/LIXO
2. Aguarde 5 minutos
3. Veja logs do Resend
4. Teste "Send test email" no Supabase
5. Me diga o resultado!
