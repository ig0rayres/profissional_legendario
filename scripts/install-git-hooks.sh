#!/bin/bash
# 🛡️ PRE-COMMIT HOOK - Proteção de Login
# Copie para .git/hooks/pre-commit e dê permissão: chmod +x .git/hooks/pre-commit

echo "🔍 Verificando proteções de login..."

# Verificar se auth/context.tsx foi modificado
if git diff --cached --name-only | grep -q "lib/auth/context.tsx"; then
  echo "⚠️  Arquivo de autenticação modificado. Verificando..."
  
  # Verificar se usa .single()
  if git diff --cached lib/auth/context.tsx | grep -q "\.single()"; then
    echo "❌ COMMIT BLOQUEADO!"
    echo ""
    echo "🚨 Você está usando .single() no auth/context.tsx"
    echo "   Isso pode quebrar o login!"
    echo ""
    echo "✅ Use .maybeSingle() em vez de .single()"
    echo ""
    echo "Leia: .agent/workflows/PROTECAO_LOGIN.md"
    exit 1
  fi
fi

echo "✅ Proteções de login OK!"
exit 0
