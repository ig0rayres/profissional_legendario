# 📅 Sistema de Gamificação Mensal - Documentação Completa
**Rota Business Club**  
**Versão:** 2.0.0  
**Data:** 18 de Janeiro de 2026  
**Status:** Em Desenvolvimento  
**Autor:** Claude AI / Igor

---

## 📋 ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Mudança de Arquitetura](#2-mudança-de-arquitetura)
3. [Regras de Negócio](#3-regras-de-negócio)
4. [Compatibilidade Retroativa](#4-compatibilidade-retroativa)
5. [Banco de Dados](#5-banco-de-dados)
6. [Funções SQL](#6-funções-sql)
7. [API TypeScript](#7-api-typescript)
8. [Admin Panel](#8-admin-panel)
9. [CRON/Automação](#9-cronauamação)
10. [Guia de Migração](#10-guia-de-migração)
11. [Troubleshooting](#11-troubleshooting)
12. [Checklist de Implementação](#12-checklist-de-implementação)

---

## 1. VISÃO GERAL

### O que é o Sistema de Gamificação Mensal?

O sistema de gamificação do Rota Business Club funciona em **ciclos mensais**:

- ⚡ **Pontos de Vigor (XP)** são resetados no dia 1 de cada mês
- 🏅 **Medalhas** podem ser reconquistadas a cada mês
- 📜 **Histórico completo** é mantido para sempre
- 🏆 **Ranking mensal** é calculado ao final de cada mês

### Por que sistema mensal?

1. **Engajamento contínuo** - Usuários têm motivação para participar todo mês
2. **Competição saudável** - Todos começam do zero, nivelando o campo
3. **Reconhecimento frequente** - Medalhas podem ser reconquistadas
4. **Histórico valioso** - Performance pode ser comparada ao longo do tempo

---

## 2. MUDANÇA DE ARQUITETURA

### ⚠️ IMPORTANTE: Compatibilidade Retroativa

O sistema **NÃO QUEBRA** a funcionalidade atual. As tabelas antigas continuam existindo:

| Tabela Antiga | Status | Nova Tabela |
|---------------|--------|-------------|
| `user_gamification` | ✅ Mantida | `user_season_stats` (por mês) |
| `user_medals` | ✅ Mantida | `user_season_badges` (por mês) |
| `xp_logs` | ✅ Mantida | Adiciona coluna `season_id` |
| `ranks` | ✅ Inalterada | - |
| `medals` | ✅ Inalterada | - |

### Modelo Anterior (Cumulativo)
```
Usuário
  └── total_xp (acumula infinitamente)
  └── badges (acumula infinitamente)
  └── current_rank (baseado em XP total)
```

### Novo Modelo (Mensal + Histórico)
```
Usuário
  └── Temporada Janeiro 2026
  │     ├── monthly_xp
  │     ├── monthly_badges
  │     └── monthly_rank
  │
  └── Temporada Fevereiro 2026
  │     ├── monthly_xp
  │     ├── monthly_badges
  │     └── monthly_rank
  │
  └── Histórico (infinito)
```

---

## 3. REGRAS DE NEGÓCIO

### 3.1 Ciclo Mensal

| Evento | Quando | O que acontece |
|--------|--------|----------------|
| **Início do Mês** | Dia 1, 00:00 | Nova temporada criada, XP zerado |
| **Durante o Mês** | Dias 1-30/31 | XP acumula, medalhas são conquistadas |
| **Fim do Mês** | Último dia, 23:59 | Ranking calculado, temporada arquivada |

### 3.2 Pontos de Vigor (XP)

```yaml
Reset: Todo dia 1 de cada mês
Limite diário: 500 XP (exceto ações especiais)

# ⚠️ IMPORTANTE: Multiplicador é por PLANO, não por patente!
Multiplicador: Aplicado conforme PLANO DE ASSINATURA do usuário
  - Recruta: 1.0x  (plano gratuito)
  - Veterano: 1.5x (plano intermediário)
  - Elite: 3.0x    (plano premium)

# Nota: A patente (rank) é apenas visual, baseada no XP do mês.
# O multiplicador sempre vem do plano de assinatura.

Ações que IGNORAM limite diário:
  - contract_closed
  - service_completed
  - badge_reward
  - challenge_completed
  - admin_grant
```

### 3.3 Medalhas

```yaml
Reset: Todo dia 1 de cada mês
Reconquista: Medalhas podem ser ganhas novamente a cada mês
XP da medalha: Concedido toda vez que a medalha é ganha
```

### 3.4 Patentes (Ranks)

| Patente | XP Mínimo | XP Máximo | Multiplicador |
|---------|-----------|-----------|---------------|
| Recruta | 0 | 199 | 1.00x |
| Especialista | 200 | 499 | 1.00x |
| Veterano | 500 | 999 | 1.00x |
| Comandante | 1000 | 1999 | 1.50x |
| General | 2000 | 3499 | 2.00x |
| Lenda | 3500 | ∞ | 3.00x |

**Nota:** A patente é calculada com base no XP **do mês atual**.

### 3.5 Ranking

```yaml
Cálculo: Ordem decrescente de XP no mês
Atualização: A cada ação que concede XP (real-time)
Arquivamento: Posição final salva ao encerrar o mês
```

---

## 4. COMPATIBILIDADE RETROATIVA

### ⚠️ CRÍTICO: Manter Sistema Atual Funcionando

Para garantir que nada quebre, o script de migração:

1. **NÃO REMOVE** tabelas antigas
2. **NÃO ALTERA** estrutura das tabelas antigas
3. **COPIA** dados para as novas tabelas
4. **ADICIONA** novas funções sem sobrescrever as antigas

### Tabelas que PERMANECEM INALTERADAS

```sql
-- Estas tabelas NÃO são modificadas:
user_gamification  -- Continua funcionando
user_medals        -- Continua funcionando
ranks              -- Continua funcionando
medals             -- Continua funcionando
xp_logs            -- Apenas adiciona coluna season_id (nullable)
```

### Código TypeScript que CONTINUA FUNCIONANDO

```typescript
// Estas funções continuam funcionando:
import { awardPoints } from '@/lib/api/gamification'    // ✅ OK
import { awardBadge } from '@/lib/api/gamification'     // ✅ OK
import { getUserBadges } from '@/lib/api/gamification'  // ✅ OK
```

### Período de Transição

Durante o período de transição, ambos os sistemas coexistem:

1. **Sistema Antigo**: `user_gamification`, `user_medals`
2. **Sistema Novo**: `user_season_stats`, `user_season_badges`

A migração completa será feita gradualmente:
1. Primeiro: Criar novas tabelas e funções
2. Depois: Migrar código TypeScript
3. Por último: Desativar tabelas antigas (opcional)

---

## 5. BANCO DE DADOS

### 5.1 Novas Tabelas

#### `gamification_seasons`

Tabela central que define as temporadas/meses.

```sql
CREATE TABLE public.gamification_seasons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    year integer NOT NULL,                    -- Ano (2026)
    month integer NOT NULL,                   -- Mês (1-12)
    name text NOT NULL,                       -- "Janeiro 2026"
    starts_at timestamptz NOT NULL,           -- Início
    ends_at timestamptz NOT NULL,             -- Fim
    is_active boolean DEFAULT false,          -- Temporada ativa?
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(year, month)
);
```

**Exemplo de dados:**
```sql
| id | year | month | name | is_active |
|----|------|-------|------|-----------|
| uuid-1 | 2026 | 1 | Janeiro 2026 | true |
| uuid-2 | 2026 | 2 | Fevereiro 2026 | false |
```

---

#### `user_season_stats`

Estatísticas de cada usuário por temporada.

```sql
CREATE TABLE public.user_season_stats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    season_id uuid REFERENCES gamification_seasons(id),
    
    total_xp integer DEFAULT 0,               -- XP do mês
    rank_id text REFERENCES ranks(id),        -- Patente do mês
    
    daily_xp_count integer DEFAULT 0,         -- XP ganho hoje
    last_xp_date date DEFAULT current_date,   -- Último dia de XP
    
    ranking_position integer,                 -- Posição final no ranking
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id, season_id)
);
```

---

#### `user_season_badges`

Medalhas conquistadas por temporada.

```sql
CREATE TABLE public.user_season_badges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    season_id uuid REFERENCES gamification_seasons(id),
    badge_id text NOT NULL,                   -- ID da medalha
    earned_at timestamptz DEFAULT now(),
    
    UNIQUE(user_id, season_id, badge_id)
);
```

---

### 5.2 Alteração em Tabela Existente

#### `xp_logs` (apenas adiciona coluna)

```sql
ALTER TABLE public.xp_logs 
ADD COLUMN season_id uuid REFERENCES gamification_seasons(id);
-- Nota: Coluna é NULLABLE para compatibilidade
```

---

### 5.3 Índices

```sql
CREATE INDEX idx_user_season_stats_user ON user_season_stats(user_id);
CREATE INDEX idx_user_season_stats_season ON user_season_stats(season_id);
CREATE INDEX idx_user_season_stats_xp ON user_season_stats(total_xp DESC);
CREATE INDEX idx_user_season_badges_user ON user_season_badges(user_id);
CREATE INDEX idx_user_season_badges_season ON user_season_badges(season_id);
CREATE INDEX idx_xp_logs_season ON xp_logs(season_id);
```

---

## 6. FUNÇÕES SQL

### 6.1 `get_active_season()`

Retorna o ID da temporada ativa. Cria uma nova se não existir.

```sql
SELECT get_active_season(); 
-- Retorna: uuid da temporada atual
```

---

### 6.2 `add_season_xp()` (Nova - não substitui add_user_xp)

Concede XP ao usuário na temporada atual. A função antiga `add_user_xp` continua funcionando.

```sql
SELECT add_season_xp(
    p_user_id := 'uuid-do-usuario',
    p_base_amount := 50,
    p_action_type := 'portfolio_upload',
    p_description := 'Upload de imagem',
    p_metadata := '{"filename": "foto.jpg"}'::jsonb
);
-- Retorna: integer (XP efetivamente concedido)
```

---

### 6.3 `award_season_badge()`

Concede medalha na temporada atual.

```sql
SELECT award_season_badge(
    p_user_id := 'uuid-do-usuario',
    p_badge_id := 'primeiro_sangue'
);
-- Retorna: boolean (true se concedeu, false se já tinha)
```

---

### 6.4 `start_new_season()`

Inicia uma nova temporada (para CRON).

```sql
SELECT start_new_season();
-- Retorna: uuid da nova temporada
```

**O que faz:**
1. Calcula ranking final da temporada anterior
2. Desativa temporada anterior
3. Cria nova temporada para o mês atual
4. Inicializa stats zerados para todos os usuários

---

### 6.5 `get_user_season_history()`

Busca histórico de temporadas do usuário.

```sql
SELECT * FROM get_user_season_history(
    p_user_id := 'uuid-do-usuario',
    p_limit := 12
);
```

**Retorna:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| season_id | uuid | ID da temporada |
| season_name | text | "Janeiro 2026" |
| season_year | integer | 2026 |
| season_month | integer | 1 |
| total_xp | integer | XP do mês |
| rank_id | text | "general" |
| rank_name | text | "General" |
| badges_count | bigint | 7 |
| ranking_position | integer | 3 |
| is_active | boolean | false |

---

### 6.6 `get_current_season_stats()`

Busca stats da temporada atual para o perfil.

```sql
SELECT * FROM get_current_season_stats(
    p_user_id := 'uuid-do-usuario'
);
```

---

### 6.7 `get_current_season_badges()`

Busca todas as medalhas com status de conquista.

```sql
SELECT * FROM get_current_season_badges(
    p_user_id := 'uuid-do-usuario'
);
```

---

## 7. API TYPESCRIPT

### 7.1 Novas Funções a Criar

```typescript
// lib/api/gamification-monthly.ts

import { createClient } from '@/lib/supabase/client'

/**
 * Concede XP ao usuário na temporada atual
 * NOTA: Usar esta função para o novo sistema mensal
 */
export async function addSeasonXp(
    userId: string,
    baseAmount: number,
    actionType: string,
    description?: string,
    metadata?: Record<string, any>
) {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('add_season_xp', {
        p_user_id: userId,
        p_base_amount: baseAmount,
        p_action_type: actionType,
        p_description: description || null,
        p_metadata: metadata || {}
    })
    return { success: !error, xpAwarded: data || 0, error: error?.message }
}

export async function getCurrentSeasonStats(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .rpc('get_current_season_stats', { p_user_id: userId })
    return data?.[0] || null
}

export async function getSeasonHistory(userId: string, limit = 12) {
    const supabase = createClient()
    const { data, error } = await supabase
        .rpc('get_user_season_history', { 
            p_user_id: userId, 
            p_limit: limit 
        })
    return data || []
}

export async function getCurrentSeasonBadges(userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .rpc('get_current_season_badges', { p_user_id: userId })
    return data || []
}

export async function awardSeasonBadge(userId: string, badgeId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .rpc('award_season_badge', { 
            p_user_id: userId, 
            p_badge_id: badgeId 
        })
    return { success: data === true, alreadyOwned: data === false }
}
```

### 7.2 Funções Existentes (Mantidas)

```typescript
// lib/api/gamification.ts - CONTINUA FUNCIONANDO
export async function awardPoints(...)  // ✅ MANTIDA
export async function awardBadge(...)   // ✅ MANTIDA
export async function getUserBadges(...) // ✅ MANTIDA
```

---

## 8. ADMIN PANEL

### 8.1 Novas Funcionalidades Necessárias

O painel admin deve permitir:

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| **Ver Temporadas** | Lista de todas as temporadas | Alta |
| **Temporada Ativa** | Ver/editar temporada atual | Alta |
| **Ranking do Mês** | Ranking de usuários por XP | Alta |
| **Histórico por Usuário** | Ver desempenho mensal | Média |
| **Forçar Nova Temporada** | Iniciar temporada manualmente | Baixa |
| **Editar XP** | Ajustar XP de usuário (admin) | Média |

### 8.2 Página Sugerida: `/admin/game/seasons`

```
┌─────────────────────────────────────────────────────┐
│  🗓️ TEMPORADAS DE GAMIFICAÇÃO                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [+ Nova Temporada]                                 │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  ⭐ Janeiro 2026 (ATIVA)                    │   │
│  │  ────────────────────────────────────       │   │
│  │  👥 42 participantes                        │   │
│  │  ⚡ 23.450 XP total                         │   │
│  │  🏅 156 medalhas conquistadas               │   │
│  │                                              │   │
│  │  [Ver Ranking] [Ver Medalhas] [Encerrar]    │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  📜 Dezembro 2025                            │   │
│  │  ────────────────────────────────────       │   │
│  │  👥 38 participantes                        │   │
│  │  ⚡ 31.200 XP total                         │   │
│  │  🏆 #1: Erick Cabral (3.850 XP)            │   │
│  │                                              │   │
│  │  [Ver Detalhes]                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 8.3 Queries para Admin

```sql
-- Estatísticas da temporada atual
SELECT 
    gs.name as temporada,
    COUNT(DISTINCT uss.user_id) as participantes,
    SUM(uss.total_xp) as xp_total,
    (SELECT COUNT(*) FROM user_season_badges WHERE season_id = gs.id) as medalhas
FROM gamification_seasons gs
LEFT JOIN user_season_stats uss ON uss.season_id = gs.id
WHERE gs.is_active = true
GROUP BY gs.id, gs.name;

-- Top 10 do mês
SELECT * FROM v_current_season_ranking LIMIT 10;

-- Histórico de temporadas
SELECT 
    name, year, month, is_active,
    (SELECT COUNT(*) FROM user_season_stats WHERE season_id = gs.id) as usuarios
FROM gamification_seasons gs
ORDER BY year DESC, month DESC;
```

---

## 9. CRON/AUTOMAÇÃO

### 9.1 Job de Reset Mensal

**Frequência:** Todo dia 1 às 00:00 (UTC-3)
**Cron Expression:** `0 3 1 * *` (3:00 UTC = 00:00 BRT)

### 9.2 Supabase Edge Function

Criar arquivo: `supabase/functions/reset-gamification/index.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const { data, error } = await supabase.rpc('start_new_season')
    
    if (error) {
        console.error('Erro ao iniciar nova temporada:', error)
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message 
        }), { status: 500 })
    }
    
    console.log('Nova temporada iniciada:', data)
    return new Response(JSON.stringify({ 
        success: true, 
        season_id: data 
    }))
})
```

### 9.3 Configuração no Supabase

1. Acessar Supabase Dashboard
2. Ir para **Database > Extensions**
3. Habilitar `pg_cron`
4. Criar job:

```sql
SELECT cron.schedule(
    'reset-gamification-monthly',
    '0 3 1 * *',  -- Todo dia 1 às 3:00 UTC
    $$SELECT start_new_season()$$
);
```

---

## 10. GUIA DE MIGRAÇÃO

### Passo 1: Backup

```bash
# Fazer backup do banco antes de qualquer alteração
pg_dump -h seu-host.supabase.co -U postgres -d postgres > backup_pre_migration.sql
```

### Passo 2: Executar Script SQL

1. Abrir Supabase Dashboard
2. Ir para SQL Editor
3. Colar conteúdo de `20260118_gamification_monthly_system.sql`
4. Clicar **Run**

### Passo 3: Verificar Migração

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('gamification_seasons', 'user_season_stats', 'user_season_badges');

-- Verificar temporada ativa
SELECT * FROM gamification_seasons WHERE is_active = true;

-- Verificar dados migrados
SELECT COUNT(*) as stats_migrados FROM user_season_stats;
SELECT COUNT(*) as badges_migrados FROM user_season_badges;
```

### Passo 4: Testar Funções

```sql
-- Testar get_active_season
SELECT get_active_season();

-- Testar get_current_season_stats
SELECT * FROM get_current_season_stats('uuid-de-um-usuario');

-- Testar award_season_badge (use um usuário de teste)
SELECT award_season_badge('uuid-teste', 'alistamento_concluido');
```

---

## 11. TROUBLESHOOTING

### Problema: Temporada não criada automaticamente

**Causa:** CRON não configurado ou Edge Function com erro

**Solução:**
```sql
-- Criar manualmente
SELECT start_new_season();
```

### Problema: XP não sendo contabilizado

**Causa:** Função `add_season_xp` não encontrando temporada ativa

**Solução:**
```sql
-- Verificar se há temporada ativa
SELECT * FROM gamification_seasons WHERE is_active = true;

-- Se não houver, criar
SELECT start_new_season();
```

### Problema: Usuário sem stats

**Causa:** Usuário novo sem registro na temporada

**Solução:**
```sql
-- A função get_current_season_stats cria automaticamente
SELECT * FROM get_current_season_stats('uuid-do-usuario');
```

---

## 12. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Banco de Dados ✅
- [x] Documentação criada
- [ ] Script SQL executado no Supabase
- [ ] Tabelas verificadas
- [ ] Dados migrados

### Fase 2: API TypeScript
- [ ] Criar `lib/api/gamification-monthly.ts`
- [ ] Adicionar funções de season
- [ ] Testar integração

### Fase 3: Frontend
- [ ] Atualizar `GamificationCard` para usar season
- [ ] Atualizar `MedalsGrid` para usar season
- [ ] Criar componente `SeasonHistory`
- [ ] Adicionar indicador de "Mês Atual"

### Fase 4: Admin Panel
- [ ] Criar página `/admin/game/seasons`
- [ ] Adicionar ranking mensal
- [ ] Adicionar histórico de temporadas

### Fase 5: Automação
- [ ] Criar Edge Function
- [ ] Configurar CRON
- [ ] Testar transição de mês

---

## 📞 CONTATO

Para dúvidas sobre este sistema:
- **Desenvolvedor:** Igor
- **AI Assistant:** Claude (Anthropic)
- **Data:** Janeiro 2026

---

*Documento criado em 18/01/2026*  
*Última atualização: 18/01/2026*
