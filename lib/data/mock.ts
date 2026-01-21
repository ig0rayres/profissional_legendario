export interface Professional {
    id: string
    user_id: string
    full_name: string
    email: string
    bio: string
    specialties: string[]
    hourly_rate: number
    avatar_url: string | null
    rating: number
    total_reviews: number
    location: string
    verified: boolean
}

export interface Project {
    id: string
    title: string
    description: string
    budget: number
    status: 'open' | 'in_progress' | 'completed'
    client_name: string
    created_at: string
}

export interface Review {
    id: string
    professional_id: string
    client_name: string
    rating: number
    comment: string
    created_at: string
}

export interface Rank {
    id: string
    name: string
    min_xp: number
    max_xp: number | null
    multiplier: number
    display_order: number
    icon_key: string
}

export interface Badge {
    id: string
    name: string
    description: string
    xp_reward: number
    criteria_type: string
    benefit_description?: string
    icon_key: string
}

export interface UserGamification {
    user_id: string
    total_xp: number
    current_rank_id: string
    badges_earned: {
        badge_id: string
        earned_at: string
    }[]
}

export type NotificationType = 'institutional' | 'invitation' | 'profile' | 'security' | 'promo' | 'critical'
export type NotificationPriority = 'normal' | 'high' | 'critical'
export type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled'
export type DeliveryChannel = 'in-app' | 'push' | 'email' | 'sms'

// Service Categories
export interface ServiceCategory {
    id: string
    name: string
    slug: string
    description: string
    icon: string // lucide icon name
    color: string // hex color
    active: boolean
    userCount?: number
    projectCount?: number
    createdAt: string
}

// Marketplace Categories
export interface MarketplaceCategory {
    id: string
    name: string
    slug: string
    description: string
    expirationDays: number // Days until listing auto-expires
    icon: string
    color: string
    active: boolean
    listingCount?: number
    createdAt: string
}

// Marketplace Listings
export interface MarketplaceListing {
    id: string
    title: string
    description: string
    price: number
    categoryId: string
    categoryName: string
    sellerId: string
    sellerName: string
    sellerEmail: string
    location: string
    images: string[]
    createdAt: string
    expiresAt: string
    status: 'active' | 'expired' | 'sold' | 'removed'
    views: number
    // Vehicle-specific fields
    vehicleBrand?: string      // Montadora (ex: Toyota, Honda)
    vehicleModel?: string       // Modelo (ex: Corolla, Civic)
    vehicleYear?: number        // Ano (ex: 2020)
    vehicleKm?: number          // Quilometragem (ex: 15000)
    vehicleColor?: string       // Cor (ex: Prata)
}

// Gamification Admin - Points Actions
export interface PointsAction {
    id: string
    name: string
    description: string
    points: number
    dailyLimit?: number
    active: boolean
    timesExecuted: number
    category: string
    createdAt: string
}

// Gamification Admin - User Points & Rankings
export interface UserPoints {
    id: string
    userId: string
    userName: string
    userEmail: string
    totalPoints: number
    rank: number
    currentRankId: string
    badgesEarned: string[] // badge IDs
    recentActions: {
        actionName: string
        points: number
        date: string
    }[]
    lastUpdated: string
}

export interface NotificationTemplate {
    id: string
    name: string
    type: NotificationType
    subject_template: string
    body_template_html: string
    body_template_text: string
    created_at: string
    updated_at: string
    version: number
}

export interface NotificationCampaign {
    id: string
    title: string
    type: NotificationType
    priority: NotificationPriority
    channels: DeliveryChannel[]
    segmentation_filters: {
        plans?: string[]
        regions?: string[]
        last_login_days?: number
        min_xp?: number
        ranks?: string[]
        tags?: string[]
    }
    scheduled_for?: string
    status: NotificationStatus
    created_at: string
    created_by: string
    template_id?: string
}

export interface Notification {
    id: string
    campaign_id: string
    user_id: string
    title: string
    body: string
    type: NotificationType
    priority: NotificationPriority
    read_at?: string
    clicked_at?: string
    created_at: string
    status: 'delivered' | 'failed'
    cta_link?: string
}

export interface UserNotificationPreference {
    user_id: string
    channel_preferences: {
        channel: DeliveryChannel
        enabled: boolean
        types: NotificationType[]
    }[]
}

export const MOCK_RANKS: Rank[] = [
    { id: 'recruta', name: 'Recruta', min_xp: 0, max_xp: 199, multiplier: 1.00, display_order: 1, icon_key: 'recruta' },
    { id: 'especialista', name: 'Especialista', min_xp: 200, max_xp: 499, multiplier: 1.00, display_order: 2, icon_key: 'especialista' },
    { id: 'veterano', name: 'Veterano', min_xp: 500, max_xp: 999, multiplier: 1.00, display_order: 3, icon_key: 'veterano' },
    { id: 'comandante', name: 'Comandante', min_xp: 1000, max_xp: 1999, multiplier: 1.50, display_order: 4, icon_key: 'comandante' },
    { id: 'general', name: 'General', min_xp: 2000, max_xp: 3499, multiplier: 2.00, display_order: 5, icon_key: 'general' },
    { id: 'lenda', name: 'Lenda', min_xp: 3500, max_xp: null, multiplier: 3.00, display_order: 6, icon_key: 'lenda' },
]

