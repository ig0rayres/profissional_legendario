/**
 * API: Get User Ranking Position
 * Retorna posição do usuário no ranking EXCLUINDO admin/rotabusiness
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const EXCLUDED_EMAILS = [
    'admin@rotabusinessclub.com.br',
    'sistema@rotabusinessclub.com.br',
    'rotabusiness@rotabusinessclub.com.br'
]

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Buscar pontos do usuário
        const { data: userGamification } = await supabase
            .from('user_gamification')
            .select('total_points')
            .eq('user_id', userId)
            .single()

        if (!userGamification) {
            return NextResponse.json({ position: null })
        }

        // 2. Contar quantos usuários têm MAIS pontos (excluindo admin/sistema)
        const { count } = await supabase
            .from('user_gamification')
            .select('user_id, total_points, profiles!inner(email)', { count: 'exact', head: true })
            .gt('total_points', userGamification.total_points)
            .not('profiles.email', 'in', `(${EXCLUDED_EMAILS.join(',')})`)

        const position = (count || 0) + 1

        return NextResponse.json({
            position,
            totalPoints: userGamification.total_points,
            excludedEmails: EXCLUDED_EMAILS
        })

    } catch (error: any) {
        console.error('Error getting user ranking:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
