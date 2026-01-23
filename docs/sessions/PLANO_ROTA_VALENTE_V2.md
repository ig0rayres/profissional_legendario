# 🎯 PLANO DE IMPLEMENTAÇÃO - ROTA DO VALENTE v2.0

*Data: 23/01/2026 | Autor: Time de Arquitetura*

---

## 📋 ESCOPO

### Objetivo
Refazer completamente o módulo de gamificação com:
- Separação clara: **PROEZAS** (mensais) vs **MEDALHAS** (permanentes)
- Tudo centralizado no admin
- Zero hardcode
- Multiplicador funcionando corretamente

### Entregas
1. ✅ Novo schema de banco
2. ✅ Painel admin "Rota do Valente" 
3. ✅ Função centralizada de pontuação
4. ✅ Refatoração de todos os componentes
5. ✅ Testes

---

## 🗓️ FASES DE IMPLEMENTAÇÃO

### FASE 1: BANCO DE DADOS (30 min)
**Responsável: Rafael (DBA)**

#### 1.1 Criar novas tabelas
```sql
-- Tabela de PROEZAS (mensais)
CREATE TABLE proezas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_base INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    criteria_type TEXT, -- 'count', 'first', 'streak', etc
    criteria_value INTEGER DEFAULT 1,
    icon TEXT DEFAULT '🔥',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proezas conquistadas pelo usuário (resetam mensal)
CREATE TABLE user_proezas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    proeza_id TEXT NOT NULL REFERENCES proezas(id),
    season_month TEXT NOT NULL, -- '2026-01'
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    points_earned INTEGER NOT NULL,
    UNIQUE(user_id, proeza_id, season_month)
);

-- Tabela de AÇÕES (pontos diretos)
CREATE TABLE point_actions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_base INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    max_per_day INTEGER DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_proezas_user ON user_proezas(user_id);
CREATE INDEX idx_user_proezas_month ON user_proezas(season_month);
CREATE INDEX idx_proezas_category ON proezas(category);
CREATE INDEX idx_point_actions_category ON point_actions(category);
```

#### 1.2 Atualizar tabela medals (só ad aeternum)
```sql
-- Manter apenas medalhas permanentes
-- Migrar proezas para nova tabela
ALTER TABLE medals ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT false;
```

#### 1.3 Popular dados
```sql
-- Inserir 27 PROEZAS
-- Inserir 7 MEDALHAS permanentes
-- Inserir AÇÕES de pontos diretos
```

---

### FASE 2: BACKEND (1h)
**Responsável: Carlos (Backend)**

#### 2.1 Criar nova API centralizada
```
/lib/api/rota-valente.ts
```

Funções:
- `awardPoints(userId, actionId)` - Busca do banco, aplica multiplicador
- `awardProeza(userId, proezaId)` - Verifica se já ganhou no mês
- `awardMedal(userId, medalId)` - Verifica se já tem (permanente)
- `getMultiplier(userId)` - Retorna 1, 1.5 ou 3
- `checkProezaCriteria(userId, proezaId)` - Auto-check de critérios
- `getUserSeasonStats(userId)` - Estatísticas do mês
- `resetMonthlyProezas()` - CRON para reset

#### 2.2 Endpoint de API
```
/app/api/rota-valente/award/route.ts
```

#### 2.3 Remover código legado
- Limpar `lib/api/gamification.ts` (manter apenas export para compatibilidade)
- Remover hardcoded de todos os componentes

---

### FASE 3: PAINEL ADMIN (1.5h)
**Responsável: Marina (Frontend)**

#### 3.1 Renomear e reestruturar
```
/app/admin/game → /app/admin/rota-valente
```

#### 3.2 Criar 4 abas:
1. **Patentes** - Gerenciar ranks
2. **Medalhas** - Permanentes (ad aeternum)
3. **Proezas** - Mensais (resetam)
4. **Ações** - Pontos por atividade

#### 3.3 UI de cada aba
- Tabela com CRUD
- Diálogo de edição
- Toggle ativo/inativo
- Preview de ícone

---

### FASE 4: REFATORAÇÃO DE COMPONENTES (1h)
**Responsável: Todos**

#### 4.1 Arquivos a atualizar
```
components/profile/connection-button.tsx
components/notifications/notification-center.tsx
components/chat/chat-widget.tsx
components/ratings/rating-form.tsx
lib/api/confraternity.ts
lib/api/profile.ts
lib/supabase/storage.ts
```