export const MOCK_BADGES: Badge[] = [
    { id: 'alistamento_concluido', name: 'Alistamento Concluído', description: 'Completar 100% do perfil', xp_reward: 100, criteria_type: 'profile_completion', benefit_description: 'Desbloqueia aparição em buscas', icon_key: 'user-check' },
    { id: 'primeiro_sangue', name: 'Primeiro Sangue', description: 'Primeira venda/contrato fechado', xp_reward: 50, criteria_type: 'first_contract', benefit_description: 'Selo "Profissional Ativo"', icon_key: 'sword' },
    { id: 'batismo_excelencia', name: 'Batismo de Excelência', description: 'Primeira avaliação 5 estrelas', xp_reward: 80, criteria_type: 'first_five_star', benefit_description: 'Tag "Altamente Recomendado" por 7 dias', icon_key: 'sparkles' },
    { id: 'cinegrafista_campo', name: 'Cinegrafista de Campo', description: 'Primeiro upload de relatório/foto', xp_reward: 30, criteria_type: 'first_report', benefit_description: 'Desbloqueia aba "Portfólio"', icon_key: 'video' },
    { id: 'missao_cumprida', name: 'Missão Cumprida', description: 'Marcar 1º serviço como concluído', xp_reward: 100, criteria_type: 'first_service_done', benefit_description: 'Boost de prioridade nas buscas por 48h', icon_key: 'flag' },
    { id: 'inabalavel', name: 'Inabalável', description: 'Manter média 5★ após 5 trabalhos avaliados', xp_reward: 150, criteria_type: 'five_star_streak', benefit_description: 'Selo "Padrão Ouro"', icon_key: 'hammer' },
    { id: 'irmandade', name: 'Irmandade', description: 'Contratar outro membro do Club', xp_reward: 75, criteria_type: 'peer_hire', benefit_description: 'Badge "Membro da Confraria"', icon_key: 'heart-handshake' },
    { id: 'pronto_missao', name: 'Pronto para a Missão', description: 'Responder 5 demandas em <2h', xp_reward: 50, criteria_type: 'fast_response_streak', benefit_description: 'Tag "Resposta Rápida" por 7 dias', icon_key: 'zap' },
    { id: 'recrutador', name: 'Recrutador', description: 'Indicar 3 novos membros', xp_reward: 150, criteria_type: 'referral_streak', benefit_description: 'Desconto de 10% na mensalidade', icon_key: 'megaphone' },
    { id: 'veterano_guerra', name: 'Veterano de Guerra', description: 'Completar 20 serviços', xp_reward: 300, criteria_type: 'services_count', benefit_description: 'Acesso ao fórum exclusivo', icon_key: 'mountain' },
    { id: 'sentinela_elite', name: 'Sentinela de Elite', description: 'Manter Plano Elite por 3 meses', xp_reward: 500, criteria_type: 'premium_loyalty', benefit_description: 'Convite ao grupo de líderes', icon_key: 'gem' },
    { id: 'sentinela_inabalavel', name: 'Sentinela Inabalável', description: 'Manter-se ativo por 30 dias consecutivos', xp_reward: 200, criteria_type: 'retention_streak', benefit_description: 'Selo "Membro Resiliente"', icon_key: 'anchor' },
    // Medalhas de Confraria (Rota do Valente - Mensal)
    { id: 'primeira_confraria', name: 'Primeira Confraria', description: 'Realizar primeira confraternização', xp_reward: 100, criteria_type: 'first_confraternity', benefit_description: 'Badge de membro ativo', icon_key: 'handshake' },
    { id: 'networker_ativo', name: 'Networker Ativo', description: 'Realizar 2 confrarias no mês', xp_reward: 200, criteria_type: 'confraternities_monthly_2', benefit_description: 'Destaque em networking', icon_key: 'network' },
    { id: 'lider_confraria', name: 'Líder de Confraria', description: 'Realizar 5 confrarias no mês', xp_reward: 500, criteria_type: 'confraternities_monthly_5', benefit_description: 'Badge de Líder no perfil', icon_key: 'trophy' },
    { id: 'mestre_conexoes', name: 'Mestre das Conexões', description: 'Realizar 10 confrarias no mês', xp_reward: 1000, criteria_type: 'confraternities_monthly_10', benefit_description: 'Acesso VIP a eventos', icon_key: 'crown' },
    { id: 'anfitriao', name: 'Anfitrião', description: 'Ser anfitrião de confraternização', xp_reward: 150, criteria_type: 'first_hosting', benefit_description: 'Badge de Anfitrião no perfil', icon_key: 'party-popper' },
    { id: 'cronista', name: 'Cronista', description: 'Adicionar fotos em confraternização', xp_reward: 50, criteria_type: 'first_confraternity_photo', benefit_description: 'Badge de Cronista no perfil', icon_key: 'camera' },
    { id: 'presente', name: 'Presente', description: 'Aceitar primeiro elo (conexão)', xp_reward: 50, criteria_type: 'first_connection', benefit_description: 'Badge de presença no perfil', icon_key: 'users' },
]

