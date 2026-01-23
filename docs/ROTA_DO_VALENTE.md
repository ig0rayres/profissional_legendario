# 🗺️ ROTA DO VALENTE - Documentação Completa

> Sistema de Gamificação do Rota Business Club

## 📖 O que é?

A **Rota do Valente** é o sistema de gamificação que transforma a jornada do profissional em uma experiência de progressão. Cada ação na plataforma gera **Vigor** (pontos) e desbloqueia conquistas.

### Objetivos:
- Engajar usuários na plataforma
- Recompensar participação ativa
- Criar senso de progressão
- Diferenciar assinantes premium

---

## 🎖️ PATENTES (Ranks)

Progressão baseada em pontos acumulados (Vigor):

| Rank | Ícone | Pontos | Descrição |
|------|-------|--------|-----------|
| **Novato** | 🛡️ Shield | 0+ | Iniciante na jornada |
| **Especialista** | 🎯 Target | 200+ | Ganhando experiência |
| **Guardião** | ✅ ShieldCheck | 500+ | Protegendo os valores |
| **Comandante** | 🏅 Medal | 1000+ | Líder respeitado |
| **General** | 🔥 Flame | 2000+ | Mestre da jornada |
| **Lenda** | 👑 Crown | 3500+ | Status lendário |

### Gerenciamento:
- **Tabela:** `ranks`
- **Admin:** `/admin/gamificacao` (seção Patentes)
- **Atualização automática** ao atingir pontos

---

## ⚡ MULTIPLICADORES (por Plano)

Todos os pontos são multiplicados pelo plano do usuário:

| Plano | Multiplicador | Exemplo (50 pts base) |
|-------|--------------|----------------------|
| **Recruta** | 1.0x | 50 Vigor |
| **Veterano** | 1.5x | 75 Vigor |
| **Elite** | 3.0x | 150 Vigor |

### Gerenciamento:
- **Tabela:** `plan_tiers` (campo `xp_multiplier`)
- **Código:** `/lib/api/gamification.ts` e `/api/gamification/award-medal`

---

## 🏅 MEDALHAS (Conquistas Permanentes)

Conquistas que o usuário ganha **uma única vez**. Ficam registradas para sempre.

### Onboarding
| ID | Medalha | Pts | Ícone | Condição |
|----|---------|-----|-------|----------|
| `alistamento_concluido` | Alistamento Concluído | 100 | ClipboardCheck | Perfil 100% completo |
| `primeiro_sangue` | Primeiro Sangue | 50 | ⚔️ | 1ª venda/contrato |
| `cinegrafista_campo` | Cinegrafista de Campo | 30 | 📸 | 1º upload de foto |
| `pronto_missao` | Pronto para a Missão | 50 | ⚡ | 5 respostas em <2h |

### Networking & Confrarias
| ID | Medalha | Pts | Ícone | Condição |
|----|---------|-----|-------|----------|
| `presente` | Presente | 50 | 🎟️ | Aceitar 1º Elo |
| `primeira_confraria` | Primeira Confraria | 50 | 🤝 | 1ª confraternização |
| `anfitriao` | Anfitrião | 150 | 🎪 | 1ª confraria como host |
| `cronista` | Cronista | 100 | 📷 | Fotos em confraria |
| `networker_ativo` | Networker Ativo | 100 | 🔗 | 5 confrarias |
| `lider_confraria` | Líder de Confraria | 200 | 🏅 | 10 confrarias |
| `mestre_conexoes` | Mestre das Conexões | 300 | Network | 20 confrarias |
| `irmandade` | Irmandade | 75 | 🤝 | Contratar outro membro |

### Marketplace
| ID | Medalha | Pts | Ícone | Condição |
|----|---------|-----|-------|----------|
| `primeira_venda_mkt` | Primeira Venda MKT | 50 | ShoppingBag | 1ª venda |
| `vendedor_ativo` | Vendedor Ativo | 100 | Package | 5 vendas |
| `comerciante` | Comerciante | 200 | Building2 | 10 vendas |
| `mestre_marketplace` | Mestre do Marketplace | 400 | BadgeDollarSign | 20 vendas |

