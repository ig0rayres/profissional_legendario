---
description: Regra para manter ESCOPO_PROJETO.md sincronizado com alterações no admin
---

# 📋 Sincronização Admin → ESCOPO_PROJETO

## Regra Obrigatória

**Toda alteração no painel admin que afete configurações do sistema DEVE ser refletida no documento `docs/ESCOPO_PROJETO.md`.**

## Quando Atualizar

Sempre que modificar:

1. **Planos** (`/admin/financeiro`)
   - Preços
   - Multiplicadores XP
   - Limites (Elos, Confrarias, Anúncios)
   - Features

2. **Gamificação** (`/admin/gamificacao`)
   - Patentes (Ranks)
   - Medalhas
   - Proezas
   - Pontuações

3. **Configurações gerais**
   - Novas funcionalidades
   - Regras de negócio

## Como Atualizar

1. Após alterar o admin, abra `docs/ESCOPO_PROJETO.md`
2. Localize a seção correspondente
3. Atualize os dados para refletir o estado atual
4. Faça commit mencionando a sincronização

## Localização das Seções no ESCOPO_PROJETO

| Área Admin | Seção no Documento |
|------------|-------------------|
| Financeiro/Planos | Seção 2 - Planos e Assinaturas |
| Gamificação | Seção 5 - Sistema de Gamificação |
| Temporadas | Seção 13 - Temporadas/Premiação |
| Indicações | Seção 12 - Sistema de Indicação |

## Exemplo de Commit

```
docs: sincroniza ESCOPO_PROJETO com alterações do admin

- Atualiza preço do plano Elite para R$127
- Adiciona novo limite de Anúncios MKT
```

---

**IMPORTANTE:** Esta regra garante que a documentação seja sempre a fonte da verdade para desenvolvedores e stakeholders.