export const MOCK_POINTS_ACTIONS: PointsAction[] = [
    { id: '1', name: 'Perfil Completo', description: 'Completar 100% do perfil profissional', points: 100, dailyLimit: 1, active: true, timesExecuted: 245, category: 'Perfil', createdAt: '2024-01-01T00:00:00Z' },
    { id: '2', name: 'Primeiro Contrato', description: 'Fechar primeiro contrato ou venda', points: 50, active: true, timesExecuted: 89, category: 'Contratos', createdAt: '2024-01-01T00:00:00Z' },
    { id: '3', name: 'Avaliação 5 Estrelas', description: 'Receber avaliação de 5 estrelas', points: 80, active: true, timesExecuted: 456, category: 'Avaliações', createdAt: '2024-01-01T00:00:00Z' },
    { id: '4', name: 'Serviço Concluído', description: 'Concluir um serviço com confirmação', points: 100, active: true, timesExecuted: 678, category: 'Serviços', createdAt: '2024-01-01T00:00:00Z' },
    { id: '5', name: 'Upload de Portfólio', description: 'Fazer upload de foto/relatório no portfólio', points: 30, dailyLimit: 3, active: true, timesExecuted: 1203, category: 'Portfólio', createdAt: '2024-01-01T00:00:00Z' },
    { id: '6', name: 'Resposta Rápida', description: 'Responder demanda em menos de 2 horas', points: 50, dailyLimit: 5, active: true, timesExecuted: 892, category: 'Atendimento', createdAt: '2024-01-01T00:00:00Z' },
    { id: '7', name: 'Indicação de Membro', description: 'Indicar novo membro que complete cadastro', points: 150, active: true, timesExecuted: 134, category: 'Indicações', createdAt: '2024-01-01T00:00:00Z' },
    { id: '8', name: 'Participação em Evento', description: 'Participar de evento oficial da plataforma', points: 200, active: true, timesExecuted: 567, category: 'Eventos', createdAt: '2024-01-01T00:00:00Z' },
    { id: '9', name: 'Anúncio no Marketplace', description: 'Publicar anúncio no marketplace', points: 25, dailyLimit: 2, active: true, timesExecuted: 345, category: 'Marketplace', createdAt: '2024-01-01T00:00:00Z' },
    { id: '10', name: 'Atualização de Perfil', description: 'Atualizar informações do perfil', points: 10, dailyLimit: 10, active: true, timesExecuted: 2341, category: 'Perfil', createdAt: '2024-01-01T00:00:00Z' },
]

export const MOCK_USER_POINTS: UserPoints[] = [
    {
        id: '1',
        userId: '2',
        userName: 'Pr. Erick Cabral',
        userEmail: 'erick@rotabusiness.com',
        totalPoints: 3850,
        rank: 1,
        currentRankId: 'lenda',
        badgesEarned: ['alistamento_concluido', 'primeiro_sangue', 'batismo_excelencia', 'missao_cumprida', 'inabalavel', 'veterano_guerra', 'sentinela_elite'],
        recentActions: [
            { actionName: 'Serviço Concluído', points: 100, date: '2025-01-15T10:30:00Z' },
            { actionName: 'Avaliação 5 Estrelas', points: 80, date: '2025-01-14T15:45:00Z' },
            { actionName: 'Resposta Rápida', points: 50, date: '2025-01-14T09:20:00Z' },
        ],
        lastUpdated: '2025-01-15T10:30:00Z'
    },
    {
        id: '2',
        userId: '3',
        userName: 'Pr. Silvio Lacerda',
        userEmail: 'silvio@rotabusiness.com',
        totalPoints: 2890,
        rank: 2,
        currentRankId: 'general',
        badgesEarned: ['alistamento_concluido', 'primeiro_sangue', 'missao_cumprida', 'inabalavel', 'irmandade'],
        recentActions: [
            { actionName: 'Participação em Evento', points: 200, date: '2025-01-15T08:00:00Z' },
            { actionName: 'Atualização de Perfil', points: 10, date: '2025-01-13T14:30:00Z' },
        ],
        lastUpdated: '2025-01-15T08:00:00Z'
    },
    {
        id: '3',
        userId: '4',
        userName: 'Matheus Artal',
        userEmail: 'matheus@rotabusiness.com',
        totalPoints: 1450,
        rank: 3,
        currentRankId: 'comandante',
        badgesEarned: ['alistamento_concluido', 'primeiro_sangue', 'cinegrafista_campo', 'recrutador'],
        recentActions: [
            { actionName: 'Indicação de Membro', points: 150, date: '2025-01-14T16:20:00Z' },
            { actionName: 'Anúncio no Marketplace', points: 25, date: '2025-01-12T11:15:00Z' },
        ],
        lastUpdated: '2025-01-14T16:20:00Z'
    },
    {
        id: '4',
        userId: '5',
        userName: 'Paulo Júnior',
        userEmail: 'paulo@rotabusiness.com',
        totalPoints: 850,
        rank: 4,
        currentRankId: 'veterano',
        badgesEarned: ['alistamento_concluido', 'cinegrafista_campo', 'pronto_missao'],
        recentActions: [
            { actionName: 'Upload de Portfólio', points: 30, date: '2025-01-15T07:45:00Z' },
            { actionName: 'Resposta Rápida', points: 50, date: '2025-01-14T18:30:00Z' },
        ],
        lastUpdated: '2025-01-15T07:45:00Z'
    },
    {
        id: '5',
        userId: '6',
        userName: 'Renan Di Carli',
        userEmail: 'renan@rotabusiness.com',
        totalPoints: 420,
        rank: 5,
        currentRankId: 'especialista',
        badgesEarned: ['alistamento_concluido', 'primeiro_sangue'],
        recentActions: [
            { actionName: 'Perfil Completo', points: 100, date: '2025-01-15T12:00:00Z' },
            { actionName: 'Atualização de Perfil', points: 10, date: '2025-01-15T11:50:00Z' },
        ],
        lastUpdated: '2025-01-15T12:00:00Z'
    },
]

