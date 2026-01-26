# 🧪 GUIA DE TESTES - COMPROVAÇÃO DE CONFRARIAS
**Data:** 26/01/2026 08:46  
**Status:** Pronto para testar

---

## 📋 CHECKLIST PRÉ-TESTE

- [ ] Servidor rodando (`npm run dev`)
- [ ] Banco de dados acessível
- [ ] `.env.local` com todas as variáveis
- [ ] Navegador aberto em `http://localhost:3000`

---

## 🎯 TESTE 1: VERIFICAR CONTADORES NO PERFIL

### **Objetivo:** Ver se contadores de confrarias aparecem no card

### **Passos:**
1. ✅ Acesse `http://localhost:3000`
2. ✅ Faça login com qualquer usuário
3. ✅ Vá para o dashboard/perfil
4. ✅ Localize o card **"Confrarias"**
5. ✅ Verifique se aparecem 2 badges no topo:
   - Badge laranja: "Mês" (confrarias do mês atual)
   - Badge verde: "Total" (confrarias totais)

### **Resultado Esperado:**
```
┌──────────────────────────────────────┐
│ 🗡️  Confrarias            [0]  [0]  │
│     Próximos encontros   Mês  Total │
├──────────────────────────────────────┤
│ [Lista de próximas confrarias...]    │
└──────────────────────────────────────┘
```

### **SQL para popular contadores (se estiver zerado):**
```sql
-- Ver contadores atuais
SELECT * FROM user_confraternity_stats LIMIT 5;

-- Ou via função
SELECT get_confraternity_counts('seu-user-id'::uuid);
```

---

## 🎯 TESTE 2: MARCAR PARTICIPANTE NO MODAL

### **Objetivo:** Verificar se ao selecionar confraria, o parceiro é marcado automaticamente

### **Pré-requisito:**
- Ter pelo menos 1 confraria aceita no banco

### **Criar confraria de teste (SQL):**
```sql
-- Inserir confraria de teste (substitua os UUIDs)
INSERT INTO confraternity_invites (
    sender_id, 
    receiver_id, 
    status, 
    proposed_date, 
    location, 
    message
) VALUES (
    'user-1-uuid', -- Substitua
    'user-2-uuid', -- Substitua
    'accepted',
    NOW() - INTERVAL '5 hours', -- 5h atrás
    'Café Central',
    'Vamos nos reunir!'
);
```

### **Passos:**
1. ✅ No dashboard, localize o card "Na Rota"
2. ✅ Clique no botão **"Criar Post"** (se não aparecer, veja troubleshooting)
3. ✅ No modal que abrir, vá até a seção **"Vincular a:"**
4. ✅ No seletor **"Confraria"**, escolha uma confraria da lista
5. ✅ Observe se aparece uma **badge verde** abaixo do seletor

### **Resultado Esperado:**
```
┌─────────────────────────────────────────┐
│ Vincular a:                             │
│                                         │
│ ⚔️ Confraria                           │
│ [Café Central - 25/01    ▼]            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👥 Marcando: João Silva             │ │
│ │ → Ambos ganham pontos!              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **Verificação:**
- Badge aparece em verde? ✅
- Nome do parceiro está correto? ✅
- Texto "Ambos ganham pontos!" aparece? ✅

---

## 🎯 TESTE 3: CRIAR POST DE CONFRARIA

### **Objetivo:** Publicar post vinculado a confraria e verificar pontuação

### **Passos:**
1. ✅ Com o modal aberto (teste anterior)
2. ✅ Digite um texto: "Ótima reunião! 🚀"
3. ✅ Adicione pelo menos 1 foto (pode ser qualquer imagem)
4. ✅ Certifique-se que a confraria está selecionada
5. ✅ Clique em **"Publicar"**
6. ✅ Aguarde o upload (verá progresso)

### **Resultado Esperado:**
- Modal fecha
- Post aparece no feed "Na Rota"
- Sem erros no console
- Badge de status no post (⏳ Aguardando validação)

### **Verificar no Banco:**
```sql
-- Ver post criado
SELECT 
    id,
    content,
    confraternity_id,
    tagged_user_id,
    validation_status,
    created_at
FROM posts
ORDER BY created_at DESC
LIMIT 1;

