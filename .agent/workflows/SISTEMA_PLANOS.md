# 📋 SISTEMA DE PLANOS E SUBSCRIPTIONS

## ⚠️ REGRA CRÍTICA

> **SEMPRE** busque o plano do usuário da tabela `subscriptions`, **NUNCA** de outro lugar.

## Tabela de Referência

| Tabela | Campo | Descrição |
|--------|-------|-----------|
| `subscriptions` | `plan_id` | **FONTE ÚNICA** do plano do usuário |
| `subscriptions` | `user_id` | FK para `profiles.id` |
| `subscriptions` | `status` | 'active', 'canceled', etc |

## Planos Disponíveis

| Plan ID | Nome | Confrarias/mês | Elos | XP Multiplier |
|---------|------|----------------|------|---------------|
| `recruta` | Recruta | 0 (só recebe) | ∞ | 1x |
| `veterano` | Veterano | 4 | ∞ | 1.5x |
| `elite` | Elite | 10 | ∞ | 3x |

## Como Buscar o Plano do Usuário

### ✅ Método CORRETO (usar sempre)

```typescript
import { getUserPlan } from '@/lib/subscription/helpers'

const plan = await getUserPlan(userId)
// Retorna: 'recruta' | 'veterano' | 'elite'
```

### ✅ Query CORRETA

```typescript
const { data } = await supabase
    .from('subscriptions')  // <-- TABELA CORRETA
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

const planId = data?.plan_id || 'recruta'
```

### ❌ ERRADO - Nunca faça isso

```typescript
// ERRADO! Não existe relação direta
const { data } = await supabase
    .from('profiles')
    .select('subscriptions(plan_id)')  // <-- NÃO FUNCIONA ASSIM
    .eq('id', userId)
    .single()
```

## Arquivos de Referência

### `/lib/subscription/helpers.ts`
Funções centralizadas para gerenciar planos:
- `getUserPlan(userId)` - Retorna o plan_id
- `getUserPlanLimits(userId)` - Retorna os limites do plano
- `canSendConfraternity(userId)` - Verifica se pode enviar confraria
- `getXpMultiplier(plan)` - Retorna multiplicador de XP
- `PLAN_LIMITS` - Constante com todos os limites

## Checklist de Implementação

Ao criar qualquer funcionalidade que dependa do plano:

1. [ ] Importar `getUserPlan` de `@/lib/subscription/helpers`
2. [ ] Buscar plano usando a função centralizada
3. [ ] Usar `PLAN_LIMITS[plan]` para obter limites
4. [ ] **NUNCA** fazer query direta com join em profiles

## Componentes que Usam Planos

| Componente | Arquivo | Status |
|------------|---------|--------|
| Botão Confraria | `components/profile/confraternity-button.tsx` | ✅ Verificar |
| Botão Conexão | `components/profile/connection-button.tsx` | ⚠️ CORRIGIR |
| Gamificação | `lib/api/gamification.ts` | ✅ Correto |
| API Confraria | `lib/api/confraternity.ts` | ✅ Correto |

## Comando para Verificar Subscriptions

```sql
SELECT 
    p.full_name,
    s.plan_id,
    s.status
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE s.status = 'active' OR s.status IS NULL;
```
