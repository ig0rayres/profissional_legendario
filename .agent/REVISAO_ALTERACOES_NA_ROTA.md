# 🔍 REVISÃO MINUCIOSA - ALTERAÇÕES NA ROTA/CONFRARIAS

**Data:** 28/01/2026 - 08:27  
**Revisor:** Equipe de Desenvolvimento

---

## 📊 REGRAS DE PONTUAÇÃO ROTA VALENTE - CONFRARIAS

### PONTOS DIRETOS (point_actions)

| Ação | Pontos Base | Limite/Dia | Implementado |
|------|-------------|------------|--------------|
| `confraternity_invite_sent` | 10 | - | ✅ linha 208 |
| `confraternity_invite_accepted` | 10 | - | ✅ linha 261 |
| `confraternity_completed` | 50 | - | ✅ linha 477 |
| `confraternity_photos` | 20/foto | - | ✅ linha 486 |
| `confraternity_testimonial` | 15 | - | ✅ linha 510 |
| `confraternity_confirmed` | 50 | - | ✅ linha 793 |

### PROEZAS MENSAIS (proezas)

| Proeza | Critério | Pontos | Implementado |
|--------|----------|--------|--------------|
| `primeira_confraria` | 1ª confraria | 50 | ✅ linha 527-529 |
| `networker_ativo` | 5 confrarias/mês | 100 | ⚠️ linha 567 (via achievement) |
| `lider_confraria` | 10 confrarias/mês | 200 | ⚠️ comentado |
| `anfitriao` | 1+ como host | 100 | ✅ linha 533-543 |
| `cronista` | Upload foto | 50 | ✅ linha 493-505 |

### MEDALHAS PERMANENTES (medals)

| Medalha | Critério | Pontos | Implementado |
|---------|----------|--------|--------------|
| `presente` | 1º convite aceito | 50 | ✅ linha 278-283 |
| `mestre_conexoes` | 20 confrarias total | 300 | ⚠️ comentado |

---

## 📋 RESUMO DAS ALTERAÇÕES REALIZADAS

### 1. API de Validação de Fotos (`validate-confraternity/route.ts`)
**Status:** ✅ Alterado  
**Impacto na Gamificação:** ⚠️ NENHUM

**O que foi feito:**
- Simplificado o prompt da IA para apenas contar pessoas
- Antes: Exigia contexto de "reunião/encontro"
- Agora: Apenas verifica "2+ pessoas na foto"

**Análise:**
- Esta alteração NÃO afeta a pontuação
- A validação de foto é um GATE antes do `completeConfraternity()`
- Os pontos são creditados DEPOIS da validação, via funções em `confraternity.ts`
- ✅ **SEGURO** - Não interfere no Rota Valente

---

### 2. Componente PostCard (`post-card.tsx`)
**Status:** ✅ Reescrito  
**Impacto na Gamificação:** ⚠️ NENHUM DIRETO

**O que foi adicionado:**
- Seção de comentários inline
- Botão de compartilhar funcional
- Modal de edição
- Estado local de likes/comments

**Análise de Confrarias:**
- Posts de confraria são criados via `ConfraternityCompleteForm.tsx`
- Os pontos de confraria são creditados em `confraternity.ts` ao criar/completar
- O PostCard apenas EXIBE o post, não afeta a gamificação
- ✅ **SEGURO** - Não cria duplicação de pontos

---

### 3. Componente PostComments (`post-comments.tsx`)
**Status:** ✅ NOVO  
**Impacto na Gamificação:** ⚠️ PARCIAL

**Pontos Relacionados do Schema:**
```sql
('post_comment_sent', 'Comentar', 5, 'feed', 10),
('post_comment_received', 'Receber comentário', 5, 'feed', 20)
```

**Verificação:** O código de inserção de comentário NÃO chama `awardPoints()`.
Os pontos dependem de **trigger no banco** ou chamada explícita.

