# 🧠 CONTEXTO DO PROJETO - ROTA BUSINESS CLUB

*Última atualização: 19/01/2026*

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
5. **Chat** - Mensagens 1:1, upload de arquivos, emojis
6. **Confrarias** - Convites, pontos, limites por plano
7. **Notificações** - Centro, realtime, sino no header
8. **Admin** - Dashboard, gestão de usuários e planos
9. **Histórico de Batalha** - Card com histórico mensal, patentes, ranking, medalhas

### 🚧 Pendentes:
1. **Emails de produção** - Configurar Resend
2. **Triggers de medalhas** - 6 medalhas principais
3. **Marketplace** - Produtos/serviços
4. **Eventos** - Criação e inscrições
5. **Pagamentos** - Gateway de pagamento
6. **Testar Histórico de Batalha** - Validar visual e dados

---

## 📁 ESTRUTURA IMPORTANTE

```
/app                    # Páginas Next.js
  /auth                 # Login, registro
  /dashboard            # Área logada
  /admin               # Painel admin
  /[slug]/[rotaNumber] # Perfis públicos
  /professionals       # Lista de membros

/components
  /chat                # Chat widget
  /profile             # Componentes de perfil
  /gamification        # Patentes, medalhas, histórico
  /notifications       # Centro de notificações

/lib
  /auth                # Contexto de autenticação
  /supabase            # Cliente Supabase
  /profile             # Utils e tipos

/docs                  # Documentação
  RESUMO_*.md          # Resumos diários
  PLANO_ACOES.md       # Pendências
  CHAT_DOCUMENTATION.md
```

---

## 🔧 COMANDOS ÚTEIS

```bash
# Rodar projeto
npm run dev

# Verificar auth
./scripts/verify-auth.sh

# Rollback auth (emergência)
./scripts/rollback-auth.sh
```

---

## 📊 USUÁRIOS DE TESTE

| Nome | Role | Rota Number |
|------|------|-------------|
| Usuario Recruta | user | 0000001 |
| Usuario Veterano | user | 000002 |
| Usuario Elite_Mod | user | 000003 |

---

## 🛡️ REGRAS IMPORTANTES

1. **NÃO MEXER** em `lib/auth/context.tsx` sem necessidade
2. **SEMPRE** usar `.maybeSingle()` ao invés de `.single()`
3. **SEMPRE** criar backup antes de alterações críticas
4. **SEMPRE** testar login após mudanças em auth

---

## 📝 DOCUMENTAÇÃO DISPONÍVEL

- `docs/RESUMO_2026-01-19.md` - Sessão atual
- `docs/RESUMO_2026-01-18.md` - Sessão anterior
- `docs/PLANO_ACOES.md` - Pendências atualizadas
- `docs/CHAT_DOCUMENTATION.md` - Sistema de chat
- `docs/GAMIFICATION_USER_GUIDE.md` - Guia de gamificação
- `docs/RESOLUCAO_LOGIN_2026-01-17.md` - Bug de login resolvido

---

## 🎨 DESIGN

- **Cores primárias:** Verde (#166534), Laranja (accent)
- **Font:** Inter
- **Tema:** Dark mode com glassmorphism
- **Logo:** Rota Business Club (laranja + verde)

---

## 📅 HISTÓRICO RECENTE

### 19/01/2026:
- **Histórico de Batalha** - Novo componente `battle-history.tsx`
  - Coluna de Ranking com destaque Top 3 (🏆 ouro, prata, bronze)
  - Badge de patente 20% maior
  - Animações elegantes (hover, dropdown, glow)
  - Tooltips que não são cortados pelo card
  - Dropdown de medalhas com slide-in animado
- **Script SQL** - `GERAR_HISTORICO_FICTO.sql` 
  - Gera dados de teste para 24 meses (2024-2025)
  - Todas as 6 patentes aparecem
  - Confrarias distribuídas por mês
  - Posições de ranking realistas
- **Correções** - Query de confrarias corrigida (member1_id, member2_id)

### 18/01/2026:
- Chat com upload de arquivos
- Header reorganizado (sino laranja)
- Profissionais com dados reais
- Elos com realtime
- Crop de capa interativo

### 17/01/2026:
- Resolução definitiva do bug de login
- Sistema de backup de auth
- Documentação completa

---

## 📦 COMPONENTES DE GAMIFICAÇÃO

| Componente | Descrição |
|------------|-----------|
| `battle-history.tsx` | Histórico mensal com patentes, ranking, medalhas, confrarias |
| `medal-badge.tsx` | Badge visual de medalha |
| `rank-insignia.tsx` | Insígnia da patente |
| `gamification-card.tsx` | Card resumo de gamificação |
| `medals-grid.tsx` | Grid de medalhas conquistadas |

---

## 📊 SCRIPTS SQL IMPORTANTES

| Script | Descrição |
|--------|-----------|
| `GERAR_HISTORICO_FICTO.sql` | Gerar dados de teste para histórico |
| `RESET_ELOS.sql` | Resetar conexões |
| `RESET_NOTIFICACOES.sql` | Limpar notificações |

---

**Dica:** Mantenha este arquivo atualizado ao final de cada sessão!
