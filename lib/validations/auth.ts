import { z } from 'zod'

// Validação de CPF
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '')

    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false

    let sum = 0
    let remainder

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
    }

    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.substring(9, 10))) return false

    sum = 0
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
    }

    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.substring(10, 11))) return false

    return true
}

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .email('Email inválido'),
    password: z
        .string()
        .min(1, 'Senha é obrigatória')
        .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
    fullName: z
        .string()
        .min(1, 'Nome completo é obrigatório')
        .min(3, 'Nome deve ter no mínimo 3 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .email('Email inválido'),
    cpf: z
        .string()
        .min(1, 'CPF é obrigatório')
        .transform((val) => val.replace(/[^\d]/g, ''))
        .refine((val) => validateCPF(val), 'CPF inválido'),
    password: z
        .string()
        .min(1, 'Senha é obrigatória')
        .min(8, 'Senha deve ter no mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmPassword: z
        .string()
        .min(1, 'Confirmação de senha é obrigatória'),
    pista: z
        .string()
        .min(1, 'Selecione sua unidade (Pista)'),
    isProfessional: z
        .boolean()
        .default(false),
    rotaNumber: z
        .string()
        .min(1, 'ID Rota Business é obrigatório'),
    selectedPlan: z
        .string()
        .min(1, 'Você deve selecionar um plano'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
