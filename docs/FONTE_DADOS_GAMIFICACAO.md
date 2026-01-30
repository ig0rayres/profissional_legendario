# 📊 FONTE CENTRALIZADA DE DADOS DE GAMIFICAÇÃO

## ⚠️ DOCUMENTO CRÍTICO - LEITURA OBRIGATÓRIA

Este documento define a **ÚNICA fonte de verdade** para dados de gamificação (VIGOR/XP) da plataforma.
Inconsistências nesses dados impactam diretamente o **financeiro da operação** e **não são admitidas**.

---

## 🎯 TABELA OFICIAL: `user_gamification`

### Campos Principais:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | UUID | ID do usuário (FK para profiles) |
| `total_points` | INTEGER | **VIGOR TOTAL** - Principal métrica de ranking |
| `current_rank_id` | TEXT | **PATENTE ATUAL** - ID da patente (recruta, veterano, elite, mestre, lenda) |
| `total_xp` | INTEGER | XP total (histórico) |
| `last_activity_at` | TIMESTAMP | Última atividade |

### 🎖️ PATENTES DISPONÍVEIS (current_rank_id):
| ID | Nome | Ícone | Cor |
|----|------|-------|-----|
| `recruta` | Recruta | Shield | #9CA3AF (cinza) |
| `veterano` | Veterano | ShieldCheck | #22C55E (verde) |
| `elite` | Elite | Target | #3B82F6 (azul) |
| `mestre` | Mestre | Medal | #F97316 (laranja) |
| `lenda` | Lenda | Crown | #EAB308 (dourado) |

### Query Padrão para Ranking:
```sql
SELECT 
    ug.user_id,
    ug.total_points,
    ug.current_rank_id,  -- PATENTE: usar direto no AvatarWithRank
    p.full_name,
    p.avatar_url
FROM user_gamification ug
JOIN profiles p ON p.id = ug.user_id
WHERE ug.total_points > 0
ORDER BY ug.total_points DESC
LIMIT 50;
```

---

## 🚫 TABELAS QUE NÃO DEVEM SER USADAS PARA RANKING

| Tabela | Motivo |
|--------|--------|
| `user_season_stats` | Dados por temporada, pode estar vazio |
| `gamification_stats` | Tabela legada/deprecated |
| Qualquer outra | Não é a fonte oficial |

---

## ✅ ONDE USAR `user_gamification`

### Componentes que DEVEM usar esta fonte:

1. **Banner de Temporada** (`SeasonBannerCarouselV2.tsx`)
   - Exibe: participantes, ranking
   
2. **Admin Rota do Valente** (`SeasonsManager.tsx`)
   - Exibe: ranking, participantes, líder XP
   
3. **Feed Na Rota** (`/na-rota/page.tsx` via `PostsService`)
   - Exibe: ranking lateral
   
4. **Dashboard Rota do Valente** (`/dashboard/rota-do-valente`)
   - Exibe: ranking completo

5. **Perfil do Usuário** (`profile-page-template.tsx`)
   - Exibe: posição no ranking, vigor

---

## 🔧 SERVIÇO CENTRALIZADO

Use o serviço em `/lib/services/posts-service.ts`:

```typescript
// Método loadRanking() - FONTE OFICIAL
private async loadRanking(limit = 5): Promise<RankingUser[]> {
    const { data } = await this.supabase
        .from('user_gamification')
        .select('user_id, total_points, current_rank_id')
        .order('total_points', { ascending: false })
        .limit(limit)
    // ...
}
```

---

## 📋 CHECKLIST PARA NOVOS COMPONENTES

Antes de criar qualquer componente que exiba dados de ranking/vigor:

- [ ] Verificar se está usando `user_gamification`
- [ ] Usar `total_points` como campo de ordenação
- [ ] NÃO criar queries diretas - usar serviço centralizado
- [ ] Testar com dados reais antes de deploy

---

## 🛡️ MEDIDAS DE PROTEÇÃO

### 1. Validação em CI/CD
Adicionar lint rule para detectar uso de tabelas incorretas:
- Alertar se `user_season_stats` for usado para ranking
- Alertar se `gamification_stats` for usado

### 2. Monitoramento
- Log de todas as queries de gamificação
- Alertas se houver discrepância entre fontes

### 3. Auditoria Mensal
- Verificar consistência entre `user_gamification` e premiações
- Documentar qualquer ajuste manual

---

## 📞 CONTATO EM CASO DE DÚVIDAS

Em caso de dúvidas sobre qual tabela usar, **SEMPRE consulte este documento** ou o líder técnico antes de implementar.

**NUNCA improvise com dados de gamificação.**

---

*Última atualização: 30/01/2026*
*Responsável: Equipe de Desenvolvimento*
