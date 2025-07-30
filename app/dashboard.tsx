import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getCurrentUser,
  getCurrentUserAccounts,
  getCurrentUserTransactions,
  getCurrentUserBudgets,
  formatCurrency,
} from "../lib/data";
import Nav from "../components/nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Dashboard() {
  const user = getCurrentUser();
  const accounts = getCurrentUserAccounts();
  const transactions = getCurrentUserTransactions();
  const budgets = getCurrentUserBudgets();

  // Calculate summary data
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );
  const monthlyIncome = transactions
    .filter(
      (t) =>
        t.type === "income" &&
        new Date(t.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date).getMonth() === new Date().getMonth()
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBudget = budgets.reduce(
    (sum, budget) => sum + budget.budgetAmount,
    0
  );
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.spentAmount,
    0
  );

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
            Welcome back, {user.displayName}
          </Text>

          {/* Summary Cards Grid */}
          <View className="gap-4 mb-8">
            {/* Total Balance */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Text className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalBalance)}
                </Text>
                <Text className="text-xs text-green-600 mt-1">
                  +2.5% from last month
                </Text>
              </CardContent>
            </Card>

            {/* Monthly Income */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Monthly Income
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Text className="text-2xl font-bold text-gray-900">
                  {formatCurrency(monthlyIncome)}
                </Text>
                <Text className="text-xs text-green-600 mt-1">
                  +5.2% from last month
                </Text>
              </CardContent>
            </Card>

            {/* Monthly Expenses */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Monthly Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Text className="text-2xl font-bold text-gray-900">
                  {formatCurrency(monthlyExpenses)}
                </Text>
                <Text className="text-xs text-red-600 mt-1">
                  +8.1% from last month
                </Text>
              </CardContent>
            </Card>

            {/* Savings Rate */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Savings Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Text className="text-2xl font-bold text-gray-900">
                  {monthlyIncome > 0
                    ? Math.round(
                        ((monthlyIncome - monthlyExpenses) / monthlyIncome) *
                          100
                      )
                    : 0}
                  %
                </Text>
                <Text className="text-xs text-green-600 mt-1">Target: 20%</Text>
              </CardContent>
            </Card>
          </View>

          {/* Quick Stats */}
          <View className="gap-4">
            {/* Recent Transactions */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <View className="gap-3">
                  {transactions.slice(0, 3).map((transaction, index) => (
                    <View
                      key={index}
                      className="flex-row justify-between items-center"
                    >
                      <View>
                        <Text className="font-medium text-gray-900">
                          {transaction.description}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {transaction.category}
                        </Text>
                      </View>
                      <Text
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <View className="gap-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Total Budget</Text>
                    <Text className="font-semibold text-gray-900">
                      {formatCurrency(totalBudget)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Total Spent</Text>
                    <Text className="font-semibold text-red-600">
                      {formatCurrency(totalSpent)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Remaining</Text>
                    <Text className="font-semibold text-green-600">
                      {formatCurrency(totalBudget - totalSpent)}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
