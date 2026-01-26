'use client'

import { useState } from 'react'
import ImprovedCurrentHeaderV6 from '@/components/profile/headers/improved-current-header-v6-complete'
import { RotaValenteCard } from '@/components/profile/rota-valente-card'
import { RotaValenteV1 } from '@/components/profile/rota-valente-v1'
import { RotaValenteV3 } from '@/components/profile/rota-valente-v3'
import { CoverPhotoUpload } from '@/components/profile/cover-photo-upload'

// MOCKS TIPADOS
const MOCK_RANKS = {
    novato: { id: 'novato', name: 'Novato', icon: 'shield', points_required: 0, rank_level: 1, description: 'Iniciando a jornada' },
    veterano: { id: 'veterano', name: 'Veterano', icon: 'shield-check', points_required: 1000, rank_level: 5, description: 'Membro experiente' },
    elite: { id: 'elite', name: 'Elite', icon: 'crown', points_required: 5000, rank_level: 10, description: 'Lenda viva' }
}

const MOCK_PLANS = {
    free: { id: 'free', name: 'GRATUITO', monthly_price: 0, yearly_price: 0, xp_multiplier: 1, max_confraternities: 1 },
    legendary: { id: 'legendary', name: 'LENDÁRIO', monthly_price: 97, yearly_price: 970, xp_multiplier: 2, max_confraternities: 5 }
}

const ALL_MEDALS = [
    { id: '1', name: 'Pioneiro', icon_key: 'trophy', description: 'Primeiro a testar a plataforma', category: 'achievement' },
    { id: '2', name: 'Colaborador', icon_key: 'users', description: 'Trabalho em equipe exemplar', category: 'social' },
    { id: '3', name: 'Inovador', icon_key: 'lightbulb', description: 'Sugestão de melhoria implementada', category: 'innovation' },
    { id: '4', name: 'Mentor', icon_key: 'graduation-cap', description: 'Ajudou outros membros', category: 'education' },
    { id: '5', name: 'Invencível', icon_key: 'swords', description: 'Completou 10 desafios seguidos', category: 'challenge' }
]

// DADOS DOS PERFIS
const PROFILES = {
    novato: {
        profile: {
            id: 'user-novato',
            avatar_url: null, // Sem foto para testar fallback
            full_name: 'Novo Membro',
            professional_title: 'Explorador Iniciante',
            location: 'São Paulo, SP',
            rating: 0, // Sem avaliação
            cover_url: '/demo-cover-simple.jpg',
            bio: 'Acabei de chegar e estou pronto para aprender!'
        },
        gamification: {
            total_points: 150,
            current_rank_id: 'novato',
            rank: MOCK_RANKS.novato,
            medals_count: 0
        },
        subscription: {
            plan_tiers: MOCK_PLANS.free
        },
        earnedMedals: [],
        nextRank: MOCK_RANKS.veterano
    },
    veterano: {
        profile: {
            id: 'user-veterano',
            avatar_url: '/placeholder.svg', // Imagem padrão
            full_name: 'Igor Rayres',
            professional_title: 'Líder de Comunidade & Mentor',
            location: 'Rio de Janeiro, RJ',
            rating: 4.9, // Avaliação alta
            cover_url: '/demo-cover-premium.jpg',
            bio: 'Transformando ideias em realidade há 10 anos. Apaixonado por tecnologia e pessoas.'
        },
        gamification: {
            total_points: 3450,
            current_rank_id: 'veterano',
            rank: MOCK_RANKS.veterano,
            medals_count: 12
        },
        subscription: {
            plan_tiers: MOCK_PLANS.legendary
        },
        earnedMedals: [
            { medal_id: '1', earned_at: new Date().toISOString() },
            { medal_id: '2', earned_at: new Date().toISOString() },
            { medal_id: '3', earned_at: new Date().toISOString() },
            { medal_id: '5', earned_at: new Date().toISOString() }
        ],
        nextRank: MOCK_RANKS.elite
    }
}