export const MOCK_PROFESSIONALS: Professional[] = [
    {
        id: '1',
        user_id: '2',
        full_name: 'Pr. Erick Cabral',
        email: 'erick@rotabusiness.com',
        bio: 'Pastor e líder visionário. Apaixonado por transformar vidas através do evangelho e do discipulado.',
        specialties: ['Teologia', 'Liderança Eclesiástica', 'Aconselhamento', 'Pregação'],
        hourly_rate: 0,
        avatar_url: '/avatars/erick-cabral.jpg',
        rating: 5.0,
        total_reviews: 150,
        location: 'São Paulo, SP',
        verified: true
    },
    {
        id: '2',
        user_id: '3',
        full_name: 'Pr. Silvio Lacerda',
        email: 'silvio@rotabusiness.com',
        bio: 'Líder e mentor na comunidade Rota Business. Dedicado a fortalecer homens em sua caminhada de fé e propósito.',
        specialties: ['Liderança', 'Mentoria', 'Espiritualidade', 'Família'],
        hourly_rate: 0,
        avatar_url: '/avatars/prof-2.jpg',
        rating: 5.0,
        total_reviews: 120,
        location: 'São Paulo, SP',
        verified: true
    },
    {
        id: '3',
        user_id: '4',
        full_name: 'Matheus Artal',
        email: 'matheus@rotabusiness.com',
        bio: 'Coordenador de voz e liderança de campo. Especialista em organização de grandes eventos e gestão de equipes.',
        specialties: ['Coordenação', 'Gestão de Equipes', 'Logística', 'Comunicação'],
        hourly_rate: 0,
        avatar_url: '/avatars/matheus-artal.jpg',
        rating: 5.0,
        total_reviews: 98,
        location: 'Ribeirão Preto, SP',
        verified: true
    },
    {
        id: '4',
        user_id: '5',
        full_name: 'Paulo Júnior',
        email: 'paulo@rotabusiness.com',
        bio: 'Membro ativo da comunidade Rota Business. Participante assíduo de eventos e trilhas de aventura.',
        specialties: ['Aventura', 'Esportes', 'Networking', 'Comunidade'],
        hourly_rate: 0,
        avatar_url: '/avatars/paulo-junior.jpg',
        rating: 4.9,
        total_reviews: 75,
        location: 'Ribeirão Preto, SP',
        verified: true
    },
    {
        id: '5',
        user_id: '6',
        full_name: 'Carlos Mendes',
        email: 'carlos@example.com',
        bio: 'Desenvolvedor Mobile especializado em React Native e Flutter. Criador de apps com milhões de downloads.',
        specialties: ['React Native', 'Flutter', 'iOS', 'Android'],
        hourly_rate: 160,
        avatar_url: '/avatars/prof-5.jpg',
        rating: 4.9,
        total_reviews: 55,
        location: 'Porto Alegre, RS',
        verified: true
    },
    {
        id: '6',
        user_id: '7',
        full_name: 'Ricardo Oliveira',
        email: 'ricardo@example.com',
        bio: 'Estrategista de Marketing com foco em lançamentos digitais e branding. Especialista em escalar negócios.',
        specialties: ['Marketing Digital', 'Lançamentos', 'Branding', 'Copywriting'],
        hourly_rate: 180,
        avatar_url: '/avatars/prof-6.jpg',
        rating: 5.0,
        total_reviews: 42,
        location: 'Belo Horizonte, MG',
        verified: true
    },
    {
        id: '7',
        user_id: '8',
        full_name: 'Felipe Santos',
        email: 'felipe@example.com',
        bio: 'Engenheiro de Software com experiência em arquitetura de microsserviços e escalabilidade global.',
        specialties: ['Rust', 'Go', 'Kubernetes', 'Cloud Architecture'],
        hourly_rate: 250,
        avatar_url: '/avatars/prof-7.jpg',
        rating: 4.9,
        total_reviews: 31,
        location: 'Curitiba, PR',
        verified: true
    },
    {
        id: '8',
        user_id: '9',
        full_name: 'Daniel Rocha',
        email: 'daniel@example.com',
        bio: 'Consultor Financeiro para empresas de tecnologia. Foco em gestão de caixa e rodadas de investimento.',
        specialties: ['Gestão Financeira', 'M&A', 'Venture Capital', 'Estratégia'],
        hourly_rate: 300,
        avatar_url: '/avatars/prof-8.jpg',
        rating: 5.0,
        total_reviews: 15,
        location: 'Florianópolis, SC',
        verified: true
    }
]

