#!/bin/bash
# Script de Verificação do Sistema de Auth
# Valida se todas as proteções estão ativas

echo "🔍 VERIFICAÇÃO DO SISTEMA DE AUTENTICAÇÃO"
echo "=========================================="
echo ""

ERRORS=0

# 1. Verificar se usa .maybeSingle() (nunca .single())
echo "✓ Verificando uso de .maybeSingle()..."
if grep -r "\.single()" lib/auth/context.tsx 2>/dev/null; then
    echo "  ❌ ERRO: Encontrado uso de .single() - use .maybeSingle()"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ OK: Nenhum .single() encontrado"
fi

# 2. Verificar se setLoading(false) está presente
echo ""
echo "✓ Verificando setLoading(false)..."
LOADING_COUNT=$(grep -c "setLoading(false)" lib/auth/context.tsx)
if [ "$LOADING_COUNT" -lt 3 ]; then
    echo "  ⚠️  AVISO: Apenas $LOADING_COUNT ocorrências de setLoading(false)"
    echo "            Deve ter pelo menos 3 (success, error, else)"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ OK: $LOADING_COUNT ocorrências de setLoading(false)"
fi

# 3. Verificar se existe timeout em Promise.race
echo ""
echo "✓ Verificando timeout de 3s..."
if grep -q "Promise.race" lib/auth/context.tsx && grep -q "setTimeout.*3000" lib/auth/context.tsx; then
    echo "  ✅ OK: Timeout de 3s configurado"
else
    echo "  ❌ ERRO: Timeout não encontrado ou incorreto"
    ERRORS=$((ERRORS + 1))
fi

# 4. Verificar se existe backup em tags
echo ""
echo "✓ Verificando backups automáticos..."
BACKUP_COUNT=$(git tag -l "auth-backup-*" | wc -l)
if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo "  ✅ OK: $BACKUP_COUNT backup(s) encontrado(s)"
    echo "     Último: $(git tag -l "auth-backup-*" | sort -r | head -n1)"
else
    echo "  ⚠️  AVISO: Nenhum backup automático encontrado"
fi

# 5. Verificar se script de rollback existe
echo ""
echo "✓ Verificando script de rollback..."
if [ -x "scripts/rollback-auth.sh" ]; then
    echo "  ✅ OK: Script de rollback disponível"
else
    echo "  ❌ ERRO: Script de rollback não encontrado ou sem permissão"
    ERRORS=$((ERRORS + 1))
fi

# 6. Verificar async/await bloqueante no useEffect
echo ""
echo "✓ Verificando async/await bloqueante..."
if grep "getSession().then(async" lib/auth/context.tsx; then
    echo "  ⚠️  AVISO: Async function no .then() - pode causar travamento"
    echo "            Prefira usar Promise.race() não-bloqueante"
else
    echo "  ✅ OK: Nenhum async bloqueante no getSession()"
fi

echo ""
echo "=========================================="
if [ "$ERRORS" -eq 0 ]; then
    echo "✅ SISTEMA DE AUTH: SEGURO"
    echo ""
    echo "🎯 Próximos passos:"
    echo "   1. Testar login: npm run dev"
    echo "   2. Verificar console do navegador"
    echo "   3. Testar com usuário sem perfil no banco"
else
    echo "❌ ENCONTRADOS $ERRORS PROBLEMA(S)"
    echo ""
    echo "🔧 Correções necessárias antes de prosseguir"
fi
echo ""
