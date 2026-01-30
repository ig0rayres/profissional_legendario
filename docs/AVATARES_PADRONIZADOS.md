# Sistema de Avatares Padronizados

## 📋 Visão Geral

Sistema unificado de avatares com **4 variações pré-definidas** para uso consistente em toda a aplicação.

## 🎯 As 4 Variações

### 1. TINY (32px)
**Uso:** Listas compactas, notificações, badges
- Tamanho: 32x32px
- Patente: Opcional (padrão: não mostrar)
- Border: 2px verde
- Exemplo: Lista de seguidores, notificações

```tsx
<StandardAvatar variant="tiny" user={user} />
```

### 2. SMALL (48px)
**Uso:** Comentários, cards pequenos, sidebar
- Tamanho: 48x48px
- Patente: Sim (padrão)
- Border: 2px verde
- Exemplo: Comentários, lista de elos

```tsx
<StandardAvatar variant="small" user={user} linkToProfile />
```

### 3. MEDIUM (64px)
**Uso:** Posts no feed, cards principais
- Tamanho: 64x64px
- Patente: Sim (padrão)
- Border: 3px verde
- Exemplo: Feed "Na Rota", posts

```tsx
<StandardAvatar variant="medium" user={user} showRank linkToProfile />
```

### 4. LARGE (120-152px)
**Uso:** Headers de perfil, páginas de destaque
- Tamanho: 116px mobile / 152px desktop
- Patente: Sim (padrão)
- Border: 4px verde
- Exemplo: Header do dashboard, página de perfil

```tsx
<StandardAvatar variant="large" user={user} showRank />
```

## 🔧 Props

```typescript
interface StandardAvatarProps {
    variant: 'tiny' | 'small' | 'medium' | 'large'  // OBRIGATÓRIO
    user: StandardAvatarUser                         // OBRIGATÓRIO
    showRank?: boolean                               // Opcional (usa padrão da variação)
    linkToProfile?: boolean                          // Opcional (padrão: false)
    frameStyle?: 'simple' | 'diamond'               // Opcional (apenas large)
    className?: string                               // Classes adicionais
}
```

## 📦 Objeto User

```typescript
interface StandardAvatarUser {
    id: string
    full_name: string
    avatar_url: string | null
    rank_id?: string        // ID da patente
    rank_name?: string      // Nome da patente
    rank_icon?: string      // Ícone da patente
    slug?: string           // Para link de perfil
    rota_number?: string    // ID Rota
}
```

## 💡 Exemplos de Uso

### Feed de Posts
```tsx
import { StandardAvatar } from '@/components/ui/standard-avatar'

function PostCard({ post }) {
    return (
        <div className="flex gap-3">
            <StandardAvatar 
                variant="medium" 
                user={post.author} 
                linkToProfile 
            />
            <div>
                <h3>{post.author.full_name}</h3>
                <p>{post.content}</p>
            </div>
        </div>
    )
}
```

### Lista de Comentários
```tsx
function Comment({ comment }) {
    return (
        <div className="flex gap-2">
            <StandardAvatar 
                variant="small" 
                user={comment.author} 
                linkToProfile 
            />
            <div>
                <p>{comment.text}</p>
            </div>
        </div>
    )
}
```

### Header do Perfil
```tsx
function ProfileHeader({ profile }) {
    return (
        <div>
            <StandardAvatar 
                variant="large" 
                user={profile} 
                showRank 
            />
            <h1>{profile.full_name}</h1>
        </div>
    )
}
```

### Notificações
```tsx
function NotificationItem({ notification }) {
    return (
        <div className="flex gap-2 items-center">
            <StandardAvatar 
                variant="tiny" 
                user={notification.sender} 
            />
            <p>{notification.message}</p>
        </div>
    )
}
```

## 🎨 Customização

### Adicionar classes extras
```tsx
<StandardAvatar 
    variant="medium" 
    user={user} 
    className="ring-2 ring-primary" 
/>
```

### Forçar mostrar/ocultar patente
```tsx
// Forçar mostrar (mesmo em tiny)
<StandardAvatar variant="tiny" user={user} showRank={true} />

// Forçar ocultar (mesmo em large)
<StandardAvatar variant="large" user={user} showRank={false} />
```

## ✅ Vantagens

1. **Consistência**: Todos os avatares seguem o mesmo padrão
2. **Manutenção**: Alterar em um lugar afeta todos
3. **Simplicidade**: Apenas escolher a variação certa
4. **Responsivo**: Tamanhos ajustados automaticamente
5. **Performance**: Otimizado com Next.js Image

## 🚫 O que NÃO fazer

❌ Criar avatares customizados em cada componente
❌ Usar tamanhos diferentes dos pré-definidos
❌ Duplicar código de avatar
❌ Ignorar as variações padrão

## 📍 Onde Usar Cada Variação

| Variação | Contexto |
|----------|----------|
| **tiny** | Notificações, badges, listas compactas |
| **small** | Comentários, sidebar, cards secundários |
| **medium** | Feed principal, posts, cards principais |
| **large** | Headers de perfil, páginas de destaque |

## 🔄 Migração

Para migrar código existente:

1. Identifique o tamanho do avatar atual
2. Escolha a variação correspondente
3. Substitua pelo `StandardAvatar`
4. Teste visualmente

Exemplo:
```tsx
// ANTES
<div className="w-12 h-12 rounded-xl">
    <Image src={user.avatar_url} ... />
    <RankInsignia ... />
</div>

// DEPOIS
<StandardAvatar variant="small" user={user} />
```
