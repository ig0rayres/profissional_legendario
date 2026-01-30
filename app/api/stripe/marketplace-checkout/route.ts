import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * API para criar uma sessão de checkout do Stripe para anúncios do Marketplace
 * 
 * POST /api/stripe/marketplace-checkout
 * Body: { adId: string, tierId: string }
 */
export async function POST(request: NextRequest) {
    console.log('[Stripe Marketplace] Starting checkout process...')

    try {
        const body = await request.json()
        console.log('[Stripe Marketplace] Request body:', body)

        const { adId, tierId } = body

        if (!adId || !tierId) {
            console.error('[Stripe Marketplace] Missing adId or tierId')
            return NextResponse.json(
                { error: 'adId e tierId são obrigatórios' },
                { status: 400 }
            )
        }

        // Verificar autenticação
        console.log('[Stripe Marketplace] Checking auth...')
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('[Stripe Marketplace] Auth error:', authError)
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }
        console.log('[Stripe Marketplace] User authenticated:', user.id)

        // Buscar anúncio
        console.log('[Stripe Marketplace] Fetching ad:', adId)
        const { data: ad, error: adError } = await supabase
            .from('marketplace_ads')
            .select('id, title, user_id, status')
            .eq('id', adId)
            .eq('user_id', user.id)
            .single()

        if (adError || !ad) {
            console.error('[Stripe Marketplace] Anúncio não encontrado:', adId, adError)
            return NextResponse.json(
                { error: 'Anúncio não encontrado' },
                { status: 404 }
            )
        }
        console.log('[Stripe Marketplace] Ad found:', ad.title)

        // Buscar tier
        console.log('[Stripe Marketplace] Fetching tier:', tierId)
        const { data: tier, error: tierError } = await supabase
            .from('marketplace_ad_tiers')
            .select('*')
            .eq('id', tierId)
            .single()

        if (tierError || !tier) {
            console.error('[Stripe Marketplace] Tier não encontrado:', tierId, tierError)
            return NextResponse.json(
                { error: 'Modalidade não encontrada' },
                { status: 404 }
            )
        }
        console.log('[Stripe Marketplace] Tier found:', tier.name, 'price:', tier.price)

        // Se tier é grátis, não precisa de pagamento
        if (tier.price === 0) {
            return NextResponse.json(
                { error: 'Essa modalidade é gratuita' },
                { status: 400 }
            )
        }

        // Buscar perfil do usuário
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single()

        console.log('[Stripe Marketplace] Getting Stripe instance...')
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
            console.log('[Stripe Marketplace] Creating Stripe customer...')
            const customer = await stripe.customers.create({
                email: user.email,
                name: profile?.full_name || user.email,
                metadata: {
                    supabase_user_id: user.id
                }
            })
            customerId = customer.id
            console.log('[Stripe Marketplace] Customer created:', customerId)
        }

        // URL base para redirecionamento
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        console.log('[Stripe Marketplace] Creating checkout session with baseUrl:', baseUrl)

        // Criar sessão de checkout para pagamento único
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment', // Pagamento único, não assinatura
            payment_method_types: ['card'], // Apenas cartão por enquanto (PIX/boleto precisam ser ativados no Stripe)
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: `Anúncio ${tier.name}`,
                            description: `${tier.duration_days} dias online • Até ${tier.max_photos} fotos • ${ad.title}`,
                        },
                        unit_amount: Math.round(tier.price * 100), // Preço em centavos
                    },
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/marketplace/checkout/success?session_id={CHECKOUT_SESSION_ID}&ad_id=${adId}`,
            cancel_url: `${baseUrl}/marketplace/${adId}/choose-tier`,
            metadata: {
                type: 'marketplace_ad',
                supabase_user_id: user.id,
                ad_id: adId,
                tier_id: tierId,
                tier_level: tier.tier_level,
                duration_days: tier.duration_days.toString(),
            },
            payment_intent_data: {
                metadata: {
                    type: 'marketplace_ad',
                    supabase_user_id: user.id,
                    ad_id: adId,
                    tier_id: tierId,
                }
            },
            locale: 'pt-BR',
        })

        console.log('[Stripe Marketplace] Checkout session created:', session.id, 'for ad:', adId, 'tier:', tier.name)

        // Atualizar anúncio com tier selecionado
        await supabase
            .from('marketplace_ads')
            .update({
                tier_id: tierId,
                payment_status: 'pending',
            })
            .eq('id', adId)

        return NextResponse.json({
            sessionId: session.id,
            url: session.url
        })

    } catch (error: any) {
        console.error('[Stripe Marketplace] FULL ERROR:', error)
        console.error('[Stripe Marketplace] Error name:', error?.name)
        console.error('[Stripe Marketplace] Error message:', error?.message)
        console.error('[Stripe Marketplace] Error stack:', error?.stack)
        return NextResponse.json(
            { error: error.message || 'Erro ao criar sessão de checkout' },
            { status: 500 }
        )
    }
}
