# 🎮 GAMIFICAÇÃO COMPLETA: Projetos + VIGOR + Medalhas + Proezas

> **Integração:** Sistema de Projetos com Gamificação  
> **Data:** 30/01/2026  
> **Status:** 📋 Especificação Completa

---

## 📊 VISÃO GERAL DOS SISTEMAS

### 1. VIGOR (Pontos)
**Tabela:** `user_gamification.total_points`  
**Características:**
- ✅ **Acumula PARA SEMPRE** (nunca reseta)
- ✅ Usado para **ranking geral**
- ✅ Usado para **distribuição de projetos** (3 grupos)
- ✅ Determina **patentes/ranks**

---

### 2. MEDALHAS (Permanentes)
**Tabelas:** `medals` + `user_medals`  
**Características:**
- 🏅 **Conquistas ALL-TIME** (histó rico total)
- 🏅 **NUNCA reseta**
- 🏅 Uma vez conquistada, **permanece para sempre**
- 🏅 Baseadas em marcos históricos totais

**Exemplos:**
- 🥉 Primeira confraria (total de todas as confrarias)
- 🥈 10 confrarias (total acumulado)
- 🥇 50 confrarias (total acumulado)

---

### 3. PROEZAS (Mensais)
**Tabelas:** `achievements` + `user_achievements`  
**Características:**
- 🎖️ **Conquistas MENSAIS** (temporada)
- 🎖️ **RESETA todo mês** (dia 1º)
- 🎖️ Pode ser ganha **novamente** no próximo mês
- 🎖️ Baseadas em desempenho DA TEMPORADA

**Exemplos:**
- 🎖️ Rei do Mês (mais confrarias NO MÊS)
- 🎖️ Top 3 do Mês (ranking mensal)
- 🎖️ 5 Confrarias no Mês (meta mensal)

---

## 🎯 COMO PROJETOS SE INTEGRAM

### VIGOR (Pontos)

#### Ganhar VIGOR
```typescript
// Ao COMPLETAR e SER CONFIRMADO pelo cliente
const xp = calculateProjectXP(project) // 100-364 pontos

await supabase.rpc('add_user_xp', {
    p_user_id: professional_id,
    p_xp_amount: xp,
    p_activity: 'project_completed',
    p_description: `Projeto concluído: ${project.title}`
})
```

**Cálculo detalhado:**
```typescript
function calculateProjectXP(project): number {
    let xp = 100 // Base
    
    // Multiplicadores
    if (project.estimated_budget >= 10000) xp *= 1.5  // +50%
    if (project.priority === 'urgent') xp *= 1.3      // +30%
    if (completedOnTime) xp *= 1.3                     // +30%
    if (rating >= 4.5) xp *= 1.4                       // +40%
    
    return Math.floor(xp)
}
```

#### Perder VIGOR
```typescript
// Abandono (7+ dias sem andamento)
await supabase.rpc('add_user_xp', {
    p_user_id: professional_id,
    p_xp_amount: -50,
    p_activity: 'project_abandoned',
    p_description: `Penalização: Projeto abandonado`
})

// Desistência (> 2 horas após aceitar)
await supabase.rpc('add_user_xp', {
    p_user_id: professional_id,
    p_xp_amount: -10,
    p_activity: 'project_withdrawal',
    p_description: `Desistência do projeto`
})
```

---

### MEDALHAS (Permanentes) - ALL-TIME

#### Medalhas de Projetos

```sql
-- Criar medalhas permanentes baseadas no TOTAL HISTÓRICO
INSERT INTO medals (id, name, description, icon, rarity, category) VALUES

-- Progresso básico
('project_first', 'Primeiro Projeto', 'Complete seu primeiro projeto com sucesso', 'Briefcase', 'common', 'projects'),
('project_5', 'Empreendedor', 'Complete 5 projetos no total', 'Award', 'uncommon', 'projects'),
('project_10', 'Profissional Dedicado', 'Complete 10 projetos no total', 'Trophy', 'rare', 'projects'),
('project_25', 'Veterano de Projetos', 'Complete 25 projetos no total', 'Crown', 'rare', 'projects'),
('project_50', 'Mestre de Projetos', 'Complete 50 projetos no total', 'Star', 'epic', 'projects'),
('project_100', 'Lenda dos Projetos', 'Complete 100 projetos no total', 'Zap', 'legendary', 'projects'),

-- Qualidade
('project_5stars', 'Excelência 5 Estrelas', 'Mantenha média ≥ 4.8 em 20+ projetos', 'Star', 'legendary', 'projects'),
('project_perfect', 'Perfeição Absoluta', 'Receba 10 avaliações 5 estrelas seguidas', 'Sparkles', 'legendary', 'projects'),

-- Valores
('project_50k', 'Negociador Bronze', 'Complete projetos que somem R$ 50.000', 'DollarSign', 'rare', 'projects'),
('project_100k', 'Negociador Prata', 'Complete projetos que somem R$ 100.000', 'DollarSign', 'epic', 'projects'),
('project_250k', 'Negociador Ouro', 'Complete projetos que somem R$ 250.000', 'DollarSign', 'legendary', 'projects'),

-- Velocidade
('project_speed', 'Raio', 'Complete 5 projetos com 100% no prazo', 'Zap', 'epic', 'projects'),

-- Zero penalização
('project_reliable', 'Confiável', 'Complete 20 projetos sem nenhuma penalização', 'Shield', 'epic', 'projects');
```

