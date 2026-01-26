# 🧪 TESTE COMPLETO - SISTEMA DE CONFRARIAS
Data: 26/01/2026 09:13  
Tempo estimado: 15-20 minutos

---

## 🎯 O QUE VAMOS TESTAR:

1. ✅ Criar confraria de teste
2. ✅ Abrir modal "Criar Post"
3. ✅ Verificar se parceiro é marcado automaticamente
4. ✅ Publicar post com foto
5. ✅ Verificar se AMBOS ganharam pontos (50 cada)
6. ✅ Verificar se contadores incrementaram
7. ✅ Verificar medalhas automáticas

---

## 📋 PRÉ-REQUISITOS

- [x] Servidor rodando (`npm run dev`)
- [x] Navegador aberto em `localhost:3000`
- [x] Logado com usuário
- [ ] Banco de dados acessível (Supabase Studio)

---

## 🚀 TESTE 1: CRIAR CONFRARIA ACEITA (SQL)

### **Passo 1.1: Abrir SQL Editor no Supabase**
1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
2. Clique em "SQL Editor" no menu lateral
3. Click "New Query"

### **Passo 1.2: Descobrir seu User ID**
```sql
-- Copie e cole isso para descobrir seu user_id
SELECT id, email, full_name 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

Anote o `id` do seu usuário principal.

### **Passo 1.3: Criar usuário parceiro (se não tiver outro)**
```sql
-- Criar usuário de teste (João Silva) para ser o parceiro
INSERT INTO profiles (
    id,
    email,
    full_name,
    slug,
    avatar_url
) VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'joao.teste@rota.com.br',
    'João Silva',
    'joao-silva-teste',
    null
) ON CONFLICT (id) DO NOTHING;
```

### **Passo 1.4: Criar confraria aceita**
```sql
-- SUBSTITUA 'SEU_USER_ID' pelo ID que você anotou
INSERT INTO confraternity_invites (
    sender_id,
    receiver_id,
    status,
    proposed_date,
    location,
    message,
    created_at
) VALUES (
    'SEU_USER_ID'::uuid,  -- <-- TROCAR AQUI
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'accepted',
    NOW() + INTERVAL '2 hours',  -- Confraria daqui 2 horas
    'Café Central - Centro',
    'Vamos discutir novos projetos!',
    NOW()
);
```

### **Passo 1.5: Verificar se criou**
```sql
SELECT 
    id,
    status,
    location,
    proposed_date,
    created_at
FROM confraternity_invites
WHERE status = 'accepted'
  AND (sender_id = 'SEU_USER_ID' OR receiver_id = 'SEU_USER_ID')
ORDER BY created_at DESC
LIMIT 1;
```

✅ **Resultado esperado:** 1 linha com status 'accepted'

---

## 📱 TESTE 2: CRIAR POST NO NAVEGADOR

### **Passo 2.1: Recarregar Dashboard**
1. No navegador, pressione **F5** (recarregar)
2. Aguarde página carregar completamente

### **Passo 2.2: Verificar se aparece confraria**
1. Role até o card **"Confrarias"**
2. Verifique se aparece: **"Café Central - Centro"**
3. Verifique a data/hora

✅ **Deve mostrar:** João Silva + data + local

### **Passo 2.3: Abrir Modal de Criar Post**
1. Role até o card **"Na Rota"**
2. Procure botão **"Criar Post"** (pode estar no canto superior direito do card)
3. Clique no botão

⚠️ **SE NÃO APARECER O BOTÃO:**
```
O componente pode não ter showCreateButton={true}
Vou ajustar isso para você!
```

### **Passo 2.4: Verificar Auto-Marcação**
1. No modal que abriu, role até **"Vincular a:"**
2. Clique no dropdown **"Confraria"**
3. Selecione: **"Café Central - Centro - [data]"**
4. **AGUARDE 1 segundo**

✅ **Deve aparecer badge VERDE:**
```
┌─────────────────────────────────────┐
│ 👥 Marcando: João Silva             │
│ → Ambos ganham pontos!              │
└─────────────────────────────────────┘
```

### **Passo 2.5: Adicionar Foto**
1. No modal, clique em **"Adicionar Foto/Vídeo"**
2. Selecione qualquer imagem do seu computador
3. Aguarde preview carregar

### **Passo 2.6: Escrever Texto**
1. No campo de texto, digite:
```
Ótima reunião com João! Discutimos novos projetos e 
fechamos parceria. Produtividade em alta! 🚀
```

### **Passo 2.7: Publicar**
1. Clique no botão **"Publicar"**
2. Aguarde upload (verá progresso %)
3. Modal deve fechar automaticamente

⏰ **Aguarde ~5-10 segundos** para validação IA processar

---

## 🔍 TESTE 3: VERIFICAR PONTUAÇÃO NO BANCO

### **Passo 3.1: Buscar último post criado**
```sql
SELECT 
    id,
    user_id,
    content,
    confraternity_id,
    tagged_user_id,
    validation_status,
    created_at
