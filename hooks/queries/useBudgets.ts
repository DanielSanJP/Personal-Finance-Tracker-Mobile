import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { checkGuestAndWarn } from "@/lib/guest-protection";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./useAuth";
import { queryKeys } from "@/lib/query-keys";

// Interface for RPC function response
interface BudgetWithSpendingResponse {
  id: string;
  user_id: string;
  category: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  period: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

// Budget interface
export interface Budget {
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

// Budget functions using Supabase RPC for optimal performance
export const getCurrentUserBudgetsWithRealTimeSpending = async (): Promise<Budget[]> => {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }
  
  try {
    // Use RPC function for efficient server-side calculation
    const { data, error } = await supabase.rpc('get_budgets_with_real_time_spending', {
      user_id_param: user.id
    });

    if (error) {
      console.error('Error calling RPC function:', error);
      return [];
    }

    // Map the RPC result to our interface (snake_case → camelCase)
    const result = (data || []).map((budget: BudgetWithSpendingResponse) => ({
      id: budget.id,
      userId: budget.user_id,
      category: budget.category,
      budgetAmount: Number(budget.budget_amount),
      spentAmount: Number(budget.spent_amount),
      remainingAmount: Number(budget.remaining_amount),
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date,
    }));

    return result;
  } catch (error) {
    console.error('Error in getCurrentUserBudgetsWithRealTimeSpending:', error);
    return [];
  }
};

export const createBudget = async (budgetData: {
  category: string;
  budgetAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  spentAmount?: number;
}) => {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    // Check if budget already exists for this category
    const { data: existingBudget } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('category', budgetData.category)
      .single();

    if (existingBudget) {
      return {
        success: false,
        error: 'Budget already exists for this category',
        errorType: 'BUDGET_EXISTS'
      };
    }

    const budgetId = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        id: budgetId,
        user_id: user.id,
        category: budgetData.category,
        budget_amount: budgetData.budgetAmount,
        spent_amount: budgetData.spentAmount || 0,
        remaining_amount: budgetData.budgetAmount - (budgetData.spentAmount || 0),
        period: budgetData.period,
        start_date: budgetData.startDate,
        end_date: budgetData.endDate
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      return { success: false, error: 'Failed to create budget' };
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
        endDate: data.end_date,
      }
    };
  } catch (error) {
    console.error('Error in createBudget:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const updateBudget = async (budgetId: string, budgetData: {
  category?: string;
  budgetAmount?: number;
  spentAmount?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Budget> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (budgetData.category !== undefined) updateData.category = budgetData.category;
    if (budgetData.budgetAmount !== undefined) updateData.budget_amount = budgetData.budgetAmount;
    if (budgetData.spentAmount !== undefined) updateData.spent_amount = budgetData.spentAmount;
    if (budgetData.period !== undefined) updateData.period = budgetData.period;
    if (budgetData.startDate !== undefined) updateData.start_date = budgetData.startDate;
    if (budgetData.endDate !== undefined) updateData.end_date = budgetData.endDate;

    const { data, error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', budgetId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      throw new Error('Failed to update budget');
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
      endDate: data.end_date,
    };
  } catch (error) {
    console.error('Error in updateBudget:', error);
    throw error;
  }
};

export const deleteBudget = async (budgetId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting budget:', error);
      throw new Error('Failed to delete budget');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteBudget:', error);
    throw error;
  }
};

// Get yearly budget analysis for bar chart (12 months for specified year)
export const getYearlyBudgetAnalysis = async (year?: number) => {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const currentYear = year || new Date().getFullYear();
    
    // Use RPC function for efficient server-side calculation
    const { data, error } = await supabase.rpc('get_yearly_budget_analysis', {
      user_id_param: user.id,
      year_param: currentYear
    });

    if (error) {
      console.error('Error calling yearly budget analysis RPC function:', error);
      return [];
    }

    // Map the RPC result to our expected format
    return (data || []).map((monthData: {
      month: string;
      spending: number;
      budget_limit: number;
      status: string;
    }) => ({
      month: monthData.month,
      spending: Number(monthData.spending),
      budgetLimit: Number(monthData.budget_limit),
      status: monthData.status as 'under' | 'over' | 'close'
    }));
  } catch (error) {
    console.error('Error in getYearlyBudgetAnalysis:', error);
    return [];
  }
};

