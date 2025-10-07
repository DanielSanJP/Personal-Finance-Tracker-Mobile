import React from "react";
import { Text, View } from "react-native";
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

export interface Budget {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
}

interface EditBudgetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgets: Budget[];
  editedBudgets: { [key: string]: string };
  setEditedBudgets: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  onSaveBudget: (budgetId: string) => void;
  onDeleteBudget: (budgetId: string, category: string) => void;
  onClose: () => void;
}

export function EditBudgetsModal({
  open,
  onOpenChange,
  budgets,
  editedBudgets,
  setEditedBudgets,
  onSaveBudget,
  onDeleteBudget,
  onClose,
}: EditBudgetsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Budget Categories</DialogTitle>
          <DialogDescription>
            Modify your existing budget amounts and categories.
          </DialogDescription>
        </DialogHeader>

        <View className="space-y-6">
          {budgets.map((budget, index) => (
            <View
              key={budget.id}
              className={`space-y-3 p-4 border border-gray-200 rounded-lg bg-white ${
                index > 0 ? "mt-4" : ""
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium">{budget.category}</Text>
              </View>

              <View className="space-y-2 py-2">
                <Label>Budget Amount</Label>
                <Input
                  value={
                    budget.id in editedBudgets
                      ? editedBudgets[budget.id]
                      : budget.budgetAmount.toString()
                  }
                  onChangeText={(text) =>
                    setEditedBudgets((prev) => ({
                      ...prev,
                      [budget.id]: text,
                    }))
                  }
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  className="w-full"
                />
              </View>

              <Text className="text-sm text-gray-600 py-2">
                Current spending: ${budget.spentAmount.toFixed(2)}
              </Text>

              {/* Individual Save and Delete buttons */}
              <View className="flex-row gap-4 pt-2">
                <Button
                  onPress={() => onSaveBudget(budget.id)}
                  className="min-w-[130px]"
                  size="sm"
                >
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onPress={() => onDeleteBudget(budget.id, budget.category)}
                  className="min-w-[130px]"
                  size="sm"
                >
                  Delete
                </Button>
              </View>
            </View>
          ))}
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
