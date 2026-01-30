# Guia de Uso - Avatares por Contexto

## 🎯 Mapeamento de Variações

### 📱 ELOS (Conexões)
**Variação:** `small` (48px)
- Lista de elos do usuário
- Cards de sugestões de conexão
- Elos pendentes/aceitos

```tsx
import { StandardAvatar } from '@/components/ui/standard-avatar'

// Lista de Elos
<StandardAvatar 
    variant="small" 
    user={elo.user} 
    showRank 
    linkToProfile 
/>
```

---

### 🛣️ NA ROTA (Feed)
**Variação:** `medium` (64px)
- Posts no feed principal
- Autor de cada post
- Compartilhamentos

```tsx
// Post no Feed
<StandardAvatar 
    variant="medium" 
    user={post.author} 
    showRank 
    linkToProfile 
/>
```

---

### 🏆 RANKINGS
**Variação:** `small` (48px)
- Lista de ranking geral
- Top usuários
- Tabelas de classificação

```tsx
// Item do Ranking
<StandardAvatar 
    variant="small" 
    user={rankedUser} 
    showRank 
    linkToProfile 
/>
```

---

### 💼 PROFISSIONAIS
**Variação:** `medium` (64px)
- Cards de profissionais
- Lista de profissionais
- Busca de profissionais

```tsx
// Card de Profissional
<StandardAvatar 
    variant="medium" 
    user={professional} 
    showRank 
    linkToProfile 
/>
```

---

## 📊 Resumo Visual

| Contexto | Variação | Tamanho | Patente | Link |
|----------|----------|---------|---------|------|
| **Elos** | `small` | 48px | ✅ | ✅ |
| **Na Rota** | `medium` | 64px | ✅ | ✅ |
| **Rankings** | `small` | 48px | ✅ | ✅ |
| **Profissionais** | `medium` | 64px | ✅ | ✅ |

---

## 🔧 Exemplos Completos

### Componente de Elos
```tsx
// components/profile/elos-list.tsx
import { StandardAvatar } from '@/components/ui/standard-avatar'

export function ElosList({ elos }) {
    return (
        <div className="space-y-3">
            {elos.map(elo => (
                <div key={elo.id} className="flex items-center gap-3 p-3 bg-card rounded-lg">
                    <StandardAvatar 
                        variant="small" 
                        user={elo.user} 
                        showRank 
                        linkToProfile 
                    />
                    <div className="flex-1">
                        <h4 className="font-bold">{elo.user.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                            {elo.user.rota_number}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
```

### Feed Na Rota
```tsx
// components/profile/na-rota-feed.tsx
import { StandardAvatar } from '@/components/ui/standard-avatar'

export function NaRotaPost({ post }) {
    return (
        <div className="bg-card rounded-xl p-4">
            <div className="flex gap-3 mb-3">
                <StandardAvatar 
                    variant="medium" 
                    user={post.author} 
                    showRank 
                    linkToProfile 
                />
                <div>
                    <h3 className="font-bold">{post.author.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {post.created_at}
                    </p>
                </div>
            </div>
            <p>{post.content}</p>
        </div>
    )
}
```

### Ranking
```tsx
// components/ranking/ranking-item.tsx
import { StandardAvatar } from '@/components/ui/standard-avatar'

export function RankingItem({ user, position }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
            <div className="text-2xl font-bold text-primary w-8">
                #{position}
            </div>
            <StandardAvatar 
                variant="small" 
                user={user} 
                showRank 
                linkToProfile 
            />
            <div className="flex-1">
                <h4 className="font-bold">{user.full_name}</h4>
                <p className="text-sm text-muted-foreground">
                    {user.total_points} pontos
                </p>
            </div>
        </div>
    )
}
```

### Profissionais
```tsx
// components/professional/professional-card.tsx
import { StandardAvatar } from '@/components/ui/standard-avatar'

export function ProfessionalCard({ professional }) {
    return (
        <div className="bg-card rounded-xl p-4 hover:shadow-lg transition">
            <div className="flex gap-4">
                <StandardAvatar 
                    variant="medium" 
                    user={professional} 
                    showRank 
                    linkToProfile 
                />
                <div className="flex-1">
                    <h3 className="font-bold text-lg">{professional.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                        {professional.profession}
                    </p>
                    <p className="text-sm">{professional.bio}</p>
                </div>
            </div>
        </div>
    )
}
```

---

## 🎨 Contextos Adicionais

### Comentários (em qualquer feed)
**Variação:** `small` (48px)
```tsx
<StandardAvatar variant="small" user={comment.author} linkToProfile />
```

### Notificações
**Variação:** `tiny` (32px)
```tsx
<StandardAvatar variant="tiny" user={notification.sender} />
```

### Header do Perfil
**Variação:** `large` (120-152px)
```tsx
<StandardAvatar variant="large" user={currentUser} showRank />
```

---

## ✅ Checklist de Implementação

Para cada contexto:

- [ ] Importar `StandardAvatar`
- [ ] Escolher variação correta
- [ ] Passar objeto `user` completo
- [ ] Definir `showRank` (se diferente do padrão)
- [ ] Definir `linkToProfile` (geralmente `true`)
- [ ] Testar em mobile e desktop
- [ ] Verificar patente aparecendo corretamente

---

## 🔄 Migração Rápida

### Encontrar avatares antigos:
```bash
# Buscar por avatares customizados
grep -r "avatar_url" components/
grep -r "RankInsignia" components/
```

### Substituir por StandardAvatar:
1. Identificar contexto (Elos, Na Rota, etc)
2. Usar variação correspondente da tabela
3. Substituir código antigo
4. Testar visualmente

---

## 📞 Suporte

Se tiver dúvida sobre qual variação usar:
1. Consulte a tabela de resumo
2. Veja os exemplos completos
3. Use `medium` como padrão se não tiver certeza
