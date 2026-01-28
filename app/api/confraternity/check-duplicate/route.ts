import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * API para verificar se uma foto já foi usada em confrarias anteriores
 * POST /api/confraternity/check-duplicate
 * 
 * Verifica por:
 * 1. Hash do arquivo (conteúdo idêntico)
 * 2. Nome do arquivo (opcional, menos confiável)
 */

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const imageFile = formData.get('image') as File
        const userId = formData.get('userId') as string

        if (!imageFile) {
            return NextResponse.json({
                isDuplicate: false,
                reason: 'Nenhuma imagem fornecida'
            })
        }

        // Calcular hash MD5 do arquivo
        const bytes = await imageFile.arrayBuffer()
        const hash = crypto.createHash('md5').update(Buffer.from(bytes)).digest('hex')

        console.log('[CheckDuplicate] Hash calculado:', hash)
        console.log('[CheckDuplicate] Nome do arquivo:', imageFile.name)
        console.log('[CheckDuplicate] Tamanho:', imageFile.size)

        // Usar service_role para buscar todos os posts de confraria do usuário
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        // Buscar posts de confraria do usuário com metadados de imagem
        const { data: existingPosts, error } = await supabaseAdmin
            .from('posts')
            .select('id, media_urls, metadata, created_at')
            .eq('user_id', userId)
            .eq('post_type', 'confraria')
            .not('media_urls', 'is', null)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('[CheckDuplicate] Erro ao buscar posts:', error)
            return NextResponse.json({ isDuplicate: false })
        }

        // Verificar se algum post tem o mesmo hash
        for (const post of existingPosts || []) {
            const postMetadata = post.metadata as { image_hash?: string; image_name?: string } | null

            if (postMetadata?.image_hash === hash) {
                console.log('[CheckDuplicate] ⚠️ DUPLICATA ENCONTRADA por hash! Post:', post.id)
                return NextResponse.json({
                    isDuplicate: true,
                    reason: 'Esta foto já foi usada em uma confraria anterior.',
                    duplicatePostId: post.id,
                    duplicateDate: post.created_at
                })
            }
        }

        // Também verificar nome do arquivo (menos confiável, mas útil)
        const fileName = imageFile.name.toLowerCase()
        for (const post of existingPosts || []) {
            const postMetadata = post.metadata as { image_name?: string } | null

            if (postMetadata?.image_name?.toLowerCase() === fileName) {
                console.log('[CheckDuplicate] ⚠️ Mesmo nome de arquivo encontrado! Post:', post.id)
                // Não bloquear por nome, apenas avisar
            }
        }

        console.log('[CheckDuplicate] ✅ Foto é original')
        return NextResponse.json({
            isDuplicate: false,
            hash: hash // Retornar hash para salvar no metadata do post
        })

    } catch (error) {
        console.error('[CheckDuplicate] Erro:', error)
        return NextResponse.json({ isDuplicate: false })
    }
}
