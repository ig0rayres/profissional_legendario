# 📱 Módulo "Na Rota" - Feed Social

*Atualizado em: 21/01/2026*

## 🎯 Objetivo
Feed social integrado com confrarias. Usuários postam fotos/vídeos das confrarias realizadas, que são validadas por IA antes de serem publicadas e creditarem medalhas.

---

## 🔄 Fluxo Principal

```
1. Confraria Agendada (status: accepted)
         ↓
2. Aparece no "Histórico de Confrarias" do usuário
         ↓
3. Usuário clica "Marcar como Realizada"
         ↓
4. Upload de foto/vídeo (OBRIGATÓRIO)
         ↓
5. IA valida a foto (OpenAI Vision)
   ├── ✅ Aprovada (2+ pessoas detectadas)
   │      ↓
   │   Auto-post no "Na Rota" + Crédito de Medalhas
   │
   └── ❌ Rejeitada (foto inválida)
          ↓
       Mensagem de erro + Pede nova foto
```

---

## 🤖 Validação por IA (OpenAI Vision)

### API: `/api/validate-confraternity`

```typescript
// Prompt para validação
const prompt = `Analise esta imagem e verifique se ela mostra uma reunião ou confraternização entre 2 ou mais pessoas.

Critérios para APROVAÇÃO:
- Deve haver pelo menos 2 pessoas visíveis na foto
- Deve parecer uma reunião, encontro ou confraternização
- Pode ser em restaurante, café, escritório, área externa, etc.

Critérios para REJEIÇÃO:
- Foto de apenas 1 pessoa (selfie solo)
- Foto de paisagem sem pessoas  
- Foto de objetos/comida sem pessoas
- Imagem desfocada demais para identificar pessoas

Responda APENAS com um JSON:
{
  "approved": true/false,
  "people_count": número de pessoas detectadas,
  "confidence": "high" | "medium" | "low",
  "reason": "breve explicação"
}
`
```

### Respostas Esperadas:
```json
// Aprovada
{
  "approved": true,
  "people_count": 3,
  "confidence": "high",
  "reason": "Foto mostra 3 pessoas em um café, aparentando uma reunião"
}

// Rejeitada
{
  "approved": false,
  "people_count": 1,
  "confidence": "high",
  "reason": "Apenas 1 pessoa visível na foto (selfie)"
}
```

---

## 📋 Funcionalidades Atualizadas

### 1. Histórico de Confrarias (Pendentes)
- [ ] Ver confrarias aceitas ainda não realizadas
- [ ] Botão "Marcar como Realizada"
- [ ] Prazo para upload (ex: 7 dias após data proposta)

### 2. Marcar Confraria como Realizada
- [x] Formulário existente: `ConfraternityCompleteForm.tsx`
- [ ] **ATUALIZAR**: Tornar upload de foto OBRIGATÓRIO
- [ ] **NOVO**: Validação por IA antes de salvar
- [ ] **NOVO**: Feedback visual do status da IA
- [ ] **NOVO**: Auto-post no feed após aprovação

### 3. Feed "Na Rota"
- [ ] Feed com posts de confrarias aprovadas
- [ ] Tag visual "Confraria Verificada ✓"
- [ ] Likes e comentários
- [ ] Filtro: Global / Meus Posts / Elos

### 4. Interações
- [ ] Curtir post
- [ ] Comentar (básico, sem replies por enquanto)
- [ ] Ver perfil do autor

---

## 🗄️ Schema do Banco

### Tabela: `posts`
```sql
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    confraternity_id UUID REFERENCES confraternities(id) ON DELETE SET NULL,
    ai_validation JSONB, -- Resultado da validação por IA
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_confraternity ON posts(confraternity_id);
```

### Tabela: `post_likes`
```sql
CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);
```

### Tabela: `post_comments`
```sql
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_post ON post_comments(post_id);
```

