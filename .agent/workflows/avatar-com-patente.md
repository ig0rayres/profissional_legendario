---
description: Padrão para exibir avatares de usuários com ícone de patente
---

# Avatar com Patente - Padrão de Implementação

Sempre que exibir um avatar de usuário na plataforma, siga este padrão:

## Componentes Necessários

```tsx
import { RankInsignia } from '@/components/gamification/rank-insignia'
import Image from 'next/image'
```

## Estrutura do Avatar (FRAME QUADRADA + PATENTE)

**Padrão obrigatório em toda a plataforma:**
- Frame **quadrada** (rounded-lg), não circular
- Miniatura da patente no canto inferior direito
- Border sutil da cor primária

```tsx
<div className="relative">
    {/* Avatar - FRAME QUADRADA */}
    {user.avatar_url ? (
        <Image
            src={user.avatar_url}
            alt={user.full_name}
            width={56}
            height={56}
            className="rounded-lg border-2 border-primary/20 object-cover"
        />
    ) : (
        <div className="w-14 h-14 rounded-lg border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
                {user.full_name.charAt(0).toUpperCase()}
            </span>
        </div>
    )}
    
    {/* Ícone da Patente - SEMPRE presente no canto inferior direito */}
    <div className="absolute -bottom-1 -right-1" title={user.rank_name}>
        <RankInsignia 
            rankId={user.rank_id} 
            size="sm" 
            variant="avatar"
        />
    </div>
</div>
```

## Buscar Patente do Usuário

```tsx
// Query para buscar patente
const { data: gamificationData } = await supabase
    .from('user_gamification')
    .select('user_id, rank_id, ranks(name)')
    .eq('user_id', userId)
    .single()

const rankId = gamificationData?.rank_id || 'novato'
const rankName = gamificationData?.ranks?.name || 'Novato'
```

## Ícones de Patente (tabela `ranks`)

| rank_id      | Nome          | Ícone Lucide |
|--------------|---------------|--------------|
| novato       | Novato        | Shield       |
| especialista | Especialista  | Target       |
| guardiao     | Guardião      | Sword        |
| comandante   | Comandante    | Medal        |
| general      | General       | Flame        |
| lenda        | Lenda         | Crown        |

## Componente RankInsignia

**Arquivo:** `/components/gamification/rank-insignia.tsx`

**Props:**
- `rankId`: ID da patente (ex: 'novato', 'especialista')
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'badge' | 'icon-only' | 'avatar'
- `showLabel`: boolean (mostrar nome da patente)

**Exemplos:**
```tsx
// Ícone pequeno para avatar
<RankInsignia rankId="novato" size="sm" variant="icon-only" />

// Badge com nome
<RankInsignia rankId="especialista" size="md" variant="badge" showLabel />

// Ícone grande
<RankInsignia rankId="general" size="lg" variant="avatar" />
```

## IMPORTANTE

1. **NUNCA** use emojis ou texto para mostrar patentes
2. **SEMPRE** use o componente `RankInsignia`
3. Os ícones são gerenciados no **Admin > Gamificação > Patentes**
4. O `rank_id` deve corresponder ao ID na tabela `ranks`
