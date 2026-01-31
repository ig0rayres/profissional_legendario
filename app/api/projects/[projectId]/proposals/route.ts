// app/api/projects/[projectId]/proposals/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    req: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(req.url)
        const trackingToken = searchParams.get('token')

        const projectId = params.projectId

        // Buscar projeto (validar tracking token se fornecido)
        let projectQuery = supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)

        if (trackingToken) {
            projectQuery = projectQuery.eq('tracking_token', trackingToken)
        }

        const { data: project, error: projectError } = await projectQuery.single()

        if (projectError || !project) {
            return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
        }

        // Buscar propostas
        const { data: proposals, error: proposalsError } = await supabase
            .from('project_proposals')
            .select(`
                *,
                professional:professional_id (
                    id,
                    full_name,
                    avatar_url,
                    categories,
                    pista
                )
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (proposalsError) {
            console.error('Erro ao buscar propostas:', proposalsError)
            return NextResponse.json({ error: 'Erro ao buscar propostas' }, { status: 500 })
        }

        // Buscar gamificação dos profissionais
        const professionalIds = proposals?.map(p => p.professional_id) || []

        const { data: gamificationData } = await supabase
            .from('user_gamification')
            .select('user_id, total_points, current_rank')
            .in('user_id', professionalIds)

        // Buscar contagem de projetos dos profissionais
        const { data: projectsCount } = await supabase
            .from('projects')
            .select('accepted_by')
            .in('accepted_by', professionalIds)
            .eq('status', 'completed')

        // Montar dados completos
        const proposalsWithStats = proposals?.map(proposal => {
            const gamification = gamificationData?.find(g => g.user_id === proposal.professional_id)
            const completedProjects = projectsCount?.filter(p => p.accepted_by === proposal.professional_id).length || 0

            return {
                ...proposal,
                professional: {
                    ...proposal.professional,
                    vigor: gamification?.total_points || 0,
                    rank: gamification?.current_rank || 'RECRUTA',
                    completedProjects
                }
            }
        })

        return NextResponse.json({
            project,
            proposals: proposalsWithStats || []
        })

    } catch (error) {
        console.error('Erro ao buscar propostas:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
