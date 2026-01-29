'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Heart, MessageCircle, Share2, Award, TrendingUp, Users, MapPin, Calendar,
    Flame, Target, Medal, Bell, Search, Settings, Plus, CheckCircle2,
    Clock, Zap, Trophy, Star, ArrowRight, Shield, Rocket, BarChart3,
    Phone, Mail, MapPinned, Instagram, Facebook, Linkedin, Minus
} from 'lucide-react';

export default function HomeV2() {
    const [likedPosts, setLikedPosts] = useState<number[]>([]);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleLike = (postId: number) => {
        setLikedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    const liveStats = [
        { label: "Online Agora", value: "3.2K", icon: Users, color: "text-green-400" },
        { label: "Treinos Hoje", value: "847", icon: Flame, color: "text-orange-400" },
        { label: "KM Percorridos", value: "12.4K", icon: Target, color: "text-blue-400" },
        { label: "Conquistas", value: "1.9K", icon: Medal, color: "text-amber-400" }
    ];

    const communityPosts = [
        {
            id: 1,
            author: "Rafael Costa",
            avatar: "/images/atleta-estiloso.jpg",
            rank: "Platina",
            time: "2h atrás",
            content: "Completei meu primeiro ultra! 100km de pura superação. Obrigado ROTA por me mostrar que eu era capaz! 🔥",
            image: "/images/atleta-focado.jpg",
            likes: 847,
            comments: 92,
            shares: 34
        },
        {
            id: 2,
            author: "Marina Silva",
            avatar: "/images/dupla-vitoria.jpg",
            rank: "Diamante",
            time: "5h atrás",
            content: "A energia do RETO #1079 foi surreal! Melhor experiência da minha vida. Já me preparando pro próximo! 💎",
            image: "/images/lider-multidao-sunset.jpg",
            likes: 1234,
            comments: 156,
            shares: 78
        },
        {
            id: 3,
            author: "Lucas Mendes",
            avatar: "/images/atleta-closeup.jpg",
            rank: "Elite",
            time: "1d atrás",
            content: "Treino matinal nas montanhas. Nada melhor que começar o dia desafiando limites! ⛰️",
            image: "/images/hero-mountain.jpg",
            likes: 652,
            comments: 45,
            shares: 23
        },
        {
            id: 4,
            author: "Carla Souza",
            avatar: "/images/dupla-topo.jpg",
            rank: "Ouro",
            time: "2d atrás",
            content: "Nosso grupo finalizou o trail de 50km! A união faz a força. Vamos juntos! 🏆",
            image: "/images/grupo-mata.jpg",
            likes: 923,
            comments: 67,
            shares: 41
        }
    ];

    const upcomingEvents = [
        {
            title: "Trail dos Pioneiros",
            date: "15 AGO",
            location: "Serra da Mantiqueira",
            participants: 234,
            image: "/images/hero-mountain.jpg",
            category: "Ultra Trail"
        },
        {
            title: "RETO Noturno",
            date: "22 SET",
            location: "Campos do Jordão",
            participants: 178,
            image: "/images/noturna-bandeiras-bw.jpg",
            category: "Desafio"
        },
        {
            title: "Confraria Business",
            date: "05 OUT",
            location: "São Paulo",
            participants: 89,
            image: "/images/confraria-networking.jpg",
            category: "Networking"
        }
    ];

    const topLegendarios = [
        { name: "André Martins", points: 8940, rank: "Elite", avatar: "/images/lider-experiente.jpg" },
        { name: "Beatriz Lima", points: 7825, rank: "Diamante", avatar: "/images/dupla-vitoria.jpg" },
        { name: "Carlos Rocha", points: 7234, rank: "Diamante", avatar: "/images/atleta-estiloso.jpg" },
        { name: "Diana Costa", points: 6892, rank: "Platina", avatar: "/images/dupla-topo.jpg" },
        { name: "Eduardo Silva", points: 6543, rank: "Platina", avatar: "/images/atleta-closeup.jpg" }
    ];

    const features = [
        {
            icon: Users,
            title: "Comunidade Ativa",
            description: "Conecte-se com mais de 12 mil atletas apaixonados por superação e conquistas."
        },
        {
            icon: Trophy,
            title: "Sistema de Patentes",
            description: "Evolua através de níveis exclusivos e desbloqueie benefícios premium."
        },
        {
            icon: BarChart3,
            title: "Analytics Completo",
            description: "Acompanhe seu progresso com métricas detalhadas e insights personalizados."
        },
        {
            icon: Shield,
            title: "Eventos Seguros",
            description: "Organização profissional com equipes especializadas em cada detalhe."
        }
    ];

    const plans = [
        {
            name: "Gratuito",
            price: "R$ 0",
            period: "/sempre",
            features: [
                "Acesso ao feed social",
                "Participação em eventos públicos",
                "Estatísticas básicas",
                "Notificações limitadas"
            ],
            cta: "Começar Grátis",
            popular: false
        },
        {
            name: "Pro",
            price: "R$ 97",
            period: "/mês",
            features: [
                "Tudo do plano Gratuito",
                "Sistema de patentes completo",
                "Analytics avançado",
                "Acesso prioritário a eventos",
                "Grupo exclusivo WhatsApp",
                "Desconto em eventos (30%)",
                "Badge verificado"
            ],
            cta: "Assinar Pro",
            popular: true
        },
        {
            name: "Elite",
            price: "R$ 297",
            period: "/mês",
            features: [
                "Tudo do plano Pro",
                "Eventos VIP exclusivos",
                "Confraria Business",
                "Mentoria mensal",
                "Kit premium",
                "Consultoria de performance",
                "Networking exclusivo"
            ],
            cta: "Ser Elite",
            popular: false
        }
    ];

    const testimonials = [
        {
            author: "Pedro Almeida",
            role: "CEO Tech Startup",
            content: "ROTA não é apenas corrida, é networking de alto nível. Fechei 3 parcerias através da Confraria.",
            avatar: "/images/lider-experiente.jpg",
            rating: 5
        },
        {
            author: "Julia Santos",
            role: "Atleta Profissional",
            content: "A comunidade é incrivelmente engajada. Encontrei treinos, motivação e amizades verdadeiras.",
            avatar: "/images/dupla-vitoria.jpg",
            rating: 5
        },
        {
            author: "Roberto Lima",
            role: "Empresário",
            content: "Os eventos são impecavelmente organizados. Segurança, estrutura e experiência de outro nível.",
            avatar: "/images/atleta-estiloso.jpg",
            rating: 5
        }
    ];

    const faqs = [
        {
            question: "Como funciona o sistema de pontos e patentes?",
            answer: "Você ganha pontos ao completar eventos, interagir com a comunidade, alcançar metas e convites amigos. Conforme acumula pontos, sobe de patente (Bronze → Prata → Ouro → Platina → Diamante → Elite), desbloqueando benefícios exclusivos em cada nível."
        },
        {
            question: "Posso cancelar minha assinatura quando quiser?",
            answer: "Sim! Sem fidelidade, sem multas. Cancele quando quiser e seu acesso continua até o fim do período pago."
        },
        {
            question: "O que é a Confraria Business?",
            answer: "É um grupo fechado para membros Elite focado em networking empresarial. Encontros mensais presenciais, eventos exclusivos e conexões com outros líderes e empreendedores de sucesso."
        },
        {
            question: "Como funciona o desconto em eventos?",
            answer: "Membros Pro recebem 30% de desconto automático em todas as inscrições de eventos. Membros Elite têm desconto ainda maior e acesso prioritário a eventos limitados."
        },
        {
            question: "Vocês têm garantia de reembolso?",
            answer: "Sim! Garantia incondicional de 7 dias. Se não ficar satisfeito, devolvemos 100% do valor investido, sem perguntas."
        }
    ];

    const milestones = [
        { year: "2018", event: "Fundação ROTA", description: "Primeiro evento com 50 atletas" },
        { year: "2020", event: "1.000 Membros", description: "Comunidade alcança marca histórica" },
        { year: "2022", event: "Confraria Business", description: "Lançamento do networking elite" },
        { year: "2024", event: "10K+ Atletas", description: "Maior comunidade do Brasil" },
        { year: "2026", event: "Expansão Nacional", description: "89 cidades alcançadas" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
            {/* HEADER DASHBOARD STYLE */}
            <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                ROTA
                            </h1>
                            <nav className="hidden md:flex gap-6 text-sm font-semibold">
                                <a href="#feed" className="text-amber-400">Feed</a>
                                <a href="#eventos" className="text-gray-400 hover:text-white transition-colors">Eventos</a>
                                <a href="#ranking" className="text-gray-400 hover:text-white transition-colors">Ranking</a>
                                <a href="#sobre" className="text-gray-400 hover:text-white transition-colors">Sobre</a>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                                ENTRAR
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* HERO com LIVE STATS */}
            <section className="py-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full mb-4">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold text-green-400">AO VIVO AGORA</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Bem-vindo à Comunidade
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500"> ROTA</span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            12.4K atletas transformando limites em conquistas
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {liveStats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-4 bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm hover:bg-gray-800 transition-colors"
                            >
                                <div className={`p-3 bg-gray-700/50 rounded-xl ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                                    <div className="text-xs text-gray-400 font-semibold">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT - 3 COLUMNS LAYOUT */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT SIDEBAR - EVENTOS & FEATURES */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* Próximos Eventos */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-amber-400" />
                                Próximos Eventos
                            </h3>

                            <div className="space-y-4">
                                {upcomingEvents.map((event, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative h-32 rounded-2xl overflow-hidden mb-3">
                                            <Image
                                                src={event.image}
                                                alt={event.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 rounded-full text-xs font-black">
                                                {event.date}
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <div className="text-sm font-black mb-1">{event.title}</div>
                                                <div className="text-xs text-gray-300 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {event.location}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {event.participants} inscritos
                                            </span>
                                            <span className="text-amber-400 font-semibold">{event.category}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                                VER TODOS OS EVENTOS
                            </button>
                        </div>

                        {/* Features */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700">
                            <h3 className="text-lg font-black mb-4">Por que ROTA?</h3>
                            <div className="space-y-4">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="p-2 bg-amber-500/10 rounded-lg">
                                            <feature.icon className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm mb-1">{feature.title}</div>
                                            <div className="text-xs text-gray-400">{feature.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER - FEED DE ATIVIDADES */}
                    <main className="lg:col-span-6 space-y-6">
                        {/* Post Creator */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black">
                                    VC
                                </div>
                                <input
                                    type="text"
                                    placeholder="Compartilhe sua conquista com a comunidade..."
                                    className="flex-1 bg-gray-700/50 rounded-full px-6 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button className="p-3 bg-amber-500 rounded-full hover:bg-amber-600 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Feed Posts */}
                        {communityPosts.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden border border-gray-700"
                            >
                                {/* Post Header */}
                                <div className="p-6 pb-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-amber-500">
                                                <Image
                                                    src={post.avatar}
                                                    alt={post.author}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-xs font-black">
                                                {post.rank === 'Elite' && '👑'}
                                                {post.rank === 'Diamante' && '💎'}
                                                {post.rank === 'Platina' && '🔷'}
                                                {post.rank === 'Ouro' && '🏆'}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-black text-white">{post.author}</div>
                                            <div className="text-sm text-gray-400">{post.rank} • {post.time}</div>
                                        </div>

                                        <button className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-sm font-bold hover:bg-amber-500/20 transition-colors">
                                            Seguir
                                        </button>
                                    </div>

                                    <p className="text-gray-200 leading-relaxed">{post.content}</p>
                                </div>

                                {/* Post Image */}
                                <div className="relative h-96">
                                    <Image
                                        src={post.image}
                                        alt="Post"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Post Actions */}
                                <div className="p-6 pt-4">
                                    <div className="flex items-center gap-6 mb-4">
                                        <button
                                            onClick={() => toggleLike(post.id)}
                                            className={`flex items-center gap-2 transition-colors ${likedPosts.includes(post.id)
                                                ? 'text-red-500'
                                                : 'text-gray-400 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart className={`w-6 h-6 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                                            <span className="font-bold">
                                                {likedPosts.includes(post.id) ? post.likes + 1 : post.likes}
                                            </span>
                                        </button>

                                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                                            <MessageCircle className="w-6 h-6" />
                                            <span className="font-bold">{post.comments}</span>
                                        </button>

                                        <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                                            <Share2 className="w-6 h-6" />
                                            <span className="font-bold">{post.shares}</span>
                                        </button>

                                        <button className="ml-auto text-gray-400 hover:text-amber-400 transition-colors">
                                            <Award className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="text-sm text-gray-400">
                                        Ver todos os {post.comments} comentários
                                    </div>
                                </div>
                            </motion.article>
                        ))}

                        <button className="w-full py-4 bg-gray-800/50 rounded-2xl font-bold text-gray-400 hover:bg-gray-700/50 transition-colors">
                            CARREGAR MAIS POSTS
                        </button>
                    </main>

                    {/* RIGHT SIDEBAR - RANKING & CTA */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* Top Atletas */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700 sticky top-24">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-400" />
                                Top Atletas ROTA
                            </h3>

                            <div className="space-y-4">
                                {topLegendarios.map((user, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-3 group cursor-pointer"
                                    >
                                        <div className="text-xl font-black text-gray-600 w-6">
                                            #{idx + 1}
                                        </div>

                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-amber-500/50 group-hover:ring-amber-500 transition-all">
                                                <Image
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                            {idx === 0 && (
                                                <div className="absolute -top-1 -right-1 text-lg">🥇</div>
                                            )}
                                            {idx === 1 && (
                                                <div className="absolute -top-1 -right-1 text-lg">🥈</div>
                                            )}
                                            {idx === 2 && (
                                                <div className="absolute -top-1 -right-1 text-lg">🥉</div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-sm group-hover:text-amber-400 transition-colors">
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-gray-500">{user.rank}</div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-black text-amber-400">
                                                {user.points.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">pts</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-xl font-bold text-sm text-amber-400 hover:bg-amber-500/30 transition-colors">
                                VER RANKING COMPLETO
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            {/* NOSSA HISTÓRIA / TIMELINE */}
            <section className="py-32 bg-gradient-to-b from-black to-gray-900">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Nossa
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600"> Jornada</span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            De 50 atletas a 12 mil. Uma história de superação coletiva.
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        {milestones.map((milestone, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="flex gap-8 mb-12 relative"
                            >
                                {/* Timeline Line */}
                                {idx !== milestones.length - 1 && (
                                    <div className="absolute left-[60px] top-16 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 to-transparent" />
                                )}

                                <div className="flex-shrink-0 w-32">
                                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                        {milestone.year}
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-4 top-2 w-4 h-4 bg-amber-500 rounded-full ring-4 ring-amber-500/20" />
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                                        <h3 className="text-2xl font-black mb-2">{milestone.event}</h3>
                                        <p className="text-gray-400">{milestone.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DEPOIMENTOS */}
            <section className="py-32 bg-black">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            O Que Dizem
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600"> Nossos Atletas</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700"
                            >
                                <div className="flex gap-1 mb-6">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>

                                <p className="text-lg text-gray-300 mb-8 leading-relaxed italic">
                                    "{testimonial.content}"
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden">
                                        <Image
                                            src={testimonial.avatar}
                                            alt={testimonial.author}
                                            width={48}
                                            height={48}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold">{testimonial.author}</div>
                                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PLANOS */}
            <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Escolha Seu
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600"> Plano</span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            Sem compromisso. Cancele quando quiser.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className={`relative rounded-3xl p-8 ${plan.popular
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 scale-105'
                                    : 'bg-gray-800/50 border border-gray-700'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black rounded-full text-sm font-black">
                                        MAIS POPULAR
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className={`text-2xl font-black mb-6 ${plan.popular ? 'text-white' : 'text-white'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-end justify-center gap-1 mb-2">
                                        <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-white'}`}>
                                            {plan.price}
                                        </span>
                                        <span className={`text-lg mb-2 ${plan.popular ? 'text-white/80' : 'text-gray-400'}`}>
                                            {plan.period}
                                        </span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-white' : 'text-amber-400'
                                                }`} />
                                            <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-300'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-full font-bold transition-all ${plan.popular
                                    ? 'bg-black text-white hover:bg-gray-900'
                                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-105'
                                    }`}>
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-32 bg-black">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Perguntas
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600"> Frequentes</span>
                        </h2>
                    </motion.div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
                                >
                                    <span className="text-lg font-bold pr-8">{faq.question}</span>
                                    {openFaq === idx ? (
                                        <Minus className="w-6 h-6 text-amber-400 flex-shrink-0" />
                                    ) : (
                                        <Plus className="w-6 h-6 text-amber-400 flex-shrink-0" />
                                    )}
                                </button>

                                {openFaq === idx && (
                                    <div className="px-8 pb-6">
                                        <p className="text-gray-400 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-40 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image
                        src="/images/lider-multidao-sunset.jpg"
                        alt="Background"
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
                            Pronto Para
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600">
                                Transformar Sua Vida?
                            </span>
                        </h2>

                        <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                            Junte-se a 12.4K atletas e comece sua jornada épica hoje
                        </p>

                        <button className="group relative px-12 py-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-black text-xl overflow-hidden hover:scale-105 transition-transform inline-flex items-center gap-3">
                            <span className="relative z-10">CRIAR CONTA GRÁTIS</span>
                            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <p className="text-sm text-gray-500 mt-6">
                            Sem cartão de crédito necessário • Cancele quando quiser
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-black border-t border-gray-800 py-16">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="text-3xl font-black mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                ROTA
                            </div>
                            <p className="text-gray-400 text-sm mb-6">
                                A maior comunidade de atletas do Brasil.
                            </p>
                            <div className="flex gap-4">
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-black mb-4">PLATAFORMA</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-amber-400 transition-colors">Feed</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition-colors">Eventos</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition-colors">Ranking</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition-colors">Conquistas</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black mb-4">EMPRESA</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-amber-400 transition-colors">Sobre</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition-colors">Carreiras</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition-colors">Termos</a></li>
                                <li><a href="#" className="hover:text-amber-400 transition-colors">Privacidade</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black mb-4">CONTATO</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-amber-400" />
                                    contato@rota.com
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-amber-400" />
                                    (11) 99999-9999
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                        <p>© 2026 Rota Business Club. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* FLOATING CTA */}
            <div className="fixed bottom-8 right-8 z-50">
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full font-black shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
                >
                    <Flame className="w-5 h-5" />
                    CRIAR CONTA GRÁTIS
                </motion.button>
            </div>
        </div>
    );
}
