# 🔍 REUNIÃO DE REVISÃO - SISTEMA DE COMISSIONAMENTO

**Data:** 28/01/2026  
**Participantes:** Rafael (DBA), Carlos (Backend), Marina (Frontend), Lucas (UX)  
**Status:** 🟡 ANÁLISE EM ANDAMENTO

---

## 📋 CHECKLIST DE REQUISITOS

### ✅ IMPLEMENTADOS (Verificados)

| Requisito | Status | Localização |
|-----------|--------|-------------|
| URL única por usuário (`/r/{slug}`) | ✅ OK | `lib/services/referral-service.ts` linha 114 |
| Vínculo indicador-indicado permanente | ✅ OK | Tabela `referrals` com UNIQUE(referred_id) |
| Comissão 100% primeira mensalidade | ✅ OK | `referral_config.commission_percentage = 100` |
| Verificação de adimplência | ✅ OK | Função `check_and_release_commissions()` |
| Prazo 60 dias para liberação | ✅ OK | `referral_config.release_days = 60` |
| Valor mínimo saque R$ 250 | ✅ OK | `referral_config.min_withdrawal_amount = 250` |
| Painel financeiro do usuário | ✅ OK | `/dashboard/financeiro/page.tsx` |
| Cadastro de PIX para saque | ✅ OK | Tabela `withdrawal_requests` com campos PIX |
| Painel Admin - Configurações | ✅ OK | `components/admin/ReferralManager.tsx` |
| Painel Admin - Saques | ✅ OK | `ReferralManager.tsx` processWithdrawal() |
| Painel Admin - Comissões | ✅ OK | `ReferralManager.tsx` loadCommissions() |

### ⚠️ PENDENTE DE IMPLEMENTAÇÃO

| Requisito | Status | Ação Necessária |
|-----------|--------|-----------------|
| **50 pontos Vigor por indicação** | ❌ NÃO EXISTE | Adicionar chamada `awardPointsForAction()` |
| Notificação ao indicador quando indicado contrata | ⚠️ Verificar | Pode estar no webhook Stripe |

---

## 🔎 ANÁLISE TÉCNICA POR MEMBRO

### 👨‍💻 RAFAEL (DBA) - Estrutura de Dados

**Tabelas verificadas:**
```
✅ referral_config - Configurações do sistema
✅ referrals - Vínculo indicador-indicado
✅ referral_commissions - Comissões registradas
✅ withdrawal_requests - Solicitações de saque
✅ user_referral_balance - VIEW de saldo (auto-calculada)
```

**Função crítica:**
```sql
check_and_release_commissions()
- Verifica prazo (release_date <= NOW())
- Verifica adimplência (subscription.status = 'active')
- Libera ou cancela comissão
```

**⚠️ AÇÃO NECESSÁRIA:**
Adicionar ação de pontos para indicação:
```sql
INSERT INTO point_actions (id, name, description, points_base, category, max_per_day, is_active)
VALUES (
    'referral_converted',
    'Indicação convertida',
    'Indicado contratou um plano pago',
    50,
    'referral',
    NULL,  -- Sem limite
    true
);
```

---

### ⚙️ CARLOS (Backend) - APIs e Lógica

**Serviço principal:** `lib/services/referral-service.ts`

| Função | Status | Descrição |
|--------|--------|-----------|
| `getReferralConfig()` | ✅ OK | Busca config com cache 5min |
| `registerReferral()` | ✅ OK | Registra vínculo |
| `registerCommission()` | ⚠️ PRECISA AJUSTAR | Falta dar pontos de Vigor |
| `getUserReferralBalance()` | ✅ OK | Busca saldo via VIEW |
| `getUserReferrals()` | ✅ OK | Lista indicações |
| `requestWithdrawal()` | ✅ OK | Solicita saque com validações |
| `canRequestWithdrawal()` | ✅ OK | Verifica se pode sacar |

**⚠️ AÇÃO NECESSÁRIA - `registerCommission()`:**
```typescript
// Após registrar comissão, dar pontos ao indicador
await fetch('/api/rota-valente/award', {
    method: 'POST',
    body: JSON.stringify({
        userId: referral.referrer_id,  // Indicador recebe os pontos
        actionId: 'referral_converted',
        metadata: {
            referred_id: referredUserId,
            commission_amount: commissionAmount
        }
    })
})
```

---

### 🎨 MARINA (Frontend) - Interface

**Páginas verificadas:**

| Página | Status | Funcionalidades |
|--------|--------|-----------------|
| `/dashboard/financeiro` | ✅ OK | Link, saldo, indicações, saque |
| Admin ReferralManager | ✅ OK | Config, saques, comissões |

