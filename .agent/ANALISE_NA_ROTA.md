# 📊 ANÁLISE: MÓDULO "NA ROTA" - Feed Social

## 🎯 OBJETIVO
Transformar o módulo "Na Rota" em uma rede social completa onde usuários podem:
- Publicar fotos e vídeos
- Curtir, comentar e compartilhar
- Validar medalhas e proezas com fotos
- Feed centralizado na página inicial

---

## ✅ O QUE JÁ EXISTE

### 1. **BANCO DE DADOS** ✅
**Arquivo:** `sql/deploy/DEPLOY_NA_ROTA.sql`

#### Tabelas criadas:
- ✅ `posts` - Postagens com fotos/vídeos
  - Suporta múltiplas mídias (JSONB)
  - Visibilidade (public, connections, private)
  - Contadores de likes e comentários
  - Validação por IA (JSONB)
  - Relação com confrarias

- ✅ `post_likes` - Curtidas
  - Relação post + usuário
  - Trigger automático para atualizar contador

- ✅ `post_comments` - Comentários
  - Conteúdo de texto
  - Trigger automático para atualizar contador

#### Recursos implementados:
- ✅ RLS Policies (segurança)
- ✅ Triggers para contadores
- ✅ Realtime habilitado
- ✅ Índices para performance
- ✅ Integração com confrarias

### 2. **COMPONENTE DE VISUALIZAÇÃO** ✅
**Arquivo:** `components/profile/user-mural.tsx`

#### Funcionalidades:
- ✅ Feed de atividades do usuário
- ✅ Exibição de ratings, portfolio, confrarias
- ✅ Formatação de data relativa
- ✅ Cards visuais por tipo de atividade

#### Limitações atuais:
- ❌ Não carrega posts da tabela `posts`
- ❌ Não tem botões de curtir/comentar
- ❌ Não permite criar novos posts
- ❌ Não tem upload de mídia

---

## 🚧 O QUE FALTA IMPLEMENTAR

### 1. **COMPONENTE DE CRIAÇÃO DE POST** 🔴
- [ ] Modal/formulário para criar post
- [ ] Upload de fotos (múltiplas)
- [ ] Upload de vídeos
- [ ] Seletor de visibilidade
- [ ] Preview de mídia
- [ ] Validação de tamanho/formato

### 2. **COMPONENTE DE POST** 🔴
- [ ] Card de post com mídia
- [ ] Botão de curtir (com contador)
- [ ] Botão de comentar
- [ ] Botão de compartilhar
- [ ] Lista de comentários
- [ ] Menu de opções (editar/deletar)

### 3. **FEED GLOBAL** 🔴
- [ ] Página `/na-rota` ou `/feed`
- [ ] Carrega posts de todos os usuários
- [ ] Infinite scroll
- [ ] Filtros (todos, conexões, confrarias)
- [ ] Ordenação (recentes, populares)

### 4. **INTEGRAÇÃO COM GAMIFICAÇÃO** 🔴
- [ ] Validação de medalhas via foto
- [ ] Validação de proezas via foto
- [ ] IA para verificar requisitos
- [ ] Aprovação automática/manual

### 5. **STORAGE** 🔴
- [ ] Bucket para fotos de posts
- [ ] Bucket para vídeos de posts
- [ ] Compressão de imagens
- [ ] Thumbnails de vídeos
- [ ] Políticas de acesso

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: INFRAESTRUTURA** (2-3 horas)
1. ✅ Executar `DEPLOY_NA_ROTA.sql` no Supabase
2. 🔴 Criar buckets de storage
3. 🔴 Configurar políticas de storage
4. 🔴 Criar funções auxiliares (get_feed, etc)

### **FASE 2: COMPONENTES BÁSICOS** (4-5 horas)
1. 🔴 Componente `CreatePostModal`
   - Formulário
   - Upload de mídia
   - Preview

2. 🔴 Componente `PostCard`
   - Exibição de mídia
   - Botões de interação
   - Contador de likes/comentários

3. 🔴 Componente `CommentsList`
   - Lista de comentários
   - Formulário de novo comentário

### **FASE 3: FEED** (3-4 horas)
1. 🔴 Página `/na-rota`
2. 🔴 Carregamento de posts
3. 🔴 Infinite scroll
4. 🔴 Filtros e ordenação

### **FASE 4: INTEGRAÇÕES** (3-4 horas)
1. 🔴 Integração com gamificação
2. 🔴 Validação por IA (opcional)
3. 🔴 Notificações
4. 🔴 Compartilhamento

### **FASE 5: POLIMENTO** (2-3 horas)
1. 🔴 Animações
2. 🔴 Loading states
3. 🔴 Error handling
4. 🔴 Testes

---

## 🎨 DESIGN SYSTEM

### Cores (V13):
- **Verde:** `#1E4D40` (primário)
- **Laranja:** `#D2691E` (destaque)
- **Cinza:** `#2D3142` (texto)
- **Branco:** Background dos cards

### Componentes:
- Cards brancos com sombra
- Ícones animados
- Hover effects
- Gradientes sutis

---

## 📊 ESTRUTURA DE DADOS

### Post:
```typescript
interface Post {
  id: string
  user_id: string
  content: string
  media_urls: string[]
  confraternity_id?: string
  ai_validation?: object
  visibility: 'public' | 'connections' | 'private'
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
}
```

### Like:
```typescript
interface PostLike {
  post_id: string
  user_id: string
  created_at: string
}
```

### Comment:
```typescript
interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar o SQL** no Supabase
2. **Criar buckets** de storage
3. **Implementar CreatePostModal**
4. **Implementar PostCard**
5. **Criar página de feed**

---

## 📝 NOTAS

- O schema já está pronto e bem estruturado
- Falta apenas implementar os componentes React
- A integração com gamificação pode ser feita depois
- Priorizar funcionalidades básicas primeiro (CRUD de posts)
