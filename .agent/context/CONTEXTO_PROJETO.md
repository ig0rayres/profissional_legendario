# 🧠 CONTEXTO DO PROJETO - ROTA BUSINESS CLUB

*Última atualização: 31/01/2026 - 15:00*

> **INSTRUÇÃO:** No início de cada sessão, peça para o assistente ler este arquivo:
> `"leia o arquivo CONTEXTO_PROJETO.md"`

---

## 📋 SOBRE O PROJETO

**Nome:** Rota Business Club  
**Stack:** Next.js 14 + TypeScript + Supabase + Tailwind CSS  
**Descrição:** Plataforma de networking profissional com gamificação

**🌐 Deploy:** ✅ **PRODUÇÃO - ONLINE E CONFIGURADO**
- **URL Principal:** https://rotabusinessclub.com.br ✅
- **URL Alternativa:** https://rotabusinessclub.vercel.app
- **Hospedagem:** Vercel (plano Hobby)
- **DNS + CDN:** Cloudflare (ativo)
- **Email:** Resend (domínio verificado)
- **Banco de Dados:** Supabase PostgreSQL ✅

**🔌 Acesso Direto ao Banco:**
- **Credenciais em:** `.agent/EXECUTAR_SQL_SUPABASE.md`
- **Host:** db.erzprkocwzgdjrsictps.supabase.co
- **Porta:** 5432

---

## 🚨 PONTO DE RETOMADA - 01/02/2026

### **ÚLTIMA SESSÃO: 01/02/2026 - ~13:00**

---

### ⚠️ ALTERAÇÕES TEMPORÁRIAS - REVERTER ANTES DE PRODUÇÃO

> **LEIA:** `docs/sessions/REVERTER_ROTA_UNICO.md`

**O que foi desabilitado:**
1. **Validação de rota_number único** no frontend (`app/auth/register/page.tsx`)
2. Código comentado para permitir testes de cadastro

**Commit:** `72f8016d`

**Para reverter:** Seguir checklist em `docs/sessions/REVERTER_ROTA_UNICO.md`

---

### **SESSÃO ANTERIOR: 31/01/2026 - 14:35 às 15:00**

### **O QUE FOI FEITO HOJE:**

#### ✅ **SISTEMA DE PLANOS 100% DINÂMICO** 🎯

**Duração:** ~25min  
**Status:** ✅ COMPLETO E PRONTO PARA DEPLOY

##### 1. **Novos Campos no plan_config:**

**max_categories (INTEGER):**
- ✅ Migration: `20260131_add_max_categories_to_plans.sql`
- ✅ Valores padrão: Recruta=3, Veterano=10, Elite=25, Lendário=-1 (ilimitado)
- ✅ Checkbox "Ilimitado" no admin
- ✅ Card visual na visualização

**description (TEXT):**
- ✅ Migration: `20260131_add_description_to_plans.sql`
- ✅ Campo editável no admin (criação e edição)
- ✅ Removido `TIER_DESCRIPTIONS` hardcoded dos componentes
- ✅ Home e página /planos agora usam `plan.description` do banco

##### 2. **UX Aprimorada - Checkboxes "Ilimitado":**

**Antes:** Digitar `-1` manualmente  
**Agora:** ☑ Checkbox intuitivo

**Campos atualizados:**
- ✅ Elos Máximos → Checkbox + input condicional
- ✅ Confrarias/Mês → Checkbox + input condicional
- ✅ Anúncios Marketplace → Checkbox + input condicional
- ✅ Max Categorias → Checkbox + input condicional

**Lógica:**
- Marcado → Salva `-1`, esconde input
- Desmarcado → Mostra input numérico (padrão)
- Visualização → `-1` mostra "∞ Ilimitado"

##### 3. **Remoção de Redundância:**

**Removido:** Campo `can_send_confraternity` (boolean redundante)

**Lógica automática implementada:**
```typescript
max_confraternities_month === 0  → NÃO pode enviar
max_confraternities_month === -1 → Ilimitado
max_confraternities_month > 0    → Limitado
```

**Arquivos atualizados:**
- ✅ Interface `Plan` (removido campo)
- ✅ PlanManager (removido toggle)
- ✅ `helpers.ts` (lógica automática)

##### 4. **helpers.ts: De Hardcoded para Dinâmico:**

