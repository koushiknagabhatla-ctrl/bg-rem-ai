-- ═══════════════════════════════════════════════════════════════
-- BACKGROUND REMOVAL SAAS — SUPABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════
--
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
--
-- Business Rules:
--   Admin (koushiknagabhatla@gmail.com): unlimited, never deducted
--   Regular user: 50 free credits on signup, 5 per image removal
--   At 0 credits: blocked with 402
--
-- Security:
--   Row Level Security on all tables
--   FOR UPDATE row locking on credit deduction (race-safe)
--   SECURITY DEFINER functions run with owner privileges
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- 1. USERS TABLE
-- ─────────────────────────────────────────────────────────────
-- Mirrors auth.users with app-specific fields.

CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    plan        TEXT NOT NULL DEFAULT 'free',
    is_admin    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);


-- ─────────────────────────────────────────────────────────────
-- 2. CREDITS TABLE
-- ─────────────────────────────────────────────────────────────
-- Tracks remaining and total used credits per user.

CREATE TABLE IF NOT EXISTS public.user_credits (
    user_id      UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    credits_left INTEGER NOT NULL DEFAULT 0,
    total_used   INTEGER NOT NULL DEFAULT 0,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT credits_non_negative CHECK (credits_left >= 0)
);


-- ─────────────────────────────────────────────────────────────
-- 3. USAGE AUDIT LOG
-- ─────────────────────────────────────────────────────────────
-- Records every inference attempt for analytics and abuse detection.

CREATE TABLE IF NOT EXISTS public.usage_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),
    image_size_kb   REAL,
    inference_ms    INTEGER,
    credits_before  INTEGER,
    credits_after   INTEGER,
    success         BOOLEAN NOT NULL DEFAULT true,
    error_message   TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_usage_log_user ON public.usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_ts ON public.usage_log(timestamp DESC);


-- ═══════════════════════════════════════════════════════════════
-- 4. AUTO-CREATE USER ON SIGNUP (Trigger)
-- ═══════════════════════════════════════════════════════════════
-- Fires after a new row is inserted into auth.users.
-- Admin (koushiknagabhatla@gmail.com) gets:
--   plan = 'unlimited', is_admin = true, credits = 999999
-- Everyone else gets:
--   plan = 'free', is_admin = false, credits = 50

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    v_is_admin := (NEW.email = 'koushiknagabhatla@gmail.com');

    INSERT INTO public.users (id, email, plan, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN v_is_admin THEN 'unlimited' ELSE 'free' END,
        v_is_admin
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_credits (user_id, credits_left, total_used)
    VALUES (
        NEW.id,
        CASE WHEN v_is_admin THEN 999999 ELSE 50 END,
        0
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════
-- 5. ATOMIC CREDIT DEDUCTION FUNCTION
-- ═══════════════════════════════════════════════════════════════
-- Race-safe credit deduction using SELECT ... FOR UPDATE row lock.
--
-- How FOR UPDATE prevents race conditions:
--   Request A: SELECT ... FOR UPDATE → locks row → reads credits=10
--   Request B: SELECT ... FOR UPDATE → BLOCKS waiting for A's lock
--   Request A: UPDATE credits=5 → COMMIT → releases lock
--   Request B: lock acquired → reads credits=5 (correct!)
--
-- Without FOR UPDATE:
--   Request A: reads credits=10
--   Request B: reads credits=10 (stale!)
--   Both deduct 5 → credits = 5 instead of 0 → lost 5 credits

CREATE OR REPLACE FUNCTION public.deduct_credits(
    p_user_id UUID,
    p_amount  INTEGER DEFAULT 5
)
RETURNS TABLE(success BOOLEAN, credits_remaining INTEGER, message TEXT)
AS $$
DECLARE
    v_current_credits INTEGER;
    v_is_admin        BOOLEAN;
BEGIN
    -- Lock the row for this transaction (blocks concurrent deductions)
    SELECT uc.credits_left, u.is_admin
    INTO v_current_credits, v_is_admin
    FROM public.user_credits uc
    JOIN public.users u ON u.id = uc.user_id
    WHERE uc.user_id = p_user_id
    FOR UPDATE OF uc;

    -- Row not found
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 'User not found'::TEXT;
        RETURN;
    END IF;

    -- Admin: unlimited access, never deduct
    IF v_is_admin THEN
        RETURN QUERY SELECT true, v_current_credits, 'Admin: unlimited access'::TEXT;
        RETURN;
    END IF;

    -- Insufficient credits
    IF v_current_credits < p_amount THEN
        RETURN QUERY SELECT
            false,
            v_current_credits,
            ('Insufficient credits. Need ' || p_amount ||
             ' but have ' || v_current_credits || '. Upgrade your plan.')::TEXT;
        RETURN;
    END IF;

    -- Deduct
    UPDATE public.user_credits
    SET credits_left = credits_left - p_amount,
        total_used   = total_used + p_amount,
        updated_at   = now()
    WHERE user_id = p_user_id;

    RETURN QUERY SELECT true, (v_current_credits - p_amount), 'OK'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════
-- 6. CREDIT REFUND FUNCTION (on inference failure)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.refund_credits(
    p_user_id UUID,
    p_amount  INTEGER DEFAULT 5
)
RETURNS void AS $$
BEGIN
    UPDATE public.user_credits
    SET credits_left = credits_left + p_amount,
        total_used   = GREATEST(total_used - p_amount, 0),
        updated_at   = now()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════
-- 7. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════
-- Users can only SELECT their own rows.
-- Service role key (backend) bypasses RLS automatically.

ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_log    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_data" ON public.users;
CREATE POLICY "users_own_data" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "credits_own_data" ON public.user_credits;
CREATE POLICY "credits_own_data" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "logs_own_data" ON public.usage_log;
CREATE POLICY "logs_own_data" ON public.usage_log
    FOR SELECT USING (auth.uid() = user_id);

-- Backend inserts logs using service_role key (bypasses RLS)
-- No INSERT policy needed for regular users.

-- Grant execute on RPC functions
GRANT EXECUTE ON FUNCTION public.deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_credits TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credits TO service_role;


-- ═══════════════════════════════════════════════════════════════
-- 8. HELPER: updated_at auto-trigger
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_credits_set_updated ON public.user_credits;
CREATE TRIGGER user_credits_set_updated
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
