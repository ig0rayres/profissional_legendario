# 🎨 Banners de Temporada - Documentação

> Guia rápido para editar e customizar os banners de prêmios das temporadas.

---

## 📁 Localização dos Arquivos

### Componentes de Banner

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| **SeasonBanner** (Original) | `/components/season/SeasonBanner.tsx` | Layout com pódio (2º \| 1º \| 3º) |
| **SeasonBannerCarousel** (V1) | `/components/season/SeasonBannerCarousel.tsx` | Carrossel com proporções ajustadas |
| **SeasonBannerCarouselV2** (V2) | `/components/season/SeasonBannerCarouselV2.tsx` | Carrossel com proporções originais |
| **SeasonBannerSimple** | `/components/seasons/SeasonBannerSimple.tsx` | Versão simplificada (apenas imagem) |

### Index de exports
- `/components/season/index.ts` - Exporta todos os componentes

---

## 🎯 Variantes Disponíveis

Cada componente suporta 4 variantes:

| Variant | Proporção | Uso Recomendado |
|---------|-----------|-----------------|
| `hero` | 1400x500 (~2.8:1) | Página principal, landing pages |
| `card` | 1000x350 (~2.85:1) | Cards em grids |
| `sidebar` | 700x250 (2.8:1) | Sidebar, painéis laterais |
| `compact` | 500x500 (1:1) | Redes sociais (Instagram) |

---

## 🔧 Como Usar

### Exemplo básico
```tsx
import { SeasonBanner, SeasonBannerCarousel, SeasonBannerCarouselV2 } from '@/components/season'

// Versão Original (Pódio)
<SeasonBanner variant="hero" showCTA={true} />

// Versão Carrossel V1
<SeasonBannerCarousel variant="sidebar" />

// Versão Carrossel V2 (Proporções Originais)
<SeasonBannerCarouselV2 variant="compact" />
```

### Props disponíveis

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | `'hero' \| 'card' \| 'sidebar' \| 'compact'` | `'hero'` | Tamanho/formato |
| `showCTA` | `boolean` | `true` | Mostrar botão de ação |
| `showCountdown` | `boolean` | `true` | Mostrar contagem regressiva |
| `className` | `string` | `''` | Classes CSS extras |
| `customSeason` | `object` | `null` | Dados customizados de temporada |
| `customPrizes` | `array` | `null` | Prêmios customizados |
| `autoRotateInterval` | `number` | `3000` | Intervalo do carrossel (ms) |

---

## 🎨 Customização Visual

### Cores principais
```tsx
// Cores usadas nos banners (editar dentro do componente):

// Background principal
from-[#122e26] via-[#0d211b] to-[#05120e]

// Laranja da marca
#cc5500

// Badges de posição
case 1: 'bg-gradient-to-br from-yellow-400 to-amber-600'  // Ouro
case 2: 'bg-gradient-to-br from-gray-300 to-gray-500'     // Prata
case 3: 'bg-gradient-to-br from-amber-600 to-amber-800'   // Bronze
```

### Tamanho dos cards de prêmio
```tsx
// No SeasonBanner.tsx, linha ~298:
prize.position === 1 
    ? 'w-36 h-36 md:w-52 md:h-52'   // 1º lugar (maior)
    : 'w-32 h-32 md:w-40 md:h-40'   // 2º/3º lugar
```

### Espaçamento entre prêmios
```tsx
// No SeasonBanner.tsx, linha ~262:
className="flex justify-center items-end gap-6 md:gap-10 mb-8"
```

---

## 👁️ Preview no Admin

Os banners podem ser visualizados no painel admin:

**Caminho:** `/admin` → Temporadas → Seção "Preview dos Banners"

O admin mostra:
1. **🟠 Versão Original (Pódio)** - Borda laranja
2. **🟣 Versão Carrossel V1** - Borda roxa
3. **🟢 Versão Carrossel V2** - Borda verde

---

## 📱 Onde os banners são usados

| Local | Componente | Status |
|-------|------------|--------|
| Admin Preview | `SeasonsManager.tsx` | ✅ Ativo |
| Dashboard Usuário | `profile-page-template.tsx` | ❌ Removido (30/01/2026) |

---

## 🔄 Histórico de Versões

| Data | Alteração |
|------|-----------|
| 30/01/2026 | Criados 3 componentes: Original, Carousel V1, Carousel V2 |
| 30/01/2026 | Adicionado sistema de carrossel com rotação automática |
| 30/01/2026 | Removido banner do dashboard do usuário |
| 30/01/2026 | Padronizado tamanho dos cards de prêmio |

---

## 📋 Checklist para Edições

- [ ] Editar arquivo do componente desejado
- [ ] Testar preview no admin
- [ ] Verificar responsividade (mobile/desktop)
- [ ] Gerar nova imagem se necessário (API compose-image)
- [ ] Atualizar esta documentação se houver mudanças estruturais
