import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import {
    IMAGE_ENHANCEMENT_CONFIG,
    generateEnhancementPrompt
} from '@/lib/config/image-enhancement-prompts'

/**
 * API para criar/melhorar imagens de prêmios usando DALL-E 3
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

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
    try {
        const { imageUrl, prizeTitle, position } = await request.json()

        if (!prizeTitle || !position) {
            return NextResponse.json({
                error: 'Parâmetros obrigatórios: prizeTitle, position'
            }, { status: 400 })
        }

        // Verificar se OpenAI está configurada
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                success: false,
                mode: 'demo',
                message: 'Configure OPENAI_API_KEY no .env para usar DALL-E 3',
                enhancedUrl: imageUrl
            })
        }

        // Gerar prompts otimizados
        const { prompt, negativePrompt } = generateEnhancementPrompt(
            prizeTitle,
            position as 1 | 2 | 3
        )

        // =====================================================
        // GERAR IMAGEM COM DALL-E 3
        // =====================================================

        console.log('[DALL-E 3] Gerando imagem para:', prizeTitle)
        console.log('[DALL-E 3] Prompt:', prompt)

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd', // Alta qualidade
            style: 'natural' // Estilo natural/realista
        })

        const generatedImageUrl = response.data[0]?.url

        if (!generatedImageUrl) {
            throw new Error('DALL-E não retornou imagem')
        }

        // =====================================================
        // SALVAR NO SUPABASE STORAGE
        // =====================================================

        const supabase = getSupabaseAdmin()

        // Baixar imagem do OpenAI
        const imageResponse = await fetch(generatedImageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()

        const fileName = `prize_${position}_${Date.now()}.png`
        const { error: uploadError } = await supabase.storage
            .from('public')
            .upload(`seasons/${fileName}`, imageBuffer, {
                contentType: 'image/png',
                upsert: true
            })

        if (uploadError) {
            console.error('[Storage] Erro ao salvar:', uploadError)
            // Mesmo com erro de storage, retornamos a URL temporária do OpenAI
            return NextResponse.json({
                success: true,
                enhancedUrl: generatedImageUrl,
                warning: 'Imagem gerada mas não salva no storage',
                promptUsed: prompt
            })
        }

        const { data: urlData } = supabase.storage
            .from('public')
            .getPublicUrl(`seasons/${fileName}`)

        console.log('[DALL-E 3] Imagem gerada e salva:', urlData.publicUrl)

        return NextResponse.json({
            success: true,
            enhancedUrl: urlData.publicUrl,
            promptUsed: prompt,
            revisedPrompt: response.data[0]?.revised_prompt // DALL-E 3 às vezes ajusta o prompt
        })

    } catch (error: any) {
        console.error('[API] Error enhancing image:', error)

        // Erros específicos do OpenAI
        if (error?.code === 'content_policy_violation') {
            return NextResponse.json({
                error: 'O prompt viola políticas de conteúdo. Tente outro título de prêmio.'
            }, { status: 400 })
        }

        if (error?.code === 'rate_limit_exceeded') {
            return NextResponse.json({
                error: 'Limite de requisições excedido. Aguarde alguns segundos.'
            }, { status: 429 })
        }

        return NextResponse.json({
            error: error.message
        }, { status: 500 })
    }
}
