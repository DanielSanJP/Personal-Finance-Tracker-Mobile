/**
 * Helper function to calculate period dates
 */
export const calculatePeriodDates = (period: string) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case "weekly":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
      break;
    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1); // Jan 1
      endDate = new Date(now.getFullYear(), 11, 31); // Dec 31
      break;
    case "monthly":
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

/**
 * Period options with display labels and database values
 */
export const periodOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Yearly", value: "yearly" },
];

/**
 * Helper function to get display label for period
 */
export const getPeriodLabel = (value: string) => {
  return (
    periodOptions.find((option) => option.value === value)?.label || value
  );
};

/**
 * Get budget status based on spent amount
 */
export const getBudgetStatus = (spent: number, budget: number) => {
  const percentage = (spent / budget) * 100;
  if (percentage > 100) return { status: "over", color: "red" };
  if (percentage >= 100) return { status: "full", color: "red" };
  if (percentage > 80) return { status: "warning", color: "orange" };
  return { status: "good", color: "gray" };
};

/**
 * Calculate progress width percentage
 */
export const getProgressWidth = (spent: number, budget: number) => {
  const percentage = Math.min((spent / budget) * 100, 100);
  return percentage;
};
