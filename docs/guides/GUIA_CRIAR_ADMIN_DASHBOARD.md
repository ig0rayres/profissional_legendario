# 🔐 Guia: Criar Admin via Dashboard Supabase

## ⚠️ Problema
Os scripts SQL não estão gerando o hash de senha corretamente. A solução mais confiável é usar a interface do Supabase.

---

## ✅ Solução em 3 Passos

### Passo 1: Limpar usuário atual (SQL Editor)
```sql
DELETE FROM public.profiles WHERE email = 'admin@rotaclub.com';
DELETE FROM auth.users WHERE email = 'admin@rotaclub.com';
```

### Passo 2: Criar usuário pelo Dashboard
1. Acesse [https://supabase.com](https://supabase.com)
2. Entre no seu projeto
3. No menu lateral: **Authentication** → **Users**
4. Clique em **"Add user"** → **"Create new user"**
5. Preencha:
   - **Email**: `admin@rotaclub.com`
   - **Password**: `Admin@2024`
   - ✅ **Auto Confirm User**: MARQUE esta opção
6. Clique em **"Create user"**

### Passo 3: Tornar Admin (SQL Editor)
```sql
UPDATE public.profiles 
SET 
    role = 'admin',
    verification_status = 'verified',
    full_name = 'Administrador'
WHERE email = 'admin@rotaclub.com';
```

---

## 🎯 Credenciais Finais
```
Email: admin@rotaclub.com
Senha: Admin@2024
```

---

## 📌 Por que via Dashboard?
O Dashboard do Supabase usa a API oficial de autenticação que garante:
- ✅ Hash de senha correto
- ✅ Confirmação de email automática
- ✅ Sem erros de trigger
- ✅ 100% funcional

O método SQL direto tem problemas com o algoritmo de hash que o Supabase usa internamente.
