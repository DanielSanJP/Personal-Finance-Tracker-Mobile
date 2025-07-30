import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUserGoals, formatCurrency } from "../../lib/data";
import Nav from "../../components/nav";

export default function Goals() {
  const goals = getCurrentUserGoals();

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Nav />

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Financial Goals
          </Text>
          <Text className="text-gray-600 mb-6">
            {goals.length} active goals
          </Text>
          {goals.map((goal) => {
            const progressPercentage = getProgressPercentage(
              goal.currentAmount,
              goal.targetAmount
            );
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isOverdue = daysRemaining < 0;

            return (
              <View
                key={goal.id}
                className="bg-white rounded-lg p-6 mb-4 shadow-sm border border-gray-100"
              >
                {/* Goal Header */}
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                      {goal.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                      {goal.category}
                    </Text>
                    <View
                      className={`self-start px-2 py-1 rounded-full ${getPriorityColor(
                        goal.priority
                      )}`}
                    >
                      <Text className="text-xs font-medium capitalize">
                        {goal.priority} Priority
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-medium text-gray-900">
                      Progress
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {formatCurrency(goal.currentAmount)} /{" "}
                      {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>

                  <View className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <View
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </View>

                  <Text className="text-xs text-gray-500">
                    {progressPercentage.toFixed(1)}% complete
                  </Text>
                </View>

                {/* Target Date and Status */}
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm text-gray-600">Target Date</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {formatDate(goal.targetDate)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-gray-600">
                      Days Remaining
                    </Text>
                    <Text
                      className={`text-sm font-medium ${
                        isOverdue
                          ? "text-red-600"
                          : daysRemaining <= 30
                          ? "text-orange-600"
                          : "text-gray-900"
                      }`}
                    >
                      {isOverdue
                        ? `${Math.abs(daysRemaining)} days overdue`
                        : `${daysRemaining} days`}
                    </Text>
                  </View>
                </View>

                {/* Amount Needed */}
                {goal.currentAmount < goal.targetAmount && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <Text className="text-sm text-gray-600">
                      Amount needed to reach goal
                    </Text>
                    <Text className="text-lg font-bold text-blue-600">
                      {formatCurrency(goal.targetAmount - goal.currentAmount)}
                    </Text>
                  </View>
                )}

                {/* Goal Achieved */}
                {goal.currentAmount >= goal.targetAmount && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <View className="bg-green-50 border border-green-200 rounded-lg p-3 flex-row items-center">
                      <Text className="text-green-800 font-medium">
                        🎉 Goal Achieved!
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Add Goal Button */}
          <TouchableOpacity className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 items-center justify-center">
            <Text className="text-4xl text-gray-300 mb-2">+</Text>
            <Text className="text-gray-600 font-medium">Add New Goal</Text>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity className="bg-blue-500 rounded-lg p-4 flex-1 mr-2">
                <Text className="text-white font-semibold text-center">
                  Update Progress
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-green-500 rounded-lg p-4 flex-1 ml-2">
                <Text className="text-white font-semibold text-center">
                  View Reports
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
