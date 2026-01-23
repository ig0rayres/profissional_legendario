// This page is a server component to allow metadata export.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Zap, Trophy, Medal, ArrowRight, Flame
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import { RotabusinessLogo } from '@/components/branding/logo'
import { createClient } from '@/lib/supabase/server'
import * as LucideIcons from 'lucide-react'

export const metadata: Metadata = {
    title: 'Rota do Valente | Sistema de Mérito e Elite Business',
    description: 'A Rota do Valente é o sistema definitivo de hierarquia do Rota Business Club. Conquiste autoridade, eleve seu multiplicador de vigor e destaque-se como um profissional de alta performance.',
    keywords: 'networking business, elite profissional, sistema de merito, rota business club, valor profissional, autoridade',
}

// Componente para renderizar ícone Lucide dinamicamente
function DynamicIconServer({ name, className }: { name: string, className?: string }) {
    const Icon = (LucideIcons as any)[name] || LucideIcons.Award
    return <Icon className={className} strokeWidth={2} />
}

export default async function RotaDoValentePublicPage() {
    const supabase = await createClient()

    // Fetch real ranks from database
    const { data: ranks } = await supabase
        .from('ranks')
        .select('*')
        .order('rank_level', { ascending: true })

    // Fetch real medals from database (permanentes)
    const { data: medals } = await supabase
        .from('medals')
        .select('*')
        .eq('is_permanent', true)
        .order('display_order')

    // Fetch proezas (mensais)
    const { data: proezas } = await supabase
        .from('proezas')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(12)

    const RANKS = ranks || []
    const MEDALS = medals || []
    const PROEZAS = proezas || []

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Simple Hero Section */}
            <div className="border-b border-slate-200 bg-white">
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            Jornada de Honra
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none text-slate-900">
                            Rota do <span className="text-primary">Valente</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium max-w-2xl">
                            A jornada definitiva para os profissionais que buscam o topo.
                            Acumule vigor através de sua dedicação, conquiste patentes de autoridade e consolide seu nome no Círculo de Elite do Rota Business Club.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/auth/register">
                                <Button size="lg" className="h-14 px-8 text-sm font-black bg-primary hover:bg-primary/90 text-white rounded-none uppercase">
                                    Iniciar Alistamento
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-sm font-black border-slate-300 text-slate-900 rounded-none uppercase hover:bg-slate-50">
                                    Acessar Painel
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24">
                {/* How it Works - Industrial Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-200 mb-32 bg-white shadow-sm">
                    {[
                        {
                            icon: Zap,
                            title: 'Vigor',
                            desc: 'Energia conquistada através de ações práticas, conclusão de serviços e participação ativa.'
                        },
                        {
                            icon: Trophy,
                            title: 'Patentes',
                            desc: 'Níveis de autoridade que aumentam seu multiplicador de vigor e visibilidade na plataforma.'
                        },
                        {
                            icon: Flame,
                            title: 'Proezas',
                            desc: 'Conquistas mensais que comprovam suas habilidades e dedicação na jornada.'
                        }
                    ].map((pillar, i) => (
                        <div key={i} className={cn("p-12 border-slate-100", i < 2 ? "md:border-r" : "")}>
                            <div className="w-12 h-12 flex items-center justify-center mb-8 border border-primary/30 text-primary bg-primary/5">
                                <pillar.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black mb-4 uppercase tracking-wider text-slate-900">{pillar.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{pillar.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Ranks Section */}
                <div className="mb-32">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-px flex-1 bg-slate-300" />
                        <h2 className="text-3xl font-black uppercase tracking-widest text-slate-900 px-4">Hierarquia</h2>
                        <div className="h-px flex-1 bg-slate-300" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200 shadow-md">
                        {RANKS.map((rank: any) => (
                            <div key={rank.id} className="bg-white p-10 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                                        <DynamicIconServer name={rank.icon || 'Shield'} className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 border border-primary/20">
                                        VIGOR DESDE {rank.points_required}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-3 tracking-tight group-hover:text-primary transition-colors text-slate-900">
                                    {rank.name}
                                </h3>
                                <p className="text-slate-500 text-xs mb-8 min-h-[48px] uppercase font-bold tracking-wider leading-relaxed">
                                    {rank.description || 'Patente de honra e dedicação'}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        REQUISITO: {rank.points_required} Vigor
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Proezas Section (Mensais) */}
                <div className="mb-32">
                    <div className="flex flex-col md:flex-row items-end gap-6 mb-16">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-black uppercase mb-4 text-slate-900">Proezas Mensais</h2>
                            <p className="text-slate-600 font-medium">Conquistas que resetam todo mês. Prove sua dedicação consistente e ganhe Vigor extra!</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {PROEZAS.map((proeza: any) => (
                            <div key={proeza.id} className="p-8 bg-white border border-slate-200 hover:border-secondary/50 transition-all flex flex-col items-center text-center group shadow-sm">
                                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-6 text-white shadow-lg shadow-secondary/20 group-hover:scale-110 transition-transform">
                                    <DynamicIconServer name={proeza.icon || 'Flame'} className="w-7 h-7" />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-slate-900">{proeza.name}</h4>
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-4">{proeza.description}</div>
                                <div className="mt-auto px-3 py-1 bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-400">
                                    VALOR: {proeza.points_base} Vigor
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Medals Section (Permanentes) */}
                <div className="mb-32">
                    <div className="flex flex-col md:flex-row items-end gap-6 mb-16">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-black uppercase mb-4 text-slate-900">Medalhas Permanentes</h2>
                            <p className="text-slate-600 font-medium">Conquistas ad aeternum que ficam para sempre no seu perfil. Marcos da sua jornada.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {MEDALS.map((medal: any) => (
                            <div key={medal.id} className="p-8 bg-white border border-slate-200 hover:border-primary/50 transition-all flex flex-col items-center text-center group shadow-sm">
                                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-6 text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                    <DynamicIconServer name={medal.icon || 'Award'} className="w-7 h-7" />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-slate-900">{medal.name}</h4>
                                <div className="text-[10px] font-black text-slate-400 uppercase mb-4">{medal.description}</div>
                                <div className="mt-auto px-3 py-1 bg-primary/5 border border-primary/10 text-[9px] font-black text-primary">
                                    VALOR: {medal.points_reward} Vigor
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Join Section */}
                <div className="bg-primary p-12 md:p-24 text-center">
                    <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-8 tracking-tighter">O Convite é para Poucos. A Glória é para os Fortes.</h2>
                    <p className="text-white/90 text-lg mb-12 max-w-xl mx-auto font-black uppercase tracking-tight">
                        Este não é apenas um diretório. É um ecossistema de honra, mérito e resultados extraordinários.
                        Sua ascensão começa agora.
                    </p>
                    <Link href="/auth/register">
                        <Button className="h-16 px-12 text-lg font-black bg-black text-white hover:bg-gray-900 rounded-none uppercase transition-transform hover:scale-105 active:scale-95">
                            Quero me Alistar
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-slate-200 mt-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <RotabusinessLogo size={30} />
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                            © 2024 Rota Business Club. Todos os direitos reservados.
                        </div>
                        <div className="flex gap-6">
                            <Link href="#" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider">
                                Sobre
                            </Link>
                            <Link href="#" className="text-slate-500 hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider">
                                Contato
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
