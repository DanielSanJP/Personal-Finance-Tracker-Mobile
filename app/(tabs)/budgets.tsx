import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import budgetsData from "../../data/budgets.json";
import Nav from "../../components/nav";

export default function Budgets() {
  const { budgets } = budgetsData;

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 100) return { status: "over", color: "red" };
    if (percentage >= 100) return { status: "full", color: "red" };
    if (percentage > 80) return { status: "warning", color: "orange" };
    return { status: "good", color: "gray" };
  };

  const getProgressWidth = (spent: number, budget: number) => {
    const percentage = Math.min((spent / budget) * 100, 100);
    return percentage;
  };

  // Calculate totals
  const totalBudget = budgets.reduce(
    (sum, budget) => sum + budget.budgetAmount,
    0
  );
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.spentAmount,
    0
  );
  const totalRemaining = totalBudget - totalSpent;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">Budgets</Text>
          <Text className="text-gray-600 mb-6">Monthly Budget Overview</Text>

          {/* Over Budget Alert */}
          {budgets.some(
            (budget) => budget.spentAmount > budget.budgetAmount
          ) && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-center">
                <Text className="text-red-800 font-medium">
                  ⚠️ You have categories that are over budget this month.
                </Text>
              </View>
            </View>
          )}

          {/* Budget Items */}
          {budgets.map((budget, index) => {
            const budgetStatus = getBudgetStatus(
              budget.spentAmount,
              budget.budgetAmount
            );
            const progressWidth = getProgressWidth(
              budget.spentAmount,
              budget.budgetAmount
            );
            const overBudget = budget.spentAmount > budget.budgetAmount;

            return (
              <View key={budget.id} className="mb-4">
                <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-base font-medium text-gray-900">
                      {budget.category}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      ${budget.spentAmount.toFixed(2)} / $
                      {budget.budgetAmount.toFixed(2)}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <View
                      className={`h-2 rounded-full ${
                        budgetStatus.status === "over" ||
                        budgetStatus.status === "full"
                          ? "bg-red-500"
                          : budgetStatus.status === "warning"
                          ? "bg-orange-500"
                          : "bg-gray-900"
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </View>

                  {overBudget && (
                    <Text className="text-sm text-red-600 font-medium">
                      Over budget by $
                      {(budget.spentAmount - budget.budgetAmount).toFixed(0)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          {/* Budget Summary */}
          <View className="bg-white rounded-lg p-6 mt-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Budget Summary
            </Text>

            <View className="flex-row justify-between mb-6">
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-600 font-medium mb-1">
                  Total Budget
                </Text>
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-base font-bold text-gray-900">
                    ${totalBudget.toFixed(0)}
                  </Text>
                </View>
              </View>
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-600 font-medium mb-1">
                  Total Spent
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    totalSpent > totalBudget ? "bg-red-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      totalSpent > totalBudget
                        ? "text-red-800"
                        : "text-gray-900"
                    }`}
                  >
                    ${totalSpent.toFixed(0)}
                  </Text>
                </View>
              </View>
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-600 font-medium mb-1">
                  Remaining
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    totalRemaining < 0 ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  <Text
                    className={`text-base font-bold ${
                      totalRemaining < 0 ? "text-red-800" : "text-green-800"
                    }`}
                  >
                    ${totalRemaining.toFixed(0)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Overall Progress Bar */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-gray-900">
                  Overall Budget Progress
                </Text>
                <Text className="text-sm text-gray-600">
                  {((totalSpent / totalBudget) * 100).toFixed(1)}%
                </Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-3">
                <View
                  className={`h-3 rounded-full ${
                    totalSpent > totalBudget
                      ? "bg-red-500"
                      : (totalSpent / totalBudget) * 100 > 80
                      ? "bg-orange-500"
                      : "bg-gray-900"
                  }`}
                  style={{
                    width: `${Math.min(
                      (totalSpent / totalBudget) * 100,
                      100
                    )}%`,
                  }}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity className="bg-blue-500 rounded-lg px-6 py-3 flex-1 mr-2">
                <Text className="text-white font-semibold text-center">
                  Add Budget
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-200 rounded-lg px-6 py-3 flex-1 ml-2">
                <Text className="text-gray-700 font-semibold text-center">
                  Edit Budgets
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
