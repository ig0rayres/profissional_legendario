'use client'

/**
 * V14 - COMPLETE WITH BRAND COLORS
 * Combina Header atual + Rota do Valente V1B atual + Cards V13 (brand colors)
 * 
 * Este arquivo apenas re-exporta os componentes atuais + V13
 * para criar uma versão completa na piscina de templates
 */

// Rota do Valente atual (V1B)
export { RotaValenteV1B as RotaDoValenteV14 } from '@/components/profile/rota-valente-v1b'

// Cards V13 com cores do projeto
export {
    ProjectsCounterV13 as ProjectsCounterV14,
    ElosDaRotaV13 as ElosDaRotaV14,
    ConfraternityStatsV13 as ConfraternityStatsV14,
    NaRotaFeedV13 as NaRotaFeedV14
} from '@/components/profile/cards-v13-brand-colors'
