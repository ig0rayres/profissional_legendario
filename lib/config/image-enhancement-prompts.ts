/**
 * CONFIGURAÇÃO DE PROMPTS PARA GERAÇÃO DE IMAGENS COM DALL-E 3
 * 
 * Edite os prompts abaixo para controlar como as imagens são geradas.
 * DALL-E 3 gera imagens INCRÍVEIS e fotorrealistas!
 * 
 * DICAS PARA DALL-E 3:
 * - Seja descritivo e específico
 * - Use termos como "professional photography", "studio shot", "commercial"
 * - Descreva iluminação, ângulo, composição
 * - DALL-E 3 entende contexto muito bem
 */

export const IMAGE_ENHANCEMENT_CONFIG = {
    // =====================================================
    // PROMPT BASE - Aplicado a TODAS as imagens
    // =====================================================
    basePrompt: `
        Ultra-realistic professional product photography,
        premium commercial advertising style,
        shot with high-end DSLR camera,
        perfect studio lighting with soft shadows,
        clean elegant background with subtle gradient,
        award-winning photography composition,
        8K resolution, extremely detailed and sharp
    `.trim().replace(/\s+/g, ' '),

    // =====================================================
    // PROMPTS POR POSIÇÃO (1º, 2º, 3º lugar)
    // =====================================================
    positionPrompts: {
        1: `
            CHAMPION AWARD PRESENTATION:
            Majestic golden podium display,
            dramatic spotlight from above creating golden glow,
            floating gold confetti particles in the air,
            luxury velvet surface,
            subtle crown icon reflection,
            premium winner's trophy aesthetic,
            cinematic golden hour lighting
        `.trim().replace(/\s+/g, ' '),

        2: `
            SECOND PLACE HONOR DISPLAY:
            Elegant silver metallic podium,
            sophisticated cool-toned lighting,
            subtle silver sparkles effect,
            premium satin fabric backdrop,
            refined achievement presentation,
            professional commercial photography style
        `.trim().replace(/\s+/g, ' '),

        3: `
            BRONZE ACHIEVEMENT SHOWCASE:
            Warm bronze metallic display stand,
            elegant amber accent lighting,
            rich copper tones,
            premium presentation style,
            professional product photography,
            sophisticated warm atmosphere
        `.trim().replace(/\s+/g, ' ')
    },

    // =====================================================
    // PROMPTS POR CATEGORIA DE PRÊMIO
    // Detectado automaticamente pelo título do prêmio
    // =====================================================
    categoryPrompts: {
        // Eletrônicos
        electronics: `
            The prize is a cutting-edge technology device,
            shown floating slightly above a reflective surface,
            subtle blue LED ambient glow,
            futuristic tech product showcase,
            Apple-style minimalist commercial photography,
            premium unboxing moment aesthetic
        `.trim().replace(/\s+/g, ' '),

        // Viagens/Experiências  
        travel: `
            The prize represents a luxury travel experience,
            dreamy tropical paradise scenery in soft focus background,
            golden sunset colors,
            premium vacation lifestyle photography,
            aspirational travel magazine cover style,
            pristine beach or luxury resort hints
        `.trim().replace(/\s+/g, ' '),

        // Dinheiro/Vouchers
        money: `
            The prize represents financial reward,
            elegant gift card or voucher presentation,
            subtle gold coins aesthetic,
            premium banking advertisement style,
            wealth and prosperity symbolism,
            sophisticated financial success imagery
        `.trim().replace(/\s+/g, ' '),

        // Produtos físicos genéricos
        product: `
            The prize is a premium physical product,
            luxury gift box presentation,
            elegant ribbon and premium packaging,
            unboxing experience aesthetic,
            high-end retail photography style,
            aspirational lifestyle product shot
        `.trim().replace(/\s+/g, ' '),

        // Padrão (quando não detectar categoria)
        default: `
            The prize is a valuable reward,
            premium gift presentation,
            elegant showcase display,
            luxury brand commercial photography,
            aspirational winning moment,
            high-value prize aesthetic
        `.trim().replace(/\s+/g, ' ')
    },

    // =====================================================
    // NEGATIVE PROMPT (não usado diretamente no DALL-E 3,
    // mas mantemos para referência e outros modelos)
    // =====================================================
    negativePrompt: `
        cartoon, anime, illustration, drawing, painting,
        low quality, blurry, pixelated, distorted,
        text, watermark, logo, signature, words, letters,
        ugly, deformed, disfigured, bad anatomy,
        oversaturated, overexposed, underexposed,
        artificial looking, fake, unrealistic colors,
        cheap looking, amateur photography, hands, fingers
    `.trim().replace(/\s+/g, ' '),

    // =====================================================
    // CONFIGURAÇÕES TÉCNICAS (DALL-E 3)
    // =====================================================
    technical: {
        provider: 'openai',
        model: 'dall-e-3',
        size: '1024x1024' as const,
        quality: 'hd' as const,  // 'hd' = alta qualidade
        style: 'natural' as const  // 'natural' = mais realista, 'vivid' = mais artístico
    }
}

/**
 * Detecta a categoria do prêmio pelo título
 */
export function detectPrizeCategory(title: string): keyof typeof IMAGE_ENHANCEMENT_CONFIG.categoryPrompts {
    const lowerTitle = title.toLowerCase()

    // Eletrônicos
    if (lowerTitle.match(/iphone|samsung|celular|smartphone|notebook|laptop|tablet|ipad|airpod|fone|headphone|tv|televisão|console|playstation|xbox|switch|watch|relógio|câmera|drone/)) {
        return 'electronics'
    }

    // Viagens
    if (lowerTitle.match(/viagem|trip|hotel|resort|passagem|aérea|cruzeiro|spa|experiência|pacote turístico|all inclusive|disney|cancun|europa/)) {
        return 'travel'
    }

    // Dinheiro/Vouchers
    if (lowerTitle.match(/voucher|vale|r\$|reais|pix|dinheiro|crédito|gift card|cashback|prêmio em dinheiro|ifood|uber|amazon/)) {
        return 'money'
    }

    // Produtos genéricos
    if (lowerTitle.match(/kit|produto|box|caixa|pacote|cesta|combo/)) {
        return 'product'
    }

    return 'default'
}

/**
 * Gera o prompt completo para DALL-E 3
 * O prompt é estruturado para maximizar a qualidade da imagem
 */
export function generateEnhancementPrompt(
    prizeTitle: string,
    position: 1 | 2 | 3
): { prompt: string, negativePrompt: string } {
    const config = IMAGE_ENHANCEMENT_CONFIG
    const category = detectPrizeCategory(prizeTitle)

    // Prompt estruturado para DALL-E 3
    const prompt = `
        Create an ultra-realistic, breathtaking image of a prize presentation:
        
        THE PRIZE: "${prizeTitle}"
        
        ${config.categoryPrompts[category]}
        
        PRESENTATION STYLE:
        ${config.positionPrompts[position]}
        
        PHOTOGRAPHY QUALITY:
        ${config.basePrompt}
        
        The image should look like a real photograph from a luxury awards ceremony or premium product advertisement. Make it aspirational and exciting - something that makes people want to WIN this prize!
    `.trim().replace(/\s+/g, ' ')

    return {
        prompt,
        negativePrompt: config.negativePrompt
    }
}
