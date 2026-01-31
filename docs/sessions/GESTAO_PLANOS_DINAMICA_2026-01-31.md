# Gestão Dinâmica de Planos - Sessão 31/01/2026

## 📋 Objetivo
Implementar gestão completa e dinâmica dos planos através do painel admin, incluindo o novo campo `max_categories` e melhorias na UX.

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Novo Campo: Max Categorias**

#### Backend (plan_config)
✅ Adicionado campo `max_categories INTEGER DEFAULT 3`  
✅ Interface `Plan` atualizada em todos os componentes  
✅ Migration criada: `20260131_add_max_categories_to_plans.sql`

#### Interface Admin
✅ Campo adicionado no formulário de criação  
✅ Campo adicionado no formulário de edição  
✅ Card visual na visualização do plano  
✅ Checkbox "Ilimitado" para `-1`

---

### 2. **Padronização de UX: Checkboxes "Ilimitado"**

**Antes:** Usuário digitava `-1` manualmente  
**Depois:** Checkbox intuitivo que:
- ✅ Quando marcado → salva `-1`, esconde input
- ✅ Quando desmarcado → mostra input numérico com valor padrão

**Campos com checkbox:**
- Elos Máximos
- Confrarias/Mês
- Anúncios Marketplace
- **Max Categorias** (novo)

---

### 3. **Remoção de Redundância: can_send_confraternity**

**Problema identificado:**
- Campo `can_send_confraternity` (boolean) era redundante
- Conflitava com `max_confraternities_month`
- Se confrarias = 0, não pode enviar (lógica automática)

**Solução implementada:**
✅ Removido campo `can_send_confraternity` da interface  
✅ Removido toggle do admin  
✅ Lógica automática em `helpers.ts`:

```typescript
max_confraternities_month === 0  → NÃO pode enviar
max_confraternities_month === -1 → Ilimitado
max_confraternities_month > 0    → Limite específico
```

✅ Atualizado `getUserPlanLimits()` para buscar de `plan_config` (removido hardcoded)

---

### 4. **Gestão 100% Dinâmica**

**Componentes verificados:**
- ✅ `/components/sections/plans-section.tsx` → **JÁ DINÂMICO**
- ✅ `/app/planos/page.tsx` → **JÁ DINÂMICO**
- ✅ `/app/admin/financeiro/page.tsx` → **PlanManager dinâmico**

**Como funciona:**
1. Admin altera valores em `/admin/financeiro` → Planos
2. Valores salvos em `plan_config` (banco)
3. **TODOS** os cards de planos atualizam automaticamente
4. Sem necessidade de alterar código

---

## 📊 CONVENÇÃO DE VALORES

| Valor | Significado | Exibição |
|-------|-------------|----------|
| `-1` | Ilimitado | `∞ Ilimitado` |
| `0` | Sem acesso | `0` |
| `> 0` | Limite específico | Número (ex: `10`) |

---

## 🗂️ ARQUITETURA ATUALIZADA

### Tabela plan_config
```sql
CREATE TABLE plan_config (
    id UUID PRIMARY KEY,
    tier VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    price NUMERIC(10,2),
    features TEXT[],
    xp_multiplier NUMERIC(3,1),
    max_elos INTEGER,           -- -1 = ilimitado, 0 = sem acesso
    max_confraternities_month INTEGER,  -- -1 = ilimitado, 0 = sem acesso
    max_marketplace_ads INTEGER,  -- -1 = ilimitado, 0 = sem acesso
    max_categories INTEGER DEFAULT 3,  -- NOVO! -1 = ilimitado
    can_send_elo BOOLEAN,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,
    stripe_product_id VARCHAR,
    stripe_price_id VARCHAR
);
```

### Interface TypeScript
```typescript
interface Plan {
    id: string
    tier: string
    name: string
    price: number
    features: string[]
    xp_multiplier: number
    max_elos: number | null
    max_confraternities_month: number
    max_marketplace_ads: number
    max_categories: number  // NOVO!
    can_send_elo: boolean
    is_active: boolean
    display_order: number
    stripe_product_id?: string | null
    stripe_price_id?: string | null
}
```

---

## 🔄 INTEGRAÇÃO COM HELPERS

### Antes (Hardcoded)
```typescript
const PLAN_LIMITS = {
    recruta: { confraternities_per_month: 0, can_send: false },
    veterano: { confraternities_per_month: 4, can_send: true },
    elite: { confraternities_per_month: 10, can_send: true }
}
```

### Depois (Dinâmico)
```typescript
async function getUserPlanLimits(userId) {
    // Busca plan_id da subscription
    const subscription = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .single()
    
    // Busca config do plano
    const planConfig = await supabase
        .from('plan_config')
        .select('*')
        .eq('tier', subscription.plan_id)
        .single()
    
    return {
        confraternities_per_month: planConfig.max_confraternities_month,
        max_categories: planConfig.max_categories,
        // ... outros limites
    }
}
```

---

## 📝 DOCUMENTAÇÃO ATUALIZADA

### Arquivos modificados:
✅ `/docs/ESCOPO_PROJETO.md`
- Adicionada linha "Max Categorias" na tabela de limites
- Adicionada nota sobre gestão dinâmica
- Documentadas convenções de valores (-1, 0, >0)

---

## 🧪 COMO TESTAR

### 1. Acessar Admin
```
http://localhost:3000/admin/financeiro
→ Aba "Planos"
```

### 2. Editar Plano Elite
- Clicar em "Editar" no plano Elite
- Marcar ☑ "Ilimitado" em "Max Categorias"
- Salvar

### 3. Verificar Home
```
http://localhost:3000/#planos
```
- O card do plano Elite deve mostrar "∞ Ilimitado" em categorias

### 4. Verificar Página de Planos
```
http://localhost:3000/planos
```
- Mesma atualização deve aparecer

---

## 🎯 BENEFÍCIOS

1. **✅ Sem código hardcoded** → Tudo dinâmico
2. **✅ Admin completo** → Gerencia tudo pelo painel
3. **✅ UX melhorada** → Checkboxes intuitivos
4. **✅ Sem redundância** → Lógica unificada
5. **✅ Escalável** → Fácil adicionar novos planos/limites
6. **✅ Documentado** → Convenções claras

---

## 📦 ARQUIVOS MODIFICADOS

### Backend
- `/supabase/migrations/20260131_add_max_categories_to_plans.sql`

### Frontend
- `/components/admin/PlanManager.tsx`
- `/lib/subscription/helpers.ts`

### Documentação
- `/docs/ESCOPO_PROJETO.md`
- `/docs/sessions/GESTAO_PLANOS_DINAMICA_2026-01-31.md` (este arquivo)

---

## 🚀 PRÓXIMOS PASSOS (SUGERIDOS)

1. Implementar validação no frontend ao selecionar categorias (limitar por `max_categories` do plano)
2. Adicionar dashboard de uso (ex: "Você usou 3 de 5 categorias")
3. Implementar upgrade de plano quando usuário atingir limite
4. Adicionar analytics de uso de cada limite

---

**Documentado por:** Antigravity AI  
**Data:** 31/01/2026  
**Sessão:** Gestão Dinâmica de Planos
