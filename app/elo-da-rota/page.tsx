'use client'

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Swords, MessageCircle, Calendar, TrendingUp, Award } from 'lucide-react'

export default function EloRotaPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="animate-pulse">Carregando...</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardContent className="p-6 text-center">
                        <h1 className="text-2xl font-bold mb-4">Elo da Rota</h1>
                        <p className="mb-4">Você precisa estar logado para acessar esta página.</p>
                        <Link href="/auth/login">
                            <Button>Fazer Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Users className="h-10 w-10 text-primary" />
                    Elo da Rota
                </h1>
                <p className="text-muted-foreground text-lg">
                    Sua rede de conexões profissionais
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                {/* Quick Stats Cards */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Meus Elos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold">0</div>
                            <Users className="h-8 w-8 text-blue-500 opacity-50" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Conecte-se com outros profissionais
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Confraternizações
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold">0</div>
                            <Swords className="h-8 w-8 text-purple-500 opacity-50" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Seu plano: Veterano (2 convites/mês)
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Mensagens
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold">0</div>
                            <MessageCircle className="h-8 w-8 text-green-500 opacity-50" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Nenhuma mensagem nova
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Success Message */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <Award className="h-12 w-12 text-green-600 shrink-0" />
                        <div>
                            <h2 className="text-2xl font-bold text-green-900 mb-2">
                                🎉 Módulo Elo da Rota Instalado!
                            </h2>
                            <p className="text-green-800 mb-4">
                                Bem-vindo, <strong>{user.email}</strong>!
                                O sistema de networking e confraternizações está funcionando.
                            </p>
                            <div className="grid gap-2 text-sm text-green-700">
                                <p>✅ 5 Tabelas SQL criadas</p>
                                <p>✅ 3 Funções e 3 Badges configuradas</p>
                                <p>✅ Integração com Google Calendar</p>
                                <p>✅ Sistema de limites por plano funcionando</p>
                                <p>✅ Galeria de confraternizações pronta</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Próximos Passos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <p className="text-sm text-muted-foreground mb-2">
                            Começe a usar o Elo da Rota:
                        </p>
                        <Button variant="outline" className="justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Buscar Profissionais para Conectar
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <Swords className="mr-2 h-4 w-4" />
                            Solicitar Confraternização
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            Ver Convites Pendentes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
