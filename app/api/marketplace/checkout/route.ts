import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * API para criar uma sessão de checkout do Stripe para o Marketplace
 * 
 * POST /api/marketplace/checkout
 * Body: { adId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { adId } = await request.json()

        if (!adId) {
            return NextResponse.json(
                { error: 'adId é obrigatório' },
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

        // Buscar anúncio e seu tier
        const { data: ad, error: adError } = await supabase
            .from('marketplace_ads')
            .select(`
                *,
                ad_tier:marketplace_ad_tiers(*)
            `)
            .eq('id', adId)
            .single()

        if (adError || !ad) {
            console.error('[Marketplace Stripe] Anúncio não encontrado:', adId)
            return NextResponse.json(
                { error: 'Anúncio não encontrado' },
                { status: 404 }
            )
        }

        // Verificar se é o dono do anúncio
        if (ad.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Sem permissão para pagar este anúncio' },
                { status: 403 }
            )
        }

        // Verificar se já está pago ou ativo
        if (ad.payment_status === 'paid' || ad.status === 'active') {
            return NextResponse.json(
                { error: 'Este anúncio já está pago ou ativo' },
                { status: 400 }
            )
        }

        const tier = ad.ad_tier
        if (!tier || tier.price <= 0) {
            return NextResponse.json(
                { error: 'Este anúncio não requer pagamento' },
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

        // Verificar se usuário já é customer no Stripe (opcional, mas ajuda)
        let stripeCustomerId = undefined
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (subscription?.stripe_customer_id) {
            stripeCustomerId = subscription.stripe_customer_id
        }

        // URL base para redirecionamento
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            customer_email: stripeCustomerId ? undefined : user.email,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: tier.stripe_price_id ? undefined : {
                        currency: 'brl',
                        product_data: {
                            name: `Anúncio Marketplace: ${ad.title}`,
                            description: `Plano ${tier.name} - ${tier.duration_days} dias`,
                        },
                        unit_amount: Math.round(tier.price * 100),
                    },
                    price: tier.stripe_price_id || undefined,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/marketplace?success=true&ad_id=${ad.id}`,
            cancel_url: `${baseUrl}/marketplace?cancel=true`,
            metadata: {
                type: 'marketplace_ad',
                ad_id: ad.id,
                tier_id: tier.id,
                user_id: user.id
            },
            payment_intent_data: {
                metadata: {
                    type: 'marketplace_ad',
                    ad_id: ad.id,
                    tier_id: tier.id,
                    user_id: user.id
                }
            },
            locale: 'pt-BR',
        })

        return NextResponse.json({
            url: session.url
        })

    } catch (error: any) {
        console.error('[Marketplace Stripe] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Erro ao criar sessão de checkout' },
            { status: 500 }
        )
    }
}
