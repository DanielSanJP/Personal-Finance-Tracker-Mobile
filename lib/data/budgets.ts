import { supabase } from '../supabase'
import { getCurrentUser } from '../auth'
import type { Budget } from '../types'

// Helper function to format date for database
const formatDateForDatabase = (date: string | Date): string => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
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

export const createBudget = async (budgetData: Omit<Budget, 'id'>): Promise<Budget | null> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
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
      console.error('Error creating budget:', error)
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
    console.error('Error in createBudget:', error)
    return null
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

// Get active budgets (current period)
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
    console.error('Error in getActiveBudgets:', error)
    return []
  }
}
