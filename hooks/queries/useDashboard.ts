import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getCurrentUserBudgetsWithRealTimeSpending } from "./useBudgets";
import { useAuth } from "./useAuth";
import { queryKeys } from "@/lib/query-keys";
import type { Account, Transaction, Budget } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

// Dashboard data interface
interface DashboardData {
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  summary: {
    totalBalance: number;
    monthlyChange: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    budgetRemaining: number;
    accountBreakdown: Record<string, unknown>;
    categorySpending: Record<string, unknown>;
  };
}

// Helper function to get accounts by user ID
const getAccountsByUserId = async (userId: string): Promise<Account[]> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching accounts by user ID:', error);
      return [];
    }

    return (data || []).map(account => ({
      id: account.id,
      userId: account.user_id,
      name: account.name,
      balance: Number(account.balance),
      type: account.type,
      accountNumber: account.account_number || '',
      isActive: account.is_active
    }));
  } catch (error) {
    console.error('Error in getAccountsByUserId:', error);
    return [];
  }
};

// Helper function to get transactions by user ID
const getTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by user ID:', error);
      return [];
    }

    return (data || []).map(transaction => ({
      id: transaction.id,
      userId: transaction.user_id,
      accountId: transaction.account_id,
      date: transaction.date,
      description: transaction.description,
      amount: Number(transaction.amount),
      category: transaction.category || '',
      type: transaction.type,
      merchant: transaction.merchant || '',
      status: transaction.status || 'completed',
    }));
  } catch (error) {
    console.error('Error in getTransactionsByUserId:', error);
    return [];
  }
};

// Helper function to calculate monthly income from transactions
const calculateMonthlyIncomeFromTransactions = (transactions: Transaction[]): number => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return transactions
    .filter((transaction: Transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'income';
    })
    .reduce((total: number, transaction: Transaction) => total + Math.abs(transaction.amount), 0);
};

// Helper function to calculate monthly expenses from transactions
const calculateMonthlyExpensesFromTransactions = (transactions: Transaction[]): number => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return transactions
    .filter((transaction: Transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'expense';
    })
    .reduce((total: number, transaction: Transaction) => total + Math.abs(transaction.amount), 0);
};

// Dashboard data function
const getDashboardData = async (user: User): Promise<DashboardData | null> => {
  try {
    if (!user) {
      return null;
    }

    // Fetch all data in parallel using the user ID
    const [accounts, transactions, budgets] = await Promise.all([
      getAccountsByUserId(user.id),
      getTransactionsByUserId(user.id),
      getCurrentUserBudgetsWithRealTimeSpending()
    ]);

    // Calculate derived values from the fetched data
    const totalBalance = accounts.reduce((total: number, account: Account) => total + account.balance, 0);
    const monthlyIncome = calculateMonthlyIncomeFromTransactions(transactions);
    const monthlyExpenses = calculateMonthlyExpensesFromTransactions(transactions);
    const monthlyChange = monthlyIncome - monthlyExpenses;

    // Calculate total budget remaining across all budgets
    const budgetRemaining = budgets.reduce((total: number, budget: Budget) => total + budget.remainingAmount, 0);

    return {
      user,
      accounts,
      transactions,
      summary: {
        totalBalance,
        monthlyChange,
        monthlyIncome,
        monthlyExpenses,
        budgetRemaining,
        accountBreakdown: {},
        categorySpending: {}
      }
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return null;
  }
};

// Legacy query keys for backwards compatibility
export const DASHBOARD_QUERY_KEYS = {
  dashboardData: ["dashboard", "data"] as const,
} as const;

/**
 * Hook to fetch dashboard data
 */
export function useDashboardData() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      try {
        return await getDashboardData(user);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        throw error;
      }
    },
    enabled: isAuthenticated && !authLoading && !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to get monthly summary (computed from dashboard data)
 */
export function useMonthlySummary() {
  const { data: dashboardData, ...queryResult } = useDashboardData();

  const monthlySummary = dashboardData ? {
    income: dashboardData.summary.monthlyIncome,
    expenses: dashboardData.summary.monthlyExpenses,
    change: dashboardData.summary.monthlyChange,
  } : null;

  return {
    ...queryResult,
    data: monthlySummary,
  };
}
