'use client'

import { ProfilePageTemplateV2 } from '@/components/profile/profile-page-template-v2'
import { Button } from '@/components/ui/button'
import { Sparkles, Eye } from 'lucide-react'
import Link from 'next/link'

// Dados mockados para preview
const MOCK_PROFILE_DATA = {
    profile: {
        id: 'demo-user-123',
        email: 'demo@legendarios.com',
        full_name: 'Lucas Designer Demo',
        avatar_url: null,
        cover_url: null,
        bio: 'Este é um perfil de demonstração para visualizar o novo design.',
        phone: '(11) 99999-9999',
        whatsapp: '5511999999999',
        instagram: '@lucas_demo',
        pista: 'São Paulo',
        slug: 'lucas-demo',
        rota_number: '999999',
        role: 'professional' as const,
        verification_status: 'verified' as const,
        created_at: new Date().toISOString()
    },
    gamification: {
        user_id: 'demo-user-123',
        current_rank_id: 'comandante',
        total_points: 1250,
        total_medals: 8,
        rank: {
            id: 'comandante',
            name: 'Comandante',
            rank_level: 4,
            points_required: 1000,
            icon: 'Medal',
            color: '#D2691E',
            description: 'Líder experiente'
        }
    },
    subscription: {
        user_id: 'demo-user-123',
        plan_id: 'elite',
        status: 'active' as const,
        plan_tiers: {
            id: 'elite',
            name: 'ELITE',
            monthly_price: 97,
            yearly_price: 970,
            xp_multiplier: 3,
            max_confraternities: 10
        }
    },
    allMedals: [
        { id: 'presente', name: 'Presente', icon_key: 'Gift', description: 'Primeiro login', xp_reward: 10 },
        { id: 'sociavel', name: 'Sociável', icon_key: 'Users', description: '5 conexões', xp_reward: 25 },
        { id: 'conector', name: 'Conector', icon_key: 'Link', description: '10 elos', xp_reward: 50 }
    ],
    earnedMedals: [
        { medal_id: 'presente', earned_at: new Date().toISOString() },
        { medal_id: 'sociavel', earned_at: new Date().toISOString() }
    ],
    allProezas: [],
    earnedProezas: [],
    confraternityStats: {
        total_created: 5,
        total_attended: 12,
        total_photos: 8
    },
    portfolio: [
        {
            id: '1',
            user_id: 'demo-user-123',
            title: 'Projeto Demo 1',
            description: 'Descrição do projeto de demonstração',
            image_url: null,
            category: 'Design',
            display_order: 1,
            created_at: new Date().toISOString()
        }
    ],
    ratings: [
        {
            id: '1',
            professional_id: 'demo-user-123',
            reviewer_id: 'reviewer-1',
            rating: 5,
            comment: 'Excelente profissional! Recomendo.',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            reviewer: { full_name: 'João Silva', avatar_url: null }
        },
        {
            id: '2',
            professional_id: 'demo-user-123',
            reviewer_id: 'reviewer-2',
            rating: 4,
            comment: 'Muito bom trabalho.',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            reviewer: { full_name: 'Maria Santos', avatar_url: null }
        }
    ],
    ratingStats: {
        average_rating: 4.5,
        total_ratings: 12,
        distribution: {
            '5_stars': 8,
            '4_stars': 3,
            '3_stars': 1,
            '2_stars': 0,
            '1_star': 0
        }
    },
    projectsCompleted: 15,
    projectsInProgress: 3
}

const MOCK_NEXT_RANK = {
    id: 'general',
    name: 'General',
    rank_level: 5,
    points_required: 2000,
    icon: 'Flame',
    color: '#FF4500',
    description: 'Mestre estrategista'
}

export default function DemoV2Page() {
    return (
        <>
            {/* Banner de Demo */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white py-2 px-4 shadow-lg">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="font-bold uppercase tracking-wider text-sm">
                                🎨 Lucas UI/UX - DEMO V2
                            </span>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            Dados Mockados
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button size="sm" variant="secondary" className="text-xs gap-1.5">
                                <Eye className="w-3.5 h-3.5" />
                                Ver Versão Atual
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Espaçador para o banner fixo */}
            <div className="h-10" />

            {/* Template V2 com dados mockados */}
            <ProfilePageTemplateV2
                profileData={MOCK_PROFILE_DATA as any}
                nextRank={MOCK_NEXT_RANK}
                backUrl="/"
                isOwner={true}
            />
        </>
    )
}
