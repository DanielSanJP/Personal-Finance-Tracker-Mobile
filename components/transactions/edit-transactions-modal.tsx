import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { Transaction } from "../../lib/types";
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
            {transactions.map((transaction) => (
              <View
                key={transaction.id}
                className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-medium">
                    {transaction.description}
                  </Text>
                  <Text className="text-sm text-gray-500">
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
                    className="w-full bg-gray-100 text-gray-500"
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
                    className="w-full bg-gray-100 text-gray-500"
                  />
                </View>

                <View className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    defaultValue={transaction.category || ""}
                    className="w-full"
                  />
                </View>

                <Text className="text-sm text-gray-600">
                  Status: {transaction.status}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <DialogFooter className="gap-2 flex-row border-t border-gray-200 pt-4 mt-4">
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
