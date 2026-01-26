# 🎯 SISTEMA COMPLETO: MEDALHAS vs PROEZAS

## ✅ INTEGRAÇÃO SEGURA - DADOS PRESERVADOS

**Status:** 4 medalhas existentes + 3 usuários **INTACTOS** ✓

---

## 📊 ESTRUTURA FINAL

### 🏅 **MEDALHAS (Permanentes)**

**Tabelas:**
- `medals` - Catálogo de medalhas
- `user_medals` - Medalhas conquistadas

**Características:**
- ✅ **Únicas** - Ganhas apenas 1x na vida
- ✅ **Permanentes** - Nunca resetam
- ✅ **All-Time** - Contadores somam TODAS as temporadas
- ✅ **Exemplo:** "10 Confrarias" = total histórico (Jan + Fev + Mar...)

**Medalhas Existentes (26):**
- primeira_confraria, anfitriao, cronista, networker_ativo
- lider_confraria, mestre_conexoes, presente
- cinegrafista_campo, portfolio_premium, missao_cumprida
- primeiro_sangue, fechador_elite
- batismo_excelencia, inabalavel
- alistamento_concluido, recrutador
- pronto_missao, sentinela_inabalavel
- sentinela_elite, veterano_rota, veterano_guerra
- irmandade, comerciante, mestre_marketplace
- primeira_venda_mkt, vendedor_ativo

---

### 🎖️ **PROEZAS (Mensais)**

**Tabelas:**
- `achievements` - Catálogo de proezas
- `user_achievements` - Proezas conquistadas (por temporada)

**Características:**
- ✅ **Mensais** - Podem ser ganhas todo mês
- ✅ **Resetam** - Contadores zerados dia 1º
- ✅ **Competitivas** - Ranking mensal
- ✅ **Exemplo:** "Rei do Mês" = mais confrarias NO MÊS ATUAL

**Proezas Cadastradas (8):**
1. **rei_do_mes** (500 pts) - Mais confrarias validadas no mês
2. **workaholic_mes** (500 pts) - Mais projetos entregues no mês
3. **social_butterfly_mes** (300 pts) - Mais elos criados no mês
4. **cronista_mes** (200 pts) - Mais posts com fotos no mês
5. **top3_mes** (300 pts) - Ficou entre os 3 primeiros do ranking
6. **5_confrarias_mes** (150 pts) - 5 confrarias em um único mês
7. **10_posts_mes** (100 pts) - 10 posts em um único mês
8. **ativo_mes** (200 pts) - Logou todos os dias do mês

---

## 🔄 COMO FUNCIONA

### **MEDALHAS (All-Time):**

```typescript
// Contar confrarias ALL-TIME
const total = await supabase.rpc('count_user_confraternities_alltime', {
  p_user_id: userId
})

// Se atingiu 10, conceder medalha
if (total === 10) {
  await awardBadge(userId, 'lider_confraria')
}

// Medalha é PERMANENTE, nunca reseta
```

### **PROEZAS (Mensal):**

```typescript
// Contar confrarias NO MÊS ATUAL
const thisMonth = await supabase.rpc('count_user_confraternities_in_season', {
  p_user_id: userId,
  p_season: '2026-01' // Janeiro 2026
})

// Se atingiu 5 NO MÊS, conceder proeza
if (thisMonth === 5) {
  await supabase.rpc('award_achievement', {
    p_user_id: userId,
    p_achievement_id: '5_confrarias_mes',
    p_season: '2026-01'
  })
}

// Próximo mês (2026-02), pode ganhar DE NOVO!
```

---

## 📅 TEMPORADAS

### **Formato:** `YYYY-MM`
- Janeiro 2026: `2026-01`
- Fevereiro 2026: `2026-02`
- Março 2026: `2026-03`

### **Reset Mensal (Dia 1º):**
- ✅ Contadores de proezas zerados
- ✅ Ranking mensal resetado
- ✅ Proezas podem ser ganhas novamente
- ❌ Medalhas NÃO resetam (permanentes)

---

## 🎯 EXEMPLOS PRÁTICOS

### **Exemplo 1: Usuário faz 10 confrarias**

