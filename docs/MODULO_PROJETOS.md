# 📋 MÓDULO DE PROJETOS - ESBOÇO COMPLETO

> **Data de criação:** 30/01/2026  
> **Versão:** 1.0 - Esboço Inicial  
> **Status:** 🚧 Em Planejamento

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
- ✅ Disparado para usuários conforme política de modalidades
- ✅ Profissionais recebem notificação
- ✅ Primeiro a aceitar fica com o projeto

### 2. PROJETO DIRECIONADO (Privado)
**URL:** `/dashboard/projects/new`

**Características:**
- ✅ Feito dentro do painel do usuário
- ✅ Enviado para **usuário específico**
- ✅ Notificação direta ao profissional
- ✅ Apenas o profissional selecionado pode aceitar

---

## 🔄 FLUXOS DE USO

### Fluxo 1: Cliente Público (SEM cadastro)

```
1. Cliente acessa /projects/create
2. Preenche formulário:
   - Título do projeto
   - Descrição
   - Categoria/Tipo de serviço
   - Email
   - Telefone
   - Localização (opcional)
   - Orçamento estimado (opcional)
   - Arquivos anexos (opcional)
3. Submete projeto
4. Sistema:
   - Cria projeto com status "pending"
   - Busca profissionais elegíveis (por categoria, modalidade)
   - Envia notificações
   - Envia email de confirmação ao cliente
5. Cliente recebe link para acompanhar status
```

### Fluxo 2: Usuário Cadastrado → Profissional Específico

```
1. Usuário logado acessa /dashboard/projects/new
2. Seleciona profissional da rede
3. Preenche detalhes do projeto
4. Envia solicitação
5. Sistema:
   - Cria projeto com status "pending"
   - recipient_id = profissional selecionado
   - Envia notificação ao profissional
   - Adiciona ao feed de atividades
```

### Fluxo 3: Profissional Aceita Projeto

```
1. Profissional recebe notificação
2. Acessa /dashboard/projects (aba "Disponíveis")
3. Visualiza detalhes do projeto
4. Clica "Aceitar Projeto"
5. Sistema:
   - Atualiza status para "accepted"
   - Atribui accepted_by = profissional_id
   - Notifica cliente
   - Envia email ao cliente
   - Se projeto geral: remove das notificações de outros profissionais
```

### Fluxo 4: Profissional Entrega Projeto

```
1. Profissional acessa projeto aceito
2. Clica "Marcar como Entregue"
3. Pode adicionar:
   - Comentário final
   - Arquivos de entrega
4. Sistema:
   - Atualiza status para "completed"
   - Registra delivered_at
   - Notifica cliente
   - GAMIFICAÇÃO: +XP/Vigor ao profissional
   - Cria notificação para avaliação
```

---

## 🗄️ ESTRUTURA DE DADOS

### Tabela: `projects`

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tipo de projeto
    type VARCHAR(20) NOT NULL CHECK (type IN ('general', 'specific')),
    
    -- Dados do projeto
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Categoria/tipo de serviço
    
    -- Solicitante (pode ser anônimo ou cadastrado)
    requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL se público
    requester_email VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(50) NOT NULL,
    requester_name VARCHAR(255), -- Para projetos públicos
    
    -- Destinatário (para projetos específicos)
    recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Status e progresso
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    accepted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_reason TEXT,
    
    -- Detalhes adicionais
    location VARCHAR(255), -- Cidade, estado
    estimated_budget DECIMAL(10, 2),
    deadline DATE,
    priority VARCHAR(20) DEFAULT 'normal' 
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Arquivos e mídia
    attachments TEXT[], -- Array de URLs
    
    -- Metadata
    tracking_token VARCHAR(100) UNIQUE, -- Para clientes públicos acompanharem
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_requester ON projects(requester_id);
CREATE INDEX idx_projects_recipient ON projects(recipient_id);
CREATE INDEX idx_projects_accepted_by ON projects(accepted_by);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_tracking ON projects(tracking_token);
CREATE INDEX idx_projects_type ON projects(type);
```

### Tabela: `project_messages` (Comunicação)

```sql
CREATE TABLE project_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    sender_email VARCHAR(255), -- Para clientes não cadastrados
    message TEXT NOT NULL,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_messages_project ON project_messages(project_id);
