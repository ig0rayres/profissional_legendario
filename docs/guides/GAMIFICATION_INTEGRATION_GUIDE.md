# 🔧 Guia de Integração - Sistema de Gamificação
**Para Desenvolvedores**

---

## 📑 Índice

1. [Quick Start](#quick-start)
2. [Integrando Novas Ações](#integrando-novas-ações)
3. [Criando Novas Badges](#criando-novas-badges)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Boas Práticas](#boas-práticas)
6. [Checklist de Integração](#checklist-de-integração)

---

## ⚡ Quick Start

### Instalação

O sistema de gamificação já está instalado. Para usar:

```typescript
// Importe as funções necessárias
import { 
    awardPoints, 
    awardBadge,
    getUserBadges
} from '@/lib/api/gamification'
```

### Uso Básico

```typescript
// Conceder pontos
const result = await awardPoints(
    userId,           // UUID do usuário
    50,              // Pontos base
    'action_type',   // Tipo da ação
    'Descrição'      // Descrição opcional
)

// Conceder badge
const badgeResult = await awardBadge(
    userId,
    'badge_id'
)

// Verificar badges do usuário
const badges = await getUserBadges(userId)
```

---

## 🎯 Integrando Novas Ações

### Template Completo

```typescript
import { awardPoints, awardBadge, getUserBadges } from '@/lib/api/gamification'

async function handleNewAction(userId: string) {
    try {
        // 1. Executar a ação principal primeiro
        const actionResult = await executeMainAction()
        
        if (!actionResult.success) {
            return // Não concede pontos se ação falhou
        }
        
        // 2. Verificação de primeira vez (se aplicável)
        const userBadges = await getUserBadges(userId)
        const isFirstTime = !userBadges.some(b => 
            b.badge_id === 'badge_especifica'
        )
        
        if (isFirstTime) {
            // 3a. Primeira vez: concede badge (que já concede XP)
            await awardBadge(userId, 'badge_especifica')
            
            // Opcional: mostrar notificação especial
            showNotification({
                title: 'Nova Medalha!',
                message: 'Você conquistou [Nome da Medalha]',
                type: 'success'
            })
        } else {
            // 3b. Vezes seguintes: concede apenas pontos
            const result = await awardPoints(
                userId,
                30,                    // XP base
                'action_type',         // Tipo
                'Descrição da ação',   // Descrição
                {                      // Metadata opcional
                    extra_info: 'valor'
                }
            )
            
            // Opcional: mostrar pontos ganhos
            if (result.success) {
                showToast(`+${result.xpAwarded} XP`)
            }
        }
        
    } catch (error) {
        // 4. IMPORTANTE: Não quebrar a ação principal se gamificação falhar
        console.error('Gamification error (non-critical):', error)
        // Continuar normalmente
    }
}
```

---

## 📋 Passo-a-Passo Detalhado

### 1. Identificar o Trigger Point

Decida ONDE no código a ação deve ser reconhecida:

```typescript
// ❌ ERRADO: Conceder antes da ação completa
await awardPoints(userId, 50, 'sale')
await createSale(data) // E se isso falhar?

// ✅ CERTO: Conceder após sucesso confirmado
const sale = await createSale(data)
if (sale.success) {
    await awardPoints(userId, 50, 'sale')
}
```

---

### 2. Definir Pontos e Tipo

Escolha valores consistentes com ações similares:

| Tipo de Ação | XP Sugerido | Ação |
|--------------|-------------|------|
| **Pequenas** | 10-30 | Uploads, respostas, likes |
| **Médias** | 50-100 | Vendas, serviços, reviews |
| **Grandes** | 150-300 | Conquistas especiais, milestones |
| **Épicas** | 500+ | Grandes contratos, badges premium |

```typescript
// Exemplos
await awardPoints(userId, 10, 'profile_update')     // Pequena
await awardPoints(userId, 50, 'first_sale')         // Média
await awardPoints(userId, 200, 'challenge_complete') // Grande
```

---

### 3. Implementar Verificação de Primeira Vez

Se a ação deve conceder badge na primeira vez:

```typescript
async function handleAction(userId: string) {
    // Buscar badges do usuário
    const userBadges = await getUserBadges(userId)
    
    // Verificar se já tem a badge específica
    const hasBadge = userBadges.some(b => 
        b.badge_id === 'sua_badge_id'
    )
    
    if (!hasBadge) {
        // Primeira vez: concede badge
        await awardBadge(userId, 'sua_badge_id')
    } else {
        // Outras vezes: apenas pontos
        await awardPoints(userId, 30, 'action_type')
    }
}
```

---

### 4. Adicionar Error Handling

SEMPRE envolver gamificação em try-catch:

```typescript
async function handleAction(userId: string) {
    try {
        // Ação principal
        const result = await mainAction()
        
        // Gamificação
        try {
            await awardPoints(userId, 50, 'action')
        } catch (gamifError) {
            // Log mas não quebra a aplicação
            console.error('Gamification error:', gamifError)
            // Opcional: enviar para Sentry/similar
        }
        
        return result
    } catch (error) {
        // Erro da ação principal
        throw error
    }
}
```

---

## 🏅 Criando Novas Badges

### 1. Adicionar no Banco de Dados

```sql
-- Inserir nova badge
INSERT INTO badges (
    id,
    name,
    description,
    xp_reward,
    criteria_type,
    benefit_description,
    icon_key,
    is_active
) VALUES (
    'nova_badge_id',
    'Nome da Badge',
    'Descrição de como conquistar',
    100,                              -- XP que concede
    'achievement_type',               -- Tipo/categoria
    'Benefício ao conquistar',
    'Trophy',                         -- Ícone Lucide
    true
);
```

---

### 2. Adicionar Constante no Código

```typescript
// Em lib/constants/badges.ts (criar se não existir)
export const BADGE_IDS = {
    // ... badges existentes
    NOVA_BADGE: 'nova_badge_id',
} as const

export type BadgeId = typeof BADGE_IDS[keyof typeof BADGE_IDS]
```

---

### 3. Implementar Lógica de Concessão

```typescript
import { BADGE_IDS } from '@/lib/constants/badges'
import { awardBadge } from '@/lib/api/gamification'

async function checkNovaBadge(userId: string, criteriaData: any) {
    // Verificar critério específico
    if (criteriaData.meetsRequirement) {
        await awardBadge(userId, BADGE_IDS.NOVA_BADGE)
    }
}
```

---

### 4. Adicionar ao Admin Panel

```typescript
// Em app/admin/game/page.tsx
// Badge já aparecerá automaticamente se carregar de dados reais
// Para mock, adicionar em lib/data/mock.ts:

export const MOCK_BADGES: BadgeType[] = [
    // ... badges existentes
    {
        id: 'nova_badge_id',
        name: 'Nome da Badge',
        description: 'Descrição',
        xp_reward: 100,
        icon_key: 'Trophy',
        benefit: 'Benefício'
    }
]
```

---

## 💼 Exemplos Práticos

### Exemplo 1: Primeira Venda

```typescript
// Em: app/api/sales/create/route.ts
import { awardPoints, awardBadge, getUserBadges } from '@/lib/api/gamification'

export async function POST(req: Request) {
    const { userId, saleData } = await req.json()
    
    try {
        // 1. Criar venda
        const sale = await db.sales.create({ data: saleData })
        
        // 2. Gamificação (não-bloqueante)
        try {
            const userBadges = await getUserBadges(userId)
            const hasFirstSaleBadge = userBadges.some(b => 
                b.badge_id === 'primeiro_sangue'
            )
            
            if (!hasFirstSaleBadge) {
                // Primeira venda: badge + XP da badge
                await awardBadge(userId, 'primeiro_sangue')
            } else {
                // Vendas seguintes: apenas pontos
                await awardPoints(
                    userId,
                    50,
                    'sale_completed',
                    `Venda #${sale.id} concluída`,
                    { saleId: sale.id, amount: saleData.amount }
                )
            }
        } catch (gamifError) {
            console.error('Gamification error:', gamifError)
        }
        
        return Response.json({ success: true, sale })
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }
}
```

---

### Exemplo 2: Review 5 Estrelas

```typescript
// Em: components/review/ReviewForm.tsx
import { awardPoints, awardBadge } from '@/lib/api/gamification'

