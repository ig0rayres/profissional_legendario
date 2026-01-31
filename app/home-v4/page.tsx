'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Calendar, MapPin, Users, Trophy, ChevronDown, Play, Star, Zap,
    Target, Award, TrendingUp, CheckCircle2, ArrowRight, Shield,
    Rocket, Heart, MessageCircle, Clock, MapPinned, Plus, Minus,
    Facebook, Instagram, Linkedin, Mail, Phone
} from 'lucide-react';

export default function HomeV4() {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const stats = [
        { label: "ATLETAS ROTA", value: "12.4K+", icon: Users },
        { label: "EVENTOS REALIZADOS", value: "237", icon: Calendar },
        { label: "DESAFIOS CONQUISTADOS", value: "45.9K", icon: Trophy },
        { label: "CIDADES ALCANÇADAS", value: "89", icon: MapPin }
    ];

    const events = [
        {
            title: "RETO #1079",
            location: "Vale do Sol, Ribeirão Preto-SP",
            date: "3-6 JUL 2025",
            participants: 2847,
            image: "/fotos-rota/TOP 1079 (1094).jpg",
            status: "ÉPICO"
        },
        {
            title: "Trail dos Pioneiros",
            location: "Serra da Mantiqueira",
            date: "15-18 AGO 2025",
            participants: 1235,
            image: "/fotos-rota/TOP 1079 (6401).jpg",
            status: "INSCRIÇÕES ABERTAS"
        },
        {
            title: "Desafio Noturno",
            location: "Campos do Jordão",
            date: "22-25 SET 2025",
            participants: 890,
            image: "/fotos-rota/TOP 1079 (5628).jpg",
            status: "EM BREVE"
        }
    ];

    const howItWorks = [
        {
            step: "01",
            title: "Crie sua Conta",
            description: "Cadastre-se gratuitamente e complete seu perfil de atleta em menos de 2 minutos.",
            icon: Users
        },
        {
            step: "02",
            title: "Escolha seu Desafio",
            description: "Navegue pelos eventos disponíveis e encontre o desafio perfeito para seu nível.",
            icon: Target
        },
        {
            step: "03",
            title: "Prepare-se",
            description: "Acesse treinos exclusivos, dicas de preparação e conecte-se com outros atletas.",
            icon: Zap
        },
        {
            step: "04",
            title: "Conquiste",
            description: "Participe do evento, supere seus limites e celebre sua conquista épica!",
            icon: Trophy
        }
    ];

    const testimonials = [
        {
            quote: "A experiência mais transformadora da minha vida. Descobri que sou capaz de muito mais do que imaginava.",
            author: "Rafael Costa",
            role: "Membro Platina",
            image: "/fotos-rota/TOP 1079 (4251).jpg",
            rating: 5
        },
        {
            quote: "Não é apenas sobre correr. É sobre se tornar parte de uma comunidade que te eleva todos os dias.",
            author: "Marina Silva",
            role: "Membro Diamante",
            image: "/fotos-rota/TOP 1079 (6401).jpg",
            rating: 5
        },
        {
            quote: "Cada quilômetro percorrido é uma prova de que limites são apenas mentais. ROTA mudou minha vida.",
            author: "Lucas Mendes",
            role: "Membro Elite",
            image: "/fotos-rota/TOP 1079 (1126).jpg",
            rating: 5
        }
    ];

    const plans = [
        {
            name: "Recruta",
            price: "Grátis",
            period: "",
            description: "Para conhecer a plataforma",
            features: [
                "Acesso ao feed da comunidade",
                "Multiplicador de VIGOR: x1.0",
                "Até 10 elos (conexões)",
                "Pode receber convites de confraria",
                "Sem anúncios no marketplace"
            ],
            cta: "Começar Grátis",
            highlighted: false
        },
        {
            name: "Veterano",
            price: "R$ 97",
            period: "/mês",
            description: "Para profissionais comprometidos",
            features: [
                "Tudo do plano Recruta",
                "Multiplicador de VIGOR: x1.5",
                "Até 100 elos (conexões)",
                "4 convites de confraria/mês",
                "2 anúncios no marketplace",
                "Acesso a projetos exclusivos",
                "Badge de verificação"
            ],
            cta: "Assinar Veterano",
            highlighted: false
        },
        {
            name: "Elite",
            price: "R$ 127",
            period: "/mês",
            description: "Networking de alto nível",
            features: [
                "Tudo do plano Veterano",
                "Multiplicador de VIGOR: x3.0",
                "Elos ilimitados",
                "10 convites de confraria/mês",
                "10 anúncios no marketplace",
                "Acesso à Confraria Business",
                "Projetos premium",
                "Eventos VIP exclusivos"
            ],
            cta: "Tornar-se Elite",
            highlighted: true
        },
        {
            name: "Lendário",
            price: "R$ 247",
            period: "/mês",
            description: "O nível máximo de excelência",
            features: [
                "Tudo do plano Elite",
                "Multiplicador de VIGOR: x5.0",
                "Elos ilimitados",
                "Convites ilimitados",
                "Anúncios ilimitados",
                "Mentoria individual",
                "Acesso antecipado a eventos",
                "Network com líderes"
            ],
            cta: "Ser Lendário",
            highlighted: false
        }
    ];

    const faqs = [
        {
            question: "Como funciona o sistema de patentes?",
            answer: "Nosso sistema de patentes reconhece sua evolução na plataforma. Você ganha pontos participando de eventos, completando desafios e interagindo com a comunidade. Cada patente (Bronze, Prata, Ouro, Platina, Diamante, Elite) desbloqueia benefícios exclusivos."
        },
        {
            question: "Posso cancelar minha assinatura a qualquer momento?",
            answer: "Sim! Você tem total liberdade para cancelar quando quiser. Não há multas ou taxas de cancelamento. Seu acesso continua até o fim do período pago."
        },
        {
            question: "Os eventos são para todos os níveis?",
            answer: "Absolutamente! Temos eventos para iniciantes até atletas experientes. Cada evento indica claramente o nível de dificuldade e requisitos para você escolher o ideal."
        },
        {
            question: "Como funciona a Confraria Business?",
            answer: "É um grupo exclusivo para membros Elite focado em networking de alto nível. Realizamos encontros mensais, eventos empresariais e oportunidades de conexão entre líderes e empreendedores."
        },
        {
            question: "Vocês oferecem reembolso?",
            answer: "Sim! Oferecemos garantia de 7 dias. Se você não ficar satisfeito com qualquer plano pago, devolvemos 100% do valor investido, sem complicações."
        }
    ];

    const partners = [
        { name: "Nike", logo: "🏃" },
        { name: "Garmin", logo: "⌚" },
        { name: "Gatorade", logo: "🥤" },
        { name: "Oakley", logo: "🕶️" },
        { name: "Under Armour", logo: "👕" },
        { name: "Polar", logo: "📱" }
    ];

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* HERO CINEMATOGRÁFICO */}
            <section className="relative h-screen overflow-hidden">
                <motion.div
                    style={{ scale }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/fotos-rota/TOP 1079 (1094).jpg"
                        alt="Comunidade ROTA ao amanhecer"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Blur overlays para ocultar marcas d'água */}
                    <div className="absolute top-0 right-0 w-32 h-24 bg-gradient-to-bl from-black/40 via-black/20 to-transparent backdrop-blur-md" />
                    <div className="absolute bottom-0 left-0 w-48 h-20 bg-gradient-to-tr from-black/50 via-black/20 to-transparent backdrop-blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </motion.div>

                <motion.div
                    style={{ opacity }}
                    className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4D40]/30 border border-[#2d7a65]/50 rounded-full mb-6 backdrop-blur-sm"
                    >
                        <Zap className="w-4 h-4 text-[#3fa889]" />
                        <span className="text-sm font-semibold text-[#4dbf9a]">SEJA EXTRAORDINÁRIO</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-6xl md:text-8xl font-black mb-6 leading-tight"
                    >
                        DESAFIE SEUS
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 via-#2d7a65 to-#1a5c4a">
                            LIMITES
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-12 leading-relaxed"
                    >
                        Junte-se a mais de 12 mil atletas que transformaram o impossível em conquista.
                        <br />
                        <span className="text-#3fa889 font-semibold">Esta é a sua hora de brilhar.</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.9 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-[#1E4D40] to-#1E4D40 rounded-full font-bold text-lg overflow-hidden hover:scale-105 transition-transform">
                            <span className="relative z-10">COMEÇAR JORNADA</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-#1E4D40 to-#1a5c4a opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <button className="group px-8 py-4 border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2 justify-center">
                            <Play className="w-5 h-5" />
                            VER HISTÓRIA
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2"
                    >
                        <ChevronDown className="w-8 h-8 animate-bounce text-#3fa889" />
                    </motion.div>
                </motion.div>
            </section>

            {/* STATS BANNER */}
            <section className="relative py-24 bg-gradient-to-b from-black via-gray-900 to-black">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'url(/noise.png)' }} />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center group cursor-pointer"
                            >
                                <div className="mb-4 inline-flex p-4 bg-gradient-to-br from-[#1E4D40]/30 to-#1E4D40/20 rounded-2xl group-hover:scale-110 transition-transform">
                                    <stat.icon className="w-8 h-8 text-#3fa889" />
                                </div>
                                <div className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#2d7a65">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-400 font-semibold tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SOBRE / MISSÃO */}
            <section className="py-32 bg-black relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-#2d7a65/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4D40]/20 border border-#2d7a65/30 rounded-full mb-6">
                                <Heart className="w-4 h-4 text-#3fa889" />
                                <span className="text-sm font-semibold text-#3fa889">NOSSA MISSÃO</span>
                            </div>

                            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                                Transformando
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#1a5c4a"> Vidas </span>
                                Através do Movimento
                            </h2>

                            <p className="text-xl text-gray-400 mb-6 leading-relaxed">
                                Somos mais que uma plataforma de eventos. Somos uma comunidade apaixonada por superação,
                                onde cada atleta encontra seu propósito e descobre que é capaz de muito mais.
                            </p>

                            <p className="text-lg text-gray-500 mb-8">
                                Desde 2018, criamos experiências que combinam desafio físico, conexão humana e crescimento pessoal.
                                Cada evento é desenhado para te tirar da zona de conforto e te mostrar a versão mais forte de você mesmo.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-#3fa889 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold mb-1">Eventos Épicos</div>
                                        <div className="text-sm text-gray-500">Experiências inesquecíveis</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-#3fa889 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold mb-1">Comunidade Ativa</div>
                                        <div className="text-sm text-gray-500">12.4K+ atletas conectados</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-#3fa889 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold mb-1">Segurança Total</div>
                                        <div className="text-sm text-gray-500">Equipes especializadas</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-#3fa889 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold mb-1">Resultados Reais</div>
                                        <div className="text-sm text-gray-500">45.9K conquistas</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative h-64 rounded-2xl overflow-hidden">
                                    <Image
                                        src="/fotos-rota/TOP 1079 (5425).jpg"
                                        alt="Networking em roda"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-0 right-0 w-20 h-16 bg-gradient-to-bl from-black/40 to-transparent backdrop-blur-md" />
                                </div>
                                <div className="relative h-64 rounded-2xl overflow-hidden mt-8">
                                    <Image
                                        src="/fotos-rota/TOP 1079 (2302).jpg"
                                        alt="Comunidade com bandeiras"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-0 right-0 w-20 h-16 bg-gradient-to-bl from-black/40 to-transparent backdrop-blur-md" />
                                    <div className="absolute bottom-0 left-0 w-32 h-14 bg-gradient-to-tr from-black/50 to-transparent backdrop-blur-sm" />
                                </div>
                                <div className="relative h-64 rounded-2xl overflow-hidden -mt-8">
                                    <Image
                                        src="/fotos-rota/TOP 1079 (1126).jpg"
                                        alt="Atleta focado"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-0 right-0 w-20 h-16 bg-gradient-to-bl from-black/40 to-transparent backdrop-blur-md" />
                                </div>
                                <div className="relative h-64 rounded-2xl overflow-hidden">
                                    <Image
                                        src="/fotos-rota/TOP 1079 (1082).jpg"
                                        alt="Líder épico"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-0 right-0 w-20 h-16 bg-gradient-to-bl from-black/40 to-transparent backdrop-blur-md" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* COMO FUNCIONA */}
            <section className="py-32 bg-gradient-to-b from-black to-gray-900">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4D40]/20 border border-#2d7a65/30 rounded-full mb-6">
                            <Rocket className="w-4 h-4 text-#3fa889" />
                            <span className="text-sm font-semibold text-#3fa889">PASSO A PASSO</span>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            Como
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#1a5c4a"> Funciona</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Em 4 passos simples, você começa sua jornada de transformação
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Linha conectora */}
                        <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-#2d7a65/20 via-#2d7a65/20 to-#2d7a65/20" />

                        {howItWorks.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="relative text-center"
                            >
                                <div className="relative inline-flex mb-6">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1E4D40] to-#1E4D40 flex items-center justify-center relative z-10">
                                        <item.icon className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-black rounded-full flex items-center justify-center border-2 border-#2d7a65">
                                        <span className="text-xl font-black text-#3fa889">{item.step}</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRÓXIMOS EVENTOS */}
            <section className="py-32 bg-black relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-#2d7a65/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-#2d7a65/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            PRÓXIMOS
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#1a5c4a"> DESAFIOS</span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            Eventos que irão redefinir o que você acredita ser possível
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {events.map((event, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="group relative overflow-hidden rounded-3xl cursor-pointer"
                            >
                                <div className="relative h-[500px]">
                                    <Image
                                        src={event.image}
                                        alt={event.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <div className="inline-block px-4 py-2 bg-#2d7a65/90 backdrop-blur-sm rounded-full text-xs font-black mb-4">
                                        {event.status}
                                    </div>

                                    <h3 className="text-3xl font-black mb-3 group-hover:text-#3fa889 transition-colors">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-2 text-gray-300 mb-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-#3fa889" />
                                            <span className="text-sm">{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-#3fa889" />
                                            <span className="text-sm">{event.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-#3fa889" />
                                            <span className="text-sm">{event.participants.toLocaleString()} Participantes</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full font-bold group-hover:bg-#2d7a65 group-hover:border-#2d7a65 transition-all">
                                        INSCREVER-SE
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GALERIA */}
            <section className="py-32 bg-gradient-to-b from-black to-gray-900">
                <div className="container mx-auto px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-6xl font-black text-center mb-16"
                    >
                        MOMENTOS QUE
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#1a5c4a"> INSPIRAM</span>
                    </motion.h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            '/images/celebracao-agua.jpg',
                            '/images/piloto-drone-fpv.jpg',
                            '/images/dupla-topo.jpg',
                            '/images/fotografo-acao.jpg',
                            '/images/grupo-mata.jpg',
                            '/images/coordenador-radio.jpg',
                            '/images/atleta-closeup.jpg',
                            '/images/locomotiva-8187.jpg'
                        ].map((img, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
                            >
                                <Image
                                    src={img}
                                    alt={`Gallery ${idx + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DEPOIMENTOS */}
            <section className="py-32 bg-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <Image src="/fotos-rota/TOP 1079 (5628).jpg" alt="BG" fill className="object-cover" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-6xl font-black text-center mb-20"
                    >
                        VOZES DO
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#1a5c4a"> MOVIMENTO</span>
                    </motion.h2>

                    <div className="max-w-4xl mx-auto">
                        {testimonials.map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: activeTestimonial === idx ? 1 : 0 }}
                                className={`${activeTestimonial === idx ? 'block' : 'hidden'}`}
                            >
                                <div className="flex flex-col md:flex-row items-center gap-12">
                                    <div className="relative w-64 h-64 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.author}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 ring-4 ring-#2d7a65/50 ring-offset-4 ring-offset-black rounded-full" />
                                    </div>

                                    <div>
                                        <div className="flex gap-1 mb-6">
                                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                <Star key={i} className="w-6 h-6 text-#3fa889 fill-#3fa889" />
                                            ))}
                                        </div>
                                        <p className="text-2xl md:text-3xl font-light italic mb-8 leading-relaxed text-gray-300">
                                            "{testimonial.quote}"
                                        </p>
                                        <div>
                                            <div className="text-xl font-bold text-white mb-1">{testimonial.author}</div>
                                            <div className="text-#3fa889 font-semibold">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="flex justify-center gap-3 mt-12">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTestimonial(idx)}
                                    className={`w-3 h-3 rounded-full transition-all ${activeTestimonial === idx
                                        ? 'bg-#2d7a65 w-12'
                                        : 'bg-white/30 hover:bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* PLANOS E PREÇOS */}
            <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-black mb-6">
                            ESCOLHA SEU
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#1a5c4a"> PLANO</span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            Invista na sua evolução. Cancele quando quiser.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className={`relative rounded-3xl p-8 ${plan.highlighted
                                    ? 'bg-gradient-to-br from-[#1E4D40] to-#1E4D40 scale-105'
                                    : 'bg-gray-800/50 border border-gray-700'
                                    }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black rounded-full text-sm font-black">
                                        MAIS POPULAR
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className={`text-2xl font-black mb-2 ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/80' : 'text-gray-400'}`}>
                                        {plan.description}
                                    </p>
                                    <div className="flex items-end justify-center gap-1">
                                        <span className={`text-5xl font-black ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                                            {plan.price}
                                        </span>
                                        <span className={`text-lg mb-2 ${plan.highlighted ? 'text-white/80' : 'text-gray-400'}`}>
                                            {plan.period}
                                        </span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-[#4dbf9a]' : 'text-#3fa889'
                                                }`} />
                                            <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-300'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-full font-bold transition-all ${plan.highlighted
                                    ? 'bg-black text-white hover:bg-gray-900'
                                    : 'bg-gradient-to-r from-[#1E4D40] to-#1E4D40 text-white hover:scale-105'
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
                            PERGUNTAS
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#1a5c4a"> FREQUENTES</span>
                        </h2>
                        <p className="text-xl text-gray-400">
                            Tudo que você precisa saber
                        </p>
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
                                        <Minus className="w-6 h-6 text-#3fa889 flex-shrink-0" />
                                    ) : (
                                        <Plus className="w-6 h-6 text-#3fa889 flex-shrink-0" />
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

            {/* PARCEIROS */}
            <section className="py-24 bg-gradient-to-b from-black to-gray-900">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h3 className="text-2xl font-black text-gray-400 mb-8">MARCAS QUE CONFIAM EM NÓS</h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-50 hover:opacity-100 transition-opacity">
                            {partners.map((partner, idx) => (
                                <div key={idx} className="text-6xl text-center">
                                    {partner.logo}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-32 bg-black relative overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/fotos-rota/TOP 1079 (1094).jpg"
                        alt="Comunidade ROTA"
                        fill
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                            PRONTO PARA SE TORNAR
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-#3fa889 to-#1a5c4a">
                                EXTRAORDINÁRIO?
                            </span>
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                            Junte-se a milhares de atletas que já transformaram suas vidas.
                            Sua jornada começa agora.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-10 py-5 bg-gradient-to-r from-[#1E4D40] to-#1E4D40 rounded-full font-bold text-xl hover:scale-105 transition-transform">
                                COMEÇAR AGORA
                            </button>
                            <button className="px-10 py-5 border-2 border-white/30 rounded-full font-bold text-xl hover:bg-white/10 transition-all">
                                FALAR COM ESPECIALISTA
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-900 py-16">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h4 className="text-xl font-black mb-6 text-#3fa889">ROTA BUSINESS</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                O Acampamento Base do Homem de Negócios.
                                Transformando vidas através do movimento desde 2018.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4">NAVEGAÇÃO</h5>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-#3fa889 transition-colors">Sobre Nós</a></li>
                                <li><a href="#" className="hover:text-#3fa889 transition-colors">Eventos</a></li>
                                <li><a href="#" className="hover:text-#3fa889 transition-colors">Comunidade</a></li>
                                <li><a href="#" className="hover:text-#3fa889 transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4">SUPORTE</h5>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-#3fa889 transition-colors">FAQ</a></li>
                                <li><a href="#" className="hover:text-#3fa889 transition-colors">Contato</a></li>
                                <li><a href="#" className="hover:text-#3fa889 transition-colors">Termos de Uso</a></li>
                                <li><a href="#" className="hover:text-#3fa889 transition-colors">Privacidade</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4">REDES SOCIAIS</h5>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-#2d7a65 transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-#2d7a65 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-#2d7a65 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                        © 2026 Rota Business Club. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}
