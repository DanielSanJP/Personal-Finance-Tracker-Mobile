import { supabase } from '../supabase'
import { getCurrentUser } from '../auth'
import type { Goal } from '../types'
import { updateAccount } from './accounts'
import { createTransferTransaction } from './transactions'

// Helper function to format date for database
const formatDateForDatabase = (date: string | Date): string => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Goal functions
export const getCurrentUserGoals = async (): Promise<Goal[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
      return []
    }

    // Map database fields to our interface
    return (data || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      name: goal.name,
      targetAmount: Number(goal.target_amount),
      currentAmount: Number(goal.current_amount),
      targetDate: goal.target_date || undefined,
      category: goal.category || undefined,
      priority: goal.priority || undefined,
      status: goal.status
    }))
  } catch (error) {
    console.error('Error in getCurrentUserGoals:', error)
    return []
  }
}

export const getGoalsByUserId = async (userId: string): Promise<Goal[]> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
      return []
    }

    return (data || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      name: goal.name,
      targetAmount: Number(goal.target_amount),
      currentAmount: Number(goal.current_amount),
      targetDate: goal.target_date || undefined,
      category: goal.category || undefined,
      priority: goal.priority || undefined,
      status: goal.status
    }))
  } catch (error) {
    console.error('Error in getGoalsByUserId:', error)
    return []
  }
}

export const getGoalById = async (goalId: string): Promise<Goal | null> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single()

    if (error) {
      console.error('Error fetching goal:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      targetDate: data.target_date || undefined,
      category: data.category || undefined,
      priority: data.priority || undefined,
      status: data.status
    }
  } catch (error) {
    console.error('Error in getGoalById:', error)
    return null
  }
}

export const createGoal = async (goalData: Omit<Goal, 'id'>): Promise<Goal> => {
  try {
    console.log('createGoal called with data:', goalData);
    
    // Generate a unique ID for the goal
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated goal ID:', goalId);

    const insertData = {
      id: goalId,
      user_id: goalData.userId,
      name: goalData.name,
      target_amount: goalData.targetAmount,
      current_amount: goalData.currentAmount,
      target_date: goalData.targetDate ? formatDateForDatabase(goalData.targetDate) : null,
      category: goalData.category || null,
      priority: goalData.priority || null,
      status: goalData.status
    };
    
    console.log('Inserting data to Supabase:', insertData);

    const { data, error } = await supabase
      .from('goals')
      .insert(insertData)
      .select()
      .single()

    console.log('Supabase response - data:', data, 'error:', error);

    if (error) {
      console.error('Error creating goal:', error)
      throw new Error(`Failed to create goal: ${error.message}`)
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      targetDate: data.target_date || undefined,
      category: data.category || undefined,
      priority: data.priority || undefined,
      status: data.status
    }
  } catch (error) {
    console.error('Error in createGoal:', error)
    throw error
  }
}

export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<Goal | null> => {
  try {
    const dbUpdates: any = {}
    
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount
    if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate ? formatDateForDatabase(updates.targetDate) : null
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority
    if (updates.status !== undefined) dbUpdates.status = updates.status

    const { data, error } = await supabase
      .from('goals')
      .update(dbUpdates)
      .eq('id', goalId)
      .select()
      .single()

    if (error) {
      console.error('Error updating goal:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      targetDate: data.target_date || undefined,
      category: data.category || undefined,
      priority: data.priority || undefined,
      status: data.status
    }
  } catch (error) {
    console.error('Error in updateGoal:', error)
    return null
  }
}

export const deleteGoal = async (goalId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) {
      console.error('Error deleting goal:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteGoal:', error)
    return false
  }
}

// Get active goals
export const getActiveGoals = async (): Promise<Goal[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: false })

    if (error) {
      console.error('Error fetching active goals:', error)
      return []
    }

    return (data || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      name: goal.name,
      targetAmount: Number(goal.target_amount),
      currentAmount: Number(goal.current_amount),
      targetDate: goal.target_date || undefined,
      category: goal.category || undefined,
      priority: goal.priority || undefined,
      status: goal.status
    }))
  } catch (error) {
    console.error('Error in getActiveGoals:', error)
    return []
  }
}

// Update goal progress
export const updateGoalProgress = async (goalId: string, amount: number): Promise<Goal | null> => {
  try {
    const goal = await getGoalById(goalId)
    if (!goal) return null

    const newCurrentAmount = goal.currentAmount + amount
    const updatedGoal = await updateGoal(goalId, { 
      currentAmount: newCurrentAmount,
      status: newCurrentAmount >= goal.targetAmount ? 'completed' : goal.status
    })

    return updatedGoal
  } catch (error) {
    console.error('Error in updateGoalProgress:', error)
    return null
  }
}

// Make a contribution to a goal
export const makeGoalContribution = async (contributionData: {
  goalId: string;
  accountId: string;
  amount: number;
  date: Date;
  notes?: string;
}) => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    // Start a transaction-like operation by performing multiple operations
    
    // 1. Get current goal data
    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', contributionData.goalId)
      .eq('user_id', user.id)
      .single()

    if (goalError) {
      throw new Error('Goal not found')
    }

    // 2. Get current account data
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', contributionData.accountId)
      .eq('user_id', user.id)
      .single()

    if (accountError) {
      throw new Error('Account not found')
    }

    // 3. Check if account has sufficient balance
    if (Number(accountData.balance) < contributionData.amount) {
      throw new Error('Insufficient account balance')
    }

    // 4. Update goal current amount
    const newCurrentAmount = Number(goalData.current_amount) + contributionData.amount
    
    const { error: updateGoalError } = await supabase
      .from('goals')
      .update({ current_amount: newCurrentAmount })
      .eq('id', contributionData.goalId)
      .eq('user_id', user.id)

    if (updateGoalError) {
      throw new Error('Failed to update goal')
    }

    // 5. Update account balance
    const newAccountBalance = Number(accountData.balance) - contributionData.amount
    
    await updateAccount(contributionData.accountId, {
      balance: newAccountBalance
    })

    // 6. Create a transaction record
    await createTransferTransaction({
      amount: contributionData.amount,
      description: `Goal contribution: ${goalData.name}`,
      category: 'Savings',
      accountId: contributionData.accountId,
      date: contributionData.date,
      merchant: contributionData.notes || 'Goal Contribution'
    })

    return {
      success: true,
      message: 'Contribution made successfully',
      newGoalAmount: newCurrentAmount,
      newAccountBalance: newAccountBalance
    }

  } catch (error) {
    console.error('Error in makeGoalContribution:', error)
    throw error
  }
}
