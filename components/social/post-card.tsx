'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, MoreVertical, Trash2, Edit, Award, ChevronDown, ChevronUp, ShoppingCart, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogoFrameAvatar } from '@/components/profile/logo-frame-avatar'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { PostTypeBanner, PostTypeSeal } from './post-type-patch'
import { PostComments } from './post-comments'
import { EditPostModal } from './edit-post-modal'



interface Post {
    id: string
    user_id: string
    content: string
    media_urls: string[]
    visibility: 'public' | 'connections' | 'private'
    likes_count: number
    comments_count: number
    created_at: string
    updated_at: string
    post_type?: 'confraria' | 'em_campo' | 'projeto_entregue' | 'marketplace' | null
    metadata?: {
        marketplace_ad_id?: string
        listing_type?: 'sell' | 'buy'
        category?: string
        price?: number
        location?: string
    } | null
    // Vinculações
    medal_id?: string | null
    achievement_id?: string | null
    project_id?: string | null
    confraternity_id?: string | null
    validation_status?: 'pending' | 'approved' | 'rejected' | null
    // Joined data
    user?: {
        id: string
        full_name: string
        avatar_url: string | null
        rank_id?: string
        rank_name?: string
        rank_icon?: string
        slug?: string
        rota_number?: string
    }
    user_has_liked?: boolean
    // Confraternity joined data
    confraternity?: {
        id: string
        date_occurred: string | null
        member1: {
            id: string
            full_name: string
            avatar_url: string | null
            rank_id?: string
            rank_name?: string
            rank_icon?: string
            slug?: string
            rota_number?: string
        } | null
        member2: {
            id: string
            full_name: string
            avatar_url: string | null
            rank_id?: string
            rank_name?: string
            rank_icon?: string
            slug?: string
            rota_number?: string
        } | null
    } | null
}

interface PostCardProps {
    post: Post
    currentUserId?: string
    onLike?: (postId: string) => void
    onUnlike?: (postId: string) => void
    onComment?: (postId: string) => void
    onDelete?: (postId: string) => void
    onEdit?: (postId: string) => void
    onRefresh?: () => void
}

// Avatar com patente - usando componente centralizado
// O componente real AvatarWithRank está em @/components/ui/avatar-with-rank

