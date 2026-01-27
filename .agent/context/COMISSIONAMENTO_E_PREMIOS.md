# 📚 DOCUMENTAÇÃO COMPLETA - SISTEMAS DE COMISSIONAMENTO E PRÊMIOS

*Última atualização: 27/01/2026*

---

## 🏆 SISTEMA DE TEMPORADAS

### O que é?
Sistema de competição mensal onde usuários acumulam pontos de vigor (XP) e os Top 3 ganham prêmios.

### Tabelas do Banco

```sql
-- Temporadas (meses)
seasons (
    id UUID PRIMARY KEY,
    name VARCHAR,              -- "January 2026"
    year INT,
    month INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR,            -- 'upcoming', 'active', 'finished'
    banner_url TEXT,           -- Imagem do banner
    created_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
)

-- Prêmios de cada temporada
season_prizes (
    id UUID PRIMARY KEY,
    season_id UUID REFERENCES seasons,
    position INT,              -- 1, 2 ou 3
    title VARCHAR,             -- "🥇 iPhone 15 Pro"
    description TEXT,
    image_url TEXT             -- Imagem do prêmio
)

-- Vencedores registrados
season_winners (
    id UUID PRIMARY KEY,
    season_id UUID,
    user_id UUID,
    position INT,
    xp_earned INT,
    prize_id UUID,
    prize_value DECIMAL(10,2), -- Valor em R$
    pix_key TEXT,
    pix_key_type VARCHAR,      -- 'cpf', 'email', 'phone', 'random'
    payment_status VARCHAR,    -- 'pending', 'processing', 'paid'
    paid_at TIMESTAMPTZ,
    paid_by UUID
)
```

### Funções SQL

```sql
-- Retorna temporada ativa
get_active_season()

-- Ranking do mês (ordenado por XP)
get_season_ranking(p_season_id UUID, p_limit INT)

-- Posição do usuário no ranking
get_user_season_position(p_user_id UUID, p_season_id UUID)
```

### Componentes Admin

| Componente | Arquivo | Função |
|------------|---------|--------|
| SeasonsManager | `components/admin/SeasonsManager.tsx` | Gerencia prêmios, ranking, encerrar temporada |

### Componentes Frontend

| Componente | Arquivo | Função |
|------------|---------|--------|
| SeasonPromoBanner | `components/seasons/SeasonPromoBanner.tsx` | Banner de divulgação (2 versões) |

### Onde aparecem os banners

- **Dashboard (sidebar)**: Versão compacta
- **Rota do Valente**: Versão épica/completa

---

## 🎨 IA DOS PRÊMIOS (DALL-E 3)

### O que é?
Sistema que usa DALL-E 3 para gerar imagens incríveis dos prêmios.

### Arquivos

| Arquivo | Função |
|---------|--------|
| `lib/config/image-enhancement-prompts.ts` | **PROMPTS EDITÁVEIS** |
| `app/api/seasons/enhance-image/route.ts` | API que chama DALL-E |

### Como editar prompts

```typescript
// lib/config/image-enhancement-prompts.ts

// Prompt base (aplica a todos)
basePrompt: `Ultra-realistic professional product photography...`

// Por posição
positionPrompts: {
    1: `Golden luxury theme, winner's podium...`,
    2: `Silver elegance theme...`,
    3: `Bronze premium theme...`
}