**Antes:** `PLAN_LIMITS` const hardcoded  
**Agora:** `getUserPlanLimits()` busca de `plan_config`

**Benefício:** Admin altera → Reflete automaticamente sem código

##### 5. **Frontend 100% Dinâmico:**

**Componentes verificados:**
- ✅ `/components/sections/plans-section.tsx` → Dinâmico
- ✅ `/app/planos/page.tsx` → Dinâmico
- ✅ Removido todos os hardcoded `TIER_DESCRIPTIONS`

##### 6. **Documentação Atualizada:**

**Arquivos criados:**
- ✅ `docs/sessions/SESSION_2026-01-31_PLANOS_DINAMICOS.md` - Resumo completo
- ✅ `docs/sessions/GESTAO_PLANOS_DINAMICA_2026-01-31.md` - Detalhes técnicos
- ✅ `docs/CHECKLIST_PLANOS_DINAMICOS.md` - Checklist visual
- ✅ `docs/ESCOPO_PROJETO.md` - Atualizado com max_categories

### **MIGRATIONS CRIADAS:**
```sql
-- 20260131_add_max_categories_to_plans.sql
-- 20260131_add_description_to_plans.sql
```

### **RESULTADO:**
✅ **ZERO HARDCODE** → Tudo configurável no admin  
✅ **UX INTUITIVA** → Checkboxes claros  
✅ **LÓGICA UNIFICADA** → Sem redundância  
✅ **AUTO-ATUALIZAÇÃO** → Cards refletem mudanças instantaneamente

---

## 📁 DOCUMENTAÇÃO RELACIONADA

| Arquivo | Conteúdo |
|---------|----------|
| `.agent/context/CONTEXTO_PROJETO.md` | Este arquivo (ponto de retomada) |
| `.agent/context/AGENTS.md` | Personas dos agentes (Carlos, Marina, Lucas, Rafael) |
| `.agent/EXECUTAR_SQL_SUPABASE.md` | **⚠️ COMO EXECUTAR SQL DIRETO NO BANCO** |
| **`docs/PROJETOS_APRESENTACAO_NEGOCIO.md`** | 📊 Apresentação módulo projetos (pitch/stakeholders) |
| **`docs/PROJETOS_DOCUMENTACAO_TECNICA.md`** | 🔧 Documentação técnica (banco, APIs, integrações) |
| **`docs/PROJETOS_PLANO_TESTES.md`** | ✅ Plano de testes passo a passo (URLs,validações) |
| **`docs/PROJETOS_MODULO_COMPLETO.md`** | 📋 Visão geral completa do módulo |

---

## 🗄️ ESTRUTURA ADMIN

```
/admin
├── /                    → Dashboard geral
├── /users               → Gestão de usuários
├── /game                → Medalhas, proezas, ranks
├── /rota-valente        → Temporadas (prêmios, ranking, BANNERS)
├── /financeiro          → Dashboard, Planos, Comissões, Relatórios, Prêmios
├── /marketplace         → Anúncios, Tiers, Categorias
├── /pistas              → Oportunidades de negócio
├── /notifications       → Notificações
└── /categories          → Categorias profissionais
```

---

## 🔜 PRÓXIMOS PASSOS SUGERIDOS

### **PRIORIDADE 1 - Testar Módulo de Projetos (31/01/2026):**
1. **Executar plano de testes** - Seguir `docs/PROJETOS_PLANO_TESTES.md` passo a passo
2. **Validar fluxo end-to-end** - Cliente cria → Profissional propõe → Cliente aceita
3. **Corrigir bugs** - Instalar componentes shadcn faltantes, ajustar erros
4. **Validar notificações** - Tempo real funcionando
5. **Testar CRON job** - Distribuição automática

### **PRIORIDADE 2 - Finalizar Módulo de Projetos:**
1. **Upload de arquivos** - Integrar Supabase Storage
2. **Email real** - Configurar SendGrid ou Resend
3. **Interfaces extras** - Modal enviar proposta integrado, dashboard profissional

### **PRIORIDADE 3 - Outros Módulos:**
1. **Marketplace** - Grid Elite para anúncios premium
2. **Temporadas** - Testar banners gerados
3. **Melhorias UX** - Animações, responsividade mobile

---

*Fim do contexto. Boa sessão!*
