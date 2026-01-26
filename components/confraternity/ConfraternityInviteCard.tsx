// ============================================
// Component: ConfraternityInviteCard
// Card para exibir convite recebido/enviado
// ============================================

'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Calendar,
    MapPin,
    MessageSquare,
    Check,
    X,
    Clock,
    Loader2
} from 'lucide-react'
import { AddToCalendarButton } from '@/components/confraternity/AddToCalendarButton'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { acceptConfraternityInvite, rejectConfraternityInvite } from '@/lib/api/confraternity'
import { toast } from 'sonner'

interface ConfraternityInviteCardProps {
    invite: {
        id: string
        status: string
        proposed_date: string | null
        location: string | null
        message: string | null
        created_at: string
        sender?: {
            id: string
            full_name: string
            avatar_url: string | null
        }
        receiver?: {
            id: string
            full_name: string
            avatar_url: string | null
        }
    }
    type: 'received' | 'sent'
    currentUserId: string
    onUpdate?: () => void
}

export function ConfraternityInviteCard({
    invite,
    type,
    currentUserId,
    onUpdate
}: ConfraternityInviteCardProps) {
    const [loading, setLoading] = useState(false)

    const otherUser = type === 'received' ? invite.sender : invite.receiver

    const statusConfig = {
        pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
        accepted: { label: 'Aceito', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
        rejected: { label: 'Recusado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        completed: { label: 'Realizado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
    }

    const handleAccept = async () => {
        setLoading(true)
        try {
            const result = await acceptConfraternityInvite(invite.id, currentUserId)
            if (result.success) {
                toast.success('Convite aceito!', {
                    description: '+10 Vigor ganhos'
                })
                onUpdate?.()
            } else {
                toast.error('Erro ao aceitar', { description: result.error })
            }
        } catch (error) {
            toast.error('Erro ao aceitar convite')
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async () => {
        setLoading(true)
        try {
            const result = await rejectConfraternityInvite(invite.id, currentUserId)
            if (result.success) {
                toast.success('Convite recusado')
                onUpdate?.()
            } else {
                toast.error('Erro ao recusar', { description: result.error })
            }
        } catch (error) {
            toast.error('Erro ao recusar convite')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header com avatar e nome */}
            <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser?.avatar_url || ''} />
                    <AvatarFallback>
                        {otherUser?.full_name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">
                            {otherUser?.full_name}
                        </h3>
                        <Badge className={statusConfig[invite.status as keyof typeof statusConfig]?.color}>
                            {statusConfig[invite.status as keyof typeof statusConfig]?.label}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(invite.created_at), {
                            addSuffix: true,
                            locale: ptBR
                        })}
                    </p>
                </div>
            </div>

            {/* Detalhes do convite */}
            {invite.proposed_date && (
                <div className="flex items-center gap-2 text-sm mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {new Date(invite.proposed_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            )}

            {invite.location && (
                <div className="flex items-center gap-2 text-sm mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{invite.location}</span>
                </div>
            )}

            {invite.message && (
                <div className="flex items-start gap-2 text-sm mb-3 mt-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-muted-foreground italic">
                        "{invite.message}"
                    </p>
                </div>
            )}

            {/* Ações (apenas para convites pendentes recebidos) */}
            {type === 'received' && invite.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReject}
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Recusar
                            </>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Aceitar +10 Vigor
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Botão para marcar como realizado (convites aceitos) */}
            {invite.status === 'accepted' && invite.proposed_date && (
                <div className="space-y-2 mt-4 pt-3 border-t">
                    {/* Adicionar ao Google Calendar */}
                    <AddToCalendarButton
                        otherMemberName={otherUser?.full_name || 'Membro'}
                        proposedDate={invite.proposed_date}
                        location={invite.location || undefined}
                        message={invite.message || undefined}
                        variant="outline"
                        size="sm"
                        className="w-full"
                    />

                    {/* Marcar como realizado */}
                    <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                            window.location.href = `/elo-da-rota/confraria/completar/${invite.id}`
                        }}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Marcar como Realizado
                    </Button>
                </div>
            )}
        </div>
    )
}
