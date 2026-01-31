# 📋 MÓDULO DE PROJETOS - ESPECIFICAÇÃO COMPLETA

> **Data de criação:** 30/01/2026  
> **Versão:** 2.0 - Especificação Detalhada  
> **Status:** ✅ Regras Definidas

---

## 🎯 VISÃO GERAL

O módulo de Projetos será a **principal motivação** para usuários contratarem serviços da Rota Business. Permite que clientes lancem solicitações de serviços e profissionais aceitem/entreguem.

---

## 📊 TIPOS DE PROJETOS

### 1. PROJETO GERAL (Público)
**URL:** `/projects/create`

**Características:**
- ✅ Acesso pela home do site (público)
- ✅ **SEM necessidade de cadastro**
- ✅ Apenas email + telefone do solicitante
- ✅ Distribuído por sistema de 3 grupos (ver política abaixo)
- ✅ Pode ser **NACIONAL** ou **PISTA ESPECÍFICA**

### 2. PROJETO DIRECIONADO (Privado)
**URL:** `/dashboard/projects/new`

**Características:**
- ✅ Feito dentro do painel do usuário
- ✅ Enviado para **usuário específico**
- ✅ Notificação direta ao profissional (3 canais)
- ✅ Apenas o profissional selecionado pode aceitar

---

## 📋 POLÍTICA DE DISTRIBUIÇÃO (SISTEMA DE 3 GRUPOS)

### ⚡ Mecânica de Distribuição por VIGOR

**Regra:** Projetos gerais são distribuídos em **3 ondas de 24 horas** baseadas nos pontos de VIGOR.

#### Exemplo Prático:

**Cenário:** Projeto categoria "DESENVOLVIMENTO", 90 profissionais cadastrados

```
┌─────────────────────────────────────────────────┐
│ ETAPA 1: ORDENAÇÃO E DIVISÃO                    │
├─────────────────────────────────────────────────┤
│ 1. Buscar profissionais:                        │
│    - Categoria = "DESENVOLVIMENTO"              │
│    - plan_type IN ('veterano', 'elite')         │
│    - Se pista: filtrar por pista também         │
│                                                  │
│ 2. Ordenar por total_points DESC                │
│                                                  │
│ 3. Dividir em 3 grupos iguais:                  │
│    ┌─────────────────────────────┐              │
│    │ GRUPO 1: Top 33% (30 users) │              │
│    │ ►  Profissionais com MAIS   │              │
│    │    pontos de VIGOR          │              │
│    └─────────────────────────────┘              │
│    ┌─────────────────────────────┐              │
│    │ GRUPO 2: Mid 33% (30 users) │              │
│    │ ►  Profissionais com vigor  │              │
│    │    MÉDIO                    │              │
│    └─────────────────────────────┘              │
│    ┌─────────────────────────────┐              │
│    │ GRUPO 3: Low 33% (30 users) │              │
│    │ ►  Profissionais com MENOS  │              │
│    │    pontos                   │              │
│    └─────────────────────────────┘              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ETAPA 2: DISTRIBUIÇÃO ESCALONADA                │
├─────────────────────────────────────────────────┤
│                                                  │
│ T+0h:   🔔 Notificar GRUPO 1 (Top vigor)        │
│         ↓                                        │
│         ⏳ Aguardar 24 horas                     │
│         ↓                                        │
│ T+24h:  ❓ Alguém aceitou?                       │
│         ├─ SIM → ✅ Fim do processo              │
│         └─ NÃO → 🔔 Notificar GRUPO 2            │
│                  ↓                               │
│                  ⏳ Aguardar 24 horas            │
│                  ↓                               │
│ T+48h:  ❓ Alguém aceitou?                       │
│         ├─ SIM → ✅ Fim do processo              │
│         └─ NÃO → 🔔 Notificar GRUPO 3            │
│                  ↓                               │
│                  ⏳ Aguardar 24+ horas           │
│                  ↓                               │
│ T+72h+: ❓ Alguém aceitou?                       │
│         ├─ SIM → ✅ Fim do processo              │
│         └─ NÃO → ⚠️ Marcar "sem interesse"       │
│                  📧 Notificar cliente            │
└─────────────────────────────────────────────────┘
```

