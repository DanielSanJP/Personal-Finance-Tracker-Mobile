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
import { DateTimePicker } from "../components/ui/date-time-picker";
import { CategorySelect } from "../components/category-select";
import { getIncomeCategoryNames } from "../constants/categories";
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
import { useAuth } from "../hooks/queries/useAuth";
import { useAccounts } from "../hooks/queries/useAccounts";
import { useCreateIncomeTransaction } from "../hooks/queries/useTransactions";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { VoiceInputModal } from "../components/voice-input-modal";

export default function AddIncomePage() {
  const router = useRouter();
  const { user, isLoading: loading } = useAuth();
  const toast = useToast();
  const { data: accounts = [] } = useAccounts();
  const createIncomeMutation = useCreateIncomeTransaction();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

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
      setAmount(result.amount || amount);
      setDescription(result.description || description);
      setIncomeSource(result.category || incomeSource);
      if (result.account) {
        const foundAccount = accounts.find((a) => a.name === result.account);
        if (foundAccount) {
          setAccount(`${foundAccount.name} (${foundAccount.type})`);
        }
      }
      if (result.date) {
        setDate(new Date(result.date));
      }

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
    transactionType: "income",
  });

  // Using standardized income categories from constants

  const handleQuickAdd = (source: string) => {
    setIncomeSource(source);
    setDescription(source);
  };

  // Helper function to extract account ID from display value
  const getAccountIdFromDisplayValue = (displayValue: string) => {
    const account = accounts.find(
      (acc) => `${acc.name} (${acc.type})` === displayValue
    );
    return account?.id || "";
  };

  const handleSubmit = async () => {
    // Validate required fields
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

      // Reset form
      setAmount("");
      setDescription("");
      setIncomeSource("");
      setAccount("");
      setDate(new Date());
      router.push("/transactions");
    } catch (error) {
      console.error("Error saving income:", error);
      toast.toast({
        message: "Error: An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    router.back();
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
                Add New Income
              </CardTitle>
            </CardHeader>

            <CardContent>
              <View className="space-y-6">
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

                {/* Date & Time */}
                <View className="space-y-2 py-2">
                  <Label>Date & Time</Label>
                  <DateTimePicker
                    date={date || new Date()}
                    onDateTimeChange={setDate}
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
                <View className="pt-4 space-y-4 py-2">
                  {/* Save and Cancel Buttons */}
                  <View className="flex-row gap-4 justify-center py-2">
                    <Button
                      variant="outline"
                      onPress={handleCancel}
                      className="w-40"
                    >
                      <Text>Cancel</Text>
                    </Button>
                    <Button
                      onPress={handleSubmit}
                      variant="default"
                      className="w-40"
                    >
                      Save
                    </Button>
                  </View>

                  {/* Voice Input Button */}
                  <View className="flex-row gap-4 justify-center py-2">
                    <Button
                      onPress={() => setShowVoiceInput(true)}
                      variant="outline"
                      className="w-40"
                    >
                      <Text>Voice Input</Text>
                    </Button>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* Voice Input Modal */}
      <VoiceInputModal
        visible={showVoiceInput}
        onClose={() => {
          setShowVoiceInput(false);
          if (isRecording) {
            stopVoiceInput();
          }
        }}
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
        type="income"
      />
    </SafeAreaView>
  );
}
