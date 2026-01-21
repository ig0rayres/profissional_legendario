# 🧠 CONTEXTO DO PROJETO - ROTA BUSINESS CLUB

*Última atualização: 21/01/2026 - 09:00*

> **INSTRUÇÃO:** No início de cada sessão, peça para o assistente ler este arquivo:
> `"leia o arquivo CONTEXTO_PROJETO.md"`

---

## 📋 SOBRE O PROJETO

**Nome:** Rota Business Club  
**Stack:** Next.js 14 + TypeScript + Supabase + Tailwind CSS  
**Descrição:** Plataforma de networking profissional com gamificação

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### ✅ Implementadas:
1. **Autenticação** - Login/registro com Supabase Auth, roles (admin/user)
2. **Perfis** - Slug personalizado, avatar/capa com crop, dados reais
3. **Gamificação** - XP, patentes, vigor mensal, medalhas
4. **Elos (Conexões)** - Solicitação, aceite/rejeição, realtime
5. **Chat** - Mensagens 1:1, upload de arquivos, emojis, **mensagens do sistema**
6. **Confrarias** - Convites, pontos, limites por plano
7. **Notificações** - Centro, realtime, sino no header, **modal de medalhas**
8. **Admin** - Dashboard, gestão de usuários e planos
9. **Histórico de Batalha** - Card com histórico mensal, patentes, ranking, medalhas
10. **Verificação por Gorra** - OpenAI Vision, webcam, câmera mobile, extração de ID
11. **Sistema de Medalhas Completo** 🆕 - Modal, chat, sino, multiplicadores

### 🔨 Em Desenvolvimento:
1. **Na Rota (Feed Social)** 🆕 - Posts de confrarias, likes, comentários
2. **Validação por IA** 🆕 - OpenAI Vision valida fotos de confrarias (2+ pessoas)

### 🚧 Pendentes:
1. **Emails de produção** - Configurar Resend
2. **Marketplace** - Produtos/serviços
3. **Eventos** - Criação e inscrições
4. **Pagamentos** - Gateway de pagamento

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
  /api/system-message  # 🆕 API para mensagens do sistema

/components
  /chat                # Chat widget (inclui suporte a sistema)
  /profile             # Componentes de perfil
  /gamification        # Patentes, medalhas, histórico, badge-unlock-modal
  /notifications       # Centro de notificações

/lib
  /auth                # Contexto de autenticação
  /supabase            # Cliente Supabase
  /api/gamification.ts # 🔥 Função central awardBadge()

/docs                  # Documentação
  RESUMO_*.md          # Resumos diários
  SISTEMA_MEDALHAS.md  # 🆕 Regras do sistema de medalhas
```

---

## 🔧 COMANDOS ÚTEIS

```bash
# Rodar projeto
npm run dev

# Rodar acessível externamente
npm run dev -- --hostname 0.0.0.0

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

---

## 📝 DOCUMENTAÇÃO DISPONÍVEL

- `docs/RESUMO_2026-01-20.md` - Sistema de notificações de medalhas
- `docs/RESUMO_2026-01-19.md` - Histórico de Batalha
- `docs/SISTEMA_MEDALHAS.md` - 🆕 Regras completas de medalhas
- `docs/PLANO_ACOES.md` - Pendências atualizadas

---

## 🎨 DESIGN

- **Cores primárias:** Verde (#166534), Laranja (accent)
- **Font:** Inter
- **Tema:** Dark mode com glassmorphism
- **Logo:** Rota Business Club (laranja + verde)
- **Modal de Medalha:** Verde escuro + laranja, estilo militar/valente

---

## 📅 HISTÓRICO RECENTE

### 20/01/2026 (Noite):
- **Sistema de Notificações de Medalhas** 🆕
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
| `badge-unlock-modal.tsx` | 🆕 Modal de conquista com confetti |
| `battle-history.tsx` | Histórico mensal com patentes, ranking |
| `medal-badge.tsx` | Badge visual de medalha |
| `rank-insignia.tsx` | Insígnia da patente |
| `gamification-card.tsx` | Card resumo de gamificação |
| `gorra-ocr.tsx` | Upload/webcam/câmera + OCR |

---

## 📊 SCRIPTS SQL IMPORTANTES

| Script | Descrição |
|--------|-----------|
| `CRIAR_USUARIO_SISTEMA.sql` | 🆕 Cria usuário sistema para chat |
| `REMOVER_MEDALHA_TESTE.sql` | Remove medalha para reteste |
| `GERAR_HISTORICO_FICTO.sql` | Dados de teste para histórico |
| `ADICIONAR_MEDALHAS.sql` | Sincronizar medalhas |

---

## 🔗 APIs IMPORTANTES

| Rota | Descrição |
|------|-----------|
| `POST /api/system-message` | 🆕 Envia mensagem do sistema (bypassa RLS) |
| `POST /api/ocr/gorra` | Extrai ID da gorra via OpenAI Vision |

---

## ⚙️ VARIÁVEIS DE AMBIENTE

```bash
# .env.local (necessárias)
OPENAI_API_KEY=sk-proj-...          # OpenAI Vision para OCR
SUPABASE_SERVICE_ROLE_KEY=...       # 🆕 Para API system-message
# ... outras variáveis do Supabase
```

---

## 🎯 PRÓXIMA SESSÃO (21/01)

1. **Testar todas as medalhas**:
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

2. **Verificar triggers** - Garantir que usam `awardBadge()`

3. **Testar multiplicadores** - Verificar valores com diferentes planos

---

**Dica:** Mantenha este arquivo atualizado ao final de cada sessão!
