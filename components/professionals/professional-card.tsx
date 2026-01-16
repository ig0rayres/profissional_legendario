'use client'

import Link from 'next/link'
import { User, MapPin, Star, CheckCircle, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_USER_GAMIFICATION, MOCK_RANKS } from '@/lib/data/mock'
import { RankInsignia } from '@/components/gamification/rank-insignia'
interface ProfessionalCardProps {
    professional: any
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
    const gamif = MOCK_USER_GAMIFICATION.find(g => g.user_id === professional.user_id)
    const rank = MOCK_RANKS.find(r => r.id === gamif?.current_rank_id) || MOCK_RANKS[0]

    return (
        <Link href={`/professional/${professional.id}`}>
            <Card className="group hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    {/* Avatar Section */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg">
                        {professional.avatar_url ? (
                            <img
                                src={professional.avatar_url}
                                alt={professional.full_name}
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full border-4 border-background object-cover shadow-xl"
                            />
                        ) : (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full border-4 border-background bg-gray-800 flex items-center justify-center shadow-xl">
                                <User className="w-12 h-12 text-gray-600" />
                            </div>
                        )}

                        {/* Rank Badge Overlay */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 ml-8 mt-12 z-10" title={rank.name}>
                            <RankInsignia rankId={rank.id} variant="icon-only" size="sm" className="shadow-lg border-2 border-background" />
                        </div>

                        {professional.verification_status === 'verified' && (
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-green-500 hover:bg-green-600 border-none">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verificado
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="pt-14 pb-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1 mb-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                {professional.full_name}
                            </h3>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full">
                                <RankInsignia rankId={rank.id} variant="badge" showLabel={true} />
                            </div>
                        </div>

                        {/* Location */}
                        {professional.tops && (
                            <div className="flex items-center justify-center gap-1 text-gray-400 text-sm mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{professional.tops.name}</span>
                            </div>
                        )}

                        {/* Bio Preview */}
                        {professional.bio && (
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2 italic">
                                "{professional.bio}"
                            </p>
                        )}

                        {/* Skills */}
                        {professional.skills && professional.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center mt-3">
                                {professional.skills.slice(0, 2).map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] bg-primary/20 text-primary border-primary/10">
                                        {skill}
                                    </Badge>
                                ))}
                                {professional.skills.length > 2 && (
                                    <Badge variant="outline" className="text-[10px] border-primary/20 text-muted-foreground">
                                        +{professional.skills.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Footer Info */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-sm text-yellow-500">
                                    {professional.average_rating > 0 ? professional.average_rating.toFixed(1) : 'N/A'}
                                </span>
                            </div>
                            <div className="text-xs font-bold text-primary">
                                R$ {professional.hourly_rate || 0}/h
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
