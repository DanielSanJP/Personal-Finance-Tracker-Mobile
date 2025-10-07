import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useAccounts } from "../../hooks/queries/useAccounts";
import { useCreateExpenseTransaction } from "../../hooks/queries/useTransactions";
import { useReceiptScan } from "../../hooks/useReceiptScan";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { CategorySelect } from "../category-select";
import { ReceiptScannerModal } from "../receipt-scanner-modal";
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
import { VoiceInputModal } from "../voice-input-modal";

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function AddTransactionModal({
  open,
  onOpenChange,
  onClose,
}: AddTransactionModalProps) {
  const toast = useToast();
  const { data: accounts = [] } = useAccounts();
  const createExpenseMutation = useCreateExpenseTransaction();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    merchant: "",
    account: "",
    status: "completed",
    date: new Date() as Date | undefined,
  });

  // Receipt scanner state
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

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

      setTimeout(() => {
        setShowVoiceInput(false);
      }, 1500);
    },
    accounts,
    transactionType: "expense",
  });

  // Status options
  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Failed", value: "failed" },
  ];

  const getStatusLabel = (value: string) => {
    return (
      statusOptions.find((option) => option.value === value)?.label || value
    );
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        amount: "",
        description: "",
        category: "",
        merchant: "",
        account: "",
        status: "completed",
        date: new Date(),
      });
    }
  }, [open]);

  const handleCancel = () => {
    onClose();
    onOpenChange(false);
  };

  const getAccountIdFromDisplayValue = (displayValue: string) => {
    const account = accounts.find(
      (acc) => `${acc.name} (${acc.type})` === displayValue
    );
    return account?.id || "";
  };

  const handleSave = async () => {
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

      await createExpenseMutation.mutateAsync({
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category || undefined,
        merchant: formData.merchant || undefined,
        accountId: accountId,
        status: formData.status,
        date: formData.date,
      });

      toast.toast({
        message:
          "Success: Expense saved successfully! Your expense has been recorded.",
        type: "success",
      });

      // Reset form and close modal
      setFormData({
        amount: "",
        description: "",
        category: "",
        merchant: "",
        account: "",
        status: "completed",
        date: new Date(),
      });
      onClose();
      onOpenChange(false);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-2xl max-h-[90vh]"
          onClose={handleCancel}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center py-2">
              Add New Expense
            </DialogTitle>
          </DialogHeader>

          <ScrollView className="flex-1">
            <View className="space-y-6 p-4">
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
                    className="w-36"
                  >
                    <Text>Cancel</Text>
                  </Button>
                  <Button
                    onPress={handleSave}
                    variant="default"
                    className="w-36"
                  >
                    Save
                  </Button>
                </View>

                {/* Voice Input and Scan Receipt */}
                <View className="flex-row gap-4 justify-center py-2">
                  <Button
                    onPress={handleVoiceInput}
                    variant="outline"
                    className="w-36"
                  >
                    <Text>Voice Input</Text>
                  </Button>
                  <Button
                    onPress={handleScanReceipt}
                    variant="outline"
                    className="w-36"
                  >
                    <Text>Scan Receipt</Text>
                  </Button>
                </View>
              </View>
            </View>
          </ScrollView>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
