# 🎯 ANÁLISE DE IMPACTO 360° - ATUALIZAÇÃO DE CATEGORIAS PROFISSIONAIS

**Data:** 2026-01-31  
**Status:** 📋 PLANEJAMENTO  
**Responsáveis:** Equipe Completa

---

## 📊 RESUMO EXECUTIVO

Estamos atualizando o sistema de categorias profissionais de **10 categorias genéricas** para **114 categorias especializadas**, com adição de:
- ✅ **Keywords** (palavras-chave para busca)
- ✅ **Tags** (categorização)
- ✅ **Limite de categorias por plano** (nova regra de negócio)

---

## 🎯 ESCOPO DA MUDANÇA

### **1. BANCO DE DADOS**

#### **Tabelas Impactadas:**
- ✅ `service_categories` → Adicionar keywords[], tags[]
- ✅ `plan_config` → Adicionar max_categories
- ⚠️ `user_categories` → **PRESERVADA** (relacionamento)
- ⚠️ `project_categories` → **VERIFICAR SE EXISTE**

#### **Dados:**
- ❌ **DELETAR** 10 categorias antigas
- ✅ **INSERIR** 114 novas categorias
- ⚠️ **IMPACTO EM USERS**: Todos os usuários que têm categorias antigas **PERDERÃO** essas associações

#### **Migrações Criadas:**
```
✅ 20260131_add_max_categories_to_plans.sql
✅ 20260131_update_service_categories.sql
```

---

## 🔄 MÓDULOS IMPACTADOS

### **1. LANÇAMENTO DE PROJETO** ⚠️ ALTA PRIORIDADE

**Arquivo:** `/app/projects/create/page.tsx`  
**Status:** 🔴 PRECISA ATUALIZAÇÃO

**O que precisa mudar:**
- [ ] Substituir seleção de categoria (cards?) por **busca/autocomplete**
- [ ] Buscar categorias de `service_categories` com keywords/tags
- [ ] Permitir seleção de **UMA categoria** por projeto (ou múltiplas?)
- [ ] Validar se categoria existe e está ativa

**API Routes Impactadas:**
- [ ] `/api/projects` (POST) → Validar category_id

---

### **2. CADASTRO DE USUÁRIO** ⚠️ ALTA PRIORIDADE

**Arquivo:** **PRECISA LOCALIZAR** (auth flow)  
**Status:** 🔴 PRECISA IDENTIFICAÇÃO

**Possíveis locais:**
- `/app/auth/` ?
- `/app/onboarding/` ?
- Middleware Next-Auth?
- Supabase Auth Hooks?

**O que precisa mudar:**
- [ ] Durante cadastro, usuário seleciona categorias profissionais
- [ ] **VALIDAR LIMITE** baseado no plano (Recruta = 3 categorias)
- [ ] Componente de busca/autocomplete
- [ ] Salvar em `user_categories`

---

### **3. EDITAR PERFIL** ⚠️ ALTA PRIORIDADE

**Arquivo:** `/app/dashboard/editar-perfil/page.tsx`  
**Status:** 🔴 PRECISA ATUALIZAÇÃO

**O que precisa mudar:**
- [ ] **Substituir cards** por campo de **BUSCA** de categorias
- [ ] Mostrar categorias atuais do usuário
- [ ] Permitir adicionar/remover categorias
- [ ] **VALIDAR LIMITE** baseado no plano do usuário:
  - Recruta: max 3
  - Veterano: max 10
  - Elite: max 25
  - Lendário: ilimitado
- [ ] Feedback visual quando atingir limite
- [ ] Sugerir upgrade de plano se tentar adicionar mais

**API Routes Impactadas:**
- [ ] Endpoint para buscar categorias (GET /api/categories/search?q=...)
- [ ] Endpoint para atualizar categorias do usuário (POST /api/user/categories)

---

### **4. ADMIN - PLANOS** ⚠️ MÉDIA PRIORIDADE

**Arquivo:** `/app/admin/planos/...` (PRECISA LOCALIZAR)  
**Status:** 🟡 PRECISA ATUALIZAÇÃO

**O que precisa mudar:**
- [ ] Adicionar campo `max_categories` no formulário de edição
- [ ] Permitir admin configurar quantas categorias cada plano permite
- [ ] Validação: -1 = ilimitado, >= 1 = limite específico

---

### **5. ADMIN - CATEGORIAS** ⚠️ MÉDIA PRIORIDADE

**Arquivo:** `/app/admin/categories/page.tsx`  
**Status:** 🟡 PRECISA ATUALIZAÇÃO

**O que precisa mudar:**
- [ ] Adicionar campos `keywords` e `tags` no formulário
- [ ] Interface para adicionar/remover keywords (array)
- [ ] Interface para adicionar/remover tags (array)
- [ ] Preview de como a categoria aparece na busca

---

## 🚨 PONTOS CRÍTICOS DE ATENÇÃO

### **1. MIGRAÇÃO DE DADOS** 🔴 CRÍTICO

**Problema:**
- Usuários existentes têm categorias antigas (ex: "Teologia", "Liderança")
- Se deletarmos essas categorias, **TODOS os usuários perdem suas categorias**

**Soluções Possíveis:**

**Opção A: RESETAR CATEGORIAS** ⚠️ IMPACTO ALTO
```sql
-- Deleta todas categorias antigas
TRUNCATE service_categories CASCADE;
-- Isso apaga TODOS os user_categories também!
```
- ✅ Banco limpo
- ❌ Usuários perdem associações
- ❌ Precisam reselecionar categorias

