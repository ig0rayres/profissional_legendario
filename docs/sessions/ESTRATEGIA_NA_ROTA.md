# Estratégia Centralizada - Módulo "Na Rota"

## 🎯 Objetivo
Centralizar toda a lógica do módulo "Na Rota" para eliminar duplicação e garantir funcionamento consistente.

## 📊 Análise Atual

### Problemas Identificados:

1. **Duplicação de Código**
   - `app/na-rota/page.tsx` (766 linhas) → Feed global da plataforma
   - `components/profile/na-rota-feed-v13-social.tsx` (213 linhas) → Feed do perfil do usuário
   - Ambos têm lógica de carregamento de posts separada

2. **Modais de Publicação**
   - `create-post-modal.tsx` → Modal antigo (com medalhas)
   - `create-post-modal-v2.tsx` → Modal novo (sóbrio, sem medalhas)
   - O feed do perfil ainda usa o modal antigo

3. **PostCard**
   - Atualizado recentemente com links clicáveis e patches sóbrios
   - Página `/na-rota` NÃO usa o componente PostCard centralizado
   - Ela tem seu próprio render de posts inline

4. **Queries Inconsistentes**
   - Feed do perfil: usa `posts_user_id_fkey`
   - Página na-rota: usa `user_id` direto
   - Campos buscados são diferentes

---

## 🏗️ Arquitetura Proposta

### 1. Serviço Centralizado de Posts
```
/lib/services/posts-service.ts
├── loadPosts(options: PostQueryOptions)
├── loadPostById(id)
├── createPost(postData)
├── deletePost(id)
├── toggleLike(postId, userId)
└── loadSidebar() // ranking, medals, confrarias
```

### 2. Hook Reutilizável
```
/hooks/use-posts.ts
├── usePosts({ feedType, userId })
│   ├── posts
│   ├── loading
│   ├── loadMore()
│   └── refresh()
```

### 3. Componentes Unificados
```
/components/social/
├── post-card.tsx ✅ (já atualizado)
├── post-feed.tsx (NOVO - combina lógica)
├── create-post-modal-v2.tsx ✅ (já criado)
├── post-type-patch.tsx ✅ (já criado)
├── feed-sidebar.tsx (NOVO - ranking/medals/agenda)
└── na-rota-layout.tsx (NOVO - layout compartilhado)
```

### 4. Páginas Simplificadas
```
/app/na-rota/page.tsx → Usa componentes centralizados
/app/dashboard/page.tsx → Usa NaRotaFeedV13 (atualizado)
```

---

## 📋 Plano de Implementação

### Fase 1: Serviço de Posts (Hoje)
- [ ] Criar `/lib/services/posts-service.ts`
- [ ] Query padronizada para posts
- [ ] Funções de like/unlike

### Fase 2: Hook de Posts (Hoje)
- [ ] Criar `/hooks/use-posts.ts`
- [ ] Gerenciar estado de posts
- [ ] Paginação/infinite scroll

### Fase 3: Atualizar Página Na Rota (Hoje)
- [ ] Usar PostCard centralizado
- [ ] Usar CreatePostModalV2
- [ ] Layout no estilo do dashboard
- [ ] Sidebar com ranking/medals/agenda

### Fase 4: Atualizar Feed do Perfil (Próximo)
- [ ] Usar hook de posts
- [ ] Usar CreatePostModalV2

---

## 🔧 Campos Padronizados para Query de Posts

```typescript
interface PostQuery {
    id: string
    user_id: string
    content: string | null
    media_urls: string[]
    visibility: 'public' | 'connections' | 'private'
    post_type: 'confraria' | 'em_campo' | 'projeto_entregue' | null
    confraternity_id: string | null
    project_id: string | null
    likes_count: number
    comments_count: number
    created_at: string
    user: {
        id: string
        full_name: string
        avatar_url: string | null
        slug: string | null
        rota_number: string | null
        rank_id: string | null
        rank_icon: string | null
    }
    user_has_liked: boolean
    confraternity?: {
        id: string
        date_occurred: string | null
        member1: UserBasic
        member2: UserBasic
    }
}
```

---

## Status: 🚧 EM IMPLEMENTAÇÃO

Última atualização: 2026-01-27 10:04
