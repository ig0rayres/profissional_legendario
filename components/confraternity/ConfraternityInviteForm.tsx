// ============================================
// Component: ConfraternityInviteForm
// Formulário para solicitar confraternização
// ============================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, MessageSquare, Loader2, Swords } from 'lucide-react'
import { sendConfraternityInvite } from '@/lib/api/confraternity'
import { toast } from 'sonner'

interface ConfraternityInviteFormProps {
    receiverId: string
    receiverName: string
    currentUserId: string
    remainingInvites: number
    onSuccess?: () => void
    onCancel?: () => void
}

export function ConfraternityInviteForm({
    receiverId,
    receiverName,
    currentUserId,
    remainingInvites,
    onSuccess,
    onCancel
}: ConfraternityInviteFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        proposedDate: '',
        proposedTime: '',
        location: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Combinar data e hora
            const dateTime = formData.proposedDate && formData.proposedTime
                ? new Date(`${formData.proposedDate}T${formData.proposedTime}`).toISOString()
                : null

            const result = await sendConfraternityInvite(
                currentUserId,
                receiverId,
                dateTime,
                formData.location || null,
                formData.message || null
            )

            if (result.success) {
                toast.success('Convite enviado!', {
                    description: `+10 XP ganhos. Restam ${remainingInvites - 1} convites este mês.`
                })
                onSuccess?.()
            } else {
                toast.error('Erro ao enviar convite', {
                    description: result.error
                })
            }
        } catch (error) {
            toast.error('Erro ao enviar convite')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
                    <Swords className="h-6 w-6" />
                    Solicitar Confraria
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Para: <span className="font-semibold">{receiverName}</span>
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Data e Hora */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Data Sugerida
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.proposedDate}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                proposedDate: e.target.value
                            }))}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="time">Horário</Label>
                        <Input
                            id="time"
                            type="time"
                            value={formData.proposedTime}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                proposedTime: e.target.value
                            }))}
                        />
                    </div>
                </div>

                {/* Local */}
                <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Local
                    </Label>
                    <Input
                        id="location"
                        placeholder="Ex: Café Central, Centro"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: e.target.value
                        }))}
                    />
                </div>

                {/* Mensagem */}
                <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Mensagem
                    </Label>
                    <Textarea
                        id="message"
                        placeholder="Olá! Gostaria de marcar uma confraternização para trocarmos ideias sobre..."
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            message: e.target.value
                        }))}
                        rows={4}
                    />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        💡 Você tem <span className="font-bold">{remainingInvites} convite(s)</span> disponível(is) este mês
                    </p>
                </div>

                {/* Gamificação Preview */}
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                        🎁 Recompensas ao enviar:
                    </p>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                        <li>• +10 XP</li>
                        <li>• Quando aceito: +10 XP para ambos</li>
                        <li>• Ao realizar: +50 XP para cada + bônus por fotos</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || remainingInvites === 0}
                        className="flex-1"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Swords className="mr-2 h-4 w-4" />
                                Enviar Convite +10 XP
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
