'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Bell, Store, Search, Users, MessageSquare, Calendar, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NotificationSettingsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const [preferences, setPreferences] = useState({
        marketplace_new_ads: true,
        marketplace_buy_requests: true,
        feed_mentions: true,
        connection_requests: true,
        confraternity_invites: true
    })

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
            return
        }
        loadPreferences()
    }, [user])

    async function loadPreferences() {
        if (!user) return
        setLoading(true)

        const { data, error } = await supabase
            .from('user_notification_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (data) {
            setPreferences(data)
        } else if (error && error.code === 'PGRST116') {
            // Nenhum registro encontrado, criar um com valores padrão
            await supabase
                .from('user_notification_preferences')
                .insert({
                    user_id: user.id,
                    ...preferences
                })
        }

        setLoading(false)
    }

    async function savePreferences() {
        if (!user) return
        setSaving(true)

        const { error } = await supabase
            .from('user_notification_preferences')
            .upsert({
                user_id: user.id,
                ...preferences
            })

        setSaving(false)

        if (!error) {
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-16">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                            <Bell className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Notificações
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Gerencie suas preferências de notificação
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Card */}
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            Preferências de Notificação
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Marketplace */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Store className="w-4 h-4 text-green-600" />
                                Marketplace
                            </h3>

                            <div className="pl-6 space-y-3">
                                {/* Novos anúncios de VENDA */}
                                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Store className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">Novos Anúncios de Venda</p>
                                            <p className="text-xs text-gray-500">Receber quando um elo publicar algo para vender</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.marketplace_new_ads}
                                        onChange={(e) => setPreferences({ ...preferences, marketplace_new_ads: e.target.checked })}
                                        className="w-5 h-5 text-green-600 rounded"
                                    />
                                </label>

                                {/* Pedidos de COMPRA */}
                                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Search className="w-5 h-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">Pedidos de Compra (Procura-se)</p>
                                            <p className="text-xs text-gray-500">Receber quando um elo estiver procurando algo</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.marketplace_buy_requests}
                                        onChange={(e) => setPreferences({ ...preferences, marketplace_buy_requests: e.target.checked })}
                                        className="w-5 h-5 text-orange-600 rounded"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Feed */}
                        <div className="space-y-4 border-t border-gray-200 pt-6">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                Feed e Social
                            </h3>

                            <div className="pl-6 space-y-3">
                                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">Menções no Feed</p>
                                            <p className="text-xs text-gray-500">Quando alguém mencionar você em um post</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.feed_mentions}
                                        onChange={(e) => setPreferences({ ...preferences, feed_mentions: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Conexões */}
                        <div className="space-y-4 border-t border-gray-200 pt-6">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-amber-600" />
                                Conexões
                            </h3>

                            <div className="pl-6 space-y-3">
                                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-amber-600" />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">Pedidos de Conexão</p>
                                            <p className="text-xs text-gray-500">Quando alguém quiser se conectar com você</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.connection_requests}
                                        onChange={(e) => setPreferences({ ...preferences, connection_requests: e.target.checked })}
                                        className="w-5 h-5 text-amber-600 rounded"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Confrarias */}
                        <div className="space-y-4 border-t border-gray-200 pt-6">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                Confrarias
                            </h3>

                            <div className="pl-6 space-y-3">
                                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">Convites de Confraria</p>
                                            <p className="text-xs text-gray-500">Quando alguém convidar você para uma confraria</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.confraternity_invites}
                                        onChange={(e) => setPreferences({ ...preferences, confraternity_invites: e.target.checked })}
                                        className="w-5 h-5 text-purple-600 rounded"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <Button
                                onClick={savePreferences}
                                disabled={saving}
                                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : saved ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Salvo!
                                    </>
                                ) : (
                                    'Salvar Preferências'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
