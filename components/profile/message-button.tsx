'use client'

import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import Link from 'next/link'

interface MessageButtonProps {
    targetUserId: string
    targetUserName: string
    variant?: 'default' | 'icon'
}

export function MessageButton({ targetUserId, targetUserName, variant = 'default' }: MessageButtonProps) {
    const { user } = useAuth()

    // Não exibir botão para o próprio usuário
    if (user?.id === targetUserId) return null

    // Função para abrir o chat com o usuário alvo
    const handleClick = () => {
        // Disparar evento para o ChatWidget
        const event = new CustomEvent('openChat', { detail: { userId: targetUserId } })
        window.dispatchEvent(event)
    }

    // Usuário não logado - mostrar botão desabilitado
    if (!user) {
        return (
            <Link href="/auth/login">
                <Button variant="outline" size="sm" className="font-bold text-[10px] h-7 px-2 border-secondary/30">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    MENSAGEM
                </Button>
            </Link>
        )
    }

    // Versão ícone
    if (variant === 'icon') {
        return (
            <Button
                variant="outline"
                size="sm"
                className="font-bold text-[10px] h-7 w-7 p-0 border-secondary/30 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:border-secondary transition-all shadow-sm"
                onClick={handleClick}
            >
                <MessageSquare className="w-3 h-3" />
            </Button>
        )
    }

    // Versão padrão (mesmo estilo de ORAR e CLASSIFICAR)
    return (
        <Button
            variant="outline"
            size="sm"
            className="font-bold text-[10px] h-7 px-2 border-secondary/30 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:border-secondary transition-all shadow-sm"
            onClick={handleClick}
        >
            <MessageSquare className="w-3 h-3 mr-1" />
            MENSAGEM
        </Button>
    )
}
