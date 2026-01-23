# 🎯 REVISÃO FINAL - ROTA DO VALENTE v2.0

*Data: 23/01/2026 | Revisão por: Time Completo*

---

## 👥 EQUIPE DE REVISÃO

- **Rafael Costa** (DBA) - Schema, performance, integridade
- **Carlos Eduardo** (Backend) - APIs, lógica, segurança
- **Marina Santos** (Frontend) - UI, UX, componentes
- **Lucas Mendes** (UX) - Experiência, gamificação, engajamento

---

## 📋 PRIORIDADES DE NEGÓCIO (confirmadas)

| # | Prioridade | Peso |
|---|------------|------|
| 0 | **GERAR NEGÓCIOS** (projetos, vendas, contratos) | MÁXIMO |
| 1 | Interação entre membros (confrarias, elos) | ALTO |
| 2 | Logins diários (engajamento) | MÉDIO |
| 3 | Gerar conteúdo (feed, fotos) | MÉDIO |

---

## 🏛️ CONCEITOS DEFINIDOS

| Termo | Definição | Comportamento |
|-------|-----------|---------------|
| **VIGOR** | Pontos da temporada atual | Reseta dia 1 de cada mês |
| **XP** | Experiência total | Nunca reseta (define patente) |
| **PROEZAS** | Conquistas mensais | Resetam, podem reconquistar |
| **MEDALHAS** | Conquistas permanentes | 1x na vida, ficam no perfil |
| **PATENTE** | Rank hierárquico | Baseado no XP total |
| **TEMPORADA** | Mês vigente | Janeiro 2026, Fevereiro 2026... |

---

## 📊 MULTIPLICADORES DE PLANO

| Plano | Multiplicador | VIGOR MENSAL | XP ACUMULADO |
|-------|---------------|--------------|--------------|
| Recruta | x1 | Sim | Sim |
| Veterano | x1.5 | Sim | Sim |
| Elite | x3 | Sim | Sim |

⚠️ **PONTO CEGO IDENTIFICADO:** O multiplicador deve ser aplicado TANTO no vigor mensal QUANTO no XP. Ou apenas no vigor?

**DECISÃO NECESSÁRIA:** 
- Opção A: Multiplicador só no VIGOR (temporada) - mantém XP igual para todos
- Opção B: Multiplicador em TUDO - Elite avança muito mais rápido nas patentes

---

## 🔥 PROEZAS (27) - Mensais

### 🏆 NEGÓCIOS/PROJETOS (6)
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| primeiro_sangue | Primeiro Sangue | 50 | 1ª venda no mês |
| missao_cumprida | Missão Cumprida | 100 | 1º serviço concluído |
| irmandade | Irmandade | 75 | Contratar membro |
| lancador | Lançador | 30 | 1 projeto lançado |
| empreendedor | Empreendedor | 80 | 3 projetos lançados |
| maquina_negocios | Máquina de Negócios | 150 | 5 projetos lançados |

### 🤝 CONEXÕES (3)
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| presente | Presente | 50 | 1º elo aceito no mês |
| recrutador | Recrutador | 150 | Indicar 3 membros |
| embaixador | Embaixador | 400 | Indicar 10 membros |

### 🔥 CONFRARIAS (5)
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| primeira_confraria | Primeira Confraria | 50 | 1ª confraria no mês |
| networker_ativo | Networker Ativo | 100 | 5 confrarias |
| lider_confraria | Líder de Confraria | 200 | 10 confrarias |
| anfitriao | Anfitrião | 100 | 1+ como anfitrião |
| cronista | Cronista | 50 | Upload foto |

### 📱 ENGAJAMENTO (5)
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| pronto_missao | Pronto para Missão | 50 | 5 respostas <2h |
| sentinela_inabalavel | Sentinela Inabalável | 200 | 30 dias ativos |
| sentinela_elite | Sentinela de Elite | 500 | Manter plano Elite |
| engajado | Engajado | 30 | 15+ logins |
| comunicador | Comunicador | 30 | 5+ mensagens chat |

