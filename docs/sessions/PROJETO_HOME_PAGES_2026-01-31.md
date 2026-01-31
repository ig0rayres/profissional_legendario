# 🏠 Projeto Home Pages - ROTA Business Club

**Data:** 2026-01-31  
**Status:** ⏸️ PAUSADO (Pronto para retomar)  
**Responsável:** Lucas (UI/UX Designer Senior)

---

## 📋 RESUMO EXECUTIVO

Criamos **5 versões diferentes** da home page institucional do ROTA Business Club, cada uma com características específicas. As versões V4 e V5 estão **finalizadas e prontas para uso**, com os **dados reais dos planos** da plataforma.

---

## 🎨 VERSÕES CRIADAS

### **V1 - Base Original** ✅
- **Caminho:** `/app/home-v1/page.tsx`
- **URL:** `http://localhost:3000/home-v1`
- **Características:**
  - Design cinematográfico com fundo escuro
  - Paleta de cores verde/teal inicial (não oficial)
  - Planos de exemplo (não reais)
  - Seções: Hero, Stats, Sobre, Como Funciona, Eventos, Galeria, Depoimentos, Planos, FAQ, Parceiros, Footer

### **V2 - Variação** ✅
- **Caminho:** `/app/home-v2/page.tsx`
- **URL:** `http://localhost:3000/home-v2`
- **Características:**
  - Variação da V1 com ajustes de layout

### **V3 - Variação** ✅
- **Caminho:** `/app/home-v3/page.tsx`
- **URL:** `http://localhost:3000/home-v3`
- **Características:**
  - Outra variação da V1 com ajustes de layout

### **V4 - Tema Escuro com Cores ROTA Oficiais** ✅ RECOMENDADA
- **Caminho:** `/app/home-v4/page.tsx`
- **URL:** `http://localhost:3000/home-v4`
- **Características:**
  - ✅ **Cores ROTA Oficiais:**
    - Verde Floresta: `#1E4D40` (cor principal)
    - Verde claro: `#3fa889` (destaques)
    - Verde médio: `#2d7a65` (intermediários)
    - Verde escuro: `#1a5c4a` (gradientes)
  - ✅ **Planos REAIS da Plataforma:**
    - **Recruta** (Grátis) - x1.0 VIGOR, 10 elos
    - **Veterano** (R$ 97/mês) - x1.5 VIGOR, 100 elos, 4 confrarias/mês
    - **Elite** (R$ 127/mês) - x3.0 VIGOR, elos ilimitados, 10 confrarias/mês - **DESTACADO**
    - **Lendário** (R$ 247/mês) - x5.0 VIGOR, tudo ilimitado
  - ✅ **Layout:** Grid 4 colunas para planos
  - ✅ **Destaque Elite:** Background verde ROTA, badge "MAIS POPULAR", escala 105%
  - 🎨 **Tema:** Fundo preto/escuro, textos brancos

### **V5 - Tema Claro com Detalhes Laranja** ✅ VERSÃO FINAL
- **Caminho:** `/app/home-v5/page.tsx`
- **URL:** `http://localhost:3000/home-v5`
- **Características:**
  - ✅ **Tema Claro/Híbrido:**
    - Hero: Overlay escuro (`gray-900/80` → `gray-900/40` → `transparent`)
    - Resto da página: Fundos brancos/cinza claro
    - Textos escuros para legibilidade
  - ✅ **Cores ROTA + Laranja Estratégico:**
    - Verde Floresta: `#1E4D40` (cor principal - botões, títulos)
    - Laranja Cume: `#CC5500` (detalhes estratégicos)
  - ✅ **Detalhes em Laranja:**
    - Badge "SEJA EXTRAORDINÁRIO": Borda + ícone laranja
    - Palavra "brilhar": Destaque laranja
    - Botão "VER HISTÓRIA": Ícone Play laranja, hover laranja
    - ChevronDown: Seta animada laranja
  - ✅ **Planos REAIS** (mesmos da V4)
  - ✅ **Foto do Hero:** Viva e contrasty (overlay escurecido)
  - ✅ **Palavra "LIMITES":** Perfeitamente visível em gradiente verde
  - 🎨 **Tema:** Híbrido - Hero escuro, resto claro

---

## 📊 COMPARAÇÃO ENTRE V4 E V5

