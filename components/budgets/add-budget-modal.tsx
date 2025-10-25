import React from "react";
import { View } from "react-native";
import { CategorySelect } from "../category-select";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select-mobile";

interface AddBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  budgetAmount: string;
  setBudgetAmount: (amount: string) => void;
  budgetPeriod: string;
  setBudgetPeriod: (period: string) => void;
  existingCategories: string[];
  onSubmit: () => void;
  onClose: () => void;
}

const periodOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Yearly", value: "yearly" },
];

// Helper function to get display label for period
const getPeriodLabel = (value: string) => {
  return periodOptions.find((option) => option.value === value)?.label || value;
};

export function AddBudgetModal({
  open,
  onOpenChange,
  selectedCategory,
  setSelectedCategory,
  budgetAmount,
  setBudgetAmount,
  budgetPeriod,
  setBudgetPeriod,
  existingCategories,
  onSubmit,
  onClose,
}: AddBudgetModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Add New Budget</DialogTitle>
          <DialogDescription>
            Create a new budget category with your desired spending limit.
          </DialogDescription>
        </DialogHeader>

        <View className="space-y-4 pb-4">
          <CategorySelect
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            type="expense"
            required
            className="w-full"
            existingCategories={existingCategories}
          />

          <View className="space-y-2 py-2">
            <Label>Budget Amount</Label>
            <Input
              placeholder="Enter budget amount"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="decimal-pad"
              returnKeyType="done"
              blurOnSubmit={true}
              className="w-full"
            />
          </View>

          <View className="space-y-2 py-2">
            <Label>Budget Period</Label>
            <Select value={budgetPeriod} onValueChange={setBudgetPeriod}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder="Select period"
                  displayValue={
                    budgetPeriod ? getPeriodLabel(budgetPeriod) : undefined
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </View>
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={onClose} className="w-full">
            Cancel
          </Button>
          <Button className="w-full mt-2" onPress={onSubmit}>
            Create Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
