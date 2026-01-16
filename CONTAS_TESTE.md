# 🔐 CONTAS DE TESTE - ELO DA ROTA

## 📋 **CREDENCIAIS**

### 🥉 **CONTA 1 - RECRUTA**
```
Nome: Recruta Teste
Email: recruta@rotatest.com
Senha: Rota@2024
CPF: 123.456.789-09
Plano: Recruta
Limite Confraria: 0 convites/mês
```

### 🥈 **CONTA 2 - VETERANO**
```
Nome: Veterano Teste  
Email: veterano@rotatest.com
Senha: Rota@2024
CPF: 987.654.321-00
Plano: Veterano
Limite Confraria: 2 convites/mês
```

### 🥇 **CONTA 3 - ELITE**
```
Nome: Elite Teste
Email: elite@rotatest.com
Senha: Rota@2024
CPF: 111.444.777-35
Plano: Elite
Limite Confraria: 10 convites/mês
```

---

## 🚀 **COMO CADASTRAR:**

### **Método 1: Via Interface (Recomendado)**

Para cada conta, faça:

1. **Acesse:** http://localhost:3001/auth/register
2. **Preencha os dados** da conta (ver acima)
3. **Cadastre**
4. **Faça logout**
5. **Repita** para as outras 2 contas

---

### **Método 2: Via SQL (Rápido)**

**⚠️ ATENÇÃO:** Este método só funciona se você não tiver proteção de email confirmation no Supabase.

Execute este SQL no Supabase:

```sql
-- Inserir usuários de teste
-- NOTA: Você precisará ajustar os IDs e hashes conforme necessário

-- 1. Recruta
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'recruta@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(),
    now(),
    now()
);

-- 2. Veterano  
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'veterano@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(),
    now(),
    now()
);

-- 3. Elite
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'elite@rotatest.com',
    crypt('Rota@2024', gen_salt('bf')),
    now(),
    now(),
    now()
);
```

**Depois, crie os perfis:**

```sql
-- Atualizar subscription_tier de cada usuário
UPDATE profiles 
SET subscription_tier = 'recruta'
WHERE email = 'recruta@rotatest.com';

UPDATE profiles 
SET subscription_tier = 'veterano'
WHERE email = 'veterano@rotatest.com';

UPDATE profiles 
SET subscription_tier = 'elite'
WHERE email = 'elite@rotatest.com';
```

---

## ✅ **COMO TESTAR:**

### **1. Login com Recruta**
```
recruta@rotatest.com / Rota@2024
```
✅ Ver: "0 convites/mês" no card de limites
✅ Mensagem: "Seu plano Recruta não permite..."

### **2. Login com Veterano**
```
veterano@rotatest.com / Rota@2024
```
✅ Ver: "2 convites/mês" no card de limites
✅ Pode solicitar até 2 confraternizações

### **3. Login com Elite**
```
elite@rotatest.com / Rota@2024
```
✅ Ver: "10 convites/mês" no card de limites
✅ Pode solicitar até 10 confraternizações

---

## 📊 **CENÁRIOS DE TESTE:**

1. **Recruta tenta solicitar confraria** → Deve mostrar erro
2. **Veterano solicita 2 confraternizações** → Deve funcionar
3. **Veterano tenta solicitar 3ª** → Deve bloquear
4. **Elite solicita 10 confraternizações** → Deve funcionar

---

**Senha padrão para todas:** `Rota@2024`
