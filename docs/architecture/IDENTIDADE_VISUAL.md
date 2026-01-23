# IDENTIDADE VISUAL - ROTA BUSINESS CLUB
## Diretrizes de Design - OBRIGATÓRIO

---

## ESTILO: RÚSTICO / MILITAR / EMPRESARIAL

**Público:** Homens empresários
**Tom:** Sério, robusto, profissional
**Inspiração:** Expedição, tribo, caça, selva

---

## PALETA DE CORES (DO PROJETO)

```
PRIMARY (Verde Floresta):    hsl(166, 40%, 17%)  #1E4D40
SECONDARY (Laranja Cume):    hsl(25, 100%, 40%)  #CC5500
BACKGROUND (Cinza Base):     hsl(0, 0%, 90%)     #E5E5E5
FOREGROUND (Charcoal):       hsl(228, 19%, 22%)  #2D3142
```

**PROIBIDO:**
- Cores vibrantes/neon
- Rosa, roxo, azul claro
- Gradientes coloridos demais

---

## TIPOGRAFIA

```
TÍTULOS:   Montserrat ExtraBold (800)
           UPPERCASE
           letter-spacing: -0.02em

CORPO:     Inter (400, 500, 700)
           Normal case
```

---

## ÍCONES

**USAR:** Lucide React - variantes sólidas/outline simples

**ÍCONES APROVADOS:**
- Shield (escudo)
- Sword / Swords (espadas)
- Target / Crosshair (mira)
- Flame (fogo/vigor)
- Trophy (troféu)
- Medal (medalha)
- Users (grupo)
- Mountain (montanha)
- Compass (bússola)
- Map / MapPin (mapa)
- Flag (bandeira)
- Briefcase (maleta)
- Calendar (agenda)
- MessageSquare (mensagem)

**PROIBIDO:**
- Emojis coloridos
- Ícones "fofos" ou arredondados
- Sparkles, Hearts, Stars coloridas

---

## COMPONENTES

### BOTÕES
```css
/* Primário */
bg-primary text-white font-bold uppercase tracking-widest
border: none
hover: bg-primary/90

/* Secundário/Destaque */
bg-secondary text-white font-bold uppercase tracking-widest
hover: bg-secondary/90

/* Outline */
border-2 border-primary text-primary bg-transparent
hover: bg-primary/10
```

### CARDS
```css
/* Padrão */
glass-strong border-primary/20

/* Destaque */
glass-strong border-secondary/30 bg-secondary/5

/* SEM bordas arredondadas demais - máximo rounded-lg */
```

### TEXTOS
```css
/* Títulos de seção */
text-[10px] font-black uppercase tracking-widest text-slate-400

/* Títulos principais */
text-2xl font-black text-white text-impact uppercase

/* Labels/subtítulos */
text-xs font-bold uppercase tracking-wide
```

---

## EFEITOS VISUAIS

**PERMITIDO:**
- Glassmorphism sutil (glass, glass-strong)
- Sombras suaves
- Hover com scale pequeno (1.02-1.05)
- Transições suaves (duration-300)
- Glow laranja sutil (glow-orange)

**PROIBIDO:**
- Animações exageradas
- Bounce effects
- Cores piscando
- Gradientes multicoloridos

---

## EXEMPLOS DE LABELS

```
RUIM:                          BOM:
🎉 Parabéns!                   MISSÃO CUMPRIDA
💖 Amigos                      ELOS
🌟 Conquistas                  CONQUISTAS
✨ Medalhas                    MEDALHAS
🎯 Metas                       OBJETIVOS
```

---

## NOMENCLATURA

| GENÉRICO | ROTA BUSINESS |
|----------|---------------|
| Amigos | ELOS |
| Followers | CONEXÕES |
| Pontos | VIGOR |
| Level | PATENTE |
| Badges | MEDALHAS |
| Events | CONFRARIAS |
| Chat | COMUNICAÇÃO |
| Feed | MURAL |

---

## CHECKLIST ANTES DE IMPLEMENTAR UI

- [ ] Cores são do tema? (verde/laranja/cinza)
- [ ] Fonte é Montserrat/Inter?
- [ ] Títulos são UPPERCASE?
- [ ] Sem emojis coloridos?
- [ ] Ícones são do Lucide (sólidos)?
- [ ] Tom é masculino/profissional?
- [ ] Efeitos são sutis?

---

**MANTRA: RÚSTICO, SÓBRIO, EMPRESARIAL**
