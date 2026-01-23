import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * API para criar uma sessão de checkout do Stripe
 * 
 * POST /api/stripe/create-checkout
 * Body: { planId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { planId } = await request.json()

        if (!planId) {
            return NextResponse.json(
                { error: 'planId é obrigatório' },
                { status: 400 }
            )
        }

        // Verificar autenticação
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        // Buscar plano no banco - tentar por ID primeiro, depois por tier
        let plan = null
        let planError = null

        // Tentar buscar por ID (UUID)
        const { data: planById, error: errorById } = await supabase
            .from('plan_config')
            .select('*')
            .eq('id', planId)
            .maybeSingle()

        if (planById) {
            plan = planById
        } else {
            // Tentar buscar por tier (string: recruta, veterano, elite)
            const { data: planByTier, error: errorByTier } = await supabase
                .from('plan_config')
                .select('*')
                .eq('tier', planId)
                .maybeSingle()

            plan = planByTier
            planError = errorByTier
        }

        if (!plan) {
            console.error('[Stripe] Plano não encontrado. planId:', planId)
            return NextResponse.json(
                { error: 'Plano não encontrado' },
                { status: 404 }
            )
        }

        // Verificar se plano tem stripe_price_id
        if (!plan.stripe_price_id) {
            return NextResponse.json(
                { error: 'Plano não configurado para pagamento. Configure o stripe_price_id.' },
                { status: 400 }
            )
        }

        // Buscar perfil do usuário
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single()

        const stripe = getStripe()

        // Verificar se usuário já é customer no Stripe
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle()

        let customerId = subscription?.stripe_customer_id

        // Se não tem customer, criar um
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: profile?.full_name || user.email,
                metadata: {
                    supabase_user_id: user.id
                }
            })
            customerId = customer.id
        }

        // URL base para redirecionamento - priorizar domínio de produção
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        console.log('[Stripe] Using baseUrl:', baseUrl)

        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: plan.stripe_price_id,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/checkout/cancel`,
            subscription_data: {
                metadata: {
                    supabase_user_id: user.id,
                    plan_id: plan.id,  // Usar o UUID do plano, não o planId que pode ser tier
                    plan_tier: plan.tier
                }
            },
            metadata: {
                supabase_user_id: user.id,
                plan_id: plan.id  // Usar o UUID do plano
            },
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
            locale: 'pt-BR',
        })

        console.log('[Stripe] Checkout session created:', session.id, 'for user:', user.id, 'plan:', plan.id, 'tier:', plan.tier)

        return NextResponse.json({
            sessionId: session.id,
            url: session.url
        })


    } catch (error: any) {
        console.error('[Stripe] Error creating checkout:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao criar sessão de checkout' },
            { status: 500 }
        )
    }
}
