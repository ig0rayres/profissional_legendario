
import ImprovedCurrentHeaderV6 from '@/components/profile/headers/improved-current-header-v6-complete'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Briefcase, MapPin, Mail, Phone, ArrowLeft, Shield, Settings, Edit, Bell, Upload, Camera, Mountain, MessageCircle } from 'lucide-react'
import { RotaValenteV1B } from '@/components/profile/rota-valente-v1b'
import { ProfileActionButtons, ProfileSecondaryButtons } from '@/components/profile/profile-action-buttons'
import { UpgradeCTA } from '@/components/UpgradeCTA'
import { BattleHistory } from '@/components/gamification/battle-history'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { CoverUpload } from '@/components/profile/cover-upload'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Image from 'next/image'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'
import * as LucideIcons from 'lucide-react'
import { MOCK_CATEGORIES } from '@/lib/data/mock'

// ✨ CARDS V13 - SUBSTITUINDO OS ANTIGOS
import { ProjectsCounterV13, ElosDaRotaV13, ConfraternityStatsV13 } from '@/components/profile/cards-v13-brand-colors'
import { NaRotaFeedV13 } from '@/components/profile/na-rota-feed-v13-social'

interface ProfilePageTemplateV13Props {
    profileData: CompleteProfileData
    nextRank?: RankData | null
    backUrl?: string
    isOwner?: boolean // Se true, mostra funções de gestão do próprio perfil
}

/**
 * Template V13 da página de perfil
 * CÓPIA do template atual com cards V13 (cores do projeto)
 * 
 * MANTIDO:
 * - Header V6
 * - Rota do Valente V1B
 * - Histórico de Batalha
 * - Informações de Contato
 * - CTAs de Upgrade
 * - Gestão Financeira
 * 
 * SUBSTITUÍDO (V13):
 * - Projetos
 * - Elos da Rota
 * - Confrarias
 * - Feed Na Rota
 */
export function ProfilePageTemplateV13({ profileData, nextRank, backUrl = '/professionals', isOwner = false }: ProfilePageTemplateV13Props) {
    const {
        profile,
        gamification,
        subscription,
        allMedals,
        earnedMedals,
        allProezas,
        earnedProezas,
        confraternityStats,
        portfolio,
        ratings,
        ratingStats
    } = profileData

    // Badge de plano
    const planBadgeColor = {
        'recruta': 'bg-gray-500',
        'veterano': 'bg-blue-500',
        'elite': 'bg-purple-500'
    }[subscription?.plan_id || 'recruta'] || 'bg-gray-500'

    return (
        <div className="w-full">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
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

                {/* HEADER V6 - MANTIDO */}
                <div className="mb-6">
                    <ImprovedCurrentHeaderV6
                        profile={profile}
                        gamification={gamification}
                        allMedals={allMedals}
                        earnedMedals={earnedMedals}
                        isOwner={isOwner}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* ROTA DO VALENTE V1B - MANTIDO */}
                        <RotaValenteV1B
                            gamification={gamification}
                            subscription={subscription}
                            nextRank={nextRank}
                            allProezas={allProezas || []}
                            earnedProezas={earnedProezas || []}
                        />

                        {/* FEED NA ROTA - V13 ✨ NOVO (Busca posts automaticamente) */}
                        <NaRotaFeedV13
                            userId={profile.id}
                            userName={profile.full_name}
                            userAvatar={profile.avatar_url}
                            showCreateButton={isOwner}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* PROJETOS - V13 ✨ NOVO */}
                        <ProjectsCounterV13
                            completedCount={profileData.projectsCompleted || 0}
                            inProgressCount={profileData.projectsInProgress || 0}
                            showButton={true}
                            canShowButton={false}
                        />

                        {/* ELOS DA ROTA - V13 ✨ NOVO */}
                        <ElosDaRotaV13
                            connections={profileData.connections || []}
                            pendingCount={profileData.pendingConnectionsCount || 0}
                            userId={profile.id}
                        />

                        {/* CONFRARIAS - V13 ✨ NOVO */}
                        <ConfraternityStatsV13
                            confraternities={confraternityStats?.upcoming || []}
                        />

                        {/* HISTÓRICO DE BATALHA - MANTIDO */}
                        <BattleHistory userId={profile.id} />

                        {/* INFORMAÇÕES DE CONTATO - MANTIDO */}
                        <Card className="shadow-lg shadow-black/30 border border-[#2D3B2D] backdrop-blur-sm bg-[#1A2421]/60 hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-[#F2F4F3]">Informações de Contato</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-[#1E4D40]" />
                                    <span className="text-[#D1D5DB]">{profile.email}</span>
                                </div>
                                {profile.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-[#1E4D40]" />
                                        <span className="text-[#D1D5DB]">{profile.phone}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CTA DE UPGRADE - MANTIDO */}
                        {isOwner && (
                            <>
                                <UpgradeCTA variant="card" />

                                {/* GESTÃO FINANCEIRA - MANTIDO */}
                                <Card className="shadow-lg shadow-black/30 border border-[#2D3B2D] backdrop-blur-sm bg-[#1A2421]/60 hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold text-[#F2F4F3] flex items-center gap-2">
                                            <LucideIcons.CreditCard className="w-4 h-4 text-[#D4742C]" />
                                            Gestão Financeira
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-[#D1D5DB] mb-3">
                                            Gerencie sua assinatura, visualize faturas e métodos de pagamento.
                                        </p>
                                        <Button asChild variant="outline" size="sm" className="w-full border-[#D4742C]/50 text-[#D4742C] hover:bg-[#D4742C]/10">
                                            <a href="/dashboard/financeiro">
                                                Acessar Painel
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </div >
        </div >
    )
}
