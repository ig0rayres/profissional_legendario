// lib/services/projects-service.ts
import { createClient } from '@/lib/supabase/client'

export interface ProjectDistributionResult {
    projectId: string
    group: 1 | 2 | 3
    professionalsNotified: string[]
    count: number
}

/**
 * Distribui projeto para profissionais baseado em VIGOR
 * Divide em 3 grupos: Top 33%, Mid 33%, Low 33%
 */
export async function distributeProjectToGroup(
    projectId: string,
    groupNumber: 1 | 2 | 3
): Promise<ProjectDistributionResult> {
    const supabase = createClient()

    // 1. Buscar projeto
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    if (projectError || !project) {
        throw new Error('Projeto não encontrado')
    }

    // 2. Buscar profissionais elegíveis
    const { data: professionals, error: proError } = await supabase
        .rpc('get_eligible_professionals', {
            p_category: project.category,
            p_scope: project.scope,
            p_pista_id: project.pista_id
        })

    if (proError || !professionals || professionals.length === 0) {
        // Marcar projeto como sem interesse se não houver profissionais
        await supabase
            .from('projects')
            .update({ status: 'no_interest' })
            .eq('id', projectId)

        return {
            projectId,
            group: groupNumber,
            professionalsNotified: [],
            count: 0
        }
    }

    // 3. Dividir em 3 grupos
    const totalPros = professionals.length
    const groupSize = Math.ceil(totalPros / 3)

    const groups = {
        1: professionals.slice(0, groupSize),                    // Top 33%
        2: professionals.slice(groupSize, groupSize * 2),        // Mid 33%
        3: professionals.slice(groupSize * 2)                     // Low 33%
    }

    const targetGroup = groups[groupNumber]

    if (!targetGroup || targetGroup.length === 0) {
        return {
            projectId,
            group: groupNumber,
            professionalsNotified: [],
            count: 0
        }
    }

    // 4. Notificar profissionais (3 canais)
    for (const pro of targetGroup) {
        await notifyProfessional(pro.id, project, groupNumber)
    }

    // 5. Atualizar projeto
    const updateField = `group${groupNumber}_notified_at` as const
    await supabase
        .from('projects')
        .update({
            current_group: groupNumber,
            [updateField]: new Date().toISOString()
        })
        .eq('id', projectId)

    // 6. Registrar log
    await supabase.from('project_distribution_log').insert({
        project_id: projectId,
        group_number: groupNumber,
        professionals_notified: targetGroup.map(p => p.id),
        professionals_count: targetGroup.length
    })

    return {
        projectId,
        group: groupNumber,
        professionalsNotified: targetGroup.map(p => p.id),
        count: targetGroup.length
    }
}

/**
 * Notifica profissional em 3 canais: sino, chat, email
 */
