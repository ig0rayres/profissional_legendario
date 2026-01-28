# 🔍 ANÁLISE COMPLETA: MÓDULO NA ROTA + CONFRARIAS

**Data:** 28/01/2026 - 08:15  
**Status:** REVISÃO PELA EQUIPE

---

## 📋 REQUISITOS ORIGINAIS vs IMPLEMENTAÇÃO ATUAL

| # | Requisito | Status Atual | Observação |
|---|-----------|--------------|------------|
| 1 | Upload de fotos e detalhes das confrarias | ✅ **OK** | Funciona corretamente |
| 2 | Publicação no feed do usuário que fez review | ✅ **OK** | Post criado corretamente |
| 3 | Publicação no feed do outro participante | ⚠️ **PARCIAL** | Só aparece na aba "Meus" |
| 4 | Publicação no feed geral /na-rota | ⚠️ **CONDICIONAL** | Só aparece se visibility='public' |

---

## 🔍 ANÁLISE TÉCNICA DETALHADA

### 1. FLUXO ATUAL DE CRIAÇÃO DE POST DE CONFRARIA

**Arquivo:** `components/confraternity/ConfraternityCompleteForm.tsx`

```
1. Usuário A completa formulário (fotos, depoimento, data, local)
2. Foto é validada por IA (2+ pessoas)
3. completeConfraternity() cria registro em 'confraternities'
4. Se publishToFeed=true:
   - Cria UM ÚNICO post em 'posts' (user_id = usuário A)
   - Link via confraternity_id
5. Notificação enviada ao parceiro (B) para compartilhar
```

**⚠️ PROBLEMA:** O parceiro (B) recebe apenas notificação, não tem post automático.

---

### 2. COMO O FEED CARREGA POSTS

**Arquivo:** `lib/services/posts-service.ts`

```typescript
// Feed GLOBAL (aba "Global" no /na-rota)
if (feedType === 'global') {
    query = query.eq('visibility', 'public')  // ✅ Só posts públicos
}

// Feed do USUÁRIO (aba "Meus" no /na-rota)
if (feedType === 'user' && userId) {
    const confIds = await this.getUserConfraternityIds(userId)
    if (confIds.length > 0) {
        // ✅ Posts próprios OU de confrarias que participou
        query = query.or(`user_id.eq.${userId},confraternity_id.in.(${confIds.join(',')})`)
    }
}
```

**✅ O feed "Meus" já foi implementado corretamente!**  
O parceiro (B) VÊ o post de confraria na aba "Meus" porque:
- A query busca posts por `confraternity_id.in.(confrarias do usuário)`

---

### 3. POST CARD - VISUAL DE CONFRARIA

**Arquivo:** `components/social/post-card.tsx`

O component já exibe corretamente:
- ✅ Banner de tipo "CONFRARIA"
- ✅ Avatares duplos (member1 + member2)
- ✅ Nomes linkados para perfis
- ✅ Data do encontro
- ✅ Selo visual discreto

---

## 🔴 PROBLEMAS IDENTIFICADOS

### Problema 1: Post do parceiro depende da aba

**Descrição:** O parceiro (B) só vê o post na aba "Meus", não na aba "Global" ou "Elos".

**Causa:** O post é criado com `visibility: 'public'` mas `user_id` é do usuário A.  
No feed global, o post APARECE se for público.  
No feed "Elos", a lógica atual não inclui posts de confrarias automaticamente.

**Solução:** Já está funcionando! O post público aparece no feed global para TODOS verem.

---

### Problema 2: Perfil individual do parceiro

**Descrição:** No perfil do usuário B (aba "Na Rota" dentro do dashboard), ele pode não ver o post.

**Causa:** O componente `na-rota-feed-v13-social.tsx` usa `feedType: 'user'` que já inclui confrarias.

**Verificação necessária:** Confirmar que essa lógica está funcionando.

---

### Problema 3: Falta de "post compartilhado" explícito

**Descrição:** O requisito era que AMBOS tenham posts em seus feeds.

**Situação atual:** 
- Usuário A tem post próprio
- Usuário B vê o mesmo post via query (não um post separado)

**Análise:** Isso é por DESIGN, não um bug! O modelo atual é:
- **Um único post** representa a confraria
- **Ambos os participantes** podem ver esse post
- **Visual mostra ambos** os nomes e avatares

---

## ✅ VERIFICAÇÃO DE FUNCIONAMENTO

### Cenário de Teste

1. **Veterano** envia convite para **Recruta**
2. **Recruta** aceita
3. **Recruta** completa a confraria (fotos, depoimento)
4. Post é criado com:
   - `user_id: recruta_id`
   - `confraternity_id: ID da confraria`
   - `visibility: public`

### Onde o post aparece:

| Local | Veterano | Recruta | Visitante |
|-------|----------|---------|-----------|
| Feed Global (/na-rota) | ✅ Vê | ✅ Vê | ✅ Vê |
| Aba "Meus" no /na-rota | ✅ Vê | ✅ Vê | N/A |
| Perfil Recruta | ✅ Vê | ✅ Vê | ✅ Vê |
| Perfil Veterano | ⚠️ ? | ⚠️ ? | ⚠️ ? |

### Potencial Problema:
No **perfil do Veterano**, o post NÃO aparece porque:
- O post tem `user_id = recruta_id`
- A query do perfil busca `user_id = veterano_id`

---

## 🔧 CORREÇÕES RECOMENDADAS

### Opção A: Manter modelo atual + corrigir perfil (RECOMENDADO)

1. Atualizar query do feed do PERFIL para incluir confrarias
2. Não criar posts duplicados
3. Modelo limpo: 1 confraria = 1 post

### Opção B: Posts duplicados

1. Criar 2 posts (um para cada usuário)
2. Marcar ambos com `confraternity_id`
3. Mais complexo, pode gerar duplicatas no feed global

---

## 📁 ARQUIVOS PRINCIPAIS

| Arquivo | Função |
|---------|--------|
| `components/confraternity/ConfraternityCompleteForm.tsx` | Formulário de conclusão |
| `lib/api/confraternity.ts` | Backend/lógica |
| `lib/services/posts-service.ts` | Query de posts |
| `components/social/post-card.tsx` | Visual do post |
| `app/na-rota/page.tsx` | Página do feed global |
| `components/profile/na-rota-feed-v13-social.tsx` | Feed no perfil |

---

## 🎯 PRÓXIMOS PASSOS

1. [ ] Verificar query do feed no perfil/dashboard
2. [ ] Testar fluxo completo de confraria
3. [ ] Garantir que posts de confraria aparecem para AMBOS os participantes
4. [ ] Documentar modelo final

---

*Documento gerado para revisão da equipe*