```

### Tabela: `project_activities` (Histórico)

```sql
CREATE TABLE project_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'accepted', 'completed', 'message_sent', etc
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_activities_project ON project_activities(project_id);
```

### Tabela: `project_reviews` (Avaliações)

```sql
CREATE TABLE project_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_email VARCHAR(255), -- Para clientes não cadastrados
    professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, reviewer_id),
    UNIQUE(project_id, reviewer_email)
);

CREATE INDEX idx_project_reviews_professional ON project_reviews(professional_id);
```

---

## 🎨 ESTRUTURA DE COMPONENTES

### Páginas Públicas

```
/app/projects/
├── create/
│   └── page.tsx          # Formulário público de criação
├── track/
│   └── [token]/
│       └── page.tsx      # Acompanhamento por token (clientes públicos)
└── [id]/
    └── page.tsx          # Visualização pública do projeto
```

### Páginas do Dashboard

```
/app/dashboard/projects/
├── page.tsx               # Lista de projetos (minhas solicitações + disponíveis)
├── new/
│   └── page.tsx          # Criar projeto direcionado
├── [id]/
│   └── page.tsx          # Detalhes e gerenciamento
└── available/
    └── page.tsx          # Projetos disponíveis para aceitar
```

### Componentes Reutilizáveis

```
/components/projects/
├── ProjectCard.tsx              # Card de projeto (lista)
├── ProjectDetails.tsx           # Detalhes completos
├── ProjectForm.tsx              # Formulário de criação (público)
├── ProjectFormPrivate.tsx       # Formulário direcionado
├── ProjectStatusBadge.tsx       # Badge de status
├── ProjectTimeline.tsx          # Timeline de atividades
├── ProjectMessages.tsx          # Chat/mensagens
├── ProjectActions.tsx           # Botões de ação (aceitar, completar, etc)
├── ProjectFilters.tsx           # Filtros de busca
├── ProjectStats.tsx             # Estatísticas (para admin/profissional)
└── ReviewForm.tsx               # Formulário de avaliação
```

---

## 🔔 INTEGRAÇÃO COM SISTEMAS EXISTENTES

### 1. Sistema de Notificações (JÁ EXISTE)

**Aproveitar:** Tabela `notifications` existente

```typescript
// Notificar profissionais elegíveis
await supabase.from('notifications').insert({
    user_id: professional_id,
    type: 'new_project',
    title: 'Novo projeto disponível!',
    body: project.title,
    metadata: {
        project_id: project.id,
        category: project.category
    }
})
```

### 2. Sistema de Gamificação (JÁ EXISTE)

**Aproveitar:** Tabela `user_gamification`

```typescript
// Dar XP ao profissional ao completar projeto
const xpGained = calculateProjectXP(project) // Ex: 50-200 XP

