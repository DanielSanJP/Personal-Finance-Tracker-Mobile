import { supabase } from '../supabase'
import { getCurrentUser } from '../auth'
import { getCurrentUserTransactions } from './transactions'
import type { Budget, Transaction } from '../types'

// Helper function to format date for database
const formatDateForDatabase = (date: string | Date): string => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Calculate spent amount for a budget based on transactions
export const calculateBudgetSpentAmount = async (budget: {
  category: string;
  startDate: string;
  endDate: string;
}): Promise<number> => {
  try {
    const transactions = await getCurrentUserTransactions();
    
    // Filter transactions by category and date range
    const relevantTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      
      return (
        transaction.category === budget.category &&
        transaction.type === 'expense' &&
        transactionDate >= startDate &&
        transactionDate <= endDate
      );
    });
    
    // Sum up the amounts (take absolute value for expenses)
    return relevantTransactions.reduce((total, transaction) => {
      return total + Math.abs(transaction.amount);
    }, 0);
  } catch (error) {
    console.error('Error calculating budget spent amount:', error);
    return 0;
  }
};

// Optimized version that accepts transactions parameter
export const calculateBudgetSpentAmountFromTransactions = (
  budget: {
    category: string;
    startDate: string;
    endDate: string;
  },
  transactions: Transaction[]
): number => {
  try {
    // Filter transactions by category and date range
    const relevantTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(budget.startDate);
      const endDate = new Date(budget.endDate);
      
      return (
        transaction.category === budget.category &&
        transaction.type === 'expense' &&
        transactionDate >= startDate &&
        transactionDate <= endDate
      );
    });
    
    // Sum up the amounts (take absolute value for expenses)
    return relevantTransactions.reduce((total, transaction) => {
      return total + Math.abs(transaction.amount);
    }, 0);
  } catch (error) {
    console.error('Error calculating budget spent amount:', error);
    return 0;
  }
};

// Enhanced function to get budgets with real-time spent amounts
export const getCurrentUserBudgetsWithRealTimeSpending = async (): Promise<Budget[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching budgets:', error)
      return []
    }

    // Calculate real-time spent amounts for each budget
    const budgetsWithRealTimeSpending = await Promise.all(
      (data || []).map(async (budget) => {
        const realTimeSpentAmount = await calculateBudgetSpentAmount({
          category: budget.category,
          startDate: budget.start_date,
          endDate: budget.end_date,
        });

        return {
          id: budget.id,
          userId: budget.user_id,
          category: budget.category,
          budgetAmount: Number(budget.budget_amount),
          spentAmount: realTimeSpentAmount, // Use real-time calculated amount
          remainingAmount: Number(budget.budget_amount) - realTimeSpentAmount,
          period: budget.period,
          startDate: budget.start_date,
          endDate: budget.end_date
        };
      })
    );

    return budgetsWithRealTimeSpending;
  } catch (error) {
    console.error('Error in getCurrentUserBudgetsWithRealTimeSpending:', error)
    return []
  }
}

// Budget functions
export const getCurrentUserBudgets = async (): Promise<Budget[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching budgets:', error)
      return []
    }

    // Map database fields to our interface
    return (data || []).map(budget => ({
      id: budget.id,
      userId: budget.user_id,
      category: budget.category,
      budgetAmount: Number(budget.budget_amount),
      spentAmount: Number(budget.spent_amount),
      remainingAmount: Number(budget.remaining_amount),
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date
    }))
  } catch (error) {
    console.error('Error in getCurrentUserBudgets:', error)
    return []
  }
}

export const getBudgetsByUserId = async (userId: string): Promise<Budget[]> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching budgets:', error)
      return []
    }

    return (data || []).map(budget => ({
      id: budget.id,
      userId: budget.user_id,
      category: budget.category,
      budgetAmount: Number(budget.budget_amount),
      spentAmount: Number(budget.spent_amount),
      remainingAmount: Number(budget.remaining_amount),
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date
    }))
  } catch (error) {
    console.error('Error in getBudgetsByUserId:', error)
    return []
  }
}

export const getBudgetById = async (budgetId: string): Promise<Budget | null> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single()

    if (error) {
      console.error('Error fetching budget:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      budgetAmount: Number(data.budget_amount),
      spentAmount: Number(data.spent_amount),
      remainingAmount: Number(data.remaining_amount),
      period: data.period,
      startDate: data.start_date,
      endDate: data.end_date
    }
  } catch (error) {
    console.error('Error in getBudgetById:', error)
    return null
  }
}

// Check if budget already exists for user and category
export const checkBudgetExists = async (category: string): Promise<boolean> => {
  const user = await getCurrentUser()
  if (!user) return false

  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('category', category)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking budget existence:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in checkBudgetExists:', error)
    return false
  }
}

interface BudgetResult {
  id: string;
  userId: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  period: string;
  startDate: string;
  endDate: string;
}

