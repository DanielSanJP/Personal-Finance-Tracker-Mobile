import { supabase } from '../supabase'
import { getCurrentUser } from '../auth'
import type { Account } from '../types'

// Account functions
export const getCurrentUserAccounts = async (): Promise<Account[]> => {
  const user = await getCurrentUser()
  
  if (!user) {
    return []
  }
  
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching accounts:', error)
      return []
    }

    // Map database fields to our interface
    return (data || []).map(account => ({
      id: account.id,
      userId: account.user_id,
      name: account.name,
      balance: Number(account.balance),
      type: account.type,
      accountNumber: account.account_number || '',
      isActive: account.is_active
    }))
  } catch (error) {
    console.error('Error in getCurrentUserAccounts:', error)
    return []
  }
}

export const getAccountsByUserId = async (userId: string): Promise<Account[]> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching accounts:', error)
      return []
    }

    return (data || []).map(account => ({
      id: account.id,
      userId: account.user_id,
      name: account.name,
      balance: Number(account.balance),
      type: account.type,
      accountNumber: account.account_number || '',
      isActive: account.is_active
    }))
  } catch (error) {
    console.error('Error in getAccountsByUserId:', error)
    return []
  }
}

export const getAccountById = async (accountId: string): Promise<Account | null> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error) {
      console.error('Error fetching account:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      balance: Number(data.balance),
      type: data.type,
      accountNumber: data.account_number || '',
      isActive: data.is_active
    }
  } catch (error) {
    console.error('Error in getAccountById:', error)
    return null
  }
}

export const createAccount = async (accountData: Omit<Account, 'id'>): Promise<Account | null> => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: accountData.userId,
        name: accountData.name,
        balance: accountData.balance,
        type: accountData.type,
        account_number: accountData.accountNumber,
        is_active: accountData.isActive
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating account:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      balance: Number(data.balance),
      type: data.type,
      accountNumber: data.account_number || '',
      isActive: data.is_active
    }
  } catch (error) {
    console.error('Error in createAccount:', error)
    return null
  }
}

export const updateAccount = async (accountId: string, updates: Partial<Account>): Promise<Account | null> => {
  try {
    const dbUpdates: any = {}
    
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance
    if (updates.type !== undefined) dbUpdates.type = updates.type
    if (updates.accountNumber !== undefined) dbUpdates.account_number = updates.accountNumber
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    const { data, error } = await supabase
      .from('accounts')
      .update(dbUpdates)
      .eq('id', accountId)
      .select()
      .single()

    if (error) {
      console.error('Error updating account:', error)
      return null
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      balance: Number(data.balance),
      type: data.type,
      accountNumber: data.account_number || '',
      isActive: data.is_active
    }
  } catch (error) {
    console.error('Error in updateAccount:', error)
    return null
  }
}

export const deleteAccount = async (accountId: string): Promise<boolean> => {
  try {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', accountId)

    if (error) {
      console.error('Error deleting account:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteAccount:', error)
    return false
  }
}
