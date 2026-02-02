# 📋 ROTA BUSINESS CLUB - ESCOPO COMPLETO DO PROJETO

**Versão:** 2.1  
**Data:** 28/01/2026  
**Status:** 🟢 Produção + Sistema de Temporadas Implementado

---

## 📌 ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Planos e Assinaturas](#2-planos-e-assinaturas)
3. [Sistema de Autenticação](#3-sistema-de-autenticação)
4. [Perfis de Usuário](#4-perfis-de-usuário)
5. [Sistema de Gamificação (Rota do Valente)](#5-sistema-de-gamificação-rota-do-valente)
6. [Sistema de Conexões (Elos)](#6-sistema-de-conexões-elos)
7. [Sistema de Confrarias](#7-sistema-de-confrarias)
8. [Feed Na Rota](#8-feed-na-rota)
9. [Sistema de Chat](#9-sistema-de-chat)
10. [Centro de Notificações](#10-centro-de-notificações)
11. [Painel Administrativo](#11-painel-administrativo)
12. [Sistema de Indicação (NOVO)](#12-sistema-de-indicação-novo)
13. [Sistema de Temporadas/Premiação (NOVO)](#13-sistema-de-temporadaspremolação-novo)
14. [Marketplace (FUTURO)](#14-marketplace-futuro)
15. [Eventos (FUTURO)](#15-eventos-futuro)
16. [Integrações Externas](#16-integrações-externas)
17. [Stack Tecnológica](#17-stack-tecnológica)
18. [Identidade Visual](#18-identidade-visual)

---

## 1. VISÃO GERAL

### O que é o Rota Business Club?

Uma **plataforma de networking profissional gamificada** voltada para empresários e profissionais que buscam:

- Conexões de alto valor
- Oportunidades de negócio
- Crescimento através de comunidade
- Reconhecimento por participação ativa

### Conceito: "O Acampamento Base do Homem de Negócio"

A plataforma usa metáforas militares e de aventura:
- **Rota** = Caminho de crescimento
- **Valente** = Profissional corajoso
- **Confrarias** = Encontros presenciais
- **Patentes** = Níveis de experiência
- **Elos** = Conexões entre membros

### URLs

| Ambiente | URL |
|----------|-----|
| Produção | https://rotabusinessclub.com.br |
| Local | http://localhost:3000 |

---

## 2. PLANOS E ASSINATURAS

### Tabela de Planos

| Plano | Preço | Multiplicador XP | Cor |
|-------|-------|------------------|-----|
| **Recruta** | R$ 0,00/mês | 1.0x | Cinza |
| **Veterano** | R$ 97,00/mês | 1.5x | Verde |
| **Elite** | R$ 127,00/mês | 3.0x | Laranja |
| **Lendário** | R$ 247,00/mês | 5.0x | ⭐ Dourado |

### Regras de Negócio

1. **Upgrade:** A qualquer momento, proporcional
2. **Downgrade:** Apenas no final do ciclo
3. **Cancelamento:** Mantém acesso até fim do período pago
4. **Multiplicador:** Aplicado em TODAS as ações de XP
5. **Pagamento:** Via Stripe (cartão de crédito)

### Limites por Plano

> **⚠️ FONTE ÚNICA DE VERDADE:** `/lib/constants/plan-limits.ts`
>
> **NUNCA** buscar `plan_config`, `plan_tiers` ou hardcodar valores!  
> **SEMPRE** importar: `import { getPlanLimits } from '@/lib/constants/plan-limits'`

| Recurso | Recruta | Soldado | Especialista | Elite |
|---------|---------|---------|--------------|-------|
| Max Categorias | 1 | 3 | 5 | 10 |
| Elos Máximos | 10 | 50 | 100 | 999 (∞) |
| Confrarias/Mês | 1 | 2 | 3 | 999 (∞) |
| Anúncios Marketplace | 0 | 1 | 2 | 3 |
| XP Multiplier | 1.0x | 1.0x | 1.5x | 2.0x |
| Pode Enviar Elo | ❌ | ✅ | ✅ | ✅ |

**Valores centralizados em:** `/lib/constants/plan-limits.ts` (02/02/2026)

### Features por Plano

**RECRUTA (Grátis)**
- Acesso à comunidade
- Perfil básico
- Receber convites de confraria
- Até 10 elos

**VETERANO (R$ 97/mês)**
- Tudo do Recruta
- Multiplicador VIGOR 1.5x
- Enviar 4 convites de confraria/mês
- Até 100 elos
- 2 anúncios no marketplace

**ELITE (R$ 127/mês)**
- Tudo do Veterano
- Multiplicador VIGOR 3x
- Enviar 10 convites de confraria/mês
- Elos ilimitados
- 10 anúncios no marketplace
- Destaque no ranking

**LENDÁRIO (R$ 247/mês)**
- Tudo do Elite
- Multiplicador VIGOR 5x
- Elos ilimitados
- Confrarias ilimitadas
- Anúncios de marketplace ilimitados
- Destaque no ranking

---

## 3. SISTEMA DE AUTENTICAÇÃO

### Fluxo de Cadastro

```
1. Usuário acessa /auth/register
2. Preenche: Nome, Email, Telefone, Senha
3. (Opcional) Código de indicação capturado da URL (?ref=xxx)
4. Supabase Auth cria conta
5. Trigger cria registro em `profiles`
6. Email de confirmação enviado (Resend)
7. Usuário confirma email
8. Redirecionado para /dashboard
9. Modal de boas-vindas exibido
```

### Fluxo de Login

```
1. Usuário acessa /auth/login
2. Preenche Email e Senha
3. Supabase Auth valida
4. JWT gerado e armazenado
5. Redirecionado para /dashboard
```

### Recuperação de Senha

```
1. Usuário clica "Esqueci minha senha"
2. Informa email
3. Email com link mágico enviado
4. Usuário clica no link
5. Redirecionado para /auth/reset-password
6. Define nova senha
```

### Roles

| Role | Permissões |
|------|------------|
| `user` | Acesso padrão, próprio perfil |
| `admin` | Tudo + painel /admin |

---

## 4. PERFIS DE USUÁRIO

### Dados do Perfil

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `full_name` | String | ✅ |
| `email` | String | ✅ |
| `phone` | String | ✅ |
| `slug` | String | ✅ (gerado automaticamente) |
| `rota_number` | Integer | ✅ (sequencial) |
| `avatar_url` | URL | ❌ |
| `cover_url` | URL | ❌ |
| `bio` | Text | ❌ |
| `company` | String | ❌ |
| `position` | String | ❌ |
| `city` | String | ❌ |
| `state` | String | ❌ |
| `website` | URL | ❌ |
| `linkedin` | URL | ❌ |
| `instagram` | String | ❌ |
| `whatsapp` | String | ❌ |

### URL Pública do Perfil

```
https://rotabusinessclub.com.br/{slug}/{rota_number}
Exemplo: https://rotabusinessclub.com.br/igor-ayres/1079
```

### Completude do Perfil

Sistema calcula porcentagem de preenchimento:
- 0-49%: Perfil Incompleto (badge vermelha)
- 50-79%: Perfil Parcial (badge amarela)
- 80-100%: Perfil Completo (badge verde)

**Ao atingir 100%:** Medalha "Alistamento Concluído" (+100 XP)

### Portfólio

- Upload de imagens de trabalhos
- Limite por plano (5/20/ilimitado)
- Galeria exibida no perfil público

---

## 5. SISTEMA DE GAMIFICAÇÃO (ROTA DO VALENTE)

### Conceito

Sistema de progressão que recompensa participação ativa na plataforma.

### 5.1 VIGOR (Pontos)

Unidade de medida de experiência. Acumulado através de ações.

**Fórmula:**
```
Vigor Final = Pontos Base × Multiplicador do Plano
```

### 5.2 PATENTES (Ranks)

Níveis de progressão baseados em Vigor acumulado:

| Patente | Ícone | Vigor Necessário | Cor |
|---------|-------|------------------|-----|
| **Novato** | 🛡️ Shield | 0+ | Cinza |
| **Especialista** | 🎯 Target | 200+ | Verde |
| **Guardião** | ✅ ShieldCheck | 500+ | Azul |
| **Comandante** | 🏅 Medal | 1.000+ | Laranja |
| **General** | 🔥 Flame | 2.000+ | Vermelho |
| **Lenda** | 👑 Crown | 3.500+ | Dourado |

**Atualização:** Automática ao atingir pontuação

### 5.3 MEDALHAS (Conquistas Permanentes)

Conquistas únicas que ficam para sempre no perfil.

#### Onboarding
| ID | Nome | Pontos | Condição |
|----|------|--------|----------|
| `alistamento_concluido` | Alistamento Concluído | 100 | Perfil 100% completo |
| `primeiro_sangue` | Primeiro Sangue | 50 | 1ª venda/contrato |
| `cinegrafista_campo` | Cinegrafista de Campo | 30 | 1º upload de foto |

#### Networking
| ID | Nome | Pontos | Condição |
|----|------|--------|----------|
| `presente` | Presente | 50 | Aceitar 1º Elo |
| `primeira_confraria` | Primeira Confraria | 50 | 1ª confraternização |
| `anfitriao` | Anfitrião | 150 | 1ª confraria como host |
| `networker_ativo` | Networker Ativo | 100 | 5 confrarias |
| `lider_confraria` | Líder de Confraria | 200 | 10 confrarias |
| `mestre_conexoes` | Mestre das Conexões | 300 | 20 confrarias |

#### Marketplace
| ID | Nome | Pontos | Condição |
|----|------|--------|----------|
| `primeira_venda_mkt` | Primeira Venda | 50 | 1ª venda |
| `vendedor_ativo` | Vendedor Ativo | 100 | 5 vendas |
| `comerciante` | Comerciante | 200 | 10 vendas |
| `mestre_marketplace` | Mestre Marketplace | 400 | 20 vendas |

#### Excelência
| ID | Nome | Pontos | Condição |
|----|------|--------|----------|
| `batismo_excelencia` | Batismo de Excelência | 80 | 1ª avaliação 5★ |
| `inabalavel` | Inabalável | 150 | Média 5★ após 5 avaliações |
| `missao_cumprida` | Missão Cumprida | 100 | 1º serviço concluído |

#### Especiais
| ID | Nome | Pontos | Condição |
|----|------|--------|----------|
| `sentinela_inabalavel` | Sentinela Inabalável | 200 | 30 dias ativos consecutivos |
| `sentinela_elite` | Sentinela de Elite | 500 | 3 meses no plano Elite |
| `veterano_rota` | Veterano da Rota | 300 | 1 ano na plataforma |
| `recrutador` | Recrutador | 150 | Indicar 3 membros |

### 5.4 PROEZAS (Ações Mensais)

Ações que podem ser **reconquistadas todo mês**. Reset no dia 01.

| ID | Nome | Pontos | Ação |
|----|------|--------|------|
| `primeiro_sangue` | Primeiro Sangue | 50 | 1ª venda no mês |
| `presente` | Presente | 50 | 1º Elo aceito no mês |
| `engajado` | Engajado | 30 | 15+ logins no mês |
| `comunicador` | Comunicador | 30 | 5+ mensagens |
| `primeira_confraria` | Primeira Confraria | 50 | 1ª confraria no mês |
| `anfitriao` | Anfitrião | 100 | 1+ como anfitrião |
| `networker_ativo` | Networker Ativo | 100 | 5 confrarias |
| `lider_confraria` | Líder de Confraria | 200 | 10 confrarias |

### 5.5 Fluxo de Pontuação

```
Ação do usuário
    ↓
Sistema identifica proeza/medalha
    ↓
Busca pontos base no banco
    ↓
Aplica multiplicador do plano
    ↓
Credita em user_gamification
    ↓
Registra em points_history
    ↓
Verifica nova patente
    ↓
Envia notificação
    ↓
(Se medalha) Modal com confetti
```

---

## 6. SISTEMA DE CONEXÕES (ELOS)

### Conceito

"Elos" são conexões entre membros, similar ao LinkedIn.

### Fluxo

```
1. Usuário A visita perfil de Usuário B
2. Clica em "Conectar" (ou "Criar Elo")
3. Solicitação enviada para B
4. Notificação aparece para B
5. B pode: Aceitar | Rejeitar | Ignorar
6. Se aceitar: Ambos viram Elos
7. Chat liberado entre eles
```

### Estados da Conexão

| Status | Descrição |
|--------|-----------|
| `pending` | Solicitação enviada, aguardando resposta |
| `accepted` | Conexão ativa |
| `rejected` | Recusada (não pode enviar novamente por 30 dias) |
| `blocked` | Bloqueado (permanente até desbloquear) |

### Limites

- **Recruta:** 2 solicitações/mês
- **Veterano/Elite:** Ilimitado

### Pontuação

- Enviar solicitação: +5 XP
- Aceitar solicitação: +10 XP
- Medalha "Presente" ao aceitar 1º Elo: +50 XP

---

## 7. SISTEMA DE CONFRARIAS

### Conceito

"Confrarias" são encontros presenciais entre membros. São o diferencial da plataforma.

### Fluxo Completo

```
1. Usuário A envia convite de Confraria para B
2. B recebe notificação
3. B aceita o convite (seleciona data/local)
4. Encontro acontece pessoalmente
5. Um dos dois "Completa" a confraria:
   - Upload de foto do encontro
   - Depoimento
   - Data do encontro
6. IA valida a foto (OpenAI Vision)
7. Post automático no Feed Na Rota
8. Ambos recebem XP
```

### Estados do Convite

| Status | Descrição |
|--------|-----------|
| `pending` | Convite enviado |
| `accepted` | Aceito, aguardando encontro |
| `completed` | Encontro realizado e documentado |
| `rejected` | Recusado |
| `expired` | Expirou (30 dias sem resposta) |

### Pontuação de Confrarias

| Ação | XP Base |
|------|---------|
| Enviar convite | +10 |
| Aceitar convite | +10 |
| Completar (base) | +50 |
| Foto válida | +20 |
| Depoimento | +15 |

### Limites por Plano

- **Recruta:** 1 confraria/mês
- **Veterano:** 5 confrarias/mês
- **Elite:** Ilimitado

### Validação por IA

A foto enviada passa por validação:
- Deve conter **2 ou mais pessoas**
- Deve parecer um **encontro real** (não foto de tela)
- Se inválida: usuário pode tentar novamente

---

## 8. FEED NA ROTA

### Conceito

Feed social da plataforma onde aparecem:
- Posts de Confrarias (automáticos)
- Posts de conquistas
- Atualizações da comunidade

### Tipos de Post

| Tipo | Origem | Conteúdo |
|------|--------|----------|
| `confraternity` | Automático | Foto + depoimento do encontro |
| `achievement` | Automático | Nova medalha/patente |
| `update` | Manual (futuro) | Post do usuário |

### Visual de Post de Confraria

```
┌────────────────────────────────────┐
│ 🤝 CONFRARIA                       │
│ [Avatar1][Avatar2]                 │
│ João e Maria                       │
│ 27 de Janeiro de 2026              │
├────────────────────────────────────┤
│ [FOTO DO ENCONTRO]                 │
├────────────────────────────────────┤
│ "Encontro incrível! Fechamos uma   │
│ parceria para o projeto XYZ..."    │
├────────────────────────────────────┤
│ ❤️ 15   💬 3                       │
└────────────────────────────────────┘
```

### Interações

- **Curtir:** Qualquer usuário logado
- **Comentar:** Qualquer usuário logado
- **Compartilhar:** Link direto para o post

### Visibilidade

- Posts de Confraria aparecem no feed de **AMBOS** participantes
- Todos os usuários podem ver o feed geral
- Filtros: Todas | Minhas Confrarias

### Pontuação do Feed

| Ação | Pts Base | Limite/Dia |
|------|----------|------------|
| Publicar post | 15 | 5 |
| Receber curtida | 2 | 50 |
| Comentar | 5 | **1** |

> ⚠️ **REGRA ATUALIZADA (28/01/2026):**
> - Comentário gera pontos apenas **1x por dia** (primeiro do dia)
> - Receber comentário **não gera mais pontos**

---

## 9. SISTEMA DE CHAT

### Funcionalidades

- Mensagens 1:1 entre Elos
- Tempo real (Supabase Realtime)
- Envio de arquivos/imagens
- Emojis
- Status: Enviado, Entregue, Lido
- Mensagens do Sistema (automáticas)

### Mensagens do Sistema

Enviadas automaticamente:
- "🎉 Vocês agora são Elos!"
- "🏅 João conquistou a medalha X!"
- "📅 Lembrete: Confraria agendada para amanhã"

### Limites

- **Recruta:** 10 mensagens/dia
- **Veterano/Elite:** Ilimitado

---

## 10. CENTRO DE NOTIFICAÇÕES

### Tipos de Notificação

| Tipo | Ícone | Exemplo |
|------|-------|---------|
| `connection_request` | 🔗 | "João quer se conectar" |
| `connection_accepted` | ✅ | "Maria aceitou seu Elo" |
| `confraternity_invite` | 🤝 | "Convite de Confraria de Pedro" |
| `confraternity_completed` | 🎉 | "Confraria com Ana registrada!" |
| `medal_earned` | 🏅 | "Você conquistou: Primeiro Sangue!" |
| `rank_up` | ⬆️ | "Parabéns! Você é Guardião!" |
| `message` | 💬 | "Nova mensagem de Carlos" |
| `system` | ℹ️ | "Bem-vindo ao Rota Business Club!" |

### Componentes

1. **Sino (Bell Icon):** No header, mostra badge com contagem
2. **Dropdown:** Lista últimas 10 notificações
3. **Página Completa:** `/notifications` com todas
4. **Modal de Medalha:** Popup especial com confetti

### Realtime

Notificações aparecem instantaneamente via Supabase Realtime.

---

## 11. PAINEL ADMINISTRATIVO

### Acesso

- URL: `/admin`
- Apenas usuários com `role = 'admin'`

### Seções

| Seção | Funcionalidade |
|-------|----------------|
| **Dashboard** | Métricas gerais, gráficos |
| **Usuários** | CRUD, alterar planos, bloquear |
| **Planos** | Gerenciar preços, limites |
| **Gamificação** | Medalhas, Patentes, Proezas |
| **Confrarias** | Ver todas, moderar |
| **Financeiro** | Comissões, saques (NOVO) |
| **Temporadas** | Prêmios mensais (NOVO) |

---

## 12. SISTEMA DE INDICAÇÃO (NOVO) 🆕

### Conceito

Cada usuário tem um link único para convidar novos membros. Ao trazer alguém, recebe **comissão**.

### Regras de Negócio

| Regra | Valor | Gerenciado por |
|-------|-------|----------------|
| **Comissão** | 100% da primeira mensalidade | Admin |
| **Prazo para liberação** | 60 dias após pagamento | Admin |
| **Adimplência** | Comissão SÓ liberada se indicado estiver em dia | Admin |
| **Valor mínimo para saque** | **R$ 250,00** | Admin |
| **Tipo** | Apenas 1º pagamento | Admin |
| **Persistência** | Vínculo indicador-indicado é permanente | - |

> ⚠️ **IMPORTANTE:** Todas as configurações são gerenciadas via painel Admin e propagam automaticamente para toda a plataforma.

### Tabela de Configuração (Admin)

| Campo | Descrição | Valor Padrão |
|-------|-----------|--------------|
| `commission_percentage` | Porcentagem da comissão | 100% |
| `commission_type` | Tipo de comissão | `first_payment` |
| `release_days` | Dias para liberar comissão | 60 |
| `require_referred_active` | Exige indicado adimplente | ✅ Sim |
| `min_withdrawal_amount` | Valor mínimo para saque | R$ 250,00 |

### Link de Indicação

```
URL: https://rotabusinessclub.com.br/r/{slug}
Exemplo: https://rotabusinessclub.com.br/r/igor-ayres
```

### Fluxo Completo

```
1. Usuário A compartilha seu link
2. Pessoa B acessa e se cadastra
3. B contrata plano (ex: Veterano R$97)
4. B paga primeira mensalidade
5. Sistema registra comissão de R$97 para A (status: pendente)
6. Sistema aguarda 60 dias
7. Após 60 dias:
   - SE B está adimplente → comissão liberada (status: disponível)
   - SE B está inadimplente → comissão cancelada
8. A acumula saldo até atingir R$250
9. A solicita saque via PIX
10. Admin aprova e processa pagamento
```

### Estados da Comissão

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando prazo de 60 dias |
| `available` | Liberada, disponível para saque |
| `withdrawn` | Já foi sacada |
| `cancelled` | Cancelada (indicado inadimplente) |

### Painel do Usuário (Dashboard > Financeiro)

```
┌─────────────────────────────────────────┐
│ 🔗 SEU LINK DE INDICAÇÃO                │
│ rotabusinessclub.com.br/r/igor    [📋] │
│ [Compartilhar WhatsApp] [Copiar]        │
├─────────────────────────────────────────┤
│ 💰 RESUMO FINANCEIRO                    │
│ Saldo Disponível: R$ 594,00             │
│ Saldo Pendente: R$ 291,00               │
│ Total Ganho: R$ 885,00                  │
│                                         │
│ ⚠️ Mínimo para saque: R$ 250,00         │
│ [SOLICITAR SAQUE] (habilitado se >= 250)│
├─────────────────────────────────────────┤
│ 👥 SUAS INDICAÇÕES (3)                  │
│ ┌─────────────────────────────────────┐ │
│ │ João Silva      | R$97  | ✅ Disp.  │ │
│ │ Maria Santos    | R$97  | ⏳ 45d    │ │
│ │ Pedro Oliveira  | R$97  | ⏳ 60d    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Solicitação de Saque

**Pré-requisitos:**
1. Saldo disponível >= R$ 250,00
2. Não ter saque pendente

**Fluxo:**
1. Usuário informa valor (mín. R$250)
2. Informa chave PIX
3. Solicitação enviada para Admin
4. Admin aprova e processa
5. Status atualizado para "Pago"

### Notificações

- "🎉 João Silva se cadastrou usando seu link!"
- "💰 Comissão de R$97 registrada! Aguarde 60 dias para liberação."
- "✅ Sua comissão de R$97 está disponível para saque!"
- "💸 Seu saque de R$250 foi processado!"
- "❌ Comissão cancelada: indicado ficou inadimplente."

---

## 13. SISTEMA DE TEMPORADAS/PREMIAÇÃO (NOVO) 🆕

### Conceito

Todo mês é uma "Temporada" com premiação para os Top 3 do ranking de XP.

### Regras de Negócio

| Regra | Valor |
|-------|-------|
| **Período** | Mensal (01 a 30/31) |
| **Critério** | XP acumulado no mês |
| **Premiados** | Top 3 |
| **Gestão** | Admin configura prêmios |
| **Notificação** | Dia 01 para toda base |

### Configuração pelo Admin

```
Admin > Rota do Valente > Temporadas

Temporada: Janeiro 2026
Período: 01/01/2026 a 31/01/2026
Status: ✅ Ativa

PRÊMIOS:
┌────────────┬─────────────────────────────┐
│ 🥇 1º Lugar │ [Imagem] iPhone 15 Pro     │
│ 🥈 2º Lugar │ [Imagem] Voucher R$500     │
│ 🥉 3º Lugar │ [Imagem] Kit Rota Business │
└────────────┴─────────────────────────────┘
```

### Fluxo Automático

```
Dia 01 às 00:01:
1. Encerra temporada anterior
2. Calcula Top 3 do mês encerrado
3. Registra vencedores
4. Cria nova temporada
5. Dispara notificação para toda base
```

### Notificações

- "🏆 Nova temporada iniciada! Veja os prêmios de Fevereiro!"
- "🔥 Faltam 5 dias! Você está em #15 no ranking"
- "🥇 Parabéns! Você ficou em 1º lugar em Janeiro!"

### Exibição para Usuário

- Banner na Rota do Valente com prêmios do mês
- Ranking Top 10 visível
- Posição atual do usuário destacada

---

## 14. MARKETPLACE ✅

### Conceito

Área para membros anunciarem produtos, veículos, imóveis e serviços.

### Funcionalidades Implementadas

- ✅ Cadastro de produtos/serviços
- ✅ Categorias configuráveis (Veículos, Imóveis, Eletrônicos, etc)
- ✅ Campos específicos por categoria (Veículos: ano/km/cor, Imóveis: m²/venda/locação)
- ✅ Modalidades de anúncio (Básico/Elite/Lendário) com preços diferentes
- ✅ Destaque visual para anúncios Elite e Lendário
- ✅ Limite de anúncios por plano do usuário
- ✅ Upload de múltiplas fotos
- ✅ Expiração automática de anúncios (duração por categoria)
- ✅ Marcar como vendido
- ✅ Admin completo com 3 abas (Anúncios, Categorias, Modalidades)

### Limites por Plano

| Plano | Anúncios Permitidos |
|-------|--------------------|
| Recruta | 0 |
| Veterano | 2 |
| Elite | 10 |
| Lendário | Ilimitado |

### Modalidades de Anúncio (Veículos)

| Modalidade | Preço | Duração | Destaque |
|------------|-------|---------|----------|
| Básico | Grátis | 30 dias | - |
| Elite | R$ 49,90 | 45 dias | Badge verde, posição privilegiada |
| Lendário | R$ 99,90 | 60 dias | Badge dourado, topo da listagem |

### Modalidades de Anúncio (Imóveis)

| Modalidade | Preço | Duração | Destaque |
|------------|-------|---------|----------|
| Básico | Grátis | 60 dias | - |
| Elite | R$ 79,90 | 90 dias | Badge verde |
| Lendário | R$ 149,90 | 120 dias | Badge dourado, tour virtual |

### Tabelas do Banco

- `marketplace_categories` - Categorias (nome, slug, ícone, duração padrão)
- `marketplace_ad_tiers` - Modalidades (preço, duração, destaques)
- `marketplace_ads` - Anúncios em si

### Admin

- URL: `/admin/marketplace`
- 3 abas: Anúncios | Categorias | Modalidades
- CRUD completo para cada aba

### Status

✅ **Implementado** - Falta apenas integração Stripe para pagamento de tiers

---

## 15. EVENTOS (FUTURO) 🔮

### Conceito

Eventos organizados pelo Rota Business Club ou por membros.

### Funcionalidades Planejadas

- Criar eventos
- Inscrições
- Limite de vagas
- Ingressos pagos (via Stripe)
- Check-in via QR Code
- Integração com Confrarias (evento pode gerar confrarias)

### Status

⏸️ **Não iniciado** - Prioridade média

---

## 16. INTEGRAÇÕES EXTERNAS

### Ativas

| Serviço | Uso | Status |
|---------|-----|--------|
| **Supabase** | Banco + Auth + Realtime + Storage | ✅ Produção |
| **Stripe** | Pagamentos | ✅ Modo Teste |
| **Resend** | Emails transacionais | ✅ Produção |
| **OpenAI Vision** | Validação de fotos | ✅ Produção |
| **Cloudflare** | DNS + CDN | ✅ Produção |
| **Vercel** | Hospedagem | ✅ Produção |

### Webhooks

| Webhook | Origem | Ação |
|---------|--------|------|
| Stripe `invoice.paid` | Stripe | Registrar pagamento, liberar recursos |
| Stripe `customer.subscription.updated` | Stripe | Atualizar plano |
| Supabase `INSERT profiles` | Supabase | Criar gamification inicial |

---

## 17. STACK TECNOLÓGICA

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 14 | Framework React |
| TypeScript | 5.x | Tipagem |
| Tailwind CSS | 3.x | Estilização |
| shadcn/ui | Latest | Componentes base |
| Framer Motion | 10.x | Animações |
| Lucide React | Latest | Ícones |

### Backend

| Tecnologia | Uso |
|------------|-----|
| Supabase | BaaS (Postgres + Auth + Realtime) |
| Edge Functions | Webhooks, Jobs |
| Zod | Validação de schemas |

### Banco de Dados

PostgreSQL via Supabase com:
- Row Level Security (RLS)
- Triggers automáticos
- Funções SQL customizadas

### Infraestrutura

| Serviço | Uso |
|---------|-----|
| Vercel | Hospedagem (Hobby plan) |
| Cloudflare | DNS + CDN + SSL |
| Supabase Cloud | Banco de dados |

---

## 18. IDENTIDADE VISUAL

### Cores da Marca

| Nome | Hex | Uso |
|------|-----|-----|
| **Verde Rota** | #1B5E3C | Cor primária, confiança |
| **Petróleo** | #1A3A35 | Backgrounds escuros |
| **Laranja Cume** | #D97A28 | Destaques, CTAs |
| **Cobre** | #B87333 | Acentos |
| **Areia** | #F5F0E8 | Backgrounds claros |

### Assets

| Asset | Arquivo | Uso |
|-------|---------|-----|
| **Brasão** | `/images/brasao-rota.png` | Ícone sozinho |
| **Logo Completa** | `/images/logo-rotabusiness.png` | Ícone + texto |

### Tipografia

- **Títulos:** Font bold/black, uppercase
- **Corpo:** Font regular, legível

### Tom de Voz

- Militar/Aventura
- Inspirador
- Profissional mas acessível
- Uso de metáforas: "Rota", "Valente", "Confraria", "Elo", "Patente"

---

## 📊 RESUMO DE STATUS

### ✅ Implementado e Funcionando

- Autenticação completa
- Perfis de usuário
- Sistema de Gamificação (Rota do Valente)
- Elos (Conexões)
- Confrarias com validação IA
- Feed Na Rota
- Chat 1:1
- Notificações com Realtime
- Painel Admin
- Deploy em produção
- **Sistema de Temporadas** ✨
  - 12 temporadas criadas (2026 inteiro)
  - 36 prêmios configurados
  - Emails de abertura/encerramento
  - Ranking mensal centralizado
- **Marketplace** ✨ (29/01/2026)
  - Categorias configuráveis (Veículos, Imóveis, Eletrônicos, etc)
  - Modalidades (Básico/Elite/Lendário)
  - Campos específicos por categoria
  - Limite por plano
  - Expiração automática
  - Admin completo
- **Gestão de Pistas** ✨ (29/01/2026)
  - Upload de brasão por pista

### 🚧 Em Desenvolvimento

- Sistema de Indicação (especificado, aguardando implementação)
- Integração Stripe para pagamento de tiers do Marketplace
- Página de detalhes do anúncio (/marketplace/[id])
- Cron para expirar anúncios automaticamente

### 🔮 Futuro

- Eventos
- App Mobile
- Avaliações/reviews no Marketplace

---

## 📐 ARQUITETURA DE RANKING (CENTRALIZADO)

### Tabela `user_gamification`
Fonte única de verdade para ranking mensal:

```sql
SELECT 
    ug.user_id,
    p.full_name,
    p.avatar_url,
    ug.monthly_vigor as xp_month,
    ug.total_points
FROM user_gamification ug
JOIN profiles p ON p.id = ug.user_id
ORDER BY ug.monthly_vigor DESC
LIMIT 10
```

### Onde é usado:
- **Rota do Valente** (página pública): Top 10
- **Admin > Temporadas**: Ranking completo + gestão
- **Emails**: Top 3 para premiação
- **API de encerramento**: Ganhadores salvos em `season_winners`

### Reset Mensal
```sql
-- Todo dia 1º às 00:01 (via cron)
UPDATE user_gamification SET monthly_vigor = 0
```

---

## 📁 DOCUMENTOS RELACIONADOS

| Documento | Conteúdo |
|-----------|----------|
| `AGENTS.md` | Guia rápido para IA |
| `ROTA_DO_VALENTE.md` | Detalhes da gamificação |
| `SPEC_REFERRAL_REWARDS.md` | Especificação técnica do Sistema de Indicação |
| `BRAND_GUIDELINES.md` | Manual de identidade visual |

---

*Última atualização: 29/01/2026*  
*Versão: 2.2*  
*Mantido por: Equipe Rota Business Club*
