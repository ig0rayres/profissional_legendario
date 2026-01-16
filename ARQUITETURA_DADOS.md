# 📊 Arquitetura de Dados - Fonte Única de Verdade

## ✅ REGRA DE OURO: `public.profiles` é a ÚNICA fonte de dados

### 🎯 Como funciona:

```
┌─────────────────┐
│  Cadastro Form  │
│  /auth/register │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  auth.users     │  ← Supabase Auth (temporário)
│  metadata       │
└────────┬────────┘
         │
         ↓ (trigger automático)
┌─────────────────┐
│ public.profiles │  ✅ FONTE ÚNICA DE VERDADE
│                 │     Todos os dados ficam aqui!
└─────────────────┘
```

---

## 📝 Fluxo de Dados:

### 1️⃣ **Cadastro:**
- Usuário preenche formulário
- Dados vão para `auth.users` (Supabase)
- **Trigger automático** copia para `public.profiles`

### 2️⃣ **Consulta:**
- ✅ **SEMPRE** ler de `public.profiles`
- ❌ **NUNCA** ler de `auth.users.raw_user_meta_data`

### 3️⃣ **Atualização:**
- ✅ **SEMPRE** gravar em `public.profiles`
- O admin edita diretamente `public.profiles`

---

## 🔧 Tabelas e Responsabilidades:

### `auth.users` (Supabase Auth)
- **Responsabilidade:** Autenticação (email/senha)
- **Usado para:** Login, reset de senha
- **NÃO usar para:** Dados de perfil

### `public.profiles` ✅
- **Responsabilidade:** TODOS os dados do usuário
- **Campos:**
  - `id` (mesmo ID do auth.users)
  - `email`
  - `full_name`
  - `cpf`
  - `rota_number` ← ID Rota Business
  - `role` (user/professional/admin)
  - `verification_status`
  - etc...

---

## 💻 Código - Como usar:

### ✅ **CORRETO:**
```typescript
// Buscar dados do usuário
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Atualizar dados
await supabase
  .from('profiles')
  .update({ rota_number: 'ROT-123' })
  .eq('id', userId)
```

### ❌ **ERRADO:**
```typescript
// NÃO FAZER ISSO!
const metadata = user.raw_user_meta_data
const rotaNumber = metadata.rota_number // ❌
```

---

## 🔄 Sincronização Inicial:

Se houver dados no `metadata` que não estão em `profiles`:

```sql
-- Script: SINCRONIZAR_IDS_ROTA.sql
UPDATE public.profiles p
SET rota_number = u.raw_user_meta_data->>'rota_number'
FROM auth.users u
WHERE p.id = u.id;
```

---

## 🛡️ Trigger Automático:

O trigger `on_auth_user_created` garante que:
- ✅ Todo novo usuário tem perfil criado automaticamente
- ✅ Dados do cadastro são copiados para `profiles`
- ✅ Não há dados órfãos

---

## 📌 Checklist para Desenvolvedores:

Antes de fazer qualquer query de usuário:

- [ ] Estou usando `public.profiles`?
- [ ] NÃO estou usando `raw_user_meta_data`?
- [ ] Estou atualizando `public.profiles`?
- [ ] O trigger está ativo?

---

**Lembre-se:** `public.profiles` é a fonte única e confiável! 🎯
