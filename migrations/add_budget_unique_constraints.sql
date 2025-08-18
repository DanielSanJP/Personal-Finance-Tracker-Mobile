-- Migration: Add unique constraint for budgets to prevent duplicates
-- This ensures users can only have one budget per category per period
-- Add unique constraint to prevent duplicate budgets
-- Users should only have one budget per category per time period
ALTER TABLE public.budgets
ADD CONSTRAINT budgets_user_category_period_unique UNIQUE (user_id, category, period, start_date);
-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_category_period ON public.budgets(user_id, category, period, start_date);
-- Add a function to check for overlapping budget periods
CREATE OR REPLACE FUNCTION check_budget_overlap(
        p_user_id uuid,
        p_category text,
        p_period text,
        p_start_date date,
        p_end_date date,
        p_budget_id text DEFAULT NULL
    ) RETURNS boolean LANGUAGE plpgsql AS $$ BEGIN -- Check if there's an overlapping budget for the same user, category, and period
    IF EXISTS (
        SELECT 1
        FROM budgets
        WHERE user_id = p_user_id
            AND category = p_category
            AND period = p_period
            AND (
                p_budget_id IS NULL
                OR id != p_budget_id
            )
            AND (
                (
                    start_date <= p_start_date
                    AND end_date >= p_start_date
                )
                OR (
                    start_date <= p_end_date
                    AND end_date >= p_end_date
                )
                OR (
                    start_date >= p_start_date
                    AND end_date <= p_end_date
                )
            )
    ) THEN RETURN false;
-- Overlap found
END IF;
RETURN true;
-- No overlap
END;
$$;
-- Create a trigger function to validate budget creation/updates
CREATE OR REPLACE FUNCTION validate_budget_before_insert_update() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN -- Check for overlapping budgets
    IF NOT check_budget_overlap(
        NEW.user_id,
        NEW.category,
        NEW.period,
        NEW.start_date,
        NEW.end_date,
        CASE
            WHEN TG_OP = 'UPDATE' THEN OLD.id
            ELSE NULL
        END
    ) THEN RAISE EXCEPTION 'A budget for category "%" with period "%" already exists for the specified time range',
    NEW.category,
    NEW.period;
END IF;
RETURN NEW;
END;
$$;
-- Create triggers for insert and update
DROP TRIGGER IF EXISTS budget_validation_trigger ON public.budgets;
CREATE TRIGGER budget_validation_trigger BEFORE
INSERT
    OR
UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION validate_budget_before_insert_update();
-- Add helpful comments
COMMENT ON CONSTRAINT budgets_user_category_period_unique ON public.budgets IS 'Ensures users can only have one budget per category per period starting on the same date';
COMMENT ON FUNCTION check_budget_overlap(uuid, text, text, date, date, text) IS 'Checks if a budget would overlap with existing budgets for the same user, category, and period';
COMMENT ON FUNCTION validate_budget_before_insert_update() IS 'Trigger function that validates budget creation/updates to prevent overlapping budgets';