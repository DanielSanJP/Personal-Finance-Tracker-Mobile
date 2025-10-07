import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkGuestAndWarn } from "@/lib/guest-protection";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./useAuth";
import { queryKeys } from "@/lib/query-keys";
import type { Goal } from "@/lib/types";

// Goal functions
export const getCurrentUserGoals = async (): Promise<Goal[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }

    return (data || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      name: goal.name,
      targetAmount: Number(goal.target_amount),
      currentAmount: Number(goal.current_amount),
      targetDate: goal.target_date,
      category: goal.category,
      priority: goal.priority,
      status: goal.status,
    }));
  } catch (error) {
    console.error('Error in getCurrentUserGoals:', error);
    return [];
  }
};

export const createGoal = async (goalData: {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  priority?: string;
  status: string;
}): Promise<Goal> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('goals')
      .insert({
        id: goalId,
        user_id: user.id,
        name: goalData.name,
        target_amount: goalData.targetAmount,
        current_amount: goalData.currentAmount || 0,
        target_date: goalData.targetDate || null,
        category: null,
        priority: goalData.priority || 'medium',
        status: goalData.status
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      throw new Error('Failed to create goal');
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      targetDate: data.target_date,
      category: data.category,
      priority: data.priority,
      status: data.status,
    };
  } catch (error) {
    console.error('Error in createGoal:', error);
    throw error;
  }
};

export const updateGoal = async (goalId: string, goalData: {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  category?: string;
  priority?: string;
  status?: string;
}): Promise<Goal> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (goalData.name !== undefined) updateData.name = goalData.name;
    if (goalData.targetAmount !== undefined) updateData.target_amount = goalData.targetAmount;
    if (goalData.currentAmount !== undefined) updateData.current_amount = goalData.currentAmount;
    if (goalData.targetDate !== undefined) updateData.target_date = goalData.targetDate;
    if (goalData.category !== undefined) updateData.category = goalData.category;
    if (goalData.priority !== undefined) updateData.priority = goalData.priority;
    if (goalData.status !== undefined) updateData.status = goalData.status;

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update goal');
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      targetDate: data.target_date,
      category: data.category,
      priority: data.priority,
      status: data.status,
    };
  } catch (error) {
    console.error('Error in updateGoal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw new Error('Failed to delete goal');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteGoal:', error);
    throw error;
  }
};

export const makeGoalContribution = async (contributionData: {
  goalId: string;
  accountId: string;
  amount: number;
  date: Date;
  notes?: string;
}) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // Use RPC function for atomic goal contribution transaction
    const { data, error } = await supabase.rpc('make_goal_contribution', {
      p_user_id: user.id,
      p_goal_id: contributionData.goalId,
      p_account_id: contributionData.accountId,
      p_amount: contributionData.amount,
      p_date: contributionData.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      p_notes: contributionData.notes || 'Goal contribution'
    });

    if (error) {
      console.error('RPC error:', error);
      throw new Error(`Failed to make goal contribution: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in makeGoalContribution:', error);
    throw error;
  }
};

// Legacy query keys for backwards compatibility
const GOAL_QUERY_KEYS = {
  goals: ["goals"],
  accounts: ["accounts"],
};

/**
 * Hook to fetch current user's goals
 */
export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals.lists(),
    queryFn: async () => {
      const data = await getCurrentUserGoals();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single goal by ID
 */
export function useGoal(goalId: string | undefined) {
  const { data: goals = [] } = useGoals();

  return useQuery({
    queryKey: queryKeys.goals.detail(goalId || ''),
    queryFn: async (): Promise<Goal | null> => {
      if (!goalId) return null;
      
      // Try to find in the goals list cache first
      const goal = goals.find(g => g.id === goalId);
      if (goal) return goal;

      // If not found and we have goals, it doesn't exist
      if (goals.length > 0) return null;

      // Otherwise fetch goals and try again
      const allGoals = await getCurrentUserGoals();
      return allGoals.find(g => g.id === goalId) || null;
    },
    enabled: !!goalId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to get active goals only
 */
export function useActiveGoals() {
  const { data: goals = [], ...queryResult } = useGoals();
  
  const activeGoals = goals.filter(goal => goal.status === 'active' || goal.status === 'in_progress');

  return {
    ...queryResult,
    data: activeGoals,
  };
}

/**
 * Hook to get goals by priority
 */
export function useGoalsByPriority(priority: string | undefined) {
  const { data: goals = [], ...queryResult } = useGoals();
  
  const filteredGoals = priority ? goals.filter(g => g.priority === priority) : goals;

  return {
    ...queryResult,
    data: filteredGoals,
  };
}

/**
 * Mutation hook to create a goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData: {
      name: string;
      targetAmount: number;
      currentAmount?: number;
      targetDate?: string;
      priority?: string;
      status: string;
    }) => {
      const isGuest = await checkGuestAndWarn("create goals");
      if (isGuest) {
        throw new Error("Guest users cannot create goals");
      }
      return createGoal(goalData);
    },
    onSuccess: () => {
      // Invalidate goals and dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      // Legacy compatibility
      queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEYS.goals });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot create goals") {
        console.error("Error creating goal:", error);
      }
    },
  });
}

/**
 * Mutation hook to update a goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      goalData,
    }: {
      goalId: string;
      goalData: {
        name?: string;
        targetAmount?: number;
        currentAmount?: number;
        targetDate?: string | null;
        category?: string | null;
        priority?: string | null;
        status?: string;
      };
    }) => {
      const isGuest = await checkGuestAndWarn("edit goals");
      if (isGuest) {
        throw new Error("Guest users cannot update goals");
      }
      
      // Convert null values to undefined for the API
      const apiData = {
        name: goalData.name,
        targetAmount: goalData.targetAmount,
        currentAmount: goalData.currentAmount,
        targetDate: goalData.targetDate || undefined,
        category: goalData.category || undefined,
        priority: goalData.priority || undefined,
        status: goalData.status,
      };

      return updateGoal(goalId, apiData);
    },
    onSuccess: () => {
      // Invalidate goals and dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      // Legacy compatibility
      queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEYS.goals });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot update goals") {
        console.error("Error updating goal:", error);
      }
    },
  });
}

/**
 * Mutation hook to delete a goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const isGuest = await checkGuestAndWarn("delete goals");
      if (isGuest) {
        throw new Error("Guest users cannot delete goals");
      }
      return deleteGoal(goalId);
    },
    onSuccess: () => {
      // Invalidate goals and dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      // Legacy compatibility
      queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEYS.goals });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot delete goals") {
        console.error("Error deleting goal:", error);
      }
    },
  });
}

/**
 * Mutation hook to make a goal contribution
 */
export function useMakeGoalContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contributionData: {
      goalId: string;
      accountId: string;
      amount: number;
      date: Date;
      notes?: string;
    }) => {
      const isGuest = await checkGuestAndWarn("make goal contributions");
      if (isGuest) {
        throw new Error("Guest users cannot make goal contributions");
      }
      return makeGoalContribution(contributionData);
    },
    onSuccess: () => {
      // Invalidate ALL related queries for comprehensive data consistency
      // Goal contributions affect accounts, goals, transactions, and dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      
      // Legacy key invalidations for backwards compatibility
      queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEYS.goals });
      queryClient.invalidateQueries({ queryKey: GOAL_QUERY_KEYS.accounts });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: Error) => {
      if (error.message !== "Guest users cannot make goal contributions") {
        console.error("Error making contribution:", error);
      }
    },
  });
}
