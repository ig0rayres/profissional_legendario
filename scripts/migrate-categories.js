#!/usr/bin/env node
/**
 * Script para migrar categorias do arquivo categories.ts para o banco
 * Compara o que tem no arquivo com o que tem no banco e insere o que falta
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração Supabase
const supabaseUrl = 'https://erzprkocwzgdjrsictps.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenBya29jd3pnZGpyc2ljdHBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcwNDczOSwiZXhwIjoyMDgwMjgwNzM5fQ.TfoShhr4ZupYxpvYf6gG42ZP8Ql4k8s7sBbYeKoH3mM'
const supabase = createClient(supabaseUrl, supabaseKey)

// Cores padrão por seção
const COLORS = {
    'Tecnologia & Desenvolvimento': '#3B82F6',
    'Construção Civil & Reformas': '#F59E0B',
    'Saúde & Bem-estar': '#10B981',
    'Automotivo': '#EF4444',
    'Marketing & Vendas': '#8B5CF6',
    'Design & Criativo': '#EC4899',
    'Consultoria & Negócios': '#6366F1',
    'Serviços Gerais': '#14B8A6',
    'Ensino & Aulas': '#F97316'
}

// Ícones padrão
const DEFAULT_ICONS = {
    'Tecnologia & Desenvolvimento': 'Code',
    'Construção Civil & Reformas': 'HardHat',
    'Saúde & Bem-estar': 'Heart',
    'Automotivo': 'Car',
    'Marketing & Vendas': 'TrendingUp',
    'Design & Criativo': 'Palette',
    'Consultoria & Negócios': 'Briefcase',
    'Serviços Gerais': 'Wrench',
    'Ensino & Aulas': 'GraduationCap'
}

async function main() {
    console.log('🔄 Iniciando migração de categorias...\n')

    // 1. Ler arquivo categories.ts
    const filePath = path.join(__dirname, '../lib/data/categories.ts')
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    // Extrair todas as categorias do arquivo
    const fileCategories = []
    const regex = /{\s*value:\s*"([^"]+)",\s*label:\s*"([^"]+)"\s*}/g
    let match
    let currentSection = ''

    const sectionRegex = /label:\s*"([^"]+)"/g
    const lines = fileContent.split('\n')

    for (const line of lines) {
        if (line.includes('label:') && !line.includes('value:')) {
            const sectionMatch = /"([^"]+)"/.exec(line)
            if (sectionMatch) {
                currentSection = sectionMatch[1]
            }
        }

        const catMatch = /{\s*value:\s*"([^"]+)",\s*label:\s*"([^"]+)"\s*}/.exec(line)
        if (catMatch) {
            fileCategories.push({
                slug: catMatch[1],
                name: catMatch[2],
                section: currentSection
            })
        }
    }

    console.log(`📄 Encontradas ${fileCategories.length} categorias no arquivo`)

    // 2. Buscar categorias do banco
    const { data: dbCategories, error } = await supabase
        .from('service_categories')
        .select('slug')

    if (error) {
        console.error('❌ Erro ao buscar categorias do banco:', error)
        process.exit(1)
    }

    const dbSlugs = new Set(dbCategories.map(c => c.slug))
    console.log(`💾 Encontradas ${dbSlugs.size} categorias no banco`)

    // 3. Identificar categorias faltando
    const missing = fileCategories.filter(c => !dbSlugs.has(c.slug))

    if (missing.length === 0) {
        console.log('\n✅ Todas as categorias do arquivo já estão no banco!')
        console.log('\n🗑️  Agora você pode remover o arquivo lib/data/categories.ts')
        return
    }

    console.log(`\n🔍 Faltam ${missing.length} categorias no banco:\n`)

    // 4. Inserir categorias faltando
    let inserted = 0
    let errors = 0

    for (const cat of missing) {
        const color = COLORS[cat.section] || '#6B7280'
        const icon = DEFAULT_ICONS[cat.section] || 'Tag'

        const { error: insertError } = await supabase
            .from('service_categories')
            .insert({
                name: cat.name,
                slug: cat.slug,
                icon,
                color,
                active: true,
                keywords: [cat.name.toLowerCase()],
                tags: [cat.section]
            })

        if (insertError) {
            console.log(`  ❌ ${cat.name} (${cat.slug}) - ERRO: ${insertError.message}`)
            errors++
        } else {
            console.log(`  ✅ ${cat.name} (${cat.slug})`)
            inserted++
        }
    }

    console.log(`\n📊 Resumo:`)
    console.log(`  ✅ Inseridas: ${inserted}`)
    console.log(`  ❌ Erros: ${errors}`)
    console.log(`  📈 Total no banco: ${dbSlugs.size + inserted}`)

    if (inserted > 0) {
        console.log('\n✨ Migração concluída com sucesso!')
        console.log('\n🗑️  Agora você pode remover o arquivo lib/data/categories.ts')
    }
}

main().catch(console.error)
