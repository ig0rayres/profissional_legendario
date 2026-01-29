# Contexto do Projeto de Home Pages ROTA

## 📖 Visão Geral do Projeto

### Objetivo
Criar **3 versões diferentes de home page** para o Rota Business Club, cada uma com uma abordagem visual e estratégica distinta, permitindo que o time escolha a melhor opção ou até combine elementos de cada uma.

### Motivação
O site atual precisa comunicar melhor a essência do ROTA: uma comunidade premium de homens de negócios que se transformam através de aventuras épicas e networking de alto nível.

---

## 🎯 As 3 Versões Propostas

### **Home V1 - Cinematográfica / Intensa**
**Conceito:** Experiência visual impactante que imediatamente transmite a intensidade e o épico do ROTA.

**Características:**
- ✅ Hero fullscreen com imagem de alta qualidade (montanhas, aventura)
- ✅ Animações Framer Motion sutis e profissionais
- ✅ Banner de stats dinâmico com números que impressionam
- ✅ Seção "Nossa Missão" com grid de imagens
- ✅ Paleta escura com acentos laranja
- ✅ CTA's prominentes

**Mood:** Inspirador, épico, cinematográfico  
**Referência:** Documentários de aventura, marcas outdoor premium

---

### **Home V2 - Dashboard Social / Comunidade**
**Conceito:** Foco na comunidade ativa, eventos e interação social entre membros.

**Características:**
- ✅ Dashboard-style layout
- ✅ Live stats visíveis no topo
- ✅ Cards de "Próximos Eventos"
- ✅ Feed social com posts da comunidade
- ✅ Ranking "Top Atletas ROTA" com avatares e patentes
- ✅ Mais interativo e dinâmico
- ✅ Mostra "vida" acontecendo no clube

**Mood:** Ativo, social, vibrante  
**Referência:** Redes sociais premium, comunidades online de elite

---

### **Home V3 - Minimalista / Elite**
**Conceito:** Design sofisticado e premium que passa exclusividade e alto padrão.

**Características:**
- ✅ Hero limpo com parallax suave
- ✅ Tipografia premium e espaçamento generoso
- ✅ Glassmorphism e efeitos sutis
- ✅ Paleta de cores elegante (dourado, escuro, branco)
- ✅ Slider de experiências
- ✅ Menos elementos, mais impacto
- ✅ Foco em qualidade sobre quantidade

**Mood:** Sofisticado, exclusivo, premium  
**Referência:** Marcas de luxo, clubes privados, experiências de alto padrão

---

## 🏗️ Arquitetura Técnica

### Stack Utilizada
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion
- **Ícones:** Lucide React
- **Fontes:** Google Fonts (Inter, Outfit)

### Estrutura de Arquivos
```
/app
  /home-v1
    page.tsx          → Home Cinematográfica
  /home-v2
    page.tsx          → Home Dashboard Social
  /home-v3
    page.tsx          → Home Minimalista Elite
  /globals.css        → Estilos globais
```

### Rotas Criadas
- `http://localhost:3001/home-v1` - Versão Cinematográfica
- `http://localhost:3001/home-v2` - Versão Dashboard
- `http://localhost:3001/home-v3` - Versão Minimalista

---

## 🎨 Sistema de Design

### Paleta de Cores Principal
```css
/* Laranja ROTA (Primária) */
--cor-primaria: #FF6B35

/* Azul Escuro (Background) */
--cor-background: #0A0E27
--cor-background-claro: #1A1F3A

/* Dourado (Premium) */
--cor-dourado: #FFD700

/* Neutros */
--cor-texto-claro: #FFFFFF
--cor-texto-medio: #94A3B8
```

### Tipografia
- **Família Principal:** Inter (Google Fonts)
- **Família Alternativa:** Outfit (para títulos épicos)
- **Hierarquia:**
  - H1: 4xl-6xl, bold
  - H2: 3xl-4xl, semibold
  - H3: 2xl-3xl, semibold
  - Body: base-lg, regular

### Componentes Reutilizáveis
Atualmente os componentes estão inline em cada página. **Oportunidade futura:** extrair componentes comuns como:
- `Button` (CTA primário/secundário)
- `StatCard` (cards de estatísticas)
- `EventCard` (cards de eventos)
- `AthleteRankingItem` (item de ranking)
- `NavBar` (navegação - que já existe)
- `Footer` (rodapé)

---

## 🔧 Funcionalidades Implementadas

### ✅ Implementado
- [x] 3 versões completas de home page
- [x] Animações Framer Motion
- [x] Layout responsivo (mobile-first)
- [x] Sistema de navegação
- [x] Stats dinâmicos
- [x] Cards de eventos
- [x] Feed social (V2)
- [x] Ranking de atletas (V2)
- [x] Hero sections impactantes
- [x] CTA's bem posicionados