await supabase.rpc('add_user_xp', {
    p_user_id: professional_id,
    p_xp_amount: xp_gained,
    p_activity: 'project_completed',
    p_description: `Projeto concluído: ${project.title}`
})
```

### 3. Sistema de Perfis (JÁ EXISTE)

**Aproveitar:** Tabela `profiles` e campos existentes

- `specializations` → Filtrar projetos por categoria
- `plan_type` → Política de distribuição (Recruta, Veterano, Elite)

### 4. Sistema de Email (SE EXISTIR)

Enviar emails em:
- ✉️ Projeto criado (confirmação ao cliente)
- ✉️ Projeto aceito (notificar cliente)
- ✉️ Projeto entregue (notificar cliente)
- ✉️ Nova mensagem no projeto

---

## 📋 POLÍTICA DE DISTRIBUIÇÃO (MODALIDADES)

### Regras Sugeridas:

| Modalidade | Projetos Gerais | Projetos Direcionados | Prioridade |
|------------|-----------------|----------------------|------------|
| **Recruta** | ❌ Não recebe | ✅ Pode receber | Baixa |
| **Veterano** | ✅ Recebe (categoria compatível) | ✅ Pode receber | Média |
| **Elite** | ✅ Recebe (todas categorias) | ✅ Pode receber | Alta |

**Lógica de distribuição:**
1. Projetos direcionados → Vão apenas para o recipient_id
2. Projetos gerais → Filtrados por:
   - Categoria compatível com `specializations` do profissional
   - Modalidade ≥ Veterano
   - Status do perfil = ativo
   - Ordenar por: Modalidade (Elite > Veterano), então score_gamification

---

## 🎛️ PAINEL ADMINISTRATIVO

### Dashboard de Projetos (Admin)

**URL:** `/admin/projects`

**Funcionalidades:**
- 📊 Estatísticas gerais
  - Total de projetos (por status)
  - Taxa de conversão (aceitos/criados)
  - Tempo médio de aceitação
  - Tempo médio de conclusão
- 📋 Lista de todos os projetos
- 🔍 Filtros avançados
- ✏️ Editar/Cancelar projetos
- 📧 Reenviar notificações

**Componente:** `components/admin/ProjectsManager.tsx`

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### FASE 1: Base de Dados ✅
- [ ] Criar tabelas SQL (`projects`, `project_messages`, `project_activities`, `project_reviews`)
- [ ] Criar índices
- [ ] Criar RLS (Row Level Security)
- [ ] Criar functions úteis (ex: `get_eligible_professionals`)

### FASE 2: Formulário Público
- [ ] Página `/projects/create`
- [ ] Componente `ProjectForm` (público)
- [ ] API route para criar projeto público
- [ ] Geração de tracking_token
- [ ] Integração com notificações

### FASE 3: Visualização de Projetos (Dashboard)
- [ ] Página `/dashboard/projects`
- [ ] Lista de "Projetos Disponíveis"
- [ ] Lista de "Meus Projetos Aceitos"
- [ ] Lista de "Minhas Solicitações"
- [ ] Componente `ProjectCard`
- [ ] Componente `ProjectStatusBadge`

### FASE 4: Aceitar e Gerenciar Projetos
- [ ] Página `/dashboard/projects/[id]`
- [ ] Botão "Aceitar Projeto"
- [ ] Sistema de mensagens
- [ ] Timeline de atividades
- [ ] Botão "Marcar como Entregue"

### FASE 5: Projeto Direcionado
- [ ] Página `/dashboard/projects/new`
- [ ] Seletor de profissionais
- [ ] Formulário de criação
- [ ] Notificação ao destinatário

### FASE 6: Tracking Público
- [ ] Página `/projects/track/[token]`
- [ ] Visualização de status sem login
- [ ] Sistema de mensagens (cliente ↔ profissional)

### FASE 7: Avaliações
- [ ] Formulário de avaliação
- [ ] Exibir avaliações no perfil do profissional
- [ ] Cálculo de rating médio

### FASE 8: Gamificação e Rewards
- [ ] Integrar com sistema de XP
- [ ] Medalhas por projetos completados
- [ ] Ranking de profissionais por projetos

### FASE 9: Admin
- [ ] Painel administrativo
- [ ] Estatísticas
- [ ] Moderação de projetos

---

## 📊 MÉTRICAS E KPIs

### Métricas para Dashboard

**Para Profissionais:**
- Total de projetos aceitos
- Total de projetos concluídos
- Taxa de conclusão
- Avaliação média
- Valor total estimado

**Para Admin:**
- Projetos criados (dia/semana/mês)
- Taxa de aceitação
- Tempo médio até aceitação
- Tempo médio de conclusão
- Projetos por categoria
- Profissionais mais ativos

---

## 🎨 WIREFRAMES / UI SUGERIDA

### Card de Projeto (Lista)

```
┌─────────────────────────────────────────┐
│ 🔧 [Categoria Badge]      [Status Badge]│
│                                          │
│ Título do Projeto                        │
│ Descrição curta do projeto...            │
│                                          │
│ 📍 São Paulo, SP    💰 R$ 5.000          │
│ ⏱️ Criado há 2 horas                     │
│                                          │
│ [Ver Detalhes]  [Aceitar Projeto] ──────│
└─────────────────────────────────────────┘
```

### Formulário Público

```
┌─────────────────────────────────────────┐
│  Solicite um Serviço                     │
│                                          │
│  Título do Projeto                       │
│  [_________________________________]     │
│                                          │
│  Categoria                               │
│  [▼ Selecione a categoria        ]     │
│                                          │
│  Descrição Detalhada                     │
│  [_________________________________]     │
│  [_________________________________]     │
│  [_________________________________]     │
│                                          │
│  Seus Dados de Contato                   │
│  Nome:     [_______________________]     │
│  Email:    [_______________________]     │
│  Telefone: [_______________________]     │
│                                          │
│  Informações Adicionais (Opcional)       │
│  Localização: [___________________]     │
│  Orçamento:   [R$ ________________]     │
│  Prazo:       [___________________]     │
│                                          │
│  Anexos (opcional)                       │
│  [📎 Adicionar arquivo]                 │
│                                          │
│            [Enviar Solicitação] ────────│
└─────────────────────────────────────────┘
```

---

## 🔒 SEGURANÇA E PERMISSÕES

### Row Level Security (RLS)

```sql
-- Projetos: visualização
CREATE POLICY "Public can view general projects"
ON projects FOR SELECT
USING (type = 'general' AND status = 'pending');

CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
USING (
    auth.uid() = requester_id 
    OR auth.uid() = recipient_id 
    OR auth.uid() = accepted_by
);

-- Projetos: criação pública permitida (via service_key)
-- Usuários autenticados podem criar projetos direcionados
CREATE POLICY "Authenticated users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Projetos: aceitar
CREATE POLICY "Users can accept projects"
ON projects FOR UPDATE
USING (
    (type = 'general' AND status = 'pending') 
    OR (type = 'specific' AND auth.uid() = recipient_id)
)
WITH CHECK (auth.uid() = accepted_by);
```

---

## 📞 API ENDPOINTS (Sugestão)

### Projetos

```typescript
// Criar projeto público
POST /api/projects/create-public
Body: { title, description, category, email, phone, ... }

// Criar projeto direcionado
POST /api/projects/create-private
Body: { title, description, recipient_id, ... }

// Listar projetos disponíveis para mim
GET /api/projects/available

// Aceitar projeto
POST /api/projects/[id]/accept

// Marcar como entregue
POST /api/projects/[id]/complete

// Cancelar projeto
POST /api/projects/[id]/cancel

// Buscar por tracking token
GET /api/projects/track/[token]

// Enviar mensagem
POST /api/projects/[id]/messages
```

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

1. **Revisar esboço com você** e ajustar conforme necessário
2. **Criar tabelas SQL** no banco de dados
3. **Definir categorias** de serviços (lista fixa ou dinâmica?)
4. **Implementar FASE 1** (Base de Dados)
5. **Implementar FASE 2** (Formulário Público)

---

## 🤔 QUESTÕES PARA DECIDIR

1. **Categorias de Serviços:** Lista fixa ou dinâmica? Sugestões:
   - Design Gráfico
   - Desenvolvimento Web
   - Marketing Digital
   - Consultoria Empresarial
   - Fotografia/Vídeo
   - Outros?

2. **Orçamento:** Obrigatório ou opcional?

3. **Prazo:** Obrigatório ou opcional?

4. **Arquivos:** Tamanho máximo? Tipos permitidos?

5. **Política de Cancelamento:** Quem pode cancelar? Quando?

6. **Pagamento:** Integrar sistema de pagamento? Ou apenas indicativo?

7. **Concurrent Projects:** Profissional pode aceitar quantos projetos simultaneamente?

8. **Expiração:** Projetos não aceitos expiram após X dias?

---

**🎯 Estou pronto para começar a implementar! Por onde quer começar?**
