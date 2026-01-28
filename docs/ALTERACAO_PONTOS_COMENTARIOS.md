# 📢 ALTERAÇÃO DE REGRAS - PONTUAÇÃO DE COMENTÁRIOS

**Data:** 28/01/2026  
**Autor:** Equipe de Desenvolvimento  
**Status:** 🟡 AGUARDANDO DEPLOY

---

## 🎯 RESUMO DA ALTERAÇÃO

### O QUE MUDOU

| Antes | Depois |
|-------|--------|
| Comentar em post: 5 pts (até 10x/dia) | Comentar em post: 5 pts (**1x/dia**) |
| Receber comentário: 5 pts (até 20x/dia) | Receber comentário: **0 pts** |

---

## 📋 DETALHES TÉCNICOS

### 1. Ação `post_comment_sent`

- **Pontos:** 5 (mantido)
- **Limite:** 1 por dia (alterado de 10)
- **Descrição:** "Primeiro comentário do dia"
- **Multiplicador:** Aplicado pelo plano (x1 Recruta, x1.5 Veterano, x3 Elite)

### 2. Ação `post_comment_received`

- **Status:** DESATIVADO
- **Motivo:** Comentários recebidos não devem gerar pontos

---

## 🔧 IMPLEMENTAÇÃO

### Frontend: `components/social/post-comments.tsx`

Ao inserir um comentário, chama a API centralizada:

```typescript
await fetch('/api/rota-valente/award', {
    method: 'POST',
    body: JSON.stringify({
        userId: currentUserId,
        actionId: 'post_comment_sent',
        metadata: { post_id, comment_id }
    })
})
```

### Backend: `/api/rota-valente/award/route.ts`

1. Busca configuração da ação no banco (`point_actions`)
2. Verifica limite diário (`max_per_day`)
3. Aplica multiplicador do plano
4. Credita pontos em `user_gamification`
5. Registra em `points_history`

### Banco de Dados

Executar SQL em `/sql/config/CONFIGURAR_PONTOS_COMENTARIO.sql`:

```sql
-- Atualizar ação de comentário (limite 1/dia)
INSERT INTO point_actions (id, name, description, points_base, category, max_per_day, is_active)
VALUES ('post_comment_sent', 'Comentar em post', 'Primeiro comentário do dia', 5, 'feed', 1, true)
ON CONFLICT (id) DO UPDATE SET max_per_day = 1;

-- Desativar pontos por comentário recebido
UPDATE point_actions SET is_active = false WHERE id = 'post_comment_received';
```

---

## ✅ CHECKLIST DE DEPLOY

- [ ] Executar SQL de configuração no Supabase
- [ ] Build do frontend
- [ ] Deploy
- [ ] Testar: Primeiro comentário do dia gera 5 pts
- [ ] Testar: Segundo comentário do dia gera 0 pts (limite)
- [ ] Testar: Receber comentário não gera pontos
- [ ] Verificar multiplicador funcionando

---

## 📊 IMPACTO

### Usuários afetados
- Todos os usuários que comentam no feed

### Comportamento anterior
- Comentar muito = mais pontos (incentivo a spam)
- Receber comentário = pontos (podia ser manipulado)

### Comportamento novo
- 1 comentário/dia bonificado (incentivo a qualidade)
- Receber comentário não afeta pontuação (remove manipulação)

---

## 🔗 DOCUMENTAÇÃO ATUALIZADA

- `/docs/sessions/ROTA_VALENTE_SCHEMA.md` ✅
- `/sql/config/CONFIGURAR_PONTOS_COMENTARIO.sql` ✅
- `/.agent/REVISAO_ALTERACOES_NA_ROTA.md` ✅

---

## ❓ PERGUNTAS FREQUENTES

**P: E os pontos já creditados por comentários recebidos?**
R: Mantidos. A alteração vale apenas para novos comentários.

**P: Onde configuro o limite diário?**
R: No painel admin `/admin/rota-valente` > aba "Ações" > campo "Limite/Dia"

**P: O multiplicador é aplicado?**
R: Sim. Elite = 15 pts, Veterano = 7.5 pts, Recruta = 5 pts (por comentário)

---

*Documento gerado em 28/01/2026 - Equipe de Desenvolvimento*
