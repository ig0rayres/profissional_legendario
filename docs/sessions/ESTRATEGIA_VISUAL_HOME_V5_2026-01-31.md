# 🎨 ESTRATÉGIA VISUAL - HOME V5 COM FOTOS ROTA

**Designer:** Lucas Mendes  
**Data:** 31/01/2026  
**Status:** 📋 PROPOSTA PARA APROVAÇÃO

---

## 📸 RESUMO DO ACERVO

- **Total de fotos:** 139 imagens profissionais
- **Categorias identificadas:**
  - Eventos ROTA (TOP 1079 series)
  - Fotos de ação/trail (séries A, B, D)
  - Fotos de perigo/aventura (FotoPerigo series)
- **Qualidade:** Alta resolução, profissionais

---

## 🎯 ESTRATÉGIA DE USO DAS FOTOS

### ✅ **HERO SECTION (Mantida)**
**Foto atual:** `TOP 1079 (1094).jpg`  
**Status:** ✅ **NÃO ALTERAR** (conforme solicitado)  
**Motivo:** Já está perfeita - ação, energia, comunidade

---

### 1. **SEÇÃO DE ESTATÍSTICAS (Stats)**
**Objetivo:** Reforçar credibilidade e escala

**Sugestão:** Adicionar foto de fundo sutil com overlay
- **Foto:** `TOP 1079 (1792).jpg` ou `TOP 1079 (285).jpg`
- **Tratamento:** Overlay escuro 90%, desfoque suave
- **Efeito:** Profundidade sem competir com números

---

### 2. **GALERIA/MOMENTOS ÉPICOS (NOVA SEÇÃO)**
**Objetivo:** Mostrar a energia e comunidade ROTA

**Layout:** Grid Masonry (estilo Pinterest) com 12-15 fotos

**Fotos selecionadas (curadoria profissional):**

**Grupo 1 - Ação e Energia (6 fotos):**
1. `TOP 1079 (1792).jpg` - Ação principal
2. `TOP 1079 (2240).jpg` - Grupo em movimento
3. `A (225).jpg` - Momento épico
4. `TOP 1079 (3086).jpg` - Aventura
5. `B (1).jpg` - Esforço e determinação
6. `TOP 1079 (4243).jpg` - Celebração

**Grupo 2 - Comunidade e Conexão (6 fotos):**
7. `TOP 1079 (1891).jpg` - Grupo unido
8. `D (268).jpg` - Networking
9. `TOP 1079 (5688).jpg` - Momentode confraternização
10. `A (771).jpg` - Amizade
11. `TOP 1079 (6434).jpg` - Equipe
12. `TOP 1079 (741).jpg` - Celebração coletiva

**Grupo 3 - Paisagens Épicas (3 fotos):**
13. `TOP 1079 (285).jpg` - Natureza grandiosa
14. `TOP 1079 (413).jpg` - Cenário inspirador
15. `D (330).jpg` - Aventura visual

**Interação:**
- Hover: Escala 105%, overlay com descrição
- Click: Modal com foto em alta resolução
- Animação: Entrada escalonada (stagger)

---

### 3. **SEÇÃO "EVENTOS" (Atualizar fotos)**
**Objetivo:** Substituir fotos genéricas por fotos reais mais impactantes

**Evento 1 - RETO #1079:**
- **Atual:** `TOP 1079 (1094).jpg`
- **Sugestão:** Manter OU trocar por `TOP 1079 (1792).jpg` (mais dramática)

**Evento 2 - Trail dos Pioneiros:**
- **Atual:** `TOP 1079 (6401).jpg`
- **Sugestão:** Trocar por `TOP 1079 (4243).jpg` (mais impactante)

**Evento 3 - Desafio Noturno:**
- **Atual:** `TOP 1079 (5628).jpg`
- **Sugestão:** Trocar por `TOP 1079 (5689).jpg` (maior resolução)

---

### 4. **SEÇÃO "SOBRE" / "QUEM SOMOS"**
**Objetivo:** Humanizar e conectar

**Foto de fundo:**
- **Sugestão:** `A (590).jpg` ou `B (66).jpg`
- **Tratamento:** Parallax suave, overlay 70%

---

### 5. **DEPOIMENTOS (Background Sutil)**
**Objetivo:** Adicionar contexto visual sem distrair

