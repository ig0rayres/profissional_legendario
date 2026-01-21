'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Heart,
    MessageCircle,
    Users,
    CheckCircle2,
    Loader2,
    ImageIcon,
    Flame,
    Trophy,
    Medal,
    Calendar,
    Sparkles,
    Crown,
    Zap,
    Target,
    Shield
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { MedalBadge } from '@/components/gamification/medal-badge'

// ============================================
// Interfaces
// ============================================
interface Post {
    id: string
    user_id: string
    content: string | null
    media_urls: string[]
    confraternity_id: string | null
    ai_validation: {
        approved: boolean
        people_count: number
        confidence: string
        reason: string
    } | null
    visibility: string
    likes_count: number
    comments_count: number
    created_at: string
    author: {
        id: string
        full_name: string
        avatar_url: string | null
        slug: string | null
        rota_number: string | null
    }
    user_gamification: {
        current_rank_id: string
    } | null
    liked_by_me?: boolean
}

interface RankingUser {
    id: string
    full_name: string
    avatar_url: string | null
    slug: string | null
    rota_number: string | null
    vigor: number
    rank_id: string
}

interface RecentMedal {
    user_id: string
    medal_id: string
    earned_at: string
    user: {
        full_name: string
        avatar_url: string | null
    }
    medal: {
        name: string
        icon: string
    }
}

interface UpcomingConfraternity {
    id: string
    proposed_date: string
    location: string
    sender: {
        full_name: string
        avatar_url: string | null
    }
    receiver: {
        full_name: string
        avatar_url: string | null
    }
}

