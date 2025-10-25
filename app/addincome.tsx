import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategorySelect } from "../components/category-select";
import { FormSkeleton } from "../components/loading-states";
import Nav from "../components/nav";
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
} from "../components/ui/select-mobile";
import { useToast } from "../components/ui/sonner";
import { VoiceInputModal } from "../components/voice-input-modal";
import { useAccounts } from "../hooks/queries/useAccounts";
import { useAuth } from "../hooks/queries/useAuth";
import { useCreateIncomeTransaction } from "../hooks/queries/useTransactions";
import { useVoiceInput } from "../hooks/useVoiceInput";

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

      // Modal stays open - user can click Done button to close
    },
    accounts,
    transactionType: "income",
  });

  // Quick add sources - common income categories
  const quickAddSources = [
    "Salary",
    "Freelance",
    "Gift/Bonus",
    "Investment Income",
  ];

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
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
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
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
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

                {/* Income Category (Source Type) */}
                <CategorySelect
                  value={incomeSource}
                  onValueChange={setIncomeSource}
                  type="income"
                  label="Income Category"
                  required
                  className="w-full"
                />

                {/* Received From (Source Name) */}
                <View className="space-y-2 py-2">
                  <Label>
                    Received From <Text className="text-red-500">*</Text>
                  </Label>
                  <Input
                    placeholder="Who sent you this payment?"
                    value={description}
                    onChangeText={setDescription}
                    className="px-4 py-3"
                  />
                  <Text className="text-xs text-gray-500">
                    💡 Enter the specific source (e.g., employer name, client
                    name, etc.)
                  </Text>
                </View>

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
                          <Text>
                            {acc.name} ({acc.type})
                          </Text>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </View>

                <View className="py-2">
                  <DateTimePicker
                    date={date || new Date()}
                    onDateTimeChange={setDate}
                    showLabel={true}
                    required={true}
                  />
                </View>

                {/* Quick Add */}
                <View className="space-y-3 py-2">
                  <Label>Quick Add:</Label>
                  <View className="flex-row flex-wrap gap-1">
                    {quickAddSources.map((source) => (
                      <Button
                        key={source}
                        variant="outline"
                        onPress={() => handleQuickAdd(source)}
                        className="px-2 py-1 m-1 flex-shrink"
                      >
                        {source}
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
                      Cancel
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
                      Voice Input
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
