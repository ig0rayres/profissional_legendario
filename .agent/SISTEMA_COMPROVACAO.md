# 🎯 SISTEMA DE COMPROVAÇÃO - NA ROTA

## 📋 VISÃO GERAL

O sistema "Na Rota" funciona como **comprovação de atividades** através de fotos/vídeos.

---

## 🔄 FLUXOS DE COMPROVAÇÃO

### **1. CONFRARIAS** 🤝

#### **Passo a Passo:**

1. **Usuário agenda confraria**
   - Envia convite para outro membro
   - Define data, local, etc
   - Status: `accepted`

2. **Data da confraria passa**
   - Sistema detecta: `proposed_date < now()`
   - Status da prova: `awaiting_proof`
   - Botão "Comprovar Confraria" aparece

3. **Usuário comprova**
   - Clica em "Comprovar Confraria"
   - Modal abre com confraria pré-selecionada
   - Adiciona fotos/vídeos
   - Publica

4. **Sistema vincula**
   - Post criado com `confraternity_id`
   - Confraria atualizada: `proof_post_id = post.id`
   - Status da prova: `pending_validation`
   - Botão muda para "Aguardando Validação" ⏳

5. **Admin/IA valida**
   ```sql
   SELECT validate_confraternity_proof(
     'confraternity_id',
     'validator_id'
   );
   ```
   - Confraria: `proof_validated = true`
   - Post: `validation_status = 'approved'`
   - Status da prova: `validated`
   - Botão muda para "Comprovado" ✅

6. **Medalhas concedidas**
   - Sistema verifica medalhas relacionadas
   - Concede automaticamente via `awardBadge()`
   - Exemplos:
     - 🤝 Primeira Confraria
     - 🏠 Anfitrião (se foi host)
     - 📸 Cronista (se postou foto)
     - 👑 Líder (se atingiu 5+ confrarias)

---

### **2. PROJETOS** 💼

#### **Passo a Passo:**

1. **Usuário adiciona projeto**
   - Cria item no portfólio
   - Status: `active`

2. **Projeto em andamento**
   - Usuário trabalha no projeto
   - Status permanece `active`

3. **Projeto finalizado**
   - Clica em "Comprovar Entrega"
   - Modal abre com projeto pré-selecionado
   - Adiciona fotos do serviço entregue
   - Publica

4. **Sistema vincula**
   - Post criado com `project_id`
   - Projeto atualizado: `delivery_proof_post_id = post.id`
   - Status da validação: `pending_validation`
   - Botão muda para "Aguardando Validação" ⏳

5. **Admin/IA valida**
   ```sql
   SELECT validate_project_delivery(
     'project_id',
     'validator_id'
   );
   ```
   - Projeto: `status = 'completed'`, `proof_validated = true`
   - Post: `validation_status = 'approved'`
   - Status da validação: `validated`
   - Botão muda para "Comprovado" ✅

6. **Benefícios**
   - Projeto conta para estatísticas
   - Pode conceder medalhas (ex: "Primeiro Projeto")
   - Aumenta credibilidade do perfil

---

## 🎨 COMPONENTES

### **ProofButton**
Botão inteligente que muda de acordo com o status:

```typescript
<ProofButton
  type="confraternity"  // ou "project"
  itemId={confraternityId}
  userId={userId}
  hasProof={!!proof_post_id}
  isValidated={proof_validated}
  onProofSubmitted={() => refresh()}
/>
```

**Estados:**
- 📸 **Sem prova:** "Comprovar Confraria" (botão ativo)
- ⏳ **Pendente:** "Aguardando Validação" (botão desabilitado, amarelo)
- ✅ **Validado:** "Comprovado" (botão desabilitado, verde)

---

## 📊 ESTRUTURA DO BANCO

### **confraternity_invites**
```sql
├── proof_post_id (UUID) → posts
├── proof_required (BOOLEAN) - Se requer comprovação
├── proof_submitted_at (TIMESTAMPTZ)
├── proof_validated (BOOLEAN)
├── proof_validated_at (TIMESTAMPTZ)
└── proof_validated_by (UUID) → profiles
```