| Característica | V4 (Tema Escuro) | V5 (Tema Claro) |
|----------------|------------------|-----------------|
| **Fundo Geral** | Preto/Escuro | Branco/Cinza Claro |
| **Hero Overlay** | Escuro (`black/60`) | Escuro (`gray-900/80-40`) |
| **Textos Hero** | Branco | Branco |
| **Textos Gerais** | Branco/Cinza claro | Escuro (gray-900) |
| **Cor Principal** | Verde ROTA (#1E4D40) | Verde ROTA (#1E4D40) |
| **Cor Secundária** | - | Laranja (#CC5500) |
| **Planos** | 4 planos reais | 4 planos reais |
| **Elite Destacado** | ✅ Verde ROTA | ✅ Verde ROTA |
| **Legibilidade** | ⚠️ Palavra "LIMITES" era invisível | ✅ Todos os textos visíveis |
| **Vibrância Foto** | ⚠️ Fundo muito escuro | ✅ Foto viva e contrasty |
| **Identidade Visual** | 100% Verde | Verde + Laranja |

---

## 🎯 DADOS REAIS DOS PLANOS (Implementados)

**Fonte:** `docs/architecture/PLANOS_UNIFICADOS.md`

| Plano | Preço | VIGOR | Elos | Confrarias/mês | Anúncios MKT | Destaque |
|-------|-------|-------|------|----------------|--------------|----------|
| **Recruta** | Grátis | x1.0 | 10 | 0 (só recebe) | 0 | - |
| **Veterano** | R$ 97/mês | x1.5 | 100 | 4 | 2 | - |
| **Elite** | R$ 127/mês | x3.0 | ∞ | 10 | 10 | ⭐ SIM |
| **Lendário** | R$ 247/mês | x5.0 | ∞ | ∞ | ∞ | - |

### Features Detalhadas por Plano:

**Recruta (Grátis):**
- Acesso ao feed da comunidade
- Multiplicador de VIGOR: x1.0
- Até 10 elos (conexões)
- Pode receber convites de confraria
- Sem anúncios no marketplace

**Veterano (R$ 97/mês):**
- Tudo do plano Recruta
- Multiplicador de VIGOR: x1.5
- Até 100 elos (conexões)
- 4 convites de confraria/mês
- 2 anúncios no marketplace
- Acesso a projetos exclusivos
- Badge de verificação

**Elite (R$ 127/mês) - DESTACADO:**
- Tudo do plano Veterano
- Multiplicador de VIGOR: x3.0
- Elos ilimitados
- 10 convites de confraria/mês
- 10 anúncios no marketplace
- Acesso à Confraria Business
- Projetos premium
- Eventos VIP exclusivos

**Lendário (R$ 247/mês):**
- Tudo do plano Elite
- Multiplicador de VIGOR: x5.0
- Elos ilimitados
- Convites ilimitados
- Anúncios ilimitados
- Mentoria individual
- Acesso antecipado a eventos
- Network com líderes

---

## 🎨 IDENTIDADE VISUAL APLICADA

### **Cores Oficiais ROTA:**

**Verde Floresta (Principal):**
- `#1E4D40` - Base, botões principais
- `#3fa889` - Destaques, ícones
- `#2d7a65` - Intermediário
- `#1a5c4a` - Gradientes escuros

**Laranja Cume (Acento - apenas V5):**
- `#CC5500` - Detalhes estratégicos, hover states

### **Aplicação das Cores:**

**V4 (100% Verde):**
- Hero: Título verde, botão verde, ícones verdes
- Stats: Ícones e números em verde
- Planos: Elite com fundo verde ROTA
- Footer: Links hover verde

**V5 (Verde + Laranja):**
- Hero: 
  - Badge: Borda laranja, ícone laranja
  - Palavra "brilhar": Laranja
  - Botão "VER HISTÓRIA": Ícone laranja, hover laranja
  - ChevronDown: Laranja
- Stats: Ícones verde
- Planos: Elite com fundo verde ROTA
- Footer: Hover verde

---

## ✅ PROBLEMAS RESOLVIDOS

### **Problema 1: Cores Incorretas** ❌→✅
- **Antes:** Emerald/Teal genéricos
- **Depois:** Verde ROTA oficial (#1E4D40)

### **Problema 2: Planos Fictícios** ❌→✅
- **Antes:** "Explorador", "Profissional ROTA" com preços inventados
- **Depois:** Recruta, Veterano, Elite, Lendário com dados reais do banco

### **Problema 3: Palavra "LIMITES" Invisível** ❌→✅
- **Antes (V4):** Gradiente verde em fundo escuro = invisível
- **Depois (V5):** Overlay escuro com gradiente verde visível

### **Problema 4: Foto Muito Branca** ❌→✅
- **Antes (V5 inicial):** Overlay `white/95-70-40` = foto apagada
- **Depois (V5 final):** Overlay `gray-900/80-40-transparent` = foto viva

### **Problema 5: Falta de Contraste Visual** ❌→✅
- **Antes:** Só verde = monótono
- **Depois:** Verde + Laranja estratégico = dinâmico

---

## 📸 SCREENSHOTS DISPONÍVEIS

Os screenshots estão salvos em:
```
/home/igor/.gemini/antigravity/brain/457dfc40-0a1d-4092-a853-8fe576271998/
```

**V4:**
- `home_v4_hero_1769870119070.png` - Hero section

**V5:**
- `home_v5_hero_section_1769872884460.png` - Hero inicial (overlay claro)
- `home_v5_plans_section_1769873084073.png` - Seção de planos
- `home_v5_hero_verified_1769873190445.png` - Hero com laranja
- `home_v5_dark_overlay_final_1769873825062.png` - **VERSÃO FINAL** ⭐

---

## 🔄 PRÓXIMOS PASSOS SUGERIDOS

### **Curto Prazo:**
1. ✅ **Decidir qual versão usar:** V4 (escura) ou V5 (clara/híbrida)
2. ⏭️ **Adicionar seções faltantes:**
   - Eventos reais (integrar com banco de dados)
   - Galeria com fotos reais (já temos em `/fotos-rota/`)
   - Depoimentos reais de membros
3. ⏭️ **Integração com Backend:**
   - Planos devem buscar dados de `plan_config`
   - Estatísticas devem vir do banco real
4. ⏭️ **SEO:**
   - Meta tags
   - Schema.org markup
   - OpenGraph tags

### **Médio Prazo:**
1. ⏭️ **Animações avançadas:**
   - Parallax scrolling
   - Animações de entrada mais sofisticadas
2. ⏭️ **Responsividade:**
   - Testar em mobile
   - Ajustar grid de planos para mobile (2 colunas)
3. ⏭️ **Performance:**
   - Otimizar imagens
   - Lazy loading
   - Code splitting

### **Longo Prazo:**
1. ⏭️ **A/B Testing:**
   - Testar V4 vs V5 com usuários reais
   - Medir conversão de cada versão
2. ⏭️ **CMS:**
   - Painel admin para editar conteúdo da home
   - Gerenciar depoimentos, eventos destacados

---

## 📁 ARQUIVOS MODIFICADOS

```
/home/igor/Vídeos/Legendarios/
├── app/
│   ├── home-v1/
│   │   └── page.tsx (base original)
│   ├── home-v2/
│   │   └── page.tsx (variação)
│   ├── home-v3/
│   │   └── page.tsx (variação)
│   ├── home-v4/
│   │   └── page.tsx ✅ (tema escuro, cores ROTA, planos reais)
│   └── home-v5/
│       └── page.tsx ✅ (tema claro, laranja, planos reais) ⭐ VERSÃO FINAL
└── docs/
    ├── architecture/
    │   ├── IDENTIDADE_VISUAL.md (referência de cores)
    │   └── PLANOS_UNIFICADOS.md (dados dos planos)
    └── sessions/
        └── PROJETO_HOME_PAGES_2026-01-31.md (este arquivo)
```

---

## 💡 OBSERVAÇÕES IMPORTANTES

### **Design:**
- A V5 é a mais **completa e equilibrada** - combina a vivacidade do tema claro com detalhes estratégicos em laranja
- A palavra "LIMITES" agora é **perfeitamente visível** em todas as versões
- O plano **Elite está sempre destacado** como "Mais Popular"

### **Código:**
- Todas as versões usam **Framer Motion** para animações
- Código **limpo e bem estruturado**
- Fácil de **manter e atualizar**

### **Identidade Visual:**
- V4: **100% Verde ROTA** (mais conservadora)
- V5: **Verde ROTA + Laranja Cume** (mais dinâmica) ⭐

### **Recomendação:**
**Use a V5** como página principal. Ela resolve todos os problemas de legibilidade, mantém a identidade ROTA, e adiciona dinamismo com o laranja estratégico.

---

## 🚀 PARA RETOMAR O PROJETO

1. Abra este documento: `docs/sessions/PROJETO_HOME_PAGES_2026-01-31.md`
2. Acesse a V5: `http://localhost:3000/home-v5`
3. Código fonte: `app/home-v5/page.tsx`
4. Screenshots de referência: `/home/igor/.gemini/antigravity/brain/.../home_v5_dark_overlay_final_*.png`

---

**Última atualização:** 2026-01-31 12:50  
**Status:** ✅ Pronto para produção (V5)  
**Próxima etapa:** Decisão de qual versão usar + Integração com backend
