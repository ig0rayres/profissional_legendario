import Stripe from 'stripe'

// Cliente Stripe para uso server-side
export function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY não configurada')
    }

    return new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia' as any,
        typescript: true,
    })
}

// Função helper para formatar preço para Stripe (em centavos)
export function formatPriceForStripe(priceInReais: number): number {
    return Math.round(priceInReais * 100)
}

// Função helper para formatar preço do Stripe para exibição
export function formatPriceFromStripe(priceInCents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(priceInCents / 100)
}
