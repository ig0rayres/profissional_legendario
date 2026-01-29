# 🗂️ Arquitetura de Planos - Documentação Atualizada

**Última atualização:** 2026-01-29

---

## ⚠️ IMPORTANTE: Fonte Única de Verdade

### Tabela Principal: `plan_config`

**TODA alteração de planos deve ser feita via:**
- **Painel Admin** → `/admin` → Gestão de Planos
- **Tabela:** `plan_config`

---

## 📊 Estrutura Atual

### Tabelas no Banco de Dados:

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `plan_config` | **TABELA** | Fonte única de verdade - gerenciada pelo admin |
| `plan_tiers` | **VIEW** | Aponta para `plan_config` para compatibilidade |
| `plan_tiers_old` | BACKUP | Tabela antiga (antes da unificação) |
| `plan_config_backup_20260129` | BACKUP | Snapshot antes da migração |
| `plan_tiers_backup_20260129` | BACKUP | Snapshot antes da migração |

---

## 📋 Planos Disponíveis

| ID | Nome | Preço/mês | Multi. XP | Confrarias | Elos | Anúncios MKT |
|----|------|-----------|-----------|------------|------|--------------|
| `recruta` | Recruta | Grátis | 1.0x | 0 | 10 | 0 |
| `veterano` | Veterano | R$ 97 | 1.5x | 4/mês | 100 | 2 |
| `elite` | Elite | R$ 127 | 3.0x | 10/mês | ∞ | 10 |
| `lendario` | LENDÁRIO | R$ 247 | 5.0x | ∞ | ∞ | ∞ |

---

## 🔧 Como Alterar Planos

### Via Admin (Recomendado):
1. Acesse `/admin`
2. Clique em **"Gestão de Planos"**
3. Edite o plano desejado
4. Salve - **alterações propagam automaticamente**

### Campos Editáveis:
- `name` - Nome do plano
- `price` - Preço mensal (BRL)
- `xp_multiplier` - Multiplicador de XP/VIGOR
- `features` - Lista de benefícios
- `max_elos` - Limite de conexões (null = ilimitado)
- `max_confraternities_month` - Convites de confraria por mês
- `max_marketplace_ads` - Anúncios no marketplace (null = ilimitado)
- `stripe_product_id` - ID do produto no Stripe
- `stripe_price_id` - ID do preço no Stripe

---

## 🔄 Como Funciona a VIEW

A VIEW `plan_tiers` foi criada para manter compatibilidade com código existente:

```sql
-- Código existente continua funcionando:
SELECT * FROM subscriptions s
LEFT JOIN plan_tiers pt ON s.plan_id = pt.id

-- É equivalente a:
SELECT * FROM subscriptions s
LEFT JOIN plan_config pc ON s.plan_id = pc.tier
```

---

## 🚨 Regras de Alteração

1. **NUNCA** edite diretamente a VIEW `plan_tiers`
2. **SEMPRE** use o painel admin ou a tabela `plan_config`
3. **Alterações no admin** são refletidas automaticamente em toda plataforma
4. **Stripe IDs** devem ser configurados após criar produtos no Stripe Dashboard

---

## 🔙 Rollback (Emergência)

Se precisar reverter para a estrutura antiga:

```sql
-- Remover VIEW
DROP VIEW IF EXISTS plan_tiers;

-- Restaurar tabela original
ALTER TABLE plan_tiers_old RENAME TO plan_tiers;
```

---

## 📁 Arquivos Relacionados

| Arquivo | Responsabilidade |
|---------|------------------|
| `/components/admin/PlanManager.tsx` | UI de gestão de planos |
| `/lib/services/plan-service.ts` | Serviço de planos |
| `/app/api/stripe/create-checkout/route.ts` | Checkout Stripe |
| `/app/planos/page.tsx` | Página pública de planos |
| `/lib/profile/queries.ts` | Queries de perfil com JOIN |

---

## 📅 Histórico de Migrações

| Data | Migração | Descrição |
|------|----------|-----------|
| 2026-01-29 | `20260129_unify_plan_tables.sql` | Unificação plan_config + plan_tiers |

---

**Documentação criada em:** 2026-01-29  
**Autor:** Sistema Automatizado
