'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CheckCircle, Clock } from 'lucide-react'
import { CreatePostModal } from '@/components/social/create-post-modal'
import { cn } from '@/lib/utils'

interface ProofButtonProps {
    type: 'confraternity' | 'project'
    itemId: string
    userId: string
    hasProof?: boolean
    isValidated?: boolean
    itemTitle?: string
    onProofSubmitted?: () => void
}

export function ProofButton({
    type,
    itemId,
    userId,
    hasProof = false,
    isValidated = false,
    itemTitle,
    onProofSubmitted
}: ProofButtonProps) {
    const [modalOpen, setModalOpen] = useState(false)

    const handlePostCreated = () => {
        setModalOpen(false)
        onProofSubmitted?.()
    }

    // Se já foi validado
    if (isValidated) {
        return (
            <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                disabled
            >
                <CheckCircle className="w-4 h-4" />
                Comprovado
            </Button>
        )
    }

    // Se já enviou mas está pendente
    if (hasProof) {
        return (
            <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                disabled
            >
                <Clock className="w-4 h-4" />
                Aguardando Validação
            </Button>
        )
    }

    // Precisa enviar comprovação
    return (
        <>
            <Button
                size="sm"
                variant="outline"
                className={cn(
                    "gap-2",
                    type === 'confraternity' && "border-[#D2691E] text-[#D2691E] hover:bg-[#D2691E]/10",
                    type === 'project' && "border-[#1E4D40] text-[#1E4D40] hover:bg-[#1E4D40]/10"
                )}
                onClick={() => setModalOpen(true)}
            >
                <Camera className="w-4 h-4" />
                {type === 'confraternity' ? 'Comprovar Confraria' : 'Comprovar Entrega'}
            </Button>

            <CreatePostModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                userId={userId}
                onPostCreated={handlePostCreated}
                preselectedConfraternityId={type === 'confraternity' ? itemId : undefined}
                preselectedProjectId={type === 'project' ? itemId : undefined}
            />
        </>
    )
}
