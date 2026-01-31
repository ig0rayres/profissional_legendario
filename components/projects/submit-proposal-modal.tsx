'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DollarSign, Clock, Send, Briefcase } from 'lucide-react'

interface SubmitProposalModalProps {
    projectId: string
    projectTitle: string
    trigger?: React.ReactNode
}

export function SubmitProposalModal({ projectId, projectTitle, trigger }: SubmitProposalModalProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        proposed_budget: '',
        estimated_days: '',
        description: ''
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(`/api/projects/${projectId}/submit-proposal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposed_budget: parseFloat(formData.proposed_budget),
                    estimated_days: parseInt(formData.estimated_days) || null,
                    description: formData.description
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro ao enviar proposta')
            }

            alert('✅ Proposta enviada com sucesso! O cliente será notificado.')
            setOpen(false)
            setFormData({ proposed_budget: '', estimated_days: '', description: '' })
            router.refresh()

        } catch (error: any) {
            alert(error.message || 'Erro ao enviar proposta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-gradient-to-r from-[#1E4D40] to-[#2A6B5A] hover:from-[#2A6B5A] hover:to-[#1E4D40] text-white font-bold">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Proposta
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#1A2421] border-[#1E4D40]/30 max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-[#F2F4F3] text-xl flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#D4742C]" />
                        Enviar Proposta
                    </DialogTitle>
                    <DialogDescription className="text-[#D1D5DB]">
                        Projeto: <strong className="text-[#D4742C]">{projectTitle}</strong>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Budget */}
                    <div className="space-y-2">
                        <Label htmlFor="budget" className="text-[#F2F4F3]">
                            💰 Orçamento Proposto (R$) *
                        </Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-[#D4742C]" />
                            <Input
                                id="budget"
                                type="number"
                                step="0.01"
                                value={formData.proposed_budget}
                                onChange={(e) => setFormData({ ...formData, proposed_budget: e.target.value })}
                                placeholder="Ex: 8500.00"
                                className="pl-10 bg-background/50 border-[#1E4D40]/20 text-[#F2F4F3]"
                                required
                            />
                        </div>
                        <p className="text-xs text-[#D1D5DB]/70">
                            Informe quanto você cobraria para realizar este projeto
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                        <Label htmlFor="days" className="text-[#F2F4F3]">
                            ⏱️ Prazo Estimado (dias)
                        </Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3 w-4 h-4 text-[#D4742C]" />
                            <Input
                                id="days"
                                type="number"
                                value={formData.estimated_days}
                                onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                                placeholder="Ex: 45"
                                className="pl-10 bg-background/50 border-[#1E4D40]/20 text-[#F2F4F3]"
                            />
                        </div>
                        <p className="text-xs text-[#D1D5DB]/70">
                            Quantos dias você precisaria para entregar (opcional)
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[#F2F4F3]">
                            📝 Detalhes da Sua Proposta *
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descreva sua experiência relevante, metodologia, entregas parciais, etc..."
                            rows={6}
                            className="bg-background/50 border-[#1E4D40]/20 text-[#F2F4F3] resize-none"
                            required
                        />
                        <p className="text-xs text-[#D1D5DB]/70">
                            Convença o cliente! Destaque sua experiência, casos de sucesso e diferenciais.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-lg bg-[#D4742C]/10 border border-[#D4742C]/30">
                        <p className="text-sm text-[#F2F4F3]">
                            <strong>💡 Dica:</strong> Propostas detalhadas e profissionais têm muito mais chances de serem aceitas.
                            Mostre seu valor e por que você é a melhor escolha!
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-[#1E4D40]/30"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#D4742C] to-[#FF8C42] hover:from-[#FF8C42] hover:to-[#D4742C] text-white font-bold"
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : '📤 Enviar Proposta'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
