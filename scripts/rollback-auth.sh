#!/bin/bash
# Script de Rollback Automático do Sistema de Auth

echo "🔙 ROLLBACK DO SISTEMA DE AUTENTICAÇÃO"
echo "======================================"
echo ""

# Encontrar último backup
LAST_BACKUP=$(git tag -l "auth-backup-*" | sort -r | head -n1)

if [ -z "$LAST_BACKUP" ]; then
    echo "⚠️  Nenhum backup automático encontrado"
    echo "📍 Usando commit fixo conhecido: 7bead282"
    echo ""
    read -p "Continuar com commit 7bead282? (s/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git checkout 7bead282 -- lib/auth/context.tsx app/auth/login/page.tsx middleware.ts
        echo "✅ Arquivos restaurados do commit 7bead282"
    else
        echo "❌ Rollback cancelado"
        exit 1
    fi
else
    echo "✅ Backup encontrado: $LAST_BACKUP"
    echo ""
    git checkout $LAST_BACKUP -- lib/auth/context.tsx app/auth/login/page.tsx middleware.ts
    echo "✅ Arquivos de autenticação restaurados!"
fi

echo ""
echo "📋 Próximos passos:"
echo "   1. Reinicie o servidor: npm run dev"
echo "   2. Teste o login"
echo "   3. Se funcionar, faça: git add -A && git commit -m '🔙 Rollback auth para versão funcional'"
echo ""