---

### 🎯 Filtros de Distribuição

#### 1. Por Categoria (OBRIGATÓRIO)

✅ **Usar categorias existentes:** `/admin/categories`

**Query SQL:**
```sql
-- Profissional deve ter a categoria no perfil
WHERE p.categories @> ARRAY['CATEGORIA_DO_PROJETO']
```

**Match:** 
- Exato: `categoria_projeto = categoria_profissional`
- Profissional pode ter múltiplas categorias
- Projeto tem apenas 1 categoria

#### 2. Por Abrangência (Campo no Formulário)

**Opção A: NACIONAL** (padrão)
```sql
-- Buscar todos profissionais da categoria, qualquer pista
SELECT p.id, p.full_name, ug.total_points
FROM profiles p
JOIN user_gamification ug ON p.id = ug.user_id
WHERE p.categories @> ARRAY['DESENVOLVIMENTO']
  AND p.plan_type IN ('veterano', 'elite')
  AND p.status = 'active'
ORDER BY ug.total_points DESC
```

**Opção B: PISTA ESPECÍFICA**
```sql
-- Buscar apenas profissionais da categoria E da pista
SELECT p.id, p.full_name, p.pista, ug.total_points
FROM profiles p
JOIN user_gamification ug ON p.id = ug.user_id
WHERE p.categories @> ARRAY['DESENVOLVIMENTO']
  AND p.pista = 'SP-001'  -- Pista selecionada no formulário
  AND p.plan_type IN ('veterano', 'elite')
  AND p.status = 'active'
ORDER BY ug.total_points DESC
```

**Campo no Formulário:**
```tsx
<Select name="scope">
    <SelectItem value="national">Nacional (Todos do Brasil)</SelectItem>
    <SelectItem value="SP-001">São Paulo - Pista 001</SelectItem>
    <SelectItem value="RJ-001">Rio de Janeiro - Pista 001</SelectItem>
    {/* ... outras pistas */}
</Select>
```

---

### 📢 SISTEMA DE NOTIFICAÇÃO (3 CANAIS)

Ao notificar profissionais, enviar em **3 canais simultâneos:**

#### 1. 🔔 Sino no Header (Bell Notification)

```typescript
await supabase.from('notifications').insert({
    user_id: professional_id,
    type: 'new_project',
    title: '🎯 Novo Projeto Disponível!',
    body: `${project.category}: ${project.title}`,
    metadata: {
        project_id: project.id,
        category: project.category,
        estimated_budget: project.estimated_budget,
        group: 1 // Indicar qual grupo (1, 2 ou 3)
    },
    read: false
})
```

#### 2. 💬 Chat com Admin da Plataforma

```typescript
// Criar mensagem do admin para o profissional
await supabase.from('messages').insert({
    sender_id: ADMIN_USER_ID, // ID do usuário admin da plataforma
    receiver_id: professional_id,
    content: `
🎯 **Novo Projeto Disponível**

**Categoria:** ${project.category}
**Título:** ${project.title}
**Descrição:** ${project.description}
**Orçamento:** ${project.estimated_budget ? `R$ ${project.estimated_budget}` : 'Não informado'}

Você está no **Grupo ${groupNumber}** (profissionais com ${groupName} pontos de VIGOR).

🔗 [Ver Projeto](/dashboard/projects/${project.id})
    `,
    type: 'project_notification'
})

// Criar notificação de nova mensagem não lida
await supabase.from('notifications').insert({
    user_id: professional_id,
    type: 'new_message',
    title: 'Nova mensagem do Rota Business',
    body: 'Você tem um novo projeto disponível!',
    metadata: { project_id: project.id }
})
```

#### 3. 📧 Email

