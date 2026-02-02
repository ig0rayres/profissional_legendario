-- Trigger para criar perfil automaticamente quando usuário é cadastrado
-- Executado AFTER INSERT em auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Criar profile com dados do raw_user_meta_data
    INSERT INTO public.profiles (
        id, email, full_name, cpf, role, rota_number, pista_id, verification_status
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NULLIF(NEW.raw_user_meta_data->>'cpf', ''),  -- CPF pode ser NULL
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NEW.raw_user_meta_data->>'rota_number',
        (NEW.raw_user_meta_data->>'pista')::uuid,
        'pending'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Criar plano (usa o plano escolhido ou recruta como padrão)
    INSERT INTO public.subscriptions (user_id, plan_id, status)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'plan', 'recruta'), 
        'active'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- 3. Criar gamificação (Patente Recruta, 0 pontos)
    INSERT INTO public.user_gamification (user_id, current_rank_id, total_points, total_medals)
    VALUES (NEW.id, 'recruta', 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger já existe, só precisamos garantir que está ativo
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- IMPORTANTE: CPF deve permitir NULL
-- ALTER TABLE profiles ALTER COLUMN cpf DROP NOT NULL;
