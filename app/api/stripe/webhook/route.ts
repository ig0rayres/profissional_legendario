import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { registerCommission } from '@/lib/services/referral-service'

export const dynamic = 'force-dynamic'

// Usar service role para bypassar RLS
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

function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY não configurada')
    return new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as any })
}

/**
 * Webhook do Stripe
 * 
 * POST /api/stripe/webhook
 * 
 * Processa eventos:
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function POST(request: NextRequest) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
        console.error('[Stripe Webhook] Missing signature')
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
        console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured')
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
        const stripe = getStripe()
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    console.log('[Stripe Webhook] Event received:', event.type)

    const supabase = getSupabaseAdmin()

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                await handleCheckoutComplete(supabase, session)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionUpdate(supabase, subscription)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionDeleted(supabase, subscription)
                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice
                await handlePaymentSucceeded(supabase, invoice)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                await handlePaymentFailed(supabase, invoice)
                break
            }

            default:
                console.log('[Stripe Webhook] Unhandled event type:', event.type)
        }

        return NextResponse.json({ received: true })

    } catch (error: any) {
        console.error('[Stripe Webhook] Error processing event:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * Checkout completado - Criar/atualizar assinatura OU ativar anúncio
 */
async function handleCheckoutComplete(supabase: any, session: Stripe.Checkout.Session) {
    const metadata = session.metadata
    const type = metadata?.type || 'subscription'

    // === PAGAMENTO DE ANÚNCIO DO MARKETPLACE ===
    if (type === 'marketplace_ad') {
        await handleMarketplaceAdPayment(supabase, session)
        return
    }

    // === ASSINATURA DE PLANO ===
    const userId = metadata?.supabase_user_id
    const planTier = metadata?.plan_tier

    if (!userId) {
        console.error('[Stripe Webhook] Missing user_id in checkout session metadata')
        return
    }

    if (!planTier) {
        console.error('[Stripe Webhook] Missing plan_tier in checkout session metadata')
        return
    }

    console.log('[Stripe Webhook] Subscription checkout complete for user:', userId, 'tier:', planTier)

    // Verificar se já tem subscription
    const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

    const now = new Date().toISOString()

    // Calcular período usando a subscription do Stripe se disponível
    let periodEnd: string
    try {
        if (session.subscription) {
            const stripe = getStripe()
            const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
            if (stripeSubscription.current_period_end) {
                periodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString()
            } else {
                const endDate = new Date()
                endDate.setDate(endDate.getDate() + 30)
                periodEnd = endDate.toISOString()
            }
        } else {
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + 30)
            periodEnd = endDate.toISOString()
        }
    } catch (error) {
        console.error('[Stripe Webhook] Error getting period end, using fallback:', error)
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)
        periodEnd = endDate.toISOString()
    }

    console.log('[Stripe Webhook] Period end:', periodEnd)

    if (existingSub) {
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                plan_id: planTier,
                status: 'active',
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                current_period_end: periodEnd,
                cancel_at_period_end: false,
                updated_at: now
            })
            .eq('user_id', userId)

        if (updateError) {
            console.error('[Stripe Webhook] Error updating subscription:', updateError)
            throw updateError
        }
        console.log('[Stripe Webhook] Subscription UPDATED for user:', userId, 'to tier:', planTier)
    } else {
        const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                plan_id: planTier,
                status: 'active',
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                current_period_end: periodEnd,
                cancel_at_period_end: false
            })

        if (insertError) {
            console.error('[Stripe Webhook] Error inserting subscription:', insertError)
            throw insertError
        }
        console.log('[Stripe Webhook] Subscription CREATED for user:', userId, 'tier:', planTier)

        // Registrar comissão se for indicado (primeiro pagamento)
        if (session.amount_total && session.amount_total > 0) {
            const paymentAmount = session.amount_total / 100
            try {
                const result = await registerCommission(
                    userId,
                    paymentAmount,
                    session.payment_intent as string || undefined
                )

                if (result.success) {
                    console.log('[Stripe Webhook] First payment commission registered:', result.commissionAmount, 'for referrer of user:', userId)
                }
            } catch (error) {
                console.error('[Stripe Webhook] Error registering first commission:', error)
            }
        }
    }
}

/**
 * Pagamento de Anúncio do Marketplace
 */
