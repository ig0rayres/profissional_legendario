'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FinancialMetrics } from '@/components/admin/FinancialMetrics'
import { PlanManager } from '@/components/admin/PlanManager'
import { CouponManager } from '@/components/admin/CouponManager'
import { CampaignManager } from '@/components/admin/CampaignManager'
import { DollarSign } from 'lucide-react'

export default function FinanceiroPage() {
    const [activeTab, setActiveTab] = useState('dashboard')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20 border border-primary/30">
                    <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-impact text-primary">
                        Gestão Financeira
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie planos, cupons, campanhas e acompanhe métricas financeiras
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="planos">Planos</TabsTrigger>
                    <TabsTrigger value="cupons">Cupons</TabsTrigger>
                    <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                    <FinancialMetrics />
                </TabsContent>

                {/* Planos Tab */}
                <TabsContent value="planos" className="space-y-6">
                    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-primary">Configuração de Planos</CardTitle>
                            <CardDescription>
                                Gerencie os planos de assinatura disponíveis na plataforma
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PlanManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Cupons Tab */}
                <TabsContent value="cupons" className="space-y-6">
                    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-primary">Cupons de Desconto</CardTitle>
                            <CardDescription>
                                Crie e gerencie cupons promocionais
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CouponManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Campanhas Tab */}
                <TabsContent value="campanhas" className="space-y-6">
                    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-primary">Campanhas Promocionais</CardTitle>
                            <CardDescription>
                                Crie e acompanhe campanhas de marketing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CampaignManager />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
