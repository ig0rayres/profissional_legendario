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
| **Design System** | [BRAND_GUIDELINES.md](../documentation/BRAND_GUIDELINES.md) |
| **Brasão** | `/images/brasao-rota.png` (Ícone oficial limpo) |
| **Logo** | `/images/logo-rotabusiness.png` (Ícone + Texto) |

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
  /social                 # 📱 FEED NA ROTA - posts, confrarias
  /confraternity          # Formulários de confraria

/lib
  /auth/context.tsx       # ⚠️ NÃO MODIFICAR sem necessidade
  /supabase/client.ts     # Cliente browser
  /supabase/server.ts     # Cliente server
  /api/gamification.ts    # 🔥 Função awardBadge() - USAR SEMPRE
  /api/confraternity.ts   # 🔥 Funções de confraria

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
- **Confrarias** - Convites, completar, pontos, limites por plano ✅ ATUALIZADO
- **Feed Na Rota** - Posts de confraria, fotos, curtidas ✅ ATUALIZADO
- **Notificações** - Centro + sino + modal de medalhas
- **Admin** - Dashboard, gestão de usuários e planos
- **Verificação Gorra** - OCR com OpenAI Vision
- **Deploy** - Produção online e configurado

### 🚧 Pendentes
- Stripe (gateway de pagamento)
- Marketplace (produtos/serviços)
- Eventos (criação e inscrições)
- Pontos automáticos para parceiro de confraria

---

## 📅 ÚLTIMA SESSÃO: 26/01/2026 (23:48)

### 🎯 PONTO DE RETOMADA

**O que foi implementado:**
1. ✅ Posts de confraria aparecem no feed de AMBOS participantes
2. ✅ Visual especial com banner laranja "CONFRARIA"
3. ✅ Selo grande no lado direito
4. ✅ Avatares duplos sobrepostos
5. ✅ Nome "Fulano e Beltrano" no header
6. ✅ Data do encontro no banner
7. ✅ Card de confraria some após completar
8. ✅ Data/hora nos posts

**O que testar:**
```sql
-- Limpar dados de teste
DELETE FROM posts WHERE confraternity_id IS NOT NULL;
DELETE FROM confraternities;
DELETE FROM confraternity_invites;
```

Fluxo: Veterano envia → Recruta aceita → Recruta completa → Post aparece para ambos

**Próximos passos:**
- Pontos automáticos para parceiro (atualmente só quem completa ganha)
- Notificações de comentário
- Melhorias UX no feed

**Feedback do usuário para corrigir:**
- [ ] Menos laranja no banner/selo de confraria
- [ ] Link no nome e avatar das postagens (ir para perfil)
- [ ] Pontos de quem escreveu a postagem (Recruta OK, Veterano não recebeu)
- [ ] Melhorar badge/selo de confraria (visual)

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

---

## 🤝 SISTEMA DE CONFRARIAS ✅ ATUALIZADO

### Fluxo Completo
```
1. Veterano envia convite (+10 XP)
2. Recruta aceita convite (+10 XP)
3. Recruta (ou Veterano) completa:
   - Upload de foto ✅
   - Depoimento ✅
   - Data do encontro ✅
4. Post criado aparece no feed de AMBOS
5. Status do invite → "completed"
6. Card de confraria some do painel
```

### Pontos de Confraria
| Ação | XP |
|------|-----|
| Enviar convite | +10 |
| Aceitar convite | +10 |
| Completar (base) | +50 |
| Cada foto válida | +20 |
| Depoimento | +15 |

### Arquivos Importantes
| Arquivo | Função |
|---------|--------|
| `lib/api/confraternity.ts` | Lógica de backend |
| `components/confraternity/ConfraternityCompleteForm.tsx` | Formulário |
| `components/social/post-card.tsx` | Visual do post |
| `components/profile/na-rota-feed-v13-social.tsx` | Feed |

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

# Conectar ao banco
source <(cat ~/.gemini/credentials.enc | base64 -d) && PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h $SUPABASE_DB_HOST -p 5432 -d postgres -U postgres
```

---

## 📊 USUÁRIOS DE TESTE

| Nome | Role | Plano | ID |
|------|------|-------|----|
| Recruta Teste | user | Recruta | d1cd4db4-b79f-4ef1-9724-9d80f458aed8 |
| Veterano Teste | user | Veterano | (verificar no banco) |

---

## 🔗 APIs IMPORTANTES

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/system-message` | POST | Envia mensagem do sistema (bypassa RLS) |
| `/api/ocr/gorra` | POST | Extrai ID da gorra via OpenAI Vision |
| `/api/profile/me` | GET | Perfil do usuário logado |
| `/api/validate-confraternity` | POST | Valida foto de confraria com IA |
| `/api/gamification/award-points` | POST | Credita pontos |

---

## 🗄️ BANCO DE DADOS - TABELAS IMPORTANTES

### confraternity_invites
- `status`: 'pending' → 'accepted' → 'completed'
- `sender_id`, `receiver_id` - IDs dos participantes
- `proposed_date` - Data proposta

### confraternities
- `member1_id`, `member2_id` - IDs dos participantes
- `date_occurred` - Data do encontro
- `photos` - JSONB com URLs
- `post_id` - ID do post criado

### posts
- `confraternity_id` - Se é post de confraria
- `media_urls` - JSONB com URLs das fotos
- `user_id` - Quem criou

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

## � DOCUMENTAÇÃO DETALHADA

| Arquivo | Conteúdo |
|---------|----------|
| `CONTEXTO_PROJETO.md` | Contexto completo + ponto de retomada |
| `docs/GUIA_DEPLOY_VERCEL.md` | Guia de deploy + troubleshooting |
| `docs/SISTEMA_MEDALHAS.md` | Regras completas de medalhas |

---

*Mantenha este arquivo sincronizado com `CONTEXTO_PROJETO.md`*
