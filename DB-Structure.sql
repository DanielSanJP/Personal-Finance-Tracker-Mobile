-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
CREATE TABLE public.accounts (
    id text NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    balance numeric NOT NULL DEFAULT 0,
    type text NOT NULL CHECK (
        type = ANY (
            ARRAY ['checking'::text, 'savings'::text, 'credit'::text, 'investment'::text]
        )
    ),
    account_number text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.budgets (
    id text NOT NULL,
    user_id uuid NOT NULL,
    category text NOT NULL,
    budget_amount numeric NOT NULL,
    spent_amount numeric DEFAULT 0,
    remaining_amount numeric DEFAULT 0,
    period text NOT NULL CHECK (
        period = ANY (
            ARRAY ['weekly'::text, 'monthly'::text, 'quarterly'::text, 'yearly'::text]
        )
    ),
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT budgets_pkey PRIMARY KEY (id),
    CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.goals (
    id text NOT NULL,
    user_id uuid NOT NULL,
    name character varying NOT NULL,
    target_amount numeric NOT NULL,
    current_amount numeric DEFAULT 0,
    target_date date,
    category text,
    priority text CHECK (
        priority = ANY (
            ARRAY ['low'::text, 'medium'::text, 'high'::text]
        )
    ),
    status text DEFAULT 'active'::text CHECK (
        status = ANY (
            ARRAY ['active'::text, 'completed'::text, 'paused'::text, 'cancelled'::text]
        )
    ),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT goals_pkey PRIMARY KEY (id),
    CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.summary (
    id integer NOT NULL DEFAULT nextval('summary_id_seq'::regclass),
    user_id uuid NOT NULL UNIQUE,
    total_balance numeric DEFAULT 0,
    monthly_change numeric DEFAULT 0,
    monthly_income numeric DEFAULT 0,
    monthly_expenses numeric DEFAULT 0,
    budget_remaining numeric DEFAULT 0,
    account_breakdown jsonb,
    category_spending jsonb,
    last_updated timestamp with time zone DEFAULT now(),
    CONSTRAINT summary_pkey PRIMARY KEY (id),
    CONSTRAINT summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.transactions (
    id text NOT NULL,
    user_id uuid NOT NULL,
    account_id text NOT NULL,
    description character varying NOT NULL,
    amount numeric NOT NULL,
    category text,
    type text NOT NULL CHECK (
        type = ANY (
            ARRAY ['income'::text, 'expense'::text, 'transfer'::text]
        )
    ),
    status text DEFAULT 'completed'::text CHECK (
        status = ANY (
            ARRAY ['pending'::text, 'completed'::text, 'cancelled'::text, 'failed'::text]
        )
    ),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    from_party text NOT NULL,
    to_party text NOT NULL,
    date timestamp with time zone NOT NULL,
    destination_account_id text,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);
CREATE TABLE public.users (
    id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    initials text,
    avatar text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
-- User Preferences Table
CREATE TABLE public.user_preferences (
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
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
-- Row Level Security (RLS) Policies for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
-- Policy: Users can only view their own preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR
SELECT USING (auth.uid() = user_id);
-- Policy: Users can only insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Policy: Users can only update their own preferences
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Policy: Users can only delete their own preferences
CREATE POLICY "Users can delete their own preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);
-- Function to auto-create default preferences when a new user signs up
CREATE OR REPLACE FUNCTION public.create_default_user_preferences() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.user_preferences (user_id)
VALUES (NEW.id);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to auto-create preferences on user creation
CREATE TRIGGER create_user_preferences_on_signup
AFTER
INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.create_default_user_preferences();