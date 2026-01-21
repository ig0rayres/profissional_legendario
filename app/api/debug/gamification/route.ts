// Debug API para testar gamificação

export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()

        // Pegar usuário logado
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const userId = user.id

        // 1. Verificar se existe registro em user_gamification
        const { data: existingStats, error: fetchError } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()

        console.log('[DEBUG] Existing stats:', existingStats)
        console.log('[DEBUG] Fetch error:', fetchError)

        // 2. Se não existe, tentar criar
        if (!existingStats) {
            console.log('[DEBUG] Creating new record...')
            const { data: newRecord, error: insertError } = await supabase
                .from('user_gamification')
                .insert({
                    user_id: userId,
                    total_points: 0,
                    current_rank_id: 'novato',
                    monthly_vigor: 0,
                    last_activity_at: new Date().toISOString()
                })
                .select()
                .single()

            console.log('[DEBUG] New record:', newRecord)
            console.log('[DEBUG] Insert error:', insertError)

            if (insertError) {
                return NextResponse.json({
                    step: 'INSERT',
                    error: insertError.message,
                    details: insertError
                }, { status: 500 })
            }
        }

        // 3. Tentar adicionar pontos
        const currentPoints = existingStats?.total_points || 0
        const newPoints = currentPoints + 10

        console.log('[DEBUG] Updating points:', currentPoints, '->', newPoints)

        const { data: updatedStats, error: updateError } = await supabase
            .from('user_gamification')
            .update({
                total_points: newPoints,
                last_activity_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single()

        console.log('[DEBUG] Updated stats:', updatedStats)
        console.log('[DEBUG] Update error:', updateError)

        if (updateError) {
            return NextResponse.json({
                step: 'UPDATE',
                error: updateError.message,
                details: updateError
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            userId,
            before: currentPoints,
            after: newPoints,
            updatedStats
        })

    } catch (error: any) {
        console.error('[DEBUG] Exception:', error)
        return NextResponse.json({
            step: 'EXCEPTION',
            error: error.message
        }, { status: 500 })
    }
}
