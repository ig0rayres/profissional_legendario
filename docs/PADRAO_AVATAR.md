# 🖼️ PADRÃO DE AVATAR - ROTA BUSINESS CLUB

## ⚠️ DOCUMENTO CRÍTICO - LEITURA OBRIGATÓRIA

Este documento define o **PADRÃO ÚNICO** para exibição de avatares de usuário na plataforma.
O avatar deve seguir o padrão visual da Rota Business Club em TODOS os lugares.

---

## 🎯 ESPECIFICAÇÃO VISUAL

### Formato Padrão ROTA BUSINESS
- **Frame**: Losango com montanhas (`frameStyle="diamond"`)
- **Patente**: Canto inferior direito (badge com ícone da patente)
- **Foto**: Sempre dentro do frame de losango
- **Sombra**: Drop shadow para destaque

### Variantes de Frame
| frameStyle | Descrição | Uso |
|------------|-----------|-----|
| `diamond` | **PADRÃO** - Losango com montanhas | Rankings, listas, feed |
| `simple` | Bordas simples (quadrada/arredondada) | Casos especiais |

### Tamanhos
| Size | Dimensões | Badge | Uso Recomendado |
|------|-----------|-------|-----------------| 
| xs   | 32x32     | xs    | Comentários inline |
| sm   | 40x40     | xs    | **Listas, rankings** |
| md   | 48x48     | sm    | Feed, elos, confrarias |
| lg   | 64x64     | sm    | Cards destacados |
| xl   | 96x96     | md    | Headers, perfis |

---

## 📦 COMPONENTE ÚNICO

**Arquivo:** `/components/ui/avatar-with-rank.tsx`

### Uso Básico:
```tsx
import { AvatarWithRank } from '@/components/ui/avatar-with-rank'

<AvatarWithRank
    user={{
        id: "user-id",
        full_name: "Nome Completo",
        avatar_url: "https://...",
        rank_id: "guardiao"  // OBRIGATÓRIO para exibir patente
    }}
    size="sm"
    variant="square"
    linkToProfile={false}
/>
```

### Propriedades:
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `user` | object | - | Dados do usuário (id, full_name, avatar_url, rank_id) |
| `size` | string | "md" | xs, sm, md, lg, xl |
| `variant` | string | "rounded" | square, rounded, circle |
| `showName` | boolean | false | Mostrar nome abaixo |
| `linkToProfile` | boolean | false | Tornar clicável |
| `frameStyle` | string | "simple" | simple (borda) ou diamond (losango) |

---

## ✅ ONDE USAR

### Locais que DEVEM usar `AvatarWithRank`:

1. **Ranking Na Rota** (`/app/na-rota/page.tsx`)
2. **Ranking Admin** (`/components/admin/SeasonsManager.tsx`)
3. **Feed de Posts** (`/components/social/post-card.tsx`)
4. **Elos da Rota** (`/components/profile/elos-da-rota.tsx`)
5. **Cards de Profissionais** (`/components/professionals/professional-card.tsx`)
6. **Confrarias** (`/components/profile/confraternity-stats.tsx`)
7. **Comentários** (usar size="xs" ou "sm")

---

## 🚫 REGRAS OBRIGATÓRIAS

1. **NUNCA** crie avatares manualmente em componentes
2. **SEMPRE** use `AvatarWithRank` do `/components/ui/avatar-with-rank.tsx`
3. **SEMPRE** passe `rank_id` para exibir a patente corretamente
4. **SEMPRE** use `variant="square"` para rankings e listas
5. Para rankings, use `size="sm"` e `linkToProfile={false}`

---

## 🎖️ PATENTES DISPONÍVEIS

| rank_id | Nome | Ícone | Cor |
|---------|------|-------|-----|
| novato | Novato | Shield | #9CA3AF (cinza) |
| especialista | Especialista | Target | #22C55E (verde) |
| guardiao | Guardião | ShieldCheck | #3B82F6 (azul) |
| comandante | Comandante | Medal | #F97316 (laranja) |
| general | General | Flame | #EF4444 (vermelho) |
| lenda | Lenda | Crown | #EAB308 (amarelo/dourado) |

---

## 📚 UTILITÁRIOS

**Arquivo:** `/lib/utils/ranks.ts`

```typescript
import { getRankIcon, getRankIconName, getRankColor, getRankName } from '@/lib/utils/ranks'

// Retorna componente Lucide do ícone
const IconComponent = getRankIcon('guardiao')

// Retorna nome do ícone como string  
const iconName = getRankIconName('guardiao') // "ShieldCheck"

// Retorna cor hex
const color = getRankColor('guardiao') // "#3B82F6"

// Retorna nome formatado
const name = getRankName('guardiao') // "Guardião"
```

---

*Última atualização: 30/01/2026*
*Responsável: Equipe de Desenvolvimento*