⚠️ **AÇÃO NECESSÁRIA:** Verificar se trigger existe ou adicionar chamada de pontos.

---

### 4. Componente EditPostModal (`edit-post-modal.tsx`)
**Status:** ✅ NOVO  
**Impacto na Gamificação:** ✅ NENHUM (correto)

- Apenas atualiza `content`, `visibility`, `updated_at`
- Não dispara gamificação
- ✅ **CORRETO** - Conforme requisito

---

## ✅ VERIFICAÇÃO DAS REGRAS DE CONFRARIA

### Código em `lib/api/confraternity.ts` - NÃO FOI ALTERADO

| Função | Pontos Implementados | Status |
|--------|---------------------|--------|
| `sendConfraternityInvite()` | +10 pts | ✅ Intacto |
| `acceptConfraternityInvite()` | +10 pts + medalha "presente" | ✅ Intacto |
| `completeConfraternity()` | +50 pts + fotos + depoimento + badges | ✅ Intacto |
| `confirmConfraternityPartner()` | +50 pts + depoimento | ✅ Intacto |

**CONCLUSÃO:** A lógica de gamificação de confrarias está **100% preservada**.

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Comentários em posts de confraria

O componente `PostComments` que criei faz insert direto no banco:
```typescript
await supabase.from('post_comments').insert({...})
```

**NÃO foi adicionada chamada de pontos.**

Para corrigir, devemos decidir:
- **Opção A:** Adicionar trigger SQL no banco
- **Opção B:** Adicionar chamada `awardPoints()` após insert no frontend

### 2. Edição de post de confraria

O modal de edição permite editar conteúdo de qualquer post.
Para posts de confraria, isso inclui o depoimento.

**Análise:** Os pontos de depoimento são creditados APENAS na criação (`completeConfraternity`). 
Editar o depoimento depois NÃO gera pontos extras. ✅ Correto.

---

## 🎯 MATRIZ DE IMPACTO FINAL

| Alteração | Afeta Pontuação | Afeta Medalhas | Afeta Proezas |
|-----------|-----------------|----------------|---------------|
| Validação IA simplificada | ❌ Não | ❌ Não | ❌ Não |
| PostCard reescrito | ❌ Não | ❌ Não | ❌ Não |
| PostComments novo | ⚠️ Pendente | ❌ Não | ❌ Não |
| EditPostModal novo | ❌ Não | ❌ Não | ❌ Não |
| Feed onRefresh | ❌ Não | ❌ Não | ❌ Não |

---

## ✅ CONFIRMAÇÃO FINAL

As alterações realizadas **NÃO AFETAM** a lógica de gamificação de confrarias:

1. ✅ `sendConfraternityInvite()` - Intacto
2. ✅ `acceptConfraternityInvite()` - Intacto  
3. ✅ `completeConfraternity()` - Intacto
4. ✅ `confirmConfraternityPartner()` - Intacto
5. ✅ Multiplicador por plano - Intacto

**IMPLEMENTADO (28/01/2026):**
- ✅ `PostComments` agora chama API centralizada `/api/rota-valente/award`
- ✅ Pontos de comentário passam pelo multiplicador
- ✅ Limite diário verificado automaticamente
- ✅ `post_comment_sent` = 5 pts, máximo 1/dia
- ✅ `post_comment_received` = REMOVIDO (desativado)

**DOCUMENTAÇÃO ATUALIZADA:**
- ✅ `/docs/ROTA_DO_VALENTE.md`
- ✅ `/docs/ESCOPO_PROJETO.md`
- ✅ `/docs/sessions/ROTA_VALENTE_SCHEMA.md`
- ✅ `/docs/ALTERACAO_PONTOS_COMENTARIOS.md`
- ✅ `/sql/config/CONFIGURAR_PONTOS_COMENTARIO.sql`

---

*Documento revisado em 28/01/2026 - Equipe de Desenvolvimento*
