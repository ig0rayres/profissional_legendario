# 🔧 MÓDULO DE PROJETOS - DOCUMENTAÇÃO TÉCNICA

> **Versão:** 1.0  
> **Data:** 30/01/2026  
> **Documento para:** Desenvolvedores, DevOps, Arquitetos

---

## 📐 ARQUITETURA DO SISTEMA

### Stack Tecnológica

```
Frontend:
├─ Next.js 14 (App Router)
├─ React 18
├─ TypeScript
├─ Tailwind CSS
└─ shadcn/ui

Backend:
├─ Next.js API Routes
├─ Supabase (PostgreSQL + Realtime)
└─ Server-side rendering

Infraestrutura:
├─ Vercel (Hosting + Edge Functions)
├─ Supabase Cloud (Database + Auth + Storage)
└─ Vercel Cron (Jobs agendados)
```

### Diagrama de Arquitetura

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       ├─ HTTP/HTTPS
       │
┌──────▼──────────────────────────────────┐
│         Next.js Frontend                 │
│  ┌────────────────────────────────────┐ │
│  │  Pages & Components                │ │
│  │  - /projects/create                │ │
│  │  - /projects/view/[id]             │ │
│  │  - ProjectsCounterRealtime         │ │
│  │  - SubmitProposalModal             │ │
│  └────────────────────────────────────┘ │
└──────┬───────────────────────┬──────────┘
       │                       │
       │ API Calls             │ WebSocket
       │                       │ (Realtime)
┌──────▼──────────┐    ┌──────▼──────────┐
│  Next.js APIs   │    │    Supabase     │
│  ┌───────────┐  │    │   Realtime      │
│  │  Routes   │  │    │   Subscriptions │
│  │  - create │  │    └─────────────────┘
│  │  - submit │  │
│  │  - accept │  │
│  │  - cron   │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         │ Supabase Client
         │
┌────────▼────────────────────────────┐
│       Supabase PostgreSQL           │
│  ┌──────────────────────────────┐  │
│  │  Tables (8)                  │  │
│  │  - projects                  │  │
│  │  - project_proposals         │  │
│  │  - project_notifications     │  │
│  │  - ...                       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🗄️ BANCO DE DADOS

### Modelo Entidade-Relacionamento (ER)

```
┌─────────────────┐
│    projects     │◄────┐
├─────────────────┤     │
│ id (PK)         │     │
│ title           │     │ 1
│ category        │     │
│ status          │     │
│ current_group   │     │
│ tracking_token  │     │ *
│ ...             │     │
└────────┬────────┘     │
         │              │
         │ 1            │
         │              │
         │ *            │
┌────────▼────────┐ ┌───┴──────────────┐
│ project_        │ │ project_         │
│ proposals       │ │ notifications    │
├─────────────────┤ ├──────────────────┤
│ id (PK)         │ │ id (PK)          │
│ project_id (FK) │ │ project_id (FK)  │
│ professional_id │ │ professional_id  │
│ proposed_budget │ │ type             │
│ status          │ │ viewed           │
│ ...             │ │ ...              │
└─────────────────┘ └──────────────────┘
```

### Tabela: `projects`

**Descrição:** Tabela principal de projetos

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | gen_random_uuid() | ID único |
| `type` | TEXT | NO | 'general' | Tipo: general, contest, etc |
| `title` | TEXT | NO | - | Título do projeto |
| `description` | TEXT | NO | - | Descrição detalhada |
| `category` | TEXT | NO | - | Categoria (ex: dev_mobile) |
| `scope` | TEXT | NO | 'national' | Escopo: national, pista |
| `pista_id` | UUID | YES | NULL | ID da pista (se scope=pista) |
| `requester_name` | TEXT | NO | - | Nome do solicitante |
| `requester_email` | TEXT | NO | - | Email do solicitante |
| `requester_phone` | TEXT | NO | - | Telefone |
| `location` | TEXT | YES | NULL | Localização |
| `estimated_budget` | NUMERIC | YES | NULL | Orçamento estimado |
| `final_budget` | NUMERIC | YES | NULL | Orçamento final aceito |
| `deadline` | TEXT | YES | NULL | Prazo desejado (texto livre) |
| `priority` | TEXT | NO | 'normal' | normal, high, urgent |
| `status` | TEXT | NO | 'pending' | Ver enum abaixo |
| `current_group` | INT | NO | 1 | Grupo atual (1, 2, 3) |
| `group1_notified_at` | TIMESTAMPTZ | YES | NULL | Timestamp notif. G1 |
| `group2_notified_at` | TIMESTAMPTZ | YES | NULL | Timestamp notif. G2 |
| `group3_notified_at` | TIMESTAMPTZ | YES | NULL | Timestamp notif. G3 |
| `accepted_by` | UUID | YES | NULL | ID profissional aceito |
| `accepted_at` | TIMESTAMPTZ | YES | NULL | Timestamp aceitação |
| `completed_at` | TIMESTAMPTZ | YES | NULL | Timestamp conclusão |
| `tracking_token` | TEXT | NO | gen_random_uuid() | Token p/ clientes s/ login |
| `attachments` | JSONB | YES | '[]' | URLs de anexos |
| `metadata` | JSONB | YES | '{}' | Metadados adicionais |
| `created_at` | TIMESTAMPTZ | NO | now() | Data criação |
| `updated_at` | TIMESTAMPTZ | NO | now() | Data atualização |

