import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";
import { FormSkeleton } from "../components/loading-states";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { DatePicker } from "../components/ui/date-picker";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { CategorySelect } from "../components/category-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../components/ui/sonner";
import { getCurrentUserAccounts, createExpenseTransaction } from "../lib/data";
import { useAuth } from "../lib/auth-context";
import { checkGuestAndWarn } from "../lib/guest-protection";

export default function AddTransactionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const toast = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Load accounts when user is available
  useEffect(() => {
    const loadAccounts = async () => {
      if (user) {
        try {
          const accountsData = await getCurrentUserAccounts();
          setAccounts(accountsData);
        } catch (error) {
          console.error("Error loading accounts:", error);
        }
      }
    };
    loadAccounts();
  }, [user]);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    merchant: "",
    account: "",
    status: "completed", // Use lowercase value that matches database
    date: new Date() as Date | undefined,
  });

  // Status options with display labels and database values
  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Failed", value: "failed" },
  ];

  // Helper function to get display label for status
  const getStatusLabel = (value: string) => {
    return (
      statusOptions.find((option) => option.value === value)?.label || value
    );
  };

  const handleCancel = () => {
    router.push("/transactions");
  };

  // Helper function to extract account ID from display value
  const getAccountIdFromDisplayValue = (displayValue: string) => {
    const account = accounts.find(
      (acc) => `${acc.name} (${acc.type})` === displayValue
    );
    return account?.id || "";
  };

  const handleSave = async () => {
    // Check if user is guest first
    const isGuest = await checkGuestAndWarn("create transactions");
    if (isGuest) return;

    // Validate required fields
    if (
      !formData.amount ||
      !formData.description ||
      !formData.account ||
      !formData.date
    ) {
      toast.toast({
        message: "Error: Please fill in all required fields",
        type: "error",
      });
      return;
    }

    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast.toast({
        message: "Error: Please enter a valid positive number for the amount",
        type: "error",
      });
      return;
    }

    try {
      const accountId = getAccountIdFromDisplayValue(formData.account);

      const result = await createExpenseTransaction({
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category || undefined,
        merchant: formData.merchant || undefined,
        accountId: accountId,
        status: formData.status, // Already using correct lowercase database values
        date: formData.date,
      });

      if (result.success) {
        toast.toast({
          message:
            "Success: Expense saved successfully! Your expense has been recorded.",
          type: "success",
        });

        // Reset form
        setFormData({
          amount: "",
          description: "",
          category: "",
          merchant: "",
          account: "",
          status: "completed", // Use lowercase value that matches database
          date: new Date(),
        });
        router.push("/transactions");
      } else {
        toast.toast({
          message: `Error: ${result.error || "Failed to save expense"}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.toast({
        message: "Error: An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  const handleVoiceInput = () => {
    toast.toast({
      message:
        "Voice Input functionality not implemented yet. This feature will be available in a future update.",
      type: "info",
    });
  };

  const handleScanReceipt = () => {
    toast.toast({
      message:
        "Scan Receipt functionality not implemented yet. This feature will be available in a future update.",
      type: "info",
    });
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Nav />
        <View className="max-w-7xl mx-auto px-6 py-8">
          <FormSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
        <View className="max-w-7xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center py-2">
                Add New Expense
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Amount */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">
                  Amount <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  keyboardType="numeric"
                  returnKeyType="done"
                  placeholder="0.00"
                  value={formData.amount}
                  onChangeText={(text) =>
                    setFormData({ ...formData, amount: text })
                  }
                  className="px-4 py-3 border-gray-300 rounded-lg bg-white text-gray-600"
                />
              </View>

              {/* Description */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">
                  Description <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  placeholder="What was this for?"
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  className="px-4 py-3 border-gray-300 rounded-lg bg-white text-gray-600"
                />
              </View>

              {/* Category */}
              <CategorySelect
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                type="expense"
                required={true}
              />

              {/* Merchant */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">
                  Merchant (Optional)
                </Label>
                <Input
                  placeholder="Where was this transaction made?"
                  value={formData.merchant}
                  onChangeText={(text) =>
                    setFormData({ ...formData, merchant: text })
                  }
                  className="px-4 py-3 border-gray-300 rounded-lg bg-white text-gray-600"
                />
              </View>

              {/* Status */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      displayValue={
                        formData.status
                          ? getStatusLabel(formData.status)
                          : undefined
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>

              {/* Account */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">
                  Account <Text className="text-red-500">*</Text>
                </Label>
                <Select
                  value={formData.account}
                  onValueChange={(value) =>
                    setFormData({ ...formData, account: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={`${account.name} (${account.type})`}
                      >
                        {account.name} ({account.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>

              {/* Date */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">
                  Date <Text className="text-red-500">*</Text>
                </Label>
                <DatePicker
                  date={formData.date}
                  onDateChange={(date) => setFormData({ ...formData, date })}
                  placeholder="dd/mm/yyyy"
                />
              </View>

              {/* Action Buttons */}
              <View className="pt-4 space-y-4 py-2">
                {/* Save and Cancel Buttons */}
                <View className="flex-row gap-4 justify-center py-2">
                  <Button
                    onPress={handleCancel}
                    variant="outline"
                    className="w-40"
                  >
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    onPress={handleSave}
                    variant="default"
                    className="w-40"
                  >
                    Save
                  </Button>
                </View>

                {/* Voice Input and Scan Receipt */}
                <View className="flex-row gap-4 justify-center py-2">
                  <Button
                    onPress={handleVoiceInput}
                    variant="outline"
                    className="w-40"
                  >
                    <Text>Voice Input</Text>
                  </Button>
                  <Button
                    onPress={handleScanReceipt}
                    variant="outline"
                    className="w-40"
                  >
                    <Text>Scan Receipt</Text>
                  </Button>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
