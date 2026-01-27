// Rota do Valente - Landing Page
// Design: Warm Expedition - O Acampamento do Homem de Negócio
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import * as LucideIcons from 'lucide-react'
import {
    Users,
    Camera,
    Rocket,
    Mountain,
    ArrowRight,
    Flame,
    Calendar,
    Shield,
    Target,
    Sword,
    Medal,
    Trophy,
    Crown,
    HeartHandshake,
    CheckCircle2
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Rota do Valente | O Acampamento do Homem de Negócio',
    description: 'A jornada épica para os verdadeiros guerreiros do mundo corporativo. Networking de alto valor, conquistas reais e seu caminho para o topo.',
    keywords: 'networking business, confrarias, gamificação, rota business club, networking profissional',
}

// Cores do Manual da Marca
const BRAND = {
    verdeRota: '#214C3B',
    cobre: '#B87333',
    areia: '#EFEDE8',
    petroleo: '#0E2A2F',
}

// Componente para renderizar ícone Lucide dinamicamente
function DynamicIcon({ name, className }: { name: string, className?: string }) {
    const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[name] || LucideIcons.Award
    return <Icon className={className} />
}

export default async function RotaDoValentePage() {
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
        .order('points_reward', { ascending: true })
        .limit(16)

    // Fetch proezas (mensais)
    const { data: proezas } = await supabase
        .from('proezas')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(8)

    const RANKS = ranks || []
    const MEDALS = medals || []
    const PROEZAS = proezas || []

    // Fallback ranks se não houver no banco
    const DEFAULT_RANKS = [
        { id: 'novato', name: 'Novato', description: 'Iniciante na jornada', points_required: 0, icon: 'Shield' },
        { id: 'especialista', name: 'Especialista', description: 'Ganhando experiência', points_required: 200, icon: 'Target' },
        { id: 'guardiao', name: 'Guardião', description: 'Protegendo os valores', points_required: 500, icon: 'Sword' },
        { id: 'comandante', name: 'Comandante', description: 'Líder respeitado', points_required: 1000, icon: 'Medal' },
        { id: 'general', name: 'General', description: 'Mestre da jornada', points_required: 2000, icon: 'Trophy' },
        { id: 'lenda', name: 'Lenda', description: 'Status lendário', points_required: 3500, icon: 'Crown' },
    ]

    const displayRanks = RANKS.length > 0 ? RANKS : DEFAULT_RANKS

    // Fallback medals
    const DEFAULT_MEDALS = [
        { id: 'alistamento', name: 'Alistamento Concluído', description: 'Perfil 100% completo', points_reward: 100, category: 'perfil', icon: 'CheckCircle2' },
        { id: 'primeiro_sangue', name: 'Primeiro Sangue', description: 'Primeira venda fechada', points_reward: 50, category: 'contratos', icon: 'Sword' },
        { id: 'batismo', name: 'Batismo de Excelência', description: 'Primeira avaliação 5★', points_reward: 80, category: 'avaliacoes', icon: 'Star' },
        { id: 'cinegrafista', name: 'Cinegrafista de Campo', description: 'Primeiro upload de trabalho', points_reward: 30, category: 'portfolio', icon: 'Camera' },
        { id: 'missao', name: 'Missão Cumprida', description: 'Primeiro serviço concluído', points_reward: 100, category: 'servicos', icon: 'Target' },
        { id: 'inabalavel', name: 'Inabalável', description: 'Média 5★ após 5 trabalhos', points_reward: 150, category: 'qualidade', icon: 'Shield' },
        { id: 'irmandade', name: 'Irmandade', description: 'Contratar outro membro', points_reward: 75, category: 'networking', icon: 'HeartHandshake' },
        { id: 'anfitriao', name: 'Anfitrião', description: 'Primeira confraria agendada', points_reward: 80, category: 'confraria', icon: 'Users' },
        { id: 'presente', name: 'Presente', description: 'Participar de confraria', points_reward: 50, category: 'confraria', icon: 'Calendar' },
        { id: 'cronista', name: 'Cronista', description: 'Postar fotos de confraria', points_reward: 60, category: 'confraria', icon: 'Camera' },
        { id: 'lider_confraria', name: 'Líder da Confraria', description: 'Organizar 5 confrarias', points_reward: 250, category: 'confraria', icon: 'Crown' },
        { id: 'veterano', name: 'Veterano de Guerra', description: 'Completar 20 serviços', points_reward: 300, category: 'experiencia', icon: 'Medal' },
    ]

    const displayMedals = MEDALS.length > 0 ? MEDALS : DEFAULT_MEDALS

    return (
        <div className="min-h-screen" style={{ backgroundColor: BRAND.areia }}>

            {/* ====================================================== */}
            {/* HERO SECTION - O Acampamento do Homem de Negócio */}
            {/* ====================================================== */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Background com montanha */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url("/images/hero-mountain.jpg")',
                        backgroundColor: BRAND.petroleo,
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(135deg, ${BRAND.petroleo}ee 0%, ${BRAND.verdeRota}dd 50%, ${BRAND.petroleo}cc 100%)`
                        }}
                    />
                </div>

                {/* Conteúdo do Hero */}
                <div className="relative z-10 container mx-auto px-4 py-20">
                    <div className="max-w-3xl">
                        {/* Logo */}
                        <div className="mb-8">
                            <Image
                                src="/images/logo-rota-valente.png"
                                alt="Rota Business Club"
                                width={280}
                                height={100}
                                className="h-20 w-auto"
                            />
                        </div>

                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest mb-6"
                            style={{ backgroundColor: BRAND.cobre, color: 'white' }}
                        >
                            <Mountain className="w-4 h-4" />
                            O Acampamento do Homem de Negócio
                        </div>

                        {/* Título Principal */}
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                            ROTA DO<br />
                            <span style={{ color: BRAND.cobre }}>VALENTE</span>
                        </h1>

                        {/* Subtítulo */}
                        <p className="text-xl text-white/90 mb-10 max-w-xl leading-relaxed font-medium">
                            Networking de alto valor. Conquistas reais.<br />
                            <strong>Seu caminho para o topo.</strong>
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4">
                            <Link href="/auth/register">
                                <Button
                                    size="lg"
                                    className="h-14 px-8 text-sm font-black rounded-lg uppercase"
                                    style={{ backgroundColor: BRAND.cobre, color: 'white' }}
                                >
                                    Comece Sua Jornada
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 text-sm font-black rounded-lg uppercase border-white/30 text-white hover:bg-white/10"
                                >
                                    Já sou Membro
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
            </section>


            {/* ====================================================== */}
            {/* SEÇÃO 2 - O Acampamento (Networking) */}
            {/* ====================================================== */}
            <section className="py-24" style={{ backgroundColor: BRAND.areia }}>
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Imagem */}
                        <div className="relative">
                            <div
                                className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
                                style={{ backgroundColor: BRAND.verdeRota }}
                            >
                                <Image
                                    src="/images/confraria-networking.jpg"
                                    alt="Networking na Confraria"
                                    width={800}
                                    height={600}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />
                                {/* Fallback background */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                    <Users className="w-32 h-32 text-white" />
                                </div>
                            </div>
                            {/* Badge flutuante */}
                            <div
                                className="absolute -bottom-6 -right-6 py-4 px-6 rounded-xl shadow-lg"
                                style={{ backgroundColor: BRAND.cobre }}
                            >
                                <p className="text-white font-black text-2xl">500+</p>
                                <p className="text-white/80 text-sm font-medium">Confrarias Realizadas</p>
                            </div>
                        </div>

                        {/* Texto */}
                        <div>
                            <div
                                className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4"
                                style={{ backgroundColor: `${BRAND.verdeRota}20`, color: BRAND.verdeRota }}
                            >
                                O Acampamento
                            </div>
                            <h2
                                className="text-4xl md:text-5xl font-black mb-6 leading-tight"
                                style={{ color: BRAND.petroleo }}
                            >
                                Networking Poderoso<br />e Transformador
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Assim como um acampamento de montanhistas é o ponto de encontro para planejamento e troca de experiências,
                                a <strong>Rota do Valente</strong> é o espaço onde o networking ganha um novo significado.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                As <strong style={{ color: BRAND.cobre }}>Confrarias</strong> são mais que reuniões — são encontros de
                                mentes e corações alinhados, onde a confiança se constrói e as parcerias se firmam.
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <HeartHandshake className="w-6 h-6" style={{ color: BRAND.cobre }} />
                                    <span className="font-bold text-gray-800">Reuniões 1x1</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Users className="w-6 h-6" style={{ color: BRAND.cobre }} />
                                    <span className="font-bold text-gray-800">Rede Viva</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ====================================================== */}
            {/* SEÇÃO 3 - A Montanha (Patentes) */}
            {/* ====================================================== */}
            <section className="py-24" style={{ backgroundColor: 'white' }}>
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div
                            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4"
                            style={{ backgroundColor: `${BRAND.verdeRota}15`, color: BRAND.verdeRota }}
                        >
                            A Montanha
                        </div>
                        <h2
                            className="text-4xl md:text-5xl font-black mb-4"
                            style={{ color: BRAND.petroleo }}
                        >
                            Hierarquia de Patentes
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Cada pico representa um objetivo, cada trilha um desafio, e cada passo uma conquista.
                        </p>
                    </div>

                    {/* Barra de Progresso de Patentes */}
                    <div className="relative max-w-5xl mx-auto mb-16">
                        {/* Linha de conexão */}
                        <div
                            className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full"
                            style={{ backgroundColor: `${BRAND.verdeRota}30` }}
                        />

                        {/* Patentes */}
                        <div className="relative flex justify-between items-center">
                            {displayRanks.map((rank: typeof DEFAULT_RANKS[0], index: number) => (
                                <div key={rank.id} className="flex flex-col items-center">
                                    {/* Ícone */}
                                    <div
                                        className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                                        style={{
                                            backgroundColor: index === displayRanks.length - 1 ? BRAND.cobre : BRAND.verdeRota
                                        }}
                                    >
                                        <DynamicIcon name={rank.icon || 'Shield'} className="w-7 h-7 text-white" />
                                    </div>
                                    {/* Nome */}
                                    <p
                                        className="mt-3 font-bold text-sm uppercase tracking-wide"
                                        style={{ color: BRAND.petroleo }}
                                    >
                                        {rank.name}
                                    </p>
                                    {/* Pontos */}
                                    <p className="text-xs text-gray-500 font-medium">
                                        {rank.points_required} Vigor
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cards de Patentes */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {displayRanks.map((rank: typeof DEFAULT_RANKS[0], index: number) => (
                            <div
                                key={rank.id}
                                className="p-6 rounded-xl text-center hover:shadow-lg transition-all hover:-translate-y-1"
                                style={{
                                    backgroundColor: BRAND.areia,
                                    borderLeft: `4px solid ${index === displayRanks.length - 1 ? BRAND.cobre : BRAND.verdeRota}`
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{
                                        backgroundColor: `${index === displayRanks.length - 1 ? BRAND.cobre : BRAND.verdeRota}20`
                                    }}
                                >
                                    <DynamicIcon
                                        name={rank.icon || 'Shield'}
                                        className="w-6 h-6"
                                        style={{ color: index === displayRanks.length - 1 ? BRAND.cobre : BRAND.verdeRota } as React.CSSProperties}
                                    />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">{rank.name}</h3>
                                <p className="text-xs text-gray-500">{rank.description}</p>
                                <p
                                    className="mt-3 text-xs font-bold"
                                    style={{ color: BRAND.cobre }}
                                >
                                    {rank.points_required}+ Vigor
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ====================================================== */}
            {/* SEÇÃO 4 - Ferramentas da Jornada */}
            {/* ====================================================== */}
            <section className="py-24" style={{ backgroundColor: BRAND.areia }}>
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div
                            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4"
                            style={{ backgroundColor: `${BRAND.cobre}20`, color: BRAND.cobre }}
                        >
                            Ferramentas da Jornada
                        </div>
                        <h2
                            className="text-4xl md:text-5xl font-black mb-4"
                            style={{ color: BRAND.petroleo }}
                        >
                            Como a Rota Gera Negócios Reais
                        </h2>
                    </div>

                    {/* 3 Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Confrarias */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                                style={{ backgroundColor: `${BRAND.verdeRota}15` }}
                            >
                                <HeartHandshake className="w-8 h-8" style={{ color: BRAND.verdeRota }} />
                            </div>
                            <h3 className="text-2xl font-black mb-4" style={{ color: BRAND.petroleo }}>
                                Confrarias
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Encontros estratégicos 1x1 onde você constrói relacionamentos sólidos,
                                troca conhecimento e cria oportunidades de negócio reais.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: BRAND.cobre }}>
                                <CheckCircle2 className="w-4 h-4" />
                                Recompensado por cada reunião
                            </div>
                        </div>

                        {/* Registro de Batalha */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                                style={{ backgroundColor: `${BRAND.cobre}15` }}
                            >
                                <Camera className="w-8 h-8" style={{ color: BRAND.cobre }} />
                            </div>
                            <h3 className="text-2xl font-black mb-4" style={{ color: BRAND.petroleo }}>
                                Registro de Batalha
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Seu diário de campo. Documente cada projeto, cada entrega,
                                cada desafio superado com fotos e vídeos reais.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: BRAND.cobre }}>
                                <CheckCircle2 className="w-4 h-4" />
                                Portfólio vivo que atrai clientes
                            </div>
                        </div>

                        {/* Ciclo de Projetos */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                                style={{ backgroundColor: `${BRAND.verdeRota}15` }}
                            >
                                <Rocket className="w-8 h-8" style={{ color: BRAND.verdeRota }} />
                            </div>
                            <h3 className="text-2xl font-black mb-4" style={{ color: BRAND.petroleo }}>
                                Ciclo de Projetos
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Lance projetos e entregue com excelência. A Rota premia cada etapa,
                                incentivando inovação, execução e comprometimento.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: BRAND.cobre }}>
                                <CheckCircle2 className="w-4 h-4" />
                                Pontos por lançamento e entrega
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ====================================================== */}
            {/* SEÇÃO 5 - Medalhas Permanentes */}
            {/* ====================================================== */}
            <section className="py-24" style={{ backgroundColor: 'white' }}>
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-16">
                        <div
                            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4"
                            style={{ backgroundColor: `${BRAND.verdeRota}15`, color: BRAND.verdeRota }}
                        >
                            Conquistas Permanentes
                        </div>
                        <h2
                            className="text-4xl md:text-5xl font-black mb-4"
                            style={{ color: BRAND.petroleo }}
                        >
                            Medalhas
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl">
                            Conquistas all-time que ficam para sempre no seu perfil. Marcos eternos da sua jornada.
                        </p>
                    </div>

                    {/* Grid de Medalhas */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {displayMedals.map((medal: typeof DEFAULT_MEDALS[0]) => (
                            <div
                                key={medal.id}
                                className="p-6 rounded-xl border-2 border-transparent hover:border-green-200 transition-all hover:shadow-md group"
                                style={{ backgroundColor: BRAND.areia }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: BRAND.verdeRota }}
                                    >
                                        <DynamicIcon name={medal.icon || 'Award'} className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">
                                            {medal.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                            {medal.description}
                                        </p>
                                        <p
                                            className="text-xs font-bold"
                                            style={{ color: BRAND.cobre }}
                                        >
                                            +{medal.points_reward} Vigor
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ====================================================== */}
            {/* SEÇÃO 6 - Proezas do Mês */}
            {/* ====================================================== */}
            <section
                className="py-24"
                style={{ background: `linear-gradient(135deg, ${BRAND.cobre}15 0%, ${BRAND.areia} 100%)` }}
            >
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                        <div>
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4"
                                style={{ backgroundColor: BRAND.cobre, color: 'white' }}
                            >
                                <Calendar className="w-4 h-4" />
                                Resetam Todo Mês
                            </div>
                            <h2
                                className="text-4xl md:text-5xl font-black mb-4"
                                style={{ color: BRAND.petroleo }}
                            >
                                Proezas do Mês
                            </h2>
                            <p className="text-lg text-gray-600 max-w-xl">
                                Desafios mensais que testam sua consistência e dedicação. Prove seu valor todo mês!
                            </p>
                        </div>
                        <div
                            className="text-right px-6 py-4 rounded-xl"
                            style={{ backgroundColor: `${BRAND.cobre}20` }}
                        >
                            <Flame className="w-8 h-8 mx-auto mb-2" style={{ color: BRAND.cobre }} />
                            <p className="text-sm font-bold text-gray-800">Temporada Ativa</p>
                            <p className="text-xs text-gray-500">Janeiro 2026</p>
                        </div>
                    </div>

                    {/* Grid de Proezas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {(PROEZAS.length > 0 ? PROEZAS : [
                            { id: 'rei', name: 'Rei do Mês', description: 'Mais confrarias validadas', points_base: 500, icon: 'Crown' },
                            { id: 'social', name: 'Social Butterfly', description: 'Mais elos criados', points_base: 300, icon: 'Users' },
                            { id: 'cronista', name: 'Cronista do Mês', description: 'Mais posts com fotos', points_base: 200, icon: 'Camera' },
                            { id: 'top3', name: 'Top 3 do Mês', description: 'Top 3 no ranking mensal', points_base: 300, icon: 'Trophy' },
                            { id: '5conf', name: '5 Confrarias', description: '5 confrarias no mês', points_base: 150, icon: 'HeartHandshake' },
                            { id: '10posts', name: '10 Posts', description: '10 posts no mês', points_base: 100, icon: 'FileText' },
                            { id: 'ativo', name: 'Ativo do Mês', description: 'Logou todos os dias', points_base: 200, icon: 'Calendar' },
                            { id: 'workaholic', name: 'Workaholic', description: 'Mais projetos entregues', points_base: 500, icon: 'Rocket' },
                        ]).map((proeza: { id: string; name: string; description: string; points_base: number; icon: string }) => (
                            <div
                                key={proeza.id}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center"
                            >
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: BRAND.cobre }}
                                >
                                    <DynamicIcon name={proeza.icon || 'Flame'} className="w-7 h-7 text-white" />
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">{proeza.name}</h4>
                                <p className="text-xs text-gray-500 mb-3">{proeza.description}</p>
                                <div
                                    className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                                    style={{ backgroundColor: `${BRAND.cobre}15`, color: BRAND.cobre }}
                                >
                                    +{proeza.points_base} Vigor
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ====================================================== */}
            {/* SEÇÃO 7 - Sistema de Pontos */}
            {/* ====================================================== */}
            <section className="py-24" style={{ backgroundColor: 'white' }}>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <h2
                                className="text-4xl md:text-5xl font-black mb-4"
                                style={{ color: BRAND.petroleo }}
                            >
                                Sistema de Pontos
                            </h2>
                            <p className="text-lg text-gray-600">
                                Vigor é a energia que você acumula ao participar ativamente da comunidade.
                            </p>
                        </div>

                        {/* Multiplicadores */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            {[
                                { name: 'Recruta', multiplier: '1x', desc: 'Plano básico', color: 'gray' },
                                { name: 'Veterano', multiplier: '1.5x', desc: 'Para quem quer crescer', color: BRAND.verdeRota },
                                { name: 'Elite', multiplier: '3x', desc: 'Visibilidade máxima', color: BRAND.cobre },
                            ].map((plan, i) => (
                                <div
                                    key={plan.name}
                                    className={`p-8 rounded-2xl text-center ${i === 2 ? 'shadow-xl scale-105' : 'shadow-md'}`}
                                    style={{
                                        backgroundColor: i === 2 ? BRAND.petroleo : BRAND.areia,
                                        color: i === 2 ? 'white' : BRAND.petroleo
                                    }}
                                >
                                    <p className="text-sm font-bold uppercase tracking-wider mb-2 opacity-70">
                                        {plan.name}
                                    </p>
                                    <p
                                        className="text-5xl font-black mb-2"
                                        style={{ color: i === 2 ? BRAND.cobre : plan.color }}
                                    >
                                        {plan.multiplier}
                                    </p>
                                    <p className="text-sm opacity-70">{plan.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Como ganhar pontos */}
                        <div
                            className="p-8 rounded-2xl"
                            style={{ backgroundColor: BRAND.areia }}
                        >
                            <h3 className="font-bold text-xl mb-6 text-center" style={{ color: BRAND.petroleo }}>
                                Como Ganhar Vigor
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { action: 'Completar perfil', points: '+100' },
                                    { action: 'Fazer confraria', points: '+50' },
                                    { action: 'Postar trabalho', points: '+30' },
                                    { action: 'Receber avaliação', points: '+20' },
                                    { action: 'Lançar projeto', points: '+50' },
                                    { action: 'Entregar projeto', points: '+100' },
                                    { action: 'Indicar membro', points: '+150' },
                                    { action: 'Conquistar medalha', points: 'Variável' },
                                ].map((item) => (
                                    <div key={item.action} className="flex justify-between items-center p-4 bg-white rounded-lg">
                                        <span className="text-sm text-gray-700">{item.action}</span>
                                        <span className="font-bold text-sm" style={{ color: BRAND.cobre }}>{item.points}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ====================================================== */}
            {/* CTA FINAL */}
            {/* ====================================================== */}
            <section className="py-24" style={{ backgroundColor: BRAND.petroleo }}>
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 max-w-3xl mx-auto leading-tight">
                        O Mercado Espera<br />
                        pelos <span style={{ color: BRAND.cobre }}>Valentes</span>
                    </h2>
                    <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                        Você está pronto para a próxima escalada?
                    </p>
                    <Link href="/auth/register">
                        <Button
                            size="lg"
                            className="h-16 px-12 text-lg font-black rounded-xl uppercase"
                            style={{ backgroundColor: BRAND.cobre, color: 'white' }}
                        >
                            Junte-se ao Acampamento
                            <ArrowRight className="ml-3 w-6 h-6" />
                        </Button>
                    </Link>
                </div>
            </section>


            {/* ====================================================== */}
            {/* FOOTER */}
            {/* ====================================================== */}
            <footer className="py-12" style={{ backgroundColor: BRAND.verdeRota }}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Image
                                src="/images/logo-rota-valente.png"
                                alt="Rota Business Club"
                                width={160}
                                height={50}
                                className="h-10 w-auto brightness-0 invert"
                            />
                        </div>
                        <p className="text-white/70 text-sm">
                            © 2026 Rota Business Club. Todos os direitos reservados.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/sobre" className="text-white/70 hover:text-white text-sm font-medium">
                                Sobre
                            </Link>
                            <Link href="/planos" className="text-white/70 hover:text-white text-sm font-medium">
                                Planos
                            </Link>
                            <Link href="/contato" className="text-white/70 hover:text-white text-sm font-medium">
                                Contato
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    )
}