export const MOCK_USER_GAMIFICATION: UserGamification[] = [
    {
        user_id: '2', // Erick Cabral
        total_xp: 3800,
        current_rank_id: 'lenda',
        badges_earned: [
            { badge_id: 'alistamento_concluido', earned_at: '2023-01-01' },
            { badge_id: 'primeiro_sangue', earned_at: '2023-01-15' },
            { badge_id: 'batismo_excelencia', earned_at: '2023-02-01' },
            { badge_id: 'veterano_guerra', earned_at: '2024-01-10' },
            { badge_id: 'sentinela_elite', earned_at: '2024-03-01' }
        ]
    },
    {
        user_id: '3', // Silvio Lacerda
        total_xp: 2800,
        current_rank_id: 'general',
        badges_earned: [
            { badge_id: 'alistamento_concluido', earned_at: '2023-03-01' },
            { badge_id: 'primeiro_sangue', earned_at: '2023-04-10' },
            { badge_id: 'inabalavel', earned_at: '2023-12-15' }
        ]
    },
    {
        user_id: '4', // Matheus Artal
        total_xp: 1250,
        current_rank_id: 'comandante',
        badges_earned: [
            { badge_id: 'alistamento_concluido', earned_at: '2024-01-05' },
            { badge_id: 'cinegrafista_campo', earned_at: '2024-01-12' }
        ]
    },
    {
        user_id: '5', // Paulo Júnior
        total_xp: 850,
        current_rank_id: 'veterano',
        badges_earned: [
            { badge_id: 'alistamento_concluido', earned_at: '2024-02-01' },
            { badge_id: 'irmandade', earned_at: '2024-02-20' }
        ]
    }
]

export const MOCK_PROJECTS: Project[] = [
    {
        id: '1',
        title: 'Desenvolvimento de E-commerce',
        description: 'Preciso de um desenvolvedor para criar uma loja online completa com integração de pagamentos.',
        budget: 15000,
        status: 'open',
        client_name: 'Loja XYZ',
        created_at: '2024-12-01T10:00:00Z'
    },
    {
        id: '2',
        title: 'Redesign de Aplicativo Mobile',
        description: 'Busco designer UX/UI para modernizar nosso aplicativo de delivery.',
        budget: 8000,
        status: 'open',
        client_name: 'Delivery Fast',
        created_at: '2024-12-05T14:30:00Z'
    },
    {
        id: '3',
        title: 'Migração para Cloud AWS',
        description: 'Necessito de especialista DevOps para migrar infraestrutura para AWS.',
        budget: 25000,
        status: 'in_progress',
        client_name: 'TechCorp',
        created_at: '2024-11-28T09:15:00Z'
    }
]

export const MOCK_REVIEWS: Review[] = [
    {
        id: '1',
        professional_id: '1',
        client_name: 'Empresa ABC',
        rating: 5,
        comment: 'Excelente profissional! Entregou o projeto antes do prazo e com qualidade excepcional.',
        created_at: '2024-11-20T16:00:00Z'
    },
    {
        id: '1',
        professional_id: '1',
        client_name: 'Startup Tech',
        rating: 5,
        comment: 'Muito competente e comunicativo. Recomendo fortemente!',
        created_at: '2024-11-15T11:30:00Z'
    },
    {
        id: '3',
        professional_id: '2',
        client_name: 'Design Studio',
        rating: 5,
        comment: 'Trabalho impecável! As interfaces ficaram lindas e muito funcionais.',
        created_at: '2024-11-18T14:45:00Z'
    }
]

