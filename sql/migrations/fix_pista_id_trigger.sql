-- ===============================================
-- FIX: Adicionar pista_id no handle_new_user
-- Problema: pista_id não era salvo durante cadastro
-- ===============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- 1. Criar perfil COM PISTA_ID
    INSERT INTO public.profiles (
        id, email, full_name, cpf, role, rota_number, pista_id, verification_status
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NEW.raw_user_meta_data->>'rota_number',
        (NEW.raw_user_meta_data->>'pista')::uuid,  -- FIX: salvar pista_id
        'pending'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- 2. Criar plano (Recruta grátis por padrão)
    INSERT INTO public.subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, 'recruta', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 3. Criar gamificação (Patente Novato, 0 pontos)
    INSERT INTO public.user_gamification (user_id, current_rank_id, total_points, total_medals)
    VALUES (NEW.id, 'novato', 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$function$;
