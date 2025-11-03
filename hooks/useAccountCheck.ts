import { useAccounts } from "./queries/useAccounts";

/**
 * Hook to check if user has any accounts created
 * Used to enforce account creation before allowing transactions
 */
export function useAccountCheck() {
  const { data: accounts = [], isLoading } = useAccounts();
  const hasAccounts = accounts.length > 0;
  const accountCount = accounts.length;

  return {
    hasAccounts,
    accountCount,
    isLoading,
    accounts,
  };
}
