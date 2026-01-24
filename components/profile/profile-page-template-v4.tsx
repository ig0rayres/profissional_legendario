'use client'

import { ImprovedCurrentHeader } from '@/components/profile/headers/improved-current-header'
import { RotaValenteCard } from '@/components/profile/rota-valente-card'
import { ConfraternityStats } from '@/components/profile/confraternity-stats'
import { ProjectsCounter } from '@/components/profile/projects-counter'
import { NaRotaFeed } from '@/components/profile/user-mural'
import { ElosDaRota } from '@/components/profile/elos-da-rota'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { UpgradeCTA } from '@/components/UpgradeCTA'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'

interface ProfilePageTemplateV4Props {
    profileData: CompleteProfileData
    nextRank?: RankData | null
    backUrl?: string
    isOwner?: boolean
}

/**
 * Profile Page Template V4 - PRODUCTION VERSION
 * Uses the EXACT same design as /demo/header-4
 * All real data is rendered in the V4 layout
 */
export function ProfilePageTemplateV4({
    profileData,
    nextRank,
    backUrl = '/professionals',
    isOwner = false
}: ProfilePageTemplateV4Props) {
    const {
        profile,
        gamification,
        subscription,
        allMedals,
        earnedMedals,
        confraternityStats,
        portfolio,
        ratings,
        ratingStats
    } = profileData

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1A2421] via-[#2D3B2D] to-[#1A2421]">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="text-[#F2F4F3] hover:text-white">
                        <a href={backUrl}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </a>
                    </Button>
                </div>

                {/* Banner de Upgrade para donos do perfil */}
                {isOwner && (
                    <div className="mb-6">
                        <UpgradeCTA variant="banner" />
                    </div>
                )}

                {/* Header V4 Component - EXACT SAME AS DEMO */}
                <ImprovedCurrentHeader
                    profileData={{
                        full_name: profile.full_name,
                        avatar_url: profile.avatar_url,
                        bio: profile.bio,
                        pista: profile.pista,
                        rota_number: profile.rota_number,
                        cover_url: profile.cover_url
                    }}
                    gamification={{
                        total_points: gamification?.total_points || 0,
                        current_rank_id: gamification?.current_rank_id || 'novato',
                        medals_count: earnedMedals?.length || 0
                    }}
                    medals={earnedMedals?.slice(0, 3).map(um => {
                        const medal = allMedals.find(m => m.id === um.medal_id)
                        return {
                            id: medal?.id || '',
                            icon: medal?.icon || '',
                            name: medal?.name || ''
                        }
                    }) || []}
                    isOwner={isOwner}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Rota do Valente Card */}
                        <RotaValenteCard
                            gamification={gamification}
                            subscription={subscription}
                            nextRank={nextRank}
                            allMedals={allMedals}
                            earnedMedals={earnedMedals}
                        />

                        {/* Feed NA ROTA */}
                        <NaRotaFeed
                            userId={profile.id}
                            userName={profile.full_name}
                            ratings={ratings}
                            portfolio={portfolio}
                            confraternityPhotos={[]}
                            activities={[]}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Projetos Counter */}
                        <ProjectsCounter
                            completedCount={confraternityStats?.total_attended || 0}
                            inProgressCount={0}
                            showButton={!isOwner}
                            targetUserId={profile.id}
                            targetUserName={profile.full_name}
                        />

                        {/* Próximas Confrarias */}
                        <ConfraternityStats
                            userId={profile.id}
                            isOwnProfile={isOwner}
                        />

                        {/* Elos da Rota */}
                        <ElosDaRota userId={profile.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
