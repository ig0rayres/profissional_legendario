'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Search, AtSign, UserPlus, Swords, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationPreferences {
    marketplace_new_ads: boolean
    marketplace_buy_requests: boolean
    feed_mentions: boolean
    connection_requests: boolean
    confraternity_invites: boolean
}

interface NotificationPreferencesDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function NotificationPreferencesDialog({
    isOpen,
    onClose
}: NotificationPreferencesDialogProps) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        marketplace_new_ads: true,
        marketplace_buy_requests: true,
        feed_mentions: true,
        connection_requests: true,
        confraternity_invites: true
    })

    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            loadPreferences()
        }
    }, [isOpen])

    const loadPreferences = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('user_notification_preferences')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle()

            if (error) throw error

            if (data) {
                setPreferences({
                    marketplace_new_ads: data.marketplace_new_ads,
                    marketplace_buy_requests: data.marketplace_buy_requests,
                    feed_mentions: data.feed_mentions,
                    connection_requests: data.connection_requests,
                    confraternity_invites: data.confraternity_invites
                })
            }
        } catch (error: any) {
            console.error('[NotificationPreferences] Error loading:', error)
            toast.error('Erro ao carregar preferências')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('user_notification_preferences')
                .upsert({
                    user_id: user.id,
                    ...preferences
                })

            if (error) throw error

            toast.success('Preferências salvas com sucesso!')
            onClose()
        } catch (error: any) {
            console.error('[NotificationPreferences] Error saving:', error)
            toast.error('Erro ao salvar preferências')
        } finally {
            setSaving(false)
        }
    }

    const togglePreference = (key: keyof NotificationPreferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const preferenceGroups = [
        {
            title: '🛒 Marketplace',
            items: [
                {
                    key: 'marketplace_new_ads' as keyof NotificationPreferences,
                    label: 'Novos Anúncios de ELOS',
                    description: 'Receber notificação quando um ELO publicar algo para vender',
                    icon: ShoppingBag
                },
                {
                    key: 'marketplace_buy_requests' as keyof NotificationPreferences,
                    label: 'Procura-se (Compras)',
                    description: 'Receber notificação quando um ELO estiver procurando algo',
                    icon: Search
                }
            ]
        },
        {
            title: '🔔 Interações',
            items: [
                {
                    key: 'feed_mentions' as keyof NotificationPreferences,
                    label: 'Menções no Feed',
                    description: 'Quando alguém mencionar você em posts',
                    icon: AtSign
                },
                {
                    key: 'connection_requests' as keyof NotificationPreferences,
                    label: 'Pedidos de Conexão',
                    description: 'Quando alguém enviar pedido para ser seu ELO',
                    icon: UserPlus
                },
                {
                    key: 'confraternity_invites' as keyof NotificationPreferences,
                    label: 'Convites de Confraria',
                    description: 'Quando receber convite para ingressar em uma confraria',
                    icon: Swords
                }
            ]
        }
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Preferências de Notificações</DialogTitle>
                    <DialogDescription>
                        Escolha quais notificações você deseja receber
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        {preferenceGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">
                                    {group.title}
                                </h3>
                                <div className="space-y-3">
                                    {group.items.map((item) => (
                                        <div
                                            key={item.key}
                                            className="flex items-start justify-between space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-start space-x-3 flex-1">
                                                <item.icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="space-y-0.5">
                                                    <Label
                                                        htmlFor={item.key}
                                                        className="text-sm font-medium cursor-pointer"
                                                    >
                                                        {item.label}
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                id={item.key}
                                                checked={preferences[item.key]}
                                                onCheckedChange={() => togglePreference(item.key)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            'Salvar'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