**Enum `status`:**
- `pending` - Aguardando propostas
- `receiving_proposals` - Recebendo propostas ativas
- `accepted` - Proposta aceita, em execução
- `completed` - Concluído
- `cancelled` - Cancelado
- `no_interest` - Sem interesse (72h sem aceite)
- `disputed` - Em disputa

**Índices:**
```sql
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_current_group ON projects(current_group);
CREATE INDEX idx_projects_tracking_token ON projects(tracking_token);
CREATE INDEX idx_projects_accepted_by ON projects(accepted_by);
```

**RLS (Row Level Security):**
```sql
-- Clientes podem ver seus próprios projetos via tracking_token
CREATE POLICY "View own projects via token"
ON projects FOR SELECT
USING (tracking_token = current_setting('request.jwt.claim.tracking_token', true));

-- Profissionais podem ver projetos notificados
CREATE POLICY "View notified projects"  
ON projects FOR SELECT
USING (
  id IN (
    SELECT project_id 
    FROM project_notifications 
    WHERE professional_id = auth.uid()
  )
);
```

---

### Tabela: `project_proposals`

**Descrição:** Propostas enviadas por profissionais

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | gen_random_uuid() | ID único |
| `project_id` | UUID | NO | - | FK → projects.id |
| `professional_id` | UUID | NO | - | FK → auth.users.id |
| `proposed_budget` | NUMERIC | NO | - | Orçamento proposto (R$) |
| `estimated_days` | INT | YES | NULL | Prazo estimado (dias) |
| `description` | TEXT | NO | - | Descrição da proposta |
| `attachments` | JSONB | YES | '[]' | Portfolio, etc |
| `status` | TEXT | NO | 'pending' | pending, accepted, rejected |
| `created_at` | TIMESTAMPTZ | NO | now() | Data envio |
| `updated_at` | TIMESTAMPTZ | NO | now() | Data atualização |

**Constraints:**
```sql
-- Apenas 1 proposta por profissional por projeto
ALTER TABLE project_proposals
ADD CONSTRAINT unique_proposal_per_professional
UNIQUE (project_id, professional_id);

-- Budget deve ser positivo
ALTER TABLE project_proposals
ADD CONSTRAINT positive_budget
CHECK (proposed_budget > 0);

-- Dias deve ser positivo se informado
ALTER TABLE project_proposals
ADD CONSTRAINT positive_days
CHECK (estimated_days IS NULL OR estimated_days > 0);
```

**Índices:**
```sql
CREATE INDEX idx_proposals_project ON project_proposals(project_id);
CREATE INDEX idx_proposals_professional ON project_proposals(professional_id);
CREATE INDEX idx_proposals_status ON project_proposals(status);
```

