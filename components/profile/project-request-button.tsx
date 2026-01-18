'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Briefcase, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

interface ProjectRequestButtonProps {
    targetUserId: string
    targetUserName: string
}

const BUDGET_RANGES = [
    { value: 'under_500', label: 'Até R$ 500' },
    { value: '500_2k', label: 'R$ 500 - R$ 2.000' },
    { value: '2k_5k', label: 'R$ 2.000 - R$ 5.000' },
    { value: '5k_10k', label: 'R$ 5.000 - R$ 10.000' },
    { value: 'over_10k', label: 'Acima de R$ 10.000' },
    { value: 'to_discuss', label: 'A combinar' },
]

export function ProjectRequestButton({ targetUserId, targetUserName }: ProjectRequestButtonProps) {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [budgetRange, setBudgetRange] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const supabase = createClient()

    async function submitProject() {
        if (!user || !title.trim() || !description.trim()) return

        setLoading(true)

        const { error } = await supabase
            .from('projects')
            .insert({
                professional_id: targetUserId,
                client_id: user.id,
                title: title.trim(),
                description: `${description.trim()}\n\nOrçamento estimado: ${BUDGET_RANGES.find(b => b.value === budgetRange)?.label || 'Não informado'}`,
                status: 'pending'
            })

        if (!error) {
            setSent(true)
            setTimeout(() => {
                setOpen(false)
                setSent(false)
                setTitle('')
                setDescription('')
                setBudgetRange('')
            }, 1500)
        }

        setLoading(false)
    }

    if (user?.id === targetUserId) return null

    if (!user) {
        return (
            <Button variant="default" size="sm" disabled className="bg-secondary">
                <Briefcase className="w-4 h-4 mr-2" />
                SOLICITAR PROJETO
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="sm" className="bg-secondary hover:bg-secondary/90">
                    <Briefcase className="w-4 h-4 mr-2" />
                    SOLICITAR PROJETO
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-sm font-black uppercase tracking-widest">
                        SOLICITAR PROJETO
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground">
                        Para: {targetUserName}
                    </p>
                </DialogHeader>

                {sent ? (
                    <div className="py-8 text-center">
                        <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="font-bold">SOLICITAÇÃO ENVIADA</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            O profissional receberá sua demanda
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                                    TÍTULO DO PROJETO *
                                </label>
                                <Input
                                    placeholder="Ex: Criação de logo para empresa"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                                    DESCRIÇÃO DETALHADA *
                                </label>
                                <Textarea
                                    placeholder="Descreva com detalhes o que você precisa..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={2000}
                                    rows={5}
                                    className="resize-none"
                                />
                                <p className="text-[10px] text-muted-foreground text-right mt-1">
                                    {description.length}/2000
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                                    ORÇAMENTO ESTIMADO
                                </label>
                                <Select value={budgetRange} onValueChange={setBudgetRange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a faixa de valor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BUDGET_RANGES.map((range) => (
                                            <SelectItem key={range.value} value={range.value}>
                                                {range.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button
                                onClick={submitProject}
                                disabled={loading || !title.trim() || !description.trim()}
                                className="w-full bg-secondary hover:bg-secondary/90"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Briefcase className="w-4 h-4 mr-2" />
                                )}
                                ENVIAR SOLICITAÇÃO
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
