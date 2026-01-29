'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight, Circle, Sparkles, TrendingUp, Award, Users,
    CheckCircle2, Star, Shield, Zap, Target, BarChart3,
    Phone, Mail, MapPinned, Instagram, Facebook, Linkedin,
    Plus, Minus, Clock, Globe
} from 'lucide-react';

export default function HomeV3() {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 20 - 10,
                y: (e.clientY / window.innerHeight) * 20 - 10
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 4);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const eliteExperiences = [
        {
            title: "RETO #1079",
            subtitle: "Vale do Sol Experience",
            description: "Uma jornada cinematográfica através dos trilhos históricos que moldaram o Brasil.",
            image: "/images/locomotiva-8187.jpg",
            metrics: { participants: "2.8K", distance: "187km", elevation: "4.2K" }
        },
        {
            title: "Confraria Elite",
            subtitle: "Networking & Performance",
            description: "Onde líderes se encontram para transcender limites empresariais e pessoais.",
            image: "/images/confraria-networking.jpg",
            metrics: { participants: "189", distance: "42km", elevation: "890m" }
        },
        {
            title: "Desafio Noturno",
            subtitle: "Beneath the Stars",
            description: "Uma experiência sensorial única sob o céu da Serra da Mantiqueira.",
            image: "/images/noturna-bandeiras-bw.jpg",
            metrics: { participants: "890", distance: "50km", elevation: "2.1K" }
        },
        {
            title: "Trail dos Pioneiros",
            subtitle: "Mountain Odyssey",
            description: "Conquiste os picos mais desafiadores em uma expedição transformadora.",
            image: "/images/hero-mountain.jpg",
            metrics: { participants: "1.2K", distance: "120km", elevation: "6.7K" }
        }
    ];

    const exclusivePerks = [
        {
            icon: "🏆",
            title: "Patentes Exclusivas",
            description: "Sistema progressivo de reconhecimento elite com benefícios crescentes"
        },
        {
            icon: "🌟",
            title: "Acesso VIP",
            description: "Eventos fechados e experiências premium reservadas para membros"
        },
        {
            icon: "📊",
            title: "Analytics Avançado",
            description: "Métricas de performance de nível profissional em tempo real"
        },
        {
            icon: "🤝",
            title: "Networking Premium",
            description: "Conexões estratégicas com líderes e atletas de elite"
        }
    ];

    const philosophy = [
        {
            number: "01",
            title: "Excelência",
            description: "Buscamos a perfeição em cada detalhe, do planejamento à execução.",
            icon: Star
        },
        {
            number: "02",
            title: "Comunidade",
            description: "Cultivamos conexões autênticas que transcendem o esporte.",
            icon: Users
        },
        {
            number: "03",
            title: "Inovação",
            description: "Reinventamos a experiência atlética com tecnologia e criatividade.",
            icon: Zap
        },
        {
            number: "04",
            title: "Integridade",
            description: "Transparência, segurança e ética em tudo que fazemos.",
            icon: Shield
        }
    ];

    const gallery = [
        { src: "/images/lider-multidao-sunset.jpg", span: "col-span-2 row-span-2" },
        { src: "/images/atleta-focado.jpg", span: "col-span-1 row-span-1" },
        { src: "/images/dupla-vitoria.jpg", span: "col-span-1 row-span-1" },
        { src: "/images/celebracao-agua.jpg", span: "col-span-1 row-span-2" },
        { src: "/images/grupo-mata.jpg", span: "col-span-1 row-span-1" },
        { src: "/images/piloto-drone-fpv.jpg", span: "col-span-1 row-span-1" },
        { src: "/images/atleta-estiloso.jpg", span: "col-span-2 row-span-1" }
    ];

    const testimonials = [
        {
            author: "Alexandre Ferreira",
            role: "CEO Tech Unicorn",
            content: "ROTA redefiniu meu conceito de networking. As conexões que fiz aqui geraram R$ 2M em negócios.",
            avatar: "/images/lider-experiente.jpg",
            rating: 5
        },
        {
            author: "Isabela Rodrigues",
            role: "CMO Fortune 500",
            content: "Não é apenas sobre fitness. É sobre fazer parte de uma elite que entende performance em todas as áreas.",
            avatar: "/images/dupla-vitoria.jpg",
            rating: 5
        },
        {
            author: "Fernando Alves",
            role: "Investidor Anjo",
            content: "A curadoria dos eventos é impecável. Cada experiência é meticulosamente desenhada para surpreender.",
            avatar: "/images/atleta-estiloso.jpg",
            rating: 5
        }
    ];

    const plans = [
        {
            name: "Explorer",
            price: "Grátis",
            period: "",
            description: "Para conhecer a plataforma",
            features: [
                "Acesso limitado ao feed",
                "1 evento por trimestre",
                "Estatísticas básicas"
            ],
            cta: "Começar",
            highlight: false
        },
        {
            name: "Professional",
            price: "R$ 97",
            period: "/mês",
            description: "Para atletas comprometidos",
            features: [
                "Acesso completo ao feed",
                "Eventos ilimitados com 30% off",
                "Sistema de patentes completo",
                "Analytics profissional",
                "Grupo exclusivo",
                "Support prioritário"
            ],
            cta: "Assinar Professional",
            highlight: true
        },
        {
            name: "Elite",
            price: "R$ 297",
            period: "/mês",
            description: "Experiência premium total",
            features: [
                "Tudo do Professional",
                "Confraria Business",
                "Eventos VIP exclusivos",
                "Mentoria individual",
                "Consultoria de performance",
                "Kit premium anual",
                "Acesso a parceiros premium"
            ],
            cta: "Tornar-se Elite",
            highlight: false
        }
    ];

    const faqs = [
        {
            question: "O que diferencia ROTA de outras plataformas?",
            answer: "ROTA é mais que eventos esportivos. Somos uma comunidade curada de profissionais de alta performance que entendem que excelência atlética e profissional andam juntas. Nossa curadoria rigorosa, eventos premium e networking estratégico criam uma experiência única no mercado."
        },
        {
            question: "Como funciona a Confraria Business?",
            answer: "Exclusiva para membros Elite, a Confraria Business é um ecossistema de networking de alto nível. Encontros mensais presenciais, eventos corporativos, mentorias em grupo e oportunidades de conexão com CEOs, investidores e líderes empresariais."
        },
        {
            question: "Qual o processo de curadoria dos eventos?",
            answer: "Cada evento passa por análise rigorosa de localização, segurança, experiência e valor agregado. Trabalhamos com os melhores fornecedores, equipes especializadas e tecnologia de ponta para garantir experiências memoráveis e seguras."
        },
        {
            question: "Posso pausar minha assinatura?",
            answer: "Sim. Membros Professional e Elite podem pausar a assinatura por até 3 meses por ano, mantendo seus benefícios e patente ao retornar."
        },
        {
            question: "Há garantia de satisfação?",
            answer: "Absolutamente. Oferecemos 14 dias de garantia incondicional. Se não ficar completamente satisfeito, devolvemos 100% do investimento, sem questionamentos."
        }
    ];

    const stats = [
        { value: "12.4K+", label: "Atletas de Elite", icon: Users },
        { value: "237", label: "Experiências Realizadas", icon: Award },
        { value: "89", label: "Cidades Alcançadas", icon: TrendingUp }
    ];

    const process = [
        {
            step: "01",
            title: "Cadastro Premium",
            description: "Preencha seu perfil detalhado e passe por nossa verificação de identidade."
        },
        {
            step: "02",
            title: "Escolha sua Experiência",
            description: "Navegue por eventos curados e selecione aqueles alinhados aos seus objetivos."
        },
        {
            step: "03",
            title: "Prepare-se com Excelência",
            description: "Acesse planos de treino personalizados e conecte-se com outros participantes."
        },
        {
            step: "04",
            title: "Viva a Transformação",
            description: "Participe do evento e celebre sua conquista com uma comunidade que te entende."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-black">
            {/* MINIMAL HEADER */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200/50">
                <div className="container mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-12">
                            <h1 className="text-2xl font-light tracking-tight">
                                <span className="font-black">ROTA</span>
                            </h1>
                            <nav className="hidden md:flex gap-8 text-sm tracking-wide">
                                <a href="#experiencias" className="hover:text-amber-600 transition-colors">Experiências</a>
                                <a href="#filosofia" className="hover:text-amber-600 transition-colors">Filosofia</a>
                                <a href="#comunidade" className="hover:text-amber-600 transition-colors">Comunidade</a>
                                <a href="#elite" className="hover:text-amber-600 transition-colors">Elite</a>
                            </nav>
                        </div>

                        <button className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-all">
                            Entrar
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO MINIMALISTA COM PARALLAX */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{ y }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/images/lider-multidao-sunset.jpg"
                        alt="Hero"
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white" />

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-8">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-900 tracking-wider">ELITE MEMBERSHIP</span>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-extralight mb-8 tracking-tighter leading-none">
                            Redefina
                            <br />
                            <span className="font-black italic">Excelência</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
                            Uma plataforma exclusiva onde atletas de elite transformam
                            <br />
                            limites em conquistas extraordinárias.
                        </p>

                        <button className="group inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full font-medium hover:bg-amber-600 transition-all">
                            <span>Começar Jornada</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs tracking-widest text-gray-400 flex items-center gap-2">
                    <Circle className="w-1 h-1 fill-current" />
                    <span>SCROLL PARA DESCOBRIR</span>
                </div>
            </section>

            {/* STATS ELEGANTE */}
            <section className="py-32 border-b border-gray-200">
                <div className="container mx-auto px-8">
                    <div className="grid md:grid-cols-3 gap-16">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2, duration: 0.8 }}
                                className="text-center group"
                            >
                                <div className="mb-6 inline-flex p-4 bg-gray-50 rounded-2xl group-hover:bg-amber-50 transition-colors">
                                    <stat.icon className="w-8 h-8 text-gray-400 group-hover:text-amber-600 transition-colors" />
                                </div>
                                <div className="text-6xl font-light mb-3 tracking-tight">{stat.value}</div>
                                <div className="text-sm text-gray-500 tracking-wider uppercase">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NOSSA FILOSOFIA */}
            <section className="py-32 bg-gray-50">
                <div className="container mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
                            Nossa
                            <span className="font-black italic"> Filosofia</span>
                        </h2>
                        <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
                            Quatro pilares que definem quem somos e como transformamos atletas em lendas
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {philosophy.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="group"
                            >
                                <div className="text-8xl font-light text-gray-200 group-hover:text-amber-100 transition-colors mb-4">
                                    {item.number}
                                </div>
                                <div className="mb-6 inline-flex p-3 bg-white rounded-xl group-hover:bg-amber-50 transition-colors">
                                    <item.icon className="w-6 h-6 text-gray-400 group-hover:text-amber-600 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-medium mb-3">{item.title}</h3>
                                <p className="text-gray-600 font-light leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* COMO FUNCIONA */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
                            Como
                            <span className="font-black italic"> Funciona</span>
                        </h2>
                        <p className="text-xl text-gray-600 font-light">
                            Seu caminho para a excelência em quatro etapas
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {process.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="flex items-start gap-8 group"
                            >
                                <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center border border-amber-200 group-hover:border-amber-400 transition-colors">
                                    <span className="text-3xl font-light text-amber-600">{item.step}</span>
                                </div>
                                <div className="flex-1 pt-4">
                                    <h3 className="text-2xl font-medium mb-3">{item.title}</h3>
                                    <p className="text-lg text-gray-600 font-light leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SLIDER DE EXPERIÊNCIAS */}
            <section className="py-32 bg-gray-50">
                <div className="container mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
                            Experiências
                            <span className="font-black italic"> Exclusivas</span>
                        </h2>
                        <p className="text-xl text-gray-600 font-light">
                            Cuidadosamente curadas para transcender o ordinário
                        </p>
                    </motion.div>

                    <div className="relative max-w-6xl mx-auto">
                        {eliteExperiences.map((exp, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: currentSlide === idx ? 1 : 0 }}
                                className={`${currentSlide === idx ? 'block' : 'hidden'}`}
                            >
                                <div className="grid md:grid-cols-2 gap-16 items-center">
                                    <div className="relative h-[600px] rounded-3xl overflow-hidden group">
                                        <Image
                                            src={exp.image}
                                            alt={exp.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <div className="text-xs tracking-widest text-amber-600 font-medium mb-4">
                                                {exp.subtitle}
                                            </div>
                                            <h3 className="text-5xl font-light mb-6 tracking-tight">
                                                {exp.title}
                                            </h3>
                                            <p className="text-xl text-gray-600 font-light leading-relaxed">
                                                {exp.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                                            <div>
                                                <div className="text-3xl font-light mb-1">{exp.metrics.participants}</div>
                                                <div className="text-xs text-gray-500 tracking-wider">ATLETAS</div>
                                            </div>
                                            <div>
                                                <div className="text-3xl font-light mb-1">{exp.metrics.distance}</div>
                                                <div className="text-xs text-gray-500 tracking-wider">DISTÂNCIA</div>
                                            </div>
                                            <div>
                                                <div className="text-3xl font-light mb-1">{exp.metrics.elevation}</div>
                                                <div className="text-xs text-gray-500 tracking-wider">ELEVAÇÃO</div>
                                            </div>
                                        </div>

                                        <button className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-amber-600 transition-all">
                                            <span>Explorar Experiência</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="flex justify-center gap-2 mt-12">
                            {eliteExperiences.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`transition-all ${currentSlide === idx
                                        ? 'w-12 h-2 bg-amber-600'
                                        : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                                        } rounded-full`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* GALERIA MINIMALISTA */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
                            Momentos
                            <span className="font-black italic"> Inesquecíveis</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-4 gap-4 auto-rows-[200px]">
                        {gallery.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className={`${item.span} relative rounded-2xl overflow-hidden group cursor-pointer`}
                            >
                                <Image
                                    src={item.src}
                                    alt={`Gallery ${idx + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DEPOIMENTOS */}
            <section className="py-32 bg-gray-50">
                <div className="container mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
                            Vozes da
                            <span className="font-black italic"> Elite</span>
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
                                className="bg-white rounded-3xl p-8 border border-gray-200"
                            >
                                <div className="flex gap-1 mb-6">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>

                                <p className="text-lg text-gray-700 mb-8 leading-relaxed font-light italic">
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
                                        <div className="font-medium">{testimonial.author}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PERKS GLASSMORPHISM */}
            <section className="py-32 bg-gradient-to-br from-amber-50 via-white to-gray-50 relative overflow-hidden">
                <motion.div
                    style={{
                        x: mousePosition.x,
                        y: mousePosition.y
                    }}
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl"
                />
                <motion.div
                    style={{
                        x: -mousePosition.x,
                        y: -mousePosition.y
                    }}
                    className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"
                />

                <div className="container mx-auto px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
                            Benefícios
                            <span className="font-black italic"> Exclusivos</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {exclusivePerks.map((perk, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className="h-full p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl hover:bg-white/80 transition-all">
                                    <div className="text-5xl mb-6">{perk.icon}</div>
                                    <h3 className="text-xl font-medium mb-3">{perk.title}</h3>
                                    <p className="text-gray-600 font-light leading-relaxed">
                                        {perk.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PLANOS */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
                            Planos
                            <span className="font-black italic"> Premium</span>
                        </h2>
                        <p className="text-xl text-gray-600 font-light">
                            Flexibilidade total. Sem compromisso.
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
                                className={`relative rounded-3xl p-8 ${plan.highlight
                                    ? 'bg-black text-white scale-110'
                                    : 'bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-amber-500 text-black rounded-full text-xs font-bold tracking-wider">
                                        RECOMENDADO
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className={`text-2xl font-medium mb-2 ${plan.highlight ? 'text-white' : 'text-black'}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm mb-6 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {plan.description}
                                    </p>
                                    <div className="flex items-end justify-center gap-1 mb-2">
                                        <span className={`text-5xl font-light ${plan.highlight ? 'text-white' : 'text-black'}`}>
                                            {plan.price}
                                        </span>
                                        <span className={`text-lg mb-2 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {plan.period}
                                        </span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-amber-400' : 'text-gray-400'
                                                }`} />
                                            <span className={`text-sm font-light ${plan.highlight ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-full font-medium transition-all ${plan.highlight
                                    ? 'bg-white text-black hover:bg-amber-500'
                                    : 'bg-black text-white hover:bg-amber-600'
                                    }`}>
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-32 bg-gray-50">
                <div className="container mx-auto px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-light mb-6 tracking-tight">
                            Perguntas
                            <span className="font-black italic"> Frequentes</span>
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
                                className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-lg font-medium pr-8">{faq.question}</span>
                                    {openFaq === idx ? (
                                        <Minus className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                    ) : (
                                        <Plus className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                    )}
                                </button>

                                {openFaq === idx && (
                                    <div className="px-8 pb-6">
                                        <p className="text-gray-600 leading-relaxed font-light">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA MINIMALISTA */}
            <section className="py-40 bg-black text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/images/noturna-bandeiras-bw.jpg"
                        alt="Background"
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="container mx-auto px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-6xl md:text-7xl font-light mb-8 tracking-tight">
                            Junte-se à
                            <br />
                            <span className="font-black italic">Elite</span>
                        </h2>

                        <p className="text-xl text-gray-400 font-light mb-12 max-w-2xl mx-auto">
                            Transforme sua jornada atlética em uma experiência extraordinária
                        </p>

                        <button className="group inline-flex items-center gap-3 px-12 py-6 bg-white text-black rounded-full font-medium hover:bg-amber-500 hover:text-white transition-all">
                            <span>Iniciar Agora</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <p className="text-sm text-gray-500 mt-6">
                            14 dias de garantia incondicional • Sem cartão necessário
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER MÍNIMO */}
            <footer className="py-16 bg-white border-t border-gray-200">
                <div className="container mx-auto px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="text-2xl font-light mb-4">
                                <span className="font-black">ROTA</span>
                            </div>
                            <p className="text-gray-600 text-sm font-light mb-6">
                                Plataforma premium para atletas de elite desde 2018.
                            </p>
                            <div className="flex gap-4">
                                <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-amber-100 transition-colors">
                                    <Instagram className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-amber-100 transition-colors">
                                    <Facebook className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-amber-100 transition-colors">
                                    <Linkedin className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">Plataforma</h4>
                            <ul className="space-y-2 text-sm text-gray-600 font-light">
                                <li><a href="#" className="hover:text-amber-600 transition-colors">Experiências</a></li>
                                <li><a href="#" className="hover:text-amber-600 transition-colors">Comunidade</a></li>
                                <li><a href="#" className="hover:text-amber-600 transition-colors">Elite</a></li>
                                <li><a href="#" className="hover:text-amber-600 transition-colors">Blog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">Empresa</h4>
                            <ul className="space-y-2 text-sm text-gray-600 font-light">
                                <li><a href="#" className="hover:text-amber-600 transition-colors">Sobre</a></li>
                                <li><a href="#" className="hover:text-amber-600 transition-colors">Carreiras</a></li>
                                <li><a href="#" className="hover:text-amber-600 transition-colors">Termos</a></li>
                                <li><a href="#" className="hover:text-amber-600 transition-colors">Privacidade</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">Contato</h4>
                            <ul className="space-y-3 text-sm text-gray-600 font-light">
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-amber-600" />
                                    contato@rota.com
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-amber-600" />
                                    (11) 99999-9999
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPinned className="w-4 h-4 text-amber-600 mt-1" />
                                    <span>São Paulo, SP</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500 font-light">
                        <p>© 2026 Rota Business Club. Todos os direitos reservados.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-black transition-colors">Termos</a>
                            <a href="#" className="hover:text-black transition-colors">Privacidade</a>
                            <a href="#" className="hover:text-black transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