async function handleReviewSubmit(reviewData: ReviewData) {
    try {
        // 1. Criar review
        const review = await createReview(reviewData)
        
        // 2. Se for 5 estrelas, dar pontos ao profissional
        if (reviewData.rating === 5) {
            try {
                // Verificar se é primeira 5 estrelas
                const stats = await getProfessionalStats(reviewData.professional_id)
                
                if (stats.fiveStarReviews === 1) {
                    // Primeira 5★: badge
                    await awardBadge(
                        reviewData.professional_id,
                        'batismo_excelencia'
                    )
                } else {
                    // 5★ adicional: pontos
                    await awardPoints(
                        reviewData.professional_id,
                        80,
                        'five_star_review',
                        'Recebeu avaliação 5 estrelas'
                    )
                }
                
                // Verificar se atingiu média 5★ após 5 trabalhos
                if (stats.totalReviews >= 5 && stats.averageRating === 5.0) {
                    await awardBadge(
                        reviewData.professional_id,
                        'inabalavel'
                    )
                }
            } catch (gamifError) {
                console.error('Gamification error:', gamifError)
            }
        }
        
        return review
    } catch (error) {
        throw error
    }
}
```

---

### Exemplo 3: Perfil Completo

```typescript
// Em: app/api/profile/update/route.ts
import { checkProfileCompletion } from '@/lib/api/profile'

