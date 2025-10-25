-- Migration: Create user_preferences table
-- Date: 2025-10-25
-- Description: Add user preferences table for storing theme, currency, language, notifications, and display settings
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    -- Appearance Settings
    theme text DEFAULT 'Light'::text CHECK (
        theme = ANY (
            ARRAY ['Light'::text, 'Dark'::text, 'system'::text]
        )
    ),
    currency text DEFAULT 'USD'::text CHECK (
        currency = ANY (
            ARRAY ['USD'::text, 'EUR'::text, 'GBP'::text, 'CAD'::text, 'AUD'::text, 'NZD'::text]
        )
    ),
    language text DEFAULT 'English'::text CHECK (
        language = ANY (
            ARRAY ['English'::text, 'Español'::text, 'Français'::text, 'Deutsch'::text, 'Italiano'::text]
        )
    ),
    -- Notification Settings
    email_notifications boolean DEFAULT true,
    budget_alerts boolean DEFAULT true,
    goal_reminders boolean DEFAULT false,
    weekly_reports boolean DEFAULT true,
    -- Display Options
    show_account_numbers boolean DEFAULT false,
    compact_view boolean DEFAULT false,
    show_cents boolean DEFAULT true,
    -- Metadata
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
    CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
-- Enable Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
-- RLS Policy: Users can only view their own preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR
SELECT USING (auth.uid() = user_id);
-- RLS Policy: Users can only insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- RLS Policy: Users can only update their own preferences
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- RLS Policy: Users can only delete their own preferences
CREATE POLICY "Users can delete their own preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);
-- Function to auto-create default preferences when a new user signs up
CREATE OR REPLACE FUNCTION public.create_default_user_preferences() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.user_preferences (user_id)
VALUES (NEW.id);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to auto-create preferences on user creation
DROP TRIGGER IF EXISTS create_user_preferences_on_signup ON public.users;
CREATE TRIGGER create_user_preferences_on_signup
AFTER
INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.create_default_user_preferences();
-- Backfill: Create default preferences for existing users (if any)
INSERT INTO public.user_preferences (user_id)
SELECT id
FROM public.users
WHERE id NOT IN (
        SELECT user_id
        FROM public.user_preferences
    ) ON CONFLICT (user_id) DO NOTHING;