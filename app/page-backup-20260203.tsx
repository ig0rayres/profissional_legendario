'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
    Flame, Search, Users, Briefcase, Star,
    ChevronRight, Play, Quote, MapPin, Award, TrendingUp,
    Mountain, Compass, Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { RatingDialog } from '@/components/ratings/rating-dialog'
import { PlansSection } from '@/components/sections/plans-section'
import { FeaturedConfraternities } from '@/components/home/FeaturedConfraternities'
import { RotabusinessLogo } from '@/components/branding/logo'
import { getProfileUrl } from '@/lib/profile/utils'
import { RankInsignia } from '@/components/gamification/rank-insignia'

interface Professional {
    id: string
    full_name: string
    slug: string | null
    rota_number: string | null
    avatar_url: string | null
    bio: string | null
    pista: string | null
    rank_id: string | null
    vigor?: number
}

export default function HomePage() {
    const [scrolled, setScrolled] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentSlide, setCurrentSlide] = useState(0)
    const [professionals, setProfessionals] = useState<Professional[]>([])
    const [loadingProfessionals, setLoadingProfessionals] = useState(true)

    const supabase = createClient()

    // Carregar TOP 3 profissionais por Vigor
    useEffect(() => {
        async function loadTopProfessionals() {
            // Buscar os 3 com mais vigor
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, slug, rota_number, avatar_url, bio, pista, vigor, rank_id')
                .not('rota_number', 'is', null)
                .gt('vigor', 0)
                .order('vigor', { ascending: false })
                .limit(3)

            if (data && !error && data.length > 0) {
                setProfessionals(data)
            } else {
                // Fallback: qualquer 3 profissionais
                const { data: fallback } = await supabase
                    .from('profiles')
                    .select('id, full_name, slug, rota_number, avatar_url, bio, pista')
                    .not('rota_number', 'is', null)
                    .limit(3)
                    .order('created_at', { ascending: false })

                if (fallback) {
                    setProfessionals(fallback.map(p => ({ ...p, rank_id: null, vigor: 0 })))
                }
            }
            setLoadingProfessionals(false)
        }
        loadTopProfessionals()
    }, [supabase])

    // Carousel Effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 5)
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const testimonials = [
        {
            name: "Carlos Mendes",
            role: "Empresário",
            text: "A experiência no Rota Business Club transformou minha vida. Encontrei não apenas profissionais excepcionais, mas uma verdadeira aliança estratégica.",
            rating: 5
        },
        {
            name: "Roberto Silva",
            role: "Atleta",
            text: "Participar dos eventos e conectar com outros homens de propósito foi fundamental para meu crescimento pessoal e profissional.",
            rating: 5
        },
        {
            name: "André Costa",
            role: "Empreendedor",
            text: "A comunidade Rota Business me ajudou a encontrar os melhores profissionais para meus projetos. Qualidade incomparável.",
            rating: 5
        }
    ]

    const stats = [
        { icon: Users, value: "5.000+", label: "Membros Ativos" },
        { icon: Mountain, value: "200+", label: "Eventos Realizados" },
        { icon: Award, value: "98%", label: "Satisfação" },
        { icon: TrendingUp, value: "15+", label: "Anos de História" }
    ]

    return (
        <div className="min-h-screen bg-adventure">
            {/* Floating Header */}
            {/* Header removed - now global */}

            {/* Hero Section */}
            <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                {/* Carousel Background */}
                <div className="absolute inset-0 z-0">
                    {[
                        '/images/event-1.jpg',
                        '/images/event-2.jpg',
                        '/images/event-3.jpg',
                        '/images/event-4.jpg',
                        '/images/event-5.jpg'
                    ].map((img, index) => (
                        <div
                            key={img}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Background ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay mais forte para melhor contraste */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/90" />
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10 pt-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-impact text-white mb-6 animate-transform leading-tight" style={{ textShadow: '2px 4px 8px rgba(0,0,0,0.9), 0 0 60px rgba(210,105,30,0.4)' }}>
                            O ACAMPAMENTO BASE<br />DO HOMEM DE NEGÓCIOS
                        </h1>
                        <p className="text-xl md:text-2xl text-white mb-8 font-semibold max-w-3xl mx-auto" style={{ textShadow: '1px 2px 6px rgba(0,0,0,0.95)' }}>
                            Infraestrutura de apoio, estratégia e alianças para sua escalada.
                        </p>
                        <p className="text-lg text-gray-100 mb-12 max-w-2xl mx-auto" style={{ textShadow: '1px 2px 4px rgba(0,0,0,0.9)' }}>
                            O Rota Business Club não é apenas um diretório. É o ponto de convergência onde a disciplina da montanha encontra a ética corporativa.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/register">
                                <Button size="lg" className="text-lg px-8 glow-orange-strong bg-secondary hover:bg-secondary/90 text-white">
                                    <Compass className="w-5 h-5 mr-2" />
                                    Juntar-se à Expedição
                                </Button>
                            </Link>
                            <Link href="#profissionais">
                                <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10 hover:text-white">
                                    <Search className="w-5 h-5 mr-2" />
                                    Explorar Membros
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-card/30 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center animate-transform" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 rounded-full bg-primary/20">
                                        <stat.icon className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-impact text-primary mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section id="profissionais" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-impact text-primary text-center mb-4">
                            🏆 Top 3 do Ranking
                        </h2>
                        <p className="text-center text-muted-foreground mb-12">
                            Os profissionais mais ativos e engajados da comunidade
                        </p>

                        {/* Search Bar */}
                        <Card className="glass-strong border-primary/20 mb-12">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                        <Input
                                            placeholder="Buscar por especialidade, nome ou localização..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 h-12 text-lg"
                                        />
                                    </div>
                                    <Link href="/professionals">
                                        <Button size="lg" className="h-12 glow-orange bg-secondary hover:bg-secondary/90 text-white">
                                            Buscar
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top 3 Professionals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {loadingProfessionals ? (
                                // Loading skeleton
                                [...Array(3)].map((_, index) => (
                                    <Card key={index} className="glass-strong border-primary/20 animate-pulse">
                                        <CardContent className="p-6">
                                            <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4" />
                                            <div className="h-6 bg-primary/20 rounded mb-2 w-3/4 mx-auto" />
                                            <div className="h-4 bg-primary/10 rounded mb-3 w-1/2 mx-auto" />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : professionals.length === 0 ? (
                                <div className="col-span-3 text-center py-8 text-muted-foreground">
                                    Nenhum profissional encontrado
                                </div>
                            ) : (
                                professionals.slice(0, 3).map((prof, index) => {
                                    const positionColors = [
                                        'from-amber-400 to-amber-600', // Ouro
                                        'from-gray-300 to-gray-500',   // Prata  
                                        'from-amber-600 to-amber-800'  // Bronze
                                    ]
                                    const positionBg = [
                                        'border-amber-400/50 bg-gradient-to-br from-amber-500/10 to-amber-600/5',
                                        'border-gray-400/50 bg-gradient-to-br from-gray-400/10 to-gray-500/5',
                                        'border-amber-700/50 bg-gradient-to-br from-amber-700/10 to-amber-800/5'
                                    ]
                                    const positionEmoji = ['🥇', '🥈', '🥉']

                                    return (
                                        <Card
                                            key={prof.id}
                                            className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group animate-transform ${positionBg[index]}`}
                                            style={{ animationDelay: `${index * 0.15}s` }}
                                        >
                                            {/* Position Badge */}
                                            <div className={`absolute top-3 left-3 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${positionColors[index]} shadow-lg z-10`}>
                                                <span className="text-xl">{positionEmoji[index]}</span>
                                            </div>

                                            <CardContent className="p-6 pt-4">
                                                {/* Avatar com borda colorida */}
                                                <div className="relative w-24 h-24 mx-auto mb-4 mt-2">
                                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${positionColors[index]} p-1 shadow-xl`}>
                                                        <div className="w-full h-full rounded-full overflow-hidden bg-card flex items-center justify-center">
                                                            {prof.avatar_url ? (
                                                                <img
                                                                    src={prof.avatar_url}
                                                                    alt={prof.full_name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Users className="w-12 h-12 text-primary" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Patente */}
                                                    <div className="absolute -bottom-1 -right-1">
                                                        <RankInsignia rankId={prof.rank_id} size="sm" />
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-impact text-primary mb-1 text-center">
                                                    {prof.full_name}
                                                </h3>

                                                {/* Vigor Destaque */}
                                                <div className="flex items-center justify-center gap-2 mb-3">
                                                    <Flame className="w-5 h-5 text-orange-500" />
                                                    <span className="text-lg font-bold text-orange-500">
                                                        {(prof.vigor || 0).toLocaleString()} Vigor
                                                    </span>
                                                </div>

                                                {prof.pista && (
                                                    <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {prof.pista}
                                                    </p>
                                                )}

                                                <p className="text-sm text-foreground mb-4 line-clamp-2 text-center">
                                                    {prof.bio || 'Membro do Rota Business Club'}
                                                </p>

                                                <div className="flex gap-2">
                                                    <Link href={getProfileUrl({ full_name: prof.full_name, slug: prof.slug, rota_number: prof.rota_number })} className="flex-1">
                                                        <Button className="w-full glow-orange" size="sm">
                                                            Ver Perfil
                                                        </Button>
                                                    </Link>
                                                    <RatingDialog
                                                        professionalId={prof.id}
                                                        professionalName={prof.full_name}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            )}
                        </div>

                        <div className="text-center mt-8">
                            <Link href="/professionals">
                                <Button size="lg" variant="outline" className="border-primary/30">
                                    Ver Todos os Membros
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <PlansSection />

            {/* Confraternities Section */}
            <FeaturedConfraternities />

            {/* Video Section */}
            <section className="py-20 bg-card/30 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-impact text-primary text-center mb-4">
                        Nossa História
                    </h2>
                    <p className="text-center text-muted-foreground mb-12">
                        A jornada da montanha aplicada aos negócios
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Video 1 - YouTube */}
                        <Card className="glass-strong border-primary/20 hover:border-primary/40 transition-all group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative aspect-video bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src="https://www.youtube.com/embed/joxNGPx_N4c"
                                        title="Manifesto Rota Business"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0"
                                    ></iframe>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-primary mb-2">
                                        Manifesto Rota Business
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Entenda o código que nos une.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Video 2 - YouTube */}
                        <Card className="glass-strong border-primary/20 hover:border-primary/40 transition-all group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative aspect-video bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src="https://www.youtube.com/embed/b7ZxP1J0WSw"
                                        title="Experiência da Montanha"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0"
                                    ></iframe>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-primary mb-2">
                                        Experiência da Montanha
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Onde a resiliência é forjada.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="depoimentos" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-impact text-primary text-center mb-4">
                        Relatos do Campo
                    </h2>
                    <p className="text-center text-muted-foreground mb-12">
                        O impacto do Rota Business Club na vida de quem vive a subida
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="glass-strong border-primary/20 hover:border-primary/40 transition-all animate-transform"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardContent className="p-6">
                                    <Quote className="w-10 h-10 text-primary/30 mb-4" />
                                    <p className="text-foreground mb-6 italic">
                                        "{testimonial.text}"
                                    </p>
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                                        ))}
                                    </div>
                                    <div>
                                        <div className="font-bold text-primary">{testimonial.name}</div>
                                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Offer Services CTA */}
            <section className="py-20 bg-card/30 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <Card className="glass-strong border-primary/20 max-w-4xl mx-auto">
                        <CardContent className="p-12 text-center">
                            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-bold text-impact text-primary mb-4">
                                Junte-se à Elite
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Faça parte do Rota Business Club.
                                Conecte-se com clientes de alto nível e expanda seu negócio com honra.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/auth/register">
                                    <Button size="lg" className="glow-orange-strong bg-secondary hover:bg-secondary/90 text-white">
                                        <Briefcase className="w-5 h-5 mr-2" />
                                        Cadastrar como Profissional
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline" className="border-primary/30">
                                    Saiba Mais
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Event Photos Gallery */}
            <section id="eventos" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-impact text-primary text-center mb-4">
                        Nossas Expedições
                    </h2>
                    <p className="text-center text-muted-foreground mb-12">
                        Experiências transformadoras em contato com a natureza e o desafio
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        {/* Featured Image (Large) */}
                        <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden group cursor-pointer min-h-[300px]">
                            <img
                                src="/images/event-4.jpg"
                                alt="Grupo Rota Business"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                                <div>
                                    <h3 className="text-white font-bold text-xl mb-1">A Força do Grupo</h3>
                                    <p className="text-gray-300 text-sm">Unidade e propósito</p>
                                </div>
                            </div>
                        </div>

                        {/* Image 2 */}
                        <div className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
                            <img
                                src="/images/event-1.jpg"
                                alt="Palestra"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 3 */}
                        <div className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
                            <img
                                src="/images/event-2.jpg"
                                alt="Atividade Noturna"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 4 */}
                        <div className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
                            <img
                                src="/images/event-3.jpg"
                                alt="Liderança"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 5 */}
                        <div className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer">
                            <img
                                src="/images/event-5.jpg"
                                alt="Natureza"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <Button size="lg" variant="outline" className="border-primary/30">
                            Ver Galeria Completa
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-card/50 backdrop-blur-sm border-t border-primary/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <RotabusinessLogo size={30} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            © 2024 Rota Business Club. Todos os direitos reservados.
                        </div>
                        <div className="flex gap-6">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                Sobre
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                Contato
                            </Link>
                            <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                                Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