```typescript
// Enviar email via serviço de email
await fetch('/api/emails/send', {
    method: 'POST',
    body: JSON.stringify({
        to: professional.email,
        template: 'new_project',
        data: {
            professional_name: professional.full_name,
            project_title: project.title,
            project_category: project.category,
            project_description: project.description,
            estimated_budget: project.estimated_budget,
            group_number: groupNumber,
            project_url: `${BASE_URL}/dashboard/projects/${project.id}`,
            deadline_hours: 24 // Tem 24h para aceitar
        }
    })
})
```

**Template de Email (Sugestão):**
```html
<h2>🎯 Novo Projeto Disponível!</h2>

<p>Olá, {{professional_name}}!</p>

<p>Um novo projeto da categoria <strong>{{project_category}}</strong> está disponível para você:</p>

<div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #2E4A3E;">
    <h3>{{project_title}}</h3>
    <p>{{project_description}}</p>
    <p><strong>Orçamento Estimado:</strong> R$ {{estimated_budget}}</p>
</div>

<p>Você está no <strong>Grupo {{group_number}}</strong> - profissionais com alto desempenho!</p>

<p>⏰ <strong>Este projeto estará disponível por 24 horas para seu grupo.</strong></p>

<a href="{{project_url}}" style="background: #2E4A3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
    Ver Projeto e Aceitar
</a>

<p>Boa sorte! 🚀</p>
```

---

## 🚫 SISTEMA DE DESISTÊNCIA E PENALIZAÇÃO

### Cenário 1: Abandono (SEM andamento)

**Critério:** Projeto aceito há mais de **7 dias** com:
- ❌ Zero mensagens enviadas
- ❌ Zero atividades registradas
- ❌ Status ainda "accepted"

**Penalização Automática:**

```typescript
// Executar via CRON diário
async function checkAbandonedProjects() {
    const { data: abandoned } = await supabase
        .from('projects')
        .select('*, accepted_by')
        .eq('status', 'accepted')
        .lt('accepted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    
    for (const project of abandoned) {
        // Verificar se teve atividade
        const { count } = await supabase
            .from('project_activities')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .eq('user_id', project.accepted_by)
        
        if (count === 0) {
            // PENALIZAR
            await applyPenalty(project.accepted_by, project.id, 'abandonment')
        }
    }
}

async function applyPenalty(userId, projectId, type) {
    const penalties = {
        abandonment: { points: 50, title: 'Projeto Abandonado' },
        withdrawal: { points: 10, title: 'Desistência' }
    }
    
    const penalty = penalties[type]
    
    // 1. Remover VIGOR
    await supabase.rpc('add_user_xp', {
        p_user_id: userId,
        p_xp_amount: -penalty.points,
        p_activity: `project_${type}`,
        p_description: `Penalização: ${penalty.title} - Projeto #${projectId}`
    })
    
    // 2. Notificar (3 canais)
    await supabase.from('notifications').insert({
        user_id: userId,
        type: 'penalty',
        title: `⚠️ ${penalty.title}`,
        body: `Você perdeu ${penalty.points} pontos de VIGOR por não dar andamento ao projeto.`
    })
    
    // 3. Registrar histórico
    await supabase.from('project_penalties').insert({
        user_id: userId,
        project_id: projectId,
        penalty_type: type,
        points_deducted: penalty.points,
        reason: penalty.title
    })
    
    // 4. Liberar projeto novamente
    await supabase.from('projects').update({
        status: 'pending',
        accepted_by: null,
        accepted_at: null
    }).eq('id', projectId)
    
    // 5. REINICIAR mecânica de grupos
    await restartProjectDistribution(projectId)
}
```

---

### Cenário 2: Desistência Ativa

**Fluxo:**
1. Profissional acessa projeto
2. Clica "Desistir do Projeto"
3. Modal aparece solicitando motivo (campo obrigatório)

**Penalização:**

```typescript
interface WithdrawalReason {
    projectId: string
    userId: string
    reason: string
    timestamp: Date
}

