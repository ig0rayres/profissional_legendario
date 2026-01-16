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
import { MOCK_PROFESSIONALS } from '@/lib/data/mock'
import { RatingDialog } from '@/components/ratings/rating-dialog'
import { PlansSection } from '@/components/sections/plans-section'
import { FeaturedConfraternities } from '@/components/home/FeaturedConfraternities'
import { RotabusinessLogo } from '@/components/branding/logo'

export default function HomePage() {
    const [scrolled, setScrolled] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentSlide, setCurrentSlide] = useState(0)

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
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10 pt-20">
                    <div className="max-w-5xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-impact text-primary mb-6 animate-transform drop-shadow-lg leading-tight">
                            O ACAMPAMENTO BASE<br />DO HOMEM DE NEGÓCIOS
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md font-medium max-w-3xl mx-auto">
                            Infraestrutura de apoio, estratégia e alianças para sua escalada.
                        </p>
                        <p className="text-lg text-gray-200 mb-12 max-w-2xl mx-auto drop-shadow-sm">
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
                            Alianças Estratégicas
                        </h2>
                        <p className="text-center text-muted-foreground mb-12">
                            Conecte-se com homens que compartilham o mesmo código de honra e vigor profissional.
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

                        {/* Featured Professionals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {MOCK_PROFESSIONALS.slice(0, 3).map((prof, index) => (
                                <Card
                                    key={prof.id}
                                    className="glass-strong border-primary/20 hover:border-primary/40 transition-all hover:glow-orange group animate-transform"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <CardContent className="p-6">
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors overflow-hidden relative">
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
                                        <h3 className="text-xl font-bold text-impact text-primary mb-2">
                                            {prof.full_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {prof.location}
                                        </p>
                                        <p className="text-sm text-foreground mb-4 line-clamp-2">
                                            {prof.bio}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-accent fill-accent" />
                                                <span className="font-bold text-accent">{prof.rating}</span>
                                            </div>
                                            <span className="text-sm font-bold text-primary">
                                                R$ {prof.hourly_rate}/h
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <Link href={`/professional/${prof.id}`} className="flex-1">
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
                            ))}
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
