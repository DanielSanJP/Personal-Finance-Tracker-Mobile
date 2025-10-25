import React, { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { useUpdateAccount } from "../hooks/queries/useAccounts";
import type { Account } from "../lib/types";
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
  const toast = useToast();
  const updateAccountMutation = useUpdateAccount();

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
              className="!h-auto !px-4 !py-3 !border-gray-300 !rounded-lg !bg-white !text-gray-600"
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
              className="!h-auto !px-4 !py-3 !border-gray-300 !rounded-lg !bg-white !text-gray-600"
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
              className="!h-auto !px-4 !py-3 !border-gray-300 !rounded-lg !bg-white !text-gray-600"
            />
          </View>

          {/* Active Status */}
          <View className="space-y-2">
            <Label className="text-base font-medium">Active Status</Label>
            <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-lg">
              <Text className="text-gray-600">
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
              variant="outline"
              onPress={handleClose}
              disabled={updateAccountMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              disabled={updateAccountMutation.isPending}
              className="flex-1"
            >
              {updateAccountMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </View>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
