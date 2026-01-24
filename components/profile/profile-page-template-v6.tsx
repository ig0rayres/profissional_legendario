'use client'

import ImprovedCurrentHeaderV6Complete from '@/components/profile/headers/improved-current-header-v6-complete'
import { RotaValenteCard } from '@/components/profile/rota-valente-card'
import { ConfraternityStats } from '@/components/profile/confraternity-stats'
import { ProjectsCounter } from '@/components/profile/projects-counter'
import { NaRotaFeed } from '@/components/profile/user-mural'
import { ElosDaRota } from '@/components/profile/elos-da-rota'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { UpgradeCTA } from '@/components/UpgradeCTA'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'

interface ProfilePageTemplateV6Props {
    profileData: CompleteProfileData
    nextRank?: RankData | null
    backUrl?: string
    isOwner?: boolean
}

/**
 * Profile Page Template V6 - PRODUCTION VERSION
 * Uses the EXACT same design as /demo/header-6
 * All real data is rendered in the V6 layout
 */
export function ProfilePageTemplateV6({
    profileData,
    nextRank,
    backUrl = '/professionals',
    isOwner = false
}: ProfilePageTemplateV6Props) {
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

                {/* Header V6 Component - COMPLETE WITH ALL DATA */}
                <ImprovedCurrentHeaderV6Complete
                    profile={profile}
                    isOwner={isOwner}
                    gamification={gamification}
                    subscription={subscription}
                    ratingStats={ratingStats}
                    confraternityStats={confraternityStats}
                    earnedMedals={earnedMedals}
                    allMedals={allMedals}
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
