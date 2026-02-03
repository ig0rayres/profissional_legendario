import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { registerReferral } from '@/lib/services/referral-service'

/**
 * POST /api/referral/register
 * 
 * Registra a indicação após o usuário se cadastrar.
 * MÚLTIPLAS FONTES (por ordem de prioridade):
 * 1. Body da requisição (localStorage do frontend)
 * 2. Cookie 'referral_code' (setado pela rota /r/{slug})
 * 
 * A função registerReferral já verifica duplicidade (unique constraint).
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

        // 1. Tentar ler código do body (localStorage)
        let referralCode: string | null = null
        try {
            const body = await request.json()
            referralCode = body?.referralCode || null
            console.log('[API referral/register] Código via body:', referralCode || 'NÃO ENVIADO')
        } catch {
            // Body vazio ou inválido
        }

        // 2. Fallback: ler do cookie
        if (!referralCode) {
            const cookieStore = await cookies()
            referralCode = cookieStore.get('referral_code')?.value || null
            console.log('[API referral/register] Código via cookie:', referralCode || 'NÃO ENCONTRADO')
        }

        if (!referralCode) {
            return NextResponse.json(
                { success: false, message: 'Sem código de indicação' },
                { status: 200 }
            )
        }

        // Registrar indicação (registerReferral já verifica duplicidade)
        const result = await registerReferral(referralCode, user.id)

        // Limpar cookie após registrar (se existir)
        if (result.success) {
            const cookieStore = await cookies()
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