### 🚧 Pendente / Próximos Passos
- [ ] Integração com backend/API real
- [ ] Dados dinâmicos (eventos reais, posts reais, ranking real)
- [ ] Sistema de autenticação integrado
- [ ] Área de membros
- [ ] Sistema de inscrição em eventos
- [ ] Perfis de usuário
- [ ] Upload de fotos de eventos
- [ ] Sistema de pontuação/gamificação
- [ ] Notificações
- [ ] Filtros e busca de eventos

---

## 📸 Assets e Recursos

### Imagens Utilizadas (Placeholder)
Atualmente usando URLs do Unsplash para mockups:
- `/api/placeholder` para cards e avatares
- Unsplash para hero backgrounds (montanhas, aventuras)

**⚠️ IMPORTANTE:** Substituir por imagens reais do ROTA antes do deploy em produção.

### Ícones
Todos da biblioteca **Lucide React**:
- `Users`, `Award`, `MapPin`, `Star`, `TrendingUp`, etc.

---

## 🐛 Problemas Resolvidos

### Problema 1: Páginas em Branco (28/01/2026)
**Sintoma:** Ao acessar `/home-v1`, `/home-v2`, `/home-v3`, apenas o hero aparecia e o resto ficava em branco.

**Causa:** Next.js não estava servindo os bundles JavaScript (`main-app.js`, `app-pages-internals.js` retornando 404).

**Solução:** Restart completo do servidor Next.js:
```bash
pkill -f "npm run dev"
npm run dev
```

**Status:** ✅ Resolvido - Todas as páginas renderizando corretamente

---

## 📊 Métricas de Sucesso (Futuras)

Como medir se a nova home está funcionando:
1. **Taxa de conversão** para inscrição na comunidade
2. **Tempo médio na página** (engajamento)
3. **Taxa de cliques** nos CTAs principais
4. **Inscrições em eventos** a partir da home
5. **Feedback qualitativo** dos membros

---

## 🎯 Decisões de Design Importantes

### Por que 3 versões?
Permitir que o cliente/time escolha a abordagem que melhor representa o ROTA. Cada versão atende um objetivo diferente:
- **V1:** Conquista emocional imediata
- **V2:** Prova social e comunidade ativa
- **V3:** Posicionamento premium e exclusividade

### Por que Next.js?
- SEO otimizado (importante para atração orgânica)
- Performance superior
- Já utilizado no projeto
- Facilita transição para páginas dinâmicas

### Por que Framer Motion?
- Animações suaves e profissionais
- Controle fino sobre transições
- Performance otimizada
- API declarativa e fácil de manter

---

## 🔐 Requisitos de Ambiente

### Variáveis de Ambiente
Atualmente usando `.env.local` (já configurado no projeto).

### Dependências Principais
```json
{
  "next": "^14.2.33",
  "react": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "framer-motion": "^11.x",
  "lucide-react": "^latest"
}
```

---

## 📝 Convenções do Código

### Nomenclatura
- Componentes: PascalCase (`EventCard`)
- Arquivos de página: `page.tsx`
- Constantes: UPPER_SNAKE_CASE (`STATS_DATA`)
- Funções: camelCase (`handleClick`)

### Estrutura de Componentes
```tsx
'use client' // Se necessário

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PageName() {
  // Estado
  // Funções
  // Render
}
```

---

## 🔗 Integrações Futuras

### Backend Required
- **Supabase** para auth e database (já em uso no projeto)
- **API de Eventos** para listar eventos reais
- **API de Usuários** para ranking e perfis
- **Storage** para upload de imagens

### Serviços Terceiros
- **Stripe** para pagamentos de memberships
- **SendGrid/Resend** para emails transacionais
- **Google Analytics** para métricas

---

## 📚 Documentação de Referência

- [Next.js App Router Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Supabase Docs](https://supabase.com/docs)

---

## 👥 Stakeholders

- **Igor (Cliente/Owner):** Decisor final, fornece requisitos e feedback
- **Lucas (UI/UX Designer):** Responsável pelo design e implementação frontend

---

## 🚀 Como Continuar Este Projeto

### Próxima Sessão de Trabalho:
1. **Definir qual versão usar** (ou combinar elementos)
2. **Substituir placeholders** por conteúdo real
3. **Conectar com backend** (Supabase)
4. **Implementar eventos dinâmicos**
5. **Criar página de detalhes de eventos**
6. **Sistema de inscrição**

### Comandos Úteis
```bash
# Iniciar servidor dev
npm run dev

# Build de produção
npm run build

# Verificar build localmente
npm run start
```

---

**Documento criado em:** 28 de Janeiro de 2026  
**Última atualização:** 28 de Janeiro de 2026  
**Status do Projeto:** 🟡 Em desenvolvimento - Home pages criadas, aguardando aprovação