async function notifyProfessional(
    userId: string,
    project: any,
    groupNumber: number
) {
    const supabase = createClient()

    const groupDescriptions = {
        1: 'Top - profissionais com mais VIGOR',
        2: 'Intermediário - profissionais com VIGOR médio',
        3: 'Base - profissionais iniciantes'
    }

    // 1. Sino (header bell)
    await supabase.from('notifications').insert({
        user_id: userId,
        type: 'new_project',
        title: '🎯 Novo Projeto Disponível!',
        body: `${project.category}: ${project.title}`,
        metadata: {
            project_id: project.id,
            category: project.category,
            estimated_budget: project.estimated_budget,
            group: groupNumber
        },
        read: false
    })

    // 2. project_notifications (para contador)
    await supabase.from('project_notifications').insert({
        user_id: userId,
        project_id: project.id,
        notification_type: 'new_project',
        viewed: false
    })

    // 3. Chat com admin
    const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || '00000000-0000-0000-0000-000000000000'

    await supabase.from('messages').insert({
        sender_id: ADMIN_USER_ID,
        receiver_id: userId,
        content: `
🎯 **Novo Projeto Disponível - Grupo ${groupNumber}**

**Categoria:** ${project.category}
**Título:** ${project.title}
**Descrição:** ${project.description}

${project.estimated_budget ? `💰 **Orçamento:** R$ ${project.estimated_budget.toFixed(2)}` : ''}
${project.deadline ? `📅 **Prazo:** ${new Date(project.deadline).toLocaleDateString('pt-BR')}` : ''}

🏆 **Você está no Grupo ${groupNumber}** - ${groupDescriptions[groupNumber as keyof typeof groupDescriptions]}

⏰ **Atenção:** Este projeto estará disponível por 24 horas para seu grupo.

🔗 [Ver Projeto e Aceitar](/dashboard/projects/${project.id})
        `.trim(),
        type: 'project_notification'
    })

    // 4. Email (via API route)
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single()

        if (profile?.email) {
            await fetch('/api/emails/project-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: profile.email,
                    professionalName: profile.full_name,
                    project: {
                        title: project.title,
                        category: project.category,
                        description: project.description,
                        estimated_budget: project.estimated_budget,
                        deadline: project.deadline
                    },
                    groupNumber,
                    groupDescription: groupDescriptions[groupNumber as keyof typeof groupDescriptions],
                    projectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/projects/${project.id}`
                })
            })
        }
    } catch (error) {
        console.error('Erro ao enviar email:', error)
        // Não bloqueia se email falhar
    }
}

/**
 * Calcula VIGOR ganho ao completar projeto
 */
export function calculateProjectXP(project: {
    estimated_budget?: number
    priority: string
    deadline?: string
    completed_at: string
    rating?: number
}): number {
    let xp = 100 // Base

    // Multiplicador por orçamento
    if (project.estimated_budget) {
        if (project.estimated_budget >= 10000) xp *= 1.5
        else if (project.estimated_budget >= 5000) xp *= 1.3
        else if (project.estimated_budget >= 2000) xp *= 1.2
    }

    // Multiplicador por prioridade
    if (project.priority === 'urgent') xp *= 1.3
    else if (project.priority === 'high') xp *= 1.15

    // Multiplicador por prazo
    if (project.deadline) {
        const completedOnTime = new Date(project.completed_at) <= new Date(project.deadline)
        if (completedOnTime) xp *= 1.3
    }

    // Multiplicador por avaliação
    if (project.rating) {
        if (project.rating >= 4.5) xp *= 1.4
        else if (project.rating >= 4.0) xp *= 1.2
        else if (project.rating >= 3.5) xp *= 1.1
    }

    return Math.floor(xp)
}

/**
 * Verifica e concede medalhas de projetos
 */
export async function checkProjectMedals(userId: string) {
    const supabase = createClient()

    // Contar projetos completados (all-time)
    const { count: totalCompleted } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('accepted_by', userId)
        .eq('status', 'completed')

    const medals: string[] = []

    // Primeira conquista
    if (totalCompleted === 1) medals.push('project_first')
    if (totalCompleted === 5) medals.push('project_5')
    if (totalCompleted === 10) medals.push('project_10')
    if (totalCompleted === 25) medals.push('project_25')
    if (totalCompleted === 50) medals.push('project_50')
    if (totalCompleted === 100) medals.push('project_100')

    // Conceder medalhas
    for (const medalId of medals) {
        await supabase.rpc('award_medal', {
            p_user_id: userId,
            p_medal_id: medalId
        })
    }

    // 5 Estrelas (histórico)
    if (totalCompleted && totalCompleted >= 20) {
        const { data: reviews } = await supabase
            .from('project_reviews')
            .select('rating')
            .eq('professional_id', userId)

        if (reviews && reviews.length >= 20) {
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

            if (avg >= 4.8) {
                await supabase.rpc('award_medal', {
                    p_user_id: userId,
                    p_medal_id: 'project_5stars'
                })
            }
        }
    }
}