#### 4.2 Padrão de chamada (antes/depois)
```typescript
// ❌ ANTES (hardcoded)
await awardPoints(userId, 10, 'elo_sent', 'Enviou elo')

// ✅ DEPOIS (dinâmico)
await awardPointsForAction(userId, 'elo_sent')
```

---

### FASE 5: MULTIPLICADOR (30 min)
**Responsável: Carlos**

#### 5.1 Função centralizada
```typescript
async function getMultiplier(userId: string): Promise<number> {
    const supabase = createClient()
    
    const { data } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()
    
    const plan = data?.plan_id || 'recruta'
    
    return plan === 'elite' ? 3 : plan === 'veterano' ? 1.5 : 1
}
```

#### 5.2 Aplicar em todas as funções
- `awardPoints()` ✅
- `awardProeza()` ✅
- `awardMedal()` ✅

---

### FASE 6: TESTES (30 min)
**Responsável: Todos**

#### 6.1 Testes manuais
- [ ] Criar proeza no admin
- [ ] Editar pontos de proeza
- [ ] Testar multiplicador Recruta (x1)
- [ ] Testar multiplicador Veterano (x1.5)
- [ ] Testar multiplicador Elite (x3)
- [ ] Verificar proeza não duplica no mês
- [ ] Verificar medalha não duplica nunca
- [ ] Verificar reset mensal

#### 6.2 Casos de teste
```
Usuário Elite completa elo:
- Ação 'elo_sent' = 20 pts base
- Multiplicador = 3
- Total = 60 pts ✅
```

---

## 📁 ESTRUTURA DE ARQUIVOS

### Antes
```
/lib/api/gamification.ts  ← Tudo misturado, hardcoded
/app/admin/game/          ← Nome genérico
```

### Depois
```
/lib/api/rota-valente/
  ├── index.ts           ← Exports centralizados
  ├── actions.ts         ← Ações de pontos
  ├── proezas.ts         ← Proezas mensais
  ├── medals.ts          ← Medalhas permanentes
  ├── multiplier.ts      ← Lógica de multiplicador
  └── types.ts           ← Tipos TypeScript

/app/admin/rota-valente/
  └── page.tsx           ← Painel com 4 abas

/app/api/rota-valente/
  ├── award/route.ts     ← Endpoint de premiação
  └── stats/route.ts     ← Estatísticas
```

---

## ⏱️ CRONOGRAMA

| Fase | Duração | Status |
|------|---------|--------|
| 1. Banco de Dados | 30 min | ⏳ Pendente |
| 2. Backend | 1h | ⏳ Pendente |
| 3. Admin Panel | 1.5h | ⏳ Pendente |
| 4. Refatoração | 1h | ⏳ Pendente |
| 5. Multiplicador | 30 min | ⏳ Pendente |
| 6. Testes | 30 min | ⏳ Pendente |
| **TOTAL** | **5h** | |

---

## ✅ CHECKLIST GERAL

### Banco
- [ ] Criar tabela `proezas`
- [ ] Criar tabela `user_proezas`
- [ ] Criar tabela `point_actions`
- [ ] Popular dados iniciais
- [ ] Migrar medalhas existentes

### Backend
- [ ] Criar `/lib/api/rota-valente/`
- [ ] Implementar `awardPointsForAction()`
- [ ] Implementar `awardProeza()`
- [ ] Implementar `awardMedal()`
- [ ] Implementar `getMultiplier()`
- [ ] Remover hardcoded de 7 arquivos

### Admin
- [ ] Renomear `/admin/game` → `/admin/rota-valente`
- [ ] Criar aba Patentes
- [ ] Criar aba Medalhas
- [ ] Criar aba Proezas
- [ ] Criar aba Ações

### Componentes
- [ ] Refatorar `connection-button.tsx`
- [ ] Refatorar `notification-center.tsx`
- [ ] Refatorar `chat-widget.tsx`
- [ ] Refatorar `rating-form.tsx`
- [ ] Refatorar `confraternity.ts`
- [ ] Refatorar `profile.ts`
- [ ] Refatorar `storage.ts`

### Testes
- [ ] Testar multiplicador x1
- [ ] Testar multiplicador x1.5
- [ ] Testar multiplicador x3
- [ ] Testar proeza mensal
- [ ] Testar medalha permanente
- [ ] Testar painel admin

---

## 🚀 PRÓXIMO PASSO

**Aguardando aprovação para iniciar FASE 1: Banco de Dados**

Comando para começar:
```
"Aprovado, pode começar a implementação"
```

---

*Plano criado por: Time de Arquitetura*
*Rafael (DBA) | Carlos (Backend) | Marina (Frontend) | Lucas (UX)*
