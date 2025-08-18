/**
 * Standardized category system for transactions and budgets
 * This ensures consistency across the app
 */

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: "food-dining",
    name: "Food & Dining",
    icon: "🍽️",
    description: "Restaurants, groceries, takeout"
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "🚗",
    description: "Gas, public transport, car maintenance"
  },
  {
    id: "housing",
    name: "Housing",
    icon: "🏠",
    description: "Rent, mortgage, property taxes"
  },
  {
    id: "utilities",
    name: "Bills & Utilities",
    icon: "💡",
    description: "Electricity, water, internet, phone"
  },
  {
    id: "healthcare",
    name: "Health & Fitness",
    icon: "🏥",
    description: "Medical, dental, gym, supplements"
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "🛍️",
    description: "Clothing, electronics, household items"
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "🎬",
    description: "Movies, concerts, games, subscriptions"
  },
  {
    id: "travel",
    name: "Travel",
    icon: "✈️",
    description: "Flights, hotels, vacation expenses"
  },
  {
    id: "education",
    name: "Education",
    icon: "📚",
    description: "Books, courses, tuition, training"
  },
  {
    id: "personal-care",
    name: "Personal Care",
    icon: "💅",
    description: "Haircuts, beauty products, clothing"
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: "🛡️",
    description: "Health, car, home, life insurance"
  },
  {
    id: "investment",
    name: "Investment",
    icon: "📈",
    description: "Stocks, bonds, retirement contributions"
  },
  {
    id: "other",
    name: "Other",
    icon: "📦",
    description: "Miscellaneous expenses"
  }
];

export const INCOME_CATEGORIES: Category[] = [
  {
    id: "salary",
    name: "Salary",
    icon: "💼",
    description: "Regular employment income"
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: "💻",
    description: "Contract and freelance work"
  },
  {
    id: "business",
    name: "Business",
    icon: "🏢",
    description: "Business income and profits"
  },
  {
    id: "investment-income",
    name: "Investment Income",
    icon: "📊",
    description: "Dividends, interest, capital gains"
  },
  {
    id: "rental",
    name: "Rental Income",
    icon: "🏘️",
    description: "Property rental income"
  },
  {
    id: "gift",
    name: "Gift/Bonus",
    icon: "🎁",
    description: "Gifts, bonuses, winnings"
  },
  {
    id: "refund",
    name: "Refund",
    icon: "💰",
    description: "Tax refunds, returns"
  },
  {
    id: "other-income",
    name: "Other Income",
    icon: "📦",
    description: "Miscellaneous income"
  }
];

/**
 * Get category by ID
 */
export const getCategoryById = (id: string, type: 'expense' | 'income' = 'expense'): Category | undefined => {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  return categories.find(category => category.id === id);
};

/**
 * Get category names only (for backwards compatibility)
 */
export const getExpenseCategoryNames = (): string[] => {
  return EXPENSE_CATEGORIES.map(category => category.name);
};

export const getIncomeCategoryNames = (): string[] => {
  return INCOME_CATEGORIES.map(category => category.name);
};

/**
 * Get category name by ID
 */
export const getCategoryName = (id: string, type: 'expense' | 'income' = 'expense'): string => {
  const category = getCategoryById(id, type);
  return category?.name || 'Other';
};