async function withdrawFromProject({ projectId, userId, reason }: WithdrawalReason) {
    const project = await getProject(projectId)
    const acceptedAt = new Date(project.accepted_at)
    const now = new Date()
    const hoursSinceAccepted = (now - acceptedAt) / (1000 * 60 * 60)
    
    // Sem penalização se desistir em até 2 horas
    if (hoursSinceAccepted <= 2) {
        await withdrawWithoutPenalty(projectId, userId, reason)
        return
    }
    
    // Penalização leve (-10 pontos)
    await applyPenalty(userId, projectId, 'withdrawal')
    
    // Registrar motivo
    await supabase.from('project_activities').insert({
        project_id: projectId,
        user_id: userId,
        action: 'withdrawn',
        description: `Profissional desistiu. Motivo: ${reason}`
    })
    
    // Liberar projeto
    await supabase.from('projects').update({
        status: 'pending',
        accepted_by: null,
        accepted_at: null
    }).eq('id', projectId)
    
    // Notificar cliente (3 canais)
    await notifyClient(project, 'withdrawal')
    
    // REINICIAR mecânica (volta para o grupo atual)
    await restartProjectDistribution(projectId, 'continue_current_group')
}
```

---

## 🎁 SISTEMA DE RECOMPENSAS

### VIGOR por Projeto Concluído

**Cálculo Dinâmico:**

```typescript
interface ProjectReward {
    baseXP: number
    multipliers: {
        budget?: number     // Projetos grandes valem mais
        priority?: number   // Urgentes valem mais
        onTime?: number     // No prazo vale mais
        rating?: number     // Bem avaliados valem mais
    }
}

function calculateProjectXP(project): number {
    let xp = 100 // Base
    
    // Multiplicador por orçamento
    if (project.estimated_budget >= 10000) xp *= 1.5
    else if (project.estimated_budget >= 5000) xp *= 1.3
    else if (project.estimated_budget >= 2000) xp *= 1.2
    
    // Multiplicador por prioridade
    if (project.priority === 'urgent') xp *= 1.3
    else if (project.priority === 'high') xp *= 1.15
    
    // Multiplicador por prazo
    const completedOnTime = project.deadline && 
        new Date(project.completed_at) <= new Date(project.deadline)
    if (completedOnTime) xp *= 1.3
    
    // Multiplicador por avaliação
    if (project.rating >= 4.5) xp *= 1.4
    else if (project.rating >= 4.0) xp *= 1.2
    else if (project.rating >= 3.5) xp *= 1.1
    
    return Math.floor(xp)
}

// Aplicar recompensa
await supabase.rpc('add_user_xp', {
    p_user_id: professional_id,
    p_xp_amount: calculateProjectXP(project),
    p_activity: 'project_completed',
    p_description: `Projeto concluído: ${project.title}`
})
```

**Exemplo de Cálculos:**

| Projeto | Orçamento | Prioridade | No Prazo? | Avaliação | VIGOR |
|---------|-----------|------------|-----------|-----------|-------|
| Básico | R$ 1.000 | Normal | ❌ | 3.0 | **100** |
| Médio | R$ 5.000 | High | ✅ | 4.2 | **202** |
| Grande | R$ 15.000 | Urgent | ✅ | 4.8 | **364** |

---

### Medalhas (Gamificação)

Integrar com sistema de medalhas existente (`medals` + `user_medals`):

```sql
-- Medalhas de Projetos
INSERT INTO medals (id, name, description, icon, rarity, category) VALUES
('project_beginner', 'Novato Empreendedor', 'Complete seu primeiro projeto', 'Briefcase', 'common', 'projects'),
('project_10', 'Profissional Dedicado', 'Complete 10 projetos', 'Award', 'rare', 'projects'),
('project_50', 'Mestre de Projetos', 'Complete 50 projetos', 'Crown', 'epic', 'projects'),
('project_5stars', '5 Estrelas', 'Mantenha média ≥ 4.8 em 20+ projetos', 'Star', 'legendary', 'projects');
```

**Verificação Automática (ao completar projeto):**

```typescript
async function checkProjectMedals(userId: string) {
    const { count: totalCompleted } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('accepted_by', userId)
        .eq('status', 'completed')
    
    // Primeira conquista
    if (totalCompleted === 1) {
        await awardMedal(userId, 'project_beginner')
    }
    
    // 10 projetos
    if (totalCompleted === 10) {
        await awardMedal(userId, 'project_10')
    }
    
    // 50 projetos
    if (totalCompleted === 50) {
        await awardMedal(userId, 'project_50')
    }
    
    // 5 estrelas (média alta)
    if (totalCompleted >= 20) {
        const { data: avgRating } = await supabase
            .from('project_reviews')
            .select('rating')
            .eq('professional_id', userId)
        
        const avg = avgRating.reduce((sum, r) => sum + r.rating, 0) / avgRating.length
        
        if (avg >= 4.8) {
            await awardMedal(userId, 'project_5stars')
        }
    }
}
```

---

## 📸 INTEGRAÇÃO COM FEED "NA ROTA"

### Fotos de Entrega

Ao marcar projeto como "Entregue", profissional pode adicionar fotos do resultado.

**Fluxo:**

```tsx
// Modal de Entrega
<Dialog>
    <DialogContent>
        <DialogTitle>Entregar Projeto</DialogTitle>
        
        <Label>Fotos do Resultado (opcional)</Label>
        <ImageUpload 
            multiple
            maxFiles={5}
            onUpload={setDeliveryPhotos}
        />
        
        <Label>Descrição da Entrega</Label>
        <Textarea 
            placeholder="Descreva o trabalho realizado..."
            value={deliveryDescription}
            onChange={(e) => setDeliveryDescription(e.target.value)}
        />
        
        <Button onClick={handleDelivery}>
            Marcar como Entregue
        </Button>
    </DialogContent>
