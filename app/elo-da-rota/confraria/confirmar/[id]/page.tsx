'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { confirmConfraternityPartner } from '@/lib/api/confraternity'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Users, Calendar, MapPin, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ConfraternityData {
    id: string
    date_occurred: string
    location: string
    description: string
    photos: string[]
    visibility: string
    testimonial_member1: string | null
    testimonial_member2: string | null
    member1: { id: string; full_name: string; avatar_url: string | null }
    member2: { id: string; full_name: string; avatar_url: string | null }
}

export default function ConfirmConfraternityPage() {
    const params = useParams()
    const confraternityId = params.id as string

    const router = useRouter()
    const [userId, setUserId] = useState<string | null>(null)
    const [confraternity, setConfraternity] = useState<ConfraternityData | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [testimonial, setTestimonial] = useState('')
    const [approvePublication, setApprovePublication] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        checkUserAndLoadConfraternity()
    }, [confraternityId])

    async function checkUserAndLoadConfraternity() {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            const { data, error: confError } = await supabase
                .from('confraternities')
                .select(`
                    id,
                    date_occurred,
                    location,
                    description,
                    photos,
                    visibility,
                    testimonial_member1,
                    testimonial_member2,
                    member1:profiles!member1_id(id, full_name, avatar_url),
                    member2:profiles!member2_id(id, full_name, avatar_url)
                `)
                .eq('id', confraternityId)
                .single()

            if (confError || !data) {
                setError('Confraria não encontrada')
                return
            }

            // Verificar se usuário faz parte da confraria
            const member1 = (data.member1 as any)?.[0] || data.member1
            const member2 = (data.member2 as any)?.[0] || data.member2

            if (member1?.id !== user.id && member2?.id !== user.id) {
                setError('Você não faz parte desta confraria')
                return
            }

            // Verificar se usuário já confirmou
            const isFirstMember = member1?.id === user.id
            const alreadyConfirmed = isFirstMember
                ? data.testimonial_member1
                : data.testimonial_member2

            if (alreadyConfirmed) {
                setError('Você já confirmou sua participação nesta confraria')
                return
            }

            setConfraternity({
                ...data,
                member1,
                member2
            } as ConfraternityData)
        } catch (err: any) {
            console.error('Error:', err)
            setError('Erro ao carregar dados da confraria')
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!testimonial.trim()) {
            toast.error('Por favor, adicione seu depoimento')
            return
        }

        if (!userId) return

        setSubmitting(true)

        try {
            const result = await confirmConfraternityPartner(confraternityId, userId, {
                testimonial,
                approvePublication
            })

            if (!result.success) {
                toast.error('Erro ao confirmar', { description: result.error })
                return
            }

            toast.success('🎉 Confraria confirmada!', {
                description: '+65 Vigor ganhos! (50 pela participação + 15 pelo depoimento)'
            })

            setTimeout(() => router.push('/dashboard/rota-do-valente'), 2000)
        } catch (err) {
            toast.error('Erro ao confirmar participação')
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[#D2691E]" />
                    <p className="text-sm text-gray-500">Carregando detalhes...</p>
                </div>
            </div>
        )
    }

    if (error || !userId || !confraternity) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Ops!</h2>
                        <p className="text-gray-600 mb-6">{error || 'Não foi possível acessar esta página.'}</p>
                        <Button onClick={() => router.back()} variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Determinar quem é o parceiro (quem registrou a confraria)
    const isFirstMember = confraternity.member1.id === userId
    const partner = isFirstMember ? confraternity.member2 : confraternity.member1
    const partnerTestimonial = isFirstMember
        ? confraternity.testimonial_member2
        : confraternity.testimonial_member1

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 hover:bg-gray-100"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#1E4D40]">Confirmar Participação</h1>
                    <p className="text-gray-600">Seu parceiro registrou esta confraria. Confirme sua participação e ganhe Vigor!</p>
                </div>

                {/* Resumo da Confraria */}
                <Card className="mb-6 border-[#D2691E]/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#D2691E]/10 flex items-center justify-center overflow-hidden">
                                {partner.avatar_url ? (
                                    <Image
                                        src={partner.avatar_url}
                                        alt={partner.full_name}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                    />
                                ) : (
                                    <Users className="w-6 h-6 text-[#D2691E]" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Confraria com {partner.full_name}</p>
                                <p className="text-sm text-gray-500">Registrada por {partner.full_name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(confraternity.date_occurred)}
                            </div>
                            {confraternity.location && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    {confraternity.location}
                                </div>
                            )}
                        </div>

                        {confraternity.description && (
                            <p className="mt-4 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {confraternity.description}
                            </p>
                        )}

                        {/* Fotos */}
                        {confraternity.photos && confraternity.photos.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <ImageIcon className="w-4 h-4" />
                                    Fotos da Confraria
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {confraternity.photos.map((photo, index) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                            <img
                                                src={photo}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Depoimento do parceiro */}
                        {partnerTestimonial && (
                            <div className="mt-4 bg-[#D2691E]/5 border border-[#D2691E]/20 rounded-lg p-4">
                                <p className="text-sm font-medium text-[#D2691E] mb-1">
                                    Depoimento de {partner.full_name}:
                                </p>
                                <p className="text-gray-700 italic">"{partnerTestimonial}"</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Formulário de Confirmação */}
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="testimonial" className="text-base font-semibold">
                                    Seu Depoimento (+15 Vigor)
                                </Label>
                                <Textarea
                                    id="testimonial"
                                    required
                                    placeholder="Compartilhe sua experiência nesta confraria..."
                                    value={testimonial}
                                    onChange={(e) => setTestimonial(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>

                            {confraternity.visibility === 'public' && (
                                <div className="flex items-center space-x-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <Checkbox
                                        id="approve-publication"
                                        checked={approvePublication}
                                        onCheckedChange={(checked) => setApprovePublication(checked === true)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="approve-publication" className="cursor-pointer font-semibold text-orange-900">
                                            Aprovar publicação pública
                                        </Label>
                                        <p className="text-xs text-orange-700">
                                            Esta confraria foi marcada como pública. Você concorda em aparecer no feed?
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Recompensas */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-green-900 mb-2">
                                    🎁 Recompensas ao confirmar:
                                </p>
                                <ul className="text-sm text-green-800 space-y-1">
                                    <li>• +50 Vigor por participar</li>
                                    <li>• +15 Vigor pelo depoimento</li>
                                    <li className="font-bold mt-2 pt-2 border-t border-green-300">
                                        Total: +65 Vigor
                                    </li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting || !testimonial.trim()}
                                    className="flex-1 bg-[#1E4D40] hover:bg-[#1E4D40]/90"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Confirmando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Confirmar +65 Vigor
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