-- Deve mostrar:
-- confraternity_id: UUID da confraria
-- tagged_user_id: UUID do parceiro
-- validation_status: 'pending' ou 'approved'
```

---

## 🎯 TESTE 4: VALIDAÇÃO AUTOMÁTICA E PONTUAÇÃO

### **Objetivo:** Verificar se IA validou e se pontos foram creditados

### **Passos:**
1. ✅ Aguarde ~5 segundos após publicar
2. ✅ Abra o console do navegador (F12)
3. ✅ Procure por logs tipo:
   ```
   [CreatePost] Iniciando validação automática com IA...
   [CreatePost] ✅ Validado automaticamente pela IA!
   ```

### **Verificar Pontuação no Banco:**
```sql
-- Ver se confraria foi validada
SELECT 
    id,
    proof_validated,
    proof_validated_at,
    proof_post_id
FROM confraternity_invites
WHERE id = 'confraria-id-uuid';
-- proof_validated deve ser TRUE

-- Ver pontos creditados (AMBOS os usuários)
SELECT 
    user_id,
    points,
    source,
    description,
    season,
    created_at
FROM points_history
WHERE source = 'confraternity_validated'
ORDER BY created_at DESC
LIMIT 2;
-- Deve ter 2 registros (sender + receiver), cada um com 50 pontos
```

### **Verificar Contadores:**
```sql
-- Ver se contadores foram incrementados
SELECT * FROM confraternity_counters
WHERE user_id IN ('user-1-uuid', 'user-2-uuid')
ORDER BY season DESC;
-- validated_count deve ter aumentado +1 para AMBOS
```

### **Verificar Medalhas:**
```sql
-- Ver se medalha foi concedida (primeira confraria)
SELECT 
    um.user_id,
    um.medal_id,
    um.earned_at,
    p.full_name
FROM user_medals um
JOIN profiles p ON p.id = um.user_id
WHERE um.medal_id = 'primeira_confraria'
ORDER BY um.earned_at DESC;
```

---

## 🎯 TESTE 5: NOTIFICAÇÃO PÓS-CONFRARIA (CRON)

### **Objetivo:** Testar se notificação é enviada 4h após confraria

### **Opção A: Simular Manualmente (Recomendado)**

#### **Criar confraria antiga (4h atrás):**
```sql
-- Inserir confraria que aconteceu 5h atrás (sem comprovação)
INSERT INTO confraternity_invites (
    sender_id,
    receiver_id,
    status,
    proposed_date,
    location,
    post_event_notification_sent
) VALUES (
    'user-1-uuid',
    'user-2-uuid',
    'accepted',
    NOW() - INTERVAL '5 hours',
    'Restaurante Teste',
    false  -- Ainda não enviou notificação
);
```

#### **Executar cron manualmente:**
```bash
# No terminal
curl -X GET http://localhost:3000/api/cron/send-confraternity-notifications \
  -H "Authorization: Bearer 5nFApi3Sy09S3KK9jxhQ8LYBEJQYeWNoSyrXfhcL4h8="
```

#### **Verificar resultado:**
```json
{
  "success": true,
  "message": "1/1 confrarias processadas",
  "total_notifications_sent": 2,
  "results": [
    {
      "confraternity_id": "uuid",
      "sender": "Nome User 1",
      "receiver": "Nome User 2",
      "date": "25/01 14:00",
      "notifications_sent": 2,
      "success": true
    }
  ]
}
```

#### **Verificar notificações criadas:**
```sql
SELECT 
    user_id,
    type,
    title,
    message,
    created_at
FROM notifications
WHERE type = 'confraternity_proof_reminder'
ORDER BY created_at DESC
LIMIT 2;

-- Deve ter 2 notificações (uma para cada participante)
```

### **Opção B: Aguardar Cron Automático**
- Cron está configurado para rodar a cada 1 hora
- Após deploy, aguarde até próxima hora cheia
- Verifique logs do Vercel

---

## 🎯 TESTE 6: MESCLAGEM DE POSTS DUPLICADOS

### **Objetivo:** Testar se quando ambos publicam, posts são mesclados

### **Cenário:**
1. João publica post sobre confraria X
2. Maria publica post sobre mesma confraria X
3. Sistema detecta e mescla automaticamente

### **Passos:**
1. ✅ Faça login com **User 1**
2. ✅ Publique post vinculado à confraria
3. ✅ Faça logout
4. ✅ Faça login com **User 2** (parceiro da confraria)
5. ✅ Publique OUTRO post sobre a MESMA confraria
6. ✅ Aguarde trigger executar (~1 segundo)

### **Verificar Mesclagem:**
```sql
-- Ver posts da confraria
SELECT 
    id,
    user_id,
    content,
    is_merged,
    merged_into_post_id,
    merged_from_post_ids,
    deleted_at
