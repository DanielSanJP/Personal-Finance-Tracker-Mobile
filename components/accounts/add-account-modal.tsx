import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useCreateAccount } from "../../hooks/queries/useAccounts";
import { Button } from "../ui/button";
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

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function AddAccountModal({
  open,
  onOpenChange,
  onClose,
}: AddAccountModalProps) {
  const toast = useToast();
  const createAccountMutation = useCreateAccount();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    balance: "",
    accountNumber: "",
  });

  const accountTypes = ["checking", "savings", "credit", "investment"];

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        type: "",
        balance: "",
        accountNumber: "",
      });
    }
  }, [open]);

  const handleCancel = () => {
    onClose();
    onOpenChange(false);
  };

  const handleSave = async () => {
    // Validate form data - only name and type are required
    if (!formData.name || !formData.type) {
      toast.toast({
        message:
          "Missing Information: Please fill in all required fields. Name and type are required.",
        type: "error",
      });
      return;
    }

    // Validate balance only if provided
    if (formData.balance && isNaN(Number(formData.balance))) {
      toast.toast({
        message:
          "Invalid Balance: Please enter a valid number for the balance.",
        type: "error",
      });
      return;
    }

    try {
      const result = await createAccountMutation.mutateAsync({
        name: formData.name,
        type: formData.type,
        balance: formData.balance ? Number(formData.balance) : undefined, // Undefined will default to 0
        accountNumber: formData.accountNumber || "",
        isActive: true,
      });

      if (result) {
        toast.toast({
          message: `Success: ${formData.name} has been added to your accounts.`,
          type: "success",
        });

        // Reset form and close modal
        setFormData({
          name: "",
          type: "",
          balance: "",
          accountNumber: "",
        });
        onClose();
        onOpenChange(false);
      }
    } catch {
      toast.toast({
        message: "Error: Error creating account. Please try again later.",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]" onClose={handleCancel}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add New Account
          </DialogTitle>
        </DialogHeader>

        <ScrollView className="flex-1">
          <View className="space-y-6 p-4">
            {/* Account Name */}
            <View className="space-y-2">
              <Label className="text-base font-medium">
                Account Name <Text className="text-red-500">*</Text>
              </Label>
              <Input
                placeholder="Enter account name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                className="px-4 py-3 border-gray-300 rounded-lg bg-white text-gray-600"
              />
            </View>

            {/* Account Type */}
            <View className="space-y-2">
              <Label className="text-base font-medium">
                Account Type <Text className="text-red-500">*</Text>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="w-full px-4 py-3 border-gray-300 rounded-lg bg-white">
                  <SelectValue placeholder="Select account type..." />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>

            {/* Initial Balance - Optional, defaults to 0 */}
            <View className="space-y-2">
              <Label className="text-base font-medium">
                Initial Balance (Optional)
              </Label>
              <Input
                placeholder="0.00"
                value={formData.balance}
                onChangeText={(text) =>
                  setFormData({ ...formData, balance: text })
                }
                keyboardType="decimal-pad"
                returnKeyType="done"
                blurOnSubmit={true}
                className="px-4 py-3 border-gray-300 rounded-lg bg-white text-gray-600"
              />
              <Text className="text-sm text-gray-500">
                Leave blank to start with $0.00
              </Text>
            </View>

            {/* Account Number (Optional) */}
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
                className="px-4 py-3 border-gray-300 rounded-lg bg-white text-gray-600"
              />
            </View>

            {/* Action Buttons */}
            <View className="pt-4">
              <View className="flex-row gap-4 justify-center">
                <Button
                  onPress={handleCancel}
                  variant="outline"
                  className="w-40"
                >
                  Cancel
                </Button>
                <Button onPress={handleSave} className="w-40">
                  Create Account
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
}
