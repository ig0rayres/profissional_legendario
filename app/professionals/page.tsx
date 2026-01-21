'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Star, MapPin, Search, Flame, ArrowLeft, Shield, TrendingUp, Activity, CheckCircle2, Zap, Trophy, Award, Globe, Medal as MedalIcon, Briefcase, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { RotabusinessLogo, RotabusinessIcon } from '@/components/branding/logo'
import { cn } from '@/lib/utils'
import { RankingsBoard } from '@/components/gamification/rankings-board'
import { RatingDialog } from '@/components/ratings/rating-dialog'
import { getProfileUrl } from '@/lib/profile/utils'

interface Professional {
    id: string
    full_name: string
    slug: string | null
    rota_number: string | null
    avatar_url: string | null
    bio: string | null
    pista: string | null
    vigor: number
    rank_name: string | null
}

export default function ProfessionalsPage() {
    const searchParams = useSearchParams()
    const categoryParam = searchParams.get('category')
    const supabase = createClient()

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPista, setSelectedPista] = useState<string | null>(null)
    const [professionals, setProfessionals] = useState<Professional[]>([])
    const [pistas, setPistas] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    // Carregar profissionais reais
    useEffect(() => {
        async function loadData() {
            setLoading(true)

            // Buscar profissionais com vigor
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select(`
                    id, full_name, slug, rota_number, avatar_url, bio, pista,
                    user_gamification(total_xp, current_rank_id),
                    ranks:user_gamification(ranks(name))
                `)
                .not('rota_number', 'is', null)
                .order('created_at', { ascending: false })

            if (profiles && !error) {
                const mapped = profiles.map((p: any) => ({
                    id: p.id,
                    full_name: p.full_name,
                    slug: p.slug,
                    rota_number: p.rota_number,
                    avatar_url: p.avatar_url,
                    bio: p.bio,
                    pista: p.pista,
                    vigor: p.user_gamification?.[0]?.total_xp || 0,
                    rank_name: p.user_gamification?.[0]?.ranks?.name || 'Novato'
                }))
                setProfessionals(mapped)

                // Extrair pistas únicas
                const uniquePistas = Array.from(new Set(mapped.map(p => p.pista).filter(Boolean))) as string[]
                setPistas(uniquePistas)
            }

            setLoading(false)
        }
        loadData()
    }, [supabase])

    // Aplicar filtro da URL
    useEffect(() => {
        if (categoryParam) {
            setSelectedPista(categoryParam)
        }
    }, [categoryParam])

    // Filtrar profissionais
    const filteredProfessionals = professionals.filter(prof => {
        const matchesSearch = prof.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (prof.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        const matchesPista = !selectedPista || prof.pista === selectedPista
        return matchesSearch && matchesPista
    })

    // Rankings
    const nationalRankings = [...professionals]
        .sort((a, b) => b.vigor - a.vigor)
        .map((prof, idx) => ({
            id: prof.id,
            name: prof.full_name,
            xp: prof.vigor,
            rank: prof.rank_name || 'Novato',
            location: prof.pista || '',
            avatar_url: prof.avatar_url,
            position: idx + 1
        }))

    const rankingData = {
        local: nationalRankings.slice(0, 10),
        regional: nationalRankings.slice(0, 10),
        national: nationalRankings.slice(0, 10)
    }

    return (
        <div className="min-h-screen bg-adventure">
            {/* Header */}
            <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Flame className="w-8 h-8 text-primary" />
                            <h1 className="text-2xl font-bold text-impact text-primary">Profissional Legendário</h1>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="border-primary/20">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Community Pulse Dashboard - High Impact Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
                    {/* Welcome & Global Stats */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="relative overflow-hidden glass-strong border-primary/20 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/5 p-8 md:p-12 min-h-[400px] flex flex-col justify-center group">
                            {/* Abstract Graphic Elements */}
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none transform group-hover:scale-110">
                                <RotabusinessLogo size={320} />
                            </div>
                            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                            <div className="absolute -top-12 right-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />

                            <div className="relative z-10 w-full">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-lg shadow-primary/20">
                                    <Activity className="w-3 h-3 animate-pulse" /> Community Pulse
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-white text-impact leading-none mb-8 tracking-tighter">
                                    COMUNIDADE <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-glow-orange">
                                        ROTA BUSINESS
                                    </span>
                                </h1>
                                <p className="text-xl text-slate-300 font-medium max-w-2xl mb-12 leading-relaxed">
                                    O ecossistema definitivo para o homem de negócios. Monitore a atividade da guilda, conecte-se com a elite e acompanhe sua ascensão na jornada do Valente.
                                </p>

                                {/* Live Stats Bar */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Users className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Membros</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">{professionals.length || 0}</div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                                            <TrendingUp className="w-3 h-3" /> +12% sem.
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-secondary">
                                            <Zap className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Ativos Hoje</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">42</div>
                                        <div className="text-[10px] font-bold text-slate-400">Tempo real</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-impact">
                                            <Briefcase className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Projetos</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">856</div>
                                        <div className="text-[10px] font-bold text-slate-400 font-medium tracking-tight">Entregues</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-green-500">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Match Rate</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">94%</div>
                                        <div className="text-[10px] font-bold text-slate-400">Eficiência</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Growth Visualization Area */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-impact text-primary flex items-center gap-2 mb-2">
                                        <Search className="w-5 h-5" />
                                        DIRETÓRIO PROFISSIONAL
                                    </h3>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Buscar por nome, bio ou especialidade..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-12 glass-strong border-primary/20 h-16 text-lg focus:ring-primary/40 focus:border-primary/40"
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={selectedPista === null ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPista(null)}
                                            className={cn("h-10 px-6 font-bold uppercase text-[10px] tracking-wider transition-all", selectedPista === null ? "glow-orange bg-primary border-primary" : "border-primary/20 bg-card/50 hover:bg-primary/10")}
                                        >
                                            Todas as Pistas
                                        </Button>
                                        {pistas.map(pista => (
                                            <Button
                                                key={pista}
                                                variant={selectedPista === pista ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedPista(pista)}
                                                className={cn("h-10 px-6 font-bold uppercase text-[10px] tracking-wider transition-all", selectedPista === pista ? "glow-orange bg-primary border-primary" : "border-primary/20 bg-card/50 hover:bg-primary/10")}
                                            >
                                                {pista}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Activity Mini-Chart (Pure SVG Line Chart) */}
                            <div className="glass-strong border-primary/20 p-6 flex flex-col justify-between overflow-hidden relative">
                                <div className="relative z-10">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Crescimento Global</span>
                                    <div className="text-2xl font-black text-white">+2.4k <span className="text-xs font-bold text-green-500 uppercase tracking-tight">Vigor/Dia</span></div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none opacity-40">
                                    <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d">
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,40 L0,30 C10,25 20,35 30,20 C40,10 50,15 60,8 C70,2 80,12 100,2 L100,40 Z" fill="url(#chartGradient)" />
                                        <path d="M0,30 C10,25 20,35 30,20 C40,10 50,15 60,8 C70,2 80,12 100,2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" className="animate-draw-path" />
                                        {/* Reference points */}
                                        <circle cx="30" cy="20" r="1.5" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '3s' }} />
                                        <circle cx="60" cy="8" r="1.5" fill="hsl(var(--secondary))" className="animate-ping" style={{ animationDuration: '4s' }} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Rankings & Merit Summary */}
                    <div className="space-y-6">
                        <RankingsBoard data={rankingData as any} />

                        <Card className="glass-strong border-secondary/30 bg-secondary/5 group overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-secondary text-white shadow-lg shadow-secondary/20">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-white uppercase tracking-tight">Últimos Atos de Honra</h4>
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-secondary opacity-50" />
                                </div>
                                <div className="space-y-5">
                                    {[
                                        { name: 'Pr. Silvio Lacerda', badge: 'Sentinela Inabalável', time: '42m atrás', color: 'text-secondary' },
                                        { name: 'Pr. Erick Cabral', badge: 'Lenda', time: '2h atrás', color: 'text-primary' },
                                        { name: 'Matheus Artal', badge: 'Elite de Campo', time: '5h atrás', color: 'text-secondary' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs relative">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-black text-slate-500">
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-200">{item.name}</div>
                                                    <div className="text-[9px] text-slate-500 uppercase tracking-widest">{item.time}</div>
                                                </div>
                                            </div>
                                            <div className={cn("font-black tracking-tight", item.color)}>
                                                +{item.badge}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full mt-6 h-10 text-[10px] font-black uppercase text-secondary hover:bg-secondary/10 tracking-widest border border-secondary/20">
                                    Ver Fluxo de Vigor
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Community Reassurance */}
                        <div className="p-6 rounded-xl border border-primary/10 bg-primary/2 flex items-center gap-4">
                            <RotabusinessIcon size={40} className="opacity-20" />
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-tight">
                                Todos os profissionais são validados manualmente pela moderação do club.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Directory Header */}
                <div className="mb-10 flex items-center justify-between border-b border-primary/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white text-impact uppercase tracking-tight">Valentes na Guilda</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{filteredProfessionals.length} Membros Disponíveis</p>
                        </div>
                    </div>
                    <div className="hidden md:flex bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ordenado por Meritocracia</span>
                    </div>
                </div>

                {/* Professionals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfessionals.map((prof) => (
                        <Card
                            key={prof.id}
                            className="glass-strong border-primary/20 hover:border-primary/40 transition-all hover:glow-orange group"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:glow-orange-strong transition-all overflow-hidden relative border-2 border-primary/30">
                                            {prof.avatar_url ? (
                                                <img
                                                    src={prof.avatar_url}
                                                    alt={prof.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Users className="w-8 h-8 text-primary" />
                                            )}
                                        </div>
                                        {/* Rank Badge Overlay */}
                                        <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 border-2 border-background shadow-lg" title={prof.rank_name || 'Novato'}>
                                            <Shield className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="px-2 py-1 rounded-full bg-secondary text-white text-[10px] font-black border border-secondary/20 uppercase tracking-tighter shadow-lg shadow-secondary/20">
                                            {prof.rank_name || 'Novato'}
                                        </div>
                                    </div>
                                </div>
                                <CardTitle className="text-xl text-impact text-primary">
                                    {prof.full_name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {prof.pista || 'Sem pista'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-foreground line-clamp-2">
                                    {prof.bio || 'Membro do Rota Business Club'}
                                </p>

                                {/* Rating and Vigor */}
                                <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                                    <div className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4 text-secondary" />
                                        <span className="font-bold text-secondary">{prof.vigor}</span>
                                        <span className="text-xs text-muted-foreground">
                                            Vigor
                                        </span>
                                    </div>
                                    <div className="text-sm font-black text-primary">
                                        {prof.rota_number}
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full">
                                    <Link href={getProfileUrl({ full_name: prof.full_name, slug: prof.slug, rota_number: prof.rota_number })} className="flex-1">
                                        <Button variant="outline" className="w-full text-impact font-bold hover:bg-primary/10 border-primary/20" size="sm">
                                            Explorar Perfil
                                        </Button>
                                    </Link>
                                    <RatingDialog
                                        professionalId={prof.id}
                                        professionalName={prof.full_name}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* No Results */}
                {filteredProfessionals.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            Nenhum profissional encontrado
                        </h3>
                        <p className="text-muted-foreground">
                            Tente ajustar os filtros ou buscar por outros termos
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
