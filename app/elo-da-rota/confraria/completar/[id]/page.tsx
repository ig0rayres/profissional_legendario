'use client'

import { useEffect, useState, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ConfraternityCompleteForm } from '@/components/confraternity/ConfraternityCompleteForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CompleteConfraternityPage() {
    const paramsHook = useParams()
    const inviteId = paramsHook.id as string

    const router = useRouter()
    const [userId, setUserId] = useState<string | null>(null)
    const [inviteData, setInviteData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        checkUserAndLoadInvite()
    }, [inviteId])

    async function checkUserAndLoadInvite() {
        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // 2. Load Invite
            const { data: invite, error: inviteError } = await supabase
                .from('confraternity_invites')
                .select(`
                    id, 
                    proposed_date, 
                    location, 
                    sender_id, 
                    receiver_id,
                    sender:profiles!confraternity_invites_sender_id_fkey(full_name),
                    receiver:profiles!confraternity_invites_receiver_id_fkey(full_name)
                `)
                .eq('id', inviteId)
                .single()

            if (inviteError || !invite) {
                console.error('Invite error:', inviteError)
                setError('Confraria não encontrada ou você não tem permissão.')
                return
            }

            // Determine partner name
            const inviteAny = invite as any
            const isSender = invite.sender_id === user.id
            const partnerName = isSender
                ? inviteAny.receiver?.full_name
                : inviteAny.sender?.full_name

            setInviteData({
                ...invite,
                partnerName: partnerName || 'Parceiro'
            })

        } catch (err: any) {
            console.error('Error:', err)
            setError('Erro ao carregar dados da confraria.')
        } finally {
            setLoading(false)
        }
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

    if (error || !userId) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
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
                    <h1 className="text-2xl font-bold text-[#1E4D40]">Confirmar Realização</h1>
                    <p className="text-gray-600">Envie a foto comprovando o encontro para ganhar pontos</p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                        <ConfraternityCompleteForm
                            inviteId={inviteId as string}
                            currentUserId={userId}
                            otherMemberName={inviteData.partnerName}
                            proposedDate={inviteData.proposed_date}
                            proposedLocation={inviteData.location}
                            onSuccess={() => {
                                // Redirecionar para perfil ou dashboard após sucesso
                                setTimeout(() => router.push('/dashboard/rota-do-valente'), 2000)
                            }}
                            onCancel={() => router.back()}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