FROM posts
WHERE confraternity_id = 'confraria-uuid'
ORDER BY created_at;

-- Deve mostrar:
-- Post 1 (mais antigo): is_merged=false, merged_from_post_ids=[uuid1, uuid2]
-- Post 2 (mais novo): is_merged=true, deleted_at=NOW, merged_into_post_id=post1
```

### **Verificar Pontos (Não Duplicados):**
```sql
-- Ver se pontos foram creditados apenas 1x
SELECT COUNT(*) 
FROM points_history
WHERE source = 'confraternity_validated'
  AND metadata->>'confraternity_id' = 'confraria-uuid';
-- Deve retornar 2 (1 para cada usuário, não 4)
```

---

## 🎯 TESTE 7: COUNTER VISUAL ATUALIZA

### **Objetivo:** Verificar se badge no card atualiza após validação

### **Passos:**
1. ✅ Anote valores atuais (Mês: X, Total: Y)
2. ✅ Publique nova confraria validada (Teste 3)
3. ✅ Recarregue a página (F5)
4. ✅ Verifique se badges incrementaram

### **Resultado Esperado:**
- Mês: X → X+1 ✅
- Total: Y → Y+1 ✅

---

## ⚠️ TROUBLESHOOTING

### **Botão "Criar Post" não aparece:**
```tsx
// Verificar em: components/profile/cards-v13-brand-colors.tsx
// Linha ~740
// Deve ter showCreateButton={true}
<NaRotaFeedV13 userId={userId} showCreateButton={true} />
```

### **Confrarias não aparecem no seletor:**
```sql
-- Verificar se há confrarias aceitas
SELECT * FROM confraternity_invites
WHERE status = 'accepted'
  AND (sender_id = 'user-uuid' OR receiver_id = 'user-uuid');
```

### **Validação não acontece:**
- Verificar OPENAI_API_KEY no .env.local
- Ver logs do console (F12)
- Verificar rota `/api/posts/auto-validate`

### **Pontos não são creditados:**
```sql
-- Verificar se função existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'validate_and_award_confraternity_points';

-- Testar função manualmente
SELECT validate_and_award_confraternity_points(
    'post-uuid'::uuid,
    'confraria-uuid'::uuid
);
```

### **Badge não aparece ao marcar:**
- Abrir F12 → Console
- Procurar por erros
- Verificar se confraternity tem dados de sender/receiver

---

## 📊 QUERIES ÚTEIS PARA DEBUGGING

### **Ver todas as confrarias de um usuário:**
```sql
SELECT * FROM user_confraternity_stats 
WHERE user_id = 'user-uuid';
```

### **Ver últimas validações:**
```sql
SELECT * FROM validation_history
ORDER BY created_at DESC
LIMIT 10;
```

### **Ver posts pendentes de validação:**
```sql
SELECT 
    p.id,
    p.content,
    p.validation_status,
    p.confraternity_id,
    p.created_at
FROM posts p
WHERE p.validation_status = 'pending'
ORDER BY p.created_at DESC;
```

### **Resetar teste (limpar dados):**
```sql
-- CUIDADO: Só use em ambiente de teste!
DELETE FROM posts WHERE confraternity_id IS NOT NULL;
DELETE FROM points_history WHERE source = 'confraternity_validated';
DELETE FROM confraternity_counters;
UPDATE confraternity_invites SET 
    proof_validated = false,
    proof_post_id = null,
    proof_validated_at = null;
```

---

## ✅ CHECKLIST FINAL

Após todos os testes, verificar:

- [ ] Contadores aparecem no card
- [ ] Parceiro é marcado automaticamente
- [ ] Post é criado com tagged_user_id
- [ ] IA valida automaticamente
- [ ] AMBOS os usuários ganham 50 pontos
- [ ] Contadores incrementam para AMBOS
- [ ] Medalha "primeira_confraria" é concedida
- [ ] Notificação 4h funciona
- [ ] Posts duplicados são mesclados
- [ ] Badge visual atualiza após F5

---

**Status:** Pronto para começar! 🚀  
**Tempo estimado:** 30-45 minutos para todos os testes

---

**Dica:** Teste na ordem sugerida (1→7) para melhor experiência!
