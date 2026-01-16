# 🔐 CREDENCIAIS DE TESTE - COMPLETAS

## 👑 **ADMIN:**
```
Email: admin@rotaclub.com
Senha: Admin@2024
Acesso: http://localhost:3000/admin
```

---

## 📊 **USUÁRIOS DE TESTE POR PLANO:**

### 🥉 **RECRUTA** (Plano Gratuito)
```
Email: recruta@teste.com
Senha: Teste@2024
Plano: Recruta (Gratuito)
```

### 🥈 **VETERANO** (Plano Intermediário - R$ 47/mês)
```
Email: veterano@teste.com
Senha: Teste@2024
Plano: Veterano (R$ 47/mês)
```

### 🥇 **ELITE** (Plano Premium - R$ 147/mês)
```
Email: elite@teste.com
Senha: Teste@2024
Plano: Elite (R$ 147/mês)
```

---

## 🛠️ **COMO CRIAR AS CONTAS:**

### **Método 1 - Via Interface (Recomendado):**
1. Acesse http://localhost:3000/auth/register
2. Registre cada usuário:
   - **Recruta:** Nome: "Usuario Recruta", Email: recruta@teste.com, CPF: 11111111111
   - **Veterano:** Nome: "Usuario Veterano", Email: veterano@teste.com, CPF: 22222222222
   - **Elite:** Nome: "Usuario Elite", Email: elite@teste.com, CPF: 33333333333
3. Senha para todos: `Teste@2024`
4. Execute o script `CRIAR_CONTAS_TESTE_PLANOS.sql` para confirmar os emails

### **Método 2 - Via Supabase Dashboard:**
1. Supabase Dashboard > Authentication > Add User
2. Adicione os 3 emails com senha `Teste@2024`
3. Execute o script `CRIAR_CONTAS_TESTE_PLANOS.sql` para:
   - Confirmar emails
   - Criar perfis
   - Associar aos planos

---

## ✅ **VERIFICAR SE FUNCIONOU:**

Execute no Supabase SQL Editor:
```sql
SELECT 
    p.email,
    p.full_name,
    p.role,
    p.verification_status
FROM public.profiles p
WHERE p.email IN (
    'recruta@teste.com', 
    'veterano@teste.com', 
    'elite@teste.com'
)
ORDER BY p.email;
```

Deve mostrar 3 linhas com status 'verified' ✅

---

## 🎯 **TESTAR:**

1. Login com `recruta@teste.com` → Dashboard básico
2. Login com `veterano@teste.com` → Dashboard + recursos intermediários
3. Login com `elite@teste.com` → Dashboard + todos os recursos premium
4. Login com `admin@rotaclub.com` → Painel administrativo completo
