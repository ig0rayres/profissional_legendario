# 🎨 IA dos Prêmios / Prompt das Temporadas

## O que é?
Sistema de geração de imagens incríveis para os prêmios das temporadas usando **DALL-E 3** (OpenAI).

## Onde ficam os prompts?
```
lib/config/image-enhancement-prompts.ts
```

## Como funciona?

1. Admin faz upload de uma foto do prêmio (ex: foto de um iPhone)
2. Clica no botão **"✨ Melhorar com IA"**
3. O sistema gera um prompt baseado em:
   - Título do prêmio (ex: "iPhone 15 Pro")
   - Posição (1º, 2º ou 3º lugar)
   - Categoria detectada automaticamente (eletrônicos, viagem, dinheiro, etc)
4. DALL-E 3 cria uma imagem INCRÍVEL estilo premiação de luxo

---

## 🔧 Como Editar os Prompts

Abra o arquivo `lib/config/image-enhancement-prompts.ts`:

### Prompt Base (aplica a todas as imagens)
```typescript
basePrompt: `
    Ultra-realistic professional product photography,
    premium commercial advertising style,
    ...
`
```

### Prompts por Posição
```typescript
positionPrompts: {
    1: `Golden podium display, gold confetti...`,  // 🥇
    2: `Silver metallic podium...`,                 // 🥈
    3: `Bronze metallic display...`                 // 🥉
}
```

### Prompts por Categoria
```typescript
categoryPrompts: {
    electronics: `Tech product showcase, blue LED glow...`,
    travel: `Luxury travel, tropical paradise...`,
    money: `Financial reward, gold coins...`,
    product: `Premium gift box, unboxing...`,
    default: `Luxury prize presentation...`
}
```

### Detecção de Categoria
```typescript
// Edite as palavras-chave para cada categoria
if (lowerTitle.match(/iphone|samsung|notebook|.../) {
    return 'electronics'
}
```

---

## ⚙️ Configurações Técnicas

```typescript
technical: {
    provider: 'openai',
    model: 'dall-e-3',
    size: '1024x1024',
    quality: 'hd',      // 'standard' ou 'hd'
    style: 'natural'    // 'natural' (realista) ou 'vivid' (artístico)
}
```

---

## 📁 Arquivos Relacionados

| Arquivo | Função |
|---------|--------|
| `lib/config/image-enhancement-prompts.ts` | **Prompts editáveis** |
| `app/api/seasons/enhance-image/route.ts` | API que chama DALL-E |
| `components/admin/SeasonsManager.tsx` | Botão "Melhorar com IA" |

---

## 🔑 Requisitos

```env
OPENAI_API_KEY=sk-...
```

---

## 💡 Dicas para Bons Prompts

1. **Seja específico**: descreva iluminação, ângulo, materiais
2. **Use termos de fotografia**: "studio lighting", "soft shadows", "8K"
3. **Mantenha realista**: evite "cartoon", "illustration", "fantasy"
4. **Contexto de premiação**: "award ceremony", "winner's podium", "champion"
5. **Aspiracional**: faça as pessoas QUEREREM ganhar o prêmio!

---

## Exemplos de Resultado

**Prêmio**: "iPhone 15 Pro" (1º lugar)
**Categoria detectada**: electronics
**Prompt gerado**:
> "Create an ultra-realistic, breathtaking image of a prize presentation: THE PRIZE: iPhone 15 Pro. Cutting-edge technology device, floating above reflective surface, subtle blue LED glow... CHAMPION AWARD: Majestic golden podium, dramatic spotlight, floating gold confetti..."

**Resultado**: Imagem fotorrealista de iPhone em pedestal dourado com confetes e iluminação dramática 🔥