**Triggers:**
```sql
-- Auto-update updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON project_proposals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### Tabela: `project_notifications`

**Descrição:** Notificações específicas de projetos

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | gen_random_uuid() | ID único |
| `project_id` | UUID | NO | - | FK → projects.id |
| `professional_id` | UUID | NO | - | FK → auth.users.id |
| `type` | TEXT | NO | - | project_available, proposal_accepted, etc |
| `group_number` | INT | YES | NULL | Grupo notificado (1, 2, 3) |
| `viewed` | BOOLEAN | NO | false | Visualizado? |
| `viewed_at` | TIMESTAMPTZ | YES | NULL | Data visualização |
| `created_at` | TIMESTAMPTZ | NO | now() | Data criação |

**Tipos de notificações:**
- `project_available` - Projeto disponível
- `proposal_accepted` - Sua proposta foi aceita
- `proposal_rejected` - Sua proposta foi rejeitada
- `project_completed` - Projeto concluído
- `new_message` - Nova mensagem no chat

**Índices:**
```sql
CREATE INDEX idx_notifications_professional ON project_notifications(professional_id);
CREATE INDEX idx_notifications_viewed ON project_notifications(viewed);
CREATE INDEX idx_notifications_project ON project_notifications(project_id);
```

---

### Tabela: `project_activities`

**Descrição:** Log de todas as atividades do projeto

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | gen_random_uuid() | ID único |
| `project_id` | UUID | NO | - | FK → projects.id |
| `user_id` | UUID | YES | NULL | Usuário que fez ação |
| `action` | TEXT | NO | - | Tipo de ação |
| `description` | TEXT | YES | NULL | Descrição |
| `metadata` | JSONB | YES | '{}' | Dados adicionais |
| `created_at` | TIMESTAMPTZ | NO | now() | Timestamp |

**Ações possíveis:**
- `created` - Projeto criado
- `distributed_to_group` - Distribuído para grupo X
- `proposal_submitted` - Proposta enviada
- `proposal_accepted` - Proposta aceita
- `proposal_rejected` - Proposta rejeitada
- `completed` - Concluído
- `reviewed` - Avaliado
- `cancelled` - Cancelado

---

### Tabela: `project_messages`

**Descrição:** Chat entre cliente e profissional

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | gen_random_uuid() | ID |
| `project_id` | UUID | NO | - | FK → projects.id |
| `sender_id` | UUID | NO | - | FK → auth.users.id |
| `message` | TEXT | NO | - | Conteúdo |
| `attachments` | JSONB | YES | '[]' | Arquivos |
| `read_at` | TIMESTAMPTZ | YES | NULL | Lido em |
| `created_at` | TIMESTAMPTZ | NO | now() | Enviado em |

---

### Tabela: `project_reviews`

**Descrição:** Avaliações após conclusão

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | gen_random_uuid() | ID |
| `project_id` | UUID | NO | - | FK → projects.id |
| `reviewer_id` | UUID | NO | - | Quem avaliou |
| `reviewed_id` | UUID | NO | - | Quem foi avaliado |
| `rating` | INT | NO | - | Nota (1-5) |
| `comment` | TEXT | YES | NULL | Comentário |
| `created_at` | TIMESTAMPTZ | NO | now() | Data |

**Constraints:**
```sql
ALTER TABLE project_reviews
ADD CONSTRAINT rating_range
CHECK (rating >= 1 AND rating <= 5);
```

---

### Tabela: `project_penalties`

**Descrição:** Penalizações por má conduta

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | gen_random_uuid() | ID |
| `project_id` | UUID | NO | - | FK → projects.id |
| `professional_id` | UUID | NO | - | FK → auth.users.id |
| `reason` | TEXT | NO | - | Motivo |
| `vigor_penalty` | INT | NO | 0 | Pontos perdidos |
| `created_at` | TIMESTAMPTZ | NO | now() | Data |

---

### Tabela: `project_distribution_log`

**Descrição:** Log de distribuição (auditoria)

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| `id` | UUID | NO | gen_random_uuid() | ID |
| `project_id` | UUID | NO | - | FK → projects.id |
| `group_number` | INT | NO | - | Grupo (1/2/3) |
| `professionals_notified` | INT | NO | 0 | Qtd notificados |
| `distribution_criteria` | JSONB | YES | '{}' | Critérios usados |
| `created_at` | TIMESTAMPTZ | NO | now() | Timestamp |

---

## 🔌 APIs REST

### Base URL
```
Development: http://localhost:3000/api
Production: https://rotabusiness.com.br/api
```

---

### 1. `POST /api/projects/create-public`

**Descrição:** Cria um novo projeto (público)

**Autenticação:** Opcional

**Request Body:**
```json
{
  "title": "Desenvolvimento de App Fitness",
  "description": "Preciso de um app mobile para...",
  "category": "dev_mobile",
  "scope": "national",
  "pista_id": null,
  "requester_name": "João Silva",
  "requester_email": "joao@email.com",
  "requester_phone": "(11) 99999-9999",
  "location": "São Paulo, SP",
  "estimated_budget": 10000,
  "deadline": "60 dias",
  "priority": "normal",
  "attachments": []
}
```

**Response 200:**
```json
{
  "success": true,
  "projectId": "uuid-do-projeto",
  "trackingToken": "token-unico-cliente",
  "message": "Projeto criado com sucesso! Notificamos os profissionais."
}
```

**Response 400:**
```json
{
  "error": "Campos obrigatórios faltando"
}
```

**Workflow:**
1. Validar campos obrigatórios
2. Inserir na tabela `projects`
3. Gerar `tracking_token`
4. Chamar `distributeProjectToGroup(projectId, 1)` em background
5. Enviar email ao cliente
6. Retornar sucesso

---

### 2. `POST /api/projects/[projectId]/submit-proposal`

**Descrição:** Profissional envia proposta

**Autenticação:** Obrigatória (JWT)

**Path Params:**
- `projectId` (UUID)

**Request Body:**
```json
{
  "proposed_budget": 8500,
  "estimated_days": 45,
  "description": "Tenho 5 anos de experiência em React Native...",
  "attachments": ["url-portfolio.pdf"]
}
```

**Response 200:**
```json
{
  "success": true,
  "proposalId": "uuid-da-proposta",
  "message": "Proposta enviada com sucesso!"
}
```

**Response 400:**
```json
{
  "error": "Você já enviou uma proposta para este projeto"
}
```

**Response 403:**
```json
{
  "error": "Categoria incompatível"
}
```

**Workflow:**
1. Verificar autenticação
2. Validar: já existe proposta do mesmo profissional?
3. Validar: categoria compatível?
4. Inserir em `project_proposals`
5. Atualizar status do projeto para `receiving_proposals`
6. Enviar notificação ao cliente
7. Retornar sucesso

---

### 3. `POST /api/projects/[projectId]/accept-proposal`

**Descrição:** Cliente aceita uma proposta

**Autenticação:** Opcional (usa `trackingToken`)

**Path Params:**
- `projectId` (UUID)

**Request Body:**
```json
{
  "proposalId": "uuid-da-proposta",
  "trackingToken": "token-cliente" // Opcional se logado
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Proposta aceita! Profissional notificado."
}
```

**Response 400:**
```json
{
  "error": "Proposta já foi aceita"
}
```

**Workflow (Transação Atômica):**
```sql
BEGIN;
  
  -- 1. Aceitar proposta escolhida
  UPDATE project_proposals
  SET status = 'accepted', updated_at = now()
  WHERE id = proposalId AND status = 'pending';
  
  -- 2. Rejeitar outras propostas
  UPDATE project_proposals
  SET status = 'rejected', updated_at = now()
  WHERE project_id = projectId 
    AND id != proposalId
    AND status = 'pending';
  
  -- 3. Atualizar projeto
  UPDATE projects
  SET 
    status = 'accepted',
    accepted_by = professional_id,
    accepted_at = now(),
    final_budget = proposed_budget
  WHERE id = projectId;
  
  -- 4. Registrar atividade
  INSERT INTO project_activities (...)
  VALUES (...);

