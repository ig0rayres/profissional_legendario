'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, CreditCard, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CheckoutPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const planId = searchParams.get('plan')
    const userId = searchParams.get('uid')
    const email = searchParams.get('email')

    useEffect(() => {
        if (!planId) {
            setError('Plano não especificado')
            setLoading(false)
            return
        }

        // Iniciar checkout automaticamente
        initiateCheckout()
    }, [planId])

    const initiateCheckout = async () => {
        try {
            setLoading(true)
            setError(null)

            console.log('[Checkout] Iniciando checkout para plano:', planId, 'userId:', userId)

            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    userId,  // Passar userId se disponível
                    email    // Passar email se disponível
                })
            })

            const data = await response.json()
            console.log('[Checkout] Resposta da API:', data)

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar sessão de checkout')
            }

            if (data.url) {
                // Redirecionar para o Stripe Checkout
                window.location.href = data.url
            } else {
                throw new Error('URL de checkout não retornada')
            }

        } catch (err: any) {
            console.error('[Checkout] Erro:', err)
            setError(err.message || 'Erro ao processar checkout')
            setLoading(false)
        }
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                        <CardTitle className="text-destructive">Erro no Checkout</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={initiateCheckout}
                            className="w-full"
                            disabled={!planId}
                        >
                            Tentar Novamente
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/auth/register')}
                            className="w-full"
                        >
                            Voltar ao Registro
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>Preparando Checkout</CardTitle>
                    <CardDescription>
                        Aguarde, você será redirecionado para o pagamento seguro...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    )
}
