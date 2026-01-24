# 🧠 CONTEXTO DO PROJETO - ROTA BUSINESS CLUB

*Última atualização: 24/01/2026 - 00:18*

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
- **Credenciais (criptografadas):** `/home/igor/.gemini/credentials.enc`
- **Host:** db.erzprkocwzgdjrsictps.supabase.co
- **Porta:** 5432
- **Decodificar:** `cat /home/igor/.gemini/credentials.enc | base64 -d`
- **Conectar:** `source <(cat ~/.gemini/credentials.enc | base64 -d) && PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p 5432 -d postgres -U postgres`

**🔐 Credenciais do Sistema:**
- **Sudo password:** Armazenado em `~/.gemini/credentials.enc` (base64)

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### ✅ Implementadas:
1. **Autenticação** - Login/registro com Supabase Auth, roles (admin/user)
2. **Perfis** - Slug personalizado, avatar/capa com crop, dados reais, **layouts V4/V6** 🆕
3. **Gamificação** - **Sistema completo recriado do zero** 🆕, XP, patentes, vigor, medalhas, anti-farming
4. **Elos (Conexões)** - Solicitação, aceite/rejeição, realtime, **+10 XP ao enviar** 🆕
5. **Chat** - Mensagens 1:1, upload de arquivos, emojis, **mensagens do sistema**
6. **Confrarias** - Convites, pontos, limites por plano
7. **Notificações** - Centro, realtime, sino no header, **modal de medalhas**
8. **Admin** - Dashboard, gestão de usuários e planos
9. **Histórico de Batalha** - Card com histórico mensal, patentes, ranking, medalhas  
10. **Verificação por Gorra** - OpenAI Vision, webcam, câmera mobile, extração de ID
11. **Sistema de Medalhas Completo** - Modal, chat, sino, multiplicadores
12. **Deploy Production** - Vercel + Cloudflare configurados
13. **Stripe Payments** 🆕 - **COMPLETO**: Checkout, webhooks, portal do cliente, assinaturas  
    - 💚 Recruta: R$ 0,00 (gratuito) • 🔵 Veterano: R$ 97,90/mês • 👑 Elite: R$ 127,90/mês
14. **Perfis V6** 🆕 - Novo layout com glass morphism, cards de stats, visual premium

### 🔨 Em Desenvolvimento:
1. **Na Rota (Feed Social)** - Posts de confrarias, likes, comentários
2. **Validação por IA** - OpenAI Vision valida fotos de confrarias (2+ pessoas)

### 🚧 Pendentes:
1. **Resend upgrade** - Pro ($20/mês) antes do evento de lançamento
2. **Marketplace** - Produtos/serviços
3. **Eventos** - Criação e inscrições
4. **Primary Domain** - Marcar rotabusinessclub.com.br como primário no Vercel

---

## 🏅 SISTEMA DE MEDALHAS (IMPORTANTE!)

### Função Central
```typescript
import { awardBadge } from '@/lib/api/gamification'

// ÚNICA FORMA DE CONCEDER MEDALHAS:
await awardBadge(userId, 'medal_id')
```

### O que acontece automaticamente:
1. ✅ Multiplicador do plano (Recruta x1, Veterano x1.5, Elite x3)
2. ✅ Modal central com confetti
3. ✅ Notificação no sino
4. ✅ Mensagem no chat do sistema ("Rota Business Club")
5. ✅ Badge de não lidas no chat
6. ✅ Registro em user_medals e points_history

### Usuário Sistema (Chat)
- **ID:** `00000000-0000-0000-0000-000000000000`
- **Nome:** Rota Business Club
- **Avatar:** `/logo-rota-icon.png`

### Documentação Completa
Ver: `docs/SISTEMA_MEDALHAS.md`

---

## 📁 ESTRUTURA IMPORTANTE

```
/app                    # Páginas Next.js
  /auth                 # Login, registro
  /dashboard            # Área logada
  /admin               # Painel admin
  /[slug]/[rotaNumber] # Perfis públicos
  /professionals       # Lista de membros
  /api/system-message  # API para mensagens do sistema

/components
  /chat                # Chat widget (inclui suporte a sistema)
  /profile             # Componentes de perfil
  /gamification        # Patentes, medalhas, histórico, badge-unlock-modal
  /notifications       # Centro de notificações

/lib
  /auth                # Contexto de autenticação
  /supabase            # Cliente Supabase (client/server)
  /api/gamification.ts # 🔥 Função central awardBadge()

/docs                  # Documentação
  GUIA_DEPLOY_VERCEL.md  # 🆕 Guia completo de deploy
  RESUMO_2026-01-21.md   # 🆕 Sessão de deploy (17 commits!)
  SISTEMA_MEDALHAS.md    # Regras do sistema de medalhas
  RESUMO_*.md            # Resumos de outras sessões
```

---

## 🔧 COMANDOS ÚTEIS

```bash
# Desenvolvimento local
npm run dev

# Rodar acessível externamente
npm run dev -- --hostname 0.0.0.0

# Build local (SEMPRE testar antes de deploy!)
npm run build

# Verificar auth
./scripts/verify-auth.sh
```

