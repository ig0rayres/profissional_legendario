import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Buscar categorias do usuário autenticado
export async function GET() {
    try {
        const supabase = await createClient()

        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            )
        }

        // Buscar categorias do usuário
        const { data: userCategories, error } = await supabase
            .from('user_categories')
            .select(`
                category_id,
                service_categories!inner (
                    id,
                    name,
                    slug,
                    icon,
                    color,
                    keywords,
                    tags
                )
            `)
            .eq('user_id', user.id)

        if (error) {
            console.error('Erro ao buscar categorias do usuário:', error)
            return NextResponse.json(
                { error: 'Erro ao buscar categorias' },
                { status: 500 }
            )
        }

        // Formatar resposta
        const categories = userCategories?.map(uc => uc.service_categories) || []

        return NextResponse.json({
            categories,
            count: categories.length
        })

    } catch (error) {
        console.error('Erro inesperado:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

// POST - Atualizar categorias do usuário
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verificar autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            )
        }

        // Parsear body
        const body = await request.json()
        const { categoryIds } = body

        // Validação
        if (!Array.isArray(categoryIds)) {
            return NextResponse.json(
                { error: 'categoryIds deve ser um array' },
                { status: 400 }
            )
        }

        // Buscar plano do usuário para verificar max_categories
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('current_plan_id, plan_config!inner(max_categories)')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Erro ao buscar plano do usuário:', profileError)
            return NextResponse.json(
                { error: 'Erro ao verificar plano' },
                { status: 500 }
            )
        }

        // plan_config vem como array do join
        const planConfig = Array.isArray(profile.plan_config)
            ? profile.plan_config[0]
            : profile.plan_config

        // Validar que encontrou configuração do plano
        if (!planConfig?.max_categories) {
            console.error(`[API Categories] Plan config não encontrado ou sem max_categories para user ${user.id}`)
            return NextResponse.json({
                error: 'Configuração de plano não encontrada. Entre em contato com o suporte.'
            }, { status: 500 })
        }

        const maxCategories = planConfig.max_categories

        // Validar limite
        if (maxCategories !== -1 && categoryIds.length > maxCategories) {
            return NextResponse.json(
                {
                    error: 'Limite de categorias excedido',
                    max: maxCategories,
                    attempted: categoryIds.length
                },
                { status: 400 }
            )
        }

        // Verificar se as categorias existem
        const { data: existingCategories, error: catError } = await supabase
            .from('service_categories')
            .select('id')
            .in('id', categoryIds)
            .eq('active', true)

        if (catError) {
            console.error('Erro ao validar categorias:', catError)
            return NextResponse.json(
                { error: 'Erro ao validar categorias' },
                { status: 500 }
            )
        }

        if (existingCategories.length !== categoryIds.length) {
            return NextResponse.json(
                { error: 'Algumas categorias são inválidas ou inativas' },
                { status: 400 }
            )
        }

        // Deletar categorias antigas
        const { error: deleteError } = await supabase
            .from('user_categories')
            .delete()
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Erro ao deletar categorias antigas:', deleteError)
            return NextResponse.json(
                { error: 'Erro ao atualizar categorias' },
                { status: 500 }
            )
        }

        // Inserir novas categorias
        if (categoryIds.length > 0) {
            const userCategoriesData = categoryIds.map(categoryId => ({
                user_id: user.id,
                category_id: categoryId
            }))

            const { error: insertError } = await supabase
                .from('user_categories')
                .insert(userCategoriesData)

            if (insertError) {
                console.error('Erro ao inserir novas categorias:', insertError)
                return NextResponse.json(
                    { error: 'Erro ao salvar categorias' },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Categorias atualizadas com sucesso',
            count: categoryIds.length
        })

    } catch (error) {
        console.error('Erro inesperado:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
