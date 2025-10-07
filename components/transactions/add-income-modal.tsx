import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { getIncomeCategoryNames } from "../../constants/categories";
import { useAccounts } from "../../hooks/queries/useAccounts";
import { useCreateIncomeTransaction } from "../../hooks/queries/useTransactions";
import { CategorySelect } from "../category-select";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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

interface AddIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function AddIncomeModal({
  open,
  onOpenChange,
  onClose,
}: AddIncomeModalProps) {
  const toast = useToast();
  const { data: accounts = [] } = useAccounts();
  const createIncomeMutation = useCreateIncomeTransaction();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setAmount("");
      setDescription("");
      setIncomeSource("");
      setAccount("");
      setDate(new Date());
    }
  }, [open]);

  const handleQuickAdd = (source: string) => {
    setIncomeSource(source);
    setDescription(source);
  };

  const getAccountIdFromDisplayValue = (displayValue: string) => {
    const account = accounts.find(
      (acc) => `${acc.name} (${acc.type})` === displayValue
    );
    return account?.id || "";
  };

  const handleSubmit = async () => {
    if (!amount || !description || !incomeSource || !account || !date) {
      toast.toast({
        message: "Error: Please fill in all required fields",
        type: "error",
      });
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.toast({
        message: "Error: Please enter a valid positive number for the amount",
        type: "error",
      });
      return;
    }

    try {
      const accountId = getAccountIdFromDisplayValue(account);

      await createIncomeMutation.mutateAsync({
        amount: Number(amount),
        description: description,
        source: incomeSource,
        accountId: accountId,
        date: date,
      });

      toast.toast({
        message:
          "Success: Income saved successfully! Your income has been recorded.",
        type: "success",
      });

      // Reset form and close modal
      setAmount("");
      setDescription("");
      setIncomeSource("");
      setAccount("");
      setDate(new Date());
      onClose();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving income:", error);
      toast.toast({
        message: "Error: An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    onClose();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]" onClose={handleCancel}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center py-2">
            Add New Income
          </DialogTitle>
        </DialogHeader>

        <ScrollView className="flex-1">
          <View className="space-y-6 p-4">
            {/* Amount */}
            <View className="space-y-2 py-2">
              <Label>Amount</Label>
              <Input
                keyboardType="numeric"
                returnKeyType="done"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                className="px-4 py-3"
              />
            </View>

            {/* Description */}
            <View className="space-y-2 py-2">
              <Label>Description</Label>
              <Input
                placeholder="Source of income..."
                value={description}
                onChangeText={setDescription}
                className="px-4 py-3"
              />
            </View>

            {/* Income Source */}
            <CategorySelect
              value={incomeSource}
              onValueChange={setIncomeSource}
              type="income"
              label="Income Source"
              required
              className="w-full"
            />

            {/* Deposit to Account */}
            <View className="space-y-2 py-2">
              <Label>Deposit to Account</Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem
                      key={acc.id}
                      value={`${acc.name} (${acc.type})`}
                    >
                      {acc.name} ({acc.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>

            {/* Date */}
            <View className="space-y-2 py-2">
              <Label>Date</Label>
              <DatePicker
                date={date}
                onDateChange={setDate}
                placeholder="dd/mm/yyyy"
              />
            </View>

            {/* Quick Add */}
            <View className="space-y-3 py-2">
              <Label>Quick Add:</Label>
              <View className="flex-row flex-wrap gap-1">
                {getIncomeCategoryNames().map((source) => (
                  <Button
                    key={source}
                    variant="outline"
                    onPress={() => handleQuickAdd(source)}
                    className="px-2 py-1 m-1 flex-shrink"
                  >
                    <Text className="text-xs">{source}</Text>
                  </Button>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-4 pt-4 justify-center py-2">
              <Button variant="outline" onPress={handleCancel} className="w-36">
                <Text>Cancel</Text>
              </Button>
              <Button onPress={handleSubmit} variant="default" className="w-36">
                Save
              </Button>
            </View>
          </View>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}