// ============================================
// Main Component
// ============================================
export default function NaRotaPage() {
    const { user } = useAuth()
    const supabase = createClient()

    // States
    const [posts, setPosts] = useState<Post[]>([])
    const [ranking, setRanking] = useState<RankingUser[]>([])
    const [recentMedals, setRecentMedals] = useState<RecentMedal[]>([])
    const [upcomingConfs, setUpcomingConfs] = useState<UpcomingConfraternity[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('global')
    const [likingPost, setLikingPost] = useState<string | null>(null)

    useEffect(() => {
        loadAllData()
    }, [])

    useEffect(() => {
        loadPosts()
    }, [activeTab])

    async function loadAllData() {
        setLoading(true)
        await Promise.all([
            loadPosts(),
            loadRanking(),
            loadRecentMedals(),
            loadUpcomingConfrarias()
        ])
        setLoading(false)
    }

    async function loadPosts() {
        try {
            let query = supabase
                .from('posts')
                .select(`
                    *,
                    author:profiles!user_id(
                        id, full_name, avatar_url, slug, rota_number
                    ),
                    user_gamification:gamification_stats!user_id(
                        current_rank_id
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(10)

            if (activeTab === 'global') {
                query = query.eq('visibility', 'public')
            } else if (activeTab === 'meus' && user) {
                query = query.eq('user_id', user.id)
            }

            const { data, error } = await query

            if (error) {
                console.error('Erro ao carregar posts:', error)
                setPosts([])
                return
            }

            let postsWithLikes = data || []
            if (user && data && data.length > 0) {
                const { data: myLikes } = await supabase
                    .from('post_likes')
                    .select('post_id')
                    .eq('user_id', user.id)
                    .in('post_id', data.map(p => p.id))

                const likedPostIds = new Set(myLikes?.map(l => l.post_id) || [])
                postsWithLikes = data.map(p => ({
                    ...p,
                    liked_by_me: likedPostIds.has(p.id)
                }))
            }

            setPosts(postsWithLikes as Post[])
        } catch (error) {
            console.error('Exceção ao carregar posts:', error)
            setPosts([])
        }
    }

    async function loadRanking() {
        try {
            const { data, error } = await supabase
                .from('gamification_stats')
                .select(`
                    user_id,
                    total_xp,
                    current_rank_id,
                    user:profiles!user_id(
                        id, full_name, avatar_url, slug, rota_number
                    )
                `)
                .order('total_xp', { ascending: false })
                .limit(5)

            if (error) {
                console.error('Erro ao carregar ranking:', error)
                return
            }

            const rankingData = (data || []).map(item => ({
                id: item.user_id,
                full_name: (item.user as any)?.full_name || 'Usuário',
                avatar_url: (item.user as any)?.avatar_url,
                slug: (item.user as any)?.slug,
                rota_number: (item.user as any)?.rota_number,
                vigor: item.total_xp,
                rank_id: item.current_rank_id
            }))

            setRanking(rankingData)
        } catch (error) {
            console.error('Exceção ao carregar ranking:', error)
        }
    }

    async function loadRecentMedals() {
        try {
            const { data, error } = await supabase
                .from('user_badges')
                .select(`
                    user_id,
                    badge_id,
                    earned_at,
                    user:profiles!user_id(full_name, avatar_url),
                    badge:badges!badge_id(name, icon)
                `)
                .order('earned_at', { ascending: false })
                .limit(5)

            if (error) {
                console.error('Erro ao carregar medalhas:', error)
                return
            }

            // Mapear para o formato esperado
            const mappedData = (data || []).map(item => ({
                user_id: item.user_id,
                medal_id: item.badge_id,
                earned_at: item.earned_at,
                user: item.user,
                medal: item.badge
            }))

            setRecentMedals(mappedData as any)
        } catch (error) {
            console.error('Exceção ao carregar medalhas:', error)
        }
    }

    async function loadUpcomingConfrarias() {
        try {
            const { data, error } = await supabase
                .from('confraternity_invites')
                .select(`
                    id,
                    proposed_date,
                    location,
                    sender:profiles!sender_id(full_name, avatar_url),
                    receiver:profiles!receiver_id(full_name, avatar_url)
                `)
                .eq('status', 'accepted')
                .gte('proposed_date', new Date().toISOString())
                .order('proposed_date', { ascending: true })
                .limit(5)

            if (error) {
                console.error('Erro ao carregar confrarias:', error)
                return
            }

            setUpcomingConfs((data || []) as any)
        } catch (error) {
            console.error('Exceção ao carregar confrarias:', error)
        }
    }

    async function toggleLike(postId: string) {
        if (!user) return

        setLikingPost(postId)
        const post = posts.find(p => p.id === postId)
        if (!post) return

        try {
            if (post.liked_by_me) {
                await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id)

                setPosts(prev => prev.map(p =>
                    p.id === postId
                        ? { ...p, liked_by_me: false, likes_count: Math.max(0, p.likes_count - 1) }
                        : p
                ))
            } else {
                await supabase
                    .from('post_likes')
                    .insert({ post_id: postId, user_id: user.id })

                setPosts(prev => prev.map(p =>
                    p.id === postId
                        ? { ...p, liked_by_me: true, likes_count: p.likes_count + 1 }
                        : p
                ))
            }
        } catch (error) {
            console.error('Erro ao curtir:', error)
        } finally {
            setLikingPost(null)
        }
    }

    function getProfileUrl(user: { slug?: string | null; rota_number?: string | null; id: string }) {
        if (user.slug && user.rota_number) {
            return `/${user.slug}/${user.rota_number}`
        }
        return `/professional/${user.id}`
    }

    // ============================================
    // Render
    // ============================================
    return (
        <div className="min-h-screen bg-adventure pt-24 pb-16">
            <div className="container mx-auto px-4">
                {/* Hero Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Flame className="w-10 h-10 text-secondary animate-pulse" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Na Rota
                        </h1>
                        <Flame className="w-10 h-10 text-secondary animate-pulse" />
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        O centro de atividades da comunidade Rota Business Club.
                        Veja o ranking, conquistas recentes, agenda e muito mais!
                    </p>
                </div>

                {/* Stats Bar - Gradientes Verde/Laranja */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-3 bg-primary/20 rounded-full">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{ranking.length > 0 ? '50+' : '-'}</p>
                                <p className="text-xs text-muted-foreground">Membros Ativos</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-3 bg-primary/20 rounded-full">
                                <CheckCircle2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{posts.length}</p>
                                <p className="text-xs text-muted-foreground">Confrarias Realizadas</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-3 bg-secondary/20 rounded-full">
                                <Medal className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{recentMedals.length > 0 ? '120+' : '-'}</p>
                                <p className="text-xs text-muted-foreground">Medalhas Conquistadas</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-3 bg-primary/20 rounded-full">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{upcomingConfs.length}</p>
                                <p className="text-xs text-muted-foreground">Confrarias Agendadas</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Ranking & Conquistas */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Card Ranking */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-secondary/20 to-secondary/10 border-b border-secondary/20">
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-secondary" />
                                    Ranking do Mês
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Skeleton className="w-8 h-8 rounded-full" />
                                                <Skeleton className="h-4 flex-1" />
                                            </div>
                                        ))}
                                    </div>
                                ) : ranking.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Ranking em breve!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {ranking.map((user, index) => (
                                            <Link
                                                key={user.id}
                                                href={getProfileUrl(user)}
                                                className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-secondary text-secondary-foreground' :
                                                    index === 1 ? 'bg-slate-400 text-slate-950' :
                                                        index === 2 ? 'bg-amber-700 text-amber-100' :
                                                            'bg-primary/20 text-primary'
                                                    }`}>
                                                    {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
                                                </div>
                                                <Avatar className="w-10 h-10 border-2 border-primary/20">
                                                    <AvatarImage src={user.avatar_url || ''} />
                                                    <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{user.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.vigor.toLocaleString()} Vigor
                                                    </p>
                                                </div>
                                                {user.rank_id && (
                                                    <RankInsignia rankId={user.rank_id} size="sm" />
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <Link href="/professionals?sort=vigor">
                                    <Button variant="ghost" className="w-full rounded-t-none border-t">
                                        Ver Ranking Completo
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Card Últimas Conquistas */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-primary/20">
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Últimas Conquistas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Skeleton className="w-8 h-8 rounded-full" />
                                                <Skeleton className="h-4 flex-1" />
                                            </div>
                                        ))}
                                    </div>
                                ) : recentMedals.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <Medal className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Nenhuma medalha ainda</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {recentMedals.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 p-4">
                                                <MedalBadge medalId={item.medal_id} size="sm" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {item.user?.full_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.medal?.name}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
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

                        {/* Card Agenda de Confrarias */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/10 border-b border-primary/20">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Agenda de Confrarias
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2].map(i => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : upcomingConfs.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Nenhuma confraria agendada</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {upcomingConfs.map((conf) => (
                                            <div key={conf.id} className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={conf.sender?.avatar_url || ''} />
                                                        <AvatarFallback className="text-xs">
                                                            {conf.sender?.full_name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <Zap className="w-3 h-3 text-secondary" />
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage src={conf.receiver?.avatar_url || ''} />
                                                        <AvatarFallback className="text-xs">
                                                            {conf.receiver?.full_name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {conf.sender?.full_name} × {conf.receiver?.full_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    📅 {format(new Date(conf.proposed_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                                    {conf.location && ` • 📍 ${conf.location}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {user && (
                                    <Link href="/elo-da-rota">
                                        <Button variant="ghost" className="w-full rounded-t-none border-t">
                                            Ir para Elo da Rota
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Feed */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden h-fit">
                            <CardHeader className="bg-gradient-to-r from-secondary/20 via-primary/10 to-secondary/20 border-b border-secondary/20">
                                <CardTitle className="flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-secondary" />
                                    Feed da Comunidade
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {/* Tabs */}
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                                    <TabsList className="grid w-full grid-cols-3 bg-card/50">
                                        <TabsTrigger value="global" className="flex gap-2">
                                            <Users className="w-4 h-4" />
                                            Global
                                        </TabsTrigger>
                                        <TabsTrigger value="elos" className="flex gap-2" disabled={!user}>
                                            <Heart className="w-4 h-4" />
                                            Elos
                                        </TabsTrigger>
                                        <TabsTrigger value="meus" className="flex gap-2" disabled={!user}>
                                            <ImageIcon className="w-4 h-4" />
                                            Meus
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                {/* Feed Posts */}
                                <div className="space-y-4">
                                    {loading ? (
                                        Array.from({ length: 2 }).map((_, i) => (
                                            <Card key={i} className="overflow-hidden">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <Skeleton className="w-10 h-10 rounded-full" />
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
                                            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">Nenhum post ainda</h3>
                                            <p className="text-muted-foreground text-sm mb-4">
                                                Realize uma confraria para fazer sua primeira postagem!
                                            </p>
                                            {user && (
                                                <Link href="/elo-da-rota">
                                                    <Button>
                                                        <Zap className="w-4 h-4 mr-2" />
                                                        Ir para Elo da Rota
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        posts.map(post => (
                                            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                                <CardContent className="p-0">
                                                    {/* Header do Post */}
                                                    <div className="p-4 flex items-center gap-3">
                                                        <Link href={getProfileUrl(post.author)}>
                                                            <div className="relative">
                                                                <Avatar className="w-10 h-10 border-2 border-primary/20">
                                                                    <AvatarImage src={post.author.avatar_url || ''} />
                                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                                        {post.author.full_name?.charAt(0) || '?'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                {post.user_gamification?.current_rank_id && (
                                                                    <div className="absolute -bottom-1 -right-1">
                                                                        <RankInsignia
                                                                            rankId={post.user_gamification.current_rank_id}
                                                                            size="xs"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                        <div className="flex-1">
                                                            <Link href={getProfileUrl(post.author)}>
                                                                <h4 className="font-semibold text-sm hover:text-primary transition-colors">
                                                                    {post.author.full_name}
                                                                </h4>
                                                            </Link>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(post.created_at), {
                                                                    addSuffix: true,
                                                                    locale: ptBR
                                                                })}
                                                            </p>
                                                        </div>
                                                        {post.confraternity_id && post.ai_validation?.approved && (
                                                            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Verificada
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Conteúdo/Legenda */}
                                                    {post.content && (
                                                        <div className="px-4 pb-3">
                                                            <p className="text-sm whitespace-pre-wrap line-clamp-3">{post.content}</p>
                                                        </div>
                                                    )}

                                                    {/* Mídia */}
                                                    {post.media_urls && post.media_urls.length > 0 && (
                                                        <div className="relative aspect-video bg-black/5">
                                                            <Image
                                                                src={post.media_urls[0]}
                                                                alt="Foto da confraria"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                            {post.media_urls.length > 1 && (
                                                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                                    +{post.media_urls.length - 1}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Ações */}
                                                    <div className="p-3 flex items-center gap-4 border-t border-white/5">
                                                        <button
                                                            onClick={() => toggleLike(post.id)}
                                                            disabled={!user || likingPost === post.id}
                                                            className={`flex items-center gap-1.5 transition-colors ${post.liked_by_me
                                                                ? 'text-secondary'
                                                                : 'text-muted-foreground hover:text-secondary'
                                                                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {likingPost === post.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Heart className={`w-4 h-4 ${post.liked_by_me ? 'fill-current' : ''}`} />
                                                            )}
                                                            <span className="text-sm">{post.likes_count}</span>
                                                        </button>

                                                        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                                                            <MessageCircle className="w-4 h-4" />
                                                            <span className="text-sm">{post.comments_count}</span>
                                                        </button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>

                                {/* Info para não logados */}
                                {!user && (
                                    <Card className="mt-6 p-6 text-center bg-primary/5 border-primary/20">
                                        <h3 className="font-semibold mb-2">Faça parte da comunidade!</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Entre para curtir, comentar e compartilhar suas confrarias.
                                        </p>
                                        <Link href="/auth/login">
                                            <Button className="bg-primary hover:bg-primary/90">
                                                Entrar
                                            </Button>
                                        </Link>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
