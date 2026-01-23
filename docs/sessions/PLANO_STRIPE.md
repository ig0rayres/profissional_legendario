# 💳 Plano de Implementação - Stripe

> **Data:** 23/01/2026  
> **Status:** Em Andamento

---

## 📋 Visão Geral

### Objetivo
Integrar Stripe para processamento de pagamentos de assinaturas dos planos Recruta, Veterano e Elite.

### Planos Existentes
| Tier | Nome | Preço |
|------|------|-------|
| recruta | Recruta | Grátis |
| veterano | Veterano | R$ X/mês |
| elite | Elite | R$ X/mês |

---

## 🏗️ Arquitetura

```
┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Stripe        │
│   (Next.js)     │◄────►│   Checkout      │
└────────┬────────┘      └────────┬────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│   API Routes    │      │   Webhooks      │
│   (subscribe)   │      │   (events)      │
└────────┬────────┘      └────────┬────────┘
         │                        │
         └────────┬───────────────┘
                  ▼
         ┌─────────────────┐
         │   Supabase      │
         │   (subscriptions)│
         └─────────────────┘
```

---

## 📝 Checklist de Implementação

### Fase 1: Configuração Stripe ⏳
- [ ] Criar conta Stripe
- [ ] Obter API Keys (test + live)
- [ ] Criar Products no Stripe Dashboard
- [ ] Criar Prices (mensal) para cada produto
- [ ] Configurar Customer Portal

### Fase 2: Backend (APIs) 🔧
- [ ] Instalar pacote `stripe`
- [ ] Criar `/api/stripe/create-checkout` - Sessão de checkout
- [ ] Criar `/api/stripe/webhook` - Processar eventos
- [ ] Criar `/api/stripe/portal` - Customer portal
- [ ] Atualizar tabela `subscriptions` com stripe_customer_id
- [ ] Atualizar tabela `plans` com stripe_price_id

### Fase 3: Frontend 🎨
- [ ] Botão "Assinar" redireciona para Stripe Checkout
- [ ] Página de sucesso `/checkout/success`
- [ ] Página de cancelamento `/checkout/cancel`
- [ ] Botão para acessar Customer Portal
- [ ] Exibir status da assinatura no dashboard

### Fase 4: Webhooks 📡
- [ ] `checkout.session.completed` - Nova assinatura
- [ ] `customer.subscription.updated` - Mudança de plano
- [ ] `customer.subscription.deleted` - Cancelamento
- [ ] `invoice.payment_succeeded` - Renovação
- [ ] `invoice.payment_failed` - Falha no pagamento

### Fase 5: Testes & Deploy 🚀
- [ ] Testar fluxo completo em sandbox
- [ ] Configurar webhook no Vercel
- [ ] Trocar para keys live
- [ ] Testar em produção

---

## 🗄️ Alterações no Banco de Dados

### Tabela `plans` - Adicionar:
```sql
ALTER TABLE plans ADD COLUMN stripe_product_id TEXT;
ALTER TABLE plans ADD COLUMN stripe_price_id TEXT;
```

### Tabela `subscriptions` - Adicionar:
```sql
ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
```

---

## 🔑 Variáveis de Ambiente

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...      # ou sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📁 Arquivos a Criar

```
/app/api/stripe/
├── create-checkout/route.ts    # Criar sessão de checkout
├── webhook/route.ts            # Processar webhooks
└── portal/route.ts             # Customer portal

/app/checkout/
├── success/page.tsx            # Página de sucesso
└── cancel/page.tsx             # Página de cancelamento

/lib/stripe/
├── client.ts                   # Cliente Stripe
└── webhooks.ts                 # Handlers de webhook
```

---

## 🚀 Próximos Passos

1. **Você precisa criar conta no Stripe** (se ainda não tiver)
2. Me informe quando tiver as API Keys de teste
3. Vamos implementar passo a passo

---

*Criado por: Carlos (Backend) + Rafael (DBA)*
