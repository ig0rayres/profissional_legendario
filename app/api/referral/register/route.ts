import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { registerReferral } from '@/lib/services/referral-service'

/**
 * POST /api/referral/register
 * 
 * Registra a indicação após o usuário se cadastrar.
 * Lê o cookie 'referral_code' salvo pela rota /r/{slug}
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Buscar usuário logado
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            )
        }

        // Ler cookie de indicação
        const cookieStore = await cookies()
        const referralCode = cookieStore.get('referral_code')?.value

        if (!referralCode) {
            return NextResponse.json(
                { success: false, message: 'Sem código de indicação' },
                { status: 200 }
            )
        }

        // Registrar indicação
        const result = await registerReferral(referralCode, user.id)

        // Limpar cookie após registrar
        if (result.success) {
            cookieStore.delete('referral_code')
        }

        return NextResponse.json({
            success: result.success,
            message: result.success ? 'Indicação registrada!' : result.error
        })

    } catch (error) {
        console.error('[API] Erro ao registrar indicação:', error)
        return NextResponse.json(
            { error: 'Erro interno' },
            { status: 500 }
        )
    }
}
