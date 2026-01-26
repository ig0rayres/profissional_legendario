
import ImprovedCurrentHeaderV6 from '@/components/profile/headers/improved-current-header-v6-complete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, CreditCard, Sparkles, ChevronRight } from 'lucide-react'
import { RotaValenteV1B } from '@/components/profile/rota-valente-v1b'
import { UpgradeCTA } from '@/components/UpgradeCTA'
import { BattleHistory } from '@/components/gamification/battle-history'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// NOVOS COMPONENTES V2
import { ProjectsCounterV2 } from '@/components/profile/projects-counter-v2'
import { ElosDaRotaV2 } from '@/components/profile/elos-da-rota-v2'
import { ConfraternityStatsV2 } from '@/components/profile/confraternity-stats-v2'
import { NaRotaFeedV2 } from '@/components/profile/user-mural-v2'

import type { CompleteProfileData, RankData } from '@/lib/profile/types'

interface ProfilePageTemplateV2Props {
    profileData: CompleteProfileData
    nextRank?: RankData | null
    backUrl?: string
    isOwner?: boolean
}

/**
 * Template V2 do Painel do Usuário - Lucas UI/UX Design
 * Versão premium com cards redesenhados
 */
export function ProfilePageTemplateV2({ profileData, nextRank, backUrl = '/professionals', isOwner = false }: ProfilePageTemplateV2Props) {
    const {
        profile,
        gamification,
        subscription,
        allMedals,
        earnedMedals,
        allProezas,
        earnedProezas,
        portfolio,
        ratings,
    } = profileData

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-[#0A0F0D] via-[#0F1B1A] to-[#0A0F0D]">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="text-[#8B9A8B] hover:text-[#F2F4F3] hover:bg-[#1E4D40]/10">
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

                {/* HEADER V6 */}
                <div className="mb-8">
                    <ImprovedCurrentHeaderV6
                        profile={profile}
                        gamification={gamification}
                        allMedals={allMedals}
                        earnedMedals={earnedMedals}
                        isOwner={isOwner}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 colunas */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card Rota do Valente */}
                        <RotaValenteV1B
                            gamification={gamification}
                            subscription={subscription}
                            nextRank={nextRank}
                            allProezas={allProezas || []}
                            earnedProezas={earnedProezas || []}
                        />

                        {/* Feed NA ROTA V2 */}
                        <NaRotaFeedV2
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
                        {/* Projects Counter V2 */}
                        <ProjectsCounterV2
                            completedCount={profileData.projectsCompleted || 0}
                            inProgressCount={profileData.projectsInProgress || 0}
                            targetUserId={profile.id}
                            targetUserName={profile.full_name}
                        />

                        {/* Elos da Rota V2 */}
                        <ElosDaRotaV2 userId={profile.id} />

                        {/* Próximas Confrarias V2 */}
                        <ConfraternityStatsV2 userId={profile.id} isOwnProfile={isOwner} />

                        {/* Histórico de Batalha */}
                        <BattleHistory userId={profile.id} />

                        {/* Contact Info Card Premium */}
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0F1B1A] via-[#1A2421] to-[#0F1B1A] shadow-2xl">
                            <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-br from-[#1E4D40]/20 via-transparent to-purple-500/10" />

                            <CardContent className="relative p-5">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#143832] flex items-center justify-center shadow-lg shadow-[#1E4D40]/20">
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider text-[#F2F4F3]">
                                            CONTATO
                                        </h3>
                                        <p className="text-[10px] text-[#8B9A8B] uppercase tracking-wide">
                                            Informações
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg",
                                        "bg-gradient-to-r from-[#1E4D40]/5 to-transparent",
                                        "border border-[#1E4D40]/10"
                                    )}>
                                        <Mail className="w-4 h-4 text-[#1E4D40]" />
                                        <span className="text-sm text-[#D1D5DB] truncate">{profile.email}</span>
                                    </div>

                                    {profile.phone && (
                                        <div className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg",
                                            "bg-gradient-to-r from-[#1E4D40]/5 to-transparent",
                                            "border border-[#1E4D40]/10"
                                        )}>
                                            <Phone className="w-4 h-4 text-[#1E4D40]" />
                                            <span className="text-sm text-[#D1D5DB]">{profile.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cards exclusivos para Owner */}
                        {isOwner && (
                            <>
                                <UpgradeCTA variant="card" />

                                {/* Card Gestão Financeira Premium */}
                                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0F1B1A] via-[#1A2421] to-[#0F1B1A] shadow-2xl group">
                                    <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-br from-[#D4742C]/30 via-transparent to-[#D4742C]/10" />

                                    {/* Decoração */}
                                    <div className="absolute top-4 right-4 w-16 h-16 bg-[#D4742C]/5 rounded-full blur-2xl group-hover:bg-[#D4742C]/10 transition-colors" />

                                    <CardContent className="relative p-5">
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4742C] to-[#B85715] flex items-center justify-center shadow-lg shadow-[#D4742C]/20">
                                                <CreditCard className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-wider text-[#F2F4F3]">
                                                    FINANCEIRO
                                                </h3>
                                                <p className="text-[10px] text-[#8B9A8B] uppercase tracking-wide">
                                                    Gestão de Assinatura
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-[#8B9A8B] mb-4 leading-relaxed">
                                            Gerencie sua assinatura, faturas e métodos de pagamento.
                                        </p>

                                        <Button
                                            asChild
                                            className={cn(
                                                "w-full relative overflow-hidden",
                                                "bg-gradient-to-r from-[#D4742C]/20 to-[#D4742C]/10",
                                                "hover:from-[#D4742C]/30 hover:to-[#D4742C]/20",
                                                "border border-[#D4742C]/30",
                                                "text-[#D4742C] font-bold uppercase tracking-wide",
                                                "h-10 group/btn"
                                            )}
                                        >
                                            <a href="/dashboard/financeiro">
                                                Acessar Painel
                                                <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
