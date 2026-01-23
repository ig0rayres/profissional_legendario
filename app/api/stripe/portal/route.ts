import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * API para criar link do Customer Portal do Stripe
 * 
 * POST /api/stripe/portal
 * 
 * Permite que o usuário gerencie sua assinatura:
 * - Trocar de plano
 * - Atualizar forma de pagamento
 * - Cancelar assinatura
 * - Ver histórico de faturas
 */
export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        // Buscar subscription do usuário
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (subError || !subscription?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'Nenhuma assinatura ativa encontrada' },
                { status: 404 }
            )
        }

        const stripe = getStripe()

        // URL base para redirecionamento
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        // Criar sessão do portal
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${baseUrl}/dashboard`,
        })

        console.log('[Stripe Portal] Session created for user:', user.id)

        return NextResponse.json({
            url: portalSession.url
        })

    } catch (error: any) {
        console.error('[Stripe Portal] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao criar sessão do portal' },
            { status: 500 }
        )
    }
}
