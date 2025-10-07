/**
 * Helper function to format transaction type for display
 */
export const formatTransactionType = (type: string) => {
  switch (type) {
    case "income":
      return "Income";
    case "expense":
      return "Expense";
    case "transfer":
      return "Transfer";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

/**
 * Helper function to check if date is within period
 */
export const isDateInPeriod = (dateString: string, period: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  switch (period) {
    case "This Month":
      return (
        date.getFullYear() === currentYear && date.getMonth() === currentMonth
      );
    case "Last Month":
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear =
        currentMonth === 0 ? currentYear - 1 : currentYear;
      return (
        date.getFullYear() === lastMonthYear && date.getMonth() === lastMonth
      );
    case "Last 3 Months":
      const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const threeMonthsAgo = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 3,
        1
      );
      const transactionDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );
      return transactionDate >= threeMonthsAgo;
    case "This Year":
      return date.getFullYear() === currentYear;
    case "All Time":
      return true;
    default:
      return true;
  }
};

/**
 * Format date for display (short format)
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date for display (full format)
 */
export const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Get color class for amount based on transaction type
 */
export const getAmountColor = (type: string) => {
  if (type === "income") return "text-green-600";
  return "text-red-600";
};
