import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
    IMAGE_ENHANCEMENT_CONFIG,
    generateEnhancementPrompt
} from '@/lib/config/image-enhancement-prompts'

/**
 * API para melhorar imagens de prêmios usando IA
 * 
 * POST /api/seasons/enhance-image
 * Body: { imageUrl, prizeTitle, position }
 */

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function POST(request: NextRequest) {
    try {
        const { imageUrl, prizeTitle, position } = await request.json()

        if (!imageUrl || !prizeTitle || !position) {
            return NextResponse.json({
                error: 'Parâmetros obrigatórios: imageUrl, prizeTitle, position'
            }, { status: 400 })
        }

        // Gerar prompts
        const { prompt, negativePrompt } = generateEnhancementPrompt(
            prizeTitle,
            position as 1 | 2 | 3
        )

        const config = IMAGE_ENHANCEMENT_CONFIG.technical

        // =====================================================
        // INTEGRAÇÃO COM REPLICATE
        // Descomente e configure sua API key
        // =====================================================

        /*
        const Replicate = require('replicate')
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN
        })
        
        const output = await replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            {
                input: {
                    image: imageUrl,
                    prompt: prompt,
                    negative_prompt: negativePrompt,
                    strength: config.strength,
                    num_inference_steps: config.steps,
                    guidance_scale: config.guidanceScale,
                    width: config.outputWidth,
                    height: config.outputHeight
                }
            }
        )
        
        // Salvar no Supabase Storage
        const supabase = getSupabaseAdmin()
        const enhancedImageUrl = output[0]
        
        // Baixar imagem do Replicate
        const imageResponse = await fetch(enhancedImageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        
        const fileName = `enhanced_${Date.now()}.png`
        const { error: uploadError } = await supabase.storage
            .from('public')
            .upload(`seasons/${fileName}`, imageBuffer, {
                contentType: 'image/png',
                upsert: true
            })
        
        if (uploadError) throw uploadError
        
        const { data: urlData } = supabase.storage
            .from('public')
            .getPublicUrl(`seasons/${fileName}`)
        
        return NextResponse.json({
            success: true,
            enhancedUrl: urlData.publicUrl,
            promptUsed: prompt
        })
        */

        // =====================================================
        // MODO DE DEMONSTRAÇÃO (sem API configurada)
        // Retorna a imagem original + informações do prompt
        // =====================================================

        return NextResponse.json({
            success: true,
            enhancedUrl: imageUrl, // Por enquanto retorna a original
            mode: 'demo',
            message: 'API de IA não configurada. Configure REPLICATE_API_TOKEN.',
            promptGenerated: {
                prompt,
                negativePrompt,
                settings: config
            }
        })

    } catch (error: any) {
        console.error('[API] Error enhancing image:', error)
        return NextResponse.json({
            error: error.message
        }, { status: 500 })
    }
}
