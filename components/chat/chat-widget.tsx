'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
    MessageCircle,
    X,
    Send,
    ChevronLeft,
    User,
    Loader2,
    Check,
    CheckCheck,
    Minimize2,
    Maximize2,
    Smile,
    Paperclip,
    Image as ImageIcon,
    Link2,
    XCircle,
    Bot
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// ID do usuário sistema
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

interface Conversation {
    id: string
    participant_1: string
    participant_2: string
    last_message_at: string
    last_message_preview: string | null
    other_user: {
        id: string
        full_name: string
        avatar_url: string | null
    }
    unread_count: number
}

interface Message {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    read_at: string | null
    created_at: string
}

interface EloRequest {
    id: string
    requester_id: string
    requester_name: string
    requester_avatar: string | null
    created_at: string
}

export function ChatWidget() {
    const { user } = useAuth()
    const supabase = createClient()

    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [unreadTotal, setUnreadTotal] = useState(0)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)

    // Estado para solicitações de elo pendentes
    const [eloRequests, setEloRequests] = useState<EloRequest[]>([])
    const [processingElo, setProcessingElo] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Scroll para última mensagem
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    // Carregar conversas
    const loadConversations = useCallback(async () => {
        if (!user) return

        setLoading(true)

        const { data: convs, error } = await supabase
            .from('conversations')
            .select('*')
            .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
            .order('last_message_at', { ascending: false })

        if (error) {
            console.error('Erro ao carregar conversas:', error)
            setLoading(false)
            return
        }

        if (!convs || convs.length === 0) {
            setConversations([])
            setLoading(false)
            return
        }

        // Buscar dados dos outros usuários
        const otherUserIds = convs.map(c =>
            c.participant_1 === user.id ? c.participant_2 : c.participant_1
        )

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', otherUserIds)

        // Buscar contagem de não lidas por conversa
        const { data: unreadData } = await supabase
            .from('messages')
            .select('conversation_id')
            .in('conversation_id', convs.map(c => c.id))
            .neq('sender_id', user.id)
            .is('read_at', null)

        const unreadMap = new Map<string, number>()
        unreadData?.forEach(m => {
            const count = unreadMap.get(m.conversation_id) || 0
            unreadMap.set(m.conversation_id, count + 1)
        })

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

        const formattedConvs: Conversation[] = convs.map(c => {
            const otherUserId = c.participant_1 === user.id ? c.participant_2 : c.participant_1
            const otherUser = profilesMap.get(otherUserId)

            return {
                ...c,
                other_user: {
                    id: otherUserId,
                    full_name: otherUser?.full_name || 'Usuário',
                    avatar_url: otherUser?.avatar_url || null
                },
                unread_count: unreadMap.get(c.id) || 0
            }
        })

        setConversations(formattedConvs)
        setUnreadTotal(Array.from(unreadMap.values()).reduce((a, b) => a + b, 0))
        setLoading(false)
    }, [user, supabase])

    // Carregar solicitações de elo pendentes
    const loadEloRequests = useCallback(async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('user_connections')
            .select('id, requester_id, created_at')
            .eq('addressee_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error || !data || data.length === 0) {
            setEloRequests([])
            return
        }

        // Buscar dados dos solicitantes
        const requesterIds = data.map(d => d.requester_id)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', requesterIds)

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

        const formattedRequests: EloRequest[] = data.map(d => ({
            id: d.id,
            requester_id: d.requester_id,
            requester_name: profilesMap.get(d.requester_id)?.full_name || 'Usuário',
            requester_avatar: profilesMap.get(d.requester_id)?.avatar_url || null,
            created_at: d.created_at
        }))

        setEloRequests(formattedRequests)
    }, [user, supabase])

    // Responder a solicitação de elo
    const respondToElo = async (request: EloRequest, accept: boolean) => {
        if (!user) return

        setProcessingElo(request.id)

        try {
            const { error } = await supabase
                .from('user_connections')
                .update({
                    status: accept ? 'accepted' : 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', request.id)

            if (error) {
                console.error('[Chat] Erro ao responder elo:', error)
                return
            }

            // Gamificação se aceitou
            if (accept) {
                console.log('[Chat] Gamificação: Aceitou elo, adicionando XP...')
                try {
                    const { awardPoints, awardBadge, checkEloPointsAlreadyAwarded } = await import('@/lib/api/gamification')

                    // Verificar se já recebeu pontos por este elo (anti-farming)
                    const alreadyAwarded = await checkEloPointsAlreadyAwarded(user.id, request.requester_id, 'elo_accepted')

                    if (!alreadyAwarded) {
                        await awardPoints(
                            user.id,
                            5,
                            'elo_accepted',
                            `Aceitou elo com ${request.requester_name}`,
                            { target_user_id: request.requester_id } // Para verificação de duplicação
                        )

                        // Verificar primeiro elo para medalha
                        const { count } = await supabase
                            .from('user_connections')
                            .select('*', { count: 'exact', head: true })
                            .eq('addressee_id', user.id)
                            .eq('status', 'accepted')

                        if (count === 1) {
                            await awardBadge(user.id, 'presente')
                            console.log('[Chat] Medalha "Presente" concedida!')
                        }
                    } else {
                        console.log('[Chat] Pontos de aceite já creditados para este par de usuários')
                    }
                } catch (gamifError) {
                    console.error('[Chat] Erro de gamificação:', gamifError)
                }

                // Mostrar notificação de sucesso
                setShowNotification(true)
                setNotificationMessage(`🔗 Você e ${request.requester_name} agora estão conectados!`)
                setTimeout(() => setShowNotification(false), 4000)
            }

            // Remover da lista
            setEloRequests(prev => prev.filter(r => r.id !== request.id))
        } finally {
            setProcessingElo(null)
        }
    }

    // Carregar mensagens de uma conversa
    const loadMessages = useCallback(async (conversationId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Erro ao carregar mensagens:', error)
            return
        }

        setMessages(data || [])

        // Marcar como lidas
        if (user && data && data.length > 0) {
            const unreadIds = data
                .filter(m => m.sender_id !== user.id && !m.read_at)
                .map(m => m.id)

            if (unreadIds.length > 0) {
                await supabase
                    .from('messages')
                    .update({ read_at: new Date().toISOString() })
                    .in('id', unreadIds)

                // Atualizar contagem local
                loadConversations()
            }
        }

        setTimeout(scrollToBottom, 100)
    }, [user, supabase, scrollToBottom, loadConversations])

    // Enviar mensagem
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user || sending) return

        setSending(true)

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: selectedConversation.id,
                sender_id: user.id,
                content: newMessage.trim()
            })

        if (error) {
            console.error('Erro ao enviar mensagem:', error)
            setSending(false)
            return
        }

        setNewMessage('')
        setSending(false)
        inputRef.current?.focus()
    }

    // Selecionar conversa
    const selectConversation = (conv: Conversation) => {
        setSelectedConversation(conv)
        loadMessages(conv.id)
    }

    // Voltar para lista
    const goBack = () => {
        setSelectedConversation(null)
        setMessages([])
        loadConversations()
    }

    // Listener de realtime para novas mensagens (funciona mesmo com chat fechado)
    useEffect(() => {
        if (!user) return

        console.log('[Chat] 🔌 Conectando listener de mensagens para:', user.id)

        const channel = supabase
            .channel('messages-realtime-' + user.id)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    console.log('[Chat] 📬 Nova mensagem recebida:', newMsg.sender_id, newMsg.content?.substring(0, 30))

                    // Se for mensagem de outro usuário (não sou eu quem enviou)
                    if (newMsg.sender_id !== user.id) {
                        console.log('[Chat] 🔔 Notificando nova mensagem!')
                        setShowNotification(true)
                        setNotificationMessage('Nova mensagem recebida!')
                        setTimeout(() => setShowNotification(false), 3000)

                        // Incrementar contador de não lidas
                        setUnreadTotal(prev => prev + 1)

                        // Atualizar lista de conversas
                        loadConversations()
                    }

                    // Se estamos na conversa aberta, adicionar mensagem
                    if (selectedConversation && newMsg.conversation_id === selectedConversation.id) {
                        setMessages(prev => [...prev, newMsg])
                        scrollToBottom()

                        // Marcar como lida se for do outro usuário
                        if (newMsg.sender_id !== user.id) {
                            supabase
                                .from('messages')
                                .update({ read_at: new Date().toISOString() })
                                .eq('id', newMsg.id)
                        }
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Chat] 📡 Status do canal de mensagens:', status)
            })

        return () => {
            console.log('[Chat] 🔌 Desconectando listener de mensagens')
            supabase.removeChannel(channel)
        }
    }, [user])

    // Carregar conversas e elos quando abrir
    useEffect(() => {
        if (isOpen && user) {
            loadConversations()
            loadEloRequests()
        }
    }, [isOpen, user, loadConversations, loadEloRequests])

    // Carregar contagem inicial de não lidas e elos pendentes
    useEffect(() => {
        if (user) {
            supabase.rpc('get_unread_messages_count', { p_user_id: user.id })
                .then(({ data }) => {
                    if (data) setUnreadTotal(data)
                })

            // Carregar solicitações de elo para o badge
            loadEloRequests()
        }
    }, [user, supabase, loadEloRequests])

    // Listener para abrir chat com usuário específico (do botão Mensagem no perfil)
    useEffect(() => {
        const handleOpenChat = async (event: CustomEvent<{ userId: string }>) => {
            if (!user) return

            const targetUserId = event.detail.userId

            // Abrir o widget
            setIsOpen(true)
            setIsMinimized(false)

            // Esperar carregar conversas
            await loadConversations()

            // Tentar encontrar conversa existente
            const existingConv = conversations.find(
                c => c.other_user.id === targetUserId
            )

            if (existingConv) {
                selectConversation(existingConv)
            } else {
                // Criar nova conversa
                const { data: convId } = await supabase
                    .rpc('get_or_create_conversation', {
                        user_1: user.id,
                        user_2: targetUserId
                    })

                if (convId) {
                    // Buscar dados do outro usuário
                    const { data: otherProfile } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .eq('id', targetUserId)
                        .single()

                    if (otherProfile) {
                        const newConv: Conversation = {
                            id: convId,
                            participant_1: user.id < targetUserId ? user.id : targetUserId,
                            participant_2: user.id < targetUserId ? targetUserId : user.id,
                            last_message_at: new Date().toISOString(),
                            last_message_preview: null,
                            other_user: {
                                id: otherProfile.id,
                                full_name: otherProfile.full_name,
                                avatar_url: otherProfile.avatar_url
                            },
                            unread_count: 0
                        }
                        selectConversation(newConv)
                    }
                }
            }
        }

        window.addEventListener('openChat', handleOpenChat as EventListener)

        return () => {
            window.removeEventListener('openChat', handleOpenChat as EventListener)
        }
    }, [user, supabase, conversations, loadConversations])

    // Emojis comuns
    const commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '🔥', '💪', '🎉', '✨', '😍', '🤔', '👏']

    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji)
        setShowEmojiPicker(false)
        inputRef.current?.focus()
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedConversation) return

        setUploadingFile(true)
        try {
            // Upload para Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `chat/${selectedConversation.id}/${fileName}`

            const { error: uploadError, data } = await supabase.storage
                .from('chat-files')
                .upload(filePath, file)

            if (uploadError) {
                console.error('Erro no upload:', uploadError)
                alert('Erro ao enviar arquivo')
                return
            }

            // Pegar URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('chat-files')
                .getPublicUrl(filePath)

            // Enviar mensagem com link do arquivo
            const isImage = file.type.startsWith('image/')
            const messageContent = isImage
                ? `📷 [Imagem: ${file.name}](${publicUrl})`
                : `📎 [Arquivo: ${file.name}](${publicUrl})`

            const { error: messageError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: selectedConversation.id,
                    sender_id: user.id,
                    content: messageContent
                })

            if (messageError) throw messageError

        } catch (error) {
            console.error('Erro ao enviar arquivo:', error)
            alert('Erro ao enviar arquivo')
        } finally {
            setUploadingFile(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // Função para renderizar conteúdo da mensagem (suporte a arquivos/imagens)
    const renderMessageContent = (content: string, isMine: boolean) => {
        // Checar se é uma imagem [Imagem: nome](url)
        const imageMatch = content.match(/📷 \[Imagem: (.+?)\]\((.+?)\)/)
        if (imageMatch) {
            const [, fileName, url] = imageMatch
            return (
                <div className="space-y-1">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                            src={url}
                            alt={fileName}
                            className="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        />
                    </a>
                    <span className={cn("text-xs", isMine ? "text-white/70" : "text-muted-foreground")}>
                        📷 {fileName}
                    </span>
                </div>
            )
        }

        // Checar se é um arquivo [Arquivo: nome](url)
        const fileMatch = content.match(/📎 \[Arquivo: (.+?)\]\((.+?)\)/)
        if (fileMatch) {
            const [, fileName, url] = fileMatch
            return (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-lg transition-colors",
                        isMine
                            ? "bg-white/20 hover:bg-white/30"
                            : "bg-gray-300 hover:bg-gray-400"
                    )}
                >
                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{fileName}</span>
                </a>
            )
        }

        // Mensagem de texto normal
        return <span className="text-sm break-words">{content}</span>
    }

    if (!user) return null

    return (
        <>
            {/* Notificação de Nova Mensagem/Medalha */}
            {showNotification && (
                <div className={cn(
                    "fixed bottom-24 right-6 z-[60] px-4 py-3 rounded-lg shadow-2xl animate-bounce max-w-xs",
                    notificationMessage.includes('🏅')
                        ? "bg-gradient-to-r from-accent to-orange-600 text-white border-2 border-accent/50"
                        : "bg-primary text-white"
                )}>
                    <div className="flex items-center gap-2">
                        {notificationMessage.includes('🏅') ? (
                            <span className="text-xl">🏅</span>
                        ) : (
                            <MessageCircle className="w-5 h-5" />
                        )}
                        <span className="text-sm font-bold">{notificationMessage}</span>
                    </div>
                </div>
            )}

            {/* Botão flutuante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center"
                >
                    <MessageCircle className="w-6 h-6" />
                    {(unreadTotal + eloRequests.length) > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                            {(unreadTotal + eloRequests.length) > 9 ? '9+' : (unreadTotal + eloRequests.length)}
                        </span>
                    )}
                </button>
            )}

            {/* Widget de Chat */}
            {isOpen && (
                <div
                    className={cn(
                        "fixed bottom-6 right-6 z-50 bg-muted/75 border border-border rounded-2xl shadow-2xl overflow-hidden transition-all",
                        isMinimized ? "w-80 h-14" : "w-96 h-[500px]"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
                        <div className="flex items-center gap-2">
                            {selectedConversation && (
                                <button onClick={goBack} className="hover:bg-white/20 p-1 rounded">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                            {/* Avatar ou ícone */}
                            {selectedConversation ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                                    {selectedConversation.other_user.avatar_url ? (
                                        <Image
                                            src={selectedConversation.other_user.avatar_url}
                                            alt={selectedConversation.other_user.full_name}
                                            width={32}
                                            height={32}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <User className="w-4 h-4 text-white/70" />
                                    )}
                                </div>
                            ) : (
                                <MessageCircle className="w-5 h-5" />
                            )}
                            <span className="font-semibold">
                                {selectedConversation
                                    ? selectedConversation.other_user.full_name
                                    : 'Mensagens'}
                            </span>
                            {!selectedConversation && unreadTotal > 0 && (
                                <Badge className="text-xs bg-accent text-white">
                                    {unreadTotal}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="hover:bg-white/20 p-1.5 rounded"
                            >
                                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1.5 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    {!isMinimized && (
                        <div className="h-[calc(100%-56px)] flex flex-col">
                            {!selectedConversation ? (
                                // Lista de conversas
                                <ScrollArea className="flex-1">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Seção de Solicitações de Elo Pendentes */}
                                            {eloRequests.length > 0 && (
                                                <div className="border-b border-accent/30 bg-accent/5">
                                                    <div className="px-3 py-2 flex items-center gap-2 bg-accent/10">
                                                        <Link2 className="w-4 h-4 text-accent" />
                                                        <span className="text-xs font-bold text-accent uppercase tracking-wider">
                                                            Solicitações de Elo
                                                        </span>
                                                        <Badge className="bg-accent text-white text-[10px] h-5">
                                                            {eloRequests.length}
                                                        </Badge>
                                                    </div>
                                                    {eloRequests.map(request => (
                                                        <div key={request.id} className="flex items-center gap-3 p-3 bg-white hover:bg-accent/5 transition-colors">
                                                            {/* Avatar */}
                                                            <div className="relative w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {request.requester_avatar ? (
                                                                    <Image
                                                                        src={request.requester_avatar}
                                                                        alt={request.requester_name}
                                                                        width={40}
                                                                        height={40}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                ) : (
                                                                    <User className="w-5 h-5 text-accent/60" />
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <span className="font-medium text-sm truncate block">
                                                                    {request.requester_name}
                                                                </span>
                                                                <span className="text-xs text-accent">
                                                                    Quer criar um elo
                                                                </span>
                                                            </div>

                                                            {/* Botões */}
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => respondToElo(request, true)}
                                                                    disabled={processingElo === request.id}
                                                                    className="p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                                                                    title="Aceitar"
                                                                >
                                                                    {processingElo === request.id ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => respondToElo(request, false)}
                                                                    disabled={processingElo === request.id}
                                                                    className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors disabled:opacity-50"
                                                                    title="Recusar"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Lista de conversas */}
                                            {conversations.length === 0 && eloRequests.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
                                                    <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Nenhuma conversa ainda
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Visite o perfil de um membro e clique em "Mensagem"
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-border">
                                                    {conversations.map(conv => (
                                                        <button
                                                            key={conv.id}
                                                            onClick={() => selectConversation(conv)}
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                                                        >
                                                            {/* Avatar */}
                                                            <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {conv.other_user.avatar_url ? (
                                                                    <Image
                                                                        src={conv.other_user.avatar_url}
                                                                        alt={conv.other_user.full_name}
                                                                        width={40}
                                                                        height={40}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                ) : (
                                                                    <User className="w-5 h-5 text-primary/60" />
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium text-sm truncate">
                                                                        {conv.other_user.full_name}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatDistanceToNow(new Date(conv.last_message_at), {
                                                                            addSuffix: true,
                                                                            locale: ptBR
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground truncate">
                                                                    {conv.last_message_preview || 'Nova conversa'}
                                                                </p>
                                                            </div>

                                                            {/* Badge de não lidas */}
                                                            {conv.unread_count > 0 && (
                                                                <Badge className="text-xs bg-accent text-white">
                                                                    {conv.unread_count}
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </ScrollArea>
                            ) : (
                                // Conversa aberta
                                <>
                                    {/* Mensagens */}
                                    <ScrollArea className="flex-1 p-3">
                                        <div className="space-y-3">
                                            {messages.map(msg => {
                                                const isMine = msg.sender_id === user.id
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={cn(
                                                            "flex items-end gap-2",
                                                            isMine ? "justify-end" : "justify-start"
                                                        )}
                                                    >
                                                        {/* Avatar do outro usuário (só nas mensagens recebidas) */}
                                                        {!isMine && (
                                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {selectedConversation?.other_user.avatar_url ? (
                                                                    <Image
                                                                        src={selectedConversation.other_user.avatar_url}
                                                                        alt={selectedConversation.other_user.full_name}
                                                                        width={28}
                                                                        height={28}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                ) : (
                                                                    <User className="w-4 h-4 text-primary/60" />
                                                                )}
                                                            </div>
                                                        )}

                                                        <div
                                                            className={cn(
                                                                "max-w-[75%] rounded-2xl px-3 py-2 shadow-sm",
                                                                isMine
                                                                    ? "bg-primary text-white rounded-br-sm"
                                                                    : "bg-gray-200 text-gray-900 rounded-bl-sm"
                                                            )}
                                                        >
                                                            {renderMessageContent(msg.content, isMine)}
                                                            <div className={cn(
                                                                "flex items-center gap-1 mt-1",
                                                                isMine ? "justify-end" : "justify-start"
                                                            )}>
                                                                <span className={cn(
                                                                    "text-[10px]",
                                                                    isMine ? "text-white/70" : "text-muted-foreground"
                                                                )}>
                                                                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                                {isMine && (
                                                                    msg.read_at
                                                                        ? <CheckCheck className="w-3 h-3 text-white/70" />
                                                                        : <Check className="w-3 h-3 text-white/70" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>

                                    {/* Input de mensagem ou aviso de sistema */}
                                    <div className="p-3 border-t border-border relative">
                                        {/* Conversa com sistema - não permite resposta */}
                                        {selectedConversation?.other_user.id === SYSTEM_USER_ID ? (
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
                                                <Bot className="w-4 h-4" />
                                                <span className="text-sm">Notificações da plataforma • Apenas leitura</span>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Emoji Picker */}
                                                {showEmojiPicker && (
                                                    <div className="absolute bottom-16 left-3 bg-white border border-border rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-10">
                                                        {commonEmojis.map(emoji => (
                                                            <button
                                                                key={emoji}
                                                                type="button"
                                                                onClick={() => addEmoji(emoji)}
                                                                className="text-xl hover:bg-muted p-1 rounded"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Input hidden para upload */}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                                />

                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault()
                                                        sendMessage()
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    {/* Botão Emoji */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                                    >
                                                        <Smile className="w-5 h-5 text-muted-foreground" />
                                                    </button>

                                                    {/* Botão Upload */}
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={uploadingFile}
                                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                                    >
                                                        {uploadingFile ? (
                                                            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                                        ) : (
                                                            <Paperclip className="w-5 h-5 text-muted-foreground" />
                                                        )}
                                                    </button>

                                                    <Input
                                                        ref={inputRef}
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        placeholder="Digite sua mensagem..."
                                                        className="flex-1"
                                                        disabled={sending}
                                                        onFocus={() => setShowEmojiPicker(false)}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        size="icon"
                                                        disabled={!newMessage.trim() || sending}
                                                    >
                                                        {sending ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </form>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
