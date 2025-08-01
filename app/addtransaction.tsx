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

export default function AddTransactionPage() {
  const router = useRouter();
  const accounts = getCurrentUserAccounts();

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    category: "",
    account: "",
    date: new Date() as Date | undefined,
  });

  const transactionTypes = ["income", "expense", "transfer"];
  const categories = [
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Housing",
    "Income",
    "Transfer",
    "Shopping",
    "Healthcare",
    "Utilities",
  ];

  const handleCancel = () => {
    router.push("/transactions");
  };

  const handleSave = () => {
    // Validate required fields
    if (
      !formData.type ||
      !formData.amount ||
      !formData.description ||
      !formData.category ||
      !formData.account ||
      !formData.date
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Non-functional for now - just show an alert
    Alert.alert(
      "Success",
      "Transaction saved successfully! Your transaction has been recorded.",
      [
        {
          text: "OK",
          onPress: () => router.push("/transactions"),
        },
      ]
    );
  };

  const handleVoiceInput = () => {
    Alert.alert(
      "Voice Input",
      "Voice Input functionality not implemented yet. This feature will be available in a future update."
    );
  };

  const handleScanReceipt = () => {
    Alert.alert(
      "Scan Receipt",
      "Scan Receipt functionality not implemented yet. This feature will be available in a future update."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
        <View className="max-w-7xl mx-auto px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center py-2">
                Add New Transaction
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Type */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>

              {/* Amount */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">Amount</Label>
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
                <Label className="text-base font-medium">Description</Label>
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
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>

              {/* Account */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">Account</Label>
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
                      <SelectItem key={account.id} value={account.name}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>

              {/* Date */}
              <View className="space-y-2 py-2">
                <Label className="text-base font-medium">Date</Label>
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
