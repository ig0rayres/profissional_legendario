'use client'

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
        <div className="min-h-screen bg-adventure">
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

                {/* Header Card */}
                <Card className="mb-6 overflow-hidden relative shadow-xl shadow-black/10 border border-white/10 backdrop-blur-sm">
                    {/* FOTO DE CAPA - 25% maior */}
                    <div className="relative h-56 bg-gradient-to-r from-primary/20 to-secondary/20">
                        {profile.cover_url ? (() => {
                            const posMatch = profile.cover_url.match(/pos=(\d+)/)
                            const coverPosition = posMatch ? parseInt(posMatch[1]) : 50
                            return (
                                <Image
                                    src={profile.cover_url}
                                    alt="Capa do perfil"
                                    fill
                                    className="object-cover"
                                    style={{ objectPosition: `center ${coverPosition}%` }}
                                />
                            )
                        })() : null}
                        {isOwner && (
                            <CoverUpload
                                userId={profile.id}
                                currentCoverUrl={profile.cover_url}
                            />
                        )}
                    </div>

                    <CardContent className="pt-3 pb-4">
                        <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
                            {/* Lado Esquerdo: Avatar + Info */}
                            <div className="flex gap-4 items-start">
                                {/* Avatar com Ícone da Patente */}
                                <div className="relative -mt-12">
                                    {profile.avatar_url ? (
                                        <Image
                                            src={profile.avatar_url}
                                            alt={profile.full_name}
                                            width={96}
                                            height={96}
                                            className="rounded-full border-4 border-background shadow-xl"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full border-4 border-background shadow-xl bg-primary/10 flex items-center justify-center">
                                            <span className="text-3xl font-bold text-primary">
                                                {profile.full_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {/* Ícone da Patente */}
                                    <div className="absolute bottom-0 right-0">
                                        <RankInsignia
                                            rankId={gamification?.current_rank_id || 'recruta'}
                                            iconName={gamification?.rank?.icon}
                                            size="sm"
                                            variant="avatar"
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        {/* Nome e ID */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                                            {profile.rota_number && (
                                                <Badge variant="outline" className="border-secondary text-secondary font-black text-xs">
                                                    <Mountain className="w-3 h-3 mr-1" />
                                                    {profile.rota_number}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* MEDALHAS - fundo laranja com ícone cinza escuro (padrão do projeto) */}
                                    {earnedMedals && earnedMedals.length > 0 && (
                                        <div className="flex items-center gap-1 mb-2">
                                            <TooltipProvider>
                                                {earnedMedals.slice(0, 8).map((userMedal) => {
                                                    const medal = allMedals.find(m => m.id === userMedal.medal_id)
                                                    if (!medal) return null

                                                    return (
                                                        <Tooltip key={userMedal.medal_id}>
                                                            <TooltipTrigger asChild>
                                                                <a href="/rota-do-valente" className="hover:scale-110 transition-transform cursor-pointer block">
                                                                    <MedalBadge medalId={medal.id} size="sm" variant="profile" />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[200px]">
                                                                <p className="font-bold text-sm text-secondary">{medal.name}</p>
                                                                {medal.description && (
                                                                    <p className="text-xs text-zinc-300 mt-1">{medal.description}</p>
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )
                                                })}
                                                {earnedMedals.length > 8 && (
                                                    <span className="text-[10px] text-muted-foreground ml-1">+{earnedMedals.length - 8}</span>
                                                )}
                                            </TooltipProvider>
                                        </div>
                                    )}

                                    {/* Localização */}
                                    {profile.pista && (
                                        <div className="flex items-center gap-1 text-muted-foreground mb-2">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-xs">{profile.pista}</span>
                                        </div>
                                    )}

                                    {/* CATEGORIAS - discretas */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {MOCK_CATEGORIES.slice(0, 4).map((cat) => (
                                            <a
                                                key={cat.id}
                                                href={`/professionals?category=${encodeURIComponent(cat.name)}`}
                                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {cat.name}
                                            </a>
                                        ))}
                                    </div>

                                    {/* Stats: Avaliação + Projetos */}
                                    <div className="flex items-center gap-4 text-xs mb-3">
                                        <a
                                            href={`#ratings`}
                                            className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                                        >
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-foreground">{ratingStats?.average_rating?.toFixed(1) || '0.0'}</span>
                                            <span className="text-muted-foreground flex items-center gap-0.5">
                                                (<MessageCircle className="w-3 h-3" />{ratingStats?.total_ratings || 0})
                                            </span>
                                        </a>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            <span className="font-bold text-foreground">{confraternityStats?.total_attended || 0}</span>
                                            <span>Projetos</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lado Direito: Botões + Patente + Redes Sociais */}
                            <div className="flex flex-col items-end justify-end gap-2 h-full">
                                {/* Para visitantes: Botões de Ação permanentes em cima do bloco inferior */}
                                {!isOwner && (
                                    <ProfileActionButtons
                                        userId={profile.id}
                                        userName={profile.full_name}
                                    />
                                )}

                                {/* Espaçador para empurrar o bloco de redes sociais para baixo */}
                                <div className="flex-1" />

                                {/* Patente + Redes Sociais */}
                                <div className="flex items-center gap-2">
                                    {/* Botões de Redes Sociais */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a href={profile.whatsapp ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}` : '#'} target="_blank" rel="noopener noreferrer">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                                                        disabled={!profile.whatsapp}
                                                    >
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                        </svg>
                                                    </Button>
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>WhatsApp</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a href={profile.instagram ? `https://instagram.com/${profile.instagram.replace('@', '')}` : '#'} target="_blank" rel="noopener noreferrer">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 hover:text-white hover:border-pink-500 transition-all"
                                                        disabled={!profile.instagram}
                                                    >
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                        </svg>
                                                    </Button>
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>Instagram</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Badge da Patente */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary rounded-md blur-md opacity-60" />
                                        <Badge className="relative bg-primary hover:bg-primary/90 text-white text-xs font-black gap-1.5 px-3 py-1.5 shadow-xl shadow-primary/40 border-2 border-secondary/50 uppercase tracking-wide">
                                            <RankInsignia
                                                rankId={gamification?.current_rank_id || 'novato'}
                                                iconName={gamification?.rank?.icon}
                                                size="xs"
                                                variant="icon-only"
                                                className="w-4 h-4 text-white"
                                            />
                                            {gamification?.current_rank_id ?
                                                gamification.current_rank_id.charAt(0).toUpperCase() + gamification.current_rank_id.slice(1).replace('_', ' ')
                                                : 'Recruta'}
                                        </Badge>
                                    </div>
                                </div>



                                {/* Para dono: Botões de Ação abaixo da patente */}
                                {isOwner && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href="/dashboard/editar-perfil">
                                                        <Button variant="default" size="icon" className="h-8 w-8">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>Editar Perfil</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href="/dashboard/editar-perfil">
                                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                                            <Settings className="w-4 h-4" />
                                                        </Button>
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>Configurações</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <a href="/dashboard/notifications">
                                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                                            <Bell className="w-4 h-4" />
                                                        </Button>
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>Notificações</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                        <Card className="shadow-lg shadow-black/10 border border-white/10 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold">Informações de Contato</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{profile.email}</span>
                                </div>
                                {profile.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{profile.phone}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CTA de Upgrade na Sidebar */}
                        {isOwner && (
                            <UpgradeCTA variant="card" />
                        )}
                    </div>
                </div>
            </div >
        </div >
    )
}
