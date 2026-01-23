# 🏅 Sistema de Medalhas - Regras de Negócio

> **IMPORTANTE**: Todas as medalhas DEVEM ser concedidas através da função `awardBadge()` em `lib/api/gamification.ts`

## Função Central

```typescript
import { awardBadge } from '@/lib/api/gamification'

// Conceder medalha ao usuário - ÚNICA FORMA CORRETA
await awardBadge(userId, 'medal_id')
```

## O que acontece automaticamente ao conceder uma medalha:

### 1️⃣ Multiplicador de Plano
- **Recruta**: x1 (padrão)
- **Veterano**: x1.5
- **Elite**: x3

O valor base da medalha (`points_reward` na tabela `medals`) é multiplicado automaticamente.

### 2️⃣ Pontos Creditados
- Inseridos na tabela `points_history` (fonte única de verdade)
- Trigger atualiza `user_gamification.total_points` automaticamente
- Trigger atualiza `user_season_stats.total_xp` automaticamente

### 3️⃣ Notificações (TODAS AUTOMÁTICAS)

| Tipo | Descrição | Valor |
|------|-----------|-------|
| 🎉 **Modal Central** | Popup épico com confetti | Valor MULTIPLICADO |
| 🔔 **Sino (Topo)** | Notificação na lista | Valor MULTIPLICADO |
| 💬 **Chat Sistema** | Mensagem do "Rota Business Club" | Valor MULTIPLICADO |
| 🔴 **Badge Chat** | Contador de não lidas | Incrementa +1 |

### 4️⃣ Registro da Medalha
- Salva em `user_medals` (fonte única de verdade)
- Também salva em `user_season_badges` para histórico de temporadas

## Como criar uma nova medalha

### 1. Adicionar na tabela `medals`:
```sql
INSERT INTO medals (id, name, description, icon_url, points_reward, rarity, category)
VALUES (
    'nova_medalha_id',
    'Nome da Medalha',
    'Descrição do que precisa fazer para ganhar',
    '/medals/icone.svg',
    100,  -- Pontos base (será multiplicado pelo plano)
    'common',  -- common, uncommon, rare, epic, legendary
    'general'  -- categoria
);
```

### 2. Implementar a lógica de concessão:
```typescript
// Em qualquer lugar do código onde a condição for atendida:
import { awardBadge } from '@/lib/api/gamification'

// ISSO É TUDO QUE VOCÊ PRECISA FAZER!
await awardBadge(userId, 'nova_medalha_id')
// Tudo mais (notificações, pontos, chat) é automático!
```

## Medalhas Ativas

| ID | Nome | Pontos Base | Trigger |
|----|------|-------------|---------|
| `alistamento_concluido` | Alistamento Concluído | 100 | Perfil 100% completo |
| `presente` | Presente | 50 | Primeiro elo aceito |
| `primeira_confraria` | Primeira Confraria | 100 | Primeira confraria realizada (total) |
| `anfitriao` | Anfitrião | 150 | Ser anfitrião de confraria |
| `cronista` | Cronista | 50 | Enviar foto de confraria |
| `networker_ativo` | Networker Ativo | 200 | 2+ confrarias **no mês** |
| `lider_confraria` | Líder de Confraria | 500 | 5+ confrarias **no mês** |
| `mestre_conexoes` | Mestre das Conexões | 1000 | 10+ confrarias **no mês** |
| `batismo_excelencia` | Batismo de Excelência | 200 | Primeira avaliação 5 estrelas |
| `cinegrafista_campo` | Cinegrafista de Campo | 100 | Upload de mídia |


## Usuário Sistema (Chat)

- **ID**: `00000000-0000-0000-0000-000000000000`
- **Nome**: Rota Business Club
- **Avatar**: `/logo-rota-icon.png`
- **Função**: Envia mensagens automáticas de conquistas

## ⚠️ NUNCA faça:

1. **Inserir diretamente em `user_medals`** - Use `awardBadge()`
2. **Inserir diretamente em `points_history` para medalha** - Use `awardBadge()`
3. **Criar notificação manual de medalha** - `awardBadge()` já faz isso
4. **Calcular multiplicador manualmente** - `awardBadge()` já faz isso
5. **Enviar mensagem do sistema manualmente** - `awardBadge()` já faz isso

## Fluxo Completo

```
Usuário completa ação → awardBadge(userId, medalId)
                           ↓
                    Busca medalha na tabela
                           ↓
                    Busca plano do usuário
                           ↓
                    Calcula: pontos × multiplicador
                           ↓
    ┌──────────────────────┼──────────────────────┐
    ↓                      ↓                      ↓
user_medals         points_history          notifications
                           ↓                      ↓
                    Trigger DB             Modal + Sino
                           ↓                      ↓
                user_gamification      Chat Sistema (API)
```

---

*Última atualização: 2026-01-20*
