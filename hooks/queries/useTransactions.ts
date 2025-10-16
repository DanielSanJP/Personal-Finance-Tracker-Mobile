import { queryKeys } from '@/lib/query-keys';
import { supabase } from '@/lib/supabase';
import { Transaction } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, useAuth } from './useAuth';

// Type definitions
export interface TransactionFilters {
  category?: string;
  period?: string;
  party?: string; // Replaces merchant - can be from_party or to_party
  type?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netTotal: number;
  transactionCount: number;
}

export interface FilterOptions {
  categories: string[];
  parties: string[]; // Replaces merchants - includes both from_party and to_party
  types: string[];
  periods: string[];
}

// Database response types (raw from Supabase)
interface DatabaseTransaction {
  id: string;
  user_id: string | { toString(): string };
  account_id: string;
  date: string | Date;
  description: string;
  amount: number;
  category: string | null;
  type: 'income' | 'expense' | 'transfer';
  from_party: string | null; // New universal party system
  to_party: string | null; // New universal party system
  destination_account_id?: string | null; // For transfers and goal contributions
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  created_at: string | Date;
  updated_at: string | Date;
}

// RPC Data Functions
/**
 * Get filtered transactions using client-side filtering (more reliable)
 */
async function getFilteredTransactions(
  filters: TransactionFilters = {},
  limit: number = 500 // CHANGED: Default to 500 instead of 1000 for Android stability
): Promise<Transaction[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  // SAFETY: Cap limit at 1000 max to prevent memory issues on Android
  const safeLimit = Math.min(limit, 1000);

  // Fetch transactions for the user with limit
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  // Transform the data to match our interface (keep database column names)
  let transformedData = (data || []).map((transaction: DatabaseTransaction) => ({
    id: transaction.id,
    user_id: transaction.user_id?.toString() || '',
    account_id: transaction.account_id,
    date: transaction.date?.toString() || '',
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category || '',
    type: transaction.type,
    from_party: transaction.from_party || null,
    to_party: transaction.to_party || null,
    destination_account_id: transaction.destination_account_id || null,
    status: transaction.status,
    created_at: transaction.created_at?.toString() || '',
    updated_at: transaction.updated_at?.toString() || '',
  })) as Transaction[];

  // Apply client-side filters
  if (filters.category && filters.category !== 'All Categories') {
    transformedData = transformedData.filter(t => t.category === filters.category);
  }

  if (filters.type && filters.type !== 'All Types') {
    transformedData = transformedData.filter(t => t.type === filters.type);
  }

  if (filters.party && filters.party !== 'All Parties') {
    transformedData = transformedData.filter(t => 
      t.from_party === filters.party || t.to_party === filters.party
    );
  }

  if (filters.period && filters.period !== 'All Time') {
    const now = new Date();
    let startDate: Date;

    switch (filters.period) {
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'Last Month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        transformedData = transformedData.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
        break;
      case 'Last 3 Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        transformedData = transformedData.filter(t => new Date(t.date) >= startDate);
        break;
      case 'This Year':
        startDate = new Date(now.getFullYear(), 0, 1);
        transformedData = transformedData.filter(t => new Date(t.date) >= startDate);
        break;
      default:
        // All Time - no filtering
        break;
    }

    // For all periods except 'Last Month', filter from start date to now
    if (filters.period !== 'Last Month' && filters.period !== 'All Time') {
      transformedData = transformedData.filter(t => new Date(t.date) >= startDate);
    }
  }

  // Apply limit
  const limitedData = transformedData.slice(0, limit);

  return limitedData;
}

/**
 * Get transaction filter options using client-side logic
 */
async function getTransactionFilterOptions(): Promise<FilterOptions> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      categories: ['All Categories'],
      parties: ['All Parties'],
      types: ['All Types'],
      periods: ['This Month', 'Last Month', 'Last 3 Months', 'This Year', 'All Time'],
    };
  }

  // Fetch all transactions to get unique filter values
  const { data: transactions, error} = await supabase
    .from('transactions')
    .select('category, from_party, to_party, type')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching filter options:', error);
    // Return default options on error
    return {
      categories: ['All Categories'],
      parties: ['All Parties'],
      types: ['All Types'],
      periods: ['This Month', 'Last Month', 'Last 3 Months', 'This Year', 'All Time'],
    };
  }

  // Extract unique values from transactions
  const categories = ['All Categories'];
  const parties = ['All Parties'];
  const types = ['All Types'];

  if (transactions) {
    // Get unique categories
    const uniqueCategories = Array.from(new Set(
      transactions.map(t => t.category).filter(Boolean)
    )).sort();
    categories.push(...uniqueCategories);

    // Get unique parties (from both from_party and to_party)
    const uniqueParties = Array.from(new Set([
      ...transactions.map(t => t.from_party).filter(Boolean),
      ...transactions.map(t => t.to_party).filter(Boolean)
    ])).sort();
    parties.push(...uniqueParties);

    // Get unique types
    const uniqueTypes = Array.from(new Set(
      transactions.map(t => t.type).filter(Boolean)
    )).sort();
    types.push(...uniqueTypes);
  }

  return {
    categories,
    parties,
    types,
    periods: ['This Month', 'Last Month', 'Last 3 Months', 'This Year', 'All Time'],
  };
}

