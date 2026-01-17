# 🧪 URLS PARA TESTAR - PERFIS COMPLETOS

## 📋 USUÁRIOS DE TESTE:

### 1. **RECRUTA** (Multiplicador x1.0)
```
URL: http://localhost:3000/professional/efed140e-14e1-456c-b6df-643c974106a3
Nome: Usuario Recruta
Email: recruta@rotabusiness.com.br
Plano: Recruta (badge cinza)
```

### 2. **VETERANO** (Multiplicador x1.5)
```
URL: http://localhost:3000/professional/458489a5-49d1-41a5-9d79-c36c0752e7b6
Nome: Usuario Veterano
Email: veterano@rotabusiness.com.br
Plano: Veterano (badge azul)
```

### 3. **ELITE** (Multiplicador x3.0)
```
URL: http://localhost:3000/professional/ccdc0524-6803-4017-b08c-944785e14338
Nome: Usuario Elite
Email: elite@rotabusiness.com.br
Plano: Elite (badge roxo)
```

---

## ✅ CHECKLIST DE TESTES:

Para CADA perfil, verifique:

### **Header:**
- [ ] Avatar aparece (ou inicial do nome)
- [ ] Badge do plano no canto inferior direito do avatar
- [ ] Nome completo
- [ ] Localização (se preenchida)
- [ ] ID Rota (badge)
- [ ] Bio (se preenchida)

### **Card Gamificação:**
- [ ] Patente atual com ícone verde
- [ ] Próxima patente (se não for Lenda)
- [ ] Barra de progresso
- [ ] Pontos atuais/necessários
- [ ] Plano com multiplicador correto
- [ ] Vigor (pontos totais)
- [ ] Medalhas conquistadas

### **Grid de Medalhas:**
- [ ] Grid 4x4 visível
- [ ] Medalhas NÃO conquistadas: opacas + ícone de cadeado
- [ ] Medalhas conquistadas: coloridas (laranja)
- [ ] Hover mostra tooltip com detalhes
- [ ] Barra de progresso no final
- [ ] Contagem X de 16

### **Stats de Confraria:**
- [ ] Total criadas
- [ ] Total participou
- [ ] Total fotos
- [ ] Próximo evento (ou "Nenhum evento agendado")
- [ ] Botões: Criar Evento | Ver Galeria

### **Sidebar:**
- [ ] Email
- [ ] Telefone (se preenchido)
- [ ] Card de orçamento (desabilitado)

---

## 🎯 O QUE ESPERAR:

### **Recruta (x1.0):**
- Patente: Novato (0 pts)
- Vigor: 0 pontos
- Medalhas: 0 de 16
- Badge cinza

### **Veterano (x1.5):**
- Patente: Novato (0 pts)
- Vigor: 0 pontos
- Medalhas: 0 de 16
- Badge azul

### **Elite (x3.0):**
- Patente: Novato (0 pts)
- Vigor: 0 pontos
- Medalhas: 0 de 16
- Badge roxo

*(Todos começam zerados - medalhas serão conquistadas quando implementarmos os triggers)*

---

## 📸 TESTE VISUAL:

1. Acesse cada URL
2. Tire screenshot
3. Verifique se layout está bonito e responsivo
4. Confirme que badges de plano estão corretos

---

## ⚠️ SE DER ERRO:

1. Veja console do navegador (F12)
2. Veja terminal do npm run dev
3. Me envie o erro exato

---

**Teste agora e me diga se está tudo funcionando!** 🚀