---

## 📊 USUÁRIOS DE TESTE

| Nome | Role | Plano | Multiplicador |
|------|------|-------|---------------|
| Usuario Recruta | user | Recruta | x1 |
| Usuario Veterano | user | Veterano | x1.5 |
| Usuario Elite_Mod | user | Elite | x3 |

---

## 🛡️ REGRAS IMPORTANTES

1. **NÃO MEXER** em `lib/auth/context.tsx` sem necessidade
2. **SEMPRE** usar `.maybeSingle()` ao invés de `.single()`
3. **SEMPRE** criar backup antes de alterações críticas
4. **SEMPRE** testar login após mudanças em auth
5. **SEMPRE** usar `awardBadge()` para conceder medalhas
6. **NUNCA** inserir diretamente em user_medals ou points_history para medalhas
7. **SEMPRE** testar `npm run build` local antes de fazer deploy 🆕

---

## 📝 DOCUMENTAÇÃO DISPONÍVEL

> **Localização:** Documentação em `/docs/` organizada por categoria

### Estrutura:
| Pasta | Conteúdo |
|-------|----------|
| `docs/guides/` | Guias práticos (deploy, testes, credenciais) |
| `docs/architecture/` | Arquitetura e regras de negócio |
| `docs/sessions/` | Resumos de sessões e changelogs |
| `docs/troubleshooting/` | Solução de problemas |

### Docs mais importantes:
- `docs/guides/GUIA_DEPLOY_VERCEL.md` - Guia completo de deploy
- `docs/architecture/SISTEMA_MEDALHAS.md` - Regras de medalhas
- `docs/sessions/RESUMO_*.md` - Resumos de sessões

### Time de IA:
- `.agent/context/CONTEXTO_PROJETO.md` - **Este arquivo**
- `.agent/context/AGENTS.md` - Guia rápido
- `.agent/team/ESPECIALISTAS.md` - Perfis do time virtual
- `.agent/workflows/` - Comandos de ativação

---

## 🎨 DESIGN