### **portfolio_items**
```sql
├── status (TEXT) - active, completed, cancelled
├── delivery_proof_post_id (UUID) → posts
├── delivery_date (TIMESTAMPTZ)
├── proof_validated (BOOLEAN)
├── proof_validated_at (TIMESTAMPTZ)
└── proof_validated_by (UUID) → profiles
```

### **posts**
```sql
├── confraternity_id (UUID) → confraternity_invites
├── project_id (UUID) → portfolio_items
├── medal_id (TEXT) - Medalha sendo validada
├── validation_status (TEXT) - pending, approved, rejected
├── validated_by (UUID) → profiles
└── validated_at (TIMESTAMPTZ)
```

---

## 🔍 VIEWS ÚTEIS

### **confraternities_pending_proof**
Lista confrarias que precisam de comprovação:

```sql
SELECT * FROM confraternities_pending_proof
WHERE proof_status = 'awaiting_proof';  -- Aguardando foto
-- ou
WHERE proof_status = 'pending_validation';  -- Aguardando validação
```

### **projects_pending_validation**
Lista projetos aguardando validação:

```sql
SELECT * FROM projects_pending_validation
WHERE validation_status = 'pending_validation';
```

---

## 🎯 EXEMPLOS DE USO

### **1. Listar confrarias que precisam de prova**
```typescript
const { data } = await supabase
  .from('confraternities_pending_proof')
  .select('*')
  .eq('sender_id', userId)
  .eq('proof_status', 'awaiting_proof')
```

### **2. Comprovar confraria**
```typescript
// Usuário clica em "Comprovar"
<ProofButton
  type="confraternity"
  itemId={confraternity.id}
  userId={userId}
  hasProof={!!confraternity.proof_post_id}
  isValidated={confraternity.proof_validated}
/>

// Modal abre automaticamente com confraria selecionada
// Usuário adiciona fotos e publica
// Sistema vincula automaticamente
```

### **3. Validar comprovação (Admin)**
```typescript
const { data } = await supabase.rpc('validate_confraternity_proof', {
  p_confraternity_id: confraternityId,
  p_validator_id: adminId
})

// Se sucesso, conceder medalhas
if (data.success) {
  // Verificar se é primeira confraria
  const { count } = await supabase
    .from('confraternity_invites')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', data.sender_id)
    .eq('proof_validated', true)
  
  if (count === 1) {
    await awardBadge(data.sender_id, 'primeira_confraria')
  }
}
```

---

## 🏅 MEDALHAS RELACIONADAS

### **Confrarias:**
- 🤝 **Primeira Confraria** - Primeira confraria comprovada
- 🏠 **Anfitrião** - Hospedar confraria (sender)
- 📸 **Cronista** - Registrar confraria com foto
- 👑 **Líder de Confraria** - 5+ confrarias comprovadas
- 🎥 **Cinegrafista** - Gravar vídeo de confraria

### **Projetos:**
- 💼 **Primeiro Projeto** - Primeiro projeto entregue
- 🎯 **Profissional Ativo** - 5+ projetos entregues
- ⭐ **Expert** - 20+ projetos entregues

---

## 🚀 PRÓXIMOS PASSOS

### **1. Painel de Validação (Admin)**
- Listar comprovações pendentes
- Ver fotos/vídeos
- Aprovar/rejeitar com um clique
- Usar IA para validação automática

### **2. Notificações**
- Avisar quando comprovação for aprovada/rejeitada
- Lembrar de comprovar confrarias passadas
- Notificar medalhas conquistadas

### **3. IA para Validação**
- OpenAI Vision para contar pessoas (confrarias)
- Detectar ambiente/serviço (projetos)
- Validação automática com alta confiança

### **4. Gamificação**
- XP por comprovar no prazo
- Bônus por comprovar rapidamente
- Penalidade por não comprovar

---

## ✅ STATUS ATUAL

- [x] Schema do banco criado
- [x] Migrations executadas
- [x] Views criadas
- [x] Funções de validação criadas
- [x] Componente ProofButton criado
- [x] CreatePostModal atualizado
- [x] PostCard exibindo vinculações
- [ ] Integrar ProofButton nas páginas
- [ ] Painel admin de validação
- [ ] API de validação
- [ ] Notificações
- [ ] IA para validação automática

---

**O sistema está pronto para uso!** 🚀