export const MOCK_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
    {
        id: 'temp_1',
        name: 'Aviso de Manutenção',
        type: 'critical',
        subject_template: 'Manutenção Programada: Rota Business Club',
        body_template_html: '<p>Atenção {first_name}, haverá manutenção programada em {date} das {start_time} às {end_time}. Durante esse período alguns serviços poderão ficar indisponíveis.</p>',
        body_template_text: 'Atenção {first_name}, haverá manutenção programada em {date} das {start_time} às {end_time}.',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        version: 1
    },
    {
        id: 'temp_2',
        name: 'Convite para Evento',
        type: 'invitation',
        subject_template: 'Você foi convidado: {event_name}',
        body_template_html: '<p>Olá {first_name}, você foi convidado para o evento "{event_name}" em {event_date}. Confirme presença no link abaixo.</p>',
        body_template_text: 'Olá {first_name}, você foi convidado para o evento "{event_name}" em {event_date}.',
        created_at: '2024-01-05T10:00:00Z',
        updated_at: '2024-01-05T10:00:00Z',
        version: 1
    }
]

export const MOCK_NOTIFICATION_CAMPAIGNS: NotificationCampaign[] = [
    {
        id: 'camp_1',
        title: 'Lançamento do Sistema de Vigor',
        type: 'institutional',
        priority: 'high',
        channels: ['in-app', 'email'],
        segmentation_filters: { plans: ['Recruta', 'Veterano', 'Elite'] },
        status: 'sent',
        created_at: '2024-01-10T09:00:00Z',
        created_by: 'admin_1'
    }
]

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'not_1',
        campaign_id: 'camp_1',
        user_id: '2', // Erick Cabral
        title: 'Bem-vindo ao Novo Sistema de Vigor!',
        body: 'Olá Erick, agora suas ações no Club geram Vigor e aumentam sua patente.',
        type: 'institutional',
        priority: 'high',
        created_at: '2024-01-10T10:00:00Z',
        status: 'delivered',
        read_at: '2024-01-10T11:00:00Z'
    },
    {
        id: 'not_2',
        campaign_id: 'camp_1',
        user_id: '3', // Silvio Lacerda
        title: 'Bem-vindo ao Novo Sistema de Vigor!',
        body: 'Olá Silvio, agora suas ações no Club geram Vigor e aumentam sua patente.',
        type: 'institutional',
        priority: 'high',
        created_at: '2024-01-10T10:00:00Z',
        status: 'delivered'
    }
]

export const MOCK_USER_NOTIFICATION_PREFERENCES: UserNotificationPreference[] = [
    {
        user_id: '2',
        channel_preferences: [
            { channel: 'in-app', enabled: true, types: ['institutional', 'invitation', 'profile', 'security', 'critical'] },
            { channel: 'email', enabled: true, types: ['security', 'critical'] },
            { channel: 'push', enabled: false, types: [] }
        ]
    }
]

export const MOCK_CATEGORIES: ServiceCategory[] = [
    {
        id: '1',
        name: 'Teologia',
        slug: 'teologia',
        description: 'Estudos bíblicos, pregação e ensino teológico',
        icon: 'Book',
        color: '#8B5CF6',
        active: true,
        userCount: 15,
        projectCount: 8,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        name: 'Liderança',
        slug: 'lideranca',
        description: 'Desenvolvimento de líderes e gestão de equipes',
        icon: 'Users',
        color: '#3B82F6',
        active: true,
        userCount: 28,
        projectCount: 12,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '3',
        name: 'Mentoria',
        slug: 'mentoria',
        description: 'Acompanhamento pessoal e desenvolvimento individual',
        icon: 'Heart',
        color: '#EC4899',
        active: true,
        userCount: 22,
        projectCount: 15,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '4',
        name: 'Coordenação',
        slug: 'coordenacao',
        description: 'Organização de eventos e gestão operacional',
        icon: 'ClipboardList',
        color: '#10B981',
        active: true,
        userCount: 18,
        projectCount: 10,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '5',
        name: 'Gestão de Equipes',
        slug: 'gestao-equipes',
        description: 'Liderança de times e desenvolvimento organizacional',
        icon: 'LayoutGrid',
        color: '#F59E0B',
        active: true,
        userCount: 24,
        projectCount: 9,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '6',
        name: 'Marketing Digital',
        slug: 'marketing-digital',
        description: 'Estratégias digitais, redes sociais e branding',
        icon: 'TrendingUp',
        color: '#EF4444',
        active: true,
        userCount: 32,
        projectCount: 18,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '7',
        name: 'Desenvolvimento',
        slug: 'desenvolvimento',
        description: 'Programação, aplicativos e soluções tecnológicas',
        icon: 'Code',
        color: '#6366F1',
        active: true,
        userCount: 45,
        projectCount: 25,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '8',
        name: 'Consultoria Financeira',
        slug: 'consultoria-financeira',
        description: 'Planejamento financeiro e gestão de investimentos',
        icon: 'DollarSign',
        color: '#059669',
        active: true,
        userCount: 12,
        projectCount: 7,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '9',
        name: 'Design Gráfico',
        slug: 'design-grafico',
        description: 'Criação visual, identidade e materiais gráficos',
        icon: 'Palette',
        color: '#8B5CF6',
        active: true,
        userCount: 28,
        projectCount: 16,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '10',
        name: 'Recursos Humanos',
        slug: 'recursos-humanos',
        description: 'Gestão de pessoas, recrutamento e cultura organizacional',
        icon: 'UserCheck',
        color: '#14B8A6',
        active: true,
        userCount: 14,
        projectCount: 6,
        createdAt: '2024-01-01T00:00:00Z'
    }
]


