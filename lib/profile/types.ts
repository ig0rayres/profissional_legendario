// Types para o perfil completo do usuário

export interface ProfileData {
    id: string
    email: string
    full_name: string
    avatar_url?: string
    bio?: string
    phone?: string
    pista?: string
    rota_number?: string
    role: 'user' | 'professional' | 'admin'
    verification_status: 'pending' | 'verified' | 'rejected'
    created_at: string
}

export interface GamificationData {
    user_id: string
    current_rank_id: string
    total_points: number
    total_medals: number
    rank?: RankData
    user_medals?: UserMedalData[]
}

export interface RankData {
    id: string
    name: string
    rank_level: number
    points_required: number
    icon: string
    color?: string
    description?: string
}

export interface MedalData {
    id: string
    name: string
    icon: string
    description: string
    points_reward: number
    category?: string
}

export interface UserMedalData {
    medal_id: string
    earned_at: string
    medals?: MedalData
}

export interface SubscriptionData {
    user_id: string
    plan_id: string
    status: 'active' | 'inactive' | 'canceled'
    plan_tiers?: PlanTierData
}

export interface PlanTierData {
    id: string
    name: string
    monthly_price: number
    yearly_price: number
    xp_multiplier: number
    max_confraternities: number
}

export interface PortfolioItem {
    id: string
    user_id: string
    title: string
    description?: string
    image_url?: string
    category?: string
    display_order: number
    created_at: string
}

export interface ConfraternityStat {
    total_created: number
    total_attended: number
    total_photos: number
    next_event?: {
        id: string
        title: string
        date: string
    }
}

export interface RatingStats {
    average_rating: number
    total_ratings: number
    distribution: {
        '5_stars': number
        '4_stars': number
        '3_stars': number
        '2_stars': number
        '1_star': number
    }
}

export interface RatingData {
    id: string
    professional_id: string
    reviewer_id: string
    rating: number
    comment?: string
    created_at: string
    reviewer?: {
        full_name: string
        avatar_url?: string
    }
}

export interface CompleteProfileData {
    profile: ProfileData
    gamification: GamificationData | null
    subscription: SubscriptionData | null
    allMedals: MedalData[]
    earnedMedals: UserMedalData[]
    confraternityStats: ConfraternityStat | null
    portfolio: PortfolioItem[]
    ratings: RatingData[]
    ratingStats: RatingStats | null
}
