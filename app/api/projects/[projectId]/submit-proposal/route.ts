// app/api/projects/[projectId]/submit-proposal/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
    req: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        const supabase = await createClient()

        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await req.json()
        const { proposed_budget, estimated_days, description, attachments = [] } = body

        // Validação
        if (!proposed_budget || !description) {
            return NextResponse.json(
                { error: 'Orçamento e descrição são obrigatórios' },
                { status: 400 }
            )
        }

        const projectId = params.projectId

        // Buscar projeto
        const { data: project, error: fetchError } = await supabase
            .from('projects')
            .select('*, requester_id, requester_email, requester_name')
            .eq('id', projectId)
            .single()

        if (fetchError || !project) {
            return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
        }

        // Verificar se projeto ainda aceita propostas
        if (!['pending', 'receiving_proposals'].includes(project.status)) {
            return NextResponse.json(
                { error: 'Este projeto não está mais aceitando propostas' },
                { status: 409 }
            )
        }

        // Verificar se profissional já enviou proposta
        const { data: existingProposal } = await supabase
            .from('project_proposals')
            .select('id')
            .eq('project_id', projectId)
            .eq('professional_id', user.id)
            .single()

        if (existingProposal) {
            return NextResponse.json(
                { error: 'Você já enviou uma proposta para este projeto' },
                { status: 409 }
            )
        }

        // Buscar perfil do profissional
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, categories, pista')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

        // Validar categoria
        if (!profile.categories?.includes(project.category)) {
            return NextResponse.json(
                { error: 'Você não tem a categoria necessária para este projeto' },
                { status: 403 }
            )
        }

        // Validar pista (se projeto for específico)
        if (project.scope === 'pista' && project.pista_id !== profile.pista) {
            return NextResponse.json(
                { error: 'Este projeto é específico para outra pista' },
                { status: 403 }
            )
        }

        // Criar proposta
        const { data: proposal, error: insertError } = await supabase
            .from('project_proposals')
            .insert({
                project_id: projectId,
                professional_id: user.id,
                proposed_budget,
                estimated_days,
                description,
                attachments,
                status: 'pending'
            })
            .select()
            .single()

        if (insertError) {
            console.error('Erro ao criar proposta:', insertError)
            return NextResponse.json(
                { error: 'Erro ao enviar proposta' },
                { status: 500 }
            )
        }

        // Atualizar status do projeto para "receiving_proposals"
        if (project.status === 'pending') {
            await supabase
                .from('projects')
                .update({ status: 'receiving_proposals' })
                .eq('id', projectId)
        }

        // Registrar atividade
        await supabase.from('project_activities').insert({
            project_id: projectId,
            user_id: user.id,
            action: 'proposal_submitted',
            description: `${profile.full_name} enviou uma proposta de R$ ${proposed_budget.toFixed(2)}`
        })

        // Notificar cliente
        if (project.requester_id) {
            await supabase.from('notifications').insert({
                user_id: project.requester_id,
                type: 'new_proposal',
                title: '💰 Nova Proposta Recebida!',
                body: `${profile.full_name} enviou uma proposta para: ${project.title}`,
                metadata: {
                    project_id: projectId,
                    proposal_id: proposal.id,
                    proposed_budget
                }
            })
        }

        // Enviar email ao cliente
        if (project.requester_email) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/new-proposal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: project.requester_email,
                        clientName: project.requester_name,
                        project: {
                            title: project.title,
                            trackingToken: project.tracking_token
                        },
                        professional: {
                            name: profile.full_name,
                            avatar: profile.avatar_url
                        },
                        proposal: {
                            budget: proposed_budget,
                            days: estimated_days,
                            description
                        },
                        viewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/projects/view/${project.tracking_token}`
                    })
                })
            } catch (error) {
                console.error('Erro ao enviar email:', error)
            }
        }

        return NextResponse.json({
            success: true,
            proposal,
            message: 'Proposta enviada com sucesso! O cliente será notificado.'
        })

    } catch (error) {
        console.error('Erro ao enviar proposta:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
