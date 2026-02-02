# 🔗 CONTEXTO DO PROJETO

> Este arquivo foi movido para: `.agent/context/CONTEXTO_PROJETO.md`

Para ler o contexto completo, peça ao assistente:

```
"Leia .agent/context/CONTEXTO_PROJETO.md"
```

---

## 📁 Nova Estrutura

O projeto foi reorganizado! Veja `.agent/ESTRUTURA_PROJETO.md` para a documentação completa.

### Pastas Principais:
- **`.agent/context/`** - Contexto do projeto e AGENTS.md
- **`.agent/team/`** - Especialistas virtuais
- **`.agent/workflows/`** - Comandos de ativação
- **`sql/`** - Scripts SQL organizados por categoria
- **`docs/`** - Documentação organizada

### Comandos de Especialistas:
- `/lucas-ux` - UI/UX Designer
- `/rafael-dba` - Arquiteto de Banco de Dados  
- `/carlos-backend` - Backend Developer
- `/marina-frontend` - Frontend Developer

---

## ⚠️ DOCUMENTOS CRÍTICOS

Antes de trabalhar, **LEIA OBRIGATORIAMENTE**:

📊 **[FONTE_DADOS_GAMIFICACAO.md](docs/FONTE_DADOS_GAMIFICACAO.md)** - Única fonte de verdade para VIGOR/XP

🎯 **[AVATARES_E_BADGES.md](docs/AVATARES_E_BADGES.md)** - **DOCUMENTAÇÃO COMPLETA** de todos os avatares e badges de patente do sistema

🖼️ **[PADRAO_AVATAR.md](docs/PADRAO_AVATAR.md)** - Padrão de avatares (frame quadrada, patente no canto direito)

🔧 **[lib/constants/plan-limits.ts](lib/constants/plan-limits.ts)** - **FONTE ÚNICA** de limites de planos (categorias, anúncios, confraternities) - NUNCA usar plan_config ou hardcoded!
