
import ImprovedCurrentHeaderV6 from '@/components/profile/headers/improved-current-header-v6-complete'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Briefcase, MapPin, Mail, Phone, ArrowLeft, Shield, Settings, Edit, Bell, Upload, Camera, Mountain, MessageCircle } from 'lucide-react'
import { RotaValenteCard } from '@/components/profile/rota-valente-card'
import { ConfraternityStats } from '@/components/profile/confraternity-stats'
import { ProfileActionButtons, ProfileSecondaryButtons } from '@/components/profile/profile-action-buttons'
import { UpgradeCTA } from '@/components/UpgradeCTA'
import { ProjectsCounter } from '@/components/profile/projects-counter'
import { NaRotaFeed } from '@/components/profile/user-mural'
import { ElosDaRota } from '@/components/profile/elos-da-rota'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { BattleHistory } from '@/components/gamification/battle-history'
import { CoverUpload } from '@/components/profile/cover-upload'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Image from 'next/image'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'
import * as LucideIcons from 'lucide-react'
import { MOCK_CATEGORIES } from '@/lib/data/mock'

interface ProfilePageTemplateProps {
    profileData: CompleteProfileData
    nextRank?: RankData | null
    backUrl?: string
    isOwner?: boolean // Se true, mostra funções de gestão do próprio perfil
}

/**
 * Template centralizado da página de perfil
 * Qualquer mudança aqui é replicada para TODOS os perfis
 * isOwner = true: Mostra funções de gestão (editar perfil, configurações, etc)
 */
export function ProfilePageTemplate({ profileData, nextRank, backUrl = '/professionals', isOwner = false }: ProfilePageTemplateProps) {
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

    // Badge de plano
    const planBadgeColor = {
        'recruta': 'bg-gray-500',
        'veterano': 'bg-blue-500',
        'elite': 'bg-purple-500'
    }[subscription?.plan_id || 'recruta'] || 'bg-gray-500'

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1A2421] via-[#2D3B2D] to-[#1A2421]">
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

                {/* NOVO HEADER V6 - Substituindo o antigo */}
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
                        {/* Card Unificado: Rota do Valente - Layout Oficial */}
                        <RotaValenteCard
                            gamification={gamification}
                            subscription={subscription}
                            nextRank={nextRank}
                            allMedals={allMedals}
                            earnedMedals={earnedMedals}
                        />

                        {/* Feed NA ROTA - Atividades do usuário */}
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
                        {/* Projects Counter */}
                        <ProjectsCounter
                            completedCount={profileData.projectsCompleted || 0}
                            inProgressCount={profileData.projectsInProgress || 0}
                            targetUserId={profile.id}
                            targetUserName={profile.full_name}
                        />

                        {/* Elos da Rota - Quadro de Amigos */}
                        <ElosDaRota userId={profile.id} />

                        {/* Próximas Confrarias */}
                        <ConfraternityStats userId={profile.id} />

                        {/* Histórico de Batalha (inclui atividades/pontos no dropdown) */}
                        <BattleHistory userId={profile.id} />

                        {/* Contact Info */}
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

                        {/* CTA de Upgrade na Sidebar */}
                        {/* CTA de Upgrade na Sidebar (Apenas se não for Elite - controlado pelo componente) */}
                        {isOwner && (
                            <>
                                <UpgradeCTA variant="card" />

                                {/* Card de Gestão Financeira (Sempre visível para Owner) */}
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