</Dialog>
```

**Backend - Criar Post Automático:**

```typescript
async function completeProject(projectId: string, deliveryData) {
    // 1. Atualizar projeto
    await supabase.from('projects').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        delivery_photos: deliveryData.photos,
        delivery_description: deliveryData.description
    }).eq('id', projectId)
    
    // 2. Criar post no Feed NA ROTA
    if (deliveryData.photos.length > 0) {
        await supabase.from('posts').insert({
            user_id: professional_id,
            content: `✅ Projeto concluído: ${project.title}\n\n${deliveryData.description}`,
            media_urls: deliveryData.photos,
            visibility: 'public',
            post_type: 'project_delivery',
            metadata: {
                project_id: project.id,
                category: project.category,
                client: project.requester_name || 'Cliente'
            }
        })
    }
    
    // 3. Adicionar VIGOR
    const xp = calculateProjectXP(project)
    await supabase.rpc('add_user_xp', {
        p_user_id: professional_id,
        p_xp_amount: xp,
        p_activity: 'project_completed',
        p_description: `Projeto concluído: ${project.title}`
    })
    
    // 4. Verificar medalhas
    await checkProjectMedals(professional_id)
    
    // 5. Notificar cliente (3 canais)
    await notifyClient(project, 'completed')
}
```

**Benefícios:**
- 📸 **Portfólio visual automático**
- 🌟 **Engajamento da comunidade**
- 🎯 **Marketing para novos clientes**
- 💪 **Motivação por reconhecimento**
- 🏆 **Prova social e credibilidade**

---

## 🗄️ ESTRUTURA DE DADOS ATUALIZADA

### Tabela: `projects`

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tipo de projeto
    type VARCHAR(20) NOT NULL CHECK (type IN ('general', 'specific')),
    
    -- Dados do projeto
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Usar categorias de /admin/categories
    
    -- Solicitante (pode ser anônimo ou cadastrado)
    requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(50) NOT NULL,
    requester_name VARCHAR(255),
    
    -- Destinatário (para projetos específicos) OU NULL (projetos gerais)
    recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Abrangência (NOVO)
    scope VARCHAR(20) DEFAULT 'national' CHECK (scope IN ('national', 'pista')),
    pista_id VARCHAR(50), -- NULL se national, pista específica se pista
    
    -- Status e progresso
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'no_interest')),
    accepted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_reason TEXT,
    
    -- Distribuição por grupos (NOVO)
    current_group INTEGER DEFAULT 1 CHECK (current_group BETWEEN 1 AND 3),
    group1_notified_at TIMESTAMP WITH TIME ZONE,
    group2_notified_at TIMESTAMP WITH TIME ZONE,
    group3_notified_at TIMESTAMP WITH TIME ZONE,
    
    -- Detalhes adicionais
    location VARCHAR(255),
    estimated_budget DECIMAL(10, 2),
    deadline DATE,
    priority VARCHAR(20) DEFAULT 'normal' 
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Entrega (NOVO)
    delivery_photos TEXT[],
    delivery_description TEXT,
    
    -- Avaliação
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_comment TEXT,
    
    -- Arquivos e mídia
    attachments TEXT[],
    
    -- Metadata
    tracking_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_scope ON projects(scope);
CREATE INDEX idx_projects_pista ON projects(pista_id);
CREATE INDEX idx_projects_current_group ON projects(current_group);
CREATE INDEX idx_projects_accepted_by ON projects(accepted_by);
```

