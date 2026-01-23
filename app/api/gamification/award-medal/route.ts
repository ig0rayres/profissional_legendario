import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Usar service role para bypassar RLS
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
    })
}

/**
 * API para conceder medalha com service role (bypassa RLS)
 * POST /api/gamification/award-medal
 * Body: { userId, medalId }
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, medalId } = await request.json()

        if (!userId || !medalId) {
            return NextResponse.json(
                { error: 'userId e medalId são obrigatórios' },
                { status: 400 }
            )
        }

        const supabase = getSupabaseAdmin()

        // 1. Verificar se já possui a medalha
        const { data: existing } = await supabase
            .from('user_medals')
            .select('medal_id')
            .eq('user_id', userId)
            .eq('medal_id', medalId)
            .maybeSingle()

        if (existing) {
            console.log(`[API award-medal] Usuário ${userId} já possui medalha ${medalId}`)
            return NextResponse.json({ success: true, alreadyOwned: true })
        }

        // 2. Buscar detalhes da medalha
        const { data: medal, error: medalError } = await supabase
            .from('medals')
            .select('id, name, points_reward, description')
            .eq('id', medalId)
            .single()

        if (medalError || !medal) {
            console.error('[API award-medal] Medalha não encontrada:', medalId)
            return NextResponse.json({ error: 'Medalha não encontrada' }, { status: 404 })
        }

        // 3. Buscar plano do usuário para multiplicador
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id, status')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle()

        const planId = subscription?.plan_id || 'recruta'
        const multiplier = planId === 'elite' ? 3 : planId === 'veterano' ? 1.5 : 1
        const basePoints = medal.points_reward || 0
        const finalPoints = Math.round(basePoints * multiplier)

        console.log(`[API award-medal] Plano: ${planId}, Multiplicador: ${multiplier}, Base: ${basePoints}, Final: ${finalPoints}`)

        // 4. Inserir medalha (user_medals)
        const { error: insertError } = await supabase
            .from('user_medals')
            .insert({
                user_id: userId,
                medal_id: medalId
            })

        if (insertError) {
            console.error('[API award-medal] Erro ao inserir medalha:', insertError)
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        // 5. Atualizar pontos do usuário
        const { data: gamification } = await supabase
            .from('user_gamification')
            .select('total_points')
            .eq('user_id', userId)
            .single()

        const currentPoints = gamification?.total_points || 0
        const newPoints = currentPoints + finalPoints

        const { error: updateError } = await supabase
            .from('user_gamification')
            .update({
                total_points: newPoints,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)

        if (updateError) {
            console.error('[API award-medal] Erro ao atualizar pontos:', updateError)
            // Não retornamos erro aqui, medalha já foi concedida
        }

        // 6. Registrar no histórico
        await supabase
            .from('points_history')
            .insert({
                user_id: userId,
                points: finalPoints,
                action_type: 'medal_reward',
                description: `Conquistou medalha: ${medal.name} (${multiplier}x)`
            })

        // 7. Criar notificação COM DESCRIÇÃO
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'badge_earned',
                title: '🏅 Nova Medalha!',
                body: `Você conquistou a medalha "${medal.name}"!\n${medal.description || ''}\n+${finalPoints} Vigor`,
                priority: 'high',
                metadata: { badge_id: medalId, badge_name: medal.name, points: finalPoints }
            })

        // 8. Verificar e atualizar rank se necessário
        const { data: ranks } = await supabase
            .from('ranks')
            .select('id, points_required')
            .order('points_required', { ascending: false })

        if (ranks) {
            for (const rank of ranks) {
                if (newPoints >= rank.points_required) {
                    await supabase
                        .from('user_gamification')
                        .update({ current_rank_id: rank.id })
                        .eq('user_id', userId)
                    break
                }
            }
        }

        // 9. Enviar mensagem no chat do sistema
        // Buscar ou criar conversa com sistema
        const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

        const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant_1.eq.${SYSTEM_USER_ID},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${SYSTEM_USER_ID})`)
            .maybeSingle()

        let conversationId = existingConv?.id

        if (!conversationId) {
            const { data: newConv } = await supabase
                .from('conversations')
                .insert({
                    participant_1: SYSTEM_USER_ID < userId ? SYSTEM_USER_ID : userId,
                    participant_2: SYSTEM_USER_ID < userId ? userId : SYSTEM_USER_ID
                })
                .select('id')
                .single()

            conversationId = newConv?.id
        }

        if (conversationId) {
            await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: SYSTEM_USER_ID,
                    content: `🏅 **Nova Medalha Conquistada!**\n\nParabéns, Valente! Você desbloqueou a medalha **"${medal.name}"**!\n\n${medal.description || ''}\n\n💪 +${finalPoints} Vigor creditados na sua conta.\n\nContinue conquistando! 🔥`
                })

            await supabase
                .from('conversations')
                .update({
                    last_message_at: new Date().toISOString(),
                    last_message_preview: `🏅 ${medal.name}`
                })
                .eq('id', conversationId)
        }

        console.log(`✅ [API award-medal] Medalha concedida: ${medal.name} para usuário ${userId} (+${finalPoints} Vigor, ${multiplier}x)`)

        return NextResponse.json({
            success: true,
            alreadyOwned: false,
            medal: medal.name,
            points: finalPoints,
            multiplier
        })

    } catch (error: any) {
        console.error('[API award-medal] Exception:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