export async function PATCH(req: Request) {
    const { userId, profileData } = await req.json()
    
    try {
        // 1. Atualizar perfil
        const profile = await db.profiles.update({
            where: { id: userId },
            data: profileData
        })
        
        // 2. Verificar se ficou 100% completo
        try {
            await checkProfileCompletion(userId)
        } catch (gamifError) {
            console.error('Gamification error:', gamifError)
        }
        
        return Response.json({ success: true, profile })
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }
}
```

---

### Exemplo 4: Sistema de Streak

```typescript
// Em: lib/gamification/streaks.ts
import { awardBadge, getUserGamificationStats } from '@/lib/api/gamification'

export async function checkDailyStreak(userId: string) {
    try {
        const stats = await getUserGamificationStats(userId)
        const lastActive = new Date(stats.lastActiveDate)
        const today = new Date()
        
        // Calcular dias consecutivos
        const daysDiff = Math.floor(
            (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (daysDiff === 1) {
            // Streak continua
            const newStreak = (stats.currentStreak || 0) + 1
            
            // Atualizar streak
            await updateUserStreak(userId, newStreak)
            
            // Verificar badges de streak
            if (newStreak === 7) {
                await awardBadge(userId, 'semana_completa')
            } else if (newStreak === 30) {
                await awardBadge(userId, 'sentinela_inabalavel')
            }
        } else if (daysDiff > 1) {
            // Streak quebrou
            await updateUserStreak(userId, 1)
        }
    } catch (error) {
        console.error('Streak check error:', error)
    }
}
```

---

## ✅ Boas Práticas

### DO's ✅

```typescript
// ✅ Conceder pontos após ação confirmada
const sale = await createSale(data)
if (sale.success) await awardPoints(userId, 50, 'sale')

// ✅ Usar try-catch para não quebrar aplicação
try {
    await awardPoints(userId, 30, 'action')
} catch (e) {
    console.error('Gamification error:', e)
}

// ✅ Usar constantes para badge IDs
await awardBadge(userId, BADGE_IDS.FIRST_SALE)

// ✅ Passar metadata útil
await awardPoints(userId, 50, 'sale', 'Venda concluída', {
    saleId: sale.id,
    amount: sale.total,
    customer: sale.customerId
})

// ✅ Verificar primeira vez antes de badge
const badges = await getUserBadges(userId)
if (!badges.some(b => b.badge_id === 'badge_id')) {
    await awardBadge(userId, 'badge_id')
}
```

---

### DON'Ts ❌

```typescript
// ❌ Conceder pontos antes da ação
await awardPoints(userId, 50, 'sale')
await createSale(data) // E se falhar?

// ❌ Deixar erro de gamificação quebrar aplicação
const result = await awardPoints(...) // Sem try-catch!
return result.data // Vai quebrar se der erro

// ❌ Usar string hardcoded
await awardBadge(userId, 'primeiro_sangue') // Use constantes

// ❌ Dar mesma badge duas vezes sem verificar
await awardBadge(userId, 'badge')
await awardBadge(userId, 'badge') // Redundante

// ❌ Ignorar resposta da função
await awardPoints(...) // Não usa o resultado
```

---

## 📋 Checklist de Integração

Use este checklist ao integrar nova ação:

### Antes de Começar

- [ ] Definir nome da ação (`action_type`)
- [ ] Definir pontos base (XP)
- [ ] Decidir se terá badge associada
- [ ] Identificar trigger point no código

### Implementação

- [ ] Importar funções necessárias
- [ ] Adicionar chamada após ação confirmada
- [ ] Implementar try-catch
- [ ] Adicionar verificação de primeira vez (se aplicável)
- [ ] Passar metadata relevante
- [ ] Adicionar logs para debugging

### Badge (se aplicável)

- [ ] Criar badge no banco de dados
- [ ] Adicionar constante no código
- [ ] Implementar lógica de verificação
- [ ] Adicionar ao mock data (desenvolvimento)
- [ ] Adicionar ícone adequado

### Testes

- [ ] Testar ação sem gamificação (garantir que não quebra)
- [ ] Testar primeira vez (deve conceder badge)
- [ ] Testar segunda vez (deve conceder apenas pontos)
- [ ] Verificar logs no banco (`xp_logs`)
- [ ] Verificar stats atualizadas (`gamification_stats`)
- [ ] Verificar badge concedida (`user_badges`)

### Documentação

- [ ] Adicionar exemplo neste guia
- [ ] Atualizar documentação de usuário
- [ ] Documentar action_type usado
- [ ] Adicionar comentários no código

---

## 🔍 Debugging

### Ver Logs de XP de Um Usuário

```sql
SELECT 
    amount,
    action_type,
    description,
    created_at
FROM xp_logs
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 20;
```

### Ver Stats de Um Usuário

```sql
-- NOTA: O multiplicador vem do PLANO, não do rank!
SELECT 
    gs.*,
    r.name as rank_name,
    s.plan_id,
    CASE s.plan_id 
        WHEN 'elite' THEN 3.0 
        WHEN 'veterano' THEN 1.5 
        ELSE 1.0 
    END as plan_multiplier
FROM gamification_stats gs
JOIN ranks r ON r.id = gs.current_rank_id
LEFT JOIN subscriptions s ON s.user_id = gs.user_id AND s.status = 'active'
WHERE gs.user_id = 'USER_ID';
```

### Ver Badges de Um Usuário

```sql
SELECT 
    ub.earned_at,
    b.name,
    b.xp_reward
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
WHERE ub.user_id = 'USER_ID'
ORDER BY ub.earned_at DESC;
```

### Testar Função Manualmente

```typescript
// No console do navegador ou em teste
import { awardPoints } from '@/lib/api/gamification'

// Conceder XP teste
const result = await awardPoints(
    'user-uuid-aqui',
    10,
    'manual_test',
    'Teste manual no console'
)

console.log('Resultado:', result)
// { success: true, xpAwarded: 10 }
```

---

## 📞 Suporte

Dúvidas sobre integração?

1. Consulte exemplos neste guia
2. Veja código das integrações existentes
3. Execute testes de validação
4. Verifique logs do Supabase

---

**Última atualização:** 16/01/2026  
**Versão:** 1.0.0  
**Status:** Produção ✅
