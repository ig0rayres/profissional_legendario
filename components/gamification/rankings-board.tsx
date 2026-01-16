'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, MapPin, Globe, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RankingItem {
    id: string
    name: string
    xp: number
    rank: string
    position: number
    location: string
    avatar_url?: string
}

interface RankingsBoardProps {
    data: {
        local: RankingItem[]
        regional: RankingItem[]
        national: RankingItem[]
    }
    className?: string
}

export function RankingsBoard({ data, className }: RankingsBoardProps) {
    const [tab, setTab] = useState<'local' | 'regional' | 'national'>('national')

    const rankings = data[tab]

    return (
        <Card className={cn("border-primary/20 bg-card/50 backdrop-blur-sm", className)}>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-impact text-primary flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-secondary" />
                            Quadro de Honra
                        </CardTitle>
                        <CardDescription>
                            Os maiores Valentes da guilda
                        </CardDescription>
                    </div>

                    <div className="flex bg-primary/10 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTab('local')}
                            className={cn("px-4 py-1.5 h-auto text-xs font-bold uppercase", tab === 'local' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                        >
                            <MapPin className="w-3 h-3 mr-1" />
                            Local
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTab('national')}
                            className={cn("px-4 py-1.5 h-auto text-xs font-bold uppercase", tab === 'national' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                        >
                            <Globe className="w-3 h-3 mr-1" />
                            Nacional
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {rankings.map((user, idx) => (
                        <div
                            key={user.id}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-lg transition-colors border border-transparent",
                                idx === 0 ? "bg-secondary/10 border-secondary/20" : "hover:bg-primary/5"
                            )}
                        >
                            <div className="w-8 text-center font-black text-lg text-primary/50">
                                {idx < 3 ? (
                                    <div className="flex justify-center">
                                        <Medal className={cn(
                                            "w-6 h-6",
                                            idx === 0 ? "text-yellow-500" : idx === 1 ? "text-gray-400" : "text-amber-600"
                                        )} />
                                    </div>
                                ) : (
                                    user.position
                                )}
                            </div>

                            <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-foreground truncate">{user.name}</h4>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                    {user.rank} • {user.location}
                                </p>
                            </div>

                            <div className="text-right">
                                <div className="font-black text-primary">{user.xp}</div>
                                <div className="text-[9px] text-muted-foreground uppercase font-bold">Vigor</div>
                            </div>
                        </div>
                    ))}

                    {rankings.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground italic">
                                Nenhum registro encontrado nesta categoria.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
