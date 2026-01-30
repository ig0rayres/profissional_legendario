# 🎯 AÇÕES E MISSÕES DIÁRIAS DO MARKETPLACE

> **Status:** ❌ NÃO IMPLEMENTADAS  
> **Recomendação:** CRIAR para aumentar engajamento

---

## 📊 SITUAÇÃO ATUAL

### ✅ **Já existe:**
- 5 Medalhas permanentes
- 1 Proeza mensal

### ❌ **Não existe:**
- Ações de pontos do Marketplace
- Missões diárias do Marketplace

---

## 💡 AÇÕES DE PONTOS SUGERIDAS (point_actions)

### **Categoria: marketplace**

| ID | Nome | Descrição | Pontos Base | Max/Dia |
|----|------|-----------|-------------|---------|
| `marketplace_ad_created` | Criar anúncio | Publicar novo anúncio no Marketplace | 30 | 3 |
| `marketplace_ad_viewed` | Visualizar anúncio | Ver anúncio de outro membro | 5 | 10 |
| `marketplace_contact_sent` | Entrar em contato | Contatar vendedor | 10 | 5 |
| `marketplace_ad_shared` | Compartilhar anúncio | Compartilhar anúncio | 15 | 3 |
| `marketplace_ad_favorited` | Favoritar anúncio | Salvar anúncio nos favoritos | 5 | 10 |

---

## 🎯 MISSÕES DIÁRIAS SUGERIDAS (daily_missions)

### **Categoria: marketplace**

| ID | Nome | Descrição | Pontos Base | Action Type |
|----|------|-----------|-------------|-------------|
| `explorar_marketplace` | Explorar Marketplace | Visualize 5 anúncios diferentes | 20 | `view_ads` |
| `criar_anuncio_dia` | Anunciar hoje | Publique um anúncio no Marketplace | 30 | `create_ad` |
| `contatar_vendedor` | Fazer contato | Entre em contato com um vendedor | 25 | `contact_seller` |
| `atualizar_anuncio` | Atualizar anúncio | Atualize a descrição ou fotos de um anúncio | 15 | `update_ad` |

---

## 🔧 SQL PARA IMPLEMENTAR

### **1. Criar Ações de Pontos:**

```sql
-- Ações do Marketplace
INSERT INTO point_actions (id, name, description, points_base, category, max_per_day, is_active) VALUES
('marketplace_ad_created', 'Criar anúncio', 'Publicar novo anúncio no Marketplace', 30, 'marketplace', 3, true),
('marketplace_ad_viewed', 'Visualizar anúncio', 'Ver anúncio de outro membro', 5, 'marketplace', 10, true),
('marketplace_contact_sent', 'Entrar em contato', 'Contatar vendedor', 10, 'marketplace', 5, true),
('marketplace_ad_shared', 'Compartilhar anúncio', 'Compartilhar anúncio', 15, 'marketplace', 3, true),
('marketplace_ad_favorited', 'Favoritar anúncio', 'Salvar anúncio nos favoritos', 5, 'marketplace', 10, true);
```

### **2. Criar Missões Diárias:**

```sql
-- Missões do Marketplace
INSERT INTO daily_missions (id, name, description, points_base, category, action_type, icon, rotation_weight, is_active) VALUES
('explorar_marketplace', 'Explorar Marketplace', 'Visualize 5 anúncios diferentes', 20, 'marketplace', 'view_ads', '🔍', 3, true),
('criar_anuncio_dia', 'Anunciar hoje', 'Publique um anúncio no Marketplace', 30, 'marketplace', 'create_ad', '📦', 2, true),
('contatar_vendedor', 'Fazer contato', 'Entre em contato com um vendedor', 25, 'marketplace', 'contact_seller', '💬', 3, true),
('atualizar_anuncio', 'Atualizar anúncio', 'Atualize a descrição ou fotos de um anúncio', 15, 'marketplace', 'update_ad', '✏️', 2, true);
```

---

## ⚙️ ONDE IMPLEMENTAR