/**
 * Get recent transactions for dashboard using regular query
 */
async function getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent transactions:', error);
    throw new Error(`Failed to fetch recent transactions: ${error.message}`);
  }

  // Transform the data to match our interface (keep database column names)
  return (data || []).map((transaction: DatabaseTransaction) => ({
    id: transaction.id,
    user_id: transaction.user_id?.toString() || '',
    account_id: transaction.account_id,
    date: transaction.date?.toString() || '',
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category || '',
    type: transaction.type,
    from_party: transaction.from_party || null,
    to_party: transaction.to_party || null,
    destination_account_id: transaction.destination_account_id || null,
    status: transaction.status,
    created_at: transaction.created_at?.toString() || '',
    updated_at: transaction.updated_at?.toString() || '',
  })) as Transaction[];
}

/**
 * Get transaction summary using client-side calculation
 */
async function getTransactionSummary(
  filters: TransactionFilters = {}
): Promise<TransactionSummary> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netTotal: 0,
      transactionCount: 0,
    };
  }

  // Get filtered transactions and calculate summary
  const transactions = await getFilteredTransactions(filters);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return {
    totalIncome,
    totalExpenses,
    netTotal: totalIncome - totalExpenses,
    transactionCount: transactions.length,
  };
}

/**
 * Get all transactions for a user (fallback function)
 */
async function getCurrentUserTransactions(): Promise<Transaction[]> {
  // CRITICAL: Limit to 500 transactions to prevent Android crashes
  // Loading 10,000 transactions causes memory issues on Android devices
  // 500 transactions = ~1-2 years of data for most users
  return getFilteredTransactions({}, 500);
}

/**
 * Create a new transaction
 */
async function createTransaction(
  transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Transaction> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transactionData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data;
}

/**
 * Update a transaction
 */
async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
): Promise<Transaction> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }

  return data;
}

/**
 * Delete a transaction
 */
async function deleteTransaction(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}

/**
 * Create an expense transaction
 */
export async function createExpenseTransaction(expenseData: {
  amount: number;
  description: string;
  category?: string;
  merchant?: string;
  accountId: string;
  status?: string;
  date: Date;
}): Promise<Transaction> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // Get account name for from_party
  const { data: account } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', expenseData.accountId)
    .single();
  
  const accountName = account?.name || 'Account';
  
  // Generate a unique ID for the transaction
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      id: transactionId,
      user_id: user.id,
      account_id: expenseData.accountId,
      type: 'expense',
      amount: -Math.abs(expenseData.amount), // Expenses are negative
      description: expenseData.description,
      category: expenseData.category || null,
      from_party: accountName, // Money comes FROM user's account
      to_party: expenseData.merchant || 'Unknown Merchant', // Money goes TO merchant
      date: expenseData.date.toISOString(), // Full timestamp with time
      status: expenseData.status || 'completed',
    })
      .select()
      .single();

  if (error) {
    console.error('Error creating expense transaction:', error);
    throw new Error(`Failed to create expense transaction: ${error.message}`);
  }

  // ✅ Account balance automatically updated by database trigger
  // No manual balance update needed!

  // Transform the data to match our interface
  return {
    ...data,
    user_id: data.user_id?.toString() || '',
    date: data.date?.toString() || '',
    created_at: data.created_at?.toString() || '',
    updated_at: data.updated_at?.toString() || ''
  } as Transaction;
}

/**
 * Create an income transaction
 */
export async function createIncomeTransaction(incomeData: {
  amount: number;
  description: string;
  source: string; // Income source (Salary, Freelance, etc.)
  accountId: string;
  date: Date;
}): Promise<Transaction> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // Get account name for to_party
  const { data: account } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', incomeData.accountId)
    .single();
  
  const accountName = account?.name || 'Account';
  
  // Generate a unique ID for the transaction
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      id: transactionId,
      user_id: user.id,
      account_id: incomeData.accountId,
      type: 'income',
      amount: Math.abs(incomeData.amount), // Income is positive
      description: incomeData.description, // The specific source name (e.g., "Acme Corp")
      category: incomeData.source, // Income category (Salary, Freelance, etc.)
      from_party: incomeData.description, // Money comes FROM the specific source (employer name, client name, etc.)
      to_party: accountName, // Money goes TO user's account
      date: incomeData.date.toISOString(), // Full timestamp with time
      status: 'completed',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating income transaction:', error);
    throw new Error(`Failed to create income transaction: ${error.message}`);
  }

  // ✅ Account balance automatically updated by database trigger
  // No manual balance update needed!

  // Transform the data to match our interface
  return {
    ...data,
    user_id: data.user_id?.toString() || '',
    date: data.date?.toString() || '',
    created_at: data.created_at?.toString() || '',
    updated_at: data.updated_at?.toString() || ''
  } as Transaction;
}

