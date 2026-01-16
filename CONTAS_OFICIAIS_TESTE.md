# 🔐 CONTAS OFICIAIS DE TESTE - ELO DA ROTA

## 📋 **3 CONTAS PARA TESTAR TODOS OS PLANOS**

### 🥉 **CONTA 1 - RECRUTA**
```
Nome: Recruta Oficial
Email: recruta.teste@rotabusiness.com
CPF: 123.456.789-09
Senha: Rota@2024
Plano: RECRUTA
Limite: 0 convites/mês
```

### 🥈 **CONTA 2 - VETERANO**
```
Nome: Veterano Oficial
Email: veterano.teste@rotabusiness.com
CPF: 987.654.321-00
Senha: Rota@2024
Plano: VETERANO
Limite: 2 convites/mês
```

### 🥇 **CONTA 3 - ELITE**
```
Nome: Elite Oficial
Email: elite.teste@rotabusiness.com
CPF: 111.444.777-35
Senha: Rota@2024
Plano: ELITE
Limite: 10 convites/mês
```

---

## 🚀 **COMO CRIAR:**

### **PASSO 1: Limpar contas antigas**
Execute no Supabase: `LIMPAR_USUARIOS_TESTE.sql`

### **PASSO 2: Cadastrar as 3 contas**
Para cada conta acima:
1. Acesse: http://localhost:3001/auth/register
2. Preencha com os dados da conta
3. Cadastre
4. **NÃO FAÇA LOGIN AINDA**

### **PASSO 3: Confirmar emails**
Execute no Supabase: `CONFIRMAR_EMAILS_TESTE.sql`

### **PASSO 4: Testar login**
Faça login com cada uma das 3 contas e teste o módulo Elo da Rota

---

## ✅ **TESTES A FAZER:**

### **Com RECRUTA:**
- ✅ Ver que tem 0 convites disponíveis
- ✅ Mensagem de upgrade aparece
- ✅ Não consegue solicitar confraternização

### **Com VETERANO:**
- ✅ Ver que tem 2 convites disponíveis
- ✅ Consegue solicitar até 2 confraternizações
- ✅ Terceira tentativa deve bloquear

### **Com ELITE:**
- ✅ Ver que tem 10 convites disponíveis
- ✅ Consegue solicitar várias confraternizações
- ✅ Tem acesso a todas features

---

## 🔑 **SENHA PADRÃO PARA TODAS:** `Rota@2024`

**Use essas contas oficialmente para todos os testes do módulo!**
