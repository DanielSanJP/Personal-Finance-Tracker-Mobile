import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Nav from "../../components/nav";
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
  const accounts = getCurrentUserAccounts();
  const summary = getCurrentUserSummary();
  const user = getCurrentUser();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
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
              <Text className="text-xs text-gray-600 font-medium mb-1">
                Account Balance
              </Text>
              <Text className="text-lg font-bold text-gray-900">
                {formatCurrency(summary.totalBalance)}
              </Text>
            </View>
            <View className="bg-white rounded-lg p-4 flex-1 ml-3 shadow-sm border border-gray-100">
              <Text className="text-xs text-gray-600 font-medium mb-1">
                This Month
              </Text>
              <Text className="text-lg font-bold text-red-600">
                {formatCurrency(summary.monthlyChange)}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-8">
            <View className="bg-white rounded-lg p-4 flex-1 mr-3 shadow-sm border border-gray-100">
              <Text className="text-xs text-gray-600 font-medium mb-1">
                Income (July)
              </Text>
              <Text className="text-lg font-bold text-green-600">
                +{formatCurrency(summary.monthlyIncome)}
              </Text>
            </View>
            <View className="bg-white rounded-lg p-4 flex-1 ml-3 shadow-sm border border-gray-100">
              <Text className="text-xs text-gray-600 font-medium mb-1">
                Budget Remaining
              </Text>
              <Text className="text-lg font-bold text-gray-900">
                {formatCurrency(summary.budgetRemaining)}
              </Text>
            </View>
          </View>

          {/* Spending Chart Placeholder */}
          <View className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Spending
            </Text>
            <View className="h-40 bg-gray-100 rounded-lg items-center justify-center">
              <Text className="text-gray-500">Chart coming soon...</Text>
            </View>
          </View>

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
                  onPress={() => console.log("Add Income pressed")}
                  className="min-w-[110px] p-6"
                >
                  Add Income
                </Button>
                <Button
                  variant="outline"
                  onPress={() => console.log("Add Expense pressed")}
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
