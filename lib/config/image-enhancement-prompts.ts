/**
 * CONFIGURAÇÃO DE PROMPTS PARA MELHORIA DE IMAGENS DE PRÊMIOS
 * 
 * Edite os prompts abaixo para controlar como as imagens são melhoradas.
 * A IA vai usar esses prompts para criar montagens profissionais.
 * 
 * DICAS:
 * - Mantenha realista, evite termos como "fantasy", "cartoon", "artistic"
 * - Use termos como "professional", "studio lighting", "product photography"
 * - Adicione elementos de luxo: "premium", "elegant", "high-end"
 */

export const IMAGE_ENHANCEMENT_CONFIG = {
    // =====================================================
    // PROMPT BASE - Aplicado a TODAS as imagens
    // =====================================================
    basePrompt: `
        Professional product photography, studio lighting, 
        clean white background with subtle gradient,
        premium presentation, high-end commercial photography,
        8k resolution, sharp focus, photorealistic
    `.trim().replace(/\s+/g, ' '),

    // =====================================================
    // PROMPTS POR POSIÇÃO (1º, 2º, 3º lugar)
    // =====================================================
    positionPrompts: {
        1: `
            Golden luxury theme, winner's podium feel,
            subtle gold sparkles and confetti,
            champion presentation, prestigious award setup,
            dramatic lighting with gold accents
        `.trim().replace(/\s+/g, ' '),

        2: `
            Silver elegance theme, second place presentation,
            subtle silver metallic accents,
            professional award setup,
            clean sophisticated lighting
        `.trim().replace(/\s+/g, ' '),

        3: `
            Bronze premium theme, third place honor,
            warm bronze metallic accents,
            achievement presentation,
            elegant warm lighting
        `.trim().replace(/\s+/g, ' ')
    },

    // =====================================================
    // PROMPTS POR CATEGORIA DE PRÊMIO
    // Detectado automaticamente pelo título do prêmio
    // =====================================================
    categoryPrompts: {
        // Eletrônicos
        electronics: `
            Tech product showcase, modern minimalist setup,
            sleek reflective surface, premium tech photography,
            subtle blue LED accents in background
        `.trim().replace(/\s+/g, ' '),

        // Viagens/Experiências  
        travel: `
            Luxury travel theme, tropical paradise hints,
            premium vacation vibe, sophisticated presentation,
            subtle palm leaves and sunset colors in background
        `.trim().replace(/\s+/g, ' '),

        // Dinheiro/Vouchers
        money: `
            Financial success theme, premium banking aesthetic,
            elegant golden coins subtle in background,
            wealth and prosperity presentation
        `.trim().replace(/\s+/g, ' '),

        // Produtos físicos genéricos
        product: `
            Premium unboxing experience, luxury packaging,
            gift presentation, high-end retail photography,
            subtle ribbons and premium materials
        `.trim().replace(/\s+/g, ' '),

        // Padrão (quando não detectar categoria)
        default: `
            Premium gift presentation, luxury aesthetic,
            elegant showcase, high-end photography,
            subtle sparkles and premium feel
        `.trim().replace(/\s+/g, ' ')
    },

    // =====================================================
    // NEGATIVE PROMPT - O que EVITAR nas imagens
    // =====================================================
    negativePrompt: `
        cartoon, anime, illustration, drawing, painting,
        low quality, blurry, pixelated, distorted,
        text, watermark, logo, signature,
        ugly, deformed, disfigured, bad anatomy,
        oversaturated, overexposed, underexposed,
        artificial looking, fake, unrealistic colors,
        cheap looking, amateur photography
    `.trim().replace(/\s+/g, ' '),

    // =====================================================
    // CONFIGURAÇÕES TÉCNICAS
    // =====================================================
    technical: {
        // Modelo a usar (ex: replicate, fal.ai, etc)
        provider: 'replicate',

        // Modelo específico
        model: 'stability-ai/sdxl',

        // Força da transformação (0.3 = sutil, 0.7 = forte)
        strength: 0.45,

        // Número de steps (mais = melhor qualidade, mais lento)
        steps: 30,

        // Guidance scale (7-15, mais alto = mais fiel ao prompt)
        guidanceScale: 12,

        // Resolução de saída
        outputWidth: 1024,
        outputHeight: 1024
    }
}

/**
 * Detecta a categoria do prêmio pelo título
 */
export function detectPrizeCategory(title: string): keyof typeof IMAGE_ENHANCEMENT_CONFIG.categoryPrompts {
    const lowerTitle = title.toLowerCase()

    // Eletrônicos
    if (lowerTitle.match(/iphone|samsung|celular|notebook|laptop|tablet|airpod|fone|tv|console|playstation|xbox|switch/)) {
        return 'electronics'
    }

    // Viagens
    if (lowerTitle.match(/viagem|trip|hotel|resort|passagem|cruzeiro|spa|experiência/)) {
        return 'travel'
    }

    // Dinheiro/Vouchers
    if (lowerTitle.match(/voucher|vale|r\$|reais|pix|dinheiro|crédito|gift card/)) {
        return 'money'
    }

    // Produtos genéricos
    if (lowerTitle.match(/kit|produto|box|caixa|pacote/)) {
        return 'product'
    }

    return 'default'
}

/**
 * Gera o prompt completo para uma imagem de prêmio
 */
export function generateEnhancementPrompt(
    prizeTitle: string,
    position: 1 | 2 | 3
): { prompt: string, negativePrompt: string } {
    const config = IMAGE_ENHANCEMENT_CONFIG
    const category = detectPrizeCategory(prizeTitle)

    // Combinar prompts
    const prompt = [
        `${prizeTitle}, shown as a premium prize,`,
        config.basePrompt,
        config.positionPrompts[position],
        config.categoryPrompts[category]
    ].join(' ')

    return {
        prompt,
        negativePrompt: config.negativePrompt
    }
}
