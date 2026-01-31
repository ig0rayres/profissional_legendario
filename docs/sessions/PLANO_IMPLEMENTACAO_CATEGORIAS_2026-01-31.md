# 🎯 PLANO DE IMPLEMENTAÇÃO - SISTEMA DE CATEGORIAS COM MÚLTIPLAS SELEÇÕES

**Data:** 2026-01-31  
**Status:** 📋 PLANEJAMENTO  
**Responsáveis:** Equipe Completa

---

## 📊 DECISÕES TOMADAS

✅ **1. Migração de Dados:** OPÇÃO A - TRUNCATE CASCADE (resetar tudo)  
✅ **2. Cadastro:** `/auth/register`  
✅ **3. Projetos:** 1-5 categorias por projeto  
✅ **4. Sistema de Notificação:** 3 grupos por ranking VIGOR, janelas de 24h  

---

## 🎯 ESCOPO COMPLETO

### **BACKEND:**

#### **1. Banco de Dados**

**Migração 1:** Adicionar `max_categories` aos planos
```sql
ALTER TABLE plan_config ADD COLUMN max_categories INTEGER DEFAULT 3;

UPDATE plan_config SET max_categories = 3 WHERE tier = 'recruta';
UPDATE plan_config SET max_categories = 10 WHERE tier = 'veterano';
UPDATE plan_config SET max_categories = 25 WHERE tier = 'elite';
UPDATE plan_config SET max_categories = -1 WHERE tier = 'lendario';
```

**Migração 2:** Atualizar `service_categories`
```sql
ALTER TABLE service_categories 
ADD COLUMN keywords TEXT[] DEFAULT '{}',
ADD COLUMN tags TEXT[] DEFAULT '{}';

TRUNCATE service_categories CASCADE; -- ⚠️ Apaga user_categories também
INSERT INTO service_categories (...) VALUES (...); -- 114 categorias
```

**Migração 3:**  Ajustar `projects` para múltiplas categorias
```sql
-- Já existe: `category VARCHAR(100)`
-- MUDAR PARA: `categories TEXT[]` (array)

ALTER TABLE projects 
DROP COLUMN category,
ADD COLUMN categories TEXT[] DEFAULT '{}';

-- Atualizar índice
CREATE INDEX idx_projects_categories ON projects USING GIN(categories);
```

**Migração 4:** Atualizar `project_distributions` (se existir) ou criar nova tabela para distribuição
```sql
-- Ver se já existe ou criar nova estrutura para rastrear distribuição
```

---

#### **2. APIs**

**API 1:** Buscar categorias com autocomplete
```typescript
// /api/categories/search
GET /api/categories/search?q=desenvolvimento&limit=20

Response:
{
  categories: [
    {
      id: "uuid",
      name: "Desenvolvedor de Software (Full Stack)",
      slug: "desenvolvedor-software-fullstack",
      keywords: ["desenvolvimento", "software", "programação"],
      tags: ["desenvolvimento", "software"],
      icon: "Code",
      color: "#6366F1"
    },
    ...
  ]
}
```

**API 2:** Atualizar categorias do usuário
```typescript
// /api/user/categories
POST /api/user/categories
Body: {
  categoryIds: ["uuid1", "uuid2", "uuid3"]
}

Validação:
1. Buscar plano do usuário
2. Verificar max_categories
3. Se length > max_categories → ERRO
4. Se OK → DELETE old + INSERT new em user_categories
```

**API 3:** Criar projeto (atualizar para múltiplas categorias)
```typescript
// /api/projects
POST /api/projects
Body: {
  ...
  categories: ["uuid1", "uuid2", ...] // 1-5 categorias
}

Lógica de Distribuição:
1. Para CADA categoria selecionada:
   SELECT user_id FROM user_categories 
   WHERE category_id IN (...categories)
   
2. DISTINCT user_ids (evitar duplicatas)

3. JOIN com user_gamification para pegar total_points

4. ORDER BY total_points DESC

5. Dividir em 3 grupos (33% cada)

6. Notificar Grupo 1 (3 canais)

7. Agendar Jobs:
   - 24h → Notificar Grupo 2
   - 48h → Notificar Grupo 3
```

---

### **FRONTEND:**

#### **1. Componente CategorySearch**

