'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, DollarSign, Calendar, Flame, ArrowLeft, Filter } from 'lucide-react'
import Link from 'next/link'
import { MOCK_PROJECTS } from '@/lib/data/mock'

export default function ProjectsPage() {
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

    const filteredProjects = selectedStatus
        ? MOCK_PROJECTS.filter(p => p.status === selectedStatus)
        : MOCK_PROJECTS

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'text-primary bg-primary/20'
            case 'in_progress':
                return 'text-accent bg-accent/20'
            case 'completed':
                return 'text-secondary bg-secondary/20'
            default:
                return 'text-muted-foreground bg-muted/20'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'open':
                return 'Aberto'
            case 'in_progress':
                return 'Em Andamento'
            case 'completed':
                return 'Concluído'
            default:
                return status
        }
    }

    return (
        <div className="min-h-screen bg-adventure">
            {/* Header */}
            <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Flame className="w-8 h-8 text-primary" />
                            <h1 className="text-2xl font-bold text-impact text-primary">Profissional ROTA</h1>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="border-primary/20">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Page Title */}
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-bold text-impact text-primary mb-2">
                        Projetos Disponíveis
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Oportunidades de transformação e crescimento
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <Button
                        variant={selectedStatus === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus(null)}
                        className={selectedStatus === null ? "glow-orange" : "border-primary/20"}
                    >
                        Todos
                    </Button>
                    <Button
                        variant={selectedStatus === 'open' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus('open')}
                        className={selectedStatus === 'open' ? "glow-orange" : "border-primary/20"}
                    >
                        Abertos
                    </Button>
                    <Button
                        variant={selectedStatus === 'in_progress' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus('in_progress')}
                        className={selectedStatus === 'in_progress' ? "glow-orange" : "border-primary/20"}
                    >
                        Em Andamento
                    </Button>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                        {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
                    </p>
                </div>

                {/* Projects List */}
                <div className="space-y-6">
                    {filteredProjects.map((project) => (
                        <Card
                            key={project.id}
                            className="glass-strong border-primary/20 hover:border-primary/40 transition-all hover:glow-orange"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-primary/20">
                                                <Briefcase className="w-5 h-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-2xl text-impact text-primary">
                                                {project.title}
                                            </CardTitle>
                                        </div>
                                        <CardDescription className="text-base">
                                            {project.client_name}
                                        </CardDescription>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.status)}`}>
                                        {getStatusText(project.status)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-foreground">
                                    {project.description}
                                </p>

                                <div className="flex items-center gap-6 pt-2 border-t border-primary/10">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        <span className="font-bold text-primary">
                                            R$ {project.budget.toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(project.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>

                                {project.status === 'open' && (
                                    <Button className="w-full glow-orange">
                                        Candidatar-se ao Projeto
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* No Results */}
                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            Nenhum projeto encontrado
                        </h3>
                        <p className="text-muted-foreground">
                            Tente ajustar os filtros
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