### ⭐ AVALIAÇÕES (3)
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| batismo_excelencia | Batismo de Excelência | 80 | 1ª avaliação 5★ |
| colaborador | Colaborador | 50 | 5 avaliações dadas |
| avaliador_ativo | Avaliador Ativo | 100 | 10 avaliações dadas |

### 📸 CONTEÚDO/FEED (5)
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| cinegrafista | Cinegrafista | 30 | 1º upload foto |
| influenciador | Influenciador | 50 | 10 posts |
| voz_da_rota | Voz da Rota | 150 | 50 posts |
| viral | Viral | 100 | Post 20+ likes |
| comentarista | Comentarista | 50 | 10 comentários |
| engajador_feed | Engajador | 80 | 50 comentários |

**📊 TOTAL PROEZAS: 27 | Máximo/mês: 2.885 pts**

---

## 🏅 MEDALHAS (11) - Permanentes

### 👤 PERFIL
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| alistamento_concluido | Alistamento Concluído | 100 | Perfil 100% |

### 🏆 NEGÓCIOS
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| veterano_guerra | Veterano de Guerra | 300 | 20 serviços total |
| fechador_elite | Fechador de Elite | 500 | 50 contratos total |

### 🛒 MARKETPLACE
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| primeira_venda_mkt | Primeira Venda MKT | 50 | 1ª venda marketplace |
| vendedor_ativo | Vendedor Ativo | 100 | 5 vendas |
| comerciante | Comerciante | 200 | 10 vendas |
| mestre_marketplace | Mestre do Marketplace | 400 | 20 vendas |

### 🤝 CONEXÕES
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| mestre_conexoes | Mestre das Conexões | 300 | 20 confrarias total |

### ⭐ QUALIDADE
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| inabalavel | Inabalável | 150 | Média 5★ após 5 trab. |
| portfolio_premium | Portfólio Premium | 100 | 10 fotos total |

### 📱 ENGAJAMENTO
| ID | Nome | Pts | Critério |
|----|------|-----|----------|
| veterano_rota | Veterano da Rota | 300 | 1 ano na plataforma |

**📊 TOTAL MEDALHAS: 11 | Total pts: 2.500**

---

## ⚡ AÇÕES DE PONTOS (Diretas)

| ID | Nome | Pts | Limite/dia |
|----|------|-----|------------|
| elo_sent | Enviar elo | 20 | 10 |
| elo_accepted | Aceitar elo | 30 | 10 |
| confraternity_created | Criar confraria | 40 | 3 |
| confraternity_invite | Enviar convite | 5 | 20 |
| confraternity_accepted | Aceitar convite | 15 | 5 |
| confraternity_host | Participar anfitrião | 80 | 3 |
| confraternity_guest | Participar convidado | 50 | 5 |
| confraternity_photo | Upload foto | 25 | 5 |
| daily_login | Login diário | 5 | 1 |
| feed_post | Publicar post | 15 | 5 |
| post_like_received | Receber like | 2 | 50 |
| post_comment_received | Receber comentário | 5 | 20 |
| post_comment_sent | Comentar | 5 | 10 |
| portfolio_upload | Upload portfolio | 20 | 5 |
| project_requested | Lançar projeto | 100 | 3 |
| project_closed | Fechar contrato | 200 | ∞ |
| rating_given | Dar avaliação | 10 | 5 |

**📊 TOTAL AÇÕES: 17**

---

## 🚨 PONTOS CEGOS IDENTIFICADOS

### 1️⃣ MULTIPLICADOR - Onde aplica?

**Problema:** O multiplicador deve afetar só vigor ou XP também?

| Cenário | Implicação |
|---------|------------|
| Só Vigor | Elite ganha mais mensal mas patente = igual |
| Tudo | Elite evolui 3x mais rápido nas patentes |

**RECOMENDAÇÃO:** Aplicar em TUDO. Quem paga mais, avança mais rápido.

---

### 2️⃣ RESET MENSAL - Quando exatamente?

**Problema:** Qual horário do reset? Fuso horário?

**RECOMENDAÇÃO:** Dia 1, 00:00 horário de Brasília (UTC-3)

---

### 3️⃣ HISTÓRICO - O que salvar?

**Problema:** Salvar detalhes ou só totais?