**Fotos rotativas no fundo (carousel):**
1. `TOP 1079 (2398).jpg` - Blur 20px, opacity 10%
2. `TOP 1079 (3403).jpg` - Blur 20px, opacity 10%
3. `TOP 1079 (4452).jpg` - Blur 20px, opacity 10%

---

### 6. **SEÇÃO "COMO FUNCIONA"**
**Objetivo:** Ilustrar cada passo visualmente

**Step 1 - Junte-se:**
- Foto: `TOP 1079 (1108).jpg` (comunidade recebendo)

**Step 2 - Participe:**
- Foto: `TOP 1079 (2318).jpg` (ação)

**Step 3 - Evolua:**
- Foto: `TOP 1079 (5377).jpg` (conquista)

**Layout:** Cards com foto circular ou em formato de ícone grande

---

### 7. **FOOTER (Sutil)**
**Objetivo:** Encerrar com elegância

**Foto de fundo:**
- **Sugestão:** `TOP 1079 (6673).jpg` ou `D (284).jpg`
- **Tratamento:** Escurecida 95%, marca d'água visual

---

## 🎨 TRATAMENTO VISUAL PROPOSTO

### **Otimizações:**
```css
/* Todas as imagens terão: */
- Next/Image com loading="lazy" (exceto hero)
- Placeholder blur automático
- Sizes responsivos
- Format: WebP (conversão automática Next.js)
```

### **Efeitos de Interação:**
```typescript
// Hover state padrão para galeria
whileHover={{ 
  scale: 1.05,
  transition: { duration: 0.3 }
}}

// Parallax em backgrounds
useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
```

### **Performance:**
- Fotos grandes (> 10MB) serão carregadas com `priority={false}`
- Galeria com intersection observer (carrega ao scroll)
- Thumbnail baixa resolução enquanto carrega full

---

## 📐 LAYOUT SUGERIDO DAS NOVAS SEÇÕES

### **GALERIA - Grid Masonry:**
```
Desktop: 4 colunas
Tablet:  3 colunas
Mobile:  2 colunas

Aspecto: Variado (respeitar proporção original)
Gap: 16px (1rem)
```

### **COMO FUNCIONA - Cards Ilustrados:**
```
Layout: 3 cards horizontais
Foto: 200x200px circular
Background: Verde ROTA suave
Hover: Lift + glow laranja
```

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO

### **Fase 1: Seções Essenciais** (30min)
1. ✅ Atualizar fotos dos eventos (3 fotos)
2. ✅ Criar seção Galeria (15 fotos)
3. ✅ Adicionar foto sutil em Stats

### **Fase 2: Refinamento** (20min)
4. ✅ Seção "Como Funciona" ilustrada (3 fotos)
5. ✅ Background Sobre/Quem somos (1 foto)
6. ✅ Depoimentos com fotos rotativas (3 fotos)

### **Fase 3: Polimento** (10min)
7. ✅ Footer com marca d'água visual
8. ✅ Otimização de performance
9. ✅ Testes responsivos

---

## 💡 NOTA DO DESIGNER

> "Com 139 fotos profissionais dessa qualidade, vamos transformar a home V5 em uma **experiência visual cinematográfica**. Cada seção contará uma história através das imagens - da ação individual à comunidade unida, da aventura à conquista."

> "A galeria será o coração emocional da página - mostrando que ROTA não é só um clube, é um **movimento de pessoas extraordinárias**."

---

## 🎯 RESULTADO ESPERADO

**Antes:** Home V5 com cores corretas, mas fotos genéricas  
**Depois:** Home V5 que **VIVE E RESPIRA** a identidade ROTA através de fotos reais

**Emoções provocadas:**
- 🔥 Energia contagiante
- 🤝 Senso de comunidade  
- 🏆 Desejo de conquista
- 🌄 Aventura e liberdade

---

## ✅ PRÓXIMO PASSO

**AGUARDANDO SUA APROVAÇÃO:**
- [ ] Aprovar seleção de fotos
- [ ] Aprovar layout das novas seções
- [ ] green light para implementar

**Tempo estimado de implementação:** ~1h para versão completa

---

**Assinatura:** Lucas Mendes ✨  
**"Cada foto é uma janela para uma emoção. Vamos criar 15 janelas que fazem o visitante querer entrar."**