**Componentes do dashboard financeiro:**
- ✅ Card de link de indicação (copiar, WhatsApp)
- ✅ Cards de saldo (disponível, pendente, total)
- ✅ Modal de saque (PIX tipo + chave)
- ✅ Lista de indicações com status

**Componentes do admin:**
- ✅ Aba Configurações (%, dias, mínimo)
- ✅ Aba Saques (aprovar, rejeitar, pagar)
- ✅ Aba Indicações (lista completa)
- ✅ Aba Comissões (lista com status)

---

## 🆕 REGRA NOVA: 50 Pontos por Indicação Convertida

### Especificação:
- **Ação:** `referral_converted`
- **Pontos Base:** 50
- **Multiplicador:** SIM (aplica conforme plano do INDICADOR)
- **Momento:** Quando o indicado faz o primeiro pagamento
- **Limite:** Sem limite diário

### Resultado por Plano (indicador):
| Plano | Base | Multi | Total |
|-------|------|-------|-------|
| Recruta | 50 | 1.0x | 50 pts |
| Veterano | 50 | 1.5x | 75 pts |
| Elite | 50 | 3.0x | 150 pts |

### Implementação:

**1. Banco de Dados (SQL):**
```sql
INSERT INTO point_actions (id, name, description, points_base, category, max_per_day, is_active)
VALUES (
    'referral_converted',
    'Indicação convertida',
    'Pontos ganhos quando seu indicado contrata um plano pago',
    50,
    'referral',
    NULL,
    true
);
```

**2. Backend (`lib/services/referral-service.ts`):**
Na função `registerCommission()`, após inserir a comissão:
```typescript
// Adicionar após linha 260 (return { success: true, commissionAmount })

// Dar pontos de Vigor ao indicador
try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rota-valente/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: referral.referrer_id,
            actionId: 'referral_converted',
            metadata: {
                referred_id: referredUserId,
                commission_amount: commissionAmount,
                payment_amount: paymentAmount
            }
        })
    })
    console.log('[ReferralService] ✅ Pontos de indicação creditados')
} catch (pointsError) {
    console.error('[ReferralService] Erro ao creditar pontos:', pointsError)
    // Não bloqueia o registro da comissão
}
```

---

## ✅ MATRIZ DE VERIFICAÇÃO FINAL

| Regra | Código | Banco | Admin | Usuário |
|-------|--------|-------|-------|---------|
| URL única /r/{slug} | ✅ | N/A | N/A | ✅ |
| Vínculo permanente | ✅ | ✅ | ✅ | N/A |
| 100% primeira mensalidade | ✅ | ✅ | ✅ | ✅ |
| 60 dias para liberação | ✅ | ✅ | ✅ | ✅ |
| Adimplência obrigatória | ✅ | ✅ | ✅ | ❌ (info oculta) |
| Mínimo R$ 250 saque | ✅ | ✅ | ✅ | ✅ |
| PIX no painel | ✅ | ✅ | N/A | ✅ |
| 50 pts Vigor | ⏳ | ⏳ | N/A | ⏳ |
| Admin gerencia tudo | ✅ | ✅ | ✅ | N/A |

---

## 📝 AÇÕES PENDENTES

### 1. Executar SQL para criar ação de pontos
```bash
# A fazer quando o usuário autorizar
```

### 2. Alterar `referral-service.ts`
- Adicionar chamada de pontos em `registerCommission()`

### 3. Documentar no ESCOPO_PROJETO.md
- Adicionar regra de 50 pts por indicação

---

## 🔄 FLUXO COMPLETO (com ajustes)

```
1. Usuário 1 compartilha link /r/{slug}
2. Usuário 2 acessa e se cadastra (plano gratuito ou pago)
   → Registra vínculo na tabela `referrals`
3. Usuário 2 contrata plano pago (ou faz upgrade)
   → Stripe processa pagamento
   → Webhook detecta primeiro pagamento
   → Chama registerCommission()
   → Registra comissão em `referral_commissions`
   → ⭐ NOVO: Credita 50 pts Vigor para Usuário 1
   → Notifica Usuário 1
4. Sistema aguarda 60 dias
5. Sistema verifica adimplência de Usuário 2
   → Se em dia: comissão.status = 'available'
   → Se inadimplente: comissão.status = 'cancelled'
6. Usuário 1 acessa /dashboard/financeiro
   → Vê saldo disponível
   → Solicita saque (mínimo R$ 250)
   → Informa chave PIX
7. Admin aprova e processa saque
```

---

*Documento gerado pela equipe de desenvolvimento - 28/01/2026*
