# 📋 PLANO DE TRABALHO - 17/01/2026

**Status Atual:** ✅ Login funcionando perfeitamente  
**Tempo Estimado Total:** 9-13h  
**Última Atualização:** 08:42

---

## ✅ CONCLUÍDO HOJE:

### 1. **Sistema de Login - RESOLVIDO DEFINITIVAMENTE** ✅
- ✅ Arquitetura híbrida de 2 fases implementada
- ✅ Sistema de backup automático criado
- ✅ Scripts de verificação e rollback
- ✅ Documentação completa
- ✅ Testes validados

**Tempo gasto:** ~1h  
**Commits:** `e01f142d`, `e4aa2408`

---

## 🎯 PENDÊNCIAS DO DIA:

### 🔧 **PRIORIDADE 1: Configuração de Emails para Produção** (1-2h)

**Objetivo:** Preparar sistema para cadastro em massa de novos usuários

#### **Passos:**
1. [ ] **Criar conta Resend** (5 min)
   - Acesse: https://resend.com/signup
   - Confirme email

2. [ ] **Gerar API Key** (2 min)
   - Dashboard → API Keys → Create
   - Nome: "Rota Business - Production"
   - Permissão: "Sending access"
   - ⚠️ COPIAR KEY (mostra só 1 vez!)

3. [ ] **Configurar SMTP no Supabase** (3 min)
   - Settings → Auth → SMTP Settings
   - Host: `smtp.resend.com`
   - Port: `587`
   - User: `resend`
   - Password: `[API KEY]`
   - Sender: `noreply@rotabusiness.com.br`
   - Sender name: `Rota Business Club`

4. [ ] **Ativar confirmação de email** (1 min)
   - Authentication → Providers → Email
   - LIGAR toggle "Confirm email"
   - Save

5. [ ] **Testar cadastro completo** (5 min)
   - Cadastrar com email pessoal
   - Verificar inbox (pode demorar 1-2min)
   - Confirmar email
   - Fazer login

6. [ ] **OPCIONAL: Adicionar domínio customizado** (15-30 min)
   - Resend → Domains → Add Domain
   - Adicionar: `rotabusiness.com.br`
   - Copiar registros DNS
   - Configurar no Registro.br
   - Aguardar verificação (15min-2h)

**Documentação de referência:**
- `CHECKLIST_PRODUCAO_EMAILS.md`
- `GUIA_CONFIGURAR_RESEND.md`

**Limites (plano gratuito):**
- ✅ 3.000 emails/mês
- ✅ 100 emails/dia
- ✅ Suficiente para 100 cadastros/dia

---

### 🏗️ **FASE 1: Estrutura de Dados do Perfil** (1-2h)

1. [ ] **Criar tabela `portfolio_items`**
   ```sql
   - id (uuid)
   - user_id (uuid, FK profiles)
   - title (text)
   - description (text)
   - image_url (text)
   - category (text)
   - created_at (timestamp)
   ```

2. [ ] **Criar function `get_user_confraternity_stats(user_id)`**
   - Retorna: total_created, total_attended, total_photos, next_event

3. [ ] **Criar function `get_rating_stats(user_id)`**
   - Retorna: average_rating, total_reviews

4. [ ] **Criar `/lib/profile/queries.ts`**
   - Function `getUserProfileData(userId)`
   - Query master unificada

5. [ ] **Criar `/lib/profile/types.ts`**
   - Definir tipos TypeScript

**Arquivos a criar:**
- `supabase/migrations/[timestamp]_portfolio_items.sql`
- `supabase/migrations/[timestamp]_profile_functions.sql`
- `lib/profile/queries.ts`
- `lib/profile/types.ts`

---

### 🎨 **FASE 2: Componentes Visuais** (2-3h)

1. [ ] **Criar `components/profile/gamification-card.tsx`**
   - Patente atual com ícone
   - Próxima patente
   - Barra de progresso
   - Pontos atuais/necessários
   - Multiplicador do plano
   - Vigor total

2. [ ] **Criar `components/profile/medals-grid.tsx`**
   - Grid 4x4 de medalhas
   - Medalhas conquistadas: coloridas
   - Medalhas bloqueadas: opacas + cadeado
   - Tooltip com detalhes no hover
   - Barra de progresso
   - Contador X/16

3. [ ] **Criar `components/profile/confraternity-stats.tsx`**
   - Total criadas
   - Total participou
   - Total fotos
   - Próximo evento
   - Botões: Criar Evento | Ver Galeria

4. [ ] **Atualizar `ProfileHeader`**
   - Adicionar badge de plano no avatar
   - Manter design atual

**Arquivos a criar:**
- `components/profile/gamification-card.tsx`
- `components/profile/medals-grid.tsx`
- `components/profile/confraternity-stats.tsx`

---

### 🔗 **FASE 3: Integração** (1h)

1. [ ] **Atualizar `/app/professional/[id]/page.tsx`**
   - Integrar getUserProfileData()
   - Adicionar GamificationCard
   - Adicionar MedalsGrid
   - Adicionar ConfraternityStats

2. [ ] **Testar com 3 usuários**
   - Recruta (x1.0)
   - Veterano (x1.5)
   - Elite (x3.0)