### Excelência & Serviços
| ID | Medalha | Pts | Ícone | Condição |
|----|---------|-----|-------|----------|
| `batismo_excelencia` | Batismo de Excelência | 80 | ⭐ | 1ª avaliação 5★ |
| `inabalavel` | Inabalável | 150 | Diamond | Média 5★ após 5 avaliações |
| `missao_cumprida` | Missão Cumprida | 100 | 🎯 | 1º serviço concluído |
| `veterano_guerra` | Veterano de Guerra | 300 | Swords | 20 serviços |
| `fechador_elite` | Fechador de Elite | 500 | Banknote | 50 contratos |

### Especiais & Longevidade
| ID | Medalha | Pts | Ícone | Condição |
|----|---------|-----|-------|----------|
| `sentinela_inabalavel` | Sentinela Inabalável | 200 | ⚓ | 30 dias ativos consecutivos |
| `sentinela_elite` | Sentinela de Elite | 500 | 💠 | 3 meses no plano Elite |
| `veterano_rota` | Veterano da Rota | 300 | Clock | 1 ano na plataforma |
| `recrutador` | Recrutador | 150 | 📣 | Indicar 3 membros |
| `portfolio_premium` | Portfólio Premium | 100 | Images | 10 fotos no portfólio |

### Gerenciamento:
- **Tabela:** `medals` (config) + `user_medals` (conquistas)
- **Admin:** `/admin/gamificacao` (seção Medalhas)
- **API:** `POST /api/gamification/award-medal`

---

## 🔥 PROEZAS (Ações Mensais)

Ações que podem ser **reconquistadas todo mês**. Reset mensal.

### Onboarding & Básicas
| ID | Proeza | Pts | Ícone | Ação |
|----|--------|-----|-------|------|
| `primeiro_sangue` | Primeiro Sangue | 50 | Sword | 1ª venda no mês |
| `presente` | Presente | 50 | Gift | 1º Elo aceito no mês |
| `engajado` | Engajado | 30 | Smartphone | 15+ logins no mês |
| `comunicador` | Comunicador | 30 | MessageCircle | 5+ mensagens |

### Confrarias
| ID | Proeza | Pts | Ícone | Ação |
|----|--------|-----|-------|------|
| `primeira_confraria` | Primeira Confraria | 50 | PartyPopper | 1ª confraria no mês |
| `anfitriao` | Anfitrião | 100 | Home | 1+ como anfitrião |
| `cronista` | Cronista | 50 | Camera | Foto em confraria |
| `networker_ativo` | Networker Ativo | 100 | Flame | 5 confrarias |
| `lider_confraria` | Líder de Confraria | 200 | Crown | 10 confrarias |

### Produtividade
| ID | Proeza | Pts | Ícone | Ação |
|----|--------|-----|-------|------|
| `missao_cumprida` | Missão Cumprida | 100 | Target | 1º serviço concluído |
| `pronto_missao` | Pronto para Missão | 50 | Zap | 5 respostas em <2h |
| `lancador` | Lançador | 30 | Rocket | 1 projeto lançado |
| `empreendedor` | Empreendedor | 80 | Briefcase | 3 projetos |
| `maquina_negocios` | Máquina de Negócios | 150 | Zap | 5 projetos |

### Social & Conteúdo
| ID | Proeza | Pts | Ícone | Ação |
|----|--------|-----|-------|------|
| `cinegrafista` | Cinegrafista | 30 | Video | 1º upload de foto |
| `influenciador` | Influenciador | 50 | Megaphone | 10 posts |
| `voz_da_rota` | Voz da Rota | 150 | Mic | 50 posts |
| `engajador_feed` | Engajador | 80 | MessageSquare | 50 comentários |
| `viral` | Viral | 100 | Flame | Post com 20+ likes |

### Avaliações
| ID | Proeza | Pts | Ícone | Ação |
|----|--------|-----|-------|------|
| `batismo_excelencia` | Batismo de Excelência | 80 | Star | 1ª avaliação 5★ |
| `colaborador` | Colaborador | 50 | PenLine | 5 avaliações dadas |
| `avaliador_ativo` | Avaliador Ativo | 100 | Target | 10 avaliações |

