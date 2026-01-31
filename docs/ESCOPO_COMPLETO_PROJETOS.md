# 🎯 ESCOPO COMPLETO - MÓDULO DE PROJETOS

> **Projeto:** Rota Business Club - Sistema de Projetos  
> **Versão:** 1.0 Final  
> **Data:** 30/01/2026  
> **Status:** 📋 Pronto para Implementação

---

## 📑 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Tipos de Projetos](#tipos-de-projetos)
3. [Sistema de Distribuição (3 Grupos)](#sistema-de-distribuição)
4. [Notificações (3 Canais)](#notificações)
5. [Card de Gestão](#card-de-gestão)
6. [Validação e Entrega](#validação-e-entrega)
7. [Penalizações](#penalizações)
8. [Recompensas (VIGOR)](#recompensas)
9. [Estrutura de Dados](#estrutura-de-dados)
10. [Componentes e Páginas](#componentes-e-páginas)
11. [APIs e Endpoints](#apis-e-endpoints)
12. [Plano de Implementação](#plano-de-implementação)

---

## 🎯 VISÃO GERAL

### Objetivo
Criar um sistema onde **clientes lançam solicitações de serviços** e **profissionais aceitam/entregam projetos**, com distribuição inteligente baseada em pontos de VIGOR.

### Motivação Principal
Esta será a **principal razão** para usuários contratarem serviços da Rota Business.

### Diferenciais
- ✅ Distribuição justa por meritocracia (VIGOR)
- ✅ Sistema de 3 grupos com janelas de 24h
- ✅ Validação de entrega antes de recompensar
- ✅ Penalização por abandono
- ✅ Integração completa com gamificação

---

## 📊 TIPOS DE PROJETOS

### 1. PROJETO GERAL (Público)

**URL:** `https://www.rotabusinessclub.com.br/projects/create`

**Características:**
- 🌐 Acesso pela **home do site** (público)
- ❌ **SEM necessidade de cadastro**
- 📧 Apenas email + telefone do solicitante
- 🎯 Distribuído via **sistema de 3 grupos por VIGOR**
- 🗺️ Pode ser **NACIONAL** ou **PISTA ESPECÍFICA**

**Campos do Formulário:**
```typescript
interface ProjectGeneralForm {
    title: string                    // Ex: "Desenvolvimento de E-commerce"
    description: string              // Descrição detalhada
    category: string                 // De /admin/categories
    scope: 'national' | 'pista'     // Abrangência
    pista_id?: string               // Se scope = 'pista'
    requester_name: string          // Nome do cliente
    requester_email: string         // Email para contato
    requester_phone: string         // Telefone
    location?: string               // Cidade/Estado
    estimated_budget?: number       // Valor estimado
    deadline?: Date                 // Prazo desejado
    priority: 'low' | 'normal' | 'high' | 'urgent'
    attachments?: File[]            // Arquivos anexos
}
```

---

### 2. PROJETO DIRECIONADO (Privado)

**URL:** `/dashboard/projects/new`

**Características:**
- 👤 Feito dentro do **painel do usuário**
- 🎯 Enviado para **profissional específico**
- 🔔 Notificação direta (3 canais)
- 🔒 Apenas o profissional selecionado pode aceitar

**Campos do Formulário:**
```typescript
interface ProjectDirectForm {
    recipient_id: string            // ID do profissional
    title: string
    description: string
    category: string
    estimated_budget?: number
    deadline?: Date
    priority: 'low' | 'normal' | 'high' | 'urgent'
    attachments?: File[]
}
```

---

## ⚡ SISTEMA DE DISTRIBUIÇÃO (3 GRUPOS)

### Mecânica: Sistema de Ondas por VIGOR

**Regra Central:** Projetos gerais são distribuídos em **3 ondas de 24 horas** baseadas nos pontos de VIGOR dos profissionais.

### Exemplo Prático

**Cenário:**
- Projeto criado: Categoria "DESENVOLVIMENTO"
- 90 profissionais cadastrados nessa categoria
- Projeto de abrangência "NACIONAL"

**Processo:**

```
┌─────────────────────────────────────────────────┐
│ ETAPA 1: BUSCA E ORDENAÇÃO                      │
├─────────────────────────────────────────────────┤
│                                                  │
│ SELECT p.id, p.full_name, ug.total_points      │
│ FROM profiles p                                  │
│ JOIN user_gamification ug ON p.id = ug.user_id │
│ WHERE p.categories @> ARRAY['DESENVOLVIMENTO']  │
│   AND p.plan_type IN ('veterano', 'elite')     │
│   AND p.status = 'active'                       │
│ ORDER BY ug.total_points DESC                   │
│                                                  │
│ Resultado: 90 profissionais ordenados           │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ ETAPA 2: DIVISÃO EM 3 GRUPOS                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  GRUPO 1 (Top 33%)                              │
│  ┌──────────────────────────────────┐           │
│  │ 30 profissionais                 │           │
│  │ Mais pontos de VIGOR             │           │
│  │ Prioridade: MÁXIMA               │           │
│  └──────────────────────────────────┘           │
│                                                  │
│  GRUPO 2 (Mid 33%)                              │
│  ┌──────────────────────────────────┐           │
│  │ 30 profissionais                 │           │
│  │ Pontos de VIGOR médios           │           │
│  │ Prioridade: MÉDIA                │           │
│  └──────────────────────────────────┘           │
│                                                  │
│  GRUPO 3 (Low 33%)                              │
│  ┌──────────────────────────────────┐           │
│  │ 30 profissionais                 │           │
│  │ Menos pontos de VIGOR            │           │
│  │ Prioridade: BAIXA                │           │
│  └──────────────────────────────────┘           │
│                                                  │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ ETAPA 3: DISTRIBUIÇÃO ESCALONADA                │
├─────────────────────────────────────────────────┤
│                                                  │
│ T = 0h (Criação)                                │
│   🔔 Notificar GRUPO 1 (30 profissionais)       │
│   📊 Registrar: group1_notified_at              │
│   ⏱️  Iniciar timer de 24 horas                 │
│        ↓                                         │
│                                                  │
│ T = 24h                                          │
│   ❓ Alguém do Grupo 1 aceitou?                 │
│   ├─ ✅ SIM → Fim (projeto aceito)              │
│   └─ ❌ NÃO → Continue                          │
│        ↓                                         │
│   🔔 Notificar GRUPO 2 (30 profissionais)       │
│   📊 Registrar: group2_notified_at              │
│   ⏱️  Iniciar timer de 24 horas                 │
│        ↓                                         │
│                                                  │
│ T = 48h                                          │
│   ❓ Alguém do Grupo 2 aceitou?                 │
│   ├─ ✅ SIM → Fim (projeto aceito)              │
│   └─ ❌ NÃO → Continue                          │
│        ↓                                         │
│   🔔 Notificar GRUPO 3 (30 profissionais)       │
│   📊 Registrar: group3_notified_at              │
│   ⏱️  Aguardar indefinidamente                  │
│        ↓                                         │
│                                                  │
│ T = 72h+ (sem prazo fixo)                       │
│   ❓ Alguém do Grupo 3 aceitou?                 │
│   ├─ ✅ SIM → Fim (projeto aceito)              │
│   └─ ❌ NÃO → Marcar como "sem interesse"       │
│              → Notificar cliente                │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Filtros de Distribuição

#### Por Categoria (OBRIGATÓRIO)
```sql
-- Usar categorias de /admin/categories
WHERE p.categories @> ARRAY['CATEGORIA_DO_PROJETO']
```

#### Por Abrangência

**Nacional:**
```sql
-- Todos os profissionais da categoria, qualquer pista
SELECT ... WHERE p.categories @> ARRAY['DESENVOLVIMENTO']
```

**Pista Específica:**
```sql
-- Apenas profissionais da categoria E da pista
SELECT ... 
WHERE p.categories @> ARRAY['DESENVOLVIMENTO']
  AND p.pista = 'SP-001'
```

#### Por Modalidade

| Modalidade | Recebe Projetos Gerais? |
|------------|------------------------|
| Recruta    | ❌ Não                 |
| Veterano   | ✅ Sim                 |
| Elite      | ✅ Sim                 |

---

## 🔔 NOTIFICAÇÕES (3 CANAIS)

Ao notificar profissionais sobre novo projeto, enviar simultaneamente em **3 canais:**

### 1. 🔔 Sino no Header

```typescript
// Tabela: notifications
await supabase.from('notifications').insert({
    user_id: professional_id,
    type: 'new_project',
    title: '🎯 Novo Projeto Disponível!',
    body: `${project.category}: ${project.title}`,
    metadata: {
        project_id: project.id,
        category: project.category,
        estimated_budget: project.estimated_budget,
        group: groupNumber // 1, 2 ou 3
    },
    read: false
})

// Também insere em project_notifications para contador
await supabase.from('project_notifications').insert({
    user_id: professional_id,
    project_id: project.id,
    notification_type: 'new_project',
    viewed: false
})
```

**Comportamento:**
- Aparece no sino do header com contador
- Contador incrementa em tempo real
- Som de notificação toca
- Badge vermelho com número de novos projetos

---

### 2. 💬 Chat com Admin

```typescript
// Tabela: messages
await supabase.from('messages').insert({
    sender_id: ADMIN_USER_ID, // ID fixo do admin da plataforma
    receiver_id: professional_id,
    content: `
🎯 **Novo Projeto Disponível - Grupo ${groupNumber}**

**Categoria:** ${project.category}
**Título:** ${project.title}
**Descrição:** ${project.description}

${project.estimated_budget ? `💰 **Orçamento:** R$ ${project.estimated_budget}` : ''}

Você está no **Grupo ${groupNumber}** - ${groupDescription}

⏰ **Atenção:** Este projeto estará disponível por 24 horas para seu grupo.

🔗 [Ver Projeto e Aceitar](/dashboard/projects/${project.id})
    `,
    type: 'project_notification'
})
```

**Comportamento:**
- Mensagem do usuário admin da plataforma
- Aparece no chat do profissional
- Link direto para ver o projeto

---

### 3. 📧 Email

```typescript
await fetch('/api/emails/send', {
    method: 'POST',
    body: JSON.stringify({
        to: professional.email,
        template: 'new_project_notification',
        data: {
            professional_name: professional.full_name,
            project_title: project.title,
            project_category: project.category,
            project_description: project.description,
            estimated_budget: project.estimated_budget,
            group_number: groupNumber,
            group_description: groupDescription,
            project_url: `${BASE_URL}/dashboard/projects/${project.id}`,
            deadline_hours: 24
        }
    })
})
```

**Template HTML do Email:**

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2E4A3E; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .project-box { background: white; border-left: 4px solid #2E4A3E; padding: 15px; margin: 15px 0; }
        .button { background: #2E4A3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🎯 Novo Projeto Disponível!</h2>
        </div>
        
        <div class="content">
            <p>Olá, <strong>{{professional_name}}</strong>!</p>
            
            <p>Um novo projeto na categoria <strong>{{project_category}}</strong> está disponível:</p>
            
            <div class="project-box">
                <h3>{{project_title}}</h3>
                <p>{{project_description}}</p>
                {{#if estimated_budget}}
                <p><strong>💰 Orçamento Estimado:</strong> R$ {{estimated_budget}}</p>
                {{/if}}
            </div>
            
            <p>🏆 <strong>Você está no Grupo {{group_number}}</strong> - {{group_description}}</p>
            
            <p>⏰ <strong>Importante:</strong> Este projeto estará disponível por {{deadline_hours}} horas para o seu grupo. Seja rápido!</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{project_url}}" class="button">
                    Ver Projeto e Aceitar
                </a>
            </p>
            
            <p>Boa sorte! 🚀</p>
            
            <p>
                <small>
                    Se você não deseja aceitar este projeto, não precisa fazer nada. 
                    O projeto será automaticamente oferecido para outros profissionais.
                </small>
            </p>
        </div>
        
        <div class="footer">
            <p>Rota Business Club | Conectando profissionais a oportunidades</p>
            <p><a href="{{unsubscribe_url}}">Gerenciar notificações</a></p>
        </div>
    </div>
</body>
</html>
```

---

## 📊 CARD DE GESTÃO DE PROJETOS

### Visual do Card

```
┌─────────────────────────────────────────────────┐
│ 💼 PROJETOS              🔔 3      📍 12         │
│    Histórico profissional  ^novo    total        │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────────────┐    │
│  │   ✓ 8        │  │   🕐 4               │    │
│  │ CONCLUÍDOS   │  │ EM ANDAMENTO         │    │
│  └──────────────┘  └──────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ 📋 Seu histórico de projetos              │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Funcionalidades

1. **Contador de Novos Projetos**
   - Badge vermelho com número
   - Atualização em tempo real
   - Som de notificação

2. **Estatísticas**
   - Total de projetos
   - Concluídos
   - Em andamento

3. **Link para Histórico**
   - Botão para `/dashboard/projects`

---

## ✅ VALIDAÇÃO E ENTREGA

### Fluxo Completo

```
┌─────────────────────────────────────────────────┐
│ 1. PROFISSIONAL MARCA COMO ENTREGUE             │
├─────────────────────────────────────────────────┤
│                                                  │
│ Profissional acessa projeto aceito              │
│ Clica "Marcar como Entregue"                    │
│                                                  │
│ Modal aparece:                                   │
│ ├─ Upload de fotos (até 5, opcional)           │
│ ├─ Descrição da entrega (obrigatório)          │
│ └─ Botão "Confirmar Entrega"                    │
│                                                  │
│ Ao submeter:                                     │
│ ├─ Status → 'awaiting_confirmation'            │
│ ├─ Salva fotos e descrição                      │
│ ├─ NÃO adiciona VIGOR ainda                     │
│ └─ Notifica cliente (3 canais)                  │
│                                                  │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 2. CLIENTE RECEBE NOTIFICAÇÃO                   │
├─────────────────────────────────────────────────┤
│                                                  │
│ 📧 Email com:                                    │
│    ✅ "Projeto Entregue!"                       │
│    🖼️ Fotos da entrega (se houver)             │
│    📝 Descrição do profissional                 │
│    🔗 Link para confirmar                        │
│    🔗 Link para reportar problema                │
│                                                  │
│ 🔔 Sino no header                                │
│ 💬 Mensagem do admin                             │
│                                                  │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 3. CLIENTE ACESSA PÁGINA DE CONFIRMAÇÃO         │
├─────────────────────────────────────────────────┤
│                                                  │
│ URL: /projects/confirm/[tracking_token]         │
│                                                  │
│ Página mostra:                                   │
│ ├─ Descrição original do projeto                │
│ ├─ Fotos da entrega                             │
│ ├─ Descrição da entrega                         │
│ └─ 2 opções:                                     │
│                                                  │
│    ┌──────────────────────────────┐             │
│    │ ✅ Confirmar Entrega         │             │
│    └──────────────────────────────┘             │
│    ┌──────────────────────────────┐             │
│    │ ⚠️ Reportar Problema          │             │
│    └──────────────────────────────┘             │
│                                                  │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 4A. CLIENTE CONFIRMA (Caminho Feliz)            │
├─────────────────────────────────────────────────┤
│                                                  │
│ Sistema:                                         │
│ ├─ Status → 'completed'                         │
│ ├─ Calcula VIGOR (100-364 pontos)               │
│ ├─ Adiciona VIGOR ao profissional               │
│ ├─ Cria post no Feed NA ROTA                    │
│ ├─ Verifica medalhas                            │
│ ├─ Notifica profissional (3 canais)             │
│ └─ Redireciona cliente para avaliação           │
│                                                  │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 5. CLIENTE AVALIA PROFISSIONAL                  │
├─────────────────────────────────────────────────┤
│                                                  │
│ URL: /projects/rate/[tracking_token]            │
│                                                  │
│ Formulário:                                      │
│ ├─ Rating: ⭐⭐⭐⭐⭐ (1-5 estrelas)            │
│ ├─ Comentário (opcional)                        │
│ └─ Botão "Enviar Avaliação"                     │
│                                                  │
│ Ao enviar:                                       │
│ ├─ Salva em project_reviews                     │
│ ├─ Atualiza rating no projeto                   │
│ ├─ Recalcula média do profissional              │
│ ├─ Notifica profissional                        │
│ └─ Verifica medalha "5 Estrelas"                │
│                                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 4B. CLIENTE REPORTA PROBLEMA (Caminho Infeliz)  │
├─────────────────────────────────────────────────┤
│                                                  │
│ Modal pede:                                      │
│ └─ Descrição do problema (obrigatório)          │
│                                                  │
│ Sistema:                                         │
│ ├─ Status → 'disputed'                          │
│ ├─ Salva disputa                                │
│ ├─ Notifica admin (para mediação)               │
│ ├─ Notifica profissional                        │
│ └─ Aguarda resolução manual                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🚫 PENALIZAÇÕES

### Cenário 1: Abandono (Sem Andamento)

**Critério:**
- Projeto aceito há mais de **7 dias**
- Zero mensagens enviadas pelo profissional
- Zero atividades registradas
- Status ainda "accepted" ou "in_progress"

**Detecção:**
```typescript
// CRON diário às 02:00 AM
async function detectAbandonedProjects() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const { data: projects } = await supabase
        .from('projects')
        .select('*, accepted_by')
        .in('status', ['accepted', 'in_progress'])
        .lt('accepted_at', sevenDaysAgo)
    
    for (const project of projects) {
        // Verificar atividade
        const { count } = await supabase
            .from('project_activities')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .eq('user_id', project.accepted_by)
        
        if (count === 0) {
            await penalizeAbandonment(project)
        }
    }
}
```

**Penalização:**
- ⚠️ **-50 pontos de VIGOR**
- 🔔 Notificação de advertência (3 canais)
- 📝 Registro em `project_penalties`
- 🔄 Projeto volta ao status "pending"
- ♻️ Reinicia mecânica de distribuição por grupos

---

### Cenário 2: Desistência Ativa

**Critério:**
- Profissional clica "Desistir do Projeto"
- Precisa informar motivo (campo obrigatório)

**Penalização Variável:**

| Tempo desde aceitação | Penalização | Motivo |
|-----------------------|-------------|--------|
| ≤ 2 horas | 0 pontos | Sem penalização (pode ter sido erro) |
| > 2 horas | -10 pontos | Desistência leve |

**Processo:**
```typescript
async function withdrawFromProject(projectId, userId, reason) {
    const project = await getProject(projectId)
    const hours = hoursSince(project.accepted_at)
    
    if (hours <= 2) {
        // Sem penalização
        await releaseProject(projectId)
    } else {
        // Penalização leve
        await applyPenalty(userId, -10, 'withdrawal')
        await releaseProject(projectId)
    }
    
    // Notificar cliente
    await notifyClient(project, 'professional_withdrew')
    
    // Reiniciar distribuição
    await restartDistribution(projectId)
}
```

---

## 🎁 RECOMPENSAS (VIGOR)

### Cálculo Dinâmico

**Fórmula:**
```typescript
function calculateProjectXP(project): number {
    let xp = 100 // Base inicial
    
    // Multiplicador 1: Orçamento
    if (project.estimated_budget >= 10000) xp *= 1.5      // +50%
    else if (project.estimated_budget >= 5000) xp *= 1.3  // +30%
    else if (project.estimated_budget >= 2000) xp *= 1.2  // +20%
    
    // Multiplicador 2: Prioridade
    if (project.priority === 'urgent') xp *= 1.3          // +30%
    else if (project.priority === 'high') xp *= 1.15      // +15%
    
    // Multiplicador 3: Prazo
    const onTime = project.deadline && 
        new Date(project.completed_at) <= new Date(project.deadline)
    if (onTime) xp *= 1.3                                 // +30%
    
    // Multiplicador 4: Avaliação
    if (project.rating >= 4.5) xp *= 1.4                  // +40%
    else if (project.rating >= 4.0) xp *= 1.2             // +20%
    else if (project.rating >= 3.5) xp *= 1.1             // +10%
    
    return Math.floor(xp)
}
```

### Exemplos de Cálculo

| Cenário | Orçamento | Prioridade | No Prazo | Avaliação | VIGOR Total |
|---------|-----------|------------|----------|-----------|-------------|
| **Básico** | R$ 1.000 | Normal | ❌ | 3.0 ⭐⭐⭐ | **100** |
| **Médio** | R$ 5.000 | High | ✅ | 4.2 ⭐⭐⭐⭐ | **202** |
| **Grande** | R$ 15.000 | Urgent | ✅ | 4.8 ⭐⭐⭐⭐⭐ | **364** |
| **Urgente Pequeno** | R$ 800 | Urgent | ✅ | 4.5 ⭐⭐⭐⭐⭐ | **242** |

---

### Medalhas de Projetos

| Medalha | Nome | Critério | Rarity |
|---------|------|----------|--------|
| 🥉 | Novato Empreendedor | 1º projeto concluído | Common |
| 🥈 | Profissional Dedicado | 10 projetos concluídos | Rare |
| 🥇 | Mestre de Projetos | 50 projetos concluídos | Epic |
| ⭐ | 5 Estrelas | Média ≥ 4.8 em 20+ projetos | Legendary |

---

## 🗄️ ESTRUTURA DE DADOS

### Tabela: `projects`

```sql
CREATE TABLE projects (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_token VARCHAR(100) UNIQUE NOT NULL,
    
    -- Tipo e categoria
    type VARCHAR(20) NOT NULL CHECK (type IN ('general', 'specific')),
    category VARCHAR(100) NOT NULL,
    
    -- Título e descrição
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Solicitante
    requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    requester_name VARCHAR(255),
    requester_email VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(50) NOT NULL,
    
    -- Destinatário (projetos específicos)
    recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Abrangência
    scope VARCHAR(20) DEFAULT 'national' CHECK (scope IN ('national', 'pista')),
    pista_id VARCHAR(50),
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'accepted',
        'in_progress',
        'awaiting_confirmation',
        'completed',
        'cancelled',
        'disputed',
        'no_interest'
    )),
    
    -- Atribuição
    accepted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Distribuição por grupos
    current_group INTEGER DEFAULT 1 CHECK (current_group BETWEEN 1 AND 3),
    group1_notified_at TIMESTAMP WITH TIME ZONE,
    group2_notified_at TIMESTAMP WITH TIME ZONE,
    group3_notified_at TIMESTAMP WITH TIME ZONE,
    
    -- Detalhes
    location VARCHAR(255),
    estimated_budget DECIMAL(10, 2),
    deadline DATE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Arquivos
    attachments TEXT[],
    
    -- Entrega
    delivery_photos TEXT[],
    delivery_description TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    confirmed_by_client BOOLEAN DEFAULT FALSE,
    
    -- Conclusão
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Disputa
    disputed BOOLEAN DEFAULT FALSE,
    dispute_reason TEXT,
    
    -- Avaliação
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_comment TEXT,
    
    -- Cancelamento
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_reason TEXT,
    
    -- Metadata
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
CREATE INDEX idx_projects_requester ON projects(requester_id);
CREATE INDEX idx_projects_tracking ON projects(tracking_token);
```

---

### Tabela: `project_notifications`

```sql
CREATE TABLE project_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, project_id, notification_type)
);

CREATE INDEX idx_project_notif_user ON project_notifications(user_id);
CREATE INDEX idx_project_notif_viewed ON project_notifications(user_id, viewed);
CREATE INDEX idx_project_notif_project ON project_notifications(project_id);
```

---

### Tabela: `project_activities`

```sql
CREATE TABLE project_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_activities_project ON project_activities(project_id);
CREATE INDEX idx_project_activities_user ON project_activities(user_id);
```

---

### Tabela: `project_messages`

```sql
CREATE TABLE project_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    sender_email VARCHAR(255),
    message TEXT NOT NULL,
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_project_messages_project ON project_messages(project_id);
```

---

### Tabela: `project_reviews`

```sql
CREATE TABLE project_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_email VARCHAR(255),
    professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id)
);

CREATE INDEX idx_project_reviews_professional ON project_reviews(professional_id);
CREATE INDEX idx_project_reviews_project ON project_reviews(project_id);
```

---

### Tabela: `project_penalties`

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

---

### Tabela: `project_distribution_log`

```sql
CREATE TABLE project_distribution_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_number INTEGER NOT NULL CHECK (group_number BETWEEN 1 AND 3),
    professionals_notified UUID[],
    professionals_count INTEGER NOT NULL,
    notified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_distribution_log_project ON project_distribution_log(project_id);
```

---

## 🎨 COMPONENTES E PÁGINAS

### Estrutura de Pastas

```
/app/
├── projects/
│   ├── create/
│   │   └── page.tsx                    # Formulário público
│   ├── confirm/
│   │   └── [token]/
│   │       └── page.tsx                # Confirmar entrega
│   ├── rate/
│   │   └── [token]/
│   │       └── page.tsx                # Avaliar profissional
│   └── track/
│       └── [token]/
│           └── page.tsx                # Tracking público
│
└── dashboard/
    └── projects/
        ├── page.tsx                    # Lista de projetos
        ├── new/
        │   └── page.tsx                # Criar projeto direcionado
        ├── [id]/
        │   └── page.tsx                # Detalhes do projeto
        └── available/
            └── page.tsx                # Projetos disponíveis

/components/
├── projects/
│   ├── ProjectCard.tsx                 # Card na lista
│   ├── ProjectsCard.tsx                # Card do dashboard
│   ├── ProjectDetails.tsx              # Detalhes completos
│   ├── ProjectForm.tsx                 # Form público
│   ├── ProjectFormPrivate.tsx          # Form direcionado
│   ├── ProjectStatusBadge.tsx          # Badge de status
│   ├── ProjectTimeline.tsx             # Timeline atividades
│   ├── ProjectMessages.tsx             # Chat do projeto
│   ├── ProjectActions.tsx              # Botões de ação
│   ├── DeliveryModal.tsx               # Modal marcar entregue
│   ├── ConfirmDeliveryButton.tsx       # Botão confirmar
│   ├── ReportProblemModal.tsx          # Modal reportar
│   ├── RatingForm.tsx                  # Form avaliação
│   └── WithdrawModal.tsx               # Modal desistir
│
└── admin/
    └── ProjectsManager.tsx             # Admin de projetos

/lib/services/
└── projects-service.ts                 # Lógica de negócio
    ├── createProject()
    ├── distributeToGroups()
    ├── acceptProject()
    ├── deliverProject()
    ├── confirmDelivery()
    ├── withdrawProject()
    └── calculateProjectXP()

/hooks/
└── use-project-notifications.ts        # Hook contador
```

---

## 🔌 APIs E ENDPOINTS

### Projetos

```typescript
// Criar projeto público
POST /api/projects/create-public
Body: ProjectGeneralForm
Response: { projectId, trackingToken }

// Criar projeto direcionado
POST /api/projects/create-private
Body: ProjectDirectForm
Response: { projectId }

// Listar projetos disponíveis
GET /api/projects/available
Query: ?category=DESENVOLVIMENTO&scope=national
Response: Project[]

// Aceitar projeto
POST /api/projects/[id]/accept
Response: { success: boolean }

// Desistir de projeto
POST /api/projects/[id]/withdraw
Body: { reason: string }
Response: { success: boolean }

// Marcar como entregue
POST /api/projects/[id]/deliver
Body: { photos: string[], description: string }
Response: { success: boolean }

// Confirmar entrega (cliente)
POST /api/projects/[id]/confirm
Response: { success: boolean, xpGained: number }

// Reportar problema
POST /api/projects/[id]/dispute
Body: { reason: string }
Response: { success: boolean }

// Avaliar profissional
POST /api/projects/rate/[token]
Body: { rating: number, comment?: string }
Response: { success: boolean }

// Tracking público
GET /api/projects/track/[token]
Response: ProjectPublicView
```

### Notificações

```typescript
// Contar não visualizadas
GET /api/projects/notifications/count
Response: { count: number }

// Marcar como visualizada
POST /api/projects/notifications/[id]/view
Response: { success: boolean }

// Marcar todas como visualizadas
POST /api/projects/notifications/mark-all-viewed
Response: { success: boolean }
```

### CRON Jobs

```typescript
// Processar grupos (rodar a cada hora)
GET /api/cron/projects/process-groups

// Detectar abandonos (rodar diariamente às 02:00)
GET /api/cron/projects/detect-abandoned

// Lembrete de deadline (rodar diariamente)
GET /api/cron/projects/deadline-reminders
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### FASE 1: Base de Dados (Semana 1)
- [ ] Criar todas as tabelas SQL
- [ ] Criar índices
- [ ] Criar RLS (Row Level Security)
- [ ] Popular categorias (importar de `/admin/categories`)
- [ ] Criar funções SQL auxiliares
- [ ] Testar integridade referencial

### FASE 2: Sistema de Distribuição (Semana 1-2)
- [ ] Implementar lógica de divisão em 3 grupos
- [ ] Criar serviço de distribuição
- [ ] Implementar notificação em 3 canais
- [ ] Criar CRON para processar grupos a cada hora
- [ ] Criar log de distribuição
- [ ] Testar com diferentes volumes

### FASE 3: Formulário Público (Semana 2)
- [ ] Página `/projects/create`
- [ ] Componente `ProjectForm`
- [ ] Validação de campos
- [ ] Upload de arquivos
- [ ] Geração de tracking_token
- [ ] Integração com sistema de distribuição
- [ ] Email de confirmação ao cliente

### FASE 4: Dashboard Profissionais (Semana 2-3)
- [ ] Página `/dashboard/projects`
- [ ] Componente `ProjectsCard` (contador)
- [ ] Lista de projetos disponíveis
- [ ] Filtros (categoria, pista, prioridade)
- [ ] Botão "Aceitar Projeto"
- [ ] Modal de desistência
- [ ] Subscrição em tempo real

### FASE 5: Detalhes e Chat (Semana 3)
- [ ] Página `/dashboard/projects/[id]`
- [ ] Componente `ProjectDetails`
- [ ] Timeline de atividades
- [ ] Chat do projeto (`ProjectMessages`)
- [ ] Upload de arquivos dentro do chat
- [ ] Notificações de novas mensagens

### FASE 6: Entrega e Validação (Semana 3-4)
- [ ] Modal de marcar como entregue
- [ ] Upload de fotos de entrega
- [ ] Página `/projects/confirm/[token]`
- [ ] Botão de confirmar entrega
- [ ] Modal de reportar problema
- [ ] Sistema de disputas
- [ ] Notificação ao profissional

### FASE 7: Avaliação (Semana 4)
- [ ] Página `/projects/rate/[token]`
- [ ] Componente `RatingForm`
- [ ] Salvamento de avaliações
- [ ] Cálculo de média do profissional
- [ ] Exibir avaliações no perfil
- [ ] Notificação ao profissional

### FASE 8: Gamificação (Semana 4)
- [ ] Integrar cálculo de VIGOR
- [ ] Criar post automático no Feed NA ROTA
- [ ] Implementar medalhas de projetos
- [ ] Verificação automática de medalhas
- [ ] Ranking de profissionais por projetos

### FASE 9: Penalizações (Semana 5)
- [ ] CRON de detecção de abandono
- [ ] Aplicação de penalidades
- [ ] Sistema de desistência
- [ ] Registro de histórico de penalidades
- [ ] Notificações de advertência

### FASE 10: Projeto Direcionado (Semana 5)
- [ ] Página `/dashboard/projects/new`
- [ ] Seletor de profissionais
- [ ] Formulário privado
- [ ] Notificação ao destinatário
- [ ] Aceite exclusivo

### FASE 11: Admin (Semana 6)
- [ ] Componente `ProjectsManager`
- [ ] Dashboard de estatísticas
- [ ] Lista de todos os projetos
- [ ] Filtros avançados
- [ ] Moderação de disputas
- [ ] Cancelamento manual
- [ ] Reenvio de notificações

### FASE 12: Polimento (Semana 6)
- [ ] Testes end-to-end
- [ ] Otimizações de performance
- [ ] Ajustes de UX
- [ ] Documentação final
- [ ] Deploy em produção

---

## 📊 MÉTRICAS E KPIs

### Para Profissionais
- Total de projetos aceitos
- Total concluídos
- Taxa de conclusão (%)
- Avaliação média ⭐
- Total de VIGOR ganho
- Posição no ranking

### Para Admin
- Projetos criados (dia/semana/mês)
- Taxa de aceitação (%)
- Tempo médio até aceitação
- Tempo médio de conclusão
- Taxa de confirmação (%)
- Taxa de disputa (%)
- Projetos por categoria
- Projetos por pista
- Distribuição por grupos
- Profissionais mais ativos
- ROI do sistema

---

## ❓ QUESTÕES PENDENTES

### 1. Pistas
**Status:** ⚠️ Pendente  
**Questão:** Como estão estruturadas as pistas no banco?
- Existe tabela `pistas`?
- Campo `pista` no perfil já existe?
- Formato do ID da pista?

**Decisão necessária para:** Filtro de distribuição por pista

---

### 2. Serviço de Email
**Status:** ⚠️ Pendente  
**Questão:** Qual serviço de email usar?
- Resend?
- SendGrid?
- AWS SES?
- Já existe configurado?

**Decisão necessária para:** Notificações por email

---

### 3. Limites de Projetos Simultâneos
**Status:** ⚠️ Pendente  
**Sugestão:**
- Veterano: até 3 projetos ao mesmo tempo
- Elite: até 5 projetos ao mesmo tempo
- Recruta: N/A (não recebe projetos gerais)

**Decisão necessária para:** Validação ao aceitar projeto

---

### 4. CRON Jobs
**Status:** ⚠️ Pendente  
**Questão:** Como executar jobs agendados?
- Vercel Cron Jobs?
- Serviço externo (AWS Lambda, etc)?
- Outro?

**Decisão necessária para:** Processar grupos e detectar abandonos

---

## ✅ CHECKLIST FINAL

### Antes de Começar
- [ ] Revisar escopo completo com stakeholders
- [ ] Responder questões pendentes
- [ ] Definir prioridades de fases
- [ ] Alocar recursos/tempo
- [ ] Configurar ambiente de testes

### Durante Desenvolvimento
- [ ] Seguir ordem das fases
- [ ] Testar cada fase antes de prosseguir
- [ ] Documentar mudanças
- [ ] Code review
- [ ] Testes de performance

### Antes do Deploy
- [ ] Testes end-to-end completos
- [ ] Migração de dados (se necessário)
- [ ] Backup do banco
- [ ] Plano de rollback
- [ ] Monitoramento configurado

---

**🎯 Este escopo cobre TODO o módulo de Projetos de forma completa e detalhada. Pronto para começar a implementação!**