3. [ ] **Ajustes visuais**
   - Responsividade
   - Cores e espaçamentos
   - Animações

**URLs de teste:**
- http://localhost:3001/professional/efed140e-14e1-456c-b6df-643c974106a3 (Recruta)
- http://localhost:3001/professional/458489a5-49d1-41a5-9d79-c36c0752e7b6 (Veterano)
- http://localhost:3001/professional/ccdc0524-6803-4017-b08c-944785e14338 (Elite)

---

### 🎮 **FASE 4: Triggers de Medalhas** (3-4h)

**Ordem de implementação:**

#### **Grupo 1: Medalhas de Perfil** (mais simples)
1. [ ] **Alistamento Concluído** (50 pts)
   - Trigger: Completar perfil (avatar + bio)
   - Arquivo: Trigger no UPDATE de profiles

2. [ ] **Batismo de Excelência** (150 pts)
   - Trigger: Preencher TODOS os campos do perfil
   - Arquivo: Trigger no UPDATE de profiles

#### **Grupo 2: Medalhas de Confraria** (módulo já existe)
3. [ ] **Anfitrião** (150 pts)
   - Trigger: Criar primeiro Confraternity
   - Arquivo: Trigger no INSERT de confraternities

4. [ ] **Presente** (50 pts)
   - Trigger: Aceitar primeiro convite
   - Arquivo: Trigger no UPDATE de confraternity_invites

5. [ ] **Cronista** (100 pts)
   - Trigger: Upload foto em Confraternity
   - Arquivo: Trigger no INSERT de confraternity_photos

6. [ ] **Líder de Confraria** (200 pts)
   - Trigger: Criar 10 Confraternities
   - Arquivo: Trigger no INSERT de confraternities (count)

#### **Grupo 3: Demais medalhas** (conforme necessidade)
7-16. [ ] Outras 10 medalhas
   - Priorizar conforme módulos disponíveis

**Arquivos a criar:**
- `supabase/migrations/[timestamp]_medal_triggers.sql`
- `lib/gamification/triggers.ts` (helpers)

---

### 🧪 **FASE 5: Testes Completos** (1-2h)

1. [ ] **Testar cada medalha implementada**
   - Alistamento Concluído
   - Batismo de Excelência
   - Anfitrião
   - Presente
   - Cronista
   - Líder de Confraria

2. [ ] **Validar pontos com multiplicadores**
   - Recruta: pts × 1.0
   - Veterano: pts × 1.5
   - Elite: pts × 3.0

3. [ ] **Validar subida de patente**
   - Novato (0 pts) → Guardião (100 pts)
   - Guardião → Lanceiro (300 pts)
   - etc.

4. [ ] **Validar exibição no perfil**
   - Medalhas aparecem coloridas
   - Contador X/16 atualiza
   - Barra de progresso correta
   - Tooltip funciona

**Documentação de testes:**
- `TESTES_MANUAIS_GAMIFICACAO.md`

---

## ⏰ ESTIMATIVA DE TEMPO:

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| ✅ Login | Sistema de auth definitivo | 1h (concluído) |
| 🔧 Emails | Configuração Resend | 1-2h |
| 🏗️ FASE 1 | Estrutura de dados | 1-2h |
| 🎨 FASE 2 | Componentes visuais | 2-3h |
| 🔗 FASE 3 | Integração | 1h |
| 🎮 FASE 4 | Triggers de medalhas | 3-4h |
| 🧪 FASE 5 | Testes completos | 1-2h |
| **TOTAL** | | **9-13h** |

---

## 📊 PROGRESSO:

- [x] ~~Sistema de Login~~ ✅
- [ ] Configuração de Emails (NOVO - PRIORITÁRIO)
- [ ] FASE 1: Estrutura de Dados
- [ ] FASE 2: Componentes
- [ ] FASE 3: Integração
- [ ] FASE 4: Triggers
- [ ] FASE 5: Testes

---

## 🛡️ PROTEÇÕES ATIVAS:

### **Sistema de Login:**
- ✅ Arquitetura híbrida implementada
- ✅ Backup automático em tags
- ✅ Script de rollback: `./scripts/rollback-auth.sh`
- ✅ Script de verificação: `./scripts/verify-auth.sh`
- ✅ Documentação: `/LOGIN_DEFINITIVO`

### **Regra de Ouro:**
⚠️ **NÃO MEXER EM:**
- `lib/auth/context.tsx`
- `app/auth/login/page.tsx`
- `app/auth/register/page.tsx`
- `middleware.ts`

---

## 📝 PRÓXIMOS STEPS:

### **Agora (Manhã):**
1. 🔧 Configurar Resend (PRIORITÁRIO)
2. 🏗️ Começar FASE 1

### **Depois (Tarde):**
3. 🎨 FASE 2 e 3
4. 🎮 FASE 4 (Triggers)
5. 🧪 FASE 5 (Testes)

---

## 🎯 OBJETIVO DO DIA:

**Sistema completo de perfis de usuário com:**
- ✅ Emails de confirmação funcionando
- ✅ Gamificação visual completa
- ✅ Medalhas funcionando
- ✅ Testes validados
- ✅ Pronto para produção

---

**Vamos nessa! 🚀**
