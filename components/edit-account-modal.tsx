import React, { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import {
  useDeleteAccount,
  useUpdateAccount,
} from "../hooks/queries/useAccounts";
import { useUserPreferences } from "../hooks/useUserPreferences";
import type { Account } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select-mobile";
import { useToast } from "./ui/sonner";

interface EditAccountModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onAccountUpdated: () => void;
}

export function EditAccountModal({
  account,
  isOpen,
  onClose,
  onAccountUpdated,
}: EditAccountModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    balance: "",
    accountNumber: "",
    isActive: true,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const toast = useToast();
  const { currency, showCents } = useUserPreferences();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  // Populate form when account changes
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        accountNumber: account.accountNumber || "",
        isActive: account.isActive,
      });
    }
  }, [account]);

  const handleClose = () => {
    onClose();
    // Reset form when closing
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        accountNumber: account.accountNumber || "",
        isActive: account.isActive,
      });
    }
  };

  const showAlert = (title: string, message: string) => {
    toast.toast({ message: `${title}: ${message}`, type: "error" });
  };

  const handleSave = async () => {
    if (!account) return;

    // Validate form data
    if (!formData.name || !formData.type || !formData.balance) {
      showAlert("Validation Error", "Name, type, and balance are required.");
      return;
    }

    if (isNaN(Number(formData.balance))) {
      showAlert(
        "Invalid Input",
        "Please enter a valid number for the balance."
      );
      return;
    }

    try {
      await updateAccountMutation.mutateAsync({
        accountId: account.id,
        accountData: {
          name: formData.name,
          type: formData.type,
          balance: Number(formData.balance),
          accountNumber: formData.accountNumber || "",
          isActive: formData.isActive,
        },
      });

      // Success handled by mutation hook
      onAccountUpdated();
      onClose();
    } catch (error) {
      // Error handled by mutation hook
      console.error("Error updating account:", error);
    }
  };

  const handleDelete = async () => {
    if (!account) return;

    try {
      await deleteAccountMutation.mutateAsync(account.id);

      toast.toast({
        message: `Account "${account.name}" deleted successfully`,
        type: "success",
      });

      setShowDeleteDialog(false);
      onAccountUpdated();
      onClose();
    } catch (error) {
      console.error("Error deleting account:", error);

      // Show the full error message from backend
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please try again.";

      toast.toast({
        message: errorMessage,
        type: "error",
      });

      setShowDeleteDialog(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Make changes to your account details here. Tap save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>

        <View className="space-y-4">
          {/* Account Name */}
          <View className="space-y-2">
            <Label className="text-base font-medium">
              Name <Text className="text-red-500">*</Text>
            </Label>
            <Input
              placeholder="Enter account name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Account Type */}
          <View className="space-y-2">
            <Label className="text-base font-medium">
              Type <Text className="text-red-500">*</Text>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder="Select account type..."
                  displayValue={
                    formData.type
                      ? formData.type.charAt(0).toUpperCase() +
                        formData.type.slice(1)
                      : undefined
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </View>

          {/* Balance */}
          <View className="space-y-2">
            <Label className="text-base font-medium">
              Balance <Text className="text-red-500">*</Text>
            </Label>
            <Input
              placeholder="0.00"
              value={formData.balance}
              onChangeText={(text) =>
                setFormData({ ...formData, balance: text })
              }
              keyboardType="numeric"
            />
          </View>

          {/* Account Number */}
          <View className="space-y-2">
            <Label className="text-base font-medium">
              Account Number (Optional)
            </Label>
            <Input
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, accountNumber: text })
              }
            />
          </View>

          {/* Active Status */}
          <View className="space-y-2">
            <Label className="text-base font-medium">Active Status</Label>
            <View className="flex-row items-center justify-between bg-muted-light dark:bg-muted-dark p-4 rounded-lg">
              <Text className="text-foreground-light dark:text-foreground-dark">
                {formData.isActive
                  ? "Account is active"
                  : "Account is inactive"}
              </Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
                thumbColor={formData.isActive ? "#3B82F6" : "#9CA3AF"}
                trackColor={{ false: "#E5E7EB", true: "#DBEAFE" }}
              />
            </View>
          </View>
        </View>

        <DialogFooter>
          <View className="flex-row gap-3 justify-center">
            <Button
              variant="destructive"
              onPress={() => setShowDeleteDialog(true)}
              disabled={
                updateAccountMutation.isPending ||
                deleteAccountMutation.isPending
              }
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onPress={handleClose}
              disabled={
                updateAccountMutation.isPending ||
                deleteAccountMutation.isPending
              }
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              disabled={
                updateAccountMutation.isPending ||
                deleteAccountMutation.isPending
              }
              className="flex-1"
            >
              {updateAccountMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </View>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClose={() => setShowDeleteDialog(false)}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>

          <View className="py-4">
            <View className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 rounded-lg mb-4">
              <Text className="text-foreground-light dark:text-foreground-dark text-center font-medium mb-2">
                Are you sure you want to delete &quot;{account.name}&quot;?
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center text-sm">
                This will permanently remove this account and all associated
                data.
              </Text>
            </View>

            {account.balance !== 0 && (
              <View className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 p-4 rounded-lg">
                <Text className="text-foreground-light dark:text-foreground-dark text-center font-medium mb-2">
                  ⚠️ Account Has Balance
                </Text>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center text-sm">
                  Current balance:{" "}
                  {formatCurrency(account.balance, currency, showCents)}
                  {"\n"}
                  Transfer all funds before deleting.
                </Text>
              </View>
            )}
          </View>

          <DialogFooter>
            <View className="flex-row gap-3 w-full">
              <Button
                variant="outline"
                onPress={() => setShowDeleteDialog(false)}
                disabled={deleteAccountMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onPress={handleDelete}
                disabled={
                  deleteAccountMutation.isPending || account.balance !== 0
                }
                className="flex-1"
              >
                {deleteAccountMutation.isPending
                  ? "Deleting..."
                  : "Delete Account"}
              </Button>
            </View>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
