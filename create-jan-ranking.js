const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://erzprkocwzgdjrsictps.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenBya29jd3pnZGpyc2ljdHBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcwNDczOSwiZXhwIjoyMDgwMjgwNzM5fQ.TfoShhr4ZupYxpvYf6gG42ZP8Ql4k8s7sBbYeKoH3mM'
);

async function createJanRanking() {
    const janSeasonId = 'ade87c12-ec6b-41fa-a06f-469cde928964';

    console.log('🏆 Calculando ranking para JAN/2026...\n');

    // Buscar todos os usuários da temporada JAN/2026, ordenado por pontos
    const { data: stats } = await supabase
        .from('user_season_stats')
        .select('id, user_id, total_xp')
        .eq('season_id', janSeasonId)
        .order('total_xp', { ascending: false });

    if (!stats || stats.length === 0) {
        console.log('❌ Nenhum stat encontrado');
        return;
    }

    console.log(`✅ ${stats.length} usuários encontrados\n`);

    // Atualizar ranking_position para cada usuário
    for (let i = 0; i < stats.length; i++) {
        const position = i + 1;
        const stat = stats[i];

        const { error } = await supabase
            .from('user_season_stats')
            .update({ ranking_position: position })
            .eq('id', stat.id);

        if (error) {
            console.error(`❌ ${position}º - Erro:`, error.message);
        } else {
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '  ';
            console.log(`${medal} ${position}º lugar - ${stat.total_xp} pts`);
        }
    }

    console.log('\n🎉 Ranking de JAN/2026 criado com sucesso!');
}

createJanRanking();
