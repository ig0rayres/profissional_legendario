-- Rota do Valente - Automation Triggers

-- Function to Award Badge
create or replace function public.award_badge(p_user_id uuid, p_badge_id text)
returns boolean
language plpgsql
security definer
as $$
declare
    v_xp_reward integer;
    v_badge_name text;
begin
    -- 1. Check if user already has the badge
    if exists (select 1 from public.user_badges where user_id = p_user_id and badge_id = p_badge_id) then
        return false;
    end if;

    -- 2. Get Badge Info
    select xp_reward, name into v_xp_reward, v_badge_name 
    from public.badges 
    where id = p_badge_id;

    if not found then return false; end if;

    -- 3. Insert user badge record
    insert into public.user_badges (user_id, badge_id) 
    values (p_user_id, p_badge_id)
    on conflict do nothing;

    -- 4. Award XP via the engine
    perform public.add_user_xp(
        p_user_id, 
        v_xp_reward, 
        'badge_reward', 
        'Conquista desbloqueada: ' || v_badge_name,
        jsonb_build_object('badge_id', p_badge_id)
    );

    return true;
end;
$$;

-- 1. Trigger for Profile Completion (Alistamento Concluído)
create or replace function public.check_profile_completion_reward()
returns trigger
language plpgsql
security definer
as $$
begin
    -- Check if all critical fields are present
    if new.full_name is not null 
       and new.cpf is not null 
       and new.bio is not null 
       and new.phone is not null 
       and new.top_id is not null 
       and new.avatar_url is not null
       and (new.skills is not null and array_length(new.skills, 1) > 0)
    then
        -- Try to award badge
        perform public.award_badge(new.id, 'alistamento_concluido');
    end if;
    return new;
end;
$$;

create trigger on_profile_update_gamification
    after update of full_name, cpf, bio, phone, top_id, avatar_url, skills on public.profiles
    for each row execute procedure public.check_profile_completion_reward();

-- 2. Trigger for Project Status Changes (Contratos e Serviços)
create or replace function public.handle_project_gamification()
returns trigger
language plpgsql
security definer
as $$
begin
    -- A) Fechar Contrato (Status: pending -> accepted)
    if old.status = 'pending' and new.status = 'accepted' then
        -- Award XP to professional (Assuming professional_id is the earner)
        perform public.add_user_xp(
            new.professional_id, 
            150, 
            'contract_closed', 
            'Contrato aceito via plataforma'
        );
        -- Try award badge if it is the first
        perform public.award_badge(new.professional_id, 'primeiro_sangue');
    end if;

    -- B) Serviço Concluído (Status: accepted -> completed)
    if old.status = 'accepted' and new.status = 'completed' then
        -- Award Base XP
        perform public.add_user_xp(
            new.professional_id, 
            100, 
            'service_completed', 
            'Serviço finalizado'
        );
        -- Try award badge if it is the first service
        perform public.award_badge(new.professional_id, 'missao_cumprida');
        
        -- Check for "Veterano de Guerra" (20 services)
        if (select count(*) from public.project_requests where professional_id = new.professional_id and status = 'completed') >= 20 then
            perform public.award_badge(new.professional_id, 'veterano_guerra');
        end if;
    end if;

    return new;
end;
$$;

create trigger on_project_status_change_gamification
    after update of status on public.project_requests
    for each row execute procedure public.handle_project_gamification();

-- 3. Trigger for Ratings (Batismo de Excelência)
create or replace function public.handle_rating_gamification()
returns trigger
language plpgsql
security definer
as $$
begin
    if new.rating = 5 then
        -- Award XP
        perform public.add_user_xp(
            new.professional_id, 
            50, 
            'five_star_rating', 
            'Avaliação 5 estrelas recebida'
        );
        
        -- Try award badge for first 5 star
        perform public.award_badge(new.professional_id, 'batismo_excelencia');
        
        -- Check for "Inabalável" (Average 5 after 5 jobs)
        -- This is a bit expensive, might be better to check only if job count >= 5
        if (select count(*) from public.ratings where professional_id = new.professional_id) >= 5 then
            if (select avg(rating) from public.ratings where professional_id = new.professional_id) >= 5 then
                perform public.award_badge(new.professional_id, 'inabalavel');
            end if;
        end if;
    end if;
    return new;
end;
$$;

create trigger on_rating_insert_gamification
    after insert on public.ratings
    for each row execute procedure public.handle_rating_gamification();

-- 4. Initial Portfolio/Report Check (Cinegrafista de Campo)
create or replace function public.handle_portfolio_gamification()
returns trigger
language plpgsql
security definer
as $$
begin
    -- Award XP for upload
    perform public.add_user_xp(
        new.user_id, 
        20, 
        'portfolio_upload', 
        'Novo item adicionado ao portfólio'
    );
    -- Award Badge for first upload
    perform public.award_badge(new.user_id, 'cinegrafista_campo');
    return new;
end;
$$;

create trigger on_portfolio_insert_gamification
    after insert on public.portfolio_items
    for each row execute procedure public.handle_portfolio_gamification();
