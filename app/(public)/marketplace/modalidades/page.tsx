import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { ShoppingBag, Star, Crown, Check, Zap, Image as ImageIcon, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface AdTier {
    id: string
    tier_level: 'basico' | 'elite' | 'lendario'
    name: string
    price: number
    duration_days: number
    max_photos: number
    position_boost: number
    highlight_color?: string | null
    highlight_badge?: string | null
    is_active: boolean
}

export default async function ModalidadesPage() {
    const supabase = await createClient()

    // Buscar modalidades ativas
    const { data: tiers } = await supabase
        .from('marketplace_ad_tiers')
        .select('*')
        .eq('is_active', true)
        .order('position_boost', { ascending: false })

    const basicoTier = tiers?.find(t => t.tier_level === 'basico')
    const eliteTier = tiers?.find(t => t.tier_level === 'elite')
    const lendarioTier = tiers?.find(t => t.tier_level === 'lendario')

    return (
        <div className="min-h-screen bg-adventure py-20">
            {/* Header */}
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-secondary text-white">
                        Marketplace
                    </Badge>
                    <h1 className="text-5xl font-bold text-impact text-primary mb-4">
                        Escolha a Modalidade Ideal
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Venda mais rápido com destaque e visibilidade. Escolha o plano que melhor se adequa ao seu anúncio.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

                    {/* Básico */}
                    {basicoTier && (
                        <div className="glass-strong rounded-2xl p-8 border-2 border-primary/30 hover:border-primary/50 transition-all hover:scale-105 duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShoppingBag className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-primary">Básico</h3>
                                    <p className="text-sm text-muted-foreground">Essencial</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-primary">
                                        R$ {basicoTier.price.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-muted-foreground">/anúncio</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Incluído nos planos Veterano, Elite e Lendário
                                </p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{basicoTier.duration_days} dias de duração</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>Até {basicoTier.max_photos} fotos</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>Listagem padrão</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>Aparece em pesquisas</span>
                                </div>
                            </div>

                            <Link href="/marketplace/novo">
                                <Button className="w-full" variant="outline">
                                    Escolher Básico
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Elite */}
                    {eliteTier && (
                        <div className="glass-strong rounded-2xl p-8 border-2 border-green-500/50 hover:border-green-500/70 transition-all hover:scale-110 duration-300 shadow-xl relative">
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white">
                                Popular
                            </Badge>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Star className="w-7 h-7 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-green-600">Elite</h3>
                                    <p className="text-sm text-muted-foreground">Destaque Verde</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-green-600">
                                        R$ {eliteTier.price.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-muted-foreground">/anúncio</span>
                                </div>
                                <p className="text-xs text-green-600 font-medium">
                                    ⚡ Venda até 3x mais rápido!
                                </p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                    <span>Tudo do plano Básico +</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{eliteTier.duration_days} dias de duração</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>Até {eliteTier.max_photos} fotos</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>🟢 Destaque verde nos resultados</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>📍 Posicionamento superior</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>⭐ Badge "Destaque"</span>
                                </div>
                            </div>

                            <Link href="/marketplace/novo?tier=elite">
                                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                                    Escolher Elite
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Lendário */}
                    {lendarioTier && (
                        <div className="glass-strong rounded-2xl p-8 border-2 border-amber-500/50 hover:border-amber-500/70 transition-all hover:scale-105 duration-300 glow-orange relative overflow-hidden">
                            {/* Efeito de brilho */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <Crown className="w-7 h-7 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-amber-600">Lendário</h3>
                                        <p className="text-sm text-muted-foreground">Máxima Visibilidade</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl font-bold text-amber-600">
                                            R$ {lendarioTier.price.toFixed(2).replace('.', ',')}
                                        </span>
                                        <span className="text-muted-foreground">/anúncio</span>
                                    </div>
                                    <p className="text-xs text-amber-600 font-medium">
                                        🚀 Máximo destaque garantido!
                                    </p>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                                        <Check className="w-4 h-4 flex-shrink-0" />
                                        <span>Tudo do plano Elite +</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span>{lendarioTier.duration_days} dias de duração</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span>Até {lendarioTier.max_photos} fotos</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span>👑 Badge "Lendário"</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span>🎯 Sempre no topo dos resultados</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span>🎨 Banner em carrossel destacado</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span>📧 Notificação para ELOS</span>
                                    </div>
                                </div>

                                <Link href="/marketplace/novo?tier=lendario">
                                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                                        Escolher Lendário
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Comparação Visual */}
                <div className="glass-strong rounded-2xl p-8 border border-primary/20 mb-12">
                    <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                        Comparativo de Funcionalidades
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-primary/20">
                                    <th className="text-left py-4 px-4 text-muted-foreground font-semibold">
                                        Recurso
                                    </th>
                                    <th className="text-center py-4 px-4">
                                        <ShoppingBag className="w-5 h-5 text-primary mx-auto mb-1" />
                                        <span className="text-sm font-semibold text-primary">Básico</span>
                                    </th>
                                    <th className="text-center py-4 px-4">
                                        <Star className="w-5 h-5 text-green-500 mx-auto mb-1" />
                                        <span className="text-sm font-semibold text-green-600">Elite</span>
                                    </th>
                                    <th className="text-center py-4 px-4">
                                        <Crown className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                        <span className="text-sm font-semibold text-amber-600">Lendário</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10">
                                <tr>
                                    <td className="py-3 px-4 text-sm">Duração</td>
                                    <td className="py-3 px-4 text-center text-sm">{basicoTier?.duration_days} dias</td>
                                    <td className="py-3 px-4 text-center text-sm font-semibold text-green-600">{eliteTier?.duration_days} dias</td>
                                    <td className="py-3 px-4 text-center text-sm font-semibold text-amber-600">{lendarioTier?.duration_days} dias</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-sm">Fotos</td>
                                    <td className="py-3 px-4 text-center text-sm">{basicoTier?.max_photos}</td>
                                    <td className="py-3 px-4 text-center text-sm font-semibold text-green-600">{eliteTier?.max_photos}</td>
                                    <td className="py-3 px-4 text-center text-sm font-semibold text-amber-600">{lendarioTier?.max_photos}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-sm">Destaque visual</td>
                                    <td className="py-3 px-4 text-center">-</td>
                                    <td className="py-3 px-4 text-center">
                                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Check className="w-4 h-4 text-amber-500 mx-auto" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-sm">Posição superior</td>
                                    <td className="py-3 px-4 text-center">-</td>
                                    <td className="py-3 px-4 text-center">
                                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Check className="w-4 h-4 text-amber-500 mx-auto" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-sm">Banner carrossel</td>
                                    <td className="py-3 px-4 text-center">-</td>
                                    <td className="py-3 px-4 text-center">-</td>
                                    <td className="py-3 px-4 text-center">
                                        <Check className="w-4 h-4 text-amber-500 mx-auto" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-sm">Notificações ELOS</td>
                                    <td className="py-3 px-4 text-center">
                                        <Check className="w-4 h-4 text-primary mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Check className="w-4 h-4 text-amber-500 mx-auto" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CTA Final */}
                <div className="text-center glass-strong rounded-2xl p-12 border border-primary/20">
                    <h2 className="text-3xl font-bold text-primary mb-4">
                        Pronto para vender?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Escolha a modalidade ideal e alcance milhares de profissionais da Rota Business Club.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/marketplace/novo">
                            <Button size="lg" variant="outline">
                                Criar Anúncio Grátis
                            </Button>
                        </Link>
                        <Link href="/marketplace">
                            <Button size="lg" className="glow-orange bg-secondary hover:bg-secondary/90">
                                Ver Marketplace
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