// Legacy query keys for backwards compatibility
export const BUDGET_QUERY_KEYS = {
  budgets: ["budgets"] as const,
  userBudgets: (userId?: string) => ["budgets", "user", userId] as const,
} as const;

/**
 * Hook to fetch current user's budgets with real-time spending
 */
export function useBudgets() {
  return useQuery({
    queryKey: queryKeys.budgets.lists(),
    queryFn: async () => {
      return await getCurrentUserBudgetsWithRealTimeSpending();
    },
    staleTime: 30 * 1000, // 30 seconds - budgets should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single budget by ID
 */
export function useBudget(budgetId: string | undefined) {
  const { data: budgets = [] } = useBudgets();

  return useQuery({
    queryKey: queryKeys.budgets.detail(budgetId || ''),
    queryFn: async (): Promise<Budget | null> => {
      if (!budgetId) return null;
      
      // Try to find in the budgets list cache first
      const budget = budgets.find(b => b.id === budgetId);
      if (budget) return budget;

      // If not found and we have budgets, it doesn't exist
      if (budgets.length > 0) return null;

      // Otherwise fetch budgets and try again
      const allBudgets = await getCurrentUserBudgetsWithRealTimeSpending();
      return allBudgets.find(b => b.id === budgetId) || null;
    },
    enabled: !!budgetId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to get budgets by category
 */
export function useBudgetByCategory(category: string | undefined) {
  const { data: budgets = [], ...queryResult } = useBudgets();
  
  const budget = category ? budgets.find(b => b.category === category) : null;

  return {
    ...queryResult,
    data: budget,
  };
}

/**
 * Mutation hook to create a budget
 */
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetData: {
      category: string;
      budgetAmount: number;
      period: string;
      startDate: string;
      endDate: string;
    }) => {
      const isGuest = await checkGuestAndWarn("create budget");
      if (isGuest) {
        throw new Error("Guest users cannot create budgets");
      }
      return createBudget(budgetData);
    },
    onSuccess: (result) => {
      if (result.success) {
        Alert.alert("Success", "Budget created successfully!");
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
        // Legacy key
        queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEYS.budgets });
      } else {
        // Handle specific budget exists error
        if (result.errorType === "BUDGET_EXISTS") {
          Alert.alert("Budget Exists", result.error || "Budget already exists for this category");
          // Don't throw error for budget exists - just show the message
          return;
        } else {
          Alert.alert("Error", result.error || "Failed to create budget");
        }
        throw new Error(result.error || "Failed to create budget");
      }
    },
    onError: (error: Error) => {
      // Only show unexpected error for guest users or other actual errors
      if (error.message === "Guest users cannot create budgets") {
        // Guest error is already handled by checkGuestAndWarn
        return;
      }
      
      // Don't show unexpected error for budget exists errors
      if (error.message?.includes("Budget already exists")) {
        return;
      }
      
      console.error("Error creating budget:", error);
      Alert.alert("Error", "An unexpected error occurred");
    },
  });
}

/**
 * Mutation hook to update a budget
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      budgetData,
    }: {
      id: string;
      budgetData: { budgetAmount?: number; category?: string; period?: string; startDate?: string; endDate?: string };
    }) => {
      const isGuest = await checkGuestAndWarn("update budget");
      if (isGuest) {
        throw new Error("Guest users cannot update budgets");
      }
      return updateBudget(id, budgetData);
    },
    onSuccess: () => {
      Alert.alert("Success", "Budget updated successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      // Legacy key
      queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEYS.budgets });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot update budgets") {
        console.error("Error updating budget:", error);
        Alert.alert("Error", "Failed to update budget");
      }
    },
  });
}

/**
 * Mutation hook to delete a budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetId: string) => {
      const isGuest = await checkGuestAndWarn("delete budget");
      if (isGuest) {
        throw new Error("Guest users cannot delete budgets");
      }
      return deleteBudget(budgetId);
    },
    onSuccess: () => {
      Alert.alert("Success", "Budget deleted successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      // Legacy key
      queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEYS.budgets });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot delete budgets") {
        console.error("Error deleting budget:", error);
        Alert.alert("Error", "Failed to delete budget");
      }
    },
  });
}

/**
 * Hook to fetch yearly budget analysis
 */
export function useYearlyBudgetAnalysis(year?: number) {
  return useQuery({
    queryKey: queryKeys.budgets.yearly(year || new Date().getFullYear()),
    queryFn: async () => {
      return await getYearlyBudgetAnalysis(year);
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
