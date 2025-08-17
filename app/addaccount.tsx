import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, Alert } from "react-native";
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { createAccount } from "../lib/data";
import { checkGuestAndWarn } from "../lib/guest-protection";
import { useAuth } from "../lib/auth-context";

export default function AddAccount() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    balance: "",
    accountNumber: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const accountTypes = ["checking", "savings", "credit", "investment"];

  const handleCancel = () => {
    router.push("/accounts");
  };

  const handleSave = async () => {
    // Check if user is guest first
    const isGuest = await checkGuestAndWarn("create accounts");
    if (isGuest) return;

    // Validate form data
    if (!formData.name || !formData.type || !formData.balance) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields. Name, type, and balance are required.",
        [{ text: "OK" }]
      );
      return;
    }

    if (isNaN(Number(formData.balance))) {
      Alert.alert(
        "Invalid Balance",
        "Please enter a valid number for the balance.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const result = await createAccount({
        name: formData.name,
        type: formData.type,
        balance: Number(formData.balance),
        accountNumber: formData.accountNumber || "",
        isActive: true,
      });

      if (result) {
        Alert.alert(
          "Success",
          `${formData.name} has been added to your accounts.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setFormData({
                  name: "",
                  type: "",
                  balance: "",
                  accountNumber: "",
                });

                // Navigate back to accounts page
                router.push("/accounts");
              },
            },
          ]
        );
      }
    } catch {
      Alert.alert("Error", "Error creating account. Please try again later.", [
        { text: "OK" },
      ]);
    }
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
        <View className="px-6 py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Add New Account
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
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

              {/* Initial Balance */}
              <View className="space-y-2">
                <Label className="text-base font-medium">
                  Initial Balance <Text className="text-red-500">*</Text>
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
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
