#!/bin/bash
#
# Script de Deploy - Sistema de Temporadas
# Aplica todas as mudanças necessárias
#

set -e  # Parar em caso de erro

echo "🚀 DEPLOY: Sistema de Temporadas + Ranking Centralizado"
echo "=========================================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# 1. Adicionar todas as mudanças
echo "📦 1/4 - Preparando mudanças..."
git add \
    sql/automation/RESET_SEASON.sql \
    lib/services/ranking.ts \
    lib/profile/queries.ts \
    lib/profile/types.ts \
    app/api/cron/manage-seasons/route.ts \
    scripts/test-season-cron.mjs

echo "✅ Arquivos adicionados"
echo ""

# 2. Criar commit
echo "💾 2/4 - Criando commit..."
git commit -m "feat: sistema automático de temporadas + ranking centralizado

✨ Novidades:
- Função SQL reset_monthly_vigor() para zerar pontos mensais
- Serviço centralizado de ranking (lib/services/ranking.ts)
- Filtro automático: admin/rotabusiness invisíveis no ranking
- Cron corrigido: usa user_gamification.total_points
- Card Rota do Valente integrado com ranking

🔧 Correções:
- Patente no card agora vem do ranking centralizado
- monthly_vigor reseta automaticamente todo mês
- Medalhas preservadas (conquista ≠ pontos)

📊 Impacto:
- Temporadas mudam automaticamente (cron diário)
- Ranking filtrado em 3+ lugares da plataforma
- Admin/RB não aparecem em nenhum ranking

Co-authored-by: Equipe Técnica <dev@rotabusinessclub.com.br>"

echo "✅ Commit criado"
echo ""

# 3. Push para produção
echo "🌐 3/4 - Enviando para produção..."
git push origin main

echo "✅ Push concluído"
echo ""

# 4. Instruções finais
echo "📋 4/4 - AÇÃO NECESSÁRIA NO SUPABASE:"
echo ""
echo "⚠️  IMPORTANTE: Execute o SQL manualmente no Supabase Dashboard:"
echo ""
echo "1. Acesse: https://supabase.com/dashboard/project/*/editor"
echo "2. Abra o arquivo: sql/automation/RESET_SEASON.sql"
echo "3. Copie TODO o conteúdo"
echo "4. Cole no SQL Editor"
echo "5. Clique em RUN (ou F5)"
echo "6. Verifique: SELECT routine_name FROM information_schema.routines WHERE routine_name = 'reset_monthly_vigor';"
echo ""
echo "🎯 Após executar o SQL, o sistema estará 100% funcional!"
echo ""
echo "✅ Deploy concluído! Vercel está fazendo build automaticamente."
echo "   Acompanhe em: https://vercel.com/dashboard"
echo ""