### **1. Criar anúncio** (`marketplace_ad_created`)
**Arquivo:** `/app/marketplace/create/page.tsx`
```typescript
// Após criar anúncio com sucesso
await fetch('/api/gamification/award-points', {
    method: 'POST',
    body: JSON.stringify({
        userId: user.id,
        actionId: 'marketplace_ad_created'
    })
})
```

### **2. Visualizar anúncio** (`marketplace_ad_viewed`)
**Arquivo:** `/app/marketplace/[id]/page.tsx`
```typescript
// Ao carregar página de detalhes (se não for o próprio anúncio)
useEffect(() => {
    if (ad && ad.user_id !== user?.id) {
        fetch('/api/gamification/award-points', {
            method: 'POST',
            body: JSON.stringify({
                userId: user.id,
                actionId: 'marketplace_ad_viewed'
            })
        })
    }
}, [ad])
```

### **3. Entrar em contato** (`marketplace_contact_sent`)
**Arquivo:** `/app/marketplace/[id]/page.tsx`
```typescript
// Ao clicar "Entrar em Contato"
async function handleContact() {
    // ... lógica de contato
    
    await fetch('/api/gamification/award-points', {
        method: 'POST',
        body: JSON.stringify({
            userId: user.id,
            actionId: 'marketplace_contact_sent'
        })
    })
}
```

### **4. Compartilhar anúncio** (`marketplace_ad_shared`)
**Arquivo:** `/app/marketplace/[id]/page.tsx`
```typescript
// Ao clicar "Compartilhar"
async function handleShare() {
    // ... lógica de compartilhamento
    
    await fetch('/api/gamification/award-points', {
        method: 'POST',
        body: JSON.stringify({
            userId: user.id,
            actionId: 'marketplace_ad_shared'
        })
    })
}
```

### **5. Favoritar anúncio** (`marketplace_ad_favorited`)
**Arquivo:** `/app/marketplace/[id]/page.tsx`
```typescript
// Ao clicar "Favoritar"
async function handleFavorite() {
    // ... lógica de favoritar
    
    await fetch('/api/gamification/award-points', {
        method: 'POST',
        body: JSON.stringify({
            userId: user.id,
            actionId: 'marketplace_ad_favorited'
        })
    })
}
```

---

## 🎯 ENDPOINT NECESSÁRIO

### **Criar:** `/app/api/gamification/award-points/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMultiplier } from '@/lib/subscription/multipliers'

export async function POST(request: NextRequest) {
    const { userId, actionId } = await request.json()
    
    // 1. Buscar ação
    const { data: action } = await supabase
        .from('point_actions')
        .select('*')
        .eq('id', actionId)
        .single()
    
    // 2. Verificar limite diário
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
        .from('points_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action_type', actionId)
        .gte('created_at', `${today}T00:00:00`)
    
    if (action.max_per_day && count >= action.max_per_day) {
        return NextResponse.json({ error: 'Limite diário atingido' }, { status: 400 })
    }
    
    // 3. Aplicar multiplicador
    const multiplier = await getMultiplier(userId)
    const finalPoints = Math.round(action.points_base * multiplier)
    
    // 4. Conceder pontos
    // ... (similar ao award-medal)
}
```

---

## 📊 IMPACTO ESPERADO

### **Engajamento:**
- ✅ Usuários visitam mais anúncios (+50% views)
- ✅ Mais anúncios criados (+30% listings)
- ✅ Mais interações entre membros (+40% contacts)

### **Pontuação:**
- ✅ Mais oportunidades de ganhar Vigor
- ✅ Multiplicador aplicado em todas as ações
- ✅ Progressão mais rápida no ranking

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Executar SQL para criar ações
- [ ] Executar SQL para criar missões
- [ ] Criar endpoint `/api/gamification/award-points`
- [ ] Integrar em "Criar Anúncio"
- [ ] Integrar em "Visualizar Anúncio"
- [ ] Integrar em "Entrar em Contato"
- [ ] Integrar em "Compartilhar"
- [ ] Integrar em "Favoritar"
- [ ] Testar limites diários
- [ ] Testar multiplicadores
- [ ] Documentar no admin

---

**Quer que eu implemente essas ações e missões agora?** 🚀
