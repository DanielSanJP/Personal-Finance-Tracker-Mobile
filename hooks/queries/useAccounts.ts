import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { queryKeys } from '@/lib/query-keys';
import { useAuth, getCurrentUser } from './useAuth';
import { supabase } from '@/lib/supabase';
import { checkGuestAndWarn } from '@/lib/guest-protection';
import type { Account } from '@/lib/types';

// Data functions
async function getCurrentUserAccounts(userId: string): Promise<Account[]> {
  if (!userId) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching accounts:', error);
      throw new Error(`Failed to fetch accounts: ${error.message}`);
    }

    // Map database fields to our interface (snake_case → camelCase)
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
    console.error('Error in getCurrentUserAccounts:', error);
    return [];
  }
}

async function getAccountsByUserId(userId: string): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching accounts by user ID:', error);
      throw new Error(`Failed to fetch accounts: ${error.message}`);
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
}

async function getTotalBalance(userId: string): Promise<number> {
  const accounts = await getCurrentUserAccounts(userId);
  return accounts.reduce((total: number, account: Account) => total + account.balance, 0);
}

export async function createAccount(userId: string, accountData: {
  name: string;
  type: string;
  balance: number;
  accountNumber?: string;
}): Promise<Account> {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Generate a unique ID for the account
    const accountId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        id: accountId,
        user_id: userId,
        name: accountData.name,
        balance: accountData.balance,
        type: accountData.type,
        account_number: accountData.accountNumber || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      throw new Error(`Failed to create account: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      balance: Number(data.balance),
      type: data.type,
      accountNumber: data.account_number || '',
      isActive: data.is_active
    };
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

export async function updateAccount(userId: string, accountId: string, accountData: {
  name?: string;
  balance?: number;
  type?: string;
  accountNumber?: string;
  isActive?: boolean;
}): Promise<Account> {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const { data, error } = await supabase
      .from('accounts')
      .update({
        name: accountData.name,
        balance: accountData.balance,
        type: accountData.type,
        account_number: accountData.accountNumber,
        is_active: accountData.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      throw new Error(`Failed to update account: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      balance: Number(data.balance),
      type: data.type,
      accountNumber: data.account_number || '',
      isActive: data.is_active
    };
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
}

/**
 * Hook to fetch current user's accounts
 */
export function useAccounts() {
  const { user, isGuest } = useAuth();

  return useQuery({
    queryKey: queryKeys.accounts.lists(),
    queryFn: async (): Promise<Account[]> => {
      if (!user) return [];
      return getCurrentUserAccounts(user.id);
    },
    enabled: !!user,
    staleTime: isGuest ? 10 * 60 * 1000 : 3 * 60 * 1000, // Account data can be less fresh
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: !isGuest,
  });
}

/**
 * Hook to fetch accounts by user ID
 */
export function useAccountsByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.accounts.list({ userId }),
    queryFn: (): Promise<Account[]> => {
      if (!userId) throw new Error('User ID is required');
      return getAccountsByUserId(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single account by ID
 */
export function useAccount(accountId: string | undefined) {
  const { data: accounts = [] } = useAccounts();
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.accounts.detail(accountId || ''),
    queryFn: async (): Promise<Account | null> => {
      if (!accountId || !user) return null;
      
      // Try to find in the accounts list cache first
      const account = accounts.find(acc => acc.id === accountId);
      if (account) return account;

      // If not found and we have accounts, it doesn't exist
      if (accounts.length > 0) return null;

      // Otherwise fetch accounts and try again
      const allAccounts = await getCurrentUserAccounts(user.id);
      return allAccounts.find(acc => acc.id === accountId) || null;
    },
    enabled: !!accountId && !!user,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get total balance across all accounts
 */
export function useTotalBalance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.accounts.balance('total'),
    queryFn: async () => {
      if (!user) return 0;
      return getTotalBalance(user.id);
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Balance should be relatively fresh
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get active accounts only
 */
export function useActiveAccounts() {
  const { data: accounts = [], ...queryResult } = useAccounts();
  
  const activeAccounts = accounts.filter(account => account.isActive);

  return {
    ...queryResult,
    data: activeAccounts,
  };
}

/**
 * Hook to get accounts grouped by type
 */
export function useAccountsByType() {
  const { data: accounts = [], ...queryResult } = useAccounts();

  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  return {
    ...queryResult,
    data: accountsByType,
  };
}

/**
 * Mutation hook to create an account
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountData: {
      name: string;
      type: string;
      balance: number;
      accountNumber?: string;
      isActive?: boolean;
    }) => {
      const isGuest = await checkGuestAndWarn("create accounts");
      if (isGuest) {
        throw new Error("Guest users cannot create accounts");
      }
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      return createAccount(user.id, accountData);
    },
    onSuccess: () => {
      Alert.alert("Success", "Account created successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot create accounts") {
        console.error("Error creating account:", error);
        Alert.alert("Error", "Failed to create account");
      }
    },
  });
}

/**
 * Mutation hook to update an account
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      accountData,
    }: {
      accountId: string;
      accountData: {
        name?: string;
        balance?: number;
        type?: string;
        accountNumber?: string;
        isActive?: boolean;
      };
    }) => {
      const isGuest = await checkGuestAndWarn("update accounts");
      if (isGuest) {
        throw new Error("Guest users cannot update accounts");
      }
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      return updateAccount(user.id, accountId, accountData);
    },
    onSuccess: () => {
      Alert.alert("Success", "Account updated successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot update accounts") {
        console.error("Error updating account:", error);
        Alert.alert("Error", "Failed to update account");
      }
    },
  });
}

/**
 * Mutation hook to delete an account (soft delete by setting isActive to false)
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const isGuest = await checkGuestAndWarn("delete accounts");
      if (isGuest) {
        throw new Error("Guest users cannot delete accounts");
      }
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      return updateAccount(user.id, accountId, { isActive: false });
    },
    onSuccess: () => {
      Alert.alert("Success", "Account deleted successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot delete accounts") {
        console.error("Error deleting account:", error);
        Alert.alert("Error", "Failed to delete account");
      }
    },
  });
}
