-- Users table
CREATE TABLE public.users (
    id         UUID PRIMARY KEY REFERENCES auth.users(id),
    email      TEXT NOT NULL UNIQUE,
    plan       TEXT NOT NULL DEFAULT 'free',
    is_admin   BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Credits table
CREATE TABLE public.user_credits (
    user_id      UUID PRIMARY KEY REFERENCES public.users(id),
    credits_left INTEGER NOT NULL DEFAULT 0,
    total_used   INTEGER NOT NULL DEFAULT 0,
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Usage audit log
CREATE TABLE public.usage_log (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES public.users(id),
    timestamp      TIMESTAMPTZ DEFAULT now(),
    image_size_kb  FLOAT,
    inference_ms   INTEGER,
    credits_before INTEGER,
    credits_after  INTEGER,
    result_url     TEXT,
    success        BOOLEAN,
    error_message  TEXT
);

-- Auto-create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    admin_email TEXT := 'koushiknagabhatla@gmail.com';
    is_admin_user BOOLEAN;
BEGIN
    is_admin_user := (NEW.email = admin_email);
    
    INSERT INTO public.users (id, email, plan, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN is_admin_user THEN 'unlimited' ELSE 'free' END,
        is_admin_user
    );
    
    INSERT INTO public.user_credits (user_id, credits_left)
    VALUES (
        NEW.id,
        CASE WHEN is_admin_user THEN 999999 ELSE 50 END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Atomic credit deduction (prevents race conditions)
CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_amount  INTEGER DEFAULT 5
)
RETURNS TABLE(
    success          BOOLEAN,
    credits_remaining INTEGER,
    message          TEXT
) AS $$
DECLARE
    current_credits INTEGER;
    user_is_admin   BOOLEAN;
BEGIN
    SELECT uc.credits_left, u.is_admin
    INTO current_credits, user_is_admin
    FROM public.user_credits uc
    JOIN public.users u ON u.id = uc.user_id
    WHERE uc.user_id = p_user_id
    FOR UPDATE;
    
    IF user_is_admin THEN
        RETURN QUERY SELECT true, current_credits,
            'Admin unlimited access'::TEXT;
        RETURN;
    END IF;
    
    IF current_credits < p_amount THEN
        RETURN QUERY SELECT false, current_credits,
            ('Need ' || p_amount || ' credits, have '
             || current_credits)::TEXT;
        RETURN;
    END IF;
    
    UPDATE public.user_credits
    SET credits_left = credits_left - p_amount,
        total_used   = total_used + p_amount,
        updated_at   = now()
    WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT true, current_credits - p_amount,
        'OK'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_log    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "own_credits" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own_logs" ON public.usage_log
    FOR SELECT USING (auth.uid() = user_id);