async function handleMarketplaceAdPayment(supabase: any, session: Stripe.Checkout.Session) {
    const metadata = session.metadata
    const adId = metadata?.ad_id
    const tierId = metadata?.tier_id
    const userId = metadata?.supabase_user_id
    const durationDays = parseInt(metadata?.duration_days || '30')

    if (!adId || !tierId || !userId) {
        console.error('[Stripe Webhook] Missing marketplace ad metadata:', metadata)
        return
    }

    console.log('[Stripe Webhook] Marketplace ad payment received:', { adId, tierId, userId })

    // Calcular data de expiração
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)

    // Ativar anúncio
    const { error: updateError } = await supabase
        .from('marketplace_ads')
        .update({
            ad_tier_id: tierId,
            status: 'active',
            payment_status: 'paid',
            published_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
        })
        .eq('id', adId)
        .eq('user_id', userId)

    if (updateError) {
        console.error('[Stripe Webhook] Error activating marketplace ad:', updateError)
        throw updateError
    }

    console.log('[Stripe Webhook] Marketplace ad ACTIVATED:', adId, 'expires:', expiresAt.toISOString())
}

/**
 * Assinatura atualizada (upgrade/downgrade, renovação)
 */
async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.supabase_user_id
    const planTier = subscription.metadata?.plan_tier

    if (!userId) {
        console.error('[Stripe Webhook] Missing user_id in subscription metadata')
        return
    }

    console.log('[Stripe Webhook] Subscription update for user:', userId, 'tier:', planTier, 'status:', subscription.status)

    const status = subscription.status === 'active' ? 'active' :
        subscription.status === 'past_due' ? 'past_due' :
            subscription.status === 'canceled' ? 'canceled' : 'inactive'

    let periodEnd: string | null = null
    if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
        periodEnd = new Date(subscription.current_period_end * 1000).toISOString()
    }

    const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

    const now = new Date().toISOString()

    if (existingSub) {
        const updateData: any = {
            status,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            updated_at: now
        }

        if (periodEnd) updateData.current_period_end = periodEnd
        if (planTier) updateData.plan_id = planTier

        const { error: updateError } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('user_id', userId)

        if (updateError) {
            console.error('[Stripe Webhook] Error updating subscription:', updateError)
            throw updateError
        }

        console.log('[Stripe Webhook] Subscription updated for user:', userId, 'tier:', planTier, 'status:', status)
    } else {
        if (!planTier) {
            console.error('[Stripe Webhook] Cannot create subscription without plan_tier')
            return
        }

        const insertData: any = {
            user_id: userId,
            plan_id: planTier,
            status,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            cancel_at_period_end: subscription.cancel_at_period_end || false
        }

        if (periodEnd) insertData.current_period_end = periodEnd

        const { error: insertError } = await supabase
            .from('subscriptions')
            .insert(insertData)

        if (insertError) {
            console.error('[Stripe Webhook] Error inserting subscription:', insertError)
            throw insertError
        }

        console.log('[Stripe Webhook] Subscription CREATED for user:', userId, 'tier:', planTier, 'status:', status)
    }
}

/**
 * Assinatura cancelada
 */
async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
    // plan_id já é o tier (recruta, veterano, lendario)
    await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            plan_id: 'recruta', // Voltar para plano recruta
            cancel_at_period_end: false,
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)

    console.log('[Stripe Webhook] Subscription canceled:', subscription.id)
}

/**
 * Pagamento bem-sucedido (renovação)
 */
async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', invoice.subscription as string)
        .single()

    if (subscription?.user_id) {
        const paymentAmount = (invoice.amount_paid || 0) / 100

        if (paymentAmount > 0) {
            try {
                const result = await registerCommission(
                    subscription.user_id,
                    paymentAmount,
                    invoice.payment_intent as string || undefined,
                    invoice.id
                )

                if (result.success) {
                    console.log('[Stripe Webhook] Commission registered:', result.commissionAmount, 'for user:', subscription.user_id)
                }

                // Atualizar data do último pagamento no perfil
                await supabase
                    .from('profiles')
                    .update({ last_payment_at: new Date().toISOString() })
                    .eq('id', subscription.user_id)

                console.log('[Stripe Webhook] Updated last_payment_at for user:', subscription.user_id)

            } catch (error) {
                console.error('[Stripe Webhook] Error registering commission:', error)
            }
        }
    }

    await supabase
        .from('subscriptions')
        .update({
            status: 'active',
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription as string)

    console.log('[Stripe Webhook] Payment succeeded for subscription:', invoice.subscription)
}

/**
 * Pagamento falhou
 */
async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    await supabase
        .from('subscriptions')
        .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription as string)

    console.log('[Stripe Webhook] Payment failed for subscription:', invoice.subscription)
}
