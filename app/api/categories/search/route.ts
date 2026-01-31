import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q') || ''
        const limit = parseInt(searchParams.get('limit') || '20')

        // Validação
        if (!query.trim()) {
            return NextResponse.json(
                { error: 'Query parameter "q" is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Buscar categorias por nome, keywords ou tags
        // Usando busca case-insensitive
        const { data: categories, error } = await supabase
            .from('service_categories')
            .select('id, name, slug, icon, color, keywords, tags')
            .or(`name.ilike.%${query}%,keywords.cs.{${query}},tags.cs.{${query}}`)
            .eq('active', true)
            .order('name', { ascending: true })
            .limit(limit)

        if (error) {
            console.error('Erro ao buscar categorias:', error)
            return NextResponse.json(
                { error: 'Erro ao buscar categorias' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            categories: categories || [],
            query,
            count: categories?.length || 0
        })

    } catch (error) {
        console.error('Erro inesperado na API de categorias:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