**Janeiro 2026:**
- 5 confrarias → Ganha proeza "5_confrarias_mes" (150 pts)
- Continua...
- 10 confrarias → Ganha medalha "lider_confraria" (200 pts) **PERMANENTE**

**Fevereiro 2026:**
- Contador de proezas reseta para 0
- 5 confrarias → Ganha proeza "5_confrarias_mes" DE NOVO (150 pts)
- Medalha "lider_confraria" continua lá (não reseta)

**Março 2026:**
- 10 confrarias NO MÊS → Ganha proeza "10_confrarias_mes" (se existir)
- Total all-time: 25 confrarias
- Ganha medalha "mestre_conexoes" (20 confrarias) **PERMANENTE**

---

## 🏆 RANKING MENSAL

### **View: `monthly_achievements_ranking`**

```sql
SELECT * FROM monthly_achievements_ranking
WHERE season = '2026-01'
ORDER BY rank;
```

**Resultado:**
| user_id | full_name | season | achievements_count | total_points | rank |
|---------|-----------|--------|-------------------|--------------|------|
| user-1 | João | 2026-01 | 5 | 1350 | 1 |
| user-2 | Maria | 2026-01 | 4 | 1100 | 2 |
| user-3 | Pedro | 2026-01 | 3 | 850 | 3 |

### **Top 3 Ganha:**
- 🥇 1º lugar: Proeza "top3_mes" + bônus
- 🥈 2º lugar: Proeza "top3_mes" + bônus
- 🥉 3º lugar: Proeza "top3_mes" + bônus

---

## 📊 FUNÇÕES DISPONÍVEIS

### **Para Medalhas (All-Time):**

```sql
-- Contar confrarias total histórico
SELECT count_user_confraternities_alltime('user-id');

-- Contar projetos total histórico
SELECT count_user_projects_alltime('user-id');
```

### **Para Proezas (Mensal):**

```sql
-- Contar confrarias no mês
SELECT count_user_confraternities_in_season('user-id', '2026-01');

-- Contar projetos no mês
SELECT count_user_projects_in_season('user-id', '2026-01');

-- Conceder proeza
SELECT award_achievement('user-id', 'rei_do_mes', '2026-01');
```

---

## 🛡️ PROTEÇÃO ANTI-DUPLICAÇÃO

### **Medalhas:**
```sql
-- UNIQUE constraint: (user_id, medal_id)
-- Impossível ganhar mesma medalha 2x
```

### **Proezas:**
```sql
-- UNIQUE constraint: (user_id, achievement_id, season)
-- Impossível ganhar mesma proeza 2x NO MESMO MÊS
-- Mas pode ganhar em meses diferentes!
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Medalhas Permanentes:**
- [x] Tabela `medals` intacta
- [x] Tabela `user_medals` intacta
- [x] 4 medalhas existentes preservadas
- [x] 3 usuários com medalhas preservados
- [x] Função `awardBadge()` funcionando
- [x] Contadores all-time criados

### **Proezas Mensais:**
- [x] Tabela `achievements` criada
- [x] Tabela `user_achievements` criada
- [x] 8 proezas cadastradas
- [x] Função `award_achievement()` criada
- [x] Contadores mensais criados
- [x] Views de ranking criadas

### **Sistema de Temporadas:**
- [x] Coluna `season` em posts
- [x] Constraints por temporada
- [x] Função `get_current_season()`
- [x] Trigger automático de season

---

## 🚀 PRÓXIMOS PASSOS

1. **Atualizar `awardBadge()`** para usar contadores all-time
2. **Criar job mensal** para conceder proezas de ranking
3. **UI de temporadas** - Mostrar temporada atual
4. **Histórico** - Ver proezas de meses anteriores
5. **Notificações** - Avisar quando ganhar proeza

---

## 📝 RESUMO

**MEDALHAS:**
- 26 medalhas permanentes
- Ganhas 1x na vida
- Contadores all-time
- 4 já concedidas ✓

**PROEZAS:**
- 8 proezas mensais
- Resetam todo mês
- Contadores mensais
- 0 concedidas (sistema novo)

**DADOS:**
- ✅ 100% preservados
- ✅ Compatibilidade total
- ✅ Sem breaking changes

---

**Sistema pronto para uso!** 🎉
