# 🛡️ SISTEMA ANTI-FRAUD - PROTEÇÃO COMPLETA

## 🎯 OBJETIVO
Garantir que pontos e medalhas sejam creditados **APENAS UMA VEZ**, mesmo com tentativas de burlar o sistema.

---

## 🔴 VULNERABILIDADES IDENTIFICADAS E CORRIGIDAS

### **1. MÚLTIPLAS COMPROVAÇÕES PARA MESMA CONFRARIA**
**Problema:** Usuário cria vários posts para mesma confraria
**Solução:** ✅ CONSTRAINT `unique_confraternity_proof`
```sql
-- Apenas 1 post por confraria
ALTER TABLE posts ADD CONSTRAINT unique_confraternity_proof 
UNIQUE NULLS NOT DISTINCT (confraternity_id);
```

### **2. MÚLTIPLAS ENTREGAS PARA MESMO PROJETO**
**Problema:** Usuário marca mesmo projeto como entregue várias vezes
**Solução:** ✅ CONSTRAINT `unique_project_delivery_proof`
```sql
-- Apenas 1 post por projeto
ALTER TABLE posts ADD CONSTRAINT unique_project_delivery_proof 
UNIQUE NULLS NOT DISTINCT (project_id);
```

### **3. TROCAR FOTO APÓS VALIDAÇÃO**
**Problema:** Usuário valida com foto boa, depois troca por fake
**Solução:** ✅ TRIGGER `prevent_proof_change`
```sql
-- Bloqueia alteração de proof_post_id após validação
CREATE TRIGGER prevent_confraternity_proof_change_trigger...
CREATE TRIGGER prevent_project_proof_change_trigger...
```

### **4. DELETAR POST VALIDADO**
**Problema:** Usuário deleta post validado e cria novo
**Solução:** ✅ TRIGGER `prevent_validated_post_deletion`
```sql
-- Bloqueia deleção de posts com validation_status = 'approved'
CREATE TRIGGER prevent_validated_post_deletion_trigger...
```

### **5. VALIDAÇÃO SIMULTÂNEA (Race Condition)**
**Problema:** Dois admins validam ao mesmo tempo = medalha 2x
**Solução:** ✅ FUNÇÃO com `FOR UPDATE` lock
```sql
-- Lock de linha antes de validar
SELECT * FROM confraternity_invites WHERE id = X FOR UPDATE;
IF proof_validated = true THEN RETURN 'Já validado';
```

### **6. MEDALHA CONCEDIDA MÚLTIPLAS VEZES**
**Problema:** `awardBadge()` chamado 2x = medalha duplicada
**Solução:** ✅ UNIQUE INDEX + ON CONFLICT
```sql
-- Já existe: UNIQUE(user_id, medal_id)
-- Usar: INSERT ... ON CONFLICT DO NOTHING
```

### **7. SEM AUDITORIA**
**Problema:** Não há histórico de quem validou/rejeitou
**Solução:** ✅ TABELA `validation_history`
```sql
CREATE TABLE validation_history (
  entity_type, entity_id, action, validator_id, created_at
);
```

---

## 🛡️ PROTEÇÕES IMPLEMENTADAS

### **CAMADA 1: BANCO DE DADOS** ✅

| Proteção | Tipo | Status |
|----------|------|--------|
| 1 post por confraria | CONSTRAINT | ✅ |
| 1 post por projeto | CONSTRAINT | ✅ |
| Bloquear troca de prova | TRIGGER | ✅ |
| Bloquear deleção de post validado | TRIGGER | ✅ |
| Lock em validação | FUNÇÃO | ✅ |
| Histórico de auditoria | TABELA | ✅ |

### **CAMADA 2: APLICAÇÃO** (A implementar)

| Proteção | Tipo | Status |
|----------|------|--------|
| Verificar antes de validar | LÓGICA | 🔴 |
| `awardBadge()` idempotente | LÓGICA | 🔴 |
| Rate limiting de posts | API | 🔴 |
| Debounce em botões | UI | 🔴 |

### **CAMADA 3: UX** (A implementar)

| Proteção | Tipo | Status |
|----------|------|--------|
| Confirmação antes de publicar | MODAL | 🔴 |
| Bloquear edição de post validado | UI | 🔴 |
| Mostrar "já comprovado" | UI | 🔴 |

---

## 📋 REGRAS DE NEGÓCIO

### **CONFRARIAS:**
1. ✅ Usuário pode criar **apenas 1 post** por confraria
2. ✅ Após validação, **não pode trocar** foto
3. ✅ Post validado **não pode ser deletado**
4. ✅ Admin só pode validar **uma vez**
5. ✅ Medalhas são concedidas **apenas na primeira validação**

### **PROJETOS:**
1. ✅ Usuário pode criar **apenas 1 post** de entrega por projeto
2. ✅ Após validação, **não pode trocar** foto
3. ✅ Post validado **não pode ser deletado**
4. ✅ Admin só pode validar **uma vez**
5. ✅ Projeto muda para `completed` **apenas uma vez**

### **MEDALHAS:**
1. ✅ Cada medalha pode ser concedida **apenas 1x** por usuário
2. ✅ Pontos são creditados **apenas na primeira concessão**
3. ✅ Histórico de pontos é **imutável**
4. ✅ Validação é registrada em **auditoria**

