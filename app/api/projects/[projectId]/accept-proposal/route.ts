// app/api/projects/[projectId]/accept-proposal/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
    req: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        const supabase = await createClient()

        const body = await req.json()
        const { proposalId, trackingToken } = body

        if (!proposalId) {
            return NextResponse.json(
                { error: 'ID da proposta é obrigatório' },
                { status: 400 }
            )
        }

        const projectId = params.projectId

        // Buscar projeto (via tracking token se não autenticado)
        let project
        if (trackingToken) {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .eq('tracking_token', trackingToken)
                .single()

            if (error || !data) {
                return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
            }
            project = data
        } else {
            // Verificar autenticação
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) {
                return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
            }

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .eq('requester_id', user.id)
                .single()

            if (error || !data) {
                return NextResponse.json(
                    { error: 'Projeto não encontrado ou você não é o dono' },
                    { status: 404 }
                )
            }
            project = data
        }

        // Validar se projeto ainda pode ter proposta aceita
        if (!['pending', 'receiving_proposals'].includes(project.status)) {
            return NextResponse.json(
                { error: 'Este projeto já tem um profissional definido' },
                { status: 409 }
            )
        }

        // Buscar proposta
        const { data: proposal, error: proposalError } = await supabase
            .from('project_proposals')
            .select('*, professional_id')
            .eq('id', proposalId)
            .eq('project_id', projectId)
            .single()

        if (proposalError || !proposal) {
            return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
        }

        // ACEITAR PROPOSTA (atualização atômica)
        const { data: updatedProject, error: updateError } = await supabase
            .from('projects')
            .update({
                status: 'accepted',
                accepted_by: proposal.professional_id,
                accepted_at: new Date().toISOString()
            })
            .eq('id', projectId)
            .in('status', ['pending', 'receiving_proposals'])
            .is('accepted_by', null)
            .select()
            .single()

        if (updateError || !updatedProject) {
            return NextResponse.json(
                { error: 'Erro ao aceitar proposta' },
                { status: 500 }
            )
        }

        // Marcar proposta como aceita
        await supabase
            .from('project_proposals')
            .update({
                status: 'accepted',
                responded_at: new Date().toISOString()
            })
            .eq('id', proposalId)

        // Rejeitar outras propostas
        await supabase
            .from('project_proposals')
            .update({
                status: 'rejected',
                client_response: 'Outra proposta foi aceita',
                responded_at: new Date().toISOString()
            })
            .eq('project_id', projectId)
            .neq('id', proposalId)
            .eq('status', 'pending')

        // Registrar atividade
        await supabase.from('project_activities').insert({
            project_id: projectId,
            user_id: proposal.professional_id,
            action: 'proposal_accepted',
            description: 'Proposta aceita pelo cliente'
        })

        // Notificar profissional aceito
        await supabase.from('notifications').insert({
            user_id: proposal.professional_id,
            type: 'proposal_accepted',
            title: '🎉 Sua Proposta foi Aceita!',
            body: `Parabéns! Sua proposta para "${project.title}" foi aceita!`,
            metadata: {
                project_id: projectId,
                proposal_id: proposalId
            }
        })

        // Notificar profissionais rejeitados
        const { data: rejectedProposals } = await supabase
            .from('project_proposals')
            .select('professional_id')
            .eq('project_id', projectId)
            .eq('status', 'rejected')

        if (rejectedProposals) {
            for (const rejected of rejectedProposals) {
                await supabase.from('notifications').insert({
                    user_id: rejected.professional_id,
                    type: 'proposal_rejected',
                    title: 'Proposta Não Selecionada',
                    body: `Infelizmente sua proposta para "${project.title}" não foi selecionada.`,
                    metadata: { project_id: projectId }
                })
            }
        }

        return NextResponse.json({
            success: true,
            project: updatedProject,
            message: 'Proposta aceita! O profissional foi notificado.'
        })

    } catch (error) {
        console.error('Erro ao aceitar proposta:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
