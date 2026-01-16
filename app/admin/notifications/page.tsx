'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Plus, Send, FileText, Users, Eye, TrendingUp } from 'lucide-react'
import { MOCK_NOTIFICATION_CAMPAIGNS, MOCK_NOTIFICATION_TEMPLATES, MOCK_NOTIFICATIONS } from '@/lib/data/mock'
import { NewCampaignDialog } from '@/components/admin/new-campaign-dialog'


export default function AdminNotificationsPage() {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'analytics'>('campaigns')
    const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)

    // Calculate stats
    const stats = {
        totalCampaigns: MOCK_NOTIFICATION_CAMPAIGNS.length,
        activeCampaigns: MOCK_NOTIFICATION_CAMPAIGNS.filter(c => c.status === 'sent').length,
        totalTemplates: MOCK_NOTIFICATION_TEMPLATES.length,
        totalSent: MOCK_NOTIFICATIONS.length,
        readRate: Math.round((MOCK_NOTIFICATIONS.filter(n => n.read_at).length / MOCK_NOTIFICATIONS.length) * 100)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-impact text-primary">Centro de Mensagens Administrativas</h2>
                <p className="text-muted-foreground">
                    Gerencie campanhas, templates e análise de comunicações com a comunidade
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card className="glass-strong border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Campanhas Totais
                        </CardTitle>
                        <Bell className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-impact text-primary">{stats.totalCampaigns}</div>
                    </CardContent>
                </Card>

                <Card className="glass-strong border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Campanhas Ativas
                        </CardTitle>
                        <Send className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-impact text-secondary">{stats.activeCampaigns}</div>
                    </CardContent>
                </Card>

                <Card className="glass-strong border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Templates
                        </CardTitle>
                        <FileText className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-impact text-primary">{stats.totalTemplates}</div>
                    </CardContent>
                </Card>

                <Card className="glass-strong border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Mensagens Enviadas
                        </CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-impact text-primary">{stats.totalSent}</div>
                    </CardContent>
                </Card>

                <Card className="glass-strong border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Taxa de Leitura
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-impact text-secondary">{stats.readRate}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-primary/20 pb-2">
                <Button
                    variant={activeTab === 'campaigns' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('campaigns')}
                    className={activeTab === 'campaigns' ? 'bg-primary/20 text-primary' : ''}
                >
                    <Send className="w-4 h-4 mr-2" />
                    Campanhas
                </Button>
                <Button
                    variant={activeTab === 'templates' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('templates')}
                    className={activeTab === 'templates' ? 'bg-primary/20 text-primary' : ''}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Templates
                </Button>
                <Button
                    variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('analytics')}
                    className={activeTab === 'analytics' ? 'bg-primary/20 text-primary' : ''}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Análise
                </Button>
            </div>

            {/* Content Area */}
            {activeTab === 'campaigns' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-primary">Campanhas de Notificações</h3>
                        <Button
                            className="glow-orange bg-secondary hover:bg-secondary/90"
                            onClick={() => setIsCampaignDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Campanha
                        </Button>
                    </div>

                    <NewCampaignDialog
                        open={isCampaignDialogOpen}
                        onOpenChange={setIsCampaignDialogOpen}
                    />

                    <div className="grid gap-4">
                        {MOCK_NOTIFICATION_CAMPAIGNS.map((campaign) => (
                            <Card key={campaign.id} className="glass-strong border-primary/20 hover:border-primary/40 transition-all">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg text-primary">{campaign.title}</CardTitle>
                                            <CardDescription className="mt-1">
                                                Tipo: {campaign.type} | Prioridade: {campaign.priority}
                                            </CardDescription>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${campaign.status === 'sent' ? 'bg-green-500/20 text-green-500' :
                                            campaign.status === 'scheduled' ? 'bg-blue-500/20 text-blue-500' :
                                                'bg-gray-500/20 text-gray-500'
                                            }`}>
                                            {campaign.status}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Canais:</span>
                                            <div className="flex gap-1">
                                                {campaign.channels.map((channel) => (
                                                    <span key={channel} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                                                        {channel}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {campaign.scheduled_for && (
                                            <div className="text-muted-foreground">
                                                Agendado para: {new Date(campaign.scheduled_for).toLocaleString('pt-BR')}
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" variant="outline" className="border-primary/20">
                                                <Eye className="w-3 h-3 mr-1" />
                                                Ver Detalhes
                                            </Button>
                                            {campaign.status === 'draft' && (
                                                <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                                                    <Send className="w-3 h-3 mr-1" />
                                                    Enviar Agora
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-primary">Templates de Mensagem</h3>
                        <Button className="glow-orange bg-secondary hover:bg-secondary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Template
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {MOCK_NOTIFICATION_TEMPLATES.map((template) => (
                            <Card key={template.id} className="glass-strong border-primary/20 hover:border-primary/40 transition-all">
                                <CardHeader>
                                    <CardTitle className="text-lg text-primary">{template.name}</CardTitle>
                                    <CardDescription>
                                        Tipo: {template.type} | Versão: {template.version}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <span className="font-semibold text-foreground">Assunto:</span>
                                            <p className="text-muted-foreground mt-1">{template.subject_template}</p>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-semibold text-foreground">Corpo:</span>
                                            <p className="text-muted-foreground mt-1 line-clamp-2">{template.body_template_text}</p>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" variant="outline" className="border-primary/20">
                                                Editar
                                            </Button>
                                            <Button size="sm" variant="outline" className="border-primary/20">
                                                Duplicar
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-primary">Análise de Desempenho</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="glass-strong border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-primary">Taxa de Abertura por Tipo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Crítico</span>
                                            <span className="text-primary font-bold">100%</span>
                                        </div>
                                        <div className="w-full bg-primary/10 rounded-full h-2">
                                            <div className="bg-secondary h-2 rounded-full" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Convite</span>
                                            <span className="text-primary font-bold">75%</span>
                                        </div>
                                        <div className="w-full bg-primary/10 rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Informação</span>
                                            <span className="text-primary font-bold">45%</span>
                                        </div>
                                        <div className="w-full bg-primary/10 rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-strong border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-primary">Notificações por Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Lidas</span>
                                        <span className="text-lg font-bold text-green-500">
                                            {MOCK_NOTIFICATIONS.filter(n => n.read_at).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Não Lidas</span>
                                        <span className="text-lg font-bold text-yellow-500">
                                            {MOCK_NOTIFICATIONS.filter(n => !n.read_at).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Total</span>
                                        <span className="text-lg font-bold text-primary">
                                            {MOCK_NOTIFICATIONS.length}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
