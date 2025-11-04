import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useAccounts } from "../../hooks/queries/useAccounts";
import { getCurrentUser } from "../../hooks/queries/useAuth";
import {
  getCurrencyValidationError,
  parseCurrencyInput,
} from "../../lib/currency-utils";
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
    if (!fromAccountId || !toAccountId) {
      Alert.alert("Missing Information", "Please select both accounts", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    if (fromAccountId === toAccountId) {
      Alert.alert("Invalid Transfer", "Cannot transfer to the same account", [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    const validationError = getCurrencyValidationError(amount);
    if (validationError) {
      Alert.alert("Invalid Amount", validationError, [
        { text: "OK", style: "default" },
      ]);
      return;
    }

    const amountNum = parseCurrencyInput(amount);

    if (fromAccount && amountNum > fromAccount.balance) {
      Alert.alert(
        "Insufficient Balance",
        `Transfer amount exceeds available balance of ${formatCurrency(
          fromAccount.balance,
          "USD",
          true
        )}`,
        [{ text: "OK", style: "default" }]
      );
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

  const amountNum =
    amount && !getCurrencyValidationError(amount)
      ? parseCurrencyInput(amount)
      : 0;

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
            {/* No Accounts Warning */}
            {accounts.length === 0 && (
              <View className="bg-muted-light dark:bg-muted-dark p-4 rounded-lg mb-4">
                <Text className="text-foreground-light dark:text-foreground-dark font-semibold mb-2">
                  No Accounts Available
                </Text>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
                  You need to create at least two accounts to transfer funds
                  between them. Go to the Accounts page to create your accounts.
                </Text>
              </View>
            )}

            {accounts.length === 1 && (
              <View className="bg-muted-light dark:bg-muted-dark p-4 rounded-lg mb-4">
                <Text className="text-foreground-light dark:text-foreground-dark font-semibold mb-2">
                  Need More Accounts
                </Text>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
                  You need at least two accounts to make a transfer. Create
                  another account on the Accounts page.
                </Text>
              </View>
            )}

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
                      <Text>
                        {account.name} - {formatCurrency(account.balance)}
                      </Text>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromAccount && (
                <Text className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
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
                        <Text>
                          {account.name} - {formatCurrency(account.balance)}
                        </Text>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none">
                      <Text>No other active accounts available</Text>
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
                    ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
                    : "bg-muted-light dark:bg-muted-dark"
                }`}
              >
                <Text className="font-semibold text-sm text-foreground-light dark:text-foreground-dark">
                  Transfer Summary
                </Text>
                <View className="gap-1">
                  <View className="flex-row justify-between">
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark">
                      From:
                    </Text>
                    <Text className="font-medium text-foreground-light dark:text-foreground-dark">
                      {fromAccount.name}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark">
                      To:
                    </Text>
                    <Text className="font-medium text-foreground-light dark:text-foreground-dark">
                      {toAccount.name}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark">
                      Amount:
                    </Text>
                    <Text className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(amountNum)}
                    </Text>
                  </View>
                  <View className="border-t border-border-light dark:border-border-dark pt-2 mt-2 gap-1">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                        New balance in {fromAccount.name}:
                      </Text>
                      <Text
                        className={`text-xs ${
                          fromAccount.balance - amountNum < 0
                            ? "text-red-600 dark:text-red-400 font-bold"
                            : "text-foreground-light dark:text-foreground-dark font-medium"
                        }`}
                      >
                        {formatCurrency(fromAccount.balance - amountNum)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                        New balance in {toAccount.name}:
                      </Text>
                      <Text className="text-xs text-foreground-light dark:text-foreground-dark">
                        {formatCurrency(toAccount.balance + amountNum)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Insufficient Funds Warning */}
                {amountNum > fromAccount.balance && (
                  <View className="bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900 rounded-md p-3 mt-2">
                    <Text className="text-sm font-semibold text-red-800 dark:text-red-400">
                      ⚠️ Insufficient Funds
                    </Text>
                    <Text className="text-xs text-red-700 dark:text-red-300 mt-1">
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
