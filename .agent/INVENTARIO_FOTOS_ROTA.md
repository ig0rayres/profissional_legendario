# Inventário de Fotos ROTA

## 📸 Total: 26 fotos do evento RETO TOP #1079
**Evento:** Track Vale do Sol - Ribeirão Preto - SP  
**Data:** 3 a 6 de Julho de 2025  
**Localização:** `/public/fotos-rota/`

---

## 🎯 Categorização por Uso

### 🌅 HERO IMAGES (Grandes, impacto visual)
Ideal para: Hero sections, backgrounds fullscreen

1. **`TOP 1079 (1082).jpg`** - Líder no pôr do sol, braço levantado (ÉPICO!)
2. **`TOP 1079 (1094).jpg`** - Multidão ao amanhecer, vista montanhas (INCRÍVEL!)
3. **`TOP 1079 (5150).jpg`** - Alta resolução (10MB)
4. **`TOP 1079 (5223).jpg`** - Alta resolução (8.9MB)
5. **`TOP 1079 (5414).jpg`** - Alta resolução (10.6MB)
6. **`TOP 1079 (5699).jpg`** - Altíssima resolução (20MB!)
7. **`TOP 1079 (6674).jpg`** - Alta resolução (11.8MB)

**Nota:** As fotos 5150, 5223, 5414, 5699, 6674 precisam ser otimizadas (muito pesadas para web).

---

### 👥 COMUNIDADE/GRUPO (Networking, fraternidade)
Ideal para: Seção "Missão", Feed social, Prova social

8. **`TOP 1079 (2302).jpg`** - Bandeiras laranjas + multidão acampada
9. **`TOP 1079 (5425).jpg`** - Roda de conversa, networking em floresta (PERFEITO!)
10. **`TOP 1079 (5628).jpg`** - Multidão noturna, luz vermelha, atmosfera intensa
11. **`TOP 1079 (4589).jpg`** - 3 homens de laranja, equipe organização

---

### 🧔 PERFIS/CLOSE-UPS (Atletas individuais)
Ideal para: Cards de ranking, avatares, depoimentos

12. **`TOP 1079 (1126).jpg`** - Close atleta com lanterna, olhar determinado
13. **`TOP 1079 (4251).jpg`** - Atleta tático com rádio e shemagh
14. **`TOP 1079 (6401).jpg`** - Dupla no topo, jaquetas laranjas, vista épica

---

### 📊 VERSATEIS (Múltiplos usos)
Podem ser usadas em várias seções

15. **`TOP 1079 (702).jpg`** - 201KB
16. **`TOP 1079 (977).jpg`** - 184KB
17. **`TOP 1079 (1133).jpg`** - 206KB
18. **`TOP 1079 (1203).jpg`** - 71KB (leve!)
19. **`TOP 1079 (4408).jpg`** - 155KB
20. **`TOP 1079 (4631).jpg`** - 176KB
21. **`TOP 1079 (4768).jpg`** - 208KB
22. **`TOP 1079 (5142).jpg`** - 94KB (leve!)
23. **`TOP 1079 (5147).jpg`** - 173KB
24. **`TOP 1079 (5454).jpg`** - 315KB
25. **`TOP 1079 (5682).jpg`** - 131KB
26. **`TOP 1079 (5698).jpg`** - 257KB

---

## 🎨 Mapeamento para Home Pages

### **HOME V1 - Cinematográfica**
- **Hero Background:** `TOP 1079 (1094).jpg` (multidão ao amanhecer)
- **Grid Missão (4 fotos):**
  - `TOP 1079 (1082).jpg` (líder pôr do sol)
  - `TOP 1079 (5425).jpg` (roda networking)
  - `TOP 1079 (1126).jpg` (close atleta)
  - `TOP 1079 (2302).jpg` (bandeiras)

### **HOME V2 - Dashboard Social**
- **Hero:** `TOP 1079 (6401).jpg` (dupla no topo)
- **Cards Eventos:** 
  - `TOP 1079 (4251).jpg`
  - `TOP 1079 (5628).jpg`
