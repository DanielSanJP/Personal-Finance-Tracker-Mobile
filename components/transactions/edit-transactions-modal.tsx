import React from "react";
import { ScrollView, Text, View } from "react-native";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../../constants/categories";
import type { Transaction } from "../../lib/types";
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
import { formatDate } from "./transaction-utils";

interface EditTransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  onClose: () => void;
  onSave: () => void;
}

export function EditTransactionsModal({
  open,
  onOpenChange,
  transactions,
  onClose,
  onSave,
}: EditTransactionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Multiple Transactions</DialogTitle>
          <DialogDescription>
            Note: Amount and Type cannot be edited for data integrity.
          </DialogDescription>
        </DialogHeader>

        <ScrollView className="max-h-[500px]">
          <View className="space-y-6 py-4">
            {transactions.map((transaction) => {
              // Check if category is special (system-managed)
              const isSpecialCategory =
                transaction.category === "Transfer" ||
                transaction.category === "Goal Contribution";

              // Check if category is in predefined lists
              const categories =
                transaction.type === "income"
                  ? INCOME_CATEGORIES
                  : EXPENSE_CATEGORIES;
              const isInPredefinedList = categories.some(
                (cat) => cat.name === transaction.category
              );

              // Show read-only field for special or legacy categories
              const shouldShowReadOnly =
                !isInPredefinedList &&
                transaction.category &&
                transaction.category.trim() !== "";

              // Get party field label based on transaction type
              const getPartyLabel = () => {
                if (transaction.type === "expense") return "Paid To";
                if (transaction.type === "income") return "Received From";
                if (transaction.type === "transfer") return "Transferred To";
                return "Party";
              };

              // Get correct party value based on transaction type
              const getPartyValue = () => {
                if (transaction.type === "expense")
                  return transaction.to_party || "";
                if (transaction.type === "income")
                  return transaction.from_party || "";
                if (transaction.type === "transfer")
                  return transaction.to_party || "";
                return "";
              };

              return (
                <View
                  key={transaction.id}
                  className="space-y-3 p-4 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark shadow-sm mb-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium text-foreground-light dark:text-foreground-dark">
                      {transaction.description}
                    </Text>
                    <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                  <View className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      defaultValue={transaction.description}
                      className="w-full"
                    />
                  </View>

                  {/* Amount (LOCKED) */}
                  <View className="space-y-2">
                    <Label>Amount (Cannot Edit)</Label>
                    <Input
                      value={`$${Math.abs(transaction.amount).toFixed(2)}`}
                      editable={false}
                      className="w-full bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark"
                    />
                  </View>

                  {/* Type (LOCKED) */}
                  <View className="space-y-2">
                    <Label>Type (Cannot Edit)</Label>
                    <Input
                      value={
                        transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)
                      }
                      editable={false}
                      className="w-full bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark"
                    />
                  </View>

                  {/* Party Field (Dynamic Label) */}
                  <View className="space-y-2">
                    <Label>{getPartyLabel()}</Label>
                    <Input
                      defaultValue={getPartyValue()}
                      placeholder={`Enter ${getPartyLabel().toLowerCase()}`}
                      className="w-full"
                    />
                  </View>

                  {/* Category - Handle special and legacy categories */}
                  {shouldShowReadOnly ? (
                    <View className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={transaction.category || ""}
                        editable={false}
                        className="w-full bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark"
                      />
                      <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                        {isSpecialCategory
                          ? "💡 System-managed category (cannot be changed)"
                          : "💡 Legacy category from previous version (cannot be changed)"}
                      </Text>
                    </View>
                  ) : (
                    <CategorySelect
                      value={transaction.category || ""}
                      onValueChange={(value) => {
                        // Handle category change (you'll need to implement state management)
                        console.log(`Category changed to: ${value}`);
                      }}
                      type={transaction.type as "expense" | "income"}
                      required={true}
                      className="w-full"
                    />
                  )}

                  <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                    Status: {transaction.status}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <DialogFooter className="gap-2 flex-row border-t border-border-light dark:border-border-dark pt-4 mt-4">
          <Button variant="outline" onPress={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onPress={onSave} className="flex-1">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
