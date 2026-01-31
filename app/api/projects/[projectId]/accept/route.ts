// app/api/projects/[projectId]/accept/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
    req: Request,
    { params }: { params: { projectId: string } }
) {
    try {
        const supabase = createClient()

        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const projectId = params.projectId

        // Buscar projeto com lock (para evitar condição de corrida)
        const { data: project, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single()

        if (fetchError || !project) {
            return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
        }

        // VALIDAÇÃO CRÍTICA: Verificar se já foi aceito
        if (project.status !== 'pending') {
            return NextResponse.json(
                {
                    error: 'Este projeto já foi aceito por outro profissional',
                    currentStatus: project.status
                },
                { status: 409 } // Conflict
            )
        }

        // VALIDAÇÃO: Verificar se accepted_by já está preenchido
        if (project.accepted_by) {
            return NextResponse.json(
                { error: 'Este projeto já tem um profissional responsável' },
                { status: 409 }
            )
        }

        // Verificar se profissional é elegível (mesma categoria)
        const { data: profile } = await supabase
            .from('profiles')
            .select('categories, pista')
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

        // Validar pista (se projeto for de pista específica)
        if (project.scope === 'pista' && project.pista_id !== profile.pista) {
            return NextResponse.json(
                { error: 'Este projeto é específico para outra pista' },
                { status: 403 }
            )
        }

        // ACEITAR PROJETO (atualização atômica)
        const { data: updatedProject, error: updateError } = await supabase
            .from('projects')
            .update({
                status: 'accepted',
                accepted_by: user.id,
                accepted_at: new Date().toISOString()
            })
            .eq('id', projectId)
            .eq('status', 'pending') // Garantir que ainda está pending
            .is('accepted_by', null)  // Garantir que ninguém aceitou ainda
            .select()
            .single()

        if (updateError || !updatedProject) {
            // Se falhou, é porque outra pessoa aceitou entre a leitura e a escrita
            return NextResponse.json(
                { error: 'Este projeto acabou de ser aceito por outro profissional' },
                { status: 409 }
            )
        }

        // Registrar atividade
        await supabase.from('project_activities').insert({
            project_id: projectId,
            user_id: user.id,
            action: 'accepted',
            description: `Projeto aceito por ${profile.full_name || 'profissional'}`
        })

        // Notificar cliente (se houver)
        if (project.requester_id) {
            await supabase.from('notifications').insert({
                user_id: project.requester_id,
                type: 'project_accepted',
                title: '✅ Projeto Aceito!',
                body: `Um profissional aceitou seu projeto: ${project.title}`,
                metadata: { project_id: projectId }
            })
        }

        // Criar chat entre profissional e cliente
        if (project.requester_email) {
            await supabase.from('project_messages').insert({
                project_id: projectId,
                sender_id: user.id,
                message: `Olá! Acabei de aceitar seu projeto "${project.title}". Vamos conversar sobre os detalhes?`
            })
        }

        return NextResponse.json({
            success: true,
            project: updatedProject,
            message: 'Projeto aceito com sucesso!'
        })

    } catch (error) {
        console.error('Erro ao aceitar projeto:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