/**
 * Create an account-to-account transfer transaction
 */
export async function createAccountTransfer(transferData: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  date: Date;
}): Promise<Transaction> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Validation: Cannot transfer to same account
  if (transferData.fromAccountId === transferData.toAccountId) {
    throw new Error('Cannot transfer to the same account');
  }

  // Validation: Amount must be positive
  if (transferData.amount <= 0) {
    throw new Error('Transfer amount must be greater than zero');
  }

  // Check sufficient funds in source account
  const { data: fromAccount, error: fromError } = await supabase
    .from('accounts')
    .select('balance, name')
    .eq('id', transferData.fromAccountId)
    .eq('user_id', user.id)
    .single();

  if (fromError) {
    throw new Error(`Failed to fetch source account: ${fromError.message}`);
  }

  if (fromAccount.balance < transferData.amount) {
    throw new Error(
      `Insufficient funds. Available: $${fromAccount.balance.toFixed(2)}, Required: $${transferData.amount.toFixed(2)}`
    );
  }

  // Get destination account name
  const { data: toAccount, error: toError } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', transferData.toAccountId)
    .eq('user_id', user.id)
    .single();

  if (toError) {
    throw new Error(`Failed to fetch destination account: ${toError.message}`);
  }

  // Generate unique transaction ID
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create transfer transaction - trigger handles both balance updates
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      id: transactionId,
      user_id: user.id,
      account_id: transferData.fromAccountId,
      destination_account_id: transferData.toAccountId,
      type: 'transfer',
      amount: -Math.abs(transferData.amount), // Negative: leaving source account
      description: transferData.description || 'Account transfer',
      category: 'Transfer',
      from_party: fromAccount.name,
      to_party: toAccount.name,
      date: transferData.date.toISOString(),
      status: 'completed',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transfer transaction:', error);
    throw new Error(`Failed to create transfer: ${error.message}`);
  }

  // ✅ Both account balances automatically updated by database trigger
  // Source account balance decreases, destination account balance increases

  // Transform the data to match our interface
  return {
    ...data,
    user_id: data.user_id?.toString() || '',
    date: data.date?.toString() || '',
    created_at: data.created_at?.toString() || '',
    updated_at: data.updated_at?.toString() || ''
  } as Transaction;
}

// Query keys for RPC-based queries (consolidated)
export const TRANSACTION_QUERY_KEYS = {
  transactions: (filters: TransactionFilters) => ['transactions', filters],
  filterOptions: ['transaction-filter-options'],
  summary: (filters: TransactionFilters) => ['transaction-summary', filters],
  recent: (limit: number) => ['recent-transactions', limit],
  all: ['all-transactions'],
  detail: (id: string) => ['transactions', 'detail', id],
} as const;

/**
 * Hook to get filtered transactions using client-side filtering (reliable)
 */
export function useFilteredTransactions(filters: TransactionFilters = {}, pageSize?: number) {
  const { isGuest } = useAuth();

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.transactions(filters),
    queryFn: () => getFilteredTransactions(filters, pageSize),
    staleTime: isGuest ? 10 * 60 * 1000 : 5 * 60 * 1000, // Guest data can be stale longer
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: !isGuest, // Don't refetch for guests on focus
    retry: (failureCount, error) => {
      // Don't retry if it's just an empty result
      if (error?.message === '' || !error?.message) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to get transaction filter options using client-side logic
 */
export function useTransactionFilterOptions() {
  const { isGuest } = useAuth();

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.filterOptions,
    queryFn: getTransactionFilterOptions,
    staleTime: isGuest ? 20 * 60 * 1000 : 15 * 60 * 1000, // Guest filter options can be stale longer
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: !isGuest,
  });
}

/**
 * Hook to get transaction summary using client-side calculation
 */
export function useTransactionSummary(filters: TransactionFilters = {}) {
  const { isGuest } = useAuth();

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.summary(filters),
    queryFn: () => getTransactionSummary(filters),
    staleTime: isGuest ? 10 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: !isGuest,
  });
}

/**
 * Hook to get recent transactions for dashboard using regular query
 */
export function useRecentTransactions(limit: number = 10) {
  const { isGuest } = useAuth();

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.recent(limit),
    queryFn: () => getRecentTransactions(limit),
    staleTime: isGuest ? 5 * 60 * 1000 : 2 * 60 * 1000, // Dashboard data should be fresh
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: !isGuest,
  });
}

