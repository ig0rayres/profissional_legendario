# Arquitetura de Gamificação - Fonte Única de Verdade

## 📋 Visão Geral

Este documento define a arquitetura **definitiva** para gerenciamento de pontos e medalhas no sistema.

---

## 🎯 Fonte Única de Verdade

### Pontos
```
📦 points_history (FONTE ÚNICA)
   ├── Toda ação que gera pontos é registrada aqui
   ├── Campos: user_id, points, action_type, description, created_at
   └── TRIGGER automaticamente sincroniza para:
       ├── user_gamification.total_points (soma total)
       └── user_season_stats.total_xp (soma do mês)
```

### Medalhas
```
📦 medals (ADMINISTRAÇÃO)
   └── Definição das medalhas (gerenciada pelo admin)

📦 user_medals (FONTE ÚNICA)
   ├── Medalhas conquistadas pelo usuário
   └── Acessada por:
       ├── /api/profile/me → earnedMedals
       ├── Rota do Valente → Quadro de Medalhas
       └── Perfil → Medalhas abaixo do nome
```

---

## 🔄 Fluxo de Dados

### Quando usuário ganha pontos:

```
1. awardPoints() é chamado
   ↓
2. INSERT em points_history
   ↓
3. TRIGGER tr_sync_points_on_insert dispara
   ↓
4. Sincronização automática:
   ├── user_gamification.total_points = SUM(points_history)
   ├── user_season_stats.total_xp = SUM(points_history do mês)
   └── Rank é atualizado baseado nos pontos
```

### Quando usuário ganha medalha:

```
1. awardBadge() é chamado
   ↓
2. INSERT em user_medals
   ↓
3. awardPoints() é chamado (XP da medalha)
   ↓
4. Notificação é criada
```

---

## 📊 Tabelas e Responsabilidades

| Tabela | Responsabilidade | Atualização |
|--------|------------------|-------------|
| `points_history` | Log de todas as ações | INSERT direto |
| `user_gamification` | Total de pontos + rank atual | VIA TRIGGER |
| `user_season_stats` | Pontos por temporada | VIA TRIGGER |
| `medals` | Definição de medalhas | ADMIN |
| `user_medals` | Medalhas do usuário | INSERT direto |
| `gamification_seasons` | Definição de temporadas | Sistema/Admin |

---

## 🚨 Regras Importantes

1. **NUNCA** insira diretamente em `user_gamification.total_points`
2. **NUNCA** insira diretamente em `user_season_stats.total_xp`
3. **SEMPRE** use `awardPoints()` para dar pontos
4. **SEMPRE** use `awardBadge()` para dar medalhas
5. Medalhas são buscadas de `user_medals` (não `user_badges`)

---

## 📁 Arquivos Relacionados

- `/lib/api/gamification.ts` - Funções de gamificação
- `/lib/api/profile.ts` - checkProfileCompletion
- `/components/profile/rota-valente-card.tsx` - Usa gamification.total_points
- `/components/gamification/battle-history.tsx` - Usa get_user_season_history()

---

## ✅ Checklist de Validação

Antes de fazer deploy, verificar:

- [ ] Trigger `tr_sync_points_on_insert` está ativo
- [ ] Todas as chamadas usam `awardPoints()` para pontos
- [ ] Todas as chamadas usam `awardBadge()` (user_medals) para medalhas
- [ ] RLS está configurado em points_history, user_medals, notifications

---

Última atualização: 2026-01-20