COMMIT;
```

---

### 4. `GET /api/projects/[projectId]/proposals`

**Descrição:** Lista propostas de um projeto

**Autenticação:** Opcional (usa `trackingToken`)

**Path Params:**
- `projectId` (UUID)

**Query Params:**
- `token` (string, opcional) - Tracking token do cliente

**Response 200:**
```json
{
  "project": {
    "id": "uuid",
    "title": "App Fitness",
    "category": "dev_mobile",
    "status": "receiving_proposals",
    "estimated_budget": 10000,
    "created_at": "2026-01-30T20:00:00Z"
  },
  "proposals": [
    {
      "id": "uuid-proposta-1",
      "professional_id": "uuid-prof",
      "proposed_budget": 8500,
      "estimated_days": 45,
      "description": "Tenho 5 anos...",
      "status": "pending",
      "created_at": "2026-01-30T20:05:00Z",
      "professional": {
        "id": "uuid",
        "full_name": "Marina Silva",
        "avatar_url": "https://...",
        "vigor": 2450,
        "rank": "CAPITÃO",
        "completedProjects": 15
      }
    }
  ]
}
```

**Joins Realizados:**
```sql
SELECT 
  pp.*,
  p.full_name,
  p.avatar_url,
  ug.total_points as vigor,
  ug.current_rank as rank,
  COUNT(pr.id) as completedProjects
