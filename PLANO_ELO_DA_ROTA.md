# 🎯 PLANO FOCADO - ELO DA ROTA

**Data:** 17/01/2026  
**Objetivo:** Criar dashboard "Elo da Rota" espetacular e público

---

## ✅ O QUE JÁ EXISTE:

1. ✅ Página `/elo-da-rota` (básica)
2. ✅ Página `/professional/[id]` com template
3. ✅ Painel admin `/admin/game` (patentes e medalhas)
4. ✅ Painel admin `/admin/marketplace`
5. ✅ Arquivo SQL `FASE1_ESTRUTURA_PERFIL.sql` criado (NÃO executado)

---

## 🚀 O QUE FALTA FAZER:

### **STEP 1: Executar SQL no Supabase** (15 min)
- [ ] Executar `FASE1_ESTRUTURA_PERFIL.sql` no Supabase
  - Cria tabela `portfolio_items`
  - Cria function `get_user_confraternity_stats()`
  - Cria function `get_rating_stats()`

### **STEP 2: Adicionar campo SLUG** (30 min)
- [ ] Adicionar coluna `slug` em `profiles`
- [ ] Criar function `generate_slug()` e trigger automático
- [ ] Gerar slugs para usuários existentes
- [ ] Criar rota `/professional/[slug]` (mantém `[id]` também)

### **STEP 3: Functions para Dashboard Público** (30 min)
- [ ] Criar `get_platform_stats()` (totais gerais)
- [ ] Criar `get_top_users_by_vigor(limit)` (ranking)
- [ ] Criar `get_recent_achievements(limit)` (últimas medalhas)

### **STEP 4: Transformar "Elo da Rota" em Dashboard Público** (3-4h)
- [ ] Remover proteção de login
- [ ] Card: Ranking Top 10 Vigor (com animações)
- [ ] Card: Últimas Conquistas (feed de medalhas)
- [ ] Card: Total de Projetos
- [ ] Card: Projetos Finalizados
- [ ] Card: Receita Total
- [ ] Card: Mural de Fotos - Confraria
- [ ] Design PREMIUM (glassmorphism, gradientes, animações)

### **STEP 5: Componentes Visuais de Gamificação** (2h)
- [ ] `components/profile/gamification-card.tsx`
- [ ] `components/profile/medals-grid.tsx`  
- [ ] `components/profile/confraternity-stats.tsx`
- [ ] Integrar na página de perfil existente

### **STEP 6: Sistema de Projetos** (2-3h)
- [ ] Tabela `projects`
- [ ] Tabela `project_proposals`
- [ ] Menu no Header: "Lançar Projeto"
- [ ] Lista de projetos disponíveis
- [ ] Profissionais podem enviar orçamento
- [ ] Admin pode aprovar/moderar

---

## ⏰ TEMPO ESTIMADO: 8-10h

---

## 📋 SEQUÊNCIA DE EXECUÇÃO:

### **MANHÃ (4-5h):**
1. STEP 1: SQL no Supabase
2. STEP 2: Slugs
3. STEP 3: Functions Dashboard
4. STEP 4: Começar "Elo da Rota"

### **TARDE (4-5h):**
5. STEP 4: Finalizar "Elo da Rota"
6. STEP 5: Componentes visuais
7. STEP 6: Sistema de projetos (se der tempo)

---

## 🎨 PALETA DE CORES:

- **Primária (Laranja):** `#f97316`
- **Secundária (Verde):** `#22c55e`
- **Background Dark:** `#0f172a`
- **Cards:** Glassmorphism com `backdrop-blur`
- **Gradientes:** Laranja → Verde

---

## 🛡️ PROTEÇÃO DO LOGIN:

⚠️ **NÃO MEXER EM:**
- `lib/auth/context.tsx`
- `app/auth/`
- `middleware.ts`

---

**PRONTO PARA COMEÇAR!** 🚀
