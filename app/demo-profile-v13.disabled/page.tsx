'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ImprovedCurrentHeaderV6 from '@/components/profile/headers/improved-current-header-v6-complete'
import { RotaValenteV1B } from '@/components/profile/rota-valente-v1b'
import { UpgradeCTA } from '@/components/UpgradeCTA'
import { BattleHistoryMock } from '@/components/gamification/battle-history-mock'

// CARDS V13
import { ProjectsCounterV13, ElosDaRotaV13, ConfraternityStatsV13, NaRotaFeedV13 } from '@/components/profile/cards-v13-brand-colors'

export default function DemoProfileV13Page() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => setLoading(false), 500)
    }, [])

    // Mock data mínimo
    const mockProfile = {
        id: 'demo-user-123',
        full_name: 'Igor Ayres',
        email: 'igor@example.com',
        phone: '(11) 98765-4321',
        avatar_url: null,
        cover_url: null,
        bio: 'Desenvolvedor Full Stack apaixonado por criar soluções inovadoras.',
        location: 'São Paulo, SP',
        category_id: 'tech',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    const mockGamification = {
        user_id: 'demo-user-123',
        current_xp: 850,
        total_xp: 2450,
        level: 5,
        rank_id: 'veterano',
        current_rank_id: 'veterano',
        rank_name: 'Veterano',
        rank_icon: 'shield',
        next_level_xp: 1000,
        vigor: 75,
        total_points: 850,
        total_medals: 8,
        rank: {
            id: 'veterano',
            name: 'Veterano',
            icon: 'shield',
            min_xp: 500
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    const mockSubscription = {
        id: 'sub-123',
        user_id: 'demo-user-123',
        plan_id: 'veterano',
        status: 'active' as const,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan_tiers: {
            name: 'Veterano',
            tier: 2
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    const mockAllMedals = [
        { id: '1', name: 'Primeira Missão', description: 'Complete sua primeira missão', icon: 'trophy', rarity: 'common' },
        { id: '2', name: 'Veterano', description: 'Alcance o nível 5', icon: 'shield', rarity: 'rare' }
    ]

    const mockEarnedMedals = [
        { medal_id: '1', earned_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { medal_id: '2', earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ]

    const mockNextRank = {
        id: 'elite',
        name: 'Elite',
        min_xp: 3000,
        icon: 'crown',
        color: '#9333EA',
        rank_level: 3,
        points_required: 1500
    }

    const mockAllProezas = [
        { id: '1', name: 'Primeira Vitória', description: 'Ganhe sua primeira batalha', icon: 'sword', points_base: 100 },
        { id: '2', name: 'Conquistador', description: 'Vença 5 batalhas', icon: 'trophy', points_base: 500 }
    ]

    const mockEarnedProezas = [
        { proeza_id: '1', earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), points_earned: 100 }
    ]

    // Mock data para os cards V13
    const mockConnections = [
        { id: '1', full_name: 'João Silva', avatar_url: null, rank_name: 'Veterano' },
        { id: '2', full_name: 'Maria Santos', avatar_url: null, rank_name: 'Elite' },
        { id: '3', full_name: 'Pedro Costa', avatar_url: null, rank_name: 'Recruta' },
        { id: '4', full_name: 'Ana Lima', avatar_url: null, rank_name: 'Veterano' },
        { id: '5', full_name: 'Carlos Souza', avatar_url: null, rank_name: 'Elite' },
        { id: '6', full_name: 'Fernanda Rocha', avatar_url: null, rank_name: 'Recruta' }
    ]

    const mockConfraternities = [
        {
            id: '1',
            proposed_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Café Central',
            partner: { full_name: 'Roberto Alves', avatar_url: null }
        },
        {
            id: '2',
            proposed_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Restaurante Italiano',
            partner: { full_name: 'Fernanda Rocha', avatar_url: null }
        },
        {
            id: '3',
            proposed_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Parque da Cidade',
            partner: { full_name: 'Lucas Mendes', avatar_url: null }
        }
    ]

    const mockRatings = [
        {
            id: '1',
            rating: 5,
            comment: 'Excelente profissional! Trabalho impecável e entrega no prazo.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: { full_name: 'Lucas Mendes', avatar_url: null }
        },
        {
            id: '2',
            rating: 4,
            comment: 'Muito bom trabalho, recomendo!',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            reviewer: { full_name: 'Patricia Silva', avatar_url: null }
        }
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-primary text-lg font-semibold">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/demo-pool">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </a>
                    </Button>
                </div>

                {/* Banner de Upgrade */}
                <div className="mb-6">
                    <UpgradeCTA variant="banner" />
                </div>

                {/* HEADER V6 - ATUAL */}
                <div className="mb-6">
                    <ImprovedCurrentHeaderV6
                        profile={mockProfile}
                        gamification={mockGamification}
                        allMedals={mockAllMedals}
                        earnedMedals={mockEarnedMedals}
                        isOwner={true}
                    />
                </div>

                {/* LAYOUT GRID - 2 colunas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Principal (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* ROTA DO VALENTE V1B - ATUAL */}
                        <RotaValenteV1B
                            gamification={mockGamification}
                            subscription={mockSubscription}
                            nextRank={mockNextRank}
                            allProezas={mockAllProezas}
                            earnedProezas={mockEarnedProezas}
                        />

                        {/* NA ROTA - V13 ✨ */}
                        <NaRotaFeedV13
                            userId={mockProfile.id}
                            userName={mockProfile.full_name}
                            userAvatar={mockProfile.avatar_url}
                            ratings={mockRatings}
                            portfolio={[]}
                        />
                    </div>

                    {/* Sidebar (1/3) */}
                    <div className="space-y-6">
                        {/* PROJETOS - V13 ✨ */}
                        <ProjectsCounterV13
                            completedCount={12}
                            inProgressCount={3}
                            showButton={true}
                            canShowButton={false}
                        />

                        {/* HISTÓRICO DE BATALHA - MOCK COM DADOS ✅ */}
                        <div>
                            <div className="mb-3 px-3 py-2 bg-amber-50 border-l-4 border-amber-400 rounded">
                                <p className="text-xs font-semibold text-amber-900">
                                    📊 Histórico com dados MOCK para demonstração
                                </p>
                            </div>
                            <BattleHistoryMock />
                        </div>

                        {/* ELOS DA ROTA - V13 ✨ */}
                        <ElosDaRotaV13
                            connections={mockConnections}
                            pendingCount={2}
                            userId={mockProfile.id}
                        />

                        {/* CONFRARIAS - V13 ✨ */}
                        <ConfraternityStatsV13
                            confraternities={mockConfraternities}
                        />
                    </div>
                </div>

                {/* Aviso */}
                <div className="mt-8 p-4 bg-gradient-to-r from-[#1E4D40]/10 to-[#2A6B5A]/10 border-l-4 border-[#1E4D40] rounded-lg">
                    <h3 className="text-sm font-bold text-[#2D3142] mb-2">
                        🎨 V13 - Página Completa com Cores do Projeto
                    </h3>
                    <p className="text-sm text-gray-700">
                        <strong>Mantido:</strong> Header V6 + Rota do Valente V1B (atuais)
                        <br />
                        <strong>Novo (V13):</strong> Projetos, Elos da Rota, Confrarias, Feed Na Rota
                    </p>
                </div>
            </div>
        </div>
    )
}