FROM project_proposals pp
JOIN profiles p ON p.id = pp.professional_id
LEFT JOIN user_gamification ug ON ug.user_id = pp.professional_id
LEFT JOIN projects pr ON pr.accepted_by = pp.professional_id 
  AND pr.status = 'completed'
WHERE pp.project_id = $1
GROUP BY pp.id, p.id, ug.user_id
ORDER BY pp.created_at DESC;
```

---

### 5. `GET /api/cron/distribute-projects`

**Descrição:** CRON job para distribuição automática

**Autenticação:** CRON_SECRET

**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Response 200:**
```json
{
  "success": true,
  "timestamp": "2026-01-30T20:00:00Z",
  "results": {
    "group2Processed": 5,
    "group3Processed": 3,
    "markedNoInterest": 1
  },
  "details": {
    "group2": ["uuid1", "uuid2"],
    "group3": ["uuid3"],
    "abandoned": ["uuid4"]
  }
}
```

**Lógica:**
```javascript
// 1. Processar Grupo 2 (projetos 24h+ no G1)
const group1Projects = await supabase
  .from('projects')
  .select('*')
  .in('status', ['pending', 'receiving_proposals'])
  .eq('current_group', 1)
  .not('group1_notified_at', 'is', null)
  .lte('group1_notified_at', Date.now() - 24h)

for (project of group1Projects) {
  await distributeProjectToGroup(project.id, 2)
}

