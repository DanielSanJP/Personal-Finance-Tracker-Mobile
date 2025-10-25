import React from "react";
import { Text, View } from "react-native";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Category,
} from "../constants/categories";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select-mobile";

interface CategorySelectProps {
  /**
   * Currently selected category value
   */
  value?: string;
  /**
   * Called when category changes
   */
  onValueChange: (value: string) => void;
  /**
   * Type of categories to show
   */
  type?: "expense" | "income";
  /**
   * Whether to show the label
   */
  showLabel?: boolean;
  /**
   * Custom label text
   */
  label?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether to show icons in the dropdown
   */
  showIcons?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Array of categories that are already added (to show "Added" indicator)
   */
  existingCategories?: string[];
}

export function CategorySelect({
  value,
  onValueChange,
  type = "expense",
  showLabel = true,
  label,
  placeholder = "Select category...",
  showIcons = true,
  className,
  required = false,
  existingCategories = [],
}: CategorySelectProps) {
  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const defaultLabel = type === "expense" ? "Category" : "Income Category";

  const formatCategoryDisplay = (category: Category) => {
    const isAlreadyAdded = existingCategories.includes(category.name);
    let display =
      showIcons && category.icon
        ? `${category.icon} ${category.name}`
        : category.name;
    if (isAlreadyAdded) {
      display += " (Added)";
    }
    return display;
  };

  return (
    <View className="space-y-2">
      {showLabel && (
        <Label className="text-base font-medium">
          {label || defaultLabel}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={(val) => {
          // Prevent selection of already added categories
          const isAlreadyAdded = existingCategories.includes(val);
          if (!isAlreadyAdded) {
            onValueChange(val);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => {
            const isAlreadyAdded = existingCategories.includes(category.name);
            return (
              <SelectItem
                key={category.id}
                value={category.name}
                className={isAlreadyAdded ? "opacity-40" : ""}
              >
                {formatCategoryDisplay(category)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </View>
  );
}

export default CategorySelect;
