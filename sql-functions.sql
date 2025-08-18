-- SQL function to create income transaction and update account balance atomically
CREATE OR REPLACE FUNCTION create_income_transaction(
        p_user_id uuid,
        p_account_id text,
        p_amount numeric,
        p_description text,
        p_category text,
        p_merchant text,
        p_date date
    ) RETURNS json LANGUAGE plpgsql AS $$
DECLARE v_transaction_id text;
v_result json;
BEGIN -- Generate unique transaction ID
v_transaction_id := 'txn_' || extract(
    epoch
    from now()
)::bigint || '_' || substr(md5(random()::text), 0, 10);
-- Insert the income transaction
INSERT INTO transactions (
        id,
        user_id,
        account_id,
        date,
        description,
        amount,
        category,
        type,
        merchant,
        status
    )
VALUES (
        v_transaction_id,
        p_user_id,
        p_account_id,
        p_date,
        p_description,
        p_amount,
        p_category,
        'income',
        p_merchant,
        'completed'
    );
-- Update the account balance (add the income amount)
UPDATE accounts
SET balance = balance + p_amount,
    updated_at = now()
WHERE id = p_account_id
    AND user_id = p_user_id;
-- Check if account was updated
IF NOT FOUND THEN RAISE EXCEPTION 'Account not found or does not belong to user';
END IF;
-- Return the created transaction details
SELECT json_build_object(
        'id',
        v_transaction_id,
        'userId',
        p_user_id,
        'accountId',
        p_account_id,
        'date',
        p_date,
        'description',
        p_description,
        'amount',
        p_amount,
        'category',
        p_category,
        'type',
        'income',
        'merchant',
        p_merchant,
        'status',
        'completed'
    ) INTO v_result;
RETURN v_result;
END;
$$;
-- SQL function to create expense transaction and update account balance atomically
CREATE OR REPLACE FUNCTION create_expense_transaction(
        p_user_id uuid,
        p_account_id text,
        p_amount numeric,
        p_description text,
        p_category text,
        p_merchant text,
        p_date date,
        p_status text DEFAULT 'completed'
    ) RETURNS json LANGUAGE plpgsql AS $$
DECLARE v_transaction_id text;
v_result json;
v_expense_amount numeric;
BEGIN -- Generate unique transaction ID
v_transaction_id := 'txn_' || extract(
    epoch
    from now()
)::bigint || '_' || substr(md5(random()::text), 0, 10);
-- Ensure expense amount is negative for storage
v_expense_amount := - ABS(p_amount);
-- Insert the expense transaction
INSERT INTO transactions (
        id,
        user_id,
        account_id,
        date,
        description,
        amount,
        category,
        type,
        merchant,
        status
    )
VALUES (
        v_transaction_id,
        p_user_id,
        p_account_id,
        p_date,
        p_description,
        v_expense_amount,
        p_category,
        'expense',
        p_merchant,
        p_status
    );
-- Update the account balance (subtract the expense amount)
UPDATE accounts
SET balance = balance - ABS(p_amount),
    updated_at = now()
WHERE id = p_account_id
    AND user_id = p_user_id;
-- Check if account was updated
IF NOT FOUND THEN RAISE EXCEPTION 'Account not found or does not belong to user';
END IF;
-- Return the created transaction details
SELECT json_build_object(
        'id',
        v_transaction_id,
        'userId',
        p_user_id,
        'accountId',
        p_account_id,
        'date',
        p_date,
        'description',
        p_description,
        'amount',
        v_expense_amount,
        'category',
        p_category,
        'type',
        'expense',
        'merchant',
        p_merchant,
        'status',
        p_status
    ) INTO v_result;
RETURN v_result;
END;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_income_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_expense_transaction TO authenticated;