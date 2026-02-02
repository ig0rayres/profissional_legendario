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

        // Buscar subscription do usuário
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', user.id)
            .single()

        if (subError) {
            console.error('Erro ao buscar subscription do usuário:', subError)
            return NextResponse.json(
                { error: 'Erro ao verificar plano' },
                { status: 500 }
            )
        }

        // BUSCAR DE PLAN_CONFIG (painel admin - fonte única)
        const { data: planConfig } = await supabase
            .from('plan_config')
            .select('max_categories')
            .eq('tier', subscription?.plan_id || 'recruta')
            .single()

        // -1 = ilimitado
        const maxCategories = planConfig?.max_categories === -1
            ? 999
            : (planConfig?.max_categories || 2)

        console.log(`[API Categories] User ${user.id} | Plan: ${subscription?.plan_id} | Max: ${maxCategories}`)

        // Validar limite
        if (maxCategories !== 999 && categoryIds.length > maxCategories) {
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
