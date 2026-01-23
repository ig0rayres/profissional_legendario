# 🎯 AUDITORIA COMPLETA - SISTEMA DE PONTUAÇÃO

*Data: 23/01/2026 13:40*

---

## ✅ PAINEL ADMIN - STATUS

### 📍 Localização: `/admin/game`

**O que está centralizado:**
- ✅ **MEDALHAS** - Tabela `medals` (CRUD completo)
  - Nome, descrição, ícone, pontos base, categoria
  - Criar, editar, excluir medalhas
  - **TODOS os pontos de medalhas são gerenciados aqui!**

- ✅ **PATENTES** - Tabela `ranks` (CRUD completo)
  - Nome, nível, pontos necessários, ícone, cor, descrição
  - Criar, editar, excluir patentes

**O que NÃO está centralizado:**
- ❌ **AÇÕES DIRETAS** (hardcoded no código)
  - Enviar elo: 10 pts
  - Aceitar elo: 20 pts
  - Criar confraria: 50 pts
  - Aceitar convite: 10 pts
  - Participar (anfitrião): 100 pts
  - Participar (convidado): 50 pts
  - Upload foto confraria: 30 pts
  - Upload portfolio: 30 pts

---

## 📊 TODAS AS FORMAS DE PONTUAR

### 1️⃣ MEDALHAS (via tabela `medals` - ADMIN)

| ID | Nome | Pts Base | Trigger | Arquivo | Admin? |
|----|------|----------|---------|---------|--------|
| `alistamento_concluido` | Alistamento Concluído | 100 | Perfil completo | `lib/api/profile.ts` | ✅ |
| `batismo_excelencia` | Batismo de Excelência | 200 | 1ª avaliação 5★ | `rating-form.tsx` | ✅ |
| `presente` | Presente | 50 | 1º elo aceito | `connection-button.tsx` | ✅ |
| `primeira_confraria` | Primeira Confraria | 100 | 1ª confraria total | `confraternity.ts` | ✅ |
| `anfitriao` | Anfitrião | 150 | 1ª vez anfitrião | `confraternity.ts` | ✅ |
| `cronista` | Cronista | 50 | 1ª foto confraria | `confraternity.ts` | ✅ |
| `networker_ativo` | Networker Ativo | 200 | 2+ confrarias/mês | `confraternity.ts` | ✅ |
| `lider_confraria` | Líder de Confraria | 500 | 5+ confrarias/mês | `confraternity.ts` | ✅ |
| `mestre_conexoes` | Mestre das Conexões | 1000 | 10+ confrarias/mês | `confraternity.ts` | ✅ |
| `cinegrafista_campo` | Cinegrafista de Campo | 100 | Upload mídia | `storage.ts` | ✅ |

**Total: 10 medalhas** - ✅ **TODAS gerenciadas pelo admin!**

---

### 2️⃣ AÇÕES DIRETAS (hardcoded - NÃO ADMIN)

| Ação | Pts Base | Arquivo | Linha | Admin? |
|------|----------|---------|-------|--------|
| **Enviar Elo** | 10 | `connection-button.tsx` | 158 | ❌ |
| **Aceitar Elo** | 20 | `connection-button.tsx` | 209 | ❌ |
| **Aceitar Elo** | 20 | `notification-center.tsx` | 175 | ❌ |
| **Aceitar Elo** | 20 | `chat-widget.tsx` | 234 | ❌ |
| **Criar Confraria** | 50 | `confraternity.ts` | 204 | ❌ |
| **Aceitar Convite** | 10 | `notification-center.tsx` | 299 | ❌ |
| **Aceitar Convite** | 10 | `confraternity.ts` | 257 | ❌ |
| **Participar (anfitrião)** | 100 | `confraternity.ts` | 425 | ❌ |
| **Participar (convidado)** | 50 | `confraternity.ts` | 434 | ❌ |
| **Upload Foto Confraria** | 30 | `confraternity.ts` | 458 | ❌ |
| **Upload Portfolio** | 30 | `storage.ts` | 127 | ❌ |

**Total: 11 ações** - ❌ **NENHUMA gerenciada pelo admin!**

---

## 🎯 RECOMENDAÇÕES

### 🔴 CRÍTICO - Centralizar Ações no Admin

**Problema:** Valores hardcoded espalhados em 5 arquivos diferentes.

**Solução:** Criar tabela `point_actions` no banco:

```sql
CREATE TABLE point_actions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points_base INTEGER NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir ações existentes
INSERT INTO point_actions (id, name, points_base, category) VALUES
('elo_sent', 'Enviar Elo', 10, 'connections'),
('elo_accepted', 'Aceitar Elo', 20, 'connections'),
('confraternity_created', 'Criar Confraria', 50, 'confraternity'),
('confraternity_accepted', 'Aceitar Convite', 10, 'confraternity'),
('confraternity_host', 'Participar (Anfitrião)', 100, 'confraternity'),
('confraternity_guest', 'Participar (Convidado)', 50, 'confraternity'),
('confraternity_photo', 'Upload Foto Confraria', 30, 'confraternity'),
('portfolio_upload', 'Upload Portfolio', 30, 'portfolio');
```

**Refatorar `awardPoints`:**
```typescript
// Antes (hardcoded)
await awardPoints(userId, 10, 'elo_sent', 'Enviou elo')

// Depois (dinâmico)
await awardPointsForAction(userId, 'elo_sent')
```

---

### 🟡 MÉDIO - Adicionar aba no Admin

Adicionar terceira aba em `/admin/game`:
- Patentes
- Medalhas
- **➕ Ações** (nova!)

---

### 🟢 BAIXO - Revisar valores

Após centralizar, revisar:
- Enviar Elo: 10 → 20?
- Cronista: 50 → 100?
- Mestre Conexões: 1000 → 500?

---

## 📈 RESUMO EXECUTIVO

| Item | Quantidade | Centralizado? | Ação |
|------|------------|---------------|------|
| **Medalhas** | 10 | ✅ SIM | OK |
| **Patentes** | N/A | ✅ SIM | OK |
| **Ações** | 11 | ❌ NÃO | **URGENTE** |

**Status geral:** 🟡 **PARCIALMENTE CENTRALIZADO**

**Próximo passo:** Criar tabela `point_actions` e refatorar código.
