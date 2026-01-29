# 📋 PLANO DE CONTINUIDADE - MARKETPLACE

**Data:** 29/01/2026  
**Versão:** 1.0  
**Status:** 🟡 Em Andamento

---

## ✅ O QUE FOI FEITO (29/01/2026)

### 1. Banco de Dados
- [x] Tabela `marketplace_categories` - Categorias de anúncios
- [x] Tabela `marketplace_ad_tiers` - Modalidades (Básico/Elite/Lendário)
- [x] Tabela `marketplace_ads` - Anúncios em si
- [x] Bucket `marketplace` no Storage para imagens
- [x] Bucket `pistas` no Storage para brasões
- [x] Função `expire_marketplace_ads()` para expiração automática
- [x] RLS Policies para todas as tabelas

### 2. Categorias Criadas
| Categoria | Slug | Duração | Ícone |
|-----------|------|---------|-------|
| Veículos | veiculos | 30 dias | Car |
| Imóveis | imoveis | 60 dias | Home |
| Eletrônicos | eletronicos | 30 dias | Smartphone |
| Artigos para Escritório | escritorio | 30 dias | Briefcase |
| Artigos Esportivos | esportivos | 30 dias | Dumbbell |
| Hobbies | hobbies | 30 dias | Gamepad2 |
| Outros | outros | 30 dias | Package |

### 3. Modalidades Criadas
| Categoria | Modalidade | Preço | Duração | Boost |
|-----------|------------|-------|---------|-------|
| Veículos | Básico | Grátis | 30d | 0 |
| Veículos | Elite | R$ 49,90 | 45d | 50 |
| Veículos | Lendário | R$ 99,90 | 60d | 100 |
| Imóveis | Básico | Grátis | 60d | 0 |
| Imóveis | Elite | R$ 79,90 | 90d | 50 |
| Imóveis | Lendário | R$ 149,90 | 120d | 100 |

### 4. Frontend Implementado
- [x] `/marketplace` - Listagem de anúncios (dados reais)
- [x] `/marketplace/create` - Criação de anúncios com:
  - Seleção de categoria
  - Seleção de modalidade (Básico/Elite/Lendário)
  - Campos específicos (Veículos: ano/km/cor, Imóveis: m²/quartos)
  - Limite por plano do usuário
  - Upload de fotos
- [x] `MarketplaceCard` - Card com destaques Elite/Lendário
- [x] Removidos todos os dados MOCK

### 5. Admin Implementado
- [x] `/admin/marketplace` com 3 abas:
  - **Anúncios:** Lista, filtros, marcar como vendido, excluir
  - **Categorias:** CRUD (nome, slug, ícone, duração)
  - **Modalidades:** CRUD (preço, duração, boost, destaques)

### 6. Outros
- [x] Upload de brasão nas pistas (`/admin/pistas`)
- [x] Correção de filtros de notificações (plan_config, pistas)
- [x] Build passando ✅
- [x] Deploy feito ✅
- [x] Documentação atualizada (ESCOPO_PROJETO.md v2.2)

---

## 🚧 PRÓXIMAS TAREFAS (Prioridade Alta)

### 1. Página de Detalhes do Anúncio
**Arquivo:** `/app/marketplace/[id]/page.tsx`

**Funcionalidades:**
- [ ] Galeria de fotos
- [ ] Detalhes completos do anúncio
- [ ] Informações do vendedor
- [ ] Botão "Entrar em contato" (abre chat ou WhatsApp)
- [ ] Botão "Marcar como vendido" (só para o dono)
- [ ] Contador de visualizações
- [ ] Anúncios relacionados

### 2. Integração Stripe para Tiers Pagos
**Arquivos:**
- `/app/api/marketplace/checkout/route.ts`
- `/app/api/stripe/webhook/route.ts` (adicionar handler)

**Fluxo:**
1. Usuário seleciona tier Elite ou Lendário
2. Clica em "Continuar para Pagamento"
3. Redirect para Stripe Checkout
4. Webhook recebe `checkout.session.completed`
5. Atualiza anúncio: `status = 'active'`, `payment_status = 'paid'`

