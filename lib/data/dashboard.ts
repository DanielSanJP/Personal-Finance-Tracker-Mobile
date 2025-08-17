import { supabase } from '../supabase'
import { getCurrentUser } from '../auth'
import { getCurrentUserAccounts } from './accounts'
import { getCurrentUserTransactions } from './transactions'
import { getActiveBudgets } from './budgets'
import type { Summary } from '../types'

// Dashboard/Summary functions
export const getCurrentUserSummary = async (): Promise<Summary | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  
  try {
    const { data, error } = await supabase
      .from('summary')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching summary:', error)
      return null
    }

    if (!data) {
      // Generate summary if none exists
      return await generateUserSummary()
    }

    return {
      id: data.id,
      userId: data.user_id,
      totalBalance: Number(data.total_balance),
      monthlyChange: Number(data.monthly_change),
      monthlyIncome: Number(data.monthly_income),
      monthlyExpenses: Number(data.monthly_expenses),
      budgetRemaining: Number(data.budget_remaining),
      accountBreakdown: data.account_breakdown || {},
      categorySpending: data.category_spending || {},
      lastUpdated: data.last_updated
    }
  } catch (error) {
    console.error('Error in getCurrentUserSummary:', error)
    return null
  }
}

export const generateUserSummary = async (): Promise<Summary | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    // Get all user data
    const [accounts, transactions, budgets] = await Promise.all([
      getCurrentUserAccounts(),
      getCurrentUserTransactions(),
      getActiveBudgets()
    ])

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

    // Calculate monthly stats (current month)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyChange = monthlyIncome - monthlyExpenses

    // Calculate budget remaining
    const budgetRemaining = budgets.reduce((sum, budget) => sum + budget.remainingAmount, 0)

    // Calculate account breakdown
    const accountBreakdown: Record<string, number> = {}
    accounts.forEach(account => {
      accountBreakdown[account.type] = (accountBreakdown[account.type] || 0) + account.balance
    })

    // Calculate category spending
    const categorySpending: Record<string, number> = {}
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Other'
        categorySpending[category] = (categorySpending[category] || 0) + transaction.amount
      })

    const summaryData: Summary = {
      userId: user.id,
      totalBalance,
      monthlyChange,
      monthlyIncome,
      monthlyExpenses,
      budgetRemaining,
      accountBreakdown,
      categorySpending,
      lastUpdated: new Date().toISOString()
    }

    // Save or update summary in database
    const { data, error } = await supabase
      .from('summary')
      .upsert({
        user_id: summaryData.userId,
        total_balance: summaryData.totalBalance,
        monthly_change: summaryData.monthlyChange,
        monthly_income: summaryData.monthlyIncome,
        monthly_expenses: summaryData.monthlyExpenses,
        budget_remaining: summaryData.budgetRemaining,
        account_breakdown: summaryData.accountBreakdown,
        category_spending: summaryData.categorySpending,
        last_updated: summaryData.lastUpdated
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving summary:', error)
      // Return calculated summary even if save fails
      return summaryData
    }

    return {
      id: data.id,
      userId: data.user_id,
      totalBalance: Number(data.total_balance),
      monthlyChange: Number(data.monthly_change),
      monthlyIncome: Number(data.monthly_income),
      monthlyExpenses: Number(data.monthly_expenses),
      budgetRemaining: Number(data.budget_remaining),
      accountBreakdown: data.account_breakdown || {},
      categorySpending: data.category_spending || {},
      lastUpdated: data.last_updated
    }
  } catch (error) {
    console.error('Error in generateUserSummary:', error)
    return null
  }
}

// Get dashboard overview data
export const getDashboardOverview = async () => {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    const [summary, accounts, recentTransactions, activeBudgets] = await Promise.all([
      getCurrentUserSummary(),
      getCurrentUserAccounts(),
      getCurrentUserTransactions().then(transactions => transactions.slice(0, 5)), // Recent 5
      getActiveBudgets()
    ])

    return {
      summary,
      accounts,
      recentTransactions,
      activeBudgets
    }
  } catch (error) {
    console.error('Error in getDashboardOverview:', error)
    return null
  }
}

// Refresh summary data
export const refreshSummary = async (): Promise<Summary | null> => {
  return await generateUserSummary()
}

// Helper function to calculate monthly income from transactions (like Next.js)
const calculateMonthlyIncomeFromTransactions = (transactions: any[]): number => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return transactions
    .filter((transaction: any) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'income';
    })
    .reduce((total: number, transaction: any) => total + Math.abs(transaction.amount), 0);
};

// Helper function to calculate monthly expenses from transactions (like Next.js)
const calculateMonthlyExpensesFromTransactions = (transactions: any[]): number => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return transactions
    .filter((transaction: any) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'expense';
    })
    .reduce((total: number, transaction: any) => total + Math.abs(transaction.amount), 0);
};

// Dashboard data interface (like Next.js)
export interface DashboardData {
  user: any;
  accounts: any[];
  transactions: any[];
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

// Optimized function to fetch all dashboard data in one go (copied from Next.js)
export const getDashboardData = async (): Promise<DashboardData | null> => {
  try {
    // First get the user
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    // Now fetch all other data in parallel using the user ID
    const [
      accounts,
      transactions,
      staticSummary
    ] = await Promise.all([
      getCurrentUserAccounts(),
      getCurrentUserTransactions(),
      getCurrentUserSummary()
    ]);

    // Calculate derived values from the fetched data (like Next.js)
    const totalBalance = accounts.reduce((total: number, account: any) => total + account.balance, 0);
    const monthlyIncome = calculateMonthlyIncomeFromTransactions(transactions);
    const monthlyExpenses = calculateMonthlyExpensesFromTransactions(transactions);
    const monthlyChange = monthlyIncome - monthlyExpenses;
    
    // Calculate budget remaining from active budgets
    const budgets = await getActiveBudgets();
    const budgetRemaining = budgets.reduce((sum: number, budget: any) => sum + budget.remainingAmount, 0);

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
        accountBreakdown: staticSummary?.accountBreakdown || {},
        categorySpending: staticSummary?.categorySpending || {}
      }
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return null;
  }
};