- **Cores primárias:** Verde (#166534), Laranja (accent)
- **Font:** Inter
- **Tema:** Dark mode com glassmorphism
- **Logo:** Rota Business Club (laranja + verde)
- **Modal de Medalha:** Verde escuro + laranja, estilo militar/valente

---

## 📅 HISTÓRICO RECENTE

### 24/01/2026 (Madrugada): 🚀 MEGA UPDATE!
- **STRIPE INTEGRAÇÃO COMPLETA** ✅
  - API Routes: create-checkout-session, webhook, portal, status
  - Webhook processando todos os eventos importantes
  - Customer Portal funcionando (gerenciar assinatura)
  - Tabela subscriptions totalmente integrada
  - Componentes: StripeCheckoutButton, SubscriptionManager
  - Páginas: /checkout/success, /checkout/cancel
  - **PRONTO PARA PRODUÇÃO** (modo test primeiro)

- **ROTA DO VALENTE - RECRIAÇÃO COMPLETA** ✅
  - Sistema de gamificação reconstruído do zero
  - 5 Patentes (Novato → Lendário)
  - 10+ Medalhas configuradas
  - API functions: awardPoints, awardBadge, checkUserProgress
  - Anti-farming: previne duplicação de XP
  - XP automático para: Criar Elo (+10), Aceitar Elo (+5), Confraria, etc
  - Funções: lib/api/gamification.ts
  - Componentes: rank-insignia, medal-badge, battle-history

- **PERFIS V6 - MIGRAÇÃO COMPLETA** ✅
  - 2 Demos criados: /demo/header-4 e /demo/header-6
  - Header V6 Complete: improved-current-header-v6-complete.tsx
  - Features:
    - Avatar quadrado (rounded-2xl) com borda laranja
    - Badge patente com glass effect
    - Cards: Vigor, Medalhas, ID Rota
    - Medalhas reais renderizadas
    - Upload de capa funcional
    - Background pattern quando sem capa
  - Botões de ação estilizados (profile-action-buttons-v6.tsx)
  - 2 Templates completos: profile-page-template-v4/v6.tsx
  - Rotas de teste: /teste-v4/[rotaNumber], /teste-v6/[rotaNumber]
  - Backup completo em .backups/profile-logic-20260124/
  - Documentação: SESSION_STATUS.md, NEXT_SESSION_PLAN.md

### 23/01/2026: 💳 STRIPE INTEGRADO!
- **Checkout de Assinaturas** ✅
  - Stripe Checkout funcionando
  - Webhooks processando eventos corretamente
  - Tabela `subscriptions` atualizada via webhook
  - Planos (Veterano/Elite) sendo creditados automaticamente
  - Redirecionamento para URL correta após pagamento
- **Correções técnicas:**
  - Campo `plan_id` usa TIER (string), não UUID
  - API version atualizada para `2024-12-18.acacia`
  - Variável `NEXT_PUBLIC_APP_URL` configurada

### 21/01/2026 (Tarde): 🚀
- **DEPLOY EM PRODUÇÃO** ✅
  - 17 commits de correção
  - Site no ar: https://rotabusinessclub.vercel.app
  - Cloudflare configurado (DNS, email routing)
  - Vercel configurado (env vars, cron diário)
  - Guia completo de deploy criado
  - Todos os erros de TypeScript resolvidos
  - Componente `radio-group` criado
  - Configuração Next.js otimizada

### 20/01/2026 (Noite):
- **Sistema de Notificações de Medalhas**
  - Modal épico com confetti e design Rota
  - Notificação no sino com valor multiplicado
  - Mensagens automáticas no chat do sistema
  - Usuário sistema "Rota Business Club" criado
  - API `/api/system-message` para bypassar RLS
  - Badge de não lidas funcionando
  - Documentação completa em `SISTEMA_MEDALHAS.md`

### 20/01/2026 (Manhã):
- **Sistema de Verificação por Foto da Gorra**
  - OpenAI Vision (GPT-4o-mini) para extração de ID
  - Componente `GorraOCR` completo

### 19/01/2026:
- **Histórico de Batalha** - Componente `battle-history.tsx`
- Ranking com Top 3, patentes, animações

---

## 📦 COMPONENTES DE GAMIFICAÇÃO

| Componente | Descrição |
|------------|-----------|
| `badge-unlock-modal.tsx` | Modal de conquista com confetti |
| `battle-history.tsx` | Histórico mensal com patentes, ranking |
| `medal-badge.tsx` | Badge visual de medalha |
| `rank-insignia.tsx` | Insígnia da patente |
| `gamification-card.tsx` | Card resumo de gamificação |
| `gorra-ocr.tsx` | Upload/webcam/câmera + OCR |

---

## 📊 SCRIPTS SQL IMPORTANTES

> **Localização:** Todos os scripts SQL estão em `/sql/` organizados por categoria

| Pasta | Descrição |
|-------|-----------|
| `sql/seeds/` | Criação de dados (usuários, medalhas, config) |
| `sql/deploy/` | Scripts de deploy por feature |
| `sql/migrations/` | Alterações de schema |
| `sql/maintenance/` | Correções e limpeza |
| `sql/debug/` | Diagnóstico e verificações |
| `sql/tests/` | Testes SQL |

### Scripts mais usados:
| Script | Localização |
|--------|-------------|
| `CRIAR_USUARIO_SISTEMA.sql` | `sql/seeds/` |
| `REMOVER_MEDALHA_TESTE.sql` | `sql/maintenance/` |
| `GERAR_HISTORICO_FICTO.sql` | `sql/seeds/` |
| `ADICIONAR_MEDALHAS.sql` | `sql/seeds/` |

---

## 🔗 APIs IMPORTANTES

| Rota | Descrição |
|------|-----------|
| `POST /api/system-message` | Envia mensagem do sistema (bypassa RLS) |
| `POST /api/ocr/gorra` | Extrai ID da gorra via OpenAI Vision |

---

## ⚙️ VARIÁVEIS DE AMBIENTE

### Desenvolvimento (.env.local)
```bash
OPENAI_API_KEY=sk-proj-...          # OpenAI Vision para OCR
SUPABASE_SERVICE_ROLE_KEY=...       # Para API system-message
# ... outras variáveis do Supabase
```

### Produção (Vercel) 🆕
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # Service role key
```

**Opcional (adicionar depois):**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

---

## 🎯 PRÓXIMA SESSÃO

### Imediato
1. [ ] **Domínio Customizado**
   - Adicionar no Vercel: `rotabusinessclub.com.br` e `www.`
   - Configurar CNAME no Cloudflare
   - Aguardar propagação

2. [ ] **Email de Produção**
   - Verificar domínio no Resend
   - Configurar SMTP no Supabase
   - Testar envio de emails

### Curto Prazo
3. [ ] **Stripe**
   - Criar conta
   - Configurar produtos/preços
   - Implementar checkout

4. [ ] **Testar todas as medalhas** em produção:
   - [ ] `alistamento_concluido` ✅
   - [ ] `presente`
   - [ ] `primeira_confraria`
   - [ ] `anfitriao`
   - [ ] `cronista`
   - [ ] `networker_ativo`
   - [ ] `lider_confraria`
   - [ ] `mestre_conexoes`
   - [ ] `batismo_excelencia`
   - [ ] `cinegrafista_campo`

---

## 🚀 DEPLOY

**Status:** ✅ ONLINE  
**Guia Completo:** Ver `docs/GUIA_DEPLOY_VERCEL.md`

### Quick Reference:
```bash
# Build local
npm run build

# Se passar, commit e push
git add -A
git commit -m "feat: nova funcionalidade"
git push origin main

# Vercel faz deploy automático!
```

### Troubleshooting:
1. Ver logs no Vercel → Deployments
2. Consultar `docs/GUIA_DEPLOY_VERCEL.md`
3. Verificar checklist pré-deploy

---

**Dica:** Mantenha este arquivo atualizado ao final de cada sessão!

