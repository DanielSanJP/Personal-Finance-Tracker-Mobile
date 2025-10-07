import React from "react";
import { Text, View } from "react-native";
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
          <DialogTitle>Edit All Transactions</DialogTitle>
          <DialogDescription>
            Modify your existing transactions and their details.
          </DialogDescription>
        </DialogHeader>

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
              <View className="flex-row space-x-2">
                <View className="flex-1 space-y-2">
                  <Label>Description</Label>
                  <Input
                    defaultValue={transaction.description}
                    className="w-full"
                  />
                </View>
                <View className="flex-1 space-y-2">
                  <Label>Amount</Label>
                  <Input
                    defaultValue={Math.abs(transaction.amount).toString()}
                    className="w-full"
                  />
                </View>
              </View>
              <View className="flex-row space-x-2">
                <View className="flex-1 space-y-2">
                  <Label>Category</Label>
                  <Input
                    defaultValue={transaction.category}
                    className="w-full"
                  />
                </View>
                <View className="flex-1 space-y-2">
                  <Label>Merchant</Label>
                  <Input
                    defaultValue={transaction.merchant}
                    className="w-full"
                  />
                </View>
              </View>
              <Text className="text-sm text-gray-600">
                Type: {transaction.type} | Status: {transaction.status}
              </Text>
            </View>
          ))}
        </View>

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
