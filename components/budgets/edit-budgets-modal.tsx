import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
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
  budgetsToDelete: string[];
  setBudgetsToDelete: React.Dispatch<React.SetStateAction<string[]>>;
  onSaveAll: () => void;
  onClose: () => void;
}

export function EditBudgetsModal({
  open,
  onOpenChange,
  budgets,
  editedBudgets,
  setEditedBudgets,
  budgetsToDelete,
  setBudgetsToDelete,
  onSaveAll,
  onClose,
}: EditBudgetsModalProps) {
  const handleDeleteBudget = (budgetId: string) => {
    setBudgetsToDelete((prev) => [...prev, budgetId]);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Budget Categories</DialogTitle>
          <DialogDescription>
            Modify your existing budget amounts and categories.
          </DialogDescription>
        </DialogHeader>

        <View className="space-y-4">
          {budgets
            .filter((budget) => !budgetsToDelete.includes(budget.id))
            .map((budget, index) => (
              <View
                key={budget.id}
                className={`space-y-3 p-4 border border-gray-200 rounded-lg bg-white ${
                  index > 0 ? "mt-2" : ""
                }`}
              >
                {/* Budget Category with Delete Icon */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold">
                    {budget.category}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteBudget(budget.id)}
                    className="p-2"
                  >
                    <Feather name="trash-2" size={20} color="#dc2626" />
                  </Pressable>
                </View>

                <View className="space-y-2">
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

                <Text className="text-sm text-gray-600">
                  Current spending: ${budget.spentAmount.toFixed(2)}
                </Text>
              </View>
            ))}
        </View>

        <DialogFooter className="flex-row gap-4">
          <Button variant="outline" onPress={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onPress={onSaveAll} className="flex-1">
            Save All Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
