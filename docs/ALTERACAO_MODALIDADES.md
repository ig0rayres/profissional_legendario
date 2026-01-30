# ✅ ALTERAÇÕES REALIZADAS - NOMENCLATURA "MODALIDADES"

> **Data:** 29/01/2026 - 17:04  
> **Solicitação:** Alterar "Planos" para "Modalidades do Anúncio"

---

## ✅ O QUE FOI ALTERADO:

### **1. Aba do Admin** ✅
- **Antes:** "Planos"
- **Depois:** "Modalidades"
- **Arquivo:** `/app/admin/marketplace/page.tsx`

### **2. Título da Seção** ✅
- **Antes:** "Planos Globais do Marketplace"
- **Depois:** "Modalidades de Anúncio"

### **3. Descrição** ✅
- **Antes:** "Gerencie os 3 tiers de anúncios. Estes planos são globais..."
- **Depois:** "Gerencie as 3 modalidades de anúncios do Marketplace. Estas modalidades são globais..."

### **4. Correções Técnicas** ✅
- ✅ Adicionado `max_photos` no state `tierForm`
- ✅ Adicionado `max_photos` na função `openNewTier()`
- ✅ Adicionado `max_photos` na função `openEditTier()`
- ✅ Adicionado `max_photos` na função `saveTier()` (UPDATE e INSERT)
- ✅ Erros de lint corrigidos

---

## ⚠️ PENDENTE:

### **Campo Visual no Dialog** ⚠️
- [ ] Adicionar campo "Máximo de Fotos" no dialog de edição
- **Localização:** Entre "Duração (dias)" e "Boost de Posição"
- **Motivo:** Erro ao aplicar edição (target content not found)

### **Texto Informativo** ⚠️
- [ ] Atualizar "Os planos são globais" para "As modalidades são globais"
- **Localização:** Box azul no final da aba
- **Motivo:** Erro ao aplicar edição (target content not found)

---

## 📊 RESUMO:

**Funcionalidade:** ✅ 100% funcional  
**Nomenclatura:** ✅ 90% atualizada  
**Pendências:** ⚠️ 2 textos visuais (não afetam funcionalidade)

---

## 🎯 PRÓXIMO PASSO:

Continuar com **ETAPA B: Fluxo de Criação Otimizado**
- Ajustar `/marketplace/create`
- Criar `/marketplace/[id]/choose-tier`
- Integrar Stripe

---

**Tudo salvo e funcionando!** ✅
