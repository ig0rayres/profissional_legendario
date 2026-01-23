import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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
    return new Stripe(secretKey, { apiVersion: '2023-10-16' })
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
 * Checkout completado - Criar/atualizar assinatura
 */
async function handleCheckoutComplete(supabase: any, session: Stripe.Checkout.Session) {
    const userId = session.metadata?.supabase_user_id
    const planId = session.metadata?.plan_id

    if (!userId || !planId) {
        console.error('[Stripe Webhook] Missing metadata in checkout session')
        return
    }

    console.log('[Stripe Webhook] Checkout complete for user:', userId, 'plan:', planId)

    // Verificar se já tem subscription
    const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

    const now = new Date().toISOString()

    // Calcular período (30 dias)
    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + 30)

    if (existingSub) {
        // Atualizar existente
        await supabase
            .from('subscriptions')
            .update({
                plan_id: planId,
                status: 'active',
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                current_period_end: periodEnd.toISOString(),
                cancel_at_period_end: false,
                updated_at: now
            })
            .eq('id', existingSub.id)
    } else {
        // Criar nova
        await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                plan_id: planId,
                status: 'active',
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                current_period_end: periodEnd.toISOString(),
                cancel_at_period_end: false
            })
    }

    console.log('[Stripe Webhook] Subscription created/updated for user:', userId)
}

/**
 * Assinatura atualizada (upgrade/downgrade, renovação)
 */
async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.supabase_user_id

    if (!userId) {
        console.error('[Stripe Webhook] Missing user_id in subscription metadata')
        return
    }

    const status = subscription.status === 'active' ? 'active' :
        subscription.status === 'past_due' ? 'past_due' :
            subscription.status === 'canceled' ? 'canceled' : 'inactive'

    await supabase
        .from('subscriptions')
        .update({
            status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)

    console.log('[Stripe Webhook] Subscription updated:', subscription.id, 'status:', status)
}

/**
 * Assinatura cancelada
 */
async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
    // Buscar plano Recruta (grátis) para fazer downgrade
    const { data: recruitaPlan } = await supabase
        .from('plans')
        .select('id')
        .eq('tier', 'recruta')
        .single()

    await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            plan_id: recruitaPlan?.id || null, // Downgrade para Recruta
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
