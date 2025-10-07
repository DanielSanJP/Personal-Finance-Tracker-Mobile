import React from "react";
import { View } from "react-native";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EditSingleTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: () => void;
}

export function EditSingleTransactionModal({
  open,
  onOpenChange,
  transaction,
  onClose,
  onSave,
}: EditSingleTransactionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[425px]" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the details of this transaction.
          </DialogDescription>
        </DialogHeader>
        {transaction && (
          <View className="space-y-4 py-4">
            <View className="space-y-2">
              <Label>Description</Label>
              <Input
                defaultValue={transaction.description}
                className="w-full"
              />
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-1 space-y-2">
                <Label>Amount</Label>
                <Input
                  defaultValue={Math.abs(transaction.amount).toString()}
                  className="w-full"
                />
              </View>
              <View className="flex-1 space-y-2">
                <Label>Type</Label>
                <Select value={transaction.type} onValueChange={() => {}}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </View>
            </View>

            <View className="flex-row space-x-4">
              <View className="flex-1 space-y-2">
                <Label>Category</Label>
                <Input defaultValue={transaction.category} className="w-full" />
              </View>
              <View className="flex-1 space-y-2">
                <Label>Status</Label>
                <Select value={transaction.status} onValueChange={() => {}}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </View>
            </View>

            <View className="space-y-2">
              <Label>Merchant</Label>
              <Input defaultValue={transaction.merchant} className="w-full" />
            </View>

            <View className="space-y-2">
              <Label>Date</Label>
              <Input defaultValue={transaction.date} className="w-full" />
            </View>
          </View>
        )}
        <DialogFooter className="gap-2 flex-row">
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
