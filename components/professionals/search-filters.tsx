'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Star, CheckCircle, X } from 'lucide-react'

interface SearchFiltersProps {
    tops: any[]
    skills: string[]
    onFilterChange: (filters: any) => void
}

export function SearchFilters({ tops, skills, onFilterChange }: SearchFiltersProps) {
    const [query, setQuery] = useState('')
    const [selectedTop, setSelectedTop] = useState<string | null>(null)
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [minRating, setMinRating] = useState<number | null>(null)
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null)

    const applyFilters = () => {
        onFilterChange({
            query: query || undefined,
            topId: selectedTop || undefined,
            skills: selectedSkills.length > 0 ? selectedSkills : undefined,
            minRating: minRating || undefined,
            verificationStatus: verificationStatus || undefined,
        })
    }

    const clearFilters = () => {
        setQuery('')
        setSelectedTop(null)
        setSelectedSkills([])
        setMinRating(null)
        setVerificationStatus(null)
        onFilterChange({})
    }

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill))
        } else {
            setSelectedSkills([...selectedSkills, skill])
        }
    }

    const hasActiveFilters = query || selectedTop || selectedSkills.length > 0 || minRating || verificationStatus

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Filtros
                    </CardTitle>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="w-4 h-4 mr-1" />
                            Limpar
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Input */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Buscar</label>
                    <Input
                        placeholder="Nome ou habilidade..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>

                {/* Location Filter */}
                <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Localização
                    </label>
                    <div className="space-y-2">
                        <button
                            onClick={() => setSelectedTop(null)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!selectedTop
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                        >
                            Todas as cidades
                        </button>
                        {tops.map((top) => (
                            <button
                                key={top.id}
                                onClick={() => setSelectedTop(top.id)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedTop === top.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                    }`}
                            >
                                {top.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Verification Status */}
                <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Status de Verificação
                    </label>
                    <div className="space-y-2">
                        <button
                            onClick={() => setVerificationStatus(null)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!verificationStatus
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setVerificationStatus('verified')}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${verificationStatus === 'verified'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                        >
                            Apenas Verificados
                        </button>
                    </div>
                </div>

                {/* Rating Filter */}
                <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Avaliação Mínima
                    </label>
                    <div className="flex gap-2">
                        {[3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setMinRating(minRating === rating ? null : rating)}
                                className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${minRating === rating
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                    }`}
                            >
                                {rating}+ ⭐
                            </button>
                        ))}
                    </div>
                </div>

                {/* Skills Filter */}
                {skills.length > 0 && (
                    <div>
                        <label className="text-sm font-medium mb-2 block">Habilidades</label>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                            {skills.map((skill) => (
                                <Badge
                                    key={skill}
                                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => toggleSkill(skill)}
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Apply Button */}
                <Button onClick={applyFilters} className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                </Button>
            </CardContent>
        </Card>
    )
}
