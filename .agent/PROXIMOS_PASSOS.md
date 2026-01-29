# 🚀 PRÓXIMOS PASSOS - Sessão de Amanhã (29/01/2026)

## 📍 ONDE ESTAMOS AGORA

### ✅ O que já está pronto:
1. **3 versões de home page** criadas e funcionando
   - `/home-v1` - Cinematográfica/Intensa
   - `/home-v2` - Dashboard Social
   - `/home-v3` - Minimalista Elite

2. **26 fotos reais** recebidas do evento RETO TOP #1079
   - Localizadas em: `/public/fotos-rota/`
   - Catalogadas em: `INVENTARIO_FOTOS_ROTA.md`

3. **Componente RotaImage** criado
   - Arquivo: `/components/RotaImage.tsx`
   - Função: Aplicar blur automático nas marcas d'água

4. **Início da integração** (PARCIAL)
   - Home V1 começou a receber fotos reais
   - Hero, eventos e grid de missão atualizados
   - Blur aplicado manualmente em algumas imagens
   - ⚠️ **INCOMPLETO** - Galeria ainda precisa ser atualizada

---

## 🎯 PRÓXIMA SESSÃO: O QUE FAZER

### **Prioridade ALTA** 🔴

#### 1. Completar Home V1
- [ ] Verificar se todas as fotos foram substituídas
- [ ] Atualizar galeria com fotos reais
- [ ] Testar blur nas marcas d'água
- [ ] Verificar responsividade

#### 2. Atualizar Home V2
- [ ] Hero section com foto real
- [ ] Cards de eventos com fotos reais
- [ ] Feed social com fotos reais
- [ ] Avatares do ranking
- [ ] Aplicar blur em todas as imagens

#### 3. Atualizar Home V3
- [ ] Hero background com foto épica
- [ ] Slider de experiências com fotos reais
- [ ] Aplicar blur nas marcas d'água

---

### **Prioridade MÉDIA** 🟡

#### 4. Otimizar Fotos Pesadas
As seguintes fotos estão muito pesadas (> 5MB) e precisam ser comprimidas:
```bash
# Fotos para otimizar:
- TOP 1079 (5150).jpg - 10.9MB
- TOP 1079 (5223).jpg - 8.9MB
- TOP 1079 (5414).jpg - 10.6MB
- TOP 1079 (5699).jpg - 20.1MB ⚠️ MUITO PESADA
- TOP 1079 (6674).jpg - 11.8MB
```

**Como fazer:**
- Usar ImageMagick, Sharp ou similar
- Target: ~200-300KB sem perder qualidade visível
- Manter aspect ratio original

#### 5. Melhorar Blur das Marcas D'água
Atualmente o blur está aplicado manualmente. Considerar:
- Usar o componente `RotaImage` de forma consistente
- Ajustar tamanhos/posições do blur se necessário
- Testar em diferentes resoluções de tela

---

### **Prioridade BAIXA** 🟢

#### 6. Renomear Arquivos
Atualmente: `TOP 1079 (1082).jpg`  
Ideal: `hero-lider-sunset.jpg`, `networking-roda.jpg`, etc.

#### 7. Implementar Lazy Loading
- Next.js já faz isso por padrão mas verificar se está ativo
- Adicionar `loading="lazy"` onde necessário

#### 8. Adicionar Blur Hash
Para loading progressivo mais suave (opcional)

---

## 📋 CHECKLIST PARA RETOMAR AMANHÃ

### Antes de Começar:
- [ ] Rodar `npm run dev` na porta 3001
- [ ] Abrir as 3 URLs no browser para verificar estado atual
- [ ] Ler os 4 documentos principais:
  - `PROGRESSO_HOME_PAGES.md` (este arquivo)
  - `CONTEXTO_PROJETO_HOME.md`
  - `INVENTARIO_FOTOS_ROTA.md`
  - `PROXIMOS_PASSOS.md` (este arquivo)

### Durante o Trabalho:
1. **Home V2** - Substituir todas as imagens
2. **Home V3** - Substituir todas as imagens
3. **Otimizar** as 5 fotos pesadas
4. **Testar** todas as páginas em diferentes devices
5. **Documentar** o que foi feito