### Atualização: `confraternities`
```sql
-- Adicionar coluna para status de validação
ALTER TABLE confraternities 
ADD COLUMN IF NOT EXISTS ai_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_validation_result JSONB,
ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES posts(id);
```

---

## 📁 Estrutura de Arquivos

```
/app/
  na-rota/
    page.tsx                    # Feed principal
    
  api/
    validate-confraternity/
      route.ts                  # API de validação por IA
    posts/
      route.ts                  # CRUD de posts

/components/
  confraternity/
    ConfraternityCompleteForm.tsx  # ATUALIZAR: + validação IA
    ConfraternityInviteCard.tsx    # Já existe
    ConfraternityPendingList.tsx   # NOVO: Lista de pendentes
    
  na-rota/
    post-card.tsx               # Card de post no feed
    post-actions.tsx            # Like, comment buttons
    feed.tsx                    # Lista de posts
    
/lib/api/
  posts.ts                      # API de posts
```

---

## 🔧 Implementação - Ordem

### Fase 1: Validação por IA (HOJE)
1. ✅ Criar API `/api/validate-confraternity`
2. ⬜ Atualizar `ConfraternityCompleteForm.tsx`:
   - Tornar foto obrigatória
   - Chamar API de validação após upload
   - Mostrar resultado antes de confirmar

### Fase 2: Schema e Feed Básico
1. ⬜ Criar tabelas SQL (posts, post_likes, post_comments)
2. ⬜ RLS policies
3. ⬜ API `/lib/api/posts.ts`
4. ⬜ Página `/app/na-rota/page.tsx`

### Fase 3: Integração
1. ⬜ Auto-post após confraria aprovada
2. ⬜ Medalhas só com foto validada
3. ⬜ Componente de feed no dashboard

### Fase 4: Interações
1. ⬜ Sistema de likes
2. ⬜ Sistema de comentários
3. ⬜ Notificações de interação

---

## 🎮 Gamificação Atualizada

| Medalha | Critério | Validação |
|---------|----------|-----------|
| `primeira_confraria` | 1ª confraria | **Foto validada por IA** |
| `networker_ativo` | 2 confrarias/mês | **Fotos validadas por IA** |
| `lider_confraria` | 5 confrarias/mês | **Fotos validadas por IA** |
| `mestre_conexoes` | 10 confrarias/mês | **Fotos validadas por IA** |
| `cronista` | Enviar foto | **Foto validada por IA** |

---

## 💡 UX do Fluxo

### Tela de "Marcar como Realizada"
```
┌─────────────────────────────────────┐
│  ✓ Confraria Realizada              │
│  Com: João Silva                    │
├─────────────────────────────────────┤
│  📷 Foto da Confraria *OBRIGATÓRIO* │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    [+ Adicionar Foto]       │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ⚠️ A foto será validada por IA    │
│  Deve mostrar 2+ pessoas            │
│                                     │
│  📝 Depoimento (opcional)           │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Cancelar]  [Validar e Confirmar]  │
└─────────────────────────────────────┘
```

### Após Validação
```
┌─────────────────────────────────────┐
│  🤖 Validando foto...               │
│  ████████████░░░░░░░░               │
└─────────────────────────────────────┘

✅ APROVADA:
┌─────────────────────────────────────┐
│  ✅ Foto Aprovada!                  │
│  Detectamos 3 pessoas na imagem     │
│                                     │
│  ☑️ Publicar no "Na Rota"          │
│                                     │
│  [Confirmar Confraria]              │
└─────────────────────────────────────┘

❌ REJEITADA:
┌─────────────────────────────────────┐
│  ❌ Foto não aprovada               │
│  "Apenas 1 pessoa detectada"        │
│                                     │
│  Envie uma foto que mostre você     │
│  e seu parceiro de confraria.       │
│                                     │
│  [Enviar outra foto]                │
└─────────────────────────────────────┘
```

---

*Próximo: Criar API de validação por IA*