/**
 * Hook to get all transactions using RPC (for reports and admin views)
 */
export function useTransactions() {
  const { isGuest } = useAuth();

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.all,
    queryFn: getCurrentUserTransactions,
    staleTime: isGuest ? 10 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: !isGuest,
  });
}

/**
 * Hook to fetch a single transaction by ID using RPC
 */
export function useTransaction(transactionId: string | undefined) {
  const queryClient = useQueryClient();
  const { isGuest } = useAuth();

  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.detail(transactionId || ''),
    queryFn: async (): Promise<Transaction | null> => {
      if (!transactionId) return null;

      // First try to get from any transactions list cache
      const allTransactionsData = queryClient.getQueryData<Transaction[]>(
        TRANSACTION_QUERY_KEYS.all
      );
      
      if (allTransactionsData) {
        const transaction = allTransactionsData.find(t => t.id === transactionId);
        if (transaction) return transaction;
      }

      // Try to find in filtered transactions cache
      const queryCache = queryClient.getQueryCache();
      const transactionQueries = queryCache.findAll({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === 'transactions' && queryKey.length === 2;
        }
      });

      for (const query of transactionQueries) {
        const data = query.state.data as Transaction[] | undefined;
        if (data) {
          const transaction = data.find(t => t.id === transactionId);
          if (transaction) return transaction;
        }
      }

      // If not found in cache, fetch all transactions (which will cache them)
      const allTransactions = await getCurrentUserTransactions();
      return allTransactions.find(t => t.id === transactionId) || null;
    },
    enabled: !!transactionId,
    staleTime: isGuest ? 10 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Mutation hook to create a new transaction using RPC
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate ALL related queries for comprehensive data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      
      // Legacy key invalidations for backwards compatibility
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-filter-options'] });
    },
  });
}

/**
 * Mutation hook to update a transaction using RPC
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>> }) =>
      updateTransaction(id, updates),
    onSuccess: () => {
      // Invalidate ALL related queries for comprehensive data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      
      // Legacy key invalidations for backwards compatibility
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-filter-options'] });
    },
  });
}

/**
 * Mutation hook to delete a transaction using RPC
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      // Invalidate ALL related queries for comprehensive data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      
      // Legacy key invalidations for backwards compatibility
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-filter-options'] });
    },
  });
}

// Legacy exports for backwards compatibility
export const useTransactionsByUserId = useTransactions; // Admin can use useTransactions for now

/**
 * Mutation hook to create an expense transaction
 */
export function useCreateExpenseTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpenseTransaction,
    onSuccess: () => {
      // Invalidate ALL related queries for comprehensive data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      
      // Legacy key invalidations for backwards compatibility
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-filter-options'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

/**
 * Mutation hook to create an income transaction
 */
export function useCreateIncomeTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncomeTransaction,
    onSuccess: () => {
      // Invalidate ALL related queries for comprehensive data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      
      // Legacy key invalidations for backwards compatibility
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-filter-options'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

/**
 * Mutation hook to create an account-to-account transfer
 */
export function useCreateAccountTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccountTransfer,
    onSuccess: () => {
      // Invalidate ALL related queries - both accounts affected
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      
      // Legacy key invalidations for backwards compatibility
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Additional spending analysis functions - using RPC for optimal performance
export const getCurrentMonthSpendingByCategory = async (): Promise<{category: string, spentAmount: number}[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  try {
    // Use RPC function for efficient server-side calculation
    const { data, error } = await supabase.rpc('get_current_month_spending_by_category', {
      user_id_param: user.id
    });

    if (error) {
      console.error('Error calling current month spending RPC function:', error);
      return [];
    }
    
    // Map the RPC result to our expected format
    return (data || []).map((item: { category: string; spent_amount: number }) => ({
      category: item.category,
      spentAmount: Number(item.spent_amount)
    }));
  } catch (error) {
    console.error('Error in getCurrentMonthSpendingByCategory:', error);
    return [];
  }
};

// Get spending by category for a specific month - using RPC for optimal performance
export const getSpendingByCategoryForMonth = async (year: number, month: number): Promise<{category: string, spentAmount: number}[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  try {
    // Use RPC function for efficient server-side calculation
    const { data, error } = await supabase.rpc('get_spending_by_category_for_month', {
      user_id_param: user.id,
      year_param: year,
      month_param: month
    });

    if (error) {
      console.error('Error calling spending by category for month RPC function:', error);
      return [];
    }
    
    // Map the RPC result to our expected format
    return (data || []).map((item: { category: string; spent_amount: number }) => ({
      category: item.category,
      spentAmount: Number(item.spent_amount)
    }));
  } catch (error) {
    console.error('Error in getSpendingByCategoryForMonth:', error);
    return [];
  }
};
