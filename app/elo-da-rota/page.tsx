'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Target, Users, TrendingUp, Shield, Flame, Crosshair, Swords, Activity, CheckCircle2, Zap, Award, Globe, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { RotabusinessLogo } from '@/components/branding/logo'
import { cn } from '@/lib/utils'
import { getProfileUrl } from '@/lib/profile/utils'

type PlatformStats = {
    total_users: number
    total_professionals: number
    total_points: number
    total_medals: number
    total_confraternities: number
}

type TopUser = {
    user_id: string
    full_name: string
    slug: string
    rota_number?: string
    total_points: number
    rank_name: string
    plan_id: string
}

type Achievement = {
    user_id: string
    full_name: string
    slug: string
    rota_number?: string
    medal_name: string
    medal_icon: string
    earned_at: string
}

export default function EloRotaPage() {
    const [stats, setStats] = useState<PlatformStats | null>(null)
    const [topUsers, setTopUsers] = useState<TopUser[]>([])
    const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)

        const { data: statsData } = await supabase.rpc('get_platform_stats')
        if (statsData) setStats(statsData)

        const { data: topData } = await supabase.rpc('get_top_users_by_vigor', { p_limit: 10 })
        if (topData) setTopUsers(topData)

        const { data: achievementsData } = await supabase.rpc('get_recent_achievements', { p_limit: 10 })
        if (achievementsData) setRecentAchievements(achievementsData)

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-adventure flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-secondary"></div>
                    <Crosshair className="absolute inset-0 m-auto h-8 w-8 text-secondary animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-adventure">
            <main className="container mx-auto px-4 py-8">
                {/* Hero Dashboard - Massive Impact Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Welcome & Live Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative overflow-hidden glass-strong border-primary/20 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/5 p-8 md:p-12 min-h-[450px] flex flex-col justify-center group">
                            {/* Abstract Graphics */}
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none transform group-hover:scale-110">
                                <RotabusinessLogo size={320} />
                            </div>
                            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                            <div className="absolute -top-12 right-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />

                            <div className="relative z-10 w-full">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-lg shadow-primary/20">
                                    <Activity className="w-3 h-3 animate-pulse" /> ELO PULSE
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-white text-impact leading-none mb-8 tracking-tighter">
                                    ELO DA ROTA <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                        O ACAMPAMENTO BASE
                                    </span>
                                </h1>
                                <p className="text-xl text-slate-300 font-medium max-w-2xl mb-12 leading-relaxed">
                                    O coração pulsante da tribo. Monitore a atividade da guilda, acompanhe a ascensão dos guerreiros e celebre as conquistas dos valentes.
                                </p>

                                {/* Live Stats Bar */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Users className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Guerreiros</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">{stats?.total_users || 0}</div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                                            <TrendingUp className="w-3 h-3" /> +12% sem.
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-secondary">
                                            <Flame className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Vigor Total</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">{(stats?.total_points || 0).toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-slate-400">Acumulado</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-impact">
                                            <Trophy className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Conquistas</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">{stats?.total_medals || 0}</div>
                                        <div className="text-[10px] font-bold text-slate-400 font-medium tracking-tight">Medalhas</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-green-500">
                                            <Swords className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Elos</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">{stats?.total_confraternities || 0}</div>
                                        <div className="text-[10px] font-bold text-slate-400">Confrarias</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Chart */}
                        <div className="glass-strong border-primary/20 p-6 flex flex-col justify-between overflow-hidden relative min-h-[180px]">
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Crescimento da Tribo</span>
                                <div className="text-2xl font-black text-white">+{((stats?.total_points || 0) / 10).toFixed(0)} <span className="text-xs font-bold text-green-500 uppercase tracking-tight">Vigor/Dia</span></div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none opacity-40">
                                <svg viewBox="0 0 100 40" className="w-full h-full">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,40 L0,30 C10,25 20,35 30,20 C40,10 50,15 60,8 C70,2 80,12 100,2 L100,40 Z" fill="url(#chartGradient)" />
                                    <path d="M0,30 C10,25 20,35 30,20 C40,10 50,15 60,8 C70,2 80,12 100,2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="30" cy="20" r="1.5" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '3s' }} />
                                    <circle cx="60" cy="8" r="1.5" fill="hsl(var(--secondary))" className="animate-ping" style={{ animationDuration: '4s' }} />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Latest Achievements */}
                    <div className="space-y-6">
                        <Card className="glass-strong border-secondary/30 bg-secondary/5 group overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-secondary text-white shadow-lg shadow-secondary/20">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-white uppercase tracking-tight">Últimas Conquistas</h4>
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-secondary opacity-50" />
                                </div>
                                <div className="space-y-5">
                                    {recentAchievements.slice(0, 5).map((achievement, i) => (
                                        <Link key={i} href={getProfileUrl({ full_name: achievement.full_name, slug: achievement.slug, rota_number: achievement.rota_number })} className="block">
                                            <div className="flex items-center justify-between text-xs relative group/item hover:translate-x-1 transition-transform">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-2xl">
                                                        {achievement.medal_icon}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-200 group-hover/item:text-secondary transition-colors">{achievement.full_name}</div>
                                                        <div className="text-[9px] text-slate-500 uppercase tracking-widest">
                                                            {new Date(achievement.earned_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-black tracking-tight text-secondary text-[10px]">
                                                    {achievement.medal_name}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full mt-6 h-10 text-[10px] font-black uppercase text-secondary hover:bg-secondary/10 tracking-widest border border-secondary/20">
                                    Ver Todas Conquistas
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Ranking Section */}
                <div className="mb-10 flex items-center justify-between border-b border-primary/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white text-impact uppercase tracking-tight">RANKING DE VIGOR</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">OS MAIS FORTES DA TRIBO</p>
                        </div>
                    </div>
                    <div className="hidden md:flex bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ordenado por Meritocracia</span>
                    </div>
                </div>

                {/* Top 10 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    {topUsers.map((user, index) => (
                        <Link
                            key={user.user_id}
                            href={getProfileUrl({ full_name: user.full_name, slug: user.slug, rota_number: user.rota_number })}
                            className="block group"
                        >
                            <div className={cn(
                                "glass-strong border-primary/20 hover:border-primary/40 transition-all hover:glow-orange p-6 flex items-center gap-6",
                                index < 3 && "bg-gradient-to-r from-primary/10 via-transparent to-secondary/5 border-primary/30"
                            )}>
                                {/* Posição */}
                                <div className={cn(
                                    "flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-lg font-black text-2xl",
                                    index === 0 ? "bg-secondary text-white shadow-lg shadow-secondary/30" :
                                        index === 1 ? "bg-primary text-white shadow-lg shadow-primary/30" :
                                            index === 2 ? "bg-primary/70 text-white" :
                                                "bg-slate-800 text-slate-400"
                                )}>
                                    {index + 1}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-xl text-white text-impact truncate group-hover:text-secondary transition-colors">
                                        {user.full_name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm font-bold text-slate-400">{user.rank_name}</span>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider border-primary/20">
                                            {user.plan_id}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Vigor */}
                                <div className="text-right">
                                    <div className="flex items-center gap-2 justify-end text-secondary mb-1">
                                        <Flame className="w-5 h-5 animate-pulse" />
                                        <span className="text-2xl font-black">{user.total_points}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vigor</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <Card className="glass-strong border-primary/20 glow-orange relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
                    <CardContent className="p-12 text-center relative z-10">
                        <Shield className="h-16 w-16 text-secondary mx-auto mb-6 drop-shadow-lg animate-pulse" />
                        <h2 className="text-4xl font-black mb-4 text-white text-impact uppercase">JUNTE-SE À EXPEDIÇÃO</h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                            Conecte-se com guerreiros, conquiste territórios, suba de patente e faça parte da tribo dos que constroem impérios
                        </p>
                        <div className="flex gap-6 justify-center flex-wrap">
                            <Link href="/auth/register">
                                <Button className="px-10 py-6 bg-secondary hover:bg-secondary/90 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-secondary/30 glow-orange-strong">
                                    INICIAR JORNADA
                                </Button>
                            </Link>
                            <Link href="/professionals">
                                <Button variant="outline" className="px-10 py-6 border-2 border-primary text-primary hover:bg-primary/10 font-black text-sm uppercase tracking-widest">
                                    VER GUERREIROS
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
