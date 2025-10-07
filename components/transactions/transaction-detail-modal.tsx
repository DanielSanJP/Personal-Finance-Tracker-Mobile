import React from "react";
import { Text, View } from "react-native";
import type { Transaction } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";
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
import { formatFullDate, getAmountColor } from "./transaction-utils";

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
              <Label className="text-sm font-medium text-gray-600">
                Merchant
              </Label>
              <Text className="text-base">{transaction.merchant}</Text>
            </View>

            <View className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Date</Label>
              <Text className="text-base">
                {formatFullDate(transaction.date)}
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