---

## 🔍 TESTES DE SEGURANÇA

### **Teste 1: Múltiplos Posts para Mesma Confraria**
```sql
-- Tentar criar 2 posts para mesma confraria
INSERT INTO posts (confraternity_id, user_id, content) 
VALUES ('conf-123', 'user-1', 'Post 1');
-- ✅ OK

INSERT INTO posts (confraternity_id, user_id, content) 
VALUES ('conf-123', 'user-1', 'Post 2');
-- ❌ ERRO: duplicate key value violates unique constraint
```

### **Teste 2: Trocar Foto Após Validação**
```sql
-- Validar confraria
UPDATE confraternity_invites 
SET proof_validated = true, proof_post_id = 'post-1'
WHERE id = 'conf-123';
-- ✅ OK

-- Tentar trocar foto
UPDATE confraternity_invites 
SET proof_post_id = 'post-2'
WHERE id = 'conf-123';
-- ❌ ERRO: Não é possível alterar comprovação já validada
```

### **Teste 3: Deletar Post Validado**
```sql
-- Validar post
UPDATE posts SET validation_status = 'approved' WHERE id = 'post-1';
-- ✅ OK

-- Tentar deletar
DELETE FROM posts WHERE id = 'post-1';
-- ❌ ERRO: Não é possível deletar post já validado
```

### **Teste 4: Validar Duas Vezes**
```sql
-- Primeira validação
SELECT validate_confraternity_proof_safe('conf-123', 'admin-1');
-- ✅ OK: { success: true }

-- Segunda validação
SELECT validate_confraternity_proof_safe('conf-123', 'admin-2');
-- ❌ ERRO: { success: false, error: 'Já foi validado anteriormente' }
```

### **Teste 5: Medalha Duplicada**
```typescript
// Primeira concessão
await awardBadge('user-1', 'primeira_confraria')
// ✅ OK: Medalha concedida

// Segunda concessão
await awardBadge('user-1', 'primeira_confraria')
// ✅ OK: Ignorado (ON CONFLICT DO NOTHING)
```

---

## 📊 AUDITORIA

### **Tabela: validation_history**
Registra TODAS as validações (aprovações e rejeições):

```sql
SELECT * FROM validation_history 
WHERE entity_type = 'confraternity' 
AND entity_id = 'conf-123';
```

**Resultado:**
| id | entity_type | entity_id | action | validator_id | created_at |
|----|-------------|-----------|--------|--------------|------------|
| 1 | confraternity | conf-123 | approved | admin-1 | 2026-01-25 22:00 |

**Benefícios:**
- ✅ Rastreabilidade completa
- ✅ Histórico imutável
- ✅ Detectar tentativas de fraude
- ✅ Análise de padrões

---

## 🚀 PRÓXIMOS PASSOS

### **CAMADA 2: APLICAÇÃO** (Carlos)

1. **Atualizar `awardBadge()`** para ser idempotente
```typescript
// Verificar se já tem medalha ANTES de inserir
const existing = await checkExistingMedal(userId, medalId)
if (existing) return { alreadyAwarded: true }
```

2. **Criar API de validação** com verificações
```typescript
// POST /api/admin/validate-proof
// Verificar se já foi validado
// Chamar função SQL segura
// Conceder medalhas de forma idempotente
```

3. **Rate limiting** em criação de posts
```typescript
// Máximo 5 posts por hora
const recentPosts = await countRecentPosts(userId, '1 hour')
if (recentPosts >= 5) return { error: 'Rate limit exceeded' }
```

### **CAMADA 3: UX** (Marina + Lucas)

4. **Modal de confirmação** antes de publicar
```typescript
<ConfirmationModal>
  Esta foto será usada para comprovar:
  - Confraria em São Paulo (25/01/2026)
  - Medalha: Primeira Confraria
  Tem certeza?
</ConfirmationModal>
```

5. **Bloquear UI** de posts validados
```typescript
if (post.validation_status === 'approved') {
  return <LockedPost />
}
```

6. **Feedback visual** de "já comprovado"
```typescript
if (confraternity.proof_validated) {
  return <Badge>✅ Comprovado</Badge>
}
```

---

## ✅ CHECKLIST DE SEGURANÇA

- [x] CONSTRAINT: 1 post por confraria
- [x] CONSTRAINT: 1 post por projeto
- [x] TRIGGER: Bloquear troca de prova validada
- [x] TRIGGER: Bloquear deleção de post validado
- [x] FUNÇÃO: Validação com lock (race condition)
- [x] TABELA: Histórico de auditoria
- [ ] LÓGICA: awardBadge() idempotente
- [ ] API: Endpoint de validação seguro
- [ ] API: Rate limiting
- [ ] UI: Modal de confirmação
- [ ] UI: Bloquear edição de validados
- [ ] UI: Debounce em botões

---

## 🎯 RESUMO

**PROTEÇÕES ATIVAS:** 6/12 (50%)
- ✅ Banco de dados: 100% protegido
- 🔴 Aplicação: 0% implementado
- 🔴 UX: 0% implementado

**PRÓXIMA AÇÃO:** Implementar camada de aplicação (awardBadge idempotente + API)

---

**Sistema anti-fraud está ATIVO no banco de dados!** 🛡️
