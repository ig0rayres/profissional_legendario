# 🎯 DOCUMENTAÇÃO COMPLETA: AVATARES E BADGES DE PATENTE

> **📅 Última atualização:** 30/01/2026  
> **✨ Versão:** 1.0  
> **🎨 Padrão:** LogoFrameAvatar + RankInsignia (icon-only)

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Componentes Base](#componentes-base)
3. [Locais de Implementação](#locais-de-implementação)
4. [Padrão de Código](#padrão-de-código)
5. [Troubleshooting](#troubleshooting)

---

## 🎨 VISÃO GERAL

Todos os avatares do sistema seguem o **mesmo padrão visual**:
- **Frame:** LogoFrameAvatar (frame de montanhas em losango)
- **Badge:** RankInsignia com `variant="icon-only"` (círculo verde com ícone)
- **Posicionamento:** Badge no canto inferior direito do avatar

### Tamanhos Padronizados

| Local | Avatar | Badge | Posição Badge |
|-------|--------|-------|---------------|
| **Header Desktop** | 175x175px | 50x50px | `bottom-[18px] right-[18px]` |
| **Header Mobile** | 116x116px | 36x36px | `bottom-[8px] right-[8px]` |
| **Elos da Rota** | 48x48px | 28x28px | `bottom-[1px] right-[1px]` |
| **Feed NA ROTA** | 58x58px | 24x24px | `bottom-[0px] right-[0px]` |

---

## 🧩 COMPONENTES BASE

### 1. LogoFrameAvatar
**Localização:** `/components/profile/logo-frame-avatar.tsx`

Componente que renderiza o avatar com o frame de montanhas em losango.

**Props principais:**
```tsx
interface LogoFrameAvatarProps {
  src: string | null
  alt: string
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}
```

**Tamanhos disponíveis:**
- `xs`: 32x32px
- `sm`: 48x48px
- `md`: 64x64px
- `lg`: 96x96px
- `xl`: 128x128px

---

### 2. RankInsignia
**Localização:** `/components/gamification/rank-insignia.tsx`

Componente que renderiza o badge de patente.

**Props principais:**
```tsx
interface RankInsigniaProps {
  rankId: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'badge' | 'icon-only' | 'avatar'
  className?: string
}
```

**⚠️ IMPORTANTE:** Sempre use `variant="icon-only"` para badges em avatares!

**Estrutura do HTML gerado:**
```tsx
<div className="flex items-center justify-center rounded-full" 
     style={{ backgroundColor: '#2E4A3E', width: 'Xpx', height: 'Xpx' }}>
  <IconComponent className="text-white" />
</div>
```

---

### 3. AvatarWithRank (NÃO USAR MAIS)
**Localização:** `/components/ui/avatar-with-rank.tsx`

⚠️ **DESCONTINUADO:** Este componente foi substituído pelo padrão LogoFrameAvatar + RankInsignia.
- Mantido apenas para compatibilidade com código legado
- **NÃO usar em novos desenvolvimentos**

---

## 📍 LOCAIS DE IMPLEMENTAÇÃO

### 1️⃣ AVATAR DO HEADER (Desktop e Mobile)

**Arquivo:** `/components/profile/headers/improved-current-header-v6-complete.tsx`

**Linhas:** 92-118

**Código:**
```tsx
<div className="relative flex-shrink-0 ml-1 md:ml-4 mr-1 md:mr-6 z-0 md:translate-y-[10px]">
    {/* Avatar com LogoFrame */}
    <LogoFrameAvatar
        src={profile.avatar_url}
        alt={profile.full_name}
        size="lg"
        className="w-[116px] h-[116px] md:w-[175px] md:h-[175px]"
    />

    {/* Rank Badge - EXATAMENTE no canto inferior direito do frame losango */}
    <div className="absolute bottom-[8px] right-[8px] md:bottom-[18px] md:right-[18px] z-[5]">
        <RankInsignia
            rankId={gamification?.current_rank_id || 'novato'}
            size="lg"
            variant="icon-only"
            className="w-[36px] h-[36px] md:w-[50px] md:h-[50px] border-[1.5px] md:border-[2px] border-white"
        />
    </div>
</div>
```

**Ajustes específicos:**
- Desktop: Avatar 175px, Badge 50px, posição `bottom-[18px] right-[18px]`
- Mobile: Avatar 116px, Badge 36px, posição `bottom-[8px] right-[8px]`
- Desktop tem `translate-y-[10px]` para descer 10px

**Importações necessárias:**
```tsx
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'
import { RankInsignia } from '@/components/gamification/rank-insignia'
```

---

### 2️⃣ AVATARES DOS ELOS DA ROTA

**Arquivo:** `/components/profile/cards-v13-brand-colors.tsx`

**Linhas:** 646-665

**Código:**
```tsx
<div className="relative mb-2">
    <div
        className="relative"
        style={avatarSizes ? {
            width: `${avatarSizes.frameSize}px`,
            height: `${avatarSizes.frameSize}px`,
        } : undefined}
    >
        <LogoFrameAvatar
            src={conn.avatar_url}
            alt={conn.full_name}
            size="sm"
            className={avatarSizes ? 'w-full h-full' : 'w-12 h-12'}
        />
    </div>
    
    {/* Badge de patente no canto - CORRIGIDO */}
    {conn.rank_id && (
        <div className="absolute bottom-[1px] right-[1px] z-[5]">
            <RankInsignia
                rankId={conn.rank_id}
                size="xs"
                variant="icon-only"
                className="w-[28px] h-[28px] border-[1.5px] border-white"
            />
        </div>
    )}
</div>
```

**Ajustes específicos:**
- Avatar: 48px (padrão `sm`)
- Badge: 28px
- Posição: `bottom-[1px] right-[1px]`

**Contexto:** Este código está dentro do componente `ElosDaRotaV13` que renderiza o popup com os elos do usuário.

**Importações necessárias:**
```tsx
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'
import { RankInsignia } from '@/components/gamification/rank-insignia'
```

---

### 3️⃣ AVATARES DO FEED "NA ROTA"

**Arquivo:** `/components/social/post-card.tsx`

**Linhas:** 230-300

**Código para posts normais:**
```tsx
<div className="relative">
    <div className="relative w-[58px] h-[58px]">
        <LogoFrameAvatar
            src={post.user.avatar_url}
            alt={post.user.full_name}
            size="sm"
            className="w-full h-full"
        />
        {post.user.rank_id && (
            <div className="absolute bottom-[0px] right-[0px] z-[5]">
                <RankInsignia
                    rankId={post.user.rank_id}
                    size="xs"
                    variant="icon-only"
                    className="w-[24px] h-[24px] border-[1.5px] border-white"
                />
            </div>
        )}
    </div>
</div>
```

**Código para confrarias (avatares duplos):**
```tsx
<div className="flex -space-x-3">
    {/* Membro 1 */}
    <div className="relative z-10">
        <div className="relative w-[58px] h-[58px]">
            <LogoFrameAvatar
                src={post.confraternity.member1.avatar_url}
                alt={post.confraternity.member1.full_name}
                size="sm"
                className="w-full h-full"
            />
            {post.confraternity.member1.rank_id && (
                <div className="absolute bottom-[0px] right-[0px] z-[5]">
                    <RankInsignia
                        rankId={post.confraternity.member1.rank_id}
                        size="xs"
                        variant="icon-only"
                        className="w-[24px] h-[24px] border-[1.5px] border-white"
                    />
                </div>
            )}
        </div>
    </div>
    
    {/* Membro 2 - mesmo código acima */}
</div>
```

**Ajustes específicos:**
- Avatar: 58px (+20% do padrão)
- Badge: 24px
- Posição: `bottom-[0px] right-[0px]`
- Para confrarias: `-space-x-3` para sobrepor avatares

**Importações necessárias:**
```tsx
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'
import { RankInsignia } from '@/components/gamification/rank-insignia'
```

---

### 4️⃣ FEED "NA ROTA" (Card do Perfil)

**Arquivo:** `/components/profile/cards-v13-brand-colors.tsx`

**Linhas:** 1240-1265 (componente `NaRotaFeedV13`)

**Código:**
```tsx
<div className="flex items-center gap-3">
    {/* Avatar com LogoFrame e Badge de Patente */}
    <div className="relative">
        <LogoFrameAvatar
            src={userAvatar}
            alt={userName}
            size="xs"
            className="w-10 h-10"
        />
        {userRankId && (
            <div className="absolute bottom-[2px] right-[2px] z-[5]">
                <RankInsignia
                    rankId={userRankId}
                    size="xs"
                    variant="icon-only"
                    className="w-[18px] h-[18px] border-[1px] border-white"
                />
            </div>
        )}
    </div>
    <div>
        <p className="text-sm font-semibold text-[#2D3142]">
            {getFirstName(userName)}
        </p>
        <p className="text-xs text-gray-500">
            {formatRelativeTime(item.date)}
        </p>
    </div>
</div>
```

**Props do componente:**
```tsx
interface NaRotaFeedV13Props {
    userId: string
    userName: string
    userAvatar?: string | null
    userRankId?: string  // ← IMPORTANTE: adicionar esta prop
    showCreateButton?: boolean
    // ...
}
```

**Ajustes específicos:**
- Avatar: 40px
- Badge: 18px
- Posição: `bottom-[2px] right-[2px]`

---

## 🔧 DADOS: BUSCA DO RANK_ID

### PostsService (Feed NA ROTA)

**Arquivo:** `/lib/services/posts-service.ts`

**IMPORTANTE:** O `rank_id` deve ser buscado da tabela `user_gamification` junto com os perfis.

**Código de referência (linhas 168-180):**
```typescript
// Buscar perfis dos autores
const userIds = Array.from(new Set(postsData.map(p => p.user_id)))
const { data: profiles } = await this.supabase
    .from('profiles')
    .select('id, full_name, avatar_url, slug, rota_number')
    .in('id', userIds)

// Buscar rank_id de cada usuário
const { data: gamification } = await this.supabase
    .from('user_gamification')
    .select('user_id, current_rank_id')
    .in('user_id', userIds)

const profileMap = new Map<string, any>()
profiles?.forEach(p => profileMap.set(p.id, p))

// Mapa de ranks
const rankMap = new Map<string, string>()
gamification?.forEach(g => rankMap.set(g.user_id, g.current_rank_id))
```

**Adicionar rank_id ao objeto user:**
```typescript
user: {
    id: profile?.id || post.user_id,
    full_name: profile?.full_name || 'Usuário',
    avatar_url: profile?.avatar_url || null,
    slug: profile?.slug || null,
    rota_number: profile?.rota_number || null,
    rank_id: rankMap.get(post.user_id) || null  // ← ADICIONAR ESTA LINHA
},
```

**Para confrarias (linhas 196-220):**
```typescript
// Buscar ranks dos membros
const { data: memberGamification } = await this.supabase
    .from('user_gamification')
    .select('user_id, current_rank_id')
    .in('user_id', memberIds)

members?.forEach(m => memberMap.set(m.id, m))

// Mapa de ranks dos membros
const memberRankMap = new Map<string, string>()
memberGamification?.forEach(g => memberRankMap.set(g.user_id, g.current_rank_id))

// Adicionar rank_id aos perfis dos membros
memberIds.forEach(id => {
    const member = memberMap.get(id)
    if (member) {
        member.rank_id = memberRankMap.get(id) || null
    }
})
```

---

## 📐 PADRÃO DE CÓDIGO

### Template Base (Copiar e Colar)

```tsx
{/* Container do Avatar */}
<div className="relative">
    {/* Avatar com LogoFrame */}
    <div className="relative w-[TAMANHOpx] h-[TAMANHOpx]">
        <LogoFrameAvatar
            src={AVATAR_URL}
            alt={NOME_USUARIO}
            size="TAMANHO"
            className="w-full h-full"
        />
        
        {/* Badge de Patente */}
        {RANK_ID && (
            <div className="absolute bottom-[Ypx] right-[Xpx] z-[5]">
                <RankInsignia
                    rankId={RANK_ID}
                    size="xs"
                    variant="icon-only"
                    className="w-[TAMANHOpx] h-[TAMANHOpx] border-[ESPESSURApx] border-white"
                />
            </div>
        )}
    </div>
</div>
```

---

## 🎨 GUIA DE TAMANHOS

### Escolhendo o Tamanho do Avatar

| Contexto | Avatar | LogoFrame Size | Badge | Border |
|----------|--------|----------------|-------|--------|
| Muito Pequeno (listas) | 32-40px | `xs` | 16-18px | 1px |
| Pequeno (cards) | 48-58px | `sm` | 24-28px | 1.5px |
| Médio (destaque) | 64-80px | `md` | 28-32px | 1.5px |
| Grande (header mobile) | 116px | `lg` | 36px | 1.5px |
| Extra Grande (header desktop) | 175px | `lg` | 50px | 2px |

### Posicionamento do Badge

**Regra geral:** Quanto maior o avatar, maior o offset do badge.

**Fórmula aproximada:**
```
offset = Math.floor(avatarSize * 0.05)
```

**Exemplos:**
- 32px → `bottom-[1px] right-[1px]`
- 48px → `bottom-[1px] right-[1px]`
- 58px → `bottom-[0px] right-[0px]`
- 116px → `bottom-[8px] right-[8px]`
- 175px → `bottom-[18px] right-[18px]`

---

## ⚠️ TROUBLESHOOTING

### Badge não aparece

**Problema:** O badge de patente não está sendo renderizado.

**Checklist:**
1. ✅ O `rank_id` está sendo passado corretamente?
2. ✅ O componente `RankInsignia` está importado?
3. ✅ Usa `variant="icon-only"`?
4. ✅ O banco retorna o `current_rank_id` da tabela `user_gamification`?

**Solução:** Verificar se o serviço está buscando o rank_id (ver seção "DADOS: BUSCA DO RANK_ID").

---

### Badge com círculo branco extra

**Problema:** Badge aparece com borda branca dupla ou círculo branco de fundo.

**Causa:** Usando `variant="avatar"` em vez de `variant="icon-only"`.

**Solução:**
```tsx
// ❌ ERRADO
<RankInsignia variant="avatar" />

// ✅ CORRETO
<RankInsignia variant="icon-only" />
```

---

### Badge fora do avatar

**Problema:** Badge aparece muito afastado ou sobrepondo outras áreas.

**Causa:** Posicionamento incorreto (`bottom` e `right`).

**Solução:** Ajustar valores de acordo com a tabela de tamanhos acima.

---

### Avatar sem frame de montanhas

**Problema:** Avatar aparece sem o frame de losango com montanhas.

**Causa:** Usando componente errado ou importação incorreta.

**Solução:**
```tsx
// ✅ Importar corretamente
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'

// ✅ Usar o componente
<LogoFrameAvatar src={avatar} alt={name} size="sm" />
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

Ao implementar um novo avatar com badge, siga esta checklist:

- [ ] Importar `LogoFrameAvatar` de `/components/profile/logo-frame-avatar`
- [ ] Importar `RankInsignia` de `/components/gamification/rank-insignia`
- [ ] Criar container `relative` para o avatar
- [ ] Adicionar `LogoFrameAvatar` com tamanho apropriado
- [ ] Verificar se `rank_id` está disponível nos dados
- [ ] Adicionar badge com `variant="icon-only"`
- [ ] Posicionar badge com `absolute bottom-[X] right-[X]`
- [ ] Adicionar `z-[5]` para garantir que badge fique acima
- [ ] Adicionar borda branca no badge
- [ ] Testar em diferentes resoluções

---

## 🔄 HISTÓRICO DE MUDANÇAS

### 30/01/2026 - v1.0
- ✅ Padronização completa de avatares
- ✅ Substituição de `AvatarWithRank` por `LogoFrameAvatar + RankInsignia`
- ✅ Ajustes de tamanho e posicionamento em todos os locais
- ✅ Correção do `PostsService` para buscar `rank_id`
- ✅ Documentação completa criada

---

## 📞 SUPORTE

Se encontrar problemas não cobertos nesta documentação:

1. Verificar o código de referência nos arquivos mencionados
2. Consultar a seção de Troubleshooting
3. Revisar o padrão de código (template base)
4. Verificar importações e props obrigatórias

---

**🎯 LEMBRE-SE:** 
- **SEMPRE** use `LogoFrameAvatar` + `RankInsignia` (icon-only)
- **NUNCA** use `AvatarWithRank` em novos desenvolvimentos
- **SEMPRE** busque `rank_id` da tabela `user_gamification`
- **SEMPRE** use `variant="icon-only"` no RankInsignia
