import { DEFAULT_PREFERENCES, usePreferences } from './queries/usePreferences';

/**
 * Custom hook to easily access user preferences with defaults
 * Returns preferences with fallback to defaults if not loaded or guest user
 */
export function useUserPreferences() {
  const { data: userPreferences, isLoading } = usePreferences();

  // Use database preferences or defaults
  const preferences = userPreferences || DEFAULT_PREFERENCES;

  return {
    // Appearance
    currency: preferences.currency,
    language: preferences.language,
    
    // Notifications
    emailNotifications: preferences.email_notifications,
    budgetAlerts: preferences.budget_alerts,
    goalReminders: preferences.goal_reminders,
    weeklyReports: preferences.weekly_reports,
    
    // Display
    showAccountNumbers: preferences.show_account_numbers,
    compactView: preferences.compact_view,
    showCents: preferences.show_cents,
    
    // Loading state
    isLoading,
  };
}
