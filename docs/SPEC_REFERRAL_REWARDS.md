# 📋 ESPECIFICAÇÃO TÉCNICA: Sistema de Indicação e Premiação

**Versão:** 1.0  
**Data:** 27/01/2026  
**Status:** 🔶 Em Análise  
**Backup:** Tag `v1.0-pre-referral-system`

---

## 📌 RESUMO EXECUTIVO

Duas novas mecânicas para o Rota Business Club:

1. **Sistema de Link de Cadastro (Afiliados)** - Usuários ganham comissão por indicações
2. **Sistema de Premiação Mensal (Temporadas)** - Top 3 do ranking ganham prêmios

---

## 🏛️ MECÂNICA 1: Sistema de Link de Cadastro / Afiliados

### 1.1 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **Comissão** | 100% da primeira mensalidade do indicado |
| **Disponibilidade** | Saque disponível 45 dias após pagamento do indicado |
| **Aplicação** | Apenas primeiro pagamento (não inclui upgrades posteriores) |
| **Plano Grátis** | Se indicado entrar grátis, comissão aplicada no primeiro upgrade futuro |
| **Persistência** | Vínculo indicador-indicado é permanente |

### 1.2 Casos de Uso

```
UC1: Indicação Direta
1. Usuário A compartilha seu link: rotabusinessclub.com.br/r/usuario-a
2. Pessoa B acessa o link e se cadastra no Plano Veterano (R$99/mês)
3. Pessoa B paga a primeira mensalidade
4. Sistema registra comissão de R$99 para Usuário A
5. Após 45 dias, Usuário A pode solicitar saque

UC2: Indicação com Cadastro Grátis
1. Usuário A indica Pessoa C
2. Pessoa C se cadastra no Plano Recruta (Grátis)
3. 3 meses depois, Pessoa C faz upgrade para Veterano (R$99/mês)
4. Sistema detecta que C foi indicado por A
5. Comissão de R$99 creditada para Usuário A
6. Após 45 dias do upgrade, saque disponível

UC3: Solicitação de Saque
1. Usuário A tem R$297 disponíveis para saque
2. Usuário A vai em Dashboard > Financeiro > Solicitar Saque
3. Informa dados bancários (Banco, Ag, Conta) ou Chave Pix
4. Solicitação enviada para Admin
5. Admin processa o pagamento manualmente
6. Status atualizado para "Pago"
```

### 1.3 Fluxo do Link

```
URL Padrão: https://rotabusinessclub.com.br/r/{slug}
Exemplo: https://rotabusinessclub.com.br/r/igor-ayres

Alternativa: https://rotabusinessclub.com.br/auth/register?ref={user_id}
```

---

## 🏆 MECÂNICA 2: Sistema de Premiação Mensal (Temporadas)

### 2.1 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **Período** | Mensal (01 a 30/31 de cada mês) |
| **Ranking** | Baseado em XP acumulado no mês |
| **Premiados** | Top 3 colocados |
| **Disparo** | Notificação automática dia 01 para toda base |
| **Gestão** | Admin configura prêmios pelo painel |

### 2.2 Configuração pelo Admin

```
Admin > Rota do Valente > Temporadas

- Temporada: Janeiro 2026
- Período: 01/01/2026 a 31/01/2026
- Status: Ativa | Encerrada | Rascunho

Prêmios:
┌─────────────┬─────────────────────────────────┬─────────────────────────┐
│ Colocação   │ Imagem                          │ Descrição               │
├─────────────┼─────────────────────────────────┼─────────────────────────┤
│ 🥇 1º Lugar │ [Upload imagem]                 │ "iPhone 15 Pro"         │
│ 🥈 2º Lugar │ [Upload imagem]                 │ "Voucher R$500 Amazon"  │
│ 🥉 3º Lugar │ [Upload imagem]                 │ "Kit Rota Business"     │
└─────────────┴─────────────────────────────────┴─────────────────────────┘
```

---

## 🗄️ ANÁLISE DO RAFAEL (DBA) - Modelagem de Dados

### Novas Tabelas Necessárias

