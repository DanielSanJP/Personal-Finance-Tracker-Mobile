import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategorySelect } from "../components/category-select";
import { FormSkeleton } from "../components/loading-states";
import Nav from "../components/nav";
import { ReceiptScannerModal } from "../components/receipt-scanner-modal";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { DateTimePicker } from "../components/ui/date-time-picker";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../components/ui/sonner";
import { VoiceInputModal } from "../components/voice-input-modal";
import { useAccounts } from "../hooks/queries/useAccounts";
import { useAuth } from "../hooks/queries/useAuth";
import { useCreateExpenseTransaction } from "../hooks/queries/useTransactions";
import { useReceiptScan } from "../hooks/useReceiptScan";
import { useVoiceInput } from "../hooks/useVoiceInput";

export default function AddTransactionPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, isLoading: loading } = useAuth();
  const toast = useToast();
  const { data: accounts = [] } = useAccounts();
  const createExpenseMutation = useCreateExpenseTransaction();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    merchant: "",
    account: "",
    status: "completed", // Use lowercase value that matches database
    date: new Date() as Date | undefined,
  });

  // Receipt scanner state
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

  // Auto-open receipt scanner if openScanner param is true
  useEffect(() => {
    if (params.openScanner === "true") {
      setShowReceiptScanner(true);
    }
  }, [params.openScanner]);

  // Receipt scanning hook
  const {
    isProcessing: isScanning,
    previewUrl,
    parsedData,
    confidence,
    scanFromCamera,
    scanFromFile,
    clearPreview,
  } = useReceiptScan({
    onReceiptData: (data) => {
      // Auto-fill form with receipt data
      setFormData((prev) => ({
        ...prev,
        amount: data.amount?.toString() || prev.amount,
        description: data.merchant || prev.description,
        category: data.category || prev.category,
        merchant: data.merchant || prev.merchant,
        date: data.date ? new Date(data.date) : prev.date,
      }));

      toast.toast({
        message: "Receipt scanned successfully!",
        type: "success",
      });

      // Close modal after a brief delay
      setTimeout(() => {
        setShowReceiptScanner(false);
        clearPreview();
      }, 1500);
    },
    onError: (error) => {
      console.error("❌ Receipt scan error:", error);
      toast.toast({
        message: `Failed to scan receipt: ${error}`,
        type: "error",
      });
    },
  });

  // Voice input state
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  // Voice input hook
  const {
    isRecording,
    isProcessing: isVoiceProcessing,
    isSupported: isVoiceSupported,
    parsedData: voiceParsedData,
    confidence: voiceConfidence,
    startVoiceInput,
    stopVoiceInput,
  } = useVoiceInput({
    onResult: (result) => {
      // Auto-fill form with voice data
      setFormData((prev) => ({
        ...prev,
        amount: result.amount?.toString() || prev.amount,
        description: result.description || prev.description,
        category: result.category || prev.category,
        merchant: result.merchant || prev.merchant,
        account: result.account
          ? `${result.account} (${
              accounts.find((a) => a.name === result.account)?.type ||
              "checking"
            })`
          : prev.account,
        date: result.date ? new Date(result.date) : prev.date,
      }));

      toast.toast({
        message: "Voice input processed successfully!",
        type: "success",
      });

      // Close modal after a brief delay
      setTimeout(() => {
        setShowVoiceInput(false);
      }, 1500);
    },
    accounts,
    transactionType: "expense",
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
    // Validate required fields
    if (
      !formData.amount ||
      !formData.description ||
      !formData.category ||
      !formData.merchant ||
      !formData.account ||
      !formData.date
    ) {
      toast.toast({
        message:
          "Error: Please fill in all required fields (amount, description, category, paid to, and account)",
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

      await createExpenseMutation.mutateAsync({
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category || undefined,
        merchant: formData.merchant || undefined,
        accountId: accountId,
        status: formData.status, // Already using correct lowercase database values
        date: formData.date,
      });

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
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.toast({
        message: "Error: An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  const handleVoiceInput = () => {
    setShowVoiceInput(true);
  };

  const handleCloseVoiceInput = () => {
    setShowVoiceInput(false);
    if (isRecording) {
      stopVoiceInput();
    }
  };

  const handleScanReceipt = () => {
    setShowReceiptScanner(true);
  };

  const handleCameraPress = async () => {
    await scanFromCamera();
  };

  const handleGalleryPress = async () => {
    await scanFromFile();
  };

  const handleCloseScanner = () => {
    setShowReceiptScanner(false);
    clearPreview();
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Nav />
        <View className="w-full px-6 py-8">
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
        <View className="w-full px-6 py-8">
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

              {/* Paid To (Merchant) */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">
                  Paid To <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  placeholder="Who or where did you pay?"
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

              <View className="py-2">
                <DateTimePicker
                  date={formData.date || new Date()}
                  onDateTimeChange={(date) =>
                    setFormData({ ...formData, date })
                  }
                  showLabel={true}
                  required={true}
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

      {/* Receipt Scanner Modal */}
      <ReceiptScannerModal
        visible={showReceiptScanner}
        onClose={handleCloseScanner}
        onCamera={handleCameraPress}
        onGallery={handleGalleryPress}
        previewUrl={previewUrl}
        isProcessing={isScanning}
        parsedData={parsedData}
        confidence={confidence}
      />

      {/* Voice Input Modal */}
      <VoiceInputModal
        visible={showVoiceInput}
        onClose={handleCloseVoiceInput}
        onStartListening={startVoiceInput}
        onStopListening={stopVoiceInput}
        isRecording={isRecording}
        isProcessing={isVoiceProcessing}
        isSupported={isVoiceSupported}
        parsedData={
          voiceParsedData
            ? {
                amount: voiceParsedData.amount,
                description: voiceParsedData.description,
                merchant: voiceParsedData.merchant,
                category: voiceParsedData.category,
                account: voiceParsedData.account,
                date: voiceParsedData.date
                  ? new Date(voiceParsedData.date)
                  : undefined,
              }
            : undefined
        }
        confidence={voiceConfidence}
        type="expense"
      />
    </SafeAreaView>
  );
}
