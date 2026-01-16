'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Swords, Search, Send, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Profile {
    id: string
    full_name: string
    email: string
    pista: string
}

export default function SolicitarConfrariaPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sending, setSending] = useState<string | null>(null)
    const [userPlan, setUserPlan] = useState<string>('recruta')
    const [limitsInfo, setLimitsInfo] = useState<any>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
            return
        }

        if (user) {
            loadProfiles()
            checkLimits()
        }
    }, [user, authLoading])

    const loadProfiles = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, pista')
            .neq('id', user?.id)
            .limit(20)

        if (!error && data) {
            setProfiles(data)
        }
        setLoading(false)
    }

    const checkLimits = async () => {
        const supabase = createClient()

        // Get user plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single()

        if (profile) {
            const plan = profile.subscription_tier || 'recruta'
            setUserPlan(plan)

            // Check limits
            const result = await supabase.rpc('check_confraternity_limit', {
                p_user_id: user?.id
            })

            setLimitsInfo({
                canSend: result.data,
                plan: plan,
                maxInvites: plan === 'recruta' ? 0 : plan === 'veterano' ? 2 : 10
            })
        }
    }

    const sendInvite = async (receiverId: string) => {
        if (!limitsInfo?.canSend && userPlan !== 'elite') {
            alert('Você atingiu o limite de convites do seu plano!')
            return
        }

        setSending(receiverId)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('confraternity_invites')
                .insert({
                    sender_id: user?.id,
                    receiver_id: receiverId,
                    status: 'pending',
                    message: 'Gostaria de marcar uma confraternização!',
                    proposed_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                })

            if (error) throw error

            // Increment counter
            await supabase.rpc('increment_confraternity_count', {
                p_user_id: user?.id
            })

            alert('Convite enviado com sucesso!')
            checkLimits() // Reload limits
        } catch (error: any) {
            alert('Erro ao enviar convite: ' + error.message)
        } finally {
            setSending(null)
        }
    }

    const filteredProfiles = profiles.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">Carregando...</div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Link href="/elo-da-rota">
                    <Button variant="ghost" size="sm">← Voltar</Button>
                </Link>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Swords className="h-6 w-6" />
                        Solicitar Confraternização
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {limitsInfo && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium">
                                Plano: <strong>{limitsInfo.plan.toUpperCase()}</strong>
                            </p>
                            <p className="text-sm">
                                Limite: {limitsInfo.maxInvites} convites/mês
                            </p>
                            {!limitsInfo.canSend && limitsInfo.plan !== 'elite' && (
                                <div className="mt-2 flex items-center gap-2 text-orange-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">Você atingiu o limite mensal</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {filteredProfiles.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            Nenhum profissional encontrado
                        </CardContent>
                    </Card>
                ) : (
                    filteredProfiles.map((profile) => (
                        <Card key={profile.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {profile.full_name?.[0] || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{profile.full_name}</p>
                                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                                            <p className="text-xs text-muted-foreground">{profile.pista}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => sendInvite(profile.id)}
                                        disabled={sending === profile.id || (!limitsInfo?.canSend && userPlan !== 'elite')}
                                        size="sm"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {sending === profile.id ? 'Enviando...' : 'Convidar'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