export const MOCK_MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
    {
        id: '1',
        name: 'Veículos',
        slug: 'veiculos',
        description: 'Carros, motos e outros veículos - Montadora, Modelo, Ano, Quilometragem, Cor',
        expirationDays: 30,
        icon: 'Car',
        color: '#EF4444',
        active: true,
        listingCount: 3,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        name: 'Imóveis',
        slug: 'imoveis',
        description: 'Casas, apartamentos, terrenos - Tipo de Oferta, Área, Quartos, Banheiros',
        expirationDays: 30,
        icon: 'Home',
        color: '#3B82F6',
        active: true,
        listingCount: 2,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '3',
        name: 'Artigos domésticos',
        slug: 'artigos-domesticos',
        description: 'Móveis, eletrodomésticos e itens para casa',
        expirationDays: 30,
        icon: 'Sofa',
        color: '#F59E0B',
        active: true,
        listingCount: 1,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '4',
        name: 'Artigos esportivos',
        slug: 'artigos-esportivos',
        description: 'Equipamentos e acessórios para esportes',
        expirationDays: 30,
        icon: 'Dumbbell',
        color: '#10B981',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '5',
        name: 'Artigos para animais de estimação',
        slug: 'artigos-para-animais',
        description: 'Produtos e acessórios para pets',
        expirationDays: 30,
        icon: 'Dog',
        color: '#EC4899',
        active: true,
        listingCount: 1,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '6',
        name: 'Artigos para escritório',
        slug: 'artigos-para-escritorio',
        description: 'Móveis e equipamentos de escritório',
        expirationDays: 30,
        icon: 'Briefcase',
        color: '#6366F1',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '7',
        name: 'Brinquedos e jogos',
        slug: 'brinquedos-e-jogos',
        description: 'Brinquedos, jogos e entretenimento infantil',
        expirationDays: 30,
        icon: 'Gamepad2',
        color: '#F59E0B',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '8',
        name: 'Classificados',
        slug: 'classificados',
        description: 'Anúncios gerais e diversos',
        expirationDays: 30,
        icon: 'Newspaper',
        color: '#64748B',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '9',
        name: 'Eletrônicos',
        slug: 'eletronicos',
        description: 'Computadores, celulares, TVs e eletrônicos em geral',
        expirationDays: 30,
        icon: 'Smartphone',
        color: '#8B5CF6',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '10',
        name: 'Entretenimento',
        slug: 'entretenimento',
        description: 'Filmes, música, livros e arte',
        expirationDays: 30,
        icon: 'Film',
        color: '#EC4899',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '11',
        name: 'Família',
        slug: 'familia',
        description: 'Artigos para bebês, crianças e família',
        expirationDays: 30,
        icon: 'Users',
        color: '#F59E0B',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '12',
        name: 'Hobbies',
        slug: 'hobbies',
        description: 'Colecionáveis, artesanato e passatempos',
        expirationDays: 30,
        icon: 'Palette',
        color: '#10B981',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '13',
        name: 'Instrumentos musicais',
        slug: 'instrumentos-musicais',
        description: 'Instrumentos e equipamentos musicais',
        expirationDays: 30,
        icon: 'Music',
        color: '#8B5CF6',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '14',
        name: 'Itens gratuitos',
        slug: 'itens-gratuitos',
        description: 'Doações e itens gratuitos',
        expirationDays: 30,
        icon: 'Gift',
        color: '#10B981',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '15',
        name: 'Jardim e ambientes externos',
        slug: 'jardim-e-ambientes-externos',
        description: 'Plantas, ferramentas e decoração para jardim',
        expirationDays: 30,
        icon: 'Flower2',
        color: '#22C55E',
        active: true,
        listingCount: 0,
        createdAt: '2024-01-01T00:00:00Z'
    }
]

// Helper function to calculate expiration date
const calculateExpirationDate = (createdAt: string, daysToExpire: number): string => {
    const created = new Date(createdAt)
    const expiration = new Date(created)
    expiration.setDate(expiration.getDate() + daysToExpire)
    return expiration.toISOString()
}

