// app/api/projects/create-public/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { distributeProjectToGroup } from '@/lib/services/projects-service'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const {
            title,
            description,
            category,
            scope = 'national',
            pista_id,
            requester_name,
            requester_email,
            requester_phone,
            location,
            estimated_budget,
            deadline,
            priority = 'normal',
            attachments = []
        } = body

        // Validação básica
        if (!title || !description || !category || !requester_email || !requester_phone) {
            return NextResponse.json(
                { error: 'Campos obrigatórios faltando' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Criar projeto
        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                type: 'general',
                title,
                description,
                category,
                scope,
                pista_id: scope === 'pista' ? pista_id : null,
                requester_name,
                requester_email,
                requester_phone,
                location,
                estimated_budget,
                deadline,
                priority,
                attachments,
                status: 'pending',
                current_group: 1
            })
            .select()
            .single()

        if (error) {
            console.error('Erro ao criar projeto:', error)
            return NextResponse.json(
                { error: 'Erro ao criar projeto' },
                { status: 500 }
            )
        }

        // Registrar atividade
        await supabase.from('project_activities').insert({
            project_id: project.id,
            action: 'created',
            description: 'Projeto criado'
        })

        // Disparar distribuição para Grupo 1 (background)
        // Em produção, usar fila/job
        distributeProjectToGroup(project.id, 1).catch(console.error)

        // Enviar email de confirmação ao cliente com link para ver propostas
        try {
            const viewProposalsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/projects/view/${project.id}?token=${project.tracking_token}`

            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/emails/project-created`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: requester_email,
                    clientName: requester_name,
                    project: {
                        title,
                        category,
                        estimated_budget,
                        deadline
                    },
                    viewProposalsUrl
                })
            })
        } catch (emailError) {
            console.error('Erro ao enviar email:', emailError)
            // Não bloqueia se email falhar
        }

        return NextResponse.json({
            success: true,
            projectId: project.id,
            trackingToken: project.tracking_token,
            message: 'Projeto criado com sucesso! Notificamos os profissionais.'
        })

    } catch (error) {
        console.error('Erro no endpoint:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
