import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY não configurada')
    return new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as any })
}

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
 * Verifica uma sessão de checkout e ativa a subscription
 * Esta é uma alternativa ao webhook para ambientes de desenvolvimento
 * 
 * POST /api/stripe/verify-session
 * Body: { sessionId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { sessionId } = await request.json()

        if (!sessionId) {
            return NextResponse.json(
                { error: 'sessionId é obrigatório' },
                { status: 400 }
            )
        }

        const stripe = getStripe()
        const supabase = getSupabaseAdmin()

        // Buscar sessão do Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription']
        })

        console.log('[Verify Session] Session retrieved:', session.id, 'status:', session.payment_status)

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Pagamento não confirmado' },
                { status: 400 }
            )
        }

        // Extrair dados da sessão
        const userId = session.metadata?.supabase_user_id
        const planTier = session.metadata?.plan_tier

        if (!userId || !planTier) {
            console.error('[Verify Session] Missing metadata:', session.metadata)
            return NextResponse.json(
                { error: 'Dados da sessão incompletos' },
                { status: 400 }
            )
        }

        // Calcular período usando a subscription do Stripe
        let periodEnd: string
        const stripeSubscription = session.subscription as Stripe.Subscription | null

        if (stripeSubscription?.current_period_end) {
            periodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString()
        } else {
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + 30)
            periodEnd = endDate.toISOString()
        }

        // Verificar se já tem subscription
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .eq('user_id', userId)
            .maybeSingle()

        const now = new Date().toISOString()

        if (existingSub) {
            // Atualizar subscription existente
            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    plan_id: planTier,
                    status: 'active',
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: stripeSubscription?.id || null,
                    current_period_end: periodEnd,
                    cancel_at_period_end: false,
                    updated_at: now
                })
                .eq('user_id', userId)

            if (updateError) {
                console.error('[Verify Session] Error updating subscription:', updateError)
                throw updateError
            }

            console.log('[Verify Session] Subscription UPDATED for user:', userId, 'to tier:', planTier)
        } else {
            // Criar nova subscription
            const { error: insertError } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    plan_id: planTier,
                    status: 'active',
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: stripeSubscription?.id || null,
                    current_period_end: periodEnd,
                    cancel_at_period_end: false
                })

            if (insertError) {
                console.error('[Verify Session] Error inserting subscription:', insertError)
                throw insertError
            }

            console.log('[Verify Session] Subscription CREATED for user:', userId, 'tier:', planTier)
        }

        return NextResponse.json({
            success: true,
            userId,
            planTier,
            periodEnd
        })

    } catch (error: any) {
        console.error('[Verify Session] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao verificar sessão' },
            { status: 500 }
        )
    }
}
