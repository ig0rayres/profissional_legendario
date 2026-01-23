// ============================================
// TESTE BROWSER - Executar no Console do Navegador
// Copie e cole este código no Console (F12) da página:
// http://localhost:3000/admin/game
// ============================================

(async () => {
    console.log('🎮 TESTE DE GAMIFICAÇÃO NO BROWSER\n');

    // Teste 1: Verificar se Supabase está disponível
    console.log('📝 TESTE 1: Verificar Supabase...');
    try {
        const supabaseAvailable = typeof window !== 'undefined';
        console.log(supabaseAvailable ? '✅ Window disponível' : '❌ Erro: Window não disponível');
    } catch (e) {
        console.error('❌ Erro ao verificar window:', e);
    }

    // Teste 2: Tentar carregar dados de badges do Supabase
    console.log('\n📝 TESTE 2: Buscar badges do banco...');
    try {
        const response = await fetch('https://erzprkocwzgdjrsictps.supabase.co/rest/v1/badges?select=*', {
            headers: {
                'apikey': 'sb_publishable_orfXe5wmzBsnmvoVLQBkuA_Hh15WrmT',
                'Authorization': 'Bearer sb_publishable_orfXe5wmzBsnmvoVLQBkuA_Hh15WrmT'
            }
        });

        if (response.ok) {
            const badges = await response.json();
            console.log(`✅ Conectado ao Supabase! Encontradas ${badges.length} badges`);
            console.log('   Badges:', badges.map(b => b.name).join(', '));
        } else {
            console.log(`⚠️  Resposta: ${response.status} - ${response.statusText}`);
        }
    } catch (e) {
        console.error('❌ Erro ao buscar badges:', e.message);
    }

    // Teste 3: Verificar tabela gamification_stats
    console.log('\n📝 TESTE 3: Verificar tabela gamification_stats...');
    try {
        const response = await fetch('https://erzprkocwzgdjrsictps.supabase.co/rest/v1/gamification_stats?select=count', {
            headers: {
                'apikey': 'sb_publishable_orfXe5wmzBsnmvoVLQBkuA_Hh15WrmT',
                'Authorization': 'Bearer sb_publishable_orfXe5wmzBsnmvoVLQBkuA_Hh15WrmT',
                'Prefer': 'count=exact'
            }
        });

        if (response.ok) {
            const count = response.headers.get('content-range');
            console.log(`✅ Tabela gamification_stats existe! Registros: ${count}`);
        } else {
            console.log(`⚠️  Tabela pode não existir: ${response.status}`);
        }
    } catch (e) {
        console.error('❌ Erro ao verificar tabela:', e.message);
    }

    // Teste 4: Verificar se funções RPC existem
    console.log('\n📝 TESTE 4: Testar função add_user_xp...');
    try {
        const testUserId = '00000000-0000-0000-0000-000000000001';
        const response = await fetch('https://erzprkocwzgdjrsictps.supabase.co/rest/v1/rpc/add_user_xp', {
            method: 'POST',
            headers: {
                'apikey': 'sb_publishable_orfXe5wmzBsnmvoVLQBkuA_Hh15WrmT',
                'Authorization': 'Bearer sb_publishable_orfXe5wmzBsnmvoVLQBkuA_Hh15WrmT',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                p_user_id: testUserId,
                p_base_amount: 10,
                p_action_type: 'browser_test',
                p_description: 'Teste do console do navegador'
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Função add_user_xp EXISTE e FUNCIONA!`);
            console.log(`   Pontos concedidos: ${result}`);
        } else if (response.status === 404) {
            console.log('❌ Função add_user_xp NÃO ENCONTRADA no banco');
            console.log('   → Execute deploy_gamification_SIMPLE.sql!');
        } else {
            const error = await response.text();
            console.log(`⚠️  Erro ${response.status}:`, error);
        }
    } catch (e) {
        console.error('❌ Erro ao testar função:', e.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(60));
    console.log('Se todos os testes passaram:');
    console.log('  ✅ Sistema conectado ao Supabase');
    console.log('  ✅ Funções SQL instaladas');
    console.log('  ✅ Pronto para distribuir pontos!');
    console.log('\nSe algum teste falhou:');
    console.log('  ⚠️  Execute deploy_gamification_SIMPLE.sql no Supabase');
    console.log('='.repeat(60));
})();
