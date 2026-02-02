# 📊 FONTE CENTRALIZADA DE DADOS DE GAMIFICAÇÃO

## ⚠️ DOCUMENTO CRÍTICO - LEITURA OBRIGATÓRIA

Este documento define a **ÚNICA fonte de verdade** para dados de gamificação (VIGOR/XP) da plataforma.
Inconsistências nesses dados impactam diretamente o **financeiro da operação** e **não são admitidas**.

---

## 🎯 ARQUITETURA OFICIAL (Atualizado 02/02/2026)

### **2 TABELAS OFICIAIS:**

| Tabela | Propósito | Descrição |
|--------|-----------|-----------|
| `user_gamification` | **PONTOS ATUAIS** | Temporada atual, rank, streak |
| `points_history` | **HISTÓRICO** | Log de todas as ações/pontos |

---

## 📌 TABELA 1: `user_gamification` - PONTOS ATUAIS

### Campos Principais:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | UUID | ID do usuário (PK, FK para auth.users) |
| `total_points` | INTEGER | **VIGOR TOTAL** - Principal métrica de ranking |
| `monthly_points` | INTEGER | Pontos do mês atual |
| `current_rank_id` | TEXT | **PATENTE ATUAL** (novato → lenda) |
| `total_medals` | INTEGER | Contador de medalhas |
| `streak_days` | INTEGER | Dias consecutivos ativos |
| `last_activity_at` | TIMESTAMP | Última atividade |

### API que usa:
```typescript
// /app/api/profile/me/route.ts
const { data: gamification } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', user.id)
    .single()
```

### 🎖️ PATENTES DISPONÍVEIS (current_rank_id):
| ID | Nome | Ícone | XP Necessário |
|----|------|-------|---------------|
| `novato` | Novato | Shield | 0 |
| `especialista` | Especialista | Target | 200 |
| `guardiao` | Guardião | ShieldCheck | 500 |
| `comandante` | Comandante | Medal | 1000 |
| `general` | General | Flame | 2000 |
| `lenda` | Lenda | Crown | 3500 |

---

## 📌 TABELA 2: `points_history` - HISTÓRICO

### Campos Principais:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do registro |
| `user_id` | UUID | ID do usuário |
| `points` | INTEGER | Quantidade de pontos |
| `action_type` | VARCHAR | Tipo (medal_reward, proeza, etc) |
| `description` | TEXT | Descrição da ação |
| `metadata` | JSONB | Dados extras (season_month, etc) |
| `created_at` | TIMESTAMP | Data/hora |

### Componentes que usam:
- `BattleHistory.tsx` - Card "Histórico de Batalha"
- `PointsHistory.tsx` - Lista de atividades

---

## 🚫 TABELAS DEPRECATED - NÃO USAR!

| Tabela | Status | Motivo |
|--------|--------|--------|
| `gamification_stats` | ❌ DEPRECATED | Redundante com user_gamification |
| `xp_logs` | ❌ DEPRECATED | Substituído por points_history |
| `user_season_stats` | ⚠️ CUIDADO | Apenas para dados de temporadas passadas |

---

## ✅ ONDE USAR CADA TABELA

### `user_gamification` - Usar para:
1. **Dashboard** - Exibir VIGOR atual
2. **Ranking** - Ordenar por total_points
3. **Perfil** - Mostrar patente atual
4. **Banner de Temporada** - Participantes

### `points_history` - Usar para:
1. **Histórico de Batalha** - Card FEV/2026
2. **Atividades recentes** - Lista de ações
3. **Auditoria** - Rastrear pontos concedidos

---

## 🔧 FUNÇÃO SQL: `remove_user_medal`

Para remover medalha corretamente, use:
```sql
SELECT remove_user_medal('user_id', 'medal_id');
```

**Remove de:**
1. `user_medals`
2. `points_history`
3. Atualiza `user_gamification.total_points`

---

## 📋 CHECKLIST PARA NOVOS COMPONENTES

- [ ] Verificar se está usando `user_gamification` para pontos ATUAIS
- [ ] Verificar se está usando `points_history` para HISTÓRICO
- [ ] **NUNCA** usar `gamification_stats` ou `xp_logs`
- [ ] Usar `total_points` como campo de ordenação
- [ ] Testar com dados reais antes de deploy

---

*Última atualização: 02/02/2026*
*Responsável: Equipe de Desenvolvimento*
