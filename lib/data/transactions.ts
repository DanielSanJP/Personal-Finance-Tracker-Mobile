import { supabase } from '../supabase'
import { getCurrentUser } from '../auth'
import type { Transaction } from '../types'

// Helper function to format date for database
const formatDateForDatabase = (date: string | Date): string => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Transaction functions
export const getCurrentUserTransactions = async (): Promise<Transaction[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    // Map database fields to our interface
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
      status: transaction.status || 'completed'
    }))
  } catch (error) {
    console.error('Error in getCurrentUserTransactions:', error)
    return []
  }
}

export const getTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
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
      status: transaction.status || 'completed'
    }))
  } catch (error) {
    console.error('Error in getTransactionsByUserId:', error)
    return []
  }
}

export const getTransactionsByAccountId = async (accountId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions for account:', error)
      return []
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
      status: transaction.status || 'completed'
    }))
  } catch (error) {
    console.error('Error in getTransactionsByAccountId:', error)
    return []
  }
}

export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (error) {
      console.error('Error fetching transaction:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      accountId: data.account_id,
      date: data.date,
      description: data.description,
      amount: Number(data.amount),
      category: data.category || '',
      type: data.type,
      merchant: data.merchant || '',
      status: data.status || 'completed'
    }
  } catch (error) {
    console.error('Error in getTransactionById:', error)
    return null
  }
}

export const createTransaction = async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  try {
    // Generate a unique ID for the transaction
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        user_id: transactionData.userId,
        account_id: transactionData.accountId,
        date: formatDateForDatabase(transactionData.date),
        description: transactionData.description,
        amount: transactionData.amount,
        category: transactionData.category,
        type: transactionData.type,
        merchant: transactionData.merchant,
        status: transactionData.status
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      accountId: data.account_id,
      date: data.date,
      description: data.description,
      amount: Number(data.amount),
      category: data.category || '',
      type: data.type,
      merchant: data.merchant || '',
      status: data.status || 'completed'
    }
  } catch (error) {
    console.error('Error in createTransaction:', error)
    return null
  }
}

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>): Promise<Transaction | null> => {
  try {
    const dbUpdates: any = {}
    
    if (updates.accountId !== undefined) dbUpdates.account_id = updates.accountId
    if (updates.date !== undefined) dbUpdates.date = formatDateForDatabase(updates.date)
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.type !== undefined) dbUpdates.type = updates.type
    if (updates.merchant !== undefined) dbUpdates.merchant = updates.merchant
    if (updates.status !== undefined) dbUpdates.status = updates.status

    const { data, error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating transaction:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      accountId: data.account_id,
      date: data.date,
      description: data.description,
      amount: Number(data.amount),
      category: data.category || '',
      type: data.type,
      merchant: data.merchant || '',
      status: data.status || 'completed'
    }
  } catch (error) {
    console.error('Error in updateTransaction:', error)
    return null
  }
}

export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) {
      console.error('Error deleting transaction:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteTransaction:', error)
    return false
  }
}

// Get recent transactions (limit to 10)
export const getRecentTransactions = async (limit: number = 10): Promise<Transaction[]> => {
  const user = await getCurrentUser()
  if (!user) return []
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent transactions:', error)
      return []
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
      status: transaction.status || 'completed'
    }))
  } catch (error) {
    console.error('Error in getRecentTransactions:', error)
    return []
  }
}

// Convenience functions for creating specific transaction types
export const createExpenseTransaction = async (expenseData: {
  amount: number;
  description: string;
  category?: string;
  merchant?: string;
  accountId: string;
  status: string;
  date: Date | string;
}): Promise<{ success: boolean; transaction?: Transaction; error?: string }> => {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  try {
    // Use the database function to handle both transaction creation and balance update atomically
    const { data: transaction, error: transactionError } = await supabase.rpc('create_expense_transaction', {
      p_user_id: user.id,
      p_account_id: expenseData.accountId,
      p_amount: Math.abs(expenseData.amount), // Ensure positive amount for calculation
      p_description: expenseData.description,
      p_category: expenseData.category || null,
      p_merchant: expenseData.merchant || null,
      p_date: typeof expenseData.date === 'string' ? expenseData.date : expenseData.date.toISOString().split('T')[0],
      p_status: expenseData.status || 'completed'
    });

    if (transactionError) {
      console.error('Error creating expense transaction:', transactionError);
      return { success: false, error: 'Failed to create expense transaction' }
    }

    return { 
      success: true, 
      transaction: {
        id: transaction.id,
        userId: transaction.userId,
        accountId: transaction.accountId,
        date: transaction.date,
        description: transaction.description,
        amount: Number(transaction.amount),
        category: transaction.category || '',
        type: transaction.type,
        merchant: transaction.merchant || '',
        status: transaction.status
      }
    }
  } catch (error) {
    console.error('Error in createExpenseTransaction:', error)
    return { success: false, error: 'An error occurred while creating the expense' }
  }
}

export const createIncomeTransaction = async (incomeData: {
  amount: number;
  description: string;
  category?: string;
  accountId: string;
  status: string;
  date: Date | string;
}): Promise<{ success: boolean; transaction?: Transaction; error?: string }> => {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  try {
    // Use the database function to handle both transaction creation and balance update atomically
    const { data: transaction, error: transactionError } = await supabase.rpc('create_income_transaction', {
      p_user_id: user.id,
      p_account_id: incomeData.accountId,
      p_amount: Math.abs(incomeData.amount), // Ensure positive amount for income
      p_description: incomeData.description,
      p_category: incomeData.category || 'Income',
      p_merchant: incomeData.category || 'Income',
      p_date: typeof incomeData.date === 'string' ? incomeData.date : incomeData.date.toISOString().split('T')[0]
    });

    if (transactionError) {
      console.error('Error creating income transaction:', transactionError);
      return { success: false, error: 'Failed to create income transaction' }
    }

    return { 
      success: true, 
      transaction: {
        id: transaction.id,
        userId: transaction.userId,
        accountId: transaction.accountId,
        date: transaction.date,
        description: transaction.description,
        amount: Number(transaction.amount),
        category: transaction.category || '',
        type: transaction.type,
        merchant: transaction.merchant || '',
        status: transaction.status || 'completed'
      }
    }
  } catch (error) {
    console.error('Error in createIncomeTransaction:', error)
    return { success: false, error: 'An error occurred while creating the income' }
  }
}

// Transfer-specific transaction creation function  
export const createTransferTransaction = async (transferData: {
  amount: number;
  description: string;
  category?: string;
  merchant?: string;
  accountId: string;
  status?: string;
  date: Date;
}) => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    // Generate a unique ID for the transaction
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        user_id: user.id,
        account_id: transferData.accountId,
        date: formatDateForDatabase(transferData.date), // Format as YYYY-MM-DD in local timezone
        description: transferData.description,
        amount: -Math.abs(transferData.amount), // Negative amount to reduce account balance
        category: transferData.category || null,
        type: 'transfer',
        merchant: transferData.merchant || null,
        status: transferData.status || 'completed'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating transfer transaction:', error)
      throw new Error('Failed to create transfer transaction')
    }

    return {
      success: true,
      message: 'Transfer transaction created successfully',
      transaction: {
        id: data.id,
        userId: data.user_id,
        accountId: data.account_id,
        date: data.date,
        description: data.description,
        amount: Number(data.amount),
        category: data.category || '',
        type: data.type,
        merchant: data.merchant || '',
        status: data.status
      }
    }
  } catch (error) {
    console.error('Error in createTransferTransaction:', error)
    throw error
  }
}