### Elite & Indicações
| ID | Proeza | Pts | Ícone | Ação |
|----|--------|-----|-------|------|
| `sentinela_inabalavel` | Sentinela Inabalável | 200 | Shield | 30 dias ativos |
| `sentinela_elite` | Sentinela de Elite | 500 | Gem | Manter plano Elite |
| `recrutador` | Recrutador | 150 | Megaphone | Indicar 3 membros |
| `embaixador` | Embaixador | 400 | Trophy | Indicar 10 membros |
| `irmandade` | Irmandade | 75 | UserPlus | Contratar membro |

### Gerenciamento:
- **Tabela:** `proezas` (config) + `user_proezas` (conquistas)
- **Admin:** `/admin/gamificacao` (seção Proezas)
- **Função:** `awardProeza()` em `/lib/api/rota-valente`

---

## 📊 Fluxo de Pontuação

```
Ação do usuário (ex: completar perfil)
    ↓
Sistema identifica proeza/medalha aplicável
    ↓
Busca points_base no banco (tabela proezas/medals)
    ↓
Aplica multiplicador do plano (1x, 1.5x ou 3x)
    ↓
Credita pontos em user_gamification.total_points
    ↓
Registra em points_history (histórico)
    ↓
Verifica se atingiu nova patente
    ↓
Envia notificação (tabela notifications)
    ↓
Envia mensagem no chat (tabela messages)
```

---

## 🗄️ Tabelas do Banco

### Configuração (Admin)
| Tabela | Descrição |
|--------|-----------|
| `ranks` | Patentes e requisitos |
| `medals` | Medalhas disponíveis |
| `proezas` | Proezas mensais |
| `plan_tiers` | Planos e multiplicadores |

### Dados do Usuário
| Tabela | Descrição |
|--------|-----------|
| `user_gamification` | Pontos totais, patente atual |
| `user_medals` | Medalhas conquistadas |
| `user_proezas` | Proezas do mês |
| `points_history` | Histórico de pontos |
| `notifications` | Notificações |

---

## 🛠️ APIs Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/gamification/award-medal` | POST | Conceder medalha |
| `/api/system-message` | POST | Enviar msg sistema |
| `/api/profile/me` | GET | Dados do perfil + gamification |

### Funções Internas
| Função | Arquivo | Descrição |
|--------|---------|-----------|
| `awardBadge()` | `/lib/api/gamification.ts` | Conceder medalha |
| `awardPoints()` | `/lib/api/gamification.ts` | Conceder pontos |
| `awardProeza()` | `/lib/api/rota-valente` | Conceder proeza |
| `checkProfileCompletion()` | `/lib/api/profile.ts` | Verificar perfil |

---

## 🏆 Exemplo de Progressão

### Usuário Veterano (1.5x) em 1 mês:

| Ação | Pts Base | Multi | Total |
|------|---------|-------|-------|
| Completa perfil | 100 | 1.5x | 150 |
| 1ª venda | 50 | 1.5x | 75 |
| 1ª confraria | 50 | 1.5x | 75 |

**Total: 300 pts = Guardião! 🎯**

### Usuário Elite (3x) em 1 mês:

| Ação | Pts Base | Multi | Total |
|------|---------|-------|-------|
| Completa perfil | 100 | 3x | 300 |
| 1ª venda | 50 | 3x | 150 |
| 1ª confraria | 50 | 3x | 150 |

**Total: 600 pts = Comandante! 🏅**

---

## 📱 Componentes Frontend

| Componente | Localização | Descrição |
|------------|-------------|-----------|
| `RankInsignia` | `/components/gamification/` | Badge de patente |
| `BattleHistory` | `/components/gamification/` | Histórico de batalha |
| `RotaValenteCard` | `/components/profile/` | Card da trilha |
| `MedalPanel` | `/components/gamification/` | Painel de medalhas |

---

## 🔒 Segurança

- **API award-medal:** Usa Service Role (bypassa RLS)
- **RLS:** `points_history` é público (todos podem ver)
- **Multiplicador:** Aplicado server-side (não manipulável)

---

*Última atualização: Janeiro 2026*
