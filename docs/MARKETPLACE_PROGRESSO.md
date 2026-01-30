# 📊 PROGRESSO DA IMPLEMENTAÇÃO DO MARKETPLACE

> **Última atualização:** 29/01/2026 - 15:55  
> **Status:** ETAPA A CONCLUÍDA ✅

---

## ✅ ETAPA A: ESTRUTURA BASE - **CONCLUÍDA**

### **1. Categorias** ✅
- ✅ 17 categorias criadas no banco de dados
- ✅ Veículos e Imóveis mantidos no topo
- ✅ 15 novas categorias adicionadas:
  - Artigos domésticos, esportivos, animais, escritório
  - Brinquedos, classificados, eletrônicos, entretenimento
  - Família, hobbies, instrumentos musicais, itens gratuitos
  - Jardim, suprimentos reforma, vestuário

### **2. Tiers (Planos Globais)** ✅
- ✅ Tabela `marketplace_ad_tiers` atualizada
- ✅ Campos adicionados: `max_photos`, `duration_days`
- ✅ Valores configurados:
  - **Básico:** Grátis | 5 fotos | 30 dias
  - **Elite:** R$ 49,90 | 10 fotos | 45 dias
  - **Lendário:** R$ 79,90 | 25 fotos | 60 dias

### **3. Admin do Marketplace** ✅
- ✅ Aba "Planos" criada
- ✅ Aba "Modalidades" removida (não era necessária)
- ✅ 3 abas finais: Anúncios, Categorias, Planos
- ✅ Interface visual para os 3 tiers globais
- ⚠️ Falta: Adicionar campo `max_photos` no dialog de edição

### **4. Cron Jobs** ✅
- ✅ Job `expire-marketplace-ads` criado
- ✅ Executa diariamente às 00:00
- ✅ Marca anúncios como `expired` quando `expires_at < now()`

---

## 🚀 PRÓXIMAS ETAPAS

### **ETAPA B: FLUXO DE CRIAÇÃO OTIMIZADO**
- [ ] Ajustar `/marketplace/create` (remover escolha de tier)
- [ ] Criar página `/marketplace/[id]/choose-tier`
- [ ] Integrar Stripe checkout para tiers pagos
- [ ] Sistema de créditos (contador de anúncios Básicos inclusos)
- [ ] Mensagens para usuário Recruta

### **ETAPA C: HOME DO MARKETPLACE**
- [ ] Banner carrossel (anúncios Lendário)
- [ ] Grid de destaques (Elite + Lendário)
- [ ] Ordem de prioridade (Lendário → Elite → Básico)

### **ETAPA D: PÁGINAS DEDICADAS**
- [ ] `/marketplace/veiculos` - Filtros específicos
- [ ] `/marketplace/imoveis` - Filtros específicos

### **ETAPA E: INTEGRAÇÃO CHAT**
- [ ] Botão "Entrar em Contato" no anúncio
- [ ] Criar/abrir chat com vendedor

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### **Migrations:**
- ✅ `20260129_marketplace_categories_update.sql`
- ✅ `20260129_marketplace_tiers_update.sql`
- ✅ `20260129_marketplace_cron_expire_ads.sql`

### **Componentes:**
- ✅ `components/marketplace/legendary-carousel.tsx`
- ✅ `components/marketplace/premium-ad-card.tsx`

### **Lib:**
- ✅ `lib/gamification/marketplace.ts`

### **API:**
- ✅ `app/api/gamification/award-proeza/route.ts`

### **Admin:**
- ✅ `app/admin/marketplace/page.tsx` (atualizado)

### **Documentação:**
- ✅ `docs/MEDALHAS_MARKETPLACE.md`
- ✅ `docs/GAMIFICACAO_MARKETPLACE_IMPLEMENTADO.md`
- ✅ `docs/ACOES_MISSOES_MARKETPLACE.md`

---

## ⚠️ PENDÊNCIAS TÉCNICAS

1. **Admin - Dialog de Edição:**
   - Adicionar campo `max_photos` no dialog de edição de tiers
   - Atualizar função `saveTier()` para incluir `max_photos`

2. **Validações:**
   - Validar `max_photos` ao criar/editar anúncio
   - Limitar upload de fotos conforme tier escolhido

3. **Stripe:**
   - Configurar `stripe_price_id` para tiers Elite e Lendário
   - Testar webhook de pagamento

---

## 🎯 FOCO ATUAL: ETAPA B

**Próximo passo:** Ajustar fluxo de criação de anúncios
- Usuário preenche tudo primeiro (draft)
- Depois escolhe tier (grátis ou pago)
- Redireciona para Stripe se necessário
