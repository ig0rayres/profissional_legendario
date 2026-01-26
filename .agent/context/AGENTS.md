# 🤖 AGENTS.md - Rota Business Club

> **Guia otimizado para agentes de IA.** Leia este arquivo no início de cada sessão.

---

## 📋 RESUMO DO PROJETO

| Campo | Valor |
|-------|-------|
| **Nome** | Rota Business Club |
| **Stack** | Next.js 14 + TypeScript + Supabase + Tailwind CSS |
| **Tipo** | Plataforma de networking profissional com gamificação |
| **URL Produção** | https://rotabusinessclub.com.br |
| **Hospedagem** | Vercel (Hobby) + Cloudflare (DNS/CDN) |
| **Email** | Resend (via Supabase SMTP) |

---

## 🏗️ ARQUITETURA

```
/app                      # App Router (Next.js 14)
  /auth                   # Login, registro, reset password
  /dashboard              # Área logada do usuário
  /admin                  # Painel administrativo
  /[slug]/[rotaNumber]    # Perfis públicos (URL amigável)
  /professionals          # Lista de membros
  /api/*                  # API Routes

/components               # Componentes React
  /chat                   # Widget de chat 1:1
  /profile                # Avatar, capa, dados de perfil
  /gamification           # Patentes, medalhas, histórico
  /notifications          # Centro de notificações

/lib
  /auth/context.tsx       # ⚠️ NÃO MODIFICAR sem necessidade
  /supabase/client.ts     # Cliente browser
  /supabase/server.ts     # Cliente server
  /api/gamification.ts    # 🔥 Função awardBadge() - USAR SEMPRE

/docs                     # Documentação detalhada
```

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### ✅ Implementadas
- **Autenticação** - Supabase Auth com roles (admin/user)
- **Perfis** - Slug personalizado, avatar/capa com crop
- **Gamificação** - XP, patentes, vigor mensal, medalhas
- **Elos (Conexões)** - Solicitação, aceite/rejeição, realtime
- **Chat** - Mensagens 1:1, arquivos, emojis, mensagens do sistema
- **Confrarias** - Convites, pontos, limites por plano
- **Notificações** - Centro + sino + modal de medalhas
- **Admin** - Dashboard, gestão de usuários e planos
- **Verificação Gorra** - OCR com OpenAI Vision
- **Deploy** - Produção online e configurado

### 🚧 Pendentes
- Stripe (gateway de pagamento)
- Marketplace (produtos/serviços)
- Eventos (criação e inscrições)

---

## 🏅 SISTEMA DE MEDALHAS

### Função Única para Conceder Medalhas
```typescript
import { awardBadge } from '@/lib/api/gamification'

// SEMPRE usar esta função:
await awardBadge(userId, 'medal_id')
```

### Efeitos Automáticos
1. Multiplicador do plano aplicado (Recruta x1, Veterano x1.5, Elite x3)
2. Modal com confetti exibido
3. Notificação no sino
4. Mensagem no chat do sistema
5. Badge de não lidas atualizado
6. Registro em `user_medals` e `points_history`

### Usuário Sistema (Chat)
- **ID:** `00000000-0000-0000-0000-000000000000`
- **Nome:** Rota Business Club
- **Avatar:** `/logo-rota-icon.png`

---

## ⚠️ REGRAS CRÍTICAS

1. **NÃO MEXER** em `lib/auth/context.tsx` sem necessidade absoluta
2. **SEMPRE** usar `.maybeSingle()` ao invés de `.single()` em queries Supabase
3. **SEMPRE** criar backup antes de alterações críticas no banco
4. **SEMPRE** testar login após mudanças em autenticação
5. **SEMPRE** usar `awardBadge()` para conceder medalhas
6. **NUNCA** inserir diretamente em `user_medals` ou `points_history`
7. **SEMPRE** testar `npm run build` antes de fazer deploy

---

## 🔧 COMANDOS

```bash
# Desenvolvimento
npm run dev

# Build local (OBRIGATÓRIO antes de deploy)
npm run build

# Rodar acessível na rede
npm run dev -- --hostname 0.0.0.0
```

---

## 📊 USUÁRIOS DE TESTE

| Nome | Role | Plano | Multiplicador |
|------|------|-------|---------------|
| Usuario Recruta | user | Recruta | x1 |
| Usuario Veterano | user | Veterano | x1.5 |
| Usuario Elite_Mod | user | Elite | x3 |

---

## 🔗 APIs IMPORTANTES

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/system-message` | POST | Envia mensagem do sistema (bypassa RLS) |
| `/api/ocr/gorra` | POST | Extrai ID da gorra via OpenAI Vision |
| `/api/profile/me` | GET | Perfil do usuário logado |
| `/api/profile/[id]` | GET | Perfil por ID |

---

## ⚙️ VARIÁVEIS DE AMBIENTE

### Obrigatórias
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Opcionais
```bash
OPENAI_API_KEY=sk-proj-...    # OCR Gorra
STRIPE_SECRET_KEY=sk_...      # Pagamentos (futuro)
RESEND_API_KEY=re_...         # Email (configurado no Supabase)
```

---

## 🎨 DESIGN SYSTEM

| Aspecto | Valor |
|---------|-------|
| **Cor Primária** | Verde (#166534) |
| **Cor Accent** | Laranja |
| **Font** | Inter |
| **Tema** | Dark mode com glassmorphism |
| **Estilo** | Militar/valente |

---

## 📚 DOCUMENTAÇÃO DETALHADA

| Arquivo | Conteúdo |
|---------|----------|
| `CONTEXTO_PROJETO.md` | Contexto completo do projeto |
| `docs/GUIA_DEPLOY_VERCEL.md` | Guia de deploy + troubleshooting |
| `docs/SISTEMA_MEDALHAS.md` | Regras completas de medalhas |
| `docs/RESUMO_*.md` | Resumos de sessões anteriores |

---

## 🚀 DEPLOY

**Status:** ✅ ONLINE

```bash
# 1. Build local
npm run build

# 2. Se passar, commit e push
git add -A && git commit -m "feat: descrição" && git push

# 3. Vercel faz deploy automático
```

---

## 📅 ÚLTIMA SESSÃO: 25/01/2026

### 🎨 Painel do Usuário - Redesign

**Componentes V2 Premium:**
- `projects-counter-v2.tsx` - Contador de projetos
- `elos-da-rota-v2.tsx` - Conexões com patentes
- `confraternity-stats-v2.tsx` - Confrarias estilizadas
- `user-mural-v2.tsx` - Feed "Na Rota" com timeline

**3 Variações de Design:**
| Versão | Estilo |
|--------|--------|
| V3 | Militar (fundo escuro) |
| V4 | Executivo (profissional) |
| V5 | Elegante (minimalista) |

**Páginas de Demo:**
- `/demo-v2` - Preview V2 sem login
- `/demo-versoes` - Comparador V3/V4/V5

**Próximo:** Escolher layout final e aplicar no dashboard!

---

*Mantenha este arquivo sincronizado com `CONTEXTO_PROJETO.md`*