```tsx
// components/categories/CategorySearch.tsx

interface CategorySearchProps {
  selectedCategories: ServiceCategory[]
  onSelect: (category: ServiceCategory) => void
  onRemove: (categoryId: string) => void
  maxCategories?: number  // Limite baseado no plano
  placeholder?: string
}

Features:
- Busca com debounce (300ms)
- Autocomplete dropdown
- Categorias selecionadas aparecem como chips
- Limite visual (ex: "3/10 categorias selecionadas")
- Aviso ao atingir limite
- Ícone + cor de cada categoria
```

#### **2. Páginas**

**Página 1:** `/auth/register` - Cadastro
```tsx
// Adicionar seleção de categorias no final do cadastro

<CategorySearch
  selectedCategories={selectedCategories}
  onSelect={handleSelectCategory}
  onRemove={handleRemoveCategory}
  maxCategories={3} // Recruta inicia com 3
  placeholder="Busque suas áreas de atuação..."
/>

Validação:
- Mínimo 1 categoria
- Máximo 3 (plano Recruta)
- Ao salvar: POST /api/user/categories
```

**Página 2:** `/dashboard/editar-perfil` - Editar Perfil
```tsx
// Substituir cards por CategorySearch

<CategorySearch
  selectedCategories={userCategories}
  onSelect={handleSelectCategory}
  onRemove={handleRemoveCategory}
  maxCategories={user.plan.max_categories}
  placeholder="Adicione mais áreas de atuação..."
/>

Features:
- Buscar max_categories do plano atual
- Mostrar "Você pode adicionar mais X categorias"
- Se atingir limite: "Upgrade para [próximo plano] e adicione até X categorias"
- Link para /dashboard/planos
```

**Página 3:** `/projects/create` - Lançar Projeto
```tsx
// Permitir 1-5 categorias

<CategorySearch
  selectedCategories={projectCategories}
  onSelect={handleSelectCategory}
  onRemove={handleRemoveCategory}
  maxCategories={5}
  placeholder="Selecione as categorias deste projeto (1-5)"
/>

Validação:
- Mínimo 1 categoria
- Máximo 5 categorias
- Ao criar projeto: categories vai para o backend como array
```

**Página 4:** `/admin/categories` - Admin Categorias
```tsx
// Adicionar campos keywords e tags

<Input
  label="Keywords"
  placeholder="Separadas por vírgula"
  value={keywords.join(', ')}
  onChange={handleKeywordsChange}
/>

<Input
  label="Tags"
  placeholder="Separadas por vírgula"
  value={tags.join(', ')}
  onChange={handleTagsChange}
/>
```

**Página 5:** `/admin/planos` - Admin Planos
```tsx
// Adicionar campo max_categories

<Input
  type="number"
  label="Máximo de Categorias"
  value={maxCategories}
  onChange={handleMaxCategoriesChange}
  help="-1 para ilimitado"
/>
```

---

## 🔄 LÓGICA DE DISTRIBUIÇÃO ATUALIZADA

### **Query de Distribuição (ATUALIZADA para múltiplas categorias):**

```sql
-- Exemplo: Projeto com 3 categorias: 
-- "Desenvolvedor Web", "Designer UI/UX", "Marketing Digital"

-- 1. Buscar profissionais que tenham QUALQUER UMA das categorias
SELECT DISTINCT
    p.id,
    p.full_name,
    p.email,
    ug.total_points
FROM profiles p
INNER JOIN user_categories uc ON p.id = uc.user_id
INNER JOIN user_gamification ug ON p.id = ug.user_id
WHERE uc.category_id IN (
    'uuid-dev-web',
    'uuid-designer-ui',
    'uuid-marketing-digital'
)
AND p.current_plan_id IN (
    SELECT id FROM plan_config WHERE tier IN ('veterano', 'elite', 'lendario')
)
AND p.status = 'active'
ORDER BY ug.total_points DESC;

-- 2. Sistema divide resultado em 3 grupos
-- Grupo 1: Top 33%
-- Grupo 2: Mid 33%
-- Grupo 3: Low 33%

-- 3. Notifica Grupo 1 imediatamente (T=0h)
-- 4. Agenda job para notificar Grupo 2 (T=24h)
-- 5. Agenda job para notificar Grupo 3 (T=48h)
```

### **Exemplo Numérico:**

**Projeto:** "Criar site de e-commerce"  
**Categorias Selecionadas:**
1. Desenvolvedor de Software (Full Stack)
2. Designer UX/UI
3. Marketing Digital

**Resultado da Query:**
- 120 profissionais únicos (que têm pelo menos 1 das 3 categorias)
- Ordenados por VIGOR (total_points)