- **Feed Social (posts):**
  - `TOP 1079 (1126).jpg`
  - `TOP 1079 (4589).jpg`
  - `TOP 1079 (5425).jpg`
- **Avatares Ranking:** Close-ups diversos

### **HOME V3 - Minimalista Elite**
- **Hero Background:** `TOP 1079 (1082).jpg` (líder épico)
- **Slider Experiências:** 
  - `TOP 1079 (6401).jpg` (fraternidade)
  - `TOP 1079 (2302).jpg` (comunidade)
  - `TOP 1079 (1126).jpg` (determinação)

---

## ⚠️ IMPORTANTE: Marcas d'Água

### Localização das marcas:
- **Canto superior direito:** Logo "LEGENDARIOS" com bandeira
- **Canto inferior esquerdo:** Logo "RETO TOP #1079" + texto do evento

### Solução Implementada:
Componente `RotaImage.tsx` aplica blur automático:
- ✅ Blur no canto superior direito (32x24px)
- ✅ Blur no canto inferior esquerdo (48x20px)
- ✅ Gradiente suave para não parecer "cortado"
- ✅ Backdrop blur para efeito glassmorphism

---

## 📦 Tamanhos de Arquivo

### ✅ Prontas para Web (< 300KB)
- 1082.jpg - 91KB
- 1094.jpg - 147KB
- 1126.jpg - 100KB
- 1133.jpg - 206KB
- 1203.jpg - 71KB (menor!)
- 2302.jpg - 169KB
- 4251.jpg - 197KB
- 4408.jpg - 155KB
- 4589.jpg - 248KB
- 4631.jpg - 176KB
- 4768.jpg - 208KB
- 5142.jpg - 94KB
- 5147.jpg - 173KB
- 5454.jpg - 315KB (limite)
- 5628.jpg - 168KB
- 5682.jpg - 131KB
- 5698.jpg - 257KB
- 6401.jpg - 142KB
- 702.jpg - 201KB
- 977.jpg - 184KB

### ⚠️ PRECISAM OTIMIZAÇÃO (> 5MB)
- 5150.jpg - **10.9MB** 🔴
- 5223.jpg - **8.9MB** 🔴
- 5414.jpg - **10.6MB** 🔴
- 5699.jpg - **20.1MB** 🔴 (MUITO PESADA!)
- 6674.jpg - **11.8MB** 🔴
- 5425.jpg - 430KB 🟡 (ok mas pode melhorar)

**Ação necessária:** Comprimir as 5 fotos marcadas com 🔴 para ~200-300KB sem perder qualidade visível.

---

## 🔧 Próximas Ações

### Para Hoje (Sessão Atual)
- [x] Criar componente `RotaImage.tsx`
- [ ] Substituir placeholders na Home V1
- [ ] Substituir placeholders na Home V2
- [ ] Substituir placeholders na Home V3
- [ ] Atualizar documentação

### Para Amanhã
- [ ] Otimizar as 5 fotos pesadas (script de compressão)
- [ ] Renomear arquivos para nomes descritivos
- [ ] Testar performance no Lighthouse
- [ ] Adicionar lazy loading
- [ ] Implementar blur hash para loading progressivo

---

## 💡 Dicas de Uso

### Para Hero Sections:
Use fotos com **céu/espaço negativo no topo** onde ficará o texto:
- ✅ 1094.jpg (céu com nascer do sol)
- ✅ 1082.jpg (pôr do sol com espaço)
- ✅ 6401.jpg (céu claro)

### Para Grids/Mosaicos:
Combine fotos com diferentes enquadramentos:
- Landscape: 1094, 2302, 5425
- Portrait: 1126, 4251
- Square crops: Qualquer uma funciona

### Para Backgrounds com Overlay:
Qualquer foto funciona com overlay escuro (40-60% opacity).

---

**Documento criado em:** 28 de Janeiro de 2026, 19:30h  
**Última atualização:** 28 de Janeiro de 2026, 19:30h  
**Total de fotos:** 26  
**Prontas para uso:** 20  
**Precisam otimização:** 6
