import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMultiplier } from '@/lib/subscription/multipliers'

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
 * API para conceder proeza mensal com service role (bypassa RLS)
 * POST /api/gamification/award-proeza
 * Body: { userId, proezaId }
 * 
 * IMPORTANTE: Aplica multiplicador do plano automaticamente
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, proezaId } = await request.json()

        if (!userId || !proezaId) {
            return NextResponse.json(
                { error: 'userId e proezaId são obrigatórios' },
                { status: 400 }
            )
        }

        const supabase = getSupabaseAdmin()

        // 1. Verificar se já conquistou este mês
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { data: existing } = await supabase
            .from('user_proezas')
            .select('proeza_id')
            .eq('user_id', userId)
            .eq('proeza_id', proezaId)
            .gte('earned_at', startOfMonth.toISOString())
            .maybeSingle()

        if (existing) {
            console.log(`[API award-proeza] Usuário ${userId} já possui proeza ${proezaId} este mês`)
            return NextResponse.json({ success: true, alreadyOwned: true })
        }

        // 2. Buscar detalhes da proeza
        const { data: proeza, error: proezaError } = await supabase
            .from('proezas')
            .select('id, name, points_base, description')
            .eq('id', proezaId)
            .single()

        if (proezaError || !proeza) {
            console.error('[API award-proeza] Proeza não encontrada:', proezaId)
            return NextResponse.json({ error: 'Proeza não encontrada' }, { status: 404 })
        }

        // 3. Buscar plano do usuário para multiplicador
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id, status')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle()

        const planId = subscription?.plan_id || 'recruta'
        const multiplier = getMultiplier(planId)
        const basePoints = proeza.points_base || 0
        const finalPoints = Math.round(basePoints * multiplier)

        console.log(`[API award-proeza] Plano: ${planId}, Multiplicador: ${multiplier}, Base: ${basePoints}, Final: ${finalPoints}`)

        // 4. Inserir proeza (user_proezas)
        const { error: insertError } = await supabase
            .from('user_proezas')
            .insert({
                user_id: userId,
                proeza_id: proezaId,
                earned_at: new Date().toISOString()
            })

        if (insertError) {
            console.error('[API award-proeza] Erro ao inserir proeza:', insertError)
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
            console.error('[API award-proeza] Erro ao atualizar pontos:', updateError)
            // Não retornamos erro aqui, proeza já foi concedida
        }

        // 6. Registrar no histórico
        await supabase
            .from('points_history')
            .insert({
                user_id: userId,
                points: finalPoints,
                action_type: 'proeza_reward',
                description: `Conquistou proeza: ${proeza.name} (${multiplier}x)`
            })

        // 7. Criar notificação
        await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type: 'achievement',
                title: '🔥 Proeza Conquistada!',
                body: `Você completou a proeza \"${proeza.name}\"!\n${proeza.description || ''}\n+${finalPoints} Vigor`,
                priority: 'medium',
                metadata: { proeza_id: proezaId, proeza_name: proeza.name, points: finalPoints }
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
                    content: `🔥 **Proeza Conquistada!**\n\nParabéns, Valente! Você completou a proeza **\"${proeza.name}\"**!\n\n${proeza.description || ''}\n\n💪 +${finalPoints} Vigor creditados na sua conta.\n\nContinue conquistando! 🔥`
                })

            await supabase
                .from('conversations')
                .update({
                    last_message_at: new Date().toISOString(),
                    last_message_preview: `🔥 ${proeza.name}`
                })
                .eq('id', conversationId)
        }

        console.log(`✅ [API award-proeza] Proeza concedida: ${proeza.name} para usuário ${userId} (+${finalPoints} Vigor, ${multiplier}x)`)

        return NextResponse.json({
            success: true,
            alreadyOwned: false,
            proeza: proeza.name,
            points: finalPoints,
            multiplier
        })

    } catch (error: any) {
        console.error('[API award-proeza] Exception:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
