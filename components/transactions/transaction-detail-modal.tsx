import React from "react";
import { Text, View } from "react-native";
import type { Transaction } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";
import { useGoals } from "../../hooks/queries/useGoals";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { getAmountColor } from "./transaction-utils";

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  const { data: goals = [] } = useGoals();

  // Helper function to get goal name from ID
  const getGoalName = (goalId: string | null | undefined): string | null => {
    if (!goalId) return null;
    const goal = goals.find((g) => g.id === goalId);
    return goal?.name || null;
  };

  // Format full date time with day of week
  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about this transaction.
          </DialogDescription>
        </DialogHeader>
        {transaction && (
          <View className="space-y-4">
            <View className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">
                Description
              </Label>
              <Text className="text-base font-semibold">
                {transaction.description}
              </Text>
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Amount
                </Label>
                <Text
                  className={`text-xl font-bold ${getAmountColor(
                    transaction.type
                  )}`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(Math.abs(transaction.amount))}
                </Text>
              </View>
              <View className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Type
                </Label>
                <Text className="text-base capitalize">{transaction.type}</Text>
              </View>
            </View>

            {/* From/To Grid */}
            <View className="flex-row space-x-4">
              <View className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  From
                </Label>
                <Text className="text-base">
                  {transaction.from_party || "N/A"}
                </Text>
              </View>
              <View className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-600">To</Label>
                <Text className="text-base">
                  {(() => {
                    const goalName = getGoalName(
                      transaction.destination_account_id
                    );
                    if (goalName) return `${goalName} (Goal)`;
                    return transaction.to_party || "N/A";
                  })()}
                </Text>
              </View>
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Category
                </Label>
                <Text className="text-base">{transaction.category}</Text>
              </View>
              <View className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Status
                </Label>
                <Text className="text-base capitalize">
                  {transaction.status}
                </Text>
              </View>
            </View>

            <View className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Date</Label>
              <Text className="text-base">
                {formatFullDateTime(transaction.date)}
              </Text>
            </View>

            <View className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">
                Transaction ID
              </Label>
              <Text className="text-sm text-gray-500 font-mono">
                {transaction.id}
              </Text>
            </View>
          </View>
        )}
        <DialogFooter>
          <Button variant="outline" onPress={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
