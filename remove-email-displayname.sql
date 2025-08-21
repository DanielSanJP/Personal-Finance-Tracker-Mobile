-- SQL Migration: Remove email and display_name from users table
-- These fields should be accessed from auth.users table instead
-- Drop the unique constraint on email first (if it exists)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;
-- Drop the email column
ALTER TABLE public.users DROP COLUMN IF EXISTS email;
-- Drop the display_name column  
ALTER TABLE public.users DROP COLUMN IF EXISTS display_name;
-- Verify the changes
SELECT column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'users'
ORDER BY ordinal_position;