#### Verificação Automática

```typescript
// Ao completar projeto (APÓS confirmação do cliente)
async function checkProjectMedals(userId: string) {
    // Contar TODOS os projetos completados (histórico)
    const { count: totalCompleted } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('accepted_by', userId)
        .eq('status', 'completed')
    
    // Medalha: Primeiro projeto
    if (totalCompleted === 1) {
        await awardMedal(userId, 'project_first')
    }
    
    // Medalha: 5 projetos
    if (totalCompleted === 5) {
        await awardMedal(userId, 'project_5')
    }
    
    // Medalha: 10 projetos
    if (totalCompleted === 10) {
        await awardMedal(userId, 'project_10')
    }
    
    // Medalha: 25 projetos
    if (totalCompleted === 25) {
        await awardMedal(userId, 'project_25')
    }
    
    // Medalha: 50 projetos
    if (totalCompleted === 50) {
        await awardMedal(userId, 'project_50')
    }
    
    // Medalha: 100 projetos
    if (totalCompleted === 100) {
        await awardMedal(userId, 'project_100')
    }
    
    // Medalha: 5 Estrelas (histórico)
    if (totalCompleted >= 20) {
        const { data: reviews } = await supabase
            .from('project_reviews')
            .select('rating')
            .eq('professional_id', userId)
        
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        
        if (avg >= 4.8) {
            await awardMedal(userId, 'project_5stars')
        }
    }
    
    // Medalha: Perfeição (10 cinco estrelas seguidas)
    const { data: recent10 } = await supabase
        .from('project_reviews')
        .select('rating')
        .eq('professional_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
    
    if (recent10?.length === 10 && recent10.every(r => r.rating === 5)) {
        await awardMedal(userId, 'project_perfect')
    }
    
    // Medalha: Valor total (histórico)
    const { data: projects } = await supabase
        .from('projects')
        .select('estimated_budget')
        .eq('accepted_by', userId)
        .eq('status', 'completed')
        .not('estimated_budget', 'is', null)
    
    const totalValue = projects.reduce((sum, p) => sum + (p.estimated_budget || 0), 0)
    
    if (totalValue >= 250000) await awardMedal(userId, 'project_250k')
    else if (totalValue >= 100000) await awardMedal(userId, 'project_100k')
    else if (totalValue >= 50000) await awardMedal(userId, 'project_50k')
    
    // Medalha: Velocidade (5 projetos 100% no prazo)
    const { data: onTimeProjects } = await supabase
        .from('projects')
        .select('deadline, completed_at')
        .eq('accepted_by', userId)
        .eq('status', 'completed')
        .not('deadline', 'is', null)
    
    const onTime = onTimeProjects?.filter(p => 
        new Date(p.completed_at) <= new Date(p.deadline)
    ).length || 0
    
    if (onTime >= 5) {
        await awardMedal(userId, 'project_speed')
    }
    
    // Medalha: Confiável (20 projetos sem penalização)
    const { count: penalties } = await supabase
        .from('project_penalties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
    
    if (totalCompleted >= 20 && penalties === 0) {
        await awardMedal(userId, 'project_reliable')
    }
}
```

---

### PROEZAS (Mensais) - TEMPORADA ATUAL

#### Proezas de Projetos

