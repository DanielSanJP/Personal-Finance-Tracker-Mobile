import React from "react";
import { View, Text } from "react-native";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Category,
} from "../constants/categories";

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
}: CategorySelectProps) {
  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const defaultLabel = type === "expense" ? "Category" : "Income Category";

  const formatCategoryDisplay = (category: Category) => {
    if (showIcons && category.icon) {
      return `${category.icon} ${category.name}`;
    }
    return category.name;
  };

  return (
    <View className="space-y-2">
      {showLabel && (
        <Label className="text-base font-medium">
          {label || defaultLabel}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {formatCategoryDisplay(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </View>
  );
}

export default CategorySelect;