### Ao Finalizar:
- [ ] Screenshots das 3 versões com fotos reais
- [ ] Atualizar `PROGRESSO_HOME_PAGES.md`
- [ ] Commit das mudanças (se usar git)
- [ ] Marcar como concluído ✅

---

## 🔧 COMANDOS ÚTEIS

### Iniciar servidor:
```bash
cd /home/igor/Vídeos/Legendarios
npm run dev
# Servidor estará em http://localhost:3001
```

### Listar fotos:
```bash
ls -lh /home/igor/Vídeos/Legendarios/public/fotos-rota/
```

### Otimizar uma foto (exemplo com ImageMagick):
```bash
# Se precisar instalar:
sudo apt install imagemagick

# Otimizar mantendo qualidade:
convert "TOP 1079 (5699).jpg" -quality 85 -resize 1920x1080\> "otimizada.jpg"
```

### Verificar tamanho total das fotos:
```bash
du -sh /home/igor/Vídeos/Legendarios/public/fotos-rota/
```

---

## 📸 MAPEAMENTO: Quais fotos usar onde

### **HOME V1 - Cinematográfica**

| Seção | Foto Recomendada | Status |
|-------|------------------|--------|
| Hero Background | `TOP 1079 (1094).jpg` | ✅ FEITO |
| Grid 1 | `TOP 1079 (5425).jpg` | ✅ FEITO |
| Grid 2 | `TOP 1079 (2302).jpg` | ✅ FEITO |
| Grid 3 | `TOP 1079 (1126).jpg` | ✅ FEITO |
| Grid 4 | `TOP 1079 (1082).jpg` | ✅ FEITO |
| Evento 1 | `TOP 1079 (1094).jpg` | ✅ FEITO |
| Evento 2 | `TOP 1079 (6401).jpg` | ✅ FEITO |
| Evento 3 | `TOP 1079 (5628).jpg` | ✅ FEITO |
| Galeria (8 fotos) | Várias | ⚠️ PENDENTE |

---

### **HOME V2 - Dashboard Social**

| Seção | Foto Recomendada | Status |
|-------|------------------|--------|
| Hero | `TOP 1079 (6401).jpg` | ❌ TODO |
| Card Evento 1 | `TOP 1079 (1094).jpg` | ❌ TODO |
| Card Evento 2 | `TOP 1079 (5628).jpg` | ❌ TODO |
| Post Feed 1 | `TOP 1079 (4251).jpg` | ❌ TODO |
| Post Feed 2 | `TOP 1079 (5425).jpg` | ❌ TODO |
| Post Feed 3 | `TOP 1079 (1126).jpg` | ❌ TODO |
| Avatar Atleta 1 | `TOP 1079 (4251).jpg` (crop) | ❌ TODO |
| Avatar Atleta 2 | `TOP 1079 (1126).jpg` (crop) | ❌ TODO |
| Avatar Atleta 3 | `TOP 1079 (6401).jpg` (crop) | ❌ TODO |

---

### **HOME V3 - Minimalista Elite**

| Seção | Foto Recomendada | Status |
|-------|------------------|--------|
| Hero Background | `TOP 1079 (1082).jpg` | ❌ TODO |
| Slider Slide 1 | `TOP 1079 (6401).jpg` | ❌ TODO |
| Slider Slide 2 | `TOP 1079 (2302).jpg` | ❌ TODO |
| Slider Slide 3 | `TOP 1079 (1126).jpg` | ❌ TODO |

---

## ⚠️ PROBLEMAS CONHECIDOS

### 1. Blur Inconsistente
**Problema:** Algumas fotos têm blur aplicado inline, outras não.  
**Solução:** Padronizar usando o componente `RotaImage.tsx` ou aplicar blur inline em todas.

### 2. Fotos Muito Pesadas
**Problema:** 5 fotos acima de 5MB vão deixar o site lento.  
**Solução:** Comprimir para ~200-300KB antes da próxima sessão.

### 3. Marcas D'água Visíveis
**Problema:** Marcas "LEGENDARIOS" e "RETO TOP" aparecem nas fotos.  
**Solução:** Blur já está implementado, mas precisa ajustar posições/tamanhos.

---

