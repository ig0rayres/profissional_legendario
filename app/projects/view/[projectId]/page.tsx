'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Flame, ArrowLeft, Briefcase, DollarSign, Calendar, Star,
    Trophy, Clock, CheckCircle, FileText, Download, User
} from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Professional {
    id: string
    full_name: string
    avatar_url?: string
    vigor: number
    rank: string
    completedProjects: number
}

interface Proposal {
    id: string
    professional_id: string
    proposed_budget: number
    estimated_days?: number
    description: string
    attachments?: string[]
    status: string
    created_at: string
    professional: Professional
}

interface Project {
    id: string
    title: string
    description: string
    category: string
    estimated_budget?: number
    deadline?: string
    status: string
    created_at: string
}

export default function ProjectProposalsPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const projectId = params.projectId as string
    const trackingToken = searchParams.get('token')

    const [project, setProject] = useState<Project | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState<'budget' | 'days' | 'vigor' | 'rating'>('vigor')
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [accepting, setAccepting] = useState(false)

    useEffect(() => {
        loadData()
    }, [projectId, trackingToken])

    async function loadData() {
        try {
            const url = `/api/projects/${projectId}/proposals${trackingToken ? `?token=${trackingToken}` : ''}`
            const response = await fetch(url)

            if (!response.ok) throw new Error('Erro ao carregar propostas')

            const data = await response.json()
            setProject(data.project)
            setProposals(data.proposals)
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao carregar propostas')
        } finally {
            setLoading(false)
        }
    }

    async function handleAcceptProposal() {
        if (!selectedProposal) return

        setAccepting(true)
        try {
            const response = await fetch(`/api/projects/${projectId}/accept-proposal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId: selectedProposal.id,
                    trackingToken
                })
            })

            if (!response.ok) throw new Error('Erro ao aceitar proposta')

            alert('✅ Proposta aceita! O profissional foi notificado.')
            loadData()
            setShowConfirmDialog(false)
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao aceitar proposta')
        } finally {
            setAccepting(false)
        }
    }

    const sortedProposals = [...proposals].sort((a, b) => {
        switch (sortBy) {
            case 'budget':
                return a.proposed_budget - b.proposed_budget
            case 'days':
                return (a.estimated_days || 999) - (b.estimated_days || 999)
            case 'vigor':
                return (b.professional.vigor || 0) - (a.professional.vigor || 0)
            default:
                return 0
        }
    })

    // Calcular badges automáticos
    const minBudget = Math.min(...proposals.map(p => p.proposed_budget))
    const minDays = Math.min(...proposals.map(p => p.estimated_days || 999))
    const maxVigor = Math.max(...proposals.map(p => p.professional.vigor || 0))

    if (loading) {
        return (
            <div className="min-h-screen bg-adventure flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#1E4D40] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#1E4D40] font-bold">Carregando propostas...</p>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-adventure flex items-center justify-center p-4">
                <Card className="border-[#1E4D40]/20">
                    <CardContent className="pt-6 text-center">
                        <p className="text-destructive mb-4">Projeto não encontrado</p>
                        <Button asChild variant="outline">
                            <Link href="/">Voltar</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-adventure">
            {/* Header */}
            <header className="border-b border-[#1E4D40]/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <Flame className="w-8 h-8 text-[#D4742C] group-hover:scale-110 transition-transform" />
                            <h1 className="text-2xl font-bold text-impact text-[#1E4D40]">Rota Business Club</h1>
                        </Link>
                        <Button asChild variant="outline" size="sm" className="border-[#1E4D40]/20 hover:bg-[#1E4D40]/10">
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Project Header */}
                <Card className="mb-8 shadow-lg shadow-black/30 border border-[#2D3B2D] backdrop-blur-sm bg-[#1A2421]/60">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl text-[#F2F4F3] flex items-center gap-3 mb-2">
                                    <Briefcase className="w-6 h-6 text-[#1E4D40]" />
                                    {project.title}
                                </CardTitle>
                                <CardDescription className="text-[#D1D5DB]">
                                    {project.category}
                                </CardDescription>
                            </div>
                            <Badge className="bg-[#1E4D40] text-white">
                                {proposals.length} {proposals.length === 1 ? 'proposta' : 'propostas'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-[#D1D5DB]">{project.description}</p>

                        <div className="flex flex-wrap gap-4 pt-4 border-t border-[#2D3B2D]">
                            {project.estimated_budget && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-[#D4742C]" />
                                    <span className="text-sm text-[#D1D5DB]">
                                        Orçamento: <strong className="text-[#F2F4F3]">R$ {project.estimated_budget.toFixed(2)}</strong>
                                    </span>
                                </div>
                            )}
                            {project.deadline && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#D4742C]" />
                                    <span className="text-sm text-[#D1D5DB]">
                                        Prazo: <strong className="text-[#F2F4F3]">{project.deadline}</strong>
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#D4742C]" />
                                <span className="text-sm text-[#D1D5DB]">
                                    Publicado há {Math.floor((Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#1E4D40]">Propostas Recebidas</h2>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-[200px] bg-background/50 border-[#1E4D40]/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-[#1E4D40]/20">
                            <SelectItem value="vigor">Melhor Avaliado</SelectItem>
                            <SelectItem value="budget">Menor Preço</SelectItem>
                            <SelectItem value="days">Menor Prazo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Proposals List */}
                <div className="space-y-4">
                    {sortedProposals.length === 0 ? (
                        <Card className="border-[#1E4D40]/20">
                            <CardContent className="py-12 text-center">
                                <FileText className="w-12 h-12 text-[#1E4D40]/50 mx-auto mb-4" />
                                <p className="text-[#D1D5DB]">Nenhuma proposta recebida ainda.</p>
                                <p className="text-sm text-[#D1D5DB]/70 mt-2">
                                    Profissionais qualificados estão sendo notificados.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        sortedProposals.map((proposal) => {
                            const isMinBudget = proposal.proposed_budget === minBudget
                            const isMinDays = proposal.estimated_days === minDays
                            const isMaxVigor = proposal.professional.vigor === maxVigor

                            return (
                                <Card
                                    key={proposal.id}
                                    className="shadow-lg shadow-black/20 border border-[#2D3B2D] backdrop-blur-sm bg-[#1A2421]/60 hover:shadow-xl hover:border-[#1E4D40]/50 transition-all duration-300"
                                >
                                    <CardHeader>
                                        {/* Badges de Destaque */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {isMaxVigor && maxVigor > 2000 && (
                                                <Badge className="bg-gradient-to-r from-[#D4742C] to-[#FF8C42] text-white font-bold">
                                                    🔥 PROFISSIONAL TOP
                                                </Badge>
                                            )}
                                            {isMinBudget && (
                                                <Badge className="bg-green-600 text-white">
                                                    💰 MENOR PREÇO
                                                </Badge>
                                            )}
                                            {isMinDays && (
                                                <Badge className="bg-blue-600 text-white">
                                                    ⚡ MAIS RÁPIDO
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Professional Info */}
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-16 h-16 border-2 border-[#1E4D40]">
                                                <AvatarImage src={proposal.professional.avatar_url} />
                                                <AvatarFallback className="bg-[#1E4D40] text-white">
                                                    {proposal.professional.full_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-[#F2F4F3] mb-1">
                                                    {proposal.professional.full_name}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-[#D1D5DB]">
                                                    <div className="flex items-center gap-1">
                                                        <Trophy className="w-4 h-4 text-[#D4742C]" />
                                                        <span className="font-bold text-[#D4742C]">{proposal.professional.rank}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Flame className="w-4 h-4 text-[#D4742C]" />
                                                        <span>{proposal.professional.vigor} VIGOR</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4 text-[#1E4D40]" />
                                                        <span>{proposal.professional.completedProjects} projetos entregues</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Budget & Timeline */}
                                        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[#1E4D40]/10 border border-[#1E4D40]/20">
                                            <div>
                                                <p className="text-xs text-[#D1D5DB] mb-1">Orçamento Proposto</p>
                                                <p className="text-2xl font-bold text-[#D4742C]">
                                                    R$ {proposal.proposed_budget.toFixed(2)}
                                                </p>
                                            </div>
                                            {proposal.estimated_days && (
                                                <div>
                                                    <p className="text-xs text-[#D1D5DB] mb-1">Prazo Estimado</p>
                                                    <p className="text-2xl font-bold text-[#1E4D40]">
                                                        {proposal.estimated_days} dias
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <p className="text-sm font-semibold text-[#F2F4F3] mb-2">📝 Proposta:</p>
                                            <p className="text-[#D1D5DB] whitespace-pre-wrap">{proposal.description}</p>
                                        </div>

                                        {/* Attachments */}
                                        {proposal.attachments && proposal.attachments.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-[#F2F4F3] mb-2">📎 Anexos:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {proposal.attachments.map((file, idx) => (
                                                        <Button
                                                            key={idx}
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-[#1E4D40]/30 hover:bg-[#1E4D40]/10"
                                                        >
                                                            <Download className="w-3 h-3 mr-2" />
                                                            {file}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {proposal.status === 'pending' && project.status !== 'accepted' && (
                                            <div className="flex gap-3 pt-4 border-t border-[#2D3B2D]">
                                                <Button
                                                    variant="outline"
                                                    className="border-[#1E4D40]/30 hover:bg-[#1E4D40]/10"
                                                    asChild
                                                >
                                                    <Link href={`/professionals/${proposal.professional_id}`}>
                                                        <User className="w-4 h-4 mr-2" />
                                                        Ver Perfil Completo
                                                    </Link>
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-gradient-to-r from-[#1E4D40] to-[#2A6B5A] hover:from-[#2A6B5A] hover:to-[#1E4D40] text-white font-bold"
                                                    onClick={() => {
                                                        setSelectedProposal(proposal)
                                                        setShowConfirmDialog(true)
                                                    }}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    ACEITAR PROPOSTA
                                                </Button>
                                            </div>
                                        )}

                                        {proposal.status === 'accepted' && (
                                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                                <p className="text-green-400 font-bold text-center">
                                                    ✅ PROPOSTA ACEITA
                                                </p>
                                            </div>
                                        )}

                                        {proposal.status === 'rejected' && (
                                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                                <p className="text-red-400 text-center">
                                                    Proposta não selecionada
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* Info Footer */}
                {proposals.length > 0 && project.status !== 'accepted' && (
                    <Card className="mt-8 border-[#D4742C]/20 bg-[#D4742C]/5">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-[#D4742C]/20">
                                    <FileText className="w-5 h-5 text-[#D4742C]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#F2F4F3] mb-2">ℹ️ Ao aceitar uma proposta:</p>
                                    <ul className="text-sm text-[#D1D5DB] space-y-1 list-disc list-inside">
                                        <li>As outras propostas serão automaticamente rejeitadas</li>
                                        <li>O profissional será notificado imediatamente</li>
                                        <li>Vocês poderão iniciar o trabalho</li>
                                        <li>O projeto aparecerá no dashboard de ambos</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent className="bg-[#1A2421] border-[#1E4D40]/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#F2F4F3]">
                            Confirmar Aceitação da Proposta
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#D1D5DB]">
                            Você está prestes a aceitar a proposta de <strong className="text-[#D4742C]">{selectedProposal?.professional.full_name}</strong> no valor de <strong className="text-[#D4742C]">R$ {selectedProposal?.proposed_budget.toFixed(2)}</strong>.
                            <br /><br />
                            Esta ação não pode ser desfeita e todas as outras propostas serão rejeitadas automaticamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-[#1E4D40]/30" disabled={accepting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-gradient-to-r from-[#1E4D40] to-[#2A6B5A] hover:from-[#2A6B5A] hover:to-[#1E4D40]"
                            onClick={handleAcceptProposal}
                            disabled={accepting}
                        >
                            {accepting ? 'Aceitando...' : 'Sim, Aceitar Proposta'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