export default function Header6DemoPage() {
    const [activeProfileKey, setActiveProfileKey] = useState<'novato' | 'veterano'>('veterano')
    const [showCropModal, setShowCropModal] = useState(false)
    const [coverUrl, setCoverUrl] = useState(PROFILES[activeProfileKey].profile.cover_url)

    const activeData = PROFILES[activeProfileKey]

    // Handler para troca de perfil
    const toggleProfile = (key: 'novato' | 'veterano') => {
        setActiveProfileKey(key)
        setCoverUrl(PROFILES[key].profile.cover_url)
    }

    return (
        <div className="min-h-screen bg-[#0d1f16] pb-20"> {/* Fundo Escuro V6 */}

            {/* CONTROLES DE DEMO */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex gap-4 shadow-2xl">
                <button
                    onClick={() => toggleProfile('novato')}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeProfileKey === 'novato' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    👶 Novato
                </button>
                <div className="w-px bg-white/20"></div>
                <button
                    onClick={() => toggleProfile('veterano')}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeProfileKey === 'veterano' ? 'bg-[#1E4D40] text-white shadow-[0_0_15px_rgba(30,77,64,0.6)]' : 'text-gray-400 hover:text-white'}`}
                >
                    🎖️ Veterano
                </button>
            </div>

            <div className="container mx-auto py-8 px-4 max-w-5xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">V6 SYSTEM <span className="text-[#1E4D40]">PREVIEW</span></h1>
                    <p className="text-gray-400 text-sm">Validando transparências, cores e comportamento dinâmico.</p>
                </div>

                {/* PAINEL COMPLETO (Header + Rota) */}
                <div className="space-y-6">

                    {/* 1. HEADER DO PERFIL */}
                    <div className="bg-[#1A2421] rounded-2xl overflow-hidden shadow-2xl border border-[#2E4A3E]/30 relative">
                        <div className="absolute top-0 right-0 p-2 opacity-30 text-[10px] uppercase font-mono text-white pointer-events-none">Header Component</div>
                        <ImprovedCurrentHeaderV6
                            profile={{ ...activeData.profile, cover_url: coverUrl }}
                            gamification={activeData.gamification}
                            allMedals={ALL_MEDALS as any} // Cast simples para mock
                            earnedMedals={activeData.earnedMedals}
                            isOwner={true}
                        />
                    </div>

                    {/* 2. CARD ROTA DO VALENTE - ORIGINAL */}
                    <div className="relative">
                        <div className="absolute -top-3 left-4 text-[10px] uppercase font-bold tracking-widest text-[#1E4D40] bg-[#0d1f16] px-2 z-10">
                            Original
                        </div>
                        <RotaValenteCard
                            gamification={activeData.gamification as any}
                            subscription={activeData.subscription as any}
                            nextRank={activeData.nextRank as any}
                            allMedals={ALL_MEDALS as any}
                            earnedMedals={activeData.earnedMedals}
                        />
                    </div>

                    {/* 3. CARD ROTA DO VALENTE - V1 */}
                    <div className="relative">
                        <div className="absolute -top-3 left-4 text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-[#0d1f16] px-2 z-10">
                            V1 - Minimal Compact
                        </div>
                        <RotaValenteV1
                            gamification={activeData.gamification as any}
                            subscription={activeData.subscription as any}
                            nextRank={activeData.nextRank as any}
                            allMedals={ALL_MEDALS as any}
                            earnedMedals={activeData.earnedMedals}
                        />
                    </div>

                    {/* 4. CARD ROTA DO VALENTE - V3 */}
                    <div className="relative">
                        <div className="absolute -top-3 left-4 text-[10px] uppercase font-bold tracking-widest text-pink-400 bg-[#0d1f16] px-2 z-10">
                            V3 - Glassmorphism
                        </div>
                        <RotaValenteV3
                            gamification={activeData.gamification as any}
                            subscription={activeData.subscription as any}
                            nextRank={activeData.nextRank as any}
                            allMedals={ALL_MEDALS as any}
                            earnedMedals={activeData.earnedMedals}
                        />
                    </div>

                </div>
            </div>

            <CoverPhotoUpload
                isOpen={showCropModal}
                onClose={() => setShowCropModal(false)}
                onSave={(url) => setCoverUrl(url)}
                currentCoverUrl={coverUrl}
            />
        </div>
    )
}
