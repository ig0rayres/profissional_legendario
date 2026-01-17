import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Camera, Crown } from 'lucide-react'
import type { ConfraternityStat } from '@/lib/profile/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ConfraternityStatsProps {
    stats: ConfraternityStat | null
}

export function ConfraternityStats({ stats }: ConfraternityStatsProps) {
    if (!stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Atividades Sociais
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center italic py-4">
                        Dados de confraternity não disponíveis
                    </p>
                </CardContent>
            </Card>
        )
    }

    const { total_created, total_attended, total_photos, next_event } = stats

    return (
        <Card className="border-accent/20 bg-accent/5">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-accent">
                    <Users className="w-5 h-5" />
                    Atividades Sociais
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Criadas */}
                    <div className="bg-background/50 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center mb-1">
                            <Crown className="w-4 h-4 text-accent" />
                        </div>
                        <p className="font-bold text-2xl text-accent">{total_created}</p>
                        <p className="text-xs text-muted-foreground mt-1">Criadas</p>
                    </div>

                    {/* Participadas */}
                    <div className="bg-background/50 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center mb-1">
                            <Users className="w-4 h-4 text-accent" />
                        </div>
                        <p className="font-bold text-2xl text-accent">{total_attended}</p>
                        <p className="text-xs text-muted-foreground mt-1">Participou</p>
                    </div>

                    {/* Fotos */}
                    <div className="bg-background/50 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center mb-1">
                            <Camera className="w-4 h-4 text-accent" />
                        </div>
                        <p className="font-bold text-2xl text-accent">{total_photos}</p>
                        <p className="text-xs text-muted-foreground mt-1">Fotos</p>
                    </div>
                </div>

                {/* Next Event */}
                {next_event ? (
                    <div className="bg-background/50 p-4 rounded-lg border border-accent/20">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-accent/10 rounded-lg">
                                <Calendar className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1">Próximo Evento</p>
                                <p className="font-bold text-sm">{next_event.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(next_event.date).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-background/50 p-4 rounded-lg border border-dashed border-border text-center">
                        <Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                            Nenhum evento agendado
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                    <Link href="/elo-da-rota/confraria/solicitar" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            <Crown className="w-4 h-4 mr-2" />
                            Criar Evento
                        </Button>
                    </Link>
                    <Link href="/elo-da-rota/confraria/galeria" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            <Camera className="w-4 h-4 mr-2" />
                            Ver Galeria
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