FROM posts
WHERE confraternity_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;
```

✅ **Verificar:**
- `confraternity_id` está preenchido? ✅
- `tagged_user_id` = João Silva (a000...)? ✅
- `validation_status` = 'approved' ou 'pending'?

### **Passo 3.2: Verificar pontos creditados**
```sql
-- Ver pontos de confraria validada
SELECT 
    user_id,
    points,
    source,
    description,
    metadata->>'confraternity_id' as conf_id,
    created_at
FROM points_history
WHERE source = 'confraternity_validated'
ORDER BY created_at DESC
LIMIT 2;
```

✅ **Deve mostrar 2 LINHAS:**
```
| user_id       | points | description                  |
|---------------|--------|------------------------------|
| SEU_USER_ID   | 50     | Confraria validada: João ...  |
| a0000000-...  | 50     | Confraria validada: [Você]... |
```

⚠️ **SE SÓ MOSTRAR 1 LINHA OU NENHUMA:**
```
Validação pode estar pendente ou falhou.
Verifique console do navegador (F12) por erros.
```

### **Passo 3.3: Verificar confraria foi validada**
```sql
SELECT 
    id,
    proof_validated,
    proof_validated_at,
    proof_post_id
FROM confraternity_invites
WHERE id = (
    SELECT confraternity_id 
    FROM posts 
    WHERE confraternity_id IS NOT NULL 
    ORDER BY created_at DESC 
    LIMIT 1
);
```

✅ **Deve mostrar:**
- `proof_validated` = **TRUE**
- `proof_validated_at` = timestamp recente
- `proof_post_id` = UUID do post

---

## 📊 TESTE 4: VERIFICAR CONTADORES

### **Passo 4.1: Ver contadores no banco**
```sql
-- Ver seus contadores
SELECT 
    user_id,
    current_month_count,
    total_count,
    pending_proof_count
FROM user_confraternity_stats
WHERE user_id = 'SEU_USER_ID';
```

✅ **Deve mostrar:**
- `current_month_count` = **1** (ou +1 se já tinha)
- `total_count` = **1** (ou +1 se já tinha)

### **Passo 4.2: Ver contador do parceiro**
```sql
-- Ver contadores do João
SELECT 
    user_id,
    current_month_count,
    total_count
FROM user_confraternity_stats
WHERE user_id = 'a0000000-0000-0000-0000-000000000001';
```

✅ **AMBOS devem ter incrementado +1**

### **Passo 4.3: Verificar no UI**
1. No navegador, pressione **F5** (recarregar)
2. Vá até card **"Confrarias"**
3. Veja os badges no topo

✅ **Deve mostrar:**
```
[1]  [1]
jan  Total
```

(ou valores maiores se já tinha confrarias validadas)

---

## 🏅 TESTE 5: VERIFICAR MEDALHAS

### **Passo 5.1: Ver medalhas concedidas**
```sql
-- Ver se ganhou "primeira_confraria"
SELECT 
    um.user_id,
    um.medal_id,
    um.earned_at,
    p.full_name
FROM user_medals um
JOIN profiles p ON p.id = um.user_id
WHERE um.medal_id = 'primeira_confraria'
  AND um.user_id IN ('SEU_USER_ID', 'a0000000-0000-0000-0000-000000000001')
ORDER BY um.earned_at DESC;
```

✅ **Deve mostrar 2 linhas** (você + João) SE for a primeira confraria de cada um

### **Passo 5.2: Ver todas as medalhas do usuário**
```sql
SELECT 
    medal_id,
    earned_at
FROM user_medals
WHERE user_id = 'SEU_USER_ID'
ORDER BY earned_at DESC;
```

---

## 🎯 TESTE 6: TESTAR MESCLAGEM (AMBOS PUBLICAM)

### **Passo 6.1: Fazer logout**
1. No navegador, clique no avatar (canto superior direito)
2. Clique em "Sair"

### **Passo 6.2: Logar com João**
```
Email: joao.teste@rota.com.br
Senha: [criar senha via SQL ou Supabase Auth]

