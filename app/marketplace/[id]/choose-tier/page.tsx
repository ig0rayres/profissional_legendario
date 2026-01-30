'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Crown, Star, ShoppingBag, Loader2, AlertCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AdTier {
    id: string
    name: string
    tier_level: 'basico' | 'elite' | 'lendario'
    price: number
    duration_days: number
    max_photos: number
    position_boost: number
    highlight_color: string | null
    highlight_badge: string | null
}

interface UserPlan {
    tier: 'recruta' | 'veterano' | 'elite' | 'lendario'
    basic_ads_limit: number | null
}

export default function ChooseTierPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const supabase = createClient()

    const adId = params.id as string

    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [tiers, setTiers] = useState<AdTier[]>([])
    const [userPlan, setUserPlan] = useState<UserPlan>({ tier: 'recruta', basic_ads_limit: 0 })
    const [currentBasicAds, setCurrentBasicAds] = useState(0)
    const [ad, setAd] = useState<any>(null)

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
            return
        }
        loadData()
    }, [user])

    async function loadData() {
        if (!user) return
        setLoading(true)

        try {
            // Carregar anúncio
            const { data: adData } = await supabase
                .from('marketplace_ads')
                .select('*')
                .eq('id', adId)
                .eq('user_id', user.id)
                .single()

            if (!adData) {
                toast.error('Anúncio não encontrado')
                router.push('/marketplace')
                return
            }

            setAd(adData)

            // Verificar se categoria requer tier
            const { data: categoryData } = await supabase
                .from('marketplace_categories')
                .select('requires_tier')
                .eq('id', adData.category_id)
                .single()

            // Se categoria NÃO requer tier, publicar direto e redirecionar
            if (categoryData && !categoryData.requires_tier) {
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + 30)

                await supabase
                    .from('marketplace_ads')
                    .update({
                        status: 'active',
                        payment_status: 'free',
                        expires_at: expiresAt.toISOString(),
                        published_at: new Date().toISOString()
                    })
                    .eq('id', adId)

                toast.success('Anúncio publicado! Categoria gratuita.')
                router.push('/dashboard/marketplace')
                return
            }


            // Carregar tiers globais
            const { data: tiersData, error: tiersError } = await supabase
                .from('marketplace_ad_tiers')
                .select('*')
                .eq('is_active', true)
                .order('price')

            console.log('[loadData] Tiers loaded:', tiersData, 'Error:', tiersError)

            if (tiersData) setTiers(tiersData)

            // Carregar plano do usuário
            const { data: profileData } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single()

            const tier = profileData?.subscription_tier || 'recruta'
            const limits: Record<string, number | null> = {
                recruta: 0,
                veterano: 2,
                elite: 10,
                lendario: null // ilimitado
            }

            setUserPlan({
                tier,
                basic_ads_limit: limits[tier]
            })

            // Contar anúncios básicos ativos
            const { count } = await supabase
                .from('marketplace_ads')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'active')
                .is('ad_tier_id', null)

            setCurrentBasicAds(count || 0)

        } catch (error: any) {
            toast.error('Erro ao carregar dados')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function selectTier(tier: AdTier | null) {
        console.log('[selectTier] Called with tier:', tier)
        console.log('[selectTier] user:', user?.id, 'ad:', ad?.id)

        if (!user || !ad) {
            console.error('[selectTier] Missing user or ad')
            return
        }
        setProcessing(true)

        try {
            const isBasic = !tier || tier.tier_level === 'basico'

            // Verificar se tem slots grátis disponíveis para básico
            const hasFreeSlotsAvailable = userPlan.tier !== 'recruta' &&
                (userPlan.basic_ads_limit === null || currentBasicAds < userPlan.basic_ads_limit)

            // Básico é grátis SOMENTE se tem slots disponíveis
            const isFree = isBasic && hasFreeSlotsAvailable && (!tier || tier.price === 0)

            // Atualizar anúncio
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + (tier?.duration_days || 30))

            const updateData: any = {
                ad_tier_id: tier?.id || null,
                expires_at: expiresAt.toISOString(),
                updated_at: new Date().toISOString()
            }

            if (isFree) {
                updateData.status = 'active'
                updateData.payment_status = 'free'
                updateData.published_at = new Date().toISOString()
            } else {
                updateData.status = 'pending_payment'
                updateData.payment_status = 'pending'
            }

            const { error: updateError } = await supabase
                .from('marketplace_ads')
                .update(updateData)
                .eq('id', adId)

            if (updateError) throw updateError

            // Se for pago (qualquer tier, incluindo Básico sem slots), redirecionar para Stripe
            if (!isFree && tier) {
                toast.info('Redirecionando para pagamento...')
                const response = await fetch('/api/stripe/marketplace-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        adId,
                        tierId: tier.id
                    })
                })

                const result = await response.json()

                if (result.error) {
                    toast.error(result.error)
                    setProcessing(false)
                    return
                }

                if (result.url) {
                    window.location.href = result.url
                    return
                }
            }

            toast.success('Anúncio publicado com sucesso!')
            router.push('/dashboard/marketplace')

        } catch (error: any) {
            toast.error('Erro ao processar: ' + error.message)
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const basicTier = tiers.find(t => t.tier_level === 'basico')
    const eliteTier = tiers.find(t => t.tier_level === 'elite')
    const lendarioTier = tiers.find(t => t.tier_level === 'lendario')

    // Quantidade de fotos do anúncio
    const adPhotosCount = ad?.images?.length || 0

    // Verificar se pode usar básico GRÁTIS (tem slots no plano)
    const hasFreeSlotsAvailable = userPlan.tier !== 'recruta' &&
        (userPlan.basic_ads_limit === null || currentBasicAds < userPlan.basic_ads_limit)

    // Verificar se cada tier suporta a quantidade de fotos
    const basicSupportsPhotos = (basicTier?.max_photos || 5) >= adPhotosCount
    const eliteSupportsPhotos = (eliteTier?.max_photos || 10) >= adPhotosCount
    const lendarioSupportsPhotos = (lendarioTier?.max_photos || 25) >= adPhotosCount

    // Básico pode ser usado se: suporta fotos E (tem slot grátis OU vai pagar)
    const canUseBasic = basicSupportsPhotos

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="container max-w-7xl mx-auto px-4 py-12">
                {/* Header com Breadcrumb */}
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Link href="/dashboard/marketplace">
                        <Button variant="ghost" size="sm" className="mb-6 hover:bg-primary/10 transition-all">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para Meus Anúncios
                        </Button>
                    </Link>

                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                            Escolha a Modalidade
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Selecione como você quer que seu anúncio seja exibido e maximize suas chances de venda
                        </p>
                    </div>
                </div>

                {/* User Plan Card - Glassmorphism */}
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="glass-strong p-6 rounded-2xl border border-primary/20 backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <Crown className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Seu plano atual</p>
                                    <p className="text-2xl font-bold text-primary capitalize">{userPlan.tier}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Anúncios básicos</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-primary">{currentBasicAds}</span>
                                        <span className="text-xl text-muted-foreground">/ {userPlan.basic_ads_limit === null ? '∞' : userPlan.basic_ads_limit}</span>
                                    </div>
                                </div>
                                {userPlan.basic_ads_limit !== null && (
                                    <div className="w-32">
                                        <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                                style={{ width: `${(currentBasicAds / userPlan.basic_ads_limit) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tiers Grid - Stagger Animation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Básico */}
                    <div className={`group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 ${!canUseBasic ? 'opacity-60' : ''}`}>
                        <div className={`relative h-full glass p-8 rounded-2xl border-2 transition-all duration-300 ${canUseBasic
                            ? 'border-primary/30 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2'
                            : 'border-muted/30'
                            }`}>
                            {/* Icon Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <ShoppingBag className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary">Básico</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {hasFreeSlotsAvailable ? 'Incluído no plano' : 'Pagamento único'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-500" />
                                    </div>
                                    <span className="text-base">{basicTier?.max_photos || 5} fotos</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-500" />
                                    </div>
                                    <span className="text-base">{basicTier?.duration_days || 30} dias online</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-500" />
                                    </div>
                                    <span className="text-base">Listagem padrão</span>
                                </div>
                            </div>

                            {/* Price - Dinâmico baseado em slots disponíveis */}
                            <div className="mb-6">
                                {hasFreeSlotsAvailable ? (
                                    <>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-green-600">GRÁTIS</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">Incluído no seu plano</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-primary">R$ {basicTier?.price?.toFixed(2) || '29,90'}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">Pagamento único</p>
                                    </>
                                )}
                            </div>

                            {/* Warning if can't use due to photos */}
                            {!basicSupportsPhotos && (
                                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                    <p className="text-sm text-amber-600 font-medium">
                                        ⚠️ O plano Básico permite apenas <strong>{basicTier?.max_photos || 5} fotos</strong>.
                                        Para utilizar este plano, volte à tela anterior e remova algumas fotos.
                                    </p>
                                    <p className="text-xs text-amber-500 mt-1">
                                        Seu anúncio tem {adPhotosCount} fotos
                                    </p>
                                </div>
                            )}

                            {/* CTA Button */}
                            <Button
                                className="w-full h-12 text-base font-semibold transition-all duration-300"
                                onClick={() => selectTier(basicTier || null)}
                                disabled={!canUseBasic || processing}
                            >
                                {processing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : hasFreeSlotsAvailable ? (
                                    <>Publicar Grátis</>
                                ) : (
                                    <>Escolher Básico</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Elite */}
                    <div className={`group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ${!eliteSupportsPhotos ? 'opacity-60' : ''}`}>
                        <div className={`relative h-full glass p-8 rounded-2xl border-2 transition-all duration-300 ${eliteSupportsPhotos
                            ? 'border-green-500/50 hover:border-green-500/80 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-2'
                            : 'border-muted/30'
                            }`}>
                            {/* Popular Badge */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-1 text-sm font-semibold shadow-lg">
                                    ⭐ Popular
                                </Badge>
                            </div>

                            {/* Icon Header */}
                            <div className="flex items-start justify-between mb-6 mt-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Star className="w-7 h-7 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-green-600">Elite</h3>
                                        <p className="text-sm text-muted-foreground">Destaque verde</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-500" />
                                    </div>
                                    <span className="text-base font-semibold">{eliteTier?.max_photos || 10} fotos</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-500" />
                                    </div>
                                    <span className="text-base font-semibold">{eliteTier?.duration_days || 45} dias online</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-3 h-3 text-green-500" />
                                    </div>
                                    <span className="text-base font-semibold">Destaque na home</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-3 h-3 text-green-500" />
                                    </div>
                                    <span className="text-base font-semibold">Borda verde premium</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-green-600">R$ {eliteTier?.price?.toFixed(2) || '49,90'}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Pagamento único</p>
                            </div>

                            {/* Warning if can't use due to photos */}
                            {!eliteSupportsPhotos && (
                                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                    <p className="text-sm text-amber-600 font-medium">
                                        ⚠️ O plano Elite permite apenas <strong>{eliteTier?.max_photos || 10} fotos</strong>.
                                        Para utilizar este plano, volte à tela anterior e remova algumas fotos.
                                    </p>
                                    <p className="text-xs text-amber-500 mt-1">
                                        Seu anúncio tem {adPhotosCount} fotos
                                    </p>
                                </div>
                            )}

                            {/* CTA Button */}
                            <Button
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                onClick={() => selectTier(eliteTier || null)}
                                disabled={!eliteSupportsPhotos || processing}
                            >
                                {processing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Escolher Elite</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Lendário */}
                    <div className={`group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 ${!lendarioSupportsPhotos ? 'opacity-60' : ''}`}>
                        <div className={`relative h-full glass p-8 rounded-2xl border-2 transition-all duration-300 ${lendarioSupportsPhotos
                            ? 'border-amber-500/50 hover:border-amber-500/80 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-2 glow-orange'
                            : 'border-muted/30'
                            }`}>
                            {/* Premium Badge */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-1 text-sm font-semibold shadow-lg">
                                    👑 Premium
                                </Badge>
                            </div>

                            {/* Icon Header */}
                            <div className="flex items-start justify-between mb-6 mt-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Crown className="w-7 h-7 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-amber-600">Lendário</h3>
                                        <p className="text-sm text-muted-foreground">Máxima visibilidade</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-amber-500" />
                                    </div>
                                    <span className="text-base font-semibold">{lendarioTier?.max_photos || 25} fotos</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-amber-500" />
                                    </div>
                                    <span className="text-base font-semibold">{lendarioTier?.duration_days || 60} dias online</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <Crown className="w-3 h-3 text-amber-500" />
                                    </div>
                                    <span className="text-base font-semibold">Banner carrossel</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <Crown className="w-3 h-3 text-amber-500" />
                                    </div>
                                    <span className="text-base font-semibold">Topo da listagem</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-amber-600">R$ {lendarioTier?.price?.toFixed(2) || '79,90'}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Pagamento único</p>
                            </div>

                            {/* Warning if can't use due to photos (raro, mas possível se aumentar limite) */}
                            {!lendarioSupportsPhotos && (
                                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                    <p className="text-sm text-amber-600 font-medium">
                                        ⚠️ O plano Lendário permite apenas <strong>{lendarioTier?.max_photos || 25} fotos</strong>.
                                        Seu anúncio tem {adPhotosCount} fotos.
                                    </p>
                                </div>
                            )}

                            {/* CTA Button */}
                            <Button
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                                onClick={() => selectTier(lendarioTier || null)}
                                disabled={!lendarioSupportsPhotos || processing}
                            >
                                {processing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Escolher Lendário</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info Box - Glassmorphism */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <div className="glass-strong p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-blue-600 mb-2">💡 Dica de Especialista</h4>
                                <p className="text-base text-blue-600/90">
                                    Anúncios <strong>Elite</strong> e <strong>Lendário</strong> recebem até <strong>5x mais visualizações</strong> e vendem muito mais rápido!
                                    Invista na visibilidade do seu produto.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
