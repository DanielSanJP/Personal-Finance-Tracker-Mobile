import { formatCurrency } from "../../lib/utils";

/**
 * Priority options with display labels and database values
 */
export const priorityOptions = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

/**
 * Helper function to get display label for priority
 */
export const getPriorityLabel = (value: string) => {
  return (
    priorityOptions.find((option) => option.value === value)?.label || value
  );
};

/**
 * Helper function to extract goal ID from display value
 */
export const getGoalIdFromDisplayValue = (
  displayValue: string,
  goals: { id: string; name: string; currentAmount: number; targetAmount: number }[]
) => {
  const goal = goals.find(
    (g) =>
      `${g.name} (${formatCurrency(g.currentAmount)} / ${formatCurrency(
        g.targetAmount
      )})` === displayValue
  );
  return goal?.id || "";
};

/**
 * Helper function to extract account ID from display value
 */
export const getAccountIdFromDisplayValue = (
  displayValue: string,
  accounts: { id: string; name: string; balance: number }[]
) => {
  const account = accounts.find(
    (acc) => `${acc.name} (${formatCurrency(acc.balance)})` === displayValue
  );
  return account?.id || "";
};

/**
 * Progress calculation function
 */
export const getProgressWidth = (current: number, target: number) => {
  if (current === 0 || target === 0) return 0;
  const percentage = Math.min((current / target) * 100, 100);
  return percentage;
};

/**
 * Format date consistently with the date picker
 */
export const formatTargetDate = (dateString?: string): string => {
  if (!dateString) return "No target date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
