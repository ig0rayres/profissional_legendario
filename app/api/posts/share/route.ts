import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * API para compartilhar post de confraria
 * Quando o parceiro compartilha, ele ganha pontos e o post aparece no feed dele
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { originalPostId, userId, comment } = body

        if (!originalPostId || !userId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: originalPostId, userId' },
                { status: 400 }
            )
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        // 1. Buscar post original
        const { data: originalPost, error: fetchError } = await supabaseAdmin
            .from('posts')
            .select('*, confraternity:confraternities!posts_confraternity_id_fkey(id, member1_id, member2_id)')
            .eq('id', originalPostId)
            .single()

        if (fetchError || !originalPost) {
            return NextResponse.json(
                { success: false, error: 'Post não encontrado' },
                { status: 404 }
            )
        }

        // Verificar se usuário é parte da confraria
        const confraternity = originalPost.confraternity
        if (confraternity) {
            const isPartner = confraternity.member1_id === userId || confraternity.member2_id === userId
            if (!isPartner) {
                return NextResponse.json(
                    { success: false, error: 'Você não é parte desta confraria' },
                    { status: 403 }
                )
            }
        }

        // Verificar se já compartilhou
        const { data: existingShare } = await supabaseAdmin
            .from('posts')
            .select('id')
            .eq('shared_from_post_id', originalPostId)
            .eq('user_id', userId)
            .maybeSingle()

        if (existingShare) {
            return NextResponse.json(
                { success: false, error: 'Você já compartilhou este post' },
                { status: 400 }
            )
        }

        // 2. Criar novo post como compartilhamento
        const shareContent = comment
            ? `${comment}\n\n🔄 Compartilhado de ${originalPost.user?.full_name || 'parceiro'}`
            : `🔄 Compartilhei nosso encontro!`

        const { data: sharedPost, error: shareError } = await supabaseAdmin
            .from('posts')
            .insert({
                user_id: userId,
                content: shareContent,
                media_urls: originalPost.media_urls,
                confraternity_id: originalPost.confraternity_id,
                shared_from_post_id: originalPostId,
                shared_by_user_id: userId,
                share_comment: comment || null,
                visibility: originalPost.visibility || 'public'
            })
            .select()
            .single()

        if (shareError) {
            console.error('[Share Post] Error:', shareError)
            return NextResponse.json(
                { success: false, error: shareError.message },
                { status: 500 }
            )
        }

        // 3. Creditar pontos ao usuário que compartilhou
        // +50 por completar (participação) + +20 por foto + +15 depoimento
        const photoCount = originalPost.media_urls?.filter((u: string) => u && u.trim() !== '').length || 0
        const basePoints = 50 + (photoCount * 20) + (comment ? 15 : 0)

        // Chamar API de pontos
        const pointsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/gamification/award-points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                points: basePoints,
                actionType: 'confraternity_shared',
                description: 'Compartilhou post de confraria'
            })
        })

        const pointsResult = await pointsResponse.json()

        console.log('[Share Post] Success - Post:', sharedPost.id, 'Points:', pointsResult)

        return NextResponse.json({
            success: true,
            sharedPostId: sharedPost.id,
            pointsAwarded: pointsResult.xpAwarded || basePoints
        })

    } catch (error) {
        console.error('[Share Post] Exception:', error)
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