```sql
-- ============================================
-- TABELA 1: referrals (Indicações)
-- ============================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Estado da indicação
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'paid_out')),
    
    -- Registro do primeiro pagamento
    first_payment_id UUID REFERENCES payments(id), -- ou subscription_id
    first_payment_amount DECIMAL(10,2),
    first_payment_date TIMESTAMPTZ,
    
    -- Comissão
    commission_amount DECIMAL(10,2),
    commission_available_at TIMESTAMPTZ, -- first_payment_date + 45 days
    commission_status VARCHAR(20) DEFAULT 'pending' CHECK (commission_status IN ('pending', 'available', 'requested', 'paid')),
    
    UNIQUE(referred_id) -- Uma pessoa só pode ser indicada por uma pessoa
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_commission_status ON referrals(commission_status);

-- ============================================
-- TABELA 2: withdrawal_requests (Solicitações de Saque)
-- ============================================
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    
    -- Dados bancários
    bank_type VARCHAR(10) DEFAULT 'pix' CHECK (bank_type IN ('pix', 'transfer')),
    pix_key VARCHAR(100),
    bank_name VARCHAR(100),
    bank_agency VARCHAR(10),
    bank_account VARCHAR(20),
    bank_account_type VARCHAR(20), -- 'corrente' | 'poupanca'
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    admin_notes TEXT,
    processed_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_withdrawal_user ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_status ON withdrawal_requests(status);

-- ============================================
-- TABELA 3: seasons (Temporadas)
-- ============================================
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- "Janeiro 2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
    
    -- Prêmios
    prize_1st_image TEXT,
    prize_1st_description TEXT,
    prize_2nd_image TEXT,
    prize_2nd_description TEXT,
    prize_3rd_image TEXT,
    prize_3rd_description TEXT,
    
    -- Vencedores (preenchido após encerramento)
    winner_1st_id UUID REFERENCES profiles(id),
    winner_2nd_id UUID REFERENCES profiles(id),
    winner_3rd_id UUID REFERENCES profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_seasons_active ON seasons(status) WHERE status = 'active';

-- ============================================
-- TABELA 4: referral_codes (Códigos de Indicação)
-- ============================================
-- Adicionar coluna na tabela profiles existente
ALTER TABLE profiles ADD COLUMN referral_code VARCHAR(50) UNIQUE;
ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES profiles(id);

-- Gerar código baseado no slug
UPDATE profiles SET referral_code = slug WHERE referral_code IS NULL;
```

### RLS Policies

```sql
-- referrals: usuário vê suas próprias indicações
CREATE POLICY "Users can view own referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id);

-- withdrawal_requests: usuário vê suas próprias solicitações
CREATE POLICY "Users can view own withdrawals"
ON withdrawal_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals"
ON withdrawal_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- seasons: todos autenticados podem ver temporadas ativas
CREATE POLICY "Anyone can view active seasons"
ON seasons FOR SELECT
USING (status IN ('active', 'ended'));

-- Admin policies (usando service role ou role check)
```

---

## ⚙️ ANÁLISE DO CARLOS (Backend) - APIs Necessárias

### APIs do Sistema de Indicação

```typescript
// 1. GET /api/referral/code - Obter código do usuário
Response: { code: "igor-ayres", url: "https://rotabusinessclub.com.br/r/igor-ayres" }

// 2. GET /api/referral/stats - Estatísticas de indicação
Response: {
  total_referred: 15,
  converted: 12,
  total_earnings: 1188.00,
  available_balance: 594.00,
  pending_balance: 594.00,
  referrals: [
    { 
      id: "...", 
      referred_name: "João Silva",
      referred_avatar: "...",
      status: "converted",
      commission: 99.00,
      available_at: "2026-03-15T00:00:00Z"
    }
  ]
}

// 3. POST /api/referral/withdraw - Solicitar saque
Request: {
  amount: 500.00,
  bank_type: "pix",
  pix_key: "email@example.com"
}
Response: { success: true, withdrawal_id: "..." }

// 4. POST /api/auth/register-with-referral - Registro com código
Request: {
  ...dados_registro,
  referral_code: "igor-ayres"
}
// Lógica: Salvar referred_by no profile

// 5. Webhook: Após primeiro pagamento
// Trigger Supabase ou Stripe webhook
// Lógica: 
//   - Verificar se user tem referred_by
//   - Criar registro em referrals com commission
//   - Enviar notificação para referrer
```

### APIs do Sistema de Temporadas

```typescript
// 1. GET /api/seasons/current - Temporada atual
Response: {
  id: "...",
  name: "Janeiro 2026",
  start_date: "2026-01-01",
  end_date: "2026-01-31",
  prizes: {
    first: { image: "...", description: "iPhone 15 Pro" },
    second: { image: "...", description: "Voucher R$500" },
    third: { image: "...", description: "Kit Rota" }
  },
  ranking: [
    { position: 1, user_id: "...", name: "...", avatar: "...", xp: 15420 },
    { position: 2, user_id: "...", name: "...", avatar: "...", xp: 14890 },
    // ...
  ]
}

// 2. Admin: POST /api/admin/seasons - Criar temporada
// 3. Admin: PUT /api/admin/seasons/:id - Atualizar temporada
// 4. Admin: POST /api/admin/seasons/:id/end - Encerrar e definir vencedores
```

### Jobs Agendados (Cron)

```typescript
// Job: Dia 01 de cada mês às 00:01
// Ação:
//   1. Encerrar temporada anterior (se existir)
//   2. Definir vencedores baseado em XP do mês
//   3. Criar nova temporada
//   4. Disparar notificação para toda base

// Job: Verificar comissões disponíveis
// A cada hora:
//   - Atualizar status de comissões onde NOW() > commission_available_at
```

---

## 🎨 ANÁLISE DA MARINA (Frontend) - Componentes e Telas

### Telas do Usuário

