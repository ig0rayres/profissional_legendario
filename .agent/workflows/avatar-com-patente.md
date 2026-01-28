---
description: Padrão para exibir avatares de usuários com ícone de patente
---

# Avatar com Patente - Padrão Centralizado

## Componente Único

**Arquivo:** `/components/ui/avatar-with-rank.tsx`

**Uso:**
```tsx
import { AvatarWithRank } from '@/components/ui/avatar-with-rank'

<AvatarWithRank
    user={{
        id: "user-id",
        full_name: "Nome Completo",
        avatar_url: "https://...",
        rank_id: "guardiao",        // novato, especialista, guardiao, comandante, general, lenda
        rank_name: "Guardião",      // Opcional
        rank_icon: "ShieldCheck",   // Opcional - usa getRankIconName() como fallback
        slug: "nome-usuario",       // Opcional - para URL do perfil
        rota_number: "123456"       // Opcional - para URL do perfil
    }}
    size="md"                       // xs, sm, md, lg, xl
    showName={false}                // Mostrar nome abaixo do avatar
    linkToProfile={true}            // Avatar clicável -> perfil
    variant="rounded"               // square, rounded, circle
/>
```

## Tamanhos Disponíveis

| Size | Dimensões | Badge | Uso Recomendado |
|------|-----------|-------|-----------------|
| xs   | 32x32     | xs    | Comentários inline |
| sm   | 40x40     | xs    | Listas, cards pequenos |
| md   | 48x48     | sm    | Feed, elos, confrarias |
| lg   | 64x64     | sm    | Cards destacados |
| xl   | 96x96     | md    | Headers, perfis |

## Variantes

- `square`: Bordas quadradas (rounded-lg)
- `rounded`: Bordas arredondadas (rounded-xl) - **Padrão**
- `circle`: Circular (rounded-full)

## Locais de Uso

// turbo-all
1. **Feed (Na Rota):** `components/social/post-card.tsx`
2. **Elos da Rota:** `components/profile/elos-da-rota.tsx`
3. **Confrarias:** `components/profile/confraternity-stats.tsx`
4. **Comentários:** Use com `size="xs"` ou `size="sm"`
5. **Cards de profissionais:** `components/professionals/professional-card.tsx`

## Utilitário de Patentes

**Arquivo:** `/lib/utils/ranks.ts`

```tsx
import { getRankIcon, getRankIconName, getRankColor, getRankName } from '@/lib/utils/ranks'

// Retorna componente Lucide
const IconComponent = getRankIcon('guardiao') // ShieldCheck

// Retorna nome do ícone como string
const iconName = getRankIconName('guardiao') // "ShieldCheck"

// Retorna cor hex
const color = getRankColor('guardiao') // "#3B82F6"

// Retorna nome formatado
const name = getRankName('guardiao') // "Guardião"
```

## Patentes e Ícones

| Rank ID | Nome | Ícone | Cor |
|---------|------|-------|-----|
| novato | Novato | Shield | #9CA3AF |
| especialista | Especialista | Target | #22C55E |
| guardiao | Guardião | ShieldCheck | #3B82F6 |
| comandante | Comandante | Medal | #F97316 |
| general | General | Flame | #EF4444 |
| lenda | Lenda | Crown | #EAB308 |

## ⚠️ REGRAS IMPORTANTES

1. **NUNCA** crie avatares com patente manualmente em componentes
2. **SEMPRE** use `AvatarWithRank` de `/components/ui/avatar-with-rank.tsx`
3. **SEMPRE** passe `rank_id` para exibir o ícone correto
4. Se precisa do ícone como componente, use `getRankIcon()` de `/lib/utils/ranks.ts`
