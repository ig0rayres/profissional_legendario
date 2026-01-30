'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Loader2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import confetti from 'canvas-confetti'

export default function MarketplaceCheckoutSuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()
    const supabase = createClient()

    const sessionId = searchParams.get('session_id')
    const adId = searchParams.get('ad_id')

    const [loading, setLoading] = useState(true)
    const [ad, setAd] = useState<any>(null)

    useEffect(() => {
        // Confetti celebration!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })

        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            })
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            })
        }, 500)
    }, [])

    useEffect(() => {
        async function loadAd() {
            if (!user || !adId) {
                setLoading(false)
                return
            }

            const { data } = await supabase
                .from('marketplace_ads')
                .select('*, marketplace_ad_tiers(name, tier_level)')
                .eq('id', adId)
                .eq('user_id', user.id)
                .single()

            setAd(data)
            setLoading(false)
        }

        loadAd()
    }, [user, adId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-card/80 backdrop-blur-md border-primary/20">
                <CardContent className="p-8 text-center space-y-6">
                    {/* Ícone de sucesso animado */}
                    <div className="relative">
                        <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-12 h-12 text-primary" />
                        </div>
                        <div className="absolute inset-0 w-24 h-24 mx-auto bg-primary/10 rounded-full animate-ping" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-primary">
                            Pagamento Confirmado! 🎉
                        </h1>
                        <p className="text-muted-foreground">
                            Seu anúncio foi publicado com sucesso no Marketplace
                        </p>
                    </div>

                    {ad && (
                        <div className="bg-muted/50 rounded-lg p-4 text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                <span className="font-medium">{ad.title}</span>
                            </div>
                            {ad.marketplace_ad_tiers && (
                                <p className="text-sm text-muted-foreground">
                                    Modalidade: <span className="font-medium capitalize text-primary">
                                        {ad.marketplace_ad_tiers.name}
                                    </span>
                                </p>
                            )}
                            {ad.expires_at && (
                                <p className="text-sm text-muted-foreground">
                                    Expira em: {new Date(ad.expires_at).toLocaleDateString('pt-BR')}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <Link href="/dashboard/marketplace">
                            <Button className="w-full glow-orange">
                                Ver Meus Anúncios
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>

                        <Link href="/marketplace">
                            <Button variant="outline" className="w-full">
                                Ver no Marketplace
                            </Button>
                        </Link>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Você receberá um email de confirmação em breve
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