// Por categoria (detectado automaticamente)
categoryPrompts: {
    electronics: `Tech product showcase...`,
    travel: `Luxury travel theme...`,
    money: `Financial reward...`,
    product: `Premium gift box...`,
    default: `Luxury prize...`
}
```

### Requisitos

```env
OPENAI_API_KEY=sk-...
```

### Referência rápida
Diga: **"IA dos Prêmios"** ou **"Prompt das Temporadas"**

---

## 💰 PAGAMENTO DE PRÊMIOS (PIX)

### O que é?
Sistema para gerenciar pagamentos Pix para vencedores de temporadas.

### Onde fica?
**Admin > Financeiro > Prêmios**

### Funcionalidades

1. **Lista de vencedores** - Todos os vencedores de todas temporadas
2. **Editar prêmio** - Definir valor em R$
3. **Cadastrar Pix** - CPF, Email, Telefone ou Chave Aleatória
4. **Marcar como pago** - Atualiza status e notifica vencedor
5. **Stats** - Total pago vs pendente

### Componente
`components/admin/PrizePaymentManager.tsx`

### Fluxo

```
1. Temporada encerra → Vencedores registrados
2. Admin define valor do prêmio
3. Vencedor informa chave Pix (ou admin cadastra)
4. Admin faz Pix manualmente
5. Admin clica "Paguei"
6. Vencedor recebe notificação
```

---

## 📊 RELATÓRIOS DE COMISSÕES

### O que é?
Dashboard com relatórios mensais de comissões do programa de indicação.

### Onde fica?
**Admin > Financeiro > Relatórios**

### Funcionalidades

1. **Cards de resumo** - Total indicações, valor gerado, pago, pendente
2. **Relatório mensal** - Tabela mês a mês
3. **Seletor de ano** - Navegar entre anos
4. **Exportar CSV** - Baixar relatório
5. **Totais anuais** - Soma do ano

### Componente
`components/admin/CommissionReportsManager.tsx`

### Função SQL

```sql
-- Gera relatório de um mês específico
generate_monthly_commission_report(p_month INT, p_year INT)
```

---

## 🔗 SISTEMA DE INDICAÇÕES (JÁ EXISTIA)

### O que é?
Sistema onde usuários indicam novos membros e ganham comissão.

### Onde fica?
**Admin > Financeiro > Comissões**

### Tabelas

```sql
referral_config     -- Configurações (%, dias, valor mínimo saque)
referrals           -- Indicações (quem indicou quem)
referral_commissions -- Comissões geradas
referral_balances   -- Saldos dos usuários
withdrawal_requests -- Solicitações de saque
```

### Componente
`components/admin/ReferralManager.tsx`

### Serviço
`lib/services/referral-service.ts`

---

## 📁 ESTRUTURA DE ARQUIVOS

```
📂 app/
├── 📂 admin/
│   ├── 📂 financeiro/
│   │   └── page.tsx              # 7 abas: Dashboard, Planos, Comissões, Relatórios, Prêmios, Cupons, Campanhas
│   └── 📂 rota-valente/
│       └── page.tsx              # Temporadas
├── 📂 api/
│   └── 📂 seasons/
│       ├── enhance-image/route.ts  # DALL-E 3
│       └── send-emails/route.ts    # Emails de campanha

📂 components/
├── 📂 admin/
│   ├── SeasonsManager.tsx          # Gerenciar temporadas
│   ├── PrizePaymentManager.tsx     # Pagamento de prêmios
│   ├── CommissionReportsManager.tsx # Relatórios
│   └── ReferralManager.tsx         # Indicações
├── 📂 seasons/
│   └── SeasonPromoBanner.tsx       # Banner de divulgação

📂 lib/
├── 📂 config/
│   └── image-enhancement-prompts.ts  # Prompts DALL-E
├── 📂 services/
│   └── referral-service.ts          # Lógica de indicações

📂 .agent/context/
├── CONTEXTO_PROJETO.md
├── AGENTS.md
└── IA_DOS_PREMIOS.md               # Doc específica de IA
```

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# OpenAI (DALL-E 3)
OPENAI_API_KEY=sk-...

# Stripe (pagamentos)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email
RESEND_API_KEY=...
```

---

## 📋 CHECKLIST DE FUNCIONALIDADES

### Temporadas
- [x] Criar temporada automática (mensal)
- [x] Upload de banner da temporada
- [x] Upload de imagem dos prêmios
- [x] Gerar imagem com DALL-E 3
- [x] Ranking em tempo real
- [x] Encerrar temporada (registra vencedores)
- [x] Criar próxima temporada automaticamente
- [x] Notificar vencedores
- [x] Enviar emails de campanha
- [x] Banner de divulgação (2 versões)

### Pagamento de Prêmios
- [x] Listar vencedores
- [x] Definir valor do prêmio
- [x] Cadastrar chave Pix
- [x] Marcar como pago
- [x] Notificar vencedor quando pago
- [x] Estatísticas (pago vs pendente)

### Relatórios de Comissões
- [x] Resumo geral (totais)
- [x] Relatório mensal
- [x] Seletor de ano
- [x] Exportar CSV
- [x] Indicadores ativos

### Sistema de Indicações
- [x] Configurar % de comissão
- [x] Configurar dias de liberação
- [x] Ver indicações
- [x] Ver comissões
- [x] Processar saques
- [x] Marcar como pago

---

## 🚀 PRÓXIMOS PASSOS SUGERIDOS

1. **Automatizar pagamentos Pix** - Integrar com API de banco (Asaas, Pagar.me, etc)
2. **Histórico de vencedores público** - Hall da Fama
3. **Prêmios não monetários** - Produtos físicos, experiências
4. **Gamificação de indicação** - Badges para top indicadores
5. **Dashboard financeiro mais rico** - Gráficos, projeções

---

*Fim da documentação*
