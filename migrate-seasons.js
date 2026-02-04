const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
    'https://erzprkocwzgdjrsictps.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenBya29jd3pnZGpyc2ljdHBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcwNDczOSwiZXhwIjoyMDgwMjgwNzM5fQ.TfoShhr4ZupYxpvYf6gG42ZP8Ql4k8s7sBbYeKoH3mM'
)

async function runMigration() {
    try {
        console.log('🚀 Iniciando migração de temporadas...\n')

        // 1. Criar JAN/2026 (encerrada)
        console.log('📅 Criando temporada JAN/2026...')
        const { data: jan, error: janError } = await supabase
            .from('gamification_seasons')
            .upsert({
                year: 2026,
                month: 1,
                name: 'Janeiro 2026',
                starts_at: '2026-01-01T00:00:00+00:00',
                ends_at: '2026-01-31T23:59:59+00:00',
                is_active: false
            }, { onConflict: 'year,month' })
            .select()
            .single()

        if (janError) console.error('❌ Erro JAN:', janError.message)
        else console.log('✅ JAN/2026 criada')

        // 2. Criar FEV/2026 (ativa)
        console.log('📅 Criando temporada FEV/2026...')
        const { data: fev, error: fevError } = await supabase
            .from('gamification_seasons')
            .upsert({
                year: 2026,
                month: 2,
                name: 'Fevereiro 2026',
                starts_at: '2026-02-01T00:00:00+00:00',
                ends_at: '2026-02-28T23:59:59+00:00',
                is_active: true
            }, { onConflict: 'year,month' })
            .select()
            .single()

        if (fevError) console.error('❌ Erro FEV:', fevError.message)
        else console.log('✅ FEV/2026 criada (ativa)')

        // 3. Buscar usuários com pontos
        console.log('\n👥 Buscando usuários com pontos...')
        const { data: users, error: usersError } = await supabase
            .from('user_gamification')
            .select('user_id, total_points, current_rank_id')
            .gt('total_points', 0)

        if (usersError) {
            console.error('❌ Erro ao buscar usuários:', usersError.message)
            return
        }

        console.log(`✅ Encontrados ${users.length} usuários com pontos\n`)

        // 4. Migrar pontos para FEV/2026
        console.log('💰 Migrando pontos para FEV/2026...')
        for (const user of users) {
            const { error } = await supabase
                .from('user_season_stats')
                .upsert({
                    user_id: user.user_id,
                    season_id: fev.id,
                    total_xp: user.total_points,
                    rank_id: user.current_rank_id || 'novato',
                    daily_xp_count: 0,
                    last_xp_date: new Date().toISOString().split('T')[0]
                }, { onConflict: 'user_id,season_id' })

            if (error) {
                console.error(`❌ ${user.user_id}:`, error.message)
            } else {
                console.log(`✅ ${user.user_id}: ${user.total_points} pts`)
            }
        }

        // 5. Criar histórico em JAN/2026 (50% dos pontos)
        console.log('\n📜 Criando histórico em JAN/2026 (50% dos pontos)...')
        for (const user of users) {
            const janPoints = Math.floor(user.total_points / 2)
            const rankId = janPoints >= 3500 ? 'lenda' :
                janPoints >= 2000 ? 'general' :
                    janPoints >= 1000 ? 'comandante' :
                        janPoints >= 500 ? 'guardiao' :
                            janPoints >= 200 ? 'especialista' : 'novato'

            const { error } = await supabase
                .from('user_season_stats')
                .upsert({
                    user_id: user.user_id,
                    season_id: jan.id,
                    total_xp: janPoints,
                    rank_id: rankId
                }, { onConflict: 'user_id,season_id' })

            if (error) {
                console.error(`❌ ${user.user_id}:`, error.message)
            } else {
                console.log(`✅ ${user.user_id}: ${janPoints} pts (histórico)`)
            }
        }

        // 6. Verificar resultado
        console.log('\n🔍 Verificando resultado...')
        const { data: seasons } = await supabase
            .from('gamification_seasons')
            .select('*')
            .order('year', { ascending: false })
            .order('month', { ascending: false })

        console.log('\n📊 Temporadas:')
        seasons.forEach(s => {
            console.log(`  ${s.is_active ? '🟢' : '⚪'} ${s.name}`)
        })

        const { count: fevCount } = await supabase
            .from('user_season_stats')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', fev.id)

        const { count: janCount } = await supabase
            .from('user_season_stats')
            .select('*', { count: 'exact', head: true })
            .eq('season_id', jan.id)

        console.log(`\n✅ FEV/2026: ${fevCount} usuários`)
        console.log(`✅ JAN/2026: ${janCount} usuários`)
        console.log('\n🎉 Migração concluída com sucesso!')

    } catch (error) {
        console.error('\n❌ Erro fatal:', error)
    }
}

runMigration()
