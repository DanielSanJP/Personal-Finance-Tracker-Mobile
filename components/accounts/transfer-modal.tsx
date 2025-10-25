import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useAccounts } from "../../hooks/queries/useAccounts";
import { getCurrentUser } from "../../hooks/queries/useAuth";
import { queryKeys } from "../../lib/query-keys";
import { supabase } from "../../lib/supabase";
import type { Account } from "../../lib/types";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select-mobile";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceAccount?: Account;
  onSuccess?: () => void;
}

export function TransferModal({
  open,
  onOpenChange,
  sourceAccount,
  onSuccess,
}: TransferModalProps) {
  const { data: accounts = [] } = useAccounts();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Account transfer");

  // Set source account when provided or modal opens
  useEffect(() => {
    if (open && sourceAccount) {
      setFromAccountId(sourceAccount.id);
    }
  }, [open, sourceAccount]);

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  const availableDestinations = accounts.filter(
    (a) => a.id !== fromAccountId && a.isActive
  );

  const activeAccounts = accounts.filter((a) => a.isActive);

  const resetForm = () => {
    setFromAccountId(sourceAccount?.id || "");
    setToAccountId("");
    setAmount("");
    setDescription("Account transfer");
  };

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);

    if (!fromAccountId || !toAccountId) {
      return;
    }

    if (fromAccountId === toAccountId) {
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    if (fromAccount && amountNum > fromAccount.balance) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const fromName = fromAccount?.name || "Account";
      const toName = toAccount?.name || "Account";

      // Generate transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create transfer transaction - trigger handles balance updates
      const { error } = await supabase.from("transactions").insert({
        id: transactionId,
        user_id: user.id,
        account_id: fromAccountId,
        destination_account_id: toAccountId,
        type: "transfer",
        amount: -Math.abs(amountNum), // Negative: money leaving source
        description: description || "Account transfer",
        category: "Transfer",
        from_party: fromName,
        to_party: toName,
        date: new Date().toISOString(),
        status: "completed",
      });

      if (error) {
        console.error("Transfer error:", error);
        throw new Error(`Failed to create transfer: ${error.message}`);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });

      if (onSuccess) {
        onSuccess();
      }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const amountNum = parseFloat(amount) || 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[500px]"
        onClose={() => handleOpenChange(false)}
      >
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription>
            Transfer money between your accounts. The transaction will be
            recorded automatically.
          </DialogDescription>
        </DialogHeader>

        <ScrollView className="max-h-[500px]">
          <View className="gap-4 p-1">
            {/* From Account */}
            <View className="gap-2">
              <Label nativeID="fromAccountId">
                <Text>
                  From Account <Text className="text-red-500">*</Text>
                </Text>
              </Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromAccount && (
                <Text className="text-sm text-gray-500">
                  Available: {formatCurrency(fromAccount.balance)}
                </Text>
              )}
            </View>

            {/* To Account */}
            <View className="gap-2">
              <Label nativeID="toAccountId">
                <Text>
                  To Account <Text className="text-red-500">*</Text>
                </Text>
              </Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      fromAccountId
                        ? "Select destination account"
                        : "Select source account first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableDestinations.length > 0 ? (
                    availableDestinations.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.balance)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none">
                      No other active accounts available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </View>

            {/* Amount */}
            <View className="gap-2">
              <Label nativeID="amount">
                <Text>
                  Amount <Text className="text-red-500">*</Text>
                </Text>
              </Label>
              <Input
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Description */}
            <View className="gap-2">
              <Label nativeID="description">
                <Text>Description (Optional)</Text>
              </Label>
              <Input
                placeholder="Add a note about this transfer"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Summary */}
            {fromAccount && toAccount && amountNum > 0 && (
              <View
                className={`p-4 rounded-lg gap-2 ${
                  amountNum > fromAccount.balance
                    ? "bg-red-50 border border-red-200"
                    : "bg-gray-50"
                }`}
              >
                <Text className="font-semibold text-sm">Transfer Summary</Text>
                <View className="gap-1">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">From:</Text>
                    <Text className="font-medium">{fromAccount.name}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">To:</Text>
                    <Text className="font-medium">{toAccount.name}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Amount:</Text>
                    <Text className="font-semibold text-blue-600">
                      {formatCurrency(amountNum)}
                    </Text>
                  </View>
                  <View className="border-t border-gray-200 pt-2 mt-2 gap-1">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">
                        New balance in {fromAccount.name}:
                      </Text>
                      <Text
                        className={`text-xs ${
                          fromAccount.balance - amountNum < 0
                            ? "text-red-600 font-bold"
                            : "font-medium"
                        }`}
                      >
                        {formatCurrency(fromAccount.balance - amountNum)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">
                        New balance in {toAccount.name}:
                      </Text>
                      <Text className="text-xs">
                        {formatCurrency(toAccount.balance + amountNum)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Insufficient Funds Warning */}
                {amountNum > fromAccount.balance && (
                  <View className="bg-red-100 border border-red-300 rounded-md p-3 mt-2">
                    <Text className="text-sm font-semibold text-red-800">
                      ⚠️ Insufficient Funds
                    </Text>
                    <Text className="text-xs text-red-700 mt-1">
                      The transfer amount exceeds the available balance by{" "}
                      <Text className="font-bold">
                        {formatCurrency(amountNum - fromAccount.balance)}
                      </Text>
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <DialogFooter>
          <Button
            variant="outline"
            onPress={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={
              isSubmitting ||
              !fromAccountId ||
              !toAccountId ||
              amountNum <= 0 ||
              (fromAccount ? amountNum > fromAccount.balance : false)
            }
          >
            {isSubmitting ? "Transferring..." : "Transfer Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