## 💡 DICAS IMPORTANTES

### Sobre Blur:
- O blur está aplicado com `backdrop-blur-md` do Tailwind
- Posições atuais:
  - Superior direito: `w-32 h-24`
  - Inferior esquerdo: `w-48 h-20`
- Se precisar ajustar, modifique esses valores

### Sobre Performance:
- Next.js otimiza imagens automaticamente
- Mas fotos > 5MB ainda são muito pesadas
- Comprimir é essencial antes do deploy

### Sobre Paths:
- Usar sempre `/fotos-rota/NOME.jpg`
- Next.js serve automaticamente de `/public/`
- Não usar `../` ou caminhos absolutos do sistema

---

## 🎨 DESIGN DECISIONS PARA MANTER

### Blur Overlay:
- Sempre usar gradiente (não corte abrupto)
- Manter transparência suave
- Não cobrir elementos importantes da foto

### Responsividade:
- Todas as fotos devem funcionar em mobile
- Testar em 320px, 768px, 1024px, 1440px
- Usar `object-cover` para manter aspect ratio

### Alt Text:
- Sempre descritivo ("Networking em roda", não "foto1")
- Ajuda em SEO e acessibilidade

---

## 📞 CONTATO QUANDO RETOMAR

**Igor:**  
Se você tiver alguma preferência sobre quais fotos usar onde, me avise!  
Estou usando o inventário como guia mas você pode mudar.

**Lucas (eu):**  
Vou continuar de onde parei, seguindo este documento.

---

## ✅ DEFINIÇÃO DE "PRONTO"

Uma home page estará 100% pronta quando:
- [ ] Todas as fotos placeholder substituídas por reais
- [ ] Blur aplicado em todas as marcas d'água
- [ ] Fotos otimizadas (< 500KB cada)
- [ ] Testado em desktop e mobile
- [ ] Sem erros no console
- [ ] Loading rápido (< 3s)

---

## 📊 PROGRESSO GERAL

```
Home V1: ████████░░ 80% (fotos principais feitas, falta galeria)
Home V2: ░░░░░░░░░░  0% (não iniciada)
Home V3: ░░░░░░░░░░  0% (não iniciada)
Otimização: ░░░░░░░░░░  0% (5 fotos precisam)
```

**Estimativa de tempo para completar:**
- Home V2: ~45min
- Home V3: ~30min
- Otimização fotos: ~20min
- Testes: ~30min
- **TOTAL: ~2 horas**

---

## 🗂️ ARQUIVOS IMPORTANTES

### Documentação (ler antes de começar):
- `.agent/PROGRESSO_HOME_PAGES.md` ← VOCÊ ESTÁ AQUI
- `.agent/CONTEXTO_PROJETO_HOME.md`
- `.agent/TEXTOS_ORIGINAIS_HOME.md`
- `.agent/INVENTARIO_FOTOS_ROTA.md`

### Código (editar amanhã):
- `app/home-v1/page.tsx` ← 80% pronto
- `app/home-v2/page.tsx` ← 0% pronto
- `app/home-v3/page.tsx` ← 0% pronto
- `components/RotaImage.tsx` ← Componente auxiliar

### Assets:
- `public/fotos-rota/` ← 26 fotos do evento

---

## 🎯 OBJETIVO FINAL

**Entregar:** 3 home pages completas com fotos reais, otimizadas e sem marcas d'água visíveis.

**Para que Igor:** Possa escolher qual versão (ou combinação) usar no site oficial do ROTA.

**Prazo:** Finalizar amanhã (29/01/2026) se possível.

---

**Documento criado em:** 28 de Janeiro de 2026, 19:32h  
**Para sessão de:** 29 de Janeiro de 2026  
**Status:** 🟡 Pausado - Pronto para retomar

---

## 🚦 QUICK START PARA AMANHÃ

```bash
# 1. Iniciar servidor
cd /home/igor/Vídeos/Legendarios && npm run dev

# 2. Abrir browser em:
# - http://localhost:3001/home-v1
# - http://localhost:3001/home-v2
# - http://localhost:3001/home-v3

# 3. Começar editando:
# - app/home-v2/page.tsx
```

Boa sorte, Lucas do futuro! 🚀
