# 🔧 SOLUÇÕES PARA RATE LIMIT DE EMAIL

## 📊 Limites do Supabase (Free Tier):
- **4 emails por hora** por IP
- 100 emails por dia no total

## ✅ OPÇÕES:

### 1️⃣ **Aguardar Reset (1 hora)**
- Espere 1 hora e tente novamente
- O contador reseta automaticamente

### 2️⃣ **Usar Outro Email Provider**
Configurar SMTP customizado (Gmail/SendGrid):
- Supabase Dashboard → Authentication → Email Templates
- Email Provider → "Custom SMTP"

### 3️⃣ **Desabilitar Confirmação de Email (DEV ONLY)**
⚠️ APENAS PARA DESENVOLVIMENTO!

```sql
-- Desabilitar confirmação de email
UPDATE auth.config 
SET email_confirm_required = false;
```

### 4️⃣ **Usar Email Diferente**
- Tente com outro domínio (gmail, outlook, etc)
- Ex: `teste123@gmail.com`

### 5️⃣ **Trocar de IP/Rede**
- Use outro WiFi ou 4G
- Rate limit é por IP

---

## 🎯 **RECOMENDAÇÃO:**
Para testar agora: **Opção 3** (desabilitar confirmação)
Para produção: **Opção 2** (SMTP customizado)

Qual opção prefere?