export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
    {
        id: '1',
        title: 'Apartamento 2 quartos - Centro',
        description: 'Apartamento bem localizado no centro da cidade, 2 quartos, 1 suíte, 2 banheiros, varanda, garagem para 1 carro.',
        price: 350000,
        categoryId: '1',
        categoryName: 'Imóveis',
        sellerId: '2',
        sellerName: 'Pr. Erick Cabral',
        sellerEmail: 'erick@rotabusiness.com',
        location: 'São Paulo, SP',
        images: ['/marketplace/apt1.jpg'],
        createdAt: '2024-12-01T10:00:00Z',
        expiresAt: calculateExpirationDate('2024-12-01T10:00:00Z', 60),
        status: 'active',
        views: 245
    },
    {
        id: '2',
        title: 'Toyota Corolla 2020',
        description: 'Corolla XEi 2.0 Automático, único dono, todas revisões em concessionária, IPVA 2025 pago.',
        price: 85000,
        categoryId: '2',
        categoryName: 'Veículos',
        sellerId: '3',
        sellerName: 'Pr. Silvio Lacerda',
        sellerEmail: 'silvio@rotabusiness.com',
        location: 'Ribeirão Preto, SP',
        images: ['/marketplace/car1.jpg'],
        createdAt: '2024-12-10T14:30:00Z',
        expiresAt: calculateExpirationDate('2024-12-10T14:30:00Z', 30),
        status: 'active',
        views: 189,
        vehicleBrand: 'Toyota',
        vehicleModel: 'Corolla XEi 2.0',
        vehicleYear: 2020,
        vehicleKm: 45000,
        vehicleColor: 'Prata'
    },
    {
        id: '3',
        title: 'MacBook Pro M2 16GB',
        description: 'MacBook Pro 2023, chip M2, 16GB RAM, 512GB SSD, em perfeito estado com nota fiscal.',
        price: 12000,
        categoryId: '3',
        categoryName: 'Eletrônicos',
        sellerId: '4',
        sellerName: 'Matheus Artal',
        sellerEmail: 'matheus@rotabusiness.com',
        location: 'São Paulo, SP',
        images: ['/marketplace/mac1.jpg'],
        createdAt: '2024-12-15T09:00:00Z',
        expiresAt: calculateExpirationDate('2024-12-15T09:00:00Z', 30),
        status: 'active',
        views: 412
    },
    {
        id: '4',
        title: 'Sofá 3 lugares em couro',
        description: 'Sofá retrátil e reclinável em couro legítimo, cor marrom, 3 lugares, seminovo.',
        price: 2500,
        categoryId: '4',
        categoryName: 'Móveis',
        sellerId: '5',
        sellerName: 'Paulo Júnior',
        sellerEmail: 'paulo@rotabusiness.com',
        location: 'Campinas, SP',
        images: ['/marketplace/sofa1.jpg'],
        createdAt: '2024-11-20T15:00:00Z',
        expiresAt: calculateExpirationDate('2024-11-20T15:00:00Z', 45),
        status: 'active',
        views: 156
    },
    {
        id: '5',
        title: 'Consultoria em Marketing Digital',
        description: 'Pacote completo de consultoria em marketing digital para pequenas e médias empresas.',
        price: 3000,
        categoryId: '5',
        categoryName: 'Serviços',
        sellerId: '6',
        sellerName: 'Carlos Mendes',
        sellerEmail: 'carlos@example.com',
        location: 'Porto Alegre, RS',
        images: ['/marketplace/service1.jpg'],
        createdAt: '2024-12-01T11:00:00Z',
        expiresAt: calculateExpirationDate('2024-12-01T11:00:00Z', 90),
        status: 'active',
        views: 98
    },
    {
        id: '6',
        title: 'Casa 3 quartos com piscina',
        description: 'Casa ampla, 3 quartos sendo 1 suíte, piscina, churrasqueira, quintal grande.',
        price: 650000,
        categoryId: '1',
        categoryName: 'Imóveis',
        sellerId: '2',
        sellerName: 'Pr. Erick Cabral',
        sellerEmail: 'erick@rotabusiness.com',
        location: 'Curitiba, PR',
        images: ['/marketplace/house1.jpg'],
        createdAt: '2024-11-05T08:00:00Z',
        expiresAt: calculateExpirationDate('2024-11-05T08:00:00Z', 60),
        status: 'sold',
        views: 567
    },
    {
        id: '7',
        title: 'Notebook Dell i7 16GB',
        description: 'Dell Inspiron 15, Intel i7 11ª geração, 16GB RAM, SSD 512GB, placa de vídeo dedicada.',
        price: 4500,
        categoryId: '3',
        categoryName: 'Eletrônicos',
        sellerId: '7',
        sellerName: 'Felipe Santos',
        sellerEmail: 'felipe@example.com',
        location: 'Belo Horizonte, MG',
        images: ['/marketplace/dell1.jpg'],
        createdAt: '2024-10-15T10:00:00Z',
        expiresAt: calculateExpirationDate('2024-10-15T10:00:00Z', 30),
        status: 'expired',
        views: 234
    }
]
