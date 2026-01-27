'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, MoreVertical, Trash2, Edit, Award, Users, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
        rank_name?: string
    }
    user_has_liked?: boolean
    // Confraternity joined data
    confraternity?: {
        id: string
        date_occurred: string | null
        member1: { id: string; full_name: string; avatar_url: string | null } | null
        member2: { id: string; full_name: string; avatar_url: string | null } | null
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
}

export function PostCard({
    post,
    currentUserId,
    onLike,
    onUnlike,
    onComment,
    onDelete,
    onEdit
}: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.user_has_liked || false)
    const [likesCount, setLikesCount] = useState(post.likes_count)
    const [isLiking, setIsLiking] = useState(false)
    const supabase = createClient()

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

    const formatRelativeTime = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        // Formata a hora sempre
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

        if (diffMins < 1) return 'agora mesmo'
        if (diffMins < 60) return `há ${diffMins}min`
        if (diffHours < 24) return `há ${diffHours}h`

        // Para posts com mais de 24h, mostra data e hora
        return `${dateStr} • ${timeStr}`
    }

    return (
        <Card className={cn(
            "bg-white border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group",
            post.confraternity_id
                ? "border-[#D2691E]/40 hover:border-[#D2691E]"
                : "border-gray-200 hover:border-[#D2691E]/30"
        )}>
            <CardContent className="p-0">
                {/* Confraternity Badge Banner */}
                {post.confraternity_id && (
                    <div className="bg-gradient-to-r from-[#D2691E] to-[#B85715] px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-white" />
                            <span className="text-white font-bold text-sm uppercase tracking-wide">
                                Confraria
                            </span>
                        </div>
                        <div className="text-white/90 text-xs font-medium">
                            {post.confraternity?.date_occurred
                                ? new Date(post.confraternity.date_occurred).toLocaleDateString('pt-BR')
                                : formatRelativeTime(post.created_at)
                            }
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar(s) - Double for confraternity */}
                        {post.confraternity_id && post.confraternity ? (
                            <div className="flex -space-x-2">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-white z-10">
                                    {post.confraternity.member1?.avatar_url ? (
                                        <Image
                                            src={post.confraternity.member1.avatar_url}
                                            alt={post.confraternity.member1.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-100">
                                            {post.confraternity.member1?.full_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-white">
                                    {post.confraternity.member2?.avatar_url ? (
                                        <Image
                                            src={post.confraternity.member2.avatar_url}
                                            alt={post.confraternity.member2.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-100">
                                            {post.confraternity.member2?.full_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                {post.user?.avatar_url ? (
                                    <Image
                                        src={post.user.avatar_url}
                                        alt={post.user.full_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                        {post.user?.full_name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User info */}
                        <div>
                            <p className="text-sm font-bold text-[#2D3142]">
                                {post.confraternity_id && post.confraternity
                                    ? `${post.confraternity.member1?.full_name || 'Usuário'} e ${post.confraternity.member2?.full_name || 'Parceiro'}`
                                    : post.user?.full_name || 'Usuário'
                                }
                            </p>
                            <p className="text-xs text-gray-600">
                                {formatRelativeTime(post.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Confraternity Seal (right side) */}
                    {post.confraternity_id && (
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D2691E] to-[#B85715] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Menu (only for owner, not for confraternity) */}
                    {isOwner && !post.confraternity_id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit?.(post.id)}>
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
                        <p className="text-sm text-[#2D3142] whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>
                )}

                {/* Linked Entities Badges */}
                {(post.medal_id || post.confraternity_id || post.project_id) && (
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {post.medal_id && (
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                                post.validation_status === 'pending' && "bg-amber-100 text-amber-800 border border-amber-300",
                                post.validation_status === 'approved' && "bg-green-100 text-green-800 border border-green-300",
                                post.validation_status === 'rejected' && "bg-red-100 text-red-800 border border-red-300",
                                !post.validation_status && "bg-gray-100 text-gray-800 border border-gray-300"
                            )}>
                                <Award className="w-3.5 h-3.5" />
                                <span>
                                    {post.medal_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                {post.validation_status === 'pending' && <span className="text-xs">⏳</span>}
                                {post.validation_status === 'approved' && <span className="text-xs">✅</span>}
                                {post.validation_status === 'rejected' && <span className="text-xs">❌</span>}
                            </div>
                        )}
                        {post.confraternity_id && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#D2691E]/10 text-[#D2691E] border border-[#D2691E]/30">
                                <Users className="w-3.5 h-3.5" />
                                <span>Confraria</span>
                            </div>
                        )}
                        {post.project_id && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1E4D40]/10 text-[#1E4D40] border border-[#1E4D40]/30">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>Projeto</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Media */}
                {post.media_urls && post.media_urls.length > 0 && (
                    <div className={cn(
                        "grid gap-1",
                        post.media_urls.length === 1 && "grid-cols-1",
                        post.media_urls.length === 2 && "grid-cols-2",
                        post.media_urls.length >= 3 && "grid-cols-2"
                    )}>
                        {post.media_urls.slice(0, 4).map((url, index) => (
                            <div
                                key={index}
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
                                {/* Overlay if more than 4 photos */}
                                {index === 3 && post.media_urls.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">
                                            +{post.media_urls.length - 4}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
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
                            className="gap-2 h-8"
                            onClick={() => onComment?.(post.id)}
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">
                                {post.comments_count > 0 && post.comments_count}
                            </span>
                        </Button>

                        {/* Share button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 h-8 ml-auto"
                        >
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