**Tarefas:**
- [ ] Criar produtos no Stripe Dashboard para cada tier
- [ ] Salvar `stripe_product_id` e `stripe_price_id` nos tiers
- [ ] Criar API de checkout
- [ ] Atualizar webhook

### 3. Cron para Expirar Anúncios
**Opções:**
- Edge Function com cron no Supabase
- OU job diário via Vercel Cron

**SQL já criado:**
```sql
CREATE OR REPLACE FUNCTION expire_marketplace_ads()
RETURNS void AS $$
BEGIN
    UPDATE marketplace_ads
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

**Tarefas:**
- [ ] Criar Edge Function `/functions/expire-ads`
- [ ] Configurar cron para rodar 1x/dia

---

## 🟡 PRÓXIMAS TAREFAS (Prioridade Média)

### 4. Meus Anúncios (Dashboard do Usuário)
**Arquivo:** `/app/dashboard/marketplace/page.tsx`

**Funcionalidades:**
- [ ] Lista dos meus anúncios
- [ ] Status de cada um (ativo, expirado, vendido)
- [ ] Botão "Marcar como vendido"
- [ ] Botão "Renovar" (para expirados)
- [ ] Contador de visualizações

### 5. Busca e Filtros Avançados
**Em:** `/app/marketplace/page.tsx`

**Funcionalidades:**
- [ ] Filtro por faixa de preço
- [ ] Filtro por condição (novo/usado)
- [ ] Ordenação (mais recentes, menor preço, maior preço)
- [ ] Busca por localização

### 6. Avaliações e Reviews
**Tabela:** `marketplace_reviews`

**Funcionalidades:**
- [ ] Avaliar vendedor após compra
- [ ] Estrelas + comentário
- [ ] Exibir média no perfil

---

## 🔮 TAREFAS FUTURAS

### 7. Notificações do Marketplace
- [ ] "Seu anúncio expira em 3 dias"
- [ ] "Seu anúncio foi visualizado X vezes"
- [ ] "Alguém se interessou pelo seu anúncio"

### 8. Relatórios no Admin
- [ ] Total de vendas por período
- [ ] Valor total movimentado
- [ ] Categorias mais populares

### 9. SEO para Anúncios
- [ ] Meta tags dinâmicas
- [ ] Sitemap de anúncios
- [ ] Structured Data (JSON-LD)

---

## 📁 ESTRUTURA DE ARQUIVOS

```
app/
├── marketplace/
│   ├── page.tsx              ✅ Listagem
│   ├── create/
│   │   └── page.tsx          ✅ Criação
│   └── [id]/
│       └── page.tsx          ❌ CRIAR
│
├── admin/
│   └── marketplace/
│       └── page.tsx          ✅ Admin completo
│
└── api/
    └── marketplace/
        └── checkout/
            └── route.ts      ❌ CRIAR (Stripe)

components/
└── marketplace/
    └── marketplace-card.tsx  ✅ Card com destaques

lib/
└── data/
    └── marketplace.ts        ✅ Tipos e utilitários
```

---

## 🗄️ TABELAS DO BANCO

| Tabela | Status | Descrição |
|--------|--------|-----------|
| `marketplace_categories` | ✅ | Categorias |
| `marketplace_ad_tiers` | ✅ | Modalidades |
| `marketplace_ads` | ✅ | Anúncios |
| `marketplace_reviews` | ❌ | Avaliações (futuro) |

---

## 📌 COMANDOS ÚTEIS

```bash
# Build local
npm run build

# Deploy
git add -A && git commit -m "feat: ..." && git push origin main

# Consultar categorias
psql -c "SELECT * FROM marketplace_categories;"

# Consultar modalidades
psql -c "SELECT c.name, t.name, t.price, t.duration_days FROM marketplace_ad_tiers t JOIN marketplace_categories c ON t.category_id = c.id;"

# Consultar anúncios
psql -c "SELECT title, status, expires_at FROM marketplace_ads ORDER BY created_at DESC LIMIT 10;"
```

---

*Última atualização: 29/01/2026*
