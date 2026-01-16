# 📚 Documentação Técnica - Sistema de Gamificação
**Rota Business Club**  
**Versão:** 1.0.0  
**Data:** 16 de Janeiro de 2026  
**Status:** Produção

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Banco de Dados](#banco-de-dados)
4. [API Layer](#api-layer)
5. [Integrações](#integrações)
6. [Testes](#testes)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Sistema de Gamificação da Rota Business Club é responsável por recompensar usuários com pontos (XP) e medalhas (badges) ao completarem ações na plataforma.

### Características Principais

- ✅ **Distribuição Automática de Pontos** - Sistema gerencia automaticamente concessão de XP
- ✅ **Sistema de Medalhas** - 12 badges com critérios específicos
- ✅ **Progressão de Ranks** - 6 níveis com multiplicadores crescentes
- ✅ **Limites Diários** - Proteção contra farming de pontos (500 XP/dia)
- ✅ **Multiplicadores por Rank** - XP aumenta conforme rank do usuário
- ✅ **Logs Completos** - Auditoria de todas as transações de XP
- ✅ **Real-time** - Atualizações instantâneas via Supabase

### Tecnologias Utilizadas

```yaml
Backend:
  - Supabase (PostgreSQL 15+)
  - PostgreSQL Functions (PL/pgSQL)
  - Row Level Security (RLS)

Frontend:
  - Next.js 14
  - TypeScript 5
  - React 18
  
APIs:
  - Supabase Client
  - Custom Service Layer (lib/api/gamification.ts)
```

---

## 🏗️ Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                 │
│                                                      │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────┐ │
│  │  Components  │  │  Admin Panel  │  │  Pages   │ │
│  │  - Upload    │  │  - Game Stats │  │  - Perfil│ │
│  │  - Profile   │  │  - Badges     │  │  - Rota  │ │
│  └──────┬───────┘  └───────┬───────┘  └────┬─────┘ │
│         │                  │                │       │
│         └──────────────────┼────────────────┘       │
│                            │                        │
└────────────────────────────┼────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────┐
│              SERVICE LAYER (TypeScript)              │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  lib/api/gamification.ts                    │   │
│  │  - awardPoints()                            │   │
│  │  - awardBadge()                             │   │
│  │  - getUserGamificationStats()               │   │
│  │  - getUserBadges()                          │   │
│  │  - getUserRecentActions()                   │   │
│  └─────────────────┬───────────────────────────┘   │
│                    │                                │
└────────────────────┼────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│           DATABASE LAYER (Supabase/PostgreSQL)       │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Tables:                                     │  │
│  │  - ranks                 (6 registros)       │  │
│  │  - badges                (12 registros)      │  │
│  │  - gamification_stats    (stats por user)    │  │
│  │  - xp_logs              (audit log)          │  │
│  │  - user_badges          (badges conquistadas)│  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Functions (PL/pgSQL):                       │  │
│  │  - add_user_xp()        (concede XP)         │  │
│  │  - award_badge()        (concede badge)      │  │
│  │  - check_rank_up()      (atualiza rank)      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  RLS Policies:                               │  │
│  │  - Usuários veem apenas próprios dados       │  │
│  │  - Ranks e badges públicos                   │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Fluxo de Distribuição de Pontos

```
1. Usuário completa ação (ex: upload de imagem)
   │
   ▼
2. Componente chama função do service layer
   │  uploadPortfolioImage(userId, file)
   ▼
3. Service layer executa lógica de negócio
   │  - Verifica se primeira vez
   │  - Chama awardBadge() ou awardPoints()
   ▼
4. API chama função RPC do Supabase
   │  supabase.rpc('add_user_xp', params)
   ▼
5. Função SQL processa
   │  - Aplica multiplicador de rank
   │  - Verifica limite diário
   │  - Atualiza gamification_stats
   │  - Registra em xp_logs
   │  - Chama check_rank_up()
   ▼
6. Retorna resultado
   │  { success: true, xpAwarded: 30 }
   ▼
7. Frontend atualiza (opcional)
   │  - Mostra notificação
   │  - Atualiza UI
```

---

## 💾 Banco de Dados

### Schema Completo

#### 1. Tabela: `ranks`

Define os níveis de progressão dos usuários.

```sql
CREATE TABLE public.ranks (
    id text PRIMARY KEY,
    name text NOT NULL,
    min_xp integer NOT NULL,
    max_xp integer,
    multiplier numeric(3,2) DEFAULT 1.00,
    display_order integer NOT NULL
);
```

**Dados:**

| id | name | min_xp | max_xp | multiplier | display_order |
|----|------|--------|--------|------------|---------------|
| recruta | Recruta | 0 | 199 | 1.00 | 1 |
| especialista | Especialista | 200 | 499 | 1.00 | 2 |
| veterano | Veterano | 500 | 999 | 1.00 | 3 |
| comandante | Comandante | 1000 | 1999 | 1.50 | 4 |
| general | General | 2000 | 3499 | 2.00 | 5 |
| lenda | Lenda | 3500 | ∞ | 3.00 | 6 |

**Índices:**
- PRIMARY KEY em `id`

**RLS:**
- Leitura pública habilitada

---

#### 2. Tabela: `badges`

Define as medalhas disponíveis no sistema.

```sql
CREATE TABLE public.badges (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    xp_reward integer NOT NULL,
    criteria_type text NOT NULL,
    benefit_description text,
    icon_key text,
    is_active boolean DEFAULT true
);
```

**Campos:**
- `id` - Identificador único da badge
- `name` - Nome exibido
- `description` - Descrição do critério
- `xp_reward` - XP concedido ao ganhar a badge
- `criteria_type` - Tipo de critério (para tracking)
- `benefit_description` - Benefício ao conquistar
- `icon_key` - Chave do ícone (Lucide React)
- `is_active` - Se badge está ativa

**Badges Disponíveis:** Ver seção "Sistema de Medalhas" abaixo

**Índices:**
- PRIMARY KEY em `id`

**RLS:**
- Leitura pública (apenas badges ativas)

---

#### 3. Tabela: `gamification_stats`

Armazena estatísticas de gamificação por usuário.

```sql
CREATE TABLE public.gamification_stats (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    total_xp integer DEFAULT 0 NOT NULL,
    current_rank_id text REFERENCES public.ranks(id) DEFAULT 'recruta',
    season_xp integer DEFAULT 0 NOT NULL,
    daily_xp_count integer DEFAULT 0 NOT NULL,
    last_xp_date date DEFAULT current_date,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

**Campos:**
- `user_id` - FK para profiles
- `total_xp` - XP total acumulado (histórico)
- `current_rank_id` - Rank atual do usuário
- `season_xp` - XP da temporada atual (resetável)
- `daily_xp_count` - XP ganho hoje (para limite)
- `last_xp_date` - Data do último XP (para reset diário)
- `updated_at` - Timestamp da última atualização

**Índices:**
- `idx_gamification_stats_user` em `user_id`

**RLS:**
- Usuário vê apenas próprios dados

---

#### 4. Tabela: `xp_logs`

Log de auditoria de todas as transações de XP.

```sql
CREATE TABLE public.xp_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL,
    base_amount integer NOT NULL,
    action_type text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
```

**Campos:**
- `id` - UUID único do log
- `user_id` - FK para profiles
- `amount` - XP concedido (após multiplicadores)
- `base_amount` - XP base (antes de multiplicadores)
- `action_type` - Tipo de ação (ex: 'portfolio_upload')
- `description` - Descrição textual
- `metadata` - JSON com dados extras
- `created_at` - Timestamp da concessão

**Índices:**
- `idx_xp_logs_user` em `user_id`
- `idx_xp_logs_created` em `created_at DESC`

**RLS:**
- Usuário vê apenas próprios logs

---

#### 5. Tabela: `user_badges`

Relação N:N entre usuários e badges conquistadas.

```sql
CREATE TABLE public.user_badges (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id text REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);
```

**Campos:**
- `user_id` - FK para profiles
- `badge_id` - FK para badges
- `earned_at` - Timestamp da conquista

**Índices:**
- `idx_user_badges_user` em `user_id`
- PRIMARY KEY composta `(user_id, badge_id)`

**RLS:**
- Usuário vê apenas próprias badges

---

### Funções SQL

#### 1. `add_user_xp()`

Concede XP ao usuário com toda a lógica de multiplicadores e limites.

```sql
CREATE OR REPLACE FUNCTION public.add_user_xp(
    p_user_id uuid,
    p_base_amount integer,
    p_action_type text,
    p_description text DEFAULT null,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
```

**Lógica:**
1. Inicializa stats se não existir
2. Reseta contador diário se mudou o dia
3. Busca multiplicador do rank atual
4. Calcula XP final: `floor(base_amount * multiplier)`
5. Aplica limite diário (500 XP para ações repetíveis)
6. Atualiza `gamification_stats`
7. Registra em `xp_logs`
8. Chama `check_rank_up()`
9. Retorna XP concedido

**Parâmetros:**
- `p_user_id` - UUID do usuário
- `p_base_amount` - XP base (antes de multiplicadores)
- `p_action_type` - Tipo da ação
- `p_description` - Descrição opcional
- `p_metadata` - JSON com dados extras

**Retorno:**
- `integer` - XP efetivamente concedido

**Exceções do Limite Diário:**
Ações que NÃO contam para o limite:
- `contract_closed`
- `service_completed`
- `badge_reward`
- `challenge_completed`

---

#### 2. `award_badge()`

Concede uma badge ao usuário.

```sql
CREATE OR REPLACE FUNCTION public.award_badge(
    p_user_id uuid,
    p_badge_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
```

**Lógica:**
1. Verifica se usuário já tem a badge (retorna `false` se sim)
2. Busca dados da badge (XP reward, nome)
3. Insere em `user_badges`
4. Concede XP da badge via `add_user_xp()`
5. Retorna `true` se sucesso

**Parâmetros:**
- `p_user_id` - UUID do usuário
- `p_badge_id` - ID da badge

**Retorno:**
- `boolean` - `true` se badge foi concedida, `false` se já tinha

---

#### 3. `check_rank_up()`

Verifica e atualiza o rank do usuário baseado no XP total.

```sql
CREATE OR REPLACE FUNCTION public.check_rank_up(
    p_user_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
```

**Lógica:**
1. Busca XP total e rank atual do usuário
2. Determina novo rank baseado em `min_xp`
3. Se mudou, atualiza `gamification_stats`
4. Retorna ID do rank atual

**Parâmetros:**
- `p_user_id` - UUID do usuário

**Retorno:**
- `text` - ID do rank (atual ou novo)

---

## 🔌 API Layer

### Service Layer: `lib/api/gamification.ts`

Camada de abstração entre frontend e Supabase.

#### Função: `awardPoints()`

Concede pontos a um usuário.

```typescript
async function awardPoints(
    userId: string,
    baseAmount: number,
    actionType: string,
    description?: string,
    metadata?: Record<string, any>
): Promise<{
    success: boolean;
    xpAwarded: number;
    error?: string;
}>
```

**Uso:**
```typescript
import { awardPoints } from '@/lib/api/gamification'

const result = await awardPoints(
    userId,
    30,
    'portfolio_upload',
    'Upload de imagem de portfolio'
)

if (result.success) {
    console.log(`Usuário ganhou ${result.xpAwarded} XP`)
}
```

---

#### Função: `awardBadge()`

Concede uma badge a um usuário.

```typescript
async function awardBadge(
    userId: string,
    badgeId: string
): Promise<{
    success: boolean;
    alreadyHad: boolean;
    error?: string;
}>
```

**Uso:**
```typescript
import { awardBadge } from '@/lib/api/gamification'

const result = await awardBadge(userId, 'primeiro_sangue')

if (result.success && !result.alreadyHad) {
    showNotification('Nova medalha conquistada!')
}
```

---

#### Função: `getUserGamificationStats()`

Busca estatísticas de gamificação de um usuário.

```typescript
async function getUserGamificationStats(
    userId: string
): Promise<{
    totalXp: number;
    currentRank: {
        id: string;
        name: string;
        multiplier: number;
    };
    seasonXp: number;
    dailyXpCount: number;
    badgesCount: number;
} | null>
```

**Uso:**
```typescript
const stats = await getUserGamificationStats(userId)

if (stats) {
    console.log(`Rank: ${stats.currentRank.name}`)
    console.log(`XP Total: ${stats.totalXp}`)
    console.log(`Badges: ${stats.badgesCount}`)
}
```

---

#### Função: `getUserBadges()`

Lista todas as badges conquistadas por um usuário.

```typescript
async function getUserBadges(
    userId: string
): Promise<Array<{
    badge_id: string;
    earned_at: string;
    badge: {
        name: string;
        description: string;
        xp_reward: number;
        icon_key: string;
    };
}>>
```

---

#### Função: `getUserRecentActions()`

Busca ações recentes do usuário (XP logs).

```typescript
async function getUserRecentActions(
    userId: string,
    limit: number = 10
): Promise<Array<{
    id: string;
    amount: number;
    action_type: string;
    description: string;
    created_at: string;
}>>
```

---

## 🎮 Sistema de Medalhas

### Todas as 12 Badges

| Badge | XP | Critério | Benefício |
|-------|-----|----------|-----------|
| **Sentinela de Elite** | 500 | Manter Plano Elite por 3 meses | Convite ao grupo de líderes |
| **Veterano de Guerra** | 300 | Completar 20 serviços | Acesso ao fórum exclusivo |
| **Sentinela Inabalável** | 200 | Ativo por 30 dias consecutivos | Selo "Membro Resiliente" |
| **Inabalável** | 150 | Média 5★ após 5 trabalhos | Selo "Padrão Ouro" |
| **Recrutador** | 150 | Indicar 3 novos membros | Desconto de 10% na mensalidade |
| **Alistamento Concluído** | 100 | Completar 100% do perfil | Desbloqueia aparição em buscas |
| **Missão Cumprida** | 100 | Marcar 1º serviço como concluído | Boost de prioridade por 48h |
| **Batismo de Excelência** | 80 | Primeira avaliação 5 estrelas | Tag "Altamente Recomendado" por 7 dias |
| **Irmandade** | 75 | Contratar outro membro do Club | Badge "Membro da Confraria" |
| **Pronto para a Missão** | 50 | Responder 5 demandas em <2h | Tag "Resposta Rápida" por 7 dias |
| **Primeiro Sangue** | 50 | Primeira venda/contrato fechado | Selo "Profissional Ativo" |
| **Cinegrafista de Campo** | 30 | Primeiro upload de relatório/foto | Desbloqueia aba "Portfólio" |

### IDs das Badges (para código)

```typescript
const BADGE_IDS = {
    PROFILE_COMPLETE: 'alistamento_concluido',
    FIRST_CONTRACT: 'primeiro_sangue',
    FIRST_FIVE_STAR: 'batismo_excelencia',
    FIRST_PORTFOLIO: 'cinegrafista_campo',
    FIRST_SERVICE: 'missao_cumprida',
    FIVE_STAR_AVERAGE: 'inabalavel',
    PEER_HIRE: 'irmandade',
    FAST_RESPONSE: 'pronto_missao',
    REFERRALS: 'recrutador',
    SERVICES_20: 'veterano_guerra',
    PREMIUM_3_MONTHS: 'sentinela_elite',
    RETENTION_30_DAYS: 'sentinela_inabalavel'
}
```

---

## 🔗 Integrações

### 1. Portfolio Upload (ATIVO)

**Arquivo:** `lib/supabase/storage.ts`  
**Linha:** 115-132

```typescript
// Após upload bem-sucedido
const userBadges = await getUserBadges(userId)
const hasPortfolioBadge = userBadges.some(b => 
    b.badge_id === 'cinegrafista_campo'
)

if (!hasPortfolioBadge) {
    // Primeira vez
    await awardBadge(userId, 'cinegrafista_campo')
} else {
    // Uploads seguintes
    await awardPoints(userId, 30, 'portfolio_upload', 
        'Portfolio image uploaded')
}
```

**Resultado:**
- 1º upload: Badge + 30 XP
- Uploads seguintes: 30 XP (limite diário aplicado)

---

### 2. Profile Completion (PREPARADO)

**Arquivo:** `lib/api/profile.ts`

```typescript
export async function checkProfileCompletion(
    userId: string
): Promise<boolean> {
    // Verifica campos obrigatórios
    const requiredFields = [
        'full_name', 'email', 'bio',
        'avatar_url', 'location', 'phone'
    ]
    
    const isComplete = requiredFields.every(field => 
        profile[field] !== null && profile[field] !== ''
    )
    
    if (isComplete) {
        await awardBadge(userId, 'alistamento_concluido')
    }
}
```

**Status:** Função criada, precisa ser chamada no formulário de perfil

---

### Como Adicionar Nova Integração

**Template:**

```typescript
// 1. Importar funções
import { awardPoints, awardBadge, getUserBadges } from '@/lib/api/gamification'

// 2. Após ação bem-sucedida
async function handleAction(userId: string) {
    try {
        // Lógica da ação aqui...
        
        // Conceder pontos
        const result = await awardPoints(
            userId,
            50, // XP base
            'action_type',
            'Descrição da ação'
        )
        
        // Ou conceder badge
        if (condicao) {
            await awardBadge(userId, 'badge_id')
        }
        
        // Opcional: mostrar notificação
        if (result.success) {
            showToast(`+${result.xpAwarded} XP`)
        }
    } catch (error) {
        // Não falhar a ação se gamificação der erro
        console.error('Gamification error:', error)
    }
}
```

---

## 📱 Admin Panel

### Página: `app/admin/game/page.tsx`

Interface administrativa para visualizar estatísticas do sistema.

**Funcionalidades:**
- 📊 Dashboard com 4 cards de estatísticas
- 🏆 Aba Medalhas (grid com 12 badges)
- ⚡ Aba Ações de Pontos (tabela de ações)
- 👥 Aba Ranking (top usuários por XP)
- 🔄 Botão "Carregar Dados Reais" (toggle mock/real)

**Acesso:** http://localhost:3000/admin/game

**Requisitos:** Usuário admin autenticado

---

## 🧪 Testes

### Testes Criados

1. **`TEST_GAMIFICATION_COMPLETE.sql`**
   - Valida tabelas, dados, funções
   - Simula concessão de XP e badges
   - Testa limites e multiplicadores

2. **`teste_funcoes.sql`**
   - Verifica se funções SQL existem

3. **`teste_contagem.sql`**
   - Conta registros nas tabelas

4. **`test-gamification-integration.js`**
   - Valida lógica do código TypeScript

### Como Executar Testes

```bash
# Testes SQL (no Supabase SQL Editor)
1. Abra arquivo SQL
2. Cole no editor
3. Clique "Run"

# Testes JS (local)
node test-gamification-integration.js
```

### Validação Manual

```sql
-- Ver stats de um usuário
SELECT * FROM gamification_stats WHERE user_id = 'USER_ID';

-- Ver badges de um usuário
SELECT ub.*, b.name
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
WHERE ub.user_id = 'USER_ID';

-- Ver logs de XP
SELECT * FROM xp_logs 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🚀 Deployment

### Pré-requisitos

- Projeto Supabase ativo
- Next.js 14+ configurado
- Variáveis de ambiente configuradas

### Processo de Deploy

#### 1. Deploy do Schema SQL

```bash
# No Supabase SQL Editor
1. Abra deploy_gamification_SIMPLE.sql
2. Execute todo o arquivo
3. Verifique mensagens de sucesso
```

#### 2. Configurar Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

#### 3. Deploy do Frontend

```bash
npm run build
npm run start
# ou deploy no Vercel/similar
```

#### 4. Validação Pós-Deploy

```bash
# Executar testes
1. teste_funcoes.sql (verifica funções)
2. teste_contagem.sql (verifica dados)
3. Fazer upload teste na aplicação
4. Verificar XP no banco
```

---

## 🔧 Troubleshooting

### Problema: Funções SQL não encontradas

**Sintoma:** Erro 404 ao chamar RPC

**Solução:**
```sql
-- Verificar se funções existem
SELECT proname FROM pg_proc 
WHERE proname IN ('add_user_xp', 'award_badge', 'check_rank_up');

-- Se vazio, executar deploy_gamification_SIMPLE.sql
```

---

### Problema: Pontos não sendo concedidos

**Verificar:**
1. Limite diário atingido?
```sql
SELECT daily_xp_count, last_xp_date 
FROM gamification_stats 
WHERE user_id = 'USER_ID';
```

2. Função sendo chamada?
```typescript
// Adicionar log
console.log('Awarding points...', { userId, amount })
const result = await awardPoints(...)
console.log('Result:', result)
```

3. Erros no console do navegador?

---

### Problema: Badge concedida mais de uma vez

**Causa:** Provável problema de concorrência

**Solução:** A função `award_badge()` já tem proteção:
```sql
-- Verifica antes de inserir
IF EXISTS (SELECT 1 FROM user_badges 
           WHERE user_id = p_user_id AND badge_id = p_badge_id) THEN
    RETURN false;
END IF;
```

---

### Problema: Multiplicador não aplicado

**Verificar:**
```sql
-- Ver rank atual e multiplicador
SELECT gs.user_id, gs.total_xp, gs.current_rank_id, 
       r.name, r.multiplier
FROM gamification_stats gs
JOIN ranks r ON r.id = gs.current_rank_id
WHERE gs.user_id = 'USER_ID';
```

**Testar manualmente:**
```sql
-- Adicionar XP teste
SELECT add_user_xp(
    'USER_ID'::uuid,
    100,
    'manual_test',
    'Teste de multiplicador'
);

-- Verificar XP logs
SELECT amount, base_amount, amount::float / base_amount as multiplicador_aplicado
FROM xp_logs
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 📊 Métricas e Monitoramento

### Queries Úteis

**Top 10 Usuários por XP:**
```sql
SELECT 
    p.full_name,
    gs.total_xp,
    r.name as rank,
    (SELECT COUNT(*) FROM user_badges WHERE user_id = gs.user_id) as badges_count
FROM gamification_stats gs
JOIN profiles p ON p.id = gs.user_id
JOIN ranks r ON r.id = gs.current_rank_id
ORDER BY gs.total_xp DESC
LIMIT 10;
```

**Distribuição de Usuários por Rank:**
```sql
SELECT 
    r.name as rank,
    COUNT(*) as users_count,
    ROUND(AVG(gs.total_xp), 0) as avg_xp
FROM gamification_stats gs
JOIN ranks r ON r.id = gs.current_rank_id
GROUP BY r.name, r.display_order
ORDER BY r.display_order;
```

**Badges Mais Conquistadas:**
```sql
SELECT 
    b.name,
    COUNT(*) as users_earned,
    b.xp_reward
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
GROUP BY b.id, b.name, b.xp_reward
ORDER BY users_earned DESC;
```

**XP Distribuído nos Últimos 7 Dias:**
```sql
SELECT 
    DATE(created_at) as dia,
    SUM(amount) as xp_total,
    COUNT(DISTINCT user_id) as usuarios_ativos,
    COUNT(*) as transacoes
FROM xp_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY dia DESC;
```

---

## 📚 Referências

### Arquivos do Projeto

```
/home/igor/Vídeos/Legendarios/
├── lib/
│   ├── api/
│   │   ├── gamification.ts          # Service layer principal
│   │   └── profile.ts                # Verificação de perfil
│   ├── supabase/
│   │   └── storage.ts                # Integração portfolio upload
│   └── data/
│       └── mock.ts                   # Dados mock (dev)
├── app/
│   └── admin/
│       └── game/
│           └── page.tsx              # Admin panel
├── deploy_gamification_SIMPLE.sql    # Deploy completo
├── TEST_GAMIFICATION_COMPLETE.sql    # Testes completos
├── teste_funcoes.sql                 # Teste funções
├── teste_contagem.sql                # Teste contagem
└── test-gamification-integration.js  # Teste integração
```

### Links Úteis

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [Lucide Icons](https://lucide.dev/)

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar seção Troubleshooting deste documento
2. Consultar logs do Supabase
3. Consultar console do navegador
4. Executar testes de validação

---

**Documentação gerada em:** 16/01/2026  
**Versão:** 1.0.0  
**Status:** Produção ✅
