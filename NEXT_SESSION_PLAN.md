# 📋 PLANO DE TRABALHO - Próxima Sessão

**Data prevista:** 24/01/2026 (manhã)
**Sessão:** Continuação V6 Migration + Gamificação + Rebrand

---

## 🎯 OBJETIVOS PRIORITÁRIOS

### 1. 🎮 **Testar Sistema de Gamificação Completo**
**Componente:** Rota do Valente
**Localização:** `components/profile/rota-valente-card.tsx`

#### Testes necessários:
- [ ] Verificar cálculo de pontos (Vigor)
- [ ] Testar progressão de patentes
- [ ] Validar conquista de medalhas
- [ ] Conferir histórico de atividades
- [ ] Testar sistema de ranks
- [ ] Verificar XP por ações:
  - [ ] Criar Elo (+10 XP)
  - [ ] Aceitar Elo (+5 XP)
  - [ ] Participar de Confraria
  - [ ] Receber avaliação
  - [ ] Dar avaliação

#### Possíveis ajustes:
- Balanceamento de pontos
- Correção de bugs de duplicação
- Otimização de queries

---

### 2. 🎨 **Ajustar Card "Rota do Valente" no Perfil**
**Arquivo:** `components/profile/rota-valente-card.tsx`

#### O que ajustar:
- [ ] **Visual:** Seguir padrão V6 (glass morphism, cores, transparência)
- [ ] **Layout:** Melhorar organização de informações
- [ ] **Dados:** Garantir que mostra:
  - Pontos atuais
  - Progresso para próxima patente
  - Medalhas recentes
  - Atividades recentes
- [ ] **Responsividade:** Mobile-first
- [ ] **Interatividade:** Hover states, tooltips

#### Mockup mental:
```
┌─────────────────────────────────────────┐
│ 🏔️ ROTA DO VALENTE          Janeiro 2026│
├─────────────────────────────────────────┤
│  [Progresso Visual de Rank]             │
│  ████████████░░░░  1240/1500 pts        │
│  Elite ────────────> Próximo: Lendário  │
│                                          │
│  Medalhas Recentes: 🏆 🤝 💡            │
│  Último XP: +10 (Criou Elo)             │
└─────────────────────────────────────────┘
```

---

### 3. ✨ **Finalizar Visual do Perfil do Usuário**
**Templates:** V4 e V6

#### ⚠️ IMPORTANTE - Card Faltando:
- [ ] **Card de Histórico de Batalha**
  - **Arquivo:** `components/gamification/battle-history.tsx`
  - **Localização:** Sidebar do perfil
  - **Ajustar para:** Visual V6 (glass morphism, cores)
  - **Verificar dados:** Histórico de atividades, pontos ganhos
  - **Integrar em:** `profile-page-template-v6.tsx`

#### Checklist Final:
- [ ] **Comparar pixel-perfect** com demos
  - [ ] Espaçamentos
  - [ ] Tamanhos de fonte
  - [ ] Cores exatas
  - [ ] Bordas e sombras
  - [ ] Efeitos glass

- [ ] **Testar responsividade**
  - [ ] Desktop (1920px)
  - [ ] Laptop (1366px)
  - [ ] Tablet (768px)
  - [ ] Mobile (375px)

- [ ] **Validar todos os estados**
  - [ ] Com foto / Sem foto
  - [ ] Com medalhas / Sem medalhas
  - [ ] Com redes sociais / Sem redes
  - [ ] Owner vs Visitante

- [ ] **Performance**
  - [ ] Lazy load de imagens
  - [ ] Otimização de queries
  - [ ] Cache adequado

---

### 4. 🎨 **Repaginar Site com Nova Identidade Visual**
**Escopo:** Homepage, Landing Pages, Navegação

#### Páginas para atualizar:
- [ ] **Homepage** (`app/page.tsx`)
  - [ ] Hero section
  - [ ] Features
  - [ ] CTA sections
  - [ ] Footer

- [ ] **Navegação** (`components/navigation/`)
  - [ ] Header/Navbar
  - [ ] Menu mobile
  - [ ] Breadcrumbs

- [ ] **Landing Pages:**
  - [ ] `/sobre`
  - [ ] `/profissionais`
  - [ ] `/elo-da-rota`
  - [ ] `/rota-do-valente`
  - [ ] `/planos`

#### Nova Identidade Visual:
```
Cores Principais:
- Verde Floresta: #1E4D40
- Laranja (acentos): #D2691E
- Background Dark: #1A2421 / #2D3B2D
- Textos: #F2F4F3 / #D1D5DB

Tipografia:
- Headers: Bold, tracking-wide
- Body: Regular, line-height confortável

Efeitos:
- Glass morphism (backdrop-filter: blur(8px))
- Gradientes sutis
- Shadows profundas
- Hover states suaves

Componentes:
- Cards com glass effect
- Botões com estados bem definidos
- Inputs modernos
- Badges e tags consistentes
```

---

## 📊 ESTIMATIVA DE TEMPO

| Tarefa | Tempo Estimado | Prioridade |
|--------|----------------|------------|
| Testar Gamificação | 2-3 horas | 🔴 Alta |
| Ajustar Card Rota do Valente | 1-2 horas | 🟡 Média |
| Finalizar Visual Perfil | 1-2 horas | 🔴 Alta |
| Repaginar Site | 4-6 horas | 🟢 Baixa* |

*Pode ser dividida em múltiplas sessões

**Total estimado:** 8-13 horas de trabalho

---

## 🎯 ENTREGÁVEIS DA SESSÃO

Ao final da próxima sessão, devemos ter:

1. ✅ Sistema de gamificação **100% testado e validado**
2. ✅ Card Rota do Valente com **visual V6 perfeito**
3. ✅ Perfil de usuário **finalizado e em produção**
4. ✅ Início da **repaginação do site** (homepage ao menos)

---

## 🚀 PLANO DE EXECUÇÃO

### Manhã (3-4 horas):
1. **08:00-10:00** → Testar gamificação completa
2. **10:00-11:30** → Ajustar card Rota do Valente
3. **11:30-12:00** → Break + Review

### Tarde (4-5 horas):
4. **14:00-16:00** → Finalizar visual do perfil
5. **16:00-18:00** → Iniciar repaginação (homepage)
6. **18:00-18:30** → Deploy e validação final

---

## 📁 ARQUIVOS QUE SERÃO MODIFICADOS

```
components/
├── profile/
│   ├── rota-valente-card.tsx (🔧 AJUSTAR)
│   └── headers/improved-current-header-v6-complete.tsx (✅ validar)
├── navigation/ (🔧 REPAGINAR)
│   ├── navbar.tsx
│   └── mobile-menu.tsx
app/
├── page.tsx (🔧 REPAGINAR - Homepage)
├── about/page.tsx (🔧 REPAGINAR)
└── professionals/page.tsx (🔧 REPAGINAR)
```

---

## 🐛 BUGS CONHECIDOS PARA CORRIGIR

1. ⚠️ Verificar duplicação de XP na gamificação
2. ⚠️ Testar edge cases de perfil (sem dados)
3. ⚠️ Validar upload de capa em produção

---

## 💡 IDEIAS/MELHORIAS FUTURAS

- [ ] Adicionar animações de conquista de medalha
- [ ] Notificações push para XP ganho
- [ ] Leaderboard de pontos
- [ ] Sistema de achievements
- [ ] Compartilhamento social de conquistas

---

**Preparado para:** ✅ Continuar de onde paramos
**Status:** 🟢 Documentação completa
**Próxima ação:** Testar gamificação ao acordar
