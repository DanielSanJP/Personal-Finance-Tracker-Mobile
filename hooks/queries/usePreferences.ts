import { queryKeys } from '@/lib/query-keys';
import { supabase } from '@/lib/supabase';
import type { UpdateUserPreferences, UserPreferences } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, useAuth } from './useAuth';

/**
 * Get current user's preferences
 */
async function getUserPreferences(): Promise<UserPreferences | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If preferences don't exist yet, create default ones
    if (error.code === 'PGRST116') {
      const { data: newPrefs, error: createError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating default preferences:', createError);
        throw new Error(`Failed to create preferences: ${createError.message}`);
      }

      return newPrefs as UserPreferences;
    }

    console.error('Error fetching preferences:', error);
    throw new Error(`Failed to fetch preferences: ${error.message}`);
  }

  return data as UserPreferences;
}

/**
 * Update user preferences
 */
async function updateUserPreferences(
  updates: UpdateUserPreferences
): Promise<UserPreferences> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_preferences')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating preferences:', error);
    throw new Error(`Failed to update preferences: ${error.message}`);
  }

  return data as UserPreferences;
}

/**
 * Hook to get current user's preferences
 */
export function usePreferences() {
  const { isGuest } = useAuth();

  return useQuery({
    queryKey: queryKeys.preferences.current(),
    queryFn: getUserPreferences,
    staleTime: isGuest ? 30 * 60 * 1000 : 10 * 60 * 1000, // Preferences don't change often
    gcTime: 60 * 60 * 1000, // Cache for 1 hour
    refetchOnWindowFocus: false, // Don't refetch preferences on window focus
    enabled: !isGuest, // Don't fetch for guest users
  });
}

/**
 * Hook to update user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: (data) => {
      // Update cache with new preferences
      queryClient.setQueryData(queryKeys.preferences.current(), data);
      
      // Invalidate related queries that might depend on preferences
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

// Default preferences for guest mode or fallback
export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  currency: 'USD',
  language: 'English',
  email_notifications: true,
  budget_alerts: true,
  goal_reminders: false,
  weekly_reports: true,
  show_account_numbers: false,
  compact_view: false,
  show_cents: true,
};
