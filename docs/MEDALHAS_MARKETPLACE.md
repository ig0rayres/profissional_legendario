# 🏅 MEDALHAS E PROEZAS DO MARKETPLACE

> **Importante:** Todas as medalhas e proezas devem ser acionadas automaticamente quando o usuário realizar as ações correspondentes.

---

## 🏆 MEDALHAS (Conquistas Permanentes)

| ID | Nome | Pontos | Condição | Categoria |
|----|------|--------|----------|-----------|
| `primeira_venda_mkt` | Primeira Venda MKT | 50 | 1ª venda no marketplace | marketplace |
| `vendedor_ativo` | Vendedor Ativo | 100 | 5 vendas no marketplace | marketplace |
| `comerciante` | Comerciante | 200 | 10 vendas no marketplace | marketplace |
| `mestre_marketplace` | Mestre do Marketplace | 400 | 20 vendas no marketplace | marketplace |
| `primeiro_sangue` | Primeiro Sangue | 100 | Primeira venda/contrato fechado | contracts |

---

## 🔥 PROEZAS (Ações Mensais - Reset todo mês)

| ID | Nome | Pontos | Condição | Categoria |
|----|------|--------|----------|-----------|
| `primeiro_sangue` | Primeiro Sangue | 50 | 1ª venda/contrato no mês | business |

---

## ⚙️ QUANDO ACIONAR AS MEDALHAS/PROEZAS

### 1️⃣ **Ao marcar anúncio como "VENDIDO"**

```typescript
// Quando usuário clica "Marcar como Vendido"
async function handleMarkAsSold(adId: string) {
    // 1. Atualizar anúncio
    await supabase
        .from('marketplace_ads')
        .update({ 
            status: 'sold', 
            sold_at: new Date().toISOString() 
        })
        .eq('id', adId)

    // 2. Contar vendas do usuário
    const { count } = await supabase
        .from('marketplace_ads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'sold')

    // 3. Acionar medalhas baseado no count
    if (count === 1) {
        await awardMedal(userId, 'primeira_venda_mkt') // 50 pts
    }
    if (count === 5) {
        await awardMedal(userId, 'vendedor_ativo') // 100 pts
    }
    if (count === 10) {
        await awardMedal(userId, 'comerciante') // 200 pts
    }
    if (count === 20) {
        await awardMedal(userId, 'mestre_marketplace') // 400 pts
    }

    // 4. Acionar proeza mensal (primeira venda do mês)
    const isFirstSaleThisMonth = await checkFirstSaleOfMonth(userId)
    if (isFirstSaleThisMonth) {
        await awardProeza(userId, 'primeiro_sangue') // 50 pts
    }
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Medalhas do Marketplace
- [ ] `primeira_venda_mkt` - Ao atingir 1 venda
- [ ] `vendedor_ativo` - Ao atingir 5 vendas
- [ ] `comerciante` - Ao atingir 10 vendas
- [ ] `mestre_marketplace` - Ao atingir 20 vendas
- [ ] `primeiro_sangue` - Primeira venda/contrato (geral)

### ✅ Proezas Mensais
- [ ] `primeiro_sangue` - Primeira venda do mês

### ✅ Integrações Necessárias
- [ ] Endpoint `/api/gamification/award-medal` (já existe?)
- [ ] Endpoint `/api/gamification/award-proeza` (já existe?)
- [ ] Função `checkFirstSaleOfMonth(userId)` - Verificar se é primeira venda do mês
- [ ] Trigger no botão "Marcar como Vendido"
- [ ] Notificação ao usuário quando ganhar medalha/proeza

---

## 🔧 FUNÇÕES AUXILIARES NECESSÁRIAS

### 1. Verificar primeira venda do mês
```typescript
async function checkFirstSaleOfMonth(userId: string): Promise<boolean> {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
        .from('marketplace_ads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'sold')
        .gte('sold_at', startOfMonth.toISOString())

    return count === 1
}
```

### 2. Conceder medalha
```typescript
async function awardMedal(userId: string, medalId: string) {
    // Verificar se já tem a medalha
    const { data: existing } = await supabase
        .from('user_medals')
        .select('id')
        .eq('user_id', userId)
        .eq('medal_id', medalId)
        .single()

    if (existing) return // Já tem a medalha

    // Buscar pontos da medalha
    const { data: medal } = await supabase
        .from('medals')
        .select('points_reward')
        .eq('id', medalId)
        .single()

    // Conceder medalha
    await fetch('/api/gamification/award-medal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, medalId })
    })
}
```

### 3. Conceder proeza
```typescript
async function awardProeza(userId: string, proezaId: string) {
    // Verificar se já conquistou este mês
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: existing } = await supabase
        .from('user_proezas')
        .select('id')
        .eq('user_id', userId)
        .eq('proeza_id', proezaId)
        .gte('earned_at', startOfMonth.toISOString())
        .single()

    if (existing) return // Já conquistou este mês

    // Conceder proeza
    await fetch('/api/gamification/award-proeza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, proezaId })
    })
}
```

---

## 🎯 ONDE IMPLEMENTAR

### Arquivos que precisam ser modificados:

1. **`/app/dashboard/marketplace/page.tsx`**
   - Função `handleMarkAsSold()` - Adicionar lógica de medalhas

2. **`/app/marketplace/[id]/page.tsx`**
   - Botão "Marcar como Vendido" - Adicionar lógica de medalhas

3. **`/lib/gamification/marketplace.ts`** (CRIAR)
   - Funções auxiliares: `checkFirstSaleOfMonth`, `awardMedal`, `awardProeza`

4. **`/app/api/gamification/award-medal/route.ts`** (verificar se existe)
   - Endpoint para conceder medalhas

5. **`/app/api/gamification/award-proeza/route.ts`** (verificar se existe)
   - Endpoint para conceder proezas

---

## 🚨 IMPORTANTE

**Todas as ações devem:**
1. ✅ Verificar se o usuário já tem a medalha/proeza
2. ✅ Aplicar multiplicador do plano nos pontos
3. ✅ Enviar notificação ao usuário
4. ✅ Exibir modal de celebração (confetti)
5. ✅ Registrar no histórico de pontos

---

**Última atualização:** 29/01/2026 - 15:42
