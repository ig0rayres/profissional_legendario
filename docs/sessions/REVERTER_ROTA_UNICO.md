# 🔄 REVERTER: Validação de Rota Número Único

**Criado:** 01/02/2026  
**Status:** ⚠️ ALTERAÇÕES TEMPORÁRIAS ATIVAS  
**Motivo:** Testes de cadastro sem bloqueio de duplicação

---

## 🚨 IMPORTANTE

> Estas alterações foram feitas para **TESTES** e devem ser **REVERTIDAS** antes de ir para produção!

---

## 📋 O QUE FOI ALTERADO

### 1. **Código Frontend - Validação Desabilitada**

**Arquivo:** `app/auth/register/page.tsx`  
**Commit:** `72f8016d`

**Alteração:**
- Comentamos o código que verificava se `rota_number` já estava em uso
- O frontend não valida mais duplicação

**Como reverter:**
```tsx
// Descomentar este bloco no onSubmit (~linha 160-180):

// Verificar se número da rota já está em uso
// if (data.rotaNumber) {
//     const { data: existingRota } = await supabase
//         .from('profiles')
//         .select('id')
//         .eq('rota_number', data.rotaNumber)
//         .maybeSingle()
//
//     if (existingRota) {
//         setError('Este número da rota já está em uso')
//         setIsLoading(false)
//         return
//     }
// }
```

---

### 2. **Banco de Dados - Sem Constraint UNIQUE**

**Status do banco atual:**
```sql
-- NÃO existe constraint UNIQUE para rota_number
-- Isso permite duplicados no banco
```

**Para adicionar validação no banco (opcional, mais seguro):**
```sql
-- Adicionar constraint UNIQUE
ALTER TABLE profiles ADD CONSTRAINT profiles_rota_number_key UNIQUE (rota_number);
```

---

## ✅ CHECKLIST PARA REVERTER

- [ ] Descomentar validação de `rota_number` no frontend (`app/auth/register/page.tsx`)
- [ ] Testar cadastro com número duplicado (deve bloquear)
- [ ] (Opcional) Adicionar constraint UNIQUE no banco
- [ ] Commit: `fix: revert - restore rota_number unique validation`
- [ ] Deploy para Vercel

---

## 🧪 COMO TESTAR APÓS REVERTER

1. Ir para `/auth/register`
2. Selecionar plano Elite ou Lendário
3. Preencher número da rota existente (ex: `001`)
4. Deve aparecer erro: **"Este número da rota já está em uso"**

---

## 📝 HISTÓRICO

| Data | Ação | Commit |
|------|------|--------|
| 01/02/2026 | Desabilitado para testes | `72f8016d` |
| - | Revertido (pendente) | - |