```sql
-- Adicionar proezas mensais de projetos
INSERT INTO achievements (id, name, description, points_reward, category, is_monthly) VALUES

-- Campeões do mês
('workaholic_mes', 'Workaholic do Mês', 'Mais projetos entregues no mês', 500, 'monthly_ranking', true),
('qualidade_mes', 'Mestre da Qualidade', 'Melhor avaliação média nos projetos do mês (min 3 projetos)', 400, 'monthly_ranking', true),
('rapido_mes', 'Flash do Mês', 'Entregou projetos mais rápido no mês', 300, 'monthly_ranking', true),

-- Metas mensais
('3_projetos_mes', '3 Projetos no Mês', 'Complete 3 projetos em um único mês', 150, 'monthly_goal', true),
('5_projetos_mes', '5 Projetos no Mês', 'Complete 5 projetos em um único mês', 300, 'monthly_goal', true),
('10_projetos_mes', '10 Projetos no Mês', 'Complete 10 projetos em um único mês', 600, 'monthly_goal', true),

-- Qualidade mensal
('5estrelas_mes', '5 Estrelas do Mês', 'Receba 5 avaliações 5 estrelas no mês', 250, 'monthly_quality', true),
('100_prazo_mes', '100% no Prazo', 'Entregue todos os projetos do mês no prazo (min 3)', 200, 'monthly_quality', true),

-- Valores
('alto_valor_mes', 'Alto Valor no Mês', 'Complete projetos que somem R$ 20.000 no mês', 350, 'monthly_goal', true);
```

#### Verificação Mensal (CRON)

```typescript
// CRON: Rodar todo dia 1º do mês às 00:00
async function awardMonthlyProjectAchievements() {
    const lastMonth = getLastMonth() // '2026-01'
    
    // 1. WORKAHOLIC DO MÊS (mais projetos)
    const { data: topWorker } = await supabase
        .from('projects')
        .select('accepted_by, count')
        .eq('status', 'completed')
        .gte('completed_at', `${lastMonth}-01`)
        .lt('completed_at', `${getCurrentMonth()}-01`)
        .group('accepted_by')
        .order('count', { ascending: false })
        .limit(1)
        .single()
    
    if (topWorker) {
        await awardAchievement(topWorker.accepted_by, 'workaholic_mes', lastMonth)
    }
    
    // 2. MESTRE DA QUALIDADE (melhor média)
    const { data: topQuality } = await supabase.rpc('get_best_monthly_rating', {
        p_month: lastMonth,
        p_min_projects: 3
    })
    
    if (topQuality) {
        await awardAchievement(topQuality.user_id, 'qualidade_mes', lastMonth)
    }
    
    // 3. FLASH DO MÊS (mais rápido)
    const { data: topSpeed } = await supabase.rpc('get_fastest_delivery', {
        p_month: lastMonth
    })
    
    if (topSpeed) {
        await awardAchievement(topSpeed.user_id, 'rapido_mes', lastMonth)
    }
    
    // 4. METAS (para todos que atingiram)
    const { data: users } = await supabase
        .from('profiles')
        .select('id')
    
    for (const user of users) {
        const { count } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('accepted_by', user.id)
            .eq('status', 'completed')
            .gte('completed_at', `${lastMonth}-01`)
            .lt('completed_at', `${getCurrentMonth()}-01`)
        
        // 10 projetos
        if (count >= 10) {
            await awardAchievement(user.id, '10_projetos_mes', lastMonth)
        }
        // 5 projetos
        else if (count >= 5) {
            await awardAchievement(user.id, '5_projetos_mes', lastMonth)
        }
        // 3 projetos
        else if (count >= 3) {
            await awardAchievement(user.id, '3_projetos_mes', lastMonth)
        }
        
        // 5 Estrelas no mês
        const { count: fiveStars } = await supabase
            .from('project_reviews')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', user.id)
            .eq('rating', 5)
            .gte('created_at', `${lastMonth}-01`)
            .lt('created_at', `${getCurrentMonth()}-01`)
        
        if (fiveStars >= 5) {
            await awardAchievement(user.id, '5estrelas_mes', lastMonth)
        }
        
        // 100% no prazo
        const { data: monthProjects } = await supabase
            .from('projects')
            .select('deadline, completed_at')
            .eq('accepted_by', user.id)
            .eq('status', 'completed')
            .not('deadline', 'is', null)
            .gte('completed_at', `${lastMonth}-01`)
            .lt('completed_at', `${getCurrentMonth()}-01`)
        
        if (monthProjects?.length >= 3) {
            const allOnTime = monthProjects.every(p =>
                new Date(p.completed_at) <= new Date(p.deadline)
            )
            if (allOnTime) {
                await awardAchievement(user.id, '100_prazo_mes', lastMonth)
            }
        }
        
        // Alto valor
        const { data: valueProjects } = await supabase
            .from('projects')
            .select('estimated_budget')
            .eq('accepted_by', user.id)
            .eq('status', 'completed')
            .not('estimated_budget', 'is', null)
            .gte('completed_at', `${lastMonth}-01`)
            .lt('completed_at', `${getCurrentMonth()}-01`)
        
        const monthValue = valueProjects?.reduce((sum, p) => 
            sum + (p.estimated_budget || 0), 0
        ) || 0
        
        if (monthValue >= 20000) {
            await awardAchievement(user.id, 'alto_valor_mes', lastMonth)
        }
    }
}
```

