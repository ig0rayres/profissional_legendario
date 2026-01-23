'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Crown, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import confetti from 'canvas-confetti'
import Link from 'next/link'

function CheckoutSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        // Disparar confetti ao carregar
        const duration = 3 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        const interval: NodeJS.Timeout = setInterval(function () {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                clearInterval(interval)
                return
            }

            const particleCount = 50 * (timeLeft / duration)

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#166534', '#22c55e', '#f97316', '#fbbf24']
            })
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#166534', '#22c55e', '#f97316', '#fbbf24']
            })
        }, 250)

        // Simular carregamento
        setTimeout(() => setLoading(false), 1500)

        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Processando seu pagamento...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-lg"
            >
                <Card className="border-primary/30 bg-card/80 backdrop-blur-lg overflow-hidden">
                    {/* Header com gradiente */}
                    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-orange-500/20 p-8 text-center relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4"
                        >
                            <Check className="w-10 h-10 text-primary" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-bold text-primary mb-2"
                        >
                            Pagamento Confirmado!
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-muted-foreground"
                        >
                            Bem-vindo ao time de elite!
                        </motion.p>

                        {/* Sparkles decorativos */}
                        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-orange-400/60" />
                        <Crown className="absolute bottom-4 left-4 w-6 h-6 text-primary/60" />
                    </div>

                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4 text-center">
                            <h2 className="text-xl font-semibold">
                                Sua assinatura está ativa! 🎉
                            </h2>

                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    <Check className="w-4 h-4 inline mr-2 text-primary" />
                                    Acesso a todos os benefícios do plano
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <Check className="w-4 h-4 inline mr-2 text-primary" />
                                    Multiplicador de XP ativado
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <Check className="w-4 h-4 inline mr-2 text-primary" />
                                    Limites expandidos para elos e confrarias
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href="/dashboard" className="w-full">
                                <Button className="w-full" size="lg">
                                    Ir para o Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>

                            <Link href="/elo-da-rota" className="w-full">
                                <Button variant="outline" className="w-full" size="lg">
                                    Explorar Elo da Rota
                                </Button>
                            </Link>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                            Um email de confirmação foi enviado para você.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    )
}