// Create a new budget with proper duplicate handling
export const createBudget = async (budgetData: Omit<Budget, 'id'>): Promise<{ success: boolean; data?: BudgetResult; error?: string; errorType?: string }> => {
  const user = await getCurrentUser()
  if (!user) {
    return { 
      success: false, 
      error: 'User not authenticated',
      errorType: 'AUTH_ERROR'
    }
  }

  try {
    // Check if budget already exists for this category
    const exists = await checkBudgetExists(budgetData.category)
    if (exists) {
      return {
        success: false,
        error: `A budget for "${budgetData.category}" already exists. You can only have one budget per category.`,
        errorType: 'BUDGET_EXISTS'
      }
    }

    // Generate a unique ID for the budget
    const budgetId = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        id: budgetId,
        user_id: budgetData.userId,
        category: budgetData.category,
        budget_amount: budgetData.budgetAmount,
        spent_amount: budgetData.spentAmount,
        remaining_amount: budgetData.remainingAmount,
        period: budgetData.period,
        start_date: formatDateForDatabase(budgetData.startDate),
        end_date: formatDateForDatabase(budgetData.endDate)
      })
      .select()
      .single()

    if (error) {
      // Handle database constraint violation (23505 = unique_violation)
      if (error.code === '23505' && error.message.includes('budgets_user_category_unique')) {
        return {
          success: false,
          error: `A budget for "${budgetData.category}" already exists. You can only have one budget per category.`,
          errorType: 'BUDGET_EXISTS'
        }
      }
      console.error('Error creating budget:', error)
      return {
        success: false,
        error: 'Failed to create budget',
        errorType: 'DATABASE_ERROR'
      }
    }

    return {
      success: true,
      data: {
        id: data.id,
        userId: data.user_id,
        category: data.category,
        budgetAmount: Number(data.budget_amount),
        spentAmount: Number(data.spent_amount),
        remainingAmount: Number(data.remaining_amount),
        period: data.period,
        startDate: data.start_date,
        endDate: data.end_date
      }
    }
  } catch (error) {
    console.error('Error in createBudget:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
      errorType: 'UNKNOWN_ERROR'
    }
  }
}

export const updateBudget = async (budgetId: string, updates: Partial<Budget>): Promise<Budget | null> => {
  try {
    const dbUpdates: any = {}
    
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.budgetAmount !== undefined) dbUpdates.budget_amount = updates.budgetAmount
    if (updates.spentAmount !== undefined) dbUpdates.spent_amount = updates.spentAmount
    if (updates.remainingAmount !== undefined) dbUpdates.remaining_amount = updates.remainingAmount
    if (updates.period !== undefined) dbUpdates.period = updates.period
    if (updates.startDate !== undefined) dbUpdates.start_date = formatDateForDatabase(updates.startDate)
    if (updates.endDate !== undefined) dbUpdates.end_date = formatDateForDatabase(updates.endDate)

    const { data, error } = await supabase
      .from('budgets')
      .update(dbUpdates)
      .eq('id', budgetId)
      .select()
      .single()

    if (error) {
      console.error('Error updating budget:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      budgetAmount: Number(data.budget_amount),
      spentAmount: Number(data.spent_amount),
      remainingAmount: Number(data.remaining_amount),
      period: data.period,
      startDate: data.start_date,
      endDate: data.end_date
    }
  } catch (error) {
    console.error('Error in updateBudget:', error)
    return null
  }
}

export const deleteBudget = async (budgetId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)

    if (error) {
      console.error('Error deleting budget:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteBudget:', error)
    return false
  }
}

// Get active budgets (current period) with real-time spending calculations
export const getActiveBudgets = async (): Promise<Budget[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  
  const today = new Date().toISOString().split('T')[0]
  
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('category')

    if (error) {
      console.error('Error fetching active budgets:', error)
      return []
    }

    // Calculate real-time spent amounts for each active budget
    const activeBudgetsWithRealTimeSpending = await Promise.all(
      (data || []).map(async (budget) => {
        const realTimeSpentAmount = await calculateBudgetSpentAmount({
          category: budget.category,
          startDate: budget.start_date,
          endDate: budget.end_date,
        });

        return {
          id: budget.id,
          userId: budget.user_id,
          category: budget.category,
          budgetAmount: Number(budget.budget_amount),
          spentAmount: realTimeSpentAmount, // Use real-time calculated amount
          remainingAmount: Number(budget.budget_amount) - realTimeSpentAmount,
          period: budget.period,
          startDate: budget.start_date,
          endDate: budget.end_date
        };
      })
    );

    return activeBudgetsWithRealTimeSpending;
  } catch (error) {
    console.error('Error in getActiveBudgets:', error)
    return []
  }
}

// Helper function to create budget with simplified parameters like the desktop version
export const createBudgetSimple = async (budgetData: {
  category: string;
  budgetAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
}): Promise<{ success: boolean; data?: Budget; error?: string; errorType?: string }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        errorType: 'AUTH_ERROR'
      };
    }

    // Calculate start and end dates based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (budgetData.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (budgetData.period === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else { // yearly
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const spentAmount = 0;
    const remainingAmount = budgetData.budgetAmount - spentAmount;

    // Use the full createBudget function
    const result = await createBudget({
      userId: user.id,
      category: budgetData.category,
      budgetAmount: budgetData.budgetAmount,
      spentAmount,
      remainingAmount,
      period: budgetData.period,
      startDate: formatDateForDatabase(startDate),
      endDate: formatDateForDatabase(endDate)
    });

    if (result.success && result.data) {
      return {
        success: true,
        data: {
          id: result.data.id,
          userId: result.data.userId,
          category: result.data.category,
          budgetAmount: result.data.budgetAmount,
          spentAmount: result.data.spentAmount,
          remainingAmount: result.data.remainingAmount,
          period: result.data.period,
          startDate: result.data.startDate,
          endDate: result.data.endDate
        }
      };
    } else {
      return {
        success: false,
        error: result.error,
        errorType: result.errorType
      };
    }
  } catch (error) {
    console.error('Error in createBudgetSimple:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
      errorType: 'UNKNOWN_ERROR'
    };
  }
};