---

## 📊 RESUMO COMPARATIVO

| Aspecto | VIGOR | MEDALHAS | PROEZAS |
|---------|-------|----------|---------|
| **Reset** | ❌ Nunca | ❌ Nunca | ✅ Todo mês |
| **Baseado em** | Ações individuais | Marcos históricos | Desempenho mensal |
| **Usado para** | Ranking, Distribuição | Showcase, Prestígio | Competição mensal |
| **Exemplo Projeto** | +150 VIGOR | "50 Projetos" | "Workaholic do Mês" |
| **Pode ganhar 2x?** | ✅ Sim (acumula) | ❌ Não (única vez) | ✅ Sim (todo mês) |

---

## 🎯 FLUXO COMPLETO DE UM PROJETO

```
┌─────────────────────────────────────────────────┐
│ 1. CRIAÇÃO DO PROJETO                           │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 2. DISTRIBUIÇÃO (baseada em VIGOR)              │
│    • Ordena profissionais por total_points      │
│    • Divide em 3 grupos                          │
│    • Notifica Grupo 1 (Top VIGOR)               │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 3. PROFISSIONAL ACEITA                          │
│    ❌ Ainda NÃO ganha VIGOR                     │
│    ❌ Ainda NÃO ganha Medalha                   │
│    ❌ Ainda NÃO ganha Proeza                    │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 4. PROFISSIONAL ENTREGA                         │
│    • Status → 'awaiting_confirmation'           │
│    • Upload fotos (opcional)                     │
│    ❌ Ainda NÃO ganha recompensas               │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 5. CLIENTE CONFIRMA                             │
│    ✅ VIGOR: +100 a +364 pontos                 │
│    ✅ MEDALHA: Verifica conquistas (all-time)  │
│    ✅ PROEZA: Verifica metas (mês atual)        │
│    ✅ POST: Cria no Feed NA ROTA                │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 6. CLIENTE AVALIA (1-5 estrelas)                │
│    • Salva avaliação                             │
│    • Recalcula média do profissional            │
│    ✅ Pode desbloquear medalhas de qualidade   │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ SOBRE O PLANO DE 12 FASES (6 SEMANAS)

### O que é?

É uma **ESTIMATIVA** de como implementar o módulo completo de projetos, dividida em etapas lógicas.

### Por que 12 fases?

```
FASE 1-2: Base (tabelas + distribuição)        ≈ 1-2 semanas
FASE 3-5: Formulários e Dashboard              ≈ 2 semanas  
FASE 6-8: Entrega e Gamificação                ≈ 2 semanas
FASE 9-12: Penalizações, Admin, Polimento      ≈ 1-2 semanas
──────────────────────────────────────────────────────────
TOTAL:                                          ≈ 6 semanas
```

### É um prazo rígido?

❌ **NÃO!** É apenas uma **estimativa inicial**.

**Depende de:**
- ⏱️ Quantas horas por dia você tem
- 👥 Se vai trabalhar sozinho ou com equipe
- 🐛 Quantidade de bugs/ajustes
- 🎨 Nível de polimento desejado
- 🔧 Complexidade das integrações

### Pode acelerar?

✅ **SIM!** Você pode:
- Pular fases menos importantes
- Implementar de forma mais simples
- Focar no MVP primeiro

**MVP (Mínimo Viável):**
- Fases 1, 2, 3, 4, 6 = ±2-3 semanas

### Pode demorar mais?

✅ **SIM!** É comum se:
- Trabalha poucas horas/dia
- Quer polimento máximo
- Encontra bugs complexos
- Adiciona features extras

---

## 🎯 RECOMENDAÇÃO

**Começar pelo MVP:**
1. ✅ Criar tabelas (FASE 1)
2. ✅ Sistema de distribuição básico (FASE 2)
3. ✅ Formulário público simples (FASE 3)
4. ✅ Dashboard mínimo (FASE 4)
5. ✅ Entrega + VIGOR básico (FASE 6)

**Depois adicionar:**
- Proezas mensais (CRON)
- Medalhas completas
- Admin avançado
- Polimento visual

---

**O plano de 12 fases é um GUIA, não uma OBRIGAÇÃO! Adapte conforme sua realidade.** 🚀
