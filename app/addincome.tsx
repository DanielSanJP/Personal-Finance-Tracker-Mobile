import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../components/nav";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getCurrentUserAccounts } from "../lib/data";

export default function AddIncomePage() {
  const router = useRouter();
  const accounts = getCurrentUserAccounts();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const incomeSourceOptions = [
    "Salary",
    "Freelance",
    "Bonus",
    "Investment",
    "Side Business",
    "Gift",
    "Refund",
  ];

  const handleQuickAdd = (source: string) => {
    setIncomeSource(source);
    setDescription(source);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!amount || !description || !incomeSource || !account || !date) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Handle form submission here - non-functional for now
    console.log({
      amount,
      description,
      incomeSource,
      account,
      date,
    });

    Alert.alert(
      "Success",
      "Income saved successfully! Your income has been recorded.",
      [
        {
          text: "OK",
          onPress: () => router.push("/transactions"),
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
        <View className="max-w-7xl mx-auto px-6 py-8">
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
                <View className="space-y-2 py-2">
                  <Label>Income Source</Label>
                  <Select value={incomeSource} onValueChange={setIncomeSource}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select income source..." />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeSourceOptions.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        <SelectItem key={acc.id} value={acc.name}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </View>

                {/* Date */}
                <View className="space-y-2 py-2">
                  <Label>Date</Label>
                  <DatePicker
                    date={date}
                    onDateChange={setDate}
                    placeholder="dd/mm/yyyy"
                  />
                </View>

                {/* Quick Add */}
                <View className="space-y-3 py-2">
                  <Label>Quick Add:</Label>
                  <View className="flex-row flex-wrap gap-1">
                    {incomeSourceOptions.map((source) => (
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
                <View className="flex-row gap-4 pt-4 justify-center py-2">
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
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