| Opção | Prós | Contras |
|-------|------|---------|
| Só totais | Menos dados | Perde detalhes |
| Detalhes | Histórico rico | Mais storage |

**RECOMENDAÇÃO:** Salvar por temporada:
- Total vigor
- Ranking posição
- Proezas conquistadas (IDs)
- Data de fim

---

### 4️⃣ PROJETOS - Existe o módulo?

**Problema:** As ações de projeto (`project_requested`, `project_closed`) dependem de um módulo de projetos.

**STATUS:** ⚠️ Verificar se módulo existe ou precisa criar

---

### 5️⃣ INDICAÇÃO - Como rastrear?

**Problema:** Proezas "Recrutador" (3 indicações) e "Embaixador" (10 indicações) precisam de sistema de indicação.

**STATUS:** ⚠️ Verificar se existe ou precisa criar

---

### 6️⃣ FEED "NA ROTA" - Existe?

**Problema:** Proezas de posts, likes, comentários dependem do feed.

**STATUS:** ⚠️ Verificar status do módulo "Na Rota"

---

### 7️⃣ STREAK - Como calcular 30 dias?

**Problema:** Proeza "Sentinela Inabalável" (30 dias ativos) precisa de lógica de streak.

**RECOMENDAÇÃO:** 
- Tabela `user_daily_login` com data
- CRON diário verifica streak
- Reseta se faltar 1 dia

---

### 8️⃣ TEMPO NA PLATAFORMA - Como calcular?

**Problema:** Medalha "Veterano da Rota" (1 ano) precisa de `created_at` do usuário.

**RECOMENDAÇÃO:** CRON mensal verifica `profiles.created_at`

---

## 🔧 DECISÕES NECESSÁRIAS

Antes de implementar, preciso que você confirme:

| # | Pergunta | Opções |
|---|----------|--------|
| 1 | Multiplicador aplica em XP também? | Sim / Não |
| 2 | Módulo de Projetos existe? | Sim / Não (criar) |
| 3 | Sistema de Indicação existe? | Sim / Não (criar) |
| 4 | Feed "Na Rota" está funcional? | Sim / Não (criar) |
| 5 | Horário do reset? | 00:00 Brasília? |
| 6 | Limites diários estão OK? | Sim / Ajustar |

---

## 📁 ESTRUTURA TÉCNICA FINAL

### Tabelas
```
proezas              ← 27 registros
medals               ← 11 registros
point_actions        ← 17 registros
ranks                ← 6 registros (existente)
user_proezas         ← Histórico mensal
user_medals          ← Permanentes (existente)
points_history       ← Logs (existente)
user_season_stats    ← Totais por temporada
user_daily_login     ← Para streaks
```

### Admin Tabs
```
/admin/rota-valente
  ├── Patentes    (CRUD 6 ranks)
  ├── Medalhas    (CRUD 11)
  ├── Proezas     (CRUD 27)
  └── Ações       (CRUD 17)
```

### API
```
/lib/api/rota-valente/
  ├── actions.ts     ← awardPointsForAction()
  ├── proezas.ts     ← awardProeza()
  ├── medals.ts      ← awardMedal()
  ├── multiplier.ts  ← getMultiplier()
  ├── season.ts      ← getSeasonStats()
  └── ranking.ts     ← getRanking()
```

---

## ✅ RESUMO EXECUTIVO

| Item | Quantidade |
|------|------------|
| Proezas (mensais) | 27 |
| Medalhas (permanentes) | 11 |
| Ações de pontos | 17 |
| Patentes | 6 |
| **TOTAL configurável** | **61** |

| Métrica | Valor |
|---------|-------|
| Max vigor/mês (proezas) | 2.885 pts |
| Medalhas totais | 2.500 pts |
| Pontos por ação | Variável |

---

## 🚀 PRÓXIMOS PASSOS

1. **Você responde as 6 perguntas acima**
2. Início da implementação FASE 1 (Banco)
3. Implementação progressiva
4. Testes
5. Deploy

---

*Documento revisado por todo o time*
*Rafael (DBA) | Carlos (Backend) | Marina (Frontend) | Lucas (UX)*
