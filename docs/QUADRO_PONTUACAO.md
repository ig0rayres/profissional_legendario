# 🎯 QUADRO COMPLETO DE PONTUAÇÃO - ROTA BUSINESS CLUB

*Última atualização: 23/01/2026*

---

## 📊 MULTIPLICADORES POR PLANO

| Plano | Multiplicador | Exemplo (100 pts base) |
|-------|---------------|------------------------|
| **Recruta** | x1 | 100 pts |
| **Veterano** | x1.5 | 150 pts |
| **Elite** | x3 | 300 pts |

> **IMPORTANTE:** Todos os pontos listados abaixo são **valores base**. O multiplicador é aplicado automaticamente.

---

## 🏅 MEDALHAS (via `awardBadge`)

### Perfil
| Medalha | Pontos Base | Descrição | Arquivo |
|---------|-------------|-----------|---------|
| **Alistamento Concluído** | 100 | Completar perfil básico (avatar + bio) | `lib/api/profile.ts` |
| **Batismo de Excelência** | 200 | Primeira avaliação 5 estrelas | `rating-form.tsx` |

### Elos (Conexões)
| Medalha | Pontos Base | Descrição | Arquivo |
|---------|-------------|-----------|---------|
| **Presente** | 50 | Aceitar primeiro elo | `connection-button.tsx`, `notification-center.tsx`, `chat-widget.tsx`, `confraternity.ts` |

### Confrarias
| Medalha | Pontos Base | Descrição | Arquivo |
|---------|-------------|-----------|---------|
| **Primeira Confraria** | 100 | Primeira confraria realizada (total) | `confraternity.ts` |
| **Anfitrião** | 150 | Ser anfitrião de confraria | `confraternity.ts` |
| **Cronista** | 50 | Enviar foto de confraria | `confraternity.ts` |
| **Networker Ativo** | 200 | 2+ confrarias **no mês** | `confraternity.ts` |
| **Líder de Confraria** | 500 | 5+ confrarias **no mês** | `confraternity.ts` |
| **Mestre das Conexões** | 1000 | 10+ confrarias **no mês** | `confraternity.ts` |

### Mídia
| Medalha | Pontos Base | Descrição | Arquivo |
|---------|-------------|-----------|---------|
| **Cinegrafista de Campo** | 100 | Upload de mídia | `storage.ts` |

---

## ⚡ AÇÕES DIRETAS (via `awardPoints`)

### Elos (Conexões)
| Ação | Pontos Base | Descrição | Arquivo |
|------|-------------|-----------|---------|
| **Enviar Elo** | 10 | Enviar solicitação de conexão | `connection-button.tsx` |
| **Aceitar Elo** | 20 | Aceitar solicitação de conexão | `connection-button.tsx`, `notification-center.tsx`, `chat-widget.tsx` |

### Confrarias
| Ação | Pontos Base | Descrição | Arquivo |
|------|-------------|-----------|---------|
| **Criar Confraria** | 50 | Criar nova confraria | `confraternity.ts` |
| **Aceitar Convite** | 10 | Aceitar convite de confraria | `notification-center.tsx`, `confraternity.ts` |
| **Participar Confraria** | 100 | Participar de confraria (anfitrião) | `confraternity.ts` |
| **Participar Confraria** | 50 | Participar de confraria (convidado) | `confraternity.ts` |
| **Upload Foto** | 30 | Upload de foto em confraria | `confraternity.ts` |

### Portfolio
| Ação | Pontos Base | Descrição | Arquivo |
|------|-------------|-----------|---------|
| **Upload Portfolio** | 30 | Upload de imagem no portfolio | `storage.ts` |

---

## 📈 RESUMO POR CATEGORIA

### Elos (Total possível por elo completo)
- Enviar: **10 pts** (base)
- Aceitar: **20 pts** (base)
- Medalha "Presente" (1ª vez): **50 pts** (base)
- **Total 1º elo:** 80 pts base

### Confrarias (Total possível por confraria como anfitrião)
- Criar: **50 pts** (base)
- Participar (anfitrião): **100 pts** (base)
- Upload foto: **30 pts** (base)
- Medalha "Cronista" (1ª foto): **50 pts** (base)
- Medalha "Anfitrião" (1ª vez): **150 pts** (base)
- Medalha "Primeira Confraria" (1ª total): **100 pts** (base)
- **Total 1ª confraria:** 480 pts base
- **Confrarias seguintes:** 180 pts base (sem medalhas)

### Perfil
- Completar perfil: **100 pts** (base) - medalha "Alistamento Concluído"

---

## 🎯 SUGESTÕES DE AJUSTE

### Valores muito baixos (considerar aumentar):
- ❓ **Enviar Elo:** 10 → 20 pts?
- ❓ **Aceitar Convite Confraria:** 10 → 20 pts?
- ❓ **Cronista:** 50 → 100 pts? (primeira foto é importante)

### Valores muito altos (considerar reduzir):
- ❓ **Mestre das Conexões:** 1000 → 500 pts? (10 confrarias/mês é muito)
- ❓ **Líder de Confraria:** 500 → 300 pts?

### Valores OK:
- ✅ **Alistamento Concluído:** 100 pts
- ✅ **Batismo de Excelência:** 200 pts
- ✅ **Participar Confraria (anfitrião):** 100 pts
- ✅ **Aceitar Elo:** 20 pts

---

## 🔧 COMO AJUSTAR

### Para Medalhas:
```sql
-- Atualizar pontos de uma medalha
UPDATE medals 
SET points_reward = 150  -- novo valor
WHERE id = 'cronista';
```

### Para Ações Diretas:
Editar o arquivo correspondente e alterar o valor na chamada `awardPoints()`:
```typescript
// Antes
await awardPoints(userId, 10, 'elo_sent', 'Enviou solicitação de elo')

// Depois
await awardPoints(userId, 20, 'elo_sent', 'Enviou solicitação de elo')
```

---

## 📝 NOTAS

1. **Multiplicador é automático** - Não precisa calcular manualmente
2. **Medalhas são únicas** - Só podem ser ganhas uma vez
3. **Ações podem repetir** - Exceto quando há verificação anti-duplicação (elos)
4. **Valores mensais** - Medalhas como "Networker Ativo" resetam todo mês