export function PostCard({
    post,
    currentUserId,
    onLike,
    onUnlike,
    onDelete,
    onEdit,
    onRefresh
}: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.user_has_liked || false)
    const [likesCount, setLikesCount] = useState(post.likes_count)
    const [commentsCount, setCommentsCount] = useState(post.comments_count)
    const [isLiking, setIsLiking] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const isOwner = currentUserId === post.user_id

    const handleLike = async () => {
        if (!currentUserId || isLiking) return

        setIsLiking(true)
        const newIsLiked = !isLiked

        // Optimistic update
        setIsLiked(newIsLiked)
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)

        try {
            if (newIsLiked) {
                const { error } = await supabase
                    .from('post_likes')
                    .insert({ post_id: post.id, user_id: currentUserId })

                if (error) throw error
                onLike?.(post.id)
            } else {
                const { error } = await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', post.id)
                    .eq('user_id', currentUserId)

                if (error) throw error
                onUnlike?.(post.id)
            }
        } catch (error) {
            console.error('Error toggling like:', error)
            // Revert optimistic update
            setIsLiked(!newIsLiked)
            setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1)
        } finally {
            setIsLiking(false)
        }
    }

    const handleShare = () => {
        // Navegar para dashboard com parâmetro de compartilhamento
        if (post.confraternity_id) {
            router.push(`/dashboard?share_post=${post.id}`)
        } else {
            // Compartilhar via API nativa ou copiar link
            if (navigator.share) {
                navigator.share({
                    title: 'Publicação no Rota Business Club',
                    text: post.content?.substring(0, 100) || 'Confira esta publicação',
                    url: `${window.location.origin}/na-rota?post=${post.id}`
                }).catch(() => { })
            } else {
                // Copiar link
                navigator.clipboard.writeText(`${window.location.origin}/na-rota?post=${post.id}`)
                alert('Link copiado!')
            }
        }
    }

    const handleCommentAdded = () => {
        setCommentsCount(prev => prev + 1)
        onRefresh?.()
    }

    const formatRelativeTime = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

        if (diffMins < 1) return 'agora mesmo'
        if (diffMins < 60) return `há ${diffMins}min`
        if (diffHours < 24) return `há ${diffHours}h`

        return `${dateStr} • ${timeStr}`
    }

    // Determinar tipo de post para banner
    // SOLUÇÃO SIMPLES: Se tem marketplace_ad_id na metadata, é marketplace
    const isMarketplace = !!(post.metadata as any)?.marketplace_ad_id
    const postType = isMarketplace ? 'marketplace' : (post.post_type || (post.confraternity_id ? 'confraria' : null))

    // Gerar URLs de perfil
    const getUserProfileUrl = (user: { id: string; slug?: string; rota_number?: string }) => {
        return user.slug && user.rota_number
            ? `/${user.slug}/${user.rota_number}`
            : `/perfil/${user.id}`
    }

    return (
        <>
            <Card className={cn(
                "bg-white border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
                postType === 'confraria' && "border-stone-300",
                postType === 'em_campo' && "border-zinc-300",
                postType === 'projeto_entregue' && "border-emerald-300",
                postType === 'marketplace' && "border-blue-300",
                !postType && "border-gray-200"
            )}>
                <CardContent className="p-0">
                    {/* Banner de tipo (sóbrio) */}
                    {postType && (
                        <PostTypeBanner
                            type={postType}
                            date={post.confraternity?.date_occurred
                                ? new Date(post.confraternity.date_occurred).toLocaleDateString('pt-BR')
                                : undefined
                            }
                        />
                    )}

                    {/* Header */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Avatar(s) - Double for confraternity */}
                            {post.confraternity_id && post.confraternity ? (
                                <div className="flex -space-x-3">
                                    {post.confraternity.member1 && (
                                        <div className="relative z-10">
                                            <div className="relative w-[58px] h-[58px]">
                                                <LogoFrameAvatar
                                                    src={post.confraternity.member1.avatar_url}
                                                    alt={post.confraternity.member1.full_name}
                                                    size="sm"
                                                    className="w-full h-full"
                                                />
                                                {post.confraternity.member1.rank_id && (
                                                    <div className="absolute bottom-[0px] right-[0px] z-[5]">
                                                        <RankInsignia
                                                            rankId={post.confraternity.member1.rank_id}
                                                            size="xs"
                                                            variant="icon-only"
                                                            className="w-[24px] h-[24px] border-[1.5px] border-white"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {post.confraternity.member2 && (
                                        <div className="relative z-0">
                                            <div className="relative w-[58px] h-[58px]">
                                                <LogoFrameAvatar
                                                    src={post.confraternity.member2.avatar_url}
                                                    alt={post.confraternity.member2.full_name}
                                                    size="sm"
                                                    className="w-full h-full"
                                                />
                                                {post.confraternity.member2.rank_id && (
                                                    <div className="absolute bottom-[0px] right-[0px] z-[5]">
                                                        <RankInsignia
                                                            rankId={post.confraternity.member2.rank_id}
                                                            size="xs"
                                                            variant="icon-only"
                                                            className="w-[24px] h-[24px] border-[1.5px] border-white"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : post.user && (
                                <div className="relative">
                                    <div className="relative w-[58px] h-[58px]">
                                        <LogoFrameAvatar
                                            src={post.user.avatar_url}
                                            alt={post.user.full_name}
                                            size="sm"
                                            className="w-full h-full"
                                        />
                                        {post.user.rank_id && (
                                            <div className="absolute bottom-[0px] right-[0px] z-[5]">
                                                <RankInsignia
                                                    rankId={post.user.rank_id}
                                                    size="xs"
                                                    variant="icon-only"
                                                    className="w-[24px] h-[24px] border-[1.5px] border-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* User info - Names as links */}
                            <div>
                                {post.confraternity_id && post.confraternity ? (
                                    <p className="text-sm font-semibold text-gray-900">
                                        <Link
                                            href={getUserProfileUrl(post.confraternity.member1 || { id: '' })}
                                            className="hover:underline"
                                        >
                                            {post.confraternity.member1?.full_name || 'Usuário'}
                                        </Link>
                                        {' e '}
                                        <Link
                                            href={getUserProfileUrl(post.confraternity.member2 || { id: '' })}
                                            className="hover:underline"
                                        >
                                            {post.confraternity.member2?.full_name || 'Parceiro'}
                                        </Link>
                                    </p>
                                ) : (
                                    <Link
                                        href={getUserProfileUrl(post.user || { id: post.user_id })}
                                        className="text-sm font-semibold text-gray-900 hover:underline"
                                    >
                                        {post.user?.full_name || 'Usuário'}
                                    </Link>
                                )}
                                <p className="text-xs text-gray-500">
                                    {formatRelativeTime(post.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Seal (right side) - discreto */}
                        {postType && (
                            <PostTypeSeal type={postType} size="sm" />
                        )}

                        {/* Menu (only for owner) */}
                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDelete?.(post.id)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Excluir
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Content */}
                    {post.content && (
                        <div className="px-4 pb-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {post.content}
                            </p>
                        </div>
                    )}

                    {/* Linked Entities Badges - simplified */}
                    {post.medal_id && (
                        <div className="px-4 pb-3">
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium",
                                post.validation_status === 'pending' && "bg-amber-50 text-amber-700 border border-amber-200",
                                post.validation_status === 'approved' && "bg-green-50 text-green-700 border border-green-200",
                                post.validation_status === 'rejected' && "bg-red-50 text-red-700 border border-red-200",
                                !post.validation_status && "bg-gray-50 text-gray-700 border border-gray-200"
                            )}>
                                <Award className="w-3.5 h-3.5" />
                                <span>
                                    {post.medal_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Media */}
                    {post.media_urls && post.media_urls.length > 0 && (
                        <div className={cn(
                            "grid gap-0.5",
                            post.media_urls.length === 1 && "grid-cols-1",
                            post.media_urls.length === 2 && "grid-cols-2",
                            post.media_urls.length >= 3 && "grid-cols-2"
                        )}>
                            {post.media_urls.slice(0, 4).map((url, index) => {
                                const marketplaceAdId = (post.metadata as any)?.marketplace_ad_id
                                const photoContent = (
                                    <div
                                        className={cn(
                                            "relative aspect-square bg-gray-100",
                                            post.media_urls.length === 1 && "aspect-video",
                                            post.media_urls.length === 3 && index === 0 && "col-span-2"
                                        )}
                                    >
                                        <Image
                                            src={url}
                                            alt={`Foto ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        {index === 3 && post.media_urls.length > 4 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-white text-2xl font-bold">
                                                    +{post.media_urls.length - 4}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )

                                // Se for marketplace, envolve com Link
                                if (marketplaceAdId) {
                                    return (
                                        <Link
                                            key={index}
                                            href={`/marketplace/${marketplaceAdId}`}
                                            className="hover:opacity-90 transition-opacity cursor-pointer"
                                        >
                                            {photoContent}
                                        </Link>
                                    )
                                }

                                // Senão, retorna só o conteúdo
                                return <div key={index}>{photoContent}</div>
                            })}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="px-4 py-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            {/* Like button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 h-8",
                                    isLiked && "text-red-500 hover:text-red-600"
                                )}
                                onClick={handleLike}
                                disabled={!currentUserId || isLiking}
                            >
                                <Heart className={cn(
                                    "w-5 h-5 transition-all",
                                    isLiked && "fill-current"
                                )} />
                                <span className="text-sm font-medium">
                                    {likesCount > 0 && likesCount}
                                </span>
                            </Button>

                            {/* Comment button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 h-8",
                                    showComments && "bg-gray-100"
                                )}
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                    {commentsCount > 0 && commentsCount}
                                </span>
                                {showComments ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </Button>

                            {/* Marketplace Ad Button */}
                            {postType === 'marketplace' && post.metadata?.marketplace_ad_id && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="gap-2 h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => router.push(`/marketplace/${post.metadata?.marketplace_ad_id}`)}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="text-xs font-medium">Ver Anúncio</span>
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                            )}

                            {/* Share button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 h-8 ml-auto"
                                onClick={handleShare}
                            >
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <PostComments
                        postId={post.id}
                        currentUserId={currentUserId}
                        isOpen={showComments}
                        onClose={() => setShowComments(false)}
                        onCommentAdded={handleCommentAdded}
                    />
                </CardContent>
            </Card>

            {/* Edit Modal */}
            {showEditModal && (
                <EditPostModal
                    open={showEditModal}
                    onOpenChange={setShowEditModal}
                    post={{
                        id: post.id,
                        content: post.content,
                        visibility: post.visibility
                    }}
                    onPostUpdated={() => {
                        onRefresh?.()
                    }}
                />
            )}
        </>
    )
}
