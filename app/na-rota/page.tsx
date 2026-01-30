'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    MapPin,
    Users,
    Trophy,
    Medal,
    Calendar,
    Crown,
    Zap,
    Plus,
    Loader2,
    RefreshCw,
    HeartHandshake
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'

// Componentes centralizados
import { usePosts, useSidebarData } from '@/hooks/use-posts'
import { getProfileUrl } from '@/lib/services/posts-service'
import { PostCard } from '@/components/social/post-card'
import { CreatePostModalV2 } from '@/components/social/create-post-modal-v2'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { AvatarWithRank } from '@/components/ui/avatar-with-rank'

// ============================================
// Main Component
// ============================================
export default function NaRotaPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'global' | 'user' | 'connections'>('global')
    const [createModalOpen, setCreateModalOpen] = useState(false)

    // Hooks centralizados
    const {
        posts,
        loading: loadingPosts,
        refresh,
        toggleLike,
        deletePost,
        loadMore,
        hasMore
    } = usePosts({
        feedType: activeTab,
        userId: user?.id,
        autoLoad: true
    })

    const { data: sidebarData, loading: loadingSidebar } = useSidebarData()

    // Recarregar quando tab muda
    useEffect(() => {
        refresh()
    }, [activeTab])

    const handlePostCreated = () => {
        refresh()
    }

    const handleDelete = async (postId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta publicação?')) return
        await deletePost(postId)
    }

    // ============================================
    // Render
    // ============================================
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-16">
            <div className="container mx-auto px-4">

                {/* Header - Estilo Dashboard */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#B85715] flex items-center justify-center shadow-lg">
                            <MapPin className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Na Rota
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Feed da comunidade Rota Business Club
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Visual Premium */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Membros */}
                    <div className="group relative bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {sidebarData?.totalMembers || '-'}
                                </p>
                                <p className="text-xs text-emerald-100 font-medium">Membros Ativos</p>
                            </div>
                        </div>
                    </div>

                    {/* Publicações */}
                    <div className="group relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{posts.length}</p>
                                <p className="text-xs text-amber-100 font-medium">Publicações</p>
                            </div>
                        </div>
                    </div>

                    {/* Confrarias do Mês */}
                    <div className="group relative bg-gradient-to-br from-[#D2691E] to-[#B85715] rounded-2xl p-4 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <HeartHandshake className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {sidebarData?.confraternityThisMonth || 0}
                                </p>
                                <p className="text-xs text-orange-100 font-medium">Confrarias (mês)</p>
                            </div>
                        </div>
                    </div>

                    {/* Agenda */}
                    <div className="group relative bg-gradient-to-br from-purple-500 to-violet-700 rounded-2xl p-4 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {sidebarData?.upcomingConfrarias.length || 0}
                                </p>
                                <p className="text-xs text-purple-100 font-medium">Agenda</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Ranking */}
                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <Trophy className="w-4 h-4 text-amber-600" />
                                    Ranking do Mês
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingSidebar ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Skeleton className="w-8 h-8 rounded-full" />
                                                <Skeleton className="h-4 flex-1" />
                                            </div>
                                        ))}
                                    </div>
                                ) : !sidebarData?.ranking.length ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Ranking em breve!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {sidebarData.ranking.map((rankUser, index) => (
                                            <Link
                                                key={rankUser.id}
                                                href={getProfileUrl(rankUser)}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-amber-500 text-white' :
                                                    index === 1 ? 'bg-gray-400 text-white' :
                                                        index === 2 ? 'bg-amber-700 text-white' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {index === 0 ? <Crown className="w-3.5 h-3.5" /> : index + 1}
                                                </div>
                                                {/* Avatar com Patente - PADRÃO ROTA BUSINESS (losango) */}
                                                <AvatarWithRank
                                                    user={{
                                                        id: rankUser.id,
                                                        full_name: rankUser.full_name,
                                                        avatar_url: rankUser.avatar_url,
                                                        rank_id: rankUser.rank_id || 'novato'
                                                    }}
                                                    size="sm"
                                                    frameStyle="diamond"
                                                    linkToProfile={false}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 truncate">{rankUser.full_name}</p>
                                                    <p className="text-xs text-gray-500">{rankUser.vigor.toLocaleString()} Vigor</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <Link href="/professionals?sort=vigor">
                                    <Button variant="ghost" className="w-full rounded-none border-t border-gray-100 text-gray-600 hover:text-gray-900">
                                        Ver Ranking Completo
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Últimas Conquistas */}
                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <Medal className="w-4 h-4 text-blue-600" />
                                    Últimas Conquistas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingSidebar ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Skeleton className="w-8 h-8 rounded-full" />
                                                <Skeleton className="h-4 flex-1" />
                                            </div>
                                        ))}
                                    </div>
                                ) : !sidebarData?.recentMedals.length ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <Medal className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Nenhuma medalha ainda</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {sidebarData.recentMedals.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3">
                                                <MedalBadge medalId={item.medal_id} size="sm" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.user?.full_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.medal?.name}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {formatDistanceToNow(new Date(item.earned_at), {
                                                        addSuffix: true,
                                                        locale: ptBR
                                                    })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Agenda de Confrarias */}
                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    Agenda de Confrarias
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingSidebar ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2].map(i => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : !sidebarData?.upcomingConfrarias.length ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Nenhuma confraria agendada</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {sidebarData.upcomingConfrarias.map((conf) => (
                                            <div key={conf.id} className="p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-6 h-6 rounded bg-gray-100 overflow-hidden">
                                                        {conf.sender?.avatar_url ? (
                                                            <Image src={conf.sender.avatar_url} alt="" width={24} height={24} className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                                                {conf.sender?.full_name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Zap className="w-3 h-3 text-amber-500" />
                                                    <div className="w-6 h-6 rounded bg-gray-100 overflow-hidden">
                                                        {conf.receiver?.avatar_url ? (
                                                            <Image src={conf.receiver.avatar_url} alt="" width={24} height={24} className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                                                {conf.receiver?.full_name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {conf.sender?.full_name} × {conf.receiver?.full_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(conf.proposed_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                                    {conf.location && ` • ${conf.location}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {user && (
                                    <Link href="/elo-da-rota">
                                        <Button variant="ghost" className="w-full rounded-none border-t border-gray-100 text-gray-600 hover:text-gray-900">
                                            Ir para Elo da Rota
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                        <MapPin className="w-4 h-4 text-[#D2691E]" />
                                        Feed da Comunidade
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => refresh()}
                                            disabled={loadingPosts}
                                            className="text-gray-500"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${loadingPosts ? 'animate-spin' : ''}`} />
                                        </Button>
                                        {user && (
                                            <Button
                                                size="sm"
                                                onClick={() => setCreateModalOpen(true)}
                                                className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Publicar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4">
                                {/* Tabs */}
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
                                    <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                                        <TabsTrigger value="global" className="flex gap-2 text-xs">
                                            <Users className="w-3.5 h-3.5" />
                                            Global
                                        </TabsTrigger>
                                        <TabsTrigger value="connections" className="flex gap-2 text-xs" disabled={!user}>
                                            <Zap className="w-3.5 h-3.5" />
                                            Elos
                                        </TabsTrigger>
                                        <TabsTrigger value="user" className="flex gap-2 text-xs" disabled={!user}>
                                            <MapPin className="w-3.5 h-3.5" />
                                            Meus
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                {/* Posts */}
                                <div className="space-y-4">
                                    {loadingPosts ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <Card key={i} className="overflow-hidden border-gray-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Skeleton className="w-10 h-10 rounded-lg" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-20" />
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-40 w-full rounded-lg" />
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : posts.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum post ainda</h3>
                                            <p className="text-gray-500 text-sm mb-4">
                                                {activeTab === 'user'
                                                    ? 'Compartilhe suas experiências!'
                                                    : 'Nenhuma publicação para exibir'}
                                            </p>
                                            {user && activeTab === 'user' && (
                                                <Button onClick={() => setCreateModalOpen(true)}>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Criar Publicação
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {posts.map(post => (
                                                <PostCard
                                                    key={post.id}
                                                    post={post as any}
                                                    currentUserId={user?.id}
                                                    onLike={() => toggleLike(post.id)}
                                                    onUnlike={() => toggleLike(post.id)}
                                                    onDelete={() => handleDelete(post.id)}
                                                    onRefresh={() => refresh()}
                                                />
                                            ))}

                                            {/* Load More */}
                                            {hasMore && (
                                                <div className="text-center pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={loadMore}
                                                        className="text-gray-600"
                                                    >
                                                        Carregar mais
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* CTA para não logados */}
                                {!user && (
                                    <Card className="mt-6 p-6 text-center bg-gray-50 border-gray-200">
                                        <h3 className="font-semibold text-gray-900 mb-2">Faça parte da comunidade!</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Entre para curtir, comentar e compartilhar suas confrarias.
                                        </p>
                                        <Link href="/auth/login">
                                            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                                                Entrar
                                            </Button>
                                        </Link>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div >

            {/* Modal de Criação V2 */}
            {
                user && (
                    <CreatePostModalV2
                        open={createModalOpen}
                        onOpenChange={setCreateModalOpen}
                        userId={user.id}
                        onPostCreated={handlePostCreated}
                    />
                )
            }
        </div >
    )
}