// 2. Processar Grupo 3 (similar)
// 3. Marcar "sem interesse" (72h+)
```

**Configuração Vercel (vercel.json):**
```json
{
  "crons": [{
    "path": "/api/cron/distribute-projects",
    "schedule": "0 0 * * *"
  }]
}
```

---

## ⚙️ FUNÇÕES E SERVIÇOS

### Função: `distributeProjectToGroup(projectId, groupNumber)`

**Arquivo:** `lib/services/projects-service.ts`

**Descrição:** Distribui projeto para um grupo específico

**Parâmetros:**
- `projectId` (UUID) - ID do projeto
- `groupNumber` (1 | 2 | 3) - Número do grupo

**Retorno:** `Promise<{ notified: number }>`

**Lógica:**
```typescript
async function distributeProjectToGroup(
  projectId: string, 
  groupNumber: number
) {
  // 1. Buscar projeto
  const project = await getProject(projectId)
  
  // 2. Buscar profissionais elegíveis
  const professionals = await getEligibleProfessionals(
    project.category,
    project.scope,
    project.pista_id
  )
  
  // 3. Dividir em 3 grupos por VIGOR
  const groups = divideIntoGroups(professionals, 3)
  const targetGroup = groups[groupNumber - 1]
  
  // 4. Notificar cada profissional
  for (const prof of targetGroup) {
    await notifyProfessional(prof, project, groupNumber)
  }
  
  // 5. Atualizar projeto
  await updateProject(projectId, {
    current_group: groupNumber,
    [`group${groupNumber}_notified_at`]: new Date()
  })
  
  // 6. Log de distribuição
  await logDistribution(projectId, groupNumber, targetGroup.length)
  
  return { notified: targetGroup.length }
}
```

**Função SQL Auxiliar:**
```sql
CREATE OR REPLACE FUNCTION get_eligible_professionals(
  p_category TEXT,
  p_scope TEXT,
  p_pista_id UUID
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  categories TEXT[],
  vigor INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.categories,
    COALESCE(ug.total_points, 0) as vigor
  FROM profiles p
  LEFT JOIN user_gamification ug ON ug.user_id = p.id
  WHERE 
    p_category = ANY(p.categories)
    AND (p_scope = 'national' OR p.pista = p_pista_id)
  ORDER BY vigor DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

### Canais de Notificação

#### 1. **Sino (In-App)**
- Tabela: `project_notifications`
- Realtime: Supabase Subscriptions
- Componente: `ProjectsCounterRealtime`

**Subscription:**
```typescript
supabase
  .channel('project-notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'project_notifications',
      filter: `professional_id=eq.${userId}`
    },
    (payload) => {
      // Atualizar contador
      // Tocar som
      // Mostrar toast
    }
  )
  .subscribe()
```

#### 2. **Chat com Admin**
- Tabela: `messages`
- Sistema existente de chat
- Mensagem automática do admin

#### 3. **Email**
- Service: `/api/emails/project-created`
- Template HTML responsivo
- Link com tracking token

---

## 🔐 SEGURANÇA

### Row Level Security (RLS)

**Habilitado em todas as tabelas:**
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_proposals ENABLE ROW LEVEL SECURITY;
-- ...etc
```

**Políticas exemplo:**

```sql
-- Profissionais veem projetos que foram notificados
CREATE POLICY "View notified projects"
ON projects FOR SELECT
USING (
  auth.uid() IN (
    SELECT professional_id 
    FROM project_notifications 
    WHERE project_id = projects.id
  )
);

-- Profissionais editam suas próprias propostas
CREATE POLICY "Edit own proposals"
ON project_proposals FOR ALL
USING (professional_id = auth.uid());

-- Clientes veem via tracking token
CREATE POLICY "View via tracking token"
ON projects FOR SELECT
USING (
  tracking_token = current_setting('request.jwt.claim.token', true)
);
```

### Validações Backend

**Anti-Spam:**
- Constraint UNIQUE em (project_id, professional_id)
- Rate limiting (futuro)

**Anti-Fraude:**
- Validação de tracking_token
- Transação atômica no aceite
- Logs de auditoria

---

## 📊 PERFORMANCE

### Índices Criados

```sql
-- Projects
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_current_group ON projects(current_group);
CREATE INDEX idx_projects_notified_at ON projects(
  group1_notified_at, group2_notified_at, group3_notified_at
);

-- Proposals
CREATE INDEX idx_proposals_project_status ON project_proposals(project_id, status);
CREATE INDEX idx_proposals_professional ON project_proposals(professional_id);

-- Notifications
CREATE INDEX idx_notifications_user_viewed ON project_notifications(
  professional_id, viewed
);
```

### Otimizações

**1. Caching:**
- Next.js cache em SSR
- Supabase Postgrest cache automático

**2. Lazy Loading:**
- Propostas carregam sob demanda
- Anexos carregam em background

**3. Realtime Eficiente:**
- Subscription apenas para usuário logado
- Unsubscribe ao desmontar componente

---

## 🧪 TESTES

### Testes Unitários (Recomendado)

```typescript
// lib/services/__tests__/projects-service.test.ts
describe('distributeProjectToGroup', () => {
  it('should notify correct professionals in group 1', async () => {
    const result = await distributeProjectToGroup('project-id', 1)
    expect(result.notified).toBeGreaterThan(0)
  })
  
  it('should divide professionals by VIGOR correctly', () => {
    const professionals = [/* mock data */]
    const groups = divideIntoGroups(professionals, 3)
    expect(groups[0][0].vigor).toBeGreaterThan(groups[2][0].vigor)
  })
})
```

### Testes de Integração

```bash
# Criar projeto
curl -X POST http://localhost:3000/api/projects/create-public \
  -H "Content-Type: application/json" \
  -d '{...}'

# Verificar notificações
psql -c "SELECT COUNT(*) FROM project_notifications WHERE project_id = '...'"

# Enviar proposta
curl -X POST http://localhost:3000/api/projects/{id}/submit-proposal \
  -H "Authorization: Bearer {token}" \
  -d '{...}'
```

---

## 🚀 DEPLOY

### Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Apenas backend

# App
NEXT_PUBLIC_BASE_URL=https://rotabusiness.com.br

# Cron Security
CRON_SECRET=random-secret-string-aqui

# Email (Futuro)
SENDGRID_API_KEY=SG...
# ou
RESEND_API_KEY=re_...
```

### Checklist Deploy

- [ ] Migrations executadas no Supabase
- [ ] RLS policies ativadas
- [ ] Variáveis de ambiente configuradas
- [ ] Vercel cron configurado (vercel.json)
- [ ] DNS apontado
- [ ] HTTPS ativo
- [ ] Logs configurados

---

## 📚 REFERÊNCIAS

**Documentação:**
- [Next.js App Router](https://nextjs.org/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

**Arquivos do Projeto:**
- `/docs/PROJETOS_APRESENTACAO_NEGOCIO.md` - Regras de negócio
- `/docs/PROJETOS_MODULO_COMPLETO.md` - Visão geral
- `/supabase/migrations/20260130_create_projects_tables.sql` - Schema

---

**Dúvidas técnicas? Abrir issue no repositório ou contatar: dev@rotabusiness.com.br**
