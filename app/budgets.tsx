import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import budgetsData from "../data/budgets.json";
import Nav from "../components/nav";

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

          {/* Summary Cards */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <Text className="text-sm text-gray-600 mb-1">Total Budget</Text>
              <Text className="text-2xl font-bold text-gray-900">
                ${totalBudget.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <Text className="text-sm text-gray-600 mb-1">Spent</Text>
              <Text className="text-2xl font-bold text-red-600">
                ${totalSpent.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <Text className="text-sm text-gray-600 mb-1">Remaining</Text>
              <Text className="text-2xl font-bold text-green-600">
                ${totalRemaining.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Budget Categories */}
          <View className="gap-4">
            {budgets.map((budget) => {
              const status = getBudgetStatus(
                budget.spentAmount,
                budget.budgetAmount
              );
              const progressWidth = getProgressWidth(
                budget.spentAmount,
                budget.budgetAmount
              );

              return (
                <View
                  key={budget.id}
                  className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm"
                >
                  {/* Category Header */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-semibold text-gray-900 text-lg">
                      {budget.category}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        status.status === "over"
                          ? "bg-red-100"
                          : status.status === "warning"
                          ? "bg-orange-100"
                          : "bg-green-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          status.status === "over"
                            ? "text-red-800"
                            : status.status === "warning"
                            ? "text-orange-800"
                            : "text-green-800"
                        }`}
                      >
                        {status.status === "over"
                          ? "Over Budget"
                          : status.status === "warning"
                          ? "Near Limit"
                          : "On Track"}
                      </Text>
                    </View>
                  </View>

                  {/* Amount Display */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-600">
                      ${budget.spentAmount.toLocaleString()} of $
                      {budget.budgetAmount.toLocaleString()}
                    </Text>
                    <Text className="font-medium text-gray-900">
                      ${budget.remainingAmount.toLocaleString()} left
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="h-2 bg-gray-200 rounded-full mb-3">
                    <View
                      className={`h-2 rounded-full ${
                        status.status === "over"
                          ? "bg-red-500"
                          : status.status === "warning"
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </View>

                  {/* Period Info */}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-500">
                      Period: {budget.period}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(budget.startDate).toLocaleDateString()} -{" "}
                      {new Date(budget.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add Budget Button */}
          <TouchableOpacity className="bg-black rounded-lg p-4 mt-6">
            <Text className="text-white font-semibold text-center text-base">
              Add New Budget Category
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
