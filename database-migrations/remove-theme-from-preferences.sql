-- Migration: Remove theme column from user_preferences table
-- Theme is now managed locally via AsyncStorage/localStorage only
-- Date: 2025-10-25
-- Drop the theme column from user_preferences
ALTER TABLE user_preferences DROP COLUMN IF EXISTS theme;
-- Add comment to table explaining theme is managed locally
COMMENT ON TABLE user_preferences IS 'User preferences stored in database. Theme preference is managed locally via device storage.';