### Tabela: `project_penalties` (NOVA)

```sql
CREATE TABLE project_penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    penalty_type VARCHAR(20) NOT NULL CHECK (penalty_type IN ('abandonment', 'withdrawal')),
    points_deducted INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_penalties_user ON project_penalties(user_id);
CREATE INDEX idx_project_penalties_project ON project_penalties(project_id);
```

### Tabela: `project_distribution_log` (NOVA)

```sql
-- Log de distribuição para análise
CREATE TABLE project_distribution_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_number INTEGER NOT NULL,
    professionals_notified UUID[],
    notified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_distribution_log_project ON project_distribution_log(project_id);
```

---

## 🚀 PRÓXIMAS ETAPAS

### FASE 1: Base de Dados (PRIORITÁRIO)
- [ ] Criar tabelas `projects`, `project_penalties`, `project_distribution_log`
- [ ] Criar funções SQL para distribuição de grupos
- [ ] Criar RLS (Row Level Security)
- [ ] Popular categorias (importar de `/admin/categories`)

### FASE 2: Sistema de Distribuição
- [ ] Implementar lógica de 3 grupos
- [ ] Job CRON para processar filas (24h entre grupos)
- [ ] Sistema de notificação em 3 canais
- [ ] Log de distribuição

### FASE 3: Formulário Público
- [ ] Página `/projects/create`
- [ ] Campo de categoria (dropdown)
- [ ] Campo de abrangência (nacional vs pista)
- [ ] Upload de arquivos
- [ ] Geração de tracking_token

### FASE 4: Dashboard Profissionais
- [ ] Lista de projetos disponíveis
- [ ] Filtros por categoria/pista
- [ ] Botão "Aceitar Projeto"
- [ ] Modal de desistência

### FASE 5: Entrega e Gamificação
- [ ] Modal de entrega com fotos
- [ ] Cálculo de VIGOR
- [ ] Criação automática de post no feed
- [ ] Sistema de medalhas

---

## ❓ QUESTÕES RESTANTES

1. ✅ **Categorias:** Usar `/admin/categories` - **RESOLVIDO**
2. ✅ **Distribuição:** Sistema de 3 grupos por VIGOR - **RESOLVIDO**
3. ✅ **Notificações:** 3 canais (sino, chat, email) - **RESOLVIDO**
4. ✅ **Penalização:** Abandono (-50) e Desistência (-10) - **RESOLVIDO**
5. ✅ **Feed:** Integração com NA ROTA - **RESOLVIDO**

**Pendentes:**

6. **Pistas:** Como está estruturado o cadastro de pistas no sistema?
   - Existe tabela `pistas`?
   - Campo `pista` no perfil do usuário já existe?

7. **Sistema de Email:** Qual serviço usar?
   - Resend? SendGrid? SES?
   - Já existe configurado?

8. **Limite de Projetos Simultâneos:**
   - Veterano: até 3 projetos ao mesmo tempo?
   - Elite: até 5 projetos ao mesmo tempo?

9. **Job/CRON:** Como executar jobs agendados?
   - Vercel Cron Jobs?
   - Serviço externo?

---

**🎯 Pronto para começar! Por onde iniciamos?**
