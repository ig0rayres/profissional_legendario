import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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
 * API para admin atualizar status de verificação de usuário
 * 
 * PATCH /api/admin/verify-user
 * Body: { userId: string, status: 'verified' | 'rejected' | 'pending' }
 */
export async function PATCH(request: NextRequest) {
    try {
        const { userId, status } = await request.json()

        if (!userId || !status) {
            return NextResponse.json(
                { error: 'userId e status são obrigatórios' },
                { status: 400 }
            )
        }

        if (!['verified', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json(
                { error: 'Status inválido' },
                { status: 400 }
            )
        }

        const supabase = getSupabaseAdmin()

        console.log('[Admin API] Atualizando verification_status:', userId, '->', status)

        const { data, error } = await supabase
            .from('profiles')
            .update({ verification_status: status })
            .eq('id', userId)
            .select('id, full_name, verification_status')
            .single()

        if (error) {
            console.error('[Admin API] Erro ao atualizar:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        console.log('[Admin API] Atualizado com sucesso:', data)

        return NextResponse.json({
            success: true,
            user: data
        })

    } catch (error: any) {
        console.error('[Admin API] Erro:', error)
        return NextResponse.json(
            { error: error.message || 'Erro interno' },
            { status: 500 }
        )
    }
}