**Opção B: MAPEAMENTO INTELIGENTE** ✅ RECOMENDADO
```sql
-- Mapear categorias antigas → novas
-- Ex: "Liderança" → "Gestor de Projetos / PMO"
--     "Desenvolvimento" → "Desenvolvedor de Software (Full Stack)"
```
- ✅ Preserva dados dos usuários
- ✅ Migração suave
- ❌ Trabalho manual de fazer o mapeamento

**Opção C: MANTER ANTIGAS + NOVAS** ⚠️ NÃO RECOMENDADO
- Não fazer TRUNCATE, apenas INSERT novas
- ❌ Banco fica com categorias duplicadas/inconsistentes

**👉 DECISÃO NECESSÁRIA:** Igor, qual opção você prefere?

---

### **2. VALIDAÇÃO DE LIMITES** 🔴 CRÍTICO

**Onde validar:**
- ✅ **Frontend:** Feedback imediato ao usuário
- ✅ **Backend:** Segurança, não confiar no frontend

**Exemplo de validação backend:**
```typescript
// /api/user/categories (POST)
const user = await getUserWithPlan()
const maxCategories = user.plan.max_categories

if (maxCategories !== -1 && userCategories.length >= maxCategories) {
  return { error: 'Limite de categorias atingido' }
}
```

---

### **3. COMPONENTE DE BUSCA** 🟡 IMPORTANTE

**Requisitos:**
- [ ] Buscar por **nome**, **keywords** ou **tags**
- [ ] Autocomplete com debounce (evitar muitas queries)
- [ ] Mostrar ícone e cor da categoria
- [ ] Highlight do termo pesquisado
- [ ] Paginação ou lazy loading (114 categorias!)
- [ ] Categorias selecionadas ficam no topo
- [ ] Remover categoria selecionada

**Exemplo de query:**
```sql
SELECT * FROM service_categories
WHERE active = true
AND (
  name ILIKE '%termo%'
  OR keywords @> ARRAY['termo']
  OR tags @> ARRAY['termo']
)
LIMIT 20;
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: PREPARAÇÃO** ⏸️
- [x] Criar migrações SQL
- [ ] Decidir estratégia de migração de dados (A, B ou C)
- [ ] Criar script de mapeamento (se opção B)
- [ ] Testar migrações em ambiente local

### **FASE 2: BACKEND** ⏸️
- [ ] Criar API `/api/categories/search` (busca)
- [ ] Criar API `/api/user/categories` (GET/POST/DELETE)
- [ ] Adicionar validação de limite por plano
- [ ] Atualizar API `/api/projects` para validar category_id
- [ ] Testes

### **FASE 3: COMPONENTES** ⏸️
- [ ] Criar componente `CategorySearch` (busca/autocomplete)
- [ ] Criar componente `CategoryBadge` (exibir categoria)
- [ ] Criar componente `CategoryLimitWarning` (aviso de limite)
- [ ] Testes

### **FASE 4: PÁGINAS** ⏸️
- [ ] Atualizar `/projects/create` → Usar CategorySearch
- [ ] Atualizar `/dashboard/editar-perfil` → Usar CategorySearch + validação
- [ ] Identificar e atualizar página de cadastro
- [ ] Atualizar `/admin/planos` → Campo max_categories
- [ ] Atualizar `/admin/categories` → Campos keywords/tags

### **FASE 5: TESTES E DEPLOY** ⏸️
- [ ] Testar fluxo completo:
  - [ ] Novo usuário se cadastra → seleciona categorias
  - [ ] Usuário edita perfil → adiciona/remove categorias
  - [ ] Usuário atinge limite → vê aviso
  - [ ] Usuário cria projeto → seleciona categoria
  - [ ] Admin edita plano → altera max_categories
  - [ ] Admin edita categoria → altera keywords/tags
- [ ] Code review
- [ ] Deploy staging
- [ ] Testes em staging
- [ ] Deploy produção
- [ ] Monitoramento

---

## 🎯 PRIORIDADES

### **AGORA (HIGH):**
1. **Decidir estratégia de migração** (A, B ou C)
2. **Criar componente CategorySearch** (será reutilizado)
3. **Atualizar /dashboard/editar-perfil**

### **EM SEGUIDA (MEDIUM):**
4. **Atualizar /projects/create**
5. **Identificar e atualizar cadastro de usuário**
6. **Criar APIs necessárias**

### **DEPOIS (LOW):**
7. **Atualizar admin/planos**
8. **Atualizar admin/categories**

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

**AGUARDANDO DECISÃO DO IGOR:**

1. ❓ **Estratégia de migração:** A (resetar), B (mapear) ou C (manter ambas)?

2. ❓ **Cadastro de usuário:** Onde está o fluxo de onboarding?
   - É via Supabase Auth?
   - Tem página de onboarding após cadastro?
   - Onde usuário seleciona categorias pela primeira vez?

3. ❓ **Projetos:** Quantas categorias por projeto?
   - Uma categoria principal?
   - Múltiplas categorias?

**DEPOIS DE RESPONDER, VAMOS:**
1. ✅ Criar componente `CategorySearch` reutilizável
2. ✅ Atualizar página `/dashboard/editar-perfil`
3. ✅ Continuar com os outros módulos

---

**Última atualização:** 2026-01-31 13:30  
**Próxima ação:** Aguardando decisões do Igor