```
1. Dashboard > Financeiro (Nova aba ou seção)
   ├── Card: Seu Link de Indicação
   │   ├── URL com botão copiar
   │   ├── Botão compartilhar (WhatsApp, etc)
   │   └── QR Code opcional
   │
   ├── Card: Resumo Financeiro
   │   ├── Saldo Disponível: R$ 594,00
   │   ├── Saldo Pendente: R$ 594,00 (liberação em XX dias)
   │   ├── Total Ganho: R$ 1.188,00
   │   └── Botão: Solicitar Saque
   │
   ├── Lista: Suas Indicações
   │   ├── Avatar + Nome
   │   ├── Data de cadastro
   │   ├── Status: Pendente | Convertido | Pago
   │   ├── Comissão: R$ 99,00
   │   └── Disponível em: 15/03/2026
   │
   └── Lista: Histórico de Saques
       ├── Data solicitação
       ├── Valor
       ├── Status: Pendente | Aprovado | Pago
       └── Data pagamento

2. Modal: Solicitar Saque
   ├── Valor disponível: R$ 594,00
   ├── Valor a sacar: [input]
   ├── Tipo: ( ) PIX  ( ) Transferência
   ├── Se PIX: Chave PIX [input]
   ├── Se Transferência: Banco, Agência, Conta
   └── Botão: Confirmar Solicitação

3. Tela: Temporada Atual (Pode ser em Rota do Valente ou Dashboard)
   ├── Banner com prêmios do mês
   ├── Seu ranking atual: #15
   └── Top 10 do ranking
```

### Telas do Admin

```
1. Admin > Rota do Valente > Temporadas
   ├── Lista de temporadas
   ├── Criar nova temporada
   └── Editar temporada
       ├── Nome, datas
       ├── Upload imagens dos prêmios
       ├── Descrição dos prêmios
       └── Status

2. Admin > Financeiro > Indicações
   ├── Visão geral das comissões
   ├── Lista de todas as indicações
   └── Filtros por status

3. Admin > Financeiro > Saques
   ├── Solicitações pendentes
   ├── Aprovar/Rejeitar
   ├── Marcar como pago
   └── Histórico
```

### Sistema de Notificações

```
Notificações do Sistema de Indicação:
- "🎉 João Silva se cadastrou usando seu link!"
- "💰 Sua comissão de R$99 foi creditada!"
- "✅ Sua comissão de R$99 está disponível para saque!"
- "💸 Seu saque de R$500 foi processado!"

Notificações de Temporada:
- "🏆 Nova temporada iniciada! Veja os prêmios de Janeiro!"
- "🔥 Faltam 5 dias para o fim da temporada! Você está em #15"
- "🥇 Parabéns! Você ficou em 1º lugar na temporada de Janeiro!"
```

---

## 📊 IMPACTO NO SISTEMA ATUAL

### Tabelas Afetadas

| Tabela | Alteração |
|--------|-----------|
| `profiles` | +2 colunas: `referral_code`, `referred_by` |
| `notifications` | Novos tipos de notificação |
| `points_history` | Nenhuma (leitura apenas para ranking) |

### Componentes Afetados

| Componente | Alteração |
|------------|-----------|
| `/auth/register` | Capturar `?ref=` da URL |
| `/dashboard` | Nova seção "Financeiro" |
| `/admin` | Novas páginas (temporadas, saques) |
| `notification-center` | Novos tipos de notificação |

### Integrações Externas

| Integração | Uso |
|------------|-----|
| **Stripe** (futuro) | Webhook de pagamento para detectar primeiro pagamento |
| **Resend** | Email de notificação de temporada (dia 01) |

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Banco de Dados (Rafael)
1. Criar migration com novas tabelas
2. Adicionar colunas em profiles
3. Criar RLS policies
4. Criar indexes

### Fase 2: Backend (Carlos)
1. API de código de indicação
2. API de estatísticas
3. API de saque
4. Lógica de registro com referral
5. Trigger/webhook de primeiro pagamento

### Fase 3: Frontend (Marina)
1. Seção Financeiro no Dashboard
2. Card de link de indicação
3. Lista de indicados
4. Modal de saque
5. Integração com notificações

### Fase 4: Admin (Marina + Carlos)
1. Gestão de temporadas
2. Gestão de saques
3. Dashboard de indicações

### Fase 5: Automações
1. Job mensal de temporadas
2. Job de verificação de comissões
3. Notificações automáticas

---

## ⚠️ PONTOS DE ATENÇÃO

1. **Sem Stripe ainda**: O sistema de primeiro pagamento depende de integração com gateway. Inicialmente pode ser manual via Admin.

2. **Fraude**: Usuários podem criar contas fake para ganhar comissão. Considerar:
   - Comissão só após 45 dias
   - Validação de e-mail único
   - Revisão manual para valores altos

3. **Impostos**: Comissões podem configurar renda. Documentar que é responsabilidade do usuário declarar.

4. **Limite de Saque**: Considerar valor mínimo (R$50?) para evitar micro-saques.

---

## ✅ PRÓXIMOS PASSOS

1. [ ] Aprovar especificação com Igor
2. [ ] Criar branch `feature/referral-rewards`
3. [ ] Executar migrations no Supabase
4. [ ] Implementar APIs
5. [ ] Implementar Frontend
6. [ ] Testes integrados
7. [ ] Deploy gradual

---

*Documento gerado pela equipe de desenvolvimento do Rota Business Club*
