// app/api/cron/distribute-projects/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { distributeProjectToGroup } from '@/lib/services/projects-service'

/**
 * CRON Job: Distribuir projetos pendentes para grupos seguintes
 * Execução: A cada 24 horas
 * 
 * Vercel Cron: vercel.json
 * {
 *   "crons": [{
 *     "path": "/api/cron/distribute-projects",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function GET(req: Request) {
    try {
        // Verificar autorização (Vercel Cron secret)
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const results = {
            group2: [] as string[],
            group3: [] as string[],
            abandoned: [] as string[]
        }

        // 1. Processar Grupo 2 (projetos que já passaram 24h no Grupo 1)
        const { data: group1Projects } = await supabase
            .from('projects')
            .select('*')
            .in('status', ['pending', 'receiving_proposals']) // Continua distribuindo se tiver propostas
            .eq('current_group', 1)
            .not('group1_notified_at', 'is', null)
            .lte('group1_notified_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (group1Projects) {
            for (const project of group1Projects) {
                try {
                    await distributeProjectToGroup(project.id, 2)
                    results.group2.push(project.id)
                } catch (error) {
                    console.error(`Erro ao distribuir projeto ${project.id} para Grupo 2:`, error)
                }
            }
        }

        // 2. Processar Grupo 3 (projetos que já passaram 24h no Grupo 2)
        const { data: group2Projects } = await supabase
            .from('projects')
            .select('*')
            .eq('status', 'pending')
            .eq('current_group', 2)
            .not('group2_notified_at', 'is', null)
            .lte('group2_notified_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (group2Projects) {
            for (const project of group2Projects) {
                try {
                    await distributeProjectToGroup(project.id, 3)
                    results.group3.push(project.id)
                } catch (error) {
                    console.error(`Erro ao distribuir projeto ${project.id} para Grupo 3:`, error)
                }
            }
        }

        // 3. Marcar como "sem interesse" projetos que passaram 72h (3 dias) sem aceite
        const { data: oldProjects } = await supabase
            .from('projects')
            .select('*')
            .eq('status', 'pending')
            .eq('current_group', 3)
            .not('group3_notified_at', 'is', null)
            .lte('group3_notified_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (oldProjects) {
            for (const project of oldProjects) {
                await supabase
                    .from('projects')
                    .update({ status: 'no_interest' })
                    .eq('id', project.id)

                await supabase
                    .from('project_activities')
                    .insert({
                        project_id: project.id,
                        action: 'no_interest',
                        description: 'Projeto marcado como sem interesse após 72h sem aceite'
                    })

                results.abandoned.push(project.id)
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results: {
                group2Processed: results.group2.length,
                group3Processed: results.group3.length,
                markedNoInterest: results.abandoned.length
            },
            details: results
        })

    } catch (error) {
        console.error('Erro no CRON de distribuição:', error)
        return NextResponse.json(
            { error: 'Erro ao processar distribuição' },
            { status: 500 }
        )
    }
}
