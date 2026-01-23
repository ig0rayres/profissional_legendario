# 🔧 TROUBLESHOOTING - ERRO AO ENVIAR EMAIL

## 🔍 PASSO 1: VERIFICAR CONFIGURAÇÃO SMTP

Vá em: **Supabase Dashboard → Settings → Auth → SMTP Settings**

Confira se está EXATAMENTE assim:

```
✅ SMTP Host: smtp.resend.com
✅ SMTP Port: 587
✅ SMTP Username: resend
✅ SMTP Password: re_XXXXXXXX... (sua API Key)
✅ Sender email: noreply@rotabusiness.com.br
✅ Sender name: Rota Business Club
```

---

## 🔍 PASSO 2: VERIFICAR API KEY DO RESEND

1. Vá no **Resend Dashboard → API Keys**
2. Confirme que a API Key está **ativa** (não deletada)
3. Se tiver dúvida, **GERE NOVA API KEY**
4. Cole a NOVA no Supabase SMTP Password

---

## 🔍 PASSO 3: VERIFICAR SENDER EMAIL

**IMPORTANTE:** O email do sender precisa estar verificado!

### Opção A: Usar domínio Resend (MAIS RÁPIDO)
```
Sender email: noreply@resend.dev  ← Mude para isso temporariamente
```

### Opção B: Verificar seu domínio
1. Resend Dashboard → Domains
2. Adicionar: rotabusiness.com.br
3. Copiar registros DNS
4. Adicionar no Registro.br
5. Aguardar verificação (15min-2h)

---

## 🔍 PASSO 4: TESTAR SMTP

No Supabase, após salvar configurações:

1. Settings → Auth → SMTP Settings
2. Botão "Send test email"
3. Digite seu email
4. Clique "Send"
5. Verifique inbox

---

## ⚠️ ERRO COMUM #1: API KEY INVÁLIDA

**Sintoma:** "Error sending confirmation email"
**Causa:** API Key errada ou expirada
**Solução:**
1. Resend → API Keys → Create new
2. Copie a nova key
3. Cole no Supabase SMTP Password
4. Save

---

## ⚠️ ERRO COMUM #2: SENDER EMAIL NÃO VERIFICADO

**Sintoma:** "Error sending confirmation email"
**Causa:** Email @rotabusiness.com.br não está verificado
**Solução RÁPIDA:**
1. Mude Sender email para: `noreply@resend.dev`
2. Save
3. Funciona imediatamente!

**Solução DEFINITIVA:**
1. Adicione domínio no Resend
2. Configure DNS
3. Aguarde verificação

---

## ⚠️ ERRO COMUM #3: PORT ERRADO

**Sintoma:** Timeout
**Causa:** Porta 465 ou 25 em vez de 587
**Solução:** Use porta **587** (TLS)

---

## 🎯 SOLUÇÃO RÁPIDA AGORA:

1. **Gere NOVA API Key** no Resend
2. **Mude sender email** para `noreply@resend.dev`
3. **Atualize** configuração no Supabase:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [NOVA API KEY]
   Sender: noreply@resend.dev  ← ISSO!
   Name: Rota Business Club
   ```
4. **Save**
5. **Teste** cadastrando novamente

---

## 📧 VERIFICAR LOGS DO RESEND

1. Resend Dashboard → Logs
2. Veja se há tentativas de envio
3. Se houver erros, clique para detalhes

---

## 🔄 SE NADA FUNCIONAR:

**ROLLBACK TEMPORÁRIO:**
1. Supabase → Auth → Providers → Email
2. DESLIGUE "Confirm email"
3. Save
4. Sistema volta a funcionar

Depois ajustamos SMTP com calma.
