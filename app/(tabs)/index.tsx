import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCurrentUserAccounts,
  getCurrentUserSummary,
  getCurrentUser,
  formatCurrency,
} from "../../lib/data";
import Nav from "../../components/nav";

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
          <View className="mt-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-1 mr-2">
                <Text className="text-white font-semibold text-center">
                  Add Transaction
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-green-500 rounded-lg p-4 flex-1 ml-2">
                <Text className="text-white font-semibold text-center">
                  Add Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
