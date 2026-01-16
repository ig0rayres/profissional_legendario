-- =============================================
-- ADICIONAR COLUNA ROTA_NUMBER E TORNÁ-LA ÚNICA
-- =============================================

-- PASSO 1: Adicionar coluna se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'rota_number'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN rota_number TEXT;
        
        RAISE NOTICE '✅ Coluna rota_number criada';
    ELSE
        RAISE NOTICE 'ℹ️  Coluna rota_number já existe';
    END IF;
END $$;

-- PASSO 2: Adicionar constraint UNIQUE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_rota_number_unique'
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_rota_number_unique UNIQUE (rota_number);
        
        RAISE NOTICE '✅ Constraint UNIQUE adicionada';
    ELSE
        RAISE NOTICE 'ℹ️  Constraint UNIQUE já existe';
    END IF;
END $$;

-- PASSO 3: Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_rota_number 
ON public.profiles(rota_number) 
WHERE rota_number IS NOT NULL;

-- Verificar resultado
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'rota_number';

SELECT 
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND constraint_name = 'profiles_rota_number_unique';
