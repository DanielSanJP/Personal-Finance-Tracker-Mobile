import { useFocusEffect, useRouter } from "expo-router";
import React, { useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../../components/nav";
import { SpendingChart } from "../../components/spending-chart";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  formatCurrency,
  getCurrentUser,
  getCurrentUserAccounts,
  getCurrentUserSummary,
} from "../../lib/data";

export default function Dashboard() {
  const router = useRouter();
  const accounts = getCurrentUserAccounts();
  const summary = getCurrentUserSummary();
  const user = getCurrentUser();
  const scrollViewRef = useRef<ScrollView>(null);

  // Get current month name
  const getCurrentMonthName = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[new Date().getMonth()];
  };

  // Scroll to top when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView ref={scrollViewRef} className="flex-1">
        {/* Financial Summary Cards */}
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Dashboard
          </Text>
          <Text className="text-gray-600 mb-6">
            Welcome back, {user.firstName}!
          </Text>

          <View className="flex-row justify-between mb-6">
            <View className="bg-white rounded-lg p-4 flex-1 mr-3 shadow-sm border border-gray-100">
              <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                Account Balance
              </Text>
              <Text className="text-lg font-bold text-gray-900 text-center">
                {formatCurrency(summary.totalBalance)}
              </Text>
            </View>
            <View className="bg-white rounded-lg p-4 flex-1 ml-3 shadow-sm border border-gray-100">
              <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                This Month ({getCurrentMonthName()})
              </Text>
              <Text
                className={`text-lg font-bold text-center ${
                  summary.monthlyChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.monthlyChange >= 0 ? "+" : ""}
                {formatCurrency(summary.monthlyChange)}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-8">
            <View className="bg-white rounded-lg p-4 flex-1 mr-3 shadow-sm border border-gray-100">
              <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                Income ({getCurrentMonthName()})
              </Text>
              <Text className="text-lg font-bold text-green-600 text-center">
                +{formatCurrency(summary.monthlyIncome)}
              </Text>
            </View>
            <View className="bg-white rounded-lg p-4 flex-1 ml-3 shadow-sm border border-gray-100">
              <Text className="text-xs text-gray-600 font-medium mb-1 text-center">
                Budget Remaining ({getCurrentMonthName()})
              </Text>
              <Text className="text-lg font-bold text-gray-900 text-center">
                {formatCurrency(summary.budgetRemaining)}
              </Text>
            </View>
          </View>

          {/* Spending Chart */}
          <SpendingChart />

          {/* Your Accounts */}
          <View className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Your Accounts
            </Text>
            {accounts.map((account, index) => (
              <View
                key={account.id}
                className={`flex-row justify-between items-center py-3 ${
                  index < accounts.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <Text className="text-gray-700">{account.name}</Text>
                <Text className="font-semibold text-gray-900">
                  {formatCurrency(account.balance)}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap gap-4 justify-center">
                <Button
                  variant="outline"
                  onPress={() => router.push("/addincome")}
                  className="min-w-[110px] p-6"
                >
                  Add Income
                </Button>
                <Button
                  variant="outline"
                  onPress={() => router.push("/addtransaction")}
                  className="min-w-[110px] p-6"
                >
                  Add Expense
                </Button>
                <Button
                  variant="outline"
                  onPress={() => console.log("Scan Receipt pressed")}
                  className="min-w-[110px] p-6"
                >
                  Scan Receipt
                </Button>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