**Divisão em Grupos:**
- **Grupo 1:** Top 40 profissionais (33%)
- **Grupo 2:** Mid 40 profissionais (33%)
- **Grupo 3:** Low 40 profissionais (34%)

**Notificação:**
- **T=0h:** 40 profissionais do Grupo 1 recebem notificação (sino + chat + email)
- **T=24h:** Se ninguém aceitou → 40 profissionais do Grupo 2 são notificados
- **T=48h:** Se ninguém aceitou → 40 profissionais do Grupo 3 são notificados

---

## ⚠️ PONTOS CRÍTICOS

### **1. Distribuição Justa**
- Profissional que aparece em múltiplas categorias **NÃO é notificado múltiplas vezes**
- Query usa `DISTINCT user_id`
- Ranking permanece baseado em VIGOR total

### **2. Validação de Limites**
- **Frontend E Backend** validam `max_categories`
- Backend SEMPRE valida (segurança)
- Mensagens claras quando limite é atingido

### **3. Performance**
- Índice GIN em `projects.categories`
- Índice em `user_categories(category_id, user_id)`
- Cache de busca de categorias (considerar Redis)

### **4. UX**
- Busca responsiva (debounce)
- Loading states
- Mensagens de erro claras
- Sugestão de upgrade quando atingir limite

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: BANCO** ⏸️
- [ ] Migração: `max_categories` em `plan_config`
- [ ] Migração: keywords/tags em `service_categories`
- [ ] Migração: TRUNCATE + INSERT 114 categorias
- [ ] Migração: `category` → `categories[]` em `projects`
- [ ] Testar migrações localmente
- [ ] Aplicar em staging
- [ ] Aplicar em produção

### **FASE 2: COMPONENTES** ⏸️
- [ ] `CategorySearch` component
- [ ] `CategoryChip` component
- [ ] `CategoryLimitWarning` component
- [ ] Testes de componentes

### **FASE 3: APIS** ⏸️
- [ ] GET `/api/categories/search`
- [ ] POST `/api/user/categories`
- [ ] Atualizar POST `/api/projects` (múltiplas categorias)
- [ ] Atualizar lógica de distribuição (considerar todas categorias)
- [ ] Testes de API

### **FASE 4: PÁGINAS** ⏸️
- [ ] Atualizar `/auth/register`
- [ ] Atualizar `/dashboard/editar-perfil`
- [ ] Atualizar `/projects/create`
- [ ] Atualizar `/admin/categories`
- [ ] Atualizar `/admin/planos` (identificar localização)

### **FASE 5: TESTES** ⏸️
- [ ] Teste: Novo usuário cadastra e seleciona 3 categorias
- [ ] Teste: Usuário edita perfil e adiciona categorias (respeitando limite)
- [ ] Teste: Usuário tenta adicionar mais que o limite → Erro
- [ ] Teste: Admin cria categoria com keywords/tags
- [ ] Teste: Busca de categorias funciona (nome, keywords, tags)
- [ ] Teste: Projeto é criado com 5 categorias
- [ ] Teste: Distribuição considera TODAS categorias selecionadas
- [ ] Teste: Profissionais não são notificados em duplicata
- [ ] Teste: Grupos de 24h estão funcionando

### **FASE 6: DEPLOY** ⏸️
- [ ] Code review
- [ ] Testar em staging
- [ ] Comunicação com usuários (categorias antigas serão resetadas)
- [ ] Deploy em produção
- [ ] Monitoramento

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. ✅ **RODAR MIGRAÇÕES** (aguardando aprovação do Igor)
2. ✅ **Criar componente CategorySearch**
3. ✅ **Criar API /api/categories/search**
4. ✅ **Atualizar /dashboard/editar-perfil**
5. ✅ **Atualizar /projects/create**

---

## 📝 OBSERVAÇÕES

### **Compatibilidade com Sistema Atual:**
- ✅ Sistema de 3 grupos MANTIDO
- ✅ Janelas de 24h MANTIDAS
- ✅ Notificação em 3 canais MANTIDA
- ✅ Apenas EXPANDINDO de 1 categoria → múltiplas

### **Benefícios:**
- ✅ Projetos alcançam **mais profissionais**
- ✅ Profissionais recebem **mais oportunidades**
- ✅ Cliente tem **mais chances** de encontrar profissional
- ✅ Sistema continua **justo** (baseado em VIGOR)

---

**Última atualização:** 2026-01-31 13:40  
**Status:** Aguardando início da implementação
