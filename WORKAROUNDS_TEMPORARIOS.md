# 🚨 WORKAROUNDS TEMPORÁRIOS - DESENVOLVIMENTO

**ATENÇÃO:** Este arquivo documenta workarounds temporários que **DEVEM SER REMOVIDOS** antes do deploy em produção!

---

## 1️⃣ Substituição Automática de ID Rota 141018

### **Arquivo:** `components/auth/gorra-ocr.tsx`

### **Problema:**
- Temos apenas UMA gorra física para testes (ID: 141018)
- O sistema não permite IDs duplicados
- Precisamos cadastrar múltiplos usuários para testes

### **Solução Temporal:**
Quando a IA ler o ID `141018` da gorra, o frontend substitui automaticamente por um número aleatório entre `30000-100000`.

### **Código Afetado:**
```typescript
// Linhas 96-109 em components/auth/gorra-ocr.tsx
if (result.success && result.id) {
    let finalId = result.id
    if (result.id === '141018') {
        finalId = String(30000 + Math.floor(Math.random() * 70000))
        console.log(`[GorraOCR] 🔄 DEV MODE: Substituído ${result.id} por ${finalId}`)
    }
    
    setExtractedId(finalId)
    onIdExtracted(finalId)
}
```

### **Como Remover em Produção:**
```typescript
// REVERTER PARA:
if (result.success && result.id) {
    setExtractedId(result.id)
    onIdExtracted(result.id)
}
```

---

## 2️⃣ Validação de ID Duplicado Desabilitada

### **Arquivo:** `app/auth/register/page.tsx`

### **Problema:**
A validação de ID duplicado está comentada para permitir testes.

### **Código Afetado:**
```typescript
// Linhas 195-210 em app/auth/register/page.tsx
// ⚠️ MODO TESTE: Verificação de duplicatas DESABILITADA temporariamente
// TODO: Reativar após testes (descomentar o código abaixo)
/*
const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('rota_number')
    .eq('rota_number', data.rotaNumber)
    .maybeSingle()

if (existingUser) {
    setError('Este ID Rota Business já está em uso. Por favor, use outro.')
    setIsLoading(false)
    return
}
*/
```

### **Como Reativar em Produção:**
Descomentar o bloco de código acima (remover `/*` e `*/`).

---

## 3️⃣ RLS Desabilitado em Tabelas de Indicação

### **Tabelas:** `referrals`, `referral_commissions`

### **Problema:**
Policies de RLS bloqueavam inserções de indicações e comissões.

### **Solução Temporal:**
```sql
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions DISABLE ROW LEVEL SECURITY;
```

### **Como Reabilitar em Produção:**

```sql
-- 1. Habilitar RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;

-- 2. Criar policies corretas
-- Referrals
CREATE POLICY "Service role can manage all referrals" ON referrals
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their referrals" ON referrals
FOR SELECT TO authenticated
USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Commissions
CREATE POLICY "Service role can manage all commissions" ON referral_commissions
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view their commissions" ON referral_commissions
FOR SELECT TO authenticated
USING (referrer_id = auth.uid() OR referred_id = auth.uid());
```

---

## 🔄 IDs Rota Alterados (03/02/2026 10:40)

### **Mapeamento Antigo → Novo**

**Operação:** Alteração massiva de IDs duplicados (141018) para números únicos

| Usuário | Email | ID Antigo | ID Novo | Data |
|---------|-------|-----------|---------|------|
| Allan Nicola | teixeira@dothouse.com.br | 141018 | **43105** | 03/02/2026 |
| Matheus Artal | skyfit@dothouse.com.br | 141018 | **84217** | 03/02/2026 |
| Pr Erick Cabral | reinaldo@dothouse.com.br | 141018 | **88757** | 03/02/2026 |
| Pr Silvio Lacerda | regis_paraiso@dothouse.com.br | 141018 | **80232** | 03/02/2026 |
| Renan Di Carli | bebeto@dothouse.com.br | 141018 | **59128** | 03/02/2026 |

**Igor Ayres:** ✅ MANTIDO em **141018** (não alterado)

### **Novas URLs de Perfil**

```
https://rotabusinessclub.com.br/allan-nicola/43105
https://rotabusinessclub.com.br/matheus-artal/84217
https://rotabusinessclub.com.br/pr-erick-cabral/88757
https://rotabusinessclub.com.br/pr-silvio-lacerda/80232
https://rotabusinessclub.com.br/renan-di-carli/59128
https://rotabusinessclub.com.br/igor-ayres/141018 ✅ (inalterado)
```

### **Script de Rollback (se necessário)**

```sql
-- REVERTER para IDs antigos
UPDATE profiles SET rota_number = '141018' WHERE full_name = 'Allan Nicola';
UPDATE profiles SET rota_number = '141018' WHERE full_name = 'Matheus Artal';
UPDATE profiles SET rota_number = '141018' WHERE full_name = 'Pr Erick Cabral';
UPDATE profiles SET rota_number = '141018' WHERE full_name = 'Pr Silvio Lacerda';
UPDATE profiles SET rota_number = '141018' WHERE full_name = 'Renan Di Carli';
```

---

## 📋 CHECKLIST PRÉ-PRODUÇÃO

Antes de fazer deploy para produção, **VERIFIQUE** todos os itens:



- [ ] ✅ **Remover substituição automática** de ID 141018 em `gorra-ocr.tsx`
- [ ] ✅ **Reativar validação** de ID duplicado em `register/page.tsx`
- [ ] ✅ **Reabilitar RLS** nas tabelas `referrals` e `referral_commissions`
- [ ] ✅ **Criar policies corretas** para RLS com service_role
- [ ] ✅ **Testar fluxo completo** com usuário real
- [ ] ✅ **Verificar logs** do terminal para mensagens `DEV MODE`
- [ ] ✅ **Remover este arquivo** da pasta migrations

---

## 🔍 Como Identificar Código de DEV MODE

Busque por estas strings no código antes do deploy:

```bash
# Buscar workarounds temporários
grep -r "WORKAROUND TEMPORÁRIO" .
grep -r "DEV MODE" .
grep -r "MODO TESTE" .
grep -r "TODO: Reativar" .
grep -r "141018" .
```

---

**Data de Criação:** 03/02/2026  
**Última Atualização:** 03/02/2026  
**Responsável:** Igor Ayres  
**Status:** 🔴 ATIVO - Workarounds em USO
