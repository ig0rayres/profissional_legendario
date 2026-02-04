'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Trophy, Shield, Target, Award, Crown, Flame, ShieldCheck,
    Zap, Users, CheckCircle2, ArrowRight, Sparkles, Play,
    ChevronDown, Star, TrendingUp, Plus, Minus,
    Facebook, Instagram, Linkedin, Mail, Phone,
    ClipboardCheck, Heart, Briefcase, Gem, Medal
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Plan {
    id: string;
    tier: string;
    name: string;
    description?: string;
    price: number;
    features: string[]; // Array de strings, não string separada por \n
    xp_multiplier: number;
    max_elos: number | null;
    max_confraternities_month: number;
    max_marketplace_ads: number;
    max_categories: number;
    slug?: string;
    is_active: boolean;
    display_order: number;
}

export default function HomeV7() {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.3]); // Aumentado de 1.1 para 1.3 (+20%)

    const supabase = createClient();
    // Buscar planos reais
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Carousel slides data - 20 VARIAÇÕES PARA TESTE
    const heroSlides = [
        {
            number: "01",
            image: "/fotos-rota/TOP 1079 (1094).jpg",
            title: "O ACAMPAMENTO BASE",
            subtitle: "DO HOMEM DE NEGÓCIOS",
            description: "Infraestrutura de apoio, estratégia e alianças para sua escalada.",
            subtext: "O Rota Business Club não é apenas um diretório. É o ponto de convergência onde a disciplina da montanha encontra a ética corporativa."
        },
        {
            number: "02",
            image: "/fotos-rota/D (330).jpg",
            title: "NETWORKING DE",
            subtitle: "ALTO IMPACTO",
            description: "Conexões que geram resultados reais para seu negócio.",
            subtext: "Encontre parceiros estratégicos em uma comunidade de empreendedores comprometidos com excelência."
        },
        {
            number: "03",
            image: "/fotos-rota/TOP 1079 (546).jpg",
            title: "ONDE NEGÓCIOS",
            subtitle: "GANHAM VIDA",
            description: "Mais de R$ 1.2M em contratos fechados em 2025.",
            subtext: "Uma plataforma que transforma conexões em oportunidades concretas e mensuráveis."
        },
        {
            number: "04",
            image: "/fotos-rota/TOP 1079 (977).jpg",
            title: "COMUNIDADE DE",
            subtitle: "ELITE EMPRESARIAL",
            description: "Profissionais verificados com histórico comprovado.",
            subtext: "Networking baseado em confiança, transparência e resultados compartilhados."
        },
        {
            number: "05",
            image: "/fotos-rota/TOP 1079 (801).jpg",
            title: "ESTRATÉGIA E",
            subtitle: "EXECUÇÃO ASSERTIVA",
            description: "Transforme visão em ação com apoio qualificado.",
            subtext: "Acesso a mentorias, parcerias e ferramentas que aceleram seu crescimento."
        },
        {
            number: "06",
            image: "/fotos-rota/0617top1276D03FotoPerigo.jpg", // Vista panorâmica do topo
            title: "NETWORKING QUE",
            subtitle: "TRANSFORMA VIDAS",
            description: "Conexões autênticas que geram impacto duradouro.",
            subtext: "Participe de encontros presenciais que fortalecem laços e criam oportunidades."
        },
        {
            number: "07",
            image: "/fotos-rota/1637top1276D2FotoPerigo.jpg", // Multidão noturna roxa
            title: "SUA REDE DE",
            subtitle: "CONFIANÇA EMPRESARIAL",
            description: "Construa parcerias baseadas em valores compartilhados.",
            subtext: "Membros comprometidos com ética, transparência e crescimento mútuo."
        },
        {
            number: "08",
            image: "/fotos-rota/1749top1276D02FotoPerigo.jpg", // Árvore vermelha noturna
            title: "OPORTUNIDADES",
            subtitle: "SEM LIMITES",
            description: "Marketplace exclusivo com procedência garantida.",
            subtext: "Negocie com segurança sabendo exatamente com quem está fechando parceria."
        },
        {
            number: "09",
            image: "/fotos-rota/TOP 1079 (6376).jpg", // Parceria na água - única!
            title: "GAMIFICAÇÃO QUE",
            subtitle: "PREMIA AÇÃO",
            description: "Sistema de pontos que valoriza networking ativo.",
            subtext: "Cada conexão, cada deal fechado te aproxima de novos benefícios e reconhecimento."
        },
        {
            number: "10",
            image: "/fotos-rota/TOP 1079 (285).jpg", // Fogueira noturna
            title: "EVENTOS PRESENCIAIS",
            subtitle: "DE ALTO NÍVEL",
            description: "438 confrarias realizadas com networking estratégico.",
            subtext: "Encontros organizados que conectam os profissionais certos no momento ideal."
        },
        {
            number: "11",
            image: "/fotos-rota/TOP 1079 (413).jpg", // Amanhecer atmosférico
            title: "ESCALADA",
            subtitle: "PROFISSIONAL CONTÍNUA",
            description: "Sistema de patentes reconhece sua evolução.",
            subtext: "De Novato a Lenda: sua jornada de crescimento é visível e recompensada."
        },
        {
            number: "12",
            image: "/fotos-rota/TOP 1079 (416).jpg", // Prédio vermelho noite
            title: "PROCEDÊNCIA E",
            subtitle: "REPUTAÇÃO VISÍVEL",
            description: "Histórico completo de cada membro disponível.",
            subtext: "Transparência total: avaliações, projetos concluídos e credibilidade comprovada."
        },
        {
            number: "13",
            image: "/fotos-rota/TOP 1079 (4732).jpg", // Cara sorrindo energia
            title: "PARCERIAS QUE",
            subtitle: "ELEVAM NEGÓCIOS",
            description: "87% dos membros fecharam pelo menos 1 deal.",
            subtext: "Ambiente propício para colaborações que geram valor real e crescimento sustentável."
        },
        {
            number: "14",
            image: "/fotos-rota/TOP 1079 (3596).jpg", // Vitória no topo
            title: "MENTORIAS E",
            subtitle: "CONHECIMENTO PRÁTICO",
            description: "Aprenda com quem já trilhou o caminho.",
            subtext: "Acesso a profissionais experientes dispostos a compartilhar estratégias de sucesso."
        },
        {
            number: "15",
            image: "/fotos-rota/A (590).jpg", // Acampamento barracas
            title: "INFRAESTRUTURA",
            subtitle: "PARA SEU SUCESSO",
            description: "Ferramentas e recursos que simplificam networking.",
            subtext: "Plataforma completa com marketplace, projetos, gamificação e comunidade ativa."
        },
        {
            number: "16",
            image: "/fotos-rota/TOP 1079 (3445).jpg", // Grupo celebrando
            title: "NETWORKING",
            subtitle: "ESTRATÉGICO E EFICAZ",
            description: "Conecte-se com quem realmente importa.",
            subtext: "Algoritmos inteligentes facilitam encontros entre profissionais complementares."
        },
        {
            number: "17",
            image: "/fotos-rota/TOP 1079 (1093).jpg", // Paisagem montanha
            title: "CRESCIMENTO",
            subtitle: "ACELERADO E SUSTENTÁVEL",
            description: "Planos com multiplicadores de pontos até 5x.",
            subtext: "Invista em seu desenvolvimento e colha resultados exponenciais."
        },
        {
            number: "18",
            image: "/fotos-rota/TOP 1079 (1082).jpg", // Nascer sol montanha
            title: "ÉTICA E",
            subtitle: "PROFISSIONALISMO",
            description: "Comunidade regida por código de conduta rigoroso.",
            subtext: "Ambiente seguro onde respeito, integridade e excelência são valores inegociáveis."
        },
        {
            number: "19",
            image: "/fotos-rota/TOP 1079 (18).jpg", // Vista panorâmica épica
            title: "RESULTADOS",
            subtitle: "COMPROVADOS",
            description: "Dados reais de impacto em negócios de membros.",
            subtext: "Métricas transparentes mostram o valor gerado pela comunidade mês a mês."
        },
        {
            number: "20",
            image: "/fotos-rota/A (771).jpg", // Grupo caminhando
            title: "SUA JORNADA",
            subtitle: "COMEÇA AGORA",
            description: "Junte-se a 2.4K+ profissionais de elite.",
            subtext: "Transforme sua carreira com conexões que realmente importam e geram impacto."
        }
    ];

    // Auto-rotate carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000); // 6 segundos por slide
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        async function loadPlans() {
            const { data, error } = await supabase
                .from('plan_config')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (data && !error) {
                setPlans(data);
            }
            setLoading(false);
        }
        loadPlans();
    }, []);

    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* ============ HERO CAROUSEL ============ */}
            <section className="relative h-screen overflow-hidden">
                {/* Carousel Background Images */}
                <div className="absolute inset-0">
                    {heroSlides.map((slide, index) => (
                        <motion.div
                            key={index}
                            style={{ scale }}
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: index === currentSlide ? 1 : 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        >
                            <Image
                                src={slide.image}
                                alt={`ROTA Business Club - ${slide.title}`}
                                fill
                                className="object-cover"
                                style={{
                                    objectPosition: index === 12 ? 'center 50%' : 'center 35%', // Slide 13 mais baixo
                                    scale: 1.15 // Zoom adicional para crop
                                }}
                                priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 via-gray-900/50 to-transparent" />
                        </motion.div>
                    ))}
                </div>

                {/* Content */}
                <motion.div
                    style={{ opacity }}
                    className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
                >
                    {/* NÚMERO DO SLIDE - TESTE */}
                    <motion.div
                        key={`number-${currentSlide}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-24 right-8 z-50"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-20 h-20 rounded-full bg-[#CC5500] border-4 border-white flex items-center justify-center shadow-2xl">
                                <span className="text-3xl font-black text-white">
                                    {heroSlides[currentSlide].number}
                                </span>
                            </div>
                            <div className="px-3 py-1 bg-white/90 rounded-full">
                                <span className="text-xs font-bold text-gray-900">TESTE</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4D40] border border-[#CC5500] rounded-full mb-6"
                    >
                        <Zap className="w-4 h-4 text-[#CC5500]" />
                        <span className="text-sm font-semibold text-white tracking-wider">SEJA EXTRAORDINÁRIO</span>
                    </motion.div>

                    {/* Animated Title */}
                    <motion.h1
                        key={`title-${currentSlide}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        {heroSlides[currentSlide].title}{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-[#1E4D40] via-[#3fa889] to-[#1E4D40] bg-clip-text text-transparent">
                                <br />
                                {heroSlides[currentSlide].subtitle}
                            </span>
                        </span>
                    </motion.h1>

                    {/* Animated Description */}
                    <motion.p
                        key={`desc-${currentSlide}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-200 mb-4 max-w-3xl font-semibold"
                    >
                        {heroSlides[currentSlide].description}
                    </motion.p>

                    <motion.p
                        key={`subtext-${currentSlide}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-base md:text-lg text-gray-300 mb-12 max-w-2xl"
                    >
                        {heroSlides[currentSlide].subtext}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Link href="/auth/register">
                            <button className="px-8 py-4 bg-[#1E4D40] hover:bg-[#1a5c4a] text-white font-bold rounded-lg transition-all shadow-lg uppercase tracking-wider">
                                Alistar-se Agora
                            </button>
                        </Link>
                        <button className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold rounded-lg transition-all flex items-center gap-2 uppercase tracking-wider">
                            <Play className="w-5 h-5 text-[#CC5500]" />
                            Ver História
                        </button>
                    </motion.div>

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-24 flex gap-2">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all ${index === currentSlide
                                    ? 'w-8 bg-[#CC5500]'
                                    : 'w-2 bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-12"
                    >
                        <ChevronDown className="w-8 h-8 text-[#CC5500] animate-bounce" />
                    </motion.div>
                </motion.div>
            </section>

            {/* ============ STATS BAR ============ */}
            <section className="py-12 bg-[#1E4D40]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "MEMBROS ATIVOS", value: "2.4K+", icon: Users },
                            { label: "VIGOR GERADO", value: "850K+", icon: Flame },
                            { label: "CONFRARIAS", value: "438", icon: Users },
                            { label: "NEGÓCIOS FECHADOS", value: "1.2K+", icon: Trophy }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col items-center"
                            >
                                <stat.icon className="w-10 h-10 text-[#CC5500] mb-3" />
                                <div className="text-4xl font-black text-white mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold text-white/80 uppercase tracking-widest">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ ROTA DO VALENTE ============ */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    {/* Título da Seção */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4D40]/10 border border-[#1E4D40]/20 rounded-full mb-4"
                        >
                            <Trophy className="w-5 h-5 text-[#1E4D40]" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#1E4D40]">
                                Sistema de Gamificação
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-4 uppercase"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            ROTA DO VALENTE
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto mb-4"
                        >
                            Transformamos sua jornada profissional em uma <span className="font-bold text-[#1E4D40]">experiência de progressão</span>.
                            Cada ação gera <span className="font-bold text-[#CC5500]">VIGOR</span> (pontos), desbloqueia medalhas e te leva ao topo do ranking mensal.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-gray-500 max-w-2xl mx-auto"
                        >
                            💡 Networking, fechamento de negócios e participação ativa valem pontos.
                        </motion.p>
                    </div>

                    {/* Patentes - Trilha de Progressão */}
                    <div className="mb-16">
                        <h3 className="text-2xl font-black uppercase text-center text-gray-900 mb-4">
                            Trilha de Progressão
                        </h3>
                        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                            Evolua através de 6 patentes conforme acumula VIGOR. Cada nível desbloqueia novos privilégios.
                        </p>

                        {/* Trilha Visual */}
                        <div className="flex items-center justify-center flex-wrap gap-4">
                            {[
                                { name: "Novato", icon: Shield, points: "0+" },
                                { name: "Especialista", icon: Target, points: "200+" },
                                { name: "Guardião", icon: ShieldCheck, points: "500+" },
                                { name: "Comandante", icon: Award, points: "1K+" },
                                { name: "General", icon: Flame, points: "2K+" },
                                { name: "Lenda", icon: Crown, points: "3.5K+" }
                            ].map((patente, idx) => {
                                const IconComponent = patente.icon;
                                return (
                                    <div key={idx} className="flex items-center">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex flex-col items-center"
                                        >
                                            {/* Card da Patente */}
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-[#1E4D40] bg-white shadow-lg group-hover:scale-110 transition-transform">
                                                    <IconComponent className="w-10 h-10 text-[#1E4D40]" />
                                                </div>
                                                {/* Badge de pontos */}
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                                    <div className="px-2 py-0.5 bg-gray-900 text-white text-xs font-bold rounded-full whitespace-nowrap">
                                                        {patente.points}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Nome */}
                                            <div className="mt-4 text-center">
                                                <div className="text-sm font-black uppercase text-gray-900">
                                                    {patente.name}
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Seta Conectora */}
                                        {idx < 5 && (
                                            <ArrowRight className="hidden lg:block w-8 h-8 text-[#CC5500] mx-2" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ============ MEDALHAS  - PERMANENTES ============ */}
                    <div className="mb-16">
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4D40] text-white rounded-full mb-4"
                            >
                                <Medal className="w-5 h-5" />
                                <span className="font-black uppercase text-sm">Medalhas Ad Aeternum</span>
                            </motion.div>
                            <h3 className="text-2xl font-black uppercase text-gray-900 mb-3">
                                Conquistas Permanentes
                            </h3>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Medalhas são <strong>conquistas permanentes</strong> que você ganha ao completar marcos importantes.
                                Uma vez conquistadas, <strong>ficam para sempre</strong> no seu perfil (Ad Aeternum).
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { name: "Alistamento Concluído", icon: ClipboardCheck, points: 100, desc: "Perfil 100%" },
                                { name: "Primeira Confraria", icon: Heart, points: 50, desc: "1º encontro" },
                                { name: "Irmandade", icon: Briefcase, points: 75, desc: "Contratar membro" },
                                { name: "Sentinela Elite", icon: Gem, points: 500, desc: "3 meses Elite" }
                            ].map((medal, idx) => {
                                const IconComponent = medal.icon;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-[#1E4D40]/30 hover:shadow-lg transition-all"
                                    >
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1E4D40] to-[#2D6D5B] shadow-lg mb-4">
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-black uppercase text-gray-900 mb-1">
                                                {medal.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mb-3">
                                                {medal.desc}
                                            </div>
                                            <div className="px-3 py-1 bg-[#1E4D40]/10 text-[#1E4D40] font-bold text-xs rounded-full">
                                                +{medal.points} VIGOR
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ============ PROEZAS - MENSAIS ============ */}
                    <div className="mb-16">
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#CC5500] to-[#FF8C42] text-white rounded-full mb-4"
                            >
                                <Flame className="w-5 h-5" />
                                <span className="font-black uppercase text-sm">Proezas do Mês</span>
                            </motion.div>
                            <h3 className="text-2xl font-black uppercase text-gray-900 mb-3">
                                Desafios Mensais
                            </h3>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Proezas são <strong>desafios mensais</strong> que testam sua dedicação e atividade.
                                Elas <strong>resetam todo dia 1</strong> de cada mês, criando competições épicas entre membros!
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { name: "Networker Elite", icon: Users, points: 200, desc: "10 novos elos" },
                                { name: "Mercador Ativo", icon: TrendingUp, points: 150, desc: "5 anúncios" },
                                { name: "Social Butterfly", icon: Star, points: 100, desc: "3 confraternidades" },
                                { name: "Negociador Nato", icon: Heart, points: 300, desc: "2 contratos" }
                            ].map((proeza, idx) => {
                                const IconComponent = proeza.icon;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-[#CC5500]/30 hover:shadow-lg transition-all relative overflow-hidden"
                                    >
                                        {/* Badge Mensal */}
                                        <div className="absolute top-2 right-2">
                                            <div className="px-2 py-0.5 bg-[#CC5500] text-white text-[10px] font-black rounded-full">
                                                MENSAL
                                            </div>
                                        </div>

                                        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#CC5500] to-[#FF8C42] shadow-lg mb-4">
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-black uppercase text-gray-900 mb-1">
                                                {proeza.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mb-3">
                                                {proeza.desc}
                                            </div>
                                            <div className="px-3 py-1 bg-[#CC5500]/10 text-[#CC5500] font-bold text-xs rounded-full">
                                                +{proeza.points} VIGOR
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Multiplicadores */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-[#1E4D40] to-[#1a5c4a] rounded-xl p-8 text-white mb-12"
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black uppercase mb-2">
                                ⚡ Acelere Sua Progressão
                            </h3>
                            <p className="text-white/80 text-sm">
                                Assinantes ganham multiplicadores de VIGOR em todas as ações
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { plan: "Recruta", multi: "1x", desc: "Grátis" },
                                { plan: "Veterano", multi: "1.5x", desc: "R$ 97/mês" },
                                { plan: "Elite", multi: "3x", desc: "R$ 127/mês" },
                                { plan: "Lendário", multi: "5x", desc: "R$ 247/mês" }
                            ].map((item, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="text-4xl font-black text-[#CC5500] mb-2">
                                        {item.multi}
                                    </div>
                                    <div className="text-sm font-bold uppercase mb-1">
                                        {item.plan}
                                    </div>
                                    <div className="text-xs text-white/70">
                                        {item.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* CTA para ver ranking */}
                    <div className="text-center">
                        <Link href="/dashboard">
                            <button className="px-8 py-4 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-bold rounded-lg transition-all uppercase tracking-wider inline-flex items-center gap-2">
                                <Crown className="w-5 h-5" />
                                Ver Ranking Atual
                            </button>
                        </Link>
                    </div>
                </div>
            </section >

            {/* ============ CONFRARIA ============ */}
            < section className="py-24 bg-white" >
                <div className="container mx-auto px-6">
                    {/* Título */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC5500]/10 border border-[#CC5500]/20 rounded-full mb-4"
                        >
                            <Users className="w-5 h-5 text-[#CC5500]" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#CC5500]">
                                Networking Presencial
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-4 uppercase"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            CONFRARIA
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto mb-4"
                        >
                            <span className="font-bold text-[#CC5500]">Confrarias</span> são encontros presenciais estratégicos entre membros.
                            Aqui você cria <span className="font-bold text-[#1E4D40]">conexões reais</span> que geram negócios, parcerias e amizades duradouras.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-gray-500 max-w-2xl mx-auto"
                        >
                            💡 Membros premium podem criar e participar de mais confrarias por mês.
                        </motion.p>
                    </div>

                    {/* Grid Galeria + Info */}
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        {/* Galeria */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {[
                                "/fotos-rota/TOP 1079 (4251).jpg",
                                "/fotos-rota/TOP 1079 (5629).jpg",
                                "/fotos-rota/TOP 1079 (6401).jpg",
                                "/fotos-rota/TOP 1079 (1126).jpg"
                            ].map((foto, idx) => (
                                <div
                                    key={idx}
                                    className="relative h-48 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform"
                                >
                                    <Image
                                        src={foto}
                                        alt={`Confraria ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl font-black uppercase text-gray-900 mb-4">
                                O que acontece em uma Confraria?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                São encontros organizados pelos próprios membros para networking, troca de experiências e fechamento de negócios.
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Networking estratégico com profissionais verificados",
                                    "Apresentações de negócios e pitches",
                                    "Parcerias e contratos fechados no local",
                                    "Ambiente seguro e de alta confiança"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-[#1E4D40] flex-shrink-0 mt-1" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-[#1E4D40]/5 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="w-5 h-5 text-[#CC5500]" />
                                    <span className="font-bold text-gray-900">Números Reais:</span>
                                </div>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li>• <strong>438</strong> confrarias realizadas em 2025</li>
                                    <li>• <strong>R$ 1.2M+</strong> em negócios gerados</li>
                                    <li>• <strong>87%</strong> dos membros fecharam pelo menos 1 deal</li>
                                </ul>
                            </div>

                            <div className="mt-8">
                                <Link href="/elo-da-rota">
                                    <button className="px-6 py-3 bg-[#CC5500] hover:bg-[#CC5500]/90 text-white font-bold rounded-lg transition-all uppercase tracking-wider inline-flex items-center gap-2">
                                        Ver Próximas Confrarias
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section >

            {/* ============ MARKETPLACE ============ */}
            < section className="py-24 bg-gray-50" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E4D40]/10 border border-[#1E4D40]/20 rounded-full mb-4"
                        >
                            <Sparkles className="w-5 h-5 text-[#1E4D40]" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#1E4D40]">
                                Negócios com Procedência
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-4 uppercase"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            MARKETPLACE
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto mb-4"
                        >
                            Um <span className="font-bold text-[#1E4D40]">marketplace exclusivo</span> para membros negociarem serviços e produtos.
                            Aqui você sabe <span className="font-bold text-[#CC5500]">com quem está fazendo negócio</span>.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-gray-500 max-w-2xl mx-auto"
                        >
                            💡 Todos os membros são verificados. Histórico, avaliações e reputação visíveis.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {[
                            { title: "Membros Verificados", icon: CheckCircle2, desc: "Todos passam por validação" },
                            { title: "Procedência", icon: Shield, desc: "Histórico e avaliações" },
                            { title: "Irmandade", icon: Users, desc: "Negócie com confiança" }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center p-6 bg-white rounded-lg shadow-md"
                            >
                                <feature.icon className="w-12 h-12 text-[#1E4D40] mx-auto mb-4" />
                                <h3 className="text-lg font-black uppercase text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link href="/marketplace">
                            <button className="px-6 py-3 bg-[#1E4D40] hover:bg-[#1a5c4a] text-white font-bold rounded-lg transition-all uppercase tracking-wider inline-flex items-center gap-2">
                                Explorar Marketplace
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section >

            {/* ============ PROJETOS ============ */}
            < section className="py-24 bg-white" >
                <div className="container mx-auto px-6">
                    {/* Título */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC5500]/10 border border-[#CC5500]/20 rounded-full mb-4"
                        >
                            <Target className="w-5 h-5 text-[#CC5500]" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#CC5500]">
                                Oportunidades Diretas
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-4 uppercase"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            PROJETOS
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-gray-600 max-w-3xl mx-auto mb-4"
                        >
                            Poste sua <span className="font-bold text-[#CC5500]">demanda</span> ou encontre <span className="font-bold text-[#1E4D40]">oportunidades</span> de projetos reais.
                            Conectamos quem precisa com quem pode entregar.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-gray-500 max-w-2xl mx-auto"
                        >
                            Desde consultorias até desenvolvimento completo de software.
                        </motion.p>
                    </div>

                    <div className="bg-gradient-to-r from-[#CC5500] to-[#FF8C42] rounded-xl p-12 text-white text-center">
                        <h3 className="text-3xl font-black uppercase mb-4">
                            R$ 127K+ em Contratos Gerados
                        </h3>
                        <p className="text-xl mb-8 text-white/90">
                            Nossos membros fecharam mais de 1.200 projetos nos últimos 6 meses.
                        </p>
                        <Link href="/projects">
                            <button className="px-8 py-4 bg-white text-[#CC5500] hover:bg-gray-100 font-bold rounded-lg transition-all uppercase tracking-wider inline-flex items-center gap-2">
                                Publicar Seu Projeto
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section >

            {/* ============ PLANOS ============ */}
            < section className="py-24 bg-white" >
                <div className="container mx-auto px-6">
                    {/* Título */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC5500]/10 border border-[#CC5500]/20 rounded-full mb-4"
                        >
                            <Trophy className="w-5 h-5 text-[#CC5500]" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#CC5500]">
                                Escolha Seu Plano
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-gray-900 mb-4 uppercase"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            PLANOS
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xl text-gray-600 max-w-2xl mx-auto"
                        >
                            Escolha o plano ideal para seu <span className="font-bold text-[#1E4D40]">momento</span> e{' '}
                            <span className="font-bold text-[#1E4D40]">objetivos</span>.
                        </motion.p>
                    </div>

                    {/* Cards de Planos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {loading ? (
                            <div className="col-span-full text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#1E4D40] border-t-transparent"></div>
                            </div>
                        ) : (
                            plans.map((plan, idx) => {
                                const isElite = plan.tier === 'elite';
                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`relative p-8 rounded-xl border-2 h-full flex flex-col ${isElite
                                            ? 'border-[#CC5500] bg-gradient-to-br from-[#CC5500]/10 to-[#FF8C42]/10 shadow-2xl scale-105'
                                            : 'border-gray-200 bg-white hover:border-[#1E4D40]/30 shadow-lg'
                                            } transition-all hover:shadow-xl`}
                                    >
                                        {/* Badge Mais Popular */}
                                        {isElite && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                                <div className="px-4 py-1 bg-gradient-to-r from-[#CC5500] to-[#FF8C42] text-white text-xs font-black uppercase rounded-full shadow-lg">
                                                    MAIS POPULAR
                                                </div>
                                            </div>
                                        )}

                                        {/* Nome do Plano */}
                                        <div className="text-center mb-6">
                                            <h3 className={`text-2xl font-black uppercase mb-2 ${isElite ? 'text-[#CC5500]' : 'text-gray-900'
                                                }`}>
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline justify-center gap-2">
                                                <span className={`text-4xl font-black whitespace-nowrap ${isElite ? 'text-[#CC5500]' : 'text-[#1E4D40]'
                                                    }`}>
                                                    {plan.price === 0
                                                        ? 'Grátis'
                                                        : `R$ ${plan.price.toFixed(2).replace('.', ',')}`
                                                    }
                                                </span>
                                                {plan.price > 0 && (
                                                    <span className="text-gray-500 whitespace-nowrap">/mês</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Multiplicador VIGOR */}
                                        <div className="text-center mb-6 py-3 px-4 bg-[#1E4D40]/10 rounded-lg">
                                            <div className="flex items-center justify-center gap-2">
                                                <Zap className="w-5 h-5 text-[#CC5500]" />
                                                <span className="font-bold text-gray-900">
                                                    Multiplicador {plan.xp_multiplier}x
                                                </span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3 mb-8 flex-grow">
                                            {plan.features?.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-[#1E4D40] flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA */}
                                        <Link href="/auth/register">
                                            <button
                                                className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${isElite
                                                    ? 'bg-gradient-to-r from-[#CC5500] to-[#FF8C42] text-white hover:shadow-lg'
                                                    : 'bg-[#1E4D40] text-white hover:bg-[#1E4D40]/90'
                                                    }`}
                                            >
                                                {plan.price === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                                            </button>
                                        </Link>
                                    </motion.div>
                                )
                            })
                        )}
                    </div>
                </div>
            </section >

            {/* ============ FAQ ============ */}
            < section className="py-24 bg-gray-50" >
                <div className="container mx-auto px-6 max-w-4xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-gray-900 text-center mb-16 uppercase"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        ❓ Perguntas Frequentes
                    </motion.h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Como funciona o sistema de gamificação?",
                                a: "Cada ação na plataforma gera VIGOR (pontos). Quanto mais ativo você for, mais rápido progride nas patentes e desbloqueia medalhas e proezas."
                            },
                            {
                                q: "Posso cancelar minha assinatura?",
                                a: "Sim! Cancelamento sem multas a qualquer momento. Seu acesso permanece até o fim do período pago."
                            },
                            {
                                q: "Como funcionam as Confrarias?",
                                a: "São encontros presenciais entre membros para networking, conexões e negócios. Membros pagos podem criar e participar de mais confrarias por mês."
                            },
                            {
                                q: "O Marketplace é seguro?",
                                a: "Sim! Todos os membros são verificados. Você pode ver avaliações, histórico e perfil completo antes de fechar negócio."
                            }
                        ].map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-gray-900">{faq.q}</span>
                                    {openFaq === idx ? (
                                        <Minus className="w-5 h-5 text-[#1E4D40]" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-[#1E4D40]" />
                                    )}
                                </button>
                                {openFaq === idx && (
                                    <div className="px-6 pb-4 text-gray-600">
                                        {faq.a}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ============ FOOTER ============ */}
            < footer className="bg-[#1E4D40] text-white py-12" >
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {/* Logo */}
                        <div>
                            <h3 className="text-2xl font-black mb-4 uppercase">ROTA</h3>
                            <p className="text-white/70 text-sm">
                                O acampamento base do homem de negócio.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-bold uppercase mb-4 text-sm tracking-wider">Plataforma</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link></li>
                                <li><Link href="/elo-da-rota" className="text-white/70 hover:text-white">Confrarias</Link></li>
                                <li><Link href="/marketplace" className="text-white/70 hover:text-white">Marketplace</Link></li>
                                <li><Link href="/projects" className="text-white/70 hover:text-white">Projetos</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold uppercase mb-4 text-sm tracking-wider">Institucional</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/planos" className="text-white/70 hover:text-white">Planos</Link></li>
                                <li><Link href="/about" className="text-white/70 hover:text-white">Sobre</Link></li>
                                <li><Link href="/contact" className="text-white/70 hover:text-white">Contato</Link></li>
                            </ul>
                        </div>

                        {/* Social */}
                        <div>
                            <h4 className="font-bold uppercase mb-4 text-sm tracking-wider">Redes Sociais</h4>
                            <div className="flex gap-4">
                                <a href="#" className="text-white/70 hover:text-white"><Facebook className="w-5 h-5" /></a>
                                <a href="#" className="text-white/70 hover:text-white"><Instagram className="w-5 h-5" /></a>
                                <a href="#" className="text-white/70 hover:text-white"><Linkedin className="w-5 h-5" /></a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/20 pt-8 text-center text-sm text-white/70">
                        © 2026 ROTA Business Club. Todos os direitos reservados.
                    </div>
                </div>
            </footer >
        </div >
    );
}
