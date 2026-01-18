'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MessageSquare, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

interface MessageButtonProps {
    targetUserId: string
    targetUserName: string
    variant?: 'default' | 'icon'
}

export function MessageButton({ targetUserId, targetUserName, variant = 'default' }: MessageButtonProps) {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const supabase = createClient()

    async function sendMessage() {
        if (!user || !message.trim()) return

        setLoading(true)

        // Ordenar IDs para garantir consistência
        const [p1, p2] = [user.id, targetUserId].sort()

        // Verificar se conversa existe ou criar
        let { data: conversation } = await supabase
            .from('conversations')
            .select('id')
            .eq('participant_1_id', p1)
            .eq('participant_2_id', p2)
            .single()

        if (!conversation) {
            const { data: newConv } = await supabase
                .from('conversations')
                .insert({
                    participant_1_id: p1,
                    participant_2_id: p2
                })
                .select('id')
                .single()

            conversation = newConv
        }

        if (conversation) {
            // Enviar mensagem
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversation.id,
                    sender_id: user.id,
                    content: message.trim()
                })

            // Atualizar last_message_at
            await supabase
                .from('conversations')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', conversation.id)

            if (!error) {
                setSent(true)
                setTimeout(() => {
                    setOpen(false)
                    setSent(false)
                    setMessage('')
                }, 1500)
            }
        }

        setLoading(false)
    }

    if (user?.id === targetUserId) return null

    if (!user) {
        if (variant === 'icon') {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" disabled className="h-8 w-8">
                                <MessageSquare className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mensagem</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
        return (
            <Button variant="outline" size="sm" disabled className="border-primary/20">
                <MessageSquare className="w-4 h-4 mr-2" />
                MENSAGEM
            </Button>
        )
    }

    const triggerButton = variant === 'icon' ? (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 hover:scale-105 transition-all">
                        <MessageSquare className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Mensagem</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ) : (
        <Button variant="outline" size="sm" className="font-bold text-[10px] h-7 px-2 border-secondary/30 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:border-secondary transition-all shadow-sm">
            <MessageSquare className="w-3 h-3 mr-1" />
            MENSAGEM
        </Button>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-black uppercase tracking-widest">
                        MENSAGEM PARA {targetUserName.toUpperCase()}
                    </DialogTitle>
                </DialogHeader>

                {sent ? (
                    <div className="py-8 text-center">
                        <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="font-bold">MENSAGEM ENVIADA</p>
                    </div>
                ) : (
                    <>
                        <Textarea
                            placeholder="Escreva sua mensagem..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={5000}
                            rows={5}
                            className="resize-none"
                        />
                        <p className="font-bold text-[10px] text-muted-foreground text-right">
                            {message.length}/5000
                        </p>

                        <DialogFooter>
                            <Button
                                onClick={sendMessage}
                                disabled={loading || !message.trim()}
                                className="w-full"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                )}
                                ENVIAR MENSAGEM
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
