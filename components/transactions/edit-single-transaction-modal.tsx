import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { Transaction } from "../../lib/types";
import { useUpdateTransaction } from "../../hooks/queries/useTransactions";
import { CategorySelect } from "../category-select";
import { Button } from "../ui/button";
import { DateTimePicker } from "../ui/date-time-picker";
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
import { useToast } from "../ui/sonner";

interface EditSingleTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onClose: () => void;
}

export function EditSingleTransactionModal({
  open,
  onOpenChange,
  transaction,
  onClose,
}: EditSingleTransactionModalProps) {
  const toast = useToast();
  const updateMutation = useUpdateTransaction();

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<
    "pending" | "completed" | "cancelled" | "failed"
  >("completed");
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Sync form with transaction prop
  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setCategory(transaction.category || "");
      setStatus(transaction.status);
      setDate(new Date(transaction.date));
    }
  }, [transaction]);

  const handleSave = async () => {
    if (!transaction) return;

    if (!description || !category || !date) {
      toast.toast({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        updates: {
          description,
          category,
          status,
          date: date.toISOString(),
        },
      });

      toast.toast({
        message: "Transaction updated successfully!",
        type: "success",
      });

      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.toast({
        message: "Failed to update transaction",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Note: Amount and Type cannot be edited for data integrity.
          </DialogDescription>
        </DialogHeader>

        <ScrollView className="max-h-[500px]">
          {transaction && (
            <View className="space-y-4 py-4">
              {/* Description */}
              <View className="space-y-2">
                <Label>
                  Description <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Transaction description"
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
                <Text className="text-xs text-gray-500">
                  💡 Amount cannot be edited. Delete and recreate the
                  transaction if needed.
                </Text>
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
                <Text className="text-xs text-gray-500">
                  💡 Type cannot be edited. Delete and recreate the transaction
                  if needed.
                </Text>
              </View>

              {/* Category */}
              <CategorySelect
                value={category}
                onValueChange={setCategory}
                type={transaction.type as "expense" | "income"}
                required={true}
                className="w-full"
              />

              {/* Status */}
              <View className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value: any) => setStatus(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </View>

              {/* Date & Time */}
              <View className="py-2">
                <DateTimePicker
                  date={date}
                  onDateTimeChange={setDate}
                  placeholder="Select date"
                  showLabel={true}
                  required={true}
                />
              </View>
            </View>
          )}
        </ScrollView>

        <DialogFooter className="gap-2 flex-row pt-4">
          <Button variant="outline" onPress={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onPress={handleSave} className="flex-1">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