OU

Use "Magic Link" no Supabase Studio:
Auth → Users → Criar novo usuário com email joao.teste@rota.com.br
```

⚠️ **ALTERNATIVA MAIS FÁCIL:**
Criar POST diretamente via SQL simulando que João postou:

```sql
-- Simular que João também postou sobre a mesma confraria
INSERT INTO posts (
    user_id,
    content,
    media_urls,
    confraternity_id,
    tagged_user_id,
    validation_status
) VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Foi ótimo! Parceria fechada 🤝',
    ARRAY['https://via.placeholder.com/400']::text[],
    (SELECT id FROM confraternity_invites WHERE status = 'accepted' ORDER BY created_at DESC LIMIT 1),
    'SEU_USER_ID'::uuid,
    'approved'
);
```

### **Passo 6.3: Verificar mesclagem**
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
WHERE confraternity_id = (
    SELECT id FROM confraternity_invites 
    WHERE status = 'accepted' 
    ORDER BY created_at DESC 
    LIMIT 1
)
ORDER BY created_at;
```

✅ **Deve mostrar:**
- **Post 1** (mais antigo): `is_merged` = FALSE, `merged_from_post_ids` = [uuid1, uuid2]
- **Post 2** (mais novo): `is_merged` = TRUE, `deleted_at` preenchido

### **Passo 6.4: Verificar conteúdo mesclado**
```sql
-- Ver conteúdo do post principal (mesclado)
SELECT content, media_urls
FROM posts
WHERE confraternity_id = (
    SELECT id FROM confraternity_invites 
    WHERE status = 'accepted' 
    ORDER BY created_at DESC 
    LIMIT 1
)
AND is_merged = FALSE;
```

✅ **Deve conter os 2 textos:**
```
Ótima reunião com João! ...

---

Foi ótimo! Parceria fechada 🤝
```

### **Passo 6.5: Verificar que pontos NÃO duplicaram**
```sql
-- Contar pontos para esta confraria
SELECT COUNT(*) as total_registros
FROM points_history
WHERE source = 'confraternity_validated'
  AND metadata->>'confraternity_id' = (
    SELECT id::text FROM confraternity_invites 
    WHERE status = 'accepted' 
    ORDER BY created_at DESC 
    LIMIT 1
  );
```

✅ **Deve retornar: 2** (não 4!)

---

## ✅ CHECKLIST FINAL

Após todos os testes:

- [ ] Confraria aparece no card
- [ ] Modal "Criar Post" abre
- [ ] Parceiro é marcado automaticamente (badge verde)
- [ ] Post é publicado com sucesso
- [ ] AMBOS os usuários ganharam 50 pontos
- [ ] Confraria foi marcada como `proof_validated = TRUE`
- [ ] Contadores incrementaram para AMBOS (mês + total)
- [ ] Badges no UI atualizaram após F5
- [ ] Medalha "primeira_confraria" foi concedida (se aplicável)
- [ ] Posts duplicados foram mesclados (se testado)
- [ ] Pontos não duplicaram na mesclagem

---

## 🐛 TROUBLESHOOTING

### **Botão "Criar Post" não aparece**
```sql
-- Verificar componente
Arquivo: components/profile/cards-v13-brand-colors.tsx
Linha ~742: showCreateButton deve ser true
```

### **Badge verde não aparece**
- Verifique console (F12) por erros
- Confraria tem dados de sender/receiver?
- userId está correto?

### **Pontos não foram creditados**
```sql
-- Testar função manualmente
SELECT validate_and_award_confraternity_points(
    'POST_ID'::uuid,
    'CONFRATERNITY_ID'::uuid
);
```

### **Contadores não incrementam**
```sql
-- Verificar se função existe
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'increment_confraternity_counter';

-- Chamar manualmente
SELECT increment_confraternity_counter(
    'SEU_USER_ID'::uuid,
    to_char(NOW(), 'YYYY-MM')
);
```

---

## 🎉 SUCESSO!

Se todos os checkboxes estão marcados, o sistema está **100% funcional**!

**Próximos passos:**
1. Testar notificação 4h (criar confraria antiga e rodar cron)
2. Testar com usuários reais
3. Deploy para produção

---

**Criado em:** 26/01/2026 09:13  
**Tempo de teste:** ~15 minutos  
**Dificuldade:** Média
